"""Editor: corrige um trecho do vídeo sem renderizar tudo de novo.

    python aprendendo/motor/editar.py aprendendo/videos/<tema> --cena 4
    python aprendendo/motor/editar.py aprendendo/videos/<tema> --de 70 --ate 78

Como funciona:
- o render completo (gerar.py) guarda a cópia-mestre do vídeo sem som, a 60 fps e antes do
  acabamento: output/<tema>/mestre_60fps.mp4, e os tempos das cenas (mestre_agenda.json);
- o editor monta o projeto com o código ATUAL e renderiza só o trecho pedido da timeline
  COMPLETA (mesmos instantes, então a deriva da câmera, partículas etc. batem quadro a quadro);
- troca exatamente esses quadros na cópia-mestre e confere a emenda (o primeiro e o último
  quadro novos devem ser iguais aos antigos, porque ficam na margem fora da cena corrigida);
- refaz a mixagem (as batidas podem ter mudado de som), o acabamento e o MP4 final, e roda o qa.py.

Só serve quando os TEMPOS não mudaram (mesma fala, mesmas cenas). Se a fala, a ordem das cenas ou
a duração mudarem, o editor recusa: faça o render completo com gerar.py.
"""
import argparse
import json
import math
import re
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np

AQUI = Path(__file__).resolve().parent
sys.path.insert(0, str(AQUI))
import gerar  # noqa: E402
import qa  # noqa: E402

MARGEM = 0.6  # s antes/depois da cena: cobre a transição cruzada e a camada 3D que aparece antes


def _quadros(arq):
    r = subprocess.run(["ffprobe", "-v", "error", "-count_frames", "-select_streams", "v:0", "-show_entries",
                        "stream=nb_read_frames,r_frame_rate", "-of", "json", str(arq)], capture_output=True, text=True, check=True)
    s = json.loads(r.stdout)["streams"][0]
    n, d = s["r_frame_rate"].split("/")
    return int(s["nb_read_frames"]), float(n) / float(d)


def _quadro_cinza(arq, i, fps):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(arq), "-vf", f"select=eq(n\\,{i}),scale=270:480,format=gray",
                        "-frames:v", "1", "-f", "rawvideo", "pipe:1"], capture_output=True, check=True)
    return np.frombuffer(r.stdout, np.uint8).astype(np.int16)


def trecho_html(pasta, t0, t1):
    """Faz o projeto montado renderizar só [t0, t1] da timeline completa."""
    html_p = Path(pasta) / "index.html"
    h = html_p.read_text()
    h, n = re.subn(r'data-duration="[^"]*"', f'data-duration="{t1 - t0:.6f}"', h, count=1)
    assert n == 1, "template sem data-duration"
    alvo = '<script src="assets/montagem.js"></script>'
    assert alvo in h, "template sem montagem.js"
    h = h.replace(alvo, alvo + f"""
    <script>
      // editor: a timeline que o renderizador enxerga é só o trecho [{t0:.6f}, {t1:.6f}] da completa
      (() => {{
        const real = window.__timelines.main;
        const m = gsap.timeline({{ paused: true }});
        m.add(real.tweenFromTo({t0:.6f}, {t1:.6f}, {{ ease: "none", immediateRender: false }}), 0);
        window.__timelines.main = m;
      }})();
    </script>""", 1)
    html_p.write_text(h)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video", help="pasta do vídeo (aprendendo/videos/<tema>)")
    ap.add_argument("--cena", type=int, help="cena a refazer (1 = primeira)")
    ap.add_argument("--cenas", help="várias cenas, ex.: 3,5 (renderiza do início da 1ª ao fim da última)")
    ap.add_argument("--de", type=float, help="início do trecho (s)")
    ap.add_argument("--ate", type=float, help="fim do trecho (s)")
    ap.add_argument("--qualidade", default="high", choices=["draft", "standard", "high"])
    a = ap.parse_args()

    pasta_video = Path(a.video)
    roteiro = json.loads((pasta_video / "roteiro.json").read_text())
    saida = gerar.RAIZ / "output" / pasta_video.name
    mestre, agenda_m = saida / "mestre_60fps.mp4", saida / "mestre_agenda.json"
    if not mestre.exists() or not agenda_m.exists():
        raise SystemExit(f"sem cópia-mestre em {saida} — rode o render completo (gerar.py) uma vez")

    falas = gerar.narrar(roteiro)
    if {f["provedor"] for f in falas} != {"gemini"}:
        raise SystemExit("narração não veio do Gemini: pare e avise o dono")
    ag = gerar.agenda(roteiro, falas)
    if gerar.tempos_agenda(ag) != json.loads(agenda_m.read_text()):
        raise SystemExit("os tempos mudaram (fala, cenas ou duração) desde o render completo: a emenda não serve.\n"
                         "Rode o render completo: python aprendendo/motor/gerar.py " + str(pasta_video))

    cenas = ag["cenas"]
    if a.cena or a.cenas:
        nums = [a.cena] if a.cena else [int(x) for x in a.cenas.split(",")]
        t0, t1 = cenas[min(nums) - 1]["ini"] - MARGEM, cenas[max(nums) - 1]["fim"] + MARGEM
    elif a.de is not None and a.ate is not None:
        t0, t1 = a.de, a.ate
    else:
        raise SystemExit("diga o trecho: --cena N, --cenas 3,5 ou --de T0 --ate T1")
    n_m, fps = _quadros(mestre)
    f0, f1 = max(0, math.floor(t0 * fps)), min(n_m, math.ceil(t1 * fps))
    t0, t1 = f0 / fps, f1 / fps
    print(f"trecho: {t0:.3f}–{t1:.3f} s (quadros {f0}–{f1} de {n_m})")

    pasta = saida / "build"
    gerar.montar(roteiro, ag, pasta, pasta_video)
    trecho_html(pasta, t0, t1)
    novo = saida / "trecho_60fps.mp4"
    gerar.renderizar(pasta, novo, qualidade=a.qualidade)
    n_t, _ = _quadros(novo)
    if n_t < f1 - f0:
        raise SystemExit(f"o trecho saiu com {n_t} quadros, esperado {f1 - f0}")

    # emenda: o 1º e o último quadro novos caem na margem (fora do que foi corrigido) e devem bater
    for nome, i_m, i_t in (("início", f0, 0), ("fim", f1 - 1, f1 - f0 - 1)):
        if 0 <= i_m < n_m:
            d = float(np.abs(_quadro_cinza(mestre, i_m, fps) - _quadro_cinza(novo, i_t, fps)).mean())
            print(f"   emenda no {nome}: diferença {d:.2f} (0–255; até ~3 é ruído de compressão)")
            if d > 6:
                print("   ATENÇÃO: emenda visível — a mudança vazou para a margem; use um trecho maior (--de/--ate)")

    tmp = saida / "mestre_novo.mp4"
    fc = (f"[0:v]trim=end_frame={f0},setpts=PTS-STARTPTS[a];[1:v]trim=end_frame={f1 - f0},setpts=PTS-STARTPTS[b];"
          f"[0:v]trim=start_frame={f1},setpts=PTS-STARTPTS[c];[a][b][c]concat=n=3:v=1:a=0[v]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mestre), "-i", str(novo), "-filter_complex", fc, "-map", "[v]",
                    "-c:v", "libx264", "-preset", "medium", "-crf", "12", "-pix_fmt", "yuv420p", *gerar.COR709, str(tmp)], check=True)
    n_novo, _ = _quadros(tmp)
    if n_novo != n_m:
        raise SystemExit(f"a emenda mudou o número de quadros ({n_novo} ≠ {n_m}); mestre antigo mantido")
    tmp.replace(mestre)
    novo.unlink()

    gerar.mixar(ag, falas, pasta / "trilha.wav", roteiro.get("sons"), roteiro)
    mp4 = saida / f"{roteiro['slug']}.mp4"
    gerar.codificar(mestre, pasta / "trilha.wav", mp4, ag["total"], roteiro.get("cinema"))
    print("pronto:", mp4)
    subprocess.run([sys.executable, str(AQUI / "qa.py"), str(mp4), "--roteiro", str(pasta_video)])


if __name__ == "__main__":
    main()
