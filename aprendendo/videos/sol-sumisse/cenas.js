// Cenas do vídeo "E se o Sol sumisse agora" — pontos de luz na GPU (motor/pontos-gpu.js).
// Técnicas de retenção: paradoxo no gancho, promessa paga só no fim (vislumbre da fonte
// hidrotermal no começo), contagem regressiva, ganchos no fim das partes e virada final.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const vecS = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
const TERRA_M = new Set();
for (let k = 0; k < GLOBO_TERRA.length; k += 2) TERRA_M.add(`${Math.floor(GLOBO_TERRA[k] / 20)}:${Math.floor(GLOBO_TERRA[k + 1] / 20)}`);
for (let k = 0; k < GLOBO_BRASIL.length; k += 2) TERRA_M.add(`${Math.floor(GLOBO_BRASIL[k] / 20)}:${Math.floor(GLOBO_BRASIL[k + 1] / 20)}`);
// pontos da Terra: terra (continentes reais) + oceano (para a esfera inteira ter luz e gelo)
const TERRA_P = [];
(() => {
  const r = prng(17);
  for (let k = 0; k < GLOBO_TERRA.length; k += 2) TERRA_P.push({ v: vecS(GLOBO_TERRA[k] / 10, GLOBO_TERRA[k + 1] / 10), lat: GLOBO_TERRA[k] / 10, terra: 1, n: r() });
  for (let k = 0; k < GLOBO_BRASIL.length; k += 4) TERRA_P.push({ v: vecS(GLOBO_BRASIL[k] / 10, GLOBO_BRASIL[k + 1] / 10), lat: GLOBO_BRASIL[k] / 10, terra: 1, n: r() });
  const N = 16000, g = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) { const y = 1 - (i + 0.5) * 2 / N, rr = Math.sqrt(1 - y * y), th = g * i, lat = Math.asin(y) * 180 / Math.PI, lon = ((th * 180 / Math.PI) % 360 + 540) % 360 - 180; if (TERRA_M.has(`${Math.floor(lat / 2)}:${Math.floor(lon / 2)}`)) continue; TERRA_P.push({ v: [rr * Math.sin(th), y, rr * Math.cos(th)], lat, terra: 0, n: r() }); }
})();
function projS(lat0, lon0, R, cx, cy) {
  const ca = Math.cos(-lon0 * Math.PI / 180), sa = Math.sin(-lon0 * Math.PI / 180), cb = Math.cos(lat0 * Math.PI / 180), sb = Math.sin(lat0 * Math.PI / 180);
  return (v) => { const x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca, y2 = v[1] * cb - z1 * sb, z2 = v[1] * sb + z1 * cb; return [cx + x1 * R, cy - y2 * R, z2, x1, y2]; };
}
// o: { luz 0..1, L [x,y,z] direção do Sol (câmera), cidades 0..1, gelo (latitude a partir da qual há gelo; 90 = nada), a }
function desenharTerra(nv, x, proj, R, cx, cy, o) {
  const a = o.a ?? 1, L = o.L || [-0.7, 0.35, 0.62], luz = o.luz ?? 1, gl = o.gelo ?? 90;
  brilhoP(x, cx, cy, R * 1.35, "60,140,255", 0.18 * a * (0.3 + 0.7 * luz));
  anelP(x, cx, cy, R * 1.01, "143,227,255", (0.12 + 0.3 * luz) * a, 3);
  // volume: lado do dia iluminado e névoa branca do gelo
  if (luz > 0.01) { const g = x.createRadialGradient(cx + L[0] * R * 0.55, cy - L[1] * R * 0.55, R * 0.05, cx, cy, R); g.addColorStop(0, `rgba(90,150,255,${0.5 * luz * a})`); g.addColorStop(0.7, `rgba(40,80,200,${0.18 * luz * a})`); g.addColorStop(1, "rgba(20,40,120,0)"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill(); }
  const fracGelo = 1 - gl / 90;
  if (fracGelo > 0.01) { const g = x.createRadialGradient(cx, cy, R * 0.2, cx, cy, R); g.addColorStop(0, `rgba(200,230,255,${0.12 * fracGelo * a})`); g.addColorStop(1, `rgba(200,230,255,${0.35 * fracGelo * a})`); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill(); }
  let i = nv.k;
  for (const p of TERRA_P) {
    const [px, py, z, nx, ny] = proj(p.v); if (z <= 0) continue;
    const dia = Math.max(0, nx * L[0] + ny * L[1] + z * L[2]) * luz, gelo = Math.abs(p.lat) > gl ? 1 : 0;
    let c, al;
    if (gelo) { c = [0.88, 0.96, 1.0]; al = 0.75 + 0.25 * dia; }
    else if (p.terra) { c = [0.45 + 0.45 * dia, 0.88, 0.55 + 0.35 * (1 - dia)]; al = Math.min(1, 0.2 + 1.3 * dia); }
    else { c = [0.3, 0.55, 1.0]; al = 0.1 + 0.9 * dia; }
    nv.ponto(i++, px, py, c[0], c[1], c[2], a * al * (0.55 + 0.45 * z), (p.terra ? 3.4 : 3) * Math.max(1, R / 300));
    if (o.cidades && p.terra && p.n < 0.14 && dia < 0.15) nv.ponto(i++, px, py, 1.0, 0.8, 0.4, a * o.cidades * (0.8 + 0.2 * Math.sin(p.n * 300 + (o.t || 0))), 4.2);
  }
  nv.total(i);
}
// o Sol: esfera de pontos com granulação, borda mais escura e coroa; k: 0 inteiro, 1 sumiu (encolhe até o centro)
const SOL_P = (() => { const r = prng(23), N = 22000, g = Math.PI * (3 - Math.sqrt(5)), out = []; for (let i = 0; i < N; i++) { const y = 1 - (i + 0.5) * 2 / N, rr = Math.sqrt(1 - y * y), th = g * i; out.push({ v: [rr * Math.sin(th), y, rr * Math.cos(th)], f: r() * 6.283, n: r() }); } return out; })();
function desenharSol(nv, x, cx, cy, R, t, k = 0, a = 1) {
  const s = 1 - k, aa = a * (1 - PT.ss((k - 0.6) / 0.4));
  if (aa <= 0.002) return;
  brilhoP(x, cx, cy, R * 2.6 * s + 20, "255,150,50", 0.35 * aa);
  brilhoP(x, cx, cy, R * 1.4 * s + 10, "255,210,120", 0.5 * aa);
  let i = nv.k; const ca = Math.cos(t * 0.15), sa = Math.sin(t * 0.15);
  for (const p of SOL_P) {
    const xr = p.v[0] * ca + p.v[2] * sa, z = -p.v[0] * sa + p.v[2] * ca; if (z <= 0) continue;
    const gran = 0.65 + 0.35 * Math.sin(t * 2.2 + p.f + Math.sin(t * 0.7 + p.n * 9) * 2), borda = 0.35 + 0.65 * z;
    const b = gran * borda;
    nv.ponto(i++, cx + xr * R * s, cy - p.v[1] * R * s, 1.0, 0.5 + 0.45 * b, 0.12 + 0.5 * b * b, aa * (0.35 + 0.5 * b), 3.2);
  }
  // coroa: jatos de partículas saindo da borda
  const r = prng(41);
  for (let j = 0; j < 2600; j++) { const ang = r() * 6.283, u = (t * (0.08 + 0.12 * r()) + r()) % 1, rr = R * s * (1 + 0.55 * u * (0.5 + r())); nv.ponto(i++, cx + Math.cos(ang) * rr, cy + Math.sin(ang) * rr, 1.0, 0.75, 0.35, aa * 0.35 * (1 - u), 2.4); }
  nv.total(i);
}
// fluxo de fótons (pontos andando de A para B); apenas os que estão entre "fim" e "começo" da luz
function fotons(nv, ax, ay, bx, by, t, dens, a, corte0 = 0, corte1 = 1) {
  let i = nv.k; const r = prng(5), d = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / d, ny = (bx - ax) / d;
  for (let j = 0; j < dens; j++) { const u = (r() + t * 0.35) % 1, lado = (r() - 0.5) * 70 * (0.3 + u); if (u < corte0 || u > corte1) { r(); continue; } nv.ponto(i++, ax + (bx - ax) * u + nx * lado, ay + (by - ay) * u + ny * lado, 1.0, 0.85, 0.5, a * (0.35 + 0.4 * r()), 2.6); }
  nv.total(i);
}
const LUZ_TERRA = [-0.55, 0.55, 0.62];

// =============== 1. gancho: o Sol some... e nada acontece ===============
CENAS.abertura = (el, c, B) => {
  const q = tempoPalavras(c), tS = B("some"), tN = B("nada"), tT = B("tempo"), tA = B("susto"), tU = B("unico");
  mostrarGancho(tN - 0.6);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["relogio", 350, 170, "08:20", "pt-ci"],
    ["final", 360, 52, "só no final", "pt-am"],
    ["lugar", 430, 56, "onde a vida continua", "pt-fino"],
  ]);
  MD.slam(tl, tx.relogio, tT - 0.05, { from: 1.5 }); MD.leave(tl, tx.relogio, tA - 0.3);
  MD.arrive(tl, tx.final, tU - 0.3, { y: 14 }); MD.arrive(tl, tx.lugar, tU, { y: 14 });
  const nv = T.nuvem(60000), est = ambienteP(300, 3);
  T.quadro((x, t) => {
    est.forEach((s) => pontoP(x, s.x, s.y, 1 + 2 * s.z, "220,230,255", (0.2 + 0.5 * s.z) * (0.6 + 0.4 * Math.sin(t * 2 + s.f))));
    const k = PT.ss((t - tS) / 0.35), sx = 440, sy = 820, ex = 800, ey = 1270;
    desenharSol(nv, x, sx, sy, 230, t, k);
    if (t > tS && t < tS + 1.2) { const u = t - tS; anelP(x, sx, sy, 40 + u * 900, "255,236,190", 0.8 * Math.exp(-u * 2.5), 5); brilhoP(x, sx, sy, 500, "255,250,230", Math.exp(-u * 6)); }
    // a luz que já estava a caminho continua chegando (o "fim" da luz vai avançando bem devagar)
    fotons(nv, sx, sy, ex, ey, t, 2600, 1, t > tS ? PT.cl((t - tS) * 0.02) : 0, 1);
    desenharTerra(nv, x, projS(-10, -45, 95, ex, ey), 95, ex, ey, { luz: 1, L: LUZ_TERRA, t });
    // susto: a tela pulsa em vermelho; vislumbre do final (fonte hidrotermal) quando fala do "único lugar"
    if (t > tA - 0.1 && t < tA + 0.8) brilhoP(x, 540, 960, 1300, "239,71,111", 0.25 * Math.sin((t - tA + 0.1) / 0.9 * Math.PI));
    const v = PT.jan(t, tU - 0.2, c.fim, 0.6, 0.4);
    if (v > 0) { brilhoP(x, 540, 1380, 420, "255,120,40", 0.5 * v); for (let j = 0; j < 160; j++) { const u = (t * 0.25 + j / 160) % 1; pontoP(x, 540 + Math.sin(j * 7.1) * 60 * u + Math.sin(t + j) * 8, 1420 - u * 360, 3, "255,150,60", v * (1 - u) * 0.8); } rotuloP(x, "?", 540, 1180, 90, "255,200,120", v * 0.9); }
  });
};

// =============== 2. os 8 minutos: a luz e a gravidade ainda a caminho ===============
CENAS.oito = (el, c, B) => {
  const q = tempoPalavras(c), tL = B("luz"), tC = B("chega"), tG = B("gravidade"), tGi = B("gira"), tE = B("existe");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["rel", 330, 140, "08:20", "pt-ci"], ["luzl", 480, 44, "a luz ainda a caminho", "pt-fino"], ["grav", 480, 44, "a gravidade também", "pt-fino"]]);
  MD.slam(tl, tx.rel, c.ini + 0.2, { from: 1.2 }); MD.arrive(tl, tx.luzl, tL, { y: 14 }); MD.leave(tl, tx.luzl, tG - 0.4); MD.arrive(tl, tx.grav, tG, { y: 14 });
  const fimLuz = c.fim + 3.4;                               // a luz acaba de chegar em "apaga" (cena seguinte)
  const raio = (t) => 400 * PT.cl((t - c.ini + 6) / (fimLuz - c.ini + 6));
  aCadaQuadro((t) => { if (t < c.ini - 0.5 || t > c.fim) return; const rest = Math.max(0, 500 * (1 - raio(t) / 400)), m = Math.floor(rest / 60), s = Math.floor(rest % 60); tx.rel.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`; });
  const nv = T.nuvem(50000), r = prng(7), fot = Array.from({ length: 20000 }, () => ({ ang: r() * 6.283, u: r(), v: r() }));
  T.quadro((x, t) => {
    const cx = 540, cy = 900, R = 400, ri = raio(t);
    // lugar vazio do Sol
    for (let k = 0; k < 90; k++) { const b = k / 90 * 6.283; pontoP(x, cx + Math.cos(b) * 70, cy + Math.sin(b) * 70, 2.4, "255,200,120", 0.35 + 0.25 * Math.sin(t * 6 + k)); }
    rotuloP(x, "SOL", cx, cy, 30, "255,210,140", 0.6 + 0.3 * PT.jan(t, tE - 0.2, c.fim, 0.2, 0.3) * Math.abs(Math.sin(t * 12)));
    // casca de luz: fótons saindo, do raio interno (escuro) para fora
    let i = nv.k;
    for (const f of fot) { const rr = ri + (((f.u + t * 0.06) % 1) * (1100 - ri)); nv.ponto(i++, cx + Math.cos(f.ang) * rr, cy + Math.sin(f.ang) * rr, 1.0, 0.8, 0.45, 0.55 + 0.35 * f.v * PT.ss((t - tL + 0.5) / 0.6), 3.2); }
    nv.total(i);
    const rL = prng(77);
    for (let k = 0; k < 900; k++) { const ang = rL() * 6.283, u = (rL() + t * 0.18) % 1, r0 = ri + u * (1150 - ri), l = 18 + 30 * rL(); linhaP(x, cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0, cx + Math.cos(ang) * (r0 + l), cy + Math.sin(ang) * (r0 + l), "255,215,140", 0.35 + 0.35 * PT.ss((t - tL + 0.5) / 0.6), 2); }
    anelP(x, cx, cy, ri, "255,220,150", 0.6, 3);
    if (t > tG - 0.2) for (let k = 0; k < 3; k++) anelP(x, cx, cy, ri - k * 14, "143,227,255", PT.ss((t - tG + 0.2) / 0.5) * (0.8 - k * 0.25), 3);
    // órbita e a Terra girando em volta de um Sol que já não existe
    for (let k = 0; k < 180; k++) { const b = k / 180 * 6.283; pontoP(x, cx + Math.cos(b) * R, cy + Math.sin(b) * R, 2, "143,227,255", 0.25 + 0.3 * PT.ss((t - tGi + 0.3) / 0.5)); }
    const ang = -0.6 + t * 0.12, ex = cx + Math.cos(ang) * R, ey = cy + Math.sin(ang) * R;
    desenharTerra(nv, x, projS(-10, -45 + t * 8, 60, ex, ey), 60, ex, ey, { luz: 1, L: [-Math.cos(ang), Math.sin(ang), 0.4], t });
    if (t > tC - 0.2 && t < tC + 1) { const u = t - tC + 0.2; anelP(x, ex, ey, 60 + u * 200, "255,236,190", 0.6 * (1 - u), 3); }
    if (t > tGi) for (let k = 1; k < 30; k++) { const b = ang - k * 0.02; pontoP(x, cx + Math.cos(b) * R, cy + Math.sin(b) * R, 4, "143,227,255", 0.6 * (1 - k / 30)); }
  });
};

// =============== 3. o céu apaga; a Terra sai pela tangente ===============
CENAS.escuro = (el, c, B) => {
  const q = tempoPalavras(c), tAp = B("apaga"), tLu = B("lua"), tSem = q("Sem"), tRe = B("reta"), tBa = B("barbante"), tSo = B("solta"), tPi = B("pior");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pior", 340, 96, "o pior ainda não chegou", "pt-ve", "white-space:normal;left:90px;width:900px"]]);
  MD.slam(tl, tx.pior, tPi - 0.15, { from: 1.25 });
  const nv = T.nuvem(50000), est = ambienteP(500, 8);
  T.quadro((x, t) => {
    const vG = 1 - PT.ss((t - tSem + 0.3) / 0.8), vO = 1 - vG;
    est.forEach((s) => pontoP(x, s.x, s.y, 1 + 2 * s.z, "220,230,255", (0.15 + 0.5 * s.z) * (0.6 + 0.4 * Math.sin(t * 2 + s.f)) * (0.5 + 0.5 * PT.ss((t - tAp) / 1))));
    if (vG > 0.01) {
      // o "fim da luz" varre o globo: o lado do dia apaga e surgem as luzes das cidades
      const luz = 1 - PT.ss((t - tAp) / 0.5), R = 380, cx = 540, cy = 880;
      desenharTerra(nv, x, projS(-12, -50 + t * 2, R, cx, cy), R, cx, cy, { luz, L: LUZ_TERRA, cidades: PT.ss((t - tAp - 0.3) / 1.2), a: vG, t });
      const lua = 1 - PT.ss((t - tLu) / 0.6);
      discoP(x, 900, 420, 46, "230,232,240", 0.85 * lua * vG); brilhoP(x, 900, 420, 120, "230,232,240", 0.3 * lua * vG);
      if (t > tAp && t < tAp + 0.8) brilhoP(x, cx, cy, 700, "255,240,210", 0.5 * (1 - (t - tAp) / 0.8) * vG);
    }
    if (vO > 0.01) {
      // vista de cima: a Terra sai pela tangente e segue reto
      const cx = 540, cy = 1000, R = 270, ang0 = -0.6 + tRe * 0.12, solto = Math.max(0, t - tRe);
      for (let k = 0; k < 180; k++) { const b = k / 180 * 6.283; pontoP(x, cx + Math.cos(b) * R, cy + Math.sin(b) * R, 2, "143,227,255", 0.3 * vO); }
      const ang = t < tRe ? -0.6 + t * 0.12 : ang0, tx0 = -Math.sin(ang0), ty0 = Math.cos(ang0);
      const ex = cx + Math.cos(ang) * R + tx0 * solto * 70, ey = cy + Math.sin(ang) * R + ty0 * solto * 70;
      if (t > tRe) for (let k = 0; k < 40; k++) { const u = k / 40 * solto * 70; pontoP(x, cx + Math.cos(ang0) * R + tx0 * u, cy + Math.sin(ang0) * R + ty0 * u, 3, "255,210,63", 0.6 * vO); }
      desenharTerra(nv, x, projS(-10, -45 + t * 8, 40, ex, ey), 40, ex, ey, { luz: 0, cidades: 1, a: vO, t });
      // analogia: bola girando presa num barbante, que solta
      const a2 = PT.jan(t, tBa - 0.4, tPi - 0.4, 0.5, 0.5) * vO;
      if (a2 > 0.01) {
        const ox = 540, oy = 520, rr = 110, w = 7, angB = t < tSo ? t * w : tSo * w, sb = Math.max(0, t - tSo);
        const bx = ox + Math.cos(angB) * rr - Math.sin(angB) * rr * w * sb * 0.5, by = oy + Math.sin(angB) * rr + Math.cos(angB) * rr * w * sb * 0.5;
        discoP(x, ox, oy, 6, "255,255,255", a2);
        if (t < tSo) linhaP(x, ox, oy, bx, by, "220,230,255", 0.8 * a2, 3);
        discoP(x, bx, by, 26, "255,138,61", a2); brilhoP(x, bx, by, 70, "255,138,61", 0.5 * a2);
      }
    }
  });
};

// =============== 4. o frio: gelo dos polos ao equador, plantas e cadeia alimentar ===============
CENAS.frio = (el, c, B) => {
  const q = tempoPalavras(c), tF = B("frio"), tSe = B("semana"), t18 = B("menos18"), t73 = B("menos73"), tPl = B("plantas"), tD = B("desaba"), tSu = B("surpresa"), tMa = q("Mas");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["t1", 330, 130, "−18 °C", "pt-ci"], ["s1", 470, 44, "em 1 semana", "pt-fino"],
    ["t2", 330, 130, "−73 °C", "pt-ci"], ["s2", 470, 44, "em 1 ano", "pt-fino"],
    ["fot", 340, 64, "sem fotossíntese", "pt-fino"],
    ["sur", 340, 72, "a parte mais surpreendente…", "pt-am", "white-space:normal;left:90px;width:900px"],
  ]);
  MD.arrive(tl, tx.s1, tSe - 0.1, { y: 14 }); MD.slam(tl, tx.t1, t18 - 0.1, { from: 1.3 }); MD.leave(tl, [tx.t1, tx.s1], t73 - 1.2);
  MD.arrive(tl, tx.s2, t73 - 0.9, { y: 14 }); MD.slam(tl, tx.t2, t73 - 0.1, { from: 1.3 }); MD.leave(tl, [tx.t2, tx.s2], tPl - 0.3);
  MD.arrive(tl, tx.fot, tPl + 0.2, { y: 14 }); MD.leave(tl, tx.fot, tMa - 0.3);
  MD.slam(tl, tx.sur, tSu - 0.3, { from: 1.2 });
  const nv = T.nuvem(45000), r = prng(3);
  // planta de pontos (caule + folhas) e pirâmide de alimentos
  const planta = []; for (let k = 0; k < 500; k++) { const u = r(); planta.push({ x: (r() - 0.5) * 6, y: -u * 300, folha: 0, n: r() }); }
  for (let f = 0; f < 6; f++) for (let k = 0; k < 600; k++) { const lado = f % 2 ? 1 : -1, l = 110 - f * 10, u = r(), w = Math.sin(u * Math.PI) * 22 * (r() - 0.5) * 2; planta.push({ x: lado * u * l, y: -70 - f * 38 - u * l * 0.35 + w, folha: 1, n: r(), f }); }
  const piramide = []; [[5, "143,227,120"], [4, "200,230,140"], [3, "255,200,120"], [2, "255,138,61"], [1, "239,71,111"]].forEach(([n, cor], nivel) => { for (let k = 0; k < n; k++) piramide.push({ nivel, x: (k - (n - 1) / 2) * 90, cor, n: r() }); });
  T.quadro((x, t) => {
    const vG = 1 - PT.ss((t - tPl + 0.4) / 0.7), vP = PT.jan(t, tPl - 0.4, tSu - 0.6, 0.7, 0.6);
    if (vG > 0.01) {
      const gelo = 90 - 72 * PT.ss((t - tSe) / (t73 - tSe + 1.5)), R = 360, cx = 540, cy = 900;
      desenharTerra(nv, x, projS(-12, -50 + t * 2, R, cx, cy), R, cx, cy, { luz: 0.12, gelo, cidades: 1 - PT.ss((t - t18) / 4), a: vG, t });
      brilhoP(x, cx, cy, 700, "143,227,255", 0.12 * (1 - gelo / 90) * vG);
    }
    if (vP > 0.01) {
      // a planta perde o verde e murcha; a cadeia de alimentos desaba
      const murcha = PT.ss((t - tPl) / 3), px = 290, py = 1260;
      planta.forEach((p) => { const cai = p.folha ? murcha * (40 + p.n * 40) : 0, cor = p.folha ? PT.mix([80, 220, 120], [120, 110, 100], murcha) : PT.mix([90, 170, 90], [110, 100, 90], murcha); pontoP(x, px + p.x * 1.7 * (1 - 0.2 * murcha), py + (p.y + cai * (p.y / -300)) * 1.5, 3.4, cor, vP * (0.75 - 0.3 * murcha)); });
      piramide.forEach((p) => { const qd = PT.ss((t - tD - p.nivel * 0.12) / 0.8), y = 1180 - p.nivel * 100 + qd * (400 + p.n * 200), xx = 760 + p.x * 0.55 + qd * (p.n - 0.5) * 200; discoP(x, xx, y, 20, p.cor, vP * (1 - qd) * 0.85); brilhoP(x, xx, y, 46, p.cor, 0.25 * vP * (1 - qd)); });
    }
    if (t > tSu - 0.5) brilhoP(x, 540, 1300, 600, "255,150,60", 0.3 * PT.ss((t - tSu + 0.5) / 1));
  });
};

// =============== 5. debaixo do gelo: o cobertor e o calor de dentro da Terra ===============
CENAS.oceano = (el, c, B) => {
  const q = tempoPalavras(c), tC = B("congela"), tCo = B("cobertor"), tL = B("liquida"), tCa = B("calor");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["cob", 340, 110, "cobertor", "pt-ci"], ["liq", 340, 110, "líquida", "pt-ci"], ["cal", 340, 72, "calor de dentro da Terra", "pt-la", "white-space:normal;left:90px;width:900px"]]);
  MD.slam(tl, tx.cob, tCo - 0.1, { from: 1.3 }); MD.leave(tl, tx.cob, tL - 0.4); MD.slam(tl, tx.liq, tL - 0.1, { from: 1.3 }); MD.leave(tl, tx.liq, tCa - 0.4); MD.slam(tl, tx.cal, tCa - 0.1, { from: 1.2 });
  const nv = T.nuvem(55000), r = prng(9);
  const agua = Array.from({ length: 30000 }, () => ({ x: r() * W, y: 600 + r() * 700, n: r(), f: r() * 6.283 }));
  const gelo = Array.from({ length: 9000 }, () => ({ x: r() * W, u: r(), n: r() }));
  const rocha = Array.from({ length: 7000 }, () => ({ x: r() * W, y: 1300 + r() * 120, n: r() }));
  const calor = Array.from({ length: 2500 }, () => ({ x: 120 + r() * 840, v: 0.15 + r() * 0.25, n: r() }));
  T.quadro((x, t) => {
    let i = nv.k; const esp = 140 * PT.ss((t - tC + 0.3) / 2.5), cob = PT.jan(t, tCo - 0.2, tL, 0.4, 0.6);
    for (const p of agua) { if (p.y < 600 + esp) continue; const dx = Math.sin(t * 0.4 + p.f) * 10, aq = PT.ss((t - tCa) / 1) * Math.exp(-(1300 - p.y) / 250); const c2 = mixC([0.2, 0.45, 1.0], [1.0, 0.55, 0.25], aq * 0.6); nv.ponto(i++, p.x + dx, p.y + Math.cos(t * 0.5 + p.f) * 6, c2[0], c2[1], c2[2], 0.55 + 0.3 * p.n + 0.4 * PT.jan(t, tL - 0.2, tCa, 0.4, 0.6), 3.2); }
    for (const p of gelo) { const y = 600 + p.u * esp; nv.ponto(i++, p.x, y, 0.85, 0.94, 1.0, 0.45 + 0.4 * p.n + 0.4 * cob, 3); }
    for (const p of rocha) nv.ponto(i++, p.x, p.y, 0.7, 0.42, 0.25, 0.5 + 0.3 * p.n, 2.8);
    const ca = PT.ss((t - tCa + 0.3) / 0.8);
    for (const p of calor) { const u = (t * p.v + p.n) % 1; nv.ponto(i++, p.x + Math.sin(t * 2 + p.n * 30) * 12, 1300 - u * 520, 1.0, 0.55, 0.2, ca * (1 - u) * 0.7, 3); }
    nv.total(i);
    if (ca > 0) for (let k = 0; k < 6; k++) brilhoP(x, 150 + k * 160, 1310, 140, "255,120,40", 0.35 * ca);
    brilhoP(x, 540, 600 + esp / 2, 600, "200,235,255", 0.18 * cob);
  });
};

// =============== 6. a virada: a vida que nunca precisou do Sol ===============
CENAS.fundo = (el, c, B) => {
  const q = tempoPalavras(c), tF = B("fontes"), tFe = B("ferve"), tB = B("bacterias"), tV = B("vermes"), tC = B("camaroes"), tQ = B("quimica"), tD = B("diferenca");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["fon", 330, 96, "fontes hidrotermais", "pt-la", "white-space:normal;left:60px;width:960px"],
    ["temp", 540, 48, "água a mais de 300 °C", "pt-fino"],
    ["dif", 330, 96, "nenhuma diferença", "", "color:#06d6a0;text-shadow:0 0 34px rgba(6,214,160,0.8),0 0 100px rgba(6,214,160,0.45);white-space:normal;left:60px;width:960px"],
  ]);
  MD.slam(tl, tx.fon, tF - 0.2, { from: 1.25 }); MD.arrive(tl, tx.temp, tFe, { y: 14 }); MD.leave(tl, [tx.fon, tx.temp], tB - 0.4);
  MD.slam(tl, tx.dif, tD - 0.25, { from: 1.3 });
  const nv = T.nuvem(60000), r = prng(13);
  const VX = 540, VY = 1240;                                     // boca da chaminé
  const chamine = Array.from({ length: 8000 }, () => { const u = r(), larg = 40 + 110 * u; return { x: VX + (r() - 0.5) * 2 * larg, y: VY + u * 180, n: r() }; });
  const chao = Array.from({ length: 9000 }, () => ({ x: r() * W, y: 1400 + r() * 30 - 60 * Math.exp(-Math.pow((r() * W - VX) / 300, 2)), n: r() }));
  const pluma = Array.from({ length: 9000 }, () => ({ v: 0.12 + r() * 0.2, ab: (r() - 0.5), n: r() }));
  const vermes = Array.from({ length: 22 }, () => ({ x: VX + (r() < 0.5 ? -1 : 1) * (110 + r() * 170), h: 100 + r() * 160, f: r() * 6.283 }));
  const camaroes = Array.from({ length: 30 }, () => ({ rr: 120 + r() * 220, ang: r() * 6.283, v: 0.3 + r() * 0.5, y: VY - 60 + (r() - 0.5) * 200, n: r() }));
  const bact = Array.from({ length: 4000 }, () => ({ x: VX + (r() - 0.5) * 760, y: 1300 + r() * 120, n: r() }));
  T.quadro((x, t) => {
    let i = nv.k; const ent = PT.ss((t - c.ini + 0.3) / 1.2), quente = 0.6 + 0.4 * PT.ss((t - tFe + 0.3) / 0.6);
    for (const p of chao) nv.ponto(i++, p.x, p.y, 0.55, 0.38, 0.28, ent * (0.35 + 0.25 * p.n), 2.8);
    for (const p of chamine) { const borda = Math.exp(-Math.pow((p.y - VY) / 40, 2)); nv.ponto(i++, p.x, p.y, 0.6 + 0.4 * borda, 0.4 + 0.2 * borda, 0.25, ent * (0.4 + 0.3 * p.n + 0.4 * borda * quente), 2.8); }
    // pluma: água quente e escura cheia de minerais subindo
    for (const p of pluma) { const u = (t * p.v + p.n) % 1, xx = VX + p.ab * (30 + u * 380) + Math.sin(t * 1.5 + p.n * 20) * 18 * u, yy = VY - u * 820; const c2 = mixC([1.0, 0.6, 0.25], [0.35, 0.3, 0.35], u); nv.ponto(i++, xx, yy, c2[0], c2[1], c2[2], ent * quente * (1 - u) * 0.6, 3 + u * 3); }
    // bactérias (tapete verde que brilha), vermes gigantes (tubos brancos com ponta vermelha) e camarões
    const aB = PT.ss((t - tB + 0.2) / 0.5);
    for (const p of bact) nv.ponto(i++, p.x, p.y - 4, 0.3, 1.0, 0.6, aB * (0.25 + 0.4 * p.n) * (0.7 + 0.3 * Math.sin(t * 3 + p.n * 50)) * (1 + 1.2 * PT.jan(t, tQ, tD, 0.5, 0.8)), 2.4);
    const aV = PT.ss((t - tV + 0.2) / 0.6);
    vermes.forEach((w) => { const bal = Math.sin(t * 1.3 + w.f) * 10; for (let k = 0; k < 40; k++) { const u = k / 39; nv.ponto(i++, w.x + bal * u * u, 1380 - u * w.h * aV, 0.95, 0.95, 0.9, aV * 0.6, 3.4); } for (let k = 0; k < 30; k++) { const b = k / 30 * 6.283; nv.ponto(i++, w.x + bal + Math.cos(b) * 12, 1380 - w.h * aV - 6 + Math.sin(b) * 8, 1.0, 0.25, 0.3, aV * 0.9, 3.4); } });
    const aC = PT.ss((t - tC + 0.2) / 0.6);
    camaroes.forEach((s) => { const ang = s.ang + t * s.v, cx2 = VX + Math.cos(ang) * s.rr, cy2 = s.y + Math.sin(ang * 2) * 20; for (let k = 0; k < 14; k++) { const b = k / 13 * Math.PI * 0.9; nv.ponto(i++, cx2 + Math.cos(b + ang) * 12 * Math.sign(Math.cos(ang)), cy2 + Math.sin(b) * 8, 1.0, 0.75, 0.8, aC * 0.75, 2.6); } });
    // química saindo da Terra e alimentando as bactérias
    const aQ = PT.jan(t, tQ - 0.3, c.fim, 0.5, 0.3);
    if (aQ > 0) for (let k = 0; k < 400; k++) { const u = (t * 0.4 + k / 400) % 1, lado = k % 2 ? 1 : -1, xx = VX + lado * u * 360 * (0.6 + 0.4 * Math.sin(k)), yy = VY + 40 + u * 90; nv.ponto(i++, xx, yy, 1.0, 0.9, 0.3, aQ * (1 - u) * 0.8, 3); }
    nv.total(i);
    brilhoP(x, VX, VY, 260, "255,140,50", 0.5 * ent * quente);
    if (t > tD - 0.2) brilhoP(x, 540, 1250, 900, "6,214,160", 0.2 * PT.ss((t - tD + 0.2) / 0.8));
  });
};

// =============== 7. calma: o Sol volta; resumo e chamada ===============
CENAS.resumo = (el, c, B) => {
  const q = tempoPalavras(c), tCa = B("calma"), tBi = B("bilhoes"), tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4"), B("passo5")], tC = B("cta"), tRe = q("Resumindo:");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["calma", 330, 130, "calma", "pt-am"],
    ["bi", 330, 110, "5 bilhões", "pt-am"], ["bi2", 460, 46, "de anos de combustível", "pt-fino"],
  ]);
  MD.slam(tl, tx.calma, tCa + 0.05, { from: 1.3 }); MD.leave(tl, tx.calma, tBi - 0.5);
  MD.slam(tl, tx.bi, tBi - 0.1, { from: 1.3 }); MD.arrive(tl, tx.bi2, tBi + 0.3, { y: 14 }); MD.leave(tl, [tx.bi, tx.bi2], tRe - 0.2);
  const Y = [560, 700, 840, 980, 1120], textos = ["8 minutos sem perceber", "escuridão", "a Terra solta no espaço", "um frio extremo", "e a vida resistindo no fundo do mar"];
  const tl2 = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 30, 50, s, "", "left:200px;width:820px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tl2[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tl2[`p${k}`]), tC + 0.45);
  const nv = T.nuvem(40000), est = ambienteP(300, 4), cores = ["143,227,255", "120,140,200", "255,138,61", "200,235,255", "6,214,160"];
  T.quadro((x, t) => {
    est.forEach((s) => pontoP(x, s.x, s.y, 1 + 2 * s.z, "220,230,255", (0.15 + 0.4 * s.z) * (0.6 + 0.4 * Math.sin(t * 2 + s.f))));
    // o Sol se remonta (as partículas voltam do centro) e depois recua para o fundo
    const k = 1 - PT.out((t - tCa + 0.1) / 1.4), lista = PT.ss((t - tRe + 0.3) / 0.8);
    desenharSol(nv, x, 540, PT.lerp(860, 300, lista), PT.lerp(300, 120, lista), t, k, 1 - 0.6 * lista - 0.4 * PT.ss((t - tC - 0.4) / 0.6));
    const sai = 1 - PT.ss((t - tC - 0.45) / 0.5);
    tP.forEach((tp, j) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 140, Y[j], 14, cores[j], a); brilhoP(x, 140, Y[j], 50, cores[j], 0.4 * a); } });
  });
  cartaoFinal(el, tC + 0.9);
};
