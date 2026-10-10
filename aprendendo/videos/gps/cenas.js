// Cenas do vídeo "Como o GPS sabe onde você está" — pontos de luz na GPU.
// Retenção: situação concreta (estrada sem sinal, pontinho azul), promessa (o Einstein), analogia do
// trovão (liga com o vídeo do raio), geometria das esferas, assombro (38 µs/dia = 10 km) e dica prática.

const MD = MotionDirector;
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245", AZ = "80,160,255";
const estF = (seed) => ambienteP(260, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "210,220,255", 0.8);
const vecG = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
function projG(lat0, lon0, R, cx, cy) { const ca = Math.cos(-lon0 * Math.PI / 180), sa = Math.sin(-lon0 * Math.PI / 180), cb = Math.cos(lat0 * Math.PI / 180), sb = Math.sin(lat0 * Math.PI / 180); return (v) => { const x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca, y2 = v[1] * cb - z1 * sb, z2 = v[1] * sb + z1 * cb; return [cx + x1 * R, cy - y2 * R, z2]; }; }
const TERRA_G = (() => { const o = []; for (let k = 0; k < GLOBO_TERRA.length; k += 2) o.push(vecG(GLOBO_TERRA[k] / 10, GLOBO_TERRA[k + 1] / 10)); for (let k = 0; k < GLOBO_BRASIL.length; k += 4) o.push(vecG(GLOBO_BRASIL[k] / 10, GLOBO_BRASIL[k + 1] / 10)); return o; })();
function globoG(nv, x, cx, cy, R, rot, a) { brilhoP(x, cx, cy, R * 1.25, "60,140,255", 0.2 * a); anelP(x, cx, cy, R, CI, 0.35 * a, 3); const g = x.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R); g.addColorStop(0, `rgba(60,120,255,${0.22 * a})`); g.addColorStop(1, "rgba(20,40,120,0.02)"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill(); const pj = projG(-10, rot, R, cx, cy); let i = nv.k; for (const v of TERRA_G) { const [px, py, z] = pj(v); if (z <= 0) continue; nv.ponto(i++, px, py, 0.55, 0.9, 0.62, a * (0.3 + 0.6 * z), Math.max(2.4, R / 140)); } nv.total(i); }
// satélite simples (corpo + painéis)
function satelite(x, cx, cy, s, a, cor = BRC) { if (a <= 0.01) return; fCaixa(x, cx, cy, 34 * s, 34 * s, 6 * s, cor, a, 3 * s, 0.3); for (const sx of [-1, 1]) { fCaixa(x, cx + sx * 50 * s, cy, 50 * s, 22 * s, 3 * s, CI, a, 2 * s, 0.25); } brilhoP(x, cx, cy, 40 * s, cor, 0.4 * a); }
function relogioG(x, cx, cy, r, ang, cor, a) { if (a <= 0.01) return; anelP(x, cx, cy, r, cor, a, 5); linhaP(x, cx, cy, cx + Math.cos(ang) * r * 0.8, cy + Math.sin(ang) * r * 0.8, cor, a, 4); discoP(x, cx, cy, 5, cor, a); }
function pinoAzul(x, cx, cy, a, t) { if (a <= 0.01) return; const p = (t * 1.2) % 1; anelP(x, cx, cy, 20 + p * 50, AZ, a * (1 - p), 4); discoP(x, cx, cy, 16, AZ, a); anelP(x, cx, cy, 16, "255,255,255", a, 4); brilhoP(x, cx, cy, 60, AZ, 0.5 * a); }
function semSinal(x, cx, cy, a) { if (a <= 0.01) return; for (let k = 1; k <= 3; k++) { x.beginPath(); x.arc(cx, cy, 16 * k, -Math.PI * 0.75, -Math.PI * 0.25); x.strokeStyle = `rgba(170,178,195,${a})`; x.lineWidth = 5; x.stroke(); } linhaP(x, cx - 36, cy - 50, cx + 36, cy + 4, VE, a, 6); }

const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
function setaComent(x, a, t) { if (a <= 0.01) return; const b = Math.sin(t * 6) * 16; fSeta(x, 700 + b, 1250, 900 + b, 1250, AM, a, 12); brilhoP(x, 1010, 1250, 90, AM, 0.35 * a * (0.7 + 0.3 * Math.sin(t * 6))); rotuloP(x, "comentários", 780, 1180, 38, "255,226,140", a); }
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 330 * s, 60 * s, CI, a, 8 * s, 0.12);
  x.beginPath(); x.moveTo(cx - 120 * s, cy + 160 * s); x.lineTo(cx - 190 * s, cy + 250 * s); x.lineTo(cx - 40 * s, cy + 160 * s); x.fillStyle = `rgba(${CI},${0.5 * a})`; x.fill();
  brilhoP(x, cx, cy, 380 * s, CI, 0.18 * a); rotuloP(x, txt, cx, cy + 6 * s, 190 * s, "255,226,140", a * (0.85 + 0.15 * Math.sin(t * 4)));
}
// o mapa no celular (com a estrada) e o pontinho azul
function celMapa(x, cx, cy, h, a, t, ponto = 1, sinal = 0) { if (a <= 0.01) return; fCelular(x, cx, cy, h, BRC, a, 0.08); const w = h * 0.49; for (let k = 0; k < 5; k++) linhaP(x, cx - w * 0.38 + k * w * 0.19, cy - h * 0.38, cx - w * 0.45 + k * w * 0.22, cy + h * 0.38, "90,110,160", 0.6 * a, 3); linhaP(x, cx - w * 0.35, cy + h * 0.05, cx + w * 0.35, cy - h * 0.12, "120,140,200", 0.7 * a, 6); semSinal(x, cx + w * 0.22, cy - h * 0.32, sinal * a); pinoAzul(x, cx, cy, a * ponto, t); }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tD = B("dez"), tI = B("internet"), tA = B("azul"), tO = B("onde"), tE = B("einstein");
  const p2 = tI - 0.6, p3 = tO - 0.6, p4 = tE - 1.4;
  mostrarGancho(tI - 0.4);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["sem", 330, 70, "funciona sem internet", "pt-ci"], ["onde", 330, 76, "como ele sabe?", "pt-ci"], ["ein", 330, 62, "o Einstein: no final", "pt-am"]]);
  MD.slam(tl, tx.sem, tI - 0.1, { from: 1.25 }); MD.leave(tl, tx.sem, tO - 0.35); MD.slam(tl, tx.onde, tO - 0.05, { from: 1.3 }); MD.leave(tl, tx.onde, p4); MD.slam(tl, tx.ein, p4 + 0.2, { from: 1.3 });
  const est = estF(3), nv = T.nuvem(9000);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano 1 (quadro 0): a Terra, os satélites e o erro crescendo
    const a1 = 1 - PT.ss((t - p2) / 0.4);
    if (a1 > 0.01) {
      const CX = 540, CY = 960, R = 300; globoG(nv, x, CX, CY, R, -50 + t * 4, a1);
      for (let k = 0; k < 8; k++) { const an = k * 0.785 + t * 0.2, rr = R * (1.55 + (k % 2) * 0.15); satelite(x, CX + Math.cos(an) * rr, CY + Math.sin(an) * rr * 0.55, 0.7, a1 * (Math.sin(an) > -0.2 || Math.abs(Math.cos(an)) > 0.6 ? 1 : 0.25)); }
      const P = [CX + 40, CY - 60], er = PT.ss((t - 0.4) / Math.max(0.5, tD - 0.4)); pinoAzul(x, P[0], P[1], a1, t);
      anelP(x, P[0], P[1], 20 + er * 170, VE, a1 * er, 6); brilhoP(x, P[0], P[1], 40 + er * 200, VE, 0.25 * a1 * er);
      rotuloP(x, `erro: ${Math.round(er * 10)} km`, P[0], P[1] + 250, 46, "255,170,180", a1 * PT.ss((t - 0.4) / 0.4));
    } else nv.total(nv.k);
    // plano 2: a estrada vazia, sem sinal, e o pontinho azul certinho
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { for (const sd of [-1, 1]) linhaP(x, 540 + sd * 60, 900, 540 + sd * 520, 1420, BRC, 0.5 * a2, 4); for (let k = 0; k < 6; k++) { const u = ((t * 0.5 + k / 6) % 1), y = 900 + u * u * 520; linhaP(x, 540, y, 540, y + 10 + 40 * u, AM, 0.6 * u * a2, 4 + 6 * u); } celMapa(x, 540, 900, 620, a2, t, PT.ss((t - tA + 0.3) / 0.4), PT.ss((t - tI + 0.3) / 0.4)); }
    // plano 3: "como ele sabe?"
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) { celMapa(x, 540, 1000, 700, a3, t, 1, 1); rotuloP(x, "?", 860, 720, 150, AM, a3); }
    // plano 4: dois relógios — o de cima anda mais rápido (teaser do Einstein)
    const a4 = PT.ss((t - p4) / 0.5);
    if (a4 > 0.01) { satelite(x, 330, 760, 1.2, a4); relogioG(x, 330, 960, 90, -Math.PI / 2 + t * 3.2, VE, a4); relogioG(x, 760, 1060, 90, -Math.PI / 2 + t * 2, CI, a4); rotuloP(x, "?", 760, 840, 110, AM, a4); }
  });
};

// =============== 2. ele só escuta ===============
CENAS.escuta = (el, c, B) => {
  const tE = B("escuta"), tV = B("vinte"), tT = B("trinta"), tG = B("gritando"), tB = B("bilionesimos");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["esc", 330, 76, "o celular só escuta", "pt-ci"], ["km", 330, 70, "20 mil km de altura", "pt-am"], ["sat", 330, 70, "+30 satélites", "pt-ci"], ["gri", 330, 62, "\"sou o 12, agora são 12:00:00\"", "pt-am", "white-space:normal;left:60px;width:960px"], ["bil", 330, 62, "precisão: bilionésimo de segundo", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.esc, tE - 0.1, { from: 1.3 }); MD.leave(tl, tx.esc, tV - 0.3); MD.slam(tl, tx.km, tV - 0.05, { from: 1.25 }); MD.leave(tl, tx.km, tT - 0.3); MD.slam(tl, tx.sat, tT - 0.05, { from: 1.3 }); MD.leave(tl, tx.sat, tG - 0.35); MD.slam(tl, tx.gri, tG - 0.05, { from: 1.2 }); MD.leave(tl, tx.gri, tB - 0.4); MD.slam(tl, tx.bil, tB - 0.1, { from: 1.2 });
  const nv = T.nuvem(9000), est = estF(5), CX = 540, CY = 960, R = 230;
  const SATS = Array.from({ length: 14 }, (_, k) => ({ inc: (k % 3) * 0.9 + 0.3, f: k * 0.45, r: 1.75 + (k % 2) * 0.12 }));
  const pB = tE + 0.4, pC = tG - 0.6, pD = tB - 0.6;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o celular só recebe (as setas só descem)
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { celMapa(x, 540, 1120, 520, aA, t); for (let k = 0; k < 3; k++) { const px = 260 + k * 280; satelite(x, px, 620, 0.8, aA); fSeta(x, px, 680, PT.lerp(px, 540, 0.7), 820, CI, aA * (0.6 + 0.4 * Math.sin(t * 4 + k)), 5); } linhaP(x, 680, 760, 760, 840, VE, aA * PT.ss((t - tE + 0.5) / 0.3), 8); fSeta(x, 620, 880, 760, 700, BRC, aA * 0.35 * (1 - PT.ss((t - tE + 0.5) / 0.3)), 4); }
    // plano B: a Terra com mais de 30 satélites em volta
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { globoG(nv, x, CX, CY, R, -50 + t * 3, aB); const nVis = Math.round(PT.lerp(4, 14, PT.ss((t - tT + 0.3) / 1))); SATS.forEach((s2, k) => { if (k >= nVis) return; const an = s2.f + t * 0.15; satelite(x, CX + Math.cos(an) * R * s2.r, CY + Math.sin(an) * R * s2.r * Math.cos(s2.inc) * 0.55, 0.7, aB); }); rotuloP(x, "20.000 km", CX + R * 1.2, CY - R * 1.05, 32, "255,226,140", aB * PT.ss((t - tV + 0.3) / 0.4), "left"); } else if (t < pC + 0.5) nv.total(nv.k);
    // plano C: um satélite gritando a hora
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { satelite(x, 540, 900, 2.2, aC); for (let k = 0; k < 4; k++) { const u = ((t * 0.9 + k / 4) % 1); anelP(x, 540, 900, 80 + u * 400, CI, aC * (1 - u), 4); } rotuloP(x, "12:00:00", 540, 1180, 70, "255,226,140", aC); }
    // plano D: o relógio atômico — bilionésimos
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { const ns = String(Math.floor((t * 1e7) % 1e9)).padStart(9, "0"); fCaixa(x, 540, 1000, 900, 220, 30, AM, aD, 6, 0.08); rotuloP(x, `12:00:00,${ns}`, 540, 1005, 70, "255,226,140", aD); rotuloP(x, "relógio atômico", 540, 1180, 36, "255,226,140", aD); }
  });
};

// =============== 3. o atraso vira distância ===============
CENAS.atraso = (el, c, B) => {
  const tL = B("luz"), tT = B("trovao"), tLo = B("longe"), tA = B("atrasou"), tD = B("distancia"), tB = B("basta");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["luz", 330, 66, "na velocidade da luz", "pt-ci"], ["tro", 330, 66, "igual ao trovão", "pt-am"], ["dis", 330, 76, "atraso = distância", "pt-ve"], ["bas", 330, 66, "uma só não basta", "pt-am"]]);
  MD.slam(tl, tx.luz, tL - 0.1, { from: 1.25 }); MD.leave(tl, tx.luz, tT - 0.35); MD.slam(tl, tx.tro, tT - 0.05, { from: 1.25 }); MD.leave(tl, tx.tro, tA - 0.4); MD.slam(tl, tx.dis, tA - 0.05, { from: 1.3 }); MD.leave(tl, tx.dis, tB - 0.35); MD.slam(tl, tx.bas, tB - 0.05, { from: 1.3 });
  const est = estF(7);
  const pB = tT - 0.6, pC = tA - 0.8, pD = tB - 1.0;
  const S = [260, 640], P = [820, 1250];
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o pulso de luz viajando do satélite ao celular
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { satelite(x, S[0], S[1], 1.2, aA); discoP(x, P[0], P[1], 14, AZ, aA); brilhoP(x, P[0], P[1], 50, AZ, 0.5 * aA); const u = ((t - c.ini) * 0.5) % 1; discoP(x, PT.lerp(S[0], P[0], u), PT.lerp(S[1], P[1], u), 10, CI, aA); brilhoP(x, PT.lerp(S[0], P[0], u), PT.lerp(S[1], P[1], u), 40, CI, 0.6 * aA); x.setLineDash([8, 12]); linhaP(x, S[0], S[1], P[0], P[1], CI, 0.3 * aA, 3); x.setLineDash([]); }
    // plano B: o trovão — relâmpago agora, BUM depois
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const z = [[300, 620], [260, 760], [320, 780], [250, 980]]; x.beginPath(); z.forEach(([px, py], k) => k ? x.lineTo(px, py) : x.moveTo(px, py)); x.strokeStyle = `rgba(255,255,255,${aB})`; x.lineWidth = 6; x.stroke(); brilhoP(x, 280, 800, 160, "200,190,255", 0.5 * aB); fPessoa(x, 820, 1220, 2.2, CI, aB); const n = Math.min(3, Math.floor(PT.cl((t - pB) / 2.4) * 4)); rotuloP(x, `${n} s`, 540, 1120, 70, "255,226,140", aB); const atr = PT.ss((t - tLo + 0.3) / 0.4); rotuloP(x, "BUM", 820, 940, 80, "255,226,140", aB * atr); rotuloP(x, "mais longe", 540, 1220, 36, "200,230,255", aB * atr); }
    // plano C: o cronômetro do atraso vira distância
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { satelite(x, S[0], S[1], 1.2, aC); celMapa(x, P[0], P[1] - 100, 360, aC, t); relogioG(x, 540, 880, 90, -Math.PI / 2 + (t - pC) * 3, AM, aC); rotuloP(x, "0,067 s", 540, 1010, 44, "255,226,140", aC); rotuloP(x, "≈ 20.000 km", 540, 1080, 44, "255,150,160", aC * PT.ss((t - tD + 0.3) / 0.4)); }
    // plano D: uma distância só = um círculo inteiro de possibilidades
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { satelite(x, 540, 980, 1.0, aD); x.beginPath(); x.arc(540, 980, 360 * PT.out(PT.ss((t - pD) / 0.8)), 0, 6.283); x.strokeStyle = `rgba(${CI},${0.8 * aD})`; x.lineWidth = 5; x.stroke(); for (let k = 0; k < 6; k++) { const an = k / 6 * 6.283 + t * 0.3; rotuloP(x, "?", 540 + Math.cos(an) * 360, 980 + Math.sin(an) * 360, 50, "255,226,140", aD * 0.8); } }
  });
};

// =============== 4. quatro satélites ===============
CENAS.circulos = (el, c, B) => {
  const tU = B("um"), tD = B("dois"), tT = B("tres"), tQ = B("quatro"), tX = B("exata");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["s1", 330, 62, "1 satélite: uma bolha", "pt-ci"], ["s2", 330, 62, "2: um círculo", "pt-ci"], ["s3", 330, 62, "3: dois pontos", "pt-ci"], ["s4", 330, 62, "o 4º acerta o relógio", "pt-am"], ["ok", 330, 86, "posição exata", "pt-am"]]);
  MD.arrive(tl, tx.s1, tU - 0.2, { y: 14 }); MD.leave(tl, tx.s1, tD - 0.3); MD.arrive(tl, tx.s2, tD - 0.1, { y: 14 }); MD.leave(tl, tx.s2, tT - 0.3); MD.arrive(tl, tx.s3, tT - 0.1, { y: 14 }); MD.leave(tl, tx.s3, tQ - 0.3); MD.arrive(tl, tx.s4, tQ - 0.1, { y: 14 }); MD.leave(tl, tx.s4, tX - 0.4); MD.slam(tl, tx.ok, tX - 0.05, { from: 1.35 });
  const est = estF(9), P = [560, 1000];
  const SAT = [[240, 620], [880, 660], [560, 1380]];
  T.quadro((x, t) => {
    estD(x, est, t);
    const cr = [PT.ss((t - tU + 0.3) / 0.6), PT.ss((t - tD + 0.3) / 0.6), PT.ss((t - tT + 0.3) / 0.6)];
    SAT.forEach(([sx, sy], k) => { if (cr[k] <= 0) return; satelite(x, sx, sy, 0.8, cr[k]); const R = Math.hypot(P[0] - sx, P[1] - sy); x.beginPath(); x.arc(sx, sy, R * PT.out(cr[k]), 0, 6.283); x.strokeStyle = `rgba(${[CI, VD, AM][k]},${0.7 * cr[k]})`; x.lineWidth = 4; x.stroke(); });
    const aE = PT.jan(t, tT + 1.0, tX, 0.3, 0.4); if (aE > 0) { discoP(x, 560, 440, 12, VE, aE); linhaP(x, 530, 410, 590, 470, VE, aE, 5); linhaP(x, 590, 410, 530, 470, VE, aE, 5); rotuloP(x, "no espaço: descarta", 560, 500, 28, "255,160,170", aE); }
    const aQ = PT.ss((t - tQ + 0.3) / 0.5); if (aQ > 0) { satelite(x, 900, 1250, 0.8, aQ); relogioG(x, 900, 1350, 50, -Math.PI / 2 + PT.ss((t - tQ) / 1) * 2, AM, aQ * (1 - PT.ss((t - tX) / 0.5))); }
    const aX = PT.ss((t - tX + 0.4) / 0.4); pinoAzul(x, P[0], P[1], Math.max(aX, 0.4 * cr[2]), t); if (aX > 0) brilhoP(x, P[0], P[1], 160, AZ, 0.5 * aX);
  });
};

// =============== 5. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tE = B("escuta2"), tA = B("agora"), tN = B("numero");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["qua", 330, 62, "quantas pessoas agora?", "pt-ci"], ["chu", 330, 70, "chuta um número", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, tE - 0.2); MD.slam(tl, tx.qua, tE + 0.1, { from: 1.25 }); MD.leave(tl, tx.qua, tN - 0.35); MD.slam(tl, tx.chu, tN - 0.05, { from: 1.35 });
  const nv = T.nuvem(9000), est = estF(21);
  const pB = tE - 0.5, pC = tN - 0.4;
  T.quadro((x, t) => {
    estD(x, est, t);
    balaoCom(x, 540, 960, 1.2, PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4)), "?", t);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { globoG(nv, x, 540, 1000, 300, -50 + t * 4, aB); const r = prng(5); const n = Math.round(PT.lerp(5, 60, PT.ss((t - pB) / 3))); for (let k = 0; k < n; k++) { const an = r() * 6.283, d = Math.sqrt(r()) * 280; pinoAzul(x, 540 + Math.cos(an) * d, 1000 + Math.sin(an) * d * 0.9, aB * 0.6, t + k); } for (let k = 0; k < 4; k++) { const an = k * 1.57 + t * 0.15; satelite(x, 540 + Math.cos(an) * 470, 1000 + Math.sin(an) * 260, 0.6, aB); } rotuloP(x, "?", 540, 640, 110, AM, aB * PT.ss((t - tA + 0.4) / 0.4)); } else nv.total(nv.k);
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { balaoCom(x, 540, 900, 1.1, aC, "?", t); setaComent(x, aC, t); }
  });
};

// =============== 6. o Einstein ===============
CENAS.einstein = (el, c, B) => {
  const tP = B("prometi"), tR = B("rapido"), tM = B("micro"), tG = B("gravidade"), tE = B("einstein2"), tEr = B("erro");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pro", 330, 66, "a parte prometida", "pt-am"], ["rap", 330, 62, "lá em cima o relógio corre", "pt-ci", "white-space:normal;left:60px;width:960px"], ["us", 330, 70, "+0,000038 s por dia", "pt-am"], ["rel", 330, 72, "relatividade", "pt-ci"], ["km", 330, 70, "sem correção: 10 km/dia", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.pro, tP - 0.3, { from: 1.3 }); MD.leave(tl, tx.pro, tR - 0.35); MD.slam(tl, tx.rap, tR - 0.05, { from: 1.25 }); MD.leave(tl, tx.rap, tM - 0.4); MD.slam(tl, tx.us, tM - 0.1, { from: 1.35 }); MD.leave(tl, tx.us, tE - 0.35); MD.slam(tl, tx.rel, tE - 0.05, { from: 1.3 }); MD.leave(tl, tx.rel, tEr - 2.6); MD.slam(tl, tx.km, tEr - 2.3, { from: 1.3 });
  const nv = T.nuvem(9000), est = estF(11);
  const pB = tR - 0.5, pC = tG - 0.6, pD = tEr - 2.4;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: "a parte prometida" — um relógio grande no espaço
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { relogioG(x, 540, 1000, 220, -Math.PI / 2 + t * 2, AM, aA); satelite(x, 540, 700, 1.0, aA); }
    // plano B: o relógio de cima corre mais rápido que o de baixo
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { globoG(nv, x, 540, 1500, 520, -50 + t * 2, 0.7 * aB); satelite(x, 300, 640, 1, aB); relogioG(x, 300, 780, 70, -Math.PI / 2 + (t - c.ini) * 2.6, VE, aB); rotuloP(x, "lá em cima", 300, 880, 30, "255,170,180", aB); relogioG(x, 780, 900, 70, -Math.PI / 2 + (t - c.ini) * 2, CI, aB); rotuloP(x, "aqui embaixo", 780, 1000, 30, "180,235,255", aB); } else if (t < pC + 0.5) nv.total(nv.k);
    // plano C: a gravidade mais fraca lá em cima — relatividade
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { globoG(nv, x, 540, 1500, 520, -50 + t * 2, 0.7 * aC); for (let k = 0; k < 7; k++) { const px = 180 + k * 120; fSeta(x, px, 1060, px, 1130, "200,210,255", aC * 0.8, 5); fSeta(x, px, 600, px, 620, "200,210,255", aC * 0.3, 2); } rotuloP(x, "gravidade forte", 540, 1180, 32, "200,210,255", aC); rotuloP(x, "gravidade fraca", 540, 680, 32, "200,210,255", aC * 0.6); }
    // plano D: o erro acumulando no mapa
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { const d = PT.ss((t - pD - 0.4) / 2.2) * 360; fCaixa(x, 540, 980, 760, 460, 20, BRC, aD, 4, 0.04); for (let k = 0; k < 5; k++) linhaP(x, 200 + k * 160, 760, 220 + k * 140, 1200, "90,110,160", 0.6 * aD, 3); pinoAzul(x, 360, 1000, aD, t); discoP(x, 360 + d, 1000 - d * 0.3, 14, VE, aD); linhaP(x, 360, 1000, 360 + d, 1000 - d * 0.3, VE, aD * 0.7, 4); rotuloP(x, "você", 360, 1060, 28, "180,210,255", aD); rotuloP(x, "GPS sem correção", 360 + d, 940 - d * 0.3, 28, "255,160,170", aD); nv.total(nv.k); }
  });
};

// =============== 7. a dica ===============
CENAS.dica = (el, c, B) => {
  const tS = B("gasta"), tM = B("mapa"), tO = B("offline"), tF = B("funciona");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dic", 330, 66, "a dica", "pt-am"], ["off", 330, 66, "baixe o mapa off-line", "pt-am"], ["gps", 330, 62, "GPS: não gasta internet", "pt-ci"]]);
  MD.slam(tl, tx.dic, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.dic, tM - 0.4); MD.slam(tl, tx.off, tM - 0.1, { from: 1.3 }); MD.leave(tl, tx.off, tF - 0.6); MD.slam(tl, tx.gps, tF - 0.3, { from: 1.25 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    const cx = 540, cy = 920, a0 = PT.ss((t - c.ini) / 0.4);
    fCelular(x, cx, cy, 760, BRC, a0, 0.06); for (let k = 0; k < 6; k++) linhaP(x, 380 + k * 55, 640, 340 + k * 80, 1200, "90,110,160", 0.6 * a0, 3);
    const aB = PT.ss((t - tM + 0.3) / 0.4); if (aB > 0) { const prog = PT.ss((t - tM) / Math.max(0.6, tO - tM)); fCaixa(x, 540, 1130, 360, 80, 40, VD, aB, 4, 0.08); fRR(x, 380, 1110, 320 * prog, 40, 20); x.fillStyle = `rgba(${VD},${0.6 * aB})`; x.fill(); rotuloP(x, prog < 1 ? "baixando mapa..." : "mapa off-line pronto", 540, 1060, 30, "150,255,200", aB); }
    const aF = PT.ss((t - tO + 0.2) / 0.5); semSinal(x, 640, 700, aF); pinoAzul(x, 520, 900, Math.max(aF, PT.ss((t - tF) / 0.4)), t);
  });
};

// =============== 8. resumo relâmpago + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 620, 760, 900], textos = ["os satélites gritam a hora", "o atraso vira distância", "4 distâncias = sua posição", "o Einstein corrige o relógio"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 50, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const nv = T.nuvem(9000), est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    globoG(nv, x, 540, 1260, 150, -50 + t * 4, 0.7 * sai * PT.ss((t - c.ini) / 0.5));
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [CI, AM, AZ, VE][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
