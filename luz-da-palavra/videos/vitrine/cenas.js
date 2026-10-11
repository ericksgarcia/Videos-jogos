// Vitrine da identidade (não é um vídeo do canal): mostra marca, abertura, versículo, legenda,
// capítulo e cartão final de cada proposta (gerar.py --previa --marca identidade/propostas/<x>.json).

const V_FUNDO = fundoProfundo(12, 700);
const V_SOL = formaPontos("sun", 12000), V_PO = poeiraForma(12000, 9, 0.9);

CENAS.abertura = (el, c, B) => {
  const tE = B("escuro"), tH = B("haja"), tp = tempoPalavras(c);
  mostrarGancho(tE + 0.2);
  mostrarVersiculo("E disse Deus: Haja luz. E houve luz.", "Gênesis 1:3", tp("e", 0) - 0.2, c.fim - 0.2,
    { y: 1130, destaque: ["luz"], tempos: [tp("e", 0), tp("disse"), tp("deus"), tp("haja"), tp("luz", 0), tp("e", 1), tp("houve"), tp("luz", 1)] });
  const TV = telaGPU(el, c, { fundo: LUZ.fundo.map((q) => q * 0.9) }), nv = TV.nuvem(60000);
  const CAM = cameraProf([[0, { x: 540, y: 960, zoom: 1.0 }], [c.fim, { x: 540, y: 900, zoom: 1.12 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), u = PT.ss((t - tH + 0.1) / 1.2);
    let i = desenharFundo(nv, V_FUNDO, t, cam, LUZ.luz, 1 - 0.4 * u, 0);
    // horizonte: mar de pontos que acende com a luz
    for (let k = 0; k < 900 && i < nv.n; k++) { const xx = (k * 37) % 1100 - 10, yy = 900 + ((k * 53) % 160), on = Math.sin(t * 1.3 + k) * 0.5 + 0.5; nv.ponto(i++, xx, yy + Math.sin(t + xx * 0.01) * 4, LUZ.ouro[0], LUZ.ouro[1], LUZ.ouro[2], (0.05 + 0.35 * u) * on * (1 - (yy - 900) / 200), 3); }
    brilhoP(x, 540, 640, 700, LUZS.ambar, 0.35 * u); brilhoP(x, 540, 640, 260, LUZS.luz, 0.5 * u);
    i = morfo(nv, V_PO, V_SOL, u, { de: { cx: 540, cy: 640, esc: 1100, cor: LUZ.ambar, a: 0.35 }, para: { cx: 540, cy: 640, esc: 420, cor: LUZ.ouro, borda: LUZ.luz, rot: t * 0.05 }, t, onda: 0.3, curva: 0.6, i0: i });
    nv.total(i);
  });
};

CENAS.fim = (el, c, B) => {
  cartaoFinal(el, c.ini + 0.1);
};
