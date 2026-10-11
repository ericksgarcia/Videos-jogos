// Cenas do vídeo "Pães e peixes" (João 6:1–14) — Luz da Palavra: mundo em pontos de luz, personagens em line art.
// Retenção: quadro 0 = o menino (sem rosto) erguendo o cesto com cinco pães e dois peixes diante de uma
// multidão de luzes; gancho emocional; laço aberto ("o que sobrou") pago nos doze cestos; "pensa rápido"
// antes do menino; a conta de Filipe (moedas que viram migalhas); Jesus dá graças e o pão não acaba;
// pergunta única. Citações (Almeida, ARC): João 6:5, 6:9, 6:12. Fatos: 6:2, 6:7 (200 denários ≈ 8 meses
// de salário), 6:8–11, 6:13 (doze cestos).

const PP_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.9) };
const PP_EST = fundoProfundo(141, 380);
const PP_F = {
  pao: formaPontos("bread", 700), peixe: formaPontos("fish", 700), moedas: formaPontos("coins", 6000), po: poeiraForma(6000, 143, 0.9),
  t5000: formaTexto("5.000", 7000, { fonte: "Cinzel", peso: 700, tam: 0.26 }), t8: formaTexto("8 MESES", 7000, { fonte: "Cinzel", peso: 700, tam: 0.2 }),
  q: formaTexto("?", 5000, { fonte: "Cinzel", peso: 700, tam: 0.6 }),
};
const PP_CHAO = 1450, PP_QUENTE = [1, 0.86, 0.6];
// chão: relva perto, a multidão (pontos) no campo, o mar da Galileia e os montes no horizonte
const PP_RELVA = (() => { const r = prng(145), L = []; for (let k = 0; k < 3200; k++) L.push([-800 + r() * 2700, 0.55 + Math.pow(r(), 1.6) * 6, r(), r()]); return L; })();
const PP_POVO = (() => { const r = prng(147), L = []; for (let k = 0; k < 2300; k++) L.push([-1000 + r() * 3100, 2.0 + Math.pow(r(), 0.9) * 6, r(), r()]); return L; })();
const PP_MAR = (() => { const r = prng(149), L = []; for (let k = 0; k < 1400; k++) L.push([-2500 + r() * 6000, 9 + r() * 6, r()]); return L; })();
const PP_MONTE = (() => { const r = prng(151), L = []; for (let k = 0; k < 900; k++) { const X = -3000 + r() * 7000, top = 1450 - 520 * Math.exp(-Math.pow((X - 300) / 1500, 2)) - 260 * Math.exp(-Math.pow((X - 2600) / 900, 2)); L.push([X, top + Math.pow(r(), 2) * (1450 - top), r(), Math.abs(r() - 0.5) < 0.04]); } return L; })();
function PP_cenario(nv, x, i, t, cam, o = {}) {
  const a = o.a ?? 1, povo = o.povo ?? 1, sent = o.sentado ?? 0, quente = o.quente ?? 0;
  i = desenharFundo(nv, PP_EST, t, cam, LUZ.luz, 0.45 * a, i);
  const [hx, hy] = projP(cam, 900, 1450, 14); brilhoP(x, hx, hy - 40, 1000, LUZS.ambar, 0.2 * a); brilhoP(x, hx, hy, 500, "255,140,110", 0.1 * a);
  for (const [X, Y, v, crista] of PP_MONTE) { const [sx, sy, k] = projP(cam, X, Y, 18); if (sx < -20 || sx > 1100) continue; nv.ponto(i++, sx, sy, 0.7, 0.55, 0.6, a * (crista ? 0.3 : 0.05 + 0.06 * v), 2.5); }
  for (const [X, z, v] of PP_MAR) { const [sx, sy, k] = projP(cam, X, PP_CHAO, z); if (sx < -20 || sx > 1100) continue; const br = 0.5 + 0.5 * Math.sin(t * 1.6 + X * 0.01 + v * 9); nv.ponto(i++, sx, sy, 0.75, 0.82, 1, a * (0.06 + 0.22 * br * v), 2 + 2 * v); }
  // a multidão: cada pessoa é um corpo e uma cabeça de luz (sentada: mais baixa)
  if (povo > 0.01) for (const [X, z, v, w] of PP_POVO) { if (i >= nv.n - 4000) break; const ap = povo * PT.ss((povo * 1.4 - (z - 2) / 6) / 0.4); if (ap < 0.01) continue; const [sx, sy, k] = projP(cam, X, PP_CHAO, z); if (sx < -20 || sx > 1100 || sy > 1950) continue;
    const alt = (sent ? 70 : 120) * k, c = mixCor([0.95, 0.85, 0.7], LUZ.luz, quente); nv.ponto(i++, sx, sy - alt * 0.45, c[0], c[1], c[2], a * ap * (0.35 + 0.3 * v), Math.max(1.6, 26 * k)); nv.ponto(i++, sx, sy - alt * (0.95 + 0.05 * Math.sin(t * 1.2 + w * 9)), c[0], c[1], c[2], a * ap * (0.45 + 0.3 * v), Math.max(1.4, 16 * k)); }
  for (const [X, z, v, w] of PP_RELVA) { const [sx0, sy, k] = projP(cam, X, PP_CHAO, z); const sx = sx0 + Math.sin(t * 1.3 + X * 0.01 + w * 6) * 3 * k; if (sx < -20 || sx > 1100 || sy > 1950) continue; const c = mixCor([0.5, 0.68, 0.35], LUZ.ouro, 0.3 * w + 0.4 * quente); nv.ponto(i++, sx, sy - 6 * w * k, c[0], c[1], c[2], a * (0.1 + 0.2 * v), (2 + 2.5 * w) * Math.min(2, 0.4 + k)); }
  return i;
}
// o cesto do menino com cinco pães e dois peixes (line art), na altura das mãos
function PP_cesto(x, inf, H, o = {}) {
  const k = inf.escala, U = H * k, [m0, m1] = inf.maos, cx = (m0[0] + m1[0]) / 2 + inf.d * 0.01 * U, cy = Math.min(m0[1], m1[1]) - 0.012 * U, r = (o.r || 0.12), R = r * U, a = o.a ?? 1;
  brilhoP(x, cx, cy - 0.4 * R, R * 3.2, LUZS.ambar, (o.brilho ?? 0.35) * a);
  objetoLinha(x, "cesto", { mao: [cx, cy], H, k, d: inf.d, cor: PP_QUENTE, a, r });
  if (o.cheio !== false) { [-0.62, -0.31, 0, 0.31, 0.62].forEach((u, j) => objetoLinha(x, "pao", { mao: [cx + u * R, cy - 0.38 * R - (j % 2) * 0.12 * R], H, k, d: 1, cor: [1, 0.85, 0.6], a, r: r * 0.28 }));
    objetoLinha(x, "peixe", { mao: [cx - 0.25 * R, cy - 0.7 * R], H, k, d: 1, cor: [0.85, 0.9, 1], a, r: r * 0.42 }); objetoLinha(x, "peixe", { mao: [cx + 0.3 * R, cy - 0.78 * R], H, k, d: -1, cor: [0.85, 0.9, 1], a, r: r * 0.4 }); }
  return [cx, cy, R];
}
const PP_SEGURA = { tronco: 0.02, cabeca: 0.25, braco: [[0.95, 0.85], [1.0, 0.8]], perna: [[-0.06, 0], [0.06, 0]] };

// =============== 1. abertura: o menino ergue o cesto diante da multidão ===============
CENAS.abertura = (el, c, B) => {
  const tP = B("pouco"), tH = B("historia"), tL = B("laco");
  mostrarGancho(tH + 0.3);
  const TV = telaGPU(el, c, PP_FUNDO), nv = TV.nuvem(60000);
  const CAM = cameraProf([[0, { x: 540, y: 1170, zoom: 1.5 }], [c.fim + 0.5, { x: 560, y: 1090, zoom: 1.08 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), sobe = PT.ss((t - tH + 0.3) / 1.0), pisca = PT.jan(t, tL - 0.3, c.fim, 0.3, 0.6);
    let i = PP_cenario(nv, x, 0, t, cam, { povo: 0.5 + 0.5 * sobe });
    const pz = poseMix(PP_SEGURA, { ...PP_SEGURA, cabeca: -0.1, braco: [[1.5, 0.6], [1.55, 0.55]] }, sobe);
    const inf = personagem(x, t, pz, { tipo: "crianca", x: 470, chao: PP_CHAO, H: 520, dir: 1, cam, z: 1, fase: 1 });
    const [cx, cy, R] = PP_cesto(x, inf, 520, { brilho: 0.35 + 0.3 * pisca });
    if (pisca > 0.01) for (let k = 0; k < 12; k++) { const an = -Math.PI / 2 + (k - 5.5) * 0.22, d = R * (1.4 + 1.6 * ((t * 0.7 + k * 0.13) % 1)); discoP(x, cx + Math.cos(an) * d, cy - 0.5 * R + Math.sin(an) * d, 3, LUZS.luz, 0.6 * pisca * (1 - ((t * 0.7 + k * 0.13) % 1))); }
    nv.total(i);
  });
};

// =============== 2. a multidão: quase cinco mil homens; "Onde compraremos pão?" ===============
CENAS.multidao = (el, c, B) => {
  const tM = B("multidao"), tC = B("cinco_mil"), tF = B("filipe");
  mostrarVersiculo("Onde compraremos pão, para estes comerem?", "João 6:5", tF + 0.1, c.fim + 0.3, { y: 400, tam: 66, destaque: ["pão,", "comerem?"] });
  const TV = telaGPU(el, c, PP_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1010, zoom: 0.92 }], [tC + 0.6, { x: 620, y: 1000, zoom: 1.0 }], [tF - 0.3, { x: 600, y: 1080, zoom: 1.0 }], [tF + 0.8, { x: 560, y: 1190, zoom: 1.3 }], [c.fim + 0.5, { x: 560, y: 1200, zoom: 1.38 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), povo = PT.ss((t - tM + 0.6) / 2.2), n5 = PT.jan(t, tC - 0.2, tF - 0.4, 0.4, 0.4), fala = PT.ss((t - tF + 0.3) / 0.6);
    let i = PP_cenario(nv, x, 0, t, cam, { povo });
    if (n5 > 0.01) { i = desenharForma(nv, PP_F.t5000, { cx: 560, cy: 520, esc: 600, cor: LUZ.ouro, borda: LUZ.luz, a: n5, brilho: 0.8, t, i0: i }); rotuloP(x, "SÓ DE HOMENS", 560, 650, 40, "255,236,200", n5, "center"); }
    // Jesus e Filipe em primeiro plano; em "Filipe" Jesus aponta a multidão e pergunta
    const [jx, jy, jk] = projP(cam, 380, 1250, 1); brilhoP(x, jx, jy, 300 * jk, LUZS.ambar, 0.18);
    personagem(x, t, poseMix(POSES.de_pe, { ...POSES.de_pe, cabeca: -0.05, braco: [[-0.25, 0.3], [1.45, 0.1]] }, fala), { tipo: "jesus", x: 380, chao: PP_CHAO, H: 560, dir: 1, cam, z: 1, fase: 3 });
    personagem(x, t, poseMix({ ...POSES.de_pe, cabeca: -0.15 }, { ...POSES.de_pe, cabeca: 0.1 }, fala), { tipo: "homem", x: 760, chao: PP_CHAO, H: 540, dir: PT.lerp(1, -1, PT.ss((t - tF + 0.5) / 0.3)) > 0 ? 1 : -1, cam, z: 1, fase: 5 });
    nv.total(i);
  });
};

// =============== 3. a conta de Filipe: nem oito meses de salário; "pensa rápido" ===============
CENAS.conta = (el, c, B) => {
  const tC = B("conta"), tO = B("oito"), tP = B("pedacinho"), tp = tempoPalavras(c), tR = tp("rápido");
  const TV = telaGPU(el, c, PP_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 560, y: 1150, zoom: 1.12 }], [tP, { x: 600, y: 1080, zoom: 0.95 }], [c.fim + 0.5, { x: 600, y: 1100, zoom: 1.0 }]]);
  const PENSA = { tronco: 0.05, cabeca: 0.22, braco: [[0.1, 0.3], [0.45, 2.45]], perna: [[-0.06, 0], [0.08, 0]] };
  TV.quadro((x, t) => {
    const cam = CAM(t), ap = PT.ss((t - tC + 0.4) / 0.6), esp = PT.ss((t - tP + 0.3) / 1.2), m8 = PT.jan(t, tO - 0.2, tR - 0.3, 0.4, 0.4), q = PT.jan(t, tR - 0.2, c.fim, 0.3, 0.4);
    let i = PP_cenario(nv, x, 0, t, cam, { povo: 1 });
    personagem(x, t, poseMix(PENSA, { ...POSES.de_pe, cabeca: -0.1 }, q), { tipo: "homem", x: 260, chao: PP_CHAO, H: 560, dir: 1, cam, z: 1, fase: 5 });
    // moedas que viram migalhas espalhadas sobre a multidão (não dá nem um pedacinho pra cada um)
    if (ap > 0.01 && esp < 0.99) { brilhoP(x, 700, 820, 260 * (1 - esp), LUZS.ambar, 0.25 * ap * (1 - esp)); i = morfo(nv, PP_F.moedas, PP_F.po, esp, { de: { cx: 700, cy: 820, esc: 330, cor: LUZ.ouro, borda: LUZ.luz, brilho: 0.9, a: ap }, para: { cx: 640, cy: 1010, esc: 1400, cor: LUZ.luz, a: 0.35 * ap, brilho: 0.5 }, t, onda: 0.3, curva: 0.5, i0: i }); }
    if (m8 > 0.01) { i = desenharForma(nv, PP_F.t8, { cx: 650, cy: 520, esc: 600, cor: LUZ.ouro, borda: LUZ.luz, a: m8, brilho: 0.8, t, i0: i }); rotuloP(x, "DE SALÁRIO", 650, 640, 40, "255,236,200", m8, "center"); }
    if (q > 0.01) { const s = FIS.chegar(t, tR - 0.2, 0.6); brilhoP(x, 680, 640, 240, LUZS.luz, 0.2 * q); i = desenharForma(nv, PP_F.q, { cx: 680, cy: 640, esc: 520 * Math.min(1.05, s), cor: LUZ.luz, borda: [1, 1, 1], a: q, brilho: 0.9, t, i0: i }); }
    nv.total(i);
  });
};

// =============== 4. o lanche: André traz o menino; cinco pães e dois peixinhos para tantos ===============
CENAS.rapaz = (el, c, B) => {
  const tR = B("rapaz"), t5 = B("cinco"), t2 = B("dois"), tT = B("tantos"), tp = tempoPalavras(c), tE = tp("está"), tCe = tp("cevada", 1);
  mostrarVersiculo("Está aqui um rapaz que tem cinco pães de cevada e dois peixinhos; mas que é isto para tantos?", "João 6:9", tE - 0.3, tCe - 0.4, { y: 360, tam: 56, destaque: ["cinco", "dois", "tantos?"] });
  const TV = telaGPU(el, c, PP_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 520, y: 1150, zoom: 1.05 }], [tT - 0.4, { x: 560, y: 1130, zoom: 1.08 }], [tT + 1.2, { x: 600, y: 1060, zoom: 0.72 }], [c.fim + 0.5, { x: 600, y: 1060, zoom: 0.7 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), chega = PT.ss((t - c.ini) / Math.max(1, tR - c.ini)), anda = 1 - PT.ss((t - tR + 0.4) / 0.4), cev = PT.jan(t, tCe - 0.3, c.fim, 0.3, 0.4);
    let i = PP_cenario(nv, x, 0, t, cam, { povo: 0.5 + 0.5 * PT.ss((t - tT + 0.6) / 1.2) });
    personagem(x, t, poseMix(POSES.de_pe, POSES.andar(t * 6, 0.8), anda), { tipo: "homem", x: PT.lerp(-80, 250, chega), chao: PP_CHAO, H: 560, dir: 1, cam, z: 1.02, fase: 5 });
    const inf = personagem(x, t, poseMix(PP_SEGURA, { ...PP_SEGURA, perna: POSES.andar(t * 6 + 1, 0.7).perna }, anda), { tipo: "crianca", x: PT.lerp(40, 470, chega), chao: PP_CHAO, H: 400, dir: 1, cam, z: 1, fase: 1 });
    personagem(x, t, { ...POSES.de_pe, cabeca: 0.15 }, { tipo: "jesus", x: 860, chao: PP_CHAO, H: 560, dir: -1, cam, z: 1.05, fase: 3 });
    const [cx, cy, R] = PP_cesto(x, inf, 400, { cheio: false, brilho: 0.25 });
    // os cinco pães e os dois peixes sobem do cesto em arco
    for (let k = 0; k < 7; k++) { const peixe = k >= 5, s = FIS.cascata(t, peixe ? t2 - 0.2 : t5 - 0.2, peixe ? k - 5 : k, 0.14, 0.6); if (s <= 0.01) { if (!peixe) objetoLinha(x, "pao", { mao: [cx + (k - 2) * 0.3 * R, cy - 0.4 * R], H: 400, k: inf.escala, d: 1, cor: [1, 0.85, 0.6], r: 0.035 }); continue; }
      const u = (k + 0.5) / 7, [ax, ay] = [cx - 260 + u * 560, 760 - 70 * Math.sin(u * Math.PI)], m = Math.min(1, s), [px, py] = [PT.lerp(cx, ax, m), PT.lerp(cy - 0.4 * R, ay, m)];
      brilhoP(x, px, py, 70, peixe ? "160,200,255" : LUZS.ambar, 0.35 * m); i = desenharForma(nv, peixe ? PP_F.peixe : PP_F.pao, { cx: px, cy: py, esc: 95 * (0.5 + 0.5 * Math.min(1.05, s)), cor: peixe ? [0.8, 0.88, 1] : [1, 0.82, 0.55], borda: [1, 0.97, 0.9], brilho: 0.9, t, i0: i }); }
    if (cev > 0.01) rotuloP(x, "cevada: o pão mais barato", 560, 600, 44, "255,236,200", cev, "center");
    nv.total(i);
  });
};

// =============== 5. o milagre: o povo senta na relva; Jesus dá graças e reparte; o pão não acaba ===============
const PP_SENT = [[90, 1.5, 1, "mulher"], [250, 1.25, 1, "homem"], [170, 2.1, 1, "crianca"], [830, 1.3, -1, "pessoa"], [990, 1.6, -1, "homem"], [700, 2.2, -1, "mulher"], [380, 2.4, 1, "pessoa"]];
CENAS.milagre = (el, c, B) => {
  const tRe = B("relva"), tG = B("gracas"), tN = B("naoacaba"), tQ = B("querem"), tp = tempoPalavras(c), tRp = tp("reparte.");
  const TV = telaGPU(el, c, PP_FUNDO), nv = TV.nuvem(90000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1080, zoom: 0.95 }], [tG - 0.2, { x: 540, y: 1150, zoom: 1.12 }], [tN, { x: 540, y: 1080, zoom: 0.95 }], [c.fim + 0.5, { x: 540, y: 1060, zoom: 0.88 }]]);
  const GRACAS = { tronco: -0.06, cabeca: -0.45, braco: [[2.3, 0.25], [2.4, 0.2]], perna: [[-0.08, 0], [0.08, 0]] }, REPARTE = { tronco: 0.06, cabeca: 0.1, braco: [[0.9, 0.5], [1.35, 0.15]], perna: [[-0.12, 0], [0.14, 0]] };
  TV.quadro((x, t) => {
    const cam = CAM(t), senta = PT.ss((t - tRe + 0.6) / 1.0), gr = PT.jan(t, tG - 0.4, tRp - 0.1, 0.4, 0.3), rep = PT.ss((t - tRp + 0.3) / 0.5), naoAcaba = PT.ss((t - tN + 0.3) / 1.0), todos = PT.ss((t - tQ + 0.4) / 1.0);
    let i = PP_cenario(nv, x, 0, t, cam, { povo: 1, sentado: senta > 0.5 ? 1 : 0, quente: 0.6 * todos });
    // o povo sentado em primeiro plano (line art)
    const pos = PP_SENT.map(([X, z, d, tipo], k) => { const inf = personagem(x, t, poseMix(POSES.de_pe, POSES.sentado, senta), { tipo, x: X, chao: PP_CHAO, H: tipo === "crianca" ? 330 : 470, dir: d, cam, z, fase: k, a: 0.85, cor: mixCor([0.85, 0.88, 1], LUZ.luz, 0.6 * todos) }); return inf.maos[1]; });
    // Jesus no meio: dá graças com os pães erguidos e reparte
    const [jx, jy, jk] = projP(cam, 540, 1200, 1.05); brilhoP(x, jx, jy, (320 + 260 * gr + 200 * naoAcaba) * jk, LUZS.ambar, 0.2 + 0.2 * gr + 0.15 * naoAcaba);
    const J = personagem(x, t, poseMix(poseMix(POSES.de_pe, GRACAS, gr), REPARTE, rep), { tipo: "jesus", x: 540, chao: PP_CHAO, H: 590, dir: 1, cam, z: 1.05, fase: 3 });
    const [hx, hy] = J.maos[1]; objetoLinha(x, "pao", { mao: [hx + 6, hy - 10], H: 590, k: J.escala, d: 1, cor: [1, 0.85, 0.6], r: 0.05 });
    if (gr > 0.01) brilhoP(x, hx, hy - 20, 160 * gr, LUZS.luz, 0.5 * gr);
    // os pães saem das mãos dele em arcos até cada pessoa (e não param)
    if (rep > 0.01) { const n = 7 + Math.round(10 * naoAcaba); for (let k = 0; k < n; k++) { const alvo = k < pos.length ? pos[k % pos.length] : projP(cam, -400 + ((k * 397) % 2000), PP_CHAO - 60, 2.5 + (k % 4)), u = ((t - tRp) * 0.55 + k * 0.137) % 1;
      const [px, py] = FIS.arco(hx, hy - 10, alvo[0], alvo[1] - 20, u, 160 + (k % 3) * 60); i = desenharForma(nv, PP_F.pao, { cx: px, cy: py, esc: 46 * (1 - 0.4 * u), cor: [1, 0.84, 0.58], borda: [1, 0.97, 0.9], brilho: 0.9, a: rep * Math.sin(Math.PI * Math.min(1, u * 1.2)), t, i0: i }); } }
    nv.total(i);
  });
};

// =============== 6. o detalhe: "Recolhei os pedaços"; doze cestos cheios ===============
CENAS.detalhe = (el, c, B) => {
  const tD = B("detalhe"), tR = B("recolhei"), t12 = B("doze"), tC = B("comeco");
  mostrarVersiculo("Recolhei os pedaços que sobejaram, para que nada se perca.", "João 6:12", tR - 0.3, c.fim + 0.3, { y: 400, tam: 64, destaque: ["recolhei", "nada"] });
  const TV = telaGPU(el, c, PP_FUNDO), nv = TV.nuvem(90000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1100, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 1080, zoom: 1.08 }]]);
  const CES = Array.from({ length: 12 }, (_, k) => [180 + (k % 4) * 240 + (Math.floor(k / 4) % 2) * 60, 1000 + Math.floor(k / 4) * 150]);
  const PED = (() => { const r = prng(153); return Array.from({ length: 160 }, () => [r() * 1080, 1360 + r() * 120, r()]); })();
  TV.quadro((x, t) => {
    const cam = CAM(t), junta = PT.ss((t - tR + 0.2) / 1.6), todos = PT.ss((t - tC + 0.4) / 0.8);
    let i = PP_cenario(nv, x, 0, t, cam, { povo: 0.6, sentado: 1, a: 0.7 });
    // os pedaços no chão voam para os cestos
    PED.forEach(([px, py, v], k) => { const alvo = CES[k % 12], u = PT.ss((junta * 1.3 - v * 0.3)); if (u > 0.98) return; const [qx, qy] = FIS.arco(px, py, alvo[0], alvo[1] - 30, u, 120); nv.ponto(i++, qx, qy, 1, 0.85, 0.6, 0.6 * (1 - u * 0.5), 5); });
    CES.forEach(([X, Y], k) => { const ap = FIS.cascata(t, t12 - 0.3, k, 0.1, 0.5); if (ap <= 0.01) return; const m = Math.min(1, ap), enche = PT.ss((t - t12 - k * 0.1) / 1.0);
      brilhoP(x, X, Y - 20, 150, LUZS.ambar, (0.15 + 0.25 * todos) * m);
      objetoLinha(x, "cesto", { mao: [X, Y + 40 * (1 - m)], H: 560, k: 1, d: 1, cor: mixCor(PP_QUENTE, LUZ.ouro, todos), a: m, r: 0.16 });
      for (let j = 0; j < 3; j++) if (enche > j / 3) i = desenharForma(nv, PP_F.pao, { cx: X + (j - 1) * 34, cy: Y - 52 - (j === 1 ? 14 : 0), esc: 60, cor: [1, 0.84, 0.58], borda: [1, 0.97, 0.9], brilho: 0.8 + 0.3 * todos, a: m, t, i0: i }); });
    // um discípulo leva o primeiro cesto
    personagem(x, t, { ...POSES.carregando, cabeca: 0.2 }, { tipo: "homem", x: 70, chao: 1500, H: 520, dir: 1, fase: 5, a: 0.9 * (1 - todos) });
    nv.total(i);
  });
};

// =============== 7. para você: o pouco, nas mãos dele, vira o bastante ===============
CENAS.sentido = (el, c, B) => {
  const tP = B("pouco2"), tM = B("maos"), tS = B("sobra");
  const tx = palcoTexto(el, [["pp-s", 360, 70, "O pouco, nas mãos dele,<br><b>vira o bastante.</b>", "lp-q", ""]]);
  const TV = telaGPU(el, c, PP_FUNDO), nv = TV.nuvem(80000);
  tl.set(tx["pp-s"], { opacity: 0 }, 0);
  tl.fromTo(tx["pp-s"], { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", immediateRender: false }, tM - 0.6);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1120, zoom: 1.1 }], [c.fim + 0.5, { x: 540, y: 1080, zoom: 1.0 }]]);
  const OFERTA = { tronco: 0.0, cabeca: -0.25, braco: [[1.6, 0.5], [1.7, 0.45]], perna: [[-0.06, 0], [0.06, 0]] };
  TV.quadro((x, t) => {
    const cam = CAM(t), luz = PT.ss((t - tM + 0.4) / 1.2), sobra = PT.ss((t - tS + 0.4) / 1.4);
    let i = PP_cenario(nv, x, 0, t, cam, { povo: 0.4, a: 0.6, quente: luz });
    const inf = personagem(x, t, poseMix(PP_SEGURA, OFERTA, PT.ss((t - tP + 0.5) / 1.0)), { tipo: "crianca", x: 430, chao: PP_CHAO, H: 560, dir: 1, cam, z: 1, fase: 1, cor: mixCor([1, 0.9, 0.7], LUZ.luz, luz) });
    const [hx, hy] = [(inf.maos[0][0] + inf.maos[1][0]) / 2, Math.min(inf.maos[0][1], inf.maos[1][1])];
    brilhoP(x, hx, hy - 30, 120 + 300 * luz, LUZS.ambar, 0.3 + 0.4 * luz);
    objetoLinha(x, "pao", { mao: [hx + 8, hy - 16], H: 560, k: inf.escala, d: 1, cor: mixCor([1, 0.85, 0.6], LUZ.luz, luz), r: 0.06 });
    // pães de luz que se multiplicam em espiral e transbordam
    const n = Math.round(40 * luz + 80 * sobra); for (let k = 0; k < n; k++) { const u = ((t - tM) * 0.25 + k * 0.0731) % 1, an = k * 2.399 + t * 0.3, d = 60 + 520 * u; const px = hx + Math.cos(an) * d, py = hy - 30 + Math.sin(an) * d * 0.75 + 260 * sobra * u * u;
      i = desenharForma(nv, k % 6 === 5 ? PP_F.peixe : PP_F.pao, { cx: px, cy: py, esc: 44 + 20 * (k % 3), rot: an * 0.2, cor: [1, 0.84, 0.58], borda: [1, 0.97, 0.9], brilho: 0.8, a: Math.min(1, luz * 2) * Math.sin(Math.PI * u) * 0.9, t, i0: i }); if (i > nv.n - 800) break; }
    nv.total(i);
  });
};

// =============== 8. pergunta (uma só) e 9. fim (emenda no começo) ===============
CENAS.pergunta = (el, c, B) => cenaPergunta(el, c, B, { texto: "Quais são os seus <b>cinco pães e dois peixinhos</b> hoje?", sub: "Escreve nos comentários", icone: "bread", seed: 155, tam: 68, alturaTexto: 300,
  de: [PP_F.pao, { cx: 540, cy: 1000, esc: 300, cor: [1, 0.84, 0.58], borda: [1, 0.97, 0.9] }] });
CENAS.fim = (el, c, B) => cartaoFinal(el, c.ini + 0.05);
