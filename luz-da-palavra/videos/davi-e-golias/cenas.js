// Cenas do vídeo "Davi e Golias" (1 Samuel 17) — Luz da Palavra, pontos de luz na GPU.
// Retenção: quadro 0 = o gigante enorme contra o céu do entardecer e Davi pequeno na frente; gancho
// emocional; laço aberto ("presta atenção no que o Davi recusou") pago no detalhe (venceu com o que já
// sabia usar, dos dias com as ovelhas); capítulos I–III; armadura que cai, cinco pedras que sobem,
// a pedra em arco, o gigante que cai; pergunta única. Figuras: personagens em line art sem rosto (davi, golias).
// Fatos: 1 Sm 17:4 (seis côvados e um palmo ≈ 2,9 m), 17:16 (40 dias), 17:12–14 (o mais novo de oito),
// 17:17–18 (levar comida), 17:38–39 (armadura recusada), 17:40 (cinco seixos lisos), 17:45 (cf.), 17:49.

const DG_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.85) };
const DG_EST = fundoProfundo(111, 460);
const DG_D = (fn) => ({ desenho: (g, R) => { g.save(); g.translate(R * 0.04, R * 0.04); g.scale((R * 0.92) / 256, (R * 0.92) / 256); g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineCap = "round"; fn(g); g.restore(); } });
const DG_F = {
  ovelha: formaPontos({ desenho: (g, R) => { g.save(); g.scale(R / 256, R / 256); g.fillStyle = "#fff"; g.strokeStyle = "#fff"; for (const [x, y, r] of [[100, 120, 34], [134, 108, 36], [168, 120, 32], [120, 146, 32], [156, 148, 30], [84, 140, 24], [186, 140, 22]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); } g.beginPath(); g.ellipse(212, 118, 20, 15, -0.3, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(206, 104, 7, 11, -0.9, 0, 6.283); g.fill(); g.lineWidth = 9; g.lineCap = "round"; for (const x of [100, 124, 152, 174]) { g.beginPath(); g.moveTo(x, 160); g.lineTo(x, 196); g.stroke(); } g.restore(); } }, 3500),
  pedra: formaPontos({ desenho: (g, R) => { g.beginPath(); g.ellipse(R / 2, R / 2, R * 0.42, R * 0.3, 0.2, 0, 6.283); g.fill(); } }, 900, { espessura: 0.15 }),
  texto40: formaTexto("40 DIAS", 6000, { fonte: "Cinzel", peso: 700, tam: 0.22 }),
};
const DG_GOL = [1, 0.55, 0.5], DG_DAV = [1, 0.86, 0.55];
// Golias em line art: escudo na mão de trás, espada na cintura, lança na mão da frente (ang: 0 = em pé)
const DG_PG = { tronco: 0.02, cabeca: 0.05, braco: [[-0.3, 0.75], [0.3, 1.15]], perna: [[-0.12, 0], [0.12, 0]] };
const DG_DESAFIO = { tronco: -0.08, cabeca: -0.25, braco: [[-0.3, 0.75], [2.1, 0.3]], perna: [[-0.2, 0], [0.22, 0]] };
// ameaça: a lança apontada para a frente e para cima (ang ≈ 1,15)
const DG_AMEACA = { tronco: 0.05, cabeca: 0.1, braco: [[-0.3, 0.75], [1.3, 0.15]], perna: [[-0.2, 0], [0.2, 0]] };
function DG_golias(x, t, pose, o) {
  const H = o.H, cor = o.cor || DG_GOL, a = o.a ?? 1;
  const inf = personagem(x, t, pose, { tipo: "golias", x: o.x, chao: o.chao, H, dir: o.dir ?? -1, cam: o.cam, z: o.z, a, rot: o.rot, fase: 7, cor,
    atras: (y, f) => objetoLinha(x, "escudo", { mao: f.maos[0], H, k: f.escala, d: f.d, cor, a: a * 0.85, r: 0.2 }) });
  objetoLinha(x, "espada", { mao: [inf.quadril[0] - inf.d * 0.03 * H * inf.escala, inf.quadril[1] - 0.02 * H * inf.escala], H, k: inf.escala, d: inf.d, cor, a, ang: 2.7 + (o.rot || 0) * inf.d });
  if (o.lanca !== false) objetoLinha(x, "lanca", { mao: inf.maos[1], H, k: inf.escala, d: inf.d, cor, a, ang: (o.ang ?? 0.05) + (o.rot || 0) * inf.d });
  return inf;
}
// Davi em line art: cajado na mão de trás (o.cajado), funda na mão da frente (o.funda: null = pendurada, número = girando)
function DG_davi(x, t, pose, o) {
  const H = o.H, a = o.a ?? 1, cor = o.cor || DG_DAV;
  const inf = personagem(x, t, pose, { tipo: "davi", x: o.x, chao: o.chao, H, dir: o.dir ?? 1, cam: o.cam, z: o.z, a, fase: 3, cor,
    atras: o.cajado ? (y, f) => objetoLinha(x, "cajado", { mao: f.maos[0], H, k: f.escala, d: f.d, cor, a: a * o.cajado }) : null });
  if (o.funda !== undefined && o.funda !== false) objetoLinha(x, "funda", { mao: inf.maos[1], H, k: inf.escala, d: inf.d, cor, a: a * (o.aFunda ?? 1), giro: o.funda });
  return inf;
}
// ponta da lança (para o brilho)
const DG_ponta = (inf, ang) => [inf.maos[1][0] + Math.sin(ang) * inf.d * 0.8 * 0.95 * inf.H * inf.escala, inf.maos[1][1] - Math.cos(ang) * 0.8 * 0.95 * inf.H * inf.escala];
// vale de Elá: céu do entardecer, dois montes com acampamentos e fogueiras, chão do vale
const DG_MONTES = (() => { const r = prng(113), L = []; for (let k = 0; k < 4200; k++) { const lado = k % 2 ? 1 : -1, X = lado < 0 ? -700 + r() * 1150 : 630 + r() * 1150, cx = lado < 0 ? -60 : 1140, top = 900 + Math.pow((X - cx) / 520, 2) * 220, Y = top + Math.pow(r(), 1.8) * 420; L.push([X, Y, 2.5, r(), Y - top < 8]); } return L; })();
const DG_FOGOS = [[-260, 905, 2.5], [10, 902, 2.5], [230, 950, 2.5], [860, 955, 2.5], [1100, 902, 2.5], [1360, 940, 2.5]];
const DG_CHAO = (() => { const r = prng(115), L = []; for (let k = 0; k < 2600; k++) L.push([-500 + r() * 2100, 1300 + Math.pow(r(), 1.4) * 500, r()]); return L; })();
function DG_vale(nv, x, i, t, cam, o = {}) {
  const a = o.a ?? 1;
  i = desenharFundo(nv, DG_EST, t, cam, LUZ.luz, 0.6 * a, i);
  const [hx, hy] = projP(cam, 540, 930, 2.6); brilhoP(x, hx, hy, 1100, LUZS.ambar, 0.18 * a); brilhoP(x, hx, hy + 60, 600, "200,90,110", 0.12 * a);
  for (const [X, Y, z, v, crista] of DG_MONTES) { if (i >= nv.n) break; const [sx, sy, k] = projP(cam, X, Y, z); if (sx < -20 || sx > 1100 || sy > 1950) continue; nv.ponto(i++, sx, sy, 0.75, 0.6, 0.55, a * (crista ? 0.4 : 0.08 + 0.1 * v), (crista ? 3 : 2) * k * 1.6); }
  DG_FOGOS.forEach(([X, Y, z], k) => { const [sx, sy, kk] = projP(cam, X, Y, z), f = 0.8 + 0.2 * Math.sin(t * 9 + k * 2); if (sx < -40 || sx > 1120) return; brilhoP(x, sx, sy, 40 * kk * f, LUZS.ambar, 0.6 * a); discoP(x, sx, sy, 3 * kk, "255,230,180", a); });
  for (const [X, Y, v] of DG_CHAO) { if (i >= nv.n) break; const z = Math.max(0.6, 1 + (1500 - Y) / 600), [sx, sy, k] = projP(cam, X, Y, z); if (sx < -20 || sx > 1100 || sy > 1950) continue; nv.ponto(i++, sx, sy, 0.8, 0.66, 0.5, a * (0.05 + 0.1 * v), 2 + 2 * k); }
  return i;
}
const DG_poeira = (() => { const r = prng(117); return Array.from({ length: 260 }, () => [r(), r(), r()]); })();
function DG_ar(nv, i, t, a = 1) { for (const [u, v, s] of DG_poeira) { const xx = ((u * 1200 + t * (10 + 20 * s)) % 1200) - 60, yy = 300 + v * 1300 + Math.sin(t * 0.5 + u * 9) * 20; nv.ponto(i++, xx, yy, 1, 0.8, 0.6, 0.12 * a * s, 2 + 3 * s); } return i; }

// =============== 1. abertura: o gigante contra o céu, Davi pequeno na frente ===============
CENAS.abertura = (el, c, B) => {
  const tG = B("gigante"), tH = B("historia"), tL = B("laco");
  mostrarGancho(tH + 0.3);
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(60000);
  const CAM = cameraProf([[0, { x: 560, y: 1000, zoom: 1.12 }], [c.fim + 0.5, { x: 540, y: 980, zoom: 0.98 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), brilha = PT.ss((t - tL + 0.3) / 0.8);
    let i = DG_vale(nv, x, 0, t, cam);
    i = DG_ar(nv, i, t);
    const [gx, gy, gk] = projP(cam, 720, 1100, 1.1); brilhoP(x, gx, gy, 700 * gk, "255,110,100", 0.12);
    DG_golias(x, t, DG_AMEACA, { x: 720, chao: 1500, H: 900, z: 1.1, cam, ang: 1.15 + 0.03 * Math.sin(t * 0.7) });
    const [dx, dy, dk] = projP(cam, 300, 1300, 1); brilhoP(x, dx, dy, (140 + 160 * brilha) * dk, LUZS.ambar, 0.3 + 0.3 * brilha);
    DG_davi(x, t, { ...POSES.de_pe, cabeca: -0.3 }, { x: 300, chao: 1440, H: 320, z: 1, cam, funda: null, cor: mixCor(DG_DAV, LUZ.luz, brilha) });
    nv.total(i);
  });
};

// =============== 2. o gigante: o vale de Elá, os dois exércitos, Golias (quase 3 m), 40 dias ===============
const DG_TROPA = [[-120, -1], [0, -1], [120, -1], [240, -1], [860, 1], [980, 1], [1100, 1], [1220, 1]].map(([X, lado]) => { const cx = lado < 0 ? -60 : 1140; return [X, 900 + Math.pow((X - cx) / 520, 2) * 220, lado]; });
CENAS.gigante = (el, c, B) => {
  const tE = B("ela"), tG = B("golias"), tM = B("metros"), tQ = B("quarenta"), tp = tempoPalavras(c), tIs = tp("israel"), tFi = tp("filisteus");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 880, zoom: 0.8 }], [tG - 0.3, { x: 560, y: 960, zoom: 0.9 }], [tG + 1.0, { x: 620, y: 1080, zoom: 1.35 }], [tQ - 0.3, { x: 620, y: 1080, zoom: 1.4 }], [c.fim + 0.5, { x: 600, y: 1000, zoom: 1.0 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), aG = FIS.chegar(t, tG - 0.4, 0.8), med = PT.jan(t, tM - 0.2, tQ - 0.4, 0.4, 0.4), q = PT.jan(t, tQ - 0.2, c.fim, 0.4, 0.5), des = PT.ss((t - tQ + 0.2) / 0.7);
    let i = DG_vale(nv, x, 0, t, cam);
    // os dois exércitos nos montes (Israel à esquerda, filisteus à direita)
    DG_TROPA.forEach(([X, Y, lado], k) => { const ap = PT.ss((t - (lado < 0 ? tIs : tFi) + 0.3) / 0.6); if (ap < 0.01) return; const inf = personagem(x, t, POSES.de_pe, { tipo: lado < 0 ? "pessoa" : "homem", x: X, chao: Y + 4, H: 230, dir: -lado, cam, z: 2.5, a: 0.75 * ap, fase: k, vida: true });
      objetoLinha(x, "lanca", { mao: inf.maos[1], H: 230, k: inf.escala, d: inf.d, a: 0.75 * ap, cor: lado < 0 ? [0.86, 0.9, 1] : [0.95, 0.8, 0.7] }); });
    const H = 460 * Math.max(0.01, Math.min(1.05, aG));
    if (aG > 0.01) DG_golias(x, t, poseMix(DG_PG, DG_DESAFIO, des), { x: 640, chao: 1420, H, z: 1.25, cam, a: Math.min(1, aG), ang: 0.05 + 0.25 * des });
    // régua de altura ao lado dele
    if (med > 0.01) { const [x0, y0] = projP(cam, 800, 1420, 1.25), [, y1] = projP(cam, 800, 1420 - 460, 1.25), yy = y0 + (y1 - y0) * PT.ss((t - tM + 0.2) / 0.8); linhaP(x, x0, y0, x0, yy, LUZS.luz, med, 3); linhaP(x, x0 - 14, yy, x0 + 14, yy, LUZS.luz, med, 3); linhaP(x, x0 - 14, y0, x0 + 14, y0, LUZS.luz, med, 3); rotuloP(x, "≈ 2,9 m", x0 + 24, (y0 + y1) / 2, 44, "255,236,200", med, "left"); }
    if (q > 0.01) i = desenharForma(nv, DG_F.texto40, { cx: 540, cy: 430, esc: 560, cor: LUZ.ouro, borda: LUZ.luz, a: q, brilho: 0.8, t, i0: i });
    nv.total(i);
  });
};

// =============== 3. o pastor: Davi chega trazendo comida para os irmãos e diz "eu vou" ===============
CENAS.pastor = (el, c, B) => {
  const tR = B("rapaz"), tD = B("davi"), tV = B("vou");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 420, y: 1060, zoom: 1.1 }], [tD, { x: 470, y: 1120, zoom: 1.35 }], [c.fim + 0.5, { x: 560, y: 1080, zoom: 1.2 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), anda = PT.ss((t - c.ini) / Math.max(1, tV - c.ini - 0.3)), X = PT.lerp(150, 470, anda), para = PT.ss((t - tV + 0.5) / 0.4), vira = PT.ss((t - tV + 0.2) / 0.4);
    let i = DG_vale(nv, x, 0, t, cam);
    i = DG_ar(nv, i, t);
    // o gigante ao fundo, apagado
    DG_golias(x, t, DG_PG, { x: 960, chao: 1360, H: 460, z: 2.2, cam, a: 0.4 });
    const [dx, dy, dk] = projP(cam, X, 1300, 1); brilhoP(x, dx, dy, 220 * dk, LUZS.ambar, 0.22 + 0.2 * PT.ss((t - tD) / 0.6));
    // andando com o pão na mão; em "vou" para, ergue o queixo e o pão some
    const pz = poseMix(poseMix(POSES.andar(t * 6.5, 0.9), POSES.de_pe, para), { ...POSES.de_pe, tronco: -0.05, cabeca: -0.2, braco: [[-0.25, 0.3], [0.25, 0.35]] }, vira);
    const carrega = { ...pz, braco: [pz.braco[0], [PT.lerp(0.55, pz.braco[1][0], vira), PT.lerp(1.1, pz.braco[1][1], vira)]] };
    const inf = DG_davi(x, t, carrega, { x: X, chao: 1450, H: 330, z: 1, cam, cor: mixCor(DG_DAV, LUZ.luz, vira) });
    if (vira < 0.99) objetoLinha(x, "pao", { mao: [inf.maos[1][0] + inf.d * 6, inf.maos[1][1] - 4], H: 330, k: inf.escala, d: inf.d, a: 1 - vira, cor: [1, 0.85, 0.6], r: 0.09 });
    if (vira > 0) brilhoP(x, dx, dy - 20 * dk, 340 * dk * vira, LUZS.luz, 0.22 * vira);
    nv.total(i);
  });
};

// =============== 4. a armadura: Saul veste Davi (capacete, couraça, espada), ele afunda; tira tudo ===============
CENAS.armadura = (el, c, B) => {
  const tA = B("armadura"), tT = B("tira"), tU = B("usei"), tp = tempoPalavras(c), tCap = tp("capacete"), tCou = tp("couraça"), tEs = tp("espada"), tPa = tp("passos");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(50000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1020, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 1000, zoom: 1.12 }]]);
  const PESO = { tronco: 0.16, cabeca: 0.35, braco: [[0.05, 0.12], [0.12, 0.12]], perna: [[-0.22, -0.32], [0.3, -0.45]] }, LIVRE = { tronco: -0.05, cabeca: -0.18, braco: [[-0.32, 0.3], [0.38, 0.4]], perna: [[-0.13, 0], [0.13, 0]] };
  const chegada = [tCap, tCou, tEs].map((tt) => tt - 0.35);
  TV.quadro((x, t) => {
    const cam = CAM(t), peso = PT.ss((t - tCou) / 0.8) * (1 - PT.ss((t - tT) / 0.5)), livre = PT.ss((t - tT) / 0.9), passos = PT.jan(t, tPa - 0.2, tT - 0.1, 0.3, 0.2), joga = PT.jan(t, tT - 0.1, tT + 0.7, 0.15, 0.4);
    let i = DG_vale(nv, x, 0, t, cam, { a: 0.6 });
    i = DG_ar(nv, i, t, 0.6);
    brilhoP(x, 540, 1060, 520, LUZS.ambar, 0.1 + 0.25 * livre);
    let pz = poseMix(POSES.de_pe, PESO, peso); pz = poseMix(pz, poseMix(POSES.andar(t * 3.2, 0.45), PESO, 0.6), passos); pz = poseMix(pz, LIVRE, livre); pz = poseMix(pz, POSES.bracos_abertos, 0.55 * joga);
    const inf = DG_davi(x, t, pz, { x: 540, chao: 1480, H: 720, z: 1, cam, cor: mixCor(mixCor(DG_DAV, [0.62, 0.58, 0.6], 0.55 * peso), LUZ.luz, 0.4 * livre) });
    const U = 720 * inf.escala, [cx, cy] = inf.cabeca, [ox, oy] = inf.ombro, [qx, qy] = inf.quadril, d = inf.d, AR = [0.78, 0.8, 0.88];
    // as peças voam até ele e, quando ele tira, caem em arco para os lados
    const alvo = [[cx, cy - 0.02 * U], [(ox + qx) / 2 + d * 0.005 * U, (oy + qy) / 2], [qx - d * 0.03 * U, qy - 0.02 * U]];
    alvo.forEach(([x0, y0], k) => {
      const ch = Math.min(1, FIS.chegar(t, chegada[k], 0.6)), cai = PT.ss((t - tT - k * 0.12) / 0.9); if (t < chegada[k]) return;
      const de = [x0 + (k - 1 || 1) * 380, y0 - 420], u2 = PT.ss((t - chegada[k]) / 0.6), [px, py] = cai > 0 ? FIS.arco(x0, y0, x0 + (k - 1 || 1) * 330, 1560, cai, 160) : [PT.lerp(de[0], x0, u2), PT.lerp(de[1], y0, u2)];
      const al = Math.min(1, ch * 1.5) * (1 - PT.ss((cai - 0.7) / 0.3)), rot = cai * (k - 1 || 1) * 2.2; if (al < 0.01) return;
      const y = x._texto; y.save(); y.translate(px, py); y.rotate(rot); y.translate(-px, -py);
      if (k === 0) { const R = 0.066 * U * 1.18, pts = []; for (let j = 0; j <= 16; j++) { const th = Math.PI + (j / 16) * Math.PI; pts.push([px + Math.cos(th) * R, py - 0.15 * R + Math.sin(th) * R * 1.05]); } pts.push([px + R * 1.12, py + 0.1 * R], [px - R * 1.12, py + 0.1 * R]);
        y.beginPath(); _curva(y, pts, true); y.fillStyle = `rgba(9,12,29,${0.94 * al})`; y.fill(); y.strokeStyle = `rgba(220,225,240,${al})`; y.lineWidth = Math.max(1.5, 0.0062 * U); y.shadowColor = "rgba(220,225,240,0.6)"; y.shadowBlur = 9; y.stroke(); y.shadowBlur = 0; y.stroke();
        y.beginPath(); y.moveTo(px - R * 1.1, py - 0.02 * R); y.lineTo(px + R * 1.1, py - 0.02 * R); y.lineWidth *= 0.6; y.stroke(); }
      if (k === 1) { const w = 0.085 * U, h = 0.19 * U, pts = [[px - w, py - h * 0.5], [px - w * 0.55, py - h * 0.62], [px + w * 0.55, py - h * 0.62], [px + w, py - h * 0.5], [px + w * 0.95, py + h * 0.2], [px + w * 0.7, py + h * 0.48], [px - w * 0.7, py + h * 0.48], [px - w * 0.95, py + h * 0.2]];
        y.beginPath(); _curva(y, pts, true); y.fillStyle = `rgba(9,12,29,${0.94 * al})`; y.fill(); y.strokeStyle = `rgba(220,225,240,${al})`; y.lineWidth = Math.max(1.5, 0.0062 * U); y.shadowColor = "rgba(220,225,240,0.6)"; y.shadowBlur = 9; y.stroke(); y.shadowBlur = 0; y.stroke();
        y.lineWidth *= 0.55; for (const v of [-0.15, 0.05, 0.25]) { y.beginPath(); y.moveTo(px - w * 0.85, py + v * h); y.quadraticCurveTo(px, py + (v + 0.06) * h, px + w * 0.85, py + v * h); y.stroke(); } }
      y.restore();
      if (k === 2) objetoLinha(x, "espada", { mao: [px, py], H: 720, k: inf.escala, d, a: al, cor: AR, ang: 2.7 + rot });
    });
    nv.total(i);
  });
};

// =============== 5. as pedras: o ribeiro corre; Davi escolhe cinco pedras lisas ===============
CENAS.pedras = (el, c, B) => {
  const tC = B("cinco"), tF = B("funda"), tp = tempoPalavras(c), tCj = tp("cajado");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(70000);
  const AG = (() => { const r = prng(119); return Array.from({ length: 2600 }, () => [r(), r(), r()]); })();
  const PED = (() => { const r = prng(121); return Array.from({ length: 22 }, (_, k) => [300 + r() * 720, 1220 + r() * 230, 0.6 + 0.6 * r(), r() * 3]); })();
  TV.quadro((x, t) => {
    const cam = { x: 540, y: 960, zoom: 1, foco: 1 }, levanta = PT.ss((t - tF + 0.8) / 0.7), cj = levanta;
    let i = desenharFundo(nv, DG_EST, t, cam, LUZ.luz, 0.5, 0);
    brilhoP(x, 540, 1300, 900, "70,110,200", 0.15);
    // a água corre da esquerda para a direita
    for (const [u, v, s] of AG) { const xx = ((u * 1300 + t * (60 + 60 * s)) % 1300) - 110, yy = 1150 + v * 330 + Math.sin(xx * 0.02 + t * 2 + v * 9) * 6; nv.ponto(i++, xx, yy, 0.5, 0.72, 1, 0.12 + 0.25 * s * v, 2 + 2 * v); }
    // a margem de terra à esquerda, onde ele se ajoelha
    for (const [u, v, s] of AG) { if (u > 0.4) continue; const xx = u * 1000 - 20, yy = 1150 - 6 + v * 18 - 0.2 * xx * 0.05; nv.ponto(i++, xx, yy, 0.8, 0.66, 0.5, 0.12 + 0.2 * s, 2 + 2 * v); }
    // Davi ajoelhado na margem pegando as pedras; levanta com o cajado e a funda
    const pega = { ...POSES.ajoelhado, tronco: 0.35, cabeca: 0.45, braco: [[0.2, 0.4], [0.55 + 0.15 * Math.sin(t * 2.2), 0.25]] };
    const inf = DG_davi(x, t, poseMix(pega, { ...POSES.de_pe, cabeca: -0.1 }, levanta), { x: 250, chao: 1160, H: 540, z: 1, cam, cajado: cj, funda: levanta > 0.3 ? null : undefined, aFunda: levanta });
    const bolsa = [inf.quadril[0] + inf.d * 0.06 * 560, inf.quadril[1] + 0.06 * 560];
    // pedras no leito; cinco sobem em cascata, ficam brilhando em arco e vão para a bolsa
    PED.forEach(([px, py, e, rot], k) => {
      const esc = 70 * e, escolhida = k < 5, sobe = escolhida ? FIS.cascata(t, tC - 0.2, k, 0.15, 0.7) : 0, [ax, ay] = [PT.lerp(px, 440 + k * 110, Math.min(1, sobe)), PT.lerp(py, 760 - 40 * Math.sin(k / 4 * Math.PI), sobe)];
      const fu = escolhida ? PT.ss((t - tF + 0.1 - k * 0.08) / 0.8) : 0, [fx, fy] = escolhida ? FIS.arco(ax, ay, bolsa[0], bolsa[1], fu, 120) : [ax, ay];
      if (escolhida && fu > 0.97) return;
      if (escolhida && sobe > 0.05) brilhoP(x, fx, fy, 70 * (1 - 0.5 * fu), LUZS.luz, 0.4 * Math.min(1, sobe));
      i = desenharForma(nv, DG_F.pedra, { cx: fx, cy: fy, esc: escolhida ? esc * (1 + 0.3 * Math.min(1, sobe)) * (1 - 0.6 * fu) : esc, rot, cor: escolhida && sobe > 0.05 ? mixCor([0.7, 0.72, 0.78], LUZ.luz, Math.min(1, sobe)) : [0.55, 0.58, 0.65], brilho: escolhida ? 0.7 + 0.5 * Math.min(1, sobe) : 0.5, t, i0: i });
    });
    nv.total(i);
  });
};

// =============== 6. "em nome do Senhor": frente a frente ===============
CENAS.nome = (el, c, B) => {
  const tE = B("espada"), tN = B("nome");
  mostrarVersiculo("Eu vou a ti em nome do Senhor dos Exércitos.", "cf. 1 Samuel 17:45", tN - 1.4, c.fim + 0.3, { y: 400, tam: 66, destaque: ["nome", "senhor"] });
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 620, y: 1000, zoom: 1.05 }], [tE + 0.8, { x: 700, y: 980, zoom: 1.15 }], [tN - 0.3, { x: 460, y: 1060, zoom: 1.15 }], [c.fim + 0.5, { x: 470, y: 1050, zoom: 1.22 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), nome = PT.ss((t - tN + 0.2) / 0.9), bri = PT.jan(t, tE - 0.1, tE + 0.8, 0.1, 0.5);
    let i = DG_vale(nv, x, 0, t, cam);
    i = DG_ar(nv, i, t);
    const g = DG_golias(x, t, DG_AMEACA, { x: 800, chao: 1450, H: 760, z: 1.25, cam, ang: 1.12 + 0.03 * Math.sin(t * 0.8) });
    if (bri > 0.01) { const [lx, ly] = DG_ponta(g, 1.12); brilhoP(x, lx, ly, 120 * g.escala, "255,240,230", 0.8 * bri); flareP(x, lx, ly, bri); }
    const [dx, dy, dk] = projP(cam, 330, 1300, 1);
    brilhoP(x, dx, dy, (200 + 400 * nome) * dk, LUZS.ambar, 0.25 + 0.3 * nome);
    if (nome > 0.01) for (let r = 0; r < 16; r++) { const an = -Math.PI / 2 + (r - 7.5) * 0.2, L = (200 + 500 * nome) * dk; linhaP(x, dx, dy, dx + Math.cos(an) * L, dy + Math.sin(an) * L, LUZS.ouro, 0.07 * nome, 3); }
    DG_davi(x, t, { ...POSES.de_pe, tronco: -0.04, cabeca: -0.3 }, { x: 330, chao: 1460, H: 340, z: 1, cam, cajado: 1, funda: null, cor: mixCor(DG_DAV, LUZ.luz, 0.5 * nome) });
    nv.total(i);
  });
};
function flareP(x, px, py, a) { linhaP(x, px - 80, py, px + 80, py, "255,245,235", 0.5 * a, 2); linhaP(x, px, py - 50, px, py + 50, "255,245,235", 0.35 * a, 2); }

// =============== 7. a queda: a funda gira, a pedra voa em arco, acerta, o gigante cai ===============
CENAS.queda = (el, c, B) => {
  const tP = B("pedra"), tT = B("testa"), tC = B("cai");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(70000);
  const GX = 880, GY = 1450, GH = 650;
  TV.quadro((x, t) => {
    const voo = PT.cl((t - tP + 0.1) / Math.max(0.5, tT - tP + 0.1)), cai = PT.ss((t - tC + 0.2) / 1.2), [tx, ty] = FIS.tremor(t, tT, 18), [tx2, ty2] = FIS.tremor(t, tC + 0.9, 26);
    const cam = { x: 560 + tx + tx2, y: 1020 + ty + ty2, zoom: 1.05 + 0.1 * PT.ss((t - tT) / 0.4), foco: 1 };
    let i = DG_vale(nv, x, 0, t, cam);
    i = DG_ar(nv, i, t);
    // o gigante tomba para a frente (gira em torno dos pés), a lança vai junto, e levanta poeira
    const rot = -(1.45 * PT.inExp(cai) * 0.9 + 0.25 * cai), recua = PT.jan(t, tT - 0.05, tC + 0.2, 0.1, 0.3);
    const g = DG_golias(x, t, poseMix(poseMix(DG_PG, { ...DG_PG, tronco: -0.2, cabeca: -0.5 }, recua), { ...DG_PG, braco: [[0.9, 0.3], [1.3, 0.2]] }, cai), { x: GX, chao: GY, H: GH, z: 1.25, cam, rot });
    if (cai > 0.85) { const p = PT.ss((t - tC - 0.9) / 1.0); for (let k = 0; k < 400; k++) { const an = Math.PI + (k / 400) * Math.PI, d = 40 + 380 * p * (0.5 + 0.5 * ((k * 37) % 10) / 10), [sx, sy] = projP(cam, GX - 0.75 * GH + Math.cos(an) * d, GY - 20 + Math.sin(an) * d * 0.3, 1.25); nv.ponto(i++, sx, sy, 0.9, 0.75, 0.6, 0.35 * (1 - p), 4); } }
    // Davi gira a funda; a pedra sai em arco até a testa
    const gira = PT.jan(t, c.ini, tP + 0.05, 0.3, 0.1), solta = PT.ss((t - tP + 0.05) / 0.35), an = t * 14;
    const pz = poseMix(POSES.funda(an), { ...POSES.de_pe, tronco: 0.1, braco: [[-0.4, 0.3], [1.45, 0.05]], perna: [[-0.25, 0], [0.3, -0.1]] }, solta);
    const dv = DG_davi(x, t, pz, { x: 230, chao: 1470, H: 340, z: 1, cam, funda: solta < 0.5 ? an : null });
    const [s0x, s0y] = dv.maos[1], alvo = [g.cabeca[0] - 0.02 * GH * g.escala * g.d, g.cabeca[1] - 0.02 * GH * g.escala];
    if (voo > 0 && voo < 1) { const [px, py] = FIS.arco(s0x, s0y, alvo[0], alvo[1], PT.inOut(voo), 120); for (let k = 0; k < 14; k++) { const [qx, qy] = FIS.arco(s0x, s0y, alvo[0], alvo[1], PT.inOut(Math.max(0, voo - k * 0.02)), 120); discoP(x, qx, qy, 9 * (1 - k / 14), LUZS.luz, 0.8 * (1 - k / 14)); } brilhoP(x, px, py, 60, LUZS.luz, 0.8); }
    const hit = PT.jan(t, tT - 0.05, tT + 0.25, 0.05, 0.6); if (hit > 0.01) { brilhoP(x, alvo[0], alvo[1], 300 * hit, "255,250,240", 0.9 * hit); anelP(x, alvo[0], alvo[1], 40 + 300 * (1 - hit), LUZS.luz, hit, 4); }
    void gira;
    nv.total(i);
  });
};

// =============== 8. o detalhe: os dias comuns com as ovelhas prepararam o dia do gigante ===============
CENAS.detalhe = (el, c, B) => {
  const tD = B("detalhe"), tO = B("ovelhas"), tC = B("comuns");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(70000);
  const tx = palcoTexto(el, [["dg-d", 360, 70, "Deus usou os <b>dias comuns</b><br>pra preparar o dia do gigante.", "lp-q", ""]]);
  tl.set(tx["dg-d"], { opacity: 0 }, 0);
  tl.fromTo(tx["dg-d"], { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", immediateRender: false }, tC - 1.0);
  const OV = [[160, 1400, 1.1, 1], [330, 1470, 1.0, -1], [790, 1430, 1.15, -1], [900, 1490, 1.0, 1], [660, 1340, 1.5, 1], [120, 1320, 1.6, -1]];
  const CAM = cameraProf([[c.ini, { x: 540, y: 1040, zoom: 1.1 }], [tO, { x: 540, y: 1100, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 1080, zoom: 1.12 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), ov = PT.ss((t - tO + 0.8) / 1.0), quente = PT.ss((t - tC + 0.3) / 1.0);
    let i = desenharFundo(nv, DG_EST, t, cam, LUZ.luz, 0.9, 0);
    // campo à noite (colinas suaves) e as ovelhas pastando
    for (const [X, Y, v] of DG_CHAO) { if (i >= nv.n) break; const z = Math.max(0.6, 1 + (1500 - Y) / 600), [sx, sy, k] = projP(cam, X, Y - 40, z); nv.ponto(i++, sx, sy, 0.55 + 0.3 * quente, 0.65, 0.5, 0.08 + 0.1 * v, 2 + 2 * k); }
    OV.forEach(([X, Y, z, d], k) => { i = desenharForma(nv, DG_F.ovelha, { cx: X, cy: Y - 60 + Math.abs(Math.sin(t * 1.3 + k)) * -3, esc: 190, cam, z, sx: d, cor: mixCor([0.85, 0.88, 1], LUZ.luz, quente), borda: [1, 1, 1], brilho: 0.7, a: 0.45 + 0.55 * ov, t, i0: i }); });
    // o pastor treinando com a funda (gira devagar), o cajado na outra mão
    const [dx, dy, dk] = projP(cam, 540, 1250, 1); brilhoP(x, dx, dy, (260 + 200 * quente) * dk, LUZS.ambar, 0.2 + 0.25 * quente);
    DG_davi(x, t, POSES.funda(t * 6), { x: 540, chao: 1420, H: 420, z: 1, cam, cajado: 1, funda: t * 6, cor: mixCor(DG_DAV, LUZ.luz, 0.4 * quente) });
    nv.total(i);
  });
};

// =============== 9. pergunta (uma só) e 10. fim (emenda no começo) ===============
CENAS.pergunta = (el, c, B) => cenaPergunta(el, c, B, { texto: "Qual é o nome do <b>gigante</b> que você está enfrentando hoje?", sub: "Escreve nos comentários", icone: "mountains", seed: 123, tam: 70, alturaTexto: 300 });
CENAS.fim = (el, c, B) => cartaoFinal(el, c.ini + 0.05);
