"""Verificador mecânico dos ganchos (grátis): o que dá para medir sem julgamento.

Uso: python ganchos/checar.py [pasta]      (default: ganchos-fe)

Confere, para cada gancho: tamanho do texto (leitura em 8 s), destaques que existem no texto,
quantidade de destaques e primeira linha da legenda (a parte visível antes do "mais").
O julgamento de qualidade (curiosidade, emoção, fidelidade bíblica...) fica em avaliacao.md.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MAX_PRINCIPAL, MAX_COMPLEMENTO, MAX_TOTAL = 22, 8, 28
MAX_PRIMEIRA_LINHA = 125  # caracteres visíveis antes do "mais" no TikTok


def palavras(txt):
    return len(re.findall(r"\S+", txt))


def primeiras_linhas(md):
    """{id: primeira linha de texto da legenda} a partir do legendas.md."""
    out = {}
    for bloco in re.split(r"\n## ", md)[1:]:
        cab, _, resto = bloco.partition("\n")
        num = int(cab.split("·")[0])
        out[num] = next(l for l in resto.splitlines() if l.strip())
    return out


def main():
    pasta = RAIZ / (sys.argv[1] if len(sys.argv) > 1 else "ganchos-fe")
    cfg = json.loads((pasta / "ganchos.json").read_text())
    linhas = primeiras_linhas((pasta / "legendas.md").read_text())
    erros = 0
    for g in cfg["ganchos"]:
        p, c = palavras(g["texto"]), palavras(g.get("complemento", ""))
        tudo = (g["texto"] + " " + g.get("complemento", "")).lower()
        problemas = []
        if p > MAX_PRINCIPAL:
            problemas.append(f"texto com {p} palavras (máx {MAX_PRINCIPAL})")
        if c > MAX_COMPLEMENTO:
            problemas.append(f"complemento com {c} palavras (máx {MAX_COMPLEMENTO})")
        if p + c > MAX_TOTAL:
            problemas.append(f"total {p + c} palavras (máx {MAX_TOTAL})")
        for d in g["destaque"]:
            if d.lower() not in tudo:
                problemas.append(f"destaque ausente no texto: {d!r}")
        if not 1 <= len(g["destaque"]) <= 3:
            problemas.append("use de 1 a 3 destaques")
        pl = linhas.get(g["id"], "")
        if len(pl) > MAX_PRIMEIRA_LINHA:
            problemas.append(f"1ª linha da legenda com {len(pl)} caracteres (máx {MAX_PRIMEIRA_LINHA})")
        estado = "OK " if not problemas else "ERRO"
        erros += bool(problemas)
        print(f"{estado} {g['id']:02d} {g['slug']:<26} {p:>2}+{c} palavras · 1ª linha {len(pl):>3} car." + ("".join(f"\n      - {x}" for x in problemas)))
    sys.exit(1 if erros else 0)


if __name__ == "__main__":
    main()
