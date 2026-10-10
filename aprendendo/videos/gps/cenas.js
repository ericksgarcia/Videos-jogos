// Cenas do vídeo "Como o GPS sabe onde você está" — padrão novo (out/2026): objetos em pontos de luz com
// volume, pontos que se transformam, câmera com profundidade e física.
// Retenção: choque (sem Einstein, 10 km de erro por dia), meio-saber (o celular não manda nada, só escuta),
// analogia do trovão, as bolhas que se cruzam, pergunta ("chuta um número") e a promessa (os relógios do Einstein).

const MD = MotionDirector;
const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
const FUNDOG = fundoProfundo(61);
// globo de pontos (dados em libs/globo-dados.js)
const vecG = (lat, lon) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
function projG(lat0, lon0, R, cx, cy) { const ca = Math.cos(-lon0 * Math.PI / 180), sa = Math.sin(-lon0 * Math.PI / 180), cb = Math.cos(lat0 * Math.PI / 180), sb = Math.sin(lat0 * Math.PI / 180); return (v) => { const x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca, y2 = v[1] * cb - z1 * sb, z2 = v[1] * sb + z1 * cb; return [cx + x1 * R, cy - y2 * R, z2]; }; }
const TERRA_G = (() => { const o = []; for (let k = 0; k < GLOBO_TERRA.length; k += 2) o.push(vecG(GLOBO_TERRA[k] / 10, GLOBO_TERRA[k + 1] / 10)); for (let k = 0; k < GLOBO_BRASIL.length; k += 4) o.push(vecG(GLOBO_BRASIL[k] / 10, GLOBO_BRASIL[k + 1] / 10)); return o; })();
function globoG(nv, x, cx, cy, R, rot, a, i) {
  if (a <= 0.01) return i; brilhoP(x, cx, cy, R * 1.25, "60,140,255", 0.2 * a);
  const g = x.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R); g.addColorStop(0, `rgba(60,120,255,${0.22 * a})`); g.addColorStop(1, "rgba(20,40,120,0.02)"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, R, 0, 6.283); x.fill();
  const pj = projG(-10, rot, R, cx, cy); for (const v of TERRA_G) { if (i >= nv.n) break; const [px, py, z] = pj(v); if (z <= 0) continue; nv.ponto(i++, px, py, 0.55, 0.9, 0.62, a * (0.3 + 0.6 * z), Math.max(2.4, R / 140)); }
  return i;
}
// satélite desenhado: corpo, dois painéis e antena
const SAT_D = { desenho: (g, R) => { g.fillRect(R * 0.4, R * 0.38, R * 0.2, R * 0.24); for (const x0 of [0.06, 0.64]) { for (let k = 0; k < 3; k++) g.fillRect(R * (x0 + k * 0.105), R * 0.42, R * 0.09, R * 0.16); } g.fillRect(R * 0.34, R * 0.48, R * 0.32, R * 0.04); g.fillRect(R * 0.48, R * 0.62, R * 0.04, R * 0.12); g.beginPath(); g.arc(R * 0.5, R * 0.78, R * 0.06, Math.PI, 0); g.fill(); } };
const FG = {
  sat: formaPontos(SAT_D, 9000), satP: formaPontos(SAT_D, 900), cel: formaPontos("device-mobile", 9000), estrada: formaPontos("road-horizon", 9000), semNet: formaPontos("wifi-slash", 4000),
  pino: formaPontos("map-pin", 8000), mapa: formaPontos("map-trifold", 9000), interr: formaTexto("?", 9000), emc: formaTexto("E=mc²", 12000), n10: formaTexto("10 km", 12000),
  orelha: formaPontos("ear", 4000), raio: formaPontos("cloud-lightning", 9000), pessoa: formaPontos("person-simple", 5000), relogio: formaPontos("clock", 9000), mira: formaPontos("crosshair", 8000),
  sinal: formaPontos("broadcast", 4000), baixar: formaPontos("download-simple", 4000), timer: formaPontos("timer", 4000), planeta: formaPontos("globe-hemisphere-west", 9000),
};
function pinoAzul(x, cx, cy, a, t) { if (a <= 0.01) return; const p = (t * 1.2) % 1; anelP(x, cx, cy, 20 + p * 70, "120,190,255", a * (1 - p), 4); discoP(x, cx, cy, 16, "120,190,255", a); discoP(x, cx, cy, 7, "255,255,255", a); brilhoP(x, cx, cy, 60, "80,160,255", 0.6 * a); }
// pulso do sinal descendo do satélite até um ponto
function pulso(nv, x0, y0, x1, y1, t, a, i, cor = CORF.amarelo, n = 5, vel = 0.9) { if (a <= 0.01) return i; for (let k = 0; k < n && i < nv.n; k++) { const u = ((t * vel + k / n) % 1); for (let q = 0; q < 14; q++) { const w = Math.max(0, u - q * 0.006); nv.ponto(i++, x0 + (x1 - x0) * w, y0 + (y1 - y0) * w, cor[0], cor[1], cor[2], a * 1.6 * (1 - q / 14), 9); } } return i; }
function anelPts(nv, cx, cy, r, cor, a, i, n = 260) { if (a <= 0.01) return i; for (let j = 0; j < n && i < nv.n; j++) { const an = (j / n) * 6.283; nv.ponto(i++, cx + Math.cos(an) * r, cy + Math.sin(an) * r, cor[0], cor[1], cor[2], a, 3.6); } return i; }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tD = B("dez"), tI = B("internet"), tA = B("azul"), tO = B("onde"), tE = B("einstein");
  const p2 = tI - 0.8, p3 = tA - 0.8, p4 = tE - 2.6;
  mostrarGancho(tD - 0.6);
  const T = telaGPU(el, c), nv = T.nuvem(90000);
  const tx = palcoTexto(el, [["dez", 330, 72, "10 km de erro por dia", "pt-ve"], ["int", 330, 66, "funciona sem internet", "pt-ci"], ["azu", 330, 62, "o pontinho azul certinho", "pt-am"], ["ond", 330, 66, "como ele sabe?", "pt-ci"], ["ein", 330, 64, "e o Einstein: no final", "pt-am"]]);
  MD.slam(tl, tx.dez, tD - 0.3, { from: 1.35 }); MD.leave(tl, tx.dez, p2 - 0.1); MD.slam(tl, tx.int, tI - 0.4, { from: 1.25 }); MD.leave(tl, tx.int, p3 - 0.1); MD.slam(tl, tx.azu, tA - 0.4, { from: 1.25 }); MD.leave(tl, tx.azu, tO - 0.6);
  MD.slam(tl, tx.ond, tO - 0.4, { from: 1.3 }); MD.leave(tl, tx.ond, p4 - 0.1); MD.slam(tl, tx.ein, p4 + 0.2, { from: 1.25 });
  const CAM = cameraProf([[0, { zoom: 1.3, y: 1060 }], [p2, { zoom: 1.0, y: 960 }]]);
  const ORB = Array.from({ length: 6 }, (_, k) => ({ r: 520 + (k % 3) * 70, f: k * 1.05, v: 0.12 + 0.03 * (k % 2), z: k % 2 ? 1.3 : 0.9 }));
  T.quadro((x, t) => {
    const cam = CAM(t); let i = desenharFundo(nv, FUNDOG, t, cam, [0.75, 0.82, 1], 1, 0);
    // plano 1 (quadro 0): a Terra de pontos com satélites em volta, sinais descendo; o "10 km" de erro
    const a1 = 1 - PT.ss((t - p2) / 0.45);
    if (a1 > 0.01) {
      const [gx, gy, k] = projP(cam, 540, 1080, 1);
      i = globoG(nv, x, gx, gy, 360 * k, -50 + t * 3, a1, i);
      ORB.forEach((o) => { const an = o.f + t * o.v, sx = 540 + Math.cos(an) * o.r, sy = 1080 + Math.sin(an) * o.r * 0.55; if (sy > 1080 + 150) return; i = desenharForma(nv, FG.sat, { cx: sx, cy: sy, esc: 150, rot: an * 0.3, cam, z: o.z, cor: CORF.branco, borda: CORF.amarelo, a: a1, t, i0: i }); const [px, py] = projP(cam, sx, sy, o.z); i = pulso(nv, px, py, gx, gy - 300 * k, t + o.f, a1 * 0.6, i, CORF.amarelo, 3); });
      const e = FIS.chegar(t, tD - 0.2, 0.5); if (e > 0.01) { i = desenharForma(nv, FG.n10, { cx: 540, cy: 560, esc: 620 * e, cor: CORF.vermelho, a: a1, t, i0: i }); }
    }
    // plano 2: estrada vazia, sem internet, o celular continua
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { i = desenharForma(nv, FG.estrada, { cx: 540, cy: 1060, esc: 900, cor: CORF.cinza, a: a2 * 0.7, cam: { x: 540, y: 960, zoom: 1, foco: 1 }, z: 1.4, t, i0: i }); const e = FIS.chegar(t, p2 + 0.1, 0.6); i = desenharForma(nv, FG.cel, { cx: 540, cy: 900, esc: 520 * Math.max(0.01, e), cor: CORF.branco, a: a2, t, i0: i }); i = desenharForma(nv, FG.semNet, { cx: 780, cy: 620, esc: 160, cor: CORF.vermelho, a: a2 * PT.ss((t - tI + 0.3) / 0.3), t, i0: i }); pinoAzul(x, 540, 920, a2 * PT.ss((t - p2 - 0.5) / 0.4), t); }
    // plano 3: o pino no mapa; "como ele sabe?" — o pino vira um "?"
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) { i = desenharForma(nv, FG.mapa, { cx: 540, cy: 1000, esc: 700, cor: CORF.verde, a: a3 * 0.6, t, i0: i }); i = morfo(nv, FG.pino, FG.interr, PT.ss((t - tO + 0.4) / 0.8), { de: { cx: 540, cy: 860 - 30 * Math.max(0, FIS.balanco(t, p3 + 0.2, 1, 1.5, 3)), esc: 360, cor: CORF.azul }, para: { cx: 540, cy: 860, esc: 460, cor: CORF.ciano }, t, a: a3, i0: i }); }
    // plano 4: o "?" vira a fórmula do Einstein (promessa)
    const a4 = PT.ss((t - p4) / 0.4);
    if (a4 > 0.01) i = morfo(nv, FG.interr, FG.emc, PT.ss((t - p4) / 0.9), { de: { cx: 540, cy: 860, esc: 460, cor: CORF.ciano }, para: { cx: 540, cy: 940, esc: 860, cor: CORF.amarelo, giro: 0.15 * Math.sin(t) }, t, a: a4, onda: 0.3, curva: 0.4, i0: i });
    nv.total(i);
  });
};

// =============== 2. o celular só escuta ===============
CENAS.escuta = (el, c, B) => {
  const tE = B("escuta"), tV = B("vinte"), tT = B("trinta"), tG = B("gritando"), tB = B("bilionesimos");
  const pB = tV - 0.6, pC = tG - 0.6;
  const T = telaGPU(el, c), nv = T.nuvem(80000);
  const tx = palcoTexto(el, [["nao", 330, 62, "o celular não manda nada", "pt-ve"], ["esc", 420, 52, "ele só escuta", "pt-ci"], ["vin", 330, 64, "a 20 mil km de altura", "pt-ci"], ["tri", 420, 52, "mais de 30 satélites", "pt-am"], ["gri", 330, 62, "cada um grita a hora certa", "pt-am"]]);
  MD.slam(tl, tx.nao, c.ini + 0.4, { from: 1.25 }); MD.slam(tl, tx.esc, tE - 0.3, { from: 1.3 }); MD.leave(tl, [tx.nao, tx.esc], pB - 0.1); MD.slam(tl, tx.vin, tV - 0.3, { from: 1.25 }); MD.slam(tl, tx.tri, tT - 0.2, { from: 1.3 }); MD.leave(tl, [tx.vin, tx.tri], pC - 0.1); MD.slam(tl, tx.gri, tG - 0.5, { from: 1.2 });
  const SATS = Array.from({ length: 31 }, (_, k) => ({ an: k * 0.62, r: 470 + (k % 4) * 60, z: 0.9 + (k % 3) * 0.35 }));
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOG, t, null, [0.75, 0.82, 1], 1, 0);
    // A: o celular com a seta de "manda" riscada e as ondas chegando
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) { i = desenharForma(nv, FG.cel, { cx: 540, cy: 1060, esc: 520, cor: CORF.branco, a: aA, t, i0: i }); i = desenharForma(nv, FG.orelha, { cx: 540, cy: 1060, esc: 160 * Math.max(0.01, FIS.chegar(t, tE - 0.2, 0.5)), cor: CORF.ciano, a: aA, t, i0: i }); for (let k = 0; k < 3; k++) { const u = ((t * 0.7 + k / 3) % 1); x.beginPath(); x.arc(540, 820, 60 + (1 - u) * 260, Math.PI * 1.15, Math.PI * 1.85); x.strokeStyle = `rgba(143,227,255,${aA * u})`; x.lineWidth = 5; x.stroke(); } const up = FIS.chegar(t, c.ini + 0.4, 0.5); fSeta(x, 860, 900, 860, 640, "255,110,130", aA * PT.cl(up), 8); linhaP(x, 810, 720, 910, 820, "255,110,130", aA * PT.ss((t - c.ini - 0.9) / 0.2), 10); }
    // B: a Terra pequena e os 30+ satélites em volta (aparecem em cascata)
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { i = globoG(nv, x, 540, 980, 230, -50 + t * 4, aB, i); SATS.forEach((s, k) => { const e = FIS.cascata(t, tT - 0.6, k, 0.05, 0.5), an = s.an + t * 0.08; i = desenharForma(nv, FG.satP, { cx: 540 + Math.cos(an) * s.r, cy: 980 + Math.sin(an) * s.r * 0.75, esc: 70 * Math.max(0.01, e), cor: CORF.amarelo, a: aB, t, i0: i }); }); const r = FIS.chegar(t, tV - 0.3, 0.6); linhaP(x, 540, 980 - 230, 540, 980 - 230 - 240 * PT.cl(r), "143,227,255", aB, 4); rotuloP(x, "20 mil km", 690, 640, 40, "170,230,255", aB * PT.cl(r)); }
    // C: um satélite grande gritando quem é e a hora (dígitos correndo)
    const aC = PT.ss((t - pC) / 0.45);
    if (aC > 0.01) { const e = FIS.chegar(t, pC, 0.6); i = desenharForma(nv, FG.sat, { cx: 540, cy: 780, esc: 520 * Math.max(0.01, e), rot: 0.1 * Math.sin(t), cor: CORF.branco, borda: CORF.amarelo, a: aC, t, i0: i }); for (let k = 0; k < 3; k++) { const u = ((t * 0.8 + k / 3) % 1); anelP(x, 540, 860, 80 + u * 400, "255,210,63", aC * (1 - u) * 0.7, 4); } const rr = prng(Math.floor(t * 30)), ns = Array.from({ length: 9 }, () => Math.floor(rr() * 10)).join(""); rotuloP(x, "satélite 12", 540, 1150, 46, "255,226,140", aC); rotuloP(x, `10:42:${String(7 + Math.floor(t - pC)).padStart(2, "0")},${ns}`, 540, 1230, 50, "235,240,255", aC * PT.ss((t - tB + 1.2) / 0.4)); }
    nv.total(i);
  });
};

// =============== 3. o atraso vira distância ===============
CENAS.atraso = (el, c, B) => {
  const tL = B("luz"), tTr = B("trovao"), tLo = B("longe"), tA = B("atrasou"), tD = B("distancia"), tB = B("basta");
  const pB = tTr - 0.6, pC = tA - 0.8, pD = tB - 0.8;
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["luz", 330, 62, "na velocidade da luz", "pt-ci"], ["tro", 330, 66, "pensa num trovão", "pt-am"], ["lon", 420, 36, "demorou mais = mais longe", "pt-fino"], ["atr", 330, 62, "o atraso vira distância", "pt-ci"], ["bas", 330, 66, "uma só não basta", "pt-ve"]]);
  MD.slam(tl, tx.luz, tL - 0.4, { from: 1.25 }); MD.leave(tl, tx.luz, pB - 0.1); MD.slam(tl, tx.tro, tTr - 0.3, { from: 1.3 }); MD.arrive(tl, tx.lon, tLo - 0.3, { y: 14 }); MD.leave(tl, [tx.tro, tx.lon], pC - 0.1); MD.slam(tl, tx.atr, tA - 0.3, { from: 1.25 }); MD.leave(tl, tx.atr, pD - 0.1); MD.slam(tl, tx.bas, tB - 0.4, { from: 1.35 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOG, t, null, [0.75, 0.82, 1], 1, 0);
    // A: o sinal desce do satélite ao celular, e o cronômetro conta
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) { i = desenharForma(nv, FG.sat, { cx: 300, cy: 580, esc: 300, cor: CORF.branco, a: aA, t, i0: i }); i = desenharForma(nv, FG.cel, { cx: 760, cy: 1150, esc: 300, cor: CORF.branco, a: aA, t, i0: i }); i = pulso(nv, 330, 640, 740, 1060, t, aA, i, CORF.amarelo, 3, 0.7); i = desenharForma(nv, FG.timer, { cx: 300, cy: 1100, esc: 220, cor: CORF.ciano, a: aA, t, rot: 0.04 * Math.sin(t * 20), i0: i }); rotuloP(x, `0,0${Math.floor(((t - c.ini) * 37) % 9) + 6}7 s`, 300, 1260, 42, "170,230,255", aA); }
    // B: o trovão — o raio cai longe e o som chega depois (anéis atrasados)
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { i = desenharForma(nv, FG.raio, { cx: 300, cy: 700, esc: 360, cam: { x: 540, y: 960, zoom: 1, foco: 1 }, z: 1.4, cor: CORF.branco, borda: CORF.amarelo, a: aB, t, i0: i }); i = desenharForma(nv, FG.pessoa, { cx: 820, cy: 1160, esc: 300, cor: CORF.ciano, a: aB, t, i0: i }); const u = ((t - pB) / 2.2) % 1; anelP(x, 360, 760, 40 + u * 700, "255,210,63", aB * (1 - u) * 0.8, 6); rotuloP(x, `${Math.floor(((t - pB) / 0.7) % 4) + 1}...`, 820, 920, 60, "255,226,140", aB * PT.ss((t - tTr) / 0.4)); }
    // C: o atraso vira um raio de distância (círculo em volta do satélite passando pelo celular)
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { const r = 520 * FIS.chegar(t, tD - 0.6, 0.8); i = desenharForma(nv, FG.sat, { cx: 360, cy: 700, esc: 220, cor: CORF.amarelo, a: aC, t, i0: i }); i = anelPts(nv, 360, 700, Math.max(1, r), CORF.ciano, aC * 0.8, i); linhaP(x, 360, 700, 360 + r * 0.72, 700 + r * 0.69, "143,227,255", aC * 0.6, 3); pinoAzul(x, 360 + 520 * 0.72, 700 + 520 * 0.69, aC, t); rotuloP(x, "distância", 560, 790, 40, "170,230,255", aC * PT.cl(r / 520)); }
    // D: uma só não basta — você pode estar em qualquer ponto do círculo (pinos piscando nele todo)
    const aD = PT.ss((t - pD) / 0.4);
    if (aD > 0.01) { i = desenharForma(nv, FG.sat, { cx: 360, cy: 700, esc: 220, cor: CORF.amarelo, a: aD, t, i0: i }); i = anelPts(nv, 360, 700, 520, CORF.ciano, aD * 0.8, i); for (let k = 0; k < 6; k++) { const an = 0.2 + k * 0.45; pinoAzul(x, 360 + Math.cos(an) * 520, 700 + Math.sin(an) * 520, aD * (0.5 + 0.5 * Math.sin(t * 5 + k)), t + k); } }
    nv.total(i);
  });
};

// =============== 4. as bolhas que se cruzam ===============
CENAS.circulos = (el, c, B) => {
  const tU = B("um"), tD = B("dois"), tT = B("tres"), tQ = B("quatro"), tE = B("exata");
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["n1", 330, 62, "1 satélite: uma bolha", "pt-ci"], ["n2", 330, 62, "2: um círculo", "pt-ci"], ["n3", 330, 62, "3: sobram dois pontos", "pt-am"], ["n4", 330, 62, "o 4º acerta o relógio", "pt-am"], ["ex", 330, 76, "posição exata", "pt-ci"]]);
  const SAT = [[290, 780], [820, 760], [560, 1290]], P = [540, 1000], tv = [tU, tD, tT];
  MD.slam(tl, tx.n1, tU - 0.3, { from: 1.25 }); MD.leave(tl, tx.n1, tD - 0.4); MD.slam(tl, tx.n2, tD - 0.3, { from: 1.25 }); MD.leave(tl, tx.n2, tT - 0.4); MD.slam(tl, tx.n3, tT - 0.3, { from: 1.25 }); MD.leave(tl, tx.n3, tQ - 0.4); MD.slam(tl, tx.n4, tQ - 0.3, { from: 1.25 }); MD.leave(tl, tx.n4, tE - 0.5); MD.slam(tl, tx.ex, tE - 0.3, { from: 1.4 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOG, t, null, [0.75, 0.82, 1], 1, 0);
    const a = PT.ss((t - c.ini) / 0.4), ex = PT.ss((t - tE + 0.3) / 0.4);
    SAT.forEach(([sx, sy], k) => { const e = FIS.chegar(t, tv[k] - 0.4, 0.6); if (e < 0.01) return; i = desenharForma(nv, FG.sat, { cx: sx, cy: sy, esc: 150 * e, cor: CORF.amarelo, a, t, i0: i }); const r = Math.hypot(P[0] - sx, P[1] - sy) * FIS.chegar(t, tv[k] - 0.1, 0.7); i = anelPts(nv, sx, sy, Math.max(1, r), [CORF.ciano, CORF.verde, CORF.rosa][k], a * (0.7 - 0.4 * ex), i, 300); });
    const n2 = PT.ss((t - tD - 0.3) / 0.4), n3 = PT.ss((t - tT - 0.3) / 0.4);
    if (n2 > 0 && n3 < 1) for (const yy of [P[1], 590]) { discoP(x, P[0] + (yy === P[1] ? 0 : -80), yy, 12, "255,226,140", a * n2 * (1 - n3 * (yy === P[1] ? 0 : 1))); }
    if (n3 > 0) { pinoAzul(x, P[0], P[1], a * n3, t); const fora = 1 - PT.ss((t - tQ) / 0.6); discoP(x, 470, 520, 12, "255,170,180", a * n3 * fora); rotuloP(x, "no espaço", 470, 470, 36, "255,170,180", a * n3 * fora); }
    const q = FIS.chegar(t, tQ - 0.3, 0.6); if (q > 0.01) { i = desenharForma(nv, FG.relogio, { cx: 840, cy: 1230, esc: 170 * q, rot: 0.3 * FIS.balanco(t, tQ, 1, 2, 3), cor: CORF.branco, a, t, i0: i }); linhaP(x, 840, 1230, 840 + Math.cos(t * 6) * 50, 1230 + Math.sin(t * 6) * 50, "255,226,140", a * PT.cl(q), 5); }
    if (ex > 0) { const m = FIS.chegar(t, tE - 0.3, 0.6); i = desenharForma(nv, FG.mira, { cx: P[0], cy: P[1], esc: 280 * Math.max(0.01, m), cor: CORF.azul, a: a * ex, t, i0: i }); }
    nv.total(i);
  });
};

// =============== 5. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tE = B("escuta2"), tA = B("agora"), tN = B("numero");
  const pB = tC + 0.5, pC = tA + 0.1;
  const T = telaGPU(el, c), nv = T.nuvem(60000);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["qua", 330, 60, "quantas pessoas usam os mesmos satélites agora?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["chu", 330, 80, "chuta um número", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, pB - 0.1); MD.slam(tl, tx.qua, pB + 0.1, { from: 1.15 }); MD.leave(tl, tx.qua, pC - 0.1); MD.slam(tl, tx.chu, pC + 0.1, { from: 1.45 });
  const R = prng(9), PTS = Array.from({ length: 220 }, () => [R() * 2 - 1, R() * 2 - 1, R()]);
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOG, t, null, [0.75, 0.82, 1], 1, 0);
    const aA = FIS.chegar(t, c.ini + 0.1, 0.6) * (1 - PT.ss((t - pB) / 0.4));
    i = balaoPergunta(nv, x, t, PT.cl(aA), 540, 930, 620, i);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { i = globoG(nv, x, 540, 980, 380, -50 + t * 5, aB, i); const n = PT.ss((t - pB) / 2.5); PTS.forEach(([u, v, f], k) => { if (f > n || u * u + v * v > 1) return; { const px = 540 + u * 340, py = 980 + v * 340, al = aB * (0.5 + 0.4 * Math.sin(t * 4 + k)); discoP(x, px, py, 6, "140,200,255", al); brilhoP(x, px, py, 18, "80,160,255", 0.4 * al); } }); }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { i = balaoPergunta(nv, x, t, aC, 540, 900, 580, i); setaComentarios(x, aC, t); }
    nv.total(i);
  });
};

// =============== 6. os relógios do Einstein ===============
CENAS.einstein = (el, c, B) => {
  const tPm = B("prometi"), tR = B("rapido"), tM = B("micro"), tG = B("gravidade"), tE = B("einstein2"), tEr = B("erro");
  const pB = tM + 0.3, pC = tEr - 2.4;
  const T = telaGPU(el, c), nv = T.nuvem(80000);
  const tx = palcoTexto(el, [["pro", 330, 66, "a parte prometida", "pt-am"], ["rap", 330, 60, "lá em cima o relógio adianta", "pt-ci", "white-space:normal;left:60px;width:960px"], ["mic", 420, 44, "38 milionésimos de segundo por dia", "pt-fino"], ["gra", 330, 62, "a gravidade é mais fraca lá", "pt-ci"], ["ein", 330, 64, "a relatividade do Einstein", "pt-am"], ["err", 330, 64, "sem a correção: +10 km por dia", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.pro, tPm - 0.5, { from: 1.3 }); MD.leave(tl, tx.pro, tR - 0.9); MD.slam(tl, tx.rap, tR - 0.6, { from: 1.2 }); MD.arrive(tl, tx.mic, tM - 0.8, { y: 14 }); MD.leave(tl, [tx.rap, tx.mic], tG - 1.2);
  MD.slam(tl, tx.gra, tG - 0.9, { from: 1.25 }); MD.leave(tl, tx.gra, tE - 0.6); MD.slam(tl, tx.ein, tE - 0.4, { from: 1.25 }); MD.leave(tl, tx.ein, pC - 0.1); MD.slam(tl, tx.err, pC + 0.2, { from: 1.2 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOG, t, null, [0.75, 0.82, 1], 1, 0);
    // A: dois relógios: o do satélite (em cima) gira um pouco mais rápido que o da Terra (embaixo)
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) { i = desenharForma(nv, FG.sat, { cx: 540, cy: 560, esc: 220, cor: CORF.amarelo, a: aA, t, i0: i }); for (const [cy, vel, cor] of [[790, 1.25, "255,226,140"], [1180, 1.0, "170,230,255"]]) { i = desenharForma(nv, FG.relogio, { cx: 540, cy, esc: 280, cor: CORF.branco, a: aA, t, i0: i }); const an = (t - c.ini) * vel * 2.4; linhaP(x, 540, cy, 540 + Math.sin(an) * 85, cy - Math.cos(an) * 85, cor, aA, 7); } i = globoG(nv, x, 540, 1560, 280, -50 + t * 3, aA * 0.6, i); }
    // B: a gravidade mais fraca lá em cima (anéis que enfraquecem) e a relatividade
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { i = globoG(nv, x, 540, 1150, 260, -50 + t * 3, aB, i); for (let k = 1; k <= 5; k++) i = anelPts(nv, 540, 1150, 260 + k * 70, CORF.lilas, aB * (0.7 - k * 0.12), i, 240); i = desenharForma(nv, FG.sat, { cx: 540 + Math.cos(t * 0.4) * 380, cy: 1150 - 560 + Math.sin(t * 0.4) * 60, esc: 150, cor: CORF.amarelo, a: aB, t, i0: i }); const e = FIS.chegar(t, tE - 0.3, 0.6); if (e > 0.01) i = desenharForma(nv, FG.emc, { cx: 540, cy: 600, esc: 620 * e, cor: CORF.amarelo, a: aB, t, i0: i }); }
    // C: sem a correção, o pino escorrega 10 km por dia
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { i = desenharForma(nv, FG.mapa, { cx: 540, cy: 1000, esc: 760, cor: CORF.verde, a: aC * 0.6, t, i0: i }); const d = PT.ss((t - tEr + 1.6) / 1.6) * 360; x.setLineDash([10, 12]); linhaP(x, 360, 1000, 360 + d, 1000 - d * 0.3, "255,110,130", aC, 4); x.setLineDash([]); pinoAzul(x, 360, 1000, aC, t); i = desenharForma(nv, FG.pino, { cx: 360 + d, cy: 940 - d * 0.3, esc: 200, cor: CORF.vermelho, a: aC * PT.ss((t - pC - 0.4) / 0.4), t, i0: i }); rotuloP(x, "10 km", 360 + d / 2, 1080 - d * 0.15, 46, "255,170,180", aC * PT.ss((t - tEr + 0.6) / 0.4)); }
    nv.total(i);
  });
};

// =============== 7. a dica ===============
CENAS.dica = (el, c, B) => {
  const tGa = B("gasta"), tM = B("mapa"), tO = B("offline"), tF = B("funciona");
  const T = telaGPU(el, c), nv = T.nuvem(50000);
  const tx = palcoTexto(el, [["dic", 330, 70, "a dica", "pt-am"], ["map", 330, 62, "baixa o mapa da região", "pt-ci"], ["off", 330, 62, "o GPS funciona sem internet", "pt-am"]]);
  MD.slam(tl, tx.dic, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dic, tM - 0.5); MD.slam(tl, tx.map, tM - 0.3, { from: 1.25 }); MD.leave(tl, tx.map, tF - 0.6); MD.slam(tl, tx.off, tF - 0.4, { from: 1.25 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOG, t, null, [0.75, 0.82, 1], 1, 0);
    const a = PT.ss((t - c.ini) / 0.4), e = FIS.chegar(t, c.ini + 0.2, 0.6);
    i = desenharForma(nv, FG.cel, { cx: 540, cy: 980, esc: 640 * Math.max(0.01, e), cor: CORF.branco, a, t, i0: i });
    const m = FIS.chegar(t, tM - 0.3, 0.6); i = desenharForma(nv, FG.mapa, { cx: 540, cy: 960, esc: 280 * Math.max(0.01, m), cor: CORF.verde, a, t, i0: i });
    const b = PT.ss((t - tM) / 0.3) * (1 - PT.ss((t - tO) / 0.4)); i = desenharForma(nv, FG.baixar, { cx: 540, cy: 760 + ((t * 120) % 60), esc: 130, cor: CORF.ciano, a: a * b, t, i0: i });
    const s = PT.ss((t - tO + 0.3) / 0.3); i = desenharForma(nv, FG.semNet, { cx: 800, cy: 640, esc: 150, cor: CORF.vermelho, a: a * s, t, i0: i }); pinoAzul(x, 560, 990, a * s, t);
    nv.total(i);
  });
};

// =============== 8. resumo ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c), nv = T.nuvem(40000);
  const Y = [520, 680, 840, 1000], textos = ["os satélites gritam a hora", "o atraso vira distância", "4 distâncias dão a posição", "o Einstein corrige os relógios"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 48, s, "", "left:250px;width:780px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const IC = [[FG.sinal, CORF.amarelo], [FG.timer, CORF.ciano], [FG.mira, CORF.azul], [FG.relogio, CORF.branco]];
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOG, t, null, [0.75, 0.82, 1], 1, 0);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    tP.forEach((tp, k) => { const e = FIS.chegar(t, tp - 0.2, 0.5), ent = FIS.cascata(t, c.ini + 0.3, k, 0.12, 0.6); i = desenharForma(nv, IC[k][0], { cx: 160, cy: Y[k] + 10, esc: 120 * Math.max(0.01, Math.min(1, ent)), cor: IC[k][1], a: sai * Math.min(1, ent) * (0.3 + 0.7 * PT.cl(e)), t, i0: i }); });
    i = globoG(nv, x, 540, 1290, 170, -50 + t * 6, 0.7 * sai, i);
    nv.total(i);
  });
  cartaoFinal(el, tC + 1.4);
};
