// Amostra dos bonecos de linha (esqueleto animado) — não é um vídeo da fila.
const BA_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.85) };
const BA_EST = fundoProfundo(141, 520);
const BA_CHAO = (() => { const r = prng(143), L = []; for (let k = 0; k < 2400; k++) L.push([-300 + r() * 1700, 1500 + Math.pow(r(), 1.5) * 420, r()]); return L; })();
const BA_MONTE = (() => { const r = prng(145), L = []; for (let k = 0; k < 2500; k++) { const X = -400 + r() * 1900, top = 1080 + 90 * Math.sin(X * 0.004) + 50 * Math.sin(X * 0.011), Y = top + Math.pow(r(), 1.8) * 420; L.push([X, Y, r(), Y - top < 6]); } return L; })();
function BA_cenario(nv, x, i, t, cam, quente = 0) {
  i = desenharFundo(nv, BA_EST, t, cam, LUZ.luz, 0.8, i);
  brilhoP(x, 540, 1150, 1000, LUZS.ambar, 0.12 + 0.1 * quente);
  for (const [X, Y, v, cr] of BA_MONTE) { const [sx, sy, k] = projP(cam, X, Y, 2.4); if (sx < -20 || sx > 1100) continue; nv.ponto(i++, sx, sy, 0.75, 0.6, 0.55, cr ? 0.35 : 0.06 + 0.08 * v, 2 + 2 * k); }
  for (const [X, Y, v] of BA_CHAO) { const z = Math.max(0.6, 1 + (1600 - Y) / 600), [sx, sy, k] = projP(cam, X, Y, z); if (sx < -20 || sx > 1100) continue; nv.ponto(i++, sx, sy, 0.85, 0.7, 0.5, 0.06 + 0.1 * v, 2 + 2 * k); }
  return i;
}

// 1. Davi gira a funda e solta a pedra; o gigante (boneco de linha, ao fundo) é atingido
CENAS.funda = (el, c, B) => {
  const tG = B("gira"), tS = B("solta"), tA = B("acerta");
  const TV = telaGPU(el, c, BA_FUNDO), nv = TV.nuvem(60000);
  TV.quadro((x, t) => {
    const [tx, ty] = FIS.tremor(t, tA, 14), cam = { x: 540 + tx, y: 1000 + ty, zoom: 1, foco: 1 };
    let i = BA_cenario(nv, x, 0, t, cam);
    // gigante ao fundo, em vermelho; recua quando a pedra acerta
    const recua = PT.ss((t - tA) / 0.6), gig = boneco(nv, x, i, t, poseMix(POSES.de_pe, { ...POSES.de_pe, tronco: -0.35, cabeca: -0.6 }, recua), { x: 880, chao: 1500, H: 980, dir: -1, tipo: "gigante", cor: [0.95, 0.45, 0.45], a: 0.85, cam, z: 1.35 });
    i = gig.i;
    // Davi: de pé -> gira (o giro acelera) -> solta (braço vai para a frente)
    const pega = PT.ss((t - c.ini - 0.2) / 0.6), solta = PT.ss((t - tS + 0.05) / 0.25), giro = Math.pow(Math.max(0, t - tG + 0.4), 1.6) * 9;
    let pose = poseMix(POSES.de_pe, POSES.funda(giro), pega); pose = poseMix(pose, POSES.lanca, solta);
    const dav = boneco(nv, x, i, t, pose, { x: 330, chao: 1500, H: 520, dir: 1, cor: LUZ.ouro, cam, z: 1 });
    i = dav.i;
    const [mx, my] = dav.maos[1], kk = dav.escala;
    // a funda: correia da mão até a bolsa, que gira em volta da mão; depois da soltura só a pedra voa
    if (solta < 0.5 && pega > 0.3) { const px = mx + Math.cos(giro) * 70 * kk, py = my + Math.sin(giro) * 40 * kk; linhaP(x, mx, my, px, py, LUZS.luz, 0.9, 3); discoP(x, px, py, 7 * kk, "255,246,230", 1); for (let k = 1; k < 10; k++) { const g2 = giro - k * 0.2; discoP(x, mx + Math.cos(g2) * 70 * kk, my + Math.sin(g2) * 40 * kk, 5 * (1 - k / 10), LUZS.luz, 0.5 * (1 - k / 10)); } }
    const voo = PT.cl((t - tS) / Math.max(0.4, tA - tS));
    if (voo > 0 && voo < 1) { const [hx, hy] = gig.cabeca, [px, py] = FIS.arco(mx, my, hx, hy, voo, 160); for (let k = 0; k < 12; k++) { const [qx, qy] = FIS.arco(mx, my, hx, hy, Math.max(0, voo - k * 0.025), 160); discoP(x, qx, qy, 8 * (1 - k / 12), LUZS.luz, 0.8 * (1 - k / 12)); } brilhoP(x, px, py, 50, LUZS.luz, 0.8); }
    const hit = PT.jan(t, tA - 0.05, tA + 0.2, 0.05, 0.6); if (hit > 0.01) { const [hx, hy] = gig.cabeca; brilhoP(x, hx, hy, 260 * hit, "255,250,240", 0.9 * hit); anelP(x, hx, hy, 30 + 220 * (1 - hit), LUZS.luz, hit, 4); }
    nv.total(i);
  });
};

// 2. alguém chega andando, para e se ajoelha para orar; a luz esquenta
CENAS.oracao = (el, c, B) => {
  const tC = B("chega"), tJ = B("ajoelha"), tO = B("orar");
  const TV = telaGPU(el, c, BA_FUNDO), nv = TV.nuvem(60000);
  const SOBE = (() => { const r = prng(147); return Array.from({ length: 300 }, () => [r() * 2 - 1, r(), r()]); })();
  TV.quadro((x, t) => {
    const cam = { x: 540, y: 1000, zoom: 1.05, foco: 1 }, para = PT.ss((t - tC + 0.2) / 0.5), anda = PT.ss((t - c.ini) / Math.max(0.5, tC - c.ini + 0.3));
    const quente = PT.ss((t - tO + 0.3) / 1.0);
    let i = BA_cenario(nv, x, 0, t, cam, quente);
    const X = PT.lerp(120, 520, anda), fase = t * 7.5;
    let pose = poseMix(POSES.andar(fase, 1 - para), POSES.de_pe, para);
    pose = poseMix(pose, POSES.ajoelhado, FIS.chegar(t, tJ - 0.15, 0.9));
    pose = poseMix(pose, POSES.orando, PT.ss((t - tO + 0.4) / 0.8));
    const [lx, ly] = projP(cam, 540, 900, 1.6); brilhoP(x, lx, ly, 500, LUZS.ambar, 0.12 + 0.25 * quente);
    const p = boneco(nv, x, 0 + i, t, pose, { x: X, chao: 1500, H: 560, dir: 1, cor: mixCor([0.75, 0.82, 1], LUZ.ouro, quente), cam, z: 1, passoY: 0 });
    i = p.i;
    if (quente > 0.01) { const [hx, hy] = p.cabeca; for (const [u, f, s] of SOBE) { const d = ((t - tO) * (50 + 60 * s) + f * 500) % 500; nv.ponto(i++, hx + u * 120, hy - 40 - d, LUZ.luz[0], LUZ.luz[1], LUZ.luz[2], 0.5 * quente * (1 - d / 500) * s, 2 + 2 * s); } }
    nv.total(i);
  });
};
