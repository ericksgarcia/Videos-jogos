// Cenas do vídeo "Jesus acalma a tempestade" (Marcos 4:35–41) — Luz da Palavra: mar, céu e chuva em pontos
// de luz; o barco e as pessoas em line art (o casco é desenhado por cima e esconde as pernas).
// Retenção: quadro 0 = barco no meio da tempestade com relâmpago; gancho emocional; laço aberto ("a primeira
// frase que Jesus diz") pago no detalhe ("vamos para o outro lado" veio antes da tempestade); Jesus só aparece
// dormindo depois do "Adivinha"; "Cala-te, aquieta-te" (Mc 4:39, igual em todas as Almeidas) acalma o mar.
// Paráfrases com "cf.": 4:35 e 4:38. Fatos: 4:36–38 (barco enchendo, popa, almofada), 1:16–20 (pescadores).

const JT_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.78) };
const JT_EST = fundoProfundo(161, 560);
const JT_F = { lua: formaPontos("moon", 4000) };
const JT_NUV = (() => { const r = prng(163), L = []; for (let b = 0; b < 10; b++) { const bx = -300 + b * 190 + r() * 80, by = 300 + r() * 360, bz = 2.2 + r() * 1.4, rw = 220 + r() * 160, rh = 70 + r() * 50; for (let k = 0; k < 280; k++) { const a = r() * 6.283, d = Math.sqrt(r()); L.push([bx + Math.cos(a) * rw * d, by + Math.sin(a) * rh * d, bz, r()]); } } return L; })();
const JT_CHUVA = (() => { const r = prng(165); return Array.from({ length: 240 }, () => [r(), r(), 0.6 + 0.8 * r()]); })();
const JT_RAIO = (() => { const r = prng(167), P = [[780, 300]]; for (let k = 0; k < 14; k++) { const [x, y] = P[P.length - 1]; P.push([x + (r() - 0.45) * 90, y + 55 + r() * 30]); } return P; })();
const JT_GOTAS = (() => { const r = prng(169); return Array.from({ length: 160 }, () => [r() * 2 - 1, r(), r()]); })();
// mar em linhas de profundidade; agit 0–1 = tamanho das ondas; luz = reflexo no meio (lua/glória)
function JT_mar(nv, i, t, cam, agit, luz = 0, a = 1) {
  for (let r = 0; r < 28 && i < nv.n; r++) {
    const prof = r / 27, z = 3.2 - 2.4 * prof, Y = 1150 + 260 * Math.pow(prof, 1.5), meia = (560 * z) / cam.zoom + 80, n = 60 + r * 3;
    for (let k = 0; k <= n && i < nv.n; k++) {
      const X = cam.x - meia + (2 * meia * k) / n + (r % 2) * meia / n, fase = X * 0.01 + t * (1.2 + 1.6 * agit) + r * 0.8, onda = Math.sin(fase) * (6 + 50 * agit) + Math.sin(X * 0.023 - t * 2.1 + r) * 16 * agit;
      const [sx, sy, kk] = projP(cam, X, Y + onda, z), crista = Math.max(0, Math.sin(fase));
      const refl = luz * Math.exp(-Math.pow((sx - 540) / (70 + 220 * prof), 2)), c = mixCor([0.35, 0.48, 0.85], LUZ.luz, Math.min(1, refl + 0.3 * crista * agit));
      nv.ponto(i++, sx, sy, c[0], c[1], c[2], a * (0.13 + 0.24 * (1 - prof) + 0.3 * crista * agit + 0.55 * refl), 2.4 + 4 * prof * kk);
    }
  }
  return i;
}
// céu: estrelas, nuvens (st.nuvem, st.abre), lua (st.lua), relâmpago (st.flash), chuva (st.chuva), pôr do sol (st.sol)
function JT_ceu(nv, x, i, t, cam, st) {
  const fl = st.flash || 0;
  i = desenharFundo(nv, JT_EST, t, cam, LUZ.luz, 0.3 + 0.6 * (st.lua || 0), i);
  if (st.sol) { brilhoP(x, 540, 1060, 1000, LUZS.ambar, 0.28 * st.sol); brilhoP(x, 540, 1080, 500, "255,140,110", 0.18 * st.sol); }
  for (const [nx, ny, nz, v] of JT_NUV) { if (i >= nv.n) break; const ab = (st.abre || 0) * 900 * Math.sign(nx - 540 || 1) * 0.5, [sx, sy, k] = projP(cam, nx + t * 22 / nz + ab, ny, nz); nv.ponto(i++, sx, sy, 0.55 + 0.4 * fl, 0.6 + 0.4 * fl, 0.78 + 0.2 * fl, (st.nuvem ?? 1) * (0.06 + 0.06 * v + 0.35 * fl), 4 + 5 * k); }
  if ((st.lua || 0) > 0.01) { const [mx, my, k] = projP(cam, 760, 430, 2.4); brilhoP(x, mx, my, 360 * k, "190,210,255", 0.25 * st.lua); i = desenharForma(nv, JT_F.lua, { cx: mx, cy: my, esc: 150 * k, cor: [0.92, 0.94, 1], a: st.lua, t, i0: i }); }
  if (fl > 0.02) { brilhoP(x, 780, 500, 1100, "200,215,255", 0.35 * fl); for (let k = 1; k < JT_RAIO.length; k++) { const [a0, b0] = JT_RAIO[k - 1], [a1, b1] = JT_RAIO[k]; linhaP(x, a0, b0, a1, b1, "235,240,255", fl, 6 - k * 0.3); } }
  const ch = st.chuva || 0;
  if (ch > 0.01) for (const [u, v, s] of JT_CHUVA) { const yy = ((v * 2000 + t * 1500 * s) % 2000) - 40, xx = ((u * 1300 - t * 300 * s) % 1300 + 1300) % 1300 - 100; linhaP(x, xx, yy, xx - 12 * s, yy + 38 * s, "190,205,240", 0.22 * ch * s, 1.6); }
  return i;
}
const JT_flash = (t, ts) => ts.reduce((m, tf) => Math.max(m, t >= tf ? Math.exp(-(t - tf) * 9) * (0.6 + 0.4 * Math.abs(Math.sin((t - tf) * 60))) : 0), 0);

// ---------- o barco (line art) ----------
// geometria local em unidades do comprimento L: u de -0,5 (popa) a 0,5 (proa), v para baixo
const JT_CASCO = [[-0.5, -0.13], [-0.42, -0.065], [-0.2, -0.04], [0, -0.035], [0.2, -0.045], [0.42, -0.085], [0.53, -0.17], [0.47, -0.02], [0.36, 0.07], [0.15, 0.11], [-0.15, 0.11], [-0.36, 0.08], [-0.47, 0.0]];
// posição do barco na tela: { sx, sy, L, rot }; P(u, v) → ponto na tela
function JT_geo(cam, t, agit, o = {}) {
  const X = o.X ?? 540, Y = (o.Y ?? 1170) + Math.sin(t * 1.9) * 26 * agit + (o.afunda || 0) * 30, z = o.z ?? 1, [sx, sy, k] = projP(cam, X, Y, z);
  const rot = Math.sin(t * 1.5) * 0.17 * agit + 0.04 * Math.sin(t * 0.7), L = (o.L ?? 720) * k, c = Math.cos(rot), s = Math.sin(rot);
  return { sx, sy, L, rot, k, P: (u, v) => [sx + (u * c - v * s) * L, sy + (u * s + v * c) * L] };
}
function JT_traco(y, pts, fechado, cor, lw, a, fundo = true) {
  y.beginPath(); _curva(y, pts, fechado);
  if (fechado && fundo) { y.fillStyle = `rgba(9,12,29,${0.96 * a})`; y.fill(); }
  y.strokeStyle = `rgba(${cor},${a})`; y.lineWidth = lw; y.shadowColor = `rgba(${cor},0.65)`; y.shadowBlur = 9; y.stroke(); y.shadowBlur = 0; y.stroke();
}
function JT_barco(x, g, o = {}) {
  const y = x._texto, a = o.a ?? 1, cor = o.cor || "235,225,205", lw = Math.max(1.6, 0.0042 * g.L);
  y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.lineJoin = "round"; y.lineCap = "round";
  if (o.mastro !== false) { // mastro e verga com a vela recolhida
    JT_traco(y, [g.P(0.03, -0.035), g.P(0.03, -0.6)], false, cor, lw * 1.6, a);
    // verga quase horizontal no alto, acima das cabeças, com a vela enrolada (fina) logo abaixo
    JT_traco(y, [g.P(-0.2, -0.555), g.P(0.03, -0.575), g.P(0.25, -0.6)], false, cor, lw * 1.2, a);
    JT_traco(y, [g.P(-0.18, -0.55), g.P(0.03, -0.567), g.P(0.23, -0.592), g.P(0.22, -0.572), g.P(0.03, -0.548), g.P(-0.17, -0.533)], true, cor, lw * 0.7, a * 0.9);
    for (const u2 of [-0.12, -0.03, 0.09, 0.18]) JT_traco(y, [g.P(u2, -0.536 - 0.12 * (u2 + 0.2) * 0.4), g.P(u2 + 0.006, -0.562 - 0.12 * (u2 + 0.2) * 0.4)], false, cor, lw * 0.5, a * 0.7);
  }
  JT_traco(y, JT_CASCO.map(([u, v]) => g.P(u, v)), true, cor, lw * 1.25, a);
  for (const dv of [0.035, 0.075]) JT_traco(y, [g.P(-0.44, -0.04 + dv * 0.9), g.P(-0.2, -0.01 + dv), g.P(0.2, -0.015 + dv), g.P(0.44, -0.05 + dv * 0.9)], false, cor, lw * 0.55, a * 0.7);
  y.restore();
}
// a água na frente do barco: linha de onda em line art com fundo escuro (o casco "senta" na água)
function JT_agua(x, g, t, agit, o = {}) {
  const y = x._texto, y0 = g.sy + (o.nivel ?? 0.05) * g.L, amp = (5 + 34 * agit) * Math.max(0.5, g.k), pts = [];
  for (let xs = -40; xs <= 1120; xs += 16) pts.push([xs, y0 + amp * (Math.sin(xs * 0.011 + t * 2.2) + 0.5 * Math.sin(xs * 0.027 - t * 1.4))]);
  y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.lineJoin = "round"; y.lineCap = "round";
  y.beginPath(); y.moveTo(pts[0][0], pts[0][1]); for (const [a, b] of pts) y.lineTo(a, b); y.lineTo(1120, 2000); y.lineTo(-40, 2000); y.closePath();
  y.fillStyle = `rgba(7,11,30,${o.fundo ?? 0.5})`; y.fill();
  y.beginPath(); y.moveTo(pts[0][0], pts[0][1]); for (const [a, b] of pts) y.lineTo(a, b);
  y.strokeStyle = `rgba(160,192,255,${0.75 * (o.a ?? 1)})`; y.lineWidth = 2.4; y.shadowColor = "rgba(160,192,255,0.7)"; y.shadowBlur = 10; y.stroke(); y.shadowBlur = 0; y.stroke();
  y.beginPath(); for (const [a, b] of pts) y.lineTo(a, b + 18 + 6 * Math.sin(a * 0.02 + t)); y.strokeStyle = `rgba(160,192,255,${0.25 * (o.a ?? 1)})`; y.lineWidth = 1.4; y.stroke();
  y.restore();
}
// pessoa de pé dentro do barco (u ao longo do barco); o casco desenhado depois esconde as pernas
function JT_dentro(x, t, g, u, tipo, pose, o = {}) {
  const [px, py] = g.P(u, 0.07), H = (o.H ?? 0.4) * g.L;
  return personagem(x, t, pose, { tipo, x: px, chao: py, H, dir: o.dir ?? 1, rot: g.rot, a: o.a ?? 1, cor: o.cor, fase: o.fase ?? 0 });
}
// respingos das ondas por cima da borda
function JT_respingo(nv, i, t, g, f) {
  if (f < 0.01) return i;
  for (const [u, v, s] of JT_GOTAS) { const ph = (t * (0.9 + 0.8 * s) + v) % 1, [bx, by] = g.P(u * 0.48, -0.04), h = Math.sin(Math.PI * ph) * (0.12 + 0.2 * s) * g.L; nv.ponto(i++, bx + (ph - 0.5) * 60 * (u > 0 ? 1 : -1), by - h, 0.75, 0.85, 1, 0.5 * f * (1 - ph), 2 + 3 * s); }
  return i;
}
const JT_MEDO = { tronco: 0.08, cabeca: -0.3, braco: [[1.9, 1.5], [2.1, 1.4]], perna: [[-0.1, 0], [0.12, 0]] };
const JT_MASTRO = { tronco: 0.05, cabeca: -0.2, braco: [[0.4, 0.6], [2.75, 0.1]], perna: [[-0.15, 0], [0.18, 0]] };
const JT_BALDE = (t) => ({ tronco: 0.55 + 0.15 * Math.sin(t * 4), cabeca: 0.4, braco: [[0.5 + 0.4 * Math.sin(t * 4), 0.3], [0.7 + 0.4 * Math.sin(t * 4), 0.2]], perna: [[-0.3, -0.4], [0.35, -0.5]] });
const JT_DORME = { tronco: 0, cabeca: 0.08, braco: [[0.08, 0.12], [0.14, 0.18]], perna: [[0.04, 0], [-0.04, 0]] };

// =============== 1. abertura: o barco no meio da tempestade (Jesus ainda não aparece) ===============
CENAS.abertura = (el, c, B) => {
  const tB = B("barco"), tH = B("historia"), tL = B("laco");
  mostrarGancho(tH + 0.3);
  const TV = telaGPU(el, c, JT_FUNDO), nv = TV.nuvem(60000), raios = [0.2, tB - 0.05, tL - 0.1];
  const CAM = cameraProf([[0, { x: 620, y: 1060, zoom: 1.25 }], [c.fim + 0.5, { x: 600, y: 1020, zoom: 1.05 }]]);
  TV.quadro((x, t) => {
    const fl = JT_flash(t, raios), [tx, ty] = FIS.tremor(t, tB, 14), cam0 = CAM(t), cam = { ...cam0, x: cam0.x + tx, y: cam0.y + ty };
    let i = JT_ceu(nv, x, 0, t, cam, { flash: fl, chuva: 1 });
    i = JT_mar(nv, i, t, cam, 1);
    const g = JT_geo(cam, t, 1, { X: 600 });
    JT_dentro(x, t, g, -0.05, "homem", JT_MASTRO, { fase: 5 });
    JT_dentro(x, t, g, 0.24, "pessoa", JT_MEDO, { fase: 2, dir: -1 });
    JT_dentro(x, t, g, -0.28, "homem", JT_BALDE(t), { fase: 6 });
    JT_barco(x, g);
    JT_agua(x, g, t, 1);
    i = JT_respingo(nv, i, t, g, 1);
    nv.total(i);
  });
};

// =============== 2. a partida: fim de tarde, mar calmo; "vamos para o outro lado" ===============
CENAS.partida = (el, c, B) => {
  const tG = B("galileia"), tLa = B("lado"), tE = B("entram"), tp = tempoPalavras(c), tV = tp("vamos");
  mostrarVersiculo("Vamos para o outro lado.", "cf. Marcos 4:35", tV - 0.3, c.fim + 0.3, { y: 420, tam: 72, destaque: ["outro", "lado."] });
  const TV = telaGPU(el, c, JT_FUNDO), nv = TV.nuvem(60000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1000, zoom: 0.95 }], [tLa, { x: 560, y: 1060, zoom: 1.1 }], [c.fim + 0.5, { x: 600, y: 1060, zoom: 1.15 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), aponta = PT.ss((t - tLa + 0.6) / 0.6), entra = (k) => PT.ss((t - tE + 0.8 - k * 0.25) / 0.6);
    let i = JT_ceu(nv, x, 0, t, cam, { sol: 1, nuvem: 0.4 });
    i = JT_mar(nv, i, t, cam, 0.12, 0.3);
    // as luzes da outra margem, no horizonte à direita
    for (let k = 0; k < 7; k++) { const [lx, ly] = projP(cam, 1150 + k * 60, 1150, 3.2); brilhoP(x, lx, ly - 4, 26, LUZS.ambar, 0.4 + 0.3 * aponta); discoP(x, lx, ly - 4, 2.5, "255,230,180", 1); }
    const g = JT_geo(cam, t, 0.12, { X: 520 });
    if (entra(0) > 0.01) JT_dentro(x, t, g, -0.1, "homem", POSES.de_pe, { fase: 5, a: entra(0), dir: 1 });
    if (entra(1) > 0.01) JT_dentro(x, t, g, 0.08, "pessoa", POSES.de_pe, { fase: 2, a: entra(1), dir: 1 });
    JT_dentro(x, t, g, 0.33, "jesus", poseMix(POSES.de_pe, { ...POSES.de_pe, cabeca: -0.1, braco: [[-0.25, 0.3], [1.55, 0.05]] }, aponta), { fase: 3, dir: 1, H: 0.43 });
    JT_barco(x, g);
    JT_agua(x, g, t, 0.12);
    nv.total(i);
  });
};

// =============== 3. a tempestade: vento, ondas por cima, o barco enchendo; pescadores com medo ===============
CENAS.tempestade = (el, c, B) => {
  const tV = B("vento"), tA = B("agua"), tP = B("pescadores"), tM = B("medo");
  const TV = telaGPU(el, c, JT_FUNDO), nv = TV.nuvem(70000), raios = [tV - 0.1, tM - 0.05];
  const CAM = cameraProf([[c.ini, { x: 620, y: 1060, zoom: 1.0 }], [tA, { x: 660, y: 1080, zoom: 1.15 }], [c.fim + 0.5, { x: 680, y: 1060, zoom: 1.25 }]]);
  TV.quadro((x, t) => {
    const agit = 0.15 + 0.85 * PT.ss((t - tV + 1.6) / 1.8), chuva = PT.ss((t - tV + 1.0) / 1.0), enche = PT.ss((t - tA + 0.5) / 1.2), fl = JT_flash(t, raios), [tx, ty] = FIS.tremor(t, tM, 18), cam0 = CAM(t), cam = { ...cam0, x: cam0.x + tx, y: cam0.y + ty };
    let i = JT_ceu(nv, x, 0, t, cam, { flash: fl, chuva, nuvem: 0.3 + 0.7 * agit, sol: 0.4 * (1 - agit) });
    i = JT_mar(nv, i, t, cam, agit);
    const g = JT_geo(cam, t, agit, { X: 600, afunda: enche });
    JT_dentro(x, t, g, -0.05, "homem", poseMix(POSES.de_pe, JT_MASTRO, agit), { fase: 5 });
    JT_dentro(x, t, g, 0.24, "pessoa", poseMix(POSES.de_pe, JT_MEDO, PT.ss((t - tM + 0.5) / 0.5)), { fase: 2, dir: -1 });
    JT_dentro(x, t, g, -0.28, "homem", poseMix(POSES.de_pe, JT_BALDE(t), enche), { fase: 6 });
    JT_barco(x, g);
    JT_agua(x, g, t, agit);
    i = JT_respingo(nv, i, t, g, PT.ss((t - tA + 0.9) / 0.6));
    const pe = PT.jan(t, tP - 0.3, tM - 0.2, 0.3, 0.4); if (pe > 0.01) rotuloP(x, "ERAM PESCADORES", 540, 420, 50, "255,236,200", pe, "center");
    nv.total(i);
  });
};

// =============== 4. dormindo: "E Jesus? Adivinha." — na popa, sobre uma almofada ===============
CENAS.dormindo = (el, c, B) => {
  const tA = B("adivinha"), tD = B("dormindo"), tM = B("mestre");
  mostrarVersiculo("Mestre, não te importa que pereçamos?", "cf. Marcos 4:38", tM - 0.2, c.fim + 0.3, { y: 420, tam: 64, destaque: ["mestre,"] });
  const TV = telaGPU(el, c, JT_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 700, y: 1060, zoom: 1.2 }], [tA + 0.3, { x: 560, y: 1080, zoom: 1.15 }], [tD, { x: 330, y: 1120, zoom: 1.55 }], [tM - 0.1, { x: 360, y: 1110, zoom: 1.5 }], [c.fim + 0.5, { x: 380, y: 1100, zoom: 1.45 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), luz = PT.ss((t - tD + 0.5) / 0.8), acorda = PT.ss((t - tM + 0.3) / 0.5), fl = JT_flash(t, [c.ini + 0.3]);
    let i = JT_ceu(nv, x, 0, t, cam, { flash: fl, chuva: 1 });
    i = JT_mar(nv, i, t, cam, 1);
    const g = JT_geo(cam, t, 0.8, { X: 600 });
    // uma luz quente e calma em volta dele, no meio da tempestade
    const [jx, jy] = g.P(-0.26, -0.12); brilhoP(x, jx, jy, 0.5 * g.L * (0.4 + 0.6 * luz), LUZS.ambar, 0.12 + 0.3 * luz);
    JT_dentro(x, t, g, 0.36, "homem", JT_MASTRO, { fase: 5, dir: -1 });
    JT_dentro(x, t, g, 0.2, "pessoa", JT_MEDO, { fase: 2, dir: -1 });
    // o discípulo que vai acordá-lo
    JT_dentro(x, t, g, 0.02, "homem", poseMix(JT_MEDO, { tronco: 0.35, cabeca: 0.3, braco: [[0.9, 0.3], [1.25, 0.2]], perna: [[-0.2, 0], [0.25, -0.1]] }, acorda), { fase: 6, dir: -1 });
    // Jesus deitado na popa, dormindo sobre a almofada (sem rosto)
    const [fx, fy] = g.P(-0.08, -0.07), H = 0.36 * g.L;
    personagem(x, t, { ...JT_DORME, cabeca: JT_DORME.cabeca + 0.15 * acorda }, { tipo: "jesus", x: fx, chao: fy, H, dir: 1, rot: g.rot - Math.PI / 2 + 0.08, fase: 3, vida: false, a: 0.06 + 0.94 * luz,
      atras: (y, f) => { const [hx, hy] = f.cabeca, r = 0.07 * H; JT_traco(y, [[hx - r * 1.2, hy + r * 0.2], [hx - r * 0.2, hy + r * 0.05], [hx + r * 1.1, hy + r * 0.3], [hx + r * 1.2, hy + r * 0.85], [hx, hy + r * 1.0], [hx - r * 1.25, hy + r * 0.8]], true, "255,214,140", Math.max(1.5, 0.006 * H), 1); } });
    JT_barco(x, g, { mastro: false });
    JT_agua(x, g, t, 0.8);
    i = JT_respingo(nv, i, t, g, 0.8);
    nv.total(i);
  });
};

// =============== 5. o milagre: "Cala-te, aquieta-te." — o vento para, grande bonança ===============
CENAS.milagre = (el, c, B) => {
  const tR = B("repreende"), tC = B("calate"), tB = B("bonanca"), tp = tempoPalavras(c), tCa = tp("cala-te,");
  mostrarVersiculo("Cala-te, aquieta-te.", "Marcos 4:39", tCa - 0.3, c.fim + 0.3, { y: 420, tam: 84, destaque: ["cala-te,", "aquieta-te."] });
  const TV = telaGPU(el, c, JT_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 600, y: 1080, zoom: 1.3 }], [tC, { x: 580, y: 1060, zoom: 1.15 }], [c.fim + 0.5, { x: 560, y: 1020, zoom: 0.95 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), calma = PT.ss((t - tC + 0.2) / 1.4), agit = 1 - calma, lua = PT.ss((t - tB + 0.8) / 1.2), ergue = PT.ss((t - c.ini) / 0.8), mao = PT.ss((t - tR + 0.4) / 0.5);
    let i = JT_ceu(nv, x, 0, t, cam, { chuva: agit, nuvem: 0.3 + 0.7 * agit, abre: calma, lua });
    i = JT_mar(nv, i, t, cam, agit, 0.6 * lua);
    const g = JT_geo(cam, t, agit, { X: 600 });
    // uma onda de calma sai da mão dele e corre pelo mar
    const [hx0, hy0] = g.P(0.36, -0.42); if (calma > 0.01 && calma < 0.99) { const R = 120 + 900 * calma; anelP(x, hx0, hy0 + 140, R, LUZS.luz, 0.5 * (1 - calma), 3); }
    JT_dentro(x, t, g, -0.25, "homem", poseMix(JT_MEDO, { ...POSES.de_pe, cabeca: -0.2 }, calma), { fase: 5 });
    JT_dentro(x, t, g, 0.0, "pessoa", poseMix(JT_MEDO, { ...POSES.de_pe, cabeca: -0.15 }, calma), { fase: 2 });
    const J = JT_dentro(x, t, g, 0.32, "jesus", poseMix(poseMix({ ...POSES.de_pe, tronco: 0.2 }, POSES.de_pe, ergue), { ...POSES.de_pe, tronco: -0.04, cabeca: -0.1, braco: [[-0.3, 0.3], [1.85, 0.05]] }, mao), { fase: 3, dir: 1, H: 0.44 });
    brilhoP(x, J.maos[1][0], J.maos[1][1], 90 + 160 * calma, LUZS.luz, 0.3 * mao);
    JT_barco(x, g);
    JT_agua(x, g, t, agit);
    i = JT_respingo(nv, i, t, g, agit);
    nv.total(i);
  });
};

// =============== 6. o detalhe: a primeira frase — "vamos para o outro lado" ===============
CENAS.detalhe = (el, c, B) => {
  const tD = B("detalhe"), tL = B("lado2"), tA = B("afundar");
  const TV = telaGPU(el, c, JT_FUNDO), nv = TV.nuvem(60000);
  const tx = palcoTexto(el, [["jt-1", 380, 66, "Ele disse:<br><b>vamos para o outro lado.</b>", "lp-q", ""], ["jt-2", 560, 54, "Não disse: vamos afundar no meio.", "lp-q", ""]]);
  tl.set([tx["jt-1"], tx["jt-2"]], { opacity: 0 }, 0);
  tl.fromTo(tx["jt-1"], { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out", immediateRender: false }, tL - 0.9);
  tl.fromTo(tx["jt-2"], { opacity: 0, y: 16, filter: "blur(8px)" }, { opacity: 0.85, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out", immediateRender: false }, tA - 0.4);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1000, zoom: 0.9 }], [c.fim + 0.5, { x: 600, y: 990, zoom: 0.85 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), rota = PT.ss((t - tL + 0.6) / 1.6);
    let i = JT_ceu(nv, x, 0, t, cam, { lua: 1, nuvem: 0.2, abre: 1 });
    i = JT_mar(nv, i, t, cam, 0.08, 0.5);
    for (let k = 0; k < 8; k++) { const [lx, ly] = projP(cam, 1150 + k * 60, 1150, 3.2); brilhoP(x, lx, ly - 4, 26, LUZS.ambar, 0.4 + 0.4 * rota); discoP(x, lx, ly - 4, 2.5, "255,230,180", 1); }
    const g = JT_geo(cam, t, 0.08, { X: 360, Y: 1200, L: 420 });
    // o caminho de luz do barco até a outra margem
    if (rota > 0.01) { const [b0x, b0y] = g.P(0.5, 0.0), [fx, fy] = projP(cam, 1300, 1150, 3.2); for (let k = 0; k < 60; k++) { const u = k / 59; if (u > rota) break; const px = PT.lerp(b0x, fx, u), py = PT.lerp(b0y, fy - 4, u) - Math.sin(u * Math.PI) * 40; discoP(x, px, py, 3 * (1 - 0.6 * u), LUZS.luz, 0.8 * (1 - 0.5 * u)); } }
    JT_dentro(x, t, g, 0.3, "jesus", { ...POSES.de_pe, braco: [[-0.25, 0.3], [1.5, 0.05]] }, { fase: 3, dir: 1, H: 0.44 });
    JT_dentro(x, t, g, -0.1, "homem", POSES.de_pe, { fase: 5 });
    JT_barco(x, g);
    JT_agua(x, g, t, 0.08, { nivel: 0.06, fundo: 0.55 });
    nv.total(i);
  });
};

// =============== 7. para você: a tempestade é real, mas ele está no barco com você ===============
CENAS.sentido = (el, c, B) => {
  const tR = B("real"), tA = B("antes"), tV = B("vento2");
  const TV = telaGPU(el, c, JT_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 560, y: 1080, zoom: 1.35 }], [c.fim + 0.5, { x: 560, y: 1060, zoom: 1.2 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), luz = PT.ss((t - tA + 0.5) / 1.0), acalma = PT.ss((t - tV + 0.6) / 1.2), agit = 0.9 - 0.6 * acalma, fl = JT_flash(t, [tR - 0.1]);
    let i = JT_ceu(nv, x, 0, t, cam, { flash: fl, chuva: 1 - 0.8 * acalma, nuvem: 1 - 0.5 * acalma });
    i = JT_mar(nv, i, t, cam, agit, 0.4 * luz);
    const g = JT_geo(cam, t, agit, { X: 560, L: 640 });
    const [lx, ly] = g.P(0.0, -0.25); brilhoP(x, lx, ly, 0.6 * g.L * (0.3 + 0.7 * luz), LUZS.ambar, 0.08 + 0.3 * luz);
    // você, com medo; ele, de pé ao seu lado, com a mão no seu ombro
    JT_dentro(x, t, g, -0.12, "pessoa", poseMix(JT_MEDO, { ...POSES.de_pe, cabeca: -0.3 }, luz), { fase: 2, dir: 1, cor: mixCor([0.85, 0.88, 1], [1, 0.86, 0.55], luz) });
    JT_dentro(x, t, g, 0.12, "jesus", { ...POSES.de_pe, tronco: 0.06, cabeca: 0.15, braco: [[-0.25, 0.3], [1.3 * luz + 0.2, 0.6 - 0.4 * luz]] }, { fase: 3, dir: -1, H: 0.44, a: 0.4 + 0.6 * luz });
    JT_barco(x, g);
    JT_agua(x, g, t, agit);
    i = JT_respingo(nv, i, t, g, agit);
    nv.total(i);
  });
};

// =============== 8. pergunta (uma só) e 9. fim (emenda no começo) ===============
CENAS.pergunta = (el, c, B) => cenaPergunta(el, c, B, { texto: "Se Jesus estivesse no seu barco agora, o que você pediria pra ele <b>acalmar</b>?", sub: "Escreve nos comentários", icone: "sailboat", seed: 171, tam: 66, alturaTexto: 320 });
CENAS.fim = (el, c, B) => cartaoFinal(el, c.ini + 0.05);
