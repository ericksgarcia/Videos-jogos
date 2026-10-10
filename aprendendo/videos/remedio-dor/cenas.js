// Cenas do vídeo "Como o remédio sabe onde está doendo" — pontos de luz na GPU.
// Refeito do zero. Retenção: dor do dia a dia (o comprimido vai pra barriga e a cabeça melhora), paradoxo ("ele não
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

const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
function setaComent(x, a, t) { if (a <= 0.01) return; const b = Math.sin(t * 6) * 16; fSeta(x, 700 + b, 1250, 900 + b, 1250, AM, a, 12); brilhoP(x, 1010, 1250, 90, AM, 0.35 * a * (0.7 + 0.3 * Math.sin(t * 6))); rotuloP(x, "comentários", 780, 1180, 38, "255,226,140", a); }
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 330 * s, 60 * s, CI, a, 8 * s, 0.12);
  x.beginPath(); x.moveTo(cx - 120 * s, cy + 160 * s); x.lineTo(cx - 190 * s, cy + 250 * s); x.lineTo(cx - 40 * s, cy + 160 * s); x.fillStyle = `rgba(${CI},${0.5 * a})`; x.fill();
  brilhoP(x, cx, cy, 380 * s, CI, 0.18 * a); rotuloP(x, txt, cx, cy + 6 * s, 190 * s, "255,226,140", a * (0.85 + 0.15 * Math.sin(t * 4)));
}
function coracao(x, cx, cy, s, a, t) { if (a <= 0.01) return; const b = 1 + 0.08 * Math.max(0, Math.sin(t * 7)); s *= b; x.beginPath(); x.moveTo(cx, cy + 90 * s); x.bezierCurveTo(cx - 150 * s, cy - 10 * s, cx - 90 * s, cy - 120 * s, cx, cy - 50 * s); x.bezierCurveTo(cx + 90 * s, cy - 120 * s, cx + 150 * s, cy - 10 * s, cx, cy + 90 * s); x.fillStyle = `rgba(${VE},${0.25 * a})`; x.fill(); x.strokeStyle = `rgba(255,150,165,${a})`; x.lineWidth = 6; x.stroke(); brilhoP(x, cx, cy, 200 * s, VE, 0.3 * a); }
function sino(x, cx, cy, s, a, t, toca) { if (a <= 0.01) return; const ang = toca * Math.sin(t * 22) * 0.25; x.save(); x.translate(cx, cy - 90 * s); x.rotate(ang); x.beginPath(); x.moveTo(-90 * s, 140 * s); x.quadraticCurveTo(-80 * s, 20 * s, 0, 10 * s); x.quadraticCurveTo(80 * s, 20 * s, 90 * s, 140 * s); x.closePath(); x.fillStyle = `rgba(${AM},${0.2 * a})`; x.fill(); x.strokeStyle = `rgba(${AM},${a})`; x.lineWidth = 6; x.stroke(); discoP(x, 0, 160 * s, 16 * s, AM, a); x.restore(); if (toca > 0) for (let k = 0; k < 3; k++) { const u = ((t * 1.5 + k / 3) % 1); for (const sd of [-1, 1]) { x.beginPath(); x.arc(cx, cy, (110 + u * 120) * s, sd > 0 ? -0.5 : Math.PI - 0.5, sd > 0 ? 0.5 : Math.PI + 0.5); x.strokeStyle = `rgba(${VE},${a * toca * (1 - u)})`; x.lineWidth = 5; x.stroke(); } } }
function figado(x, cx, cy, s, a, alerta) { if (a <= 0.01) return; const cor = alerta > 0.5 ? "255,120,140" : "220,140,110"; x.beginPath(); x.moveTo(cx - 270 * s, cy - 10 * s); x.bezierCurveTo(cx - 200 * s, cy - 90 * s, cx - 20 * s, cy - 150 * s, cx + 170 * s, cy - 130 * s); x.bezierCurveTo(cx + 280 * s, cy - 115 * s, cx + 290 * s, cy + 20 * s, cx + 210 * s, cy + 110 * s); x.bezierCurveTo(cx + 150 * s, cy + 170 * s, cx + 40 * s, cy + 150 * s, cx - 10 * s, cy + 90 * s); x.bezierCurveTo(cx - 90 * s, cy + 40 * s, cx - 190 * s, cy + 40 * s, cx - 270 * s, cy - 10 * s); x.fillStyle = `rgba(${cor},${0.22 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 6; x.stroke(); x.beginPath(); x.moveTo(cx + 40 * s, cy - 135 * s); x.quadraticCurveTo(cx + 20 * s, cy, cx + 30 * s, cy + 120 * s); x.strokeStyle = `rgba(${cor},${0.5 * a})`; x.lineWidth = 4; x.stroke(); if (alerta > 0) { brilhoP(x, cx, cy, 300 * s, VE, 0.3 * a * alerta); fCaixa(x, cx + 250 * s, cy - 160 * s, 90 * s, 90 * s, 45 * s, VE, a * alerta, 5, 0.25); rotuloP(x, "!", cx + 250 * s, cy - 156 * s, 70 * s, "255,200,210", a * alerta); } }
function caixaRem(x, cx, cy, s, a, nome, aberta = 0) { if (a <= 0.01) return; fCaixa(x, cx, cy, 340 * s, 220 * s, 14 * s, BRR, a, 5, 0.08); fCaixa(x, cx, cy - 20 * s, 300 * s, 70 * s, 10 * s, CI, a * 0.7, 3, 0.04); rotuloP(x, nome, cx, cy - 20 * s, 40 * s, "255,210,63", a); rotuloP(x, "comprimidos", cx, cy + 60 * s, 26 * s, "200,210,230", a * 0.8); if (aberta > 0) { capsula(x, cx - 60 * s, cy - 150 * s * aberta, 1.3 * s, 0.2, a * aberta); rotuloP(x, "paracetamol", cx + 60 * s, cy - 150 * s * aberta - 60 * s, 34 * s, "255,200,140", a * aberta); } }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tC = B("cabeca"), tB = B("barriga"), tPa = B("passa"), tI = B("ir"), tN = B("naosabe"), tP = B("promessa");
  const p2 = tB - 0.9, p3 = tI - 0.6, p4 = tP - 2.4;
  mostrarGancho(p2 - 0.1);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["bar", 330, 70, "cai na barriga", "pt-ci"], ["pas", 330, 76, "e a dor passa", "pt-am"], ["ir", 330, 70, "como ele sabe?", "pt-ci"], ["nao", 330, 96, "ele não sabe", "pt-ve"], ["err", 330, 60, "o erro do antigripal: no final", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.bar, tB - 0.1, { from: 1.3 }); MD.leave(tl, tx.bar, tPa - 0.35); MD.slam(tl, tx.pas, tPa - 0.05, { from: 1.3 }); MD.leave(tl, tx.pas, tI - 0.35);
  MD.slam(tl, tx.ir, tI - 0.1, { from: 1.25 }); MD.leave(tl, tx.ir, tN - 0.35); MD.slam(tl, tx.nao, tN - 0.05, { from: 1.45 }); MD.leave(tl, tx.nao, p4); MD.slam(tl, tx.err, p4 + 0.2, { from: 1.25 });
  const nv = T.nuvem(16100), est = estF(3), CX = 540, CY = 1000, E = 400;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aCorpo = 1 - PT.ss((t - p4) / 0.4);
    if (aCorpo > 0.01) corpo(nv, CX, CY, E, aCorpo, [0.6, 0.75, 1.0]); else nv.total(nv.k);
    // dor na cabeça (pulsa e some quando passa)
    const dor = aCorpo * (1 - PT.ss((t - tPa) / 0.8)); if (dor > 0) { const pu = 0.7 + 0.3 * Math.sin(t * 7); brilhoP(x, CX, CY - 0.8 * E, 120 * pu, VE, 0.7 * dor); for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283 + t; linhaP(x, CX + Math.cos(an) * 80, CY - 0.8 * E + Math.sin(an) * 80, CX + Math.cos(an) * 110, CY - 0.8 * E + Math.sin(an) * 110, VE, dor * pu, 5); } }
    // plano 1 (quadro 0): o comprimido grande apontando pra cabeça... e riscado
    const a1 = 1 - PT.ss((t - p2) / 0.4);
    if (a1 > 0.01) { capsula(x, CX + 300, CY - 0.95 * E, 2.2, -0.5 + Math.sin(t * 2) * 0.1, a1); x.setLineDash([12, 12]); linhaP(x, CX + 230, CY - 0.92 * E, CX + 80, CY - 0.82 * E, AM, 0.7 * a1, 4); x.setLineDash([]); const aX = PT.ss((t - tC - 0.3) / 0.3) * a1; linhaP(x, CX + 120, CY - 0.95 * E, CX + 200, CY - 0.75 * E, VE, aX, 10); linhaP(x, CX + 120, CY - 0.75 * E, CX + 200, CY - 0.95 * E, VE, aX, 10); }
    // plano 2: o comprimido desce até a barriga
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { const q = PT.inOut((t - p2) / (tB - p2 + 0.3)); capsula(x, PT.lerp(CX + 300, CX + 0.04 * E, PT.ss(q * 2)), PT.lerp(CY - 0.95 * E, CY - 0.12 * E, q), 1.6 - 0.6 * q, 0.4 + q, a2); if (t > tB - 0.2) rotuloP(x, "barriga", CX + 0.45 * E, CY - 0.12 * E, 34, "255,200,150", a2 * PT.ss((t - tB + 0.2) / 0.4), "left"); }
    // plano 3: "como ele sabe?" — e ele não sabe: vai pra todo lado
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) { const aN = PT.ss((t - tN + 0.2) / 0.4); for (let k = 0; k < 12; k++) { const an = k / 12 * 6.283, L = 140 + 320 * aN; fSeta(x, CX + 0.04 * E, CY - 0.12 * E, CX + 0.04 * E + Math.cos(an) * L, CY - 0.12 * E + Math.sin(an) * L * 1.3, LA, a3 * (0.3 + 0.7 * aN), 4); } if (aN < 0.5) rotuloP(x, "?", CX + 300, CY - 300, 150, AM, a3 * (1 - aN * 2)); }
    // plano 4: o antigripal + o paracetamol + o fígado (teaser)
    const a4 = PT.ss((t - p4) / 0.5);
    if (a4 > 0.01) { caixaRem(x, 340, 900, 1.0, a4, "ANTIGRIPAL"); rotuloP(x, "+", 560, 900, 80, "255,255,255", a4); capsula(x, 760, 900, 2.2, 0.3, a4); figado(x, 540, 1250, 0.9, a4, PT.ss((t - p4 - 0.8) / 0.4)); }
  });
};

// =============== 2. ele inunda tudo ===============
CENAS.viagem = (el, c, B) => {
  const tS = B("sangue"), tM = B("minuto"), tD = B("dedao"), tI = B("inunda"), tMe = B("melhora");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["san", 330, 70, "do estômago pro sangue", "pt-ci"], ["min", 330, 80, "1 volta: ~1 minuto", "pt-am"], ["tod", 330, 66, "até no dedão do pé", "pt-ci"], ["inu", 330, 86, "ele inunda tudo", "pt-am"], ["mel", 330, 62, "por que só a cabeça melhora?", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.san, tS - 0.1, { from: 1.25 }); MD.leave(tl, tx.san, tM - 1.8); MD.slam(tl, tx.min, tM - 0.1, { from: 1.35 }); MD.leave(tl, tx.min, tD - 2.6);
  MD.slam(tl, tx.tod, tD - 0.1, { from: 1.25 }); MD.leave(tl, tx.tod, tI - 0.3); MD.slam(tl, tx.inu, tI - 0.05, { from: 1.4 }); MD.leave(tl, tx.inu, tMe - 1.5); MD.slam(tl, tx.mel, tMe - 1.2, { from: 1.25 });
  const nv = T.nuvem(16100), est = estF(5), CX = 540, CY = 1000, E = 400;
  const pB = tM - 1.8, pC = tD - 2.7, pD = tMe - 1.1;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: close no estômago — o comprimido se desfaz e entra no sangue
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { x.beginPath(); x.ellipse(540, 960, 300, 220, -0.3, 0, 6.283); x.fillStyle = `rgba(255,170,150,${0.1 * aA})`; x.fill(); x.strokeStyle = `rgba(255,170,150,${aA})`; x.lineWidth = 6; x.stroke(); const d = PT.ss((t - c.ini - 0.6) / 2.2); capsula(x, 540, 960, 2.4 * (1 - 0.8 * d), 0.4, aA * (1 - d)); x.beginPath(); x.moveTo(60, 1300); x.bezierCurveTo(400, 1220, 700, 1400, 1020, 1280); x.strokeStyle = `rgba(${VE},${aA * 0.8})`; x.lineWidth = 30; x.stroke(); const r = prng(3); for (let k = 0; k < 40; k++) { const u = ((t * 0.35 + r()) % 1), px = 540 + (r() - 0.5) * 300 * (1 - u), py = PT.lerp(960, 1290, u); discoP(x, px, py, 6, LA, aA * d * Math.sin(u * Math.PI)); } rotuloP(x, "sangue", 900, 1360, 34, "255,170,180", aA); }
    // plano B: o coração dá a volta em ~1 minuto
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { coracao(x, 540, 980, 1.6, aB, t); const R = 340; anelP(x, 540, 980, R, VE, aB * 0.4, 8); for (let k = 0; k < 10; k++) { const an = (t - pB) * 1.1 + k / 10 * 6.283; discoP(x, 540 + Math.cos(an) * R, 980 + Math.sin(an) * R, 10, LA, aB); } rotuloP(x, "≈ 1 min", 540, 1400, 60, "255,226,140", aB * PT.ss((t - tM + 0.6) / 0.3)); }
    // plano C: o remédio chega no corpo inteiro (a mancha laranja se espalha do estômago)
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { const R = PT.lerp(0, 1.6, PT.ss((t - pC) / 3.6)); corpo(nv, CX, CY, E, aC, null, (p) => { const k = PT.ss((R - p.d) / 0.12); return [mixC([0.6, 0.75, 1.0], [1.0, 0.75, 0.4], k), 1 + 0.8 * k]; }); [["cabeça", 0, -0.8], ["joelho", 0.15, 0.5], ["dedão", 0.15, 0.93]].forEach(([nm, px, py], k) => { const q = PT.ss((t - tD + 1.6 - k * 0.6) / 0.4); rotuloP(x, nm, CX + (px + 0.35) * E, CY + py * E, 34, "255,200,150", aC * q, "left"); }); }
    // plano D: o corpo inteiro laranja, mas só a cabeça melhora (?)
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { corpo(nv, CX, CY, E, aD, [1.0, 0.75, 0.4]); brilhoP(x, CX, CY - 0.8 * E, 130, VD, 0.6 * aD); rotuloP(x, "?", CX + 300, CY - 0.8 * E, 140, AM, aD); } else if (aC <= 0.01) nv.total(nv.k);
  });
};

// =============== 3. a dor é um alarme ===============
CENAS.alarme = (el, c, B) => {
  const tA = B("alarme"), tP = B("prosta"), tV = B("volume"), tT = B("tocando");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ala", 330, 86, "a dor é um alarme", "pt-ve"], ["pro", 330, 62, "PROSTAGLANDINAS", "pt-am"], ["vol", 330, 66, "volume do alarme: alto", "pt-ve"], ["toc", 330, 62, "sem machucado, sem alarme", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.ala, tA - 0.1, { from: 1.4 }); MD.leave(tl, tx.ala, tP - 1.3); MD.slam(tl, tx.pro, tP - 0.1, { from: 1.3 }); MD.leave(tl, tx.pro, tV - 0.35); MD.slam(tl, tx.vol, tV - 0.05, { from: 1.3 }); MD.leave(tl, tx.vol, tT - 1.5); MD.slam(tl, tx.toc, tT - 1.2, { from: 1.25 });
  const nv = T.nuvem(16100), est = estF(7), CX = 540, CY = 1000, E = 400;
  const pB = tP - 1.2, pC = tT - 1.4;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o joelho machucado e o sino tocando
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { inchaco(x, 420, 1100, 0.8, aA); sino(x, 760, 820, 1.2, aA, t, PT.ss((t - tA + 0.3) / 0.3)); rotuloP(x, "machucado", 420, 1290, 34, "255,170,180", aA); }
    // plano B: as células fabricam prostaglandinas, o volume sobe
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { for (let k = 0; k < 7; k++) { const cx = 220 + (k % 4) * 210, cy = 820 + Math.floor(k / 4) * 220; anelP(x, cx, cy, 70, "255,170,150", aB, 5); discoP(x, cx, cy, 18, "255,170,150", aB * 0.6); for (let q = 0; q < 3; q++) { const u = ((t * 0.6 + q / 3 + k * 0.17) % 1); discoP(x, cx + Math.cos(k + q * 2) * (70 + u * 60), cy + Math.sin(k + q * 2) * (70 + u * 60), 7, VE, aB * PT.ss((t - tP + 0.4) / 0.4) * (1 - u)); } } medidor(x, 540, 1350, PT.lerp(0.2, 0.95, PT.ss((t - tV + 0.4) / 0.6)), aB, "VOLUME DA DOR"); }
    // plano C: no corpo, só um ponto com alarme; o resto quieto
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { corpo(nv, CX, CY, E, aC, [0.6, 0.75, 1.0]); const px = CX + 0.15 * E, py = CY + 0.5 * E, pu = 0.7 + 0.3 * Math.sin(t * 8); brilhoP(x, px, py, 110 * pu, VE, 0.8 * aC); sino(x, px + 230, py - 120, 0.5, aC, t, 1); } else nv.total(nv.k);
  });
};

// =============== 4. o ibuprofeno ===============
CENAS.ibuprofeno = (el, c, B) => {
  const tM = B("maquina"), tA = B("abaixa"), tD = B("doia"), tP = B("pensa"), tJ = B("jeito");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ibu", 330, 76, "ibuprofeno", "pt-am"], ["tra", 330, 66, "trava a máquina do alarme", "pt-ci", "white-space:normal;left:60px;width:960px"], ["aba", 330, 80, "o alarme abaixa", "pt-ci"], ["doi", 330, 62, "só sente onde doía", "pt-am"], ["pen", 330, 76, "pensa rápido", "pt-am"], ["jei", 330, 62, "e o paracetamol?", "pt-ve"]]);
  MD.slam(tl, tx.ibu, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.ibu, tM - 0.3); MD.slam(tl, tx.tra, tM - 0.05, { from: 1.25 }); MD.leave(tl, tx.tra, tA - 0.35); MD.slam(tl, tx.aba, tA - 0.05, { from: 1.3 }); MD.leave(tl, tx.aba, tD - 1.6);
  MD.slam(tl, tx.doi, tD - 1.3, { from: 1.25 }); MD.leave(tl, tx.doi, tP - 0.35); MD.slam(tl, tx.pen, tP - 0.05, { from: 1.35 }); MD.leave(tl, tx.pen, tJ - 1.4); MD.slam(tl, tx.jei, tJ - 1.1, { from: 1.3 });
  const nv = T.nuvem(16100), est = estF(9), CX = 540, CY = 1000, E = 400;
  const pB = tA - 0.4, pC = tD - 1.5, pD = tP - 0.6;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: a máquina (engrenagem) fabricando o alarme; o comprimido trava
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { const trava = PT.ss((t - tM - 0.4) / 0.6), vel = 1 - trava; engrenagem(x, 540, 980, 220, (t - c.ini) * 1.5 * vel + trava * 0.3, AM, aA); for (let q = 0; q < 8; q++) { const u = ((t * 0.5 + q / 8) % 1); discoP(x, 760 + u * 260, 980 + Math.sin(u * 6 + q) * 40, 8, VE, aA * vel * (1 - u)); } capsula(x, PT.lerp(1100, 700, PT.ss((t - tM + 0.2) / 0.6)), 800, 2.0, -0.6, aA * PT.ss((t - tM + 0.4) / 0.3)); }
    // plano B: o medidor do alarme cai
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { sino(x, 540, 860, 1.3, aB, t, 1 - PT.ss((t - tA) / 0.8)); medidor(x, 540, 1300, PT.lerp(0.95, 0.15, PT.ss((t - tA) / 1.0)), aB, "VOLUME DA DOR"); }
    // plano C: o corpo — o remédio em todo lugar, mas só o ponto que doía muda
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { corpo(nv, CX, CY, E, aC, [1.0, 0.75, 0.4]); const px = CX + 0.15 * E, py = CY + 0.5 * E, q = PT.ss((t - tD + 0.6) / 0.8); brilhoP(x, px, py, 120, q > 0.5 ? VD : VE, 0.7 * aC); } else if (t < pD) nv.total(nv.k);
    // plano D: o paracetamol com "?"
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { capsula(x, 500, 980, 3.6, -0.3 + Math.sin(t * 1.5) * 0.08, aD); rotuloP(x, "paracetamol", 500, 1180, 44, "255,200,140", aD); rotuloP(x, "?", 820, 760, 150, AM, aD * PT.ss((t - tJ + 0.4) / 0.4)); nv.total(nv.k); }
  });
};

// =============== 5. o paracetamol ===============
CENAS.paracetamol = (el, c, B) => {
  const tN = B("nao"), tC = B("cerebro"), tD = B("detalhes"), tDe = B("desincha");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["nao", 330, 110, "não", "pt-ve"], ["mis", 330, 66, "mais misterioso", "pt-am"], ["cer", 330, 62, "age no cérebro e na medula", "pt-ci", "white-space:normal;left:60px;width:960px"], ["det", 330, 62, "nem os cientistas sabem tudo", "pt-am", "white-space:normal;left:60px;width:960px"], ["des", 330, 62, "baixa a febre, quase não desincha", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.nao, tN - 0.05, { from: 1.6 }); MD.leave(tl, tx.nao, tN + 0.9); MD.slam(tl, tx.mis, tN + 1.1, { from: 1.25 }); MD.leave(tl, tx.mis, tC - 0.35); MD.slam(tl, tx.cer, tC - 0.05, { from: 1.25 }); MD.leave(tl, tx.cer, tD - 1.8);
  MD.slam(tl, tx.det, tD - 1.5, { from: 1.25 }); MD.leave(tl, tx.det, tDe - 2.8); MD.slam(tl, tx.des, tDe - 2.5, { from: 1.2 });
  const nv = T.nuvem(16100), est = estF(11);
  const pB = tC - 1.0, pC = tD - 1.6, pD = tDe - 2.6;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o comprimido de paracetamol e o "não"
    const aA = PT.ss((t - c.ini) / 0.3) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { capsula(x, 540, 980, 3.6, -0.3, aA); linhaP(x, 360, 800, 720, 1160, VE, aA * PT.ss((t - tN) / 0.3), 12); }
    // plano B: cérebro e medula baixando o volume da dor
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { fCerebro(nv, 540, 820, 300, aB, { cerebelo: 0.3 }); linhaP(x, 560, 940, 560, 1400, "150,200,255", aB, 18); for (let q = 0; q < 6; q++) { const u = ((t * 0.5 + q / 6) % 1); discoP(x, 560, PT.lerp(1400, 960, u), 9, LA, aB * Math.sin(u * Math.PI)); } } else if (t < pC) nv.total(nv.k);
    // plano C: o mistério — a lupa e o "?"
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { fCerebro(nv, 540, 960, 260, aC * 0.7, { cerebelo: 0.2 }); anelP(x, 640, 900, 130, AM, aC, 10); linhaP(x, 730, 990, 860, 1120, AM, aC, 16); rotuloP(x, "?", 640, 905, 120, AM, aC); } else if (t >= pC && t < pD + 0.5 && aC <= 0.01) nv.total(nv.k);
    // plano D: febre cai (termômetro), inchaço continua
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { termometroP(x, 330, 1000, 420, 35, 41, PT.lerp(39.5, 36.6, PT.ss((t - pD - 0.4) / 1.4)), aD); rotuloP(x, "febre", 330, 1290, 38, "180,235,255", aD); inchaco(x, 760, 1010, 0.8, aD); rotuloP(x, "inchaço", 760, 1200, 38, "255,170,180", aD); }
  });
};

// =============== 6. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tI = B("inteiro"), tD = B("dormente"), tT = B("teoria");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["dor", 330, 62, "por que não fica dormente?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["teo", 330, 80, "qual a sua teoria?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, tI - 0.6);
  MD.slam(tl, tx.dor, tD - 0.6, { from: 1.25 }); MD.leave(tl, tx.dor, tT - 0.35); MD.slam(tl, tx.teo, tT - 0.05, { from: 1.4 });
  const nv = T.nuvem(16100), est = estF(21), CX = 540, CY = 1000, E = 400;
  const pB = tI - 0.7, pC = tT - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    balaoCom(x, 540, 960, 1.2, PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4)), "?", t);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { corpo(nv, CX, CY, E, aB, [1.0, 0.75, 0.4]); for (const [px, py] of [[-0.5, -0.3], [0.5, -0.1], [-0.4, 0.6], [0.45, 0.7]]) rotuloP(x, "?", CX + px * E, CY + py * E, 70, AM, aB * PT.ss((t - tD + 0.5) / 0.4)); } else nv.total(nv.k);
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { balaoCom(x, 540, 900, 1.1, aC, "?", t); setaComent(x, aC, t); }
  });
};

// =============== 7. o erro prometido ===============
CENAS.erro = (el, c, B) => {
  const tP = B("para2"), tC = B("conta"), tF = B("figado"), tB = B("bula");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pro", 330, 66, "o erro prometido", "pt-am"], ["den", 330, 62, "já vem com paracetamol", "pt-ci"], ["dos", 330, 76, "dose dobrada", "pt-ve"], ["fig", 330, 70, "machuca o fígado", "pt-ve"], ["bul", 330, 66, "lê a bula, não mistura", "pt-am"]]);
  MD.slam(tl, tx.pro, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.pro, tP - 0.6); MD.slam(tl, tx.den, tP - 0.3, { from: 1.25 }); MD.leave(tl, tx.den, tC - 0.35); MD.slam(tl, tx.dos, tC - 0.05, { from: 1.4 }); MD.leave(tl, tx.dos, tF - 0.35); MD.slam(tl, tx.fig, tF - 0.05, { from: 1.35 }); MD.leave(tl, tx.fig, tB - 0.35); MD.slam(tl, tx.bul, tB - 0.05, { from: 1.25 });
  const est = estF(13);
  const pB = tP - 0.6, pC = tC - 0.8, pD = tF - 0.8;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: a caixa do antigripal
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) caixaRem(x, 540, 1000, 1.6, aA, "ANTIGRIPAL");
    // plano B: a caixa abre — tem paracetamol dentro
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) caixaRem(x, 540, 1080, 1.5, aB, "ANTIGRIPAL", PT.ss((t - tP + 0.3) / 0.6));
    // plano C: antigripal + paracetamol = passou da dose
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { caixaRem(x, 300, 860, 0.9, aC, "ANTIGRIPAL", 1); rotuloP(x, "+", 560, 860, 80, "255,255,255", aC); capsula(x, 780, 860, 2.2, 0.3, aC); medidor(x, 540, 1300, PT.lerp(0.5, 1.0, PT.ss((t - tC) / 0.8)), aC, "DOSE DE PARACETAMOL"); const aL = PT.ss((t - tC - 0.6) / 0.3); linhaP(x, 540 + 125, 1250, 540 + 125, 1350, "255,255,255", aC * aL, 4); rotuloP(x, "limite", 540 + 125, 1390, 28, "255,255,255", aC * aL); }
    // plano D: o fígado em alerta
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { figado(x, 540, 1000, 1.6, aD, 1); rotuloP(x, "fígado", 540, 1250, 44, "255,170,180", aD); }
  });
};

// =============== 8. resumo relâmpago + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [560, 720, 880], textos = ["vai pro corpo inteiro", "a dor é um alarme", "ele abaixa o alarme onde toca"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 54, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    capsula(x, 540, 1240, 2.4, -0.3, 0.7 * sai * PT.ss((t - c.ini) / 0.5));
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [LA, VE, VD][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
