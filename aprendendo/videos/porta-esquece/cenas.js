// Cenas do vídeo "Por que você esquece o que ia fazer quando passa por uma porta" — pontos de luz.
// Retenção: situação do dia a dia (levantar do sofá e esquecer), promessa (o truque), experimento,
// metáfora dos capítulos, virada de 2021 (só com a cabeça cheia) e dica prática.

const MD = MotionDirector;
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.5);

function copo(x, cx, cy, s, cor, a) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 28 * s, cy - 40 * s); x.lineTo(cx + 28 * s, cy - 40 * s); x.lineTo(cx + 20 * s, cy + 40 * s); x.lineTo(cx - 20 * s, cy + 40 * s); x.closePath(); x.fillStyle = `rgba(${cor},${0.15 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 5 * s; x.stroke(); linhaP(x, cx - 25 * s, cy - 10 * s, cx + 25 * s, cy - 10 * s, cor, 0.6 * a, 3 * s); }
function lampadaP(x, cx, cy, s, a, acesa = 1) { if (a <= 0.01) return; const cor = acesa > 0.5 ? AM : "150,160,190"; if (acesa > 0) brilhoP(x, cx, cy, 90 * s, AM, 0.5 * a * acesa); anelP(x, cx, cy, 34 * s, cor, a, 5 * s); fCaixa(x, cx, cy + 46 * s, 30 * s, 22 * s, 4 * s, cor, a, 4 * s, 0.2); }
function bolha(x, cx, cy, r, cor, a) { if (a <= 0.01) return; discoP(x, cx, cy, r, cor, 0.08 * a); anelP(x, cx, cy, r, cor, a, 4); discoP(x, cx - r * 0.6, cy + r * 1.05, r * 0.16, cor, 0.6 * a); discoP(x, cx - r * 0.8, cy + r * 1.35, r * 0.09, cor, 0.6 * a); }
// casa em corte: sala (esquerda) | porta | cozinha (direita)
function casaCorte(x, a, piso = 1250, porta = 540) {
  if (a <= 0.01) return; linhaP(x, 60, piso, 1020, piso, BRC, 0.6 * a, 4); linhaP(x, 60, 640, 1020, 640, BRC, 0.3 * a, 3);
  linhaP(x, porta, 640, porta, piso - 300, BRC, 0.7 * a, 8); x.setLineDash([10, 10]); linhaP(x, porta, piso - 300, porta, piso, AM, 0.6 * a, 4); x.setLineDash([]);
  // sofá
  fCaixa(x, 220, piso - 60, 240, 80, 20, "180,150,255", a, 4, 0.12); fCaixa(x, 220, piso - 130, 240, 60, 20, "180,150,255", a, 4, 0.08);
  // geladeira e balcão
  fCaixa(x, 920, piso - 170, 120, 340, 14, CI, a, 4, 0.08); linhaP(x, 870, piso - 220, 970, piso - 220, CI, 0.6 * a, 3); fCaixa(x, 720, piso - 70, 180, 140, 8, CI, a, 4, 0.06);
  rotuloP(x, "SALA", 220, 680, 30, "200,190,255", 0.7 * a); rotuloP(x, "COZINHA", 820, 680, 30, "180,230,255", 0.7 * a);
}
function medidor(x, cx, cy, v, a, rot) { if (a <= 0.01) return; for (let k = 0; k < 10; k++) { const on = k < Math.round(v * 10), cor = k < 3 ? "255,110,130" : k < 6 ? "255,210,63" : "120,255,190"; fCaixa(x, cx - 225 + k * 50, cy, 38, 54, 8, on ? cor : "120,128,150", a * (on ? 1 : 0.3), 3, on ? 0.5 : 0.05); } rotuloP(x, rot, cx, cy - 56, 28, "255,255,255", 0.85 * a); }

const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
function setaComent(x, a, t) { if (a <= 0.01) return; const b = Math.sin(t * 6) * 16; fSeta(x, 700 + b, 1250, 900 + b, 1250, AM, a, 12); brilhoP(x, 1010, 1250, 90, AM, 0.35 * a * (0.7 + 0.3 * Math.sin(t * 6))); rotuloP(x, "comentários", 780, 1180, 38, "255,226,140", a); }
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 330 * s, 60 * s, CI, a, 8 * s, 0.12);
  x.beginPath(); x.moveTo(cx - 120 * s, cy + 160 * s); x.lineTo(cx - 190 * s, cy + 250 * s); x.lineTo(cx - 40 * s, cy + 160 * s); x.fillStyle = `rgba(${CI},${0.5 * a})`; x.fill();
  brilhoP(x, cx, cy, 380 * s, CI, 0.18 * a); rotuloP(x, txt, cx, cy + 6 * s, 190 * s, "255,226,140", a * (0.85 + 0.15 * Math.sin(t * 4)));
}
// porta grande brilhando
function portaG(x, cx, cy, w, h, a) { if (a <= 0.01) return; brilhoP(x, cx, cy, w * 1.5, "255,220,150", 0.08 * a); fCaixa(x, cx, cy, w, h, 10, "255,226,170", a, 10, 0.16); fCaixa(x, cx, cy, w - 50, h - 50, 6, "255,240,210", 0.5 * a, 3, 0.05); discoP(x, cx + w / 2 - 50, cy + 20, 12, AM, a); }
// barra de comparação
function barraC(x, cx, base, h, cor, a, rot) { if (a <= 0.01) return; fCaixa(x, cx, base - h / 2, 170, Math.max(10, h), 12, cor, a, 5, 0.3); rotuloP(x, rot, cx, base + 50, 36, "255,255,255", a); }
// rolo de filme
function filmeC(x, cx, cy, w, a, off = 0, cortes = 0) { if (a <= 0.01) return; const n = 6, cw = w / n; for (let k = 0; k < n; k++) { const gap = cortes * 40 * (k - (n - 1) / 2), px = cx - w / 2 + cw * (k + 0.5) + gap + off; fCaixa(x, px, cy, cw - 12, 200, 10, BRC, a, 4, 0.06); for (let q = 0; q < 4; q++) { discoP(x, px - cw / 2 + 20 + q * (cw - 40) / 3, cy - 120, 7, BRC, a * 0.7); discoP(x, px - cw / 2 + 20 + q * (cw - 40) / 3, cy + 120, 7, BRC, a * 0.7); } } }
// gaveta (arquivo) que abre/fecha; aberta 0..1
function gavetaC(x, cx, cy, a, aberta, t) { if (a <= 0.01) return; fCaixa(x, cx, cy, 460, 420, 16, BRC, a, 6, 0.06); const dy = aberta * 160; fCaixa(x, cx, cy - 60 + dy, 400, 140, 12, CI, a, 5, 0.12); fCaixa(x, cx, cy - 60 + dy, 120, 26, 13, AM, a, 4, 0.4); fCaixa(x, cx, cy + 120, 400, 140, 12, CI, a * 0.6, 4, 0.06); if (aberta > 0.3) { bolha(x, cx, cy - 180 + dy * 0.2, 60, CI, a * PT.ss((aberta - 0.3) / 0.4)); copo(x, cx, cy - 180 + dy * 0.2, 0.7, CI, a * PT.ss((aberta - 0.3) / 0.4)); } }
// óculos de realidade virtual
function oculosVR(x, cx, cy, s, a) { if (a <= 0.01) return; fCaixa(x, cx, cy, 420 * s, 200 * s, 60 * s, BRC, a, 7 * s, 0.1); anelP(x, cx - 100 * s, cy, 60 * s, CI, a, 6 * s); anelP(x, cx + 100 * s, cy, 60 * s, CI, a, 6 * s); linhaP(x, cx - 210 * s, cy, cx - 300 * s, cy - 30 * s, BRC, a, 8 * s); linhaP(x, cx + 210 * s, cy, cx + 300 * s, cy - 30 * s, BRC, a, 8 * s); brilhoP(x, cx, cy, 260 * s, CI, 0.2 * a); }
// pessoa andando da sala até a cozinha (q = 0..1)
function andando(x, q, a, t, ida = true) { const px = ida ? PT.lerp(240, 760, q) : PT.lerp(760, 240, q), py = 1170 - Math.abs(Math.sin(q * 20)) * 8; fPessoa(x, px, py, 1.8, "255,226,190", a); return [px, py]; }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tE0 = B("esq0"), tL = B("lab"), tS = B("sofa"), tP = B("porta"), tPr = B("pronto"), tPm = B("promessa");
  const p2 = tS - 0.8, p3 = tPm - 2.0;
  mostrarGancho(tL - 0.3);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["lab", 330, 62, "medido em laboratório", "pt-ci"], ["esq", 330, 92, "esqueceu!", "pt-ve"], ["tru", 330, 62, "o truque: no final", "pt-am"]]);
  MD.slam(tl, tx.lab, tL - 0.1, { from: 1.25 }); MD.leave(tl, tx.lab, p2 + 0.3); MD.slam(tl, tx.esq, tPr - 0.05, { from: 1.45 }); MD.leave(tl, tx.esq, p3); MD.slam(tl, tx.tru, p3 + 0.2, { from: 1.25 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano 1 (quadro 0): a porta enorme; as lembranças passam por ela e se desfazem
    const a1 = 1 - PT.ss((t - p2) / 0.4);
    if (a1 > 0.01) { const DX = 540, DY = 980, W = 340; portaG(x, DX, DY, W, 640, a1); for (let k = 0; k < 7; k++) { const g = (-1.3 + k * 0.45) * 1.2, x0 = PT.lerp(70, DX + W / 2 + 330, Math.max(0, Math.min(1, ((t * 0.28 + k / 7) % 1) * 1.3 - 0.15))), sumiu = PT.ss((x0 - DX) / 220), py = DY + g * 140 + Math.sin(t * 2 + k) * 14; if (sumiu < 1) { discoP(x, x0, py, 22 * (1 - sumiu), CI, a1 * (1 - sumiu)); anelP(x, x0, py, 30, CI, a1 * 0.6 * (1 - sumiu), 3); } for (let q = 0; q < 6 * sumiu; q++) { const r = prng(k * 17 + q); discoP(x, x0 + (r() - 0.5) * 140 * sumiu, py + (r() - 0.5) * 140 * sumiu, 4, CI, a1 * 0.8 * (1 - sumiu)); } } }
    // plano 2: da sala pra cozinha — e esqueceu
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { casaCorte(x, a2); const q = PT.inOut((t - tS) / (tPr - tS + 0.6)); const [px, py] = andando(x, q, a2, t); const perdeu = PT.ss((t - tPr + 0.2) / 0.5); bolha(x, px - 40, py - 200, 70, CI, a2); copo(x, px - 40, py - 200, 0.8, CI, a2 * (1 - perdeu)); if (perdeu > 0) rotuloP(x, "?", px - 40, py - 200, 90, AM, a2 * perdeu * (0.8 + 0.2 * Math.sin(t * 5))); }
    // plano 3: o truque (lâmpada)
    const a3 = PT.ss((t - p3) / 0.5);
    if (a3 > 0.01) lampadaP(x, 540, 960, 4, a3, 0.5 + 0.5 * Math.sin(t * 4));
  });
};

// =============== 2. o experimento ===============
CENAS.experimento = (el, c, B) => {
  const tO = B("objetos"), tP1 = B("porta1"), tS = B("sala"), tA = B("adivinha"), tP2 = B("porta2"), tM = B("mesmo");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ano", 330, 62, "2011: o teste", "pt-ci"], ["dois", 330, 60, "com porta x sem porta", "pt-ci"], ["adv", 330, 92, "adivinha?", "pt-am"], ["por", 330, 66, "quem passou pela porta", "pt-ve"], ["mes", 330, 66, "e com salas de verdade, igual", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.ano, c.ini + 0.4, { from: 1.25 }); MD.leave(tl, tx.ano, tP1 - 1.2); MD.slam(tl, tx.dois, tP1 - 0.9, { from: 1.25 }); MD.leave(tl, tx.dois, tA - 0.3);
  MD.slam(tl, tx.adv, tA - 0.05, { from: 1.5 }); MD.leave(tl, tx.adv, tP2 - 0.3); MD.slam(tl, tx.por, tP2 - 0.05, { from: 1.3 }); MD.leave(tl, tx.por, tM - 1.6); MD.slam(tl, tx.mes, tM - 1.3, { from: 1.2 });
  const est = estF(5);
  const pB = tP1 - 1.0, pC = tA - 0.4, pD = tM - 1.4;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o mundo virtual — duas mesas e a caixa sendo levada
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { for (let k = 0; k < 9; k++) { linhaP(x, 540 + (k - 4) * 60, 760, 540 + (k - 4) * 220, 1400, CI, 0.25 * aA, 2); const y = 760 + k * k * 8; linhaP(x, 100, y, 980, y, CI, 0.2 * aA, 2); } fCaixa(x, 260, 1150, 220, 30, 6, AM, aA, 4, 0.2); fCaixa(x, 820, 1150, 220, 30, 6, AM, aA, 4, 0.2); const q = PT.ss(((t - tO + 0.5) % 4) / 3); fCaixa(x, PT.lerp(260, 820, q), 1100 - Math.sin(q * Math.PI) * 60, 70, 60, 8, CI, aA * PT.ss((t - tO + 0.5) / 0.4), 4, 0.25); }
    // plano B: dois caminhos, mesma distância — um com porta, outro sem
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { for (const [y, porta, nome] of [[860, true, "com porta"], [1240, false, "sem porta"]]) { linhaP(x, 120, y, 960, y, BRC, 0.4 * aB, 4); if (porta) portaG(x, 540, y - 90, 90, 180, aB); const u = ((t - pB) * 0.25) % 1; fPessoa(x, PT.lerp(140, 940, u), y - 40, 1.0, "255,226,190", aB); fCaixa(x, PT.lerp(140, 940, u) + 40, y - 70, 36, 30, 6, CI, aB, 3, 0.25); rotuloP(x, nome, 200, y + 50, 32, porta ? "255,226,170" : "180,230,255", aB, "left"); } }
    // plano C: o placar do esquecimento
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { const rev = PT.ss((t - tP2 + 0.3) / 0.6); const h1 = PT.lerp(200, 520, rev), h2 = PT.lerp(200, 260, rev); barraC(x, 360, 1250, h1, VE, aC, "com porta"); barraC(x, 720, 1250, h2, CI, aC, "sem porta"); rotuloP(x, "esquecimento", 540, 640, 40, "255,255,255", aC); if (rev < 0.3) rotuloP(x, "?", 540, 1000, 140, AM, aC * (1 - rev * 3)); }
    // plano D: com salas de verdade, deu o mesmo
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { casaCorte(x, aD); const [px, py] = andando(x, PT.ss((t - pD) / 1.6), aD, t); bolha(x, px - 40, py - 200, 70, CI, aD); rotuloP(x, "?", px - 40, py - 200, 90, AM, aD * PT.ss((t - pD - 1.0) / 0.4)); }
  });
};

// =============== 3. os capítulos do dia ===============
CENAS.capitulos = (el, c, B) => {
  const tF = B("filme"), tC = B("capitulos"), tFi = B("fim"), tA = B("arquiva"), tG = B("gaveta");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["por", 330, 86, "por quê?", "pt-am"], ["fil", 330, 62, "não é um filme contínuo", "pt-ci"], ["cap", 330, 66, "são capítulos", "pt-am"], ["fim", 330, 70, "porta = fim do episódio", "pt-ve"], ["gav", 330, 62, "a intenção fica na gaveta", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.por, c.ini + 0.2, { from: 1.4 }); MD.leave(tl, tx.por, tF - 1.6); MD.slam(tl, tx.fil, tF - 1.3, { from: 1.25 }); MD.leave(tl, tx.fil, tC - 0.35); MD.slam(tl, tx.cap, tC - 0.05, { from: 1.3 }); MD.leave(tl, tx.cap, tFi - 0.35);
  MD.slam(tl, tx.fim, tFi - 0.05, { from: 1.35 }); MD.leave(tl, tx.fim, tA - 0.35); MD.slam(tl, tx.gav, tA - 0.05, { from: 1.25 });
  const est = estF(7);
  const pB = tC - 0.6, pC = tFi - 0.6, pD = tA - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o rolo de filme contínuo (riscado)
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { filmeC(x, 540, 1000, 1200, aA, -((t * 120) % 200)); const aX = PT.ss((t - tF + 0.3) / 0.3); linhaP(x, 240, 820, 840, 1180, VE, aA * aX, 12); }
    // plano B: o filme se corta em episódios
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const k = PT.ss((t - tC + 0.3) / 0.6); filmeC(x, 540, 1000, 900, aB, 0, k); ["EP 1: SALA", "EP 2: COZINHA"].forEach((nm, j) => rotuloP(x, nm, j ? 760 : 320, 1180, 32, j ? "180,230,255" : "200,190,255", aB * k)); }
    // plano C: a porta é o "FIM" do episódio
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { portaG(x, 540, 1000, 340, 620, aC); rotuloP(x, "FIM", 540, 1000, 120, "255,226,140", aC * PT.ss((t - tFi + 0.1) / 0.3)); }
    // plano D: o cérebro arquiva — a gaveta fecha com a intenção dentro
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) gavetaC(x, 540, 1050, aD, 1 - PT.ss((t - tG + 1.0) / 0.8), t);
  });
};

// =============== 4. voltar ajuda ===============
CENAS.voltar = (el, c, B) => {
  const tV = B("volta"), tL = B("lembra"), tVi = B("virada");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["vol", 330, 70, "voltou pro sofá...", "pt-ci"], ["lem", 330, 86, "lembrou!", "pt-am"], ["vir", 330, 76, "mas tem uma virada", "pt-ve"]]);
  MD.arrive(tl, tx.vol, tV - 0.2, { y: 14 }); MD.leave(tl, tx.vol, tL - 0.3); MD.slam(tl, tx.lem, tL - 0.05, { from: 1.45 }); MD.leave(tl, tx.lem, tVi - 1.2); MD.slam(tl, tx.vir, tVi - 0.9, { from: 1.35 });
  const est = estF(9);
  const pB = tL - 0.4, pC = tVi - 1.0;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { casaCorte(x, aA); const [px, py] = andando(x, PT.inOut((t - c.ini) / (tL - c.ini)), aA, t, false); bolha(x, px - 40, py - 200, 70, CI, aA); rotuloP(x, "?", px - 40, py - 200, 90, AM, aA); }
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { gavetaC(x, 540, 1050, aB, PT.ss((t - tL + 0.3) / 0.6), t); lampadaP(x, 860, 720, 1.6, aB * PT.ss((t - tL) / 0.3), 1); }
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { for (let k = 0; k < 2; k++) { x.beginPath(); x.arc(540, 980, 200 + k * 60, 0.3 + t * (k ? -1.2 : 1.2), 0.3 + t * (k ? -1.2 : 1.2) + 4.6); x.strokeStyle = `rgba(${k ? VE : AM},${aC})`; x.lineWidth = 10; x.stroke(); } rotuloP(x, "!", 540, 990, 150, AM, aC); }
  });
};

// =============== 5. a virada ===============
CENAS.virada = (el, c, B) => {
  const tT = B("teste"), tD = B("diferenca"), tO = B("ocupada"), tE = B("empurrao"), tC = B("cheia");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ano", 330, 62, "2021: refizeram o teste", "pt-ci"], ["dif", 330, 66, "só a porta: quase nada", "pt-ci"], ["ocu", 330, 70, "com a cabeça ocupada...", "pt-am"], ["emp", 330, 62, "a porta dá o empurrão", "pt-ci"], ["che", 330, 70, "a cabeça cheia derruba", "pt-ve"]]);
  MD.slam(tl, tx.ano, tT - 0.3, { from: 1.25 }); MD.leave(tl, tx.ano, tD - 0.35); MD.slam(tl, tx.dif, tD - 0.05, { from: 1.25 }); MD.leave(tl, tx.dif, tO - 0.35); MD.slam(tl, tx.ocu, tO - 0.05, { from: 1.3 }); MD.leave(tl, tx.ocu, tE - 0.35);
  MD.slam(tl, tx.emp, tE - 0.05, { from: 1.25 }); MD.leave(tl, tx.emp, tC - 0.3); MD.slam(tl, tx.che, tC - 0.05, { from: 1.35 });
  const est = estF(11);
  const pB = tD - 0.6, pC = tO - 0.8, pD = tE - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o óculos de realidade virtual
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { oculosVR(x, 540, 980, 1.4 + 0.05 * Math.sin(t * 2), aA); rotuloP(x, "Londres", 540, 1260, 40, "180,230,255", aA); }
    // plano B: só a porta — quase não muda
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { portaG(x, 300, 980, 220, 420, aB); rotuloP(x, "=", 540, 980, 100, "255,255,255", aB); barraC(x, 780, 1200, PT.lerp(60, 90, PT.ss((t - tD) / 0.6)), CI, aB, "esqueceu"); }
    // plano C: com a cabeça ocupada (conta), o esquecimento sobe
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { fPessoa(x, 330, 1140, 3.4, "255,226,190", aC); ["7 × 8", "+ 13", "÷ 3", "= ?"].forEach((s2, k) => { const an = t * 0.9 + k * 1.57; rotuloP(x, s2, 330 + Math.cos(an) * 190, 760 + Math.sin(an) * 70, 44, "255,226,140", aC); }); barraC(x, 800, 1200, PT.lerp(90, 460, PT.ss((t - tO) / 0.8)), VE, aC, "esqueceu"); }
    // plano D: porta + cabeça cheia = esqueceu (dominó)
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { portaG(x, 220, 1000, 160, 320, aD); fSeta(x, 320, 1000, 420, 1000, AM, aD, 8); for (let k = 0; k < 5; k++) { const cai = PT.ss((t - tC + 0.3 - k * 0.12) / 0.3), ang = cai * 1.2; x.save(); x.translate(480 + k * 110, 1150); x.rotate(ang); fCaixa(x, 0, -110, 50, 220, 8, k === 4 ? VE : BRC, aD, 5, 0.12); x.restore(); } }
  });
};

// =============== 6. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tE = B("esq2"), tCa = B("casa"), tT = B("teoria");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["cas", 330, 62, "e o caminho de casa?", "pt-ci"], ["teo", 330, 80, "qual a sua teoria?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, tE - 0.5);
  MD.slam(tl, tx.cas, tE - 0.2, { from: 1.25 }); MD.leave(tl, tx.cas, tT - 0.35); MD.slam(tl, tx.teo, tT - 0.05, { from: 1.4 });
  const est = estF(21);
  const pB = tE - 0.6, pC = tT - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    balaoCom(x, 540, 960, 1.2, PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4)), "?", t);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const rota = [[180, 1300], [180, 1000], [540, 1000], [540, 760], [860, 760]]; fLinhaPts(x, rota, PT.ss((t - pB) / 1.6), CI, aB, 8); [[300, 1180], [700, 900], [420, 860]].forEach(([px, py]) => portaG(x, px, py, 70, 120, aB * 0.8)); fCaixa(x, 860, 700, 150, 110, 8, AM, aB, 5, 0.12); x.beginPath(); x.moveTo(770, 650); x.lineTo(860, 580); x.lineTo(950, 650); x.strokeStyle = `rgba(${AM},${aB})`; x.lineWidth = 6; x.stroke(); rotuloP(x, "casa", 860, 830, 34, "255,226,140", aB); }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { balaoCom(x, 540, 900, 1.1, aC, "?", t); setaComent(x, aC, t); }
  });
};

// =============== 7. o truque prometido ===============
CENAS.dica = (el, c, B) => {
  const tA = B("alta"), tI = B("imagina"), tF = B("forca"), tS = B("saiu");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pro", 330, 66, "o truque prometido", "pt-am"], ["fal", 330, 66, "fala em voz alta", "pt-ci"], ["ima", 330, 62, "ou imagina pegando", "pt-ci"], ["for", 330, 62, "grava com mais força", "pt-am"], ["vol", 330, 62, "esqueceu? volta pro lugar", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.pro, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.pro, tA - 0.6); MD.slam(tl, tx.fal, tA - 0.3, { from: 1.3 }); MD.leave(tl, tx.fal, tI - 0.9); MD.slam(tl, tx.ima, tI - 0.6, { from: 1.25 }); MD.leave(tl, tx.ima, tF - 0.35);
  MD.slam(tl, tx.for, tF - 0.05, { from: 1.25 }); MD.leave(tl, tx.for, tS - 1.9); MD.slam(tl, tx.vol, tS - 1.6, { from: 1.2 });
  const est = estF(13);
  const pB = tA - 0.6, pC = tI - 0.6, pD = tS - 1.6;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) lampadaP(x, 540, 960, 4, aA, 0.6 + 0.4 * Math.sin(t * 4));
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { fPessoa(x, 360, 1150, 3.2, "255,226,190", aB); fCaixa(x, 700, 760, 420, 120, 50, AM, aB, 5, 0.15); x.beginPath(); x.moveTo(560, 810); x.lineTo(480, 900); x.lineTo(620, 820); x.fillStyle = `rgba(${AM},${0.5 * aB})`; x.fill(); rotuloP(x, "copo d'água!", 700, 760, 42, "255,255,255", aB); for (let k = 0; k < 3; k++) { const u = ((t * 1.2 + k / 3) % 1); x.beginPath(); x.arc(440, 860, 40 + u * 80, -0.6, 0.6); x.strokeStyle = `rgba(${AM},${aB * (1 - u)})`; x.lineWidth = 4; x.stroke(); } }
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { bolha(x, 540, 880, 230, CI, aC); copo(x, 560, 880, 2.6, CI, aC); medidor(x, 540, 1340, PT.lerp(0.4, 0.95, PT.ss((t - tF + 0.4) / 0.8)), aC, "LEMBRANÇA"); }
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { casaCorte(x, aD); const [px, py] = andando(x, PT.inOut((t - pD) / 1.8), aD, t, false); const lem = PT.ss((t - pD - 1.6) / 0.4); bolha(x, px - 40, py - 200, 70, CI, aD); if (lem > 0) copo(x, px - 40, py - 200, 0.8, CI, aD * lem); else rotuloP(x, "?", px - 40, py - 200, 90, AM, aD); }
  });
};

// =============== 8. resumo relâmpago + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [560, 720, 880], textos = ["o dia é dividido em capítulos", "a porta fecha o capítulo", "a cabeça cheia faz o resto"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 54, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(19);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    portaG(x, 540, 1240, 150, 260, 0.7 * sai * PT.ss((t - c.ini) / 0.5));
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [CI, AM, VE][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
