"""Medidas rápidas do roteiro (e do áudio, se existir): palavras, duração estimada, caixa alta, tamanho de frase, pausas."""
import json, re, subprocess, sys
from pathlib import Path
pasta = Path(sys.argv[1]); r = json.loads((pasta / "roteiro.json").read_text())
falas = [c["fala"] for c in r["cenas"]]; texto = " ".join(falas)
pausas = texto.count("(...)"); limpo = re.sub(r"\(\.\.\.\)", "", texto)
frases = [f.strip() for f in re.split(r"(?<=[.!?])\s+", limpo) if f.strip()]; tam = [len(f.split()) for f in frases]
caps = [w for w in limpo.split() if len(re.sub(r"\W", "", w)) > 2 and re.sub(r"\W", "", w).isupper()]
n = len(limpo.split())
print(f"palavras: {n} | pausas (...): {pausas} | duração estimada: {n / 2.0 + pausas * 0.6:.0f} s (2,0 palavras/s + 0,6 s por pausa)")
print(f"frases: {len(frases)} | palavras por frase: min {min(tam)}, média {sum(tam) / len(tam):.1f}, máx {max(tam)} | frases de ≤4 palavras: {sum(1 for t in tam if t <= 4)}")
print(f"CAIXA ALTA ({len(caps)}): {' '.join(caps)}")
wav = Path(__file__).resolve().parents[2] / "output" / "arquivos-do-abismo" / r["slug"] / "voz-bruta.wav"
if wav.exists():
    d = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)], capture_output=True, text=True).stdout)
    sil = subprocess.run(["ffmpeg", "-i", str(wav), "-af", "silencedetect=n=-38dB:d=0.25", "-f", "null", "-"], capture_output=True, text=True).stderr
    tot = sum(float(x) for x in re.findall(r"silence_duration: ([\d.]+)", sil))
    print(f"áudio bruto: {d:.1f} s | silêncio (>0,25 s): {tot:.1f} s = {100 * tot / d:.0f}% | palavras/s falando: {n / (d - tot):.2f}")
