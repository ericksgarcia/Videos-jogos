// Cenas do vídeo "Por que parece que o celular escuta suas conversas" — pontos de luz na GPU.
// Retenção: dor do dia a dia (o anúncio do tênis), promessa (onde ver quem usa o microfone),
// virada (não precisa ouvir: grava a tela), segundo culpado (o seu cérebro) e dica prática.

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

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tT = B("tenis"), tA = B("anuncio"), tO = B("ouvindo"), tE = B("estranha"), tM = B("microfone");
  mostrarGancho(tT + 0.8);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["dia", 330, 56, "no dia seguinte...", "pt-fino"], ["ouv", 330, 80, "ele estava ouvindo?", "pt-ve"], ["alivio", 330, 62, "um alívio... e mais estranho", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.arrive(tl, tx.dia, tA - 1.0, { y: 14 }); MD.leave(tl, tx.dia, tO - 0.4); MD.slam(tl, tx.ouv, tO - 0.1, { from: 1.35 }); MD.leave(tl, tx.ouv, tE - 1.0); MD.slam(tl, tx.alivio, tE - 0.7, { from: 1.25 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    // conversa (antes do anúncio)
    const aC = 1 - PT.ss((t - tA + 1.2) / 0.5);
    if (aC > 0.01) { fPessoa(x, 330, 1120, 3, CI, aC); fPessoa(x, 750, 1120, 3, AM, aC); balao(x, 380, 790, 300, "tênis!", CI, aC * PT.ss((t - tT + 0.4) / 0.4)); fCelular(x, 540, 1290, 150, BRC, aC * 0.9, 0.1); }
    // o celular com o anúncio
    const aF = PT.ss((t - tA + 1.0) / 0.6) * (1 - PT.ss((t - tM + 0.8) / 0.5));
    if (aF > 0.01) { fCelular(x, 540, 980, 780, BRC, aF, 0.08); anuncio(x, 540, 980, 300, aF * PT.ss((t - tA + 0.2) / 0.4), PT.ss((t - tA) / 0.5) * (0.6 + 0.4 * Math.sin(t * 5))); }
    // microfone com interrogação
    const aM = PT.ss((t - tM + 0.8) / 0.5); if (aM > 0) { microfone(x, 540, 1000, 2.6, CI, aM); rotuloP(x, "?", 760, 820, 150, AM, aM); }
  });
};

// =============== 2. o teste dos 17 mil apps ===============
CENAS.teste = (el, c, B) => {
  const tD = B("dezessete"), tM = B("mic"), tN = B("nenhum"), tT = B("tela"), tE = B("empresas"), tO = B("ouvir");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["n", 330, 86, "17 mil apps", "pt-ci"], ["nen", 330, 70, "microfone escondido: 0", "pt-ve"], ["tel", 330, 66, "gravando a tela", "pt-am"], ["ouv", 330, 64, "nem precisa te ouvir", "pt-ve"]]);
  MD.slam(tl, tx.n, tD - 0.05, { from: 1.3 }); MD.leave(tl, tx.n, tN - 0.4); MD.slam(tl, tx.nen, tN - 0.05, { from: 1.3 }); MD.leave(tl, tx.nen, tT - 0.4); MD.slam(tl, tx.tel, tT - 0.05, { from: 1.3 }); MD.leave(tl, tx.tel, tO - 0.4); MD.slam(tl, tx.ouv, tO - 0.05, { from: 1.35 });
  const nv = T.nuvem(17300), est = estF(5);
  const APPS = (() => { const r = prng(9), o = []; for (let i = 0; i < 17260; i++) { const col = i % 115, lin = Math.floor(i / 115); o.push({ x: 160 + col * 6.5, y: 560 + lin * 4.6, n: r(), mau: r() < 0.012 }); } return o; })();
  T.quadro((x, t) => {
    estD(x, est, t);
    const aG = PT.ss((t - tD + 0.4) / 0.8) * (1 - PT.ss((t - tE + 0.2) / 0.6) * 0.6), scan = PT.cl((t - tM + 0.2) / 2.4), aT = PT.ss((t - tT + 0.1) / 0.5);
    let i = nv.k;
    for (const p of APPS) { const vis = PT.ss((t - tD + 0.4 - p.y / 1400) / 0.4); if (vis <= 0) continue; const passou = p.y < 560 + scan * 700; let c = [0.56, 0.89, 1.0], a = 0.55 + 0.4 * p.n; if (passou) { c = [0.5, 1.0, 0.75]; } if (p.mau && aT > 0) { c = mixC(c, [1.0, 0.3, 0.4], aT); a = 1; } nv.ponto(i++, p.x, p.y, c[0], c[1], c[2], aG * vis * a, p.mau && aT > 0 ? 6 : 3.4); }
    nv.total(i);
    // linha do scanner
    if (scan > 0 && scan < 1) { const y = 560 + scan * 700; linhaP(x, 140, y, 940, y, VD, aG, 4); brilhoP(x, 540, y, 300, VD, 0.15 * aG); }
    const aN = PT.jan(t, tN - 0.2, tT - 0.2, 0.3, 0.4); if (aN > 0) microfone(x, 540, 900, 2, BRC, aN, aN);
    // apps gravando a tela mandam dados para empresas
    const aE = PT.ss((t - tE + 0.4) / 0.6);
    if (aE > 0) { [[230, 1360], [540, 1360], [850, 1360]].forEach(([px, py], k) => { predio(x, px, py, 120, 150, VE, aE); for (let q = 0; q < 4; q++) { const u = ((t - tE) * 0.7 + q / 4) % 1; discoP(x, PT.lerp(540, px, u), PT.lerp(1000, py - 90, u), 7, VE, aE * Math.sin(u * Math.PI)); } }); }
  });
};

// =============== 3. seus rastros ===============
CENAS.rastros = (el, c, B) => {
  const tL = B("local"), tP = B("pesquisa"), tV = B("video"), tW = B("wifi"), tJ = B("juntos"), tPo = B("pontos"), tC = B("culpado");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ras", 330, 70, "seus rastros", "pt-ci"], ["lig", 330, 70, "o sistema liga os pontos", "pt-am", "white-space:normal;left:60px;width:960px"], ["cul", 330, 80, "2º culpado...", "pt-ve"]]);
  MD.arrive(tl, tx.ras, c.ini + 0.4, { y: 14 }); MD.leave(tl, tx.ras, tPo - 0.4); MD.slam(tl, tx.lig, tPo - 0.05, { from: 1.3 }); MD.leave(tl, tx.lig, tC - 0.4); MD.slam(tl, tx.cul, tC - 0.05, { from: 1.4 });
  const nv = T.nuvem(6000), est = estF(7);
  const MAPA = (() => { const r = prng(11), o = []; for (let i = 0; i < 5800; i++) { const rua = r() < 0.5, k = Math.floor(r() * 9); o.push(rua ? { x: 120 + r() * 840, y: 560 + k * 95 } : { x: 120 + k * 105, y: 560 + r() * 760 }); } return o; })();
  const rota = [[200, 1270], [200, 940], [520, 940], [520, 750], [860, 750]];
  T.quadro((x, t) => {
    estD(x, est, t);
    let i = nv.k; for (const p of MAPA) nv.ponto(i++, p.x, p.y, 0.4, 0.55, 0.9, 0.22, 2.6); nv.total(i);
    // trajeto do dia
    const aL = PT.ss((t - tL + 0.3) / 0.5); if (aL > 0) { fLinhaPts(x, rota, PT.ss((t - tL + 0.3) / 2), CI, aL, 6); [[200, 1270], [520, 940], [860, 750]].forEach(([px, py], k) => { const q = PT.ss((t - tL - k * 0.5) / 0.4); discoP(x, px, py - 30, 18 * q, VE, aL); linhaP(x, px, py - 12, px, py, VE, aL * q, 4); }); }
    const aP = PT.ss((t - tP + 0.3) / 0.5); if (aP > 0) { fCaixa(x, 330, 620, 380, 70, 35, BRC, aP, 4, 0.12); rotuloP(x, "busca: tênis", 330, 620, 34, "255,255,255", aP); }
    const aV = PT.ss((t - tV + 0.3) / 0.5); if (aV > 0) { fCaixa(x, 820, 1000, 220, 130, 14, AM, aV, 4, 0.15); rotuloP(x, "▶ 0:47", 820, 1000, 34, "255,255,255", aV); }
    const aW = PT.ss((t - tW + 0.3) / 0.5); wifi(x, 540, 1220, 1.6, VD, aW, t);
    const aJ = PT.ss((t - tJ + 0.3) / 0.5); if (aJ > 0) { fPessoa(x, 460, 1200, 1.6, CI, aJ); fPessoa(x, 620, 1200, 1.6, AM, aJ); }
    const aPo = PT.ss((t - tPo + 0.2) / 0.6); if (aPo > 0) { const nos = [[330, 620], [820, 1000], [540, 1210], [200, 1240], [520, 910], [860, 720]]; for (let a = 0; a < nos.length; a++) for (let b = a + 1; b < nos.length; b++) linhaP(x, nos[a][0], nos[a][1], nos[b][0], nos[b][1], AM, 0.35 * aPo, 2); nos.forEach(([px, py]) => brilhoP(x, px, py, 40, AM, 0.6 * aPo)); }
  });
};

// =============== 4. o seu cérebro ===============
CENAS.cerebro = (el, c, B) => {
  const tC = B("cerebro"), tCe = B("centenas"), tE = B("esquece"), tCo = B("conversa"), tCa = B("carro"), tA = B("acertos"), tS = B("somem");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["cen", 330, 72, "centenas por dia", "pt-ci"], ["lem", 330, 72, "só esse você lembra", "pt-am"], ["car", 330, 60, "carro novo = vê em todo lugar", "pt-ci", "white-space:normal;left:60px;width:960px"], ["ace", 330, 66, "acertos ficam, erros somem", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.arrive(tl, tx.cen, tCe - 0.1, { y: 14 }); MD.leave(tl, tx.cen, tCo - 0.3); MD.slam(tl, tx.lem, tCo - 0.05, { from: 1.3 }); MD.leave(tl, tx.lem, tCa - 0.3); MD.slam(tl, tx.car, tCa - 0.05, { from: 1.25 }); MD.leave(tl, tx.car, tA - 0.3); MD.slam(tl, tx.ace, tA - 0.05, { from: 1.25 });
  const nv = T.nuvem(9100), est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    fCerebro(nv, 540, 1150, 230, PT.ss((t - tC + 0.4) / 0.6), { cor: [0.7, 0.75, 1.0] });
    // esteira de anúncios passando por cima do cérebro; quase todos somem
    const aS = PT.ss((t - tCe + 0.3) / 0.5) * (1 - PT.ss((t - tCa + 0.4) / 0.4));
    if (aS > 0) for (let k = 0; k < 9; k++) { const u = ((t - tCe) * 0.22 + k / 9) % 1, px = PT.lerp(1180, -100, u), py = 700 + Math.sin(k * 2.1) * 60, hit = k === 4 && t > tCo - 0.3, esq = PT.ss((t - tE + 0.3) / 0.5); anuncio(x, hit ? 540 : px, hit ? 760 : py, 200, aS * (hit ? 1 : 1 - 0.75 * esq), hit ? 1 : 0, hit ? AM : "170,178,195"); }
    // carros por todo lado
    const aCa = PT.jan(t, tCa - 0.3, tA - 0.2, 0.4, 0.4);
    if (aCa > 0) { const r = prng(4); for (let k = 0; k < 8; k++) { const px = 160 + r() * 760, py = 560 + r() * 380, q = PT.ss((t - tCa - k * 0.2) / 0.3); fCaixa(x, px, py, 120, 44, 14, AM, aCa * q, 4, 0.2); anelP(x, px - 35, py + 26, 12, AM, aCa * q, 4); anelP(x, px + 35, py + 26, 12, AM, aCa * q, 4); } }
    // placar: acertos (lembra) x erros (somem)
    const aA = PT.ss((t - tA + 0.3) / 0.5);
    if (aA > 0) { rotuloP(x, "✓ 1 lembrado", 300, 760, 44, "120,255,190", aA); rotuloP(x, "✗ 300 esquecidos", 760, 760, 44, "170,178,195", aA * (1 - 0.6 * PT.ss((t - tS) / 0.6))); }
  });
};

// =============== 5. onde ver ===============
CENAS.dica = (el, c, B) => {
  const tC = B("config"), tP = B("privacidade"), tM = B("mic"), tL = B("localizacao"), tT = B("tira"), tPo = B("pontinho");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["faz", 330, 66, "faz isso agora", "pt-am"]]);
  MD.slam(tl, tx.faz, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.faz, tPo - 0.4);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const cx = 540, cy = 930, H = 900;
    fCelular(x, cx, cy, H, BRC, PT.ss((t - c.ini) / 0.5), 0.08);
    const aC = PT.ss((t - tC + 0.3) / 0.4); if (aC > 0) rotuloP(x, "Configurações", cx, cy - 330, 38, "255,255,255", aC);
    const aP = PT.ss((t - tP + 0.3) / 0.4); if (aP > 0) { fCaixa(x, cx, cy - 250, 360, 64, 18, CI, aP, 3, 0.2); rotuloP(x, "Privacidade", cx, cy - 250, 34, "255,255,255", aP); }
    // lista de apps com chave liga/desliga
    const linhas = [["Microfone", tM], ["Localização", tL]];
    linhas.forEach(([nome, tt], k) => {
      const a = PT.ss((t - tt + 0.3) / 0.4); if (a <= 0) return; const y0 = cy - 150 + k * 250; rotuloP(x, nome, cx - 170, y0, 34, AM, a, "left");
      for (let j = 0; j < 3; j++) { const y = y0 + 60 + j * 55, off = j > 0 && t > tT - 0.2 ? PT.ss((t - tT + 0.2 - j * 0.15 - k * 0.3) / 0.3) : 0; rotuloP(x, ["app de fotos", "jogo", "lanterna"][j], cx - 170, y, 28, "220,228,245", a * 0.9, "left"); fCaixa(x, cx + 140, y, 80, 40, 20, off > 0.5 ? "120,128,150" : VD, a, 3, 0.4); discoP(x, cx + 140 + (off > 0.5 ? -20 : 20), y, 15, "255,255,255", a); }
    });
    // o pontinho do microfone em uso
    const aPo = PT.ss((t - tPo + 0.3) / 0.4); if (aPo > 0) { const pul = 0.6 + 0.4 * Math.sin(t * 6); discoP(x, cx + 150, cy - 420, 12, "255,170,60", aPo); brilhoP(x, cx + 150, cy - 420, 80 * pul, "255,170,60", 0.6 * aPo); fSeta(x, cx + 40, cy - 470, cx + 125, cy - 430, "255,170,60", aPo, 4); rotuloP(x, "microfone em uso", cx - 20, cy - 490, 34, "255,200,140", aPo); }
  });
};

// =============== 6. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["nenhum app ouvindo escondido", "seus rastros dizem muito", "o cérebro guarda os acertos", "as permissões são suas"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(19);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    fCelular(x, 540, 1250, 300, BRC, 0.5 * sai, 0.06);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [VD, CI, AM, "255,170,60"][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
