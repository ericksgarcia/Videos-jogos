// Cenas do vídeo "Por que sentimos cheiro de chuva antes de ela começar" — pontos de luz na GPU.
// Retenção: situação do dia a dia (o cheiro antes da gota), paradoxo (ainda não choveu), promessa
// (o sinal de tempestade perigosa), mito (água não tem cheiro), assombro (o nariz detetive) e dica.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", OZ = "190,170,255", TERRA = "220,160,100";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.4);

// nuvem de tempestade em pontos (GPU)
const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
const NUVEM = (() => { const r = prng(21), o = []; const bolas = [[0, 0, 1], [-0.55, 0.1, 0.75], [0.55, 0.08, 0.8], [-0.25, -0.35, 0.7], [0.3, -0.32, 0.65], [-0.9, 0.25, 0.5], [0.9, 0.25, 0.55]]; for (let i = 0; i < 14000; i++) { const b = bolas[Math.floor(r() * bolas.length)], a = r() * 6.283, d = Math.sqrt(r()) * b[2]; const y = b[1] + Math.sin(a) * d * 0.55; if (y > 0.42) continue; o.push({ x: b[0] + Math.cos(a) * d, y, n: r() }); } return o; })();
function nuvemP(nv, cx, cy, esc, t, a, raio = 0) { let i = nv.k; for (const p of NUVEM) { const luz = raio * Math.exp(-Math.pow((p.x - 0.2) * 2, 2)); const sombra = 0.35 + 0.5 * (0.5 - p.y); const c = mixC([0.55, 0.6, 0.85], [0.92, 0.92, 1.0], PT.cl(sombra + luz)); nv.ponto(i++, cx + (p.x + Math.sin(t * 0.2 + p.n * 6) * 0.01) * esc, cy + p.y * esc, c[0], c[1], c[2], a * (0.45 + 0.4 * p.n + 0.6 * luz), 4.4); } nv.total(i); }
// raio em zigue-zague
function raioZ(x, x0, y0, x1, y1, seed, a) { if (a <= 0.01) return; const r = prng(seed); const pts = [[x0, y0]]; for (let k = 1; k < 9; k++) { const u = k / 9; pts.push([PT.lerp(x0, x1, u) + (r() - 0.5) * 70, PT.lerp(y0, y1, u)]); } pts.push([x1, y1]); for (const [w, cor, al] of [[14, "160,150,255", 0.35], [5, "255,255,255", 1]]) { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); pts.forEach((p) => x.lineTo(p[0], p[1])); x.strokeStyle = `rgba(${cor},${al * a})`; x.lineWidth = w; x.stroke(); } brilhoP(x, x1, y1, 160, "200,190,255", 0.5 * a); }
// rosto de perfil (olhando para a esquerda) com nariz
function perfil(x, cx, cy, s, cor, a) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx + 60 * s, cy - 170 * s); x.quadraticCurveTo(cx - 50 * s, cy - 170 * s, cx - 60 * s, cy - 60 * s); x.lineTo(cx - 105 * s, cy - 5 * s); x.lineTo(cx - 62 * s, cy + 12 * s); x.quadraticCurveTo(cx - 75 * s, cy + 60 * s, cx - 55 * s, cy + 75 * s); x.quadraticCurveTo(cx - 60 * s, cy + 140 * s, cx + 10 * s, cy + 150 * s); x.lineTo(cx + 40 * s, cy + 230 * s); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 6 * s; x.lineJoin = "round"; x.stroke(); brilhoP(x, cx - 90 * s, cy, 70 * s, cor, 0.35 * a); }
// "fios" de cheiro ondulando de (x0,y0) até (x1,y1)
function cheiro(x, x0, y0, x1, y1, t, cor, a, n = 3) { if (a <= 0.01) return; for (let k = 0; k < n; k++) { x.beginPath(); for (let q = 0; q <= 30; q++) { const u = q / 30, px = PT.lerp(x0, x1, u), py = PT.lerp(y0, y1, u) + Math.sin(u * 12 - t * 4 + k * 2) * 18 + (k - (n - 1) / 2) * 26; q ? x.lineTo(px, py) : x.moveTo(px, py); } x.strokeStyle = `rgba(${cor},${a * 0.7})`; x.lineWidth = 5; x.stroke(); } }
// molécula: discos ligados
function molecula(x, cx, cy, n, r, cor, a, ang = 0, sep = 1) { if (a <= 0.01) return; const pts = n === 2 ? [[-1, 0], [1, 0]] : [[-1.15, 0.45], [0, -0.35], [1.15, 0.45]]; pts.forEach(([u, v], k) => { const px = cx + (u * Math.cos(ang) - v * Math.sin(ang)) * r * 0.9 * sep, py = cy + (u * Math.sin(ang) + v * Math.cos(ang)) * r * 0.9 * sep; if (k) { const [u0, v0] = pts[k - 1]; linhaP(x, cx + (u0 * Math.cos(ang) - v0 * Math.sin(ang)) * r * 0.9 * sep, cy + (u0 * Math.sin(ang) + v0 * Math.cos(ang)) * r * 0.9 * sep, px, py, cor, a * (sep < 1.3 ? 1 : 0.2), 5); } discoP(x, px, py, r * 0.62, cor, 0.55 * a); anelP(x, px, py, r * 0.62, "255,255,255", 0.8 * a, 3); }); brilhoP(x, cx, cy, r * 2, cor, 0.3 * a); }
// chão de terra em pontos (GPU)
const CHAO = (() => { const r = prng(31), o = []; for (let i = 0; i < 7000; i++) o.push({ x: r() * 1080, y: r() * 150, n: r() }); return o; })();
function chao(nv, y0, a, molhado = 0) { let i = nv.k; for (const p of CHAO) { const c = mixC([0.85, 0.6, 0.38], [0.55, 0.38, 0.28], molhado); nv.ponto(i++, p.x, y0 + p.y, c[0], c[1], c[2], a * (0.25 + 0.35 * p.n), 3); } nv.total(i); }
function gotasCaindo(x, t, x0, x1, y0, y1, n, a, seed = 5) { if (a <= 0.01) return; const r = prng(seed); for (let k = 0; k < n; k++) { const px = x0 + r() * (x1 - x0), u = (t * (0.8 + r() * 0.5) + r()) % 1, py = y0 + u * (y1 - y0); linhaP(x, px, py, px - 3, py + 28, CI, a * 0.75 * Math.sin(u * Math.PI), 3); } }

// =============== 1. gancho ===============
// seta para o botão de comentários (lateral direita do TikTok/Reels/Shorts, ~y 1250)
function setaComent(x, a, t) { if (a <= 0.01) return; const b = Math.sin(t * 6) * 16; fSeta(x, 700 + b, 1250, 900 + b, 1250, AM, a, 12); brilhoP(x, 1010, 1250, 90, AM, 0.35 * a * (0.7 + 0.3 * Math.sin(t * 6))); rotuloP(x, "comentários", 780, 1180, 38, "255,226,140", a); }
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 330 * s, 60 * s, CI, a, 8 * s, 0.12);
  x.beginPath(); x.moveTo(cx - 120 * s, cy + 160 * s); x.lineTo(cx - 190 * s, cy + 250 * s); x.lineTo(cx - 40 * s, cy + 160 * s); x.fillStyle = `rgba(${CI},${0.5 * a})`; x.fill();
  brilhoP(x, cx, cy, 380 * s, CI, 0.18 * a); rotuloP(x, txt, cx, cy + 6 * s, 190 * s, "255,226,140", a * (0.85 + 0.15 * Math.sin(t * 4)));
}
function gotaG(x, cx, cy, s, a, cor = CI) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx, cy - 110 * s); x.quadraticCurveTo(cx + 100 * s, cy + 70 * s, cx, cy + 110 * s); x.quadraticCurveTo(cx - 100 * s, cy + 70 * s, cx, cy - 110 * s); x.fillStyle = `rgba(${cor},${0.25 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 6 * s; x.stroke(); }
function marG(x, t, y0, a) { if (a <= 0.01) return; for (let k = 0; k < 7; k++) { x.beginPath(); for (let px = 0; px <= 1080; px += 14) { const py = y0 + k * 60 + Math.sin(px * 0.012 + t * (1.2 + k * 0.1) + k) * (10 + k * 3); px ? x.lineTo(px, py) : x.moveTo(px, py); } x.strokeStyle = `rgba(${CI},${a * (0.7 - k * 0.07)})`; x.lineWidth = 4; x.stroke(); } }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tR0 = B("raio0"), tC = B("chover"), tG = B("gota"), tCh = B("cheirando"), tD = B("dois"), tP = B("promessa");
  const p2 = tC - 1.6, p3 = tD - 2.2, p4 = tP - 1.2;
  mostrarGancho(p2 - 0.2);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["vai", 330, 76, "vai chover?", "pt-ci"], ["ain", 330, 62, "mas ainda não choveu", "pt-ci"], ["dois", 330, 92, "2 cheiros", "pt-am"], ["sin", 330, 62, "o sinal de perigo: no final", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.vai, tC - 0.1, { from: 1.3 }); MD.leave(tl, tx.vai, tG - 0.3); MD.arrive(tl, tx.ain, tG - 0.1, { y: 14 }); MD.leave(tl, tx.ain, tD - 0.35);
  MD.slam(tl, tx.dois, tD - 0.05, { from: 1.45 }); MD.leave(tl, tx.dois, p4); MD.slam(tl, tx.sin, p4 + 0.2, { from: 1.25 });
  const nv = T.nuvem(14100), est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    const fl = (t0) => (t > t0 - 0.05 ? Math.exp(-Math.max(0, t - t0) * 4) : 0);
    // plano 1 (quadro 0): o raio cai e o ozônio vem até o nariz
    const a1 = 1 - PT.ss((t - p2) / 0.4);
    if (a1 > 0.01) {
      const flash = Math.max(fl(0.15), fl(tR0 - 0.1), 0.7 * fl(tR0 + 0.35));
      nuvemP(nv, 540, 620, 520, t, 0.9 * a1, flash); raioZ(x, 300, 760, 180, 1300, 7, flash * 1.3 * a1); perfil(x, 820, 1150, 1.3, "255,226,190", a1);
      for (let k = 0; k < 6; k++) { const u = ((t * 0.18 + k / 6) % 1); molecula(x, PT.lerp(220, 700, u), PT.lerp(1250, 1060, u) + Math.sin(u * 9 + k) * 30, 3, 20, OZ, a1 * Math.sin(u * Math.PI) * PT.ss((t - 0.3) / 0.6), u * 3 + k, 1); }
    } else if (t < p4) nv.total(nv.k);
    // plano 2: o cheiro chega antes da primeira gota (a gota parada no ar)
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { perfil(x, 760, 1100, 1.6, "255,226,190", a2); cheiro(x, 80, 980, 600, 1080, t, "200,215,255", a2, 3); const aG = PT.ss((t - tG + 0.4) / 0.4); gotaG(x, 360, 720, 0.6, a2 * aG); if (aG > 0) rotuloP(x, "?", 470, 640, 90, AM, a2 * aG); }
    // plano 3: dois cheiros diferentes
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) { perfil(x, 860, 1080, 1.4, "255,226,190", a3); cheiro(x, 60, 860, 700, 1020, t, OZ, a3, 2); cheiro(x, 60, 1300, 700, 1090, t + 1, TERRA, a3 * PT.ss((t - tD + 0.2) / 0.4), 2); rotuloP(x, "1", 120, 800, 70, "200,185,255", a3); rotuloP(x, "2", 120, 1370, 70, "255,200,150", a3 * PT.ss((t - tD + 0.2) / 0.4)); }
    // plano 4: o alerta de tempestade (teaser)
    const a4 = PT.ss((t - p4) / 0.5);
    if (a4 > 0.01) { nuvemP(nv, 540, 820, 420, t, 0.7 * a4, 0.3 * Math.max(0, Math.sin(t * 5))); raioZ(x, 560, 980, 500, 1300, Math.floor(t * 2), a4 * Math.max(0, Math.sin(t * 5))); fCaixa(x, 820, 1200, 120, 120, 60, VE, a4, 6, 0.15); rotuloP(x, "!", 820, 1205, 90, "255,140,160", a4); }
  });
};

// =============== 2. o primeiro: o raio ===============
CENAS.ozonio = (el, c, B) => {
  const tR = B("raio"), tQ = B("quebra"), tO = B("ozonio"), tC = B("cloro"), tD = B("descem"), tE = B("estranho");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["um", 330, 76, "1º: o raio", "pt-ci"], ["sol", 330, 62, "5x mais quente que o Sol", "pt-am"], ["oz", 330, 90, "OZÔNIO", "pt-ci"], ["clo", 430, 50, "cheiro de cloro, de limpo", "pt-fino"], ["des", 330, 64, "o vento traz até você", "pt-am"], ["est", 330, 62, "o 2º é mais estranho", "pt-ve"]]);
  MD.slam(tl, tx.um, tR - 0.1, { from: 1.3 }); MD.leave(tl, tx.um, tR + 1.3); MD.slam(tl, tx.sol, tR + 1.6, { from: 1.3 }); MD.leave(tl, tx.sol, tO - 0.4);
  MD.slam(tl, tx.oz, tO - 0.05, { from: 1.4 }); MD.arrive(tl, tx.clo, tC - 0.2, { y: 14 }); MD.leave(tl, [tx.oz, tx.clo], tD - 0.4); MD.slam(tl, tx.des, tD - 0.05, { from: 1.3 }); MD.leave(tl, tx.des, tE - 1.4); MD.slam(tl, tx.est, tE - 1.1, { from: 1.25 });
  const nv = T.nuvem(14100), est = estF(5);
  const pB = tQ - 0.8, pC = tD - 0.6, pD = tE - 1.3;
  T.quadro((x, t) => {
    estD(x, est, t);
    const fl = 0.5 + 0.5 * Math.sin(t * 7) * Math.sin(t * 2.3);
    // plano A: o raio x o Sol
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { raioZ(x, 330, 560, 260, 1320, Math.floor(t * 3), aA * (0.7 + 0.3 * fl)); const aS = PT.ss((t - tR - 1.4) / 0.5); brilhoP(x, 760, 960, 260, "255,200,80", 0.5 * aA * aS); discoP(x, 760, 960, 110, "255,200,80", 0.6 * aA * aS); rotuloP(x, "Sol", 760, 1130, 40, "255,226,140", aA * aS); rotuloP(x, "raio", 330, 1380, 40, "200,190,255", aA * aS); if (aS > 0) for (let k = 0; k < 5; k++) { const q = PT.ss((t - tR - 2.0 - k * 0.15) / 0.2); discoP(x, 520 + k * 34, 640, 12, "255,140,160", aA * q); } }
    // plano B: o oxigênio se quebra e vira ozônio
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { nuvemP(nv, 540, 560, 480, t, 0.6 * aB, 0.4 * fl); raioZ(x, 540, 700, 470, 1050, Math.floor(t * 3), aB * (0.5 + 0.4 * fl)); const sep = 1 + 1.2 * PT.ss((t - tQ) / 0.6) * (1 - PT.ss((t - tO + 0.6) / 0.6)), v3 = PT.ss((t - tO + 0.6) / 0.6); for (let k = 0; k < 3; k++) { const px = 260 + k * 280, py = 1100 + Math.sin(t * 1.5 + k) * 10; if (v3 < 0.5) molecula(x, px, py, 2, 44, "150,200,255", aB, 0.3 * k, sep); else molecula(x, px, py, 3, 44, "190,170,255", aB, 0.3 * k, 1); } rotuloP(x, v3 < 0.5 ? "O2 (oxigênio)" : "O3 (ozônio)", 540, 1260, 42, v3 < 0.5 ? "150,200,255" : "200,185,255", aB); } else if (t < pD) nv.total(nv.k);
    // plano C: o vento que desce da nuvem traz o ozônio até o nariz
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { nuvemP(nv, 540, 560, 440, t, 0.6 * aC, 0.2 * fl); for (let k = 0; k < 4; k++) fSeta(x, 300 + k * 130, 760, 330 + k * 150, 1180, "200,215,255", aC * 0.7, 5); const r = prng(3); for (let q = 0; q < 40; q++) { const u = ((t - pC) * 0.35 + r()) % 1, px = PT.lerp(300 + r() * 400, 760, u), py = PT.lerp(720, 1200, u); molecula(x, px, py, 3, 9, "190,170,255", aC * Math.sin(u * Math.PI), u * 5, 1); } perfil(x, 860, 1170, 1.0, "255,226,190", aC); brilhoP(x, 760, 1170, 120, "190,170,255", 0.4 * aC); }
    // plano D: o chão seco com "?" — o segundo cheiro
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { chao(nv, 1150, aD, 0); rotuloP(x, "?", 540, 900, 170, AM, aD * (0.85 + 0.15 * Math.sin(t * 4))); }
  });
};

// =============== 3. o segundo: a terra molhada ===============
CENAS.petricor = (el, c, B) => {
  const tT = B("terra"), tA = B("agua"), tG = B("geosmina"), tBo = B("bolhinhas"), tRf = B("refri"), tAd = B("adivinha");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ter", 330, 70, "terra molhada", "pt-am"], ["agu", 330, 62, "água pura: sem cheiro", "pt-ve"], ["geo", 330, 80, "GEOSMINA", "pt-ci"], ["bol", 330, 66, "bolhinhas sobem", "pt-ci"], ["ref", 330, 66, "igual refrigerante", "pt-am"], ["adv", 330, 76, "adivinha: quanto?", "pt-am"]]);
  MD.slam(tl, tx.ter, tT - 0.1, { from: 1.3 }); MD.leave(tl, tx.ter, tA - 0.35); MD.slam(tl, tx.agu, tA - 0.05, { from: 1.25 }); MD.leave(tl, tx.agu, tG - 1.6);
  MD.slam(tl, tx.geo, tG - 0.1, { from: 1.4 }); MD.leave(tl, tx.geo, tBo - 0.4); MD.slam(tl, tx.bol, tBo - 0.05, { from: 1.25 }); MD.leave(tl, tx.bol, tRf - 0.35); MD.slam(tl, tx.ref, tRf - 0.05, { from: 1.25 }); MD.leave(tl, tx.ref, tAd - 0.35); MD.slam(tl, tx.adv, tAd - 0.05, { from: 1.35 });
  const nv = T.nuvem(7100), est = estF(7), Y0 = 1180;
  const pB = tA + 2.6, pC = tBo - 0.9, pD = tAd - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: a gota de água pura não tem cheiro
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { chao(nv, 1250, aA, PT.ss((t - tT) / 1.5)); gotaG(x, 540, 860, 1.4, aA); const aX = PT.ss((t - tA + 0.2) / 0.3); linhaP(x, 400, 1060, 680, 1060, VE, aA * aX, 6); rotuloP(x, "sem cheiro", 540, 1120, 44, "255,170,180", aA * aX); } else if (t < pD) nv.total(nv.k);
    // plano B: dentro da terra, as bactérias fazem geosmina
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { fCaixa(x, 540, 1000, 900, 560, 40, TERRA, aB * 0.6, 5, 0.08); const r = prng(10); for (let k = 0; k < 30; k++) { const px = 140 + r() * 800, py = 760 + r() * 480, an = r() * 3 + t * 0.3; linhaP(x, px - Math.cos(an) * 16, py - Math.sin(an) * 16, px + Math.cos(an) * 16, py + Math.sin(an) * 16, VD, aB * (0.6 + 0.4 * Math.sin(t * 3 + k)), 9); } const aG = PT.ss((t - tG + 0.3) / 0.4); for (let k = 0; k < 14; k++) { const u = ((t * 0.3 + k / 14) % 1), px = 160 + (k * 67) % 760, py = 1220 - u * 480; molecula(x, px, py, 3, 12, "255,200,150", aB * aG * Math.sin(u * Math.PI), u * 4, 1); } rotuloP(x, "bactérias da terra", 540, 1330, 34, "150,255,200", aB); }
    // plano C: câmera lenta — a gota bate e solta bolhinhas (igual refrigerante)
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { chao(nv, Y0, aC, 1); const u = PT.ss((t - pC) / 0.9); gotaG(x, 540, PT.lerp(600, Y0 - 60, u), 0.7 * (1 - 0.5 * PT.ss((t - pC - 0.8) / 0.3)), aC * (1 - PT.ss((t - pC - 0.9) / 0.3))); const aBo = PT.ss((t - tBo + 0.3) / 0.4); const r = prng(12); for (let k = 0; k < 50; k++) { const px = 540 + (r() - 0.5) * 520, v = (t * 0.45 + r()) % 1, py = Y0 - v * 520; anelP(x, px + Math.sin(v * 9 + k) * 14, py, 5 + 8 * v, TERRA, aC * aBo * Math.sin(v * Math.PI), 3); } const aR = PT.ss((t - tRf + 0.3) / 0.4); if (aR > 0) { fCaixa(x, 900, 900, 150, 260, 20, CI, aC * aR, 5, 0.06); for (let k = 0; k < 10; k++) { const v = (t * 0.6 + k / 10) % 1; anelP(x, 860 + (k * 23) % 80, 1010 - v * 200, 6, CI, aC * aR * Math.sin(v * Math.PI), 2); } } }
    // plano D: o nariz e o "quanto?"
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { perfil(x, 700, 1000, 1.8, "255,226,190", aD); cheiro(x, 60, 980, 500, 1000, t, TERRA, aD, 2); rotuloP(x, "?", 860, 720, 150, AM, aD * (0.85 + 0.15 * Math.sin(t * 4))); }
  });
};

// =============== 4. o seu nariz ===============
CENAS.nariz = (el, c, B) => {
  const tN = B("nada"), tT = B("trilhao"), tP = B("piscina"), tA = B("antepassados");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["nad", 330, 90, "quase nada", "pt-ve"], ["tri", 330, 66, "partes por TRILHÃO", "pt-am"], ["pis", 330, 60, "gotinhas numa piscina olímpica", "pt-ci", "white-space:normal;left:60px;width:960px"], ["ach", 330, 66, "faro pra achar água", "pt-ci"]]);
  MD.slam(tl, tx.nad, tN - 0.05, { from: 1.45 }); MD.leave(tl, tx.nad, tT - 0.35); MD.slam(tl, tx.tri, tT - 0.05, { from: 1.35 }); MD.leave(tl, tx.tri, tP - 0.35); MD.slam(tl, tx.pis, tP - 0.05, { from: 1.25 }); MD.leave(tl, tx.pis, tA - 0.4); MD.slam(tl, tx.ach, tA - 0.1, { from: 1.3 });
  const nv = T.nuvem(20100), est = estF(9);
  const PISC = (() => { const r = prng(14), o = []; for (let i = 0; i < 20000; i++) o.push({ x: r(), y: r(), n: r() }); return o; })();
  const pB = tT - 1.0, pC = tA - 0.8;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: um pontinho só, quase nada
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { const z = PT.lerp(1, 0.4, PT.ss((t - tN) / 1.5)); discoP(x, 540, 960, 18 * z, "255,200,150", aA); brilhoP(x, 540, 960, 160 * z, "255,200,150", 0.6 * aA); perfil(x, 820, 980, 1.6, "255,226,190", aA * 0.8); }
    // plano B: a piscina olímpica de pontos azuis e umas gotinhas douradas
    const aB = planoC(t, pB, pC); let i = nv.k;
    if (aB > 0.01) for (const p of PISC) nv.ponto(i++, 120 + p.x * 840, 760 + p.y * 460, 0.3, 0.65, 1.0, aB * (0.18 + 0.25 * Math.sin(t * 2 + p.n * 12)), 3);
    nv.total(i);
    if (aB > 0.01) { fCaixa(x, 540, 990, 860, 480, 10, CI, aB, 5, 0); rotuloP(x, "piscina olímpica", 540, 1290, 34, "180,220,255", aB); const aG = PT.ss((t - tP + 0.2) / 0.4); for (const [px, py] of [[700, 950], [430, 1080], [610, 1150]]) { discoP(x, px, py, 9, AM, aB * aG); brilhoP(x, px, py, 50, AM, 0.6 * aB * aG); } }
    // plano C: um antepassado farejando a água
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { fPessoa(x, 330, 1080, 2.6, "255,226,190", aC); cheiro(x, 900, 1000, 420, 960, t, TERRA, aC, 2); x.beginPath(); x.ellipse(860, 1200, 160, 46, 0, 0, 6.283); x.fillStyle = `rgba(${CI},${0.35 * aC})`; x.fill(); x.strokeStyle = `rgba(${CI},${aC})`; x.lineWidth = 4; x.stroke(); }
  });
};

// =============== 5. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tO = B("oceano"), tCh = B("chuta");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["oce", 330, 62, "chuva no meio do oceano?", "pt-ci"], ["chu", 330, 62, "chuta nos comentários", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, tO - 1.6);
  MD.slam(tl, tx.oce, tO - 1.3, { from: 1.25 }); MD.leave(tl, tx.oce, tCh - 0.35); MD.slam(tl, tx.chu, tCh - 0.05, { from: 1.3 });
  const nv = T.nuvem(14100), est = estF(21);
  const pB = tO - 1.6, pC = tCh - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    balaoCom(x, 540, 960, 1.2, PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4)), "?", t);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { nuvemP(nv, 540, 600, 460, t, 0.7 * aB, 0); gotasCaindo(x, t, 60, 1020, 700, 1000, 50, aB); marG(x, t, 1000, aB); rotuloP(x, "?", 540, 860, 130, AM, aB * 0.9); } else nv.total(nv.k);
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { balaoCom(x, 540, 900, 1.1, aC, "?", t); setaComent(x, aC, t); }
  });
};

// =============== 6. o sinal prometido ===============
CENAS.dica = (el, c, B) => {
  const tS = B("sinal"), tV = B("vento"), tR = B("raios"), tA = B("abrigo");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pro", 330, 66, "o sinal prometido", "pt-am"], ["clo", 330, 66, "cheiro de cloro", "pt-ci"], ["ven", 330, 62, "+ vento frio e forte", "pt-ci"], ["rai", 330, 76, "= raios chegando", "pt-ve"], ["abr", 330, 76, "procure abrigo", "pt-ve"]]);
  MD.slam(tl, tx.pro, tS - 0.1, { from: 1.3 }); MD.leave(tl, tx.pro, tS + 1.4); MD.slam(tl, tx.clo, tS + 1.7, { from: 1.25 }); MD.leave(tl, tx.clo, tV - 0.35); MD.slam(tl, tx.ven, tV - 0.05, { from: 1.25 }); MD.leave(tl, tx.ven, tR - 0.35); MD.slam(tl, tx.rai, tR - 0.05, { from: 1.35 }); MD.leave(tl, tx.rai, tA - 0.4); MD.slam(tl, tx.abr, tA - 0.05, { from: 1.35 });
  const nv = T.nuvem(14100), est = estF(11);
  const pB = tV - 0.6, pC = tR - 0.4, pD = tA - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o cheiro de cloro chegando no nariz
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { perfil(x, 760, 1050, 1.8, "255,226,190", aA); for (let k = 0; k < 8; k++) { const u = ((t * 0.25 + k / 8) % 1); molecula(x, PT.lerp(100, 560, u), 1000 + Math.sin(u * 8 + k) * 60, 3, 18, OZ, aA * Math.sin(u * Math.PI), u * 3, 1); } }
    // plano B: o vento frio e forte de repente
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { fPessoa(x, 760, 1200, 2.4, "255,226,190", aB); for (let k = 0; k < 5; k++) { const u = ((t - pB) * 0.9 + k / 5) % 1; fSeta(x, 40 + u * 420, 900 + k * 80, 220 + u * 420, 910 + k * 80, "220,230,255", aB * Math.sin(u * Math.PI), 6); } linhaP(x, 960, 900, 960, 1180, "255,255,255", aB * 0.5, 14); linhaP(x, 960, 1180, 960, PT.lerp(960, 1120, PT.ss((t - tV) / 1)), CI, aB, 10); discoP(x, 960, 1195, 22, CI, aB); }
    // plano C: a tempestade com raios
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { const fl = Math.max(0, Math.sin(t * 5) * Math.sin(t * 1.7)); nuvemP(nv, 540, 640, 520, t, 0.9 * aC, fl); raioZ(x, 380, 780, 300, 1250, Math.floor(t * 2), fl * 1.4 * aC); } else if (t < pD + 0.5) nv.total(nv.k);
    // plano D: a casinha de abrigo
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { fCaixa(x, 420, 1180, 300, 200, 8, AM, aD, 6, 0.12); x.beginPath(); x.moveTo(250, 1080); x.lineTo(420, 940); x.lineTo(590, 1080); x.strokeStyle = `rgba(${AM},${aD})`; x.lineWidth = 7; x.stroke(); fPessoa(x, 820, 1200, 2.0, "255,226,190", aD); fSeta(x, 740, 1180, 600, 1180, VD, aD, 7); }
  });
};

// =============== 7. resumo relâmpago + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [560, 720, 880], textos = ["o raio cria o ozônio", "as gotas soltam o cheiro da terra", "seu nariz é um detector finíssimo"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const nv = T.nuvem(14100), est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    nuvemP(nv, 540, 1230, 260, t, 0.6 * sai * PT.ss((t - c.ini) / 0.5), 0);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [OZ, TERRA, AM][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
