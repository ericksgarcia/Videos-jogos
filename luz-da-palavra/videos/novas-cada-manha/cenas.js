// Cenas do vídeo "Novas a cada manhã: Lamentações 3:22–23" — Luz da Palavra, caderno no tema "noite", letra serifada.
// Fontes (Almeida 1911): Lm 3:2,6–7 (trevas, cercado, sem saída); 3:18 ("pereceu a minha força, como também a minha esperança");
// 3:21 ("disto me recordarei… por isso esperarei"); 3:22–23; acróstico (22 letras × 3 versículos = 66); cap. 3 é o do meio de 5.
// Contexto: 2 Rs 25:9–10 (cidade e templo queimados); Lm 2:12; 4:4 (fome).
// Retenção: choque em 1,4 s ("cinzas"), laço "segredo no alfabeto" (aberto em 14 s, lembrado na pergunta, pago no detalhe),
// previsão ("adivinha"), final que emenda no começo ("…e lembra: numa cidade em cinzas…").
// O título da abertura é "livre" (não ocupa a caneta), para a fala começar a ser escrita sem atraso.
cadTema((window.DADOS && DADOS.tema) || "noite");
const NM_L = 800;
const NM_ref = (pg, txt, t, y = 400) => cadTexto(pg, txt, { x: 920, y, esc: 0.07, fonte: "serif", cor: CAD_VERM, ts: t, te: t + 0.9, alinhar: "dir", seed: 77, livre: true });
// vida no pé da tela: um calor de luz e faíscas douradas subindo devagar
function NM_amb(pg, c) {
  const d = pg.g.querySelector("defs"), gr = _cadEl(d, "radialGradient", { id: "nmAmb" + pg.seed, cx: "50%", cy: "100%", r: "60%" });
  _cadEl(gr, "stop", { offset: "0", "stop-color": "#ffcf6a", "stop-opacity": 0.16 }); _cadEl(gr, "stop", { offset: "1", "stop-color": "#ffcf6a", "stop-opacity": 0 });
  _cadEl(pg.gFundo, "rect", { x: -100, y: 1400, width: 1280, height: 700, fill: `url(#nmAmb${pg.seed})` });
  [180, 420, 660, 900].forEach((x, k) => cadFaiscas(pg, x, 1980, c.ini - 1 + k * 0.3, 1e4, { n: 4, alt: 520, pai: pg.gFundo }));
}
const NM_txt = (pg, txt, x, y, esc, ts, seed, o = {}) => cadTexto(pg, txt, { x, y, esc, fonte: o.fonte || "serif", cor: o.cor || CAD_TINTA, ts, te: ts + (o.dur || 0.6), alinhar: "centro", seed, w: o.w || 7, livre: true });

CENAS.abertura = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 81, y0: 820, passo: 122 }); cadZoom(pg, c); NM_amb(pg, c);
  // quadro 0: a cidade em cinzas já está desenhada, com brasas subindo
  cadDesenho(pg, "templo", { x: 290, y: 1560, esc: 1.2, ts: c.ini - 1.2, te: c.ini + 0.6, seed: 1 });
  cadFaiscas(pg, 290, 1520, c.ini - 1, 1e4, { n: 10, alt: 300 });
  cadTitulo(pg, [{ txt: "NO LIVRO", fonte: "serif", max: 0.2 }, { txt: "DO CHORO", fonte: "serifb", max: 0.3, cor: CAD_VERM }], 450, c.ini + 0.05, 1.3, { passo: 205, larg: 780, livre: true });
  cadPalavras(pg, { y0: 820, larg: NM_L, esc: 0.1, yMax: 1300, destaque: ["cinzas,", "misericórdias", "manhã.", "esperança.", "segredo", "alfabeto,"] });
  cadDesenho(pg, "sol", { x: 790, y: 1560, esc: 0.9, ts: B("manha0") - 0.3, te: B("manha0") + 0.9, seed: 2, cor: CAD_OURO });
  NM_ref(pg, "cf. Lamentações 3:18–23", B("acabou") - 0.4, 1400);
};

CENAS.apoio = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 82, y0: 640, passo: 124 }); cadZoom(pg, c); NM_amb(pg, c);
  cadPalavras(pg, { y0: 640, larg: NM_L, esc: 0.114, yMax: 1300, destaque: ["crê", "manhã", "curte", "amém,", "escuro."] });
  cadDesenho(pg, "coracao", { x: 370, y: 1500, esc: 1.15, ts: B("curte"), te: B("curte") + 1.0, seed: 4 });
  cadDesenho(pg, "balao", { x: 710, y: 1490, esc: 1.2, ts: B("comenta"), te: B("comenta") + 1.1, seed: 5 });
};

CENAS.livro = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 83, y0: 620, passo: 126 }); cadZoom(pg, c); NM_amb(pg, c);
  NM_ref(pg, "cf. 2 Rs 25:9; Lm 2:12", c.ini + 0.3);
  cadPalavras(pg, { y0: 620, larg: NM_L, esc: 0.114, yMax: 1300, destaque: ["Lamentações:", "choro", "Jerusalém.", "queimada,", "fome."] });
  cadDesenho(pg, "rolo", { x: 260, y: 1540, esc: 1.0, ts: B("livro"), te: B("livro") + 1.1, seed: 6 });
  cadDesenho(pg, "fogueira", { x: 540, y: 1560, esc: 1.0, ts: B("queimada"), te: B("queimada") + 0.9, seed: 7 });
  cadFaiscas(pg, 540, 1520, B("queimada") + 0.6, 1e4, { n: 8, alt: 240 });
  cadDesenho(pg, "pao", { x: 800, y: 1560, esc: 0.8, ts: B("fome") - 0.6, te: B("fome") + 0.2, seed: 8 });
  cadDesenho(pg, "xis", { x: 800, y: 1560, esc: 0.7, ts: B("fome") + 0.2, te: B("fome") + 0.7, seed: 9, cor: CAD_VERM });
};

CENAS.fundo = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 84, y0: 600, passo: 126 }); cadZoom(pg, c); NM_amb(pg, c);
  NM_ref(pg, "cf. Lamentações 3:2–7; 3:18", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 600, larg: NM_L, esc: 0.112, yMax: 1300, destaque: ["cercado,", "escuro,", "saída.", "Adivinha", "esperança?"] });
  cadDesenho(pg, "encolhido", { x: 300, y: 1560, esc: 1.3, ts: B("escuro") - 0.2, te: B("escuro") + 1.0, seed: 10 });
  cadDesenho(pg, "grade", { x: 300, y: 1540, esc: 1.1, ts: B("saida") - 0.4, te: B("saida") + 0.5, seed: 11 });
  cadDesenho(pg, "pergunta", { x: 760, y: 1530, esc: 1.0, ts: B("adivinha") + 0.3, te: B("adivinha") + 1.2, seed: 12, cor: CAD_VERM });
  const m = w.mapa["esperança?"] && w.mapa["esperança?"][0]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 30, B("esperanca") + 0.3, B("esperanca") + 0.9, { com: m });
};

CENAS.virada = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 85, y0: 600, passo: 126 }); cadZoom(pg, c); NM_amb(pg, c);
  NM_ref(pg, "cf. Lamentações 3:21", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 600, larg: NM_L, esc: 0.112, yMax: 1300, destaque: ["Nada", "ruínas.", "memória:", "recordarei,", "esperarei."] });
  cadDesenho(pg, "templo", { x: 270, y: 1560, esc: 0.9, ts: B("fora") - 0.3, te: B("fora") + 0.8, seed: 13 });
  cadDesenho(pg, "coracao", { x: 560, y: 1560, esc: 0.9, ts: B("lembrar"), te: B("lembrar") + 0.9, seed: 14 });
  cadDesenho(pg, "brilho", { x: 800, y: 1540, esc: 1.0, ts: B("virada") - 0.2, te: B("virada") + 0.7, seed: 15, cor: CAD_OURO });
  const m = w.mapa["esperarei."] && w.mapa["esperarei."][0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 30, (m.x1 - m.x0) / 2 + 26, 58, B("virada") + 0.3, B("virada") + 0.9, { com: m });
};

CENAS.versiculo = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 86, y0: 560, passo: 126 }); cadZoom(pg, c); NM_amb(pg, c);
  NM_ref(pg, "cf. Lamentações 3:22–23", c.ini + 0.3);
  const w = cadPalavras(pg, { y0: 560, larg: NM_L, esc: 0.114, yMax: 1300, destaque: ["misericórdias", "fim.", "Novas", "manhã.", "fidelidade."] });
  cadDesenho(pg, "sol", { x: 330, y: 1560, esc: 1.1, ts: B("manha") - 0.4, te: B("manha") + 0.9, seed: 16, cor: CAD_OURO });
  cadDesenho(pg, "estrela", { x: 760, y: 1560, esc: 0.9, ts: B("fidelidade") - 0.3, te: B("fidelidade") + 0.9, seed: 17 });
  const m = w.mapa["manhã."] && w.mapa["manhã."][0]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 30, B("manha") + 0.3, B("manha") + 0.9, { com: m });
};

CENAS.pergunta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 87, y0: 560, passo: 126 }); cadZoom(pg, c); NM_amb(pg, c);
  const w = cadPalavras(pg, { y0: 560, larg: NM_L, esc: 0.112, escDest: 1.12, yMax: 1300, destaque: ["segredo:", "Deus", "lembrado", "palavra,", "comentários"] });
  cadDesenho(pg, "balao", { x: 400, y: 1560, esc: 1.2, ts: B("pergunta") + 0.8, te: B("pergunta") + 1.9, seed: 18 });
  cadDesenho(pg, "seta", { x: 790, y: 1500, esc: 0.7, rot: -28, ts: B("comenta"), te: B("comenta") + 0.9, seed: 19, cor: CAD_VERM });
  const m = w.mapa["palavra,"] && w.mapa["palavra,"][0]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 30, B("comenta") + 0.6, B("comenta") + 1.1, { com: m });
};

CENAS.detalhe = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 88, y0: 560, passo: 124 }); cadZoom(pg, c); NM_amb(pg, c);
  NM_ref(pg, "Lm 3: 22 letras x 3", B("alfabeto") + 0.2);
  cadPalavras(pg, { y0: 560, larg: NM_L, esc: 0.11, yMax: 1300, destaque: ["segredo:", "letra", "alfabeto", "inteira", "Z.", "meio,", "esperança."] });
  // o alfabeto se escreve letra a letra; depois os 5 capítulos com o do meio circulado
  ["A", "B", "C", "D", "..."].forEach((l, k) => NM_txt(pg, l, 250 + k * 110, 1500, 0.15, B("alfabeto") + 0.2 + k * 0.32, 20 + k, { cor: k === 4 ? CAD_TINTA : CAD_OURO }));
  NM_txt(pg, "Z", 800, 1500, 0.15, B("az") - 0.3, 26, { cor: CAD_VERM });
  ["1", "2", "3", "4", "5"].forEach((n, k) => NM_txt(pg, n, 300 + k * 120, 1680, 0.12, B("meio") - 0.9 + k * 0.15, 30 + k, { dur: 0.35 }));
  cadCirculo(pg, 540, 1640, 52, 66, B("meio") + 0.2, B("meio") + 0.8);
  cadDesenho(pg, "brilho", { x: 540, y: 1790, esc: 0.45, ts: B("meio") + 1.6, te: B("meio") + 2.4, seed: 36, cor: CAD_OURO });
};

CENAS.fim = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 89, y0: 480, passo: 118 }); cadZoom(pg, c, 1.02); NM_amb(pg, c);
  cadPalavras(pg, { y0: 480, larg: 880, esc: 0.098, yMax: 1250, destaque: ["Salva", "manhã", "segue", "Luz", "Palavra", "lembra:"] });
  const bx = [[250, 1270], [830, 1270], [830, 1440], [250, 1440], [250, 1270]];
  cadTracos(pg, { t: [bx], h: [{ poly: bx.slice(0, 4), cor: CAD_T.botao || "#e0577f", ang: 40, sp: 10 }] }, { x: 0, y: 0, ts: B("cta"), te: B("cta") + 0.8, cor: CAD_TINTA });
  cadTexto(pg, "SEGUIR", { x: 540, y: 1392, esc: 0.15, fonte: "serifb", cor: CAD_TINTA, ts: B("cta") + 0.6, te: B("cta") + 1.2, alinhar: "centro", seed: 30, w: 7, livre: true });
};
