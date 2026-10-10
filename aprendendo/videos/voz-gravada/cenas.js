// Cenas do vídeo "Por que a sua voz soa estranha gravada" — padrão novo (out/2026): objetos em pontos de
// luz com volume, pontos que se transformam, câmera com profundidade e movimento com física.
// Retenção: dor do dia a dia (o próprio áudio), virada (você ia gostar da sua voz), dois caminhos do som,
// previsão ("adivinha qual todo mundo ouve?"), experimento de 2013, pergunta e o teste dos dedos.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
const FUNDOV = fundoProfundo(31);

// cabeça de perfil em pontos (olhando para a direita): (0,0) = centro do crânio, escala 1 ≈ 1 px; osso = borda do crânio
const PERFIL = [[150, -235], [215, -150], [232, -60], [238, -10], [300, 50], [250, 80], [262, 120], [242, 140], [255, 170], [228, 200], [215, 245], [150, 262], [95, 300], [95, 420]];
const perfilX = (y) => { for (let k = 1; k < PERFIL.length; k++) { const [x0, y0] = PERFIL[k - 1], [x1, y1] = PERFIL[k]; if (y >= y0 && y <= y1) return x0 + (x1 - x0) * (y - y0) / Math.max(1e-6, y1 - y0); } return -1e9; };
const CABECA = (() => { const r = prng(77), o = []; const dentro = (x, y) => (Math.pow(x / 230, 2) + Math.pow((y + 20) / 250, 2) < 1) || (x > 0 && y > -235 && y < 262 && x < perfilX(y)) || (x > -120 && x < 95 && y > 150 && y < 420); while (o.length < 15000) { const x = r() * 600 - 280, y = r() * 720 - 300; if (dentro(x, y)) o.push({ x, y, n: r(), osso: Math.abs(Math.hypot(x / 230, (y + 20) / 250) - 0.93) < 0.05 && x < 150 }); } return o; })();
const OUVIDO = [-20, 20], BOCA = [262, 140], GARGANTA = [30, 300];
// vib = vibração por dentro (ossos acendem em ondas a partir da garganta)
function cabecaV(nv, cx, cy, s, a, vib = 0, t = 0, i0 = nv.k) {
  let i = i0; if (a <= 0.01) { nv.total(i); return i; }
  for (const p of CABECA) { if (i >= nv.n) break; const d = Math.hypot(p.x - GARGANTA[0], p.y - GARGANTA[1]), onda = vib * Math.max(0, Math.sin(d * 0.05 - t * 9)); const c = p.osso ? mixC([0.95, 0.9, 0.85], [1.0, 0.6, 0.3], onda) : mixC([0.55, 0.65, 0.95], [1.0, 0.6, 0.3], onda * 0.7); nv.ponto(i++, cx + p.x * s, cy + p.y * s, c[0], c[1], c[2], a * ((p.osso ? 0.55 : 0.2) + 0.25 * p.n + 0.5 * onda), (p.osso ? 3.6 : 3) * Math.max(0.8, s)); }
  nv.total(i); return i;
}
// partículas do som pelo ar: da boca, contornando a frente do rosto, até o ouvido (u = 0..1 no caminho)
function caminhoAr(cx, cy, s, u) { const [bx, by] = BOCA, [ox, oy] = OUVIDO; const px = bx + 260 * Math.sin(u * Math.PI), q = u; return [cx + (bx + (ox - bx) * q + (px - bx) * Math.sin(q * Math.PI) * 0.9) * s, cy + (by + (oy - by) * q - 220 * Math.sin(q * Math.PI)) * s]; }
function somAr(nv, cx, cy, s, t, a, i0 = nv.k, alvo = null) {
  let i = i0; if (a <= 0.01) { nv.total(i); return i; }
  for (let k = 0; k < 160 && i < nv.n; k++) { const u = ((t * 0.45 + k / 160) % 1); let px, py; if (alvo) { const [bx, by] = [cx + BOCA[0] * s, cy + BOCA[1] * s]; px = bx + (alvo[0] - bx) * u; py = by + (alvo[1] - by) * u + Math.sin(u * 18 + k) * 14 * s; } else [px, py] = caminhoAr(cx, cy, s, u); nv.ponto(i++, px, py, 0.56, 0.89, 1, a * 1.3 * Math.sin(u * Math.PI), 6 * Math.max(0.8, s)); }
  nv.total(i); return i;
}

const FV = {
  cel: formaPontos("device-mobile", 9000), onda: formaPontos("waveform", 7000), careta: formaPontos("smiley-nervous", 10000), joinha: formaPontos("thumbs-up", 10000),
  estrela: formaPontos("star", 1600), pessoas: formaPontos("users-three", 9000), pessoa: formaPontos("user", 900), mic: formaPontos("microphone", 10000),
  orelha: formaPontos("ear", 10000), cranio: formaPontos("skull", 12000), osso: formaPontos("bone", 8000), interr: formaTexto("?", 10000),
  sorriso: formaPontos("smiley", 10000), derrete: formaPontos("smiley-melting", 10000), retrato: formaPontos("user-circle", 9000), coracao: formaPontos("heart", 2500),
  mao: formaPontos("hand-pointing", 7000), n2013: formaTexto("2013", 10000), lupa: formaPontos("magnifying-glass", 6000),
};

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tA = B("audio"), tV = B("voce"), tG = B("gostar"), tE = B("estranha"), tL = B("literal"), tP = B("promessa");
  const p2 = tV - 0.5, p3 = tE - 0.6, p4 = tL - 0.9, p5 = tP - 2.6;
  mostrarGancho(tV - 0.9);
  const T = telaGPU(el, c), nv = T.nuvem(90000);
  const tx = palcoTexto(el, [["exp", 330, 64, "sem saber que era você", "pt-ci"], ["gos", 330, 76, "você ia gostar", "pt-am"], ["est", 330, 66, "então por que soa estranha?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["den", 330, 66, "dentro da sua cabeça", "pt-am"], ["tes", 330, 62, "o teste dos 2 dedos: no final", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.exp, tV - 0.3, { from: 1.25 }); MD.leave(tl, tx.exp, tG - 0.4); MD.slam(tl, tx.gos, tG - 0.2, { from: 1.4 }); MD.leave(tl, tx.gos, p3 - 0.1);
  MD.slam(tl, tx.est, tE - 0.5, { from: 1.2 }); MD.leave(tl, tx.est, p4 - 0.1); MD.slam(tl, tx.den, tL - 0.6, { from: 1.3 }); MD.leave(tl, tx.den, p5 - 0.1); MD.slam(tl, tx.tes, p5 + 0.2, { from: 1.2 });
  const CAM = cameraProf([[0, { zoom: 1.25, y: 1000, foco: 1 }], [p2, { zoom: 1.0 }], [p4, { zoom: 1.0 }], [p5 - 0.2, { zoom: 1.5, y: 900 }], [p5 + 0.4, { zoom: 1.0, y: 960 }]]);
  T.quadro((x, t) => {
    const cam = CAM(t); let i = desenharFundo(nv, FUNDOV, t, cam, [0.7, 0.8, 1], 1, 0);
    // plano 1 (quadro 0): o celular tocando o seu áudio; a careta de vergonha pula
    const a1 = 1 - PT.ss((t - p2) / 0.45);
    if (a1 > 0.01) {
      const [dx, dy] = FIS.tremor(t, tA, 10, 0.5);
      i = desenharForma(nv, FV.cel, { cx: 470 + dx, cy: 980 + dy, esc: 820, cor: CORF.branco, borda: CORF.ciano, a: a1, t, giro: -0.25 + 0.08 * Math.sin(t * 0.8), cam, z: 1, i0: i });
      i = desenharForma(nv, FV.onda, { cx: 470 + dx, cy: 990 + dy, esc: 300, sy: 0.6 + 0.4 * Math.abs(Math.sin(t * 7)), cor: CORF.amarelo, a: a1, t, cam, z: 1, i0: i });
      const ch = FIS.chegar(t, tA - 0.2, 0.55);
      i = desenharForma(nv, FV.careta, { cx: 790, cy: 820, esc: 330 * Math.max(0.01, ch), rot: 0.15 * FIS.balanco(t, tA, 1, 2.4, 3), cor: CORF.rosa, a: a1 * Math.min(1, ch * 2), t, cam, z: 0.9, i0: i });
    }
    // plano 2: o experimento — a careta vira joinha e as estrelas acendem em cascata; a plateia ao fundo, fora de foco
    const a2 = planoC(t, p2, p3);
    if (t > p2 - 0.1 && t < p3 + 0.5) {
      i = desenharForma(nv, FV.pessoas, { cx: 540, cy: 420, esc: 760, cam: { ...cam, foco: 1 }, z: 2.2, cor: CORF.lilas, a: 0.9 * a2, t, i0: i });
      const u = PT.ss((t - tG + 0.6) / 0.8);
      i = morfo(nv, FV.careta, FV.joinha, u, { de: { cx: 790, cy: 820, esc: 330, cor: CORF.rosa }, para: { cx: 540, cy: 900, esc: 520, cor: CORF.amarelo, giro: 0.2 * Math.sin(t) }, t, a: a2, onda: 0.3, curva: 0.3, i0: i });
      for (let k = 0; k < 5; k++) { const e = FIS.cascata(t, tG + 0.1, k, 0.09, 0.5); i = desenharForma(nv, FV.estrela, { cx: 340 + k * 100, cy: 1230, esc: 95 * Math.max(0.01, e), cor: CORF.amarelo, a: a2 * Math.min(1, e * 2), t, i0: i }); }
    }
    // plano 3: o joinha vira um "?" — por que soa estranha?
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) i = morfo(nv, FV.joinha, FV.interr, PT.ss((t - p3) / 0.9), { de: { cx: 540, cy: 900, esc: 520, cor: CORF.amarelo }, para: { cx: 540, cy: 900, esc: 760, cor: CORF.ciano }, t, a: a3, onda: 0.35, curva: 0.4, i0: i });
    // plano 4: o "?" vira um crânio e a câmera mergulha nele (dentro da sua cabeça, literalmente)
    const a4 = planoC(t, p4, p5);
    if (a4 > 0.01) { i = morfo(nv, FV.interr, FV.cranio, PT.ss((t - p4) / 0.9), { de: { cx: 540, cy: 900, esc: 760, cor: CORF.ciano }, para: { cx: 540, cy: 920, esc: 640, cor: CORF.branco, cam, z: 1 }, t, a: a4, onda: 0.3, curva: 0.3, i0: i }); i = aneisVib(nv, 540, 960, t, a4 * PT.ss((t - tL + 0.5) / 0.4), i); }
    // plano 5: o teste prometido — duas mãos apontando para a orelha
    const a5 = PT.ss((t - p5) / 0.5);
    if (a5 > 0.01) {
      i = desenharForma(nv, FV.orelha, { cx: 540, cy: 930, esc: 430, cor: CORF.branco, borda: CORF.amarelo, a: a5, t, i0: i });
      for (const [lado, f] of [[-1, 0], [1, 0.12]]) { const e = FIS.chegar(t, p5 + 0.3 + f, 0.6), [mx, my] = FIS.arco(540 + lado * 620, 1150, 540 + lado * 300, 960, e, 120); i = desenharForma(nv, FV.mao, { cx: mx, cy: my, esc: 260, rot: lado * Math.PI / 2, cor: CORF.amarelo, a: a5, t, i0: i }); }
    }
    nv.total(i);
  });
};
function aneisVib(nv, cx, cy, t, a, i, n = 4, R = 320) { if (a <= 0.01) return i; for (let k = 0; k < n; k++) { const u = ((t * 1.1 + k / n) % 1), r = 30 + u * R; for (let j = 0; j < 110 && i < nv.n; j++) { const an = (j / 110) * 6.283; nv.ponto(i++, cx + Math.cos(an) * r, cy + Math.sin(an) * r * 0.9, 1, 0.62, 0.3, a * (1 - u) * 0.9, 3.4); } } return i; }

// =============== 2. dois caminhos ===============
CENAS.caminhos = (el, c, B) => {
  const tD = B("dois"), tAr = B("ar"), tDe = B("dentro"), tO = B("ossos"), tGr = B("graves"), tEn = B("encorpada");
  const pB = tDe - 0.5, pC = tGr - 0.6;
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["doi", 330, 76, "dois caminhos", "pt-am"], ["ar", 330, 70, "1. pelo ar", "pt-ci"], ["den", 330, 70, "2. por dentro, nos ossos", "pt-am"], ["gra", 330, 64, "os ossos levam os graves", "pt-am"], ["enc", 330, 66, "mais grave e encorpada", "pt-ci"]]);
  MD.slam(tl, tx.doi, tD - 0.2, { from: 1.35 }); MD.leave(tl, tx.doi, tAr - 0.5); MD.slam(tl, tx.ar, tAr - 0.3, { from: 1.25 }); MD.leave(tl, tx.ar, pB - 0.1);
  MD.slam(tl, tx.den, tDe - 0.2, { from: 1.2 }); MD.leave(tl, tx.den, pC - 0.1); MD.slam(tl, tx.gra, tGr - 0.3, { from: 1.2 }); MD.leave(tl, tx.gra, tEn - 0.9); MD.slam(tl, tx.enc, tEn - 0.6, { from: 1.3 });
  const CAM = cameraProf([[c.ini, { zoom: 1.0 }], [pB, { zoom: 1.0 }], [pB + 1.2, { zoom: 1.45, x: 520, y: 960 }], [pC, { zoom: 1.6, x: 500, y: 980 }]]);
  T.quadro((x, t) => {
    const cam = CAM(t); let i = desenharFundo(nv, FUNDOV, t, cam, [0.7, 0.8, 1], 1, 0);
    // A e B: a cabeça; o som pelo ar (por fora) e pelos ossos (por dentro); a câmera entra na cabeça
    const aAB = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pC) / 0.45));
    if (aAB > 0.01) {
      const [hx, hy, k] = projP(cam, 470, 940, 1), s = 1.15 * k, vib = PT.ss((t - tDe + 0.3) / 0.6) * (0.6 + 0.4 * PT.ss((t - tO + 0.2) / 0.4));
      i = cabecaV(nv, hx, hy, s, aAB, vib, t, i);
      const aAr = PT.ss((t - tAr + 0.4) / 0.5) * (1 - 0.6 * PT.ss((t - pB) / 0.6));
      i = somAr(nv, hx, hy, s, t, aAB * aAr, i);
      const dois = FIS.chegar(t, tD - 0.1, 0.5);
      if (dois > 0.01 && t < tAr + 0.6) { for (let q = 0; q < 2; q++) { const e = FIS.cascata(t, tD - 0.1, q, 0.15, 0.5); rotuloP(x, q ? "por dentro" : "pelo ar", q ? hx - 60 * s : hx + 330 * s, q ? hy + 120 * s : hy - 240 * s, 40, q ? "255,200,140" : "170,230,255", aAB * Math.min(1, e) * (1 - PT.ss((t - tAr - 0.2) / 0.4))); } }
      if (vib > 0.3) rotuloP(x, "ossos", 180, 640, 44, "255,200,140", aAB * PT.ss((t - tO + 0.2) / 0.3));
      brilhoP(x, hx + OUVIDO[0] * s, hy + OUVIDO[1] * s, 60 * s, AMB_V, 0.6 * aAB * Math.max(aAr * 0.6, vib));
    }
    // C: graves passam pelo osso, agudos ficam; a voz de dentro fica grossa (encorpada)
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) {
      const ch = FIS.chegar(t, pC + 0.1, 0.6);
      i = desenharForma(nv, FV.osso, { cx: 540, cy: 960, esc: 360 * Math.max(0.01, ch), rot: -0.5, cor: CORF.branco, borda: CORF.ambar, a: aC, t, i0: i });
      const grosso = 1 + 2 * PT.ss((t - tEn + 0.5) / 0.6);
      i = ondaPontos(nv, 80, 1000, 780, 70, 2.2, t, CORF.ambar, aC, i, grosso, 4);
      i = ondaPontos(nv, 80, 470, 1150, 26, 7, t, CORF.ciano, aC * (1 - 0.6 * PT.ss((t - tGr - 0.4) / 0.6)), i, 0.6, 9);
      rotuloP(x, "graves", 160, 700, 36, "255,200,140", aC); rotuloP(x, "agudos", 200, 1230, 36, "170,230,255", aC);
    }
    nv.total(i);
  });
};
const AMB_V = "255,170,90";

// =============== 3. o gravador ===============
CENAS.gravacao = (el, c, B) => {
  const tAr = B("ar2"), tF = B("fina"), tAd = B("adivinha"), tAu = B("audio2"), tDe = B("dentro2");
  const pB = tF - 0.5, pC = tAd - 0.5, pD = tAu - 0.5;
  const T = telaGPU(el, c), nv = T.nuvem(80000);
  const tx = palcoTexto(el, [["gra", 330, 64, "o gravador só pega o ar", "pt-ci"], ["fin", 330, 74, "soa mais fina", "pt-ci"], ["adv", 330, 76, "adivinha", "pt-am"], ["qua", 420, 46, "qual todo mundo ouve?", "pt-fino"], ["aud", 330, 72, "a do áudio", "pt-ci"], ["den", 420, 46, "a de dentro: só você", "pt-fino"]]);
  MD.slam(tl, tx.gra, tAr - 0.6, { from: 1.25 }); MD.leave(tl, tx.gra, pB - 0.1); MD.slam(tl, tx.fin, tF - 0.2, { from: 1.3 }); MD.leave(tl, tx.fin, pC - 0.1);
  MD.slam(tl, tx.adv, tAd - 0.1, { from: 1.4 }); MD.arrive(tl, tx.qua, tAd + 0.6, { y: 14 }); MD.leave(tl, [tx.adv, tx.qua], pD - 0.1); MD.slam(tl, tx.aud, tAu - 0.2, { from: 1.35 }); MD.arrive(tl, tx.den, tDe - 0.3, { y: 14 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOV, t, null, [0.7, 0.8, 1], 1, 0);
    // A: a cabeça fala; só as partículas do ar chegam ao microfone; por dentro fica dentro
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) {
      i = cabecaV(nv, 330, 980, 0.95, aA, 0.7, t, i);
      const ch = FIS.chegar(t, c.ini + 0.3, 0.6);
      i = desenharForma(nv, FV.mic, { cx: 820, cy: 960, esc: 330 * Math.max(0.01, ch), rot: -0.35, cor: CORF.branco, borda: CORF.ciano, a: aA, t, i0: i });
      i = somAr(nv, 330, 980, 0.95, t, aA * PT.ss((t - tAr + 0.6) / 0.5), i, [770, 930]);
    }
    // B: a gravação é a onda fina; a de dentro, grossa
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { i = ondaPontos(nv, 90, 990, 800, 80, 2.2, t, CORF.ambar, aB, i, 3, 4); i = ondaPontos(nv, 90, 990, 1120, 60, 6, t, CORF.ciano, aB * PT.ss((t - tF + 0.4) / 0.4), i, 0.7, 8); rotuloP(x, "na sua cabeça", 540, 690, 40, "255,200,140", aB); rotuloP(x, "no áudio", 540, 1230, 40, "170,230,255", aB); }
    // C: adivinha — as duas lado a lado e um "?" no meio
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { i = ondaPontos(nv, 90, 990, 760, 70, 2.2, t, CORF.ambar, aC * 0.8, i, 3, 4); i = ondaPontos(nv, 90, 990, 1180, 55, 6, t, CORF.ciano, aC * 0.8, i, 0.7, 8); const e = FIS.chegar(t, tAd, 0.6); i = desenharForma(nv, FV.interr, { cx: 540, cy: 970, esc: 300 * Math.max(0.01, e), cor: CORF.amarelo, a: aC, t, i0: i }); }
    // D: todo mundo ouve a do áudio; a de dentro some para dentro de uma cabeça
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) {
      i = ondaPontos(nv, 140, 940, 900, 55, 6, t, CORF.ciano, aD, i, 0.8, 8);
      for (let k = 0; k < 5; k++) { const e = FIS.cascata(t, tAu, k, 0.08, 0.55), ang = -2.6 + k * 0.55; i = desenharForma(nv, FV.pessoa, { cx: 540 + Math.cos(ang) * 400, cy: 900 + Math.sin(ang) * 300 + 260, esc: 150 * Math.max(0.01, e), cor: CORF.lilas, a: aD, t, i0: i }); }
      const so = PT.ss((t - tDe + 0.2) / 0.6);
      i = cabecaV(nv, 540, 1180, 0.35, aD * so, 0.9, t, i);
    }
    nv.total(i);
  });
};

// =============== 4. por que incomoda ===============
CENAS.choque = (el, c, B) => {
  const tT = B("tanto"), tR = B("repente"), tE = B("espelho"), tN = B("normal");
  const pB = tR - 1.6, pC = tE - 2.0;
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["tan", 330, 66, "por que incomoda tanto?", "pt-ci"], ["rep", 330, 66, "familiar que muda de repente", "pt-am", "white-space:normal;left:60px;width:960px"], ["esp", 330, 62, "você prefere a foto espelhada", "pt-ci", "white-space:normal;left:60px;width:960px"], ["nor", 330, 62, "os amigos, a normal", "pt-am"]]);
  MD.slam(tl, tx.tan, tT - 0.2, { from: 1.3 }); MD.leave(tl, tx.tan, pB - 0.1); MD.slam(tl, tx.rep, pB + 0.2, { from: 1.2 }); MD.leave(tl, tx.rep, pC - 0.1);
  MD.slam(tl, tx.esp, tE - 0.5, { from: 1.2 }); MD.leave(tl, tx.esp, tN - 0.5); MD.slam(tl, tx.nor, tN - 0.3, { from: 1.25 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOV, t, null, [0.7, 0.8, 1], 1, 0);
    // A: o cérebro estranhando
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) { i0Cerebro(nv, i); fCerebro(nv, 540, 940, 330 + 10 * FIS.flutua(t, 0, 1, 0.4), aA, { cerebelo: 0 }); i = nv.k; const e = FIS.chegar(t, tT, 0.5); rotuloP(x, "?", 820, 700, 150 * Math.max(0.01, e), "255,226,140", aA); }
    // B: o rosto conhecido muda de repente (sorriso → derretendo)
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) i = morfo(nv, FV.sorriso, FV.derrete, PT.ss((t - tR + 0.3) / 0.7), { de: { cx: 540, cy: 930, esc: 620, cor: CORF.amarelo }, para: { cx: 540, cy: 930, esc: 620, cor: CORF.rosa }, t, a: aB, onda: 0.2, curva: 0.2, i0: i });
    // C: as duas fotos — espelhada (você prefere) e normal (amigos preferem)
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) {
      for (const [lado, tt, cor] of [[-1, tE, CORF.ciano], [1, tN, CORF.amarelo]]) {
        const px = 540 + lado * 230, e = FIS.chegar(t, pC + 0.2 + (lado > 0 ? 0.15 : 0), 0.6);
        i = desenharForma(nv, FV.retrato, { cx: px, cy: 940, esc: 380 * Math.max(0.01, e), sx: lado < 0 ? -1 : 1, cor: CORF.branco, a: aC, t, i0: i });
        const pz = px + (lado < 0 ? -1 : 1) * 30 * e; discoP(x, pz, 905, 9 * e, "255,150,120", aC); brilhoP(x, pz, 905, 26 * e, "255,150,120", 0.6 * aC);
        const h = FIS.chegar(t, tt - 0.1, 0.5); i = desenharForma(nv, FV.coracao, { cx: px, cy: 1180, esc: 130 * Math.max(0.01, h), cor, a: aC * Math.min(1, h * 2), t, i0: i });
        rotuloP(x, lado < 0 ? "espelhada" : "normal", px, 1290, 40, lado < 0 ? "170,230,255" : "255,226,140", aC * Math.min(1, h * 2));
      }
    }
    nv.total(i);
  });
};
const i0Cerebro = (nv, i) => { nv.k = i; };

// =============== 5. o experimento ===============
CENAS.experimento = (el, c, B) => {
  const tO = B("oitenta"), tE = B("escondida"), tP = B("percebeu"), tA = B("alta");
  const pB = tO - 0.6, pC = tE - 0.5, pD = tA - 0.8;
  const T = telaGPU(el, c), nv = T.nuvem(80000);
  const tx = palcoTexto(el, [["ano", 330, 66, "um experimento de 2013", "pt-ci"], ["n80", 330, 76, "80 pessoas", "pt-am"], ["esc", 330, 62, "a voz delas, escondida no meio", "pt-ci", "white-space:normal;left:60px;width:960px"], ["per", 330, 66, "quase ninguém percebeu", "pt-am"], ["alt", 330, 62, "e deram nota mais alta", "pt-am"]]);
  MD.slam(tl, tx.ano, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.ano, pB - 0.1); MD.slam(tl, tx.n80, tO - 0.2, { from: 1.4 }); MD.leave(tl, tx.n80, pC - 0.1);
  MD.slam(tl, tx.esc, tE - 0.2, { from: 1.2 }); MD.leave(tl, tx.esc, tP - 0.6); MD.slam(tl, tx.per, tP - 0.4, { from: 1.25 }); MD.leave(tl, tx.per, pD - 0.1); MD.slam(tl, tx.alt, tA - 0.4, { from: 1.25 });
  const PESS = Array.from({ length: 80 }, (_, k) => ({ x: 150 + (k % 8) * 112, y: 600 + Math.floor(k / 8) * 82, k }));
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOV, t, null, [0.7, 0.8, 1], 1, 0);
    // A: "2013" em pontos
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) { const e = FIS.chegar(t, c.ini + 0.2, 0.6); i = desenharForma(nv, FV.n2013, { cx: 540, cy: 930, esc: 820 * Math.max(0.01, e), cor: CORF.ciano, a: aA, t, giro: 0.2 * Math.sin(t * 0.7), i0: i }); }
    // B: as 80 pessoas acendendo em onda
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) PESS.forEach((p) => { const e = FIS.cascata(t, tO - 0.3, (p.k % 8) + Math.floor(p.k / 8), 0.05, 0.5); i = desenharForma(nv, FV.pessoa, { cx: p.x, cy: p.y - 10 * Math.max(0, e - 1) * 4, esc: 90 * Math.max(0.01, e), cor: CORF.lilas, a: aB, t, i0: i }); });
    // C: seis vozes; uma é a da própria pessoa (escondida) — e a lupa passa sem achar
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) {
      for (let k = 0; k < 6; k++) { const y = 640 + k * 110, sua = k === 3; i = ondaPontos(nv, 160, 920, y, 28, 3 + k * 0.7, t + k, sua ? CORF.amarelo : CORF.ciano, aC * (sua ? 1 : 0.6), i, 0.6, 6); }
      const lu = PT.inOut(((t - pC) / 3) % 1); i = desenharForma(nv, FV.lupa, { cx: PT.lerp(220, 860, lu), cy: 900 + 140 * Math.sin(lu * 6.283), esc: 220, cor: CORF.branco, a: aC * PT.ss((t - tP + 0.8) / 0.4), t, i0: i });
    }
    // D: nota da própria voz (alta) x nota dos outros
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) {
      for (const [k, alt, cor, rot] of [[0, 420, CORF.ciano, "os outros"], [1, 600, CORF.amarelo, "a própria"]]) {
        const e = FIS.chegar(t, tA - 0.3 + k * 0.25, 0.7), h = alt * Math.max(0, e), bx = 380 + k * 320;
        for (let q = 0; q < 900 && i < nv.n; q++) { const u = (q * 0.7548776662) % 1, v = (q * 0.5698402910) % 1; nv.ponto(i++, bx - 90 + u * 180, 1300 - v * h, cor[0], cor[1], cor[2], aD * (0.35 + 0.4 * (v > 0.97 ? 1 : 0)), 3.2); }
        rotuloP(x, rot, bx, 1360, 40, k ? "255,226,140" : "170,230,255", aD);
      }
      const st = FIS.chegar(t, tA + 0.4, 0.5); i = desenharForma(nv, FV.estrela, { cx: 700, cy: 640, esc: 150 * Math.max(0.01, st), cor: CORF.amarelo, a: aD, t, i0: i });
    }
    nv.total(i);
  });
};

// =============== 6. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tV = B("verdade"), tO = B("outros"), tT = B("teoria");
  const pB = tC + 0.6, pC = tO + 0.3;
  const T = telaGPU(el, c), nv = T.nuvem(50000);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["que", 330, 62, "quem ouve a sua voz de verdade?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["teo", 330, 76, "qual a sua teoria?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, pB - 0.1); MD.slam(tl, tx.que, pB + 0.1, { from: 1.2 }); MD.leave(tl, tx.que, pC - 0.1); MD.slam(tl, tx.teo, pC + 0.1, { from: 1.4 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOV, t, null, [0.7, 0.8, 1], 1, 0);
    const aA = FIS.chegar(t, c.ini + 0.1, 0.6) * (1 - PT.ss((t - pB) / 0.4));
    i = balaoPergunta(nv, x, t, Math.max(0, Math.min(1, aA)), 540, 930, 620, i);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) {
      i = desenharForma(nv, FV.orelha, { cx: 300, cy: 940, esc: 330, cor: CORF.branco, borda: CORF.amarelo, a: aB, t, i0: i }); rotuloP(x, "você", 300, 1160, 44, "255,226,140", aB);
      const e = FIS.chegar(t, tV - 0.2, 0.6); i = desenharForma(nv, FV.pessoas, { cx: 780, cy: 940, esc: 380 * Math.max(0.01, e), cor: CORF.lilas, a: aB, t, i0: i }); rotuloP(x, "os outros", 780, 1160, 44, "210,190,255", aB * Math.min(1, e));
      rotuloP(x, "?", 540, 930, 150, "255,226,140", aB * PT.ss((t - tO + 0.3) / 0.3));
    }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { i = balaoPergunta(nv, x, t, aC, 540, 900, 580, i); setaComentarios(x, aC, t); }
    nv.total(i);
  });
};

// =============== 7. o teste dos dedos ===============
CENAS.teste = (el, c, B) => {
  const tPm = B("prometi"), tD = B("dedos"), tG = B("grave2"), tO = B("ossos2"), tC = B("conhece");
  const pB = tD - 0.7, pC = tO - 0.6;
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["pro", 330, 70, "o teste prometido", "pt-am"], ["ded", 330, 62, "tampa os ouvidos e fala", "pt-ci"], ["gra", 330, 66, "mais grave e mais alta", "pt-am"], ["oss", 330, 62, "quase tudo pelos ossos", "pt-am"], ["con", 420, 46, "a voz que só você conhece", "pt-fino"]]);
  MD.slam(tl, tx.pro, tPm - 0.5, { from: 1.35 }); MD.leave(tl, tx.pro, pB - 0.1); MD.slam(tl, tx.ded, tD - 0.4, { from: 1.25 }); MD.leave(tl, tx.ded, tG - 0.5); MD.slam(tl, tx.gra, tG - 0.3, { from: 1.3 }); MD.leave(tl, tx.gra, pC - 0.1);
  MD.slam(tl, tx.oss, tO - 0.4, { from: 1.25 }); MD.arrive(tl, tx.con, tC - 0.4, { y: 14 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOV, t, null, [0.7, 0.8, 1], 1, 0);
    // A: a orelha e a mão chegando em arco
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) { i = desenharForma(nv, FV.orelha, { cx: 540, cy: 940, esc: 520, cor: CORF.branco, borda: CORF.amarelo, a: aA, t, giro: 0.15 * Math.sin(t * 0.8), i0: i }); const e = FIS.chegar(t, tPm, 0.7), [mx, my] = FIS.arco(1000, 1300, 700, 1000, e, 160); i = desenharForma(nv, FV.mao, { cx: mx, cy: my, esc: 260, rot: -Math.PI / 2 - 0.3, cor: CORF.amarelo, a: aA * Math.min(1, e * 2), t, i0: i }); }
    // B e C: a cabeça com o dedo no ouvido; a vibração por dentro cresce; os ossos acendem
    const aBC = PT.ss((t - pB) / 0.5);
    if (aBC > 0.01) {
      const vib = PT.ss((t - tG + 0.4) / 0.6) * (0.7 + 0.3 * PT.ss((t - tO + 0.3) / 0.4)), [dx, dy] = FIS.tremor(t, tG - 0.1, 6, 0.4);
      i = cabecaV(nv, 470 + dx, 960 + dy, 1.2, aBC, vib, t, i);
      const e = FIS.chegar(t, pB + 0.2, 0.6), [mx, my] = FIS.arco(130, 1250, 470 + OUVIDO[0] * 1.2 - 130, 960 + OUVIDO[1] * 1.2 + 10, e, 140);
      i = desenharForma(nv, FV.mao, { cx: mx, cy: my, esc: 230, rot: Math.PI / 2 - 0.2, cor: CORF.amarelo, a: aBC, t, i0: i });
      i = aneisVib(nv, 470 + OUVIDO[0] * 1.2, 960 + OUVIDO[1] * 1.2, t, aBC * vib * 0.7, i, 3, 220);
      if (t > pC) rotuloP(x, "ossos", 230, 700, 44, "255,200,140", aBC * PT.ss((t - pC - 0.2) / 0.3));
    }
    nv.total(i);
  });
};

// =============== 8. resumo ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c), nv = T.nuvem(40000);
  const Y = [560, 760, 960], textos = ["por dentro, os ossos: voz mais grave", "o gravador só pega o ar", "a do áudio é a que todos ouvem"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 50, s, "", "left:250px;width:780px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const IC = [[FV.osso, CORF.ambar], [FV.mic, CORF.ciano], [FV.pessoas, CORF.lilas]];
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOV, t, null, [0.7, 0.8, 1], 1, 0);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    tP.forEach((tp, k) => { const e = FIS.chegar(t, tp - 0.2, 0.5), ent = FIS.cascata(t, c.ini + 0.3, k, 0.12, 0.6); i = desenharForma(nv, IC[k][0], { cx: 160, cy: Y[k] + 10, esc: 130 * Math.max(0.01, Math.min(1, ent)) * (1 + 0.15 * Math.max(0, e - 1) * 4), cor: IC[k][1], a: sai * Math.min(1, ent) * (0.3 + 0.7 * PT.cl(e)), t, i0: i }); });
    i = ondaPontos(nv, 120, 960, 1230, 60, 3, t, CORF.ambar, 0.7 * sai * PT.ss((t - c.ini - 0.2) / 0.5), i, 1.5, 5);
    nv.total(i);
  });
  cartaoFinal(el, tC + 1.4);
};
