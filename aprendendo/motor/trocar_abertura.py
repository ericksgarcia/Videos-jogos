"""Troca só o começo de um vídeo pronto, sem renderizar tudo de novo (~10 min em vez de ~60).

Uso:
  1. python aprendendo/motor/trocar_abertura.py aprendendo/videos/<tema> --guardar
     ANTES de mexer no roteiro: guarda o render bruto e a montagem atuais em output/<tema>/antigo/.
  2. Reescreva as primeiras cenas (roteiro.json + cenas.js) e confira com gerar.py --so-montar / fotos.
  3. python aprendendo/motor/trocar_abertura.py aprendendo/videos/<tema> [--cenas N]
     Renderiza só as N primeiras cenas novas (padrão 1) + um pedacinho da seguinte, emenda com o
     render antigo a partir do mesmo ponto da cena N+1, refaz a mixagem inteira (voz, trilha, efeitos)
     e codifica o MP4 final igual ao gerar.py.

As cenas depois da N precisam estar iguais (mesma fala e mesmas cenas.js): o corte é feito no mesmo
instante relativo da cena N+1 nos dois vídeos, 1,2 s depois do começo dela (a transição já acabou).
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import gerar  # noqa: E402

RAIZ = gerar.RAIZ
FOLGA = 1.2  # segundos depois do começo da cena N+1


def _agenda_html(html):
    s = Path(html).read_text()
    i = s.find("window.DADOS = ") + len("window.DADOS = ")
    return json.JSONDecoder().raw_decode(s[i:])[0]["agenda"]


def _dur(mp4):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(mp4)], capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video")
    ap.add_argument("--guardar", action="store_true", help="guarda o render atual em output/<tema>/antigo (antes de editar)")
    ap.add_argument("--cenas", type=int, default=1, help="quantas cenas do começo foram trocadas (padrão 1)")
    a = ap.parse_args()
    pasta_video = Path(a.video)
    saida = RAIZ / "output" / pasta_video.name
    build, antigo = saida / "build", saida / "antigo"

    if a.guardar:
        if not (build / "video_mudo.mp4").exists():
            raise SystemExit("não achei build/video_mudo.mp4 (o render bruto); sem ele, só renderizando tudo")
        antigo.mkdir(parents=True, exist_ok=True)
        shutil.move(build / "video_mudo.mp4", antigo / "video_mudo.mp4")
        shutil.copy(build / "index.html", antigo / "index.html")
        print("guardado em", antigo)
        return

    if not (antigo / "video_mudo.mp4").exists():
        raise SystemExit("rode antes com --guardar (precisa do render antigo)")
    ag_velha = _agenda_html(antigo / "index.html")
    roteiro = json.loads((pasta_video / "roteiro.json").read_text())
    falas = gerar.narrar(roteiro)
    if any(f["provedor"] != gerar.MARCA["voz"]["provedor"] for f in falas):
        raise SystemExit("narração sem a voz da marca: rode de novo ou avise o dono")
    ag = gerar.agenda(roteiro, falas)
    n = a.cenas
    ids_v, ids_n = [c["id"] for c in ag_velha["cenas"][n:]], [c["id"] for c in ag["cenas"][n:]]
    if ids_v != ids_n:
        raise SystemExit(f"as cenas depois da {n} mudaram ({ids_v} → {ids_n}); renderize tudo com gerar.py")
    corte_v = ag_velha["cenas"][n]["ini"] + FOLGA
    corte_n = ag["cenas"][n]["ini"] + FOLGA
    print(f"abertura nova: {corte_n:.2f} s (antes {corte_v:.2f} s) | vídeo: {ag['total']} s (antes {ag_velha['total']} s)")

    gerar.montar(roteiro, ag, build, pasta_video)
    gerar.verificar(build, 0.25)
    # render só do começo: encurta a composição
    html = build / "index.html"
    s = html.read_text()
    s = re.sub(r'(<div id="root"[^>]*data-duration=")[^"]*"', lambda m: f'{m.group(1)}{corte_n + 0.5:.3f}"', s, count=1)
    html.write_text(s)
    trecho = build / "abertura_mudo.mp4"
    gerar.renderizar(build, trecho)
    html.write_text(html.read_text().replace(f'data-duration="{corte_n + 0.5:.3f}"', f'data-duration="{ag["total"]}"', 1))

    # emenda (no render bruto de 60 fps, antes do acabamento)
    mudo = build / "video_mudo.mp4"
    filtro = (f"[0:v]trim=0:{corte_n:.4f},setpts=PTS-STARTPTS[a];"
              f"[1:v]trim=start={corte_v:.4f},setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(trecho), "-i", str(antigo / "video_mudo.mp4"), "-filter_complex", filtro,
                    "-map", "[v]", "-c:v", "libx264", "-preset", "medium", "-crf", "12", "-pix_fmt", "yuv420p", str(mudo)], check=True)
    print(f"emendado: {_dur(mudo):.2f} s (esperado {ag['total']:.2f} s)")

    gerar.mixar(ag, falas, build / "trilha.wav", roteiro.get("sons"))
    mp4 = saida / f"{roteiro['slug']}.mp4"
    gerar.codificar(mudo, build / "trilha.wav", mp4, ag["total"], gerar.metadados(roteiro))
    shutil.move(mudo, antigo / "video_mudo.mp4")  # o novo bruto vira o "antigo" para a próxima troca
    shutil.copy(html, antigo / "index.html")
    print("pronto:", mp4, f"({mp4.stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
