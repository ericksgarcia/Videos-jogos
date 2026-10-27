// Cenas do vídeo "A oração sem som de Ana" (1 Samuel 1) — Luz da Palavra, caderno no tema "noite", letra serifada.
// Fontes: 1 Sm 1:2–8 (Penina provocava, ela chorava e não comia, em Siló), 1:12–14 (orava com os lábios, a voz não se ouvia; Eli a teve por
// embriagada), 1:15–17 ("derramei a minha alma perante o Senhor"; "vai em paz"), 1:18 (come e "o seu semblante já não era triste").
// Cuidado de tom: nada de "orou e Deus deu o filho"; o vídeo termina no rosto que mudou antes de qualquer resposta.
// Retenção: choque ("chamaram Ana de bêbada") + "o versículo 18 guarda um detalhe"; previsão; falso final ("vai em paz") reaberto; pagamento no fim.
cadTema((window.DADOS && DADOS.tema) || "noite");
const AN_L = 800;
const AN_ref = (pg, txt, t) => cadTexto(pg, txt, { x: 920, y: 400, esc: 0.07, fonte: "serif", cor: CAD_VERM, ts: t, te: t + 0.9, alinhar: "dir", seed: 77, livre: true });
function AN_amb(pg, c) {
  const d = pg.g.querySelector("defs"), gr = _cadEl(d, "radialGradient", { id: "anAmb" + pg.seed, cx: "50%", cy: "100%", r: "60%" });
  _cadEl(gr, "stop", { offset: "0", "stop-color": "#ffcf6a", "stop-opacity": 0.16 }); _cadEl(gr, "stop", { offset: "1", "stop-color": "#ffcf6a", "stop-opacity": 0 });
  _cadEl(pg.gFundo, "rect", { x: -100, y: 1400, width: 1280, height: 700, fill: `url(#anAmb${pg.seed})` });
  [180, 420, 660, 900].forEach((x, k) => cadFaiscas(pg, x, 1980, c.ini - 1 + k * 0.3, 1e4, { n: 4, alt: 520, pai: pg.gFundo }));
}

CENAS.abertura = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 71, y0: 840, passo: 122 }); cadZoom(pg, c); AN_amb(pg, c);
  cadDesenho(pg, "labios", { x: 300, y: 1540, esc: 1.5, ts: c.ini - 1.2, te: c.ini + 0.9, seed: 1 });   // já desenhado no quadro 0
  cadTitulo(pg, [{ txt: "ANTES DA", fonte: "serif", max: 0.2 }, { txt: "RESPOSTA", fonte: "serifb", max: 0.3, cor: CAD_VERM }], 450, c.ini + 0.05, 1.5, { passo: 205, larg: 780 });
  cadPalavras(pg, { y0: 840, larg: AN_L, esc: 0.1, yMax: 1300, destaque: ["bêbada", "orando", "versículo", "rosto"] });
  cadTexto(pg, "1 Samuel 1:18", { x: 920, y: 1400, esc: 0.07, fonte: "serif", cor: CAD_VERM, ts: B("som"), te: B("som") + 0.9, alinhar: "dir", seed: 76, livre: true });
  cadDesenho(pg, "rosto", { x: 790, y: 1560, esc: 0.9, ts: B("voce") - 0.2, te: B("voce") + 1.0, seed: 2 });
};

CENAS.apoio = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 72, y0: 600, passo: 124 }); cadZoom(pg, c); AN_amb(pg, c);
  cadPalavras(pg, { y0: 600, larg: AN_L, esc: 0.112, yMax: 1300, destaque: ["som", "curte", "amém", "Palavra", "palavras"] });
  cadDesenho(pg, "coracao", { x: 370, y: 1500, esc: 1.15, ts: B("curte"), te: B("curte") + 1.0, seed: 4 });
  cadDesenho(pg, "balao", { x: 710, y: 1490, esc: 1.2, ts: B("comenta"), te: B("comenta") + 1.1, seed: 5 });
};

CENAS.ana = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 73, y0: 540, passo: 122 }); cadZoom(pg, c); AN_amb(pg, c);
  AN_ref(pg, "1 Samuel 1:2–8", c.ini + 0.3);
  cadPalavras(pg, { y0: 540, larg: AN_L, esc: 0.106, yMax: 1300, destaque: ["Ana", "filho", "Siló", "rival", "chorava", "templo", "ninguém"] });
  cadDesenho(pg, "rostotriste", { x: 280, y: 1550, esc: 0.9, ts: B("filho"), te: B("filho") + 1.1, seed: 6 });
  cadDesenho(pg, "templo", { x: 740, y: 1550, esc: 0.9, ts: B("comer"), te: B("comer") + 1.3, seed: 7 });
};

CENAS.orou = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 74, y0: 600, passo: 126 }); cadZoom(pg, c); AN_amb(pg, c);
  AN_ref(pg, "1 Samuel 1:12–14", c.ini + 0.3);
  cadPalavras(pg, { y0: 600, larg: AN_L, esc: 0.114, escDest: 1.2, yMax: 1300, destaque: ["lábios", "som", "Eli", "acusa", "Adivinha"] });
  cadDesenho(pg, "labios", { x: 300, y: 1540, esc: 1.2, ts: B("labios") + 0.2, te: B("labios") + 1.3, seed: 8 });
  cadDesenho(pg, "pergunta", { x: 760, y: 1540, esc: 1.0, ts: B("adivinha") + 0.4, te: B("adivinha") + 1.3, seed: 9, cor: CAD_VERM });
};

CENAS.resposta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 75, y0: 540, passo: 124 }); cadZoom(pg, c); AN_amb(pg, c);
  AN_ref(pg, "cf. 1 Samuel 1:15–17", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 540, larg: AN_L, esc: 0.106, yMax: 1300, destaque: ["respeito", "alma", "paz", "repara"] });
  cadDesenho(pg, "coracao", { x: 300, y: 1550, esc: 0.9, ts: B("alma"), te: B("alma") + 1.1, seed: 10 });
  const m = w.mapa.repara && w.mapa.repara[0]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 30, B("depois2") - 0.6, B("depois2") + 0.2, { com: m });
  cadDesenho(pg, "seta", { x: 760, y: 1540, esc: 0.8, ts: B("depois2"), te: B("depois2") + 0.9, seed: 11, cor: CAD_VERM });
};

CENAS.virada = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 76, y0: 580, passo: 126 }); cadZoom(pg, c); AN_amb(pg, c);
  AN_ref(pg, "1 Samuel 1:18", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 580, larg: AN_L, esc: 0.114, escDest: 1.2, yMax: 1300, destaque: ["rosto", "triste", "ainda", "diferente"] });
  cadDesenho(pg, "rostotriste", { x: 300, y: 1550, esc: 0.9, ts: B("come"), te: B("come") + 1.0, seed: 12 });
  cadDesenho(pg, "rosto", { x: 780, y: 1550, esc: 0.9, ts: B("triste"), te: B("triste") + 1.1, seed: 13 });
  cadDesenho(pg, "seta", { x: 540, y: 1550, esc: 0.7, ts: B("triste") + 0.2, te: B("triste") + 0.9, seed: 14, cor: CAD_VERM });
  const m = w.mapa.diferente && w.mapa.diferente[0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 30, (m.x1 - m.x0) / 2 + 26, 58, B("resposta") + 0.3, B("resposta") + 0.9, { com: m });
};

CENAS.pergunta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 77, y0: 580, passo: 128 }); cadZoom(pg, c); AN_amb(pg, c);
  cadPalavras(pg, { y0: 580, larg: AN_L, esc: 0.116, escDest: 1.12, yMax: 1300, destaque: ["oração", "som", "palavra", "comentários"] });
  cadDesenho(pg, "balao", { x: 400, y: 1560, esc: 1.2, ts: B("pergunta") + 1.0, te: B("pergunta") + 2.1, seed: 15 });
  cadDesenho(pg, "seta", { x: 790, y: 1500, esc: 0.7, rot: -28, ts: B("comenta"), te: B("comenta") + 0.9, seed: 16, cor: CAD_VERM });
};

CENAS.fim = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 78, y0: 480, passo: 118 }); cadZoom(pg, c, 1.02); AN_amb(pg, c);
  cadPalavras(pg, { y0: 480, larg: 880, esc: 0.098, yMax: 1250, destaque: ["Salva", "palavra", "segue", "Luz", "Palavra", "lembra"] });
  const bx = [[250, 1270], [830, 1270], [830, 1440], [250, 1440], [250, 1270]];
  cadTracos(pg, { t: [bx], h: [{ poly: bx.slice(0, 4), cor: CAD_T.botao || "#e0577f", ang: 40, sp: 10 }] }, { x: 0, y: 0, ts: B("cta"), te: B("cta") + 0.8, cor: CAD_TINTA });
  cadTexto(pg, "SEGUIR", { x: 540, y: 1392, esc: 0.15, fonte: "serifb", cor: CAD_TINTA, ts: B("cta") + 0.6, te: B("cta") + 1.2, alinhar: "centro", seed: 30, w: 7, livre: true });
};
