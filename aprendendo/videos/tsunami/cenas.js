// Cenas do vídeo "Como os tsunamis viajam quase invisíveis em alto mar" — versão 2.
// Estilo MODERNO E CLEAN (pedido do dono): imagens geradas (motor/imagens.py, FLUX.2 klein) em tela
// cheia, cartões brancos/escuros arredondados, números grandes e diagramas de linhas brancas.
// Sem neon e sem 3D. Kit em motor/biblioteca.js ("KIT CLEAN").

const _g = (x, c, w) => Math.exp(-Math.pow((x - c) / w, 2));
const _lim = (u) => Math.min(1, Math.max(0, u));
// navio de perfil, silhueta branca limpa (~180 de largura), base em 0,0
const navioLado = (cor) => `<g fill="${cor || "#fff"}"><path d="M-90 -6 H 78 L 94 -20 H 100 L 86 10 H -82 Q -92 6 -92 -2 Z"/>
  ${Array.from({ length: 8 }, (_, k) => `<rect x="${-52 + k * 15}" y="${-20 - (k % 3) * 8}" width="13" height="${14 + (k % 3) * 8}" rx="2"/>`).join("")}
  <rect x="-84" y="-44" width="24" height="38" rx="3"/><rect x="-78" y="-56" width="8" height="12" rx="2"/></g>`;
const marcador = (txt, alt, cor) => `<path d="M0 0 V ${-alt}" stroke="#fff" stroke-width="3" filter="url(#sombraTexto)"/><circle r="10" fill="${cor || C.amarelo}" stroke="#fff" stroke-width="3"/>
  <g transform="translate(0 ${-alt - 32})">${pilula(txt, "#fff", 30)}</g>`;
const ESC = { fundo: "#0a1230", tinta: "#fff" }; // cartão escuro (para fundos claros)

// =============== 1. gancho: o navio em alto mar e a onda invisível ===============
CENAS.altomar = (el, c, B) => {
  mostrarGancho(B("titulo", 0.85) - 0.2);
  const tn = B("navio", 0.12), tv = B("vel", 0.3), tna = B("nada", 0.45), tts = B("tsunami", 0.5), tpr = B("promessa", 0.8);
  el.innerHTML = `<g class="cam">${foto("navio")}
      <path class="onda1" d="" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" filter="url(#sombraTexto)"/>
      <g transform="translate(520 1010)"><g class="mNav">${marcador("CARGUEIRO · 150 m", 110)}</g></g></g>
    ${velas()}
    <g transform="translate(300 780)"><g class="s1">${numeroGrande("n700", "0", "KM/H", 140)}</g></g>
    <g transform="translate(790 780)"><g class="s2">${numeroGrande("n05", "0,0 m", "DE ALTURA", 140)}</g></g>
    <g transform="translate(540 1300)"><g class="tTsu">${pilula("ISSO É UM TSUNAMI", C.amarelo, 40)}</g></g>
    <g transform="translate(540 1290)"><g class="tProm">${cartao("No final: o sinal da praia", { tam: 40, sub: "minutos antes da onda chegar" })}</g></g>`;
  entrar($(".mNav", el), tn - 0.4, "escala"); sair($(".mNav", el), tv - 0.4);
  entrar($(".s1", el), tv - 0.25, "baixo");
  contador($(".n700", el), 0, 700, tv - 0.2, 1.0, (v) => Math.round(v));
  entrar($(".s2", el), tna - 0.6, "baixo");
  contador($(".n05", el), 0, 0.5, tna - 0.5, 0.8, (v) => v.toFixed(1).replace(".", ",") + " m");
  sair($(".s1", el), tpr - 0.4, "cima"); sair($(".s2", el), tpr - 0.35, "cima");
  // a onda do tsunami: lombada larga e baixa passando sob o navio
  const onda = $(".onda1", el);
  tl.set(onda, { opacity: 0 }, 0); tl.to(onda, { opacity: 1, duration: 0.4 }, tts - 0.4);
  aCadaQuadro((t) => {
    if (t > c.fim + 0.6) return;
    const xc = -400 + (t - tts + 0.4) * 260;
    let d = ""; for (let x = -100; x <= 1180; x += 12) d += `${x === -100 ? "M" : "L"}${x} ${(1250 - 46 * _g(x, xc, 300)).toFixed(1)} `;
    onda.setAttribute("d", d);
  });
  entrar($(".tTsu", el), tts - 0.1, "escala"); sair($(".tTsu", el), tpr - 0.3);
  entrar($(".tProm", el), tpr, "baixo");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.3, 520, 1090], [tn - 0.3, 1.3, 520, 1090], [tv + 0.8, 1.0, 540, 980], [c.fim + 0.5, 1.05, 540, 1000]], c.fim);
};

// =============== 2. origem: o fundo do mar se mexe ===============
CENAS.origem = (el, c, B) => {
  const tf = B("fundo", 0.15), tp = B("placas", 0.3), te = B("escorrega", 0.45), ts = B("sobe", 0.6), tq = B("coluna", 0.75), tx = B("estranha", 0.92);
  el.innerHTML = `<rect x="-200" y="-200" width="1480" height="2320" fill="#e8e9ed"/>
    <g class="cam"><g class="treme">${foto("placas")}</g>
      <g transform="translate(330 690)"><g class="pFundo">${pilula("FUNDO DO MAR", C.amarelo, 26)}</g></g>
      <g class="setasP">${setaClean(110, 1120, 470, 1120, C.amarelo, 9)}${setaClean(1040, 1120, 700, 1120, C.amarelo, 9)}
        <g transform="translate(280 1060)">${pilula("PLACA", "#fff", 24)}</g><g transform="translate(860 1060)">${pilula("PLACA", "#fff", 24)}</g></g>
      <g class="setasS">${[410, 590, 770].map((x) => setaClean(x, 690, x, 560, "#fff", 7)).join("")}</g>
      <g class="colunaM">${medida(990, 700, 990, 1300, "4 km", { pil: "#fff", dx: -70 })}</g></g>
    <rect class="flash" x="-200" y="-200" width="1480" height="2320" fill="#fff" opacity="0"/>
    ${velas(0.8)}
    <g transform="translate(540 1300)"><g class="cEsc">${pilula("ESCORREGA DE REPENTE", C.rosa, 34)}</g></g>
    <g transform="translate(540 440)"><g class="cSobe">${cartao("O fundo sobe alguns metros", Object.assign({ tam: 38, sub: "e levanta toda a água de cima" }, ESC))}</g></g>
    <g transform="translate(540 440)"><g class="cCol">${cartao("Uma coluna de 4 km de água", Object.assign({ tam: 38 }, ESC))}</g></g>
    <g transform="translate(540 1290)"><g class="cEst">${cartao("Só que essa onda é estranha…", { tam: 40, cor: C.rosa })}</g></g>`;
  entrar($(".pFundo", el), tf - 0.1, "escala"); sair($(".pFundo", el), tp - 0.2);
  entrar($(".setasP", el), tp - 0.1, "escala");
  tl.fromTo($(".setasP", el), { x: 0 }, { x: 0, keyframes: [{ x: 6, duration: 0.5 }, { x: -6, duration: 0.5 }], repeat: 3, immediateRender: false }, tp + 0.5);
  sair($(".setasP", el), te + 0.2);
  // o tranco: a imagem treme e um clarão
  tl.fromTo($(".treme", el), { x: 0, y: 0 }, { keyframes: [{ x: -14, y: 8, duration: 0.05 }, { x: 12, y: -6, duration: 0.05 }, { x: -9, y: 5, duration: 0.05 }, { x: 7, y: -3, duration: 0.05 }, { x: -4, y: 2, duration: 0.06 }, { x: 0, y: 0, duration: 0.08 }], immediateRender: false }, te - 0.05);
  tl.fromTo($(".flash", el), { opacity: 0 }, { opacity: 0.55, duration: 0.06, yoyo: true, repeat: 1, immediateRender: false }, te - 0.05);
  entrar($(".cEsc", el), te, "mola"); sair($(".cEsc", el), ts - 0.4);
  entrar($(".setasS", el), ts - 0.2, "baixo");
  tl.fromTo($(".setasS", el), { y: 0 }, { y: -18, duration: 0.6, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, ts + 0.3);
  entrar($(".cSobe", el), ts, "cima"); sair($(".cSobe", el), tq - 0.4, "cima"); sair($(".setasS", el), tq - 0.3);
  tl.set($(".colunaM", el), { opacity: 0 }, 0); tl.set($(".colunaM", el), { opacity: 1 }, tq - 0.1); desenhar($(".colunaM .medidaL", el), tq - 0.1, 0.6);
  entrar($(".cCol", el), tq, "cima"); sair($(".cCol", el), tx - 0.4, "cima");
  entrar($(".cEst", el), tx, "baixo");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.0, 540, 960], [tf - 0.2, 1.0, 540, 960], [tf + 0.9, 1.12, 560, 1000], [te - 0.2, 1.12, 560, 1000], [ts + 0.4, 1.04, 540, 940], [c.fim + 0.5, 1.0, 540, 960]], c.fim);
};

// =============== 3. formato: longa e baixa ===============
CENAS.formato = (el, c, B) => {
  const tp = B("praia", 0.1), tc = B("comp", 0.3), tpo = B("pontas", 0.38), tam = B("altomar", 0.42), ta = B("altura", 0.45), tr = B("rampa", 0.6), tn = B("navio2", 0.75), tpp = B("palpite", 0.92);
  const Y = 1150;
  el.innerHTML = `<g class="cam">${foto("oceano")}
      <path class="tsuF" d="" fill="#fff" fill-opacity="0.12"/><path class="tsuL" d="" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" filter="url(#sombraTexto)"/>
      <g class="navW"><g class="navS" transform="scale(0.55)">${navioLado()}</g></g>
      <g class="medC">${medida(40, Y + 120, 1040, Y + 120, "≈ 200 km", { pil: C.amarelo, tam: 30 })}</g>
      ${[40, 1040].map((x) => `<g transform="translate(${x} ${Y + 120})"><g class="ponta"><circle r="22" fill="none" stroke="${C.amarelo}" stroke-width="5"/><circle r="8" fill="${C.amarelo}"/></g></g>`).join("")}
      <g transform="translate(760 ${Y - 80})"><g class="pAlt">${pilula("MENOS DE 1 m", "#fff", 30)}</g></g></g>
    <text class="rotm" x="1030" y="1390" text-anchor="end" font-size="24" fill="#fff" opacity="0.75">altura exagerada no desenho</text>
    ${velas(0.7)}
    <g transform="translate(540 600)"><g class="cPraia">${fotoCartao("onda-praia", 380, "Onda de praia · 10 m")}</g></g>
    <g transform="translate(540 560)"><g class="cNav">${cartao("O navio só sobe e desce", Object.assign({ tam: 38, sub: "uns 50 cm, em vários minutos" }, ESC))}</g></g>
    <g transform="translate(540 600)"><g class="cPal">${cartao("COMENTA SEU PALPITE", { tam: 50, cor: C.rosa, sub: "é mais rápido que um Fórmula 1?" })}</g></g>`;
  const L = $(".tsuL", el), F = $(".tsuF", el), nav = $(".navW", el);
  aCadaQuadro((t) => {
    if (t > c.fim + 0.6) return;
    const xc = t < tr - 0.5 ? 1700 : 1700 - (t - tr + 0.5) * 200;
    const yv = (x) => Y - 70 * _g(x, xc, 380);
    let d = ""; for (let x = -200; x <= 1280; x += 12) d += `${x === -200 ? "M" : "L"}${x} ${yv(x).toFixed(1)} `;
    L.setAttribute("d", d); F.setAttribute("d", d + `L 1280 ${Y + 60} L -200 ${Y + 60} Z`);
    const sl = (yv(560) - yv(520)) / 40;
    nav.setAttribute("transform", `translate(540 ${(yv(540) + 2).toFixed(1)}) rotate(${(Math.atan(sl) * 57.3).toFixed(2)})`);
  });
  tl.set([L, F, nav], { opacity: 0 }, 0); tl.to([L, F, nav], { opacity: 1, duration: 0.5 }, tc - 0.4);
  entrar($(".cPraia", el), tp - 0.3, "escala"); sair($(".cPraia", el), tc + 1.2, "cima");
  tl.set($(".medC", el), { opacity: 0 }, 0); tl.set($(".medC", el), { opacity: 1 }, tc); desenhar($(".medC .medidaL", el), tc, 0.9);
  $$(".ponta", el).forEach((g, q) => { entrar(g, tpo + q * 0.2, "escala"); sair(g, ta - 0.2); });
  entrar($(".pAlt", el), ta - 0.1, "escala"); sair($(".pAlt", el), tr + 0.5);
  entrar($(".cNav", el), tn - 0.2, "cima"); sair($(".cNav", el), tpp - 0.5, "cima");
  entrar($(".cPal", el), tpp, "mola");
  tl.fromTo($(".cPal", el), { scale: 1 }, { scale: 1.04, duration: 0.45, yoyo: true, repeat: 5, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tpp + 0.7);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.0, 540, 960], [tam - 0.2, 1.0, 540, 960], [tam + 0.9, 1.12, 540, 1100], [tr + 0.4, 1.12, 540, 1100], [tpp - 0.5, 1.02, 540, 980], [c.fim + 0.5, 1.0, 540, 960]], c.fim);
};

// =============== 4. velocidade: quanto mais fundo, mais rápido; 2004 no Índico ===============
CENAS.velocidade = (el, c, B) => {
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
  const tpf = B("prof", 0.1), tfu = B("isobatas", 0.2), trp = B("rapido", 0.24), tq4 = B("quatro", 0.27), tv = B("vel2", 0.3), tav = B("aviao", 0.45), ti = B("indo", 0.6), taf = B("africa", 0.8), th = B("horas", 0.92);
  const R0 = 420, R1 = 1260; // régua de profundidade (y)
  el.innerHTML = `<g class="parteA"><g class="cam">${foto("abismo")}</g>${velas(0.6)}
      <path d="M950 ${R0} V ${R1}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
      ${[0, 1000, 2000, 3000, 4000].map((m, k) => `<path d="M930 ${R0 + k * (R1 - R0) / 4} H 970" stroke="#fff" stroke-width="3"/><text class="rotm" x="915" y="${R0 + k * (R1 - R0) / 4 + 9}" text-anchor="end" font-size="26" fill="#fff" opacity="0.8">${m.toLocaleString("pt-BR")} m</text>`).join("")}
      <g class="marc"><circle cx="950" r="16" fill="${C.amarelo}" stroke="#fff" stroke-width="4"/></g>
      <g transform="translate(430 470)"><g class="cProf">${cartao("Depende da profundidade", { tam: 38, sub: "quanto mais fundo, mais rápido" })}</g></g>
      <g transform="translate(430 850)"><g class="sVel">${numeroGrande("nVel", "0", "KM/H", 160)}</g></g>
      <g transform="translate(430 1180)"><g class="cAv">${fotoCartao("aviao", 260, "Avião a jato ≈ 850 km/h")}</g></g></g>
    <g class="parteB" opacity="0"><g class="camB"><rect x="-200" y="-200" width="1480" height="2320" fill="#0e2a4a"/>
      <g class="frentes">${Array.from({ length: 7 }, () => `<circle class="frente" cx="${EP[0]}" cy="${EP[1]}" r="10" fill="none" stroke="#fff" stroke-width="3"/>`).join("")}</g>
      ${terras.map(([n, d, x, y]) => `<path d="${d}" fill="#e7dcc6"/>${n ? `<text class="rotm" x="${x}" y="${y}" font-size="26" fill="#0a1230" opacity="0.75">${n}</text>` : ""}`).join("")}
      <text class="rotm" x="430" y="1100" font-size="24" fill="#fff" opacity="0.55" letter-spacing="8">OCEANO ÍNDICO</text>
      <path class="rota" d="M${EP[0]} ${EP[1]} C 700 900, 450 1000, ${pj([42, -1]).join(" ")}" fill="none" stroke="${C.amarelo}" stroke-width="5" stroke-dasharray="14 12" stroke-linecap="round"/>
      <g transform="translate(${EP[0]} ${EP[1]})"><g class="epi"><circle r="20" fill="${C.rosa}" stroke="#fff" stroke-width="5"/></g></g></g>
      <g transform="translate(760 560)"><g class="t2004">${cartao("2004 · Indonésia", { tam: 40, sub: "terremoto de magnitude 9,1", cor: C.rosa })}</g></g>
      <g transform="translate(540 1290)"><g class="cTempo">${cartao("0 h", { tam: 52, larg: 420, sub: "até a costa da África" })}</g></g></g>`;
  // a profundidade desce na régua e a velocidade v = √(g·h) acompanha
  const marc = $(".marc", el), nVel = $(".nVel", el), prof = (t) => 4000 * _lim((t - tfu) / Math.max(0.5, tq4 + 0.6 - tfu));
  aCadaQuadro((t) => {
    if (t > c.fim + 0.6) return;
    const h = prof(t), k = (h / 4000) * (R1 - R0);
    marc.setAttribute("transform", `translate(0 ${(R0 + k).toFixed(1)})`);
    nVel.textContent = Math.round(Math.sqrt(9.81 * h) * 3.6).toLocaleString("pt-BR");
  });
  entrar($(".cProf", el), tpf - 0.1, "cima");
  entrar($(".sVel", el), trp - 0.3, "baixo");
  tl.fromTo($(".sVel", el), { scale: 1 }, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, transformOrigin: "50% 50%", immediateRender: false }, tv - 0.1);
  entrar($(".cAv", el), tav - 0.2, "dir");
  // 2004: o mapa limpo entra no lugar
  tl.to($(".parteA", el), { opacity: 0, duration: 0.5 }, ti - 0.7);
  tl.to($(".parteB", el), { opacity: 1, duration: 0.5 }, ti - 0.7);
  entrar($(".epi", el), ti - 0.3, "escala");
  entrar($(".t2004", el), ti - 0.1, "cima");
  const rota = $(".rota", el); tl.set(rota, { opacity: 0 }, 0); tl.set(rota, { opacity: 1 }, ti + 0.2); desenhar(rota, ti + 0.2, Math.max(0.8, taf - ti));
  const fr = $$(".frente", el), dur = Math.max(1.5, th + 1.2 - ti);
  fr.forEach((r, q) => tl.fromTo(r, { attr: { r: 10 }, opacity: 0.85 }, { attr: { r: 760 }, opacity: 0.1, duration: dur, ease: "none", immediateRender: false }, ti + q * (dur / 9)));
  entrar($(".cTempo", el), ti + 0.3, "baixo");
  contador($(".cTempo text.rot", el), 0, 7, ti + 0.4, Math.max(1, th - ti), (v) => Math.round(v) + " h");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.0, 540, 960], [c.fim + 0.5, 1.15, 540, 1100]], c.fim);
  cameraFases($(".camB", el), [[ti - 0.8, 1.05, 620, 860], [taf + 0.5, 1.0, 540, 880], [c.fim + 0.5, 1.02, 520, 880]], c.fim);
};

// =============== 5. chegada: freia, empilha e vira parede ===============
CENAS.chegada = (el, c, B) => {
  const tpb = B("prob", 0.1), tr = B("raso", 0.25), tf = B("freia", 0.4), te = B("empilha", 0.6), tpa = B("parede", 0.8), t30 = B("trinta", 0.9);
  const SUP = 880, praia = 930;
  const fundoY = (x) => (x < 200 ? 1330 : x < praia ? 1330 - (x - 200) * ((1330 - SUP - 20) / (praia - 200)) : SUP + 20 - (x - praia) * 0.5);
  const profPx = (x) => Math.max(4, fundoY(x) - SUP);
  // posição da onda: integra a velocidade (∝ √profundidade) uma vez, em tabela (função pura do tempo)
  const T0 = tpb - 0.3, T1 = tpa - 0.2, passo = 1 / 60, tab = [];
  let x = -250;
  for (let t = T0; t <= T1 + 1e-6; t += passo) { tab.push(x); x = Math.min(praia - 40, x + passo * 46 * Math.sqrt(profPx(x) / 22)); }
  const xc = (t) => tab[Math.max(0, Math.min(tab.length - 1, Math.round((t - T0) / passo)))];
  const altura = (x0) => Math.min(300, 16 * Math.pow(450 / profPx(x0), 1.05));
  let chao = ""; for (let x = -200; x <= 1280; x += 10) chao += `${x === -200 ? "M" : "L"}${x} ${fundoY(x).toFixed(1)} `;
  el.innerHTML = `<g class="parteA"><g class="cam">
      <rect x="-200" y="-200" width="1480" height="${SUP + 200}" fill="#dfe9f3"/><rect x="-200" y="${SUP}" width="1480" height="1400" fill="#16406b"/>
      <path class="agua" d="" fill="#16406b"/><path class="sup" d="" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <path d="${chao} L 1280 1900 L -200 1900 Z" fill="#e7dcc6"/><path d="${chao}" fill="none" stroke="#c9b894" stroke-width="3"/>
      ${[0, 1, 2].map((k) => `<rect x="${990 + k * 70}" y="${SUP - 20 - (k % 2) * 30 - 60}" width="54" height="${80 + (k % 2) * 30}" rx="6" fill="#fff" opacity="0.9"/>`).join("")}
      <g transform="translate(700 ${fundoY(700) + 80})"><g class="pRaso">${pilula("MAR RASO", "#fff", 30)}</g></g>
      <g class="pFreia">${pilula("A FRENTE FREIA", C.amarelo, 30)}</g>
      <g class="pEmp">${pilula("A ÁGUA SE EMPILHA", C.rosa, 30)}</g></g>
      <g transform="translate(290 520)"><g class="rV">${cartao("700 km/h", { tam: 44, larg: 380, sub: "velocidade" })}</g></g>
      <g transform="translate(790 520)"><g class="rA">${cartao("0,5 m", { tam: 44, larg: 380, sub: "altura" })}</g></g></g>
    <g class="parteB" opacity="0"><g class="camB">${foto("costa-onda")}</g>${velas(0.8)}
      <g transform="translate(540 820)"><g class="sAlt">${numeroGrande("nAlt", "10 m", "DE ALTURA", 190)}</g></g>
      <g transform="translate(540 1290)"><g class="cPar">${pilula("UMA PAREDE DE ÁGUA", "#fff", 36)}</g></g></g>`;
  const sup = $(".sup", el), agua = $(".agua", el), pF = $(".pFreia", el), pE = $(".pEmp", el), tV = $(".rV text.rot", el), tA = $(".rA text.rot", el);
  aCadaQuadro((t) => {
    if (t < c.ini - 1 || t > c.fim + 0.6) return;
    const x0 = xc(t), A = t < T0 ? 0 : altura(x0), w = Math.max(60, 260 * Math.pow(profPx(x0) / 450, 0.5));
    const yv = (x) => SUP - A * _g(x, x0, x < x0 ? w * 1.4 : w * 0.7);
    let d = ""; for (let x = -200; x <= 1280; x += 6) { const y = Math.min(yv(x), fundoY(x)); d += `${x === -200 ? "M" : "L"}${x} ${y.toFixed(1)} `; }
    sup.setAttribute("d", d); agua.setAttribute("d", d + `L 1280 ${SUP + 400} L -200 ${SUP + 400} Z`);
    pF.setAttribute("transform", `translate(${(x0 + 60).toFixed(1)} ${(SUP - A - 70).toFixed(1)})`);
    pE.setAttribute("transform", `translate(${(x0 - 160).toFixed(1)} ${(SUP - A * 0.6 - 120).toFixed(1)})`);
    const hm = profPx(x0) / 440 * 4000;
    tV.textContent = Math.round(Math.sqrt(9.81 * Math.max(8, hm)) * 3.6) + " km/h";
    tA.textContent = (A < 40 ? (0.5 * A / 16).toFixed(1).replace(".", ",") : Math.round(Math.min(10, A / 30))) + " m";
  });
  entrar($(".rV", el), tpb, "esq"); entrar($(".rA", el), tpb + 0.15, "dir");
  entrar($(".pRaso", el), tr - 0.1, "escala");
  entrar(pF, tf - 0.1, "escala"); sair(pF, te - 0.2);
  entrar(pE, te - 0.1, "escala");
  tl.to($(".parteA", el), { opacity: 0, duration: 0.45 }, tpa - 0.3);
  tl.to($(".parteB", el), { opacity: 1, duration: 0.45 }, tpa - 0.3);
  contador($(".nAlt", el), 10, 30, tpa + 0.2, Math.max(0.8, t30 - tpa), (v) => (Math.round(v / 10) * 10) + " m");
  entrar($(".sAlt", el), tpa - 0.1, "mola");
  entrar($(".cPar", el), tpa + 0.5, "baixo");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.0, 540, 960], [te - 0.5, 1.0, 540, 960], [tpa - 0.2, 1.12, 760, 860]], c.fim);
  kenBurns($(".camB", el), tpa - 0.3, c.fim + 0.5, 1.0, 1.12, 380, 760);
};

// =============== 6. sinal: o mar recua ===============
CENAS.sinal = (el, c, B) => {
  const tpm = B("prometi", 0.1), trc = B("recua", 0.25), tes = B("esvazia", 0.33), tce = B("centenas", 0.4), ts = B("seco", 0.45), tv = B("vale", 0.6), tc = B("corra", 0.8), tm = B("minutos", 0.92);
  // mini-diagrama do vale (num cartão branco): o vale chega antes da crista
  const vale = `<g filter="url(#sombraCartao)"><rect x="-330" y="-150" width="660" height="300" rx="30" fill="#fff"/></g>
    <path d="M-290 0 H 290" stroke="#0a1230" stroke-opacity="0.3" stroke-width="3" stroke-dasharray="10 10"/>
    <path class="vLin" d="M-290 0 C -200 0, -170 -80, -110 -80 S -20 0, 40 0 S 130 80, 190 80 S 260 0, 290 0" fill="none" stroke="#1d5f9a" stroke-width="7" stroke-linecap="round"/>
    <g transform="translate(-110 -112)">${pilula("CRISTA", "#e8edf5", 22)}</g><g transform="translate(190 118)">${pilula("VALE · CHEGA ANTES", C.amarelo, 22)}</g>
    ${setaClean(250, -100, 300, -100, "#0a1230", 5)}<text class="rotm" x="200" y="-92" text-anchor="end" font-size="22" fill="#0a1230" opacity="0.6">praia</text>`;
  el.innerHTML = `<g class="cam">${foto("praia-seca")}
      <g class="setaR">${setaClean(780, 980, 380, 560, "#fff", 9)}</g>
      <g class="medR">${medida(860, 1230, 470, 760, "0 m", { pil: C.amarelo, tam: 30, cls: "medR" })}</g>
      <g transform="translate(640 1060)"><g class="pPeixe">${marcador("PEIXES NO SECO", 90, C.rosa)}</g></g></g>
    ${velas(0.8)}
    <g transform="translate(540 460)"><g class="cProm">${cartao("O sinal que eu prometi", { tam: 42 })}</g></g>
    <g transform="translate(540 460)"><g class="cRec">${cartao("O mar recua", { tam: 48, sub: "às vezes centenas de metros" })}</g></g>
    <g transform="translate(540 520)"><g class="cVale">${vale}</g></g>
    <g transform="translate(540 560)"><g class="cCorra">${cartao("CORRA PARA O ALTO", { tam: 54, cor: C.vermelho })}</g></g>
    <g transform="translate(540 1270)"><g class="cMin">${cartao("05:00", { tam: 56, larg: 360, sub: "você tem poucos minutos", cor: C.vermelho })}</g></g>`;
  entrar($(".cProm", el), tpm - 0.1, "baixo"); sair($(".cProm", el), trc - 0.3, "cima");
  entrar($(".cRec", el), trc, "escala"); sair($(".cRec", el), tv - 0.4, "cima");
  tl.set($(".setaR", el), { opacity: 0 }, 0); tl.set($(".setaR", el), { opacity: 1 }, trc - 0.1); desenhar($$(".setaR path", el), trc - 0.1, 0.7); sair($(".setaR", el), tes - 0.2);
  tl.set($(".medR", el), { opacity: 0 }, 0); tl.set($(".medR", el), { opacity: 1 }, tes); desenhar($(".medR .medidaL", el), tes, 0.6);
  contador($(".medR text", el), 0, 300, tce - 0.1, 0.9, (v) => Math.round(v) + " m");
  sair($(".medR", el), tv - 0.3);
  entrar($(".pPeixe", el), ts - 0.2, "escala"); sair($(".pPeixe", el), tv - 0.3);
  entrar($(".cVale", el), tv - 0.1, "escala"); desenhar($(".vLin", el), tv, 0.9); sair($(".cVale", el), tc - 0.3, "cima");
  entrar($(".cCorra", el), tc, "mola");
  tl.fromTo($(".cCorra", el), { scale: 1 }, { scale: 1.05, duration: 0.3, yoyo: true, repeat: 7, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tc + 0.5);
  entrar($(".cMin", el), tm - 0.5, "baixo");
  const tTxt = $(".cMin text.rot", el);
  aCadaQuadro((t) => { if (t < tm - 0.6 || t > c.fim + 0.6) return; const s = Math.max(0, 300 - Math.max(0, t - tm + 0.5) * 6); tTxt.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`; });
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.05, 560, 900], [trc - 0.2, 1.05, 560, 900], [tes + 0.6, 1.0, 600, 960], [tv - 0.3, 1.0, 600, 960], [c.fim + 0.5, 1.1, 640, 1000]], c.fim);
};

// =============== 7. alerta: sensor (zoom que revela detalhes), boia, satélite ===============
CENAS.alerta = (el, c, B) => {
  const tvg = B("vigia", 0.1), tse = B("sensor", 0.25), tcm = B("cm", 0.4), tb = B("boia", 0.55), tsat = B("sat", 0.7), tco = B("costa", 0.85);
  const SX = 540, SY = 1470; // sensor na foto
  const mt = (x, y, tx, anc) => `<text class="rotm" x="${x}" y="${y}" font-size="9" fill="#fff" text-anchor="${anc || "middle"}">${tx}</text>`;
  const micro = `<g class="micro" opacity="0" filter="url(#sombraTexto)">
    <path d="M${SX - 26} ${SY - 10} H ${SX - 70} M${SX + 26} ${SY - 10} H ${SX + 70} M${SX + 36} ${SY + 52} H ${SX + 66}" stroke="#fff" stroke-width="1.2" fill="none"/>
    ${mt(SX - 74, SY - 13, "PROFUNDIDADE", "end")}${mt(SX - 74, SY - 1, "4.000 m", "end")}
    ${mt(SX + 74, SY - 13, "MEDE A PRESSÃO", "start")}${mt(SX + 74, SY - 1, "A CADA 15 s", "start")}
    ${mt(SX + 70, SY + 55, "ÂNCORA", "start")}
    <rect x="${SX - 46}" y="${SY - 66}" width="92" height="20" rx="10" fill="${C.amarelo}"/>
    <text class="rot microP" x="${SX}" y="${SY - 52}" font-size="11" fill="#0a1230" text-anchor="middle">4.012,30 dbar</text></g>`;
  el.innerHTML = `<g class="parteA"><g class="cam">${foto("fundo-mar")}
      <g transform="translate(${SX} ${SY - 40})"><g class="pSen">${marcador("SENSOR DE PRESSÃO", 150)}</g></g>${micro}</g>${velas(0.7)}
      <g transform="translate(540 460)"><g class="cVig">${cartao("Os oceanos são vigiados", { tam: 42 })}</g></g>
      <g transform="translate(540 460)"><g class="cCm">${cartao("+3 cm no nível do mar", { tam: 40, sub: "a pressão no fundo denuncia", cor: C.rosa })}</g></g></g>
    <g class="parteB" opacity="0"><g class="camB">${foto("boia")}
      ${[0, 1, 2].map(() => `<path class="ac" d="M378 0 Q 448 -36 518 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0"/>`).join("")}
      <g transform="translate(448 1060)"><g class="pBoia">${marcador("BOIA", 200)}</g></g></g>${velas(0.7)}
      <path class="linhaS" d="M470 820 C 560 700, 640 650, 720 610" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="12 12" stroke-linecap="round"/>
      <g transform="translate(830 500)"><g class="cSat">${fotoCartao("satelite", 230, "Satélite")}</g></g>
      <path class="linhaC" d="M830 680 C 820 900, 700 1080, 560 1180" fill="none" stroke="${C.vermelho}" stroke-width="5" stroke-dasharray="12 12" stroke-linecap="round"/>
      <g transform="translate(540 1270)"><g class="cAl">${cartao("ALERTA DE TSUNAMI", { tam: 44, sub: "chega à costa antes da onda", cor: C.vermelho })}</g></g></g>`;
  entrar($(".cVig", el), tvg - 0.1, "cima"); sair($(".cVig", el), tse + 0.2, "cima");
  entrar($(".pSen", el), tse - 0.1, "escala");
  // mergulho no sensor: os detalhes aparecem perto de 3× e o marcador de fora some
  const tz0 = tse + 0.7, tz1 = tcm + 0.6;
  tl.to($(".pSen", el), { opacity: 0, duration: 0.25 }, tz0 - 0.1);
  tl.to($(".micro", el), { opacity: 1, duration: 0.35 }, tz0 + 0.7);
  tl.to($(".micro", el), { opacity: 0, duration: 0.25 }, tz1);
  contador($(".microP", el), 4012.30, 4012.33, tcm - 0.3, 0.8, (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " dbar");
  entrar($(".cCm", el), tcm - 0.1, "cima"); sair($(".cCm", el), tb - 0.6, "cima");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.0, 540, 1000], [tz0, 1.0, 540, 1000], [tz0 + 1.0, 3.2, SX, SY - 20], [tz1, 3.2, SX, SY - 20], [tb, 1.6, SX, SY - 120]], c.fim);
  // boia: a parte B entra; ondas sonoras sobem do fundo até a boia
  tl.to($(".parteA", el), { opacity: 0, duration: 0.45 }, tb - 0.5);
  tl.to($(".parteB", el), { opacity: 1, duration: 0.45 }, tb - 0.5);
  entrar($(".pBoia", el), tb - 0.1, "escala");
  $$(".ac", el).forEach((a, q) => tl.fromTo(a, { y: 1700, opacity: 0.9 }, { y: 1130, opacity: 0, duration: 1.0, repeat: 1, ease: "none", immediateRender: false }, tb + q * 0.3));
  const lS = $(".linhaS", el), lC = $(".linhaC", el);
  tl.set([lS, lC], { opacity: 0 }, 0);
  tl.set(lS, { opacity: 1 }, tsat - 0.2); desenhar(lS, tsat - 0.2, 0.6);
  entrar($(".cSat", el), tsat, "escala");
  tl.set(lC, { opacity: 1 }, tco - 0.2); desenhar(lC, tco - 0.2, 0.6);
  entrar($(".cAl", el), tco + 0.3, "mola");
  kenBurns($(".camB", el), tb - 0.5, c.fim + 0.5, 1.0, 1.08, 448, 1000);
};

// =============== 8. resumo: os 4 passos e de volta ao navio ===============
CENAS.resumo = (el, c, B, i, f) => {
  const tp = ["passo1", "passo2", "passo3", "passo4"].map((p, k) => B(p, 0.2 + k * 0.12)), tn = B("navioF", 0.75), tcta = B("cta", 0.8);
  const passos = ["Um terremoto levanta o fundo do mar", "A onda nasce longa e baixa", "Corre quase como um avião", "Perto da costa vira parede"];
  el.innerHTML = `<g class="cam">${foto("navio")}</g>
    <rect class="escuro" x="-200" y="-200" width="1480" height="2320" fill="#0a1230" opacity="0.45"/>${velas()}
    ${passos.map((p, k) => `<g transform="translate(540 ${470 + k * 175})"><g class="passo">${cartao(p, { tam: 38, larg: 900, barra: false })}
      <g transform="translate(-390 0)"><circle r="32" fill="${C.amarelo}"/><text class="rot" y="13" text-anchor="middle" font-size="36" fill="#0a1230">${k + 1}</text></g></g></g>`).join("")}
    <g transform="translate(520 860)"><g class="pNing">${pilula("E NINGUÉM A BORDO PERCEBE", "#fff", 30)}</g></g>`;
  $$(".passo", el).forEach((p, k) => { entrar(p, tp[k] - 0.15, "esq"); sair(p, tn - 0.5 + k * 0.05, "esq"); });
  tl.to($(".escuro", el), { opacity: 0, duration: 0.6 }, tn - 0.4);
  entrar($(".pNing", el), tn, "escala"); sair($(".pNing", el), tcta - 0.3);
  tl.to($(".escuro", el), { opacity: 0.88, duration: 0.5 }, tcta - 0.3);
  cartaoFinal(f, tcta);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.0, 540, 980], [tn - 0.6, 1.08, 540, 1000], [tn + 0.8, 1.3, 520, 1090], [c.fim + 0.5, 1.34, 520, 1090]], c.fim);
};
