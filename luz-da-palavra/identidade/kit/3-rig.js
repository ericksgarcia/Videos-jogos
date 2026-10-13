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
  const LW = Math.max(1.4, Math.min(3.2, 0.0058 * H * kk)); // traço fino e elegante em qualquer tamanho
  y.save(); y.setTransform(1, 0, 0, 1, 0, 0); y.lineJoin = "round"; y.lineCap = "round"; y.globalAlpha = a;
  // camada (2.5D): o.camada = "tras" | "corpo" | "frente" desenha só essa parte (braço de trás + asas / tudo no meio / braço da frente), para pôr cada uma numa profundidade
  const vis = (n) => { y.globalAlpha = (!o.camada || o.camada === n) ? a : 0; };
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
      if (o2.semTraco) return;
    }
    const c2 = o2.rgb || RGB; y.strokeStyle = `rgba(${c2},${(o2.al ?? 1)})`; y.lineWidth = LW * (o2.lw || 1);
    y.shadowColor = `rgba(${c2},0.65)`; y.shadowBlur = (o2.det ? 5 : 9) * kk; y.stroke(); y.shadowBlur = 0; y.stroke();
  };
  const peca = (nome, P, u, o2 = {}) => {
    const pc = KIT_PECAS[nome]; if (!pc) return; const sx = o2.sx ?? 1, sy = o2.sy ?? 1;
    let cont = pc.contorno;
    if (pc.cachos) { const cx = cont.reduce((m, p) => m + p[0], 0) / cont.length, cy = cont.reduce((m, p) => m + p[1], 0) / cont.length; const out = []; for (let k = 0; k < cont.length; k++) { const p = cont[k], q = cont[(k + 1) % cont.length]; out.push(p); if (k < cont.length - 5) { const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2], dd = Math.hypot(m[0] - cx, m[1] - cy) || 1; out.push([m[0] + (m[0] - cx) / dd * 9, m[1] + (m[1] - cy) / dd * 9]); } } cont = out; }
    traca(poe(cont, P, u, sx, sy), true, o2);
    for (const ln of pc.linhas || []) kitPincel(y, poe(ln, P, u, sx, sy), LW * 0.8, o2.rgb || RGB, a * (o2.al ?? 1) * 0.8, { brilho: 4 * kk });
    if (pc.extra) { traca(poe(pc.extra.contorno, P, u, sx, sy), true, o2); for (const ln of pc.extra.linhas || []) traca(poe(ln, P, u, sx, sy), false, { ...o2, lw: 0.55, det: true, al: 0.8, fill: false }); }
  };
  // sombra no chão
  if (!o.camada && !o.semSombra) { const fx = (pernas[0][2][0] + pernas[1][2][0]) / 2, [sx, sy, sk] = pr([fx, baixo]); y.save(); y.translate(sx, sy); y.scale(1, 0.16); const gr = y.createRadialGradient(0, 0, 0, 0, 0, 0.2 * H * sk); gr.addColorStop(0, `rgba(0,0,0,${0.45 * a})`); gr.addColorStop(1, "rgba(0,0,0,0)"); y.fillStyle = gr; y.beginPath(); y.arc(0, 0, 0.2 * H * sk, 0, 6.283); y.fill(); y.restore(); }
  const maos = o.maos || ["aberta", "aberta"];
  // membro inteiro numa forma só (sem a emenda de boneco no cotovelo/joelho): cadeia de articulações + perfil
  // de larguras [segmento, u, largura de trás, largura da frente] em milésimos de H
  const membro = (J, perfil, k2 = 1, fim = 0.5, ini = 0.5) => {
    const E2 = [], D2 = [];
    perfil.forEach(([sg, u, wb, wf], i) => {
      const A = J[sg], B = J[sg + 1], p = [A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u];
      let dv = un(A, B); if (u === 0 && sg > 0) { const d0 = un(J[sg - 1], A); dv = un([0, 0], [d0[0] + dv[0], d0[1] + dv[1]]); }
      const n = fr(dv), ff = wf * s * k2, bb = wb * s * k2;
      if (i === 0 && ini) { E2.push([p[0] - dv[0] * ff * ini + n[0] * ff * 0.6, p[1] - dv[1] * ff * ini + n[1] * ff * 0.6]); }
      E2.push([p[0] + n[0] * ff, p[1] + n[1] * ff]); D2.push([p[0] - n[0] * bb, p[1] - n[1] * bb]);
      if (i === perfil.length - 1 && fim) { E2.push([p[0] + dv[0] * ff * fim + n[0] * ff * 0.45, p[1] + dv[1] * ff * fim + n[1] * ff * 0.45]); D2.push([p[0] + dv[0] * bb * fim - n[0] * bb * 0.45, p[1] + dv[1] * bb * fim - n[1] * bb * 0.45]); }
    });
    return [...E2, ...D2.reverse()];
  };
  const PERF_BRACO = [[0, 0, 23, 21], [0, 0.3, 21, 22], [0, 0.7, 17, 18], [1, 0, 14, 15], [1, 0.22, 16, 15], [1, 0.65, 12, 11.5], [1, 1, 9, 9.5]];
  const PERF_PERNA = [[0, 0, 34, 35], [0, 0.3, 32, 32], [0, 0.75, 25, 24], [1, 0, 19, 20], [1, 0.26, 24, 18], [1, 0.62, 16, 14], [1, 1, 11, 11]];
  const braco = ([Sb, E, W], k, atras) => {
    const al = atras ? 0.75 : 1, uA = un(Sb, E), uF = un(E, W), sx = 1.02 + 0.14 * L;
    traca(membro([Sb, E, W], PERF_BRACO, sx * 1.2).map(pr), true, { al, rgb: PELE });
    peca("mao_" + (maos[k] || "aberta"), W, uF, { al, sx: hk > 1 ? 1.0 : 0.94, sy: hk > 1 ? 1.0 : 0.94, rgb: PELE });
    // mangas de tecido: forma contínua com dobras de pincel; a longa abre em sino no punho
    const manga = (m) => { const sp = m.map(pr); traca(sp, true, { al, semTraco: true }); traca(sp, false, { al, fill: false }); }; // ombro sem emenda
    const dobra = (pts, w = 0.7, al2 = 0.75) => kitPincel(y, pts.map(pr), LW * w, RGB, a * al * al2, { brilho: 4 * kk });
    const ponto = (sg, u, lado) => { const J = [Sb, E, W], A = J[sg], B = J[sg + 1], n = fr(un(A, B)); return [A[0] + (B[0] - A[0]) * u + n[0] * lado * s * sx * 1.2, A[1] + (B[1] - A[1]) * u + n[1] * lado * s * sx * 1.2]; };
    { const crz = uA[0] * uF[1] - uA[1] * uF[0], dobrado = Math.min(1, Math.abs(crz) * 2.2); // dobras de compressão no lado de dentro do cotovelo
      if (dobrado > 0.3 && F.manga === "manga_longa") { const lado = crz > 0 ? 1 : -1; for (let q = 0; q < 3; q++) dobra([ponto(0, 0.93 - 0.05 * q, lado * 6), ponto(1, 0.06 + 0.07 * q, lado * 24), ponto(1, 0.1 + 0.07 * q, lado * 8)], 0.6, 0.35 + 0.4 * dobrado); } }
    if (F.manga === "manga_curta") {
      manga(membro([Sb, E, W], [[0, -0.14, 22, 20], [0, 0.04, 27, 25], [0, 0.3, 28, 28], [0, 0.58, 31, 32]], sx * 1.28, 0, 0));
      dobra([ponto(0, 0.5, -24), ponto(0, 0.53, 0), ponto(0, 0.5, 25)], 0.6, 0.6); dobra([ponto(0, 0.12, 6), ponto(0, 0.3, 10), ponto(0, 0.44, 6)], 0.6, 0.55);
    }
    if (F.manga === "manga_longa") {
      manga(membro([Sb, E, W], [[0, -0.14, 22, 20], [0, 0.04, 27, 25], [0, 0.45, 27, 27], [1, 0, 24, 26], [1, 0.45, 25, 27], [1, 0.82, 33, 34]], sx * 1.28, 0, 0));
      dobra([ponto(1, 0.76, -30), ponto(1, 0.8, 0), ponto(1, 0.76, 31)], 0.6, 0.6);
      dobra([ponto(0, 0.82, 14), ponto(0, 0.92, 4), ponto(1, 0.06, 12)], 0.7, 0.7); dobra([ponto(1, 0.1, -16), ponto(1, 0.35, -6), ponto(1, 0.6, -10)], 0.6, 0.55);
      dobra([ponto(0, 0.15, 4), ponto(0, 0.45, 8), ponto(0, 0.7, 2)], 0.6, 0.5);
    }
  };
  const perna = ([Q, K, Fp], atras) => {
    const al = atras ? 0.75 : 1, uC = un(Q, K), uS = un(K, Fp), sx = 0.9 + 0.12 * L, uP = un([0, 0], [uS[0] * 0.35, 0.65 + uS[1] * 0.35]);
    traca(membro([Q, K, Fp], PERF_PERNA, sx * 1.3, 0).map(pr), true, { al, rgb: PELE }); peca("pe", Fp, uP, { al, rgb: PELE });
  };
  // ---- ordem: braço de trás, (objeto de trás), pernas, túnica, tronco, cinto, manto, pescoço, cabeça, cabelo/barba/cobertura, braço da frente ----
  // asas (anjos): nascem atrás das omoplatas; o.asas (0–1) abre/fecha, respiram sozinhas
  vis("tras");
  if (F.asas) { const uW = un(C, [0, 0]), abre = (o.asas ?? 0.85) + 0.04 * Math.sin(t * 1.6 + fase), raiz = [-34, -240];
    const gira2 = (pts, k) => pts.map(([px, py]) => { const an = (1 - abre) * 0.9 * k, dx = px - raiz[0], dy = py - raiz[1]; return [raiz[0] + dx * Math.cos(an) + dy * Math.sin(an) * -1, raiz[1] + dx * Math.sin(an) + dy * Math.cos(an)]; });
    const ASA = [[-30, -250], [-42, -312], [-76, -392], [-126, -452], [-178, -476], [-216, -466], [-234, -432], [-240, -380], [-248, -318], [-260, -248], [-272, -176], [-284, -104], [-294, -40], [-272, -30], [-256, -74], [-240, -52], [-222, -108], [-204, -88], [-186, -150], [-166, -130], [-146, -194], [-124, -178], [-104, -220], [-80, -208], [-56, -232]];
    const PENAS = [[[-206, -440], [-244, -260], [-276, -56]], [[-176, -436], [-212, -280], [-244, -86]], [[-146, -420], [-180, -290], [-210, -116]], [[-116, -392], [-146, -300], [-174, -158]], [[-86, -352], [-110, -290], [-132, -204]],
      [[-52, -300], [-110, -372], [-176, -420], [-226, -424]], [[-48, -276], [-100, -330], [-160, -366], [-232, -366]]];
    for (const [k, al2, dx] of [[1.3, 0.55, -22], [1, 1, 0]]) { const tr = (pts) => poe(gira2(pts.map(([px, py]) => [px + dx, py - dx * 0.4]), k), [0, 0], uW, 1, 1);
      traca(tr(ASA), true, { rgb: ROUPA2, al: al2 }); for (const pn of PENAS) kitPincel(y, tr(pn), LW * 0.8, ROUPA2, a * al2 * 0.75, { brilho: 4 * kk }); } }
  braco(bracos[0], 0, true);
  if (o.atras && (!o.camada || o.camada === "tras")) { y.save(); o.atras(y, info()); y.restore(); }
  vis("corpo");
  perna(pernas[0], true); perna(pernas[1], false);
  // túnica (saia): cai da cintura até a barra; a barra acompanha as coxas (passo, sentado) — mesmo traço das peças
  const uT = un(C, [0, 0]), fT = fr(uT), T = (px, py) => [fT[0] * px * s * L + uT[0] * py * s, fT[1] * px * s * L + uT[1] * py * s];
  const h = (F.barra || 320) * s, naPerna = (pp, dist) => { const [Q, K, Fp] = pp, lc = Math.hypot(K[0] - Q[0], K[1] - Q[1]); if (dist <= lc) return ad(Q, un(Q, K), dist); return [K[0], K[1] + Math.max(0, Math.min(dist - lc, baixo - 0.012 * H - K[1]))]; }; // abaixo do joelho o pano cai na vertical (ajoelhado: fica no chão)
  const ppF = pernas[0][3] * d >= pernas[1][3] * d ? pernas[0] : pernas[1], ppB = ppF === pernas[0] ? pernas[1] : pernas[0];
  const pF = naPerna(ppF, h), pB = naPerna(ppB, h), nF = fr(un(ppF[0], ppF[1])), nB = fr(un(ppB[0], ppB[1]));
  const roda = Math.max(0, ((F.barra || 320) - 300) / 140) * 0.045 * H, hemF = ad(pF, nF, 0.06 * H * L + roda), hemB = ad(pB, nB, -0.064 * H * L - roda * 1.1), bal = 0.005 * H * Math.sin(t * 2.3 + fase);
  // ajoelhado/sentado: o pano cai pela gravidade (o ponto médio da barra desce até o nível do chão/da perna mais baixa)
  const abre2 = Math.max(0, Math.min(1, (Math.abs(pernas[0][3] - pernas[1][3]) - 0.6) / 0.8)), baixoHem = Math.max(hemF[1], hemB[1]) + 0.015 * H;
  const meio = [(hemF[0] + hemB[0]) / 2 + bal - 0.05 * H * d * abre2, PT.lerp((hemF[1] + hemB[1]) / 2 + 0.01 * H, baixoHem, abre2)];
  const hB = T(-62, 34), hF = T(62, 34), wB = T(-56, -42), wF = T(56, -42);
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
  // dobras da saia com lógica de tecido: "de queda" (cones que nascem na cintura/quadril e abrem até a barra, em S), uma dobra em U
  // entre as pernas (o pano que pende de um quadril ao outro) e a barra que ondula
  { const nF2 = 6, hemPt = (u) => { const q = [PT.lerp(hemB[0], hemF[0], u), PT.lerp(hemB[1], hemF[1], u)], dentro = u < 0.5 ? u : 1 - u; return [q[0], q[1] - 0.012 * H + (0.006 * H) * Math.sin(u * 17 + fase) - 0.012 * H * (1 - dentro * 2) * 0.4]; };
    for (let n = 0; n < nF2; n++) { const u = (n + 0.5) / nF2, top = T(-46 + 92 * u, -18), bot = hemPt(u), cur = Math.sin(u * 9.4 + fase) * 0.016 * H * d, m1 = [PT.lerp(top[0], bot[0], 0.45) + cur, PT.lerp(top[1], bot[1], 0.45)], m2 = [PT.lerp(top[0], bot[0], 0.78) - cur * 0.8, PT.lerp(top[1], bot[1], 0.78)];
      kitPincel(y, [top, m1, m2, bot].map(pr), LW * (0.55 + 0.45 * Math.abs(Math.sin(n * 2.3 + 1))), RGB, a * (0.3 + 0.35 * Math.abs(Math.cos(n * 1.7 + 0.4))), { brilho: 4 * kk, ini: 0.05, fim: 0.45 }); }
    const aperto = Math.abs(pernas[0][3] - pernas[1][3]);
    if (aperto > 0.3) { const ap = [PT.lerp(T(0, 30)[0], meio[0], 0.42), PT.lerp(T(0, 30)[1], meio[1], 0.42)]; kitPincel(y, [T(-44, 26), [ap[0] - 0.03 * H * d, ap[1] - 0.01 * H], [ap[0] + 0.03 * H * d, ap[1] - 0.01 * H], T(44, 26)].map(pr), LW * 0.8, RGB, a * Math.min(0.7, 0.15 + aperto * 0.3), { brilho: 4 * kk }); } }
  // tronco, cinto, manto
  { const pc = KIT_PECAS[F.corpo || "tronco"], sp = poe(pc.contorno, [0, 0], uT, 1.12 * L, 1); traca(sp, true, { semTraco: true }); traca(sp.slice(0, 15), false, { fill: false });
    const pt2 = (pts) => poe(pts, [0, 0], uT, 1.12 * L, 1);
    kitPincel(y, pt2([[-8, -282], [6, -262], [22, -246], [30, -258], [34, -272]]), LW * 0.85, RGB, a * 0.9, { brilho: 4 * kk }); // decote
    kitPincel(y, pt2([[30, -244], [38, -200], [42, -150], [38, -100]]), LW * 0.7, RGB, a * 0.55, { brilho: 3 * kk });
    kitPincel(y, pt2([[-44, -236], [-46, -170], [-42, -110]]), LW * 0.7, RGB, a * 0.5, { brilho: 3 * kk });
    kitPincel(y, pt2([[8, -150], [18, -100], [14, -60]]), LW * 0.6, RGB, a * 0.45, { brilho: 3 * kk }); }
  if (F.clavi) for (const cx of [18, 30]) traca(poe([[cx, -270], [cx + 2, -150], [cx, -40]], [0, 0], uT, 1.12 * L, 1), false, { lw: 0.6, det: true, rgb: ROUPA2, fill: false });
  if (F.colete) peca("colete", [0, 0], uT, { sx: 1.12 * L, rgb: ROUPA2 });
  if (F.cinto) { const pt2 = (pts) => poe(pts, [0, 0], uT, 1.12 * L, 1); // faixa de pano amarrada na frente, pontas caindo
    for (const pp of [[[46, -36], [54, -12], [52, 16]], [[44, -34], [48, -6], [56, 22]]]) kitPincel(y, pt2(pp), LW * 2.6, ROUPA2, a * 0.9, { brilho: 5 * kk, ini: 0.5, fim: 0.15 });
    traca(pt2([[-55, -48], [0, -52], [55, -48], [56, -40], [55, -31], [0, -33], [-55, -31], [-56, -40]]), true, { rgb: ROUPA2, lw: 0.9 });
    kitPincel(y, pt2([[-50, -41], [0, -43], [48, -41]]), LW * 0.6, ROUPA2, a * 0.6, { brilho: 3 * kk });
    traca(pt2([[40, -46], [50, -48], [54, -40], [50, -32], [40, -34], [38, -40]]), true, { rgb: ROUPA2, lw: 0.9 }); }
  if (F.xale) peca("xale", [0, 0], uT, { sx: 1.12 * L, rgb: ROUPA2 });
  if (F.manto) peca("manto", [0, 0], uT, { sx: 1.12 * L, sy: Math.max(0.7, (F.barra || 400) / 430), rgb: rgbOf(F.corManto || cor) });
  // pescoço e cabeça (cabeça no osso do pescoço → centro), cabelo, barba, cobertura
  const uH = un(Hd, N), [hsx, hsy] = F.cab || [1, 1], hs = { sx: hsx * hk, sy: hsy * hk };
  // pescoço: nasce embaixo da mandíbula (frente) e na nuca (trás), entra na cabeça; só os lados têm traço
  { const uN = un(N, C), fN = fr(uN), [tf, tb] = poe([[18, 0], [-40, -30]], N, uH, hs.sx, hs.sy), bf = pr(ad(C, fN, 0.026 * H)), bb = pr(ad(C, fN, -0.03 * H));
    traca([tf, bf, bb, tb], true, { rgb: PELE, semTraco: true }); traca([tf, bf], false, { rgb: PELE, fill: false }); traca([tb, bb], false, { rgb: PELE, fill: false }); }
  // rosto por medidas (ficha.rosto) ou pelo perfil antigo da ficha (cabeca_aquilino, cabeca_curto, cabeca_queixo)
  const R = { ...({ cabeca_aquilino: { nariz: 1.1, curva: 0.8 }, cabeca_curto: { nariz: 0.78, curva: -0.5, ponta: 0.5 }, cabeca_queixo: { queixo: 1, mandibula: 1 } }[F.cabeca] || {}), feminino: !!F.cilios, crianca: hk > 1, idade: id, ...(F.rosto || {}) };
  const poeF = kitFace((pts) => poe(pts, N, uH, hs.sx, hs.sy));
  { const sp = poeF(kitPerfil(R)); traca(sp, true, { rgb: PELE, semTraco: true }); traca(sp.slice(1), false, { rgb: PELE, fill: false }); }
  kitRosto(y, poeF, traca, { expr: o.expr || F.expr || "neutro", t, fase, idade: id, PELE, LW, kk, a, rosto: R });
  const poeH = poeF, oH = { rgb: CABELO, LW, kk, a, d, fundo, PELE };
  if (F.barba && !kitBarba(y, F.barba, poeH, oH)) peca(F.barba, N, uH, { ...hs, rgb: CABELO });
  const cobre = F.cobertura === "veu" || F.cobertura === "pano_cabeca";
  let orelha = !cobre;
  if (F.cabelo && !cobre) { const r = kitCabelo(y, F.cabelo, poeH, oH); if (r === null) peca(F.cabelo, N, uH, { ...hs, rgb: CABELO }); else orelha = r; }
  if (orelha) kitOrelha(y, poeH, oH);
  if (F.cobertura && !kitCobertura(y, F.cobertura, poeH, { ...oH, rgb: ROUPA2 }, { rgbEsc: rgbOf(mixCor(tinge(F.roupa2 || [1, 0.84, 0.55]), [0.2, 0.15, 0.1], 0.45)), cabelo: F.cabelo ? CABELO : null }))
    peca(F.cobertura, N, uH, { ...hs, rgb: ROUPA2 });
  vis("frente");
  braco(bracos[1], 1, false);
  y.restore();
  return info();
}
