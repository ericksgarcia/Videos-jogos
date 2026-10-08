"""Exporta o vídeo pronto em outras versões a partir da cópia-mestre (sem renderizar de novo).

    python aprendendo/motor/exportar.py aprendendo/videos/<tema> --tiktok

--tiktok = qualidade máxima para postar: 1080×1920 a 60 fps nativos (o máximo que o TikTok
exibe; 120 fps ele converte para baixo), H.264 High 4.2, CRF 16 (taxa alta, sem limite de
tamanho), áudio AAC 320 kb/s a 48 kHz, cor BT.709 marcada, faststart, mesmo acabamento de
cinema e grão pela metade (o app recomprime e grão forte vira blocos).
Saída: output/<tema>/<slug>-tiktok-60fps.mp4
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import gerar  # noqa: E402


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--tiktok", action="store_true")
    a = ap.parse_args()
    pasta_video = Path(a.video)
    roteiro = json.loads((pasta_video / "roteiro.json").read_text())
    saida = gerar.RAIZ / "output" / pasta_video.name
    mestre, wav = saida / "mestre_60fps.mp4", saida / "build" / "trilha.wav"
    for f in (mestre, wav):
        if not f.exists():
            raise SystemExit(f"falta {f} — rode o render completo (gerar.py) ou o editar.py antes")
    ag = json.loads((saida / "mestre_agenda.json").read_text())
    mp4 = saida / f"{roteiro['slug']}-tiktok-60fps.mp4"
    vf = gerar._acabamento(ag["total"], roteiro.get("cinema"), fps60=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mestre), "-i", str(wav), "-map", "0:v", "-map", "1:a", "-vf", vf, "-r", "60",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-profile:v", "high", "-level", "4.2", "-pix_fmt", "yuv420p",
                    *gerar.COR709, "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-movflags", "+faststart", "-shortest", str(mp4)], check=True)
    print("pronto:", mp4, f"({mp4.stat().st_size / 1e6:.0f} MB)")


if __name__ == "__main__":
    main()
