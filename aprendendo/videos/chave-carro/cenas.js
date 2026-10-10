// Cenas do vídeo "Como a chave abre só o seu carro" — pontos de luz.
// Retenção: situação concreta (500 carros, só o seu pisca), pergunta de meio-saber (e se gravar o
// sinal?), código que muda (rolling code), analogia do porteiro, golpe dos ladrões e dica de defesa.

const MD = MotionDirector;
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245", CZ = "120,130,160";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.5);

// carro visto de cima
function carroCima(x, cx, cy, s, cor, a, pisca = 0) { if (a <= 0.01) return; fCaixa(x, cx, cy, 70 * s, 130 * s, 18 * s, cor, a, 3 * s, 0.1); fCaixa(x, cx, cy - 18 * s, 54 * s, 34 * s, 8 * s, cor, 0.6 * a, 2 * s, 0.15); if (pisca > 0) for (const [dx, dy] of [[-30, -60], [30, -60], [-30, 60], [30, 60]]) { discoP(x, cx + dx * s, cy + dy * s, 7 * s, AM, pisca * a); brilhoP(x, cx + dx * s, cy + dy * s, 30 * s, AM, 0.6 * pisca * a); } }
// carro de lado
function carroLado(x, cx, cy, s, cor, a) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 160 * s, cy + 20 * s); x.lineTo(cx - 150 * s, cy - 20 * s); x.lineTo(cx - 80 * s, cy - 30 * s); x.lineTo(cx - 40 * s, cy - 75 * s); x.lineTo(cx + 60 * s, cy - 75 * s); x.lineTo(cx + 110 * s, cy - 30 * s); x.lineTo(cx + 160 * s, cy - 20 * s); x.lineTo(cx + 165 * s, cy + 20 * s); x.closePath(); x.fillStyle = `rgba(${cor},${0.1 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 5 * s; x.stroke(); anelP(x, cx - 90 * s, cy + 22 * s, 28 * s, cor, a, 5 * s); anelP(x, cx + 95 * s, cy + 22 * s, 28 * s, cor, a, 5 * s); }
function chave(x, cx, cy, s, a, aperta = 0) { if (a <= 0.01) return; fCaixa(x, cx, cy, 90 * s, 150 * s, 40 * s, BRC, a, 4 * s, 0.1); discoP(x, cx, cy - 25 * s, 18 * s, aperta > 0 ? AM : CZ, a); discoP(x, cx, cy + 30 * s, 14 * s, CZ, a); anelP(x, cx, cy - 95 * s, 18 * s, BRC, a, 4 * s); if (aperta > 0) brilhoP(x, cx, cy - 25 * s, 50 * s, AM, 0.6 * aperta * a); }
function ondasR(x, cx, cy, t, a, cor = CI, R = 250) { if (a <= 0.01) return; for (let k = 0; k < 4; k++) { const u = ((t * 0.9 + k / 4) % 1); anelP(x, cx, cy, 30 + u * R, cor, a * (1 - u) * 0.8, 4); } }
function pacote(x, cx, cy, id, cod, a, corCod = AM) { if (a <= 0.01) return; fCaixa(x, cx - 130, cy, 240, 70, 12, CI, a, 4, 0.12); rotuloP(x, "ID " + id, cx - 130, cy, 32, "200,240,255", a); fCaixa(x, cx + 130, cy, 240, 70, 12, corCod, a, 4, 0.12); rotuloP(x, cod, cx + 130, cy, 32, "255,240,190", a); }
function casaK(x, cx, cy, s, a) { if (a <= 0.01) return; fCaixa(x, cx, cy, 240 * s, 170 * s, 8 * s, BRC, a, 5 * s, 0.05); x.beginPath(); x.moveTo(cx - 140 * s, cy - 85 * s); x.lineTo(cx, cy - 190 * s); x.lineTo(cx + 140 * s, cy - 85 * s); x.strokeStyle = `rgba(${BRC},${a})`; x.lineWidth = 5 * s; x.stroke(); fCaixa(x, cx + 60 * s, cy + 35 * s, 50 * s, 100 * s, 4 * s, BRC, a, 4 * s, 0.05); }

function relogioK(x, cx, cy, r, ang, a) { if (a <= 0.01) return; anelP(x, cx, cy, r, VE, a, 6); linhaP(x, cx, cy, cx + Math.cos(ang - 1.57) * r * 0.75, cy + Math.sin(ang - 1.57) * r * 0.75, VE, a, 6); discoP(x, cx, cy, 6, VE, a); }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tP = B("pisca"), tMi = B("minuto"), tG = B("gravar"), tN = B("naoabre"), tPr = B("promessa"), tPt = B("proteger");
  mostrarGancho(tMi - 0.4);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["min", 330, 76, "levado em ~1 minuto", "pt-ve"], ["gra", 330, 66, "e se gravar o sinal?", "pt-ci"], ["nao", 330, 86, "não abre", "pt-ve"], ["lad", 330, 62, "o truque dos ladrões", "pt-am"]]);
  MD.slam(tl, tx.min, tMi - 0.6, { from: 1.35 }); MD.leave(tl, tx.min, tG - 0.3);
  MD.slam(tl, tx.gra, tG - 0.05, { from: 1.25 }); MD.leave(tl, tx.gra, tN - 0.3); MD.slam(tl, tx.nao, tN - 0.05, { from: 1.4 }); MD.leave(tl, tx.nao, tPr - 0.4); MD.slam(tl, tx.lad, tPr - 0.1, { from: 1.25 });
  const est = estF(3), SEU = 23;
  T.quadro((x, t) => {
    estD(x, est, t);
    const zc = PT.lerp(1.45, 1.0, PT.out(t / (tP + 0.3))); x.save(); x.translate(540, 760); x.scale(zc, zc); x.translate(-540, -760);
    const pis = t > tP - 0.2 && t < tG ? Math.max(0, Math.sin((t - tP) * 10)) : 0;
    for (let k = 0; k < 40; k++) { const col = k % 8, lin = Math.floor(k / 8); carroCima(x, 140 + col * 115, 620 + lin * 170, 0.9, k === SEU ? AM : CZ, 0.9, k === SEU ? pis : 0); }
    for (let lin = 0; lin < 5; lin++) linhaP(x, 80, 535 + lin * 170, 1000, 535 + lin * 170, CZ, 0.3, 2);
    x.restore();
    // alerta: o carro "levado" em ~1 minuto
    const aMi = PT.jan(t, tMi - 0.6, tG - 0.2, 0.2, 0.4); if (aMi > 0) { const cx = 140 + 7 * 115, cy = 620 + 2 * 170, p = ((t - tMi) * 1.5) % 1; anelP(x, cx, cy, 90 + p * 120, VE, aMi * (1 - p), 6); brilhoP(x, cx, cy, 160, VE, 0.5 * aMi); relogioK(x, cx - 230, cy, 60, (t - tMi) * 4, aMi); }
    const aK = PT.ss((t + 0.2) / 0.3); chave(x, 900, 1350, 1, aK, PT.jan(t, tP - 1.4, tP + 0.4, 0.1, 0.3)); ondasR(x, 900, 1300, t, PT.jan(t, tP - 1.2, tG, 0.2, 0.4), CI, 400);
    // gravador do ladrão
    const aG = PT.jan(t, tG - 0.3, tPr - 0.3, 0.3, 0.4); if (aG > 0) { fCaixa(x, 220, 1350, 160, 100, 14, VE, aG, 4, 0.1); discoP(x, 180, 1350, 10, VE, aG * (0.5 + 0.5 * Math.sin(t * 8))); rotuloP(x, "REC", 240, 1350, 28, "255,160,170", aG); }
  });
};

// =============== 2. um rádio no bolso ===============
CENAS.radio = (el, c, B) => {
  const tR = B("radio"), tA = B("ar"), tO = B("ouvem"), tI = B("id"), tIg = B("ignoram");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["rad", 330, 76, "um rádio minúsculo", "pt-ci"], ["id", 330, 70, "começa com o ID", "pt-am"], ["ign", 430, 46, "não é comigo: ignora", "pt-fino"]]);
  MD.slam(tl, tx.rad, tR - 0.05, { from: 1.3 }); MD.leave(tl, tx.rad, tI - 0.3); MD.slam(tl, tx.id, tI - 0.05, { from: 1.25 }); MD.arrive(tl, tx.ign, tIg - 0.2, { y: 14 });
  const est = estF(5);
  T.quadro((x, t) => {
    estD(x, est, t);
    chave(x, 540, 1250, 1.3, 1, PT.jan(t, tA - 0.5, tA + 0.4, 0.1, 0.3));
    ondasR(x, 540, 1180, t, PT.ss((t - tA + 0.3) / 0.5), CI, 520);
    // carros em volta, cada um "ouvindo"
    const aO = PT.ss((t - tO + 0.3) / 0.5), ign = PT.ss((t - tIg + 0.3) / 0.5);
    [[200, 720], [540, 640], [880, 720], [180, 1000], [900, 1000]].forEach(([px, py], k) => { const seu = k === 1; carroCima(x, px, py, 1, seu ? AM : CZ, aO > 0 ? 1 : 0.5, seu && ign > 0 ? Math.max(0, Math.sin(t * 8)) : 0); if (aO > 0) rotuloP(x, seu ? "é comigo!" : ign > 0 ? "não é comigo" : "?", px, py - 100, 26, seu ? "255,226,140" : "200,205,215", aO * (seu ? Math.max(0.3, ign) : 1)); });
    const aI = PT.ss((t - tI + 0.3) / 0.5); pacote(x, 540, 900, "4F2A", "· · ·", aI);
  });
};

// =============== 3. o código que muda ===============
CENAS.codigo = (el, c, B) => {
  const tG = B("gravar2"), tD = B("diferente"), tS = B("segredo"), tC = B("contador"), tSo = B("sobe"), tV = B("vale");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["nb", 330, 76, "só o ID não basta", "pt-ve"], ["dif", 330, 66, "a cada clique, um código novo", "pt-am", "white-space:normal;left:60px;width:960px"], ["seg", 330, 66, "segredo + contador", "pt-ci"], ["val", 330, 70, "usado = nunca mais", "pt-ve"]]);
  MD.slam(tl, tx.nb, c.ini + 0.4, { from: 1.3 }); MD.leave(tl, tx.nb, tD - 0.35);
  MD.slam(tl, tx.dif, tD - 0.05, { from: 1.25 }); MD.leave(tl, tx.dif, tS - 0.3); MD.slam(tl, tx.seg, tS - 0.05, { from: 1.25 }); MD.leave(tl, tx.seg, tV - 0.35); MD.slam(tl, tx.val, tV - 0.05, { from: 1.35 });
  const est = estF(7), hex = "0123456789ABCDEF";
  T.quadro((x, t) => {
    estD(x, est, t);
    // ladrão gravando e repetindo (falha)
    const aG = PT.jan(t, tG - 0.3, tD - 0.2, 0.3, 0.4), aW = PT.jan(t, c.ini + 0.5, tD - 0.2, 0.4, 0.4);
    ondasR(x, 200, 1260, t, aW, CI, 420);
    if (aG > 0) { fCaixa(x, 540, 800, 420, 150, 18, VE, aG, 5, 0.08); rotuloP(x, "gravar e repetir?", 540, 800, 44, "255,160,170", aG);
      fCaixa(x, 540, 1060, 200, 110, 14, VE, aG, 4, 0.1); discoP(x, 490, 1060, 12, VE, aG * (0.5 + 0.5 * Math.sin(t * 8))); rotuloP(x, "REC", 565, 1060, 32, "255,160,170", aG); }
    // sequência de cliques: contador e código
    const aD = PT.ss((t - tD + 0.4) / 0.5);
    if (aD > 0) { const n = 1 + Math.floor(Math.max(0, t - tD) / 1.3); for (let k = 0; k < Math.min(n, 5); k++) { const r = prng(k * 13 + 1); let s = ""; for (let q = 0; q < 8; q++) s += hex[Math.floor(r() * 16)]; const a = aD * PT.ss((t - tD - k * 1.3) / 0.3), usado = k < n - 1; pacote(x, 600, 640 + k * 110, "4F2A", s, a * (usado ? 0.45 : 1), usado ? CZ : AM); rotuloP(x, `#${1040 + k}`, 120, 640 + k * 110, 30, usado ? "150,160,190" : "255,226,140", a, "left"); if (usado && t > tV - 0.3) linhaP(x, 360, 640 + k * 110, 860, 640 + k * 110, VE, a * PT.ss((t - tV + 0.3) / 0.4), 4); } }
    // segredo compartilhado (chave + carro)
    const aS = PT.ss((t - tS + 0.3) / 0.5), aB = Math.max(aS, PT.ss((t - c.ini - 0.5) / 0.5)); chave(x, 200, 1300, 0.7, aB, PT.jan(t, c.ini + 0.5, tD - 0.2, 0.1, 0.3)); carroLado(x, 800, 1320, 0.7, BRC, aB);
    if (aS > 0) { x.setLineDash([8, 10]); linhaP(x, 260, 1300, 680, 1300, AM, aS * 0.7, 3); x.setLineDash([]); rotuloP(x, "mesmo segredo", 480, 1270, 28, "255,226,140", aS); }
  });
};

// =============== 4. a janela (o porteiro) ===============
CENAS.janela = (el, c, B) => {
  const tB = B("bolso"), tT = B("tras"), tJ = B("janela"), tP = B("porteiro"), tO = B("ontem");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["jan", 330, 66, "aceita os próximos", "pt-ci"], ["por", 330, 62, "hoje ou amanhã: sim. ontem: não", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.jan, tJ - 0.05, { from: 1.25 }); MD.leave(tl, tx.jan, tP - 0.35); MD.slam(tl, tx.por, tP - 0.05, { from: 1.25 });
  const est = estF(9);
  T.quadro((x, t) => {
    estD(x, est, t);
    // régua de contadores
    const y = 900, x0 = 120, dx = 70;
    for (let k = 0; k < 13; k++) { const px = x0 + k * dx; linhaP(x, px, y - 20, px, y + 20, BRC, 0.6, 3); rotuloP(x, String(1040 + k), px, y + 50, 22, "200,210,230", 0.7); }
    linhaP(x, x0, y, x0 + 12 * dx, y, BRC, 0.5, 3);
    const carro = 2, chaveN = 2 + Math.round(5 * PT.ss((t - tB) / 2.5));
    // posição da chave (anda com cliques no bolso) e do carro (fica)
    discoP(x, x0 + chaveN * dx, y - 80, 18, AM, 1); rotuloP(x, "chave", x0 + chaveN * dx, y - 125, 28, "255,226,140", 1);
    const atualiza = PT.ss((t - tJ - 1.5) / 0.6), cpos = PT.lerp(carro, chaveN, atualiza);
    discoP(x, x0 + cpos * dx, y + 110, 18, CI, 1); rotuloP(x, "carro", x0 + cpos * dx, y + 155, 28, "180,235,255", 1);
    const aT = PT.ss((t - tT + 0.3) / 0.5) * (1 - atualiza); if (aT > 0) rotuloP(x, "ficou pra trás", x0 + carro * dx, y + 200, 28, "255,160,170", aT);
    // janela de aceitação
    const aJ = PT.ss((t - tJ + 0.3) / 0.5); if (aJ > 0) { fRR(x, x0 + (cpos + 0.5) * dx, y - 40, 4.6 * dx, 80, 16); x.fillStyle = `rgba(${VD},${0.15 * aJ})`; x.fill(); x.strokeStyle = `rgba(${VD},${aJ})`; x.lineWidth = 4; x.stroke(); rotuloP(x, "janela aceita", x0 + (cpos + 2.8) * dx, y - 70, 26, "150,255,200", aJ); }
    // porteiro
    const aP = PT.ss((t - tP + 0.3) / 0.5); if (aP > 0) { fPessoa(x, 540, 1300, 2.2, CI, aP); const aO = PT.ss((t - tO + 0.3) / 0.4); rotuloP(x, aO > 0 ? "ontem? não!" : "hoje? pode", 760, 1180, 34, aO > 0 ? "255,160,170" : "150,255,200", aP); }
  });
};

// =============== 5. o truque dos ladrões ===============
CENAS.ladrao = (el, c, B) => {
  const tN = B("nada"), tD = B("dois"), tC = B("capta"), tR = B("repete"), tA = B("abre"), tRe = B("relay");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["sem", 330, 62, "chave presencial: sem botão", "pt-ci", "white-space:normal;left:60px;width:960px"], ["dois", 330, 70, "2 aparelhos", "pt-ve"], ["rel", 330, 60, "ataque de retransmissão", "pt-am"]]);
  MD.slam(tl, tx.sem, tN - 0.05, { from: 1.25 }); MD.leave(tl, tx.sem, tD - 0.3); MD.slam(tl, tx.dois, tD - 0.05, { from: 1.35 }); MD.leave(tl, tx.dois, tRe - 0.4); MD.slam(tl, tx.rel, tRe - 0.05, { from: 1.25 });
  const est = estF(11);
  T.quadro((x, t) => {
    estD(x, est, t);
    casaK(x, 250, 1150, 1, 1); chave(x, 220, 1180, 0.45, 1);
    carroLado(x, 820, 1260, 0.9, BRC, 1);
    const aD = PT.ss((t - tD + 0.3) / 0.5);
    if (aD > 0) { fPessoa(x, 470, 1250, 1.6, VE, aD); fCaixa(x, 470, 1150, 60, 40, 8, VE, aD, 3, 0.3); fPessoa(x, 650, 1250, 1.6, VE, aD); fCaixa(x, 650, 1150, 60, 40, 8, VE, aD, 3, 0.3); }
    const aC = PT.ss((t - tC + 0.3) / 0.5); if (aC > 0) ondasR(x, 230, 1180, t, aC, CI, 260);
    const aR = PT.ss((t - tR + 0.3) / 0.5); if (aR > 0) { for (let q = 0; q < 5; q++) { const u = ((t - tR) * 0.8 + q / 5) % 1; discoP(x, PT.lerp(470, 650, u), 1150 - Math.sin(u * Math.PI) * 120, 8, VE, aR); } ondasR(x, 650, 1150, t, aR, VE, 200); }
    const aA = PT.ss((t - tA + 0.2) / 0.3); if (aA > 0) { for (const dx of [-150, 150]) { discoP(x, 820 + dx * 0.9, 1250, 9, AM, aA * Math.max(0, Math.sin(t * 10))); } rotuloP(x, "ABRIU", 820, 1100, 40, "255,160,170", aA); }
  });
};

// =============== 6. a defesa ===============
CENAS.dica = (el, c, B) => {
  const tP = B("porta"), tM = B("metal"), tB = B("bloqueia"), tD = B("desliga");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["lon", 330, 66, "chave longe da porta", "pt-ci"], ["cai", 330, 66, "caixinha de metal", "pt-am"], ["des", 330, 58, "ou desligue o sem-botão", "pt-ci"]]);
  MD.slam(tl, tx.lon, tP - 0.05, { from: 1.25 }); MD.leave(tl, tx.lon, tM - 0.3); MD.slam(tl, tx.cai, tM - 0.05, { from: 1.25 }); MD.leave(tl, tx.cai, tD - 0.35); MD.slam(tl, tx.des, tD - 0.05, { from: 1.25 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    casaK(x, 540, 1100, 2, 1);
    const ent = PT.inOut((t - tP + 0.3) / 0.8), kx = PT.lerp(640, 420, ent), ky = PT.lerp(1130, 1030, ent);
    const aM = PT.ss((t - tM + 0.3) / 0.5), bloq = PT.ss((t - tB + 0.3) / 0.5);
    chave(x, kx, ky, 0.6, 1);
    if (aM > 0) { fCaixa(x, kx, ky + 10, 160, 140, 12, "200,210,230", aM, 6, 0.25); rotuloP(x, "metal", kx, ky + 110, 26, "220,230,245", aM); }
    ondasR(x, kx, ky, t, (1 - bloq) * 0.8, CI, 260 * (1 - 0.8 * ent));
    if (bloq > 0) rotuloP(x, "sinal bloqueado", kx, ky - 140, 30, "150,255,200", bloq);
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["a chave diz o nome do carro", "cada clique, um código novo", "o carro aceita só os da frente", "sem botão? caixinha de metal"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    chave(x, 540, 1250, 0.8, 0.8 * sai, Math.max(0, Math.sin(t * 3)));
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [CI, AM, VD, "200,210,230"][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
