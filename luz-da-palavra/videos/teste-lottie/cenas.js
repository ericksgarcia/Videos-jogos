// TESTE: cena com animação Lottie (fogo da LottieFiles, id 54405) + Pedro desenhado por nós + escrita de luz.
cadTema("noite");
CENAS.noite = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 91, y0: 540, passo: 124 }); cadZoom(pg, c, 1.03);
  const d = pg.g.querySelector("defs"), gr = _cadEl(d, "radialGradient", { id: "tlLuz", cx: "50%", cy: "78%", r: "55%" });
  _cadEl(gr, "stop", { offset: "0", "stop-color": "#ff9a3c", "stop-opacity": 0.38 }); _cadEl(gr, "stop", { offset: "1", "stop-color": "#ff9a3c", "stop-opacity": 0 });
  _cadEl(pg.gFundo, "rect", { x: -100, y: 900, width: 1280, height: 1200, fill: "url(#tlLuz)" });   // a luz do fogo no chão
  cadPalavras(pg, { y0: 540, larg: 800, esc: 0.108, yMax: 1100, destaque: ["prisão", "brasas", "negou", "galo"] });
  // fogo animado (Lottie, em laço) e Pedro encolhido ao lado, desenhado por nós
  const f = lottieEm(pg.g, "fogo", 640, 1430, 560, 630, { ini: c.ini, fim: c.fim + 1, loop: true });
  cadDesenho(pg, "encolhido", { x: 300, y: 1560, esc: 1.9, ts: c.ini + 0.4, te: c.ini + 2.2, seed: 7 });
  tl.fromTo(f, { opacity: 0 }, { opacity: 1, duration: 1.0, ease: "power2.out", immediateRender: false }, c.ini + 0.2);
};
