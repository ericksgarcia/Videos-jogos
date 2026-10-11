// Cenas do vídeo "Lâmpada para os meus pés" (Salmos 119:105, Almeida) — Luz da Palavra, pontos de luz.
// Retenção: quadro 0 = estrada no escuro com uma chama pequena em primeiro plano; gancho emocional;
// laço aberto (o detalhe das lâmpadas daquela época) pago em "só o próximo passo"; a estrada inteira
// acende por um instante e apaga; a pessoa (line art, sem rosto) segura a lamparina, caminha e a luz vai junto; pergunta única.

const LP_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.8) };
const LP_EST = fundoProfundo(101, 560);
const LP_F = {
  lamp: formaPontos({ desenho: (g, R) => { g.save(); g.translate(R * 0.04, R * 0.04); g.scale((R * 0.92) / 256, (R * 0.92) / 256); g.fill(new Path2D(LOGOS.lamparina), "evenodd"); g.restore(); } }, 12000, { espessura: 0.07 }),
  po: poeiraForma(12000, 103, 0.9), lampP: null,
};
LP_F.lampP = formaPontos({ desenho: (g, R) => { g.save(); g.translate(R * 0.04, R * 0.04); g.scale((R * 0.92) / 256, (R * 0.92) / 256); g.fill(new Path2D(LOGOS.lamparina), "evenodd"); g.restore(); } }, 3000, { espessura: 0.09 });
// a pessoa (line art) na estrada, na posição s, com a lamparina na mão da frente; devolve [i, chão iluminado]
const LP_SEGURA = (base, cab = 0.22) => ({ ...base, cabeca: cab, braco: [base.braco[0], [0.62, 0.18]] });
function LP_pessoa(nv, x, i, t, cam, s, pose, o = {}) {
  const H = o.H || 420, d = o.dir ?? 1, X = LP_X(s) + (o.dx || 0), z = LP_Z(s);
  const p = personagem(x, t, pose, { tipo: "pessoa", x: X, chao: 1500, H, dir: d, cam, z, fase: 2, cor: o.cor || [0.88, 0.9, 1], a: o.a ?? 1 });
  const [hx, hy] = p.maos[1], k = p.escala, esc = 0.27 * H * k, lx = hx + d * 0.1 * esc, ly = hy - 0.42 * esc, ch = o.chama ?? 1;
  // a luz da lamparina: halo quente em volta e uma poça de luz no chão, perto dos pés
  const [fx, fy] = projP(cam, X + d * 0.2 * H, 1500, z), tr = LP_tremor(t, 2);
  brilhoP(x, lx, ly, 0.9 * H * k * tr, LUZS.ambar, 0.16 * ch); LP_poca(x, fx, fy, 0.75 * H * k * tr, LUZS.ambar, 0.45 * ch);
  i = desenharForma(nv, LP_F.lampP, { cx: lx, cy: ly, esc, sx: d, cor: [0.85, 0.66, 0.45], borda: LUZ.luz, brilho: 0.9, t, i0: i });
  LP_chama(x, lx + d * 0.31 * esc, ly - 0.12 * esc, 0.2 * esc * ch, t, 1);
  const y = x._texto; if (y) { const tr = LP_tremor(t, 1); y.save(); y.globalCompositeOperation = "lighter"; const g = y.createRadialGradient(lx + d * 0.31 * esc, ly - 0.14 * esc, 0, lx + d * 0.31 * esc, ly - 0.14 * esc, 0.14 * esc * tr); g.addColorStop(0, "rgba(255,250,235,0.95)"); g.addColorStop(0.5, "rgba(255,214,140,0.5)"); g.addColorStop(1, "rgba(255,214,140,0)"); y.fillStyle = g; y.fillRect(lx - esc, ly - esc, 2 * esc, 2 * esc); y.restore(); }
  return i;
}
// estrada: s = 0 (perto) a 1 (horizonte); o chão fica em Y = 1500 (mundo) e a profundidade z cresce com s
const LP_X = (s) => 540 + 230 * Math.sin(s * 4.2 + 0.5) * (1 - 0.45 * s), LP_Z = (s) => 0.72 + 4.6 * Math.pow(s, 1.35);
const LP_CHAO = (() => { const r = prng(105), L = []; for (let k = 0; k < 4200; k++) { const s = Math.pow(r(), 0.85), u = r() * 2 - 1; L.push([s, u, r(), 0]); } for (let k = 0; k < 3000; k++) { const s = Math.pow(r(), 0.8), u = (1.15 + r() * 3) * (r() < 0.5 ? -1 : 1); L.push([s, u, r(), 1]); } return L; })();
const LP_PASSOS = Array.from({ length: 40 }, (_, k) => 0.02 + k * 0.024);
// luz(s, u): quanto a lâmpada (em sL, alcance R) ilumina aquele ponto do chão; extra(s): luz geral (0–1)
function LP_estrada(nv, x, i, t, cam, sL, R, o = {}) {
  const extra = o.extra || 0, rastro = o.rastro || 0, a = o.a ?? 1;
  for (const [s, u, v, lado] of LP_CHAO) {
    if (i >= nv.n) break;
    const z = LP_Z(s), X = LP_X(s) + u * 210, [sx, sy, k] = projP(cam, X, 1500, z);
    if (sx < -30 || sx > 1110 || sy > 1960) continue;
    const ds = s - sL, luz = Math.exp(-Math.pow(ds / R, 2)) * (ds < -0.02 ? 0.35 : 1) * Math.exp(-Math.pow(u / (lado ? 2.2 : 1.3), 2)), atras = rastro * (ds < 0 ? Math.exp(ds / 0.25) : 0);
    const al = (lado ? 0.07 : 0.3) * (1 - PT.ss((s - 0.25) / 0.6)) + 0.85 * luz + 0.25 * extra * (1 - s * 0.6) + 0.12 * atras, c = lado ? mixCor([0.35, 0.45, 0.4], LUZ.ouro, luz) : mixCor([0.6, 0.55, 0.5], LUZ.luz, luz);
    nv.ponto(i++, sx, sy, c[0], c[1], c[2], a * al * (0.7 + 0.3 * v), (1.8 + 2.6 * v) * Math.min(2.2, 0.55 + k * 0.6));
  }
  return i;
}
// poça de luz achatada no chão (elipse com degradê)
function LP_poca(x, sx, sy, r, cor, a) { if (a <= 0.005) return; x.save(); x.translate(sx, sy); x.scale(1, 0.28); const g = x.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, `rgba(${cor},${a})`); g.addColorStop(0.5, `rgba(${cor},${a * 0.35})`); g.addColorStop(1, `rgba(${cor},0)`); x.fillStyle = g; x.fillRect(-r, -r, 2 * r, 2 * r); x.restore(); }
function LP_neblina(x, t, a = 1) { for (let k = 0; k < 7; k++) { const px = ((k * 197 + t * 14) % 1400) - 160, py = 1000 + (k % 3) * 70; brilhoP(x, px, py, 260 + 40 * (k % 2), "120,130,170", 0.05 * a); } }
// a chama da lâmpada: um brilho que treme (determinístico)
const LP_tremor = (t, f = 0) => 0.85 + 0.1 * Math.sin(t * 11 + f) + 0.05 * Math.sin(t * 23 + 2 * f);
function LP_chama(x, px, py, esc, t, a = 1) { const tr = LP_tremor(t); brilhoP(x, px, py, esc * 2.4 * tr, LUZS.ambar, 0.35 * a); brilhoP(x, px, py, esc * 0.8 * tr, LUZS.luz, 0.8 * a); discoP(x, px, py, esc * 0.12 * tr, "255,250,235", a); }

// =============== 1. abertura: a estrada no escuro, uma chama pequena perto dos pés ===============
CENAS.abertura = (el, c, B) => {
  const tI = B("ideia"), tV = B("versiculo"), tL = B("laco");
  mostrarGancho(tV + 0.3);
  const TV = telaGPU(el, c, LP_FUNDO), nv = TV.nuvem(60000);
  const CAM = cameraProf([[0, { x: 690, y: 1180, zoom: 1.35 }], [c.fim + 0.5, { x: 600, y: 1080, zoom: 1.05 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), cresce = PT.ss((t - tV) / 2.0);
    let i = desenharFundo(nv, LP_EST, t, cam, LUZ.luz, 0.9, 0);
    LP_neblina(x, t);
    i = LP_estrada(nv, x, i, t, cam, 0.11, 0.03 + 0.02 * cresce);
    // a pessoa parada no escuro, olhando a estrada que some na neblina (sem saber o caminho)
    const olha = Math.sin(t * 0.9);
    i = LP_pessoa(nv, x, i, t, cam, 0.1, LP_SEGURA(POSES.de_pe, 0.05 + 0.2 * olha), { chama: 1 + 0.4 * cresce });
    nv.total(i);
  });
};

// =============== 2. o versículo: a lamparina acende e a luz cai sobre o caminho ===============
CENAS.versiculo = (el, c, B) => {
  const tLa = B("lampada"), tP = B("palavra"), tC = B("caminho"), tp = tempoPalavras(c);
  const pal = ["lâmpada", "para", "os", "meus", "pés", "é", "tua", "palavra", "e", "luz", "para", "o", "meu", "caminho"], cont = {};
  const tempos = pal.map((w) => { const n = cont[w] || 0; cont[w] = n + 1; return tp(w, n); });
  mostrarVersiculo("Lâmpada para os meus pés é tua palavra, e luz para o meu caminho.", "Salmos 119:105", tempos[0] - 0.3, c.fim + 0.3, { y: 400, tam: 64, destaque: ["lâmpada", "luz"], tempos });
  const TV = telaGPU(el, c, LP_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1080, zoom: 1.05 }], [tC + 1.0, { x: 540, y: 1060, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 1040, zoom: 1.04 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), forma = PT.ss((t - tLa + 0.4) / 1.2), acende = PT.ss((t - tP + 0.2) / 0.6), cai = PT.ss((t - tC + 0.4) / 1.2);
    let i = desenharFundo(nv, LP_EST, t, cam, LUZ.luz, 0.8, 0);
    LP_neblina(x, t);
    i = LP_estrada(nv, x, i, t, cam, 0.12, 0.04 + 0.08 * cai);
    // a lamparina se forma da poeira de luz; a chama acende na palavra "palavra"
    const LX = 520, LY = 850, LE = 470, chamaX = LX + (212 / 256 - 0.5) * 0.92 * LE, chamaY = LY + (100 / 256 - 0.5) * 0.92 * LE;
    brilhoP(x, LX, LY + 60, 420, LUZS.ambar, 0.12 + 0.2 * acende);
    i = morfo(nv, LP_F.po, LP_F.lamp, forma, { de: { cx: LX, cy: LY + 200, esc: 1100, cor: [0.6, 0.6, 0.75], a: 0.3 }, para: { cx: LX, cy: LY, esc: LE, cor: mixCor([0.75, 0.62, 0.48], LUZ.ouro, acende), borda: LUZ.luz, brilho: 0.7 + 0.4 * acende, desloca: (k, sx, sy) => (sy < chamaY + 40 ? [sx + Math.sin(t * 9 + sy * 0.05) * 3 * acende, sy - Math.abs(Math.sin(t * 7 + sx * 0.03)) * 4 * acende] : [sx, sy]) }, t, onda: 0.3, curva: 0.4, i0: i });
    if (acende > 0.01) LP_chama(x, chamaX, chamaY, 60, t, acende);
    // a luz desce em feixe da lâmpada até a estrada
    if (cai > 0.01) { const [rx, ry] = projP(cam, LP_X(0.12), 1500, LP_Z(0.12)); for (let k = 0; k < 9; k++) { const u = (k - 4) / 4; linhaP(x, chamaX, chamaY + 40, rx + u * 160, ry, LUZS.luz, 0.05 * cai, 6); } }
    const olhaC = PT.ss((t - tLa + 0.3) / 0.9);
    i = LP_pessoa(nv, x, i, t, cam, 0.12, poseMix(LP_SEGURA(POSES.de_pe, 0.1), LP_SEGURA(POSES.olhando_cima, -0.5), olhaC), { dir: -1, H: 380, cor: mixCor([0.88, 0.9, 1], LUZ.luz, cai) });
    nv.total(i);
  });
};

// =============== 3. o detalhe: a estrada é longa; a lâmpada só ilumina o próximo passo ===============
CENAS.detalhe = (el, c, B) => {
  const tB = B("barro"), tE = B("estrada"), tPa = B("passo");
  const TV = telaGPU(el, c, LP_FUNDO), nv = TV.nuvem(70000);
  const tx = palcoTexto(el, [["lp-d", 380, 80, "Só o <b>próximo passo.</b>", "lp-q", ""]]);
  tl.set(tx["lp-d"], { opacity: 0 }, 0);
  tl.fromTo(tx["lp-d"], { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out", immediateRender: false }, tPa - 0.5);
  const CAM = cameraProf([[c.ini, { x: 620, y: 1120, zoom: 1.0 }], [tB + 0.5, { x: 770, y: 1270, zoom: 2.6 }], [tE - 0.2, { x: 640, y: 1150, zoom: 1.0 }], [tE + 1.2, { x: 560, y: 1020, zoom: 0.9 }], [tPa + 0.3, { x: 720, y: 1350, zoom: 1.3 }], [c.fim + 0.5, { x: 730, y: 1355, zoom: 1.36 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), varre = PT.jan(t, tE - 0.2, tE + 1.0, 0.5, 0.8), passo = PT.ss((t - tPa + 0.2) / 0.5);
    let i = desenharFundo(nv, LP_EST, t, cam, LUZ.luz, 0.8, 0);
    LP_neblina(x, t);
    i = LP_estrada(nv, x, i, t, cam, 0.05, 0.035, { extra: varre * 0.9 });
    // o próximo passo: uma pedra iluminada logo à frente dos pés
    if (passo > 0) { const [px, py, pk] = projP(cam, LP_X(0.05) + 125, 1500, LP_Z(0.05)), pul = 1 + 0.12 * Math.sin(t * 4); LP_poca(x, px, py, 120 * pk * pul, LUZS.luz, passo); brilhoP(x, px, py - 8 * pk, 60 * pk * pul, LUZS.luz, 0.7 * passo); fCaixa(x, px, py - 7 * pk, 44 * pk, 14 * pk, 8 * pk, LUZS.luz, passo, 3, 0.2); }
    // a pessoa com a lamparina de barro na mão (a câmera chega perto dela em "barro")
    i = LP_pessoa(nv, x, i, t, cam, 0.05, LP_SEGURA(POSES.de_pe, 0.25 - 0.3 * varre + 0.15 * passo), { dir: 1 });
    nv.total(i);
  });
};

// =============== 4. para você: a pessoa caminha e, a cada passo, a luz vai junto ===============
CENAS.sentido = (el, c, B) => {
  const tI = B("inteiro"), tP = B("proximo"), tJ = B("junto");
  const TV = telaGPU(el, c, LP_FUNDO), nv = TV.nuvem(80000);
  const tx = palcoTexto(el, [["lp-s", 380, 72, "A cada passo,<br><b>a luz vai junto.</b>", "lp-q", ""]]);
  tl.set(tx["lp-s"], { opacity: 0 }, 0);
  tl.fromTo(tx["lp-s"], { opacity: 0, y: 20, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out", immediateRender: false }, tJ - 1.2);
  const anda = (t) => 0.06 + 0.22 * PT.ss((t - tP + 0.6) / Math.max(2, c.fim - tP + 0.6));
  TV.quadro((x, t) => {
    const sW = anda(t), zW = LP_Z(sW), XW = LP_X(sW);
    const cam = { x: PT.lerp(540, XW, 0.6), y: PT.lerp(1240, 1200, sW), zoom: 1.0 + 0.8 * sW, foco: 1 };
    let i = desenharFundo(nv, LP_EST, t, cam, LUZ.luz, 0.8, 0);
    LP_neblina(x, t);
    i = LP_estrada(nv, x, i, t, cam, sW + 0.015, 0.04, { rastro: PT.ss((t - tJ + 0.5) / 1.0) });
    // pegadas que acendem uma por vez, logo à frente
    LP_PASSOS.forEach((s, k) => { if (s < sW - 0.02 || s > sW + 0.06) return; const [px, py, pk] = projP(cam, LP_X(s) + (k % 2 ? 22 : -22), 1500, LP_Z(s)), q = Math.exp(-Math.pow((s - sW - 0.02) / 0.03, 2)); discoP(x, px, py, 12 * pk, LUZS.luz, 0.6 * q); brilhoP(x, px, py, 50 * pk, LUZS.ambar, 0.4 * q); });
    // a pessoa caminhando pela estrada, com a lamparina perto dos pés (anda só depois de "próximo")
    const vai = PT.ss((t - tP + 0.6) / 0.6);
    i = LP_pessoa(nv, x, i, t, cam, sW, LP_SEGURA(poseMix(POSES.de_pe, POSES.andar(t * 5.5, 0.85), vai), 0.2), { dir: 1, cor: mixCor([0.88, 0.9, 1], LUZ.luz, 0.35 * PT.ss((t - tJ + 0.5) / 1.0)) });
    nv.total(i);
  });
};

// =============== 5. pergunta (uma só) e 6. fim (emenda no começo) ===============
CENAS.pergunta = (el, c, B) => cenaPergunta(el, c, B, { texto: "Qual é o <b>próximo passo</b> que você precisa de coragem pra dar?", sub: "Escreve nos comentários", icone: "footprints", seed: 107, tam: 70, alturaTexto: 300 });
CENAS.fim = (el, c, B) => cartaoFinal(el, c.ini + 0.05);
