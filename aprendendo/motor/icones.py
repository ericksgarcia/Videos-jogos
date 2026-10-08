"""Ícones Phosphor (MIT, ~1.500 ícones em 6 pesos) para os vídeos.

    python aprendendo/motor/icones.py <tema> warning gauge ruler waves [--peso regular|thin|light|bold|fill|duotone]

Copia os SVG escolhidos para videos/<tema>/icones/<nome>.svg (versionados). O gerar.py embute
todos na página e, no cenas.js, `icone(nome, tamanho, cor)` desenha um deles centrado em 0,0.
Lista completa: https://phosphoricons.com (o pacote é baixado do npm na primeira vez).
"""
import argparse
import shutil
import subprocess
import tarfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
CACHE = RAIZ / "output" / "_phosphor"


def pacote():
    pasta = CACHE / "package" / "assets"
    if not pasta.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        nome = subprocess.run(["npm", "pack", "@phosphor-icons/core", "--silent"], cwd=CACHE, capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1]
        with tarfile.open(CACHE / nome) as t:
            t.extractall(CACHE, filter="data")
    return pasta


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("tema")
    ap.add_argument("nomes", nargs="+")
    ap.add_argument("--peso", default="regular")
    a = ap.parse_args()
    base, destino = pacote() / a.peso, RAIZ / "aprendendo" / "videos" / a.tema / "icones"
    destino.mkdir(parents=True, exist_ok=True)
    for n in a.nomes:
        arq = base / (f"{n}.svg" if a.peso == "regular" else f"{n}-{a.peso}.svg")
        if not arq.exists():
            raise SystemExit(f"ícone não existe: {arq.name} (veja phosphoricons.com)")
        shutil.copy(arq, destino / f"{n}.svg")
        print("ok", destino / f"{n}.svg")
