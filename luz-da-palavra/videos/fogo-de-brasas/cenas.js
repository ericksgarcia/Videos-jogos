// Cenas do vídeo "O mesmo fogo" (Pedro e Jesus) — Luz da Palavra, estilo CADERNO com tema (roteiro "tema": caderno | pergaminho |
// noite | biblia). Fontes: João 18:17–27 (negação junto ao fogo de brasas, v. 18); João 21:4–17 (praia, brasas v. 9, "amas-me?"
// três vezes). A palavra grega anthrakiá (fogo de brasas) só aparece em Jo 18:18 e 21:9 no NT (Strong G439).
// Retenção: gancho = contraste (dois fogos) + "você"; laço = "repara no que ele perguntou" (pago em "perguntas"); previsão na praia;
// pergunta pessoal; o final volta ao começo.
cadTema((window.DADOS && DADOS.tema) || "caderno");
const FB_ref = (pg, txt, t) => cadTexto(pg, txt, { x: 930, y: 420, esc: 0.072, fonte: "felix", cor: CAD_VERM, ts: t, te: t + 0.9, alinhar: "dir", seed: 77 });
function FB_fogo(pg, x, y, esc, ts, te, seed) { cadDesenho(pg, "fogueira", { x, y, esc, ts, te, seed }); cadFaiscas(pg, x, y - 40 * esc, te - 0.3, 1e4, { n: Math.round(10 * esc), alt: 240 * esc }); }

CENAS.abertura = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 41, y0: 820 }); cadZoom(pg, c);
  // quadro 0: a fogueira da noite já está se desenhando e soltando brasas enquanto a caneta escreve o gancho
  FB_fogo(pg, 300, 1520, 1.15, c.ini, c.ini + 1.3, 1);
  cadTitulo(pg, [{ txt: "DOIS FOGOS,", fonte: "felix", max: 0.2 }, { txt: "OUTRO FIM", fonte: "elfin", max: 0.34, cor: CAD_VERM, marca: true }], 400, c.ini + 0.05, 1.7, { passo: 230 });
  cadPalavras(pg, { y0: 820, larg: 920, esc: 0.1, destaque: ["negou", "fogo", "outro", "errou", "perguntou"] });
  FB_fogo(pg, 780, 1520, 1.15, B("outro"), B("outro") + 1.3, 2);
  cadDesenho(pg, "seta", { x: 540, y: 1400, esc: 0.75, ts: B("outro") + 0.4, te: B("outro") + 1.2, seed: 3, cor: CAD_VERM });
};

CENAS.apoio = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 42, y0: 600 }); cadZoom(pg, c);
  cadPalavras(pg, { y0: 600, larg: 820, esc: 0.11, destaque: ["segunda", "chance", "curte", "amém", "primeiro"] });
  cadDesenho(pg, "coracao", { x: 380, y: 1300, esc: 1.1, ts: B("curte"), te: B("curte") + 1.0, seed: 4 });
  cadDesenho(pg, "balao", { x: 720, y: 1290, esc: 1.15, ts: B("comenta"), te: B("comenta") + 1.1, seed: 5 });
};

CENAS.noite = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 43, y0: 540 }); cadZoom(pg, c);
  FB_ref(pg, "cf. João 18:17–27", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 540, larg: 840, esc: 0.105, destaque: ["prisão", "brasas", "detalhe", "Três", "negou", "galo"] });
  FB_fogo(pg, 480, 1530, 1.0, B("brasas"), B("brasas") + 1.2, 6);
  cadDesenho(pg, "sentado", { x: 230, y: 1530, esc: 1.15, ts: B("brasas") + 0.2, te: B("brasas") + 1.6, seed: 7 });
  [700, 790, 880].forEach((x, k) => cadDesenho(pg, "xis", { x, y: 1360, esc: 0.5, ts: B("negou") - 0.9 + k * 0.3, te: B("negou") - 0.6 + k * 0.3, seed: 8 + k, cor: CAD_VERM }));
  cadDesenho(pg, "galo", { x: 800, y: 1560, esc: 0.95, ts: B("galo"), te: B("galo") + 1.3, seed: 12 });
};

CENAS.praia = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 44, y0: 540 }); cadZoom(pg, c);
  FB_ref(pg, "cf. João 21:4–9", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 540, larg: 840, esc: 0.105, destaque: ["ressuscitado", "Adivinha", "brasas", "grego", "duas", "manhã"] });
  cadDesenho(pg, "sol", { x: 820, y: 1400, esc: 0.75, ts: B("praia"), te: B("praia") + 1.0, seed: 13, cor: CAD_OURO });
  cadDesenho(pg, "ondas", { x: 260, y: 1600, esc: 0.9, ts: B("praia") + 0.2, te: B("praia") + 1.2, seed: 14, cor: CAD_AZUL });
  FB_fogo(pg, 540, 1540, 1.05, B("brasas2"), B("brasas2") + 1.2, 15);
  cadDesenho(pg, "peixe", { x: 800, y: 1620, esc: 0.6, ts: B("brasas2") + 0.8, te: B("brasas2") + 1.6, seed: 16 });
  const m = w.mapa.duas && w.mapa.duas[0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 26, (m.x1 - m.x0) / 2 + 24, 52, B("duas") + 0.3, B("duas") + 0.9);
};

CENAS.perguntas = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 45, y0: 600, passo: 120 }); cadZoom(pg, c);
  FB_ref(pg, "cf. João 21:15–17", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 600, larg: 820, esc: 0.115, escDest: 1.25, destaque: ["amas", "Três", "negações", "restaurar"] });
  cadDesenho(pg, "coracao", { x: 540, y: 1430, esc: 1.25, ts: B("amas"), te: B("amas") + 1.2, seed: 17 });
  const m = w.mapa.restaurar && w.mapa.restaurar[0]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 28, B("restaurar") + 0.4, B("restaurar") + 1.0);
};

CENAS.pergunta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 46, y0: 560, passo: 130 }); cadZoom(pg, c);
  cadPalavras(pg, { y0: 560, larg: 820, esc: 0.12, escDest: 1.15, destaque: ["hoje", "amas", "responderia"] });
  cadDesenho(pg, "balao", { x: 400, y: 1360, esc: 1.3, ts: B("pergunta") + 0.6, te: B("pergunta") + 1.8, seed: 18 });
  cadDesenho(pg, "seta", { x: 800, y: 1260, esc: 0.62, ts: B("comenta"), te: B("comenta") + 0.9, seed: 19, cor: CAD_VERM });
};

CENAS.aplicacao = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 47, y0: 660, passo: 124 }); cadZoom(pg, c);
  const w = cadPalavras(pg, { y0: 660, larg: 820, esc: 0.12, escDest: 1.2, destaque: ["brasas", "foge", "encontra", "lá"] });
  FB_fogo(pg, 540, 1500, 1.2, B("falhou"), B("falhou") + 1.2, 20);
  const m = w.mapa["lá"] && w.mapa["lá"][0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 28, (m.x1 - m.x0) / 2 + 26, 56, B("la") + 0.4, B("la") + 1.0);
};

CENAS.fim = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 48, y0: 520 }); cadZoom(pg, c, 1.02);
  cadPalavras(pg, { y0: 520, larg: 840, esc: 0.11, destaque: ["Salva", "errou", "segue", "Luz", "Palavra", "lembra"] });
  const bx = [[260, 1040], [820, 1040], [820, 1160], [260, 1160], [260, 1040]];
  cadTracos(pg, { t: [bx], h: [{ poly: bx.slice(0, 4), cor: "#e0577f", ang: 40, sp: 9 }] }, { x: 0, y: 0, ts: B("cta"), te: B("cta") + 0.9, cor: CAD_TINTA });
  cadTexto(pg, "SEGUIR", { x: 540, y: 1120, esc: 0.17, fonte: "elfin", cor: CAD_TINTA, ts: B("cta") + 0.9, te: B("cta") + 1.5, alinhar: "centro", seed: 30, w: 6 });
  const t0 = B("lembra");
  cadTexto(pg, "Ele te encontra lá.", { x: 540, y: 1400, esc: cadAjusta("Ele te encontra lá.", "elfin", 820, 0.24), fonte: "elfin", cor: CAD_VERM, ts: t0 + 0.1, te: Math.min(c.fim - 0.1, t0 + 1.7), alinhar: "centro", seed: 31, w: 7 });
};
