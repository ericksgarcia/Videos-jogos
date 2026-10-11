// Cenas do vídeo "O que significa Amém" — Luz da Palavra, pontos de luz na GPU.
// Retenção: quadro 0 = uma pessoa ajoelhada em oração (line art, sem rosto) com partículas subindo; gancho
// emocional; laço aberto ("o lugar da Bíblia onde ela vira um nome") pago em Apocalipse 3:14; AMÉM →
// hebraico → coluna firme que não balança no tremor (a pessoa se segura nela); o povo diz amém; "Na
// verdade, na verdade" (João 6:47); a palavra vira luz em volta de Jesus; a porta que vira coluna; pergunta única.
// Citações (Almeida, ARC): João 6:47 "Na verdade, na verdade vos digo…"; Apocalipse 3:14 "Isto diz o
// Amém, a testemunha fiel e verdadeira…".

const AM_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.85) };
const AM_EST = fundoProfundo(131, 620);
const AM_COLUNA = { desenho: (g, R) => {
  const r = (x0, y0, x1, y1) => g.fillRect(R * x0, R * y0, R * (x1 - x0), R * (y1 - y0));
  r(0.27, 0.08, 0.73, 0.12); r(0.31, 0.12, 0.69, 0.17); r(0.36, 0.17, 0.64, 0.83); r(0.31, 0.83, 0.69, 0.88); r(0.27, 0.88, 0.73, 0.93);
  g.globalCompositeOperation = "destination-out"; for (const x of [0.42, 0.5, 0.58]) r(x - 0.008, 0.2, x + 0.008, 0.8); g.globalCompositeOperation = "source-over";
} };
const AM_F = {
  amem: formaTexto("AMÉM", 11000, { fonte: "Cinzel", peso: 700, tam: 0.3 }), hebr: formaTexto("אָמֵן", 10000, { fonte: "serif", peso: 700, tam: 0.42 }),
  coluna: formaPontos(AM_COLUNA, 12000, { espessura: 0.08 }), porta: formaPontos("door", 9000), halo: formaPontos({ desenho: (g, R) => { g.lineWidth = R * 0.05; g.strokeStyle = "#fff"; g.beginPath(); g.arc(R / 2, R / 2, R * 0.4, 0, 6.283); g.stroke(); } }, 11000, { espessura: 0.05 }),
  amemP: formaTexto("AMÉM", 2500, { fonte: "Cinzel", peso: 700, tam: 0.3 }),
};
const AM_SOBE = (() => { const r = prng(133); return Array.from({ length: 700 }, () => [r() * 2 - 1, r(), r()]); })();
function AM_ceu(nv, x, i, t, cam, a = 1) {
  i = desenharFundo(nv, AM_EST, t, cam, LUZ.luz, 0.85 * a, i);
  brilhoP(x, 540, 1650, 1000, LUZS.ambar, 0.1 * a); brilhoP(x, 540, 300, 900, "80,90,170", 0.08 * a);
  return i;
}
// partículas subindo (orações que sobem) a partir de (cx, cy)
function AM_sobe(nv, i, t, cx, cy, a, larg = 260) { for (const [u, f, s] of AM_SOBE) { const d = ((t * (40 + 60 * s)) + f * 900) % 900; nv.ponto(i++, cx + u * larg + Math.sin(t + f * 9) * 20, cy - d, LUZ.luz[0], LUZ.luz[1], LUZ.luz[2], a * 0.45 * (1 - d / 900) * s, 2 + 2 * s); } return i; }

// =============== 1. abertura: mãos em oração; a palavra AMÉM se forma ===============
CENAS.abertura = (el, c, B) => {
  const tO = B("oracao"), tU = B("ultima"), tN = B("nome");
  mostrarGancho(tU - 0.4);
  const TV = telaGPU(el, c, AM_FUNDO), nv = TV.nuvem(60000);
  const CAM = cameraProf([[0, { x: 540, y: 920, zoom: 1.2 }], [c.fim + 0.5, { x: 540, y: 960, zoom: 1.0 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), w = PT.ss((t - tU + 0.2) / 1.2), bri = PT.jan(t, tN - 0.3, c.fim, 0.3, 0.6);
    let i = AM_ceu(nv, x, 0, t, cam);
    // a pessoa ajoelhada em oração; das mãos sobem partículas de luz
    const ora = { ...POSES.orando, cabeca: 0.45 - 0.5 * w, tronco: 0.12 - 0.08 * w };
    const [gx, gy, gk] = projP(cam, 560, 1180, 1); brilhoP(x, gx, gy, 520 * gk, LUZS.ambar, 0.2);
    const pz = personagem(x, t, ora, { tipo: "pessoa", x: 500, chao: 1420, H: 640, dir: 1, cam, z: 1, cor: mixCor([0.9, 0.92, 1], LUZ.luz, 0.5 * w), fase: 2 });
    const [hx, hy] = pz.maos[1]; brilhoP(x, hx, hy, 90 * pz.escala, LUZS.luz, 0.6);
    i = AM_sobe(nv, i, t, hx, hy - 20, 1, 60);
    if (w > 0.01) { const [ax, ay, ak] = projP(cam, 540, 640, 1); brilhoP(x, ax, ay, 300 * ak, LUZS.luz, 0.15 * w + 0.2 * bri); i = desenharForma(nv, AM_F.amem, { cx: ax, cy: ay, esc: 760 * ak, cor: LUZ.luz, borda: [1, 1, 1], brilho: 0.8 + 0.4 * bri, revela: w, t, i0: i }); }
    nv.total(i);
  });
};

// =============== 2. origem: AMÉM → hebraico → uma coluna firme que não balança no tremor ===============
CENAS.origem = (el, c, B) => {
  const tH = B("hebraico"), tF = B("firme"), tB = B("balanca");
  const TV = telaGPU(el, c, AM_FUNDO), nv = TV.nuvem(70000);
  const PED = (() => { const r = prng(135); return Array.from({ length: 900 }, () => [r() * 1200 - 60, 1300 + r() * 250, r()]); })();
  TV.quadro((x, t) => {
    const [tx, ty] = FIS.tremor(t, tB - 0.4, 22, 1.4), cam = { x: 540, y: 960, zoom: 1, foco: 1 };
    let i = AM_ceu(nv, x, 0, t, cam);
    // chão que treme (o tremor sacode o chão, a coluna fica firme)
    for (const [px, py, v] of PED) { const tr = Math.abs(tx) > 0.5 ? Math.sin(px * 0.05 + t * 40) * Math.abs(tx) * 0.5 : 0; nv.ponto(i++, px + tx * 0.5, py + tr + ty * 0.3, 0.75, 0.62, 0.5, 0.08 + 0.12 * v, 2 + 2 * v); }
    const u1 = PT.ss((t - tH + 0.3) / 0.9), u2 = PT.ss((t - tF + 0.3) / 1.0), base = { cx: 540, cy: 860, esc: 760, cor: LUZ.luz, borda: [1, 1, 1], brilho: 0.8 };
    if (u2 > 0) { brilhoP(x, 540, 860, 420 * u2, LUZS.ambar, 0.25 * u2); i = morfo(nv, AM_F.hebr, AM_F.coluna, u2, { de: { ...base, esc: 560 }, para: { cx: 540, cy: 900, esc: 800, cor: LUZ.ouro, borda: LUZ.luz, brilho: 0.9 }, t, onda: 0.3, curva: 0.35, i0: i }); }
    else i = morfo(nv, AM_F.amem, AM_F.hebr, u1, { de: base, para: { ...base, esc: 560 }, t, onda: 0.3, curva: 0.4, i0: i });
    // uma pessoa ao lado: quando o chão treme, ela se segura na coluna, que não balança
    const segura = PT.ss((t - tB + 0.9) / 0.5), ap = PT.ss((t - tF + 0.2) / 0.6);
    if (ap > 0.01) personagem(x, t, poseMix(POSES.de_pe, { tronco: 0.14, cabeca: -0.15, braco: [[0.3, 0.6], [1.35, 0.25]], perna: [[-0.25, 0], [0.25, 0]] }, segura), { tipo: "pessoa", x: 205 + tx * 0.6 * (1 - segura), chao: 1335 + ty * 0.3, H: 470, dir: 1, a: ap, fase: 2, cor: mixCor([0.88, 0.9, 1], LUZ.luz, 0.5 * segura) });
    const pal = PT.jan(t, tF - 0.1, c.fim, 0.4, 0.4);
    if (pal > 0.01) ["FIRME", "SEGURO", "FIEL"].forEach((w, k) => rotuloP(x, w, 240 + k * 300, 1440, 46, "255,236,200", pal * FIS.chegar(t, tF + k * 0.25, 0.5)));
    nv.total(i);
  });
};

// =============== 3. uso: o povo diz amém; Jesus: "na verdade, na verdade" ===============
CENAS.uso = (el, c, B) => {
  const tP = B("povo"), tA = B("apoio"), tJ = B("jesus"), tp = tempoPalavras(c);
  mostrarVersiculo("Na verdade, na verdade vos digo…", "João 6:47", tp("na", 0) - 0.3, c.fim + 0.3, { y: 400, tam: 70, destaque: ["verdade,", "verdade"] });
  const TV = telaGPU(el, c, AM_FUNDO), nv = TV.nuvem(80000);
  const POVO = [[120, 1450, 1.7, "homem"], [280, 1470, 1.5, "mulher"], [450, 1440, 1.8, "pessoa"], [640, 1460, 1.6, "mulher"], [800, 1450, 1.7, "homem"], [940, 1470, 1.9, "pessoa"], [360, 1500, 1.25, "crianca"], [740, 1500, 1.3, "homem"]];
  const CAM = cameraProf([[c.ini, { x: 540, y: 1000, zoom: 1.1 }], [tJ - 0.5, { x: 540, y: 1020, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 980, zoom: 1.12 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), aP = PT.ss((t - tP + 0.5) / 0.8) * (1 - 0.6 * PT.ss((t - tJ + 0.3) / 0.8)), aA = PT.jan(t, tA - 0.3, tJ - 0.2, 0.3, 0.5), aJ = FIS.chegar(t, tJ - 0.2, 0.9);
    let i = AM_ceu(nv, x, 0, t, cam);
    if (aP > 0.01) POVO.forEach(([X, Y, z, tipo], k) => { personagem(x, t, poseMix(POSES.de_pe, { ...POSES.bracos_abertos, braco: [[-1.2, 0.3], [1.2, 0.3]] }, aA * (k % 3 === 0 ? 1 : 0.5)), { tipo, x: X, chao: Y, H: tipo === "crianca" ? 260 : 380, dir: k % 2 ? 1 : -1, cam, z, a: aP, fase: k, cor: mixCor([0.82, 0.86, 1], LUZ.luz, aA) }); });
    // "amém" sobe do povo, um pequeno de cada vez
    if (aP > 0.01) POVO.slice(0, 6).forEach(([X, Y, z], k) => { const u = ((t - tP) * 0.5 + k * 0.17) % 1, [sx, sy, kk] = projP(cam, X, Y - 380 - u * 260, z); if (t > tP) i = desenharForma(nv, AM_F.amemP, { cx: sx, cy: sy, esc: 200 * kk, cor: LUZ.luz, a: aP * Math.sin(Math.PI * u) * 0.9, brilho: 0.8, t, i0: i }); });
    if (aJ > 0.01) { const [jx, jy, jk] = projP(cam, 540, 1450, 1); brilhoP(x, jx, jy - 300 * jk, 360 * jk, LUZS.ambar, 0.28 * Math.min(1, aJ)); personagem(x, t, { ...POSES.de_pe, braco: [[-0.25, 0.3], [0.7, 1.0]] }, { tipo: "jesus", x: 540, chao: 1470, H: 600, dir: -1, cam, z: 1, a: Math.min(1, aJ), fase: 3 }); }
    nv.total(i);
  });
};

// =============== 4. o detalhe: a palavra AMÉM vira a silhueta de luz — "Isto diz o Amém" ===============
CENAS.detalhe = (el, c, B) => {
  const tD = B("detalhe"), tA = B("amem"), tF = B("fiel");
  mostrarVersiculo("Isto diz o Amém, a testemunha fiel e verdadeira.", "Apocalipse 3:14", tA - 0.6, c.fim + 0.3, { y: 400, tam: 66, destaque: ["amém,", "fiel"] });
  const TV = telaGPU(el, c, AM_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 980, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 1000, zoom: 1.15 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), u = PT.ss((t - tA + 0.4) / 1.4), fiel = PT.ss((t - tF + 0.2) / 0.8);
    let i = AM_ceu(nv, x, 0, t, cam);
    const [cx, cy, ck] = projP(cam, 540, 1080, 1);
    brilhoP(x, cx, cy, (360 + 200 * u) * ck, LUZS.ambar, 0.2 + 0.2 * u);
    if (fiel > 0) for (let r = 0; r < 18; r++) { const an = -Math.PI / 2 + (r - 8.5) * 0.19, L = (240 + 420 * fiel) * ck; linhaP(x, cx, cy - 200 * ck, cx + Math.cos(an) * L, cy - 200 * ck + Math.sin(an) * L, LUZS.ouro, 0.07 * fiel, 3); }
    i = morfo(nv, AM_F.amem, AM_F.halo, u, { de: { cx, cy: cy - 40 * ck, esc: 720 * ck, cor: LUZ.luz, borda: [1, 1, 1], brilho: 0.85 }, para: { cx, cy: cy - 210 * ck, esc: 700 * ck, cor: mixCor(LUZ.luz, LUZ.ouro, 0.5), borda: LUZ.luz, brilho: 0.6 + 0.2 * fiel, a: 0.55 }, t, onda: 0.35, curva: 0.5, sobe: 60, i0: i });
    const aJ = PT.ss((t - tA + 0.1) / 1.0);
    if (aJ > 0.01) personagem(x, t, poseMix(POSES.de_pe, { ...POSES.bracos_abertos, braco: [[-1.0, 0.35], [1.0, 0.35]] }, 0.6 * fiel), { tipo: "jesus", x: 540, chao: 1450, H: 620, dir: 1, cam, z: 1, a: aJ, fase: 3 });
    nv.total(i);
  });
};

// =============== 5. para você: a porta que se fecha vira uma coluna; você se apoia nela ===============
CENAS.sentido = (el, c, B) => {
  const tP = B("porta"), tA = B("alguem");
  const TV = telaGPU(el, c, AM_FUNDO), nv = TV.nuvem(70000);
  const tx = palcoTexto(el, [["am-s", 360, 66, "Não é fechar uma porta.<br><b>É se apoiar em alguém firme.</b>", "lp-q", ""]]);
  tl.set(tx["am-s"], { opacity: 0 }, 0);
  tl.fromTo(tx["am-s"], { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", immediateRender: false }, tP - 0.6);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1000, zoom: 1.05 }], [c.fim + 0.5, { x: 540, y: 1020, zoom: 1.12 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), u = PT.ss((t - tA + 0.6) / 1.2), fecha = PT.ss((t - tP + 0.8) / 0.8);
    let i = AM_ceu(nv, x, 0, t, cam);
    const [cx, cy, ck] = projP(cam, 620, 1040, 1);
    brilhoP(x, cx, cy, (300 + 200 * u) * ck, LUZS.ambar, 0.12 + 0.25 * u);
    i = morfo(nv, AM_F.porta, AM_F.coluna, u, { de: { cx, cy, esc: 600 * ck, cor: [0.75, 0.75, 0.85], borda: [0.95, 0.95, 1], brilho: 0.75 - 0.2 * fecha, giro: 0.5 * (1 - fecha) }, para: { cx, cy, esc: 760 * ck, cor: LUZ.ouro, borda: LUZ.luz, brilho: 0.95 }, t, onda: 0.3, curva: 0.4, i0: i });
    // a pessoa ajoelhada, em oração, ao lado da coluna; esquenta quando a coluna aparece
    const apoia = PT.ss((t - tA + 0.2) / 0.9);
    personagem(x, t, poseMix(POSES.orando, { tronco: 0.12, cabeca: -0.1, braco: [[0.35, 0.5], [1.3, 0.25]], perna: [[-0.2, 0], [0.22, 0]] }, apoia), { tipo: "pessoa", x: PT.lerp(330, 300, apoia), chao: 1330, H: 500, dir: 1, cam, z: 1, fase: 2, cor: mixCor([0.85, 0.88, 1], LUZ.luz, u) });
    nv.total(i);
  });
};

// =============== 6. pergunta (uma só) e 7. fim (emenda no começo) ===============
CENAS.pergunta = (el, c, B) => cenaPergunta(el, c, B, { texto: "Qual oração você quer terminar hoje com um <b>amém</b> bem firme?", sub: "Escreve nos comentários", icone: "hands-praying",
  de: [AM_F.coluna, { cx: 620, cy: 1040, esc: 850, cor: LUZ.ouro, borda: LUZ.luz }], seed: 137, tam: 70, alturaTexto: 300 });
CENAS.fim = (el, c, B) => cartaoFinal(el, c.ini + 0.05);
