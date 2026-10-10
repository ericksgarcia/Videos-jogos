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

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tB = B("bateria"), tM0 = B("meio0"), tA = B("apita"), tE = B("energia"), tP = B("promessa");
  mostrarGancho(tA - 0.3);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["sem", 330, 76, "sem bateria, sem fio", "pt-ve"], ["ene", 330, 72, "de onde vem a energia?", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.sem, tA + 0.2, { from: 1.3 }); MD.leave(tl, tx.sem, tE - 0.35); MD.slam(tl, tx.ene, tE - 0.05, { from: 1.3 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // quadro 0: o cartão brilhando no ar, a bateria riscada e o cronômetro de meio segundo
    const a0 = 1 - PT.ss((t - tA + 1.6) / 0.4);
    if (a0 > 0.01) { brilhoP(x, 540, 700, 360, "240,200,120", 0.25 * a0); const cr = PT.ss((t - tM0 + 1.2) / 0.8); rotuloP(x, `${(cr * 0.5).toFixed(2).replace(".", ",")} s`, 260, 1220, 64, "150,255,200", a0 * PT.ss((t - tM0 + 1.4) / 0.3)); }
    const enc = PT.inOut((t - tA + 1.5) / 1.5), apito = PT.jan(t, tA - 0.1, tB + 0.5, 0.1, 0.5);
    maquininha(x, 540, 1060, 1, 1, apito);
    cartao(x, 540, PT.lerp(560, 860, enc), 0.8, 1, 0, 0, t, -0.15 * (1 - enc));
    if (apito > 0) for (let k = 0; k < 3; k++) anelP(x, 540, 900, 60 + k * 50 + (t - tA) * 200, VD, apito * (1 - k * 0.3), 4);
    const aB = PT.ss((t - 0.1) / 0.3) * (1 - PT.ss((t - tE - 1) / 0.5)); if (aB > 0) { x.save(); x.translate(860, 650); fCaixa(x, 0, 0, 160, 80, 12, "170,178,195", aB, 5, 0.05); fCaixa(x, 90, 0, 16, 30, 4, "170,178,195", aB, 4, 0.3); linhaP(x, -100, -60, 100, 60, VE, aB, 8); x.restore(); }
    if (t > tE - 0.3) rotuloP(x, "?", 260, 860, 140, AM, PT.ss((t - tE + 0.3) / 0.4) * (0.8 + 0.2 * Math.sin(t * 4)));
  });
};

// =============== 2. a antena escondida ===============
CENAS.antena = (el, c, B) => {
  const tV = B("voltas"), tA = B("antena"), tC = B("chip"), tCa = B("campo"), tT = B("treze");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ant", 330, 76, "uma antena escondida", "pt-am"], ["tre", 330, 72, "13 milhões de vezes/s", "pt-ci"]]);
  MD.slam(tl, tx.ant, tA - 0.05, { from: 1.3 }); MD.leave(tl, tx.ant, tT - 0.4); MD.slam(tl, tx.tre, tT - 0.1, { from: 1.3 });
  const est = estF(5);
  T.quadro((x, t) => {
    estD(x, est, t);
    const aV = PT.ss((t - tV + 0.3) / 0.8), mov = PT.inOut((t - tCa + 0.8) / 1);
    cartao(x, PT.lerp(540, 330, mov), PT.lerp(820, 760, mov), PT.lerp(1.4, 0.8, mov), 1, aV, 0, t);
    if (PT.ss((t - tC + 0.3) / 0.4) > 0 && mov < 0.5) { brilhoP(x, 540 - 210, 820 - 42, 90, OURO, 0.5 * PT.ss((t - tC + 0.3) / 0.4)); rotuloP(x, "chip", 330, 700, 34, "255,226,140", PT.ss((t - tC + 0.3) / 0.4) * (1 - 2 * mov)); }
    const aM = PT.ss((t - tCa + 0.6) / 0.6); maquininha(x, 790, 1150, 0.8, aM); campo(x, 790, 1000, t * (1 + 3 * PT.ss((t - tT) / 0.5)), aM, 6, 380);
    if (aM > 0) rotuloP(x, "campo magnético", 790, 1360, 30, "180,235,255", aM);
  });
};

// =============== 3. a energia vem da máquina ===============
CENAS.inducao = (el, c, B) => {
  const tA = B("atravessa"), tC = B("corrente"), tS = B("semfio"), tAl = B("alimenta"), tCm = B("cm"), tF = B("fraco");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["cor", 330, 70, "o campo vira corrente", "pt-am"], ["sf", 330, 64, "como carregador sem fio", "pt-ci"], ["cm", 330, 70, "só funciona bem perto", "pt-ve"]]);
  MD.slam(tl, tx.cor, tC - 0.05, { from: 1.3 }); MD.leave(tl, tx.cor, tS - 0.35); MD.slam(tl, tx.sf, tS - 0.05, { from: 1.25 }); MD.leave(tl, tx.sf, tCm - 0.35); MD.slam(tl, tx.cm, tCm - 0.05, { from: 1.3 });
  const est = estF(7);
  T.quadro((x, t) => {
    estD(x, est, t);
    const longe = PT.ss((t - tCm) / 1.2), cy = PT.lerp(820, 560, longe);
    maquininha(x, 540, 1170, 0.9, 1); campo(x, 540, 1030, t, 1, 6, 420);
    const aA = PT.ss((t - tA + 0.6) / 0.6), cor = PT.ss((t - tC + 0.2) / 0.5) * (1 - 0.95 * longe);
    cartao(x, 540, cy, 1, aA, 1, cor, t);
    // carregador sem fio (comparação)
    const aS = PT.jan(t, tS - 0.3, tCm - 0.2, 0.4, 0.4); if (aS > 0) { fCaixa(x, 880, 560, 160, 30, 15, BRC, aS, 4, 0.1); fCelular(x, 880, 470, 160, BRC, aS, 0.1); brilhoP(x, 880, 520, 90, VD, 0.4 * aS); rotuloP(x, "carregando", 880, 640, 26, "150,255,200", aS); }
    const aAl = PT.ss((t - tAl + 0.3) / 0.5) * (1 - longe); if (aAl > 0) brilhoP(x, 540 - 210, cy - 42, 140, OURO, 0.7 * aAl * (0.7 + 0.3 * Math.sin(t * 6)));
    if (longe > 0) rotuloP(x, longe > 0.8 ? "longe: sem energia" : "", 540, cy + 230, 34, "255,160,170", longe);
  });
};

// =============== 4. a conversa ===============
CENAS.conversa = (el, c, B) => {
  const tA = B("acorda"), tM = B("meio"), tP = B("pergunta"), tAs = B("assinatura"), tAp = B("aprova");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["meio", 330, 80, "< 0,5 segundo", "pt-am"]]);
  MD.slam(tl, tx.meio, tM - 0.05, { from: 1.35 });
  const est = estF(9);
  T.quadro((x, t) => {
    estD(x, est, t);
    maquininha(x, 780, 1050, 0.9, 1, PT.ss((t - tAp + 0.2) / 0.3));
    cartao(x, 300, 1000, 0.7, 1, 1, PT.ss((t - tA + 0.3) / 0.4), t);
    const aP = PT.jan(t, tP - 0.2, tAp, 0.3, 0.4); if (aP > 0) { fSeta(x, 650, 880, 450, 880, CI, aP, 5); rotuloP(x, "quem é você?", 550, 840, 28, "180,235,255", aP); }
    const aR = PT.jan(t, tAs - 0.3, tAp + 0.6, 0.3, 0.4); if (aR > 0) { fSeta(x, 450, 1110, 650, 1110, AM, aR, 5); rotuloP(x, "dados + assinatura", 550, 1160, 28, "255,226,140", aR); }
    // banco
    const aB = PT.ss((t - tAp + 0.5) / 0.4); if (aB > 0) { x.beginPath(); x.moveTo(680, 640); x.lineTo(780, 580); x.lineTo(880, 640); x.closePath(); x.strokeStyle = `rgba(${VD},${aB})`; x.lineWidth = 5; x.stroke(); for (let k = 0; k < 4; k++) linhaP(x, 700 + k * 52, 650, 700 + k * 52, 730, VD, aB, 6); linhaP(x, 680, 740, 880, 740, VD, aB, 6); rotuloP(x, "banco: ✓", 780, 790, 30, "150,255,200", aB); }
  });
};

// =============== 5. por que copiar não adianta ===============
CENAS.seguranca = (el, c, B) => {
  const tM = B("muda"), tC = B("chave"), tU = B("umavez"), tCo = B("copiar"), tR = B("recusa");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["muda", 330, 66, "o código muda a cada compra", "pt-am", "white-space:normal;left:60px;width:960px"], ["uma", 330, 76, "vale uma vez só", "pt-ci"], ["rec", 330, 76, "cópia = recusada", "pt-ve"]]);
  MD.slam(tl, tx.muda, tM - 0.05, { from: 1.25 }); MD.leave(tl, tx.muda, tU - 0.35); MD.slam(tl, tx.uma, tU - 0.05, { from: 1.3 }); MD.leave(tl, tx.uma, tR - 0.4); MD.slam(tl, tx.rec, tR - 0.05, { from: 1.35 });
  const est = estF(11), hex = "0123456789ABCDEF";
  T.quadro((x, t) => {
    estD(x, est, t);
    // códigos de compras sucessivas, cada um diferente
    const aL = PT.ss((t - tM + 0.4) / 0.5) * (1 - PT.ss((t - tCo + 0.4) / 0.5));
    for (let k = 0; k < 4; k++) { const r = prng(k * 7 + 3); let s = ""; for (let q = 0; q < 12; q++) s += hex[Math.floor(r() * 16)]; const a = aL * PT.ss((t - tM - k * 0.5) / 0.4); fCaixa(x, 540, 620 + k * 120, 640, 90, 16, k === 3 && PT.ss((t - tU) / 0.4) > 0 ? AM : CI, a, 4, 0.06); rotuloP(x, `compra ${k + 1}:  ${s}`, 540, 620 + k * 120, 34, "220,240,255", a); }
    // a chave secreta dentro do chip
    const aC = PT.jan(t, tC - 0.3, tCo - 0.3, 0.4, 0.4); if (aC > 0) { anelP(x, 880, 1180, 34, OURO, aC, 6); linhaP(x, 860, 1205, 820, 1290, OURO, aC, 8); linhaP(x, 836, 1260, 856, 1272, OURO, aC, 6); rotuloP(x, "chave secreta (não sai do chip)", 540, 1320, 28, "255,226,140", aC); }
    // ladrão copiando e o banco recusando
    const aCo = PT.ss((t - tCo + 0.4) / 0.5); if (aCo > 0) { fPessoa(x, 230, 1000, 2.2, "170,178,195", aCo); fCaixa(x, 600, 900, 520, 100, 16, "170,178,195", aCo, 4, 0.06); rotuloP(x, "cópia: 7F3A91C2B0E4", 600, 900, 34, "200,205,215", aCo); const aR = PT.ss((t - tR + 0.3) / 0.4); if (aR > 0) { linhaP(x, 360, 860, 840, 940, VE, aR, 8); rotuloP(x, "RECUSADO: código já usado", 600, 1030, 34, "255,150,160", aR); } }
  });
};

// =============== 6. a dica ===============
CENAS.dica = (el, c, B) => {
  const tD = B("duzentos"), tS = B("seguranca"), tL = B("limite"), tA = B("app");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["semsenha", 330, 70, "sem senha: até ~R$ 200", "pt-am"], ["lim", 330, 66, "dá pra baixar o limite", "pt-ci"]]);
  MD.slam(tl, tx.semsenha, tD - 0.05, { from: 1.3 }); MD.leave(tl, tx.semsenha, tL - 0.6); MD.slam(tl, tx.lim, tL - 0.4, { from: 1.25 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    fCelular(x, 540, 920, 780, BRC, PT.ss((t - c.ini - 0.3) / 0.5), 0.06);
    const aA = PT.ss((t - tD + 0.4) / 0.5);
    if (aA > 0) {
      rotuloP(x, "Aproximação", 540, 700, 38, "255,255,255", aA);
      rotuloP(x, "sem senha até:", 540, 780, 30, "200,210,230", aA);
      const v = Math.round(PT.lerp(200, 50, PT.ss((t - tL) / 1.2))); rotuloP(x, `R$ ${v}`, 540, 880, 76, v < 200 ? "150,255,200" : "255,226,140", aA);
      linhaP(x, 360, 1000, 720, 1000, "200,210,230", 0.5 * aA, 8); const kx = PT.lerp(720, 450, PT.ss((t - tL) / 1.2)); linhaP(x, 360, 1000, kx, 1000, AM, aA, 8); discoP(x, kx, 1000, 18, "255,255,255", aA);
      const aP = PT.ss((t - tA + 0.3) / 0.4); if (aP > 0) { fCaixa(x, 540, 1130, 340, 70, 35, VD, aP, 4, 0.12); rotuloP(x, "ajustar no app ✓", 540, 1130, 30, "150,255,200", aP); }
    }
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["a maquininha cria um campo", "a antena vira energia", "código que vale uma vez", "tudo em meio segundo"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    cartao(x, 540, 1240, 0.5, 0.7 * sai, 1, 1, t);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [CI, AM, VD, LA][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
