// Cenas do vídeo "Não temas" (Isaías 41:10, Almeida) — Luz da Palavra, pontos de luz na GPU.
// Retenção: quadro 0 = mar em tempestade à noite, um veleiro (você) e um relâmpago; gancho emocional;
// laço aberto ("repara na última frase") pago em "eu te sustento com a destra"; os medos trocam a cada
// ~1,5 s; a tempestade acalma na palavra; a mão de luz sobe do mar e segura o barco; pergunta única.
// Texto conferido na Almeida (ARC): "Não temas, porque eu sou contigo; não te assombres, porque eu sou
// o teu Deus; eu te esforço, e te ajudo, e te sustento com a destra da minha justiça."

const NT_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.8) };
const NT_EST = fundoProfundo(81, 520);
const NT_MAO = { desenho: (g, R) => {
  g.beginPath(); g.moveTo(R * 0.06, R * 0.6); g.bezierCurveTo(R * 0.2, R * 0.58, R * 0.3, R * 0.6, R * 0.36, R * 0.58);
  g.bezierCurveTo(R * 0.5, R * 0.54, R * 0.62, R * 0.56, R * 0.72, R * 0.54); g.bezierCurveTo(R * 0.8, R * 0.52, R * 0.86, R * 0.46, R * 0.9, R * 0.38);
  g.bezierCurveTo(R * 0.93, R * 0.33, R * 0.98, R * 0.35, R * 0.96, R * 0.43); g.bezierCurveTo(R * 0.93, R * 0.56, R * 0.86, R * 0.67, R * 0.74, R * 0.72);
  g.bezierCurveTo(R * 0.6, R * 0.78, R * 0.4, R * 0.78, R * 0.3, R * 0.76); g.bezierCurveTo(R * 0.2, R * 0.74, R * 0.12, R * 0.74, R * 0.06, R * 0.76); g.closePath(); g.fill();
  g.lineCap = "round"; g.strokeStyle = "#fff"; g.lineWidth = R * 0.07; g.beginPath(); g.moveTo(R * 0.36, R * 0.6); g.bezierCurveTo(R * 0.37, R * 0.53, R * 0.4, R * 0.5, R * 0.45, R * 0.49); g.stroke();
  g.globalCompositeOperation = "destination-out"; g.lineWidth = R * 0.012;
  for (const k of [0, 1, 2]) { g.beginPath(); g.moveTo(R * (0.74 + k * 0.05), R * (0.58 - k * 0.035)); g.lineTo(R * (0.86 + k * 0.03), R * (0.56 - k * 0.05)); g.stroke(); }
  g.globalCompositeOperation = "source-over";
} };
const NT_F = {
  barco: formaPontos("sailboat", 9000), mao: formaPontos(NT_MAO, 13000, { espessura: 0.06 }), po: poeiraForma(13000, 83, 0.9),
  lua: formaPontos("moon", 4000),
  medos: [formaPontos("hourglass-medium", 9000), formaPontos("receipt", 9000), formaPontos("heartbeat", 9000), formaPontos("user", 9000)],
};
const NT_MEDOS_TXT = ["O FUTURO", "AS CONTAS", "O EXAME", "A SOLIDÃO"];
// nuvens: blocos de pontos em 3 camadas; chuva: riscos; relâmpago: linha em zigue-zague
const NT_NUV = (() => { const r = prng(85), L = []; for (let b = 0; b < 9; b++) { const bx = -200 + b * 190 + r() * 80, by = 330 + r() * 340, bz = 2.2 + r() * 1.4, rw = 220 + r() * 160, rh = 70 + r() * 50; for (let k = 0; k < 420; k++) { const a = r() * 6.283, d = Math.sqrt(r()); L.push([bx + Math.cos(a) * rw * d, by + Math.sin(a) * rh * d, bz, r()]); } } return L; })();
const NT_CHUVA = (() => { const r = prng(87); return Array.from({ length: 420 }, () => [r(), r(), 0.6 + 0.8 * r()]); })();
const NT_RAIO = (() => { const r = prng(89), P = [[300, 330]]; for (let k = 0; k < 14; k++) { const [x, y] = P[P.length - 1]; P.push([x + (r() - 0.55) * 90, y + 55 + r() * 30]); } return P; })();
// mar: linhas em profundidade (horizonte ~1020 na tela); agit 0–1 = tamanho das ondas
function NT_mar(nv, i, t, cam, agit, luz = 0, a = 1) {
  for (let r = 0; r < 28 && i < nv.n; r++) {
    const prof = r / 27, z = 3.2 - 2.4 * prof, Y = 1150 + 260 * Math.pow(prof, 1.5), meia = (560 * z) / cam.zoom + 60, n = 60 + r * 3;
    for (let k = 0; k <= n && i < nv.n; k++) {
      const X = cam.x - meia + (2 * meia * k) / n + (r % 2) * meia / n, onda = Math.sin(X * 0.01 + t * (1.2 + 1.6 * agit) + r * 0.8) * (6 + 46 * agit) + Math.sin(X * 0.023 - t * 2.1 + r) * 14 * agit;
      const [sx, sy, kk] = projP(cam, X, Y + onda, z), crista = Math.max(0, Math.sin(X * 0.01 + t * (1.2 + 1.6 * agit) + r * 0.8));
      const refl = luz * Math.exp(-Math.pow((sx - 540) / (70 + 220 * prof), 2)), c = mixCor([0.35, 0.48, 0.85], LUZ.luz, Math.min(1, refl + 0.3 * crista * agit));
      nv.ponto(i++, sx, sy, c[0], c[1], c[2], a * (0.08 + 0.16 * (1 - prof) + 0.12 * crista * agit + 0.55 * refl), 2 + 3 * prof * kk);
    }
  }
  return i;
}
function NT_ceu(nv, x, i, t, cam, st) {
  const fl = st.flash || 0;
  i = desenharFundo(nv, NT_EST, t, cam, LUZ.luz, 0.35 + 0.6 * (st.lua || 0), i);
  for (const [nx, ny, nz, v] of NT_NUV) { if (i >= nv.n) break; const [sx, sy, k] = projP(cam, nx + t * 18 / nz - 900 * (st.abre || 0) * Math.sign(nx - 540 || 1) * 0.4, ny, nz); nv.ponto(i++, sx, sy, 0.55 + 0.4 * fl, 0.6 + 0.4 * fl, 0.78 + 0.2 * fl, (st.nuvem ?? 1) * (0.06 + 0.06 * v + 0.35 * fl), 4 + 5 * k); }
  if ((st.lua || 0) > 0.01) { const [mx, my, k] = projP(cam, 760, 420, 2.4); brilhoP(x, mx, my, 360 * k, "190,210,255", 0.25 * st.lua); i = desenharForma(nv, NT_F.lua, { cx: mx, cy: my, esc: 150 * k * 2.4 / 2.4, cor: [0.92, 0.94, 1], a: st.lua, t, i0: i }); }
  if (fl > 0.02) { brilhoP(x, 320, 500, 1100, "200,215,255", 0.35 * fl); for (let k = 1; k < NT_RAIO.length; k++) { const [a0, b0] = NT_RAIO[k - 1], [a1, b1] = NT_RAIO[k]; linhaP(x, a0, b0, a1, b1, "235,240,255", fl, 6 - k * 0.3); } }
  const ch = st.chuva || 0;
  if (ch > 0.01) for (const [u, v, s] of NT_CHUVA) { const yy = ((v * 2000 + t * 1500 * s) % 2000) - 40, xx = ((u * 1300 - t * 260 * s) % 1300 + 1300) % 1300 - 100; linhaP(x, xx, yy, xx - 10 * s, yy + 36 * s, "190,205,240", 0.22 * ch * s, 1.6); }
  return i;
}
const NT_flash = (t, ts) => ts.reduce((m, tf) => Math.max(m, t >= tf ? Math.exp(-(t - tf) * 9) * (0.6 + 0.4 * Math.abs(Math.sin((t - tf) * 60))) : 0), 0);
// o veleiro balança com as ondas (agit) e fica firme quando está na mão (firme 0–1)
function NT_barco(nv, x, i, t, cam, agit, firme = 0, o = {}) {
  const bal = (1 - firme) * agit, cx = o.cx ?? 540, cy = (o.cy ?? 1120) + Math.sin(t * 1.9) * 26 * bal, rot = Math.sin(t * 1.5) * 0.22 * bal + 0.06 * Math.sin(t * 0.7) * (1 - firme);
  const [sx, sy, k] = projP(cam, cx, cy, 1);
  brilhoP(x, sx, sy, 160 * k, firme > 0 ? LUZS.ambar : "180,200,255", 0.18 + 0.3 * firme);
  return desenharForma(nv, NT_F.barco, { cx: sx, cy: sy, esc: (o.esc ?? 230) * k, rot, cor: mixCor([0.8, 0.86, 1], LUZ.luz, firme), borda: [1, 1, 1], brilho: 0.9 + 0.3 * firme, a: o.a ?? 1, t, i0: i });
}

// =============== 1. abertura: tempestade, o veleiro, relâmpago no "medo" ===============
CENAS.abertura = (el, c, B) => {
  const tM = B("medo"), tV = B("versiculo"), tL = B("laco");
  mostrarGancho(tV + 0.3);
  const TV = telaGPU(el, c, NT_FUNDO), nv = TV.nuvem(60000), raios = [0.25, tM - 0.05, tL - 0.1];
  const CAM = cameraProf([[0, { x: 560, y: 1060, zoom: 1.5 }], [tV + 0.5, { x: 540, y: 980, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 990, zoom: 1.05 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), [dx, dy] = FIS.tremor(t, tM, 8), cm = { ...cam, x: cam.x + dx, y: cam.y + dy };
    let i = NT_ceu(nv, x, 0, t, cm, { flash: NT_flash(t, raios), chuva: 1, nuvem: 1 });
    i = NT_mar(nv, i, t, cm, 1, 0.08);
    i = NT_barco(nv, x, i, t, cm, 1, 0);
    nv.total(i);
  });
};

// =============== 2. os medos: cada um vira o próximo no céu da tempestade ===============
CENAS.medos = (el, c, B) => {
  const ts = ["m1", "m2", "m3", "m4"].map((e) => B(e));
  const TV = telaGPU(el, c, NT_FUNDO), nv = TV.nuvem(70000), raios = [ts[3] - 0.1];
  const CAM = cameraProf([[c.ini, { x: 540, y: 990, zoom: 1.05 }], [c.fim + 0.5, { x: 540, y: 960, zoom: 1.15 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t);
    let i = NT_ceu(nv, x, 0, t, cam, { flash: NT_flash(t, raios), chuva: 0.9, nuvem: 1 });
    i = NT_mar(nv, i, t, cam, 0.9, 0.05);
    i = NT_barco(nv, x, i, t, cam, 0.9, 0);
    // o medo da vez, no céu (troca com transformação na palavra); o último fica pequeno e sozinho
    let k = 0; while (k + 1 < ts.length && t >= ts[k + 1] - 0.45) k++;
    const cfg = (j) => ({ cx: 540, cy: 640, esc: j === 3 ? 240 : 330, cor: [0.8, 0.86, 1], borda: [1, 1, 1], brilho: 0.85, giro: 0.15 * Math.sin(t * 0.8) });
    const u = k > 0 ? PT.cl((t - ts[k] + 0.45) / 0.8) : 1, ap = FIS.chegar(t, ts[0] - 0.5, 0.6);
    if (k > 0 && u < 1) i = morfo(nv, NT_F.medos[k - 1], NT_F.medos[k], u, { de: cfg(k - 1), para: cfg(k), t, onda: 0.3, curva: 0.4, i0: i });
    else i = desenharForma(nv, NT_F.medos[k], { ...cfg(k), esc: cfg(k).esc * Math.min(1, Math.max(0.01, ap)), a: Math.min(1, ap), t, i0: i });
    brilhoP(x, 540, 640, 300, "160,180,255", 0.12);
    rotuloP(x, NT_MEDOS_TXT[k], 540, 860, 54, "225,232,255", PT.ss((t - ts[k] + 0.2) / 0.3) * (k === 3 ? 1 : 1 - PT.ss((t - ts[k + 1] + 0.5) / 0.2)));
    nv.total(i);
  });
};

// =============== 3. o versículo: a tempestade acalma, as nuvens abrem, a lua aparece ===============
CENAS.versiculo = (el, c, B) => {
  const tT = B("temas"), tC = B("contigo"), tD = B("deus"), tp = tempoPalavras(c);
  const pal = ["não", "temas", "porque", "eu", "sou", "contigo", "não", "te", "assombres", "porque", "eu", "sou", "o", "teu", "deus"], cont = { deus: 1 };  // o 1º "Deus" é o de "Deus disse"
  const tempos = pal.map((w) => { const n = cont[w] || 0; cont[w] = n + 1; return tp(w, n); });
  mostrarVersiculo("Não temas, porque eu sou contigo; não te assombres, porque eu sou o teu Deus.", "Isaías 41:10", tempos[0] - 0.3, c.fim + 0.3, { y: 400, tam: 62, destaque: ["temas", "contigo"], tempos });
  const TV = telaGPU(el, c, NT_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 960, zoom: 1.15 }], [tC, { x: 540, y: 990, zoom: 1.05 }], [c.fim + 0.5, { x: 540, y: 1010, zoom: 1.12 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), calma = PT.ss((t - tT + 0.3) / 2.2), abre = PT.ss((t - tC + 0.2) / 1.6), lua = PT.ss((t - tC) / 1.4);
    let i = NT_ceu(nv, x, 0, t, cam, { chuva: 0.9 * (1 - calma), nuvem: 1 - 0.6 * abre, abre, lua });
    i = NT_mar(nv, i, t, cam, 0.9 * (1 - 0.8 * calma), 0.05 + 0.6 * lua);
    i = NT_barco(nv, x, i, t, cam, 0.9 * (1 - 0.8 * calma), 0.2 * lua);
    nv.total(i);
  });
};

// =============== 4. "eu te sustento com a destra": a mão de luz sobe do mar e segura o barco ===============
const NT_MAOC = { cx: 540, cy: 1185, esc: 820 };
CENAS.detalhe = (el, c, B) => {
  const tS = B("sustento"), tDe = B("destra"), tF = B("forca");
  const TV = telaGPU(el, c, NT_FUNDO), nv = TV.nuvem(80000);
  mostrarVersiculo("…e te sustento com a destra da minha justiça.", "Isaías 41:10", tS - 0.3, tDe - 0.1, { y: 400, tam: 66, destaque: ["sustento", "destra"] });
  const tx = palcoTexto(el, [["nt-d", 380, 92, "DESTRA = <span style='color:#ffe3a3'>MÃO DIREITA</span>", "", "font-family:'Cinzel',serif;font-weight:700;letter-spacing:0.04em;font-size:64px;"]]);
  tl.set(tx["nt-d"], { opacity: 0 }, 0);
  tl.fromTo(tx["nt-d"], { opacity: 0, scale: 1.2, filter: "blur(8px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.7, ease: "power3.out", immediateRender: false }, tDe + 0.35);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1010, zoom: 1.12 }], [tS + 0.8, { x: 540, y: 1060, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 1080, zoom: 1.06 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), u = PT.ss((t - tS + 0.2) / 1.6), forca = PT.ss((t - tF + 0.3) / 0.8);
    let i = NT_ceu(nv, x, 0, t, cam, { nuvem: 0.4, abre: 1, lua: 1 });
    i = NT_mar(nv, i, t, cam, 0.3, 0.6 + 0.3 * u);
    // a mão: os pontos sobem do mar e se juntam embaixo do barco
    const [hx, hy, hk] = projP(cam, NT_MAOC.cx, NT_MAOC.cy, 1);
    if (u > 0) { brilhoP(x, hx, hy - 40, (380 + 160 * forca) * hk, LUZS.ambar, (0.25 + 0.15 * forca) * u); i = morfo(nv, NT_F.po, NT_F.mao, u, { de: { cx: hx, cy: hy + 260 * hk, esc: 1100 * hk, cor: [0.45, 0.6, 1], a: 0.35 }, para: { cx: hx, cy: hy, esc: NT_MAOC.esc * hk * FIS.respira(t, 0, 0.01), cor: LUZ.ouro, borda: LUZ.luz, brilho: 0.9 + 0.3 * forca }, t, onda: 0.35, curva: 0.4, sobe: 120, i0: i }); }
    // o barco sobe junto e fica firme na palma
    const sobe = PT.ss((t - tS) / 1.6);
    i = NT_barco(nv, x, i, t, cam, 0.3, sobe, { cy: PT.lerp(1120, 1050, sobe) });
    nv.total(i);
  });
};

// =============== 5. para você: a tempestade continua em volta, mas o barco está seguro na mão ===============
CENAS.sentido = (el, c, B) => {
  const tT = B("tempestade"), tS = B("segurar");
  const TV = telaGPU(el, c, NT_FUNDO), nv = TV.nuvem(80000);
  const tx = palcoTexto(el, [["nt-s", 360, 66, "Ele não promete tirar a tempestade.<br><b>Promete te segurar nela.</b>", "lp-q", ""]]);
  tl.set(tx["nt-s"], { opacity: 0 }, 0);
  tl.fromTo(tx["nt-s"], { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", immediateRender: false }, tT - 0.6);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1080, zoom: 1.06 }], [tS, { x: 540, y: 1010, zoom: 0.92 }], [c.fim + 0.5, { x: 540, y: 1040, zoom: 1.0 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), volta = PT.ss((t - tT + 0.2) / 1.0), seg = PT.ss((t - tS + 0.2) / 0.8);
    let i = NT_ceu(nv, x, 0, t, cam, { flash: NT_flash(t, [tT + 0.1]), chuva: 0.8 * volta, nuvem: 0.4 + 0.6 * volta, abre: 1 - volta, lua: 1 - volta });
    i = NT_mar(nv, i, t, cam, 0.3 + 0.6 * volta, 0.6);
    const [hx, hy, hk] = projP(cam, NT_MAOC.cx, NT_MAOC.cy, 1);
    brilhoP(x, hx, hy - 40, (520 + 200 * seg) * hk, LUZS.ambar, 0.35 + 0.2 * seg);
    i = desenharForma(nv, NT_F.mao, { cx: hx, cy: hy, esc: NT_MAOC.esc * hk * FIS.respira(t, 0, 0.01), cor: LUZ.ouro, borda: LUZ.luz, brilho: 1.1 + 0.3 * seg, t, i0: i });
    i = NT_barco(nv, x, i, t, cam, 0.9, 1, { cy: 1050 });
    nv.total(i);
  });
};

// =============== 6. pergunta (uma só) e 7. fim (emenda no começo) ===============
// a mão (que no fim da cena anterior está em ~(540, 1185) na tela) vira o ícone da pergunta
CENAS.pergunta = (el, c, B) => cenaPergunta(el, c, B, { texto: "Qual medo você quer <b>entregar</b> hoje?", sub: "Escreve numa palavra só nos comentários", icone: "hand-heart",
  de: [NT_F.mao, { cx: 540, cy: 1150, esc: 820, cor: LUZ.ouro, borda: LUZ.luz }], seed: 83, alturaTexto: 220 });
CENAS.fim = (el, c, B) => cartaoFinal(el, c.ini + 0.05);
