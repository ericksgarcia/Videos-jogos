// Camadas 3D (Three.js) para momentos-chave. Cada camada é um canvas transparente
// entre a ilustração 2D (#mundo) e a camada de frente (#frente). A cena 3D é desenhada
// pelo relógio por quadro, só enquanto a camada está visível, a partir do tempo do
// vídeo: o resultado é determinístico.
//
//   const k = camada3D({ ini, fim, fov });       // cria canvas, cena, câmera e luzes
//   k.cena.add(malha); k.animar((t) => { ... });  // t = tempo do vídeo (s)
//   tl.fromTo(k.canvas, { opacity: 0 }, { opacity: 1, ... }, t)   // aparecer/sumir

const M3 = {}; // materiais prontos (criados sob demanda)
function _ambiente3D(renderer) {
  // "estúdio" simples para reflexos metálicos: esfera com degradê + painéis de luz
  const s = new THREE.Scene();
  const geo = new THREE.SphereGeometry(30, 32, 16), cores = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) { const y = pos.getY(i) / 30; const c = new THREE.Color().setHSL(0.62, 0.55, 0.08 + Math.max(0, y) * 0.35); cores.push(c.r, c.g, c.b); }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cores, 3));
  s.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide })));
  [[0, 20, 0, 18, 0xfff2d0, 3], [18, 6, 10, 8, 0xffd9a0, 2.5], [-18, 4, 8, 8, 0x9fd8ff, 2]].forEach(([x, y, z, tam, cor, i]) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(tam, tam), new THREE.MeshBasicMaterial({ color: new THREE.Color(cor).multiplyScalar(i), side: THREE.DoubleSide }));
    p.position.set(x, y, z); p.lookAt(0, 0, 0); s.add(p);
  });
  const pm = new THREE.PMREMGenerator(renderer);
  const env = pm.fromScene(s, 0.04).texture;
  pm.dispose();
  return env;
}
let _env3D = null, _texBrilho = null;
// textura radial para halos (sprites aditivos = "bloom" barato)
function texturaBrilho() {
  if (_texBrilho) return _texBrilho;
  const cv = document.createElement("canvas"); cv.width = cv.height = 128;
  const cx = cv.getContext("2d"), g = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.25, "rgba(255,255,255,0.45)"); g.addColorStop(1, "rgba(255,255,255,0)");
  cx.fillStyle = g; cx.fillRect(0, 0, 128, 128);
  return (_texBrilho = new THREE.CanvasTexture(cv));
}
const halo3D = (cor, tam, forca) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: texturaBrilho(), color: cor, transparent: true, opacity: forca ?? 0.9, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.set(tam, tam, 1); return s; };

function material3D(nome) {
  if (M3[nome]) return M3[nome];
  const P = {
    cobre: { color: 0xd9824a, metalness: 1, roughness: 0.32 },
    cobreEsc: { color: 0x8e4720, metalness: 1, roughness: 0.45 },
    aco: { color: 0xb9c3e6, metalness: 1, roughness: 0.28 },
    acoEsc: { color: 0x3a4570, metalness: 0.9, roughness: 0.5 },
    vermelho: { color: 0xef476f, metalness: 0.2, roughness: 0.35 },
    azul: { color: 0x4cc9f0, metalness: 0.2, roughness: 0.35 },
    plastico: { color: 0x2b3a85, metalness: 0, roughness: 0.55 },
    plasticoClaro: { color: 0x3d4fa8, metalness: 0, roughness: 0.4, transparent: true, opacity: 0.35 },
    branco: { color: 0xf4f6ff, metalness: 0, roughness: 0.5 },
  }[nome];
  return (M3[nome] = new THREE.MeshStandardMaterial(P));
}
const emissivo3D = (cor, forca) => new THREE.MeshStandardMaterial({ color: cor, emissive: cor, emissiveIntensity: forca ?? 2, roughness: 0.3 });

function camada3D(o) {
  o = o || {};
  const canvas = document.createElement("canvas");
  canvas.className = "tres";
  // o.escala < 1 desenha em resolução menor e amplia (3D por software fica bem mais rápido)
  const esc = o.escala ?? 1;
  canvas.width = Math.round(W * esc); canvas.height = Math.round(H * esc);
  canvas.style.width = W + "px"; canvas.style.height = H + "px";
  canvas.style.opacity = 0;
  $("#root").insertBefore(canvas, $("#frente"));
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(canvas.width, canvas.height, false);
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = o.exposicao ?? 1.0;
  if (!_env3D) _env3D = _ambiente3D(renderer);
  const cena = new THREE.Scene();
  cena.environment = _env3D;
  const camera = new THREE.PerspectiveCamera(o.fov ?? 35, W / H, 0.1, 200);
  camera.position.set(0, 0, 12);
  cena.add(new THREE.HemisphereLight(0xbfd4ff, 0x1a1030, 0.6));
  const chave = new THREE.DirectionalLight(0xfff0d8, 2.2); chave.position.set(5, 8, 7); cena.add(chave);
  const contra = new THREE.DirectionalLight(0x8fe3ff, 1.4); contra.position.set(-6, 3, -6); cena.add(contra);
  const fns = [];
  const k = { canvas, renderer, cena, camera, luzes: { chave, contra }, animar: (fn) => fns.push(fn) };
  const ini = o.ini ?? 0, fim = o.fim ?? T;
  let desenhado = false;
  aCadaQuadro((t) => {
    if (t < ini - 0.6 || t > fim + 0.6) { if (desenhado) { renderer.clear(); desenhado = false; } return; }
    for (const fn of fns) fn(t);
    renderer.render(cena, camera);
    desenhado = true;
  });
  return k;
}
// liga/desliga a camada (fade) no tempo do vídeo
function mostrar3D(k, t0, t1, fade) {
  fade = fade ?? 0.45;
  tl.fromTo(k.canvas, { opacity: 0 }, { opacity: 1, duration: fade, ease: "power1.inOut", immediateRender: false }, t0);
  tl.to(k.canvas, { opacity: 0, duration: fade, ease: "power1.inOut" }, t1 - fade);
}
// interpolação suave entre chaves [[t, valor], ...] (valor número ou array)
function chaves(t, ks, ease) {
  ease = ease || ((x) => x * x * (3 - 2 * x));
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) if (t <= ks[i][0]) {
    const [t0, a] = ks[i - 1], [t1, b] = ks[i], u = ease((t - t0) / Math.max(1e-6, t1 - t0));
    return Array.isArray(a) ? a.map((v, j) => v + (b[j] - v) * u) : a + (b - a) * u;
  }
  return ks[ks.length - 1][1];
}
