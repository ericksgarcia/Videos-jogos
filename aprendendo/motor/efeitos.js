// Efeitos de luz e pós-produção comuns a todos os vídeos:
// brilho (glow), raios de luz, bokeh, faíscas, desfoque de profundidade e granulação.

// ---------- filtros SVG ----------
$("#defs").insertAdjacentHTML("beforeend", `
  <filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="glowForte" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur in="SourceGraphic" stdDeviation="16" result="b"/><feGaussianBlur in="SourceGraphic" stdDeviation="5" result="c"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="c"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="dof1" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="2.5"/></filter>
  <filter id="dof2" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="dof3" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="12"/></filter>
  <linearGradient id="raioG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6d0" stop-opacity="0.55"/><stop offset="1" stop-color="#fff6d0" stop-opacity="0"/></linearGradient>
  <radialGradient id="flareG"><stop offset="0" stop-color="#fff" stop-opacity="0.9"/><stop offset="0.2" stop-color="#fff2b0" stop-opacity="0.35"/><stop offset="1" stop-color="#ffb52e" stop-opacity="0"/></radialGradient>`);

// brilho: aplica o filtro de glow num elemento (forte = halo maior)
const brilhar = (el, forte) => { (Array.isArray(el) ? el : [el]).forEach((e) => e && e.setAttribute("filter", `url(#${forte ? "glowForte" : "glow"})`)); };
// desfoque de profundidade: 1 = leve (meio), 2 = médio (fundo), 3 = forte (muito perto/longe)
const desfocar = (el, n) => { (Array.isArray(el) ? el : [el]).forEach((e) => e && e.setAttribute("filter", `url(#dof${n || 2})`)); };

// raios de luz (god rays) saindo de (x, y), apontando para `ang` graus (90 = para baixo)
const raiosLuz = (x, y, n, abertura, comp, ang, cls, seed) => {
  const r = prng(seed || 7);
  let s = "";
  for (let i = 0; i < n; i++) {
    const a = ((ang ?? 90) - abertura / 2 + (abertura * (i + 0.5)) / n + (r() - 0.5) * 6) * Math.PI / 180;
    const w = 0.03 + r() * 0.05, L = comp * (0.7 + r() * 0.5);
    const x1 = x + Math.cos(a - w) * L, y1 = y + Math.sin(a - w) * L, x2 = x + Math.cos(a + w) * L, y2 = y + Math.sin(a + w) * L;
    s += `<polygon class="raio" points="${x},${y} ${x1.toFixed(1)},${y1.toFixed(1)} ${x2.toFixed(1)},${y2.toFixed(1)}" fill="url(#raioG)" opacity="${(0.35 + r() * 0.5).toFixed(2)}" style="mix-blend-mode:screen"/>`;
  }
  return `<g class="${cls || "raios"}">${s}</g>`;
};
// raios "respirando" (cada um pulsa num ritmo) e girando devagar
function animarRaios(g, t, fim, giro) {
  $$(".raio", g).forEach((p, k) => tl.fromTo(p, { opacity: +p.getAttribute("opacity") }, { opacity: 0.08, duration: 1.1 + (k % 4) * 0.35, yoyo: true, repeat: Math.max(1, Math.floor((fim - t) / (1.1 + (k % 4) * 0.35))), ease: "sine.inOut", immediateRender: false }, t + (k % 5) * 0.2));
  if (giro) tl.fromTo(g, { rotation: -giro / 2 }, { rotation: giro / 2, duration: Math.max(0.5, fim - t), ease: "sine.inOut", svgOrigin: g.dataset.origem, immediateRender: false }, t);
}

// bokeh: discos de luz fora de foco flutuando (dá profundidade e "cara de câmera")
function bokeh(pai, n, seed, area, t, fim, cores) {
  const r = prng(seed);
  cores = cores || ["#ffd23f", "#8fe3ff", "#ff8a3d", "#ffffff"];
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * area[2], y = area[1] + r() * area[3], rad = 12 + r() * 44, c = cores[i % cores.length];
    pai.insertAdjacentHTML("beforeend", `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)})"><circle class="bk" r="${rad.toFixed(0)}" fill="${c}" fill-opacity="${(0.08 + r() * 0.12).toFixed(2)}" stroke="${c}" stroke-opacity="${(0.2 + r() * 0.25).toFixed(2)}" stroke-width="2"/></g>`);
  }
  $$(".bk", pai).forEach((b, i) => {
    tl.fromTo(b, { x: 0, y: 0 }, { x: (i % 2 ? 1 : -1) * (20 + (i % 5) * 12), y: -40 - (i % 4) * 25, duration: Math.max(0.5, fim - t), ease: "sine.inOut", immediateRender: false }, t);
    const d = 1.4 + (i % 3) * 0.5;
    tl.fromTo(b, { opacity: 1 }, { opacity: 0.35, duration: d, yoyo: true, repeat: Math.max(1, Math.floor((fim - t) / d)), ease: "sine.inOut", immediateRender: false }, t);
  });
}

// faíscas/brasas: partículas que sobem de (x, y) e somem, em ciclo
function faiscas(pai, x, y, n, t, fim, cor, alcance, seed) {
  const r = prng(seed || 3);
  for (let i = 0; i < n; i++) pai.insertAdjacentHTML("beforeend", `<circle class="fa" cx="${x}" cy="${y}" r="${(2 + r() * 3.5).toFixed(1)}" fill="${cor || "#ffd23f"}" opacity="0"/>`);
  $$(".fa", pai).slice(-n).forEach((f, i) => {
    const dur = 0.9 + r() * 0.9, dx = (r() - 0.5) * (alcance || 160), dy = -(alcance || 160) * (0.6 + r() * 0.8);
    tl.fromTo(f, { x: 0, y: 0, opacity: 1 }, { x: dx, y: dy, opacity: 0, duration: dur, repeat: Math.max(0, Math.floor((fim - t) / dur) - 1), ease: "power1.out", immediateRender: false }, t + r() * dur);
  });
  brilhar(pai);
}

// reflexo de lente (flare) num ponto de luz forte
const flare = (x, y, s, cls) => `<g class="${cls || "flare"}" style="mix-blend-mode:screen"><circle cx="${x}" cy="${y}" r="${180 * s}" fill="url(#flareG)"/>
  <rect x="${x - 420 * s}" y="${y - 3 * s}" width="${840 * s}" height="${6 * s}" rx="${3 * s}" fill="#fff6d0" opacity="0.5"/>
  ${[0.35, 0.6, 0.85].map((k, i) => `<circle cx="${x + (540 - x) * k * 1.6}" cy="${y + (960 - y) * k * 1.6}" r="${(22 + i * 18) * s}" fill="${["#8fe3ff", "#ffd23f", "#ff8a3d"][i]}" opacity="0.12"/>`).join("")}</g>`;

// ---------- granulação de filme: textura de ruído que muda a cada quadro ----------
(() => {
  const cv = document.createElement("canvas"), n = 256;
  cv.width = cv.height = n;
  const cx = cv.getContext("2d"), img = cx.createImageData(n, n), r = prng(99);
  for (let i = 0; i < n * n; i++) { const v = 128 + (r() - 0.5) * 255; img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v; img.data[i * 4 + 3] = 255; }
  cx.putImageData(img, 0, 0);
  const g = h("div", null, null, null);
  g.id = "grao";
  Object.assign(g.style, { position: "absolute", inset: "0", backgroundImage: `url(${cv.toDataURL()})`, backgroundSize: "256px 256px", opacity: "0.07", mixBlendMode: "overlay", pointerEvents: "none" });
  $("#root").insertBefore(g, $("#vinheta"));
  const r2 = prng(5), pos = Array.from({ length: 24 }, () => `${Math.floor(r2() * 256)}px ${Math.floor(r2() * 256)}px`);
  let ultimo = -1;
  aCadaQuadro((t) => { const q = Math.floor(t * 30) % 24; if (q !== ultimo) { g.style.backgroundPosition = pos[q]; ultimo = q; } });
})();
