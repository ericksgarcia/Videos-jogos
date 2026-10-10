// Cenas do vídeo "Como a chave abre só o seu carro" — pontos de luz na GPU (refeito do zero).
// Retenção: situação concreta (500 carros, só o seu pisca) + ameaça (levado em menos de 1 minuto),
// previsão do espectador (gravou e repetiu: abre?), virada (a janela de códigos), pergunta para os
// comentários (chave no queixo), promessa paga (ataque de retransmissão) e dica testável (a lata).

const MD = MotionDirector;
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245", CZ = "120,130,160", OURO = "240,200,110", LADR = "200,170,230";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.5);
const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);

// carro visto de cima (pisca = setas acesas)
function carroCima(x, cx, cy, s, cor, a, pisca = 0) { if (a <= 0.01) return; fCaixa(x, cx, cy, 70 * s, 130 * s, 18 * s, cor, a, 3 * s, 0.1); fCaixa(x, cx, cy - 18 * s, 54 * s, 34 * s, 8 * s, cor, 0.6 * a, 2 * s, 0.15); if (pisca > 0) for (const [dx, dy] of [[-30, -60], [30, -60], [-30, 60], [30, 60]]) { discoP(x, cx + dx * s, cy + dy * s, 7 * s, AM, pisca * a); brilhoP(x, cx + dx * s, cy + dy * s, 30 * s, AM, 0.6 * pisca * a); } }
// carro de lado (frente para a direita)
function carroLado(x, cx, cy, s, cor, a, pisca = 0) {
  if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 160 * s, cy + 20 * s); x.lineTo(cx - 150 * s, cy - 20 * s); x.lineTo(cx - 80 * s, cy - 30 * s); x.lineTo(cx - 40 * s, cy - 75 * s); x.lineTo(cx + 60 * s, cy - 75 * s); x.lineTo(cx + 110 * s, cy - 30 * s); x.lineTo(cx + 160 * s, cy - 20 * s); x.lineTo(cx + 165 * s, cy + 20 * s); x.closePath();
  x.fillStyle = `rgba(${cor},${0.1 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 5 * s; x.stroke();
  x.beginPath(); x.moveTo(cx - 30 * s, cy - 65 * s); x.lineTo(cx + 55 * s, cy - 65 * s); x.lineTo(cx + 92 * s, cy - 32 * s); x.lineTo(cx - 62 * s, cy - 32 * s); x.closePath(); x.fillStyle = `rgba(${CI},${0.12 * a})`; x.fill(); x.strokeStyle = `rgba(${CI},${0.6 * a})`; x.lineWidth = 3 * s; x.stroke();
  anelP(x, cx - 90 * s, cy + 22 * s, 28 * s, cor, a, 5 * s); anelP(x, cx + 95 * s, cy + 22 * s, 28 * s, cor, a, 5 * s);
  if (pisca > 0) for (const dx of [-155, 160]) { discoP(x, cx + dx * s, cy - 5 * s, 9 * s, AM, pisca * a); brilhoP(x, cx + dx * s, cy - 5 * s, 50 * s, AM, 0.7 * pisca * a); }
}
// chave com botões; "dentro" mostra a antena e o chip; aperta acende o botão
function chaveK(x, cx, cy, s, a, aperta = 0, dentro = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 90 * s, 150 * s, 40 * s, BRC, a, 4 * s, 0.1);
  discoP(x, cx, cy - 25 * s, 18 * s, aperta > 0 ? AM : CZ, a); discoP(x, cx, cy + 30 * s, 14 * s, CZ, a); anelP(x, cx, cy - 95 * s, 18 * s, BRC, a, 4 * s);
  if (aperta > 0) brilhoP(x, cx, cy - 25 * s, 50 * s, AM, 0.6 * aperta * a);
  if (dentro > 0) { const d = dentro * a; for (let v = 0; v < 2; v++) { fRR(x, cx - (36 - v * 7) * s, cy - (66 - v * 7) * s, (72 - v * 14) * s, (132 - v * 14) * s, (30 - v * 5) * s); x.strokeStyle = `rgba(${AM},${0.8 * d})`; x.lineWidth = 2 * s; x.stroke(); } fCaixa(x, cx, cy + 56 * s, 20 * s, 14 * s, 3 * s, OURO, d, 2 * s, 0.3); }
}
function ondasR(x, cx, cy, t, a, cor = CI, R = 250) { if (a <= 0.01) return; for (let k = 0; k < 4; k++) { const u = ((t * 0.9 + k / 4) % 1); anelP(x, cx, cy, 30 + u * R, cor, a * (1 - u) * 0.8, 4); } }
// mensagem: [ID][código]
function pacote(x, cx, cy, id, cod, a, corCod = AM, realce = 0) { if (a <= 0.01) return; fCaixa(x, cx - 130, cy, 240, 80, 14, CI, a, 4 + 3 * realce, 0.05); rotuloP(x, "ID " + id, cx - 130, cy, 36, "210,244,255", a); if (realce > 0) brilhoP(x, cx - 130, cy - 70, 120, CI, 0.12 * realce * a); fCaixa(x, cx + 130, cy, 240, 80, 14, corCod, a, 4, 0.05); rotuloP(x, cod, cx + 130, cy, 36, "255,240,190", a); }
function casaK(x, cx, cy, s, a, cor = BRC) { if (a <= 0.01) return; fCaixa(x, cx, cy, 240 * s, 170 * s, 8 * s, cor, a, 5 * s, 0.05); x.beginPath(); x.moveTo(cx - 140 * s, cy - 85 * s); x.lineTo(cx, cy - 190 * s); x.lineTo(cx + 140 * s, cy - 85 * s); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 5 * s; x.stroke(); fCaixa(x, cx + 60 * s, cy + 35 * s, 50 * s, 100 * s, 4 * s, cor, a, 4 * s, 0.05); }
// aparelho do ladrão: caixa com antena e luz piscando
function caixaRelay(x, cx, cy, s, a, cor = VE, liga = 0, t = 0) { if (a <= 0.01) return; fCaixa(x, cx, cy, 130 * s, 90 * s, 14 * s, cor, a, 4 * s, 0.12); linhaP(x, cx + 40 * s, cy - 45 * s, cx + 60 * s, cy - 120 * s, cor, a, 5 * s); discoP(x, cx + 60 * s, cy - 120 * s, 8 * s, cor, a); const led = liga * (0.5 + 0.5 * Math.sin(t * 10)); discoP(x, cx - 35 * s, cy, 10 * s, cor, a * (0.3 + 0.7 * led)); brilhoP(x, cx - 35 * s, cy, 34 * s, cor, 0.6 * a * led); }
// cadeado (ab = 0 fechado, 1 aberto)
function cadeadoK(x, cx, cy, s, cor, a, ab = 0) { if (a <= 0.01) return; const u = ab * 34 * s; x.beginPath(); x.moveTo(cx - 34 * s, cy - 20 * s - u); x.lineTo(cx - 34 * s, cy - 45 * s - u); x.arc(cx, cy - 45 * s - u, 34 * s, Math.PI, 0); x.lineTo(cx + 34 * s, cy - 20 * s - u * (1 - ab * 0.4)); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 10 * s; x.stroke(); fCaixa(x, cx, cy + 20 * s, 110 * s, 90 * s, 14 * s, cor, a, 5 * s, 0.18); discoP(x, cx, cy + 14 * s, 9 * s, cor, a); linhaP(x, cx, cy + 14 * s, cx, cy + 38 * s, cor, a, 6 * s); }
// cronômetro (seg = segundos)
function cronoK(x, cx, cy, r, seg, a) { if (a <= 0.01) return; anelP(x, cx, cy, r, CZ, 0.5 * a, 10); x.beginPath(); x.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 6.283 * Math.min(1, seg / 60)); x.strokeStyle = `rgba(${VE},${a})`; x.lineWidth = 12; x.stroke(); brilhoP(x, cx, cy, r * 1.3, VE, 0.15 * a); rotuloP(x, `0:${String(Math.floor(seg)).padStart(2, "0")}`, cx, cy + 4, r * 0.5, "255,205,215", a); }
function contadorK(x, cx, cy, n, cor, a, rot = "", corTxt = "255,255,255") { if (a <= 0.01) return; fCaixa(x, cx, cy, 230, 140, 24, cor, a, 5, 0.04); rotuloP(x, String(n), cx, cy + 4, 80, corTxt, a); if (rot) rotuloP(x, rot, cx, cy - 110, 38, cor, a); }
function checkK(x, cx, cy, r, a, cor = VD) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - r, cy); x.lineTo(cx - r * 0.3, cy + r * 0.7); x.lineTo(cx + r, cy - r * 0.7); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = Math.max(5, r * 0.25); x.lineJoin = "round"; x.stroke(); brilhoP(x, cx, cy, r * 2, cor, 0.3 * a); }
function riscoX(x, cx, cy, r, a) { if (a <= 0.01) return; linhaP(x, cx - r, cy - r, cx + r, cy + r, VE, a, 9); linhaP(x, cx - r, cy + r, cx + r, cy - r, VE, a, 9); }
// cabeça de perfil (nariz para a direita); o queixo fica em (cx + 70s, cy + 120s)
function cabecaK(x, cx, cy, s, cor, a) {
  if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 70 * s, cy + 230 * s); x.bezierCurveTo(cx - 80 * s, cy + 150 * s, cx - 170 * s, cy + 60 * s, cx - 160 * s, cy - 60 * s); x.bezierCurveTo(cx - 150 * s, cy - 170 * s, cx - 40 * s, cy - 210 * s, cx + 40 * s, cy - 190 * s);
  x.bezierCurveTo(cx + 120 * s, cy - 170 * s, cx + 140 * s, cy - 90 * s, cx + 128 * s, cy - 40 * s); x.lineTo(cx + 168 * s, cy + 12 * s); x.lineTo(cx + 128 * s, cy + 28 * s); x.lineTo(cx + 132 * s, cy + 52 * s); x.lineTo(cx + 118 * s, cy + 62 * s); x.lineTo(cx + 124 * s, cy + 88 * s);
  x.bezierCurveTo(cx + 120 * s, cy + 128 * s, cx + 90 * s, cy + 138 * s, cx + 50 * s, cy + 134 * s); x.lineTo(cx + 30 * s, cy + 230 * s);
  x.fillStyle = `rgba(${cor},${0.08 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 6 * s; x.stroke(); discoP(x, cx + 70 * s, cy - 50 * s, 8 * s, cor, a);
}
// cartão de calendário com marca (1 = vale, -1 = não vale)
function calendK(x, cx, cy, txt, a, marca = 0) { if (a <= 0.01) return; const cor = marca < 0 ? VE : marca > 0 ? VD : BRC; fCaixa(x, cx, cy, 150, 180, 18, cor, a, 4, 0.04); fCaixa(x, cx, cy - 66, 150, 46, 14, cor, a, 0.1, 0.22); rotuloP(x, txt, cx, cy + 20, 32, "255,255,255", a); if (marca > 0) checkK(x, cx, cy + 135, 26, a); if (marca < 0) riscoX(x, cx, cy + 135, 22, a); }
// lata de metal; tampa: 0 aberta (de lado), 1 fechada
function lataM(x, cx, cy, s, a, tampa = 1) { if (a <= 0.01) return; const w = 280 * s, h = 210 * s; fCaixa(x, cx, cy, w, h, 18 * s, "190,200,220", a, 5 * s, 0.3); for (let k = 1; k < 4; k++) linhaP(x, cx - w / 2 + 12 * s, cy - h / 2 + k * h / 4, cx + w / 2 - 12 * s, cy - h / 2 + k * h / 4, "190,200,220", 0.35 * a, 2 * s); const ly = cy - h / 2 - 16 * s - (1 - tampa) * 150 * s; fCaixa(x, cx + (1 - tampa) * 90 * s, ly, w + 26 * s, 34 * s, 12 * s, "225,232,245", a, 5 * s, 0.35); }
function bolsoK(x, cx, cy, s, a) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 170 * s, cy - 150 * s); x.lineTo(cx - 150 * s, cy + 90 * s); x.quadraticCurveTo(cx, cy + 190 * s, cx + 150 * s, cy + 90 * s); x.lineTo(cx + 170 * s, cy - 150 * s); x.strokeStyle = `rgba(${CI},${a})`; x.lineWidth = 6 * s; x.stroke(); x.setLineDash([12 * s, 10 * s]); x.beginPath(); x.moveTo(cx - 145 * s, cy - 130 * s); x.lineTo(cx - 128 * s, cy + 78 * s); x.quadraticCurveTo(cx, cy + 162 * s, cx + 128 * s, cy + 78 * s); x.lineTo(cx + 145 * s, cy - 130 * s); x.strokeStyle = `rgba(${OURO},${0.6 * a})`; x.lineWidth = 3 * s; x.stroke(); x.setLineDash([]); linhaP(x, cx - 230 * s, cy - 150 * s, cx + 230 * s, cy - 150 * s, CI, 0.5 * a, 4 * s); }
const ladraoK = (x, cx, cy, s, a) => { if (a <= 0.01) return; fPessoa(x, cx, cy, s, LADR, a); x.beginPath(); x.arc(cx, cy - 34 * s, 21 * s, Math.PI * 1.05, Math.PI * 1.95); x.strokeStyle = `rgba(${LADR},${0.9 * a})`; x.lineWidth = 5 * s; x.stroke(); };
// pergunta para os comentários
function setaComent(x, a, t) { if (a <= 0.01) return; const b = Math.sin(t * 6) * 16; fSeta(x, 700 + b, 1250, 900 + b, 1250, AM, a, 12); brilhoP(x, 1010, 1250, 90, AM, 0.35 * a * (0.7 + 0.3 * Math.sin(t * 6))); rotuloP(x, "comentários", 780, 1180, 38, "255,226,140", a); }
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 330 * s, 60 * s, CI, a, 8 * s, 0.12);
  x.beginPath(); x.moveTo(cx - 120 * s, cy + 160 * s); x.lineTo(cx - 190 * s, cy + 250 * s); x.lineTo(cx - 40 * s, cy + 160 * s); x.fillStyle = `rgba(${CI},${0.5 * a})`; x.fill();
  brilhoP(x, cx, cy, 380 * s, CI, 0.18 * a); rotuloP(x, txt, cx, cy + 6 * s, 190 * s, "255,226,140", a * (0.85 + 0.15 * Math.sin(t * 4)));
}
// estacionamento visto de cima: 8 x 5 carros; SEU = o carro que pisca
const SEUK = 19;
function estacionamento(x, a, pis, apaga = 0) { if (a <= 0.01) return; for (let lin = 0; lin < 4; lin++) linhaP(x, 70, 535 + lin * 170, 950, 535 + lin * 170, CZ, 0.3 * a, 2); for (let k = 0; k < 32; k++) { const col = k % 8, lin = Math.floor(k / 8), seu = k === SEUK; carroCima(x, 130 + col * 110, 620 + lin * 170, 0.9, seu ? AM : CZ, a * (seu ? 1 : 0.9 - 0.45 * apaga), seu ? pis : 0); } }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tP = B("pisca"), tMi = B("minuto"), tN = B("nada"), tPr = B("promessa");
  const p2 = tMi - 1.6, p3 = tN - 0.5, p4 = tPr - 2.6;
  mostrarGancho(p2 - 0.2);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["min", 330, 72, "em menos de 1 minuto", "pt-ve"], ["nad", 330, 72, "sem quebrar nada", "pt-am"], ["tru", 330, 66, "o truque: no final", "pt-am"], ["pro", 420, 44, "e como se proteger", "pt-fino"]]);
  MD.slam(tl, tx.min, tMi - 0.5, { from: 1.35 }); MD.leave(tl, tx.min, p3 - 0.1); MD.slam(tl, tx.nad, p3 + 0.1, { from: 1.3 }); MD.leave(tl, tx.nad, p4 - 0.1);
  MD.slam(tl, tx.tru, p4 + 0.2, { from: 1.25 }); MD.arrive(tl, tx.pro, tPr - 0.6, { y: 14 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano 1 (quadro 0): o estacionamento lotado; a chave aperta e só um carro pisca
    const a1 = 1 - PT.ss((t - p2) / 0.4);
    if (a1 > 0.01) {
      const zc = PT.lerp(1.5, 1.0, PT.out(t / (tP + 0.4))); x.save(); x.translate(540, 960); x.scale(zc, zc); x.translate(-540, -960);
      const pis = t > tP - 0.3 ? Math.max(0, Math.sin((t - tP + 0.3) * 9)) : 0, ach = PT.ss((t - tP + 0.3) / 0.4);
      estacionamento(x, a1, pis, ach);
      const sx = 130 + (SEUK % 8) * 110, sy = 620 + Math.floor(SEUK / 8) * 170;
      if (ach > 0) { anelP(x, sx, sy, 110 + 10 * Math.sin(t * 5), AM, a1 * ach, 6); brilhoP(x, sx, sy, 220, AM, 0.35 * a1 * ach); }
      x.restore();
      const ap = Math.max(PT.jan(t, 0.0, 0.9, 0.05, 0.3), PT.jan(t, tP - 1.2, tP - 0.2, 0.1, 0.3));
      chaveK(x, 540, 1320, 0.9, a1, ap); ondasR(x, 540, 1280, t, a1 * Math.max(PT.jan(t, 0.0, 1.6, 0.1, 0.4), PT.jan(t, tP - 1.1, tP + 0.8, 0.2, 0.4)), CI, 520);
    }
    // plano 2: o carro levado em menos de um minuto
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { const sai = PT.ss((t - tMi - 0.2) / 1.2); carroLado(x, 470 + sai * 260, 1010, 1.25, BRC, a2 * (1 - 0.6 * sai), PT.jan(t, p2 + 0.4, p2 + 1.2, 0.1, 0.2)); ladraoK(x, 140, 1000, 2.6, a2); cronoK(x, 780, 690, 120, PT.lerp(0, 47, PT.ss((t - p2) / Math.max(0.8, tMi - p2 + 0.3))), a2); for (let k = 0; k < 6; k++) { const u = ((t * 1.4 + k / 6) % 1); linhaP(x, 300 + sai * 300 - u * 260, 1120 - k * 22, 360 + sai * 300 - u * 260, 1120 - k * 22, BRC, a2 * sai * (1 - u) * 0.6, 3); } }
    // plano 3: sem quebrar nada — vidro inteiro e o cadeado abrindo sozinho
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) { const ab = PT.ss((t - tN + 0.1) / 0.4); carroLado(x, 540, 1060, 1.9, BRC, a3, ab * Math.max(0, Math.sin((t - tN) * 9))); cadeadoK(x, 540, 700, 1.3, ab > 0.5 ? VD : CI, a3, ab); checkK(x, 400, 1290, 30, a3 * PT.ss((t - tN - 0.2) / 0.3)); rotuloP(x, "vidro inteiro", 560, 1290, 36, "170,255,210", a3 * PT.ss((t - tN - 0.2) / 0.3)); }
    // plano 4: o truque (escondido): dois aparelhos e um "?"
    const a4 = PT.ss((t - p4) / 0.5);
    if (a4 > 0.01) { casaK(x, 250, 860, 1.0, a4 * 0.8); carroLado(x, 760, 1180, 0.9, BRC, a4 * 0.8); caixaRelay(x, 380, 1000, 0.8, a4, VE, 1, t); caixaRelay(x, 600, 1230, 0.8, a4, VE, 1, t + 1); x.setLineDash([14, 12]); x.beginPath(); x.moveTo(400, 950); x.quadraticCurveTo(620, 880, 610, 1150); x.strokeStyle = `rgba(${VE},${0.7 * a4})`; x.lineWidth = 4; x.stroke(); x.setLineDash([]); rotuloP(x, "?", 560, 900, 150, AM, a4 * PT.ss((t - p4 - 0.4) / 0.4) * (0.85 + 0.15 * Math.sin(t * 4))); }
  });
};

// =============== 2. um rádio no bolso ===============
CENAS.radio = (el, c, B) => {
  const tR = B("radio"), tO = B("ouvem"), tI = B("id"), tIg = B("ignoram");
  const pB = tO - 2.0, pC = tI - 0.7, pD = tIg - 1.8;
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["rad", 330, 76, "um rádio minúsculo", "pt-ci"], ["ouv", 330, 72, "todo carro ouve", "pt-ci"], ["id", 330, 70, "começa com o ID", "pt-am"], ["ign", 330, 64, "não é comigo: ignora", "pt-ci"]]);
  MD.slam(tl, tx.rad, tR - 0.05, { from: 1.3 }); MD.leave(tl, tx.rad, pB - 0.1); MD.slam(tl, tx.ouv, tO - 0.3, { from: 1.3 }); MD.leave(tl, tx.ouv, pC - 0.1);
  MD.slam(tl, tx.id, tI - 0.05, { from: 1.25 }); MD.leave(tl, tx.id, pD - 0.1); MD.slam(tl, tx.ign, tIg - 0.5, { from: 1.2 });
  const est = estF(5), tAp = pB - 1.6;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: a chave por dentro (antena + chip) e o aperto
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { const dz = PT.ss((t - tR + 0.2) / 0.6); brilhoP(x, 540, 900, 380, CI, 0.12 * aA); chaveK(x, 540, 900, 3.0, aA, PT.jan(t, tAp - 0.2, tAp + 0.5, 0.1, 0.3), dz); ondasR(x, 540, 830, t, aA * PT.ss((t - tAp) / 0.4), CI, 520); if (dz > 0) { rotuloP(x, "antena", 300, 1100, 36, "255,226,140", aA * dz); rotuloP(x, "chip", 780, 1100, 36, "255,226,140", aA * dz); } }
    // plano B: todos os carros em volta ouvem
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { chaveK(x, 540, 980, 1.0, aB, 1); ondasR(x, 540, 940, t, aB, CI, 560); [[220, 640], [540, 560], [860, 640], [200, 1000], [880, 980], [330, 1280], [750, 1300]].forEach(([px, py], k) => { const ch = PT.ss((t - pB - 0.3 - k * 0.15) / 0.3); carroCima(x, px, py, 1, k === 1 ? AM : CZ, aB); if (ch > 0) for (let j = 0; j < 2; j++) anelP(x, px, py, 80 + j * 22 + 8 * Math.sin(t * 6 + k), CI, aB * ch * 0.5, 3); }); }
    // plano C: a mensagem começa com o número de identificação
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { const ch = PT.out(PT.ss((t - pC) / 0.6)); chaveK(x, 150, 1240, 0.8, aC, 1); pacote(x, PT.lerp(360, 540, ch), 860, "4F2A", "· · ·", aC, AM, PT.ss((t - tI + 0.2) / 0.4)); const n = PT.ss((t - tI - 0.4) / 0.4); fSeta(x, 410, 950, 410, 1040, CI, aC * n, 5); rotuloP(x, "tipo o nome do dono", 440, 1090, 40, "210,244,255", aC * n); }
    // plano D: os outros leem e ignoram; só o seu responde
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { pacote(x, 540, 560, "4F2A", "· · ·", aD * 0.8); [[220, 860], [540, 820], [860, 860], [260, 1180], [820, 1180]].forEach(([px, py], k) => { const seu = k === 1, q = PT.ss((t - pD - 0.3 - k * 0.2) / 0.3); carroCima(x, px, py, 1.1, seu ? AM : CZ, aD * (seu ? 1 : 1 - 0.4 * q), seu ? q * Math.max(0, Math.sin(t * 8)) : 0); rotuloP(x, seu ? "é comigo!" : "não é comigo", px, py - 110, 30, seu ? "255,226,140" : "190,196,210", aD * q); if (!seu) riscoX(x, px, py, 26, aD * q * 0.8); }); }
  });
};

// =============== 3. o código que muda ===============
CENAS.codigo = (el, c, B) => {
  const tA = B("adivinha"), tN = B("naoabre"), tD = B("diferente"), tS = B("segredo"), tSb = B("sobe"), tV = B("vale");
  const pB = tN - 0.5, pC = tD - 0.6, pD = tS - 0.6, pE = tV - 1.0;
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["adv", 330, 80, "adivinha", "pt-am"], ["gra", 330, 62, "gravou e repetiu: abre?", "pt-ci"], ["nao", 330, 92, "não abre", "pt-ve"], ["dif", 330, 64, "cada clique, um código novo", "pt-ci", "white-space:normal;left:60px;width:960px"], ["seg", 330, 64, "mesmo segredo + contador", "pt-am"], ["usa", 330, 64, "usado nunca mais vale", "pt-ve"]]);
  MD.slam(tl, tx.adv, tA - 0.1, { from: 1.4 }); MD.leave(tl, tx.adv, tA + 1.2); MD.slam(tl, tx.gra, tA + 1.4, { from: 1.2 }); MD.leave(tl, tx.gra, pB - 0.1);
  MD.slam(tl, tx.nao, tN - 0.05, { from: 1.5 }); MD.leave(tl, tx.nao, pC - 0.1); MD.slam(tl, tx.dif, tD - 0.3, { from: 1.2 }); MD.leave(tl, tx.dif, pD - 0.1);
  MD.slam(tl, tx.seg, tS - 0.1, { from: 1.25 }); MD.leave(tl, tx.seg, pE - 0.1); MD.slam(tl, tx.usa, tV - 0.6, { from: 1.25 });
  const est = estF(7), tRep = pB - 1.6;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o ladrão grava a mensagem e toca de novo — abre?
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) {
      chaveK(x, 200, 760, 0.9, aA, PT.jan(t, c.ini + 0.3, c.ini + 1.0, 0.1, 0.3)); ondasR(x, 200, 720, t, aA * PT.jan(t, c.ini + 0.3, tRep - 0.4, 0.2, 0.4), CI, 330);
      ladraoK(x, 330, 1220, 2.2, aA); const rec = PT.ss((t - c.ini - 0.6) / 0.3); fCaixa(x, 470, 1180, 160, 100, 14, VE, aA * rec, 4, 0.12); discoP(x, 425, 1180, 10, VE, aA * rec * (t < tRep ? 0.5 + 0.5 * Math.sin(t * 8) : 0.3)); rotuloP(x, t < tRep ? "REC" : "PLAY", 495, 1180, 28, "255,170,180", aA * rec);
      const pl = PT.ss((t - tRep) / 0.3); if (pl > 0) { for (let k = 0; k < 4; k++) { const u = ((t * 1.2 + k / 4) % 1); x.beginPath(); x.arc(470, 1180, 40 + u * 260, -1.2, 0.2); x.strokeStyle = `rgba(${VE},${aA * pl * (1 - u) * 0.8})`; x.lineWidth = 4; x.stroke(); } }
      carroLado(x, 760, 920, 1.0, BRC, aA); rotuloP(x, "?", 760, 760, 130, AM, aA * pl * (0.85 + 0.15 * Math.sin(t * 5)));
    }
    // plano B: não abre
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const tr = Math.sin(t * 40) * 6 * PT.jan(t, tN - 0.1, tN + 0.5, 0.05, 0.2); carroLado(x, 540, 1120, 1.5, BRC, aB); cadeadoK(x, 540 + tr, 760, 1.6, VE, aB, 0); anelP(x, 540, 760, 150 + 20 * Math.sin(t * 6), VE, 0.6 * aB * PT.ss((t - tN + 0.1) / 0.3), 6); brilhoP(x, 540, 760, 260, VE, 0.25 * aB); }
    // plano C: cada apertada, um código diferente
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { chaveK(x, 230, 960, 1.4, aC, Math.max(0, Math.sin((t - pC) * 5))); ["7F3A91", "B21C04", "9E0D77", "41C8B2"].forEach((cd, k) => { const q = PT.ss((t - pC - 0.3 - k * 0.55) / 0.3); const y = 640 + k * 150; fCaixa(x, 650, y, 360, 100, 18, [AM, CI, LA, VD][k], aC * q, 4, 0.04); rotuloP(x, cd, 650, y + 2, 48, "235,240,255", aC * q); fSeta(x, 330, 940, 450, y, BRC, 0.35 * aC * q, 3); }); }
    // plano D: o mesmo segredo dos dois lados + o contador que sobe
    const aD = planoC(t, pD, pE);
    if (aD > 0.01) {
      const n = 41 + (t > tSb - 0.1 ? 1 : 0) + (t > tSb + 0.9 ? 1 : 0), pul = PT.jan(t, tSb - 0.1, tSb + 0.3, 0.05, 0.2) + PT.jan(t, tSb + 0.9, tSb + 1.3, 0.05, 0.2);
      chaveK(x, 270, 640, 1.1, aD, pul); carroCima(x, 810, 640, 1.4, BRC, aD);
      for (const px of [270, 810]) { const q = PT.ss((t - tS + 0.2) / 0.4); fCaixa(x, px, 900, 220, 110, 22, OURO, aD * q, 5, 0.04); rotuloP(x, "segredo", px, 902, 38, "255,226,140", aD * q); contadorK(x, px, 1150, n, CI, aD * PT.ss((t - tS - 0.6) / 0.4), "", pul > 0.5 ? "255,226,140" : "255,255,255"); }
      rotuloP(x, "contador", 540, 1150, 34, "210,244,255", aD * PT.ss((t - tS - 0.6) / 0.4)); linhaP(x, 370, 900, 710, 900, OURO, 0.6 * aD * PT.ss((t - tS) / 0.4), 3);
    }
    // plano E: código usado nunca mais vale
    const aE = PT.ss((t - pE) / 0.5);
    if (aE > 0.01) { const st = PT.out(PT.ss((t - tV + 0.5) / 0.35)); fCaixa(x, 540, 820, 520, 150, 24, AM, aE * (1 - 0.6 * st), 5, 0.04); rotuloP(x, "7F3A91", 540, 824, 76, "255,240,190", aE * (1 - 0.6 * st)); linhaP(x, 300, 824, 780, 824, VE, aE * st, 8); x.save(); x.translate(620, 1010); x.rotate(-0.14); x.scale(1.6 - 0.6 * st, 1.6 - 0.6 * st); fCaixa(x, 0, 0, 340, 110, 16, VE, aE * st, 7, 0.04); rotuloP(x, "USADO", 0, 4, 64, "255,150,165", aE * st); x.restore(); }
  });
};

// =============== 4. e se apertar longe? (a janela) ===============
CENAS.janela = (el, c, B) => {
  const tBo = B("bolso"), tT = B("tras"), tJ = B("janela"), tPo = B("porteiro"), tOn = B("ontem");
  const pB = tT - 1.6, pC = tJ - 0.6, pD = tPo - 0.3;
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["peg", 330, 72, "a pegadinha", "pt-am"], ["bol", 330, 66, "apertou no bolso?", "pt-ci"], ["tra", 330, 70, "o carro fica pra trás", "pt-ve"], ["jan", 330, 72, "a janela à frente", "pt-ci"], ["ont", 330, 66, "a de ontem? nunca", "pt-ve"]]);
  MD.slam(tl, tx.peg, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.peg, tBo - 1.0); MD.slam(tl, tx.bol, tBo - 0.7, { from: 1.25 }); MD.leave(tl, tx.bol, pB - 0.1); MD.slam(tl, tx.tra, tT - 0.4, { from: 1.25 }); MD.leave(tl, tx.tra, pC - 0.1);
  MD.slam(tl, tx.jan, tJ - 0.1, { from: 1.25 }); MD.leave(tl, tx.jan, tOn - 0.8); MD.slam(tl, tx.ont, tOn - 0.5, { from: 1.3 });
  const est = estF(9);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: a chave no bolso apertando sozinha, longe do carro
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { const k = Math.max(0, Math.floor((t - tBo + 0.6) / 0.45)), n = 42 + Math.min(5, k), ap = t > tBo - 0.6 ? Math.max(0, Math.sin((t - tBo + 0.6) * 7)) : 0; bolsoK(x, 360, 900, 1.2, aA); chaveK(x, 360, 900, 1.3, aA, ap); contadorK(x, 360, 1250, n, AM, aA * PT.ss((t - tBo + 0.8) / 0.4), "", "255,226,140"); carroCima(x, 820, 760, 0.8, CZ, aA); x.setLineDash([10, 12]); linhaP(x, 520, 820, 760, 770, CZ, 0.5 * aA, 3); x.setLineDash([]); rotuloP(x, "longe", 650, 730, 32, "190,196,210", aA); }
    // plano B: chave 47, carro 42 — ficou pra trás
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { contadorK(x, 300, 900, 47, AM, aB, "chave", "255,226,140"); contadorK(x, 780, 900, 42, CI, aB, "carro"); const g = PT.ss((t - tT + 0.3) / 0.4); fSeta(x, 700, 1080, 380, 1080, VE, aB * g, 6); rotuloP(x, "5 cliques de diferença", 540, 1150, 36, "255,170,180", aB * g); chaveK(x, 300, 620, 0.6, aB * 0.7); carroCima(x, 780, 620, 0.7, CI, aB * 0.7); }
    // plano C: a régua de códigos com a janela à frente; o 47 cai dentro e o carro se atualiza
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) {
      const j = PT.ss((t - tJ + 0.2) / 0.4), ch = PT.out(PT.ss((t - tJ - 0.5) / 0.6)), at = PT.ss((t - tJ - 1.2) / 0.3), car = at > 0.5 ? 47 : 42;
      for (let n = 36; n <= 58; n++) { const px = 80 + (n - 36) * 42; const ok = n > 42 && n <= 58; discoP(x, px, 960, n === car ? 12 : 6, n <= 42 ? VE : ok ? VD : BRC, aC * (n <= 42 ? 0.5 : 0.8)); if (n % 4 === 2) rotuloP(x, String(n), px, 1010, 26, "200,210,230", aC * 0.8); }
      fCaixa(x, 80 + (50 - 36) * 42, 960, 16 * 42, 80, 30, VD, aC * j, 4, 0.12); rotuloP(x, "aceita", 80 + (50 - 36) * 42, 880, 36, "170,255,210", aC * j); rotuloP(x, "nunca", 80 + (39 - 36) * 42, 880, 36, "255,170,180", aC * j);
      const cx = 80 + (car - 36) * 42; carroCima(x, cx, 1170, 0.9, CI, aC); fSeta(x, cx, 1090, cx, 1010, CI, aC, 4); rotuloP(x, "carro", cx, 1270, 30, "210,244,255", aC);
      const kx = 80 + (47 - 36) * 42; fCaixa(x, kx, PT.lerp(620, 960, ch), 90, 64, 14, AM, aC * PT.ss((t - tJ - 0.3) / 0.3) * (1 - at * 0.6), 4, 0.2); rotuloP(x, "47", kx, PT.lerp(620, 960, ch), 34, "255,240,190", aC * PT.ss((t - tJ - 0.3) / 0.3) * (1 - at * 0.6)); checkK(x, kx + 70, 760, 30, aC * at);
    }
    // plano D: o porteiro e as senhas
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { fCaixa(x, 190, 980, 260, 380, 20, BRC, aD, 5, 0.04); fCaixa(x, 190, 900, 190, 120, 10, CI, aD, 4, 0.08); fPessoa(x, 190, 920, 1.6, CI, aD); rotuloP(x, "portaria", 190, 1210, 34, "220,228,245", aD); [["ontem", -1, tOn - 0.4], ["hoje", 1, tPo + 0.8], ["amanhã", 1, tPo + 1.5], ["depois", 1, tPo + 2.2]].forEach(([nm, m, t0], k) => { const q = PT.ss((t - t0) / 0.3), px = k === 0 ? 640 : 300 + k * 170, py = k === 0 ? 1170 : 820; calendK(x, px, py, nm, aD * q, m); }); }
  });
};

// =============== 5. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tQ = B("queixo"), tL = B("longe"), tM = B("mito");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "chuta nos comentários", "pt-ci"], ["qui", 330, 64, "chave no queixo alcança mais?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["mit", 330, 80, "funciona ou é mito?", "pt-am"]]);
  const pB = tQ - 1.0, pC = tL - 0.1;
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, pB - 0.1); MD.slam(tl, tx.qui, pB + 0.1, { from: 1.2 }); MD.leave(tl, tx.qui, pC - 0.1); MD.slam(tl, tx.mit, pC + 0.1, { from: 1.4 });
  const est = estF(21);
  T.quadro((x, t) => {
    estD(x, est, t);
    balaoCom(x, 540, 960, 1.2, PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4)), "?", t);
    // a cabeça com a chave no queixo e as ondas indo mais longe
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { cabecaK(x, 300, 900, 1.3, BRC, aB); const enc = PT.ss((t - tQ + 0.3) / 0.5); chaveK(x, PT.lerp(330, 395, enc), PT.lerp(1260, 1075, enc), 0.7, aB, enc); const lg = PT.ss((t - tQ) / 0.6); for (let k = 0; k < 4; k++) { const u = ((t * 0.8 + k / 4) % 1); x.beginPath(); x.arc(395, 1060, 40 + u * (260 + 220 * lg), -0.7, 0.7); x.strokeStyle = `rgba(${CI},${aB * (1 - u) * 0.8})`; x.lineWidth = 4; x.stroke(); } carroCima(x, 860, 1060, 0.8, AM, aB, lg * Math.max(0, Math.sin(t * 7))); rotuloP(x, "?", 860, 900, 100, AM, aB * lg); }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { balaoCom(x, 540, 900, 1.1, aC, "?", t); setaComent(x, aC, t); }
  });
};

// =============== 6. o truque dos ladrões (ataque de retransmissão) ===============
CENAS.ladrao = (el, c, B) => {
  const tPm = B("prometi"), tP = B("perto"), tD = B("dois"), tCa = B("capta"), tR = B("repete"), tA = B("abre"), tL = B("leva");
  const tNg = tempoPalavras(c)("Ninguém") || tA + 1.2;
  const pA2 = tPm + 1.0, pB = tD - 0.6, pC = tA - 0.6, pD = tNg - 0.4;
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pro", 330, 72, "o truque prometido", "pt-am"], ["sem", 330, 66, "abre sem apertar", "pt-ci"], ["doi", 330, 70, "dois aparelhos", "pt-am"], ["abr", 330, 86, "e abre", "pt-ve"], ["que", 330, 64, "ninguém quebrou o código", "pt-ci"], ["lon", 430, 34, "só levaram o sinal mais longe", "pt-fino"]]);
  MD.slam(tl, tx.pro, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.pro, pA2 + 0.6); MD.slam(tl, tx.sem, pA2 + 0.8, { from: 1.25 }); MD.leave(tl, tx.sem, pB - 0.1);
  MD.slam(tl, tx.doi, tD - 0.1, { from: 1.3 }); MD.leave(tl, tx.doi, pC - 0.1); MD.slam(tl, tx.abr, tA - 0.3, { from: 1.5 }); MD.leave(tl, tx.abr, pD - 0.1); MD.slam(tl, tx.que, tNg - 0.1, { from: 1.2 }); MD.arrive(tl, tx.lon, tL - 0.2, { y: 14 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A1: os aparelhos do começo, agora acesos
    const a1 = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pA2) / 0.4));
    if (a1 > 0.01) { caixaRelay(x, 360, 980, 1.6, a1, VE, 1, t); caixaRelay(x, 720, 980, 1.6, a1, VE, 1, t + 1); brilhoP(x, 540, 960, 380, VE, 0.15 * a1); rotuloP(x, "?", 540, 760, 120, AM, a1 * (1 - PT.ss((t - tPm) / 0.4))); }
    // plano A2: a chave presencial — chega perto e o carro abre sozinho
    const a2 = planoC(t, pA2, pB);
    if (a2 > 0.01) { const anda = PT.inOut((t - pA2) / Math.max(0.8, tP - pA2)), px = PT.lerp(130, 470, anda), dentro = PT.ss((t - tP + 0.2) / 0.3); carroLado(x, 700, 1080, 1.1, BRC, a2, dentro * Math.max(0, Math.sin((t - tP) * 9))); x.setLineDash([12, 12]); anelP(x, 700, 1080, 250, dentro > 0.5 ? VD : CI, 0.5 * a2, 4); x.setLineDash([]); fPessoa(x, px, 1060, 2.4, CI, a2); chaveK(x, px + 40, 1100, 0.35, a2); cadeadoK(x, 700, 760, 0.9, dentro > 0.5 ? VD : CI, a2, dentro); }
    // plano B: casa (chave lá dentro) → aparelho 1 capta → aparelho 2 repete → carro
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) {
      const cap = PT.ss((t - tCa + 0.2) / 0.4), rep = PT.ss((t - tR + 0.2) / 0.4);
      casaK(x, 250, 760, 1.2, aB); chaveK(x, 230, 790, 0.4, aB, 1); ondasR(x, 230, 780, t, aB * 0.7, CI, 200);
      ladraoK(x, 480, 900, 1.8, aB); caixaRelay(x, 560, 880, 0.8, aB, VE, cap, t); rotuloP(x, "capta", 560, 990, 34, "255,170,180", aB * cap);
      carroLado(x, 640, 1270, 1.0, BRC, aB); ladraoK(x, 330, 1250, 1.8, aB); caixaRelay(x, 420, 1220, 0.8, aB, VE, rep, t + 1); rotuloP(x, "repete", 420, 1330, 34, "255,170,180", aB * rep);
      if (rep > 0) { for (let q = 0; q < 8; q++) { const u = ((t * 0.9 + q / 8) % 1), px = PT.lerp(600, 450, u), py = PT.lerp(840, 1170, u); discoP(x, px, py, 7, VE, aB * rep); brilhoP(x, px, py, 26, VE, 0.5 * aB * rep); } ondasR(x, 470, 1200, t, aB * rep * 0.8, VE, 220); }
    }
    // plano C: o carro abre e vai embora
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { const ab = PT.ss((t - tA + 0.2) / 0.3), vai = PT.ss((t - tA - 0.9) / 1.0); carroLado(x, 540 + vai * 300, 1080, 1.6, BRC, aC * (1 - 0.7 * vai), ab * Math.max(0, Math.sin((t - tA) * 9))); cadeadoK(x, 540, 720, 1.4, ab > 0.5 ? VE : BRC, aC * (1 - vai), ab); }
    // plano D: o mesmo sinal, só esticado
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { const est2 = PT.ss((t - tL + 0.3) / 0.8), kx = PT.lerp(380, 150, est2), cx = PT.lerp(700, 870, est2); chaveK(x, kx, 900, 1.3, aD, 1); carroCima(x, cx, 900, 1.6, BRC, aD); for (let q = 0; q < 14; q++) { const u = ((t * 0.6 + q / 14) % 1), px = PT.lerp(kx + 60, cx - 60, u); discoP(x, px, 900 + Math.sin(u * 12 + t * 3) * 12, 7, CI, aD); } fCaixa(x, 540, 1170, 330, 130, 20, CI, aD, 4, 0.04); cadeadoK(x, 440, 1178, 0.6, CI, aD, 0); rotuloP(x, "código", 580, 1170, 44, "210,244,255", aD); rotuloP(x, "intacto", 540, 1290, 38, "170,255,210", aD * PT.ss((t - tNg - 0.2) / 0.3)); }
  });
};

// =============== 7. a defesa ===============
CENAS.dica = (el, c, B) => {
  const tPo = B("porta"), tLa = B("lata"), tT = B("testar"), tBq = B("bloq");
  const pB = Math.max(tLa - 0.3, tPo + 0.3), pC = tT - 0.5, tK = Math.max(c.ini + 1.4, tPo - 1.4);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["def", 330, 72, "a defesa", "pt-am"], ["por", 330, 66, "longe da porta", "pt-ci"], ["lat", 330, 66, "lata de metal ou bolsinha", "pt-am", "white-space:normal;left:60px;width:960px"], ["tes", 330, 66, "o teste", "pt-ci"], ["blo", 330, 64, "não abriu? tá protegido", "pt-am"]]);
  MD.slam(tl, tx.def, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.def, tK - 0.1); MD.slam(tl, tx.por, tK + 0.1, { from: 1.25 }); MD.leave(tl, tx.por, pB - 0.1);
  MD.slam(tl, tx.lat, tLa - 0.1, { from: 1.2 }); MD.leave(tl, tx.lat, pC - 0.1); MD.slam(tl, tx.tes, tT - 0.2, { from: 1.25 }); MD.leave(tl, tx.tes, tBq - 0.7); MD.slam(tl, tx.blo, tBq - 0.4, { from: 1.25 });
  const est = estF(15);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: a chave sai do gancho ao lado da porta e vai para longe
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { fCaixa(x, 200, 960, 220, 520, 12, BRC, aA, 5, 0.05); discoP(x, 260, 980, 10, BRC, aA); rotuloP(x, "porta", 200, 1260, 32, "220,228,245", aA); const vai = PT.inOut((t - tK) / 0.9), kx = PT.lerp(390, 760, vai), ky = PT.lerp(820, 1000, vai); linhaP(x, 360, 760, 420, 760, BRC, aA, 6); riscoX(x, 390, 640, 40, aA * PT.jan(t, c.ini + 0.6, tK + 0.2, 0.2, 0.2)); chaveK(x, kx, ky, 0.8, aA); ondasR(x, kx, ky - 30, t, aA * 0.6, CI, PT.lerp(320, 160, vai)); fCaixa(x, 760, 1080, 300, 70, 12, OURO, aA * vai, 4, 0.12); checkK(x, 760, 900, 34, aA * PT.ss((t - tK - 0.8) / 0.3)); }
    // plano B: a chave entra na lata e o sinal para
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const cai = PT.inOut((t - pB - 0.1) / 0.6), fecha = PT.ss((t - pB - 0.8) / 0.5), ky = PT.lerp(640, 930, cai); chaveK(x, 420, ky, 0.8, aB * (1 - 0.6 * fecha)); ondasR(x, 420, ky - 30, t, aB * (1 - fecha), CI, 300); lataM(x, 420, 960, 1.0, aB, fecha); for (let k = 0; k < 3; k++) anelP(x, 420, 960, 170 + k * 18, VE, 0.35 * aB * fecha * (0.6 + 0.4 * Math.sin(t * 5 + k)), 3); x.beginPath(); x.ellipse(800, 980, 110, 140, 0, 0, 6.283); x.fillStyle = `rgba(${CZ},${0.25 * aB})`; x.fill(); x.strokeStyle = `rgba(${BRC},${0.8 * aB})`; x.lineWidth = 4; x.stroke(); rotuloP(x, "bolsinha", 800, 1170, 32, "220,228,245", aB * PT.ss((t - tLa) / 0.4)); }
    // plano C: o teste — chega perto do carro com a chave na lata; não abre
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { const anda = PT.inOut((t - pC - 0.2) / 1.6), px = PT.lerp(170, 430, anda), ok = PT.ss((t - tBq + 0.3) / 0.3); carroLado(x, 740, 1100, 1.0, BRC, aC); fPessoa(x, px, 1080, 2.4, CI, aC); lataM(x, px + 60, 1130, 0.25, aC, 1); cadeadoK(x, 740, 780, 1.1, ok > 0.5 ? VD : CI, aC, 0); checkK(x, 900, 780, 40, aC * ok); }
  });
};

// =============== 8. resumo ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [560, 720, 880], textos = ["o ID: o nome do carro", "um código novo a cada clique", "chave sem botão: na lata"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    chaveK(x, 400, 1220, 0.9, 0.8 * sai * PT.ss((t - c.ini) / 0.5), Math.max(0, Math.sin(t * 3))); carroCima(x, 700, 1220, 1.1, AM, 0.8 * sai * PT.ss((t - c.ini) / 0.5), Math.max(0, Math.sin(t * 3)));
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [CI, AM, VD][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
