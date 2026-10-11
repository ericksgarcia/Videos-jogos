// Cenas do vídeo "Haja luz" (Gênesis 1:3) — Luz da Palavra, pontos de luz na GPU.
// Retenção: quadro 0 já é uma nebulosa dourada em movimento; laço aberto ("um detalhe que quase
// ninguém percebe"), pago na cena "detalhe"; algo muda a cada 1,5–2,5 s (morph luz → terra → mar →
// sol → ser humano); pergunta de escolha fácil (1 ou 2) com seta para os comentários na direita.
// Figuras humanas: só silhueta de luz, sem rosto. Citação de Gn 1:3 na Almeida; 2Co 4:6 parafraseado (cf.).

const HL_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.85) };
const HL_EST = fundoProfundo(51, 620);
// nebulosa em espiral (3 braços), coordenadas em torno de (0, 0)
const HL_NEB = (() => {
  const r = prng(303), L = [];
  for (let k = 0; k < 24000; k++) {
    const braco = k % 3, u = Math.pow(r(), 0.65), rad = 40 + u * 560, ang = braco * 2.094 + rad * 0.0105 + (r() - 0.5) * (0.55 - 0.3 * u), esp = (r() - 0.5) * 40 * (1 - u * 0.5);
    L.push({ ang, rad: rad + esp, u, f: r() * 6.283, v: r() });
  }
  return L;
})();
function HL_nebulosa(nv, i, t, cam, a, cx = 540, cy = 860) {
  if (a <= 0.01) return i;
  const gir = t * 0.045, [ox, oy, k] = projP(cam, cx, cy, 1.3);
  for (const p of HL_NEB) {
    if (i >= nv.n) break;
    const an = p.ang + gir * (1.4 - p.u * 0.6), x = Math.cos(an) * p.rad, y = Math.sin(an) * p.rad * 0.5;
    const c = mixCor(LUZ.luz, mixCor(LUZ.ambar, [0.45, 0.6, 1.0], PT.ss((p.u - 0.35) / 0.5)), PT.ss(p.u / 0.3));
    const tw = 0.7 + 0.3 * Math.sin(t * (0.8 + p.v) + p.f);
    nv.ponto(i++, ox + x * k, oy + y * k, c[0], c[1], c[2], a * tw * (0.1 + 0.34 * (1 - p.u)), (2.4 + 2.8 * (1 - p.u)) * Math.min(1.6, k));
  }
  return i;
}
// mar de pontos no horizonte (y0 = linha do horizonte), com reflexo da luz em cx
function HL_mar(nv, i, t, a, y0 = 1180, cx = 540, reflexo = 0) {
  if (a <= 0.01) return i;
  for (let lin = 0; lin < 26 && i < nv.n; lin++) {
    const prof = lin / 25, yy = y0 + Math.pow(prof, 1.6) * 260, n = 70 + lin * 4, passo = 1180 / n;
    for (let k = 0; k < n && i < nv.n; k++) {
      const xx = -50 + k * passo + (lin % 2) * passo / 2, onda = Math.sin(xx * 0.012 + t * 1.1 + lin * 0.7) * (3 + 8 * prof);
      const brilho = reflexo * Math.exp(-Math.pow((xx - cx) / (60 + 160 * prof), 2)) * (0.6 + 0.4 * Math.sin(t * 3 + k + lin));
      const c = mixCor([0.35, 0.5, 0.95], LUZ.luz, Math.min(1, brilho));
      nv.ponto(i++, xx, yy + onda, c[0], c[1], c[2], a * (0.1 + 0.18 * (1 - prof) + 0.6 * brilho), 2.2 + 3.2 * prof);
    }
  }
  return i;
}
// silhueta humana de luz (sem rosto), caixa 256 x 256
const HL_PESSOA_D = "M122 50C122 58 120 62 112 64C98 67 90 72 88 82C84 104 78 130 70 156C67 165 74 168 77 160C84 136 92 110 96 96C98 112 100 124 100 134C99 148 100 158 104 170C108 200 110 226 110 240L124 242C124 222 126 196 127 176L129 176C130 196 132 222 132 242L146 240C146 226 148 200 152 170C156 158 157 148 156 134C156 124 158 112 160 96C164 110 172 136 179 160C182 168 189 165 186 156C178 130 172 104 168 82C166 72 158 67 144 64C136 62 134 58 134 50ZM113 32a15 18 0 1 0 30 0a15 18 0 1 0 -30 0Z";
const HL_F = {
  luz: poeiraForma(12000, 21, 0.16), po: poeiraForma(12000, 23, 0.95),
  terra: formaPontos("globe-hemisphere-west", 12000), mar: formaPontos({ desenho: (g, R) => { g.strokeStyle = "#fff"; g.lineCap = "round"; g.lineWidth = R * 0.055; for (let k = 0; k < 3; k++) { const y0 = R * (0.34 + k * 0.16), amp = R * (0.05 - k * 0.008); g.beginPath(); for (let j = 0; j <= 60; j++) { const xx = R * (0.1 + 0.8 * j / 60); g[j ? "lineTo" : "moveTo"](xx, y0 + Math.sin(j / 60 * 6.283 * 1.5 + k) * amp); } g.stroke(); } } }, 12000), sol: formaPontos("sun", 12000),
  pessoa: formaPontos({ desenho: (g, R) => { g.save(); g.translate(R * 0.04, R * 0.04); g.scale((R * 0.92) / 256, (R * 0.92) / 256); g.fill(new Path2D(HL_PESSOA_D)); g.restore(); } }, 13000, { espessura: 0.04 }),
  lua: formaPontos("moon", 3500), solP: formaPontos("sun", 3500), chama: logoForma(5000),
};
const HL_TERRA_COR = [0.3, 0.55, 1.0], HL_MAR_COR = [0.45, 0.72, 1.0];

// =============== 1. abertura: nebulosa dourada em movimento -> escuridão -> uma faísca ===============
CENAS.abertura = (el, c, B) => {
  const tE = B("escuro"), tL = B("laco");
  mostrarGancho(tE + 0.5);
  const TV = telaGPU(el, c, HL_FUNDO), nv = TV.nuvem(40000);
  const CAM = cameraProf([[0, { x: 540, y: 880, zoom: 1.45 }], [tE + 0.6, { x: 540, y: 880, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 860, zoom: 1.08 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), apaga = PT.ss((t - tE + 0.4) / 1.4);
    let i = desenharFundo(nv, HL_EST, t, cam, LUZ.luz, 0.7 - 0.35 * apaga, 0);
    brilhoP(x, 540, 860, 560, LUZS.ambar, 0.24 * (1 - apaga)); brilhoP(x, 540, 860, 160, LUZS.luz, 0.35 * (1 - apaga));
    i = HL_nebulosa(nv, i, t, cam, 1 - 0.85 * apaga);
    // a faísca: um ponto de luz que pulsa no escuro (o "detalhe" que fica para o fim)
    const fa = PT.ss((t - tL + 0.3) / 0.6);
    if (fa > 0) { const p = 0.75 + 0.25 * Math.sin(t * 5); brilhoP(x, 540, 760, 70 * p, LUZS.luz, 0.8 * fa); discoP(x, 540, 760, 5, "255,250,235", fa); }
    nv.total(i);
  });
};

// =============== 2. Haja luz: a faísca explode em luz; versículo com referência ===============
const HL_RAIOS = Array.from({ length: 36 }, (_, k) => { const r = prng(700 + k); return { an: (k / 36) * 6.283 + r() * 0.08, L: 0.6 + 0.4 * r(), w: 2 + 3 * r() }; });
const HL_JATO = (() => { const r = prng(77); return Array.from({ length: 5000 }, () => ({ an: r() * 6.283, v: 120 + 520 * r(), f: r(), s: r() })); })();
CENAS.luz = (el, c, B) => {
  const tH = B("haja"), tO = B("houve"), tp = tempoPalavras(c);
  mostrarVersiculo("E disse Deus: Haja luz; e houve luz.", "Gênesis 1:3", tp("e", 0) - 0.15, c.fim + 0.3,
    { y: 1160, tam: 60, destaque: ["luz"], tempos: [tp("e", 0), tp("disse"), tp("deus"), tp("haja"), tp("luz", 0), tp("e", 1), tp("houve"), tp("luz", 1)] });
  const TV = telaGPU(el, c, HL_FUNDO), nv = TV.nuvem(50000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 860, zoom: 1.08 }], [tH, { x: 540, y: 820, zoom: 1.22 }], [tH + 1.2, { x: 540, y: 860, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 860, zoom: 0.96 }]]);
  const CX = 540, CY = 760;
  TV.quadro((x, t) => {
    const cam = CAM(t), [dx, dy] = FIS.tremor(t, tH, 10), u = t - tH, acesa = PT.ss(u / 0.25), cheia = PT.ss((t - tO + 0.2) / 0.8);
    let i = desenharFundo(nv, HL_EST, t, cam, LUZ.luz, 0.35 + 0.65 * acesa, 0);
    const [cx, cy] = [CX + dx, CY + dy];
    if (u < 0) { const p = 0.7 + 0.3 * Math.sin(t * 5) + 0.6 * PT.ss((t - tH + 0.5) / 0.5); brilhoP(x, cx, cy, 70 * p, LUZS.luz, 0.8); discoP(x, cx, cy, 5 * p, "255,250,235", 1); }
    else {
      // clarão e onda de choque
      brilhoP(x, cx, cy, 300 + 900 * PT.out(u / 1.2), LUZS.luz, 0.9 * Math.exp(-u * 1.6) + 0.25 * cheia);
      brilhoP(x, cx, cy, 680, LUZS.ambar, 0.3 * acesa);
      const rr = u * 1100, aOnda = Math.max(0, 1 - u / 1.1);
      if (aOnda > 0) for (let k = 0; k < 900 && i < nv.n; k++) { const an = (k / 900) * 6.283; nv.ponto(i++, cx + Math.cos(an) * rr, cy + Math.sin(an) * rr * 0.92, LUZ.luz[0], LUZ.luz[1], LUZ.luz[2], 0.7 * aOnda, 3.5); }
      // raios de luz que crescem e respiram
      HL_RAIOS.forEach((r, k) => { const L = (180 + 640 * r.L * PT.out(u / 0.9)) * (0.92 + 0.08 * Math.sin(t * 1.5 + k)); linhaP(x, cx + Math.cos(r.an) * 90, cy + Math.sin(r.an) * 90, cx + Math.cos(r.an + t * 0.03) * L, cy + Math.sin(r.an + t * 0.03) * L, LUZS.ouro, 0.12 * acesa, r.w); });
      // partículas que saem do centro
      for (const p of HL_JATO) { if (i >= nv.n) break; const d = ((u * p.v * 0.5 + p.f * 700) % 700), al = (1 - d / 700) * acesa; nv.ponto(i++, cx + Math.cos(p.an) * (60 + d), cy + Math.sin(p.an) * (60 + d) * 0.95, LUZ.luz[0], LUZ.luz[1], LUZ.luz[2], 0.5 * al, 2.5 + 2 * p.s); }
      // núcleo de luz (pontos) com mola
      const ch = FIS.chegar(t, tH, 0.7);
      i = desenharForma(nv, HL_F.luz, { cx, cy, esc: 1250 * Math.max(0.01, ch) * (1 + 0.04 * Math.sin(t * 2)), cor: LUZ.luz, borda: [1, 1, 1], brilho: 1.4, t, i0: i });
    }
    nv.total(i);
  });
};

// =============== 3. criação: luz -> terra -> mar -> sol (lua e estrelas) -> ser humano ===============
CENAS.criacao = (el, c, B) => {
  const tC = B("ceu"), tT = B("terra"), tM = B("mar"), tS = B("sol"), tE = B("estrelas"), tHu = B("humano");
  const TV = telaGPU(el, c, HL_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 860, zoom: 1.12 }], [tC + 0.6, { x: 540, y: 880, zoom: 0.98 }], [tS, { x: 540, y: 860, zoom: 1.03 }], [tHu + 0.3, { x: 540, y: 900, zoom: 1.1 }], [c.fim + 0.5, { x: 540, y: 900, zoom: 1.14 }]]);
  // estados do objeto principal e o instante em que cada um começa a se formar
  const EST = [
    [HL_F.luz, (t) => ({ cx: 540, cy: 760, esc: 1500, cor: LUZ.luz, borda: [1, 1, 1], brilho: 1.4 }), -99],
    [HL_F.terra, (t) => ({ cx: 540, cy: 800, esc: 520, cor: HL_TERRA_COR, borda: [0.7, 0.88, 1], brilho: 0.75, rot: -0.12 + 0.04 * Math.sin(t * 0.5) }), tT - 0.35],
    [HL_F.mar, (t) => ({ cx: 540, cy: 860, esc: 560, cor: HL_MAR_COR, borda: [0.85, 0.95, 1] }), tM - 0.35],
    [HL_F.sol, (t) => ({ cx: 540, cy: 760, esc: 470, cor: LUZ.ouro, borda: LUZ.luz, rot: t * 0.08, brilho: 1.15 }), tS - 0.35],
    [HL_F.pessoa, (t) => ({ cx: 540, cy: 900, esc: 640, cor: LUZ.luz, borda: [1, 0.98, 0.92], giro: 0.12 * Math.sin(t * 0.6) }), tHu - 0.45],
  ];
  const DUR = 1.0;
  TV.quadro((x, t) => {
    const cam = CAM(t), ceu = PT.ss((t - tC + 0.2) / 0.8), est = PT.ss((t - tE + 0.3) / 0.8);
    let i = desenharFundo(nv, HL_EST, t, cam, LUZ.luz, 0.45 + 0.4 * ceu + 0.4 * est, 0);
    // céu: um véu azul profundo que abre no alto
    brilhoP(x, 540, 300, 900, "40,70,150", 0.35 * ceu);
    // mar no horizonte (a partir do "mar"), com reflexo do sol
    const aMar = PT.ss((t - tM + 0.2) / 0.8), sol = PT.ss((t - tS + 0.1) / 0.8);
    i = HL_mar(nv, i, t, aMar, 1190, 540, 0.25 + 0.75 * sol);
    // lua e o sol pequeno no céu (o sol "sobe" quando o centro vira o ser humano)
    const aLua = PT.ss((t - tE + 0.6) / 0.7), subiu = PT.ss((t - tHu + 0.45) / 1.0);
    if (aLua > 0.01) i = desenharForma(nv, HL_F.lua, { cx: 250, cy: 430 + FIS.flutua(t, 1, 6), esc: 130 * FIS.chegar(t, tE - 0.6, 0.7), cor: [0.9, 0.93, 1], a: aLua, t, i0: i });
    if (subiu > 0.01) { brilhoP(x, 860, 470, 200, LUZS.ambar, 0.5 * subiu); i = desenharForma(nv, HL_F.solP, { cx: 860, cy: 470, esc: 150, cor: LUZ.ouro, borda: LUZ.luz, rot: t * 0.08, a: subiu, t, i0: i }); }
    // objeto principal: transforma de um estado no próximo
    let k = 0; while (k + 1 < EST.length && t >= EST[k + 1][2]) k++;
    const [FA, cA] = EST[k], u = k > 0 ? PT.cl((t - EST[k][2]) / DUR) : 1;
    if (k > 0 && u < 1) { const [FP, cP] = EST[k - 1]; i = morfo(nv, FP, FA, u, { de: cP(t), para: cA(t), t, onda: 0.3, curva: 0.45, sobe: k === 4 ? 60 : 20, i0: i }); }
    else i = desenharForma(nv, FA, { ...cA(t), t, i0: i });
    if (k === 0) brilhoP(x, 540, 760, 420, LUZS.luz, 0.5);
    if (k === 3) brilhoP(x, 540, 760, 420, LUZS.ambar, 0.45 * sol * (1 - subiu));
    if (k === 4) brilhoP(x, 540, 880, 360, LUZS.luz, 0.25 * PT.ss((t - tHu) / 0.8));
    nv.total(i);
  });
};

// =============== 4. o detalhe: a mesma luz quer brilhar dentro de você ===============
CENAS.detalhe = (el, c, B) => {
  const tD = B("detalhe"), tE = B("escuro2"), tDe = B("dentro");
  mostrarVersiculo("O Deus que disse “haja luz” quer brilhar dentro de você.", "cf. 2 Coríntios 4:6", tE - 0.6, c.fim + 0.3, { y: 420, tam: 60, destaque: ["luz", "dentro"], tempoRef: tDe + 0.4 });
  const TV = telaGPU(el, c, HL_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 900, zoom: 1.12 }], [tDe - 0.3, { x: 540, y: 900, zoom: 1.12 }], [tDe + 1.2, { x: 540, y: 860, zoom: 1.28, foco: 1 }], [c.fim + 0.5, { x: 540, y: 860, zoom: 1.32 }]]);
  const PX = 540, PY = 900, PE = 640, peitoY = PY - 0.1 * PE;
  TV.quadro((x, t) => {
    const cam = CAM(t), d = PT.ss((t - tDe + 0.2) / 1.0);
    let i = desenharFundo(nv, HL_EST, t, cam, LUZ.luz, 0.8, 0);
    i = HL_mar(nv, i, t, 0.8, 1190, 540, 0.4 + 0.6 * d);
    const [ox, oy, k] = projP(cam, PX, PY, 1), [hx, hy] = projP(cam, PX, peitoY, 1);
    brilhoP(x, 880, 660, 200, LUZS.ambar, 0.4 * (1 - d));
    i = desenharForma(nv, HL_F.solP, { cx: 880, cy: 660, esc: 150, cor: LUZ.ouro, borda: LUZ.luz, rot: t * 0.08, a: 1 - d, t, i0: i });
    // a pessoa esquenta (luz fria -> dourada) quando a chama acende no peito
    i = desenharForma(nv, HL_F.pessoa, { cx: ox, cy: oy, esc: PE * k, cor: mixCor(LUZ.luz, LUZ.ouro, d), borda: [1, 0.98, 0.92], giro: 0.12 * Math.sin(t * 0.6), brilho: 0.9 + 0.3 * d, t, i0: i });
    if (d > 0) {
      brilhoP(x, hx, hy, (120 + 420 * d) * k, LUZS.ambar, 0.45 * d); brilhoP(x, hx, hy, 90 * k, LUZS.luz, 0.8 * d);
      for (let r = 0; r < 18; r++) { const an = (r / 18) * 6.283 + t * 0.1, L = (80 + 320 * d) * k; linhaP(x, hx + Math.cos(an) * 40 * k, hy + Math.sin(an) * 40 * k, hx + Math.cos(an) * L, hy + Math.sin(an) * L, LUZS.ouro, 0.1 * d, 3); }
      i = desenharForma(nv, HL_F.chama, { cx: hx, cy: hy - 4, esc: 92 * k * FIS.chegar(t, tDe - 0.1, 0.6), cor: LUZ.ouro, borda: [1, 1, 1], brilho: 1.4, a: d, t, i0: i });
    }
    nv.total(i);
  });
};

// =============== 5. pergunta para os comentários (1 ou 2), seta para a direita ===============
CENAS.pergunta = (el, c, B) => {
  const tP = B("pergunta"), t1 = B("um"), t2 = B("dois"), tC = B("comenta");
  const TV = telaGPU(el, c, HL_FUNDO), nv = TV.nuvem(40000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 960, zoom: 1.04 }], [c.fim + 0.5, { x: 540, y: 960, zoom: 1.0 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t);
    let i = desenharFundo(nv, HL_EST, t, cam, LUZ.luz, 0.8, 0);
    i = HL_mar(nv, i, t, 0.45, 1250, 540, 0.3);
    const ab = FIS.chegar(t, c.ini + 0.2, 0.7);
    i = balaoPergunta(nv, x, t, PT.ss((t - c.ini - 0.1) / 0.5), 540, 560, 360 * Math.max(0.01, ab), i);
    // as duas opções (a falada acende)
    [[1, "1 · Haja luz", "Gênesis 1:3", 860, t1, c.ini + 0.4], [2, "2 · Luz dentro de você", "2 Coríntios 4:6", 1050, t2, c.ini + 0.55]].forEach(([n, txt, ref, y, tf, te]) => {
      const a = PT.ss((t - te) / 0.5), on = PT.jan(t, tf - 0.1, (n === 1 ? t2 : tC) - 0.1, 0.15, 0.4), ch = FIS.chegar(t, te, 0.6);
      const yy = y + 30 * (1 - Math.min(1, ch));
      fCaixa(x, 540, yy, 780, 140, 34, on > 0.5 ? LUZS.luz : LUZS.ouro, a * (0.7 + 0.3 * on), 3 + 2 * on, 0.04 + 0.06 * on);
      if (on > 0) brilhoP(x, 540, yy, 420, LUZS.ambar, 0.18 * on);
      rotuloP(x, txt, 540, yy - 18, 50, on > 0.5 ? "255,246,230" : "255,236,200", a);
      rotuloP(x, ref, 540, yy + 36, 30, LUZS.ouro, 0.85 * a);
    });
    setaComentarios(x, PT.ss((t - tC + 0.3) / 0.4), t);
    nv.total(i);
  });
};

// =============== 6. fim: cartão com o logo em pontos de luz ===============
CENAS.fim = (el, c, B) => {
  cartaoFinal(el, c.ini + 0.05);
};
