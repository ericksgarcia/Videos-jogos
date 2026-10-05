"""Narração por TTS, com cache e tempo de cada palavra (para as legendas).

Provedores (variável VOZ_PROVEDOR, padrão "auto"):
  edge   - vozes neurais do Microsoft Edge via `edge-tts`. Grátis, sem conta,
           devolve o tempo de cada palavra. Serviço não oficial: bom para
           testar; para canal monetizado prefira azure ou google.
  azure  - Azure AI Speech (mesmas vozes do Edge). Grátis até 500 mil
           caracteres/mês no plano F0. Precisa de AZURE_SPEECH_KEY e
           AZURE_SPEECH_REGION (ex.: brazilsouth).
  google - Google Cloud Text-to-Speech (vozes Chirp 3 HD). Precisa de
           GOOGLE_TTS_API_KEY.
  nenhum - sem voz; as legendas usam tempos estimados.
"auto" tenta azure, depois google (se houver chave) e por fim edge; se
nada responder, segue sem voz.

A voz pode ser trocada com VOZ_NOME (padrão pt-BR-AntonioNeural para
edge/azure e pt-BR-Chirp3-HD-Charon para google).
"""
import asyncio
import base64
import hashlib
import json
import os
import re
import ssl
import subprocess
import tempfile
from pathlib import Path

import requests

CACHE = Path(__file__).resolve().parent.parent / "data" / "voz"
VELOCIDADE = "+8%"   # narrador um pouco mais acelerado
_avisado = set()


def _palavras_estimadas(texto, dur=None):
    """Distribui o tempo pelas palavras, com pausas na pontuação."""
    ws = texto.split()
    pesos = []
    for w in ws:
        p = len(w) + 1
        if w.endswith((".", "!", "?")):
            p += 4
        elif w.endswith((",", ":", ";")):
            p += 2
        pesos.append(p)
    total = sum(pesos)
    if dur is None:
        dur = total / 17.5  # ritmo de narração esportiva
    out, t = [], 0.0
    for w, p in zip(ws, pesos):
        d = dur * p / total
        fala = d * (len(w) + 1) / p
        out.append([w, round(t, 3), round(t + fala, 3)])
        t += d
    return out, dur


def _wav48(origem, destino):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(origem), "-ar", "48000", "-ac", "1", str(destino)], check=True)
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(destino)],
                         capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def _edge(texto, voz, destino):
    import edge_tts
    import edge_tts.communicate as ec
    ca = os.environ.get("SSL_CERT_FILE") or ("/root/.ccr/ca-bundle.crt" if os.path.exists("/root/.ccr/ca-bundle.crt") else None)
    if ca:  # atrás de proxy com CA próprio (ambiente cloud do Claude Code)
        ec._SSL_CTX = ssl.create_default_context(cafile=ca)
    palavras = []

    async def run():
        com = edge_tts.Communicate(texto, voz, rate=VELOCIDADE, boundary="WordBoundary",
                                   proxy=os.environ.get("HTTPS_PROXY") or None)
        with open(destino.with_suffix(".mp3"), "wb") as f:
            async for ch in com.stream():
                if ch["type"] == "audio":
                    f.write(ch["data"])
                elif ch["type"] == "WordBoundary":
                    ini = ch["offset"] / 1e7
                    palavras.append([ch["text"], round(ini, 3), round(ini + ch["duration"] / 1e7, 3)])

    asyncio.run(run())
    dur = _wav48(destino.with_suffix(".mp3"), destino)
    destino.with_suffix(".mp3").unlink()
    return _alinhar(texto, palavras), dur


def _alinhar(texto, palavras):
    """Usa as palavras do texto original (com pontuação) e os tempos do TTS."""
    ws = texto.split()
    if len(palavras) != len(ws):
        # o TTS às vezes junta/separa tokens; cai para estimativa proporcional
        return None
    return [[w, p[1], p[2]] for w, p in zip(ws, palavras)]


def _azure(texto, voz, destino):
    chave, regiao = os.environ["AZURE_SPEECH_KEY"], os.environ.get("AZURE_SPEECH_REGION", "brazilsouth")
    ssml = (f"<speak version='1.0' xml:lang='pt-BR'><voice name='{voz}'><prosody rate='{VELOCIDADE}'>"
            f"{texto.replace('&', 'e')}</prosody></voice></speak>")
    r = requests.post(f"https://{regiao}.tts.speech.microsoft.com/cognitiveservices/v1", data=ssml.encode(),
                      headers={"Ocp-Apim-Subscription-Key": chave, "Content-Type": "application/ssml+xml",
                               "X-Microsoft-OutputFormat": "riff-48khz-16bit-mono-pcm"}, timeout=60)
    r.raise_for_status()
    tmp = destino.with_suffix(".src.wav")
    tmp.write_bytes(r.content)
    dur = _wav48(tmp, destino)
    tmp.unlink()
    return None, dur


def _google(texto, voz, destino):
    r = requests.post(f"https://texttospeech.googleapis.com/v1/text:synthesize?key={os.environ['GOOGLE_TTS_API_KEY']}",
                      json={"input": {"text": texto}, "voice": {"languageCode": "pt-BR", "name": voz},
                            "audioConfig": {"audioEncoding": "LINEAR16", "sampleRateHertz": 48000, "speakingRate": 1.08}},
                      timeout=60)
    r.raise_for_status()
    tmp = destino.with_suffix(".src.wav")
    tmp.write_bytes(base64.b64decode(r.json()["audioContent"]))
    dur = _wav48(tmp, destino)
    tmp.unlink()
    return None, dur


PROVEDORES = {"edge": (_edge, "pt-BR-AntonioNeural"), "azure": (_azure, "pt-BR-AntonioNeural"),
              "google": (_google, "pt-BR-Chirp3-HD-Charon")}


def _ordem():
    p = os.environ.get("VOZ_PROVEDOR", "auto")
    if p == "nenhum":
        return []
    if p != "auto":
        return [p]
    ordem = []
    if os.environ.get("AZURE_SPEECH_KEY"):
        ordem.append("azure")
    if os.environ.get("GOOGLE_TTS_API_KEY"):
        ordem.append("google")
    return ordem + ["edge"]


def narrar(texto):
    """Devolve {"wav": caminho ou None, "dur": s, "palavras": [[w, ini, fim]], "provedor": nome}."""
    CACHE.mkdir(parents=True, exist_ok=True)
    for nome in _ordem():
        fn, padrao = PROVEDORES[nome]
        voz = os.environ.get("VOZ_NOME", padrao)
        h = hashlib.sha1(f"{nome}|{voz}|{VELOCIDADE}|{texto}".encode()).hexdigest()[:16]
        wav, meta = CACHE / f"{h}.wav", CACHE / f"{h}.json"
        if wav.exists() and meta.exists():
            return json.loads(meta.read_text())
        try:
            palavras, dur = fn(texto, voz, wav)
        except Exception as e:  # sem rede, sem chave, serviço fora: tenta o próximo
            if nome not in _avisado:
                print(f"   [voz] {nome} indisponível ({type(e).__name__}: {str(e)[:90]})")
                _avisado.add(nome)
            continue
        if not palavras:
            palavras, _ = _palavras_estimadas(texto, dur)
        res = {"wav": str(wav), "dur": round(dur, 3), "palavras": palavras, "provedor": nome}
        meta.write_text(json.dumps(res, ensure_ascii=False))
        return res
    palavras, dur = _palavras_estimadas(texto)
    return {"wav": None, "dur": round(dur, 3), "palavras": palavras, "provedor": "nenhum"}


def _norm(w):
    return re.sub(r"[^\wÀ-ÿ]", "", w).lower()


def instante(fala, palavra):
    """Início (s, relativo à fala) da palavra-clímax; fim da fala se não achar."""
    if palavra:
        alvo = _norm(palavra)
        for w, ini, _ in fala["palavras"]:
            if _norm(w) == alvo:
                return ini
    return fala["dur"] * 0.7


def legendas(fala, inicio, max_palavras=4):
    """Agrupa as palavras em blocos curtos, estilo TikTok, com tempos absolutos."""
    blocos, atual = [], []
    for w, ini, fim in fala["palavras"]:
        atual.append([w, round(inicio + ini, 3), round(inicio + fim, 3)])
        if len(atual) >= max_palavras or w.endswith((".", "!", "?", ",", ":")):
            blocos.append(atual)
            atual = []
    if atual:
        blocos.append(atual)
    out = []
    for i, b in enumerate(blocos):
        fim = blocos[i + 1][0][1] if i + 1 < len(blocos) else b[-1][2] + 0.6
        out.append({"ini": b[0][1], "fim": round(fim, 3), "palavras": b})
    return out
