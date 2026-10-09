// Cenas do vídeo "Você está a 1.500 km/h agora" — pontos de luz na GPU (motor/pontos-gpu.js).
// Retenção: número de impacto no 1º segundo, escalada de velocidades até a galáxia (promessa
// paga no fim), analogia do café no avião, virada "e se parasse?" e alívio no final.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const vecS = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
const TERRA_M = new Set();
for (let k = 0; k < GLOBO_TERRA.length; k += 2) TERRA_M.add(`${Math.floor(GLOBO_TERRA[k] / 20)}:${Math.floor(GLOBO_TERRA[k + 1] / 20)}`);
for (let k = 0; k < GLOBO_BRASIL.length; k += 2) TERRA_M.add(`${Math.floor(GLOBO_BRASIL[k] / 20)}:${Math.floor(GLOBO_BRASIL[k + 1] / 20)}`);
const TERRA_P = [];
(() => {
  const r = prng(17);
  for (let k = 0; k < GLOBO_TERRA.length; k += 2) TERRA_P.push({ v: vecS(GLOBO_TERRA[k] / 10, GLOBO_TERRA[k + 1] / 10), lat: GLOBO_TERRA[k] / 10, terra: 1, n: r() });
  for (let k = 0; k < GLOBO_BRASIL.length; k += 3) TERRA_P.push({ v: vecS(GLOBO_BRASIL[k] / 10, GLOBO_BRASIL[k + 1] / 10), lat: GLOBO_BRASIL[k] / 10, terra: 1, br: 1, n: r() });
  const N = 16000, g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) { const y = 1 - (i + 0.5) * 2 / N, rr = Math.sqrt(1 - y * y), th = g * i, lat = Math.asin(y) * 180 / Math.PI, lon = ((th * 180 / Math.PI) % 360 + 540) % 360 - 180; if (TERRA_M.has(`${Math.floor(lat / 2)}:${Math.floor(lon / 2)}`)) continue; TERRA_P.push({ v: [rr * Math.sin(th), y, rr * Math.cos(th)], lat, terra: 0, n: r() }); }
})();
function projS(lat0, lon0, R, cx, cy) {
  const ca = Math.cos(-lon0 * Math.PI / 180), sa = Math.sin(-lon0 * Math.PI / 180), cb = Math.cos(lat0 * Math.PI / 180), sb = Math.sin(lat0 * Math.PI / 180);
  return (v) => { const x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca, y2 = v[1] * cb - z1 * sb, z2 = v[1] * sb + z1 * cb; return [cx + x1 * R, cy - y2 * R, z2, x1, y2]; };
}
const LUZ = [-0.55, 0.45, 0.7];
function desenharTerra(nv, x, proj, R, cx, cy, o = {}) {
  const a = o.a ?? 1, L = o.L || LUZ;
  brilhoP(x, cx, cy, R * 1.35, "60,140,255", 0.2 * a);
  anelP(x, cx, cy, R * 1.01, "143,227,255", 0.35 * a, 3);
  const g = x.createRadialGradient(cx + L[0] * R * 0.55, cy - L[1] * R * 0.55, R * 0.05, cx, cy, R); g.addColorStop(0, `rgba(90,150,255,${0.2 * a})`); g.addColorStop(0.7, `rgba(40,80,200,${0.08 * a})`); g.addColorStop(1, "rgba(20,40,120,0)"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
  let i = nv.k; const tam = Math.max(1, R / 300);
  for (const p of TERRA_P) {
    const [px, py, z, nx, ny] = proj(p.v); if (z <= 0) continue;
    const dia = Math.max(0, nx * L[0] + ny * L[1] + z * L[2]);
    let c, al;
    if (p.br && o.brasil) { c = [1.0, 0.82, 0.4]; al = 0.5 + 0.5 * dia; }
    else if (p.terra) { c = [0.45 + 0.45 * dia, 0.88, 0.55 + 0.35 * (1 - dia)]; al = Math.min(1, 0.25 + 1.2 * dia); }
    else { c = [0.3, 0.55, 1.0]; al = 0.12 + 0.8 * dia; }
    nv.ponto(i++, px, py, c[0], c[1], c[2], a * al * (0.55 + 0.45 * z), (p.terra ? 3.4 : 3) * tam);
  }
  nv.total(i);
}
// paralelo (círculo de latitude) desenhado em pontos sobre o globo
function paraleloP(x, proj, lat, cor, a, w = 4, t = 0, corre = 0) {
  for (let k = 0; k < 240; k++) { const lon = k * 1.5 - 180, [px, py, z] = proj(vecS(lat, lon)); if (z <= 0) continue; const brilho = corre ? 0.4 + 0.6 * Math.pow(0.5 + 0.5 * Math.sin(k * 0.26 - t * 5), 8) : 1; pontoP(x, px, py, w, cor, a * brilho * (0.4 + 0.6 * z)); }
}
// galáxia espiral de pontos
const GALAXIA = (() => { const r = prng(31), out = [], N = 60000; for (let i = 0; i < N; i++) { const nucleo = r() < 0.18; if (nucleo) { const rr = Math.pow(r(), 2) * 120, a = r() * 6.283; out.push({ r: rr, a, h: (r() - 0.5) * 30, c: 0, n: r() }); continue; } const braco = Math.floor(r() * 2), rr = 60 + Math.pow(r(), 0.8) * 520, a = braco * Math.PI + Math.log(rr / 60) * 2.3 + (r() - 0.5) * (0.5 + 0.4 * r()) , poeira = r() < 0.12; out.push({ r: rr, a, h: (r() - 0.5) * 14, c: poeira ? 2 : 1, n: r() }); } return out; })();
function desenharGalaxia(nv, x, cx, cy, esc, t, a, inc = 0.45) {
  brilhoP(x, cx, cy, 260 * esc, "255,220,160", 0.5 * a); brilhoP(x, cx, cy, 700 * esc, "140,160,255", 0.15 * a);
  let i = nv.k;
  for (const p of GALAXIA) {
    const ang = p.a + t * 0.05 * (300 / (p.r + 80)), px = Math.cos(ang) * p.r, py = Math.sin(ang) * p.r * inc + p.h * (1 - inc);
    const c = p.c === 0 ? [1.0, 0.85, 0.6] : p.c === 2 ? [1.0, 0.45, 0.6] : mixC([0.75, 0.82, 1.0], [0.55, 0.7, 1.0], p.n);
    nv.ponto(i++, cx + px * esc, cy + py * esc, c[0], c[1], c[2], a * (p.c === 0 ? 0.6 : 0.35 + 0.35 * p.n), 2.6);
  }
  nv.total(i);
}
// Sol (para a cena da órbita)
function solP(x, cx, cy, R, t, a) { brilhoP(x, cx, cy, R * 3, "255,150,50", 0.35 * a); brilhoP(x, cx, cy, R * 1.5, "255,210,120", 0.6 * a); discoP(x, cx, cy, R, "255,230,170", 0.95 * a); for (let k = 0; k < 24; k++) { const b = k / 24 * 6.283 + t * 0.2, l = R * (1.3 + 0.3 * Math.sin(t * 3 + k)); linhaP(x, cx + Math.cos(b) * R * 1.05, cy + Math.sin(b) * R * 1.05, cx + Math.cos(b) * l, cy + Math.sin(b) * l, "255,200,110", 0.4 * a, 3); } }
// avião de pontos (de lado), nariz para a direita
function aviaoP(nv, cx, cy, esc, ang, a) {
  let i = nv.k; const r = prng(8), c = Math.cos(ang), s = Math.sin(ang);
  const P = (u, v) => [cx + (u * c - v * s) * esc, cy + (u * s + v * c) * esc];
  for (let k = 0; k < 2200; k++) { const u = (r() - 0.5) * 300, lim = 22 * Math.sqrt(Math.max(0, 1 - Math.pow(u / 150, 2))), v = (r() - 0.5) * 2 * lim; const [px, py] = P(u, v); nv.ponto(i++, px, py, 0.88, 0.92, 1.0, a * 0.85, 3); }
  for (let k = 0; k < 700; k++) { const u = r(), v = r(); const [px, py] = P(-20 - u * 60 + v * 40, 10 + u * 60); nv.ponto(i++, px, py, 0.75, 0.85, 1.0, a * 0.5, 2.6); }
  for (let k = 0; k < 400; k++) { const u = r(); const [px, py] = P(-130 - u * 30, -20 - u * 55 * r()); nv.ponto(i++, px, py, 0.75, 0.85, 1.0, a * 0.5, 2.6); }
  for (let k = 0; k < 9; k++) { const [px, py] = P(-60 + k * 18, -6); nv.ponto(i++, px, py, 1.0, 0.85, 0.45, a, 3.4); }
  nv.total(i);
}
// xícara de café de pontos; inclinação da superfície (rad) e respingo
function xicaraP(x, cx, cy, incl, resp, a) {
  for (let k = 0; k <= 40; k++) { const u = k / 40; pontoP(x, cx - 110 + u * 20, cy - 140 + u * 140, 3, "235,240,255", a); pontoP(x, cx + 110 - u * 20, cy - 140 + u * 140, 3, "235,240,255", a); pontoP(x, cx - 90 + u * 180, cy, 3, "235,240,255", a); }
  for (let k = 0; k < 20; k++) { const b = -Math.PI / 2 + k / 19 * Math.PI; pontoP(x, cx + 108 + Math.cos(b) * 40, cy - 80 + Math.sin(b) * 40, 3, "235,240,255", a); }
  const sy = cy - 110;
  for (let k = 0; k <= 60; k++) { const u = k / 60, xx = cx - 104 + u * 208, yy = sy + (xx - cx) * Math.tan(incl); for (let j = 0; j < 6; j++) pontoP(x, xx, Math.max(yy, sy - 30) + j * 6, 3.2, "190,120,60", a * (0.9 - j * 0.1)); }
  if (resp > 0) for (let k = 0; k < 18; k++) { const b = -Math.PI / 2 + (k - 9) * 0.12, d = resp * (60 + (k % 5) * 20); discoP(x, cx + 100 + Math.cos(b) * d * 0.6, sy - 20 + Math.sin(b) * d - resp * resp * 40 * (k % 3), 4, "190,120,60", a * resp); }
  for (let k = 0; k < 3; k++) for (let j = 0; j < 12; j++) { const u = ((j / 12) + 0) % 1; pontoP(x, cx - 30 + k * 30 + Math.sin(u * 8 + k) * 10, sy - 40 - u * 120, 3, "235,240,255", a * 0.3 * (1 - u)); }
}

// =============== 1. gancho: você está a 1.500 km/h ===============
CENAS.abertura = (el, c, B) => {
  const q = tempoPalavras(c), tP = B("parado"), tM = B("mil"), tC = B("comeco"), tO = B("oitocentos"), tN = B("nada");
  mostrarGancho(tM - 0.4);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["v1", 330, 150, "1.500 km/h", "pt-am"], ["v2", 330, 130, "800.000 km/h", "pt-ci"], ["nada", 330, 86, "sem sentir nada", "pt-fino"]]);
  MD.slam(tl, tx.v1, tM - 0.1, { from: 1.4 }); MD.leave(tl, tx.v1, tC + 0.5);
  MD.slam(tl, tx.v2, tO - 0.1, { from: 1.4 }); MD.leave(tl, tx.v2, tN - 0.4); MD.slam(tl, tx.nada, tN - 0.1, { from: 1.2 });
  const nv = T.nuvem(70000), est = ambienteP(400, 5);
  T.quadro((x, t) => {
    est.forEach((s) => pontoP(x, s.x, s.y, 1 + 2 * s.z, "220,230,255", (0.2 + 0.5 * s.z) * (0.6 + 0.4 * Math.sin(t * 2 + s.f))));
    const afasta = PT.inOut((t - tC) / 2.5), vG = 1 - PT.ss((t - tO + 1.2) / 0.8), vGa = PT.ss((t - tO + 1.2) / 0.8) * (1 - PT.ss((t - tN + 0.6) / 0.6));
    if (vG > 0.01) {
      const R = PT.lerp(380, 60, afasta), cx = 540, cy = PT.lerp(900, 900, afasta), lon0 = -46 - (t - 3) * 18, proj = projS(-15, lon0, R, cx, cy);
      desenharTerra(nv, x, proj, R, cx, cy, { a: vG, brasil: 1 });
      // "você": São Paulo, girando junto
      const [px, py, z] = proj(vecS(-23.5, -46.6)); if (z > 0) { brilhoP(x, px, py, 40, "255,210,63", vG); discoP(x, px, py, 7, "255,255,255", vG); if (afasta < 0.3) rotuloP(x, "VOCÊ", px + 26, py - 20, 30, "255,226,140", vG * (1 - afasta * 3), "left"); }
      if (afasta > 0) { const ang = t * 0.6; for (let k = 0; k < 120; k++) { const b = k / 120 * 6.283; pontoP(x, 540 + Math.cos(b) * 300, 900 + Math.sin(b) * 120, 2.4, "143,227,255", 0.3 * afasta * vG); } }
    }
    if (vGa > 0.01) desenharGalaxia(nv, x, 540, 900, 1.0, t, vGa);
    if (t > tN - 0.3) { const a = PT.ss((t - tN + 0.3) / 0.5); brilhoP(x, 540, 960, 600, "143,227,255", 0.15 * a); }
  });
};

// =============== 2. o giro: 40.000 km em 24 h ===============
CENAS.giro = (el, c, B) => {
  const q = tempoPalavras(c), tG = B("gira"), tE = B("equador"), tQ = B("quarenta"), tC = B("conta"), tB = B("brasil"), tA = B("aviao");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["q", 330, 96, "40.000 km", "pt-am"], ["div", 440, 60, "÷ 24 horas", "pt-fino"], ["res", 330, 130, "1.670 km/h", "pt-am"], ["br", 330, 110, "≈ 1.500 km/h", "pt-am"], ["av", 450, 48, "avião: ~900 km/h", "pt-fino"]]);
  MD.slam(tl, tx.q, tQ - 0.1, { from: 1.3 }); MD.arrive(tl, tx.div, tQ + 0.6, { y: 14 }); MD.leave(tl, [tx.q, tx.div], tC + 0.6);
  MD.slam(tl, tx.res, tC + 0.8, { from: 1.4 }); MD.leave(tl, tx.res, tB - 0.3);
  MD.slam(tl, tx.br, tB - 0.1, { from: 1.3 }); MD.arrive(tl, tx.av, tA - 0.1, { y: 14 });
  const nv = T.nuvem(36000);
  T.quadro((x, t) => {
    const R = 400, cx = 540, cy = 930, proj = projS(-12, -50 - (t - c.ini) * 14, R, cx, cy);
    desenharTerra(nv, x, proj, R, cx, cy, { brasil: 1 });
    const aE = PT.ss((t - tE + 0.2) / 0.5) * (1 - 0.6 * PT.ss((t - tB) / 0.6));
    if (aE > 0) paraleloP(x, proj, 0, "255,210,63", aE, 5, t, PT.ss((t - tQ) / 0.5));
    const aB = PT.ss((t - tB + 0.2) / 0.5);
    if (aB > 0) paraleloP(x, proj, -23.5, "255,138,61", aB, 5, t, 1);
    // avião correndo ao lado (mais devagar que o chão)
    const aA = PT.ss((t - tA + 0.4) / 0.5);
    if (aA > 0) for (let k = 0; k < 30; k++) pontoP(x, 120 + ((t - tA) * 120) % 840 - k * 3, 560, 3, "235,240,255", aA * (1 - k / 30));
  });
};

// =============== 3. por que não sente: o café no avião ===============
CENAS.sentir = (el, c, B) => {
  const q = tempoPalavras(c), tS = B("sente"), tM = B("mudanca"), tCa = B("cafe"), tCu = B("curva"), tI = B("igual"), tJ = B("juntos"), tDe = q("decolagem,");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["vel", 330, 80, "velocidade: não sente", "pt-fino", "white-space:normal;left:60px;width:960px"],
    ["mud", 430, 80, "mudança: sente", "pt-am"],
    ["jun", 330, 110, "tudo junto", "pt-ci"],
  ]);
  MD.arrive(tl, tx.vel, tS + 0.4, { y: 14 }); MD.slam(tl, tx.mud, tM - 0.1, { from: 1.3 }); MD.leave(tl, [tx.vel, tx.mud], tCa - 0.3);
  MD.slam(tl, tx.jun, tJ - 0.15, { from: 1.3 });
  const nv = T.nuvem(40000), r = prng(4), nuvens = Array.from({ length: 900 }, () => ({ x: r() * 2200, y: 1150 + r() * 220, n: r() }));
  T.quadro((x, t) => {
    const vA = PT.jan(t, tS - 0.3, tI - 0.3, 0.6, 0.6), vT = PT.ss((t - tI + 0.3) / 0.8);
    if (vA > 0.01) {
      // avião voando reto; nuvens passam embaixo; o café não derrama — até a curva/freada
      const sacode = Math.max(0, Math.sin((t - tDe) * 9) * Math.exp(-(t - tDe) * 2)) * (t > tDe ? 1 : 0) + (t > tCu ? Math.sin((t - tCu) * 7) * Math.exp(-(t - tCu) * 1.5) : 0);
      nuvens.forEach((n) => pontoP(x, ((n.x - t * 300) % 2200 + 2200) % 2200 - 560, n.y, 4, "220,230,255", vA * (0.2 + 0.25 * n.n)));
      aviaoP(nv, 540, 470 + sacode * 20, 2.2, sacode * 0.15, vA);
      xicaraP(x, 540, 1040, sacode * 0.35, Math.abs(sacode) > 0.5 ? (Math.abs(sacode) - 0.5) * 2 : 0, vA);
      rotuloP(x, Math.abs(sacode) > 0.2 ? "MUDOU A VELOCIDADE: SENTE" : "VELOCIDADE CONSTANTE", 540, 1150, 30, Math.abs(sacode) > 0.2 ? "255,138,61" : "143,227,255", PT.ss((t - tCa + 0.3) / 0.5) * vA);
    }
    if (vT > 0.01) {
      // a Terra gira sempre igual; o ar gira junto (rastros acompanhando o chão)
      const R = 380, cx = 540, cy = 930, lon0 = -50 - (t - c.ini) * 14, proj = projS(-12, lon0, R, cx, cy);
      desenharTerra(nv, x, proj, R, cx, cy, { a: vT, brasil: 1 });
      for (let k = 0; k < 80; k++) { const la = -60 + (k % 12) * 10, lo0 = (k * 47) % 360 - 180; for (let j = 0; j < 6; j++) { const [px, py, z] = proj(vecS(la, lo0 - j * 2)); if (z > 0) pontoP(x, px, py, 3, "220,240,255", vT * 0.5 * (1 - j / 6) * z); } }
    }
  });
};

// =============== 4. mais rápido: em volta do Sol e da galáxia ===============
CENAS.orbita = (el, c, B) => {
  const q = tempoPalavras(c), tS = B("sol"), tBi = B("bilhao"), tC = B("cento"), tL = B("lactea"), tO = B("oitocentos"), tD = B("duzentos");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["bi", 330, 76, "quase 1 bilhão de km", "pt-fino", "white-space:normal;left:60px;width:960px"],
    ["v1", 330, 130, "107.000 km/h", "pt-am"],
    ["v2", 330, 120, "800.000 km/h", "pt-ci"], ["volta", 460, 48, "1 volta: 230 milhões de anos", "pt-fino", "white-space:normal;left:60px;width:960px"],
  ]);
  MD.arrive(tl, tx.bi, tBi - 0.1, { y: 14 }); MD.leave(tl, tx.bi, tC - 0.3); MD.slam(tl, tx.v1, tC - 0.1, { from: 1.4 }); MD.leave(tl, tx.v1, tL - 0.6);
  MD.slam(tl, tx.v2, tO - 0.1, { from: 1.4 }); MD.arrive(tl, tx.volta, tD - 0.1, { y: 14 });
  const nv = T.nuvem(70000), est = ambienteP(300, 9);
  T.quadro((x, t) => {
    est.forEach((s) => pontoP(x, s.x, s.y, 1 + 2 * s.z, "220,230,255", (0.15 + 0.4 * s.z)));
    const zoom = PT.inOut((t - tL + 1) / 2.2), vS = 1 - PT.ss((zoom - 0.6) / 0.4);
    if (vS > 0.01) {
      // vista de cima: Sol no centro, a Terra em órbita deixando rastro
      const esc = PT.lerp(1, 0.05, zoom), cx = PT.lerp(540, 760, zoom), cy = PT.lerp(900, 980, zoom), R = 380 * esc;
      solP(x, cx, cy, 70 * esc + 6, t, vS);
      for (let k = 0; k < 200; k++) { const b = k / 200 * 6.283; pontoP(x, cx + Math.cos(b) * R, cy + Math.sin(b) * R * 0.9, 2.2, "143,227,255", 0.35 * vS * PT.ss((t - tBi + 0.3) / 0.5) + 0.12 * vS); }
      const ang = (t - c.ini) * 0.35, ex = cx + Math.cos(ang) * R, ey = cy + Math.sin(ang) * R * 0.9;
      for (let k = 1; k < 40; k++) { const b = ang - k * 0.02; pontoP(x, cx + Math.cos(b) * R, cy + Math.sin(b) * R * 0.9, 4 * esc + 1, "143,227,255", vS * (1 - k / 40)); }
      desenharTerra(nv, x, projS(-10, -t * 30, Math.max(6, 34 * esc), ex, ey), Math.max(6, 34 * esc), ex, ey, { a: vS });
    }
    // zoom até a Via Láctea: "você está aqui"
    const vG = PT.ss((zoom - 0.35) / 0.5);
    if (vG > 0.01) {
      desenharGalaxia(nv, x, 540, 900, PT.lerp(4, 0.95, PT.ss((zoom - 0.35) / 0.65)), t, vG);
      const sx = 540 + Math.cos(2.4 + t * 0.03) * 390 * 0.95, sy = 900 + Math.sin(2.4 + t * 0.03) * 390 * 0.95 * 0.45;
      if (zoom > 0.9) { brilhoP(x, sx, sy, 50, "255,210,63", vG); discoP(x, sx, sy, 6, "255,255,255", vG); rotuloP(x, "VOCÊ ESTÁ AQUI", sx, sy + 40, 28, "255,226,140", vG); }
      if (t > tO - 0.2) { const a = PT.ss((t - tO + 0.2) / 0.5); for (let k = 0; k < 160; k++) { const b = k / 160 * 6.283; pontoP(x, 540 + Math.cos(b) * 370, 900 + Math.sin(b) * 370 * 0.45, 2.4, "255,210,63", 0.4 * a); } }
    }
  });
};

// =============== 5. e se parasse? ===============
CENAS.parar = (el, c, B) => {
  const q = tempoPalavras(c), tP = B("para"), tS = B("sentir"), tO = B("oceanos"), tL = B("leste"), tF = B("furacao");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["sen", 330, 96, "aí você ia sentir", "pt-ve"], ["leste", 330, 110, "→ 1.500 km/h", "pt-ci"], ["fur", 450, 52, "mais forte que um furacão", "pt-fino", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.sen, tS - 0.15, { from: 1.3 }); MD.leave(tl, tx.sen, tL - 0.4); MD.slam(tl, tx.leste, tL - 0.1, { from: 1.3 }); MD.arrive(tl, tx.fur, tF - 0.1, { y: 14 });
  const nv = T.nuvem(36000), r = prng(21), vento = Array.from({ length: 1400 }, () => ({ la: (r() - 0.5) * 150, lo: r() * 360 - 180, v: 0.5 + r(), n: r() }));
  T.quadro((x, t) => {
    // gira normalmente e para de repente (com um tranco)
    const giro = -(t < tP ? (t - c.ini) * 14 : (tP - c.ini) * 14 + 6 * (1 - Math.exp(-(t - tP) * 8)));
    const tranco = t > tP ? Math.exp(-(t - tP) * 4) * Math.sin((t - tP) * 40) * 10 : 0;
    const R = 400, cx = 540 + tranco, cy = 930, proj = projS(-12, -50 + giro, R, cx, cy);
    desenharTerra(nv, x, proj, R, cx, cy, { brasil: 1 });
    if (t > tP && t < tP + 1) brilhoP(x, 540, 930, 900, "239,71,111", 0.35 * (1 - (t - tP)));
    // o ar e a água continuam para o leste, varrendo o planeta
    const aV = PT.ss((t - tO + 0.8) / 1.2) * (1 + PT.ss((t - tF) / 0.6));
    if (aV > 0) vento.forEach((w) => { const desl = ((t - tO) * 40 * w.v) % 360; for (let j = 0; j < 8; j++) { const [px, py, z] = proj(vecS(w.la, w.lo + desl - j * 2.5)); if (z > 0) pontoP(x, px, py, 3.2, j ? "143,227,255" : "255,255,255", Math.min(1, aV) * (1 - j / 8) * z * 0.8); } });
  });
};

// =============== 6. calma: o dia cresce 2 milésimos de segundo por século ===============
CENAS.calma = (el, c, B) => {
  const q = tempoPalavras(c), tC = B("calma"), tF = B("freando"), tMs = B("ms"), tS = B("seculo");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["cal", 330, 130, "calma", "pt-am"], ["fre", 330, 58, "a Terra está freando", "pt-fino"], ["ms", 330, 120, "+2 ms", "pt-ci"], ["sec", 460, 48, "por século", "pt-fino"]]);
  MD.slam(tl, tx.cal, tC + 0.05, { from: 1.3 }); MD.leave(tl, tx.cal, tF - 0.3); MD.arrive(tl, tx.fre, tF, { y: 14 }); MD.leave(tl, tx.fre, tMs - 0.3);
  MD.slam(tl, tx.ms, tMs - 0.1, { from: 1.4 }); MD.arrive(tl, tx.sec, tS - 0.1, { y: 14 });
  const nv = T.nuvem(36000);
  T.quadro((x, t) => {
    const R = 360, cx = 540, cy = 960, proj = projS(-12, -50 - (t - c.ini) * 10, R, cx, cy);
    desenharTerra(nv, x, proj, R, cx, cy, { brasil: 1 });
    // cronômetro de pontos girando devagar
    const aR = PT.ss((t - tMs + 0.3) / 0.5);
    if (aR > 0) { for (let k = 0; k < 60; k++) { const b = k / 60 * 6.283; pontoP(x, 540 + Math.cos(b) * 450, 960 + Math.sin(b) * 450, k % 5 ? 2.4 : 5, "255,226,140", aR * 0.7); } const b = -Math.PI / 2 + (t - tMs) * 0.8; linhaP(x, 540, 960, 540 + Math.cos(b) * 420, 960 + Math.sin(b) * 420, "255,210,63", aR, 4); }
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 660, 840, 1020], textos = ["gira a ~1.500 km/h", "em volta do Sol a 107.000 km/h", "pela galáxia a 800.000 km/h", "e só sente quando a velocidade muda"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 0.45);
  const nv = T.nuvem(62000);
  T.quadro((x, t) => {
    const sai = 1 - PT.ss((t - tC - 0.45) / 0.5);
    desenharGalaxia(nv, x, 540, 1300, 1.1, t, 0.35 * sai);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, ["143,227,255", "255,210,63", "200,210,255", "190,120,60"][k], a); brilhoP(x, 160, Y[k], 50, "200,200,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 0.9);
};
