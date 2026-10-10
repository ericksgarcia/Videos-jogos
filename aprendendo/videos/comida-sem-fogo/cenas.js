// Cenas do vídeo "Como a comida esquenta sem fogo" — pontos de luz na GPU.
// Retenção: situação concreta (o soldado no mato), ligação com algo conhecido (a ferrugem), analogia
// da pilha em curto, número de impacto (+50 °C com um copinho d'água), prima do dia a dia e cuidado.

const MD = MotionDirector;
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245", FER = "220,120,70", MG = "210,220,240";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.5);

function vapor(x, cx, cy, t, a, n = 4, alt = 220) { if (a <= 0.01) return; for (let k = 0; k < n; k++) { x.beginPath(); for (let q = 0; q <= 20; q++) { const u = q / 20, px = cx + (k - (n - 1) / 2) * 40 + Math.sin(u * 7 - t * 3 + k) * 18 * u, py = cy - u * alt; q ? x.lineTo(px, py) : x.moveTo(px, py); } x.strokeStyle = `rgba(230,240,255,${0.55 * a})`; x.lineWidth = 6; x.stroke(); } }
function saquinho(x, cx, cy, s, a, calor = 0) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 120 * s, cy - 170 * s); x.lineTo(cx + 120 * s, cy - 170 * s); x.lineTo(cx + 135 * s, cy + 170 * s); x.lineTo(cx - 135 * s, cy + 170 * s); x.closePath(); x.fillStyle = `rgba(${LA},${(0.06 + 0.2 * calor) * a})`; x.fill(); x.strokeStyle = `rgba(${calor > 0.3 ? LA : "190,200,170"},${a})`; x.lineWidth = 5 * s; x.stroke(); linhaP(x, cx - 120 * s, cy - 140 * s, cx + 120 * s, cy - 140 * s, "190,200,170", 0.6 * a, 3 * s); if (calor > 0) brilhoP(x, cx, cy, 260 * s, LA, 0.35 * a * calor); }
function gota(x, cx, cy, r, cor, a) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx, cy - r * 1.6); x.quadraticCurveTo(cx + r * 1.2, cy, cx, cy + r); x.quadraticCurveTo(cx - r * 1.2, cy, cx, cy - r * 1.6); x.fillStyle = `rgba(${cor},${0.3 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 4; x.stroke(); }
function prego(x, cx, cy, s, a, ferr = 0) { if (a <= 0.01) return; linhaP(x, cx, cy - 260 * s, cx, cy + 260 * s, MG, a, 22 * s); linhaP(x, cx - 50 * s, cy - 260 * s, cx + 50 * s, cy - 260 * s, MG, a, 18 * s); x.beginPath(); x.moveTo(cx - 11 * s, cy + 260 * s); x.lineTo(cx, cy + 300 * s); x.lineTo(cx + 11 * s, cy + 260 * s); x.fillStyle = `rgba(${MG},${a})`; x.fill(); if (ferr > 0) { const r = prng(5); for (let k = 0; k < 60; k++) { const yy = cy - 240 * s + r() * 500 * s; if (r() < ferr) discoP(x, cx + (r() - 0.5) * 26 * s, yy, (4 + r() * 6) * s, FER, a * 0.9); } } }
function relogio(x, cx, cy, r, ang, cor, a) { if (a <= 0.01) return; anelP(x, cx, cy, r, cor, a, 6); linhaP(x, cx, cy, cx + Math.cos(ang) * r * 0.8, cy + Math.sin(ang) * r * 0.8, cor, a, 5); linhaP(x, cx, cy, cx + Math.cos(ang / 12) * r * 0.5, cy + Math.sin(ang / 12) * r * 0.5, cor, a, 6); }

const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
function setaComent(x, a, t) { if (a <= 0.01) return; const b = Math.sin(t * 6) * 16; fSeta(x, 700 + b, 1250, 900 + b, 1250, AM, a, 12); brilhoP(x, 1010, 1250, 90, AM, 0.35 * a * (0.7 + 0.3 * Math.sin(t * 6))); rotuloP(x, "comentários", 780, 1180, 38, "255,226,140", a); }
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 330 * s, 60 * s, CI, a, 8 * s, 0.12);
  x.beginPath(); x.moveTo(cx - 120 * s, cy + 160 * s); x.lineTo(cx - 190 * s, cy + 250 * s); x.lineTo(cx - 40 * s, cy + 160 * s); x.fillStyle = `rgba(${CI},${0.5 * a})`; x.fill();
  brilhoP(x, cx, cy, 380 * s, CI, 0.18 * a); rotuloP(x, txt, cx, cy + 6 * s, 190 * s, "255,226,140", a * (0.85 + 0.15 * Math.sin(t * 4)));
}
function riscoX(x, cx, cy, r, a) { if (a <= 0.01) return; linhaP(x, cx - r, cy - r, cx + r, cy + r, VE, a, 9); linhaP(x, cx - r, cy + r, cx + r, cy - r, VE, a, 9); }
function chama(x, cx, cy, s, a, t) { if (a <= 0.01) return; const w = 1 + 0.08 * Math.sin(t * 12); x.beginPath(); x.moveTo(cx, cy - 110 * s * w); x.bezierCurveTo(cx + 80 * s, cy - 30 * s, cx + 60 * s, cy + 60 * s, cx, cy + 60 * s); x.bezierCurveTo(cx - 60 * s, cy + 60 * s, cx - 80 * s, cy - 30 * s, cx, cy - 110 * s * w); x.fillStyle = `rgba(${LA},${0.3 * a})`; x.fill(); x.strokeStyle = `rgba(${LA},${a})`; x.lineWidth = 6; x.stroke(); brilhoP(x, cx, cy, 120 * s, LA, 0.4 * a); }
function fogao(x, cx, cy, s, a) { if (a <= 0.01) return; fCaixa(x, cx, cy, 200 * s, 150 * s, 10 * s, BRC, a, 5, 0.08); anelP(x, cx - 45 * s, cy - 30 * s, 26 * s, BRC, a, 4); anelP(x, cx + 45 * s, cy - 30 * s, 26 * s, BRC, a, 4); fCaixa(x, cx, cy + 40 * s, 140 * s, 40 * s, 6 * s, BRC, a * 0.7, 3, 0.05); }
function tomadaI(x, cx, cy, s, a) { if (a <= 0.01) return; fCaixa(x, cx, cy, 150 * s, 150 * s, 40 * s, BRC, a, 5, 0.08); discoP(x, cx - 30 * s, cy, 12 * s, BRC, a); discoP(x, cx + 30 * s, cy, 12 * s, BRC, a); }
function bateria(x, cx, cy, s, a, curto = 0, t = 0) { if (a <= 0.01) return; fCaixa(x, cx, cy, 340 * s, 170 * s, 20 * s, BRC, a, 6, 0.08); fCaixa(x, cx + 190 * s, cy, 30 * s, 70 * s, 6 * s, BRC, a, 4, 0.3); rotuloP(x, "Mg", cx - 90 * s, cy, 52 * s, "220,228,245", a); rotuloP(x, "Fe", cx + 90 * s, cy, 52 * s, "220,140,90", a); if (curto > 0) { x.beginPath(); x.moveTo(cx - 170 * s, cy); x.bezierCurveTo(cx - 260 * s, cy - 260 * s, cx + 300 * s, cy - 260 * s, cx + 205 * s, cy); x.strokeStyle = `rgba(${AM},${a * curto})`; x.lineWidth = 7; x.stroke(); for (let k = 0; k < 6; k++) { const u = ((t * 0.9 + k / 6) % 1), bx = (1 - u) ** 3 * (cx - 170 * s) + 3 * (1 - u) ** 2 * u * (cx - 260 * s) + 3 * (1 - u) * u * u * (cx + 300 * s) + u ** 3 * (cx + 205 * s), by = (1 - u) ** 3 * cy + 3 * (1 - u) ** 2 * u * (cy - 260 * s) + 3 * (1 - u) * u * u * (cy - 260 * s) + u ** 3 * cy; discoP(x, bx, by, 8, AM, a * curto); } brilhoP(x, cx, cy - 160 * s, 260 * s, LA, 0.2 * a * curto); } }
function carroV(x, cx, cy, s, a, cor) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 220 * s, cy + 30 * s); x.lineTo(cx - 210 * s, cy - 30 * s); x.lineTo(cx - 110 * s, cy - 40 * s); x.lineTo(cx - 60 * s, cy - 110 * s); x.lineTo(cx + 80 * s, cy - 110 * s); x.lineTo(cx + 150 * s, cy - 40 * s); x.lineTo(cx + 220 * s, cy - 30 * s); x.lineTo(cx + 225 * s, cy + 30 * s); x.closePath(); x.fillStyle = `rgba(${cor},${0.1 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 6 * s; x.stroke(); anelP(x, cx - 120 * s, cy + 32 * s, 38 * s, cor, a, 6 * s); anelP(x, cx + 130 * s, cy + 32 * s, 38 * s, cor, a, 6 * s); }
function barraca(x, cx, cy, s, a) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 200 * s, cy + 100 * s); x.lineTo(cx, cy - 140 * s); x.lineTo(cx + 200 * s, cy + 100 * s); x.closePath(); x.fillStyle = `rgba(${VD},${0.08 * a})`; x.fill(); x.strokeStyle = `rgba(${VD},${a})`; x.lineWidth = 6; x.stroke(); linhaP(x, cx, cy - 140 * s, cx, cy + 100 * s, VD, 0.6 * a, 4); }
function alertaT(x, cx, cy, s, a) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx, cy - 150 * s); x.lineTo(cx + 170 * s, cy + 130 * s); x.lineTo(cx - 170 * s, cy + 130 * s); x.closePath(); x.fillStyle = `rgba(${AM},${0.12 * a})`; x.fill(); x.strokeStyle = `rgba(${AM},${a})`; x.lineWidth = 9; x.lineJoin = "round"; x.stroke(); rotuloP(x, "!", cx, cy + 30 * s, 160 * s, "255,226,140", a); brilhoP(x, cx, cy, 260 * s, AM, 0.2 * a); }
function mato(x, t, a) { if (a <= 0.01) return; for (let k = 0; k < 14; k++) { const bx = (k * 83) % 1080, by = 1340 - (k % 3) * 20; for (let f = 0; f < 3; f++) linhaP(x, bx, by, bx + (f - 1) * 40 + Math.sin(t + k) * 6, by - 120 - f * 20, VD, 0.4 * a, 5); } }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tF = B("ferrugem0"), tM = B("mato"), tT = B("tomada"), tA = B("agua"), tS = B("soldado"), tP = B("promessa");
  const p2 = tM + 0.3, p3 = tA - 0.9, p4 = tS - 0.6, p5 = tP - 2.2;
  mostrarGancho(p2 - 0.1);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["sem", 330, 66, "sem fogo, sem tomada", "pt-ve"], ["agu", 330, 70, "só água fria", "pt-ci"], ["sol", 330, 62, "a comida do soldado", "pt-am"], ["cui", 330, 62, "o cuidado: no final", "pt-am"]]);
  MD.slam(tl, tx.sem, p2 + 0.2, { from: 1.3 }); MD.leave(tl, tx.sem, p3 - 0.2); MD.slam(tl, tx.agu, tA - 0.3, { from: 1.3 }); MD.leave(tl, tx.agu, p4 - 0.1); MD.slam(tl, tx.sol, p4 + 0.2, { from: 1.25 }); MD.leave(tl, tx.sol, p5); MD.slam(tl, tx.cui, p5 + 0.2, { from: 1.25 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano 1 (quadro 0): o prego enferrujando ao lado do saquinho fervendo
    const a1 = 1 - PT.ss((t - p2) / 0.4);
    if (a1 > 0.01) { prego(x, 300, 980, 1.2, a1, PT.ss(t / 2)); saquinho(x, 720, 1050, 1.1, a1, 1); vapor(x, 720, 830, t, a1); termometroP(x, 960, 760, 360, 0, 100, PT.lerp(25, 80, PT.ss(t / 2.5)), a1); rotuloP(x, "≈", 520, 990, 90, "255,226,140", a1 * PT.ss((t - tF + 0.3) / 0.4)); }
    // plano 2: sem fogo, sem fogão, sem tomada
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { [[220, chama], [540, fogao], [860, tomadaI]].forEach(([px, fn], k) => { const q = PT.ss((t - p2 - 0.3 - k * 0.45) / 0.3); fn(x, px, 1000, 1.2, a2, t); riscoX(x, px, 1000, 110, a2 * q); }); }
    // plano 3: só um pouco de água fria
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) { const calor = PT.ss((t - tA) / (p4 - tA)); saquinho(x, 540, 1080, 1.2, a3, calor); gota(x, 540, PT.lerp(700, 860, PT.ss((t - p3) / 0.8)), 34, CI, a3 * (1 - PT.ss((t - p3 - 0.8) / 0.2))); vapor(x, 540, 860, t, a3 * calor); }
    // plano 4: o soldado comendo quente no mato
    const a4 = planoC(t, p4, p5);
    if (a4 > 0.01) { mato(x, t, a4); fPessoa(x, 330, 1180, 2.6, "180,200,150", a4); saquinho(x, 640, 1120, 0.8, a4, 1); vapor(x, 640, 960, t, a4); }
    // plano 5: o alerta (teaser)
    const a5 = PT.ss((t - p5) / 0.5);
    if (a5 > 0.01) alertaT(x, 540, 1000, 1.3, a5);
  });
};

// =============== 2. a ferrugem esquenta ===============
CENAS.ferrugem = (el, c, B) => {
  const tP = B("prego"), tO = B("oxigenio"), tC = B("calor"), tMe = B("meses"), tMi = B("minutos");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["fer", 330, 70, "ferro + oxigênio + água", "pt-ci"], ["cal", 330, 80, "= calor", "pt-am"], ["mes", 330, 66, "só que leva meses", "pt-ci"], ["min", 330, 66, "e se fosse em minutos?", "pt-am"]]);
  MD.slam(tl, tx.fer, tO - 0.1, { from: 1.25 }); MD.leave(tl, tx.fer, tC - 0.35); MD.slam(tl, tx.cal, tC - 0.05, { from: 1.45 }); MD.leave(tl, tx.cal, tMe - 0.6); MD.slam(tl, tx.mes, tMe - 0.3, { from: 1.25 }); MD.leave(tl, tx.mes, tMi - 0.6); MD.slam(tl, tx.min, tMi - 0.3, { from: 1.3 });
  const est = estF(5);
  const pB = tO - 0.6, pC = tC + 0.6, pD = tMi - 0.8;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) prego(x, 540, 1000, 1.6, aA, PT.ss((t - c.ini) / 2.5));
    // plano B: os átomos se juntam e soltam calor
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const j = PT.ss((t - tC + 0.8) / 0.8); [["Fe", 260, FER], ["O2", 540, CI], ["H2O", 820, "120,200,255"]].forEach(([nm, px, cor]) => { const qx = PT.lerp(px, 540, j * 0.75); discoP(x, qx, 1000, 70, cor, aB * 0.15); anelP(x, qx, 1000, 70, cor, aB, 5); rotuloP(x, nm, qx, 1000, 40, "255,255,255", aB); }); if (j > 0.6) for (let k = 0; k < 10; k++) { const an = k / 10 * 6.283 + t, r = 140 + ((t * 120) % 80); linhaP(x, 540 + Math.cos(an) * r, 1000 + Math.sin(an) * r, 540 + Math.cos(an) * (r + 40), 1000 + Math.sin(an) * (r + 40), LA, aB * (j - 0.6) * 2.5, 5); } }
    // plano C: o calendário passa meses; o termômetro nem mexe
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { const m = Math.floor(PT.lerp(1, 12, PT.ss((t - pC) / 3.0))); fCaixa(x, 380, 1000, 300, 320, 20, BRC, aC, 5, 0.06); fCaixa(x, 380, 870, 300, 70, 14, VE, aC, 4, 0.3); rotuloP(x, `mês ${m}`, 380, 1030, 60, "255,255,255", aC); termometroP(x, 820, 880, 420, 0, 100, 26, aC); rotuloP(x, "quase nada", 820, 1240, 34, "180,230,255", aC); }
    // plano D: o relógio acelerado e o "?"
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { relogio(x, 540, 1000, 220, (t - pD) * 14, AM, aD); rotuloP(x, "?", 860, 760, 150, AM, aD); }
  });
};

// =============== 3. dentro do saquinho ===============
CENAS.saquinho = (el, c, B) => {
  const tM = B("magnesio"), tS = B("sal"), tE = B("eletricidade"), tP = B("pilha"), tC = B("curto"), tA = B("adivinha");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["mg", 330, 70, "magnésio", "pt-ci"], ["fes", 330, 62, "+ ferro + sal", "pt-am"], ["ele", 330, 62, "a água conduz eletricidade", "pt-ci", "white-space:normal;left:60px;width:960px"], ["pil", 330, 76, "uma pilha em curto", "pt-ve"], ["adv", 330, 76, "adivinha?", "pt-am"]]);
  MD.slam(tl, tx.mg, tM - 0.1, { from: 1.3 }); MD.leave(tl, tx.mg, tS - 1.0); MD.slam(tl, tx.fes, tS - 0.8, { from: 1.25 }); MD.leave(tl, tx.fes, tE - 1.0); MD.slam(tl, tx.ele, tE - 0.8, { from: 1.2 }); MD.leave(tl, tx.ele, tP - 0.35); MD.slam(tl, tx.pil, tP - 0.05, { from: 1.35 }); MD.leave(tl, tx.pil, tA - 0.35); MD.slam(tl, tx.adv, tA - 0.05, { from: 1.5 });
  const est = estF(7);
  const pB = tS + 0.6, pC = tP - 0.5, pD = tA - 0.4;
  const PO = (() => { const r = prng(21), o = []; for (let k = 0; k < 120; k++) o.push({ x: (r() - 0.5) * 380, y: (r() - 0.5) * 520, tipo: r() < 0.6 ? 0 : r() < 0.6 ? 1 : 2 }); return o; })();
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o saquinho por dentro — pó de magnésio, ferro e sal
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { saquinho(x, 540, 1000, 1.6, aA, 0); PO.forEach((p, k) => { const q = p.tipo === 0 ? PT.ss((t - tM + 0.4) / 0.4) : PT.ss((t - tS + 0.8) / 0.4); if (q <= 0) return; if (p.tipo === 2) fCaixa(x, 540 + p.x, 1000 + p.y, 14, 14, 2, "255,255,255", aA * q, 2, 0.4); else discoP(x, 540 + p.x, 1000 + p.y, 6, p.tipo === 0 ? MG : FER, aA * q); }); }
    // plano B: a água entra e a corrente começa a correr
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { saquinho(x, 540, 1000, 1.6, aB, 0.3); const nv2 = PT.ss((t - pB) / 1.0); x.fillStyle = `rgba(${CI},${0.15 * aB * nv2})`; x.fillRect(340, 1270 - 380 * nv2, 400, 380 * nv2); for (let k = 0; k < 8; k++) { const u = ((t * 0.7 + k / 8) % 1); discoP(x, PT.lerp(380, 700, u), 1100 + Math.sin(u * 12 + k) * 40, 7, AM, aB * PT.ss((t - tE + 0.4) / 0.4)); } }
    // plano C: a pilha em curto-circuito
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) bateria(x, 540, 1000, 1.4, aC, PT.ss((t - tC + 0.4) / 0.4), t);
    // plano D: "?"
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { bateria(x, 480, 1000, 1.0, aD, 1, t); rotuloP(x, "?", 860, 760, 150, AM, aD); }
  });
};

// =============== 4. quanto esquenta ===============
CENAS.numeros = (el, c, B) => {
  const tE = B("esquenta"), tC = B("copinho"), tCi = B("cinquenta"), tD = B("dez"), tS = B("sem");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["esq", 330, 96, "esquenta!", "pt-ve"], ["cop", 330, 66, "só 30 ml de água", "pt-ci"], ["cin", 330, 80, "+50 °C", "pt-am"], ["dez", 330, 70, "em ~10 minutos", "pt-ci"], ["sem", 330, 62, "sem chama, sem fumaça", "pt-am"]]);
  MD.slam(tl, tx.esq, tE - 0.05, { from: 1.5 }); MD.leave(tl, tx.esq, tC - 0.35); MD.slam(tl, tx.cop, tC - 0.05, { from: 1.25 }); MD.leave(tl, tx.cop, tCi - 0.35); MD.slam(tl, tx.cin, tCi - 0.05, { from: 1.45 }); MD.leave(tl, tx.cin, tD - 0.35); MD.slam(tl, tx.dez, tD - 0.05, { from: 1.3 }); MD.leave(tl, tx.dez, tS - 1.4); MD.slam(tl, tx.sem, tS - 1.1, { from: 1.25 });
  const est = estF(9);
  const pB = tC - 0.5, pC = tCi - 0.4, pD = tS - 1.2;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.3) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { saquinho(x, 540, 1060, 1.5, aA, 1); vapor(x, 540, 790, t, aA, 5, 300); brilhoP(x, 540, 1060, 300, LA, 0.4 * aA); }
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { x.beginPath(); x.moveTo(420, 860); x.lineTo(660, 860); x.lineTo(630, 1180); x.lineTo(450, 1180); x.closePath(); x.strokeStyle = `rgba(${CI},${aB})`; x.lineWidth = 6; x.stroke(); x.fillStyle = `rgba(${CI},${0.18 * aB})`; x.fillRect(458, 1100, 165, 76); rotuloP(x, "30 ml", 540, 1260, 50, "180,230,255", aB); }
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { termometroP(x, 330, 1000, 460, 0, 100, PT.lerp(20, 70, PT.ss((t - tCi + 0.3) / 1.2)), aC); relogio(x, 760, 1000, 170, (t - pC) * 4, AM, aC * PT.ss((t - tD + 0.6) / 0.4)); rotuloP(x, "10 min", 760, 1230, 46, "255,226,140", aC * PT.ss((t - tD + 0.6) / 0.4)); }
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { chama(x, 240, 1000, 0.9, aD, t); riscoX(x, 240, 1000, 90, aD); for (let k = 0; k < 3; k++) { const u = ((t * 0.4 + k / 3) % 1); discoP(x, 540 + Math.sin(u * 6 + k) * 30, 1080 - u * 200, 30 + 30 * u, "200,205,215", aD * (1 - u) * 0.5); } riscoX(x, 540, 980, 90, aD); x.beginPath(); x.moveTo(860, 880); x.lineTo(800, 1010); x.lineTo(860, 1000); x.lineTo(820, 1120); x.strokeStyle = `rgba(${AM},${aD})`; x.lineWidth = 8; x.stroke(); riscoX(x, 840, 1000, 90, aD); }
  });
};

// =============== 5. a prima no seu bolso ===============
CENAS.bolso = (el, c, B) => {
  const tP = B("prima"), tM = B("mao"), tPa = B("pacote"), tPr = B("proposito");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pri", 330, 66, "uma prima dessa reação", "pt-ci"], ["mao", 330, 66, "o aquecedor de mão", "pt-am"], ["pro", 330, 62, "ferro enferrujando de propósito", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.pri, tP - 0.2, { from: 1.25 }); MD.leave(tl, tx.pri, tM - 0.35); MD.slam(tl, tx.mao, tM - 0.05, { from: 1.3 }); MD.leave(tl, tx.mao, tPr - 1.4); MD.slam(tl, tx.pro, tPr - 1.1, { from: 1.2 });
  const est = estF(11);
  const pB = tM - 0.3, pC = tPa + 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { fCaixa(x, 540, 1000, 360, 240, 40, LA, aA, 6, 0.12); rotuloP(x, "AQUECEDOR", 540, 1000, 44, "255,226,140", aA); }
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { fCaixa(x, 540, 1000, 300, 200, 40, LA, aB, 6, 0.25); brilhoP(x, 540, 1000, 260, LA, 0.4 * aB * PT.ss((t - tPa + 0.3) / 0.6)); for (const sd of [-1, 1]) { fCaixa(x, 540 + sd * 220, 1040, 140, 200, 60, "255,210,180", aB, 5, 0.15); } vapor(x, 540, 880, t, aB * PT.ss((t - tPa + 0.3) / 0.6), 3, 160); }
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { fCaixa(x, 540, 1000, 700, 460, 30, LA, aC * 0.6, 4, 0.04); const r = prng(31); for (let k = 0; k < 60; k++) { const px = 230 + r() * 620, py = 800 + r() * 400, ox = PT.ss((t - pC - r() * 1.5) / 0.6); discoP(x, px, py, 8, mixRG(ox), aC); } for (let k = 0; k < 10; k++) { const u = ((t * 0.5 + k / 10) % 1); rotuloP(x, "O2", 120 + u * 200, 820 + k * 40, 26, "180,230,255", aC * Math.sin(u * Math.PI)); } }
  });
};
function mixRG(k) { const a = [220, 228, 245], b = [220, 120, 70]; return a.map((v, i) => Math.round(v + (b[i] - v) * k)).join(","); }

// =============== 6. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tCa = B("calor2"), tQ = B("quente"), tT = B("teoria");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["car", 330, 62, "e o carro enferrujado?", "pt-ci"], ["teo", 330, 80, "qual a sua teoria?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, tCa - 0.5); MD.slam(tl, tx.car, tCa - 0.2, { from: 1.25 }); MD.leave(tl, tx.car, tT - 0.35); MD.slam(tl, tx.teo, tT - 0.05, { from: 1.4 });
  const est = estF(21);
  const pB = tCa - 0.6, pC = tT - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    balaoCom(x, 540, 960, 1.2, PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4)), "?", t);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { carroV(x, 480, 1080, 1.5, aB, FER); const r = prng(8); for (let k = 0; k < 30; k++) discoP(x, 200 + r() * 560, 960 + r() * 170, 6, FER, aB * 0.8); termometroP(x, 900, 900, 380, 0, 100, 24, aB); rotuloP(x, "?", 900, 680, 110, AM, aB * PT.ss((t - tQ + 0.4) / 0.4)); }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { balaoCom(x, 540, 900, 1.1, aC, "?", t); setaComent(x, aC, t); }
  });
};

// =============== 7. o cuidado prometido ===============
CENAS.cuidado = (el, c, B) => {
  const tH = B("hidrogenio"), tF = B("fogo"), tV = B("ventilado"), tB = B("barraca");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pro", 330, 66, "o cuidado prometido", "pt-am"], ["hid", 330, 70, "solta hidrogênio", "pt-ci"], ["fog", 330, 76, "que pega fogo", "pt-ve"], ["ven", 330, 62, "use em lugar aberto", "pt-ci"], ["bar", 330, 62, "nunca em carro ou barraca", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.pro, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.pro, tH - 0.4); MD.slam(tl, tx.hid, tH - 0.1, { from: 1.25 }); MD.leave(tl, tx.hid, tF - 0.35); MD.slam(tl, tx.fog, tF - 0.05, { from: 1.45 }); MD.leave(tl, tx.fog, tV - 0.6); MD.slam(tl, tx.ven, tV - 0.3, { from: 1.25 }); MD.leave(tl, tx.ven, tB - 1.4); MD.slam(tl, tx.bar, tB - 1.1, { from: 1.2 });
  const est = estF(13);
  const pB = tH - 0.4, pC = tF + 0.5, pD = tB - 1.2;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) alertaT(x, 540, 1000, 1.4, aA);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { saquinho(x, 540, 1150, 1.0, aB, 1); for (let k = 0; k < 10; k++) { const u = ((t * 0.5 + k / 10) % 1); anelP(x, 460 + (k * 37) % 160, 960 - u * 300, 16, CI, aB * Math.sin(u * Math.PI), 3); rotuloP(x, "H2", 460 + (k * 37) % 160, 960 - u * 300, 18, "200,240,255", aB * Math.sin(u * Math.PI)); } const aF = PT.ss((t - tF + 0.3) / 0.3); chama(x, 540, 700, 1.0, aB * aF, t); }
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { mato(x, t, aC); saquinho(x, 540, 1120, 1.0, aC, 1); for (let k = 0; k < 4; k++) { const u = ((t * 0.8 + k / 4) % 1); fSeta(x, 100 + u * 300, 880 + k * 70, 260 + u * 300, 880 + k * 70, "220,230,255", aC * Math.sin(u * Math.PI), 5); } anelP(x, 860, 760, 50, VD, aC, 6); linhaP(x, 836, 762, 855, 782, VD, aC, 8); linhaP(x, 855, 782, 888, 738, VD, aC, 8); }
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { carroV(x, 300, 1050, 0.9, aD, BRC); riscoX(x, 300, 1020, 130, aD); barraca(x, 780, 1020, 1.0, aD); riscoX(x, 780, 1020, 130, aD); }
  });
};

// =============== 8. resumo relâmpago + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [560, 720, 880], textos = ["toda ferrugem solta calor", "o magnésio enferruja em minutos", "o sal vira tudo numa pilha em curto"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    const a = 0.7 * sai * PT.ss((t - c.ini) / 0.5); saquinho(x, 540, 1240, 0.8, a, 1); vapor(x, 540, 1100, t, a);
    tP.forEach((tp, k) => { const a2 = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a2 > 0) { discoP(x, 160, Y[k], 14, [FER, MG, AM][k], a2); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a2); } });
  });
  cartaoFinal(el, tC + 1.4);
};
