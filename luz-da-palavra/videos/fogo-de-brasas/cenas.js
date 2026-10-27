// Cenas do vídeo "Dois fogos: Pedro e Jesus" — Luz da Palavra, estilo CADERNO no tema "noite" (escrita de luz dourada sobre
// azul-noite; o roteiro escolhe o tema em "tema"). Fontes: João 18:17–27 (negação junto ao fogo de brasas, v. 18); João 21:4–17
// (praia, brasas v. 9, "amas-me?" três vezes). A palavra grega anthrakiá (fogo de brasas) só aparece em Jo 18:18 e 21:9 no NT
// (Strong G439).
// Retenção: gancho = contraste (dois fogos) + "você"; laço "o que liga esses dois fogos" pago na cena "detalhe" (penúltima);
// previsões ("Junto a quê?", "Adivinha quantas vezes"); pergunta de completar; o final emenda no começo.
// Áreas: texto entre x 140 e 940 (larg 800) e de y ≥ 320; rabiscos na metade de baixo, longe da faixa de botões (x > 950).
cadTema((window.DADOS && DADOS.tema) || "noite");
const FB_L = 800;
const FB_ref = (pg, txt, t) => cadTexto(pg, txt, { x: 920, y: 400, esc: 0.07, fonte: "felix", cor: CAD_VERM, ts: t, te: t + 0.9, alinhar: "dir", seed: 77, livre: true });
function FB_fogo(pg, x, y, esc, ts, seed) { cadDesenho(pg, "fogueira", { x, y, esc, ts, te: ts + 0.9, seed }); cadFaiscas(pg, x, y - 40 * esc, ts + 0.6, 1e4, { n: Math.round(10 * esc), alt: 260 * esc }); }
// vida no pé da tela: um calor de brasas e faíscas subindo devagar, em todas as cenas
function FB_amb(pg, c) {
  const d = pg.g.querySelector("defs"), gr = _cadEl(d, "radialGradient", { id: "fbAmb" + pg.seed, cx: "50%", cy: "100%", r: "60%" });
  _cadEl(gr, "stop", { offset: "0", "stop-color": "#ff9a3c", "stop-opacity": 0.2 }); _cadEl(gr, "stop", { offset: "1", "stop-color": "#ff9a3c", "stop-opacity": 0 });
  pg.gFundo.appendChild(_cadEl(pg.gFundo, "rect", { x: -100, y: 1400, width: 1280, height: 700, fill: `url(#fbAmb${pg.seed})` }));
  [180, 420, 660, 900].forEach((x, k) => cadFaiscas(pg, x, 1980, c.ini - 1 + k * 0.3, 1e4, { n: 4, alt: 520, pai: pg.gFundo }));
}

CENAS.abertura = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 41, y0: 820, passo: 122 }); cadZoom(pg, c); FB_amb(pg, c);
  // quadro 0: a fogueira da noite já se desenha e solta brasas enquanto a caneta escreve o gancho
  FB_fogo(pg, 300, 1560, 1.45, c.ini, 1);
  cadTitulo(pg, [{ txt: "ONDE JESUS", fonte: "felix", max: 0.19 }, { txt: "TE ESPERA", fonte: "felix", max: 0.27, cor: CAD_VERM }], 450, c.ini + 0.05, 1.7, { passo: 200, larg: 780 });
  cadPalavras(pg, { y0: 820, larg: FB_L, esc: 0.1, yMax: 1320, destaque: ["fogos", "negou", "outro", "esperou", "errou", "liga"] });
  FB_fogo(pg, 780, 1560, 1.45, B("outro"), 2);
  cadDesenho(pg, "seta", { x: 540, y: 1480, esc: 0.7, ts: B("outro") + 0.5, te: B("outro") + 1.2, seed: 3, cor: CAD_VERM });
};

CENAS.apoio = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 42, y0: 560, passo: 122 }); cadZoom(pg, c); FB_amb(pg, c);
  cadPalavras(pg, { y0: 560, larg: FB_L, esc: 0.104, yMax: 1360, destaque: ["segunda", "chance", "Curte", "amém", "primeiro"] });
  cadDesenho(pg, "coracao", { x: 370, y: 1480, esc: 1.15, ts: B("curte"), te: B("curte") + 1.0, seed: 4 });
  cadDesenho(pg, "balao", { x: 710, y: 1470, esc: 1.2, ts: B("comenta"), te: B("comenta") + 1.1, seed: 5 });
};

CENAS.noite = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 43, y0: 560, passo: 124 }); cadZoom(pg, c); FB_amb(pg, c);
  FB_ref(pg, "cf. João 18:17–27", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 560, larg: FB_L, esc: 0.108, yMax: 1300, destaque: ["prisão", "brasas", "Guarda", "Três", "negou", "galo"] });
  FB_fogo(pg, 520, 1590, 1.05, B("brasas"), 6);
  cadDesenho(pg, "encolhido", { x: 290, y: 1560, esc: 1.35, ts: B("brasas") + 0.3, te: B("brasas") + 1.5, seed: 7 });
  const m = (w.mapa.brasas || [])[1]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 30, (m.x1 - m.x0) / 2 + 24, 58, B("guarda") + 0.8, B("guarda") + 1.4, { com: m });
  [700, 790, 880].forEach((x, k) => cadDesenho(pg, "xis", { x, y: 1420, esc: 0.5, ts: B("negou") - 0.9 + k * 0.3, te: B("negou") - 0.6 + k * 0.3, seed: 8 + k, cor: CAD_VERM }));
  cadDesenho(pg, "galo", { x: 800, y: 1620, esc: 0.95, ts: B("galo"), te: B("galo") + 1.2, seed: 12 });
};

CENAS.praia = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 44, y0: 620, passo: 128 }); cadZoom(pg, c); FB_amb(pg, c);
  FB_ref(pg, "cf. João 21:4–9", c.ini + 0.3);
  cadPalavras(pg, { y0: 620, larg: FB_L, esc: 0.115, yMax: 1300, destaque: ["ressuscitado", "praia", "quê", "brasas"] });
  cadDesenho(pg, "sol", { x: 800, y: 1400, esc: 0.75, ts: B("praia"), te: B("praia") + 1.0, seed: 13, cor: CAD_OURO });
  cadDesenho(pg, "ondas", { x: 250, y: 1640, esc: 0.9, ts: B("praia") + 0.2, te: B("praia") + 1.2, seed: 14, cor: CAD_AZUL });
  FB_fogo(pg, 560, 1590, 1.3, B("brasas2"), 15);
  cadDesenho(pg, "peixe", { x: 810, y: 1650, esc: 0.6, ts: B("brasas2") + 0.8, te: B("brasas2") + 1.6, seed: 16 });
};

CENAS.perguntas = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 45, y0: 560, passo: 124 }); cadZoom(pg, c); FB_amb(pg, c);
  FB_ref(pg, "cf. João 21:15–17", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 560, larg: FB_L, esc: 0.105, yMax: 1380, destaque: ["amas", "Três", "negações", "restaurar", "detalhe"] });
  // os três X da noite viram três corações
  [330, 540, 750].forEach((x, k) => cadDesenho(pg, "coracao", { x, y: 1580, esc: 0.75, ts: B("cada") - 0.6 + k * 0.45, te: B("cada") + 0.1 + k * 0.45, seed: 17 + k }));
  const m = w.mapa.restaurar && w.mapa.restaurar[0]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 30, B("restaurar") + 0.4, B("restaurar") + 1.0, { com: m });
};

CENAS.pergunta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 46, y0: 540, passo: 124 }); cadZoom(pg, c); FB_amb(pg, c);
  FB_ref(pg, "cf. João 21:17", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 540, larg: FB_L, esc: 0.106, yMax: 1300, destaque: ["amo", "você", "Completa", "eu…"] });
  const m = w.mapa.completa && w.mapa.completa[0]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 30, B("comenta") + 0.5, B("comenta") + 1.0, { com: m });
  cadDesenho(pg, "balao", { x: 400, y: 1580, esc: 1.2, ts: B("pergunta") + 0.6, te: B("pergunta") + 1.8, seed: 18 });
  cadDesenho(pg, "seta", { x: 780, y: 1500, esc: 0.7, rot: -28, ts: B("comenta"), te: B("comenta") + 0.9, seed: 19, cor: CAD_VERM });
};

CENAS.detalhe = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 49, y0: 540, passo: 124 }); cadZoom(pg, c); FB_amb(pg, c);
  cadPalavras(pg, { y0: 540, larg: FB_L, esc: 0.105, yMax: 1300, destaque: ["grego", "palavra", "Adivinha", "Duas", "noite", "manhã"] });
  FB_fogo(pg, 290, 1580, 1.1, B("grego"), 23);
  FB_fogo(pg, 790, 1580, 1.1, B("duas") - 0.2, 24);
  cadTexto(pg, "2", { x: 540, y: 1600, esc: 0.2, fonte: "felix", cor: CAD_VERM, ts: B("duas"), te: B("duas") + 0.5, alinhar: "centro", seed: 25, w: 8, livre: true });
  cadCirculo(pg, 546, 1532, 78, 96, B("duas") + 0.5, B("duas") + 1.1);
  cadTexto(pg, "Jo 18:18 e 21:9", { x: 920, y: 400, esc: 0.07, fonte: "felix", cor: CAD_VERM, ts: B("manha"), te: B("manha") + 0.9, alinhar: "dir", seed: 26, livre: true });
};

CENAS.aplicacao = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 47, y0: 680, passo: 132 }); cadZoom(pg, c); FB_amb(pg, c);
  const w = cadPalavras(pg, { y0: 680, larg: FB_L, esc: 0.12, yMax: 1300, destaque: ["brasas", "foge", "encontra", "lá"] });
  FB_fogo(pg, 540, 1580, 1.3, B("falhou"), 20);
  const m = w.mapa["lá"] && w.mapa["lá"][0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 30, (m.x1 - m.x0) / 2 + 26, 58, B("la") + 0.4, B("la") + 1.0, { com: m });
};

CENAS.fim = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 48, y0: 540, passo: 124 }); cadZoom(pg, c, 1.02); FB_amb(pg, c);
  cadPalavras(pg, { y0: 540, larg: FB_L, esc: 0.106, yMax: 1200, destaque: ["Salva", "errou", "segue", "Luz", "Palavra", "lembra"] });
  const bx = [[250, 1270], [830, 1270], [830, 1440], [250, 1440], [250, 1270]];
  cadTracos(pg, { t: [bx], h: [{ poly: bx.slice(0, 4), cor: CAD_T.botao || "#e0577f", ang: 40, sp: 10 }] }, { x: 0, y: 0, ts: B("cta"), te: B("cta") + 0.8, cor: CAD_TINTA });
  cadTexto(pg, "SEGUIR", { x: 540, y: 1392, esc: 0.15, fonte: "felix", cor: CAD_TINTA, ts: B("cta") + 0.6, te: B("cta") + 1.2, alinhar: "centro", seed: 30, w: 7, livre: true });
};
