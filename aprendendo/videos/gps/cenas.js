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

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tI = B("internet"), tA = B("azul"), tO = B("onde"), tE = B("einstein");
  mostrarGancho(tI + 0.4);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["onde", 330, 76, "como ele sabe?", "pt-ci"], ["ein", 330, 70, "graças ao Einstein?", "pt-am"]]);
  MD.slam(tl, tx.onde, tO - 0.05, { from: 1.3 }); MD.leave(tl, tx.onde, tE - 0.4); MD.slam(tl, tx.ein, tE - 0.1, { from: 1.35 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // estrada em perspectiva
    for (const s of [-1, 1]) linhaP(x, 540 + s * 60, 900, 540 + s * 520, 1420, BRC, 0.5, 4);
    for (let k = 0; k < 6; k++) { const u = ((t * 0.5 + k / 6) % 1), y = 900 + u * u * 520; linhaP(x, 540, y, 540, y + 10 + 40 * u, AM, 0.6 * u, 4 + 6 * u); }
    // celular com o mapa
    fCelular(x, 540, 900, 620, BRC, 1, 0.08);
    for (let k = 0; k < 5; k++) linhaP(x, 400 + k * 50, 700, 360 + k * 90, 1120, "90,110,160", 0.6, 3);
    linhaP(x, 400, 960, 690, 850, "120,140,200", 0.7, 6);
    semSinal(x, 620, 680, PT.ss((t - tI + 0.3) / 0.4));
    pinoAzul(x, 540, 910, PT.ss((t - tA + 0.3) / 0.4), t);
  });
};

// =============== 2. ele só escuta ===============
CENAS.escuta = (el, c, B) => {
  const tE = B("escuta"), tV = B("vinte"), tT = B("trinta"), tG = B("gritando"), tB = B("bilionesimos");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["esc", 330, 76, "o celular só escuta", "pt-ci"], ["km", 330, 70, "20 mil km de altura", "pt-am"], ["sat", 330, 70, "+30 satélites", "pt-ci"], ["hor", 330, 60, "\"agora são 12:00:00,000000001\"", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.esc, tE - 0.05, { from: 1.3 }); MD.leave(tl, tx.esc, tV - 0.3); MD.slam(tl, tx.km, tV - 0.05, { from: 1.25 }); MD.leave(tl, tx.km, tT - 0.3); MD.slam(tl, tx.sat, tT - 0.05, { from: 1.3 }); MD.leave(tl, tx.sat, tB - 0.6); MD.slam(tl, tx.hor, tB - 0.3, { from: 1.2 });
  const nv = T.nuvem(9000), est = estF(5), CX = 540, CY = 960, R = 230;
  const SATS = Array.from({ length: 14 }, (_, k) => ({ inc: (k % 3) * 0.9 + 0.3, f: k * 0.45, r: 1.75 + (k % 2) * 0.12 }));
  T.quadro((x, t) => {
    estD(x, est, t);
    globoG(nv, x, CX, CY, R, -50 + t * 3, 1);
    const aS = PT.ss((t - tV + 0.5) / 0.6), nVis = Math.round(PT.lerp(3, 14, PT.ss((t - tT + 0.3) / 1)));
    const pos = SATS.map((s) => { const an = s.f + t * 0.15; return [CX + Math.cos(an) * R * s.r, CY + Math.sin(an) * R * s.r * Math.cos(s.inc) * 0.55, Math.sin(an) * Math.sin(s.inc)]; });
    pos.forEach((p, k) => { if (k >= nVis) return; satelite(x, p[0], p[1], 0.7, aS * (p[2] > -0.3 || Math.hypot(p[0] - CX, p[1] - CY) > R ? 1 : 0.2)); });
    // celular na superfície recebendo
    const cel = [CX + 60, CY - 120]; discoP(x, cel[0], cel[1], 10, AZ, 1); brilhoP(x, cel[0], cel[1], 50, AZ, 0.6);
    const aG = PT.ss((t - tG + 0.3) / 0.5); if (aG > 0) pos.forEach((p, k) => { if (k >= nVis) return; const u = ((t - tG) * 0.6 + k * 0.13) % 1; anelP(x, p[0], p[1], 20 + u * 120, CI, aG * (1 - u) * 0.8, 3); });
    // setas: só descem (satélite → celular)
    const aE = PT.ss((t - tE + 0.3) / 0.5) * (1 - PT.ss((t - tG) / 0.5)); if (aE > 0) [0, 3, 6].forEach((k) => { const p = pos[k]; fSeta(x, p[0], p[1], PT.lerp(p[0], cel[0], 0.85), PT.lerp(p[1], cel[1], 0.85), CI, aE, 4); });
    if (t > tV - 0.3) rotuloP(x, "20.000 km", CX + R * 1.2, CY - R * 1.05, 30, "255,226,140", PT.ss((t - tV + 0.3) / 0.4) * (1 - PT.ss((t - tG) / 0.5)), "left");
  });
};

// =============== 3. o atraso vira distância ===============
CENAS.atraso = (el, c, B) => {
  const tL = B("luz"), tT = B("trovao"), tLo = B("longe"), tA = B("atrasou"), tD = B("distancia");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["luz", 330, 66, "velocidade da luz", "pt-ci"], ["tro", 330, 66, "igual ao trovão", "pt-am"], ["dis", 330, 76, "atraso = distância", "pt-ve"]]);
  MD.slam(tl, tx.luz, tL - 0.05, { from: 1.25 }); MD.leave(tl, tx.luz, tT - 0.3); MD.slam(tl, tx.tro, tT - 0.05, { from: 1.25 }); MD.leave(tl, tx.tro, tA - 0.4); MD.slam(tl, tx.dis, tA - 0.05, { from: 1.3 });
  const est = estF(7);
  T.quadro((x, t) => {
    estD(x, est, t);
    const aS = PT.ss((t - c.ini - 0.3) / 0.5) * (1 - PT.ss((t - tT + 0.4) / 0.4)) + PT.ss((t - tA + 0.5) / 0.5);
    const S = [260, 640], P = [820, 1250];
    satelite(x, S[0], S[1], 1.2, Math.min(1, aS)); discoP(x, P[0], P[1], 14, AZ, Math.min(1, aS)); brilhoP(x, P[0], P[1], 50, AZ, 0.5 * Math.min(1, aS));
    // pulso viajando
    if (aS > 0) { const u = ((t - c.ini) * 0.5) % 1; discoP(x, PT.lerp(S[0], P[0], u), PT.lerp(S[1], P[1], u), 10, CI, Math.min(1, aS)); brilhoP(x, PT.lerp(S[0], P[0], u), PT.lerp(S[1], P[1], u), 40, CI, 0.6 * Math.min(1, aS)); x.setLineDash([8, 12]); linhaP(x, S[0], S[1], P[0], P[1], CI, 0.3 * Math.min(1, aS), 3); x.setLineDash([]); }
    // o trovão (relâmpago + "BUM" atrasado)
    const aTr = PT.jan(t, tT - 0.3, tA - 0.4, 0.3, 0.4); if (aTr > 0) { const z = [[300, 620], [260, 760], [320, 780], [250, 980]]; x.beginPath(); z.forEach(([px, py], k) => k ? x.lineTo(px, py) : x.moveTo(px, py)); x.strokeStyle = `rgba(255,255,255,${aTr})`; x.lineWidth = 6; x.stroke(); brilhoP(x, 280, 800, 160, "200,190,255", 0.5 * aTr); const atr = PT.ss((t - tLo + 0.3) / 0.4); rotuloP(x, "BUM", 800, 1050, 80, "255,226,140", aTr * atr); rotuloP(x, "3 s = 1 km", 800, 1160, 36, "200,230,255", aTr * atr); }
    // cronômetro do atraso e régua de distância
    const aA = PT.ss((t - tA + 0.3) / 0.5); if (aA > 0) { relogioG(x, 830, 760, 70, -Math.PI / 2 + (t - tA) * 3, AM, aA); rotuloP(x, "0,067 s", 830, 870, 36, "255,226,140", aA); }
    const aD = PT.ss((t - tD + 0.3) / 0.5); if (aD > 0) rotuloP(x, "≈ 20.000 km", 540, 960, 46, "255,150,160", aD);
  });
};

// =============== 4. os círculos ===============
CENAS.circulos = (el, c, B) => {
  const tE = B("esfera"), tC = B("circulo"), tT = B("tres"), tEs = B("espaco"), tQ = B("quarto"), tX = B("exata");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["s1", 330, 62, "1 satélite: uma esfera", "pt-ci"], ["s2", 330, 62, "2: um círculo", "pt-ci"], ["s3", 330, 62, "3: dois pontos", "pt-ci"], ["s4", 330, 62, "4º acerta o relógio", "pt-am"], ["ok", 330, 86, "posição exata", "pt-am"]]);
  MD.arrive(tl, tx.s1, tE - 0.2, { y: 14 }); MD.leave(tl, tx.s1, tC - 0.3); MD.arrive(tl, tx.s2, tC - 0.1, { y: 14 }); MD.leave(tl, tx.s2, tT - 0.3); MD.arrive(tl, tx.s3, tT - 0.1, { y: 14 }); MD.leave(tl, tx.s3, tQ - 0.3); MD.arrive(tl, tx.s4, tQ - 0.1, { y: 14 }); MD.leave(tl, tx.s4, tX - 0.4); MD.slam(tl, tx.ok, tX - 0.05, { from: 1.35 });
  const est = estF(9), P = [560, 1000];
  const SAT = [[240, 620, 0], [880, 660, 0], [560, 1380, 0]];
  T.quadro((x, t) => {
    estD(x, est, t);
    const cr = [PT.ss((t - tE + 0.3) / 0.6), PT.ss((t - tC + 0.6) / 0.6), PT.ss((t - tT + 0.3) / 0.6)];
    SAT.forEach(([sx, sy], k) => { if (cr[k] <= 0) return; satelite(x, sx, sy, 0.8, cr[k]); const R = Math.hypot(P[0] - sx, P[1] - sy); x.beginPath(); x.arc(sx, sy, R * PT.out(cr[k]), 0, 6.283); x.strokeStyle = `rgba(${[CI, VD, AM][k]},${0.7 * cr[k]})`; x.lineWidth = 4; x.stroke(); });
    // o ponto "no espaço" descartado
    const aE = PT.jan(t, tEs - 0.4, tX, 0.3, 0.4); if (aE > 0) { discoP(x, 560, 440, 12, VE, aE); linhaP(x, 530, 410, 590, 470, VE, aE, 5); linhaP(x, 590, 410, 530, 470, VE, aE, 5); rotuloP(x, "no espaço: descarta", 560, 500, 28, "255,160,170", aE); }
    // relógio do celular sendo acertado
    const aQ = PT.ss((t - tQ + 0.3) / 0.5); if (aQ > 0) relogioG(x, 900, 1250, 55, -Math.PI / 2 + PT.ss((t - tQ) / 1) * 2, AM, aQ * (1 - PT.ss((t - tX) / 0.5)));
    // o ponto final
    const aX = PT.ss((t - tX + 0.4) / 0.4); pinoAzul(x, P[0], P[1], Math.max(aX, 0.4 * cr[2]), t);
  });
};

// =============== 5. o Einstein ===============
CENAS.einstein = (el, c, B) => {
  const tR = B("rapido"), tM = B("milionesimos"), tF = B("fraca"), tRe = B("relatividade"), tD = B("dez"), tDi = B("dia");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["us", 330, 70, "+0,000038 s por dia", "pt-am"], ["rel", 330, 72, "relatividade", "pt-ci"], ["km", 330, 76, "sem correção: 10 km/dia", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.us, tM - 0.05, { from: 1.35 }); MD.leave(tl, tx.us, tRe - 0.35); MD.slam(tl, tx.rel, tRe - 0.05, { from: 1.3 }); MD.leave(tl, tx.rel, tD - 0.35); MD.slam(tl, tx.km, tD - 0.05, { from: 1.35 });
  const nv = T.nuvem(9000), est = estF(11);
  T.quadro((x, t) => {
    estD(x, est, t);
    globoG(nv, x, 540, 1500, 520, -50 + t * 2, 0.7);
    // relógio do satélite (rápido) e do chão (normal)
    const aR = PT.ss((t - c.ini - 0.4) / 0.5) * (1 - PT.ss((t - tD + 0.4) / 0.4));
    satelite(x, 300, 640, 1, aR); relogioG(x, 300, 780, 70, -Math.PI / 2 + (t - c.ini) * (t > tR ? 2.6 : 2), VE, aR); rotuloP(x, "lá em cima", 300, 880, 30, "255,170,180", aR);
    relogioG(x, 780, 900, 70, -Math.PI / 2 + (t - c.ini) * 2, CI, aR); rotuloP(x, "aqui embaixo", 780, 1000, 30, "180,235,255", aR);
    // gravidade: linhas mais fortes perto da Terra
    const aF = PT.ss((t - tF + 0.4) / 0.5) * (1 - PT.ss((t - tD + 0.4) / 0.4)); if (aF > 0) for (let k = 0; k < 7; k++) { const px = 180 + k * 120; fSeta(x, px, 1060, px, 1120 + (k % 2) * 10, "200,210,255", aF * 0.7, 4); fSeta(x, px, 560, px, 585, "200,210,255", aF * 0.3, 2); }
    // erro acumulando no mapa
    const aD = PT.ss((t - tD + 0.3) / 0.5); if (aD > 0) { const d = PT.ss((t - tD) / 2) * 360; fCaixa(x, 540, 880, 760, 460, 20, BRC, aD, 4, 0.04); for (let k = 0; k < 5; k++) linhaP(x, 200 + k * 160, 660, 220 + k * 140, 1100, "90,110,160", 0.6 * aD, 3); pinoAzul(x, 360, 900, aD, t); discoP(x, 360 + d, 900 - d * 0.3, 14, VE, aD); linhaP(x, 360, 900, 360 + d, 900 - d * 0.3, VE, aD * 0.7, 4); rotuloP(x, "você", 360, 960, 28, "180,210,255", aD); rotuloP(x, "GPS sem correção", 360 + d, 840 - d * 0.3, 28, "255,160,170", aD); }
  });
};

// =============== 6. a dica ===============
CENAS.dica = (el, c, B) => {
  const tI = B("internet2"), tM = B("mapa"), tO = B("offline"), tF = B("funcionando");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["gps", 330, 62, "GPS: não gasta internet", "pt-ci"], ["off", 330, 66, "baixe o mapa off-line", "pt-am"]]);
  MD.slam(tl, tx.gps, tI - 0.05, { from: 1.25 }); MD.leave(tl, tx.gps, tM + 0.6); MD.slam(tl, tx.off, tM + 0.9, { from: 1.3 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    fCelular(x, 540, 920, 760, BRC, 1, 0.06);
    for (let k = 0; k < 6; k++) linhaP(x, 380 + k * 55, 640, 340 + k * 80, 1200, "90,110,160", 0.6, 3);
    const aB = PT.ss((t - tM + 0.2) / 0.4); if (aB > 0) { const prog = PT.ss((t - tM - 0.4) / (tO - tM)); fCaixa(x, 540, 1130, 360, 80, 40, VD, aB, 4, 0.08); fRR(x, 380, 1110, 320 * prog, 40, 20); x.fillStyle = `rgba(${VD},${0.6 * aB})`; x.fill(); rotuloP(x, prog < 1 ? "baixando mapa..." : "mapa off-line ✓", 540, 1060, 30, "150,255,200", aB); }
    const aF = PT.ss((t - tO + 0.2) / 0.5); semSinal(x, 640, 700, aF); pinoAzul(x, 520, 900, Math.max(aF, PT.ss((t - tF) / 0.4)), t);
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["os satélites gritam a hora", "o atraso vira distância", "4 distâncias = sua posição", "o Einstein corrige o relógio"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const nv = T.nuvem(9000), est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    globoG(nv, x, 540, 1260, 150, -50 + t * 4, 0.7 * sai);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [CI, AM, AZ, VE][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
