"""Manda um vídeo pronto para o Buffer (TikTok, Instagram Reels e YouTube Shorts).

Uso:
  python aprendendo/motor/publicar.py canais                         # lista os canais do Buffer
  python aprendendo/motor/publicar.py aprendendo/videos/gps          # sobe o MP4 e cria RASCUNHOS
  python aprendendo/motor/publicar.py aprendendo/videos/gps --fila   # entra na fila de horários
  python aprendendo/motor/publicar.py aprendendo/videos/gps --url https://.../video.mp4

O Buffer não recebe arquivo: precisa de um link público e direto do MP4. O script sobe o vídeo
no Cloudinary (conta grátis, "upload preset" sem assinatura) e usa o link https://res.cloudinary.com/...
Variáveis/credenciais do ambiente:
  - Buffer: segredo de rede para api.buffer.com (Authorization: Bearer <chave>) ou BUFFER_API_KEY;
  - Cloudinary: CLOUDINARY_CLOUD_NAME e CLOUDINARY_UPLOAD_PRESET (preset "unsigned").
Texto do post = "descricao" + "hashtags" do roteiro.json. Por padrão cria RASCUNHOS (saveToDraft):
o dono revisa no Buffer antes de publicar.
"""
import json
import os
import sys
import urllib.parse
import urllib.request
import uuid
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
API = "https://api.buffer.com"


def gql(query, variables=None):
    h = {"Content-Type": "application/json"}
    if os.environ.get("BUFFER_API_KEY"):
        h["Authorization"] = "Bearer " + os.environ["BUFFER_API_KEY"]
    req = urllib.request.Request(API, data=json.dumps({"query": query, "variables": variables or {}}).encode(), headers=h)
    r = json.load(urllib.request.urlopen(req, timeout=60))
    if r.get("errors"):
        raise SystemExit("Buffer: " + "; ".join(e.get("message", "?") for e in r["errors"]))
    return r["data"]


def canais():
    orgs = gql("query { account { organizations { id name } } }")["account"]["organizations"]
    out = []
    for o in orgs:
        for c in gql("query($o: OrganizationId!) { channels(input: {organizationId: $o}) { id name service } }", {"o": o["id"]})["channels"]:
            out.append(dict(c, org=o["name"]))
    return out


def subir_cloudinary(mp4):
    nuvem, preset = os.environ.get("CLOUDINARY_CLOUD_NAME"), os.environ.get("CLOUDINARY_UPLOAD_PRESET")
    if not (nuvem and preset):
        raise SystemExit("falta CLOUDINARY_CLOUD_NAME / CLOUDINARY_UPLOAD_PRESET (ou passe --url com um link público do MP4)")
    limite = "----" + uuid.uuid4().hex
    corpo = b""
    for k, v in (("upload_preset", preset), ("public_id", Path(mp4).stem)):
        corpo += f"--{limite}\r\nContent-Disposition: form-data; name=\"{k}\"\r\n\r\n{v}\r\n".encode()
    corpo += f"--{limite}\r\nContent-Disposition: form-data; name=\"file\"; filename=\"{Path(mp4).name}\"\r\nContent-Type: video/mp4\r\n\r\n".encode() + Path(mp4).read_bytes() + f"\r\n--{limite}--\r\n".encode()
    req = urllib.request.Request(f"https://api.cloudinary.com/v1_1/{nuvem}/video/upload", data=corpo, headers={"Content-Type": f"multipart/form-data; boundary={limite}"})
    r = json.load(urllib.request.urlopen(req, timeout=600))
    return r["secure_url"]


POST = """mutation($i: CreatePostInput!) { createPost(input: $i) {
  ... on PostActionSuccess { post { id dueAt } }
  ... on MutationError { message } } }"""


def publicar(pasta, url=None, fila=False):
    pasta = Path(pasta)
    rot = json.loads((pasta / "roteiro.json").read_text())
    mp4 = RAIZ / "output" / pasta.name / f"{rot['slug']}.mp4"
    if not url:
        if not mp4.exists():
            raise SystemExit(f"MP4 não encontrado: {mp4}")
        url = subir_cloudinary(mp4)
        print("vídeo hospedado:", url)
    texto = rot.get("descricao", rot["titulo"]) + "\n\n" + " ".join(rot.get("hashtags", []))
    alvo = [c for c in canais() if c["service"] in ("tiktok", "instagram", "youtube")]
    if not alvo:
        raise SystemExit("nenhum canal de TikTok, Instagram ou YouTube conectado no Buffer")
    for c in alvo:
        i = {"text": texto, "channelId": c["id"], "schedulingType": "automatic", "mode": "addToQueue",
             "assets": [{"video": {"url": url, "metadata": {"thumbnailOffset": 1500}}}]}
        if not fila:
            i["saveToDraft"] = True
        if c["service"] == "instagram":
            i["metadata"] = {"instagram": {"type": "reel", "shouldShareToFeed": True}}
        elif c["service"] == "youtube":
            i["text"] = texto + " #shorts"
            i["metadata"] = {"youtube": {"title": rot["titulo"][:100], "categoryId": "27"}}
        r = gql(POST, {"i": i})["createPost"]
        print(f"{c['service']:9} {c['name']}: " + (f"ok ({'rascunho' if not fila else r['post'].get('dueAt')})" if "post" in r else "ERRO " + r.get("message", "?")))


def main():
    a = [x for x in sys.argv[1:] if not x.startswith("--")]
    if not a or a[0] == "canais":
        for c in canais():
            print(f"{c['service']:10} {c['name']}  ({c['org']})  id={c['id']}")
        return
    url = sys.argv[sys.argv.index("--url") + 1] if "--url" in sys.argv else None
    publicar(a[0], url=url, fila="--fila" in sys.argv)


if __name__ == "__main__":
    main()
