#!/usr/bin/env python3
"""Mede uma narração (wav/mp3/mp4) SEM ouvir e SEM Gemini: ritmo, pausas, altura, entonação, clareza, loudness.

Uso:  python luz-da-palavra/ferramentas/medir_voz.py audio.wav ["texto esperado"]
Se o texto for dado (pode ter <short pause>/<long pause>), calcula também o % de palavras certas (faster-whisper large-v3-turbo, CPU).
Números de referência (out/2026, voz Gacrux com direção "pastor investigador"): ~101–117 palavras/min no total, pausas longas
(>0,35 s) média 0,65–0,8 s, entonação 4,7–7,3 semitons, clareza ≥ 0,975, acerto ≥ 97%. Entonação < 4,5 = monótona; > 8 = teatral.
Silêncio: 30–35% é natural; 41–47% (marcações de pausa em excesso) pode soar picotado. pal_min_falando > ~190 = trechos corridos.
Não substitui o ouvido do dono: diz se há motivo para desconfiar, não se a voz é bonita.
"""
import difflib, json, re, subprocess, sys
import numpy as np, librosa

arq = sys.argv[1]
esperado = re.sub(r"<[^>]+>", " ", sys.argv[2]).split() if len(sys.argv) > 2 else None
y, sr = librosa.load(arq, sr=16000)
dur = len(y) / sr
from faster_whisper import WhisperModel
m = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8")
segs, _ = m.transcribe(y, language="pt", word_timestamps=True, beam_size=5)
W = [w for s in segs for w in (s.words or [])]
fala = sum(w.end - w.start for w in W)
pausas = [W[i + 1].start - W[i].end for i in range(len(W) - 1)]
longas = [p for p in pausas if p > 0.35]
f0, _, _ = librosa.pyin(y, fmin=65, fmax=330, sr=sr, frame_length=1024)
f = f0[~np.isnan(f0)]
st = 12 * np.log2(f / np.median(f))
rms = librosa.feature.rms(y=y)[0]
# silêncio pela energia (limiar 6% do pico, trechos > 0,12 s): mais estável que os carimbos de palavra do whisper
hop = 160; e = librosa.feature.rms(y=y, frame_length=400, hop_length=hop)[0]; voz_ = e > 0.06 * np.percentile(e, 95)
sil_s = 0.0; k = 0
while k < len(voz_):
    if not voz_[k]:
        j = k
        while j < len(voz_) and not voz_[j]:
            j += 1
        if (j - k) * hop / sr >= 0.12:
            sil_s += (j - k) * hop / sr
        k = j
    else:
        k += 1
r = dict(arquivo=arq, duracao_s=round(dur, 1), palavras=len(W), pal_min_total=round(len(W) / dur * 60), pal_min_so_fala=round(len(W) / fala * 60),
         pausas_longas=len(longas), pausa_longa_media_s=round(float(np.mean(longas)), 2) if longas else 0, pausa_maior_s=round(float(max(pausas)), 2) if pausas else 0,
         altura_mediana_hz=round(float(np.median(f))), entonacao_semitons=round(float(np.std(st)), 2),
         clareza_whisper=round(float(np.mean([w.probability for w in W])), 3),
         silencio_pct=round(100 * sil_s / dur), pal_min_falando=round(len(W) / max(1e-6, dur - sil_s) * 60))
try:
    out = subprocess.run(["ffmpeg", "-nostats", "-i", arq, "-af", "ebur128=peak=true", "-f", "null", "-"], capture_output=True, text=True).stderr
    r["loudness_LUFS"] = float(re.findall(r"I:\s+(-?\d+\.\d+) LUFS", out)[-1])
    r["pico_dBTP"] = float(re.findall(r"Peak:\s+(-?\d+\.\d+) dBFS", out)[-1])
except Exception:
    pass
if esperado:
    got = [re.sub(r"[^\wÀ-ÿ]", "", w.word).lower() for w in W]
    want = [re.sub(r"[^\wÀ-ÿ]", "", w).lower() for w in esperado]
    r["palavras_certas_pct"] = round(100 * sum(b.size for b in difflib.SequenceMatcher(None, want, got, autojunk=False).get_matching_blocks()) / len(want), 1)
    r["marcacoes_lidas_em_voz_alta"] = bool(re.search(r"short pause|long pause", " ".join(got)))
print(json.dumps(r, ensure_ascii=False, indent=1))
