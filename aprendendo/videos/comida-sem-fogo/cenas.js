// Cenas do vídeo "Como a comida esquenta sem fogo" — padrão novo (out/2026): objetos em pontos de luz com
// volume, pontos que se transformam, câmera com profundidade e física.
// Retenção: paradoxo (ferrugem que cozinha), previsão ("adivinha o que uma pilha em curto faz?"), número
// (+50 graus em 10 min), a prima no bolso (aquecedor de mão), pergunta e o cuidado prometido (hidrogênio).

const MD = MotionDirector;
const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
const FUNDOC = fundoProfundo(41);
const mixCorC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// prego desenhado (cabeça, corpo e ponta)
const PREGO_C = { desenho: (g, R) => { g.fillRect(R * 0.3, R * 0.12, R * 0.4, R * 0.07); g.fillRect(R * 0.46, R * 0.19, R * 0.08, R * 0.58); g.beginPath(); g.moveTo(R * 0.46, R * 0.77); g.lineTo(R * 0.54, R * 0.77); g.lineTo(R * 0.5, R * 0.9); g.closePath(); g.fill(); } };
const FC = {
  tigela: formaPontos("bowl-steam", 11000), arvore: formaPontos("tree-evergreen", 1600), fogo: formaPontos("fire", 7000), panela: formaPontos("cooking-pot", 7000),
  tomada: formaPontos("plug", 7000), gota: formaPontos("drop", 6000), pacote: formaPontos("package", 10000), termo: formaPontos("thermometer-hot", 9000),
  andarilho: formaPontos("person-simple-hike", 8000), alerta: formaPontos("warning", 10000), prego: formaPontos(PREGO_C, 9000), timer: formaPontos("timer", 9000),
  calend: formaPontos("calendar-dots", 9000), pilha: formaPontos("battery-charging", 10000), raio: formaPontos("lightning", 5000), interr: formaTexto("?", 10000),
  n50: formaTexto("+50°", 12000), n10: formaTexto("10 min", 12000), fumaca: formaPontos("cloud", 5000), mao: formaPontos("hand-palm", 10000),
  vento: formaPontos("wind", 8000), carro: formaPontos("car-profile", 8000), barraca: formaPontos("tent", 8000), check: formaPontos("check-circle", 5000),
};
// vapor subindo em pontos
function vaporP(nv, cx, cy, t, a, i, larg = 120, alt = 300, n = 160) { if (a <= 0.01) return i; for (let k = 0; k < n && i < nv.n; k++) { const f = (k * 0.618) % 1, u = ((t * 0.35 + f) % 1); nv.ponto(i++, cx + (f - 0.5) * larg + Math.sin(u * 7 + k) * 22, cy - u * alt, 1, 0.92, 0.85, a * 0.5 * Math.sin(u * Math.PI), 5 + 10 * u); } return i; }
// risco vermelho sobre algo (2D)
function riscoC(x, cx, cy, r, a) { if (a <= 0.01) return; linhaP(x, cx - r, cy - r, cx + r, cy + r, "255,110,130", a, 10); linhaP(x, cx - r, cy + r, cx + r, cy - r, "255,110,130", a, 10); brilhoP(x, cx, cy, r * 1.4, "255,110,130", 0.3 * a); }
// floresta em profundidade (pinheiros em 3 distâncias)
const MATO_C = (() => { const r = prng(5), L = []; [[1.6, 1290], [2.3, 1230], [3.2, 1185]].forEach(([z, yt]) => { for (let k = 0; k < 9; k++) L.push({ x: -200 + k * 190 + r() * 90, y: 960 + (yt - 960) * z, z, e: 200 + r() * 80 }); }); return L; })();
function mato(nv, t, cam, a, i) { for (const p of MATO_C) i = desenharForma(nv, FC.arvore, { cx: p.x, cy: p.y, esc: p.e, cam, z: p.z, cor: CORF.verde, a: a * 0.75, brilho: 0.6, t, i0: i }); return i; }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tF = B("ferrugem0"), tM = B("mato"), tT = B("tomada"), tA = B("agua"), tS = B("soldado"), tP = B("promessa");
  const p2 = tT - 1.6, p3 = tA - 0.5, p4 = tS - 1.2, p5 = tP - 2.6;
  mostrarGancho(p2 - 0.2);
  const T = telaGPU(el, c), nv = T.nuvem(110000);
  const tx = palcoTexto(el, [["sem", 330, 62, "sem fogo, sem fogão, sem tomada", "pt-ve", "white-space:normal;left:60px;width:960px"], ["agu", 330, 70, "só água fria", "pt-ci"], ["sol", 330, 62, "é assim que soldados comem quente", "pt-am", "white-space:normal;left:60px;width:960px"], ["cui", 330, 66, "o cuidado: no final", "pt-am"]]);
  MD.slam(tl, tx.sem, p2 + 0.2, { from: 1.2 }); MD.leave(tl, tx.sem, p3 - 0.1); MD.slam(tl, tx.agu, tA - 0.4, { from: 1.35 }); MD.leave(tl, tx.agu, p4 - 0.1);
  MD.slam(tl, tx.sol, tS - 0.9, { from: 1.2 }); MD.leave(tl, tx.sol, p5 - 0.1); MD.slam(tl, tx.cui, p5 + 0.2, { from: 1.3 });
  const CAM = cameraProf([[0, { zoom: 1.35, y: 1050, foco: 1 }], [p2, { zoom: 1.0, y: 960, foco: 1 }]]);
  T.quadro((x, t) => {
    const cam = CAM(t); let i = desenharFundo(nv, FUNDOC, t, cam, [0.75, 0.82, 1], 1, 0);
    // plano 1 (quadro 0): a tigela fumegando no meio do mato escuro
    const a1 = 1 - PT.ss((t - p2) / 0.45);
    if (a1 > 0.01) {
      i = mato(nv, t, cam, a1, i);
      const [bx, by, k] = projP(cam, 540, 1000, 1);
      i = desenharForma(nv, FC.tigela, { cx: 540, cy: 1000, esc: 520, cam, z: 1, cor: CORF.laranja, borda: CORF.amarelo, a: a1, t, giro: 0.12 * Math.sin(t * 0.8), i0: i });
      i = vaporP(nv, bx, by - 150 * k, t, a1, i, 200 * k, 420 * k);
      const fe = PT.jan(t, tF - 0.3, p2, 0.3, 0.4); brilhoP(x, bx, by + 60 * k, 260 * k, "255,140,70", 0.35 * fe * a1);
    }
    // plano 2: sem fogo, sem fogão, sem tomada — os três chegam em cascata e são riscados
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) [[FC.fogo, CORF.laranja, 250], [FC.panela, CORF.branco, 540], [FC.tomada, CORF.ciano, 830]].forEach(([F, cor, px], k) => { const e = FIS.cascata(t, p2 + 0.1, k, 0.25, 0.55); i = desenharForma(nv, F, { cx: px, cy: 940, esc: 260 * Math.max(0.01, e), cor, a: a2, t, i0: i }); riscoC(x, px, 940, 95, a2 * PT.ss((t - p2 - 0.5 - k * 0.45) / 0.2)); });
    // plano 3: só água fria — a gota cai no pacote e ele esquenta
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) {
      const cai = PT.cl((t - p3 - 0.1) / 0.6), [gx, gy] = FIS.arco(540, 560, 540, 860, cai * cai, 0), [sx, sy] = FIS.impacto(t, p3 + 0.7, 0.2), q = PT.ss((t - p3 - 0.8) / 1.5);
      if (cai < 1) i = desenharForma(nv, FC.gota, { cx: gx, cy: gy, esc: 130, cor: CORF.ciano, a: a3, t, i0: i });
      i = desenharForma(nv, FC.pacote, { cx: 540, cy: 1030, esc: 420, sx, sy, cor: mixCorC(CORF.branco, CORF.laranja, q), a: a3, t, i0: i });
      i = vaporP(nv, 540, 890, t, a3 * q, i, 260, 360);
    }
    // plano 4: o soldado no mato com a comida quente
    const a4 = planoC(t, p4, p5);
    if (a4 > 0.01) { i = mato(nv, t, { x: 540, y: 960, zoom: 1, foco: 1 }, a4, i); const e = FIS.chegar(t, p4, 0.6); i = desenharForma(nv, FC.andarilho, { cx: 420, cy: 960, esc: 520 * Math.max(0.01, e), cor: CORF.branco, a: a4, t, i0: i }); i = desenharForma(nv, FC.tigela, { cx: 700, cy: 1080, esc: 230, cor: CORF.laranja, a: a4, t, i0: i }); i = vaporP(nv, 700, 1010, t, a4, i, 100, 220, 90); }
    // plano 5: a tigela vira o alerta (o cuidado prometido)
    const a5 = PT.ss((t - p5) / 0.4);
    if (a5 > 0.01) i = morfo(nv, FC.tigela, FC.alerta, PT.ss((t - p5) / 0.9), { de: { cx: 700, cy: 1080, esc: 230, cor: CORF.laranja }, para: { cx: 540, cy: 940, esc: 560, cor: CORF.amarelo }, t, a: a5, onda: 0.3, curva: 0.35, i0: i });
    nv.total(i);
  });
};

// =============== 2. ferrugem ===============
CENAS.ferrugem = (el, c, B) => {
  const tP = B("prego"), tO = B("oxigenio"), tC = B("calor"), tMe = B("meses"), tMi = B("minutos");
  const pB = tMe - 1.0, pC = tMi - 1.0;
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["pre", 330, 70, "um prego enferrujando", "pt-am"], ["oxi", 330, 62, "ferro + oxigênio + água", "pt-ci"], ["cal", 330, 66, "solta um pouco de calor", "pt-am"], ["mes", 330, 72, "só que leva meses", "pt-ve"], ["min", 330, 72, "e se fosse em minutos?", "pt-am"]]);
  MD.slam(tl, tx.pre, tP - 0.3, { from: 1.3 }); MD.leave(tl, tx.pre, tO - 0.5); MD.slam(tl, tx.oxi, tO - 0.3, { from: 1.25 }); MD.leave(tl, tx.oxi, tC - 0.5); MD.slam(tl, tx.cal, tC - 0.3, { from: 1.25 }); MD.leave(tl, tx.cal, pB - 0.1);
  MD.slam(tl, tx.mes, tMe - 0.3, { from: 1.3 }); MD.leave(tl, tx.mes, pC - 0.1); MD.slam(tl, tx.min, tMi - 0.5, { from: 1.35 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOC, t, null, [0.75, 0.82, 1], 1, 0);
    // A: o prego enferruja (cinza → cobre) com moléculas chegando; calor subindo
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) {
      const fer = PT.ss((t - tO) / 3), e = FIS.chegar(t, c.ini + 0.1, 0.6);
      i = desenharForma(nv, FC.prego, { cx: 540, cy: 960, esc: 760 * Math.max(0.01, e), rot: 0.25, cor: mixCorC(CORF.cinza, CORF.cobre, fer), a: aA, t, i0: i });
      const am = PT.ss((t - tO + 0.4) / 0.5);
      for (let k = 0; k < 14 && am > 0; k++) { const lado = k % 2 ? 1 : -1, u = ((t * 0.35 + k / 14) % 1), px = 540 + lado * (380 - u * 300), py = 700 + ((k * 97) % 520); const az = k % 3 === 0; discoP(x, px, py, 14, az ? "143,227,255" : "255,120,120", aA * am * Math.sin(u * Math.PI)); if (!az) discoP(x, px + 22, py, 14, "255,120,120", aA * am * Math.sin(u * Math.PI)); }
      if (t > tC - 0.4) i = vaporP(nv, 560, 760, t, aA * 0.6 * PT.ss((t - tC + 0.4) / 0.5), i, 220, 320, 90);
      rotuloP(x, "O2", 160, 760, 44, "255,150,150", aA * am); rotuloP(x, "água", 900, 760, 40, "170,230,255", aA * am);
    }
    // B: meses — o calendário vira páginas
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const e = FIS.chegar(t, pB, 0.6); i = morfo(nv, FC.prego, FC.calend, PT.ss((t - pB) / 0.8), { de: { cx: 540, cy: 960, esc: 760, rot: 0.25, cor: CORF.cobre }, para: { cx: 540, cy: 940, esc: 520, cor: CORF.branco, rot: 0.05 * Math.sin(t * 9) }, t, a: aB, i0: i }); rotuloP(x, `${Math.min(12, Math.floor((t - pB) * 6) + 1)} meses`, 540, 1260, 52, "255,170,180", aB * e); }
    // C: e se fosse em minutos? — o calendário vira um cronômetro
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) i = morfo(nv, FC.calend, FC.timer, PT.ss((t - pC) / 0.8), { de: { cx: 540, cy: 940, esc: 520, cor: CORF.branco }, para: { cx: 540, cy: 940, esc: 560, cor: CORF.amarelo, rot: 0.1 * FIS.balanco(t, pC + 0.8, 1, 2, 3) }, t, a: aC, i0: i });
    nv.total(i);
  });
};

// =============== 3. o saquinho ===============
CENAS.saquinho = (el, c, B) => {
  const tM = B("magnesio"), tS = B("sal"), tE = B("eletricidade"), tP = B("pilha"), tC = B("curto"), tA = B("adivinha");
  const pB = tE - 0.6, pC = tP - 0.5, pD = tA - 0.4;
  const T = telaGPU(el, c), nv = T.nuvem(80000);
  const tx = palcoTexto(el, [["den", 330, 66, "dentro do saquinho", "pt-ci"], ["ele", 330, 62, "o sal deixa a água conduzir", "pt-ci", "white-space:normal;left:60px;width:960px"], ["pil", 330, 70, "uma pilha minúscula", "pt-am"], ["cur", 420, 50, "em curto-circuito", "pt-ve"], ["adv", 330, 66, "adivinha o que acontece?", "pt-am"]]);
  MD.slam(tl, tx.den, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.den, pB - 0.1); MD.slam(tl, tx.ele, tE - 0.4, { from: 1.2 }); MD.leave(tl, tx.ele, pC - 0.1);
  MD.slam(tl, tx.pil, tP - 0.3, { from: 1.3 }); MD.slam(tl, tx.cur, tC - 0.2, { from: 1.25 }); MD.leave(tl, [tx.pil, tx.cur], pD - 0.1); MD.slam(tl, tx.adv, tA - 0.2, { from: 1.3 });
  // três montinhos de pó: magnésio (prata), ferro (cinza escuro), sal (branco)
  const MONTE = [[300, "magnésio", [0.85, 0.9, 1], () => tM], [540, "ferro", [0.6, 0.55, 0.6], () => tM + 1.4], [780, "sal", [1, 1, 1], () => tS]];
  const GR = Array.from({ length: 2400 }, (_, k) => [((k * 0.7548776662) % 1) * 2 - 1, (k * 0.5698402910) % 1]);
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOC, t, null, [0.75, 0.82, 1], 1, 0);
    // A e B: o pacote aberto atrás e os três pós na frente; com a água, cargas correm entre eles
    const aAB = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pC) / 0.45));
    if (aAB > 0.01) {
      i = desenharForma(nv, FC.pacote, { cx: 540, cy: 760, esc: 360, cor: CORF.branco, a: 0.35 * aAB, t, cam: { x: 540, y: 960, zoom: 1, foco: 1 }, z: 1.6, i0: i });
      MONTE.forEach(([mx, nome, cor, tq]) => { const e = FIS.chegar(t, tq() - 0.3, 0.55); for (let k = 0; k < 800 && i < nv.n && e > 0.02; k++) { const [u, v] = GR[k], h = (1 - u * u) * 120 * Math.max(0, e); nv.ponto(i++, mx + u * 110, 1170 - v * h, cor[0], cor[1], cor[2], aAB * 0.8, 3.4); } rotuloP(x, nome, mx, 1230, 40, "235,240,255", aAB * PT.cl(e)); });
      const ag = PT.ss((t - tE + 0.8) / 0.6);
      if (ag > 0) { for (let k = 0; k < 60 && i < nv.n; k++) { const u = ((t * 0.6 + k / 60) % 1), px = 300 + u * 480, py = 1110 - Math.sin(u * Math.PI) * 120 - (k % 3) * 8; nv.ponto(i++, px, py, 1, 0.85, 0.3, aAB * ag, 5); } rotuloP(x, "+ água", 540, 920, 44, "170,230,255", aAB * ag); }
    }
    // C: os pós viram uma pilha em curto: faíscas de um polo a outro
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { const [dx, dy] = FIS.tremor(t, tC, 12, 0.5); i = desenharForma(nv, FC.pilha, { cx: 540 + dx, cy: 960 + dy, esc: 600, rot: -0.1, cor: CORF.amarelo, a: aC, t, i0: i }); const cu = PT.ss((t - tC + 0.2) / 0.3); if (cu > 0) { i = desenharForma(nv, FC.raio, { cx: 540, cy: 960, esc: 260 + 30 * Math.sin(t * 20), cor: CORF.branco, a: aC * cu * (0.6 + 0.4 * Math.sin(t * 30)), t, i0: i }); faiscas2(nv, 540, 960, t, aC * cu, i); i = nv.k; } }
    // D: adivinha — a pilha vira um "?"
    const aD = PT.ss((t - pD) / 0.4);
    if (aD > 0.01) i = morfo(nv, FC.pilha, FC.interr, PT.ss((t - pD) / 0.8), { de: { cx: 540, cy: 960, esc: 600, rot: -0.1, cor: CORF.amarelo }, para: { cx: 540, cy: 940, esc: 680, cor: CORF.laranja }, t, a: aD, onda: 0.3, curva: 0.4, i0: i });
    nv.total(i);
  });
};
function faiscas2(nv, cx, cy, t, a, i) { const r = prng(Math.floor(t * 12)); for (let k = 0; k < 140 && i < nv.n; k++) { const an = r() * 6.283, d = 60 + r() * 260; nv.ponto(i++, cx + Math.cos(an) * d, cy + Math.sin(an) * d, 1, 0.8, 0.4, a * r(), 3 + 4 * r()); } nv.total(i); }

// =============== 4. os números ===============
CENAS.numeros = (el, c, B) => {
  const tE = B("esquenta"), tCo = B("copinho"), tCi = B("cinquenta"), tD = B("dez"), tS = B("sem");
  const pB = tCo - 0.5, pC = tCi - 0.6, pD = tD - 0.4, pE = tS - 1.4;
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["esq", 330, 80, "esquenta. e muito", "pt-ve"], ["cop", 330, 66, "um copinho de água", "pt-ci"], ["cin", 330, 64, "a comida sobe uns 50 graus", "pt-am", "white-space:normal;left:60px;width:960px"], ["dez", 330, 70, "em uns 10 minutos", "pt-am"], ["sem", 330, 58, "sem chama, sem fumaça, sem eletricidade", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.esq, tE - 0.1, { from: 1.45 }); MD.leave(tl, tx.esq, pB - 0.1); MD.slam(tl, tx.cop, tCo - 0.3, { from: 1.25 }); MD.leave(tl, tx.cop, pC - 0.1);
  MD.slam(tl, tx.cin, tCi - 0.4, { from: 1.2 }); MD.leave(tl, tx.cin, pD - 0.1); MD.slam(tl, tx.dez, tD - 0.3, { from: 1.3 }); MD.leave(tl, tx.dez, pE - 0.1); MD.slam(tl, tx.sem, pE + 0.2, { from: 1.15 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOC, t, null, [0.75, 0.82, 1], 1, 0);
    const aA = PT.ss((t - c.ini) / 0.3) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { const [dx, dy] = FIS.tremor(t, tE, 12, 0.6); i = morfo(nv, FC.interr, FC.termo, PT.ss((t - c.ini) / 0.7), { de: { cx: 540, cy: 940, esc: 680, cor: CORF.laranja }, para: { cx: 540 + dx, cy: 940 + dy, esc: 620, cor: CORF.vermelho }, t, a: aA, i0: i }); }
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const e = FIS.chegar(t, pB + 0.1, 0.6); i = desenharForma(nv, FC.gota, { cx: 540, cy: 900, esc: 420 * Math.max(0.01, e), cor: CORF.ciano, a: aB, t, i0: i }); rotuloP(x, "≈ 30 ml", 540, 1180, 56, "170,230,255", aB * PT.cl(e)); }
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) i = morfo(nv, FC.gota, FC.n50, PT.ss((t - pC) / 0.8), { de: { cx: 540, cy: 900, esc: 420, cor: CORF.ciano }, para: { cx: 540, cy: 930, esc: 860, cor: CORF.laranja, giro: 0.15 * Math.sin(t) }, t, a: aC, onda: 0.3, curva: 0.4, i0: i });
    const aD = planoC(t, pD, pE);
    if (aD > 0.01) i = morfo(nv, FC.n50, FC.n10, PT.ss((t - pD) / 0.8), { de: { cx: 540, cy: 930, esc: 860, cor: CORF.laranja }, para: { cx: 540, cy: 930, esc: 900, cor: CORF.amarelo }, t, a: aD, onda: 0.3, curva: 0.3, i0: i });
    const aE = PT.ss((t - pE) / 0.4);
    if (aE > 0.01) [[FC.fogo, CORF.laranja, 250], [FC.fumaca, CORF.cinza, 540], [FC.raio, CORF.amarelo, 830]].forEach(([F, cor, px], k) => { const e = FIS.cascata(t, pE + 0.1, k, 0.3, 0.55); i = desenharForma(nv, F, { cx: px, cy: 960, esc: 240 * Math.max(0.01, e), cor, a: aE, t, i0: i }); riscoC(x, px, 960, 90, aE * PT.ss((t - pE - 0.5 - k * 0.4) / 0.2)); });
    nv.total(i);
  });
};

// =============== 5. a prima no bolso ===============
CENAS.bolso = (el, c, B) => {
  const tPr = B("prima"), tM = B("mao"), tPa = B("pacote"), tPo = B("proposito");
  const pB = tPa - 0.5;
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["pri", 330, 66, "uma prima dessa reação", "pt-am"], ["mao", 330, 66, "o aquecedor de mão", "pt-ci"], ["pro", 330, 60, "ferro enferrujando de propósito", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.pri, tPr - 0.3, { from: 1.3 }); MD.leave(tl, tx.pri, tM - 0.5); MD.slam(tl, tx.mao, tM - 0.3, { from: 1.25 }); MD.leave(tl, tx.mao, tPo - 0.7); MD.slam(tl, tx.pro, tPo - 0.4, { from: 1.2 });
  const CAM = cameraProf([[c.ini, { zoom: 1.0 }], [pB, { zoom: 1.0 }], [pB + 1.5, { zoom: 1.6, y: 900 }]]);
  T.quadro((x, t) => {
    const cam = CAM(t); let i = desenharFundo(nv, FUNDOC, t, cam, [0.75, 0.82, 1], 1, 0);
    const a = PT.ss((t - c.ini) / 0.4), e = FIS.chegar(t, c.ini + 0.2, 0.7), q = PT.ss((t - tPa) / 1.5);
    i = desenharForma(nv, FC.mao, { cx: 540, cy: 1060, esc: 640 * Math.max(0.01, e), cor: CORF.branco, a: a * (1 - 0.5 * PT.ss((t - pB) / 0.6)), t, cam, z: 1, i0: i });
    const ab = FIS.chegar(t, tM - 0.2, 0.5);
    i = desenharForma(nv, FC.pacote, { cx: 540, cy: 900, esc: 300 * Math.max(0.01, ab), cor: mixCorC(CORF.branco, CORF.laranja, q), a, t, cam, z: 0.95, i0: i });
    if (t > tPa - 0.4) { for (let k = 0; k < 70 && i < nv.n; k++) { const u = ((t * 0.5 + k / 70) % 1), [px, py] = projP(cam, 540 + Math.cos(k * 2.4) * (420 - u * 360), 900 + Math.sin(k * 2.4) * (420 - u * 360), 0.95); nv.ponto(i++, px, py, 0.6, 0.9, 1, a * Math.sin(u * Math.PI) * PT.ss((t - tPa + 0.4) / 0.4), 4.5); } rotuloP(x, "ar", 200, 700, 44, "170,230,255", a * PT.ss((t - tPa) / 0.4)); }
    if (q > 0) { const [px, py, k] = projP(cam, 540, 900, 0.95); brilhoP(x, px, py, 220 * k, "255,140,70", 0.35 * q * a); i = vaporP(nv, px, py - 100 * k, t, a * q * 0.6, i, 160 * k, 300 * k, 80); }
    nv.total(i);
  });
};

// =============== 6. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tCa = B("calor2"), tQ = B("quente"), tT = B("teoria");
  const pB = tC + 0.5, pC = tQ + 0.3;
  const T = telaGPU(el, c), nv = T.nuvem(50000);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["car", 330, 60, "por que um carro enferrujado não fica quente?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["teo", 330, 76, "qual a sua teoria?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, pB - 0.1); MD.slam(tl, tx.car, pB + 0.1, { from: 1.15 }); MD.leave(tl, tx.car, pC - 0.1); MD.slam(tl, tx.teo, pC + 0.1, { from: 1.4 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOC, t, null, [0.75, 0.82, 1], 1, 0);
    const aA = FIS.chegar(t, c.ini + 0.1, 0.6) * (1 - PT.ss((t - pB) / 0.4));
    i = balaoPergunta(nv, x, t, PT.cl(aA), 540, 930, 620, i);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const e = FIS.chegar(t, pB, 0.6); i = desenharForma(nv, FC.carro, { cx: 520, cy: 980, esc: 640 * Math.max(0.01, e), sx: -1, cor: CORF.cobre, a: aB, t, i0: i }); i = desenharForma(nv, FC.termo, { cx: 820, cy: 720, esc: 220, cor: CORF.ciano, a: aB * PT.ss((t - tCa) / 0.4), t, i0: i }); rotuloP(x, "?", 820, 520, 120, "255,226,140", aB * PT.ss((t - tQ + 0.3) / 0.3)); }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { i = balaoPergunta(nv, x, t, aC, 540, 900, 580, i); setaComentarios(x, aC, t); }
    nv.total(i);
  });
};

// =============== 7. o cuidado prometido ===============
CENAS.cuidado = (el, c, B) => {
  const tH = B("hidrogenio"), tF = B("fogo"), tV = B("ventilado"), tB = B("barraca");
  const pB = tV - 1.6, pC = tB - 1.8;
  const T = telaGPU(el, c), nv = T.nuvem(80000);
  const tx = palcoTexto(el, [["pro", 330, 66, "o cuidado prometido", "pt-am"], ["hid", 330, 66, "solta gás hidrogênio", "pt-ci"], ["fog", 330, 70, "que pega fogo fácil", "pt-ve"], ["ven", 330, 62, "use em lugar aberto e ventilado", "pt-ci", "white-space:normal;left:60px;width:960px"], ["bar", 330, 62, "nunca no carro fechado ou na barraca", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.pro, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.pro, tH - 0.7); MD.slam(tl, tx.hid, tH - 0.5, { from: 1.25 }); MD.leave(tl, tx.hid, tF - 0.4); MD.slam(tl, tx.fog, tF - 0.2, { from: 1.4 }); MD.leave(tl, tx.fog, pB - 0.1);
  MD.slam(tl, tx.ven, tV - 0.6, { from: 1.15 }); MD.leave(tl, tx.ven, pC - 0.1); MD.slam(tl, tx.bar, tB - 0.9, { from: 1.15 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOC, t, null, [0.75, 0.82, 1], 1, 0);
    // A: o pacote soltando bolhas de hidrogênio; uma chama perto e o alerta
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) {
      i = desenharForma(nv, FC.pacote, { cx: 540, cy: 1120, esc: 360, cor: CORF.laranja, a: aA, t, i0: i });
      const hb = PT.ss((t - tH + 0.6) / 0.5);
      for (let k = 0; k < 26 && hb > 0; k++) { const u = ((t * 0.3 + k / 26) % 1), px = 540 + Math.sin(k * 3.1 + u * 6) * 120, py = 980 - u * 420; anelP(x, px, py, 10 + 8 * (k % 3), "190,230,255", aA * hb * Math.sin(u * Math.PI), 3); if (k % 5 === 0) rotuloP(x, "H2", px + 30, py, 30, "190,230,255", aA * hb * Math.sin(u * Math.PI)); }
      const fo = FIS.chegar(t, tF - 0.3, 0.5); if (fo > 0.01) { i = desenharForma(nv, FC.fogo, { cx: 850, cy: 720, esc: 240 * fo, cor: CORF.laranja, a: aA, t, i0: i }); i = desenharForma(nv, FC.alerta, { cx: 230, cy: 700, esc: 200 * fo, cor: CORF.amarelo, a: aA, t, i0: i }); }
    }
    // B: lugar aberto e ventilado — vento passando, céu aberto
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const e = FIS.chegar(t, pB + 0.1, 0.6); i = mato(nv, t, { x: 540, y: 960, zoom: 1, foco: 1 }, aB * 0.8, i); i = desenharForma(nv, FC.vento, { cx: 540 + FIS.flutua(t, 0, 40, 0.3), cy: 820, esc: 460 * Math.max(0.01, e), cor: CORF.ciano, a: aB, t, i0: i }); i = desenharForma(nv, FC.check, { cx: 540, cy: 1180, esc: 160 * Math.max(0.01, FIS.chegar(t, tV - 0.2, 0.5)), cor: CORF.verde, a: aB, t, i0: i }); }
    // C: carro fechado e barraca, riscados
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) [[FC.carro, 310, -1], [FC.barraca, 770, 1]].forEach(([F, px, sx], k) => { const e = FIS.cascata(t, pC + 0.1, k, 0.3, 0.55); i = desenharForma(nv, F, { cx: px, cy: 960, esc: 380 * Math.max(0.01, e), sx, cor: CORF.branco, a: aC, t, i0: i }); riscoC(x, px, 960, 130, aC * PT.ss((t - tB + 0.3 - k * 0.3) / 0.2)); });
    nv.total(i);
  });
};

// =============== 8. resumo ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c), nv = T.nuvem(40000);
  const Y = [560, 760, 960], textos = ["toda ferrugem solta calor", "o magnésio enferruja em minutos", "o sal vira tudo numa pilha em curto"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 50, s, "", "left:250px;width:780px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const IC = [[FC.fogo, CORF.laranja], [FC.timer, CORF.amarelo], [FC.pilha, CORF.ciano]];
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOC, t, null, [0.75, 0.82, 1], 1, 0);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    tP.forEach((tp, k) => { const e = FIS.chegar(t, tp - 0.2, 0.5), ent = FIS.cascata(t, c.ini + 0.3, k, 0.12, 0.6); i = desenharForma(nv, IC[k][0], { cx: 160, cy: Y[k] + 10, esc: 130 * Math.max(0.01, Math.min(1, ent)), cor: IC[k][1], a: sai * Math.min(1, ent) * (0.3 + 0.7 * PT.cl(e)), t, i0: i }); });
    i = desenharForma(nv, FC.tigela, { cx: 540, cy: 1230, esc: 260, cor: CORF.laranja, a: 0.8 * sai * PT.ss((t - c.ini - 0.2) / 0.5), t, i0: i }); i = vaporP(nv, 540, 1160, t, 0.7 * sai, i, 120, 200, 80);
    nv.total(i);
  });
  cartaoFinal(el, tC + 1.4);
};
