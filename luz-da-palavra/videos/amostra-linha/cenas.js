// Amostra dos personagens em traço (linha nítida, sem rosto) — não é um vídeo da fila.
const AL_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.85) };
const AL_EST = fundoProfundo(151, 520);
const AL_CHAO = (() => { const r = prng(153), L = []; for (let k = 0; k < 2400; k++) L.push([-300 + r() * 1700, 1500 + Math.pow(r(), 1.5) * 420, r()]); return L; })();
const AL_MONTE = (() => { const r = prng(155), L = []; for (let k = 0; k < 2500; k++) { const X = -400 + r() * 1900, top = 1080 + 90 * Math.sin(X * 0.004) + 50 * Math.sin(X * 0.011), Y = top + Math.pow(r(), 1.8) * 420; L.push([X, Y, r(), Y - top < 6]); } return L; })();
function AL_cenario(nv, x, i, t, cam, quente = 0) {
  i = desenharFundo(nv, AL_EST, t, cam, LUZ.luz, 0.8, i);
  brilhoP(x, 540, 1150, 1000, LUZS.ambar, 0.12 + 0.1 * quente);
  for (const [X, Y, v, cr] of AL_MONTE) { const [sx, sy, k] = projP(cam, X, Y, 2.4); if (sx < -20 || sx > 1100) continue; nv.ponto(i++, sx, sy, 0.75, 0.6, 0.55, cr ? 0.35 : 0.06 + 0.08 * v, 2 + 2 * k); }
  for (const [X, Y, v] of AL_CHAO) { const z = Math.max(0.6, 1 + (1600 - Y) / 600), [sx, sy, k] = projP(cam, X, Y, z); if (sx < -20 || sx > 1100) continue; nv.ponto(i++, sx, sy, 0.85, 0.7, 0.5, 0.06 + 0.1 * v, 2 + 2 * k); }
  return i;
}
// traço simples na camada nítida (lança, correia da funda)
function AL_traco(x, pts, rgb, lw, a = 1) { const y = x._texto || x; if (x._texto) y._usado = true; y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.lineCap = "round"; y.lineJoin = "round"; y.strokeStyle = `rgba(${rgb},${a})`; y.lineWidth = lw; y.shadowColor = `rgba(${rgb},0.7)`; y.shadowBlur = 10; y.beginPath(); pts.forEach(([px, py], k) => (k ? y.lineTo(px, py) : y.moveTo(px, py))); y.stroke(); y.shadowBlur = 0; y.stroke(); y.restore(); }
function AL_elipse(x, cx, cy, rx, ry, rgb, lw, fundo = "8,11,28") { const y = x._texto || x; if (x._texto) y._usado = true; y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.beginPath(); y.ellipse(cx, cy, rx, ry, 0, 0, 6.283); y.fillStyle = `rgba(${fundo},0.92)`; y.fill(); y.strokeStyle = `rgba(${rgb},1)`; y.lineWidth = lw; y.shadowColor = `rgba(${rgb},0.7)`; y.shadowBlur = 10; y.stroke(); y.shadowBlur = 0; y.stroke(); y.beginPath(); y.ellipse(cx, cy, rx * 0.25, ry * 0.25, 0, 0, 6.283); y.stroke(); y.restore(); }

CENAS.funda = (el, c, B) => {
  const tG = B("gira"), tS = B("solta"), tA = B("acerta");
  const TV = telaGPU(el, c, AL_FUNDO), nv = TV.nuvem(40000);
  TV.quadro((x, t) => {
    const [tx, ty] = FIS.tremor(t, tA, 14), cam = { x: 540 + tx, y: 1000 + ty, zoom: 1, foco: 1 };
    let i = AL_cenario(nv, x, 0, t, cam);
    // Golias: escudo no braço de trás, lança na mão da frente; recua quando a pedra acerta
    const recua = PT.ss((t - tA) / 0.6), gpose = poseMix({ ...POSES.de_pe, braco: [[0.6, 0.9], [0.35, 0.9]] }, { tronco: -0.3, cabeca: -0.55, braco: [[0.2, 0.5], [-0.4, 0.4]], perna: [[-0.2, 0], [0.15, 0]] }, recua);
    const gol = personagem(x, t, gpose, { tipo: "golias", x: 860, chao: 1500, H: 900, dir: -1, cam, z: 1.35 });
    const [mx2, my2] = gol.maos[1], k2 = gol.escala; AL_traco(x, [[mx2 + 40 * k2 * (1 - recua), my2 + 380 * k2], [mx2 - 30 * k2 * (1 - recua) - 120 * recua, my2 - 520 * k2]], "255,140,128", 4);
    const [ex, ey] = gol.maos[0]; AL_elipse(x, ex - 10, ey, 70 * k2, 95 * k2, "255,140,128", 3);
    // Davi: de pé -> gira a funda (o giro acelera) -> solta
    const pega = PT.ss((t - c.ini - 0.2) / 0.6), solta = PT.ss((t - tS + 0.05) / 0.25), giro = Math.pow(Math.max(0, t - tG + 0.4), 1.6) * 9;
    let pose = poseMix(POSES.de_pe, POSES.funda(giro), pega); pose = poseMix(pose, POSES.lanca, solta);
    const dav = personagem(x, t, pose, { tipo: "davi", x: 330, chao: 1500, H: 520, dir: 1, cam, z: 1 });
    const [mx, my] = dav.maos[1], kk = dav.escala;
    if (solta < 0.5 && pega > 0.3) { const px = mx + Math.cos(giro) * 75 * kk, py = my + Math.sin(giro) * 42 * kk; AL_traco(x, [[mx, my], [px, py]], "255,236,200", 2.5); discoP(x, px, py, 8 * kk, "255,246,230", 1); for (let k = 1; k < 10; k++) { const g2 = giro - k * 0.2; discoP(x, mx + Math.cos(g2) * 75 * kk, my + Math.sin(g2) * 42 * kk, 5 * (1 - k / 10), LUZS.luz, 0.5 * (1 - k / 10)); } }
    const voo = PT.cl((t - tS) / Math.max(0.4, tA - tS));
    if (voo > 0 && voo < 1) { const [hx, hy] = gol.cabeca, [px, py] = FIS.arco(mx, my, hx, hy, voo, 160); for (let k = 0; k < 12; k++) { const [qx, qy] = FIS.arco(mx, my, hx, hy, Math.max(0, voo - k * 0.025), 160); discoP(x, qx, qy, 8 * (1 - k / 12), LUZS.luz, 0.8 * (1 - k / 12)); } brilhoP(x, px, py, 50, LUZS.luz, 0.8); }
    const hit = PT.jan(t, tA - 0.05, tA + 0.2, 0.05, 0.6); if (hit > 0.01) { const [hx, hy] = gol.cabeca; brilhoP(x, hx, hy, 260 * hit, "255,250,240", 0.9 * hit); anelP(x, hx, hy, 30 + 220 * (1 - hit), LUZS.luz, hit, 4); }
    nv.total(i);
  });
};

CENAS.oracao = (el, c, B) => {
  const tC = B("chega"), tJ = B("ajoelha"), tO = B("orar");
  const TV = telaGPU(el, c, AL_FUNDO), nv = TV.nuvem(40000);
  const SOBE = (() => { const r = prng(157); return Array.from({ length: 300 }, () => [r() * 2 - 1, r(), r()]); })();
  TV.quadro((x, t) => {
    const cam = { x: 540, y: 1000, zoom: 1.05, foco: 1 }, para = PT.ss((t - tC + 0.2) / 0.5), anda = PT.ss((t - c.ini) / Math.max(0.5, tC - c.ini + 0.3)), quente = PT.ss((t - tO + 0.3) / 1.0);
    let i = AL_cenario(nv, x, 0, t, cam, quente);
    let pose = poseMix(POSES.andar(t * 7.5, 1 - para), POSES.de_pe, para);
    pose = poseMix(pose, POSES.ajoelhado, FIS.chegar(t, tJ - 0.15, 0.9));
    pose = poseMix(pose, POSES.orando, PT.ss((t - tO + 0.4) / 0.8));
    const [lx, ly] = projP(cam, 540, 900, 1.6); brilhoP(x, lx, ly, 500, LUZS.ambar, 0.12 + 0.25 * quente);
    const p = personagem(x, t, pose, { tipo: "pessoa", x: PT.lerp(120, 520, anda), chao: 1500, H: 580, dir: 1, cam, z: 1, cor: mixCor([0.85, 0.9, 1], [1, 0.85, 0.55], quente) });
    if (quente > 0.01) { const [hx, hy] = p.cabeca; for (const [u, f, s] of SOBE) { const d = ((t - tO) * (50 + 60 * s) + f * 500) % 500; nv.ponto(i++, hx + u * 120, hy - 40 - d, LUZ.luz[0], LUZ.luz[1], LUZ.luz[2], 0.5 * quente * (1 - d / 500) * s, 2 + 2 * s); } }
    nv.total(i);
  });
};

// 3. galeria: todos os tipos (Jesus, mulher, homem, criança) — os dois da frente caminham
CENAS.galeria = (el, c, B) => {
  const TV = telaGPU(el, c, AL_FUNDO), nv = TV.nuvem(40000);
  TV.quadro((x, t) => {
    const cam = { x: 540, y: 1000, zoom: 1, foco: 1 };
    let i = AL_cenario(nv, x, 0, t, cam, 0.5);
    const anda = t - c.ini;
    personagem(x, t, POSES.de_pe, { tipo: "mulher", x: 170, chao: 1420, H: 470, dir: 1, cam, z: 1, fase: 1 });
    personagem(x, t, POSES.segurando, { tipo: "homem", x: 880, chao: 1420, H: 500, dir: -1, cam, z: 1, fase: 2 });
    personagem(x, t, POSES.andar(anda * 6.5, 1), { tipo: "jesus", x: 420 + anda * 30, chao: 1560, H: 600, dir: 1, cam, z: 1, fase: 3 });
    personagem(x, t, POSES.andar(anda * 7.5 + 1.5, 1), { tipo: "crianca", x: 640 + anda * 30, chao: 1580, H: 330, dir: 1, cam, z: 1, fase: 4 });
    nv.total(i);
  });
};
