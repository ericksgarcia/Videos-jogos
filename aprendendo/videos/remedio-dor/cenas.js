// Cenas do vídeo "Como o remédio sabe onde está doendo" — pontos de luz na GPU.
// Retenção: dor do dia a dia (o comprimido vai pra barriga e a cabeça melhora), paradoxo ("ele não
// sabe"), assombro (o sangue dá a volta no corpo em ~1 min), mistério do paracetamol e dica prática.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const CI = "143,227,255", AM = "255,210,63", VE = "255,90,110", VD = "120,255,190", LA = "255,150,70", BRR = "230,235,250";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.5);

// corpo humano em pontos (de frente), coordenadas -1..1 (y para baixo); estômago em (0.08, -0.12)
const CORPO = (() => { const r = prng(55), o = []; const dentro = (x, y) => Math.hypot(x, (y + 0.8) * 0.95) < 0.15 || (Math.abs(x) < 0.05 && y > -0.67 && y < -0.58) || (y > -0.6 && y < 0.1 && Math.abs(x) < 0.28 - 0.06 * (y + 0.6)) || (y > -0.56 && y < 0.12 && Math.abs(x) > 0.25 && Math.abs(x) < 0.25 + 0.09 - (y + 0.56) * 0.02 && Math.abs(x) < 0.36 + (y + 0.56) * 0.05 && Math.abs(x) > 0.27 + (y + 0.56) * 0.05) || (y > 0.08 && y < 0.95 && Math.abs(x) > 0.02 && Math.abs(x) < 0.21 - (y - 0.08) * 0.07); while (o.length < 16000) { const x = r() * 2 - 1, y = r() * 2 - 1; if (dentro(x, y)) o.push({ x, y, d: Math.hypot(x - 0.08, (y + 0.12) * 1.1), n: r() }); } return o; })();
function corpo(nv, cx, cy, esc, a, cor, fn) { let i = nv.k; for (const p of CORPO) { const [c, al] = fn ? fn(p) : [cor, 1]; nv.ponto(i++, cx + p.x * esc, cy + p.y * esc, c[0], c[1], c[2], a * al * (0.3 + 0.35 * p.n), 3.3); } nv.total(i); }
// comprimido (cápsula) em 2D
function capsula(x, cx, cy, s, ang, a) { if (a <= 0.01) return; x.save(); x.translate(cx, cy); x.rotate(ang); fRR(x, -40 * s, -16 * s, 80 * s, 32 * s, 16 * s); x.fillStyle = `rgba(255,255,255,${0.25 * a})`; x.fill(); x.strokeStyle = `rgba(255,255,255,${a})`; x.lineWidth = 4 * s; x.stroke(); fRR(x, 0, -16 * s, 40 * s, 32 * s, 16 * s); x.fillStyle = `rgba(${LA},${0.6 * a})`; x.fill(); x.restore(); brilhoP(x, cx, cy, 60 * s, "255,255,255", 0.3 * a); }
function medidor(x, cx, cy, v, a, rot) { if (a <= 0.01) return; for (let k = 0; k < 10; k++) { const on = k < Math.round(v * 10), cor = k < 4 ? "120,255,190" : k < 7 ? "255,210,63" : "255,110,130"; fCaixa(x, cx - 225 + k * 50, cy, 38, 60, 8, on ? cor : "120,128,150", a * (on ? 1 : 0.3), 3, on ? 0.5 : 0.05); } rotuloP(x, rot, cx, cy - 62, 30, "255,255,255", 0.85 * a); }
// engrenagem (a "máquina" COX)
function engrenagem(x, cx, cy, R, ang, cor, a) { if (a <= 0.01) return; x.beginPath(); for (let k = 0; k <= 48; k++) { const u = k / 48 * 6.283 + ang, rr = R * (Math.floor(k / 2) % 2 ? 1 : 0.8); k ? x.lineTo(cx + Math.cos(u) * rr, cy + Math.sin(u) * rr) : x.moveTo(cx + Math.cos(u) * rr, cy + Math.sin(u) * rr); } x.closePath(); x.fillStyle = `rgba(${cor},${0.12 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 6; x.stroke(); anelP(x, cx, cy, R * 0.32, cor, a, 6); }
function inchaco(x, cx, cy, k, a) { if (a <= 0.01) return; x.beginPath(); x.ellipse(cx, cy, 90 + 70 * k, 60 + 45 * k, 0, 0, 6.283); x.fillStyle = `rgba(255,90,110,${0.12 * a * k})`; x.fill(); x.strokeStyle = `rgba(255,150,160,${a})`; x.lineWidth = 5; x.stroke(); brilhoP(x, cx, cy, 120 + 80 * k, VE, 0.3 * a * k); }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tC = B("cabeca"), tB = B("barriga"), tI = B("ir"), tN = B("naosabe"), tE = B("erro");
  mostrarGancho(tB + 0.8);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ir", 330, 70, "como ele sabe onde ir?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["nao", 330, 96, "ele não sabe", "pt-ve"]]);
  MD.slam(tl, tx.ir, tI - 0.1, { from: 1.25 }); MD.leave(tl, tx.ir, tN - 0.35); MD.slam(tl, tx.nao, tN - 0.05, { from: 1.4 });
  const nv = T.nuvem(16100), est = estF(3), CX = 540, CY = 1000, E = 400;
  T.quadro((x, t) => {
    estD(x, est, t);
    corpo(nv, CX, CY, E, 1, [0.6, 0.75, 1.0]);
    // dor na cabeça (pulsando), que some depois
    const dor = 1 - PT.ss((t - tN) / 2); if (dor > 0) { const pu = 0.7 + 0.3 * Math.sin(t * 7); brilhoP(x, CX, CY - 0.8 * E, 120 * pu, VE, 0.7 * dor); for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283 + t; linhaP(x, CX + Math.cos(an) * 80, CY - 0.8 * E + Math.sin(an) * 80, CX + Math.cos(an) * 110, CY - 0.8 * E + Math.sin(an) * 110, VE, dor * pu, 5); } }
    // o comprimido descendo até a barriga
    // quadro 0: o comprimido grande, apontando pra cabeça... e riscado
    const a0 = 1 - PT.ss((t - tC - 1.1) / 0.4); if (a0 > 0.01) { capsula(x, CX + 300, CY - 0.95 * E, 2.2, -0.5 + Math.sin(t * 2) * 0.1, a0); x.setLineDash([12, 12]); linhaP(x, CX + 230, CY - 0.92 * E, CX + 80, CY - 0.82 * E, AM, 0.7 * a0, 4); x.setLineDash([]); const aX = PT.ss((t - tC - 0.4) / 0.3) * a0; linhaP(x, CX + 120, CY - 0.95 * E, CX + 200, CY - 0.75 * E, VE, aX, 10); linhaP(x, CX + 120, CY - 0.75 * E, CX + 200, CY - 0.95 * E, VE, aX, 10); }
    const q = PT.inOut((t - tC - 1.1) / (tB - tC - 0.9)); if (t > tC + 0.9) capsula(x, PT.lerp(CX + 300, CX + 0.04 * E, PT.ss(q * 3)), PT.lerp(CY - 0.95 * E, CY - 0.12 * E, q), 1 + 1.2 * (1 - PT.ss(q * 2)), 0.4 + q, PT.ss((t - tC - 0.9) / 0.3) * (1 - PT.ss((t - tI) / 0.6)));
    if (t > tB - 0.2) rotuloP(x, "barriga", CX + 0.45 * E, CY - 0.12 * E, 34, "255,200,150", PT.ss((t - tB + 0.2) / 0.4) * (1 - PT.ss((t - tN) / 0.6)), "left");
  });
};

// =============== 2. a viagem: o remédio inunda o corpo ===============
CENAS.viagem = (el, c, B) => {
  const tE = B("estomago"), tS = B("sangue"), tM = B("minuto"), tD = B("dedao"), tP = B("procura"), tI = B("inunda");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["min", 330, 70, "1 volta ≈ 1 minuto", "pt-ci"], ["inu", 330, 92, "inunda tudo", "pt-am"]]);
  MD.slam(tl, tx.min, tM - 0.1, { from: 1.25 }); MD.leave(tl, tx.min, tP - 0.4); MD.slam(tl, tx.inu, tI - 0.05, { from: 1.35 });
  const nv = T.nuvem(16100), est = estF(5), CX = 540, CY = 1000, E = 400;
  T.quadro((x, t) => {
    estD(x, est, t);
    // frente do remédio se espalhando a partir do estômago
    const R = Math.max(0, (t - tS) * 0.16);
    corpo(nv, CX, CY, E, 1, null, (p) => { const k = PT.ss((R - p.d) / 0.12); return [mixC([0.6, 0.75, 1.0], [1.0, 0.75, 0.4], k), 1 + 0.8 * k]; });
    const aE = PT.jan(t, tE - 0.4, tS + 0.6, 0.3, 0.5); capsula(x, CX + 0.08 * E, CY - 0.12 * E, 1, 1.2, aE); if (aE > 0) for (let k = 0; k < 12; k++) { const an = k / 12 * 6.283, u = PT.ss((t - tE) / 1.2); discoP(x, CX + 0.08 * E + Math.cos(an) * 60 * u, CY - 0.12 * E + Math.sin(an) * 60 * u, 6, LA, aE * u); }
    // coração bombeando
    const pu = 0.5 + 0.5 * Math.pow(Math.max(0, Math.sin(t * 7)), 6); brilhoP(x, CX - 0.06 * E, CY - 0.42 * E, 50 + 30 * pu, VE, 0.6 * PT.ss((t - tS + 0.3) / 0.4));
    // relógio de 1 minuto
    const aM = PT.jan(t, tM - 0.3, tP, 0.4, 0.4); if (aM > 0) { anelP(x, 870, 700, 70, CI, aM, 6); const an = -Math.PI / 2 + (t - tM) * 3; linhaP(x, 870, 700, 870 + Math.cos(an) * 55, 700 + Math.sin(an) * 55, CI, aM, 5); }
    const aD = PT.ss((t - tD + 0.3) / 0.4); if (aD > 0) { brilhoP(x, CX + 0.14 * E, CY + 0.95 * E, 60, AM, 0.7 * aD); rotuloP(x, "até o dedão", CX + 0.3 * E, CY + 0.95 * E, 32, "255,226,140", aD, "left"); }
  });
};

// =============== 3. o alarme (prostaglandinas) ===============
CENAS.alarme = (el, c, B) => {
  const tA = B("alarme"), tM = B("machuca"), tP = B("prostaglandinas"), tS = B("sensiveis"), tV = B("volume"), tSM = B("semmachucado");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["al", 330, 86, "dor = alarme", "pt-ve"], ["pg", 330, 70, "prostaglandinas", "pt-la"], ["sm", 330, 60, "sem machucado: silêncio", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.al, tA - 0.05, { from: 1.35 }); MD.leave(tl, tx.al, tP - 0.35); MD.slam(tl, tx.pg, tP - 0.05, { from: 1.3 }); MD.leave(tl, tx.pg, tSM - 0.4); MD.slam(tl, tx.sm, tSM - 0.05, { from: 1.25 });
  const est = estF(7);
  const CEL = (() => { const o = []; for (let j = 0; j < 9; j++) for (let i = 0; i < 9; i++) o.push({ x: 130 + i * 103 + (j % 2) * 51, y: 600 + j * 72 }); return o; })(), IX = 400, IY = 880;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aM = PT.ss((t - tM + 0.3) / 0.4), aP = PT.ss((t - tP + 0.3) / 0.5), aSM = PT.ss((t - tSM + 0.3) / 0.5);
    CEL.forEach((p) => { const d = Math.hypot(p.x - IX, p.y - IY), fer = aM * Math.exp(-d / 160); const cor = fer > 0.3 ? "255,130,140" : p.x > 760 && aSM > 0 ? "120,255,190" : "150,190,255"; anelP(x, p.x, p.y, 30, cor, 0.6 + 0.4 * fer, 3); discoP(x, p.x, p.y, 8, cor, 0.5); });
    if (aM > 0) { brilhoP(x, IX, IY, 160, VE, 0.5 * aM); for (let k = 0; k < 5; k++) { const an = k * 1.3; linhaP(x, IX, IY, IX + Math.cos(an) * 90, IY + Math.sin(an) * 90, "255,220,220", aM, 4); } }
    // prostaglandinas saindo do machucado
    if (aP > 0) for (let k = 0; k < 40; k++) { const an = k * 2.4, u = ((t - tP) * 0.5 + k / 40) % 1; discoP(x, IX + Math.cos(an) * u * 260, IY + Math.sin(an) * u * 200, 7, LA, aP * Math.sin(u * Math.PI)); }
    // o nervo e o volume do alarme
    const aS = PT.ss((t - tS + 0.3) / 0.5); if (aS > 0) { x.beginPath(); x.moveTo(IX, IY); x.bezierCurveTo(500, 1050, 700, 1150, 1000, 1180); x.strokeStyle = `rgba(255,226,140,${aS * (0.6 + 0.4 * Math.sin(t * 9))})`; x.lineWidth = 8; x.stroke(); rotuloP(x, "nervo", 960, 1140, 30, "255,226,140", aS, "right"); }
    const aV = PT.ss((t - tV + 0.3) / 0.4); medidor(x, 540, 1360, PT.lerp(0.3, 1, PT.ss((t - tV) / 0.8)), aV, "VOLUME DO ALARME");
    if (aSM > 0) rotuloP(x, "sem machucado", 900, 560, 30, "150,255,200", aSM);
  });
};

// =============== 4. o ibuprofeno trava a máquina ===============
CENAS.ibuprofeno = (el, c, B) => {
  const tT = B("trava"), tC = B("cox"), tA = B("abaixa"), tD = B("doia"), tDe = B("desincha");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ibu", 330, 80, "IBUPROFENO", "pt-am"], ["cox", 330, 80, "a máquina: COX", "pt-la"], ["ant", 330, 66, "anti-inflamatório", "pt-ve"]]);
  MD.slam(tl, tx.ibu, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.ibu, tC - 0.35); MD.slam(tl, tx.cox, tC - 0.05, { from: 1.3 }); MD.leave(tl, tx.cox, tDe - 0.4); MD.slam(tl, tx.ant, tDe - 0.05, { from: 1.3 });
  const est = estF(9);
  T.quadro((x, t) => {
    estD(x, est, t);
    const trava = PT.ss((t - tC + 0.6) / 0.8), ang = (t - c.ini) * 2 * (1 - trava) + trava * 1.5;
    engrenagem(x, 380, 820, 150, ang, LA, 1);
    // produção de prostaglandinas (para quando trava)
    for (let k = 0; k < 18; k++) { const u = ((t - c.ini) * 0.6 + k / 18) % 1; discoP(x, 540 + u * 420, 820 + Math.sin(u * 8 + k) * 40, 8, LA, Math.sin(u * Math.PI) * (1 - trava)); }
    // moléculas do ibuprofeno chegando e travando
    const aI = PT.ss((t - tT + 0.6) / 0.5); if (aI > 0) for (let k = 0; k < 5; k++) { const q = PT.out(PT.ss((t - tT - k * 0.5) / (tC - tT - 1.5))), an = k * 1.25; const px = PT.lerp(380 + Math.cos(an) * 450, 380 + Math.cos(an) * 150, q), py = PT.lerp(820 + Math.sin(an) * 450, 820 + Math.sin(an) * 150, q); discoP(x, px, py, 18, "255,255,255", 0.4 * aI); anelP(x, px, py, 18, "255,255,255", aI, 4); }
    medidor(x, 540, 1140, PT.lerp(1, 0.25, PT.ss((t - tA) / 1)), PT.ss((t - tA + 0.6) / 0.4), "VOLUME DO ALARME");
    // tornozelo inchado que desincha
    const aD = PT.ss((t - tD + 0.5) / 0.5); if (aD > 0) { inchaco(x, 540, 1330, 1 - PT.ss((t - tDe) / 1.2), aD); rotuloP(x, "inchaço", 540, 1330, 32, "255,200,210", aD); }
  });
};

// =============== 5. o paracetamol (mistério) ===============
CENAS.paracetamol = (el, c, B) => {
  const tM = B("misterioso"), tC = B("cerebro"), tMe = B("medula"), tD = B("detalhes"), tN = B("naodesincha");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["par", 330, 80, "PARACETAMOL", "pt-ci"], ["mis", 420, 54, "um mistério", "pt-fino"], ["nd", 330, 66, "dor e febre: baixa", "pt-am"], ["nd2", 420, 50, "inchaço: quase nada", "pt-fino"]]);
  MD.slam(tl, tx.par, c.ini + 0.3, { from: 1.35 }); MD.arrive(tl, tx.mis, tM - 0.1, { y: 14 }); MD.leave(tl, [tx.par, tx.mis], tN - 1.9); MD.slam(tl, tx.nd, tN - 1.6, { from: 1.25 }); MD.arrive(tl, tx.nd2, tN - 0.3, { y: 14 });
  const nv = T.nuvem(9100), est = estF(11);
  T.quadro((x, t) => {
    estD(x, est, t);
    const aC = PT.ss((t - tC + 0.4) / 0.6);
    fCerebro(nv, 540, 760, 250, 0.4 + 0.6 * aC, { cor: [0.7, 0.8, 1.0], cerebelo: 0.3 * aC });
    const aMe = PT.ss((t - tMe + 0.2) / 0.5); if (aMe > 0) { for (let k = 0; k < 30; k++) discoP(x, 520 - k * 0.6, 860 + k * 16, 9, CI, aMe * 0.8); brilhoP(x, 510, 1060, 140, CI, 0.3 * aMe); rotuloP(x, "medula", 600, 1100, 30, "150,235,255", aMe, "left"); }
    // botão de volume girando para baixo dentro do cérebro
    if (aC > 0) { const an = PT.lerp(0.8, -2.2, PT.ss((t - tC) / 1.5)); anelP(x, 820, 980, 60, AM, aC, 6); linhaP(x, 820, 980, 820 + Math.cos(an) * 48, 980 + Math.sin(an) * 48, AM, aC, 6); rotuloP(x, "volume da dor", 820, 1075, 28, "255,226,140", aC); }
    // pontos de interrogação
    const aD = PT.jan(t, tD - 0.5, tN - 0.8, 0.4, 0.4); if (aD > 0) [[300, 640], [780, 600], [260, 900]].forEach(([px, py], k) => rotuloP(x, "?", px, py + Math.sin(t * 2 + k) * 10, 80, AM, aD));
    const aN = PT.ss((t - tN + 0.8) / 0.5); if (aN > 0) { inchaco(x, 300, 1300, 1, aN); rotuloP(x, "continua", 300, 1300, 30, "255,200,210", aN); }
  });
};

// =============== 6. o erro comum ===============
CENAS.erro = (el, c, B) => {
  const tG = B("gripe"), tD = B("dentro"), tC = B("conta"), tF = B("figado"), tM = B("misture");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["oc", 330, 62, "paracetamol escondido", "pt-am"], ["fig", 330, 76, "demais: fígado", "pt-ve"], ["bul", 330, 76, "leia a bula", "pt-ci"]]);
  MD.slam(tl, tx.oc, tD - 0.05, { from: 1.25 }); MD.leave(tl, tx.oc, tF - 0.4); MD.slam(tl, tx.fig, tF - 0.05, { from: 1.3 }); MD.leave(tl, tx.fig, tM - 0.6); MD.slam(tl, tx.bul, tM - 0.4, { from: 1.3 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    // caixas: antigripal e paracetamol
    const aG = PT.ss((t - tG + 0.3) / 0.5); if (aG > 0) { fCaixa(x, 300, 720, 380, 200, 20, CI, aG, 5, 0.06); rotuloP(x, "ANTIGRIPAL", 300, 690, 40, "200,240,255", aG); const aD = PT.ss((t - tD + 0.2) / 0.4); if (aD > 0) rotuloP(x, "contém paracetamol", 300, 760, 28, "255,200,140", aD); }
    const aC = PT.ss((t - tC + 0.3) / 0.5); if (aC > 0) { fCaixa(x, 780, 720, 340, 200, 20, LA, aC, 5, 0.06); rotuloP(x, "PARACETAMOL", 780, 720, 38, "255,220,170", aC); rotuloP(x, "+", 545, 720, 70, "255,255,255", aC); }
    // barra da dose somando e passando do limite
    const v = 0.45 * PT.ss((t - tD) / 0.6) + 0.75 * PT.ss((t - tC) / 0.8); const aB = PT.ss((t - tD + 0.3) / 0.4);
    if (aB > 0) { fCaixa(x, 540, 980, 820, 60, 30, "200,210,230", aB, 3, 0.04); fRR(x, 130, 950, 820 * Math.min(1.08, v / 1.1), 60, 30); x.fillStyle = `rgba(${v > 1 ? VE : AM},${0.55 * aB})`; x.fill(); linhaP(x, 130 + 820 / 1.1, 930, 130 + 820 / 1.1, 1030, VE, aB, 5); rotuloP(x, "dose máxima", 130 + 820 / 1.1, 900, 28, "255,150,160", aB); }
    // fígado
    const aF = PT.ss((t - tF + 0.4) / 0.5); if (aF > 0) { x.beginPath(); x.moveTo(320, 1150); x.quadraticCurveTo(540, 1080, 760, 1150); x.quadraticCurveTo(720, 1300, 520, 1320); x.quadraticCurveTo(360, 1300, 320, 1150); x.fillStyle = `rgba(255,90,110,${0.3 * aF})`; x.fill(); x.strokeStyle = `rgba(255,150,160,${aF})`; x.lineWidth = 6; x.stroke(); brilhoP(x, 540, 1220, 220, VE, 0.35 * aF * (0.7 + 0.3 * Math.sin(t * 5))); rotuloP(x, "fígado", 540, 1220, 34, "255,220,220", aF); }
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["o remédio vai pro corpo todo", "a dor é um alarme químico", "ibuprofeno desliga a fábrica", "paracetamol abaixa o volume"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    capsula(x, 540, 1250, 2.2, 0.3 + Math.sin(t) * 0.1, 0.7 * sai);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [LA, VE, AM, CI][k], a); brilhoP(x, 160, Y[k], 50, "255,220,200", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
