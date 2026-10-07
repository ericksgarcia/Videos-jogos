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

// volume (estilo Kurzgesagt): sombra interna embaixo/direita + luz de contorno em cima/esquerda
$("#defs").insertAdjacentHTML("beforeend", `
  <filter id="volume" x="-10%" y="-10%" width="120%" height="120%">
    <feComponentTransfer in="SourceAlpha" result="inv"><feFuncA type="table" tableValues="1 0"/></feComponentTransfer>
    <feOffset in="inv" dx="-10" dy="-12" result="o1"/><feGaussianBlur in="o1" stdDeviation="9" result="b1"/>
    <feComposite in="b1" in2="SourceAlpha" operator="in" result="sombra"/>
    <feFlood flood-color="#0a0f30" flood-opacity="0.45"/><feComposite in2="sombra" operator="in" result="sombraC"/>
    <feOffset in="inv" dx="5" dy="6" result="o2"/><feGaussianBlur in="o2" stdDeviation="3" result="b2"/>
    <feComposite in="b2" in2="SourceAlpha" operator="in" result="luz"/>
    <feFlood flood-color="#ffffff" flood-opacity="0.35"/><feComposite in2="luz" operator="in" result="luzC"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sombraC"/><feMergeNode in="luzC"/></feMerge>
  </filter>`);
const volume = (el) => { (Array.isArray(el) ? el : [el]).forEach((e) => e && e.setAttribute("filter", "url(#volume)")); };

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

// (a granulação de filme é aplicada no fim, pelo ffmpeg: ver codificar() em gerar.py)

// água ondulando: distorce o elemento com um ruído que anda devagar (reflexos, brilho do sol na água,
// reflexo de navio/prédio). forca = amplitude da distorção em px. Um único ruído para a cena toda.
$("#defs").insertAdjacentHTML("beforeend", `
  <filter id="ondulaAgua" x="-10%" y="-20%" width="120%" height="140%">
    <feTurbulence id="ondTurb" type="fractalNoise" baseFrequency="0.006 0.07" numOctaves="2" seed="4" result="ruido"/>
    <feOffset id="ondOff" in="ruido" dx="0" dy="0" result="ruidoM"/>
    <feDisplacementMap in="SourceGraphic" in2="ruidoM" scale="16" xChannelSelector="R" yChannelSelector="G"/>
  </filter>`);
let _ondulando = false;
const ondular = (el) => {
  (Array.isArray(el) ? el : [el]).forEach((e) => e && e.setAttribute("filter", "url(#ondulaAgua)"));
  if (_ondulando) return;
  _ondulando = true;
  const turb = $("#ondTurb"), off = $("#ondOff");
  aCadaQuadro((t) => {
    turb.setAttribute("baseFrequency", `${(0.006 + 0.0012 * Math.sin(t * 0.7)).toFixed(5)} ${(0.07 + 0.008 * Math.sin(t * 1.1)).toFixed(5)}`);
    off.setAttribute("dx", (40 * Math.sin(t * 0.45)).toFixed(2));
    off.setAttribute("dy", (8 * Math.sin(t * 0.9)).toFixed(2));
  });
};

// cristas de onda em perspectiva (linhas finas que andam), de y0 (horizonte) até y1 (perto da câmera)
function ondas(pai, y0, y1, n, t, fim, cor, seed) {
  const r = prng(seed || 5);
  let s = "";
  for (let i = 0; i < n; i++) {
    const k = i / Math.max(1, n - 1), y = y0 + (y1 - y0) * Math.pow(k, 1.6), lam = 90 + 260 * k, amp = 2 + 9 * k;
    let d = `M${-lam * 2} ${y}`;
    for (let x = -lam * 2, j = 0; x < W + lam * 2; x += lam / 2, j++) d += ` q ${lam / 4} ${j % 2 ? amp : -amp} ${lam / 2} 0`;
    s += `<path class="crista" data-lam="${lam}" d="${d}" fill="none" stroke="${cor || "#fff"}" stroke-width="${(1.5 + 3 * k).toFixed(1)}" stroke-linecap="round" stroke-dasharray="${(40 + r() * 120).toFixed(0)} ${(60 + r() * 220).toFixed(0)}" opacity="${(0.1 + 0.25 * k).toFixed(2)}"/>`;
  }
  pai.insertAdjacentHTML("beforeend", s);
  $$(".crista", pai).forEach((p, i) => {
    const lam = +p.dataset.lam, v = 40 + (i % 3) * 15, dur = lam / v;
    tl.fromTo(p, { x: 0 }, { x: -lam, duration: dur, repeat: Math.max(1, Math.ceil((fim - t) / dur)), ease: "none", immediateRender: false }, t);
  });
}

// cintilância: pontinhos de luz em estrela piscando sobre a água (sol batendo nas ondas)
function cintilar(pai, n, area, t, fim, cor, seed) {
  const r = prng(seed || 9);
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * area[2], y = area[1] + r() * area[3], s = 0.5 + r() * 1.1 * ((y - area[1]) / area[3] + 0.4);
    pai.insertAdjacentHTML("beforeend", `<g transform="translate(${x.toFixed(0)} ${y.toFixed(0)}) scale(${s.toFixed(2)})"><path class="cint" d="M0 -14 L 3 -3 L 14 0 L 3 3 L 0 14 L -3 3 L -14 0 L -3 -3 Z" fill="${cor || "#fff6d0"}" opacity="0"/></g>`);
  }
  $$(".cint", pai).forEach((c, i) => {
    const d = 0.5 + r() * 0.7, ini = t + r() * 1.5;
    tl.fromTo(c, { scale: 0.2, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 0.9, duration: d, yoyo: true, repeat: Math.max(1, Math.floor((fim - ini) / d) | 1), repeatDelay: r() * 1.2, ease: "sine.inOut", immediateRender: false }, ini);
  });
  brilhar(pai);
}
