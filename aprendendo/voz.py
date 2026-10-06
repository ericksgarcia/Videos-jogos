"""Narração por TTS, com cache e tempo de cada palavra (para as legendas).

Provedores (variável VOZ_PROVEDOR, padrão "auto"):
  gemini - Gemini TTS (gemini-3.8-flash-tts, voz Achird), o mais natural e com
           emoção controlada por "notas de direção" e tags como [excitement].
           Precisa de GEMINI_API_KEY (chave do Google AI Studio). Não devolve o
           tempo das palavras: ele é calculado pelas pausas do próprio áudio.
  edge   - vozes neurais do Microsoft Edge via `edge-tts`. Grátis, sem conta,
           devolve o tempo de cada palavra. Serviço não oficial: bom para
           testar; para canal monetizado prefira azure ou google.
  azure  - Azure AI Speech (mesmas vozes do Edge). Grátis até 500 mil
           caracteres/mês no plano F0. Precisa de AZURE_SPEECH_KEY e
           AZURE_SPEECH_REGION (ex.: brazilsouth).
  google - Google Cloud Text-to-Speech (vozes Chirp 3 HD). Precisa de
           GOOGLE_TTS_API_KEY.
  nenhum - sem voz; as legendas usam tempos estimados.
"auto" tenta gemini, azure e google (se houver chave) e por fim edge; se
nada responder, segue sem voz. A chave pode vir do ambiente ou de um
arquivo `.env` na raiz (ignorado pelo git).

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

import numpy as np
import requests
from scipy.io import wavfile

RAIZ = Path(__file__).resolve().parent.parent
CACHE = RAIZ / "data" / "voz"
GEMINI_MODELO = os.environ.get("GEMINI_TTS_MODELO", "gemini-3.8-flash-tts")
# Notas de direção do Gemini TTS: só o trecho depois de TRANSCRIPT é falado.
DIRECAO = """# AUDIO PROFILE: Narrador de um canal brasileiro de divulgação científica para adultos
## THE SCENE: Vídeo curto que explica um assunto complicado de um jeito muito simples, com analogias do dia a dia.
### DIRECTOR'S NOTES
Style: adulto, inteligente, conversado e caloroso, curioso como quem conta algo fascinante a um amigo; nada infantilizado; ênfase natural nas palavras-chave.
Pace: moderado, com pausas curtas para a ideia assentar.
Accent: português do Brasil.
#### TRANSCRIPT
"""
VELOCIDADE = "+0%"   # velocidade das vozes edge/azure
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


def _carregar_env():
    arq = RAIZ / ".env"
    if arq.exists():
        for linha in arq.read_text().splitlines():
            if "=" in linha and not linha.strip().startswith("#"):
                k, v = linha.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())


_carregar_env()


def _alinhar_pausas(texto, wav):
    """Tempo de cada palavra a partir das pausas do áudio.

    Acha os silêncios, casa os mais longos com a pontuação do texto (fim de
    frase/vírgula) e, dentro de cada trecho, divide o tempo pelo tamanho das
    palavras. Bom o bastante para legenda e para sincronizar a animação."""
    sr, x = wavfile.read(wav)
    x = x.astype(np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    hop = int(0.01 * sr)
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1))
    voz = rms > 0.06 * np.percentile(rms, 95)
    idx = np.flatnonzero(voz)
    if not len(idx):
        return None
    ini, fim = idx[0], idx[-1] + 1
    pausas, k = [], ini
    while k < fim:
        if not voz[k]:
            j = k
            while j < fim and not voz[j]:
                j += 1
            if j - k >= 12:  # >= 120 ms
                pausas.append((k, j))
            k = j
        else:
            k += 1
    ws = texto.split()
    peso = [len(w) + 1 for w in ws]
    fronteiras = [i for i, w in enumerate(ws[:-1]) if w.endswith((".", "!", "?", ",", ":", ";"))]
    # tempo esperado de cada fronteira (proporcional aos caracteres)
    tot = sum(peso)
    acum = np.cumsum(peso)
    esperado = {i: ini + (fim - ini) * acum[i] / tot for i in fronteiras}
    usado = {}
    for a, b in sorted(pausas, key=lambda p: -(p[1] - p[0])):
        livres = [i for i in fronteiras if i not in usado]
        if not livres:
            break
        i = min(livres, key=lambda i: abs(esperado[i] - (a + b) / 2))
        if abs(esperado[i] - (a + b) / 2) < 150:  # até 1,5 s de diferença
            usado[i] = (a, b)
    # garante ordem crescente
    ancoras = sorted(usado.items())
    ok, ultimo_t = [], ini
    for i, (a, b) in ancoras:
        if a > ultimo_t:
            ok.append((i, a, b))
            ultimo_t = b
    out, w0, t0 = [], 0, ini
    for i, a, b in ok + [(len(ws) - 1, fim, fim)]:
        trecho = ws[w0:i + 1]
        p = peso[w0:i + 1]
        dur, t = a - t0, t0
        for w, pw in zip(trecho, p):
            d = dur * pw / sum(p)
            out.append([w, float(round(t / 100, 3)), float(round((t + d * 0.92) / 100, 3))])
            t += d
        w0, t0 = i + 1, b
    return out


def _pausas(wav, minimo=0.1):
    sr, x = wavfile.read(wav)
    x = x.astype(np.float64)
    if x.ndim > 1:
        x = x.mean(axis=1)
    hop = int(0.01 * sr)
    n = len(x) // hop
    rms = np.sqrt(np.mean(x[: n * hop].reshape(n, hop) ** 2, axis=1))
    v = rms > 0.06 * np.percentile(rms, 95)
    out, k = [], 0
    while k < n:
        if not v[k]:
            j = k
            while j < n and not v[j]:
                j += 1
            if j - k >= minimo * 100:
                out.append((k / 100, j / 100))
            k = j
        else:
            k += 1
    return out, n / 100


def _alinhar_gemini(texto, wav):
    """Pergunta ao Gemini em que segundo começa cada frase (ele "ouve" o áudio),
    encaixa cada início na pausa mais próxima e divide as palavras da frase pelo
    tamanho. Mais preciso que só as pausas."""
    ws = texto.split()
    frases, atual = [], []
    for i, w in enumerate(ws):
        atual.append(i)
        if w.endswith((".", "!", "?", ",", ":", ";")):
            frases.append(atual)
            atual = []
    if atual:
        frases.append(atual)
    lista = "\n".join(f"{k + 1}. {' '.join(ws[i] for i in f)}" for k, f in enumerate(frases))
    pergunta = ("Ouça o áudio e diga em que segundo começa a fala de cada trecho abaixo (na ordem). "
                "Responda só um array JSON de números com 2 casas decimais, um por trecho.\n" + lista)
    b = base64.b64encode(Path(wav).read_bytes()).decode()
    r = requests.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent",
                      headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"]}, timeout=120,
                      json={"contents": [{"parts": [{"inlineData": {"mimeType": "audio/wav", "data": b}}, {"text": pergunta}]}],
                            "generationConfig": {"responseMimeType": "application/json", "temperature": 0}})
    r.raise_for_status()
    inicios = json.loads(r.json()["candidates"][0]["content"]["parts"][0]["text"])
    if len(inicios) != len(frases):
        raise ValueError("número de trechos diferente")
    pausas, dur = _pausas(wav, 0.08)
    ajustados = []
    for k, t in enumerate(inicios):
        t = float(t)
        if k:
            # a frase começa no fim da pausa mais longa por perto (±0,6 s)
            perto = [(b - a, b) for a, b in pausas if abs(b - t) <= 0.6]
            if perto:
                t = max(perto)[1]
        ajustados.append(max(t, ajustados[-1] + 0.15) if ajustados else max(0.0, t))
    out = []
    for k, f in enumerate(frases):
        t0 = ajustados[k]
        t1 = ajustados[k + 1] if k + 1 < len(frases) else dur
        # o fim da fala da frase é o início da pausa antes da próxima, se houver
        fala_fim = max((a for a, _ in pausas if t0 < a < t1), default=t1)
        peso = [len(ws[i]) + 1 for i in f]
        t = t0
        for i, p in zip(f, peso):
            d = (fala_fim - t0) * p / sum(peso)
            out.append([ws[i], round(t, 3), round(t + d * 0.92, 3)])
            t += d
    return out


def _gemini(texto, voz, destino, tts=None, direcao=None):
    chave = os.environ["GEMINI_API_KEY"]
    corpo = {"contents": [{"parts": [{"text": (direcao or DIRECAO) + (tts or texto)}]}],
             "generationConfig": {"responseModalities": ["AUDIO"],
                                  "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": voz}}}}}
    for tentativa in range(4):
        r = requests.post(f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODELO}:generateContent",
                          headers={"x-goog-api-key": chave}, json=corpo, timeout=180)
        if r.status_code in (429, 500, 503) and tentativa < 3:
            import time
            time.sleep(8 * (tentativa + 1))
            continue
        r.raise_for_status()
        break
    parte = r.json()["candidates"][0]["content"]["parts"][0]["inlineData"]
    bruto = base64.b64decode(parte["data"])
    tmp = destino.with_suffix(".bin")
    tmp.write_bytes(bruto)
    if bruto[:4] == b"RIFF":
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(tmp), "-ar", "48000", "-ac", "1", str(destino)], check=True)
    else:  # PCM 16 bits, 24 kHz
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "s16le", "-ar", "24000", "-ac", "1", "-i", str(tmp),
                        "-ar", "48000", str(destino)], check=True)
    tmp.unlink()
    # corta o silêncio do começo/fim para a fala começar no instante marcado
    aparado = destino.with_suffix(".tmp.wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(destino), "-af",
                    "silenceremove=start_periods=1:start_threshold=-45dB,areverse,silenceremove=start_periods=1:start_threshold=-45dB,areverse",
                    str(aparado)], check=True)
    aparado.replace(destino)
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(destino)],
                         capture_output=True, text=True, check=True)
    try:
        palavras = _alinhar_gemini(texto, destino)
    except Exception as e:
        print(f"   [voz] alinhamento pelo Gemini falhou ({type(e).__name__}); usando as pausas")
        palavras = _alinhar_pausas(texto, destino)
    return palavras, float(out.stdout.strip())


def _wav48(origem, destino):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(origem), "-ar", "48000", "-ac", "1", str(destino)], check=True)
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(destino)],
                         capture_output=True, text=True, check=True)
    return float(out.stdout.strip())


def _edge(texto, voz, destino, tts=None, direcao=None):
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


def _azure(texto, voz, destino, tts=None, direcao=None):
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


def _google(texto, voz, destino, tts=None, direcao=None):
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


PROVEDORES = {"gemini": (_gemini, "Fenrir"), "edge": (_edge, "pt-BR-AntonioNeural"), "azure": (_azure, "pt-BR-AntonioNeural"),
              "google": (_google, "pt-BR-Chirp3-HD-Charon")}


def _ordem():
    p = os.environ.get("VOZ_PROVEDOR", "auto")
    if p == "nenhum":
        return []
    if p != "auto":
        return [p]
    ordem = []
    if os.environ.get("GEMINI_API_KEY"):
        ordem.append("gemini")
    if os.environ.get("AZURE_SPEECH_KEY"):
        ordem.append("azure")
    if os.environ.get("GOOGLE_TTS_API_KEY"):
        ordem.append("google")
    return ordem + ["edge"]


def narrar(texto, tts=None, direcao=None, voz_nome=None):
    """Devolve {"wav": caminho ou None, "dur": s, "palavras": [[w, ini, fim]], "provedor": nome}.

    `tts` é o texto enviado ao Gemini, com tags de emoção ([positive]); precisa
    ter as mesmas palavras de `texto` (legenda)."""
    CACHE.mkdir(parents=True, exist_ok=True)
    for nome in _ordem():
        fn, padrao = PROVEDORES[nome]
        voz = voz_nome if (voz_nome and nome == "gemini") else os.environ.get("VOZ_NOME", padrao)
        extra = f"{GEMINI_MODELO}|{direcao or DIRECAO}|{tts}" if nome == "gemini" else VELOCIDADE
        h = hashlib.sha1(f"{nome}|{voz}|{extra}|{texto}".encode()).hexdigest()[:16]
        wav, meta = CACHE / f"{h}.wav", CACHE / f"{h}.json"
        if wav.exists() and meta.exists():
            return json.loads(meta.read_text())
        try:
            palavras, dur = fn(texto, voz, wav, tts=tts, direcao=direcao)
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
        exata = re.sub(r"[^\wÀ-ÿ]", "", palavra)
        for w, ini, _ in fala["palavras"]:  # maiúscula exata primeiro
            if re.sub(r"[^\wÀ-ÿ]", "", w) == exata:
                return ini
        alvo = _norm(palavra)
        for w, ini, _ in fala["palavras"]:
            if _norm(w) == alvo:
                return ini
    return fala["dur"] * 0.7


def instante_de(fala, palavras, depois=0.0):
    """Início da primeira palavra da lista que aparece depois de `depois` s; None se não achar."""
    alvos = {_norm(p) for p in palavras}
    for w, ini, _ in fala["palavras"]:
        if ini >= depois and _norm(w) in alvos:
            return ini
    return None


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
