"""Legenda do post (TikTok/Reels/Shorts) de um vídeo do Luz da Palavra, a partir do roteiro.

Uso: python luz-da-palavra/legenda.py luz-da-palavra/videos/<tema>
Grava output/luz-da-palavra/<tema>/legenda.txt (descrição + hashtags + comentário para fixar) e mostra
o texto. Esse arquivo vai junto com o MP4 e a capa em toda entrega.
"""
import json
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def legenda(pasta):
    pasta = Path(pasta).resolve()
    r = json.loads((pasta / "roteiro.json").read_text(encoding="utf-8"))
    tags = " ".join(r.get("hashtags", []))
    partes = [f"LEGENDA ({r['titulo']}) — TikTok e Reels", "", r["descricao"].strip(), tags, "",
              "No Shorts: a mesma legenda + #shorts", ""]
    if r.get("comentario_fixado"):
        partes += ["COMENTÁRIO PARA FIXAR", "", r["comentario_fixado"].strip(), ""]
    texto = "\n".join(partes)
    saida = RAIZ / "output" / "luz-da-palavra" / pasta.name
    saida.mkdir(parents=True, exist_ok=True)
    (saida / "legenda.txt").write_text(texto, encoding="utf-8")
    return saida / "legenda.txt", texto


if __name__ == "__main__":
    arq, texto = legenda(sys.argv[1])
    print(texto)
    print(f"gravado: {arq}")
