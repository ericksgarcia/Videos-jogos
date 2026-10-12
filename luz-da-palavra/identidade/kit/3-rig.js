// Kit de personagens — RIG: monta as peças desenhadas (1-pecas.js) no esqueleto e anima com as POSES.
// figura(x, t, pose, { tipo | ficha, x, chao, H, dir, cam, z, a, cor, rot, medir, atras, maos, vida, fase })
//   tipo: nome no KIT_ELENCO (jesus, maria, davi, pessoa, homem, mulher, crianca, idoso);
//   ficha: ficha própria (ex.: elencoVariado(seed, "mulher")); maos: ["aberta"|"segura"|"aponta"|"palma", ...]
//   (mão de trás, mão da frente). Mesmo retorno do personagem(): { maos, cotovelos, ombro, quadril, cabeca,
//   escala, pr, H, oy, ox, d }. Sem rosto, sempre.
function figura(x, t, pose0, o = {}) {
  const F = { ...(KIT_ELENCO[o.tipo] || KIT_ELENCO.pessoa), ...(o.ficha || {}) }, d = o.dir ?? 1, a = o.a ?? 1, fase = o.fase ?? 0;
  const H = (o.H || 560) * (F.alt || 1), s = H / 1000, L = F.larg || 1, hk = F.cabecaGrande || 1, id = F.idade || 0;
  // vida: respiração e leve balanço quando parado; idade curva as costas
  const p0 = { ...pose0, tronco: pose0.tronco + 0.1 * id, cabeca: pose0.cabeca + 0.08 * id };
  const pose = o.vida === false ? p0 : { ...p0, tronco: p0.tronco + 0.012 * Math.sin(t * 1.7 + fase), cabeca: p0.cabeca + 0.02 * Math.sin(t * 1.1 + fase * 2) };
  const Lt = 0.28 * H, Ln = 0.03 * H, Rh = 0.066 * H * hk, La = 0.165 * H, Lf = 0.15 * H, Lc = 0.235 * H, Ls = 0.225 * H;
  const v = (ang, l) => [Math.sin(ang) * d * l, Math.cos(ang) * l], up = (ang, l) => [Math.sin(ang) * d * l, -Math.cos(ang) * l], ad = (p, q, k = 1) => [p[0] + q[0] * k, p[1] + q[1] * k];
  const C = up(pose.tronco, Lt), N = ad(C, up(pose.tronco + pose.cabeca * 0.4, Ln)), Hd = ad(N, up(pose.tronco + pose.cabeca, Rh * 0.95)), S = ad(C, up(pose.tronco, -0.035 * H));
  const bracos = pose.braco.map(([om, co]) => { const E = ad(S, v(pose.tronco + om, La)); return [S, E, ad(E, v(pose.tronco + om + co, Lf))]; });
  const pernas = pose.perna.map(([qu, jo]) => { const K = v(qu, Lc); return [[0, 0], K, ad(K, v(qu + jo, Ls)), qu]; });
  let baixo = 0; for (const [, K, Fp] of pernas) baixo = Math.max(baixo, K[1] + 0.03 * H, Fp[1] + 0.05 * H); baixo = Math.max(baixo, C[1], Hd[1] + Rh);
  const ox = o.x ?? 540, oy = (o.chao ?? 1500) - baixo;
  const rx0 = (pernas[0][2][0] + pernas[1][2][0]) / 2, cR = Math.cos(o.rot || 0), sR = Math.sin(o.rot || 0);
  const gira = (p) => (o.rot ? [rx0 + (p[0] - rx0) * cR - (p[1] - baixo) * sR, baixo + (p[0] - rx0) * sR + (p[1] - baixo) * cR] : p);
  const pr = (p0) => { const p = gira(p0); return o.cam ? projP(o.cam, ox + p[0], oy + p[1], o.z ?? 1) : [ox + p[0], oy + p[1], 1]; };
  const kk = o.cam ? o.cam.zoom / (o.z ?? 1) : 1;
  const info = () => ({ maos: bracos.map((b) => pr(b[2])), cotovelos: bracos.map((b) => pr(b[1])), ombro: pr(S), quadril: pr([0, 0]), cabeca: pr(Hd), escala: kk, pr, H, oy, ox, d });
  if (o.medir) return info();
  const y = x._texto || x; if (x._texto) y._usado = true;
  const rgbOf = (c) => c.map((q) => Math.round(q * 255)).join(","), tinge = (c) => (o.cor ? mixCor(c, o.cor, 0.5) : c), cor = tinge(F.roupa || F.cor || [1, 1, 1]), fundo = o.preench || "9,12,29";
  const RGB = rgbOf(cor), PELE = rgbOf(tinge(F.pele || [1, 0.86, 0.7])), ROUPA2 = rgbOf(tinge(F.roupa2 || F.cor || [1, 0.84, 0.55])), CABELO = rgbOf(tinge(F.corCabelo || F.cabeloCor || [0.9, 0.78, 0.6]));
  const LW = Math.max(1.5, 0.0062 * H * kk);
  y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.lineJoin = "round"; y.lineCap = "round"; y.globalAlpha = a;
  // referencial de um osso: origem P, eixo u (ao longo do osso) e f (para a frente)
  const un = (p, q) => { const dx = q[0] - p[0], dy = q[1] - p[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
  const fr = (u) => [u[1] * d, -u[0] * d];
  const poe = (pts, P, u, sx = 1, sy = 1) => pts.map(([px, py]) => pr([P[0] + fr(u)[0] * px * s * sx + u[0] * py * s * sy, P[1] + fr(u)[1] * px * s * sx + u[1] * py * s * sy]));
  const traca = (sp, fechado, o2 = {}) => {
    y.beginPath(); _curva(y, sp, fechado);
    if (fechado && o2.fill !== false) {
      y.fillStyle = `rgba(${fundo},${o2.fa ?? 0.95})`; y.fill();
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [px, py] of sp) { x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
      const g = y.createLinearGradient(d > 0 ? x1 : x0, y0, d > 0 ? x0 : x1, y1); g.addColorStop(0, `rgba(${o2.rgb || RGB},${0.16 * (o2.al ?? 1)})`); g.addColorStop(0.45, `rgba(${o2.rgb || RGB},0.03)`); g.addColorStop(1, "rgba(0,0,0,0)");
      y.fillStyle = g; y.fill();
    }
    const c2 = o2.rgb || RGB; y.strokeStyle = `rgba(${c2},${(o2.al ?? 1)})`; y.lineWidth = LW * (o2.lw || 1);
    y.shadowColor = `rgba(${c2},0.65)`; y.shadowBlur = (o2.det ? 5 : 9) * kk; y.stroke(); y.shadowBlur = 0; y.stroke();
  };
  const peca = (nome, P, u, o2 = {}) => {
    const pc = KIT_PECAS[nome]; if (!pc) return; const sx = o2.sx ?? 1, sy = o2.sy ?? 1;
    let cont = pc.contorno;
    if (pc.cachos) { const cx = cont.reduce((m, p) => m + p[0], 0) / cont.length, cy = cont.reduce((m, p) => m + p[1], 0) / cont.length; const out = []; for (let k = 0; k < cont.length; k++) { const p = cont[k], q = cont[(k + 1) % cont.length]; out.push(p); if (k < cont.length - 5) { const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], dd = Math.hypot(m[0] - cx, m[1] - cy) || 1; out.push([m[0] + (m[0] - cx) / dd * 9, m[1] + (m[1] - cy) / dd * 9]); } } cont = out; }
    traca(poe(cont, P, u, sx, sy), true, o2);
    for (const ln of pc.linhas || []) traca(poe(ln, P, u, sx, sy), false, { ...o2, lw: 0.55, det: true, al: (o2.al ?? 1) * 0.8, fill: false });
    if (pc.extra) { traca(poe(pc.extra.contorno, P, u, sx, sy), true, o2); for (const ln of pc.extra.linhas || []) traca(poe(ln, P, u, sx, sy), false, { ...o2, lw: 0.55, det: true, al: 0.8, fill: false }); }
  };
  // sombra no chão
  { const fx = (pernas[0][2][0] + pernas[1][2][0]) / 2, [sx, sy, sk] = pr([fx, baixo]); y.save(); y.translate(sx, sy); y.scale(1, 0.16); const gr = y.createRadialGradient(0, 0, 0, 0, 0, 0.2 * H * sk); gr.addColorStop(0, `rgba(0,0,0,${0.45 * a})`); gr.addColorStop(1, "rgba(0,0,0,0)"); y.fillStyle = gr; y.beginPath(); y.arc(0, 0, 0.2 * H * sk, 0, 6.283); y.fill(); y.restore(); }
  const maos = o.maos || ["aberta", "aberta"];
  const braco = ([Sb, E, W], k, atras) => {
    const al = atras ? 0.75 : 1, uA = un(Sb, E), uF = un(E, W), sx = 1.02 + 0.14 * L;
    peca("braco", Sb, uA, { al, sx, rgb: PELE });
    peca("antebraco", E, uF, { al, sx, rgb: PELE });
    peca("mao_" + (maos[k] || "aberta"), W, uF, { al, sx: hk > 1 ? 1.0 : 0.94, sy: hk > 1 ? 1.0 : 0.94, rgb: PELE });
    if (F.manga === "manga_curta") peca("manga_curta", Sb, uA, { al, sx: sx * 1.02 });
    if (F.manga === "manga_longa") { peca("manga_longa_braco", Sb, uA, { al, sx }); peca("manga_longa", E, uF, { al, sx }); }
  };
  const perna = ([Q, K, Fp], atras) => {
    const al = atras ? 0.75 : 1, uC = un(Q, K), uS = un(K, Fp), sx = 0.9 + 0.12 * L, uP = un([0, 0], [uS[0] * 0.35, 0.65 + uS[1] * 0.35]);
    peca("coxa", Q, uC, { al, sx, rgb: PELE }); peca("canela", K, uS, { al, sx, rgb: PELE }); peca("pe", Fp, uP, { al, rgb: PELE });
  };
  // ---- ordem: braço de trás, (objeto de trás), pernas, túnica, tronco, cinto, manto, pescoço, cabeça, cabelo/barba/cobertura, braço da frente ----
  braco(bracos[0], 0, true);
  if (o.atras) { y.save(); o.atras(y, info()); y.restore(); y.globalAlpha = a; }
  perna(pernas[0], true); perna(pernas[1], false);
  // túnica (saia): cai da cintura até a barra; a barra acompanha as coxas (passo, sentado) — mesmo traço das peças
  const uT = un(C, [0, 0]), fT = fr(uT), T = (px, py) => [fT[0] * px * s * L + uT[0] * py * s, fT[1] * px * s * L + uT[1] * py * s];
  const h = (F.barra || 320) * s, naPerna = (pp, dist) => { const [Q, K, Fp] = pp, lc = Math.hypot(K[0] - Q[0], K[1] - Q[1]); if (dist <= lc) return ad(Q, un(Q, K), dist); return ad(K, un(K, Fp), Math.min(dist - lc, Math.hypot(Fp[0] - K[0], Fp[1] - K[1]))); };
  const ppF = pernas[0][3] * d >= pernas[1][3] * d ? pernas[0] : pernas[1], ppB = ppF === pernas[0] ? pernas[1] : pernas[0];
  const pF = naPerna(ppF, h), pB = naPerna(ppB, h), nF = fr(un(ppF[0], ppF[1])), nB = fr(un(ppB[0], ppB[1]));
  const hemF = ad(pF, nF, 0.06 * H * L), hemB = ad(pB, nB, -0.064 * H * L), bal = 0.005 * H * Math.sin(t * 2.3 + fase);
  const meio = [(hemF[0] + hemB[0]) / 2 + bal, (hemF[1] + hemB[1]) / 2 + 0.01 * H];
  const hB = T(-62, 34), hF = T(62, 34), wB = T(-58, -22), wF = T(58, -22);
  { const sp = [wB, hB, hemB, meio, hemF, hF, wF].map(pr); y.beginPath(); y.moveTo(sp[0][0], sp[0][1]); y.quadraticCurveTo(sp[1][0], sp[1][1], (sp[1][0] + sp[2][0]) / 2, (sp[1][1] + sp[2][1]) / 2);
    y.lineTo(sp[2][0], sp[2][1]); y.quadraticCurveTo(sp[3][0], sp[3][1], sp[4][0], sp[4][1]); y.lineTo((sp[5][0] + sp[4][0]) / 2, (sp[5][1] + sp[4][1]) / 2); y.quadraticCurveTo(sp[5][0], sp[5][1], sp[6][0], sp[6][1]); y.closePath();
    y.fillStyle = `rgba(${fundo},0.95)`; y.fill(); let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const [px, py] of sp) { x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); }
    const g = y.createLinearGradient(d > 0 ? x1 : x0, y0, d > 0 ? x0 : x1, y1); g.addColorStop(0, `rgba(${RGB},0.15)`); g.addColorStop(0.5, `rgba(${RGB},0.03)`); g.addColorStop(1, "rgba(0,0,0,0)"); y.fillStyle = g; y.fill();
    y.strokeStyle = `rgba(${RGB},1)`; y.lineWidth = LW; y.shadowColor = `rgba(${RGB},0.65)`; y.shadowBlur = 9 * kk; y.stroke(); y.shadowBlur = 0; y.stroke();
    // faixa bordada perto da barra (estilo pela ficha: linha, dupla, zigue, pontos, nenhuma)
    const est = F.barraEstilo ?? "linha";
    if (est) { const up2 = (P, k) => [P[0] + (k * 0.035 * H) * (-uT[0]), P[1] + (k * 0.035 * H) * (-uT[1])];
      const curva = (k) => { const A = pr(up2(hemB, k)), M = pr(up2(meio, k)), Bq = pr(up2(hemF, k)); return (u) => [(1 - u) * (1 - u) * A[0] + 2 * u * (1 - u) * M[0] + u * u * Bq[0], (1 - u) * (1 - u) * A[1] + 2 * u * (1 - u) * M[1] + u * u * Bq[1]]; };
      y.strokeStyle = `rgba(${ROUPA2},0.85)`; y.fillStyle = `rgba(${ROUPA2},0.85)`; y.lineWidth = LW * 0.6;
      const linha = (k) => { const c2 = curva(k); y.beginPath(); for (let j = 0; j <= 16; j++) { const [px, py] = c2(j / 16); j ? y.lineTo(px, py) : y.moveTo(px, py); } y.stroke(); };
      if (est === "linha" || est === "dupla") linha(1); if (est === "dupla") linha(1.6);
      if (est === "zigue") { const c1 = curva(0.7), c3 = curva(1.5); y.beginPath(); for (let j = 0; j <= 14; j++) { const [px, py] = (j % 2 ? c3 : c1)(j / 14); j ? y.lineTo(px, py) : y.moveTo(px, py); } y.stroke(); linha(1.8); }
      if (est === "pontos") { const c2 = curva(1.1); for (let j = 1; j < 12; j++) { const [px, py] = c2(j / 12); y.beginPath(); y.arc(px, py, Math.max(1, LW * 0.6), 0, 6.283); y.fill(); } linha(1.7); } }
  }
  for (const [k, w] of [[0.3, 0.2], [0.65, -0.15]]) { const top = T(-40 + 80 * k, -10), bot = [PT.lerp(hemB[0], hemF[0], k), PT.lerp(hemB[1], hemF[1], k) - 0.01 * H]; traca([top, [(top[0] + bot[0]) / 2 + w * 0.02 * H * d, (top[1] + bot[1]) / 2], bot].map(pr), false, { lw: 0.55, det: true, al: 0.7, fill: false }); }
  // tronco, cinto, manto
  peca(F.corpo || "tronco", [0, 0], uT, { sx: 1.12 * L });
  if (F.clavi) for (const cx of [18, 30]) traca(poe([[cx, -270], [cx + 2, -150], [cx, -40]], [0, 0], uT, 1.12 * L, 1), false, { lw: 0.6, det: true, rgb: ROUPA2, fill: false });
  if (F.colete) peca("colete", [0, 0], uT, { sx: 1.12 * L, rgb: ROUPA2 });
  if (F.cinto) peca("cinto", [0, 0], uT, { sx: 1.12 * L, rgb: ROUPA2 });
  if (F.xale) peca("xale", [0, 0], uT, { sx: 1.12 * L, rgb: ROUPA2 });
  if (F.manto) peca("manto", [0, 0], uT, { sx: 1.12 * L, sy: Math.max(0.7, (F.barra || 400) / 430), rgb: rgbOf(F.corManto || cor) });
  // pescoço e cabeça (cabeça no osso do pescoço → centro), cabelo, barba, cobertura
  { const uN = un(N, C), fN = fr(uN); traca([ad(C, fN, 0.02 * H), ad(N, fN, 0.018 * H), ad(N, fN, -0.02 * H), ad(C, fN, -0.024 * H)].map(pr), true, { rgb: PELE }); }
  const uH = un(Hd, N), [hsx, hsy] = F.cab || [1, 1], hs = { sx: hsx * hk, sy: hsy * hk };
  peca(F.cabeca || "cabeca", N, uH, { ...hs, rgb: PELE });
  kitRosto(y, (pts) => poe(pts, N, uH, hs.sx, hs.sy), traca, { expr: o.expr || F.expr || "neutro", t, fase, idade: id, PELE, LW, kk, a, cilios: F.cilios });
  if (F.barba) peca(F.barba, N, uH, { ...hs, rgb: CABELO });
  if (F.cabelo && F.cobertura !== "veu" && F.cobertura !== "pano_cabeca") peca(F.cabelo, N, uH, { ...hs, rgb: CABELO });
  if (F.cobertura) peca(F.cobertura, N, uH, { ...hs, rgb: ROUPA2 });
  braco(bracos[1], 1, false);
  y.restore();
  return info();
}

// ---------------- rosto de perfil: olho, sobrancelha, boca, orelha e marcas da idade ----------------
// expr: neutro | sorri | triste | medo | espanto | dorme (olhos fechados) | fala (boca abre e fecha)
function kitRosto(y, poe, traca, o) {
  const pisca = !o.expr.startsWith("dorme") && ((o.t + o.fase * 0.37) % 4.3) < 0.13, fechado = o.expr === "dorme" || pisca;
  const det = (pts, o2 = {}) => traca(poe(pts), false, { rgb: o.PELE, lw: 0.6, det: true, fill: false, ...o2 });
  // orelha
  det([[-2, -94], [-13, -92], [-17, -79], [-13, -66], [-3, -66]], { lw: 0.7 }); det([[-7, -86], [-10, -78], [-6, -72]], { lw: 0.45 });
  // olho
  if (fechado) det([[33, -86], [39, -82], [46, -85]], { lw: 0.75 });
  else {
    const ab = o.expr === "espanto" || o.expr === "medo" ? 1.35 : 1;
    traca(poe([[32, -87], [38, -90 - 2 * ab], [45, -89], [49, -86], [44, -83], [37, -83]]), true, { rgb: o.PELE, lw: 0.55, det: true, fa: 0.9 });
    const [px, py] = poe([[42, -86.5]])[0]; y.beginPath(); y.arc(px, py, Math.max(1.4, 3.6 * o.kk * o.LW / 3.5), 0, 6.283); y.fillStyle = `rgba(${o.PELE},${o.a})`; y.fill();
    if (o.cilios) det([[45, -89], [50, -92]], { lw: 0.45 });
  }
  // sobrancelha (o ângulo conta a emoção)
  const sob = { neutro: [[32, -98], [41, -101], [50, -98]], sorri: [[32, -99], [41, -103], [50, -100]], triste: [[32, -101], [41, -100], [50, -95]], medo: [[32, -102], [41, -102], [50, -97]], espanto: [[32, -103], [41, -107], [50, -103]], dorme: [[32, -97], [41, -99], [50, -97]], fala: [[32, -99], [41, -102], [50, -99]] }[o.expr] || [[32, -98], [41, -101], [50, -98]];
  det(sob, { lw: 0.85 });
  // boca
  if (o.expr === "sorri") det([[49, -41], [54, -37], [59, -39]], { lw: 0.7 });
  else if (o.expr === "triste") det([[49, -36], [54, -39], [58, -37]], { lw: 0.7 });
  else if (o.expr === "espanto" || o.expr === "medo") traca(poe([[52, -41], [57, -42], [58, -35], [53, -34]]), true, { rgb: o.PELE, lw: 0.55, det: true });
  else if (o.expr === "fala") { const ab = Math.max(0, Math.sin(o.t * 11 + o.fase)) * 4; traca(poe([[51, -40], [58, -41], [58, -37 + ab * 0.3], [52, -36 - ab * 0.2 + ab]]), true, { rgb: o.PELE, lw: 0.55, det: true }); }
  else det([[50, -38], [57, -38]], { lw: 0.65 });
  // linha da bochecha e, com a idade, rugas
  det([[46, -66], [44, -56], [47, -48]], { lw: 0.45, al: 0.6 });
  if (o.idade > 0.2) { det([[22, -90], [26, -84]], { lw: 0.45, al: 0.7 }); det([[48, -104], [40, -106]], { lw: 0.4, al: 0.6 }); det([[44, -48], [42, -40]], { lw: 0.45, al: 0.7 }); }
}
