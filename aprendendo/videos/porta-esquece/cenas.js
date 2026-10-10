// Cenas do vídeo "Por que você esquece o que ia fazer quando passa por uma porta" — pontos de luz.
// Retenção: situação do dia a dia (levantar do sofá e esquecer), promessa (o truque), experimento,
// metáfora dos capítulos, virada de 2021 (só com a cabeça cheia) e dica prática.

const MD = MotionDirector;
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.5);

function copo(x, cx, cy, s, cor, a) { if (a <= 0.01) return; x.beginPath(); x.moveTo(cx - 28 * s, cy - 40 * s); x.lineTo(cx + 28 * s, cy - 40 * s); x.lineTo(cx + 20 * s, cy + 40 * s); x.lineTo(cx - 20 * s, cy + 40 * s); x.closePath(); x.fillStyle = `rgba(${cor},${0.15 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 5 * s; x.stroke(); linhaP(x, cx - 25 * s, cy - 10 * s, cx + 25 * s, cy - 10 * s, cor, 0.6 * a, 3 * s); }
function lampadaP(x, cx, cy, s, a, acesa = 1) { if (a <= 0.01) return; const cor = acesa > 0.5 ? AM : "150,160,190"; if (acesa > 0) brilhoP(x, cx, cy, 90 * s, AM, 0.5 * a * acesa); anelP(x, cx, cy, 34 * s, cor, a, 5 * s); fCaixa(x, cx, cy + 46 * s, 30 * s, 22 * s, 4 * s, cor, a, 4 * s, 0.2); }
function bolha(x, cx, cy, r, cor, a) { if (a <= 0.01) return; discoP(x, cx, cy, r, cor, 0.08 * a); anelP(x, cx, cy, r, cor, a, 4); discoP(x, cx - r * 0.6, cy + r * 1.05, r * 0.16, cor, 0.6 * a); discoP(x, cx - r * 0.8, cy + r * 1.35, r * 0.09, cor, 0.6 * a); }
// casa em corte: sala (esquerda) | porta | cozinha (direita)
function casaCorte(x, a, piso = 1250, porta = 540) {
  if (a <= 0.01) return; linhaP(x, 60, piso, 1020, piso, BRC, 0.6 * a, 4); linhaP(x, 60, 640, 1020, 640, BRC, 0.3 * a, 3);
  linhaP(x, porta, 640, porta, piso - 300, BRC, 0.7 * a, 8); x.setLineDash([10, 10]); linhaP(x, porta, piso - 300, porta, piso, AM, 0.6 * a, 4); x.setLineDash([]);
  // sofá
  fCaixa(x, 220, piso - 60, 240, 80, 20, "180,150,255", a, 4, 0.12); fCaixa(x, 220, piso - 130, 240, 60, 20, "180,150,255", a, 4, 0.08);
  // geladeira e balcão
  fCaixa(x, 920, piso - 170, 120, 340, 14, CI, a, 4, 0.08); linhaP(x, 870, piso - 220, 970, piso - 220, CI, 0.6 * a, 3); fCaixa(x, 720, piso - 70, 180, 140, 8, CI, a, 4, 0.06);
  rotuloP(x, "SALA", 220, 680, 30, "200,190,255", 0.7 * a); rotuloP(x, "COZINHA", 820, 680, 30, "180,230,255", 0.7 * a);
}
function medidor(x, cx, cy, v, a, rot) { if (a <= 0.01) return; for (let k = 0; k < 10; k++) { const on = k < Math.round(v * 10), cor = k < 3 ? "255,110,130" : k < 6 ? "255,210,63" : "120,255,190"; fCaixa(x, cx - 225 + k * 50, cy, 38, 54, 8, on ? cor : "120,128,150", a * (on ? 1 : 0.3), 3, on ? 0.5 : 0.05); } rotuloP(x, rot, cx, cy - 56, 28, "255,255,255", 0.85 * a); }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tS = B("sofa"), tP = B("porta"), tPr = B("pronto"), tV = B("voce"), tT = B("truque");
  mostrarGancho(tP + 0.4);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["esq", 330, 92, "esqueceu!", "pt-ve"], ["nao", 330, 66, "não é só com você", "pt-ci"]]);
  MD.slam(tl, tx.esq, tPr - 0.05, { from: 1.4 }); MD.leave(tl, tx.esq, tV - 0.35); MD.slam(tl, tx.nao, tV - 0.05, { from: 1.25 });
  const est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    casaCorte(x, PT.ss(t / 0.5));
    const q = PT.inOut((t - tS) / (tPr - tS + 0.6)), px = PT.lerp(240, 760, q), py = 1170 - Math.abs(Math.sin(q * 20)) * 8;
    fPessoa(x, px, py, 1.8, "255,226,190", 1);
    const perdeu = PT.ss((t - tPr + 0.2) / 0.5);
    bolha(x, px - 40, py - 200, 70, CI, PT.ss((t - tS) / 0.5));
    copo(x, px - 40, py - 200, 0.8, CI, PT.ss((t - tS) / 0.5) * (1 - perdeu));
    if (perdeu > 0) rotuloP(x, "?", px - 40, py - 200, 90, AM, perdeu * (0.8 + 0.2 * Math.sin(t * 5)));
    const aT = PT.ss((t - tT + 0.3) / 0.5); if (aT > 0) lampadaP(x, 900, 900, 1.6, aT, 0.5 + 0.5 * Math.sin(t * 4));
  });
};

// =============== 2. o experimento ===============
CENAS.experimento = (el, c, B) => {
  const tV = B("virtual"), tP = B("porta"), tS = B("sala"), tM = B("mais"), tVe = B("verdade");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["rad", 330, 58, "Radvansky, EUA, 2011", "pt-ci"], ["mais", 330, 74, "com porta: esquece mais", "pt-ve", "white-space:normal;left:60px;width:960px"], ["ver", 330, 64, "e em salas de verdade", "pt-am"]]);
  MD.arrive(tl, tx.rad, c.ini + 0.5, { y: 14 }); MD.leave(tl, tx.rad, tM - 0.35); MD.slam(tl, tx.mais, tM - 0.05, { from: 1.3 }); MD.leave(tl, tx.mais, tVe - 0.35); MD.slam(tl, tx.ver, tVe - 0.05, { from: 1.25 });
  const est = estF(5);
  T.quadro((x, t) => {
    estD(x, est, t);
    // dois corredores: em cima, a mesma sala; embaixo, com uma porta no meio
    const aV = PT.ss((t - c.ini - 0.6) / 0.6);
    [[700, "MESMA SALA", 0, PT.ss((t - tS + 0.4) / 0.5)], [1080, "PASSANDO PELA PORTA", 1, PT.ss((t - tP + 0.4) / 0.5)]].forEach(([y, nome, temPorta, aL]) => {
      fCaixa(x, 540, y, 860, 280, 18, "180,190,230", aV, 3, 0.04); rotuloP(x, nome, 140, y - 115, 28, "220,228,245", aV * Math.max(0.4, aL), "left");
      if (temPorta) { linhaP(x, 540, y - 140, 540, y - 50, BRC, aV, 8); linhaP(x, 540, y + 50, 540, y + 140, BRC, aV, 8); }
      const q = ((t - tV) * 0.18) % 1, px = PT.lerp(200, 880, q); fPessoa(x, px, y + 70, 1.2, "255,226,190", aV);
      // mesa com objeto (o que carrega)
      fCaixa(x, px + 40, y + 10, 40, 40, 6, AM, aV, 3, 0.4);
      const perde = temPorta && px > 540 ? PT.ss((t - tM + 0.8) / 0.6) : 0;
      bolha(x, px - 20, y - 50, 32, CI, aV); if (perde > 0) rotuloP(x, "?", px - 20, y - 50, 40, AM, aV * perde); else fCaixa(x, px - 20, y - 50, 22, 22, 4, AM, aV, 3, 0.4);
    });
    const aM = PT.ss((t - tM + 0.3) / 0.5); if (aM > 0) { medidor(x, 540, 880, 0.85, aM, "MEMÓRIA: MESMA SALA"); medidor(x, 540, 1300, 0.45, aM, "MEMÓRIA: COM PORTA"); }
  });
};

// =============== 3. capítulos ===============
CENAS.capitulos = (el, c, B) => {
  const tF = B("filme"), tC = B("capitulos"), tS = B("serie"), tFi = B("fim"), tA = B("arquiva"), tG = B("gaveta");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["cap", 330, 76, "o dia em capítulos", "pt-am"], ["fim", 330, 70, "porta = fim de capítulo", "pt-ve", "white-space:normal;left:60px;width:960px"], ["gav", 330, 62, "a intenção fica pra trás", "pt-ci", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.cap, tC - 0.05, { from: 1.3 }); MD.leave(tl, tx.cap, tFi - 0.35); MD.slam(tl, tx.fim, tFi - 0.05, { from: 1.3 }); MD.leave(tl, tx.fim, tA - 0.35); MD.slam(tl, tx.gav, tA - 0.05, { from: 1.25 });
  const est = estF(7), nomes = ["SALA", "CORREDOR", "COZINHA"];
  T.quadro((x, t) => {
    estD(x, est, t);
    const aF = PT.ss((t - tF + 0.4) / 0.5), sep = PT.inOut((t - tC + 0.2) / 0.8), arq = PT.inOut((t - tA) / 1.4);
    // fita de filme que se divide em 3 episódios
    for (let k = 0; k < 3; k++) {
      let cx = 220 + k * 320 + (k - 1) * 30 * sep, cy = 780, w = 300 - 20 * sep;
      if (k === 0) { cx = PT.lerp(cx, 540, arq); cy = PT.lerp(cy, 1160, arq); w = PT.lerp(w, 200, arq); }
      const a = aF * (k === 0 ? 1 : 1 - 0.4 * arq);
      fCaixa(x, cx, cy, w, 220 * (w / 280), 12, k === 0 ? "200,190,255" : k === 1 ? "220,228,245" : "180,230,255", a, 4, 0.06);
      for (let f = 0; f < 6; f++) { discoP(x, cx - w / 2 + 20 + f * (w - 40) / 5, cy - 90 * (w / 280), 5, BRC, 0.6 * a); discoP(x, cx - w / 2 + 20 + f * (w - 40) / 5, cy + 90 * (w / 280), 5, BRC, 0.6 * a); }
      if (sep > 0.3) rotuloP(x, nomes[k], cx, cy - 15, 30 * (w / 280), "255,255,255", a * PT.ss((t - tC) / 0.6));
      if (t > tS - 0.3) rotuloP(x, "EP " + (k + 1), cx, cy + 30, 26 * (w / 280), "255,226,140", a * PT.ss((t - tS + 0.3) / 0.5));
      if (k === 0) lampadaP(x, cx + w * 0.32, cy - 40 * (w / 280), 0.5 * (w / 280), a, 1 - PT.ss((t - tG) / 0.4));
    }
    // porta entre os episódios = fim de capítulo
    const aFi = PT.jan(t, tFi - 0.3, tA, 0.4, 0.5); if (aFi > 0) [380, 700].forEach((px) => { fCaixa(x, px, 780, 50, 160, 6, AM, aFi, 4, 0.2); discoP(x, px + 12, 790, 5, AM, aFi); });
    // gaveta
    const aG = PT.ss((t - tA + 0.3) / 0.5); if (aG > 0) { const fecha = PT.ss((t - tG + 0.5) / 0.5); fCaixa(x, 540, 1220, 520, 230, 16, "200,210,230", aG, 5, 0.04); fCaixa(x, 540, 1220 - 120 * (1 - fecha), 480, 40, 12, "200,210,230", aG, 4, 0.15); linhaP(x, 490, 1250, 590, 1250, "200,210,230", aG, 8); }
  });
};

// =============== 4. por que voltar funciona ===============
CENAS.voltar = (el, c, B) => {
  const tV = B("volta"), tH = B("hora"), tN = B("nasceu"), tA = B("abre"), tVi = B("virada");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["lem", 330, 86, "lembrou!", "pt-am"], ["vir", 330, 80, "mas tem uma virada", "pt-ve"]]);
  MD.slam(tl, tx.lem, tH - 0.05, { from: 1.4 }); MD.leave(tl, tx.lem, tVi - 0.4); MD.slam(tl, tx.vir, tVi - 0.05, { from: 1.35 });
  const est = estF(9);
  T.quadro((x, t) => {
    estD(x, est, t);
    casaCorte(x, 1);
    const q = PT.inOut((t - tV + 0.6) / (tH - tV + 0.6)), px = PT.lerp(760, 260, q);
    fPessoa(x, px, 1170, 1.8, "255,226,190", 1);
    const lem = PT.ss((t - tH + 0.3) / 0.4); bolha(x, px - 40, 970, 70, CI, 1); if (lem > 0) copo(x, px - 40, 970, 0.8, CI, lem); else rotuloP(x, "?", px - 40, 970, 90, AM, 1);
    if (lem > 0) lampadaP(x, px + 90, 900, 1.2, lem, 1);
    const aN = PT.ss((t - tN + 0.3) / 0.5); if (aN > 0) { brilhoP(x, 220, 1150, 200, "200,190,255", 0.4 * aN); rotuloP(x, "onde a ideia nasceu", 260, 1320, 30, "220,210,255", aN); }
  });
};

// =============== 5. a virada (2021) ===============
CENAS.virada = (el, c, B) => {
  const tL = B("londres"), tD = B("diferenca"), tO = B("ocupada"), tC = B("conta"), tE = B("empurrao"), tCh = B("cheia");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["lon", 330, 58, "Londres, 2021", "pt-ci"], ["so", 330, 66, "só a porta: quase nada", "pt-ci"], ["che", 330, 76, "a cabeça cheia derruba", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.arrive(tl, tx.lon, tL - 0.1, { y: 14 }); MD.leave(tl, tx.lon, tD - 0.35); MD.slam(tl, tx.so, tD - 0.05, { from: 1.25 }); MD.leave(tl, tx.so, tCh - 0.4); MD.slam(tl, tx.che, tCh - 0.05, { from: 1.35 });
  const est = estF(11);
  T.quadro((x, t) => {
    estD(x, est, t);
    // óculos de realidade virtual
    const aL = PT.ss((t - tL + 0.3) / 0.5) * (1 - PT.ss((t - tO + 0.5) / 0.5)); if (aL > 0) { fCaixa(x, 540, 800, 420, 180, 60, CI, aL, 6, 0.08); anelP(x, 450, 800, 50, CI, aL, 5); anelP(x, 630, 800, 50, CI, aL, 5); linhaP(x, 330, 800, 200, 760, CI, aL, 6); linhaP(x, 750, 800, 880, 760, CI, aL, 6); }
    // cabeça com contas voando
    const aO = PT.ss((t - tO + 0.5) / 0.5); if (aO > 0) { anelP(x, 540, 800, 170, "255,226,190", aO, 6); const r = prng(3); const cont = PT.ss((t - tC + 0.2) / 0.5); for (let k = 0; k < 9; k++) { const an = r() * 6.283 + t * 0.4, d = 60 + r() * 90; rotuloP(x, ["17+28", "×3", "=?", "9-4", "+12", "÷2", "45", "?", "8×7"][k], 540 + Math.cos(an) * d, 800 + Math.sin(an) * d, 30, "255,210,63", aO * cont); } }
    medidor(x, 540, 1120, PT.lerp(0.85, 0.75, PT.ss((t - tD) / 0.6)), PT.ss((t - tD + 0.5) / 0.5), "MEMÓRIA: SÓ A PORTA");
    medidor(x, 540, 1290, PT.lerp(0.85, 0.3, PT.ss((t - tC) / 0.8)), PT.ss((t - tO + 0.3) / 0.5), "MEMÓRIA: PORTA + CONTA");
  });
};

// =============== 6. o truque ===============
CENAS.dica = (el, c, B) => {
  const tA = B("alta"), tI = B("imagina"), tF = B("forca"), tS = B("saiu");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["fal", 330, 72, "fala em voz alta", "pt-am"], ["ima", 330, 72, "ou imagina a cena", "pt-ci"], ["vol", 330, 66, "esqueceu? volta", "pt-ve"]]);
  MD.slam(tl, tx.fal, tA - 0.05, { from: 1.3 }); MD.leave(tl, tx.fal, tI - 0.35); MD.slam(tl, tx.ima, tI - 0.05, { from: 1.3 }); MD.leave(tl, tx.ima, tS - 0.9); MD.slam(tl, tx.vol, tS - 0.6, { from: 1.3 });
  const est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    fPessoa(x, 330, 1100, 2.4, "255,226,190", 1);
    const aA = PT.ss((t - tA + 0.3) / 0.5); if (aA > 0) { fCaixa(x, 680, 860, 420, 110, 50, AM, aA, 4, 0.1); rotuloP(x, "vou pegar o copo!", 680, 860, 38, "255,236,170", aA); }
    const aI = PT.ss((t - tI + 0.3) / 0.5); if (aI > 0) { bolha(x, 680, 1060, 90, CI, aI); copo(x, 640, 1060, 0.9, CI, aI); fPessoa(x, 730, 1080, 0.8, "180,230,255", aI); }
    medidor(x, 540, 1340, PT.lerp(0.5, 0.95, PT.ss((t - tF) / 0.8)), PT.ss((t - tA + 0.3) / 0.5), "FORÇA DA INTENÇÃO");
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["o cérebro grava em capítulos", "a porta fecha um capítulo", "cabeça cheia piora tudo", "falar em voz alta ajuda"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    fCaixa(x, 540, 1230, 130, 260, 8, AM, 0.6 * sai, 5, 0.05); discoP(x, 580, 1240, 7, AM, 0.6 * sai);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, ["200,190,255", AM, VE, CI][k], a); brilhoP(x, 160, Y[k], 50, "230,225,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
