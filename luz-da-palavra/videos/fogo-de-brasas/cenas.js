// Cenas do vídeo "O mesmo fogo" (Pedro e Jesus) — Luz da Palavra, estilo CADERNO com tema (roteiro "tema": caderno | pergaminho |
// noite | biblia). Fontes: João 18:17–27 (negação junto ao fogo de brasas, v. 18); João 21:4–17 (praia, brasas v. 9, "amas-me?"
// três vezes). A palavra grega anthrakiá (fogo de brasas) só aparece em Jo 18:18 e 21:9 no NT (Strong G439).
// Retenção: gancho = contraste (dois fogos) + "você"; laço = "repara no que ele perguntou" (pago em "perguntas"); previsão na praia;
// pergunta pessoal; o final volta ao começo.
cadTema((window.DADOS && DADOS.tema) || "caderno");
const FB_ref = (pg, txt, t) => cadTexto(pg, txt, { x: 930, y: 420, esc: 0.072, fonte: "felix", cor: CAD_VERM, ts: t, te: t + 0.9, alinhar: "dir", seed: 77 });
function FB_fogo(pg, x, y, esc, ts, te, seed) { cadDesenho(pg, "fogueira", { x, y, esc, ts, te, seed }); cadFaiscas(pg, x, y - 40 * esc, te - 0.3, 1e4, { n: Math.round(10 * esc), alt: 240 * esc }); }

CENAS.abertura = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 41, y0: 760 }); cadZoom(pg, c);
  // quadro 0: a fogueira da noite já se desenha e solta brasas enquanto a caneta escreve o gancho
  FB_fogo(pg, 290, 1470, 1.45, c.ini, c.ini + 1.3, 1);
  cadTitulo(pg, [{ txt: "ONDE JESUS", fonte: "felix", max: 0.2 }, { txt: "TE ESPERA", fonte: "elfin", max: 0.34, cor: CAD_VERM, marca: true }], 370, c.ini + 0.05, 1.7, { passo: 205 });
  cadPalavras(pg, { y0: 760, larg: 940, esc: 0.096, yMax: 1300, destaque: ["fogos", "negou", "outro", "esperou", "errou", "liga"] });
  FB_fogo(pg, 790, 1470, 1.45, B("outro"), B("outro") + 1.3, 2);
  cadDesenho(pg, "seta", { x: 540, y: 1400, esc: 0.7, ts: B("outro") + 0.5, te: B("outro") + 1.3, seed: 3, cor: CAD_VERM });
};

CENAS.apoio = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 42, y0: 600 }); cadZoom(pg, c);
  cadPalavras(pg, { y0: 600, larg: 820, esc: 0.11, destaque: ["segunda", "chance", "Curte", "amém", "primeiro"] });
  cadDesenho(pg, "coracao", { x: 380, y: 1300, esc: 1.1, ts: B("curte"), te: B("curte") + 1.0, seed: 4 });
  cadDesenho(pg, "balao", { x: 720, y: 1290, esc: 1.15, ts: B("comenta"), te: B("comenta") + 1.1, seed: 5 });
};

CENAS.noite = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 43, y0: 560 }); cadZoom(pg, c);
  FB_ref(pg, "cf. João 18:17–27", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 560, larg: 840, esc: 0.11, destaque: ["prisão", "brasas", "Guarda", "Três", "negou", "galo"] });
  FB_fogo(pg, 480, 1530, 1.0, B("brasas"), B("brasas") + 1.2, 6);
  cadDesenho(pg, "sentado", { x: 230, y: 1530, esc: 1.15, ts: B("brasas") + 0.2, te: B("brasas") + 1.6, seed: 7 });
  const m = (w.mapa.brasas || [])[1]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 28, (m.x1 - m.x0) / 2 + 24, 56, B("guarda") + 0.8, B("guarda") + 1.4, { com: m });
  [700, 790, 880].forEach((x, k) => cadDesenho(pg, "xis", { x, y: 1380, esc: 0.5, ts: B("negou") - 0.9 + k * 0.3, te: B("negou") - 0.6 + k * 0.3, seed: 8 + k, cor: CAD_VERM }));
  cadDesenho(pg, "galo", { x: 800, y: 1570, esc: 0.95, ts: B("galo"), te: B("galo") + 1.3, seed: 12 });
};

CENAS.praia = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 44, y0: 600, passo: 120 }); cadZoom(pg, c);
  FB_ref(pg, "cf. João 21:4–9", c.ini + 0.3);
  cadPalavras(pg, { y0: 600, larg: 840, esc: 0.12, escDest: 1.25, destaque: ["ressuscitado", "praia", "quê", "brasas"] });
  cadDesenho(pg, "sol", { x: 820, y: 1330, esc: 0.75, ts: B("praia"), te: B("praia") + 1.0, seed: 13, cor: CAD_OURO });
  cadDesenho(pg, "ondas", { x: 250, y: 1560, esc: 0.9, ts: B("praia") + 0.2, te: B("praia") + 1.2, seed: 14, cor: CAD_AZUL });
  FB_fogo(pg, 560, 1500, 1.25, B("brasas2"), B("brasas2") + 1.2, 15);
  cadDesenho(pg, "peixe", { x: 820, y: 1600, esc: 0.6, ts: B("brasas2") + 0.8, te: B("brasas2") + 1.6, seed: 16 });
};

CENAS.perguntas = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 45, y0: 560, passo: 116 }); cadZoom(pg, c);
  FB_ref(pg, "cf. João 21:15–17", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 560, larg: 840, esc: 0.105, escDest: 1.2, yMax: 1400, destaque: ["amas", "Três", "negações", "restaurar", "detalhe"] });
  // os três X da noite viram três corações
  [330, 540, 750].forEach((x, k) => cadDesenho(pg, "coracao", { x, y: 1540, esc: 0.75, ts: B("cada") - 0.6 + k * 0.45, te: B("cada") + 0.1 + k * 0.45, seed: 17 + k }));
  const m = w.mapa.restaurar && w.mapa.restaurar[0]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 28, B("restaurar") + 0.4, B("restaurar") + 1.0, { com: m });
};

CENAS.pergunta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 46, y0: 540, passo: 118 }); cadZoom(pg, c);
  FB_ref(pg, "cf. João 21:17", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 540, larg: 860, esc: 0.108, escDest: 1.15, yMax: 1400, destaque: ["amo", "você", "Completa", "eu…"] });
  const m = w.mapa.completa && w.mapa.completa[0]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 28, B("comenta") + 0.5, B("comenta") + 1.0, { com: m });
  cadDesenho(pg, "balao", { x: 400, y: 1560, esc: 1.2, ts: B("pergunta") + 0.6, te: B("pergunta") + 1.8, seed: 18 });
  cadDesenho(pg, "seta", { x: 790, y: 1500, esc: 0.7, rot: -28, ts: B("comenta"), te: B("comenta") + 0.9, seed: 19, cor: CAD_VERM });
};

CENAS.detalhe = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 49, y0: 560, passo: 120 }); cadZoom(pg, c);
  const w = cadPalavras(pg, { y0: 540, larg: 860, esc: 0.105, escDest: 1.22, yMax: 1330, destaque: ["grego", "palavra", "Adivinha", "Duas", "noite", "manhã"] });
  FB_fogo(pg, 300, 1530, 1.1, B("grego"), B("grego") + 1.2, 23);
  FB_fogo(pg, 780, 1530, 1.1, B("duas") - 0.2, B("duas") + 1.0, 24);
  cadTexto(pg, "2", { x: 540, y: 1560, esc: 0.32, fonte: "elfin", cor: CAD_VERM, ts: B("duas"), te: B("duas") + 0.6, alinhar: "centro", seed: 25, w: 8 });
  cadCirculo(pg, 545, 1510, 80, 90, B("duas") + 0.6, B("duas") + 1.2);
  cadTexto(pg, "Jo 18:18 e 21:9", { x: 930, y: 420, esc: 0.07, fonte: "felix", cor: CAD_VERM, ts: B("manha"), te: B("manha") + 0.9, alinhar: "dir", seed: 26 });
};

CENAS.aplicacao = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 47, y0: 660, passo: 124 }); cadZoom(pg, c);
  const w = cadPalavras(pg, { y0: 660, larg: 820, esc: 0.12, escDest: 1.2, destaque: ["brasas", "foge", "encontra", "lá"] });
  FB_fogo(pg, 540, 1500, 1.2, B("falhou"), B("falhou") + 1.2, 20);
  const m = w.mapa["lá"] && w.mapa["lá"][0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 28, (m.x1 - m.x0) / 2 + 26, 56, B("la") + 0.4, B("la") + 1.0, { com: m });
};

CENAS.fim = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 48, y0: 520 }); cadZoom(pg, c, 1.02);
  cadPalavras(pg, { y0: 520, larg: 840, esc: 0.11, destaque: ["Salva", "errou", "segue", "Luz", "Palavra", "lembra"] });
  const bx = [[260, 1040], [820, 1040], [820, 1160], [260, 1160], [260, 1040]];
  cadTracos(pg, { t: [bx], h: [{ poly: bx.slice(0, 4), cor: CAD_T.botao || "#e0577f", ang: 40, sp: 9 }] }, { x: 0, y: 0, ts: B("cta"), te: B("cta") + 0.9, cor: CAD_TINTA });
  cadTexto(pg, "SEGUIR", { x: 540, y: 1120, esc: 0.17, fonte: "elfin", cor: CAD_TINTA, ts: B("cta") + 0.7, te: B("cta") + 1.3, alinhar: "centro", seed: 30, w: 6, livre: true });
};
