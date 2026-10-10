// Cenas do vídeo "Como a internet atravessa os oceanos" — pontos de luz (refeito do zero).
// Retenção: choque no 1º segundo (o inimigo é a âncora), meio-saber (satélite?), previsão do espectador
// (quanto tempo até Portugal?), caso real (Mar Vermelho, 2024), pergunta para os comentários, promessa paga
// (a Praia do Futuro), assombro (25 voltas na Terra) e dica do servidor.

const MD = MotionDirector;
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245", AZ = "80,160,255", CZ = "120,130,160";
const estF = (seed) => ambienteP(220, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.6);
const vecI = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
function projI(lat0, lon0, R, cx, cy) { const ca = Math.cos(-lon0 * Math.PI / 180), sa = Math.sin(-lon0 * Math.PI / 180), cb = Math.cos(lat0 * Math.PI / 180), sb = Math.sin(lat0 * Math.PI / 180); return (v) => { const x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca, y2 = v[1] * cb - z1 * sb, z2 = v[1] * sb + z1 * cb; return [cx + x1 * R, cy - y2 * R, z2]; }; }
const TERRA_I = (() => { const o = []; for (let k = 0; k < GLOBO_TERRA.length; k += 2) o.push(vecI(GLOBO_TERRA[k] / 10, GLOBO_TERRA[k + 1] / 10)); for (let k = 0; k < GLOBO_BRASIL.length; k += 4) o.push(vecI(GLOBO_BRASIL[k] / 10, GLOBO_BRASIL[k + 1] / 10)); return o; })();
// globo de pontos; devolve a projeção para desenhar cabos por cima
function globoI(nv, x, cx, cy, R, lat0, lon0, a) {
  const pj = projI(lat0, lon0, R, cx, cy); if (a <= 0.01) return pj;
  brilhoP(x, cx, cy, R * 1.25, "60,140,255", 0.2 * a); anelP(x, cx, cy, R, CI, 0.35 * a, 3);
  const g = x.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R); g.addColorStop(0, `rgba(60,120,255,${0.22 * a})`); g.addColorStop(1, "rgba(20,40,120,0.02)"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
  let i = nv.k; for (const v of TERRA_I) { const [px, py, z] = pj(v); if (z <= 0) continue; nv.ponto(i++, px, py, 0.55, 0.9, 0.62, a * (0.3 + 0.6 * z), Math.max(2.4, R / 140)); } nv.total(i); return pj;
}
// cabo no globo (arco de círculo máximo entre dois pontos lat/lon); prog = quanto já foi desenhado
function arcoI(x, pj, A, Bp, cor, a, prog = 1, lw = 4, altura = 0.0) {
  if (a <= 0.01 || prog <= 0) return null; const va = vecI(A[0], A[1]), vb = vecI(Bp[0], Bp[1]); const N = 40; let ant = null, fim = null;
  for (let k = 0; k <= N * prog; k++) { const u = k / N; let v = [va[0] * (1 - u) + vb[0] * u, va[1] * (1 - u) + vb[1] * u, va[2] * (1 - u) + vb[2] * u]; const m = Math.hypot(...v) / (1 + altura * Math.sin(u * Math.PI)); v = v.map((q) => q / m); const p = pj(v); if (ant && p[2] > 0 && ant[2] > 0) linhaP(x, ant[0], ant[1], p[0], p[1], cor, a, lw); ant = p; fim = p; }
  return fim;
}
function pontoArco(pj, A, Bp, u, altura = 0) { const va = vecI(A[0], A[1]), vb = vecI(Bp[0], Bp[1]); let v = [va[0] * (1 - u) + vb[0] * u, va[1] * (1 - u) + vb[1] * u, va[2] * (1 - u) + vb[2] * u]; const m = Math.hypot(...v) / (1 + altura * Math.sin(u * Math.PI)); return pj(v.map((q) => q / m)); }
function satI(x, cx, cy, s, a) { if (a <= 0.01) return; fCaixa(x, cx, cy, 34 * s, 34 * s, 6 * s, BRC, a, 3 * s, 0.3); for (const sx of [-1, 1]) fCaixa(x, cx + sx * 50 * s, cy, 50 * s, 22 * s, 3 * s, CI, a, 2 * s, 0.25); brilhoP(x, cx, cy, 40 * s, BRC, 0.4 * a); }
function xisI(x, cx, cy, r, a) { if (a <= 0.01) return; linhaP(x, cx - r, cy - r, cx + r, cy + r, VE, a, 10); linhaP(x, cx - r, cy + r, cx + r, cy - r, VE, a, 10); brilhoP(x, cx, cy, r * 1.6, VE, 0.4 * a); }
// mar: superfície ondulada + fundo
function marI(x, t, ySup, yFun, a = 1) {
  const g = x.createLinearGradient(0, ySup, 0, yFun); g.addColorStop(0, `rgba(40,110,220,${0.16 * a})`); g.addColorStop(1, `rgba(10,30,90,${0.05 * a})`); x.fillStyle = g; x.fillRect(0, ySup, 1080, yFun - ySup);
  const rr = prng(5); for (let k = 0; k < 60; k++) { const bx = rr() * 1080, by = ySup + 40 + rr() * (yFun - ySup - 80), v = 8 + rr() * 14; discoP(x, (bx + t * v) % 1080, by + Math.sin(t * 0.8 + k) * 10, 2 + rr() * 3, CI, 0.35 * a); }
  x.beginPath(); for (let px = 0; px <= 1080; px += 12) { const py = ySup + Math.sin(px * 0.02 + t * 1.6) * 8; px ? x.lineTo(px, py) : x.moveTo(px, py); } x.strokeStyle = `rgba(${CI},${0.7 * a})`; x.lineWidth = 4; x.stroke();
  x.beginPath(); for (let px = 0; px <= 1080; px += 20) { const py = yFun + Math.sin(px * 0.011) * 18 + Math.sin(px * 0.037) * 6; px ? x.lineTo(px, py) : x.moveTo(px, py); } x.strokeStyle = `rgba(200,170,120,${0.55 * a})`; x.lineWidth = 4; x.stroke();
}
function navioI(x, cx, cy, s, a, cor = BRC) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 120 * s, cy - 30 * s); x.lineTo(cx + 130 * s, cy - 30 * s); x.lineTo(cx + 95 * s, cy + 20 * s); x.lineTo(cx - 100 * s, cy + 20 * s); x.closePath(); x.fillStyle = `rgba(${cor},${0.12 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 5 * s; x.stroke(); fCaixa(x, cx - 30 * s, cy - 60 * s, 90 * s, 55 * s, 6 * s, cor, a, 4 * s, 0.1); linhaP(x, cx + 50 * s, cy - 30 * s, cx + 50 * s, cy - 110 * s, cor, a, 4 * s); }
function tubaraoI(x, cx, cy, s, a, esp = 1) { if (a <= 0.01) return; const q = (dx, dy) => [cx + dx * s * esp, cy + dy * s]; x.beginPath(); x.moveTo(...q(-130, 0)); x.quadraticCurveTo(...q(-20, -45), ...q(110, -5)); x.lineTo(...q(150, -40)); x.lineTo(...q(140, 0)); x.lineTo(...q(150, 35)); x.lineTo(...q(110, 8)); x.quadraticCurveTo(...q(-20, 40), ...q(-130, 0)); x.closePath(); x.strokeStyle = `rgba(${CZ},${a})`; x.lineWidth = 4 * s; x.stroke(); x.beginPath(); x.moveTo(...q(-10, -30)); x.lineTo(...q(10, -75)); x.lineTo(...q(35, -25)); x.stroke(); discoP(x, ...q(-95, -8), 5 * s, BRC, a); }
function ancoraI(x, cx, cy, s, a) { if (a <= 0.01) return; linhaP(x, cx, cy - 60 * s, cx, cy + 40 * s, BRC, a, 7 * s); anelP(x, cx, cy - 72 * s, 12 * s, BRC, a, 5 * s); linhaP(x, cx - 28 * s, cy - 35 * s, cx + 28 * s, cy - 35 * s, BRC, a, 6 * s); x.beginPath(); x.arc(cx, cy + 5 * s, 40 * s, 0.2, Math.PI - 0.2); x.strokeStyle = `rgba(${BRC},${a})`; x.lineWidth = 7 * s; x.stroke(); }
function servidorI(x, cx, cy, s, cor, a, t) { if (a <= 0.01) return; for (let k = 0; k < 3; k++) { fCaixa(x, cx, cy - 60 * s + k * 60 * s, 170 * s, 50 * s, 8 * s, cor, a, 4 * s, 0.1); discoP(x, cx + 55 * s, cy - 60 * s + k * 60 * s, 6 * s, cor, a * (0.5 + 0.5 * Math.sin(t * 6 + k * 2))); } }
function casaI(x, cx, cy, s, a) { if (a <= 0.01) return; fCaixa(x, cx, cy, 160 * s, 110 * s, 6 * s, BRC, a, 5 * s, 0.05); x.beginPath(); x.moveTo(cx - 95 * s, cy - 55 * s); x.lineTo(cx, cy - 125 * s); x.lineTo(cx + 95 * s, cy - 55 * s); x.strokeStyle = `rgba(${BRC},${a})`; x.lineWidth = 5 * s; x.stroke(); fCaixa(x, cx + 35 * s, cy + 20 * s, 34 * s, 68 * s, 3 * s, BRC, a, 4 * s, 0.05); fCaixa(x, cx - 35 * s, cy - 5 * s, 40 * s, 36 * s, 3 * s, AM, a, 3 * s, 0.4); }

const FOR = [-3.7, -38.5], SIN = [37.95, -8.9];
const CABOS = [[FOR, SIN], [FOR, [25.8, -80.2]], [FOR, [36.85, -76]], [FOR, [-8.8, 13.2]], [[-22.9, -43.2], [-33.9, 18.4]], [[-23.9, -46.3], [-36.5, -56.7]], [FOR, [-22.9, -43.2]], [[40.6, -73.9], [50.8, -4.5]], [[36.85, -76], [43.3, -2.9]], [[6.45, 3.4], [37.95, -8.9]], [[25.8, -80.2], [40.6, -73.9]], [[-8.8, 13.2], [6.45, 3.4]], [[43.3, 5.4], [31.2, 29.9]], [[50.8, -4.5], [40.6, -73.9]]];

function faiscasP(x, cx, cy, u) { const r = prng(77); for (let k = 0; k < 18; k++) { const an = r() * 6.283, v = 60 + r() * 140, d = u * v; discoP(x, cx + Math.cos(an) * d, cy + Math.sin(an) * d - u * u * 40, 4, AM, Math.max(0, 1 - u)); } brilhoP(x, cx, cy, 70, AM, Math.max(0, 0.8 - u)); }
const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
function checkI(x, cx, cy, r, a, cor = VD) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - r, cy); x.lineTo(cx - r * 0.3, cy + r * 0.7); x.lineTo(cx + r, cy - r * 0.7); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = Math.max(5, r * 0.25); x.lineJoin = "round"; x.stroke(); }
function setaComent(x, a, t) { if (a <= 0.01) return; const b = Math.sin(t * 6) * 16; fSeta(x, 700 + b, 1250, 900 + b, 1250, AM, a, 12); brilhoP(x, 1010, 1250, 90, AM, 0.35 * a * (0.7 + 0.3 * Math.sin(t * 6))); rotuloP(x, "comentários", 780, 1180, 38, "255,226,140", a); }
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 330 * s, 60 * s, CI, a, 8 * s, 0.12);
  x.beginPath(); x.moveTo(cx - 120 * s, cy + 160 * s); x.lineTo(cx - 190 * s, cy + 250 * s); x.lineTo(cx - 40 * s, cy + 160 * s); x.fillStyle = `rgba(${CI},${0.5 * a})`; x.fill();
  brilhoP(x, cx, cy, 380 * s, CI, 0.18 * a); rotuloP(x, txt, cx, cy + 6 * s, 190 * s, "255,226,140", a * (0.85 + 0.15 * Math.sin(t * 4)));
}
// cabo ondulado no fundo; quebra = x do rompimento (ou null)
function caboFundo(x, yb, t, a, quebra = null, cor = BRC, pulsos = true, vel = 0.32) {
  if (a <= 0.01) return; const yc = (px) => yb + Math.sin(px * 0.006 + yb) * 18;
  const trechos = quebra === null ? [[-40, 1120]] : [[-40, quebra - 30], [quebra + 30, 1120]];
  for (const [a0, a1] of trechos) { x.beginPath(); for (let px = a0; px <= a1; px += 10) px === a0 ? x.moveTo(px, yc(px)) : x.lineTo(px, yc(px)); x.strokeStyle = `rgba(${CI},${0.12 * a})`; x.lineWidth = 40; x.stroke(); x.strokeStyle = `rgba(${cor},${0.5 * a})`; x.lineWidth = 16; x.stroke(); x.strokeStyle = `rgba(${CI},${0.7 * a})`; x.lineWidth = 4; x.stroke(); }
  if (pulsos) for (let k = 0; k < 8; k++) { const u = ((t * vel + k / 8) % 1), px = -40 + u * 1160; if (quebra !== null && px > quebra - 30) continue; discoP(x, px, yc(px), 8, AM, 0.9 * a); brilhoP(x, px, yc(px), 50, AM, 0.5 * a); }
  return yc;
}
// distintivo redondo com um ícone (para "não é hacker / nem tubarão")
function selo(x, cx, cy, r, cor, a) { if (a <= 0.01) return; x.beginPath(); x.arc(cx, cy, r, 0, 6.283); x.fillStyle = `rgba(${cor},${0.08 * a})`; x.fill(); anelP(x, cx, cy, r, cor, a, 5); }
function hackerI(x, cx, cy, s, a) { if (a <= 0.01) return; fPessoa(x, cx, cy - 10 * s, 2.2 * s, "200,170,230", a); x.beginPath(); x.arc(cx, cy - 85 * s, 46 * s, Math.PI * 1.05, Math.PI * 1.95); x.strokeStyle = `rgba(200,170,230,${a})`; x.lineWidth = 6 * s; x.stroke(); fCaixa(x, cx, cy + 50 * s, 120 * s, 70 * s, 8 * s, CI, a, 4 * s, 0.2); linhaP(x, cx - 75 * s, cy + 90 * s, cx + 75 * s, cy + 90 * s, CI, a, 6 * s); }
function mangueiraI(x, cx, cy, s, a) { if (a <= 0.01) return; x.beginPath(); x.arc(cx, cy, 60 * s, 0, 6.283); x.strokeStyle = `rgba(${VD},${a})`; x.lineWidth = 14 * s; x.stroke(); x.beginPath(); x.moveTo(cx + 60 * s, cy); x.bezierCurveTo(cx + 120 * s, cy + 40 * s, cx + 80 * s, cy + 140 * s, cx + 160 * s, cy + 170 * s); x.stroke(); }
function olhoI(x, cx, cy, s, aberto, a) { if (a <= 0.01) return; const h = 50 * s * Math.max(0.05, aberto); x.beginPath(); x.moveTo(cx - 90 * s, cy); x.quadraticCurveTo(cx, cy - h * 2, cx + 90 * s, cy); x.quadraticCurveTo(cx, cy + h * 2, cx - 90 * s, cy); x.strokeStyle = `rgba(${BRC},${a})`; x.lineWidth = 6 * s; x.stroke(); if (aberto > 0.3) { discoP(x, cx, cy, 30 * s * aberto, CI, a); discoP(x, cx, cy, 13 * s * aberto, "10,20,50", a); } }
function costaBR(x, a) { if (a <= 0.01) return; x.beginPath(); x.moveTo(0, 820); x.bezierCurveTo(260, 760, 420, 900, 560, 860); x.bezierCurveTo(720, 820, 860, 700, 1080, 640); x.strokeStyle = `rgba(${VD},${0.8 * a})`; x.lineWidth = 5; x.stroke(); x.lineTo(1080, 300); x.lineTo(0, 300); x.closePath(); x.fillStyle = `rgba(120,255,190,${0.06 * a})`; x.fill(); }
const CAB16 = [[-6.5, 200], [-4.2, 200], [-2, 210], [0.5, 230], [3, 250], [-9, 300], [-12, 240], [8, 280], [-1, 270], [5, 220], [-7.5, 260], [10, 250], [1.5, 300], [-3.2, 320], [6.5, 320], [-10.5, 280]];
function cabosPraia(x, P0, t, a, prog0, cor = CI) { CAB16.forEach(([ang], k) => { const an = (90 + ang * 6) * Math.PI / 180, ex = P0[0] + Math.cos(an) * 900, ey = P0[1] + Math.sin(an) * 900, pr = PT.ss((t - prog0 - k * 0.07) / 0.8); if (pr > 0) { linhaP(x, ex, ey, PT.lerp(ex, P0[0], pr), PT.lerp(ey, P0[1], pr), k % 4 ? cor : AM, 0.75 * a, 3); const u = ((t * 0.5 + k * 0.17) % 1); if (pr >= 1) discoP(x, PT.lerp(ex, P0[0], u), PT.lerp(ey, P0[1], u), 6, AM, a); } }); }

// =============== 1. gancho ===============
// quadro 0 = a âncora descendo em direção ao cabo que brilha no fundo do mar.
CENAS.abertura = (el, c, B) => {
  const tH = B("hacker"), tTu = B("tubarao0"), tAn = B("ancora0"), tF = B("fundo"), tM = B("mangueira0"), tP = B("promessa");
  const p2 = tAn + 0.9, p3 = tM - 1.2, p4 = tP - 2.6;
  mostrarGancho(p2 - 0.2);
  const T = telaI(el, c);
  const tx = palcoTexto(el, [["qua", 330, 66, "quase toda a internet", "pt-ci"], ["fun", 420, 46, "entre continentes: no fundo do mar", "pt-fino"], ["man", 330, 64, "da grossura de uma mangueira", "pt-am", "white-space:normal;left:60px;width:960px"], ["pra", 330, 66, "qual praia? no final", "pt-am"]]);
  MD.slam(tl, tx.qua, p2 + 0.2, { from: 1.3 }); MD.arrive(tl, tx.fun, tF - 0.6, { y: 14 }); MD.leave(tl, [tx.qua, tx.fun], p3 - 0.1); MD.slam(tl, tx.man, tM - 0.3, { from: 1.2 }); MD.leave(tl, tx.man, p4 - 0.1); MD.slam(tl, tx.pra, p4 + 0.2, { from: 1.3 });
  const nv = T.nuvem(90000), est = estF(3), CX = 540, CY = 900, R = 380;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano 1: fundo do mar; a âncora desce e corta o cabo
    const a1 = 1 - PT.ss((t - p2) / 0.5);
    if (a1 > 0.01) {
      x.save(); x.globalAlpha = a1; const z = PT.lerp(1.15, 1.0, PT.out(Math.min(1, t / (tAn + 0.5)))); x.translate(540, 1050); x.scale(z, z); x.translate(-540, -1050);
      marI(x, t, 520, 1340, 1);
      for (let k = 0; k < 5; k++) { const px = 140 + k * 200 + Math.sin(t * 0.4 + k) * 30; const g = x.createLinearGradient(0, 530, 0, 1100); g.addColorStop(0, "rgba(140,200,255,0.12)"); g.addColorStop(1, "rgba(140,200,255,0)"); x.fillStyle = g; x.beginPath(); x.moveTo(px - 30, 530); x.lineTo(px + 30, 530); x.lineTo(px + 120, 1100); x.lineTo(px + 20, 1100); x.closePath(); x.fill(); }
      const corta = t > tAn - 0.05, yc = caboFundo(x, 1230, t, 1, corta ? 560 : null);
      const desce = PT.inOut(Math.min(1, t / Math.max(1, tAn))), ax = 560, ay = PT.lerp(640, yc(560) - 40, desce);
      navioI(x, 470, 516, 0.8, 1, LA); linhaP(x, 520, 520, ax, ay - 70, BRC, 0.7, 3); ancoraI(x, ax, ay, 1.0, 1);
      if (corta) { faiscasP(x, 560, yc(560), (t - tAn) * 1.2); brilhoP(x, 560, yc(560), 120, VE, 0.6 * PT.jan(t, tAn, p2, 0.05, 0.5)); }
      x.restore();
      // selos: não é hacker, nem tubarão
      const aH = PT.ss((t - tH + 0.9) / 0.3) * (1 - PT.ss((t - tAn + 0.3) / 0.4)), aT = PT.ss((t - tTu + 0.7) / 0.3) * (1 - PT.ss((t - tAn + 0.3) / 0.4));
      selo(x, 250, 760, 120, "200,170,230", aH * a1); hackerI(x, 250, 760, 0.8, aH * a1); rotuloP(x, "hacker", 250, 915, 34, "220,200,240", aH * a1); xisI(x, 250, 760, 70, aH * a1 * PT.ss((t - tH + 0.1) / 0.25));
      selo(x, 830, 760, 120, CZ, aT * a1); tubaraoI(x, 830, 770, 0.6, aT * a1); rotuloP(x, "tubarão", 830, 915, 34, "200,205,220", aT * a1); xisI(x, 830, 760, 70, aT * a1 * PT.ss((t - tTu + 0.1) / 0.25));
    }
    // plano 2: o globo — os cabos ligam os continentes
    const a2 = planoC(t, p2, p3);
    const pj = globoI(nv, x, CX, CY, R, 12, -28 + (t - p2) * 1.2, a2);
    if (a2 > 0.01) { CABOS.forEach((cb, k) => arcoI(x, pj, cb[0], cb[1], k ? CI : AM, 0.7 * a2, PT.ss((t - p2 - 0.1 - k * 0.07) / 0.9), 3)); for (let k = 0; k < 3; k++) { const u = ((t * 0.5 + k / 3) % 1), p = pontoArco(pj, FOR, SIN, u); if (p[2] > 0) { discoP(x, p[0], p[1], 9, AM, a2); brilhoP(x, p[0], p[1], 40, AM, 0.6 * a2); } } }
    // plano 3: a grossura de uma mangueira
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) { const CX3 = 400, CY3 = 900, cr = 150; anelP(x, CX3, CY3, cr, BRC, a3, 8); anelP(x, CX3, CY3, cr * 0.78, "120,150,200", 0.6 * a3, 5); for (let k = 0; k < 16; k++) { const an = k / 16 * 6.283; discoP(x, CX3 + Math.cos(an) * cr * 0.6, CY3 + Math.sin(an) * cr * 0.6, cr * 0.07, "170,180,200", 0.6 * a3); } anelP(x, CX3, CY3, cr * 0.42, LA, 0.8 * a3, 6); for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283 + 0.3; discoP(x, CX3 + Math.cos(an) * cr * 0.14, CY3 + Math.sin(an) * cr * 0.14, 6, CI, a3); brilhoP(x, CX3 + Math.cos(an) * cr * 0.14, CY3 + Math.sin(an) * cr * 0.14, 26, CI, 0.6 * a3); } mangueiraI(x, 700, 840, 1.3, a3 * PT.ss((t - tM + 0.4) / 0.4)); rotuloP(x, "≈ 2 cm", 560, 1140, 44, "160,255,210", a3 * PT.ss((t - tM + 0.2) / 0.4)); }
    // plano 4: a costa do Brasil com uma praia misteriosa
    const a4 = PT.ss((t - p4) / 0.5);
    if (a4 > 0.01) { costaBR(x, a4); const P0 = [560, 860]; cabosPraia(x, P0, t, a4 * 0.6, p4 + 0.2); const pul = 0.5 + 0.5 * Math.sin(t * 5); discoP(x, P0[0], P0[1], 16, AM, a4); brilhoP(x, P0[0], P0[1], 120, AM, 0.5 * a4 * pul); anelP(x, P0[0], P0[1], 60 + 20 * pul, AM, 0.6 * a4, 4); rotuloP(x, "?", P0[0], P0[1] - 150, 150, AM, a4 * (0.85 + 0.15 * pul)); }
  });
};

// =============== 2. dentro do cabo ===============
CENAS.cabo = (el, c, B) => {
  const tSa = B("satelite"), tN = B("noventa"), tCa = B("camadas"), tV = B("vidro"), tL = B("luz"), tBi = B("bilhoes"), tQ = B("quica");
  const pA2 = tN - 0.4, pB = tCa - 0.5, pC = tL - 0.5;
  const T = telaI(el, c);
  const tx = palcoTexto(el, [["sat", 330, 80, "satélite?", "pt-am"], ["n99", 330, 66, "99% pelo fundo do mar", "pt-ci"], ["cam", 330, 66, "plástico, aço e cobre", "pt-ci"], ["vid", 330, 64, "fios de vidro finos como cabelo", "pt-am", "white-space:normal;left:60px;width:960px"], ["luz", 330, 70, "a mensagem vira luz", "pt-am"], ["qui", 330, 64, "a luz quica e não escapa", "pt-ci"]]);
  MD.slam(tl, tx.sat, tSa - 0.3, { from: 1.4 }); MD.leave(tl, tx.sat, pA2 - 0.1); MD.slam(tl, tx.n99, tN - 0.1, { from: 1.25 }); MD.leave(tl, tx.n99, pB - 0.1); MD.slam(tl, tx.cam, tCa - 0.1, { from: 1.25 }); MD.leave(tl, tx.cam, tV - 0.35);
  MD.slam(tl, tx.vid, tV - 0.1, { from: 1.2 }); MD.leave(tl, tx.vid, pC - 0.1); MD.slam(tl, tx.luz, tL - 0.1, { from: 1.3 }); MD.leave(tl, tx.luz, tQ - 0.35); MD.slam(tl, tx.qui, tQ - 0.1, { from: 1.25 });
  const nv = T.nuvem(90000), est = estF(5), CX = 540, CY = 950, R = 360;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A1: satélite? (o caminho pelo espaço é riscado)
    const a1 = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pA2) / 0.4));
    const pj = globoI(nv, x, CX, CY, R, 12, -30 + (t - c.ini) * 0.8, a1);
    if (a1 > 0.01) { const pA = pj(vecI(...FOR)), pB2 = pj(vecI(...SIN)), S = [CX + 250, CY - R - 40]; satI(x, S[0], S[1], 1.2, a1); x.setLineDash([10, 12]); linhaP(x, pA[0], pA[1], S[0], S[1] + 20, BRC, 0.6 * a1, 3); linhaP(x, S[0], S[1] + 20, pB2[0], pB2[1], BRC, 0.6 * a1, 3); x.setLineDash([]); for (const p of [pA, pB2]) { discoP(x, p[0], p[1], 11, AM, a1); brilhoP(x, p[0], p[1], 46, AM, 0.5 * a1); } xisI(x, PT.lerp(pA[0], S[0], 0.55), PT.lerp(pA[1], S[1], 0.55), 46, a1 * PT.ss((t - tN + 0.6) / 0.3)); }
    // plano A2: 99% pelo fundo do mar
    const a2 = planoC(t, pA2, pB);
    if (a2 > 0.01) { marI(x, t, 560, 1330, a2); x.save(); x.globalAlpha = a2; caboFundo(x, 1230, t, 1); x.restore(); const n = Math.round(99 * PT.out(PT.ss((t - tN + 0.2) / 0.9))); rotuloP(x, `${n}%`, 540, 880, 220, "255,226,140", a2); brilhoP(x, 540, 880, 300, AM, 0.2 * a2); }
    // plano B: o corte do cabo, camada por camada
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) {
      const cr = 240, X0 = 540, Y0 = 900, q = (k) => PT.ss((t - tCa - k * 0.45) / 0.3);
      anelP(x, X0, Y0, cr, BRC, aB, 8); anelP(x, X0, Y0, cr * 0.78, "120,150,200", 0.6 * aB, 5);
      for (let k = 0; k < 16; k++) { const an = k / 16 * 6.283; discoP(x, X0 + Math.cos(an) * cr * 0.6, Y0 + Math.sin(an) * cr * 0.6, cr * 0.07, "170,180,200", 0.6 * aB); }
      anelP(x, X0, Y0, cr * 0.42, LA, 0.8 * aB, 6);
      rotuloP(x, "plástico", X0 - cr - 10, Y0 - cr + 10, 32, "220,228,245", aB * q(0)); rotuloP(x, "aço", X0 + cr + 10, Y0 - 120, 32, "200,210,230", aB * q(1)); rotuloP(x, "cobre", X0 + cr - 20, Y0 + cr - 10, 32, "255,190,140", aB * q(2));
      const aV = PT.ss((t - tV + 0.3) / 0.5); for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283 + 0.3, px = X0 + Math.cos(an) * cr * 0.14, py = Y0 + Math.sin(an) * cr * 0.14; discoP(x, px, py, 7, aV > 0 ? CI : CZ, aB); if (aV > 0) brilhoP(x, px, py, 34, CI, 0.7 * aV * aB); }
      if (aV > 0) { linhaP(x, X0 + 30, Y0 + 10, X0 + 200, Y0 + 300, CI, 0.7 * aV * aB, 3); rotuloP(x, "fibra de vidro", X0 + 200, Y0 + 340, 32, "200,240,255", aV * aB); }
    }
    // plano C: a fibra vista de lado — luz piscando e quicando
    const aF = PT.ss((t - pC) / 0.5);
    if (aF > 0.01) {
      const y0 = 800, y1 = 1000; x.fillStyle = `rgba(${CI},${0.06 * aF})`; x.fillRect(60, y0, 960, y1 - y0); linhaP(x, 60, y0, 1020, y0, CI, 0.8 * aF, 5); linhaP(x, 60, y1, 1020, y1, CI, 0.8 * aF, 5);
      const rap = t > tBi - 0.2, aQ = PT.ss((t - tQ + 0.3) / 0.5);
      for (let k = 0; k < 7; k++) { const u = ((t * (rap ? 0.7 : 0.35) + k / 7) % 1), px = 60 + u * 960, on = Math.sin(t * (rap ? 30 : 8) + k * 1.7) > -0.2; const fase = (u * 960 / 200) % 2, py = PT.lerp((y0 + y1) / 2, PT.lerp(y0 + 14, y1 - 14, fase < 1 ? fase : 2 - fase), aQ); if (on) { discoP(x, px, py, 11, AM, aF); brilhoP(x, px, py, 60, AM, 0.6 * aF); } }
      if (aQ > 0) { x.beginPath(); for (let px = 60; px <= 1020; px += 10) { const f = ((px - 60) / 200) % 2, py = PT.lerp(y0 + 14, y1 - 14, f < 1 ? f : 2 - f); px === 60 ? x.moveTo(px, py) : x.lineTo(px, py); } x.strokeStyle = `rgba(${AM},${0.3 * aQ})`; x.lineWidth = 3; x.stroke(); }
      rotuloP(x, "bilhões de piscadas por segundo", 540, 1120, 36, "255,226,140", aF * PT.ss((t - tBi + 0.2) / 0.4));
    }
  });
};

// =============== 3. a viagem da luz (previsão do espectador) ===============
CENAS.viagem = (el, c, B) => {
  const tAd = B("adivinha"), tS = B("seismil"), tVo = B("voltar"), tSe = B("sessenta"), tE = B("enfraquece"), tSt = B("setenta"), tR = B("reforco");
  const pB = tSe - 0.4, pC = tE - 0.4;
  const T = telaI(el, c);
  const tx = palcoTexto(el, [["adv", 330, 80, "adivinha", "pt-am"], ["km", 330, 72, "≈ 6.000 km", "pt-ci"], ["vol", 330, 64, "ida e volta: quanto tempo?", "pt-ci"], ["ms", 330, 66, "menos de 60 milésimos", "pt-am"], ["fra", 330, 70, "a luz enfraquece", "pt-ve"], ["amp", 330, 60, "um reforço a cada ~70 km", "pt-ve", "color:#78ffbe"]]);
  MD.slam(tl, tx.adv, tAd - 0.1, { from: 1.4 }); MD.leave(tl, tx.adv, tS - 0.4); MD.slam(tl, tx.km, tS - 0.1, { from: 1.3 }); MD.leave(tl, tx.km, tVo - 1.0); MD.slam(tl, tx.vol, tVo - 0.8, { from: 1.2 }); MD.leave(tl, tx.vol, pB - 0.1);
  MD.slam(tl, tx.ms, tSe - 0.1, { from: 1.3 }); MD.leave(tl, tx.ms, pC - 0.1); MD.slam(tl, tx.fra, tE - 0.1, { from: 1.3 }); MD.leave(tl, tx.fra, tSt - 0.35); MD.slam(tl, tx.amp, tSt - 0.1, { from: 1.2 });
  const est = estF(7), YS = 560, YF = 1180, X0 = 150, X1 = 930, NA = 6;
  const yc = (px) => YF - 30 + Math.sin(px * 0.011) * 14;
  const oceano = (x, t, a) => { marI(x, t, YS, YF, a); for (const [px, nome, s] of [[X0, "Fortaleza", -1], [X1, "Portugal", 1]]) { x.beginPath(); x.moveTo(px + s * 160, YS - 20); x.lineTo(px - s * 10, YS - 20); x.lineTo(px + s * 30, YF + 10); x.lineTo(px + s * 160, YF + 10); x.closePath(); x.fillStyle = `rgba(120,255,190,${0.08 * a})`; x.fill(); x.strokeStyle = `rgba(${VD},${0.7 * a})`; x.lineWidth = 4; x.stroke(); rotuloP(x, nome, px + s * 40, YS - 60, 32, "160,255,210", a); } x.beginPath(); for (let px = X0 + 20; px <= X1 - 20; px += 10) px === X0 + 20 ? x.moveTo(px, yc(px)) : x.lineTo(px, yc(px)); x.strokeStyle = `rgba(${BRC},${0.85 * a})`; x.lineWidth = 7; x.stroke(); };
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: Fortaleza → Portugal; quanto tempo?
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { oceano(x, t, aA); const aK = PT.ss((t - tS + 0.3) / 0.4); fSeta(x, X0 + 60, YF + 80, X1 - 60, YF + 80, CI, aK * aA, 4); fSeta(x, X1 - 60, YF + 80, X0 + 60, YF + 80, CI, aK * aA * PT.ss((t - tVo + 0.5) / 0.4), 4); rotuloP(x, "?", 540, 800, 160, AM, aA * PT.ss((t - tVo + 0.4) / 0.4) * (0.85 + 0.15 * Math.sin(t * 5))); const u = ((t - c.ini) / 2.6) % 1, s = u < 0.5 ? u * 2 : 2 - u * 2, px = X0 + 20 + s * (X1 - X0 - 40); discoP(x, px, yc(px), 12, AM, aA); brilhoP(x, px, yc(px), 70, AM, 0.7 * aA); }
    // plano B: menos de 60 milésimos — vai e volta enquanto um olho pisca
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { rotuloP(x, "< 60 ms", 540, 760, 150, "255,226,140", aB); brilhoP(x, 540, 760, 260, AM, 0.2 * aB); linhaP(x, 180, 1000, 900, 1000, BRC, 0.6 * aB, 5); rotuloP(x, "Fortaleza", 180, 1050, 28, "160,255,210", aB); rotuloP(x, "Portugal", 900, 1050, 28, "160,255,210", aB); const u = ((t - pB) / 0.5) % 1, s = u < 0.5 ? u * 2 : 2 - u * 2; discoP(x, PT.lerp(180, 900, s), 1000, 12, AM, aB); brilhoP(x, PT.lerp(180, 900, s), 1000, 60, AM, 0.7 * aB); const pis = (t - pB) % 1.6; olhoI(x, 540, 1200, 0.9, pis < 1.3 ? 1 : Math.abs(Math.cos((pis - 1.3) / 0.3 * Math.PI)), aB * 0.8); }
    // plano C: a luz enfraquece; amplificadores a cada ~70 km dão reforço
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) {
      oceano(x, t, aC);
      const aA2 = PT.ss((t - tSt + 0.3) / 0.5); for (let k = 1; k <= NA; k++) { const px = X0 + 20 + k * (X1 - X0 - 40) / (NA + 1); fCaixa(x, px, yc(px), 46, 30, 8, VD, aC * aA2 * PT.ss((t - tSt - k * 0.12) / 0.3), 4, 0.25); }
      const u = ((t - pC) / 2.6) % 1, ida = u < 0.5, s = ida ? u * 2 : 2 - u * 2, px = X0 + 20 + s * (X1 - X0 - 40), seg = (X1 - X0 - 40) / (NA + 1), dentro = ((px - X0 - 20) % seg) / seg;
      const brilho = aA2 > 0.5 ? 1 - 0.5 * dentro : 1 - 0.85 * (ida ? s : 1 - s);
      discoP(x, px, yc(px), 12, AM, aC * Math.max(0.15, brilho)); brilhoP(x, px, yc(px), 80, AM, 0.8 * aC * Math.max(0.1, brilho));
      if (aA2 > 0.5 && dentro < 0.12) brilhoP(x, px, yc(px), 120, VD, 0.6 * aC * (1 - dentro / 0.12) * PT.ss((t - tR + 0.5) / 0.4 + 1));
      navioI(x, 760 - (t - c.ini) * 6, YS - 4, 0.6, 0.6 * aC);
    }
  });
};

// =============== 4. o inimigo é a âncora ===============
CENAS.inimigo = (el, c, B) => {
  const tA = B("ancora"), tC = B("cento"), tP = B("pesca"), tVm = B("vermelho"), tT = B("tres"), tD = B("desvia"), tE = B("emenda");
  const tEsp = tempoPalavras(c)("especial") || tD + 1.2;
  const pB = tP - 0.6, pC = tVm - 0.7, pD = tD - 0.5;
  const T = telaI(el, c);
  const tx = palcoTexto(el, [["anc", 330, 76, "a âncora", "pt-ve"], ["n150", 330, 64, "≈ 150 rompimentos por ano", "pt-am", "white-space:normal;left:60px;width:960px"], ["pes", 330, 64, "redes de pesca e âncoras", "pt-ve"], ["mv", 330, 66, "2024, Mar Vermelho", "pt-ci"], ["tre", 330, 76, "3 cabos de uma vez", "pt-ve"], ["des", 330, 66, "a internet desvia", "pt-ci"], ["eme", 330, 66, "e um navio emenda o cabo", "pt-ve", "color:#78ffbe"]]);
  MD.slam(tl, tx.anc, tA - 0.3, { from: 1.4 }); MD.leave(tl, tx.anc, tC - 0.4); MD.slam(tl, tx.n150, tC - 0.1, { from: 1.2 }); MD.leave(tl, tx.n150, pB - 0.1); MD.slam(tl, tx.pes, tP - 0.1, { from: 1.25 }); MD.leave(tl, tx.pes, pC - 0.1);
  MD.slam(tl, tx.mv, tVm - 0.3, { from: 1.25 }); MD.leave(tl, tx.mv, tT - 0.4); MD.slam(tl, tx.tre, tT - 0.1, { from: 1.4 }); MD.leave(tl, tx.tre, pD - 0.1); MD.slam(tl, tx.des, tD - 0.1, { from: 1.25 }); MD.leave(tl, tx.des, tEsp - 0.5); MD.slam(tl, tx.eme, tEsp - 0.2, { from: 1.25 });
  const est = estF(11), YS = 620, YF = 1270, r150 = prng(150), QUEBRAS = Array.from({ length: 24 }, () => { const qx = 80 + r150() * 920, k = Math.floor(r150() * 5); return [qx, 720 + k * 120 + Math.sin(qx * 0.007 + k * 2) * 26]; });
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: a âncora e os ~150 rompimentos por ano (cabos piscando de vermelho pelo mundo)
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { for (let k = 0; k < 5; k++) { const yb = 720 + k * 120; x.beginPath(); for (let px = 40; px <= 1040; px += 12) { const py = yb + Math.sin(px * 0.007 + k * 2) * 26; px === 40 ? x.moveTo(px, py) : x.lineTo(px, py); } x.strokeStyle = `rgba(${CI},${0.45 * aA})`; x.lineWidth = 4; x.stroke(); } const n = Math.floor(PT.ss((t - tC + 0.2) / 1.6) * QUEBRAS.length); for (let k = 0; k < n; k++) { const [qx, qy] = QUEBRAS[k]; brilhoP(x, qx, qy, 40, VE, 0.7 * aA); discoP(x, qx, qy, 6, VE, aA); } ancoraI(x, 540, 560 + 10 * Math.sin(t * 2), 1.3, aA * (1 - PT.ss((t - tC + 0.2) / 0.4))); if (n > 0) rotuloP(x, String(Math.round(150 * n / QUEBRAS.length)), 540, 1300, 60, "255,170,180", aA); }
    // plano B: rede de pesca e âncora arrastando no fundo
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { marI(x, t, YS, YF, aB); const ax = PT.lerp(300, 700, PT.ss((t - pB - 0.6) / 2.0)), ay = YF - 60, brk = ax > 560; x.save(); x.globalAlpha = aB; caboFundo(x, YF - 40, t, 1, brk ? 560 : null); x.restore(); if (brk) faiscasP(x, 560, YF - 40, Math.max(0, (ax - 560) / 120)); navioI(x, ax - 160, YS - 4, 0.8, aB, LA); linhaP(x, ax - 110, YS, ax, ay - 70, BRC, 0.6 * aB, 3); ancoraI(x, ax, ay, 0.9, aB); const bx = PT.lerp(1100, 700, PT.ss((t - pB) / 2.5)); navioI(x, bx, YS - 4, 0.6, aB); for (let k = 0; k <= 5; k++) linhaP(x, bx + 40 + k * 26, YF - 160, bx + 40 + k * 26, YF - 100, CZ, 0.7 * aB, 2); linhaP(x, bx + 20, YS + 10, bx + 40, YF - 160, BRC, 0.5 * aB, 2); }
    // plano C: Mar Vermelho, 2024 — o navio afundando arrasta a âncora por três cabos
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) {
      marI(x, t, YS, YF, aC); const u = PT.ss((t - pC - 0.2) / Math.max(1.2, tT - pC - 0.2)), ax = PT.lerp(180, 860, u);
      const CX3 = [360, 560, 760]; [YF - 200, YF - 120, YF - 40].forEach((yb, k) => { const brk = ax > CX3[k]; x.beginPath(); for (let px = 0; px <= 1080; px += 12) { if (brk && Math.abs(px - CX3[k]) < 26) { x.stroke(); x.beginPath(); continue; } const py = yb + Math.sin(px * 0.01 + k) * 10; x.lineTo(px, py); } x.strokeStyle = `rgba(${brk ? VE : CI},${0.8 * aC})`; x.lineWidth = 6; x.stroke(); if (brk) { brilhoP(x, CX3[k], yb, 60, VE, 0.5 * aC); faiscasP(x, CX3[k], yb, Math.min(1.2, (ax - CX3[k]) / 200)); } });
      x.save(); x.translate(ax - 150, YS + 10 + u * 30); x.rotate(0.22 + u * 0.15); navioI(x, 0, 0, 0.8, aC, VE); x.restore(); linhaP(x, ax - 120, YS + 20, ax, YF - 40 - 70, BRC, 0.6 * aC, 3); ancoraI(x, ax, YF - 40, 0.9, aC);
    }
    // plano D: a internet desvia por outro cabo; o navio de reparo puxa e emenda
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) {
      marI(x, t, YS, YF, aD); const sobe = PT.ss((t - tEsp) / 1.4), em = PT.ss((t - tE + 0.2) / 0.4);
      const yc = (px) => YF - 30 + Math.sin(px * 0.011) * 12 - sobe * 420 * Math.exp(-Math.pow((px - 560) / 220, 2));
      for (const [a0, a1] of em > 0.5 ? [[0, 1080]] : [[0, 520], [600, 1080]]) { x.beginPath(); for (let px = a0; px <= a1; px += 10) px === a0 ? x.moveTo(px, yc(px)) : x.lineTo(px, yc(px)); x.strokeStyle = `rgba(${em > 0.5 ? VD : BRC},${0.9 * aD})`; x.lineWidth = 7; x.stroke(); }
      const y2 = (px) => YF - 140 + Math.sin(px * 0.013 + 1) * 10; x.beginPath(); for (let px = 0; px <= 1080; px += 10) px ? x.lineTo(px, y2(px)) : x.moveTo(px, y2(px)); x.strokeStyle = `rgba(${CI},${0.8 * aD})`; x.lineWidth = 5; x.stroke();
      for (let k = 0; k < 3; k++) { const v = ((t - pD) * 0.45 + k / 3) % 1; discoP(x, v * 1080, y2(v * 1080), 8, AM, aD); brilhoP(x, v * 1080, y2(v * 1080), 44, AM, 0.6 * aD); }
      const aN = PT.ss((t - tEsp + 0.4) / 0.6); navioI(x, 560, YS - 4, 1.0, aD * aN, VD); linhaP(x, 610, YS - 100, 560, yc(560), VD, 0.6 * aD * aN * sobe, 3); if (em > 0) brilhoP(x, 560, yc(560), 90, VD, 0.7 * aD * em);
    }
  });
};

// =============== 5. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tCo = B("cortados"), tCh = B("chegaria"), tS = B("simnao");
  const pB = tCo - 1.0, pC = tCh - 0.1;
  const T = telaI(el, c);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "chuta nos comentários", "pt-ci"], ["cor", 330, 64, "todos os cabos cortados", "pt-ve"], ["che", 420, 34, "a mensagem pra sua cidade chega?", "pt-fino"], ["sim", 330, 86, "sim ou não?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, pB - 0.1); MD.slam(tl, tx.cor, pB + 0.1, { from: 1.25 }); MD.arrive(tl, tx.che, tCo + 0.6, { y: 14 }); MD.leave(tl, [tx.cor, tx.che], pC - 0.1); MD.slam(tl, tx.sim, pC + 0.1, { from: 1.45 });
  const est = estF(21);
  T.quadro((x, t) => {
    estD(x, est, t);
    balaoCom(x, 540, 960, 1.2, PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4)), "?", t);
    // os cabos na praia, cortados; dois celulares na mesma cidade
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { costaBR(x, aB); const P0 = [560, 860]; cabosPraia(x, P0, t, aB * 0.7, pB - 2, CZ); const cut = PT.ss((t - tCo + 0.2) / 0.4); for (let k = 0; k < 5; k++) xisI(x, 600 + k * 70, 1000 + (k % 2) * 60, 26, aB * cut); discoP(x, P0[0], P0[1], 14, AM, aB); fCelular(x, 220, 640, 150, BRC, aB, 0.1); fCelular(x, 440, 640, 150, BRC, aB, 0.1); const u = ((t - tCo) * 0.6) % 1; if (t > tCo + 0.6) { x.setLineDash([8, 10]); linhaP(x, 262, 640, 398, 640, AM, 0.6 * aB, 3); x.setLineDash([]); discoP(x, PT.lerp(262, 398, u), 640, 8, AM, aB); } rotuloP(x, "?", 330, 565, 80, AM, aB * PT.ss((t - tCo - 0.6) / 0.4)); rotuloP(x, "sua cidade", 330, 740, 30, "220,228,245", aB); }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { balaoCom(x, 540, 900, 1.1, aC, "?", t); setaComent(x, aC, t); }
  });
};

// =============== 6. a praia prometida + a escala da rede ===============
CENAS.praia = (el, c, B) => {
  const tF = B("futuro"), tD = B("dezesseis"), tM = B("mundo"), tS = B("seiscentos"), tMi = B("milhao"), tV = B("voltas");
  const pB = tS - 0.6, pC = tV - 0.7;
  const T = telaI(el, c);
  const tx = palcoTexto(el, [["pro", 330, 66, "a praia prometida", "pt-am"], ["fut", 330, 62, "Praia do Futuro, Fortaleza", "pt-ci", "white-space:normal;left:60px;width:960px"], ["n16", 330, 72, "≈ 16 cabos", "pt-am"], ["n600", 330, 72, "≈ 600 cabos no mundo", "pt-ci"], ["km", 420, 50, "+ de 1 milhão de km", "pt-fino"], ["vol", 330, 72, "+ de 25 voltas na Terra", "pt-am"]]);
  MD.slam(tl, tx.pro, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.pro, tF - 0.9); MD.slam(tl, tx.fut, tF - 0.6, { from: 1.2 }); MD.leave(tl, tx.fut, tD - 0.4); MD.slam(tl, tx.n16, tD - 0.1, { from: 1.3 }); MD.leave(tl, tx.n16, pB - 0.1);
  MD.slam(tl, tx.n600, tS - 0.1, { from: 1.25 }); MD.arrive(tl, tx.km, tMi - 0.2, { y: 14 }); MD.leave(tl, [tx.n600, tx.km], pC - 0.1); MD.slam(tl, tx.vol, tV - 0.2, { from: 1.35 });
  const nv = T.nuvem(90000), est = estF(9), r = prng(91);
  const MUITOS = Array.from({ length: 40 }, () => [[(r() - 0.5) * 120, (r() - 0.5) * 300], [(r() - 0.5) * 120, (r() - 0.5) * 300]]);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: a Praia do Futuro, onde os cabos convergem
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { costaBR(x, aA); const P0 = [560, 860]; cabosPraia(x, P0, t, aA, tF - 0.3); discoP(x, P0[0], P0[1], 16, AM, aA); brilhoP(x, P0[0], P0[1], 110, AM, 0.6 * aA); rotuloP(x, "Fortaleza", P0[0] - 40, P0[1] - 70, 34, "160,255,210", aA * PT.ss((t - tF + 0.3) / 0.4)); const n = Math.round(16 * PT.ss((t - tD + 0.5) / 0.8)); if (n > 0) rotuloP(x, `${n} cabos`, P0[0] + 190, P0[1] + 60, 40, "255,226,140", aA); const aM = PT.ss((t - tM + 0.4) / 0.5); if (aM > 0) for (let k = 0; k < 5; k++) { const v = ((t * 0.5 + k / 5) % 1); discoP(x, PT.lerp(P0[0], 1000, v), PT.lerp(P0[1], 1200 + k * 40, v), 8, AM, aA * aM); } }
    // plano B/C: o globo com ~600 cabos e o fio dando 25 voltas
    const aG = PT.ss((t - pB) / 0.5), R = 360, cx = 540, cy = 950;
    const pj = globoI(nv, x, cx, cy, R, 12, -36 + (t - c.ini) * 1.0, aG);
    if (aG > 0.01) {
      CABOS.forEach((cb) => arcoI(x, pj, cb[0], cb[1], CI, 0.7 * aG, 1, 3));
      const nM = Math.round(PT.lerp(0, 40, PT.ss((t - tS + 0.3) / 1.4))); for (let k = 0; k < nM; k++) arcoI(x, pj, MUITOS[k][0], MUITOS[k][1], k % 3 ? CI : AM, 0.45 * aG, 1, 2);
      const aV = PT.ss((t - tV + 0.5) / 0.4); if (aV > 0) for (let k = 0; k < 25 * PT.ss((t - tV + 0.5) / 2.2); k++) { const inc = -40 + k * 3.3; x.beginPath(); x.ellipse(cx, cy, R * 1.04 + k * 2, R * 0.25, inc * Math.PI / 180, 0, 6.283); x.strokeStyle = `rgba(${AM},${0.28 * aV})`; x.lineWidth = 2; x.stroke(); }
    }
  });
};

// =============== 7. a dica ===============
CENAS.dica = (el, c, B) => {
  const tS = B("servidor"), tA = B("atraso"), tR = B("resolve");
  const T = telaI(el, c);
  const tx = palcoTexto(el, [["srv", 330, 66, "jogo? servidor no Brasil", "pt-am"], ["atr", 330, 66, "oceano no meio = atraso", "pt-ve"], ["res", 330, 60, "internet mais rápida não resolve", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.srv, tS - 0.1, { from: 1.25 }); MD.leave(tl, tx.srv, tA - 1.6); MD.slam(tl, tx.atr, tA - 1.3, { from: 1.25 }); MD.leave(tl, tx.atr, tR - 0.35); MD.slam(tl, tx.res, tR - 0.1, { from: 1.2 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    const a0 = PT.ss((t - c.ini - 0.2) / 0.5);
    fCelular(x, 200, 980, 360, BRC, a0, 0.08); x.beginPath(); x.moveTo(180, 945); x.lineTo(230, 980); x.lineTo(180, 1015); x.closePath(); x.fillStyle = `rgba(${AM},${a0})`; x.fill(); rotuloP(x, "você", 200, 1210, 30, "220,228,245", a0);
    const aS = PT.ss((t - tS + 0.3) / 0.5), SB = [560, 700], SE = [860, 1180];
    servidorI(x, SB[0], SB[1], 0.9, VD, aS, t); rotuloP(x, "Brasil", SB[0], SB[1] + 110, 30, "160,255,210", aS);
    const aL = PT.ss((t - tA + 1.5) / 0.5); servidorI(x, SE[0], SE[1], 0.9, VE, aL, t); rotuloP(x, "outro continente", SE[0] - 40, SE[1] + 110, 30, "255,170,180", aL);
    if (aL > 0) { x.beginPath(); for (let px = 330; px <= 760; px += 12) { const py = 1100 + Math.sin(px * 0.03 + t * 2) * 8; px === 330 ? x.moveTo(px, py) : x.lineTo(px, py); } x.strokeStyle = `rgba(${CI},${0.6 * aL})`; x.lineWidth = 4; x.stroke(); rotuloP(x, "oceano", 545, 1150, 28, "180,230,255", aL); }
    if (aS > 0) { const u1 = ((t - tS) * 1.6) % 1; discoP(x, PT.lerp(290, SB[0] - 90, u1), PT.lerp(940, SB[1], u1), 9, VD, aS); x.setLineDash([8, 10]); linhaP(x, 290, 940, SB[0] - 90, SB[1], VD, 0.5 * aS, 3); x.setLineDash([]); checkI(x, SB[0] + 150, SB[1] - 120, 26, aS * PT.ss((t - tS - 0.4) / 0.3)); rotuloP(x, "ping baixo", SB[0] + 150, SB[1] - 60, 30, "160,255,210", aS * PT.ss((t - tS - 0.4) / 0.3)); }
    if (aL > 0) { const u2 = ((t - tA) * 0.45) % 1; x.setLineDash([8, 10]); linhaP(x, 290, 1020, SE[0] - 90, SE[1], VE, 0.5 * aL, 3); x.setLineDash([]); discoP(x, PT.lerp(290, SE[0] - 90, u2), PT.lerp(1020, SE[1], u2), 9, VE, aL); rotuloP(x, "+ dezenas de ms", SE[0] - 60, SE[1] - 140, 32, "255,170,180", aL * PT.ss((t - tA + 0.3) / 0.3)); }
   
  });
};

// =============== 8. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaI(el, c);
  const Y = [560, 720, 880], textos = ["a mensagem vira luz", "a luz corre no vidro, no fundo do mar", "o perigo é a âncora"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const nv = T.nuvem(90000), est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5), a0 = PT.ss((t - c.ini - 0.2) / 0.5) * sai;
    const pj = globoI(nv, x, 540, 1250, 170, 12, -30 + t * 2, 0.75 * a0);
    if (a0 > 0.01) CABOS.forEach((cb, k) => arcoI(x, pj, cb[0], cb[1], k ? CI : AM, 0.6 * a0, 1, 2));
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [AM, CI, VE][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};

// ---------- padrão novo (out/2026): os desenhos de contorno viram objetos em pontos de luz ----------
// telaI = telaGPU com uma nuvem grande; durante o quadro, NVI/TI apontam para a nuvem e o tempo da cena,
// e as funções de desenho abaixo (mesmos nomes de antes) desenham formas em pontos nela.
let NVI = null, TI = 0;
function telaI(el, c) {
  const T = telaGPU(el, c), nv = T.nuvem(90000);
  return { ...T, nuvem: () => nv, quadro: (fn) => T.quadro((x, t) => { NVI = nv; TI = t; fn(x, t); }) };
}
const corI = (s) => s.split(",").map((v) => Number(v) / 255);
const TUBARAO_D = { desenho: (g, R) => { const q = (dx, dy) => [R * 0.5 + dx * R / 340, R * 0.5 + dy * R / 340]; g.beginPath(); g.moveTo(...q(-130, 0)); g.quadraticCurveTo(...q(-20, -45), ...q(110, -5)); g.lineTo(...q(150, -40)); g.lineTo(...q(140, 0)); g.lineTo(...q(150, 35)); g.lineTo(...q(110, 8)); g.quadraticCurveTo(...q(-20, 40), ...q(-130, 0)); g.closePath(); g.fill(); g.beginPath(); g.moveTo(...q(-10, -30)); g.lineTo(...q(10, -75)); g.lineTo(...q(35, -25)); g.closePath(); g.fill(); g.globalCompositeOperation = "destination-out"; g.beginPath(); g.arc(...q(-95, -8), R * 0.012, 0, 6.283); g.fill(); } };
const SAT_I = { desenho: (g, R) => { g.fillRect(R * 0.4, R * 0.38, R * 0.2, R * 0.24); for (const x0 of [0.06, 0.64]) for (let k = 0; k < 3; k++) g.fillRect(R * (x0 + k * 0.105), R * 0.42, R * 0.09, R * 0.16); g.fillRect(R * 0.34, R * 0.48, R * 0.32, R * 0.04); } };
const MANG_I = { desenho: (g, R) => { g.strokeStyle = "#fff"; g.lineWidth = R * 0.07; g.beginPath(); g.arc(R * 0.4, R * 0.4, R * 0.2, 0, 6.283); g.stroke(); g.beginPath(); g.moveTo(R * 0.6, R * 0.4); g.bezierCurveTo(R * 0.75, R * 0.5, R * 0.65, R * 0.8, R * 0.9, R * 0.88); g.stroke(); } };
const FI = { barco: formaPontos("boat", 7000), tubarao: formaPontos(TUBARAO_D, 7000), ancora: formaPontos("anchor", 7000), servidor: formaPontos("hard-drives", 6000), casa: formaPontos("house", 5000), sat: formaPontos(SAT_I, 4000), xis: formaPontos("x-circle", 3000), hacker: formaPontos("detective", 7000), mangueira: formaPontos(MANG_I, 7000), cel: formaPontos("device-mobile", 7000), check: formaPontos("check-circle", 3000) };
function navioI(x, cx, cy, s, a, cor = BRC) { if (a <= 0.01 || !NVI) return; desenharForma(NVI, FI.barco, { cx, cy: cy - 40 * s, esc: 330 * s, cor: corI(cor), a, t: TI }); }
function tubaraoI(x, cx, cy, s, a, esp = 1) { if (a <= 0.01 || !NVI) return; desenharForma(NVI, FI.tubarao, { cx, cy, esc: 340 * s, sx: esp, cor: CORF.cinza, a, t: TI }); }
function ancoraI(x, cx, cy, s, a) { if (a <= 0.01 || !NVI) return; desenharForma(NVI, FI.ancora, { cx, cy: cy - 15 * s, esc: 190 * s, rot: 0.15 * Math.sin(TI * 1.5), cor: CORF.branco, a, t: TI }); }
function servidorI(x, cx, cy, s, cor, a, t) { if (a <= 0.01 || !NVI) return; desenharForma(NVI, FI.servidor, { cx, cy, esc: 230 * s, cor: corI(cor), a, t: TI }); }
function casaI(x, cx, cy, s, a) { if (a <= 0.01 || !NVI) return; desenharForma(NVI, FI.casa, { cx, cy: cy - 30 * s, esc: 230 * s, cor: CORF.branco, a, t: TI }); }
function satI(x, cx, cy, s, a) { if (a <= 0.01 || !NVI) return; desenharForma(NVI, FI.sat, { cx, cy, esc: 150 * s, cor: CORF.branco, a, t: TI }); }
function xisI(x, cx, cy, r, a) { if (a <= 0.01 || !NVI) return; const e = Math.min(1, a * 1.5); desenharForma(NVI, FI.xis, { cx, cy, esc: 2.4 * r * (0.7 + 0.3 * e), cor: CORF.vermelho, a, t: TI }); }
function hackerI(x, cx, cy, s, a) { if (a <= 0.01 || !NVI) return; desenharForma(NVI, FI.hacker, { cx, cy, esc: 260 * s, cor: CORF.lilas, a, t: TI }); }
function mangueiraI(x, cx, cy, s, a) { if (a <= 0.01 || !NVI) return; desenharForma(NVI, FI.mangueira, { cx: cx + 40 * s, cy: cy + 40 * s, esc: 300 * s, cor: CORF.verde, a, t: TI }); }
function checkI(x, cx, cy, r, a, cor = VD) { if (a <= 0.01 || !NVI) return; desenharForma(NVI, FI.check, { cx, cy, esc: 2.4 * r, cor: corI(cor), a, t: TI }); }
function fCelular(x, cx, cy, h, cor, a, tela = 0.12) { if (a <= 0.01 || !NVI) return; desenharForma(NVI, FI.cel, { cx, cy, esc: h * 1.05, cor: corI(cor), a, t: TI }); }
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) { if (a <= 0.01 || !NVI) return; balaoPergunta(NVI, x, t, a, cx, cy, 600 * s); }
function setaComent(x, a, t) { setaComentarios(x, a, t); }
