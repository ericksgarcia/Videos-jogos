// Cenas do vídeo "Como a eletricidade é gerada".
// Cada função CENAS.<tipo>(el, c, B) desenha e anima uma cena do roteiro:
//   el = <g> da cena (SVG 1080x1920), c = dados da cena (ini, voz, fim, batidas),
//   B(evento, fração) = instante da batida (ou fração da fala, se não houver).
// Usa a identidade (aprendendo/identidade) e a biblioteca comum (aprendendo/motor/biblioteca.js).
// =============== 1. gancho: quarto à noite -> paisagem com a usina ===============
CENAS.interruptor = (el, c, B) => {
  mostrarGancho(B("afasta", 0.5) - 0.2);
  el.innerHTML = `
    <g class="paisagem" opacity="0"><g transform="translate(0 -230)">
      <rect width="${W}" height="${H}" fill="url(#ceuNoite)"/>${estrelas(80, 3, 0, 900)}
      <circle cx="820" cy="420" r="70" fill="url(#lua)"/>
      <path d="M0 1080 C 200 980, 380 1040, 560 990 S 900 960, 1080 1010 V 1920 H 0z" fill="url(#morroN1)"/>
      <path d="M0 1200 C 260 1120, 520 1180, 760 1120 S 1000 1110, 1080 1140 V 1920 H 0z" fill="url(#morroN2)"/>
      <path class="linhaL" d="M245 1218 C 360 1150, 470 1150, 560 1140 S 760 1100, 860 1090" fill="none" stroke="#ffd23f" stroke-width="5" opacity="0.9"/>
      ${P(560, 1140, 0.8, "t1", torre(160))}${P(760, 1105, 0.6, "t2", torre(160))}
      ${P(900, 1095, 0.55, "usinaL", usinaT())}
      <g transform="translate(990 960) scale(0.6)"><g class="helL">${turbinaR(60, "#ffd23f", 6)}</g></g>
      <path d="M0 1340 C 300 1290, 700 1330, 1080 1300 V 1920 H 0z" fill="url(#gramaN)"/>
      ${P(240, 1330, 0.95, "casaL", casa("#e9ecff", "janL"))}
      ${halo(196, 1252, 90, "haloJan")}
    </g></g>
    <g class="quarto">
      <rect width="${W}" height="${H}" fill="url(#parede)"/>
      <g transform="translate(0 170)"><g class="janelaQ"><rect x="610" y="430" width="340" height="440" rx="18" fill="url(#ceuNoite)" stroke="#2e3a75" stroke-width="16"/>${estrelas(14, 9, 450, 650).replace(/cx="([\d.]+)"/g, (m, x) => `cx="${620 + (parseFloat(x) / W) * 320}"`)}<circle cx="860" cy="520" r="36" fill="url(#lua)"/>
        <path d="M620 760 h40 v-90 h40 v60 h30 v-110 h50 v140 h30 v-70 h40 v130 h70 v40 h-300z" fill="#0e1636"/>${[0, 1, 2, 3, 4, 5].map((k) => `<rect x="${640 + k * 46}" y="${770 - (k % 3) * 40}" width="10" height="12" fill="#ffd23f" opacity="0.7"/>`).join("")}
        <line x1="780" y1="430" x2="780" y2="870" stroke="#2e3a75" stroke-width="10"/></g></g>
      <rect y="1300" width="${W}" height="620" fill="url(#piso)"/>
      <polygon class="cone" points="440,720 640,720 990,1440 90,1440" fill="url(#cone)" opacity="0"/>
      <line x1="540" y1="0" x2="540" y2="580" stroke="#4f5a7f" stroke-width="8"/>
      ${P(540, 700, 1.15, "lampQ", lampada("lamp"))}
      <g transform="translate(220 1080)"><g class="placa"><rect x="-80" y="-120" width="160" height="240" rx="24" fill="#eef1ff"/><rect x="-80" y="-120" width="160" height="240" rx="24" fill="none" stroke="#c7cde6" stroke-width="4"/><rect x="-34" y="-66" width="68" height="132" rx="16" fill="#cfd5ec"/><rect class="tecla" x="-26" y="-58" width="52" height="58" rx="12" fill="#ffffff" stroke="#aab2d4" stroke-width="3"/></g></g>
      ${sombra(540, 1460, 420, 40, 0.6)}
      <rect class="escuro" width="${W}" height="${H}" fill="#04061a" opacity="0.62"/>
      <g class="poeiraQ"></g>
    </g>`;
  const quarto = $(".quarto", el), lamp = $(".lamp", el), cone = $(".cone", el), pais = $(".paisagem", el);
  const tc = B("clique", 0.12);
  tl.to($(".tecla", el), { attr: { y: 0 }, duration: 0.08 }, tc);
  tl.fromTo($(".placa", el), { scale: 1 }, { scale: 0.95, duration: 0.07, yoyo: true, repeat: 1, transformOrigin: "50% 50%", immediateRender: false }, tc);
  const tlz = B("luz", 0.25);
  acender(lamp, tlz);
  tl.to($(".escuro", el), { opacity: 0.12, duration: 0.5 }, tlz);
  tl.to(quarto.querySelector("rect"), { attr: { fill: "url(#paredeQ)" }, duration: 0.01 }, tlz);
  tl.fromTo(cone, { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, tlz);
  poeira($(".poeiraQ", el), 40, 5, [200, 760, 680, 680], tlz, c.fim, "#ffe9a0");
  // câmera sai pela janela da casa e revela a paisagem
  const ta = B("afasta", 0.5);
  tl.set(pais, { opacity: 1 }, ta - 0.05);
  tl.to(quarto, { scale: 0.045, x: 196 - 540 * 0.045, y: 1022 - 800 * 0.045, svgOrigin: "0 0", duration: 1.3, ease: "power3.inOut" }, ta);
  tl.to(quarto, { opacity: 0, duration: 0.3 }, ta + 1.0);
  tl.fromTo($(".haloJan", el), { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, ta + 1.0);
  tl.set($(".janL", el), { attr: { fill: "#ffe066" } }, ta + 1.0);
  tl.fromTo(pais, { scale: 1.6, svgOrigin: "196 1022" }, { scale: 1, svgOrigin: "196 1022", duration: 1.3, ease: "power3.inOut", immediateRender: false }, ta);
  desenhar($(".linhaL", el), ta + 1.1, 1.0);
  fluxo($(".linhaL", el), 6, 6, ta + 1.8, c.fim, -0.5, pais, "#fff3b0");
  girar($(".helL", el), B("gira", 0.7), c.fim, 1.1);
  tl.fromTo($(".usinaL", el), { scale: 1 }, { scale: 1.08, duration: 0.25, yoyo: true, repeat: 1, transformOrigin: "50% 100%", immediateRender: false }, B("gira", 0.7));
  $$(".nuvem", el);
};

// =============== 2. elétrons dentro do fio (3D) ===============
CENAS.eletrons = (el, c, B, i, frente) => {
  el.innerHTML = `
    <rect width="${W}" height="${H}" fill="#0b1236"/>
    ${halo(540, 900, 760, "fundoHalo", "brilhoAzul").replace('class="fundoHalo"', 'class="fundoHalo" opacity="0.22"')}
    <g class="bk2"></g>
    <g class="fila" opacity="0">
      <rect x="0" y="1180" width="${W}" height="20" fill="#1a2560"/>
      ${Array.from({ length: 7 }, (_, k) => P(110 + k * 145, 1180, 1, "p", `${sombra(0, 4, 50, 10, 0.7)}<rect x="-38" y="-170" width="76" height="150" rx="38" fill="${k === 0 ? "url(#vermelhoI)" : "url(#azulI)"}"/><circle cy="-210" r="40" fill="${k === 0 ? "#ffb3c2" : "#bdeeff"}"/><rect x="-26" y="-150" width="16" height="70" rx="8" fill="#fff" opacity="0.35"/>`)).join("")}
      <g transform="translate(20 1060)"><g class="mao"><path d="M0 0 h50 v-26 l52 52 -52 52 v-26 h-50z" fill="${C.amarelo}"/></g></g>
      <g class="onda" opacity="0"><path d="M120 980 C 300 940, 760 940, 980 980" fill="none" stroke="${C.amarelo}" stroke-width="6" stroke-dasharray="14 12"/><path d="M980 980 l -30 -22 v44z" fill="${C.amarelo}"/></g>
    </g>`;
  frente.innerHTML = `<g class="rotEl" opacity="0">${callout(610, 930, 790, 700, "elétrons", C.ciano)}</g>`;
  bokeh($(".bk2", el), 16, 23, [0, 380, W, 1000], c.ini, c.fim, ["#8fe3ff", "#4cc9f0", "#ffd23f"]);
  const fila = $(".fila", el);
  const tz = B("zoom", 0.15), te = B("eletrons", 0.35), tan = B("andam", 0.5), tf = B("fila", 0.75);
  // --- 3D: fio de cobre com a capa cortada; a câmera entra até os átomos e elétrons ---
  const k = camada3D({ ini: c.ini - 0.5, fim: tf + 0.3, fov: 38 });
  const fio = new THREE.Group(); fio.rotation.z = 0.32; k.cena.add(fio);
  const capa = new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, 40, 64, 1, true, 0.75, Math.PI * 2 - 1.5), new THREE.MeshStandardMaterial({ color: 0x3550c8, roughness: 0.5, envMapIntensity: 0.5, side: THREE.DoubleSide }));
  capa.rotation.z = -Math.PI / 2; fio.add(capa);
  const nucleoM = new THREE.MeshStandardMaterial({ color: 0xc8662e, metalness: 1, roughness: 0.34, envMapIntensity: 0.75, transparent: true, opacity: 1 });
  const nucleo = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 40, 64), nucleoM);
  nucleo.rotation.z = -Math.PI / 2; fio.add(nucleo);
  // ponta cortada do fio (anel da capa + face de cobre), à direita
  const ponta = new THREE.Mesh(new THREE.CircleGeometry(1, 48), nucleoM); ponta.rotation.y = Math.PI / 2; ponta.position.x = 20; fio.add(ponta);
  // rede de átomos de cobre (só aparecem com o zoom)
  const r = prng(13), nAt = 700;
  const atM = new THREE.MeshStandardMaterial({ color: 0xd9824a, metalness: 0.7, roughness: 0.35, envMapIntensity: 0.6, transparent: true, opacity: 0 });
  const atomos = new THREE.InstancedMesh(new THREE.SphereGeometry(0.085, 16, 12), atM, nAt);
  const mtx = new THREE.Matrix4();
  for (let q = 0; q < nAt; q++) { const x = -7 + (q % 50) * 0.28, yy = -0.7 + (Math.floor(q / 50) % 7) * 0.23, zz = -0.35 + Math.floor(q / 350) * 0.42; mtx.setPosition(x, yy, zz); atomos.setMatrixAt(q, mtx); }
  fio.add(atomos);
  // elétrons: esferas emissivas + halo
  const nE = 70, ele = [], eM = emissivo3D(0x6fe0ff, 2.2);
  const eGeo = new THREE.SphereGeometry(0.06, 16, 12);
  for (let q = 0; q < nE; q++) {
    const g = new THREE.Group(); g.add(new THREE.Mesh(eGeo, eM)); const hs = halo3D(0x8fe3ff, 0.42, 0.45); g.add(hs);
    g.userData = { x0: -7 + r() * 14, y0: -0.75 + r() * 1.5, z0: 0.2 + r() * 0.6, f: 2 + r() * 3, ph: r() * 6.28 };
    g.visible = false; fio.add(g); ele.push(g);
  }
  k.animar((t) => {
    // câmera: plano do fio inteiro -> mergulho até a superfície do cobre
    const z = chaves(t, [[c.ini, 17], [tz, 15], [tz + 1.8, 5.2], [tf, 4.6]]);
    const x = chaves(t, [[c.ini, -3], [tz, -1.5], [tz + 1.8, 0.4], [tf, 1.2]]);
    const y = chaves(t, [[c.ini, 2.4], [tz, 1.6], [tz + 1.8, 0.35], [tf, 0.3]]);
    k.camera.position.set(x, y, z); k.camera.lookAt(x + 0.3, y * 0.4, 0);
    nucleoM.opacity = chaves(t, [[tz + 0.6, 1], [tz + 1.6, 0.06]]);
    nucleoM.depthWrite = nucleoM.opacity > 0.9;
    atM.opacity = chaves(t, [[tz + 0.9, 0], [tz + 1.8, 0.9]]);
    const vis = t >= te;
    const deriva = t > tan ? (t - tan) * chaves(t, [[tan, 0.4], [tan + 1.5, 2.2]]) : 0;
    ele.forEach((g, q) => {
      const u = g.userData, a = Math.min(1, Math.max(0, (t - te - q * 0.006) / 0.35));
      g.visible = vis && a > 0;
      g.scale.setScalar(a);
      let xx = u.x0 + deriva; xx = ((xx + 7) % 14 + 14) % 14 - 7;
      g.position.set(xx + Math.sin(t * u.f + u.ph) * 0.05, u.y0 + Math.cos(t * u.f * 1.3 + u.ph) * 0.05, u.z0);
    });
  });
  mostrar3D(k, c.ini + 0.05, tf + 0.2, 0.5);
  callAnim($(".rotEl", frente), te + 0.6);
  tl.to($(".rotEl", frente), { opacity: 0, duration: 0.3 }, tf - 0.4);
  // da escala atômica para a analogia da fila
  tl.set(fila, { opacity: 1 }, tf);
  $$(".p", fila).forEach((p, k2) => tl.fromTo(p, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "back.out(1.8)", immediateRender: false }, tf + k2 * 0.06));
  const tp = B("empurrao", 0.88);
  tl.fromTo($(".mao", el), { x: -120, opacity: 0 }, { x: 0, opacity: 1, duration: 0.3, ease: "power3.out", immediateRender: false }, tp - 0.3);
  $$(".p", fila).forEach((p, k2) => tl.fromTo(p, { rotation: 0 }, { rotation: 13, duration: 0.15, yoyo: true, repeat: 1, ease: "power2.out", transformOrigin: "50% 100%", immediateRender: false }, tp + k2 * 0.11));
  tl.set($(".onda", el), { opacity: 1 }, tp);
  desenhar($(".onda path", el), tp, 0.8);
  brilhar($(".onda", el));
};

// =============== 3. Faraday: bancada de laboratório ===============
CENAS.inducao = (el, c, B) => {
  const espiras = Array.from({ length: 9 }, (_, k) => `<ellipse cx="${420 + k * 30}" cy="980" rx="20" ry="110" fill="none" stroke="url(#cobreH)" stroke-width="15"/>`).join("");
  el.innerHTML = `
    <rect width="${W}" height="${H}" fill="url(#parede)"/>
    ${halo(540, 600, 650, "lab").replace('class="lab"', 'class="lab" opacity="0.25"')}
    <rect y="1110" width="${W}" height="810" fill="url(#madeira)"/><rect y="1110" width="${W}" height="16" fill="#b07a55"/>
    ${sombra(540, 1125, 380, 30, 0.8)}
    <g transform="translate(110 470)"><g class="nota"><rect width="360" height="200" rx="10" fill="url(#papel)" transform="rotate(-4)"/><text class="rotm" x="30" y="70" font-size="32" fill="#5a4026" transform="rotate(-4)">Michael Faraday</text><text class="rot" x="30" y="140" font-size="64" fill="#8a5a2c" transform="rotate(-4)">1831</text></g></g>
    <g class="medidor" transform="translate(800 560)"><g class="med"><rect x="-120" y="-110" width="240" height="200" rx="26" fill="url(#metal)"/><rect x="-100" y="-90" width="200" height="120" rx="14" fill="#f6f2e6"/><path d="M-80 10 A 90 90 0 0 1 80 10" fill="none" stroke="#9a8a6a" stroke-width="4"/><g transform="translate(0 20)"><g class="agulha"><rect x="-3" y="-95" width="6" height="95" rx="3" fill="${C.vermelho}"/></g></g><circle cy="20" r="10" fill="#333"/></g></g>
    <path class="laco" d="M420 870 C 300 700, 360 640, 560 640 C 700 640, 760 600, 760 650" fill="none" stroke="url(#cobre)" stroke-width="10" stroke-linecap="round"/>
    <path class="laco2" d="M660 870 C 720 760, 820 760, 840 680" fill="none" stroke="url(#cobre)" stroke-width="10" stroke-linecap="round"/>
    <g class="bobina">${espiras}<rect x="400" y="1080" width="280" height="30" rx="8" fill="#5d6890"/></g>
    <g transform="translate(980 980)"><g class="ima">${sombra(-150, 70, 200, 16, 0.6)}<rect x="-300" y="-55" width="150" height="110" rx="14" fill="url(#vermelhoI)"/><rect x="-150" y="-55" width="150" height="110" rx="14" fill="url(#azulI)"/><rect x="-292" y="-46" width="284" height="16" rx="8" fill="#fff" opacity="0.35"/><text class="rot" x="-225" y="22" text-anchor="middle" font-size="54" fill="#fff">N</text><text class="rot" x="-75" y="22" text-anchor="middle" font-size="54" fill="#0b2a55">S</text></g></g>
    <g class="campo" opacity="0">${[0, 1, 2].map((k) => `<ellipse cx="830" cy="980" rx="${170 + k * 50}" ry="${70 + k * 30}" fill="none" stroke="${C.ciano}" stroke-width="3" stroke-dasharray="8 10" opacity="${0.6 - k * 0.15}"/>`).join("")}</g>
    <g class="eq" transform="translate(540 1300)"><g class="eqi"></g></g>`;
  const nota = $(".nota", el), ima = $(".ima", el), bob = $(".bobina", el), med = $(".med", el), ag = $(".agulha", el), campo = $(".campo", el);
  surge(bob, c.ini + 0.2, 80);
  surge(med, c.ini + 0.35, 80);
  desenhar($(".laco", el), c.ini + 0.4, 0.9);
  desenhar($(".laco2", el), c.ini + 0.5, 0.9);
  tl.set(nota, { opacity: 0 }, c.ini);
  tl.fromTo(nota, { y: -80, rotation: -14, opacity: 0 }, { y: 0, rotation: 0, opacity: 1, duration: 0.7, ease: "back.out(1.6)", immediateRender: false }, B("faraday", 0.25));
  const ti = B("ima", 0.4);
  tl.set(ima, { opacity: 0 }, c.ini);
  tl.fromTo(ima, { x: 360, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "power3.out", immediateRender: false }, ti - 0.25);
  tl.fromTo(campo, { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, ti + 0.3);
  const n = Math.max(1, Math.floor((c.fim - ti - 0.5) / 0.6));
  tl.fromTo(ima, { x: 0 }, { x: -200, duration: 0.6, yoyo: true, repeat: n, ease: "sine.inOut", immediateRender: false }, ti + 0.45);
  tl.fromTo(campo, { x: 0 }, { x: -200, duration: 0.6, yoyo: true, repeat: n, ease: "sine.inOut", immediateRender: false }, ti + 0.45);
  tl.fromTo($$("ellipse", bob), { strokeWidth: 15 }, { strokeWidth: 19, duration: 0.18, stagger: 0.04, yoyo: true, repeat: 1, immediateRender: false }, B("bobina", 0.55));
  const tc = B("corrente", 0.7);
  fluxo($(".laco", el), 7, 8, tc, c.fim, 0.6, el);
  fluxo($(".laco2", el), 4, 8, tc, c.fim, 0.6, el);
  tl.fromTo(ag, { rotation: 0, svgOrigin: "0 0" }, { rotation: 38, duration: 0.6, yoyo: true, repeat: Math.max(1, Math.floor((c.fim - tc) / 0.6)), ease: "sine.inOut", svgOrigin: "0 0", immediateRender: false }, tc);
  const te = B("equacao", 0.85);
  const eqi = $(".eqi", el);
  eqi.innerHTML = `<g transform="translate(-300 0)"><g class="q">${rotulo("ÍMÃ MEXENDO", C.rosa, 32)}</g></g><g transform="translate(-125 0)"><g class="q"><text class="rot" y="18" text-anchor="middle" font-size="56" fill="#fff">+</text></g></g><g transform="translate(-20 0)"><g class="q">${rotulo("FIO", C.cobre, 32)}</g></g><g transform="translate(85 0)"><g class="q"><text class="rot" y="18" text-anchor="middle" font-size="56" fill="#fff">=</text></g></g><g transform="translate(250 0)"><g class="q">${rotulo("ELETRICIDADE", C.amarelo, 32)}</g></g>`;
  $$(".q", eqi).forEach((q, k) => { tl.set(q, { opacity: 0 }, c.ini); pop(q, te + k * 0.12); });
};

// =============== 4. gerador (3D) ===============
// texto numa face de caixa (letra N/S do ímã)
function _texLetra(letra, fundo, cor) {
  const cv = document.createElement("canvas"); cv.width = 256; cv.height = 256;
  const cx = cv.getContext("2d"); cx.fillStyle = fundo; cx.fillRect(0, 0, 256, 256);
  cx.fillStyle = cor; cx.font = "900 170px Nunito"; cx.textAlign = "center"; cx.textBaseline = "middle"; cx.fillText(letra, 128, 140);
  const t = new THREE.CanvasTexture(cv); t.encoding = THREE.sRGBEncoding; return t;
}
CENAS.gerador = (el, c, B, i, frente) => {
  el.innerHTML = `
    <rect width="${W}" height="${H}" fill="#0c1438"/>
    ${halo(540, 860, 640, "auraG", "brilhoAzul").replace('class="auraG"', 'class="auraG" opacity="0.15"')}
    <g class="hall" opacity="0">
      <rect width="${W}" height="${H}" fill="#18214f"/>${[0, 1, 2, 3, 4].map((k) => `<rect x="${60 + k * 210}" y="300" width="120" height="560" rx="10" fill="#22306c"/>`).join("")}
      ${raiosLuz(540, 240, 9, 70, 1150, 90, "raiosHall", 4)}
      <rect y="1230" width="${W}" height="690" fill="#111a40"/><rect y="1230" width="${W}" height="14" fill="#2c3b7c"/>
      ${[220, 860].map((x, k) => P(x, 1232, 0.7, "pessoaH", gente(k + 2))).join("")}
    </g>`;
  frente.innerHTML = `<g transform="translate(270 1250)"><g class="nomeg">${rotulo("GERADOR", C.amarelo, 52)}</g></g>
    <g transform="translate(540 1380)"><g class="usinaRot">${rotulo("USINA", C.verde, 52)}</g></g>`;
  const hall = $(".hall", el), nome = $(".nomeg", frente), usinaRot = $(".usinaRot", frente);
  tl.set([nome, usinaRot], { opacity: 0 }, 0);
  const tg = B("gira", 0.2), ts = B("sai", 0.45), tn = B("nome", 0.6), tu = B("usina", 0.8);
  const k = camada3D({ ini: c.ini - 0.5, fim: c.fim + 0.5, fov: 34 });
  const ger = new THREE.Group(); k.cena.add(ger);
  // carcaça: anel grosso de aço (perfil girado) + fundo escuro
  const perfil = [new THREE.Vector2(2.55, -0.55), new THREE.Vector2(3.05, -0.55), new THREE.Vector2(3.05, 0.55), new THREE.Vector2(2.55, 0.55), new THREE.Vector2(2.55, -0.55)];
  const anel = new THREE.Mesh(new THREE.LatheGeometry(perfil, 96), new THREE.MeshStandardMaterial({ color: 0xc9d0e6, metalness: 0.75, roughness: 0.38 })); anel.rotation.x = Math.PI / 2; ger.add(anel);
  const fundo = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 0.1, 64), material3D("acoEsc")); fundo.rotation.x = Math.PI / 2; fundo.position.z = -0.5; ger.add(fundo);
  // 10 bobinas de cobre presas por dentro do anel
  const bobinas = [];
  for (let q = 0; q < 10; q++) {
    const a = (q / 10) * Math.PI * 2, b = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: 0xc8662e, metalness: 1, roughness: 0.32, envMapIntensity: 0.8, emissive: 0xff7a1a, emissiveIntensity: 0 });
    const nucleoB = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.8, 0.6), material3D("acoEsc")); b.add(nucleoB);
    for (let j = 0; j < 6; j++) { const esp = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.06, 10, 28), m); esp.rotation.x = Math.PI / 2; esp.scale.set(1, 1.35, 1); esp.position.y = -0.3 + j * 0.12; b.add(esp); }
    const hb = halo3D(0xffc060, 1.6, 0); hb.position.z = 0.4; b.add(hb);
    b.position.set(Math.cos(a) * 2.15, Math.sin(a) * 2.15, 0); b.rotation.z = a - Math.PI / 2;
    ger.add(b); bobinas.push({ a, m, hb });
  }
  // rotor: ímã (metade vermelha N, metade azul S) + eixo
  const rotor = new THREE.Group(); ger.add(rotor);
  const face = (l, f, cr) => new THREE.MeshStandardMaterial({ map: _texLetra(l, f, cr), roughness: 0.35 });
  const mN = [material3D("vermelho"), material3D("vermelho"), material3D("vermelho"), material3D("vermelho"), face("N", "#ef476f", "#ffffff"), material3D("vermelho")];
  const mS = [material3D("azul"), material3D("azul"), material3D("azul"), material3D("azul"), face("S", "#4cc9f0", "#0b2a55"), material3D("azul")];
  const n = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.95, 0.75), mN); n.position.x = -0.85; rotor.add(n);
  const sm = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.95, 0.75), mS); sm.position.x = 0.85; rotor.add(sm);
  const eixo = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.4, 32), material3D("aco")); eixo.rotation.x = Math.PI / 2; rotor.add(eixo);
  // linhas do campo magnético girando junto
  const campoM = new THREE.MeshBasicMaterial({ color: 0x8fe3ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  [1.25, 1.55, 1.85].forEach((rr) => { const tor = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.012, 6, 96, Math.PI * 0.8), campoM); tor.rotation.z = -Math.PI * 0.4; rotor.add(tor); const t2 = tor.clone(); t2.rotation.z = Math.PI * 0.6; rotor.add(t2); });
  // cabo de saída até a lâmpada, com elétrons correndo
  const curva = new THREE.CatmullRomCurve3([new THREE.Vector3(2.4, -1.9, 0.2), new THREE.Vector3(3.6, -3.2, 0.6), new THREE.Vector3(3.0, -4.6, 0.8), new THREE.Vector3(2.2, -5.4, 0.6)]);
  const caboM = new THREE.MeshStandardMaterial({ color: 0xd9824a, metalness: 1, roughness: 0.35, transparent: true, opacity: 0 });
  const cabo = new THREE.Mesh(new THREE.TubeGeometry(curva, 80, 0.09, 12), caboM); ger.add(cabo);
  const lampM = new THREE.MeshStandardMaterial({ color: 0x33407a, emissive: 0xffd76a, emissiveIntensity: 0, roughness: 0.2, transparent: true, opacity: 0 });
  const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.62, 32, 24), lampM); lamp.position.set(2.0, -6.1, 0.6); ger.add(lamp);
  const rosca = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.26, 0.45, 24), material3D("aco")); rosca.position.set(2.05, -5.45, 0.6); rosca.rotation.z = 0.1; ger.add(rosca);
  const hl = halo3D(0xffd76a, 4.5, 0); hl.position.copy(lamp.position); ger.add(hl);
  const els = Array.from({ length: 8 }, () => { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 12, 10), emissivo3D(0x8fe3ff, 3))); g.add(halo3D(0x8fe3ff, 0.5, 0.9)); g.visible = false; ger.add(g); return g; });
  const ang = (t) => (t < tg ? 0 : t < tg + 0.8 ? (Math.PI / 2) * ((t - tg) / 0.8) ** 2 : Math.PI / 2 + (t - tg - 0.8) * Math.PI * 2 * 1.2);
  k.animar((t) => {
    const a = ang(t);
    rotor.rotation.z = a;
    campoM.opacity = chaves(t, [[tg + 0.4, 0], [tg + 1.2, 0.55]]);
    // cada bobina brilha quando um polo do ímã passa por ela (indução)
    const forca = chaves(t, [[tg + 0.5, 0], [tg + 1.5, 1]]);
    bobinas.forEach((b) => { const d = Math.abs(Math.cos(a - b.a)); const e = forca * Math.pow(d, 6); b.m.emissiveIntensity = e * 1.2; b.hb.material.opacity = e * 0.7; });
    const ls = chaves(t, [[ts - 0.4, 0], [ts + 0.1, 1]]);
    caboM.opacity = ls; lampM.opacity = ls;
    const acesa = chaves(t, [[ts + 0.3, 0], [ts + 0.7, 1]]);
    lampM.color.setHex(acesa > 0.5 ? 0xffe066 : 0x33407a); lampM.emissiveIntensity = acesa * 2.4; hl.material.opacity = acesa * 0.95;
    els.forEach((g, q) => { g.visible = t > ts + 0.1; if (g.visible) g.position.copy(curva.getPointAt((((t - ts) * 0.55 + q / els.length) % 1 + 1) % 1)); });
    // câmera: 3/4 orbitando devagar; recua para o salão na "usina"
    const orb = 0.5 + (t - c.ini) * 0.035;
    const dist = chaves(t, [[c.ini, 34], [c.ini + 1.2, 25], [tu, 25], [tu + 1.4, 58]], (x) => 1 - Math.pow(1 - x, 3));
    const alvoY = chaves(t, [[ts - 0.5, -0.4], [ts + 0.5, -1.8], [tu, -1.8], [tu + 1.4, -2.4]]);
    k.camera.position.set(Math.sin(orb) * dist * 0.42, alvoY + dist * 0.16, Math.cos(orb) * dist);
    k.camera.lookAt(0.3, alvoY, 0);
  });
  mostrar3D(k, c.ini + 0.05, c.fim + 0.45, 0.5);
  tl.set(nome, { opacity: 1 }, tn);
  pop(nome, tn);
  tl.fromTo(hall, { opacity: 0 }, { opacity: 1, duration: 0.8, immediateRender: false }, tu);
  animarRaios($(".raiosHall", el), tu, c.fim);
  tl.to(nome, { opacity: 0, duration: 0.3 }, tu);
  tl.set(usinaRot, { opacity: 1 }, tu + 0.9);
  pop(usinaRot, tu + 0.9);
};

// =============== 5. hidrelétrica ===============
CENAS.hidreletrica = (el, c, B) => {
  el.innerHTML = `
    <rect width="${W}" height="${H}" fill="url(#ceuCrep)"/>
    ${nuvem(220, 380, 1, 0.2)}${nuvem(820, 300, 0.8, 0.16)}<g transform="translate(0 -230)">
    <path d="M0 760 L 160 520 L 300 700 L 460 460 L 640 720 L 760 600 L 1080 820 V 1920 H 0z" fill="url(#morroN1)"/>
    <path d="M0 860 L 220 700 L 420 820 L 600 880 V 1920 H 0z" fill="url(#morroN2)"/>
    <g class="lago"><path class="sup" d="M0 880 Q 120 868 240 880 T 480 880 V 1300 H 0z" fill="url(#agua)"/><path d="M40 900 h120 M220 930 h90 M70 980 h160" stroke="#c9f1ff" stroke-width="5" stroke-linecap="round" opacity="0.5"/></g>
    <path d="M440 820 L 560 820 L 690 1340 L 440 1340z" fill="url(#concreto)"/><path d="M440 820 h120 v18 h-120z" fill="#e6ebfa"/>
    <path class="cano" d="M470 1150 C 560 1230, 650 1280, 760 1320" fill="none" stroke="#56618a" stroke-width="54" stroke-linecap="round"/>
    <path class="canoAgua" d="M470 1150 C 560 1230, 650 1280, 760 1320" fill="none" stroke="none"/>
    <rect x="690" y="1180" width="300" height="230" rx="14" fill="#7d89ad"/><rect x="690" y="1180" width="300" height="16" fill="#aab4d6"/>
    <circle cx="840" cy="1330" r="96" fill="#121a45" stroke="#c7cde6" stroke-width="6"/>
    <g transform="translate(840 1330)"><g class="turb">${turbinaR(84, C.azul, 8)}</g></g>
    <rect x="800" y="1100" width="80" height="90" rx="12" fill="url(#cobre)"/>
    <path class="rio" d="M690 1410 C 820 1440, 960 1430, 1080 1460" fill="none" stroke="url(#agua)" stroke-width="30" stroke-linecap="round"/>
    <path class="linhaH" d="M880 1100 C 940 1000, 990 950, 1080 900" fill="none" stroke="${C.amarelo}" stroke-width="6"/>
    <rect y="1445" width="${W}" height="750" fill="#0f1a40"/>
    <g class="call1" opacity="0">${callout(840, 1330, 560, 1510, "turbina", C.ciano)}</g></g>
    <g transform="translate(540 430)"><g class="br"><rect x="-370" y="-62" width="740" height="124" rx="62" fill="rgba(6,10,30,0.55)" stroke="rgba(255,255,255,0.25)" stroke-width="3"/><g transform="translate(-290 0)"><rect x="-52" y="-36" width="104" height="72" rx="10" fill="#009c3b"/><path d="M0 -27 L 44 0 L 0 27 L -44 0z" fill="#ffdf00"/><circle r="16" fill="#002776"/></g><text class="rot" x="50" y="14" text-anchor="middle" font-size="38" fill="#fff">A maior parte vem da água</text></g></g>`;
  const sup = $(".sup", el), turb = $(".turb", el), br = $(".br", el);
  tl.fromTo(el.querySelector(".lago"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", immediateRender: false }, c.ini + 0.1);
  $$(".nuvem", el).forEach((n, k) => tl.fromTo(n, { x: 0 }, { x: 80 + k * 30, duration: c.fim - c.ini, ease: "none", immediateRender: false }, c.ini));
  tl.set([br, $(".linhaH", el)], { opacity: 0 }, c.ini);
  const ta = B("agua", 0.2);
  tl.fromTo(sup, { morphSVG: sup.getAttribute("d") }, { morphSVG: "M0 880 Q 120 892 240 880 T 480 880 V 1300 H 0z", duration: 0.9, yoyo: true, repeat: Math.max(1, Math.floor((c.fim - ta) / 0.9)), ease: "sine.inOut", immediateRender: false }, ta);
  const td = B("desce", 0.4);
  fluxo($(".canoAgua", el), 12, 9, td, c.fim, 1.0, el, "#d6f6ff");
  girar(turb, td + 0.4, c.fim, 1.3);
  callAnim($(".call1", el), B("turbina", 0.6));
  tl.set($(".linhaH", el), { opacity: 1 }, B("turbina", 0.6) + 0.4);
  desenhar($(".linhaH", el), B("turbina", 0.6) + 0.4, 0.6);
  tl.set(br, { opacity: 1 }, B("brasil", 0.85));
  pop(br, B("brasil", 0.85));
};

// =============== 6. eólica (em cima) + térmica (embaixo) ===============
CENAS.eolica_termica = (el, c, B) => {
  el.innerHTML = `
    <g class="topo"><rect width="${W}" height="900" fill="url(#ceuDia)"/>${nuvem(200, 380, 1, 0.55)}${nuvem(760, 300, 0.85, 0.5)}${nuvem(540, 520, 0.6, 0.4)}
      <path d="M0 760 C 220 640, 460 700, 640 660 S 940 620, 1080 680 V 900 H 0z" fill="#4fae7f"/><path d="M0 830 C 300 760, 640 820, 1080 770 V 900 H 0z" fill="url(#grama)"/>
      ${P(280, 790, 0.8, "e1", eolica(360, "pas1"))}${P(620, 720, 0.6, "e2", eolica(360, "pas2"))}${P(960, 740, 0.45, "e3", eolica(360, "pas3"))}
      <g class="ventos">${[0, 1, 2].map((k) => `<path d="M-40 ${430 + k * 70} C 160 ${400 + k * 70}, 300 ${460 + k * 70}, 520 ${420 + k * 70}" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>`).join("")}</g>
      <g transform="translate(860 360)"><g class="rotE">${rotulo("EÓLICA", C.azul, 40)}</g></g></g>
    <rect y="896" width="${W}" height="10" fill="#0a1230"/>
    <g class="baixo"><rect y="906" width="${W}" height="1014" fill="#1a1530"/>
      ${halo(540, 1330, 360, "calor").replace('class="calor"', 'class="calor" opacity="0"')}
      <rect x="380" y="1260" width="320" height="170" rx="20" fill="#3a3550"/><rect x="380" y="1260" width="320" height="16" fill="#5a5470"/>
      <g transform="translate(540 1420)"><g class="chama"><path d="M0 -150 C 70 -90, 80 -30, 0 0 C -80 -30, -70 -90, 0 -150z" fill="url(#fogo)"/><path d="M-80 0 C -40 -60, -60 -90, -40 -110 C -10 -70, -20 -30, 0 0z" fill="url(#fogo)"/><path d="M80 0 C 40 -60, 60 -90, 40 -110 C 10 -70, 20 -30, 0 0z" fill="url(#fogo)"/></g></g>
      <rect x="420" y="1080" width="240" height="180" rx="40" fill="url(#metal)"/><rect x="440" y="1100" width="40" height="140" rx="18" fill="#fff" opacity="0.35"/>
      <path d="M600 1080 V 1000 H 780" fill="none" stroke="#7d89ad" stroke-width="34" stroke-linejoin="round"/>
      <path class="tuboVapor" d="M600 1080 V 1000 H 780" fill="none" stroke="none"/>
      <circle cx="850" cy="1000" r="96" fill="#121a45" stroke="#c7cde6" stroke-width="6"/><g transform="translate(850 1000)"><g class="tt">${turbinaR(82, C.rosa, 8)}</g></g>
      <g class="vapores"></g>
      <g transform="translate(200 1160)"><g class="panela"><rect x="-90" y="-10" width="180" height="96" rx="22" fill="url(#metal)"/><rect x="-124" y="10" width="40" height="16" rx="8" fill="#7d89ad"/><rect x="84" y="10" width="40" height="16" rx="8" fill="#7d89ad"/><g class="tampa"><rect x="-98" y="-32" width="196" height="22" rx="11" fill="#eef1ff"/><rect x="-18" y="-52" width="36" height="22" rx="9" fill="#eef1ff"/></g></g></g>
      <g transform="translate(860 1240)"><g class="rotT">${rotulo("TÉRMICA", C.laranja, 40)}</g></g></g>`;
  const topo = $(".topo", el), baixo = $(".baixo", el);
  tl.fromTo(topo, { y: -200, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", immediateRender: false }, c.ini + 0.1);
  tl.fromTo(baixo, { y: 200, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", immediateRender: false }, c.ini + 0.2);
  $$(".nuvem", el).forEach((n, k) => tl.fromTo(n, { x: 0 }, { x: 140 + k * 40, duration: c.fim - c.ini, ease: "none", immediateRender: false }, c.ini));
  tl.set([$(".rotE", el), $(".rotT", el), $(".panela", el)], { opacity: 0 }, c.ini);
  const tv = B("vento", 0.15);
  pop($(".rotE", el), tv);
  $$(".ventos path", el).forEach((v, k) => { tl.fromTo(v, { drawSVG: "0% 0%" }, { drawSVG: "0% 100%", duration: 0.6, immediateRender: false }, tv + k * 0.12); tl.to(v, { drawSVG: "100% 100%", duration: 0.6, repeat: Math.max(1, Math.floor((c.fim - tv) / 1.3)), repeatDelay: 0.7 }, tv + 0.6 + k * 0.12); });
  girar($(".pas1", el), tv, c.fim, 0.45); girar($(".pas2", el), tv + 0.2, c.fim, 0.5); girar($(".pas3", el), tv + 0.4, c.fim, 0.55);
  const tfo = B("fogo", 0.45);
  pop($(".rotT", el), tfo);
  tl.fromTo($(".chama", el), { scale: 0.2, transformOrigin: "50% 100%" }, { scale: 1, duration: 0.5, ease: "back.out(2)", immediateRender: false }, tfo);
  tl.fromTo($(".chama", el), { scaleY: 1 }, { scaleY: 1.14, duration: 0.16, yoyo: true, repeat: Math.max(1, Math.floor((c.fim - tfo) / 0.16)), ease: "sine.inOut", transformOrigin: "50% 100%", immediateRender: false }, tfo + 0.5);
  tl.fromTo($(".calor", el), { opacity: 0 }, { opacity: 0.6, duration: 0.6, immediateRender: false }, tfo);
  const tvp = B("vapor", 0.6);
  const vap = $(".vapores", el);
  for (let k = 0; k < 12; k++) vap.insertAdjacentHTML("beforeend", `<g transform="translate(${620 + (k % 3) * 40} 990)"><circle class="v" r="${24 + (k % 4) * 7}" fill="#eef1ff" opacity="0"/></g>`);
  $$(".v", vap).forEach((v, k) => tl.fromTo(v, { y: 0, x: 0, opacity: 0.85, scale: 0.5 }, { y: -170, x: 60, opacity: 0, scale: 1.5, duration: 1.3, repeat: Math.max(1, Math.floor((c.fim - tvp) / 1.3)), ease: "power1.out", immediateRender: false, transformOrigin: "50% 50%" }, tvp + k * 0.11));
  fluxo($(".tuboVapor", el), 6, 10, tvp, c.fim, 1.2, baixo, "#ffffff");
  girar($(".tt", el), B("empurra", 0.7), c.fim, 1.2);
  const tp = B("panela", 0.9);
  pop($(".panela", el), tp - 0.3);
  tl.fromTo($(".tampa", el), { y: 0, rotation: 0 }, { y: -46, rotation: -8, duration: 0.14, yoyo: true, repeat: 5, ease: "power2.out", transformOrigin: "50% 100%", immediateRender: false }, tp);
};

// =============== 7. solar: telhado ao sol ===============
CENAS.solar = (el, c, B) => {
  const cel = [];
  for (let r = 0; r < 3; r++) for (let q = 0; q < 5; q++) cel.push(`<rect x="${q * 108}" y="${r * 78}" width="100" height="70" rx="6" fill="url(#painel)" stroke="#9ec5ff" stroke-width="3"/>`);
  el.innerHTML = `
    <rect width="${W}" height="${H}" fill="url(#ceuDia)"/>${nuvem(260, 480, 0.9, 0.45)}${nuvem(700, 640, 0.6, 0.35)}
    ${halo(800, 330, 420, "solH")}
    <g transform="translate(800 330)"><g class="sol"><circle r="110" fill="url(#sol)"/><g class="raiosSol">${Array.from({ length: 12 }, (_, k) => `<rect x="-9" y="-200" width="18" height="60" rx="9" fill="#ffe066" transform="rotate(${k * 30})"/>`).join("")}</g></g></g>
    <path d="M0 1080 L 540 860 L 1080 1080 V 1920 H 0z" fill="#b5564e"/><path d="M0 1080 L 540 860 L 1080 1080" fill="none" stroke="#7a2f2f" stroke-width="22" stroke-linejoin="round"/>
    <rect y="1080" width="${W}" height="840" fill="#e9dccb"/>
    <g transform="translate(190 900) skewX(-22) scale(1 0.62)"><g class="placa">${cel.join("")}</g></g>
    <g class="fotons"></g><g class="livres"></g>
    <path class="fioS" d="M720 1060 C 860 1120, 900 1200, 880 1250" fill="none" stroke="url(#cobre)" stroke-width="12" stroke-linecap="round"/>
    ${P(880, 1330, 0.55, "lampS", lampada("lamp"))}
    <g transform="translate(250 620)"><g class="lupa" opacity="0"><circle r="150" fill="rgba(10,20,60,0.85)" stroke="#fff" stroke-width="14"/><rect x="95" y="95" width="40" height="120" rx="20" fill="#fff" transform="rotate(-45 115 155)"/><g class="lupaE"></g></g></g>
    <g transform="translate(470 1220)"><g class="exc"><g transform="translate(-170 0)"><circle r="52" fill="rgba(6,10,30,0.6)"/>${[0, 120, 240].map((a) => `<rect x="-7" y="-44" width="14" height="40" rx="7" fill="#fff" transform="rotate(${a})"/>`).join("")}<path d="M-46 -46 L 46 46" stroke="${C.vermelho}" stroke-width="13" stroke-linecap="round"/></g><g transform="translate(90 0)">${rotulo("NÃO GIRA NADA", C.rosa, 36)}</g></g></g>`;
  const sol = $(".sol", el), placa = $(".placa", el), lamp = $(".lamp", el), fioS = $(".fioS", el), lupa = $(".lupa", el);
  pop(sol, c.ini + 0.15);
  girar($(".raiosSol", el), c.ini, c.fim, 0.08);
  $$(".nuvem", el).forEach((n, k) => tl.fromTo(n, { x: 0 }, { x: 90 + k * 30, duration: c.fim - c.ini, ease: "none", immediateRender: false }, c.ini));
  surge(placa, c.ini + 0.3, 100);
  tl.set([$(".exc", el), fioS, lamp], { opacity: 0 }, c.ini);
  pop($(".exc", el), B("excecao", 0.15));
  const tr = B("raios", 0.4), fot = $(".fotons", el);
  for (let k = 0; k < 16; k++) {
    const tx = 260 + (k % 8) * 62, ty = 930 + Math.floor(k / 8) * 70;
    fot.insertAdjacentHTML("beforeend", `<g transform="translate(800 330)"><g class="f" data-x="${tx - 800}" data-y="${ty - 330}"><circle r="22" fill="url(#brilho)"/><circle r="8" fill="#fffbe0"/></g></g>`);
  }
  $$(".f", fot).forEach((f, k) => tl.fromTo(f, { x: 0, y: 0, opacity: 1 }, { x: +f.dataset.x, y: +f.dataset.y, opacity: 0.3, duration: 0.75, repeat: Math.max(1, Math.floor((c.fim - tr) / 1.25)), repeatDelay: 0.5, ease: "power1.in", immediateRender: false }, tr + k * 0.07));
  // lupa mostrando os elétrons sendo soltos
  const tso = B("solta", 0.6);
  const le = $(".lupaE", el);
  for (let k = 0; k < 8; k++) le.insertAdjacentHTML("beforeend", `<g transform="translate(${-80 + (k % 4) * 54} ${-30 + Math.floor(k / 4) * 70})"><g class="le">${eletron(13)}</g></g>`);
  tl.set(lupa, { opacity: 1 }, tso - 0.4);
  pop(lupa, tso - 0.4);
  $$(".le", le).forEach((e, k) => tl.fromTo(e, { y: 0, opacity: 0.4, scale: 0.6 }, { y: -40 - (k % 3) * 15, x: (k % 2 ? 20 : -20), opacity: 1, scale: 1, duration: 0.5, ease: "back.out(2.5)", transformOrigin: "50% 50%", immediateRender: false }, tso + k * 0.06));
  const tpr = B("pronto", 0.85);
  tl.set([fioS, lamp], { opacity: 1 }, tpr - 0.45);
  desenhar(fioS, tpr - 0.45, 0.45);
  fluxo(fioS, 5, 7, tpr - 0.1, c.fim, 0.9, el);
  acender(lamp, tpr, 0.9);
};

// =============== 8. transmissão até a casa ===============
CENAS.transmissao = (el, c, B) => {
  // torres em perspectiva: diminuem com a distância
  const torres = [[310, 1375, 1.0], [540, 1235, 0.75], [715, 1160, 0.55], [840, 1112, 0.4]];
  const pts = [[190, 1285], ...torres.map(([x, y, s]) => [x, y - 264 * s]), [860, 1205]];
  const cabo = "M" + pts[0].join(" ") + pts.slice(1).map((p, k) => { const a = pts[k]; return ` Q ${(a[0] + p[0]) / 2} ${Math.max(a[1], p[1]) + 30} ${p[0]} ${p[1]}`; }).join("");
  el.innerHTML = `
    <rect width="${W}" height="${H}" fill="url(#ceuCrep)"/>${estrelas(40, 21, 0, 600)}
    <path d="M0 1000 C 260 930, 560 980, 800 940 S 1000 930, 1080 950 V 1920 H 0z" fill="url(#morroN1)"/>
    <path d="M0 1180 C 300 1100, 640 1160, 1080 1110 V 1920 H 0z" fill="url(#morroN2)"/>
    ${torres.map(([x, y, s], k) => P(x, y, s, "tr" + k, torre(330))).join("")}
    <path class="caboT" d="${cabo}" fill="none" stroke="${C.amarelo}" stroke-width="5"/>
    ${P(110, 1380, 0.8, "usinaT", usinaT())}
    <g transform="translate(860 1240)"><g class="poste"><rect x="-6" y="-60" width="12" height="160" fill="#9aa7c7"/><rect class="trafo" x="-40" y="-40" width="80" height="70" rx="12" fill="#5f6a8c" stroke="#c7cde6" stroke-width="4"/></g></g>
    ${P(960, 1380, 0.75, "casaT", casa("#e9ecff", "janT"))}
    <rect y="1380" width="${W}" height="540" fill="#0e1636"/>
    <g class="dist" opacity="0"><path d="M120 820 H 900" stroke="#fff" stroke-width="5" stroke-dasharray="14 12"/><path d="M900 820 l -26 -16 v32z" fill="#fff"/><g transform="translate(510 760)">${rotulo("CENTENAS DE QUILÔMETROS", C.amarelo, 36)}</g></g>
    <g class="callT" opacity="0">${callout(860, 1205, 600, 880, "transformador", C.verde)}</g>
    <g class="interior" opacity="0"><rect width="${W}" height="${H}" fill="url(#paredeQ)"/><rect y="1240" width="${W}" height="680" fill="url(#piso)"/>
      <g transform="translate(330 900)"><g class="tomada"><rect x="-130" y="-130" width="260" height="260" rx="46" fill="#eef1ff"/><circle r="88" fill="#d6dbef"/><circle cx="-32" cy="-16" r="15" fill="#4f5a7f"/><circle cx="32" cy="-16" r="15" fill="#4f5a7f"/><circle cx="0" cy="38" r="15" fill="#4f5a7f"/></g></g>
      <path class="caboL" d="M410 900 C 560 900, 600 760, 720 690" fill="none" stroke="#eef1ff" stroke-width="14" stroke-linecap="round"/>
      ${P(760, 620, 0.85, "lampT", lampada("lamp"))}</g>`;
  const cabo_ = $(".caboT", el), dist = $(".dist", el), callT = $(".callT", el), interior = $(".interior", el), lamp = $(".lamp", el);
  torres.forEach((_, k) => surge($(".tr" + k, el), c.ini + 0.15 + k * 0.1, 80));
  surge($(".usinaT", el), c.ini + 0.1, 60);
  surge($(".casaT", el), c.ini + 0.4, 60);
  tl.set(cabo_, { opacity: 0 }, c.ini);
  const tc = B("cabos", 0.15);
  tl.set(cabo_, { opacity: 1 }, tc);
  desenhar(cabo_, tc, 1.1);
  fluxo(cabo_, 7, 6, tc + 0.9, c.fim, 0.32, el, "#fff3b0");
  const td = B("distancia", 0.35);
  tl.set(dist, { opacity: 1 }, td);
  desenhar($("path", dist), td, 0.7);
  pop($("g", dist), td + 0.2);
  const tt = B("transformador", 0.55);
  tl.to(dist, { opacity: 0, duration: 0.3 }, tt - 0.3);
  callAnim(callT, tt);
  tl.fromTo($(".trafo", el), { fill: "#5f6a8c" }, { fill: C.verde, duration: 0.25, yoyo: true, repeat: 3, immediateRender: false }, tt);
  tl.set($(".janT", el), { attr: { fill: "#ffe066" } }, tt + 0.6);
  // câmera entra pela janela da casa
  const tto = B("tomada", 0.75);
  tl.to(el.querySelectorAll(":scope > *:not(.interior)"), { scale: 6, svgOrigin: "940 1310", duration: 0.7, ease: "power3.in" }, tto - 0.75);
  tl.set(interior, { opacity: 1 }, tto - 0.15);
  tl.fromTo(interior, { opacity: 0, scale: 1.3, svgOrigin: "540 900" }, { opacity: 1, scale: 1, svgOrigin: "540 900", duration: 0.5, ease: "power3.out", immediateRender: false }, tto - 0.15);
  desenhar($(".caboL", el), tto + 0.15, 0.4);
  fluxo($(".caboL", el), 4, 8, tto + 0.4, c.fim, 1.0, interior);
  acender(lamp, B("lampada", 0.92));
};

// =============== 9. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const passos = [["ALGO GIRA", C.verde, "↻"], ["O ÍMÃ GIRA NOS FIOS", C.rosa, "N"], ["OS ELÉTRONS ANDAM", C.azul, "e"], ["A LUZ ACENDE", C.amarelo, "✦"]];
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuNoite)"/>${estrelas(70, 33, 0, 1400)}
    <path class="espinha" d="M180 470 V 1230" stroke="rgba(255,255,255,0.25)" stroke-width="6" stroke-linecap="round"/>
    ${passos.map(([t, cor, ic], k) => `<g transform="translate(180 ${470 + k * 253})"><g class="passo"><circle r="70" fill="${cor}"/><circle r="70" fill="none" stroke="#fff" stroke-opacity="0.4" stroke-width="6"/><text class="rot" y="24" text-anchor="middle" font-size="64" fill="#141a3a">${k + 1}</text><text class="rot" x="110" y="18" font-size="50" fill="#fff">${t}</text></g></g>`).join("")}`;
  const ps = $$(".passo", el);
  tl.set(ps, { opacity: 0 }, c.ini);
  desenhar($(".espinha", el), c.ini + 0.2, 1.2);
  ["passo1", "passo2", "passo3", "passo4"].forEach((b, k) => {
    const t = B(b, 0.15 + k * 0.15);
    tl.fromTo(ps[k], { x: -80, opacity: 0, scale: 0.8 }, { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)", immediateRender: false }, t);
  });
  const tcta = B("cta", 0.8);
  tl.to([...ps, $(".espinha", el)], { opacity: 0, x: -60, duration: 0.4, stagger: 0.04, ease: "power2.in" }, tcta - 0.45);
  cartaoFinal(el, tcta);
};

// =============== efeitos de luz e pós-produção sobre as cenas acima ===============
// (cada cena é desenhada normalmente e depois recebe brilho, raios, bokeh, faíscas e desfoque)
const _comEfeitos = (tipo, fx) => { const base = CENAS[tipo]; CENAS[tipo] = (el, c, B, i, f) => { base(el, c, B, i, f); fx(el, c, B, f); }; };

_comEfeitos("interruptor", (el, c, B) => {
  const tlz = B("luz", 0.25), ta = B("afasta", 0.5);
  const cone = $(".cone", el), quarto = $(".quarto", el);
  cone.insertAdjacentHTML("afterend", raiosLuz(540, 760, 12, 84, 980, 90, "raiosQ", 2));
  const rq = $(".raiosQ", el);
  tl.set(rq, { opacity: 0 }, 0);
  tl.to(rq, { opacity: 1, duration: 0.6 }, tlz);
  animarRaios(rq, tlz, ta + 1);
  brilhar($(".vidro", el), true);
  quarto.insertAdjacentHTML("beforeend", `<g class="bkQ" opacity="0"></g>`);
  bokeh($(".bkQ", el), 14, 31, [80, 560, 920, 760], tlz, ta + 1, ["#ffd23f", "#ffb36b", "#fff3c0"]);
  tl.to($(".bkQ", el), { opacity: 1, duration: 0.8 }, tlz + 0.2);
  // paisagem: morros distantes desfocados, lua e linha de energia brilhando
  const pais = $(".paisagem", el);
  desfocar($$("path", pais)[0], 1);
  brilhar([$("circle[fill='url(#lua)']", pais), $(".linhaL", el), $(".haloJan", el)]);
});

_comEfeitos("inducao", (el, c, B) => {
  el.firstElementChild.insertAdjacentHTML("afterend", raiosLuz(540, 300, 10, 64, 1000, 90, "raiosLab", 5) + `<g class="bkL"></g>`);
  animarRaios($(".raiosLab", el), c.ini, c.fim);
  bokeh($(".bkL", el), 12, 17, [0, 380, W, 700], c.ini, c.fim, ["#ffd23f", "#8fe3ff"]);
  brilhar($(".campo", el));
  const tc = B("corrente", 0.7);
  el.insertAdjacentHTML("beforeend", `<g class="faL"></g>`);
  faiscas($(".faL", el), 540, 880, 16, tc, tc + 1.6, C.ciano, 140, 8);
  // os elétrons que correm no fio ganham brilho
  $$("g", el).filter((g) => g.innerHTML.includes("eletronG") && !g.querySelector("g")).forEach((g) => brilhar(g));
});

_comEfeitos("hidreletrica", (el, c, B) => {
  const g = $("g[transform='translate(0 -230)']", el);
  desfocar($$("path", g)[0], 1);
  g.insertAdjacentHTML("beforeend", `<g class="spray"></g>`);
  const td = B("desce", 0.4);
  faiscas($(".spray", el), 760, 1400, 26, td + 0.4, c.fim, "#d6f6ff", 120, 11);
  brilhar($(".linhaH", el));
});

_comEfeitos("eolica_termica", (el, c, B) => {
  const topo = $(".topo", el), baixo = $(".baixo", el);
  topo.firstElementChild.insertAdjacentHTML("afterend", raiosLuz(1060, 60, 9, 70, 1000, 135, "raiosE", 6) + flare(1040, 90, 0.8));
  animarRaios($(".raiosE", el), c.ini, c.fim);
  const tfo = B("fogo", 0.45);
  baixo.insertAdjacentHTML("beforeend", `<g class="brasas"></g>`);
  faiscas($(".brasas", el), 540, 1290, 28, tfo + 0.3, c.fim, C.laranja, 230, 12);
  brilhar($(".chama", el), true);
});

_comEfeitos("solar", (el, c, B) => {
  const solW = $(".sol", el).parentNode;
  solW.insertAdjacentHTML("beforebegin", raiosLuz(800, 330, 18, 360, 760, 0, "raiosS", 9));
  animarRaios($(".raiosS", el), c.ini, c.fim);
  el.insertAdjacentHTML("beforeend", flare(800, 330, 1, "flareS"));
  brilhar([$(".sol", el), $(".fotons", el), $(".lupaE", el)], false);
  brilhar($(".fioS", el));
  // reflexo correndo pelas placas quando a luz bate
  $(".placa", el).insertAdjacentHTML("beforeend", `<clipPath id="clipPlaca"><rect width="536" height="232"/></clipPath><g clip-path="url(#clipPlaca)"><rect class="reflexo" x="-260" y="-20" width="90" height="280" fill="#fff" opacity="0.28" style="mix-blend-mode:screen"/></g>`);
  const tr = B("raios", 0.4);
  tl.fromTo($(".reflexo", el), { x: 0 }, { x: 900, duration: 1.4, ease: "power2.inOut", repeat: 2, repeatDelay: 1.2, immediateRender: false }, tr);
});

_comEfeitos("transmissao", (el, c, B) => {
  brilhar($(".caboT", el));
  el.firstElementChild.insertAdjacentHTML("afterend", `<g class="bkT"></g>`);
  bokeh($(".bkT", el), 14, 51, [0, 820, W, 300], c.ini, c.fim, ["#ffd23f", "#ffb36b", "#ff8aa4"]);
  const tt = B("transformador", 0.55);
  el.insertAdjacentHTML("beforeend", `<g class="faT"></g>`);
  faiscas($(".faT", el), 860, 1205, 18, tt, tt + 1.4, C.amarelo, 110, 14);
  const inter = $(".interior", el);
  inter.insertAdjacentHTML("beforeend", raiosLuz(760, 660, 11, 80, 900, 95, "raiosI", 15));
  animarRaios($(".raiosI", el), B("lampada", 0.92), c.fim);
  tl.set($(".raiosI", el), { opacity: 0 }, 0);
  tl.to($(".raiosI", el), { opacity: 1, duration: 0.5 }, B("lampada", 0.92));
  brilhar($(".interior .vidro", el), true);
});

_comEfeitos("resumo", (el, c, B) => {
  el.firstElementChild.insertAdjacentHTML("afterend", `<g class="bkR"></g>`);
  bokeh($(".bkR", el), 18, 61, [0, 300, W, 1100], c.ini, c.fim, ["#ffd23f", "#8fe3ff", "#ff5d8f"]);
  $$(".passo", el).forEach((p) => brilhar(p.querySelector("circle")));
});
