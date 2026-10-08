"""Controle de qualidade do MP4 final (roda no vídeo pronto, não pesa no render).

    python aprendendo/motor/qa.py output/<tema>/<slug>.mp4 [--roteiro aprendendo/videos/<tema>]

Três verificações:
1. Piscadas de um quadro só (ideia do pops.mjs de Mort1d/motion-graphics-skills, MIT):
   o quadro k difere dos dois vizinhos, mas k-1 e k+1 são parecidos entre si. É o defeito
   típico de seek (fromTo sem immediateRender:false, cena desenhada um quadro antes,
   número que pisca). Corte seco, flash e whoosh continuam no quadro seguinte e não contam.
2. Cor: o vídeo precisa estar marcado como BT.709 (senão o celular mostra cores erradas).
3. Ritmo (regra 6 da retenção): mede só a área da ilustração (y 300–1420, sem legenda nem
   marca) e lista trechos de mais de 4 s em que nada aparece, se mexe ou muda; dá também
   as batidas visuais por minuto e a fração de
   quadros em movimento (referência: 67–100 %). O cartão final (último trecho) pode aparecer.
Saída com o instante e a cena de cada problema. Código de saída 1 se houver piscada ou cor errada.
"""
import argparse
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

LARG = 96  # miniaturas em cinza


def _probe(arq, campos):
    r = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", f"stream={campos}",
                        "-of", "json", str(arq)], capture_output=True, text=True, check=True)
    return json.loads(r.stdout)["streams"][0]


def miniaturas(arq, recorte=None):
    s = _probe(arq, "width,height,r_frame_rate")
    W, H = s["width"], s["height"]
    n, d = s["r_frame_rate"].split("/")
    fps = float(n) / float(d)
    vf = []
    if recorte:  # (y0, y1) em pixels do vídeo
        vf.append(f"crop={W}:{recorte[1] - recorte[0]}:0:{recorte[0]}")
        H = recorte[1] - recorte[0]
    h = max(2, 2 * round(LARG * H / W / 2))
    vf.append(f"scale={LARG}:{h}:flags=area,format=gray")
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", str(arq), "-vf", ",".join(vf), "-f", "rawvideo", "pipe:1"],
                       capture_output=True, check=True)
    q = np.frombuffer(r.stdout, np.uint8)
    k = len(q) // (LARG * h)
    return q[: k * LARG * h].reshape(k, h, LARG).astype(np.int16), fps


def piscadas(fr, fps, piso=4.0, volta=0.35):
    """[(t, entra, sai, através)] dos quadros que destoam dos dois vizinhos."""
    d1 = np.abs(fr[1:] - fr[:-1]).mean(axis=(1, 2))   # k-1 -> k
    d2 = np.abs(fr[2:] - fr[:-2]).mean(axis=(1, 2))   # k-1 -> k+1
    achados, k = [], 1
    while k < len(fr) - 1:
        ent, sai, atr = d1[k - 1], d1[k], d2[k - 1]
        if ent >= piso and sai >= piso and atr < volta * min(ent, sai):
            achados.append((k / fps, ent, sai, atr))
            k += 2
            continue
        k += 1
    return achados


def ritmo(fr, fps, janela=0.5, limiar=12.0, maximo=4.0):
    """Batidas visuais: a tela é dividida em 8×8 regiões e mede-se quanto cada uma mudou em
    0,5 s. Uma batida é um pico em que alguma região mudou bastante (algo surgiu, saiu, se
    moveu). Calibrado no vídeo do tsunami: o limiar 12 separa uma etiqueta entrando do
    movimento ambiente (ondas, grão, aproximação lenta da câmera)."""
    passo = max(1, round(janela * fps))
    d = np.abs(fr[passo:] - fr[:-passo])[::passo]
    H, W = (fr.shape[1] // 8) * 8, (fr.shape[2] // 8) * 8
    mx = d[:, :H, :W].reshape(len(d), 8, H // 8, 8, W // 8).mean(axis=(2, 4)).max(axis=(1, 2))
    d1 = np.abs(fr[1:] - fr[:-1]).mean(axis=(1, 2))
    picos = [i * janela for i in range(1, len(mx) - 1) if mx[i] > limiar and mx[i] >= mx[i - 1] and mx[i] >= mx[i + 1]]
    dur = len(fr) / fps
    marcos = [0.0] + picos + [dur]
    vazios = [(x, y) for x, y in zip(marcos, marcos[1:]) if y - x > maximo]
    return {"batidas_min": len(picos) / dur * 60, "movendo": float((d1 > 0.35).mean()), "parados": vazios}


def _cena_em(t, cenas):
    for i, c in enumerate(cenas):
        if c["ini"] <= t < c["fim"]:
            return f"cena {i + 1} ({c['id']}, {t - c['ini']:.1f} s nela)"
    return ""


def _cenas(pasta):
    """Tempos das cenas a partir do projeto montado em output/<tema>/build (se existir)."""
    if not pasta:
        return []
    rot = json.loads((Path(pasta) / "roteiro.json").read_text())
    html = Path("output") / Path(pasta).name / "build" / "index.html"
    if not html.exists():
        return []
    s = html.read_text()
    i = s.find('"cenas": [')
    try:
        dados, _ = json.JSONDecoder().raw_decode(s[i + len('"cenas": '):])
    except ValueError:
        return []
    return dados if len(dados) == len(rot["cenas"]) else []


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("mp4")
    ap.add_argument("--roteiro", help="pasta do vídeo, para dizer em que cena está cada problema")
    a = ap.parse_args()
    cenas = _cenas(a.roteiro)
    onde = lambda t: _cena_em(t, cenas)
    ruim = False

    print("1) piscadas de um quadro")
    fr, fps = miniaturas(a.mp4)
    p = piscadas(fr, fps)
    for t, e, s, at in p:
        print(f"   {t:7.3f} s {onde(t)}: difere {e:.1f}/{s:.1f} dos vizinhos, que diferem {at:.1f}")
    print("   nenhuma" if not p else f"   {len(p)} piscada(s)")
    ruim |= bool(p)

    print("2) cor")
    c = _probe(a.mp4, "color_space,color_primaries,color_transfer,color_range")
    ok = all(c.get(k) == "bt709" for k in ("color_space", "color_primaries", "color_transfer")) and c.get("color_range") == "tv"
    print(f"   {'ok' if ok else 'ERRADA'}: {c.get('color_space')}/{c.get('color_primaries')}/{c.get('color_transfer')}/{c.get('color_range')}")
    ruim |= not ok

    print("3) ritmo (área da ilustração, y 300–1420)")
    fr, fps = miniaturas(a.mp4, (300, 1420))
    r = ritmo(fr, fps)
    print(f"   batidas visuais por minuto: {r['batidas_min']:.0f} (regra: uma a cada 2–4 s = 15–30)")
    print(f"   quadros em movimento: {r['movendo'] * 100:.0f} % (referência de vídeos virais: 67–100 %)")
    for t0, t1 in r["parados"]:
        print(f"   SEM BATIDA {t0:6.1f}–{t1:6.1f} s ({t1 - t0:.1f} s) {onde(t0)}")
    if not r["parados"]:
        print("   nenhum trecho parado com mais de 4 s")
    sys.exit(1 if ruim else 0)


if __name__ == "__main__":
    main()
