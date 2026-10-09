// Cenas do vídeo "O que tem dentro de um raio" — pontos de luz na GPU (motor/pontos-gpu.js).
// Retenção: clarão logo no primeiro segundo, números de impacto, promessa paga no fim (o truque
// de contar os segundos), desmonte de mito e uma ação prática para o espectador.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ---------- raio ramificado: segmentos com a "distância percorrida" de cada um ----------
function gerarRaio(x0, y0, x1, y1, seed, o = {}) {
  const r = prng(seed), segs = [], passo = o.passo || 34;
  const ramo = (xa, ya, ang, dist0, comp, principal, prof) => {
    let x = xa, y = ya, d = dist0, n = Math.floor(comp / passo);
    for (let k = 0; k < n; k++) {
      let alvo = principal ? Math.atan2(y1 - y, x1 - x) : ang;
      const a2 = alvo + (r() - 0.5) * (principal ? 1.1 : 1.3), l = passo * (0.6 + 0.7 * r());
      const xb = x + Math.cos(a2) * l, yb = y + Math.sin(a2) * l;
      segs.push({ xa: x, ya: y, xb, yb, d, principal, prof });
      d += l; x = xb; y = yb;
      if (principal && y >= y1 - 4) break;
      if (prof < 3 && r() < (principal ? 0.28 : 0.12)) ramo(x, y, (principal ? Math.PI / 2 : ang) + (r() < 0.5 ? -1 : 1) * (0.5 + r() * 0.6), d, comp * (0.25 + r() * 0.3) / (principal ? 1 : 1.6), false, prof + 1);
    }
    return d;
  };
  const total = ramo(x0, y0, Math.PI / 2, 0, Math.hypot(x1 - x0, y1 - y0) * 1.6, true, 0);
  segs.total = total;
  return segs;
}
// desenha o raio: lider (até a distância L, fraco e violeta) e o clarão (canal principal branco)
function desenharRaio(x, segs, L, clarao, a = 1) {
  x.lineCap = "round";
  for (const s of segs) {
    if (s.d > L && clarao <= 0) continue;
    const prof = s.principal ? 1 : 0.55 / (1 + s.prof * 0.6);
    if (clarao > 0) {
      const k = s.principal ? clarao : clarao * 0.45;
      linhaP(x, s.xa, s.ya, s.xb, s.yb, "180,170,255", 0.35 * k * a, s.principal ? 22 : 8);
      linhaP(x, s.xa, s.ya, s.xb, s.yb, "255,255,255", Math.min(1, 1.2 * k) * a, s.principal ? 6 : 2.5);
    } else {
      const novo = L - s.d < 40 ? 1 : 0;
      linhaP(x, s.xa, s.ya, s.xb, s.yb, novo ? "235,225,255" : "170,150,255", (0.35 + 0.5 * novo) * prof * a, s.principal ? 3 : 2);
      if (novo) brilhoP(x, s.xb, s.yb, 26, "200,190,255", 0.5 * a);
    }
  }
}
// nuvem de tempestade (bigorna) como amostra de pontos
function pontosNuvem(n, seed, cx, cy, esc) {
  const r = prng(seed), out = [];
  const dentro = (x, y) => {
    const dx = (x - cx) / esc, dy = (y - cy) / esc;
    const corpo = dy < 300 && Math.pow(dx / 420, 2) + Math.pow((dy - 150) / 230, 2) < 1;
    const coluna = dy > -340 && dy < 160 && Math.abs(dx) < 210 + 40 * Math.sin(dy * 0.03);
    const bigorna = dy > -420 && dy < -290 && Math.abs(dx) < 540 - (dy + 420) * 1.6;
    const bolhas = [[-200, -60, 150], [190, -20, 160], [-40, -200, 170], [120, -250, 130], [-300, 80, 140], [300, 90, 140]].some(([bx, by, br]) => Math.hypot(dx - bx, dy - by) < br);
    return corpo || coluna || bigorna || bolhas;
  };
  while (out.length < n) { const x = cx + (r() - 0.5) * 1100 * esc, y = cy + (r() - 0.5) * 1000 * esc; if (dentro(x, y)) out.push({ x, y, n: r(), f: r() * 6.283, alt: (cy + 450 * esc - y) / (900 * esc) }); }
  return out;
}
function desenharNuvem(nv, P, t, a, o = {}) {
  let i = nv.k; const lum = o.lum ?? 0;
  for (const p of P) {
    const sobe = o.correnteza ? ((t * 40 * (0.5 + p.n)) % 120) * o.correnteza : 0;
    const c = mixC([0.35, 0.42, 0.62], [0.95, 0.95, 1.0], lum * (0.4 + 0.6 * p.n));
    nv.ponto(i++, p.x + Math.sin(t * 0.3 + p.f) * 6, p.y - sobe + Math.cos(t * 0.25 + p.f) * 4, c[0], c[1], c[2], a * (0.5 + 0.35 * p.n + 0.6 * lum), 3.8);
  }
  nv.total(i);
}
// silhuetas de pontos: chão com árvores, Cristo no morro, prédio alto, casa
function chaoP(nv, y0, a, r) {
  let i = nv.k;
  for (let k = 0; k < 6000; k++) { const x = r() * W, y = y0 + r() * 120; nv.ponto(i++, x, y, 0.3, 0.45, 0.35, a * (0.25 + 0.2 * r()), 2.6); }
  nv.total(i);
}

// =============== 1. gancho: um clarão, 30.000 °C, o Brasil campeão de raios ===============
CENAS.abertura = (el, c, B) => {
  const q = tempoPalavras(c), tQ = B("quente"), tS = B("sol"), tB = B("brasil"), tM = B("milhoes"), tT = B("truque");
  mostrarGancho(tQ - 0.35);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["graus", 330, 150, "30.000 °C", "pt-ci"], ["vs", 480, 46, "5× a superfície do Sol", "pt-am"],
    ["mil", 330, 92, "dezenas de milhões", "pt-am", "white-space:normal;left:60px;width:960px"], ["ano", 540, 46, "de raios por ano", "pt-fino"],
    ["truq", 330, 80, "o truque: no final", "pt-ci"],
  ]);
  MD.slam(tl, tx.graus, tQ - 0.1, { from: 1.4 }); MD.arrive(tl, tx.vs, tS - 0.1, { y: 14 }); MD.leave(tl, [tx.graus, tx.vs], tB - 0.3);
  MD.slam(tl, tx.mil, tM - 0.2, { from: 1.25 }); MD.arrive(tl, tx.ano, tM + 0.3, { y: 14 }); MD.leave(tl, [tx.mil, tx.ano], tT - 0.4);
  MD.slam(tl, tx.truq, tT - 0.1, { from: 1.3 });
  const raio = gerarRaio(560, 300, 500, 1400, 7), nv = T.nuvem(26000);
  const BR = []; for (let k = 0; k < GLOBO_BRASIL.length; k += 2) BR.push([GLOBO_BRASIL[k] / 10, GLOBO_BRASIL[k + 1] / 10]);
  const r = prng(3), flashes = Array.from({ length: 140 }, () => ({ i: Math.floor(r() * BR.length), t0: r() * 14, p: 0.3 + r() * 0.8 }));
  T.quadro((x, t) => {
    // o primeiro clarão (aos 0,3 s) e mais dois tremidos
    const fl = Math.max(0, 1 - Math.abs(t - 0.35) / 0.25) + 0.7 * Math.max(0, 1 - Math.abs(t - 0.75) / 0.12) + 0.5 * Math.max(0, 1 - Math.abs(t - 1.05) / 0.1);
    if (t < tB - 0.2) { desenharRaio(x, raio, raio.total, Math.min(1, fl * 1.4) * (1 - PT.ss((t - 1.6) / 0.6)) + (t > 1.6 ? 0.25 * (1 - PT.ss((t - tB + 1) / 0.8)) : 0)); brilhoP(x, 540, 900, 1400, "220,220,255", 0.6 * fl); }
    if (t > tS - 0.2 && t < tB) { const a = PT.jan(t, tS - 0.2, tB - 0.3, 0.4, 0.3); brilhoP(x, 300, 1150, 120, "255,170,60", 0.7 * a); discoP(x, 300, 1150, 50, "255,200,100", 0.8 * a); rotuloP(x, "SOL 5.500 °C", 300, 1240, 30, "255,200,120", a); brilhoP(x, 760, 1150, 260, "200,200,255", a); discoP(x, 760, 1150, 90, "240,240,255", a); rotuloP(x, "RAIO 30.000 °C", 760, 1280, 30, "200,220,255", a); }
    // mapa do Brasil cheio de raios piscando
    const vB = PT.ss((t - tB + 0.3) / 0.6);
    if (vB > 0.01) {
      const cx = 540, cy = 920, esc = 14.5, lon0 = -53, lat0 = -14;
      let i = nv.k;
      for (const [la, lo] of BR) nv.ponto(i++, cx + (lo - lon0) * esc, cy - (la - lat0) * esc * 1.05, 0.5, 0.78, 1.0, 0.85 * vB, 4);
      nv.total(i);
      flashes.forEach((f) => { const u = ((t - tB + f.t0) % f.p) / f.p; if (u < 0.12) { const [la, lo] = BR[f.i], px = cx + (lo - lon0) * esc, py = cy - (la - lat0) * esc * 1.05, k = 1 - u / 0.12; brilhoP(x, px, py, 40, "235,230,255", vB * k); discoP(x, px, py, 4, "255,255,255", vB * k); } });
    }
  });
};

// =============== 2. dentro da nuvem: gelo batendo, cargas separando ===============
CENAS.nuvem = (el, c, B) => {
  const q = tempoPalavras(c), tF = B("frio"), tG = B("granizo"), tBa = B("batidas"), tBl = B("balao"), tSe = B("separa"), tN = B("negativa"), tPos = q("positiva,");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["frio", 330, 110, "−40 °C", "pt-ci"], ["fr2", 450, 44, "lá no alto da nuvem", "pt-fino"], ["mais", 330, 86, "+ em cima", "pt-la"], ["menos", 430, 86, "− embaixo", "pt-ci"]]);
  MD.slam(tl, tx.frio, tF - 0.1, { from: 1.3 }); MD.arrive(tl, tx.fr2, tF + 0.2, { y: 14 }); MD.leave(tl, [tx.frio, tx.fr2], tG + 1);
  MD.slam(tl, tx.mais, tPos - 0.1, { from: 1.25 }); MD.slam(tl, tx.menos, tN - 0.1, { from: 1.25 });
  const N = pontosNuvem(26000, 3, 540, 860, 1), r = prng(11), nv = T.nuvem(34000);
  const gelo = Array.from({ length: 260 }, () => { const ang = r() * 6.283, d = Math.sqrt(r()); return { x: 540 + Math.cos(ang) * d * 300, y0: r(), v: 0.15 + r() * 0.25, n: r(), granizo: r() < 0.35 }; });
  T.quadro((x, t) => {
    desenharNuvem(nv, N, t, 1, { correnteza: 0.6 * PT.ss((t - tF) / 1), lum: 0.05 });
    // gelo e granizo subindo e descendo dentro da nuvem, batendo (faíscas)
    const aG = PT.ss((t - tG + 0.4) / 0.6), sep = PT.ss((t - tSe) / 2.5);
    gelo.forEach((g, k) => {
      const u = (t * g.v + g.y0) % 1, sobe = g.granizo ? 1 - u : u, y = 1180 - sobe * 640, larg = Math.sqrt(Math.max(0, 1 - Math.pow((y - 980) / 420, 2)));
      const xx = 540 + (g.x - 540) * larg + Math.sin(t * 2 + g.n * 20) * 20;
      if (g.granizo) { discoP(x, xx, y, 7, "210,220,255", 0.8 * aG); } else { pontoP(x, xx, y, 4, "230,245,255", 0.9 * aG); }
      if (t > tBa - 0.3 && (Math.floor(t * 6 + g.n * 30) % 9 === 0)) { brilhoP(x, xx, y, 24, "255,236,140", 0.8 * aG * PT.ss((t - tBa + 0.3) / 0.4)); }
      // cargas: em cima (+, laranja), embaixo (−, azul)
      if (sep > 0) { const cima = g.n < 0.5, ty = cima ? 520 + g.y0 * 120 : 1060 + g.y0 * 140, yy = PT.lerp(y, ty, sep); rotuloP(x, cima ? "+" : "−", xx, yy, 34, cima ? "255,138,61" : "143,227,255", sep * 0.95); }
    });
    if (sep > 0) { brilhoP(x, 540, 560, 420, "255,138,61", 0.25 * sep); brilhoP(x, 540, 1120, 460, "76,201,240", 0.3 * sep * (1 + PT.jan(t, tN - 0.2, c.fim, 0.3, 0.3))); }
    // analogia: balão esfregado no cabelo (fios arrepiados)
    const aB = PT.jan(t, tBl - 0.4, tSe - 0.2, 0.4, 0.4);
    if (aB > 0.01) { const bx = 800, by = 1240; discoP(x, bx, by - 90, 60, "255,93,143", 0.8 * aB); brilhoP(x, bx, by - 90, 110, "255,93,143", 0.3 * aB); for (let k = 0; k < 14; k++) { const ang = -Math.PI / 2 + (k - 6.5) * 0.12; linhaP(x, bx + (k - 6.5) * 8, by + 60, bx + (k - 6.5) * 8 + Math.cos(ang) * 60 * aB, by + 60 + Math.sin(ang) * 80 * aB, "255,226,140", 0.8 * aB, 2); } }
  });
};

// =============== 3. abrindo caminho: o líder em degraus e a faísca que sobe ===============
CENAS.caminho = (el, c, B) => {
  const q = tempoPalavras(c), tAr = B("ar"), tD = B("degraus"), tR = B("raizes"), tC = B("chao"), tS = B("sobe"), tT = B("toca"), tF = B("fecha");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["deg", 980, 56, "degraus de dezenas de metros", "pt-fino", "white-space:normal;left:60px;width:960px"], ["fecha", 960, 110, "contato!", "pt-ci"]]);
  MD.arrive(tl, tx.deg, tD, { y: 14 }); MD.leave(tl, tx.deg, tC - 0.3); MD.slam(tl, tx.fecha, tT - 0.05, { from: 1.4 });
  const N = pontosNuvem(18000, 5, 540, 520, 0.55), raio = gerarRaio(540, 600, 610, 1290, 21), nv = T.nuvem(26000), r = prng(4);
  const sobe = []; for (let k = 0; k < 6; k++) sobe.push([610 + (r() - 0.5) * 10, 1300 - k * 14]);
  T.quadro((x, t) => {
    desenharNuvem(nv, N, t, 1, { lum: 0.08 + 0.15 * Math.max(0, Math.sin(t * 13)) * PT.ss((t - tD) / 1) });
    // chão, árvore e casa de pontos
    let i = nv.k; const rr = prng(9);
    for (let k = 0; k < 4000; k++) nv.ponto(i++, rr() * W, 1310 + rr() * 110, 0.3, 0.45, 0.35, 0.35, 2.6);
    for (let k = 0; k < 600; k++) { const u = rr(); nv.ponto(i++, 610 + (rr() - 0.5) * 8, 1310 - u * 110, 0.5, 0.4, 0.3, 0.6, 2.6); }
    for (let k = 0; k < 1400; k++) { const ang = rr() * 6.283, d = Math.sqrt(rr()) * 70; nv.ponto(i++, 610 + Math.cos(ang) * d * 1.2, 1180 + Math.sin(ang) * d * 0.8, 0.3, 0.75, 0.45, 0.45, 2.8); }
    nv.total(i);
    // o líder desce em degraus (pulos), com galhos
    const prog = Math.floor(PT.cl((t - tD + 0.3) / (tT - tD + 0.3)) * 26) / 26 * (raio.total - 20);
    desenharRaio(x, raio, prog, 0);
    // a faísca que sobe do topo da árvore
    const aS = PT.ss((t - tS + 0.2) / (tT - tS + 0.2));
    if (aS > 0) { linhaP(x, 610, 1110, 610 + Math.sin(t * 30) * 4, 1110 - 70 * aS, "235,225,255", 0.9, 3); brilhoP(x, 610, 1110 - 70 * aS, 30, "200,190,255", 0.7); }
    if (t > tT) { const u = t - tT; brilhoP(x, 610, 1040, 160, "255,255,255", Math.exp(-u * 3)); }
  });
};

// =============== 4. o clarão e o trovão ===============
CENAS.clarao = (el, c, B) => {
  const q = tempoPalavras(c), tC = B("clarao"), tCo = B("corrente"), tM = B("milesimo"), t30 = B("trinta"), tE = B("explode"), tTr = B("trovao");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ms", 330, 120, "< 0,001 s", "pt-ci"], ["graus", 330, 150, "30.000 °C", "pt-am"], ["trov", 330, 150, "trovão", "pt-la"]]);
  MD.slam(tl, tx.ms, tM - 0.1, { from: 1.3 }); MD.leave(tl, tx.ms, t30 - 0.3); MD.slam(tl, tx.graus, t30 - 0.1, { from: 1.4 }); MD.leave(tl, tx.graus, tE - 0.3); MD.slam(tl, tx.trov, tTr - 0.1, { from: 1.5 });
  const raio = gerarRaio(540, 300, 610, 1300, 21), nv = T.nuvem(20000), N = pontosNuvem(16000, 5, 540, 300, 0.55);
  T.quadro((x, t) => {
    const golpes = [tC, tC + 0.35, tC + 0.6, tCo + 0.5];
    let fl = 0; golpes.forEach((g, k) => { if (t > g) fl = Math.max(fl, Math.exp(-(t - g) * (k ? 9 : 4))); });
    const canal = Math.max(fl, 0.35 * (1 - PT.ss((t - tE - 1) / 2)));
    desenharNuvem(nv, N, t, 1, { lum: 0.15 + 0.85 * fl });
    desenharRaio(x, raio, raio.total, canal);
    brilhoP(x, 580, 800, 1600, "220,220,255", 0.7 * fl);
    if (fl > 0.6) { x.fillStyle = `rgba(240,240,255,${0.5 * (fl - 0.6)})`; x.fillRect(0, 0, W, H); }
    // o ar explode: anéis de choque saindo do canal e o som
    if (t > tE - 0.2) { const u = t - tE + 0.2; for (let k = 0; k < 4; k++) { const rr = 40 + (u - k * 0.18) * 520; if (rr > 40) for (let s = 0; s < 3; s++) { x.strokeStyle = `rgba(255,200,140,${0.5 * Math.exp(-u * 0.8) * (1 - s * 0.3)})`; x.lineWidth = 3; x.beginPath(); x.ellipse(580, 820, rr + s * 10, rr * 1.6 + s * 10, 0, 0, 6.283); x.stroke(); } } }
    // termômetro: raio x Sol
    const aT = PT.jan(t, t30 - 0.2, tE - 0.3, 0.4, 0.4);
    if (aT > 0) { const base = 1300; [[200, 5500, "255,170,60", "SOL"], [880, 30000, "200,220,255", "RAIO"]].forEach(([bx, v, cor, nome]) => { const h = 600 * v / 30000 * PT.out((t - t30 + 0.2) / 0.8); for (let yy = 0; yy < h; yy += 6) pontoP(x, bx, base - yy, 10, cor, aT * 0.8); rotuloP(x, nome, bx, base + 40, 30, cor, aT); }); }
  });
};

// =============== 5. o mito: cai duas vezes, sim ===============
CENAS.mito = (el, c, B) => {
  const q = tempoPalavras(c), tD = B("duas"), tMe = B("mentira"), tA = B("alto"), tCr = B("cristo"), tE = B("empire"), tV = B("vinte");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["frase", 330, 56, "“um raio nunca cai duas vezes no mesmo lugar”", "pt-fino", "white-space:normal;left:80px;width:920px;line-height:1.25"],
    ["ment", 600, 140, "mentira", "pt-ve", "transform:rotate(-8deg)"],
    ["vinte", 330, 110, "~20 por ano", "pt-am"],
  ]);
  MD.arrive(tl, tx.frase, q("frase,") - 0.2, { y: 14 }); MD.slam(tl, tx.ment, tMe - 0.1, { from: 2 }); MD.leave(tl, [tx.frase, tx.ment], tA - 0.3);
  MD.slam(tl, tx.vinte, tV - 0.15, { from: 1.3 });
  const nv = T.nuvem(30000), N = pontosNuvem(12000, 8, 540, 220, 0.5), r = prng(6);
  const raiosC = [0, 1, 2].map((k) => gerarRaio(500 + k * 30, 380, 470, 860, 40 + k)), raiosE = [0, 1, 2, 3].map((k) => gerarRaio(520 + k * 25, 380, 555, 690, 60 + k));
  T.quadro((x, t) => {
    desenharNuvem(nv, N, t, PT.ss((t - tA + 0.5) / 0.6), { lum: 0.08 });
    const vC = PT.jan(t, tA - 0.5, tE - 0.3, 0.6, 0.5), vE = PT.ss((t - tE + 0.3) / 0.6);
    let i = nv.k; const rr = prng(12);
    if (vC > 0.01) {
      // o Corcovado e o Cristo de braços abertos
      for (let k = 0; k < 9000; k++) { const xx = rr() * W, topo = 880 + 380 * Math.pow(Math.abs(xx - 470) / 560, 1.6), yy = topo + rr() * (1420 - topo); nv.ponto(i++, xx, yy, 0.3, 0.5, 0.4, vC * 0.35, 2.8); }
      for (let k = 0; k < 900; k++) { const u = rr(); nv.ponto(i++, 470 + (rr() - 0.5) * 18, 880 - u * 120, 0.9, 0.92, 1.0, vC * 0.75, 2.8); }
      for (let k = 0; k < 600; k++) { const u = rr(); nv.ponto(i++, 470 + (u - 0.5) * 150, 800 + (rr() - 0.5) * 8, 0.9, 0.92, 1.0, vC * 0.75, 2.8); }
      for (let k = 0; k < 160; k++) { const ang = rr() * 6.283; nv.ponto(i++, 470 + Math.cos(ang) * 10, 772 + Math.sin(ang) * 10, 0.9, 0.92, 1.0, vC * 0.8, 2.8); }
      raiosC.forEach((rs, k) => { const tk = tCr + k * 0.9, u = t - tk; if (u > 0 && u < 0.5) desenharRaio(x, rs, rs.total, Math.exp(-u * 6) * vC); });
    }
    if (vE > 0.01) {
      // skyline com o Empire State (o mais alto, com antena)
      [[120, 260], [230, 330], [330, 280], [430, 420], [650, 380], [760, 300], [870, 350], [970, 250]].forEach(([bx, h]) => { for (let k = 0; k < 500; k++) nv.ponto(i++, bx + (rr() - 0.5) * 80, 1360 - rr() * h, 0.6, 0.7, 0.9, vE * 0.35, 2.6); });
      for (let k = 0; k < 2200; k++) { const u = rr(), w = u < 0.6 ? 110 : u < 0.85 ? 70 : 34; nv.ponto(i++, 555 + (rr() - 0.5) * w, 1360 - u * 560, 0.85, 0.9, 1.0, vE * 0.6, 2.6); }
      for (let k = 0; k < 120; k++) nv.ponto(i++, 555, 800 - k, 1.0, 1.0, 1.0, vE * 0.8, 2.6);
      raiosE.forEach((rs, k) => { const tk = tE + 0.4 + k * 0.55, u = t - tk; if (u > 0 && u < 0.45) desenharRaio(x, rs, rs.total, Math.exp(-u * 7) * vE); });
    }
    nv.total(i);
  });
};

// =============== 6. o truque: conte os segundos ===============
CENAS.truque = (el, c, B) => {
  const q = tempoPalavras(c), tL = B("luz"), tS = B("som"), tC = B("clarao"), tCo = B("conta"), tK = B("km"), t30 = B("trinta"), tCa = B("casa");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [
    ["luz", 330, 76, "luz: na hora", "pt-am"], ["som", 430, 76, "som: 340 m/s", "pt-ci"],
    ["cont", 330, 160, "1", "pt-ci"], ["reg", 330, 110, "3 s ≈ 1 km", "pt-am"],
    ["p30", 330, 92, "menos de 30 s", "pt-ve"], ["casa", 440, 76, "entra em casa", "pt-am"],
  ]);
  MD.arrive(tl, tx.luz, tL - 0.1, { y: 14 }); MD.arrive(tl, tx.som, tS - 0.1, { y: 14 }); MD.leave(tl, [tx.luz, tx.som], tC - 0.4);
  MD.arrive(tl, tx.cont, tCo - 0.2, { y: 10 }); MD.leave(tl, tx.cont, tK - 0.3);
  aCadaQuadro((t) => { if (t < tCo - 0.3 || t > tK) return; tx.cont.textContent = `${Math.min(3, 1 + Math.floor((t - tCo + 0.2) / ((tK - tCo) / 3)))}…`; });
  MD.slam(tl, tx.reg, tK - 0.1, { from: 1.3 }); MD.leave(tl, tx.reg, t30 - 0.3);
  MD.slam(tl, tx.p30, t30 - 0.1, { from: 1.3 }); MD.slam(tl, tx.casa, tCa - 0.2, { from: 1.3 });
  const nv = T.nuvem(20000), N = pontosNuvem(9000, 13, 860, 640, 0.4), raio = gerarRaio(860, 700, 830, 1130, 31), r = prng(2);
  T.quadro((x, t) => {
    desenharNuvem(nv, N, t, 1, { lum: 0.06 });
    // chão em perspectiva com marcas de quilômetro até a tempestade
    let i = nv.k; const rc = prng(2);
    for (let k = 0; k < 7000; k++) { const u = rc(), yy = 1140 + Math.pow(u, 1.8) * 280, xx = rc() * W; nv.ponto(i++, xx, yy, 0.3, 0.45, 0.35, 0.35, 2 + 2 * u); }
    nv.total(i);
    [1, 2, 3].forEach((k) => { const xx = 140 + k * 240; linhaP(x, xx, 1135, xx, 1155, "255,226,140", 0.7, 3); rotuloP(x, `${k} km`, xx, 1180, 26, "255,226,140", 0.8); });
    rotuloP(x, "VOCÊ", 140, 1300, 30, "255,255,255", 0.9); discoP(x, 140, 1250, 14, "255,255,255", 0.9);
    // clarões: em "luz" e em "clarão" (este é o que a gente conta)
    [tL - 0.2, tC - 0.1].forEach((tf) => { const u = t - tf; if (u > 0 && u < 0.6) { desenharRaio(x, raio, raio.total, Math.exp(-u * 6)); brilhoP(x, 840, 900, 700, "220,220,255", 0.6 * Math.exp(-u * 6)); } });
    // a luz chega na hora (linha instantânea); o som anda devagar (anéis)
    const aL = PT.jan(t, tL - 0.1, tS + 1, 0.1, 0.5); if (aL > 0) linhaP(x, 830, 1130, 160, 1250, "255,236,190", 0.8 * aL, 3);
    const t0s = t < tC ? tS - 0.2 : tC - 0.1, us = t - t0s;
    if (us > 0) for (let k = 0; k < 3; k++) { const rr = (us - k * 0.25) * 140; if (rr > 0 && rr < 760) anelP(x, 830, 1130, rr, "143,227,255", 0.55 * (1 - rr / 760), 3); }
    // a casa (com janela acesa) no fim
    const aC = PT.ss((t - tCa + 0.5) / 0.6);
    if (aC > 0) { const hx = 300, hy = 1240; for (let k = 0; k < 40; k++) { pontoP(x, hx - 70 + k * 3.5, hy, 3, "255,226,140", aC); pontoP(x, hx - 70 + k * 3.5, hy - 100, 3, "255,226,140", aC * 0.6); } for (let k = 0; k < 30; k++) { pontoP(x, hx - 70, hy - k * 3.4, 3, "255,226,140", aC); pontoP(x, hx + 70, hy - k * 3.4, 3, "255,226,140", aC); pontoP(x, hx - 85 + k * 2.9, hy - 100 - k * 2.2, 3, "255,226,140", aC); pontoP(x, hx + 85 - k * 2.9, hy - 100 - k * 2.2, 3, "255,226,140", aC); } discoP(x, hx, hy - 50, 18, "255,210,63", aC); brilhoP(x, hx, hy - 50, 120, "255,210,63", 0.6 * aC); }
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 660, 840, 1020], textos = ["o gelo carrega a nuvem", "ela abre caminho em degraus", "o clarão esquenta o ar", "o ar explode: trovão"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 54, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 0.45);
  const nv = T.nuvem(12000), N = pontosNuvem(9000, 17, 540, 260, 0.5), raio = gerarRaio(540, 330, 520, 1400, 77);
  T.quadro((x, t) => {
    const sai = 1 - PT.ss((t - tC - 0.45) / 0.5);
    desenharNuvem(nv, N, t, 0.5 * sai, { lum: 0.05 });
    tP.forEach((tp, k) => { const u = t - tp + 0.1; if (u > 0 && u < 0.4) brilhoP(x, 540, 900, 900, "220,220,255", 0.25 * Math.exp(-u * 8) * sai); const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, ["225,242,255", "170,150,255", "255,255,255", "255,138,61"][k], a); brilhoP(x, 160, Y[k], 50, "200,200,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 0.9);
};
