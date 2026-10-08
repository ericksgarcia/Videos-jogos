// Cenas do vídeo "Como os tsunamis viajam quase invisíveis em alto mar".
// Estilo: oceano 3D realista (Three.js, motor/oceano.js) + interface HUD e pranchas de desenho técnico.
// Cenas 3D: a camada 3D fica acima do mundo 2D, então rótulos/HUD vão na camada `f` (frente).

const _g = (x, c, w) => Math.exp(-Math.pow((x - c) / w, 2));
const projetar = (k, v) => { k.camera.updateMatrixWorld(); const p = v.clone().project(k.camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; };
// cargueiro visto de lado (desenho técnico), centro da linha d'água em 0,0, ~300 de comprimento
const cargueiroLado = () => `<g class="holo">
  <path d="M-150 -26 H 128 L 150 -44 H 162 L 140 22 H -134 Q -150 14 -152 -2 Z" ${LT.contorno}/>
  <path d="M-146 -2 H 152" ${LT.oculta}/><path d="M-140 10 H 146" ${LT.fina}/>
  ${Array.from({ length: 13 }, (_, k) => Array.from({ length: 1 + ((k * 5) % 3) }, (_, a) => `<rect x="${-96 + k * 17}" y="${-41 - a * 14}" width="15" height="13" ${LT.fina}/>`).join("")).join("")}
  <rect x="-140" y="-92" width="34" height="66" ${LT.aresta}/>${[0, 1, 2, 3].map((k) => `<path d="M-136 ${-82 + k * 14} H -110" ${LT.fina}/>`).join("")}
  <rect x="-132" y="-112" width="14" height="20" ${LT.aresta}/><path d="M-152 -92 H -94" ${LT.aresta}/>
  <path d="M140 -44 V -78 M140 -70 L 128 -60" ${LT.fina}/><circle cx="140" cy="-80" r="3"/></g>`;
const peixe = () => `<path d="M-16 0 Q -4 -9 10 0 Q -4 9 -16 0 Z M10 0 L 20 -7 V 7 Z" ${LT.aresta}/><circle cx="-8" cy="-1" r="1.6" class="cheio"/>`;

// =============== 1. gancho: o navio em alto mar (3D) com a onda invisível ===============
CENAS.altomar = (el, c, B, i, f) => {
  mostrarGancho(B("titulo", 0.85) - 0.2);
  el.innerHTML = cenarioHud({ horizonte: 900, agua: true });
  const k = camada3D({ ini: c.ini - 0.5, fim: c.fim + 0.6, fov: 36, escala: 0.5 });
  tl.set(k.canvas, { opacity: 1 }, 0);
  tl.to(k.canvas, { opacity: 0, duration: 0.45, ease: "power1.inOut" }, c.fim - 0.43);
  const oc = oceano3D(k, { sol: [0.12, 0.07, -1], mar: 0.7, direcao: 0.9 });
  const nav = new THREE.Group(), nvI = navio3D(); nvI.rotation.y = Math.PI / 2; nav.add(nvI); k.cena.add(nav);
  const ttsu = B("tsunami", 0.5);
  k.animar((t) => {
    const u = Math.min(1, Math.max(0, (t - c.ini) / (c.fim - c.ini))), sx = -30 + (t - c.ini) * 3;
    // a onda do tsunami (0,5 m, centenas de km) passa sob o navio: ele só sobe meio metro, devagar
    const lift = 0.5 * _g(t, ttsu + 2.5, 3.2);
    boiar3D(nav, oc, sx, 0, 24, 150, 2.5 - lift);
    const R = 760 - 280 * u, a = 0.5 - 0.4 * u, h = 46 - 18 * u;
    k.camera.position.set(sx + R * Math.sin(a), h, R * Math.cos(a));
    k.camera.lookAt(sx, 14, 0);
  });
  f.innerHTML = `
    <g class="alvoW"><g class="alvo">${mira(54, C.ciano)}<g transform="translate(0 -96)">${tag("CARGUEIRO · 150 m", C.ciano, 20)}</g></g></g>
    <g transform="translate(60 1020)"><g class="pOnda">${painelHud([["ONDA DETECTADA", "TSUNAMI"], ["VELOCIDADE", "0 km/h"], ["ALTURA", "0,0 m"]], C.amarelo, 430)}</g></g>
    <g class="perfil"><rect x="40" y="1196" width="1000" height="96" fill="rgba(4,10,28,0.8)" stroke="${C.ciano}" stroke-opacity="0.5" stroke-width="2"/>
      <text class="monol" x="56" y="1218" font-size="16" fill="${C.ciano}">PERFIL DA SUPERFÍCIE · ESCALA VERTICAL ×1000</text>
      <path class="perfilL" d="" fill="none" stroke="${C.ciano}" stroke-width="3"/><path d="M40 1270 H 1040" stroke="${C.ciano}" stroke-width="1" stroke-dasharray="4 6" opacity="0.5"/>
      <circle class="perfilN" r="7" fill="${C.amarelo}"/></g>
    <g transform="translate(540 760)"><g class="tTsu">${tag("TSUNAMI", C.vermelho, 64)}</g></g>
    <g transform="translate(540 760)"><g class="tProm">${tag("NO FINAL: O SINAL DA PRAIA", C.amarelo, 28)}</g></g>`;
  const alvoW = $(".alvoW", f), pTx = $$(".pOnda text", f), perfil = $(".perfilL", f), pn = $(".perfilN", f);
  const tn = B("navio", 0.12), tv = B("vel", 0.3), tna = B("nada", 0.45), tpr = B("promessa", 0.8);
  aCadaQuadro((t) => {
    if (t > c.fim + 0.6) return;
    const [x, y] = projetar(k, nav.position.clone().add(new THREE.Vector3(0, 12, 0)));
    alvoW.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    // perfil: lombada larguíssima e baixa andando; o ponto amarelo é o navio
    const xc = 40 + ((t - ttsu + 1) / 6) * 1000;
    let d = ""; for (let px = 40; px <= 1040; px += 10) d += `${px === 40 ? "M" : "L"}${px} ${(1270 - 52 * _g(px, xc, 210)).toFixed(1)} `;
    perfil.setAttribute("d", d);
    pn.setAttribute("transform", `translate(540 ${(1270 - 52 * _g(540, xc, 210)).toFixed(1)})`);
  });
  entrar($(".alvo", f), tn, "escala");
  girar($(".miraAnel", f), tn, c.fim + 0.5, 0.25);
  entrar($(".pOnda", f), tv - 0.3, "esq");
  contador(pTx[3], 0, 700, tv - 0.2, 1.0, (v) => Math.round(v) + " km/h");
  contador(pTx[5], 0, 0.5, tna - 0.3, 0.8, (v) => v.toFixed(1).replace(".", ",") + " m");
  entrar($(".tTsu", f), ttsu - 0.1, "escala");
  reflexoPassando($(".tTsu", f), "TSUNAMI", 64, ttsu + 0.5);
  sair($(".tTsu", f), tpr - 0.3);
  tl.set($(".perfil", f), { opacity: 0 }, 0);
  tl.to($(".perfil", f), { opacity: 1, duration: 0.4 }, ttsu - 0.3);
  entrar($(".tProm", f), tpr, "baixo");
  reflexoPassando($(".tProm", f), "NO FINAL: O SINAL DA PRAIA", 28, tpr + 0.6);
};

// =============== 2. origem: corte técnico da subducção ===============
CENAS.origem = (el, c, B) => {
  const SUP = 560;
  const ocePlaca = "M-200 1000 L 560 1040 L 1280 1380 L 1280 1480 L 520 1135 L -200 1090 Z";
  const contPlaca = "M560 1040 L 760 950 L 980 760 L 1040 560 L 1280 520 L 1280 1380 Z";
  el.innerHTML = `<g class="cam">${cenarioHud()}${gradeTecnica(-200, 300, W + 400, 1500, 0.8)}
    <g class="tremor">
    <rect x="-200" y="1060" width="${W + 400}" height="900" fill="url(#manto)"/><rect x="-200" y="1060" width="${W + 400}" height="900" fill="#1a0d1f" opacity="0.55"/>
    <path class="agua" d="" fill="#0d3a6e" fill-opacity="0.55"/>
    <g class="coluna" opacity="0"><rect x="640" y="${SUP}" width="240" height="460" fill="${C.ciano}" fill-opacity="0.1" stroke="${C.ciano}" stroke-width="2" stroke-dasharray="8 6"/>
      ${[0, 1, 2].map((q) => `<g transform="translate(${690 + q * 70} 960)"><g class="sobeA">${flechaHud(300, C.ciano, "", 0, "sbi")}</g></g>`).join("")}</g>
    <g class="corte"><path d="${ocePlaca}" fill="url(#hachura)"/><path d="${ocePlaca}" fill="none" stroke="${C.ciano}" ${LT.contorno}/>
      <g class="cont"><path d="${contPlaca}" fill="#120d22"/><path d="${contPlaca}" fill="url(#hachuraCruz)"/><path d="${contPlaca}" fill="none" stroke="${C.amarelo}" ${LT.contorno}/>
        ${[0, 1, 2, 3].map((q) => `<rect x="${1090 + q * 40}" y="${470 - (q % 2) * 30}" width="28" height="${50 + (q % 2) * 30}" fill="none" stroke="${C.amarelo}" ${LT.fina}/>`).join("")}</g>
      <path d="M560 1040 L 1280 1380" stroke="#fff" ${LT.centro}/>
      <path d="M-200 1045 L 560 1086" stroke="${C.ciano}" ${LT.oculta}/></g>
    <path class="tensao" d="M600 1060 l 20 -14 l 20 14 l 20 -14 l 20 14 l 20 -14 l 20 14 l 20 -14 l 20 14" fill="none" stroke="${C.vermelho}" stroke-width="3" opacity="0"/>
    <g transform="translate(720 1110)"><g class="hipo" opacity="0"><path d="M0 -20 L 6 -6 L 20 0 L 6 6 L 0 20 L -6 6 L -20 0 L -6 -6 Z" fill="${C.vermelho}"/>${[0, 1, 2, 3].map(() => `<circle class="sismo" r="20" fill="none" stroke="${C.vermelho}" stroke-width="3"/>`).join("")}</g></g>
    <path class="sup" d="" fill="none" stroke="#8fe3ff" stroke-width="4"/>
    <g transform="translate(330 1060)"><g class="fP1">${flechaHud(150, C.ciano, "", 90, "fp1")}</g></g>
    <g transform="translate(1000 1000)"><g class="fP2">${flechaHud(110, C.amarelo, "", -90, "fp2")}</g></g>
    <g class="cotaCol" opacity="0">${cota(600, SUP, 600, 1040, "4.000 m", C.ciano)}</g>
    ${chamada("1", 240, 1050, 300, 1240, "PLACA OCEÂNICA", C.ciano, "ch1")}
    ${chamada("2", 880, 880, 720, 760, "PLACA CONTINENTAL", C.amarelo, "ch2")}
    ${chamada("3", 660, 1090, 520, 1280, "FALHA", "#ffffff", "ch3")}</g></g>
    ${blocoTitulo(710, 330, "FIG. 02", "SUBDUCÇÃO", "SEM ESCALA")}
    <g transform="translate(540 440)"><g class="tCol">${tag("COLUNA DE ÁGUA SOBE", C.ciano, 30)}</g></g>
    <g transform="translate(540 440)"><g class="tEst">${tag("UMA ONDA ESTRANHA…", C.amarelo, 30)}</g></g>`;
  const tf = B("fundo", 0.15), tp = B("placas", 0.3), te = B("escorrega", 0.45), ts = B("sobe", 0.6), tq = B("coluna", 0.75), tx = B("estranha", 0.92);
  varredura($(".corte", el), -200, 400, 1480, 1200, c.ini + 0.1, 1.3);
  animChamada($(".ch1", el), tf + 0.2); animChamada($(".ch2", el), tf + 0.6);
  // placas se empurrando: setas e tensão acumulando
  [".fP1", ".fP2"].forEach((s) => tl.set($(s, el), { opacity: 0 }, 0));
  tl.set($(".fP1", el), { opacity: 1 }, tp); animFlechaHud($(".fp1", el), tp);
  tl.set($(".fP2", el), { opacity: 1 }, tp + 0.2); animFlechaHud($(".fp2", el), tp + 0.2);
  tl.set($(".tensao", el), { opacity: 1 }, tp + 0.4); desenhar($(".tensao", el), tp + 0.4, te - tp - 0.5);
  // escorrega: a ponta da placa salta, tremor e ondas sísmicas
  tl.to($(".tensao", el), { opacity: 0, duration: 0.15 }, te);
  tl.to([$(".fP1", el), $(".fP2", el)], { opacity: 0, duration: 0.3 }, te);
  tl.to($(".cont", el), { rotation: -1.6, svgOrigin: "1280 1380", duration: 0.35, ease: "back.out(3)" }, te);
  tl.fromTo($(".tremor", el), { x: 0, y: 0 }, { x: 7, y: -5, duration: 0.05, yoyo: true, repeat: 13, ease: "none", immediateRender: false }, te);
  tl.set($(".hipo", el), { opacity: 1 }, te);
  $$(".sismo", el).forEach((s, q) => tl.fromTo(s, { attr: { r: 20 }, opacity: 1 }, { attr: { r: 520 }, opacity: 0, duration: 1.6, ease: "power2.out", immediateRender: false }, te + q * 0.25));
  animChamada($(".ch3", el), te + 0.4);
  // a água sobe (função pura do tempo: lombada que depois se divide em duas)
  const sup = $(".sup", el), agua = $(".agua", el);
  aCadaQuadro((t) => {
    if (t > c.fim + 0.6) return;
    const A = 46 * Math.min(1, Math.max(0, (t - ts + 0.2) / 0.8)), sep = Math.max(0, t - tx + 0.3) * 160;
    let d = "";
    for (let x = -200; x <= 1280; x += 10) d += `${x === -200 ? "M" : "L"}${x} ${(SUP - A * (sep > 0 ? 0.6 * (_g(x, 760 - sep, 150) + _g(x, 760 + sep, 150)) : _g(x, 760, 170))).toFixed(1)} `;
    sup.setAttribute("d", d);
    agua.setAttribute("d", d + `L 1280 1500 L -200 1500 Z`);
  });
  tl.set($(".coluna", el), { opacity: 1 }, ts - 0.1);
  $$(".sobeA", el).forEach((g, q) => { tl.set(g, { opacity: 0 }, 0); tl.set(g, { opacity: 1 }, ts + q * 0.1); animFlechaHud($(".sbi", g), ts + q * 0.1); });
  entrar($(".tCol", el), ts + 0.1, "baixo");
  tl.set($(".cotaCol", el), { opacity: 1 }, tq - 0.1); desenhar($(".cotaCol .cotaL", el), tq - 0.1, 0.6);
  sair($(".tCol", el), tx - 0.4, "baixo");
  tl.to($(".coluna", el), { opacity: 0, duration: 0.4 }, tx - 0.3);
  entrar($(".tEst", el), tx, "escala");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.02, 540, 900], [tf - 0.2, 1.02, 540, 900], [tf + 0.6, 1.08, 600, 980], [ts - 0.3, 1.08, 600, 980], [ts + 0.5, 1.0, 560, 880], [c.fim + 0.5, 1.05, 600, 860]], c.fim);
};

// =============== 3. formato: onda de praia × tsunami (perfis técnicos) ===============
CENAS.formato = (el, c, B) => {
  const Y1 = 560, Y2 = 1060;
  el.innerHTML = `<g class="cam">${cenarioHud()}${gradeTecnica(-200, 300, W + 400, 1500, 0.8)}
    <g class="praia"><rect x="60" y="360" width="960" height="300" fill="rgba(4,10,28,0.6)" stroke="${C.ciano}" stroke-opacity="0.4" stroke-width="1.5"/>
      <text class="mono" x="80" y="392" font-size="20" fill="${C.ciano}">A · ONDA DE PRAIA</text>
      <g class="holo"><path d="M80 ${Y1} H 300 C 350 ${Y1}, 380 ${Y1 - 110}, 420 ${Y1 - 120} C 470 ${Y1 - 126}, 470 ${Y1 - 70}, 440 ${Y1 - 60} C 470 ${Y1 - 40}, 500 ${Y1}, 560 ${Y1} H 1000" ${LT.contorno}/>
        <path d="M80 ${Y1 + 40} L 1000 ${Y1 - 20}" ${LT.oculta}/></g>
      ${cota(330, Y1 + 70, 520, Y1 + 70, "10 m", C.amarelo)}</g>
    <g class="tsuP"><text class="mono" x="80" y="740" font-size="20" fill="${C.ciano}">B · TSUNAMI EM ALTO MAR</text>
      <path class="tsuBase" d="M-200 ${Y2} H 1280" stroke="${C.ciano}" ${LT.centro}/>
      <path class="tsuL" d="" fill="none" stroke="${C.ciano}" stroke-width="3.4"/><path class="tsuF" d="" fill="${C.ciano}" fill-opacity="0.08"/>
      <g class="cotaC">${cota(40, Y2 + 120, 1040, Y2 + 120, "≈ 200 km", C.amarelo)}</g>
      <g class="cotaA"><path d="M900 ${Y2} V ${Y2 - 60}" stroke="${C.vermelho}" stroke-width="2.5"/><text class="mono" x="916" y="${Y2 - 24}" font-size="22" fill="${C.vermelho}">&lt; 1 m</text></g>
      <text class="monol" x="1040" y="${Y2 + 170}" font-size="16" fill="${C.ciano}" text-anchor="end" opacity="0.7">ESCALA VERTICAL EXAGERADA ×10.000</text>
      <g transform="translate(540 ${Y2})"><g class="navW"><g class="navS" transform="scale(0.8)">${cargueiroLado()}</g></g></g></g></g>
    <g transform="translate(700 860)"><g class="pAlt">${painelHud([["NAVIO", "SUBINDO"], ["ALTURA", "+0,0 m"], ["TEMPO", "≈ 10 min"]], C.verde, 320)}</g></g>
    <g transform="translate(540 470)"><g class="tPal">${tag("COMENTA SEU PALPITE", C.rosa, 40)}</g></g>
    <g transform="translate(540 600)"><g class="pPal">${hexPergunta(70)}</g></g>`;
  const tp = B("praia", 0.1), tc = B("comp", 0.3), ta = B("altura", 0.45), tr = B("rampa", 0.6), tn = B("navio2", 0.75), tpp = B("palpite", 0.92);
  varredura($(".praia", el), 40, 340, 1000, 340, c.ini + 0.05, 0.9);
  tl.set([$(".tsuP", el), $(".cotaC", el), $(".cotaA", el)], { opacity: 0 }, 0);
  tl.to($(".tsuP", el), { opacity: 1, duration: 0.4 }, tc - 0.4);
  tl.set($(".cotaC", el), { opacity: 1 }, tc); desenhar($(".cotaC .cotaL", el), tc, 0.9);
  tl.set($(".cotaA", el), { opacity: 1 }, ta);
  const L = $(".tsuL", el), F = $(".tsuF", el), nav = $(".navW", el), alt = $$(".pAlt text", el)[3];
  // a lombada (exagerada) passa sob o navio a partir da "rampa"
  aCadaQuadro((t) => {
    if (t > c.fim + 0.6) return;
    const xc = t < tr - 0.5 ? 1500 : 1500 - (t - tr + 0.5) * 230;
    const yv = (x) => Y2 - 60 * _g(x, xc, 330);
    let d = ""; for (let x = -200; x <= 1280; x += 12) d += `${x === -200 ? "M" : "L"}${x} ${yv(x).toFixed(1)} `;
    L.setAttribute("d", d); F.setAttribute("d", d + `L 1280 ${Y2} L -200 ${Y2} Z`);
    const h = 60 * _g(540, xc, 330), sl = (yv(560) - yv(520)) / 40;
    nav.setAttribute("transform", `translate(0 ${(-h).toFixed(1)}) rotate(${(Math.atan(sl) * 57.3).toFixed(2)})`);
    alt.textContent = "+" + (h / 60 * 0.6).toFixed(1).replace(".", ",") + " m";
  });
  entrar($(".pAlt", el), tn - 0.3, "dir");
  sair($(".praia", el), tpp - 0.5);
  sair($(".pAlt", el), tpp - 0.4, "dir");
  entrar($(".tPal", el), tpp, "mola");
  reflexoPassando($(".tPal", el), "COMENTA SEU PALPITE", 40, tpp + 0.5);
  entrar($(".pPal", el), tpp + 0.2, "escala");
  tl.fromTo($(".pPal", el), { rotation: -6 }, { rotation: 6, duration: 0.5, yoyo: true, repeat: 5, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tpp + 0.8);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.02, 540, 900], [tc - 0.4, 1.02, 540, 900], [tc + 0.5, 1.05, 540, 980], [tn + 1.5, 1.05, 540, 980], [c.fim + 0.5, 1.0, 540, 900]], c.fim);
};

// =============== 4. velocidade: o Oceano Índico em 2004 (mapa HUD) ===============
CENAS.velocidade = (el, c, B) => {
  // contornos reais (longitude, latitude) projetados no quadro: lon 30..110 E, lat 30 N..15 S
  const pj = ([lo, la]) => [((lo - 30) / 80 * 1280 - 100).toFixed(1), ((30 - la) / 45 * 1100 + 300).toFixed(1)];
  const forma = (pts) => "M" + pts.map((p) => pj(p).join(" ")).join(" L ") + " Z";
  const terras = [
    ["ÁFRICA", forma([[20, 32], [32, 31], [33, 28], [35, 24], [37, 20], [39, 16], [42, 12], [43.5, 11.5], [51, 12], [51, 10.5], [48, 5], [42, -1], [40, -4], [39, -7], [40, -11], [40.5, -16], [20, -16]]), [40, 2]],
    ["ARÁBIA", forma([[34, 31], [36, 26], [39, 21], [42, 16], [43, 13], [45, 13], [52, 16], [56, 18], [59, 22], [56.5, 26], [52, 24], [50, 26.5], [48, 30], [47, 31]]), [44, 22]],
    ["ÍNDIA", forma([[62, 31], [67, 25], [70, 22], [73, 19], [74, 15], [76, 10], [77.5, 8], [80, 10], [80, 13], [83, 17], [87, 21], [90, 22], [92, 22], [94, 18], [97, 16], [98, 10], [99, 7], [100.5, 6], [103.5, 1.5], [104, 2], [103, 5], [102.5, 6.5], [100.5, 13], [103, 12], [106, 10], [109, 12], [109, 16], [106, 20], [111, 21], [111, 31]]), [76, 22]],
    ["", forma([[80, 9.8], [81.8, 7.5], [81, 6], [80, 6.5], [79.8, 8]]), null],
    ["SUMATRA", forma([[95.3, 5.6], [98, 4], [100.5, 2], [104, -1], [106, -3], [106, -6], [104, -5.5], [101, -3], [98.5, 0], [97, 2], [95.3, 4.8]]), [99.5, -4]],
    ["", forma([[105.5, -6], [108, -6.5], [111, -6.5], [114.5, -7.5], [114.5, -8.7], [111, -8.3], [108, -7.8], [105.5, -7]]), null],
  ].map(([n, d, ll]) => { const p = ll ? pj(ll) : [0, 0]; return [n, d, +p[0], +p[1]]; });
  const EP = pj([95.9, 3.3]).map(Number);
  el.innerHTML = `<g class="cam">${cenarioHud()}${gradeTecnica(-200, 300, W + 400, 1500, 0.6)}
    ${Array.from({ length: 6 }, (_, q) => `<path d="M-200 ${360 + q * 200} H ${W + 200}" stroke="#4cc9f0" stroke-opacity="0.2" stroke-dasharray="3 9"/>`).join("")}
    <g class="frentes">${Array.from({ length: 7 }, () => `<circle class="frente" cx="${EP[0]}" cy="${EP[1]}" r="10" fill="none" stroke="${C.ciano}" stroke-width="3"/>`).join("")}</g>
    ${terras.map(([n, d, x, y]) => `<path d="${d}" fill="#050b1e"/><path d="${d}" fill="url(#hudPontos)"/><g class="holo"><path d="${d}" class="vazio" ${LT.aresta}/></g>${n ? `<text class="mono" x="${x}" y="${y}" font-size="22" fill="#8fe3ff" opacity="0.8">${n}</text>` : ""}`).join("")}
    <text class="monol" x="430" y="1100" font-size="20" fill="#8fe3ff" opacity="0.6" letter-spacing="6">OCEANO ÍNDICO</text>
    <g transform="translate(${EP[0]} ${EP[1]})"><g class="epi" opacity="0"><path d="M0 -24 L 7 -7 L 24 0 L 7 7 L 0 24 L -7 7 L -24 0 L -7 -7 Z" fill="${C.vermelho}"/><circle r="34" fill="none" stroke="${C.vermelho}" stroke-width="2"/></g></g>
    <path class="rota" d="M${EP[0]} ${EP[1]} C 700 900, 450 1000, ${pj([42, -1]).join(" ")}" fill="none" stroke="${C.amarelo}" stroke-width="2.5" stroke-dasharray="10 8" opacity="0"/>
    <g class="aviao" opacity="0"><g class="holo-am"><path d="M24 0 L 6 -4 L -6 -20 L -12 -20 L -4 -4 L -18 -3 L -24 -10 L -28 -10 L -24 0 L -28 10 L -24 10 L -18 3 L -4 4 L -12 20 L -6 20 L 6 4 Z" class="cheio"/></g></g></g>
    <g transform="translate(60 360)"><g class="pForm">${painelHud([["VELOCIDADE", "v = √(g·h)"], ["PROFUNDIDADE h", "4.000 m"]], C.ciano, 420)}</g></g>
    <g transform="translate(60 1140)"><g class="pVel">${painelHud([["VELOCIDADE", "0 km/h"]], C.amarelo, 360)}</g></g>
    <g transform="translate(700 1140)"><g class="pRel">${painelHud([["TEMPO", "0 h"]], C.verde, 300)}</g></g>
    <g transform="translate(760 560)"><g class="t2004">${tag("2004", C.vermelho, 56, "SUMATRA · M 9,1")}</g></g>`;
  const tpf = B("prof", 0.1), tv = B("vel2", 0.3), tav = B("aviao", 0.45), ti = B("indo", 0.6), taf = B("africa", 0.8), th = B("horas", 0.92);
  entrar($(".pForm", el), tpf - 0.1, "esq");
  reflexoPassando($(".pForm", el), "", 0, tpf + 0.5);
  entrar($(".pVel", el), tv - 0.3, "baixo");
  contador($$(".pVel text", el)[1], 0, 700, tv - 0.2, 1.0, (v) => Math.round(v) + " km/h");
  // avião ao lado da frente de onda, mesma rota
  tl.set($(".rota", el), { opacity: 0.8 }, tav - 0.2); desenhar($(".rota", el), tav - 0.2, 0.8);
  tl.set($(".aviao", el), { opacity: 1 }, tav);
  tl.fromTo($(".aviao", el), { motionPath: { path: $(".rota", el), align: $(".rota", el), alignOrigin: [0.5, 0.5], autoRotate: 180, start: 0, end: 0 } },
    { motionPath: { path: $(".rota", el), align: $(".rota", el), alignOrigin: [0.5, 0.5], autoRotate: 180, start: 0, end: 1 }, duration: Math.max(1, th + 0.6 - tav), ease: "none", immediateRender: false }, tav);
  // 2004: epicentro e frentes de onda até a África (relógio 0 → 7 h)
  tl.set($(".epi", el), { opacity: 1 }, ti - 0.2);
  tl.fromTo($(".epi", el), { scale: 3 }, { scale: 1, transformOrigin: "50% 50%", duration: 0.5, ease: "expo.out", immediateRender: false }, ti - 0.2);
  entrar($(".t2004", el), ti - 0.1, "escala");
  const fr = $$(".frente", el), dur = Math.max(1.5, th + 0.8 - ti);
  fr.forEach((r, q) => tl.fromTo(r, { attr: { r: 10 }, opacity: 0.9 }, { attr: { r: 760 }, opacity: 0.15, duration: dur, ease: "none", immediateRender: false }, ti + q * (dur / 9)));
  entrar($(".pRel", el), ti, "dir");
  contador($$(".pRel text", el)[1], 0, 7, ti, dur, (v) => Math.round(v) + " h");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.02, 540, 880], [ti - 0.4, 1.02, 540, 880], [ti + 0.4, 1.1, 700, 820], [taf - 0.3, 1.1, 700, 820], [taf + 0.6, 1.0, 520, 880], [c.fim + 0.5, 1.02, 520, 880]], c.fim);
};

// ---------- costa em corte (cenas 5 e 6): fundo do mar subindo até a praia ----------
const SUP5 = 760;
const fundoY = (x) => (x < 260 ? 1300 : x < 900 ? 1300 - (x - 260) * (430 / 640) : 870 - (x - 900) * 0.62);
const costaSVG = () => {
  let fundo = "M-200 1300 ";
  for (let x = -200; x <= 1280; x += 20) fundo += `L ${x} ${fundoY(x).toFixed(1)} `;
  const cidade = [[1010, 70], [1050, 110], [1100, 80], [1150, 150], [1205, 100], [1250, 130]].map(([x, h], q) => { const y = fundoY(x + 20);
    return `<rect x="${x}" y="${(y - h).toFixed(0)}" width="36" height="${h}" class="vazio" ${LT.aresta}/>${Array.from({ length: Math.floor(h / 18) }, (_, r) => `<path d="M${x + 6} ${(y - h + 10 + r * 18).toFixed(0)} h 24" ${LT.fina}/>`).join("")}`; }).join("");
  return `<path d="${fundo} L 1280 1700 L -200 1700 Z" fill="#0b0f22"/><path d="${fundo} L 1280 1700 L -200 1700 Z" fill="url(#sedimento)"/>
    <path d="${fundo}" fill="none" stroke="${C.amarelo}" ${LT.contorno}/><g class="holo-am">${cidade}</g>`;
};
// pulso do tsunami: posição pela velocidade real (v ∝ √profundidade), altura crescendo ao ficar raso
function pulsoCosta(t0, t1) {
  const prof = (x) => Math.max(6, fundoY(x) - SUP5), xs = [-150], dt = 1 / 60;
  let x = -150; for (let s = 0; s < 6000 && x < 1045; s++) { x += 0.9 * Math.sqrt(prof(x)) * dt * 3.2 + 0.02; xs.push(x); }
  const n = xs.length, esc = (t1 - t0) * 60 / n;
  return (t) => { const i = Math.min(n - 1, Math.max(0, Math.round((t - t0) * 60 / esc))); return xs[i]; };
}

// =============== 5. chegada: o mar raso freia a frente e a onda cresce ===============
CENAS.chegada = (el, c, B) => {
  el.innerHTML = `<g class="cam">${cenarioHud()}${gradeTecnica(-200, 300, W + 400, 1500, 0.6)}
    <path class="agua5" d="" fill="#0d3a6e" fill-opacity="0.6"/>${costaSVG()}
    <path class="sup5" d="" fill="none" stroke="#8fe3ff" stroke-width="4"/>
    <g class="cotaRaso" opacity="0">${cota(780, SUP5, 780, fundoY(780), "RASO", C.amarelo)}</g>
    <g class="leit"><g class="leitI">${painelHud([["VELOCIDADE", "0 km/h"], ["ALTURA", "0,0 m"]], C.ciano, 300)}</g></g>
    <g class="empA" opacity="0">${[0, 1, 2].map((q) => `<g transform="translate(0 ${q * 34})"><path class="empL" d="M-150 0 H -30" stroke="${C.amarelo}" stroke-width="4" marker-end=""/><path d="M-30 0 l -16 -10 v 20 z" fill="${C.amarelo}"/></g>`).join("")}</g></g>
    ${blocoTitulo(710, 330, "FIG. 05", "EMPINAMENTO", "ESC. VERT. ×200")}
    <g transform="translate(540 480)"><g class="tProb">${tag("MAS AÍ VEM O PROBLEMA", C.vermelho, 32)}</g></g>
    <g transform="translate(330 480)"><g class="tFreia">${tag("A FRENTE FREIA", C.amarelo, 30)}</g></g>
    <g transform="translate(330 480)"><g class="tEmp">${tag("A ÁGUA SE EMPILHA", C.ciano, 30)}</g></g>
    <g transform="translate(330 480)"><g class="tPar">${tag("PAREDE DE ATÉ 30 m", C.vermelho, 34)}</g></g>`;
  const tpb = B("prob", 0.1), tr = B("raso", 0.25), tf = B("freia", 0.4), te = B("empilha", 0.6), tpa = B("parede", 0.8), t30 = B("trinta", 0.9);
  const xp = pulsoCosta(tpb, t30 + 0.1), sup = $(".sup5", el), agua = $(".agua5", el), leit = $(".leit", el), lt = $$(".leit text", el), emp = $(".empA", el);
  aCadaQuadro((t) => {
    if (t < c.ini - 1 || t > c.fim + 0.6) return;
    const p = xp(t), D = Math.max(4, (fundoY(p) - SUP5) / 540 * 4000), w = Math.max(28, 220 * Math.sqrt(Math.max(6, fundoY(p) - SUP5) / 540));
    const dpx = Math.max(6, fundoY(p) - SUP5), A = Math.min(310, 18 * Math.pow(540 / dpx, 1.15)), atras = w * 1.6;
    const yv = (x) => SUP5 - A * (x < p ? _g(x, p, atras) : _g(x, p, w * 0.55));
    let d = ""; for (let x = -200; x <= 1280; x += 8) { const y = Math.min(yv(x), fundoY(x)); d += `${x === -200 ? "M" : "L"}${x} ${y.toFixed(1)} `; }
    sup.setAttribute("d", d); agua.setAttribute("d", d + "L 1280 1700 L -200 1700 Z");
    leit.setAttribute("transform", `translate(${Math.min(760, Math.max(40, p - 150)).toFixed(0)} ${Math.max(560, SUP5 - A - 150).toFixed(0)})`);
    lt[1].textContent = Math.round(Math.sqrt(9.81 * D) * 3.6) + " km/h";
    lt[3].textContent = Math.min(30, 0.6 * Math.pow(540 / dpx, 1.35)).toFixed(1).replace(".", ",") + " m";
    emp.setAttribute("transform", `translate(${(p - 60).toFixed(0)} ${(SUP5 - A * 0.5).toFixed(0)})`);
  });
  entrar($(".tProb", el), tpb - 0.1, "cima");
  entrar(leit.firstElementChild, tpb + 0.3, "escala");
  sair($(".tProb", el), tr - 0.3, "cima");
  tl.set($(".cotaRaso", el), { opacity: 1 }, tr); desenhar($(".cotaRaso .cotaL", el), tr, 0.5);
  entrar($(".tFreia", el), tf, "esq"); sair($(".tFreia", el), te - 0.3, "esq");
  tl.set(emp, { opacity: 1 }, te); desenhar($$(".empL", el), te, 0.4);
  entrar($(".tEmp", el), te, "dir"); sair($(".tEmp", el), tpa - 0.3, "dir");
  tl.to(emp, { opacity: 0, duration: 0.3 }, tpa);
  entrar($(".tPar", el), tpa, "escala");
  reflexoPassando($(".tPar", el), "PAREDE DE ATÉ 30 m", 34, t30);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.02, 540, 940], [tr - 0.3, 1.02, 540, 940], [tf + 0.5, 1.12, 700, 900], [tpa, 1.18, 800, 840], [c.fim + 0.5, 1.22, 820, 820]], c.fim);
};

// =============== 6. o sinal: o mar recua antes da onda ===============
CENAS.sinal = (el, c, B) => {
  el.innerHTML = `<g class="cam">${cenarioHud()}${gradeTecnica(-200, 300, W + 400, 1500, 0.6)}
    <path class="agua6" d="" fill="#0d3a6e" fill-opacity="0.6"/>${costaSVG()}
    <path class="sup6" d="" fill="none" stroke="#8fe3ff" stroke-width="4"/>
    <g class="peixes" opacity="0">${[[760, 0], [820, 1], [690, 2], [870, 3]].map(([x, q]) => `<g transform="translate(${x} ${(fundoY(x) - 10).toFixed(0)})"><g class="px holo-am">${peixe()}</g></g>`).join("")}</g>
    <g class="rotulosV" opacity="0"><g transform="translate(560 ${SUP5 + 120})">${tag("VALE", C.ciano, 22)}</g><g transform="translate(140 ${SUP5 - 150})">${tag("CRISTA", C.vermelho, 22)}</g></g>
    <path class="fuga" d="M960 ${fundoY(960) - 20} C 1040 700, 1080 640, 1180 ${fundoY(1180) - 40}" fill="none" stroke="${C.vermelho}" stroke-width="5" stroke-dasharray="14 10" opacity="0"/>
    <path class="fugaP" d="M1180 ${fundoY(1180) - 40} l -26 6 l 12 22 z" fill="${C.vermelho}" opacity="0"/></g>
    <g transform="translate(540 470)"><g class="tProm">${tag("O SINAL QUE EU PROMETI", C.amarelo, 32)}</g></g>
    <g transform="translate(540 470)"><g class="tRec">${tag("O MAR RECUA", C.ciano, 40, "CENTENAS DE METROS")}</g></g>
    <g transform="translate(540 470)"><g class="tCorra">${tag("CORRA PARA O ALTO", C.vermelho, 44)}</g></g>
    <g transform="translate(700 1150)"><g class="pTempo">${painelHud([["TEMPO ATÉ A ONDA", "05:00"]], C.vermelho, 340)}</g></g>`;
  const tpm = B("prometi", 0.1), trc = B("recua", 0.25), ts = B("seco", 0.45), tv = B("vale", 0.6), tc = B("corra", 0.8), tm = B("minutos", 0.92);
  const sup = $(".sup6", el), agua = $(".agua6", el);
  aCadaQuadro((t) => {
    if (t < c.ini - 1 || t > c.fim + 0.6) return;
    // o nível perto da costa baixa (recuo) e a crista aparece longe, à esquerda
    const r = Math.min(1, Math.max(0, (t - trc + 0.2) / 1.6)), cr = Math.min(1, Math.max(0, (t - tv + 0.3) / 1.2));
    const yv = (x) => SUP5 + r * 110 * _g(x, 820, 380) - cr * 150 * _g(x, 120 + (t - tv) * 25, 160);
    let d = ""; for (let x = -200; x <= 1280; x += 8) { const y = Math.min(yv(x), fundoY(x)); d += `${x === -200 ? "M" : "L"}${x} ${y.toFixed(1)} `; }
    sup.setAttribute("d", d); agua.setAttribute("d", d + "L 1280 1700 L -200 1700 Z");
  });
  entrar($(".tProm", el), tpm - 0.1, "baixo"); reflexoPassando($(".tProm", el), "O SINAL QUE EU PROMETI", 32, tpm + 0.4);
  sair($(".tProm", el), trc - 0.3, "baixo");
  entrar($(".tRec", el), trc, "escala");
  tl.set($(".peixes", el), { opacity: 1 }, ts - 0.2);
  $$(".px", el).forEach((p, q) => { entrar(p, ts - 0.2 + q * 0.12, "mola"); tl.fromTo(p, { rotation: -15 }, { rotation: 15, duration: 0.22, yoyo: true, repeat: 9, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, ts + q * 0.1); });
  sair($(".tRec", el), tv - 0.3);
  tl.set($(".rotulosV", el), { opacity: 1 }, tv);
  sair($(".rotulosV", el), tc - 0.3);
  entrar($(".tCorra", el), tc, "escala");
  tl.fromTo($(".tCorra", el), { opacity: 1 }, { opacity: 0.35, duration: 0.18, yoyo: true, repeat: 9, ease: "none", immediateRender: false }, tc + 0.6);
  tl.set([$(".fuga", el), $(".fugaP", el)], { opacity: 1 }, tc); desenhar($(".fuga", el), tc, 0.8);
  entrar($(".pTempo", el), tm - 0.5, "dir");
  const tTxt = $$(".pTempo text", el)[1];
  aCadaQuadro((t) => { if (t < tm - 0.6 || t > c.fim + 0.6) return; const s = Math.max(0, 300 - Math.max(0, t - tm + 0.5) * 6); tTxt.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`; });
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.4, 820, 820], [trc - 0.2, 1.4, 820, 820], [trc + 0.8, 1.3, 760, 860], [tv - 0.3, 1.3, 760, 860], [tv + 0.5, 1.02, 540, 880], [tc - 0.2, 1.02, 540, 880], [tc + 0.6, 1.25, 960, 760], [c.fim + 0.5, 1.28, 980, 750]], c.fim);
};

// =============== 7. alerta: sensor no fundo → boia → satélite → costa ===============
CENAS.alerta = (el, c, B) => {
  const SUP = 640, FUN = 1250, SX = 380;
  const boia = `<g class="holo"><path d="M-60 0 Q 0 30 60 0 L 50 -18 H -50 Z" class="cheio" ${LT.contorno}/><rect x="-8" y="-120" width="16" height="102" ${LT.aresta}/>
    <path d="M-40 -60 L 40 -60 M-30 -90 L 30 -90 M0 -120 V -160" ${LT.aresta}/><rect x="-46" y="-78" width="34" height="18" class="cheio" ${LT.fina}/><rect x="12" y="-78" width="34" height="18" class="cheio" ${LT.fina}/>
    <circle cx="0" cy="-166" r="6" class="cheio"/><path d="M-60 0 V 30 M60 0 V 30" ${LT.oculta}/></g>`;
  const sat = `<g class="holo"><rect x="-34" y="-26" width="68" height="52" class="cheio" ${LT.contorno}/>
    ${[-1, 1].map((s) => `<g transform="translate(${s * 120} 0)"><rect x="-76" y="-30" width="152" height="60" ${LT.aresta}/>${Array.from({ length: 7 }, (_, q) => `<path d="M${-76 + q * 22} -30 V 30" ${LT.fina}/>`).join("")}<path d="M-76 0 H 76" ${LT.fina}/></g>`).join("")}
    <path d="M-44 0 H -34 M34 0 H 44" ${LT.aresta}/><path d="M-14 26 Q 0 56 14 26" class="cheio" ${LT.aresta}/></g>`;
  const sensor = `<g class="holo-am"><rect x="-34" y="-50" width="68" height="44" rx="8" class="cheio" ${LT.contorno}/><path d="M-50 -6 H 50 L 40 8 H -40 Z" ${LT.aresta}/>
    <circle cx="0" cy="-28" r="9" ${LT.aresta}/><path d="M0 -50 V -70" ${LT.aresta}/></g>`;
  const torre = `<g class="holo-vd"><path d="M-30 0 L -8 -190 H 8 L 30 0 Z" ${LT.contorno}/><path d="M-24 -40 L 20 -80 M20 -40 L -20 -80 M-16 -100 L 14 -140 M14 -100 L -14 -140" ${LT.fina}/>
    <rect x="-22" y="-224" width="44" height="34" class="cheio" ${LT.aresta}/><path d="M30 -220 q 30 -10 40 -40" ${LT.aresta}/></g>`;
  el.innerHTML = `<g class="cam">${cenarioHud({ horizonte: SUP, agua: true })}
    <path d="M-200 ${FUN} C 300 ${FUN - 20}, 700 ${FUN + 10}, 860 ${FUN - 40} L 940 ${SUP + 30} L 1280 ${SUP - 10} L 1280 1800 L -200 1800 Z" fill="#0b0f22"/>
    <path d="M-200 ${FUN} C 300 ${FUN - 20}, 700 ${FUN + 10}, 860 ${FUN - 40} L 940 ${SUP + 30} L 1280 ${SUP - 10} L 1280 1800 L -200 1800 Z" fill="url(#sedimento)"/>
    <path d="M-200 ${FUN} C 300 ${FUN - 20}, 700 ${FUN + 10}, 860 ${FUN - 40} L 940 ${SUP + 30} L 1280 ${SUP - 10}" fill="none" stroke="${C.amarelo}" ${LT.contorno}/>
    <path d="M${SX + 70} ${SUP + 30} L ${SX + 140} ${FUN - 20}" stroke="#8fe3ff" ${LT.oculta}/><rect x="${SX + 124}" y="${FUN - 26}" width="32" height="16" fill="none" stroke="#8fe3ff" stroke-width="2"/>
    <g class="ondasAc">${[0, 1, 2, 3].map(() => `<path class="ac" d="M${SX - 70} 0 Q ${SX} -40 ${SX + 70} 0" fill="none" stroke="${C.amarelo}" stroke-width="3" opacity="0"/>`).join("")}</g>
    <path class="feixe1" d="M${SX} ${SUP - 170} L 700 420" stroke="${C.ciano}" stroke-width="3" stroke-dasharray="10 8" opacity="0"/>
    <path class="feixe2" d="M700 420 L 990 ${SUP - 240}" stroke="${C.vermelho}" stroke-width="3" stroke-dasharray="10 8" opacity="0"/>
    <g transform="translate(${SX} ${FUN - 4})"><g class="sensor">${sensor}</g></g>
    <g transform="translate(${SX} ${SUP})"><g class="boia"><g class="boiaB">${boia}</g></g></g>
    <g transform="translate(700 420)"><g class="sat">${sat}</g></g>
    <g transform="translate(990 ${SUP - 10})"><g class="torre">${torre}<circle class="sirene" cx="0" cy="-207" r="40" fill="${C.vermelho}" opacity="0"/></g></g>
    ${chamada("1", SX + 34, FUN - 30, 520, FUN - 150, "SENSOR DE PRESSÃO", C.amarelo, "c1")}
    ${chamada("2", SX + 60, SUP - 20, 480, SUP + 110, "BOIA", C.ciano, "c2")}
    ${chamada("3", 760, 400, 800, 330, "SATÉLITE", C.ciano, "c3")}
    ${chamada("4", 980, SUP - 120, 860, SUP + 180, "ALERTA NA COSTA", C.verde, "c4")}</g>
    <g transform="translate(640 820)"><g class="pPress">${painelHud([["PRESSÃO NO FUNDO", "NORMAL"], ["NÍVEL DO MAR", "+0 cm"]], C.amarelo, 380)}</g></g>
    <g transform="translate(540 1120)"><g class="tAlerta">${tag("ALERTA DE TSUNAMI", C.vermelho, 40)}</g></g>`;
  const tvg = B("vigia", 0.1), tse = B("sensor", 0.25), tcm = B("cm", 0.4), tb = B("boia", 0.55), tsat = B("sat", 0.7), tco = B("costa", 0.85);
  boiar($(".boiaB", el), c.ini, c.fim, 6);
  [".sensor", ".boia", ".sat", ".torre"].forEach((s, q) => entrar($(s, el), [tse - 0.1, tb - 0.4, tsat - 0.4, tco - 0.4][q], ["baixo", "cima", "escala", "dir"][q]));
  animChamada($(".c1", el), tse + 0.2);
  entrar($(".pPress", el), tcm - 0.5, "esq");
  const pt = $$(".pPress text", el);
  contador(pt[3], 0, 3, tcm - 0.3, 0.8, (v) => "+" + Math.round(v) + " cm");
  aCadaQuadro((t) => { if (t > c.fim + 0.6) return; pt[1].textContent = t > tcm - 0.3 ? "ANOMALIA" : "NORMAL"; pt[1].setAttribute("fill", t > tcm - 0.3 ? C.vermelho : "#fff"); });
  // ondas acústicas subindo do sensor até a boia
  $$(".ac", el).forEach((a, q) => tl.fromTo(a, { y: FUN - 60, opacity: 0.9 }, { y: SUP + 40, opacity: 0.1, duration: 1.0, repeat: 2, ease: "none", immediateRender: false }, tb + q * 0.25));
  animChamada($(".c2", el), tb + 0.2);
  tl.set($(".feixe1", el), { opacity: 1 }, tsat - 0.1); desenhar($(".feixe1", el), tsat - 0.1, 0.6);
  animChamada($(".c3", el), tsat + 0.2);
  tl.set($(".feixe2", el), { opacity: 1 }, tco - 0.1); desenhar($(".feixe2", el), tco - 0.1, 0.6);
  animChamada($(".c4", el), tco + 0.3);
  tl.fromTo($(".sirene", el), { opacity: 0 }, { opacity: 0.8, duration: 0.2, yoyo: true, repeat: 9, ease: "none", immediateRender: false }, tco + 0.4);
  entrar($(".tAlerta", el), tco + 0.3, "escala");
  reflexoPassando($(".tAlerta", el), "ALERTA DE TSUNAMI", 40, tco + 0.8);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.02, 540, 900], [tse - 0.3, 1.02, 540, 900], [tse + 0.5, 1.15, 480, 1080], [tb - 0.4, 1.15, 480, 1080], [tb + 0.4, 1.08, 480, 800], [tsat - 0.3, 1.08, 480, 800], [tsat + 0.5, 1.02, 560, 700], [tco, 1.0, 560, 760], [c.fim + 0.5, 1.02, 560, 780]], c.fim);
};

// =============== 8. resumo: de volta ao navio em alto mar (3D) ===============
CENAS.resumo = (el, c, B, i, f) => {
  el.innerHTML = cenarioHud({ horizonte: 900, agua: true });
  const k = camada3D({ ini: c.ini - 0.6, fim: T + 0.5, fov: 36, escala: 0.5 });
  tl.fromTo(k.canvas, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.inOut", immediateRender: false }, c.ini - 0.45);
  const oc = oceano3D(k, { sol: [-0.3, 0.035, -1], mar: 0.65, direcao: 0.9, horizonte: [0.55, 0.32, 0.42], zenite: [0.015, 0.025, 0.08], solCor: [2.6, 1.2, 0.7], exposicao: 0.85 });
  const nav = new THREE.Group(), nvI = navio3D(); nvI.rotation.y = Math.PI / 2; nav.add(nvI); k.cena.add(nav);
  k.animar((t) => {
    const u = (t - c.ini) / (T - c.ini), sx = (t - c.ini) * 3;
    boiar3D(nav, oc, sx, 0, 24, 150, 2.5);
    const R = 620 + 160 * u, a = -0.45 + 0.55 * u;
    k.camera.position.set(sx + R * Math.sin(a), 34 + 14 * u, R * Math.cos(a));
    k.camera.lookAt(sx, 22, 0);
  });
  const passos = [["UM TERREMOTO LEVANTA O FUNDO", C.amarelo], ["NASCE LONGA E BAIXA: INVISÍVEL", C.ciano], ["CORRE QUASE COMO UM AVIÃO", C.verde], ["PERTO DA COSTA, VIRA PAREDE", C.vermelho]];
  f.innerHTML = `${passos.map(([t, cor], q) => `<g transform="translate(110 ${430 + q * 150})"><g class="passo"><rect x="-44" y="-44" width="88" height="88" fill="rgba(4,10,28,0.85)" stroke="${cor}" stroke-width="3"/>
      <path d="M-54 -26 V -54 H -26 M54 26 V 54 H 26" stroke="${cor}" stroke-width="3" fill="none"/><text class="mono" y="18" text-anchor="middle" font-size="48" fill="${cor}">0${q + 1}</text>
      <rect x="62" y="-30" width="${t.length * 20 + 40}" height="60" fill="rgba(4,10,28,0.78)"/><text class="mono" x="80" y="11" font-size="30" fill="#fff">${t}</text></g></g>`).join("")}
    <g class="alvoW"><g class="alvo">${mira(50, C.ciano)}<g transform="translate(0 -92)">${tag("NINGUÉM PERCEBE", C.ciano, 22)}</g></g></g>`;
  const ps = $$(".passo", f);
  ["passo1", "passo2", "passo3", "passo4"].forEach((b, q) => entrar(ps[q], B(b, 0.15 + q * 0.15), ["esq", "escala", "esq", "baixo"][q]));
  const tn = B("navioF", 0.75), tcta = B("cta", 0.8), alvoW = $(".alvoW", f);
  tl.to(ps, { opacity: 0, x: -60, duration: 0.3, stagger: 0.04, ease: "power2.in" }, tn - 0.5);
  aCadaQuadro((t) => { if (t < c.ini - 0.5) return; const [x, y] = projetar(k, nav.position.clone().add(new THREE.Vector3(0, 12, 0))); alvoW.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`); });
  entrar($(".alvo", f), tn, "escala");
  girar($(".miraAnel", f), tn, T, 0.25);
  sair($(".alvo", f), tcta - 0.2);
  cartaoFinal(f, tcta);
  lottieEm(f, "confete", 540, 900, 1080, 1440, { ini: tcta + 0.2, fim: T, loop: false, corte: true });
};

// =============== acabamento: brilho neon, interface e partículas ===============
const _comEfeitos = (tipo, fx) => { const base = CENAS[tipo]; CENAS[tipo] = (el, c, B, i, f) => { base(el, c, B, i, f); fx(el, c, B, f); }; };
const _canal = { altomar: "ALTO MAR // SONDA 01", origem: "FIG 02 // SUBDUCÇÃO", formato: "FIG 03 // PERFIL", velocidade: "MAPA 04 // OCEANO ÍNDICO", chegada: "FIG 05 // COSTA", sinal: "FIG 06 // RECUO", alerta: "REDE 07 // ALERTA", resumo: "" };
Object.keys(_canal).forEach((tipo) => _comEfeitos(tipo, (el, c, B, f) => {
  brilhar($$(".holo, .holo-am, .holo-vm, .holo-vd, .holo-rs, .holo-lr", el).filter((g) => !g.parentNode.closest(".holo, .holo-am, .holo-vd, .holo-lr")));
  const cam = $(".cam", el);
  if (cam) { cam.insertAdjacentHTML("beforeend", `<g class="pDados"></g>`); poeira($(".pDados", el), 22, 5 + tipo.length, [0, 380, W, 950], c.ini, c.fim, "#8fe3ff"); }
  if (_canal[tipo]) hudOverlay(["altomar", "resumo"].includes(tipo) ? f : el, c, _canal[tipo]);
}));
