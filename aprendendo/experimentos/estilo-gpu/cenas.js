// EXPERIMENTO "pontos de luz na GPU": a abertura do vídeo da cerveja com ~110 mil partículas
// desenhadas em WebGL (Three.js Points + shader próprio), bloom de verdade (2 níveis de desfoque)
// e transformação de partículas (a garrafa vira um floco de neve gigante).
// Técnicas das skills particles-gpu / postfx-bloom (adaptadas para Three.js puro, sem React).

const GPU_VS = `
  attribute vec3 aAlvo; attribute vec4 aInfo; // info: tipo (0 vidro, 1 líquido, 2 tampa), aleatório, distância ao gargalo, ângulo-semente
  uniform float uT, uRot, uEsc, uTA, uTG, uMorph, uTM;
  uniform vec2 uBase;
  varying vec3 vCor; varying float vA;
  void main() {
    float tipo = aInfo.x, n = aInfo.y, dT = aInfo.z;
    vec3 p = position;
    // tampa voa e gira ao abrir
    float ab = clamp((uT - uTA) / 0.9, 0.0, 1.0); ab = 1.0 - pow(1.0 - ab, 3.0);
    if (tipo > 1.5) { float r = (uT - uTA > 0.0) ? (uT - uTA) * 6.0 : 0.0; p.xz = mat2(cos(r), -sin(r), sin(r), cos(r)) * p.xz; p.y += 520.0 * ab; }
    if (tipo > 0.5 && tipo < 1.5 && n < 0.03 && uT > uTA) {
      float gB = clamp((uT - uTG - dT / 420.0) / 0.22, 0.0, 1.0);
      if (gB < 0.5) { p.y = 15.0 + mod(p.y + (uT - uTA) * (140.0 + 6000.0 * n), 780.0); float rB = min(length(p.xz), 130.0 * (p.y < 560.0 ? 1.0 : 0.35)); p.xz = normalize(p.xz + 0.001) * rB; }
    }
    // giro da garrafa em torno do eixo
    float c = cos(uRot), s = sin(uRot);
    vec3 q = vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
    float per = 1.0 / (1.0 - q.z * uEsc / 2600.0);
    vec2 tela = vec2(uBase.x + q.x * uEsc * per, uBase.y - q.y * uEsc);
    // transformação em floco: cada partícula sai com um atraso e faz uma curva (redemoinho)
    float m = clamp((uT - uTM - n * 0.9) / 1.4, 0.0, 1.0); m = m * m * (3.0 - 2.0 * m);
    vec2 alvo = aAlvo.xy;
    float ang = (n - 0.5) * 6.0 * sin(m * 3.14159);
    vec2 meio = mix(tela, alvo, m);
    vec2 d = meio - vec2(540.0, 900.0);
    meio = vec2(540.0, 900.0) + mat2(cos(ang), -sin(ang), sin(ang), cos(ang)) * d * (1.0 + 0.35 * sin(m * 3.14159));
    tela = mix(tela, meio, step(0.0001, m));
    // cores e brilho
    float rr = length(p.xz) + 0.001;
    float borda = pow(abs(q.x) / rr, 6.0);
    float frente = q.z > 0.0 ? 1.0 : 0.35;
    float g = clamp((uT - uTG - dT / 420.0 * (1.0 + aInfo.w)) / 0.22, 0.0, 1.0);
    vec3 ambar = vec3(1.0, 0.66, 0.2), gelo = vec3(0.85, 0.94, 1.0), vidro = vec3(0.6, 0.82, 1.0);
    float a;
    if (tipo < 0.5) { vCor = mix(vidro, gelo, step(0.84, n)); a = 0.035 * frente + 0.45 * borda + 0.25 * step(0.84, n); }
    else if (tipo < 1.5) { vCor = mix(ambar, gelo, g); a = (0.2 + 0.12 * frente) * (1.0 - 0.45 * g + 0.25 * g * sin(uT * 3.0 + n * 40.0));
      if (n < 0.03 && uT > uTA && g < 0.5) { vCor = vec3(0.85, 0.95, 1.0); a = 0.9; } }
    else { vCor = vec3(1.0, 0.84, 0.43); a = 0.6 * (1.0 - clamp((uT - uTA - 0.4) / 0.5, 0.0, 1.0)); }
    vCor = mix(vCor, gelo, m * 0.85);
    vA = a * (1.0 + 0.6 * m);
    gl_PointSize = 2.6 + 1.2 * g + 1.5 * m * n;
    gl_Position = vec4(tela.x / 540.0 - 1.0, 1.0 - tela.y / 960.0, 0.0, 1.0);
  }`;
const GPU_FS = `
  varying vec3 vCor; varying float vA;
  void main() { float d = length(gl_PointCoord - 0.5); float k = smoothstep(0.5, 0.0, d); gl_FragColor = vec4(vCor * vA * k, 1.0); }`;

// bloom: extrai o brilho, desfoca em 2 tamanhos e soma de volta
const TELA_VS = `varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`;
const BRILHO_FS = `uniform sampler2D uTex; uniform float uLim; varying vec2 vUv;
  void main() { vec3 c = texture2D(uTex, vUv).rgb; float l = max(c.r, max(c.g, c.b)); gl_FragColor = vec4(c * smoothstep(uLim, uLim + 0.25, l), 1.0); }`;
const BLUR_FS = `uniform sampler2D uTex; uniform vec2 uDir; varying vec2 vUv;
  void main() { vec3 s = texture2D(uTex, vUv).rgb * 0.227027;
    s += texture2D(uTex, vUv + uDir * 1.3846).rgb * 0.3162162; s += texture2D(uTex, vUv - uDir * 1.3846).rgb * 0.3162162;
    s += texture2D(uTex, vUv + uDir * 3.2307).rgb * 0.0702702; s += texture2D(uTex, vUv - uDir * 3.2307).rgb * 0.0702702;
    gl_FragColor = vec4(s, 1.0); }`;
const COMPOE_FS = `uniform sampler2D uCena, uB1, uB2; uniform vec3 uFundo; varying vec2 vUv;
  void main() { vec3 c = uFundo + texture2D(uCena, vUv).rgb + texture2D(uB1, vUv).rgb * 1.1 + texture2D(uB2, vUv).rgb * 1.6;
    gl_FragColor = vec4(c, 1.0); }`;

function flocoAlvos(n, seed, cx, cy, R) {
  const r = prng(seed), out = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const braco = Math.floor(r() * 6), b = braco * Math.PI / 3 - Math.PI / 2;
    let x, y;
    if (r() < 0.55) { const d = Math.pow(r(), 0.8) * R; x = Math.cos(b) * d; y = Math.sin(b) * d; }
    else { const f = [0.35, 0.55, 0.75][Math.floor(r() * 3)], sg = r() < 0.5 ? -1 : 1, bb = b + sg * Math.PI / 3, d = r() * R * (0.42 - f * 0.3); x = Math.cos(b) * R * f + Math.cos(bb) * d; y = Math.sin(b) * R * f + Math.sin(bb) * d; }
    const esp = 6 + 10 * r();
    out[i * 3] = cx + x + (r() - 0.5) * esp; out[i * 3 + 1] = cy + y + (r() - 0.5) * esp; out[i * 3 + 2] = 0;
  }
  return out;
}

CENAS.abertura = (el, c, B) => {
  const q = tempoPalavras(c), tA = B("abre"), tG = B("gelo"), tM = q("Parece") + 0.2;
  mostrarGancho(tA - 0.35);
  el.insertAdjacentHTML("beforeend", `<rect width="${W}" height="${H}" fill="#060b22"/><foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml"><canvas class="gpu-cv" width="${W}" height="${H}"></canvas></div></foreignObject>`);
  const canvas = el.querySelector(".gpu-cv");
  const ren = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
  ren.setPixelRatio(1); ren.setSize(W, H, false); ren.autoClear = true;
  // partículas: garrafa com ~110 mil pontos
  const NQ = window.GPU_N || 1; const pts = garrafaPontos(3, Math.round(46000 * NQ), Math.round(62000 * NQ));
  const n = pts.length, pos = new Float32Array(n * 3), info = new Float32Array(n * 4);
  pts.forEach((p, i) => {
    pos[i * 3] = p.rr * Math.sin(p.a); pos[i * 3 + 1] = p.y; pos[i * 3 + 2] = p.rr * Math.cos(p.a);
    info[i * 4] = p.k; info[i * 4 + 1] = p.n; info[i * 4 + 2] = Math.hypot(p.y - 790, p.rr); info[i * 4 + 3] = 0.18 * Math.sin(p.a * 6 + p.y * 0.02) + 0.25 * (p.n - 0.5);
  });
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aInfo", new THREE.BufferAttribute(info, 4));
  geo.setAttribute("aAlvo", new THREE.BufferAttribute(flocoAlvos(n, 5, 540, 900, 400), 3));
  const U = { uT: { value: 0 }, uRot: { value: 0 }, uEsc: { value: 0.7 }, uTA: { value: tA }, uTG: { value: tG }, uMorph: { value: 0 }, uTM: { value: tM }, uBase: { value: new THREE.Vector2(540, 1380) } };
  const mat = new THREE.ShaderMaterial({ vertexShader: GPU_VS, fragmentShader: GPU_FS, uniforms: U, transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending });
  const cena = new THREE.Scene(); cena.add(new THREE.Points(geo, mat));
  // neve de fundo
  const r = prng(5), nN = 2500, pn = new Float32Array(nN * 3), inN = new Float32Array(nN * 4);
  for (let i = 0; i < nN; i++) { pn[i * 3] = r() * W; pn[i * 3 + 1] = r() * H; inN[i * 4 + 1] = r(); }
  const neveU = { uT: U.uT };
  const neve = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(pn, 3)).setAttribute("aInfo", new THREE.BufferAttribute(inN, 4)), new THREE.ShaderMaterial({
    uniforms: neveU, transparent: true, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec4 aInfo; uniform float uT; varying float vA; void main() { float z = 0.2 + 0.8 * aInfo.y; vec2 p = position.xy; p.y = mod(p.y + uT * (8.0 + 26.0 * z), 1960.0) - 20.0; p.x += sin(uT * 0.3 + aInfo.y * 40.0) * 18.0 * z; vA = (0.06 + 0.25 * z) * (0.6 + 0.4 * sin(uT * (0.8 + z) + aInfo.y * 9.0)); gl_PointSize = 1.5 + 4.0 * z * z; gl_Position = vec4(p.x / 540.0 - 1.0, 1.0 - p.y / 960.0, 0.0, 1.0); }`,
    fragmentShader: `varying float vA; void main() { float k = smoothstep(0.5, 0.0, length(gl_PointCoord - 0.5)); gl_FragColor = vec4(vec3(0.8, 0.88, 1.0) * vA * k, 1.0); }` }));
  cena.add(neve);
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  // bloom
  const rt = (w, h) => new THREE.WebGLRenderTarget(w, h, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter });
  const rCena = rt(W, H), a1 = rt(W / 4, H / 4), b1 = rt(W / 4, H / 4), a2 = rt(W / 12, H / 12), b2 = rt(W / 12, H / 12);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), cenaQ = new THREE.Scene(); cenaQ.add(quad);
  const shader = (fs, u) => new THREE.ShaderMaterial({ vertexShader: TELA_VS, fragmentShader: fs, uniforms: u, depthTest: false });
  const mBr = shader(BRILHO_FS, { uTex: { value: null }, uLim: { value: 0.35 } }), mBl = shader(BLUR_FS, { uTex: { value: null }, uDir: { value: new THREE.Vector2() } });
  const mCo = shader(COMPOE_FS, { uCena: { value: rCena.texture }, uB1: { value: a1.texture }, uB2: { value: a2.texture }, uFundo: { value: new THREE.Vector3(0.024, 0.043, 0.133) } });
  const passe = (m, alvo) => { quad.material = m; ren.setRenderTarget(alvo); ren.render(cenaQ, cam); };
  const borra = (a, b, w, h, k) => { for (let i = 0; i < k; i++) { mBl.uniforms.uTex.value = a.texture; mBl.uniforms.uDir.value.set(1 / w, 0); passe(mBl, b); mBl.uniforms.uTex.value = b.texture; mBl.uniforms.uDir.value.set(0, 1 / h); passe(mBl, a); } };
  aCadaQuadro((t) => {
    if (t < c.ini - 0.6 || t > c.fim + 0.1) return;
    U.uT.value = t; U.uRot.value = t * 0.25; U.uEsc.value = 0.7 * (1 + 0.05 * PT.ss((t - tA) / 4));
    ren.setRenderTarget(rCena); ren.setClearColor(0x000000, 1); ren.clear(); ren.render(cena, cam);
    if (!window.GPU_SEM_BLOOM) { mBr.uniforms.uTex.value = rCena.texture; passe(mBr, a1); borra(a1, b1, W / 4, H / 4, 2);
    mBl.uniforms.uTex.value = a1.texture; mBl.uniforms.uDir.value.set(0, 0); passe(mBl, a2); borra(a2, b2, W / 12, H / 12, 2); }
    passe(mCo, null);
  });
};
