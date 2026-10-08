// céu de fim de tarde: degradê pontilhado, sol baixo com brilho, estrelas, cirros iluminados por baixo
module.exports = {
  largura: 1500, altura: 1600,
  svg: (E) => {
    const R = E.prng(21), W = 1500, H = 1600, sx = 1030, sy = 1530;
    const faixas = [[0.0, "#0a0f2e"], [0.32, "#1b1a52"], [0.55, "#3b2470"], [0.72, "#7a3576"], [0.84, "#c4516a"], [0.93, "#ef8a5c"], [1, "#ffc77f"]];
    let s = `<rect width="${W}" height="${H}" fill="${E.degradeCores(faixas.map(([o, c]) => [o, c]))}"/>`;
    // pontilhado entre as faixas (o degradê "de estúdio" é granulado, não liso)
    faixas.slice(1).forEach(([o, c], k) => { const y = o * H, y0 = faixas[k][0] * H;
      s += `<rect x="0" y="${y0}" width="${W}" height="${y - y0 + 40}" fill="${E.degrade(c, 0, 0.85, 0, 0, 0, 1)}" filter="url(#graoG)" opacity="0.55"/>`; });
    // brilho do sol no céu
    s += `<circle cx="${sx}" cy="${sy}" r="900" fill="${E.radial([[0, "#ffd89a", 0.55], [0.35, "#ff9a6a", 0.25], [1, "#ff7a6a", 0]])}"/>`;
    s += `<circle cx="${sx}" cy="${sy}" r="520" fill="${E.radial([[0, "#ffe9b8", 0.9], [1, "#ffd08a", 0]])}" filter="url(#graoM)"/>`;
    // estrelas (só na parte escura)
    for (let k = 0; k < 140; k++) { const x = R() * W, y = Math.pow(R(), 1.6) * H * 0.5, r = 0.6 + R() * 1.6;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#fff" opacity="${(0.3 + R() * 0.6) * (1 - y / (H * 0.55))}"/>`; }
    for (let k = 0; k < 8; k++) { const x = R() * W, y = R() * H * 0.3;
      s += `<g opacity="${0.5 + R() * 0.4}"><circle cx="${x}" cy="${y}" r="7" fill="#cfe0ff" filter="url(#d4)"/><circle cx="${x}" cy="${y}" r="2.2" fill="#fff"/><path d="M${x - 12} ${y} H ${x + 12} M${x} ${y - 12} V ${y + 12}" stroke="#fff" stroke-width="0.8" opacity="0.6"/></g>`; }
    // cirros: véus finos e esgarçados, escuros por cima e acesos por baixo (o sol vem de baixo)
    for (let k = 0; k < 6; k++) {
      const y = 620 + k * 120 + R() * 50, x = R() * W - 400, w = 700 + R() * 600, u = (y - 600) / 900;
      for (let f = 0; f < 4; f++) { const yy = y + f * (7 + R() * 6), xx = x + R() * 120, ww = w * (0.5 + R() * 0.5), h = 4 + R() * 12;
        const d = `M${xx} ${yy} C ${xx + ww * 0.25} ${yy - h} ${xx + ww * 0.6} ${yy - h * 1.3} ${xx + ww} ${yy - h * 0.2} C ${xx + ww * 0.6} ${yy + h * 0.5} ${xx + ww * 0.3} ${yy + h * 0.4} ${xx} ${yy} Z`;
        s += `<path d="${d}" fill="${E.lerp("#3a2a6e", "#a04a78", u)}" opacity="0.7" filter="url(#d2)"/>`;
        s += `<path d="${d}" fill="${E.degrade(E.lerp("#ff9f7a", "#ffd39a", u), 0, 0.9)}" filter="url(#graoF)"/>`; }
    }
    // névoa no horizonte
    s += `<rect y="${H - 260}" width="${W}" height="260" fill="${E.degrade("#ffd6a0", 0, 0.55)}" filter="url(#graoM)"/>`;
    // sol: disco com halo e borda brilhante
    s += `<circle cx="${sx}" cy="${sy}" r="210" fill="#ffd9a0" opacity="0.35" filter="url(#d40)"/><circle cx="${sx}" cy="${sy}" r="118" fill="#ffefc8" filter="url(#d8)"/>
      <circle cx="${sx}" cy="${sy}" r="104" fill="#fff6dc"/><circle cx="${sx}" cy="${sy}" r="104" fill="${E.degrade("#ffc070", 0, 0.8)}" filter="url(#graoM)"/>`;
    return `<g filter="url(#papel)">${s}</g>${E.extra}`;
  },
};
