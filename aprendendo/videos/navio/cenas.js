// Cenas do vídeo "Como um navio de aço não afunda".
// Cada função CENAS.<tipo>(el, c, B) desenha e anima uma cena do roteiro.
// Usa a identidade (aprendendo/identidade) e a biblioteca comum (aprendendo/motor/biblioteca.js).

// ---------- desenhos deste vídeo ----------
$("#defs").insertAdjacentHTML("beforeend", `
  <linearGradient id="marPor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a5fb0"/><stop offset="0.25" stop-color="#3b3f8f"/><stop offset="1" stop-color="#0d1640"/></linearGradient>
  <linearGradient id="marDia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4cc9f0"/><stop offset="0.3" stop-color="#2178d6"/><stop offset="1" stop-color="#0d2f7a"/></linearGradient>
  <linearGradient id="marNoite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a4aa8"/><stop offset="0.35" stop-color="#15276a"/><stop offset="1" stop-color="#070d2a"/></linearGradient>
  <linearGradient id="fundoMar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2fa6e8"/><stop offset="0.45" stop-color="#1557b0"/><stop offset="1" stop-color="#081a52"/></linearGradient>
  <linearGradient id="cascoG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.6" stop-color="#e6eaf7"/><stop offset="1" stop-color="#aab4d6"/></linearGradient>
  <linearGradient id="fundoCasco" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d0475f"/><stop offset="1" stop-color="#8a2440"/></linearGradient>
  <linearGradient id="subG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c7cde6"/><stop offset="0.5" stop-color="#7b86a8"/><stop offset="1" stop-color="#3b4377"/></linearGradient>
  <linearGradient id="areia" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9b77a"/><stop offset="1" stop-color="#7a5a3a"/></linearGradient>
  <linearGradient id="piscinaA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe0ff"/><stop offset="0.25" stop-color="#36b3ee"/><stop offset="1" stop-color="#1366c4"/></linearGradient>
  <linearGradient id="pedra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a8fb0"/><stop offset="1" stop-color="#4f4668"/></linearGradient>
  <linearGradient id="pisoG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a6488"/><stop offset="1" stop-color="#2e2440"/></linearGradient>
  <linearGradient id="fadeRefl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="0.42"/><stop offset="0.45" stop-color="#fff" stop-opacity="0.12"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
  <radialGradient id="massaG" cx="0.35" cy="0.3"><stop offset="0" stop-color="#ffc2a0"/><stop offset="0.5" stop-color="#ff8a3d"/><stop offset="1" stop-color="#c2531c"/></radialGradient>
  <radialGradient id="luzSala" cx="0.5" cy="0.2"><stop offset="0" stop-color="#fff1c0"/><stop offset="1" stop-color="#e0a83a"/></radialGradient>`);

// navio de cruzeiro visto de lado (proa para a direita); linha d'água em y=0, ~1050 de comprimento.
// o.calado: quanto do casco fica abaixo da linha d'água; o.noite: janelas acesas; o.raiox: interior com compartimentos
const navio = (o) => {
  o = o || {};
  const d = o.calado ?? 40, noite = o.noite;
  const bx = (y) => 548 - ((y + 130) * 48) / (d + 130); // borda da proa (inclinada)
  const vid = noite ? "#ffd98a" : "#2a3566";
  const decks = [[-380, 280, -316, -274], [-430, 360, -274, -228], [-460, 420, -228, -180], [-480, 470, -180, -130]];
  const janelas = (x0, x1, y) => { let s = ""; for (let x = x0 + 16; x < x1 - 22; x += 22) s += `<rect x="${x}" y="${y}" width="14" height="16" rx="3" fill="${vid}" opacity="${noite ? (0.5 + ((x * 7) % 5) * 0.1).toFixed(2) : 0.9}"/>`; return s; };
  const comp = [-495, -380, -260, -140, -20, 100, 220, 340];
  return `
    <path d="M110 -316 C 130 -384, 210 -394, 222 -346 S 270 -300, 284 -316" fill="none" stroke="${C.rosa}" stroke-width="12" stroke-linecap="round"/>
    <path d="M-334 -316 L -306 -414 H -206 L -190 -316 Z" fill="url(#caudaN)"/><path d="M-310 -400 H -204 L -201 -386 H -314 Z" fill="${C.amarelo}"/><rect x="-300" y="-424" width="86" height="12" rx="4" fill="#1b2556"/>
    <rect x="300" y="-372" width="7" height="58" fill="#c7cde6"/><circle cx="303" cy="-376" r="6" fill="${noite ? C.amarelo : "#fff"}"/>
    ${decks.map(([x0, x1, y0, y1]) => `<rect x="${x0}" y="${y0}" width="${x1 - x0}" height="${y1 - y0}" fill="url(#cascoG)"/><rect x="${x0}" y="${y1 - 4}" width="${x1 - x0}" height="4" fill="#9aa7c7"/>${janelas(x0, x1, y0 + 12)}`).join("")}
    <rect x="200" y="-306" width="80" height="16" rx="3" fill="#1b2556"/>
    ${Array.from({ length: 10 }, (_, k) => `<ellipse cx="${-410 + k * 88}" cy="-138" rx="28" ry="9" fill="${C.laranja}"/>`).join("")}
    <path class="cascoSup" d="M-505 -130 H 548 L ${bx(-24).toFixed(1)} -24 H -505 Z" fill="url(#cascoG)"/>
    <rect x="-505" y="-52" width="${(bx(-52) - 4 + 505).toFixed(1)}" height="9" fill="${C.azul}"/>
    ${Array.from({ length: 30 }, (_, k) => `<circle cx="${-470 + k * 32}" cy="-92" r="5" fill="${vid}" opacity="0.8"/>`).join("")}
    <path d="M-505 -24 H ${bx(-24).toFixed(1)} L ${bx(0).toFixed(1)} 0 H -505 Z" fill="#1b2556"/>
    <path class="fundoN" d="M-505 0 H ${bx(0).toFixed(1)} L 500 ${d} H -470 Q -500 ${d - 6} -505 0 Z" fill="url(#fundoCasco)"/>
    <g transform="translate(150 -12)"><circle r="9" fill="none" stroke="#fff" stroke-width="3"/><path d="M-16 0 H 16" stroke="#fff" stroke-width="3"/></g>
    ${o.raiox ? `<g class="raiox" opacity="0">
      <path d="M-490 -112 H ${(bx(-112) - 16).toFixed(1)} L ${(bx(d - 10) - 16).toFixed(1)} ${d - 10} H -466 Q -488 ${d - 16} -490 -100 Z" fill="#0b1440" opacity="0.93"/>
      <rect class="cheio inunda2" x="102" y="${d - 10}" width="116" height="0" fill="${C.azul}" opacity="0.9"/>
      <rect class="cheio inunda3" x="-18" y="${d - 10}" width="116" height="0" fill="${C.azul}" opacity="0.9"/>
      <rect class="cheio inunda" x="222" y="${d - 10}" width="116" height="0" fill="${C.azul}" opacity="0.9"/>
      ${comp.slice(1).map((x) => `<path class="antepara" d="M${x} -112 V ${d - 10}" stroke="#8fe3ff" stroke-width="6"/>`).join("")}
      <path class="convesF" d="M-490 -112 H ${(bx(-112) - 16).toFixed(1)}" stroke="#8fe3ff" stroke-width="5"/>
      <g transform="translate(300 ${d - 34})"><g class="furo"><circle r="13" fill="#0b1440" stroke="${C.vermelho}" stroke-width="5"/></g></g></g>` : ""}`;
};
$("#defs").insertAdjacentHTML("beforeend", `<linearGradient id="caudaN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4cc9f0"/><stop offset="1" stop-color="#1f5fbf"/></linearGradient>`);

// barquinho de massinha (corte em U), centro em 0,0
const BOLA_D = "M-44 0 C -44 -24, -24 -44, 0 -44 C 24 -44, 44 -24, 44 0 C 44 24, 24 44, 0 44 C -24 44, -44 24, -44 0 Z";
const BARCO_D = "M-140 -50 L -116 -50 L -92 20 L 92 20 L 116 -50 L 140 -50 L 108 50 L -108 50 Z";
const BARCO_AR = "M-116 -50 L 116 -50 L 92 20 L -92 20 Z";

// gaivota (asas em M), animada pelo .gvA
const gaivota = () => `<path d="M-34 0 Q -17 -18 0 0 Q 17 -18 34 0" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
function gaivotas(pai, lista, t, fim) {
  pai.insertAdjacentHTML("beforeend", lista.map(([x, y, s]) => P(x, y, s, "gv", `<g class="gvA">${gaivota()}</g>`)).join(""));
  $$(".gv", pai).forEach((g, k) => tl.fromTo(g, { x: 0, y: 0 }, { x: lista[k][3], y: -30 + k * 14, duration: Math.max(0.5, fim - t), ease: "none", immediateRender: false }, t));
  $$(".gvA", pai).forEach((g, k) => tl.fromTo(g, { scaleY: 1 }, { scaleY: 0.25, duration: 0.3 + k * 0.04, yoyo: true, repeat: Math.max(1, Math.floor((fim - t) / (0.3 + k * 0.04))), ease: "sine.inOut", transformOrigin: "50% 100%", immediateRender: false }, t));
}
// reflexos na superfície da água (traços claros que vão e voltam)
const reflexos = (y0, y1, n, seed, cor, cls) => { const r = prng(seed); let s = ""; for (let i = 0; i < n; i++) { const y = y0 + r() * (y1 - y0), w = 30 + r() * 90 * (1 + (y - y0) / (y1 - y0 + 1)); s += `<rect x="${(r() * W).toFixed(0)}" y="${y.toFixed(0)}" width="${w.toFixed(0)}" height="${(3 + r() * 4).toFixed(1)}" rx="3" fill="${cor || "#fff"}" opacity="${(0.15 + r() * 0.35).toFixed(2)}"/>`; } return `<g class="${cls || "refl"}">${s}</g>`; };
const animarReflexos = (g, t, fim) => tl.fromTo(g, { x: -30 }, { x: 30, duration: 2.2, yoyo: true, repeat: Math.max(1, Math.floor((fim - t) / 2.2)), ease: "sine.inOut", immediateRender: false }, t);

// parafuso (centro em 0,0)
const parafuso = () => `<rect x="-26" y="-46" width="52" height="20" rx="4" fill="url(#metal)"/><rect x="-11" y="-28" width="22" height="78" fill="url(#metalH)"/>
  ${[0, 1, 2, 3, 4, 5].map((k) => `<path d="M-13 ${-20 + k * 12} L 13 ${-14 + k * 12}" stroke="#5d6890" stroke-width="3"/>`).join("")}<path d="M-11 50 L 0 62 L 11 50 Z" fill="#7b86a8"/>`;


// ======================================================================================
// Estilo HOLOGRAMA / HUD: o mundo de cada cena fica em <g class="cam"> (câmera em fases);
// objetos em linhas neon (.holo*), rótulos de interface (tag) fora da câmera.
// ======================================================================================
// esfera em wireframe (meridianos e paralelos), raio r
const esfera = (r) => `<circle r="${r}" class="cheio" style="fill-opacity:0.6"/>${[0.35, 0.7].map((k) => `<ellipse rx="${(r * k).toFixed(1)}" ry="${r}"/>`).join("")}
  ${[-0.5, 0, 0.5].map((k) => `<ellipse cy="${(r * k).toFixed(1)}" rx="${(r * Math.sqrt(1 - k * k)).toFixed(1)}" ry="${(r * 0.18 * Math.sqrt(1 - k * k)).toFixed(1)}"/>`).join("")}<circle r="${r}" class="vazio"/>`;
// =============== 1. gancho: o navio escaneado em holograma ===============
CENAS.porto = (el, c, B) => {
  mostrarGancho(B("titulo", 0.85) - 0.2);
  const MAR = 1040, SN = 0.86;
  el.innerHTML = `<g class="cam">${cenarioHud({ horizonte: MAR, agua: true, fuga: 600 })}
    <g class="cidade holo" opacity="0.35">${Array.from({ length: 22 }, (_, k) => `<rect x="${-180 + k * 64}" y="${MAR - 20 - ((k * 53) % 90)}" width="${36 + (k % 3) * 10}" height="${20 + ((k * 53) % 90)}"/>`).join("")}</g>
    <g class="reflW" opacity="0.22"><g transform="translate(610 ${MAR})"><g class="navRefl"><g transform="scale(${SN} ${-SN})"><g class="reflB holo">${navio()}</g></g></g></g></g>
    <g class="cristas"></g><g class="cintP"></g>
    <g class="navW"><g transform="translate(610 ${MAR}) scale(${SN})"><g class="navio"><g class="navioB"><g class="navHolo holo">${navio()}</g>
      <g class="cotaN">${cota(-505, -470, 548, -470, "≈ 360 m", C.ciano)}</g>
      <g transform="translate(300 -6)"><g class="furoP"><g transform="scale(0.7)">${mira(30)}</g></g></g></g></g></g></g>
    <g class="respingo" opacity="0">${[0, 1, 2].map((k) => `<ellipse class="onda" cx="600" cy="1324" rx="${40 + k * 34}" ry="${9 + k * 7}" fill="none" stroke="${C.ciano}" stroke-width="3"/>`).join("")}</g>
    <path class="trajeto" d="" fill="none" stroke="${C.amarelo}" stroke-width="3" stroke-dasharray="4 12" opacity="0.8"/>
    ${[0.18, 0.36].map((o) => `<g class="pfFant" opacity="0"><g opacity="${o}"><g class="holo-am">${parafuso()}</g></g></g>`).join("")}<g class="pfG" opacity="0"><g class="holo-am">${parafuso()}</g></g>
    <g class="gotas"></g>
    <g transform="translate(600 1250)"><g class="tAfu">${tag("AFUNDA", C.vermelho, 28)}</g></g></g>
    <g transform="translate(640 1150)"><g class="peso">${numeroHud("cont", 100, C.ciano, "+0")}<g transform="translate(0 64)">${tag("TONELADAS", C.ciano, 28)}</g></g></g>
    <g transform="translate(600 1180)"><g class="tAco">${tag("MATERIAL: AÇO", C.ciano, 34, "DENSIDADE 7.850 kg/m³")}</g></g>
    <g transform="translate(560 1180)"><g class="tProm">${tag("NO FINAL: E SE O CASCO FURAR?", C.amarelo, 30)}</g></g>
    <g transform="translate(900 610)"><g class="perg">${hexPergunta(64)}</g></g>`;
  ondas($(".cristas", el), MAR + 14, 1420, 12, c.ini, c.fim, C.ciano, 3);
  cintilar($(".cintP", el), 18, [0, MAR + 10, W, 360], c.ini, c.fim, "#8fe3ff", 6);
  ondular($(".reflW", el));
  const nav = $(".navio", el), refl = $(".navRefl", el), peso = $(".peso", el);
  tl.fromTo([nav, refl], { x: -110 }, { x: 50, duration: c.fim - c.ini, ease: "none", immediateRender: false }, c.ini);
  boiar($(".navioB", el), c.ini, c.fim, 7);
  boiar($(".reflB", el), c.ini, c.fim, 7);
  // o navio "aparece" numa varredura de scanner
  varredura($(".navHolo", el), -520, -460, 1100, 520, c.ini + 0.05, 1.3);
  const tp = B("peso", 0.2), ta = B("aco", 0.35), tf = B("parafuso", 0.5), tq = B("pergunta", 0.7), tpr = B("promessa", 0.85), tfu = B("titulo", 0.95);
  tl.set([$(".furoP", el), $(".cotaN", el)], { opacity: 0 }, 0);
  // medida do navio + contador que cresce até 100.000 junto com a fala
  tl.set($(".cotaN", el), { opacity: 1 }, tp - 0.9);
  desenhar($(".cotaL", el), tp - 0.9, 0.7);
  const tc0 = tp - 0.75, dc = 1.15;
  entrar(peso, tc0, "escala");
  contador($(".cont", el), 0, 100000, tc0, dc, (v) => "+" + (Math.round(v / 1000) * 1000).toLocaleString("pt-BR"));
  sair(peso, ta - 0.3);
  entrar($(".tAco", el), ta - 0.05, "esq");
  reflexoPassando($(".tAco", el), "MATERIAL: AÇO", 34, ta + 0.35);
  tl.to($(".navHolo", el), { opacity: 0.55, duration: 0.15, yoyo: true, repeat: 3 }, ta);
  sair($(".tAco", el), tf - 0.45, "dir");
  tl.to($(".cotaN", el), { opacity: 0, duration: 0.3 }, tf - 0.5);
  // o parafuso cai em trajetória balística, com rastro e linha de trajetória; espirra e some
  const tA = tf - 0.2, tL = tf + 0.1, D = 0.85, P0 = [520, 640], P1 = [600, 1322], VY = -260, G = 2 * (P1[1] - P0[1] - VY * D) / (D * D);
  const pfG = $(".pfG", el), fant = $$(".pfFant", el);
  const posPf = (t) => { if (t < tL) return [P0[0], P0[1], 0]; const k = Math.min(t - tL, D); return [P0[0] + ((P1[0] - P0[0]) * k) / D, P0[1] + VY * k + 0.5 * G * k * k, 320 * k]; };
  $(".trajeto", el).setAttribute("d", "M" + Array.from({ length: 31 }, (_, i) => posPf(tL + (D * i) / 30).slice(0, 2).map((v) => v.toFixed(1)).join(" ")).join(" L "));
  tl.set($(".trajeto", el), { opacity: 0 }, 0);
  tl.set($(".trajeto", el), { opacity: 0.8 }, tL);
  desenhar($(".trajeto", el), tL, D);
  tl.to($(".trajeto", el), { opacity: 0, duration: 0.4 }, tL + D + 1.2);
  aCadaQuadro((t) => {
    if (t < tA || t > tL + D + 1) { pfG.setAttribute("opacity", 0); fant.forEach((f) => f.setAttribute("opacity", 0)); return; }
    const u = Math.min(1, (t - tA) / 0.3), cs = 1.7, s = 0.6 * (1 + (cs + 1) * Math.pow(u - 1, 3) + cs * Math.pow(u - 1, 2));
    const afunda = Math.min(1, Math.max(0, (t - tL - D) / 0.5)), [x, y, r] = posPf(t);
    pfG.setAttribute("transform", `translate(${x.toFixed(1)} ${(y + 40 * afunda).toFixed(1)}) rotate(${r.toFixed(1)}) scale(${(s * (1 - 0.4 * afunda)).toFixed(3)})`);
    pfG.setAttribute("opacity", (1 - afunda).toFixed(2));
    fant.forEach((f, i) => { const [fx, fy, fr] = posPf(t - 0.035 * (2 - i)); f.setAttribute("transform", `translate(${fx.toFixed(1)} ${fy.toFixed(1)}) rotate(${fr.toFixed(1)}) scale(0.6)`); f.setAttribute("opacity", t > tL && t < tL + D ? 1 : 0); });
  });
  const tsp = tL + D;
  tl.set($(".respingo", el), { opacity: 1 }, tsp);
  tl.fromTo($$(".onda", el), { scale: 0.3, opacity: 1, transformOrigin: "50% 50%" }, { scale: 1.5, opacity: 0, duration: 1.1, stagger: 0.12, ease: "expo.out", immediateRender: false }, tsp);
  respingo($(".gotas", el), 600, 1318, tsp, 22, { seed: 1, cores: ["#8fe3ff", "#dff6ff"] });
  entrar($(".tAfu", el), tsp + 0.2, "baixo");
  sair($(".tAfu", el), tq - 0.6, "baixo");
  // a pergunta
  entrar($(".perg", el), tq, "mola");
  tl.fromTo($(".perg", el), { rotation: -6 }, { rotation: 6, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tq + 0.5);
  // promessa (loop aberto): mira vermelha travando no casco
  entrar($(".tProm", el), tpr - 0.05, "baixo");
  reflexoPassando($(".tProm", el), "NO FINAL: E SE O CASCO FURAR?", 30, tpr + 0.6);
  tl.fromTo($(".furoP", el), { scale: 3, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.6, ease: "expo.out", immediateRender: false }, tfu - 0.3);
  girar($(".miraAnel", el), tfu - 0.3, c.fim + 0.5, 0.4);
  tl.fromTo($(".furoP", el), { opacity: 1 }, { opacity: 0.4, duration: 0.25, yoyo: true, repeat: 7, ease: "none", immediateRender: false }, tfu + 0.4);
  cameraFases($(".cam", el), [[0, 1.36, 750, 870], [tp - 0.7, 1.36, 740, 870], [tp + 0.7, 1.025, 540, 900], [tf - 0.8, 1.025, 540, 900], [tf + 0.3, 1.2, 520, 1060],
    [tq - 0.7, 1.2, 520, 1060], [tq + 0.3, 1.025, 540, 900], [tpr - 0.2, 1.025, 540, 900], [tfu + 0.6, 1.2, 640, 960], [c.fim + 1, 1.22, 645, 960]], c.fim);
  focoSeletivo($(".navW", el), [[tf - 0.8, tq - 0.2, 4]], c.fim);
};

// =============== 2. a esfera no tanque: empuxo ===============
CENAS.piscina = (el, c, B) => {
  const BORDA = 900, X0 = 140, X1 = 940, FUNDO = 1310, N0 = 944, R = 92, BY = N0 - 52;
  el.innerHTML = `<g class="cam">${cenarioHud({ horizonte: 860 })}
    <g class="tanque holo"><rect x="${X0 - 26}" y="${BORDA - 40}" width="${X1 - X0 + 52}" height="${FUNDO - BORDA + 66}" class="vazio"/><rect x="${X0}" y="${BORDA - 40}" width="${X1 - X0}" height="${FUNDO - BORDA + 40}" class="vazio"/>
      ${Array.from({ length: 9 }, (_, k) => `<path d="M${X0 - 26} ${BORDA - 40 + k * 52} h -24" class="vazio"/><text x="${X0 - 58}" y="${BORDA - 32 + k * 52}" font-size="15" class="monol" text-anchor="end">${(8 - k) * 10}</text>`).join("")}</g>
    <rect class="aguaT" x="${X0}" y="${N0}" width="${X1 - X0}" height="${FUNDO - N0}" fill="#4cc9f0" opacity="0.16"/>
    <g class="ondasT"></g>
    <g transform="translate(540 ${BY})"><g class="bola"><g class="bolaR holo-am">${esfera(R)}</g></g></g>
    <path class="sup" d="M${X0} ${N0} H ${X1}" stroke="#8fe3ff" stroke-width="4"/>
    <g class="transb" opacity="0">
      <path class="tbE" d="M${X0} ${BORDA - 40} H ${X0 - 130}" stroke="#8fe3ff" stroke-width="6" stroke-linecap="round"/>
      <path class="tbD" d="M${X1} ${BORDA - 40} H ${X1 + 130}" stroke="#8fe3ff" stroke-width="6" stroke-linecap="round"/>
      ${[X0 - 60, X0 - 110, X1 + 60, X1 + 110].map((x) => `<circle class="gota" cx="${x}" cy="${BORDA - 30}" r="6" fill="#8fe3ff"/>`).join("")}</g>
    <g transform="translate(540 ${BY - R - 230})"><g class="fForca">${flechaHud(200, C.vermelho, "", 180, "ffi")}</g></g>
    <g class="empA">${[440, 540, 640].map((x) => `<g transform="translate(${x} 1300)"><g class="fe">${flechaHud(110, C.ciano, "", 0, "fei")}</g></g>`).join("")}</g>
    <g transform="translate(860 1280)"><g class="fUp">${flechaHud(320, C.verde, "", 0, "fu")}</g></g>
    <g class="gotasPi"></g></g>
    <g transform="translate(700 470)"><g class="pNivel">${painelHud([["SENSOR", "NÍVEL"], ["ÁGUA", "+0,0 cm"]], C.ciano, 300)}</g></g>
    <g transform="translate(290 700)"><g class="tForca">${tag("TENTA AFUNDAR", C.vermelho, 30)}</g></g>
    <g transform="translate(540 760)"><g class="tVolta">${tag("A ÁGUA EMPURRA DE VOLTA", C.ciano, 30)}</g></g>
    <g transform="translate(800 820)"><g class="tEmpuxo">${tag("EMPUXO", C.verde, 46)}</g></g>`;
  ondas($(".ondasT", el), N0 + 40, FUNDO - 30, 6, c.ini, c.fim, "#8fe3ff", 23);
  const bola = $(".bola", el), bR = $(".bolaR", el), agua = $(".aguaT", el), sup = $(".sup", el), nivel = $$(".pNivel text", el)[3];
  const te = B("entra", 0.25), tt = B("transborda", 0.45), tm = B("empurrou", 0.6), tc = B("cima", 0.8), tx = B("empuxo", 0.92);
  tl.set([$(".fForca", el), ...$$(".fe", el)], { opacity: 0 }, 0);
  boiar(bola, c.ini, te, 8);
  girar(bR, c.ini, c.fim, 0.12, "0 0");
  // tenta afundar: força para baixo, nível sobe (sensor) e transborda
  tl.set($(".fForca", el), { opacity: 1 }, te - 0.2);
  animFlechaHud($(".ffi", el), te - 0.2);
  entrar($(".tForca", el), te - 0.15, "cima");
  entrar($(".pNivel", el), te - 0.1, "dir");
  contador(nivel, 0, 4, te + 0.3, 1.2, (v) => "+" + v.toFixed(1).replace(".", ",") + " cm");
  tl.to(bola, { y: 230, duration: 1.3, ease: "power2.inOut" }, te + 0.2);
  tl.to($(".fForca", el), { y: 230, duration: 1.3, ease: "power2.inOut" }, te + 0.2);
  tl.to(agua, { attr: { y: BORDA - 40, height: FUNDO - BORDA + 40 }, duration: 1.2, ease: "power2.inOut" }, te + 0.3);
  tl.to(sup, { attr: { d: `M${X0} ${BORDA - 40} H ${X1}` }, duration: 1.2, ease: "power2.inOut" }, te + 0.3);
  sair($(".tForca", el), tt - 0.4, "cima");
  tl.set($(".transb", el), { opacity: 1 }, tt - 0.1);
  desenhar([$(".tbE", el), $(".tbD", el)], tt - 0.1, 0.5);
  tl.fromTo($$(".gota", el), { y: 0, opacity: 1 }, { y: 120, opacity: 0, duration: 0.6, stagger: 0.12, repeat: 3, ease: "power1.in", immediateRender: false }, tt + 0.2);
  // a água empurra de volta
  $$(".fe", el).forEach((f, k) => { tl.set(f, { opacity: 1 }, tm + k * 0.1); animFlechaHud($(".fei", f), tm + k * 0.1); });
  entrar($(".tVolta", el), tm + 0.1, "escala");
  // solta: a esfera salta e volta a boiar; o nível volta
  sair($(".tVolta", el), tc - 0.35);
  sair($(".pNivel", el), tc - 0.2, "dir");
  tl.to([...$$(".fe", el), $(".fForca", el)], { opacity: 0, duration: 0.2 }, tc - 0.25);
  tl.to(bola, { y: -420, duration: 0.6, ease: "power2.out" }, tc);
  tl.to(agua, { attr: { y: N0, height: FUNDO - N0 }, duration: 0.7, ease: "power2.out" }, tc + 0.15);
  tl.to(sup, { attr: { d: `M${X0} ${N0} H ${X1}` }, duration: 0.7, ease: "power2.out" }, tc + 0.15);
  respingo($(".gotasPi", el), 540, BY - 40, tc + 0.12, 24, { seed: 2, forca: 1.1, cores: ["#8fe3ff", "#dff6ff"] });
  tl.to(bola, { y: 0, duration: 0.55, ease: "power2.in" }, tc + 0.6);
  respingo($(".gotasPi", el), 540, BY + 40, tc + 1.15, 16, { seed: 3, forca: 0.7, cores: ["#8fe3ff", "#dff6ff"] });
  boiar(bola, tc + 1.2, c.fim, 8);
  animFlechaHud($(".fu", el), tx - 0.1);
  entrar($(".tEmpuxo", el), tx, "escala");
  reflexoPassando($(".tEmpuxo", el), "EMPUXO", 46, tx + 0.6);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.025, 540, 900], [te - 0.3, 1.1, 540, 960], [te + 0.6, 1.2, 540, 1060], [tc - 0.2, 1.2, 540, 1060],
    [tc + 0.4, 1.0, 540, 880], [tx - 0.3, 1.0, 540, 880], [c.fim + 0.5, 1.08, 600, 960]], c.fim);
};

// =============== 3. a regra de Arquimedes: balança em holograma ===============
CENAS.arquimedes = (el, c, B) => {
  const PX = 660, PY = 640, L = 280, Q = 230;
  const prato = (cls, cont, txt, cor) => `<g transform="translate(${PX + (cls === "panE" ? -L : L)} ${PY})"><g class="${cls}">
      <path d="M0 0 L -110 ${Q} M0 0 L 110 ${Q}" stroke="#8fe3ff" stroke-width="2" stroke-dasharray="6 6"/>
      ${cont}
      <g class="holo"><path d="M-130 ${Q} H 130 Q 110 ${Q + 34} 0 ${Q + 34} Q -110 ${Q + 34} -130 ${Q} Z"/></g>
      <g transform="translate(0 ${Q + 90})">${tag(txt, cor, 22)}</g></g></g>`;
  el.innerHTML = `<g class="cam">${cenarioHud({ horizonte: 1036 })}
    <g class="templo holo" opacity="0.3"><g transform="translate(560 1036) scale(0.45)">${palacio(620, 400, "#e9d9c6", "ΣΥΡΑΚΟΥΣΑΙ", { mastro: false })}</g></g>
    <g transform="translate(300 1140)"><g class="papiro"><g class="papiroI" transform="translate(-150 -70)">${painelHud([["ARQUIVO", "250 a.C."], ["AUTOR", "ARQUIMEDES"], ["NOTA", "ΕΥΡΗΚΑ!"]], C.amarelo, 300)}</g></g></g>
    <g class="balanca"><g class="holo"><rect x="${PX - 9}" y="${PY}" width="18" height="${1300 - PY}"/><path d="M${PX - 90} 1330 H ${PX + 90} L ${PX + 60} 1290 H ${PX - 60} Z"/></g>
    <g class="viga holo"><rect x="${PX - L - 10}" y="${PY - 9}" width="${2 * L + 20}" height="18" class="cheio"/></g>
    <circle cx="${PX}" cy="${PY}" r="16" fill="#050b1e" stroke="${C.amarelo}" stroke-width="4"/>
    ${prato("panE", `<g transform="translate(0 ${Q - 60})"><g class="obj holo-lr"><rect x="-60" y="-60" width="120" height="120" class="cheio"/><path d="M-60 -60 L 60 60 M60 -60 L -60 60" class="vazio" stroke-dasharray="5 7"/></g></g>`, "PESO DO OBJETO", C.laranja)}
    ${prato("panD", `<g transform="translate(0 ${Q - 60})"><g class="holo"><rect x="-60" y="-60" width="120" height="120" class="cheio"/><path d="M-60 -40 q 15 -10 30 0 t 30 0 t 30 0 t 30 0" class="vazio"/></g></g>`, "PESO DA ÁGUA", C.ciano)}</g></g>
    <g transform="translate(${PX} 520)"><g class="igual">${tag("=", C.amarelo, 54)}</g></g>
    <g transform="translate(${PX} 420)"><g class="tBoia">${tag("BOIA", C.verde, 50)}</g></g>
    <g transform="translate(${PX} 420)"><g class="tAfunda">${tag("AFUNDA", C.vermelho, 50)}</g></g>
    <g transform="translate(540 400)"><g class="tOito">${numeroHud("c8", 140, C.vermelho, "1×")}<g transform="translate(0 76)">${tag("O AÇO PESA MAIS QUE A ÁGUA", C.vermelho, 26)}</g></g></g>
    <g transform="translate(540 420)"><g class="tPalp">${tag("COMENTA SEU PALPITE", C.rosa, 40)}</g></g>`;
  const viga = $(".viga", el), pE = $(".panE", el), pD = $(".panD", el), obj = $(".obj", el);
  const ta = B("arq", 0.15), ti = B("igual", 0.4), tb = B("boia", 0.72), tf = B("afunda", 0.9), to = B("oito", 0.94), tpp = B("palpite", 0.98);
  entrar($(".papiro", el), ta - 0.2, "esq");
  reflexoPassando($(".papiroI", el), "", 0, ta + 0.4);
  varredura($(".balanca", el), 180, 560, 920, 800, c.ini + 0.1, 1.2);
  entrar($(".igual", el), ti, "mola");
  const inclina = (t, ang) => {
    const dy = L * Math.sin((ang * Math.PI) / 180);
    tl.to(viga, { rotation: ang, svgOrigin: `${PX} ${PY}`, duration: 0.8, ease: "back.out(1.6)" }, t);
    tl.to(pE, { y: -dy, duration: 0.8, ease: "back.out(1.6)" }, t);
    tl.to(pD, { y: dy, duration: 0.8, ease: "back.out(1.6)" }, t);
  };
  const d8 = L * Math.sin((8 * Math.PI) / 180);
  tl.fromTo(viga, { rotation: -8, svgOrigin: `${PX} ${PY}` }, { rotation: 0, svgOrigin: `${PX} ${PY}`, duration: 1.1, ease: "elastic.out(1, 0.45)", immediateRender: false }, ti - 0.3);
  tl.fromTo(pE, { y: d8 }, { y: 0, duration: 1.1, ease: "elastic.out(1, 0.45)", immediateRender: false }, ti - 0.3);
  tl.fromTo(pD, { y: -d8 }, { y: 0, duration: 1.1, ease: "elastic.out(1, 0.45)", immediateRender: false }, ti - 0.3);
  sair($(".igual", el), tb - 0.4);
  tl.to(obj, { scale: 0.7, transformOrigin: "50% 100%", duration: 0.4, ease: "power2.out" }, tb - 0.3);
  inclina(tb, 10);
  entrar($(".tBoia", el), tb + 0.1, "cima");
  sair($(".tBoia", el), tf - 0.35, "cima");
  tl.to(obj, { scale: 1.25, transformOrigin: "50% 100%", duration: 0.4, ease: "power2.out" }, tf - 0.3);
  tl.to($$("rect, path", obj), { stroke: C.vermelho, duration: 0.3 }, tf - 0.3);
  inclina(tf, -10);
  entrar($(".tAfunda", el), tf + 0.1, "baixo");
  sair($(".tAfunda", el), to - 0.35, "baixo");
  entrar($(".tOito", el), to - 0.1, "escala");
  contador($(".c8", el), 1, 8, to - 0.1, 0.9, (v) => Math.round(v) + "×");
  sair($(".tOito", el), tpp - 0.3);
  entrar($(".tPalp", el), tpp, "mola");
  reflexoPassando($(".tPalp", el), "COMENTA SEU PALPITE", 40, tpp + 0.5);
  tl.fromTo($(".tPalp", el), { scale: 1 }, { scale: 1.08, duration: 0.35, yoyo: true, repeat: 5, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tpp + 1.2);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.12, 420, 1000], [ta + 0.6, 1.12, 420, 1000], [ti - 0.2, 1.07, 640, 850], [tf + 0.8, 1.07, 640, 850],
    [to + 0.2, 1.0, 540, 900], [tpp - 0.2, 1.0, 540, 900], [c.fim + 0.5, 1.08, 620, 860]], c.fim);
  focoSeletivo($(".papiro", el).parentNode, [[ti - 0.2, c.fim + 5, 3]], c.fim);
};

// =============== 4. massinha: bola afunda, barquinho boia (laboratório) ===============
CENAS.massinha = (el, c, B) => {
  const NA = 880, X0 = 170, X1 = 910, FT = 1290;
  el.innerHTML = `<g class="cam">${cenarioHud({ horizonte: FT })}
    <g class="monitor holo" opacity="0.5"><g transform="translate(800 470)"><rect x="-170" y="-130" width="340" height="260" class="vazio"/>
      <path d="M-150 60 L -90 20 L -40 40 L 20 -30 L 80 -10 L 150 -80" class="vazio"/>${[0, 1, 2, 3].map((k) => `<path d="M-150 ${-100 + k * 50} H 150" class="vazio" stroke-opacity="0.3"/>`).join("")}</g></g>
    <rect class="aguaM" x="${X0 + 10}" y="${NA}" width="${X1 - X0 - 20}" height="${FT - NA - 10}" fill="#4cc9f0" opacity="0.15"/>
    <g class="ondasM"></g>
    <g class="desloc" opacity="0"><path d="M580 ${NA} H 800 L 782 ${NA + 40} H 598 Z" fill="${C.ciano}" fill-opacity="0.4" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/></g>
    <g class="deslocB" opacity="0"><circle cx="380" cy="1236" r="50" fill="${C.laranja}" fill-opacity="0.25" stroke="#fff" stroke-width="3" stroke-dasharray="10 8"/></g>
    <g class="bolhasM"></g>
    <g transform="translate(380 600)"><g class="massa"><g class="massaR holo-lr"><path class="forma cheio" d="${BOLA_D}"/><path class="arB" d="${BARCO_AR}" style="fill:rgba(143,227,255,0.0);stroke:none"/></g></g></g>
    <path class="supM" d="M${X0 + 10} ${NA} H ${X1 - 10}" stroke="#8fe3ff" stroke-width="4"/>
    <g class="tanqueM holo"><rect x="${X0}" y="720" width="${X1 - X0}" height="${FT - 720}" class="vazio"/>
      ${Array.from({ length: 11 }, (_, k) => `<path d="M${X1} ${740 + k * 50} h ${k % 2 ? 14 : 26}" class="vazio"/>`).join("")}</g>
    <g class="gotasM"></g>
    <g transform="translate(380 1150)"><g class="tAf">${tag("AFUNDA", C.vermelho, 30)}</g></g>
    <g transform="translate(690 1000)"><g class="tBo">${tag("BOIA", C.verde, 34)}</g></g>
    <g transform="translate(690 740)"><g class="tAr">${tag("OCO: AR", C.ciano, 30)}</g></g>
    <g transform="translate(690 1000)"><g class="tMuita">${tag("MUITA ÁGUA EMPURRADA", C.ciano, 24)}</g></g>
    <g transform="translate(380 1150)"><g class="tPouca">${tag("POUCA ÁGUA", C.laranja, 24)}</g></g></g>
    <g transform="translate(540 470)"><g class="tMesmo">${tag("MESMO PESO", C.amarelo, 44)}</g></g>`;
  ondas($(".ondasM", el), NA + 30, FT - 30, 6, c.ini, c.fim, "#8fe3ff", 29);
  const m = $(".massa", el), forma = $(".forma", el);
  const tb = B("bola", 0.2), tbr = B("barco", 0.45), tbo = B("boia2", 0.55), tm = B("mesmo", 0.65), to = B("oco", 0.78), tf = B("fora", 0.92);
  varredura($(".tanqueM", el), X0 - 10, 700, X1 - X0 + 60, FT - 680, c.ini, 1.0);
  entrar(m, c.ini + 0.3, "mola");
  tl.to(m, { y: NA - 600, duration: 0.45, ease: "power2.in" }, tb - 0.3);
  respingo($(".gotasM", el), 380, NA, tb + 0.15, 16, { seed: 4, forca: 0.8, cores: ["#8fe3ff", "#dff6ff"] });
  tl.to(m, { y: 1236 - 600, duration: 1.1, ease: "power2.out" }, tb + 0.15);
  bolhasSobem($(".bolhasM", el), 380, 1150, 12, tb + 0.3, 1.4, { altura: 260, seed: 5, espalha: 50 });
  entrar($(".tAf", el), tb + 0.6, "baixo");
  sair($(".tAf", el), tbr - 0.6, "baixo");
  tl.to(m, { x: 310, y: 120, duration: 0.8, ease: "power2.inOut" }, tbr - 0.5);
  tl.to(forma, { morphSVG: BARCO_D, duration: 0.7, ease: "power2.inOut" }, tbr - 0.2);
  tl.to(m, { y: NA - 600 - 10, duration: 0.6, ease: "power2.in" }, tbo - 0.4);
  respingo($(".gotasM", el), 690, NA, tbo + 0.2, 18, { seed: 6, forca: 0.6, abertura: 900, cores: ["#8fe3ff", "#dff6ff"] });
  tl.fromTo($(".massaR", el), { rotation: -4 }, { rotation: 4, duration: 1.0, yoyo: true, repeat: Math.max(1, Math.floor((c.fim - tbo) / 1.0)), ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tbo + 0.2);
  entrar($(".tBo", el), tbo + 0.1, "cima");
  entrar($(".tMesmo", el), tm, "escala");
  reflexoPassando($(".tMesmo", el), "MESMO PESO", 44, tm + 0.5);
  sair($(".tBo", el), to - 0.3, "cima");
  tl.to($(".arB", el), { fill: "rgba(143,227,255,0.45)", duration: 0.4 }, to);
  entrar($(".tAr", el), to + 0.1, "dir");
  sair($(".tMesmo", el), tf - 0.3);
  tl.to($(".desloc", el), { opacity: 1, duration: 0.4 }, tf);
  tl.fromTo($(".desloc path", el), { strokeDashoffset: 0 }, { strokeDashoffset: -200, duration: c.fim - tf, ease: "none", immediateRender: false }, tf);
  tl.to($(".deslocB", el), { opacity: 1, duration: 0.4 }, tf + 0.3);
  entrar($(".tMuita", el), tf + 0.1, "esq");
  entrar($(".tPouca", el), tf + 0.4, "esq");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.025, 540, 900], [tb - 0.4, 1.025, 540, 900], [tb + 0.3, 1.2, 420, 1040], [tbr - 0.6, 1.2, 420, 1040],
    [tbr + 0.2, 1.22, 660, 890], [tm - 0.2, 1.22, 660, 890], [tm + 0.4, 1.05, 540, 900], [tf - 0.2, 1.05, 540, 900], [c.fim + 0.5, 1.12, 560, 1010]], c.fim);
  focoSeletivo($(".monitor", el), [[tb, tm + 0.2, 4], [tf, c.fim + 5, 2]], c.fim);
};

// =============== 5. o navio por dentro (corte em holograma) ===============
CENAS.casco = (el, c, B) => {
  const NA = 1000;
  const CONTORNO = "M240 450 H 840 V 740 H 880 V 1080 Q 880 1170 790 1170 H 290 Q 200 1170 200 1080 V 740 H 240 Z";
  const SUBM = `M200 ${NA} V 1080 Q 200 1170 290 1170 H 790 Q 880 1170 880 1080 V ${NA} Z`;
  const salas = [];
  for (let r = 0; r < 5; r++) for (let q = 0; q < 6; q++) salas.push(`<rect class="sala" x="${252 + q * 98}" y="${462 + r * 56}" width="88" height="46"/>`);
  el.innerHTML = `<g class="cam">${cenarioHud({ horizonte: NA, agua: true })}
    <g class="cristasC"></g><g class="cintC"></g>
    <g transform="translate(540 ${NA})"><g class="barq">${P(0, 0, 1, "barqI", `<g class="holo-lr"><path d="${BARCO_D}" class="cheio"/></g>`)}</g></g>
    <g class="secao">
      <g class="interior holo">
        <path d="${CONTORNO}" style="fill:rgba(4,10,28,0.85)"/>
        ${salas.join("")}
        <g class="restaurante">${[0, 1, 2, 3, 4].map((k) => `<rect x="${250 + k * 120}" y="806" width="70" height="10"/><rect x="${281 + k * 120}" y="816" width="8" height="30"/>`).join("")}</g>
        <path d="M200 860 H 880" class="vazio"/>
        <g class="teatro holo-rs"><rect x="380" y="890" width="320" height="150"/><path d="M380 890 H 470 C 450 950, 470 1000, 440 1040 H 380 Z" class="cheio"/><path d="M700 890 H 610 C 630 950, 610 1000, 640 1040 H 700 Z" class="cheio"/></g>
        <path d="M200 1060 H 880" class="vazio"/>
        <g class="maquinas">${[0, 1, 2].map((k) => `<rect x="${300 + k * 170}" y="1082" width="130" height="60"/><circle cx="${365 + k * 170}" cy="1112" r="18"/>`).join("")}</g>
        <path class="ar" d="${CONTORNO}" style="fill:rgba(143,227,255,0);stroke:none"/>
      </g>
      <g class="pele holo"><path d="${CONTORNO}" class="cheio"/>
        ${[0, 1, 2, 3, 4].map((r) => `<path d="M252 ${481 + r * 56} H 828" class="vazio" stroke-dasharray="10 6"/>`).join("")}
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<circle cx="${240 + k * 75}" cy="800" r="8"/>`).join("")}</g>
      <path class="casca" d="${CONTORNO}" fill="none" stroke="#8fe3ff" stroke-width="8" stroke-linejoin="round"/>
      <g class="holo"><path d="M720 450 L 736 370 H 816 L 824 450 Z"/></g>
    </g>
    <path class="desloc" d="${SUBM}" fill="${C.azul}" opacity="0" stroke="#fff" stroke-width="4" stroke-dasharray="14 10"/>
    <rect x="-200" y="${NA}" width="${W + 400}" height="${H - NA + 200}" fill="#0d3a6e" opacity="0.35"/>
    <path d="M-200 ${NA} H ${W + 200}" stroke="#8fe3ff" stroke-width="3"/>
    <g class="cotaCasca" opacity="0">${cota(880, 760, 880, 1170, "CASCA DE AÇO", C.laranja).replace('class="cota"', 'class="cotaX"')}</g>
    <g transform="translate(110 1330)"><g class="fUp">${flechaHud(290, C.verde, "EMPUXO", 0, "fu", 24)}</g></g>
    <g transform="translate(970 560)"><g class="fDn">${flechaHud(260, C.vermelho, "PESO", 180, "fd", 24)}</g></g></g>
    <g transform="translate(540 370)"><g class="tAco">${tag("AÇO: SÓ A CASCA", C.laranja, 36)}</g></g>
    <g transform="translate(540 370)"><g class="tArC">${tag("POR DENTRO: QUASE TUDO AR", C.ciano, 30)}</g></g>
    <g transform="translate(540 1230)"><g class="tAgua">${numeroHud("cA", 84, C.ciano)}<g transform="translate(0 58)">${tag("TONELADAS DE ÁGUA EMPURRADAS", C.ciano, 22)}</g></g></g>`;
  const sec = $(".secao", el), salasEl = $$(".sala", el);
  const tg = B("gigante", 0.2), tfi = B("fino", 0.35), ta = B("ar", 0.5), tt = B("teatros", 0.65), tw = B("agua", 0.8), ti = B("inteiro", 0.92);
  ondas($(".cristasC", el), NA + 14, 1420, 10, c.ini, c.fim, C.ciano, 41);
  cintilar($(".cintC", el), 14, [0, NA + 10, W, 300], c.ini, c.fim, "#8fe3ff", 43);
  boiar($(".barqI", el), c.ini, tg, 6);
  tl.set(sec, { opacity: 0 }, 0);
  tl.to($(".barq", el), { scale: 3.2, opacity: 0, transformOrigin: "50% 50%", duration: 0.7, ease: "power2.in" }, tg - 0.3);
  tl.fromTo(sec, { scale: 0.22, opacity: 0, svgOrigin: `540 ${NA}` }, { scale: 1, opacity: 1, svgOrigin: `540 ${NA}`, duration: 1.0, ease: "expo.out", immediateRender: false }, tg - 0.15);
  // o aço é só a casca: a pele some, sobra o contorno (com cota)
  tl.to($(".pele", el), { opacity: 0, duration: 0.7 }, tfi - 0.1);
  tl.to($(".casca", el), { stroke: C.laranja, duration: 0.3 }, tfi);
  desenhar($(".casca", el), tfi, 0.9);
  tl.set($(".cotaCasca", el), { opacity: 1 }, tfi + 0.3);
  desenhar($(".cotaCasca .cotaL", el), tfi + 0.3, 0.5);
  entrar($(".tAco", el), tfi + 0.1, "esq");
  reflexoPassando($(".tAco", el), "AÇO: SÓ A CASCA", 36, tfi + 0.6);
  sair($(".tAco", el), ta - 0.3, "dir");
  tl.to($(".cotaCasca", el), { opacity: 0, duration: 0.3 }, ta - 0.3);
  tl.to($(".casca", el), { stroke: "#8fe3ff", duration: 0.5 }, ta);
  tl.to($(".ar", el), { fill: "rgba(143,227,255,0.12)", duration: 0.6 }, ta);
  entrar($(".tArC", el), ta + 0.05, "baixo");
  salasEl.forEach((s, k) => tl.to(s, { fill: "rgba(255,210,63,0.45)", stroke: C.amarelo, duration: 0.2 }, ta + 0.2 + ((k * 7) % salasEl.length) * ((tt - ta - 0.4) / salasEl.length)));
  entrar($(".restaurante", el), ta + (tt - ta) * 0.55, "mola");
  entrar($(".teatro", el), tt, "escala");
  sair($(".tArC", el), tw - 0.4);
  tl.to($(".desloc", el), { opacity: 0.5, duration: 0.5 }, tw);
  tl.fromTo($(".desloc", el), { strokeDashoffset: 0 }, { strokeDashoffset: -300, duration: c.fim - tw, ease: "none", immediateRender: false }, tw);
  entrar($(".tAgua", el), tw - 0.5, "escala");
  contador($(".cA", el), 0, 100000, tw - 0.5, 1.2);
  animFlechaHud($(".fu", el), ti - 0.15);
  animFlechaHud($(".fd", el), ti + 0.05);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.7, 540, 990], [tg - 0.4, 1.7, 540, 990], [tg + 0.8, 1.0, 540, 880], [tfi - 0.2, 1.0, 540, 880], [tfi + 0.6, 1.08, 560, 820],
    [tw - 0.3, 1.08, 560, 820], [tw + 0.4, 1.06, 540, 930], [ti - 0.3, 1.06, 540, 930], [ti + 0.5, 1.0, 540, 900], [c.fim + 0.5, 1.03, 540, 900]], c.fim);
};

// =============== 6. na prática: linha d'água, compartimentos e o Titanic ===============
CENAS.pratica = (el, c, B) => {
  const NA = 1000, ALTO = -30;
  const guindaste = (x, h) => `<g transform="translate(${x} ${NA})"><path d="M-14 0 V ${-h} H 14 V 0 Z"/><path d="M-40 ${-h} H 220 V ${-h + 22} H -40 Z"/><path d="M180 ${-h + 22} V ${-h + 140}" class="vazio"/>${Array.from({ length: Math.floor(h / 40) }, (_, k) => `<path d="M-14 ${-k * 40} L 14 ${-k * 40 - 40}" class="vazio"/>`).join("")}</g>`;
  el.innerHTML = `<g class="cam">${cenarioHud({ horizonte: NA, agua: true })}
    <g class="porto holo" opacity="0.4">${guindaste(110, 560)}${guindaste(900, 500)}<rect x="-200" y="${NA - 40}" width="${W + 400}" height="40"/></g>
    <g class="cristasPr"></g><g class="cintPr"></g>
    <g transform="translate(560 ${NA}) scale(0.9)"><g class="navP"><g class="holo">${navio({ calado: 130, raiox: true })}</g>
      ${[[-170], [-108], [-46], [16]].map(([x]) => `<g transform="translate(${x} -316)"><g class="caixa holo-am"><rect y="-46" width="56" height="46" class="cheio"/><path d="M14 -40 V -6 M28 -40 V -6 M42 -40 V -6" class="vazio"/></g></g>`).join("")}</g></g>
    <rect class="aguaFr" x="-200" y="${NA}" width="${W + 400}" height="${H - NA + 200}" fill="#0d3a6e" opacity="0.5"/>
    <path d="M-200 ${NA} H ${W + 200}" stroke="#8fe3ff" stroke-width="3"/>
    <g class="bolhasPr"></g>
    <g class="cLinha" opacity="0"><path class="cLl" d="M695 972 L 600 1180 H 480" stroke="${C.amarelo}" stroke-width="3" fill="none"/><circle cx="695" cy="972" r="9" fill="${C.amarelo}"/>
      <g transform="translate(330 1180)">${tag("LINHA D'ÁGUA", C.amarelo, 28)}</g></g></g>
    <g transform="translate(540 430)"><g class="tEq">${tag("PESO = EMPUXO", C.verde, 40)}</g></g>
    <g transform="translate(540 430)"><g class="tVaza">${tag("E SE O CASCO FURAR?", C.vermelho, 40)}</g></g>
    <g transform="translate(540 430)"><g class="tComp">${tag("COMPARTIMENTOS FECHADOS", C.ciano, 32)}</g></g>
    <g transform="translate(540 430)"><g class="tOk">${tag("✓ CONTINUA BOIANDO", C.verde, 36)}</g></g>
    <g transform="translate(540 430)"><g class="tTit">${numeroHud("cT", 92, "#ffffff", "TITANIC")}<g transform="translate(0 70)">${tag("1912 · PAREDES BAIXAS: A ÁGUA PASSOU POR CIMA", C.vermelho, 20)}</g></g></g>`;
  ondas($(".cristasPr", el), NA + 14, 1420, 10, c.ini, c.fim, C.ciano, 51);
  cintilar($(".cintPr", el), 14, [0, NA + 10, W, 300], c.ini, c.fim, "#8fe3ff", 53);
  const nav = $(".navP", el), caixas = $$(".caixa", el);
  const tli = B("linha", 0.15), tca = B("carga", 0.35), teq = B("equilibra", 0.5), tv = B("vaza", 0.65), tco = B("comp", 0.78), ts = B("seguro", 0.92), tti = B("titanic", 0.95), tpa = B("passa", 0.97);
  tl.set(caixas, { opacity: 0 }, 0);
  tl.set(nav, { y: ALTO }, 0);
  tl.set($(".cLinha", el), { opacity: 1 }, tli);
  desenhar($(".cLl", el), tli, 0.5);
  tl.to($(".cLinha", el), { opacity: 0, duration: 0.25, ease: "power2.in" }, tca - 0.2);
  caixas.forEach((k, i) => tl.fromTo(k, { y: -360, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 + i * 0.08, ease: "bounce.out", immediateRender: false }, tca + i * 0.15));
  tl.to(nav, { y: 0, duration: 1.6, ease: "power2.inOut" }, tca + 0.3);
  entrar($(".tEq", el), teq, "escala");
  reflexoPassando($(".tEq", el), "PESO = EMPUXO", 40, teq + 0.5);
  sair($(".tEq", el), tv - 0.4);
  entrar($(".tVaza", el), tv - 0.1, "cima");
  tl.to($(".aguaFr", el), { opacity: 0.2, duration: 0.5 }, tv - 0.2);
  tl.to($(".raiox", el), { opacity: 1, duration: 0.5 }, tv - 0.2);
  pop($(".furo", el), tv + 0.2);
  bolhasSobem($(".bolhasPr", el), 560 + 300 * 0.9, NA + 100, 10, tv + 0.3, 2, { altura: 120, seed: 7, espalha: 30 });
  tl.to($(".inunda", el), { attr: { y: -40, height: 130 - 10 + 40 }, duration: 2.4, ease: "power1.inOut" }, tv + 0.3);
  sair($(".tVaza", el), tco - 0.35, "cima");
  tl.to($$(".antepara", el), { stroke: C.amarelo, duration: 0.3, stagger: 0.06 }, tco);
  desenhar($$(".antepara", el), tco, 0.5);
  entrar($(".tComp", el), tco + 0.1, "dir");
  tl.to(nav, { y: 8, duration: 1.2, ease: "power2.out" }, tv + 0.6);
  sair($(".tComp", el), ts - 0.3, "esq");
  entrar($(".tOk", el), ts, "mola");
  sair($(".tOk", el), tti - 0.3);
  entrar($(".tTit", el), tti, "escala");
  tl.to($$(".antepara", el), { stroke: C.vermelho, duration: 0.3 }, tti);
  tl.to($(".inunda", el), { attr: { y: -112, height: 130 - 10 + 112 }, duration: 0.6 }, tpa - 0.4);
  tl.to($(".inunda2", el), { attr: { y: -112, height: 130 - 10 + 112 }, duration: 1.0, ease: "power1.in" }, tpa);
  tl.to($(".inunda3", el), { attr: { y: -112, height: 130 - 10 + 112 }, duration: 1.0, ease: "power1.in" }, tpa + 0.9);
  tl.to(nav, { y: 40, rotation: 2.5, svgOrigin: "0 0", duration: 2.2, ease: "power1.in" }, tpa);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.025, 540, 880], [tli - 0.3, 1.025, 540, 880], [tli + 0.5, 1.3, 700, 980], [tca - 0.4, 1.3, 700, 980],
    [tca + 0.5, 1.0, 540, 880], [tv - 0.4, 1.0, 540, 880], [tv + 0.4, 1.15, 560, 1000], [tti - 0.3, 1.15, 560, 1000], [tti + 0.6, 1.06, 560, 960], [c.fim + 0.5, 1.1, 600, 980]], c.fim);
  focoSeletivo($(".porto", el), [[tv - 0.2, c.fim + 5, 3]], c.fim);
};

// =============== 7. na sua vida: pulmão, colete e submarino (sonar) ===============
CENAS.voce = (el, c, B) => {
  const SUP = 640;
  const sub = () => `<path d="M-40 -66 L -28 -136 H 72 L 92 -66 Z"/><path d="M20 -136 V -176 H 46" class="vazio"/>
    <path d="M-250 0 C -250 -56, -120 -70, 0 -70 C 150 -70, 240 -42, 256 0 C 240 42, 150 70, 0 70 C -120 70, -250 56, -250 0 Z"/>
    <path d="M-250 0 l -30 -40 v 80 z"/>
    ${[-180, 40].map((x) => `<rect x="${x}" y="-32" width="130" height="64" class="vazio"/><rect class="tqA cheio" x="${x}" y="32" width="130" height="0" style="fill:rgba(76,201,240,0.6)"/>`).join("")}
    ${[0, 1, 2].map((k) => `<circle cx="${-30 + k * 26}" cy="-46" r="7"/>`).join("")}`;
  const pulmoes = () => `<rect x="-9" y="-120" width="18" height="70"/>
    <path d="M-6 -55 C -30 -60, -100 -50, -105 20 C -110 80, -70 105, -30 95 C -10 90, -8 60, -8 -40 Z" class="cheio"/>
    <path d="M6 -55 C 30 -60, 100 -50, 105 20 C 110 80, 70 105, 30 95 C 10 90, 8 60, 8 -40 Z" class="cheio"/>
    <path d="M-8 -45 L -40 -10 M-40 -10 L -60 30 M-40 -10 L -30 40 M8 -45 L 40 -10 M40 -10 L 60 30 M40 -10 L 30 40" class="vazio"/>`;
  const colete = () => `<path d="M-80 -110 C -80 -130, -40 -140, -26 -120 L -20 -70 H 20 L 26 -120 C 40 -140, 80 -130, 80 -110 L 86 90 C 86 110, 70 118, 50 118 H -50 C -70 118, -86 110, -86 90 Z" class="cheio"/>
    <path d="M-20 -70 C -20 -20, 20 -20, 20 -70" class="vazio"/><path d="M-84 0 H 84 M-86 50 H 86" class="vazio"/>`;
  el.innerHTML = `<g class="cam">${cenarioHud({ horizonte: SUP, agua: true })}
    <g class="neveV"></g>
    <g class="regua">${Array.from({ length: 15 }, (_, k) => `<path d="M${W - 40} ${SUP + k * 50} h ${k % 2 ? -14 : -28}" stroke="#8fe3ff" stroke-width="2" opacity="0.6"/>${k % 2 ? "" : `<text class="monol" x="${W - 76}" y="${SUP + 6 + k * 50}" font-size="16" fill="#8fe3ff" text-anchor="end" opacity="0.7">${k * 5} m</text>`}`).join("")}</g>
    <g transform="translate(270 ${SUP + 30})"><g class="pulm"><g class="pulmI holo-rs">${pulmoes()}</g></g></g>
    <g transform="translate(270 ${SUP})"><g class="colete"><g class="coleteI holo-lr">${colete()}</g></g></g>
    <g class="cristasV"></g>
    <g transform="translate(760 1000) scale(0.82)"><g class="sub"><g class="sonar">${[0, 1, 2].map((k) => `<circle class="ping" r="60" fill="none" stroke="${C.verde}" stroke-width="3" opacity="0"/>`).join("")}</g><g class="subB holo">${sub()}</g></g></g>
    <g class="bolhasV"></g><g class="gotasV"></g></g>
    <g transform="translate(270 470)"><g class="tPul">${tag("PULMÃO CHEIO DE AR", C.rosa, 30)}</g></g>
    <g transform="translate(330 470)"><g class="tCol">${tag("MUITO ESPAÇO, POUCO PESO", C.laranja, 28)}</g></g>
    <g transform="translate(740 470)"><g class="tDesce">${tag("ÁGUA NOS TANQUES: DESCE", C.azul, 26)}</g></g>
    <g transform="translate(740 470)"><g class="tSobe">${tag("AR NOS TANQUES: SOBE", C.verde, 26)}</g></g>
    <g transform="translate(700 560)"><g class="pProf">${painelHud([["PROFUNDIDADE", "00 m"]], C.verde, 330)}</g></g>`;
  ondas($(".cristasV", el), SUP + 10, 1400, 8, c.ini, c.fim, C.ciano, 61);
  poeira($(".neveV", el), 40, 63, [0, 700, W, 600], c.ini, c.fim, "#8fe3ff");
  const pulm = $(".pulm", el), col = $(".colete", el), sb = $(".sub", el), prof = $$(".pProf text", el)[1];
  const tp = B("pulmao", 0.15), tb = B("boiaP", 0.3), tc = B("colete", 0.45), ts = B("sub", 0.62), td = B("desce", 0.8), tsb = B("sobe", 0.92);
  tl.set([col, sb], { opacity: 0 }, 0);
  boiar($(".pulmI", el), c.ini, c.fim, 8);
  boiar($(".coleteI", el), c.ini, c.fim, 7);
  tl.fromTo(pulm, { scale: 0.7, opacity: 1, transformOrigin: "50% 50%" }, { scale: 1.1, duration: 0.8, ease: "back.out(2)", immediateRender: false }, tp);
  entrar($(".tPul", el), tp + 0.1, "esq");
  tl.to(pulm, { y: -40, duration: 0.8, ease: "back.out(2)" }, tb);
  respingo($(".gotasV", el), 270, SUP, tb + 0.05, 12, { seed: 8, forca: 0.5, cores: ["#8fe3ff", "#dff6ff"] });
  sair($(".tPul", el), tc - 0.3, "esq");
  tl.to(pulm, { x: -320, opacity: 0, duration: 0.3, ease: "power2.in" }, tc - 0.3);
  tl.fromTo(col, { y: -520, opacity: 1 }, { y: -60, opacity: 1, duration: 0.8, ease: "bounce.out", immediateRender: false }, tc - 0.1);
  respingo($(".gotasV", el), 270, SUP, tc + 0.35, 18, { seed: 9, forca: 0.8, cores: ["#8fe3ff", "#dff6ff"] });
  entrar($(".tCol", el), tc + 0.2, "baixo");
  reflexoPassando($(".tCol", el), "MUITO ESPAÇO, POUCO PESO", 28, tc + 0.8);
  // submarino com sonar e leitura de profundidade (segue a posição dele)
  sair($(".tCol", el), ts - 0.3, "baixo");
  entrar(sb, ts - 0.2, "dir");
  tl.to(col, { opacity: 0, duration: 0.4, ease: "power2.in" }, ts);
  entrar($(".pProf", el), ts, "dir");
  $$(".ping", el).forEach((p, k) => tl.fromTo(p, { attr: { r: 60 }, opacity: 0.9 }, { attr: { r: 420 }, opacity: 0, duration: 1.8, repeat: Math.max(1, Math.floor((c.fim - ts) / 1.8)), ease: "power1.out", immediateRender: false }, ts + k * 0.6));
  aCadaQuadro((t) => { if (t < ts - 0.5 || t > c.fim + 0.5) return; prof.textContent = `${String(Math.round(Math.max(0, 18 + Number(gsap.getProperty(sb, "y")) * 0.11))).padStart(2, "0")} m`; });
  tl.to($$(".tqA", el), { attr: { y: -32, height: 64 }, duration: 0.8, ease: "power1.inOut" }, td - 0.3);
  tl.to(sb, { y: 220, rotation: 4, transformOrigin: "50% 50%", duration: 1.4, ease: "power2.inOut" }, td);
  entrar($(".tDesce", el), td, "cima");
  sair($(".tDesce", el), tsb - 0.35, "cima");
  tl.to($$(".tqA", el), { attr: { y: 32, height: 0 }, duration: 0.7, ease: "power1.inOut" }, tsb - 0.1);
  bolhasSobem($(".bolhasV", el), 740, 1180, 26, tsb, 1.6, { altura: 520, seed: 10, espalha: 260 });
  tl.to(sb, { y: -150, rotation: -5, transformOrigin: "50% 50%", duration: 1.6, ease: "power2.inOut" }, tsb + 0.2);
  entrar($(".tSobe", el), tsb + 0.1, "baixo");
  boiar($(".subB", el), c.ini, c.fim, 10);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.025, 540, 900], [tp - 0.4, 1.025, 540, 900], [tp + 0.4, 1.22, 340, 720], [ts - 0.5, 1.22, 340, 720],
    [ts + 0.4, 1.12, 720, 1000], [td, 1.12, 720, 1000], [td + 1.4, 1.12, 720, 1130], [tsb + 0.2, 1.12, 720, 1130], [tsb + 1.8, 1.05, 640, 940], [c.fim + 0.5, 1.05, 640, 940]], c.fim);
};

// =============== 8. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const passos = [["TUDO EMPURRA ÁGUA PRA FORA", C.amarelo], ["A ÁGUA EMPURRA PRA CIMA", C.azul], ["LEVE PRO TAMANHO? BOIA", C.verde], ["NAVIO: QUASE TODO AR", C.rosa]];
  el.innerHTML = `<g class="cam">${cenarioHud({ horizonte: 1290, agua: true })}<g class="cristasR"></g>
    <path class="espinha" d="M150 440 V 1150" stroke="#8fe3ff" stroke-width="3" stroke-dasharray="6 8" opacity="0.6"/>
    ${passos.map(([t, cor], k) => `<g transform="translate(150 ${470 + k * 226})"><g class="passo"><rect x="-48" y="-48" width="96" height="96" fill="rgba(4,10,28,0.85)" stroke="${cor}" stroke-width="3"/>
      <path d="M-58 -30 V -58 H -30 M58 30 V 58 H 30" stroke="${cor}" stroke-width="3" fill="none"/><text class="mono" y="20" text-anchor="middle" font-size="54" fill="${cor}">0${k + 1}</text>
      <text class="mono" x="84" y="14" font-size="${t.length > 22 ? 30 : 34}" fill="#fff">${t}</text></g></g>`).join("")}
    <g transform="translate(-200 1290) scale(0.3)"><g class="navR"><g class="holo">${navio()}</g></g></g></g>`;
  ondas($(".cristasR", el), 1300, 1420, 6, c.ini, c.fim, C.ciano, 71);
  const ps = $$(".passo", el);
  tl.set(ps, { opacity: 0 }, c.ini);
  desenhar($(".espinha", el), c.ini + 0.2, 1.2);
  ["passo1", "passo2", "passo3", "passo4"].forEach((b, k) => tl.fromTo(ps[k], { x: -90, opacity: 0, scale: 0.85 }, { x: 0, opacity: 1, scale: 1, duration: 0.45 + k * 0.05, ease: ["expo.out", "back.out(1.7)", "power4.out", "back.out(2.4)"][k], immediateRender: false }, B(b, 0.15 + k * 0.15)));
  const tv = B("flutua", 0.7), tcta = B("cta", 0.8);
  tl.fromTo($(".navR", el), { x: 0 }, { x: 1600 / 0.3, duration: 4.5, ease: "power1.inOut", immediateRender: false }, tv - 0.6);
  tl.to([...ps, $(".espinha", el)], { opacity: 0, x: -60, duration: 0.3, stagger: 0.04, ease: "power2.in" }, tcta - 0.4);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.03, 540, 880], [tv - 0.6, 1.03, 540, 900], [tv + 1.2, 1.06, 560, 1060], [c.fim + 0.5, 1.06, 560, 1060]], c.fim, 0.7);
  cartaoFinal(el, tcta);
  lottieEm(el, "confete", 540, 900, 1080, 1440, { ini: tcta + 0.2, fim: T, loop: false, corte: true });
};

// =============== acabamento: brilho neon, interface (HUD) e partículas ===============
const _comEfeitos = (tipo, fx) => { const base = CENAS[tipo]; CENAS[tipo] = (el, c, B, i, f) => { base(el, c, B, i, f); fx(el, c, B, f); }; };
const _canal = { porto: "SCAN 01 // CASCO", piscina: "SIM 02 // EMPUXO", arquimedes: "ARQ 03 // 250 a.C.", massinha: "LAB 04 // FORMATO", casco: "CORTE 05 // INTERIOR", pratica: "DADOS 06 // CALADO", voce: "SONAR 07 // PROFUNDIDADE", resumo: "RESUMO 08" };
Object.keys(_canal).forEach((tipo) => _comEfeitos(tipo, (el, c) => {
  brilhar($$(".holo, .holo-am, .holo-vm, .holo-vd, .holo-rs, .holo-lr", el).filter((g) => !g.closest("[filter]") && !g.parentNode.closest(".holo, .holo-am, .holo-rs, .holo-lr")));
  const cam = $(".cam", el);
  if (cam) { cam.insertAdjacentHTML("beforeend", `<g class="pDados"></g>`); poeira($(".pDados", el), 24, 3 + tipo.length, [0, 380, W, 950], c.ini, c.fim, "#8fe3ff"); }
  if (tipo !== "resumo") hudOverlay(el, c, _canal[tipo]);
}));
