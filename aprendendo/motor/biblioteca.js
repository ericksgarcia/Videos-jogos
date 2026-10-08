// Biblioteca comum de desenhos (SVG em texto) e animações. Use em qualquer vídeo.
// ---------------- gradientes compartilhados ----------------
$("#defs").innerHTML = `
  <linearGradient id="ceuNoite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#070d2a"/><stop offset="0.55" stop-color="#16246a"/><stop offset="1" stop-color="#3b3f8f"/></linearGradient>
  <linearGradient id="ceuCrep" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d1640"/><stop offset="0.5" stop-color="#3a3b8c"/><stop offset="0.82" stop-color="#c0608a"/><stop offset="1" stop-color="#ffb36b"/></linearGradient>
  <linearGradient id="ceuDia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f5fbf"/><stop offset="0.6" stop-color="#58a8f0"/><stop offset="1" stop-color="#bfe8ff"/></linearGradient>
  <linearGradient id="parede" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2556"/><stop offset="1" stop-color="#121a3f"/></linearGradient>
  <linearGradient id="paredeQ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5a3c4a"/><stop offset="1" stop-color="#3a2533"/></linearGradient>
  <linearGradient id="piso" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a1f3d"/><stop offset="1" stop-color="#140f22"/></linearGradient>
  <linearGradient id="madeira" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a5a3c"/><stop offset="1" stop-color="#4f301f"/></linearGradient>
  <linearGradient id="cobre" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffc08a"/><stop offset="0.35" stop-color="#e08a4b"/><stop offset="1" stop-color="#8e4720"/></linearGradient>
  <linearGradient id="cobreH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8e4720"/><stop offset="0.4" stop-color="#ffc08a"/><stop offset="1" stop-color="#8e4720"/></linearGradient>
  <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eef2ff"/><stop offset="0.5" stop-color="#aab4d6"/><stop offset="1" stop-color="#5d6890"/></linearGradient>
  <linearGradient id="metalH" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5d6890"/><stop offset="0.45" stop-color="#e8edff"/><stop offset="1" stop-color="#5d6890"/></linearGradient>
  <linearGradient id="concreto" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9d0e6"/><stop offset="1" stop-color="#7b86a8"/></linearGradient>
  <linearGradient id="agua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe0ff"/><stop offset="0.3" stop-color="#2f9fe8"/><stop offset="1" stop-color="#123f9a"/></linearGradient>
  <linearGradient id="grama" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f8f6a"/><stop offset="1" stop-color="#174d3c"/></linearGradient>
  <linearGradient id="gramaN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1d4a5a"/><stop offset="1" stop-color="#0f2638"/></linearGradient>
  <linearGradient id="morroN1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3a7d"/><stop offset="1" stop-color="#18235a"/></linearGradient>
  <linearGradient id="morroN2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1c2a62"/><stop offset="1" stop-color="#0f1842"/></linearGradient>
  <linearGradient id="cone" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a0" stop-opacity="0.55"/><stop offset="1" stop-color="#ffd23f" stop-opacity="0"/></linearGradient>
  <linearGradient id="vermelhoI" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff8aa4"/><stop offset="1" stop-color="#c92a4f"/></linearGradient>
  <linearGradient id="azulI" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fe6ff"/><stop offset="1" stop-color="#1f86c9"/></linearGradient>
  <linearGradient id="painel" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3f7cf0"/><stop offset="1" stop-color="#132f87"/></linearGradient>
  <linearGradient id="papel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e7c8"/><stop offset="1" stop-color="#d9c29a"/></linearGradient>
  <radialGradient id="brilho"><stop offset="0" stop-color="#fff4c0" stop-opacity="0.95"/><stop offset="0.35" stop-color="#ffd23f" stop-opacity="0.38"/><stop offset="1" stop-color="#ffb52e" stop-opacity="0"/></radialGradient>
  <radialGradient id="brilhoAzul"><stop offset="0" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="0.3" stop-color="#8fe3ff" stop-opacity="0.55"/><stop offset="1" stop-color="#4cc9f0" stop-opacity="0"/></radialGradient>
  <radialGradient id="eletronG" cx="0.35" cy="0.3"><stop offset="0" stop-color="#ffffff"/><stop offset="0.35" stop-color="#9ff0ff"/><stop offset="1" stop-color="#1b8fd6"/></radialGradient>
  <radialGradient id="sombra"><stop offset="0" stop-color="#000" stop-opacity="0.45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <radialGradient id="sol" cx="0.4" cy="0.4"><stop offset="0" stop-color="#fffbe0"/><stop offset="0.6" stop-color="#ffe066"/><stop offset="1" stop-color="#ffb52e"/></radialGradient>
  <radialGradient id="lua" cx="0.4" cy="0.4"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#c9d3ff"/></radialGradient>
  <radialGradient id="fogo" cy="0.8"><stop offset="0" stop-color="#fff3a0"/><stop offset="0.4" stop-color="#ffb52e"/><stop offset="1" stop-color="#ff5a2e"/></radialGradient>`;

// ---------------- biblioteca de desenhos ----------------
const sombra = (x, y, rx, ry, op) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#sombra)" opacity="${op ?? 1}"/>`;
const halo = (x, y, r, cls, grad) => `<circle class="${cls || "halo"}" cx="${x}" cy="${y}" r="${r}" fill="url(#${grad || "brilho"})"/>`;
const nuvem = (x, y, s, op) => `<g transform="translate(${x} ${y}) scale(${s})" opacity="${op ?? 0.18}"><g class="nuvem"><ellipse cx="0" cy="0" rx="120" ry="44" fill="#fff"/><ellipse cx="-60" cy="-22" rx="70" ry="50" fill="#fff"/><ellipse cx="40" cy="-36" rx="80" ry="58" fill="#fff"/></g></g>`;
const estrelas = (n, seed, h0, h1) => { const r = prng(seed); let s = ""; for (let i = 0; i < n; i++) s += `<circle class="estrela" cx="${r() * W}" cy="${h0 + r() * (h1 - h0)}" r="${1 + r() * 2.4}" fill="#fff" opacity="${0.3 + r() * 0.6}"/>`; return s; };
const eletron = (r) => `<g><circle r="${r * 2.4}" fill="url(#brilhoAzul)" opacity="0.6"/><circle r="${r}" fill="url(#eletronG)"/><rect x="${-r * 0.45}" y="${-r * 0.12}" width="${r * 0.9}" height="${r * 0.24}" rx="${r * 0.1}" fill="#0b2a55" opacity="0.8"/></g>`;
const lampada = (cls) => `<g class="${cls || "lamp"}">
    <circle class="aura" r="330" fill="url(#brilho)" opacity="0"/>
    <path class="vidro" d="M0 -120 a96 96 0 0 1 56 174 v30 h-112 v-30 A96 96 0 0 1 0 -120z" fill="#33407a" stroke="#cfd8ff" stroke-width="5" stroke-opacity="0.7"/>
    <path d="M-46 -78 a70 70 0 0 1 40 -30" fill="none" stroke="#fff" stroke-opacity="0.55" stroke-width="10" stroke-linecap="round"/>
    <path class="filamento" d="M-28 34 q14 -54 28 0 q14 -54 28 0" fill="none" stroke="#8090c0" stroke-width="6" stroke-linecap="round"/>
    <rect x="-56" y="84" width="112" height="26" rx="10" fill="url(#metalH)"/><rect x="-50" y="112" width="100" height="20" rx="9" fill="url(#metalH)"/><rect x="-34" y="134" width="68" height="18" rx="9" fill="#4f5a7f"/>
  </g>`;
function acender(lamp, t, intensidade) {
  tl.to($(".vidro", lamp), { attr: { fill: "#ffe066" }, duration: 0.25 }, t);
  tl.to($(".filamento", lamp), { stroke: "#fffbe0", duration: 0.2 }, t);
  tl.fromTo($(".aura", lamp), { opacity: 0, scale: 0.5, transformOrigin: "50% 50%" }, { opacity: intensidade || 1, scale: 1, duration: 0.6, ease: "power2.out", immediateRender: false }, t);
  tl.fromTo($(".aura", lamp), { scale: 1 }, { scale: 1.06, duration: 0.9, yoyo: true, repeat: 6, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, t + 0.6);
}
const torre = (h) => `<path d="M${-h * 0.14} 0 L ${-h * 0.03} ${-h} L ${h * 0.03} ${-h} L ${h * 0.14} 0 M ${-h * 0.11} ${-h * 0.25} L ${h * 0.11} ${-h * 0.25} M ${-h * 0.08} ${-h * 0.5} L ${h * 0.08} ${-h * 0.5} M ${-h * 0.2} ${-h * 0.8} L ${h * 0.2} ${-h * 0.8} M ${-h * 0.12} 0 L ${h * 0.09} ${-h * 0.25} L ${-h * 0.07} ${-h * 0.5} L ${h * 0.05} ${-h * 0.8}" fill="none" stroke="#b9c3e6" stroke-width="${Math.max(3, h * 0.018)}" stroke-linejoin="round"/>`;
const casa = (cor, janela) => `<path d="M-90 0 V -120 L 0 -200 L 90 -120 V 0z" fill="${cor || "#e9ecff"}"/><path d="M-110 -110 L 0 -215 L 110 -110" fill="none" stroke="#8a5a6a" stroke-width="18" stroke-linejoin="round"/><rect class="${janela || "janela"}" x="-50" y="-100" width="44" height="44" rx="6" fill="#2a3566"/><rect x="18" y="-70" width="40" height="70" rx="6" fill="#7d6070"/>`;
const usinaT = () => `<rect x="-150" y="-120" width="300" height="120" rx="10" fill="#7d89ad"/><rect x="-150" y="-120" width="300" height="14" fill="#9aa7c7"/><path d="M60 -120 C 70 -200, 50 -250, 70 -300 H 150 C 170 -250, 150 -200, 160 -120z" fill="url(#concreto)"/>${[0, 1, 2, 3].map((k) => `<rect x="${-130 + k * 44}" y="-90" width="26" height="34" rx="4" fill="#ffd23f" opacity="0.8"/>`).join("")}`;
const turbinaR = (r, cor, n) => `<circle r="${r}" fill="#22306c" stroke="url(#metalH)" stroke-width="${r * 0.1}"/>${Array.from({ length: n || 8 }, (_, k) => `<path d="M0 0 C ${r * 0.25} ${-r * 0.4}, ${r * 0.38} ${-r * 0.7}, 0 ${-r * 0.88} C ${-r * 0.13} ${-r * 0.62}, ${-r * 0.1} ${-r * 0.32}, 0 0z" fill="${cor}" transform="rotate(${(k * 360) / (n || 8)})"/>`).join("")}<circle r="${r * 0.17}" fill="url(#metal)"/>`;
const eolica = (h, cls) => `<path d="M-10 0 L -5 ${-h} L 5 ${-h} L 10 0z" fill="url(#metalH)"/><g transform="translate(0 ${-h})"><g class="${cls}">${[0, 120, 240].map((a) => `<path d="M-8 0 C -12 ${-h * 0.25}, -5 ${-h * 0.5}, 0 ${-h * 0.58} C 7 ${-h * 0.5}, 12 ${-h * 0.25}, 8 0z" fill="#f4f6ff" transform="rotate(${a})"/>`).join("")}<circle r="${h * 0.045}" fill="#dfe4f7"/></g></g>`;
const rotulo = (txt, cor, tam) => { const w = txt.length * (tam || 36) * 0.6 + 52; return `<rect x="${-w / 2}" y="-34" width="${w}" height="68" rx="34" fill="${cor || C.amarelo}"/><text class="rot" x="0" y="${(tam || 36) * 0.36}" text-anchor="middle" font-size="${tam || 36}" fill="#141a3a">${txt}</text>`; };
// anotação com linha de chamada até um ponto
const callout = (x0, y0, x1, y1, txt, cor) => `<g class="callout"><circle cx="${x0}" cy="${y0}" r="9" fill="${cor || C.amarelo}"/><path class="cl" d="M${x0} ${y0} L ${x1} ${y1} H ${x1 + (x1 > x0 ? 40 : -40)}" fill="none" stroke="${cor || C.amarelo}" stroke-width="4"/><text class="rot" x="${x1 + (x1 > x0 ? 52 : -52)}" y="${y1 + 13}" text-anchor="${x1 > x0 ? "start" : "end"}" font-size="38" fill="#fff">${txt}</text></g>`;

// ---------------- utilitários de animação ----------------
const pop = (el, t, extra) => tl.fromTo(el, { scale: 0, opacity: 0, transformOrigin: "50% 50%" }, Object.assign({ scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.9)", immediateRender: false }, extra || {}), t);
const surge = (el, t, dy) => tl.fromTo(el, { y: dy ?? 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", immediateRender: false }, t);
const desenhar = (el, t, dur) => tl.fromTo(el, { drawSVG: "0%" }, { drawSVG: "100%", duration: dur || 0.8, ease: "power2.inOut", immediateRender: false }, t);
const girar = (el, t, fim, vps, origem) => tl.fromTo(el, Object.assign({ rotation: 0 }, origem ? { svgOrigin: origem } : { transformOrigin: "50% 50%" }), Object.assign({ rotation: 360 * vps * Math.max(0.1, fim - t), duration: Math.max(0.1, fim - t), ease: "none", immediateRender: false }, origem ? { svgOrigin: origem } : { transformOrigin: "50% 50%" }), t);
const balancar = (el, t, fim, amp, per, prop) => tl.fromTo(el, { [prop || "y"]: 0 }, { [prop || "y"]: amp, duration: per, yoyo: true, repeat: Math.max(1, Math.floor((fim - t) / per)), ease: "sine.inOut", immediateRender: false }, t);
const callAnim = (g, t) => { tl.set(g, { opacity: 1 }, t); pop($("circle", g), t); desenhar($(".cl", g), t + 0.1, 0.4); tl.fromTo($("text", g), { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.35, immediateRender: false }, t + 0.4); };
function fluxo(path, n, r, t, fim, porSeg, pai, cor) {
  const dots = [];
  for (let i = 0; i < n; i++) {
    const wrap = document.createElementNS(NS, "g");
    wrap.innerHTML = cor ? `<circle r="${r * 2.3}" fill="url(#brilho)" opacity="0.7"/><circle r="${r}" fill="${cor}"/>` : eletron(r);
    wrap.setAttribute("opacity", 0);
    pai.appendChild(wrap);
    const ini = i / n, voltas = Math.max(0.2, (fim - t) * porSeg);
    tl.set(wrap, { opacity: 1 }, t);
    tl.fromTo(wrap, { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: ini, end: ini } },
      { motionPath: { path, align: path, alignOrigin: [0.5, 0.5], start: ini, end: ini + voltas }, duration: Math.max(0.1, fim - t), ease: "none", immediateRender: true }, t);
    dots.push(wrap);
  }
  return dots;
}
// poeira flutuando na luz
function poeira(pai, n, seed, area, t, fim, cor) {
  const r = prng(seed);
  for (let i = 0; i < n; i++) {
    const x = area[0] + r() * area[2], y = area[1] + r() * area[3];
    pai.insertAdjacentHTML("beforeend", `<circle class="po" cx="${x}" cy="${y}" r="${1.5 + r() * 3}" fill="${cor || "#fff"}" opacity="${0.15 + r() * 0.35}"/>`);
  }
  $$(".po", pai).forEach((p, i) => tl.fromTo(p, { y: 0, x: 0 }, { y: -60 - (i % 5) * 20, x: (i % 2 ? 1 : -1) * 30, duration: Math.max(0.5, fim - t), ease: "sine.inOut", immediateRender: false }, t));
}

// pessoa estilizada (pés na origem, ~230 px de altura). opções: gravata, faixa (presidencial), prancheta
const pessoa = (corpo, pele, cabelo, o) => { o = o || {}; return `${sombra(0, 4, 50, 10, 0.7)}
  <rect x="-38" y="-160" width="76" height="160" rx="36" fill="${corpo}"/><rect x="-26" y="-140" width="16" height="80" rx="8" fill="#fff" opacity="0.22"/>
  ${o.gravata ? `<path d="M-14 -160 L 0 -138 L 14 -160z" fill="#fff"/><path d="M0 -146 L 8 -120 L 0 -100 L -8 -120z" fill="${o.gravata}"/>` : ""}
  ${o.faixa ? `<path d="M-34 -150 L 34 -60 L 34 -38 L -34 -128z" fill="#1a9b4b"/><path d="M-34 -138 L 34 -48 L 34 -42 L -34 -132z" fill="#ffdf00"/>` : ""}
  ${o.prancheta ? `<g transform="translate(30 -96) rotate(10)"><rect x="-24" y="-34" width="48" height="66" rx="6" fill="#c98b4b"/><rect x="-18" y="-26" width="36" height="52" rx="3" fill="#fff"/><g class="checks">${[0, 1, 2].map((k) => `<path d="M-12 ${-14 + k * 16} l 5 5 l 9 -10" fill="none" stroke="${C.verde}" stroke-width="4" stroke-linecap="round"/>`).join("")}</g></g>` : ""}
  <circle cy="-198" r="38" fill="${pele}"/><path d="M-38 -204 C -36 -248, 36 -248, 38 -204 C 26 -222, -26 -222, -38 -204z" fill="${cabelo}"/>`; };
const CORPOS = ["#3a5bd9", "#2f9fe8", "#ff8a3d", "#06d6a0", "#ff5d8f", "#7b5cd6", "#e0a83a", "#4cc9f0"];
const PELES = ["#f2c7a5", "#d9a27c", "#a96f4b", "#7a4a2f", "#ffdcc0"];
const CABELOS = ["#2b1d14", "#5a3a22", "#141414", "#8a5a2c", "#c9c9d6"];
const gente = (k, o) => pessoa(CORPOS[k % CORPOS.length], PELES[(k * 3) % PELES.length], CABELOS[(k * 7) % CABELOS.length], o);

// ---------------- ícones, prédios, documentos, Brasília (vindos do vídeo de cargos políticos) ----------------
const ICONE = {
  saude: `<rect x="-12" y="-36" width="24" height="72" rx="6" fill="${C.vermelho}"/><rect x="-36" y="-12" width="72" height="24" rx="6" fill="${C.vermelho}"/>`,
  escola: `<path d="M0 -22 C -14 -32 -30 -32 -40 -26 V 30 C -30 24 -14 24 0 32z" fill="${C.azul}"/><path d="M0 -22 C 14 -32 30 -32 40 -26 V 30 C 30 24 14 24 0 32z" fill="#1f86c9"/><path d="M-30 -14 h18 M-30 -2 h18 M14 -14 h18 M14 -2 h18" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
  lixo: `<rect x="-26" y="-18" width="52" height="56" rx="7" fill="${C.verde}"/><rect x="-34" y="-30" width="68" height="11" rx="5" fill="#049e77"/><rect x="-10" y="-40" width="20" height="9" rx="4" fill="#049e77"/><path d="M-10 -6 v32 M10 -6 v32" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`,
  buraco: `<path d="M0 -40 L 24 30 H -24z" fill="${C.laranja}"/><path d="M-9 -12 h18 M-16 8 h32" stroke="#fff" stroke-width="7"/><rect x="-36" y="28" width="72" height="11" rx="4" fill="#c25a1c"/>`,
  onibus: `<rect x="-42" y="-30" width="84" height="56" rx="12" fill="${C.amarelo}"/><rect x="-34" y="-22" width="68" height="22" rx="5" fill="#9fe6ff"/><rect x="-42" y="6" width="84" height="6" fill="#e0a83a"/><circle cx="-22" cy="28" r="9" fill="#141a3a"/><circle cx="22" cy="28" r="9" fill="#141a3a"/>`,
  policia: `<path d="M0 -42 L 34 -28 V 2 C 34 24 16 36 0 42 C -16 36 -34 24 -34 2 V -28z" fill="#3a5bd9"/><path d="M0 -20 L 6 -6 L 21 -6 L 9 4 L 13 19 L 0 10 L -13 19 L -9 4 L -21 -6 L -6 -6z" fill="#fff"/>`,
  hospital: `<rect x="-38" y="-38" width="76" height="76" rx="14" fill="${C.vermelho}"/><text class="rot" y="20" text-anchor="middle" font-size="58" fill="#fff">H</text>`,
  ensino: `<path d="M-46 -8 L 0 -28 L 46 -8 L 0 12z" fill="#1b1f3b"/><path d="M-26 2 V 22 C -12 32 12 32 26 22 V 2 L 0 12z" fill="#3b4377"/><path d="M38 -5 V 22" stroke="${C.amarelo}" stroke-width="4"/><circle cx="38" cy="25" r="5" fill="${C.amarelo}"/>`,
  estrada: `<path d="M-14 -40 H 14 L 42 40 H -42z" fill="#56618a"/><path d="M0 -34 V -20 M0 -8 V 8 M0 20 V 38" stroke="${C.amarelo}" stroke-width="5"/>`,
  economia: `<circle r="40" fill="${C.amarelo}"/><circle r="32" fill="none" stroke="#e0a83a" stroke-width="4"/><text class="rot" y="19" text-anchor="middle" font-size="54" fill="#8a5a1c">R$</text>`.replace('font-size="54"', 'font-size="36"').replace('y="19"', 'y="13"'),
  globo: `<circle r="40" fill="${C.azul}"/><ellipse rx="16" ry="40" fill="none" stroke="#fff" stroke-width="4"/><path d="M-40 0 H 40 M-34 -20 H 34 M-34 20 H 34" stroke="#fff" stroke-width="4"/>`,
  forcas: `<path d="M0 -42 L 34 -28 V 2 C 34 24 16 36 0 42 C -16 36 -34 24 -34 2 V -28z" fill="#4f6b3a"/><path d="M0 -22 L 6 -8 L 21 -8 L 9 2 L 13 17 L 0 8 L -13 17 L -9 2 L -21 -8 L -6 -8z" fill="${C.amarelo}"/>`,
};
// medalhão com ícone e nome embaixo
const medalha = (ic, cor, txt) => `<circle r="76" fill="rgba(6,10,30,0.45)"/><circle r="66" fill="#fff"/><circle r="66" fill="none" stroke="${cor}" stroke-width="8"/>${ICONE[ic]}
  <text class="rot" y="116" text-anchor="middle" font-size="32" fill="#fff" stroke="rgba(6,10,30,0.85)" stroke-width="9" paint-order="stroke">${txt}</text>`;
// rótulo com uma linha explicativa embaixo
const etiqueta = (t1, cor, t2) => `${rotulo(t1, cor, 40)}${t2 ? `<rect x="${-(t2.length * 16 + 40) / 2}" y="44" width="${t2.length * 16 + 40}" height="50" rx="25" fill="rgba(6,10,30,0.8)"/><text class="rotm" y="78" text-anchor="middle" font-size="28" fill="#fff">${t2}</text>` : ""}`;
const bandeira = (s) => `<g transform="scale(${s || 1})"><rect width="104" height="72" fill="#009c3b"/><path d="M52 9 L 95 36 L 52 63 L 9 36z" fill="#ffdf00"/><circle cx="52" cy="36" r="16" fill="#002776"/></g>`;
// prédio público clássico (base no y=0): colunas, frontão, cúpula opcional, placa e bandeira
const palacio = (w, h, cor, placa, o) => {
  o = o || {};
  const n = Math.max(3, Math.floor(w / 72));
  const cols = Array.from({ length: n }, (_, k) => `<rect x="${-w / 2 + 26 + (k * (w - 74)) / (n - 1)}" y="${-h + 70}" width="22" height="${h - 110}" rx="4" fill="#fff" opacity="0.9"/>`).join("");
  return `${o.cupula ? `<path d="M-80 ${-h - 40} C -80 ${-h - 170}, 80 ${-h - 170}, 80 ${-h - 40}z" fill="url(#metal)"/><rect x="-6" y="${-h - 200}" width="12" height="40" fill="#c7cde6"/>` : ""}
    ${o.mastro !== false ? `<rect x="${w / 2 - 30}" y="${-h - 230}" width="6" height="230" fill="#c7cde6"/><g transform="translate(${w / 2 - 24} ${-h - 228})">${bandeira(0.9)}</g>` : ""}
    ${sombra(0, 6, w * 0.62, 18, 0.6)}
    <rect x="${-w / 2 - 24}" y="-22" width="${w + 48}" height="22" fill="#c9d0e6"/><rect x="${-w / 2 - 12}" y="-40" width="${w + 24}" height="18" fill="#dfe4f7"/>
    <rect x="${-w / 2}" y="${-h + 34}" width="${w}" height="${h - 74}" fill="${cor}"/>
    <rect x="${-w / 2}" y="${-h + 34}" width="${w}" height="${h - 74}" fill="url(#sombraV)" opacity="0.35"/>
    ${cols}<rect x="-40" y="-150" width="80" height="110" rx="40" fill="#2a3566" opacity="0.85"/>
    <rect x="${-w / 2 - 14}" y="${-h}" width="${w + 28}" height="38" fill="#f6f2ea"/>
    <path d="M${-w / 2 - 14} ${-h} L 0 ${-h - 92} L ${w / 2 + 14} ${-h}z" fill="#f6f2ea"/><path d="M${-w / 2 + 30} ${-h - 8} L 0 ${-h - 74} L ${w / 2 - 30} ${-h - 8}z" fill="${cor}" opacity="0.6"/>
    <text class="rot" y="${-h + 27}" text-anchor="middle" font-size="24" letter-spacing="2" fill="#3a3f6e">${placa}</text>`;
};
// prédio moderno de vidro (base no y=0)
const moderno = (w, h, placa) => `${sombra(0, 6, w * 0.6, 16, 0.6)}<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="6" fill="url(#painel)"/>
  ${Array.from({ length: Math.floor(h / 60) }, (_, r) => Array.from({ length: Math.floor(w / 60) }, (_, q) => `<rect x="${-w / 2 + 14 + q * 60}" y="${-h + 20 + r * 60}" width="44" height="40" rx="4" fill="#9fc4ff" opacity="${0.25 + ((r * 7 + q * 3) % 5) * 0.12}"/>`).join("")).join("")}
  <rect x="${-w / 2 - 10}" y="${-h - 54}" width="${w + 20}" height="54" rx="6" fill="#dfe4f7"/><text class="rot" y="${-h - 18}" text-anchor="middle" font-size="22" letter-spacing="1" fill="#3a3f6e">${placa}</text>`;
const lupa = (cor) => `<circle r="46" fill="rgba(143,227,255,0.18)" stroke="${cor || "#fff"}" stroke-width="12"/><rect x="34" y="30" width="22" height="70" rx="11" fill="${cor || "#fff"}" transform="rotate(-45 45 65)"/>`;
const documento = (titulo, cor) => `${sombra(0, 180, 140, 16, 0.6)}<rect x="-130" y="-170" width="260" height="340" rx="16" fill="url(#papel)"/><rect x="-130" y="-170" width="260" height="62" rx="16" fill="${cor || "#8a5a2c"}"/><rect x="-130" y="-124" width="260" height="16" fill="${cor || "#8a5a2c"}"/>
  <text class="rot" y="-126" text-anchor="middle" font-size="30" fill="#fff">${titulo}</text>${[0, 1, 2, 3, 4, 5].map((k) => `<rect x="-96" y="${-80 + k * 36}" width="${k % 3 === 2 ? 120 : 192}" height="12" rx="6" fill="#b39a74"/>`).join("")}`;
const carimbo = (txt, cor) => { const w = txt.length * 30 + 50; return `<g transform="rotate(-12)"><rect x="${-w / 2}" y="-40" width="${w}" height="80" rx="12" fill="none" stroke="${cor}" stroke-width="8"/><text class="rot" y="17" text-anchor="middle" font-size="48" fill="${cor}">${txt}</text></g>`; };
const check = (cor) => `<circle r="34" fill="${cor || C.verde}"/><path d="M-15 1 l 10 11 l 20 -22" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
const xis = () => `<circle r="44" fill="${C.vermelho}"/><path d="M-18 -18 L 18 18 M18 -18 L -18 18" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`;
// seta tracejada com ponta, de (x0,y0) a (x1,y1) passando por cima
const seta = (x0, y0, x1, y1, cor, cls) => { const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 90; const a = Math.atan2(y1 - my, x1 - mx) * 180 / Math.PI;
  return `<g class="${cls || "seta"}"><path class="sl" d="M${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}" fill="none" stroke="${cor}" stroke-width="7" stroke-dasharray="16 12" stroke-linecap="round"/><path d="M0 0 L -30 -16 L -30 16z" fill="${cor}" transform="translate(${x1} ${y1}) rotate(${a})"/></g>`; };
// Congresso Nacional (Brasília), base no y=0 com centro em x=0
const congresso = () => `${sombra(0, 4, 470, 20, 0.6)}
  <rect x="-40" y="-560" width="34" height="520" fill="url(#concretoV)"/><rect x="6" y="-560" width="34" height="520" fill="url(#concretoV)"/><rect x="-40" y="-330" width="80" height="18" fill="#dfe4f7"/>
  ${Array.from({ length: 9 }, (_, k) => `<rect x="-36" y="${-540 + k * 56}" width="26" height="6" fill="#7b86a8" opacity="0.5"/><rect x="10" y="${-540 + k * 56}" width="26" height="6" fill="#7b86a8" opacity="0.5"/>`).join("")}
  <rect x="-430" y="-48" width="860" height="48" fill="url(#concreto)"/><rect x="-430" y="-48" width="860" height="8" fill="#eef1ff"/>
  <path d="M-380 -48 L -560 40 H -500 L -330 -48z" fill="#aab4d6"/>
  <g class="bacia"><path d="M-370 -98 C -350 -48, -280 -48, -210 -48 C -140 -48, -70 -48, -50 -98 Z" fill="url(#concreto)"/><ellipse cx="-210" cy="-98" rx="160" ry="20" fill="#eef1ff"/><ellipse cx="-210" cy="-96" rx="140" ry="13" fill="#9aa7c7"/></g>
  <g class="cupula"><path d="M110 -48 C 120 -150, 330 -150, 340 -48 Z" fill="url(#concreto)"/><path d="M140 -70 C 160 -128, 230 -136, 260 -128" fill="none" stroke="#fff" stroke-width="6" opacity="0.5" stroke-linecap="round"/></g>`;
// Palácio do Planalto, base no y=0 com centro em x=0
const planalto = () => { const cols = Array.from({ length: 11 }, (_, k) => { const x = -410 + k * 82; return `<path d="M${x} 0 C ${x - 18} -34, ${x - 18} -70, ${x} -102 C ${x + 18} -70, ${x + 18} -34, ${x} 0" fill="#fff"/>`; }).join("");
  return `${sombra(0, 6, 520, 20, 0.6)}<rect x="-470" y="-130" width="940" height="28" fill="#eef1ff"/><rect x="-430" y="-102" width="860" height="86" fill="url(#vidro)"/>
  ${Array.from({ length: 14 }, (_, k) => `<rect x="${-420 + k * 61}" y="-98" width="3" height="80" fill="#cfe0ff" opacity="0.35"/>`).join("")}
  <path d="M-360 -94 L -240 -94 L -330 -20 H -450z" fill="#fff" opacity="0.08"/>${cols}
  <rect x="-480" y="0" width="960" height="14" fill="#c9d0e6"/><path d="M-470 -16 H -230 V -4 L -520 50 H -580z" fill="#dfe4f7"/>`; };
// contorno do Brasil (lon, lat) projetado num quadrado de lado `tam`
const BR = [[-73.9, -7.4], [-72.9, -5.0], [-70.0, -4.2], [-69.4, -1.0], [-69.8, 1.7], [-67.0, 1.9], [-66.0, 0.8], [-64.0, 2.0], [-64.8, 4.0], [-62.0, 4.2], [-60.8, 5.2], [-59.6, 1.8], [-56.5, 1.9], [-54.0, 2.2], [-51.6, 4.2], [-50.0, 1.7], [-49.0, -0.5], [-47.5, -0.6], [-44.5, -2.5], [-41.5, -2.9], [-38.5, -3.7], [-35.2, -5.5], [-34.8, -7.5], [-35.5, -9.5], [-38.5, -13.0], [-39.0, -17.5], [-40.0, -20.0], [-41.0, -22.0], [-43.2, -23.0], [-46.5, -24.0], [-48.5, -26.0], [-48.8, -28.5], [-50.5, -30.5], [-52.5, -33.7], [-53.5, -33.0], [-55.5, -31.0], [-57.6, -30.2], [-55.7, -27.4], [-53.8, -27.1], [-53.6, -26.0], [-54.6, -25.6], [-54.3, -24.0], [-55.8, -22.3], [-57.8, -22.1], [-58.1, -20.2], [-57.5, -18.0], [-58.4, -16.3], [-60.2, -16.2], [-60.5, -13.8], [-62.5, -13.0], [-65.4, -11.0], [-66.6, -9.9], [-69.5, -11.0], [-70.6, -11.0], [-70.5, -9.5], [-72.5, -9.6]];
const brasil = (tam, cor, cls) => `<path class="${cls || "br"}" d="M${BR.map(([lo, la]) => `${(((lo + 74) / 39.5) * tam - tam / 2).toFixed(1)} ${(((5.5 - la) / 39.5) * tam - tam / 2).toFixed(1)}`).join(" L ")}Z" fill="${cor}" stroke-linejoin="round"/>`;
$("#defs").insertAdjacentHTML("beforeend", `
  <linearGradient id="sombraV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></linearGradient>
  <linearGradient id="concretoV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef1ff"/><stop offset="1" stop-color="#9aa7c7"/></linearGradient>
  <linearGradient id="vidro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c4a9a"/><stop offset="1" stop-color="#101c4a"/></linearGradient>
  <linearGradient id="predioG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9d9c6"/><stop offset="1" stop-color="#b9a08a"/></linearGradient>
  <linearGradient id="ceuOuro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3b8f"/><stop offset="0.55" stop-color="#7a5fb0"/><stop offset="0.85" stop-color="#f08a6a"/><stop offset="1" stop-color="#ffc27a"/></linearGradient>
  <linearGradient id="plenarioV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2a2a"/><stop offset="1" stop-color="#061616"/></linearGradient>
  <linearGradient id="plenarioA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1d55"/><stop offset="1" stop-color="#070d2a"/></linearGradient>`);
// medalhões que surgem num arco, com linha tracejada até o "dono" (prédio)
function medalhas(pai, itens, B, origem) {
  pai.insertAdjacentHTML("beforeend", itens.map(([ic, cor, txt, x, y]) => `<path class="liga" d="M${origem[0]} ${origem[1]} L ${x} ${y + 70}" stroke="rgba(255,255,255,0.45)" stroke-width="4" stroke-dasharray="10 10" opacity="0"/>`).join("") +
    itens.map(([ic, cor, txt, x, y]) => P(x, y, 1, "med", medalha(ic, cor, txt))).join(""));
  const meds = $$(".med", pai), ligas = $$(".liga", pai);
  itens.forEach((it, k) => {
    const t = B(it[5], 0.3 + k * 0.1);
    tl.set(meds[k], { opacity: 0 }, 0);
    pop(meds[k], t);
    tl.set(ligas[k], { opacity: 1 }, t);
    desenhar(ligas[k], t, 0.35);
  });
  return [...meds, ...ligas];
}

// ---------------- personagem (estilo divulgação científica: braços articulados, rosto, cabelo) ----------------
// Pés na origem, ~300 px de altura. Partes animáveis (selecione dentro do invólucro):
//   .bracoE / .bracoD  (gire com svgOrigin "0 0" = ombro; 0 = braço caído, -90 = braço direito para a direita,
//                       +90 = braço esquerdo para a esquerda), .maoE / .maoD, .cabeca, .olhos, .tronco
// o = { pele, roupa, calca, cabelo, estilo: "curto"|"longo"|"coque"|"careca", oculos, barba, sapato }
const personagem = (o) => {
  o = Object.assign({ pele: "#d9a27c", roupa: "#3a5bd9", calca: "#2a3566", cabelo: "#2b1d14", estilo: "curto", sapato: "#1b1f3b" }, o || {});
  const sombraPele = "rgba(90,40,20,0.22)";
  const braco = (lado) => `<g transform="translate(${lado * 33} -206)"><g class="braco${lado < 0 ? "E" : "D"}">
      <rect x="-11" y="-6" width="22" height="98" rx="11" fill="${o.roupa}"/><rect x="-11" y="-6" width="9" height="98" rx="5" fill="#fff" opacity="0.12"/>
      <circle class="mao${lado < 0 ? "E" : "D"}" cx="0" cy="98" r="12" fill="${o.pele}"/></g></g>`;
  const cabeloAtras = o.estilo === "longo" ? `<path d="M-38 -10 C -44 30, -40 62, -30 74 H 30 C 40 62, 44 30, 38 -10 Z" fill="${o.cabelo}"/>` : "";
  const cabeloFrente = {
    curto: `<path d="M-36 -8 C -40 -44, -12 -54, 4 -50 C 26 -50, 40 -36, 36 -6 C 26 -24, 8 -28, -10 -26 C -22 -24, -30 -18, -36 -8 Z" fill="${o.cabelo}"/>`,
    longo: `<path d="M-38 6 C -44 -44, -6 -56, 8 -50 C 34 -46, 44 -24, 38 6 C 30 -22, 12 -30, -4 -28 C -20 -26, -32 -14, -38 6 Z" fill="${o.cabelo}"/>`,
    coque: `<circle cx="0" cy="-52" r="16" fill="${o.cabelo}"/><path d="M-36 -6 C -38 -42, 38 -42, 36 -6 C 22 -26, -22 -26, -36 -6 Z" fill="${o.cabelo}"/>`,
    careca: `<path d="M-30 -28 C -18 -40, 18 -40, 30 -28" stroke="#fff" stroke-opacity="0.25" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  }[o.estilo];
  return `${sombra(0, 4, 56, 11, 0.7)}
    <rect x="-24" y="-96" width="20" height="94" rx="9" fill="${o.calca}"/><rect x="4" y="-96" width="20" height="94" rx="9" fill="${o.calca}"/>
    <path d="M-30 -2 Q -30 -14, -14 -14 H -2 V 2 H -26 Q -30 2, -30 -2 Z" fill="${o.sapato}"/><path d="M30 -2 Q 30 -14, 14 -14 H 2 V 2 H 26 Q 30 2, 30 -2 Z" fill="${o.sapato}"/>
    ${braco(-1)}
    <g class="tronco"><path d="M-36 -96 V -190 C -36 -210, -24 -218, -10 -218 H 10 C 24 -218, 36 -210, 36 -190 V -96 Z" fill="${o.roupa}"/>
      <path d="M-36 -96 V -190 C -36 -204, -30 -212, -22 -216 V -96 Z" fill="#fff" opacity="0.13"/><path d="M36 -96 V -190 C 36 -204, 30 -212, 22 -216 V -96 Z" fill="#000" opacity="0.15"/>
      <path d="M-12 -218 L 0 -202 L 12 -218 Z" fill="${o.pele}"/></g>
    ${braco(1)}
    <rect x="-9" y="-232" width="18" height="18" fill="${o.pele}"/><rect x="-9" y="-232" width="18" height="8" fill="${sombraPele}"/>
    <g transform="translate(0 -266)"><g class="cabeca">${cabeloAtras}
      <ellipse cx="-35" cy="4" rx="7" ry="10" fill="${o.pele}"/><ellipse cx="35" cy="4" rx="7" ry="10" fill="${o.pele}"/>
      <ellipse cx="0" cy="0" rx="34" ry="38" fill="${o.pele}"/><path d="M18 -30 C 34 -16, 36 16, 18 34 C 30 14, 30 -12, 18 -30 Z" fill="${sombraPele}"/>
      <g class="olhos"><ellipse cx="-12" cy="0" rx="4.2" ry="5.6" fill="#1b1f3b"/><ellipse cx="12" cy="0" rx="4.2" ry="5.6" fill="#1b1f3b"/>
        <circle cx="-10.5" cy="-2" r="1.5" fill="#fff"/><circle cx="13.5" cy="-2" r="1.5" fill="#fff"/></g>
      <path class="sobrancelhas" d="M-19 -12 Q -12 -16, -6 -13 M6 -13 Q 12 -16, 19 -12" stroke="${o.estilo === "careca" ? "#5a3a22" : o.cabelo}" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <path d="M-2 6 Q 2 12, 4 8" stroke="${sombraPele}" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path class="boca" d="M-9 18 Q 0 25, 9 18" stroke="#7a2e2e" stroke-width="3.2" fill="none" stroke-linecap="round"/>
      ${o.barba ? `<path d="M-30 6 C -28 40, 28 40, 30 6 C 22 22, 12 28, 0 28 C -12 28, -22 22, -30 6 Z" fill="${o.cabelo}"/><path class="boca" d="M-8 20 Q 0 25, 8 20" stroke="#7a2e2e" stroke-width="3" fill="none" stroke-linecap="round"/>` : ""}
      ${o.oculos ? `<g fill="none" stroke="#1b1f3b" stroke-width="3"><circle cx="-12" cy="0" r="10"/><circle cx="12" cy="0" r="10"/><path d="M-2 0 H 2 M-22 -2 L -33 -4 M22 -2 L 33 -4"/></g>` : ""}
      ${cabeloFrente}</g></g>`;
};
// vida do personagem: pisca de vez em quando e respira (tronco e cabeça sobem e descem de leve)
function vivo(p, t, fim, seed) {
  const r = prng(seed || 1), olhos = $(".olhos", p);
  for (let k = t + 0.6 + r() * 1.5; k < fim - 0.3; k += 2.2 + r() * 2.2)
    tl.fromTo(olhos, { scaleY: 1 }, { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, ease: "power1.inOut", transformOrigin: "50% 50%", immediateRender: false }, k);
  const per = 1.8 + r() * 0.6;
  tl.fromTo($(".cabeca", p), { y: 0 }, { y: -3, duration: per, yoyo: true, repeat: Math.max(1, Math.floor((fim - t) / per)), ease: "sine.inOut", immediateRender: false }, t);
  tl.fromTo($(".tronco", p), { scaleY: 1 }, { scaleY: 1.015, duration: per, yoyo: true, repeat: Math.max(1, Math.floor((fim - t) / per)), ease: "sine.inOut", transformOrigin: "50% 100%", immediateRender: false }, t);
}
// gira um braço (ombro como pivô) até `ang` graus
const gesto = (braco, t, ang, dur, ease) => tl.to(braco, { rotation: ang, svgOrigin: "0 0", duration: dur || 0.5, ease: ease || "back.out(1.6)" }, t);

// ================= estilo HOLOGRAMA / HUD (tecnológico) =================
// Fundo escuro com grade em perspectiva, objetos em linhas neon (classe .holo em QUALQUER desenho
// da biblioteca), rótulos de interface (tag), linhas de medida, mira e varredura de scanner.
// Fonte técnica: JetBrains Mono (motor/fontes, licença OFL) nas classes .mono / .monol.
const HUD_CORES = { "": ["143,227,255", "#8fe3ff"], am: ["255,210,63", "#ffd23f"], vm: ["239,71,111", "#ef476f"], vd: ["6,214,160", "#06d6a0"], rs: ["255,93,143", "#ff5d8f"], lr: ["255,138,61", "#ff8a3d"], az: ["76,201,240", "#4cc9f0"] };
document.head.insertAdjacentHTML("beforeend", `<style>
  @font-face { font-family: "JBMono"; font-weight: 500; src: url("assets/jetbrains-mono-latin-500-normal.woff2") format("woff2"); }
  @font-face { font-family: "JBMono"; font-weight: 800; src: url("assets/jetbrains-mono-latin-800-normal.woff2") format("woff2"); }
  .mono { font-family: "JBMono", "DejaVu Sans Mono", monospace; font-weight: 800; letter-spacing: 2px; }
  .monol { font-family: "JBMono", "DejaVu Sans Mono", monospace; font-weight: 500; letter-spacing: 1px; }
  ${Object.entries(HUD_CORES).map(([k, [rgb, hex]]) => { const c = k ? `.holo-${k}` : ".holo";
    return `${c}, ${c} * { fill: rgba(${rgb},0.07); stroke: ${hex}; stroke-width: 2px; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
    ${c} text { fill: rgba(${rgb},0.95); stroke-width: 0.6px; } ${c} .cheio, ${c} .cheio * { fill: rgba(${rgb},0.35); } ${c} .vazio { fill: none; }`; }).join("\n")}
</style>`);
$("#defs").insertAdjacentHTML("beforeend", `
  <linearGradient id="hudFundo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b1838"/><stop offset="0.55" stop-color="#060d24"/><stop offset="1" stop-color="#02050f"/></linearGradient>
  <linearGradient id="hudAgua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0d3a6e" stop-opacity="0.9"/><stop offset="1" stop-color="#030a1c" stop-opacity="1"/></linearGradient>
  <radialGradient id="hudBrilho"><stop offset="0" stop-color="#4cc9f0" stop-opacity="0.35"/><stop offset="1" stop-color="#4cc9f0" stop-opacity="0"/></radialGradient>
  <radialGradient id="hudVinheta" cx="0.5" cy="0.45" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.65"/></radialGradient>
  <pattern id="hudPontos" width="36" height="36" patternUnits="userSpaceOnUse"><circle cx="18" cy="18" r="1.3" fill="#8fe3ff" opacity="0.22"/></pattern>
  <pattern id="hudLinhas" width="8" height="4" patternUnits="userSpaceOnUse"><rect width="8" height="1.2" fill="#000" opacity="0.45"/></pattern>
  <linearGradient id="hudScan" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fe3ff" stop-opacity="0"/><stop offset="0.85" stop-color="#8fe3ff" stop-opacity="0.08"/><stop offset="1" stop-color="#8fe3ff" stop-opacity="0.35"/></linearGradient>`);

// cenário: fundo escuro + pontos; com `horizonte`, linha de horizonte brilhante e piso em
// perspectiva (agua: true deixa o piso azul, como superfície do mar). Ocupa -200..W+200.
const cenarioHud = (o) => {
  o = o || {};
  const hz = o.horizonte;
  let s = `<rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="url(#hudFundo)"/><rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="url(#hudPontos)"/>`;
  if (hz != null) {
    const vx = o.fuga ?? 540, cor = o.agua ? "#4cc9f0" : "#8fe3ff";
    s += `${o.agua ? `<rect x="-200" y="${hz}" width="${W + 400}" height="${H - hz + 200}" fill="url(#hudAgua)"/>` : ""}
      <ellipse cx="${vx}" cy="${hz}" rx="900" ry="140" fill="url(#hudBrilho)"/>
      <g class="pisoHud" stroke="${cor}" fill="none">
        ${Array.from({ length: 25 }, (_, k) => `<path d="M${vx} ${hz} L ${vx + (k - 12) * 260} ${H + 200}" stroke-opacity="${0.16 - Math.abs(k - 12) * 0.006}" stroke-width="1.5"/>`).join("")}
        ${Array.from({ length: 14 }, (_, k) => { const y = hz + 4 + Math.pow(k, 2.05) * 5.2; return `<path class="linhaPiso" d="M-200 ${y.toFixed(1)} H ${W + 200}" stroke-opacity="${(0.08 + k * 0.012).toFixed(3)}" stroke-width="1.5"/>`; }).join("")}</g>
      <path d="M-200 ${hz} H ${W + 200}" stroke="${cor}" stroke-width="3" opacity="0.85"/>`;
  }
  return s;
};

// sobreposição de interface (fora da câmera): linhas de varredura, faixa de scanner descendo,
// cantos de visor e leituras pequenas (canal, código de tempo correndo).
function hudOverlay(el, c, rotuloCanal) {
  el.insertAdjacentHTML("beforeend", `<g class="hudOv" pointer-events="none">
    <rect x="0" y="0" width="${W}" height="${H}" fill="url(#hudLinhas)" opacity="0.35"/>
    <rect class="hudScanBar" x="0" y="-180" width="${W}" height="180" fill="url(#hudScan)"/>
    <g stroke="#8fe3ff" stroke-width="3" fill="none" opacity="0.7">
      <path d="M40 372 V 330 H 82"/><path d="M1040 372 V 330 H 998"/><path d="M40 1306 V 1348 H 82"/><path d="M1040 1306 V 1348 H 998"/></g>

    <circle class="hudRec" cx="104" cy="1326" r="6" fill="${C.vermelho}"/>
    <text class="monol hudTc" x="120" y="1332" font-size="18" fill="#8fe3ff" opacity="0.75">00:00:00</text>
    <text class="monol" x="984" y="1332" font-size="18" fill="#8fe3ff" opacity="0.75" text-anchor="end">${rotuloCanal || "AF-LAB"}</text></g>`);
  const bar = $(".hudScanBar", el), tc = $(".hudTc", el), rec = $(".hudRec", el);
  tl.fromTo(bar, { y: 0 }, { y: H + 180, duration: 3.6, repeat: Math.max(0, Math.ceil((c.fim - c.ini + 1) / 3.6)), ease: "none", immediateRender: false }, c.ini - 0.5);
  aCadaQuadro((t) => {
    if (t < c.ini - 0.6 || t > c.fim + 0.6) return;
    const f = Math.floor(t * 30) % 30, s = Math.floor(t) % 60, m = Math.floor(t / 60);
    tc.textContent = `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}:${String(f).padStart(2, "0")}`;
    rec.setAttribute("opacity", Math.floor(t * 2) % 2 ? 0.25 : 1);
  });
}

// rótulo de interface: caixa escura com borda, barra de destaque, cantoneiras e (opcional) linha de dados
const tagLargura = (txt, tam) => txt.length * ((tam || 34) * 0.6 + 2) + 64;
const tag = (txt, cor, tam, sub) => {
  tam = tam || 34; cor = cor || C.ciano;
  const w = tagLargura(txt, tam), h = Math.round(tam * 1.7), x = -w / 2, y = -h / 2, k = 12;
  return `<rect class="tagCaixa" x="${x}" y="${y}" width="${w}" height="${h}" fill="rgba(4,10,28,0.82)" stroke="${cor}" stroke-opacity="0.55" stroke-width="2"/>
    <rect x="${x}" y="${y}" width="7" height="${h}" fill="${cor}"/>
    <path d="M${x - 6} ${y + k} V ${y - 6} H ${x + k} M${-x + 6} ${y + k} V ${y - 6} H ${-x - k} M${x - 6} ${-y - k} V ${-y + 6} H ${x + k} M${-x + 6} ${-y - k} V ${-y + 6} H ${-x - k}" stroke="${cor}" stroke-width="3" fill="none"/>
    <text class="mono" x="4" y="${(tam * 0.36).toFixed(1)}" text-anchor="middle" font-size="${tam}" fill="${cor}">${txt}</text>
    ${sub ? `<text class="monol" x="${x}" y="${-y + 30}" font-size="20" fill="${cor}" opacity="0.85">${sub}</text>` : ""}`;
};
// número grande de painel (para contador): <text class="mono ..."> já com contorno escuro
const numeroHud = (cls, tam, cor, ini) => `<text class="mono ${cls}" y="0" text-anchor="middle" font-size="${tam}" fill="${cor || C.ciano}" stroke="rgba(2,6,16,0.9)" stroke-width="10" paint-order="stroke">${ini ?? "0"}</text>`;
// linha de medida (cota) de (x0,y0) a (x1,y1), com marcas nas pontas e texto no meio
const cota = (x0, y0, x1, y1, txt, cor, cls) => {
  cor = cor || C.ciano;
  const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a) * 16, ny = Math.cos(a) * 16, mx = (x0 + x1) / 2, my = (y0 + y1) / 2;
  return `<g class="${cls || "cota"}"><path class="cotaL" d="M${x0} ${y0} L ${x1} ${y1} M${x0 - nx} ${y0 - ny} L ${x0 + nx} ${y0 + ny} M${x1 - nx} ${y1 - ny} L ${x1 + nx} ${y1 + ny}" stroke="${cor}" stroke-width="2.5" fill="none"/>
    <g transform="translate(${mx} ${my}) rotate(${(a * 180 / Math.PI).toFixed(1)})"><rect x="${-txt.length * 8 - 14}" y="-17" width="${txt.length * 16 + 28}" height="34" fill="#050b1e"/><text class="mono" y="8" text-anchor="middle" font-size="22" fill="${cor}">${txt}</text></g></g>`;
};
// mira de alvo (raio r): círculo, marcas e anel tracejado que gira (classe .miraAnel)
const mira = (r, cor) => { cor = cor || C.vermelho; return `<circle r="${r}" fill="none" stroke="${cor}" stroke-width="3"/>
  <circle class="miraAnel" r="${r + 16}" fill="none" stroke="${cor}" stroke-width="2" stroke-dasharray="14 10" opacity="0.8"/>
  <path d="M${-r - 30} 0 H ${-r + 10} M${r - 10} 0 H ${r + 30} M0 ${-r - 30} V ${-r + 10} M0 ${r - 10} V ${r + 30}" stroke="${cor}" stroke-width="3"/><circle r="4" fill="${cor}"/>`; };
// painel de leitura: linhas [rótulo, valor]
const painelHud = (linhas, cor, larg) => { cor = cor || C.ciano; larg = larg || 380; const h = 26 + linhas.length * 38;
  return `<rect class="tagCaixa" x="0" y="0" width="${larg}" height="${h}" fill="rgba(4,10,28,0.82)" stroke="${cor}" stroke-opacity="0.55" stroke-width="2"/><rect x="0" y="0" width="${larg}" height="5" fill="${cor}"/>
    ${linhas.map(([a, b], k) => `<text class="monol" x="18" y="${44 + k * 38}" font-size="21" fill="${cor}" opacity="0.8">${a}</text><text class="mono" x="${larg - 18}" y="${44 + k * 38}" font-size="23" fill="#fff" text-anchor="end">${b}</text>`).join("")}`; };
