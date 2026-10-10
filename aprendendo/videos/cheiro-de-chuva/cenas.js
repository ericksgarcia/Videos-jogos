// Cenas do vídeo "Por que sentimos cheiro de chuva antes de ela começar" — pontos de luz na GPU.
// Retenção: situação do dia a dia (o cheiro antes da gota), paradoxo (ainda não choveu), promessa
// (o sinal de tempestade perigosa), mito (água não tem cheiro), assombro (o nariz detetive) e dica.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", OZ = "190,170,255", TERRA = "220,160,100";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.4);

// nuvem de tempestade em pontos (GPU)
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
CENAS.abertura = (el, c, B) => {
  const tC = B("chover"), tG = B("gota"), tD = B("dois"), tR = B("raio"), tS = B("sinal");
  mostrarGancho(tC + 0.8);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ain", 330, 62, "mas ainda não choveu", "pt-ci"], ["dois", 330, 86, "2 cheiros", "pt-am"], ["raio", 430, 52, "um vem de um raio", "pt-fino"]]);
  MD.arrive(tl, tx.ain, tG + 0.4, { y: 14 }); MD.leave(tl, tx.ain, tD - 0.4); MD.slam(tl, tx.dois, tD - 0.05, { from: 1.35 }); MD.arrive(tl, tx.raio, tR - 0.1, { y: 14 });
  const nv = T.nuvem(14100), est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    const flash = Math.exp(-Math.max(0, t - tR) * 4) * (t > tR - 0.05 ? 1 : 0);
    nuvemP(nv, 540, 620, 520, t, 0.9, flash);
    perfil(x, 820, 1150, 1.3, "255,226,190", PT.ss(t / 0.8));
    cheiro(x, 120, 1000, 680, 1150, t, PT.ss((t - tD) / 0.5) > 0 ? OZ : "200,215,255", PT.ss((t - 0.6) / 0.8), PT.ss((t - tD) / 0.5) > 0 ? 2 : 3);
    if (t > tD) cheiro(x, 120, 1250, 680, 1170, t + 1, TERRA, PT.ss((t - tD) / 0.5), 2);
    // a primeira gota parada no ar, com interrogação
    const aG = PT.jan(t, tG - 0.3, tD, 0.3, 0.5); if (aG > 0) { discoP(x, 400, 900, 16, CI, aG); rotuloP(x, "?", 400, 830, 70, AM, aG); }
    raioZ(x, 300, 760, 180, 1300, 7, flash * 1.3);
  });
};

// =============== 2. o cheiro do raio (ozônio) ===============
CENAS.ozonio = (el, c, B) => {
  const tO = B("ozonio"), tQ = B("quebra"), tOx = B("oxigenio"), tJ = B("juntam"), tC = B("cloro"), tD = B("descem"), tN = B("nariz");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["oz", 330, 96, "OZÔNIO", "pt-ci"], ["clo", 430, 50, "cheiro de cloro, de limpo", "pt-fino"], ["des", 330, 64, "o vento desce com ele", "pt-am"]]);
  MD.slam(tl, tx.oz, tO - 0.05, { from: 1.4 }); MD.arrive(tl, tx.clo, tC - 0.2, { y: 14 }); MD.leave(tl, [tx.oz, tx.clo], tD - 0.4); MD.slam(tl, tx.des, tD - 0.05, { from: 1.3 });
  const nv = T.nuvem(14100), est = estF(5);
  T.quadro((x, t) => {
    estD(x, est, t);
    const fl = 0.5 + 0.5 * Math.sin(t * 7) * Math.sin(t * 2.3), aMol = PT.jan(t, tQ - 0.4, tD - 0.2, 0.4, 0.5);
    nuvemP(nv, 540, 560, 480, t, 0.8, 0.4 * fl);
    raioZ(x, 540, 700, 470, 1050, Math.floor(t * 3), PT.jan(t, tQ - 0.6, tD - 0.2, 0.3, 0.5) * (0.6 + 0.4 * fl));
    // O2 se quebrando e virando O3
    if (aMol > 0) { const sep = 1 + 1.2 * PT.ss((t - tQ) / 0.6) * (1 - PT.ss((t - tJ) / 0.6)); const v3 = PT.ss((t - tJ) / 0.6); for (let k = 0; k < 3; k++) { const px = 260 + k * 280, py = 1000 + Math.sin(t * 1.5 + k) * 10; if (v3 < 0.5) molecula(x, px, py, 2, 40, "150,200,255", aMol * PT.ss((t - tOx + 0.2) / 0.4 + 1), 0.3 * k, sep); else molecula(x, px, py, 3, 40, "190,170,255", aMol, 0.3 * k, 1); } rotuloP(x, v3 < 0.5 ? "O2 (oxigênio)" : "O3 (ozônio)", 540, 1140, 40, v3 < 0.5 ? "150,200,255" : "200,185,255", aMol); }
    // o vento que desce da nuvem traz o ozônio até o nariz
    const aD = PT.ss((t - tD + 0.3) / 0.5);
    if (aD > 0) { for (let k = 0; k < 4; k++) fSeta(x, 300 + k * 130, 760, 330 + k * 150, 1180, "200,215,255", aD * 0.7, 5); const r = prng(3); for (let q = 0; q < 40; q++) { const u = ((t - tD) * 0.35 + r()) % 1, px = PT.lerp(300 + r() * 400, 760, u), py = PT.lerp(720, 1200, u); molecula(x, px, py, 3, 9, "190,170,255", aD * Math.sin(u * Math.PI), u * 5, 1); } perfil(x, 860, 1170, 1.0, "255,226,190", aD); }
    if (t > tN - 0.3) brilhoP(x, 760, 1170, 120, "190,170,255", 0.5 * PT.ss((t - tN + 0.3) / 0.4));
  });
};

// =============== 3. terra molhada (petricor) ===============
CENAS.petricor = (el, c, B) => {
  const tM = B("molhada"), tA = B("agua"), tP = B("petricor"), tO = B("oleos"), tG = B("geosmina"), tGo = B("gotas"), tB = B("bolhas"), tV = B("vento");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["agua", 330, 62, "água pura não tem cheiro", "pt-ve", "white-space:normal;left:60px;width:960px"], ["pet", 330, 100, "PETRICOR", "pt-am"], ["geo", 430, 50, "óleos + geosmina", "pt-fino"]]);
  MD.slam(tl, tx.agua, tA - 0.05, { from: 1.3 }); MD.leave(tl, tx.agua, tP - 0.35); MD.slam(tl, tx.pet, tP - 0.05, { from: 1.4 }); MD.arrive(tl, tx.geo, tG - 0.2, { y: 14 });
  const nv = T.nuvem(7100), est = estF(7), Y0 = 1180;
  T.quadro((x, t) => {
    estD(x, est, t);
    chao(nv, Y0, 1, PT.ss((t - tGo) / 2));
    // gota de água com "sem cheiro"
    const aA = PT.jan(t, tA - 0.3, tP - 0.3, 0.3, 0.4); if (aA > 0) { x.beginPath(); x.moveTo(540, 700); x.quadraticCurveTo(640, 880, 540, 920); x.quadraticCurveTo(440, 880, 540, 700); x.fillStyle = `rgba(${CI},${0.3 * aA})`; x.fill(); x.strokeStyle = `rgba(${CI},${aA})`; x.lineWidth = 6; x.stroke(); linhaP(x, 440, 980, 640, 980, VE, aA, 6); rotuloP(x, "sem cheiro", 540, 1040, 40, "255,170,180", aA); }
    // óleos das plantas no chão e bactérias da terra
    const aO = PT.ss((t - tO + 0.3) / 0.5); if (aO > 0) { const r = prng(9); for (let k = 0; k < 18; k++) { const px = 60 + r() * 960, py = Y0 + 10 + r() * 40; discoP(x, px, py, 9, AM, aO * 0.8); brilhoP(x, px, py, 26, AM, 0.4 * aO); } for (let k = 0; k < 3; k++) { const bx = 180 + k * 360; linhaP(x, bx, Y0, bx, Y0 - 140, VD, aO, 6); [[-1, 0.4], [1, 0.6], [-1, 0.8]].forEach(([s, h]) => linhaP(x, bx, Y0 - 140 * h, bx + s * 50, Y0 - 140 * h - 40, VD, aO, 5)); } }
    const aG = PT.ss((t - tG + 0.3) / 0.5); if (aG > 0) { const r = prng(10); for (let k = 0; k < 26; k++) { const px = 60 + r() * 960, py = Y0 + 50 + r() * 90, an = r() * 3; linhaP(x, px - Math.cos(an) * 12, py - Math.sin(an) * 12, px + Math.cos(an) * 12, py + Math.sin(an) * 12, VD, aG * (0.6 + 0.4 * Math.sin(t * 3 + k)), 7); } rotuloP(x, "bactérias da terra", 540, Y0 + 175, 30, "150,255,200", aG); }
    // as gotas caem e jogam bolhinhas de cheiro para o ar
    const aGo = PT.ss((t - tGo + 0.2) / 0.5); gotasCaindo(x, t, 60, 1020, 560, Y0, 40, aGo);
    const aB = PT.ss((t - tB + 0.4) / 0.5); if (aB > 0) { const r = prng(12); for (let k = 0; k < 60; k++) { const px = 60 + r() * 960, u = (t * 0.4 + r()) % 1, py = Y0 - u * 380; anelP(x, px + Math.sin(u * 9 + k) * 12, py, 5 + 6 * u, TERRA, aB * Math.sin(u * Math.PI), 2); } }
    const aV = PT.ss((t - tV + 0.3) / 0.5); if (aV > 0) { for (let k = 0; k < 3; k++) fSeta(x, 140, 760 + k * 110, 900, 800 + k * 110, "220,230,255", aV * 0.7, 5); rotuloP(x, "de onde já chove →", 540, 700, 34, "220,230,255", aV); }
  });
};

// =============== 4. nariz de detetive ===============
CENAS.nariz = (el, c, B) => {
  const tI = B("impressionante"), tS = B("sensivel"), tT = B("trilhao"), tC = B("colher"), tP = B("piscina"), tA = B("agua2");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["tri", 330, 66, "partes por TRILHÃO", "pt-am"], ["col", 330, 60, "1 colher numa piscina olímpica", "pt-ci", "white-space:normal;left:60px;width:960px"], ["ach", 330, 66, "faro pra achar água", "pt-ci"]]);
  MD.slam(tl, tx.tri, tT - 0.05, { from: 1.35 }); MD.leave(tl, tx.tri, tC - 0.35); MD.slam(tl, tx.col, tC - 0.05, { from: 1.25 }); MD.leave(tl, tx.col, tA - 1.4); MD.slam(tl, tx.ach, tA - 1.1, { from: 1.3 });
  const nv = T.nuvem(20100), est = estF(9);
  const PISC = (() => { const r = prng(14), o = []; for (let i = 0; i < 20000; i++) o.push({ x: r(), y: r(), n: r() }); return o; })();
  T.quadro((x, t) => {
    estD(x, est, t);
    // o nariz brilhando
    const aN = PT.jan(t, c.ini, tC - 0.3, 0.5, 0.5); if (aN > 0) { perfil(x, 640, 950, 2.0, "255,226,190", aN); brilhoP(x, 450, 950, 160, AM, aN * 0.5 * PT.ss((t - tS + 0.2) / 0.5) * (0.7 + 0.3 * Math.sin(t * 4))); cheiro(x, 100, 900, 430, 950, t, TERRA, aN * PT.ss((t - tI) / 0.5), 2); }
    // piscina olímpica de pontos + uma colher
    const aP = PT.ss((t - tC + 0.3) / 0.6) * (1 - PT.ss((t - tA + 1.5) / 0.5)); let i = nv.k;
    if (aP > 0.01) for (const p of PISC) nv.ponto(i++, 120 + p.x * 840, 760 + p.y * 460, 0.3, 0.65, 1.0, aP * (0.18 + 0.25 * Math.sin(t * 2 + p.n * 12)), 3);
    nv.total(i);
    if (aP > 0.01) { fCaixa(x, 540, 990, 860, 480, 10, CI, aP, 5, 0); rotuloP(x, "piscina olímpica", 540, 1270, 34, "180,220,255", aP); const aCo = PT.ss((t - tP + 0.2) / 0.5); x.beginPath(); x.ellipse(700, 950, 26, 16, 0, 0, 6.283); x.fillStyle = `rgba(255,226,140,${aP * aCo})`; x.fill(); linhaP(x, 724, 945, 800, 920, AM, aP * aCo, 6); brilhoP(x, 700, 950, 70, AM, 0.6 * aP * aCo); }
    // antepassado procurando água
    const aA = PT.ss((t - tA + 1.2) / 0.6); if (aA > 0) { fPessoa(x, 340, 1080, 2.4, "255,226,190", aA); cheiro(x, 900, 1000, 400, 960, t, TERRA, aA, 2); x.beginPath(); x.ellipse(860, 1200, 140, 40, 0, 0, 6.283); x.fillStyle = `rgba(${CI},${0.35 * aA})`; x.fill(); x.strokeStyle = `rgba(${CI},${aA})`; x.lineWidth = 4; x.stroke(); }
  });
};

// =============== 5. o sinal ===============
CENAS.dica = (el, c, B) => {
  const tC = B("cloro"), tV = B("vento"), tF = B("frio"), tR = B("raios"), tA = B("abrigo");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["s1", 330, 56, "cheiro de cloro", "pt-ci"], ["s2", 400, 56, "+ vento forte", "pt-ci"], ["s3", 470, 56, "+ frio de repente", "pt-ci"], ["abr", 330, 76, "procure abrigo", "pt-ve"]]);
  MD.arrive(tl, tx.s1, tC - 0.1, { y: 14 }); MD.arrive(tl, tx.s2, tV - 0.1, { y: 14 }); MD.arrive(tl, tx.s3, tF - 0.1, { y: 14 }); MD.leave(tl, [tx.s1, tx.s2, tx.s3], tA - 0.6); MD.slam(tl, tx.abr, tA - 0.3, { from: 1.35 });
  const nv = T.nuvem(14100), est = estF(11);
  T.quadro((x, t) => {
    estD(x, est, t);
    const fl = PT.ss((t - tR + 0.2) / 0.3) * Math.max(0, Math.sin(t * 5) * Math.sin(t * 1.7));
    nuvemP(nv, 540, 640, 520, t, 0.9, fl);
    raioZ(x, 380, 780, 300, 1250, Math.floor(t * 2), fl * 1.4);
    fPessoa(x, 780, 1200, 2.2, "255,226,190", 1);
    const aV = PT.ss((t - tV + 0.3) / 0.4); if (aV > 0) for (let k = 0; k < 4; k++) { const u = ((t - tV) * 0.8 + k / 4) % 1; fSeta(x, 60 + u * 300, 980 + k * 70, 220 + u * 300, 990 + k * 70, "220,230,255", aV * Math.sin(u * Math.PI), 5); }
    const aF = PT.ss((t - tF + 0.3) / 0.4); if (aF > 0) { linhaP(x, 960, 1000, 960, 1250, "255,255,255", aF * 0.5, 14); linhaP(x, 960, 1250, 960, PT.lerp(1050, 1200, PT.ss((t - tF) / 1)), CI, aF, 10); discoP(x, 960, 1265, 22, CI, aF); }
    // casinha de abrigo
    const aA = PT.ss((t - tA + 0.4) / 0.5); if (aA > 0) { fCaixa(x, 300, 1230, 240, 160, 8, AM, aA, 5, 0.12); x.beginPath(); x.moveTo(160, 1150); x.lineTo(300, 1040); x.lineTo(440, 1150); x.strokeStyle = `rgba(${AM},${aA})`; x.lineWidth = 6; x.stroke(); fSeta(x, 690, 1200, 450, 1220, VD, aA, 6); }
  });
};

// =============== 6. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [520, 720, 920], textos = ["o raio cria o ozônio", "as gotas soltam o cheiro da terra", "seu nariz é um detector finíssimo"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    gotasCaindo(x, t, 0, 1080, 300, 1420, 40, 0.4 * sai, 21);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, ["190,170,255", TERRA, AM][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
