// Cenas do vídeo "Por que você não consegue fazer cócegas em si mesmo" — pontos de luz na GPU.
// Retenção: desafio no 1º segundo ("tenta agora"), promessa (o truque dos médicos), o cérebro
// que prevê o futuro (assombro), experimento do robô (virada) e dica prática.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const estF = (seed) => ambienteP(240, seed);
const estD = (x, est, t) => desenharAmbiente(x, est, t, "220,200,255", 0.6);
const PELE = "255,190,160", CI = "143,227,255", AM = "255,210,63", RO = "255,110,150";

// mão estilizada (palma + dedos), ang em radianos, s = escala
function mao(x, cx, cy, s, ang, cor, a) {
  if (a <= 0.01) return; x.save(); x.translate(cx, cy); x.rotate(ang);
  x.beginPath(); x.ellipse(0, 0, 60 * s, 70 * s, 0, 0, 6.283); x.fillStyle = `rgba(${cor},${0.18 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 5 * s; x.stroke();
  [[-36, -60, -46, -150], [-12, -68, -14, -175], [12, -68, 16, -170], [34, -58, 44, -140], [55, 10, 120, -40]].forEach(([x0, y0, x1, y1]) => { x.beginPath(); x.moveTo(x0 * s, y0 * s); x.lineTo(x1 * s, y1 * s); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 20 * s; x.lineCap = "round"; x.stroke(); });
  x.restore();
}
// sola do pé (vertical)
function pe(x, cx, cy, s, cor, a, treme = 0, t = 0) {
  if (a <= 0.01) return; const jx = treme * Math.sin(t * 40) * 10, jy = treme * Math.cos(t * 33) * 8;
  x.beginPath(); x.ellipse(cx + jx, cy + jy, 130 * s, 260 * s, 0, 0, 6.283); x.fillStyle = `rgba(${cor},${0.18 * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 6; x.stroke();
  [[-80, -255, 44], [-20, -290, 34], [30, -285, 30], [72, -265, 26], [105, -235, 22]].forEach(([dx, dy, r]) => { discoP(x, cx + jx + dx * s, cy + jy + dy * s, r * s, cor, 0.35 * a); anelP(x, cx + jx + dx * s, cy + jy + dy * s, r * s, cor, a, 4); });
}
// faíscas de cócegas
function faisca(x, cx, cy, t, a, n = 12, R = 120) { if (a <= 0.01) return; for (let k = 0; k < n; k++) { const ang = k / n * 6.283 + t * 2, r1 = R * (0.4 + 0.3 * Math.sin(t * 9 + k)), r2 = r1 + 40; linhaP(x, cx + Math.cos(ang) * r1, cy + Math.sin(ang) * r1, cx + Math.cos(ang) * r2, cy + Math.sin(ang) * r2, k % 2 ? AM : RO, a, 5); } }
// medidor de cócegas (barras)
function medidor(x, cx, cy, v, a, rot = "CÓCEGAS") { if (a <= 0.01) return; for (let k = 0; k < 10; k++) { const on = k < Math.round(v * 10), cor = k < 4 ? "120,255,190" : k < 7 ? "255,210,63" : "255,110,130"; fCaixa(x, cx - 225 + k * 50, cy, 38, 60, 8, on ? cor : "120,128,150", a * (on ? 1 : 0.3), 3, on ? 0.6 : 0.05); } rotuloP(x, rot, cx, cy - 62, 30, "255,255,255", 0.85 * a); }
// pulsos andando num caminho (sinal nervoso)
function pulso(x, pts, t, vel, cor, a, n = 4) { if (a <= 0.01) return; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((p) => x.lineTo(p[0], p[1])); x.strokeStyle = `rgba(${cor},${0.25 * a})`; x.lineWidth = 4; x.stroke(); let L = 0; const seg = []; for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; } for (let q = 0; q < n; q++) { let s = ((t * vel + q / n) % 1) * L, i = 0; while (i < seg.length - 1 && s > seg[i]) { s -= seg[i]; i++; } const u = s / seg[i], px = pts[i][0] + (pts[i + 1][0] - pts[i][0]) * u, py = pts[i][1] + (pts[i + 1][1] - pts[i][1]) * u; brilhoP(x, px, py, 40, cor, 0.7 * a); discoP(x, px, py, 8, "255,255,255", a); } }

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tP = B("pe"), tC = B("contorce"), tT = B("toque"), tF = B("futuro"), tTr = B("truque");
  mostrarGancho(tP + 0.6);
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["voce", 330, 66, "você: nada", "pt-ci"], ["outro", 330, 66, "outra pessoa: socorro!", "pt-ve"], ["fut", 330, 62, "o cérebro adivinha o futuro", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.arrive(tl, tx.voce, tP + 0.5, { y: 14 }); MD.leave(tl, tx.voce, tC - 0.3); MD.slam(tl, tx.outro, tC - 0.05, { from: 1.3 }); MD.leave(tl, tx.outro, tF - 0.6); MD.slam(tl, tx.fut, tF - 0.3, { from: 1.25 });
  const nv = T.nuvem(9100), est = estF(3);
  T.quadro((x, t) => {
    estD(x, est, t);
    const aPe = 1 - PT.ss((t - tF + 0.8) / 0.6), treme = PT.jan(t, tC - 0.1, tT + 0.6, 0.2, 0.5);
    pe(x, 540, 980, 1.25, PELE, aPe, treme, t);
    // a própria mão (azul) e a mão de outra pessoa (rosa) passando na sola
    const aMe = PT.jan(t, tP - 0.5, tC - 0.2, 0.4, 0.3), aOu = PT.jan(t, tC - 0.3, tF - 0.6, 0.3, 0.4), mov = Math.sin(t * 7) * 40;
    mao(x, 700 + mov, 1060, 0.8, -0.6, CI, aMe * aPe); mao(x, 700 + mov, 1060, 0.8, -0.6, RO, aOu * aPe);
    faisca(x, 540, 1000, t, treme * aPe, 14, 200);
    const aB = PT.ss((t - tF + 0.7) / 0.7); if (aB > 0) { fCerebro(nv, 540, 880, 330, aB, { cerebelo: 0.4 * (0.5 + 0.5 * Math.sin(t * 3)) }); rotuloP(x, "?", 540, 1230, 120, AM, aB * PT.ss((t - tTr) / 0.5)); } else nv.total(nv.k);
  });
};

// =============== 2. o cérebro prevê ===============
CENAS.previsao = (el, c, B) => {
  const tO = B("ordem"), tC = B("copia"), tCe = B("cerebelo"), tP = B("prever"), tPr = B("previsto"), tV = B("volume");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ord", 330, 62, "ordem → músculos", "pt-ci"], ["cop", 420, 56, "cópia → cerebelo", "pt-am"], ["vol", 330, 76, "volume abaixado", "pt-ve"]]);
  MD.arrive(tl, tx.ord, tO - 0.1, { y: 14 }); MD.arrive(tl, tx.cop, tC - 0.1, { y: 14 }); MD.leave(tl, [tx.ord, tx.cop], tV - 0.4); MD.slam(tl, tx.vol, tV - 0.05, { from: 1.3 });
  const nv = T.nuvem(9100), est = estF(5), CX = 520, CY = 700, E = 280;
  const cereb = [CX - 0.55 * E, CY + 0.52 * E], caminhoOrdem = [[CX + 40, CY + 60], [CX + 120, CY + 250], [760, 1120]], caminhoCopia = [[CX + 20, CY + 40], [CX - 60, CY + 120], cereb];
  T.quadro((x, t) => {
    estD(x, est, t);
    const aCe = PT.ss((t - tCe + 0.3) / 0.6);
    fCerebro(nv, CX, CY, E, 1, { cerebelo: aCe });
    if (aCe > 0) { brilhoP(x, cereb[0], cereb[1], 120, "80,220,255", 0.5 * aCe); rotuloP(x, "CEREBELO", cereb[0] - 20, cereb[1] + 95, 32, "150,235,255", aCe); }
    pulso(x, caminhoOrdem, t, 0.5, AM, PT.ss((t - tO + 0.2) / 0.5));
    pulso(x, caminhoCopia, t, 0.6, CI, PT.ss((t - tC + 0.2) / 0.5), 3);
    // a mão encostando no braço
    mao(x, 800, 1150, 0.9, -0.3, PELE, PT.ss((t - tO) / 0.6));
    const aPr = PT.ss((t - tP + 0.2) / 0.6);
    if (aPr > 0) { x.setLineDash([10, 10]); anelP(x, 760, 1120, 70 + 8 * Math.sin(t * 4), CI, aPr, 4); x.setLineDash([]); rotuloP(x, "previsão: toque aqui", 760, 1235, 30, "150,235,255", aPr); }
    const aV = PT.ss((t - tPr + 0.2) / 0.5); if (aV > 0) { const v = PT.lerp(0.9, 0.2, PT.ss((t - tV) / 0.8)); medidor(x, 540, 1340, v, aV, "INTENSIDADE DO TOQUE"); }
  });
};

// =============== 3. o susto ===============
CENAS.susto = (el, c, B) => {
  const tS = B("susto"), tBu = B("bu"), tSa = B("sabia"), tSu = B("surpresa"), tP = B("proximo"), tR = B("robo");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["bu", 330, 130, "BU!", "pt-am"], ["sab", 330, 66, "o cérebro já sabia", "pt-ci"], ["sur", 330, 80, "cócegas = surpresa", "pt-ve"], ["rob", 330, 72, "um robô de cócegas", "pt-ci"]]);
  MD.slam(tl, tx.bu, tBu - 0.08, { from: 1.6 }); MD.leave(tl, tx.bu, tSa - 0.3); MD.arrive(tl, tx.sab, tSa - 0.1, { y: 14 }); MD.leave(tl, tx.sab, tSu - 0.3); MD.slam(tl, tx.sur, tSu - 0.05, { from: 1.35 }); MD.leave(tl, tx.sur, tR - 0.4); MD.slam(tl, tx.rob, tR - 0.05, { from: 1.3 });
  const est = estF(7);
  T.quadro((x, t) => {
    estD(x, est, t);
    // pessoa gritando para o espelho: sem reação
    const aE = PT.jan(t, tS - 0.3, tSu - 0.3, 0.4, 0.5);
    if (aE > 0) { fPessoa(x, 330, 1000, 3, CI, aE); fCaixa(x, 760, 960, 300, 520, 20, "200,210,230", aE * 0.8, 5, 0.06); fPessoa(x, 760, 1000, 3, CI, aE * 0.55); const aSa = PT.ss((t - tSa) / 0.5); if (aSa > 0) rotuloP(x, "...", 760, 760, 90, "200,210,230", aSa * aE); }
    // silhueta com toques surpresa aparecendo em lugares aleatórios
    const aSu = PT.jan(t, tSu - 0.3, tR - 0.2, 0.4, 0.4);
    if (aSu > 0) { fPessoa(x, 540, 1040, 5, "200,200,255", aSu * 0.7); const r = prng(Math.floor((t - tSu) * 2.5) + 3); for (let k = 0; k < 3; k++) { const px = 380 + r() * 320, py = 820 + r() * 400; faisca(x, px, py, t, aSu, 8, 50); } }
    // braço robótico
    const aR = PT.ss((t - tR + 0.3) / 0.6);
    if (aR > 0) { const j1 = [300, 1300], j2 = [420, 1050 + Math.sin(t * 2) * 20], j3 = [650, 980 + Math.cos(t * 2) * 30]; linhaP(x, j1[0], j1[1], j2[0], j2[1], "200,210,230", aR, 26); linhaP(x, j2[0], j2[1], j3[0], j3[1], "200,210,230", aR, 18); [j1, j2, j3].forEach((j) => { discoP(x, j[0], j[1], 22, "150,160,190", aR); anelP(x, j[0], j[1], 22, CI, aR, 4); }); for (let k = 0; k < 9; k++) linhaP(x, j3[0] + 10, j3[1] - 30 + k * 7, j3[0] + 70, j3[1] - 40 + k * 9, AM, aR, 3); }
  });
};

// =============== 4. o experimento ===============
CENAS.robo2 = (el, c, B) => {
  const tA = B("alavanca"), tE = B("escova"), tS = B("sematraso"), tD = B("decimos"), tEr = B("errava"), tV = B("voltavam"), tM = B("mesma");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["ano", 330, 60, "Blakemore, Londres, 1998", "pt-ci"], ["at", 330, 86, "atraso: 0,2 s", "pt-am"], ["mes", 330, 66, "cócegas em si mesma", "pt-ve"]]);
  MD.arrive(tl, tx.ano, c.ini + 0.5, { y: 14 }); MD.leave(tl, tx.ano, tD - 0.4); MD.slam(tl, tx.at, tD - 0.05, { from: 1.3 }); MD.leave(tl, tx.at, tM - 0.4); MD.slam(tl, tx.mes, tM - 0.05, { from: 1.3 });
  const est = estF(9);
  T.quadro((x, t) => {
    estD(x, est, t);
    // alavanca (a pessoa mexe) → fio → robô → escova na mão
    const aA = PT.ss((t - c.ini - 0.8) / 0.6), mov = Math.sin(t * 3);
    if (aA > 0) { linhaP(x, 230, 1200, 230 + mov * 50, 1050, "200,210,230", aA, 14); discoP(x, 230 + mov * 50, 1050, 26, AM, aA); mao(x, 230 + mov * 50, 1010, 0.6, 0, PELE, aA); fCaixa(x, 230, 1220, 160, 50, 12, "200,210,230", aA, 4, 0.1); rotuloP(x, "alavanca", 230, 1290, 30, "255,255,255", aA); }
    const atraso = PT.ss((t - tD + 0.3) / 0.5), mov2 = Math.sin((t - 0.6 * atraso) * 3);
    const aE = PT.ss((t - c.ini - 1.6) / 0.6);
    if (aE > 0) { x.setLineDash([8, 10]); linhaP(x, 300, 1220, 560, 1220, CI, aE * 0.6, 3); x.setLineDash([]); fCaixa(x, 620, 1220, 140, 90, 16, "200,210,230", aE, 4, 0.12); rotuloP(x, "robô", 620, 1220, 30, "255,255,255", aE); linhaP(x, 620, 1175, 760 + mov2 * 50, 900, "200,210,230", aE, 12); for (let k = 0; k < 8; k++) linhaP(x, 760 + mov2 * 50 - 30 + k * 8, 900, 760 + mov2 * 50 - 34 + k * 9, 960, AM, aE, 3); mao(x, 800, 1010, 0.85, 3.14, PELE, aE); }
    // relógio do atraso
    if (atraso > 0) { anelP(x, 880, 620, 70, AM, atraso, 6); const an = -Math.PI / 2 + (t - tD) * 2; linhaP(x, 880, 620, 880 + Math.cos(an) * 55, 620 + Math.sin(an) * 55, AM, atraso, 5); }
    // medidor de cócegas: baixo sem atraso, alto com atraso
    const v = PT.lerp(0.15, 0.95, PT.ss((t - tEr) / 0.8));
    medidor(x, 540, 1360, v, PT.ss((t - tS + 0.3) / 0.5), "CÓCEGAS");
    faisca(x, 800, 1010, t, PT.ss((t - tV + 0.2) / 0.5), 12, 120);
  });
};

// =============== 5. o truque dos médicos ===============
CENAS.medico = (el, c, B) => {
  const tB = B("barriga"), tC = B("cocegas"), tM = B("mao"), tG = B("guia"), tP = B("prever"), tD = B("diminuem");
  const T = telaGPU(el, c);
  const tx = palcoTexto(el, [["tru", 330, 70, "o truque do médico", "pt-am"], ["mao", 330, 62, "sua mão por cima da dele", "pt-ci", "white-space:normal;left:60px;width:960px"], ["dim", 330, 80, "as cócegas diminuem", "pt-ve"]]);
  MD.slam(tl, tx.tru, c.ini + 0.4, { from: 1.3 }); MD.leave(tl, tx.tru, tM - 0.4); MD.slam(tl, tx.mao, tM - 0.05, { from: 1.25 }); MD.leave(tl, tx.mao, tD - 0.4); MD.slam(tl, tx.dim, tD - 0.05, { from: 1.3 });
  const est = estF(11);
  T.quadro((x, t) => {
    estD(x, est, t);
    // barriga (tronco deitado)
    const aB = PT.ss((t - tB + 0.4) / 0.6);
    if (aB > 0) { x.beginPath(); x.ellipse(540, 1000, 380, 190, 0, 0, 6.283); x.fillStyle = `rgba(${PELE},${0.15 * aB})`; x.fill(); x.strokeStyle = `rgba(${PELE},${aB})`; x.lineWidth = 6; x.stroke(); discoP(x, 540, 1030, 8, PELE, aB); }
    const mov = Math.sin(t * 2.2) * 30;
    mao(x, 540 + mov, 960, 1.0, 0.2, "150,200,255", PT.ss((t - tB) / 0.6));                       // mão do médico
    mao(x, 540 + mov, 935, 0.95, 0.2, PELE, PT.ss((t - tM + 0.2) / 0.6));                        // mão do paciente por cima
    const tremor = PT.jan(t, tC - 0.2, tM + 0.4, 0.3, 0.6); faisca(x, 540 + mov, 980, t, tremor, 10, 130);
    if (t > tG - 0.3) { const aG = PT.ss((t - tG + 0.3) / 0.5); rotuloP(x, "ela guia → o cérebro prevê", 540, 1290, 36, "150,235,255", aG); }
    const v = t < tM ? 0.9 : PT.lerp(0.9, 0.25, PT.ss((t - tP) / 1.0)); medidor(x, 540, 700, v, PT.ss((t - tC + 0.3) / 0.5), "CÓCEGAS");
  });
};

// =============== 6. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c);
  const Y = [480, 640, 800, 960], textos = ["o cérebro manda uma cópia", "o cerebelo prevê o toque", "o previsto perde força", "cócegas precisam de surpresa"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const nv = T.nuvem(9100), est = estF(13);
  T.quadro((x, t) => {
    estD(x, est, t);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    fCerebro(nv, 540, 1230, 200, 0.6 * sai, { cerebelo: 0.6 });
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, [CI, AM, "120,255,190", RO][k], a); brilhoP(x, 160, Y[k], 50, "255,200,220", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 1.4);
};
