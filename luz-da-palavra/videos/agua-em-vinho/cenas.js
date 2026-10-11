// Cenas do vídeo "Água em vinho" (João 2:1–11) — Luz da Palavra, pontos de luz na GPU.
// Retenção: quadro 0 = uma taça de vinho de luz que se esvazia diante das luzes da festa desfocadas;
// gancho emocional; laço aberto ("o detalhe mais bonito fica para o final") pago em "tu guardaste até
// agora o bom vinho"; capítulos I–III; as seis talhas enchem (cascata) e a água vira vinho (onda de
// baixo para cima); pergunta única. Figuras (Jesus, a mãe dele, convidados): silhuetas de luz sem rosto.
// Citações (Almeida): "Fazei tudo quanto ele vos disser" (2:5); "tu guardaste até agora o bom vinho" (2:10).

const AV_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.85) };
const AV_EST = fundoProfundo(91, 480);
const AV_VINHO = [0.82, 0.2, 0.32], AV_AGUA = [0.45, 0.72, 1.0], AV_QUENTE = [0.95, 0.78, 0.55];
// taça desenhada "deitada" (fundo à esquerda) para o `revela` encher de baixo para cima com rot: -PI/2
const AV_TACA = { desenho: (g, R) => { g.save(); g.translate(R / 2, R / 2); g.rotate(Math.PI / 2); g.translate(-R / 2, -R / 2); g.translate(R * 0.04, R * 0.04); g.scale((R * 0.92) / 256, (R * 0.92) / 256); g.fill(new Path2D(ICONES_PH.wine)); g.restore(); } };
// talha de pedra: perfil (meia largura em função de y, em unidades da talha; y de -0.45 a 0.45)
const AV_hw = (y) => (y < -0.38 ? 0.13 : 0.16 + 0.15 * Math.pow(Math.sin(Math.PI * Math.min(1, (y + 0.38) / 0.83)), 0.85));
const AV_TALHA = { desenho: (g, R) => {
  const P = (x, y) => [R * (0.5 + x), R * (0.5 + y)];
  g.strokeStyle = "#fff"; g.lineWidth = R * 0.035; g.lineJoin = "round"; g.beginPath();
  for (let k = 0; k <= 40; k++) { const y = -0.38 + (0.83 * k) / 40, [px, py] = P(-AV_hw(y), y); k ? g.lineTo(px, py) : g.moveTo(px, py); }
  for (let k = 40; k >= 0; k--) { const y = -0.38 + (0.83 * k) / 40, [px, py] = P(AV_hw(y), y); g.lineTo(px, py); }
  g.stroke(); const [rx, ry] = P(-0.2, -0.46); g.lineWidth = R * 0.03; g.strokeRect(rx, ry, R * 0.4, R * 0.08);
} };
const AV_F = {
  taca: formaPontos(AV_TACA, 11000, { espessura: 0.05 }), tacaP: formaPontos("wine", 2500), talha: formaPontos(AV_TALHA, 4500, { espessura: 0.08 }),
  pessoa: silhuetaForma("pessoa", 3500), pessoaG: silhuetaForma("pessoa", 9000), manto: silhuetaForma("manto", 10000),
};
// pontos de água dentro de uma talha (coordenadas da talha); v = 0 (boca) a 1 (fundo)
const AV_AGUA_PTS = (() => { const r = prng(93), L = []; while (L.length < 1300) { const y = -0.36 + r() * 0.8, w = AV_hw(y) - 0.035, x = (r() * 2 - 1) * w; if (w > 0) L.push([x, y, (y + 0.36) / 0.8, r()]); } return L; })();
// seis talhas: 3 atrás (z 1.35) e 3 na frente
const AV_TALHAS = [[330, 1060, 1.35], [540, 1050, 1.35], [750, 1060, 1.35], [300, 1200, 1.0], [540, 1215, 1.0], [780, 1200, 1.0]];
function AV_desenhaTalhas(nv, x, i, t, cam, nivel, vinho, a = 1) {
  AV_TALHAS.forEach(([tx, ty, tz], k) => {
    const [sx, sy, kk] = projP(cam, tx, ty, tz), esc = 300 * kk, L = nivel(k), V = vinho(k);
    i = desenharForma(nv, AV_F.talha, { cx: sx, cy: sy, esc, cor: [0.78, 0.74, 0.7], borda: [0.95, 0.92, 0.88], brilho: 0.75, a, t, i0: i });
    if (L > 0.01) for (const [px, py, v, n] of AV_AGUA_PTS) {
      if (i >= nv.n) break; if (v < 1 - L) continue;
      const onda = Math.sin(t * 2 + px * 20 + k) * 0.006, vi = PT.ss((V * 1.3 - (1 - v)) / 0.3), c = mixCor(AV_AGUA, AV_VINHO, vi);
      nv.ponto(i++, sx + px * esc, sy + (py + (v < 1 - L + 0.03 ? onda : 0)) * esc, c[0], c[1], c[2], a * (0.35 + 0.35 * n) * (v < 1 - L + 0.04 ? 1.6 : 1), 3.2 * kk);
    }
    if (V > 0 && V < 1) brilhoP(x, sx, sy + (0.42 - 0.78 * V) * esc, 110 * kk, "255,120,150", 0.5 * Math.sin(Math.PI * V) * a);
  });
  return i;
}
// pátio da festa: luzes penduradas (varais em curva), chão em perspectiva, convidados ao fundo
const AV_VARAIS = [[-120, 1200, 330, 90, 1.7], [-80, 1180, 450, 70, 2.3], [-200, 1300, 260, 110, 1.3]];
const AV_CHAO = (() => { const r = prng(95), L = []; for (let k = 0; k < 2200; k++) L.push([-400 + r() * 1900, 1250 + Math.pow(r(), 1.4) * 520, r()]); return L; })();
const AV_CONV = [[90, 1130, 2.0, 1, "homem", 1], [230, 1120, 2.1, -1, "mulher", 1], [860, 1125, 2.0, -1, "pessoa", 1], [990, 1135, 2.2, 1, "mulher", 1], [400, 1110, 2.4, 1, "homem", 0], [700, 1105, 2.5, -1, "pessoa", 0]];
function AV_patio(nv, x, i, t, cam, o = {}) {
  const a = o.a ?? 1;
  i = desenharFundo(nv, AV_EST, t, cam, LUZ.luz, 0.7 * a, i);
  AV_VARAIS.forEach(([x0, x1, y0, sag, z], v) => { for (let k = 0; k <= 22; k++) { const u = k / 22, X = x0 + (x1 - x0) * u, Y = y0 + sag * 4 * u * (1 - u), [sx, sy, kk] = projP(cam, X, Y, z), pis = 0.75 + 0.25 * Math.sin(t * 2 + k * 1.7 + v), fo = o.desfoca ?? 0; if (sx < -60 || sx > 1140) continue; brilhoP(x, sx, sy, (28 + 70 * fo) * kk, LUZS.ambar, (0.45 - 0.25 * fo) * pis * a); if (fo < 0.5) discoP(x, sx, sy, 4 * kk, "255,236,190", 0.9 * pis * a * (1 - fo * 2)); } });
  for (const [cx, cy, v] of AV_CHAO) { if (i >= nv.n) break; const z = 1 + (1500 - cy) / 700, [sx, sy, kk] = projP(cam, cx, cy, Math.max(0.7, z)); if (sx < -20 || sx > 1100) continue; nv.ponto(i++, sx, sy, 0.85, 0.7, 0.5, a * (0.06 + 0.1 * v), 2 + 2 * kk); }
  if (o.convidados ?? 1) AV_CONV.forEach(([cx, cy, cz, d, tipo, lateral], k) => { if (o.soLaterais && !lateral) return; personagem(x, t, k % 3 === 1 ? POSES.segurando : POSES.de_pe, { tipo, x: cx, chao: cy + 170, H: 420, dir: d, cam, z: cz, a: 0.55 * a * (o.convidados ?? 1), cor: mixCor(AV_QUENTE, [0.8, 0.82, 1], k % 2 * 0.4), fase: k }); });
  return i;
}

// =============== 1. abertura: a taça de vinho de luz se esvazia diante das luzes da festa ===============
CENAS.abertura = (el, c, B) => {
  const tA = B("acabou"), tH = B("historia"), tL = B("laco");
  mostrarGancho(tH + 0.3);
  const TV = telaGPU(el, c, AV_FUNDO), nv = TV.nuvem(60000);
  const CAM = cameraProf([[0, { x: 540, y: 900, zoom: 1.2 }], [c.fim + 0.5, { x: 540, y: 940, zoom: 1.0 }]]);
  const GOT = (() => { const r = prng(97); return Array.from({ length: 160 }, () => [r() * 2 - 1, r(), r()]); })();
  TV.quadro((x, t) => {
    const cam = CAM(t), esv = PT.ss((t - tA + 0.3) / 2.2), nivel = 0.98 - 0.85 * esv;
    let i = AV_patio(nv, x, 0, t, cam, { desfoca: 1, convidados: 0 });
    const [gx, gy, gk] = projP(cam, 540, 930, 1), esc = 560 * gk;
    brilhoP(x, gx, gy, 380 * gk, "255,110,130", 0.22 * (1 - esv) + 0.06);
    // taça: contorno fraco inteiro + o vinho (parte de baixo, até o nível)
    i = desenharForma(nv, AV_F.taca, { cx: gx, cy: gy, esc, rot: -Math.PI / 2, cor: [0.85, 0.85, 0.95], borda: [1, 1, 1], brilho: 0.45, a: 0.7, t, i0: i });
    i = desenharForma(nv, AV_F.taca, { cx: gx, cy: gy, esc: esc * 1.002, rot: -Math.PI / 2, cor: AV_VINHO, borda: [1, 0.6, 0.7], brilho: 1.0, revela: nivel, t, i0: i });
    // gotas que caem quando a alegria acaba
    if (esv > 0) for (const [u, f, s] of GOT) { const d = ((t - tA) * (200 + 200 * s) + f * 600) % 600; nv.ponto(i++, gx + u * 60 * gk, gy + 0.3 * esc + d, AV_VINHO[0], AV_VINHO[1], AV_VINHO[2], 0.7 * esv * (1 - d / 600), 3 + 2 * s); }
    nv.total(i);
  });
};

// =============== 2. contexto: o casamento em Caná; Jesus e a mãe dele chegam ===============
const AV_JES = [640, 1110, 1.15, 360], AV_MAE = [450, 1125, 1.15, 320];
CENAS.contexto = (el, c, B) => {
  const tC = B("cana"), tJ = B("jesus"), tM = B("mae");
  const TV = telaGPU(el, c, AV_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 820, zoom: 1.3 }], [tC + 1.6, { x: 540, y: 960, zoom: 1.0 }], [tJ, { x: 560, y: 980, zoom: 1.05 }], [c.fim + 0.5, { x: 560, y: 1000, zoom: 1.2 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t);
    let i = AV_patio(nv, x, 0, t, cam, { desfoca: 1 - PT.ss((t - c.ini) / 1.5) });
    const cJ = PT.ss((t - tJ + 0.6) / 1.8), cM = PT.ss((t - tM + 0.8) / 1.8), aJ = PT.ss((t - tJ + 0.6) / 0.5), aM = PT.ss((t - tM + 0.8) / 0.5);
    const [jx, jy, jk] = projP(cam, PT.lerp(820, AV_JES[0], cJ), AV_JES[1], AV_JES[2]); if (aJ > 0.01) brilhoP(x, jx, jy - 120 * jk, 320 * jk, LUZS.ambar, 0.2 * aJ);
    if (aJ > 0.01) personagem(x, t, poseMix(POSES.andar(t * 6.5, 1), POSES.de_pe, cJ), { tipo: "jesus", x: PT.lerp(820, AV_JES[0], cJ), chao: AV_JES[1] + 150, H: 440, dir: -1, cam, z: AV_JES[2], a: aJ, fase: 3 });
    if (aM > 0.01) personagem(x, t, poseMix(POSES.andar(t * 6.5 + 1, 1), POSES.de_pe, cM), { tipo: "mulher", x: PT.lerp(220, AV_MAE[0], cM), chao: AV_MAE[1] + 150, H: 410, dir: 1, cam, z: AV_MAE[2], a: aM, fase: 1 });
    nv.total(i);
  });
};

// =============== 3. conflito: o vinho acaba; a mãe chega perto: "Não têm vinho." ===============
CENAS.conflito = (el, c, B) => {
  const tV = B("vazio"), tG = B("vergonha"), tCh = B("chega"), tP = B("pede");
  const TV = telaGPU(el, c, AV_FUNDO), nv = TV.nuvem(80000);
  const tx = palcoTexto(el, [["av-p", 400, 80, "“Não têm vinho.”", "lp-q", ""]]);
  tl.set(tx["av-p"], { opacity: 0 }, 0);
  tl.fromTo(tx["av-p"], { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out", immediateRender: false }, tP - 0.4);
  const CAM = cameraProf([[c.ini, { x: 560, y: 1000, zoom: 1.2 }], [tV + 0.3, { x: 540, y: 960, zoom: 1.0 }], [tCh, { x: 560, y: 1010, zoom: 1.15 }], [c.fim + 0.5, { x: 560, y: 1020, zoom: 1.3 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), vazio = PT.ss((t - tV + 0.2) / 1.0), apaga = 0.35 * PT.ss((t - tG) / 1.0);
    let i = AV_patio(nv, x, 0, t, cam, { a: 1 - apaga, convidados: 1 });
    // a taça da mesa vazia, no centro
    const [gx, gy, gk] = projP(cam, 540, 830, 1.6);
    i = desenharForma(nv, AV_F.taca, { cx: gx, cy: gy, esc: 260 * gk, rot: -Math.PI / 2, cor: [0.85, 0.85, 0.95], brilho: 0.45, a: 0.7 * (1 - PT.ss((t - tCh) / 0.6)), t, i0: i });
    i = desenharForma(nv, AV_F.taca, { cx: gx, cy: gy, esc: 260 * gk, rot: -Math.PI / 2, cor: AV_VINHO, brilho: 1, revela: 0.9 * (1 - vazio), a: 1 - PT.ss((t - tCh) / 0.6), t, i0: i });
    // a mãe de Jesus anda até ele e fala, com a mão estendida
    const anda = PT.inOut((t - tCh + 0.2) / 1.4), mx = PT.lerp(AV_MAE[0] - 150, AV_MAE[0] - 30, anda), fala = PT.ss((t - tP + 0.4) / 0.5);
    const [jx, jy, jk] = projP(cam, AV_JES[0], AV_JES[1], AV_JES[2]); brilhoP(x, jx, jy - 120 * jk, 320 * jk, LUZS.ambar, 0.2);
    personagem(x, t, poseMix(POSES.de_pe, { ...POSES.de_pe, cabeca: 0.2 }, fala), { tipo: "jesus", x: AV_JES[0], chao: AV_JES[1] + 150, H: 440, dir: -1, cam, z: AV_JES[2], fase: 3 });
    let pm = poseMix(POSES.de_pe, POSES.andar(t * 6.5, 1), PT.jan(t, tCh - 0.2, tCh + 1.1, 0.2, 0.3)); pm = poseMix(pm, POSES.entregando, 0.55 * fala);
    personagem(x, t, pm, { tipo: "mulher", x: mx, chao: AV_MAE[1] + 150, H: 410, dir: 1, cam, z: AV_MAE[2], fase: 1 });
    nv.total(i);
  });
};

// =============== 4. virada: "Fazei tudo quanto ele vos disser"; seis talhas enchem de água ===============
CENAS.virada = (el, c, B) => {
  const tF = B("fazei"), tS = B("seis"), tE = B("enchem"), tC = B("cima");
  const tp = tempoPalavras(c), pal = ["fazei", "tudo", "quanto", "ele", "vos", "disser"];
  mostrarVersiculo("Fazei tudo quanto ele vos disser.", "João 2:5", tF - 0.3, tS - 0.5, { y: 400, tam: 72, destaque: ["fazei", "disser"], tempos: pal.map((w) => tp(w)) });
  const TV = telaGPU(el, c, AV_FUNDO), nv = TV.nuvem(90000);
  const CAM = cameraProf([[c.ini, { x: 560, y: 1020, zoom: 1.3 }], [tS - 0.2, { x: 540, y: 1000, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 1060, zoom: 1.12 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), aT = (k) => FIS.cascata(t, tS - 0.3, k, 0.12, 0.6);
    let i = AV_patio(nv, x, 0, t, cam, { convidados: 0 });
    const nivel = (k) => Math.min(1, aT(k)) * PT.ss((t - tE + 0.2 - k * 0.25) / 1.6) * 0.98;
    // as talhas chegam em cascata (com mola) e enchem uma depois da outra
    i = AV_desenhaTalhas(nv, x, i, t, { ...cam }, nivel, () => 0, 1);
    // dois serventes despejam água (cântaro inclinado + fio de água) enquanto as talhas enchem
    const desp = PT.jan(t, tE - 0.4, c.fim - 0.2, 0.4, 0.4);
    [[150, 1, 0], [930, -1, 1]].forEach(([sx0, dd, k]) => { const pz = poseMix(POSES.segurando, POSES.entregando, desp), p = personagem(x, t, pz, { tipo: "homem", x: sx0, chao: 1390, H: 430, dir: dd, cam, z: 1.05, fase: 5 + k, a: Math.min(1, FIS.chegar(t, tS + 0.2 + k * 0.2, 0.6)) });
      const [hx, hy] = p.maos[1]; brilhoP(x, hx, hy, 50, "150,200,255", 0.4 * desp); for (let q = 0; q < 40; q++) { const u2 = ((t * 1.6 + q / 40) % 1), [ex, ey] = [hx + dd * (20 + 60 * u2), hy + 12 + 140 * u2 * u2]; nv.ponto(i++, ex, ey, 0.55, 0.78, 1, 0.6 * desp * (1 - u2 * 0.5), 3); } });
    nv.total(i);
  });
};

// =============== 5. milagre: a água vira vinho (onda de baixo para cima, talha por talha) ===============
CENAS.milagre = (el, c, B) => {
  const tT = B("tirem"), tP = B("provou"), tV = B("vinho");
  const TV = telaGPU(el, c, AV_FUNDO), nv = TV.nuvem(90000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1060, zoom: 1.12 }], [tP, { x: 540, y: 1080, zoom: 1.3 }], [c.fim + 0.5, { x: 540, y: 1000, zoom: 1.05 }]]);
  const FA = (() => { const r = prng(99); return Array.from({ length: 300 }, () => [r() * 2 - 1, r(), r()]); })();
  TV.quadro((x, t) => {
    const cam = CAM(t), vir = (k) => PT.ss((t - tP + 0.4 - k * 0.18) / 1.4);
    let i = AV_patio(nv, x, 0, t, cam, { convidados: 0 });
    i = AV_desenhaTalhas(nv, x, i, t, cam, () => 0.98, vir, 1);
    // um servente tira um copo da talha e leva ao mestre-sala
    const tira = PT.ss((t - tT + 0.2) / 1.6), ps = personagem(x, t, poseMix(poseMix(POSES.segurando, POSES.andar(t * 6, 0.8), PT.jan(t, tT - 0.2, tT + 1.4, 0.3, 0.4)), POSES.entregando, PT.ss((t - tP + 0.3) / 0.6)), { tipo: "homem", x: PT.lerp(150, 250, tira), chao: 1390, H: 430, dir: 1, cam, z: 1.05, fase: 6 });
    { const [hx, hy] = ps.maos[1]; i = desenharForma(nv, AV_F.tacaP, { cx: hx + 6, cy: hy - 22, esc: 60, cor: mixCor(AV_AGUA, AV_VINHO, PT.ss((t - tP) / 1.0)), brilho: 1.1, t, i0: i }); }
    // faíscas subindo das talhas quando viram vinho
    const g = PT.jan(t, tP, c.fim, 0.4, 0.6);
    if (g > 0) for (const [u, f, s] of FA) { const k = Math.floor(f * 6), [tx, ty, tz] = AV_TALHAS[k], [sx, sy, kk] = projP(cam, tx + u * 60, ty - 120, tz), d = ((t - tP) * (60 + 80 * s) + f * 400) % 400; nv.ponto(i++, sx, sy - d * kk, 1, 0.55, 0.65, g * (1 - d / 400) * 0.8, 2 + 2 * s); }
    if (t > tV - 0.3) brilhoP(x, 540, 1150, 700, "255,110,140", 0.15 * PT.ss((t - tV + 0.3) / 0.8));
    nv.total(i);
  });
};

// =============== 6. o detalhe: "tu guardaste até agora o bom vinho" ===============
CENAS.detalhe = (el, c, B) => {
  const tD = B("detalhe"), tG = B("guardaste"), tU = B("ultimo");
  const tp = tempoPalavras(c), pal = ["tu", "guardaste", "até", "agora", "o", "bom", "vinho"];
  const tempos = pal.map((w) => (w === "o" ? tp("o", 3) : w === "vinho" ? tp("vinho", 1) : tp(w)));
  mostrarVersiculo("Tu guardaste até agora o bom vinho.", "João 2:10", tG - 0.4, c.fim + 0.3, { y: 400, tam: 74, destaque: ["guardaste", "bom"], tempos });
  const TV = telaGPU(el, c, AV_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1000, zoom: 1.05 }], [tG, { x: 540, y: 1020, zoom: 1.2 }], [c.fim + 0.5, { x: 540, y: 1000, zoom: 1.32 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), melhor = PT.ss((t - tU + 0.3) / 1.0);
    let i = AV_patio(nv, x, 0, t, cam, { convidados: 0.8 });
    // mestre-sala (esq.) ergue a taça diante do noivo (dir.)
    const ergue = FIS.chegar(t, tD + 0.2, 0.7), poseMS = poseMix(POSES.segurando, { ...POSES.de_pe, tronco: -0.05, cabeca: -0.15, braco: [[-0.2, 0.3], [2.4, 0.5]] }, Math.min(1, ergue));
    personagem(x, t, POSES.de_pe, { tipo: "pessoa", x: 700, chao: 1290, H: 470, dir: -1, cam, z: 1.1, fase: 2, cor: [0.95, 0.9, 1] });
    const ms = personagem(x, t, poseMS, { tipo: "homem", x: 400, chao: 1290, H: 480, dir: 1, cam, z: 1.1, fase: 4 }), [cx, cy] = ms.maos[1], ck = ms.escala;
    brilhoP(x, cx, cy - 30 * ck, (90 + 160 * melhor) * ck, "255,110,140", 0.5 + 0.3 * melhor);
    i = desenharForma(nv, AV_F.tacaP, { cx: cx + 4 * ck, cy: cy - 40 * ck, esc: 90 * ck * (1 + 0.25 * melhor), cor: mixCor(AV_VINHO, LUZ.ouro, 0.3 * melhor), borda: [1, 0.8, 0.85], brilho: 1.2, t, i0: i });
    nv.total(i);
  });
};

// =============== 7. para você: a sua taça vazia se enche de luz dourada ===============
CENAS.sentido = (el, c, B) => {
  const tA = B("alegria2"), tF = B("festa"), tM = B("melhor");
  const TV = telaGPU(el, c, AV_FUNDO), nv = TV.nuvem(60000);
  const tx = palcoTexto(el, [["av-s", 360, 66, "Talvez a festa ainda<br><b>não tenha terminado.</b>", "lp-q", ""]]);
  tl.set(tx["av-s"], { opacity: 0 }, 0);
  tl.fromTo(tx["av-s"], { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", immediateRender: false }, tF - 1.2);
  const CAM = cameraProf([[c.ini, { x: 540, y: 960, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 960, zoom: 1.15 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), enche = PT.ss((t - tM + 0.3) / 2.0), acende = PT.ss((t - tF + 0.5) / 1.2);
    let i = AV_patio(nv, x, 0, t, cam, { desfoca: 1, convidados: 0, a: 0.4 + 0.6 * acende });
    const pz = poseMix(POSES.segurando, { ...POSES.segurando, cabeca: 0.35, braco: [[0.95, 1.0], [1.05, 0.95]] }, 1), pp = personagem(x, t, pz, { tipo: "pessoa", x: 480, chao: 1400, H: 600, dir: 1, cam, z: 1, fase: 2, cor: mixCor([0.85, 0.9, 1], [1, 0.86, 0.55], enche) });
    const [hx, hy] = pp.maos[1], gx = hx + 30, gy = hy - 95, esc = 230;
    brilhoP(x, gx, gy, (220 + 200 * enche), LUZS.ambar, 0.1 + 0.35 * enche);
    i = desenharForma(nv, AV_F.taca, { cx: gx, cy: gy, esc, rot: -Math.PI / 2, cor: [0.85, 0.85, 0.95], borda: [1, 1, 1], brilho: 0.5, a: 0.8, t, i0: i });
    i = desenharForma(nv, AV_F.taca, { cx: gx, cy: gy, esc: esc * 1.002, rot: -Math.PI / 2, cor: LUZ.ouro, borda: LUZ.luz, brilho: 1.2, revela: 0.05 + 0.93 * enche, t, i0: i });
    nv.total(i);
  });
};

// =============== 8. pergunta (uma só) e 9. fim (emenda no começo) ===============
CENAS.pergunta = (el, c, B) => cenaPergunta(el, c, B, { texto: "Se Jesus transformasse <b>uma coisa</b> na sua vida hoje, o que seria?", sub: "Escreve nos comentários", icone: "wine",
  de: [AV_F.tacaP, { cx: 640, cy: 1040, esc: 250, cor: LUZ.ouro, borda: LUZ.luz }], seed: 97, tam: 70, alturaTexto: 300 });
CENAS.fim = (el, c, B) => cartaoFinal(el, c.ini + 0.05);
