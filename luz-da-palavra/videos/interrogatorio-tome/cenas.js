// Cenas do vídeo "Interrogatório: Tomé" (João 11, 14 e 20) — Luz da Palavra, formato INTERROGATÓRIO (família Detetive), estrutura v2, caderno noite.
// Textos conferidos em ACF e AA (textos-conferidos.md): Jo 11:7–8,16 (volta à Judeia; procuravam apedrejar; "Vamos nós também, para morrermos com ele");
// Jo 14:5–6 ("como podemos saber o caminho?" / "Eu sou o caminho"); Jo 20:24–29 (Tomé não estava com eles; condições do v.25; convite do v.27; confissão do v.28;
// "oito dias depois… e com eles Tomé", v.26). Nenhum versículo de 20:24–29 narra o toque. v.29 omitido de propósito (sem glosa).
// O "depoimento" é uma convenção do narrador: a testemunha só diz o que o texto registra. Citação literal só de trechos idênticos em ACF e AA.
// Estrutura v2: abertura → parte1 → apoio (apelo-ponte) → parte2 → aposta (A/B/C + relógio) → parte3 (paga) → parte4 (revelação) → pergunta (experiência) → fim.
cadTema((window.DADOS && DADOS.tema) || "noite");
const IT_L = 800;
const IT_ref = (pg, txt, t, y = 400) => cadTexto(pg, txt, { x: 920, y, esc: 0.07, fonte: "serif", cor: CAD_VERM, ts: t, te: t + 0.9, alinhar: "dir", seed: 77, livre: true });
function IT_amb(pg, c) {
  const d = pg.g.querySelector("defs"), gr = _cadEl(d, "radialGradient", { id: "itAmb" + pg.seed, cx: "50%", cy: "100%", r: "60%" });
  _cadEl(gr, "stop", { offset: "0", "stop-color": "#ffcf6a", "stop-opacity": 0.16 }); _cadEl(gr, "stop", { offset: "1", "stop-color": "#ffcf6a", "stop-opacity": 0 });
  _cadEl(pg.gFundo, "rect", { x: -100, y: 1400, width: 1280, height: 700, fill: `url(#itAmb${pg.seed})` });
  [180, 420, 660, 900].forEach((x, k) => cadFaiscas(pg, x, 1980, c.ini - 1 + k * 0.3, 1e4, { n: 4, alt: 520, pai: pg.gFundo }));
}
const IT_txt = (pg, txt, x, y, esc, ts, seed, o = {}) => cadTexto(pg, txt, { x, y, esc, fonte: o.fonte || "serifb", cor: o.cor || CAD_TINTA, ts, te: ts + (o.dur || 0.6), alinhar: "centro", seed, w: o.w || 7, livre: true, rot: o.rot || 0 });
// instante em que a n-ésima ocorrência de uma palavra é dita (a chave é a palavra SEM pontuação)
const IT_t = (c, w, n = 0) => { const k = w.toLowerCase().replace(/[^\p{L}\d]/gu, ""); let i = 0;
  for (const b of c.legendas) for (const [pw, a] of b.palavras) if (pw.toLowerCase().replace(/[^\p{L}\d]/gu, "") === k) { if (i++ === n) return a; }
  return c.ini; };
function IT_etiqueta(pg, n, x, y, ts) {
  cadDesenho(pg, "etiqueta", { x, y, esc: 1.15, ts, te: ts + 0.8, seed: 40 + n, cor: CAD_OURO });
  IT_txt(pg, String(n), x + 12, y + 24, 0.17, ts + 0.45, 50 + n, { cor: CAD_OURO, dur: 0.4 });
}

CENAS.abertura = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 111, y0: 900, passo: 118 }); cadZoom(pg, c); IT_amb(pg, c);
  // quadro 0: um homem a caminho (Jesus decide voltar) e as pedras de quem procurava apedrejá-lo
  cadDesenho(pg, "caminhante", { x: 280, y: 1560, esc: 1.25, ts: c.ini - 1.2, te: c.ini + 0.6, seed: 1 });
  cadDesenho(pg, "pedra", { x: 700, y: 1560, esc: 1.1, ts: c.ini - 0.9, te: c.ini + 0.7, seed: 2 });
  cadSelo(pg, 540, 355, "INTERROGATÓRIO · TOMÉ", c.ini + 0.1, { esc: 0.06 });
  cadTitulo(pg, [{ txt: "ANTES DE", fonte: "serif", max: 0.2 }, { txt: "DUVIDAR", fonte: "serifb", max: 0.3, cor: CAD_VERM }], 540, c.ini + 0.1, 1.3, { passo: 190, larg: 780, livre: true });
  cadPalavras(pg, { y0: 900, larg: IT_L, esc: 0.098, yMax: 1300, destaque: ["Procuravam", "apedrejar", "Vamos", "também,", "morrermos", "palavras"] });
  IT_ref(pg, "cf. Jo 11:8, 16", B("disse") + 0.2, 1420);
};

CENAS.parte1 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 112, y0: 600, passo: 124 }); cadZoom(pg, c); IT_amb(pg, c);
  IT_ref(pg, "cf. Jo 11:7–8, 16", c.ini + 0.3);
  cadPalavras(pg, { y0: 600, larg: IT_L, esc: 0.11, yMax: 1300, destaque: ["voltar", "lá.", "Tomé", "palavras.", "pergunta."] });
  IT_etiqueta(pg, 1, 240, 1500, c.ini + 0.4);
  cadDesenho(pg, "pedra", { x: 640, y: 1570, esc: 1.0, ts: B("apedrejar") - 0.4, te: B("apedrejar") + 0.7, seed: 6 });
  cadDesenho(pg, "balao", { x: 420, y: 1540, esc: 0.9, ts: B("palavras") - 0.8, te: B("palavras") + 0.2, seed: 7 });
  cadDesenho(pg, "pergunta", { x: 880, y: 1570, esc: 0.8, ts: B("pergunta1") - 0.3, te: B("pergunta1") + 0.7, seed: 8, cor: CAD_VERM });
};

CENAS.apoio = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 113, y0: 700, passo: 126 }); cadZoom(pg, c); IT_amb(pg, c);
  cadPalavras(pg, { y0: 700, larg: IT_L, esc: 0.118, yMax: 1300, destaque: ["amém", "pergunta", "Deus.", "Tomé", "agora."] });
  cadDesenho(pg, "coracao", { x: 420, y: 1500, esc: 1.1, ts: B("curte"), te: B("curte") + 1.0, seed: 4 });
  cadDesenho(pg, "balao", { x: 700, y: 1490, esc: 1.0, ts: B("comenta") - 0.4, te: B("comenta") + 0.7, seed: 5 });
};

CENAS.parte2 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 114, y0: 560, passo: 124 }); cadZoom(pg, c); IT_amb(pg, c);
  IT_ref(pg, "cf. Jo 14:5–6; 20:24–25", c.ini + 0.3);
  cadPalavras(pg, { y0: 560, larg: IT_L, esc: 0.106, yMax: 1300, destaque: ["última", "ceia,", "caminho?", "caminho.", "vir", "tocar."] });
  IT_etiqueta(pg, 2, 240, 1500, c.ini + 0.4);
  cadDesenho(pg, "caminho", { x: 600, y: 1580, esc: 1.0, ts: B("caminho") - 0.6, te: B("caminho") + 0.6, seed: 9 });
  cadDesenho(pg, "olho", { x: 800, y: 1470, esc: 0.7, ts: B("tocar") - 1.2, te: B("tocar") - 0.4, seed: 10, cor: CAD_OURO });
  cadDesenho(pg, "maos", { x: 830, y: 1590, esc: 0.55, ts: B("tocar") - 0.3, te: B("tocar") + 0.7, seed: 11 });
};

CENAS.aposta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 115, y0: 560, passo: 124 }); cadZoom(pg, c); IT_amb(pg, c);
  IT_ref(pg, "cf. Jo 20:24–29", c.ini + 0.3);
  cadPalavras(pg, { y0: 560, larg: IT_L, esc: 0.114, escDest: 1.1, yMax: 1300, destaque: ["Aposta:", "tocar.", "tocou?", "porquê."] });
  const t0 = IT_t(c, "A", 0);
  cadOpcoes(pg, ["tocou", "não tocou", "o texto não diz"], 1480, t0, { x0: 170, x1: 850, gap: 0.45 });
  cadRelogio(pg, 200, 1720, IT_t(c, "porquê"), 1.6, { r: 52 });
  cadDesenho(pg, "balao", { x: 620, y: 1730, esc: 0.7, ts: B("letra") - 0.2, te: B("letra") + 0.7, seed: 19 });
  cadDesenho(pg, "seta", { x: 890, y: 1500, esc: 0.7, rot: -28, ts: B("letra"), te: B("letra") + 0.9, seed: 20, cor: CAD_VERM });
};

CENAS.parte3 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 116, y0: 560, passo: 124 }); cadZoom(pg, c); IT_amb(pg, c);
  IT_ref(pg, "cf. Jo 20:27–28", c.ini + 0.3);
  cadPalavras(pg, { y0: 560, larg: IT_L, esc: 0.106, yMax: 1300, destaque: ["Resposta:", "C.", "resposta", "Senhor", "meu!", "não", "convite."] });
  cadSelo(pg, 540, 1560, "RESPOSTA: C · O TEXTO NÃO DIZ", B("resposta") + 0.2, { esc: 0.066 });
  cadDesenho(pg, "livro", { x: 220, y: 1690, esc: 0.7, ts: B("confissao") - 0.4, te: B("confissao") + 0.6, seed: 12 });
};

CENAS.parte4 = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 117, y0: 560, passo: 126 }); cadZoom(pg, c); IT_amb(pg, c);
  IT_ref(pg, "cf. Jo 20:25–27", c.ini + 0.3);
  cadPalavras(pg, { y0: 560, larg: IT_L, esc: 0.11, yMax: 1300, destaque: ["mesmas", "palavras:", "ver,", "dedo,", "mão,", "lado.", "Oito", "eles,", "aparece."] });
  // as quatro palavras do próprio Tomé, no instante em que são ditas
  [["ver", 190], ["dedo", 400], ["mão", 610], ["lado", 820]].forEach(([w, x], k) => IT_txt(pg, w, x, 1580, 0.12, IT_t(c, w), 30 + k, { cor: CAD_OURO, dur: 0.5 }));
  cadDesenho(pg, "casa", { x: 540, y: 1470, esc: 0.55, ts: IT_t(c, "oito"), te: IT_t(c, "oito") + 0.9, seed: 14 });
};

CENAS.pergunta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 118, y0: 600, passo: 126 }); cadZoom(pg, c); IT_amb(pg, c);
  cadPalavras(pg, { y0: 600, larg: IT_L, esc: 0.118, escDest: 1.1, yMax: 1300, destaque: ["pergunta", "madrugada?", "frase,", "comentários,"] });
  cadDesenho(pg, "pergunta", { x: 360, y: 1560, esc: 1.1, ts: B("pergunta") + 0.8, te: B("pergunta") + 1.8, seed: 19, cor: CAD_OURO });
  cadDesenho(pg, "balao", { x: 620, y: 1570, esc: 0.9, ts: B("comenta") - 0.2, te: B("comenta") + 0.8, seed: 21 });
  cadDesenho(pg, "seta", { x: 880, y: 1470, esc: 0.7, rot: -28, ts: B("comenta"), te: B("comenta") + 0.9, seed: 22, cor: CAD_VERM });
};

CENAS.fim = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 119, y0: 480, passo: 118 }); cadZoom(pg, c, 1.02); IT_amb(pg, c);
  cadPalavras(pg, { y0: 480, larg: 880, esc: 0.098, yMax: 1250, destaque: ["Salva", "dúvida", "segue", "Luz", "Palavra,", "lembra:"] });
  const bx = [[250, 1270], [830, 1270], [830, 1440], [250, 1440], [250, 1270]];
  cadTracos(pg, { t: [bx], h: [{ poly: bx.slice(0, 4), cor: CAD_T.botao || "#e0577f", ang: 40, sp: 10 }] }, { x: 0, y: 0, ts: B("cta"), te: B("cta") + 0.8, cor: CAD_TINTA });
  cadTexto(pg, "SEGUIR", { x: 540, y: 1392, esc: 0.15, fonte: "serifb", cor: CAD_TINTA, ts: B("cta") + 0.6, te: B("cta") + 1.2, alinhar: "centro", seed: 30, w: 7, livre: true });
};
