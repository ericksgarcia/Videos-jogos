"""Envia um arquivo grande para uma pasta do Google Drive (upload retomável, sem limite prático).

    python aprendendo/motor/enviar_drive.py output/<tema>/<arquivo>.mp4 [--pasta "vídeos tiktok"]

Precisa de 3 variáveis de ambiente (configuradas pelo dono no ambiente; nunca no repositório):
GDRIVE_CLIENT_ID, GDRIVE_CLIENT_SECRET e GDRIVE_REFRESH_TOKEN (escopo .../auth/drive).
O conector do Drive do Claude não serve para vídeo: ele exige o arquivo inteiro dentro da
mensagem. Aqui o envio vai direto do ambiente para a API do Drive, em pedaços de 32 MB.
"""
import argparse
import json
import os
import sys
import urllib.parse
import urllib.request
from pathlib import Path

PEDACO = 32 * 1024 * 1024


def _req(url, dados=None, cab=None, metodo=None):
    r = urllib.request.Request(url, data=dados, headers=cab or {}, method=metodo)
    return urllib.request.urlopen(r, timeout=600)


def token():
    try:
        corpo = urllib.parse.urlencode({"client_id": os.environ["GDRIVE_CLIENT_ID"], "client_secret": os.environ["GDRIVE_CLIENT_SECRET"],
                                        "refresh_token": os.environ["GDRIVE_REFRESH_TOKEN"], "grant_type": "refresh_token"}).encode()
    except KeyError as e:
        raise SystemExit(f"falta a variável de ambiente {e} (ver o cabeçalho deste arquivo)")
    return json.load(_req("https://oauth2.googleapis.com/token", corpo))["access_token"]


def pasta_id(tok, nome):
    q = urllib.parse.quote(f"name = '{nome}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false")
    achou = json.load(_req(f"https://www.googleapis.com/drive/v3/files?q={q}&fields=files(id,name)", cab={"Authorization": f"Bearer {tok}"}))["files"]
    if achou:
        return achou[0]["id"]
    meta = json.dumps({"name": nome, "mimeType": "application/vnd.google-apps.folder"}).encode()
    return json.load(_req("https://www.googleapis.com/drive/v3/files", meta, {"Authorization": f"Bearer {tok}", "Content-Type": "application/json"}))["id"]


def enviar(arq, nome_pasta):
    arq, tok = Path(arq), token()
    pid, tam = pasta_id(tok, nome_pasta), arq.stat().st_size
    meta = json.dumps({"name": arq.name, "parents": [pid]}).encode()
    ini = _req("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,webViewLink", meta,
               {"Authorization": f"Bearer {tok}", "Content-Type": "application/json; charset=UTF-8", "X-Upload-Content-Type": "video/mp4",
                "X-Upload-Content-Length": str(tam)})
    sessao = ini.headers["Location"]
    with open(arq, "rb") as f:
        pos = 0
        while pos < tam:
            bloco = f.read(PEDACO)
            fim = pos + len(bloco) - 1
            try:
                r = _req(sessao, bloco, {"Content-Range": f"bytes {pos}-{fim}/{tam}", "Content-Length": str(len(bloco))}, "PUT")
                res = json.load(r)
                print(f"   enviado 100% → {res.get('webViewLink')}")
                return res
            except urllib.error.HTTPError as e:
                if e.code != 308:  # 308 = pedaço aceito, continue
                    raise
            pos = fim + 1
            print(f"   enviado {pos * 100 // tam}%")


if __name__ == "__main__":
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("arquivo")
    ap.add_argument("--pasta", default="vídeos tiktok")
    a = ap.parse_args()
    enviar(a.arquivo, a.pasta)
