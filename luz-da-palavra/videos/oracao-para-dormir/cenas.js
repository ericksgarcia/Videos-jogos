// Cenas do vídeo "Oração para acalmar a mente antes de dormir" — Luz da Palavra, estilo CADERNO (uma caneta só, escrita calma).
// Fonte: Filipenses 4:6–7 (parafraseado, com a referência); Paulo preso (Fp 1:7,13); "guardar" (grego phroureo) = vigiar como sentinela.
// Retenção: gancho = o paradoxo (a frase mais calma foi escrita na prisão); laço "a parte mais estranha" pago com a palavra de soldado;
// pergunta única; oração guiada no fim; o final volta ao começo ("A paz te guarda").

CENAS.abertura = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 21, y0: 760 }); cadZoom(pg, c);
  cadTitulo(pg, [{ txt: "PAZ ESCRITA", fonte: "felix", max: 0.19 }, { txt: "NA PRISÃO", fonte: "elfin", max: 0.36, cor: CAD_VERM, marca: true }], 400, c.ini + 0.05, 1.8, { passo: 230 });
  cadPalavras(pg, { y0: 760, larg: 940, esc: 0.1, destaque: ["preso", "noite", "cela", "oração", "deitado"] });
  cadDesenho(pg, "lua", { x: 230, y: 1560, esc: 0.95, ts: B("noite"), te: B("noite") + 1.2, seed: 1 });
  cadDesenho(pg, "grade", { x: 560, y: 1560, esc: 1.0, ts: B("cela"), te: B("cela") + 1.4, seed: 2 });
  cadDesenho(pg, "cama", { x: 850, y: 1570, esc: 0.8, ts: B("deitado"), te: B("deitado") + 1.3, seed: 3 });
};

CENAS.apoio = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 22, y0: 560 }); cadZoom(pg, c);
  cadPalavras(pg, { y0: 560, larg: 820, esc: 0.105, destaque: ["sustentou", "curte", "comenta", "paz", "oração"] });
  cadDesenho(pg, "lua", { x: 250, y: 1290, esc: 0.9, ts: B("fe"), te: B("fe") + 1.1, seed: 4 });
  cadDesenho(pg, "coracao", { x: 560, y: 1290, esc: 1.1, ts: B("curte"), te: B("curte") + 1.0, seed: 5 });
  cadDesenho(pg, "balao", { x: 830, y: 1280, esc: 1.2, ts: B("comenta"), te: B("comenta") + 1.1, seed: 6 });
};

CENAS.preso = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 23, y0: 520 }); cadZoom(pg, c);
  cadPalavras(pg, { y0: 520, larg: 820, esc: 0.105, destaque: ["Paulo", "prisão", "alegria", "ansiedade"] });
  cadDesenho(pg, "sentado", { x: 270, y: 1380, esc: 1.2, ts: B("paulo"), te: B("paulo") + 1.5, seed: 7 });
  cadDesenho(pg, "grade", { x: 560, y: 1380, esc: 0.8, ts: B("prisao"), te: B("prisao") + 1.2, seed: 8 });
  cadDesenho(pg, "carta", { x: 830, y: 1390, esc: 0.8, ts: B("alegria"), te: B("alegria") + 1.2, seed: 9 });
};

CENAS.receita = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 24, y0: 480, passo: 118 }); cadZoom(pg, c);
  cadPalavras(pg, { y0: 480, larg: 840, esc: 0.105, destaque: ["Um", "Dois", "Três", "Filipenses", "estranha"] });
  cadDesenho(pg, "balao", { x: 250, y: 1450, esc: 0.9, ts: B("um"), te: B("um") + 1.0, seed: 10 });
  cadDesenho(pg, "coracao", { x: 540, y: 1450, esc: 0.85, ts: B("dois"), te: B("dois") + 1.0, seed: 11 });
  cadDesenho(pg, "seta", { x: 830, y: 1460, esc: 0.75, ts: B("tres"), te: B("tres") + 1.0, seed: 12, cor: CAD_VERM });
  cadTexto(pg, "Fp 4:6–7", { x: 540, y: 1640, esc: 0.085, fonte: "felix", cor: CAD_VERM, ts: B("estranha") - 1.6, te: B("estranha") - 0.8, alinhar: "centro", seed: 13 });
};

CENAS.soldado = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 25, y0: 500, passo: 112 }); cadZoom(pg, c);
  cadPalavras(pg, { y0: 500, larg: 840, esc: 0.105, destaque: ["guarda", "soldado", "sentinela", "invadir", "sentido"] });
  cadDesenho(pg, "soldado", { x: 250, y: 1480, esc: 1.05, ts: B("sentinela"), te: B("sentinela") + 1.6, seed: 14 });
  cadDesenho(pg, "escudo", { x: 580, y: 1480, esc: 0.95, ts: B("invadir"), te: B("invadir") + 1.3, seed: 15 });
  cadDesenho(pg, "estrela", { x: 860, y: 1470, esc: 0.55, ts: B("sentido"), te: B("sentido") + 1.0, seed: 16 });
};

CENAS.pergunta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 26, y0: 480, passo: 134 }); cadZoom(pg, c);
  cadPalavras(pg, { y0: 480, larg: 820, esc: 0.115, escDest: 1.12, destaque: ["pensamento", "trabalho", "dinheiro", "pessoa", "palavra"] });
  cadDesenho(pg, "balao", { x: 380, y: 1470, esc: 1.15, ts: B("pergunta") + 1.2, te: B("pergunta") + 2.4, seed: 17 });
  cadTexto(pg, "escreve nos comentários", { x: 150, y: 1640, esc: 0.105, fonte: "felix", cor: CAD_VERM, ts: B("comenta") - 0.1, te: B("comenta") + 1.6, alinhar: "esq", seed: 18 });
  cadDesenho(pg, "seta", { x: 800, y: 1490, esc: 0.62, ts: B("comenta") + 1.0, te: B("comenta") + 2.0, seed: 19, cor: CAD_VERM });
};

CENAS.oracao = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 27, y0: 480, passo: 124 }); cadZoom(pg, c, 1.03);
  cadPalavras(pg, { y0: 480, larg: 840, esc: 0.105, destaque: ["Inspira", "Segura", "solta", "Senhor", "Amém"] });
  cadDesenho(pg, "ondas", { x: 300, y: 1500, esc: 0.9, ts: B("inspira"), te: B("inspira") + 1.8, seed: 20, cor: CAD_AZUL });
  cadCirculo(pg, 560, 1500, 70, 70, B("segura"), B("segura") + 1.2);
  cadDesenho(pg, "ondas", { x: 820, y: 1500, esc: 0.9, ts: B("solta"), te: B("solta") + 1.6, seed: 21, cor: CAD_AZUL });
  cadDesenho(pg, "cama", { x: 540, y: 1650, esc: 0.7, ts: B("amem"), te: B("amem") + 1.2, seed: 22 });
};

CENAS.fim = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 28, y0: 520 }); cadZoom(pg, c, 1.02);
  cadPalavras(pg, { y0: 520, larg: 820, esc: 0.115, destaque: ["Salva", "segue", "Luz", "Palavra", "lembra"] });
  const bx = [[260, 1010], [820, 1010], [820, 1130], [260, 1130], [260, 1010]];
  cadTracos(pg, { t: [bx], h: [{ poly: bx.slice(0, 4), cor: "#e0577f", ang: 40, sp: 9 }] }, { x: 0, y: 0, ts: B("cta"), te: B("cta") + 0.9, cor: CAD_TINTA });
  cadTexto(pg, "SEGUIR", { x: 540, y: 1090, esc: 0.17, fonte: "elfin", cor: CAD_TINTA, ts: B("cta") + 0.9, te: B("cta") + 1.5, alinhar: "centro", seed: 30, w: 6 });
  const t0 = B("lembra");
  cadTexto(pg, "A paz te guarda.", { x: 540, y: 1380, esc: cadAjusta("A paz te guarda.", "elfin", 800, 0.26), fonte: "elfin", cor: CAD_VERM, ts: t0 + 0.1, te: Math.min(c.fim - 0.1, t0 + 1.6), alinhar: "centro", seed: 31, w: 7 });
};
