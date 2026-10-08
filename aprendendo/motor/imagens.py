"""Gerador de imagens (Replicate, FLUX.2 [klein] 4B — ~US$ 0,002 por imagem 9:16).

    python aprendendo/motor/imagens.py <tema> <nome> "descrição da cena" [--seed 7] [--formato 9:16] [--mp 2]
    python aprendendo/motor/imagens.py <tema> --lista      # gera todas as de videos/<tema>/imagens.json

Salva em videos/<tema>/imagens/<nome>.jpg (versionado: o render fica sempre igual) e registra
o pedido em imagens/creditos.json. Se a imagem já existe, não gera de novo (use --refazer).
O ESTILO do canal é somado a toda descrição (ESTILO abaixo): moderno e clean, sem neon.
A chave fica em REPLICATE_API_TOKEN (variável de ambiente ou .env na raiz, que não vai para o git).
"""
import argparse
import json
import os
import time
import urllib.error
import urllib.request
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
VIDEOS = RAIZ / "aprendendo" / "videos"
MODELO = "black-forest-labs/flux-2-klein-4b"
ESTILO = ("clean modern editorial 3D render, soft natural daylight, minimal composition with generous empty space, "
          "smooth matte materials, subtle soft shadows, calm muted palette of deep navy, soft blues, warm sand and white, "
          "high detail, photographic depth of field, no text, no letters, no logos, no watermark, no people")


def _chave():
    k = os.environ.get("REPLICATE_API_TOKEN")
    env = RAIZ / ".env"
    if not k and env.exists():
        for linha in env.read_text().splitlines():
            if linha.startswith("REPLICATE_API_TOKEN="):
                k = linha.split("=", 1)[1].strip()
    if not k:
        raise SystemExit("falta REPLICATE_API_TOKEN (variável de ambiente ou .env)")
    return k


def gerar(tema, nome, descricao, seed=7, formato="9:16", mp="2", refazer=False, estilo=True):
    pasta = VIDEOS / tema / "imagens"
    pasta.mkdir(parents=True, exist_ok=True)
    arq = pasta / f"{nome}.jpg"
    if arq.exists() and not refazer:
        return arq
    prompt = f"{descricao}. {ESTILO}" if estilo else descricao
    corpo = json.dumps({"input": {"prompt": prompt, "aspect_ratio": formato, "output_megapixels": mp, "seed": seed,
                                  "output_format": "jpg", "output_quality": 95}}).encode()
    cab = {"Authorization": f"Bearer {_chave()}", "Content-Type": "application/json", "Prefer": "wait=60"}
    for tentativa in range(8):  # contas com pouco crédito têm limite de pedidos por minuto (429): espera e tenta de novo
        try:
            r = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.replicate.com/v1/models/{MODELO}/predictions", corpo, cab), timeout=120))
            break
        except urllib.error.HTTPError as e:
            if e.code != 429 or tentativa == 7:
                raise
            time.sleep(12 * (tentativa + 1))
    while r.get("status") not in ("succeeded", "failed", "canceled"):
        time.sleep(1.5)
        r = json.load(urllib.request.urlopen(urllib.request.Request(r["urls"]["get"], headers=cab), timeout=60))
    if r["status"] != "succeeded":
        raise SystemExit(f"falhou: {r.get('error')}")
    url = r["output"][0] if isinstance(r["output"], list) else r["output"]
    arq.write_bytes(urllib.request.urlopen(url, timeout=120).read())
    cred = pasta / "creditos.json"
    reg = json.loads(cred.read_text()) if cred.exists() else {}
    reg[nome] = {"modelo": MODELO, "descricao": descricao, "seed": seed, "formato": formato, "mp": mp}
    cred.write_text(json.dumps(reg, ensure_ascii=False, indent=1))
    return arq


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("tema")
    ap.add_argument("nome", nargs="?")
    ap.add_argument("descricao", nargs="?")
    ap.add_argument("--seed", type=int, default=7)
    ap.add_argument("--formato", default="9:16")
    ap.add_argument("--mp", default="2")
    ap.add_argument("--lista", action="store_true")
    ap.add_argument("--refazer", action="store_true")
    a = ap.parse_args()
    if a.lista:
        for it in json.loads((VIDEOS / a.tema / "imagens.json").read_text()):
            print(gerar(a.tema, it["nome"], it["descricao"], it.get("seed", 7), it.get("formato", "9:16"), it.get("mp", "2"), a.refazer))
    else:
        print(gerar(a.tema, a.nome, a.descricao, a.seed, a.formato, a.mp, a.refazer))
