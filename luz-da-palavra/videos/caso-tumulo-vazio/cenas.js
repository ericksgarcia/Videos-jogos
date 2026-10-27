// Cenas do vídeo "Caso aberto: o túmulo vazio" — Luz da Palavra, formato CASO ABERTO (investigação em 4 pistas), caderno no tema "noite".
// Fontes (Almeida 1911): Mt 27:62–66 (selo e guarda); Jo 20:1–2 (pedra tirada, "não sabemos onde o puseram"); Jo 20:5–7 (lençóis no chão;
// o lenço "enrolado num lugar à parte" — não "dobrado": a lenda do lenço dobrado não está no texto); Mt 28:11–15 (soldados pagos, "enquanto
// nós dormíamos"); Jo 20:11–16 (Maria chora, pensa ser o hortelão/jardineiro, é chamada pelo nome).
// Formato: carimbo "CASO ABERTO", etiqueta numerada de cada pista, lupa sobre a evidência. O vídeo nunca diz que as pistas "provam":
// "o caso não fechou numa prova, fechou num nome".
// Retenção: paradoxo na abertura + lacuna real ("a última não está no túmulo", paga no nome "Maria"); re-ganchos no fim de cada pista;
// pergunta com resposta de 1 número; final que emenda no começo ("…e lembra: Túmulo lacrado…").
cadTema((window.DADOS && DADOS.tema) || "noite");
const CT_L = 800;
const CT_ref = (pg, txt, t, y = 400) => cadTexto(pg, txt, { x: 920, y, esc: 0.07, fonte: "serif", cor: CAD_VERM, ts: t, te: t + 0.9, alinhar: "dir", seed: 77, livre: true });
function CT_amb(pg, c) {
  const d = pg.g.querySelector("defs"), gr = _cadEl(d, "radialGradient", { id: "ctAmb" + pg.seed, cx: "50%", cy: "100%", r: "60%" });
  _cadEl(gr, "stop", { offset: "0", "stop-color": "#ffcf6a", "stop-opacity": 0.16 }); _cadEl(gr, "stop", { offset: "1", "stop-color": "#ffcf6a", "stop-opacity": 0 });
  _cadEl(pg.gFundo, "rect", { x: -100, y: 1400, width: 1280, height: 700, fill: `url(#ctAmb${pg.seed})` });
  [180, 420, 660, 900].forEach((x, k) => cadFaiscas(pg, x, 1980, c.ini - 1 + k * 0.3, 1e4, { n: 4, alt: 520, pai: pg.gFundo }));
}
const CT_txt = (pg, txt, x, y, esc, ts, seed, o = {}) => cadTexto(pg, txt, { x, y, esc, fonte: o.fonte || "serifb", cor: o.cor || CAD_TINTA, ts, te: ts + (o.dur || 0.6), alinhar: "centro", seed, w: o.w || 7, livre: true, rot: o.rot || 0 });
// etiqueta de evidência com o número da pista
function CT_pista(pg, n, x, y, ts) {
  cadDesenho(pg, "etiqueta", { x, y, esc: 1.15, ts, te: ts + 0.8, seed: 40 + n, cor: CAD_OURO });
  CT_txt(pg, String(n), x + 12, y + 24, 0.17, ts + 0.45, 50 + n, { cor: CAD_OURO, dur: 0.4 });
}
// carimbo "CASO ABERTO": moldura dupla inclinada + palavras, que "batem" no papel
function CT_carimbo(pg, x, y, ts, texto = "CASO ABERTO") {
  cadDesenho(pg, "carimbo", { x, y, esc: 1.25, rot: -6, ts, te: ts + 0.5, seed: 60, cor: CAD_VERM });
  CT_txt(pg, texto, x, y + 16, 0.082, ts + 0.3, 61, { cor: CAD_VERM, rot: -6, dur: 0.6 });
}

CENAS.abertura = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 91, y0: 820, passo: 122 }); cadZoom(pg, c); CT_amb(pg, c);
  // quadro 0: a pedra do túmulo já está desenhada, com a lupa por cima
  cadDesenho(pg, "pedra", { x: 250, y: 1560, esc: 1.2, ts: c.ini - 1.2, te: c.ini + 0.6, seed: 1 });
  cadDesenho(pg, "lupa", { x: 250, y: 1510, esc: 1.0, ts: c.ini - 0.8, te: c.ini + 0.7, seed: 2, cor: CAD_OURO });
  cadTitulo(pg, [{ txt: "CASO ABERTO", fonte: "serifb", max: 0.26, cor: CAD_VERM }, { txt: "4 PISTAS", fonte: "serif", max: 0.2 }], 450, c.ini + 0.05, 1.3, { passo: 205, larg: 780, livre: true });
  cadPalavras(pg, { y0: 820, larg: CT_L, esc: 0.1, yMax: 1300, destaque: ["lacrado", "soldados", "sumido", "roubo", "Quatro", "túmulo."] });
  CT_ref(pg, "cf. Mt 27:62–66", B("selo") + 0.1, 1400);
  CT_carimbo(pg, 700, 1600, B("roubo") + 0.1);
};

CENAS.apoio = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 92, y0: 700, passo: 126 }); cadZoom(pg, c); CT_amb(pg, c);
  cadPalavras(pg, { y0: 700, larg: CT_L, esc: 0.118, yMax: 1300, destaque: ["fé", "perguntas.", "Curte", "amém."] });
  cadDesenho(pg, "coracao", { x: 370, y: 1500, esc: 1.15, ts: B("curte"), te: B("curte") + 1.0, seed: 4 });
  cadDesenho(pg, "balao", { x: 710, y: 1490, esc: 1.2, ts: B("comenta"), te: B("comenta") + 1.1, seed: 5 });
};

CENAS.pista1 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 93, y0: 600, passo: 126 }); cadZoom(pg, c); CT_amb(pg, c);
  CT_ref(pg, "cf. Jo 20:1–2", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 600, larg: CT_L, esc: 0.114, yMax: 1300, destaque: ["Pista", "um:", "pedra.", "escuro", "levaram", "dentro?"] });
  CT_pista(pg, 1, 260, 1500, c.ini + 0.4);
  cadDesenho(pg, "pedra", { x: 590, y: 1560, esc: 1.2, ts: B("pedra"), te: B("pedra") + 1.0, seed: 6 });
  cadDesenho(pg, "lupa", { x: 560, y: 1520, esc: 0.9, ts: B("escuro") + 0.2, te: B("escuro") + 1.0, seed: 7, cor: CAD_OURO });
  cadDesenho(pg, "pergunta", { x: 860, y: 1560, esc: 0.9, ts: B("puseram") - 0.2, te: B("puseram") + 0.8, seed: 8, cor: CAD_VERM });
};

CENAS.pista2 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 94, y0: 560, passo: 124 }); cadZoom(pg, c); CT_amb(pg, c);
  CT_ref(pg, "cf. Jo 20:5–7", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 560, larg: CT_L, esc: 0.108, yMax: 1300, destaque: ["dois:", "lençóis,", "enrolado", "ladrão", "nunca", "dobrado.", "soldados"] });
  CT_pista(pg, 2, 240, 1500, c.ini + 0.4);
  cadDesenho(pg, "lenco", { x: 600, y: 1560, esc: 1.15, ts: B("lenco") - 0.6, te: B("lenco") + 0.6, seed: 9 });
  cadDesenho(pg, "lupa", { x: 640, y: 1530, esc: 0.9, ts: B("lenco") + 0.2, te: B("lenco") + 1.0, seed: 10, cor: CAD_OURO });
  // a lenda do lenço dobrado: um X por cima do "dobrado"
  const m = w.mapa.dobrado && w.mapa.dobrado[0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 30, (m.x1 - m.x0) / 2 + 26, 58, B("mito") + 0.2, B("mito") + 0.8, { com: m });
  cadDesenho(pg, "xis", { x: 860, y: 1560, esc: 0.6, ts: B("mito") + 0.5, te: B("mito") + 1.0, seed: 11, cor: CAD_VERM });
};

CENAS.pista3 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 95, y0: 560, passo: 124 }); cadZoom(pg, c); CT_amb(pg, c);
  CT_ref(pg, "cf. Mt 28:11–15", c.ini + 0.3);
  cadPalavras(pg, { y0: 560, larg: CT_L, esc: 0.108, yMax: 1300, destaque: ["três:", "oficial.", "Dinheiro", "dormíamos.", "dormia,", "quarta", "objeto."] });
  CT_pista(pg, 3, 240, 1500, c.ini + 0.4);
  cadDesenho(pg, "moedas", { x: 560, y: 1560, esc: 1.0, ts: B("dinheiro"), te: B("dinheiro") + 1.0, seed: 12 });
  cadDesenho(pg, "cama", { x: 820, y: 1580, esc: 0.8, ts: B("dormiam"), te: B("dormiam") + 1.0, seed: 13 });
  cadDesenho(pg, "pergunta", { x: 860, y: 1440, esc: 0.6, ts: B("nada"), te: B("nada") + 0.8, seed: 14, cor: CAD_VERM });
};

CENAS.pista4 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 96, y0: 560, passo: 124 }); cadZoom(pg, c); CT_amb(pg, c);
  CT_ref(pg, "cf. Jo 20:11–16", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 560, larg: CT_L, esc: 0.108, yMax: 1300, destaque: ["quatro.", "chora,", "jardineiro.", "Maria.", "nome,", "chorava."] });
  CT_pista(pg, 4, 240, 1500, c.ini + 0.4);
  cadDesenho(pg, "jardineiro", { x: 560, y: 1540, esc: 1.0, ts: B("jardineiro") - 0.8, te: B("jardineiro") + 0.4, seed: 15 });
  CT_txt(pg, "Maria!", 730, 1650, 0.15, B("nome"), 16, { cor: CAD_OURO, dur: 0.7, fonte: "serifb" });
  cadDesenho(pg, "brilho", { x: 900, y: 1540, esc: 0.8, ts: B("nome") + 0.3, te: B("nome") + 1.1, seed: 17, cor: CAD_OURO });
  const m = w.mapa.nome && w.mapa.nome[0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 30, (m.x1 - m.x0) / 2 + 26, 58, B("fechou") + 0.3, B("fechou") + 0.9, { com: m });
  cadDesenho(pg, "estrela", { x: 540, y: 1700, esc: 0.45, ts: B("esperanca") - 0.6, te: B("esperanca") + 0.8, seed: 18, cor: CAD_OURO });
};

CENAS.pergunta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 97, y0: 560, passo: 126 }); cadZoom(pg, c); CT_amb(pg, c);
  const w = cadPalavras(pg, { y0: 560, larg: CT_L, esc: 0.116, escDest: 1.12, yMax: 1300, destaque: ["quatro", "pistas,", "toca?", "número,", "comentários,"] });
  ["1", "2", "3", "4"].forEach((n, k) => CT_txt(pg, n, 230 + k * 110, 1480, 0.16, B("pergunta") + 0.6 + k * 0.3, 70 + k, { cor: CAD_OURO, dur: 0.4 }));
  cadDesenho(pg, "balao", { x: 400, y: 1600, esc: 1.0, ts: B("pergunta") + 1.6, te: B("pergunta") + 2.6, seed: 19 });
  cadDesenho(pg, "seta", { x: 790, y: 1500, esc: 0.7, rot: -28, ts: B("comenta"), te: B("comenta") + 0.9, seed: 20, cor: CAD_VERM });
};

CENAS.fim = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 98, y0: 480, passo: 118 }); cadZoom(pg, c, 1.02); CT_amb(pg, c);
  cadPalavras(pg, { y0: 480, larg: 880, esc: 0.098, yMax: 1250, destaque: ["Salva", "dúvida", "segue", "Luz", "Palavra", "lembra:"] });
  const bx = [[250, 1270], [830, 1270], [830, 1440], [250, 1440], [250, 1270]];
  cadTracos(pg, { t: [bx], h: [{ poly: bx.slice(0, 4), cor: CAD_T.botao || "#e0577f", ang: 40, sp: 10 }] }, { x: 0, y: 0, ts: B("cta"), te: B("cta") + 0.8, cor: CAD_TINTA });
  cadTexto(pg, "SEGUIR", { x: 540, y: 1392, esc: 0.15, fonte: "serifb", cor: CAD_TINTA, ts: B("cta") + 0.6, te: B("cta") + 1.2, alinhar: "centro", seed: 30, w: 7, livre: true });
};
