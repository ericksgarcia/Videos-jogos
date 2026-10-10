// Cenas do vídeo "Por que parece que o celular escuta suas conversas" — pontos de luz na GPU.
// Retenção do começo ao fim: paradoxo no 1º segundo, promessa (o sinal na tela que entrega o
// microfone), "adivinha quantos?" (nenhum), rastros, o segundo culpado (o cérebro), pergunta para os
// comentários e a dica prometida. Troca de plano a cada poucos segundos.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", BRC = "220,228,245";
const estF = (seed) => ambienteP(240, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.6);

function microfone(x, cx, cy, s, cor, a, risco = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy - 30 * s, 60 * s, 110 * s, 30 * s, cor, a, 5 * s, 0.3);
  x.beginPath(); x.arc(cx, cy - 10 * s, 55 * s, 0.1, Math.PI - 0.1); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 6 * s; x.stroke();
  linhaP(x, cx, cy + 45 * s, cx, cy + 80 * s, cor, a, 6 * s); linhaP(x, cx - 30 * s, cy + 80 * s, cx + 30 * s, cy + 80 * s, cor, a, 6 * s);
  if (risco > 0) { linhaP(x, cx - 80 * s, cy - 90 * s, cx + 80 * s, cy + 90 * s, VE, risco, 10 * s); brilhoP(x, cx, cy, 120 * s, VE, 0.3 * risco); }
}
function tenis(x, cx, cy, s, cor, a) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 90 * s, cy + 30 * s); x.lineTo(cx - 90 * s, cy - 30 * s); x.quadraticCurveTo(cx - 60 * s, cy - 50 * s, cx - 20 * s, cy - 30 * s); x.quadraticCurveTo(cx + 30 * s, cy - 10 * s, cx + 80 * s, cy + 5 * s); x.quadraticCurveTo(cx + 100 * s, cy + 15 * s, cx + 95 * s, cy + 30 * s); x.closePath(); x.fillStyle = `rgba(${cor},${0.3 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 5 * s; x.stroke(); linhaP(x, cx - 90 * s, cy + 30 * s, cx + 95 * s, cy + 30 * s, "255,255,255", a, 8 * s); for (let k = 0; k < 3; k++) linhaP(x, cx - 40 * s + k * 18 * s, cy - 32 * s + k * 6 * s, cx - 30 * s + k * 18 * s, cy - 18 * s + k * 6 * s, "255,255,255", 0.8 * a, 3 * s); }
function balao(x, cx, cy, w, txt, cor, a) { if (a <= 0.01) return; fCaixa(x, cx, cy, w, 90, 40, cor, a, 4, 0.18); x.beginPath(); x.moveTo(cx - 20, cy + 44); x.lineTo(cx - 40, cy + 80); x.lineTo(cx + 5, cy + 44); x.fillStyle = `rgba(${cor},${0.5 * a})`; x.fill(); rotuloP(x, txt, cx, cy, 40, "255,255,255", a); }
function anuncio(x, cx, cy, w, a, destaque = 0, cor = AM) { if (a <= 0.01) return; fCaixa(x, cx, cy, w, w * 0.62, 18, cor, a, 4 + 3 * destaque, 0.05 + 0.05 * destaque); tenis(x, cx, cy - 10, w / 300, "255,235,180", a); rotuloP(x, "ANÚNCIO", cx, cy + w * 0.22, w * 0.08, cor, a); if (destaque > 0) brilhoP(x, cx, cy, w * 0.9, cor, 0.12 * destaque); }
function wifi(x, cx, cy, s, cor, a, t = 0) { if (a <= 0.01) return; for (let k = 1; k <= 3; k++) { x.beginPath(); x.arc(cx, cy, 30 * k * s, -Math.PI * 0.75, -Math.PI * 0.25); x.strokeStyle = `rgba(${cor},${a * (0.5 + 0.5 * Math.sin(t * 4 - k))})`; x.lineWidth = 8 * s; x.stroke(); } discoP(x, cx, cy, 8 * s, cor, a); }
function predio(x, cx, cy, w, h, cor, a) { if (a <= 0.01) return; fCaixa(x, cx, cy, w, h, 6, cor, a, 4, 0.12); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) discoP(x, cx - w / 3 + i * w / 3, cy - h / 2 + 25 + j * (h - 40) / 4, 6, cor, 0.7 * a); }

const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
// balão de comentário com "?"
function balaoCom(x, cx, cy, s, a, txt = "?", t = 0) {
  if (a <= 0.01) return; fCaixa(x, cx, cy, 520 * s, 330 * s, 60 * s, CI, a, 8 * s, 0.12);
  x.beginPath(); x.moveTo(cx - 120 * s, cy + 160 * s); x.lineTo(cx - 190 * s, cy + 250 * s); x.lineTo(cx - 40 * s, cy + 160 * s); x.fillStyle = `rgba(${CI},${0.5 * a})`; x.fill();
  brilhoP(x, cx, cy, 380 * s, CI, 0.18 * a); rotuloP(x, txt, cx, cy + 6 * s, 190 * s, "255,226,140", a * (0.85 + 0.15 * Math.sin(t * 4)));
}
// nuvem de pensamento
function pensamentoC(x, cx, cy, s, a) { if (a <= 0.01) return; for (const [dx, dy, r] of [[0, 0, 120], [-110, 20, 85], [110, 25, 90], [-50, -70, 85], [60, -65, 80]]) { anelP(x, cx + dx * s, cy + dy * s, r * s, BRC, a * 0.8, 5); discoP(x, cx + dx * s, cy + dy * s, r * s, BRC, a * 0.05); } for (const [dx, dy, r] of [[-170, 170, 26], [-215, 230, 16]]) anelP(x, cx + dx * s, cy + dy * s, r * s, BRC, a * 0.8, 4); }
// canto da tela com o pontinho de "microfone em uso"
function pontinho(x, cx, cy, cor, a, t) { if (a <= 0.01) return; const pul = 0.6 + 0.4 * Math.sin(t * 6); discoP(x, cx, cy, 14, cor, a); brilhoP(x, cx, cy, 90 * pul, cor, 0.6 * a); }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tOu = B("ouvir0"), tFa = B("falou"), tT = B("tenis"), tA = B("anuncio"), tO = B("ouvindo"), tP = B("promessa");
  const p2 = tT - 1.0, p3 = tA - 1.0, p4 = tP - 2.0;
  mostrarGancho(p2 - 0.2);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dia", 330, 56, "no dia seguinte...", "pt-fino"], ["ouv", 330, 80, "ele estava ouvindo?", "pt-ve"], ["sin", 330, 62, "o sinal que entrega: no final", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.arrive(tl, tx.dia, p3 + 0.1, { y: 14 }); MD.leave(tl, tx.dia, tO - 0.4); MD.slam(tl, tx.ouv, tO - 0.1, { from: 1.35 }); MD.leave(tl, tx.ouv, p4 - 0.2); MD.slam(tl, tx.sin, p4 + 0.1, { from: 1.25 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano 1 (quadro 0): o celular, microfone riscado, e os seus rastros entrando nele
    const a1 = 1 - PT.ss((t - p2) / 0.4);
    if (a1 > 0.01) {
      brilhoP(x, 540, 960, 520, "90,160,255", 0.35 * a1); fCelular(x, 540, 960, 720, BRC, a1, 0.1);
      microfone(x, 540, 900, 1.6, CI, a1, PT.ss((t - tOu + 0.2) / 0.4));
      const nomes = ["onde foi", "o que buscou", "quem estava perto", "o que assistiu"], aR = PT.ss((t - tFa + 0.8) / 0.6);
      nomes.forEach((nm, k) => { const [px, py] = [[195, 680], [885, 680], [195, 1240], [885, 1240]][k]; rotuloP(x, nm, px, py, 33, "255,226,140", aR * a1 * PT.ss((t - tFa + 0.8 - k * 0.25) / 0.4)); for (let q = 0; q < 4; q++) { const u = ((t * 0.7 + q / 4 + k * 0.13) % 1); discoP(x, PT.lerp(px, 540, u), PT.lerp(py + 30, 960, u), 7, AM, aR * a1 * (1 - u * 0.5)); } });
    }
    // plano 2: a conversa
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { fPessoa(x, 330, 1120, 3, CI, a2); fPessoa(x, 750, 1120, 3, AM, a2); balao(x, 380, 790, 300, "tênis!", CI, a2 * PT.ss((t - tT + 0.4) / 0.4)); fCelular(x, 540, 1290, 150, BRC, a2 * 0.9, 0.1); }
    // plano 3: o anúncio
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) { fCelular(x, 540, 980, 780, BRC, a3, 0.08); anuncio(x, 540, 980, 300, a3 * PT.ss((t - tA + 0.3) / 0.4), PT.ss((t - tA) / 0.5) * (0.6 + 0.4 * Math.sin(t * 5))); }
    // plano 4: o canto da tela — o sinal (teaser)
    const a4 = PT.ss((t - p4) / 0.5);
    if (a4 > 0.01) { fCaixa(x, 540, 1060, 900, 640, 90, BRC, a4, 8, 0.05); fRR(x, 380, 760, 320, 50, 25); x.fillStyle = `rgba(${BRC},${0.6 * a4})`; x.fill(); pontinho(x, 860, 830, "255,170,60", a4 * PT.ss((t - p4 - 0.6) / 0.3), t); rotuloP(x, "?", 860, 1050, 140, AM, a4 * 0.9); }
  });
};

// =============== 2. 17 mil aplicativos ===============
CENAS.teste = (el, c, B) => {
  const tD = B("dezessete"), tM = B("mic"), tAd = B("adivinha"), tN = B("nenhum"), tT = B("tela"), tE = B("empresas"), tAc = B("acertou");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["n", 330, 86, "17 mil apps", "pt-ci"], ["mic", 330, 64, "microfone escondido?", "pt-ci"], ["adv", 330, 92, "adivinha?", "pt-am"], ["nen", 330, 110, "nenhum", "pt-ve"], ["tel", 330, 66, "gravando a tela", "pt-am"], ["ace", 330, 62, "então como ele acertou?", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.n, tD - 0.05, { from: 1.3 }); MD.leave(tl, tx.n, tM - 0.35); MD.arrive(tl, tx.mic, tM - 0.2, { y: 14 }); MD.leave(tl, tx.mic, tAd - 0.3);
  MD.slam(tl, tx.adv, tAd - 0.05, { from: 1.5 }); MD.leave(tl, tx.adv, tN - 0.3); MD.slam(tl, tx.nen, tN - 0.05, { from: 1.6 }); MD.leave(tl, tx.nen, tT - 0.4);
  MD.slam(tl, tx.tel, tT - 0.05, { from: 1.3 }); MD.leave(tl, tx.tel, tAc - 1.2); MD.slam(tl, tx.ace, tAc - 0.9, { from: 1.25 });
  const nv = T.nuvem(17300), est = estF(5);
  const pB = tAd - 0.4, pC = tT - 0.6, pD = tAc - 1.0;
  const APPS = (() => { const r = prng(9), o = []; for (let i = 0; i < 17260; i++) { const col = i % 115, lin = Math.floor(i / 115); o.push({ x: 160 + col * 6.5, y: 560 + lin * 4.6, n: r() }); } return o; })();
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: os 17 mil apps e o scanner
    const aA = PT.ss((t - c.ini - 0.2) / 0.5) * (1 - PT.ss((t - pB) / 0.4)), scan = PT.cl((t - tM + 0.6) / 1.8);
    if (aA > 0.01) { let i = nv.k; for (const p of APPS) { const vis = PT.ss((t - c.ini - 0.2 - p.y / 1600) / 0.4); if (vis <= 0) continue; const passou = p.y < 560 + scan * 700; const c0 = passou ? [0.5, 1.0, 0.75] : [0.56, 0.89, 1.0]; nv.ponto(i++, p.x, p.y, c0[0], c0[1], c0[2], aA * vis * (0.55 + 0.4 * p.n), 3.4); } nv.total(i); if (scan > 0 && scan < 1) { const y = 560 + scan * 700; linhaP(x, 140, y, 940, y, VD, aA, 4); brilhoP(x, 540, y, 300, VD, 0.15 * aA); } } else nv.total(nv.k);
    // plano B: adivinha... nenhum (o contador gira e para no zero)
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const gira = t < tN - 0.1; const n = gira ? Math.floor((t * 37) % 100) : 0; anelP(x, 540, 960, 260, gira ? AM : VE, aB, 10); brilhoP(x, 540, 960, 340, gira ? AM : VE, 0.2 * aB); rotuloP(x, String(n), 540, 970, 230, gira ? "255,226,140" : "255,140,160", aB); if (!gira) microfone(x, 820, 700, 0.9, BRC, aB, PT.ss((t - tN) / 0.3)); }
    // plano C: apps gravando a tela e mandando pra empresas
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { fCelular(x, 540, 900, 560, BRC, aC, 0.08); x.setLineDash([16, 12]); fCaixa(x, 540, 920, 230, 420, 10, VE, aC * (0.6 + 0.4 * Math.sin(t * 6)), 5, 0); x.setLineDash([]); discoP(x, 460, 690, 10, VE, aC * (0.5 + 0.5 * Math.sin(t * 8))); rotuloP(x, "REC", 510, 690, 30, "255,160,170", aC); const aE = PT.ss((t - tE + 0.4) / 0.5); [[200, 1330], [540, 1360], [880, 1330]].forEach(([px, py]) => { predio(x, px, py, 120, 150, VE, aC * aE); for (let q = 0; q < 4; q++) { const u = ((t - tE) * 0.7 + q / 4) % 1; discoP(x, PT.lerp(540, px, u), PT.lerp(1120, py - 90, u), 7, VE, aC * aE * Math.sin(u * Math.PI)); } }); }
    // plano D: o anúncio do tênis com "?"
    const aD = PT.ss((t - pD) / 0.5);
    if (aD > 0.01) { anuncio(x, 540, 960, 420, aD, 0.6 + 0.4 * Math.sin(t * 5)); rotuloP(x, "?", 860, 720, 150, AM, aD * (0.85 + 0.15 * Math.sin(t * 4))); }
  });
};

// =============== 3. os seus rastros ===============
CENAS.rastros = (el, c, B) => {
  const tL = B("local"), tBu = B("busca"), tV = B("video"), tW = B("wifi"), tPo = B("pontos"), tC = B("culpado"), tCa = B("cabeca");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ras", 330, 70, "os seus rastros", "pt-ci"], ["wif", 330, 70, "mesmo wi-fi", "pt-ci"], ["lig", 330, 66, "o sistema liga os pontos", "pt-am", "white-space:normal;left:60px;width:960px"], ["cul", 330, 80, "2º culpado...", "pt-ve"]]);
  MD.arrive(tl, tx.ras, c.ini + 0.4, { y: 14 }); MD.leave(tl, tx.ras, tW - 0.4); MD.slam(tl, tx.wif, tW - 0.05, { from: 1.25 }); MD.leave(tl, tx.wif, tPo - 0.3);
  MD.slam(tl, tx.lig, tPo - 0.05, { from: 1.25 }); MD.leave(tl, tx.lig, tC - 0.4); MD.slam(tl, tx.cul, tC - 0.05, { from: 1.4 });
  const nv = T.nuvem(9100), est = estF(7);
  const pB = tW - 1.0, pC = tC - 0.5;
  const MAPA = (() => { const r = prng(11), o = []; for (let i = 0; i < 5800; i++) { const rua = r() < 0.5, k = Math.floor(r() * 9); o.push(rua ? { x: 120 + r() * 840, y: 560 + k * 95 } : { x: 120 + k * 105, y: 560 + r() * 760 }); } return o; })();
  const rota = [[200, 1270], [200, 940], [520, 940], [520, 750], [860, 750]];
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: o mapa do seu dia (câmera chegando)
    const aA = PT.ss((t - c.ini - 0.2) / 0.5) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) {
      let i = nv.k; for (const p of MAPA) nv.ponto(i++, p.x, p.y, 0.4, 0.55, 0.9, 0.22 * aA, 2.6); nv.total(i);
      const aL = PT.ss((t - tL + 0.6) / 0.5) * aA; if (aL > 0) { fLinhaPts(x, rota, PT.ss((t - tL + 0.6) / 2), CI, aL, 6); [[200, 1270], [520, 940], [860, 750]].forEach(([px, py], k) => { const q = PT.ss((t - tL + 0.4 - k * 0.4) / 0.4); discoP(x, px, py - 30, 18 * q, VE, aL); linhaP(x, px, py - 12, px, py, VE, aL * q, 4); }); }
      const aP = PT.ss((t - tBu + 0.3) / 0.4) * aA; if (aP > 0) { fCaixa(x, 330, 620, 380, 70, 35, BRC, aP, 4, 0.12); rotuloP(x, "busca: tênis", 330, 620, 34, "255,255,255", aP); }
      const aV = PT.ss((t - tV + 0.3) / 0.4) * aA; if (aV > 0) { fCaixa(x, 820, 1080, 240, 140, 14, AM, aV, 4, 0.15); rotuloP(x, "▶ 0:47", 820, 1080, 36, "255,255,255", aV); }
    } else if (t < pC) nv.total(nv.k);
    // plano B: você e o amigo no mesmo wi-fi — o sistema liga os pontos
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { wifi(x, 540, 760, 2.2, VD, aB, t); fPessoa(x, 330, 1150, 2.6, CI, aB); fPessoa(x, 750, 1150, 2.6, AM, aB); const aBu = PT.ss((t - pB - 0.3) / 0.4); fCaixa(x, 750, 880, 300, 64, 32, AM, aB * aBu, 4, 0.12); rotuloP(x, "busca: tênis", 750, 880, 30, "255,255,255", aB * aBu); const aPo = PT.ss((t - tPo + 0.3) / 0.5); if (aPo > 0) { fLinhaPts(x, [[750, 920], [540, 1010], [330, 980]], aPo, AM, aB, 5); anuncio(x, 330, 880, 170, aB * PT.ss((t - tPo) / 0.4), 0.8); } }
    // plano C: o segundo culpado está dentro da cabeça
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { fCerebro(nv, 540, 960, 300, aC, { cor: [0.75, 0.75, 1.0], cerebelo: 0 }); rotuloP(x, "?", 820, 720, 150, VE, aC * PT.ss((t - tCa + 0.4) / 0.4)); }
  });
};

// =============== 4. o segundo culpado: o seu cérebro ===============
CENAS.cerebro = (el, c, B) => {
  const tE = B("esquece"), tB = B("bate"), tG = B("gruda"), tCa = B("carro"), tTo = B("todo"), tS = B("somem");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["mon", 330, 70, "um monte por dia", "pt-ci"], ["esq", 330, 70, "esquece quase todos", "pt-ci"], ["gru", 330, 76, "esse gruda", "pt-am"], ["car", 330, 60, "carro novo: vê em todo lugar", "pt-ci", "white-space:normal;left:60px;width:960px"], ["ace", 330, 62, "acertos ficam, erros somem", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.arrive(tl, tx.mon, c.ini + 0.3, { y: 14 }); MD.leave(tl, tx.mon, tE - 0.3); MD.slam(tl, tx.esq, tE - 0.05, { from: 1.2 }); MD.leave(tl, tx.esq, tG - 0.35); MD.slam(tl, tx.gru, tG - 0.05, { from: 1.4 }); MD.leave(tl, tx.gru, tCa - 0.4);
  MD.slam(tl, tx.car, tCa - 0.05, { from: 1.25 }); MD.leave(tl, tx.car, tS - 1.9); MD.slam(tl, tx.ace, tS - 1.6, { from: 1.25 });
  const nv = T.nuvem(9100), est = estF(13);
  const pB = tCa - 0.6, pC = tS - 1.8;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: esteira de anúncios passando pelo cérebro; quase todos somem, um gruda
    const aA = PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) {
      fCerebro(nv, 540, 1180, 230, aA, { cor: [0.7, 0.75, 1.0] });
      for (let k = 0; k < 9; k++) { const u = ((t - c.ini) * 0.22 + k / 9) % 1, px = PT.lerp(1180, -100, u), py = 720 + Math.sin(k * 2.1) * 60, hit = k === 4 && t > tB - 0.3, esq = PT.ss((t - tE + 0.3) / 0.5); anuncio(x, hit ? 540 : px, hit ? 760 : py, 200, aA * (hit ? 1 : 1 - 0.75 * esq), hit ? 1 : 0, hit ? AM : "170,178,195"); }
      const aG = PT.ss((t - tG + 0.2) / 0.4); if (aG > 0) { fLinhaPts(x, [[540, 840], [540, 1080]], aG, AM, aA, 6); brilhoP(x, 540, 1100, 160, AM, 0.5 * aG * aA); }
    } else if (t < pC) nv.total(nv.k);
    // plano B: o carro que você comprou aparece em todo lugar
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const r = prng(4); for (let k = 0; k < 9; k++) { const px = 160 + r() * 760, py = 620 + r() * 620, q = PT.ss((t - pB - 0.2 - k * 0.18) / 0.3), s = 1.1; fCaixa(x, px, py, 130 * s, 48 * s, 14, AM, aB * q, 4, 0.2); fCaixa(x, px - 5, py - 34, 70 * s, 30 * s, 10, AM, aB * q * 0.8, 3, 0.1); anelP(x, px - 38, py + 28, 13, AM, aB * q, 4); anelP(x, px + 38, py + 28, 13, AM, aB * q, 4); } }
    // plano C: placar — o acerto brilha, os erros apagam
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { fCerebro(nv, 540, 1180, 230, aC * 0.8, { cor: [0.7, 0.75, 1.0] }); anuncio(x, 540, 760, 260, aC, 1); for (let k = 0; k < 6; k++) { const px = [150, 270, 810, 930, 200, 880][k], py = [620, 900, 620, 900, 1150, 1150][k]; anuncio(x, px, py, 150, aC * (1 - 0.85 * PT.ss((t - tS + 0.5) / 0.6)), 0, "170,178,195"); } }
  });
};

// =============== 5. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tN = B("naoouve"), tP = B("pensou"), tPe = B("pesquisou"), tT = B("teoria");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["pen", 330, 70, "você só pensou...", "pt-ci"], ["teo", 330, 80, "qual a sua teoria?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, tN - 0.5);
  MD.slam(tl, tx.pen, tP - 0.1, { from: 1.25 }); MD.leave(tl, tx.pen, tT - 0.35); MD.slam(tl, tx.teo, tT - 0.05, { from: 1.4 });
  const est = estF(21);
  const pB = tN - 0.5, pC = tT - 0.6;
  T.quadro((x, t) => {
    estD(x, est, t);
    balaoCom(x, 540, 960, 1.2, PT.ss((t - c.ini - 0.1) / 0.4) * (1 - PT.ss((t - pB) / 0.4)), "?", t);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { fPessoa(x, 300, 1160, 3.2, CI, aB); pensamentoC(x, 560, 760, 1.0, aB * PT.ss((t - tP + 0.6) / 0.4)); tenis(x, 560, 760, 1.0, "255,235,180", aB * PT.ss((t - tP + 0.4) / 0.4)); fCelular(x, 820, 1200, 300, BRC, aB, 0.08); anuncio(x, 820, 1200, 120, aB * PT.ss((t - tP) / 0.4), 0.8); microfone(x, 640, 1260, 0.5, BRC, aB * PT.ss((t - tN) / 0.4), PT.ss((t - tN) / 0.4)); const aPe = PT.ss((t - tPe + 0.2) / 0.3); if (aPe > 0) { fCaixa(x, 300, 640, 260, 60, 30, BRC, aB * aPe, 3, 0.1); rotuloP(x, "busca", 300, 640, 30, "255,255,255", aB * aPe); linhaP(x, 180, 670, 420, 610, VE, aB * aPe, 7); } }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { balaoCom(x, 540, 900, 1.1, aC, "?", t); const b = Math.sin(t * 6) * 18; fSeta(x, 540, 1180 + b, 540, 1340 + b, AM, aC, 10); }
  });
};

// =============== 6. o sinal prometido ===============
CENAS.dica = (el, c, B) => {
  const tPo = B("ponto"), tI = B("iphone"), tA = B("android"), tP = B("priv"), tT = B("tira");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["pro", 330, 66, "o sinal prometido", "pt-am"], ["pon", 330, 62, "pontinho = microfone ligado", "pt-ci", "white-space:normal;left:60px;width:960px"], ["cfg", 330, 56, "Configurações › Privacidade", "pt-ci"], ["tir", 330, 70, "tira o que não precisa", "pt-ve"]]);
  MD.slam(tl, tx.pro, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.pro, tPo - 0.5); MD.slam(tl, tx.pon, tPo - 0.2, { from: 1.25 }); MD.leave(tl, tx.pon, tP - 0.4); MD.slam(tl, tx.cfg, tP - 0.1, { from: 1.2 }); MD.leave(tl, tx.cfg, tT - 0.4); MD.slam(tl, tx.tir, tT - 0.05, { from: 1.3 });
  const est = estF(17);
  const pB = tI - 0.6, pC = tP - 0.8;
  T.quadro((x, t) => {
    estD(x, est, t);
    // plano A: close no canto da tela, o pontinho acende
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.4));
    if (aA > 0.01) { fCaixa(x, 540, 1080, 940, 760, 100, BRC, aA, 8, 0.05); fRR(x, 380, 740, 320, 54, 27); x.fillStyle = `rgba(${BRC},${0.6 * aA})`; x.fill(); rotuloP(x, "9:41", 220, 768, 40, "255,255,255", aA); pontinho(x, 870, 768, "255,170,60", aA * PT.ss((t - tPo + 0.3) / 0.3), t); fSeta(x, 760, 900, 850, 800, "255,170,60", aA * PT.ss((t - tPo) / 0.4), 6); }
    // plano B: iPhone (laranja) e Android (verde)
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { for (const [cx, cor, nome, tt] of [[300, "255,170,60", "iPhone", tI], [780, "120,255,150", "Android", tA]]) { const q = PT.ss((t - tt + 0.4) / 0.4); fCelular(x, cx, 1000, 640, BRC, aB, 0.06); pontinho(x, cx + 100, 730, cor, aB * q, t); rotuloP(x, nome, cx, 1380, 42, cor, aB * q); } }
    // plano C: Configurações › Privacidade › Microfone, e as chaves desligando
    const aC = PT.ss((t - pC) / 0.5);
    if (aC > 0.01) { const cx = 540, cy = 1000; fCelular(x, cx, cy, 860, BRC, aC, 0.08); rotuloP(x, "Microfone", cx - 170, cy - 260, 40, AM, aC, "left"); ["app de fotos", "jogo", "lanterna", "rede social"].forEach((nome, j) => { const y = cy - 160 + j * 100, off = j > 0 && t > tT - 0.6 ? PT.ss((t - tT + 0.6 - j * 0.2) / 0.3) : 0; rotuloP(x, nome, cx - 170, y, 32, "220,228,245", aC, "left"); fCaixa(x, cx + 140, y, 80, 40, 20, off > 0.5 ? "120,128,150" : VD, aC, 3, 0.4); discoP(x, cx + 140 + (off > 0.5 ? -20 : 20), y, 15, "255,255,255", aC); }); }
  });
};

// =============== 7. resumo relâmpago + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [560, 720, 880], textos = ["não precisa te ouvir", "os rastros contam muito", "o cérebro guarda os acertos"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 54, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(19);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    fCelular(x, 540, 1250, 300, BRC, 0.5 * sai * PT.ss((t - c.ini) / 0.5), 0.06);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [VD, CI, AM][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
