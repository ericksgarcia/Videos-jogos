// detalhe para o zoom: xícara de café sobre o painel da ponte, com a superfície do café parada (reflexo
// perfeito da janela) — "ninguém a bordo percebe nada". Fundo: o painel e a janela com o pôr do sol.
module.exports = {
  largura: 600, altura: 600, escala: 2,
  svg: (E) => {
    let s = `<rect width="600" height="600" fill="${E.degradeCores([[0, "#2a1f55"], [0.45, "#a0476e"], [0.62, "#f08a5c"], [0.64, "#3a2e5e"], [1, "#1a1530"]])}"/>`;
    // janela: céu do pôr do sol e o mar lá fora, com o horizonte
    s += `<rect x="40" y="40" width="520" height="330" rx="10" fill="${E.degradeCores([[0, "#2c2366"], [0.55, "#b4527a"], [0.82, "#ffb07a"], [0.83, "#5a4a8a"], [1, "#2f3f7a"]])}"/>`;
    s += `<rect x="40" y="40" width="520" height="330" rx="10" fill="${E.degrade("#ffd7a0", 0, 0.5, 0, 0.3, 0, 0.82)}" filter="url(#graoF)"/>`;
    s += `<circle cx="420" cy="300" r="34" fill="#fff0cc"/><circle cx="420" cy="300" r="90" fill="#ffd9a0" opacity="0.35" filter="url(#d24)"/>`;
    s += `<path d="M300 40 V 370" stroke="#151230" stroke-width="16"/><rect x="40" y="40" width="520" height="330" rx="10" fill="none" stroke="#151230" stroke-width="22"/>`;
    // painel
    s += E.forma("M0 400 L 600 400 L 600 600 L 0 600 Z", "#2a2448", { luz: [0, 0, 0, 0.35], corLuz: "#ff9f7a", forcaLuz: 0.8, grao: "graoF" });
    s += `<rect x="0" y="396" width="600" height="8" fill="#ffb27a" opacity="0.9"/>`;
    [[70, 470, "#06d6a0"], [110, 470, "#ffd23f"], [150, 470, "#ef476f"]].forEach(([x, y, c]) => { s += `<circle cx="${x}" cy="${y}" r="9" fill="${c}"/><circle cx="${x}" cy="${y}" r="20" fill="${c}" opacity="0.4" filter="url(#d8)"/>`; });
    s += `<rect x="430" y="440" width="130" height="80" rx="8" fill="#0d1a2e"/><path d="M440 495 l 20 -14 l 18 8 l 24 -22 l 20 10 l 18 -6" stroke="#4cc9f0" stroke-width="3" fill="none"/><path d="M440 480 H 550" stroke="#4cc9f0" stroke-width="1" opacity="0.4"/>`;
    // xícara
    s += `<ellipse cx="300" cy="512" rx="120" ry="20" fill="#120c24" opacity="0.6" filter="url(#d8)"/>`;
    s += E.forma("M215 400 L 385 400 L 372 492 Q 368 512 340 512 L 260 512 Q 232 512 228 492 Z", "#efe8f2", { sombra: [1, 0, 0, 0], corSombra: "#5a4a7a", forcaSombra: 0.7, luz: [1, 0, 0.6, 0], corLuz: "#ffd0a8", forcaLuz: 0.9, grao: "graoF", papel: false });
    s += `<path d="M383 420 Q 430 420 428 452 Q 426 482 376 480" fill="none" stroke="#e2d8e8" stroke-width="14"/><path d="M383 420 Q 430 420 428 452" fill="none" stroke="#ffd0a8" stroke-width="4"/>`;
    s += `<rect x="248" y="440" width="104" height="22" rx="4" fill="${"#ffd23f"}" opacity="0.9"/><text x="300" y="456" text-anchor="middle" font-family="Nunito" font-weight="900" font-size="14" fill="#2a1f55">PACIFIC STAR</text>`;
    // café: elipse perfeita, reflexo nítido da janela (parado)
    s += `<ellipse cx="300" cy="400" rx="85" ry="16" fill="#3b2216"/><ellipse cx="300" cy="400" rx="85" ry="16" fill="${E.degrade("#8a5a3a", 0.8, 0, 1, 0, 0, 0)}"/>
      <path d="M248 396 h 40 M310 397 h 30" stroke="#ffcf9a" stroke-width="2.5" opacity="0.8" stroke-linecap="round"/><ellipse cx="300" cy="400" rx="86" ry="17" fill="none" stroke="#fff" stroke-width="2.5"/>`;
    return `<g filter="url(#papel)">${s}</g>${E.extra}`;
  },
};
