// Teste 2.5D: cenário 3D de verdade (Three.js: estábulo, deserto, vila ao longe, céu e a estrela) com a
// câmera entrando até a manjedoura; os personagens continuam em line art do kit, desenhados a cada quadro
// num canvas e postos no cenário como "recortes" (planos) — ganham profundidade e paralaxe com a câmera.

// recorte de line art: canvas → textura num plano de altura h (m), base no chão em (x, y, z)
function T25_recorte(k, larg, alt, h, pos, desenho) {
  const cv = document.createElement("canvas"); cv.width = larg; cv.height = alt; const g = cv.getContext("2d");
  const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(h * larg / alt, h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  m.position.set(pos[0], pos[1] + h / 2, pos[2]); k.cena.add(m);
  return { m, desenhar: (t) => { g.clearRect(0, 0, larg, alt); desenho(g, t, larg, alt); tex.needsUpdate = true; } };
}
// arestas acesas (o "traço de luz" no cenário 3D)
function T25_arestas(malha, cor = 0xffc98a, op = 0.55) {
  const l = new THREE.LineSegments(new THREE.EdgesGeometry(malha.geometry, 25), new THREE.LineBasicMaterial({ color: cor, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
  l.position.copy(malha.position); l.rotation.copy(malha.rotation); l.scale.copy(malha.scale); return l;
}

CENAS.estabulo = (el, c, B) => {
  const k = camada3D({ ini: c.ini, fim: c.fim + 1, fov: 40, exposicao: 0.85 });
  mostrar3D(k, c.ini - 0.4, c.fim + 1.5, 0.4);
  const { cena, camera } = k, r = prng(251);
  cena.environment = null; cena.fog = new THREE.FogExp2(0x0b1230, 0.028); cena.background = null;
  cena.children.forEach((o) => { if (o.isHemisphereLight) o.intensity = 0.12; }); k.luzes.chave.intensity = 0.25; k.luzes.chave.color.set(0x8fa6ff); k.luzes.contra.intensity = 0.35; k.luzes.contra.color.set(0x6f86ff);
  const madeira = new THREE.MeshStandardMaterial({ color: 0x3a2618, roughness: 0.95 }), palha = new THREE.MeshStandardMaterial({ color: 0x5c4424, roughness: 1 }), areia = new THREE.MeshStandardMaterial({ color: 0x221d30, roughness: 1 });
  // chão de dunas
  const gChao = new THREE.PlaneGeometry(220, 220, 160, 160); gChao.rotateX(-Math.PI / 2);
  const p = gChao.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), d = Math.hypot(x, z); p.setY(i, (d > 6 ? 1 : d / 6) * (0.6 * Math.sin(x * 0.12 + z * 0.05) + 0.9 * Math.sin(z * 0.07 - x * 0.03) + 0.25 * Math.sin(x * 0.5 + z * 0.4)) - 0.05); }
  gChao.computeVertexNormals(); cena.add(new THREE.Mesh(gChao, areia));
  // céu: estrelas numa cúpula e a estrela de Belém
  const nE = 2600, pos = new Float32Array(nE * 3); for (let i = 0; i < nE; i++) { const az = r() * 6.283, el2 = 0.04 + Math.acos(1 - r()) * 0.95, R = 90; pos[i * 3] = Math.cos(az) * Math.cos(el2) * R; pos[i * 3 + 1] = Math.sin(el2) * R; pos[i * 3 + 2] = Math.sin(az) * Math.cos(el2) * R; }
  const gE = new THREE.BufferGeometry(); gE.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const matE = new THREE.PointsMaterial({ color: 0xfff1d6, size: 2.2, sizeAttenuation: false, transparent: true, opacity: 0.85, fog: false, depthWrite: false }); cena.add(new THREE.Points(gE, matE));
  const estrela = halo3D(0xffe2a8, 9, 1); estrela.position.set(2.5, 13, -16); estrela.material.fog = false; cena.add(estrela);
  const nucleo = halo3D(0xffffff, 2.4, 1); nucleo.position.copy(estrela.position); nucleo.material.fog = false; cena.add(nucleo);
  // facho de luz da estrela até o estábulo
  const facho = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 2.6, 18, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.022, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  facho.position.set(1.3, 6.5, -7.8); facho.lookAt(2.5, 13, -16); facho.rotateX(Math.PI / 2); cena.add(facho);
  // estábulo: postes, vigas, parede de tábuas, telhado de palha inclinado, fardos de feno
  const grupo = new THREE.Group(); cena.add(grupo);
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, arest = true) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz); grupo.add(m); if (arest) grupo.add(T25_arestas(m)); return m; };
  for (const [x, z, h] of [[-3, 1.6, 2.6], [3, 1.6, 2.6], [-3, -1.8, 3.4], [3, -1.8, 3.4]]) add(new THREE.CylinderGeometry(0.12, 0.14, h, 8), madeira, x, h / 2, z);
  for (let k2 = 0; k2 < 12; k2++) add(new THREE.BoxGeometry(0.42, 3.3, 0.08), madeira, -2.75 + k2 * 0.5, 1.65, -1.9, 0, 0, (r() - 0.5) * 0.03);
  add(new THREE.BoxGeometry(6.6, 0.16, 0.16), madeira, 0, 2.6, 1.6); add(new THREE.BoxGeometry(6.6, 0.16, 0.16), madeira, 0, 3.4, -1.8);
  const tel = add(new THREE.BoxGeometry(7.2, 0.1, 4.3), palha, 0, 3.08, -0.1, Math.atan2(0.8, 3.4)); // telhado
  for (let k2 = 0; k2 < 9; k2++) add(new THREE.BoxGeometry(7.2, 0.05, 0.12), palha, 0, 3.4 - k2 * 0.1, -1.7 + k2 * 0.42, Math.atan2(0.8, 3.4), 0, 0, false);
  for (const [x, z] of [[-2.4, -1.3], [2.3, -1.2], [2.5, 0.2]]) add(new THREE.BoxGeometry(0.9, 0.55, 0.6), palha, x, 0.28, z, 0, r() * 0.6);
  // vila ao longe, janelas acesas
  for (let k2 = 0; k2 < 9; k2++) { const x = -26 + k2 * 6.5 + r() * 2, z = -34 - r() * 10, w = 2 + r() * 2, h = 1.6 + r() * 1.6; const casa = new THREE.Mesh(new THREE.BoxGeometry(w, h, 2), areia); casa.position.set(x, h / 2 + 0.6, z); cena.add(casa); cena.add(T25_arestas(casa, 0xffc98a, 0.25));
    const jan = halo3D(0xffb060, 1.2, 0.8); jan.position.set(x + (r() - 0.5) * w * 0.5, h * 0.55 + 0.6, z + 1.05); cena.add(jan); }
  // luz quente dentro do estábulo (a lamparina / o menino)
  const lamp = new THREE.PointLight(0xffa955, 2.2, 6.5, 2); lamp.position.set(0.3, 1.4, 0.5); cena.add(lamp);
  const brilho = halo3D(0xffc477, 2.6, 0.4); brilho.position.set(0.25, 0.9, 0.55); cena.add(brilho);
  // poeira na luz
  const nP = 260, pp = new Float32Array(nP * 3), base = []; for (let i = 0; i < nP; i++) base.push([(r() - 0.5) * 5, r() * 3, (r() - 0.5) * 3, r() * 6.28]);
  const gP = new THREE.BufferGeometry(); gP.setAttribute("position", new THREE.BufferAttribute(pp, 3)); const matP = new THREE.PointsMaterial({ color: 0xffd9a0, size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }); cena.add(new THREE.Points(gP, matP));
  // personagens em line art (recortes no cenário)
  const maria = T25_recorte(k, 520, 760, 1.25, [-1.15, 0.02, 0.75], (g, t, W2, H2) => figura(g, t, { ...POSES.ajoelhado, braco: [[0.5, 1.0], [0.75, 0.9]], cabeca: 0.3 }, { tipo: "maria", x: W2 * 0.42, chao: H2 - 8, H: 700, dir: 1, fase: 3, expr: "sorri" }));
  const jose = T25_recorte(k, 460, 900, 1.8, [1.45, 0.02, 0.35], (g, t, W2, H2) => figura(g, t, { ...POSES.de_pe, cabeca: 0.3, braco: [[-0.1, 0.3], [0.6, 1.3]] }, { tipo: "jose", x: W2 * 0.55, chao: H2 - 8, H: 830, dir: -1, fase: 2, expr: "sorri" }));
  const berco = T25_recorte(k, 520, 340, 0.75, [0.2, 0.02, 0.6], (g, t, W2, H2) => manjedoura(g, { x: W2 / 2, chao: H2 - 6, esc: 470, t }));
  // câmera: de fora (o estábulo pequeno sob a estrela) até perto da manjedoura, num arco leve
  const CAMK = [[c.ini, [-7, 4.5, 36]], [c.ini + (c.fim - c.ini) * 0.5, [-2.2, 2.4, 14]], [c.fim + 1, [0.7, 1.55, 5.4]]], ALVO = [[c.ini, [0, 5, -4]], [c.ini + (c.fim - c.ini) * 0.5, [0.2, 1.8, 0]], [c.fim + 1, [0.15, 0.95, 0.4]]];
  k.animar((t) => {
    const cp = chaves(t, CAMK), al = chaves(t, ALVO); camera.position.set(...cp); camera.lookAt(...al);
    matE.opacity = 0.75 + 0.1 * Math.sin(t * 1.3); nucleo.scale.setScalar(2.4 * (1 + 0.06 * Math.sin(t * 2.1))); lamp.intensity = 2.2 + 0.25 * Math.sin(t * 3.1) + 0.2 * Math.sin(t * 7.3);
    for (let i = 0; i < nP; i++) { const [x, y, z, f] = base[i]; pp[i * 3] = x + Math.sin(t * 0.3 + f) * 0.3; pp[i * 3 + 1] = (y + t * 0.08) % 3; pp[i * 3 + 2] = z + Math.cos(t * 0.25 + f) * 0.2; } gP.attributes.position.needsUpdate = true;
    maria.desenhar(t); jose.desenhar(t); berco.desenhar(t);
  });
};
