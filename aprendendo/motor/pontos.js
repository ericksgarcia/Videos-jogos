// "Pontos de luz": estilo em que tudo é desenhado como nuvens de pontos num canvas por cena
// (garrafas, moléculas, cristais, plateias, globos...). Sem desenhos de contorno: forma = pontos,
// luz = brilho aditivo. Cada cena pede uma tela com telaPontos(); o desenho é uma função do tempo
// do vídeo (aCadaQuadro), então o render é determinístico. Textos por cima: palcoTexto().
//
//   const T = telaPontos(el, c);                 // canvas da cena (fundo, aditivo, só no tempo da cena)
//   const txt = palcoTexto(el, [["t1", 700, 120, "gelo", "pt-ci"]]);   // linhas de texto (MotionDirector)
//   T.quadro((x, t) => { ... });                 // x = contexto 2D já limpo e em modo "lighter"

document.head.insertAdjacentHTML("beforeend", `<style>
  .pt-palco { position: relative; width: 1080px; height: 1920px; font-family: "Nunito", sans-serif; }
  .pt-l { position: absolute; left: 0; width: 1080px; text-align: center; font-weight: 900; color: #f8f9ff; line-height: 1.02;
          letter-spacing: -0.01em; text-transform: uppercase; white-space: nowrap; text-shadow: 0 8px 36px rgba(0,0,0,0.65); }
  .pt-l .md-word, .pt-l .md-word-in, .pt-l .md-key { display: inline-block; }
  .pt-fino { font-weight: 800; letter-spacing: 0.2em; color: rgba(248,249,255,0.82); }
  .pt-ci { color: #8fe3ff; text-shadow: 0 0 34px rgba(110,210,255,0.8), 0 0 100px rgba(76,201,240,0.5); }
  .pt-am { color: #ffd23f; text-shadow: 0 0 34px rgba(255,190,60,0.85), 0 0 100px rgba(255,150,40,0.55); }
  .pt-la { color: #ff8a3d; text-shadow: 0 0 34px rgba(255,138,61,0.8), 0 0 100px rgba(255,120,40,0.5); }
  .pt-ve { color: #ef476f; text-shadow: 0 0 34px rgba(239,71,111,0.8), 0 0 100px rgba(239,71,111,0.5); }
  .pt-esq { text-align: left; left: 250px; width: 760px; white-space: normal; }
</style>`);

// ---------- matemática de tempo ----------
const PT = {
  lerp: (a, b, k) => a + (b - a) * k,
  cl: (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)),
  ss: (x) => { x = Math.max(0, Math.min(1, x)); return x * x * (3 - 2 * x); },
  out: (x) => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3),
  inOut: (x) => { x = Math.max(0, Math.min(1, x)); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; },
  inExp: (x) => { x = Math.max(0, Math.min(1, x)); return x === 0 ? 0 : Math.pow(2, 10 * x - 10); },
  // janela: sobe em [a, a+ea] e desce em [b, b+eb]
  jan: (t, a, b, ea = 0.4, eb = 0.4) => Math.min(PT.ss((t - a) / ea), 1 - PT.ss((t - b) / eb)),
  mix: (c1, c2, k) => c1.map((v, i) => Math.round(v + (c2[i] - v) * k)).join(","),
};
const COR = { ambar: [255, 170, 50], gelo: [225, 242, 255], ciano: [143, 227, 255], azul: [76, 201, 240], amarelo: [255, 210, 63], laranja: [255, 138, 61], branco: [255, 255, 245], vermelho: [239, 71, 111] };

// instante em que cada palavra da fala é dita (n = ocorrência)
function tempoPalavras(c) {
  const pal = c.legendas.flatMap((b) => b.palavras);
  const norm = (s) => s.toLowerCase().replace(/[^\wà-ÿ-]/g, "");
  return (w, n = 0) => { const l = pal.filter((x) => norm(x[0]) === norm(w)); return (l[n] || l[l.length - 1] || [0, c.voz])[1]; };
}

// ---------- tela da cena ----------
function telaPontos(el, c, fundo = "#060b22") {
  el.insertAdjacentHTML("beforeend", `<rect width="${W}" height="${H}" fill="${fundo}"/><foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml"><canvas class="pt-cv" width="${W}" height="${H}"></canvas></div></foreignObject>`);
  const cvs = el.querySelectorAll(".pt-cv"), cv = cvs[cvs.length - 1], x = cv.getContext("2d");
  return {
    x, cv,
    quadro(fn) {
      aCadaQuadro((t) => {
        if (t < c.ini - 0.6 || t > c.fim + 0.1) return;
        x.setTransform(1, 0, 0, 1, 0, 0);
        x.globalCompositeOperation = "source-over"; x.globalAlpha = 1;
        x.fillStyle = fundo; x.fillRect(0, 0, W, H);
        x.globalCompositeOperation = "lighter";
        fn(x, t);
      });
    },
  };
}
// linhas de texto por cima do canvas: [id, y, tamanho, texto, classes, estilo extra]; devolve id -> elemento
function palcoTexto(el, linhas) {
  el.insertAdjacentHTML("beforeend", `<foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml" class="pt-palco">${linhas.map(([id, y, tam, txt, cls, est]) => `<div class="pt-l ${cls || ""}" id="${id}" style="top:${y}px;font-size:${tam}px;${est || ""}">${txt}</div>`).join("")}</div></foreignObject>`);
  const m = {};
  linhas.forEach(([id]) => { m[id] = el.querySelector("#" + id); });
  return m;
}

// ---------- primitivas de luz ----------
function brilhoP(x, px, py, rad, cor, a) {
  if (a <= 0.003 || rad <= 0.5) return;
  const g = x.createRadialGradient(px, py, 0, px, py, rad);
  g.addColorStop(0, `rgba(${cor},${a})`); g.addColorStop(0.3, `rgba(${cor},${a * 0.4})`); g.addColorStop(1, `rgba(${cor},0)`);
  x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
}
const pontoP = (x, px, py, s, cor, a) => { if (a <= 0.004) return; x.fillStyle = `rgba(${cor},${a})`; x.fillRect(px - s / 2, py - s / 2, s, s); };
const discoP = (x, px, py, r, cor, a) => { if (a <= 0.004) return; x.fillStyle = `rgba(${cor},${a})`; x.beginPath(); x.arc(px, py, r, 0, 6.283); x.fill(); };
const anelP = (x, px, py, r, cor, a, lw = 2) => { if (a <= 0.004 || r <= 0) return; x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = lw; x.beginPath(); x.arc(px, py, r, 0, 6.283); x.stroke(); };
const linhaP = (x, x0, y0, x1, y1, cor, a, lw = 2) => { if (a <= 0.004) return; x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = lw; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); };
// texto no canvas (rótulos pequenos dentro da arte)
function rotuloP(x, txt, px, py, tam, cor, a, alinhar = "center") {
  if (a <= 0.01) return;
  const op = x.globalCompositeOperation; x.globalCompositeOperation = "source-over";
  x.font = `800 ${tam}px Nunito`; x.textAlign = alinhar; x.textBaseline = "middle";
  x.fillStyle = `rgba(${cor},${a})`; x.fillText(txt, px, py); x.globalCompositeOperation = op;
}

// partículas de ambiente (poeira/neve/estrelas) que derivam devagar
function ambienteP(n, seed) {
  const r = prng(seed);
  return Array.from({ length: n }, () => ({ x: r() * W, y: r() * H, z: 0.2 + r() * 0.8, f: r() * 6.283, v: r() }));
}
function desenharAmbiente(x, lista, t, cor, a = 1, queda = 0) {
  lista.forEach((p) => {
    const yy = ((p.y + t * (8 + 26 * p.z) * queda) % (H + 40) + H + 40) % (H + 40) - 20;
    const xx = p.x + Math.sin(t * 0.3 + p.f) * 18 * p.z;
    pontoP(x, xx, yy, 1 + 2.4 * p.z, cor, a * (0.12 + 0.45 * p.z) * (0.6 + 0.4 * Math.sin(t * (0.8 + p.v) + p.f)));
  });
}

// ---------- garrafa de pontos (sólido de revolução) ----------
// coordenadas da garrafa: y de 0 (fundo) a 1000 (tampa); raio em unidades da mesma escala
function raioGarrafa(y) {
  if (y < 20) return 132 + 18 * Math.sqrt(y / 20);
  if (y < 560) return 150;
  if (y < 730) { const k = (y - 560) / 170; return 150 - 98 * (0.5 - 0.5 * Math.cos(Math.PI * k)); }
  if (y < 935) return 52 - 4 * (y - 730) / 205;
  if (y < 962) return 55;
  return 0;
}
function garrafaPontos(seed = 3, nVidro = 2600, nLiq = 2600, nivel = 800) {
  const r = prng(seed), pts = [];
  // vidro: amostragem proporcional à área (raio)
  while (pts.length < nVidro) { const y = r() * 962, rr = raioGarrafa(y); if (r() * 150 < rr) pts.push({ k: 0, y, a: r() * 6.283, rr, n: r() }); }
  for (let i = 0; i < 260; i++) { const rr = 140 * Math.sqrt(r()); pts.push({ k: 0, y: 2, a: r() * 6.283, rr, n: r() }); } // fundo
  // tampa (coroa): anel e topo
  for (let i = 0; i < 320; i++) { const top = i < 140; pts.push({ k: 2, y: top ? 990 : 962 + r() * 28, a: r() * 6.283, rr: top ? 60 * Math.sqrt(r()) : 60 + 4 * Math.sin(i * 1.7), n: r() }); }
  // líquido: volume até o nível
  for (let i = 0; i < nLiq; i++) { const y = 10 + r() * (nivel - 10), rr = raioGarrafa(y) * 0.9 * Math.sqrt(r()); pts.push({ k: 1, y, a: r() * 6.283, rr, n: r(), n2: r() }); }
  return pts;
}
// projeta um ponto da garrafa: base (fundo) em (cx, cy) na tela, escala esc, giro em torno do eixo
function projGarrafa(p, o) {
  const ang = p.a + o.rot, X = p.rr * Math.sin(ang), Z = p.rr * Math.cos(ang), per = 1 / (1 - Z * o.esc / 2600);
  return [o.cx + X * o.esc * per, o.cy - p.y * o.esc, Z, ang];
}
// o: { cx, cy, esc, rot, a, tampa: {dy, rot, a}, gelo(p) -> 0..1, liq (0..1 visibilidade), quente(p) }
function desenharGarrafa(x, pts, o) {
  const A = o.a ?? 1;
  if ((o.liq ?? 1) > 0 && o.brilho !== false) {
    const gm = o.geloMedio ?? 0, cor = PT.mix(COR.ambar, COR.ciano, gm);
    brilhoP(x, o.cx, o.cy - 330 * o.esc, 330 * o.esc, cor, 0.32 * A * (o.liq ?? 1));
    brilhoP(x, o.cx, o.cy - 650 * o.esc, 120 * o.esc, cor, 0.2 * A * (o.liq ?? 1));
  }
  pts.forEach((p) => {
    if (p.k === 2) { // tampa
      const tp = o.tampa || {}; if ((tp.a ?? 1) <= 0) return;
      const ang = p.a + o.rot + (tp.rot || 0), X = p.rr * Math.sin(ang), Z = p.rr * Math.cos(ang);
      pontoP(x, o.cx + X * o.esc + (tp.dx || 0), o.cy - (p.y + (tp.dy || 0)) * o.esc, 2.2, "255,214,110", A * (tp.a ?? 1) * (Z > 0 ? 0.75 : 0.25));
      return;
    }
    const [sx, sy, Z, ang] = projGarrafa(p, o);
    if (p.k === 0) { // vidro: bordas brilham (Fresnel) e um reflexo vertical na frente
      const w = ((ang % 6.283) + 6.283) % 6.283, dw = Math.min(Math.abs(w - 5.73), 6.283 - Math.abs(w - 5.73));
      const borda = Math.pow(Math.abs(Math.sin(ang)), 6), refl = Math.exp(-dw * dw / 0.02);
      const fr = o.geada ? o.geada(p) : 0;
      const a = A * ((Z > 0 ? 0.09 : 0.035) + 0.6 * borda + 0.45 * refl * (p.y > 60 && p.y < 900 ? 1 : 0) + 0.35 * fr);
      pontoP(x, sx, sy, 1.8 + fr, fr > 0.3 ? "235,248,255" : "170,215,255", a);
      return;
    }
    if ((o.liq ?? 1) <= 0) return; // líquido: âmbar -> gelo
    const g = o.gelo ? o.gelo(p) : 0, q = o.quente ? o.quente(p) : 0;
    const cor = g > 0 ? PT.mix(q > 0 ? PT.mix(COR.ambar, COR.laranja, q).split(",").map(Number) : COR.ambar, COR.gelo, g) : (q > 0 ? PT.mix(COR.ambar, COR.laranja, q) : COR.ambar.join(","));
    const tremor = (o.agita || 0) * Math.sin(o.t * 6 + p.n * 40) * 3;
    const a = A * (o.liq ?? 1) * (0.42 + 0.3 * (Z > 0 ? 1 : 0.3) + 0.3 * g * (0.6 + 0.4 * Math.sin((o.t || 0) * 3 + p.n * 30)));
    pontoP(x, sx + tremor, sy, 2.6 + 0.8 * g, cor, a);
  });
}

// ---------- moléculas de água (O grande + 2 H) ----------
function moleculaP(x, px, py, ang, esc, cor, a) {
  const d = 17 * esc, h = 52 * Math.PI / 180;
  brilhoP(x, px, py, 26 * esc, cor, 0.35 * a);
  discoP(x, px, py, 9 * esc, cor, 0.9 * a);
  [ang - h, ang + h].forEach((b) => discoP(x, px + Math.cos(b) * d, py + Math.sin(b) * d, 5 * esc, "255,255,255", 0.75 * a));
}
// rede hexagonal (gelo visto de cima): vértices e ligações
function redeHex(cx, cy, s, cols, linhas) {
  const vs = new Map(), arestas = new Set(), lista = [], lig = [];
  const chave = (x, y) => `${Math.round(x)}:${Math.round(y)}`;
  const add = (x, y) => { const k = chave(x, y); if (!vs.has(k)) { vs.set(k, lista.length); lista.push([x, y]); } return vs.get(k); };
  const h3 = Math.sqrt(3) * s;
  const ox = cx - ((cols - 1) * 1.5 * s) / 2, oy = cy - ((linhas - 0.5) * h3) / 2;
  for (let i = 0; i < cols; i++) for (let j = 0; j < linhas; j++) {
    const hx = ox + i * 1.5 * s, hy = oy + j * h3 + (i % 2 ? h3 / 2 : 0);
    const ids = Array.from({ length: 6 }, (_, k) => add(hx + s * Math.cos(k * Math.PI / 3), hy + s * Math.sin(k * Math.PI / 3)));
    ids.forEach((a, k) => { const b = ids[(k + 1) % 6], key = a < b ? `${a}-${b}` : `${b}-${a}`; if (!arestas.has(key)) { arestas.add(key); lig.push([a, b]); } });
  }
  return { v: lista, lig };
}
// floco/cristal de gelo de pontos (6 braços com ramos), raio r
function flocoP(x, px, py, r, a, giro = 0, cor = "225,242,255") {
  for (let k = 0; k < 6; k++) {
    const b = giro + k * Math.PI / 3, c = Math.cos(b), s = Math.sin(b);
    for (let i = 1; i <= 8; i++) { const d = (i / 8) * r; pontoP(x, px + c * d, py + s * d, 2.4, cor, a); }
    [0.45, 0.7].forEach((f) => [-1, 1].forEach((sg) => { const bb = b + sg * Math.PI / 3; for (let i = 1; i <= 3; i++) { const d = i * r * 0.1; pontoP(x, px + c * r * f + Math.cos(bb) * d, py + s * r * f + Math.sin(bb) * d, 2, cor, a * 0.9); } }));
  }
  brilhoP(x, px, py, r * 0.9, cor, 0.25 * a);
}
// bolha: anel com brilho no topo
function bolhaP(x, px, py, r, a) {
  anelP(x, px, py, r, "170,230,255", 0.7 * a, 1.6);
  discoP(x, px - r * 0.35, py - r * 0.35, Math.max(1, r * 0.22), "255,255,255", 0.8 * a);
}
// termômetro de pontos: tubo vertical (x, y do topo, altura), escala tMin..tMax, valor v
function termometroP(x, px, py, alt, tMin, tMax, v, a, marcas = []) {
  const yDe = (temp) => py + alt * (1 - (temp - tMin) / (tMax - tMin));
  for (let yy = py; yy <= py + alt; yy += 7) { pontoP(x, px - 16, yy, 2, "170,215,255", 0.5 * a); pontoP(x, px + 16, yy, 2, "170,215,255", 0.5 * a); }
  for (let k = 0; k < 40; k++) { const b = (k / 40) * 6.283; pontoP(x, px + Math.cos(b) * 30, py + alt + 30 + Math.sin(b) * 30, 2.2, "170,215,255", 0.6 * a); }
  const yv = yDe(v), cor = v > 0 ? "255,138,61" : "143,227,255";
  for (let yy = yv; yy <= py + alt + 30; yy += 5) for (let xx = -9; xx <= 9; xx += 5) pontoP(x, px + xx, yy, 2.6, cor, 0.85 * a);
  discoP(x, px, py + alt + 30, 22, cor, 0.5 * a);
  brilhoP(x, px, yv, 40, cor, 0.6 * a);
  marcas.forEach(([temp, txt, c2]) => { const yy = yDe(temp); linhaP(x, px - 34, yy, px + 34, yy, c2 || "255,255,255", 0.6 * a, 2); rotuloP(x, txt, px + 50, yy, 26, c2 || "255,255,255", 0.85 * a, "left"); });
  return yDe;
}

// ================= formas simples em luz (2D), prefixo f: usadas por vários vídeos =================
// caminho de retângulo arredondado
function fRR(x, x0, y0, w, h, r) { x.beginPath(); x.moveTo(x0 + r, y0); x.arcTo(x0 + w, y0, x0 + w, y0 + h, r); x.arcTo(x0 + w, y0 + h, x0, y0 + h, r); x.arcTo(x0, y0 + h, x0, y0, r); x.arcTo(x0, y0, x0 + w, y0, r); x.closePath(); }
// contorno + preenchimento suave de retângulo arredondado
function fCaixa(x, cx, cy, w, h, r, cor, a, lw = 4, fundo = 0.1) { if (a <= 0.01) return; fRR(x, cx - w / 2, cy - h / 2, w, h, r); x.fillStyle = `rgba(${cor},${fundo * a})`; x.fill(); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = lw; x.stroke(); }
// cédula: retângulo com moldura, oval central e valor
function fNota(x, cx, cy, w, cor, a, txt = "", ang = 0) {
  if (a <= 0.01) return; const h = w * 0.46; x.save(); x.translate(cx, cy); x.rotate(ang);
  fCaixa(x, 0, 0, w, h, w * 0.05, cor, a, Math.max(2, w / 70), txt ? 0.06 : 0.16); fCaixa(x, 0, 0, w * 0.86, h * 0.72, w * 0.03, cor, 0.45 * a, Math.max(1, w / 140), 0);
  x.beginPath(); x.ellipse(0, 0, w * 0.16, h * 0.26, 0, 0, 6.283); x.strokeStyle = `rgba(${cor},${0.7 * a})`; x.lineWidth = Math.max(1.5, w / 110); x.stroke();
  if (txt) { const op = x.globalCompositeOperation; x.globalCompositeOperation = "source-over"; x.font = `900 ${w * 0.16}px Nunito`; x.textAlign = "left"; x.textBaseline = "middle"; x.fillStyle = `rgba(230,255,240,${0.9 * a})`; x.fillText(txt, -w * 0.4, -h * 0.2); x.globalCompositeOperation = op; }
  x.restore();
}
// moeda/ficha dourada
function fMoeda(x, cx, cy, r, a, cor = "255,210,63") { if (a <= 0.01) return; brilhoP(x, cx, cy, r * 2.2, cor, 0.35 * a); discoP(x, cx, cy, r, cor, 0.55 * a); anelP(x, cx, cy, r, "255,240,190", 0.9 * a, Math.max(2, r / 6)); anelP(x, cx, cy, r * 0.62, "255,240,190", 0.5 * a, Math.max(1, r / 10)); }
// pessoa simples (cabeça + ombros)
function fPessoa(x, cx, cy, esc, cor, a) { if (a <= 0.01) return; discoP(x, cx, cy - 34 * esc, 15 * esc, cor, 0.8 * a); x.beginPath(); x.ellipse(cx, cy + 14 * esc, 26 * esc, 30 * esc, 0, Math.PI, 0); x.closePath(); x.fillStyle = `rgba(${cor},${0.6 * a})`; x.fill(); brilhoP(x, cx, cy, 50 * esc, cor, 0.2 * a); }
// celular: corpo, tela e ilha da câmera
function fCelular(x, cx, cy, h, cor, a, tela = 0.12) { if (a <= 0.01) return; const w = h * 0.49; fCaixa(x, cx, cy, w, h, w * 0.14, cor, a, Math.max(3, h / 90), tela); fRR(x, cx - w * 0.15, cy - h * 0.46, w * 0.3, h * 0.035, h * 0.017); x.fillStyle = `rgba(${cor},${0.8 * a})`; x.fill(); }
// seta com ponta
function fSeta(x, x0, y0, x1, y1, cor, a, lw = 5) { if (a <= 0.01) return; linhaP(x, x0, y0, x1, y1, cor, a, lw); const an = Math.atan2(y1 - y0, x1 - x0), p = lw * 4; linhaP(x, x1, y1, x1 - Math.cos(an - 0.5) * p, y1 - Math.sin(an - 0.5) * p, cor, a, lw); linhaP(x, x1, y1, x1 - Math.cos(an + 0.5) * p, y1 - Math.sin(an + 0.5) * p, cor, a, lw); }
// gráfico de linha em pontos: pts = [[x, y], ...]; desenha até a fração k
function fLinhaPts(x, pts, k, cor, a, lw = 5) { if (a <= 0.01 || pts.length < 2) return; const n = Math.max(1, Math.floor((pts.length - 1) * PT.cl(k))); x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i <= n; i++) x.lineTo(pts[i][0], pts[i][1]); x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = lw; x.lineJoin = "round"; x.stroke(); const u = pts[n]; brilhoP(x, u[0], u[1], 40, cor, 0.6 * a); discoP(x, u[0], u[1], lw * 1.4, "255,255,255", a); }
// nuvem de pontos de um cérebro (de lado, nariz para a direita): {x, y, cer} em coordenadas -1..1
const F_CEREBRO = (() => { const r = prng(404), out = []; while (out.length < 9000) { const px = r() * 2 - 1, py = r() * 1.6 - 0.8; const corpo = (px * px) / 1 + (py * py) / 0.42 < 1 && py < 0.5 - 0.15 * px; const cer = Math.pow((px + 0.55) / 0.34, 2) + Math.pow((py - 0.52) / 0.2, 2) < 1; if (corpo || cer) { const sulco = Math.sin(px * 13 + Math.sin(py * 9) * 2) * Math.sin(py * 11 + px * 3); out.push({ x: px, y: py, cer: cer && !corpo ? 1 : 0, s: sulco, n: r() }); } } return out; })();
function fCerebro(nv, cx, cy, esc, a, o = {}) { let i = nv.k; const realce = o.cerebelo || 0, cor = o.cor || [0.95, 0.6, 0.75]; for (const p of F_CEREBRO) { const c = p.cer ? mixCor(cor, [0.35, 0.95, 1.0], realce) : cor, al = a * (0.5 + 0.5 * (0.5 + 0.5 * p.s)) * (p.cer ? 1 + realce : 1); nv.ponto(i++, cx + p.x * esc, cy + p.y * esc, c[0], c[1], c[2], al, Math.max(3.2, esc / 85) + (p.cer ? realce * 1.2 : 0)); } nv.total(i); }
function mixCor(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
