"""Narração dos vídeos com o TTS do Google (Gemini TTS) e trilha ambiente suave.

- `narrar(chave, texto)`: gera (ou lê do cache) a voz e devolve (palavras com tempo, duração, arquivo wav).
  O tempo de cada palavra vem só das pausas do próprio áudio (cálculo local, sem outra chamada à API).
- `trilha(destino, duracao)`: pad ambiente que fecha o ciclo exatamente na duração do vídeo (loop sem estalo).
- `mixar(voz, trilha_wav, destino, duracao)`: voz + trilha, com volume padronizado.

A chave do Google fica como credencial do ambiente (o proxy injeta o cabeçalho) ou em GEMINI_API_KEY/.env.
A voz pode ser trocada com VOZ_FE_NOME (padrão Achird, a voz do canal em aprendendo/identidade/marca.json).
"""
import json
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy.io import wavfile

RAIZ = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(RAIZ / "aprendendo" / "motor"))
import voz as V  # noqa: E402  (carrega o .env e traz as funções de TTS do canal)

VOZ = os.environ.get("VOZ_FE_NOME", "Achird")
DIRECAO = (
    "# AUDIO PROFILE: Narrador de um canal brasileiro de reflexões bíblicas\n"
    "## THE SCENE: Vídeo curto de 8 a 10 segundos para o TikTok; uma frase de curiosidade que prende logo no começo.\n"
    "### DIRECTOR'S NOTES\n"
    "Style: adulto, sereno e caloroso, como quem conta algo importante a um amigo; reverente, sem tom de sermão "
    "e sem dramatização; ênfase natural nas palavras-chave.\n"
    "Pace: ágil e natural, sem pressa nem arrastar; pausas muito curtas entre as frases.\n"
    "Accent: português do Brasil.\n"
    "#### TRANSCRIPT\n"
)


def _sem_chamada_extra():
    # o alinhamento pelo Gemini faria uma 2ª chamada paga; usamos só as pausas do áudio
    V._alinhar_gemini = lambda texto, wav: V._alinhar_pausas(texto, wav)


def narrar(cache, chave, texto, direcao=None, voz=None):
    """-> (palavras [[w, ini, fim], ...], duracao_s, wav). Cache em `cache`/<chave>.wav e .json."""
    cache.mkdir(parents=True, exist_ok=True)
    wav, meta = cache / f"{chave}.wav", cache / f"{chave}.json"
    if wav.exists() and meta.exists():
        m = json.loads(meta.read_text())
        if m["texto"] == texto and m["voz"] == (voz or VOZ):
            return m["palavras"], m["duracao"], wav
    _sem_chamada_extra()
    palavras, dur = V._gemini(texto, voz or VOZ, wav, direcao=direcao or DIRECAO)
    if palavras is None:
        palavras, dur = V._palavras_estimadas(texto, dur)
    meta.write_text(json.dumps({"texto": texto, "voz": voz or VOZ, "palavras": palavras, "duracao": dur}, ensure_ascii=False))
    return palavras, dur, wav


def trilha(destino, duracao, sr=48000):
    """Pad ambiente (acorde aberto em lá menor) cujas frequências dão ciclos inteiros em `duracao`."""
    n = int(round(duracao * sr))
    t = np.arange(n) / sr
    x = np.zeros(n)
    for f, a in ((110.0, 0.5), (164.81, 0.35), (220.0, 0.3), (261.63, 0.18), (329.63, 0.12)):
        for desafina in (1.0, 1.004):
            ff = max(1, round(f * desafina * duracao)) / duracao  # ciclos inteiros no vídeo
            x += a * np.sin(2 * np.pi * ff * t)
    lfo = 0.75 + 0.25 * np.sin(2 * np.pi * max(1, round(0.25 * duracao)) / duracao * t)  # respiração lenta
    x *= lfo
    x = x / np.max(np.abs(x)) * 0.5
    wavfile.write(str(destino), sr, (x * 32767).astype(np.int16))
    return destino


def mixar(voz_wav, trilha_wav, destino, duracao, volume_trilha=0.07):
    """Voz (48 kHz mono) + trilha, padronizada em ~-16 LUFS com limitador (sem estourar). A trilha fica bem baixa sob a voz."""
    filtro = (f"[0:a]apad=whole_dur={duracao}[v];[1:a]volume={volume_trilha}[t];"
              f"[v][t]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-16:TP=-2.0:LRA=7,alimiter=limit=0.85[m]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(voz_wav), "-i", str(trilha_wav), "-filter_complex", filtro,
                    "-map", "[m]", "-t", str(duracao), "-ar", "48000", "-ac", "1", str(destino)], check=True)
    return destino
