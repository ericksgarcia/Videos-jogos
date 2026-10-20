"""Gera ganchos-fe/publicacao.md: o que copiar e conferir na hora de postar cada vídeo.

Uso: python ganchos/publicacao.py [pasta]   (default: ganchos-fe)

Por vídeo: arquivo, capa, legenda pronta (palavra-chave nos primeiros 80 caracteres, 3 a 5 hashtags), comentário fixado
e a janela de horário do teste. O checklist geral vem das regras do TikTok em viralizacao.md.
"""
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

CHECKLIST = """## Antes de postar (vale para todos)

1. **Ligar "Conteúdo gerado por IA"** (as imagens e a voz são sintéticas). Não reduz o alcance; esconder ou falsear é violação.
2. Exportar **sem marca d'água** e sem regravar a tela. Postar o arquivo **original** deste repositório.
3. Escolher a **capa** indicada (quadro com o texto todo aceso). O TikTok deixa escolher um quadro do vídeo.
4. Colar a **legenda** (a palavra-chave já está nos primeiros 80 caracteres) e **não** acrescentar #fyp.
5. Publicar e **fixar o comentário** indicado. Responder os primeiros comentários na primeira hora.
6. Não postar o mesmo arquivo em outra conta. Nada de comprar ou trocar engajamento.
7. Anotar no fim do dia: retenção aos 3 s, % que chegou ao fim, replays, compartilhamentos, salvamentos, comentários.

Calendário de testes de horário (um vídeo por dia; compare as faixas depois de 2 semanas):
dias ímpares às 19h30, dias pares às 7h30; no domingo, 9h. Faixas citadas por guias brasileiros; as estatísticas da sua conta mandam.
"""


def bloco_legenda(md, num):
    for b in re.split(r"\n## ", md)[1:]:
        if int(b.split("·")[0]) == num:
            return b.partition("\n")[2].strip()
    raise KeyError(num)


def main():
    pasta = RAIZ / (sys.argv[1] if len(sys.argv) > 1 else "ganchos-fe")
    cfg = json.loads((pasta / "ganchos.json").read_text())
    md = (pasta / "legendas.md").read_text()
    out = ["# Publicação dos ganchos de fé\n", CHECKLIST]
    for g in cfg["ganchos"]:
        leg = bloco_legenda(md, g["id"])
        pergunta = next((l[2:].strip() for l in leg.splitlines() if l.startswith("💬")), "")
        base = f"{g['id']:02d}-{g['slug']}"
        dia = "domingo 9h30" if g["id"] % 7 == 0 else ("19h30" if g["id"] % 2 else "7h30")
        out.append(f"\n---\n\n## {g['id']:02d} · {g['slug']}\n")
        out.append(f"- Vídeo: `output/{pasta.name}/{base}.mp4`\n- Capa: `output/{pasta.name}/capas/{base}.png`\n"
                   f"- Palavra-chave de busca: **{g['palavra_chave']}**\n- Horário do teste (dia {g['id']}): {dia}\n")
        out.append(f"**Comentário fixado:** {pergunta}\n")
        out.append("**Legenda:**\n\n```\n" + leg + "\n```\n")
    (pasta / "publicacao.md").write_text("\n".join(out))
    print("escrito:", pasta / "publicacao.md")


if __name__ == "__main__":
    main()
