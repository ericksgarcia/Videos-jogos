// Cenas do vídeo "Por que a sua voz soa estranha gravada" — pontos de luz na GPU.
// Retenção: dor do dia a dia (o próprio áudio), promessa (o experimento de 2013), dois caminhos do
// som (ar e ossos), teste para fazer na hora (dedos nos ouvidos), choque e virada final.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const CI = "143,227,255", AM = "255,210,63", VE = "255,110,130", VD = "120,255,190", LA = "255,150,70", BRC = "220,228,245";
const estF = (seed) => ambienteP(200, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "200,215,255", 0.5);

// cabeça de perfil (olhando para a direita), coordenadas relativas a (0,0) = centro do crânio, escala 1 ≈ 1 px
const PERFIL = [[150, -235], [215, -150], [232, -60], [238, -10], [300, 50], [250, 80], [262, 120], [242, 140], [255, 170], [228, 200], [215, 245], [150, 262], [95, 300], [95, 420]];
const perfilX = (y) => { for (let k = 1; k < PERFIL.length; k++) { const [x0, y0] = PERFIL[k - 1], [x1, y1] = PERFIL[k]; if (y >= y0 && y <= y1) return x0 + (x1 - x0) * (y - y0) / Math.max(1e-6, y1 - y0); } return -1e9; };
const CABECA = (() => { const r = prng(77), o = []; const dentro = (x, y) => (Math.pow(x / 230, 2) + Math.pow((y + 20) / 250, 2) < 1) || (x > 0 && y > -235 && y < 262 && x < perfilX(y)) || (x > -120 && x < 95 && y > 150 && y < 420); while (o.length < 15000) { const x = r() * 600 - 280, y = r() * 720 - 300; if (dentro(x, y)) o.push({ x, y, n: r(), osso: Math.abs(Math.hypot(x / 230, (y + 20) / 250) - 0.93) < 0.05 && x < 150 }); } return o; })();
const OUVIDO = [-20, 20], BOCA = [262, 140], GARGANTA = [30, 300];
function perfilLinha(x, cx, cy, s, a) { if (a <= 0.01) return; x.beginPath(); PERFIL.forEach(([px, py], k) => k ? x.lineTo(cx + px * s, cy + py * s) : x.moveTo(cx + px * s, cy + py * s)); x.strokeStyle = `rgba(230,235,255,${0.8 * a})`; x.lineWidth = 4; x.lineJoin = "round"; x.stroke(); }
function cabeca(nv, cx, cy, s, a, vib = 0, t = 0) { let i = nv.k; for (const p of CABECA) { const d = Math.hypot(p.x - GARGANTA[0], p.y - GARGANTA[1]), onda = vib * Math.max(0, Math.sin(d * 0.05 - t * 9)); const c = p.osso ? mixC([0.95, 0.9, 0.85], [1.0, 0.6, 0.3], onda) : mixC([0.55, 0.65, 0.95], [1.0, 0.6, 0.3], onda * 0.7); nv.ponto(i++, cx + p.x * s, cy + p.y * s, c[0], c[1], c[2], a * ((p.osso ? 0.55 : 0.2) + 0.25 * p.n + 0.5 * onda), p.osso ? 3.6 : 3); } nv.total(i); }
// barras de frequência (graves à esquerda)
function espectro(x, cx, cy, w, h, graves, cor, a, rot) { if (a <= 0.01) return; const n = 14; for (let k = 0; k < n; k++) { const u = k / (n - 1), v = 0.35 + 0.35 * Math.sin(u * 7 + 1) * 0.5 + graves * Math.exp(-u * 4) * 0.6; const bh = h * PT.cl(v); fCaixa(x, cx - w / 2 + (k + 0.5) * w / n, cy - bh / 2, w / n * 0.7, bh, 4, u < 0.3 ? LA : cor, a, 2, 0.5); } rotuloP(x, rot, cx, cy + 40, 30, "255,255,255", 0.85 * a); rotuloP(x, "graves", cx - w / 2, cy + 80, 24, "255,190,140", 0.7 * a, "left"); rotuloP(x, "agudos", cx + w / 2, cy + 80, 24, "200,220,255", 0.7 * a, "right"); }
function ondaSom(x, cx, cy, w, amp, t, cor, a, f = 1) { if (a <= 0.01) return; x.beginPath(); for (let k = 0; k <= 120; k++) { const u = k / 120, y = cy + Math.sin(u * 40 * f + t * 6) * amp * Math.sin(u * Math.PI) * (0.6 + 0.4 * Math.sin(u * 9 + t)); k ? x.lineTo(cx - w / 2 + u * w, y) : x.moveTo(cx - w / 2 + u * w, y); } x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 4; x.stroke(); }
function estrelas5(x, cx, cy, v, a, cor = AM) { for (let k = 0; k < 5; k++) { const on = k < v; const px = cx - 80 + k * 40; x.beginPath(); for (let q = 0; q < 10; q++) { const an = -Math.PI / 2 + q * Math.PI / 5, rr = q % 2 ? 7 : 16; q ? x.lineTo(px + Math.cos(an) * rr, cy + Math.sin(an) * rr) : x.moveTo(px + Math.cos(an) * rr, cy + Math.sin(an) * rr); } x.closePath(); x.fillStyle = `rgba(${on ? cor : "120,128,150"},${(on ? 0.7 : 0.25) * a})`; x.fill(); } }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tNu = B("nunca"), tM = B("minha"), tT = B("todo"), tP = B("promessa"), tE = tM;
  mostrarGancho(tM - 0.6);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["que", 330, 86, "que voz é essa?", "pt-ve"], ["tod", 330, 66, "todo mundo sente isso", "pt-ci"]]);
  MD.slam(tl, tx.que, tE - 0.05, { from: 1.35 }); MD.leave(tl, tx.que, tT - 0.35); MD.slam(tl, tx.tod, tT - 0.05, { from: 1.25 });
  const est = estF(3), nv = T.nuvem(15100);
  T.quadro((x, t) => {
    estD(x, est, t);
    // quadro 0: a sua cabeça vibrando por dentro, e a voz que sai pro mundo
    const a0 = 1 - PT.ss((t - tM + 1.4) / 0.5);
    if (a0 > 0.01) {
      brilhoP(x, 400, 880, 400, "255,190,140", 0.22 * a0); cabeca(nv, 420, 900, 1.1, a0, 1, t);
      for (let k = 0; k < 5; k++) { const u = ((t * 0.6 + k / 5) % 1), R = 60 + u * 420; x.beginPath(); x.arc(420 + 262 * 1.1, 900 + 140 * 1.1, R, -0.6, 0.6); x.strokeStyle = `rgba(${VD},${a0 * (1 - u) * 0.8})`; x.lineWidth = 5; x.stroke(); }
      const aR = PT.ss((t - tNu + 1.6) / 0.5) * a0; rotuloP(x, "a voz que você ouve", 360, 580, 40, "255,226,140", aR); rotuloP(x, "a que os outros ouvem", 760, 1300, 40, "160,255,210", aR);
    } else nv.total(nv.k);
    const aP = PT.ss((t - tM + 1.2) / 0.5); x.save(); x.globalAlpha = aP;
    fCelular(x, 540, 980, 760, BRC, 1, 0.06);
    // mensagem de áudio tocando
    fCaixa(x, 540, 980, 300, 100, 50, VD, 1, 4, 0.12); discoP(x, 430, 980, 22, VD, 0.8); ondaSom(x, 570, 980, 170, 18, t, VD, PT.ss((t - 1) / 0.5), 0.6);
    rotuloP(x, "0:12", 540, 1060, 28, "200,255,220", 0.8); x.restore();
    const aC = PT.ss((t - tM + 0.4) / 0.4); if (aC > 0) { for (let k = 0; k < 6; k++) { const an = k * 1.05 + t; linhaP(x, 540 + Math.cos(an) * 200, 980 + Math.sin(an) * 160, 540 + Math.cos(an) * 240, 980 + Math.sin(an) * 190, VE, aC * 0.8, 5); } }
    if (t > tP - 0.4) rotuloP(x, "?", 820, 760, 120, AM, PT.ss((t - tP + 0.4) / 0.4));
  });
};

// =============== 2. dois caminhos ===============
CENAS.caminhos = (el, c, B) => {
  const tD = B("dois"), tA = B("ar"), tO = B("ossos"), tG = B("graves"), tE = B("encorpada");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["d", 330, 76, "2 caminhos", "pt-am"], ["ar", 330, 70, "1. pelo ar", "pt-ci"], ["os", 330, 70, "2. pelos ossos", "pt-la"], ["gr", 330, 66, "ossos = mais grave", "pt-la"]]);
  MD.slam(tl, tx.d, tD - 0.05, { from: 1.3 }); MD.leave(tl, tx.d, tA - 0.3); MD.arrive(tl, tx.ar, tA - 0.1, { y: 14 }); MD.leave(tl, tx.ar, tO - 0.3); MD.arrive(tl, tx.os, tO - 0.1, { y: 14 }); MD.leave(tl, tx.os, tG - 0.3); MD.slam(tl, tx.gr, tG - 0.05, { from: 1.3 });
  const nv = T.nuvem(15100), est = estF(5), CX = 440, CY = 760, S = 1.05;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aO = PT.ss((t - tO + 0.3) / 0.5);
    cabeca(nv, CX, CY, S, 1, aO, t); perfilLinha(x, CX, CY, S, 1);
    const ou = [CX + OUVIDO[0] * S, CY + OUVIDO[1] * S], bo = [CX + BOCA[0] * S, CY + BOCA[1] * S];
    brilhoP(x, ou[0], ou[1], 50, "255,255,255", 0.6); rotuloP(x, "ouvido", ou[0] - 60, ou[1] - 50, 26, "255,255,255", 0.8);
    // caminho do ar: ondas saindo da boca e dando a volta até o ouvido
    const aA = PT.ss((t - tA + 0.3) / 0.5);
    if (aA > 0) { for (let k = 0; k < 4; k++) { const u = ((t - tA) * 0.6 + k / 4) % 1; x.beginPath(); x.arc(bo[0], bo[1], 30 + u * 120, -0.8, 0.8); x.strokeStyle = `rgba(${CI},${aA * (1 - u)})`; x.lineWidth = 5; x.stroke(); } for (let q = 0; q < 10; q++) { const u = ((t - tA) * 0.35 + q / 10) % 1; const px = PT.lerp(bo[0] + 120, ou[0], u) + Math.sin(u * Math.PI) * 120, py = PT.lerp(bo[1], ou[1], u) - Math.sin(u * Math.PI) * 380; discoP(x, px, py, 7, CI, aA * Math.sin(u * Math.PI)); } }
    // espectro: o que você ouve por dentro (graves fortes)
    const aG = PT.ss((t - tG + 0.3) / 0.5); espectro(x, 540, 1300, 640, 160, 1, CI, aG, "como você se ouve");
  });
};

// =============== 3. o gravador ===============
CENAS.gravacao = (el, c, B) => {
  const tS = B("soar"), tP = B("perde"), tF = B("fina"), tM = B("magra"), tT = B("todos"), tD = B("dentro");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["gra", 330, 70, "o gravador: só o ar", "pt-ci"], ["fin", 330, 76, "mais fina", "pt-am"], ["tod", 330, 60, "é a voz que todos ouvem", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.gra, tS - 0.1, { from: 1.25 }); MD.leave(tl, tx.gra, tF - 0.3); MD.slam(tl, tx.fin, tF - 0.05, { from: 1.3 }); MD.leave(tl, tx.fin, tT - 0.35); MD.slam(tl, tx.tod, tT - 0.05, { from: 1.3 });
  const est = estF(7);
  T.quadro((x, t) => {
    estD(x, est, t);
    // microfone gravando
    const aM = PT.ss((t - tS + 0.4) / 0.5); if (aM > 0) { fCaixa(x, 300, 760, 90, 170, 45, BRC, aM, 5, 0.1); linhaP(x, 300, 860, 300, 940, BRC, aM, 6); for (let k = 0; k < 3; k++) { const u = ((t - tS) * 0.7 + k / 3) % 1; x.beginPath(); x.arc(300, 760, 70 + u * 160, -0.6, 0.6); x.strokeStyle = `rgba(${CI},${aM * (1 - u)})`; x.lineWidth = 5; x.stroke(); } discoP(x, 300, 690, 10, VE, aM * (0.5 + 0.5 * Math.sin(t * 6))); rotuloP(x, "REC", 300, 650, 28, "255,150,160", aM); }
    // os graves somem do espectro
    const aP = PT.ss((t - tP + 0.3) / 0.5); espectro(x, 690, 880, 520, 160, 1 - PT.ss((t - tP) / 1), CI, aM, "gravado");
    // você ouvindo o áudio x os outros
    const aT = PT.ss((t - tT + 0.4) / 0.5); if (aT > 0) { for (let k = 0; k < 6; k++) fPessoa(x, 170 + k * 148, 1250, 1.3, k === 2 ? AM : CI, aT); rotuloP(x, "todo mundo ouve assim", 540, 1340, 30, "200,235,255", aT); }
    const aD = PT.ss((t - tD + 0.3) / 0.5); if (aD > 0) { brilhoP(x, 466, 1210, 90, AM, 0.5 * aD); rotuloP(x, "só você ouvia a de dentro", 466, 1130, 28, "255,226,140", aD); }
  });
};

// =============== 4. faça o teste ===============
CENAS.teste = (el, c, B) => {
  const tT = B("tampa"), tF = B("fala"), tG = B("grave2"), tO = B("ossos2"), tA = B("acostumado");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["fac", 330, 72, "faça o teste agora", "pt-am"], ["gr", 330, 72, "mais grave e mais alto", "pt-la"], ["aco", 330, 62, "o som que você conhece", "pt-ci"]]);
  MD.slam(tl, tx.fac, c.ini + 0.3, { from: 1.3 }); MD.leave(tl, tx.fac, tG - 0.35); MD.slam(tl, tx.gr, tG - 0.05, { from: 1.3 }); MD.leave(tl, tx.gr, tA - 0.35); MD.slam(tl, tx.aco, tA - 0.05, { from: 1.25 });
  const nv = T.nuvem(15100), est = estF(9), CX = 470, CY = 780, S = 1.0;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aF = PT.ss((t - tF + 0.2) / 0.4);
    cabeca(nv, CX, CY, S, 1, aF, t); perfilLinha(x, CX, CY, S, 1);
    // dedo tampando o ouvido
    const aT = PT.ss((t - tT + 0.3) / 0.4); if (aT > 0) { const ou = [CX + OUVIDO[0] * S, CY + OUVIDO[1] * S]; fRR(x, ou[0] - 30, ou[1] - 22 + (1 - aT) * 60, 150, 44, 22); x.fillStyle = `rgba(255,200,170,${0.35 * aT})`; x.fill(); x.strokeStyle = `rgba(255,220,190,${aT})`; x.lineWidth = 4; x.stroke(); }
    espectro(x, 540, 1310, 640, 160, PT.lerp(0.6, 1.4, PT.ss((t - tG) / 0.8)), CI, PT.ss((t - tF) / 0.5), "com os ouvidos tampados");
  });
};

// =============== 5. por que incomoda ===============
CENAS.choque = (el, c, B) => {
  const tF = B("familiar"), tN = B("nervosismo"), tH = B("hesitacao"), tC = B("choque");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["est", 330, 62, "familiar que muda = estranho", "pt-ci", "white-space:normal;left:60px;width:960px"], ["cho", 330, 76, "imaginada x real", "pt-ve"]]);
  MD.slam(tl, tx.est, tF - 0.05, { from: 1.25 }); MD.leave(tl, tx.est, tC - 0.35); MD.slam(tl, tx.cho, tC - 0.05, { from: 1.35 });
  const est = estF(11);
  T.quadro((x, t) => {
    estD(x, est, t);
    // a voz imaginada (lisa e grave) x a voz real (com tremidas)
    const a1 = PT.ss((t - c.ini - 0.5) / 0.5);
    fCaixa(x, 540, 720, 860, 220, 20, LA, a1, 4, 0.04); rotuloP(x, "a voz que você imagina", 540, 630, 30, "255,200,160", a1); ondaSom(x, 540, 740, 760, 50, t, LA, a1, 0.5);
    const a2 = PT.ss((t - tF + 0.3) / 0.5), trem = PT.ss((t - tN + 0.2) / 0.5);
    fCaixa(x, 540, 1060, 860, 220, 20, CI, a2, 4, 0.04); rotuloP(x, "a voz real", 540, 970, 30, "200,235,255", a2);
    x.beginPath(); for (let k = 0; k <= 160; k++) { const u = k / 160, pausa = PT.ss((t - tH) / 0.4) > 0 && u > 0.55 && u < 0.68 ? 0.1 : 1, y = 1080 + Math.sin(u * 60 + t * 6) * 40 * Math.sin(u * Math.PI) * pausa + trem * Math.sin(u * 300 + t * 20) * 8; k ? x.lineTo(110 + u * 860, y) : x.moveTo(110 + u * 860, y); } x.strokeStyle = `rgba(${CI},${a2})`; x.lineWidth = 4; x.stroke();
    if (trem > 0) rotuloP(x, "nervosismo", 300, 1180, 28, "255,150,160", trem); if (t > tH) rotuloP(x, "hesitação", 640, 1180, 28, "255,150,160", PT.ss((t - tH) / 0.4));
    const aC = PT.ss((t - tC + 0.2) / 0.4); if (aC > 0) { brilhoP(x, 540, 900, 300, VE, 0.25 * aC); rotuloP(x, "≠", 540, 900, 110, "255,150,160", aC); }
  });
};

// =============== 6. o experimento de 2013 ===============
CENAS.experimento = (el, c, B) => {
  const tO = B("oitenta"), tE = B("escondida"), tP = B("percebeu"), tA = B("alta"), tG = B("gosta");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ano", 330, 58, "EUA, 2013 · 80 pessoas", "pt-ci"], ["sua", 330, 66, "a sua voz, escondida", "pt-am"], ["gos", 330, 70, "sem saber, você gosta", "pt-ve"]]);
  MD.arrive(tl, tx.ano, tO - 0.2, { y: 14 }); MD.leave(tl, tx.ano, tE - 0.3); MD.slam(tl, tx.sua, tE - 0.05, { from: 1.25 }); MD.leave(tl, tx.sua, tG - 0.4); MD.slam(tl, tx.gos, tG - 0.05, { from: 1.35 });
  const est = estF(13), notas = [3, 2, 4, 3, 2, 3], SUA = 4;
  T.quadro((x, t) => {
    estD(x, est, t);
    const aC = PT.ss((t - tO + 0.5) / 0.6), rev = PT.ss((t - tA + 0.3) / 0.5);
    for (let k = 0; k < 6; k++) {
      const col = k % 2, lin = Math.floor(k / 2), cx = 300 + col * 480, cy = 640 + lin * 250, sua = k === SUA;
      const cor = sua && rev > 0 ? AM : CI; fCaixa(x, cx, cy, 420, 200, 20, cor, aC, 4, sua ? 0.06 + 0.1 * rev : 0.04);
      ondaSom(x, cx, cy - 30, 340, 22, t + k, cor, aC, 0.5 + k * 0.1);
      const v = sua ? Math.round(PT.lerp(3, 5, rev)) : notas[k]; estrelas5(x, cx, cy + 55, PT.ss((t - tO - k * 0.2) / 0.4) > 0 ? v : 0, aC);
      if (sua && t > tP - 0.3) rotuloP(x, rev > 0 ? "VOCÊ" : "?", cx, cy - 75, 30, rev > 0 ? "255,226,140" : "200,235,255", PT.ss((t - tP + 0.3) / 0.4));
      if (sua && rev > 0) brilhoP(x, cx, cy, 260, AM, 0.25 * rev);
    }
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["por dentro: ossos = mais grave", "o gravador só pega o ar", "o áudio é a voz que todos ouvem", "sem saber, você gostaria dela"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const est = estF(17);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    ondaSom(x, 540, 1240, 760, 60, t, CI, 0.6 * sai, 0.6);
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [LA, CI, VD, AM][k], a); brilhoP(x, 160, Y[k], 50, "220,230,255", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
