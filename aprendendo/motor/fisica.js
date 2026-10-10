// Movimento com "física" e câmera com profundidade (padrão do canal desde out/2026).
// Princípios de animação (Thomas & Johnston, "The Illusion of Life", 1981) em funções do tempo:
// nada começa nem para de repente, as coisas têm peso. Dose de adulto: passa ~7% do ponto e assenta
// rápido (nada de elástico de desenho infantil). Tudo determinístico (sem Math.random).
//
//   const p = FIS.chegar(t, t0);              // 0→1 com mola (passa um pouco e volta), assenta em ~0,6 s
//   const p = FIS.antes(t, t0);               // antecipação: recua um pouco antes de ir
//   const s = FIS.saida(t, t0);               // 1→0 com antecipação (encolhe para sair)
//   const [sx, sy] = FIS.impacto(t, t0);      // achatar/esticar ao bater (carimbo, objeto que cai)
//   const ang = FIS.balanco(t, t0, 0.3);      // balanço que morre (argola do chaveiro, alça do cadeado)
//   const p = FIS.cascata(t, t0, k);          // item k de uma lista chega 0,07 s depois do anterior
//   const [x, y] = FIS.arco(x0, y0, x1, y1, u, 140);   // trajetória em arco (nada anda em linha reta)
//   const [dx, dy] = FIS.tremor(t, t0, 14);   // tranco de câmera num impacto
//   FIS.flutua(t, fase) / FIS.respira(t, fase) // vida parada: nada fica 100% imóvel
//
// Câmera com profundidade (2,5D): cada coisa tem uma distância z (1 = plano principal, 3 = fundo,
// 0,6 = primeiro plano). A câmera anda e dá zoom; o que está longe anda menos (paralaxe) e o que está
// fora de foco vira pontos maiores e mais fracos (bokeh).
//   const CAM = cameraProf([[c.ini, { x: 540, y: 960, zoom: 1 }], [c.ini + 4, { x: 600, y: 900, zoom: 1.25 }]]);
//   const cam = CAM(t);                                   // { x, y, zoom, foco }
//   desenharForma(nv, F, { cx, cy, esc, cam, z: 1 });       // formas.js já usa a câmera
//   const [sx, sy, k] = projP(cam, X, Y, z);                 // um ponto qualquer
//   camCanvasP(x, cam, z); ...desenho 2D...; x.setTransform(1, 0, 0, 1, 0, 0);
//   const FUNDO = fundoProfundo(9);  desenharFundo(nv, FUNDO, t, cam);   // poeira/estrelas em 3 planos

const FIS = {
  _u: (t, t0, d) => (t - t0) / d,
  chegar(t, t0, d = 0.6) { const u = (t - t0) / d; if (u <= 0) return 0; if (u >= 1.6) return 1; return 1 - Math.exp(-6 * u) * Math.cos(7 * u); },
  antes(t, t0, d = 0.7, recuo = 0.1) {
    const u = (t - t0) / d; if (u <= 0) return 0; if (u < 0.22) return -recuo * Math.sin((u / 0.22) * Math.PI / 2);
    const w = (u - 0.22) / 0.78; return -recuo + (1 + recuo) * (w >= 1.6 ? 1 : 1 - Math.exp(-6 * w) * Math.cos(7 * w));
  },
  saida(t, t0, d = 0.35) { const u = Math.max(0, Math.min(1, (t - t0) / d)); const c = 1.70158; return 1 - ((c + 1) * u * u * u - c * u * u); },
  impacto(t, t0, forca = 0.22) { const u = t - t0; if (u < 0) return [1, 1]; const s = forca * Math.exp(-7 * u) * Math.cos(13 * u); return [1 + s, 1 - s]; },
  balanco(t, t0, amp = 1, freq = 2.2, amort = 3.5) { const u = t - t0; if (u < 0) return 0; return amp * Math.exp(-amort * u) * Math.sin(6.283 * freq * u); },
  cascata(t, t0, k, passo = 0.07, d = 0.6) { return FIS.chegar(t, t0 + k * passo, d); },
  arco(x0, y0, x1, y1, u, altura = 120) { u = Math.max(0, Math.min(1, u)); return [x0 + (x1 - x0) * u, y0 + (y1 - y0) * u - altura * 4 * u * (1 - u)]; },
  tremor(t, t0, forca = 14, dur = 0.45) { const u = t - t0; if (u < 0 || u > dur) return [0, 0]; const k = forca * Math.pow(1 - u / dur, 2); return [k * (Math.sin(t * 71) * 0.6 + Math.sin(t * 37 + 1.3) * 0.4), k * (Math.sin(t * 59 + 2.1) * 0.6 + Math.sin(t * 43) * 0.4)]; },
  flutua(t, fase = 0, amp = 8, f = 0.35) { return amp * Math.sin(6.283 * f * t + fase); },
  respira(t, fase = 0, amp = 0.015, f = 0.4) { return 1 + amp * Math.sin(6.283 * f * t + fase); },
};

// câmera com chaves de tempo: [[t, {x, y, zoom, foco}], ...]; entre as chaves, suave (in-out)
function cameraProf(chaves) {
  const ks = chaves.map(([t, v]) => [t, { x: 540, y: 960, zoom: 1, foco: 1, ...v }]);
  return (t) => {
    if (t <= ks[0][0]) return { ...ks[0][1] };
    for (let j = 1; j < ks.length; j++) {
      if (t <= ks[j][0]) { const [t0, a] = ks[j - 1], [t1, b] = ks[j], e = PT.inOut((t - t0) / Math.max(0.01, t1 - t0)); return { x: a.x + (b.x - a.x) * e, y: a.y + (b.y - a.y) * e, zoom: a.zoom + (b.zoom - a.zoom) * e, foco: a.foco + (b.foco - a.foco) * e }; }
    }
    return { ...ks[ks.length - 1][1] };
  };
}
function projP(cam, X, Y, z = 1) { const k = cam.zoom / z; return [540 + (X - cam.x) * k, 960 + (Y - cam.y) * k, k]; }
function camCanvasP(x, cam, z = 1) { const k = cam.zoom / z; x.setTransform(k, 0, 0, k, 540 - cam.x * k, 960 - cam.y * k); }

// poeira/estrelas em 3 profundidades + bokeh de primeiro plano (na nuvem da GPU)
function fundoProfundo(seed = 9, n = 520) {
  const r = prng(seed), L = [];
  for (let k = 0; k < n; k++) { const q = r(), z = q < 0.55 ? 3.2 + r() * 1.5 : q < 0.9 ? 1.6 + r() * 0.8 : 0.45 + r() * 0.25; L.push({ x: -600 + r() * 2280, y: -900 + r() * 3720, z, f: r() * 6.283, v: r() }); }
  return L;
}
function desenharFundo(nv, L, t, cam, cor = [0.75, 0.82, 1], a = 1, i0 = nv.k) {
  let i = i0; const c = cam || { x: 540, y: 960, zoom: 1, foco: 1 };
  for (const p of L) {
    if (i >= nv.n) break;
    const yy = p.y + Math.sin(t * 0.25 + p.f) * 14 / p.z, xx = p.x + t * 6 / p.z;
    const [sx, sy, k] = projP(c, xx, yy, p.z);
    if (sx < -60 || sx > 1140 || sy < -60 || sy > 1980) continue;
    const perto = p.z < 1, tw = 0.6 + 0.4 * Math.sin(t * (0.7 + p.v) + p.f);
    const al = perto ? 0.05 : (0.08 + 0.3 / p.z) * tw, tam = perto ? 26 + 30 * p.v : 1.4 + 3.2 / p.z;
    nv.ponto(i++, sx, sy, cor[0], cor[1], cor[2], al * a, tam * Math.min(1.6, k * p.z));
  }
  nv.total(i); return i;
}
