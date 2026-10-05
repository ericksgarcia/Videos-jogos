"""Camada de ingestão: busca os dados crus do Sofascore e guarda em cache.

É a única parte do projeto que conhece o Sofascore. Para migrar para uma API
licenciada, troque este arquivo (e o normalize.py que lê o formato cru).

Usa os mesmos endpoints da biblioteca sofascrape, mas com `requests` direto:
o sofascrape abre cada URL num Chromium headless, o que é mais lento e não
funciona atrás do proxy deste ambiente. Os endpoints devolvem JSON puro.
"""
import json
import time
from pathlib import Path

import requests

BASE = "https://www.sofascore.com/api/v1"
IMG = "https://api.sofascore.com/api/v1"
BRASILEIRAO = 325  # unique tournament id do Brasileirão Série A
RAW_DIR = Path(__file__).resolve().parent.parent / "data" / "raw"

# Endpoints por jogo que o vídeo usa. "statistics" e "shotmap" não têm método
# no sofascrape, mas existem e dão xG, chances claras e cada finalização.
EVENT_ENDPOINTS = {
    "event": "",
    "incidents": "/incidents",
    "graph": "/graph",
    "statistics": "/statistics",
    "shotmap": "/shotmap",
    "comments": "/comments",
}

_session = requests.Session()
_session.headers["User-Agent"] = (
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/140.0 Safari/537.36"
)


def get(path, base=BASE, tentativas=3):
    """GET com retry simples. Devolve o JSON ou None em 404."""
    for i in range(tentativas):
        r = _session.get(base + path, timeout=30)
        if r.status_code == 404:
            return None
        if r.ok:
            return r.json()
        time.sleep(2 ** i)
    r.raise_for_status()


def season_id(ano, ut_id=BRASILEIRAO):
    for s in get(f"/unique-tournament/{ut_id}/seasons")["seasons"]:
        if s["year"] == str(ano):
            return s["id"]
    raise ValueError(f"Temporada {ano} não encontrada")


def rodada_atual(sid, ut_id=BRASILEIRAO):
    return get(f"/unique-tournament/{ut_id}/season/{sid}/rounds")["currentRound"]["round"]


def jogos_da_rodada(sid, rodada, ut_id=BRASILEIRAO):
    """Jogos encerrados da rodada, na ordem de início."""
    data = get(f"/unique-tournament/{ut_id}/season/{sid}/events/round/{rodada}")
    evs = [e for e in data["events"] if e["status"]["type"] == "finished"]
    return sorted(evs, key=lambda e: e["startTimestamp"])


def baixar_jogo(event_id, forcar=False):
    """Baixa os endpoints do jogo para data/raw/<id>/ e devolve o dict cru."""
    pasta = RAW_DIR / str(event_id)
    pasta.mkdir(parents=True, exist_ok=True)
    raw = {}
    for nome, sufixo in EVENT_ENDPOINTS.items():
        arq = pasta / f"{nome}.json"
        if arq.exists() and not forcar:
            raw[nome] = json.loads(arq.read_text())
            continue
        raw[nome] = get(f"/event/{event_id}{sufixo}")
        arq.write_text(json.dumps(raw[nome], ensure_ascii=False))
    ev = raw["event"]["event"]
    for lado in ("homeTeam", "awayTeam"):
        tid = ev[lado]["id"]
        arq = pasta / f"team_{tid}.png"
        if not arq.exists():
            r = _session.get(f"{IMG}/team/{tid}/image", timeout=30)
            if r.ok:
                arq.write_bytes(r.content)
    return raw


def foto_jogador(event_id, player_id):
    """Foto do jogador (cache em data/raw/<jogo>/player_<id>.png)."""
    if not player_id:
        return None
    arq = RAW_DIR / str(event_id) / f"player_{player_id}.png"
    if not arq.exists():
        r = _session.get(f"{IMG}/player/{player_id}/image", timeout=30)
        if not r.ok or not r.headers.get("content-type", "").startswith("image"):
            return None
        arq.write_bytes(r.content)
    return arq


def escudo(event_id, team_id):
    arq = RAW_DIR / str(event_id) / f"team_{team_id}.png"
    return arq if arq.exists() else None
