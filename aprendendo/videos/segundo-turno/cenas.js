// Cenas do vídeo "Como funciona o segundo turno" — pontos de luz na GPU (motor/pontos-gpu.js).
// Neutro: só regras, sem candidatos nem partidos. Os eleitores são 1.600 pontos que se rearrumam
// (multidão → barras → pizza → cidades → pessoas). Retenção: paradoxo no gancho, promessa do
// desempate (paga no fim), mito derrubado.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const COR_E = { am: [1.0, 0.82, 0.25], ci: [0.56, 0.89, 1.0], ve: [0.1, 0.86, 0.63], ro: [1.0, 0.4, 0.6], la: [1.0, 0.56, 0.26], cz: [0.5, 0.54, 0.62] };
const CAND = ["am", "ci", "ve", "ro", "la"];
const rgbS = (c) => `${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)}`;

// ---------- eleitores: cada um tem uma "preferência" u (0..1) fixa; os grupos são faixas de u ----------
const NE = 1600;
const ELEITOR = (() => { const r = prng(77), out = []; for (let i = 0; i < NE; i++) out.push({ u: (i + r()) / NE, d: r(), j: r(), f: r() * 6.283 }); return out; })();
const POR_U = ELEITOR.map((e, i) => i).sort((a, b) => ELEITOR[a].u - ELEITOR[b].u);
// distribui os eleitores em grupos [{v, cor, a}] pela ordem de u; devolve [{g, rank, n}] por eleitor
function grupos(gs) {
  const out = new Array(NE); let ini = 0;
  gs.forEach((g, k) => { const n = Math.round(g.v * NE), fim = k === gs.length - 1 ? NE : Math.min(NE, ini + n); for (let q = ini; q < fim; q++) out[POR_U[q]] = { g: k, rank: q - ini, n: fim - ini }; ini = fim; });
  return out;
}
const BASE = 1260, COLS = 14, PASSO = 11;
const Y50 = BASE - (NE * 0.5 / COLS) * PASSO;
// barras: gs = [{v, cor, x, a}]
function barras(gs) {
  const m = grupos(gs);
  return ELEITOR.map((e, i) => { const { g, rank } = m[i], G = gs[g], col = rank % COLS, lin = Math.floor(rank / COLS); return { x: G.x + (col - (COLS - 1) / 2) * PASSO, y: BASE - lin * PASSO, c: COR_E[G.cor], a: G.a ?? 1 }; });
}
// pizza: os eleitores ocupam um disco, em fatias pela ordem de u
function pizza(gs, cx, cy, R) {
  const ang = [], ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < NE; i++) { const rr = Math.sqrt((i + 0.5) / NE) * R, th = i * ga; ang.push({ x: cx + Math.cos(th) * rr, y: cy + Math.sin(th) * rr, a: ((Math.atan2(Math.sin(th), Math.cos(th)) + Math.PI / 2 + 6.283) % 6.283) }); }
  ang.sort((p, q) => p.a - q.a);
  const m = grupos(gs); let base = 0; const ini = gs.map((g, k) => { const b = base; base += Math.round(g.v * NE); return b; });
  return ELEITOR.map((e, i) => { const { g, rank } = m[i], p = ang[Math.min(NE - 1, ini[g] + rank)]; return { x: p.x, y: p.y, c: COR_E[gs[g].cor], a: gs[g].a ?? 1 }; });
}
// multidão espalhada
function multidao(seed, caixa = [90, 560, 900, 720]) {
  const r = prng(seed);
  return ELEITOR.map(() => ({ x: caixa[0] + r() * caixa[2], y: caixa[1] + r() * caixa[3], c: COR_E[CAND[Math.floor(r() * 4)]], a: 0.75 }));
}
// discos (cidades, grupos): ds = [{v, cx, cy, R, cor, a}]
function discos(ds) {
  const m = grupos(ds), ga = Math.PI * (3 - Math.sqrt(5));
  return ELEITOR.map((e, i) => { const { g, rank, n } = m[i], D = ds[g], rr = Math.sqrt((rank + 0.5) / n) * D.R, th = rank * ga; return { x: D.cx + Math.cos(th) * rr, y: D.cy + Math.sin(th) * rr * (D.achata ?? 1), c: COR_E[D.cor], a: D.a ?? 1 }; });
}
// silhuetas de pessoas feitas de eleitores: ps = [{v, cx, cy, esc, cor, a}]
const SIL = (() => { const r = prng(81), out = []; while (out.length < 2000) { const x = (r() - 0.5) * 2, y = r() * 2.2 - 1.1; const cab = Math.hypot(x, (y + 0.72) * 1.0) < 0.3, corpo = y > -0.35 && y < 1.1 && Math.abs(x) < 0.62 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 1.1) / 1.45, 2))) + (y > 0.2 ? 0.1 : 0); if (cab || corpo) out.push([x, y]); } return out; })();
function pessoas(ps) {
  const m = grupos(ps);
  return ELEITOR.map((e, i) => { const { g, rank, n } = m[i], P = ps[g], s = SIL[Math.floor(rank / n * SIL.length)]; return { x: P.cx + s[0] * P.esc, y: P.cy + s[1] * P.esc, c: COR_E[P.cor], a: P.a ?? 1 }; });
}
// desenha os eleitores indo de um arranjo a outro: fases = [[t, arranjo], ...]
function desenharEleitores(nv, fases, t, o = {}) {
  let f = 0; while (f + 1 < fases.length && t >= fases[f + 1][0]) f++;
  const A = fases[Math.max(0, f - 1)][1], Bf = fases[f][1], t0 = fases[f][0], dur = o.dur ?? 1.1, esp = o.esp ?? 0.6, tam = o.tam ?? 9.5;
  let i = nv.k;
  for (let k = 0; k < NE; k++) {
    const e = ELEITOR[k], q = f === 0 ? 1 : PT.inOut((t - t0 - e.d * esp) / dur), a = A[k], b = Bf[k];
    const x = a.x + (b.x - a.x) * q + Math.sin(t * 0.8 + e.f) * 2.2, y = a.y + (b.y - a.y) * q + Math.cos(t * 0.7 + e.f) * 2.2 - Math.sin(q * Math.PI) * 60 * e.j;
    const c = mixC(a.c, b.c, q), al = (a.a + (b.a - a.a) * q) * (o.a ?? 1) * (0.8 + 0.2 * Math.sin(t * 2 + e.f));
    nv.ponto(i++, x, y, c[0], c[1], c[2], al, tam);
  }
  nv.total(i);
}
function linha50(x, a, txt = "50%") { if (a <= 0) return; x.setLineDash([14, 12]); linhaP(x, 110, Y50, 970, Y50, "255,210,63", a * 0.9, 4); x.setLineDash([]); rotuloP(x, txt, 112, Y50 - 26, 30, "255,226,140", a, "left"); }
const fundoE = (seed) => ambienteP(260, seed);
const fundoD = (x, est, t) => desenharAmbiente(x, est, t, "180,200,255", 0.7);
// valores do primeiro turno (fictícios, só para ilustrar)
const T1 = [{ v: 0.38, cor: "am", x: 225 }, { v: 0.27, cor: "ci", x: 435 }, { v: 0.2, cor: "ve", x: 645 }, { v: 0.15, cor: "ro", x: 855 }];
const pct = (x, gs, a) => gs.forEach((g) => { const h = Math.round(g.v * NE / COLS) * PASSO; rotuloP(x, `${Math.round(g.v * 100)}%`, g.x, BASE - h - 34, 34, rgbS(COR_E[g.cor]), a * (g.a ?? 1)); });

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tV = B("votos"), tG = B("ganhar"), tD = B("data"), tE = B("desempate");
  mostrarGancho(tV + 1.0);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["mais", 330, 66, "o mais votado...", "pt-ci"], ["nao", 420, 82, "não ganhou", "pt-ve"], ["data", 330, 92, "25 de outubro", "pt-am"], ["emp", 430, 54, "e se der empate?", "pt-fino"]]);
  MD.arrive(tl, tx.mais, tG - 1.2, { y: 14 }); MD.slam(tl, tx.nao, tG - 0.05, { from: 1.3 }); MD.leave(tl, [tx.mais, tx.nao], tD - 0.4);
  MD.slam(tl, tx.data, tD - 0.1, { from: 1.3 }); MD.arrive(tl, tx.emp, tE - 0.1, { y: 14 });
  const nv = T.nuvem(NE + 10), est = fundoE(3);
  const fases = [[0, multidao(5)], [tV - 0.2, barras(T1)]];
  T.quadro((x, t) => {
    fundoD(x, est, t);
    desenharEleitores(nv, fases, t);
    const aB = PT.ss((t - tV - 0.8) / 0.6); pct(x, T1, aB);
    const aL = PT.ss((t - tG + 0.3) / 0.5); linha50(x, aL, "50% + 1");
    if (aL > 0) { const pisca = 0.5 + 0.5 * Math.sin(t * 6); brilhoP(x, 225, Y50 + 120, 160, "255,90,110", 0.25 * aL * pisca); }
  });
};

// =============== 2. a regra: mais da metade ===============
CENAS.regra = (el, c, B) => {
  const tM = B("metade"), tP = B("pizza"), tS = B("sozinho"), tD = B("divide"), tMa = B("maioria");
  const T = telaGPU(el, c);
  const tPg = tempoPalavras(c)("pegadinha");
  const tx = palcoTexto(el, [["met", 330, 74, "mais da metade", "pt-am"], ["div", 330, 66, "dividiu: ninguém chega", "pt-ve"], ["mai", 330, 76, "apoio da maioria", "pt-ci"], ["peg", 330, 96, "PEGADINHA", "pt-ve"]]);
  MD.slam(tl, tx.met, tM - 0.1, { from: 1.3 }); MD.leave(tl, tx.met, tD - 0.3); MD.slam(tl, tx.div, tD + 0.2, { from: 1.25 }); MD.leave(tl, tx.div, tMa - 0.35); MD.slam(tl, tx.mai, tMa - 0.05, { from: 1.3 }); MD.leave(tl, tx.mai, tPg - 0.35); MD.slam(tl, tx.peg, tPg - 0.05, { from: 1.5 });
  const nv = T.nuvem(NE + 10), est = fundoE(7), cx = 540, cy = 900, R = 330;
  const fases = [[0, barras(T1)], [c.ini + 1.2, multidao(9, [180, 560, 720, 700])],
    [tP - 0.3, pizza([{ v: 1, cor: "cz", a: 0.6 }], cx, cy, R)], [tS - 0.4, pizza([{ v: 0.53, cor: "am" }, { v: 0.47, cor: "cz", a: 0.45 }], cx, cy, R)],
    [tD - 0.1, pizza([{ v: 0.3, cor: "am" }, { v: 0.25, cor: "ci" }, { v: 0.2, cor: "ve" }, { v: 0.15, cor: "ro" }, { v: 0.1, cor: "la" }], cx, cy, R)],
    [tMa - 0.3, pizza([{ v: 0.56, cor: "am" }, { v: 0.44, cor: "ci", a: 0.55 }], cx, cy, R)]];
  T.quadro((x, t) => {
    fundoD(x, est, t);
    desenharEleitores(nv, fases, t, { tam: 10 });
    // a linha que divide a pizza ao meio
    const aL = PT.jan(t, tP + 0.6, tD - 0.2, 0.5, 0.4);
    if (aL > 0) { linhaP(x, cx, cy - R - 30, cx, cy + R + 30, "255,255,255", 0.7 * aL, 4); rotuloP(x, "METADE", cx, cy + R + 64, 30, "255,255,255", aL); }
    const aS = PT.jan(t, tS + 0.2, tD - 0.2, 0.4, 0.4);
    if (aS > 0) rotuloP(x, "53%", cx + 250, cy - R - 10, 56, "255,226,140", aS);
    const aD = PT.jan(t, tD + 0.9, tMa - 0.3, 0.4, 0.4);
    if (aD > 0) [["30%", -0.95], ["25%", 0.1], ["20%", 1.2], ["15%", 2.15], ["10%", 2.75]].forEach(([s, a]) => rotuloP(x, s, cx + Math.cos(a - Math.PI / 2 + 0.95) * (R + 60), cy + Math.sin(a - Math.PI / 2 + 0.95) * (R + 60), 32, "255,255,255", aD * 0.9));
  });
};

// =============== 3. votos válidos ===============
const FIG = (() => { const r = prng(91), out = []; while (out.length < 70) { const x = (r() - 0.5) * 2, y = r() * 2.4 - 1.2; if (Math.hypot(x, y + 0.75) < 0.38 || (y > -0.25 && y < 1.2 && Math.abs(x) < 0.75 * Math.sqrt(Math.max(0, 1 - Math.pow((y - 1.2) / 1.45, 2))))) out.push([x, y]); } return out; })();
CENAS.validos = (el, c, B) => {
  const tV = B("validos"), tB = B("branco"), tC = B("cem"), tN = B("noventa"), tP = B("passa");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["val", 330, 76, "votos válidos", "pt-ve"], ["fora", 420, 50, "branco e nulo: fora", "pt-fino"], ["cem", 330, 76, "100 votos", "pt-ci"], ["nov", 330, 76, "90 válidos", "pt-ci"], ["met", 420, 54, "metade: 45", "pt-fino"], ["pas", 330, 80, "46 = vence", "pt-am"]]);
  const txq = palcoTexto(el, [["q", 330, 62, "branco vai pra quem ganha?", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, txq.q, c.ini + 0.4, { from: 1.25 }); MD.leave(tl, txq.q, tV - 0.4);
  MD.slam(tl, tx.val, tV - 0.1, { from: 1.3 }); MD.arrive(tl, tx.fora, tB, { y: 14 }); MD.leave(tl, [tx.val, tx.fora], tC - 0.4);
  MD.slam(tl, tx.cem, tC - 0.05, { from: 1.2 }); MD.leave(tl, tx.cem, tN - 0.35); MD.slam(tl, tx.nov, tN - 0.05, { from: 1.2 }); MD.arrive(tl, tx.met, tN + 0.25, { y: 14 }); MD.leave(tl, [tx.nov, tx.met], tP - 0.3); MD.slam(tl, tx.pas, tP - 0.05, { from: 1.35 });
  const tDe = tempoPalavras(c)("derruba"), tx2 = palcoTexto(el, [["mit", 330, 96, "UM MITO...", "pt-ve"]]);
  MD.leave(tl, tx.pas, tDe - 0.35); MD.slam(tl, tx2.mit, tDe - 0.05, { from: 1.5 });
  const nv = T.nuvem(100 * FIG.length + 10), est = fundoE(11);
  T.quadro((x, t) => {
    fundoD(x, est, t);
    let i = nv.k; const fora = PT.ss((t - tC - 1.2) / 1.2), grupo = PT.ss((t - tP) / 0.6);
    for (let k = 0; k < 100; k++) {
      const col = k % 10, lin = Math.floor(k / 10), gx = 540 + (col - 4.5) * 86, gy = 590 + lin * 74, nulo = k % 10 === 7;
      const surge = PT.ss((t - c.ini - 0.4 - k * 0.012) / 0.5);
      let px = gx, py = gy, cor = COR_E.ci, al = surge;
      if (nulo) { const q = PT.ss((t - tB - 0.2) / 0.6); cor = mixC(COR_E.ci, COR_E.cz, q); al *= 1 - 0.45 * q; py += fora * 60; px += fora * (col < 5 ? -1 : 1) * 10; al *= 1 - 0.5 * fora; }
      else if (grupo > 0) { const idx = Math.floor(k / 10) * 9 + (col > 7 ? col - 1 : col); if (idx < 46) cor = mixC(COR_E.ci, COR_E.am, grupo); else al *= 1 - 0.4 * grupo; }
      for (const s of FIG) nv.ponto(i++, px + s[0] * 24, py + s[1] * 24, cor[0], cor[1], cor[2], al, 5.5);
    }
    nv.total(i);
    const aT = PT.ss((t - tB - 0.2) / 0.5) * (1 - PT.ss((t - tC + 0.2) / 0.5));
    if (aT > 0) for (let k = 7; k < 100; k += 10) { const col = 7, lin = Math.floor(k / 10); rotuloP(x, lin % 2 ? "NULO" : "BRANCO", 540 + (col - 4.5) * 86, 590 + lin * 74 + 40, 16, "200,205,215", aT); }
  });
};

// =============== 4. o mito do voto nulo ===============
CENAS.mito = (el, c, B) => {
  const tN = B("nulo"), tM = B("mito"), tC = B("conta"), tF = B("fraude");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["mit", 330, 120, "MITO", "pt-ve"], ["fra", 330, 56, "refaz: só se a Justiça anular votos", "pt-ci", "white-space:normal;left:70px;width:940px"]]);
  MD.slam(tl, tx.mit, tM - 0.08, { from: 1.6 }); MD.leave(tl, tx.mit, tF - 0.4); MD.slam(tl, tx.fra, tF - 0.05, { from: 1.2 });
  const tDi = B("dica"), tx2 = palcoTexto(el, [["dic", 330, 66, "quer que conte? vote em alguém", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.leave(tl, tx.fra, tDi - 1.6); MD.slam(tl, tx2.dic, tDi - 1.3, { from: 1.3 });
  const nv = T.nuvem(NE + 10), est = fundoE(13);
  const mito = barras([{ v: 0.22, cor: "am", x: 260 }, { v: 0.18, cor: "ci", x: 470 }, { v: 0.6, cor: "cz", x: 800, a: 0.75 }]);
  const fases = [[0, multidao(15)], [tN - 0.4, mito], [tC - 0.1, barras([{ v: 0.22, cor: "am", x: 260 }, { v: 0.18, cor: "ci", x: 470 }, { v: 0.6, cor: "cz", x: 800, a: 0.22 }])]];
  T.quadro((x, t) => {
    fundoD(x, est, t);
    desenharEleitores(nv, fases, t);
    const aR = PT.ss((t - tN + 0.2) / 0.6);
    if (aR > 0) { rotuloP(x, "NULO 60%", 800, BASE + 50, 32, "200,205,215", aR); rotuloP(x, "VÁLIDOS", 365, BASE + 50, 32, "150,255,200", aR); }
    const aC = PT.ss((t - tC) / 0.6);
    if (aC > 0) { x.setLineDash([10, 10]); x.strokeStyle = `rgba(255,255,255,${0.5 * aC})`; x.lineWidth = 3; x.strokeRect(150, 560, 420, 750); x.setLineDash([]); rotuloP(x, "SÓ ISSO CONTA", 360, 530, 34, "255,255,255", aC); brilhoP(x, 260, 1050, 220, "255,210,63", 0.3 * aC); rotuloP(x, "VENCE", 260, BASE - 0.22 * NE / COLS * PASSO - 40, 32, "255,226,140", aC); }
    // lupa
    const aF = PT.ss((t - tF + 0.2) / 0.5);
    if (aF > 0) { const lx = 300 + Math.sin((t - tF) * 1.3) * 220, ly = 900 + Math.cos((t - tF) * 1.1) * 120; anelP(x, lx, ly, 80, "143,227,255", aF, 8); brilhoP(x, lx, ly, 90, "143,227,255", 0.2 * aF); linhaP(x, lx + 58, ly + 58, lx + 140, ly + 140, "143,227,255", aF, 14); }
  });
};

// =============== 5. o segundo turno ===============
CENAS.segundo = (el, c, B) => {
  const tD = B("dois"), tN = B("nova"), tC = B("certa"), tP = B("presidente"), tG = B("governador"), tDu = B("duzentos"), tM = B("menores");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["seg", 330, 80, "2º turno", "pt-am"], ["mai", 430, 50, "um passa da metade", "pt-fino"],
    ["pre", 330, 64, "presidente", "pt-ci"], ["gov", 420, 64, "governador", "pt-ci"], ["pref", 510, 50, "prefeito: cidade grande", "pt-fino"]]);
  MD.slam(tl, tx.seg, tN - 0.05, { from: 1.3 }); MD.arrive(tl, tx.mai, tC - 0.2, { y: 14 }); MD.leave(tl, [tx.seg, tx.mai], tP - 0.3);
  MD.arrive(tl, tx.pre, tP - 0.1, { y: 14 }); MD.arrive(tl, tx.gov, tG - 0.1, { y: 14 }); MD.arrive(tl, tx.pref, tDu - 0.6, { y: 14 });
  const tPr = tempoPalavras(c)("prometi"), tx2 = palcoTexto(el, [["pro", 330, 80, "a regra prometida", "pt-am"]]);
  MD.leave(tl, [tx.pre, tx.gov, tx.pref], tPr - 0.6); MD.slam(tl, tx2.pro, tPr - 0.3, { from: 1.4 });
  const nv = T.nuvem(NE + 10), est = fundoE(17);
  const T1b = T1.map((g, k) => k > 1 ? { ...g, a: 0.25 } : g), T2 = [{ v: 0.53, cor: "am", x: 380 }, { v: 0.47, cor: "ci", x: 700 }];
  const cid = discos([{ v: 0.82, cx: 360, cy: 1000, R: 250, cor: "ci" }, { v: 0.18, cx: 820, cy: 1120, R: 120, cor: "ve" }]);
  const fases = [[0, barras(T1)], [tD - 0.1, barras(T1b)], [tN + 0.3, barras(T2)], [tDu - 0.5, cid]];
  T.quadro((x, t) => {
    fundoD(x, est, t);
    desenharEleitores(nv, fases, t);
    const aB = PT.jan(t, c.ini, tN + 0.2, 0.3, 0.4); pct(x, T1b, aB);
    const a2 = PT.jan(t, tN + 1.3, tDu - 0.6, 0.5, 0.4); pct(x, T2, a2); linha50(x, a2);
    if (t > tC - 0.3 && a2 > 0) { const k = PT.ss((t - tC + 0.3) / 0.5); brilhoP(x, 380, Y50, 200, "255,210,63", 0.45 * k * a2); rotuloP(x, "✓", 380, Y50 - 120, 70, "120,255,190", k * a2); }
    const aG = PT.ss((t - tDu + 0.1) / 0.6), aP = PT.ss((t - tM + 0.2) / 0.6);
    if (aG > 0) { rotuloP(x, "+200 MIL ELEITORES", 360, 1300, 32, "143,227,255", aG); rotuloP(x, "TEM 2º TURNO", 360, 1345, 28, "255,226,140", aG); }
    if (aP > 0) { rotuloP(x, "CIDADE MENOR", 820, 1300, 32, "120,255,190", aP); rotuloP(x, "TURNO ÚNICO", 820, 1345, 28, "255,226,140", aP); }
  });
};

// =============== 6. o desempate ===============
CENAS.empate = (el, c, B) => {
  const tE = B("empate"), tPe = B("penalti"), tV = B("velho"), tD = B("desiste"), tT = B("terceiro");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["emp", 330, 92, "50% a 50%", "pt-am"], ["pen", 430, 50, "sem pênalti nem moeda", "pt-fino"], ["vel", 330, 80, "ganha o mais velho", "pt-am"], ["ter", 330, 68, "entra o 3º colocado", "pt-ci"]]);
  MD.slam(tl, tx.emp, tE - 0.05, { from: 1.3 }); MD.arrive(tl, tx.pen, tPe - 0.1, { y: 14 }); MD.leave(tl, [tx.emp, tx.pen], tV - 0.5);
  MD.slam(tl, tx.vel, tV - 0.1, { from: 1.35 }); MD.leave(tl, tx.vel, tT - 0.4); MD.slam(tl, tx.ter, tT - 0.05, { from: 1.25 });
  const nv = T.nuvem(NE + 10), est = fundoE(19);
  const E = [{ v: 0.5, cor: "am", x: 380 }, { v: 0.5, cor: "ci", x: 700 }];
  const P2 = pessoas([{ v: 0.5, cx: 330, cy: 920, esc: 210, cor: "am" }, { v: 0.5, cx: 750, cy: 920, esc: 210, cor: "ci" }]);
  const P3 = pessoas([{ v: 0.5, cx: 330, cy: 920, esc: 210, cor: "am" }, { v: 0.5, cx: 750, cy: 920, esc: 210, cor: "ve" }]);
  const P2s = pessoas([{ v: 0.5, cx: 330, cy: 920, esc: 210, cor: "am" }, { v: 0.5, cx: 750, cy: 920, esc: 210, cor: "cz", a: 0.15 }]);
  const fases = [[0, barras([{ v: 0.53, cor: "am", x: 380 }, { v: 0.47, cor: "ci", x: 700 }])], [tE - 0.4, barras(E)], [tV - 1.6, P2], [tD + 0.1, P2s], [tT - 0.2, P3]];
  T.quadro((x, t) => {
    fundoD(x, est, t);
    desenharEleitores(nv, fases, t, { dur: 1.0, esp: 0.4 });
    const aE = PT.jan(t, tE + 0.7, tV - 1.6, 0.4, 0.4); pct(x, E, aE); linha50(x, aE, "");
    const aI = PT.ss((t - tV + 0.3) / 0.5) * (1 - PT.ss((t - tD) / 0.4));
    if (aI > 0) { rotuloP(x, "61 ANOS", 330, 1210, 40, "255,226,140", aI); rotuloP(x, "58 ANOS", 750, 1210, 40, "200,240,255", aI); brilhoP(x, 330, 900, 300, "255,200,60", 0.35 * aI); rotuloP(x, "✓", 330, 610, 80, "120,255,190", aI); }
    const aS = PT.jan(t, tD, tT + 0.6, 0.3, 0.6);
    if (aS > 0) rotuloP(x, "DESISTIU", 750, 1210, 40, "255,140,150", aS);
    const aT = PT.ss((t - tT + 0.1) / 0.6);
    if (aT > 0) rotuloP(x, "3º COLOCADO", 750, 1210, 40, "120,255,190", aT);
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["mais da metade dos válidos", "branco e nulo não contam", "ninguém chegou? 2º turno", "empate: ganha o mais velho"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const nv = T.nuvem(NE + 10), est = fundoE(23);
  const fases = [[0, pessoas([{ v: 0.5, cx: 330, cy: 920, esc: 210, cor: "am" }, { v: 0.5, cx: 750, cy: 920, esc: 210, cor: "ve" }])], [c.ini + 0.3, pizza([{ v: 0.56, cor: "am" }, { v: 0.44, cor: "ci", a: 0.5 }], 540, 1220, 140)]];
  T.quadro((x, t) => {
    fundoD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    desenharEleitores(nv, fases, t, { a: 0.6 * sai, tam: 5 });
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, ["255,210,63", "200,205,215", "143,227,255", "255,138,61"][k], a); brilhoP(x, 160, Y[k], 50, "255,200,140", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
