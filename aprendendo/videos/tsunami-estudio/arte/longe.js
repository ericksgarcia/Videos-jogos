// planos distantes: nuvens cúmulo no horizonte (silhueta violeta, borda acesa pelo sol) e ilha com farol,
// com perspectiva atmosférica (cores puxadas para o céu, contraste baixo)
const nuvem = (E, seed, w, h) => { // cúmulo: bolhas redondas de tamanhos variados sobre uma base reta
  const R = E.prng(seed); let d = "";
  const n = 9; for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, r = h * (0.22 + 0.4 * Math.sin(Math.PI * u) * (0.7 + R() * 0.5)), x = u * w, y = h - r * 1.02;
    d += `M${(x - r).toFixed(1)} ${y.toFixed(1)} a ${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0 a ${r.toFixed(1)} ${r.toFixed(1)} 0 1 0 ${(-2 * r).toFixed(1)} 0 Z `; }
  return d + `M${w * 0.03} ${h * 0.72} H ${w * 0.97} V ${h} H ${w * 0.03} Z`;
};
module.exports = [
  ...[[1, 620, 170], [2, 480, 140], [3, 760, 200]].map(([seed, w, h]) => ({
    nome: `nuvem${seed}`, largura: w + 40, altura: h + 40, escala: 1.5,
    svg: (E) => { const d = nuvem(E, seed, w, h);
      return `<g transform="translate(20 20)">${E.forma(d, "#5a3a7e", { sombra: [0, 0.3, 0, 1], corSombra: "#2a1f55", forcaSombra: 0.9, luz: [1, 0, 0.35, 0.6], corLuz: "#ffb48a", forcaLuz: 0.95, grao: "graoM" })}
        <path d="${d}" fill="${E.degrade("#ffd2a0", 0.5, 0, 0, 0, 0, 0.35)}" filter="url(#graoF)"/></g>${E.extra}`; },
  })),
  {
    nome: "ilha", largura: 520, altura: 260, escala: 1.5,
    svg: (E) => {
      const base = 250, d = `M0 ${base} L 40 ${base - 40} L 120 ${base - 90} Q 170 ${base - 120} 220 ${base - 112} L 300 ${base - 80} L 380 ${base - 60} L 470 ${base - 20} L 520 ${base} Z`;
      let s = E.forma(d, "#4a3470", { sombra: [0, 0, 1, 0], corSombra: "#2a2050", forcaSombra: 0.7, luz: [1, 0, 0.5, 0.3], corLuz: "#c87a8a", forcaLuz: 0.8, grao: "graoM" });
      s += E.forma(`M300 ${base} L 330 ${base - 50} L 420 ${base - 40} L 520 ${base} Z`, "#3a2a62", { grao: "graoM", luz: [1, 0, 0.5, 0], corLuz: "#b06a80" });
      // farol
      s += `<g transform="translate(170 ${base - 116})">${E.forma("M-9 0 L -5 -62 H 5 L 9 0 Z", "#e8dfe8", { sombra: [0, 0, 1, 0], corSombra: "#6a5a8a", grao: "graoFF", papel: false })}
        <rect x="-7" y="-42" width="14" height="9" fill="#c94060"/><rect x="-7" y="-22" width="14" height="9" fill="#c94060"/>
        <rect x="-8" y="-74" width="16" height="12" fill="#ffe9b0"/><path d="M-10 -74 H 10 L 0 -84 Z" fill="#3a2a62"/>
        <circle cx="0" cy="-68" r="26" fill="#ffe0a0" opacity="0.5" filter="url(#d8)"/></g>`;
      // névoa atmosférica embaixo
      s += `<rect y="${base - 70}" width="520" height="70" fill="${E.degrade("#e09a90", 0, 0.6)}" filter="url(#graoM)"/>`;
      return `<g filter="url(#papel)">${s}</g>${E.extra}`;
    },
  },
];
