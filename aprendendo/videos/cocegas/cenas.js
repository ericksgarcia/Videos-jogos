// Cenas do vídeo "Por que você não consegue fazer cócegas em si mesmo" — pontos de luz na GPU.
// Retenção do começo ao fim: fato chocante no 1º segundo (o cérebro abaixa o volume do seu toque),
// promessa com lacuna real (o tipo de cócegas que você consegue fazer em si mesmo, testado no fim),
// spoiler do cérebro, robô (pergunta "adivinha?") e o teste do lábio pago só na penúltima cena.
// Troca de plano a cada 5–8 s em todas as cenas.

const MD = MotionDirector;
const estF = (seed) => ambienteP(240, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "220,200,255", 0.6);
const PELE = "255,190,160", CI = "143,227,255", AM = "255,210,63", RO = "255,110,150", VDC = "120,255,190", BRC = "220,228,245";
// janela de um plano: entra em a, sai em b (com fade)
const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);

// mão estilizada (palma + dedos), ang em radianos, s = escala
function mao(x, cx, cy, s, ang, cor, a) {
  if (a <= 0.01) return; x.save(); x.translate(cx, cy); x.rotate(ang);
  x.beginPath(); x.ellipse(0, 0, 60 * s, 70 * s, 0, 0, 6.283); x.fillStyle = `rgba(${cor},${0.18 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 5 * s; x.stroke();
  [[-36, -60, -46, -150], [-12, -68, -14, -175], [12, -68, 16, -170], [34, -58, 44, -140], [55, 10, 120, -40]].forEach(([x0, y0, x1, y1]) => { x.beginPath(); x.moveTo(x0 * s, y0 * s); x.lineTo(x1 * s, y1 * s); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 20 * s; x.lineCap = "round"; x.stroke(); });
  x.restore();
}
// sola do pé (vertical)
function pe(x, cx, cy, s, cor, a, treme = 0, t = 0) {
  if (a <= 0.01) return; const jx = treme * Math.sin(t * 40) * 10, jy = treme * Math.cos(t * 33) * 8;
  x.beginPath(); x.ellipse(cx + jx, cy + jy, 130 * s, 260 * s, 0, 0, 6.283); x.fillStyle = `rgba(${cor},${0.18 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 6; x.stroke();
  [[-80, -255, 44], [-20, -290, 34], [30, -285, 30], [72, -265, 26], [105, -235, 22]].forEach(([dx, dy, r]) => { discoP(x, cx + jx + dx * s, cy + jy + dy * s, r * s, cor, 0.35 * a); anelP(x, cx + jx + dx * s, cy + jy + dy * s, r * s, cor, a, 4); });
}
// faíscas de cócegas
function faisca(x, cx, cy, t, a, n = 12, R = 120) { if (a <= 0.01) return; for (let k = 0; k < n; k++) { const ang = k / n * 6.283 + t * 2, r1 = R * (0.4 + 0.3 * Math.sin(t * 9 + k)), r2 = r1 + 40; linhaP(x, cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1, cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2, k % 2 ? AM : RO, a, 5); } }
// medidor (barras)
function medidor(x, cx, cy, v, a, rot = "CÓCEGAS") { if (a <= 0.01) return; for (let k = 0; k < 10; k++) { const on = k < Math.round(v * 10), cor = k < 4 ? "120,255,190" : k < 7 ? "255,210,63" : "255,110,130"; fCaixa(x, cx - 225 + k * 50, cy, 38, 60, 8, on ? cor : "120,128,150", a * (on ? 1 : 0.3), 3, on ? 0.6 : 0.05); } rotuloP(x, rot, cx, cy - 62, 30, "255,255,255", 0.85 * a); }
// pulsos andando num caminho (sinal nervoso)
function pulso(x, pts, t, vel, cor, a, n = 4) { if (a <= 0.01) return; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((p) => x.lineTo(p[0], p[1])); x.strokeStyle = `rgba(${cor},${0.25 * a})`; x.lineWidth = 4; x.stroke(); let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; } for (let q = 0; q < n; q++) { let s = ((t * vel + q / n) % 1) * L, i = 0; while (i < seg.length - 1 && s > seg[i]) { s -= seg[i]; i++; } const u = s / seg[i], px = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, py = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u; brilhoP(x, px, py, 40, cor, 0.7 * a); discoP(x, px, py, 8, "255,255,255", a); } }
// pena (haste curva + barbas)
function penaC(x, cx, cy, s, ang, a, cor = "235,240,255") {
  if (a <= 0.01) return; x.save(); x.translate(cx, cy); x.rotate(ang);
  x.beginPath(); x.moveTo(0, 0); x.quadraticCurveTo(40 * s, -150 * s, 20 * s, -300 * s); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 5 * s; x.stroke();
  for (let k = 1; k < 18; k++) { const u = k / 18, px = 40 * s * 2 * u * (1 - u) + 20 * s * u * u, py = -300 * s * u, L = 70 * s * Math.sin(u * Math.PI) + 10 * s; for (const sd of [-1, 1]) linhaP(x, px, py, px + sd * L, py - 30 * s, cor, 0.7 * a, 3 * s); }
  brilhoP(x, 20 * s, -150 * s, 160 * s, cor, 0.25 * a); x.restore();
}
// antebraço (faixa arredondada) com arrepios
function bracoC(x, cx, cy, w, h, a, arrepio, t) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, w, h, h / 2, PELE, a, 5, 0.12);
  if (arrepio > 0) { const r = prng(41); for (let k = 0; k < 70; k++) { const px = cx - w / 2 + 30 + r() * (w - 60), py = cy - h / 2 + 20 + r() * (h - 40), on = PT.ss((arrepio * 1.4 - r()) / 0.3); discoP(x, px, py, 4 + 2 * Math.sin(t * 6 + k), "255,235,220", a * on * 0.9); } }
}
// lábios de perfil frontal
function labiosC(x, cx, cy, s, a) {
  if (a <= 0.01) return;
  x.beginPath(); x.moveTo(cx - 260 * s, cy); x.bezierCurveTo(cx - 150 * s, cy - 90 * s, cx - 60 * s, cy - 110 * s, cx, cy - 60 * s); x.bezierCurveTo(cx + 60 * s, cy - 110 * s, cx + 150 * s, cy - 90 * s, cx + 260 * s, cy);
  x.bezierCurveTo(cx + 150 * s, cy + 140 * s, cx - 150 * s, cy + 140 * s, cx - 260 * s, cy); x.fillStyle = `rgba(255,140,170,${0.16 * a})`; x.fill(); x.strokeStyle = `rgba(255,170,190,${a})`; x.lineWidth = 7 * s; x.stroke();
  x.beginPath(); x.moveTo(cx - 250 * s, cy); x.bezierCurveTo(cx - 100 * s, cy + 25 * s, cx + 100 * s, cy + 25 * s, cx + 250 * s, cy); x.strokeStyle = `rgba(255,170,190,${0.7 * a})`; x.lineWidth = 5 * s; x.stroke();
}
// tela de cinema com "SPOILER"
function cinemaC(x, cx, cy, a, carimbo, t) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 760, 440, 18, BRC, a, 6, 0.08);
  x.beginPath(); x.moveTo(cx - 50, cy - 70); x.lineTo(cx + 80, cy); x.lineTo(cx - 50, cy + 70); x.closePath(); x.fillStyle = `rgba(${BRC},${0.5 * a * (1 - carimbo)})`; x.fill();
  for (let k = 0; k < 6; k++) fCaixa(x, cx - 330 + k * 132, cy + 300, 90, 120, 14, "150,160,200", a * 0.6, 3, 0.05);
  if (carimbo > 0) { x.save(); x.translate(cx, cy); x.rotate(-0.18); const e = 1 + 0.6 * (1 - PT.out(carimbo)); x.scale(e, e); fCaixa(x, 0, 0, 520, 130, 12, "255,90,110", a * carimbo, 9, 0.15); rotuloP(x, "SPOILER", 0, 4, 84, "255,120,140", a * carimbo); x.restore(); }
}

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tV = B("volume0"), tP = B("pe"), tN = B("nada"), tT = B("tipo"), tM = B("mesmo"), tPr = B("promessa");
  const p2 = tV + 0.35, p3 = tP - 2.6, p4 = tT - 0.5;  // trocas de plano
  mostrarGancho(p2 - 0.1);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["nin", 330, 70, "quase ninguém consegue", "pt-ci"], ["nada", 330, 86, "nada, né?", "pt-ve"], ["tipo", 330, 70, "mas 1 tipo funciona", "pt-am"], ["tes", 330, 62, "você vai testar no final", "pt-ci"]]);
  MD.slam(tl, tx.nin, p2 + 0.1, { from: 1.3 }); MD.leave(tl, tx.nin, p3 - 0.2);
  MD.slam(tl, tx.nada, tN - 0.05, { from: 1.4 }); MD.leave(tl, tx.nada, p4);
  MD.slam(tl, tx.tipo, tT - 0.1, { from: 1.3 }); MD.leave(tl, tx.tipo, tPr - 2.0); MD.slam(tl, tx.tes, tPr - 1.7, { from: 1.25 });
  const nv = T.nuvem(9100), est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano 1 (quadro 0): o cérebro brilhando e o "volume" do próprio toque caindo
    const a1 = 1 - PT.ss((t - p2) / 0.4), vol = 1 - 0.85 * PT.ss((t - tV + 1.2) / 1.2);
    if (a1 > 0.01) {
      brilhoP(x, 500, 880, 420, "255,140,200", 0.3 * a1 * (0.8 + 0.2 * Math.sin(t * 2)));
      fCerebro(nv, 500, 880, PT.lerp(330, 300, PT.ss(t / 3)), a1, { cerebelo: 0.3 + 0.6 * (1 - vol), cor: [1.0, 0.72, 0.88] });
      for (let k = 0; k < 14; k++) { const r = prng(k + 3), an = r() * 6.283, d = ((t * 0.4 + r()) % 1); discoP(x, 500 + Math.cos(an) * (80 + d * 260), 880 + Math.sin(an) * (60 + d * 200), 5, "255,200,230", a1 * (1 - d) * vol); }
      for (let k = 0; k < 10; k++) { const on = k / 10 < vol; fCaixa(x, 940, 1180 - k * 46, 70, 34, 6, k > 6 ? RO : k > 3 ? AM : VDC, a1 * (on ? 1 : 0.18), 3, on ? 0.5 : 0.05); }
      rotuloP(x, "volume", 940, 1250, 30, "220,228,245", a1); mao(x, 300 + Math.sin(t * 3) * 30, 1290, 0.7, -0.3, CI, a1);
    } else nv.total(nv.k);
    // plano 2: uma multidão — ninguém sente nada com a própria mão
    const a2 = planoC(t, p2, p3, 0.4, 0.4);
    if (a2 > 0.01) for (let k = 0; k < 12; k++) { const col = k % 4, lin = Math.floor(k / 4), px = 200 + col * 230, py = 760 + lin * 230, ent = PT.ss((t - p2 - k * 0.08) / 0.3); fPessoa(x, px, py, 1.5, k === 5 ? AM : CI, a2 * ent * 0.85); mao(x, px + 45, py + 10 + Math.sin(t * 6 + k) * 8, 0.3, -0.5, CI, a2 * ent * 0.7); }
    // plano 3: a sola do pé e a sua própria mão — nada
    const a3 = planoC(t, p3, p4, 0.4, 0.4);
    if (a3 > 0.01) { pe(x, 540, 960, 1.25, PELE, a3, 0, t); mao(x, 700 + Math.sin(t * 7) * 40, 1050, 0.8, -0.6, CI, a3 * PT.ss((t - p3 - 0.5) / 0.4)); const aN = PT.ss((t - tN + 0.1) / 0.3); if (aN > 0) rotuloP(x, "...", 820, 760, 100, "200,210,230", aN * a3); }
    // plano 4: a pena e o "?" — existe um tipo que funciona
    const a4 = PT.ss((t - p4) / 0.5);
    if (a4 > 0.01) { penaC(x, 560 + Math.sin(t * 1.5) * 40, 1220, 1.4, -0.4 + Math.sin(t * 1.2) * 0.12, a4); rotuloP(x, "?", 820, 760, 150, AM, a4 * PT.ss((t - tM + 0.3) / 0.4) * (0.85 + 0.15 * Math.sin(t * 4))); }
  });
};

// =============== 2. o spoiler do cérebro ===============
CENAS.previsao = (el, c, B) => {
  const tMa = B("mao"), tC = B("copia"), tCe = B("cerebelo"), tA = B("agora"), tV = B("volume"), tS = B("spoiler"), tE = B("enganar");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ord", 330, 62, "ordem → músculos", "pt-ci"], ["cop", 420, 56, "cópia → cerebelo", "pt-am"], ["pre", 330, 66, "previsão: toque aqui", "pt-ci"], ["vol", 330, 76, "volume abaixado", "pt-ve"], ["spo", 330, 70, "sem surpresa, sem graça", "pt-am"], ["eng", 330, 76, "dá pra enganar?", "pt-ci"]]);
  MD.arrive(tl, tx.ord, tMa - 0.1, { y: 14 }); MD.arrive(tl, tx.cop, tC - 0.1, { y: 14 }); MD.leave(tl, [tx.ord, tx.cop], tA - 1.4);
  MD.slam(tl, tx.pre, tA - 1.1, { from: 1.25 }); MD.leave(tl, tx.pre, tV - 0.35); MD.slam(tl, tx.vol, tV - 0.05, { from: 1.3 }); MD.leave(tl, tx.vol, tS - 0.4);
  MD.slam(tl, tx.spo, tS + 0.3, { from: 1.25 }); MD.leave(tl, tx.spo, tE - 1.6); MD.slam(tl, tx.eng, tE - 1.3, { from: 1.3 });
  const nv = T.nuvem(9100), est = estF(5);
  const pB = tA - 1.4, pC = tS - 0.5, pD = tE - 1.6;   // trocas de plano
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o cérebro manda a ordem e a cópia (câmera vai chegando perto)
    const aA = 1 - PT.ss((t - pB) / 0.4);
    const z = PT.lerp(1.0, 1.15, PT.ss((t - c.ini) / (pB - c.ini))), CX = 520, CY = 700, E = 280 * z;
    const cereb = [CX - 0.55 * E, CY + 0.52 * E];
    if (aA > 0.01) {
      const aCe = PT.ss((t - tCe + 0.3) / 0.6); fCerebro(nv, CX, CY, E, aA, { cerebelo: aCe });
      if (aCe > 0) { brilhoP(x, cereb[0], cereb[1], 120, "80,220,255", 0.5 * aCe * aA); rotuloP(x, "CEREBELO", cereb[0] - 20, cereb[1] + 95, 32, "150,235,255", aCe * aA); }
      pulso(x, [[CX + 40, CY + 60], [CX + 120, CY + 250], [760, 1120]], t, 0.5, AM, PT.ss((t - tMa + 0.2) / 0.5) * aA);
      pulso(x, [[CX + 20, CY + 40], [CX - 60, CY + 120], cereb], t, 0.6, CI, PT.ss((t - tC + 0.2) / 0.5) * aA, 3);
      mao(x, 800, 1150, 0.9, -0.3, PELE, PT.ss((t - c.ini - 0.3) / 0.5) * aA);
    } else if (t < pD) nv.total(nv.k);
    // plano B: close na mão encostando no braço — previsão e volume caindo
    const aB = planoC(t, pB, pC, 0.4, 0.4);
    if (aB > 0.01) {
      bracoC(x, 540, 1000, 820, 200, aB, 0, t); const enc = PT.ss((t - tA + 0.6) / 0.6); mao(x, PT.lerp(820, 640, enc), PT.lerp(700, 860, enc), 1.0, 0.3, CI, aB);
      x.setLineDash([10, 10]); anelP(x, 620, 1000, 90 + 8 * Math.sin(t * 4), CI, aB * PT.ss((t - pB - 0.3) / 0.4), 5); x.setLineDash([]);
      medidor(x, 540, 1320, PT.lerp(0.9, 0.15, PT.ss((t - tV + 0.6) / 0.8)), aB, "INTENSIDADE DO TOQUE");
    }
    // plano C: o spoiler do filme
    cinemaC(x, 540, 960, planoC(t, pC, pD, 0.4, 0.4), PT.ss((t - tS) / 0.35), t);
    // plano D: dá pra enganar? (cérebro pequeno + engrenagem do relógio)
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { fCerebro(nv, 540, 940, 260, aD, { cerebelo: 0.5 + 0.5 * Math.sin(t * 5) }); rotuloP(x, "?", 820, 760, 150, AM, aD * (0.85 + 0.15 * Math.sin(t * 4))); }
  });
};

// =============== 3. enganando o cérebro: o robô ===============
CENAS.robo = (el, c, B) => {
  const tR = B("robo"), tA = B("alavanca"), tE = B("escova"), tS = B("sematraso"), tAd = B("adivinha"), tD = B("decimos"), tV = B("voltaram"), tEr = B("errava"), tPm = B("prometi");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["rob", 330, 72, "um robô de cócegas", "pt-ci"], ["sem", 330, 70, "sem atraso: nada", "pt-ci"], ["adv", 330, 92, "adivinha?", "pt-am"], ["at", 330, 86, "atraso: 0,2 s", "pt-am"], ["vol", 330, 76, "as cócegas voltaram!", "pt-ve"], ["err", 330, 62, "o cérebro errou a previsão", "pt-ci", "white-space:normal;left:60px;width:960px"], ["pro", 330, 66, "agora, o tipo prometido", "pt-am"]]);
  MD.slam(tl, tx.rob, tR - 0.1, { from: 1.3 }); MD.leave(tl, tx.rob, tS - 0.35); MD.slam(tl, tx.sem, tS - 0.05, { from: 1.25 }); MD.leave(tl, tx.sem, tAd - 0.3);
  MD.slam(tl, tx.adv, tAd - 0.05, { from: 1.5 }); MD.leave(tl, tx.adv, tD - 0.35); MD.slam(tl, tx.at, tD - 0.05, { from: 1.35 }); MD.leave(tl, tx.at, tV - 0.3);
  MD.slam(tl, tx.vol, tV - 0.05, { from: 1.35 }); MD.leave(tl, tx.vol, tEr - 0.35); MD.slam(tl, tx.err, tEr - 0.05, { from: 1.2 }); MD.leave(tl, tx.err, tPm - 1.6); MD.slam(tl, tx.pro, tPm - 1.3, { from: 1.25 });
  const est = estF(9);
  const pB = tAd - 0.4, pC = tV - 0.4, pD = tPm - 1.6;
  const lab = (x, t, a, atraso, cocegas) => {
    if (a <= 0.01) return; const mov = Math.sin(t * 3), mov2 = Math.sin((t - 0.6 * atraso) * 3);
    linhaP(x, 230, 1200, 230 + mov * 50, 1050, "200,210,230", a, 14); discoP(x, 230 + mov * 50, 1050, 26, AM, a); mao(x, 230 + mov * 50, 1010, 0.6, 0, PELE, a); fCaixa(x, 230, 1220, 160, 50, 12, "200,210,230", a, 4, 0.1); rotuloP(x, "alavanca", 230, 1290, 30, "255,255,255", a * PT.ss((t - tA + 0.3) / 0.4));
    const aE = a * PT.ss((t - c.ini - 0.6) / 0.6); x.setLineDash([8, 10]); linhaP(x, 300, 1220, 560, 1220, CI, aE * 0.6, 3); x.setLineDash([]); fCaixa(x, 620, 1220, 140, 90, 16, "200,210,230", aE, 4, 0.12); rotuloP(x, "robô", 620, 1220, 30, "255,255,255", aE);
    linhaP(x, 620, 1175, 760 + mov2 * 50, 900, "200,210,230", aE, 12); for (let k = 0; k < 8; k++) linhaP(x, 760 + mov2 * 50 - 30 + k * 8, 900, 760 + mov2 * 50 - 34 + k * 9, 960, AM, aE * PT.ss((t - tE + 0.4) / 0.4), 3); mao(x, 800, 1010, 0.85, 3.14, PELE, aE);
    faisca(x, 800, 1010, t, a * cocegas, 12, 120);
  };
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o laboratório (sem atraso, sem cócegas)
    const aA = 1 - PT.ss((t - pB) / 0.4);
    lab(x, t, aA * PT.ss((t - c.ini - 0.3) / 0.6), 0, 0); medidor(x, 540, 1380, 0.15, aA * PT.ss((t - tS + 0.4) / 0.4));
    // plano B: close no cronômetro — adivinha?
    const aB = planoC(t, pB, pC, 0.4, 0.4);
    if (aB > 0.01) { const R = 230; anelP(x, 540, 980, R, AM, aB, 10); brilhoP(x, 540, 980, R * 1.3, AM, 0.2 * aB); for (let k = 0; k < 12; k++) { const an = k / 12 * 6.283; linhaP(x, 540 + Math.cos(an) * R * 0.85, 980 + Math.sin(an) * R * 0.85, 540 + Math.cos(an) * R * 0.95, 980 + Math.sin(an) * R * 0.95, AM, aB, 5); } const an = -Math.PI / 2 + PT.ss((t - tD + 0.2) / 0.6) * 6.283 * 0.2 + (t < tD ? Math.sin(t * 8) * 0.05 : 0); linhaP(x, 540, 980, 540 + Math.cos(an) * R * 0.8, 980 + Math.sin(an) * R * 0.8, AM, aB, 8); discoP(x, 540, 980, 14, AM, aB); if (t > tD - 0.2) rotuloP(x, "0,2 s", 540, 1300, 76, "255,226,140", aB * PT.ss((t - tD + 0.2) / 0.3)); }
    // plano C: de volta ao robô — agora com atraso, as cócegas voltam
    const aC = planoC(t, pC, pD, 0.4, 0.4);
    lab(x, t, aC, 1, PT.ss((t - tV + 0.2) / 0.4)); medidor(x, 540, 1380, PT.lerp(0.2, 0.95, PT.ss((t - tV + 0.2) / 0.7)), aC);
    if (aC > 0.01) { const aEr = PT.ss((t - tEr + 0.3) / 0.4); if (aEr > 0) { x.setLineDash([10, 10]); anelP(x, 800, 1010, 150, CI, aC * aEr, 4); x.setLineDash([]); linhaP(x, 860, 900, 960, 800, RO, aC * aEr, 8); linhaP(x, 860, 800, 960, 900, RO, aC * aEr, 8); } }
    // plano D: a pena volta — o tipo prometido
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) penaC(x, 540 + Math.sin(t * 1.5) * 50, 1250, 1.6, -0.3 + Math.sin(t * 1.3) * 0.15, aD);
  });
};

// =============== 4. os dois tipos de cócegas (a promessa) ===============
CENAS.tipos = (el, c, B) => {
  const tD = B("dois"), tR = B("rir"), tO = B("outra"), tP = B("pena"), tM = B("mesmo2"), tL = B("labio"), tS = B("sentiu");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dois", 330, 80, "2 tipos de cócegas", "pt-am"], ["rir", 330, 62, "o de rir: precisa de surpresa", "pt-ve", "white-space:normal;left:60px;width:960px"], ["lev", 330, 62, "o leve: você consegue", "pt-ci"], ["tes", 330, 76, "testa agora", "pt-am"], ["sen", 330, 110, "sentiu?", "pt-ve"]]);
  MD.slam(tl, tx.dois, tD - 0.1, { from: 1.3 }); MD.leave(tl, tx.dois, tR - 0.35); MD.slam(tl, tx.rir, tR - 0.05, { from: 1.2 }); MD.leave(tl, tx.rir, tP - 1.5);
  MD.slam(tl, tx.lev, tM - 1.2, { from: 1.25 }); MD.leave(tl, tx.lev, tL - 3.3); MD.slam(tl, tx.tes, tL - 3.0, { from: 1.3 }); MD.leave(tl, tx.tes, tS - 0.3); MD.slam(tl, tx.sen, tS - 0.05, { from: 1.6 });
  const est = estF(11);
  const pB = tP - 1.5, pC = tL - 3.1;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o tipo de rir — costelas, outra pessoa, faíscas
    const aA = PT.ss((t - c.ini - 0.2) / 0.5) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) {
      fPessoa(x, 430, 1060, 4.2, CI, aA * 0.8);
      const aO = PT.ss((t - tO + 0.5) / 0.5); fPessoa(x, 860, 1080, 3.6, RO, aA * aO * 0.9);
      const mov = Math.sin(t * 9) * 25; mao(x, 600 + mov, 1000, 0.7, -1.3, aO > 0.5 ? RO : CI, aA * PT.ss((t - tR + 0.3) / 0.4)); mao(x, 600 - mov, 1130, 0.7, -1.6, aO > 0.5 ? RO : CI, aA * PT.ss((t - tR + 0.1) / 0.4));
      faisca(x, 470, 1060, t, aA * aO, 14, 170);
      if (t > tR - 0.3 && aO < 0.5) rotuloP(x, "...", 470, 820, 90, "200,210,230", aA * (1 - aO));
    }
    // plano B: o tipo leve — pena no braço e o arrepio
    const aB = planoC(t, pB, pC, 0.4, 0.4);
    if (aB > 0.01) { const u = ((t - pB) * 0.25) % 1; bracoC(x, 540, 1060, 880, 220, aB, PT.ss((t - tP + 0.2) / 1.2), t); penaC(x, PT.lerp(220, 860, u), 1000, 1.1, -1.2, aB); mao(x, PT.lerp(220, 860, u) - 60, 760, 0.6, 0.6, CI, aB * PT.ss((t - tM + 0.6) / 0.4)); }
    // plano C: o teste do lábio
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) {
      labiosC(x, 540, 1020, 1.5, aC); const u = PT.ss((t - tL + 1.6) / 2.6), px = PT.lerp(220, 860, u), py = 950 + Math.sin(u * Math.PI) * -60;
      for (let k = 1; k < 14; k++) { const v = Math.max(0, u - k * 0.02), qx = PT.lerp(220, 860, v), qy = 950 + Math.sin(v * Math.PI) * -60; discoP(x, qx, qy, 6, AM, aC * 0.6 * (1 - k / 14)); }
      discoP(x, px, py, 22, PELE, aC); anelP(x, px, py, 22, "255,255,255", aC, 4); brilhoP(x, px, py, 80, AM, 0.5 * aC);
      const aS = PT.ss((t - tS + 0.1) / 0.3); if (aS > 0) for (let k = 0; k < 3; k++) { const v = ((t - tS) * 0.8 + k / 3) % 1; anelP(x, 540, 1000, 120 + v * 380, AM, aC * aS * (1 - v), 5); }
    }
  });
};

// =============== 5. o truque do médico ===============
CENAS.medico = (el, c, B) => {
  const tF = B("favor"), tMe = B("medico"), tM = B("maodica"), tG = B("guia"), tD = B("diminuem");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["tru", 330, 70, "o truque do médico", "pt-am"], ["mao", 330, 62, "sua mão por cima da dele", "pt-ci", "white-space:normal;left:60px;width:960px"], ["dim", 330, 80, "as cócegas diminuem", "pt-ve"]]);
  MD.slam(tl, tx.tru, tF - 0.1, { from: 1.3 }); MD.leave(tl, tx.tru, tM - 0.4); MD.slam(tl, tx.mao, tM - 0.05, { from: 1.25 }); MD.leave(tl, tx.mao, tD - 0.4); MD.slam(tl, tx.dim, tD - 0.05, { from: 1.3 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    const aB = PT.ss((t - c.ini - 0.3) / 0.6);
    if (aB > 0) { x.beginPath(); x.ellipse(540, 1000, 380, 190, 0, 0, 6.283); x.fillStyle = `rgba(${PELE},${0.15 * aB})`; x.fill(); x.strokeStyle = `rgba(${PELE},${aB})`; x.lineWidth = 6; x.stroke(); discoP(x, 540, 1030, 8, PELE, aB); }
    const mov = Math.sin(t * 2.2) * 30;
    mao(x, 540 + mov, 960, 1.0, 0.2, "150,200,255", PT.ss((t - tMe + 0.4) / 0.5));                 // mão do médico
    mao(x, 540 + mov, 935, 0.95, 0.2, PELE, PT.ss((t - tM + 0.2) / 0.5));                           // a sua mão por cima
    faisca(x, 540 + mov, 980, t, PT.jan(t, tMe - 0.2, tM + 0.4, 0.3, 0.6), 10, 130);
    if (t > tG - 0.3) rotuloP(x, "você guia → o cérebro prevê", 540, 1290, 36, "150,235,255", PT.ss((t - tG + 0.3) / 0.5));
    const v = t < tM ? 0.9 : PT.lerp(0.9, 0.2, PT.ss((t - tG) / 1.0)); medidor(x, 540, 700, v, PT.ss((t - tMe + 0.3) / 0.5), "CÓCEGAS");
  });
};

// =============== 6. resumo relâmpago + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [560, 720, 880], textos = ["o cérebro prevê o seu toque", "abaixa o volume", "sem surpresa, sem cócegas"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 54, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const nv = T.nuvem(9100), est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    fCerebro(nv, 540, 1230, 200, 0.6 * sai * PT.ss((t - c.ini) / 0.5), { cerebelo: 0.6 });
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [CI, AM, RO][k], a); brilhoP(x, 160, Y[k], 50, "255,200,220", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
