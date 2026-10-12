// Kit de personagens — OBJETOS em traço de luz (mesmo pincel dos personagens), para pôr na cena.
// manjedoura(x, { x, chao, esc, cor, a, cam, z, bebe, t }): cocho de madeira em X com palha e, se bebe, o menino
// enrolado em panos (Lc 2:7) com rostinho de perfil dormindo. esc = largura em px (padrão 260).
function manjedoura(x, o = {}) {
  const y = x._texto || x; if (x._texto) y._usado = true;
  const W = o.esc || 260, s = W / 260, a = o.a ?? 1, t = o.t || 0, cor = o.cor || [0.92, 0.74, 0.5];
  const pr = (px, py) => { const X = (o.x ?? 540) + px * s, Y = (o.chao ?? 1400) + py * s; return o.cam ? projP(o.cam, X, Y, o.z ?? 1) : [X, Y, 1]; };
  const kk = o.cam ? o.cam.zoom / (o.z ?? 1) : 1, LW = Math.max(1.4, Math.min(3.2, 2.2 * s * kk)), rgb = (c) => c.map((q) => Math.round(q * 255)).join(",");
  const R = rgb(cor), PELE = rgb([1, 0.86, 0.72]), PANO = rgb([0.96, 0.95, 0.9]), PALHA = rgb([1, 0.86, 0.5]);
  const P = (pts) => pts.map(([px, py]) => pr(px, py));
  const forma = (pts, c, fa = 0.95) => { const sp = P(pts); y.beginPath(); _curva(y, sp, true); y.fillStyle = `rgba(9,12,29,${fa})`; y.fill(); y.strokeStyle = `rgba(${c},1)`; y.lineWidth = LW; y.shadowColor = `rgba(${c},0.6)`; y.shadowBlur = 8 * kk; y.stroke(); y.shadowBlur = 0; y.stroke(); };
  const pin = (pts, c, w = 0.8, al = 0.8) => kitPincel(y, P(pts), LW * w, c, a * al, { brilho: 4 * kk });
  y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.globalAlpha = a; y.lineJoin = y.lineCap = "round";
  // pernas em X e o cocho (tábuas)
  for (const sx of [-1, 1]) { pin([[sx * 110, 0], [sx * 60, -90]], R, 2.2, 0.9); pin([[sx * 60, 0], [sx * 110, -90]], R, 2.2, 0.9); }
  forma([[-130, -150], [130, -150], [100, -80], [-100, -80]], R);
  pin([[-118, -128], [118, -128]], R, 0.6, 0.6); pin([[-108, -104], [108, -104]], R, 0.6, 0.6);
  // palha saindo por cima
  const r = prng(17); for (let k = 0; k < 26; k++) { const px = -120 + 240 * r(), an = -1.2 + 2.4 * r(); pin([[px, -148], [px + Math.sin(an) * 22, -148 - Math.cos(an) * 16 - 6 * r()]], PALHA, 0.55, 0.7); }
  if (o.bebe !== false) {
    const resp = 1 + 0.02 * Math.sin(t * 2);
    // panos (enrolado), com as dobras em diagonal
    forma([[-86, -150], [-80, -176], [-40, -190 * resp], [20, -192 * resp], [52, -182], [60, -160], [40, -148], [-60, -146]], PANO, 0.97);
    for (const dx of [-60, -30, 0, 26]) pin([[dx, -150], [dx + 18, -186 * resp]], PANO, 0.6, 0.6);
    // cabecinha de perfil dormindo (olha para cima/direita)
    const hx = 76, hy = -176; forma([[hx - 24, hy + 10], [hx - 22, hy - 16], [hx, hy - 26], [hx + 22, hy - 18], [hx + 30, hy - 4], [hx + 34, hy + 2], [hx + 28, hy + 6], [hx + 26, hy + 14], [hx + 10, hy + 20], [hx - 12, hy + 18]], PELE, 0.97);
    pin([[hx + 10, hy - 4], [hx + 15, hy - 2], [hx + 20, hy - 4]], PELE, 0.7, 0.9); // olho fechado
    pin([[hx - 18, hy - 12], [hx - 6, hy - 22], [hx + 8, hy - 22]], rgb([0.85, 0.65, 0.45]), 0.7, 0.7); // cabelinho
  }
  y.restore();
}
