// Cenas do vídeo "Como o fone com cancelamento de ruído apaga o som" — pontos de luz na GPU.
// Retenção: paradoxo no gancho (para criar silêncio, toca MAIS som), promessa (por que a voz passa),
// a onda e a anti-onda se apagando (imagem forte), corrida contra o tempo e dica prática.

const MD = MotionDirector;
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.5);

// onda senoidal em pontos (2D); fase em radianos, amp em px
function ondaP(x, x0, x1, cy, amp, k, fase, cor, a, lw = 5, n = 160) { if (a <= 0.01) return; x.beginPath(); for (let q = 0; q <= n; q++) { const u = q / n, px = x0 + (x1 - x0) * u, py = cy + Math.sin(u * k + fase) * amp; q ? x.lineTo(px, py) : x.moveTo(px, py); } x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = lw; x.lineJoin = "round"; x.stroke(); }
function fone(x, cx, cy, s, a, ligado = 0) { if (a <= 0.01) return; x.beginPath(); x.arc(cx, cy, 230 * s, Math.PI * 1.05, Math.PI * 1.95); x.strokeStyle = `rgba(${BRC},${a})`; x.lineWidth = 18 * s; x.stroke(); for (const sx of [-1, 1]) { fCaixa(x, cx + sx * 220 * s, cy + 40 * s, 120 * s, 200 * s, 50 * s, ligado > 0.5 ? CI : BRC, a, 6 * s, 0.1 + 0.15 * ligado); if (ligado > 0) brilhoP(x, cx + sx * 220 * s, cy + 40 * s, 150 * s, CI, 0.3 * ligado * a); } }
function aviao(x, cx, cy, s, a) { if (a <= 0.01) return; fRR(x, cx - 260 * s, cy - 40 * s, 520 * s, 80 * s, 40 * s); x.strokeStyle = `rgba(${BRC},${a})`; x.lineWidth = 5; x.stroke(); x.beginPath(); x.moveTo(cx - 40 * s, cy); x.lineTo(cx - 140 * s, cy + 170 * s); x.lineTo(cx + 20 * s, cy + 170 * s); x.lineTo(cx + 60 * s, cy); x.stroke(); x.beginPath(); x.moveTo(cx - 200 * s, cy - 30 * s); x.lineTo(cx - 260 * s, cy - 130 * s); x.lineTo(cx - 190 * s, cy - 130 * s); x.lineTo(cx - 150 * s, cy - 35 * s); x.stroke(); for (let k = 0; k < 8; k++) discoP(x, cx - 120 * s + k * 40 * s, cy - 10 * s, 7 * s, CI, 0.6 * a); }
function espectroR(x, cx, cy, w, h, corte, a, rot) { if (a <= 0.01) return; const n = 14; for (let k = 0; k < n; k++) { const u = k / (n - 1), v = 0.55 + 0.3 * Math.sin(u * 5 + 1), g = u < 0.5; const bh = h * v * (g ? 1 - corte : 1 - 0.3 * corte); fCaixa(x, cx - w / 2 + (k + 0.5) * w / n, cy - bh / 2, w / n * 0.7, Math.max(4, bh), 4, g ? LA : CI, a, 2, 0.5); } rotuloP(x, rot, cx, cy + 40, 30, "255,255,255", 0.85 * a); rotuloP(x, "graves", cx - w / 2, cy + 80, 24, "255,190,140", 0.8 * a, "left"); rotuloP(x, "agudos", cx + w / 2, cy + 80, 24, "200,220,255", 0.8 * a, "right"); }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tM = B("maissom"), tA = B("apaga"), tB = B("botao"), tS = B("some"), tP = B("promessa");
  mostrarGancho(tA - 0.2);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["sum", 330, 76, "o barulho some", "pt-ci"], ["lad", 330, 62, "e a voz de quem está do lado?", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.sum, tS - 0.05, { from: 1.3 }); MD.leave(tl, tx.sum, tP - 2.0); MD.slam(tl, tx.lad, tP - 1.7, { from: 1.25 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // quadro 0: barulho + anti-barulho = silêncio (o "plano do trailer")
    const a0 = 1 - PT.ss((t - tB + 0.8) / 0.5);
    if (a0 > 0.01) {
      const am = 70, ff = 16, fs = t * 7, aI = PT.ss((t - 0.3) / 0.5), aZ = PT.ss((t - tM + 0.6) / 0.6);
      ondaP(x, 120, 960, 700, am, ff, fs, VE, a0, 7); rotuloP(x, "barulho", 120, 610, 34, "255,170,180", a0, "left");
      rotuloP(x, "+", 540, 805, 60, "220,228,245", a0 * aI);
      ondaP(x, 120, 960, 910, am, ff, fs + Math.PI, CI, a0 * aI, 7); rotuloP(x, "som do fone (ao contrário)", 120, 1010, 34, "180,235,255", a0 * aI, "left");
      rotuloP(x, "=", 540, 1080, 60, "220,228,245", a0 * aZ);
      ondaP(x, 120, 960, 1190, am * (1 - aZ) * 0.9, ff, fs, VD, a0 * aZ, 7); brilhoP(x, 540, 1190, 300, VD, 0.25 * a0 * aZ); rotuloP(x, "silêncio", 540, 1280, 40, "150,255,200", a0 * aZ);
    }
    // o avião e o fone
    const aS = PT.ss((t - tB + 0.6) / 0.5);
    if (aS > 0.01) {
      aviao(x, 540, 700, 0.9, 0.8 * aS);
      const lig = PT.ss((t - tB) / 0.3), some = PT.ss((t - tS + 0.4) / 0.8);
      for (let k = 0; k < 3; k++) ondaP(x, 80, 1000, 800 + k * 40, 26 * (1 - 0.85 * some), 18 + k * 4, t * (8 + k), VE, 0.6 * (1 - 0.6 * some) * aS, 4);
      fone(x, 540, 1100, 1.1, aS, lig);
      ondaP(x, 300, 780, 1130, 30, 14, t * 8 + Math.PI, CI, lig * (1 - PT.ss((t - tP + 1) / 0.6)), 5);
      if (lig > 0) { discoP(x, 540 + 220 * 1.1 + 50, 1160, 10, VD, lig); rotuloP(x, "ANC", 540 + 220 * 1.1 + 50, 1210, 26, "150,255,200", lig); }
    }
  });
};

// =============== 2. o som é uma onda ===============
CENAS.onda = (el, c, B) => {
  const tE = B("empurrado"), tC = B("corda"), tD = B("desce"), tA = B("apertado"), tT = B("timpano");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["som", 330, 76, "som = ar vibrando", "pt-ci"], ["cor", 330, 64, "uma corda balançando", "pt-am"]]);
  MD.slam(tl, tx.som, tE - 0.05, { from: 1.25 }); MD.leave(tl, tx.som, tC - 0.3); MD.slam(tl, tx.cor, tC - 0.05, { from: 1.25 });
  const nv = T.nuvem(6100), est = estF(5);
  T.quadro((x, t) => {
    estD(x, est, t);
    // ar: pontos que se apertam e se soltam (ondas de compressão)
    let i = nv.k; const r = prng(7); for (let k = 0; k < 6000; k++) { const x0 = 80 + r() * 920, y0 = 580 + r() * 260, d = Math.sin(x0 * 0.03 - t * 5) * 18; nv.ponto(i++, x0 + d, y0, 0.6, 0.85, 1.0, 0.4 + 0.5 * Math.max(0, Math.cos(x0 * 0.03 - t * 5)), 3.4); } nv.total(i);
    rotuloP(x, "ar", 80, 560, 30, "200,230,255", 0.8, "left");
    // corda (onda) com cristas e vales
    const aC = PT.ss((t - tC + 0.3) / 0.5); ondaP(x, 80, 1000, 1060, 110, 12, -t * 5, AM, aC, 7);
    const aA = PT.ss((t - tA + 0.3) / 0.5); if (aA > 0) { rotuloP(x, "ar apertado", 260, 920, 30, "255,226,140", aA); rotuloP(x, "ar solto", 520, 1210, 30, "255,226,140", aA); }
    // tímpano
    const aT = PT.ss((t - tT + 0.4) / 0.5); if (aT > 0) { const v = Math.sin(t * 30) * 8; x.beginPath(); x.ellipse(1010 + v, 1060, 14, 90, 0, 0, 6.283); x.strokeStyle = `rgba(255,200,180,${aT})`; x.lineWidth = 6; x.stroke(); rotuloP(x, "tímpano", 990, 1190, 28, "255,210,190", aT, "right"); }
  });
};

// =============== 3. a onda ao contrário ===============
CENAS.anti = (el, c, B) => {
  const tC = B("contrario"), tS = B("sobe"), tCa = B("cancela"), tSi = B("silencio"), tL = B("lueg"), tR = B("rapida");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["con", 330, 66, "onda + onda ao contrário", "pt-ci"], ["sil", 330, 100, "= silêncio", "pt-am"], ["lue", 330, 60, "Paul Lueg, anos 1930", "pt-ci"], ["len", 420, 50, "eletrônica lenta demais", "pt-fino"]]);
  MD.arrive(tl, tx.con, tC - 0.1, { y: 14 }); MD.leave(tl, tx.con, tSi - 0.35); MD.slam(tl, tx.sil, tSi - 0.05, { from: 1.5 }); MD.leave(tl, tx.sil, tL - 0.4); MD.arrive(tl, tx.lue, tL - 0.1, { y: 14 }); MD.arrive(tl, tx.len, tR - 0.2, { y: 14 });
  const est = estF(7);
  T.quadro((x, t) => {
    estD(x, est, t);
    const f = -t * 4, aN = PT.ss((t - c.ini - 0.3) / 0.5), aI = PT.ss((t - tC + 0.3) / 0.5), junta = PT.inOut((t - tCa + 0.2) / 1.2);
    // barulho (vermelho) e anti-onda (ciano), que descem e se juntam
    const y1 = PT.lerp(720, 1000, junta), y2 = PT.lerp(1280, 1000, junta);
    ondaP(x, 100, 980, y1, 90 * (1 - junta * 0.999), 14, f, VE, aN * (1 - junta), 6); ondaP(x, 100, 980, y2, 90 * (1 - junta * 0.999), 14, f + Math.PI, CI, aI * (1 - junta), 6);
    if (aN > 0 && junta < 0.5) rotuloP(x, "barulho", 100, y1 - 120, 30, "255,160,170", aN * (1 - 2 * junta), "left"); if (aI > 0 && junta < 0.5) rotuloP(x, "anti-onda", 100, y2 + 120, 30, "180,235,255", aI * (1 - 2 * junta), "left");
    // setas: quando uma sobe, a outra desce
    const aS = PT.jan(t, tS - 0.3, tCa, 0.3, 0.4); if (aS > 0) { fSeta(x, 540, 760, 540, 640, VE, aS, 6); fSeta(x, 540, 1240, 540, 1360, CI, aS, 6); }
    // a soma: linha quase reta
    if (junta > 0) { ondaP(x, 100, 980, 1000, 4, 14, f, "255,255,255", junta, 5); brilhoP(x, 540, 1000, 300, "255,255,255", 0.15 * junta); }
    // patente antiga
    const aL = PT.ss((t - tL + 0.3) / 0.5); if (aL > 0) { fCaixa(x, 820, 1250, 260, 170, 10, "230,215,180", aL * (1 - junta * 0.3), 4, 0.08); rotuloP(x, "PATENTE", 820, 1220, 30, "240,225,190", aL); rotuloP(x, "1936", 820, 1270, 34, "240,225,190", aL); }
  });
};

// =============== 4. dentro do fone ===============
CENAS.fone = (el, c, B) => {
  const tM = B("microfones"), tC = B("chip"), tA = B("antionda"), tMi = B("milesimo"), tAt = B("atrasar"), tF = B("falha");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ms", 330, 76, "< 1 milésimo de segundo", "pt-am"], ["atr", 330, 72, "atrasou? falhou", "pt-ve"]]);
  MD.slam(tl, tx.ms, tMi - 0.05, { from: 1.3 }); MD.leave(tl, tx.ms, tAt - 0.35); MD.slam(tl, tx.atr, tAt - 0.05, { from: 1.3 });
  const est = estF(9);
  T.quadro((x, t) => {
    estD(x, est, t);
    // corte do fone: concha, microfone fora, chip, alto-falante dentro, ouvido
    const aF = PT.ss((t - c.ini - 0.3) / 0.5);
    fCaixa(x, 540, 900, 520, 520, 120, BRC, aF, 6, 0.04);
    const aM = PT.ss((t - tM + 0.3) / 0.4); if (aM > 0) { [[300, 720], [300, 1080]].forEach(([px, py]) => { fCaixa(x, px, py, 50, 80, 25, CI, aM, 4, 0.3); }); rotuloP(x, "microfones", 300, 640, 28, "180,235,255", aM); }
    const aC = PT.ss((t - tC + 0.3) / 0.4); if (aC > 0) { fCaixa(x, 520, 900, 140, 140, 14, AM, aC, 5, 0.15); for (let k = 0; k < 4; k++) { linhaP(x, 450 + k * 46, 820, 450 + k * 46, 800, AM, aC, 4); linhaP(x, 450 + k * 46, 980, 450 + k * 46, 1000, AM, aC, 4); } rotuloP(x, "CHIP", 520, 900, 32, "255,236,170", aC); }
    const aA = PT.ss((t - tA + 0.3) / 0.4); if (aA > 0) { x.beginPath(); x.moveTo(720, 760); x.lineTo(760, 760); x.lineTo(820, 700); x.lineTo(820, 1100); x.lineTo(760, 1040); x.lineTo(720, 1040); x.closePath(); x.strokeStyle = `rgba(${VD},${aA})`; x.lineWidth = 5; x.stroke(); rotuloP(x, "alto-falante", 770, 1150, 28, "150,255,200", aA); }
    // sinais: barulho entra → chip → anti-onda sai
    ondaP(x, 60, 280, 900, 30, 10, -t * 9, VE, aF, 4);
    if (aM > 0) ondaP(x, 330, 450, 900, 20, 6, -t * 9, VE, aM, 3);
    const atraso = PT.ss((t - tAt) / 0.5) * (1 - PT.ss((t - tF - 0.8) / 0.6));
    if (aA > 0) { ondaP(x, 590, 720, 900, 20, 6, -t * 9 + Math.PI, CI, aA, 3); ondaP(x, 830, 1040, 900, 30 * atraso + 2, 10, -t * 9 + Math.PI * (1 - atraso * 0.6), atraso > 0.3 ? VE : "255,255,255", aA, 4); rotuloP(x, atraso > 0.3 ? "não encaixa" : "silêncio", 935, 990, 28, atraso > 0.3 ? "255,160,170" : "255,255,255", aA); }
    // cronômetro
    const aMi = PT.ss((t - tMi + 0.3) / 0.4); if (aMi > 0) { anelP(x, 540, 1300, 70, AM, aMi, 6); const an = -Math.PI / 2 + (t - tMi) * 20; linhaP(x, 540, 1300, 540 + Math.cos(an) * 55, 1300 + Math.sin(an) * 55, AM, aMi, 5); }
  });
};

// =============== 5. por que a voz passa ===============
CENAS.voz = (el, c, B) => {
  const tG = B("graves"), tM = B("motor"), tP = B("prever"), tA = B("agudo"), tE = B("espuma"), tC = B("conversa");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["gr", 330, 66, "graves constantes: apaga", "pt-ci", "white-space:normal;left:60px;width:960px"], ["ag", 330, 66, "voz e agudos: passam", "pt-ve"], ["dic", 330, 56, "ótimo contra ar-condicionado e trânsito", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.gr, tG - 0.05, { from: 1.25 }); MD.leave(tl, tx.gr, tA - 0.35); MD.slam(tl, tx.ag, tA - 0.05, { from: 1.25 }); MD.leave(tl, tx.ag, tC - 2.0); MD.slam(tl, tx.dic, tC - 1.7, { from: 1.2 });
  const est = estF(11);
  T.quadro((x, t) => {
    estD(x, est, t);
    // motor: onda grave e regular; voz: onda irregular e aguda
    const aG = PT.ss((t - tG + 0.3) / 0.5); ondaP(x, 100, 980, 640, 60, 8, -t * 4, LA, aG, 6); if (aG > 0) rotuloP(x, "ronco do motor (previsível)", 100, 560, 28, "255,200,160", aG, "left");
    const aA = PT.ss((t - tA + 0.3) / 0.5); if (aA > 0) { x.beginPath(); for (let k = 0; k <= 240; k++) { const u = k / 240, y = 880 + Math.sin(u * 70 + t * 14) * 30 * (0.4 + 0.6 * Math.abs(Math.sin(u * 7 + t * 2))) + Math.sin(u * 150 + t * 30) * 10; k ? x.lineTo(100 + u * 880, y) : x.moveTo(100 + u * 880, y); } x.strokeStyle = `rgba(${CI},${aA})`; x.lineWidth = 4; x.stroke(); rotuloP(x, "voz (muda o tempo todo)", 100, 800, 28, "180,235,255", aA, "left"); }
    // espectro com o cancelamento ligado
    const aE = PT.ss((t - tP + 0.4) / 0.5); espectroR(x, 540, 1180, 700, 180, PT.ss((t - tP) / 1), aE, "com cancelamento ligado");
    const aEs = PT.ss((t - tE + 0.3) / 0.5); if (aEs > 0) { brilhoP(x, 800, 1130, 180, CI, 0.3 * aEs); rotuloP(x, "a espuma ajuda aqui", 800, 1010, 28, "180,235,255", aEs); }
  });
};

// =============== 6. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["som é uma onda", "onda ao contrário cancela", "o fone calcula em tempo real", "vence os graves, não a voz"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    fone(x, 540, 1230, 0.6, 0.7 * sai, 1);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [VE, CI, AM, LA][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
