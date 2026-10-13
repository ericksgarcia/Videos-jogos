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

// ---------- cena do apoio (logo depois da abertura, ~5–7 s): apelo à fé → curtir + comentar ----------
// Rápida para ninguém sair: luzes soltas se juntam em mãos que oram na palavra de fé (batida "fe"); na batida "curte" um
// coração de luz voa até o botão de curtir (lateral direita) e pulsa; na batida "comenta" a seta aponta os comentários com
// "amém". Compatível com o formato antigo (batidas "unido" e "segue": botão + SEGUIR). o.texto / o.sub trocam os textos;
// o.forma troca o símbolo (padrão hands-praying).
const _APOIO_F = {};
function cenaApoio(el, c, B, o = {}) {
  const nome = o.forma || "hands-praying", F2 = _APOIO_F[nome] = _APOIO_F[nome] || formaPontos(nome, 9000), PO2 = _APOIO_F._p = _APOIO_F._p || poeiraForma(9000, 77, 0.5);
  const COR2 = _APOIO_F._c = _APOIO_F._c || formaPontos("heart", 5000), tem = (n) => c.batidas[n] != null;
  const tU = tem("fe") ? B("fe") : B("unido"), tL = tem("curte") ? B("curte") : null, tS = tem("segue") ? B("segue") : null, tC = B("comenta"), y0 = o.y || 420;
  const tSub = Math.min(tL ?? 1e9, tS ?? 1e9, tC) - 0.15;
  const TP = telaGPU(el, c, { fundo: LUZ.fundo.map((q) => q * 0.85) }), nv = TP.nuvem(36000), FD = fundoProfundo(o.seed || 83, 600);
  const tx = palcoTexto(el, [["lp-q", y0, o.tam || 78, o.texto || (tem("fe") ? "Se você tem <b>fé</b>…" : "A família cristã<br><b>é unida.</b>"), "lp-q", ""], ["lp-s", 1380, 50, o.sub || (tL != null ? "Curte e comenta <b>amém</b>" : "Segue e comenta <b>amém</b>"), "lp-s", ""]]);
  tl.set([tx["lp-q"], tx["lp-s"]], { opacity: 0 }, 0);
  tl.fromTo(tx["lp-q"], { opacity: 0, y: 24, filter: "blur(10px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "power3.out", immediateRender: false }, c.ini + 0.05);
  tl.fromTo(tx["lp-s"], { opacity: 0, y: 16, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power3.out", immediateRender: false }, tSub);
  const CAM = cameraProf([[c.ini, { x: 540, y: 960, zoom: 1.0 }], [c.fim + 0.5, { x: 540, y: 955, zoom: 1.07 }]]);
  const IX = 520, IY = 800, SX = 990, SY = 1075, LX = 990, LY = 1100, CX2 = 990, CY2 = 1250;
  TP.quadro((x, t) => {
    const cam = CAM(t);
    let i = desenharFundo(nv, FD, t, cam, LUZ.luz, 0.8, 0);
    brilhoP(x, IX, IY, 620, LUZS.ambar, 0.12 + 0.12 * PT.ss((t - tU) / 0.8));
    // luzes espalhadas pela tela se juntam nas mãos que oram, na palavra de fé
    const u = PT.ss((t - tU + 0.5) / 1.1), esc = 360 * FIS.respira(t, 0, 0.02);
    const para = { cx: IX, cy: IY, esc, cor: LUZ.ouro, borda: LUZ.luz, brilho: 1.1, giro: 0.1 * Math.sin(t * 0.7) };
    i = morfo(nv, PO2, F2, u, { de: { cx: IX, cy: IY, esc: 1500, cor: LUZ.luz, brilho: 1.2, giro: t * 0.05 }, para, t, onda: 0.35, curva: 0.6, i0: i });
    if (u >= 1) for (let k = 0; k < 2; k++) { const v = ((t - tU) * 0.5 + k / 2) % 1; anelP(x, IX, IY, 200 + v * 300, LUZS.ouro, 0.25 * (1 - v), 3); }
    const aC = PT.ss((t - tC) / 0.35), b = Math.sin(t * 7) * 12;
    // curtir: um coração de luz sai das mãos e voa em arco até o botão de curtir, onde pulsa
    if (tL != null && t > tL - 0.3) { const voo = PT.inOut((t - tL + 0.3) / 0.9), [vx, vy] = FIS.arco(IX, IY - 40, LX, LY, voo, 160), ec = PT.lerp(150, 80, voo) * (voo >= 1 ? 1 + 0.15 * Math.max(0, Math.sin((t - tL) * 7)) : 1);
      brilhoP(x, vx, vy, ec * 1.6, "255,120,140", 0.35); i = desenharForma(nv, COR2, { cx: vx, cy: vy, esc: ec, cor: [1, 0.42, 0.52], borda: [1, 0.8, 0.85], brilho: 1.1, t, i0: i });
      if (voo > 0 && voo < 1) for (let k = 1; k <= 20; k++) { const [qx, qy] = FIS.arco(IX, IY - 40, LX, LY, Math.max(0, voo - k * 0.02), 160); discoP(x, qx, qy, 6 * (1 - k / 21), "255,170,180", 0.5 * (1 - k / 21)); }
      if (voo >= 1) { const aL = PT.ss((t - tL - 0.6) / 0.3) * (1 - aC * 0.6); fSeta(x, 780 + b, LY, 920 + b, LY, LUZS.ouro, aL, 9); rotuloP(x, "curte", 840, LY - 60, 44, "255,236,200", aL);
        for (let k = 0; k < 2; k++) { const v = ((t - tL) * 0.9 + k / 2) % 1; anelP(x, LX, LY, 50 + v * 90, "255,140,160", 0.45 * (1 - v), 3); } } }
    // (formato antigo) botão SEGUIR + seta para o perfil
    if (tS != null) { const aS = PT.ss((t - tS) / 0.35);
      if (aS > 0.01) { const pul = 1 + 0.08 * Math.max(0, Math.sin((t - tS) * 7)), w = 300 * pul, h = 92 * pul, bx = 700, by = SY;
        x.save(); x.globalAlpha = aS; x.fillStyle = `rgba(${LUZS.ouro},0.95)`; x.shadowColor = `rgba(${LUZS.ouro},0.8)`; x.shadowBlur = 30;
        x.beginPath(); x.roundRect(bx - w / 2, by - h / 2, w, h, h / 2); x.fill(); x.restore();
        rotuloP(x, "+ SEGUIR", bx, by + 2, 48, "30,20,10", aS); fSeta(x, 870 + b, SY, 950 + b, SY, LUZS.ouro, aS * (1 - aC), 9);
        for (let k = 0; k < 2; k++) { const v = ((t - tS) * 0.9 + k / 2) % 1; anelP(x, SX, SY, 50 + v * 90, LUZS.ouro, 0.5 * (1 - v) * aS * (1 - aC * 0.7), 3); } } }
    if (aC > 0.01) { fSeta(x, 760 + b, CY2, 930 + b, CY2, LUZS.ouro, aC, 10); rotuloP(x, "amém", 840, CY2 - 62, 46, "255,236,200", aC);
      for (let k = 0; k < 3; k++) { const v = ((t - tC) * 0.8 + k / 3) % 1; anelP(x, CX2, CY2, 50 + v * 110, LUZS.ouro, 0.5 * (1 - v) * aC, 3); } }
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

// ================= personagens em traço (ilustração em linha, roupa e acessórios, SEM rosto) =================
// Mesmo esqueleto e poses dos bonecos (POSES, poseMix). Desenhados na camada nítida (sem bloom) da telaGPU:
// cada parte tem preenchimento escuro e contorno de luz (2 espessuras: contorno e detalhe), então a parte da
// frente cobre as linhas de trás, como numa ilustração. Contornos em curva suave (Catmull-Rom), membros com
// anatomia (ombro, tríceps, panturrilha), mãos com polegar, pés com sandália, túnica com dobras que seguem as
// pernas, cinto com nó, manto, véu, elmo. Respira sozinho quando parado (o.vida = false desliga).
//   const p = personagem(x, t, pose, { tipo: "davi", x: 330, chao: 1500, H: 560, dir: 1, cam, z, a, cor });
//   tipos: davi, pessoa, homem (turbante), mulher (véu), jesus (túnica longa + manto), golias, crianca
//   p.maos[0|1], p.cabeca, p.escala, p.pr (projeta pontos do esqueleto)
const _PERS = {
  davi: { cor: [1, 0.86, 0.55], larg: 0.95, tunica: -0.16, cabelo: "cachos", bolsa: true, manga: 0.32 },
  pessoa: { cor: [0.86, 0.9, 1], larg: 1, tunica: -0.3, cabelo: "curto", manga: 0.4 },
  homem: { cor: [0.95, 0.85, 0.7], larg: 1.05, tunica: -0.33, cabelo: "turbante", manga: 0.45, faixa: true },
  mulher: { cor: [0.92, 0.88, 1], larg: 0.95, tunica: -0.43, cabelo: "veu", manga: 0.8 },
  jesus: { cor: [1, 0.94, 0.8], larg: 1.02, tunica: -0.43, cabelo: "longo", manto: true, manga: 0.85 },
  golias: { cor: [1, 0.55, 0.5], larg: 1.32, tunica: -0.22, cabelo: "elmo", armadura: true, manga: 0.25 },
  crianca: { cor: [1, 0.9, 0.7], larg: 1.1, tunica: -0.2, cabelo: "curto", manga: 0.35, cabecaGrande: 1.25 },
};
// Catmull-Rom → Bézier (pontos já na tela)
function _curva(y, pts, fechado) {
  const n = pts.length; if (n < 2) return;
  y.moveTo(pts[0][0], pts[0][1]);
  const g = (k) => pts[fechado ? (k + n) % n : Math.max(0, Math.min(n - 1, k))];
  for (let k = 0; k < (fechado ? n : n - 1); k++) { const p0 = g(k - 1), p1 = g(k), p2 = g(k + 1), p3 = g(k + 2);
    y.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]); }
  if (fechado) y.closePath();
}
function personagem(x, t, pose0, o = {}) {
  const P = _PERS[o.tipo || "pessoa"], H = o.H || 560, d = o.dir ?? 1, a = o.a ?? 1, L = P.larg, fase = o.fase ?? 0;
  // vida: respiração e leve balanço quando parado
  const pose = o.vida === false ? pose0 : { ...pose0, tronco: pose0.tronco + 0.012 * Math.sin(t * 1.7 + fase), cabeca: pose0.cabeca + 0.02 * Math.sin(t * 1.1 + fase * 2) };
  const cor = o.cor || P.cor, rgb = cor.map((q) => Math.round(q * 255)).join(","), rgbD = cor.map((q) => Math.round(q * 255 * 0.78)).join(",");
  const fundo = o.preench || "9,12,29", hk = P.cabecaGrande || 1;
  const Lt = 0.28 * H, Ln = 0.04 * H, Rh = 0.066 * H * hk, La = 0.165 * H, Lf = 0.15 * H, Lc = 0.235 * H, Ls = 0.225 * H;
  const v = (ang, l) => [Math.sin(ang) * d * l, Math.cos(ang) * l], up = (ang, l) => [Math.sin(ang) * d * l, -Math.cos(ang) * l], ad = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k];
  const C = up(pose.tronco, Lt), N = ad(C, up(pose.tronco + pose.cabeca * 0.4, Ln)), Hd = ad(N, up(pose.tronco + pose.cabeca, Rh * 0.95)), S = ad(C, up(pose.tronco, -0.035 * H));
  const bracos = pose.braco.map(([om, co]) => { const E = ad(S, v(pose.tronco + om, La)); return [S, E, ad(E, v(pose.tronco + om + co, Lf)), pose.tronco + om + co]; });
  const pernas = pose.perna.map(([qu, jo]) => { const K = v(qu, Lc); return [[0, 0], K, ad(K, v(qu + jo, Ls)), qu + jo, qu]; });
  let baixo = 0; for (const [, K, F] of pernas) baixo = Math.max(baixo, K[1] + 0.03 * H, F[1] + 0.03 * H); baixo = Math.max(baixo, C[1], Hd[1] + Rh);
  const ox = o.x ?? 540, oy = (o.chao ?? 1500) - baixo;
  // o.rot: gira o corpo inteiro em volta dos pés (ex.: cair); positivo = horário na tela
  const rx0 = (pernas[0][2][0] + pernas[1][2][0]) / 2, cR = Math.cos(o.rot || 0), sR = Math.sin(o.rot || 0);
  const gira = (p) => (o.rot ? [rx0 + (p[0] - rx0) * cR - (p[1] - baixo) * sR, baixo + (p[0] - rx0) * sR + (p[1] - baixo) * cR] : p);
  const pr = (p0) => { const p = gira(p0); return o.cam ? projP(o.cam, ox + p[0], oy + p[1], o.z ?? 1) : [ox + p[0], oy + p[1], 1]; };
  const kk = o.cam ? o.cam.zoom / (o.z ?? 1) : 1;
  const info = () => ({ maos: bracos.map((b) => pr(b[2])), cotovelos: bracos.map((b) => pr(b[1])), ombro: pr(S), quadril: pr([0, 0]), cabeca: pr(Hd), escala: kk, pr, H, oy, ox, d });
  if (o.medir) return info();
  const y = x._texto || x; if (x._texto) y._usado = true;
  y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.lineJoin = "round"; y.lineCap = "round"; y.globalAlpha = a;
  const LW = Math.max(1.5, 0.0062 * H * kk);
  const desenha = (pts, o2 = {}) => {
    const sp = pts.map(pr); y.beginPath(); _curva(y, sp, !o2.aberto);
    if (!o2.aberto) { y.fillStyle = `rgba(${o2.fundo || fundo},${o2.fa ?? 0.94})`; y.fill(); }
    const c2 = o2.det ? rgbD : o2.rgb || rgb; y.strokeStyle = `rgba(${c2},${o2.al ?? 1})`; y.lineWidth = LW * (o2.lw || (o2.det ? 0.55 : 1));
    y.shadowColor = `rgba(${c2},0.65)`; y.shadowBlur = (o2.det ? 5 : 9) * kk; y.stroke(); y.shadowBlur = 0; y.stroke();
  };
  const det = (pts, o2 = {}) => desenha(pts, { ...o2, aberto: true, det: true });
  const nrm = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [[dx / l, dy / l], [dy / l * d, -dx / l * d]]; };
  // membro com anatomia: cadeia p0-p1-p2, perfis de meia largura na frente (wf) e atrás (wb) em função de s (0–1)
  const membro = (p0, p1, p2, wf, wb, o2 = {}) => {
    const [dA, nA] = nrm(p0, p1), [dB, nB] = nrm(p1, p2), nJ = [(nA[0] + nB[0]) / 2, (nA[1] + nB[1]) / 2], fr = [], tr = [];
    for (const s of [0, 0.12, 0.3, 0.42, 0.5, 0.58, 0.72, 0.88, 1]) {
      const q = s <= 0.5 ? ad(p0, [p1[0] - p0[0], p1[1] - p0[1]], s * 2) : ad(p1, [p2[0] - p1[0], p2[1] - p1[1]], (s - 0.5) * 2), n = s === 0.5 ? nJ : s < 0.5 ? nA : nB;
      fr.push(ad(q, n, wf(s) * H * L)); tr.push(ad(q, n, -wb(s) * H * L));
    }
    const fim = ad(p2, dB, 0.012 * H * L), ini = ad(p0, dA, -0.02 * H * L);
    desenha([ini, ...fr, fim, ...tr.reverse()], o2);
  };
  const lerpW = (pts) => (s) => { for (let k = 1; k < pts.length; k++) if (s <= pts[k][0]) { const [s0, w0] = pts[k - 1], [s1, w1] = pts[k]; return w0 + (w1 - w0) * (s - s0) / (s1 - s0); } return pts[pts.length - 1][1]; };
  const BR_F = lerpW([[0, 0.03], [0.3, 0.026], [0.5, 0.021], [0.62, 0.024], [1, 0.015]]), BR_T = lerpW([[0, 0.034], [0.18, 0.033], [0.5, 0.022], [0.6, 0.022], [1, 0.015]]);
  const PE_F = lerpW([[0, 0.046], [0.15, 0.044], [0.5, 0.03], [0.62, 0.027], [1, 0.017]]), PE_T = lerpW([[0, 0.05], [0.1, 0.05], [0.5, 0.032], [0.66, 0.04], [1, 0.017]]);
  const mao = (b, al = 1) => { const [, E, W] = b, [u, n] = nrm(E, W), h2 = 0.0105 * H * L, m = (aa, bb) => ad(ad(W, u, aa * H * L), n, bb * H * L);
    desenha([m(-0.004, -0.016), m(0.03, -0.021), m(0.07, -0.014), m(0.088, -0.002), m(0.08, 0.013), m(0.05, 0.017), m(0.045, 0.034), m(0.03, 0.033), m(0.012, 0.019), m(-0.004, 0.016)], { al }); void h2; };
  const pe = (pp, al = 1) => { const [, K, F] = pp, [s] = nrm(K, F), f = [s[1] * d, -s[0] * d], m = (aa, bb) => ad(ad(F, f, aa * H), s, bb * H);
    desenha([m(-0.028, 0.0), m(-0.03, 0.022), m(0.02, 0.03), m(0.1, 0.03), m(0.112, 0.018), m(0.09, 0.005), m(0.045, -0.006), m(0.012, -0.02)], { al });
    if (o.tipo !== "golias") { det([m(0.035, -0.004), m(0.045, 0.028)], { al }); det([m(-0.02, -0.012), m(0.012, -0.016)], { al }); if (o.tipo === "davi") det([m(-0.01, -0.03), m(0.01, -0.07)], { al }); } };
  const manga = (b, al = 1) => { if (!P.manga) return; const [Sb, E, W] = b, ate = P.manga, [dA, nA] = nrm(Sb, E), fim = ate <= 0.5 ? ad(Sb, [E[0] - Sb[0], E[1] - Sb[1]], ate * 2) : ad(E, [W[0] - E[0], W[1] - E[1]], (ate - 0.5) * 2), [, nF] = ate <= 0.5 ? [dA, nA] : nrm(E, W);
    const larga = P.manto || P.cabelo === "veu" ? 1.45 : 1.3, wE = 0.028 * H * L * larga;
    desenha([ad(Sb, nA, 0.038 * H * L), ad(ad(Sb, dA, 0.06 * H), nA, 0.036 * H * L), ad(fim, nF, wE), ad(fim, nF, -wE * 0.9), ad(ad(Sb, dA, 0.06 * H), nA, -0.036 * H * L), ad(Sb, dA, -0.03 * H)], { al });
    det([ad(ad(Sb, dA, 0.08 * H), nA, 0.02 * H), ad(fim, nF, wE * 0.3)], { al: 0.7 * al }); };
  const braco = (b, atras) => { const al = atras ? 0.72 : 1; membro(b[0], b[1], b[2], BR_F, BR_T, { al }); manga(b, al); mao(b, al); };
  const perna = (pp, atras) => { const al = atras ? 0.72 : 1; membro(pp[0], pp[1], pp[2], PE_F, PE_T, { al });
    if (P.armadura) { const [, K, F] = pp, [s, n] = nrm(K, F), g = (u2, w) => [ad(ad(K, s, u2 * Ls), n, w * H * L), ad(ad(K, s, u2 * Ls), n, -w * H * L * 1.1)];
      const [a0, b0] = g(0.12, 0.034), [a1, b1] = g(0.55, 0.036), [a2, b2] = g(0.92, 0.024); desenha([a0, a1, a2, b2, b1, b0], { al }); det([ad(a0, n, -0.004 * H), ad(b0, n, 0.004 * H)], { al }); }
    pe(pp, al); };
  // sombra no chão
  { const fx = (pernas[0][2][0] + pernas[1][2][0]) / 2, [sx, sy, sk] = pr([fx, baixo]); y.save(); y.translate(sx, sy); y.scale(1, 0.16); const gr = y.createRadialGradient(0, 0, 0, 0, 0, 0.2 * H * sk); gr.addColorStop(0, `rgba(0,0,0,${0.45 * a})`); gr.addColorStop(1, "rgba(0,0,0,0)"); y.fillStyle = gr; y.beginPath(); y.arc(0, 0, 0.2 * H * sk, 0, 6.283); y.fill(); y.restore(); }
  // referencial do tronco: T(a, b) = a ao longo do tronco (H), b para a frente (H)
  const u = [C[0] / Lt, C[1] / Lt], f = [-u[1] * d, u[0] * d], T = (aa, bb) => [u[0] * aa * H + f[0] * bb * H * L, u[1] * aa * H + f[1] * bb * H * L];
  // ---- ordem: braço e perna de trás, perna da frente, roupa, manto, cabeça, braço da frente ----
  braco(bracos[0], true);
  // o.atras(ctx, info): objetos seguros pela mão de trás (escudo, cajado), atrás do corpo
  if (o.atras) { y.save(); o.atras(y, info()); y.restore(); y.globalAlpha = a; }
  perna(pernas[0], true); perna(pernas[1], false);
  // túnica: a barra acompanha a coxa que vai para a frente (ou para trás) e balança um pouco
  const h = P.tunica, bal = 0.006 * Math.sin(t * 2.3 + fase);
  const coxa = (pp, k) => { const [, K] = pp, l = Math.min(1, Math.abs(h) * H / Lc * 0.95); return ad([K[0] * l, K[1] * l], nrm([0, 0], K)[1], k * 0.05 * H * L); };
  const qF = Math.max(pernas[0][4], pernas[1][4]), qB = Math.min(pernas[0][4], pernas[1][4]), ppF = pernas[0][4] > pernas[1][4] ? pernas[0] : pernas[1], ppB = ppF === pernas[0] ? pernas[1] : pernas[0];
  const flare = P.manto || P.cabelo === "veu" ? 0.035 : 0.012, hF0 = T(h, 0.085 + flare + bal), hB0 = T(h - 0.005, -0.08 - flare + bal);
  const mF = PT.ss((qF - 0.25) / 1.0), mB = PT.ss((-qB - 0.25) / 0.8), hF = [PT.lerp(hF0[0], coxa(ppF, 1)[0], mF * 0.85), PT.lerp(hF0[1], coxa(ppF, 1)[1], mF * 0.85)], hB = [PT.lerp(hB0[0], coxa(ppB, -1)[0], mB * 0.7), PT.lerp(hB0[1], coxa(ppB, -1)[1], mB * 0.7)];
  const meio = [(hF[0] + hB[0]) / 2 + u[0] * 0.01 * H, (hF[1] + hB[1]) / 2 + u[1] * 0.01 * H];
  desenha([T(0.3, -0.02), T(0.26, -0.062), T(0.16, -0.06), T(0.06, -0.05), T(-0.03, -0.064), hB, meio, hF, T(-0.04, 0.07), T(0.03, 0.062), T(0.08, 0.058), T(0.17, 0.072), T(0.24, 0.066), T(0.3, 0.026)]);
  // dobras (seguem para as barras), decote e cinto com nó
  det([T(0.05, 0.03), [PT.lerp(T(0.05, 0.03)[0], hF[0], 0.55) + u[0] * 0.01 * H, PT.lerp(T(0.05, 0.03)[1], hF[1], 0.55) + u[1] * 0.01 * H], [PT.lerp(meio[0], hF[0], 0.6), PT.lerp(meio[1], hF[1], 0.6)]]);
  det([T(0.04, -0.02), [PT.lerp(T(0.04, -0.02)[0], meio[0], 0.6), PT.lerp(T(0.04, -0.02)[1], meio[1], 0.6)], [PT.lerp(meio[0], hB[0], 0.35), PT.lerp(meio[1], hB[1], 0.35)]]);
  det([T(0.3, 0.026), T(0.255, 0.035), T(0.27, 0.01)]);
  if (!P.armadura) { det([T(0.068, -0.052), T(0.07, 0.0), T(0.066, 0.06)], { lw: 0.9 }); det([T(0.048, -0.054), T(0.05, 0.0), T(0.046, 0.064)], { lw: 0.9 });
    const no = T(0.058, 0.062), cai = 0.02 * Math.sin(t * 2 + fase); det([no, T(0.0, 0.075 + cai), T(-0.05, 0.07 + cai * 1.5)], { lw: 0.8 }); det([no, T(0.01, 0.06 + cai), T(-0.035, 0.055 + cai)], { lw: 0.8 }); }
  if (P.bolsa) { desenha([T(0.035, 0.075), T(0.04, 0.125), T(-0.05, 0.13), T(-0.065, 0.1), T(-0.055, 0.075)]); det([T(-0.005, 0.078), T(0.0, 0.122)]); det([T(0.045, 0.1), T(0.29, -0.045)], { lw: 0.9 }); }
  if (P.armadura) { for (let r = 0; r < 6; r++) for (let c2 = 0; c2 < 4; c2++) { const aa = 0.25 - r * 0.036, bb = -0.048 + c2 * 0.032 + (r % 2) * 0.016; det([T(aa, bb - 0.015), T(aa - 0.018, bb), T(aa, bb + 0.015)]); }
    desenha([T(0.07, -0.058), T(0.075, 0.07), T(0.045, 0.072), T(0.04, -0.06)]); for (let k = 0; k < 6; k++) { const bb = -0.06 + k * 0.027; det([T(0.04, bb), [PT.lerp(T(0.04, bb)[0], PT.lerp(hB[0], hF[0], k / 5), 1), PT.lerp(T(0.04, bb)[1], PT.lerp(hB[1], hF[1], k / 5), 1)]]); } }
  if (P.faixa) det([T(0.08, -0.05), T(0.03, 0.0), T(-0.02, 0.06)], { lw: 0.8 });
  // manto (himátion) de Jesus: cai do ombro de trás, cruza o peito e desce pela frente
  if (P.manto) { const M = "255,214,140";
    desenha([T(0.27, -0.072), T(0.305, -0.01), T(0.29, 0.05), T(0.2, 0.082), T(0.06, 0.09), T(-0.08, 0.098 + bal), T(-0.24, 0.1 + bal), T(-0.3, 0.085 + bal), T(-0.29, 0.035), T(-0.14, 0.035), T(-0.02, 0.03), T(0.1, 0.01), T(0.2, -0.04)], { rgb: M });
    det([T(0.26, 0.03), T(0.14, 0.06), T(0.0, 0.07)], { rgb: M }); det([T(-0.04, 0.06), T(-0.18, 0.075), T(-0.27, 0.07)], { rgb: M }); }
  // pescoço e cabeça (só o contorno: sem olhos, nariz nem boca)
  { const [du, dn] = nrm(C, N); desenha([ad(C, dn, 0.026 * H), ad(ad(C, du, Ln * 1.4), dn, 0.02 * H), ad(ad(C, du, Ln * 1.4), dn, -0.022 * H), ad(C, dn, -0.03 * H)]); }
  const ang = pose.tronco + pose.cabeca, HU = up(ang, 1), HF = [-HU[1] * d, HU[0] * d], Hp = (aa, bb, r) => [Hd[0] + HU[0] * aa * r + HF[0] * bb * r, Hd[1] + HU[1] * aa * r + HF[1] * bb * r];
  const cab = Array.from({ length: 14 }, (_, k) => { const th = (k / 14) * 6.283, rr = 1 + 0.06 * Math.cos(th - 0.6) - 0.08 * Math.max(0, -Math.cos(th)); return Hp(Math.cos(th) * rr, Math.sin(th) * 0.84 * rr, Rh); });
  if (P.cabelo === "veu" || P.cabelo === "longo") { const veu = P.cabelo === "veu"; desenha([Hp(0.2, -1.12, Rh), Hp(-0.6, -1.15, Rh), ad(T(0.27, -0.075), [0, 0], 0), T(veu ? 0.12 : 0.22, -0.085), T(veu ? 0.1 : 0.2, -0.05), Hp(-0.9, -0.2, Rh), Hp(0.4, -0.95, Rh)], { rgb: veu ? "220,215,255" : rgb }); }
  desenha(cab);
  const calota = (de, ate, rFora, cacho, n = 20) => { const pts = []; for (let k = 0; k <= n; k++) { const th = de + (ate - de) * k / n; pts.push(Hp(Math.cos(th), Math.sin(th), Rh * (rFora + cacho * Math.abs(Math.sin(th * 6))))); } for (let k = n; k >= 0; k--) { const th = de + (ate - de) * k / n; pts.push(Hp(Math.cos(th), Math.sin(th), Rh * 0.92)); } return pts; };
  if (P.cabelo === "cachos") { desenha(calota(-2.6, 1.1, 1.16, 0.09)); for (const th of [-1.6, -0.6, 0.4]) det([Hp(Math.cos(th), Math.sin(th), Rh * 0.98), Hp(Math.cos(th + 0.25), Math.sin(th + 0.25), Rh * 1.08)]); }
  if (P.cabelo === "curto") { desenha(calota(-2.3, 1.15, 1.08, 0.015)); det([Hp(0.55, 0.85, Rh), Hp(0.85, 0.35, Rh * 1.04)]); }
  if (P.cabelo === "longo") { desenha(calota(-2.7, 1.2, 1.09, 0.02)); det([Hp(0.9, 0.3, Rh), Hp(0.6, -0.5, Rh * 1.05), Hp(-0.3, -1.0, Rh * 1.05)]); }
  if (P.cabelo === "turbante") { desenha(calota(-2.4, 1.3, 1.3, 0.03)); for (const r2 of [1.0, 1.1]) det([Hp(Math.cos(1.1), Math.sin(1.1), Rh * r2), Hp(1.1, 0, Rh * r2 * 0.95), Hp(Math.cos(-2.1), Math.sin(-2.1), Rh * r2)]); }
  if (P.cabelo === "veu") { desenha(calota(-2.5, 1.3, 1.14, 0.0), { rgb: "220,215,255" }); det([Hp(1.0, 0.6, Rh * 1.1), Hp(0.2, 1.0, Rh * 1.12)], { rgb: "220,215,255" }); }
  if (P.cabelo === "elmo") {
    desenha([...calota(-2.0, 1.25, 1.1, 0.0).slice(0, 21), Hp(Math.cos(1.25), Math.sin(1.25), Rh * 0.92), Hp(Math.cos(-2.0), Math.sin(-2.0), Rh * 0.92)]);
    det([Hp(Math.cos(1.3), Math.sin(1.3), Rh * 1.14), Hp(Math.cos(-2.05), Math.sin(-2.05), Rh * 1.14)], { lw: 1.1 });
    desenha([Hp(0.15, -0.95, Rh), Hp(-0.55, -0.8, Rh), Hp(-0.75, -0.3, Rh), Hp(-0.35, -0.15, Rh), Hp(0.1, -0.4, Rh)]);
    const pena = []; for (let k = 0; k <= 14; k++) { const u2 = k / 14, th = 0.35 - 2.4 * u2, rr = 1.12 + 0.75 * Math.pow(Math.sin(Math.PI * u2), 0.8) + 0.03 * Math.sin(t * 6 + k); pena.push(Hp(Math.cos(th), Math.sin(th), Rh * rr)); }
    for (let k = 14; k >= 0; k--) { const u2 = k / 14, th = 0.35 - 2.4 * u2; pena.push(Hp(Math.cos(th), Math.sin(th), Rh * 1.12)); }
    desenha(pena); for (let k = 2; k < 13; k += 2) { const th = 0.35 - 2.4 * k / 14; det([Hp(Math.cos(th), Math.sin(th), Rh * 1.16), Hp(Math.cos(th - 0.06), Math.sin(th - 0.06), Rh * (1.12 + 0.7 * Math.pow(Math.sin(Math.PI * k / 14), 0.8)))]); } }
  braco(bracos[1], false);
  y.restore();
  return info();
}
// ---- objetos em line art seguros pelos personagens (mesmo traço e brilho do personagem) ----
// objetoLinha(x, tipo, { mao: [sx, sy], H, k (escala da tela), d (direção), cor, a, ang, giro, r })
//   tipos: lanca (ang: 0 = em pé), escudo, espada, cajado, funda (giro: null = pendurada; número = girando),
//   pao, peixe, cesto, pedra. Desenha na camada nítida (x._texto) por cima do que já foi desenhado.
function objetoLinha(x, tipo, o = {}) {
  const y = x._texto || x, H = o.H || 500, k = o.k ?? 1, d = o.d ?? 1, a = o.a ?? 1, U = H * k, [mx, my] = o.mao || [540, 960];
  if (a <= 0.005) return;
  const rgb = (o.cor || LUZ.luz).map((q) => Math.round(q * 255)).join(","), LW = Math.max(1.5, 0.0062 * U);
  const tr = (pts, fechado = true, o2 = {}) => { y.beginPath(); _curva(y, pts, fechado);
    if (fechado && o2.fill !== false) { y.fillStyle = `rgba(9,12,29,${0.94 * a})`; y.fill(); }
    y.strokeStyle = `rgba(${o2.rgb || rgb},${a * (o2.al ?? 1)})`; y.lineWidth = LW * (o2.lw || 1); y.shadowColor = `rgba(${o2.rgb || rgb},0.65)`; y.shadowBlur = 9 * k; y.stroke(); y.shadowBlur = 0; y.stroke(); };
  const circ = (cx, cy, rx, ry, n = 18, rot = 0) => Array.from({ length: n }, (_, j) => { const th = (j / n) * 6.283; return [cx + Math.cos(th) * rx * Math.cos(rot) - Math.sin(th) * ry * Math.sin(rot), cy + Math.cos(th) * rx * Math.sin(rot) + Math.sin(th) * ry * Math.cos(rot)]; });
  const ax = (ang) => [Math.sin(ang) * d, -Math.cos(ang)];   // direção (0 = para cima), espelhada por d
  y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.lineJoin = "round"; y.lineCap = "round";
  if (tipo === "lanca") { const [ux, uy] = ax(o.ang || 0), [nx, ny] = [-uy, ux], L = 0.95 * U, w = 0.008 * U, p = (s2, q) => [mx + ux * s2 * L + nx * q, my + uy * s2 * L + ny * q];
    tr([p(-0.32, w), p(0.66, w), p(0.66, -w), p(-0.32, -w)]);
    tr([p(0.66, 0), p(0.7, 2.4 * w), p(0.78, 1.6 * w), p(0.84, 0), p(0.78, -1.6 * w), p(0.7, -2.4 * w)]); tr([p(0.71, 0), p(0.82, 0)], false, { lw: 0.5, al: 0.7 }); }
  if (tipo === "espada") { const [ux, uy] = ax(o.ang ?? 2.6), [nx, ny] = [-uy, ux], L = 0.36 * U, w = 0.012 * U, p = (s2, q) => [mx + ux * s2 * L + nx * q, my + uy * s2 * L + ny * q];
    tr([p(0.12, w), p(0.92, w * 0.8), p(1, 0), p(0.92, -w * 0.8), p(0.12, -w)]); tr([p(0.1, 2.6 * w), p(0.13, 2.6 * w), p(0.13, -2.6 * w), p(0.1, -2.6 * w)]); tr([p(-0.08, w * 0.7), p(0.1, w * 0.7), p(0.1, -w * 0.7), p(-0.08, -w * 0.7)]); }
  if (tipo === "escudo") { const r = (o.r || 0.17) * U; tr(circ(mx, my, r, r, 22)); tr(circ(mx, my, r * 0.8, r * 0.8, 20), true, { fill: false, lw: 0.55, al: 0.7 }); tr(circ(mx, my, r * 0.16, r * 0.16, 10)); }
  if (tipo === "cajado") { const w = 0.008 * U, bx = mx + d * 0.01 * U, top = my - 0.62 * U, bot = my + 0.44 * U;
    const pts = [[bx, bot], [bx, my], [bx - d * 0.004 * U, top + 0.08 * U], [bx + d * 0.02 * U, top - 0.03 * U], [bx + d * 0.075 * U, top - 0.045 * U], [bx + d * 0.11 * U, top - 0.01 * U], [bx + d * 0.1 * U, top + 0.035 * U]];
    tr(pts, false, { lw: 2.2 }); tr(pts, false, { lw: 1.1, rgb: "9,12,29", al: 1 }); void w; }
  if (tipo === "funda") { const g = o.giro, R = 0.16 * U, [px, py] = g == null ? [mx + d * 0.01 * U, my + R] : [mx + Math.cos(g) * R, my - 0.03 * U + Math.sin(g) * R * 0.45];
    const dx = px - mx, dy = py - my, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l, cw = 0.012 * U;
    tr([[mx, my], [mx + dx * 0.5 + nx * cw, my + dy * 0.5 + ny * cw], [px + nx * cw, py + ny * cw]], false, { lw: 0.6 }); tr([[mx, my], [mx + dx * 0.5 - nx * cw, my + dy * 0.5 - ny * cw], [px - nx * cw, py - ny * cw]], false, { lw: 0.6 });
    tr(circ(px, py, 0.026 * U, 0.017 * U, 12, Math.atan2(dy, dx) + Math.PI / 2)); if (o.pedra !== false) tr(circ(px, py, 0.01 * U, 0.008 * U, 8), true, { rgb: "255,236,200" }); }
  if (tipo === "pedra") { const r = (o.r || 0.02) * U; tr(circ(mx, my, r, r * 0.75, 12, 0.3)); }
  if (tipo === "pao") { const r = (o.r || 0.07) * U; tr(circ(mx, my - r * 0.3, r, r * 0.6, 18)); for (const q of [-0.4, 0, 0.4]) tr([[mx + q * r - 0.12 * r, my - r * 0.62], [mx + q * r + 0.12 * r, my - r * 0.2]], false, { lw: 0.55, al: 0.8 }); }
  if (tipo === "peixe") { const r = (o.r || 0.08) * U, q = (u2, v) => [mx + d * u2 * r, my + v * r];
    tr([q(-1, 0), q(-0.6, -0.42), q(0.1, -0.5), q(0.62, -0.18), q(0.78, -0.46), q(0.86, 0), q(0.78, 0.46), q(0.62, 0.18), q(0.1, 0.5), q(-0.6, 0.42)]); tr([q(-0.35, -0.32), q(-0.28, 0), q(-0.35, 0.32)], false, { lw: 0.55, al: 0.7 }); }
  if (tipo === "cesto") { const r = (o.r || 0.16) * U; tr([[mx - r, my - 0.35 * r], [mx - 0.82 * r, my + 0.45 * r], [mx - 0.5 * r, my + 0.62 * r], [mx + 0.5 * r, my + 0.62 * r], [mx + 0.82 * r, my + 0.45 * r], [mx + r, my - 0.35 * r]]);
    tr(circ(mx, my - 0.35 * r, r, 0.22 * r, 20), true, { fill: false }); for (const v of [0.05, 0.3]) tr([[mx - 0.93 * r, my + v * r], [mx, my + (v + 0.12) * r], [mx + 0.93 * r, my + v * r]], false, { lw: 0.55, al: 0.7 }); }
  y.restore();
}
// poses extras para os personagens
POSES.andar = (fase, passo = 1) => {
  const s = Math.sin(fase), c2 = Math.cos(fase), dob = (q) => -(0.08 + 1.0 * Math.max(0, q)) * passo;
  return { tronco: 0.05 * passo, cabeca: -0.02, braco: [[-0.4 * s * passo - 0.05, 0.3 + 0.25 * Math.max(0, s)], [0.4 * s * passo - 0.05, 0.3 + 0.25 * Math.max(0, -s)]],
    perna: [[0.38 * s * passo, dob(c2)], [-0.38 * s * passo, dob(-c2)]] };
};
POSES.encolhido = { tronco: 0.55, cabeca: 0.65, braco: [[0.95, 1.55], [1.05, 1.6]], perna: [[1.75, -2.25], [1.65, -2.15]] };
POSES.olhando_cima = { tronco: -0.08, cabeca: -0.45, braco: [[-0.15, 0.3], [0.2, 0.35]], perna: [[-0.08, 0], [0.08, 0]] };
POSES.sentado = { tronco: 0.08, cabeca: 0.1, braco: [[0.5, 0.9], [0.55, 0.85]], perna: [[1.45, -1.4], [1.35, -1.35]] };
POSES.segurando = { tronco: 0.04, cabeca: 0.15, braco: [[0.75, 0.9], [0.85, 0.8]], perna: [[-0.05, 0], [0.06, 0]] };
POSES.entregando = { tronco: 0.12, cabeca: 0.2, braco: [[0.9, 0.3], [1.15, 0.2]], perna: [[-0.12, 0], [0.18, -0.05]] };
POSES.abracando = { tronco: 0.1, cabeca: 0.25, braco: [[1.1, 1.2], [1.25, 1.3]], perna: [[-0.05, 0], [0.1, -0.05]] };
// qualquer vídeo do canal usa a cena de apoio só pondo no roteiro {"tipo": "apoio", ...} (opções em "apoio": {texto, sub, forma})
if (typeof CENAS !== "undefined" && !CENAS.apoio) CENAS.apoio = (el, c, B) => cenaApoio(el, c, B, c.apoio || {});
