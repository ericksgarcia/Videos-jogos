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
