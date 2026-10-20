"""Texto na tela palavra por palavra (estilo karaokê), pronto para sincronizar com a narração.

`sprites(...)` posiciona cada palavra (centralizada, margens laterais maiores para fugir dos botões do TikTok) e devolve
um recorte RGBA por palavra. `desenhar(...)` coloca as palavras no quadro: as ainda não faladas ficam esmaecidas, mas
legíveis, então o gancho já aparece inteiro no 1º quadro (que também serve de capa); cada palavra acende quando é dita.
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
AMARELO, BRANCO, CIANO = (255, 210, 63), (248, 249, 255), (143, 227, 255)
MARGEM = 110          # px de cada lado (a coluna de botões do TikTok fica à direita)
ALTURA_MAX = 760      # altura máxima do bloco de texto
DIM = 0.42            # opacidade da palavra ainda não falada


def _fonte(peso, tam):
    ttf = RAIZ / "output" / "_fontes" / f"nunito-{peso}.ttf"
    if not ttf.exists():
        from fontTools.ttLib import TTFont
        ttf.parent.mkdir(parents=True, exist_ok=True)
        f = TTFont(RAIZ / "aprendendo/identidade/fontes" / f"nunito-{peso}.woff2")
        f.flavor = None
        f.save(ttf)
    return ImageFont.truetype(str(ttf), tam)


def _marcar(txt, destaque, base):
    """[(palavra, cor)] com as expressões em destaque em amarelo."""
    marcado, baixo = [False] * len(txt), txt.lower()
    for e in destaque:
        i = baixo.find(e.lower())
        while i >= 0:
            for k in range(i, i + len(e)):
                marcado[k] = True
            i = baixo.find(e.lower(), i + 1)
    out, pos = [], 0
    for w in txt.split(" "):
        out.append((w, AMARELO if any(marcado[pos:pos + len(w)]) else base))
        pos += len(w) + 1
    return out


def _quebrar(draw, palavras, fonte, largura):
    """Quebra em linhas e evita "viúva" (palavra sozinha na última linha)."""
    linhas, atual = [], []
    for p in palavras:
        if atual and draw.textlength(" ".join(w for w, _ in atual + [p]), font=fonte) > largura:
            linhas.append(atual)
            atual = []
        atual.append(p)
    linhas.append(atual)
    if len(linhas) >= 2 and len(linhas[-1]) == 1 and len(linhas[-2]) >= 3:
        if draw.textlength(" ".join(w for w, _ in [linhas[-2][-1]] + linhas[-1]), font=fonte) <= largura:
            linhas[-1].insert(0, linhas[-2].pop())
    return linhas


def _layout(d, g, tam):
    f1, f2 = _fonte(900, tam), _fonte(800, int(tam * 0.78))
    larg = 1080 - 2 * MARGEM
    blocos = [(_quebrar(d, _marcar(g["texto"], g["destaque"], BRANCO), f1, larg), f1, 1.22)]
    if g.get("complemento"):
        blocos.append((_quebrar(d, _marcar(g["complemento"], g["destaque"], CIANO), f2, larg), f2, 1.25))
    if g.get("cta"):  # chamada para a legenda, em maiúsculas, com "LEGENDA" em amarelo
        blocos.append((_quebrar(d, _marcar(g["cta"].upper(), ["legenda"], BRANCO), f2, larg), f2, 1.25))
    alturas = [len(l) * int(f.size * e) for l, f, e in blocos]
    folga = int(tam * 0.7)
    return blocos, alturas, sum(alturas) + folga * (len(blocos) - 1), folga


def _sprite(palavra, fonte, cor):
    pad = 14
    d0 = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    tw = int(d0.textlength(palavra, font=fonte)) + 2 * pad
    th = int(fonte.size * 1.35) + 2 * pad
    img = Image.new("RGBA", (tw, th), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.text((pad, pad + 6), palavra, font=fonte, fill=(0, 0, 0, 150), stroke_width=6, stroke_fill=(0, 0, 0, 150))
    d.text((pad, pad), palavra, font=fonte, fill=cor + (255,))
    return np.asarray(img).astype(np.float32) / 255.0, pad


def sprites(g, tempos, W=1080, H=1920, centro=0.48):
    """Lista de palavras com posição, recorte e instante em que são ditas.
    `tempos`: [[palavra, ini, fim], ...] na ordem texto + complemento (mesma divisão por espaços)."""
    d = ImageDraw.Draw(Image.new("RGBA", (1, 1)))
    tam = 86 if len(g["texto"]) < 130 else 76
    while True:
        blocos, alturas, total, folga = _layout(d, g, tam)
        if total <= ALTURA_MAX or tam <= 60:
            break
        tam -= 4
    y = int(H * centro - total / 2)
    out, k = [], 0
    for b, ((linhas, f, esp), alt) in enumerate(zip(blocos, alturas)):
        for lin in linhas:
            larg_lin = sum(d.textlength(w + " ", font=f) for w, _ in lin) - d.textlength(" ", font=f)
            x = (W - larg_lin) / 2
            for w, cor in lin:
                spr, pad = _sprite(w, f, cor)
                ini = tempos[k][1] if k < len(tempos) else 0.0
                out.append({"bloco": b, "ini": float(ini), "x": int(x) - pad, "y": int(y) - pad, "img": spr})
                x += d.textlength(w + " ", font=f)
                k += 1
            y += int(f.size * esp)
        y += folga
    return out


def _suave(x):
    x = min(1.0, max(0.0, x))
    return x * x * (3 - 2 * x)


def desenhar(quadro, spr, t, fade=1.0, antecip=0.04):
    """Coloca as palavras no quadro (float32 H×W×3) no instante t. O complemento e a chamada para a legenda só aparecem perto da hora de serem falados."""
    H, W = quadro.shape[:2]
    ini_bloco = {}
    for s in spr:
        ini_bloco[s["bloco"]] = min(ini_bloco.get(s["bloco"], 1e9), s["ini"])
    for s in spr:
        a = DIM + (1 - DIM) * _suave((t - (s["ini"] - antecip)) / 0.10)
        if s["bloco"] >= 1:
            a *= _suave((t - (ini_bloco[s["bloco"]] - 0.35)) / 0.30)
        a *= fade
        if a <= 0.004:
            continue
        h, w = s["img"].shape[:2]
        x0, y0 = s["x"], s["y"]
        xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
        if xb <= xa or yb <= ya:
            continue
        rec = s["img"][ya - y0:yb - y0, xa - x0:xb - x0]
        al = rec[..., 3:4] * a
        quadro[ya:yb, xa:xb] = quadro[ya:yb, xa:xb] * (1 - al) + rec[..., :3] * al
    return quadro
