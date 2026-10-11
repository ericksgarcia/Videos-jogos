// Cenas do vídeo "Davi e Golias" (1 Samuel 17) — Luz da Palavra, pontos de luz na GPU.
// Retenção: quadro 0 = o gigante enorme contra o céu do entardecer e Davi pequeno na frente; gancho
// emocional; laço aberto ("presta atenção no que o Davi recusou") pago no detalhe (venceu com o que já
// sabia usar, dos dias com as ovelhas); capítulos I–III; armadura que cai, cinco pedras que sobem,
// a pedra em arco, o gigante que cai; pergunta única. Figuras: silhuetas de luz sem rosto.
// Fatos: 1 Sm 17:4 (seis côvados e um palmo ≈ 2,9 m), 17:16 (40 dias), 17:12–14 (o mais novo de oito),
// 17:17–18 (levar comida), 17:38–39 (armadura recusada), 17:40 (cinco seixos lisos), 17:45 (cf.), 17:49.

const DG_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.85) };
const DG_EST = fundoProfundo(111, 460);
const DG_SIL = new Path2D(SILHUETAS.pessoa);
const DG_D = (fn) => ({ desenho: (g, R) => { g.save(); g.translate(R * 0.04, R * 0.04); g.scale((R * 0.92) / 256, (R * 0.92) / 256); g.fillStyle = "#fff"; g.strokeStyle = "#fff"; g.lineCap = "round"; fn(g); g.restore(); } });
const DG_F = {
  golias: formaPontos(DG_D((g) => { g.fill(DG_SIL); g.beginPath(); g.moveTo(108, 30); g.quadraticCurveTo(128, 4, 148, 30); g.lineTo(150, 38); g.lineTo(106, 38); g.closePath(); g.fill(); g.lineWidth = 5; g.beginPath(); g.moveTo(196, 8); g.lineTo(186, 250); g.stroke(); g.beginPath(); g.moveTo(196, 0); g.lineTo(203, 22); g.lineTo(190, 21); g.closePath(); g.fill(); g.lineWidth = 7; g.beginPath(); g.ellipse(62, 150, 26, 36, 0, 0, 6.283); g.stroke(); g.beginPath(); g.arc(62, 150, 6, 0, 6.283); g.fill(); }), 14000, { espessura: 0.05 }),
  davi: formaPontos(DG_D((g) => { g.fill(DG_SIL); g.lineWidth = 6; g.beginPath(); g.moveTo(190, 60); g.quadraticCurveTo(200, 40, 188, 30); g.moveTo(190, 60); g.lineTo(184, 248); g.stroke(); g.lineWidth = 3; g.beginPath(); g.moveTo(72, 158); g.quadraticCurveTo(66, 190, 74, 212); g.stroke(); g.beginPath(); g.ellipse(74, 214, 7, 5, 0, 0, 6.283); g.fill(); }), 9000, { espessura: 0.04 }),
  ovelha: formaPontos({ desenho: (g, R) => { g.save(); g.scale(R / 256, R / 256); g.fillStyle = "#fff"; g.strokeStyle = "#fff"; for (const [x, y, r] of [[100, 120, 34], [134, 108, 36], [168, 120, 32], [120, 146, 32], [156, 148, 30], [84, 140, 24], [186, 140, 22]]) { g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill(); } g.beginPath(); g.ellipse(212, 118, 20, 15, -0.3, 0, 6.283); g.fill(); g.beginPath(); g.ellipse(206, 104, 7, 11, -0.9, 0, 6.283); g.fill(); g.lineWidth = 9; g.lineCap = "round"; for (const x of [100, 124, 152, 174]) { g.beginPath(); g.moveTo(x, 160); g.lineTo(x, 196); g.stroke(); } g.restore(); } }, 3500),
  escudo: formaPontos("shield", 3000), espada: formaPontos("sword", 3000), elmo: formaPontos({ desenho: (g, R) => { g.beginPath(); g.moveTo(R * 0.2, R * 0.7); g.quadraticCurveTo(R * 0.5, R * 0.05, R * 0.8, R * 0.7); g.lineTo(R * 0.86, R * 0.82); g.lineTo(R * 0.14, R * 0.82); g.closePath(); g.fill(); } }, 2500),
  pao: formaPontos("bread", 1800), pedra: formaPontos({ desenho: (g, R) => { g.beginPath(); g.ellipse(R / 2, R / 2, R * 0.42, R * 0.3, 0.2, 0, 6.283); g.fill(); } }, 900, { espessura: 0.15 }),
  texto40: formaTexto("40 DIAS", 6000, { fonte: "Cinzel", peso: 700, tam: 0.22 }),
};
const DG_GOL = [0.95, 0.45, 0.45], DG_DAV = LUZ.ouro;
// figura com os pés em (X, Ychão): a silhueta ocupa ~0,41·esc abaixo do centro
const DG_fig = (nv, F, X, Y, esc, z, cam, o, i) => desenharForma(nv, F, { cx: X, cy: Y - 0.41 * esc, esc, cam, z, ...o, i0: i });
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
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[0, { x: 560, y: 1050, zoom: 1.12 }], [c.fim + 0.5, { x: 540, y: 1000, zoom: 0.98 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), brilha = PT.ss((t - tL + 0.3) / 0.8);
    let i = DG_vale(nv, x, 0, t, cam);
    i = DG_ar(nv, i, t);
    i = DG_fig(nv, DG_F.golias, 680, 1500, 1250 * FIS.respira(t, 0, 0.01), 1.1, cam, { cor: DG_GOL, borda: [1, 0.7, 0.7], brilho: 0.6, rot: 0.01 * Math.sin(t * 0.6), t }, i);
    const [dx, dy, dk] = projP(cam, 330, 1380, 0.95); brilhoP(x, dx, dy, (120 + 160 * brilha) * dk, LUZS.ambar, 0.3 + 0.3 * brilha);
    i = DG_fig(nv, DG_F.davi, 330, 1560, 300, 0.95, cam, { cor: DG_DAV, borda: LUZ.luz, brilho: 0.9 + 0.3 * brilha, t }, i);
    nv.total(i);
  });
};

// =============== 2. o gigante: o vale de Elá, os dois exércitos, Golias (quase 3 m), 40 dias ===============
CENAS.gigante = (el, c, B) => {
  const tE = B("ela"), tG = B("golias"), tM = B("metros"), tQ = B("quarenta");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 880, zoom: 0.8 }], [tG - 0.3, { x: 560, y: 960, zoom: 0.9 }], [tG + 1.0, { x: 620, y: 1080, zoom: 1.35 }], [tQ - 0.3, { x: 620, y: 1080, zoom: 1.4 }], [c.fim + 0.5, { x: 600, y: 1000, zoom: 1.0 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), aG = FIS.chegar(t, tG - 0.4, 0.8), med = PT.jan(t, tM - 0.2, tQ - 0.4, 0.4, 0.4), q = PT.jan(t, tQ - 0.2, c.fim, 0.4, 0.5);
    let i = DG_vale(nv, x, 0, t, cam);
    i = DG_fig(nv, DG_F.golias, 640, 1420, 520 * Math.max(0.01, Math.min(1.05, aG)), 1.25, cam, { cor: DG_GOL, borda: [1, 0.7, 0.7], brilho: 0.65, a: Math.min(1, aG), t }, i);
    // régua de altura ao lado dele
    if (med > 0.01) { const [x0, y0] = projP(cam, 760, 1420, 1.25), [, y1] = projP(cam, 760, 1420 - 0.86 * 520, 1.25), yy = y0 + (y1 - y0) * PT.ss((t - tM + 0.2) / 0.8); linhaP(x, x0, y0, x0, yy, LUZS.luz, med, 3); linhaP(x, x0 - 14, yy, x0 + 14, yy, LUZS.luz, med, 3); linhaP(x, x0 - 14, y0, x0 + 14, y0, LUZS.luz, med, 3); rotuloP(x, "≈ 2,9 m", x0 + 24, (y0 + y1) / 2, 44, "255,236,200", med, "left"); }
    if (q > 0.01) i = desenharForma(nv, DG_F.texto40, { cx: 540, cy: 520, esc: 620, cor: LUZ.ouro, borda: LUZ.luz, a: q, brilho: 0.8, t, i0: i });
    nv.total(i);
  });
};

// =============== 3. o pastor: Davi chega trazendo comida para os irmãos e diz "eu vou" ===============
CENAS.pastor = (el, c, B) => {
  const tR = B("rapaz"), tD = B("davi"), tV = B("vou");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 420, y: 1060, zoom: 1.1 }], [tD, { x: 470, y: 1120, zoom: 1.35 }], [c.fim + 0.5, { x: 560, y: 1080, zoom: 1.2 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), anda = PT.ss((t - c.ini) / Math.max(1, tV - c.ini)), X = PT.lerp(150, 470, anda), passo = Math.sin(t * 6.5) * (1 - PT.ss((t - tV + 0.3) / 0.4)), vira = PT.ss((t - tV + 0.2) / 0.4);
    let i = DG_vale(nv, x, 0, t, cam);
    i = DG_ar(nv, i, t);
    // o gigante ao fundo, fora de foco
    i = DG_fig(nv, DG_F.golias, 900, 1360, 520, 2.2, { ...cam, foco: 1 }, { cor: DG_GOL, a: 0.55, brilho: 0.5, t }, i);
    const [dx, dy, dk] = projP(cam, X, 1450, 1); brilhoP(x, dx, dy - 120 * dk, 200 * dk, LUZS.ambar, 0.25 + 0.2 * PT.ss((t - tD) / 0.6));
    i = DG_fig(nv, DG_F.davi, X, 1450 - Math.abs(passo) * 5, 320, 1, cam, { cor: DG_DAV, borda: LUZ.luz, brilho: 0.9, rot: 0.03 * passo, sx: 1, t }, i);
    // o pão que ele levava, na mão, some quando ele decide ir
    const aP = 1 - vira; if (aP > 0.01) { const [px, py, pk] = projP(cam, X - 70, 1450 - 150, 1); i = desenharForma(nv, DG_F.pao, { cx: px, cy: py, esc: 70 * pk, cor: DG_PAO_COR, a: aP, brilho: 0.9, t, i0: i }); }
    if (vira > 0) brilhoP(x, dx, dy - 140 * dk, 320 * dk * vira, LUZS.luz, 0.25 * vira);
    nv.total(i);
  });
};
const DG_PAO_COR = [0.95, 0.75, 0.45];

// =============== 4. a armadura: Saul veste Davi, ele afunda; tira tudo e volta a brilhar ===============
CENAS.armadura = (el, c, B) => {
  const tA = B("armadura"), tT = B("tira"), tU = B("usei");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1020, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 1000, zoom: 1.12 }]]);
  const DX = 540, DY = 1480, DE = 760, pecas = [[DG_F.elmo, 0, -0.38, 0.2], [DG_F.escudo, -0.17, -0.02, 0.3], [DG_F.espada, 0.2, 0.06, 0.32]];
  TV.quadro((x, t) => {
    const cam = CAM(t), peso = PT.ss((t - tA - 0.2) / 0.8) * (1 - PT.ss((t - tT) / 0.6)), livre = PT.ss((t - tT) / 0.9);
    let i = DG_vale(nv, x, 0, t, cam, { a: 0.6 });
    const [sx, sy] = FIS.impacto(t, tA + 0.6, 0.12);
    brilhoP(x, DX, DY - 0.5 * DE, 0.6 * DE, LUZS.ambar, 0.12 + 0.25 * livre);
    i = DG_fig(nv, DG_F.davi, DX, DY + 20 * peso, DE, 1, cam, { cor: mixCor(DG_DAV, [0.55, 0.5, 0.5], 0.6 * peso), borda: LUZ.luz, brilho: 0.9 - 0.35 * peso + 0.2 * livre, sx: sx * (1 + 0.04 * peso), sy: sy * (1 - 0.06 * peso), t }, i);
    // as peças voam até ele (cascata) e, quando ele tira, caem em arco para os lados
    pecas.forEach(([F, px, py, e], k) => {
      const ch = FIS.cascata(t, tA - 0.1, k, 0.18, 0.7), [x0, y0] = [DX + px * DE, DY - 0.41 * DE + py * DE], cai = PT.ss((t - tT - k * 0.12) / 0.9);
      if (ch <= 0.01) return;
      const [ax, ay] = cai > 0 ? FIS.arco(x0, y0, x0 + (k - 1 || 1) * 340, 1700, cai, 160) : [x0 + (1 - Math.min(1, ch)) * (k - 1) * 300, y0 - (1 - Math.min(1, ch)) * 300];
      i = desenharForma(nv, F, { cx: ax, cy: ay, esc: e * DE, cor: [0.7, 0.72, 0.8], borda: [0.95, 0.95, 1], brilho: 0.8, rot: cai * (k - 1) * 2, a: Math.min(1, ch) * (1 - PT.ss((cai - 0.7) / 0.3)), t, i0: i });
    });
    nv.total(i);
  });
};

// =============== 5. as pedras: o ribeiro corre; cinco pedras lisas sobem e brilham ===============
CENAS.pedras = (el, c, B) => {
  const tC = B("cinco"), tF = B("funda");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(70000);
  const AG = (() => { const r = prng(119); return Array.from({ length: 2600 }, () => [r(), r(), r()]); })();
  const PED = (() => { const r = prng(121); return Array.from({ length: 22 }, (_, k) => [80 + r() * 920, 1180 + r() * 260, 0.6 + 0.6 * r(), r() * 3]); })();
  TV.quadro((x, t) => {
    const cam = { x: 540, y: 960, zoom: 1, foco: 1 };
    let i = desenharFundo(nv, DG_EST, t, cam, LUZ.luz, 0.5, 0);
    brilhoP(x, 540, 1300, 900, "70,110,200", 0.15);
    // a água corre da esquerda para a direita
    for (const [u, v, s] of AG) { const xx = ((u * 1300 + t * (60 + 60 * s)) % 1300) - 110, yy = 1150 + v * 330 + Math.sin(xx * 0.02 + t * 2 + v * 9) * 6; nv.ponto(i++, xx, yy, 0.5, 0.72, 1, 0.12 + 0.25 * s * v, 2 + 2 * v); }
    // pedras no leito; cinco delas sobem em cascata e ficam brilhando em arco
    PED.forEach(([px, py, e, rot], k) => {
      const esc = 70 * e, escolhida = k < 5, sobe = escolhida ? FIS.cascata(t, tC - 0.2, k, 0.15, 0.7) : 0, [ax, ay] = [PT.lerp(px, 300 + k * 120, Math.min(1, sobe)), PT.lerp(py, 760 - 40 * Math.sin(k / 4 * Math.PI), sobe)];
      const fu = PT.ss((t - tF + 0.1) / 0.9), [fx, fy] = escolhida ? [PT.lerp(ax, 500 + k * 20, fu), PT.lerp(ay, 1020, fu)] : [ax, ay];
      if (escolhida && sobe > 0.05) brilhoP(x, fx, fy, 70 * (1 - 0.5 * fu), LUZS.luz, 0.4 * Math.min(1, sobe));
      i = desenharForma(nv, DG_F.pedra, { cx: fx, cy: fy, esc: escolhida ? esc * (1 + 0.3 * Math.min(1, sobe)) * (1 - 0.4 * fu) : esc, rot, cor: escolhida && sobe > 0.05 ? mixCor([0.7, 0.72, 0.78], LUZ.luz, Math.min(1, sobe)) : [0.55, 0.58, 0.65], brilho: escolhida ? 0.7 + 0.5 * Math.min(1, sobe) : 0.5, t, i0: i });
    });
    // a funda: a correia aparece e as pedras vão para a bolsa
    const fu = PT.ss((t - tF + 0.3) / 0.8); if (fu > 0.01) { x.beginPath(); x.moveTo(380, 880); x.quadraticCurveTo(540, 1100, 700, 880); x.strokeStyle = `rgba(${LUZS.ouro},${0.8 * fu})`; x.lineWidth = 6; x.stroke(); brilhoP(x, 540, 1000, 180, LUZS.ambar, 0.3 * fu); }
    nv.total(i);
  });
};

// =============== 6. "em nome do Senhor": frente a frente ===============
CENAS.nome = (el, c, B) => {
  const tE = B("espada"), tN = B("nome");
  mostrarVersiculo("Eu vou a ti em nome do Senhor dos Exércitos.", "cf. 1 Samuel 17:45", tN - 1.4, c.fim + 0.3, { y: 400, tam: 66, destaque: ["nome", "senhor"] });
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 620, y: 1000, zoom: 1.05 }], [tE + 0.8, { x: 700, y: 980, zoom: 1.15, foco: 1.25 }], [tN - 0.3, { x: 420, y: 1080, zoom: 1.2, foco: 1 }], [c.fim + 0.5, { x: 440, y: 1060, zoom: 1.3, foco: 1 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), nome = PT.ss((t - tN + 0.2) / 0.9);
    let i = DG_vale(nv, x, 0, t, cam);
    i = DG_ar(nv, i, t);
    i = DG_fig(nv, DG_F.golias, 760, 1450, 860, 1.25, cam, { cor: DG_GOL, borda: [1, 0.7, 0.7], brilho: 0.65, t }, i);
    const [lx, ly, lk] = projP(cam, 760 + (196 / 256 - 0.5) * 0.92 * 860, 1450 - 0.41 * 860 + (0 / 256 - 0.46) * 0.92 * 860 + 30, 1.25), bri = PT.jan(t, tE - 0.1, tE + 0.8, 0.1, 0.5);
    if (bri > 0.01) { brilhoP(x, lx, ly, 120 * lk, "255,240,230", 0.8 * bri); flareP(x, lx, ly, bri); }
    const [dx, dy, dk] = projP(cam, 330, 1460, 1);
    brilhoP(x, dx, dy - 150 * dk, (200 + 400 * nome) * dk, LUZS.ambar, 0.25 + 0.3 * nome);
    if (nome > 0.01) for (let r = 0; r < 16; r++) { const an = -Math.PI / 2 + (r - 7.5) * 0.2, L = (200 + 500 * nome) * dk; linhaP(x, dx, dy - 160 * dk, dx + Math.cos(an) * L, dy - 160 * dk + Math.sin(an) * L, LUZS.ouro, 0.07 * nome, 3); }
    i = DG_fig(nv, DG_F.davi, 330, 1460, 340, 1, cam, { cor: DG_DAV, borda: LUZ.luz, brilho: 0.9 + 0.3 * nome, t }, i);
    nv.total(i);
  });
};
function flareP(x, px, py, a) { linhaP(x, px - 80, py, px + 80, py, "255,245,235", 0.5 * a, 2); linhaP(x, px, py - 50, px, py + 50, "255,245,235", 0.35 * a, 2); }

// =============== 7. a queda: a funda gira, a pedra voa em arco, acerta, o gigante cai ===============
CENAS.queda = (el, c, B) => {
  const tP = B("pedra"), tT = B("testa"), tC = B("cai");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(80000);
  const GX = 760, GY = 1450, GE = 860, [hx, hy] = [GX + (128 / 256 - 0.5) * 0.92 * GE, GY - 0.41 * GE + (34 / 256 - 0.5) * 0.92 * GE];
  TV.quadro((x, t) => {
    const voo = PT.cl((t - tP + 0.1) / Math.max(0.5, tT - tP + 0.1)), cai = PT.ss((t - tC + 0.2) / 1.2), [tx, ty] = FIS.tremor(t, tT, 18), [tx2, ty2] = FIS.tremor(t, tC + 0.9, 26);
    const cam = { x: 560 + tx + tx2, y: 1020 + ty + ty2, zoom: 1.05 + 0.1 * PT.ss((t - tT) / 0.4), foco: 1 };
    let i = DG_vale(nv, x, 0, t, cam);
    i = DG_ar(nv, i, t);
    // o gigante tomba para a frente (gira em torno dos pés) e levanta poeira
    const rot = -1.45 * PT.inExp(cai) * 0.9 - 0.25 * cai, [fx, fy] = [GX, GY];
    i = desenharForma(nv, DG_F.golias, { cx: fx - Math.sin(rot) * 0.41 * GE, cy: fy - Math.cos(rot) * 0.41 * GE, esc: GE, cam, z: 1.25, rot, cor: DG_GOL, borda: [1, 0.7, 0.7], brilho: 0.65 * (1 - 0.4 * cai), t, i0: i });
    if (cai > 0.85) { const p = PT.ss((t - tC - 0.9) / 1.0); for (let k = 0; k < 400; k++) { const an = Math.PI + (k / 400) * Math.PI, d = 40 + 380 * p * (0.5 + 0.5 * ((k * 37) % 10) / 10), [sx, sy] = projP(cam, 420 + Math.cos(an) * d, GY - 20 + Math.sin(an) * d * 0.3, 1.25); nv.ponto(i++, sx, sy, 0.9, 0.75, 0.6, 0.35 * (1 - p), 4); } }
    // Davi gira a funda; a pedra sai em arco até a testa
    const [dx, dy, dk] = projP(cam, 300, 1470, 1), gira = PT.jan(t, c.ini, tP + 0.05, 0.3, 0.1), an = t * 14;
    i = DG_fig(nv, DG_F.davi, 300, 1470, 340, 1, cam, { cor: DG_DAV, borda: LUZ.luz, brilho: 1, t }, i);
    if (gira > 0.01) { const mx = dx + 0.18 * 340 * dk, my = dy - 0.62 * 340 * dk; for (let k = 0; k < 18; k++) { const a2 = an - k * 0.12; discoP(x, mx + Math.cos(a2) * 50 * dk, my + Math.sin(a2) * 50 * dk * 0.6, 4 * (1 - k / 18), LUZS.luz, gira * (1 - k / 18)); } }
    if (voo > 0 && voo < 1) { const [s0x, s0y] = [dx + 0.18 * 340 * dk, dy - 0.62 * 340 * dk], [h1x, h1y] = projP(cam, hx, hy, 1.25), [px, py] = FIS.arco(s0x, s0y, h1x, h1y, PT.inOut(voo), 120); for (let k = 0; k < 14; k++) { const [qx, qy] = FIS.arco(s0x, s0y, h1x, h1y, PT.inOut(Math.max(0, voo - k * 0.02)), 120); discoP(x, qx, qy, 9 * (1 - k / 14), LUZS.luz, 0.8 * (1 - k / 14)); } brilhoP(x, px, py, 60, LUZS.luz, 0.8); }
    const hit = PT.jan(t, tT - 0.05, tT + 0.25, 0.05, 0.6); if (hit > 0.01) { const [h1x, h1y] = projP(cam, hx, hy, 1.25); brilhoP(x, h1x, h1y, 300 * hit, "255,250,240", 0.9 * hit); anelP(x, h1x, h1y, 40 + 300 * (1 - hit), LUZS.luz, hit, 4); }
    nv.total(i);
  });
};

// =============== 8. o detalhe: os dias comuns com as ovelhas prepararam o dia do gigante ===============
CENAS.detalhe = (el, c, B) => {
  const tD = B("detalhe"), tO = B("ovelhas"), tC = B("comuns");
  const TV = telaGPU(el, c, DG_FUNDO), nv = TV.nuvem(80000);
  const tx = palcoTexto(el, [["dg-d", 360, 70, "Deus usou os <b>dias comuns</b><br>pra preparar o dia do gigante.", "lp-q", ""]]);
  tl.set(tx["dg-d"], { opacity: 0 }, 0);
  tl.fromTo(tx["dg-d"], { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", immediateRender: false }, tC - 1.0);
  const OV = [[200, 1400, 1.1, 1], [380, 1460, 1.0, -1], [760, 1420, 1.15, -1], [880, 1480, 1.0, 1], [620, 1340, 1.5, 1], [120, 1320, 1.6, -1]];
  const CAM = cameraProf([[c.ini, { x: 540, y: 1040, zoom: 1.1 }], [tO, { x: 540, y: 1100, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 1080, zoom: 1.12 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), ov = PT.ss((t - tO + 0.8) / 1.0), quente = PT.ss((t - tC + 0.3) / 1.0);
    let i = desenharFundo(nv, DG_EST, t, cam, LUZ.luz, 0.9, 0);
    // campo à noite (colinas suaves) e as ovelhas pastando
    for (const [X, Y, v] of DG_CHAO) { if (i >= nv.n) break; const z = Math.max(0.6, 1 + (1500 - Y) / 600), [sx, sy, k] = projP(cam, X, Y - 40, z); nv.ponto(i++, sx, sy, 0.55 + 0.3 * quente, 0.65, 0.5, 0.08 + 0.1 * v, 2 + 2 * k); }
    OV.forEach(([X, Y, z, d], k) => { i = desenharForma(nv, DG_F.ovelha, { cx: X, cy: Y - 60 + Math.abs(Math.sin(t * 1.3 + k)) * -3, esc: 190, cam, z, sx: d, cor: mixCor([0.85, 0.88, 1], LUZ.luz, quente), borda: [1, 1, 1], brilho: 0.7, a: 0.45 + 0.55 * ov, t, i0: i }); });
    // o pastor com a funda, treinando: a correia gira devagar
    const [dx, dy, dk] = projP(cam, 540, 1420, 1); brilhoP(x, dx, dy - 150 * dk, (260 + 200 * quente) * dk, LUZS.ambar, 0.2 + 0.25 * quente);
    i = DG_fig(nv, DG_F.davi, 540, 1420, 360, 1, cam, { cor: DG_DAV, borda: LUZ.luz, brilho: 0.9 + 0.2 * quente, t }, i);
    const mx = dx + 0.18 * 360 * dk, my = dy - 0.62 * 360 * dk, an = t * 6; for (let k = 0; k < 16; k++) { const a2 = an - k * 0.14; discoP(x, mx + Math.cos(a2) * 46 * dk, my + Math.sin(a2) * 46 * dk * 0.6, 4 * (1 - k / 16), LUZS.luz, 0.8 * (1 - k / 16)); }
    nv.total(i);
  });
};

// =============== 9. pergunta (uma só) e 10. fim (emenda no começo) ===============
CENAS.pergunta = (el, c, B) => cenaPergunta(el, c, B, { texto: "Qual é o nome do <b>gigante</b> que você está enfrentando hoje?", sub: "Escreve nos comentários", icone: "mountains", seed: 123, tam: 70, alturaTexto: 300 });
CENAS.fim = (el, c, B) => cartaoFinal(el, c.ini + 0.05);
