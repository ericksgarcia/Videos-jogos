// Cenas do vídeo "Por que a sua voz soa estranha gravada" — pontos de luz na GPU.
// Retenção: dor do dia a dia (o próprio áudio), promessa (o experimento de 2013), dois caminhos do
// som (ar e ossos), teste para fazer na hora (dedos nos ouvidos), choque e virada final.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.5);

// cabeça de perfil (olhando para a direita), coordenadas relativas a (0,0) = centro do crânio, escala 1 ≈ 1 px
const PERFIL = [[150, -235], [215, -150], [232, -60], [238, -10], [300, 50], [250, 80], [262, 120], [242, 140], [255, 170], [228, 200], [215, 245], [150, 262], [95, 300], [95, 420]];
const perfilX = (y) => { for (let k = 1; k < PERFIL.length; k++) { const [x0, y0] = PERFIL[k - 1], [x1, y1] = PERFIL[k]; if (y >= y0 && y <= y1) return x0 + (x1 - x0) * (y - y0) / Math.max(1e-6, y1 - y0); } return -1e9; };
const CABECA = (() => { const r = prng(77), o = []; const dentro = (x, y) => (Math.pow(x / 230, 2) + Math.pow((y + 20) / 250, 2) < 1) || (x > 0 && y > -235 && y < 262 && x < perfilX(y)) || (x > -120 && x < 95 && y > 150 && y < 420); while (o.length < 15000) { const x = r() * 600 - 280, y = r() * 720 - 300; if (dentro(x, y)) o.push({ x, y, n: r(), osso: Math.abs(Math.hypot(x / 230, (y + 20) / 250) - 0.93) < 0.05 && x < 150 }); } return o; })();
const OUVIDO = [-20, 20], BOCA = [262, 140], GARGANTA = [30, 300];
function perfilLinha(x, cx, cy, s, a) { if (a <= 0.01) return; x.beginPath(); PERFIL.forEach(([px, py], k) => k ? x.lineTo(cx + px * s, cy + py * s) : x.moveTo(cx + px * s, cy + py * s)); x.strokeStyle = `rgba(230,235,255,${0.8 * a})`; x.lineWidth = 4; x.lineJoin = "round"; x.stroke(); }
function cabeca(nv, cx, cy, s, a, vib = 0, t = 0) { let i = nv.k; for (const p of CABECA) { const d = Math.hypot(p.x - GARGANTA[0], p.y - GARGANTA[1]), onda = vib * Math.max(0, Math.sin(d * 0.05 - t * 9)); const c = p.osso ? mixC([0.95, 0.9, 0.85], [1.0, 0.6, 0.3], onda) : mixC([0.55, 0.65, 0.95], [1.0, 0.6, 0.3], onda * 0.7); nv.ponto(i++, cx + p.x * s, cy + p.y * s, c[0], c[1], c[2], a * ((p.osso ? 0.55 : 0.2) + 0.25 * p.n + 0.5 * onda), p.osso ? 3.6 : 3); } nv.total(i); }
// barras de frequência (graves à esquerda)
function espectro(x, cx, cy, w, h, graves, cor, a, rot) { if (a <= 0.01) return; const n = 14; for (let k = 0; k < n; k++) { const u = k / (n - 1), v = 0.35 + 0.35 * Math.sin(u * 7 + 1) * 0.5 + graves * Math.exp(-u * 4) * 0.6; const bh = h * PT.cl(v); fCaixa(x, cx - w / 2 + (k + 0.5) * w / n, cy - bh / 2, w / n * 0.7, bh, 4, u < 0.3 ? LA : cor, a, 2, 0.5); } rotuloP(x, rot, cx, cy + 40, 30, "255,255,255", 0.85 * a); rotuloP(x, "graves", cx - w / 2, cy + 80, 24, "255,190,140", 0.7 * a, "left"); rotuloP(x, "agudos", cx + w / 2, cy + 80, 24, "200,220,255", 0.7 * a, "right"); }
function ondaSom(x, cx, cy, w, amp, t, cor, a, f = 1) { if (a <= 0.01) return; x.beginPath(); for (let k = 0; k <= 120; k++) { const u = k / 120, y = cy + Math.sin(u * 40 * f + t * 6) * amp * Math.sin(u * Math.PI) * (0.6 + 0.4 * Math.sin(u * 9 + t)); k ? x.lineTo(cx - w / 2 + u * w, y) : x.moveTo(cx - w / 2 + u * w, y); } x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 4; x.stroke(); }
function estrelas5(x, cx, cy, v, a, cor = AM) { for (let k = 0; k < 5; k++) { const on = k < v; const px = cx - 80 + k * 40; x.beginPath(); for (let q = 0; q < 10; q++) { const an = -Math.PI / 2 + q * Math.PI / 5, rr = q % 2 ? 7 : 16; q ? x.lineTo(px + Math.cos(an) * rr, cy + Math.sin(an) * rr) : x.moveTo(px + Math.cos(an) * rr, cy + Math.sin(an) * rr); } x.closePath(); x.fillStyle = `rgba(${on ? cor : "120,128,150"},${(on ? 0.7 : 0.25) * a})`; x.fill(); } }

const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
function setaComent(x, a, t) { if (a <= 0.01) return; const b = Math.sin(t * 6) * 16; fSeta(x, 700 + b, 1250, 900 + b, 1250, AM, a, 12); brilhoP(x, 1010, 1250, 90, AM, 0.35 * a * (0.7 + 0.3 * Math.sin(t * 6))); rotuloP(x, "comentários", 780, 1180, 38, "255,226,140", a); }
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 330 * s, 60 * s, CI, a, 8 * s, 0.12);
  x.beginPath(); x.moveTo(cx - 120 * s, cy + 160 * s); x.lineTo(cx - 190 * s, cy + 250 * s); x.lineTo(cx - 40 * s, cy + 160 * s); x.fillStyle = `rgba(${CI},${0.5 * a})`; x.fill();
  brilhoP(x, cx, cy, 380 * s, CI, 0.18 * a); rotuloP(x, txt, cx, cy + 6 * s, 190 * s, "255,226,140", a * (0.85 + 0.15 * Math.sin(t * 4)));
}
function estrelasG(x, cx, cy, s, v, a) { if (a <= 0.01) return; x.save(); x.translate(cx, cy); x.scale(s, s); estrelas5(x, 0, 0, v, a); x.restore(); }
// mensagem de áudio (bolha verde com play e onda)
function msgAudio(x, cx, cy, s, a, t, cor = VD) { if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 140 * s, 70 * s, cor, a, 5, 0.12); discoP(x, cx - 190 * s, cy, 34 * s, cor, 0.8 * a); x.beginPath(); x.moveTo(cx - 200 * s, cy - 18 * s); x.lineTo(cx - 172 * s, cy); x.lineTo(cx - 200 * s, cy + 18 * s); x.closePath(); x.fillStyle = `rgba(10,18,48,${a})`; x.fill(); ondaSom(x, cx + 50 * s, cy, 360 * s, 30 * s, t, cor, a, 0.6); }
// rosto simples; espelho = 1 inverte o lado do cabelo e da pinta
function rostoC(x, cx, cy, s, a, espelho, cor) { if (a <= 0.01) return; const m = espelho ? -1 : 1; anelP(x, cx, cy, 150 * s, cor, a, 6); discoP(x, cx - 55 * s, cy - 30 * s, 12 * s, cor, a); discoP(x, cx + 55 * s, cy - 30 * s, 12 * s, cor, a); x.beginPath(); x.arc(cx, cy + 30 * s, 60 * s, 0.2, Math.PI - 0.2); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 6; x.stroke(); x.beginPath(); x.moveTo(cx - 150 * s, cy - 40 * s); x.quadraticCurveTo(cx - 60 * m * s, cy - 230 * s, cx + 150 * s * m, cy - 60 * s); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 10; x.stroke(); discoP(x, cx + 85 * m * s, cy + 40 * s, 9 * s, LA, a); }
// mão com o dedo no ouvido (lado: -1 esquerdo, 1 direito)
function dedoOuvido(x, cx, cy, s, lado, a) { if (a <= 0.01) return; x.save(); x.translate(cx, cy); x.scale(lado, 1); fCaixa(x, 60 * s, 60 * s, 70 * s, 110 * s, 30 * s, "255,210,180", a, 4, 0.2); x.beginPath(); x.moveTo(40 * s, 10 * s); x.lineTo(5 * s, -10 * s); x.strokeStyle = `rgba(255,210,180,${a})`; x.lineWidth = 20 * s; x.lineCap = "round"; x.stroke(); x.restore(); }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tAu = B("audio"), tV = B("voce"), tG = B("gostar"), tE = B("estranha"), tL = B("literal"), tP = B("promessa");
  const p2 = tV - 0.6, p3 = tE - 0.6, p4 = tP - 2.6;
  mostrarGancho(p2 - 0.1);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["gos", 330, 70, "você ia gostar dela", "pt-am"], ["est", 330, 70, "então por que é estranha?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["den", 330, 62, "está dentro da sua cabeça", "pt-ve"], ["tes", 330, 62, "o teste dos 2 dedos: no final", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.gos, tG - 0.1, { from: 1.3 }); MD.leave(tl, tx.gos, tE - 0.35); MD.slam(tl, tx.est, tE - 0.05, { from: 1.25 }); MD.leave(tl, tx.est, tL - 1.6); MD.slam(tl, tx.den, tL - 1.3, { from: 1.3 }); MD.leave(tl, tx.den, p4); MD.slam(tl, tx.tes, p4 + 0.2, { from: 1.25 });
  const nv = T.nuvem(15100), est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano 1 (quadro 0): o seu áudio tocando no celular — e a careta
    const a1 = 1 - PT.ss((t - p2) / 0.4);
    if (a1 > 0.01) { fCelular(x, 540, 980, 760, BRC, a1, 0.06); msgAudio(x, 540, 980, 0.6, a1, t); rotuloP(x, "você", 540, 1080, 30, "200,255,220", a1); for (let k = 0; k < 6; k++) { const an = k * 1.05 + t; linhaP(x, 540 + Math.cos(an) * 200, 980 + Math.sin(an) * 160, 540 + Math.cos(an) * 240, 980 + Math.sin(an) * 190, VE, a1 * 0.8 * PT.ss((t - tAu + 0.3) / 0.3), 5); } }
    // plano 2: sem saber que é você, nota 5 estrelas
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { msgAudio(x, 540, 900, 1.2, a2, t, CI); rotuloP(x, "voz misteriosa", 540, 760, 36, "180,230,255", a2); estrelasG(x, 540 + 3 * 80, 1150, 3, Math.round(PT.lerp(1, 5, PT.ss((t - tG + 0.5) / 0.8))), a2); }
    // plano 3: a resposta está dentro da cabeça
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) { cabeca(nv, 470, 1000, 1.2, a3, PT.ss((t - tL + 0.8) / 0.5), t); } else nv.total(nv.k);
    // plano 4: o teste dos dedos (teaser)
    const a4 = PT.ss((t - p4) / 0.5);
    if (a4 > 0.01) { perfilLinha(x, 420, 1000, 1.3, a4); dedoOuvido(x, 400, 1020, 1.4, 1, a4); rotuloP(x, "?", 820, 760, 150, AM, a4); }
  });
};

// =============== 2. dois caminhos ===============
CENAS.caminhos = (el, c, B) => {
  const tD = B("dois"), tA = B("ar"), tDe = B("dentro"), tO = B("ossos"), tG = B("graves"), tE = B("encorpada");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["doi", 330, 76, "2 caminhos", "pt-am"], ["ar", 330, 66, "1: pelo ar", "pt-ci"], ["den", 330, 66, "2: pelos ossos", "pt-am"], ["gra", 330, 66, "osso reforça os graves", "pt-am"], ["enc", 330, 62, "por dentro: mais grave", "pt-ci"]]);
  MD.slam(tl, tx.doi, tD - 0.1, { from: 1.35 }); MD.leave(tl, tx.doi, tA - 0.35); MD.slam(tl, tx.ar, tA - 0.05, { from: 1.25 }); MD.leave(tl, tx.ar, tDe - 0.35); MD.slam(tl, tx.den, tDe - 0.05, { from: 1.25 }); MD.leave(tl, tx.den, tG - 0.35);
  MD.slam(tl, tx.gra, tG - 0.05, { from: 1.25 }); MD.leave(tl, tx.gra, tE - 0.35); MD.slam(tl, tx.enc, tE - 0.05, { from: 1.25 });
  const nv = T.nuvem(15100), est = estF(5), CX = 440, CY = 980, S = 1.15;
  const pB = tA - 0.5, pC = tDe - 0.5, pD = tG - 0.8;
  T.quadro((x, t) => {
    estD(x, est, t);
    const boca = [CX + BOCA[0] * S, CY + BOCA[1] * S], ouv = [CX + OUVIDO[0] * S, CY + OUVIDO[1] * S];
    // planos A–C: a cabeça; os dois caminhos
    const aH = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pD) / 0.4));
    if (aH > 0.01) {
      cabeca(nv, CX, CY, S, aH, PT.ss((t - tO + 0.3) / 0.5) * planoC(t, pC, pD), t);
      const aD = 1 - PT.ss((t - pB) / 0.4); if (aD > 0.01) { rotuloP(x, "1", boca[0] + 200, CY - 300, 70, "180,230,255", aH * aD); rotuloP(x, "2", CX, CY + 40, 70, "255,200,150", aH * aD); }
      // caminho 1: pelo ar (por fora)
      const aAr = planoC(t, pB, pC); if (aAr > 0.01) { const pts = [boca, [boca[0] + 220, boca[1] - 120], [boca[0] + 150, CY - 380], [ouv[0] - 60, CY - 340], ouv]; fLinhaPts(x, pts, PT.ss((t - pB) / 1.2), CI, aH * aAr, 6); for (let k = 0; k < 3; k++) { const u = ((t * 0.5 + k / 3) % 1); x.beginPath(); x.arc(boca[0], boca[1], 40 + u * 140, -0.8, 0.5); x.strokeStyle = `rgba(${CI},${aH * aAr * (1 - u)})`; x.lineWidth = 4; x.stroke(); } }
      // caminho 2: por dentro (ossos)
      const aDe = planoC(t, pC, pD); if (aDe > 0.01) { fLinhaPts(x, [[CX + GARGANTA[0] * S, CY + GARGANTA[1] * S], [CX + 40 * S, CY + 120 * S], ouv], PT.ss((t - pC) / 1.0), LA, aH * aDe, 8); brilhoP(x, ouv[0], ouv[1], 90, LA, 0.5 * aH * aDe); }
    } else nv.total(nv.k);
    // plano D: as barras — por dentro, os graves ficam fortes
    const aE = PT.ss((t - pD) / 0.5);
    if (aE > 0.01) espectro(x, 540, 1150, 820, 420, PT.ss((t - tG + 0.2) / 0.6), CI, aE, "a sua voz por dentro");
  });
};

// =============== 3. o gravador ===============
CENAS.gravacao = (el, c, B) => {
  const tA = B("ar2"), tF = B("fina"), tAd = B("adivinha"), tAu = B("audio2"), tD = B("dentro2");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["gra", 330, 66, "o gravador só pega o ar", "pt-ci"], ["fin", 330, 76, "mais fina", "pt-ve"], ["adv", 330, 70, "adivinha qual é a real?", "pt-am"], ["aud", 330, 76, "a do áudio", "pt-ve"], ["den", 330, 62, "a de dentro: só você", "pt-ci"]]);
  MD.slam(tl, tx.gra, tA - 0.3, { from: 1.25 }); MD.leave(tl, tx.gra, tF - 0.35); MD.slam(tl, tx.fin, tF - 0.05, { from: 1.35 }); MD.leave(tl, tx.fin, tAd - 0.35); MD.slam(tl, tx.adv, tAd - 0.05, { from: 1.3 }); MD.leave(tl, tx.adv, tAu - 0.35); MD.slam(tl, tx.aud, tAu - 0.05, { from: 1.45 }); MD.leave(tl, tx.aud, tD - 0.6); MD.slam(tl, tx.den, tD - 0.3, { from: 1.25 });
  const est = estF(7);
  const pB = tF - 0.5, pC = tAd - 0.5, pD = tAu - 0.4;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o microfone só pega as ondas do ar
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { perfilLinha(x, 300, 980, 1.0, aA); fCaixa(x, 820, 980, 90, 170, 45, BRC, aA, 6, 0.15); linhaP(x, 820, 1065, 820, 1200, BRC, aA, 8); for (let k = 0; k < 4; k++) { const u = ((t * 0.6 + k / 4) % 1); x.beginPath(); x.arc(560, 1120, 40 + u * 220, -0.5, 0.5); x.strokeStyle = `rgba(${CI},${aA * (1 - u)})`; x.lineWidth = 5; x.stroke(); } }
    // plano B: sem os ossos, os graves somem
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) espectro(x, 540, 1150, 820, 420, 1 - PT.ss((t - tF + 0.3) / 0.6), CI, aB, "a voz gravada");
    // plano C: as duas versões — qual é a real?
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { msgAudio(x, 540, 820, 0.9, aC, t, LA); rotuloP(x, "por dentro", 540, 720, 34, "255,200,150", aC); msgAudio(x, 540, 1180, 0.9, aC, t, CI); rotuloP(x, "no áudio", 540, 1080, 34, "180,230,255", aC); rotuloP(x, "?", 900, 1000, 120, AM, aC); }
    // plano D: todo mundo ouve a do áudio; a de dentro é só sua
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { for (let k = 0; k < 7; k++) { const px = 150 + k * 130, q = PT.ss((t - pD - k * 0.08) / 0.3); fPessoa(x, px, 1180, 1.3, CI, aD * q); } msgAudio(x, 540, 880, 0.9, aD, t, CI); const aM = PT.ss((t - tD + 0.5) / 0.4); if (aM > 0) { fPessoa(x, 540, 1400, 1.0, LA, aD * aM); } }
  });
};

// =============== 4. por que incomoda ===============
CENAS.choque = (el, c, B) => {
  const tT = B("tanto"), tR = B("repente"), tE = B("espelho"), tN = B("normal");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["inc", 330, 70, "por que incomoda?", "pt-am"], ["fam", 330, 62, "o familiar mudou de repente", "pt-ci", "white-space:normal;left:60px;width:960px"], ["ros", 330, 66, "com o rosto é igual", "pt-am"]]);
  MD.slam(tl, tx.inc, tT - 0.1, { from: 1.3 }); MD.leave(tl, tx.inc, tR - 1.6); MD.slam(tl, tx.fam, tR - 1.3, { from: 1.25 }); MD.leave(tl, tx.fam, tE - 2.6); MD.slam(tl, tx.ros, tE - 2.3, { from: 1.3 });
  const est = estF(9);
  const pB = tE - 2.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: algo familiar que muda de repente (o rosto conhecido "pula")
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { const pulo = PT.ss((t - tR + 0.4) / 0.3); rostoC(x, 540 + Math.sin(t * 30) * 8 * pulo * (1 - PT.ss((t - tR) / 0.6)), 1000, 1.6, aA, pulo > 0.5, pulo > 0.5 ? VE : BRC); if (pulo > 0.5) rotuloP(x, "!", 830, 760, 130, VE, aA); }
    // plano B: a sua foto espelhada (você prefere) x a foto normal (os amigos preferem)
    const aB = PT.ss((t - pB) / 0.5);
    if (aB > 0.01) { rostoC(x, 300, 980, 1.0, aB, true, AM); rostoC(x, 780, 980, 1.0, aB, false, CI); rotuloP(x, "espelhada", 300, 1220, 36, "255,226,140", aB); rotuloP(x, "normal", 780, 1220, 36, "180,230,255", aB); const aV = PT.ss((t - tE + 0.4) / 0.4), aN = PT.ss((t - tN + 0.4) / 0.4); if (aV > 0) { fPessoa(x, 300, 1380, 1.0, AM, aB * aV); rotuloP(x, "você", 300, 1460, 30, "255,226,140", aB * aV); estrelasG(x, 300 + 160, 760, 1.6, 5, aB * aV); } if (aN > 0) { for (let k = 0; k < 3; k++) fPessoa(x, 700 + k * 80, 1380, 0.9, CI, aB * aN); rotuloP(x, "amigos", 780, 1460, 30, "180,230,255", aB * aN); estrelasG(x, 780 + 160, 760, 1.6, 5, aB * aN); } }
  });
};

// =============== 5. o experimento ===============
CENAS.experimento = (el, c, B) => {
  const tO = B("oitenta"), tE = B("escondida"), tP = B("percebeu"), tA = B("alta");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ano", 330, 62, "2013: 80 pessoas", "pt-ci"], ["esc", 330, 62, "a sua voz, escondida no meio", "pt-am", "white-space:normal;left:60px;width:960px"], ["per", 330, 66, "quase ninguém percebeu", "pt-ci"], ["alt", 330, 62, "nota mais alta pra própria voz", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.ano, tO - 0.3, { from: 1.25 }); MD.leave(tl, tx.ano, tE - 0.35); MD.slam(tl, tx.esc, tE - 0.05, { from: 1.2 }); MD.leave(tl, tx.esc, tP - 0.35); MD.slam(tl, tx.per, tP - 0.05, { from: 1.25 }); MD.leave(tl, tx.per, tA - 0.35); MD.slam(tl, tx.alt, tA - 0.05, { from: 1.2 });
  const est = estF(11);
  const pB = tE - 0.5, pC = tA - 0.6;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: 80 pessoas com fone
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) for (let k = 0; k < 80; k++) { const col = k % 10, lin = Math.floor(k / 10), q = PT.ss((t - c.ini - 0.2 - k * 0.02) / 0.3); discoP(x, 150 + col * 87, 640 + lin * 95, 16, CI, aA * q); fCaixa(x, 150 + col * 87, 670 + lin * 95, 34, 30, 12, CI, aA * q * 0.7, 2, 0.15); }
    // plano B: várias vozes; uma é a sua (escondida)
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { for (let k = 0; k < 5; k++) { const sua = k === 2, y = 720 + k * 150; msgAudio(x, 540, y, 0.85, aB, t + k, sua && t > tP - 0.3 ? AM : CI); if (sua) rotuloP(x, t > tP - 0.3 ? "era você!" : "?", 920, y, 36, "255,226,140", aB); } }
    // plano C: as notas — você dá mais pra própria voz
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { const h = PT.ss((t - tA + 0.2) / 0.6); fCaixa(x, 360, 1250 - 200 * h, 170, 400 * h + 1, 12, AM, aC, 5, 0.3); fCaixa(x, 720, 1250 - 130 * h, 170, 260 * h + 1, 12, CI, aC, 5, 0.3); rotuloP(x, "você deu", 360, 1310, 36, "255,226,140", aC); rotuloP(x, "os outros", 720, 1310, 36, "180,230,255", aC); estrelasG(x, 360 + 160, 760, 1.4, 5, aC * h); estrelasG(x, 720 + 160, 900, 1.4, 3, aC * h); }
  });
};

// =============== 6. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tV = B("verdade"), tO = B("outros"), tT = B("teoria");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["ver", 330, 62, "quem ouve a voz de verdade?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["teo", 330, 80, "qual a sua teoria?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, tV - 1.6); MD.slam(tl, tx.ver, tV - 1.3, { from: 1.2 }); MD.leave(tl, tx.ver, tT - 0.35); MD.slam(tl, tx.teo, tT - 0.05, { from: 1.4 });
  const nv = T.nuvem(15100), est = estF(21);
  const pB = tV - 1.4, pC = tT - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    balaoCom(x, 540, 960, 1.2, PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4)), "?", t);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { cabeca(nv, 330, 1000, 0.8, aB, 1, t); rotuloP(x, "você", 330, 1310, 36, "255,200,150", aB); rotuloP(x, "ou", 620, 1000, 50, "255,255,255", aB); for (let k = 0; k < 3; k++) fPessoa(x, 760 + k * 90, 1060, 1.2, CI, aB * PT.ss((t - tO + 0.6) / 0.4)); rotuloP(x, "os outros", 850, 1310, 36, "180,230,255", aB * PT.ss((t - tO + 0.6) / 0.4)); } else nv.total(nv.k);
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { balaoCom(x, 540, 900, 1.1, aC, "?", t); setaComent(x, aC, t); }
  });
};

// =============== 7. o teste prometido ===============
CENAS.teste = (el, c, B) => {
  const tP = B("prometi"), tD = B("dedos"), tG = B("grave2"), tO = B("ossos2"), tC = B("conhece");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pro", 330, 66, "o teste prometido", "pt-am"], ["ded", 330, 62, "dedos nos ouvidos + fala", "pt-ci"], ["gra", 330, 76, "mais grave", "pt-am"], ["con", 330, 62, "a voz que só você conhece", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.pro, tP - 0.2, { from: 1.3 }); MD.leave(tl, tx.pro, tD - 0.35); MD.slam(tl, tx.ded, tD - 0.05, { from: 1.25 }); MD.leave(tl, tx.ded, tG - 0.35); MD.slam(tl, tx.gra, tG - 0.05, { from: 1.4 }); MD.leave(tl, tx.gra, tC - 0.6); MD.slam(tl, tx.con, tC - 0.3, { from: 1.25 });
  const nv = T.nuvem(15100), est = estF(13);
  const pB = tD - 0.4, pC = tO - 0.6;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { dedoOuvido(x, 400, 960, 2.4, 1, aA); dedoOuvido(x, 680, 960, 2.4, -1, aA); }
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { perfilLinha(x, 380, 900, 1.1, aB); dedoOuvido(x, 360, 920, 1.3, 1, aB); espectro(x, 540, 1330, 700, 260, PT.ss((t - tG + 0.3) / 0.5) * 1.2, CI, aB, "dedo no ouvido"); } 
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { cabeca(nv, 470, 1000, 1.2, aC, 1, t); brilhoP(x, 470 + OUVIDO[0] * 1.2, 1000 + OUVIDO[1] * 1.2, 160, LA, 0.6 * aC); } else nv.total(nv.k);
  });
};

// =============== 8. resumo relâmpago + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [560, 720, 880], textos = ["por dentro: os ossos engrossam", "o gravador só pega o ar", "a do áudio é a que todos ouvem"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    msgAudio(x, 540, 1240, 0.8, 0.7 * sai * PT.ss((t - c.ini) / 0.5), t);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [LA, CI, VD][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
