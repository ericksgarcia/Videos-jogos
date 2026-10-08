// Kit de estúdio para as ilustrações pintadas por motor/pintar.cjs (arte de videos/<tema>/arte/*.js).
// Técnicas de ilustração editorial "premium" (Kurzgesagt, TED-Ed, estúdios de motion):
// - sombreamento granulado (grain shading): sombras e luzes em pontilhado, não em degradê liso;
// - textura de papel/ruído em cima das áreas chapadas (tira o aspecto "vetor de computador");
// - luz de contorno (rim light) na borda que encara a luz; oclusão nos cantos e no contato;
// - perspectiva atmosférica: o que está longe fica mais claro, menos saturado e na cor do céu;
// - brilho (bloom) em luzes e desfoque de profundidade, calculados uma vez aqui.
let _id = 0;
const uid = (p) => `${p || "e"}${++_id}`;
const prng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const mix = (hex, k) => { // k > 0 clareia, k < 0 escurece
  const n = parseInt(hex.slice(1), 16), c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)));
  return "#" + c.map((v) => Math.max(0, Math.min(255, v)).toString(16).padStart(2, "0")).join("");
};
const lerp = (a, b, u) => { // mistura duas cores
  const p = (h) => { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const A = p(a), B = p(b);
  return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * u).toString(16).padStart(2, "0")).join("");
};

// grão: o alfa do desenho vira pontilhado (limiar contra ruído). Desenhe uma forma com degradê de
// opacidade e filter="url(#grao)": onde é opaco fica cheio, onde some vira pontos cada vez mais raros.
const grao = (id, freq, seed) => `<filter id="${id}" x="-5%" y="-5%" width="110%" height="110%" color-interpolation-filters="sRGB">
  <feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" result="n"/>
  <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.2 0 0 0 -0.6" result="na"/>
  <feComposite in="SourceAlpha" in2="na" operator="arithmetic" k2="6" k3="-6" result="d"/>
  <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 60 0" result="cheio"/>
  <feComposite in="cheio" in2="d" operator="in"/></filter>`;
const defs = `
  ${grao("grao", 0.9, 3)}${grao("graoF", 1.7, 4)}${grao("graoFF", 2.6, 6)}${grao("graoM", 0.55, 5)}${grao("graoG", 0.32, 8)}
  <filter id="papel" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">
    <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" seed="11" result="n"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -0.5 0.32" result="claro"/>
    <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 -0.2" result="escuro"/>
    <feComposite in="claro" in2="SourceAlpha" operator="in" result="c2"/><feComposite in="escuro" in2="SourceAlpha" operator="in" result="e2"/>
    <feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="c2"/><feMergeNode in="e2"/></feMerge></filter>
  ${[2, 4, 8, 14, 24, 40, 70].map((d) => `<filter id="d${d}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${d}"/></filter>`).join("")}
  <filter id="brilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="6" result="b1"/><feGaussianBlur in="SourceGraphic" stdDeviation="22" result="b2"/>
    <feMerge><feMergeNode in="b2"/><feMergeNode in="b1"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;

// degradê linear de opacidade numa cor (para usar com grão): de (x1,y1) a (x2,y2) em fração da caixa
let extra = "";
const degrade = (cor, o1, o2, x1 = 0, y1 = 0, x2 = 0, y2 = 1, unid) => {
  const id = uid("g");
  extra += `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${unid ? ` gradientUnits="userSpaceOnUse"` : ""}><stop offset="0" stop-color="${cor}" stop-opacity="${o1}"/><stop offset="1" stop-color="${cor}" stop-opacity="${o2}"/></linearGradient>`;
  return `url(#${id})`;
};
const degradeCores = (paradas, x1 = 0, y1 = 0, x2 = 0, y2 = 1, unid) => {
  const id = uid("g");
  extra += `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"${unid ? ` gradientUnits="userSpaceOnUse"` : ""}>${paradas.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join("")}</linearGradient>`;
  return `url(#${id})`;
};
const radial = (paradas, cx = 0.5, cy = 0.5, r = 0.5, unid) => {
  const id = uid("r");
  extra += `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${unid ? ` gradientUnits="userSpaceOnUse"` : ""}>${paradas.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a ?? 1}"/>`).join("")}</radialGradient>`;
  return `url(#${id})`;
};
// sombreia uma forma: base chapada + sombra granulada + luz granulada (+ papel) — o "volume" editorial
// d = path; luz/sombra = [x1,y1,x2,y2] em fração da caixa (direção do degradê)
const forma = (d, cor, o = {}) => {
  const cp = uid("c");
  const som = o.sombra ?? [0, 0.35, 0, 1], luz = o.luz ?? [0, 0, 0, 0.45];
  return `<clipPath id="${cp}"><path d="${d}"/></clipPath><g clip-path="url(#${cp})">
    <path d="${d}" fill="${cor}"${o.papel === false ? "" : ` filter="url(#papel)"`}/>
    <path d="${d}" fill="${degrade(o.corSombra || mix(cor, -0.55), 0, o.forcaSombra ?? 0.9, ...som)}" filter="url(#${o.grao || "grao"})"/>
    <path d="${d}" fill="${degrade(o.corLuz || mix(cor, 0.45), o.forcaLuz ?? 0.75, 0, ...luz)}" filter="url(#${o.grao || "grao"})"/>
  </g>${o.contorno ? `<path d="${d}" fill="none" stroke="${o.contorno}" stroke-width="${o.espContorno || 1.5}" clip-path="url(#${cp})"/>` : ""}`;
};
// retângulo como path
const ret = (x, y, w, h, r = 0) => r ? `M${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z` : `M${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
module.exports = { defs, uid, prng, mix, lerp, degrade, degradeCores, radial, forma, ret, get extra() { const e = extra; extra = ""; return `<defs>${e}</defs>`; } };
