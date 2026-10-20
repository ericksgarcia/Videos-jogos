"""Verificador mecânico dos ganchos (grátis): o que dá para medir sem julgamento.

Uso: python ganchos/checar.py [pasta]      (default: ganchos-fe)

Confere, para cada gancho: tamanho do texto (leitura em 8 s), destaques que existem no texto, quantidade de destaques,
primeira linha da legenda (parte visível antes do "mais"), 3 a 5 hashtags sem #fyp, a palavra-chave de busca
(na fala/tela e nos 80 primeiros caracteres da legenda) e tema repetido dentro da janela do histórico (historico.py).
O julgamento de qualidade (curiosidade, emoção, fidelidade bíblica...) fica em avaliacao.md.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import historico as HI  # noqa: E402

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


def hashtags(md):
    """{id: [hashtags]} (a última linha que começa com #fe de cada bloco)."""
    out = {}
    for bloco in re.split(r"\n## ", md)[1:]:
        cab, _, resto = bloco.partition("\n")
        linhas = [l for l in resto.splitlines() if l.startswith("#fe")]
        out[int(cab.split("·")[0])] = re.findall(r"#\w+", linhas[-1]) if linhas else []
    return out


def sem_acento(txt):
    import unicodedata
    return "".join(c for c in unicodedata.normalize("NFD", txt.lower()) if unicodedata.category(c) != "Mn")


def main():
    pasta = RAIZ / (sys.argv[1] if len(sys.argv) > 1 else "ganchos-fe")
    cfg = json.loads((pasta / "ganchos.json").read_text())
    md = (pasta / "legendas.md").read_text()
    linhas, tags = primeiras_linhas(md), hashtags(md)
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
        ht = tags.get(g["id"], [])
        if not 3 <= len(ht) <= 5 or "#fyp" in ht:
            problemas.append(f"hashtags: {len(ht)} (use de 3 a 5, sem #fyp)")
        kw = g.get("palavra_chave")
        if kw and sem_acento(kw) not in sem_acento(tudo):
            problemas.append(f"palavra-chave {kw!r} não está no texto da tela/fala")
        if kw and sem_acento(kw) not in sem_acento(pl[:80]):
            problemas.append(f"palavra-chave {kw!r} fora dos 80 primeiros caracteres da legenda")
        for e in HI.conflitos(g.get("referencia", ""), g["slug"], ignorar=(pasta.name, g["id"])):
            problemas.append(f"tema repetido: {e['pasta']}/{e['id']:02d} ({e['referencia']}) só fica livre em {HI.livre_em(e, HI.carregar()['janela_dias'])}")
        if len(pl) > MAX_PRIMEIRA_LINHA:
            problemas.append(f"1ª linha da legenda com {len(pl)} caracteres (máx {MAX_PRIMEIRA_LINHA})")
        estado = "OK " if not problemas else "ERRO"
        erros += bool(problemas)
        print(f"{estado} {g['id']:02d} {g['slug']:<26} {p:>2}+{c} palavras · 1ª linha {len(pl):>3} car." + ("".join(f"\n      - {x}" for x in problemas)))
    sys.exit(1 if erros else 0)


if __name__ == "__main__":
    main()
