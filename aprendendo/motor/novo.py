"""Cria a pasta de um vídeo novo a partir do modelo.

Uso:
  python aprendendo/motor/novo.py buracos-negros "Como funciona um buraco negro"

Cria aprendendo/videos/<tema>/ com roteiro.json (estrutura de cenas do canal)
e cenas.js (uma função por cena, para desenhar). Não altera nada da identidade
nem do motor.
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

CANAL = Path(__file__).resolve().parent.parent


def _slug(txt):
    txt = unicodedata.normalize("NFKD", txt).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", txt.lower()).strip("-")


def main():
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    tema, titulo = _slug(sys.argv[1]), sys.argv[2]
    pasta = CANAL / "videos" / tema
    if pasta.exists():
        sys.exit(f"já existe: {pasta}")
    pasta.mkdir(parents=True)
    marca = json.loads((CANAL / "identidade" / "marca.json").read_text())
    cenas = [
        ("gancho", "abertura", "", "pergunta + situação do dia a dia; termina com 'Vou te explicar do jeito mais fácil possível.'"),
        ("conceito", "conceito", "O básico", "o conceito central com uma analogia do dia a dia"),
        ("mecanismo", "mecanismo", "Como funciona", "a descoberta / o mecanismo, um passo por vez"),
        ("pratica", "pratica", "Na prática", "como isso aparece no mundo real (variações)"),
        ("voce", "voce", "Na sua vida", "o caminho até a vida da pessoa"),
        ("resumo", "resumo", "Resumindo", "resumo em 3-4 passos + " + marca["cta_fala"]),
    ]
    roteiro = {
        "slug": _slug(titulo), "titulo": titulo, "gancho": titulo.upper() + "?", "gancho_destaque": "",
        "voz": marca["voz"]["nome"], "sons": {"titulo": ["pop", 0.5], "cta": ["plim", 0.6]},
        "cenas": [{"id": i, "tipo": t, "titulo": tit or titulo, "fala": f"[{dica}]", "batidas": {}} for i, t, tit, dica in cenas],
    }
    roteiro["cenas"][0]["batidas"] = {"fácil": "titulo"}
    roteiro["cenas"][-1]["batidas"] = {"Segue": "cta"}
    (pasta / "roteiro.json").write_text(json.dumps(roteiro, ensure_ascii=False, indent=2) + "\n")
    js = [f'// Cenas do vídeo "{titulo}".', "// Cada função CENAS.<tipo>(el, c, B) desenha e anima uma cena do roteiro.",
          "// Usa a identidade (aprendendo/identidade) e a biblioteca comum (aprendendo/motor/biblioteca.js).", ""]
    for i, t, tit, dica in cenas:
        js.append(f"// {i}: {dica}")
        js.append(f"CENAS.{t} = (el, c, B) => {{")
        if i == "gancho":
            js.append('  mostrarGancho(B("titulo", 0.85) - 0.2);')
        js.append('  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuNoite)"/>`;  // ambiente completo em tela cheia')
        if i == "resumo":
            js.append('  cartaoFinal(el, B("cta", 0.8));')
        js.append("};\n")
    (pasta / "cenas.js").write_text("\n".join(js))
    print("criado:", pasta)


if __name__ == "__main__":
    main()
