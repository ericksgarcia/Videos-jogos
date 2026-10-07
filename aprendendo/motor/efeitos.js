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

// ================= técnicas das skills do HyperFrames (hyperframes-animation) =================
// Tudo é função pura do tempo (aCadaQuadro) ou tween na tl: determinístico e seguro para seek.
const _suave = (x) => x * x * (3 - 2 * x);

// câmera em fases (multi-phase-camera): `g` é o <g> que envolve o mundo da cena (sem atributo
// transform próprio). fases = [[t, escala, focoX, focoY], ...]: o ponto de foco vai para o centro
// (540, 900). Entre fases, curva suave; por cima, micro-deriva senoidal (a câmera nunca fica morta).
// Rótulos que não podem sair do quadro ficam FORA desse <g>.
function cameraFases(g, fases, fim, deriva) {
  const d = deriva ?? 1;
  aCadaQuadro((t) => {
    if (t < fases[0][0] - 1.5 || t > fim + 0.6) return;
    let i = 0;
    while (i < fases.length - 2 && t > fases[i + 1][0]) i++;
    const [t0, s0, x0, y0] = fases[i], [t1, s1, x1, y1] = fases[i + 1];
    const u = _suave(Math.min(1, Math.max(0, (t - t0) / Math.max(0.01, t1 - t0))));
    const S = s0 + (s1 - s0) * u, fx = x0 + (x1 - x0) * u + d * 6 * Math.sin(t * 0.6), fy = y0 + (y1 - y0) * u + d * 4 * Math.sin(t * 0.78);
    g.setAttribute("transform", `translate(540 900) scale(${S.toFixed(4)}) translate(${(-fx).toFixed(2)} ${(-fy).toFixed(2)})`);
  });
}

// foco seletivo / rack focus (depth-of-field-blur): desfoca `alvo` nas janelas [[ini, fim, px], ...]
// (rampa de 0,6 s). Use num invólucro sem outro filtro.
let _nFoco = 0;
function focoSeletivo(alvo, janelas, fimCena) {
  const id = `foco${_nFoco++}`;
  $("#defs").insertAdjacentHTML("beforeend", `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur id="${id}b" stdDeviation="0"/></filter>`);
  const b = $(`#${id}b`);
  aCadaQuadro((t) => {
    if (t > fimCena + 0.6) return;
    let v = 0;
    janelas.forEach(([a, z, px]) => { v = Math.max(v, Math.max(0, Math.min(1, (t - a) / 0.6, (z - t) / 0.6)) * px); });
    b.setAttribute("stdDeviation", v.toFixed(2));
    v > 0.05 ? alvo.setAttribute("filter", `url(#${id})`) : alvo.removeAttribute("filter");
  });
}

// contador que cresce (counting-dynamic-scale): escreve no <text> o valor de `de` até `ate`
// (curva expo.out) entre t e t+dur; fmt(v) formata (padrão: 100.000).
function contador(txt, de, ate, t, dur, fmt) {
  fmt = fmt || ((v) => Math.round(v).toLocaleString("pt-BR"));
  aCadaQuadro((x) => {
    const u = Math.min(1, Math.max(0, (x - t) / dur));
    txt.textContent = fmt(de + (ate - de) * (u >= 1 ? 1 : 1 - Math.pow(2, -10 * u)));
  });
}

// entradas e saídas variadas (motion-principles: varie direção, velocidade e curva; saída mais
// rápida que a entrada, com curva .in). estilos: escala | esq | dir | baixo | cima | mola
const _ENTRADAS = {
  escala: [{ opacity: 0, scale: 0.55 }, { duration: 0.7, ease: "expo.out" }],
  esq: [{ opacity: 0, x: -240 }, { duration: 0.55, ease: "power4.out" }],
  dir: [{ opacity: 0, x: 240 }, { duration: 0.55, ease: "power4.out" }],
  baixo: [{ opacity: 0, y: 70, scale: 0.9 }, { duration: 0.6, ease: "back.out(2.2)" }],
  cima: [{ opacity: 0, y: -90 }, { duration: 0.75, ease: "bounce.out" }],
  mola: [{ opacity: 0, scale: 0 }, { duration: 0.5, ease: "back.out(1.9)" }],
};
function entrar(el, t, estilo) {
  const [de, como] = _ENTRADAS[estilo || "mola"];
  tl.set(el, { opacity: 0 }, 0);
  tl.fromTo(el, Object.assign({ x: 0, y: 0, scale: 1, transformOrigin: "50% 50%" }, de),
    Object.assign({ x: 0, y: 0, scale: 1, opacity: 1, transformOrigin: "50% 50%", immediateRender: false }, como), t);
}
function sair(el, t, estilo) {
  const para = { esq: { x: -220 }, dir: { x: 220 }, cima: { y: -60 }, baixo: { y: 60 } }[estilo] || { scale: 0.85 };
  tl.to(el, Object.assign({ opacity: 0, duration: 0.24, ease: "power2.in", transformOrigin: "50% 50%" }, para), t);
}

// brilho atravessando uma pílula do rotulo() (ambient sheen)
$("#defs").insertAdjacentHTML("beforeend", `<linearGradient id="sheenG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
let _nSheen = 0;
const reflexoPassando = (g, txt, tam, t) => {
  const w = txt.length * tam * 0.6 + 52, id = `sheen${_nSheen++}`;
  g.insertAdjacentHTML("beforeend", `<clipPath id="${id}"><rect x="${-w / 2}" y="-34" width="${w}" height="68" rx="34"/></clipPath><g clip-path="url(#${id})"><rect class="sheen" x="-60" y="-50" width="60" height="100" fill="url(#sheenG)" transform="skewX(-20)"/></g>`);
  tl.fromTo($(".sheen", g), { x: -w / 2 - 80 }, { x: w / 2 + 120, duration: 0.7, ease: "power2.inOut", immediateRender: false }, t);
};

// respingo (particle-burst): gotas em voo balístico a partir de (x, y) no instante t
const _pr = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function respingo(pai, x, y, t, n, o) {
  o = Object.assign({ forca: 1, abertura: 560, seed: 1, cores: ["#e8f7ff", "#9fe6ff"], g: 2200 }, o || {});
  const s0 = o.seed * 97;
  pai.insertAdjacentHTML("beforeend", Array.from({ length: n }, (_, i) => `<ellipse class="gt${s0}" rx="${(3 + 4 * _pr(s0 + i)).toFixed(1)}" ry="${(4 + 5 * _pr(s0 + i + 50)).toFixed(1)}" fill="${o.cores[i % o.cores.length]}" opacity="0"/>`).join(""));
  const gs = $$(`.gt${s0}`, pai);
  aCadaQuadro((tt) => {
    const k = tt - t;
    gs.forEach((g, i) => {
      const vida = 0.65 + 0.4 * _pr(s0 + i * 3 + 1);
      if (k < 0 || k > vida) { g.setAttribute("opacity", 0); return; }
      const vx = (_pr(s0 + i * 5 + 2) - 0.5) * o.abertura * o.forca, vy = -(380 + 520 * _pr(s0 + i * 7 + 3)) * o.forca;
      g.setAttribute("transform", `translate(${(x + vx * k).toFixed(1)} ${(y + vy * k + 0.5 * o.g * k * k).toFixed(1)}) rotate(${(Math.atan2(vy + o.g * k, vx) * 57.3 - 90).toFixed(0)})`);
      g.setAttribute("opacity", (k > vida * 0.6 ? 1 - (k - vida * 0.6) / (vida * 0.4) : 1).toFixed(2));
    });
  });
}
// bolhas subindo (balançando) de (x, y), soltas ao longo de [t, t+dur]
function bolhasSobem(pai, x, y, n, t, dur, o) {
  o = Object.assign({ altura: 420, seed: 3, espalha: 60 }, o || {});
  const s0 = o.seed * 89;
  pai.insertAdjacentHTML("beforeend", Array.from({ length: n }, (_, i) => `<circle class="bb${s0}" r="${(4 + 9 * _pr(s0 + i)).toFixed(1)}" fill="#dff6ff" fill-opacity="0.25" stroke="#fff" stroke-opacity="0.8" stroke-width="2" opacity="0"/>`).join(""));
  const bs = $$(`.bb${s0}`, pai);
  aCadaQuadro((tt) => {
    bs.forEach((b, i) => {
      const nasce = t + dur * _pr(s0 + i * 11), vida = 1.1 + 0.8 * _pr(s0 + i * 13), k = (tt - nasce) / vida;
      if (k < 0 || k > 1) { b.setAttribute("opacity", 0); return; }
      const bx = x + (_pr(s0 + i * 17) - 0.5) * o.espalha + 14 * Math.sin(k * 9 + i), by = y - o.altura * k * (0.7 + 0.5 * _pr(s0 + i * 19));
      b.setAttribute("transform", `translate(${bx.toFixed(1)} ${by.toFixed(1)})`);
      b.setAttribute("opacity", (k > 0.75 ? (1 - k) / 0.25 : Math.min(1, k * 6)).toFixed(2));
    });
  });
}
