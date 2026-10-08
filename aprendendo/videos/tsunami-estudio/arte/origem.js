// Cena 2 — corte do fundo do oceano à noite: coluna d'água (abismo), placas tectônicas em camadas e o
// manto aceso. Peças separadas para animar: a placa continental entorta e solta; a oceânica mergulha.
const estratos = (E, w, h, cores, seed, ondula) => { // faixas de rocha onduladas, cada uma com grão e luz no topo
  const R = E.prng(seed); let s = "", y = 0;
  cores.forEach(([c, esp], k) => {
    const y1 = y + esp * h, f = R() * 10;
    let d = `M0 ${y.toFixed(1)}`; for (let x = 0; x <= w; x += 25) d += ` L${x} ${(y + Math.sin(x / 90 + f) * ondula * (k ? 1 : 0.3)).toFixed(1)}`;
    d += ` L${w} ${h} L0 ${h} Z`;
    s += E.forma(d, c, { luz: [0, 0, 0, 0.12], corLuz: E.mix(c, 0.5), forcaLuz: 0.85, sombra: [0, 0.6, 0, 1], forcaSombra: 0.5, grao: "graoF" });
    y = y1;
  });
  return s;
};
module.exports = [
  {
    nome: "abismo", largura: 1680, altura: 1300, escala: 1.25,
    svg: (E) => {
      const R = E.prng(71), W = 1680, H = 1300;
      let s = `<rect width="${W}" height="${H}" fill="${E.degradeCores([[0, "#3d4a8e"], [0.06, "#22407a"], [0.3, "#132a5a"], [0.65, "#0a1838"], [1, "#050c22"]])}"/>`;
      [[0.05, "#6a6ab0"], [0.2, "#2a5a98"], [0.5, "#0e2048"], [0.85, "#040a1e"]].forEach(([o, c]) => {
        s += `<rect y="${o * H - 90}" width="${W}" height="180" fill="${E.degradeCores([[0, c, 0], [0.5, c, 0.65], [1, c, 0]])}" filter="url(#graoG)" opacity="0.6"/>`; });
      for (let k = 0; k < 9; k++) { const x = 100 + k * 180 + R() * 60, w = 30 + R() * 60, inc = (x - 1100) * 0.25, len = 500 + R() * 300;
        s += `<path d="M${x} 0 L ${x + w} 0 L ${x + w + inc + 90} ${len} L ${x + inc - 30} ${len} Z" fill="${E.degrade("#a8c8ff", 0.2, 0)}" filter="url(#d14)"/>`; }
      for (let k = 0; k < 380; k++) { const x = R() * W, y = R() * H, r = 0.7 + R() * 1.7;
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#cfe4ff" opacity="${(0.12 + R() * 0.4).toFixed(2)}"/>`; }
      for (let k = 0; k < 30; k++) { const x = R() * W, y = 200 + R() * (H - 250), r = 6 + R() * 18;
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#9fd0ff" opacity="${(0.05 + R() * 0.08).toFixed(2)}" filter="url(#d4)"/>`; }
      // águas-vivas bioluminescentes (silhueta translúcida + pontos acesos)
      [[260, 640, 1], [1320, 820, 0.8], [900, 1010, 0.6]].forEach(([x, y, e]) => {
        s += `<g transform="translate(${x} ${y}) scale(${e})"><path d="M-40 0 Q -40 -46 0 -48 Q 40 -46 40 0 Q 20 8 0 4 Q -20 8 -40 0 Z" fill="#7ad8ff" opacity="0.22"/>
          <path d="M-40 0 Q -40 -46 0 -48 Q 40 -46 40 0" fill="none" stroke="#bff0ff" stroke-width="2" opacity="0.7"/>
          ${[-28, -14, 0, 14, 28].map((tx, k) => `<path d="M${tx} 2 q ${6 - k * 3} 40 ${-4 + k * 2} 90" stroke="#9fe6ff" stroke-width="1.6" fill="none" opacity="0.5"/>`).join("")}
          <circle r="60" fill="#5ad0ff" opacity="0.18" filter="url(#d24)"/>${[-20, 0, 20].map((tx) => `<circle cx="${tx}" cy="-22" r="3" fill="#dffaff"/>`).join("")}</g>`; });
      return `<g filter="url(#papel)">${s}</g>${E.extra}`;
    },
  },
  {
    nome: "manto", largura: 1680, altura: 700, escala: 1.25,
    svg: (E) => {
      let s = `<rect width="1680" height="700" fill="${E.degradeCores([[0, "#3a0f1a"], [0.25, "#8a2414"], [0.6, "#d4561c"], [1, "#ffb23a"]])}"/>`;
      // convecção: veios de magma girando (turbulência deslocada) + brilho
      s += `<rect width="1680" height="700" fill="#ffcf6a" filter="url(#veios)" opacity="0.3"/>`;
      s += `<rect width="1680" height="700" fill="${E.degrade("#2a0810", 0.9, 0, 0, 0, 0, 0.5)}" filter="url(#graoM)"/>`;
      s += `<rect y="300" width="1680" height="400" fill="${E.degrade("#ffd86a", 0, 0.5)}" filter="url(#graoG)"/>`;
      return `<defs><filter id="veios" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency="0.004 0.012" numOctaves="3" seed="9"/>
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -7 0 0 0 1.1"/></filter></defs><g filter="url(#papel)">${s}</g>${E.extra}`;
    },
  },
  {
    // placa oceânica: basalto escuro com sedimento fino em cima (desenhada na horizontal; a cena inclina)
    nome: "placaO", largura: 1300, altura: 300, escala: 1.25,
    svg: (E) => {
      const w = 1300, h = 300;
      let s = estratos(E, w, h, [["#8a7a6a", 0.06], ["#3a4a6a", 0.25], ["#2a3554", 0.35], ["#1e2742", 0.34]], 3, 5);
      // basalto em almofadas: elipses na faixa do meio
      const R = E.prng(5);
      for (let k = 0; k < 70; k++) { const x = R() * w, y = 40 + R() * 70;
        s += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(14 + R() * 18).toFixed(0)}" ry="${(7 + R() * 7).toFixed(0)}" fill="none" stroke="#5a6a8e" stroke-width="1.6" opacity="0.6"/>`; }
      // ponta arredondada que mergulha (lado direito) e borda acesa pelo manto embaixo
      return `<clipPath id="pO"><path d="M0 0 H ${w - 60} Q ${w} 0 ${w} 80 V ${h - 60} Q ${w} ${h} ${w - 80} ${h} H 0 Z"/></clipPath>
        <g clip-path="url(#pO)" filter="url(#papel)">${s}<rect y="${h - 70}" width="${w}" height="70" fill="${E.degrade("#ff7a3a", 0, 0.75)}" filter="url(#graoF)"/></g>
        <path d="M0 ${h - 1} H ${w - 80} Q ${w} ${h} ${w} ${h - 60}" fill="none" stroke="#ffb05a" stroke-width="4"/>${E.extra}`;
    },
  },
  {
    // placa continental: crosta grossa em estratos (sedimento claro, arenito, granito rosado), com o
    // fundo do mar em cima subindo para a plataforma; a ponta esquerda é a que entorta
    nome: "placaC", largura: 1000, altura: 520, escala: 1.25,
    svg: (E) => {
      const w = 1000, h = 520;
      const topo = `M0 60 Q 200 50 420 40 Q 650 20 820 -10 L ${w} -30`;
      let s = estratos(E, w, h, [["#c9a87a", 0.07], ["#a07a5a", 0.12], ["#7a5a5a", 0.18], ["#9a6a6e", 0.25], ["#5a4058", 0.38]], 8, 9);
      const R = E.prng(9);
      for (let k = 0; k < 40; k++) { const x = R() * w, y = 300 + R() * 200; s += `<path d="M${x} ${y} l ${6 + R() * 10} ${-4 - R() * 8} l ${6 + R() * 8} ${6 + R() * 6}" fill="none" stroke="#c99aa8" stroke-width="1.4" opacity="0.5"/>`; }
      // rochas e morrinhos no fundo do mar
      for (let k = 0; k < 10; k++) { const x = 40 + k * 95 + R() * 40, y = 60 - x * 0.07, r = 10 + R() * 22;
        s += E.forma(`M${x - r} ${y + 4} Q ${x - r * 0.8} ${y - r * 0.7} ${x} ${y - r * 0.8} Q ${x + r * 0.8} ${y - r * 0.7} ${x + r} ${y + 4} Z`, "#5a5a7e", { luz: [0, 0, 0.4, 0.5], corLuz: "#9ab0e0", grao: "graoFF" }); }
      return `<clipPath id="pC"><path d="M0 52 Q 200 46 420 40 Q 650 20 820 -6 L ${w} -24 V ${h} L 560 ${h} Q 300 300 40 80 Z" transform="translate(0 40)"/></clipPath>
        <g transform="translate(0 40)"><g clip-path="url(#pC)" filter="url(#papel)" transform="translate(0 -40)">${s}</g></g>
        <path d="M0 92 Q 200 86 420 80 Q 650 60 820 34 L ${w} 16" fill="none" stroke="#9fc0ff" stroke-width="3" opacity="0.7"/>${E.extra}`;
    },
  },
];
