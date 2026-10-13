// Kit de personagens — OBJETOS em traço de luz (mesmo pincel dos personagens), para pôr na cena.
// manjedoura(x, { x, chao, esc, cor, a, cam, z, bebe, t }): cocho de madeira em X com palha e, se bebe, o menino
// enrolado em panos (Lc 2:7) com rostinho de perfil dormindo. esc = largura em px (padrão 260); fundo = "r,g,b" do preenchimento.
function manjedoura(x, o = {}) {
  const y = x._texto || x; if (x._texto) y._usado = true;
  const W = o.esc || 260, s = W / 260, a = o.a ?? 1, t = o.t || 0, cor = o.cor || [0.62, 0.42, 0.26], cheio = (o.estilo || "cheio") === "cheio";
  const pr = (px, py) => { const X = (o.x ?? 540) + px * s, Y = (o.chao ?? 1400) + py * s; return o.cam ? projP(o.cam, X, Y, o.z ?? 1) : [X, Y, 1]; };
  const kk = o.cam ? o.cam.zoom / (o.z ?? 1) : 1, LW = Math.max(1.4, Math.min(3.2, 2.2 * s * kk)), rgb = (c) => c.map((q) => Math.round(q * 255)).join(",");
  const R = rgb(cheio ? cor : [0.92, 0.74, 0.5]), PELE = rgb([0.98, 0.8, 0.66]), PANO = rgb([0.96, 0.94, 0.88]), PALHA = rgb([0.95, 0.8, 0.45]);
  const P = (pts) => pts.map(([px, py]) => pr(px, py)), velho = KIT_ESTILO; KIT_ESTILO = cheio ? "cheio" : "linha"; KIT_LUZ = [0.45, -0.9];
  const FUNDO = o.fundo || "9,12,29";
  const forma = (pts, c, fa = 0.95) => { const sp = P(pts); y.beginPath(); _curva(y, sp, true);
    if (cheio) { let y0 = 1e9, y1 = -1e9; for (const [, py] of sp) { y0 = Math.min(y0, py); y1 = Math.max(y1, py); } const g = y.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, `rgba(${kitClara(c, 0.95)},1)`); g.addColorStop(1, `rgba(${kitSombra(c, 1.05)},1)`); y.fillStyle = g; y.fill();
      kitSombreia(y, sp, c, 1, kk, 0.8); y.strokeStyle = `rgba(${kitSombra(kitEsc(c, 0.6), 0.6)},0.95)`; y.lineWidth = LW * 0.5; y.stroke(); return; }
    y.fillStyle = `rgba(${FUNDO},${fa})`; y.fill(); y.strokeStyle = `rgba(${c},1)`; y.lineWidth = LW; y.shadowColor = `rgba(${c},0.6)`; y.shadowBlur = 8 * kk; y.stroke(); y.shadowBlur = 0; y.stroke(); };
  const pin = (pts, c, w = 0.8, al = 0.8, suave = true) => kitPincel(y, P(pts), LW * w, c, a * al, { brilho: 4 * kk, suave });
  const tabua = (x0, y0, x1, y1, w) => { const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy), nx = -dy / l * w / 2, ny = dx / l * w / 2; forma([[x0 + nx, y0 + ny], [x1 + nx, y1 + ny], [x1 - nx, y1 - ny], [x0 - nx, y0 - ny]], R); };
  y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.globalAlpha = a; y.lineJoin = y.lineCap = "round";
  // pernas em X (tábuas grossas) e o cocho
  for (const sx of [-1, 1]) { if (cheio) { tabua(sx * 112, 2, sx * 60, -96, 15); tabua(sx * 58, 2, sx * 110, -96, 15); } else { pin([[sx * 110, 0], [sx * 60, -90]], R, 2.2, 0.9, false); pin([[sx * 60, 0], [sx * 110, -90]], R, 2.2, 0.9, false); } }
  forma([[-132, -152], [132, -152], [104, -78], [-104, -78]], R);
  pin([[-120, -128], [120, -128]], R, 0.7, 0.7); pin([[-110, -104], [110, -104]], R, 0.7, 0.7);
  // palha saindo por cima
  const r = prng(17); for (let k = 0; k < 34; k++) { const px = -124 + 248 * r(), an = -1.2 + 2.4 * r(), c = r() < 0.5 ? PALHA : kitClara(PALHA, 0.9), p0 = pr(px, -150), p1 = pr(px + Math.sin(an) * 24, -150 - Math.cos(an) * 18 - 6 * r());
    y.beginPath(); y.moveTo(p0[0], p0[1]); y.lineTo(p1[0], p1[1]); y.strokeStyle = `rgba(${cheio ? c : PALHA},${0.9 * a})`; y.lineWidth = LW * (cheio ? 0.9 : 0.6); y.stroke(); }
  if (o.bebe !== false) {
    const resp = 1 + 0.02 * Math.sin(t * 2);
    // panos (enrolado), com as dobras em diagonal
    forma([[-86, -150], [-80, -176], [-40, -190 * resp], [20, -192 * resp], [52, -182], [60, -160], [40, -148], [-60, -146]], PANO, 0.97);
    for (const dx of [-60, -30, 0, 26]) pin([[dx, -150], [dx + 18, -186 * resp]], PANO, 0.7, 0.7);
    // cabecinha de perfil dormindo (olha para cima/direita)
    const hx = 76, hy = -176; forma([[hx - 24, hy + 10], [hx - 22, hy - 16], [hx, hy - 26], [hx + 22, hy - 18], [hx + 30, hy - 4], [hx + 34, hy + 2], [hx + 28, hy + 6], [hx + 26, hy + 14], [hx + 10, hy + 20], [hx - 12, hy + 18]], PELE, 0.97);
    pin([[hx + 10, hy - 4], [hx + 15, hy - 2], [hx + 20, hy - 4]], cheio ? "70,40,30" : PELE, 0.7, 0.9, false); // olho fechado
    if (cheio) { const [bx, by] = pr(hx + 12, hy + 6); y.save(); y.filter = `blur(${Math.max(1, 2 * s * kk)}px)`; y.beginPath(); y.ellipse(bx, by, 6 * s * kk, 4 * s * kk, 0, 0, 6.283); y.fillStyle = "rgba(232,110,100,0.35)"; y.fill(); y.restore(); }
    pin([[hx - 18, hy - 12], [hx - 6, hy - 22], [hx + 8, hy - 22]], cheio ? "120,80,50" : rgb([0.85, 0.65, 0.45]), 0.9, 0.8, false); // cabelinho
  }
  KIT_ESTILO = velho; y.restore();
}
