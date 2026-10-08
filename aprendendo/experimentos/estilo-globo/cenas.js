// EXPERIMENTO de estilo "sem desenhos", visual gerado por código: a cena "Até a sua casa"
// do vídeo da eletricidade como um globo de pontos de luz (continentes reais, Natural Earth),
// usinas reais mandando energia em arcos até as capitais, mergulho até uma cidade de luz,
// transformador (500.000 V -> 220 V) e a lâmpada acendendo. Tudo num canvas 2D com projeção
// 3D feita à mão: leve para renderizar e determinístico (função do tempo do vídeo).

document.head.insertAdjacentHTML("beforeend", `<style>
  .gl-palco { position: relative; width: 1080px; height: 1920px; font-family: "Nunito", sans-serif; }
  .gl-l { position: absolute; left: 0; width: 1080px; text-align: center; font-weight: 900; color: #f8f9ff; line-height: 1;
          letter-spacing: -0.01em; text-transform: uppercase; white-space: nowrap; text-shadow: 0 8px 36px rgba(0,0,0,0.6); }
  .gl-l .md-word, .gl-l .md-word-in, .gl-l .md-key { display: inline-block; }
  .gl-fino { font-weight: 800; letter-spacing: 0.22em; color: rgba(248,249,255,0.8); }
  .gl-ci { color: #8fe3ff; text-shadow: 0 0 34px rgba(110,210,255,0.8), 0 0 100px rgba(76,201,240,0.5); }
  .gl-am { color: #ffd23f; text-shadow: 0 0 34px rgba(255,190,60,0.85), 0 0 100px rgba(255,150,40,0.55); }
</style>`);

const G_ = {
  lerp: (a, b, k) => a + (b - a) * k,
  cl: (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
  ss: (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); },
  out: (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3),
  inExp: (x) => { x = Math.max(0, Math.min(1, x)); return x === 0 ? 0 : Math.pow(2, 10 * x - 10); },
  rad: Math.PI / 180,
};
// lugares reais (lat, lon)
const USINAS = { "ITAIPU": [-25.41, -54.59], "BELO MONTE": [-3.12, -51.78], "TUCURUÍ": [-3.83, -49.65], "EÓLICAS": [-5.4, -36.2] };
const CIDADES = { SP: [-23.55, -46.63], RJ: [-22.9, -43.2], BH: [-19.92, -43.94], BSB: [-15.79, -47.88], REC: [-8.05, -34.9], SSA: [-12.97, -38.5],
  MAO: [-3.1, -60.0], POA: [-30.03, -51.23], FOR: [-3.72, -38.54], CWB: [-25.43, -49.27], GYN: [-16.68, -49.25], BEL: [-1.45, -48.5] };
const LINHAS = [["ITAIPU", "SP"], ["ITAIPU", "CWB"], ["ITAIPU", "POA"], ["ITAIPU", "RJ"], ["BELO MONTE", "SP"], ["BELO MONTE", "BSB"], ["BELO MONTE", "MAO"],
  ["TUCURUÍ", "BEL"], ["TUCURUÍ", "FOR"], ["TUCURUÍ", "GYN"], ["EÓLICAS", "REC"], ["EÓLICAS", "SSA"], ["EÓLICAS", "FOR"], ["BELO MONTE", "BH"]];

const vec = (lat, lon) => { const a = lat * G_.rad, b = lon * G_.rad; return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)]; };
const slerp = (p, q, k) => {
  const d = Math.acos(G_.cl(p[0] * q[0] + p[1] * q[1] + p[2] * q[2], -1, 1)), s = Math.sin(d) || 1;
  const a = Math.sin((1 - k) * d) / s, b = Math.sin(k * d) / s;
  return [p[0] * a + q[0] * b, p[1] * a + q[1] * b, p[2] * a + q[2] * b];
};

CENAS.transmissao = (el, c, B) => {
  const pal = c.legendas.flatMap((b) => b.palavras);
  const norm = (s) => s.toLowerCase().replace(/[^\wà-ÿ]/g, "");
  const quando = (w, n = 0) => { const l = pal.filter((x) => norm(x[0]) === norm(w)); return (l[n] || l[0] || [0, c.voz])[1]; };
  const tGer = quando("gerada,"), tCab = B("cabos"), tTor = quando("torres,"), tCen = B("distancia"), tPer = quando("Perto"), tTr = B("transformador");
  const tBai = quando("baixa"), tSeg = quando("seguro."), tEnt = quando("entra"), tTom = B("tomada"), tLam = B("lampada");

  const L = (id, y, tam, txt, cls = "") => `<div class="gl-l ${cls}" id="${id}" style="top:${y}px;font-size:${tam}px">${txt}</div>`;
  el.innerHTML = `<rect width="${W}" height="${H}" fill="#050a20"/>
    <foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml"><canvas class="gl-cv" width="${W}" height="${H}"></canvas></div></foreignObject>
    <foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml" class="gl-palco">
      ${L("g1", 1230, 46, "às vezes por", "gl-fino")}
      ${L("g2", 1290, 110, "centenas de km", "gl-ci")}
      ${L("g3", 380, 44, "transformador", "gl-fino")}
      ${L("g4", 450, 150, "500.000 V", "gl-ci")}
      ${L("g5", 630, 44, "nível seguro", "gl-fino")}
    </div></foreignObject>`;
  const q = (id) => el.querySelector("#" + id), MD = MotionDirector;
  MD.arrive(tl, q("g1"), quando("às") - 0.05, { y: 16, duration: 0.45 });
  MD.slam(tl, q("g2"), tCen, { from: 1.3, duration: 0.45 });
  MD.leave(tl, [q("g1"), q("g2")], tPer - 0.3, { y: -24 });
  MD.arrive(tl, q("g3"), tTr - 0.05, { y: 16, duration: 0.45 });
  MD.slam(tl, q("g4"), tTr + 0.1, { from: 1.25, duration: 0.45 });
  MD.arrive(tl, q("g5"), tSeg, { y: 16, duration: 0.45 });
  MD.leave(tl, [q("g3"), q("g4"), q("g5")], tEnt - 0.25, { y: -30 });
  const volt = q("g4");
  aCadaQuadro((t) => { // 500.000 V caindo até 220 V em "baixa a força"; a cor esfria para amarelo
    const k = G_.ss((t - tBai) / (tSeg - tBai + 0.2)), v = Math.round(Math.exp(G_.lerp(Math.log(500000), Math.log(220), k)));
    volt.textContent = `${(k >= 1 ? 220 : v).toLocaleString("pt-BR")} V`;
    volt.className = `gl-l ${k > 0.92 ? "gl-am" : "gl-ci"}`;
  });

  const cv = el.querySelector(".gl-cv"), x = cv.getContext("2d");
  const CX = 540, CY = 840, R0 = 500;
  const terra = [], brasil = [];
  for (let i = 0; i < GLOBO_TERRA.length; i += 2) terra.push(vec(GLOBO_TERRA[i] / 10, GLOBO_TERRA[i + 1] / 10));
  for (let i = 0; i < GLOBO_BRASIL.length; i += 2) brasil.push(vec(GLOBO_BRASIL[i] / 10, GLOBO_BRASIL[i + 1] / 10));
  const r = prng(29);
  const estrelas = Array.from({ length: 220 }, () => [r() * W, r() * H, r(), r()]);
  const linhas = LINHAS.map(([u, cid], k) => {
    const p = vec(...USINAS[u]), qv = vec(...CIDADES[cid]), d = Math.acos(p[0] * qv[0] + p[1] * qv[1] + p[2] * qv[2]);
    return { p, q: qv, alt: 0.06 + d * 0.7, ini: tCab + 0.1 * k, ordem: k };
  });
  const SP = CIDADES.SP;
  // cidade de luz: quadras em perspectiva (X lateral, Z distância), em volta da avenida da energia (X = 0)
  const quadras = [];
  for (let zi = 0; zi < 70; zi++) for (let xi = -30; xi <= 30; xi++) {
    if (xi === 0) continue;
    const n = 1 + Math.floor(r() * 3);
    for (let k = 0; k < n + 2; k++) quadras.push([xi * 60 + (r() - 0.5) * 40, zi * 60 + (r() - 0.5) * 40, r(), r() < 0.82 ? 0 : 1]);
  }

  const glow = (px, py, rad, cor, a) => {
    if (a <= 0.003 || rad <= 0.5) return;
    const g = x.createRadialGradient(px, py, 0, px, py, rad);
    g.addColorStop(0, `rgba(${cor},${a})`); g.addColorStop(0.3, `rgba(${cor},${a * 0.4})`); g.addColorStop(1, `rgba(${cor},0)`);
    x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  };

  aCadaQuadro((t) => {
    if (t < c.ini - 0.1 || t > c.fim + 0.6) return;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = "source-over";
    x.fillStyle = "#050a20"; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = "lighter";
    // ---------- câmera do globo ----------
    const gira = G_.out((t - c.ini) / 3.2);                        // vem girando da África até o Brasil
    const mergulho = G_.inExp((t - tPer + 0.25) / 1.35);             // "Perto da sua casa": mergulho em São Paulo
    const fase = G_.ss((t - tPer - 0.05) / 0.7);                     // 0 = só globo, 1 = só cidade
    const lon0 = G_.lerp(G_.lerp(20, -52, gira), SP[1], G_.ss((t - tPer + 1.4) / 1.4)) + 0.6 * Math.sin(t * 0.3);
    const lat0 = G_.lerp(G_.lerp(-5, -14, gira), SP[0], G_.ss((t - tPer + 1.4) / 1.4));
    const R = R0 * (0.92 + 0.08 * G_.out((t - c.ini) / 2)) * (1 + 0.03 * t / 16) * (1 + mergulho * 60);
    const ca = Math.cos(-lon0 * G_.rad), sa = Math.sin(-lon0 * G_.rad), cb = Math.cos(lat0 * G_.rad), sb = Math.sin(lat0 * G_.rad);
    const proj = (v, h = 0) => { // gira o globo (lon, depois lat) e projeta; devolve [x, y, z(frente>0)]
      const x1 = v[0] * ca + v[2] * sa, z1 = -v[0] * sa + v[2] * ca, y2 = v[1] * cb - z1 * sb, z2 = v[1] * sb + z1 * cb;
      const s = R * (1 + h);
      return [CX + x1 * s, CY - y2 * s, z2];
    };
    // estrelas (somem na cidade)
    estrelas.forEach(([sx, sy, a, f]) => { x.fillStyle = `rgba(200,220,255,${(0.15 + 0.5 * a) * (0.6 + 0.4 * Math.sin(t * (0.8 + f) + f * 9)) * (1 - fase)})`; x.fillRect(sx, sy, 1 + a * 1.6, 1 + a * 1.6); });
    if (fase < 1) {
      const aG = (1 - fase) * G_.ss((t - c.ini) / 0.8) * (1 - G_.ss((R - 1500) / 2500));
      // atmosfera
      if (R < 4000) {
        glow(CX, CY, R * 1.45, "60,140,255", 0.22 * aG);
        x.strokeStyle = `rgba(143,227,255,${0.35 * aG})`; x.lineWidth = 3; x.beginPath(); x.arc(CX, CY, R * 1.005, 0, 6.283); x.stroke();
      }
      // volume: esfera escura com lado iluminado (luz vinda de cima à esquerda)
      if (R < 2500) {
        const esf = x.createRadialGradient(CX - R * 0.35, CY - R * 0.4, R * 0.05, CX, CY, R);
        esf.addColorStop(0, `rgba(40,80,170,${0.55 * aG})`); esf.addColorStop(0.6, `rgba(14,30,80,${0.5 * aG})`); esf.addColorStop(1, `rgba(5,10,32,${0.2 * aG})`);
        x.globalCompositeOperation = "source-over"; x.fillStyle = esf; x.beginPath(); x.arc(CX, CY, R, 0, 6.283); x.fill(); x.globalCompositeOperation = "lighter";
        // grade de latitude/longitude (só a parte da frente)
        x.lineWidth = 1;
        for (let la = -60; la <= 60; la += 30) { x.strokeStyle = `rgba(120,170,255,${0.12 * aG})`; x.beginPath(); let ok = false; for (let lo = -180; lo <= 180; lo += 4) { const [px, py, z] = proj(vec(la, lo)); if (z > 0) { ok ? x.lineTo(px, py) : x.moveTo(px, py); ok = true; } else ok = false; } x.stroke(); }
        for (let lo = -180; lo < 180; lo += 30) { x.strokeStyle = `rgba(120,170,255,${0.12 * aG})`; x.beginPath(); let ok = false; for (let la = -88; la <= 88; la += 4) { const [px, py, z] = proj(vec(la, lo)); if (z > 0) { ok ? x.lineTo(px, py) : x.moveTo(px, py); ok = true; } else ok = false; } x.stroke(); }
      }
      // continentes (atrás fracos, na frente fortes); o Brasil acende quente quando a energia é gerada
      const tam = Math.min(7, Math.max(2, R / 200)), quente = G_.ss((t - tGer) / 0.8);
      terra.forEach((v) => {
        const [px, py, z] = proj(v); if (px < -20 || px > W + 20 || py < -20 || py > H + 20) return;
        const a = (z > 0 ? 0.35 + 0.6 * z : 0.05 * (1 + z)) * aG; if (a <= 0.01) return;
        x.fillStyle = `rgba(120,190,255,${a})`; const s = tam * (z > 0 ? 0.7 + 0.3 * z : 0.6); x.fillRect(px - s / 2, py - s / 2, s, s);
      });
      brasil.forEach((v, i) => {
        const [px, py, z] = proj(v); if (z <= 0 || px < -40 || px > W + 40 || py < -40 || py > H + 40) return;
        const pisca = 0.75 + 0.25 * Math.sin(t * 2 + i * 0.7);
        const cor = quente > 0.5 ? "255,205,110" : "143,227,255";
        x.fillStyle = `rgba(${cor},${(0.35 + 0.55 * z) * aG * G_.lerp(0.7, pisca, quente)})`;
        const s = tam * 0.8; x.fillRect(px - s / 2, py - s / 2, s, s);
      });
      // usinas: acendem em "gerada"
      Object.entries(USINAS).forEach(([nome, ll], k) => {
        const [px, py, z] = proj(vec(...ll)); if (z <= 0) return;
        const a = G_.ss((t - tGer - k * 0.12) / 0.4) * aG, pulso = 1 + 0.25 * Math.sin(t * 5 + k);
        glow(px, py, 38 * pulso * Math.min(3, R / R0), "255,210,63", 0.75 * a); glow(px, py, 14 * Math.min(3, R / R0), "255,255,240", a);
        if (a > 0.05 && R < 1500 && (nome === "ITAIPU" || nome === "BELO MONTE")) {
          x.globalCompositeOperation = "source-over"; x.font = "800 24px Nunito"; x.textAlign = "left"; x.textBaseline = "middle";
          x.fillStyle = `rgba(255,226,140,${a * (1 - mergulho)})`; x.textAlign = nome === "ITAIPU" ? "right" : "left"; x.fillText(nome, px + (nome === "ITAIPU" ? -22 : 22), py - (nome === "ITAIPU" ? 0 : 26)); x.globalCompositeOperation = "lighter";
        }
      });
      // linhas de transmissão: arcos que se desenham em "cabos", com pulsos de energia correndo
      linhas.forEach((ln) => {
        const k = G_.out((t - ln.ini) / 1.1); if (k <= 0) return;
        const N = 40, pts = [];
        for (let i = 0; i <= N * k; i++) { const u = i / N; pts.push(proj(slerp(ln.p, ln.q, u), Math.sin(u * Math.PI) * ln.alt)); }
        if (pts.length < 2) return;
        x.lineCap = "round";
        for (let i = 1; i < pts.length; i++) {
          const z = (pts[i][2] + pts[i - 1][2]) / 2; if (z < -0.05) continue;
          x.strokeStyle = `rgba(76,201,240,${0.18 * aG})`; x.lineWidth = Math.min(14, Math.max(7, R / 70));
          x.beginPath(); x.moveTo(pts[i - 1][0], pts[i - 1][1]); x.lineTo(pts[i][0], pts[i][1]); x.stroke();
          x.strokeStyle = `rgba(190,240,255,${0.75 * aG})`; x.lineWidth = Math.min(4, Math.max(2, R / 220));
          x.beginPath(); x.moveTo(pts[i - 1][0], pts[i - 1][1]); x.lineTo(pts[i][0], pts[i][1]); x.stroke();
        }
        // "torres": contas de luz ao longo do cabo, acendendo em sequência
        const tt = G_.ss((t - tTor - ln.ordem * 0.03) / 0.9);
        for (let i = 4; i < pts.length; i += 5) { const a = tt * aG * (pts[i][2] > 0 ? 1 : 0); if (a > 0) glow(pts[i][0], pts[i][1], 9, "200,240,255", 0.8 * a); }
        // pulsos de energia (da usina para a cidade)
        if (k >= 1) for (let s = 0; s < 3; s++) {
          const u = ((t - ln.ini) * 0.45 + s / 3 + ln.ordem * 0.17) % 1, pp = proj(slerp(ln.p, ln.q, u), Math.sin(u * Math.PI) * ln.alt);
          if (pp[2] > 0) { glow(pp[0], pp[1], 16, "255,240,170", 0.8 * aG); glow(pp[0], pp[1], 5, "255,255,255", 0.9 * aG); }
        }
        // cidade de chegada
        const [qx, qy, qz] = proj(ln.q); if (k >= 1 && qz > 0) glow(qx, qy, 20, "255,214,110", 0.45 * aG);
      });
      // "centenas de km": destaca a linha mais longa (Belo Monte -> São Paulo)
      const hl = G_.ss((t - tCen) / 0.3) * (1 - G_.ss((t - tPer + 0.4) / 0.5));
      if (hl > 0) {
        const ln = linhas[4], N = 60; x.strokeStyle = `rgba(255,240,170,${0.9 * hl * aG})`; x.lineWidth = Math.max(4, R / 120); x.beginPath();
        for (let i = 0; i <= N; i++) { const u = i / N, pp = proj(slerp(ln.p, ln.q, u), Math.sin(u * Math.PI) * ln.alt); i ? x.lineTo(pp[0], pp[1]) : x.moveTo(pp[0], pp[1]); }
        x.stroke();
      }
    }
    // ---------- a cidade de luz (depois do mergulho) ----------
    if (fase > 0 && t < tEnt + 1.2) {
      const aC = fase * (1 - G_.ss((t - tEnt - 0.1) / 0.9));
      const voo = (t - tPer) * 220 + G_.inExp((t - tEnt + 0.2) / 1.1) * 2600;         // a câmera avança pela avenida
      const altura = G_.lerp(900, 300, G_.ss((t - tPer) / 3)), foco = 760, horiz = 760;
      const p3 = (X, Z) => { const d = Z - voo; if (d < 20) return null; return [CX + (X / d) * foco, horiz + (altura / d) * foco, d]; };
      const ceu = x.createLinearGradient(0, horiz - 520, 0, horiz + 80); ceu.addColorStop(0, "rgba(255,140,60,0)"); ceu.addColorStop(0.82, `rgba(255,140,60,${0.16 * aC})`); ceu.addColorStop(1, "rgba(255,140,60,0)"); x.fillStyle = ceu; x.fillRect(0, horiz - 520, W, 600);
      glow(CX, horiz, 900, "255,150,60", 0.07 * aC); glow(CX, horiz, 260, "255,200,120", 0.06 * aC);
      for (let xi = -12; xi <= 12; xi += 2) { if (!xi) continue; const p0 = p3(xi * 60 - 30, voo + 40), p1 = p3(xi * 60 - 30, voo + 4200); if (p0 && p1) { const gr = x.createLinearGradient(p0[0], p0[1], p1[0], p1[1]); gr.addColorStop(0, `rgba(255,170,80,${0.14 * aC * Math.exp(-Math.pow(xi / 9, 2))})`); gr.addColorStop(1, "rgba(255,170,80,0)"); x.strokeStyle = gr; x.lineWidth = 2; x.beginPath(); x.moveTo(p0[0], p0[1]); x.lineTo(p1[0], p1[1]); x.stroke(); } }
      for (let zi = Math.ceil(voo / 120); zi < Math.ceil(voo / 120) + 32; zi++) { const p0 = p3(-1000, zi * 120), p1 = p3(1000, zi * 120); if (p0 && p1) { const fo = 0.1 * aC * G_.cl((5200 - p0[2]) / 2400); const gr = x.createLinearGradient(p0[0], 0, p1[0], 0); gr.addColorStop(0, "rgba(255,170,80,0)"); gr.addColorStop(0.5, `rgba(255,170,80,${fo})`); gr.addColorStop(1, "rgba(255,170,80,0)"); x.strokeStyle = gr; x.lineWidth = 1.5; x.beginPath(); x.moveTo(p0[0], p0[1]); x.lineTo(p1[0], p1[1]); x.stroke(); } }
      quadras.forEach(([X, Z, a, tipo]) => {
        const pp = p3(X, Z); if (!pp) return; const [px, py, d] = pp; if (py > H || px < -30 || px > W + 30) return;
        const lado = Math.exp(-Math.pow(X / (900 + d * 0.25), 2)), neb = G_.cl((5200 - d) / 2400);  // some nas laterais e ao longe
        const nev = Math.min(1, (d - 20) / 300) * lado * neb, s = Math.min(14, Math.max(1.6, 3600 / d)); if (nev < 0.02) return;
        const cor = tipo ? "143,227,255" : a > 0.5 ? "255,206,120" : "255,170,80";
        x.fillStyle = `rgba(${cor},${(0.25 + 0.6 * a) * nev * aC})`; x.fillRect(px - s / 2, py - s / 2, s, s);
      });
      // avenida da energia: linha forte até o transformador e, depois dele, mais calma até a casa
      const Ztr = 1400 + (tTr - tPer) * 220 * 1.0, Zcasa = Ztr + 700;
      const trilha = (z0, z1, cor, lw, a) => { const p0 = p3(0, Math.max(z0, voo + 25)), p1 = p3(0, z1); if (!p0 || !p1) return; x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = lw; x.beginPath(); x.moveTo(p0[0], p0[1]); x.lineTo(p1[0], p1[1]); x.stroke(); };
      trilha(Ztr, 9000, "143,227,255", 5, 0.8 * aC);
      const depois = G_.ss((t - tBai) / 1.2);
      if (depois > 0) trilha(Zcasa, Ztr, "255,210,63", 4, 0.9 * aC * depois);
      for (let s = 0; s < 6; s++) { // pulsos descendo a avenida
        const u = ((t * 0.5 + s / 6) % 1), Z = G_.lerp(9000, Ztr, u), pp = p3(0, Z);
        if (pp) glow(pp[0], pp[1], Math.max(8, 9000 / pp[2]), "200,240,255", 0.9 * aC);
      }
      // transformador: anel que pulsa e comprime a energia
      const pt = p3(0, Ztr);
      if (pt && t > tTr - 0.4) {
        const a = G_.ss((t - tTr + 0.4) / 0.4) * aC, esc = 9000 / pt[2], comp = 1 - 0.35 * G_.ss((t - tBai) / 1.4);
        glow(pt[0], pt[1], 110 * esc, "143,227,255", 0.45 * a);
        for (let k = 0; k < 3; k++) { const rr = (40 + k * 22) * esc * comp * (1 + 0.06 * Math.sin(t * 6 + k)); x.strokeStyle = `rgba(${k ? "143,227,255" : "255,255,255"},${0.7 * a})`; x.lineWidth = 3; x.beginPath(); x.ellipse(pt[0], pt[1], rr, rr * 0.45, 0, 0, 6.283); x.stroke(); }
        if (depois > 0) glow(pt[0], pt[1], 70 * esc, "255,210,63", 0.7 * a * depois);
      }
      const pc = p3(0, Zcasa); if (pc && depois > 0) glow(pc[0], pc[1], 50 * 9000 / pc[2] / 9, "255,214,110", 0.8 * aC * depois);
    }
    // ---------- "entra pela parede": só um fio de luz no escuro; "tomada" e "lâmpada" ----------
    if (t > tEnt - 0.2) {
      const a = G_.ss((t - tEnt) / 0.6);
      const comp = G_.out((t - tEnt) / (tTom - tEnt));                              // o fio de luz avança até a tomada
      const y0 = 1500, y1 = G_.lerp(1500, 980, comp);
      const g = x.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "rgba(255,210,63,0)"); g.addColorStop(1, `rgba(255,230,150,${0.9 * a})`);
      x.strokeStyle = g; x.lineWidth = 6; x.lineCap = "round"; x.beginPath(); x.moveTo(CX, y0); x.lineTo(CX, y1); x.stroke();
      glow(CX, y1, 60, "255,220,130", 0.8 * a);
      if (t > tTom) { const u = t - tTom; glow(CX, 980, 120, "255,255,240", 0.9 * Math.exp(-u * 4)); x.strokeStyle = `rgba(255,236,190,${0.7 * Math.exp(-u * 3)})`; x.lineWidth = 3; x.beginPath(); x.arc(CX, 980, 30 + u * 300, 0, 6.283); x.stroke(); }
      if (t > tLam - 0.05) { // a lâmpada: explosão de luz quente (eco da abertura)
        const u = t - tLam, acesa = G_.out(u / 0.35);
        glow(CX, 860, 1300, "255,150,60", 0.3 * acesa);
        glow(CX, 860, 520 * acesa, "255,214,110", 0.75 * acesa);
        glow(CX, 860, 120, "255,255,245", acesa);
        x.save(); x.translate(CX, 860); x.rotate(t * 0.1);
        for (let k = 0; k < 16; k++) { const ang = k / 16 * 6.283, Lr = (650 + 200 * Math.sin(k * 1.7 + t)) * acesa; const gg = x.createLinearGradient(0, 0, Math.cos(ang) * Lr, Math.sin(ang) * Lr); gg.addColorStop(0, `rgba(255,220,140,${0.18 * acesa})`); gg.addColorStop(1, "rgba(255,220,140,0)"); x.fillStyle = gg; x.beginPath(); x.moveTo(0, 0); x.lineTo(Math.cos(ang - 0.05) * Lr, Math.sin(ang - 0.05) * Lr); x.lineTo(Math.cos(ang + 0.05) * Lr, Math.sin(ang + 0.05) * Lr); x.closePath(); x.fill(); }
        x.restore();
        if (u < 1.2) { const k = G_.out(u); x.strokeStyle = `rgba(255,210,120,${0.6 * (1 - k)})`; x.lineWidth = 5; x.beginPath(); x.arc(CX, 860, 80 + k * 900, 0, 6.283); x.stroke(); }
      }
    }
  });
};
