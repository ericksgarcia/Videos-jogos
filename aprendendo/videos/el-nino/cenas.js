// Cenas do vídeo "O que é o El Niño" — pontos de luz na GPU (motor/pontos-gpu.js).
// O globo de pontos mostra a temperatura do mar (azul = fria, laranja = quente); os ventos
// alísios são partículas correndo no Equador. Retenção: gancho com "água do outro lado do
// mundo", promessa (seca no Norte e chuva no Sul ao mesmo tempo), nome curioso e La Niña no fim.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const vecS = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
function projS(lat0, lon0, R, cx, cy) {
  const ca = Math.cos(-lon0 * Math.PI / 180), sa = Math.sin(-lon0 * Math.PI / 180), cb = Math.cos(lat0 * Math.PI / 180), sb = Math.sin(lat0 * Math.PI / 180);
  return (v) => { const x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca, y2 = v[1] * cb - z1 * sb, z2 = v[1] * sb + z1 * cb; return [cx + x1 * R, cy - y2 * R, z2, x1, y2]; };
}
// regiões do Brasil (aproximadas, só para colorir)
function regiaoBR(lat, lon) { if (lat < -24.5 || (lat < -22.5 && lon < -50)) return "S"; if (lon > -46.5 && lat > -18) return "NE"; if (lat > -13 && lon <= -46.5) return "N"; if (lon > -51 && lat < -14) return "SE"; return "CO"; }
const TERRA_M = new Set();
for (let k = 0; k < GLOBO_TERRA.length; k += 2) TERRA_M.add(`${Math.floor(GLOBO_TERRA[k] / 20)}:${Math.floor(GLOBO_TERRA[k + 1] / 20)}`);
for (let k = 0; k < GLOBO_BRASIL.length; k += 2) TERRA_M.add(`${Math.floor(GLOBO_BRASIL[k] / 20)}:${Math.floor(GLOBO_BRASIL[k + 1] / 20)}`);
const TERRA_P = [], MAR_P = [], BR_P = [];
(() => {
  const r = prng(17);
  for (let k = 0; k < GLOBO_TERRA.length; k += 2) { const lat = GLOBO_TERRA[k] / 10, lon = GLOBO_TERRA[k + 1] / 10; if (lon > -74 && lon < -34 && lat < 6 && lat > -34) continue; TERRA_P.push({ v: vecS(lat, lon), lat, lon }); }
  for (let k = 0; k < GLOBO_BRASIL.length; k += 2) for (let q = 0; q < 3; q++) { const lat = GLOBO_BRASIL[k] / 10 + (r() - 0.5) * 0.5, lon = GLOBO_BRASIL[k + 1] / 10 + (r() - 0.5) * 0.5; BR_P.push({ v: vecS(lat, lon), lat, lon, reg: regiaoBR(lat, lon), n: r() }); }
  const N = 30000, g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) { const y = 1 - (i + 0.5) * 2 / N, rr = Math.sqrt(1 - y * y), th = g * i, lat = Math.asin(y) * 180 / Math.PI, lon = ((th * 180 / Math.PI) % 360 + 540) % 360 - 180; if (TERRA_M.has(`${Math.floor(lat / 2)}:${Math.floor(lon / 2)}`)) continue; MAR_P.push({ v: [rr * Math.sin(th), y, rr * Math.cos(th)], lat, lon, n: r() }); }
})();
// temperatura da superfície do mar (0 = fria, 1 = quente); e: 0 normal, 1 El Niño, -1 La Niña
function tempMar(lat, lon, e) {
  const L = lon < 0 ? lon + 360 : lon, g = Math.exp(-Math.pow(lat / 9, 2)), trop = Math.exp(-Math.pow(lat / 26, 2));
  let T = 0.12 + 0.48 * trop;
  if (L > 100 && L < 290) {
    const pool = Math.exp(-Math.pow((L - 150) / 32, 2)) * Math.exp(-Math.pow(lat / 15, 2)), lingua = Math.exp(-Math.pow((L - 255) / 30, 2)) * g;
    const k = Math.max(0, e), kl = Math.max(0, -e);
    T += 0.32 * pool * (1 - 0.35 * k) - 0.42 * lingua * (1 - k) * (1 + 0.5 * kl) + 0.55 * k * Math.exp(-Math.pow((L - 235) / 42, 2)) * Math.exp(-Math.pow(lat / 11, 2));
  }
  return PT.cl(T);
}
const corTemp = (T) => T < 0.5 ? mixC([0.15, 0.4, 1.0], [0.55, 0.8, 1.0], T / 0.5) : mixC([0.95, 0.85, 0.6], [1.0, 0.32, 0.12], (T - 0.5) / 0.5);
// desenha o globo: o = {e, a, br (função região → [cor, alfa]) }
function desenharGlobo(nv, x, proj, R, cx, cy, o = {}) {
  const a = o.a ?? 1, e = o.e ?? 0, tam = Math.max(1, R / 330);
  brilhoP(x, cx, cy, R * 1.3, "60,140,255", 0.18 * a);
  anelP(x, cx, cy, R * 1.01, "143,227,255", 0.3 * a, 3);
  const gr = x.createRadialGradient(cx - R * 0.3, cy - R * 0.25, R * 0.05, cx, cy, R); gr.addColorStop(0, `rgba(70,130,255,${0.18 * a})`); gr.addColorStop(1, "rgba(20,40,120,0)"); x.fillStyle = gr; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
  let i = nv.k;
  for (const p of MAR_P) {
    const [px, py, z] = proj(p.v); if (z <= 0) continue;
    const T = tempMar(p.lat, p.lon, e), c = corTemp(T), forte = Math.abs(T - 0.5) * 2;
    nv.ponto(i++, px, py, c[0], c[1], c[2], a * (0.22 + 0.85 * forte) * (0.45 + 0.55 * z), 3.6 * tam);
  }
  for (const p of TERRA_P) { const [px, py, z] = proj(p.v); if (z <= 0) continue; nv.ponto(i++, px, py, 0.55, 0.9, 0.62, a * 0.7 * (0.4 + 0.6 * z), 3.6 * tam); }
  for (const p of BR_P) {
    const [px, py, z] = proj(p.v); if (z <= 0) continue;
    let c = [1.0, 0.82, 0.4], al = 0.55;
    if (o.br) { const r = o.br(p.reg, p); c = r[0]; al = r[1]; }
    nv.ponto(i++, px, py, c[0], c[1], c[2], a * al * 0.42 * (0.4 + 0.6 * z), 2.6 * tam);
  }
  nv.total(i);
}
// ventos alísios: partículas no Equador indo do leste para o oeste (força f)
const VENTO = (() => { const r = prng(29), out = []; for (let i = 0; i < 160; i++) out.push({ lat: (r() - 0.5) * 24, L0: 160 + r() * 120, v: 0.7 + r() * 0.6, f: r() }); return out; })();
function desenharVento(x, proj, t, f, a) {
  if (a <= 0.01) return;
  for (const w of VENTO) {
    const fase = ((t * 10 * w.v + w.f * 120) % 120), L = w.L0 + 30 - fase * Math.max(0.15, f) * 0.9;
    for (let s = 0; s < 7; s++) { const lon = L + s * 1.4 * Math.max(0.3, f), [px, py, z] = proj(vecS(w.lat, lon > 180 ? lon - 360 : lon)); if (z <= 0) continue; pontoP(x, px, py, 4.5 - s * 0.5, "235,245,255", a * (1 - s / 7) * 0.8 * Math.min(1, f + 0.15) * Math.sin(Math.PI * fase / 120)); }
  }
}
const rotGlobo = (x, proj, lat, lon, txt, cor, a, dy = 0, tam = 30) => { if (a <= 0) return; const [px, py, z] = proj(vecS(lat, lon)); if (z > 0.1) rotuloP(x, txt, px, py + dy, tam, cor, a * PT.cl(z * 2)); };
const est0 = (seed) => ambienteP(320, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.8);
const PAC = { lat: 2, lon: -160, R: 470, cx: 540, cy: 920 };

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tM = B("morna"), tQ = B("quente"), tN = B("nome"), tS = B("seca"), tE = B("encharca");
  mostrarGancho(tM + 1.6);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["nino", 330, 120, "EL NIÑO", "pt-la"]]);
  MD.slam(tl, tx.nino, tN - 0.05, { from: 1.5 }); MD.leave(tl, tx.nino, tS - 0.6);
  const nv = T.nuvem(60000), est = est0(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    const k = PT.inOut((t - tS + 1.0) / 1.8), lat = PT.lerp(PAC.lat, -15, k), lon = PT.lerp(PAC.lon, -55, k), R = PT.lerp(PAC.R, 900, k), cy = PT.lerp(PAC.cy, 960, k);
    const e = PT.ss((t - 0.3) / 3), proj = projS(lat, lon, R, 540, cy);
    const aS = PT.ss((t - tS + 0.2) / 0.6), aE = PT.ss((t - tE + 0.2) / 0.6);
    desenharGlobo(nv, x, proj, R, 540, cy, { e, a: PT.ss(t / 0.8), br: (r) => r === "N" || r === "NE" ? [mixC([1, 0.82, 0.4], [1, 0.45, 0.12], aS), 0.55 + 0.4 * aS] : r === "S" ? [mixC([1, 0.82, 0.4], [0.3, 0.6, 1], aE), 0.55 + 0.4 * aE] : [[1, 0.82, 0.4], 0.5] });
    if (k < 0.3) { const [px, py] = proj(vecS(0, -125)); brilhoP(x, px, py, 260, "255,120,40", 0.3 * e * (1 - k / 0.3)); }
    rotGlobo(x, proj, -5, -63, "SECA", "255,170,90", aS, 0, 44); rotGlobo(x, proj, -28, -52, "CHUVA", "150,200,255", aE, 0, 44);
    if (aE > 0) { const r = prng(4); for (let q = 0; q < 140; q++) { const la = -24 - r() * 8, lo = -56 + r() * 9, [px, py, z] = proj(vecS(la, lo)); const u = (t * 1.2 + r()) % 1; if (z > 0) linhaP(x, px, py - 60 + u * 60, px - 3, py - 40 + u * 60, "150,200,255", aE * 0.6 * Math.sin(u * Math.PI), 2); } }
  });
};

// =============== 2. o Pacífico normal ===============
CENAS.normal = (el, c, B) => {
  const tP = B("pacifico"), tA = B("alisios"), tAu = B("australia"), tB = B("banheira"), tF = B("fria");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pac", 330, 70, "Oceano Pacífico", "pt-ci"], ["ali", 330, 76, "ventos alísios", "pt-ci"], ["dir", 425, 46, "leste → oeste", "pt-fino"], ["ban", 330, 60, "um ventilador na banheira", "pt-am"]]);
  const tCo = B("continentes"), txc = palcoTexto(el, [["cont", 330, 62, "cabem todos os continentes", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.arrive(tl, tx.pac, tP - 0.1, { y: 14 }); MD.leave(tl, tx.pac, tCo - 0.3); MD.slam(tl, txc.cont, tCo - 0.05, { from: 1.3 }); MD.leave(tl, txc.cont, tA - 0.4); MD.slam(tl, tx.ali, tA - 0.05, { from: 1.3 }); MD.arrive(tl, tx.dir, tA + 0.5, { y: 14 }); MD.leave(tl, [tx.ali, tx.dir], tB - 0.5); MD.slam(tl, tx.ban, tB - 0.1, { from: 1.25 });
  const tFa = tempoPalavras(c)("falha"), tx2 = palcoTexto(el, [["fal", 330, 80, "...e se ele falhar?", "pt-ve"]]);
  MD.leave(tl, tx.ban, tFa - 0.4); MD.slam(tl, tx2.fal, tFa - 0.05, { from: 1.4 });
  const nv = T.nuvem(60000), est = est0(5);
  T.quadro((x, t) => {
    estD(x, est, t);
    const proj = projS(PAC.lat, PAC.lon + Math.sin(t * 0.1) * 3, PAC.R, PAC.cx, PAC.cy);
    desenharGlobo(nv, x, proj, PAC.R, PAC.cx, PAC.cy, { e: 0 });
    desenharVento(x, proj, t, 1, PT.ss((t - tA + 0.3) / 0.8));
    const aCo = PT.jan(t, tCo - 0.2, tA - 0.3, 0.4, 0.5); if (aCo > 0) { brilhoP(x, PAC.cx, PAC.cy, PAC.R * 1.3, "120,180,255", 0.12 * aCo); anelP(x, PAC.cx, PAC.cy, PAC.R * (1.02 + 0.06 * Math.sin((t - tCo) * 3)), "143,227,255", 0.7 * aCo, 6); }
    rotGlobo(x, proj, -25, 134, "AUSTRÁLIA", "150,255,190", PT.ss((t - tAu + 0.3) / 0.5));
    if (t > tAu - 0.3) { const [px, py] = proj(vecS(0, 150)); brilhoP(x, px, py, 200, "255,120,40", 0.4 * PT.ss((t - tAu + 0.3) / 0.6)); rotGlobo(x, proj, 12, 150, "ÁGUA QUENTE", "255,180,110", PT.ss((t - tAu) / 0.6)); }
    rotGlobo(x, proj, -12, -62, "AMÉRICA DO SUL", "150,255,190", PT.ss((t - tF + 1.2) / 0.5), 0, 26);
    // água fria subindo perto do Peru
    const aF = PT.ss((t - tF + 0.3) / 0.6);
    if (aF > 0) { const r = prng(6); for (let q = 0; q < 70; q++) { const la = -12 + r() * 14, lo = -90 - r() * 25, [px, py, z] = proj(vecS(la, lo)), u = (t * 0.6 + r()) % 1; if (z > 0) pontoP(x, px, py + 20 - u * 40, 5, "120,190,255", aF * Math.sin(u * Math.PI)); } rotGlobo(x, proj, -16, -100, "ÁGUA FRIA", "150,200,255", aF, 0, 30); }
  });
};

// =============== 3. o El Niño ===============
CENAS.nino = (el, c, B) => {
  const tF = B("fraco"), tV = B("volta"), tP = B("peru"), tFa = B("faixa"), tM = B("menino"), tN = tM;
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["anos", 330, 64, "a cada 2 a 7 anos", "pt-ci"], ["fra", 425, 46, "os ventos enfraquecem", "pt-fino"], ["km", 330, 66, "milhares de km", "pt-la"], ["men", 330, 96, "isso é o El Niño", "pt-la"]]);
  MD.arrive(tl, tx.anos, c.ini + 0.6, { y: 14 }); MD.arrive(tl, tx.fra, tF - 0.2, { y: 14 }); MD.leave(tl, [tx.anos, tx.fra], tFa - 0.6);
  MD.slam(tl, tx.km, tFa - 0.05, { from: 1.25 }); MD.leave(tl, tx.km, tM - 0.4); MD.slam(tl, tx.men, tM - 0.05, { from: 1.35 });
  const nv = T.nuvem(60000), est = est0(7);
  T.quadro((x, t) => {
    estD(x, est, t);
    const proj = projS(PAC.lat, PAC.lon + Math.sin(t * 0.1) * 3, PAC.R, PAC.cx, PAC.cy);
    const f = 1 - 0.85 * PT.ss((t - tF + 0.5) / 1.5), e = PT.inOut((t - tV + 0.3) / 3.5);
    desenharGlobo(nv, x, proj, PAC.R, PAC.cx, PAC.cy, { e });
    desenharVento(x, proj, t, f, 1);
    if (e > 0.05) { const [px, py] = proj(vecS(0, -125)); brilhoP(x, px, py, 300, "255,110,40", 0.35 * e); }
    // setas da água quente voltando para o leste
    const aV = PT.jan(t, tV - 0.2, tFa - 0.2, 0.4, 0.5);
    if (aV > 0) for (let q = 0; q < 3; q++) { const u = ((t - tV) * 0.35 + q / 3) % 1, lon = 160 + u * 90, [px, py, z] = proj(vecS(0, lon > 180 ? lon - 360 : lon)); if (z > 0) { discoP(x, px, py, 12, "255,200,120", aV * Math.sin(u * Math.PI)); brilhoP(x, px, py, 50, "255,140,60", 0.5 * aV * Math.sin(u * Math.PI)); } }
    rotGlobo(x, proj, -9, -76, "PERU", "150,255,190", PT.ss((t - tP + 0.3) / 0.5), 0, 30);
    const aK = PT.jan(t, tFa - 0.2, tN, 0.4, 0.5);
    if (aK > 0) { x.setLineDash([12, 10]); const pts = [[-12, 175], [12, 175], [12, -85], [-12, -85]]; x.strokeStyle = `rgba(255,210,63,${0.85 * aK})`; x.lineWidth = 4; x.beginPath(); for (let s = 0; s <= 4; s++) { const [la, lo] = pts[s % 4], [la2, lo2] = pts[(s + 1) % 4]; for (let u = 0; u <= 20; u++) { const L = lo + (lo2 - lo + (Math.abs(lo2 - lo) > 180 ? (lo2 > lo ? -360 : 360) : 0)) * u / 20, la3 = la + (la2 - la) * u / 20, [px, py, z] = proj(vecS(la3, ((L + 540) % 360) - 180)); if (z > 0) (s === 0 && u === 0 ? x.moveTo(px, py) : x.lineTo(px, py)); } } x.stroke(); x.setLineDash([]); }
  });
};

// =============== 4. o mundo sente: corte lateral (oceano, ar subindo, chuva) ===============
CENAS.mundo = (el, c, B) => {
  const tB = B("brasil"), tE = B("esquenta"), tS = B("sobe"), tC = B("chuva"), tF = B("fogao");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["lon", 330, 66, "tão longe?", "pt-ci"], ["sob", 330, 66, "água quente → ar sobe", "pt-la"], ["chu", 330, 66, "a chuva muda de lugar", "pt-ci"], ["fog", 330, 60, "mudou o fogão de lugar", "pt-am"]]);
  MD.arrive(tl, tx.lon, tB - 0.1, { y: 14 }); MD.leave(tl, tx.lon, tS - 0.5); MD.slam(tl, tx.sob, tS - 0.05, { from: 1.25 }); MD.leave(tl, tx.sob, tC - 0.3); MD.slam(tl, tx.chu, tC + 0.1, { from: 1.25 }); MD.leave(tl, tx.chu, tF - 0.4); MD.slam(tl, tx.fog, tF - 0.05, { from: 1.25 });
  const tEs = tempoPalavras(c)("estranha"), tx2 = palcoTexto(el, [["est", 330, 80, "a parte estranha", "pt-la"]]);
  MD.leave(tl, tx.fog, tEs - 0.4); MD.slam(tl, tx2.est, tEs - 0.05, { from: 1.4 });
  const nv = T.nuvem(40000), est = est0(9), Y0 = 1120, Y1 = 1330;
  const NUV = (() => { const r = prng(10), o = []; for (let i = 0; i < 9000; i++) { const a = r() * 6.283, d = Math.sqrt(r()); o.push({ dx: Math.cos(a) * d * 230 * (0.7 + 0.3 * r()), dy: -Math.abs(Math.sin(a)) * d * 110 + r() * 30, n: r() }); } return o; })();
  T.quadro((x, t) => {
    estD(x, est, t);
    const mov = PT.inOut((t - tC + 0.4) / 3), cxQ = PT.lerp(260, 760, mov);  // centro da água quente (vai do oeste para o leste)
    const aE = PT.ss((t - tE + 0.3) / 0.6);
    // o mar em corte: colunas de pontos com a cor da temperatura
    let i = nv.k; const r = prng(12);
    for (let q = 0; q < 14000; q++) { const px = r() * 1080, py = Y0 + r() * (Y1 - Y0), prof = (py - Y0) / (Y1 - Y0), quente = Math.exp(-Math.pow((px - cxQ) / 240, 2)) * (1 - 0.6 * prof) * aE; const T2 = PT.cl(0.3 + 0.75 * quente - 0.2 * prof), cc = corTemp(T2); nv.ponto(i++, px + Math.sin(t + q) * 2, py, cc[0], cc[1], cc[2], 0.4 + 0.6 * Math.abs(T2 - 0.5) * 2, 4); }
    // nuvem de chuva sobre a água quente
    const aN = PT.ss((t - tS) / 1.2);
    if (aN > 0) for (const p of NUV) { const px = cxQ + p.dx + Math.sin(t * 0.5 + p.n * 9) * 6, py = 660 + p.dy; nv.ponto(i++, px, py, 0.82, 0.88, 1.0, aN * (0.25 + 0.35 * p.n), 3.5); }
    nv.total(i);
    // ar subindo
    const aS = PT.ss((t - tS + 0.3) / 0.6);
    if (aS > 0) { const rr = prng(13); for (let q = 0; q < 90; q++) { const u = (t * 0.25 + rr()) % 1, px = cxQ + (rr() - 0.5) * 300, py = Y0 - 20 - u * (Y0 - 760); pontoP(x, px + Math.sin(u * 8 + q) * 10, py, 5, "255,190,130", aS * 0.8 * Math.sin(u * Math.PI)); } }
    // chuva
    const aC = PT.ss((t - tC + 0.2) / 0.6);
    if (aC > 0) { const rr = prng(14); for (let q = 0; q < 160; q++) { const u = (t * 0.9 + rr()) % 1, px = cxQ + (rr() - 0.5) * 380, py = 760 + u * (Y0 - 780); linhaP(x, px, py, px - 4, py + 26, "150,200,255", aC * 0.7 * Math.sin(u * Math.PI), 2.5); } }
    rotuloP(x, "OESTE (ÁSIA)", 140, Y1 + 40, 28, "200,215,255", 0.8, "left"); rotuloP(x, "LESTE (AMÉRICAS)", 940, Y1 + 40, 28, "200,215,255", 0.8, "right");
    if (aE > 0) rotuloP(x, "ÁGUA QUENTE", cxQ, Y0 + 70, 32, "255,226,170", aE);
  });
};

// =============== 5. no Brasil ===============
CENAS.brasil = (el, c, B) => {
  const tD = B("dividido"), tN = B("norte"), tS = B("sul"), tE = B("enchente"), tC = B("calor"), tF = B("forte");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["div", 330, 76, "um país dividido", "pt-am"], ["for", 330, 72, "este ano: muito forte", "pt-la"]]);
  MD.slam(tl, tx.div, tD - 0.05, { from: 1.25 }); MD.leave(tl, tx.div, tF - 0.5); MD.slam(tl, tx.for, tF - 0.05, { from: 1.3 });
  const tDi = B("dica"), txd = palcoTexto(el, [["dic", 330, 64, "beba água antes da sede", "pt-ci"], ["sol", 420, 46, "e fuja do sol das 10h às 16h", "pt-fino"]]);
  MD.leave(tl, tx.for, tDi - 2.2); MD.slam(tl, txd.dic, tDi - 1.9, { from: 1.25 }); MD.arrive(tl, txd.sol, tDi + 0.9, { y: 14 });
  const nv = T.nuvem(50000), est = est0(11), R = 1000, cy = 980;
  T.quadro((x, t) => {
    estD(x, est, t);
    const proj = projS(-15 + Math.sin(t * 0.15) * 0.6, -53, R, 540, cy);
    const aN = PT.ss((t - tN + 0.2) / 0.6), aS = PT.ss((t - tS + 0.2) / 0.6), aE = PT.ss((t - tE) / 0.5), aC = PT.ss((t - tC + 0.2) / 0.6), pul = 0.8 + 0.2 * Math.sin(t * 4);
    desenharGlobo(nv, x, proj, R, 540, cy, { e: 1, br: (r, p) => r === "N" || r === "NE" ? [mixC([1, 0.82, 0.4], [1, 0.5, 0.12], aN), 0.5 + 0.45 * aN] : r === "S" ? [mixC([1, 0.82, 0.4], [0.3, 0.6, 1], aS), 0.5 + 0.45 * aS] : [mixC([1, 0.82, 0.4], [1, 0.22, 0.2], aC), (0.5 + 0.45 * aC) * (aC > 0 ? pul : 1)] });
    // rótulos fora do mapa, com linha de chamada (dentro do mapa o brilho apaga o texto)
    const call = (lat, lon, tx2, ty2, txt, cor, a) => { if (a <= 0) return; const [px, py, z] = proj(vecS(lat, lon)); if (z <= 0) return; discoP(x, px, py, 7, cor, a); linhaP(x, px, py, tx2, ty2, cor, a * 0.8, 3); rotuloP(x, txt, tx2 + (tx2 < 540 ? -10 : 10), ty2 - 26, 44, cor, a, tx2 < 540 ? "right" : "left"); };
    call(-4, -62, 300, 560, "SECA", "255,170,90", aN); call(-7, -40, 930, 600, "SECA", "255,170,90", aN);
    call(-28, -52, 250, 1300, "CHUVA", "150,200,255", aS);
    if (aE > 0 || aS > 0) { const r = prng(4), aa = Math.max(aS, aE); for (let q = 0; q < 180; q++) { const la = -24 - r() * 9, lo = -57 + r() * 10, [px, py, z] = proj(vecS(la, lo)), u = (t * 1.2 + r()) % 1; if (z > 0) linhaP(x, px, py - 70 + u * 70, px - 3, py - 46 + u * 70, "150,200,255", aa * 0.6 * Math.sin(u * Math.PI), 2); } }
    call(-18, -47, 900, 1200, "CALOR", "255,120,110", aC);
    // ondas de calor: anéis saindo do centro
    if (aC > 0) for (let q = 0; q < 3; q++) { const u = ((t - tC) * 0.5 + q / 3) % 1, [px, py] = proj(vecS(-17, -48)); anelP(x, px, py, 40 + u * 220, "255,120,90", aC * 0.5 * (1 - u), 4); }
  });
};

// =============== 6. e depois? La Niña e o balanço ===============
CENAS.depois = (el, c, B) => {
  const tC = B("contrario"), tM = B("menina"), tE = B("esfria"), tT = B("troca"), tB = B("balanco");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["lan", 330, 86, "La Niña = a menina", "pt-ci"], ["tro", 330, 54, "chuva no Norte, seca no Sul", "pt-am", "white-space:normal;left:60px;width:960px"], ["bal", 330, 70, "vai e volta", "pt-ci"]]);
  MD.slam(tl, tx.lan, tM - 0.05, { from: 1.35 }); MD.leave(tl, tx.lan, tT - 0.4); MD.slam(tl, tx.tro, tT - 0.05, { from: 1.2 }); MD.leave(tl, tx.tro, tB - 0.5); MD.slam(tl, tx.bal, tB - 0.05, { from: 1.25 });
  const nv = T.nuvem(60000), est = est0(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    const proj = projS(PAC.lat, PAC.lon + Math.sin(t * 0.1) * 3, PAC.R, PAC.cx, PAC.cy);
    let e = 1 - 2 * PT.inOut((t - tC + 0.2) / 3);
    if (t > tB - 0.3) e = PT.lerp(-1, Math.cos((t - tB + 0.3) * 1.4 + Math.PI), PT.ss((t - tB + 0.3) / 0.8));
    const f = e < 0 ? 1 + 0.8 * -e : 1 - 0.85 * e;
    desenharGlobo(nv, x, proj, PAC.R, PAC.cx, PAC.cy, { e });
    desenharVento(x, proj, t, f, 1);
    const [px, py] = proj(vecS(0, -120)); brilhoP(x, px, py, 280, e > 0 ? "255,110,40" : "80,150,255", 0.3 * Math.abs(e));
    rotuloP(x, e > 0.15 ? "EL NIÑO" : e < -0.15 ? "LA NIÑA" : "", 540, 1450, 40, e > 0 ? "255,170,90" : "150,200,255", PT.cl(Math.abs(e) * 1.5) * PT.ss((t - tB) / 0.5));
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["os ventos do Pacífico enfraquecem", "a água quente se espalha", "a chuva muda de lugar", "seca no Norte, chuva no Sul, calor no meio"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 50, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const nv = T.nuvem(60000), est = est0(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5), proj = projS(PAC.lat, PAC.lon, 260, 540, 1290);
    desenharGlobo(nv, x, proj, 260, 540, 1290, { e: Math.sin(t * 0.6), a: 0.75 * sai });
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, ["143,227,255", "255,138,61", "150,200,255", "255,210,63"][k], a); brilhoP(x, 160, Y[k], 50, "255,200,140", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
