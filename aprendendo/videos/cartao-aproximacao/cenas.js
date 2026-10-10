// Cenas do vídeo "Como o cartão por aproximação funciona sem bateria" — pontos de luz na GPU.
// Retenção: paradoxo (paga sem bateria), promessa (por que copiar o sinal não adianta), antena escondida,
// indução (a energia vem da maquininha), assombro (13 milhões de vezes por segundo) e dica do limite.

const MD = MotionDirector;
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245", OURO = "240,200,110";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.5);

// cartão com chip; espiral = antena (aparece com a)
function cartao(x, cx, cy, s, a, antena = 0, corrente = 0, t = 0, ang = 0) {
  if (a <= 0.01) return; x.save(); x.translate(cx, cy); x.rotate(ang);
  fCaixa(x, 0, 0, 540 * s, 340 * s, 28 * s, "120,170,255", a, 5 * s, 0.1);
  fCaixa(x, -150 * s, -30 * s, 90 * s, 70 * s, 10 * s, OURO, a, 4 * s, 0.35); linhaP(x, -195 * s, -30 * s, -105 * s, -30 * s, OURO, a, 2 * s); linhaP(x, -150 * s, -65 * s, -150 * s, 5 * s, OURO, a, 2 * s);
  for (let k = 0; k < 4; k++) discoP(x, 60 * s + k * 50 * s, 100 * s, 8 * s, "200,210,230", 0.5 * a);
  if (antena > 0) for (let v = 0; v < 4; v++) { const m = (20 + v * 14) * s; fRR(x, -270 * s + m, -170 * s + m, 540 * s - 2 * m, 340 * s - 2 * m, 20 * s); x.strokeStyle = `rgba(${AM},${antena * a * 0.8})`; x.lineWidth = 3 * s; x.stroke(); }
  if (corrente > 0) for (let q = 0; q < 10; q++) { const u = ((t * 0.5 + q / 10) % 1), per = 2 * (500 + 300) * s, d = u * per; let px, py; const w = 480 * s, h = 280 * s; if (d < w) { px = -w / 2 + d; py = -h / 2; } else if (d < w + h) { px = w / 2; py = -h / 2 + d - w; } else if (d < 2 * w + h) { px = w / 2 - (d - w - h); py = h / 2; } else { px = -w / 2; py = h / 2 - (d - 2 * w - h); } discoP(x, px, py, 7 * s, AM, corrente * a); brilhoP(x, px, py, 26 * s, AM, 0.5 * corrente * a); }
  x.restore();
}
function maquininha(x, cx, cy, s, a, apito = 0) { if (a <= 0.01) return; fCaixa(x, cx, cy, 300 * s, 480 * s, 40 * s, BRC, a, 5 * s, 0.06); fCaixa(x, cx, cy - 120 * s, 220 * s, 140 * s, 14 * s, apito > 0 ? VD : CI, a, 4 * s, 0.15 + 0.3 * apito); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) discoP(x, cx - 70 * s + i * 70 * s, cy + 30 * s + j * 50 * s, 14 * s, "200,210,230", 0.5 * a); if (apito > 0) { rotuloP(x, "APROVADO", cx, cy - 120 * s, 30 * s, "150,255,200", a * apito); brilhoP(x, cx, cy - 120 * s, 160 * s, VD, 0.4 * apito * a); } }
function campo(x, cx, cy, t, a, n = 5, R = 300) { if (a <= 0.01) return; for (let k = 0; k < n; k++) { const u = ((t * 0.8 + k / n) % 1); x.beginPath(); x.ellipse(cx, cy, 40 + u * R, 20 + u * R * 0.5, 0, Math.PI, 0); x.strokeStyle = `rgba(${CI},${a * (1 - u) * 0.8})`; x.lineWidth = 4; x.stroke(); } }

const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
function setaComent(x, a, t) { if (a <= 0.01) return; const b = Math.sin(t * 6) * 16; fSeta(x, 700 + b, 1250, 900 + b, 1250, AM, a, 12); brilhoP(x, 1010, 1250, 90, AM, 0.35 * a * (0.7 + 0.3 * Math.sin(t * 6))); rotuloP(x, "comentários", 780, 1180, 38, "255,226,140", a); }
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 330 * s, 60 * s, CI, a, 8 * s, 0.12);
  x.beginPath(); x.moveTo(cx - 120 * s, cy + 160 * s); x.lineTo(cx - 190 * s, cy + 250 * s); x.lineTo(cx - 40 * s, cy + 160 * s); x.fillStyle = `rgba(${CI},${0.5 * a})`; x.fill();
  brilhoP(x, cx, cy, 380 * s, CI, 0.18 * a); rotuloP(x, txt, cx, cy + 6 * s, 190 * s, "255,226,140", a * (0.85 + 0.15 * Math.sin(t * 4)));
}
function riscoX(x, cx, cy, r, a) { if (a <= 0.01) return; linhaP(x, cx - r, cy - r, cx + r, cy + r, VE, a, 9); linhaP(x, cx - r, cy + r, cx + r, cy - r, VE, a, 9); }
function bateriaI(x, cx, cy, s, a) { if (a <= 0.01) return; fCaixa(x, cx, cy, 160 * s, 80 * s, 12 * s, "170,178,195", a, 5, 0.05); fCaixa(x, cx + 90 * s, cy, 16 * s, 30 * s, 4 * s, "170,178,195", a, 4, 0.3); linhaP(x, cx - 100 * s, cy - 60 * s, cx + 100 * s, cy + 60 * s, VE, a, 8); }
function chaveI(x, cx, cy, s, a) { if (a <= 0.01) return; anelP(x, cx - 60 * s, cy, 40 * s, AM, a, 8 * s); linhaP(x, cx - 20 * s, cy, cx + 110 * s, cy, AM, a, 10 * s); linhaP(x, cx + 80 * s, cy, cx + 80 * s, cy + 30 * s, AM, a, 8 * s); linhaP(x, cx + 105 * s, cy, cx + 105 * s, cy + 22 * s, AM, a, 8 * s); }
function bancoI(x, cx, cy, s, a) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 170 * s, cy - 90 * s); x.lineTo(cx, cy - 180 * s); x.lineTo(cx + 170 * s, cy - 90 * s); x.closePath(); x.strokeStyle = `rgba(${BRC},${a})`; x.lineWidth = 6; x.stroke(); for (let k = 0; k < 4; k++) linhaP(x, cx - 120 * s + k * 80 * s, cy - 70 * s, cx - 120 * s + k * 80 * s, cy + 80 * s, BRC, a, 10 * s); linhaP(x, cx - 180 * s, cy + 100 * s, cx + 180 * s, cy + 100 * s, BRC, a, 8 * s); rotuloP(x, "BANCO", cx, cy - 115 * s, 30 * s, "220,228,245", a); }
function bolhaFala(x, cx, cy, w, txt, cor, a, ladoEsq) { if (a <= 0.01) return; fCaixa(x, cx, cy, w, 90, 40, cor, a, 4, 0.15); x.beginPath(); const bx = ladoEsq ? cx - w / 2 + 50 : cx + w / 2 - 50; x.moveTo(bx - 15, cy + 44); x.lineTo(bx + (ladoEsq ? -30 : 30), cy + 80); x.lineTo(bx + 15, cy + 44); x.fillStyle = `rgba(${cor},${0.5 * a})`; x.fill(); rotuloP(x, txt, cx, cy, 34, "255,255,255", a); }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tB = B("bateria"), tM = B("meio0"), tE = B("energia"), tP = B("promessa");
  const p2 = tB + 1.4, p3 = tM + 0.5, p4 = tP - 2.2;
  mostrarGancho(p2 - 0.1);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["meio", 330, 76, "em 0,5 segundo", "pt-am"], ["ene", 330, 66, "de onde vem a energia?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["cop", 330, 62, "copiar não adianta: no final", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.meio, tM - 0.1, { from: 1.35 }); MD.leave(tl, tx.meio, tE - 0.35); MD.slam(tl, tx.ene, tE - 0.05, { from: 1.25 }); MD.leave(tl, tx.ene, p4); MD.slam(tl, tx.cop, p4 + 0.2, { from: 1.2 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano 1 (quadro 0): o cartão brilhando e a bateria riscada
    const a1 = 1 - PT.ss((t - p2) / 0.4);
    if (a1 > 0.01) { brilhoP(x, 540, 860, 380, "240,200,120", 0.25 * a1); cartao(x, 540, 860, 1.0, a1, 0, 0, t, -0.12 + Math.sin(t) * 0.03); bateriaI(x, 540, 1250, 1.3, a1 * PT.ss((t - 0.1) / 0.3)); }
    // plano 2: liga → conversa → código secreto, em meio segundo
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { const span = Math.max(1.2, tM - p2 - 0.4); ["liga", "conversa", "código secreto"].forEach((nm, k) => { const q = PT.ss((t - p2 - 0.2 - k * span / 3) / 0.3), y = 720 + k * 200; fCaixa(x, 540, y, 520, 120, 60, [VD, CI, AM][k], a2 * q, 5, 0.15); rotuloP(x, nm, 540, y, 48, "255,255,255", a2 * q); if (k < 2) fSeta(x, 540, y + 65, 540, y + 130, BRC, a2 * q * 0.7, 5); }); const cr = PT.ss((t - tM + 0.6) / 0.5); rotuloP(x, `${(cr * 0.5).toFixed(2).replace(".", ",")} s`, 540, 1340, 64, "150,255,200", a2 * PT.ss((t - tM + 0.8) / 0.3)); }
    // plano 3: encosta na maquininha e apita
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) { const enc = PT.inOut((t - p3) / 1.0), apito = PT.ss((t - p3 - 1.0) / 0.2); maquininha(x, 540, 1060, 1, a3, apito); cartao(x, 540, PT.lerp(640, 860, enc), 0.8, a3, 0, 0, t, -0.15 * (1 - enc)); if (apito > 0) for (let k = 0; k < 3; k++) anelP(x, 540, 900, 60 + k * 50 + (t - p3 - 1) * 200 % 200, VD, a3 * apito * (1 - k * 0.3), 4); rotuloP(x, "?", 860, 760, 140, AM, a3 * PT.ss((t - tE + 0.3) / 0.4)); }
    // plano 4: a cópia (cartão fantasma) — riscada
    const a4 = PT.ss((t - p4) / 0.5);
    if (a4 > 0.01) { cartao(x, 420, 980, 0.7, a4, 0, 0, t, -0.1); cartao(x, 680, 1060, 0.7, a4 * 0.4, 0, 0, t, -0.1); riscoX(x, 680, 1060, 120, a4 * PT.ss((t - p4 - 0.6) / 0.3)); }
  });
};

// =============== 2. a antena escondida ===============
CENAS.antena = (el, c, B) => {
  const tV = B("voltas"), tA = B("antena"), tC = B("chip"), tCa = B("campo"), tT = B("treze");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["fio", 330, 66, "um fio dando voltas", "pt-ci"], ["ant", 330, 76, "é uma antena", "pt-am"], ["chi", 330, 66, "+ um chip minúsculo", "pt-am"], ["cam", 330, 62, "a máquina solta um campo", "pt-ci"], ["tre", 330, 62, "13 milhões de vezes por segundo", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.fio, tV - 0.1, { from: 1.25 }); MD.leave(tl, tx.fio, tA - 0.35); MD.slam(tl, tx.ant, tA - 0.05, { from: 1.35 }); MD.leave(tl, tx.ant, tC - 0.3); MD.slam(tl, tx.chi, tC - 0.05, { from: 1.25 }); MD.leave(tl, tx.chi, tCa - 0.6); MD.slam(tl, tx.cam, tCa - 0.3, { from: 1.25 }); MD.leave(tl, tx.cam, tT - 1.2); MD.slam(tl, tx.tre, tT - 0.9, { from: 1.2 });
  const est = estF(5);
  const pB = tC - 0.4, pC = tCa - 0.8, pD = tT - 1.0;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) cartao(x, 540, 980, 1.6, aA, PT.ss((t - tV + 0.4) / 0.8), 0, t, 0);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { fCaixa(x, 540, 980, 420, 320, 40, OURO, aB, 8, 0.3); for (let k = 0; k < 6; k++) { linhaP(x, 330 + k * 84, 820, 330 + k * 84, 760, OURO, aB, 6); linhaP(x, 330 + k * 84, 1140, 330 + k * 84, 1200, OURO, aB, 6); } fCaixa(x, 540, 980, 160, 120, 10, AM, aB, 4, 0.3); brilhoP(x, 540, 980, 220, OURO, 0.3 * aB); rotuloP(x, "chip", 540, 1270, 40, "255,226,140", aB); }
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { maquininha(x, 540, 1120, 1.1, aC, 0); campo(x, 540, 830, t, aC, 6, 380); }
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { const n = Math.floor(PT.lerp(0, 13560000, PT.ss((t - pD) / 1.2))); rotuloP(x, n.toLocaleString("pt-BR"), 540, 980, 96, "255,226,140", aD); rotuloP(x, "vai e volta por segundo", 540, 1100, 40, "180,230,255", aD); campo(x, 540, 860, t * 3, aD * 0.6, 6, 300); }
  });
};

// =============== 3. a energia vem da máquina ===============
CENAS.inducao = (el, c, B) => {
  const tA = B("atravessa"), tC = B("corrente"), tS = B("semfio"), tAl = B("alimenta"), tAd = B("adivinha"), tCm = B("cm");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["atr", 330, 66, "o campo atravessa o fio", "pt-ci"], ["cor", 330, 70, "e vira corrente", "pt-am"], ["sem", 330, 62, "igual carregador sem fio", "pt-ci"], ["ali", 330, 62, "o cartão se alimenta da máquina", "pt-am", "white-space:normal;left:60px;width:960px"], ["adv", 330, 70, "adivinha: por que tão perto?", "pt-am", "white-space:normal;left:60px;width:960px"], ["cm", 330, 70, "a poucos cm, fica fraco", "pt-ve"]]);
  MD.slam(tl, tx.atr, tA - 0.1, { from: 1.25 }); MD.leave(tl, tx.atr, tC - 0.35); MD.slam(tl, tx.cor, tC - 0.05, { from: 1.3 }); MD.leave(tl, tx.cor, tS - 1.0); MD.slam(tl, tx.sem, tS - 0.7, { from: 1.25 }); MD.leave(tl, tx.sem, tAl - 0.35); MD.slam(tl, tx.ali, tAl - 0.05, { from: 1.2 }); MD.leave(tl, tx.ali, tAd - 0.35); MD.slam(tl, tx.adv, tAd - 0.05, { from: 1.3 }); MD.leave(tl, tx.adv, tCm - 0.4); MD.slam(tl, tx.cm, tCm - 0.1, { from: 1.3 });
  const est = estF(7);
  const pB = tC - 0.3, pC = tS - 0.8, pD = tAd - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { maquininha(x, 540, 1180, 0.9, aA, 0); campo(x, 540, 940, t, aA, 6, 360); cartao(x, 540, 820, 0.9, aA, 1, 0, t, 0); }
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { cartao(x, 540, 980, 1.5, aB, 1, PT.ss((t - tC + 0.2) / 0.4), t, 0); brilhoP(x, 540 - 150 * 1.5, 950, 140, OURO, 0.5 * aB * PT.ss((t - tC) / 0.5)); }
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { x.beginPath(); x.ellipse(540, 1200, 260, 60, 0, 0, 6.283); x.strokeStyle = `rgba(${BRC},${aC})`; x.lineWidth = 6; x.stroke(); fCelular(x, 540, 1000, 440, BRC, aC, 0.08); campo(x, 540, 1180, t, aC, 4, 200); const ch = PT.ss((t - pC) / 2.5); fCaixa(x, 540, 1000, 80, 140, 10, VD, aC, 4, 0.08); x.fillStyle = `rgba(${VD},${0.6 * aC})`; x.fillRect(506, 1066 - 132 * ch, 68, 132 * ch); if (t > tAl - 0.3) { cartao(x, 870, 760, 0.45, aC * PT.ss((t - tAl + 0.3) / 0.4), 1, 1, t, 0.2); rotuloP(x, "=", 720, 800, 70, "255,255,255", aC * PT.ss((t - tAl + 0.3) / 0.4)); } }
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { maquininha(x, 280, 1080, 0.8, aD, 0); const d = 0.5 + 0.5 * Math.sin((t - pD) * 1.4), cx2 = PT.lerp(420, 860, d), ok = d < 0.3; campo(x, 280, 900, t, aD, 5, 420); cartao(x, cx2, 900, 0.5, aD, 1, ok ? 1 : 0, t, 0); linhaP(x, 380, 1250, cx2, 1250, ok ? VD : VE, aD, 5); rotuloP(x, ok ? "perto: liga" : "longe: não liga", cx2, 1310, 34, ok ? "150,255,200" : "255,170,180", aD); }
  });
};

// =============== 4. a conversa ===============
CENAS.conversa = (el, c, B) => {
  const tA = B("acorda"), tP = B("pergunta"), tAs = B("assinatura"), tAp = B("aprova"), tM = B("meio");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["aco", 330, 76, "o chip acorda", "pt-am"], ["con", 330, 66, "e conversa com a máquina", "pt-ci"], ["apr", 330, 86, "aprovado", "pt-ci", "color:#78ffbe"], ["mei", 330, 70, "tudo em 0,5 s", "pt-am"]]);
  MD.slam(tl, tx.aco, tA - 0.1, { from: 1.35 }); MD.leave(tl, tx.aco, tP - 0.6); MD.slam(tl, tx.con, tP - 0.4, { from: 1.25 }); MD.leave(tl, tx.con, tAp - 0.35); MD.slam(tl, tx.apr, tAp - 0.05, { from: 1.45 }); MD.leave(tl, tx.apr, tM - 0.35); MD.slam(tl, tx.mei, tM - 0.05, { from: 1.3 });
  const est = estF(9);
  const pB = tP - 0.5, pC = tAp - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { const ac = PT.ss((t - tA + 0.3) / 0.4); fCaixa(x, 540, 980, 360, 280, 30, OURO, aA, 7, 0.1 + 0.3 * ac); brilhoP(x, 540, 980, 340, OURO, 0.4 * aA * ac); rotuloP(x, ac > 0.5 ? "ON" : "zzz", 540, 985, 80, ac > 0.5 ? "255,226,140" : "160,170,190", aA); }
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { maquininha(x, 260, 1100, 0.7, aB, 0); cartao(x, 800, 1180, 0.55, aB, 1, 1, t, 0.1); bolhaFala(x, 420, 760, 420, "quem é você?", CI, aB * PT.ss((t - tP + 0.3) / 0.3), true); bolhaFala(x, 680, 920, 520, "cartão + assinatura", AM, aB * PT.ss((t - tAs + 0.4) / 0.3), false); }
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { bancoI(x, 300, 1050, 1.0, aC); maquininha(x, 780, 1080, 0.8, aC, PT.ss((t - tAp) / 0.3)); fSeta(x, 450, 1000, 640, 1000, VD, aC * PT.ss((t - tAp + 0.2) / 0.3), 6); }
  });
};

// =============== 5. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tM = B("maquina"), tN = B("nela"), tS = B("simnao");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["car", 330, 62, "dava pra carregar o celular?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["sim", 330, 86, "sim ou não?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, tM - 0.4); MD.slam(tl, tx.car, tM - 0.1, { from: 1.2 }); MD.leave(tl, tx.car, tS - 0.35); MD.slam(tl, tx.sim, tS - 0.05, { from: 1.45 });
  const est = estF(21);
  const pB = tM - 0.5, pC = tS - 0.4;
  T.quadro((x, t) => {
    estD(x, est, t);
    balaoCom(x, 540, 960, 1.2, PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4)), "?", t);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { maquininha(x, 540, 1150, 1.0, aB, 0); campo(x, 540, 900, t, aB, 5, 300); fCelular(x, 540, 760, 360, BRC, aB, 0.08); fCaixa(x, 540, 760, 60, 100, 8, VD, aB, 4, 0.05); rotuloP(x, "?", 820, 700, 120, AM, aB * PT.ss((t - tN + 0.4) / 0.4)); }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { balaoCom(x, 540, 900, 1.1, aC, "?", t); setaComent(x, aC, t); }
  });
};

// =============== 6. por que copiar não adianta ===============
CENAS.seguranca = (el, c, B) => {
  const tM = B("muda"), tC = B("chave"), tU = B("umavez"), tCo = B("copiar"), tR = B("recusa");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pro", 330, 62, "a parte prometida", "pt-am"], ["mud", 330, 62, "o código muda a cada compra", "pt-ci", "white-space:normal;left:60px;width:960px"], ["cha", 330, 62, "a chave nunca sai do chip", "pt-am"], ["vez", 330, 76, "vale uma vez só", "pt-ci"], ["rec", 330, 86, "recusado", "pt-ve"]]);
  MD.slam(tl, tx.pro, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.pro, tM - 0.5); MD.slam(tl, tx.mud, tM - 0.2, { from: 1.2 }); MD.leave(tl, tx.mud, tC - 0.35); MD.slam(tl, tx.cha, tC - 0.05, { from: 1.25 }); MD.leave(tl, tx.cha, tU - 0.35); MD.slam(tl, tx.vez, tU - 0.05, { from: 1.35 }); MD.leave(tl, tx.vez, tR - 0.35); MD.slam(tl, tx.rec, tR - 0.05, { from: 1.5 });
  const est = estF(11), hex = "0123456789ABCDEF";
  const pB = tC - 0.5, pC = tU - 0.5, pD = tCo - 0.6;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { const n = 1 + Math.floor(Math.max(0, t - c.ini) / 0.9); for (let k = 0; k < Math.min(n, 5); k++) { const r = prng(k * 7 + 3); let cod = ""; for (let q = 0; q < 8; q++) cod += hex[Math.floor(r() * 16)]; const usado = k < n - 1, y = 680 + k * 130; fCaixa(x, 540, y, 560, 90, 14, usado ? "120,128,150" : AM, aA, 4, 0.1); rotuloP(x, `compra ${k + 1}: ${cod}`, 540, y, 38, usado ? "150,160,190" : "255,240,190", aA); } }
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { fCaixa(x, 540, 980, 380, 300, 30, OURO, aB, 7, 0.2); chaveI(x, 520, 980, 1.4, aB); anelP(x, 540, 980, 230, OURO, aB * 0.5, 4); rotuloP(x, "dentro do chip", 540, 1200, 36, "255,226,140", aB); }
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { fCaixa(x, 540, 980, 600, 260, 20, AM, aC, 6, 0.1); rotuloP(x, "código: 7F3A91C2", 540, 940, 48, "255,240,190", aC); rotuloP(x, "R$ 23,90 · esta compra", 540, 1020, 34, "255,226,140", aC); const st = PT.ss((t - tU + 0.2) / 0.3); x.save(); x.translate(760, 1140); x.rotate(-0.2); fCaixa(x, 0, 0, 280, 80, 10, VD, aC * st, 6, 0.15); rotuloP(x, "1 VEZ SÓ", 0, 3, 40, "150,255,200", aC * st); x.restore(); }
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { fCaixa(x, 260, 900, 160, 110, 14, VE, aD, 5, 0.15); rotuloP(x, "copiador", 260, 990, 30, "255,170,180", aD); fSeta(x, 360, 900, 620, 900, VE, aD, 6); bancoI(x, 780, 960, 0.9, aD); const aR = PT.ss((t - tR + 0.3) / 0.3); x.save(); x.translate(780, 1180); x.rotate(-0.15); fCaixa(x, 0, 0, 380, 100, 12, VE, aD * aR, 7, 0.15); rotuloP(x, "RECUSADO", 0, 4, 52, "255,140,160", aD * aR); x.restore(); }
  });
};

// =============== 7. a dica ===============
CENAS.dica = (el, c, B) => {
  const tL = B("limite"), tA = B("app"), tR = B("risco");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dic", 330, 66, "a dica", "pt-am"], ["lim", 330, 62, "baixe o limite sem senha", "pt-ci"], ["ris", 330, 62, "menos limite, menos risco", "pt-am"]]);
  MD.slam(tl, tx.dic, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.dic, tL - 0.4); MD.slam(tl, tx.lim, tL - 0.1, { from: 1.25 }); MD.leave(tl, tx.lim, tR - 0.4); MD.slam(tl, tx.ris, tR - 0.1, { from: 1.25 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    const a0 = PT.ss((t - c.ini) / 0.4), cx = 540, cy = 980;
    fCelular(x, cx, cy, 820, BRC, a0, 0.06); rotuloP(x, "app do banco", cx, cy - 300, 36, "220,228,245", a0);
    const aL = PT.ss((t - tL + 0.4) / 0.4); if (aL > 0) { rotuloP(x, "aproximação sem senha", cx, cy - 150, 32, "255,226,140", aL); const v = PT.lerp(1, 0.25, PT.ss((t - tA + 0.6) / 1.0)); linhaP(x, cx - 160, cy, cx + 160, cy, "120,128,150", aL, 10); linhaP(x, cx - 160, cy, cx - 160 + 320 * v, cy, AM, aL, 10); discoP(x, cx - 160 + 320 * v, cy, 22, AM, aL); rotuloP(x, `R$ ${Math.round(PT.lerp(200, 50, PT.ss((t - tA + 0.6) / 1.0)))}`, cx, cy + 90, 64, "255,226,140", aL); }
    const aR = PT.ss((t - tR + 0.3) / 0.4); if (aR > 0) { fCaixa(x, cx, cy + 260, 300, 80, 40, VD, aR, 4, 0.15); rotuloP(x, "salvo", cx, cy + 262, 36, "150,255,200", aR); }
  });
};

// =============== 8. resumo relâmpago + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [560, 720, 880], textos = ["a máquina cria um campo", "a antena vira o campo em energia", "o chip responde: código de 1 vez"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    cartao(x, 540, 1260, 0.6, 0.7 * sai * PT.ss((t - c.ini) / 0.5), 1, 1, t, -0.1);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [CI, OURO, AM][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
