// Cenas do vídeo "Por que imprimir dinheiro deixa todo mundo mais pobre" — pontos de luz na GPU.
// Retenção: pergunta de "meio-saber" (imprimir = todo mundo rico?), analogia da ilha, assombro
// (nota de 100 trilhões, preços dobrando por dia), promessa paga no fim (o Brasil) e dica prática.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const VERDE = "120,235,170", OURO = "255,210,63", CINZA = "170,178,195";
const estF = (seed) => ambienteP(260, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.7);
// chuva de cédulas (posições fixas por índice; t move)
const CHUVA = (() => { const r = prng(8), o = []; for (let i = 0; i < 70; i++) o.push({ x: r() * 1080, v: 120 + r() * 160, f: r(), s: 0.6 + r() * 0.6, g: (r() - 0.5) * 2 }); return o; })();
function chuvaNotas(x, t, t0, a, cor = VERDE) {
  if (a <= 0.01) return;
  for (const n of CHUVA) { const y = ((t - t0) * n.v + n.f * 1500) % 1500 + 300; fNota(x, n.x + Math.sin(t * 0.8 + n.f * 9) * 30, y, 110 * n.s, cor, a * 0.85 * PT.cl((y - 300) / 120) * PT.cl((1420 - y) / 120), "", n.g * 0.5 + Math.sin(t + n.f * 6) * 0.3); }
}
// coco (círculo marrom com brilho verde)
function coco(x, cx, cy, r, a) { if (a <= 0.01) return; brilhoP(x, cx, cy, r * 2, "150,220,120", 0.25 * a); discoP(x, cx, cy, r, "150,105,60", 0.8 * a); anelP(x, cx, cy, r, "200,240,150", 0.7 * a, 3); discoP(x, cx - r * 0.3, cy - r * 0.3, r * 0.25, "230,255,200", 0.5 * a); }
// ilha de pontos (areia + mar) na GPU
const ILHA = (() => { const r = prng(12), o = []; for (let i = 0; i < 16000; i++) { const a = r() * 6.283, d = Math.sqrt(r()); const areia = d < 0.78; o.push({ x: Math.cos(a) * d * 560, y: Math.sin(a) * d * 120, areia, n: r() }); } return o; })();
function desenharIlha(nv, cx, cy, t, a) { let i = nv.k; for (const p of ILHA) { const c = p.areia ? [1.0, 0.82, 0.5] : [0.3, 0.65, 1.0]; nv.ponto(i++, cx + p.x + (p.areia ? 0 : Math.sin(t * 1.2 + p.n * 9) * 6), cy + p.y, c[0], c[1], c[2], a * (p.areia ? 0.35 + 0.25 * p.n : 0.25 + 0.3 * Math.sin(t * 2 + p.n * 12)), 3); } nv.total(i); }
function palmeira(x, bx, by, h, t, a) { if (a <= 0.01) return; for (let k = 0; k <= 20; k++) { const u = k / 20; discoP(x, bx + Math.sin(u * 1.5) * 40, by - u * h, 9 - 4 * u, "180,130,80", 0.7 * a); } const tx = bx + Math.sin(1.5) * 40, ty = by - h; for (let f = 0; f < 6; f++) { const ang = -Math.PI / 2 + (f - 2.5) * 0.55 + Math.sin(t + f) * 0.05; x.beginPath(); x.moveTo(tx, ty); x.quadraticCurveTo(tx + Math.cos(ang) * 90, ty + Math.sin(ang) * 90 - 20, tx + Math.cos(ang) * 170, ty + Math.sin(ang) * 170 + 60); x.strokeStyle = `rgba(110,230,140,${0.75 * a})`; x.lineWidth = 7; x.stroke(); } }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tVa = B("vazio"), tR = B("rico"), tC = B("contrario"), tN = B("nota"), tL = B("lembra");
  mostrarGancho(tVa + 0.8);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["con", 330, 92, "o contrário", "pt-ve"], ["qual", 330, 80, "qual país?", "pt-am"]]);
  MD.slam(tl, tx.con, tC - 0.05, { from: 1.35 }); MD.leave(tl, tx.con, tN - 0.5); MD.slam(tl, tx.qual, tL - 1.2, { from: 1.3 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // o carrinho do mercado esvaziando
    const aCa = 1 - PT.ss((t - tR + 0.8) / 0.6);
    if (aCa > 0.01) { const itens = Math.round(PT.lerp(12, 3, PT.ss((t - 1.0) / Math.max(0.5, tVa - 0.6)))); x.strokeStyle = `rgba(200,210,230,${aCa})`; x.lineWidth = 7; x.beginPath(); x.moveTo(250, 760); x.lineTo(320, 760); x.lineTo(380, 1100); x.lineTo(820, 1100); x.lineTo(870, 860); x.lineTo(340, 860); x.stroke(); anelP(x, 420, 1170, 34, "200,210,230", aCa, 7); anelP(x, 780, 1170, 34, "200,210,230", aCa, 7); for (let k = 0; k < 12; k++) { const on = k < itens; fCaixa(x, 420 + (k % 6) * 72, 1060 - Math.floor(k / 6) * 80 - 40, 60, 66, 10, on ? "255,190,120" : "120,128,150", aCa * (on ? 1 : 0.15), 3, on ? 0.25 : 0.03); } if (t > tVa - 0.4) rotuloP(x, "mesmo dinheiro", 560, 1260, 40, "255,150,160", aCa * PT.ss((t - tVa + 0.4) / 0.4)); }
    const cinza = PT.ss((t - tC + 0.2) / 0.8), aCh = PT.ss((t - tR + 0.6) / 0.6) * (1 - PT.ss((t - tN + 0.6) / 0.6));
    chuvaNotas(x, t, 0, aCh, cinza > 0 ? `${Math.round(120 + 50 * cinza)},${Math.round(235 - 57 * cinza)},${Math.round(170 + 25 * cinza)}` : VERDE);
    // a nota de cem trilhões
    const aN = PT.jan(t, tN - 0.5, tL - 1.3, 0.5, 0.5);
    if (aN > 0) { const s = PT.out((t - tN + 0.5) / 0.7); fNota(x, 540, 900, 760 * (0.6 + 0.4 * s), VERDE, aN); rotuloP(x, "100.000.000.000.000", 540, 900, 64, "200,255,220", aN); rotuloP(x, "dólares do Zimbábue", 540, 1140, 36, "180,240,200", aN); }
    // ponto de interrogação sobre o mapa
    const aQ = PT.ss((t - tL + 1.2) / 0.6);
    if (aQ > 0) { for (let k = 0; k < 7; k++) fPessoa(x, 230 + k * 105, 1050 + Math.sin(t * 2 + k) * 4, 1.4, k % 2 ? "143,227,255" : "255,226,140", aQ); rotuloP(x, "?", 540, 820, 220, "255,210,63", aQ * (0.7 + 0.3 * Math.sin(t * 3))); }
  });
};

// =============== 2. a ilha dos cocos ===============
CENAS.ilha = (el, c, B) => {
  const tC = B("cocos"), tF = B("fichas"), tI = B("imprime"), tD = B("dobro"), tDu = B("duas"), tDo = B("dobrou");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["l1", 330, 58, "10 pessoas · 10 cocos · 10 fichas", "pt-ci"], ["dob", 330, 76, "o dobro de fichas", "pt-am"], ["pre", 330, 92, "o preço dobrou", "pt-ve"]]);
  MD.arrive(tl, tx.l1, tF - 0.2, { y: 14 }); MD.leave(tl, tx.l1, tD - 0.4); MD.slam(tl, tx.dob, tD - 0.05, { from: 1.3 }); MD.leave(tl, tx.dob, tDo - 0.4); MD.slam(tl, tx.pre, tDo - 0.05, { from: 1.4 });
  const nv = T.nuvem(17000), est = estF(5);
  T.quadro((x, t) => {
    estD(x, est, t);
    desenharIlha(nv, 540, 1300, t, PT.ss((t - c.ini) / 0.8));
    palmeira(x, 130, 1290, 380, t, PT.ss((t - c.ini) / 0.8)); palmeira(x, 960, 1300, 330, t + 1, PT.ss((t - c.ini) / 0.8));
    const aC = PT.ss((t - tC + 0.2) / 0.6), aF = PT.ss((t - tF + 0.2) / 0.6), aI = PT.ss((t - tI) / 1.2), aP = PT.ss((t - tDu + 0.2) / 0.5);
    for (let k = 0; k < 10; k++) {
      const cx = 135 + k * 90;
      coco(x, cx, 620 + Math.sin(t * 1.5 + k) * 3, 30, aC * PT.ss((t - tC + 0.2 - k * 0.05) / 0.4));
      // preço do coco
      if (aC > 0.5) rotuloP(x, aP > 0.5 ? "2" : "1", cx, 680, 30, aP > 0.5 ? "255,120,140" : "255,226,140", aC * (aP > 0.5 ? 1 : 0.8));
      fPessoa(x, cx, 1180, 1.1, "143,227,255", PT.ss((t - c.ini - 0.4 - k * 0.04) / 0.5));
      // fichas na mão de cada um (1 → 2)
      fMoeda(x, cx, 1060, 20, aF * PT.ss((t - tF + 0.2 - k * 0.04) / 0.4));
      const q = PT.ss((t - tI - k * 0.08) / 0.7); if (aI > 0 && q > 0) fMoeda(x, cx, PT.lerp(330, 1015, PT.out(q)), 20, q);
    }
    if (aP > 0) { brilhoP(x, 540, 640, 500, "255,90,110", 0.12 * aP); rotuloP(x, "2 fichas por coco!", 540, 740, 40, "255,200,210", aP); }
  });
};

// =============== 3. inflação: a fila do dinheiro novo ===============
CENAS.inflacao = (el, c, B) => {
  const tI = B("inflacao"), tC = B("compra"), tR = B("rapido"), tM = B("menos"), tP = B("primeiro"), tU = B("ultimo");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["inf", 330, 104, "INFLAÇÃO", "pt-ve"], ["val", 440, 48, "vale pelo que compra", "pt-fino"], ["fila", 330, 62, "quem pega primeiro ganha", "pt-am"], ["ult", 330, 66, "o último paga a conta", "pt-ve"]]);
  MD.slam(tl, tx.inf, tI - 0.05, { from: 1.5 }); MD.arrive(tl, tx.val, tC - 0.3, { y: 14 }); MD.leave(tl, [tx.inf, tx.val], tP - 0.4);
  MD.slam(tl, tx.fila, tP - 0.05, { from: 1.25 }); MD.leave(tl, tx.fila, tU - 0.35); MD.slam(tl, tx.ult, tU - 0.05, { from: 1.3 });
  const est = estF(7);
  T.quadro((x, t) => {
    estD(x, est, t);
    // parte 1: uma nota e a cesta de compras que ela compra (vai ficando menor)
    const a1 = PT.jan(t, c.ini, tP - 0.3, 0.5, 0.5);
    if (a1 > 0) {
      fNota(x, 300, 860, 300, VERDE, a1, "R$ 100");
      const itens = Math.round(PT.lerp(12, 5, PT.ss((t - tR) / (tM - tR + 0.5))));
      fSeta(x, 470, 860, 580, 860, "255,255,255", a1 * 0.8, 5);
      for (let k = 0; k < 12; k++) { const col = k % 4, lin = Math.floor(k / 4), on = k < itens; fCaixa(x, 680 + col * 90, 760 + lin * 100, 70, 70, 12, on ? "255,190,120" : "120,128,150", a1 * (on ? 1 : 0.25), 3, on ? 0.2 : 0.05); }
      // notas se multiplicando (o dinheiro cresce mais rápido)
      const aR = PT.ss((t - tR + 0.2) / 0.6) * a1; if (aR > 0) for (let k = 0; k < 6; k++) fNota(x, 160 + k * 40, 1110 + (k % 2) * 30, 200, VERDE, aR * PT.ss((t - tR - k * 0.25) / 0.4), "", -0.1 + k * 0.05);
    }
    // parte 2: a fila; o dinheiro novo entra pela frente e o preço sobe enquanto anda
    const a2 = PT.ss((t - tP + 0.4) / 0.6);
    if (a2 > 0) {
      const preco = PT.cl((t - tP) / (tU - tP + 1.5));
      for (let k = 0; k < 8; k++) { const px = 140 + k * 115, chegou = PT.ss(((t - tP) * 2.2 - k) / 0.6); fPessoa(x, px, 1150, 1.3, k === 0 ? "120,255,190" : k === 7 ? "255,120,140" : "143,227,255", a2); if (chegou > 0) fMoeda(x, px, 1030, 16, a2 * chegou); }
      // termômetro de preço por cima da fila
      linhaP(x, 140, 900, 945, 900, "255,255,255", 0.25 * a2, 8); linhaP(x, 140, 900, PT.lerp(140, 945, preco), 900, "255,120,110", a2, 8);
      rotuloP(x, "PREÇOS", 140, 860, 30, "255,200,190", a2, "left");
      rotuloP(x, "1º: compra barato", 140, 1260, 30, "150,255,200", a2, "left");
      const aU = PT.ss((t - tU + 0.2) / 0.5); if (aU > 0) { rotuloP(x, "último: compra caro", 945, 1300, 30, "255,150,160", aU, "right"); brilhoP(x, 945, 1150, 120, "255,80,100", 0.4 * aU); }
    }
  });
};

// =============== 4. fora de controle ===============
CENAS.descontrole = (el, c, B) => {
  const tA = B("alemanha"), tD = B("dobravam"), tC = B("carrinho"), tZ = B("zimbabue"), tDi = B("dia"), tP = B("pao");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ale", 330, 70, "Alemanha, 1923", "pt-ci"], ["d1", 430, 50, "preço x2 a cada 3–4 dias", "pt-fino"], ["zim", 330, 70, "Zimbábue, 2008", "pt-am"], ["d2", 430, 50, "preço x2 todo dia", "pt-fino"], ["pao", 330, 64, "100 trilhões = 1 pão", "pt-ve"]]);
  MD.arrive(tl, tx.ale, tA - 0.1, { y: 14 }); MD.arrive(tl, tx.d1, tD, { y: 14 }); MD.leave(tl, [tx.ale, tx.d1], tZ - 0.4);
  MD.arrive(tl, tx.zim, tZ - 0.1, { y: 14 }); MD.arrive(tl, tx.d2, tDi - 0.3, { y: 14 }); MD.leave(tl, [tx.zim, tx.d2], tP - 0.5); MD.slam(tl, tx.pao, tP - 0.1, { from: 1.35 });
  const est = estF(9);
  // curva exponencial (preço)
  const curva = (k0, b) => Array.from({ length: 80 }, (_, i) => { const u = i / 79; return [140 + u * 800, 1260 - Math.min(700, 8 * Math.pow(b, u * 10))]; });
  const C1 = curva(0, 1.55), C2 = curva(0, 2.0);
  T.quadro((x, t) => {
    estD(x, est, t);
    const aG = 1 - PT.ss((t - tP + 0.6) / 0.5);
    if (aG > 0) {
      linhaP(x, 140, 1260, 950, 1260, "255,255,255", 0.35 * aG, 3); linhaP(x, 140, 1260, 140, 540, "255,255,255", 0.35 * aG, 3);
      rotuloP(x, "preço", 150, 525, 28, "255,255,255", 0.6 * aG, "left"); rotuloP(x, "tempo →", 945, 1300, 28, "255,255,255", 0.6 * aG, "right");
      fLinhaPts(x, C1, PT.ss((t - tD + 0.3) / 2.5), "143,227,255", aG * (1 - 0.6 * PT.ss((t - tZ) / 0.6)), 6);
      fLinhaPts(x, C2, PT.ss((t - tDi + 0.5) / 1.8), "255,150,90", aG, 7);
    }
    // carrinho de mão cheio de notas
    const aC = PT.jan(t, tC - 0.3, tZ, 0.4, 0.5);
    if (aC > 0) { const bx = 700, by = 1150; x.strokeStyle = `rgba(200,210,230,${aC})`; x.lineWidth = 6; x.beginPath(); x.moveTo(bx - 180, by - 40); x.lineTo(bx + 120, by - 40); x.lineTo(bx + 80, by + 40); x.lineTo(bx - 140, by + 40); x.closePath(); x.stroke(); anelP(x, bx + 110, by + 70, 34, "200,210,230", aC, 6); linhaP(x, bx - 180, by - 40, bx - 300, by + 20, "200,210,230", aC, 6); for (let k = 0; k < 9; k++) fNota(x, bx - 130 + (k % 4) * 70, by - 70 - Math.floor(k / 4) * 32, 120, VERDE, aC, "", (k % 3 - 1) * 0.15); }
    // nota gigante x pão
    const aP = PT.ss((t - tP + 0.4) / 0.6);
    if (aP > 0) { fNota(x, 340, 900, 420, VERDE, aP); rotuloP(x, "100 trilhões", 340, 900, 44, "200,255,220", aP); rotuloP(x, "=", 600, 900, 90, "255,255,255", aP); x.beginPath(); x.ellipse(800, 900, 150, 80, 0, 0, 6.283); x.fillStyle = `rgba(230,170,90,${0.5 * aP})`; x.fill(); x.strokeStyle = `rgba(255,220,150,${aP})`; x.lineWidth = 5; x.stroke(); for (let k = -1; k <= 1; k++) linhaP(x, 800 + k * 60 - 25, 860, 800 + k * 60 + 25, 840, "255,230,180", aP, 5); brilhoP(x, 800, 900, 200, "255,190,100", 0.3 * aP); }
  });
};

// =============== 5. e o Brasil? ===============
const BR_PLANO = (() => { const o = []; for (let k = 0; k < GLOBO_BRASIL.length; k += 2) o.push([GLOBO_BRASIL[k] / 10, GLOBO_BRASIL[k + 1] / 10]); return o; })();
CENAS.brasil = (el, c, B) => {
  const tB = B("brasil"), tD = B("doismil"), tN = B("novo"), tR = B("remarcar"), tP = B("pagamento"), tRe = B("real"), tG = B("gaveta"), tDi = B("dica");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["br", 330, 100, "BRASIL", "pt-am"], ["mil", 330, 82, "+2.000% num ano", "pt-ve"], ["real", 330, 82, "Plano Real, 1994", "pt-ci"], ["dica", 330, 58, "guarde onde renda ≥ inflação", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.br, tB - 0.05, { from: 1.4 }); MD.leave(tl, tx.br, tD - 0.4); MD.slam(tl, tx.mil, tD - 0.05, { from: 1.35 }); MD.leave(tl, tx.mil, tRe - 0.4); MD.slam(tl, tx.real, tRe - 0.05, { from: 1.3 }); MD.leave(tl, tx.real, tDi - 1.6); MD.slam(tl, tx.dica, tDi - 1.3, { from: 1.25 });
  const nv = T.nuvem(BR_PLANO.length * 2 + 10), est = estF(11);
  T.quadro((x, t) => {
    estD(x, est, t);
    // mapa do Brasil em pontos
    const aM = PT.jan(t, c.ini, tR - 0.2, 0.6, 0.5); let i = nv.k;
    if (aM > 0) for (const [la, lo] of BR_PLANO) { const px = 540 + (lo + 52) * 19, py = 900 - (la + 14) * 19, q = PT.ss((t - tD + 0.2) / 1); const cc = mixC([1, 0.82, 0.35], [1, 0.35, 0.3], q); nv.ponto(i++, px, py, cc[0], cc[1], cc[2], aM, 6); }
    nv.total(i);
    // etiqueta de preço sendo remarcada sem parar
    const aR = PT.jan(t, tR - 0.3, tRe - 0.2, 0.4, 0.5);
    if (aR > 0) { const v = Math.floor(1000 * Math.pow(1.6, (t - tR + 0.3) * 3)); fCaixa(x, 540, 880, 560, 260, 30, "255,210,63", aR, 6, 0.03); rotuloP(x, "Cr$ " + v.toLocaleString("pt-BR"), 540, 880, 66, "255,236,170", aR); rotuloP(x, "remarcado de novo", 540, 1060, 32, "255,200,160", aR * (0.6 + 0.4 * Math.sin(t * 10))); if (t > tP - 0.3) rotuloP(x, "dia do pagamento: gaste já!", 540, 1150, 36, "150,255,200", aR * PT.ss((t - tP + 0.3) / 0.4)); }
    // a moeda do Real
    const aRe = PT.jan(t, tRe - 0.3, tG - 0.3, 0.5, 0.4); if (aRe > 0) { const rr = 170 * PT.out((t - tRe + 0.3) / 0.6); brilhoP(x, 540, 880, rr * 1.8, "255,210,63", 0.3 * aRe); anelP(x, 540, 880, rr, "255,226,140", aRe, 10); anelP(x, 540, 880, rr * 0.82, "255,226,140", 0.5 * aRe, 4); rotuloP(x, "R$", 540, 880, 110, "255,226,140", aRe); }
    // a gaveta com notas que vão perdendo a cor
    const aG = PT.ss((t - tG + 0.3) / 0.5);
    if (aG > 0) { const desb = PT.ss((t - tG) / 2.5); fCaixa(x, 540, 980, 600, 300, 20, "200,210,230", aG, 6, 0.08); linhaP(x, 470, 980, 610, 980, "200,210,230", aG, 8); for (let k = 0; k < 5; k++) fNota(x, 380 + k * 80, 900, 220, desb > 0 ? `${Math.round(120 + 50 * desb)},${Math.round(235 - 57 * desb)},${Math.round(170 + 25 * desb)}` : VERDE, aG * (1 - 0.5 * desb), "", (k - 2) * 0.08); rotuloP(x, "perde valor", 540, 1190, 36, "255,150,160", aG * desb); }
  });
};

// =============== 6. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["dinheiro vale pelo que compra", "imprimir não cria coisas", "os preços sobem", "quem vive de salário perde"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    chuvaNotas(x, t, 0, 0.25 * sai);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) fMoeda(x, 160, Y[k], 18, a); });
  });
  cartaoFinal(el, tC + 1.4);
};
