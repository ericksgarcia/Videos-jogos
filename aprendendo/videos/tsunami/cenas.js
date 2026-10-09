// Cenas do vídeo "Como funciona um tsunami" — estilo pontos de luz na GPU (motor/pontos-gpu.js):
// praia em perspectiva, corte do oceano, placas tectônicas, globo e a chegada na costa, tudo
// feito de partículas com bloom. Textos com MotionDirector.

const MD = MotionDirector;
const AGUA_C = [0.45, 0.8, 1.0], FUNDO_C = [0.1, 0.3, 0.75], AREIA_C = [0.95, 0.74, 0.45], ROCHA_O = [0.7, 0.4, 0.22], ROCHA_C = [0.92, 0.68, 0.42];
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ---------- praia em perspectiva (grade de pontos: água ou areia) ----------
function gradePraia(seed) {
  const r = prng(seed), g = [];
  for (let j = 0; j < 170; j++) { const u = j / 169, Z = 140 * Math.exp(u * Math.log(46)); for (let i = 0; i < 340; i++) g.push({ X: (i / 339 - 0.5) * 2 * (700 + Z * 0.9) + (r() - 0.5) * 6, Z: Z * (1 + (r() - 0.5) * 0.01), n: r() }); }
  return g;
}
// morro à esquerda (altura no ponto X, Z)
const morroH = (X, Z) => 300 * Math.exp(-Math.pow((X + 560) / 420, 2)) * Math.exp(-Math.pow((Z - 1700) / 650, 2));
// o: { nivel(t), onda(Z, X, t) -> altura extra, morro (0..1), vis }
function desenharPraia(nv, G, t, o) {
  const hc = 260, f = 700, y0 = 640, Z0 = 900, vis = o.vis ?? 1;
  let i = nv.k;
  const L0 = o.nivel ? o.nivel(t) : 0;
  for (const p of G) {
    let chao = Math.max(-140, 0.05 * (Z0 - p.Z));
    if (o.morro) chao += o.morro * morroH(p.X, p.Z);
    const ond = 2.2 * Math.sin(p.X * 0.012 + t * 1.6 + p.Z * 0.004) + 1.6 * Math.sin(p.Z * 0.02 - t * 2.1), L = L0 + ond + (o.onda ? o.onda(p.Z, p.X, t) : 0);
    const agua = L > chao, h = agua ? L : chao;
    const sx = 540 + (p.X * f) / p.Z, sy = y0 + ((hc - h) * f) / p.Z;
    if (sx < -10 || sx > W + 10 || sy < 300 || sy > H) continue;
    const neb = PT.cl((6400 - p.Z) / 3200) * vis, tam = Math.min(7, 1.8 + 1500 / p.Z);
    if (agua) {
      const esp = L - chao < 5 ? 1 : 0, crista = PT.cl((ond + (o.onda ? o.onda(p.Z, p.X, t) : 0) * 0.08) / 4);
      const c = esp ? [0.95, 0.98, 1.0] : mixC(FUNDO_C, AGUA_C, 0.35 + 0.65 * crista);
      nv.ponto(i++, sx, sy, c[0], c[1], c[2], neb * (esp ? 1 : 0.6 + 0.4 * crista), tam);
    } else {
      const molhado = chao < 0 ? 0.55 : 1;
      nv.ponto(i++, sx, sy, AREIA_C[0] * molhado, AREIA_C[1] * molhado, AREIA_C[2] * molhado, neb * (0.75 + 0.25 * p.n), tam);
    }
    if (i >= nv.n) break;
  }
  nv.total(i);
  return { hc, f, y0, Z0 };
}
const telaPraia = (Z, h) => [540, 640 + ((260 - h) * 700) / Z];

// ---------- corte do oceano (vista de lado) ----------
function particulasCorte(n, seed, ys, fundo, yMax = 1380, fatorRocha) {
  const r = prng(seed), agua = [], rocha = [];
  while (agua.length < n) { const x = r() * W, y = ys + r() * (yMax - ys); if (y < fundo(x)) agua.push({ x, y, d: y - ys, n: r() }); }
  for (let k = 0; k < n * (fatorRocha || 0.35); k++) { const x = r() * W, y = fundo(x) + r() * (yMax + 40 - fundo(x)); if (y > fundo(x)) rocha.push({ x, y, n: r() }); }
  return { agua, rocha, ys };
}
// o: { desloc(p, t) -> [dx, dy], cor(p) opcional, vis, rocha(p) -> cor | null, rochaDesloc(p, t) }
function desenharCorte(nv, C, t, o) {
  let i = nv.k; const vis = o.vis ?? 1;
  for (const p of C.agua) {
    const [dx, dy] = o.desloc ? o.desloc(p, t) : [0, 0];
    let vel = 0;
    if (o.desloc && o.realce) { const [ax, ay] = o.desloc(p, t - 0.05); vel = PT.cl(Math.hypot(dx - ax, dy - ay) / 3); }
    const prof = PT.cl(p.d / 650), c = mixC(mixC(AGUA_C, FUNDO_C, prof), [0.85, 0.97, 1.0], vel * 0.7);
    const sup = p.d < 7 ? 1 : 0;
    nv.ponto(i++, p.x + dx, p.y + dy, c[0], c[1], c[2], vis * (sup ? 1 : 0.42 + 0.5 * vel + 0.25 * (1 - prof)), sup ? 3.4 : 2.8);
  }
  if (o.rocha !== false) for (const p of C.rocha) {
    const c = o.corRocha ? o.corRocha(p, t) : ROCHA_O;
    const [dx, dy] = o.rochaDesloc ? o.rochaDesloc(p, t) : [0, 0];
    nv.ponto(i++, p.x + dx, p.y + dy, c[0], c[1], c[2], vis * (c[3] ?? 0.45 + 0.2 * p.n), 2.8);
  }
  nv.total(i);
}

// ---------- globo de pontos ----------
const vec = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
const TERRA_V = [], BRASIL_V = [];
for (let k = 0; k < GLOBO_TERRA.length; k += 2) TERRA_V.push(vec(GLOBO_TERRA[k] / 10, GLOBO_TERRA[k + 1] / 10));
for (let k = 0; k < GLOBO_BRASIL.length; k += 2) BRASIL_V.push(vec(GLOBO_BRASIL[k] / 10, GLOBO_BRASIL[k + 1] / 10));
// máscara de terra (células de 2°) para as ondas não "andarem" sobre os continentes
const TERRA_M = new Set();
for (let k = 0; k < GLOBO_TERRA.length; k += 2) { const la = Math.floor(GLOBO_TERRA[k] / 20), lo = Math.floor(GLOBO_TERRA[k + 1] / 20); TERRA_M.add(`${la}:${lo}`); }
for (let k = 0; k < GLOBO_BRASIL.length; k += 2) TERRA_M.add(`${Math.floor(GLOBO_BRASIL[k] / 20)}:${Math.floor(GLOBO_BRASIL[k + 1] / 20)}`);
const ehTerra = (lat, lon) => TERRA_M.has(`${Math.floor(lat / 2)}:${Math.floor(lon / 2)}`);
function projGlobo(lat0, lon0, R, cx, cy) {
  const ca = Math.cos(-lon0 * Math.PI / 180), sa = Math.sin(-lon0 * Math.PI / 180), cb = Math.cos(lat0 * Math.PI / 180), sb = Math.sin(lat0 * Math.PI / 180);
  return (v, h = 0) => { const x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca, y2 = v[1] * cb - z1 * sb, z2 = v[1] * sb + z1 * cb; return [cx + x1 * R * (1 + h), cy - y2 * R * (1 + h), z2]; };
}
function desenharGlobo(nv, x, proj, R, cx, cy, a, corBR) {
  let i = nv.k;
  brilhoP(x, cx, cy, R * 1.45, "60,140,255", 0.22 * a);
  anelP(x, cx, cy, R * 1.005, "143,227,255", 0.35 * a, 3);
  const esf = x.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.05, cx, cy, R);
  esf.addColorStop(0, `rgba(40,80,170,${0.45 * a})`); esf.addColorStop(1, `rgba(5,10,32,${0.15 * a})`);
  x.fillStyle = esf; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
  for (const v of TERRA_V) { const [px, py, z] = proj(v); if (z <= 0) continue; nv.ponto(i++, px, py, 0.55, 0.82, 1.0, a * (0.7 + 0.3 * z), 3.6); }
  for (const v of BRASIL_V) { const [px, py, z] = proj(v); if (z <= 0) continue; const c = corBR || [0.55, 0.82, 1.0]; nv.ponto(i++, px, py, c[0], c[1], c[2], a * (0.55 + 0.35 * z), 3); }
  nv.total(i);
}

// ---------- navio, prédio e carros de pontos ----------
function navioP(nv, cx, cy, esc, a) {
  let i = nv.k; const r = prng(3);
  for (let k = 0; k < 900; k++) { const u = r(), v = r(), x0 = -120 + 240 * u, y0 = -v * 34; if (Math.abs(x0) > 120 - (34 + y0) * 0.9) continue; nv.ponto(i++, cx + x0 * esc, cy + y0 * esc, 0.9, 0.92, 1.0, a * 0.75, 2.8); }
  for (let k = 0; k < 500; k++) { const x0 = -60 + 90 * r(), y0 = -34 - 40 * r(); nv.ponto(i++, cx + x0 * esc, cy + y0 * esc, 0.85, 0.9, 1.0, a * 0.65, 2.8); }
  for (let k = 0; k < 8; k++) nv.ponto(i++, cx + (-52 + k * 11) * esc, cy - 54 * esc, 1.0, 0.85, 0.45, a, 3.2);
  nv.total(i);
}
function predioP(nv, x0, base, larg, andares, hAnd, a, r) {
  let i = nv.k;
  for (let k = 0; k < andares; k++) for (let j = 0; j < 6; j++) { const jan = r() < 0.6; nv.ponto(i++, x0 + 6 + j * (larg - 12) / 5, base - (k + 0.5) * hAnd, jan ? 1.0 : 0.6, jan ? 0.85 : 0.7, jan ? 0.5 : 0.9, a * (jan ? 0.8 : 0.25), 3); }
  for (let y = base; y > base - andares * hAnd; y -= 4) { nv.ponto(i++, x0, y, 0.7, 0.8, 1.0, a * 0.4, 2); nv.ponto(i++, x0 + larg, y, 0.7, 0.8, 1.0, a * 0.4, 2); }
  nv.total(i);
}

// =============== 1. gancho: o mar recua na praia ===============
CENAS.abertura = (el, c, B) => {
  const q = tempoPalavras(c), tR = B("recua"), tP = B("peixes"), tPe = B("perigo"), tT = B("tsunami");
  mostrarGancho(tR - 0.4);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["sinal", 360, 64, "o sinal mais perigoso", "pt-ve"]]);
  MD.slam(tl, tx.sinal, tPe - 0.15, { from: 1.25 });
  MD.leave(tl, tx.sinal, c.fim - 0.6);
  const G = gradePraia(4), nv = T.nuvem(G.length + 400), est = ambienteP(260, 7);
  const r = prng(11), peixes = Array.from({ length: 26 }, () => ({ X: (r() - 0.5) * 1100, Z: 1000 + r() * 1400, f: r() * 6.283, v: 3 + r() * 4 }));
  T.quadro((x, t) => {
    const ceu = x.createLinearGradient(0, 300, 0, 720); ceu.addColorStop(0, "rgba(20,40,110,0)"); ceu.addColorStop(0.82, "rgba(90,120,220,0.3)"); ceu.addColorStop(1, "rgba(90,120,220,0)"); x.fillStyle = ceu; x.fillRect(0, 300, W, 420);
    est.forEach((s) => { if (s.y < 640) pontoP(x, s.x, s.y, 1 + 1.6 * s.z, "220,230,255", 0.15 + 0.4 * s.z); });
    brilhoP(x, 540, 640, 700, "255,190,140", 0.12);
    const recuo = PT.inOut((t - tR + 0.3) / 2.6);
    const ondaLonge = (Z, X, tt) => { if (tt < tT - 0.5) return 0; const zW = PT.lerp(6400, 3600, PT.ss((tt - tT + 0.5) / (c.fim - tT + 0.5))); return (4 + 18 * PT.ss((tt - tT) / 2)) * Math.exp(-Math.pow((Z - zW) / 260, 2)); };
    desenharPraia(nv, G, t, { nivel: () => -48 * recuo, onda: ondaLonge });
    // peixes pulando na areia que ficou à mostra
    peixes.forEach((p) => {
      const chao = 0.05 * (900 - p.Z); if (chao + 48 * recuo < 6 || t < tP - 0.6) return;
      const salto = Math.max(0, Math.sin(t * p.v + p.f)) * 22, [sx, sy] = [540 + (p.X * 700) / p.Z, 640 + ((260 - chao - salto) * 700) / p.Z];
      const a = PT.ss((t - tP + 0.6) / 0.6);
      for (let k = 0; k < 7; k++) pontoP(x, sx - 8 + k * 2.6, sy + Math.sin(k + t * 9) * 1.2, 2.4, "230,240,255", a * 0.8);
      brilhoP(x, sx, sy, 18, "220,235,255", 0.3 * a);
    });
    // a linha branca do tsunami no horizonte
    if (t > tT - 0.5) brilhoP(x, 540, 640 + ((260 - 10) * 700) / PT.lerp(6400, 3600, PT.ss((t - tT + 0.5) / (c.fim - tT + 0.5))), 600, "200,230,255", 0.18 * PT.ss((t - tT) / 1));
  });
};

// =============== 2. onda comum x tsunami ===============
CENAS.ondas = (el, c, B) => {
  const q = tempoPalavras(c), tV = B("vento"), tPe = B("pele"), tI = B("inteiro"), tS = B("soprar"), tC = B("chutar");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["vento", 340, 110, "vento", "pt-ci"],
    ["pele", 470, 48, "só a superfície", "pt-fino"],
    ["tsu", 340, 120, "tsunami", "pt-am"],
    ["fundo", 480, 48, "do fundo à superfície", "pt-fino"],
    ["sop", 340, 70, "soprar o balde", "pt-fino"],
    ["chu", 430, 110, "chutar o balde", "pt-la"],
  ]);
  MD.slam(tl, tx.vento, tV - 0.1, { from: 1.3 }); MD.arrive(tl, tx.pele, tPe, { y: 14 });
  MD.leave(tl, [tx.vento, tx.pele], tI - 0.6);
  MD.slam(tl, tx.tsu, tI - 0.15, { from: 1.3 }); MD.arrive(tl, tx.fundo, tI + 0.3, { y: 14 });
  MD.leave(tl, [tx.tsu, tx.fundo], tS - 0.4);
  MD.arrive(tl, tx.sop, tS - 0.05, { y: 14 }); MD.slam(tl, tx.chu, tC - 0.05, { from: 1.35 });
  const ys = 600, fundo = (x) => 1250 + 30 * Math.sin(x * 0.01);
  const C = particulasCorte(36000, 3, ys, fundo, 1380, 0.6), nv = T.nuvem(36000 + 22000);
  const r = prng(5), rajadas = Array.from({ length: 30 }, () => [r() * W, 380 + r() * 180, r()]);
  T.quadro((x, t) => {
    const tsu = PT.ss((t - tI + 0.4) / 0.9), vento = 1 - tsu;
    const chute = t > tC ? Math.exp(-(t - tC) * 2.5) * Math.sin((t - tC) * 30) * 14 : 0;
    const desloc = (p, tt) => {
      const k = 2 * Math.PI / 260, w = 2.2, A = 22 * Math.exp(-p.d / 55) * vento * PT.ss((tt - c.ini + 0.4) / 0.8);
      const k2 = 2 * Math.PI / 1600, B2 = 46 * tsu, ph = k2 * p.x - 1.3 * tt, alt = 1 - p.d / (fundo(p.x) - ys);
      return [A * Math.cos(k * p.x - w * tt) + B2 * Math.sin(ph) + chute, A * Math.sin(k * p.x - w * tt) - 26 * tsu * Math.cos(ph) * alt];
    };
    desenharCorte(nv, C, t, { desloc, realce: true });
    // rajadas de vento sobre a água
    if (vento > 0.02) rajadas.forEach(([rx, ry, f]) => { const xx = ((rx + t * (260 + 200 * f)) % (W + 300)) - 150; linhaP(x, xx, ry, xx + 90 + 60 * f, ry, "190,230,255", 0.35 * vento * PT.ss((t - tV + 0.4) / 0.5), 2); });
    // colchete mostrando a parte que se mexe
    const prof = PT.lerp(110, fundo(70) - ys, tsu), a = PT.ss((t - tPe + 0.2) / 0.5);
    linhaP(x, 50, ys, 50, ys + prof, "255,210,63", 0.8 * a, 4); linhaP(x, 50, ys, 72, ys, "255,210,63", 0.8 * a, 4); linhaP(x, 50, ys + prof, 72, ys + prof, "255,210,63", 0.8 * a, 4);
  });
};

// =============== 3. placas tectônicas: presas, tensão, o tranco ===============
CENAS.placas = (el, c, B) => {
  const q = tempoPalavras(c), tTe = B("terremoto"), tPl = B("placas"), tEm = B("embaixo"), tTs = B("tensao"), tRe = B("regua"), tSo = B("solta"), tLe = B("levanta");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["terr", 340, 120, "terremoto", "pt-la"],
    ["plac", 340, 110, "placas", "pt-am"],
    ["tens", 340, 120, "tensão", "pt-ve"],
    ["sec", 470, 46, "por séculos", "pt-fino"],
    ["solta", 340, 140, "solta!", "pt-ci"],
  ]);
  MD.slam(tl, tx.terr, tTe - 0.1, { from: 1.3 }); MD.leave(tl, tx.terr, tPl - 0.5);
  MD.slam(tl, tx.plac, tPl - 0.1, { from: 1.25 }); MD.leave(tl, tx.plac, tTs - 0.5);
  MD.slam(tl, tx.tens, tTs - 0.1, { from: 1.25 }); MD.arrive(tl, tx.sec, q("séculos,"), { y: 14 }); MD.leave(tl, [tx.tens, tx.sec], tSo - 0.4);
  MD.slam(tl, tx.solta, tSo - 0.05, { from: 1.5 }); MD.leave(tl, tx.solta, c.fim - 0.6);
  const ys = 560, XT = 540;                                   // XT: fossa (onde uma placa entra embaixo da outra)
  const topoOce = (x) => (x < XT ? 980 : 980 + (x - XT) * 0.55);
  const fundoMar = (x) => (x < XT ? 960 : 960 - 200 * PT.ss((x - XT) / 520));
  const C = particulasCorte(30000, 7, ys, fundoMar, 1400, 1.2), nv = T.nuvem(30000 + 37000);
  // a placa de cima "presa": quanto foi puxada para baixo (tensão) e o tranco
  const puxa = (t) => {
    if (t < tTs - 0.5) return 0;
    if (t < tSo) return 46 * PT.ss((t - tTs + 0.5) / (tSo - tTs + 0.5));
    const u = t - tSo; return -30 - 34 * Math.exp(-u * 3) * Math.cos(u * 14);   // solta: sobe, oscila e assenta 30 px acima
  };
  T.quadro((x, t) => {
    const flui = Math.max(0, t - tEm + 0.3) * 18;               // a placa oceânica vai entrando
    const k = puxa(t), corte = (px) => Math.exp(-Math.max(0, px - XT) / 210) * (px > XT - 30 ? 1 : 0);
    const tensao = t < tSo ? PT.ss((t - tTs + 0.5) / (tSo - tTs + 0.5)) : Math.exp(-(t - tSo) * 2);
    const levanta = t > tSo ? PT.out((t - tSo) / 0.6) : 0, abre = Math.max(0, t - tLe + 0.6);
    const desloc = (p) => {
      // a coluna inteira sobe em cima do tranco e depois se divide em duas ondas
      const sob = -30 * levanta * Math.exp(-Math.pow((p.x - 690) / 160, 2)) * (1 - PT.ss(abre / 1.2));
      const ondas = -26 * PT.ss(abre / 0.8) * (Math.exp(-Math.pow((p.x - 690 - abre * 170) / 120, 2)) + Math.exp(-Math.pow((p.x - 690 + abre * 170) / 120, 2)));
      const choque = t > tSo && t < tSo + 0.6 ? Math.sin((t - tSo) * 60) * 5 * (1 - (t - tSo) / 0.6) : 0;
      return [choque, (sob + ondas) * (0.55 + 0.45 * (1 - p.d / 420))];
    };
    const corRocha = (p) => {
      const oce = p.y > topoOce(p.x);
      if (oce) { const listra = ((Math.floor((p.x - flui) / 40) % 2 + 2) % 2); return [...mixC([0.85, 0.45, 0.28], [1.0, 0.62, 0.3], listra * PT.ss((t - tEm + 0.5) / 0.6)), 0.45 + 0.35 * PT.ss((t - tPl + 0.5) / 0.6)]; }
      const contato = Math.exp(-Math.abs(p.y - topoOce(p.x)) / 30) * Math.exp(-Math.abs(p.x - XT - 120) / 160);
      return [...mixC([1.0, 0.86, 0.6], [1.0, 0.3, 0.25], PT.cl(contato * tensao * 1.4)), 0.55 + 0.2 * p.n + 0.5 * contato * tensao];
    };
    const rochaDesloc = (p) => (p.y > topoOce(p.x) ? [0, 0] : [0, k * corte(p.x)]);
    desenharCorte(nv, C, t, { desloc, corRocha, rochaDesloc, realce: true });
    // setas da placa entrando e brilho/anéis do tranco
    const aP = PT.jan(t, tEm - 0.3, tSo, 0.4, 0.4);
    for (let s = 0; s < 6; s++) { const u = ((t * 0.5 + s / 6) % 1), px = 120 + u * 380; pontoP(x, px, 1040, 5, "255,210,63", aP * Math.sin(u * Math.PI)); }
    if (t > tSo) { const u = t - tSo; for (let k2 = 0; k2 < 3; k2++) anelP(x, XT + 120, 1010, 20 + (u - k2 * 0.15) * 600, "255,236,190", 0.6 * Math.exp(-u * 2) * (u > k2 * 0.15 ? 1 : 0), 4); brilhoP(x, XT + 120, 1010, 380, "255,220,150", 0.7 * Math.exp(-u * 3)); }
    if (tensao > 0.05 && t < tSo) brilhoP(x, XT + 120, 1000, 160, "255,90,70", 0.35 * tensao * (0.8 + 0.2 * Math.sin(t * 20)));
  });
};

// =============== 4. a viagem: espalha pelo oceano, rápido e baixinho ===============
CENAS.viagem = (el, c, B) => {
  const q = tempoPalavras(c), tE = B("espalha"), tV = B("vel"), tA = B("aviao"), tM = B("metro"), tN = B("navio"), tMa = q("Mas");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["hora", 1352, 56, "+0 h", "pt-ci"],
    ["vel", 330, 120, "700 km/h", "pt-am"],
    ["avi", 460, 48, "como um avião", "pt-fino"],
    ["met", 340, 104, "menos de 1 m", "pt-ci"],
  ]);
  MD.arrive(tl, tx.hora, tE, { y: 14 }); MD.leave(tl, tx.hora, tMa - 0.4);
  aCadaQuadro((t) => { tx.hora.textContent = `+${Math.min(7, Math.floor(7 * PT.cl((t - tE) / (tMa - tE - 0.6)) + 0.0001))} h`; });
  MD.slam(tl, tx.vel, tV - 0.1, { from: 1.3 }); MD.arrive(tl, tx.avi, tA - 0.2, { y: 14 }); MD.leave(tl, [tx.vel, tx.avi], tMa - 0.3);
  MD.slam(tl, tx.met, tM - 0.2, { from: 1.25 });
  const EPI = [3.3, 95.9], ve = vec(...EPI), nv = T.nuvem(16000 + 20000), r = prng(9);
  const C = particulasCorte(20000, 11, 900, () => 1330, 1340);
  // base ortonormal em torno do epicentro, para desenhar os anéis
  const u1 = (() => { const a = [0, 1, 0], d = a[0] * ve[0] + a[1] * ve[1] + a[2] * ve[2], w = [a[0] - d * ve[0], a[1] - d * ve[1], a[2] - d * ve[2]], l = Math.hypot(...w); return w.map((v) => v / l); })();
  const u2 = [ve[1] * u1[2] - ve[2] * u1[1], ve[2] * u1[0] - ve[0] * u1[2], ve[0] * u1[1] - ve[1] * u1[0]];
  T.quadro((x, t) => {
    const vG = 1 - PT.ss((t - tMa + 0.3) / 0.7), vM = PT.ss((t - tMa) / 0.7);
    if (vG > 0.01) {
      const R = 470, cx = 540, cy = 860, proj = projGlobo(-8, 82, R, cx, cy);
      desenharGlobo(nv, x, proj, R, cx, cy, vG);
      const [ex, ey] = proj(ve); brilhoP(x, ex, ey, 60, "255,210,63", 0.8 * vG); rotuloP(x, "SUMATRA, 2004", ex + 24, ey - 30, 24, "255,226,140", vG * 0.9, "left");
      // anéis: 7 horas de viagem (~44°) comprimidas em poucos segundos
      for (let w = 0; w < 4; w++) {
        const th = (44 * PT.cl((t - tE - w * 0.35) / (tMa - tE - 0.6)) - w * 1.2) * Math.PI / 180; if (th <= 0) continue;
        for (let k = 0; k < 900; k++) {
          const b = k / 900 * 6.283, v = [0, 1, 2].map((j) => ve[j] * Math.cos(th) + (u1[j] * Math.cos(b) + u2[j] * Math.sin(b)) * Math.sin(th));
          const lat = Math.asin(v[1]) * 180 / Math.PI, lon = Math.atan2(v[0], v[2]) * 180 / Math.PI;
          if (ehTerra(lat, lon)) continue;
          const [px, py, z] = proj(v); if (z <= 0) continue;
          pontoP(x, px, py, 3, w ? "143,227,255" : "235,248,255", vG * (w ? 0.45 : 0.9) * (0.4 + 0.6 * z));
        }
      }
    }
    if (vM > 0.01) {
      // mar aberto, de lado: uma ondulação longa e baixinha passa por baixo do navio
      const xo = (t - tM + 1.2) * 260 - 300;
      const desloc = (p) => [0, -9 * Math.exp(-Math.pow((p.x - xo) / 420, 2))];
      desenharCorte(nv, C, t, { desloc, vis: vM, rocha: false });
      const nx = 600, ny = 900 - 9 * Math.exp(-Math.pow((nx - xo) / 420, 2)) + 2 * Math.sin(t * 1.5);
      navioP(nv, nx, ny, 1.4, vM * PT.ss((t - tN + 0.8) / 0.6));
      // escala: 1 m
      const a = PT.ss((t - tM) / 0.5) * vM; linhaP(x, 140, 900, 140, 876, "255,210,63", a, 5); rotuloP(x, "1 m", 160, 892, 36, "255,226,140", a, "left");
    }
  });
};

// =============== 5. chegando no raso: freia, amontoa e sobe ===============
CENAS.chegada = (el, c, B) => {
  const q = tempoPalavras(c), tR = B("raso"), tF = B("freia"), tA = B("amontoa"), tE = B("engarrafa"), tS = B("sobe"), t30 = B("trinta"), tDez = q("dez,"), tVin = q("vinte,"), tAc = q("água");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["fre", 330, 96, "a frente freia", "pt-ci"],
    ["amo", 440, 52, "a de trás se amontoa", "pt-am"],
    ["eng", 330, 76, "engarrafamento", "pt-fino"],
    ["alt", 330, 150, "10 m", "pt-la"],
  ]);
  MD.slam(tl, tx.fre, tF - 0.15, { from: 1.25 }); MD.arrive(tl, tx.amo, tA - 0.2, { y: 14 }); MD.leave(tl, [tx.fre, tx.amo], tE - 0.5);
  MD.arrive(tl, tx.eng, tE - 0.1, { y: 14 }); MD.leave(tl, tx.eng, tAc - 0.3);
  MD.slam(tl, tx.alt, tDez - 0.1, { from: 1.3 });
  aCadaQuadro((t) => { tx.alt.textContent = t >= t30 - 0.05 ? "30 m" : t >= tVin - 0.05 ? "20 m" : "10 m"; });
  [tVin, t30].forEach((tt) => tl.fromTo(tx.alt, { scale: 1.25 }, { scale: 1, duration: 0.4, ease: "expo.out", immediateRender: false }, tt - 0.05));
  const ys = 760, fundo = (x) => 1320 - 590 * PT.ss((x - 120) / 900);              // fundo sobe até a praia (x ~ 1000)
  const C = particulasCorte(32000, 13, ys, fundo, 1380, 0.8), nv = T.nuvem(72000);
  const r = prng(4), carros = Array.from({ length: 13 }, (_, k) => k);
  // posição da onda (chaves) e altura (cresce no raso)
  const xOnda = (t) => chaves(t, [[c.ini, -250], [tR, 380], [tF, 560], [tA, 700], [tE + 2, 780], [tS, 900], [t30, 1010]]);
  const alt = (t) => chaves(t, [[c.ini, 12], [tF, 30], [tA, 70], [tS, 120], [tDez, 150], [tVin, 200], [t30, 270]]);
  const larg = (t) => chaves(t, [[c.ini, 360], [tF, 220], [tA, 140], [tS, 100]]);
  T.quadro((x, t) => {
    const xo = xOnda(t), h = alt(t), w = larg(t);
    const desloc = (p) => { const g = Math.exp(-Math.pow((p.x - xo) / w, 2)), atras = p.x < xo ? 1 : 0; return [g * 20 + atras * Math.exp(-Math.pow((p.x - xo) / (w * 2.5), 2)) * 10, -h * g * (0.4 + 0.6 * (1 - p.d / Math.max(60, fundo(p.x) - ys)))]; };
    desenharCorte(nv, C, t, { desloc, corRocha: (p) => [...AREIA_C, 0.4 + 0.15 * p.n], realce: true });
    // terra firme e prédio de 10 andares (escala: 30 m)
    let i = nv.k;
    for (let k = 0; k < 2500; k++) { const xx = 1000 + (k * 37 % 80), yy = 700 + ((k * 53) % 700); if (yy > 730 - (xx - 1000) * 0.3) nv.ponto(i++, xx, yy, AREIA_C[0], AREIA_C[1], AREIA_C[2], 0.45, 2.8); }
    nv.total(i);
    predioP(nv, 990, 735, 80, 10, 27, 0.9, prng(6));
    // a enchente subindo sobre a terra
    const enche = PT.ss((t - tS) / (t30 - tS + 0.4));
    if (enche > 0) { let j = nv.k; const rr = prng(8); for (let k = 0; k < 3500; k++) { const xx = 940 + rr() * 140, yy = 735 - rr() * 270 * enche; const c2 = mixC(AGUA_C, [0.95, 0.98, 1], rr() < 0.15 ? 1 : 0); nv.ponto(j++, xx + Math.sin(t * 4 + k) * 3, yy, c2[0], c2[1], c2[2], 0.35 + 0.3 * rr(), 2.6); } nv.total(j); }
    // engarrafamento: os carros da frente param e os de trás encostam
    const aE = PT.jan(t, tE - 0.4, tAc - 0.3, 0.5, 0.5);
    if (aE > 0.01) {
      linhaP(x, 60, 470, 1020, 470, "143,227,255", 0.25 * aE, 2);
      carros.forEach((k) => {
        const parado = 860 - k * 52, solto = 860 - k * 88 + (t - tE) * 160;
        const xx = Math.min(solto, parado) + (k === 0 ? 0 : 0), freou = solto >= parado ? 1 : 0;
        for (let a2 = 0; a2 < 18; a2++) pontoP(x, xx - 20 + (a2 % 9) * 5, 452 + Math.floor(a2 / 9) * 7, 3, "220,230,255", 0.7 * aE);
        brilhoP(x, xx - 22, 460, 16, freou ? "255,80,80" : "255,200,120", (freou ? 0.9 : 0.4) * aE);
      });
    }
  });
};

// =============== 6. segurança: suba, várias ondas, o Brasil ===============
CENAS.seguranca = (el, c, B) => {
  const q = tempoPalavras(c), tR = B("recua"), tAl = B("alto"), tV = B("varias"), tMa = B("maior"), tB = B("brasil"), tL = B("longe"), tE = q("E", 0);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["suba", 340, 92, "suba para o alto", "pt-am"],
    ["onda1", 340, 64, "a 1ª nem sempre", "pt-fino"],
    ["onda2", 420, 96, "é a maior", "pt-ci"],
    ["risco", 340, 92, "risco muito baixo", "", "color:#06d6a0;text-shadow:0 0 34px rgba(6,214,160,0.8),0 0 100px rgba(6,214,160,0.45)"],
  ]);
  MD.slam(tl, tx.suba, tAl - 0.2, { from: 1.25 }); MD.leave(tl, tx.suba, tV - 0.6);
  MD.arrive(tl, tx.onda1, tV, { y: 14 }); MD.slam(tl, tx.onda2, tMa - 0.25, { from: 1.25 }); MD.leave(tl, [tx.onda1, tx.onda2], tB - 0.5);
  MD.slam(tl, tx.risco, q("baixo,") - 0.2, { from: 1.25 });
  const G = gradePraia(9), nv = T.nuvem(G.length + 16000);
  const ANDES = [[8, -79], [3, -80.5], [-2, -81.5], [-6, -81.5], [-10, -79.5], [-15, -76], [-19, -71.5], [-24, -71], [-29, -72], [-34, -73.5], [-39, -75], [-44, -76]];
  const DORSAL = [[12, -44], [6, -34], [1, -27], [-1, -18], [-6, -12], [-12, -14], [-17, -13.5], [-22, -12], [-27, -13], [-32, -14], [-37, -16], [-43, -16]];
  T.quadro((x, t) => {
    const vB = PT.ss((t - tB + 0.3) / 0.8), vP = 1 - vB;
    if (vP > 0.01) {
      const recuo = PT.inOut((t - tR + 0.3) / 2.2) * (1 - PT.ss((t - tV + 0.6) / 1.2));
      // várias ondas chegando: a 2ª é a maior
      const ondas = (Z, X, tt) => { if (tt < tV - 0.4) return 0; let s = 0; [[0, 14], [1, 34], [2, 20]].forEach(([k, A]) => { const zk = 1500 + k * 1100 + 400 - (tt - tV) * 160; s += A * PT.ss((tt - tV + 0.4) / 0.8) * Math.exp(-Math.pow((Z - zk) / 170, 2)); }); return s; };
      const P = desenharPraia(nv, G, t, { nivel: () => -44 * recuo, onda: ondas, morro: 1, vis: vP });
      // caminho até o alto do morro
      const aC = PT.jan(t, tAl - 0.4, tV - 0.4, 0.5, 0.6) * vP;
      if (aC > 0.01) for (let k = 0; k < 40; k++) { const u = k / 39, X = PT.lerp(-40, -560, u), Z = PT.lerp(300, 1700, u), hh = Math.max(0.05 * (900 - Z), 0) + morroH(X, Z) + 10; const sy = 640 + ((260 - hh) * 700) / Z, sx = 540 + (X * 700) / Z; const pulso = 0.5 + 0.5 * Math.sin(t * 6 - k * 0.6); pontoP(x, sx, sy, 6 * (1 - u * 0.6), "255,210,63", aC * (0.4 + 0.6 * pulso)); if (k === 39) brilhoP(x, sx, sy, 70, "255,210,63", aC); }
      if (t > tV - 0.4 && t < tB) [[0, "1ª"], [1, "2ª"], [2, "3ª"]].forEach(([k, nome]) => { const zk = 1500 + k * 1100 + 400 - (t - tV) * 160, sx = 540 + (520 * 700) / zk, sy = 640 + ((260 - [14, 34, 20][k] - 10) * 700) / zk; rotuloP(x, nome, sx, sy - 26, 42, k === 1 ? "143,227,255" : "220,230,255", PT.ss((t - tV) / 0.5) * vP); });
    }
    if (vB > 0.01) {
      const R = 450, cx = 540, cy = 930, proj = projGlobo(-14, -52, R, cx, cy);
      desenharGlobo(nv, x, proj, R, cx, cy, vB, [1.0, 0.82, 0.4]);
      // bordas das placas: fossa dos Andes e dorsal do Atlântico (brilham vermelhas, longe da nossa costa)
      const aL = PT.ss((t - tL + 0.3) / 0.6) * vB;
      [ANDES, DORSAL].forEach((L) => { for (let k = 0; k < L.length - 1; k++) for (let s = 0; s <= 10; s++) { const la = PT.lerp(L[k][0], L[k + 1][0], s / 10), lo = PT.lerp(L[k][1], L[k + 1][1], s / 10), [px, py, z] = proj(vec(la, lo)); if (z > 0) { pontoP(x, px, py, 4, "255,90,80", (0.4 + 0.5 * vB) * vB); if (s % 5 === 0) brilhoP(x, px, py, 22, "255,90,80", 0.4 * vB); } } });
      rotuloP(x, "BORDAS DAS PLACAS", 300, 1240, 26, "255,140,130", aL, "center");
    }
  });
};

// =============== 7. resumo em 4 passos + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [430, 640, 850, 1060];
  const textos = ["o fundo do mar dá um tranco", "levanta o oceano inteiro", "cruza o mar a 700 km/h", "e cresce quando chega no raso"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 34, 54, s, "", "left:270px;width:760px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => { MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 20 }); });
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 0.45);
  const nv = T.nuvem(3000), neb = ambienteP(2400, 21);
  T.quadro((x, t) => {
    brilhoP(x, 540, 900, 900, "60,140,255", 0.15);
    ambienteGPU(nv, neb.slice(0, 2400), t, [0.6, 0.85, 1.0], 0.5, -0.3);
    const sai = 1 - PT.ss((t - tC - 0.45) / 0.5), a = tP.map((tp) => PT.ss((t - tp + 0.2) / 0.4) * sai);
    // ícones de pontos
    if (a[0] > 0) { for (let k = 0; k < 40; k++) { pontoP(x, 110 + (k % 10) * 6, Y[0] + 10 + Math.floor(k / 10) * 6, 3, "200,130,80", a[0] * 0.8); pontoP(x, 175 + (k % 10) * 6, Y[0] - 8 + Math.floor(k / 10) * 6 - 10 * Math.abs(Math.sin(t * 3)), 3, "235,180,120", a[0] * 0.8); } }
    if (a[1] > 0) for (let k = 0; k < 60; k++) pontoP(x, 120 + (k % 12) * 9, Y[1] - 26 + Math.floor(k / 12) * 12 - 8 * Math.sin(t * 2), 3, "143,227,255", a[1] * (0.4 + 0.1 * Math.floor(k / 12)));
    if (a[2] > 0) { for (let k = 0; k < 40; k++) { const xx = 110 + k * 3; pontoP(x, xx, Y[2] - 6 * Math.exp(-Math.pow((xx - 110 - ((t * 120) % 120)) / 14, 2)), 3, "143,227,255", a[2]); } for (let k = 0; k < 4; k++) linhaP(x, 100 - k * 4, Y[2] + 12 + k * 6, 130 - k * 4, Y[2] + 12 + k * 6, "255,210,63", a[2] * 0.6, 2); }
    if (a[3] > 0) for (let k = 0; k < 40; k++) { const xx = 110 + k * 3, hh = 40 * Math.exp(-Math.pow((xx - 200) / 18, 2)); for (let j = 0; j < hh; j += 5) pontoP(x, xx, Y[3] + 20 - j, 3, j > hh - 6 ? "235,248,255" : "143,227,255", a[3] * 0.8); }
    a.forEach((v, k) => { if (v > 0) brilhoP(x, 160, Y[k], 110, "143,227,255", 0.1 * v); });
  });
  cartaoFinal(el, tC + 0.9);
};
