// Kit — CENÁRIO 2.5D (Three.js): personagens e objetos em line art postos como "recortes" num cenário 3D de
// verdade. Cada recorte é um canvas desenhado a cada quadro e iluminado depois (luz de volume + luz de contorno
// + luz quente de baixo), porque o plano não reage às luzes do Three.js. Um personagem usa 3 planos em
// profundidades levemente diferentes (braço de trás, corpo, braço da frente) → paralaxe e volume quando a câmera anda.
//
//   const k = camada3D({ ini, fim, fov }); mostrar3D(k, t0, t1);       // motor/tres.js
//   const maria = pessoa25d(k, { tipo: "maria", pose: (t) => POSES.de_pe, pos: [x, y, z], alt: 1.5, dir: 1, expr: "sorri",
//                                luz: { lado: -1, cor: [255, 190, 120] } });
//   k.animar((t) => maria.desenhar(t));
//   recorte25d(k, { larg: 520, alt: 340, h: 0.75, pos: [x, y, z], desenho: (g, t, W2, H2) => manjedoura(g, {...}) })
//   T25_arestas(malha) → LineSegments acesos para as quinas de uma malha (o "traço de luz" no cenário)

function T25_arestas(malha, cor = 0xffc98a, op = 0.55) {
  const l = new THREE.LineSegments(new THREE.EdgesGeometry(malha.geometry, 25), new THREE.LineBasicMaterial({ color: cor, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false }));
  l.position.copy(malha.position); l.rotation.copy(malha.rotation); l.scale.copy(malha.scale); return l;
}
// ilumina um canvas já desenhado (só onde há desenho): sombra do lado oposto à luz, calor vindo de baixo e luz de contorno
let T25_grao = null;
function T25_luz(g, W2, H2, o = {}, tmp) {
  const lado = o.lado ?? -1, cor = o.cor || [255, 190, 120], rim = o.rim ?? 1;
  g.save(); g.globalCompositeOperation = "source-atop";
  let gr = g.createLinearGradient(lado < 0 ? W2 : 0, 0, lado < 0 ? 0 : W2, 0); gr.addColorStop(0, "rgba(2,4,16,0.28)"); gr.addColorStop(0.55, "rgba(2,4,16,0.06)"); gr.addColorStop(1, "rgba(2,4,16,0)"); g.fillStyle = gr; g.fillRect(0, 0, W2, H2);
  gr = g.createLinearGradient(0, H2, 0, H2 * 0.35); gr.addColorStop(0, `rgba(${cor},${o.calor ?? 0.34})`); gr.addColorStop(1, `rgba(${cor},0)`); g.fillStyle = gr; g.fillRect(0, 0, W2, H2);
  g.restore();
  if (o.grao) { // grão de papel/ilustração: só onde há desenho
    if (!T25_grao) { const c = document.createElement("canvas"); c.width = c.height = 128; const gc = c.getContext("2d"), im = gc.createImageData(128, 128), r = prng(77); for (let i = 0; i < 128 * 128; i++) { const v = r() < 0.5 ? 0 : 255; im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255 * 0.07 * r(); } gc.putImageData(im, 0, 0); T25_grao = c; }
    g.save(); g.globalCompositeOperation = "source-atop"; g.fillStyle = g.createPattern(T25_grao, "repeat"); g.fillRect(0, 0, W2, H2); g.restore(); }
  if (rim > 0 && tmp) { // contorno de luz: a silhueta menos ela mesma deslocada para o lado oposto à luz = faixa fina no lado da luz
    const t2 = tmp.getContext("2d"); t2.clearRect(0, 0, W2, H2); t2.globalCompositeOperation = "source-over"; t2.drawImage(g.canvas, 0, 0);
    t2.globalCompositeOperation = "destination-out"; const dx = (o.rimLarg ?? 5) * -lado; t2.drawImage(g.canvas, dx, 0);
    t2.globalCompositeOperation = "source-in"; t2.fillStyle = `rgba(${o.rimCor || "255,236,200"},${0.85 * rim})`; t2.fillRect(0, 0, W2, H2);
    g.save(); g.globalCompositeOperation = "lighter"; g.drawImage(tmp, 0, 0); g.restore();
  }
}
function recorte25d(k, o) {
  const W2 = o.larg, H2 = o.alt, cv = document.createElement("canvas"); cv.width = W2; cv.height = H2; const g = cv.getContext("2d"), tmp = document.createElement("canvas"); tmp.width = W2; tmp.height = H2;
  const tex = new THREE.CanvasTexture(cv); tex.encoding = THREE.sRGBEncoding; tex.anisotropy = 4; tex.premultiplyAlpha = false;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(o.h * W2 / H2, o.h), new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, toneMapped: false }));
  m.position.set(o.pos[0], o.pos[1] + o.h / 2, o.pos[2]); if (o.giro) m.rotation.y = o.giro; k.cena.add(m);
  return { m, desenhar: (t) => { g.clearRect(0, 0, W2, H2); o.desenho(g, t, W2, H2); if (o.luz !== false) T25_luz(g, W2, H2, o.luz || {}, tmp); tex.needsUpdate = true; } };
}
// personagem do kit em 3 planos. o: { tipo | ficha, pose: (t) => pose, pos: [x, y, z] (pés), alt (m, altura do personagem), dir, expr, maos, luz, larg (px), asas, dz (m entre planos) }
function pessoa25d(k, o) {
  const alt = o.alt ?? 1.7, Hpx = 880, W2 = o.larg ?? 880, H2 = Math.round(Hpx * 1.1), hm = alt * H2 / Hpx * 1.0 / (o.fichaAlt ?? 1), dz = o.dz ?? 0.09, camadas = ["tras", "corpo", "frente"];
  const planos = camadas.map((nome, i) => recorte25d(k, { larg: W2, alt: H2, h: alt * 1.1 * 1.0, pos: [o.pos[0], o.pos[1], o.pos[2] + (i - 1) * dz], luz: o.estilo === "cheio" ? { ...(o.luz || {}), grao: true, calor: (o.luz?.calor ?? 0.3) * 0.7 } : o.luz, giro: o.giro,
    desenho: (g, t) => figura(g, t, o.pose(t), { estilo: o.estilo, luzDir: o.luzDir, tipo: o.tipo, ficha: o.ficha, x: W2 * 0.5, chao: H2 - 10, H: Hpx, dir: o.dir ?? 1, expr: o.expr, maos: o.maos, asas: o.asas, fase: o.fase ?? 0, camada: nome, atras: o.atras }) }));
  return { planos, desenhar: (t) => planos.forEach((p) => p.desenhar(t)), mover: (x, y, z) => planos.forEach((p, i) => p.m.position.set(x, y + p.m.geometry.parameters.height / 2, z + (i - 1) * dz)) };
}
