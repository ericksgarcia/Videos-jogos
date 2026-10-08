// porta-contêineres ao pôr do sol (sol baixo à direita, atrás da proa): faces de cima e da direita com luz
// quente de contorno, lado esquerdo e casco em sombra fria; janelas acesas com brilho. Linha d'água em y=0
// (na imagem: x 0..680, linha d'água em y 300 → origem em (340, 300)).
module.exports = {
  largura: 680, altura: 360, escala: 3,
  svg: (E) => {
    const R = E.prng(11), RIM = "#ffb27a", RIM2 = "#ffd9a8", FRIO = "#2a2a5e";
    let s = "";
    // reflexo e sombra na água (some sob a água animada, mas ajuda a "assentar")
    // ---- chaminé
    s += E.forma("M-300 -40 V -186 Q -300 -196 -290 -196 H -268 V -40 Z", "#c9c0d6", { grao: "graoF", papel: false, sombra: [1, 0, 0, 0], forcaSombra: 0.5, luz: [1, 0, 0.4, 0] });
    s += `<rect x="-300" y="-160" width="32" height="16" fill="#e9a23b"/><rect x="-300" y="-160" width="32" height="16" fill="${E.degrade("#5a2a3a", 0.7, 0, 0, 0, 1, 0)}" filter="url(#grao)"/>`;
    s += `<rect x="-302" y="-200" width="36" height="12" fill="#1a1a30"/><path d="M-268 -196 V -40" stroke="${RIM}" stroke-width="2" opacity="0.8"/>`;
    // fumaça leve
    s += `<g opacity="0.35" filter="url(#d8)">${[0, 1, 2, 3].map((k) => `<circle cx="${-300 - k * 34}" cy="${-215 - k * 18}" r="${14 + k * 9}" fill="#d9b8c8"/>`).join("")}</g>`;
    // ---- casco
    const casco = "M-300 -44 L 252 -44 Q 290 -48 312 -74 L 322 -74 L 308 -24 Q 296 10 270 30 L -270 30 Q -296 22 -300 -2 Z";
    s += E.forma(casco, "#283466", { sombra: [0, 0.2, 0, 1], forcaSombra: 0.9, luz: [1, 0, 0.55, 0], corLuz: "#8a5a8a", forcaLuz: 0.7, grao: "graoF" });
    // faixa vermelha (antiincrustante) e linha branca de calado
    s += E.forma("M-299 0 L 300 0 Q 292 14 270 30 L -270 30 Q -294 22 -299 0 Z", "#a33a4a", { sombra: [0, 0, 0, 1], corSombra: "#3a1020", grao: "graoF" });
    s += `<path d="M-299 -1 H 300" stroke="#e8d8d0" stroke-width="2.2" opacity="0.8"/>`;
    // chapas do casco: costuras verticais e horizontais
    for (let k = 0; k < 20; k++) s += `<path d="M${-282 + k * 29} -40 V -2" stroke="#141a3a" stroke-width="0.9" opacity="0.6"/>`;
    s += `<path d="M-300 -22 H 304" stroke="#141a3a" stroke-width="0.9" opacity="0.5"/><path d="M-300 -30 H 300" stroke="#6a5a8a" stroke-width="0.6" opacity="0.4"/>`;
    // luz de contorno no costado (borda de cima e proa encaram o sol)
    s += `<path d="M-300 -44 L 252 -44 Q 290 -48 312 -74 L 322 -74 L 308 -24" fill="none" stroke="${RIM}" stroke-width="2.6"/>`;
    s += `<path d="M322 -74 L 308 -24 Q 296 10 270 30" fill="none" stroke="${RIM2}" stroke-width="3.5" opacity="0.9" filter="url(#d2)"/>`;
    // vigias da proa, âncora, nome, marcas de calado
    s += `<g transform="translate(286 -32)"><circle r="7" fill="#11152e"/><circle r="7" fill="none" stroke="${RIM}" stroke-width="1.2"/><path d="M0 -2 V 14 M-7 9 Q 0 17 7 9 M-4 1 H 4" stroke="#b9b0c8" stroke-width="2" fill="none"/></g>`;
    s += `<text x="150" y="-24" font-family="Nunito" font-weight="900" font-size="12" fill="#e8dcd8" letter-spacing="2" opacity="0.9">PACIFIC STAR</text>`;
    for (let k = 0; k < 5; k++) s += `<path d="M300 ${-6 - k * 8} h -7" stroke="#e8dcd8" stroke-width="1.4"/><text x="282" y="${-3 - k * 8}" font-family="Nunito" font-weight="800" font-size="5" fill="#e8dcd8">${k * 2 + 2}</text>`;
    // balaustrada de proa
    s += `<path d="M196 -54 Q 268 -58 316 -86" fill="none" stroke="${RIM2}" stroke-width="1.4"/>${Array.from({ length: 9 }, (_, k) => `<path d="M${200 + k * 13} ${-45 - k * 3.4} v -10" stroke="#d9c8d8" stroke-width="1.1"/>`).join("")}`;
    // ---- tampas de porão e contêineres
    s += `<rect x="-196" y="-50" width="452" height="6" fill="#6a6478"/><rect x="-196" y="-50" width="452" height="2" fill="${RIM}" opacity="0.8"/>`;
    const pal = ["#c25a4a", "#2f5a9a", "#d7bf93", "#3a8a86", "#e6ddd0", "#dca944", "#878fa6", "#9c3f58", "#5577b0", "#4f9a6a"];
    const alt = [2, 3, 4, 4, 3, 5, 4, 4, 5, 4, 4, 3, 3, 2];
    for (let b = 0; b < 14; b++) {
      const x = -192 + b * 32;
      for (let k = 0; k < alt[b]; k++) {
        const y = -50 - (k + 1) * 21.5, cor = E.lerp(pal[Math.floor(R() * pal.length)], "#5a3a7a", 0.18), w = 31, h = 21;
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${cor}"/>`;
        // corrugado
        for (let q = 2; q < w - 1; q += 3) s += `<path d="M${x + q} ${y + 1.5} V ${y + h - 1.5}" stroke="#000" stroke-width="0.9" opacity="0.18"/><path d="M${x + q + 1.2} ${y + 1.5} V ${y + h - 1.5}" stroke="#fff" stroke-width="0.5" opacity="0.12"/>`;
        // sombra granulada de baixo e da esquerda (oclusão), luz do sol no topo e no lado direito
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${E.degrade("#1a1035", 0, 0.6, 0, 0.3, 0, 1)}" filter="url(#graoFF)"/>`;
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${E.degrade(RIM, 0.5, 0, 1, 0, 0.4, 0)}" filter="url(#graoFF)"/>`;
        s += `<rect x="${x}" y="${y}" width="${w}" height="1.8" fill="${E.lerp(cor, RIM2, 0.6)}"/><rect x="${x + w - 2}" y="${y}" width="2" height="${h}" fill="${E.lerp(cor, RIM, 0.5)}"/>`;
        s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#120c24" stroke-width="0.6" opacity="0.7"/>`;
        // marcas: portas numa ponta, código pequeno
        if (R() < 0.15) s += `<text x="${x + 4}" y="${y + 9}" font-family="Nunito" font-weight="900" font-size="3.6" fill="#fff" opacity="0.55">${["MSKU", "TGHU", "CMAU", "OOLU"][Math.floor(R() * 4)]} ${Math.floor(R() * 9e5)}</text>`;
      }
      // peação (barras cruzadas) entre baias
      const top = -50 - alt[b] * 21.5;
      if (b % 2 === 1) s += `<path d="M${x - 1} -50 L ${x + 6} -92 M${x - 1} -50 L ${x - 8} -92" stroke="#c9bfd0" stroke-width="0.8" opacity="0.7"/>`;
      s += `<path d="M${x - 0.5} -50 V ${top - 3}" stroke="#1a1430" stroke-width="1"/>`;
    }
    // ---- superestrutura (na popa): conveses, janelas acesas
    for (let k = 0; k < 6; k++) {
      const y = -66 - k * 22, x = -276, w = 72 - k;
      s += E.forma(E.ret(x, y, w, 22), "#d8d0e4", { sombra: [1, 0, 0, 0], forcaSombra: 0.65, corSombra: FRIO, luz: [1, 0, 0.5, 0], corLuz: "#ffd2a8", forcaLuz: 0.9, papel: false, grao: "graoF", forcaSombra: 0.5 });
      s += `<rect x="${x}" y="${y + 18}" width="${w}" height="4" fill="#5a5078"/><rect x="${x}" y="${y}" width="${w}" height="1.5" fill="${RIM2}"/>`;
      for (let j = 0; j < 6; j++) { const acesa = R() < 0.6;
        s += `<rect x="${x + 4 + j * 11.5}" y="${y + 6}" width="8" height="7" rx="1" fill="${acesa ? "#ffd88a" : "#262446"}"/>` + (acesa ? `<rect x="${x + 2 + j * 11.5}" y="${y + 4}" width="12" height="11" fill="#ffc46a" opacity="0.45" filter="url(#d4)"/>` : ""); }
    }
    s += `<rect x="-204" y="-198" width="14" height="148" fill="#b9b0cc"/><rect x="-192" y="-198" width="2" height="148" fill="${RIM}"/>`;
    // ponte de comando: mais larga, com asas e vidros inclinados
    s += E.forma("M-290 -200 H -186 V -176 H -290 Z", "#ece6f2", { sombra: [1, 0, 0, 0], corSombra: FRIO, forcaSombra: 0.6, luz: [1, 0, 0.4, 0], corLuz: "#ffd2a8", papel: false });
    s += `<path d="M-288 -195 H -188 L -190 -184 H -286 Z" fill="#1c1c3c"/>`;
    for (let k = 0; k < 14; k++) s += `<path d="M${-285 + k * 7} -195 l -1.5 11" stroke="#ece6f2" stroke-width="1.3"/>`;
    s += `<path d="M-288 -195 H -188" stroke="#ffc888" stroke-width="1" opacity="0.8"/><rect x="-286" y="-191" width="96" height="5" fill="#ffd88a" opacity="0.35" filter="url(#d2)"/>`;
    s += `<rect x="-296" y="-204" width="116" height="5" fill="#a69cbc"/><rect x="-296" y="-204" width="116" height="1.5" fill="${RIM2}"/>`;
    // mastro com radar, antenas, bandeira
    s += `<path d="M-246 -204 V -262 M-264 -240 H -228 M-246 -262 V -276 M-222 -204 V -236 M-214 -204 V -226" stroke="#d6cce0" stroke-width="2"/>`;
    s += `<rect x="-270" y="-252" width="48" height="5" rx="2.5" fill="#efe8f4"/><rect x="-270" y="-252" width="48" height="1.5" fill="${RIM2}"/><circle cx="-246" cy="-249" r="2" fill="#555"/>`;
    s += `<path d="M-264 -240 L -276 -236 L -264 -232 Z" fill="#ef476f"/>`;
    // baleeira laranja
    s += `<path d="M-206 -118 h 8 v -22 h -5" stroke="#c9bfd0" stroke-width="2" fill="none"/>` + E.forma(E.ret(-210, -118, 34, 13, 6.5), "#ff8a3d", { luz: [0, 0, 0, 0.6], corLuz: "#ffe0b0", papel: false });
    // mastro de proa
    s += `<path d="M304 -74 V -124 M296 -110 H 312" stroke="#d6cce0" stroke-width="2"/>`;
    // luzes de navegação com brilho
    [[-246, -278, "#fff3d0"], [304, -126, "#fff3d0"], [-184, -190, "#06d6a0"], [-292, -190, "#ef476f"], [-300, -190, "#fff3d0"]].forEach(([x, y, c]) => {
      s += `<circle cx="${x}" cy="${y}" r="16" fill="${c}" opacity="0.5" filter="url(#d8)"/><circle cx="${x}" cy="${y}" r="5" fill="${c}" filter="url(#d2)"/><circle cx="${x}" cy="${y}" r="2.2" fill="#fff"/>`; });
    return `<g transform="translate(340 300)">${s}</g>${E.extra}`;
  },
};
