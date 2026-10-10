// "Pontos de luz" na GPU (WebGL/Three.js): nuvens com 100 mil+ partículas e bloom de verdade.
// Mesma ideia de pontos.js, com duas camadas por cena que passam juntas pelo bloom:
//   - nuvens de pontos na GPU (posição, cor, brilho e tamanho calculados por quadro no JS);
//   - um canvas 2D (as mesmas primitivas de pontos.js: moléculas, anéis, rótulos...).
// Render bem mais lento que o canvas puro (a "placa de vídeo" é emulada no processador),
// mas o dono aprovou o tempo para os vídeos nesse estilo.
//
//   const T = telaGPU(el, c);                       // como telaPontos, com bloom
//   const neve = T.nuvem(3000);                      // nuvem de até 3000 pontos
//   T.quadro((x, t) => { neve.ponto(i, px, py, r, g, b, alfa, tam); ...; neve.total(n) });

const PG_VS = `attribute vec4 aCor; attribute float aTam; varying vec4 vCor;
  void main() { vCor = aCor; gl_PointSize = aTam; gl_Position = vec4(position.x / 540.0 - 1.0, 1.0 - position.y / 960.0, 0.0, 1.0); }`;
const PG_FS = `varying vec4 vCor; void main() { float k = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)); gl_FragColor = vec4(vCor.rgb * vCor.a * k, 1.0); }`;
const PG_TELA_VS = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const PG_TEX_FS = `uniform sampler2D uTex; varying vec2 vUv; void main() { gl_FragColor = vec4(texture2D(uTex, vUv).rgb, 1.0); }`;
const PG_BRILHO_FS = `uniform sampler2D uTex; uniform float uLim; varying vec2 vUv;
  void main() { vec3 c = texture2D(uTex, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(uLim, uLim + 0.25, l), 1.0); }`;
const PG_BLUR_FS = `uniform sampler2D uTex; uniform vec2 uDir; varying vec2 vUv;
  void main() { vec3 s = texture2D(uTex, vUv).rgb * 0.227027;
    s += texture2D(uTex, vUv + uDir * 1.3846).rgb * 0.3162162; s += texture2D(uTex, vUv - uDir * 1.3846).rgb * 0.3162162;
    s += texture2D(uTex, vUv + uDir * 3.2307).rgb * 0.0702702; s += texture2D(uTex, vUv - uDir * 3.2307).rgb * 0.0702702;
    gl_FragColor = vec4(s, 1.0); }`;
// a camada de texto (uTexto) entra depois do bloom: rótulos sempre nítidos
const PG_COMPOE_FS = `uniform sampler2D uCena, uB1, uB2, uTexto; uniform vec3 uFundo; uniform float uK1, uK2; varying vec2 vUv;
  void main() { vec3 c = uFundo + texture2D(uCena, vUv).rgb + texture2D(uB1, vUv).rgb * uK1 + texture2D(uB2, vUv).rgb * uK2; vec4 tx = texture2D(uTexto, vUv);
    gl_FragColor = vec4(c * (1.0 - tx.a) + tx.rgb, 1.0); }`;

function telaGPU(el, c, o = {}) {
  const fundo = o.fundo || [0.024, 0.043, 0.133];
  el.insertAdjacentHTML("beforeend", `<rect width="${W}" height="${H}" fill="#060b22"/><foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml"><canvas class="pg-cv" width="${W}" height="${H}"></canvas></div></foreignObject>`);
  const cvs = el.querySelectorAll(".pg-cv"), canvas = cvs[cvs.length - 1];
  const ren = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
  ren.setPixelRatio(1); ren.setSize(W, H, false);
  // camada 2D (vira textura a cada quadro)
  const c2 = document.createElement("canvas"); c2.width = W; c2.height = H;
  const x = c2.getContext("2d");
  const tex2 = new THREE.CanvasTexture(c2);
  tex2.premultiplyAlpha = true; tex2.generateMipmaps = false; tex2.minFilter = THREE.LinearFilter; tex2.magFilter = THREE.LinearFilter;
  // camada de texto: não passa pelo bloom (rotuloP desenha aqui quando x._texto existe)
  const c3 = document.createElement("canvas"); c3.width = W; c3.height = H;
  const x3 = c3.getContext("2d"); x._texto = x3; x3._usado = false;
  const tex3 = new THREE.CanvasTexture(c3);
  tex3.premultiplyAlpha = true; tex3.generateMipmaps = false; tex3.minFilter = THREE.LinearFilter; tex3.magFilter = THREE.LinearFilter;
  let tex3Sujo = false;
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const cena = new THREE.Scene();
  const fundo2D = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({ vertexShader: PG_TELA_VS, fragmentShader: PG_TEX_FS, uniforms: { uTex: { value: tex2 } }, depthTest: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }));
  fundo2D.frustumCulled = false; cena.add(fundo2D);
  const matP = new THREE.ShaderMaterial({ vertexShader: PG_VS, fragmentShader: PG_FS, depthTest: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending });
  const nuvens = [];
  // bloom
  const rt = (w, h) => new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const rCena = rt(W, H), a1 = rt(W / 4, H / 4), b1 = rt(W / 4, H / 4), a2 = rt(W / 12, H / 12), b2 = rt(W / 12, H / 12);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), cenaQ = new THREE.Scene(); quad.frustumCulled = false; cenaQ.add(quad);
  const sh = (fs, u) => new THREE.ShaderMaterial({ vertexShader: PG_TELA_VS, fragmentShader: fs, uniforms: u, depthTest: false });
  const mBr = sh(PG_BRILHO_FS, { uTex: { value: rCena.texture }, uLim: { value: o.limiar ?? 0.35 } });
  const mBl = sh(PG_BLUR_FS, { uTex: { value: null }, uDir: { value: new THREE.Vector2() } });
  const mCo = sh(PG_COMPOE_FS, { uCena: { value: rCena.texture }, uB1: { value: a1.texture }, uB2: { value: a2.texture }, uTexto: { value: tex3 }, uFundo: { value: new THREE.Vector3(...fundo) }, uK1: { value: o.bloom1 ?? 1.1 }, uK2: { value: o.bloom2 ?? 1.6 } });
  const passe = (m, alvo) => { quad.material = m; ren.setRenderTarget(alvo); ren.render(cenaQ, cam); };
  const borra = (a, b, w, h) => { for (let i = 0; i < 2; i++) { mBl.uniforms.uTex.value = a.texture; mBl.uniforms.uDir.value.set(1 / w, 0); passe(mBl, b); mBl.uniforms.uTex.value = b.texture; mBl.uniforms.uDir.value.set(0, 1 / h); passe(mBl, a); } };
  return {
    x, canvas,
    // nuvem de até n pontos; preencha com ponto(i, ...) e diga quantos usou com total(k)
    nuvem(n) {
      const pos = new Float32Array(n * 3), cor = new Float32Array(n * 4), tam = new Float32Array(n);
      const geo = new THREE.BufferGeometry();
      const aP = new THREE.BufferAttribute(pos, 3), aC = new THREE.BufferAttribute(cor, 4), aT = new THREE.BufferAttribute(tam, 1);
      [aP, aC, aT].forEach((a) => a.setUsage(THREE.DynamicDrawUsage));
      geo.setAttribute("position", aP); geo.setAttribute("aCor", aC); geo.setAttribute("aTam", aT);
      const pts = new THREE.Points(geo, matP); pts.frustumCulled = false; cena.add(pts);
      const nv = {
        n, k: 0,
        ponto(i, px, py, r, g, b, a, s) { const j = i * 3, q = i * 4; pos[j] = px; pos[j + 1] = py; cor[q] = r; cor[q + 1] = g; cor[q + 2] = b; cor[q + 3] = a; tam[i] = s; },
        total(k) { nv.k = Math.min(k, n); },
        _envia() { geo.setDrawRange(0, nv.k); aP.needsUpdate = aC.needsUpdate = aT.needsUpdate = true; },
      };
      nuvens.push(nv);
      return nv;
    },
    quadro(fn) {
      aCadaQuadro((t) => {
        if (t < c.ini - 0.6 || t > c.fim + 0.1) return;
        x.setTransform(1, 0, 0, 1, 0, 0); x.globalAlpha = 1;
        x.globalCompositeOperation = "source-over"; x.clearRect(0, 0, W, H);
        x.globalCompositeOperation = "lighter";
        nuvens.forEach((nv) => { nv.k = 0; });
        if (tex3Sujo) { x3.setTransform(1, 0, 0, 1, 0, 0); x3.clearRect(0, 0, W, H); }
        x3._usado = false;
        fn(x, t);
        tex2.needsUpdate = true;
        if (x3._usado || tex3Sujo) tex3.needsUpdate = true;
        tex3Sujo = x3._usado;
        nuvens.forEach((nv) => nv._envia());
        ren.setRenderTarget(rCena); ren.setClearColor(0x000000, 1); ren.clear(); ren.render(cena, cam);
        passe(mBr, a1); borra(a1, b1, W / 4, H / 4);
        mBl.uniforms.uTex.value = a1.texture; mBl.uniforms.uDir.value.set(0, 0); passe(mBl, a2); borra(a2, b2, W / 12, H / 12);
        passe(mCo, null);
      });
    },
  };
}

// ---------- garrafa densa (100 mil+ pontos) numa nuvem ----------
// o: os mesmos campos de desenharGarrafa (cx, cy, esc, rot, a, tampa, gelo(p), geada(p), liq, agita, t)
//    + filtro(p) (desenha só alguns pontos) e desloca(p, sx, sy) -> [sx, sy] (ex.: garrafa trincando)
// continua de onde a nuvem parou neste quadro (várias garrafas na mesma nuvem); devolve o próximo índice
function desenharGarrafaGPU(nv, pts, o, i0 = nv.k) {
  const A = o.a ?? 1; let i = i0;
  const amb = [1.0, 0.66, 0.2], gel = [0.85, 0.94, 1.0], vid = [0.6, 0.82, 1.0], lar = [1.0, 0.54, 0.24];
  const tp = o.tampa || {}, tA = tp.a ?? 1, tRot = tp.rot || 0, tDy = tp.dy || 0;
  for (let k = 0; k < pts.length && i < nv.n; k++) {
    const p = pts[k];
    if (o.filtro && !o.filtro(p)) continue;
    if (p.k === 2) {
      if (tA <= 0) continue;
      const ang = p.a + o.rot + tRot, X = p.rr * Math.sin(ang), Z = p.rr * Math.cos(ang);
      nv.ponto(i++, o.cx + X * o.esc + (tp.dx || 0), o.cy - (p.y + tDy) * o.esc, 1.0, 0.84, 0.43, A * tA * (Z > 0 ? 0.55 : 0.2), 2.6);
      continue;
    }
    const ang = p.a + o.rot, sa = Math.sin(ang), ca = Math.cos(ang), Z = p.rr * ca, per = 1 / (1 - Z * o.esc / 2600);
    let sx = o.cx + p.rr * sa * o.esc * per, sy = o.cy - p.y * o.esc;
    if (o.desloca) [sx, sy] = o.desloca(p, sx, sy);
    const frente = Z > 0 ? 1 : 0.35;
    if (p.k === 0) {
      const borda = Math.pow(Math.abs(sa), 6), fr = o.geada ? o.geada(p) : 0, cristal = p.n > 0.84 ? 1 : 0;
      const w = ((ang % 6.283) + 6.283) % 6.283, dw = Math.min(Math.abs(w - 5.73), 6.283 - Math.abs(w - 5.73)), refl = Math.exp(-dw * dw / 0.02) * (p.y > 60 && p.y < 900 ? 1 : 0);
      const c = fr * cristal > 0 ? gel : vid;
      nv.ponto(i++, sx, sy, c[0], c[1], c[2], A * (0.035 * frente + 0.45 * borda + 0.3 * refl + 0.25 * fr * cristal), 2.6);
      continue;
    }
    if ((o.liq ?? 1) <= 0) continue;
    const g = o.gelo ? o.gelo(p) : 0, q = o.quente ? o.quente(p) : 0;
    const base = q > 0 ? [amb[0] + (lar[0] - amb[0]) * q, amb[1] + (lar[1] - amb[1]) * q, amb[2] + (lar[2] - amb[2]) * q] : amb;
    const tremor = (o.agita || 0) * Math.sin((o.t || 0) * 6 + p.n * 40) * 3;
    const a = A * (o.liq ?? 1) * (0.2 + 0.12 * frente) * (1 - 0.45 * g + 0.25 * g * Math.sin((o.t || 0) * 3 + p.n * 40));
    nv.ponto(i++, sx + tremor, sy, base[0] + (gel[0] - base[0]) * g, base[1] + (gel[1] - base[1]) * g, base[2] + (gel[2] - base[2]) * g, a, 2.6 + 1.2 * g);
  }
  nv.total(i);
  return i;
}
// neve/poeira em profundidade numa nuvem
function ambienteGPU(nv, lista, t, cor, a = 1, queda = 1, i0 = nv.k) {
  let i = i0;
  lista.forEach((p) => {
    if (i >= nv.n) return;
    const yy = ((p.y + t * (8 + 26 * p.z) * queda) % (H + 40) + H + 40) % (H + 40) - 20, xx = p.x + Math.sin(t * 0.3 + p.f) * 18 * p.z;
    nv.ponto(i++, xx, yy, cor[0], cor[1], cor[2], a * (0.06 + 0.25 * p.z) * (0.6 + 0.4 * Math.sin(t * (0.8 + p.v) + p.f)), 1.5 + 4 * p.z * p.z);
  });
  nv.total(i);
  return i;
}
// pontos-alvo de um floco de neve (para transformar partículas num floco)
function flocoAlvosP(n, seed, cx, cy, R) {
  const r = prng(seed), out = [];
  for (let i = 0; i < n; i++) {
    const b = Math.floor(r() * 6) * Math.PI / 3 - Math.PI / 2;
    let x, y;
    if (r() < 0.55) { const d = Math.pow(r(), 0.8) * R; x = Math.cos(b) * d; y = Math.sin(b) * d; }
    else { const f = [0.35, 0.55, 0.75][Math.floor(r() * 3)], sg = r() < 0.5 ? -1 : 1, bb = b + sg * Math.PI / 3, d = r() * R * (0.42 - f * 0.3); x = Math.cos(b) * R * f + Math.cos(bb) * d; y = Math.sin(b) * R * f + Math.sin(bb) * d; }
    const e = 6 + 10 * r();
    out.push([cx + x + (r() - 0.5) * e, cy + y + (r() - 0.5) * e]);
  }
  return out;
}
