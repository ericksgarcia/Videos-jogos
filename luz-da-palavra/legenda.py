"""Legenda do post (TikTok/Reels/Shorts) de um vídeo do Luz da Palavra, a partir do roteiro.

Uso: python luz-da-palavra/legenda.py luz-da-palavra/videos/<tema>
Mostra o texto (descrição + hashtags + comentário para fixar), que vai escrito no `caption` do mesmo
envio do MP4 e da capa (sem arquivo: pedido do dono).
"""
import json
import sys
from pathlib import Path


def legenda(pasta):
    pasta = Path(pasta).resolve()
    r = json.loads((pasta / "roteiro.json").read_text(encoding="utf-8"))
    tags = " ".join(r.get("hashtags", []))
    partes = [f"LEGENDA ({r['titulo']}) — TikTok e Reels", "", r["descricao"].strip(), tags, "",
              "No Shorts: a mesma legenda + #shorts", ""]
    if r.get("comentario_fixado"):
        partes += ["COMENTÁRIO PARA FIXAR", "", r["comentario_fixado"].strip(), ""]
    return "\n".join(partes)


if __name__ == "__main__":
    print(legenda(sys.argv[1]))
