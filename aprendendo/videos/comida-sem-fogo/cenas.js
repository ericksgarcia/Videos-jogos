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

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tF = B("fogo"), tA = B("agua"), tQ = B("quente"), tC = B("calor"), tFe = B("ferrugem"), tCu = B("cuidado");
  mostrarGancho(tQ - 0.3);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["min", 330, 76, "sem fogo, sem tomada", "pt-la"], ["dond", 330, 76, "de onde vem o calor?", "pt-ci"], ["fer", 330, 86, "a ferrugem?!", "pt-am"]]);
  MD.slam(tl, tx.min, tF - 0.4, { from: 1.3 }); MD.leave(tl, tx.min, tC - 1.3); MD.slam(tl, tx.dond, tC - 1.0, { from: 1.25 }); MD.leave(tl, tx.dond, tFe - 0.4); MD.slam(tl, tx.fer, tFe - 0.05, { from: 1.4 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // mato: folhas em volta
    for (let k = 0; k < 14; k++) { const bx = (k * 83) % 1080, by = 1340 - (k % 3) * 20; for (let f = 0; f < 3; f++) linhaP(x, bx, by, bx + (f - 1) * 40 + Math.sin(t + k) * 6, by - 120 - f * 20, VD, 0.4, 5); }
    fPessoa(x, 250, 1180, 2.4, "180,200,150", PT.ss((t - tF + 1.5) / 0.6));
    // quadro 0: a gota cai, o saquinho esquenta e solta vapor, o termômetro sobe
    const calor = PT.ss((t - 0.4) / 2.2); saquinho(x, 640, 1100, 1, 1, calor);
    const aG = PT.jan(t, 0, 1.0, 0.05, 0.3); gota(x, 640, PT.lerp(760, 920, PT.ss(t / 0.8)), 30, CI, aG);
    vapor(x, 640, 920, t, PT.ss((t - 1.0) / 0.8));
    termometroP(x, 900, 760, 380, 0, 100, PT.lerp(20, 75, calor), PT.ss((t - 0.2) / 0.4)); rotuloP(x, `${Math.round(PT.lerp(20, 75, calor))} °C`, 880, 540, 64, calor > 0.5 ? "255,170,90" : "180,235,255", PT.ss((t - 0.2) / 0.4));
  });
};

// =============== 2. a ferrugem esquenta ===============
CENAS.ferrugem = (el, c, B) => {
  const tP = B("prego"), tO = B("oxigenio"), tC = B("calor1"), tM = B("meses"), tMi = B("minutos"), tE = B("esquenta");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["fer", 330, 66, "ferrugem solta calor", "pt-la"], ["mes", 330, 70, "em meses: nem sente", "pt-ci"], ["min", 330, 70, "em minutos: esquenta!", "pt-ve"]]);
  MD.slam(tl, tx.fer, tC - 0.05, { from: 1.25 }); MD.leave(tl, tx.fer, tM - 0.3); MD.slam(tl, tx.mes, tM - 0.05, { from: 1.25 }); MD.leave(tl, tx.mes, tMi - 0.35); MD.slam(tl, tx.min, tMi - 0.05, { from: 1.35 });
  const est = estF(5);
  T.quadro((x, t) => {
    estD(x, est, t);
    const rapido = PT.ss((t - tMi) / 0.8), ferr = PT.ss((t - tO) / 6) * 0.5 + 0.5 * rapido;
    prego(x, 420, 880, 1.1, PT.ss((t - c.ini) / 0.5), ferr);
    // moléculas de oxigênio e água chegando
    const aO = PT.ss((t - tO + 0.3) / 0.5); if (aO > 0) for (let k = 0; k < 10; k++) { const u = ((t - tO) * 0.4 + k / 10) % 1, an = k * 0.9; discoP(x, 420 + Math.cos(an) * (300 - u * 270), 880 + Math.sin(an) * (380 - u * 330), 9, k % 2 ? CI : "150,200,255", aO * Math.sin(u * Math.PI)); }
    // calor saindo: fraquinho (meses) ou forte (minutos)
    const aC = PT.ss((t - tC + 0.3) / 0.5); if (aC > 0) { brilhoP(x, 420, 880, 160 + 260 * rapido, LA, (0.1 + 0.5 * rapido) * aC); vapor(x, 420, 560, t, aC * (0.2 + 0.8 * rapido), 3, 160 + 140 * rapido); }
    const aR = PT.ss((t - tM + 0.4) / 0.5); if (aR > 0) relogio(x, 820, 900, 110, (t - tM) * (rapido > 0.5 ? 12 : 0.6), rapido > 0.5 ? VE : CI, aR);
    if (aR > 0) rotuloP(x, rapido > 0.5 ? "MINUTOS" : "MESES", 820, 1060, 40, rapido > 0.5 ? "255,150,160" : "180,230,255", aR);
    if (t > tE - 0.4) termometroP(x, 820, 1120, 220, 0, 100, PT.lerp(25, 75, PT.ss((t - tE + 0.4) / 1)), PT.ss((t - tE + 0.4) / 0.4));
  });
};

// =============== 3. o saquinho: uma pilha em curto ===============
CENAS.saquinho = (el, c, B) => {
  const tM = B("magnesio"), tS = B("sal"), tE = B("eletricidade"), tP = B("pilha"), tC = B("curto"), tCa = B("calor2");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ing", 330, 60, "magnésio + ferro + sal", "pt-ci"], ["pil", 330, 76, "uma pilha em curto", "pt-ve"]]);
  MD.arrive(tl, tx.ing, tS - 0.1, { y: 14 }); MD.leave(tl, tx.ing, tP - 0.35); MD.slam(tl, tx.pil, tP - 0.05, { from: 1.35 });
  const nv = T.nuvem(9000), est = estF(7);
  const PO = (() => { const r = prng(9), o = []; for (let i = 0; i < 8900; i++) { const tipo = r() < 0.6 ? 0 : r() < 0.6 ? 1 : 2; o.push({ x: 240 + r() * 600, y: 720 + r() * 460, tipo, n: r() }); } return o; })();
  T.quadro((x, t) => {
    estD(x, est, t);
    const calor = PT.ss((t - tCa + 0.8) / 1.2), aSa = PT.ss((t - c.ini - 0.3) / 0.5);
    saquinho(x, 540, 950, 1.55, aSa, calor);
    // o pó: magnésio (prata), ferro (escuro), sal (branco), aparecendo na ordem da fala
    let i = nv.k; for (const p of PO) { const vis = p.tipo === 0 ? PT.ss((t - tM + 0.3) / 0.5) : p.tipo === 1 ? PT.ss((t - tM - 2) / 0.5) : PT.ss((t - tS + 0.3) / 0.5); if (vis <= 0) continue; const c0 = p.tipo === 0 ? [0.85, 0.9, 1.0] : p.tipo === 1 ? [0.75, 0.45, 0.3] : [1, 1, 1]; const mix = calor * (p.tipo === 0 ? 1 : 0.4); const cc = [c0[0] + (1 - c0[0]) * mix, c0[1] + (0.55 - c0[1]) * mix, c0[2] + (0.25 - c0[2]) * mix]; nv.ponto(i++, p.x + Math.sin(t * 3 + p.n * 20) * 2 * (1 + 4 * calor), p.y, cc[0], cc[1], cc[2], vis * (0.6 + 0.4 * p.n), p.tipo === 2 ? 5.5 : 4.2); } nv.total(i);
    // a pilha: + e -, com faíscas de curto
    const aP = PT.ss((t - tP + 0.3) / 0.5); if (aP > 0) { fCaixa(x, 540, 1330, 300, 110, 16, AM, aP, 5, 0.08); rotuloP(x, "−   MAGNÉSIO | FERRO   +", 540, 1330, 26, "255,236,170", aP); }
    const aC = PT.ss((t - tC + 0.3) / 0.4); if (aC > 0) { const r = prng(Math.floor(t * 8)); for (let k = 0; k < 6; k++) { const px = 260 + r() * 560, py = 740 + r() * 420; for (let q = 0; q < 4; q++) { const an = r() * 6.283; linhaP(x, px, py, px + Math.cos(an) * 30, py + Math.sin(an) * 30, AM, aC, 3); } } }
    if (aSa > 0) rotuloP(x, "magnésio", 320, 690, 28, "220,230,250", PT.ss((t - tM) / 0.5)); if (t > tS) rotuloP(x, "sal", 760, 690, 28, "255,255,255", PT.ss((t - tS) / 0.5));
  });
};

// =============== 4. quanto esquenta ===============
CENAS.numeros = (el, c, B) => {
  const tC = B("copinho"), tT = B("trinta"), tCi = B("cinquenta"), tCh = B("chama"), tS = B("semeletricidade");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ml", 330, 76, "30 ml de água", "pt-ci"], ["gr", 330, 96, "+50 °C", "pt-la"], ["sem", 330, 62, "sem chama · sem fumaça · sem tomada", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.ml, tT - 0.05, { from: 1.3 }); MD.leave(tl, tx.ml, tCi - 0.35); MD.slam(tl, tx.gr, tCi - 0.05, { from: 1.5 }); MD.leave(tl, tx.gr, tCh - 0.4); MD.slam(tl, tx.sem, tCh - 0.1, { from: 1.25 });
  const est = estF(9);
  T.quadro((x, t) => {
    estD(x, est, t);
    // copinho d'água despejando no saquinho
    const aC = PT.ss((t - c.ini - 0.3) / 0.5), desp = PT.ss((t - tC) / 1.2);
    if (aC > 0) { x.save(); x.translate(330, 760); x.rotate(desp * 1.2); fCaixa(x, 0, 0, 110, 140, 14, CI, aC * (1 - 0.6 * PT.ss((t - tT - 1) / 0.5)), 4, 0.2); x.restore(); for (let k = 0; k < 8; k++) { const u = ((t - tC) * 1.2 + k / 8) % 1; if (desp > 0.3 && t < tT + 1) gota(x, 400 + u * 120, 800 + u * 160, 9, CI, aC * Math.sin(u * Math.PI)); } }
    const calor = PT.ss((t - tT) / (tCi - tT + 1)); saquinho(x, 600, 1060, 1.1, aC, calor); vapor(x, 600, 860, t, calor);
    termometroP(x, 910, 700, 480, 0, 100, PT.lerp(20, 70, calor), aC, [[20, "20 °C"], [70, "70 °C", "255,150,90"]]);
  });
};

// =============== 5. a prima do dia a dia: aquecedor de bolso ===============
CENAS.bolso = (el, c, B) => {
  const tB = B("bolso"), tP = B("pacote"), tF = B("ferro"), tPr = B("proposito"), tA = B("ar");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["aq", 330, 66, "aquecedor de bolso", "pt-la"], ["fe", 330, 62, "ferro enferrujando de propósito", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.aq, tB - 0.05, { from: 1.3 }); MD.leave(tl, tx.aq, tF - 0.35); MD.slam(tl, tx.fe, tF - 0.05, { from: 1.25 });
  const est = estF(11);
  T.quadro((x, t) => {
    estD(x, est, t);
    // mãos segurando o pacotinho
    const aB = PT.ss((t - c.ini - 0.3) / 0.5), abre = PT.ss((t - tP + 0.2) / 0.5), calor = PT.ss((t - tP) / 2.5);
    fCaixa(x, 540, 960, 340, 240, 30, calor > 0.2 ? LA : "200,210,230", aB, 5, 0.06 + 0.2 * calor); brilhoP(x, 540, 960, 300, LA, 0.4 * calor);
    if (abre > 0) { linhaP(x, 400, 820, 680, 820, "255,255,255", (1 - abre) * aB, 4); rotuloP(x, "abriu!", 540, 780, 34, "255,236,170", abre * (1 - PT.ss((t - tF) / 0.5))); }
    for (const s of [-1, 1]) { x.beginPath(); x.ellipse(540 + s * 200, 1060, 90, 130, s * 0.4, 0, 6.283); x.strokeStyle = `rgba(255,210,180,${aB})`; x.lineWidth = 6; x.stroke(); }
    // pó de ferro + ar
    const aF = PT.ss((t - tF + 0.3) / 0.5); if (aF > 0) { const r = prng(4); for (let k = 0; k < 120; k++) discoP(x, 420 + r() * 240, 880 + r() * 160, 3 + r() * 3, r() < calor ? FER : "120,110,110", aF); }
    const aA = PT.ss((t - tA + 0.4) / 0.4); if (aA > 0) for (let k = 0; k < 8; k++) { const u = ((t - tA) * 0.6 + k / 8) % 1; discoP(x, PT.lerp(150, 480, u), 700 + k * 40, 8, CI, aA * Math.sin(u * Math.PI)); }
  });
};

// =============== 6. o cuidado ===============
CENAS.cuidado = (el, c, B) => {
  const tH = B("hidrogenio"), tF = B("facil"), tA = B("aberto"), tL = B("longe"), tB = B("barraca");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["h2", 330, 80, "gás hidrogênio", "pt-ve"], ["ab", 330, 70, "lugar aberto e ventilado", "pt-ci", "white-space:normal;left:60px;width:960px"], ["nad", 330, 62, "nada de carro ou barraca", "pt-ve"]]);
  MD.slam(tl, tx.h2, tH - 0.05, { from: 1.35 }); MD.leave(tl, tx.h2, tA - 0.35); MD.slam(tl, tx.ab, tA - 0.05, { from: 1.25 }); MD.leave(tl, tx.ab, tB - 0.7); MD.slam(tl, tx.nad, tB - 0.5, { from: 1.3 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    saquinho(x, 540, 1120, 1, 1, 0.7);
    // bolhas de hidrogênio subindo
    const aH = PT.ss((t - tH + 0.4) / 0.5); if (aH > 0) for (let k = 0; k < 24; k++) { const u = ((t - tH) * 0.35 + k / 24) % 1, px = 480 + (k % 6) * 24 + Math.sin(u * 8 + k) * 20, py = 920 - u * 420; anelP(x, px, py, 12 + 8 * u, "200,230,255", aH * Math.sin(u * Math.PI), 3); if (k % 6 === 0) rotuloP(x, "H2", px, py, 18, "220,240,255", aH * Math.sin(u * Math.PI)); }
    // chama riscada
    const aF = PT.ss((t - tF + 0.3) / 0.4) * (1 - PT.ss((t - tA + 0.4) / 0.4)); if (aF > 0) { x.beginPath(); x.moveTo(860, 760); x.quadraticCurveTo(920, 840, 860, 900); x.quadraticCurveTo(800, 840, 860, 760); x.fillStyle = `rgba(${LA},${0.4 * aF})`; x.fill(); x.strokeStyle = `rgba(${LA},${aF})`; x.lineWidth = 5; x.stroke(); brilhoP(x, 860, 840, 120, LA, 0.4 * aF); linhaP(x, 780, 760, 940, 920, VE, aF, 8); }
    // vento de lugar aberto
    const aA = PT.ss((t - tA + 0.3) / 0.5) * (1 - PT.ss((t - tB + 0.6) / 0.4)); if (aA > 0) for (let k = 0; k < 4; k++) { const u = ((t - tA) * 0.7 + k / 4) % 1; fSeta(x, 100 + u * 300, 700 + k * 80, 260 + u * 300, 700 + k * 80, "220,230,255", aA * Math.sin(u * Math.PI), 5); }
    // carro e barraca riscados
    const aB = PT.ss((t - tB + 0.5) / 0.4); if (aB > 0) { fCaixa(x, 260, 800, 260, 110, 30, BRC, aB, 5, 0.05); anelP(x, 190, 860, 26, BRC, aB, 5); anelP(x, 330, 860, 26, BRC, aB, 5); linhaP(x, 120, 720, 400, 900, VE, aB, 8); x.beginPath(); x.moveTo(680, 900); x.lineTo(820, 700); x.lineTo(960, 900); x.closePath(); x.strokeStyle = `rgba(${BRC},${aB})`; x.lineWidth = 5; x.stroke(); linhaP(x, 660, 700, 980, 920, VE, aB, 8); }
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["toda ferrugem solta calor", "magnésio enferruja em minutos", "o sal faz uma pilha em curto", "hidrogênio: lugar aberto"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    saquinho(x, 540, 1240, 0.6, 0.7 * sai, 0.8); vapor(x, 540, 1130, t, 0.7 * sai, 3, 120);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [FER, MG, AM, CI][k], a); brilhoP(x, 160, Y[k], 50, "255,220,200", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
