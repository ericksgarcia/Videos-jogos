"""Gera a voz de REFERÊNCIA (Edge TTS, grátis) com o instante de cada palavra, para o alinhador por DTW.
Uso: python ref_edge.py "texto" voz taxa saida.mp3 saida.json"""
import asyncio, json, os, ssl, sys
import edge_tts, edge_tts.communicate as ec
ca = "/root/.ccr/ca-bundle.crt"
if os.path.exists(ca): ec._SSL_CTX = ssl.create_default_context(cafile=ca)
async def main(texto, voz, rate, mp3, js):
    words = []
    com = edge_tts.Communicate(texto, voz, rate=rate, boundary="WordBoundary", proxy=os.environ.get("HTTPS_PROXY") or None)
    with open(mp3, "wb") as f:
        async for ch in com.stream():
            if ch["type"] == "audio": f.write(ch["data"])
            elif ch["type"] == "WordBoundary": words.append([ch["text"], ch["offset"] / 1e7, (ch["offset"] + ch["duration"]) / 1e7])
    json.dump(words, open(js, "w"), ensure_ascii=False)
asyncio.run(main(*sys.argv[1:6]))
