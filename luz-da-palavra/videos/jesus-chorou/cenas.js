// Cenas do vídeo "Jesus chorou" (João 11:35) — Luz da Palavra, pontos de luz na GPU.
// Retenção: quadro 0 = uma lágrima de luz caindo no escuro; "só duas palavras" (o versículo vira
// pontos); laço aberto ("um detalhe que quase ninguém percebe") pago na cena "detalhe" (ele sabia
// que ia chamar Lázaro para fora e mesmo assim chorou); pergunta 1 ou 2 com seta para a direita.
// Figuras: só silhuetas de luz, sem rosto. Contexto conferido em João 11 (v. 11, 33, 35, 43).

const JC_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.85) };
const JC_EST = fundoProfundo(71, 620);
const JC_F = {
  gota: formaPontos("drop", 9000), gotaP: formaPontos("drop", 900), coracao: formaPontos("heart", 11000),
  texto: formaTexto("JESUS CHOROU", 13000, { fonte: "Cinzel", peso: 700, tam: 0.2 }), interr: formaTexto("?", 9000, { fonte: "Cinzel", peso: 700 }),
  pessoa: silhuetaForma("pessoa", 5000), manto: silhuetaForma("manto", 11000),
  tumulo: formaPontos({ desenho: (g, R) => { g.beginPath(); g.moveTo(R * 0.04, R * 0.92); g.quadraticCurveTo(R * 0.08, R * 0.3, R * 0.5, R * 0.26); g.quadraticCurveTo(R * 0.92, R * 0.3, R * 0.96, R * 0.92); g.closePath(); g.fill(); g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(R * 0.46, R * 0.66, R * 0.13, Math.PI, 0); g.lineTo(R * 0.59, R * 0.92); g.lineTo(R * 0.33, R * 0.92); g.closePath(); g.fill(); g.globalCompositeOperation = "source-over"; } }, 9000, { espessura: 0.08 }),
  pedra: formaPontos({ desenho: (g, R) => { g.beginPath(); g.arc(R / 2, R / 2, R * 0.46, 0, 6.283); g.fill(); g.globalCompositeOperation = "destination-out"; g.lineWidth = R * 0.03; g.strokeStyle = "#000"; g.beginPath(); g.arc(R / 2, R / 2, R * 0.3, 0, 6.283); g.stroke(); g.globalCompositeOperation = "source-over"; } }, 3500, { espessura: 0.1 }),
};
const JC_PEDRA_COR = [0.62, 0.6, 0.72], JC_FRIA = [0.62, 0.72, 1.0];
// mundo da cena (coordenadas antes da câmera): morros, túmulo, grupo e Jesus
const JC_TUM = { x: 90, y: 990, z: 2.0, esc: 440 }, JC_JES = { x: 450, y: 1060, z: 1.0, esc: 400 };
const JC_GRUPO = [[610, 1075, 1.25, 290, 0.05], [690, 1065, 1.25, 300, -0.04], [765, 1080, 1.3, 280, 0.03], [835, 1075, 1.35, 270, -0.05]];
const JC_MORROS = (() => { const r = prng(17), L = []; for (let k = 0; k < 2600; k++) { const x = -700 + r() * 2500, z = 2.4 + r() * 1.4, h = 120 * Math.sin(x * 0.004 + z) + 60 * Math.sin(x * 0.011 + 2 * z), y = 1050 - h - (z - 2.4) * 160 + r() * 18; L.push([x, y, z, r()]); } return L; })();
const JC_CHAO = (() => { const r = prng(19), L = []; for (let k = 0; k < 2200; k++) L.push([-300 + r() * 1700, 1110 + Math.pow(r(), 1.5) * 380, r()]); return L; })();
function JC_cenario(nv, x, i, t, cam, a = 1, luzTum = 0) {
  i = desenharFundo(nv, JC_EST, t, cam, LUZ.luz, 0.75 * a, i);
  const [hx, hy] = projP(cam, 540, 980, 2.6); brilhoP(x, hx, hy, 1100, LUZS.ambar, 0.2 * a); brilhoP(x, hx, hy - 260, 900, "110,80,170", 0.16 * a); brilhoP(x, hx, hy + 40, 500, LUZS.luz, 0.08 * a);
  for (const [mx, my, mz, v] of JC_MORROS) { if (i >= nv.n) break; const [sx, sy, k] = projP(cam, mx, my, mz); if (sx < -20 || sx > 1100) continue; nv.ponto(i++, sx, sy, 0.8, 0.64, 0.55, a * (0.2 + 0.25 * v) * (0.8 + 0.2 * Math.sin(t + v * 9)), 2 + 1.5 * k); }
  for (const [cx, cy, v] of JC_CHAO) { if (i >= nv.n) break; const z = 1 + (1400 - cy) / 900, [sx, sy, k] = projP(cam, cx, cy, Math.max(0.7, z * 0.9)); nv.ponto(i++, sx, sy, 0.85, 0.68, 0.5, a * (0.1 + 0.18 * v), 2 + 2 * k); }
  // túmulo com a pedra; a luz de dentro escapa pela borda (luzTum 0–1)
  const [tx, ty, tk] = projP(cam, JC_TUM.x, JC_TUM.y, JC_TUM.z);
  i = desenharForma(nv, JC_F.tumulo, { cx: JC_TUM.x, cy: JC_TUM.y, esc: JC_TUM.esc, cam, z: JC_TUM.z, cor: JC_PEDRA_COR, a: 0.8 * a, brilho: 0.7, t, i0: i });
  return [i, tx, ty, tk];
}
function JC_pedra(nv, x, i, t, cam, a, luzTum, rola = 0) {
  const ox = JC_TUM.x - 0.04 * JC_TUM.esc + rola * 0.3 * JC_TUM.esc, oy = JC_TUM.y + 0.24 * JC_TUM.esc, [px, py, k] = projP(cam, JC_TUM.x - 0.04 * JC_TUM.esc, oy, JC_TUM.z);
  if (luzTum > 0) { brilhoP(x, px, py, 0.25 * JC_TUM.esc * k * (1 + luzTum), LUZS.luz, 0.5 * luzTum * a); brilhoP(x, px, py, 0.55 * JC_TUM.esc * k * luzTum, LUZS.ambar, 0.2 * luzTum * a); }
  return desenharForma(nv, JC_F.pedra, { cx: ox, cy: oy, esc: 0.3 * JC_TUM.esc, cam, z: JC_TUM.z, cor: JC_PEDRA_COR, borda: mixCor([0.8, 0.8, 0.9], LUZ.luz, luzTum), rot: rola * 2.2, a: 0.9 * a, brilho: 0.75 + 0.4 * luzTum, t, i0: i });
}
// pessoas: grupo (frio) e Jesus (manto, luz quente); lágrimas que caem das cabeças
function JC_pessoas(nv, x, i, t, cam, a, o = {}) {
  JC_GRUPO.forEach(([gx, gy, gz, ge, inc], k) => { i = desenharForma(nv, JC_F.pessoa, { cx: gx, cy: gy + FIS.flutua(t, k, 2), esc: ge, cam, z: gz, cor: JC_FRIA, borda: [0.85, 0.9, 1], rot: inc + 0.02 * Math.sin(t * 0.7 + k), a: 0.8 * a, brilho: 0.75, t, i0: i }); });
  if ((o.lagrimas ?? 0) > 0) JC_GRUPO.forEach(([gx, gy, gz, ge], k) => { for (let q = 0; q < 3; q++) { const u = ((t * 0.35 + q / 3 + k * 0.27) % 1), [sx, sy, kk] = projP(cam, gx + (q - 1) * 6, gy - 0.36 * ge + u * 0.5 * ge, gz); nv.ponto(i++, sx, sy, 0.75, 0.88, 1, 0.8 * o.lagrimas * a * Math.sin(Math.PI * u), 4 * kk); } });
  const [jx, jy, jk] = projP(cam, JC_JES.x, JC_JES.y, JC_JES.z);
  brilhoP(x, jx, jy - 0.1 * JC_JES.esc * jk, 0.8 * JC_JES.esc * jk, LUZS.ambar, (0.1 + 0.12 * (o.calor || 0)) * a);
  i = desenharForma(nv, JC_F.manto, { cx: JC_JES.x, cy: JC_JES.y + FIS.flutua(t, 2, 2), esc: JC_JES.esc, cam, z: JC_JES.z, cor: mixCor(LUZ.luz, LUZ.ouro, 0.35 + 0.35 * (o.calor || 0)), borda: [1, 0.97, 0.9], giro: 0.1 * Math.sin(t * 0.5), a, brilho: 0.7, t, i0: i });
  return [i, jx, jy, jk];
}

// =============== 1. abertura: a lágrima de luz -> "JESUS CHOROU" em pontos -> "?" ===============
CENAS.abertura = (el, c, B) => {
  const tD = B("duas"), tL = B("laco");
  mostrarGancho(tD + 0.4);
  const TV = telaGPU(el, c, JC_FUNDO), nv = TV.nuvem(50000);
  const CAM = cameraProf([[0, { x: 540, y: 900, zoom: 1.15 }], [c.fim + 0.5, { x: 540, y: 920, zoom: 1.0 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t);
    let i = desenharFundo(nv, JC_EST, t, cam, LUZ.luz, 0.9, 0);
    const u1 = PT.ss((t - tD + 0.2) / 1.1), u2 = PT.ss((t - tL + 0.2) / 1.0);
    const gy = 760 + 120 * PT.ss(t / Math.max(1, tD)) + FIS.flutua(t, 0, 6);
    brilhoP(x, 540, gy, 360, LUZS.luz, 0.22 * (1 - u1) + 0.1);
    // gota de luz: cai devagar, balança; ondas no "chão" de luz quando ela "toca"
    const de = { cx: 540, cy: gy, esc: 360, cor: [0.78, 0.9, 1], borda: [1, 1, 1], giro: 0.25 * Math.sin(t * 0.8), brilho: 1.1 };
    const meio = { cx: 540, cy: 960, esc: 900, cor: LUZ.ouro, borda: LUZ.luz, brilho: 0.6 };
    const fim = { cx: 540, cy: 900, esc: 560, cor: LUZ.ouro, borda: LUZ.luz, brilho: 1.1 };
    if (u2 > 0) i = morfo(nv, JC_F.texto, JC_F.interr, u2, { de: meio, para: fim, t, onda: 0.3, curva: 0.4, i0: i });
    else i = morfo(nv, JC_F.gota, JC_F.texto, u1, { de, para: meio, t, onda: 0.35, curva: 0.5, sobe: 30, i0: i });
    nv.total(i);
  });
};

// =============== 2. Betânia: o túmulo de Lázaro ao fundo, os amigos chorando, Jesus chorou ===============
CENAS.versiculo = (el, c, B) => {
  const tLz = B("lazaro"), tCh = B("chorando"), tJ = B("chorou");
  mostrarVersiculo("Jesus chorou.", "João 11:35", tJ - 0.25, c.fim + 0.3, { y: 400, tam: 96, destaque: ["chorou"], tempoRef: tJ + 0.5 });
  const TV = telaGPU(el, c, JC_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 980, zoom: 1.0, foco: 1.1 }], [tLz + 0.2, { x: 420, y: 990, zoom: 1.05, foco: JC_TUM.z }], [tCh - 0.4, { x: 430, y: 990, zoom: 1.07, foco: JC_TUM.z }],
    [tCh + 0.5, { x: 640, y: 1000, zoom: 1.15, foco: 1.25 }], [tJ - 0.3, { x: 600, y: 1000, zoom: 1.1, foco: 1.1 }], [tJ + 1.2, { x: 470, y: 990, zoom: 1.4, foco: 1.0 }], [c.fim + 0.5, { x: 470, y: 985, zoom: 1.45, foco: 1.0 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t);
    let [i] = JC_cenario(nv, x, 0, t, cam, 1, 0);
    i = JC_pedra(nv, x, i, t, cam, 1, 0);
    let jx, jy, jk;
    [i, jx, jy, jk] = JC_pessoas(nv, x, i, t, cam, 1, { lagrimas: PT.ss((t - tCh + 0.4) / 0.8), calor: PT.ss((t - tJ) / 1.0) });
    // a lágrima de Jesus: sai da altura da cabeça e cai devagar (sem rosto: só uma gota de luz)
    const ug = (t - tJ + 0.1) / 2.2;
    if (ug > 0) { const gy = JC_JES.y - 0.33 * JC_JES.esc + Math.min(1, ug) * 0.28 * JC_JES.esc, ag = PT.ss(ug * 4) * (ug > 1.2 ? 1 - PT.ss((ug - 1.2) / 0.3) : 1); const [sx, sy, k] = projP(cam, JC_JES.x + 8, gy, JC_JES.z); brilhoP(x, sx, sy, 60 * k, "200,230,255", 0.8 * ag); i = desenharForma(nv, JC_F.gotaP, { cx: sx, cy: sy, esc: 26 * k, cor: [0.85, 0.95, 1], borda: [1, 1, 1], a: ag, brilho: 1.4, t, i0: i }); }
    nv.total(i);
  });
};

// =============== 3. o detalhe: a luz escapa do túmulo; a lágrima vira coração ===============
CENAS.detalhe = (el, c, B) => {
  const tS = B("sabia"), tF = B("fora"), tCo = B("com");
  const tx = palcoTexto(el, [["jc-d", 360, 66, "Ele sabia o fim.<br>E chorou com eles.", "", "font-family:'Cormorant Garamond',serif;font-style:italic;font-weight:500;text-transform:none;white-space:normal;letter-spacing:0;line-height:1.15;color:#fff6e6;text-shadow:0 0 26px rgba(255,227,163,0.45),0 6px 26px rgba(0,0,0,0.7);"]]);
  tl.fromTo(tx["jc-d"], { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", immediateRender: false }, tCo - 0.5);
  const TV = telaGPU(el, c, JC_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 470, y: 985, zoom: 1.45, foco: 1.0 }], [tS + 0.3, { x: 200, y: 1000, zoom: 1.55, foco: JC_TUM.z }], [tF + 0.6, { x: 190, y: 1000, zoom: 1.6, foco: JC_TUM.z }], [tCo + 0.4, { x: 560, y: 990, zoom: 1.0, foco: 1.1 }], [c.fim + 0.5, { x: 560, y: 980, zoom: 0.97, foco: 1.1 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), luz = PT.ss((t - tS) / 1.2), rola = PT.ss((t - tF + 0.1) / 1.2), co = PT.ss((t - tCo + 0.3) / 1.1);
    let [i] = JC_cenario(nv, x, 0, t, cam, 1, luz);
    i = JC_pedra(nv, x, i, t, cam, 1, luz, rola);
    // raios saindo da entrada do túmulo quando a pedra rola
    if (rola > 0) { const [px, py, k] = projP(cam, JC_TUM.x - 0.04 * JC_TUM.esc, JC_TUM.y + 0.24 * JC_TUM.esc, JC_TUM.z); for (let r = 0; r < 14; r++) { const an = -Math.PI / 2 + (r - 6.5) * 0.16, L = (160 + 380 * rola) * k; linhaP(x, px, py, px + Math.cos(an) * L, py + Math.sin(an) * L, LUZS.luz, 0.08 * rola, 3); } }
    let jx, jy, jk;
    [i, jx, jy, jk] = JC_pessoas(nv, x, i, t, cam, 1, { lagrimas: 0.6 * (1 - co), calor: 0.6 + 0.4 * co });
    // a lágrima sobe e vira um coração de luz acima do grupo
    if (co > 0) { const [hx, hy] = projP(cam, 640, 740, 1.1); brilhoP(x, hx, hy, 380 * co, LUZS.ambar, 0.3 * co); i = morfo(nv, JC_F.gota, JC_F.coracao, co, { de: { cx: jx, cy: jy - 0.2 * JC_JES.esc * jk, esc: 30, cor: [0.85, 0.95, 1], a: 0.9 }, para: { cx: hx, cy: hy, esc: 300 * FIS.respira(t, 0, 0.02), cor: LUZ.ouro, borda: LUZ.luz, brilho: 1.2 }, t, onda: 0.3, curva: 0.6, sobe: 80, i0: i }); }
    nv.total(i);
  });
};

// =============== 4. pergunta (1 ou 2) e 5. fim ===============
// o coração do fim da cena anterior vira o balão da pergunta
CENAS.pergunta = (el, c, B) => cenaPergunta(el, c, B, [["1 · Ele sabe o fim", "João 11:43", "sun-horizon"], ["2 · Ele chora com você", "João 11:35", "heart"]],
  { seed: 73, de: [JC_F.coracao, { cx: 640, cy: 730, esc: 300, cor: LUZ.ouro, borda: LUZ.luz }] });
// fim: "Salva esse vídeo, segue o Luz da Palavra, e lembra:" -> o vídeo recomeça em "Se hoje você chorou escondido..."
CENAS.fim = (el, c, B) => cartaoFinal(el, c.ini + 0.05);
