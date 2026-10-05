"""Gera os vídeos "como foi o jogo".

Exemplos:
  python jogo.py --rodada 28                  # todos os jogos encerrados da rodada 28
  python jogo.py --rodada atual               # rodada atual
  python jogo.py --evento 15235484            # um jogo pelo id do Sofascore
  python jogo.py --evento 15235484 --so-json  # só gera o JSON normalizado
"""
import argparse
import json
import sys
import unicodedata
from datetime import date
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent / "src"))
import audio  # noqa: E402
import build  # noqa: E402
import ingest  # noqa: E402
import normalize  # noqa: E402

SAIDA = Path(__file__).resolve().parent / "output"


def slug(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return "".join(c if c.isalnum() else "-" for c in s.lower()).strip("-")


def gerar(event_id, proximo=None, so_json=False, qualidade="high", forcar=False, som=True):
    raw = ingest.baixar_jogo(event_id, forcar=forcar)
    dados = normalize.normalizar(raw)
    j = dados["jogo"]
    nome = f"r{j['rodada']:02d}-{slug(j['casa']['nome'])}-{j['placar'][0]}x{j['placar'][1]}-{slug(j['fora']['nome'])}"
    SAIDA.mkdir(exist_ok=True)
    (SAIDA / f"{nome}.json").write_text(json.dumps(dados, ensure_ascii=False, indent=2))
    print(f"\n== {j['casa']['nome']} {j['placar'][0]}x{j['placar'][1]} {j['fora']['nome']} "
          f"| formato {dados['formato']} | gancho: {dados['gancho']['titulo']} | {len(dados['destaques'])} destaques")
    if dados["formato"] == "so_resumo":
        print("   0x0 sem destaques: fica só para o resumo da rodada, sem vídeo próprio.")
        return None
    if so_json:
        return None
    escudos = {lado: ingest.escudo(event_id, j[lado]["id"]) for lado in ("casa", "fora")}
    pasta = SAIDA / "build" / nome
    ag = build.montar(dados, escudos, pasta, proximo=proximo)
    mp4 = SAIDA / f"{nome}.mp4"
    print(f"   duração {ag['total']:.1f}s → renderizando {mp4.name}")
    if not som:
        build.renderizar(pasta, mp4, qualidade=qualidade)
        return mp4
    mudo = pasta / "video_mudo.mp4"
    build.renderizar(pasta, mudo, qualidade=qualidade)
    wav = audio.mixar(dados, ag, pasta / "trilha.wav")
    audio.juntar(mudo, wav, mp4)
    return mp4


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--rodada", help="número da rodada ou 'atual'")
    ap.add_argument("--evento", type=int, nargs="*", help="ids de jogos do Sofascore")
    ap.add_argument("--ano", type=int, default=date.today().year)
    ap.add_argument("--so-json", action="store_true", help="não renderiza, só salva o JSON")
    ap.add_argument("--qualidade", default="high", choices=["draft", "standard", "high"])
    ap.add_argument("--atualizar", action="store_true", help="ignora o cache e baixa de novo")
    ap.add_argument("--sem-som", action="store_true", help="não gera a trilha de efeitos")
    a = ap.parse_args()

    if a.evento:
        for eid in a.evento:
            gerar(eid, so_json=a.so_json, qualidade=a.qualidade, forcar=a.atualizar, som=not a.sem_som)
        return
    if not a.rodada:
        ap.error("informe --rodada ou --evento")
    sid = ingest.season_id(a.ano)
    rodada = ingest.rodada_atual(sid) if a.rodada == "atual" else int(a.rodada)
    jogos = ingest.jogos_da_rodada(sid, rodada)
    print(f"Rodada {rodada}: {len(jogos)} jogos encerrados")
    for i, e in enumerate(jogos):
        prox = jogos[i + 1] if i + 1 < len(jogos) else None
        prox_txt = f"{prox['homeTeam']['shortName']} x {prox['awayTeam']['shortName']}" if prox else None
        gerar(e["id"], proximo=prox_txt, so_json=a.so_json, qualidade=a.qualidade, forcar=a.atualizar, som=not a.sem_som)


if __name__ == "__main__":
    main()
