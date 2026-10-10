// Objetos em pontos de luz com volume e transformação entre objetos (padrão do canal desde out/2026).
// Cada objeto vem de um ícone Phosphor (motor/icones.js, licença MIT), de um texto ou de um desenho
// próprio, vira uma nuvem de pontos com relevo (luz de cima à esquerda, borda brilhante, espessura) e
// é desenhado na nuvem da GPU (telaGPU). Tudo é função do tempo: render determinístico.
//
//   const CH = formaPontos("key", 6000);                 // ícone (lista: phosphoricons.com)
//   const N99 = formaTexto("99%", 5000);                  // texto em pontos
//   const MAO = formaPontos({ desenho: (g, R) => {...} }); // desenho próprio num canvas R x R (branco = cheio)
//   T.quadro((x, t) => {
//     let i = desenharForma(nv, CH, { cx: 540, cy: 900, esc: 560, cor: [1, .8, .35], a: 1, t, giro: 0.4 });
//     i = morfo(nv, CH, CARRO, u, { de: { cx, cy, esc, cor }, para: { cx, cy, esc, cor }, t, i0: i });
//     nv.total(i);
//   });
//   Opções de desenharForma: cx, cy, esc (tamanho em px da caixa do ícone), cor [r,g,b] 0–1, borda (cor
//   da luz de contorno), a, t (cintilar), giro (rotação em torno do eixo vertical, mostra a espessura),
//   rot (rotação no plano), tam (tamanho do ponto), brilho, cintila, revela (0–1: os pontos aparecem
//   em varredura), sx/sy (esticar/achatar: FIS.impacto), z + cam (profundidade: câmera de fisica.js),
//   desloca(k, sx, sy) -> [sx, sy] (deformações), i0 (índice inicial na nuvem).

const _RES_F = 384;
const _LUZ_F = (() => { const v = [-0.55, -0.65, 0.55], m = Math.hypot(...v); return v.map((q) => q / m); })();
const _MEIO_F = (() => { const v = [_LUZ_F[0], _LUZ_F[1], _LUZ_F[2] + 1], m = Math.hypot(...v); return v.map((q) => q / m); })();

function formaPontos(fonte, n = 14000, o = {}) { return { fonte, n, o, pronto: false }; }
function formaTexto(txt, n = 12000, o = {}) {
  return formaPontos({ desenho: (g, R) => { const tam = o.tam || 0.5; g.font = `900 ${R * tam}px Nunito`; g.textAlign = "center"; g.textBaseline = "middle"; let w = g.measureText(txt).width; const k = Math.min(1, (R * 0.94) / w); g.save(); g.translate(R / 2, R / 2); g.scale(k, k); g.fillText(txt, 0, R * 0.02); g.restore(); } }, n, o);
}
// "poeira": pontos soltos num disco (para um objeto se montar ou se desfazer)
function poeiraForma(n = 5000, seed = 7, raio = 0.5) {
  const r = prng(seed), F = { n, pronto: true, X: new Float32Array(n), Y: new Float32Array(n), Z: new Float32Array(n), B: new Float32Array(n), E: new Float32Array(n), N: new Float32Array(n), K: new Uint8Array(n) };
  for (let k = 0; k < n; k++) { const an = r() * 6.283, d = raio * Math.sqrt(r()); F.X[k] = Math.cos(an) * d; F.Y[k] = Math.sin(an) * d; F.Z[k] = (r() - 0.5) * 0.4; F.B[k] = 0.3 + 0.5 * r(); F.N[k] = r(); }
  return F;
}

function _rasterizaF(fonte, R) {
  const cv = document.createElement("canvas"); cv.width = cv.height = R;
  const g = cv.getContext("2d"); g.fillStyle = "#fff";
  if (fonte && fonte.desenho) fonte.desenho(g, R);
  else {
    const d = typeof fonte === "string" ? ICONES_PH[fonte] : fonte && fonte.d;
    if (!d) throw new Error("formaPontos: ícone não existe: " + fonte);
    g.save(); g.translate(R * 0.04, R * 0.04); g.scale((R * 0.92) / 256, (R * 0.92) / 256); g.fill(new Path2D(d)); g.restore();
  }
  const img = g.getImageData(0, 0, R, R).data, m = new Uint8Array(R * R);
  for (let i = 0; i < R * R; i++) m[i] = img[i * 4 + 3] > 127 ? 1 : 0;
  return m;
}
// distância de cada pixel cheio até a borda (chanfro), em pixels
function _distanciaF(m, R) {
  const d = new Float32Array(R * R), S = 1.414;
  for (let i = 0; i < R * R; i++) d[i] = m[i] ? 1e9 : 0;
  for (let y = 0; y < R; y++) for (let x = 0; x < R; x++) { const i = y * R + x; if (!d[i]) continue; let v = d[i]; if (x > 0) v = Math.min(v, d[i - 1] + 1); if (y > 0) { v = Math.min(v, d[i - R] + 1); if (x > 0) v = Math.min(v, d[i - R - 1] + S); if (x < R - 1) v = Math.min(v, d[i - R + 1] + S); } d[i] = v; }
  for (let y = R - 1; y >= 0; y--) for (let x = R - 1; x >= 0; x--) { const i = y * R + x; if (!d[i]) continue; let v = d[i]; if (x < R - 1) v = Math.min(v, d[i + 1] + 1); if (y < R - 1) { v = Math.min(v, d[i + R] + 1); if (x < R - 1) v = Math.min(v, d[i + R + 1] + S); if (x > 0) v = Math.min(v, d[i + R - 1] + S); } d[i] = v; }
  return d;
}
function _preparaF(F) {
  if (F.pronto) return F;
  const R = _RES_F, o = F.o || {}, n = F.n, m = _rasterizaF(F.fonte, R), d = _distanciaF(m, R);
  let dMax = 1; for (let i = 0; i < R * R; i++) if (d[i] > dMax) dMax = d[i];
  // relevo: chanfro arredondado na borda + leve "almofada" no meio
  const bev = R * (o.chanfro ?? 0.035), h = new Float32Array(R * R);
  for (let i = 0; i < R * R; i++) { if (!m[i]) continue; const q = Math.min(1, d[i] / bev); h[i] = Math.sqrt(1 - (1 - q) * (1 - q)) + 0.35 * Math.sqrt(d[i] / dMax); }
  const r = prng(o.seed || 11), esp = o.espessura ?? 0.05, borda = o.contorno ?? 1.6;
  F.X = new Float32Array(n); F.Y = new Float32Array(n); F.Z = new Float32Array(n); F.B = new Float32Array(n); F.E = new Float32Array(n); F.N = new Float32Array(n); F.K = new Uint8Array(n);
  let k = 0, tent = 0;
  while (k < n && tent < n * 400) {
    tent++;
    const x = 1 + Math.floor(r() * (R - 2)), y = 1 + Math.floor(r() * (R - 2)), i = y * R + x;
    if (!m[i]) continue;
    const e = Math.exp(-d[i] / 2.2), w = (0.5 + borda * e) / (0.5 + borda);
    if (r() > w) continue;
    const gx = (h[i + 1] - h[i - 1]) * 0.5 * 9, gy = (h[i + R] - h[i - R]) * 0.5 * 9, nm = Math.hypot(gx, gy, 1), nx = -gx / nm, ny = -gy / nm, nz = 1 / nm;
    const lamb = Math.max(0, nx * _LUZ_F[0] + ny * _LUZ_F[1] + nz * _LUZ_F[2]), esp2 = Math.pow(Math.max(0, nx * _MEIO_F[0] + ny * _MEIO_F[1] + nz * _MEIO_F[2]), 28);
    const tipo = r(), X = (x + r() - 0.5) / R - 0.5, Y = (y + r() - 0.5) / R - 0.5;
    F.X[k] = X; F.Y[k] = Y; F.N[k] = r();
    if (tipo < 0.8 || e < 0.35) { F.K[k] = 0; F.Z[k] = esp * (0.4 + 0.6 * Math.min(1, h[i])); F.B[k] = 0.12 + 0.75 * lamb + 1.1 * esp2 + 0.45 * (-0.55 * X - 0.75 * Y); F.E[k] = e; }
    else if (tipo < 0.92) { F.K[k] = 1; F.Z[k] = esp * (r() * 2 - 1); F.B[k] = 0.3 + 0.3 * r(); F.E[k] = 1; }
    else { F.K[k] = 2; F.Z[k] = -esp * (0.4 + 0.6 * Math.min(1, h[i])); F.B[k] = 0.2 + 0.25 * lamb; F.E[k] = e; }
    k++;
  }
  F.n = k; F.pronto = true;
  return F;
}
// ordem por ângulo em volta do centro (pareamento da transformação: os pontos giram para o novo lugar)
function _ordemF(F) { if (F._ord) return F._ord; const ix = Array.from({ length: F.n }, (_, k) => k); ix.sort((a, b) => Math.atan2(F.Y[a], F.X[a]) - Math.atan2(F.Y[b], F.X[b])); F._ord = Uint32Array.from(ix); return F._ord; }

// posição, cor, brilho e tamanho de um ponto da forma na tela (out = [sx, sy, r, g, b, alfa, tam])
function _pontoF(F, k, o, cs, out) {
  const [cgy, sgy, cgz, sgz, esc, cx, cy, cor, bd] = cs;
  const X = F.X[k] * (o.sx ?? 1), Y = F.Y[k] * (o.sy ?? 1), Z = F.Z[k];
  const x1 = X * cgy + Z * sgy, z1 = -X * sgy + Z * cgy;
  const kind = F.K[k]; let vis = 1;
  if (kind === 0) vis = cgy > 0 ? 0.55 + 0.45 * cgy : 0.15; else if (kind === 2) vis = cgy < 0 ? 0.6 : 0.12; else vis = 0.35 + 0.9 * Math.abs(sgy);
  const x2 = x1 * cgz - Y * sgz, y2 = x1 * sgz + Y * cgz, p = 1 / (1 - z1 * 0.5);
  let sx = cx + x2 * esc * p, sy = cy + y2 * esc * p;
  if (o.desloca) [sx, sy] = o.desloca(k, sx, sy);
  const e = F.E[k], nn = F.N[k], t = o.t || 0, ci = o.cintila ?? 0.22;
  const tw = 1 - ci + ci * (0.5 + 0.5 * Math.sin(t * (1.3 + nn * 2.6) + nn * 40));
  out[0] = sx; out[1] = sy;
  out[2] = cor[0] + (bd[0] - cor[0]) * e; out[3] = cor[1] + (bd[1] - cor[1]) * e; out[4] = cor[2] + (bd[2] - cor[2]) * e;
  out[5] = vis * tw * (0.3 + 0.55 * F.B[k] + 0.85 * e) * (o.brilho ?? 1);
  out[6] = (o.tam ?? 3.2) * p * (1 + 0.4 * e) * Math.min(1.8, Math.max(0.7, Math.sqrt(esc / 520)));
}
function _constF(o) {
  const gy = o.giro || 0, gz = o.rot || 0, cor = o.cor || [1, 0.85, 0.45];
  const bd = o.borda || [Math.min(1, cor[0] * 0.5 + 0.55), Math.min(1, cor[1] * 0.5 + 0.55), Math.min(1, cor[2] * 0.5 + 0.55)];
  let cx = o.cx ?? 540, cy = o.cy ?? 960, esc = o.esc ?? 520;
  if (o.cam) { const [px, py, k] = projP(o.cam, cx, cy, o.z ?? 1); cx = px; cy = py; esc *= k; }
  return [Math.cos(gy), Math.sin(gy), Math.cos(gz), Math.sin(gz), esc, cx, cy, cor, bd];
}
// desfoque de profundidade: longe do plano em foco, pontos maiores e mais fracos (bokeh)
function _focoF(o) { if (o.z === undefined || !o.cam) return [1, 1]; const df = Math.abs(Math.log((o.z || 1) / (o.cam.foco || 1))), k = 1 + 2.2 * df; return [k, 1.15 / (k * k)]; }  // mesma energia: ponto maior, mais fraco

function desenharForma(nv, F, o = {}) {
  _preparaF(F);
  let i = o.i0 ?? nv.k; const a = o.a ?? 1;
  if (a <= 0.004) { nv.total(i); return i; }
  const cs = _constF(o), out = new Array(7), [fT, fA] = _focoF(o), rv = o.revela ?? 1;
  for (let k = 0; k < F.n && i < nv.n; k++) {
    if (rv < 1) { const lim = rv * 1.25 - 0.25 * F.N[k]; if ((F.X[k] + 0.5) > lim) continue; }
    _pontoF(F, k, o, cs, out);
    nv.ponto(i++, out[0], out[1], out[2], out[3], out[4], out[5] * a * fA, out[6] * fT);
  }
  nv.total(i); return i;
}

// transforma a forma A na forma B: u 0→1. Os pontos saem em onda (pela ordem em volta do centro),
// fazem uma curva (redemoinho) e crescem um pouco no meio do voo.
//   o.de / o.para: as mesmas opções de desenharForma para cada ponta; o.onda (0–0.8), o.curva, o.sobe
function morfo(nv, A, B, u, o = {}) {
  _preparaF(A); _preparaF(B);
  let i = o.i0 ?? nv.k; const a = o.a ?? 1;
  if (u <= 0) return desenharForma(nv, A, { ...o.de, t: o.t, a: a * (o.de.a ?? 1), i0: i });
  if (u >= 1) return desenharForma(nv, B, { ...o.para, t: o.t, a: a * (o.para.a ?? 1), i0: i });
  const de = { ...o.de, t: o.t }, pa = { ...o.para, t: o.t }, csA = _constF(de), csB = _constF(pa);
  const oa = _ordemF(A), ob = _ordemF(B), n = Math.max(A.n, B.n), onda = o.onda ?? 0.4, curva = o.curva ?? 0.35, sobe = o.sobe ?? 0;
  const pA = new Array(7), pB = new Array(7);
  for (let j = 0; j < n && i < nv.n; j++) {
    const ka = oa[Math.floor((j * A.n) / n)], kb = ob[Math.floor((j * B.n) / n)];
    _pontoF(A, ka, de, csA, pA); _pontoF(B, kb, pa, csB, pB);
    const atraso = onda * (j / n), v = Math.max(0, Math.min(1, (u - atraso) / (1 - onda))), e = PT.inOut(v), mid = Math.sin(Math.PI * e);
    const dx = pB[0] - pA[0], dy = pB[1] - pA[1], L = Math.hypot(dx, dy) + 1e-6, amp = curva * L * (A.N[ka] - 0.5) * 2;
    const sx = pA[0] + dx * e - (dy / L) * amp * mid, sy = pA[1] + dy * e + (dx / L) * amp * mid - sobe * mid;
    const al = (pA[5] * (o.de.a ?? 1) + (pB[5] * (o.para.a ?? 1) - pA[5] * (o.de.a ?? 1)) * e) * (1 + 0.3 * mid);
    nv.ponto(i++, sx, sy, pA[2] + (pB[2] - pA[2]) * e, pA[3] + (pB[3] - pA[3]) * e, pA[4] + (pB[4] - pA[4]) * e, al * a, (pA[6] + (pB[6] - pA[6]) * e) * (1 + 0.35 * mid));
  }
  nv.total(i); return i;
}
// cores prontas (0–1) a partir da paleta do canal
const CORF = { amarelo: [1, 0.82, 0.25], ambar: [1, 0.66, 0.2], laranja: [1, 0.54, 0.24], ciano: [0.56, 0.89, 1], azul: [0.3, 0.79, 0.94], verde: [0.3, 0.92, 0.66], rosa: [1, 0.36, 0.56], vermelho: [0.94, 0.28, 0.44], branco: [0.92, 0.94, 1], cinza: [0.55, 0.6, 0.72], cobre: [0.88, 0.54, 0.29], lilas: [0.75, 0.62, 1] };

// ---------- pergunta para os comentários (padrão de todo vídeo) ----------
// balão de comentário em pontos com um "?" e a seta para o botão de comentários na lateral direita
const _BALAO_F = formaPontos("chat-circle-dots", 9000), _INTERR_F = formaTexto("?", 7000);
function balaoPergunta(nv, x, t, a, cx = 540, cy = 930, esc = 620, i0 = nv.k) {
  if (a <= 0.01) { nv.total(i0); return i0; }
  const ch = Math.max(0.01, a);
  let i = desenharForma(nv, _BALAO_F, { cx, cy, esc: esc * (0.85 + 0.15 * ch), cor: CORF.ciano, a, t, giro: 0.12 * Math.sin(t * 0.9), i0 });
  i = desenharForma(nv, _INTERR_F, { cx, cy: cy - esc * 0.02, esc: esc * 0.42, cor: CORF.amarelo, a: a * (0.85 + 0.15 * Math.sin(t * 4)), t, i0: i });
  return i;
}
function setaComentarios(x, a, t) {
  if (a <= 0.01) return; const b = Math.sin(t * 6) * 16;
  fSeta(x, 700 + b, 1250, 900 + b, 1250, "255,210,63", a, 12); brilhoP(x, 1010, 1250, 90, "255,210,63", 0.35 * a * (0.7 + 0.3 * Math.sin(t * 6)));
  rotuloP(x, "comentários", 780, 1180, 40, "255,226,140", a);
}
// onda sonora em pontos (grossa = grave/encorpada, fina = aguda): de x0 a x1, centro cy
function ondaPontos(nv, x0, x1, cy, amp, ciclos, t, cor, a, i0 = nv.k, esp = 1, vel = 6) {
  let i = i0; if (a <= 0.01) { nv.total(i); return i; }
  const n = Math.round((x1 - x0) / 2.2), camadas = Math.max(1, Math.round(esp * 4));
  for (let c = 0; c < camadas; c++) for (let k = 0; k <= n && i < nv.n; k++) {
    const u = k / n, env = Math.sin(u * Math.PI), y = cy + Math.sin(u * ciclos * 6.283 - t * vel) * amp * env + (c - (camadas - 1) / 2) * 3.2;
    nv.ponto(i++, x0 + u * (x1 - x0), y, cor[0], cor[1], cor[2], a * (0.5 + 0.5 * env) * (2.2 / Math.sqrt(camadas)), 4);
  }
  nv.total(i); return i;
}
