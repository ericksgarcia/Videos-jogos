// Cenas do vídeo "O que significa Emanuel" — Luz da Palavra, estilo CADERNO: as palavras da narração são escritas à mão,
// uma a uma, na hora em que são ditas; rabiscos simples (estrela, anjo, livro…) aparecem perto das palavras-chave.
// (A versão em 2.5D fica em versoes/cenas-25d.js.)
// Fontes: Mateus 1:18–23 (José, o sonho, Emanuel); Isaías 7:14; Mateus 28:20.
// Retenção: quadro 0 = papel e a mão já escrevendo o gancho; laço aberto ("no fim do mesmo livro") pago em Mt 28:20;
// o final volta ao começo ("Deus conosco") para quem quiser rever.

const EMC_ajusta = (txt, fonte, larg, max) => Math.min(max, larg / cadMede(txt, fonte, 1));
const EMC_zoom = (pg, c, z = 1.035) => tl.fromTo(pg.raiz, { scale: 1, svgOrigin: "540 960" }, { scale: z, svgOrigin: "540 960", duration: c.fim - c.ini + 0.5, ease: "none", immediateRender: false }, c.ini);
// escreve um texto em linhas centralizadas (gancho, título): devolve o instante final
function EMC_titulo(pg, linhas, y, ts, dur, o = {}) {
  let t = ts; const por = dur / linhas.length;
  linhas.forEach((l, i) => { const e = EMC_ajusta(l.txt, l.fonte || "elfin", o.larg || 880, l.max || 0.2), r = cadTexto(pg, l.txt, { x: 540, y: y + i * (o.passo || 150), esc: e, fonte: l.fonte || "elfin", cor: l.cor || CAD_TINTA, ts: t, te: t + por * 0.92, alinhar: "centro", seed: 40 + i, w: Math.max(5, e * 42) });
    if (l.marca) cadMarca(pg, r.x0, r.x1, y + i * (o.passo || 150) - e * 150, t, t + 0.3, { esp: e * 330 });
    t += por; l.r = r; });
  return t;
}

CENAS.abertura = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 11, y0: 820 }); EMC_zoom(pg, c);
  // gancho escrito à mão logo no quadro 0 (o papel já nasce com a caneta em movimento)
  EMC_titulo(pg, [{ txt: "UM NOME CONTRA", fonte: "felix", max: 0.19 }, { txt: "A SOLIDÃO", fonte: "elfin", max: 0.36, cor: CAD_VERM, marca: true }], 400, c.ini + 0.05, 1.7, { passo: 230 });
  cadDesenho(pg, "sentado", { x: 820, y: 1580, esc: 1.4, ts: c.ini + 1.5, te: c.ini + 3.4, seed: 3 });
  cadDesenho(pg, "lua", { x: 230, y: 1560, esc: 0.95, ts: c.ini + 3.6, te: c.ini + 4.8, seed: 4 });
  const w = cadPalavras(pg, { y0: 820, larg: 900, esc: 0.1, destaque: ["solidão", "sozinho", "nome", "fim", "livro"] });
  const m = w.mapa.nome && w.mapa.nome[0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 28, (m.x1 - m.x0) / 2 + 24, 54, m.te, m.te + 0.5);
  cadDesenho(pg, "livro", { x: 540, y: 1590, esc: 1.1, ts: B("fim"), te: B("fim") + 1.2, seed: 5 });
};

CENAS.apoio = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 12, y0: 560 }); EMC_zoom(pg, c);
  const w = cadPalavras(pg, { y0: 560, larg: 820, esc: 0.105, destaque: ["tocou", "curte", "comenta", "amém", "sozinho"] });
  cadDesenho(pg, "livro", { x: 250, y: 1290, esc: 0.95, ts: B("fe"), te: B("fe") + 1.2, seed: 6 });
  cadDesenho(pg, "coracao", { x: 560, y: 1290, esc: 1.1, ts: B("curte"), te: B("curte") + 1.0, seed: 7 });
  cadDesenho(pg, "balao", { x: 830, y: 1280, esc: 1.2, ts: B("comenta"), te: B("comenta") + 1.1, seed: 8 });
};

CENAS.jose = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 13, y0: 520 }); EMC_zoom(pg, c);
  cadPalavras(pg, { y0: 520, larg: 800, esc: 0.105, destaque: ["José", "grávida", "segredo", "Maria"] });
  cadDesenho(pg, "caminhante", { x: 290, y: 1370, esc: 1.05, ts: B("jose"), te: B("jose") + 1.4, seed: 9 });
  cadDesenho(pg, "pergunta", { x: 770, y: 1340, esc: 0.95, ts: B("gravida"), te: B("gravida") + 1.1, seed: 10 });
  cadDesenho(pg, "seta", { x: 540, y: 1470, esc: 0.8, ts: B("segredo"), te: B("segredo") + 0.9, seed: 11, espelho: true, cor: CAD_VERM });
};

CENAS.sonho = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 14, y0: 520 }); EMC_zoom(pg, c);
  cadPalavras(pg, { y0: 520, larg: 800, esc: 0.105, destaque: ["sonho", "anjo", "Adivinha", "temas", "nome"] });
  cadDesenho(pg, "lua", { x: 250, y: 1300, esc: 0.75, ts: B("sonho"), te: B("sonho") + 1.2, seed: 12 });
  cadDesenho(pg, "anjo", { x: 640, y: 1360, esc: 1.3, ts: B("anjo"), te: B("anjo") + 2.0, seed: 13 });
  cadDesenho(pg, "brilho", { x: 900, y: 1180, esc: 0.8, ts: B("nome2"), te: B("nome2") + 0.8, seed: 14, cor: CAD_OURO });
};

CENAS.significado = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 15, y0: 600, passo: 130 }); EMC_zoom(pg, c);
  const w = cadPalavras(pg, { y0: 600, larg: 820, esc: 0.115, escDest: 1.2, destaque: ["Emanuel", "imanu", "conosco", "El", "Deus", "Isaías"] });
  const m = w.mapa.conosco && w.mapa.conosco[0]; if (m) cadSublinhado(pg, m.x0, m.x1, m.y + 30, m.te, m.te + 0.5);
  cadDesenho(pg, "estrela", { x: 540, y: 1520, esc: 0.95, ts: B("junta"), te: B("junta") + 1.6, seed: 15 });
};

CENAS.sentido = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 16, y0: 500, passo: 118 }); EMC_zoom(pg, c);
  cadPalavras(pg, { y0: 500, larg: 820, esc: 0.105, destaque: ["longe", "aqui", "noite", "medo", "decisão", "reaparece"] });
  cadDesenho(pg, "nuvem", { x: 800, y: 1580, esc: 0.8, ts: B("longe"), te: B("longe") + 1.0, seed: 16 });
  cadDesenho(pg, "coracao", { x: 250, y: 1590, esc: 0.8, ts: B("aqui"), te: B("aqui") + 1.1, seed: 17 });
  cadDesenho(pg, "seta", { x: 540, y: 1600, esc: 0.8, ts: B("volta"), te: B("volta") + 1.1, seed: 18, cor: CAD_VERM });
};

CENAS.detalhe = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 17, y0: 440, passo: 112 }); EMC_zoom(pg, c);
  const w = cadPalavras(pg, { y0: 440, larg: 820, esc: 0.105, destaque: ["detalhe", "Mateus", "nome", "começa", "termina", "Jesus", "promessa", "mesma"] });
  cadDesenho(pg, "livro", { x: 540, y: 1460, esc: 1.1, ts: B("detalhe"), te: B("detalhe") + 1.6, seed: 19 });
  cadDesenho(pg, "estrela", { x: 250, y: 1420, esc: 0.5, ts: B("comeca"), te: B("comeca") + 0.9, seed: 20 });
  cadTexto(pg, "Mt 1:23", { x: 250, y: 1620, esc: 0.085, fonte: "felix", cor: CAD_VERM, ts: B("comeca") + 0.9, te: B("comeca") + 1.6, alinhar: "centro", seed: 25 });
  cadTexto(pg, "Mt 28:20", { x: 830, y: 1620, esc: 0.085, fonte: "felix", cor: CAD_VERM, ts: B("termina") + 0.9, te: B("termina") + 1.6, alinhar: "centro", seed: 26 });
  cadDesenho(pg, "coracao", { x: 830, y: 1440, esc: 0.5, ts: B("termina"), te: B("termina") + 0.9, seed: 21 });
  const m = w.mapa.promessa && w.mapa.promessa[0]; if (m) cadCirculo(pg, (m.x0 + m.x1) / 2, m.y - 28, (m.x1 - m.x0) / 2 + 26, 56, m.te, m.te + 0.5);
};

CENAS.pergunta = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 18, y0: 480, passo: 134 }); EMC_zoom(pg, c);
  cadPalavras(pg, { y0: 480, larg: 820, esc: 0.115, escDest: 1.12, destaque: ["momento", "Deus", "você", "palavra"] });
  cadDesenho(pg, "balao", { x: 400, y: 1290, esc: 1.25, ts: B("pergunta") + 0.8, te: B("pergunta") + 2.0, seed: 22 });
  cadTexto(pg, "escreve nos comentários", { x: 150, y: 1560, esc: 0.105, fonte: "felix", cor: CAD_VERM, ts: B("comenta") - 0.1, te: B("comenta") + 1.6, alinhar: "esq", seed: 23 });
  cadDesenho(pg, "seta", { x: 820, y: 1400, esc: 0.62, ts: B("comenta") + 1.0, te: B("comenta") + 2.0, seed: 24, cor: CAD_VERM });
};

CENAS.fim = (el, c, B) => {
  const pg = cadPagina(el, c, { seed: 19, y0: 520 }); EMC_zoom(pg, c, 1.02);
  cadPalavras(pg, { y0: 520, larg: 820, esc: 0.115, destaque: ["Salva", "segue", "Luz", "Palavra", "lembra"] });
  const bx = [[260, 1010], [820, 1010], [820, 1130], [260, 1130], [260, 1010]];
  cadTracos(pg, { t: [bx], h: [{ poly: bx.slice(0, 4), cor: "#e0577f", ang: 40, sp: 9 }] }, { x: 0, y: 0, ts: B("cta"), te: B("cta") + 0.9, cor: CAD_TINTA });
  cadTexto(pg, "SEGUIR", { x: 540, y: 1090, esc: 0.17, fonte: "elfin", cor: CAD_TINTA, ts: B("cta") + 0.9, te: B("cta") + 1.5, alinhar: "centro", seed: 30, w: 6 });
  const t0 = B("lembra");
  cadTexto(pg, "Deus conosco.", { x: 540, y: 1380, esc: EMC_ajusta("Deus conosco.", "elfin", 800, 0.26), fonte: "elfin", cor: CAD_VERM, ts: t0 + 0.1, te: Math.min(c.fim - 0.1, t0 + 1.5), alinhar: "centro", seed: 31, w: 7 });
};
