// Cenas do vídeo "Como a internet atravessa os oceanos" — pontos de luz.
// Retenção: meio-saber (você acha que foi pelo satélite?), promessa (o maior inimigo, não é tubarão),
// assombro (1 milhão de km, 25 voltas na Terra), re-gancho (onde chegam no Brasil?) e dica do servidor.

const MD = MotionDirector;
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245", AZ = "80,160,255", CZ = "120,130,160";
const estF = (seed) => ambienteP(220, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.6);
const vecI = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
function projI(lat0, lon0, R, cx, cy) { const ca = Math.cos(-lon0 * Math.PI / 180), sa = Math.sin(-lon0 * Math.PI / 180), cb = Math.cos(lat0 * Math.PI / 180), sb = Math.sin(lat0 * Math.PI / 180); return (v) => { const x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca, y2 = v[1] * cb - z1 * sb, z2 = v[1] * sb + z1 * cb; return [cx + x1 * R, cy - y2 * R, z2]; }; }
const TERRA_I = (() => { const o = []; for (let k = 0; k < GLOBO_TERRA.length; k += 2) o.push(vecI(GLOBO_TERRA[k] / 10, GLOBO_TERRA[k + 1] / 10)); for (let k = 0; k < GLOBO_BRASIL.length; k += 4) o.push(vecI(GLOBO_BRASIL[k] / 10, GLOBO_BRASIL[k + 1] / 10)); return o; })();
// globo de pontos; devolve a projeção para desenhar cabos por cima
function globoI(nv, x, cx, cy, R, lat0, lon0, a) {
  const pj = projI(lat0, lon0, R, cx, cy); if (a <= 0.01) { nv.total(0); return pj; }
  brilhoP(x, cx, cy, R * 1.25, "60,140,255", 0.2 * a); anelP(x, cx, cy, R, CI, 0.35 * a, 3);
  const g = x.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R); g.addColorStop(0, `rgba(60,120,255,${0.22 * a})`); g.addColorStop(1, "rgba(20,40,120,0.02)"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
  let i = 0; for (const v of TERRA_I) { const [px, py, z] = pj(v); if (z <= 0) continue; nv.ponto(i++, px, py, 0.55, 0.9, 0.62, a * (0.3 + 0.6 * z), Math.max(2.4, R / 140)); } nv.total(i); return pj;
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

// =============== 1. gancho ===============
// quadro 0 = o plano mais impressionante: o cabo brilhando no fundo do mar, câmera mergulhando.
CENAS.abertura = (el, c, B) => {
  const tAq = B("aqui"), tM = B("mangueira0"), tSa = B("satelite"), tN = B("nao"), tAt = B("atlantico"), tS = B("segundo"), tP = B("promessa");
  mostrarGancho(tSa - 0.4);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["sat", 330, 76, "satélite?", "pt-am"], ["atl", 330, 62, "desce até o fundo do Atlântico", "pt-ci", "white-space:normal;left:60px;width:960px"], ["seg", 330, 70, "menos de 1 segundo", "pt-am"], ["ini", 330, 66, "o maior inimigo deles?", "pt-ve"]]);
  MD.slam(tl, tx.sat, tSa - 0.05, { from: 1.35 }); MD.leave(tl, tx.sat, tAt - 0.35); MD.slam(tl, tx.atl, tAt - 0.05, { from: 1.2 }); MD.leave(tl, tx.atl, tS - 0.3); MD.slam(tl, tx.seg, tS - 0.05, { from: 1.3 }); MD.leave(tl, tx.seg, tP - 2.0); MD.slam(tl, tx.ini, tP - 1.7, { from: 1.3 });
  const nv = T.nuvem(9000), est = estF(3), CX = 540, CY = 930, R = 380, troca = tSa - 0.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    // ---- plano 1: fundo do mar (0 → satélite)
    const a1 = 1 - PT.ss((t - troca) / 0.5);
    if (a1 > 0.01) {
      const z = PT.lerp(1.25, 1.0, PT.out(Math.min(1, t / (troca + 0.5)))) ; x.save(); x.globalAlpha = a1; x.translate(540, 1100); x.scale(z, z); x.translate(-540, -1100);
      marI(x, t, 700, 1330, 1);
      // feixes de luz vindos da superfície
      for (let k = 0; k < 5; k++) { const px = 140 + k * 200 + Math.sin(t * 0.4 + k) * 30; const g = x.createLinearGradient(0, 710, 0, 1200); g.addColorStop(0, "rgba(140,200,255,0.12)"); g.addColorStop(1, "rgba(140,200,255,0)"); x.fillStyle = g; x.beginPath(); x.moveTo(px - 30, 710); x.lineTo(px + 30, 710); x.lineTo(px + 120, 1200); x.lineTo(px + 20, 1200); x.closePath(); x.fill(); }
      // cabos ao fundo (profundidade)
      for (const [yy, aa] of [[1110, 0.25], [1160, 0.35]]) { x.beginPath(); for (let px = -40; px <= 1120; px += 12) { const py = yy + Math.sin(px * 0.008 + yy) * 14; px === -40 ? x.moveTo(px, py) : x.lineTo(px, py); } x.strokeStyle = `rgba(${CI},${aa})`; x.lineWidth = 6; x.stroke(); }
      // o cabo principal, grosso e brilhando, com pulsos de luz correndo
      const yc = (px) => 1250 + Math.sin(px * 0.006) * 22;
      x.beginPath(); for (let px = -40; px <= 1120; px += 10) px === -40 ? x.moveTo(px, yc(px)) : x.lineTo(px, yc(px)); x.strokeStyle = `rgba(${CI},0.12)`; x.lineWidth = 46; x.stroke(); x.strokeStyle = `rgba(${BRC},0.45)`; x.lineWidth = 20; x.stroke(); x.strokeStyle = `rgba(${CI},0.6)`; x.lineWidth = 4; x.stroke();
      for (let k = 0; k < 9; k++) { const u = ((t * 0.32 + k / 9) % 1), px = -40 + u * 1160; discoP(x, px, yc(px), 8, AM, 0.9); brilhoP(x, px, yc(px), 55, AM, 0.5); }
      // "passa por aqui": alvo pulsando no cabo
      const aA = PT.ss((t - tAq + 0.3) / 0.4); if (aA > 0) { const p = ((t - tAq) * 1.2) % 1; anelP(x, 540, yc(540), 60 + p * 90, AM, aA * (1 - p), 5); anelP(x, 540, yc(540), 60, AM, aA, 6); fSeta(x, 540, 900, 540, yc(540) - 80, AM, aA, 7); }
      // "grossura de uma mangueira": medida
      const aM = PT.ss((t - tM + 0.3) / 0.4); if (aM > 0) { linhaP(x, 700, yc(700) - 30, 700, yc(700) + 30, VD, aM, 4); rotuloP(x, "≈ 2 cm", 700, yc(700) - 75, 40, "160,255,210", aM); }
      x.restore();
    }
    // ---- plano 2: o globo (satélite? não. cabos.)
    const a2 = PT.ss((t - troca) / 0.5);
    const pj = globoI(nv, x, CX, CY, R, 12, -28 + (t - troca) * 0.8, a2);
    if (a2 > 0.01) {
      const pA = pj(vecI(...FOR)), pB = pj(vecI(...SIN));
      for (const [p, nome] of [[pA, "Brasil"], [pB, "Portugal"]]) { discoP(x, p[0], p[1], 12, AM, a2); brilhoP(x, p[0], p[1], 50, AM, 0.5 * a2); rotuloP(x, nome, p[0], p[1] + 46, 30, "255,226,140", a2); }
      const aSa = PT.jan(t, troca, tAt - 0.2, 0.4, 0.4); if (aSa > 0) { const S = [CX + 330, CY - R - 20]; satI(x, S[0], S[1], 1.1, aSa); x.setLineDash([10, 12]); linhaP(x, pA[0], pA[1], S[0], S[1] + 20, BRC, 0.6 * aSa, 3); linhaP(x, S[0], S[1] + 20, pB[0], pB[1], BRC, 0.6 * aSa, 3); x.setLineDash([]); xisI(x, PT.lerp(pA[0], S[0], 0.6), PT.lerp(pA[1], S[1], 0.6), 44, PT.ss((t - tN + 0.15) / 0.3) * aSa); }
      // a mensagem desce e atravessa pelo cabo
      const aC = PT.ss((t - tAt + 0.4) / 0.6); if (aC > 0) { const pr = PT.ss((t - tAt + 0.2) / 2.2); arcoI(x, pj, FOR, SIN, AM, aC, Math.max(0.02, pr), 6); const p = pontoArco(pj, FOR, SIN, pr); discoP(x, p[0], p[1], 12, AM, aC); brilhoP(x, p[0], p[1], 70, AM, 0.8 * aC); }
      const aT = PT.ss((t - tS + 0.4) / 0.8); if (aT > 0) CABOS.forEach((cb, k) => { if (k) arcoI(x, pj, cb[0], cb[1], CI, 0.6 * aT, PT.ss((t - tS + 0.4 - k * 0.08) / 1.2), 3); });
      // promessa: um tubarão passa na frente
      const aTu = PT.ss((t - tP + 1.8) / 0.5); if (aTu > 0) tubaraoI(x, PT.lerp(1200, -150, PT.ss((t - tP + 1.8) / 3.5)), 1250, 1.3, 0.8 * aTu);
    }
  });
};

// =============== 2. dentro do cabo ===============
CENAS.cabo = (el, c, B) => {
  const tM = B("mangueira"), tV = B("vidro"), tL = B("luz"), tBi = B("bilhoes"), tQ = B("quica");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["man", 330, 66, "plástico, aço e cobre", "pt-ci"], ["vid", 330, 66, "fios de vidro finos como cabelo", "pt-am", "white-space:normal;left:60px;width:960px"], ["luz", 330, 70, "a mensagem vira luz", "pt-am"], ["qui", 330, 66, "a luz quica e não escapa", "pt-ci"]]);
  MD.slam(tl, tx.man, tM - 0.05, { from: 1.25 }); MD.leave(tl, tx.man, tV - 0.3); MD.slam(tl, tx.vid, tV - 0.05, { from: 1.2 }); MD.leave(tl, tx.vid, tL - 0.3); MD.slam(tl, tx.luz, tL - 0.05, { from: 1.3 }); MD.leave(tl, tx.luz, tQ - 0.3); MD.slam(tl, tx.qui, tQ - 0.05, { from: 1.25 });
  const est = estF(5);
  T.quadro((x, t) => {
    estD(x, est, t);
    // corte do cabo (aparece logo no início, cresce na "mangueira")
    const aC = PT.ss((t - c.ini - 0.3) / 0.5) * (1 - PT.ss((t - tL + 0.5) / 0.5)), cr = PT.lerp(120, 230, PT.ss((t - tM + 0.2) / 0.6)), CX = 540, CY = 820;
    if (aC > 0) {
      anelP(x, CX, CY, cr, BRC, aC, 8); anelP(x, CX, CY, cr * 0.78, "120,150,200", 0.6 * aC, 5);
      for (let k = 0; k < 16; k++) { const an = k / 16 * 6.283; discoP(x, CX + Math.cos(an) * cr * 0.6, CY + Math.sin(an) * cr * 0.6, cr * 0.07, "170,180,200", 0.6 * aC); }
      anelP(x, CX, CY, cr * 0.42, LA, 0.8 * aC, 6); anelP(x, CX, CY, cr * 0.26, CI, 0.6 * aC, 3);
      const aV = PT.ss((t - tV + 0.3) / 0.5); for (let k = 0; k < 8; k++) { const an = k / 8 * 6.283 + 0.3, px = CX + Math.cos(an) * cr * 0.14, py = CY + Math.sin(an) * cr * 0.14; discoP(x, px, py, 6, aV > 0 ? CI : CZ, aC); if (aV > 0) brilhoP(x, px, py, 30, CI, 0.6 * aV * aC); }
      rotuloP(x, "≈ 2 cm", CX, CY + cr + 60, 34, "200,240,255", aC * PT.ss((t - tM) / 0.5));
      if (aV > 0) { linhaP(x, CX + 30, CY, CX + 300, CY + 240, CI, 0.7 * aV * aC, 3); rotuloP(x, "fibra de vidro", CX + 300, CY + 280, 30, "200,240,255", aV * aC); }
    }
    // a fibra vista de lado: luz piscando e quicando
    const aF = PT.ss((t - tL + 0.4) / 0.6); if (aF > 0) {
      const y0 = 780, y1 = 980; x.fillStyle = `rgba(${CI},${0.06 * aF})`; x.fillRect(60, y0, 960, y1 - y0); linhaP(x, 60, y0, 1020, y0, CI, 0.8 * aF, 5); linhaP(x, 60, y1, 1020, y1, CI, 0.8 * aF, 5);
      const vel = t > tBi ? 2.2 : 1.0, aQ = PT.ss((t - tQ + 0.3) / 0.5);
      for (let k = 0; k < 7; k++) { const u = ((t * 0.35 * vel + k / 7) % 1), px = 60 + u * 960, on = Math.sin((t * (t > tBi ? 30 : 8)) + k * 1.7) > -0.2;
        const fase = (u * 960 / 200) % 2, py = aQ > 0 ? PT.lerp(y0 + 14, y1 - 14, fase < 1 ? fase : 2 - fase) * aQ + (y0 + y1) / 2 * (1 - aQ) : (y0 + y1) / 2;
        if (on) { discoP(x, px, py, 11, AM, aF); brilhoP(x, px, py, 60, AM, 0.6 * aF); } }
      if (aQ > 0) { x.beginPath(); for (let px = 60; px <= 1020; px += 10) { const f = ((px - 60) / 200) % 2, py = PT.lerp(y0 + 14, y1 - 14, f < 1 ? f : 2 - f); px === 60 ? x.moveTo(px, py) : x.lineTo(px, py); } x.strokeStyle = `rgba(${AM},${0.3 * aQ})`; x.lineWidth = 3; x.stroke(); }
      rotuloP(x, "bilhões de piscadas por segundo", 540, 1110, 34, "255,226,140", PT.ss((t - tBi + 0.2) / 0.4));
    }
  });
};

// =============== 3. a viagem da luz ===============
CENAS.viagem = (el, c, B) => {
  const tS = B("seismil"), tSe = B("sessenta"), tE = B("enfraquece"), tSt = B("setenta"), tR = B("reforco"), tLu = B("lugar");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["km", 330, 76, "≈ 6.000 km", "pt-ci"], ["ms", 330, 66, "ida e volta: < 60 ms", "pt-am"], ["fra", 330, 70, "a luz enfraquece", "pt-ve"], ["amp", 330, 60, "um reforço a cada ~70 km", "pt-ve", "color:#78ffbe"], ["ond", 330, 62, "onde eles chegam no Brasil?", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.km, tS - 0.05, { from: 1.3 }); MD.leave(tl, tx.km, tSe - 0.3); MD.slam(tl, tx.ms, tSe - 0.05, { from: 1.25 }); MD.leave(tl, tx.ms, tE - 0.3); MD.slam(tl, tx.fra, tE - 0.05, { from: 1.3 }); MD.leave(tl, tx.fra, tSt - 0.3); MD.slam(tl, tx.amp, tSt - 0.05, { from: 1.2 }); MD.leave(tl, tx.amp, tLu - 1.9); MD.slam(tl, tx.ond, tLu - 1.6, { from: 1.25 });
  const est = estF(7), YS = 560, YF = 1180, X0 = 150, X1 = 930;
  T.quadro((x, t) => {
    estD(x, est, t);
    marI(x, t, YS, YF);
    // costas: Brasil à esquerda, Portugal à direita
    for (const [px, nome, s] of [[X0, "Fortaleza", -1], [X1, "Portugal", 1]]) { x.beginPath(); x.moveTo(px + s * 160, YS - 20); x.lineTo(px - s * 10, YS - 20); x.lineTo(px + s * 30, YF + 10); x.lineTo(px + s * 160, YF + 10); x.closePath(); x.fillStyle = `rgba(120,255,190,0.08)`; x.fill(); x.strokeStyle = `rgba(${VD},0.7)`; x.lineWidth = 4; x.stroke(); rotuloP(x, nome, px + s * 40, YS - 60, 32, "160,255,210", 1); }
    // o cabo no fundo
    const yc = (px) => YF - 30 + Math.sin(px * 0.011) * 14; x.beginPath(); for (let px = X0 + 20; px <= X1 - 20; px += 10) { px === X0 + 20 ? x.moveTo(px, yc(px)) : x.lineTo(px, yc(px)); } x.strokeStyle = `rgba(${BRC},0.85)`; x.lineWidth = 7; x.stroke();
    // amplificadores
    const aA = PT.ss((t - tSt + 0.3) / 0.5), NA = 6; for (let k = 1; k <= NA; k++) { const px = X0 + 20 + k * (X1 - X0 - 40) / (NA + 1); fCaixa(x, px, yc(px), 46, 30, 8, VD, aA * PT.ss((t - tSt - k * 0.12) / 0.3), 4, 0.25); }
    // o pulso de luz: vai e volta; enfraquece; com amplificador, recupera
    const aP = PT.ss((t - c.ini - 0.5) / 0.5), per = 2.6, u = ((t - c.ini) / per) % 1, ida = u < 0.5, s = ida ? u * 2 : 2 - u * 2, px = X0 + 20 + s * (X1 - X0 - 40);
    const fraco = PT.ss((t - tE + 0.4) / 0.5), seg = (X1 - X0 - 40) / (NA + 1), dentro = ((px - X0 - 20) % seg) / seg;
    const brilho = aA > 0.5 ? 1 - 0.5 * dentro : 1 - fraco * 0.85 * (ida ? s : 1 - s);
    discoP(x, px, yc(px), 12, AM, aP * Math.max(0.15, brilho)); brilhoP(x, px, yc(px), 80, AM, 0.8 * aP * Math.max(0.1, brilho));
    if (aA > 0.5 && dentro < 0.12) brilhoP(x, px, yc(px), 120, VD, 0.6 * (1 - dentro / 0.12));
    rotuloP(x, "≈ 6.000 km", 540, YF + 90, 34, "200,240,255", PT.ss((t - tS + 0.3) / 0.5));
    navioI(x, 760 - (t - c.ini) * 6, YS - 4, 0.6, 0.6);
  });
};

// =============== 4. a rede do mundo ===============
CENAS.rede = (el, c, B) => {
  const tS = B("seiscentos"), tM = B("milhao"), tV = B("voltas"), tPr = B("praia"), tF = B("futuro"), tCa = B("casa");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["n600", 330, 76, "≈ 600 cabos", "pt-ci"], ["km", 330, 66, "+ de 1 milhão de km", "pt-am"], ["vol", 330, 66, "25 voltas na Terra", "pt-am"], ["pra", 330, 62, "Praia do Futuro, Fortaleza", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx["n600"], tS - 0.05, { from: 1.3 }); MD.leave(tl, tx.n600, tM - 0.3); MD.slam(tl, tx.km, tM - 0.05, { from: 1.25 }); MD.leave(tl, tx.km, tV - 0.3); MD.slam(tl, tx.vol, tV - 0.05, { from: 1.3 }); MD.leave(tl, tx.vol, tPr - 0.3); MD.slam(tl, tx.pra, tPr - 0.05, { from: 1.2 });
  const nv = T.nuvem(9000), est = estF(9), r = prng(91);
  const MUITOS = Array.from({ length: 40 }, () => [[(r() - 0.5) * 120, (r() - 0.5) * 300], [(r() - 0.5) * 120, (r() - 0.5) * 300]]);
  const CAB = [[-6.5, 200], [-4.2, 200], [-2, 210], [0.5, 230], [3, 250], [-9, 300], [-12, 240], [8, 280], [-1, 270], [5, 220], [-7.5, 260], [10, 250], [1.5, 300], [-3.2, 320], [6.5, 320]];
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tPr + 0.6) / 0.6), zoom = PT.ss((t - tPr + 0.8) / 1.0);
    const R = PT.lerp(380, 1400, zoom), cx = 540, cy = PT.lerp(930, 930 + 1400 * 0.06, zoom);
    const pj = globoI(nv, x, cx, cy, R, PT.lerp(12, -4, zoom), PT.lerp(-36 + (t - c.ini) * 0.6, -38.5, zoom), sai);
    if (sai > 0.01) {
      CABOS.forEach((cb) => arcoI(x, pj, cb[0], cb[1], CI, 0.7 * sai, 1, 3));
      const nM = Math.round(PT.lerp(0, 40, PT.ss((t - tS + 0.3) / 1.6))); for (let k = 0; k < nM; k++) arcoI(x, pj, MUITOS[k][0], MUITOS[k][1], k % 3 ? CI : AM, 0.45 * sai, 1, 2);
      // a "linha" de 1 milhão de km enrolando na Terra
      const aV = PT.ss((t - tV + 0.3) / 0.5); if (aV > 0) for (let k = 0; k < 25 * PT.ss((t - tV + 0.3) / 2.5); k++) { const inc = -40 + k * 3.3; x.beginPath(); x.ellipse(cx, cy, R * 1.04 + k * 2, R * 0.25, inc * Math.PI / 180, 0, 6.283); x.strokeStyle = `rgba(${AM},${0.25 * aV * sai})`; x.lineWidth = 2; x.stroke(); }
      rotuloP(x, "1.000.000 km", cx, cy + R + 70, 34, "255,226,140", PT.ss((t - tM + 0.3) / 0.5) * sai);
    }
    // close na Praia do Futuro: os cabos convergem num ponto
    const aP = PT.ss((t - tPr + 0.2) / 0.6); if (aP > 0) {
      x.beginPath(); x.moveTo(0, 820); x.bezierCurveTo(260, 760, 420, 900, 560, 860); x.bezierCurveTo(720, 820, 860, 700, 1080, 640); x.strokeStyle = `rgba(${VD},${0.8 * aP})`; x.lineWidth = 5; x.stroke();
      x.lineTo(1080, 300); x.lineTo(0, 300); x.closePath(); x.fillStyle = `rgba(120,255,190,${0.06 * aP})`; x.fill();
      const P0 = [560, 860], aF = PT.ss((t - tF + 0.3) / 0.6);
      CAB.forEach(([ang, len], k) => { const an = (90 + ang * 6) * Math.PI / 180, ex = P0[0] + Math.cos(an) * 900, ey = P0[1] + Math.sin(an) * 900, pr = PT.ss((t - tF + 0.3 - k * 0.07) / 0.8); if (pr > 0) { linhaP(x, ex, ey, PT.lerp(ex, P0[0], pr), PT.lerp(ey, P0[1], pr), k % 4 ? CI : AM, 0.75 * aP, 3); const u = ((t * 0.5 + k * 0.17) % 1); if (pr >= 1) discoP(x, PT.lerp(ex, P0[0], u), PT.lerp(ey, P0[1], u), 6, AM, 0.9 * aF); } });
      discoP(x, P0[0], P0[1], 16, AM, aP); brilhoP(x, P0[0], P0[1], 90, AM, 0.7 * aP); rotuloP(x, "+15 cabos", P0[0] + 170, P0[1] + 40, 32, "255,226,140", aF);
      // segue por terra até a casa
      const aC = PT.ss((t - tCa + 1.6) / 0.8); if (aC > 0) { const H = [250, 640], pr = PT.ss((t - tCa + 1.4) / 1.2); linhaP(x, P0[0], P0[1], PT.lerp(P0[0], H[0], pr), PT.lerp(P0[1], H[1], pr), AM, aC, 4); casaI(x, H[0], H[1], 0.9, aC); const u = ((t * 0.7) % 1); if (pr >= 1) discoP(x, PT.lerp(P0[0], H[0], u), PT.lerp(P0[1], H[1], u), 8, AM, aC); }
    }
  });
};

// =============== 5. o maior inimigo ===============
CENAS.inimigo = (el, c, B) => {
  const tT = B("tubarao"), tC = B("cento"), tP = B("pesca"), tA = B("ancoras"), tD = B("desvia"), tN = B("navio"), tE = B("emenda");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["tub", 330, 76, "não é tubarão", "pt-ve"], ["n150", 330, 66, "≈ 150 rompimentos por ano", "pt-am", "white-space:normal;left:60px;width:960px"], ["anc", 330, 66, "redes de pesca e âncoras", "pt-ve"], ["des", 330, 66, "a internet desvia", "pt-ci"], ["eme", 330, 70, "um navio emenda o cabo", "pt-ve", "color:#78ffbe"]]);
  MD.slam(tl, tx.tub, tT - 0.05, { from: 1.3 }); MD.leave(tl, tx.tub, tC - 0.3); MD.slam(tl, tx["n150"], tC - 0.05, { from: 1.2 }); MD.leave(tl, tx.n150, tP - 0.3); MD.slam(tl, tx.anc, tP - 0.05, { from: 1.25 }); MD.leave(tl, tx.anc, tD - 0.3); MD.slam(tl, tx.des, tD - 0.05, { from: 1.25 }); MD.leave(tl, tx.des, tN - 0.1); MD.slam(tl, tx.eme, tN + 0.2, { from: 1.25 });
  const est = estF(11), YS = 620, YF = 1270;
  T.quadro((x, t) => {
    estD(x, est, t);
    marI(x, t, YS, YF);
    const quebra = t > tA + 0.6 && t < tE - 0.3, conserto = PT.ss((t - tN - 0.5) / 1.5), sobe = PT.jan(t, tN + 0.3, tE + 0.4, 1.2, 0.8);
    // cabo principal (sobe pro navio no conserto)
    const yc = (px) => YF - 30 + Math.sin(px * 0.011) * 12 - sobe * 420 * Math.exp(-Math.pow((px - 560) / 220, 2));
    for (const [a0, a1] of quebra ? [[0, 500], [620, 1080]] : [[0, 1080]]) { x.beginPath(); for (let px = a0; px <= a1; px += 10) px === a0 ? x.moveTo(px, yc(px)) : x.lineTo(px, yc(px)); x.strokeStyle = `rgba(${t > tE - 0.3 ? VD : BRC},0.9)`; x.lineWidth = 7; x.stroke(); }
    if (quebra) { brilhoP(x, 560, yc(560), 110, VE, 0.6); rotuloP(x, "cabo rompido", 560, yc(560) + 70, 32, "255,170,180", PT.ss((t - tA - 0.6) / 0.4)); }
    if (quebra && t < tA + 1.6) faiscasP(x, 560, yc(560), t - tA - 0.6);
    // pulso de dados no cabo principal (para quando quebra)
    if (!quebra) { const u = ((t - c.ini) * 0.4) % 1; discoP(x, u * 1080, yc(u * 1080), 9, AM, 0.9); brilhoP(x, u * 1080, yc(u * 1080), 50, AM, 0.6); }
    // segundo cabo (desvio)
    const aD = PT.ss((t - tD + 0.3) / 0.5), y2 = (px) => YF - 120 + Math.sin(px * 0.013 + 1) * 10; x.beginPath(); for (let px = 0; px <= 1080; px += 10) px ? x.lineTo(px, y2(px)) : x.moveTo(px, y2(px)); x.strokeStyle = `rgba(${aD > 0 ? CI : CZ},${0.4 + 0.4 * aD})`; x.lineWidth = 5; x.stroke();
    if (aD > 0) for (let k = 0; k < 3; k++) { const u = ((t - tD) * 0.4 + k / 3) % 1; discoP(x, u * 1080, y2(u * 1080), 8, AM, aD); brilhoP(x, u * 1080, y2(u * 1080), 44, AM, 0.6 * aD); }
    // tubarão inocente
    const aTu = PT.ss((t - c.ini - 0.4) / 0.6) * (1 - PT.ss((t - tC) / 0.6)); tubaraoI(x, 900 - (t - c.ini) * 40, 860, 1, aTu); xisI(x, 900 - (tT - c.ini) * 40 + 10, 860, 50, PT.ss((t - tT + 0.15) / 0.3) * aTu);
    // barco pesqueiro + rede arrastando
    const aB = PT.jan(t, tC - 0.3, tD, 0.5, 0.6), bx = PT.lerp(1180, 240, PT.ss((t - tC + 0.3) / 4.5));
    if (aB > 0) { navioI(x, bx, YS - 4, 0.7, aB); const rx = bx + 120, ry = YF - 70; linhaP(x, bx + 60, YS + 10, rx, ry - 50, BRC, 0.6 * aB, 3); linhaP(x, bx + 60, YS + 10, rx + 180, ry - 50, BRC, 0.6 * aB, 3); for (let k = 0; k <= 6; k++) { linhaP(x, rx + k * 30, ry - 50, rx + k * 30, ry + 10, CZ, 0.7 * aB, 2); } for (let k = 0; k <= 3; k++) linhaP(x, rx, ry - 50 + k * 20, rx + 180, ry - 50 + k * 20, CZ, 0.7 * aB, 2); }
    // âncora arrastando
    const aA = PT.jan(t, tA - 0.4, tD, 0.4, 0.6); if (aA > 0) { const ax = PT.lerp(360, 640, PT.ss((t - tA) / 1.2)), ay = PT.lerp(YS + 60, YF - 50, PT.ss((t - tA + 0.4) / 0.6)); linhaP(x, 300, YS, ax, ay - 70, BRC, 0.6 * aA, 3); ancoraI(x, ax, ay, 0.9, aA); navioI(x, 300, YS - 4, 0.8, aA, LA); }
    // navio de reparo
    const aN = PT.ss((t - tN + 0.4) / 0.6); if (aN > 0) { navioI(x, 560, YS - 4, 1.0, aN, VD); linhaP(x, 610, YS - 100, 560, yc(560), VD, 0.6 * aN * conserto, 3); }
    if (t > tE - 0.3) { brilhoP(x, 560, yc(560), 90, VD, 0.7 * PT.jan(t, tE - 0.3, c.fim, 0.2, 0.5)); }
  });
};
function faiscasP(x, cx, cy, u) { const r = prng(77); for (let k = 0; k < 18; k++) { const an = r() * 6.283, v = 60 + r() * 140, d = u * v; discoP(x, cx + Math.cos(an) * d, cy + Math.sin(an) * d - u * u * 40, 4, AM, Math.max(0, 1 - u)); } brilhoP(x, cx, cy, 70, AM, Math.max(0, 0.8 - u)); }

// =============== 6. a dica ===============
CENAS.dica = (el, c, B) => {
  const tS = B("servidor"), tA = B("atraso"), tR = B("resolve");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["srv", 330, 66, "jogo? servidor no Brasil", "pt-am"], ["atr", 330, 66, "oceano no meio = atraso", "pt-ve"], ["res", 330, 60, "internet mais rápida não resolve", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.srv, tS - 0.05, { from: 1.25 }); MD.leave(tl, tx.srv, tA - 1.9); MD.slam(tl, tx.atr, tA - 1.6, { from: 1.25 }); MD.leave(tl, tx.atr, tR - 0.35); MD.slam(tl, tx.res, tR - 0.05, { from: 1.2 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    const a0 = PT.ss((t - c.ini - 0.3) / 0.5);
    fCelular(x, 200, 980, 360, BRC, a0, 0.08); rotuloP(x, "▶", 200, 980, 70, "255,226,140", a0); rotuloP(x, "você", 200, 1210, 30, "220,228,245", a0);
    const aS = PT.ss((t - tS + 0.3) / 0.5), SB = [560, 700], SE = [900, 1180];
    servidorI(x, SB[0], SB[1], 0.9, VD, aS, t); rotuloP(x, "Brasil", SB[0], SB[1] + 110, 30, "160,255,210", aS);
    servidorI(x, SE[0], SE[1], 0.9, VE, aS, t); rotuloP(x, "outro continente", SE[0] - 30, SE[1] + 110, 30, "255,170,180", aS);
    // mar entre você e o servidor longe
    if (aS > 0) { x.beginPath(); for (let px = 330; px <= 790; px += 12) { const py = 1100 + Math.sin(px * 0.03 + t * 2) * 8; px === 330 ? x.moveTo(px, py) : x.lineTo(px, py); } x.strokeStyle = `rgba(${CI},${0.6 * aS})`; x.lineWidth = 4; x.stroke(); rotuloP(x, "oceano", 560, 1150, 28, "180,230,255", aS); }
    // pings: perto = rápido, longe = demora
    if (aS > 0) { const u1 = ((t - tS) * 1.6) % 1, u2 = ((t - tS) * 0.45) % 1; discoP(x, PT.lerp(290, SB[0] - 90, u1), PT.lerp(940, SB[1], u1), 9, VD, aS); x.setLineDash([8, 10]); linhaP(x, 290, 940, SB[0] - 90, SB[1], VD, 0.5 * aS, 3); linhaP(x, 290, 1020, SE[0] - 90, SE[1], VE, 0.5 * aS, 3); x.setLineDash([]); discoP(x, PT.lerp(290, SE[0] - 90, u2), PT.lerp(1020, SE[1], u2), 9, VE, aS); }
    const aA = PT.ss((t - tA + 1.8) / 0.5); rotuloP(x, "ping baixo ✓", SB[0] + 170, SB[1] - 120, 32, "160,255,210", aA, "left"); rotuloP(x, "+ dezenas de ms", SE[0] - 10, SE[1] - 140, 32, "255,170,180", aA);
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["a mensagem vira luz", "a luz corre num fio de vidro", "amplificadores dão reforço", "chega em milésimos de segundo"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const nv = T.nuvem(9000), est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5), a0 = PT.ss((t - c.ini - 0.2) / 0.5) * sai;
    const pj = globoI(nv, x, 540, 1270, 170, 12, -30 + t * 2, 0.75 * a0);
    if (a0 > 0.01) CABOS.forEach((cb, k) => arcoI(x, pj, cb[0], cb[1], k ? CI : AM, 0.6 * a0, 1, 2));
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [AM, CI, VD, AM][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
