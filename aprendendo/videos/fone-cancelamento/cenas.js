// Cenas do vídeo "Como o fone com cancelamento de ruído apaga o som" — padrão novo (out/2026): objetos em
// pontos de luz com volume, pontos que se transformam, câmera com profundidade e física.
// Retenção: paradoxo (criar silêncio tocando mais som), previsão ("pensa rápido: duas ondas iguais, uma ao
// contrário?"), virada histórica (a ideia dos anos 30 esperou a eletrônica), pergunta e a promessa (a voz do lado).

const MD = MotionDirector;
const planoC = (t, a, b, e = 0.4, s = 0.4) => PT.jan(t, a, b, e, s);
const FUNDOF = fundoProfundo(51);
const FF = {
  aviao: formaPontos("airplane-in-flight", 10000), fone: formaPontos("headphones", 12000), fala: formaPontos("user-sound", 10000), interr: formaTexto("?", 9000),
  alto: formaPontos("speaker-high", 10000), orelha: formaPontos("ear", 10000), papel: formaPontos("scroll", 9000), lampada: formaPontos("lightbulb", 8000),
  ampulheta: formaPontos("hourglass-medium", 9000), mic: formaPontos("microphone", 2500), chip: formaPontos("cpu", 10000), notas: formaPontos("music-notes", 5000),
  ms: formaTexto("< 1 ms", 12000), casa: formaPontos("armchair", 9000), sala: formaPontos("house", 10000), ventilador: formaPontos("fan", 6000),
  carro: formaPontos("car-profile", 6000), conversa: formaPontos("chats", 6000), ok: formaPontos("check-circle", 3000), nao: formaPontos("x-circle", 3000),
  zero: formaTexto("0", 6000),
};
// onda em pontos com deslocamento qualquer: fy(u) devolve o deslocamento em px (u de 0 a 1 ao longo da onda)
function ondaF(nv, x0, x1, cy, fy, cor, a, i, esp = 1) {
  if (a <= 0.01) return i; const n = Math.round((x1 - x0) / 2.2), cam = Math.max(1, Math.round(esp * 4));
  for (let c = 0; c < cam; c++) for (let k = 0; k <= n && i < nv.n; k++) { const u = k / n, env = Math.sin(u * Math.PI); nv.ponto(i++, x0 + u * (x1 - x0), cy + fy(u) * env + (c - (cam - 1) / 2) * 3.2, cor[0], cor[1], cor[2], a * (0.5 + 0.5 * env) * (2.2 / Math.sqrt(cam)), 4); }
  return i;
}
const senoF = (amp, ciclos, t, vel = 5, fase = 0) => (u) => amp * Math.sin(u * ciclos * 6.283 - t * vel + fase);
// ruído "de voz": vários agudos misturados que mudam o tempo todo
const vozF = (amp, t) => (u) => amp * (0.5 * Math.sin(u * 23 - t * 9) + 0.3 * Math.sin(u * 51 + t * 13 + Math.sin(t * 3) * 2) + 0.25 * Math.sin(u * 87 - t * 21) * Math.sin(t * 2.3 + u * 5));

// =============== 1. gancho ===============
CENAS.abertura = (el, c, B) => {
  const tA = B("apaga"), tSi = B("silencio"), tM = B("maissom"), tB = B("botao"), tS = B("some"), tP = B("promessa");
  const p2 = tSi - 0.9, p3 = tB - 0.6, p4 = tP - 2.6;
  mostrarGancho(p2 - 0.2);
  const T = telaGPU(el, c), nv = T.nuvem(90000);
  const tx = palcoTexto(el, [["sil", 330, 66, "pra criar silêncio", "pt-ci"], ["mai", 420, 56, "ele toca mais som", "pt-am"], ["bot", 330, 70, "e o ronco some", "pt-ci"], ["voz", 330, 60, "e a voz do lado? no final", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.sil, tSi - 0.4, { from: 1.3 }); MD.slam(tl, tx.mai, tM - 0.2, { from: 1.3 }); MD.leave(tl, [tx.sil, tx.mai], p3 - 0.1); MD.slam(tl, tx.bot, tS - 0.5, { from: 1.35 }); MD.leave(tl, tx.bot, p4 - 0.1); MD.slam(tl, tx.voz, p4 + 0.2, { from: 1.2 });
  const CAM = cameraProf([[0, { zoom: 1.25, foco: 1 }], [p2, { zoom: 1.0, foco: 1 }]]);
  T.quadro((x, t) => {
    const cam = CAM(t); let i = desenharFundo(nv, FUNDOF, t, cam, [0.75, 0.82, 1], 1, 0);
    // plano 1 (quadro 0): o avião rugindo; uma onda igual, ao contrário, chega e as duas se apagam
    const a1 = 1 - PT.ss((t - p2) / 0.45);
    if (a1 > 0.01) {
      i = desenharForma(nv, FF.aviao, { cx: 560, cy: 640, esc: 560, rot: -0.12, cam, z: 1.4, cor: CORF.branco, a: a1, t, i0: i });
      const can = PT.ss((t - tA + 0.3) / 1.2), ent = PT.ss((t - tA + 1.0) / 0.6), [dx, dy] = FIS.tremor(t, 0, 6 * (1 - can), 10);
      i = ondaF(nv, 60, 1020, 1000 + dy, senoF(110 * (1 - can), 3, t), CORF.laranja, a1, i, 2.2);
      i = ondaF(nv, 60 + (1 - ent) * 900, 1020 + (1 - ent) * 900, 1200 - 200 * can, senoF(110, 3, t, 5, Math.PI), CORF.ciano, a1 * ent * (1 - can * 0.85), i, 1.6);
      if (can > 0.5) brilhoP(x, 540, 1000, 300, "143,227,255", 0.25 * can * a1);
    }
    // plano 2: o fone toca mais som (ondas saindo das conchas)
    const a2 = planoC(t, p2, p3);
    if (a2 > 0.01) { const e = FIS.chegar(t, p2, 0.6); i = desenharForma(nv, FF.fone, { cx: 540, cy: 920, esc: 640 * Math.max(0.01, e), cor: CORF.branco, borda: CORF.ciano, a: a2, t, giro: 0.2 * Math.sin(t * 0.8), i0: i }); const ms = PT.ss((t - tM + 0.3) / 0.4); for (const lado of [-1, 1]) for (let k = 0; k < 3; k++) { const u = ((t * 0.8 + k / 3) % 1); anelP(x, 540 + lado * 230, 1060, 40 + u * 220, "255,210,63", a2 * ms * (1 - u) * 0.8, 4); } }
    // plano 3: aperta o botão e o ronco some (o fone dá um pulinho; a onda do avião se achata)
    const a3 = planoC(t, p3, p4);
    if (a3 > 0.01) {
      const [sx, sy] = FIS.impacto(t, tB - 0.05, 0.15), so = PT.ss((t - tS + 0.6) / 0.8);
      i = desenharForma(nv, FF.aviao, { cx: 540, cy: 600, esc: 380, rot: -0.12, cor: CORF.branco, a: a3 * (1 - 0.5 * so), t, i0: i });
      i = desenharForma(nv, FF.fone, { cx: 540, cy: 1050, esc: 420, sx, sy, cor: CORF.ciano, a: a3, t, i0: i });
      discoP(x, 540 + 190 * sx, 1110, 14, "255,226,140", a3 * PT.jan(t, tB - 0.3, tB + 0.6, 0.1, 0.3)); brilhoP(x, 540 + 190 * sx, 1110, 50, "255,210,63", a3 * PT.jan(t, tB - 0.3, tB + 0.6, 0.1, 0.3));
      i = ondaF(nv, 80, 1000, 820, senoF(70 * (1 - so), 3, t), CORF.laranja, a3, i, 1.6);
    }
    // plano 4: a voz do lado — o fone vira uma pessoa falando com um "?"
    const a4 = PT.ss((t - p4) / 0.4);
    if (a4 > 0.01) { i = morfo(nv, FF.fone, FF.fala, PT.ss((t - p4) / 0.9), { de: { cx: 540, cy: 1050, esc: 420, cor: CORF.ciano }, para: { cx: 470, cy: 960, esc: 560, cor: CORF.amarelo }, t, a: a4, onda: 0.3, curva: 0.35, i0: i }); const e = FIS.chegar(t, p4 + 0.6, 0.5); i = desenharForma(nv, FF.interr, { cx: 820, cy: 760, esc: 260 * Math.max(0.01, e), cor: CORF.ciano, a: a4, t, i0: i }); }
    nv.total(i);
  });
};

// =============== 2. o que é o som ===============
CENAS.onda = (el, c, B) => {
  const tE = B("empurrado"), tC = B("corda"), tD = B("desce"), tT = B("timpano"), tP = B("pensa"), tCo = B("contrario");
  const pB = tC - 0.5, pC = tT - 0.8, pD = tP - 0.4;
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["emp", 330, 62, "ar empurrado e puxado", "pt-ci"], ["cor", 330, 66, "sobe, desce, sobe, desce", "pt-am"], ["tim", 330, 66, "o tímpano vibra", "pt-ci"], ["pen", 330, 76, "pensa rápido", "pt-am"], ["con", 420, 34, "duas iguais, uma ao contrário?", "pt-fino"]]);
  MD.slam(tl, tx.emp, tE - 0.4, { from: 1.25 }); MD.leave(tl, tx.emp, pB - 0.1); MD.slam(tl, tx.cor, tC + 0.6, { from: 1.25 }); MD.leave(tl, tx.cor, pC - 0.1);
  MD.slam(tl, tx.tim, tT - 0.4, { from: 1.25 }); MD.leave(tl, tx.tim, pD - 0.1); MD.slam(tl, tx.pen, tP - 0.1, { from: 1.4 }); MD.arrive(tl, tx.con, tP + 0.9, { y: 14 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOF, t, null, [0.75, 0.82, 1], 1, 0);
    // A: o alto-falante empurra o ar: faixas de pontos que se apertam e se soltam
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) {
      const [sx] = FIS.impacto(t, Math.floor(t * 3) / 3, 0.08); i = desenharForma(nv, FF.alto, { cx: 220, cy: 960, esc: 380, sx: 1 + (sx - 1), cor: CORF.branco, a: aA, t, i0: i });
      for (let k = 0; k < 1800 && i < nv.n; k++) { const u = (k * 0.7548776662) % 1, v = (k * 0.5698402910) % 1, x0 = 380 + u * 640, dens = 0.5 + 0.5 * Math.sin(x0 * 0.03 - t * 7); if (((k * 0.31) % 1) > dens) continue; nv.ponto(i++, x0 + 12 * Math.sin(x0 * 0.03 - t * 7), 760 + v * 400, 0.56, 0.89, 1, aA * 0.55, 3.2); }
    }
    // B: a corda balançando, com uma bolinha que sobe e desce
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { i = ondaF(nv, 80, 1000, 960, senoF(160, 1.5, t, 4), CORF.amarelo, aB, i, 1.6); const yb = 960 + 160 * Math.sin(0.5 * 1.5 * 6.283 - t * 4); discoP(x, 540, yb, 22, "255,240,190", aB); brilhoP(x, 540, yb, 70, "255,210,63", 0.6 * aB); }
    // C: a onda chega na orelha e o tímpano vibra
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { const [dx, dy] = FIS.tremor(t, tT - 0.1, 8, 0.6); i = desenharForma(nv, FF.orelha, { cx: 760 + dx, cy: 960 + dy, esc: 440, cor: CORF.branco, borda: CORF.amarelo, a: aC, t, i0: i }); i = ondaF(nv, 60, 560, 960, senoF(90, 3, t, 7), CORF.amarelo, aC, i, 1.4); }
    // D: pensa rápido — duas ondas iguais, uma ao contrário, e um "?"
    const aD = PT.ss((t - pD) / 0.45);
    if (aD > 0.01) { i = ondaF(nv, 80, 1000, 760, senoF(110, 2.5, t, 4), CORF.laranja, aD, i, 1.6); i = ondaF(nv, 80, 1000, 1180, senoF(110, 2.5, t, 4, Math.PI), CORF.ciano, aD * PT.ss((t - tP - 0.5) / 0.5), i, 1.6); const e = FIS.chegar(t, tCo - 0.6, 0.5); i = desenharForma(nv, FF.interr, { cx: 540, cy: 970, esc: 240 * Math.max(0.01, e), cor: CORF.amarelo, a: aD, t, i0: i }); }
    nv.total(i);
  });
};

// =============== 3. a anti-onda ===============
CENAS.anti = (el, c, B) => {
  const tD = B("desce2"), tC = B("cancela"), tS = B("silencio2"), tT = B("trinta"), tL = B("lenta");
  const pB = tT - 1.8, pC = tL - 1.0;
  const T = telaGPU(el, c), nv = T.nuvem(70000);
  const tx = palcoTexto(el, [["des", 330, 62, "uma sobe, a outra desce", "pt-ci"], ["can", 330, 72, "uma cancela a outra", "pt-am"], ["sil", 330, 86, "silêncio", "pt-ci"], ["tri", 330, 62, "patenteada nos anos 30", "pt-am"], ["len", 330, 62, "mas a eletrônica era lenta", "pt-ve", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.des, c.ini + 0.3, { from: 1.25 }); MD.leave(tl, tx.des, tC - 0.4); MD.slam(tl, tx.can, tC - 0.2, { from: 1.3 }); MD.leave(tl, tx.can, tS - 0.4); MD.slam(tl, tx.sil, tS - 0.2, { from: 1.5 }); MD.leave(tl, tx.sil, pB - 0.1);
  MD.slam(tl, tx.tri, tT - 0.6, { from: 1.25 }); MD.leave(tl, tx.tri, pC - 0.1); MD.slam(tl, tx.len, tL - 0.4, { from: 1.2 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOF, t, null, [0.75, 0.82, 1], 1, 0);
    // A: as duas ondas se aproximam até a mesma linha e somem (sobra uma linha fina brilhando)
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) {
      const j = PT.inOut((t - tD + 0.2) / (tC - tD + 0.6)), so = PT.ss((t - tC) / 0.8);
      i = ondaF(nv, 80, 1000, PT.lerp(760, 960, j), senoF(110 * (1 - so), 2.5, t, 4), CORF.laranja, aA * (1 - 0.7 * so), i, 1.6);
      i = ondaF(nv, 80, 1000, PT.lerp(1180, 960, j), senoF(110 * (1 - so), 2.5, t, 4, Math.PI), CORF.ciano, aA * (1 - 0.7 * so), i, 1.6);
      const si = PT.ss((t - tS + 0.4) / 0.5); if (si > 0) { linhaP(x, 80, 960, 1000, 960, "143,227,255", aA * si * 0.9, 4); brilhoP(x, 540, 960, 380, "143,227,255", 0.25 * si * aA); }
    }
    // B: a patente dos anos 30: um papel com uma lâmpada (a ideia)
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const e = FIS.chegar(t, pB + 0.1, 0.6); i = desenharForma(nv, FF.papel, { cx: 470, cy: 980, esc: 560 * Math.max(0.01, e), rot: -0.08, cor: CORF.branco, a: aB, t, i0: i }); const l = FIS.chegar(t, tT - 0.4, 0.5); i = desenharForma(nv, FF.lampada, { cx: 800, cy: 730, esc: 260 * Math.max(0.01, l), cor: CORF.amarelo, a: aB, t, i0: i }); rotuloP(x, "anos 30", 470, 1290, 52, "255,226,140", aB * PT.cl(e)); }
    // C: a eletrônica lenta — o papel vira uma ampulheta que vira devagar
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) i = morfo(nv, FF.papel, FF.ampulheta, PT.ss((t - pC) / 0.8), { de: { cx: 470, cy: 980, esc: 560, cor: CORF.branco }, para: { cx: 540, cy: 960, esc: 560, cor: CORF.rosa, rot: 0.3 * PT.ss((t - tL) / 2.0) * Math.PI }, t, a: aC, i0: i });
    nv.total(i);
  });
};

// =============== 4. dentro do seu fone ===============
CENAS.fone = (el, c, B) => {
  const tM = B("mics"), tC = B("chip"), tA = B("antionda"), tR = B("rapido");
  const pB = tC - 0.5, pC = tA - 0.6, pD = tR - 1.4;
  const T = telaGPU(el, c), nv = T.nuvem(80000);
  const tx = palcoTexto(el, [["mic", 330, 62, "microfones escutam o barulho", "pt-ci", "white-space:normal;left:60px;width:960px"], ["chi", 330, 62, "um chip calcula o contrário", "pt-am"], ["ant", 330, 62, "e toca a anti-onda", "pt-ci"], ["ms", 330, 66, "em menos de 1 milésimo", "pt-am"]]);
  MD.slam(tl, tx.mic, tM - 0.4, { from: 1.2 }); MD.leave(tl, tx.mic, pB - 0.1); MD.slam(tl, tx.chi, tC - 0.3, { from: 1.25 }); MD.leave(tl, tx.chi, pC - 0.1); MD.slam(tl, tx.ant, tA - 0.4, { from: 1.25 }); MD.leave(tl, tx.ant, pD - 0.1); MD.slam(tl, tx.ms, pD + 0.2, { from: 1.3 });
  const CAM = cameraProf([[c.ini, { zoom: 1.0 }], [tM, { zoom: 1.0 }], [pB, { zoom: 1.5, x: 330, y: 1000 }]]);
  T.quadro((x, t) => {
    const cam = CAM(t); let i = desenharFundo(nv, FUNDOF, t, cam, [0.75, 0.82, 1], 1, 0);
    // A: o fone; os microfones (pontos nas conchas) acendem e o barulho chega
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) { i = desenharForma(nv, FF.fone, { cx: 540, cy: 960, esc: 700, cam, z: 1, cor: CORF.branco, borda: CORF.ciano, a: aA, t, i0: i }); for (const lado of [-1, 1]) { const m = FIS.chegar(t, tM - 0.2 + (lado > 0 ? 0.12 : 0), 0.5), [mx, my, k] = projP(cam, 540 + lado * 300, 1060, 1); i = desenharForma(nv, FF.mic, { cx: mx, cy: my, esc: 120 * k * Math.max(0.01, m), cor: CORF.amarelo, a: aA, t, i0: i }); } i = ondaF(nv, 40, 1040, 600, senoF(50, 4, t, 6), CORF.laranja, aA * 0.8, i, 1); }
    // B: o chip calcula (onda entra, a de cabeça para baixo sai)
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const e = FIS.chegar(t, pB, 0.6); i = desenharForma(nv, FF.chip, { cx: 540, cy: 960, esc: 420 * Math.max(0.01, e), cor: CORF.verde, a: aB, t, i0: i }); i = ondaF(nv, 40, 350, 960, senoF(70, 1.5, t, 6), CORF.laranja, aB, i, 1.2); i = ondaF(nv, 730, 1040, 960, senoF(70, 1.5, t, 6, Math.PI), CORF.ciano, aB * PT.ss((t - tC) / 0.5), i, 1.2); }
    // C: o alto-falante toca a anti-onda junto com a música
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { i = desenharForma(nv, FF.alto, { cx: 260, cy: 960, esc: 380, cor: CORF.branco, a: aC, t, i0: i }); i = ondaF(nv, 420, 1000, 900, senoF(80, 2, t, 6, Math.PI), CORF.ciano, aC, i, 1.4); const n = FIS.chegar(t, tA + 0.2, 0.6); i = desenharForma(nv, FF.notas, { cx: 720, cy: 1180 + FIS.flutua(t, 0, 10), esc: 220 * Math.max(0.01, n), cor: CORF.rosa, a: aC, t, i0: i }); }
    // D: menos de um milésimo de segundo
    const aD = PT.ss((t - pD) / 0.4);
    if (aD > 0.01) i = morfo(nv, FF.alto, FF.ms, PT.ss((t - pD) / 0.8), { de: { cx: 260, cy: 960, esc: 380, cor: CORF.branco }, para: { cx: 540, cy: 940, esc: 900, cor: CORF.amarelo }, t, a: aD, onda: 0.3, curva: 0.35, i0: i });
    nv.total(i);
  });
};

// =============== 5. a pergunta para os comentários ===============
CENAS.pergunta = (el, c, B) => {
  const tC = B("comenta"), tS = B("som2"), tT = B("total"), tN = B("simnao");
  const pB = tC + 0.5, pC = tT + 0.1;
  const T = telaGPU(el, c), nv = T.nuvem(50000);
  const tx = palcoTexto(el, [["dif", 330, 70, "pergunta difícil", "pt-am"], ["com", 330, 62, "responde nos comentários", "pt-ci"], ["sal", 330, 62, "uma sala inteira em silêncio total?", "pt-ci", "white-space:normal;left:60px;width:960px"], ["sim", 330, 86, "sim ou não?", "pt-am"]]);
  MD.slam(tl, tx.dif, c.ini + 0.3, { from: 1.35 }); MD.leave(tl, tx.dif, tC - 0.6); MD.slam(tl, tx.com, tC - 0.35, { from: 1.25 }); MD.leave(tl, tx.com, pB - 0.1); MD.slam(tl, tx.sal, pB + 0.1, { from: 1.15 }); MD.leave(tl, tx.sal, pC - 0.1); MD.slam(tl, tx.sim, pC + 0.1, { from: 1.45 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOF, t, null, [0.75, 0.82, 1], 1, 0);
    const aA = FIS.chegar(t, c.ini + 0.1, 0.6) * (1 - PT.ss((t - pB) / 0.4));
    i = balaoPergunta(nv, x, t, PT.cl(aA), 540, 930, 620, i);
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const e = FIS.chegar(t, pB, 0.6); i = desenharForma(nv, FF.sala, { cx: 540, cy: 960, esc: 680 * Math.max(0.01, e), cor: CORF.branco, a: aB * 0.8, t, i0: i }); i = desenharForma(nv, FF.casa, { cx: 540, cy: 1070, esc: 240 * Math.max(0.01, e), cor: CORF.ciano, a: aB, t, i0: i }); i = ondaF(nv, 200, 880, 760, senoF(30 * (1 - PT.ss((t - tS) / 1.5)), 3, t), CORF.laranja, aB, i, 1); }
    const aC = PT.ss((t - pC) / 0.4);
    if (aC > 0.01) { i = balaoPergunta(nv, x, t, aC, 540, 900, 580, i); setaComentarios(x, aC, t); }
    nv.total(i);
  });
};

// =============== 6. por que a voz não some ===============
CENAS.voz = (el, c, B) => {
  const tL = B("lado"), tG = B("graves"), tP = B("prever"), tA = B("agudo"), tC = B("conversa");
  const pB = tG - 1.0, pC = tA - 1.0, pD = tC - 2.6;
  const T = telaGPU(el, c), nv = T.nuvem(80000);
  const tx = palcoTexto(el, [["lad", 330, 62, "por que a voz não some?", "pt-am"], ["gra", 330, 62, "ronco: grave e constante", "pt-ci"], ["pre", 420, 50, "dá pra prever", "pt-fino"], ["agu", 330, 62, "a voz muda o tempo todo", "pt-ve"], ["con", 330, 58, "melhor contra ar-condicionado e trânsito", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.lad, tL - 0.6, { from: 1.25 }); MD.leave(tl, tx.lad, pB - 0.1); MD.slam(tl, tx.gra, tG - 0.5, { from: 1.25 }); MD.arrive(tl, tx.pre, tP - 0.4, { y: 14 }); MD.leave(tl, [tx.gra, tx.pre], pC - 0.1);
  MD.slam(tl, tx.agu, tA - 0.6, { from: 1.25 }); MD.leave(tl, tx.agu, pD - 0.1); MD.slam(tl, tx.con, pD + 0.2, { from: 1.15 });
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOF, t, null, [0.75, 0.82, 1], 1, 0);
    // A: a pessoa falando ao lado do fone
    const aA = PT.ss((t - c.ini) / 0.4) * (1 - PT.ss((t - pB) / 0.45));
    if (aA > 0.01) { i = desenharForma(nv, FF.fala, { cx: 330, cy: 960, esc: 500, cor: CORF.amarelo, a: aA, t, i0: i }); i = desenharForma(nv, FF.fone, { cx: 800, cy: 960, esc: 360, cor: CORF.ciano, a: aA, t, i0: i }); i = ondaF(nv, 500, 680, 900, vozF(40, t), CORF.amarelo, aA, i, 0.8); }
    // B: o ronco (grave e regular) + a anti-onda = quase nada
    const aB = planoC(t, pB, pC);
    if (aB > 0.01) { const so = PT.ss((t - tP + 0.3) / 0.8); i = ondaF(nv, 80, 1000, 820, senoF(100, 1.5, t, 3), CORF.laranja, aB, i, 2); i = ondaF(nv, 80, 1000, 1060, senoF(100, 1.5, t, 3, Math.PI), CORF.ciano, aB, i, 1.4); i = ondaF(nv, 80, 1000, 1260, senoF(100 * (1 - so), 1.5, t, 3), CORF.branco, aB * 0.8, i, 1); const e = FIS.chegar(t, tP, 0.5); i = desenharForma(nv, FF.ok, { cx: 980 - 80, cy: 1260, esc: 110 * Math.max(0.01, e), cor: CORF.verde, a: aB, t, i0: i }); }
    // C: a voz (aguda e mudando) — a anti-onda chega atrasada e sobra barulho
    const aC = planoC(t, pC, pD);
    if (aC > 0.01) { const atr = 0.25; i = ondaF(nv, 80, 1000, 820, vozF(90, t), CORF.amarelo, aC, i, 1); i = ondaF(nv, 80, 1000, 1060, (u) => -vozF(90, t - atr)(u), CORF.ciano, aC, i, 1); i = ondaF(nv, 80, 1000, 1260, (u) => vozF(90, t)(u) - vozF(90, t - atr)(u), CORF.branco, aC * 0.8, i, 0.8); const e = FIS.chegar(t, tA + 0.6, 0.5); i = desenharForma(nv, FF.nao, { cx: 900, cy: 1260, esc: 110 * Math.max(0.01, e), cor: CORF.vermelho, a: aC, t, i0: i }); }
    // D: funciona melhor contra ar-condicionado e trânsito do que contra conversa
    const aD = PT.ss((t - pD) / 0.4);
    if (aD > 0.01) [[FF.ventilador, 240, FF.ok, CORF.verde], [FF.carro, 540, FF.ok, CORF.verde], [FF.conversa, 840, FF.nao, CORF.vermelho]].forEach(([F, px, M, cor], k) => { const e = FIS.cascata(t, pD + 0.1, k, 0.3, 0.55); i = desenharForma(nv, F, { cx: px, cy: 940, esc: 230 * Math.max(0.01, e), sx: F === FF.carro ? -1 : 1, cor: CORF.branco, a: aD, t, i0: i }); const m = FIS.chegar(t, pD + 0.6 + k * 0.4, 0.5); i = desenharForma(nv, M, { cx: px, cy: 1140, esc: 100 * Math.max(0.01, m), cor, a: aD, t, i0: i }); });
    nv.total(i);
  });
};

// =============== 7. resumo ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3")], tC = B("cta");
  const T = telaGPU(el, c), nv = T.nuvem(40000);
  const Y = [560, 760, 960], textos = ["som é uma onda", "a onda ao contrário cancela", "o fone calcula a anti-onda na hora"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 50, s, "", "left:250px;width:780px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 1.0);
  const IC = [[FF.alto, CORF.laranja], [FF.zero, CORF.ciano], [FF.fone, CORF.amarelo]];
  T.quadro((x, t) => {
    let i = desenharFundo(nv, FUNDOF, t, null, [0.75, 0.82, 1], 1, 0);
    const sai = 1 - PT.ss((t - tC - 1.0) / 0.5);
    tP.forEach((tp, k) => { const e = FIS.chegar(t, tp - 0.2, 0.5), ent = FIS.cascata(t, c.ini + 0.3, k, 0.12, 0.6); i = desenharForma(nv, IC[k][0], { cx: 160, cy: Y[k] + 10, esc: 130 * Math.max(0.01, Math.min(1, ent)), cor: IC[k][1], a: sai * Math.min(1, ent) * (0.3 + 0.7 * PT.cl(e)), t, i0: i }); });
    const so = PT.ss((t - c.ini - 1) / 3); i = ondaF(nv, 120, 960, 1230, senoF(60 * (1 - so), 2, t, 4), CORF.laranja, 0.7 * sai, i, 1.2); i = ondaF(nv, 120, 960, 1230, senoF(60 * (1 - so), 2, t, 4, Math.PI), CORF.ciano, 0.7 * sai * PT.ss((t - c.ini - 0.5) / 0.5), i, 1.2);
    nv.total(i);
  });
  cartaoFinal(el, tC + 1.4);
};
