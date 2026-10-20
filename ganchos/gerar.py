"""Vídeos-gancho de ~8 s: texto na tela + imagem com paralaxe + efeito sutil, em loop.

Uso (da raiz do repositório; "--pasta ganchos-fe" troca o tema, default "ganchos"):
  python ganchos/gerar.py imagens [id ...]   # Replicate: imagem (flux-schnell) + mapa de profundidade
  python ganchos/gerar.py render  [id ...]   # renderiza output/ganchos/<id>-<slug>.mp4
  python ganchos/gerar.py tudo    [id ...]   # imagens + render

Legendas: ganchos/legendas.md. Sem ids, processa todos. A chave fica em REPLICATE_API_TOKEN (ambiente ou .env, ignorado
pelo git). Imagem e profundidade ficam em cache em data/ganchos/ (não versionado).
"""
import json
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image

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
W, H, FPS = (CFG["formato"][k] for k in ("largura", "altura", "fps"))


# ---------- Replicate ----------
from replicate_api import _baixar, _rodar  # noqa: E402


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


# ---------- render ----------
def render(g, com_voz=True):
    """Gancho curto: paralaxe + texto palavra por palavra + narração (Google TTS) + trilha. Duração = fala + ~1 s."""
    import math
    sys.path.insert(0, str(PASTA.parent / "ganchos"))
    import narracao as NA
    import texto as TX
    from paralaxe import Paralaxe

    base = f"{g['id']:02d}-{g['slug']}"
    img_p, prof_p = CACHE / f"{base}.png", CACHE / f"{base}-prof.png"
    if not (img_p.exists() and prof_p.exists()):
        sys.exit(f"faltam imagens de {base}: rode 'imagens' antes")
    SAIDA.mkdir(parents=True, exist_ok=True)
    (SAIDA / "capas").mkdir(exist_ok=True)

    txt = g["texto"] + (" " + g["complemento"] if g.get("complemento") else "")
    palavras, dur_fala, voz_wav = NA.narrar(CACHE / "voz", base, txt)
    dur = max(float(CFG["formato"]["duracao_s"]), math.ceil((dur_fala + 0.9) * FPS) / FPS)
    n = int(round(dur * FPS))
    spr = TX.sprites(g, palavras, W, H)
    par = Paralaxe(img_p, prof_p, W, H, dur, semente=g["id"])
    pad = NA.trilha(CACHE / "voz" / f"{base}-trilha.wav", dur)
    mix = NA.mixar(voz_wav, pad, CACHE / "voz" / f"{base}-mix.wav", dur)
    rng = np.random.default_rng(g["id"])

    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS),
           "-i", "-", "-i", str(mix), "-t", f"{dur:.3f}", "-c:v", "libx264", "-crf", "20", "-preset", "medium",
           "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "128k", "-movflags", "+faststart", str(SAIDA / f"{base}.mp4")]
    ff = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    capa_t = max(0.0, dur - 0.9)  # todas as palavras acesas
    for i in range(n):
        t = i / FPS
        q = par.quadro(t)
        q = TX.desenhar(q, spr, t, fade=float(np.clip((dur - t) / 0.2, 0, 1)))
        q += rng.normal(0, 0.012, (H, W, 1)).astype(np.float32)  # granulação de filme
        frame = (np.clip(q, 0, 1) * 255).astype(np.uint8)
        if i == int(capa_t * FPS):
            Image.fromarray(frame).save(SAIDA / "capas" / f"{base}.png")
        ff.stdin.write(frame.tobytes())
    ff.stdin.close()
    ff.wait()
    print(f"vídeo ok: {SAIDA / (base + '.mp4')}  ({dur:.1f} s, fala {dur_fala:.1f} s)", flush=True)


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
