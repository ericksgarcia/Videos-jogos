"""Recorta um objeto gerado sobre fundo chapado (magenta) e salva PNG transparente — sem serviço externo.

    python aprendendo/motor/recorte.py entrada.jpg saida.png

Como funciona:
- a cor do fundo é a mediana da borda da imagem (o gerador pede magenta #FF00FF chapado);
- é fundo o que tem cor parecida E está ligado à borda (preenchimento a partir das bordas), e os
  buracos internos com cor quase idêntica ao fundo (vãos de grades, entre folhas);
- na fronteira, a transparência é gradual (pela distância de cor) e a cor do fundo que vazou
  na borda é removida (despill), para não ficar halo rosa;
- recorta o PNG no tamanho do objeto, com uma pequena margem.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage


def recortar(entrada, saida, margem=12):
    im = np.asarray(Image.open(entrada).convert("RGB")).astype(np.float32)
    h, w, _ = im.shape
    borda = np.concatenate([im[:4].reshape(-1, 3), im[-4:].reshape(-1, 3), im[:, :4].reshape(-1, 3), im[:, -4:].reshape(-1, 3)])
    fundo = np.median(borda, axis=0)
    dist = np.sqrt(((im - fundo) ** 2).sum(axis=2))
    # candidatos a fundo (cor parecida) ligados à borda
    parecido = dist < 95
    rot, _ = ndimage.label(parecido)
    ids = np.unique(np.concatenate([rot[0], rot[-1], rot[:, 0], rot[:, -1]]))
    eh_fundo = np.isin(rot, ids[ids > 0])
    # "sombra" que o gerador às vezes desenha no fundo: magenta mais escuro (R e B bem acima de G);
    # sai se estiver encostada no fundo já detectado (repete para seguir a sombra inteira)
    r_, g_, b_ = im[..., 0], im[..., 1], im[..., 2]
    magenta = (r_ - g_ > 55) & (b_ - g_ > 45) & (np.abs(r_ - b_) < 110)
    for _ in range(40):
        novo = magenta & ~eh_fundo & ndimage.binary_dilation(eh_fundo, iterations=2)
        if not novo.any():
            break
        eh_fundo |= novo
    # buracos internos (vão de grade, entre folhas): só saem se a cor for quase idêntica ao fundo
    buracos, _ = ndimage.label((dist < 55) & ~eh_fundo)
    tam = ndimage.sum(np.ones_like(dist), buracos, index=np.arange(1, buracos.max() + 1)) if buracos.max() else []
    for k, n in enumerate(tam, start=1):
        if n >= 12:
            eh_fundo |= buracos == k
    # alfa: 0 no fundo; perto da fronteira, gradual pela distância de cor; 1 no resto
    alfa = np.ones((h, w), np.float32)
    alfa[eh_fundo] = 0
    perto = ndimage.binary_dilation(eh_fundo, iterations=3) & ~eh_fundo
    lo, hi = 60.0, 170.0
    alfa[perto] = np.clip((dist[perto] - lo) / (hi - lo), 0, 1)
    alfa = ndimage.gaussian_filter(alfa, 0.6) * (~eh_fundo | (alfa > 0))
    alfa[ndimage.binary_erosion(~eh_fundo, iterations=3)] = 1.0
    # despill: tira a cor do fundo misturada nas bordas semitransparentes
    a = np.clip(alfa, 1e-3, 1)[..., None]
    cor = np.clip((im - (1 - a) * fundo) / a, 0, 255)
    cor = np.where(alfa[..., None] > 0.98, im, cor)
    rgba = np.dstack([cor, alfa * 255]).astype(np.uint8)
    ys, xs = np.where(alfa > 0.05)
    if len(xs) == 0:
        raise SystemExit("nada sobrou no recorte (o fundo não era chapado?)")
    y0, y1 = max(0, ys.min() - margem), min(h, ys.max() + margem + 1)
    x0, x1 = max(0, xs.min() - margem), min(w, xs.max() + margem + 1)
    Image.fromarray(rgba[y0:y1, x0:x1], "RGBA").save(saida, optimize=True)
    return Path(saida)


if __name__ == "__main__":
    print(recortar(sys.argv[1], sys.argv[2]))
