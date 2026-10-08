// Cenas do vídeo "Como os tsunamis viajam quase invisíveis em alto mar" — versão 3 (camadas).
// Estilo MODERNO E CLEAN, sem neon e sem 3D: cada cena é um ambiente desenhado em código e sempre
// em movimento (céu, mar, fundo do mar, praia), e os objetos são ilustrações geradas e recortadas
// (imagens.py --objeto → imagens/*.png), animadas como camadas com objeto(nome, largura).

const _g = (x, c, w) => Math.exp(-Math.pow((x - c) / w, 2));
const _lim = (u) => Math.min(1, Math.max(0, u));
const marcador = (txt, alt, cor) => `<path d="M0 0 V ${-alt}" stroke="#fff" stroke-width="3" filter="url(#sombraTexto)"/><circle r="10" fill="${cor || C.amarelo}" stroke="#fff" stroke-width="3"/>
  <g transform="translate(0 ${-alt - 32})">${pilula(txt, "#fff", 30)}</g>`;
const ESC = { fundo: "#0a1230", tinta: "#fff" }; // cartão escuro (para fundos claros)
// degradês do cenário (uma vez)
$("#defs").insertAdjacentHTML("beforeend", `
  <linearGradient id="ceuA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9fb8d6"/><stop offset="0.7" stop-color="#e9dccb"/><stop offset="1" stop-color="#f6e6cf"/></linearGradient>
  <linearGradient id="ceuDia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c4e0"/><stop offset="1" stop-color="#e8f0f7"/></linearGradient>
  <linearGradient id="marA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3f6a93"/><stop offset="0.25" stop-color="#1f4a75"/><stop offset="1" stop-color="#0a1b38"/></linearGradient>
  <linearGradient id="fundoMar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a6a9c"/><stop offset="0.45" stop-color="#123a64"/><stop offset="1" stop-color="#061532"/></linearGradient>
  <linearGradient id="areia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#eadfc8"/><stop offset="1" stop-color="#cdbb98"/></linearGradient>
  <radialGradient id="solA"><stop offset="0" stop-color="#fff7e6"/><stop offset="0.35" stop-color="#ffe9c2" stop-opacity="0.8"/><stop offset="1" stop-color="#ffe9c2" stop-opacity="0"/></radialGradient>
  <pattern id="estratos" width="40" height="34" patternUnits="userSpaceOnUse"><rect width="40" height="34" fill="#d9b98e"/><rect y="12" width="40" height="9" fill="#c99872"/><rect y="27" width="40" height="5" fill="#e6cfa8"/></pattern>
  <pattern id="estratos2" width="40" height="30" patternUnits="userSpaceOnUse"><rect width="40" height="30" fill="#b9876a"/><rect y="10" width="40" height="8" fill="#a77558"/><rect y="24" width="40" height="4" fill="#c99a7c"/></pattern>`);

// ---------- mar aberto em camadas (cenas 1 e 8): céu, sol, mar que se mexe, navio boiando ----------
// devolve sup(x, t) (superfície perto do navio) e posNavio(t) para seguir o navio
function marAberto(el, c, o) {
  const HZ = 880, Y0 = o.Y0 || 1140, NW = o.NW || 780;
  const [nw, nh] = (window.IMG || {})["navio-obj"] || [970, 223], NH = NW * nh / nw;
  const html = `<rect x="-200" y="-200" width="${W + 400}" height="${HZ + 200}" fill="url(#ceuA)"/>
    <circle cx="760" cy="${HZ - 120}" r="260" fill="url(#solA)"/><circle cx="760" cy="${HZ - 120}" r="54" fill="#fffaf0"/>
    <g class="nuvens">${[[120, 420, 260], [520, 560, 340], [900, 380, 220], [300, 700, 300]].map(([x, y, r]) => `<ellipse class="nv" cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.16}" fill="#fff" opacity="0.32"/>`).join("")}</g>
    <rect x="-200" y="${HZ}" width="${W + 400}" height="${H + 400}" fill="url(#marA)"/>
    <path class="brilhoSol" d="" fill="#fff4dc" opacity="0.22"/>
    <g>${Array.from({ length: 9 }, () => `<path class="ll" d="" fill="none" stroke="#cfe0f0" stroke-width="2" stroke-linecap="round"/>`).join("")}</g>
    <g class="navioW">${objeto("navio-obj", NW, { afunda: 26 })}</g>
    <path class="aguaFrente" d="" fill="#163f6a"/>
    <path class="supF" d="" fill="none" stroke="#e8f1fa" stroke-width="4" stroke-linecap="round" opacity="0.75"/>
    <g>${Array.from({ length: 6 }, () => `<path class="lp" d="" fill="none" stroke="#9fc2e2" stroke-width="2.5" stroke-linecap="round" opacity="0.3"/>`).join("")}</g>`;
  return { html, NH, iniciar: (lomb) => {
    const nav = $(".navioW", el), af = $(".aguaFrente", el), sf = $(".supF", el), ll = $$(".ll", el), lp = $$(".lp", el), bs = $(".brilhoSol", el), nv = $$(".nv", el);
    const sup = (x, t) => Y0 + 5 * Math.sin(x / 64 - t * 2.1) + 3 * Math.sin(x / 31 + t * 1.4) - (lomb ? lomb(x, t) : 0);
    const posNavio = (t) => { const sx = (o.x0 ?? 450) + (t - c.ini) * 9; return [sx, sup(sx, t), Math.atan2(sup(sx + 120, t) - sup(sx - 120, t), 240) * 57.3]; };
    aCadaQuadro((t) => {
      if (t < c.ini - 1 || t > c.fim + 0.6) return;
      ll.forEach((p, k) => {
        const y = HZ + 14 + Math.pow(k / 9, 1.6) * (Y0 - HZ - 40), amp = 1 + k * 0.5, off = (k * 137) % 400;
        let d = ""; for (let x = -100 - off; x <= W + 100; x += 90) d += `M${x.toFixed(0)} ${(y + amp * Math.sin(x / 50 + t * (0.6 + k * 0.12))).toFixed(1)} h ${36 + k * 4} `;
        p.setAttribute("d", d); p.setAttribute("opacity", (0.15 + k * 0.05).toFixed(2));
      });
      nv.forEach((n, k) => n.setAttribute("transform", `translate(${(((t * (6 + k * 3)) % 1600) - 300).toFixed(1)} 0)`));
      let r = ""; for (let k = 0; k < 12; k++) { const y = HZ + 10 + k * 18, w = 40 + k * 14 + 18 * Math.sin(t * 2.2 + k * 1.7), x0 = 760 + 14 * Math.sin(t * 1.3 + k * 2.1) - w / 2; r += `M${x0.toFixed(1)} ${y} h ${w.toFixed(1)} v 3 h ${(-w).toFixed(1)} Z `; }
      bs.setAttribute("d", r);
      let d = ""; for (let x = -200; x <= W + 200; x += 10) d += `${x === -200 ? "M" : "L"}${x} ${sup(x, t).toFixed(1)} `;
      sf.setAttribute("d", d); af.setAttribute("d", d + `L ${W + 200} ${H + 300} L -200 ${H + 300} Z`);
      const [sx, sy, inc] = posNavio(t);
      nav.setAttribute("transform", `translate(${sx.toFixed(1)} ${sy.toFixed(1)}) rotate(${inc.toFixed(2)})`);
      lp.forEach((p, k) => {
        const y = Y0 + 70 + k * 55, off = (k * 211) % 500;
        let e = ""; for (let x = -200 - off; x <= W + 200; x += 160) e += `M${x.toFixed(0)} ${(y + 6 * Math.sin(x / 40 + t * (1.4 + k * 0.2))).toFixed(1)} q 30 -${8 + k} 70 0 `;
        p.setAttribute("d", e);
      });
    });
    return { sup, posNavio };
  } };
}

// =============== 1. gancho: o navio em alto mar e a onda invisível ===============
CENAS.altomar = (el, c, B) => {
  mostrarGancho(B("titulo", 0.85) - 0.2);
  const tn = B("navio", 0.12), tv = B("vel", 0.3), tna = B("nada", 0.45), tts = B("tsunami", 0.5), tpr = B("promessa", 0.8);
  const M = marAberto(el, c, {});
  el.innerHTML = `<g class="cam">${M.html}<g class="mNavW"><g class="mNav">${marcador("CARGUEIRO · 150 m", 70)}</g></g></g>
    ${velas(0.55)}
    <g transform="translate(300 780)"><g class="s1">${numeroGrande("n700", "0", "KM/H", 140)}</g></g>
    <g transform="translate(790 780)"><g class="s2">${numeroGrande("n05", "0,0 m", "DE ALTURA", 140)}</g></g>
    <g transform="translate(540 1330)"><g class="tTsu">${pilula("ISSO É UM TSUNAMI", C.amarelo, 40)}</g></g>
    <g transform="translate(540 1310)"><g class="tProm">${cartao("No final: o sinal da praia", { tam: 40, sub: "minutos antes da onda chegar" })}</g></g>`;
  // lombada do tsunami: larga e baixa (altura exagerada para ver), passa por baixo do navio
  const lomb = (x, t) => (t < tts - 1 ? 0 : 34 * _g(x, -500 + (t - tts + 0.6) * 230, 330));
  const { posNavio } = M.iniciar(lomb);
  const mW = $(".mNavW", el);
  aCadaQuadro((t) => { if (t > c.fim + 0.6) return; const [sx, sy] = posNavio(t); mW.setAttribute("transform", `translate(${(sx + 60).toFixed(1)} ${(sy - M.NH + 30).toFixed(1)})`); });
  entrar($(".mNav", el), tn - 0.4, "escala"); sair($(".mNav", el), tv - 0.4);
  entrar($(".s1", el), tv - 0.25, "baixo");
  contador($(".n700", el), 0, 700, tv - 0.2, 1.0, (v) => Math.round(v));
  entrar($(".s2", el), tna - 0.6, "baixo");
  contador($(".n05", el), 0, 0.5, tna - 0.5, 0.8, (v) => v.toFixed(1).replace(".", ",") + " m");
  sair($(".s1", el), tpr - 0.4, "cima"); sair($(".s2", el), tpr - 0.35, "cima");
  entrar($(".tTsu", el), tts - 0.1, "escala"); sair($(".tTsu", el), tpr - 0.3);
  entrar($(".tProm", el), tpr, "baixo");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.4, 500, 1100], [tn - 0.3, 1.4, 500, 1100], [tv + 0.8, 1.0, 540, 1000], [c.fim + 0.5, 1.06, 560, 1030]], c.fim);
};

// =============== 2. origem: corte do fundo do mar; as placas, o tranco e a água que sobe ===============
CENAS.origem = (el, c, B) => {
  const tf = B("fundo", 0.15), tp = B("placas", 0.3), te = B("escorrega", 0.45), ts = B("sobe", 0.6), tq = B("coluna", 0.75), tx = B("estranha", 0.92);
  const SUP = 560, FUN = 1060, FX = 600; // superfície, fundo e ponto onde as placas se encontram
  el.innerHTML = `<g class="cam">
      <rect x="-200" y="-200" width="${W + 400}" height="${SUP + 200}" fill="url(#ceuDia)"/>
      <path class="agua" d="" fill="url(#fundoMar)"/>
      <path class="sup" d="" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <g class="raios">${[0, 1, 2, 3].map((k) => `<path d="M${120 + k * 260} ${SUP} l ${-60 + k * 10} 520 h 70 l ${40 - k * 10} -520 Z" fill="#fff" opacity="0.05"/>`).join("")}</g>
      <g class="placaE"><path d="M-260 ${FUN} L ${FX + 40} ${FUN + 6} L ${FX + 330} ${FUN + 330} L ${FX + 330} 2200 L -260 2200 Z" fill="url(#estratos2)"/>
        <path d="M-260 ${FUN} L ${FX + 40} ${FUN + 6} L ${FX + 330} ${FUN + 330}" fill="none" stroke="#7d4f3a" stroke-width="5" stroke-linejoin="round"/></g>
      <g class="placaD"><g class="ponta"><path d="M${FX - 10} ${FUN - 4} Q ${FX + 200} ${FUN - 40} 1300 ${FUN - 70} L 1300 2200 L ${FX + 300} 2200 L ${FX + 120} ${FUN + 120} Z" fill="url(#estratos)"/>
        <path d="M${FX - 10} ${FUN - 4} Q ${FX + 200} ${FUN - 40} 1300 ${FUN - 70}" fill="none" stroke="#a9805a" stroke-width="5"/></g></g>
      <g class="setasP">${setaClean(80, 1180, 430, 1180, C.amarelo, 9)}${setaClean(1040, 1260, 760, 1200, C.amarelo, 9)}
        <g transform="translate(250 1120)">${pilula("PLACA", "#fff", 28)}</g><g transform="translate(910 1150)">${pilula("PLACA", "#fff", 28)}</g></g>
      <g class="setasS">${[480, 640, 800].map((x) => setaClean(x, 900, x, 700, "#fff", 7)).join("")}</g>
      <g class="colunaM">${medida(170, SUP + 10, 170, FUN - 10, "4 km", { pil: "#fff", dx: 80 })}</g></g>
    <rect class="flash" x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="#fff" opacity="0"/>
    ${velas(0.7)}
    <g transform="translate(540 430)"><g class="cFundo">${cartao("Tudo começa no fundo do mar", Object.assign({ tam: 38 }, ESC))}</g></g>
    <g transform="translate(540 430)"><g class="cSec">${cartao("Séculos de pressão", Object.assign({ tam: 40, sub: "as placas se empurram devagar" }, ESC))}</g></g>
    <g transform="translate(540 1310)"><g class="cEsc">${pilula("ESCORREGA DE REPENTE", C.rosa, 36)}</g></g>
    <g transform="translate(540 430)"><g class="cSobe">${cartao("O fundo sobe alguns metros", Object.assign({ tam: 38, sub: "e levanta toda a água de cima" }, ESC))}</g></g>
    <g transform="translate(540 430)"><g class="cCol">${cartao("Uma coluna de 4 km de água", Object.assign({ tam: 38 }, ESC))}</g></g>
    <g transform="translate(540 1310)"><g class="cEst">${cartao("Só que essa onda é estranha…", { tam: 40, cor: C.rosa })}</g></g>`;
  const agua = $(".agua", el), sup = $(".sup", el);
  // superfície: calma; no tranco sobe uma lombada que depois se divide em duas e se espalha
  const bump = (x, t) => {
    if (t < te) return 0;
    const u = _lim((t - te) / 1.2), A = 70 * u;
    if (t < tq + 1.5) return A * _g(x, FX + 80, 230);
    const d = (t - tq - 1.5) * 170;
    return A * 0.7 * (_g(x, FX + 80 - d, 260) + _g(x, FX + 80 + d, 260));
  };
  aCadaQuadro((t) => {
    if (t < c.ini - 1 || t > c.fim + 0.6) return;
    let d = ""; for (let x = -200; x <= W + 200; x += 10) d += `${x === -200 ? "M" : "L"}${x} ${(SUP + 4 * Math.sin(x / 55 + t * 1.8) - bump(x, t)).toFixed(1)} `;
    sup.setAttribute("d", d); agua.setAttribute("d", d + `L ${W + 200} ${FUN + 400} L -200 ${FUN + 400} Z`);
  });
  // séculos de pressão: a placa da esquerda desliza e a ponta da direita é puxada para baixo;
  // no tranco, a ponta solta e pula para cima (com um pouco de sobra)
  tl.fromTo($(".placaE", el), { x: 0, y: 0 }, { x: 40, y: 12, duration: Math.max(0.5, te - tp), ease: "none", immediateRender: false }, tp);
  tl.fromTo($(".ponta", el), { rotation: 0, svgOrigin: "1300 990" }, { rotation: -3.2, svgOrigin: "1300 990", duration: Math.max(0.5, te - tp), ease: "power1.in", immediateRender: false }, tp);
  tl.to($(".ponta", el), { rotation: 1.6, svgOrigin: "1300 990", duration: 0.18, ease: "power4.out" }, te);
  tl.to($(".ponta", el), { rotation: 0.6, svgOrigin: "1300 990", duration: 0.8, ease: "elastic.out(1, 0.4)" }, te + 0.18);
  tl.fromTo($(".cam", el), { x: 0 }, { keyframes: [{ x: -14, duration: 0.05 }, { x: 12, duration: 0.05 }, { x: -9, duration: 0.05 }, { x: 6, duration: 0.05 }, { x: 0, duration: 0.08 }], immediateRender: false }, te - 0.02);
  tl.fromTo($(".flash", el), { opacity: 0 }, { opacity: 0.5, duration: 0.06, yoyo: true, repeat: 1, immediateRender: false }, te - 0.02);
  entrar($(".cFundo", el), tf - 0.1, "cima"); sair($(".cFundo", el), tp - 0.3, "cima");
  entrar($(".setasP", el), tp - 0.1, "escala"); sair($(".setasP", el), te + 0.2);
  entrar($(".cSec", el), tp + 0.4, "cima"); sair($(".cSec", el), te - 0.2, "cima");
  entrar($(".cEsc", el), te, "mola"); sair($(".cEsc", el), ts - 0.4);
  entrar($(".setasS", el), ts - 0.2, "baixo");
  tl.fromTo($(".setasS", el), { y: 0 }, { y: -18, duration: 0.6, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, ts + 0.3);
  entrar($(".cSobe", el), ts, "cima"); sair($(".cSobe", el), tq - 0.4, "cima"); sair($(".setasS", el), tq - 0.3);
  tl.set($(".colunaM", el), { opacity: 0 }, 0); tl.set($(".colunaM", el), { opacity: 1 }, tq - 0.1); desenhar($(".colunaM .medidaL", el), tq - 0.1, 0.6);
  entrar($(".cCol", el), tq, "cima"); sair($(".cCol", el), tx - 0.4, "cima"); sair($(".colunaM", el), tx - 0.4);
  entrar($(".cEst", el), tx, "baixo");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.25, 540, 600], [tf - 0.2, 1.25, 540, 600], [tf + 1.2, 1.15, 640, 1080], [tp + 0.6, 1.0, 560, 960], [ts - 0.4, 1.0, 560, 960], [ts + 0.6, 1.08, 600, 780], [tx - 0.3, 1.0, 560, 820], [c.fim + 0.5, 1.02, 560, 820]], c.fim);
};

// =============== 3. formato: longa e baixa (e o palpite com o Fórmula 1) ===============
CENAS.formato = (el, c, B) => {
  const tp = B("praia", 0.1), tc = B("comp", 0.3), tpo = B("pontas", 0.38), tam = B("altomar", 0.42), ta = B("altura", 0.45), tr = B("rampa", 0.6), tn = B("navio2", 0.75), tpp = B("palpite", 0.92);
  const Y = 1120;
  el.innerHTML = `<g class="cam">
      <rect x="-200" y="-200" width="${W + 400}" height="${Y + 200}" fill="url(#ceuDia)"/>
      <path class="tsuF" d="" fill="url(#marA)"/><path class="tsuL" d="" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <g class="navW">${objeto("navio-obj", 300, { afunda: 12 })}</g>
      <g class="medC">${medida(40, Y + 140, 1040, Y + 140, "≈ 200 km", { pil: C.amarelo, tam: 30 })}</g>
      ${[40, 1040].map((x) => `<g transform="translate(${x} ${Y + 140})"><g class="ponta"><circle r="22" fill="none" stroke="${C.amarelo}" stroke-width="5"/><circle r="8" fill="${C.amarelo}"/></g></g>`).join("")}
      <g transform="translate(780 ${Y - 110})"><g class="pAlt">${pilula("MENOS DE 1 m", "#fff", 30)}</g></g></g>
    <text class="rotm" x="1030" y="1390" text-anchor="end" font-size="24" fill="#fff" opacity="0.75">altura exagerada no desenho</text>
    <g class="praiaG"><rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="url(#ceuDia)"/>
      <rect x="-200" y="1060" width="${W + 400}" height="900" fill="url(#marA)"/><path d="M-200 1180 Q 540 1150 1280 1200 L 1280 1900 L -200 1900 Z" fill="url(#areia)"/>
      <g transform="translate(560 1140)"><g class="ondaP">${objeto("onda-obj", 620, { afunda: 40 })}</g></g>
      <g class="medP">${medida(250, 760, 870, 760, "10 m", { pil: C.amarelo, tam: 30 })}</g>
      <g transform="translate(540 500)"><g class="cPraia">${cartao("Onda de praia", Object.assign({ tam: 42, sub: "uns 10 metros de ponta a ponta" }, ESC))}</g></g></g>
    ${velas(0.55)}
    <g transform="translate(540 520)"><g class="cTsu">${cartao("Tsunami: 200 km", Object.assign({ tam: 44, sub: "de uma ponta à outra" }, ESC))}</g></g>
    <g transform="translate(540 520)"><g class="cNav">${cartao("O navio só sobe e desce", Object.assign({ tam: 38, sub: "uns 50 cm, em vários minutos" }, ESC))}</g></g>
    <g class="f1W"><g class="f1">${objeto("f1-obj", 420)}</g><g class="rastro">${[0, 1, 2].map((k) => `<path d="M240 ${-30 - k * 26} h ${180 - k * 40}" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="${0.7 - k * 0.2}"/>`).join("")}</g></g>
    <g transform="translate(540 560)"><g class="cPal">${cartao("COMENTA SEU PALPITE", { tam: 50, cor: C.rosa, sub: "é mais rápido que um Fórmula 1?" })}</g></g>`;
  const L = $(".tsuL", el), F = $(".tsuF", el), nav = $(".navW", el);
  aCadaQuadro((t) => {
    if (t > c.fim + 0.6) return;
    const xc = t < tr - 0.5 ? 1700 : 1700 - (t - tr + 0.5) * 200;
    const yv = (x) => Y - 70 * _g(x, xc, 380) + 3 * Math.sin(x / 45 + t * 2);
    let d = ""; for (let x = -200; x <= 1280; x += 10) d += `${x === -200 ? "M" : "L"}${x} ${yv(x).toFixed(1)} `;
    L.setAttribute("d", d); F.setAttribute("d", d + `L 1280 ${H + 300} L -200 ${H + 300} Z`);
    const sl = (yv(570) - yv(510)) / 60;
    nav.setAttribute("transform", `translate(540 ${yv(540).toFixed(1)}) rotate(${(Math.atan(sl) * 57.3).toFixed(2)})`);
  });
  // a onda de praia aparece, depois o quadro todo "recua" para mostrar o tamanho do tsunami
  entrar($(".ondaP", el), tp - 0.4, "baixo");
  tl.fromTo($(".ondaP", el), { rotation: -2 }, { rotation: 2, duration: 0.9, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "50% 100%", immediateRender: false }, tp);
  tl.set($(".medP", el), { opacity: 0 }, 0); tl.set($(".medP", el), { opacity: 1 }, tp); desenhar($(".medP .medidaL", el), tp, 0.6);
  entrar($(".cPraia", el), tp - 0.2, "cima");
  tl.to($(".praiaG", el), { scale: 0.18, svgOrigin: "560 1140", opacity: 0, duration: 0.9, ease: "power2.in" }, tc - 0.5);
  tl.set($(".medC", el), { opacity: 0 }, 0); tl.set($(".medC", el), { opacity: 1 }, tc); desenhar($(".medC .medidaL", el), tc, 0.9);
  entrar($(".cTsu", el), tc + 0.1, "cima"); sair($(".cTsu", el), tam - 0.2, "cima");
  $$(".ponta", el).forEach((g, q) => { entrar(g, tpo + q * 0.2, "escala"); sair(g, ta - 0.2); });
  sair($(".medC", el), tpp - 0.3);
  entrar($(".pAlt", el), ta - 0.1, "escala"); sair($(".pAlt", el), tr + 0.5);
  entrar($(".cNav", el), tn - 0.2, "cima"); sair($(".cNav", el), tpp - 0.6, "cima");
  // o Fórmula 1 atravessa a tela no palpite
  tl.set($(".f1W", el), { opacity: 0 }, 0);
  tl.fromTo($(".f1W", el), { x: 1500, y: 1250, opacity: 1 }, { x: -500, y: 1250, opacity: 1, duration: 1.3, ease: "power1.inOut", immediateRender: false }, tpp + 0.3);
  entrar($(".cPal", el), tpp, "mola");
  tl.fromTo($(".cPal", el), { scale: 1 }, { scale: 1.04, duration: 0.45, yoyo: true, repeat: 5, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tpp + 0.7);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.0, 540, 960], [tam - 0.2, 1.0, 540, 960], [tam + 0.9, 1.15, 540, 1080], [tr + 0.4, 1.15, 540, 1080], [tpp - 0.5, 1.02, 540, 980], [c.fim + 0.5, 1.0, 540, 960]], c.fim);
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
  const R0 = 470, R1 = 1260; // régua de profundidade (y)
  el.innerHTML = `<g class="parteA"><g class="cam">
      <rect x="-200" y="-200" width="${W + 400}" height="${R0 + 120}" fill="url(#ceuDia)"/>
      <path class="supV" d="" fill="url(#fundoMar)"/><path class="supL" d="" fill="none" stroke="#fff" stroke-width="5"/>
      <g class="raios">${[0, 1, 2, 3, 4].map((k) => `<path class="raio" d="M${60 + k * 230} ${R0} l ${-40 + k * 12} 900 h 60 l ${30 - k * 10} -900 Z" fill="#fff" opacity="0.05"/>`).join("")}</g>
      <g class="bolhas">${Array.from({ length: 14 }, (_, k) => `<circle class="bo" cx="${80 + ((k * 173) % 760)}" cy="0" r="${3 + (k % 4) * 2}" fill="#fff" opacity="0.25"/>`).join("")}</g>
      <path d="M-200 ${R1 + 40} Q 540 ${R1 + 10} 1280 ${R1 + 50} L 1280 2200 L -200 2200 Z" fill="#0b1a33"/>
      <path d="M950 ${R0} V ${R1}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity="0.85"/>
      ${[0, 1000, 2000, 3000, 4000].map((m, k) => `<path d="M930 ${R0 + k * (R1 - R0) / 4} H 970" stroke="#fff" stroke-width="3"/><text class="rotm" x="915" y="${R0 + k * (R1 - R0) / 4 + 9}" text-anchor="end" font-size="26" fill="#fff" opacity="0.85">${m.toLocaleString("pt-BR")} m</text>`).join("")}
      <g class="marc"><circle cx="950" r="16" fill="${C.amarelo}" stroke="#fff" stroke-width="4"/></g></g>
      <g transform="translate(430 470)"><g class="cProf">${cartao("Depende da profundidade", { tam: 38, sub: "quanto mais fundo, mais rápido" })}</g></g>
      <g transform="translate(430 860)"><g class="sVel">${numeroGrande("nVel", "0", "KM/H", 160)}</g></g>
      <g class="avW"><g class="av">${objeto("aviao-obj", 460, { ancora: "centro" })}</g></g>
      <g transform="translate(540 1290)"><g class="cAv">${pilula("AVIÃO A JATO ≈ 850 km/h", "#fff", 32)}</g></g></g>
    <g class="parteB" opacity="0"><g class="camB"><rect x="-200" y="-200" width="1480" height="2320" fill="#0e2a4a"/>
      <g class="frentes">${Array.from({ length: 7 }, () => `<circle class="frente" cx="${EP[0]}" cy="${EP[1]}" r="10" fill="none" stroke="#fff" stroke-width="3"/>`).join("")}</g>
      ${terras.map(([n, d, x, y]) => `<path d="${d}" fill="#e7dcc6"/>${n ? `<text class="rotm" x="${x}" y="${y}" font-size="26" fill="#0a1230" opacity="0.75">${n}</text>` : ""}`).join("")}
      <text class="rotm" x="430" y="1100" font-size="24" fill="#fff" opacity="0.55" letter-spacing="8">OCEANO ÍNDICO</text>
      <path class="rota" d="M${EP[0]} ${EP[1]} C 700 900, 450 1000, ${pj([42, -1]).join(" ")}" fill="none" stroke="${C.amarelo}" stroke-width="5" stroke-dasharray="14 12" stroke-linecap="round"/>
      <g transform="translate(${EP[0]} ${EP[1]})"><g class="epi"><circle r="20" fill="${C.rosa}" stroke="#fff" stroke-width="5"/></g></g></g>
      <g transform="translate(760 560)"><g class="t2004">${cartao("2004 · Indonésia", { tam: 40, sub: "terremoto de magnitude 9,1", cor: C.rosa })}</g></g>
      <g transform="translate(540 1290)"><g class="cTempo">${cartao("0 h", { tam: 52, larg: 420, sub: "até a costa da África" })}</g></g></g>`;
  const supV = $(".supV", el), supL = $(".supL", el), bo = $$(".bo", el);
  const marc = $(".marc", el), nVel = $(".nVel", el), prof = (t) => 4000 * _lim((t - tfu) / Math.max(0.5, tq4 + 0.6 - tfu));
  aCadaQuadro((t) => {
    if (t < c.ini - 1 || t > c.fim + 0.6) return;
    let d = ""; for (let x = -200; x <= W + 200; x += 12) d += `${x === -200 ? "M" : "L"}${x} ${(R0 + 6 * Math.sin(x / 60 + t * 1.6)).toFixed(1)} `;
    supL.setAttribute("d", d); supV.setAttribute("d", d + `L ${W + 200} 2200 L -200 2200 Z`);
    bo.forEach((b, k) => b.setAttribute("cy", (R1 - (((t * (40 + k * 7)) + k * 97) % (R1 - R0 - 30))).toFixed(1)));
    const h = prof(t), k = (h / 4000) * (R1 - R0);
    marc.setAttribute("transform", `translate(0 ${(R0 + k).toFixed(1)})`);
    nVel.textContent = Math.round(Math.sqrt(9.81 * h) * 3.6).toLocaleString("pt-BR");
  });
  entrar($(".cProf", el), tpf - 0.1, "cima");
  entrar($(".sVel", el), trp - 0.3, "baixo");
  tl.fromTo($(".sVel", el), { scale: 1 }, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, transformOrigin: "50% 50%", immediateRender: false }, tv - 0.1);
  // o avião cruza o céu da direita para a esquerda
  tl.set($(".avW", el), { opacity: 0 }, 0);
  tl.fromTo($(".avW", el), { x: 1450, y: 330, opacity: 1 }, { x: -400, y: 300, opacity: 1, duration: 2.6, ease: "none", immediateRender: false }, tav - 0.6);
  entrar($(".cAv", el), tav - 0.1, "baixo"); sair($(".cAv", el), ti - 0.8);
  tl.to($(".parteA", el), { opacity: 0, duration: 0.5 }, ti - 0.7);
  tl.to($(".parteB", el), { opacity: 1, duration: 0.5 }, ti - 0.7);
  entrar($(".epi", el), ti - 0.3, "escala");
  entrar($(".t2004", el), ti - 0.1, "cima");
  const rota = $(".rota", el); tl.set(rota, { opacity: 0 }, 0); tl.set(rota, { opacity: 1 }, ti + 0.2); desenhar(rota, ti + 0.2, Math.max(0.8, taf - ti));
  const fr = $$(".frente", el), dur = Math.max(1.5, th + 1.2 - ti);
  fr.forEach((r, q) => tl.fromTo(r, { attr: { r: 10 }, opacity: 0.85 }, { attr: { r: 760 }, opacity: 0.1, duration: dur, ease: "none", immediateRender: false }, ti + q * (dur / 9)));
  entrar($(".cTempo", el), ti + 0.3, "baixo");
  contador($(".cTempo text.rot", el), 0, 7, ti + 0.4, Math.max(1, th - ti), (v) => Math.round(v) + " h");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.0, 540, 900], [tfu - 0.2, 1.0, 540, 900], [tq4 + 0.6, 1.1, 600, 1000], [c.fim + 0.5, 1.12, 600, 1010]], c.fim);
  cameraFases($(".camB", el), [[ti - 0.8, 1.05, 620, 860], [taf + 0.5, 1.0, 540, 880], [c.fim + 0.5, 1.02, 520, 880]], c.fim);
};

// =============== 5. chegada: freia, empilha e vira parede ===============
CENAS.chegada = (el, c, B) => {
  const tpb = B("prob", 0.1), tr = B("raso", 0.25), tf = B("freia", 0.4), te = B("empilha", 0.6), tpa = B("parede", 0.8), t30 = B("trinta", 0.9);
  const SUP = 880, praia = 930;
  const fundoY = (x) => (x < 200 ? 1330 : x < praia ? 1330 - (x - 200) * ((1330 - SUP - 20) / (praia - 200)) : SUP + 20 - (x - praia) * 0.5);
  const profPx = (x) => Math.max(4, fundoY(x) - SUP);
  // posição da onda: integra a velocidade (∝ √profundidade) uma vez, em tabela (função pura do tempo)
  const T0 = tpb - 0.3, T1 = c.fim + 0.6, passo = 1 / 60, tab = [];
  let xw = -250;
  for (let t = T0; t <= T1 + 1e-6; t += passo) { tab.push(xw); xw = Math.min(praia - 30, xw + passo * 46 * Math.sqrt(profPx(xw) / 22)); }
  const xc = (t) => tab[Math.max(0, Math.min(tab.length - 1, Math.round((t - T0) / passo)))];
  const altura = (x0) => Math.min(330, 16 * Math.pow(450 / profPx(x0), 1.05));
  let chao = ""; for (let x = -200; x <= 1280; x += 10) chao += `${x === -200 ? "M" : "L"}${x} ${fundoY(x).toFixed(1)} `;
  const yC = (x) => fundoY(x) + 4;
  el.innerHTML = `<g class="cam">
      <rect x="-200" y="-200" width="1480" height="${SUP + 200}" fill="url(#ceuDia)"/><rect x="-200" y="${SUP}" width="1480" height="1400" fill="#16406b"/>
      <path class="agua" d="" fill="url(#marA)"/>
      <path class="espuma" d="" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0"/>
      <path class="sup" d="" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      <path d="${chao} L 1280 1900 L -200 1900 Z" fill="url(#areia)"/><path d="${chao}" fill="none" stroke="#c9b894" stroke-width="3"/>
      <g transform="translate(1010 ${yC(1010)})"><g class="casa1">${objeto("casa-obj", 190)}</g></g>
      <g transform="translate(1180 ${yC(1180)})"><g class="casa2">${objeto("casa-obj", 170)}</g></g>
      ${[[960, 230], [1100, 280], [1250, 250]].map(([x, h], k) => `<g transform="translate(${x} ${yC(x)})"><g class="palma" data-k="${k}">${objeto("palmeira-obj", h * 0.58)}</g></g>`).join("")}
      <g transform="translate(700 ${fundoY(700) + 80})"><g class="pRaso">${pilula("MAR RASO", "#fff", 30)}</g></g>
      <g class="pFreia">${pilula("A FRENTE FREIA", C.amarelo, 30)}</g>
      <g class="pEmp">${pilula("A ÁGUA SE EMPILHA", C.rosa, 30)}</g></g>
    ${velas(0.5)}
    <g class="leit"><g transform="translate(290 520)"><g class="rV">${cartao("700 km/h", { tam: 44, larg: 380, sub: "velocidade" })}</g></g>
      <g transform="translate(790 520)"><g class="rA">${cartao("0,5 m", { tam: 44, larg: 380, sub: "altura" })}</g></g></g>
    <g transform="translate(540 470)"><g class="sAlt">${numeroGrande("nAlt", "10 m", "DE ALTURA", 190)}</g></g>`;
  const sup = $(".sup", el), agua = $(".agua", el), esp = $(".espuma", el), pF = $(".pFreia", el), pE = $(".pEmp", el), tV = $(".rV text.rot", el), tA = $(".rA text.rot", el);
  const palmas = $$(".palma", el);
  aCadaQuadro((t) => {
    if (t < c.ini - 1 || t > c.fim + 0.6) return;
    const x0 = xc(t), A = t < T0 ? 0 : altura(x0), w = Math.max(60, 260 * Math.pow(profPx(x0) / 450, 0.5));
    const yv = (x) => SUP - A * _g(x, x0, x < x0 ? w * 1.5 : w * 0.55) + 4 * Math.sin(x / 50 + t * 2);
    let d = ""; for (let x = -200; x <= 1280; x += 6) { const y = Math.min(yv(x), fundoY(x)); d += `${x === -200 ? "M" : "L"}${x} ${y.toFixed(1)} `; }
    sup.setAttribute("d", d); agua.setAttribute("d", d + `L 1280 ${SUP + 600} L -200 ${SUP + 600} Z`);
    // espuma na crista quando a onda fica alta
    let e = ""; for (let x = x0 - w * 0.6; x <= x0 + w * 0.3; x += 6) e += `${e ? "L" : "M"}${x.toFixed(1)} ${(Math.min(yv(x), fundoY(x)) - 4).toFixed(1)} `;
    esp.setAttribute("d", e); esp.setAttribute("opacity", _lim((A - 60) / 80).toFixed(2));
    pF.setAttribute("transform", `translate(${(x0 + 70).toFixed(1)} ${(SUP - A - 70).toFixed(1)})`);
    pE.setAttribute("transform", `translate(${(x0 - 170).toFixed(1)} ${(SUP - A * 0.6 - 120).toFixed(1)})`);
    // palmeiras: balançam com o vento e se curvam quando a parede chega
    const forca = _lim((A - 120) / 160);
    palmas.forEach((p, k) => p.setAttribute("transform", `rotate(${(2.5 * Math.sin(t * 1.7 + k) - 16 * forca).toFixed(2)})`));
    const hm = profPx(x0) / 440 * 4000;
    tV.textContent = Math.round(Math.sqrt(9.81 * Math.max(8, hm)) * 3.6) + " km/h";
    tA.textContent = (A < 40 ? (0.5 * A / 16).toFixed(1).replace(".", ",") : Math.round(Math.min(10, A / 30))) + " m";
  });
  entrar($(".rV", el), tpb, "esq"); entrar($(".rA", el), tpb + 0.15, "dir");
  entrar($(".pRaso", el), tr - 0.1, "escala");
  entrar(pF, tf - 0.1, "escala"); sair(pF, te - 0.2);
  entrar(pE, te - 0.1, "escala"); sair(pE, tpa - 0.2);
  sair($(".leit", el), tpa - 0.3, "cima");
  contador($(".nAlt", el), 10, 30, tpa + 0.2, Math.max(0.8, t30 - tpa), (v) => (Math.round(v / 10) * 10) + " m");
  entrar($(".sAlt", el), tpa - 0.1, "mola");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.0, 540, 960], [te - 0.5, 1.0, 540, 960], [tpa - 0.2, 1.35, 820, 820], [c.fim + 0.5, 1.4, 840, 800]], c.fim);
};

// =============== 6. sinal: o mar recua (a praia esvazia) ===============
CENAS.sinal = (el, c, B) => {
  const tpm = B("prometi", 0.1), trc = B("recua", 0.25), tes = B("esvazia", 0.33), tce = B("centenas", 0.4), ts = B("seco", 0.45), tv = B("vale", 0.6), tc = B("corra", 0.8), tm = B("minutos", 0.92);
  const chao = (x) => 950 + 0.3 * (700 - x);
  let perfil = ""; for (let x = -200; x <= 1280; x += 10) perfil += `${x === -200 ? "M" : "L"}${x} ${chao(x).toFixed(1)} `;
  // o nível do mar perto da praia baixa: a linha d'água recua para a esquerda
  const nivel = (t) => 950 + 110 * _lim((t - trc + 0.3) / 2.2), XA0 = 700, XA1 = 333;
  const xAgua = (t) => { const n = nivel(t); for (let x = -200; x < 1280; x += 2) if (chao(x) < n) return x; return 1280; };
  const vale = `<g filter="url(#sombraCartao)"><rect x="-330" y="-150" width="660" height="300" rx="30" fill="#fff"/></g>
    <path d="M-290 0 H 290" stroke="#0a1230" stroke-opacity="0.3" stroke-width="3" stroke-dasharray="10 10"/>
    <path class="vLin" d="M-290 0 C -200 0, -170 -80, -110 -80 S -20 0, 40 0 S 130 80, 190 80 S 260 0, 290 0" fill="none" stroke="#1d5f9a" stroke-width="7" stroke-linecap="round"/>
    <g transform="translate(-110 -112)">${pilula("CRISTA", "#e8edf5", 22)}</g><g transform="translate(190 118)">${pilula("VALE · CHEGA ANTES", C.amarelo, 22)}</g>
    ${setaClean(250, -100, 300, -100, "#0a1230", 5)}<text class="rotm" x="200" y="-92" text-anchor="end" font-size="22" fill="#0a1230" opacity="0.6">praia</text>`;
  const peixes = [[390, 0], [450, 1], [640, 2], [520, 3], [600, 4]];
  el.innerHTML = `<g class="cam">
      <rect x="-200" y="-200" width="1480" height="2400" fill="url(#ceuDia)"/>
      <path d="${perfil} L 1280 1900 L -200 1900 Z" fill="url(#areia)"/>
      <path class="mar" d="" fill="url(#marA)"/><path class="borda" d="" fill="none" stroke="#fff" stroke-width="4" opacity="0.85"/>
      <path class="cristaLonge" d="" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0"/>
      <path d="${perfil}" fill="none" stroke="#bfa77d" stroke-width="3"/>
      <path class="molhada" d="" fill="none" stroke="#b49c72" stroke-width="16" stroke-linecap="round" opacity="0.7"/>
      <g transform="translate(900 ${chao(900) + 8})">${objeto("casa-obj", 170)}</g><g transform="translate(1040 ${chao(1040) + 8})">${objeto("palmeira-obj", 140)}</g>
      <g class="barcoW"><g class="barco">${objeto("barco-obj", 210, { afunda: 30 })}</g></g>
      ${peixes.map(([x, k]) => `<g transform="translate(${x} ${chao(x) + 10})"><g class="peixe" data-k="${k}">${objeto("peixe-obj", 90, { ancora: "centro" })}</g></g>`).join("")}
      <g class="medR">${medida(XA0, chao(XA0) - 40, XA1, chao(XA1) - 40, "0 m", { pil: C.amarelo, tam: 30, cls: "medR", dy: -50 })}</g>
      <g class="rotaFuga">${setaClean(740, 960, 1000, 790, C.vermelho, 10)}</g></g>
    ${velas(0.55)}
    <g transform="translate(540 460)"><g class="cProm">${cartao("O sinal que eu prometi", { tam: 42 })}</g></g>
    <g transform="translate(540 460)"><g class="cRec">${cartao("O mar recua", { tam: 48, sub: "às vezes centenas de metros" })}</g></g>
    <g transform="translate(540 1300)"><g class="pPeixe">${pilula("PEIXES NO SECO", C.rosa, 32)}</g></g>
    <g transform="translate(540 500)"><g class="cVale">${vale}</g></g>
    <g transform="translate(540 520)"><g class="cCorra">${cartao("CORRA PARA O ALTO", { tam: 54, cor: C.vermelho })}</g></g>
    <g transform="translate(540 1290)"><g class="cMin">${cartao("05:00", { tam: 56, larg: 360, sub: "você tem poucos minutos", cor: C.vermelho })}</g></g>`;
  const mar = $(".mar", el), borda = $(".borda", el), molh = $(".molhada", el), barcoW = $(".barcoW", el), crista = $(".cristaLonge", el), pxs = $$(".peixe", el);
  aCadaQuadro((t) => {
    if (t < c.ini - 1 || t > c.fim + 0.6) return;
    const n = nivel(t), xa = xAgua(t);
    // água: da superfície (nível n, com marola) até o fundo inclinado, só onde o fundo está abaixo dela
    const cu = _lim((t - tv - 0.4) / 1.5); // a crista (o tsunami) aparece lá longe depois do vale
    const yS = (x) => n + 4 * Math.sin(x / 40 + t * 2.4) - cu * 40 * _g(x, -260 + (t - tv) * 30, 220);
    let d = ""; for (let x = -200; x <= xa; x += 10) d += `${x === -200 ? "M" : "L"}${x} ${Math.min(yS(x), chao(x)).toFixed(1)} `;
    let fundo = ""; for (let x = xa; x >= -200; x -= 10) fundo += `L${x} ${chao(x).toFixed(1)} `;
    mar.setAttribute("d", d + fundo + "Z");
    borda.setAttribute("d", d);
    // faixa de areia molhada na parte que ficou descoberta; o barco boia e depois deita na areia
    molh.setAttribute("d", xa < XA0 - 4 ? `M${xa} ${(chao(xa) + 6).toFixed(1)} L ${XA0} ${(chao(XA0) + 6).toFixed(1)}` : "");
    const bx = 560, by = Math.min(chao(bx), n + 4 * Math.sin(bx / 40 + t * 2.4));
    barcoW.setAttribute("transform", `translate(${bx} ${by.toFixed(1)}) rotate(${(by >= chao(bx) - 1 ? 0 : 3 * Math.sin(t * 1.6)).toFixed(2)})`);
    let cr = ""; for (let x = -200; x <= Math.min(xa, 200); x += 10) cr += `${cr ? "L" : "M"}${x} ${(yS(x) - 3).toFixed(1)} `;
    crista.setAttribute("d", cr); crista.setAttribute("opacity", (cu * 0.9).toFixed(2));
    // peixes se debatendo na areia (só depois que a água passa por eles)
    pxs.forEach((p, k) => {
      const viv = t > ts - 0.4 + k * 0.1 ? 1 : 0;
      p.setAttribute("transform", viv ? `translate(0 ${(-14 * Math.abs(Math.sin(t * 5 + k * 1.3))).toFixed(1)}) rotate(${(22 * Math.sin(t * 9 + k * 2)).toFixed(1)})` : "");
      p.setAttribute("opacity", viv);
    });
  });
  entrar($(".cProm", el), tpm - 0.1, "baixo"); sair($(".cProm", el), trc - 0.3, "cima");
  entrar($(".cRec", el), trc, "escala"); sair($(".cRec", el), tv - 0.4, "cima");
  tl.fromTo($(".barco", el), { rotation: 0 }, { rotation: 14, duration: 1.2, ease: "power2.out", transformOrigin: "50% 100%", immediateRender: false }, tes);
  tl.set($(".medR", el), { opacity: 0 }, 0); tl.set($(".medR", el), { opacity: 1 }, tes); desenhar($(".medR .medidaL", el), tes, 0.6);
  contador($(".medR text", el), 0, 300, tce - 0.1, 0.9, (v) => Math.round(v) + " m");
  sair($(".medR", el), tv - 0.3);
  entrar($(".pPeixe", el), ts - 0.2, "escala"); sair($(".pPeixe", el), tv - 0.3);
  entrar($(".cVale", el), tv - 0.1, "escala"); desenhar($(".vLin", el), tv, 0.9); sair($(".cVale", el), tc - 0.3, "cima");
  tl.set($(".rotaFuga", el), { opacity: 0 }, 0); tl.set($(".rotaFuga", el), { opacity: 1 }, tc); desenhar($$(".rotaFuga path", el), tc, 0.6);
  entrar($(".cCorra", el), tc, "mola");
  tl.fromTo($(".cCorra", el), { scale: 1 }, { scale: 1.05, duration: 0.3, yoyo: true, repeat: 7, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tc + 0.5);
  entrar($(".cMin", el), tm - 0.5, "baixo");
  const tTxt = $(".cMin text.rot", el);
  aCadaQuadro((t) => { if (t < tm - 0.6 || t > c.fim + 0.6) return; const s = Math.max(0, 300 - Math.max(0, t - tm + 0.5) * 6); tTxt.textContent = `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`; });
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.05, 560, 960], [ts - 0.3, 1.0, 540, 960], [ts + 0.5, 1.15, 520, 1000], [tv - 0.3, 1.0, 540, 940], [tc - 0.2, 1.0, 540, 940], [c.fim + 0.5, 1.1, 760, 900]], c.fim);
};

// =============== 7. alerta: sensor (zoom que revela detalhes), boia, satélite, torre ===============
CENAS.alerta = (el, c, B) => {
  const tvg = B("vigia", 0.1), tse = B("sensor", 0.25), tcm = B("cm", 0.4), tb = B("boia", 0.55), tsat = B("sat", 0.7), tco = B("costa", 0.85);
  const SUP = 560, FUN = 1250, SX = 360, SW = 130;
  const [sw, sh] = (window.IMG || {})["sensor-obj"] || [563, 752], SH = SW * sh / sw, SY = FUN - SH * 0.55;
  const mt = (x, y, tx, anc) => `<text class="rotm" x="${x}" y="${y}" font-size="9" fill="#fff" text-anchor="${anc || "middle"}">${tx}</text>`;
  const micro = `<g class="micro" opacity="0" filter="url(#sombraTexto)">
    <path d="M${SX - 40} ${SY} H ${SX - 76} M${SX + 40} ${SY} H ${SX + 76} M${SX + 30} ${FUN - 6} H ${SX + 70}" stroke="#fff" stroke-width="1.2" fill="none"/>
    ${mt(SX - 80, SY - 3, "PROFUNDIDADE", "end")}${mt(SX - 80, SY + 9, "4.000 m", "end")}
    ${mt(SX + 80, SY - 3, "MEDE A PRESSÃO", "start")}${mt(SX + 80, SY + 9, "A CADA 15 s", "start")}
    ${mt(SX + 74, FUN - 3, "BASE NO FUNDO", "start")}
    <rect x="${SX - 46}" y="${FUN - SH - 34}" width="92" height="20" rx="10" fill="${C.amarelo}"/>
    <text class="rot microP" x="${SX}" y="${FUN - SH - 20}" font-size="11" fill="#0a1230" text-anchor="middle">4.012,30 dbar</text></g>`;
  el.innerHTML = `<g class="cam">
      <rect x="-200" y="-200" width="1480" height="${SUP + 200}" fill="url(#ceuDia)"/>
      <path class="agua" d="" fill="url(#fundoMar)"/><path class="sup" d="" fill="none" stroke="#fff" stroke-width="5"/>
      <g>${[0, 1, 2, 3].map((k) => `<path d="M${100 + k * 230} ${SUP} l ${-40 + k * 12} 700 h 60 l ${30 - k * 10} -700 Z" fill="#fff" opacity="0.05"/>`).join("")}</g>
      <path d="M-200 ${FUN} Q 400 ${FUN - 20} 820 ${FUN - 10} L 900 ${SUP + 20} L 1280 ${SUP - 30} L 1280 2200 L -200 2200 Z" fill="url(#areia)"/>
      <path d="M-200 ${FUN} Q 400 ${FUN - 20} 820 ${FUN - 10} L 900 ${SUP + 20} L 1280 ${SUP - 30}" fill="none" stroke="#bfa77d" stroke-width="3"/>
      <path class="cabo" d="" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="6 8" opacity="0.5"/>
      <g transform="translate(${SX} ${FUN + 8})">${objeto("sensor-obj", SW)}</g>${micro}
      <g class="ondasAc">${[0, 1, 2].map(() => `<path class="ac" d="M${SX - 60} 0 Q ${SX} -30 ${SX + 60} 0" fill="none" stroke="${C.amarelo}" stroke-width="4" stroke-linecap="round" opacity="0"/>`).join("")}</g>
      <g class="boiaW">${objeto("boia-obj", 120, { afunda: 70 })}</g>
      <g transform="translate(1010 ${SUP + 8})"><g class="torre">${objeto("torre-obj", 110)}<g class="sirene">${[0, 1, 2].map((k) => `<circle class="sr" cy="-365" r="30" fill="none" stroke="${C.vermelho}" stroke-width="4" opacity="0"/>`).join("")}</g></g></g>
      <g class="satW">${objeto("satelite-obj", 300, { ancora: "centro" })}</g>
      <path class="feixe1" d="" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="12 10" stroke-linecap="round"/>
      <path class="feixe2" d="" fill="none" stroke="${C.vermelho}" stroke-width="4" stroke-dasharray="12 10" stroke-linecap="round"/>
      <g class="pSenW"><g class="pSen">${marcador("SENSOR DE PRESSÃO", 150)}</g></g>
      <g class="pBoiaW"><g class="pBoia">${marcador("BOIA", 120)}</g></g></g>
    ${velas(0.5)}
    <g transform="translate(540 440)"><g class="cVig">${cartao("Os oceanos são vigiados", { tam: 42 })}</g></g>
    <g transform="translate(540 440)"><g class="cCm">${cartao("+3 cm no nível do mar", { tam: 40, sub: "a pressão no fundo denuncia", cor: C.rosa })}</g></g>
    <g transform="translate(540 1300)"><g class="cAl">${cartao("ALERTA DE TSUNAMI", { tam: 44, sub: "chega à costa antes da onda", cor: C.vermelho })}</g></g>`;
  const agua = $(".agua", el), sup = $(".sup", el), boia = $(".boiaW", el), cabo = $(".cabo", el), sat = $(".satW", el), f1 = $(".feixe1", el), f2 = $(".feixe2", el), pBW = $(".pBoiaW", el);
  const supY = (x, t) => SUP + 6 * Math.sin(x / 55 + t * 1.8);
  const satPos = (t) => [820 - (t - c.ini) * 14, 300 + 10 * Math.sin(t * 0.7)];
  aCadaQuadro((t) => {
    if (t < c.ini - 1 || t > c.fim + 0.6) return;
    let d = ""; for (let x = -200; x <= 1280; x += 10) d += `${x === -200 ? "M" : "L"}${x} ${supY(x, t).toFixed(1)} `;
    sup.setAttribute("d", d); agua.setAttribute("d", d + `L 1280 2200 L -200 2200 Z`);
    const by = supY(SX, t), inc = Math.atan2(supY(SX + 30, t) - supY(SX - 30, t), 60) * 57.3;
    boia.setAttribute("transform", `translate(${SX} ${by.toFixed(1)}) rotate(${inc.toFixed(2)})`);
    pBW.setAttribute("transform", `translate(${SX + 40} ${(by - 130).toFixed(1)})`);
    cabo.setAttribute("d", `M${SX} ${FUN - SH} Q ${SX + 30} ${(FUN + by) / 2} ${SX} ${(by + 10).toFixed(1)}`);
    const [sx, sy] = satPos(t);
    sat.setAttribute("transform", `translate(${sx.toFixed(1)} ${sy.toFixed(1)}) rotate(-8)`);
    f1.setAttribute("d", `M${SX} ${(by - 170).toFixed(1)} L ${sx.toFixed(1)} ${(sy + 20).toFixed(1)}`);
    f2.setAttribute("d", `M${sx.toFixed(1)} ${(sy + 20).toFixed(1)} L 1010 ${SUP - 350}`);
  });
  $(".pSenW", el).setAttribute("transform", `translate(${SX + 30} ${FUN - SH})`);
  entrar($(".cVig", el), tvg - 0.1, "cima"); sair($(".cVig", el), tse + 0.2, "cima");
  entrar($(".pSen", el), tse - 0.1, "escala");
  // mergulho no sensor: os detalhes aparecem perto de 3× e o marcador some antes
  const tz0 = tse + 0.7, tz1 = tcm + 0.6;
  tl.to($(".pSen", el), { opacity: 0, duration: 0.25 }, tz0 - 0.1);
  tl.to($(".micro", el), { opacity: 1, duration: 0.35 }, tz0 + 0.7);
  tl.to($(".micro", el), { opacity: 0, duration: 0.25 }, tz1);
  contador($(".microP", el), 4012.30, 4012.33, tcm - 0.3, 0.8, (v) => v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " dbar");
  entrar($(".cCm", el), tcm - 0.1, "cima"); sair($(".cCm", el), tb - 0.4, "cima");
  // ondas acústicas sobem do sensor até a boia
  $$(".ac", el).forEach((a, q) => tl.fromTo(a, { y: FUN - SH, opacity: 0.9 }, { y: SUP + 60, opacity: 0, duration: 1.0, repeat: 1, ease: "none", immediateRender: false }, tb - 0.2 + q * 0.3));
  entrar($(".pBoia", el), tb, "escala"); sair($(".pBoia", el), tco - 0.2);
  tl.set([f1, f2], { opacity: 0 }, 0);
  tl.set(f1, { opacity: 1 }, tsat - 0.2); desenhar(f1, tsat - 0.2, 0.6);
  tl.set(f2, { opacity: 1 }, tco - 0.2); desenhar(f2, tco - 0.2, 0.6);
  $$(".sr", el).forEach((s, q) => tl.fromTo(s, { attr: { r: 20 }, opacity: 0.9 }, { attr: { r: 120 }, opacity: 0, duration: 0.9, repeat: 2, ease: "none", immediateRender: false }, tco + 0.2 + q * 0.3));
  entrar($(".cAl", el), tco + 0.3, "mola");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.0, 540, 900], [tz0, 1.0, 540, 900], [tz0 + 1.0, 3.0, SX, FUN - SH * 0.6], [tz1, 3.0, SX, FUN - SH * 0.6], [tb - 0.1, 1.15, 460, 760], [tsat - 0.3, 1.15, 460, 760], [tsat + 0.6, 1.0, 600, 720], [c.fim + 0.5, 1.02, 640, 720]], c.fim);
};

// =============== 8. resumo: os 4 passos e de volta ao navio ===============
CENAS.resumo = (el, c, B, i, f) => {
  const tp = ["passo1", "passo2", "passo3", "passo4"].map((p, k) => B(p, 0.2 + k * 0.12)), tn = B("navioF", 0.75), tcta = B("cta", 0.8);
  const passos = ["Um terremoto levanta o fundo do mar", "A onda nasce longa e baixa", "Corre quase como um avião", "Perto da costa vira parede"];
  const M = marAberto(el, c, {});
  el.innerHTML = `<g class="cam">${M.html}</g>
    <rect class="escuro" x="-200" y="-200" width="1480" height="2320" fill="#0a1230" opacity="0.45"/>${velas()}
    ${passos.map((p, k) => `<g transform="translate(540 ${470 + k * 175})"><g class="passo">${cartao(p, { tam: 38, larg: 900, barra: false })}
      <g transform="translate(-390 0)"><circle r="32" fill="${C.amarelo}"/><text class="rot" y="13" text-anchor="middle" font-size="36" fill="#0a1230">${k + 1}</text></g></g></g>`).join("")}
    <g transform="translate(540 760)"><g class="pNing">${pilula("E NINGUÉM A BORDO PERCEBE", "#fff", 32)}</g></g>`;
  M.iniciar((x, t) => (t < tn - 1 ? 0 : 30 * _g(x, -500 + (t - tn + 0.6) * 230, 330)));
  $$(".passo", el).forEach((p, k) => { entrar(p, tp[k] - 0.15, "esq"); sair(p, tn - 0.5 + k * 0.05, "esq"); });
  tl.to($(".escuro", el), { opacity: 0, duration: 0.6 }, tn - 0.4);
  entrar($(".pNing", el), tn, "escala"); sair($(".pNing", el), tcta - 0.3);
  tl.to($(".escuro", el), { opacity: 0.88, duration: 0.5 }, tcta - 0.3);
  cartaoFinal(f, tcta);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.0, 540, 1000], [tn - 0.6, 1.05, 540, 1010], [tn + 0.8, 1.35, 520, 1110], [c.fim + 0.5, 1.4, 520, 1110]], c.fim);
};
