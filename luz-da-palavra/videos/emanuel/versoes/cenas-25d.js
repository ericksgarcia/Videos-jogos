// Cenas do vídeo "O que significa Emanuel" — Luz da Palavra. Cenas com personagens em 2.5D (cenário Three.js + personagens
// do kit no estilo cheio, em 3 planos); tipografia, pergunta e cartão final em pontos de luz.
// Retenção: quadro 0 = alguém sozinho numa pedra sob um céu enorme e UMA estrela forte; gancho emocional
// ("pra quem se sentiu sozinho"); laço aberto (o nome aparece de novo no fim do mesmo livro) pago em
// Mateus 28:20; José decide ir embora → sonho, o anjo ("não temas") → (o apelo à fé vem logo depois da abertura) → EMANUEL →
// hebraico (imanu = conosco, El = Deus) → a estrela desce até a manjedoura → o livro que abre e fecha com
// a mesma promessa → pergunta única.
// Fontes: Mateus 1:18–23 (José, o sonho, Emanuel); Isaías 7:14; Mateus 28:20. Personagens pesquisados:
// José (túnica ocre, manto escuro esverdeado, barba: iconografia tradicional), anjo (veste branca, Mt 28:3;
// asas da arte tradicional), Maria (véu azul) — fichas em identidade/kit/2-elenco.js.

const EM_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.82) };
const EM_EST = fundoProfundo(231, 900);
const EM_CASA = { desenho: (g, R) => { // casa de teto plano, com porta e janela (vazias)
  const r = (x0, y0, x1, y1) => g.fillRect(R * x0, R * y0, R * (x1 - x0), R * (y1 - y0));
  r(0.12, 0.34, 0.88, 0.9); r(0.08, 0.3, 0.92, 0.36); r(0.6, 0.18, 0.86, 0.32);
  g.globalCompositeOperation = "destination-out"; r(0.22, 0.56, 0.38, 0.9); r(0.58, 0.48, 0.74, 0.64); g.globalCompositeOperation = "source-over";
} };
const EM_ESTABULO = { desenho: (g, R) => { // estábulo: dois postes, teto inclinado de palha, parede do fundo em tábuas
  g.strokeStyle = "#fff"; g.lineCap = "round"; const L = (w, ...p) => { g.lineWidth = R * w; g.beginPath(); g.moveTo(R * p[0], R * p[1]); for (let k = 2; k < p.length; k += 2) g.lineTo(R * p[k], R * p[k + 1]); g.stroke(); };
  L(0.035, 0.14, 0.95, 0.14, 0.3); L(0.035, 0.86, 0.95, 0.86, 0.36); L(0.05, 0.04, 0.34, 0.5, 0.12, 0.96, 0.4);
  for (let k = 0; k < 7; k++) L(0.012, 0.2 + k * 0.1, 0.33 - 0.03 * Math.abs(k - 3) + 0.0, 0.2 + k * 0.1, 0.95);
} };
const EM_F = {
  estrela: formaPontos("star-four", 9000), casa: formaPontos(EM_CASA, 5000, { espessura: 0.08 }), estabulo: formaPontos(EM_ESTABULO, 10000, { espessura: 0.06 }),
  emanuel: formaTexto("EMANUEL", 12000, { fonte: "Cinzel", peso: 700, tam: 0.24 }), hebr: formaTexto("עִמָּנוּ אֵל", 12000, { fonte: "serif", peso: 700, tam: 0.3 }),
  deus: formaTexto("DEUS CONOSCO", 12000, { fonte: "Cinzel", peso: 700, tam: 0.16 }), livro: formaPontos("book-open", 12000), poeira: poeiraForma(9000, 233, 0.5),
};
// céu estrelado (estrelas que cintilam + faixa da Via Láctea) e chão de dunas em pontos — sempre iguais (prng)
const EM_CEU = (() => { const r = prng(229), P = []; for (let k = 0; k < 2200; k++) { const via = k < 900, u = r();
  const x = via ? -100 + u * 1300 : r() * 1300 - 110, y = via ? 160 + u * 700 + (r() - 0.5) * 260 * (0.6 + r()) : r() * 1400 - 60; P.push([540 + (x - 540) * 2.6, 960 + (y - 960) * 2.6, r(), r(), via]); } return P; })();
const EM_CHAO = (() => { const r = prng(235), P = []; for (let k = 0; k < 4200; k++) { const lin = Math.floor(r() * 6), x = r() * 1700 - 310; P.push([x, lin, r(), r()]); } return P; })();
function EM_ceu(nv, x, i, t, cam, a = 1, chao = 1380) {
  i = desenharFundo(nv, EM_EST, t, cam, LUZ.luz, 0.8 * a, i);
  brilhoP(x, 540, chao + 60, 1000, LUZS.ambar, 0.1 * a); brilhoP(x, 300, 500, 800, "70,80,170", 0.1 * a);
  for (const [X, Y, v, s, via] of EM_CEU) { const [px, py, k] = projP(cam, X, Y, 2.6); if (py > chao + 40) continue; const tw = 0.55 + 0.45 * Math.sin(t * (0.8 + 2 * v) + s * 40);
    const c2 = s < 0.15 ? LUZ.ambar : s < 0.3 ? [0.75, 0.82, 1] : LUZ.luz;
    nv.ponto(i++, px, py, c2[0], c2[1], c2[2], a * (via ? 0.3 + 0.35 * v : 0.45 + 0.55 * v) * tw, via ? 2 + 2 * s : 2.2 + 4.5 * v * v * v); }
  // dunas: linhas de crista mais claras na frente
  for (const [X, lin, v, s] of EM_CHAO) { const Y = chao + lin * 60 + Math.sin(X * 0.0035 + lin * 1.7) * 38 + v * v * 60, z = 1.5 - lin * 0.1, [px, py, k] = projP(cam, X, Y, z);
    nv.ponto(i++, px, py, 0.85, 0.7, 0.55, a * (0.1 + 0.28 * s) * (0.55 + lin * 0.1) * (v < 0.15 ? 2.2 : 1), (1.8 + 2.4 * s) * k); }
  return i;
}
// pedra sob quem está sentado: mede o quadril do personagem e põe a pedra ali
function EM_sentado(nv, x, i, t, pose, op, seed = 7) {
  const m = figura(x, t, pose, { ...op, medir: true }), [qx, qy] = m.quadril, k = m.escala * op.H / 520, r = prng(seed);
  const chaoT = qy + 0.2 * op.H * m.escala; // a pedra vai do quadril até o chão
  for (let n = 0; n < 2600; n++) { const u = r() * 2 - 1, v = r(), topo = qy + 6 * k + 26 * k * u * u, px = qx + u * 150 * k + (op.dir || 1) * 30 * k, py = topo + v * (chaoT - topo), borda = v < 0.06 || Math.abs(u) > 0.94;
    nv.ponto(i++, px, py, 0.8, 0.7, 0.6, (borda ? 0.55 : 0.12 + 0.22 * r()) * (1 - 0.4 * v), (2 + 2.5 * r()) * m.escala); }
  brilhoP(x, qx, qy + 60 * k, 160 * k, LUZS.ambar, 0.08);
  figura(x, t, pose, op); return i;
}
// estrela forte com raios (posição em tela)
function EM_estrela(nv, x, i, t, sx, sy, esc, a, bri = 1) {
  brilhoP(x, sx, sy, esc * 2.2, LUZS.ambar, 0.22 * a * bri); brilhoP(x, sx, sy, esc * 0.9, LUZS.luz, 0.35 * a * bri);
  for (let r = 0; r < 12; r++) { const an = r * Math.PI / 6 + t * 0.05, L = esc * (1.4 + 0.6 * Math.sin(t * 1.3 + r)) * bri; linhaP(x, sx, sy, sx + Math.cos(an) * L, sy + Math.sin(an) * L, LUZS.ouro, 0.06 * a, 3); }
  return desenharForma(nv, EM_F.estrela, { cx: sx, cy: sy, esc, cor: LUZ.ouro, borda: LUZ.luz, brilho: 1.1 * bri, a, giro: 0.05 * Math.sin(t), t, i0: i });
}
const EM_PEDRA = (cx, cy, w, h, seed) => { const r = prng(seed), P = []; for (let k = 0; k < 900; k++) { const an = r() * Math.PI, d = Math.sqrt(r()); P.push([cx + Math.cos(an) * w * d, cy - Math.sin(an) * h * d, r()]); } return P; };
function EM_pedra(nv, i, cam, P, a = 1) { for (const [X, Y, s] of P) { const [px, py, k] = projP(cam, X, Y, 1); nv.ponto(i++, px, py, 0.72, 0.64, 0.58, a * (0.12 + 0.2 * s), (2 + 2 * s) * k); } return i; }

// ======================= mundo 3D comum: deserto da Judeia à noite =======================
// céu em degradê (cúpula), estrelas e Via Láctea, morros ao longe, chão plano perto dos personagens e dunas mais longe.
function EM3_mundo(k, o = {}) {
  const { cena } = k, r = prng(o.seed || 251), anima = [];
  cena.environment = null; cena.background = null; cena.fog = new THREE.FogExp2(0x101634, o.nevoa ?? 0.018);
  cena.children.forEach((q) => { if (q.isHemisphereLight) { q.intensity = 0.55; q.color.set(0x9aa8ff); q.groundColor.set(0x2a2030); } });
  k.luzes.chave.intensity = 0.7; k.luzes.chave.color.set(0xa9b8ff); k.luzes.chave.position.set(-6, 10, 5); k.luzes.contra.intensity = 0.35; k.luzes.contra.color.set(0x7d8fff);
  // cúpula do céu: azul profundo no alto, violeta e um fio quente no horizonte
  const gS = new THREE.SphereGeometry(150, 32, 16), cs = [], ps = gS.attributes.position;
  for (let i = 0; i < ps.count; i++) { const h = Math.max(-0.1, ps.getY(i) / 150), c = new THREE.Color(), a = new THREE.Color(0x0a1030), b = new THREE.Color(0x2c2350), q = new THREE.Color(0x5a3a52);
    c.copy(b).lerp(a, Math.min(1, Math.max(0, h * 2.2))); if (h < 0.06) c.lerp(q, 1 - Math.max(0, h) / 0.06); cs.push(c.r, c.g, c.b); }
  gS.setAttribute("color", new THREE.Float32BufferAttribute(cs, 3)); cena.add(new THREE.Mesh(gS, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
  // estrelas (algumas grandes) e a faixa da Via Láctea
  const pts = (n, f, tam, op, cor) => { const pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const [x, y, z] = f(); pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); const m = new THREE.PointsMaterial({ color: cor, size: tam, sizeAttenuation: false, transparent: true, opacity: op, fog: false, depthWrite: false }); cena.add(new THREE.Points(g, m)); return m; };
  const naCupula = () => { const az = r() * 6.283, el = 0.03 + Math.acos(1 - r()) * 0.95, R = 140; return [Math.cos(az) * Math.cos(el) * R, Math.sin(el) * R, Math.sin(az) * Math.cos(el) * R]; };
  const mE = pts(2600, naCupula, 2, 0.75, 0xfff1d6), mE2 = pts(160, naCupula, 3.6, 0.9, 0xffffff);
  pts(2400, () => { const u = r() * 6.283, w = (r() - 0.5) * 0.28 * (0.5 + r()); const v = [Math.cos(u), Math.sin(u) * 0.55 + 0.35 + w, Math.sin(u) * 0.8 + w]; const l = Math.hypot(...v); return v.map((q) => q / l * 140); }, 1.6, 0.35, 0xc9d2ff);
  anima.push((t) => { mE.opacity = 0.7 + 0.12 * Math.sin(t * 1.3); mE2.opacity = 0.8 + 0.15 * Math.sin(t * 0.9 + 1); });
  // chão: plano em volta dos personagens (o.centro, raio o.plano), dunas mais longe
  const gC = new THREE.PlaneGeometry(260, 260, 96, 96); gC.rotateX(-Math.PI / 2);
  const pc = gC.attributes.position, [cx, cz] = o.centro || [0, 0], rp = o.plano ?? 5;
  for (let i = 0; i < pc.count; i++) { const x = pc.getX(i), z = pc.getZ(i), d = Math.hypot(x - cx, z - cz), f = Math.min(1, Math.max(0, (d - rp) / 12)); pc.setY(i, f * f * (1.1 * Math.sin(x * 0.11 + z * 0.05) + 1.5 * Math.sin(z * 0.06 - x * 0.03) + 0.45 * Math.sin(x * 0.4 + z * 0.3))); }
  gC.computeVertexNormals(); cena.add(new THREE.Mesh(gC, new THREE.MeshLambertMaterial({ color: o.corChao ?? 0x4a3f5c })));
  // morros ao longe (silhuetas na névoa)
  const morro = new THREE.MeshLambertMaterial({ color: 0x2a2440 });
  for (let k2 = 0; k2 < 8; k2++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 8), morro); m.scale.set(16 + r() * 18, 5 + r() * 7, 9); m.position.set(-80 + k2 * 22 + r() * 8, -2, -75 - r() * 25); cena.add(m); }
  return { anim: (t) => anima.forEach((f) => f(t)) };
}
// a estrela de Belém: núcleo, halos e raios em cruz (sprites aditivos; não sofrem névoa)
function EM3_estrela(cena, x, y, z, tam = 2) {
  const g = new THREE.Group(); g.position.set(x, y, z); cena.add(g);
  const sp = (cor, s, op) => { const q = halo3D(cor, s, op); q.material.fog = false; g.add(q); return q; };
  const h1 = sp(0xffd9a0, tam * 5, 0.45), h2 = sp(0xffe8c0, tam * 2, 0.85), nu = sp(0xffffff, tam * 0.8, 1);
  const raio = (rot, L) => { const q = sp(0xfff0d0, 1, 0.9); q.material.rotation = rot; q.scale.set(tam * L, tam * 0.16, 1); return q; };
  const R1 = raio(0, 9), R2 = raio(Math.PI / 2, 9), R3 = raio(Math.PI / 4, 4.5), R4 = raio(-Math.PI / 4, 4.5);
  return { g, anim: (t, bri = 1) => { const p = 1 + 0.06 * Math.sin(t * 2.1); nu.scale.setScalar(tam * 0.8 * p * Math.max(0.01, bri)); h2.material.opacity = 0.85 * Math.min(1.3, bri); h1.scale.setScalar(tam * 5 * (0.9 + 0.2 * bri));
    for (const [q, L] of [[R1, 9], [R2, 9], [R3, 4.5], [R4, 4.5]]) q.scale.set(Math.max(0.01, tam * L * bri * (0.95 + 0.08 * Math.sin(t * 1.7 + L))), tam * 0.16, 1); } };
}
// pedra (rocha baixa, facetada) com as quinas levemente acesas
function EM3_pedra(cena, x, y, z, sx, sy, sz, seed) {
  const r = prng(seed), g = new THREE.DodecahedronGeometry(1, 1), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) { const f = 0.85 + 0.25 * Math.sin(p.getX(i) * 3.1 + seed) * Math.cos(p.getZ(i) * 2.7 + seed * 0.3); p.setXYZ(i, p.getX(i) * f, p.getY(i) * f, p.getZ(i) * f); }
  g.computeVertexNormals(); const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ color: 0x6a5d70, flatShading: true })); m.position.set(x, y, z); m.scale.set(sx, sy, sz); m.rotation.y = r() * 3; cena.add(m);
  cena.add(T25_arestas(m, 0xffd4a0, 0.18)); return m;
}
// vila: casas de barro de teto plano (quinas acesas, janelas quentes); lista de [x, z, largura, altura, fundo, porta (deslocamento x)]
function EM3_vila(cena, seed, casas) {
  const r = prng(seed), barro = new THREE.MeshLambertMaterial({ color: 0x6b5866 }), teto = new THREE.MeshLambertMaterial({ color: 0x55465a }), out = [];
  for (const [x, z, w, h, d, porta] of casas) {
    const c = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), barro); c.position.set(x, h / 2, z); cena.add(c); cena.add(T25_arestas(c, 0xffc98a, 0.22));
    const tt = new THREE.Mesh(new THREE.BoxGeometry(w + 0.3, 0.18, d + 0.3), teto); tt.position.set(x, h + 0.09, z); cena.add(tt); cena.add(T25_arestas(tt, 0xffc98a, 0.2));
    const jx = x + (r() - 0.5) * w * 0.4, jan = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.55), new THREE.MeshBasicMaterial({ color: 0xffb466 })); jan.position.set(jx, h * 0.6, z + d / 2 + 0.01); cena.add(jan);
    const hj = halo3D(0xffa040, 1.6, 0.55); hj.position.set(jx, h * 0.6, z + d / 2 + 0.1); cena.add(hj);
    if (porta != null) { const dx = x + porta, pt = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.75), new THREE.MeshBasicMaterial({ color: 0xffa95a })); pt.position.set(dx, 0.875, z + d / 2 + 0.012); cena.add(pt);
      const l = new THREE.PointLight(0xffa050, 3.2, 7, 2); l.position.set(dx, 1.2, z + d / 2 + 0.7); cena.add(l); const hp = halo3D(0xffb060, 3.4, 0.5); hp.position.set(dx, 1.0, z + d / 2 + 0.2); cena.add(hp); out.push({ porta: [dx, z + d / 2], luz: l }); }
  }
  return out;
}
// "?" de luz como recorte no cenário
function EM3_interrogacao(k, pos, h, a) {
  return recorte25d(k, { larg: 260, alt: 320, h, pos, a, luz: false, desenho: (g, t, W2, H2) => { g.save(); g.font = `700 ${H2 * 0.9}px Cinzel, serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.shadowColor = "rgba(255,200,120,0.9)"; g.shadowBlur = 30; g.fillStyle = "rgba(255,226,170,1)"; g.fillText("?", W2 / 2, H2 * 0.52 + Math.sin(t * 2) * 4); g.restore(); } });
}

// =============== 1. abertura: alguém sozinho numa pedra sob o céu enorme; UMA estrela forte ===============
CENAS.abertura = (el, c, B) => {
  const tN = B("nome"), tF = B("fim");
  mostrarGancho(tN - 0.3);
  const k = camada3D({ ini: 0, fim: c.fim + 0.6, fov: 42, exposicao: 1.0, antialias: false });
  tl.set(k.canvas, { opacity: 1 }, 0); tl.to(k.canvas, { opacity: 0, duration: 0.45, ease: "power1.inOut" }, c.fim - 0.05);
  const M = EM3_mundo(k, { centro: [0, 0], plano: 5, seed: 261 }), est = EM3_estrela(k.cena, 7, 20, -40, 2.4), est2 = EM3_estrela(k.cena, -16, 26, -60, 1.3);
  EM3_pedra(k.cena, -0.08, 0.02, -0.62, 0.62, 0.42, 0.48, 263); EM3_pedra(k.cena, 2.6, 0, -2.4, 0.5, 0.3, 0.45, 265); EM3_pedra(k.cena, -2.4, 0, -1.6, 0.35, 0.22, 0.3, 267);
  const pz = pessoa25d(k, { ficha: elencoVariado(141, "homem"), pos: [0, 0, 0], alt: 1.7, dir: 1, fase: 1, res: 820,
    pose: (t) => { const olha = PT.ss((t - tN + 0.4) / 1.2); return { ...POSES.sentado, tronco: 0.22 - 0.2 * olha, cabeca: 0.5 - 0.85 * olha, braco: [[0.15, 1.15], [0.25, 1.2]] }; },
    expr: (t) => (t > tN ? "neutro" : "triste"), luz: { lado: -1, cor: [170, 185, 255], calor: 0.16, rimCor: "225,232,255" } });
  const CAM = [[0, [-1.4, 0.95, 3.0]], [tN, [-2.0, 1.25, 5.0]], [c.fim + 0.6, [-3.0, 1.8, 8.6]]], ALVO = [[0, [0.7, 1.7, -4]], [tN, [1.3, 3.4, -10]], [c.fim + 0.6, [1.8, 5.2, -16]]];
  k.animar((t) => { k.camera.position.set(...chaves(t, CAM)); k.camera.lookAt(...chaves(t, ALVO)); M.anim(t);
    est.anim(t, 1 + 0.5 * PT.jan(t, tN - 0.2, tN + 1.6, 0.3, 0.8)); const d2 = PT.ss((t - tF + 0.2) / 1.0); est2.g.visible = d2 > 0.01; est2.anim(t, d2); pz.desenhar(t); });
};

// =============== 2. José: a noite na vila; ele decide ir embora em segredo ===============
CENAS.jose = (el, c, B) => {
  const tG = B("gravida"), tS = B("segredo");
  const k = camada3D({ ini: c.ini, fim: c.fim + 0.6, fov: 40, exposicao: 1.0, antialias: false }); mostrar3D(k, c.ini - 0.45, c.fim + 0.5, 0.45);
  const M = EM3_mundo(k, { centro: [0, -3], plano: 12, seed: 271 }); EM3_estrela(k.cena, 9, 22, -50, 2);
  EM3_vila(k.cena, 273, [[-3.4, -3.6, 3.6, 2.6, 3.0, 0.7], [1.8, -7.2, 3.2, 2.4, 3.0], [-8.5, -8, 4, 3.0, 3.5], [6, -10, 3.4, 2.6, 3.0], [-13, -15, 4, 3, 4], [11, -16, 4.5, 3.2, 3.5], [-2, -14, 3.6, 2.8, 3]]);
  const maria = pessoa25d(k, { tipo: "maria", pose: () => ({ ...POSES.de_pe, braco: [[-0.1, 0.4], [0.3, 1.3]], cabeca: 0.18 }), pos: [-2.7, 0, -1.95], alt: 1.58, dir: 1, expr: "triste", fase: 3, res: 600,
    a: (t) => PT.ss((t - tG + 0.3) / 0.8), luz: { lado: 1, cor: [255, 165, 85], calor: 0.5, rimCor: "255,210,150" } });
  const anda = (t) => Math.max(0, t - tS + 0.2);
  const jose = pessoa25d(k, { tipo: "jose", alt: 1.75, fase: 2, res: 820, expr: "triste", posFn: (t) => [1.1 + anda(t) * 0.62, 0, 0.9], dir: (t) => (t > tS - 0.3 ? 1 : -1),
    pose: (t) => (t > tS - 0.3 ? { ...POSES.andar(anda(t) * 4.2, 0.8), cabeca: 0.35, tronco: 0.06 } : { ...POSES.de_pe, cabeca: 0.25 - 0.12 * PT.ss((t - tG) / 0.8), braco: [[-0.1, 0.3], [0.15, 0.4]] }),
    luz: { lado: -1, cor: [255, 175, 100], calor: 0.22, rimCor: "235,236,255" } });
  const CAM = [[c.ini, [3.4, 1.55, 5.6]], [tS, [2.9, 1.5, 5.2]], [c.fim + 0.6, [4.0, 1.45, 5.4]]], ALVO = [[c.ini, [-2.4, 1.25, -2.8]], [tS, [-0.8, 1.2, -1.2]], [c.fim + 0.6, [2.6, 1.1, 0.2]]];
  k.animar((t) => { k.camera.position.set(...chaves(t, CAM)); k.camera.lookAt(...chaves(t, ALVO)); M.anim(t); maria.desenhar(t); jose.desenhar(t); });
};

// =============== 3. o sonho: José dorme encostado na pedra; o anjo aparece ("não temas") ===============
CENAS.sonho = (el, c, B) => {
  const tS = B("sonho"), tA = B("anjo"), tT = B("temas"), tN = B("nome2");
  const k = camada3D({ ini: c.ini, fim: c.fim + 0.6, fov: 40, exposicao: 1.0, antialias: false }); mostrar3D(k, c.ini - 0.45, c.fim + 0.5, 0.45);
  const M = EM3_mundo(k, { centro: [0, 0], plano: 6, seed: 281, nevoa: 0.026 }); EM3_estrela(k.cena, 8, 20, -45, 1.8);
  EM3_pedra(k.cena, -1.15, 0.05, -0.7, 0.75, 0.62, 0.55, 283); EM3_pedra(k.cena, 3.2, 0, -3, 0.6, 0.35, 0.5, 285);
  const so = (t) => PT.ss((t - tS + 0.4) / 1.0), aA = (t) => PT.ss((t - tA + 0.3) / 1.0);
  const jose = pessoa25d(k, { tipo: "jose", alt: 1.75, fase: 2, res: 760, pos: [-1.0, 0, 0], dir: 1, expr: "dorme",
    pose: () => ({ ...POSES.sentado, tronco: 0.2, cabeca: 0.6, braco: [[0.1, 1.15], [0.2, 1.2]] }), luz: { lado: -1, cor: [150, 170, 255], calor: 0.2, rimCor: "200,215,255" } });
  // a luz do anjo: um ponto de luz quente-branco que acende o chão e o José
  const luzA = new THREE.PointLight(0xfff0d8, 0, 9, 1.6); luzA.position.set(1.0, 1.6, 0.6); k.cena.add(luzA);
  const hA = halo3D(0xfff2dc, 7, 0), hB = halo3D(0xffd9a0, 3.2, 0); hA.position.set(1.05, 1.5, -0.4); hB.position.set(1.05, 1.6, -0.3); k.cena.add(hA); k.cena.add(hB);
  const sonhoL = new THREE.PointLight(0x7f95ff, 0, 6, 1.8); sonhoL.position.set(-1.0, 1.4, 1.2); k.cena.add(sonhoL);
  const anjo = pessoa25d(k, { tipo: "anjo", alt: 1.85, fase: 4, res: 820, dir: -1, expr: "sorri", a: aA, sombra: false,
    posFn: (t) => [1.15, 0.28 + 0.06 * Math.sin(t * 1.2) + 0.3 * (1 - aA(t)), 0], asas: (t) => 0.3 + 0.7 * PT.ss((t - tA) / 1.4),
    pose: (t) => poseMix({ ...POSES.de_pe, cabeca: 0.1 }, { ...POSES.entregando, braco: [[-0.2, 0.3], [1.35, 0.15]], cabeca: 0.15 }, PT.ss((t - tT + 0.5) / 0.6)),
    luz: { lado: 1, cor: [255, 230, 190], calor: 0.3, rimCor: "255,250,235" } });
  const q = EM3_interrogacao(k, [0.05, 1.95, 0.4], 0.55, (t) => PT.ss((t - tN + 0.2) / 0.9));
  const CAM = [[c.ini, [-0.5, 1.05, 3.1]], [tA - 0.3, [-0.1, 1.15, 3.7]], [c.fim + 0.6, [0.15, 1.3, 4.9]]], ALVO = [[c.ini, [-0.9, 0.75, 0]], [tA - 0.3, [-0.1, 0.95, 0]], [c.fim + 0.6, [0.15, 1.2, 0]]];
  k.animar((t) => { k.camera.position.set(...chaves(t, CAM)); k.camera.lookAt(...chaves(t, ALVO)); M.anim(t);
    const a = aA(t); luzA.intensity = 3.4 * a; hA.material.opacity = 0.5 * a; hB.material.opacity = 0.8 * a * (0.9 + 0.1 * Math.sin(t * 3)); sonhoL.intensity = 1.6 * so(t) * (1 - 0.5 * a);
    jose.desenhar(t); anjo.desenhar(t); q.desenhar(t); });
};

// =============== apoio (logo depois da abertura): apelo à fé → curtir + comentar ===============
// (cena pronta da identidade: CENAS.apoio)

// =============== 5. o significado: EMANUEL → hebraico → imanu = conosco, El = Deus → DEUS CONOSCO ===============
CENAS.significado = (el, c, B) => {
  const tE = B("emanuel"), tI = B("imanu"), tL = B("el"), tJ = B("junta");
  mostrarVersiculo("Emanuel: Deus conosco.", "Mateus 1:23", tJ - 0.1, c.fim + 0.3, { y: 380, tam: 70, destaque: ["Deus", "conosco."] });
  const TV = telaGPU(el, c, EM_FUNDO), nv = TV.nuvem(70000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 960, zoom: 1.05 }], [c.fim + 0.5, { x: 540, y: 960, zoom: 1.14 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), uE = PT.ss((t - c.ini - 0.1) / 0.9), uH = PT.ss((t - tI + 1.1) / 1.0), uD = PT.ss((t - tJ + 0.3) / 1.1);
    let i = EM_ceu(nv, x, 0, t, cam, 0.8);
    const [cx, cy, ck] = projP(cam, 540, 980, 1), base = { cx, cy, esc: 900 * ck, cor: LUZ.luz, borda: [1, 1, 1], brilho: 0.85 };
    brilhoP(x, cx, cy, (420 + 160 * uD) * ck, LUZS.ambar, 0.16 + 0.18 * uD);
    if (uD > 0) i = morfo(nv, EM_F.hebr, EM_F.deus, uD, { de: { ...base, esc: 820 * ck }, para: { ...base, cor: LUZ.ouro, borda: LUZ.luz, brilho: 1 }, t, onda: 0.3, curva: 0.4, i0: i });
    else if (uH > 0) i = morfo(nv, EM_F.emanuel, EM_F.hebr, uH, { de: base, para: { ...base, esc: 820 * ck }, t, onda: 0.3, curva: 0.4, i0: i });
    else i = morfo(nv, EM_F.poeira, EM_F.emanuel, uE, { de: { ...base, esc: 1400 * ck, brilho: 0.6 }, para: base, t, onda: 0.3, curva: 0.6, i0: i });
    // o hebraico lê da direita: imanu (à direita) = conosco; El (à esquerda) = Deus
    const aI = PT.jan(t, tI - 0.1, tJ, 0.35, 0.4), aL = PT.jan(t, tL - 0.1, tJ, 0.35, 0.4);
    if (aI > 0.01) { brilhoP(x, cx + 150 * ck, cy, 200 * ck, LUZS.luz, 0.25 * aI); rotuloP(x, "imanu = conosco", cx + 150 * ck, cy + 210 * ck, 46, "255,236,200", aI * FIS.chegar(t, tI, 0.5)); }
    if (aL > 0.01) { brilhoP(x, cx - 240 * ck, cy, 160 * ck, LUZS.luz, 0.25 * aL); rotuloP(x, "El = Deus", cx - 230 * ck, cy + 210 * ck, 46, "255,236,200", aL * FIS.chegar(t, tL, 0.5)); }
    nv.total(i);
  });
};

// =============== 6. para você: a estrela sai de longe e desce até o estábulo; Maria, José e o menino (2.5D) ===============
CENAS.sentido = (el, c, B) => {
  const tA = B("aqui"), tJ = B("jose2");
  const k = camada3D({ ini: c.ini, fim: c.fim + 0.6, fov: 40, exposicao: 0.95, antialias: false }); mostrar3D(k, c.ini - 0.45, c.fim + 0.5, 0.45);
  const M = EM3_mundo(k, { centro: [0, 0], plano: 7, seed: 251, nevoa: 0.022 }), r = prng(253);
  const madeira = new THREE.MeshLambertMaterial({ color: 0x4a3222 }), palha = new THREE.MeshLambertMaterial({ color: 0x6e5430 }), grupo = new THREE.Group(); k.cena.add(grupo);
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, ar = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); grupo.add(m); if (ar) grupo.add(T25_arestas(m, 0xffc98a, 0.4)); return m; };
  for (const [x, z, h] of [[-3, 1.6, 2.6], [3, 1.6, 2.6], [-3, -1.8, 3.4], [3, -1.8, 3.4]]) add(new THREE.CylinderGeometry(0.12, 0.14, h, 8), madeira, x, h / 2, z);
  for (let k2 = 0; k2 < 12; k2++) add(new THREE.BoxGeometry(0.42, 3.3, 0.08), madeira, -2.75 + k2 * 0.5, 1.65, -1.9, 0, 0, (r() - 0.5) * 0.03);
  add(new THREE.BoxGeometry(6.6, 0.16, 0.16), madeira, 0, 2.6, 1.6); add(new THREE.BoxGeometry(6.6, 0.16, 0.16), madeira, 0, 3.4, -1.8);
  add(new THREE.BoxGeometry(7.2, 0.1, 4.3), palha, 0, 3.08, -0.1, Math.atan2(0.8, 3.4));
  for (let k2 = 0; k2 < 9; k2++) add(new THREE.BoxGeometry(7.2, 0.05, 0.12), palha, 0, 3.4 - k2 * 0.1, -1.7 + k2 * 0.42, Math.atan2(0.8, 3.4), 0, 0, false);
  for (const [x, z] of [[-2.4, -1.3], [2.3, -1.2], [2.5, 0.2]]) add(new THREE.BoxGeometry(0.9, 0.55, 0.6), palha, x, 0.28, z, 0, r() * 0.6);
  EM3_vila(k.cena, 255, [[-14, -26, 4, 3, 4], [-7, -30, 3.6, 2.6, 3], [6, -28, 4, 3, 3.5], [14, -24, 3.4, 2.6, 3]]);
  const lamp = new THREE.PointLight(0xffa955, 0, 6.5, 2); lamp.position.set(0.0, 1.3, 0.6); k.cena.add(lamp);
  const brilho = halo3D(0xffc477, 2.6, 0); brilho.position.set(-0.1, 0.9, 0.6); k.cena.add(brilho);
  // a estrela: lá longe e alta → desce em arco até em cima do estábulo; o facho acende quando ela chega
  const est = EM3_estrela(k.cena, 10, 26, -48, 2.4);
  const facho = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 2.4, 1, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false })); k.cena.add(facho);
  const luz = { lado: -1, cor: [255, 176, 100], rimCor: "255,226,170", calor: 0.3 };
  const maria = pessoa25d(k, { tipo: "maria", pose: () => ({ ...POSES.de_pe, tronco: 0.16, cabeca: 0.35, braco: [[0.5, 1.0], [0.8, 0.85]], perna: [[-0.1, 0], [0.12, -0.05]] }), pos: [-0.85, 0.02, 0.7], alt: 1.62, dir: 1, expr: (t) => (t > tA ? "sorri" : "neutro"), fase: 3, luz });
  const jose = pessoa25d(k, { tipo: "jose", pose: (t) => poseMix({ ...POSES.de_pe, cabeca: 0.15 }, { ...POSES.de_pe, cabeca: 0.3, braco: [[-0.1, 0.3], [0.6, 1.3]] }, PT.ss((t - tJ + 0.2) / 0.8)), pos: [0.95, 0.02, 0.35], alt: 1.75, dir: -1, expr: (t) => (t > tJ - 0.2 ? "sorri" : "neutro"), fase: 2, luz });
  const berco = recorte25d(k, { larg: 680, alt: 340, h: 0.75, pos: [-0.15, 0.02, 0.6], luz: { ...luz, calor: 0.5, rim: 0.7, grao: true }, desenho: (g, t, W2, H2) => manjedoura(g, { x: W2 / 2, chao: H2 - 6, esc: 470, t }) });
  sombra25d(k, -0.15, 0.02, 0.6, 1.2, 0.5, 0.45);
  const CAM = [[c.ini, [-1.4, 0.7, 9.5]], [tA - 0.3, [-1.5, 0.8, 9.8]], [tA + 1.8, [-0.5, 1.5, 6.6]], [tJ - 0.4, [0.0, 1.3, 4.6]], [c.fim + 0.6, [0.35, 1.25, 3.9]]];
  const ALVO = [[c.ini, [3, 9, -20]], [tA - 0.3, [3.5, 11, -22]], [tA + 1.8, [0, 1.6, 0]], [tJ - 0.4, [0.1, 1.0, 0.5]], [c.fim + 0.6, [0.45, 1.05, 0.5]]];
  k.animar((t) => {
    k.camera.position.set(...chaves(t, CAM)); k.camera.lookAt(...chaves(t, ALVO)); M.anim(t);
    const desce = PT.inOut((t - tA + 0.6) / 1.8), p = [PT.lerp(10, 0.4, desce), PT.lerp(26, 7.2, desce) + 6 * Math.sin(Math.PI * desce), PT.lerp(-48, -3, desce)];
    est.g.position.set(...p); est.anim(t, 1 + 0.3 * desce);
    const aq = PT.ss((t - tA - 0.4) / 0.8), L = Math.max(0.1, p[1] - 0.8); facho.material.opacity = 0.03 * aq; facho.scale.set(1, L, 1); facho.position.set(p[0] * 0.5, 0.8 + L / 2, p[2] * 0.5 + 0.3);
    lamp.intensity = (0.6 + 1.8 * aq) * (1 + 0.1 * Math.sin(t * 3.1)); brilho.material.opacity = 0.15 + 0.3 * aq;
    maria.desenhar(t); jose.desenhar(t); berco.desenhar(t);
  });
};

// =============== 7. o detalhe: o livro abre e fecha com a mesma promessa (Mateus 1:23 → 28:20) ===============
CENAS.detalhe = (el, c, B) => {
  const tD = B("detalhe"), tC = B("comeca"), tT = B("termina"), tP = B("promessa"), tp = tempoPalavras(c);
  mostrarVersiculo("…eu estou convosco todos os dias…", "Mateus 28:20", tp("eu", 0) - 0.2, c.fim + 0.3, { y: 360, tam: 66, destaque: ["convosco", "dias…"] });
  const TV = telaGPU(el, c, EM_FUNDO), nv = TV.nuvem(80000);
  const CAM = cameraProf([[c.ini, { x: 540, y: 1000, zoom: 1.08 }], [c.fim + 0.5, { x: 540, y: 1000, zoom: 1.16 }]]);
  TV.quadro((x, t) => {
    const cam = CAM(t), uL = PT.ss((t - c.ini) / 1.0), aC = FIS.chegar(t, tC, 0.5), aT = FIS.chegar(t, tT, 0.5), pr = PT.ss((t - tP + 0.3) / 1.0);
    let i = EM_ceu(nv, x, 0, t, cam, 0.8);
    const [lx, ly, lk0] = projP(cam, 540, 850, 1), lk = lk0 * 0.8;
    brilhoP(x, lx, ly, (460 + 200 * pr) * lk, LUZS.ambar, 0.15 + 0.2 * pr);
    i = morfo(nv, EM_F.deus, EM_F.livro, uL, { de: { cx: lx, cy: ly - 40 * lk, esc: 900 * lk, cor: LUZ.ouro, borda: LUZ.luz, brilho: 1 }, para: { cx: lx, cy: ly, esc: 760 * lk, cor: LUZ.luz, borda: [1, 1, 1], brilho: 0.8 + 0.3 * pr }, t, onda: 0.3, curva: 0.4, i0: i });
    // página da esquerda: o começo (1:23); da direita: o fim (28:20); o arco de luz liga as duas
    if (aC > 0.01) { rotuloP(x, "1:23", lx - 175 * lk, ly - 40 * lk, 54, "255,226,160", Math.min(1, aC)); rotuloP(x, "Deus conosco", lx - 175 * lk, ly + 30 * lk, 34, "255,236,200", Math.min(1, aC)); }
    if (aT > 0.01) { rotuloP(x, "28:20", lx + 175 * lk, ly - 40 * lk, 54, "255,226,160", Math.min(1, aT)); rotuloP(x, "convosco todos os dias", lx + 175 * lk, ly + 30 * lk, 28, "255,236,200", Math.min(1, aT)); }
    if (pr > 0.01) { const n = 40; for (let k = 0; k <= n * pr; k++) { const [qx, qy] = FIS.arco(lx - 175 * lk, ly - 110 * lk, lx + 175 * lk, ly - 110 * lk, k / n, 170 * lk); discoP(x, qx, qy, 6, LUZS.ouro, 0.7); }
      for (let k = 0; k < 2; k++) { const v = ((t - tP) * 0.6 + k / 2) % 1; anelP(x, lx, ly, (320 + v * 320) * lk, LUZS.ouro, 0.3 * (1 - v) * pr, 3); } }
    // Jesus no monte (o fim do livro), braços abertos, pequeno embaixo
    const aJ = PT.ss((t - tT + 0.4) / 0.9);
    if (aJ > 0.01) figura(x, t, poseMix(POSES.de_pe, { ...POSES.bracos_abertos, braco: [[-1.0, 0.35], [1.0, 0.35]] }, 0.7), { tipo: "jesus", x: 540, chao: 1440, H: 300, dir: 1, cam, z: 1, a: aJ, fase: 5, expr: "sorri" });
    nv.total(i);
  });
};

// =============== 8. pergunta (uma só) e 9. fim (emenda no começo) ===============
CENAS.pergunta = (el, c, B) => cenaPergunta(el, c, B, { texto: "Em que momento do dia você mais precisa lembrar que <b>Deus está com você</b>?", sub: "Escreve numa palavra", icone: "hand-heart",
  de: [EM_F.livro, { cx: 540, cy: 860, esc: 700, cor: LUZ.luz, borda: [1, 1, 1] }], seed: 241, tam: 66, alturaTexto: 320 });
CENAS.fim = (el, c, B) => cartaoFinal(el, c.ini + 0.05);
