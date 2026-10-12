// Cenas do vídeo "O que significa Emanuel" — Luz da Palavra, pontos de luz na GPU + personagens do kit.
// Retenção: quadro 0 = alguém sozinho numa pedra sob um céu enorme e UMA estrela forte; gancho emocional
// ("pra quem se sentiu sozinho"); laço aberto (o nome aparece de novo no fim do mesmo livro) pago em
// Mateus 28:20; José decide ir embora → sonho, o anjo ("não temas") → apoio (seguir + amém) → EMANUEL →
// hebraico (imanu = conosco, El = Deus) → a estrela desce até a manjedoura → o livro que abre e fecha com
// a mesma promessa → pergunta única.
// Fontes: Mateus 1:18–23 (José, o sonho, Emanuel); Isaías 7:14; Mateus 28:20. Personagens pesquisados:
// José (túnica ocre, manto escuro esverdeado, barba: iconografia tradicional), anjo (veste branca, Mt 28:3;
// asas da arte tradicional), Maria (véu azul) — fichas em identidade/kit/2-elenco.js.

const EM_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.82) };
const EM_EST = fundoProfundo(231, 900);
const EM_CASA = { desenho: (g, R) => { // casa de teto plano, com porta e janela (vazias)
  const r = (x0, y0, x1, y1) => g.fillRect(R * x0, R * y0, R * (x1 - x0), R * (y1 - y0));
  r(0.12, 0.34, 0.88, 0.9); r(0.08, 0.3, 0.92, 0.36); r(0.6, 0.18, 0.86, 0.32);
  g.globalCompositeOperation = "destination-out"; r(0.22, 0.56, 0.38, 0.9); r(0.58, 0.48, 0.74, 0.64); g.globalCompositeOperation = "source-over";
} };
const EM_ESTABULO = { desenho: (g, R) => { // estábulo: dois postes, teto inclinado de palha, parede do fundo em tábuas
  g.strokeStyle = "#fff"; g.lineCap = "round"; const L = (w, ...p) => { g.lineWidth = R * w; g.beginPath(); g.moveTo(R * p[0], R * p[1]); for (let k = 2; k < p.length; k += 2) g.lineTo(R * p[k], R * p[k + 1]); g.stroke(); };
  L(0.035, 0.14, 0.95, 0.14, 0.3); L(0.035, 0.86, 0.95, 0.86, 0.36); L(0.05, 0.04, 0.34, 0.5, 0.12, 0.96, 0.4);
  for (let k = 0; k < 7; k++) L(0.012, 0.2 + k * 0.1, 0.33 - 0.03 * Math.abs(k - 3) + 0.0, 0.2 + k * 0.1, 0.95);
} };
const EM_F = {
  estrela: formaPontos("star-four", 9000), casa: formaPontos(EM_CASA, 5000, { espessura: 0.08 }), estabulo: formaPontos(EM_ESTABULO, 10000, { espessura: 0.06 }),
  emanuel: formaTexto("EMANUEL", 12000, { fonte: "Cinzel", peso: 700, tam: 0.24 }), hebr: formaTexto("עִמָּנוּ אֵל", 12000, { fonte: "serif", peso: 700, tam: 0.3 }),
  deus: formaTexto("DEUS CONOSCO", 12000, { fonte: "Cinzel", peso: 700, tam: 0.16 }), livro: formaPontos("book-open", 12000), poeira: poeiraForma(9000, 233, 0.5),
};
// céu estrelado (estrelas que cintilam + faixa da Via Láctea) e chão de dunas em pontos — sempre iguais (prng)
const EM_CEU = (() => { const r = prng(229), P = []; for (let k = 0; k < 2200; k++) { const via = k < 900, u = r();
  const x = via ? -100 + u * 1300 : r() * 1300 - 110, y = via ? 160 + u * 700 + (r() - 0.5) * 260 * (0.6 + r()) : r() * 1400 - 60; P.push([540 + (x - 540) * 2.6, 960 + (y - 960) * 2.6, r(), r(), via]); } return P; })();
const EM_CHAO = (() => { const r = prng(235), P = []; for (let k = 0; k < 4200; k++) { const lin = Math.floor(r() * 6), x = r() * 1700 - 310; P.push([x, lin, r(), r()]); } return P; })();
function EM_ceu(nv, x, i, t, cam, a = 1, chao = 1380) {
  i = desenharFundo(nv, EM_EST, t, cam, LUZ.luz, 0.8 * a, i);
  brilhoP(x, 540, chao + 60, 1000, LUZS.ambar, 0.1 * a); brilhoP(x, 300, 500, 800, "70,80,170", 0.1 * a);
  for (const [X, Y, v, s, via] of EM_CEU) { const [px, py, k] = projP(cam, X, Y, 2.6); if (py > chao + 40) continue; const tw = 0.55 + 0.45 * Math.sin(t * (0.8 + 2 * v) + s * 40);
    const c2 = s < 0.15 ? LUZ.ambar : s < 0.3 ? [0.75, 0.82, 1] : LUZ.luz;
    nv.ponto(i++, px, py, c2[0], c2[1], c2[2], a * (via ? 0.3 + 0.35 * v : 0.45 + 0.55 * v) * tw, via ? 2 + 2 * s : 2.2 + 4.5 * v * v * v); }
  // dunas: linhas de crista mais claras na frente
  for (const [X, lin, v, s] of EM_CHAO) { const Y = chao + lin * 60 + Math.sin(X * 0.0035 + lin * 1.7) * 38 + v * v * 60, z = 1.5 - lin * 0.1, [px, py, k] = projP(cam, X, Y, z);
    nv.ponto(i++, px, py, 0.85, 0.7, 0.55, a * (0.1 + 0.28 * s) * (0.55 + lin * 0.1) * (v < 0.15 ? 2.2 : 1), (1.8 + 2.4 * s) * k); }
  return i;
}
// pedra sob quem está sentado: mede o quadril do personagem e põe a pedra ali
function EM_sentado(nv, x, i, t, pose, op, seed = 7) {
  const m = figura(x, t, pose, { ...op, medir: true }), [qx, qy] = m.quadril, k = m.escala * op.H / 520, r = prng(seed);
  const chaoT = qy + 0.2 * op.H * m.escala; // a pedra vai do quadril até o chão
  for (let n = 0; n < 2600; n++) { const u = r() * 2 - 1, v = r(), topo = qy + 6 * k + 26 * k * u * u, px = qx + u * 150 * k + (op.dir || 1) * 30 * k, py = topo + v * (chaoT - topo), borda = v < 0.06 || Math.abs(u) > 0.94;
    nv.ponto(i++, px, py, 0.8, 0.7, 0.6, (borda ? 0.55 : 0.12 + 0.22 * r()) * (1 - 0.4 * v), (2 + 2.5 * r()) * m.escala); }
  brilhoP(x, qx, qy + 60 * k, 160 * k, LUZS.ambar, 0.08);
  figura(x, t, pose, op); return i;
}
// estrela forte com raios (posição em tela)
function EM_estrela(nv, x, i, t, sx, sy, esc, a, bri = 1) {
  brilhoP(x, sx, sy, esc * 2.2, LUZS.ambar, 0.22 * a * bri); brilhoP(x, sx, sy, esc * 0.9, LUZS.luz, 0.35 * a * bri);
  for (let r = 0; r < 12; r++) { const an = r * Math.PI / 6 + t * 0.05, L = esc * (1.4 + 0.6 * Math.sin(t * 1.3 + r)) * bri; linhaP(x, sx, sy, sx + Math.cos(an) * L, sy + Math.sin(an) * L, LUZS.ouro, 0.06 * a, 3); }
  return desenharForma(nv, EM_F.estrela, { cx: sx, cy: sy, esc, cor: LUZ.ouro, borda: LUZ.luz, brilho: 1.1 * bri, a, giro: 0.05 * Math.sin(t), t, i0: i });
}
const EM_PEDRA = (cx, cy, w, h, seed) => { const r = prng(seed), P = []; for (let k = 0; k < 900; k++) { const an = r() * Math.PI, d = Math.sqrt(r()); P.push([cx + Math.cos(an) * w * d, cy - Math.sin(an) * h * d, r()]); } return P; };
function EM_pedra(nv, i, cam, P, a = 1) { for (const [X, Y, s] of P) { const [px, py, k] = projP(cam, X, Y, 1); nv.ponto(i++, px, py, 0.72, 0.64, 0.58, a * (0.12 + 0.2 * s), (2 + 2 * s) * k); } return i; }

// =============== 1. abertura: alguém sozinho sob o céu enorme; UMA estrela forte ===============
CENAS.abertura = (el, c, B) => {
  const tS = B("sozinho"), tN = B("nome"), tF = B("fim");
  mostrarGancho(tN - 0.3);
  const TV = telaGPU(el, c, EM_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[0, { x: 540, y: 880, zoom: 1.18 }], [tN, { x: 540, y: 960, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 990, zoom: 1.06 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), bri = 1 + 0.5 * PT.jan(t, tN - 0.2, tN + 1.6, 0.3, 0.8), dois = PT.ss((t - tF + 0.2) / 1.2);
    let i = EM_ceu(nv, x, 0, t, cam);
    // a estrela: no "fim" uma segunda luz se acende longe (o começo e o fim do livro)
    const [sx, sy, sk] = projP(cam, 540 - 140 * dois, 520, 1.6);
    i = EM_estrela(nv, x, i, t, sx, sy, 150 * sk, 1, bri);
    if (dois > 0.01) { const [s2x, s2y, s2k] = projP(cam, 760, 470, 1.6); i = EM_estrela(nv, x, i, t, s2x, s2y, 100 * s2k * dois, dois, 0.8); linhaP(x, sx, sy, s2x, s2y, LUZS.ouro, 0.12 * dois, 2); }
    // alguém sentado sozinho na pedra, cabeça baixa; levanta o rosto quando a estrela brilha
    const olha = PT.ss((t - tN + 0.4) / 1.2);
    i = EM_sentado(nv, x, i, t, { ...POSES.sentado, tronco: 0.22 - 0.2 * olha, cabeca: 0.5 - 0.85 * olha, braco: [[0.15, 1.15], [0.25, 1.2]] }, { ficha: elencoVariado(141, "homem"), x: 600, chao: 1470, H: 540, dir: -1, cam, z: 1, fase: 1, expr: olha > 0.5 ? "neutro" : "triste" }, 237);
    nv.total(i);
  });
};

// =============== 2. José: a noite na vila; ele decide ir embora em segredo ===============
CENAS.jose = (el, c, B) => {
  const tJ = B("jose"), tG = B("gravida"), tS = B("segredo");
  const TV = telaGPU(el, c, EM_FUNDO), nv = TV.nuvem(80000);
  const CASAS = [[230, 1250, 1.25, 330], [470, 1225, 1.5, 260], [820, 1240, 1.3, 300], [980, 1215, 1.7, 240]];
  const CAM = cameraProf([[c.ini, { x: 500, y: 980, zoom: 1.1 }], [tS - 0.5, { x: 540, y: 990, zoom: 1.0 }], [c.fim + 0.5, { x: 640, y: 990, zoom: 1.08 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t);
    let i = EM_ceu(nv, x, 0, t, cam, 1, 1330);
    CASAS.forEach(([X, Y, z, w], k) => { const [px, py, pk] = projP(cam, X, Y, z); i = desenharForma(nv, EM_F.casa, { cx: px, cy: py, esc: w * pk, cor: [0.85, 0.75, 0.62], brilho: 0.6, a: 0.75, t, i0: i }); });
    // janela acesa da casa de Maria (a da esquerda), com Maria na porta quando ele lembra que ela está grávida
    const [wx, wy, wk] = projP(cam, 230 + 0.16 * 330, 1250 + 0.06 * 330 - 0.5 * 330 + 0.06 * 330, 1.25);
    brilhoP(x, wx, wy, 70 * wk, LUZS.ambar, 0.55);
    const aM = PT.ss((t - tG + 0.3) / 0.8);
    if (aM > 0.01) figura(x, t, { ...POSES.de_pe, braco: [[-0.1, 0.4], [0.3, 1.3]] }, { tipo: "maria", x: 196, chao: 1418, H: 300, dir: 1, cam, z: 1.25, a: aM, fase: 3, expr: "triste" });
    // José: parado olhando a casa; no "segredo" vira e vai embora devagar, cabeça baixa
    const vai = PT.ss((t - tS + 0.6) / 0.8), passo = Math.max(0, t - tS + 0.2);
    const pose = vai > 0.5 ? { ...POSES.andar(passo * 4.2, 0.8), cabeca: 0.35, tronco: 0.06 } : { ...POSES.de_pe, cabeca: 0.25 - 0.1 * PT.ss((t - tG) / 0.8), braco: [[-0.1, 0.3], [0.15, 0.4]] };
    figura(x, t, pose, { tipo: "jose", x: 640 + passo * 55, chao: 1450, H: 560, dir: vai > 0.5 ? 1 : -1, cam, z: 1, fase: 2, expr: "triste" });
    nv.total(i);
  });
};

// =============== 3. o sonho: José dorme encostado na pedra; o anjo aparece ("não temas") ===============
CENAS.sonho = (el, c, B) => {
  const tS = B("sonho"), tA = B("anjo"), tT = B("temas"), tN = B("nome2");
  const TV = telaGPU(el, c, EM_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 400, y: 1080, zoom: 1.25 }], [tA - 0.3, { x: 470, y: 1030, zoom: 1.1 }], [c.fim + 0.5, { x: 540, y: 980, zoom: 1.0 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), so = PT.ss((t - tS + 0.4) / 1.0), aA = PT.ss((t - tA + 0.3) / 1.0), abre = PT.ss((t - tA) / 1.4), fala = PT.ss((t - tT + 0.5) / 0.6), nm = PT.ss((t - tN + 0.2) / 0.9);
    let i = EM_ceu(nv, x, 0, t, cam, 1 - 0.3 * so);
    // sonho: halo azulado e bokeh em volta
    if (so > 0.01) { const [hx, hy, hk] = projP(cam, 560, 1100, 1); brilhoP(x, hx, hy, 700 * hk, "120,140,255", 0.12 * so); }
    i = EM_sentado(nv, x, i, t, { ...POSES.sentado, tronco: 0.2, cabeca: 0.55, braco: [[0.1, 1.15], [0.2, 1.2]] }, { tipo: "jose", x: 300, chao: 1450, H: 520, dir: 1, cam, z: 1, fase: 2, expr: "dorme" }, 239);
    // o anjo de luz: aparece, abre as asas; no "não temas" estende a mão
    if (aA > 0.01) { const [ax, ay, ak] = projP(cam, 680, 1050, 1); brilhoP(x, ax, ay, 420 * ak * aA, LUZS.luz, 0.3 * aA); brilhoP(x, ax, ay - 200 * ak, 300 * ak, LUZS.ambar, 0.2 * aA);
      for (let r = 0; r < 14; r++) { const an = -Math.PI / 2 + (r - 6.5) * 0.22, L = (300 + 260 * abre) * ak; linhaP(x, ax, ay - 260 * ak, ax + Math.cos(an) * L, ay - 260 * ak + Math.sin(an) * L, LUZS.ouro, 0.05 * aA, 3); }
      figura(x, t, poseMix({ ...POSES.de_pe, cabeca: 0.1 }, { ...POSES.entregando, braco: [[-0.2, 0.3], [1.35, 0.15]], cabeca: 0.15 }, fala), { tipo: "anjo", x: 700, chao: 1450 - 30 * Math.sin(t * 1.2) - 40 * (1 - aA), H: 600, dir: -1, cam, z: 1, a: aA, fase: 4, asas: 0.3 + 0.7 * abre, expr: "sorri" }); }
    // o nome que muda tudo: um "?" de luz entre os dois
    if (nm > 0.01) { const [qx, qy, qk] = projP(cam, 590, 760, 1); brilhoP(x, qx, qy, 160 * qk, LUZS.ambar, 0.3 * nm); rotuloP(x, "?", qx, qy, 150 * qk, "255,226,160", nm * FIS.respira(t, 0, 0.05)); }
    nv.total(i);
  });
};

// =============== 4. apoio (meio do vídeo): identidade → seguir + amém ===============
// (cena pronta da identidade: CENAS.apoio)

// =============== 5. o significado: EMANUEL → hebraico → imanu = conosco, El = Deus → DEUS CONOSCO ===============
CENAS.significado = (el, c, B) => {
  const tE = B("emanuel"), tI = B("imanu"), tL = B("el"), tJ = B("junta");
  mostrarVersiculo("Emanuel: Deus conosco.", "Mateus 1:23", tJ - 0.1, c.fim + 0.3, { y: 380, tam: 70, destaque: ["Deus", "conosco."] });
  const TV = telaGPU(el, c, EM_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 960, zoom: 1.05 }], [c.fim + 0.5, { x: 540, y: 960, zoom: 1.14 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), uE = PT.ss((t - c.ini - 0.1) / 0.9), uH = PT.ss((t - tI + 1.1) / 1.0), uD = PT.ss((t - tJ + 0.3) / 1.1);
    let i = EM_ceu(nv, x, 0, t, cam, 0.8);
    const [cx, cy, ck] = projP(cam, 540, 980, 1), base = { cx, cy, esc: 900 * ck, cor: LUZ.luz, borda: [1, 1, 1], brilho: 0.85 };
    brilhoP(x, cx, cy, (420 + 160 * uD) * ck, LUZS.ambar, 0.16 + 0.18 * uD);
    if (uD > 0) i = morfo(nv, EM_F.hebr, EM_F.deus, uD, { de: { ...base, esc: 820 * ck }, para: { ...base, cor: LUZ.ouro, borda: LUZ.luz, brilho: 1 }, t, onda: 0.3, curva: 0.4, i0: i });
    else if (uH > 0) i = morfo(nv, EM_F.emanuel, EM_F.hebr, uH, { de: base, para: { ...base, esc: 820 * ck }, t, onda: 0.3, curva: 0.4, i0: i });
    else i = morfo(nv, EM_F.poeira, EM_F.emanuel, uE, { de: { ...base, esc: 1400 * ck, brilho: 0.6 }, para: base, t, onda: 0.3, curva: 0.6, i0: i });
    // o hebraico lê da direita: imanu (à direita) = conosco; El (à esquerda) = Deus
    const aI = PT.jan(t, tI - 0.1, tJ, 0.35, 0.4), aL = PT.jan(t, tL - 0.1, tJ, 0.35, 0.4);
    if (aI > 0.01) { brilhoP(x, cx + 150 * ck, cy, 200 * ck, LUZS.luz, 0.25 * aI); rotuloP(x, "imanu = conosco", cx + 150 * ck, cy + 210 * ck, 46, "255,236,200", aI * FIS.chegar(t, tI, 0.5)); }
    if (aL > 0.01) { brilhoP(x, cx - 240 * ck, cy, 160 * ck, LUZS.luz, 0.25 * aL); rotuloP(x, "El = Deus", cx - 230 * ck, cy + 210 * ck, 46, "255,236,200", aL * FIS.chegar(t, tL, 0.5)); }
    nv.total(i);
  });
};

// =============== 6. para você: a estrela sai de longe e desce até a manjedoura; Maria e José ===============
CENAS.sentido = (el, c, B) => {
  const tL = B("longe"), tA = B("aqui"), tJ = B("jose2");
  const TV = telaGPU(el, c, EM_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 820, zoom: 1.0 }], [tA - 0.2, { x: 540, y: 880, zoom: 1.0 }], [tA + 1.6, { x: 560, y: 1000, zoom: 1.08 }], [c.fim + 0.5, { x: 560, y: 1010, zoom: 1.12 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), desce = PT.inOut((t - tA + 0.8) / 1.8), aqui = PT.ss((t - tA - 0.6) / 0.8), jj = PT.ss((t - tJ + 0.2) / 0.8);
    let i = EM_ceu(nv, x, 0, t, cam);
    // a estrela: bem longe e alta ("lá longe") → desce em arco até em cima da manjedoura
    const [ex, ey] = FIS.arco(820, 300, 600, 1080, desce, 160), [sx, sy, sk] = projP(cam, ex, ey, 1.2 - 0.2 * desce);
    i = EM_estrela(nv, x, i, t, sx, sy, (60 + 50 * desce) * sk, 1, 0.8 + 0.4 * aqui);
    if (desce > 0 && desce < 1) for (let k = 1; k < 24; k++) { const [qx, qy] = FIS.arco(820, 300, 600, 1080, Math.max(0, desce - k * 0.02), 160), [px, py] = projP(cam, qx, qy, 1.2); discoP(x, px, py, 6 * (1 - k / 24), LUZS.luz, 0.5 * (1 - k / 24)); }
    // estábulo, manjedoura com o menino, Maria ajoelhada e José de pé
    const [bx, by, bk] = projP(cam, 600, 1130, 1.05); i = desenharForma(nv, EM_F.estabulo, { cx: bx, cy: by, esc: 900 * bk, cor: [0.9, 0.78, 0.6], brilho: 0.55 + 0.3 * aqui, a: 0.75, t, i0: i });
    brilhoP(x, ...projP(cam, 600, 1330, 1).slice(0, 2), 360 * aqui * bk, LUZS.ambar, 0.35 * aqui);
    manjedoura(x, { x: 600, chao: 1420, esc: 230, cam, z: 1, t, a: 0.3 + 0.7 * aqui });
    figura(x, t, { ...POSES.ajoelhado, braco: [[0.5, 1.0], [0.75, 0.9]], cabeca: 0.3 }, { tipo: "maria", x: 390, chao: 1420, H: 480, dir: 1, cam, z: 1, fase: 3, expr: aqui > 0.5 ? "sorri" : "neutro" });
    figura(x, t, poseMix({ ...POSES.de_pe, cabeca: 0.15 }, { ...POSES.de_pe, cabeca: 0.3, braco: [[-0.1, 0.3], [0.6, 1.3]] }, jj), { tipo: "jose", x: 850, chao: 1420, H: 520, dir: -1, cam, z: 1, fase: 2, expr: jj > 0.5 ? "sorri" : "neutro" });
    nv.total(i);
  });
};

// =============== 7. o detalhe: o livro abre e fecha com a mesma promessa (Mateus 1:23 → 28:20) ===============
CENAS.detalhe = (el, c, B) => {
  const tD = B("detalhe"), tC = B("comeca"), tT = B("termina"), tP = B("promessa"), tp = tempoPalavras(c);
  mostrarVersiculo("…eu estou convosco todos os dias…", "Mateus 28:20", tp("eu", 0) - 0.2, c.fim + 0.3, { y: 360, tam: 66, destaque: ["convosco", "dias…"] });
  const TV = telaGPU(el, c, EM_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1000, zoom: 1.08 }], [c.fim + 0.5, { x: 540, y: 1000, zoom: 1.16 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), uL = PT.ss((t - c.ini) / 1.0), aC = FIS.chegar(t, tC, 0.5), aT = FIS.chegar(t, tT, 0.5), pr = PT.ss((t - tP + 0.3) / 1.0);
    let i = EM_ceu(nv, x, 0, t, cam, 0.8);
    const [lx, ly, lk0] = projP(cam, 540, 850, 1), lk = lk0 * 0.8;
    brilhoP(x, lx, ly, (460 + 200 * pr) * lk, LUZS.ambar, 0.15 + 0.2 * pr);
    i = morfo(nv, EM_F.deus, EM_F.livro, uL, { de: { cx: lx, cy: ly - 40 * lk, esc: 900 * lk, cor: LUZ.ouro, borda: LUZ.luz, brilho: 1 }, para: { cx: lx, cy: ly, esc: 760 * lk, cor: LUZ.luz, borda: [1, 1, 1], brilho: 0.8 + 0.3 * pr }, t, onda: 0.3, curva: 0.4, i0: i });
    // página da esquerda: o começo (1:23); da direita: o fim (28:20); o arco de luz liga as duas
    if (aC > 0.01) { rotuloP(x, "1:23", lx - 175 * lk, ly - 40 * lk, 54, "255,226,160", Math.min(1, aC)); rotuloP(x, "Deus conosco", lx - 175 * lk, ly + 30 * lk, 34, "255,236,200", Math.min(1, aC)); }
    if (aT > 0.01) { rotuloP(x, "28:20", lx + 175 * lk, ly - 40 * lk, 54, "255,226,160", Math.min(1, aT)); rotuloP(x, "convosco todos os dias", lx + 175 * lk, ly + 30 * lk, 28, "255,236,200", Math.min(1, aT)); }
    if (pr > 0.01) { const n = 40; for (let k = 0; k <= n * pr; k++) { const [qx, qy] = FIS.arco(lx - 175 * lk, ly - 110 * lk, lx + 175 * lk, ly - 110 * lk, k / n, 170 * lk); discoP(x, qx, qy, 6, LUZS.ouro, 0.7); }
      for (let k = 0; k < 2; k++) { const v = ((t - tP) * 0.6 + k / 2) % 1; anelP(x, lx, ly, (320 + v * 320) * lk, LUZS.ouro, 0.3 * (1 - v) * pr, 3); } }
    // Jesus no monte (o fim do livro), braços abertos, pequeno embaixo
    const aJ = PT.ss((t - tT + 0.4) / 0.9);
    if (aJ > 0.01) figura(x, t, poseMix(POSES.de_pe, { ...POSES.bracos_abertos, braco: [[-1.0, 0.35], [1.0, 0.35]] }, 0.7), { tipo: "jesus", x: 540, chao: 1440, H: 300, dir: 1, cam, z: 1, a: aJ, fase: 5, expr: "sorri" });
    nv.total(i);
  });
};

// =============== 8. pergunta (uma só) e 9. fim (emenda no começo) ===============
CENAS.pergunta = (el, c, B) => cenaPergunta(el, c, B, { texto: "Em que momento do dia você mais precisa lembrar que <b>Deus está com você</b>?", sub: "Escreve numa palavra", icone: "hand-heart",
  de: [EM_F.livro, { cx: 540, cy: 860, esc: 700, cor: LUZ.luz, borda: [1, 1, 1] }], seed: 241, tam: 66, alturaTexto: 320 });
CENAS.fim = (el, c, B) => cartaoFinal(el, c.ini + 0.05);
