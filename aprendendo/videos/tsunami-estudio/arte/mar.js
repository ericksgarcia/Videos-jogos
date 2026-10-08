// o mar inteiro em corte, pintado uma vez: superfície refletindo o pôr do sol, coluna do sol cintilando,
// cáusticas perto da superfície, feixes de luz desfocados, neve marinha (partículas fora de foco) e o azul
// que escurece com a profundidade. A cena recorta esta imagem pela superfície que se mexe a cada quadro.
// Imagem: x 0..1500 (mundo -210..1290), y 0..1100 (mundo Y0-60 .. Y0+1040); superfície em y = 60.
module.exports = [
  {
    nome: "mar", largura: 1500, altura: 1100, escala: 1.5,
    svg: (E) => {
      const R = E.prng(33), W = 1500, H = 1100, S = 60, sx = 1030;
      let s = `<rect width="${W}" height="${H}" fill="${E.degradeCores([[0, "#6a4c92"], [0.07, "#3d4a8e"], [0.2, "#1f4a86"], [0.45, "#173a70"], [0.75, "#0f2550"], [1, "#081634"]])}"/>`;
      // faixas pontilhadas de profundidade
      [[0.04, "#c0709a"], [0.12, "#3a74b0"], [0.3, "#2a5e98"], [0.6, "#0a1a40"], [0.9, "#050d26"]].forEach(([o, c], k) => {
        s += `<rect y="${o * H - 70}" width="${W}" height="140" fill="${E.degradeCores([[0, c, 0], [0.5, c, 0.7], [1, c, 0]])}" filter="url(#graoG)" opacity="0.6"/>`; });
      // reflexo quente do céu na faixa de cima e coluna do sol
      s += `<rect y="0" width="${W}" height="140" fill="${E.degrade("#ff9a7a", 0.55, 0)}" filter="url(#graoM)"/>`;
      s += `<ellipse cx="${sx}" cy="${S + 30}" rx="240" ry="160" fill="${E.radial([[0, "#ffd8a0", 0.45], [1, "#ff9a7a", 0]])}" filter="url(#d14)"/>`;
      // cáusticas: rede de linhas claras ondulando, só perto da superfície
      s += `<g opacity="0.2" mask="url(#mk)"><rect width="${W}" height="420" filter="url(#caus)" fill="#fff"/></g>`;
      // feixes de luz (vêm do lado do sol, abrindo para baixo), desfocados
      for (let k = 0; k < 11; k++) {
        const x = 120 + k * 130 + R() * 60, w = 30 + R() * 70, inc = (x - sx) * 0.35, len = 650 + R() * 300;
        s += `<path d="M${x} ${S} L ${x + w} ${S} L ${x + w + inc + 120} ${S + len} L ${x + inc - 40} ${S + len} Z" fill="${E.degrade("#bfe6ff", 0.32, 0)}" filter="url(#d14)"/>`;
      }
      // neve marinha: partículas pequenas nítidas + algumas grandes desfocadas (bokeh)
      for (let k = 0; k < 260; k++) { const x = R() * W, y = S + 40 + R() * (H - 100), r = 0.8 + R() * 1.8;
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#d8ecff" opacity="${(0.15 + R() * 0.45) * (1 - y / H * 0.6)}"/>`; }
      for (let k = 0; k < 26; k++) { const x = R() * W, y = S + 80 + R() * 700, r = 6 + R() * 16;
        s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="#bfe0ff" opacity="${(0.06 + R() * 0.1).toFixed(2)}" filter="url(#d4)"/>`; }
      // vinheta de profundidade
      s += `<rect y="${H * 0.55}" width="${W}" height="${H * 0.45}" fill="${E.degrade("#030820", 0, 0.7)}"/>`;
      return `<defs><filter id="caus" x="0" y="0" width="100%" height="100%"><feTurbulence type="turbulence" baseFrequency="0.012 0.03" numOctaves="2" seed="4"/>
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  -9 0 0 0 1.25"/></filter>
          <linearGradient id="mkg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></linearGradient>
          <mask id="mk"><rect y="${S}" width="${W}" height="260" fill="url(#mkg)"/></mask></defs><g filter="url(#papel)">${s}</g>${E.extra}`;
    },
  },
  {
    // fundo do mar em corte: camadas de sedimento, rochas, recife, névoa azul por cima
    nome: "fundo", largura: 1500, altura: 520, escala: 1.5,
    svg: (E) => {
      const R = E.prng(44), W = 1500, H = 520;
      const perfil = (y0, amp, seed) => { const r = E.prng(seed); let d = `M0 ${H} L0 ${y0}`; for (let x = 0; x <= W; x += 50) d += ` L${x} ${(y0 + Math.sin(x / 210 + seed) * amp + r() * amp * 0.5).toFixed(1)}`; return d + ` L${W} ${H} Z`; };
      let s = "";
      s += E.forma(perfil(120, 30, 1), "#16305a", { luz: [0, 0, 0, 0.3], corLuz: "#4a7ab0", forcaLuz: 0.8, sombra: [0, 0.2, 0, 1], grao: "graoM" });
      s += E.forma(perfil(210, 20, 2), "#112648", { luz: [0, 0, 0, 0.3], corLuz: "#2e5a90", forcaLuz: 0.5, grao: "graoM" });
      s += E.forma(perfil(300, 16, 3), "#0c1d3a", { luz: [0, 0, 0, 0.3], corLuz: "#24497a", forcaLuz: 0.5, grao: "graoM" });
      s += E.forma(perfil(390, 12, 4), "#08142c", { grao: "graoM" });
      // rochas
      for (let k = 0; k < 9; k++) { const x = 60 + k * 170 + R() * 80, y = 128 + Math.sin(x / 210 + 1) * 30, r = 18 + R() * 40;
        s += E.forma(`M${x - r} ${y + 8} Q ${x - r * 0.9} ${y - r * 0.8} ${x - r * 0.1} ${y - r} Q ${x + r * 0.8} ${y - r * 0.9} ${x + r} ${y + 8} Z`, "#1d3b68", { luz: [0, 0, 0.6, 0.6], corLuz: "#6a9ad0", forcaLuz: 0.8, grao: "graoF" }); }
      // recife/algas
      for (let k = 0; k < 14; k++) { const x = R() * W, y = 132 + Math.sin(x / 210 + 1) * 30, h = 30 + R() * 60, c = ["#2f7a8a", "#7a4a8a", "#c26a6a"][k % 3];
        s += `<path d="M${x} ${y} q ${-8 + R() * 16} ${-h / 2} ${-4 + R() * 8} ${-h}" stroke="${c}" stroke-width="${3 + R() * 3}" stroke-linecap="round" fill="none" opacity="0.8"/>`; }
      return `<defs><linearGradient id="fm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000"/><stop offset="0.3" stop-color="#fff"/></linearGradient>
        <mask id="mf"><rect width="${W}" height="${H}" fill="url(#fm)"/></mask></defs><g mask="url(#mf)"><g filter="url(#papel)">${s}</g></g>${E.extra}`;
    },
  },
];
