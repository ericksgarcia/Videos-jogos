"""Gera a LUT de cor "cinema" (arquivo .cube) usada no acabamento extra do vídeo.

Uso: python aprendendo/motor/lut.py   ->  aprendendo/motor/cinema.cube

Curva em S suave (contraste), sombras levemente azul-petróleo, luzes quentes
(laranja/âmbar da marca) e um pouco mais de saturação. Gerada por fórmula para
ser reproduzível e ajustável.
"""
from pathlib import Path

N = 33
SAIDA = Path(__file__).resolve().parent / "cinema.cube"


def cor(r, g, b):
    s = lambda x: x * 0.75 + 0.25 * (3 * x * x - 2 * x ** 3)  # curva em S
    r, g, b = s(r), s(g), s(b)
    L = 0.2126 * r + 0.7152 * g + 0.0722 * b
    sh, hi = (1 - L) ** 2, L ** 2
    r += -0.025 * sh + 0.035 * hi
    g += 0.008 * sh + 0.012 * hi
    b += 0.04 * sh - 0.03 * hi
    L = 0.2126 * r + 0.7152 * g + 0.0722 * b
    r, g, b = (L + (c - L) * 1.08 for c in (r, g, b))
    return [min(1.0, max(0.0, c)) for c in (r, g, b)]


def main():
    linhas = ['TITLE "Aprendendo Facil cinema"', f"LUT_3D_SIZE {N}"]
    for bi in range(N):
        for gi in range(N):
            for ri in range(N):
                linhas.append("%.5f %.5f %.5f" % tuple(cor(ri / (N - 1), gi / (N - 1), bi / (N - 1))))
    SAIDA.write_text("\n".join(linhas) + "\n")
    print("gravado:", SAIDA)


if __name__ == "__main__":
    main()
