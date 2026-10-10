// Cenas do vídeo "Como o cartão por aproximação funciona sem bateria" — padrão novo (out/2026): objetos em
// pontos de luz com volume, pontos que se transformam, câmera com profundidade e física.
// Retenção: paradoxo (liga sem bateria), antena escondida, assombro (13 milhões de vezes por segundo),
// previsão ("adivinha: por que tão perto?"), pergunta e a promessa (por que copiar o sinal não adianta).

const MD = MotionDirector;
const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
const FUNDOK2 = fundoProfundo(71);
// cartão (retângulo com o chip vazado e os números) e a antena (voltas pelas bordas)
const CARTAO_D = { desenho: (g, R) => { g.beginPath(); g.roundRect(R * 0.06, R * 0.24, R * 0.88, R * 0.52, R * 0.05); g.fill(); g.globalCompositeOperation = "destination-out"; g.beginPath(); g.roundRect(R * 0.16, R * 0.38, R * 0.14, R * 0.11, R * 0.02); g.fill(); for (let k = 0; k < 4; k++) { g.beginPath(); g.arc(R * (0.56 + k * 0.08), R * 0.64, R * 0.014, 0, 6.283); g.fill(); } g.globalCompositeOperation = "source-over"; g.beginPath(); g.roundRect(R * 0.17, R * 0.39, R * 0.12, R * 0.09, R * 0.015); g.fill(); } };
const ANTENA_D = { desenho: (g, R) => { g.strokeStyle = "#fff"; g.lineWidth = R * 0.008; for (let v = 0; v < 4; v++) { const m = R * (0.09 + v * 0.022); g.beginPath(); g.roundRect(m, R * 0.24 + m - R * 0.06, R - 2 * m, R * 0.52 - 2 * (m - R * 0.06), R * 0.03); g.stroke(); } } };
const MAQ_D = { desenho: (g, R) => { g.beginPath(); g.roundRect(R * 0.3, R * 0.08, R * 0.4, R * 0.84, R * 0.06); g.fill(); g.globalCompositeOperation = "destination-out"; g.beginPath(); g.roundRect(R * 0.36, R * 0.16, R * 0.28, R * 0.2, R * 0.02); g.fill(); for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) { g.beginPath(); g.arc(R * (0.41 + i * 0.09), R * (0.47 + j * 0.1), R * 0.025, 0, 6.283); g.fill(); } } };
const FK2 = {
  cartao: formaPontos(CARTAO_D, 12000), antena: formaPontos(ANTENA_D, 6000), maq: formaPontos(MAQ_D, 11000), bateria: formaPontos("battery-empty", 7000), interr: formaTexto("?", 9000),
  chip: formaPontos("cpu", 7000), n13: formaTexto("13.560.000", 12000), cel: formaPontos("device-mobile", 9000), banco: formaPontos("bank", 9000), chave: formaPontos("key", 8000),
  copia: formaPontos("copy", 8000), proibido: formaPontos("prohibit", 7000), meio: formaTexto("0,5 s", 10000), app: formaPontos("sliders-horizontal", 7000), escudo: formaPontos("shield-check", 6000),
  sinal: formaPontos("contactless-payment", 6000), carregador: formaPontos("lightning", 5000),
};
// campo magnético: arcos de pontos saindo da maquininha (vai e volta)
function campoP(nv, cx, cy, t, a, i, R = 320, n = 5) { if (a <= 0.01) return i; for (let k = 0; k < n; k++) { const u = ((t * 0.8 + k / n) % 1), rx = 50 + u * R, ry = 25 + u * R * 0.5; for (let j = 0; j < 90 && i < nv.n; j++) { const an = Math.PI + (j / 89) * Math.PI; nv.ponto(i++, cx + Math.cos(an) * rx, cy + Math.sin(an) * ry, 0.56, 0.89, 1, a * (1 - u) * 0.9, 3.4); } } return i; }
// corrente correndo pela antena (pontos amarelos dando a volta pela borda do cartão)
function correnteP(nv, cx, cy, esc, t, a, i) { if (a <= 0.01) return i; const w = esc * 0.74, h = esc * 0.38, per = 2 * (w + h); for (let q = 0; q < 16 && i < nv.n; q++) { const d = ((t * 0.5 + q / 16) % 1) * per; let px, py; if (d < w) { px = -w / 2 + d; py = -h / 2; } else if (d < w + h) { px = w / 2; py = -h / 2 + d - w; } else if (d < 2 * w + h) { px = w / 2 - (d - w - h); py = h / 2; } else { px = -w / 2; py = h / 2 - (d - 2 * w - h); } nv.ponto(i++, cx + px, cy + py, 1, 0.82, 0.3, a, 10); } return i; }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tB = B("bateria"), tM = B("meio0"), tE = B("energia"), tP = B("promessa");
  const p2 = tB + 1.6, p3 = tM - 0.4, p4 = tP - 2.4;
  mostrarGancho(p2 - 0.1);
  const T = telaGPU(el, c), nv = T.nuvem(80000);
  const tx = palcoTexto(el, [["lig", 330, 62, "liga, conversa e cria um código", "pt-ci", "white-space:normal;left:60px;width:960px"], ["mei", 330, 76, "em 0,5 segundo", "pt-am"], ["ene", 330, 66, "de onde vem a energia?", "pt-ci"], ["cop", 330, 62, "copiar não adianta: no final", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.lig, p2 + 0.2, { from: 1.2 }); MD.leave(tl, tx.lig, p3 - 0.1); MD.slam(tl, tx.mei, tM - 0.2, { from: 1.35 }); MD.leave(tl, tx.mei, tE - 0.4); MD.slam(tl, tx.ene, tE - 0.2, { from: 1.25 }); MD.leave(tl, tx.ene, p4 - 0.1); MD.slam(tl, tx.cop, p4 + 0.2, { from: 1.2 });
  const CAM = cameraProf([[0, { zoom: 1.3, y: 900 }], [p2, { zoom: 1.0, y: 960 }]]);
  T.quadro((x, t) => {
    const cam = CAM(t); let i = desenharFundo(nv, FUNDOK2, t, cam, [0.75, 0.82, 1], 1, 0);
    // plano 1 (quadro 0): o cartão girando no ar, brilhando; a bateria vazia riscada
    const a1 = 1 - PT.ss((t - p2) / 0.45);
    if (a1 > 0.01) { i = desenharForma(nv, FK2.cartao, { cx: 540, cy: 880, esc: 680, cam, z: 1, rot: -0.12, giro: 0.5 * Math.sin(t * 0.9), cor: CORF.ambar, borda: CORF.amarelo, a: a1, t, i0: i }); const e = FIS.chegar(t, tB - 0.3, 0.5); if (e > 0.01) { i = desenharForma(nv, FK2.bateria, { cx: 540, cy: 1240, esc: 240 * e, cor: CORF.cinza, a: a1, t, i0: i }); linhaP(x, 430, 1300, 650, 1180, "255,110,130", a1 * PT.ss((t - tB) / 0.25), 9); } }
    // plano 2: liga → conversa → código, em meio segundo (o cartão vira o "0,5 s")
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { ["liga", "conversa", "código secreto"].forEach((nm, k) => { const e = FIS.cascata(t, p2 + 0.1, k, 0.4, 0.5), y = 720 + k * 200; fCaixa(x, 540, y, 520, 120, 60, ["120,255,190", "143,227,255", "255,210,63"][k], a2 * PT.cl(e), 5, 0.04); rotuloP(x, nm, 540, y, 48, "255,255,255", a2 * PT.cl(e)); if (k < 2) fSeta(x, 540, y + 65, 540, y + 130, "220,228,245", a2 * PT.cl(e) * 0.7, 5); }); }
    // plano 3: encosta na maquininha e acende; "de onde vem a energia?"
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) { const enc = PT.inOut((t - p3) / 1.0), ap = PT.ss((t - p3 - 1.0) / 0.2); i = desenharForma(nv, FK2.maq, { cx: 540, cy: 1080, esc: 620, cor: CORF.branco, a: a3, t, i0: i }); const [sx, sy] = FIS.impacto(t, p3 + 1.0, 0.15); i = desenharForma(nv, FK2.cartao, { cx: 540, cy: PT.lerp(560, 820, enc), esc: 440, sx, sy, rot: -0.15 * (1 - enc), cor: CORF.ambar, a: a3, t, i0: i }); if (ap > 0) { brilhoP(x, 540, 900, 260, "120,255,190", 0.35 * ap * a3); rotuloP(x, "APROVADO", 540, 905, 34, "150,255,200", ap * a3); } const q = FIS.chegar(t, tE - 0.3, 0.5); if (q > 0.01) i = desenharForma(nv, FK2.interr, { cx: 860, cy: 720, esc: 220 * q, cor: CORF.amarelo, a: a3, t, i0: i }); }
    // plano 4: copiar não adianta — o cartão vira duas cópias, a falsa riscada
    const a4 = PT.ss((t - p4) / 0.4);
    if (a4 > 0.01) { i = morfo(nv, FK2.maq, FK2.copia, PT.ss((t - p4) / 0.9), { de: { cx: 540, cy: 1080, esc: 620, cor: CORF.branco }, para: { cx: 540, cy: 960, esc: 520, cor: CORF.ciano }, t, a: a4, onda: 0.3, curva: 0.35, i0: i }); const pr = FIS.chegar(t, p4 + 1.0, 0.5); if (pr > 0.01) i = desenharForma(nv, FK2.proibido, { cx: 700, cy: 1080, esc: 260 * pr, cor: CORF.vermelho, a: a4, t, i0: i }); }
    nv.total(i);
  });
};

// =============== 2. a antena escondida ===============
CENAS.antena = (el, c, B) => {
  const tV = B("voltas"), tA = B("antena"), tC = B("chip"), tCa = B("campo"), tT = B("treze");
  const pB = tCa - 1.4, pC = tT - 1.2;
  const T = telaGPU(el, c), nv = T.nuvem(80000);
  const tx = palcoTexto(el, [["fio", 330, 62, "um fio dando voltas", "pt-ci"], ["ant", 330, 72, "é uma antena", "pt-am"], ["chi", 420, 52, "+ um chip minúsculo", "pt-fino"], ["cam", 330, 60, "a maquininha solta um campo", "pt-ci", "white-space:normal;left:60px;width:960px"], ["tre", 330, 56, "vai e volta 13 milhões de vezes por segundo", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.fio, tV - 0.6, { from: 1.25 }); MD.leave(tl, tx.fio, tA - 0.4); MD.slam(tl, tx.ant, tA - 0.2, { from: 1.35 }); MD.arrive(tl, tx.chi, tC - 0.2, { y: 14 }); MD.leave(tl, [tx.ant, tx.chi], pB - 0.1);
  MD.slam(tl, tx.cam, tCa - 0.8, { from: 1.2 }); MD.leave(tl, tx.cam, pC - 0.1); MD.slam(tl, tx.tre, pC + 0.2, { from: 1.15 });
  const CAM = cameraProf([[c.ini, { zoom: 1.0 }], [tV - 0.8, { zoom: 1.0 }], [tC, { zoom: 1.6, x: 380, y: 900 }], [pB, { zoom: 1.0 }]]);
  T.quadro((x, t) => {
    const cam = CAM(t); let i = desenharFundo(nv, FUNDOK2, t, cam, [0.75, 0.82, 1], 1, 0);
    // A: o cartão fica transparente e a antena aparece desenhando as voltas; a câmera vai até o chip
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) { const vz = PT.ss((t - tV + 0.8) / 0.6); i = desenharForma(nv, FK2.cartao, { cx: 540, cy: 900, esc: 760, cam, z: 1, cor: CORF.ambar, a: aA * (1 - 0.65 * vz), t, i0: i }); i = desenharForma(nv, FK2.antena, { cx: 540, cy: 900, esc: 760, cam, z: 1, cor: CORF.amarelo, a: aA * vz, revela: PT.ss((t - tV + 0.8) / 1.6), t, i0: i }); const ch = FIS.chegar(t, tC - 0.3, 0.5); if (ch > 0.01) { const [px, py, k] = projP(cam, 540 - 0.27 * 760, 900 - 0.065 * 760, 1); brilhoP(x, px, py, 90 * k * ch, "255,210,63", 0.5 * aA); } }
    // B: a maquininha solta o campo magnético (arcos de pontos)
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const e = FIS.chegar(t, pB, 0.6); i = desenharForma(nv, FK2.maq, { cx: 540, cy: 1150, esc: 680 * Math.max(0.01, e), cor: CORF.branco, a: aB, t, i0: i }); i = campoP(nv, 540, 880, t, aB * PT.ss((t - tCa + 0.5) / 0.4), i); }
    // C: 13 milhões — o número em pontos e o campo pulsando rápido
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { i = campoP(nv, 540, 1250, t * 4, aC * 0.7, i, 280, 6); const e = FIS.chegar(t, pC + 0.1, 0.6); i = desenharForma(nv, FK2.n13, { cx: 540, cy: 880, esc: 980 * Math.max(0.01, e), cor: CORF.ciano, a: aC, t, giro: 0.12 * Math.sin(t), i0: i }); }
    nv.total(i);
  });
};

// =============== 3. a energia vem da maquininha ===============
CENAS.inducao = (el, c, B) => {
  const tA = B("atravessa"), tC = B("corrente"), tS = B("semfio"), tAl = B("alimenta"), tAd = B("adivinha"), tCm = B("cm");
  const pB = tS - 0.7, pC = tAd - 0.3;
  const T = telaGPU(el, c), nv = T.nuvem(80000);
  const tx = palcoTexto(el, [["atr", 330, 62, "o campo atravessa o fio", "pt-ci"], ["cor", 330, 66, "e vira corrente", "pt-am"], ["sem", 330, 60, "igual carregador sem fio", "pt-ci"], ["ali", 330, 62, "o cartão se alimenta", "pt-am"], ["adv", 330, 64, "adivinha: por que tão perto?", "pt-am", "white-space:normal;left:60px;width:960px"], ["cm", 330, 62, "a poucos cm, fica fraco", "pt-ve"]]);
  MD.slam(tl, tx.atr, tA - 0.4, { from: 1.25 }); MD.leave(tl, tx.atr, tC - 0.4); MD.slam(tl, tx.cor, tC - 0.2, { from: 1.3 }); MD.leave(tl, tx.cor, pB - 0.1); MD.slam(tl, tx.sem, tS - 0.5, { from: 1.2 }); MD.leave(tl, tx.sem, tAl - 0.4); MD.slam(tl, tx.ali, tAl - 0.2, { from: 1.25 }); MD.leave(tl, tx.ali, pC - 0.1);
  MD.slam(tl, tx.adv, tAd - 0.2, { from: 1.2 }); MD.leave(tl, tx.adv, tCm - 0.6); MD.slam(tl, tx.cm, tCm - 0.3, { from: 1.25 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOK2, t, null, [0.75, 0.82, 1], 1, 0);
    // A: o cartão em cima da maquininha; o campo atravessa e a corrente corre pela antena
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) { i = desenharForma(nv, FK2.maq, { cx: 540, cy: 1200, esc: 640, cor: CORF.branco, a: aA, t, i0: i }); i = campoP(nv, 540, 950, t, aA, i, 300); i = desenharForma(nv, FK2.antena, { cx: 540, cy: 780, esc: 640, cor: CORF.amarelo, a: aA, t, i0: i }); i = desenharForma(nv, FK2.cartao, { cx: 540, cy: 780, esc: 640, cor: CORF.ambar, a: aA * 0.35, t, i0: i }); i = correnteP(nv, 540, 780, 640, t, aA * PT.ss((t - tC + 0.3) / 0.4), i); }
    // B: igual o carregador sem fio: o celular deitado na base, depois o cartão "se alimentando"
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const sf = 1 - PT.ss((t - tAl + 0.4) / 0.5); i = desenharForma(nv, FK2.cel, { cx: 540, cy: 900, esc: 480, cor: CORF.branco, a: aB * sf, t, i0: i }); i = desenharForma(nv, FK2.carregador, { cx: 540, cy: 900, esc: 160, cor: CORF.verde, a: aB * sf * (0.6 + 0.4 * Math.sin(t * 5)), t, i0: i }); x.beginPath(); x.ellipse(540, 1160, 260, 50, 0, 0, 6.283); x.strokeStyle = `rgba(220,228,245,${0.7 * aB * sf})`; x.lineWidth = 5; x.stroke(); const al = 1 - sf; if (al > 0.01) { i = desenharForma(nv, FK2.cartao, { cx: 540, cy: 900, esc: 640, cor: CORF.ambar, brilho: 0.8 + 0.6 * Math.sin(t * 6), a: aB * al, t, i0: i }); i = correnteP(nv, 540, 900, 640, t, aB * al, i); } }
    // C: por que tão perto? — o cartão se afasta e o campo não chega (arcos somem antes)
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { const lo = PT.ss((t - pC - 0.8) / 1.5); i = desenharForma(nv, FK2.maq, { cx: 330, cy: 1150, esc: 560, cor: CORF.branco, a: aC, t, i0: i }); i = campoP(nv, 330, 920, t, aC, i, 230); const cx = PT.lerp(400, 780, lo); i = desenharForma(nv, FK2.cartao, { cx, cy: 820 - 60 * lo, esc: 380, cor: lo > 0.6 ? CORF.cinza : CORF.ambar, a: aC, t, i0: i }); x.setLineDash([10, 12]); linhaP(x, 330, 1300, cx, 1300, "255,110,130", aC * lo, 4); x.setLineDash([]); rotuloP(x, lo > 0.6 ? "longe: não liga" : "", 620, 1350, 38, "255,170,180", aC * PT.ss((t - tCm) / 0.4)); }
    nv.total(i);
  });
};

// =============== 4. a conversa ===============
CENAS.conversa = (el, c, B) => {
  const tAc = B("acorda"), tP = B("pergunta"), tAs = B("assinatura"), tAp = B("aprova"), tM = B("meio");
  const pB = tP - 0.5, pC = tAp - 0.5, pD = tM - 0.6;
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["aco", 330, 70, "o chip acorda", "pt-am"], ["con", 330, 62, "e conversa com a máquina", "pt-ci"], ["apr", 330, 80, "aprovado", "pt-ci", "color:#78ffbe"], ["mei", 330, 66, "tudo em menos de 0,5 s", "pt-am"]]);
  MD.slam(tl, tx.aco, tAc - 0.3, { from: 1.3 }); MD.leave(tl, tx.aco, pB - 0.1); MD.slam(tl, tx.con, tP - 0.2, { from: 1.25 }); MD.leave(tl, tx.con, pC - 0.1); MD.slam(tl, tx.apr, tAp - 0.2, { from: 1.45 }); MD.leave(tl, tx.apr, pD - 0.1); MD.slam(tl, tx.mei, tM - 0.4, { from: 1.3 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOK2, t, null, [0.75, 0.82, 1], 1, 0);
    // A: o chip apagado acende (zzz → luz)
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) { const ac = PT.ss((t - tAc + 0.3) / 0.4), [sx, sy] = FIS.impacto(t, tAc, 0.2); i = desenharForma(nv, FK2.chip, { cx: 540, cy: 930, esc: 460, sx, sy, cor: ac > 0.5 ? CORF.amarelo : CORF.cinza, brilho: 0.6 + 0.8 * ac, a: aA, t, i0: i }); rotuloP(x, "zzz", 760, 720, 50, "200,205,220", aA * (1 - ac)); }
    // B: a máquina pergunta, o chip responde (balões crisp) e a assinatura viaja
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { i = desenharForma(nv, FK2.maq, { cx: 270, cy: 1050, esc: 480, cor: CORF.branco, a: aB, t, i0: i }); i = desenharForma(nv, FK2.cartao, { cx: 770, cy: 1010, esc: 380, rot: -0.1, cor: CORF.ambar, a: aB, t, i0: i }); const q = PT.ss((t - tP + 0.2) / 0.3), r = PT.ss((t - tAs + 0.4) / 0.3); fCaixa(x, 330, 760, 330, 90, 40, "143,227,255", aB * q, 4, 0.04); rotuloP(x, "quem é você?", 330, 760, 36, "255,255,255", aB * q); fCaixa(x, 740, 800, 360, 90, 40, "255,210,63", aB * r, 4, 0.04); rotuloP(x, "dados + assinatura", 740, 800, 34, "255,255,255", aB * r); }
    // C: o banco aprova
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { i = desenharForma(nv, FK2.banco, { cx: 300, cy: 900, esc: 420, cor: CORF.branco, a: aC, t, i0: i }); i = desenharForma(nv, FK2.maq, { cx: 790, cy: 960, esc: 480, cor: CORF.verde, brilho: 1.3, a: aC, t, i0: i }); for (let k = 0; k < 6; k++) { const u = ((t * 0.9 + k / 6) % 1); discoP(x, PT.lerp(420, 700, u), 900 + Math.sin(u * 6) * 10, 7, "120,255,190", aC * Math.sin(u * Math.PI)); } }
    // D: tudo em menos de meio segundo
    const aD = PT.ss((t - pD) / 0.4);
    if (aD > 0.01) i = morfo(nv, FK2.maq, FK2.meio, PT.ss((t - pD) / 0.8), { de: { cx: 790, cy: 960, esc: 480, cor: CORF.verde }, para: { cx: 540, cy: 940, esc: 820, cor: CORF.amarelo }, t, a: aD, onda: 0.3, curva: 0.35, i0: i });
    nv.total(i);
  });
};

// =============== 5. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tM = B("maquina"), tN = B("nela"), tS = B("simnao");
  const pB = tM - 0.5, pC = tN - 0.1;
  const T = telaGPU(el, c), nv = T.nuvem(50000);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["car", 330, 62, "dava pra carregar o celular?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["sim", 330, 86, "sim ou não?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, pB - 0.1); MD.slam(tl, tx.car, tM - 0.1, { from: 1.2 }); MD.leave(tl, tx.car, tS - 0.75); MD.slam(tl, tx.sim, tS - 0.45, { from: 1.45 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOK2, t, null, [0.75, 0.82, 1], 1, 0);
    const aA = FIS.chegar(t, c.ini + 0.1, 0.6) * (1 - PT.ss((t - pB) / 0.4));
    i = balaoPergunta(nv, x, t, PT.cl(aA), 540, 930, 620, i);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { i = desenharForma(nv, FK2.maq, { cx: 540, cy: 1150, esc: 560, cor: CORF.branco, a: aB, t, i0: i }); i = campoP(nv, 540, 920, t, aB, i, 260); const d = FIS.chegar(t, pB + 0.3, 0.7); i = desenharForma(nv, FK2.cel, { cx: 540, cy: PT.lerp(560, 740, PT.cl(d)), esc: 380, cor: CORF.verde, a: aB, t, i0: i }); i = desenharForma(nv, FK2.carregador, { cx: 820, cy: 700, esc: 160, cor: CORF.amarelo, a: aB * PT.ss((t - tM) / 0.4), t, i0: i }); }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { i = balaoPergunta(nv, x, t, aC, 540, 900, 580, i); setaComentarios(x, aC, t); }
    nv.total(i);
  });
};

// =============== 6. por que copiar não adianta ===============
CENAS.seguranca = (el, c, B) => {
  const tM = B("muda"), tCh = B("chave"), tU = B("umavez"), tCo = B("copiar"), tR = B("recusa");
  const pB = tCh - 0.6, pC = tU - 0.6, pD = tCo - 0.5;
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["pro", 330, 66, "a parte prometida", "pt-am"], ["mud", 330, 60, "o código muda a cada compra", "pt-ci"], ["cha", 330, 60, "a chave nunca sai do chip", "pt-am"], ["vez", 330, 72, "vale uma vez só", "pt-ci"], ["rec", 330, 62, "cópia = código usado: recusado", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.pro, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.pro, tM - 0.5); MD.slam(tl, tx.mud, tM - 0.3, { from: 1.25 }); MD.leave(tl, tx.mud, pB - 0.1); MD.slam(tl, tx.cha, tCh - 0.3, { from: 1.25 }); MD.leave(tl, tx.cha, pC - 0.1);
  MD.slam(tl, tx.vez, tU - 0.3, { from: 1.35 }); MD.leave(tl, tx.vez, pD - 0.1); MD.slam(tl, tx.rec, tCo + 0.6, { from: 1.15 });
  const CODS = ["B071C772", "8EBC7731", "A3821C48", "5F418147", "ADB0651E"];
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOK2, t, null, [0.75, 0.82, 1], 1, 0);
    // A: códigos novos a cada compra caindo em cascata
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) CODS.forEach((cd, k) => { const e = FIS.cascata(t, tM - 0.5, k, 0.25, 0.5), y = 640 + k * 140 - 40 * (1 - PT.cl(e)); fCaixa(x, 540, y, 520, 100, 18, k === CODS.length - 1 ? "255,210,63" : "143,227,255", aA * PT.cl(e), 4, 0.04); rotuloP(x, `compra ${k + 1}: ${cd}`, 540, y + 2, 40, "235,240,255", aA * PT.cl(e)); });
    // B: a chave dentro do chip (presa num escudo)
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const e = FIS.chegar(t, pB + 0.1, 0.6); i = desenharForma(nv, FK2.escudo, { cx: 540, cy: 940, esc: 560 * Math.max(0.01, e), cor: CORF.ciano, a: aB * 0.6, t, i0: i }); i = desenharForma(nv, FK2.chave, { cx: 540, cy: 930, esc: 300 * Math.max(0.01, e), rot: 0.3 * FIS.balanco(t, tCh, 1, 1.5, 3), cor: CORF.amarelo, a: aB, t, i0: i }); rotuloP(x, "dentro do chip", 540, 1260, 40, "235,240,255", aB); }
    // C: vale uma vez — o código de uma compra com o valor
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { const [sx, sy] = FIS.impacto(t, tU, 0.15); x.save(); x.translate(540, 940); x.scale(sx, sy); fCaixa(x, 0, 0, 560, 200, 26, "255,210,63", aC, 5, 0.04); rotuloP(x, "código: 7F3A91C2", 0, -24, 50, "255,240,190", aC); rotuloP(x, "R$ 23,90 · esta compra", 0, 46, 36, "235,240,255", aC); x.restore(); }
    // D: copiaram o sinal → código já usado → o banco recusa
    const aD = PT.ss((t - pD) / 0.4);
    if (aD > 0.01) { i = desenharForma(nv, FK2.copia, { cx: 260, cy: 960, esc: 280, cor: CORF.rosa, a: aD, t, i0: i }); i = desenharForma(nv, FK2.banco, { cx: 800, cy: 940, esc: 360, cor: CORF.branco, a: aD, t, i0: i }); const u = PT.cl((t - pD - 0.3) / 1.0); discoP(x, PT.lerp(380, 640, u), 960, 10, "255,110,130", aD * (u < 1 ? 1 : 0)); const r = FIS.chegar(t, tR - 0.3, 0.5); if (r > 0.01) i = desenharForma(nv, FK2.proibido, { cx: 800, cy: 940, esc: 300 * r, cor: CORF.vermelho, a: aD, t, i0: i }); }
    nv.total(i);
  });
};

// =============== 7. a dica ===============
CENAS.dica = (el, c, B) => {
  const tL = B("limite"), tA = B("app"), tR = B("risco");
  const T = telaGPU(el, c), nv = T.nuvem(50000);
  const tx = palcoTexto(el, [["dic", 330, 70, "a dica", "pt-am"], ["lim", 330, 60, "baixe o limite sem senha", "pt-ci"], ["ris", 330, 62, "menos limite, menos risco", "pt-am"]]);
  MD.slam(tl, tx.dic, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dic, tL - 0.5); MD.slam(tl, tx.lim, tL - 0.3, { from: 1.25 }); MD.leave(tl, tx.lim, tR - 0.6); MD.slam(tl, tx.ris, tR - 0.4, { from: 1.3 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOK2, t, null, [0.75, 0.82, 1], 1, 0);
    const a = PT.ss((t - c.ini) / 0.4), e = FIS.chegar(t, c.ini + 0.2, 0.6);
    i = desenharForma(nv, FK2.cel, { cx: 540, cy: 960, esc: 800 * Math.max(0.01, e), cor: CORF.branco, a, t, i0: i });
    const s = FIS.chegar(t, tA - 0.6, 0.9), v = Math.round(PT.lerp(200, 50, PT.cl(s)) / 10) * 10, px = PT.lerp(660, 470, PT.cl(s));
    rotuloP(x, "aproximação sem senha", 540, 820, 32, "235,240,255", a * PT.ss((t - tL + 0.3) / 0.4)); linhaP(x, 400, 900, 680, 900, "220,228,245", a * 0.6, 4); discoP(x, px, 900, 16, "255,210,63", a); brilhoP(x, px, 900, 40, "255,210,63", 0.5 * a); rotuloP(x, `R$ ${v}`, 540, 990, 60, "255,226,140", a * PT.ss((t - tL + 0.3) / 0.4));
    const sh = FIS.chegar(t, tR - 0.2, 0.5); if (sh > 0.01) i = desenharForma(nv, FK2.escudo, { cx: 800, cy: 640, esc: 200 * sh, cor: CORF.verde, a, t, i0: i });
    nv.total(i);
  });
};

// =============== 8. resumo ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c), nv = T.nuvem(40000);
  const Y = [560, 760, 960], textos = ["a máquina cria um campo", "a antena vira o campo em energia", "o chip responde com um código de 1 vez"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 48, s, "", "left:250px;width:780px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const IC = [[FK2.sinal, CORF.ciano], [FK2.carregador, CORF.amarelo], [FK2.chip, CORF.verde]];
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOK2, t, null, [0.75, 0.82, 1], 1, 0);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    tP.forEach((tp, k) => { const e = FIS.chegar(t, tp - 0.2, 0.5), ent = FIS.cascata(t, c.ini + 0.3, k, 0.12, 0.6); i = desenharForma(nv, IC[k][0], { cx: 160, cy: Y[k] + 10, esc: 120 * Math.max(0.01, Math.min(1, ent)), cor: IC[k][1], a: sai * Math.min(1, ent) * (0.3 + 0.7 * PT.cl(e)), t, i0: i }); });
    i = desenharForma(nv, FK2.cartao, { cx: 540, cy: 1250, esc: 380, rot: -0.1, giro: 0.4 * Math.sin(t), cor: CORF.ambar, a: 0.8 * sai * PT.ss((t - c.ini - 0.2) / 0.5), t, i0: i });
    nv.total(i);
  });
  cartaoFinal(el, tC + 1.4);
};
