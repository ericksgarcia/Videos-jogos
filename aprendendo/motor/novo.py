"""Cria a pasta de um vídeo novo a partir do modelo.

Uso:
  python aprendendo/motor/novo.py buracos-negros "Como funciona um buraco negro"
  python aprendendo/motor/novo.py --canal luz-da-palavra haja-luz "Haja luz" [--formato versiculo]

Cria <canal>/videos/<tema>/ (padrão: aprendendo/videos/<tema>/) com roteiro.json (estrutura de
cenas do canal) e cenas.js (uma função por cena, para desenhar). Não altera nada da identidade
nem do motor. Um canal pode ter modelos próprios em identidade/marca.json -> "modelos":
{"formato": [[id, tipo, título, dica], ...]} (o primeiro é o padrão).
"""
import argparse
import json
import re
import sys
import unicodedata
from pathlib import Path

CANAL = Path(__file__).resolve().parent.parent   # aprendendo (canal padrão)
RAIZ = CANAL.parent


def _slug(txt):
    txt = unicodedata.normalize("NFKD", txt).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", txt.lower()).strip("-")


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    ap = argparse.ArgumentParser()
    ap.add_argument("tema")
    ap.add_argument("titulo")
    ap.add_argument("--canal", help="pasta do canal na raiz (padrão: aprendendo)")
    ap.add_argument("--formato", help="modelo de cenas do canal (marca.json -> modelos)")
    a = ap.parse_args()
    canal = RAIZ / a.canal if a.canal else CANAL
    if not (canal / "identidade" / "marca.json").exists():
        sys.exit(f"canal sem identidade: {canal / 'identidade' / 'marca.json'}")
    tema, titulo = _slug(a.tema), a.titulo
    pasta = canal / "videos" / tema
    if pasta.exists():
        sys.exit(f"já existe: {pasta}")
    marca = json.loads((canal / "identidade" / "marca.json").read_text())
    modelos = marca.get("modelos")
    if modelos and a.formato and a.formato not in modelos:
        sys.exit(f"formato desconhecido: {a.formato} (há: {', '.join(modelos)})")
    pasta.mkdir(parents=True)
    cenas = [
        ("gancho", "abertura", "", "pergunta + situação do dia a dia; termina com 'Vou te explicar do jeito mais fácil possível.'"),
        ("conceito", "conceito", "O básico", "o conceito central com uma analogia do dia a dia"),
        ("mecanismo", "mecanismo", "Como funciona", "a descoberta / o mecanismo, um passo por vez"),
        ("pratica", "pratica", "Na prática", "como isso aparece no mundo real (variações)"),
        ("voce", "voce", "Na sua vida", "o caminho até a vida da pessoa"),
        ("resumo", "resumo", "Resumindo", "resumo em 3-4 passos + " + marca["cta_fala"]),
    ]
    if modelos:
        cenas = [tuple(x) for x in modelos[a.formato or next(iter(modelos))]]
    roteiro = {
        "slug": _slug(titulo), "titulo": titulo, "gancho": titulo.upper() + "?", "gancho_destaque": "",
        "voz": marca["voz"]["nome"], "sons": marca.get("sons_modelo", {"titulo": ["pop", 0.5], "cta": ["plim", 0.6]}),
        "cenas": [{"id": i, "tipo": t, "titulo": tit if modelos else (tit or titulo), "fala": f"[{dica}]", "batidas": {}} for i, t, tit, dica in cenas],
    }
    if a.canal:
        roteiro = {"canal": a.canal, **roteiro}
        roteiro["cenas"][0]["batidas"] = {}
    else:
        roteiro["cenas"][0]["batidas"] = {"fácil": "titulo"}
    roteiro["cenas"][-1]["batidas"] = {"Segue": "cta"}
    (pasta / "roteiro.json").write_text(json.dumps(roteiro, ensure_ascii=False, indent=2) + "\n")
    js = [f'// Cenas do vídeo "{titulo}".', "// Cada função CENAS.<tipo>(el, c, B) desenha e anima uma cena do roteiro.",
          (f"// Usa a identidade ({canal.name}/identidade) e o motor comum (aprendendo/motor)." if a.canal else
           "// Usa a identidade (aprendendo/identidade) e a biblioteca comum (aprendendo/motor/biblioteca.js)."), ""]
    for i, t, tit, dica in cenas:
        js.append(f"// {i}: {dica}")
        js.append(f"CENAS.{t} = (el, c, B) => {{")
        if (i, t, tit, dica) == cenas[0]:
            js.append('  mostrarGancho(B("titulo", 0.85) - 0.2);')
        js.append('  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuNoite)"/>`;  // ambiente completo em tela cheia')
        if (i, t, tit, dica) == cenas[-1]:
            js.append('  cartaoFinal(el, B("cta", 0.8));')
        js.append("};\n")
    (pasta / "cenas.js").write_text("\n".join(js))
    print("criado:", pasta)


if __name__ == "__main__":
    main()
