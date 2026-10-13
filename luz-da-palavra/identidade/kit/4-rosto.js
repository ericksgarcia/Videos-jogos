// Kit de personagens — ROSTO de perfil (olha para x+), desenhado por medidas de ilustração:
// olho na metade da altura da cabeça, nariz com asa e narina, lábios com contorno, queixo e mandíbula,
// orelha com dobras. Traço de pincel (grosso no meio, fino nas pontas) para os detalhes.
// Medidas do rosto (ficha.rosto): { nariz: 0.6–1.3 (tamanho), curva: -1..1 (arrebitado..aquilino),
//   ponta: -1..1 (desce..sobe), labios: 0.7–1.4, queixo: -1..1, testa: -1..1 (reta..inclinada),
//   mandibula: -1..1, olho: 0.8–1.3, sobrancelha: 0.6–1.6 (espessura), feminino, crianca, idade }
// Coordenadas: milésimos de H, origem no topo do pescoço; coroa em y≈-162, frente do rosto em x≈60.

// Estilo de desenho (o.estilo em figura): "linha" (traço de luz, o padrão), "cheio" (cores chapadas com sombra, sem brilho: ilustração
// vetorial) ou "silhueta" (corpo escuro, sem feições; só a luz de contorno do cenário o desenha).
let KIT_ESTILO = "linha";
const kitEsc = (rgb, k) => String(rgb).split(",").map((v) => Math.round(+v * k)).join(",");
// Proporções de Loomis: a cabeça (coroa −162 até o queixo −2) em terços do rosto. Olhos no meio da altura da cabeça,
// sobrancelha logo acima, base do nariz a 1/3 do queixo, boca a 1/3 entre o nariz e o queixo, orelha entre a sobrancelha e
// a base do nariz. Os pontos desenhados à mão (de antes) ficam como estão; esta função remapeia a altura (y) de tudo
// que é do rosto para essas posições: [antes → depois].
const KIT_LOOMIS = [[-170, -170], [-120, -120], [-98, -93], [-86, -84], [-58, -46], [-41, -31], [-2, -2], [8, 8]];
function kitRemap(y) {
  const A = KIT_LOOMIS; if (y <= A[0][0]) return y; if (y >= A[A.length - 1][0]) return y;
  for (let k = 1; k < A.length; k++) if (y <= A[k][0]) { const [a0, b0] = A[k - 1], [a1, b1] = A[k]; return b0 + (b1 - b0) * (y - a0) / (a1 - a0); }
  return y;
}
const kitFace = (poe) => (pts) => poe(pts.map(([px, py]) => [px, kitRemap(py)]));
function kitPerfil(r = {}) {
  const nz = r.nariz ?? 1, cv = r.curva ?? 0, pt = r.ponta ?? 0, lb = r.labios ?? 1, qx = r.queixo ?? 0, ts = r.testa ?? 0, md = r.mandibula ?? 0;
  const N0 = [57, -90]; // raiz do nariz
  const nar = (dx, dy) => [N0[0] + dx * nz, N0[1] + dy * nz];
  return [[-24, 6], [-44, -24], [-60, -66], [-63, -102], [-52, -138], [-22, -160], [12, -163], [40 - 6 * ts, -149], [55 - 5 * ts, -125], [60 - 2 * ts, -101],
    N0, nar(5 + 3 * cv, 13), nar(16, 28 - 3 * pt), nar(13, 33 - 2 * pt), nar(5, 36), [59, -52], [59 + 3 * lb, -46], [58, -41], [58 + 3 * lb, -36], [55, -29 + 1 * qx],
    [59 + 4 * qx, -19], [53 + 3 * qx, -7], [34, -2 + 3 * md], [18, 4]];
}
// traço de pincel: largura máxima no meio e fina nas pontas (pontos já na tela)
function kitPincel(y, pts, w, rgb, a = 1, o = {}) {
  if (pts.length < 2) return;
  if (KIT_ESTILO === "silhueta") return;
  if (KIT_ESTILO === "cheio") { rgb = kitEsc(rgb, 0.45); o = { ...o, brilho: 0 }; a = Math.min(1, a * 1.1); }
  const n = pts.length, g = (k) => pts[Math.max(0, Math.min(n - 1, k))], S = [];
  for (let k = 0; k < n - 1; k++) { const p0 = g(k - 1), p1 = g(k), p2 = g(k + 1), p3 = g(k + 2), c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let j = 0; j < 8; j++) { const u = j / 8, v = 1 - u; S.push([v * v * v * p1[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p2[0], v * v * v * p1[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p2[1]]); } }
  S.push(pts[n - 1]);
  const L = [], R = [], m = S.length, ini = o.ini ?? 0.12, fim = o.fim ?? 0.12;
  for (let k = 0; k < m; k++) { const p = S[Math.max(0, k - 1)], q = S[Math.min(m - 1, k + 1)], dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1, u = k / (m - 1);
    const perf = Math.max(0.12, Math.min(1, Math.sin(Math.PI * u) ** 0.6 + (u < 0.5 ? ini : fim))), ww = w * perf / 2; L.push([S[k][0] - dy / l * ww, S[k][1] + dx / l * ww]); R.push([S[k][0] + dy / l * ww, S[k][1] - dx / l * ww]); }
  y.beginPath(); y.moveTo(L[0][0], L[0][1]); for (const p of L) y.lineTo(p[0], p[1]); for (let k = R.length - 1; k >= 0; k--) y.lineTo(R[k][0], R[k][1]); y.closePath();
  y.fillStyle = `rgba(${rgb},${a})`; y.shadowColor = `rgba(${rgb},0.55)`; y.shadowBlur = o.brilho ?? 6; y.fill(); y.shadowBlur = 0; y.fill();
}
// rosto: olho, pálpebra, sobrancelha, narina, boca, mandíbula, orelha, maçã do rosto e rugas
// expr: neutro | sorri | triste | medo | espanto | dorme | fala
function kitRosto(y, poe, traca, o) {
  const r = o.rosto || {}, fem = !!r.feminino, cri = !!r.crianca, idade = Math.max(o.idade || 0, r.idade || 0), ol = (r.olho ?? 1) * (cri ? 1.18 : 1), sb = (r.sobrancelha ?? 1) * (fem ? 0.7 : 1);
  const W = o.LW, P = o.PELE, pin = (pts, w, al = 1, oo) => kitPincel(y, poe(pts), W * w, P, o.a * al, { brilho: 5 * o.kk, ...oo });
  const ex = o.expr, pisca = ex !== "dorme" && ((o.t + o.fase * 0.37) % 4.3) < 0.12, fechado = ex === "dorme" || pisca;
  const nz = r.nariz ?? 1, N0 = [57, -90], nar = (dx, dy) => [N0[0] + dx * nz, N0[1] + dy * nz];
  // planos de luz (volume): testa, ponte do nariz, maçã do rosto e queixo recebem luz; borrados, só um brilho suave
  { const luz = (pts, al) => { y.save(); y.filter = `blur(${Math.max(2.5, 6 * o.kk * (o.LW / 3))}px)`; y.beginPath(); _curva(y, poe(pts), true); y.fillStyle = `rgba(${P},${al * o.a})`; y.fill(); y.restore(); };
    luz([[38, -138], [52, -122], [56, -104], [50, -100], [38, -108], [30, -124]], 0.11);                        // testa
    luz([[55, -98], [58, -88], [60, -76], [56, -70], [52, -84]], 0.09);                                          // ponte do nariz
    luz([[30, -78], [42, -80], [52, -70], [48, -60], [36, -62], [28, -68]], cri ? 0.07 : 0.1);                  // maçã do rosto
    luz([[48, -30], [57, -26], [56, -14], [46, -8], [38, -14]], 0.08);                                           // queixo
    y.save(); y.filter = `blur(${Math.max(2, 4 * o.kk * (o.LW / 3))}px)`; y.beginPath(); _curva(y, poe([[4, -58], [20, -50], [28, -34], [24, -14], [8, -10], [-6, -30]]), true); y.fillStyle = `rgba(2,4,14,${0.3 * o.a})`; y.fill(); y.restore(); } // sombra sob a bochecha/mandíbula
  // mandíbula (do queixo até embaixo da orelha) e orelha
  pin([[50 + 3 * (r.queixo ?? 0), -8], [28, -14], [6, -26], [-6, -44], [-9, -58]], 1.0, 0.85);
  // olho (perfil): pálpebras em V aberto para a frente, íris, dobra da pálpebra
  const ey = -86, ex0 = 34, ex1 = 47 + 2 * ol;
  if (fechado) { pin([[ex0, ey], [40, ey + 2.5], [ex1, ey - 0.5]], 1.0); pin([[ex1 - 1, ey - 1], [ex1 + 3, ey + 1]], 0.6, 0.7); }
  else {
    const ab = (ex === "espanto" || ex === "medo" ? 1.5 : ex === "sorri" ? 0.8 : 1) * ol;
    pin([[ex0, ey], [39, ey - 4.5 * ab], [45, ey - 4.2 * ab], [ex1, ey - 0.8]], 1.15);
    pin([[ex0 + 1, ey + 0.5], [41, ey + 2.4 * ab], [ex1 - 1, ey + 0.6]], 0.6, 0.8);
    const [ix, iy] = poe([[43.5, ey - 1.4]])[0], ir = Math.max(1.2, 3.1 * ab * o.kk * W / 3.3);
    y.beginPath(); y.ellipse(ix, iy, ir * 0.62, ir, 0, 0, 6.283); y.fillStyle = `rgba(${KIT_ESTILO === "cheio" ? kitEsc(P, 0.35) : P},${o.a})`; y.fill();
    pin([[ex0 + 2, ey - 6.5 * ab], [41, ey - 8.5 * ab], [ex1 - 2, ey - 6.5 * ab]], 0.55, 0.6);
    if (fem || r.cilios) { pin([[ex1 - 2, ey - 3.5], [ex1 + 4, ey - 6.5]], 0.6, 0.9); pin([[ex1 - 5, ey - 4.2], [ex1, ey - 8.5]], 0.5, 0.8); }
  }
  // sobrancelha: o ângulo conta a emoção
  const S = { neutro: [[31, -98], [40, -101.5], [51, -99.5]], sorri: [[31, -99], [40, -103.5], [51, -101]], triste: [[31, -102], [40, -101], [51, -95.5]], medo: [[31, -103], [41, -103], [51, -97]],
    espanto: [[31, -104], [41, -108], [51, -104]], dorme: [[31, -97], [40, -99.5], [51, -98]], fala: [[31, -99], [40, -102.5], [51, -100]] }[ex] || [[31, -98], [40, -101.5], [51, -99.5]];
  pin(S, 2.1 * sb, 0.95, { ini: 0.35, fim: 0.05 });
  // nariz: asa e narina
  pin([nar(1, 22), nar(-1, 27), nar(2, 31)], 0.8, 0.85); pin([nar(5, 33), nar(9, 34)], 0.6, 0.8);
  // boca: linha entre os lábios e o canto
  const bc = { sorri: [[58, -41], [54, -41.5], [49, -44.5]], triste: [[58, -41], [54, -40], [50, -37.5]], espanto: null, medo: null, fala: null }[ex];
  if (bc) pin(bc, 1.0);
  else if (ex === "espanto" || ex === "medo") traca(poe([[58, -43], [55, -45], [53, -40], [55, -35], [58, -36]]), true, { rgb: P, lw: 0.6, det: true });
  else if (ex === "fala") { const k = Math.max(0, Math.sin(o.t * 11 + o.fase)); traca(poe([[58.5, -42], [53, -42.5], [52, -40], [55, -38 + 3 * k], [58.5, -39 + 3 * k]]), true, { rgb: P, lw: 0.6, det: true }); }
  else pin([[58.5, -41], [54, -41], [50.5, -40.2]], 0.95);
  if (!fem && !cri) pin([[58, -34], [55, -31.5]], 0.5, 0.6); // sombra do lábio de baixo
  // maçã do rosto, sulco do nariz até a boca (sorriso e idade), rugas
  pin([[36, -72], [44, -68]], 0.5, 0.45);
  if (ex === "sorri" || idade > 0.2) pin([[54, -63], [49, -54], [49, -45]], 0.7, ex === "sorri" ? 0.8 : 0.6);
  if (idade > 0.2) { pin([[30, -88], [27, -82]], 0.5, 0.6); pin([[33, -84], [29, -78]], 0.45, 0.5); pin([[50, -112], [38, -114]], 0.45, 0.5); pin([[48, -107], [38, -108]], 0.4, 0.45); pin([[44, -36], [41, -28]], 0.5, 0.55); }
  if (cri) pin([[42, -60], [46, -57]], 0.5, 0.4);
}

// ---------------- cabelo, barba e coberturas: massa + mechas geradas ----------------
// Cada forma tem "fora" (borda externa, com traço) e "dentro" (borda que encosta no rosto: sem traço, só a
// ponta das mechas, como a linha de nascimento do cabelo de verdade). As mechas saem de "guias" (curvas
// desenhadas à mão): entre duas guias o kit gera n fios com comprimento e espessura variados.
function kitReamostra(pts, m) {
  const S = [], n = pts.length, g = (k) => pts[Math.max(0, Math.min(n - 1, k))];
  for (let k = 0; k < n - 1; k++) { const p0 = g(k - 1), p1 = g(k), p2 = g(k + 1), p3 = g(k + 2), c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    for (let j = 0; j < 10; j++) { const u = j / 10, v = 1 - u; S.push([v * v * v * p1[0] + 3 * v * v * u * c1[0] + 3 * v * u * u * c2[0] + u * u * u * p2[0], v * v * v * p1[1] + 3 * v * v * u * c1[1] + 3 * v * u * u * c2[1] + u * u * u * p2[1]]); } }
  S.push(pts[n - 1]); const L = [0]; for (let k = 1; k < S.length; k++) L.push(L[k - 1] + Math.hypot(S[k][0] - S[k - 1][0], S[k][1] - S[k - 1][1]));
  const out = [], tot = L[L.length - 1] || 1; let j = 0;
  for (let k = 0; k < m; k++) { const alvo = tot * k / (m - 1); while (j < L.length - 2 && L[j + 1] < alvo) j++; const u = (alvo - L[j]) / ((L[j + 1] - L[j]) || 1); out.push([S[j][0] + (S[j + 1][0] - S[j][0]) * u, S[j][1] + (S[j + 1][1] - S[j][1]) * u]); }
  return out;
}
function kitDentro(p, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
// massa: preenche (esconde o que está atrás) e tinge com luz vinda de cima/frente
function kitMassa(y, poe, pts, o, al = 1) {
  const sp = poe(pts); y.beginPath(); _curva(y, sp, true); y.fillStyle = KIT_ESTILO === "cheio" ? `rgba(${kitEsc(o.rgb, 0.78)},1)` : KIT_ESTILO === "silhueta" ? "rgba(8,10,24,1)" : `rgba(${o.fundo},0.97)`; y.fill();
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [px, py] of sp) { x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
  const fx = o.d > 0 ? x1 : x0, g = y.createLinearGradient(fx, y0, o.d > 0 ? x0 : x1, y1);
  g.addColorStop(0, `rgba(${o.rgb},${0.3 * al})`); g.addColorStop(0.5, `rgba(${o.rgb},${0.12 * al})`); g.addColorStop(1, `rgba(${o.rgb},${0.05 * al})`); y.fillStyle = g; y.fill();
}
// fios entre guias consecutivas; ond = ondulação (amplitude em unidades da cabeça)
function kitFios(y, poe, guias, o, f = {}) {
  const r = prng(f.seed || 7), M = 24, G = guias.map((g) => kitReamostra(g, M)), n = f.n || 3;
  for (let gi = 0; gi < G.length - 1; gi++) for (let j = 0; j < n; j++) {
    const v = (j + 0.2 + 0.6 * r()) / n, ini = f.inteiro ? 0 : r() * (f.corte ?? 0.3), fim = 1 - (f.inteiro ? 0 : r() * (f.corte ?? 0.3)), fase = r() * 6.28, pts = [];
    for (let k = 0; k < M; k++) { const u = k / (M - 1); if (u < ini - 1e-6 || u > fim + 1e-6) continue; const a = G[gi][k], b = G[gi + 1][k];
      let px = a[0] + (b[0] - a[0]) * v, py = a[1] + (b[1] - a[1]) * v;
      if (f.ond) { const kk2 = Math.min(M - 1, k + 1), k0 = Math.max(0, k - 1), tx = G[gi][kk2][0] - G[gi][k0][0], ty = G[gi][kk2][1] - G[gi][k0][1], l = Math.hypot(tx, ty) || 1, w = f.ond * Math.sin(u * (f.ciclos || 3) * 6.28 + fase * 0.3); px += -ty / l * w; py += tx / l * w; }
      pts.push([px, py]); }
    if (pts.length > 2) kitPincel(y, poe(pts), o.LW * (f.w || 0.75) * (0.55 + 0.6 * r()), o.rgb, o.a * (f.al ?? 1) * (0.45 + 0.45 * r()), { brilho: 3 * o.kk });
  }
}
// borda com traço afinando nas pontas; recortada: pequenas ondas (cacho) ou pontas (barba)
function kitBorda(y, poe, pts, o, f = {}) {
  let q = pts;
  if (f.cachos || f.pontas) { const R = kitReamostra(pts, Math.max(6, Math.round(f.n || 18))), out = [];
    for (let k = 0; k < R.length - 1; k++) { const a = R[k], b = R[k + 1], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, s = f.lado || 1;
      out.push(a); out.push([(a[0] + b[0]) / 2 + ty / l * (f.cachos || f.pontas) * s * -1, (a[1] + b[1]) / 2 - tx / l * (f.cachos || f.pontas) * s * -1]); }
    out.push(R[R.length - 1]); q = out; }
  kitPincel(y, poe(q), o.LW * (f.w || 1.15), o.rgb, o.a * (f.al ?? 1), { brilho: 7 * o.kk, ini: 0.25, fim: 0.25 });
}
const KIT_CABELOS_V2 = {
  cabelo_curto: { orelha: true,
    fora: [[44, -142], [47, -151], [38, -164], [16, -174], [-12, -176], [-40, -168], [-59, -148], [-68, -118], [-68, -88], [-61, -62], [-50, -44]],
    dentro: [[44, -142], [34, -136], [22, -129], [13, -117], [9, -102], [8, -86], [3, -84], [-6, -97], [-20, -101], [-30, -88], [-36, -66], [-50, -44]],
    guias: [[[46, -148], [28, -166], [-4, -173], [-36, -164], [-57, -142], [-65, -112]], [[40, -140], [20, -155], [-10, -160], [-40, -148], [-58, -120], [-62, -88]],
      [[30, -133], [12, -142], [-16, -143], [-40, -128], [-52, -100], [-56, -70]], [[16, -122], [2, -126], [-18, -120], [-34, -104], [-42, -82], [-48, -56]]], n: 4 },
  cabelo_ondulado: { orelha: true,
    fora: [[44, -142], [47, -152], [37, -166], [12, -177], [-18, -178], [-48, -166], [-67, -138], [-75, -100], [-73, -62], [-65, -32], [-52, -16]],
    dentro: [[44, -142], [33, -135], [21, -126], [12, -110], [8, -94], [4, -84], [-4, -98], [-22, -104], [-34, -88], [-38, -60], [-42, -32], [-52, -16]],
    guias: [[[46, -148], [26, -168], [-10, -174], [-46, -160], [-66, -124], [-70, -76], [-62, -30]], [[40, -140], [18, -156], [-14, -160], [-44, -144], [-60, -108], [-62, -66], [-56, -26]],
      [[30, -133], [10, -143], [-18, -142], [-40, -124], [-50, -90], [-50, -56], [-48, -24]], [[18, -122], [2, -127], [-20, -120], [-34, -100], [-40, -72], [-42, -46], [-46, -20]]], n: 4, ond: 2.6, ciclos: 2.5 },
  cabelo_longo: { orelha: false,
    fora: [[44, -142], [47, -152], [36, -166], [12, -176], [-18, -177], [-46, -165], [-64, -139], [-72, -100], [-73, -50], [-69, 0], [-63, 38], [-56, 62], [-46, 72]],
    dentro: [[44, -142], [33, -135], [21, -123], [13, -105], [9, -86], [5, -66], [-1, -44], [-8, -18], [-14, 10], [-22, 38], [-32, 60], [-46, 72]],
    guias: [[[44, -148], [22, -170], [-18, -172], [-52, -152], [-67, -110], [-69, -50], [-63, 10], [-55, 58]], [[38, -140], [14, -158], [-20, -160], [-48, -138], [-58, -96], [-59, -40], [-53, 16], [-47, 60]],
      [[30, -134], [10, -146], [-16, -146], [-38, -124], [-45, -80], [-41, -30], [-37, 20], [-40, 62]], [[22, -125], [8, -130], [-6, -120], [-17, -96], [-22, -56], [-24, -10], [-27, 30], [-34, 62]],
      [[18, -120], [8, -112], [0, -90], [-6, -60], [-12, -26], [-17, 8], [-23, 36], [-31, 64]], [[13, -108], [10, -98], [6, -82], [1, -60], [-5, -30], [-12, 6], [-19, 36], [-29, 64]]], n: 4, ond: 1.6, ciclos: 1.5, corte: 0.2 },
  cabelo_coque: { orelha: true,
    fora: [[44, -142], [47, -151], [37, -164], [12, -173], [-18, -172], [-46, -160], [-62, -138], [-67, -110], [-63, -80], [-53, -56], [-45, -42]],
    dentro: [[44, -142], [33, -135], [19, -125], [11, -111], [7, -98], [3, -90], [-8, -100], [-24, -102], [-32, -88], [-36, -64], [-45, -42]],
    coque: [-78, -128, 17],
    guias: [[[44, -147], [20, -167], [-14, -169], [-44, -156], [-64, -136]], [[36, -137], [12, -150], [-18, -151], [-46, -139], [-64, -130]],
      [[22, -126], [2, -132], [-22, -126], [-46, -120], [-64, -125]], [[-42, -46], [-52, -68], [-59, -92], [-63, -112], [-66, -122]]], n: 4, corte: 0.15 },
  cabelo_cacheado: { orelha: true, cachos: 4.5,
    fora: [[45, -142], [50, -154], [41, -170], [14, -182], [-18, -184], [-50, -172], [-70, -146], [-78, -110], [-74, -74], [-62, -50], [-48, -40]],
    dentro: [[45, -142], [34, -136], [22, -129], [13, -117], [9, -102], [7, -88], [1, -86], [-8, -98], [-22, -102], [-32, -88], [-38, -62], [-48, -40]] },
  calvo: { orelha: true,
    fora: [[7, -82], [6, -98], [-8, -108], [-32, -112], [-54, -102], [-63, -80], [-57, -54], [-46, -40]],
    dentro: [[7, -82], [-1, -94], [-14, -100], [-30, -96], [-40, -80], [-44, -58], [-46, -40]],
    guias: [[[4, -100], [-14, -108], [-36, -108], [-54, -96], [-60, -74], [-54, -52]], [[0, -94], [-16, -100], [-32, -98], [-42, -84], [-46, -64], [-47, -46]]], n: 4 },
};
// barba: "borda" (lado de fora, com traço: do lábio de baixo, queixo, embaixo da mandíbula até a costeleta)
// + "face" (lado da bochecha, sem traço); bigode à parte, por cima do lábio de cima
const KIT_BIGODE = [[61, -54], [55, -52.5], [49, -48.5], [45, -42], [44.5, -38.5], [48, -41], [53, -45], [58, -47], [62.5, -49]];
const KIT_BARBAS_V2 = {
  barba_curta: { borda: [[56, -32], [61, -27], [64, -18], [64, -8], [59, 1], [48, 6], [34, 6], [20, 2], [8, -10], [0, -30], [-3, -50], [2, -70], [6, -84], [8, -88]],
    face: [[8, -88], [14, -76], [25, -67], [38, -61], [47, -55], [48, -46], [48, -40], [52, -36]],
    guias: [[[5, -82], [-1, -56], [3, -30], [14, -4]], [[18, -72], [15, -46], [19, -20], [28, 4]], [[33, -63], [33, -40], [37, -14], [42, 5]], [[46, -54], [47, -38], [53, -16], [55, 2]], [[54, -33], [60, -24], [63, -12], [60, 0]]], n: 3, bigode: true },
  barba_longa: { borda: [[56, -32], [62, -26], [67, -14], [69, 8], [66, 34], [58, 58], [46, 78], [36, 66], [26, 42], [14, 18], [2, -6], [-4, -34], [0, -62], [5, -80], [8, -88]],
    face: [[8, -88], [14, -76], [25, -67], [38, -61], [47, -55], [48, -46], [48, -40], [52, -36]],
    guias: [[[5, -82], [0, -54], [4, -22], [16, 14], [28, 46]], [[18, -72], [16, -42], [22, -8], [30, 28], [38, 62]], [[33, -63], [34, -36], [40, -4], [44, 32], [44, 70]], [[46, -54], [48, -34], [56, -6], [58, 28], [50, 66]], [[54, -33], [62, -20], [66, 4], [64, 34], [54, 64]]], n: 3, ond: 1.4, bigode: true, pontas: 3 },
  cavanhaque: { borda: [[55, -31], [60, -25], [63, -14], [61, -3], [55, 2], [49, -2]], face: [[49, -2], [48, -14], [50, -26], [52, -32]],
    guias: [[[52, -30], [51, -16], [52, -2]], [[57, -29], [60, -16], [58, 0]]], n: 3, bigode: true, bigodeFino: true },
};
// coberturas de tecido: dobras = guias com poucos fios largos; bainha = linha dupla na borda do rosto
const KIT_COBERTURAS_V2 = {
  veu: { franja: true,
    fora: [[52, -147], [47, -162], [30, -176], [4, -183], [-26, -181], [-55, -167], [-72, -140], [-80, -100], [-83, -50], [-81, 0], [-78, 50], [-73, 100], [-64, 132]],
    dentro: [[52, -147], [43, -140], [32, -131], [22, -116], [16, -97], [14, -76], [14, -56], [13, -36], [7, -10], [-2, 20], [-15, 60], [-29, 100], [-44, 128], [-64, 132]],
    guias: [[[34, -170], [-16, -178], [-58, -152], [-75, -96], [-76, 0], [-71, 110]], [[38, -152], [2, -162], [-42, -142], [-62, -84], [-62, 10], [-57, 122]],
      [[28, -128], [4, -138], [-28, -114], [-44, -56], [-44, 30], [-42, 126]], [[19, -102], [8, -98], [-8, -62], [-20, -10], [-25, 50], [-31, 122]]], n: 2 },
  pano_cabeca: { cordao: [[51, -150], [30, -167], [-6, -174], [-44, -164], [-68, -138], [-76, -118]],
    fora: [[51, -139], [49, -158], [32, -173], [4, -182], [-28, -180], [-56, -166], [-74, -138], [-82, -96], [-84, -40], [-80, 10], [-72, 48]],
    dentro: [[51, -139], [43, -133], [31, -123], [21, -105], [15, -86], [13, -64], [11, -42], [5, -16], [-9, 14], [-29, 40], [-50, 52], [-72, 48]],
    guias: [[[40, -152], [-12, -164], [-58, -146], [-76, -96], [-78, -10], [-72, 42]], [[30, -132], [2, -140], [-34, -118], [-50, -66], [-54, 0], [-58, 46]], [[20, -106], [8, -100], [-8, -66], [-18, -20], [-30, 22], [-46, 48]]], n: 1 },
  faixa_cabeca: { faixa: [[47, -150], [24, -167], [-14, -171], [-48, -158], [-67, -134], [-70, -126]], pontas: [[[-68, -130], [-80, -110], [-82, -86]], [[-67, -128], [-74, -104], [-70, -80]]] },
};
// desenha cabelo; devolve true se a orelha fica à mostra (null se o estilo não existe aqui)
function kitCabelo(y, nome, poe, o) {
  const H2 = KIT_CABELOS_V2[nome]; if (!H2) return null;
  const forma = [...H2.fora, ...H2.dentro.slice(1, -1).reverse()];
  kitMassa(y, poe, forma, o, 1);
  if (H2.coque) { const [cx, cy, rr] = H2.coque, c = []; for (let k = 0; k < 14; k++) c.push([cx + Math.cos(k / 14 * 6.283) * rr, cy + Math.sin(k / 14 * 6.283) * rr * 0.9]); kitMassa(y, poe, c, o, 1); kitBorda(y, poe, [...c, c[0], c[1]], o, { w: 1 });
    for (let k = 0; k < 5; k++) { const pts = []; for (let j = 0; j <= 10; j++) { const an = k * 1.25 + j * 0.42, rad = rr * (0.25 + 0.065 * j); pts.push([cx + Math.cos(an) * rad, cy + Math.sin(an) * rad * 0.9]); } kitPincel(y, poe(pts), o.LW * 0.7, o.rgb, o.a * 0.7, { brilho: 3 * o.kk }); } }
  if (H2.cachos) {
    // caracóis: espirais pequenas espalhadas na massa (sempre as mesmas: semente fixa)
    const r = prng(31), pol = kitReamostra(forma.concat([forma[0]]), 60);
    for (let gy = -184; gy < -36; gy += 12) for (let gx = -80; gx < 52; gx += 12.5) { const p = [gx + (r() - 0.5) * 7 + ((gy / 12) % 2 ? 6 : 0), gy + (r() - 0.5) * 6]; if (!kitDentro(p, pol)) continue;
      const rad = 4.6 + 2.4 * r(), a0 = r() * 6.28, pts = []; for (let j = 0; j <= 9; j++) { const an = a0 + j * 0.62, rr2 = rad * (0.45 + 0.06 * j); pts.push([p[0] + Math.cos(an) * rr2, p[1] + Math.sin(an) * rr2]); }
      kitPincel(y, poe(pts), o.LW * (0.55 + 0.35 * r()), o.rgb, o.a * (0.5 + 0.4 * r()), { brilho: 3 * o.kk }); }
    kitBorda(y, poe, H2.fora, o, { cachos: H2.cachos, n: 22 });
  } else {
    kitFios(y, poe, H2.guias, o, { n: H2.n, ond: H2.ond, ciclos: H2.ciclos, corte: H2.corte, seed: nome.length * 13 });
    kitBorda(y, poe, H2.fora, o);
  }
  return H2.orelha;
}
function kitBarba(y, nome, poe, o) {
  const B2 = KIT_BARBAS_V2[nome]; if (!B2) return false;
  kitMassa(y, poe, [...B2.borda, ...B2.face.slice(1, -1)], o, 1.1);
  kitFios(y, poe, B2.guias, o, { n: B2.n, ond: B2.ond, ciclos: 2, corte: 0.2, seed: 5 + nome.length, w: 0.7 });
  kitBorda(y, poe, B2.borda, o, { pontas: B2.pontas || 1.6, n: 16, lado: -1 });
  if (B2.bigode) { const bg = B2.bigodeFino ? KIT_BIGODE.map(([px, py], k) => [px, py + (k > 3 ? -1.5 : 1)]) : KIT_BIGODE; kitMassa(y, poe, bg, o, 1.2);
    kitBorda(y, poe, bg.slice(3).concat([bg[0]]), o, { w: 0.9 }); for (let k = 0; k < 4; k++) kitPincel(y, poe([[60 - k * 3, -51 + k * 1.2], [56 - k * 3, -47 + k * 0.6], [53 - k * 2.6, -44.5 + k * 0.4]]), o.LW * 0.55, o.rgb, o.a * 0.7, { brilho: 3 * o.kk }); }
  return true;
}
function kitCobertura(y, nome, poe, o, oc) {
  const C2 = KIT_COBERTURAS_V2[nome]; if (!C2) return false;
  if (C2.faixa) { const w = 8, cima = C2.faixa, baixo = cima.map(([px, py]) => [px - 1, py + w]);
    for (const pt of C2.pontas) kitPincel(y, poe(pt), o.LW * 3.2, o.rgb, o.a * 0.9, { brilho: 5 * o.kk, ini: 0.6, fim: 0.1 });
    kitMassa(y, poe, [...cima, ...baixo.reverse()], o, 1.6); kitBorda(y, poe, cima, o, { w: 0.9 }); kitBorda(y, poe, cima.map(([px, py]) => [px - 1, py + w]), o, { w: 0.9 }); return true; }
  const forma = [...C2.fora, ...C2.dentro.slice(1, -1).reverse()];
  kitMassa(y, poe, forma, o, 1.5);
  kitFios(y, poe, C2.guias, o, { n: 1, inteiro: true, w: 1.0, al: 0.4, seed: 3 });
  kitBorda(y, poe, C2.fora, o, { w: 1.2 });
  kitBorda(y, poe, C2.dentro, o, { w: 1.1 }); kitBorda(y, poe, C2.dentro.map(([px, py]) => [px - 4, py - 1]), o, { w: 0.6, al: 0.75 });
  if (C2.cordao) for (const dy of [0, 6]) kitPincel(y, poe(C2.cordao.map(([px, py]) => [px - dy * 0.2, py + dy])), o.LW * 2.4, oc.rgbEsc, o.a, { brilho: 4 * o.kk, ini: 0.6, fim: 0.3 });
  if (C2.franja && oc.cabelo) for (const m of [[[50, -146], [44, -141], [36, -137]], [[48, -144], [40, -139], [33, -133]]]) kitPincel(y, poe(m), o.LW * 0.8, oc.cabelo, o.a * 0.8, { brilho: 3 * o.kk });
  return true;
}
// orelha (desenhada depois do cabelo curto, para ficar por cima da massa)
function kitOrelha(y, poe, o) {
  const pin = (pts, w, al = 1) => kitPincel(y, poe(pts), o.LW * w, o.PELE, o.a * al, { brilho: 5 * o.kk });
  kitMassa(y, poe, [[-3, -101], [-15, -100], [-23, -90], [-24, -76], [-19, -64], [-12, -57], [-5, -60], [-2, -80]], { ...o, rgb: o.PELE }, 0.6);
  pin([[-3, -101], [-15, -100], [-23, -90], [-24, -76], [-19, -64], [-12, -57], [-5, -60]], 1.15, 0.95);
  pin([[-8, -92], [-16, -88], [-17, -77], [-12, -70]], 0.7, 0.75); pin([[-4, -80], [-1, -74]], 0.6, 0.7);
}
