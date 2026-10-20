"""Chamadas à API do Replicate (limite da conta: ~6 por minuto com pouco crédito)."""
import os
import sys
import time
from pathlib import Path

import requests

RAIZ = Path(__file__).resolve().parent.parent
API = "https://api.replicate.com/v1"
OFICIAIS = {"black-forest-labs/flux-schnell"}


def _token():
    t = os.environ.get("REPLICATE_API_TOKEN")
    if not t and (RAIZ / ".env").exists():
        for lin in (RAIZ / ".env").read_text().splitlines():
            if lin.startswith("REPLICATE_API_TOKEN="):
                t = lin.split("=", 1)[1].strip()
    if not t:
        sys.exit("falta REPLICATE_API_TOKEN (ambiente ou .env)")
    return t


_ultimo = [0.0]


def _criar(cab, modelo, entrada):
    """Cria a predição respeitando o limite da conta (6/min com pouco crédito)."""
    comunidade = modelo not in OFICIAIS
    for _ in range(10):
        espera = 11 - (time.time() - _ultimo[0])
        if espera > 0:
            time.sleep(espera)
        _ultimo[0] = time.time()
        if comunidade:
            v = requests.get(f"{API}/models/{modelo}", headers=cab, timeout=60).json()["latest_version"]["id"]
            r = requests.post(f"{API}/predictions", headers=cab, json={"version": v, "input": entrada}, timeout=120)
        else:
            r = requests.post(f"{API}/models/{modelo}/predictions", headers=cab, json={"input": entrada}, timeout=120)
        if r.status_code == 429:
            time.sleep(r.json().get("retry_after", 10) + 1)
            continue
        r.raise_for_status()
        return r.json()
    sys.exit("limite de requisições da API")


def _rodar(modelo, entrada):
    cab = {"Authorization": f"Bearer {_token()}", "Prefer": "wait=60"}
    for tentativa in range(3):
        p = _criar(cab, modelo, entrada)
        while p["status"] in ("starting", "processing"):
            time.sleep(1.5)
            p = requests.get(p["urls"]["get"], headers=cab, timeout=60).json()
        if p["status"] == "succeeded":
            return p["output"]
        print(f"{modelo} falhou (tentativa {tentativa + 1}): {p.get('error')}", flush=True)
    sys.exit(f"{modelo} falhou 3 vezes")


def _baixar(url, destino):
    destino.write_bytes(requests.get(url, timeout=120).content)


