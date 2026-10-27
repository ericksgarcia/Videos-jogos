// Cenas do vídeo "Deus mandou plantar jardins: Jeremias 29:11" — Luz da Palavra, caderno no tema "noite", letra serifada.
// Fontes: Jeremias 29:1–14 (carta aos exilados na Babilônia; v. 5–7 casas e jardins; v. 8–9 falsos profetas; v. 10 setenta anos;
// v. 11 "pensamentos de paz"; v. 12–14 "me invocareis… me achareis"); Jr 28:2–4 (Hananias: volta em dois anos).
// Versículo em paráfrase ("cf. Jeremias 29:11" escrito na tela). Retenção: choque no 1º segundo (jardins a exilados), previsão
// ("adivinha o que ele manda fazer"), o versículo famoso só no meio, pagamento (v. 12–14) no fim, final que emenda no começo.
cadTema((window.DADOS && DADOS.tema) || "noite");
const SA_L = 800;
const SA_ref = (pg, txt, t) => cadTexto(pg, txt, { x: 920, y: 400, esc: 0.07, fonte: "serif", cor: CAD_VERM, ts: t, te: t + 0.9, alinhar: "dir", seed: 77, livre: true });
// vida no pé da tela: um calor de luz e faíscas douradas subindo devagar
function SA_amb(pg, c) {
  const d = pg.g.querySelector("defs"), gr = _cadEl(d, "radialGradient", { id: "saAmb" + pg.seed, cx: "50%", cy: "100%", r: "60%" });
  _cadEl(gr, "stop", { offset: "0", "stop-color": "#ffcf6a", "stop-opacity": 0.16 }); _cadEl(gr, "stop", { offset: "1", "stop-color": "#ffcf6a", "stop-opacity": 0 });
  _cadEl(pg.gFundo, "rect", { x: -100, y: 1400, width: 1280, height: 700, fill: `url(#saAmb${pg.seed})` });
  [180, 420, 660, 900].forEach((x, k) => cadFaiscas(pg, x, 1980, c.ini - 1 + k * 0.3, 1e4, { n: 4, alt: 520, pai: pg.gFundo }));
}

CENAS.abertura = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 61, y0: 820, passo: 122 }); cadZoom(pg, c); SA_amb(pg, c);
  cadTexto(pg, "Jeremias 29:1–14", { x: 920, y: 1400, esc: 0.07, fonte: "serif", cor: CAD_VERM, ts: c.ini + 1.0, te: c.ini + 1.9, alinhar: "dir", seed: 77, livre: true });
  // quadro 0: o jardim já brota enquanto a caneta escreve o gancho
  cadDesenho(pg, "jardim", { x: 300, y: 1540, esc: 1.55, ts: c.ini - 1.2, te: c.ini + 0.9, seed: 1 });
  cadTitulo(pg, [{ txt: "70 ANOS", fonte: "serifb", max: 0.3, cor: CAD_VERM }, { txt: "DE EXÍLIO", fonte: "serif", max: 0.2 }], 450, c.ini + 0.05, 1.5, { passo: 205, larg: 780 });
  cadPalavras(pg, { y0: 820, larg: SA_L, esc: 0.1, yMax: 1300, destaque: ["jardins", "setenta", "Jeremias", "quadros", "leu"] });
  cadDesenho(pg, "broto", { x: 790, y: 1540, esc: 1.2, ts: B("bios"), te: B("anos") + 1.2, seed: 2 });
};

CENAS.apoio = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 62, y0: 640, passo: 124 }); cadZoom(pg, c); SA_amb(pg, c);
  cadPalavras(pg, { y0: 640, larg: SA_L, esc: 0.114, yMax: 1300, destaque: ["crê", "curte", "amém", "Palavra", "espera"] });
  cadDesenho(pg, "coracao", { x: 370, y: 1500, esc: 1.15, ts: B("curte"), te: B("curte") + 1.0, seed: 4 });
  cadDesenho(pg, "balao", { x: 710, y: 1490, esc: 1.2, ts: B("comenta"), te: B("comenta") + 1.1, seed: 5 });
};

CENAS.carta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 63, y0: 600, passo: 124 }); cadZoom(pg, c); SA_amb(pg, c);
  SA_ref(pg, "Jr 29:1; 28:2–4; 29:8–9", c.ini + 0.3);
  cadPalavras(pg, { y0: 600, larg: SA_L, esc: 0.11, yMax: 1300, destaque: ["Jeremias", "exilados", "Babilônia", "rápida", "Adivinha", "plantar"] });
  cadDesenho(pg, "rolo", { x: 300, y: 1530, esc: 1.2, ts: B("babilonia"), te: B("babilonia") + 1.3, seed: 6 });
  cadDesenho(pg, "pergunta", { x: 760, y: 1530, esc: 1.0, ts: B("adivinha") + 0.4, te: B("adivinha") + 1.3, seed: 7, cor: CAD_VERM });
};

CENAS.setenta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 64, y0: 560, passo: 124 }); cadZoom(pg, c); SA_amb(pg, c);
  SA_ref(pg, "Jr 29:5–7; 29:10", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 560, larg: SA_L, esc: 0.11, yMax: 1300, destaque: ["setenta", "construam", "jardins", "Vivam"] });
  cadDesenho(pg, "casa", { x: 250, y: 1530, esc: 0.95, ts: B("longa"), te: B("longa") + 1.1, seed: 8 });
  cadDesenho(pg, "jardim", { x: 590, y: 1540, esc: 0.95, ts: B("jardins2"), te: B("jardins2") + 1.2, seed: 9 });
  const m = w.mapa.vivam && w.mapa.vivam[0]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 30, B("vivam") + 0.2, B("vivam") + 0.8, { com: m });
};

CENAS.versiculo = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 65, y0: 540, passo: 124 }); cadZoom(pg, c); SA_amb(pg, c);
  SA_ref(pg, "cf. Jeremias 29:11", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 540, larg: SA_L, esc: 0.108, yMax: 1300, destaque: ["pensamentos", "paz", "espera", "você"] });
  cadDesenho(pg, "estrela", { x: 540, y: 1560, esc: 0.9, ts: B("paz"), te: B("paz") + 1.4, seed: 10 });
  const m = w.mapa["espera"] && w.mapa["espera"][1]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 30, B("espera") + 0.2, B("espera") + 0.8, { com: m });
};

CENAS.pergunta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 66, y0: 560, passo: 126 }); cadZoom(pg, c); SA_amb(pg, c);
  cadPalavras(pg, { y0: 560, larg: SA_L, esc: 0.116, escDest: 1.12, yMax: 1300, destaque: ["espera", "palavra", "comentários", "bonito"] });
  cadDesenho(pg, "balao", { x: 400, y: 1560, esc: 1.2, ts: B("pergunta") + 0.8, te: B("pergunta") + 1.9, seed: 11 });
  cadDesenho(pg, "seta", { x: 790, y: 1500, esc: 0.7, rot: -28, ts: B("comenta"), te: B("comenta") + 0.9, seed: 12, cor: CAD_VERM });
};

CENAS.detalhe = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 67, y0: 540, passo: 124 }); cadZoom(pg, c); SA_amb(pg, c);
  SA_ref(pg, "Jeremias 29:12–14", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 540, larg: SA_L, esc: 0.108, yMax: 1300, destaque: ["chamar", "ouvir", "achar", "encurta", "acompanha"] });
  cadDesenho(pg, "estrela", { x: 300, y: 1560, esc: 0.7, ts: B("chamar"), te: B("chamar") + 1.0, seed: 13 });
  cadDesenho(pg, "coracao", { x: 780, y: 1560, esc: 0.85, ts: B("acompanha"), te: B("acompanha") + 1.0, seed: 14 });
  const m = w.mapa.acompanha && w.mapa.acompanha[0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 30, (m.x1 - m.x0) / 2 + 26, 58, B("acompanha") + 0.5, B("acompanha") + 1.1, { com: m });
};

CENAS.fim = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 68, y0: 480, passo: 118 }); cadZoom(pg, c, 1.02); SA_amb(pg, c);
  cadPalavras(pg, { y0: 480, larg: 880, esc: 0.098, yMax: 1250, destaque: ["Salva", "espera", "segue", "Luz", "Palavra", "lembra"] });
  const bx = [[250, 1270], [830, 1270], [830, 1440], [250, 1440], [250, 1270]];
  cadTracos(pg, { t: [bx], h: [{ poly: bx.slice(0, 4), cor: CAD_T.botao || "#e0577f", ang: 40, sp: 10 }] }, { x: 0, y: 0, ts: B("cta"), te: B("cta") + 0.8, cor: CAD_TINTA });
  cadTexto(pg, "SEGUIR", { x: 540, y: 1392, esc: 0.15, fonte: "serifb", cor: CAD_TINTA, ts: B("cta") + 0.6, te: B("cta") + 1.2, alinhar: "centro", seed: 30, w: 7, livre: true });
};
