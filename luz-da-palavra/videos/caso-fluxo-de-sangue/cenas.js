// Cenas do vídeo "Caso aberto: a mulher que já estava curada" (Marcos 5:21–43) — Luz da Palavra, formato CASO ABERTO #2, caderno noite.
// Fontes (Almeida 1911): Mc 5:22–24 (Jairo pede ajuda, filha "nas últimas"; Jesus "foi com ele"); 5:25–28 (doze anos, muitos médicos, gastou tudo,
// "se tão-somente tocar nas suas vestes, sararei"); 5:29 (logo secou, sentiu no corpo estar já curada); 5:30–32 (Jesus conhece que a virtude saíra,
// "voltou-se para a multidão": "Quem tocou nas minhas vestes?", discípulos, "olhava em redor"); 5:33–34 (temendo e tremendo, toda a verdade;
// "Filha, a tua fé te salvou; vai em paz"); 5:35–36 ("Não temas, crê somente", dito a Jairo); 5:41–42 (a menina levantou-se; tinha doze anos).
// O vídeo nunca diz que as pistas "provam" e não atribui intenção a Jesus ("o texto registra", "no texto, ele não a repreende").
// Retenção: paradoxo (curada, e ele se volta a caminho de uma menina nas últimas), lacuna "uma palavra que o texto registra" paga em "Filha",
// previsão ("Pensa rápido"), "Não temas" preparado para a opção B da pergunta, final que emenda ("…e lembra: Ela já estava curada.").
cadTema((window.DADOS && DADOS.tema) || "noite");
const CF_L = 800;
const CF_ref = (pg, txt, t, y = 400) => cadTexto(pg, txt, { x: 920, y, esc: 0.07, fonte: "serif", cor: CAD_VERM, ts: t, te: t + 0.9, alinhar: "dir", seed: 77, livre: true });
function CF_amb(pg, c) {
  const d = pg.g.querySelector("defs"), gr = _cadEl(d, "radialGradient", { id: "cfAmb" + pg.seed, cx: "50%", cy: "100%", r: "60%" });
  _cadEl(gr, "stop", { offset: "0", "stop-color": "#ffcf6a", "stop-opacity": 0.16 }); _cadEl(gr, "stop", { offset: "1", "stop-color": "#ffcf6a", "stop-opacity": 0 });
  _cadEl(pg.gFundo, "rect", { x: -100, y: 1400, width: 1280, height: 700, fill: `url(#cfAmb${pg.seed})` });
  [180, 420, 660, 900].forEach((x, k) => cadFaiscas(pg, x, 1980, c.ini - 1 + k * 0.3, 1e4, { n: 4, alt: 520, pai: pg.gFundo }));
}
const CF_txt = (pg, txt, x, y, esc, ts, seed, o = {}) => cadTexto(pg, txt, { x, y, esc, fonte: o.fonte || "serifb", cor: o.cor || CAD_TINTA, ts, te: ts + (o.dur || 0.6), alinhar: "centro", seed, w: o.w || 7, livre: true, rot: o.rot || 0 });
function CF_pista(pg, n, x, y, ts) {
  cadDesenho(pg, "etiqueta", { x, y, esc: 1.15, ts, te: ts + 0.8, seed: 40 + n, cor: CAD_OURO });
  CF_txt(pg, String(n), x + 12, y + 24, 0.17, ts + 0.45, 50 + n, { cor: CAD_OURO, dur: 0.4 });
}
function CF_carimbo(pg, x, y, ts, texto = "CASO ABERTO") {
  cadDesenho(pg, "carimbo", { x, y, esc: 1.25, rot: -6, ts, te: ts + 0.5, seed: 60, cor: CAD_VERM });
  CF_txt(pg, texto, x, y + 15, 0.074, ts + 0.3, 61, { cor: CAD_VERM, rot: -6, dur: 0.6 });
}

CENAS.abertura = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 101, y0: 880, passo: 118 }); cadZoom(pg, c); CF_amb(pg, c);
  // quadro 0: o manto já está desenhado, com a lupa por cima e uma gota que cai
  cadDesenho(pg, "manto", { x: 270, y: 1540, esc: 1.15, ts: c.ini - 1.2, te: c.ini + 0.6, seed: 1 });
  cadDesenho(pg, "lupa", { x: 300, y: 1510, esc: 1.0, ts: c.ini - 0.8, te: c.ini + 0.7, seed: 2, cor: CAD_OURO });
  CF_txt(pg, "CASO ABERTO", 540, 370, 0.075, c.ini + 0.05, 3, { cor: CAD_VERM, dur: 0.7, fonte: "serifb" });
  cadTitulo(pg, [{ txt: "JÁ CURADA.", fonte: "serif", max: 0.2 }, { txt: "POR QUE PAROU?", fonte: "serifb", max: 0.2, cor: CAD_VERM }], 520, c.ini + 0.1, 1.3, { passo: 175, larg: 800, livre: true });
  cadPalavras(pg, { y0: 880, larg: CF_L, esc: 0.098, yMax: 1300, destaque: ["curada.", "voltou.", "esperava.", "Quatro", "palavra"] });
  CF_ref(pg, "cf. Mc 5:21–43", B("ultimas") + 0.1, 1420);
  CF_carimbo(pg, 720, 1600, B("pistas") + 0.1);
};

CENAS.apoio = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 102, y0: 700, passo: 126 }); cadZoom(pg, c); CF_amb(pg, c);
  cadPalavras(pg, { y0: 700, larg: CF_L, esc: 0.118, yMax: 1300, destaque: ["multidão,", "procurou", "pessoa.", "Curte", "amém.", "caso."] });
  cadDesenho(pg, "multidao", { x: 300, y: 1560, esc: 1.2, ts: c.ini + 0.4, te: c.ini + 1.4, seed: 3 });
  cadDesenho(pg, "coracao", { x: 600, y: 1500, esc: 1.05, ts: B("curte"), te: B("curte") + 1.0, seed: 4 });
  cadDesenho(pg, "balao", { x: 800, y: 1490, esc: 1.0, ts: B("comenta"), te: B("comenta") + 1.1, seed: 5 });
};

CENAS.pista1 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 103, y0: 580, passo: 124 }); cadZoom(pg, c); CF_amb(pg, c);
  CF_ref(pg, "cf. Mc 5:25–28", c.ini + 0.3);
  cadPalavras(pg, { y0: 580, larg: CF_L, esc: 0.108, yMax: 1300, destaque: ["Pista", "um:", "doze", "gastou", "piorou.", "sararei."] });
  CF_pista(pg, 1, 240, 1500, c.ini + 0.4);
  CF_txt(pg, "12", 560, 1580, 0.24, B("um") + 0.1, 8, { cor: CAD_OURO, dur: 0.6 });
  cadDesenho(pg, "gota", { x: 780, y: 1520, esc: 0.9, ts: B("anos"), te: B("anos") + 0.9, seed: 9, cor: CAD_VERM });
  cadDesenho(pg, "moedas", { x: 380, y: 1560, esc: 0.7, ts: B("anos") + 0.6, te: B("anos") + 1.4, seed: 10 });
  cadDesenho(pg, "xis", { x: 380, y: 1560, esc: 0.5, ts: B("piorou") - 0.2, te: B("piorou") + 0.4, seed: 11, cor: CAD_VERM });
};

CENAS.pista2 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 104, y0: 580, passo: 124 }); cadZoom(pg, c); CF_amb(pg, c);
  CF_ref(pg, "cf. Mc 5:29–30", c.ini + 0.3);
  cadPalavras(pg, { y0: 580, larg: CF_L, esc: 0.108, yMax: 1300, destaque: ["dois:", "toca,", "seca", "curada.", "Pensa", "rápido:"] });
  CF_pista(pg, 2, 240, 1500, c.ini + 0.4);
  cadDesenho(pg, "manto", { x: 600, y: 1540, esc: 1.0, ts: c.ini + 1.2, te: c.ini + 2.2, seed: 12 });
  cadDesenho(pg, "brilho", { x: 760, y: 1500, esc: 0.9, ts: B("hora"), te: B("hora") + 0.8, seed: 14, cor: CAD_OURO });
  cadDesenho(pg, "pergunta", { x: 870, y: 1600, esc: 0.8, ts: B("pergunta2") - 0.2, te: B("pergunta2") + 0.8, seed: 15, cor: CAD_VERM });
};

CENAS.pista3 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 105, y0: 580, passo: 124 }); cadZoom(pg, c); CF_amb(pg, c);
  CF_ref(pg, "cf. Mc 5:30–32; 22–23", c.ini + 0.3);
  cadPalavras(pg, { y0: 580, larg: CF_L, esc: 0.108, yMax: 1300, destaque: ["três:", "volta.", "tocou", "estranham.", "olha", "Jairo,", "ali."] });
  CF_pista(pg, 3, 240, 1500, c.ini + 0.4);
  cadDesenho(pg, "multidao", { x: 560, y: 1580, esc: 1.0, ts: c.ini + 1.2, te: c.ini + 2.0, seed: 16 });
  cadDesenho(pg, "olho", { x: 560, y: 1450, esc: 0.7, ts: B("quem"), te: B("quem") + 0.9, seed: 17, cor: CAD_OURO });
  cadDesenho(pg, "casa", { x: 860, y: 1570, esc: 0.7, ts: B("esperando") - 0.6, te: B("esperando") + 0.4, seed: 18 });
};

CENAS.pista4 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 106, y0: 540, passo: 122 }); cadZoom(pg, c); CF_amb(pg, c);
  CF_ref(pg, "cf. Mc 5:33–34, 36, 42", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 540, larg: CF_L, esc: 0.106, yMax: 1300, destaque: ["quatro.", "tremendo", "tudo.", "repreende.", "Filha.", "temas.", "doze"] });
  CF_pista(pg, 4, 240, 1500, c.ini + 0.4);
  CF_txt(pg, "Filha", 640, 1580, 0.2, B("filha"), 19, { cor: CAD_OURO, dur: 0.8 });
  cadDesenho(pg, "brilho", { x: 880, y: 1500, esc: 0.8, ts: B("filha") + 0.4, te: B("filha") + 1.2, seed: 20, cor: CAD_OURO });
  CF_txt(pg, "Não temas", 640, 1690, 0.11, B("temas") - 0.4, 21, { cor: CAD_TINTA, dur: 0.7, fonte: "serif" });
  const m = w.mapa.filha && w.mapa.filha[0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 30, (m.x1 - m.x0) / 2 + 26, 58, B("filha") + 0.3, B("filha") + 0.9, { com: m });
  CF_txt(pg, "12", 860, 1690, 0.14, B("ultimo") - 0.6, 22, { cor: CAD_OURO, dur: 0.5 });
};

CENAS.pergunta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 107, y0: 540, passo: 126 }); cadZoom(pg, c); CF_amb(pg, c);
  CF_ref(pg, "Mc 5:34 · 5:36", c.ini + 0.3);
  cadPalavras(pg, { y0: 540, larg: CF_L, esc: 0.112, escDest: 1.12, yMax: 1300, destaque: ["palavra", "Filha,", "Não", "temas?", "letra,", "comentários,"] });
  CF_txt(pg, "A", 300, 1500, 0.2, B("pergunta") + 0.8, 70, { cor: CAD_OURO, dur: 0.4 });
  CF_txt(pg, "Filha", 300, 1580, 0.085, B("pergunta") + 1.1, 71, { cor: CAD_TINTA, dur: 0.5, fonte: "serif" });
  CF_txt(pg, "B", 700, 1500, 0.2, B("pergunta") + 1.5, 72, { cor: CAD_OURO, dur: 0.4 });
  CF_txt(pg, "Não temas", 700, 1580, 0.085, B("pergunta") + 1.8, 73, { cor: CAD_TINTA, dur: 0.6, fonte: "serif" });
  cadDesenho(pg, "balao", { x: 520, y: 1690, esc: 0.8, ts: B("comenta") - 0.2, te: B("comenta") + 0.8, seed: 19 });
  cadDesenho(pg, "seta", { x: 880, y: 1450, esc: 0.7, rot: -28, ts: B("comenta"), te: B("comenta") + 0.9, seed: 20, cor: CAD_VERM });
};

CENAS.fim = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 108, y0: 480, passo: 118 }); cadZoom(pg, c, 1.02); CF_amb(pg, c);
  cadPalavras(pg, { y0: 480, larg: 880, esc: 0.098, yMax: 1250, destaque: ["Salva", "invisível,", "segue", "Luz", "Palavra", "lembra:"] });
  const bx = [[250, 1270], [830, 1270], [830, 1440], [250, 1440], [250, 1270]];
  cadTracos(pg, { t: [bx], h: [{ poly: bx.slice(0, 4), cor: CAD_T.botao || "#e0577f", ang: 40, sp: 10 }] }, { x: 0, y: 0, ts: B("cta"), te: B("cta") + 0.8, cor: CAD_TINTA });
  cadTexto(pg, "SEGUIR", { x: 540, y: 1392, esc: 0.15, fonte: "serifb", cor: CAD_TINTA, ts: B("cta") + 0.6, te: B("cta") + 1.2, alinhar: "centro", seed: 30, w: 7, livre: true });
};
