"""Busca e baixa animações Lottie gratuitas (LottieFiles, Licença Simples Lottie:
uso comercial liberado, sem atribuição obrigatória; não pode revender o arquivo).

Uso:
  python aprendendo/motor/lottie.py buscar "light bulb idea"          # lista + folha de prévias
  python aprendendo/motor/lottie.py baixar <id> <tema> <nome> [--paleta]

`buscar` grava a folha de prévias em output/_lottie/<busca>.jpg (para escolher olhando)
e guarda os resultados para o `baixar`. `baixar` salva em
aprendendo/videos/<tema>/lottie/<nome>.json e registra a origem em creditos.json.
--paleta troca cada cor da animação pela cor mais próxima da paleta da marca.
"""
import io
import json
import re
import subprocess
import sys
from pathlib import Path

import requests

AQUI = Path(__file__).resolve().parent
CANAL = AQUI.parent
RAIZ = CANAL.parent
CACHE = RAIZ / "output" / "_lottie"
API = "https://graphql.lottiefiles.com/2022-08"
CAMPOS = "id name slug url jsonUrl imageUrl gifUrl frameRate downloads likesCount createdBy { username }"


def buscar(termo, n=12):
    # busca 48 e mostra as mais baixadas (qualidade costuma acompanhar a popularidade)
    q = f'query {{ searchPublicAnimations(query: {json.dumps(termo)}, first: 48) {{ edges {{ node {{ {CAMPOS} }} }} }} }}'
    r = requests.post(API, json={"query": q}, timeout=30)
    r.raise_for_status()
    nos = [e["node"] for e in r.json()["data"]["searchPublicAnimations"]["edges"]]
    nos = sorted(nos, key=lambda no: -(no.get("downloads") or 0) - 5 * (no.get("likesCount") or 0))[:n]
    CACHE.mkdir(parents=True, exist_ok=True)
    banco = json.loads((CACHE / "resultados.json").read_text()) if (CACHE / "resultados.json").exists() else {}
    for no in nos:
        banco[str(no["id"])] = no
    (CACHE / "resultados.json").write_text(json.dumps(banco, ensure_ascii=False, indent=1))
    # folha de prévias numerada (id em cada quadro)
    imgs = []
    for k, no in enumerate(nos):
        arq = CACHE / f"prev_{no['id']}.png"
        if not arq.exists() and no.get("imageUrl"):
            try:
                arq.write_bytes(requests.get(no["imageUrl"], timeout=30).content)
            except requests.RequestException:
                continue
        if arq.exists():
            imgs.append((no, arq))
        print(f"{no['id']:>8}  {no['name'][:48]:<48}  {no.get('downloads') or 0:>7} downloads  @{(no.get('createdBy') or {}).get('username', '?').strip('/')}")
    if imgs:
        nome = re.sub(r"[^a-z0-9]+", "-", termo.lower()).strip("-")
        entradas, filtros = [], []
        for k, (no, arq) in enumerate(imgs):
            entradas += ["-i", str(arq)]
            filtros.append(f"[{k}]scale=240:240:force_original_aspect_ratio=decrease,pad=240:270:(ow-iw)/2:0:white,"
                           f"drawtext=text='{no['id']}':x=8:y=246:fontsize=20:fontcolor=black[v{k}]")
        cols = 4
        lin = (len(imgs) + cols - 1) // cols
        lay = "|".join(f"{(k % cols) * 240}_{(k // cols) * 270}" for k in range(len(imgs)))
        grade = ";".join(filtros) + ";" + "".join(f"[v{k}]" for k in range(len(imgs))) + f"xstack=inputs={len(imgs)}:layout={lay}:fill=white" if len(imgs) > 1 else filtros[0].replace("[v0]", "")
        saida = CACHE / f"{nome}.jpg"
        subprocess.run(["ffmpeg", "-v", "error", "-y", *entradas, "-filter_complex", grade, str(saida)], check=False)
        print("prévias:", saida, f"({cols}x{lin})")
    return nos


def _cores(obj, fn):
    """Aplica fn em todas as cores sólidas (preenchimento/contorno) da animação."""
    if isinstance(obj, dict):
        if obj.get("ty") in ("fl", "st") and isinstance(obj.get("c"), dict):
            c = obj["c"]
            if c.get("a") == 1 and isinstance(c.get("k"), list):
                for kf in c["k"]:
                    for chave in ("s", "e"):
                        if isinstance(kf.get(chave), list) and len(kf[chave]) >= 3:
                            kf[chave][:3] = fn(kf[chave][:3])
            elif isinstance(c.get("k"), list) and len(c["k"]) >= 3 and not isinstance(c["k"][0], dict):
                c["k"][:3] = fn(c["k"][:3])
        for v in obj.values():
            _cores(v, fn)
    elif isinstance(obj, list):
        for v in obj:
            _cores(v, fn)


def _para_paleta(rgb, paleta):
    r, g, b = rgb
    lum = 0.3 * r + 0.59 * g + 0.11 * b
    if max(r, g, b) - min(r, g, b) < 0.08:  # cinzas, branco e preto ficam
        return rgb
    melhor = min(paleta, key=lambda p: (p[0] - r) ** 2 * 2 + (p[1] - g) ** 2 * 4 + (p[2] - b) ** 2 * 3)
    # preserva a luminosidade original (sombras continuam sombras)
    lp = 0.3 * melhor[0] + 0.59 * melhor[1] + 0.11 * melhor[2]
    k = (lum / lp) if lp > 0 else 1
    return [min(1, v * (0.5 + 0.5 * k)) for v in melhor]


def baixar(id_, tema, nome, paleta=False):
    banco = json.loads((CACHE / "resultados.json").read_text())
    no = banco[str(id_)]
    dados = requests.get(no["jsonUrl"], timeout=60).json()
    externas = [a for a in dados.get("assets", []) if a.get("p") and not str(a.get("p", "")).startswith("data:") and a.get("e") != 1]
    if externas:
        sys.exit("esta animação usa imagens externas; escolha outra")
    # tira fundos sólidos (camadas "solid"), para a animação ficar transparente sobre a cena
    dados["layers"] = [l for l in dados.get("layers", []) if l.get("ty") != 1]
    if paleta:
        marca = json.loads((CANAL / "identidade" / "marca.json").read_text())["paleta"]
        cores = [[int(v[i:i + 2], 16) / 255 for i in (1, 3, 5)] for k, v in marca.items() if isinstance(v, str) and v.startswith("#") and k not in ("fundo", "texto", "tinta")]
        _cores(dados, lambda rgb: _para_paleta(rgb, cores))
    pasta = CANAL / "videos" / tema / "lottie"
    pasta.mkdir(parents=True, exist_ok=True)
    (pasta / f"{nome}.json").write_text(json.dumps(dados, separators=(",", ":")))
    cred = json.loads((pasta / "creditos.json").read_text()) if (pasta / "creditos.json").exists() else {}
    cred[nome] = {"id": no["id"], "titulo": no["name"], "autor": (no.get("createdBy") or {}).get("username", "").strip("/"),
                  "url": no.get("url"), "licenca": "Lottie Simple License (lottiefiles.com/page/license)", "recolorido": paleta}
    (pasta / "creditos.json").write_text(json.dumps(cred, ensure_ascii=False, indent=2) + "\n")
    print(f"salvo: {pasta / (nome + '.json')}  ({dados.get('w')}x{dados.get('h')}, {dados.get('op', 0) - dados.get('ip', 0):.0f} quadros a {dados.get('fr')} fps)")


if __name__ == "__main__":
    a = sys.argv[1:]
    if len(a) >= 2 and a[0] == "buscar":
        buscar(" ".join(a[1:]))
    elif len(a) >= 4 and a[0] == "baixar":
        baixar(a[1], a[2], a[3], "--paleta" in a)
    else:
        sys.exit(__doc__)
