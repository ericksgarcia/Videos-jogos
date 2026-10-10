// Cenas do vídeo "Como o fone com cancelamento de ruído apaga o som" — pontos de luz na GPU.
// Retenção: paradoxo no gancho (para criar silêncio, toca MAIS som), promessa (por que a voz passa),
// a onda e a anti-onda se apagando (imagem forte), corrida contra o tempo e dica prática.

const MD = MotionDirector;
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.5);

// onda senoidal em pontos (2D); fase em radianos, amp em px
function ondaP(x, x0, x1, cy, amp, k, fase, cor, a, lw = 5, n = 160) { if (a <= 0.01) return; x.beginPath(); for (let q = 0; q <= n; q++) { const u = q / n, px = x0 + (x1 - x0) * u, py = cy + Math.sin(u * k + fase) * amp; q ? x.lineTo(px, py) : x.moveTo(px, py); } x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = lw; x.lineJoin = "round"; x.stroke(); }
function fone(x, cx, cy, s, a, ligado = 0) { if (a <= 0.01) return; x.beginPath(); x.arc(cx, cy, 230 * s, Math.PI * 1.05, Math.PI * 1.95); x.strokeStyle = `rgba(${BRC},${a})`; x.lineWidth = 18 * s; x.stroke(); for (const sx of [-1, 1]) { fCaixa(x, cx + sx * 220 * s, cy + 40 * s, 120 * s, 200 * s, 50 * s, ligado > 0.5 ? CI : BRC, a, 6 * s, 0.1 + 0.15 * ligado); if (ligado > 0) brilhoP(x, cx + sx * 220 * s, cy + 40 * s, 150 * s, CI, 0.3 * ligado * a); } }
function aviao(x, cx, cy, s, a) { if (a <= 0.01) return; fRR(x, cx - 260 * s, cy - 40 * s, 520 * s, 80 * s, 40 * s); x.strokeStyle = `rgba(${BRC},${a})`; x.lineWidth = 5; x.stroke(); x.beginPath(); x.moveTo(cx - 40 * s, cy); x.lineTo(cx - 140 * s, cy + 170 * s); x.lineTo(cx + 20 * s, cy + 170 * s); x.lineTo(cx + 60 * s, cy); x.stroke(); x.beginPath(); x.moveTo(cx - 200 * s, cy - 30 * s); x.lineTo(cx - 260 * s, cy - 130 * s); x.lineTo(cx - 190 * s, cy - 130 * s); x.lineTo(cx - 150 * s, cy - 35 * s); x.stroke(); for (let k = 0; k < 8; k++) discoP(x, cx - 120 * s + k * 40 * s, cy - 10 * s, 7 * s, CI, 0.6 * a); }
function espectroR(x, cx, cy, w, h, corte, a, rot) { if (a <= 0.01) return; const n = 14; for (let k = 0; k < n; k++) { const u = k / (n - 1), v = 0.55 + 0.3 * Math.sin(u * 5 + 1), g = u < 0.5; const bh = h * v * (g ? 1 - corte : 1 - 0.3 * corte); fCaixa(x, cx - w / 2 + (k + 0.5) * w / n, cy - bh / 2, w / n * 0.7, Math.max(4, bh), 4, g ? LA : CI, a, 2, 0.5); } rotuloP(x, rot, cx, cy + 40, 30, "255,255,255", 0.85 * a); rotuloP(x, "graves", cx - w / 2, cy + 80, 24, "255,190,140", 0.8 * a, "left"); rotuloP(x, "agudos", cx + w / 2, cy + 80, 24, "200,220,255", 0.8 * a, "right"); }

const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
function setaComent(x, a, t) { if (a <= 0.01) return; const b = Math.sin(t * 6) * 16; fSeta(x, 700 + b, 1250, 900 + b, 1250, AM, a, 12); brilhoP(x, 1010, 1250, 90, AM, 0.35 * a * (0.7 + 0.3 * Math.sin(t * 6))); rotuloP(x, "comentários", 780, 1180, 38, "255,226,140", a); }
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 330 * s, 60 * s, CI, a, 8 * s, 0.12);
  x.beginPath(); x.moveTo(cx - 120 * s, cy + 160 * s); x.lineTo(cx - 190 * s, cy + 250 * s); x.lineTo(cx - 40 * s, cy + 160 * s); x.fillStyle = `rgba(${CI},${0.5 * a})`; x.fill();
  brilhoP(x, cx, cy, 380 * s, CI, 0.18 * a); rotuloP(x, txt, cx, cy + 6 * s, 190 * s, "255,226,140", a * (0.85 + 0.15 * Math.sin(t * 4)));
}
// barulho + anti-barulho = silêncio (cancelamento k: 0..1)
function cancelamento(x, t, a, k, y0 = 700) { if (a <= 0.01) return; const am = 70, ff = 16, fs = t * 7; ondaP(x, 120, 960, y0, am, ff, fs, VE, a, 7); rotuloP(x, "barulho", 120, y0 - 90, 34, "255,170,180", a, "left"); rotuloP(x, "+", 540, y0 + 105, 60, "255,255,255", a * k); ondaP(x, 120, 960, y0 + 210, am, ff, fs + Math.PI, CI, a * k, 7); rotuloP(x, "som ao contrário", 120, y0 + 310, 34, "180,235,255", a * k, "left"); const kz = PT.ss((k - 0.5) * 2); rotuloP(x, "=", 540, y0 + 380, 60, "255,255,255", a * kz); ondaP(x, 120, 960, y0 + 490, am * (1 - kz) * 0.9, ff, fs, VD, a * kz, 7); brilhoP(x, 540, y0 + 490, 300, VD, 0.25 * a * kz); rotuloP(x, "silêncio", 540, y0 + 580, 40, "150,255,200", a * kz); }
function pessoaFala(x, cx, cy, s, a, t, cor = AM) { if (a <= 0.01) return; fPessoa(x, cx, cy, s, cor, a); for (let k = 0; k < 3; k++) { const u = ((t * 1.2 + k / 3) % 1); x.beginPath(); x.arc(cx + 40 * s, cy - 70 * s, (20 + u * 60) * s, -0.6, 0.6); x.strokeStyle = `rgba(${cor},${a * (1 - u)})`; x.lineWidth = 4; x.stroke(); } }
// onda irregular (voz)
function vozOnda(x, x0, x1, cy, amp, t, cor, a, lw = 5) { if (a <= 0.01) return; x.beginPath(); for (let q = 0; q <= 200; q++) { const u = q / 200, px = x0 + (x1 - x0) * u, e = 0.4 + 0.6 * Math.abs(Math.sin(u * 5 + t * 2)), py = cy + (Math.sin(u * 60 + t * 9) * 0.6 + Math.sin(u * 23 - t * 5) * 0.4) * amp * e; q ? x.lineTo(px, py) : x.moveTo(px, py); } x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = lw; x.stroke(); }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tA = B("apaga"), tS = B("silencio"), tM = B("maissom"), tB = B("botao"), tSo = B("some"), tP = B("promessa");
  const p2 = tM + 0.6, p3 = tP - 2.4;
  mostrarGancho(tS - 0.6);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["mai", 330, 70, "silêncio = mais som", "pt-am"], ["sum", 330, 76, "o avião some", "pt-ci"], ["voz", 330, 62, "e a voz do lado? no final", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.mai, tS - 0.3, { from: 1.3 }); MD.leave(tl, tx.mai, p2 + 0.4); MD.slam(tl, tx.sum, tSo - 0.05, { from: 1.35 }); MD.leave(tl, tx.sum, p3); MD.slam(tl, tx.voz, p3 + 0.2, { from: 1.25 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano 1 (quadro 0): barulho + som ao contrário = silêncio
    const a1 = 1 - PT.ss((t - p2) / 0.4);
    cancelamento(x, t, a1, PT.ss((t - 0.4) / Math.max(0.8, tA + 0.4)), 640);
    // plano 2: o avião e o fone; aperta o botão e o barulho some
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { aviao(x, 540, 700, 0.9, 0.8 * a2); const lig = PT.ss((t - tB) / 0.3), some = PT.ss((t - tSo + 0.4) / 0.8); for (let k = 0; k < 3; k++) ondaP(x, 80, 1000, 800 + k * 40, 26 * (1 - 0.85 * some), 18 + k * 4, t * (8 + k), VE, 0.6 * (1 - 0.6 * some) * a2, 4); fone(x, 540, 1100, 1.1, a2, lig); ondaP(x, 300, 780, 1130, 30, 14, t * 8 + Math.PI, CI, lig * a2, 5); if (lig > 0) { discoP(x, 540 + 292, 1160, 10, VD, lig * a2); rotuloP(x, "ANC", 540 + 292, 1210, 26, "150,255,200", lig * a2); } }
    // plano 3: alguém falando do lado — a voz passa (teaser)
    const a3 = PT.ss((t - p3) / 0.5);
    if (a3 > 0.01) { fone(x, 380, 1000, 0.8, a3, 1); pessoaFala(x, 800, 1100, 2.4, a3, t); vozOnda(x, 480, 720, 1000, 40, t, AM, a3, 4); rotuloP(x, "?", 540, 780, 130, AM, a3); }
  });
};

// =============== 2. o som é uma onda ===============
CENAS.onda = (el, c, B) => {
  const tE = B("empurrado"), tC = B("corda"), tD = B("desce"), tT = B("timpano"), tP = B("pensa"), tCo = B("contrario");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ar", 330, 62, "som = ar empurrado e puxado", "pt-ci", "white-space:normal;left:60px;width:960px"], ["cor", 330, 70, "como uma corda", "pt-am"], ["tim", 330, 66, "o tímpano vibra", "pt-ci"], ["pen", 330, 76, "pensa rápido", "pt-am"], ["con", 330, 62, "e uma onda ao contrário?", "pt-ve"]]);
  MD.slam(tl, tx.ar, tE - 0.2, { from: 1.2 }); MD.leave(tl, tx.ar, tC - 0.35); MD.slam(tl, tx.cor, tC - 0.05, { from: 1.3 }); MD.leave(tl, tx.cor, tT - 0.35); MD.slam(tl, tx.tim, tT - 0.05, { from: 1.25 }); MD.leave(tl, tx.tim, tP - 0.35); MD.slam(tl, tx.pen, tP - 0.05, { from: 1.4 }); MD.leave(tl, tx.pen, tCo - 1.5); MD.slam(tl, tx.con, tCo - 1.2, { from: 1.25 });
  const nv = T.nuvem(4100), est = estF(5);
  const pB = tC - 0.6, pC = tT - 0.6, pD = tP - 0.4;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o ar apertado e solto (pontos se juntando em faixas)
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    let i = nv.k; if (aA > 0.01) for (let k = 0; k < 4000; k++) { const r0 = (k * 0.6180339) % 1, r1 = (k * 0.7548776) % 1, bx = 100 + r0 * 880, desl = Math.sin(bx * 0.02 - t * 6) * 22, dens = 0.5 + 0.5 * Math.cos(bx * 0.02 - t * 6); nv.ponto(i++, bx + desl, 700 + r1 * 600, 0.56, 0.89, 1.0, aA * (0.25 + 0.55 * dens), 3.2); } nv.total(i);
    if (aA > 0.01) { fCaixa(x, 70, 1000, 60, 260, 12, BRC, aA, 5, 0.15); linhaP(x, 70 + Math.sin(t * 6) * 18, 880, 70 + Math.sin(t * 6) * 18, 1120, AM, aA, 8); }
    // plano B: a corda balançando
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { ondaP(x, 160, 960, 1000, 120 * Math.sin(t * 2.2) * 0.3 + 90, 10, -t * 6, AM, aB, 9); fCaixa(x, 130, 1000 + Math.sin(-t * 6) * 90, 60, 90, 20, "255,210,180", aB, 4, 0.2); rotuloP(x, "sobe", 900, 820, 36, "255,226,140", aB); rotuloP(x, "desce", 900, 1190, 36, "255,226,140", aB); }
    // plano C: o tímpano vibrando
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { ondaP(x, 80, 560, 1000, 50, 12, -t * 8, CI, aC, 6); const v = Math.sin(t * 25) * 18; x.beginPath(); x.ellipse(660 + v, 1000, 40, 200, 0, 0, 6.283); x.strokeStyle = `rgba(255,200,180,${aC})`; x.lineWidth = 8; x.stroke(); brilhoP(x, 660, 1000, 160, "255,200,180", 0.3 * aC); rotuloP(x, "tímpano", 760, 1260, 38, "255,200,180", aC); }
    // plano D: duas ondas iguais, uma ao contrário, se aproximando
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { const j = PT.ss((t - pD) / 3.5); ondaP(x, 120, 960, PT.lerp(820, 940, j), 70, 16, t * 7, VE, aD, 7); ondaP(x, 120, 960, PT.lerp(1180, 1060, j), 70, 16, t * 7 + Math.PI, CI, aD, 7); rotuloP(x, "?", 540, 1000, 120, AM, aD * PT.ss((t - tCo + 0.4) / 0.4)); }
  });
};

// =============== 3. a onda ao contrário ===============
CENAS.anti = (el, c, B) => {
  const tD = B("desce2"), tC = B("cancela"), tS = B("silencio2"), tT = B("trinta"), tL = B("lenta");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["can", 330, 76, "uma cancela a outra", "pt-ci"], ["sil", 330, 96, "silêncio", "pt-ve", "color:#78ffbe"], ["ano", 330, 62, "ideia dos anos 1930", "pt-am"], ["len", 330, 62, "mas a eletrônica era lenta", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.can, tC - 0.1, { from: 1.3 }); MD.leave(tl, tx.can, tS - 0.35); MD.slam(tl, tx.sil, tS - 0.05, { from: 1.5 }); MD.leave(tl, tx.sil, tT - 1.7); MD.slam(tl, tx.ano, tT - 1.4, { from: 1.25 }); MD.leave(tl, tx.ano, tL - 0.6); MD.slam(tl, tx.len, tL - 0.3, { from: 1.2 });
  const est = estF(7);
  const pB = tS + 0.6, pC = tL - 0.8;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.3) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { const j = PT.ss((t - tC + 0.6) / 1.0), am = 80 * (1 - j); ondaP(x, 120, 960, PT.lerp(880, 1000, j), am + 4, 16, t * 7, VE, aA * (1 - j * 0.6), 7); ondaP(x, 120, 960, PT.lerp(1120, 1000, j), am + 4, 16, t * 7 + Math.PI, CI, aA * (1 - j * 0.6), 7); const kz = PT.ss((t - tS + 0.3) / 0.4); linhaP(x, 120, 1000, 960, 1000, VD, aA * kz, 8); brilhoP(x, 540, 1000, 320, VD, 0.3 * aA * kz); }
    // plano B: a patente antiga
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { fCaixa(x, 540, 1000, 560, 700, 16, "240,220,180", aB, 5, 0.06); rotuloP(x, "PATENTE", 540, 720, 46, "255,226,170", aB); ondaP(x, 340, 740, 900, 40, 12, 0, VE, aB * 0.8, 4); ondaP(x, 340, 740, 1000, 40, 12, Math.PI, CI, aB * 0.8, 4); linhaP(x, 340, 1100, 740, 1100, VD, aB * 0.8, 4); rotuloP(x, "anos 1930", 540, 1250, 44, "255,226,170", aB * PT.ss((t - tT + 0.5) / 0.4)); }
    // plano C: com atraso, as ondas não se encaixam
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { const atraso = 1.2; ondaP(x, 120, 960, 900, 70, 16, t * 7, VE, aC, 7); ondaP(x, 120, 960, 1060, 70, 16, t * 7 + Math.PI - atraso, CI, aC, 7); relogioP(x, 860, 720, 70, t * 0.6, aC); ondaP(x, 120, 960, 1240, 60, 16, t * 7 - atraso / 2, VE, aC * 0.8, 6); rotuloP(x, "ainda tem barulho", 540, 1330, 34, "255,170,180", aC); }
  });
};
function relogioP(x, cx, cy, r, ang, a) { if (a <= 0.01) return; anelP(x, cx, cy, r, AM, a, 6); linhaP(x, cx, cy, cx + Math.cos(ang - 1.57) * r * 0.75, cy + Math.sin(ang - 1.57) * r * 0.75, AM, a, 5); discoP(x, cx, cy, 6, AM, a); }

// =============== 4. dentro do fone ===============
CENAS.fone = (el, c, B) => {
  const tM = B("mics"), tC = B("chip"), tA = B("antionda"), tR = B("rapido");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["mic", 330, 66, "microfones escutam fora", "pt-ci"], ["chi", 330, 66, "um chip calcula", "pt-am"], ["ant", 330, 66, "toca a anti-onda", "pt-ci"], ["rap", 330, 70, "< 1 milésimo de segundo", "pt-am"]]);
  MD.slam(tl, tx.mic, tM - 0.1, { from: 1.25 }); MD.leave(tl, tx.mic, tC - 0.35); MD.slam(tl, tx.chi, tC - 0.05, { from: 1.3 }); MD.leave(tl, tx.chi, tA - 0.35); MD.slam(tl, tx.ant, tA - 0.05, { from: 1.25 }); MD.leave(tl, tx.ant, tR - 0.35); MD.slam(tl, tx.rap, tR - 0.05, { from: 1.3 });
  const est = estF(9);
  const pB = tC - 0.5, pC = tA - 0.4, pD = tR - 0.6;
  T.quadro((x, t) => {
    estD(x, est, t);
    // concha do fone em corte (sempre)
    const aF = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pD) / 0.4));
    if (aF > 0.01) { fCaixa(x, 620, 1000, 320, 520, 140, BRC, aF, 8, 0.05); x.beginPath(); x.ellipse(860, 1000, 60, 140, 0, 0, 6.283); x.strokeStyle = `rgba(255,200,180,${aF})`; x.lineWidth = 6; x.stroke(); rotuloP(x, "ouvido", 880, 1190, 30, "255,200,180", aF); }
    // plano A: o barulho chega e os microfones escutam
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { ondaP(x, 40, 460, 1000, 50, 10, t * 7, VE, aA, 6); for (const y of [820, 1180]) { discoP(x, 470, y, 16, AM, aA); brilhoP(x, 470, y, 60, AM, 0.6 * aA * (0.6 + 0.4 * Math.sin(t * 8))); } }
    // plano B: o chip calcula
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { fCaixa(x, 620, 1000, 160, 160, 16, AM, aB, 5, 0.15); for (let k = 0; k < 4; k++) { linhaP(x, 540, 940 + k * 40, 500, 940 + k * 40, AM, aB, 3); linhaP(x, 700, 940 + k * 40, 740, 940 + k * 40, AM, aB, 3); } for (let k = 0; k < 6; k++) { const u = ((t * 2 + k / 6) % 1); rotuloP(x, k % 2 ? "1" : "0", 620 + Math.cos(k) * 60 * u, 1000 - u * 160, 30, "255,226,140", aB * (1 - u)); } ondaP(x, 40, 460, 1000, 50, 10, t * 7, VE, aB * 0.8, 5); }
    // plano C: o alto-falante toca a anti-onda; dentro, silêncio
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { ondaP(x, 40, 460, 1000, 50, 10, t * 7, VE, aC, 6); ondaP(x, 500, 800, 960, 40, 8, t * 7 + Math.PI, CI, aC, 6); linhaP(x, 500, 1060, 800, 1060, VD, aC, 6); brilhoP(x, 650, 1060, 160, VD, 0.3 * aC); rotuloP(x, "silêncio", 650, 1110, 30, "150,255,200", aC); }
    // plano D: o cronômetro
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { relogioP(x, 540, 1000, 240, (t - pD) * 30, aD); rotuloP(x, "0,001 s", 540, 1310, 60, "255,226,140", aD); }
  });
};

// =============== 5. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tS = B("som2"), tT = B("total"), tSN = B("simnao");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["sal", 330, 62, "uma sala em silêncio total?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["sim", 330, 86, "sim ou não?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, tS - 0.4); MD.slam(tl, tx.sal, tS - 0.1, { from: 1.2 }); MD.leave(tl, tx.sal, tSN - 0.35); MD.slam(tl, tx.sim, tSN - 0.05, { from: 1.45 });
  const est = estF(21);
  const pB = tS - 0.5, pC = tSN - 0.4;
  T.quadro((x, t) => {
    estD(x, est, t);
    balaoCom(x, 540, 960, 1.2, PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4)), "?", t);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { fCaixa(x, 540, 1000, 820, 600, 20, BRC, aB, 6, 0.04); for (const [px, py] of [[160, 730], [920, 730], [160, 1270], [920, 1270]]) { fCaixa(x, px, py, 70, 90, 12, CI, aB, 4, 0.2); for (let k = 0; k < 3; k++) { const u = ((t * 0.8 + k / 3) % 1); anelP(x, px, py, 40 + u * 160, CI, aB * (1 - u) * 0.6, 3); } } fPessoa(x, 540, 1060, 2.4, AM, aB); rotuloP(x, "?", 540, 820, 110, AM, aB * PT.ss((t - tT + 0.4) / 0.4)); }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { balaoCom(x, 540, 900, 1.1, aC, "?", t); setaComent(x, aC, t); }
  });
};

// =============== 6. por que a voz passa ===============
CENAS.voz = (el, c, B) => {
  const tL = B("lado"), tG = B("graves"), tP = B("prever"), tA = B("agudo"), tC = B("conversa");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["lad", 330, 62, "e a voz do lado?", "pt-am"], ["gra", 330, 62, "grave e constante: fácil", "pt-ci"], ["pre", 330, 66, "dá pra prever", "pt-ci"], ["agu", 330, 62, "a voz muda o tempo todo", "pt-ve", "white-space:normal;left:60px;width:960px"], ["con", 330, 60, "melhor contra ar e trânsito", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.lad, tL - 0.2, { from: 1.3 }); MD.leave(tl, tx.lad, tG - 0.35); MD.slam(tl, tx.gra, tG - 0.05, { from: 1.25 }); MD.leave(tl, tx.gra, tP - 0.35); MD.slam(tl, tx.pre, tP - 0.05, { from: 1.25 }); MD.leave(tl, tx.pre, tA - 0.35); MD.slam(tl, tx.agu, tA - 0.05, { from: 1.2 }); MD.leave(tl, tx.agu, tC - 1.6); MD.slam(tl, tx.con, tC - 1.3, { from: 1.2 });
  const est = estF(11);
  const pB = tG - 0.6, pC = tA - 0.6, pD = tC - 1.5;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { fone(x, 360, 1000, 0.8, aA, 1); pessoaFala(x, 820, 1120, 2.6, aA, t); vozOnda(x, 460, 740, 1000, 45, t, AM, aA, 4); }
    // plano B: o ronco do motor — grave, constante, a previsão (tracejada) encaixa
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { ondaP(x, 120, 960, 1000, 110, 6, t * 3, LA, aB, 9); x.setLineDash([14, 12]); ondaP(x, 120, 960, 1000, 110, 6, t * 3, BRC, aB * PT.ss((t - tP + 0.5) / 0.4), 4); x.setLineDash([]); rotuloP(x, "motor", 540, 820, 40, "255,190,140", aB); if (t > tP - 0.3) { anelP(x, 880, 760, 40, VD, aB, 6); linhaP(x, 860, 762, 876, 780, VD, aB, 7); linhaP(x, 876, 780, 904, 742, VD, aB, 7); } }
    // plano C: a voz — rápida e aguda, a previsão não encaixa
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { vozOnda(x, 120, 960, 1000, 110, t, AM, aC, 6); x.setLineDash([14, 12]); ondaP(x, 120, 960, 1000, 80, 30, t * 5, BRC, aC * 0.7, 4); x.setLineDash([]); rotuloP(x, "voz", 540, 820, 40, "255,226,140", aC); linhaP(x, 860, 740, 900, 780, VE, aC, 7); linhaP(x, 860, 780, 900, 740, VE, aC, 7); }
    // plano D: funciona melhor contra ar-condicionado e trânsito
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { fCaixa(x, 300, 900, 300, 120, 16, CI, aD, 5, 0.1); for (let k = 0; k < 5; k++) linhaP(x, 180 + k * 60, 930, 180 + k * 60, 950, CI, aD, 4); rotuloP(x, "ar-condicionado", 300, 1010, 30, "180,230,255", aD); fCaixa(x, 780, 900, 260, 90, 30, LA, aD, 5, 0.1); anelP(x, 720, 950, 26, LA, aD, 5); anelP(x, 840, 950, 26, LA, aD, 5); rotuloP(x, "trânsito", 780, 1010, 30, "255,190,140", aD); for (const px of [300, 780]) { anelP(x, px, 760, 36, VD, aD, 5); } pessoaFala(x, 540, 1300, 1.4, aD * 0.6, t); }
  });
};

// =============== 7. resumo relâmpago + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [560, 720, 880], textos = ["som é uma onda", "ao contrário, uma cancela a outra", "o fone calcula em tempo real"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    fone(x, 540, 1260, 0.7, 0.7 * sai * PT.ss((t - c.ini) / 0.5), 1);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [VE, CI, VD][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
