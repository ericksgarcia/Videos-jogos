// Cenas do vídeo "Por que a cerveja congela quando você abre".
// Estilo "pontos de luz" (motor/pontos.js): garrafa, moléculas, gelo, bolhas e plateia são
// nuvens de pontos num canvas por cena; textos com MotionDirector. Sem desenhos de contorno.

const MD = MotionDirector;
const GARRAFA = garrafaPontos(3);
const GARRAFA_G = garrafaPontos(3, 46000, 62000);   // versão densa (GPU)
// distâncias usadas pelas frentes de congelamento (coordenadas da garrafa)
[...GARRAFA, ...GARRAFA_G].forEach((p) => {
  p.dTopo = Math.hypot(p.y - 790, p.rr);
  p.dFundo = Math.hypot(p.y - 12, p.rr * 0.6);
  p.dedo = 0.18 * Math.sin(p.a * 6 + p.y * 0.02) + 0.25 * (p.n - 0.5);   // "dedos" do cristal
});
// congelamento que nasce em `semente` (função p -> distância) no instante t0, com velocidade vel
const frenteGelo = (t, t0, vel, dist) => (p) => PT.ss((t - t0 - dist(p) / vel * (1 + p.dedo)) / 0.22);
// bolhas subindo dentro do líquido (coordenadas da garrafa)
function bolhasGarrafa(n, seed, yMin = 20) {
  const r = prng(seed);
  return Array.from({ length: n }, () => ({ y0: yMin + r() * (780 - yMin), a: r() * 6.283, f: Math.sqrt(r()), v: 60 + r() * 160, s: 2 + r() * 5, d: r() * 0.8, n: r() }));
}
function desenharBolhas(x, lista, o, t, t0, dens = 1, comFloco = 0) {
  if (t < t0) return;
  lista.forEach((b, i) => {
    if (i / lista.length > dens) return;
    const u = t - t0 - b.d; if (u < 0) return;
    const y = 20 + ((b.y0 + b.v * u - 20) % 770 + 770) % 770;
    const rr = PT.cl(raioGarrafa(y) * 0.85, 0, 200) * b.f;
    const [sx, sy] = projGarrafa({ y, a: b.a + Math.sin(u * 3 + b.n * 9) * 0.1, rr }, o);
    const a = PT.ss(u / 0.3) * (o.a ?? 1);
    bolhaP(x, sx, sy, b.s * o.esc * 1.6, a);
    if (comFloco > 0 && i % 4 === 0) flocoP(x, sx, sy, (5 + b.s) * o.esc * comFloco, a * comFloco * 0.8, b.n * 3);
  });
}
// vapor saindo do gargalo (na tela)
function vaporP(x, px, py, t, t0, n, seed, esc = 1) {
  const u = t - t0; if (u < 0 || u > 2.2) return;
  const r = prng(seed);
  for (let i = 0; i < n; i++) {
    const ang = -Math.PI / 2 + (r() - 0.5) * 1.6, v = (120 + r() * 420) * esc, k = 1 - Math.exp(-u * 2.6);
    const xx = px + Math.cos(ang) * v * k + Math.sin(u * 3 + i) * 10, yy = py + Math.sin(ang) * v * k - u * 40;
    pontoP(x, xx, yy, 2 + 4 * r(), "220,235,255", (1 - u / 2.2) * (0.25 + 0.4 * r()));
  }
  brilhoP(x, px, py, 220 * esc, "200,230,255", 0.4 * Math.exp(-u * 3));
  anelP(x, px, py, 30 + u * 500 * esc, "220,240,255", 0.5 * Math.exp(-u * 2.5), 3);
}
// moléculas que vivem num lugar da rede (alvo) e se soltam/encaixam
function moleculasRede(cx, cy, s, cols, linhas, seed, espalha = 140) {
  const rede = redeHex(cx, cy, s, cols, linhas), r = prng(seed);
  const mol = rede.v.map(([vx, vy]) => ({ vx, vy, ox: (r() - 0.5) * espalha * 2, oy: (r() - 0.5) * espalha * 2, f: r() * 6.283, g: r() * 6.283, ang: r() * 6.283, n: r(), dc: Math.hypot(vx - cx, vy - cy) }));
  return { rede, mol };
}
// desenha as moléculas: T = agitação (1 quente, 0 parada), trava(m) = 0..1 encaixada na rede
function desenharMoleculas(x, M, t, T, trava, a = 1, cor = "143,227,255", esc = 1, ligA = 1) {
  const pos = M.mol.map((m) => {
    const k = trava(m), amp = (6 + 34 * T) * (1 - k), fr = 0.6 + 3.2 * T;
    const px = m.vx + m.ox * (1 - k) + Math.sin(t * fr + m.f) * amp, py = m.vy + m.oy * (1 - k) + Math.cos(t * fr * 1.13 + m.g) * amp;
    return [px, py, k];
  });
  M.rede.lig.forEach(([i, j]) => { const k = Math.min(pos[i][2], pos[j][2]); if (k > 0.05) linhaP(x, pos[i][0], pos[i][1], pos[j][0], pos[j][1], "190,240,255", 0.45 * k * a * ligA, 2.5); });
  M.mol.forEach((m, i) => moleculaP(x, pos[i][0], pos[i][1], m.ang + t * (1 - pos[i][2]) * (0.5 + T) * (m.n - 0.5) * 2, esc, cor, a));
  return pos;
}

// =============== 1. gancho: a garrafa sai do congelador, abre e vira gelo ===============
CENAS.abertura = (el, c, B) => {
  const q = tempoPalavras(c), tL = B("liquida"), tA = B("abre"), tG = B("gelo");
  mostrarGancho(tA - 0.35);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["temp", 780, 92, "−5 °C", "pt-ci", "left:690px;width:360px;text-align:left"],
    ["liq", 890, 40, "líquida", "pt-fino", "left:694px;width:360px;text-align:left"],
    ["magica", 380, 60, "não é mágica", "pt-fino"],
  ]);
  MD.slam(tl, tx.temp, tL - 0.1, { from: 1.3 });
  MD.arrive(tl, tx.liq, tL + 0.1, { y: 14 });
  MD.leave(tl, [tx.temp, tx.liq], tA + 1.3);
  MD.arrive(tl, tx.magica, q("não"), { y: 16 });
  MD.leave(tl, tx.magica, c.fim - 0.6);
  const neve = ambienteP(2500, 5), bolhas = bolhasGarrafa(140, 9), nvN = T.nuvem(2500), nvG = T.nuvem(GARRAFA_G.length);
  // "Parece mágica": as partículas da garrafa congelada se transformam num floco de neve gigante
  const tM = q("Parece") + 0.2, alvos = flocoAlvosP(GARRAFA_G.length, 5, 540, 900, 400);
  GARRAFA_G.forEach((p, i) => { p.alvo = alvos[i]; });
  T.quadro((x, t) => {
    brilhoP(x, 540, 1500, 1100, "60,120,230", 0.22);
    ambienteGPU(nvN, neve, t, [0.8, 0.88, 1.0], 1, 1);
    const o = { cx: 540, cy: 1380, esc: 0.7 * (1 + 0.05 * PT.ss((t - tA) / 4)), rot: t * 0.25, t, geloMedio: PT.ss((t - tG) / 2),
      geada: (p) => (p.n < 0.16 ? 1 : 0),
      tampa: { dy: 520 * PT.out((t - tA) / 0.9) + 40 * PT.ss((t - tA) / 0.1), rot: (t - tA > 0 ? (t - tA) * 6 : 0), a: 1 - PT.ss((t - tA - 0.4) / 0.5) },
      gelo: frenteGelo(t, tG - 0.15, 420, (p) => p.dTopo), agita: PT.jan(t, tA, tA + 1.2, 0.05, 0.6) };
    // brilho frio ao congelar
    brilhoP(x, 540, 1380 - 420 * 0.7, 520, "143,227,255", 0.3 * PT.jan(t, tG, tG + 2.4, 0.4, 1.2));
    o.desloca = t > tM ? (p, sx, sy) => {
      const m = PT.ss((t - tM - p.n * 0.9) / 1.4); if (m <= 0 || !p.alvo) return [sx, sy];
      const ang = (p.n - 0.5) * 6 * Math.sin(m * Math.PI), mx = sx + (p.alvo[0] - sx) * m - 540, my = sy + (p.alvo[1] - sy) * m - 900, k = 1 + 0.35 * Math.sin(m * Math.PI);
      return [540 + (mx * Math.cos(ang) - my * Math.sin(ang)) * k, 900 + (mx * Math.sin(ang) + my * Math.cos(ang)) * k];
    } : null;
    if (t > tM) o.geada = () => 0;
    desenharGarrafaGPU(nvG, GARRAFA_G, o);
    desenharBolhas(x, bolhas, o, t, tA + 0.15, 1 - PT.ss((t - tG - 1.5) / 0.8));
    vaporP(x, 540, 1380 - 962 * o.esc, t, tA, 140, 4, 1);
    // cintilância do gelo pronto
    if (t > tG + 1.6 && t < tM) for (let k = 0; k < 12; k++) { const u = (t * 0.7 + k * 0.37) % 1, p = GARRAFA[(k * 397) % GARRAFA.length], [sx, sy] = projGarrafa(p, o); brilhoP(x, sx, sy, 26, "255,255,255", Math.sin(u * Math.PI) * 0.8); }
  });
};

// =============== 2. o que é congelar: moléculas que desaceleram e se encaixam ===============
CENAS.congelar = (el, c, B) => {
  const q = tempoPalavras(c), tAg = B("agua"), tMo = B("moleculas"), tEs = q("esfria,"), tLe = B("lentas"), tEn = B("encaixa"), tGe = B("gelo"), tZe = q("zero"), tDo = q("dois");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["mol", 380, 56, "moléculas de água", "pt-fino"],
    ["temp", 360, 120, "20 °C", "pt-la"],
    ["gelo", 360, 150, "gelo", "pt-ci"],
    ["pura", 1236, 52, "água pura: 0 °C", ""],
    ["cerv", 1304, 52, "cerveja: ≈ −2 °C", "pt-am"],
  ]);
  MD.arrive(tl, tx.mol, tMo, { y: 16 });
  MD.leave(tl, tx.mol, tEs - 0.3);
  MD.slam(tl, tx.temp, tEs, { from: 1.2 });
  aCadaQuadro((t) => { const k = PT.ss((t - tEs) / (tEn - tEs)); tx.temp.textContent = `${Math.round(20 * (1 - k))} °C`; tx.temp.className = `pt-l ${k > 0.85 ? "pt-ci" : "pt-la"}`; });
  MD.leave(tl, tx.temp, tGe - 0.35);
  MD.slam(tl, tx.gelo, tGe, { from: 1.4 });
  MD.leave(tl, tx.gelo, c.fim - 0.5);
  MD.arrive(tl, tx.pura, tZe - 0.1, { y: 16 });
  MD.arrive(tl, tx.cerv, tDo - 0.1, { y: 16 });
  MD.leave(tl, [tx.pura, tx.cerv], c.fim - 0.4);
  const M = moleculasRede(540, 830, 58, 9, 6, 21);
  const r = prng(2), liquido = Array.from({ length: 40000 }, () => [r() * W, 280 + r() * 1140, r(), r(), r() * 6.283, Math.sqrt(r()) * 14]);
  const nvL = T.nuvem(liquido.length);
  T.quadro((x, t) => {
    const Tq = 1 - 0.85 * PT.ss((t - tEs) / (tLe + 0.6 - tEs));                  // temperatura (agitação)
    brilhoP(x, 540, 860, 900, "255,140,60", 0.16 * Tq);
    brilhoP(x, 540, 860, 900, "60,140,255", 0.18 * (1 - Tq));
    // de perto, a cerveja é um mar de pontos âmbar; em "água" os pontos viram moléculas
    const vira = PT.ss((t - tAg + 0.2) / 1.2);
    // encaixe: do centro para fora, em "encaixam"
    const trava = (m) => PT.ss((t - tEn - m.dc / 900) / 0.5);
    const pos = desenharMoleculas(x, M, t, Tq, trava, PT.ss((vira - 0.6) / 0.4), "143,227,255", 1, 1);
    // o mar âmbar (40 mil pontos) escorre para dentro das moléculas
    const ent = PT.ss((t - c.ini + 0.5) / 0.6);
    if (vira < 1) liquido.forEach(([lx, ly, a, f, ang, d], i) => {
      const alvo = pos[i % pos.length], k = PT.inOut(PT.cl(vira * 1.25 - a * 0.25));
      const px = lx + Math.sin(t * 2 + f * 9) * 8, py = ly + Math.cos(t * 1.7 + a * 9) * 8;
      nvL.ponto(i, px + (alvo[0] + Math.cos(ang) * d - px) * k, py + (alvo[1] + Math.sin(ang) * d - py) * k, 1.0, 0.62 + 0.3 * k, 0.2 + 0.75 * k, (0.45 + 0.4 * a) * ent * (1 - PT.ss((vira - 0.75) / 0.25)) * (1 - 0.75 * k) * PT.ss((ly - 280) / 260) * PT.ss((1420 - ly) / 260) * PT.ss(Math.min(lx, W - lx) / 160), 3.2);
    });
    nvL.total(vira < 1 ? liquido.length : 0);
    // a rede de gelo pronta brilha em "gelo"
    brilhoP(x, 540, 860, 600, "143,227,255", 0.25 * PT.jan(t, tGe, tGe + 1.2, 0.2, 0.8));
  });
};

// =============== 3. falta uma semente: super-resfriamento ===============
CENAS.semente = (el, c, B) => {
  const q = tempoPalavras(c), tSe = B("semente"), tBo = B("bolha"), tPo = q("poeira,"), tAr = q("arranhão"), tGa = B("garrafa"), tNe = q("nenhuma."), tPa = q("passa"), tLi = q("líquida,"), tM6 = B("menos6"), tNo = B("nome"), tNm = q("nome:");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["sem", 380, 130, "semente", "pt-am"],
    ["nada", 380, 96, "sem semente", "pt-ve"],
    ["liq", 380, 84, "ainda líquida", "pt-am"],
    ["s1", 360, 110, "super-", "pt-ci"],
    ["s2", 470, 110, "resfriamento", "pt-ci"],
  ]);
  MD.slam(tl, tx.sem, tSe, { from: 1.3 });
  MD.leave(tl, tx.sem, tGa - 0.6);
  MD.slam(tl, tx.nada, tNe - 0.3, { from: 1.25 });
  MD.leave(tl, tx.nada, tPa - 0.2);
  MD.arrive(tl, tx.liq, tLi, { y: 16 });
  MD.leave(tl, tx.liq, tNm - 0.3);
  MD.slam(tl, tx.s1, tNm, { from: 1.2 });
  MD.slam(tl, tx.s2, tNo, { from: 1.2 });
  const M = moleculasRede(540, 880, 58, 9, 5, 33, 110), nvG = T.nuvem(GARRAFA_G.length);
  const pares = []; const r = prng(8);
  for (let k = 0; k < 40; k++) { const i = Math.floor(r() * M.rede.lig.length); pares.push([M.rede.lig[i], r() * 5, 0.6 + r()]); }
  T.quadro((x, t) => {
    brilhoP(x, 540, 860, 900, "60,140,255", 0.2);
    const vistaMol = 1 - PT.ss((t - tGa + 0.3) / 0.8), vistaGar = PT.ss((t - tGa) / 0.8);
    if (vistaMol > 0) {
      // perto da semente as moléculas se encaixam num pedacinho; depois se soltam de novo
      const sx = 540, sy = 880, seed = PT.jan(t, tSe - 0.1, tBo - 0.5, 0.2, 0.8);
      const trava = (m) => seed * PT.ss((1 - m.dc / 220) * 3) ;
      const pos = desenharMoleculas(x, M, t, 0.28, trava, vistaMol, "143,227,255", 1, 1);
      // ligações que tentam se formar e se desfazem (sem semente, não pega)
      pares.forEach(([[i, j], fase, per]) => { const u = ((t + fase) % (per * 3)) / per; if (u < 1) linhaP(x, pos[i][0], pos[i][1], pos[j][0], pos[j][1], "190,240,255", 0.5 * Math.sin(u * Math.PI) * vistaMol * (1 - seed), 2); });
      if (seed > 0) { flocoP(x, sx, sy, 34 * seed, seed * vistaMol, t * 0.3, "255,236,170"); brilhoP(x, sx, sy, 180, "255,220,120", 0.4 * seed * vistaMol); }
      // exemplos de semente: bolha, poeira, arranhão
      const ex = [[300, tBo, "BOLHA"], [540, tPo, "POEIRA"], [780, tAr, "ARRANHÃO"]];
      ex.forEach(([ex0, te, nome], k) => {
        const a = PT.ss((t - te + 0.1) / 0.35) * vistaMol, y0 = 1230;
        if (a <= 0) return;
        brilhoP(x, ex0, y0, 90, "255,220,120", 0.25 * a);
        if (k === 0) bolhaP(x, ex0, y0, 34, a);
        if (k === 1) { const rr = prng(4); for (let i = 0; i < 60; i++) { const ang = rr() * 6.283, d = 26 * Math.sqrt(rr()); pontoP(x, ex0 + Math.cos(ang) * d * 1.3, y0 + Math.sin(ang) * d, 3 + rr() * 3, "255,214,150", a * 0.8); } }
        if (k === 2) for (let i = 0; i <= 30; i++) { const u = i / 30; pontoP(x, ex0 - 60 + u * 120, y0 + Math.sin(u * 14) * 9 * (1 - Math.abs(u - 0.5)), 3, "255,236,200", a * 0.9); }
        rotuloP(x, nome, ex0, y0 + 76, 28, "255,226,140", a);
      });
    }
    if (vistaGar > 0) {
      // a garrafa fechada e lisinha, ainda líquida a -6 °C (aura ciano de "super-resfriada")
      const temp = -6 * PT.ss((t - tPa) / (tM6 + 0.3 - tPa));
      const o = { cx: 400, cy: 1330, esc: 0.72, rot: t * 0.22, t, a: vistaGar };
      brilhoP(x, 400, 1330 - 400 * 0.72, 560, "76,201,240", 0.12 * vistaGar + 0.3 * PT.ss((t - tNm) / 0.6));
      desenharGarrafaGPU(nvG, GARRAFA_G, o);
      termometroP(x, 850, 600, 600, -8, 4, temp, vistaGar * PT.ss((t - tPa + 0.4) / 0.6), [[0, "0 °C", "255,255,255"], [-2, "−2 °C", "255,210,63"], [-6, "−6 °C", "143,227,255"]]);
    }
  });
};

// =============== 4. quando você abre: bolhas viram sementes; a plateia; o gelo se espalha ===============
CENAS.abrir = (el, c, B) => {
  const q = tempoPalavras(c), tA = B("abre"), tPr = q("pressão"), tEs = q("escapa"), tBo = B("bolhas"), tSe = B("semente"), tPl = B("plateia"), tPri = q("primeiro."), tCo = B("comeca"), tTe = q("teatro"), tGi = q("igual:"), tNa = q("nasce"), tSp = B("espalha");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["pres", 380, 84, "a pressão cai", "pt-fino"],
    ["seme", 380, 76, "cada bolha = semente", "pt-am"],
    ["um", 380, 84, "basta um começar", "pt-am"],
    ["igual", 380, 84, "o gelo faz igual", "pt-ci"],
  ]);
  MD.arrive(tl, tx.pres, tPr, { y: 16 });
  MD.leave(tl, tx.pres, tBo - 0.6);
  MD.slam(tl, tx.seme, tSe - 0.15, { from: 1.25 });
  MD.leave(tl, tx.seme, tPl - 0.5);
  MD.slam(tl, tx.um, tCo - 0.2, { from: 1.25 });
  MD.leave(tl, tx.um, tGi - 0.7);
  MD.arrive(tl, tx.igual, tGi - 0.3, { y: 16 });
  MD.leave(tl, tx.igual, c.fim - 0.5);
  const bolhas = bolhasGarrafa(420, 14);
  const sementes = bolhas.slice(0, 7).map((b, k) => ({ y: 620 + k * 26, a: b.a, rr: 30 + 60 * b.f }));
  const dSem = (p) => Math.min(...sementes.map((s) => Math.hypot(p.y - s.y, p.rr * Math.sin(p.a) - s.rr * Math.sin(s.a), p.rr * Math.cos(p.a) - s.rr * Math.cos(s.a))));
  GARRAFA_G.forEach((p) => { p.dSem = p.k === 1 ? dSem(p) : 0; });
  const nvG = T.nuvem(GARRAFA_G.length);
  // plateia: fileiras em perspectiva
  const r = prng(31), plateia = [];
  for (let f = 0; f < 13; f++) for (let k = 0; k < 15 + f; k++) {
    const z = 1 + f * 0.3, n = 15 + f, xx = (k - (n - 1) / 2) * 118 / z + (r() - 0.5) * 8, yy = 1290 - f * 62 + 0.00022 * xx * xx * z + (r() - 0.5) * 6;
    plateia.push({ x: 540 + xx, y: yy, s: 46 / z, f: r(), d: 0 });
  }
  const p0 = plateia.reduce((m, p) => (Math.hypot(p.x - 540, p.y - 1110) < Math.hypot(m.x - 540, m.y - 1110) ? p : m));
  plateia.forEach((p) => { p.d = Math.hypot(p.x - p0.x, (p.y - p0.y) * 1.6); });
  T.quadro((x, t) => {
    const vistaG = 1 - PT.jan(t, tPl - 0.5, tGi - 0.6, 0.7, 0.7), vistaP = PT.jan(t, tPl - 0.5, tGi - 0.6, 0.7, 0.7);
    brilhoP(x, 540, 900, 900, "60,140,255", 0.18);
    if (vistaG > 0.01) {
      const o = { cx: 540, cy: 1500, esc: 0.95, rot: t * 0.2, t, a: vistaG,
        tampa: { dy: 600 * PT.out((t - tA) / 0.9), rot: (t > tA ? (t - tA) * 6 : 0), a: 1 - PT.ss((t - tA - 0.4) / 0.5) },
        gelo: t > tNa ? frenteGelo(t, tSp - 0.4, 300, (p) => p.dSem) : null, geloMedio: PT.ss((t - tSp) / 2.5), agita: PT.jan(t, tA, tA + 1.5, 0.05, 0.8) };
      desenharGarrafaGPU(nvG, GARRAFA_G, o);
      const dens = 0.15 + 0.85 * PT.ss((t - tEs) / (tBo - tEs + 0.3));
      desenharBolhas(x, bolhas, o, t, tA + 0.2, dens * (1 - 0.6 * PT.ss((t - tSp - 1) / 1)), PT.ss((t - tSe + 0.1) / 0.4) * (1 - PT.ss((t - tPl + 0.4) / 0.4)));
      vaporP(x, 540, 1500 - 962 * 0.95, t, tA, 160, 6, 1.1);
      if (t > tPr && t < tPr + 1.6) { const u = (t - tPr) / 1.6; anelP(x, 540, 1500 - 900 * 0.95, 40 + u * 700, "143,227,255", 0.6 * (1 - u), 4); }
      // cristais nascendo nas sementes
      const nasc = PT.ss((t - tNa) / 0.6);
      if (nasc > 0) sementes.forEach((s, k) => { const [sx, sy] = projGarrafa(s, o); flocoP(x, sx, sy, 30 * nasc, nasc * vistaG, t * 0.2 + k); });
    }
    if (vistaP > 0.01) {
      // plateia em silêncio; uma pessoa começa e a onda de aplausos se espalha
      brilhoP(x, 540, 420, 760, "255,200,120", 0.16 * vistaP); for (let i = 0; i < 60; i++) pontoP(x, 140 + i * 13.5, 470 + Math.sin(i * 0.5) * 3, 3, "255,214,150", 0.35 * vistaP); // palco
      plateia.forEach((p) => {
        const on = PT.ss((t - tCo - p.d / 900) / 0.15), palma = on * (0.5 + 0.5 * Math.abs(Math.sin((t - tCo) * 9 + p.f * 6)));
        const nerv = t > tPri - 1.5 && t < tCo ? 0.08 * Math.sin(t * 7 + p.f * 20) : 0;
        const cor = on > 0.05 ? PT.mix([120, 160, 230], COR.amarelo, on) : "120,160,230", al = vistaP * (0.3 + nerv + 0.6 * palma), pul = palma * p.s * 0.12;
        discoP(x, p.x, p.y - p.s * 0.75 - pul, p.s * 0.3, cor, al);                       // cabeça
        for (let i = 0; i <= 8; i++) { const b = Math.PI * (1 + i / 8); pontoP(x, p.x + Math.cos(b) * p.s * 0.55, p.y + Math.sin(b) * p.s * 0.38 - pul * 0.5, Math.max(1.5, p.s * 0.1), cor, al * 0.8); } // ombros
        if (on > 0.3) { brilhoP(x, p.x, p.y - p.s * 0.6, p.s * 1.3, "255,210,63", 0.22 * palma * vistaP); [-1, 1].forEach((sg) => pontoP(x, p.x + sg * p.s * (0.12 + 0.1 * palma), p.y - p.s * 0.2 - pul * 2, Math.max(2, p.s * 0.14), cor, al)); } // mãos batendo
      });
      if (t > tCo) { const u = t - tCo; anelP(x, p0.x, p0.y, 30 + u * 700, "255,210,63", 0.5 * Math.exp(-u * 1.5) * vistaP, 3); brilhoP(x, p0.x, p0.y, 120, "255,230,140", Math.exp(-u * 2) * vistaP); }
    }
  });
};

// =============== 5. por que vira raspadinha: o gelo solta calor; o truque da batidinha ===============
CENAS.raspadinha = (el, c, B) => {
  const q = tempoPalavras(c), tBl = B("bloco"), tPo = q("Porque,"), tSo = q("solta"), tCa = B("calor"), tEsq = q("esquenta"), tM2 = B("menos2"), tPa = q("para"), tRe = q("Resultado:"), tRa = B("raspa"), tTr = q("truque:"), tBa = B("batida"), tAp = q("aparece");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["bloco", 380, 96, "bloco de gelo?", ""],
    ["calor", 380, 120, "calor", "pt-la"],
    ["rasp", 380, 120, "raspadinha", "pt-ci"],
    ["truq", 380, 84, "o truque", "pt-am"],
  ]);
  MD.slam(tl, tx.bloco, tBl - 0.1, { from: 1.25 });
  MD.leave(tl, tx.bloco, tPo + 0.2);
  MD.slam(tl, tx.calor, tCa - 0.1, { from: 1.3 });
  MD.leave(tl, tx.calor, tRe - 0.3);
  MD.slam(tl, tx.rasp, tRa, { from: 1.3 });
  MD.leave(tl, tx.rasp, tTr - 0.3);
  MD.arrive(tl, tx.truq, tTr, { y: 16 });
  MD.leave(tl, tx.truq, c.fim - 0.5);
  // bloco de gelo: cubo de pontos girando
  const r = prng(41), cubo = [];
  for (let i = 0; i < 30000; i++) { const f = Math.floor(r() * 6), u = r() * 2 - 1, v = r() * 2 - 1, p = [u, v]; const ax = f >> 1, sg = f & 1 ? 1 : -1; const P3 = [0, 0, 0]; P3[ax] = sg; P3[(ax + 1) % 3] = p[0]; P3[(ax + 2) % 3] = p[1]; cubo.push(P3); }
  for (let e = 0; e < 12; e++) { const ax = e >> 2, s1 = e & 1 ? 1 : -1, s2 = e & 2 ? 1 : -1; for (let i = 0; i <= 60; i++) { const P3 = [0, 0, 0]; P3[ax] = -1 + i / 30; P3[(ax + 1) % 3] = s1; P3[(ax + 2) % 3] = s2; P3.borda = 1; cubo.push(P3); } }
  const M = moleculasRede(400, 860, 52, 7, 6, 51, 100);
  const bolhasB = bolhasGarrafa(220, 17, 20), nvC = T.nuvem(cubo.length), nvG = T.nuvem(2 * GARRAFA_G.length);
  T.quadro((x, t) => {
    const fases = [PT.jan(t, c.ini - 0.6, tPo + 0.1, 0.5, 0.6), PT.jan(t, tPo + 0.1, tRe - 0.5, 0.6, 0.6), PT.jan(t, tRe - 0.5, tTr - 0.4, 0.6, 0.6), PT.jan(t, tTr - 0.4, c.fim + 1, 0.6, 0.6)];
    brilhoP(x, 540, 900, 900, "60,140,255", 0.18);
    if (fases[0] > 0.01) { // cubo
      const a = fases[0], ry = t * 0.6, rx = 0.5, s = 230;
      cubo.forEach((P3, i) => { const [X, Y, Z] = P3, x1 = X * Math.cos(ry) + Z * Math.sin(ry), z1 = -X * Math.sin(ry) + Z * Math.cos(ry), y2 = Y * Math.cos(rx) - z1 * Math.sin(rx), z2 = Y * Math.sin(rx) + z1 * Math.cos(rx); nvC.ponto(i, 540 + x1 * s, 860 + y2 * s, 0.85, 0.94, 1.0, a * (P3.borda ? 0.9 : 0.12 + 0.12 * (z2 + 1)), P3.borda ? 3.6 : 2.8); });
      nvC.total(cubo.length);
      brilhoP(x, 540, 860, 420, "143,227,255", 0.2 * a);
    }
    if (fases[1] > 0.01) { // cristal crescendo e soltando calor; termômetro sobe de -6 para -2
      const a = fases[1], para = PT.ss((t - tPa) / 0.5);
      const raio = 380 * PT.ss((t - tSo + 0.4) / (tPa - tSo + 0.6));
      const trava = (m) => PT.ss((raio - m.dc) / 40);
      brilhoP(x, 400, 860, 700, "255,140,60", 0.2 * a * PT.jan(t, tSo, tPa, 0.5, 0.8));
      desenharMoleculas(x, M, t, 0.3, trava, a, "143,227,255", 0.9, 1);
      M.mol.forEach((m) => { const tt = m.dc / 380 * (tPa - tSo + 0.6) + tSo - 0.4, u = t - tt; if (u > 0 && u < 1.2 && para < 1) anelP(x, m.vx, m.vy, 8 + u * 70, "255,138,61", 0.55 * (1 - u / 1.2) * a * (1 - para), 2); });
      const temp = -6 + 4 * PT.ss((t - tEsq) / (tM2 - tEsq + 0.2));
      termometroP(x, 880, 620, 560, -8, 4, temp, a, [[0, "0 °C", "255,255,255"], [-2, "−2 °C", "255,210,63"], [-6, "−6 °C", "143,227,255"]]);
    }
    if (fases[2] > 0.01) { // raspadinha: metade cristal, metade líquido
      const o = { cx: 540, cy: 1360, esc: 0.78, rot: t * 0.25, t, a: fases[2], gelo: (p) => (p.n2 < 0.5 ? 1 : 0.15 * p.n2), agita: 0.3, geloMedio: 0.5 };
      desenharGarrafaGPU(nvG, GARRAFA_G, o);
    }
    if (fases[3] > 0.01) { // a batidinha: tranco no fundo, bolhas e gelo subindo
      const u = t - tBa, pulo = u > 0 && u < 0.4 ? Math.sin(u / 0.4 * Math.PI) * 14 : 0;
      const o = { cx: 540, cy: 1360 - pulo, esc: 0.78, rot: t * 0.25, t, a: fases[3], gelo: frenteGelo(t, tAp - 0.2, 650, (p) => p.dFundo), geloMedio: PT.ss((t - tAp) / 1.2), agita: PT.jan(t, tBa, tBa + 0.6, 0.02, 0.4) };
      desenharGarrafaGPU(nvG, GARRAFA_G, o);
      if (u > 0 && u < 1.4) { const k = PT.out(u / 1.4); anelP(x, 540, 1360, 60 + k * 520, "255,236,190", 0.7 * (1 - k), 5); brilhoP(x, 540, 1360, 260, "255,236,190", 0.5 * (1 - k)); }
      desenharBolhas(x, bolhasB, o, t, tBa + 0.05, 1 - PT.ss((t - tAp - 0.6) / 0.6));
    }
  });
};

// =============== 6. cuidado: o gelo é 9% maior e a garrafa estoura ===============
CENAS.cuidado = (el, c, B) => {
  const q = tempoPalavras(c), tAu = B("aumenta"), tNo = B("nove"), tNu = q("Numa"), tEs = B("estoura"), tPc = q("ponto") - 0.15, tBg = q("bem"), tFi = B("fim");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["mais", 320, 150, "+0%", "pt-ci"],
    ["vol", 486, 44, "de volume", "pt-fino"],
    ["est", 380, 96, "pode estourar", "pt-ve"],
    ["bem", 380, 100, "bem gelada", "pt-ci"],
    ["nao", 490, 64, "não esquecida", "pt-fino"],
  ]);
  MD.slam(tl, tx.mais, tNo - 0.1, { from: 1.3 });
  MD.arrive(tl, tx.vol, tNo + 0.2, { y: 14 });
  aCadaQuadro((t) => { tx.mais.textContent = `+${Math.round(9 * PT.out((t - tNo) / 0.9))}%`; });
  MD.leave(tl, [tx.mais, tx.vol], tNu - 0.2);
  MD.slam(tl, tx.est, tEs - 0.45, { from: 1.25 });
  MD.leave(tl, tx.est, tPc - 0.2);
  MD.slam(tl, tx.bem, tBg, { from: 1.25 });
  MD.arrive(tl, tx.nao, tFi - 0.25, { y: 14 });
  const M = moleculasRede(540, 960, 50, 9, 7, 61, 0), nvG = T.nuvem(2 * GARRAFA_G.length);
  T.quadro((x, t) => {
    brilhoP(x, 540, 900, 900, "60,140,255", 0.18);
    const vRede = PT.jan(t, tAu - 1.2, tNu - 0.2, 0.6, 0.6), vGar = Math.pow(1 - vRede, 3), vBoa = PT.ss((t - tPc + 0.2) / 0.7);
    if (vRede > 0.01) {
      // a rede de gelo cresce 9% (contorno tracejado = tamanho da água líquida)
      const k = 1 + 0.09 * PT.out((t - tAu) / 1.2);
      x.setLineDash([10, 12]); x.strokeStyle = `rgba(255,255,255,${0.35 * vRede})`; x.lineWidth = 2; x.strokeRect(540 - 330, 960 - 300, 660, 600); x.setLineDash([]);
      x.save(); x.translate(540, 960); x.scale(k, k); x.translate(-540, -960);
      desenharMoleculas(x, M, t, 0.05, () => 1, vRede, "143,227,255", 0.85, 1);
      x.restore();
      x.strokeStyle = `rgba(143,227,255,${0.6 * vRede})`; x.lineWidth = 3; x.strokeRect(540 - 330 * k, 960 - 300 * k, 660 * k, 600 * k);
    }
    if (vGar > 0.01 && vBoa < 1) {
      // garrafa esquecida: congelada, treme sob pressão e trinca em "estourar"
      const a = vGar * (1 - vBoa), u = t - tEs, tensao = PT.ss((t - tNu) / (tEs - tNu)), quebra = PT.out(u / 1.2);
      const o = { cx: 540, cy: 1360, esc: 0.78, rot: 0.4 + t * 0.05, t, a, gelo: () => 1, geloMedio: 1, agita: 0.6 * tensao * (u < 0 ? 1 : 0) };
      if (u <= 0) desenharGarrafaGPU(nvG, GARRAFA_G, o);
      else {
        // trinca: cada lado vai para um lado, cacos voam
        const desloca = (p, sx, sy) => {
          const lado = Math.sin(p.a + o.rot) > -0.05 + 0.1 * Math.sin(p.y * 0.05) ? 1 : -1, ang = lado * 0.12 * quebra, dx = sx - 540, dy = sy - 1100;
          return [540 + dx * Math.cos(ang) - dy * Math.sin(ang) + lado * 90 * quebra, 1100 + dx * Math.sin(ang) + dy * Math.cos(ang) + 30 * quebra * quebra];
        };
        desenharGarrafaGPU(nvG, GARRAFA_G, { ...o, a: a * (1 - 0.5 * quebra), desloca });
        const rr = prng(77);
        for (let i = 0; i < 90; i++) { const ang = rr() * 6.283, v = 300 + rr() * 900, yy = 500 + rr() * 800; pontoP(x, 540 + Math.cos(ang) * v * quebra, yy + Math.sin(ang) * v * quebra * 0.6 + 900 * quebra * quebra * 0.4, 3, "225,242,255", a * (1 - quebra)); }
        brilhoP(x, 540, 1000, 700, "239,71,111", 0.45 * Math.exp(-u * 2.5) * a);
      }
      if (u < 0) brilhoP(x, 540, 1000, 500, "239,71,111", 0.2 * tensao * a);
    }
    if (vBoa > 0.01) { // o ponto certo: bem gelada, com geada, mas líquida
      const o = { cx: 540, cy: 1360, esc: 0.78, rot: t * 0.25, t, a: vBoa, geada: (p) => (p.n < 0.16 ? 1 : 0) };
      brilhoP(x, 540, 1060, 520, "143,227,255", 0.18 * vBoa);
      desenharGarrafaGPU(nvG, GARRAFA_G, o);
    }
  });
};

// =============== 7. resumo em 4 passos + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [430, 640, 850, 1060];
  const textos = ["passa do ponto de congelar", "você abre: o gás vira bolha", "a bolha vira semente", "o gelo se espalha"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 34, 56, s, "", "left:270px;width:760px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => { MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 20 }); });
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 0.45);
  const neve = ambienteP(2000, 12), M = moleculasRede(170, Y[3], 16, 5, 3, 71, 0), nvN = T.nuvem(2000);
  T.quadro((x, t) => {
    brilhoP(x, 540, 900, 900, "60,140,255", 0.15);
    ambienteGPU(nvN, neve, t, [0.8, 0.88, 1.0], 0.7, 1);
    const sai = 1 - PT.ss((t - tC - 0.45) / 0.5);
    const a = tP.map((tp) => PT.ss((t - tp + 0.2) / 0.4) * sai);
    // ícones de pontos: termômetro, bolhas, semente, cristal
    if (a[0] > 0) { termometroP(x, 170, Y[0] - 70, 110, -8, 4, -6, a[0]); }
    if (a[1] > 0) [[150, 30, 16], [190, 0, 11], [160, -34, 8], [200, -50, 6]].forEach(([bx, by, br], k) => bolhaP(x, bx, Y[1] + by + Math.sin(t * 2 + k) * 4, br, a[1]));
    if (a[2] > 0) { bolhaP(x, 170, Y[2], 40, a[2]); flocoP(x, 170, Y[2], 28, a[2], t * 0.3); }
    if (a[3] > 0) { const raio = 120 * PT.ss((t - tP[3]) / 1); desenharMoleculas(x, M, t, 0.1, (m) => PT.ss((raio - m.dc) / 20), a[3], "143,227,255", 0.4, 1); }
    a.forEach((v, k) => { if (v > 0) brilhoP(x, 170, Y[k], 110, k === 1 ? "143,227,255" : "255,210,63", 0.12 * v); });
  });
  cartaoFinal(el, tC + 0.9);
};
