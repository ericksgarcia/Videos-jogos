"""Vídeos-gancho de ~8 s: texto na tela + imagem com paralaxe + efeito sutil, em loop.

Uso (da raiz do repositório; "--pasta ganchos-fe" troca o tema, default "ganchos"):
  python ganchos/gerar.py imagens [id ...]   # Replicate: imagem (flux-schnell) + mapa de profundidade
  python ganchos/gerar.py render  [id ...]   # renderiza output/ganchos/<id>-<slug>.mp4
  python ganchos/gerar.py tudo    [id ...]   # imagens + render

Legendas: ganchos/legendas.md. Sem ids, processa todos. A chave fica em REPLICATE_API_TOKEN (ambiente ou .env, ignorado
pelo git). Imagem e profundidade ficam em cache em data/ganchos/ (não versionado).
"""
import json
import os
import subprocess
import sys
import time
from pathlib import Path

import cv2
import numpy as np
import requests
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
_ARGS = sys.argv[1:]
_NOME = "ganchos"  # pasta do tema; "--pasta ganchos-fe" usa outro conjunto de ganchos
if "--pasta" in _ARGS:
    _i = _ARGS.index("--pasta")
    _NOME = _ARGS[_i + 1]
    sys.argv[1 + _i:3 + _i] = []
PASTA = RAIZ / _NOME
CACHE = RAIZ / "data" / _NOME
SAIDA = RAIZ / "output" / _NOME
CFG = json.loads((PASTA / "ganchos.json").read_text())
W, H, FPS, DUR = (CFG["formato"][k] for k in ("largura", "altura", "fps", "duracao_s"))
N = FPS * DUR
AMARELO, BRANCO, CIANO = (255, 210, 63), (248, 249, 255), (143, 227, 255)
API = "https://api.replicate.com/v1"
OFICIAIS = {"black-forest-labs/flux-schnell"}


# ---------- Replicate ----------
def _token():
    t = os.environ.get("REPLICATE_API_TOKEN")
    if not t and (RAIZ / ".env").exists():
        for lin in (RAIZ / ".env").read_text().splitlines():
            if lin.startswith("REPLICATE_API_TOKEN="):
                t = lin.split("=", 1)[1].strip()
    if not t:
        sys.exit("falta REPLICATE_API_TOKEN (ambiente ou .env)")
    return t


_ultimo = [0.0]


def _criar(cab, modelo, entrada):
    """Cria a predição respeitando o limite da conta (6/min com pouco crédito)."""
    comunidade = modelo not in OFICIAIS
    for _ in range(10):
        espera = 11 - (time.time() - _ultimo[0])
        if espera > 0:
            time.sleep(espera)
        _ultimo[0] = time.time()
        if comunidade:
            v = requests.get(f"{API}/models/{modelo}", headers=cab, timeout=60).json()["latest_version"]["id"]
            r = requests.post(f"{API}/predictions", headers=cab, json={"version": v, "input": entrada}, timeout=120)
        else:
            r = requests.post(f"{API}/models/{modelo}/predictions", headers=cab, json={"input": entrada}, timeout=120)
        if r.status_code == 429:
            time.sleep(r.json().get("retry_after", 10) + 1)
            continue
        r.raise_for_status()
        return r.json()
    sys.exit("limite de requisições da API")


def _rodar(modelo, entrada):
    cab = {"Authorization": f"Bearer {_token()}", "Prefer": "wait=60"}
    for tentativa in range(3):
        p = _criar(cab, modelo, entrada)
        while p["status"] in ("starting", "processing"):
            time.sleep(1.5)
            p = requests.get(p["urls"]["get"], headers=cab, timeout=60).json()
        if p["status"] == "succeeded":
            return p["output"]
        print(f"{modelo} falhou (tentativa {tentativa + 1}): {p.get('error')}", flush=True)
    sys.exit(f"{modelo} falhou 3 vezes")


def _baixar(url, destino):
    destino.write_bytes(requests.get(url, timeout=120).content)


def prompt_json(g):
    """Prompt JSON completo: cena específica + estilo comum do canal."""
    return json.dumps({**g["cena"], **CFG["cena_base"]}, ensure_ascii=False, indent=1)


def imagens(g):
    CACHE.mkdir(parents=True, exist_ok=True)
    base = f"{g['id']:02d}-{g['slug']}"
    img, prof = CACHE / f"{base}.png", CACHE / f"{base}-prof.png"
    (CACHE / f"{base}.prompt.json").write_text(prompt_json(g))
    if not img.exists():
        out = _rodar(CFG["modelos"]["imagem"], {
            "prompt": prompt_json(g), "aspect_ratio": "9:16", "num_outputs": 1,
            "output_format": "png", "num_inference_steps": 4, "seed": 1000 + g["id"]})
        _baixar(out[0] if isinstance(out, list) else out, img)
    if not prof.exists():
        out = _rodar(CFG["modelos"]["profundidade"], {
            "image": "data:image/png;base64," + __import__("base64").b64encode(img.read_bytes()).decode(),
            "model_size": "Large"})
        url = out if isinstance(out, str) else (out.get("grey_depth") or out.get("color_depth") or list(out.values())[0])
        _baixar(url, prof)
    print("imagem ok:", base)


# ---------- texto ----------
def _fonte(peso, tam):
    ttf = SAIDA / "_fontes" / f"nunito-{peso}.ttf"
    if not ttf.exists():
        from fontTools.ttLib import TTFont
        ttf.parent.mkdir(parents=True, exist_ok=True)
        f = TTFont(RAIZ / "aprendendo/identidade/fontes" / f"nunito-{peso}.woff2")
        f.flavor = None
        f.save(ttf)
    return ImageFont.truetype(str(ttf), tam)


def _quebrar(draw, palavras, fonte, largura):
    """Quebra em linhas e evita "viúva": uma palavra sozinha na última linha."""
    linhas, atual = [], []
    for p in palavras:
        teste = " ".join(w for w, _ in atual + [p])
        if atual and draw.textlength(teste, font=fonte) > largura:
            linhas.append(atual)
            atual = []
        atual.append(p)
    linhas.append(atual)
    if len(linhas) >= 2 and len(linhas[-1]) == 1 and len(linhas[-2]) >= 3:
        puxada = linhas[-2][-1]
        if draw.textlength(" ".join(w for w, _ in [puxada] + linhas[-1]), font=fonte) <= largura:
            linhas[-1].insert(0, linhas[-2].pop())
    return linhas


def camada_texto(g):
    """Duas camadas RGBA 1080x1920 (texto principal, complemento), centralizadas juntas, com destaque amarelo e sombra.
    Separadas para o complemento poder entrar depois do texto principal."""
    camadas = [Image.new("RGBA", (W, H), (0, 0, 0, 0)) for _ in range(2)]
    d = ImageDraw.Draw(camadas[0])
    margem = 90
    larg = W - 2 * margem
    tam = 86 if len(g["texto"]) < 130 else 76
    fonte, fonte2 = _fonte(900, tam), _fonte(800, int(tam * 0.78))

    def colorir(txt, destaque, base):
        marcado = [False] * len(txt)
        baixo = txt.lower()
        for e in destaque:
            i = baixo.find(e.lower())
            while i >= 0:
                for k in range(i, i + len(e)):
                    marcado[k] = True
                i = baixo.find(e.lower(), i + 1)
        palavras, pos = [], 0
        for w in txt.split(" "):
            palavras.append((w, AMARELO if any(marcado[pos:pos + len(w)]) else base))
            pos += len(w) + 1
        return palavras

    blocos = [(_quebrar(d, colorir(g["texto"], g["destaque"], BRANCO), fonte, larg), fonte, 1.22)]
    if g.get("complemento"):
        blocos.append((_quebrar(d, colorir(g["complemento"], g["destaque"], CIANO), fonte2, larg), fonte2, 1.25))
    alturas = [len(l) * int(f.size * e) for l, f, e in blocos]
    total = sum(alturas) + (int(tam * 0.7) if len(blocos) > 1 else 0)
    y = int(H * 0.5 - total / 2) + 30
    for (linhas, f, esp), alt, camada in zip(blocos, alturas, camadas):
        d = ImageDraw.Draw(camada)
        for lin in linhas:
            larg_lin = sum(d.textlength(w + " ", font=f) for w, _ in lin) - d.textlength(" ", font=f)
            x = (W - larg_lin) / 2
            for w, cor in lin:
                for dx, dy, a in ((0, 6, 150), (0, 0, 0)):  # sombra suave + contorno
                    if a:
                        d.text((x + dx, y + dy), w, font=f, fill=(0, 0, 0, a), stroke_width=6, stroke_fill=(0, 0, 0, a))
                d.text((x, y), w, font=f, fill=cor + (255,), stroke_width=0)
                x += d.textlength(w + " ", font=f)
            y += int(f.size * esp)
        y += int(tam * 0.7)
    return [np.asarray(c).astype(np.float32) / 255.0 for c in camadas]


# ---------- render ----------
def render(g):
    base = f"{g['id']:02d}-{g['slug']}"
    img_p, prof_p = CACHE / f"{base}.png", CACHE / f"{base}-prof.png"
    if not (img_p.exists() and prof_p.exists()):
        sys.exit(f"faltam imagens de {base}: rode 'imagens' antes")
    SAIDA.mkdir(parents=True, exist_ok=True)

    # imagem com folga para o movimento de câmera
    folga = 1.12
    fw, fh = int(W * folga), int(H * folga)
    foto = cv2.resize(cv2.cvtColor(cv2.imread(str(img_p)), cv2.COLOR_BGR2RGB), (fw, fh), interpolation=cv2.INTER_LANCZOS4)
    prof = cv2.imread(str(prof_p), cv2.IMREAD_GRAYSCALE).astype(np.float32)
    prof = cv2.GaussianBlur(cv2.resize(prof, (fw, fh), interpolation=cv2.INTER_CUBIC), (0, 0), 6)
    prof = (prof - prof.min()) / max(prof.max() - prof.min(), 1e-6) - 0.5  # -0.5 (longe) … +0.5 (perto)
    gx, gy = np.meshgrid(np.arange(W, dtype=np.float32), np.arange(H, dtype=np.float32))
    ox, oy = (fw - W) / 2, (fh - H) / 2
    prof = np.ascontiguousarray(prof[int(oy):int(oy) + H, int(ox):int(ox) + W])

    # escurece o centro (onde fica o texto) e as bordas
    yy = (np.arange(H, dtype=np.float32) / H)[:, None]
    xx = (np.arange(W, dtype=np.float32) / W)[None, :]
    faixa = 0.08 + 0.34 * np.exp(-(((yy - 0.5) / 0.26) ** 2))
    vinheta = 1 - 0.55 * (((xx - 0.5) * 1.5) ** 2 + ((yy - 0.5) * 1.1) ** 2)
    escuro = np.clip(1 - faixa, 0, 1) * np.clip(vinheta, 0.35, 1)
    escuro = escuro[..., None]

    texto = camada_texto(g)
    rng = np.random.default_rng(g["id"])
    # poeira de luz: loop perfeito (cada partícula dá um número inteiro de voltas em 8 s)
    n_p = 70
    px, py = rng.uniform(0, W, n_p), rng.uniform(0, H, n_p)
    pz = rng.uniform(0.2, 1.0, n_p)
    pr = (3 + 9 * pz).astype(int)
    pvel = rng.integers(1, 3, n_p)
    pf = rng.uniform(0, 2 * np.pi, n_p)

    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=stereo", "-t", str(DUR), "-c:v", "libx264", "-crf", "20",
           "-preset", "medium", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "64k", "-shortest", "-movflags", "+faststart",
           str(SAIDA / f"{base}.mp4")]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(N):
        ph = 2 * np.pi * i / N  # fase do loop
        # câmera: órbita suave + respiração de zoom (tudo periódico => emenda invisível)
        camx, camy = 26 * np.sin(ph), 16 * np.cos(ph)
        zoom = 1 + 0.025 * (1 - np.cos(ph)) / 2
        sx = (gx - W / 2) / zoom + W / 2
        sy = (gy - H / 2) / zoom + H / 2
        mapx = (sx + ox - camx * prof * 2.0).astype(np.float32)
        mapy = (sy + oy - camy * prof * 2.0).astype(np.float32)
        quadro = cv2.remap(foto, mapx, mapy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT).astype(np.float32) / 255.0
        # luz respirando
        quadro *= 1 + 0.05 * np.sin(ph + 1.0)
        quadro *= escuro
        # poeira de luz com paralaxe
        luz = np.zeros((H, W, 3), np.float32)
        for k in range(n_p):
            y = (py[k] - pvel[k] * H * i / N) % H
            x = (px[k] + 40 * pz[k] * np.sin(ph * pvel[k] + pf[k]) - camx * (pz[k] - 0.4) * 2) % W
            br = 0.5 + 0.5 * np.sin(ph * 2 * pvel[k] + pf[k])
            cv2.circle(luz, (int(x), int(y)), int(pr[k]), (1.0 * br, 0.86 * br, 0.5 * br), -1, cv2.LINE_AA)
        luz = cv2.GaussianBlur(luz, (0, 0), 4)
        quadro += luz * 0.55
        # texto principal entra em 0,2–0,7 s; o complemento entra em 3,4–3,9 s (2ª camada de leitura);
        # os dois saem nos últimos 0,3 s (o loop reentra com o fade)
        t = i / FPS
        saida = np.clip((DUR - t) / 0.3, 0, 1)
        for camada, ini in zip(texto, (0.2, 3.4)):
            ent = np.clip((t - ini) / 0.5, 0, 1)
            a = ent * ent * (3 - 2 * ent) * saida
            if a <= 0:
                continue
            dy = int(18 * (1 - ent))
            cam = np.roll(camada, dy, axis=0) if dy else camada
            al = cam[..., 3:4] * a
            quadro = quadro * (1 - al) + cam[..., :3] * al
        # granulação de filme
        quadro += rng.normal(0, 0.012, (H, W, 1)).astype(np.float32)
        ff.stdin.write((np.clip(quadro, 0, 1) * 255).astype(np.uint8).tobytes())
    ff.stdin.close()
    ff.wait()
    print("vídeo ok:", SAIDA / f"{base}.mp4")


def main():
    if len(sys.argv) < 2 or sys.argv[1] not in ("imagens", "render", "tudo"):
        sys.exit(__doc__)
    cmd, ids = sys.argv[1], {int(a) for a in sys.argv[2:]}
    for g in CFG["ganchos"]:
        if ids and g["id"] not in ids:
            continue
        if cmd in ("imagens", "tudo"):
            imagens(g)
        if cmd in ("render", "tudo"):
            render(g)


if __name__ == "__main__":
    main()
