"""Cena com paralaxe: imagem + mapa de profundidade + câmera em órbita + poeira de luz.

Usada pelos ganchos curtos e pelo vídeo completo. O movimento é periódico em `periodo` segundos
(emenda invisível no loop). O cálculo é feito numa resolução menor (`escala`, perto da resolução real
da imagem gerada, 768 px de largura) e ampliado no fim, o que acelera bastante o render.
"""
import cv2
import numpy as np


class Paralaxe:
    def __init__(self, img, prof, W, H, periodo, semente=0, escala=0.72, faixa_y=0.5, faixa_forca=0.34, particulas=70):
        self.W, self.H, self.T, self.k = W, H, periodo, escala
        cw, ch = int(W * escala), int(H * escala)
        self.cw, self.ch = cw, ch
        folga = 1.12
        fw, fh = int(cw * folga), int(ch * folga)
        self.foto = cv2.resize(cv2.cvtColor(cv2.imread(str(img)), cv2.COLOR_BGR2RGB), (fw, fh), interpolation=cv2.INTER_LANCZOS4)
        p = cv2.imread(str(prof), cv2.IMREAD_GRAYSCALE).astype(np.float32)
        p = cv2.GaussianBlur(cv2.resize(p, (fw, fh), interpolation=cv2.INTER_CUBIC), (0, 0), 6 * escala)
        p = (p - p.min()) / max(p.max() - p.min(), 1e-6) - 0.5  # -0.5 (longe) … +0.5 (perto)
        self.ox, self.oy = (fw - cw) / 2, (fh - ch) / 2
        self.prof = np.ascontiguousarray(p[int(self.oy):int(self.oy) + ch, int(self.ox):int(self.ox) + cw])
        self.gx, self.gy = np.meshgrid(np.arange(cw, dtype=np.float32), np.arange(ch, dtype=np.float32))
        # escurece a faixa do texto e as bordas
        yy = (np.arange(ch, dtype=np.float32) / ch)[:, None]
        xx = (np.arange(cw, dtype=np.float32) / cw)[None, :]
        faixa = 0.08 + faixa_forca * np.exp(-(((yy - faixa_y) / 0.26) ** 2))
        vinheta = 1 - 0.55 * (((xx - 0.5) * 1.5) ** 2 + ((yy - 0.5) * 1.1) ** 2)
        self.escuro = (np.clip(1 - faixa, 0, 1) * np.clip(vinheta, 0.35, 1))[..., None]
        # poeira de luz: cada partícula dá um número inteiro de voltas no período
        rng = np.random.default_rng(semente)
        self.n = particulas
        self.px, self.py = rng.uniform(0, cw, particulas), rng.uniform(0, ch, particulas)
        self.pz = rng.uniform(0.2, 1.0, particulas)
        self.pr = np.maximum(1, ((3 + 9 * self.pz) * escala).astype(int))
        self.pvel = rng.integers(1, 3, particulas)
        self.pf = rng.uniform(0, 2 * np.pi, particulas)

    def quadro(self, t):
        """RGB float32 (H, W, 3) no instante t."""
        cw, ch, k = self.cw, self.ch, self.k
        fase = 2 * np.pi * (t / self.T)
        camx, camy = 26 * k * np.sin(fase), 16 * k * np.cos(fase)
        zoom = 1 + 0.025 * (1 - np.cos(fase)) / 2
        sx = (self.gx - cw / 2) / zoom + cw / 2
        sy = (self.gy - ch / 2) / zoom + ch / 2
        mapx = (sx + self.ox - camx * self.prof * 2.0).astype(np.float32)
        mapy = (sy + self.oy - camy * self.prof * 2.0).astype(np.float32)
        q = cv2.remap(self.foto, mapx, mapy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT).astype(np.float32) / 255.0
        q *= 1 + 0.05 * np.sin(fase + 1.0)  # luz respirando
        q *= self.escuro
        luz = np.zeros((ch, cw, 3), np.float32)
        for i in range(self.n):
            y = (self.py[i] - self.pvel[i] * ch * (t / self.T)) % ch
            x = (self.px[i] + 40 * k * self.pz[i] * np.sin(fase * self.pvel[i] + self.pf[i]) - camx * (self.pz[i] - 0.4) * 2) % cw
            br = 0.5 + 0.5 * np.sin(fase * 2 * self.pvel[i] + self.pf[i])
            cv2.circle(luz, (int(x), int(y)), int(self.pr[i]), (1.0 * br, 0.86 * br, 0.5 * br), -1, cv2.LINE_AA)
        q += cv2.GaussianBlur(luz, (0, 0), 4 * k) * 0.55
        return cv2.resize(q, (self.W, self.H), interpolation=cv2.INTER_CUBIC)
