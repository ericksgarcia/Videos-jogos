// Identidade do canal Luz da Palavra: paleta, marca no topo, faixas de leitura, barra de progresso,
// legendas palavra a palavra, capítulos (numerais romanos), abertura, versículo na tela e cartão final
// com o logo em pontos de luz. Textos, cores, fontes e logo vêm de identidade/marca.json (MARCA).
// Usado no lugar de aprendendo/identidade/identidade.js pelos vídeos de luz-da-palavra/videos/.

const _hexRGB = (h) => { const v = parseInt(h.slice(1), 16); return [(v >> 16) & 255, (v >> 8) & 255, v & 255]; };
const _rgbF = (h) => _hexRGB(h).map((q) => q / 255);
// paleta do canal + nomes da paleta do Aprendendo Fácil (a biblioteca comum usa C.amarelo, C.verde...)
const C = (() => {
  const p = MARCA.paleta;
  return { ...p, amarelo: p.ouro, laranja: p.ambar, verde: "#8fd9b0", azul: "#6f9be0", ciano: p.luz, rosa: p.vinho, vermelho: p.vinho, cobre: p.ambar, selo: [p.luz, p.ouro], ...p };
})();
const [NOME1, NOME2] = MARCA.nome_tela;
// cores 0–1 para as nuvens de pontos (desenharForma, morfo)
const LUZ = { ouro: _rgbF(C.ouro), luz: _rgbF(C.luz), ambar: _rgbF(C.ambar), branco: _rgbF(C.branco), azul: _rgbF(C.azul), vinho: _rgbF(C.vinho), fundo: _rgbF(C.fundo) };
// cores "r,g,b" para as primitivas 2D (brilhoP, rotuloP...)
const LUZS = Object.fromEntries(Object.entries(LUZ).map(([k, v]) => [k, v.map((q) => Math.round(q * 255)).join(",")]));

// logos em vetor (caixa 256 x 256, preenchimento evenodd): o mesmo desenho vira SVG no topo e pontos no fim
const LOGOS = {
  chama: "M128 14C150 66 208 98 208 166C208 214 172 244 128 244C84 244 48 214 48 166C48 126 72 102 88 74C94 106 106 120 118 126C110 90 114 52 128 14ZM128 122C142 150 170 166 170 196C170 220 151 234 128 234C105 234 86 220 86 196C86 176 106 160 128 122ZM128 166C137 182 151 190 151 206C151 218 141 226 128 226C115 226 105 218 105 206C105 192 119 184 128 166Z",
  livro: "M122 150C96 134 58 130 20 138V230C58 222 96 226 122 244ZM134 150C160 134 198 130 236 138V230C198 222 160 226 134 244ZM34 158C62 153 90 156 110 166V170C90 161 62 158 34 162ZM222 158C194 153 166 156 146 166V170C166 161 194 158 222 162ZM102.3 116.4L49.1 84.4L44.4 93.2L100.7 119.5ZM115.4 106.9L75.5 32.9L65.2 39.1L111.8 109.1ZM130.4 104L135 8L121 8L125.5 104ZM144.2 109.1L190.8 39.1L180.5 32.9L140.6 106.9ZM155.3 119.5L211.6 93.2L206.9 84.4L153.7 116.4ZM128 112a14 14 0 1 0 0.01 0Z",
  lamparina: "M44 186C44 162 86 152 128 154C162 155 184 158 206 148L214 156C200 174 186 194 152 204C116 214 44 214 44 186ZM108 172a16 6 0 1 0 0.01 0ZM96 212H152L164 236H84ZM8 182a18 18 0 1 0 36 0a18 18 0 1 0 -36 0ZM17 182a9 9 0 1 0 18 0a9 9 0 1 0 -18 0ZM206 138C194 120 198 94 212 64C226 94 232 120 220 138C216 144 210 144 206 138Z",
};
const LOGO_D = LOGOS[MARCA.logo] || LOGOS.chama;
// forma de pontos do logo (formas.js): use em qualquer cena com desenharForma(nv, logoForma(), {...})
const logoForma = (n = 12000) => formaPontos({ desenho: (g, R) => { g.save(); g.translate(R * 0.04, R * 0.04); g.scale((R * 0.92) / 256, (R * 0.92) / 256); g.fill(new Path2D(LOGO_D), "evenodd"); g.restore(); } }, n, { espessura: 0.06 });
const ROMANOS = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

// ---------- camadas fixas por cima da ilustração ----------
(() => {
  const st = document.documentElement.style;
  Object.entries(MARCA.paleta).forEach(([k, v]) => {
    if (typeof v !== "string" || v[0] !== "#") return;
    st.setProperty(`--${k.replace(/_/g, "-")}`, v); st.setProperty(`--${k.replace(/_/g, "-")}-rgb`, _hexRGB(v).join(","));
  });
  st.setProperty("--fonte-titulo", `"${MARCA.fontes.titulo}"`); st.setProperty("--fonte-verso", `"${MARCA.fontes.verso}"`);
  const root = $("#root");
  h("div", null, null, root).id = "vinheta";
  h("div", null, null, root).id = "faixa-topo";
  h("div", null, null, root).id = "faixa-base";
  const m = h("div", null, `<svg width="46" height="46" viewBox="0 0 256 256"><defs><linearGradient id="ouroMarca" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.luz}"/><stop offset="1" stop-color="${C.ouro}"/></linearGradient></defs><path d="${LOGO_D}" fill="url(#ouroMarca)" fill-rule="evenodd"/></svg><div class="nome"><b>${NOME1}</b> ${NOME2}</div>`, root);
  m.id = "marca";
  ["capitulo", "gancho", "versos", "leg", "progresso"].forEach((id) => { h("div", null, null, root).id = id; });
  // carrega já no início todas as fontes do canal (o canvas não espera a fonte: sem isto, um rótulo
  // em pontos pode sair com a fonte de reserva em alguns quadros)
  h("div", null, [["LuzSans", 600, ""], ["LuzSans", 700, ""], ["LuzSans", 800, ""], ["Cinzel", 600, ""], ["Cinzel", 700, ""],
    ["Cormorant Garamond", 500, ""], ["Cormorant Garamond", 600, ""], ["Cormorant Garamond", 700, ""], ["Cormorant Garamond", 500, "italic"]]
    .map(([f, w, st]) => `<span style="font-family:'${f}';font-weight:${w};font-style:${st || "normal"}">Aá Çã 1·2</span>`).join(""), root)
    .style.cssText = "position:absolute;left:0;top:0;opacity:0;pointer-events:none;";
})();

// ---------- barra de progresso ----------
tl.fromTo("#progresso", { scaleX: 0 }, { scaleX: 1, duration: T, ease: "none" }, 0);

// ---------- legendas: 4 palavras por vez; a falada fica dourada, as das batidas cor de luz ----------
const LEG = $("#leg");
A.cenas.forEach((c) => {
  const L = c.legendas;  // bloco curtíssimo é juntado ao seguinte
  for (let k = L.length - 2; k >= 0; k--) if (L[k].fim - L[k].ini < 0.4 && L[k].palavras.length + L[k + 1].palavras.length <= 5) {
    L[k + 1] = { ini: L[k].ini, fim: L[k + 1].fim, palavras: L[k].palavras.concat(L[k + 1].palavras), destaque: L[k].destaque.concat(L[k + 1].destaque) };
    L.splice(k, 1);
  }
});
A.cenas.forEach((c) => c.legendas.forEach((b) => {
  const bl = h("div", "bloco", null, LEG);
  const ws = b.palavras.map(([w], k) => h("span", b.destaque[k] ? "k" : null, w, bl));
  const sai = Math.max(b.ini + 0.12, Math.min(b.fim, c.fim - 0.1));
  tl.fromTo(bl, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: Math.min(0.22, sai - b.ini - 0.02), ease: "power2.out", immediateRender: false }, b.ini);
  tl.set(bl, { opacity: 0 }, sai);
  b.palavras.forEach(([, wi, wf], k) => {
    tl.set(ws[k], { color: C.ouro }, wi);
    tl.set(ws[k], { color: b.destaque[k] ? C.luz : "rgba(255,248,236,0.92)" }, Math.max(wi + 0.05, wf));
  });
}));

// ---------- capítulos: numeral romano + título da cena (cena com título vazio não tem capítulo) ----------
const CAP = $("#capitulo");
let _nCap = 0;
A.cenas.forEach((c, i) => {
  if (i === 0 || !c.titulo || MARCA.capitulos === false) return;
  _nCap++;
  const num = MARCA.capitulos === "romanos" ? ROMANOS[_nCap] || String(_nCap) : `${MARCA.capitulo_prefixo} ${String(_nCap).padStart(2, "0")}`;
  const lt = h("div", "lt", `<div class="num"><i></i>${num}</div><div class="barra"></div><div class="t">${c.titulo}</div>`, CAP);
  tl.set(lt, { opacity: 1 }, c.ini + 0.1);
  tl.fromTo($(".num", lt), { x: -24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", immediateRender: false }, c.ini + 0.1);
  tl.fromTo($(".barra", lt), { scaleX: 0 }, { scaleX: 1, duration: 0.8, ease: "expo.out", immediateRender: false }, c.ini + 0.25);
  tl.fromTo($(".t", lt), { y: 24, opacity: 0, filter: "blur(6px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, ease: "power3.out", immediateRender: false }, c.ini + 0.3);
  tl.to(lt, { opacity: 0, y: -16, duration: 0.4, ease: "power2.in" }, (i === A.cenas.length - 1 && c.batidas.cta ? c.batidas.cta : c.fim) - 0.4);
});

// ---------- abertura (gancho): aparece em 0 s, encolhe e sai no instante `sai` ----------
function mostrarGancho(sai) {
  const G = $("#gancho"), dest = (D.gancho_destaque || "").toUpperCase();
  G.innerHTML = `<div class="sup">${MARCA.abertura_sobretitulo}</div><div class="orn"><i></i><b></b><i></i></div><div class="linha">${D.gancho.split(" ").map((w) => `<span class="${dest && w.toUpperCase().includes(dest) ? "dest" : ""}">${w}</span>`).join(" ")}</div>`;
  tl.set(G, { opacity: 1 }, 0);
  tl.fromTo($(".sup", G), { opacity: 0, letterSpacing: "0.7em" }, { opacity: 1, letterSpacing: "0.42em", duration: 1.0, ease: "power3.out" }, 0);
  tl.fromTo($$(".orn i", G), { scaleX: 0 }, { scaleX: (k) => (k ? -1 : 1), duration: 0.9, ease: "expo.out" }, 0.1);
  tl.fromTo($(".orn b", G), { scale: 0, rotation: 0 }, { scale: 1, rotation: 45, duration: 0.7, ease: "back.out(2)" }, 0.2);
  tl.fromTo($$(".linha span", G), { y: 40, opacity: 0, filter: "blur(10px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.8, stagger: 0.14, ease: "power3.out" }, 0.05);
  tl.to(G, { scale: 0.8, y: -14, duration: 0.9, ease: "power2.inOut" }, Math.min(1.8, sai - 1.0));
  tl.to(G, { opacity: 0, y: -50, filter: "blur(8px)", duration: 0.5 }, sai);
}

// ---------- versículo na tela: texto (serifa itálica) + referência exata; aparece em t0, sai em t1 ----------
// o.y: centro vertical (padrão 900); o.destaque: palavras em cor de luz; o.tam: tamanho da letra;
// o.tempos: instante de cada palavra (ex.: das legendas), senão entra palavra a palavra em 0,12 s
function mostrarVersiculo(texto, ref, t0, t1, o = {}) {
  const lim = (w) => w.toLowerCase().replace(/[^\wà-ÿ]/g, "");
  const dest = (o.destaque || []).map(lim);
  const v = h("div", "verso", `<div class="fundo"></div><div class="txt" style="${o.tam ? `font-size:${o.tam}px` : ""}">${texto.split(" ").map((w) => `<span class="${dest.includes(lim(w)) ? "d" : ""}">${w}</span>`).join(" ")}</div><div class="ref"><i></i>${ref.toUpperCase()}<i></i></div>`, $("#versos"));
  const y = o.y ?? 900;
  tl.set(v, { opacity: 1, top: y, yPercent: -50 }, t0);
  tl.fromTo($(".fundo", v), { opacity: 0 }, { opacity: 1, duration: 0.8, immediateRender: false }, t0);
  const sp = $$(".txt span", v);
  sp.forEach((s, k) => tl.fromTo(s, { opacity: 0, y: 16, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power2.out", immediateRender: false }, o.tempos ? o.tempos[k] ?? t0 : t0 + k * 0.12));
  const tr = o.tempoRef ?? (o.tempos ? o.tempos[o.tempos.length - 1] + 0.3 : t0 + sp.length * 0.12 + 0.2);
  tl.fromTo($(".ref", v), { opacity: 0, letterSpacing: "0.5em" }, { opacity: 1, letterSpacing: "0.24em", duration: 0.9, ease: "power3.out", immediateRender: false }, tr);
  tl.fromTo($$(".ref i", v), { scaleX: 0 }, { scaleX: (k) => (k ? -1 : 1), duration: 0.9, ease: "expo.out", immediateRender: false }, tr + 0.1);
  tl.to(v, { opacity: 0, filter: "blur(6px)", duration: 0.5, ease: "power2.in" }, t1);
  return v;
}

// ---------- cartão final: o logo se forma de pontos de luz, nome, SEGUIR e a frase do canal ----------
function cartaoFinal(pai, t) {
  pai.insertAdjacentHTML("beforeend", `<g class="fim" opacity="0"></g>`);
  const g = $$(".fim", pai).pop();
  const TF = telaGPU(g, { ini: t - 0.5, fim: T + 1 }, { fundo: LUZ.fundo.map((q) => q * 0.9) }), nv = TF.nuvem(42000);
  const LG = logoForma(13000), PO = poeiraForma(13000, 77, 0.95), FD = fundoProfundo(33, 420);
  const LX = 540, LY = 700, LE = 400;
  // brasas que sobem em volta da chama (o cartão nunca fica parado)
  const BR = (() => { const r = prng(91); return Array.from({ length: 700 }, () => ({ x: LX + (r() - 0.5) * 760, v: 60 + 140 * r(), f: r(), s: r(), w: r() * 6.283 })); })();
  TF.quadro((x, tt) => {
    const u = PT.ss((tt - t - 0.1) / 1.0), res = FIS.respira(tt, 0, 0.015) * (1 + 0.05 * PT.ss((tt - t) / 6));
    let i = desenharFundo(nv, FD, tt, null, LUZ.luz, 0.75, 0);
    for (const b of BR) { const d = ((tt - t) * b.v + b.f * 1300) % 1300, yy = 1420 - d, xx = b.x + Math.sin(tt * 1.3 + b.w) * 22, al = u * Math.sin(Math.PI * d / 1300) * (0.25 + 0.5 * b.s); nv.ponto(i++, xx, yy, LUZ.ambar[0], LUZ.ambar[1], LUZ.ambar[2], al * 0.6, 2 + 3 * b.s); }
    brilhoP(x, LX, LY + 20, 520, LUZS.ambar, 0.18 * u);
    brilhoP(x, LX, LY + 20, 230, LUZS.luz, 0.22 * u * (0.85 + 0.15 * Math.sin(tt * 2)));
    // raios suaves atrás do logo
    for (let k = 0; k < 14; k++) { const an = (k / 14) * 6.283 + tt * 0.05, L = 330 + 60 * Math.sin(k * 2.3 + tt); linhaP(x, LX + Math.cos(an) * 170, LY + 20 + Math.sin(an) * 170, LX + Math.cos(an) * L, LY + 20 + Math.sin(an) * L, LUZS.ouro, 0.07 * u, 3); }
    i = morfo(nv, PO, LG, u, { de: { cx: LX, cy: LY + 60, esc: 1000, cor: LUZ.ambar, a: 0.55 }, para: { cx: LX, cy: LY, esc: LE * res, cor: LUZ.ouro, borda: LUZ.luz, giro: 0.18 * Math.sin(tt * 0.6), desloca: (k, sx, sy) => { const alto = Math.max(0, (LY - sy) / LE + 0.3); return [sx + Math.sin(tt * 6.5 + sy * 0.03) * 5 * alto, sy - Math.abs(Math.sin(tt * 4.3 + sx * 0.02)) * 4 * alto]; } }, t: tt, onda: 0.35, curva: 0.55, sobe: 40, i0: i });
    nv.total(i);
  });
  const ref = MARCA.cta_tela.referencia;
  g.insertAdjacentHTML("beforeend", `<foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml" class="cf">
    <div class="n" style="top:985px"><b>${NOME1}</b> ${NOME2}</div>
    <div class="orn" style="top:1100px"><i></i><b></b><i></i></div>
    <div class="bt" style="top:1150px"><span>${MARCA.cta_tela.botao}</span></div>
    <div class="p" style="top:${ref ? 1325 : 1335}px">${MARCA.cta_tela.pergunta}</div>
    ${ref ? `<div class="r" style="top:1400px">${ref}</div>` : ""}</div></foreignObject>`);
  tl.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.7, ease: "power1.inOut", immediateRender: false }, t);
  $$(".cf > div", g).forEach((d, k) => tl.fromTo(d, { opacity: 0, y: 30, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "power3.out", immediateRender: false }, t + 0.6 + k * 0.15));
  const bt = $(".cf .bt span", g);
  tl.fromTo(bt, { scale: 1 }, { scale: 1.06, duration: 0.5, yoyo: true, repeat: Math.max(1, Math.floor((T - t - 1.6) / 0.5)), ease: "sine.inOut", immediateRender: false }, t + 1.4);
}

// ---------- silhuetas de luz (pessoas e figuras sagradas: sempre sem rosto nem feições) ----------
// caixa 256 x 256; "pessoa" = figura comum; "manto" = figura de túnica longa (ex.: Jesus, profetas)
const SILHUETAS = {
  pessoa: "M122 50C122 58 120 62 112 64C98 67 90 72 88 82C84 104 78 130 70 156C67 165 74 168 77 160C84 136 92 110 96 96C98 112 100 124 100 134C99 148 100 158 104 170C108 200 110 226 110 240L124 242C124 222 126 196 127 176L129 176C130 196 132 222 132 242L146 240C146 226 148 200 152 170C156 158 157 148 156 134C156 124 158 112 160 96C164 110 172 136 179 160C182 168 189 165 186 156C178 130 172 104 168 82C166 72 158 67 144 64C136 62 134 58 134 50ZM113 32a15 18 0 1 0 30 0a15 18 0 1 0 -30 0Z",
  manto: "M122 50C122 58 120 62 112 64C98 67 90 72 87 84L78 150C77 158 85 160 87 152L94 112L82 238C102 244 154 244 174 238L162 112L169 152C171 160 179 158 178 150L169 84C166 72 158 67 144 64C136 62 134 58 134 50ZM113 32a15 18 0 1 0 30 0a15 18 0 1 0 -30 0Z",
};
// silhuetas desenhadas com traços (poses): "ajoelhada" = pessoa de joelhos, curvada, olhando para a direita
const SILHUETAS_POSE = {
  ajoelhada: (g) => {
    g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = "#fff";
    const tr = (w, pts) => { g.lineWidth = w; g.beginPath(); g.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 6) g.bezierCurveTo(pts[k], pts[k + 1], pts[k + 2], pts[k + 3], pts[k + 4], pts[k + 5]); g.stroke(); };
    g.beginPath(); g.ellipse(166, 104, 15, 17, 0.5, 0, 6.283); g.fill();
    tr(34, [150, 126, 130, 140, 108, 160, 100, 190]);      // tronco curvado para a frente
    tr(30, [100, 196, 120, 204, 140, 210, 160, 214]);      // coxa
    tr(24, [160, 216, 140, 226, 110, 232, 84, 236]);       // canela até o pé
    tr(14, [150, 134, 166, 150, 180, 168, 190, 190]);      // braço estendido, mãos no chão
  },
};
const silhuetaForma = (tipo = "pessoa", n = 12000) => formaPontos({ desenho: (g, R) => { g.save(); g.translate(R * 0.04, R * 0.04); g.scale((R * 0.92) / 256, (R * 0.92) / 256); g.fillStyle = "#fff"; if (SILHUETAS_POSE[tipo]) SILHUETAS_POSE[tipo](g); else g.fill(new Path2D(SILHUETAS[tipo])); g.restore(); } }, n, { espessura: 0.04 });

// ---------- cena da pergunta para os comentários: UMA pergunta forte, escrita grande ----------
// o.texto: a pergunta (HTML; <b>palavra</b> fica dourada); o.sub: o pedido ("Marca essa pessoa aqui do lado.")
// o.icone: forma Phosphor que "leva" a resposta (padrão "heart"); o.de = [forma, { cx, cy, esc, cor }]: a
// forma do fim da cena anterior vira o ícone (continuidade).
// batidas da cena: "comenta" (o ícone voa até o botão de comentários na lateral direita e fica pulsando)
const _ICO_LP = {};
function cenaPergunta(el, c, B, o = {}) {
  const ico = _ICO_LP[o.icone || "heart"] = _ICO_LP[o.icone || "heart"] || formaPontos(o.icone || "heart", 9000);
  const tC = B("comenta"), y0 = o.y || 560;
  const TP = telaGPU(el, c, { fundo: LUZ.fundo.map((q) => q * 0.85) }), nv = TP.nuvem(40000), FD = fundoProfundo(o.seed || 61, 600);
  // o texto vem depois do canvas (senão fica por baixo dele)
  const tx = palcoTexto(el, [["lp-q", y0, o.tam || 74, o.texto, "lp-q", ""], ["lp-s", y0 + (o.alturaTexto || 300), 46, o.sub || "", "lp-s", ""]]);
  tl.set([tx["lp-q"], tx["lp-s"]], { opacity: 0 }, 0);  // invisíveis até a hora (palco começa visível)
  tl.fromTo(tx["lp-q"], { opacity: 0, y: 24, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, ease: "power3.out", immediateRender: false }, c.ini + 0.15);
  if (o.sub) tl.fromTo(tx["lp-s"], { opacity: 0, y: 16, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "power3.out", immediateRender: false }, tC - 0.2);
  const PO = (() => { const r = prng(o.seed || 61); return Array.from({ length: 500 }, () => ({ x: r() * 1080, v: 30 + 70 * r(), f: r(), s: r() })); })();
  const CAM = cameraProf([[c.ini, { x: 540, y: 960, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 950, zoom: 1.06 }]]);
  const IX = 540, IY = 1110, BX = 990, BY = 1250;
  TP.quadro((x, t) => {
    const cam = CAM(t);
    let i = desenharFundo(nv, FD, t, cam, LUZ.luz, 0.8, 0);
    brilhoP(x, 540, 1500, 900, LUZS.ambar, 0.1);
    for (const p of PO) { const d = ((t - c.ini) * p.v + p.f * 1900) % 1900; nv.ponto(i++, p.x + Math.sin(t * 0.6 + p.f * 9) * 14, 1900 - d, LUZ.ambar[0], LUZ.ambar[1], LUZ.ambar[2], 0.25 * p.s * Math.sin(Math.PI * d / 1900), 2 + 2 * p.s); }
    // o ícone: nasce da forma da cena anterior, respira; na hora do pedido voa em arco até o botão
    const ub = PT.ss((t - c.ini + 0.1) / 0.9), voo = PT.inOut((t - tC + 0.1) / 1.0), [vx, vy] = FIS.arco(IX, IY, BX, BY, voo, 110);
    const esc = PT.lerp(300, 110, voo) * FIS.respira(t, 0, 0.03) * (voo >= 1 ? 1 + 0.12 * Math.max(0, Math.sin((t - tC) * 6)) : 1);
    const para = { cx: vx, cy: vy, esc, cor: LUZ.ouro, borda: LUZ.luz, brilho: 1.1, giro: 0.15 * Math.sin(t * 0.8) };
    brilhoP(x, vx, vy, esc * 1.3, LUZS.ambar, 0.3);
    if (o.de && ub < 1) i = morfo(nv, o.de[0], ico, ub, { de: o.de[1], para, t, onda: 0.3, curva: 0.5, i0: i });
    else i = desenharForma(nv, ico, { ...para, a: o.de ? 1 : ub, t, i0: i });
    // rastro do voo e anéis chamando para o botão de comentários
    if (voo > 0 && voo < 1) for (let k = 1; k <= 26; k++) { const v2 = Math.max(0, voo - k * 0.018), [qx, qy] = FIS.arco(IX, IY, BX, BY, v2, 110); discoP(x, qx, qy, 7 * (1 - k / 27), LUZS.luz, 0.5 * (1 - k / 27)); }
    if (voo >= 1) for (let k = 0; k < 3; k++) { const u = ((t - tC) * 0.8 + k / 3) % 1; anelP(x, BX, BY, 60 + u * 130, LUZS.ouro, 0.5 * (1 - u), 3); }
    const aS = PT.ss((t - tC - 0.5) / 0.4);
    if (aS > 0.01) { const b = Math.sin(t * 6) * 14; fSeta(x, 640 + b, BY, 840 + b, BY, LUZS.ouro, aS, 10); rotuloP(x, "comentários", 740, BY - 66, 40, "255,236,200", aS); }
    nv.total(i);
  });
}

// ================= bonecos de linha (esqueleto animado, traços de luz, sem rosto) =================
// Pose (ângulos em radianos; 0 = pendurado para baixo, positivo = para a frente; dir = 1 olha para a direita):
//   { tronco, cabeca, braco: [[ombro, cotovelo] (trás), [ombro, cotovelo] (frente)], perna: [[quadril, joelho] x2] }
// A raiz (bacia) é posta sozinha para o ponto mais baixo (pé ou joelho) encostar no chão (o.chao).
//   boneco(nv, x, i, t, pose, { x: 540, chao: 1500, H: 600, dir: 1, cor, tipo: "pessoa" | "manto" | "gigante", cam, z, a })
//   POSES.de_pe / andar(fase) / ajoelhado / orando / bracos_abertos / funda(giro) / lanca / caido ...
//   poseMix(A, B, u) mistura duas poses (u 0–1). Ver luz-da-palavra/README.md.
const POSES = {
  de_pe: { tronco: 0, cabeca: 0, braco: [[-0.22, 0.25], [0.2, 0.3]], perna: [[-0.08, 0], [0.08, 0]] },
  ajoelhado: { tronco: 0.05, cabeca: 0.25, braco: [[0.25, 1.3], [0.35, 1.4]], perna: [[1.55, -1.6], [0.1, -1.55]] },
  orando: { tronco: 0.12, cabeca: 0.45, braco: [[0.55, 1.75], [0.6, 1.8]], perna: [[1.55, -1.6], [0.1, -1.55]] },
  bracos_abertos: { tronco: -0.05, cabeca: -0.25, braco: [[-2.2, 0.2], [2.2, -0.2]], perna: [[-0.12, 0], [0.12, 0]] },
  carregando: { tronco: 0.05, cabeca: 0.05, braco: [[0.6, 1.2], [0.7, 1.1]], perna: [[-0.05, 0], [0.05, 0]] },
  caido: { tronco: 1.5, cabeca: 1.6, braco: [[1.2, 0.2], [1.9, 0.3]], perna: [[1.45, -0.1], [1.6, -0.3]] },
};
const _ang = (a, b, u) => a + (b - a) * u;
function poseMix(A, B, u) {
  u = Math.max(0, Math.min(1, u));
  return { tronco: _ang(A.tronco, B.tronco, u), cabeca: _ang(A.cabeca, B.cabeca, u),
    braco: A.braco.map((p, k) => [_ang(p[0], B.braco[k][0], u), _ang(p[1], B.braco[k][1], u)]),
    perna: A.perna.map((p, k) => [_ang(p[0], B.perna[k][0], u), _ang(p[1], B.perna[k][1], u)]) };
}
// caminhada: fase em radianos (cresce com o tempo); passo = amplitude
POSES.andar = (fase, passo = 1) => {
  const s = Math.sin(fase), c2 = Math.cos(fase);
  return { tronco: 0.06 * passo, cabeca: 0, braco: [[-0.45 * s * passo, 0.35 + 0.2 * Math.max(0, s)], [0.45 * s * passo, 0.35 + 0.2 * Math.max(0, -s)]],
    perna: [[0.42 * s * passo, -0.9 * Math.max(0, -c2) * passo - 0.05], [-0.42 * s * passo, -0.9 * Math.max(0, c2) * passo - 0.05]] };
};
// funda: o braço da frente gira acima da cabeça (giro em radianos); o de trás aponta para o alvo
POSES.funda = (giro) => ({ tronco: -0.05, cabeca: -0.1, braco: [[1.3, 0.1], [Math.PI - 0.15 + 0.3 * Math.sin(giro), 0.2]], perna: [[-0.25, 0], [0.22, -0.1]] });
POSES.lanca = { tronco: 0.25, cabeca: 0.1, braco: [[-0.5, 0.2], [1.5, 0.05]], perna: [[-0.45, 0], [0.5, -0.25]] };

const _BON_RND = (() => { const r = prng(4242); return Array.from({ length: 6000 }, () => [r(), r(), r()]); })();
function boneco(nv, x, i, t, pose, o = {}) {
  const H = o.H || 600, d = o.dir ?? 1, cor = o.cor || LUZ.luz, a = o.a ?? 1, tipo = o.tipo || "pessoa";
  const Lt = 0.28 * H, Ln = 0.045 * H, Rh = 0.078 * H, La = 0.16 * H, Lf = 0.15 * H, Lc = 0.235 * H, Ls = 0.225 * H;
  const v = (ang, L) => [Math.sin(ang) * d * L, Math.cos(ang) * L];        // 0 = para baixo
  const up = (ang, L) => [Math.sin(ang) * d * L, -Math.cos(ang) * L];      // 0 = para cima
  // posições relativas à bacia (0, 0)
  const C = up(pose.tronco, Lt), N = [C[0] + up(pose.tronco + pose.cabeca * 0.4, Ln)[0], C[1] + up(pose.tronco + pose.cabeca * 0.4, Ln)[1]];
  const Hd = [N[0] + up(pose.tronco + pose.cabeca, Rh * 1.05)[0], N[1] + up(pose.tronco + pose.cabeca, Rh * 1.05)[1]];
  const S = [C[0] + up(pose.tronco, -0.03 * H)[0], C[1] + up(pose.tronco, -0.03 * H)[1]];
  const bracos = pose.braco.map(([om, co]) => { const E = [S[0] + v(pose.tronco + om, La)[0], S[1] + v(pose.tronco + om, La)[1]]; return [S, E, [E[0] + v(pose.tronco + om + co, Lf)[0], E[1] + v(pose.tronco + om + co, Lf)[1]]]; });
  const pernas = pose.perna.map(([qu, jo]) => { const K = v(qu, Lc); return [[0, 0], K, [K[0] + v(qu + jo, Ls)[0], K[1] + v(qu + jo, Ls)[1]]]; });
  // apoio: o ponto mais baixo (pé, joelho ou, se caído, o tronco) encosta no chão
  let baixo = 0; for (const [, K, F] of pernas) baixo = Math.max(baixo, K[1], F[1]); baixo = Math.max(baixo, C[1] - Rh * 0.2, Hd[1] + Rh);
  const ox = o.x ?? 540, oy = (o.chao ?? 1500) - baixo - (o.sobe || 0) - Math.max(0, (o.passoY || 0));
  const proj = (p) => (o.cam ? projP(o.cam, ox + p[0], oy + p[1], o.z ?? 1) : [ox + p[0], oy + p[1], 1]);
  const kk = o.cam ? o.cam.zoom / (o.z ?? 1) : 1;
  let r = 0;
  // traço de luz entre dois pontos: pontos espalhados numa faixa de largura w (px do mundo)
  const traco = (p0, p1, w0, w1, al = 1, c = cor) => {
    const [x0, y0] = proj(p0), [x1, y1] = proj(p1), L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(6, Math.round(L * (w0 + w1) * 0.5 * kk / 9));
    const nx = -(y1 - y0) / (L || 1), ny = (x1 - x0) / (L || 1);
    for (let k = 0; k < n && i < nv.n; k++) { const [u, s, q] = _BON_RND[r++ % _BON_RND.length], w = (w0 + (w1 - w0) * u) * kk, off = (s - 0.5) * w, borda = Math.abs(s - 0.5) * 2;
      nv.ponto(i++, x0 + (x1 - x0) * u + nx * off, y0 + (y1 - y0) * u + ny * off, c[0], c[1], c[2], a * al * (0.35 + 0.45 * borda + 0.2 * q) * (0.85 + 0.15 * Math.sin(t * 3 + q * 40)), (2.2 + 1.4 * q) * Math.min(1.8, Math.sqrt(kk))); }
    linhaP(x, x0, y0, x1, y1, `${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)}`, 0.12 * a * al, Math.max(2, (w0 + w1) * 0.5 * kk));
  };
  const wl = 0.034 * H, wt = 0.058 * H;
  // trás primeiro (perna/braço de trás mais fracos = profundidade)
  traco(pernas[0][0], pernas[0][1], wl, wl * 0.9, 0.6); traco(pernas[0][1], pernas[0][2], wl * 0.9, wl * 0.8, 0.6);
  traco(bracos[0][0], bracos[0][1], wl * 0.85, wl * 0.8, 0.6); traco(bracos[0][1], bracos[0][2], wl * 0.8, wl * 0.7, 0.6);
  if (tipo === "manto") {
    // túnica: faixa larga do peito até perto dos pés (cobre as pernas)
    const pes = [(pernas[0][2][0] + pernas[1][2][0]) / 2, Math.max(pernas[0][2][1], pernas[1][2][1]) - 0.02 * H];
    traco([S[0] * 0.9, S[1] * 0.9], [pes[0], pes[1]], wt * 1.1, 0.24 * H, 0.75);
  } else { traco(pernas[1][0], pernas[1][1], wl, wl * 0.9); traco(pernas[1][1], pernas[1][2], wl * 0.9, wl * 0.8); }
  traco([0, 0], C, wt, wt * 1.15); traco(C, N, wl * 0.8, wl * 0.8);
  traco(bracos[1][0], bracos[1][1], wl * 0.85, wl * 0.8); traco(bracos[1][1], bracos[1][2], wl * 0.8, wl * 0.7);
  // cabeça: um oval de luz, sem rosto
  const [hx, hy] = proj(Hd); const rr = Rh * kk;
  for (let k = 0; k < Math.round(rr * 4) && i < nv.n; k++) { const [u, s, q] = _BON_RND[r++ % _BON_RND.length], an = u * 6.283, dd = rr * (0.55 + 0.45 * Math.sqrt(s)); nv.ponto(i++, hx + Math.cos(an) * dd * 0.9, hy + Math.sin(an) * dd, cor[0], cor[1], cor[2], a * (0.3 + 0.5 * s + 0.2 * q), 2.4 + 1.2 * q); }
  brilhoP(x, hx, hy, rr * 2.2, `${Math.round(cor[0] * 255)},${Math.round(cor[1] * 255)},${Math.round(cor[2] * 255)}`, 0.18 * a);
  if (tipo === "gigante") { // elmo
    const [h0x, h0y] = proj([Hd[0] - Rh, Hd[1] - Rh * 0.2]), [h1x, h1y] = proj([Hd[0] + Rh, Hd[1] - Rh * 0.2]); x.beginPath(); x.moveTo(h0x, h0y); x.quadraticCurveTo(hx, hy - rr * 2.1, h1x, h1y); x.strokeStyle = `rgba(${Math.round(cor[0] * 255)},${Math.round(cor[1] * 255)},${Math.round(cor[2] * 255)},${0.8 * a})`; x.lineWidth = 0.025 * H * kk; x.stroke();
  }
  // devolve as mãos (trás, frente), a cabeça e o próximo índice, para prender objetos (funda, lança, pão)
  return { i, maos: bracos.map((b) => proj(b[2])), cabeca: [hx, hy], escala: kk };
}

// ================= personagens em traço (linha nítida, roupa e acessórios, SEM rosto) =================
// Mesmo esqueleto e poses dos bonecos (POSES, poseMix). Desenhados na camada nítida (sem bloom) da
// telaGPU: cada parte tem preenchimento escuro e contorno de luz, então a parte da frente cobre as linhas
// de trás, como numa ilustração. tipo: "davi" | "golias" | "jesus" | "pessoa".
//   const p = personagem(x, t, pose, { tipo: "davi", x: 330, chao: 1500, H: 560, dir: 1, cam, z, a });
//   p.maos[0|1], p.cabeca, p.escala  (para prender a funda, a lança, um pão...)
const _PERS = {
  davi: { cor: [1, 0.85, 0.5], larg: 1, tunica: -0.17, cabelo: "cachos", bolsa: true },
  pessoa: { cor: [0.85, 0.9, 1], larg: 1, tunica: -0.3, cabelo: "curto" },
  jesus: { cor: [1, 0.93, 0.78], larg: 1.05, tunica: -0.43, cabelo: "longo", manto: true },
  golias: { cor: [1, 0.55, 0.5], larg: 1.35, tunica: -0.24, cabelo: "elmo", armadura: true },
};
function personagem(x, t, pose, o = {}) {
  const P = _PERS[o.tipo || "pessoa"], H = o.H || 560, d = o.dir ?? 1, a = o.a ?? 1, L = P.larg;
  const cor = o.cor || P.cor, rgb = cor.map((q) => Math.round(q * 255)).join(","), fundo = o.preench || "8,11,28";
  const Lt = 0.28 * H, Ln = 0.045 * H, Rh = 0.072 * H, La = 0.16 * H, Lf = 0.15 * H, Lc = 0.235 * H, Ls = 0.225 * H;
  const v = (ang, Lg) => [Math.sin(ang) * d * Lg, Math.cos(ang) * Lg], up = (ang, Lg) => [Math.sin(ang) * d * Lg, -Math.cos(ang) * Lg], som = (p, q) => [p[0] + q[0], p[1] + q[1]];
  const C = up(pose.tronco, Lt), N = som(C, up(pose.tronco + pose.cabeca * 0.4, Ln)), Hd = som(N, up(pose.tronco + pose.cabeca, Rh * 1.05)), S = som(C, up(pose.tronco, -0.035 * H));
  const bracos = pose.braco.map(([om, co]) => { const E = som(S, v(pose.tronco + om, La)); return [S, E, som(E, v(pose.tronco + om + co, Lf)), pose.tronco + om + co]; });
  const pernas = pose.perna.map(([qu, jo]) => { const K = v(qu, Lc); return [[0, 0], K, som(K, v(qu + jo, Ls)), qu + jo]; });
  let baixo = 0; for (const [, K, F] of pernas) baixo = Math.max(baixo, K[1], F[1] + 0.012 * H); baixo = Math.max(baixo, C[1] - Rh * 0.2, Hd[1] + Rh);
  const ox = o.x ?? 540, oy = (o.chao ?? 1500) - baixo;
  const pr = (p) => (o.cam ? projP(o.cam, ox + p[0], oy + p[1], o.z ?? 1) : [ox + p[0], oy + p[1], 1]);
  const kk = o.cam ? o.cam.zoom / (o.z ?? 1) : 1;
  const y = x._texto || x; if (x._texto) y._usado = true;
  y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.lineJoin = "round"; y.lineCap = "round"; y.globalAlpha = a;
  const lw = Math.max(1.6, 0.0075 * H * kk);
  // desenha um contorno fechado (pontos no mundo): preenchimento escuro + linha de luz com brilho
  const forma = (pts, o2 = {}) => {
    y.beginPath(); pts.forEach((p, k) => { const [sx, sy] = pr(p); k ? y.lineTo(sx, sy) : y.moveTo(sx, sy); }); if (!o2.aberto) y.closePath();
    if (!o2.aberto) { y.fillStyle = `rgba(${o2.fundo || fundo},${o2.fa ?? 0.92})`; y.fill(); }
    y.strokeStyle = `rgba(${o2.rgb || rgb},${o2.al ?? 1})`; y.lineWidth = lw * (o2.lw || 1); y.shadowColor = `rgba(${o2.rgb || rgb},0.7)`; y.shadowBlur = 10 * kk; y.stroke(); y.shadowBlur = 0; y.stroke();
  };
  const linha = (pts, o2 = {}) => forma(pts, { ...o2, aberto: true });
  // cápsula (membro) de p0 a p1, larguras w0/w1
  const capsula = (p0, p1, w0, w1, o2) => {
    const dx = p1[0] - p0[0], dy = p1[1] - p0[1], l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, an = Math.atan2(dy, dx), pts = [];
    for (let k = 0; k <= 6; k++) { const b = an - Math.PI / 2 + (k / 6) * Math.PI; pts.push([p1[0] + Math.cos(b) * w1, p1[1] + Math.sin(b) * w1]); }
    for (let k = 0; k <= 6; k++) { const b = an + Math.PI / 2 + (k / 6) * Math.PI; pts.push([p0[0] + Math.cos(b) * w0, p0[1] + Math.sin(b) * w0]); }
    forma(pts, o2);
  };
  // referencial do tronco: u = para cima ao longo do tronco, f = para a frente
  const u = [C[0] / Lt, C[1] / Lt], f = [-u[1] * d, u[0] * d], T = (aa, bb) => [u[0] * aa * H + f[0] * bb * H * L, u[1] * aa * H + f[1] * bb * H * L];
  const mao = (b, w) => { const [, , Hm] = b; forma(Array.from({ length: 10 }, (_, k) => [Hm[0] + Math.cos(k / 10 * 6.283) * w, Hm[1] + Math.sin(k / 10 * 6.283) * w * 1.15])); };
  const pe = (pp) => { const [, , F, ang] = pp, fd = [Math.cos(ang) * d, -Math.sin(ang)], dn = [Math.sin(ang) * d, Math.cos(ang)], w = 0.016 * H, c = 0.07 * H;
    forma([[F[0] - fd[0] * w, F[1] - fd[1] * w], [F[0] + fd[0] * c, F[1] + fd[1] * c], [F[0] + fd[0] * c + dn[0] * w, F[1] + fd[1] * c + dn[1] * w], [F[0] - fd[0] * w * 1.5 + dn[0] * w, F[1] - fd[1] * w * 1.5 + dn[1] * w]]);
    if (o.tipo !== "golias") linha([[F[0] + fd[0] * c * 0.45 - dn[0] * w * 0.2, F[1] + fd[1] * c * 0.45 - dn[1] * w * 0.2], [F[0] + fd[0] * c * 0.45 + dn[0] * w, F[1] + fd[1] * c * 0.45 + dn[1] * w]], { lw: 0.7 }); };
  const braco = (b, atras) => { const [Sb, E, Hm] = b, w = 0.03 * H * L; capsula(Sb, E, w, w * 0.9, { al: atras ? 0.7 : 1 }); capsula(E, Hm, w * 0.85, w * 0.7, { al: atras ? 0.7 : 1 });
    if (P.manto || o.tipo === "davi" || o.tipo === "pessoa") { const m = [Sb[0] + (E[0] - Sb[0]) * 0.55, Sb[1] + (E[1] - Sb[1]) * 0.55], dx = E[0] - Sb[0], dy = E[1] - Sb[1], l = Math.hypot(dx, dy) || 1, wm = w * (P.manto ? 1.9 : 1.35); linha([[m[0] - dy / l * wm, m[1] + dx / l * wm], [m[0] + dy / l * wm, m[1] - dx / l * wm]], { lw: 0.8, al: atras ? 0.6 : 0.9 }); }
    mao(b, 0.026 * H * L); };
  const perna = (pp, atras) => { const [Q, K, F] = pp, w = 0.043 * H * L; capsula(Q, K, w, w * 0.85, { al: atras ? 0.7 : 1 }); capsula(K, F, w * 0.8, w * 0.6, { al: atras ? 0.7 : 1 });
    if (P.armadura) { const g0 = [K[0] + (F[0] - K[0]) * 0.15, K[1] + (F[1] - K[1]) * 0.15], g1 = [K[0] + (F[0] - K[0]) * 0.85, K[1] + (F[1] - K[1]) * 0.85]; capsula(g0, g1, w * 0.95, w * 0.75, { al: atras ? 0.7 : 1 }); }
    pe(pp); };
  // ---- ordem: braço e perna de trás, perna da frente, roupa, cabeça, braço da frente ----
  braco(bracos[0], true); perna(pernas[0], true); perna(pernas[1], false);
  const h = P.tunica, pts = [[0.26, -0.06], [0.285, -0.025], [0.285, 0.035], [0.26, 0.065], [0.17, 0.08], [0.06, 0.065], [-0.03, 0.08], [h, P.manto ? 0.13 : 0.095], [h - 0.012, 0.0], [h, P.manto ? -0.11 : -0.085], [-0.03, -0.075], [0.06, -0.06], [0.19, -0.075]];
  forma(pts.map(([aa, bb]) => T(aa, bb)));
  if (P.manto) { linha([T(0.26, 0.05), T(0.1, -0.02), T(-0.05, -0.08)], { lw: 0.9 }); linha([T(0.0, 0.04), T(h + 0.04, 0.07)], { lw: 0.6, al: 0.7 }); linha([T(-0.05, -0.02), T(h + 0.03, -0.03)], { lw: 0.6, al: 0.7 }); }
  linha([T(0.055, -0.062), T(0.055, 0.068)], { lw: 1.2 });                                   // cinto
  if (P.armadura) for (let r = 0; r < 5; r++) for (let c2 = 0; c2 < 4; c2++) { const aa = 0.22 - r * 0.045, bb = -0.05 + c2 * 0.032 + (r % 2) * 0.016; linha([T(aa, bb - 0.014), T(aa - 0.016, bb), T(aa, bb + 0.014)], { lw: 0.6, al: 0.75 }); }
  if (P.bolsa) { forma([T(0.04, 0.07), T(0.04, 0.12), T(-0.06, 0.125), T(-0.065, 0.075)]); linha([T(0.04, 0.09), T(0.27, -0.04)], { lw: 0.8 }); }
  // pescoço e cabeça (só o contorno: sem olhos, nariz ou boca)
  capsula(C, N, 0.022 * H, 0.02 * H);
  const ang = pose.tronco + pose.cabeca, cabeca = Array.from({ length: 16 }, (_, k) => { const b = (k / 16) * 6.283; return [Hd[0] + Math.cos(b) * Rh * 0.85, Hd[1] + Math.sin(b) * Rh]; });
  forma(cabeca);
  const HU = up(ang, 1), HF = [-HU[1] * d, HU[0] * d], Hp = (aa, bb, r) => [Hd[0] + HU[0] * aa * r + HF[0] * bb * r, Hd[1] + HU[1] * aa * r + HF[1] * bb * r];
  // cabelo como uma calota sobre a cabeça (ângulo a partir do alto: + para a frente): contorno de fora com cachos, volta por dentro
  const calota = (de, ate, rFora, cacho, n = 22) => { const pts = []; for (let k = 0; k <= n; k++) { const th = de + (ate - de) * k / n, rr = Rh * (rFora + cacho * Math.abs(Math.sin(th * 6))); pts.push(Hp(Math.cos(th), Math.sin(th), rr)); } for (let k = n; k >= 0; k--) { const th = de + (ate - de) * k / n; pts.push(Hp(Math.cos(th), Math.sin(th), Rh * 0.9)); } return pts; };
  if (P.cabelo === "cachos") forma(calota(-2.5, 1.05, 1.16, 0.09));
  if (P.cabelo === "curto") forma([Hp(0.2, 0.75, Rh), Hp(0.75, 0.55, Rh * 1.05), Hp(1.05, 0, Rh * 1.02), Hp(0.75, -0.7, Rh * 1.05), Hp(0.1, -0.95, Rh), Hp(0.15, -0.5, Rh), Hp(0.55, 0.1, Rh)]);
  if (P.cabelo === "longo") forma([Hp(0.3, 0.7, Rh), Hp(0.85, 0.5, Rh * 1.05), Hp(1.08, -0.05, Rh), Hp(0.7, -0.85, Rh * 1.08), Hp(-0.2, -1.05, Rh * 1.1), Hp(-1.6, -0.95, Rh), Hp(-1.7, -0.35, Rh), Hp(-0.6, -0.25, Rh), Hp(0.2, -0.45, Rh), Hp(0.55, 0.1, Rh)]);
  if (P.cabelo === "elmo") { forma([Hp(-0.25, -1.08, Rh), Hp(0.6, -1.0, Rh * 1.08), Hp(1.12, 0, Rh * 1.06), Hp(0.6, 1.0, Rh * 1.08), Hp(-0.25, 1.08, Rh), Hp(-0.1, 0.55, Rh), Hp(0.25, 0.3, Rh), Hp(0.25, -0.3, Rh)]); const pena = Array.from({ length: 12 }, (_, k) => { const u2 = k / 11, th = 0.5 - 2.3 * u2; return Hp(Math.cos(th) * (1.1 + 0.45 * Math.sin(Math.PI * u2)), Math.sin(th) * (1.1 + 0.45 * Math.sin(Math.PI * u2)), Rh); }); linha(pena, { lw: 2.2 }); }
  braco(bracos[1], false);
  y.restore();
  return { maos: bracos.map((b) => pr(b[2])), cabeca: pr(Hd), escala: kk, pr, H };
}
