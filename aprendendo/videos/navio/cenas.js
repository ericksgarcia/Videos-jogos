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
      <rect class="inunda2" x="102" y="${d - 10}" width="116" height="0" fill="${C.azul}" opacity="0.9"/>
      <rect class="inunda3" x="-18" y="${d - 10}" width="116" height="0" fill="${C.azul}" opacity="0.9"/>
      <rect class="inunda" x="222" y="${d - 10}" width="116" height="0" fill="${C.azul}" opacity="0.9"/>
      ${comp.slice(1).map((x) => `<path class="antepara" d="M${x} -112 V ${d - 10}" stroke="#8fe3ff" stroke-width="6"/>`).join("")}
      <path class="convesF" d="M-490 -112 H ${(bx(-112) - 16).toFixed(1)}" stroke="#8fe3ff" stroke-width="5"/>
      <g transform="translate(300 ${d - 34})"><g class="furo"><circle r="13" fill="#0b1440" stroke="${C.vermelho}" stroke-width="5"/></g></g></g>` : ""}`;
};
$("#defs").insertAdjacentHTML("beforeend", `<linearGradient id="caudaN" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4cc9f0"/><stop offset="1" stop-color="#1f5fbf"/></linearGradient>`);

$("#defs").insertAdjacentHTML("beforeend", `<filter id="dofNav" x="-5%" y="-10%" width="110%" height="120%"><feGaussianBlur id="dofNavB" stdDeviation="0"/></filter>
  <filter id="dofGente" x="-10%" y="-5%" width="120%" height="110%"><feGaussianBlur id="dofGenteB" stdDeviation="0"/></filter>
  <linearGradient id="sheenG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.5" stop-color="#fff" stop-opacity="0.75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`);
// reflexo de luz atravessando um rótulo (sheen), recortado pela pílula do rotulo()
let _nSheen = 0;
const reflexoPassando = (g, txt, tam, t) => {
  const w = txt.length * tam * 0.6 + 52, id = `sheen${_nSheen++}`;
  g.insertAdjacentHTML("beforeend", `<clipPath id="${id}"><rect x="${-w / 2}" y="-34" width="${w}" height="68" rx="34"/></clipPath><g clip-path="url(#${id})"><rect class="sheen" x="-60" y="-50" width="60" height="100" fill="url(#sheenG)" transform="skewX(-20)"/></g>`);
  tl.fromTo($(".sheen", g), { x: -w / 2 - 80 }, { x: w / 2 + 120, duration: 0.7, ease: "power2.inOut", immediateRender: false }, t);
};

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
// navio balançando de leve na água
const boiar = (g, t, fim, amp) => tl.fromTo(g, { y: 0 }, { y: amp ?? 6, duration: 1.6, yoyo: true, repeat: Math.max(1, Math.floor((fim - t) / 1.6)), ease: "sine.inOut", immediateRender: false }, t);

// seta grossa apontando para cima (base na origem), comprimento L
const flecha = (L, cor, txt, ang, cls, tam) => `<g transform="rotate(${ang || 0})"><g class="${cls}"><path d="M-22 0 V ${-L + 50} H -50 L 0 ${-L} L 50 ${-L + 50} H 22 V 0 Z" fill="${cor}"/>
  ${txt ? `<g transform="translate(0 ${-L - 52}) rotate(${-(ang || 0)})">${rotulo(txt, cor, tam || 32)}</g>` : ""}</g></g>`;
const animFlecha = (g, t) => { tl.set(g, { opacity: 0 }, 0); tl.fromTo(g, { scaleY: 0, opacity: 1, transformOrigin: "50% 100%" }, { scaleY: 1, opacity: 1, duration: 0.55, ease: "back.out(1.7)", immediateRender: false }, t); };
// parafuso (centro em 0,0)
const parafuso = () => `<rect x="-26" y="-46" width="52" height="20" rx="4" fill="url(#metal)"/><rect x="-11" y="-28" width="22" height="78" fill="url(#metalH)"/>
  ${[0, 1, 2, 3, 4, 5].map((k) => `<path d="M-13 ${-20 + k * 12} L 13 ${-14 + k * 12}" stroke="#5d6890" stroke-width="3"/>`).join("")}<path d="M-11 50 L 0 62 L 11 50 Z" fill="#7b86a8"/>`;

// =============== 1. gancho: o navio gigante no pôr do sol, visto do píer ===============
CENAS.porto = (el, c, B) => {
  mostrarGancho(B("titulo", 0.85) - 0.2);
  const MAR = 1040, PIER = 1300, SN = 0.86;
  // espuma na proa e esteira atrás da popa (andam com o navio)
  const espuma = `<path d="M470 -4 C 510 -16, 548 -14, 566 -2 C 590 8, 620 10, 650 4" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>
    <ellipse cx="540" cy="4" rx="70" ry="9" fill="#fff" opacity="0.45"/>
    <g class="esteira">${[0, 1, 2, 3].map((k) => `<path d="M-500 ${2 + k * 5} C -620 ${4 + k * 10}, -760 ${8 + k * 18}, -940 ${10 + k * 28}" fill="none" stroke="#fff" stroke-width="${5 - k}" stroke-dasharray="40 26" opacity="${0.55 - k * 0.1}"/>`).join("")}</g>`;
  const pessoaA = personagem({ roupa: "#ff8a3d", calca: "#2a3566", pele: "#a96f4b", cabelo: "#141414", estilo: "curto", barba: true });
  const pessoaB = personagem({ roupa: "#2f9fe8", calca: "#3b4377", pele: "#f2c7a5", cabelo: "#5a3a22", estilo: "longo" });
  el.innerHTML = `<g class="camP"><rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="url(#ceuCrep)"/>${estrelas(30, 9, 0, 420)}
    ${halo(250, 990, 460, "solP")}<circle cx="250" cy="990" r="78" fill="url(#sol)"/>
    <g class="nuvensP"></g>
    <g class="ilhas"><path d="M-40 ${MAR} C 80 960, 200 950, 320 1000 S 480 1000, 560 ${MAR} Z" fill="#3a3373" opacity="0.9"/>
      <path d="M600 ${MAR} C 720 990, 880 990, 1120 950 V ${MAR} Z" fill="#2f2a66" opacity="0.9"/>
      ${Array.from({ length: 9 }, (_, k) => `<rect x="${640 + k * 50}" y="${MAR - 30 - ((k * 37) % 50)}" width="34" height="${30 + ((k * 37) % 50)}" fill="#2a2560"/><rect x="${650 + k * 50}" y="${MAR - 22 - ((k * 37) % 50)}" width="6" height="6" fill="#ffd98a" opacity="0.7"/>`).join("")}</g>
    <rect x="-200" y="${MAR}" width="${W + 400}" height="${H - MAR + 200}" fill="url(#marPor)"/>
    <g class="colunaSol"><path d="M226 ${MAR} L 90 1440 H 420 L 274 ${MAR} Z" fill="#ffb36b" opacity="0.2"/>${reflexos(MAR + 6, 1420, 60, 4, "#ffe2b8", "reflSol").replace('class="reflSol"', 'class="reflSol" transform="translate(110 0) scale(0.25 1)"')}</g>
    <mask id="mReflP" maskUnits="userSpaceOnUse" x="0" y="${MAR}" width="${W}" height="420"><rect x="0" y="${MAR}" width="${W}" height="420" fill="url(#fadeRefl)"/></mask>
    <g mask="url(#mReflP)"><g transform="translate(610 ${MAR})"><g class="navRefl"><g transform="scale(${SN} ${-SN})"><g class="reflB">${navio()}</g></g></g></g></g>
    <rect x="-200" y="${MAR}" width="${W + 400}" height="${H - MAR + 200}" fill="url(#marPor)" opacity="0.45"/>
    ${reflexos(MAR + 8, 1400, 46, 4, "#ffd9b0", "reflP")}
    <g class="cristas"></g><g class="cintP"></g>
    <g class="gvs"></g>
    <g class="navW"><g transform="translate(610 ${MAR}) scale(${SN})"><g class="navio"><g class="navioB">${navio()}${espuma}<g transform="translate(300 -6)"><g class="furoP"><circle r="18" fill="#0b1440" stroke="${C.vermelho}" stroke-width="7"/></g></g></g></g></g></g>
    <rect x="-200" y="${MAR}" width="${W + 400}" height="38" fill="#2a2a70" opacity="0.45"/>
    <path d="M-200 ${MAR} H ${W + 200}" stroke="#ffd9b0" stroke-width="3" opacity="0.5"/>
    <g class="respingo" opacity="0">${[0, 1, 2].map((k) => `<ellipse class="onda" cx="600" cy="1324" rx="${40 + k * 34}" ry="${9 + k * 7}" fill="none" stroke="#fff" stroke-width="4"/>`).join("")}</g>
    <g class="bolhasP"></g>
    <g class="pier">
      ${[30, 200, 380].map((x) => `<rect x="${x}" y="${PIER}" width="26" height="160" fill="#4f301f"/><rect x="${x}" y="${PIER + 110}" width="26" height="50" fill="#2a1f3d" opacity="0.5"/>`).join("")}
      <rect x="-20" y="${PIER - 4}" width="480" height="30" rx="4" fill="url(#madeira)"/>
      ${Array.from({ length: 11 }, (_, k) => `<path d="M${-20 + k * 46} ${PIER - 4} V ${PIER + 26}" stroke="#3a2416" stroke-width="3"/>`).join("")}
      <rect x="-20" y="${PIER - 4}" width="480" height="5" fill="#c99a6a"/>
      <rect x="440" y="${PIER - 66}" width="16" height="66" fill="#6b4a2f"/><path d="M456 ${PIER - 58} H -20" stroke="#8a5a3c" stroke-width="6"/></g>
    <g class="gentW"><g transform="translate(95 ${PIER}) scale(1.35)"><g class="pA">${pessoaA}</g></g>
    <g transform="translate(270 ${PIER}) scale(1.35)"><g class="pB">${pessoaB}</g></g></g>
    ${[0.18, 0.36].map((o) => `<g class="pfFant" opacity="0"><g opacity="${o}">${parafuso()}</g></g>`).join("")}<g class="pfG" opacity="0">${parafuso()}</g>
    <g class="gotas"></g></g>
    <g transform="translate(640 1150)"><g class="peso"><text class="rot cont" y="0" text-anchor="middle" font-size="96" fill="${C.amarelo}" stroke="rgba(6,10,30,0.85)" stroke-width="12" paint-order="stroke">+0</text>
      <g transform="translate(0 62)">${rotulo("TONELADAS", C.vermelho, 36)}</g></g></g>
    <g transform="translate(640 1180)"><g class="tProm">${rotulo("NO FINAL: E SE O CASCO FURAR?", C.amarelo, 34)}</g></g>
    <g transform="translate(640 1180)"><g class="tAco">${rotulo("TODO DE AÇO", C.ciano, 38)}</g></g>
    <g transform="translate(900 610)"><g class="perg"><circle r="62" fill="#fff"/><text class="rot" y="30" text-anchor="middle" font-size="90" fill="#141a3a">?</text></g></g>`;
  lottieEm($(".nuvensP", el), "nuvens", 540, 560, 1300, 730, { loop: true, vel: 0.5 });
  gaivotas($(".gvs", el), [[160, 640, 0.8, 520], [260, 700, 0.6, 470], [80, 760, 0.5, 560]], c.ini, c.fim);
  animarReflexos($(".reflP", el), c.ini, c.fim);
  ondas($(".cristas", el), MAR + 14, 1420, 12, c.ini, c.fim, "#ffd9b0", 3);
  cintilar($(".cintP", el), 22, [110, MAR + 10, 290, 330], c.ini, c.fim, "#fff6d0", 6);
  ondular([$(".navRefl", el), $(".colunaSol", el), $(".reflP", el)]);
  // o navio navega devagar para a direita (proa à frente); o reflexo acompanha
  const nav = $(".navio", el), refl = $(".navRefl", el), peso = $(".peso", el);
  tl.fromTo([nav, refl], { x: -110 }, { x: 50, duration: c.fim - c.ini, ease: "none", immediateRender: false }, c.ini);
  boiar($(".navioB", el), c.ini, c.fim, 7);
  boiar($(".reflB", el), c.ini, c.fim, 7);
  tl.fromTo($(".esteira", el), { strokeDashoffset: 0 }, { strokeDashoffset: 600, duration: c.fim - c.ini, ease: "none", immediateRender: false }, c.ini);
  // as pessoas no píer
  const pA = $(".pA", el), pB = $(".pB", el), bAD = $(".bracoD", pA), bAE = $(".bracoE", pA), bBD = $(".bracoD", pB);
  vivo(pA, c.ini, c.fim, 3);
  vivo(pB, c.ini, c.fim, 8);
  tl.set(bBD, { rotation: -12, svgOrigin: "0 0" }, 0);
  tl.set([peso, $(".perg", el), $(".tProm", el), $(".furoP", el)], { opacity: 0 }, 0);
  // 100 mil toneladas: ele aponta para o navio
  const tp = B("peso", 0.2);
  gesto(bAD, tp - 0.5, -152, 0.6);
  // contador que cresce junto com a fala (counting-dynamic-scale)
  const tc0 = tp - 0.75, dc = 1.15, cont = $(".cont", el);
  tl.fromTo(peso, { opacity: 0, scale: 0.55, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1, duration: dc, ease: "expo.out", immediateRender: false }, tc0);
  aCadaQuadro((t) => { if (t < tc0 - 0.1 || t > tc0 + dc + 0.2) return; const u = Math.min(1, Math.max(0, (t - tc0) / dc)); cont.textContent = "+" + (Math.round((1 - Math.pow(2, -10 * u)) * 100) * 1000).toLocaleString("pt-BR"); });
  tl.fromTo($(".navioB", el), { scaleY: 1 }, { scaleY: 0.97, duration: 0.14, yoyo: true, repeat: 1, svgOrigin: "0 40", immediateRender: false }, tp + 0.05);
  const ta = B("aco", 0.35);
  tl.to(peso, { opacity: 0, scale: 0.85, duration: 0.22, ease: "power2.in" }, ta - 0.3);
  tl.set($(".tAco", el), { opacity: 0 }, 0);
  tl.fromTo($(".tAco", el), { x: -260, opacity: 0 }, { x: 0, opacity: 1, duration: 0.55, ease: "power4.out", immediateRender: false }, ta - 0.05);
  reflexoPassando($(".tAco", el), "TODO DE AÇO", 38, ta + 0.35);
  // o parafuso: ela levanta e joga no mar; ele cai, espirra e some
  const tf = B("parafuso", 0.5);
  gesto(bAD, tf - 0.8, 0, 0.6, "power2.inOut");
  tl.to($(".tAco", el), { x: 220, opacity: 0, duration: 0.25, ease: "power2.in" }, tf - 0.25);
  gesto(bBD, tf - 0.6, -100, 0.5);
  gesto(bBD, tf + 0.3, -150, 0.22, "power3.in");
  const tsp = tf + 0.45 + 0.75;
  tl.set($(".respingo", el), { opacity: 1 }, tsp);
  tl.fromTo($$(".onda", el), { scale: 0.3, opacity: 1, transformOrigin: "50% 50%" }, { scale: 1.5, opacity: 0, duration: 1.1, stagger: 0.12, ease: "expo.out", immediateRender: false }, tsp);
  gesto(bBD, tf + 0.9, -12, 0.7, "power2.inOut");
  // a pergunta: ele dá de ombros
  const tq = B("pergunta", 0.7);
  gesto(bAD, tq - 0.2, -55, 0.4);
  gesto(bAE, tq - 0.2, 55, 0.4);
  tl.fromTo($(".cabeca", pA), { rotation: 0 }, { rotation: -8, duration: 0.4, yoyo: true, repeat: 1, svgOrigin: "0 30", immediateRender: false }, tq);
  gesto(bAD, tq + 1.1, 0, 0.5, "power2.inOut");
  gesto(bAE, tq + 1.1, 0, 0.5, "power2.inOut");
  pop($(".perg", el), tq);
  tl.fromTo($(".perg", el), { rotation: -8 }, { rotation: 8, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tq + 0.4);
  // promessa (loop aberto): o casco furado, mostrado na parte 5; ela aponta para o casco
  const tpr = B("promessa", 0.85), tfu = B("titulo", 0.95);
  tl.fromTo($(".tProm", el), { y: 70, opacity: 0, scale: 0.9, transformOrigin: "50% 50%" }, { y: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2.2)", immediateRender: false }, tpr - 0.05);
  reflexoPassando($(".tProm", el), "NO FINAL: E SE O CASCO FURAR?", 34, tpr + 0.6);
  gesto(bBD, tfu - 0.4, -95, 0.5);
  pop($(".furoP", el), tfu - 0.1);
  tl.fromTo($(".furoP", el), { scale: 1 }, { scale: 1.35, duration: 0.3, yoyo: true, repeat: 5, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tfu + 0.4);

  // ---- parafuso voando: trajetória balística (função pura do tempo) com rastro de movimento ----
  const tA = tf - 0.25, tL = tf + 0.45, D = 0.75, P0 = [445, 999], P1 = [600, 1322], VY = -900, G = 2 * (P1[1] - P0[1] - VY * D) / (D * D);
  const pfG = $(".pfG", el), fant = $$(".pfFant", el);
  const posPf = (t) => {
    if (t < tL) return [P0[0], P0[1], 0];
    const k = Math.min(t - tL, D);
    return [P0[0] + ((P1[0] - P0[0]) * k) / D, P0[1] + VY * k + 0.5 * G * k * k, 300 * k];
  };
  aCadaQuadro((t) => {
    if (t < tA || t > tL + D + 1) { pfG.setAttribute("opacity", 0); fant.forEach((f) => f.setAttribute("opacity", 0)); return; }
    const u = Math.min(1, (t - tA) / 0.3), cs = 1.7, s = 0.55 * (1 + (cs + 1) * Math.pow(u - 1, 3) + cs * Math.pow(u - 1, 2));
    const afunda = Math.min(1, Math.max(0, (t - tL - D) / 0.5));
    const [x, y, r] = posPf(t);
    pfG.setAttribute("transform", `translate(${x.toFixed(1)} ${(y + 40 * afunda).toFixed(1)}) rotate(${r.toFixed(1)}) scale(${(s * (1 - 0.4 * afunda)).toFixed(3)})`);
    pfG.setAttribute("opacity", (1 - afunda).toFixed(2));
    fant.forEach((f, i) => {
      const voando = t > tL && t < tL + D;
      const [fx, fy, fr] = posPf(t - 0.035 * (2 - i));
      f.setAttribute("transform", `translate(${fx.toFixed(1)} ${fy.toFixed(1)}) rotate(${fr.toFixed(1)}) scale(0.55)`);
      f.setAttribute("opacity", voando ? 1 : 0);
    });
  });
  // ---- respingo: gotas em voo balístico (particle-burst determinístico) ----
  const gotas = $(".gotas", el), NG = 22, tS = tL + D;
  gotas.innerHTML = Array.from({ length: NG }, (_, i) => `<ellipse class="gota" rx="${(3 + 4 * ((i * 7) % 5) / 4).toFixed(1)}" ry="${(4 + 5 * ((i * 3) % 4) / 3).toFixed(1)}" fill="${i % 3 ? "#e8f7ff" : "#9fe6ff"}" opacity="0"/>`).join("");
  const pr = (n) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const gs = $$(".gota", gotas);
  aCadaQuadro((t) => {
    const k = t - tS;
    gs.forEach((g, i) => {
      const vida = 0.65 + 0.4 * pr(i * 3 + 1);
      if (k < 0 || k > vida) { g.setAttribute("opacity", 0); return; }
      const vx = (pr(i * 5 + 2) - 0.5) * 560, vy = -(380 + 520 * pr(i * 7 + 3)), gx = 600 + vx * k, gy = 1318 + vy * k + 0.5 * 2200 * k * k;
      g.setAttribute("transform", `translate(${gx.toFixed(1)} ${gy.toFixed(1)}) rotate(${(Math.atan2(vy + 2200 * k, vx) * 57.3 - 90).toFixed(0)})`);
      g.setAttribute("opacity", (k > vida * 0.6 ? 1 - (k - vida * 0.6) / (vida * 0.4) : 1).toFixed(2));
    });
  });
  // ---- câmera em fases (abre fechada no navio, revela, vai ao píer, volta, aproxima do casco) + micro-deriva ----
  const cam = $(".camP", el), suave = (x) => x * x * (3 - 2 * x);
  const fases = [[0, 1.36, 750, 870], [tp - 0.7, 1.36, 740, 870], [tp + 0.7, 1.025, 540, 900], [tf - 0.8, 1.025, 540, 900], [tf + 0.3, 1.2, 470, 1080],
    [tq - 0.7, 1.2, 470, 1080], [tq + 0.3, 1.025, 540, 900], [tpr - 0.2, 1.025, 540, 900], [tfu + 0.6, 1.2, 610, 960], [c.fim + 1, 1.22, 615, 960]];
  aCadaQuadro((t) => {
    if (t > c.fim + 0.6) return;
    let i = 0;
    while (i < fases.length - 2 && t > fases[i + 1][0]) i++;
    const [t0, s0, x0, y0] = fases[i], [t1, s1, x1, y1] = fases[i + 1], u = suave(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));
    const S = s0 + (s1 - s0) * u, fx = x0 + (x1 - x0) * u + 6 * Math.sin(t * 0.6), fy = y0 + (y1 - y0) * u + 4 * Math.sin(t * 0.78);
    cam.setAttribute("transform", `translate(540 900) scale(${S.toFixed(4)}) translate(${(-fx).toFixed(2)} ${(-fy).toFixed(2)})`);
  });
  // ---- foco seletivo: navio desfoca quando a ação é no píer; pessoas desfocam quando o foco é o casco ----
  const navW = $(".navW", el), gentW = $(".gentW", el), bN = $("#dofNavB"), bG = $("#dofGenteB");
  const envelope = (t, a, b, m) => Math.max(0, Math.min(1, (t - a) / 0.6, (b - t) / 0.6)) * m;
  aCadaQuadro((t) => {
    if (t > c.fim + 0.6) return;
    const vn = envelope(t, tf - 0.8, tq - 0.2, 4), vg = envelope(t, tpr - 0.1, c.fim + 5, 3.5);
    bN.setAttribute("stdDeviation", vn.toFixed(2)); bG.setAttribute("stdDeviation", vg.toFixed(2));
    vn > 0.05 ? navW.setAttribute("filter", "url(#dofNav)") : navW.removeAttribute("filter");
    vg > 0.05 ? gentW.setAttribute("filter", "url(#dofGente)") : gentW.removeAttribute("filter");
  });
};

// =============== 2. a piscina que transborda: empuxo ===============
CENAS.piscina = (el, c, B) => {
  const BORDA = 900, X0 = 140, X1 = 940, FUNDO = 1310, N0 = 944;
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuDia)"/>${halo(880, 420, 300, "solPi")}<circle cx="880" cy="420" r="62" fill="url(#sol)"/>
    <g class="nuvensPi"></g>
    <path d="M-60 820 C 200 740, 420 780, 620 760 S 1000 740, 1140 790 V 900 H -60 Z" fill="#5fbf8f"/>
    <g transform="translate(830 860) scale(0.9)">${casa("#fff3e0", "janelaPi")}</g>
    ${[[110, 860, 1], [300, 870, 0.8], [1010, 875, 0.9]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-9" y="-80" width="18" height="80" fill="#6b4a2f"/><circle cy="-120" r="58" fill="#2f8f6a"/><circle cx="-24" cy="-100" r="38" fill="#3fa77a"/></g>`).join("")}
    <rect y="${BORDA - 14}" width="${W}" height="${H - BORDA}" fill="url(#areia)"/>
    <rect y="${BORDA - 14}" width="${W}" height="18" fill="#e6eaf7"/>
    <rect x="${X0 - 26}" y="${BORDA}" width="${X1 - X0 + 52}" height="${FUNDO - BORDA + 26}" rx="10" fill="#cfe3f5"/>
    <rect x="${X0}" y="${BORDA}" width="${X1 - X0}" height="${FUNDO - BORDA}" fill="#e7f3ff"/>
    <g opacity="0.25">${Array.from({ length: 14 }, (_, k) => `<path d="M${X0 + k * 60} ${BORDA} V ${FUNDO}" stroke="#8fb8e0" stroke-width="2"/>`).join("")}${Array.from({ length: 7 }, (_, k) => `<path d="M${X0} ${BORDA + k * 60} H ${X1}" stroke="#8fb8e0" stroke-width="2"/>`).join("")}</g>
    <rect class="aguaT" x="${X0}" y="${N0}" width="${X1 - X0}" height="${FUNDO - N0}" fill="url(#piscinaA)"/>
    <g transform="translate(540 1130) scale(1.7)"><g class="nadador">${gente(3)}</g></g>
    <rect class="aguaF" x="${X0}" y="${N0}" width="${X1 - X0}" height="${FUNDO - N0}" fill="#36b3ee" opacity="0.55"/>
    <path class="sup" d="M${X0} ${N0} H ${X1}" stroke="#dff6ff" stroke-width="5" opacity="0.9"/>
    <g class="transb" opacity="0">
      <path class="tbE" d="M${X0} ${BORDA - 6} H ${X0 - 130} q -10 4 0 10 H ${X0} Z" fill="#7fe0ff"/>
      <path class="tbD" d="M${X1} ${BORDA - 6} H ${X1 + 130} q 10 4 0 10 H ${X1} Z" fill="#7fe0ff"/>
      ${[X0 - 60, X0 - 110, X1 + 60, X1 + 110].map((x, k) => `<circle class="gota" cx="${x}" cy="${BORDA + 6}" r="7" fill="#7fe0ff"/>`).join("")}</g>
    <g class="empE">${[0, 1].map((k) => `<g transform="translate(${430 - k * 20} ${1050 + k * 90}) rotate(-90)"><g class="fe">${flecha(150, C.ciano, "", 0, "fei")}</g></g>`).join("")}
      ${[0, 1].map((k) => `<g transform="translate(${650 + k * 20} ${1050 + k * 90}) rotate(90)"><g class="fe">${flecha(150, C.ciano, "", 0, "fei")}</g></g>`).join("")}</g>
    <g class="respPi"></g>
    <g transform="translate(540 1240)"><g class="tEmp">${rotulo("ÁGUA EMPURRADA", C.ciano, 32)}</g></g>
    <g transform="translate(830 1290)"><g class="fUp">${flecha(320, C.verde, "", 0, "fu")}</g></g>
    <g transform="translate(830 860)"><g class="tEmpuxo">${rotulo("EMPUXO", C.verde, 46)}</g></g>`;
  lottieEm($(".nuvensPi", el), "nuvens", 540, 520, 1300, 730, { loop: true, vel: 0.6 });
  const nad = $(".nadador", el), aguas = [$(".aguaT", el), $(".aguaF", el)], sup = $(".sup", el);
  const te = B("entra", 0.25), tt = B("transborda", 0.45), tm = B("empurrou", 0.6), tc = B("cima", 0.8), tx = B("empuxo", 0.92);
  tl.set([nad, $(".tEmp", el), $(".tEmpuxo", el), ...$$(".fe", el)], { opacity: 0 }, 0);
  // a pessoa entra na água
  tl.fromTo(nad, { y: -300, opacity: 0 }, { y: -170, opacity: 1, duration: 0.4, ease: "power2.out", immediateRender: false }, te - 0.5);
  tl.to(nad, { y: 0, duration: 0.55, ease: "power2.in" }, te - 0.1);
  faiscas($(".respPi", el), 540, N0, 14, te + 0.4, te + 1.3, "#dff6ff", 220, 8);
  // a água sobe e transborda
  tl.to(aguas, { attr: { y: BORDA, height: FUNDO - BORDA }, duration: 0.9, ease: "power2.out" }, te + 0.35);
  tl.to(sup, { attr: { d: `M${X0} ${BORDA} H ${X1}` }, duration: 0.9, ease: "power2.out" }, te + 0.35);
  tl.set($(".transb", el), { opacity: 1 }, tt - 0.1);
  tl.fromTo($(".tbE", el), { scaleX: 0 }, { scaleX: 1, svgOrigin: `${X0} ${BORDA}`, duration: 0.6, ease: "power2.out", immediateRender: false }, tt - 0.1);
  tl.fromTo($(".tbD", el), { scaleX: 0 }, { scaleX: 1, svgOrigin: `${X1} ${BORDA}`, duration: 0.6, ease: "power2.out", immediateRender: false }, tt - 0.1);
  tl.fromTo($$(".gota", el), { y: 0, opacity: 1 }, { y: 90, opacity: 0, duration: 0.6, stagger: 0.12, repeat: 3, ease: "power1.in", immediateRender: false }, tt + 0.2);
  // o corpo empurrou a água para os lados
  $$(".fe", el).forEach((f, k) => { tl.set(f, { opacity: 1 }, tm + k * 0.08); animFlecha($(".fei", f), tm + k * 0.08); });
  pop($(".tEmp", el), tm + 0.2);
  // a água empurra de volta: para cima
  tl.to([...$$(".fe", el), $(".tEmp", el)], { opacity: 0, duration: 0.3 }, tc - 0.4);
  animFlecha($(".fu", el), tc);
  tl.to(nad, { y: -30, duration: 0.6, ease: "back.out(2)" }, tc + 0.1);
  boiar(nad, tc + 0.8, c.fim, -38);
  pop($(".tEmpuxo", el), tx);
  tl.fromTo($(".fUp", el), { scale: 1 }, { scale: 1.1, duration: 0.4, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "50% 100%", immediateRender: false }, tx);
};

// =============== 3. a regra de Arquimedes: a balança ===============
CENAS.arquimedes = (el, c, B) => {
  const PX = 660, PY = 640, L = 280, Q = 230;
  const prato = (cls, cont, txt, cor) => `<g transform="translate(${PX + (cls === "panE" ? -L : L)} ${PY})"><g class="${cls}">
      <path d="M0 0 L -110 ${Q} M0 0 L 110 ${Q}" stroke="#e6d6a8" stroke-width="4"/>
      ${cont}
      <path d="M-130 ${Q} H 130 Q 110 ${Q + 34} 0 ${Q + 34} Q -110 ${Q + 34} -130 ${Q} Z" fill="url(#cobre)"/>
      <g transform="translate(0 ${Q + 96})">${rotulo(txt, cor, 28)}</g></g></g>`;
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuOuro)"/>${estrelas(24, 13, 0, 420)}
    ${halo(860, 930, 420, "solAr")}<circle cx="860" cy="930" r="70" fill="url(#sol)"/>
    <rect y="960" width="${W}" height="80" fill="url(#marPor)"/>${reflexos(966, 1036, 18, 31, "#ffd9b0", "reflAr")}
    <g class="templo"><g transform="translate(560 960) scale(0.45)">${palacio(620, 400, "#e9d9c6", "ΣΥΡΑΚΟΥΣΑΙ", { mastro: false })}</g></g>
    <rect y="1036" width="${W}" height="${H - 1036}" fill="url(#pisoG)"/>
    ${Array.from({ length: 8 }, (_, k) => `<path d="M${-200 + k * 200} 1036 L ${-700 + k * 340} 1920" stroke="#fff" stroke-opacity="0.08" stroke-width="3"/>`).join("")}
    <rect x="${PX - 11}" y="${PY}" width="22" height="${1300 - PY}" fill="url(#cobreH)"/><path d="M${PX - 90} 1330 H ${PX + 90} L ${PX + 60} 1290 H ${PX - 60} Z" fill="url(#cobre)"/>
    <g class="viga"><rect x="${PX - L - 10}" y="${PY - 9}" width="${2 * L + 20}" height="18" rx="9" fill="url(#cobre)"/></g>
    <circle cx="${PX}" cy="${PY}" r="20" fill="#ffd98a"/>
    ${prato("panE", `<g transform="translate(0 ${Q - 60})"><g class="obj"><rect x="-60" y="-60" width="120" height="120" rx="12" fill="url(#pedra)"/><path d="M-40 -30 l 30 10 M10 20 l 30 -14" stroke="#3b3355" stroke-width="5" stroke-linecap="round"/></g></g>`, "PESO DO OBJETO", C.laranja)}
    ${prato("panD", `<g transform="translate(0 ${Q - 60})"><rect x="-60" y="-60" width="120" height="120" rx="12" fill="url(#agua)" opacity="0.9"/><path d="M-60 -44 q 15 -10 30 0 t 30 0 t 30 0 t 30 0" stroke="#dff6ff" stroke-width="5" fill="none"/></g>`, "PESO DA ÁGUA", C.azul)}
    <g transform="translate(${PX} 520)"><g class="igual"><circle r="56" fill="#fff"/><path d="M-26 -12 H 26 M-26 12 H 26" stroke="#141a3a" stroke-width="10" stroke-linecap="round"/></g></g>
    <g transform="translate(${PX} 420)"><g class="tBoia">${rotulo("BOIA", C.verde, 54)}</g></g>
    <g transform="translate(${PX} 420)"><g class="tAfunda">${rotulo("AFUNDA", C.vermelho, 54)}</g></g>
    <g transform="translate(540 420)"><g class="tOito">${rotulo("AÇO: 8× MAIS PESADO QUE A ÁGUA", C.vermelho, 30)}</g></g>
    <g transform="translate(540 420)"><g class="tPalp">${rotulo("COMENTA SEU PALPITE", C.rosa, 42)}</g></g>
    <g transform="translate(140 1330) scale(1.4)"><g class="arq">${pessoa("#f4efe2", "#d9a27c", "#c9c9d6")}<path d="M-30 -186 C -30 -150, 30 -150, 30 -186 C 20 -168, -20 -168, -30 -186 Z" fill="#c9c9d6"/><path d="M-38 -150 L 38 -60 V -30 L -38 -120 Z" fill="${C.azul}" opacity="0.8"/></g></g>
    <g transform="translate(430 1240)"><g class="tArq">${rotulo("ARQUIMEDES · 250 a.C.", C.amarelo, 28)}</g></g>`;
  animarReflexos($(".reflAr", el), c.ini, c.fim);
  const viga = $(".viga", el), pE = $(".panE", el), pD = $(".panD", el), obj = $(".obj", el);
  const ta = B("arq", 0.15), ti = B("igual", 0.4), tb = B("boia", 0.72), tf = B("afunda", 0.9);
  surge($(".arq", el), c.ini + 0.1, 40);
  tl.set([$(".tArq", el), $(".igual", el), $(".tBoia", el), $(".tAfunda", el)], { opacity: 0 }, 0);
  pop($(".tArq", el), ta);
  // balança equilibrada: empuxo = peso da água deslocada
  pop($(".igual", el), ti);
  const inclina = (t, ang) => {
    const dy = L * Math.sin((ang * Math.PI) / 180);
    tl.to(viga, { rotation: ang, svgOrigin: `${PX} ${PY}`, duration: 0.8, ease: "back.out(1.6)" }, t);
    tl.to(pE, { y: -dy, duration: 0.8, ease: "back.out(1.6)" }, t);
    tl.to(pD, { y: dy, duration: 0.8, ease: "back.out(1.6)" }, t);
  };
  tl.fromTo(viga, { rotation: -8, svgOrigin: `${PX} ${PY}` }, { rotation: 0, svgOrigin: `${PX} ${PY}`, duration: 0.9, ease: "elastic.out(1, 0.5)", immediateRender: false }, ti - 0.3);
  tl.fromTo(pE, { y: L * Math.sin((8 * Math.PI) / 180) }, { y: 0, duration: 0.9, ease: "elastic.out(1, 0.5)", immediateRender: false }, ti - 0.3);
  tl.fromTo(pD, { y: -L * Math.sin((8 * Math.PI) / 180) }, { y: 0, duration: 0.9, ease: "elastic.out(1, 0.5)", immediateRender: false }, ti - 0.3);
  // objeto leve (água pesa mais): boia
  tl.to($(".igual", el), { opacity: 0, duration: 0.3 }, tb - 0.4);
  tl.to(obj, { scale: 0.7, transformOrigin: "50% 100%", duration: 0.4, ease: "power2.out" }, tb - 0.3);
  tl.to($("rect", obj), { attr: { fill: "#c98b4b" }, duration: 0.4 }, tb - 0.3);
  inclina(tb, 10);
  pop($(".tBoia", el), tb + 0.1);
  // objeto pesado (água pesa menos): afunda
  tl.to($(".tBoia", el), { opacity: 0, duration: 0.3 }, tf - 0.35);
  tl.to(obj, { scale: 1.25, transformOrigin: "50% 100%", duration: 0.4, ease: "power2.out" }, tf - 0.3);
  tl.to($("rect", obj), { attr: { fill: "#3b3355" }, duration: 0.4 }, tf - 0.3);
  inclina(tf, -10);
  pop($(".tAfunda", el), tf + 0.1);
  // o problema: o aço é muito mais pesado que a água -> pergunta para o público
  const to = B("oito", 0.94), tpp = B("palpite", 0.98);
  tl.set([$(".tOito", el), $(".tPalp", el)], { opacity: 0 }, 0);
  tl.to($(".tAfunda", el), { opacity: 0, duration: 0.3 }, to - 0.3);
  pop($(".tOito", el), to);
  tl.to($(".tOito", el), { opacity: 0, duration: 0.3 }, tpp - 0.3);
  pop($(".tPalp", el), tpp);
  tl.fromTo($(".tPalp", el), { scale: 1 }, { scale: 1.08, duration: 0.35, yoyo: true, repeat: 5, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tpp + 0.5);
};

// =============== 4. massinha: bola afunda, barquinho boia ===============
CENAS.massinha = (el, c, B) => {
  const NA = 880, X0 = 170, X1 = 910, FT = 1290;
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#parede)"/>
    <g transform="translate(800 470)"><rect x="-170" y="-150" width="340" height="300" rx="14" fill="url(#ceuDia)"/>
      <circle class="solM" cx="60" cy="-60" r="40" fill="url(#sol)"/><path d="M-170 70 C -80 30, 40 60, 170 20 V 150 H -170 Z" fill="#4fae7f"/>
      <rect x="-170" y="-150" width="340" height="300" rx="14" fill="none" stroke="#c9d0e6" stroke-width="16"/><path d="M0 -150 V 150 M-170 0 H 170" stroke="#c9d0e6" stroke-width="10"/></g>
    <g class="raiosM"></g>
    <rect y="${FT}" width="${W}" height="${H - FT}" fill="url(#madeira)"/><rect y="${FT}" width="${W}" height="14" fill="#a8744f"/>
    ${sombra(540, FT + 10, 420, 18, 0.7)}
    <rect x="${X0}" y="720" width="${X1 - X0}" height="${FT - 720}" rx="10" fill="#9fe6ff" opacity="0.12"/>
    <rect class="aguaM" x="${X0 + 10}" y="${NA}" width="${X1 - X0 - 20}" height="${FT - NA - 10}" fill="url(#piscinaA)" opacity="0.85"/>
    <g class="desloc" opacity="0"><path d="M580 ${NA} H 800 L 782 ${NA + 40} H 598 Z" fill="${C.ciano}" opacity="0.55" stroke="#fff" stroke-width="4" stroke-dasharray="12 8"/></g>
    <g class="deslocB" opacity="0"><circle cx="380" cy="1236" r="50" fill="${C.ciano}" opacity="0.4" stroke="#fff" stroke-width="4" stroke-dasharray="12 8"/></g>
    <g class="bolhasM"></g>
    <g transform="translate(380 600)"><g class="massa"><g class="massaR"><path class="forma" d="${BOLA_D}" fill="url(#massaG)"/><path class="arB" d="${BARCO_AR}" fill="${C.ciano}" opacity="0"/></g></g></g>
    <path class="supM" d="M${X0 + 10} ${NA} H ${X1 - 10}" stroke="#dff6ff" stroke-width="4" opacity="0.9"/>
    <rect x="${X0}" y="720" width="${X1 - X0}" height="${FT - 720}" rx="10" fill="none" stroke="#dff6ff" stroke-width="10" opacity="0.55"/>
    <path d="M${X0 + 30} 760 V 1000" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.3"/>
    <g transform="translate(380 1150)"><g class="tAf">${rotulo("AFUNDA", C.vermelho, 34)}</g></g>
    <g transform="translate(690 1000)"><g class="tBo">${rotulo("BOIA", C.verde, 38)}</g></g>
    <g transform="translate(330 470)"><g class="tMesmo">${rotulo("MESMO PESO", C.amarelo, 44)}</g></g>
    <g transform="translate(690 740)"><g class="tAr">${rotulo("OCO: AR", C.ciano, 32)}</g></g>
    <g transform="translate(690 1000)"><g class="tMuita">${rotulo("MUITA ÁGUA EMPURRADA", C.ciano, 30)}</g></g>
    <g transform="translate(380 1150)"><g class="tPouca">${rotulo("POUCA ÁGUA", C.laranja, 28)}</g></g>`;
  const m = $(".massa", el), forma = $(".forma", el);
  const tb = B("bola", 0.2), tbr = B("barco", 0.45), tbo = B("boia2", 0.55), tm = B("mesmo", 0.65), to = B("oco", 0.78), tf = B("fora", 0.92);
  const txts = [".tAf", ".tBo", ".tMesmo", ".tAr", ".tMuita", ".tPouca"].map((s) => $(s, el));
  tl.set(txts, { opacity: 0 }, 0);
  pop(m, c.ini + 0.3);
  // a bola cai na água e afunda até o fundo
  tl.to(m, { y: NA - 600, duration: 0.45, ease: "power2.in" }, tb - 0.3);
  faiscas($(".bolhasM", el), 380, NA + 6, 10, tb + 0.15, tb + 1.0, "#dff6ff", 160, 3);
  tl.to(m, { y: 1236 - 600, duration: 1.1, ease: "power2.out" }, tb + 0.15);
  pop($(".tAf", el), tb + 0.6);
  // vira barquinho: sobe, se transforma e pousa na água
  tl.to($(".tAf", el), { opacity: 0, duration: 0.3 }, tbr - 0.6);
  tl.to(m, { x: 310, y: 120, duration: 0.8, ease: "power2.inOut" }, tbr - 0.5);
  tl.to(forma, { morphSVG: BARCO_D, duration: 0.7, ease: "power2.inOut" }, tbr - 0.2);
  tl.to(m, { y: NA - 600 - 10, duration: 0.6, ease: "power2.in" }, tbo - 0.4);
  tl.fromTo($(".massaR", el), { rotation: -4 }, { rotation: 4, duration: 1.0, yoyo: true, repeat: Math.max(1, Math.floor((c.fim - tbo) / 1.0)), ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tbo + 0.2);
  pop($(".tBo", el), tbo + 0.1);
  // mesmo peso, formato diferente
  pop($(".tMesmo", el), tm);
  tl.to($(".tBo", el), { opacity: 0, duration: 0.3 }, to - 0.3);
  tl.to($(".arB", el), { opacity: 0.55, duration: 0.4 }, to);
  pop($(".tAr", el), to + 0.1);
  // muito mais água empurrada que a bola
  tl.to($(".tMesmo", el), { opacity: 0, duration: 0.3 }, tf - 0.3);
  tl.to($(".desloc", el), { opacity: 1, duration: 0.4 }, tf);
  tl.to($(".deslocB", el), { opacity: 1, duration: 0.4 }, tf + 0.3);
  pop($(".tMuita", el), tf + 0.1);
  pop($(".tPouca", el), tf + 0.4);
};

// =============== 5. o navio por dentro (corte frontal) ===============
CENAS.casco = (el, c, B) => {
  const NA = 1000;
  const HULL = "M200 740 V 1080 Q 200 1170 290 1170 H 790 Q 880 1170 880 1080 V 740 Z";
  const CONTORNO = "M240 450 H 840 V 740 H 880 V 1080 Q 880 1170 790 1170 H 290 Q 200 1170 200 1080 V 740 H 240 Z";
  const SUBM = `M200 ${NA} V 1080 Q 200 1170 290 1170 H 790 Q 880 1170 880 1080 V ${NA} Z`;
  // interior: cabines nos andares de cima, restaurante e teatro no casco, máquinas no fundo
  const salas = [];
  for (let r = 0; r < 5; r++) for (let q = 0; q < 6; q++) salas.push(`<rect class="sala" x="${252 + q * 98}" y="${462 + r * 56}" width="88" height="46" rx="4" fill="#26306a"/>`);
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuNoite)"/>${estrelas(70, 41, 0, 950)}
    ${halo(180, 380, 220, "luaH", "brilhoAzul")}<circle cx="180" cy="380" r="54" fill="url(#lua)"/>
    <rect y="${NA}" width="${W}" height="${H - NA}" fill="url(#marNoite)"/>${reflexos(NA + 6, 1400, 40, 17, "#cfe0ff", "reflC")}
    <g transform="translate(540 ${NA})"><g class="barq">${P(0, 0, 1, "barqI", `<path d="${BARCO_D}" fill="url(#massaG)"/>`)}</g></g>
    <g class="secao">
      <g class="interior">
        <path d="${CONTORNO}" fill="#141c44"/>
        ${salas.join("")}
        <path d="M240 ${462 + 5 * 56 - 6} H 840" stroke="#3b4377" stroke-width="4"/>
        <g class="restaurante">${[0, 1, 2, 3, 4].map((k) => `<rect x="${250 + k * 120}" y="806" width="70" height="10" rx="4" fill="#e9d9c6"/><rect x="${280 + k * 120}" y="816" width="8" height="30" fill="#e9d9c6"/><circle cx="${285 + k * 120}" cy="790" r="7" fill="${C.amarelo}"/>`).join("")}</g>
        <path d="M200 860 H 880" stroke="#3b4377" stroke-width="4"/>
        <g class="teatro"><rect x="380" y="890" width="320" height="150" rx="6" fill="#2a1f3d"/><rect x="420" y="990" width="240" height="40" fill="#8a5a3c"/>
          <path d="M380 890 H 470 C 450 950, 470 1000, 440 1040 H 380 Z" fill="${C.vermelho}"/><path d="M700 890 H 610 C 630 950, 610 1000, 640 1040 H 700 Z" fill="${C.vermelho}"/>
          <path d="M540 890 L 480 990 H 600 Z" fill="#fff1c0" opacity="0.35"/></g>
        <path d="M200 1060 H 880" stroke="#3b4377" stroke-width="4"/>
        <g class="maquinas">${[0, 1, 2].map((k) => `<rect x="${300 + k * 170}" y="1082" width="130" height="60" rx="10" fill="url(#metal)" opacity="0.8"/>`).join("")}</g>
        <path class="ar" d="${CONTORNO}" fill="${C.ciano}" opacity="0"/>
      </g>
      <g class="pele">
        <rect x="240" y="450" width="600" height="290" fill="url(#cascoG)"/>
        ${[0, 1, 2, 3, 4].map((r) => `<rect x="252" y="${468 + r * 56}" width="576" height="26" rx="4" fill="#ffd98a" opacity="0.75"/><rect x="240" y="${494 + r * 56}" width="600" height="6" fill="#aab4d6"/>`).join("")}
        <path d="M200 740 V 1080 Q 200 1170 290 1170 H 790 Q 880 1170 880 1080 V 740 Z" fill="url(#cascoG)"/>
        <rect x="200" y="${NA - 26}" width="680" height="26" fill="#1b2556"/>
        <path d="${SUBM}" fill="url(#fundoCasco)"/>
        ${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((k) => `<circle cx="${240 + k * 75}" cy="800" r="8" fill="#ffd98a" opacity="0.8"/>`).join("")}
      </g>
      <path class="casca" d="${CONTORNO}" fill="none" stroke="#cfd6ea" stroke-width="12" stroke-linejoin="round"/>
      <path d="M720 450 L 736 370 H 816 L 824 450 Z" fill="url(#caudaN)"/><path d="M732 386 H 818 L 820 398 H 730 Z" fill="${C.amarelo}"/>
      <path d="M280 450 C 300 400, 360 390, 380 420 S 430 450, 450 450" fill="none" stroke="${C.rosa}" stroke-width="12" stroke-linecap="round"/>
    </g>
    <path class="desloc" d="${SUBM}" fill="${C.azul}" opacity="0" stroke="#fff" stroke-width="5" stroke-dasharray="16 10"/>
    <rect y="${NA}" width="${W}" height="${H - NA}" fill="#10205a" opacity="0.42"/>
    <path d="M0 ${NA} H ${W}" stroke="#8fe3ff" stroke-width="3" opacity="0.6"/>
    <g transform="translate(540 370)"><g class="tAco">${rotulo("AÇO: SÓ A CASCA", C.laranja, 36)}</g></g>
    <g transform="translate(540 370)"><g class="tArC">${rotulo("POR DENTRO: QUASE TUDO AR", C.ciano, 34)}</g></g>
    <g transform="translate(540 1262)"><g class="tAgua">${rotulo("100 MIL TONELADAS DE ÁGUA", C.azul, 32)}</g></g>
    <g transform="translate(110 1330)"><g class="fUp">${flecha(290, C.verde, "EMPUXO", 0, "fu", 28)}</g></g>
    <g transform="translate(970 560)"><g class="fDn">${flecha(260, C.vermelho, "PESO", 180, "fd", 28)}</g></g>`;
  const sec = $(".secao", el), salasEl = $$(".sala", el);
  const tg = B("gigante", 0.2), tfi = B("fino", 0.35), ta = B("ar", 0.5), tt = B("teatros", 0.65), tw = B("agua", 0.8), ti = B("inteiro", 0.92);
  animarReflexos($(".reflC", el), c.ini, c.fim);
  const txts = [".tAco", ".tArC", ".tAgua"].map((s) => $(s, el));
  tl.set(txts, { opacity: 0 }, 0);
  // o barquinho cresce e vira o navio
  boiar($(".barqI", el), c.ini, tg, 6);
  tl.set(sec, { opacity: 0 }, 0);
  tl.to($(".barq", el), { scale: 3.2, opacity: 0, transformOrigin: "50% 50%", duration: 0.7, ease: "power2.in" }, tg - 0.3);
  tl.fromTo(sec, { scale: 0.22, opacity: 0, svgOrigin: `540 ${NA}` }, { scale: 1, opacity: 1, svgOrigin: `540 ${NA}`, duration: 1.0, ease: "power3.out", immediateRender: false }, tg - 0.15);
  // o aço é só a casca: a pele some e sobra o contorno
  tl.to($(".pele", el), { opacity: 0, duration: 0.7 }, tfi - 0.1);
  tl.to($(".casca", el), { stroke: C.laranja, duration: 0.3 }, tfi);
  desenhar($(".casca", el), tfi, 0.9);
  pop($(".tAco", el), tfi + 0.1);
  // por dentro: ar (cabines, corredores, restaurantes, teatro)
  tl.to($(".tAco", el), { opacity: 0, duration: 0.3 }, ta - 0.3);
  tl.to($(".casca", el), { stroke: "#cfd6ea", duration: 0.5 }, ta);
  tl.to($(".ar", el), { opacity: 0.16, duration: 0.6 }, ta);
  pop($(".tArC", el), ta + 0.05);
  salasEl.forEach((s, k) => tl.to(s, { attr: { fill: "url(#luzSala)" }, duration: 0.2 }, ta + 0.2 + ((k * 7) % salasEl.length) * ((tt - ta - 0.4) / salasEl.length)));
  pop($(".restaurante", el), ta + (tt - ta) * 0.55);
  pop($(".teatro", el), tt);
  // a parte de baixo empurra 100 mil toneladas de água
  tl.to($(".tArC", el), { opacity: 0, duration: 0.3 }, tw - 0.4);
  tl.to($(".desloc", el), { opacity: 0.55, duration: 0.5 }, tw);
  tl.fromTo($(".desloc", el), { strokeDashoffset: 0 }, { strokeDashoffset: -300, duration: c.fim - tw, ease: "none", immediateRender: false }, tw);
  pop($(".tAgua", el), tw + 0.1);
  // empuxo segura o peso
  animFlecha($(".fu", el), ti - 0.15);
  animFlecha($(".fd", el), ti + 0.05);
};

// =============== 6. na prática: linha d'água e compartimentos ===============
CENAS.pratica = (el, c, B) => {
  const NA = 1000, ALTO = -30;
  const guindaste = (x, h) => `<g transform="translate(${x} ${NA})"><path d="M-14 0 V ${-h} H 14 V 0 Z" fill="#e0a83a"/><path d="M-40 ${-h} H 220 V ${-h + 22} H -40 Z" fill="#e0a83a"/><path d="M180 ${-h + 22} V ${-h + 140}" stroke="#3b4377" stroke-width="4"/>${Array.from({ length: Math.floor(h / 40) }, (_, k) => `<path d="M-14 ${-k * 40} L 14 ${-k * 40 - 40}" stroke="#b98422" stroke-width="4"/>`).join("")}</g>`;
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuDia)"/>${halo(900, 420, 300, "solPr")}<circle cx="900" cy="420" r="56" fill="url(#sol)"/>
    <g class="nuvensPr"></g>
    <g class="porto">${guindaste(110, 560)}${guindaste(900, 500)}<rect y="${NA - 40}" width="${W}" height="40" fill="#7b86a8"/></g>
    <rect y="${NA}" width="${W}" height="${H - NA}" fill="url(#marDia)"/>${reflexos(NA + 8, 1400, 40, 23, "#ffffff", "reflPr")}
    <g transform="translate(560 ${NA}) scale(0.9)"><g class="navP">${navio({ calado: 130, raiox: true })}
      ${[[-170, C.laranja], [-108, C.verde], [-46, C.azul], [16, C.rosa]].map(([x, cor]) => `<g transform="translate(${x} -316)"><g class="caixa"><rect y="-46" width="56" height="46" rx="5" fill="${cor}"/><path d="M8 -38 V -8 M20 -38 V -8 M32 -38 V -8 M44 -38 V -8" stroke="#000" stroke-opacity="0.15" stroke-width="4"/></g></g>`).join("")}</g></g>
    <rect class="aguaFr" y="${NA}" width="${W}" height="${H - NA}" fill="#1a5fc0" opacity="0.5"/>
    <path d="M0 ${NA} H ${W}" stroke="#dff6ff" stroke-width="4" opacity="0.8"/>
    <g class="cLinha" opacity="0">${callout(695, 972, 600, 1210, "LINHA D'ÁGUA", C.amarelo)}</g>
    <g transform="translate(540 500)"><g class="tEq">${rotulo("PESO = EMPUXO", C.verde, 42)}</g></g>
    <g transform="translate(540 500)"><g class="tVaza">${rotulo("E SE O CASCO FURAR?", C.vermelho, 42)}</g></g>
    <g transform="translate(540 500)"><g class="tTit">${rotulo("TITANIC, 1912", C.vermelho, 46)}<g transform="translate(0 84)">${rotulo("PAREDES BAIXAS: A ÁGUA PASSOU POR CIMA", C.laranja, 26)}</g></g></g>
    <g transform="translate(540 500)"><g class="tComp">${rotulo("COMPARTIMENTOS FECHADOS", C.ciano, 36)}</g></g>
    <g transform="translate(540 500)"><g class="tOk">${check(C.verde)}<g transform="translate(0 90)">${rotulo("CONTINUA BOIANDO", C.verde, 40)}</g></g></g>`;
  lottieEm($(".nuvensPr", el), "nuvens", 540, 560, 1300, 730, { loop: true, vel: 0.5 });
  animarReflexos($(".reflPr", el), c.ini, c.fim);
  const nav = $(".navP", el), caixas = $$(".caixa", el);
  const tli = B("linha", 0.15), tca = B("carga", 0.35), teq = B("equilibra", 0.5), tv = B("vaza", 0.65), tco = B("comp", 0.78), ts = B("seguro", 0.92);
  tl.set([...caixas, $(".tEq", el), $(".tComp", el), $(".tOk", el)], { opacity: 0 }, 0);
  // vazio, o navio flutua mais alto (aparece a pintura vermelha do fundo)
  tl.set(nav, { y: ALTO }, 0);
  surge($(".porto", el), c.ini + 0.1, 30);
  callAnim($(".cLinha", el), tli);
  // carga e passageiros: ele afunda um pouco até equilibrar
  tl.to($(".cLinha", el), { opacity: 0, duration: 0.3 }, tca - 0.2);
  caixas.forEach((k, i) => tl.fromTo(k, { y: -360, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "bounce.out", immediateRender: false }, tca + i * 0.15));
  tl.to(nav, { y: 0, duration: 1.6, ease: "power2.inOut" }, tca + 0.3);
  pop($(".tEq", el), teq);
  // raio-x do casco: compartimentos estanques; um enche, o resto segura
  tl.to($(".tEq", el), { opacity: 0, duration: 0.3 }, tv - 0.3);
  tl.to($(".aguaFr", el), { opacity: 0.15, duration: 0.5 }, tv - 0.2);
  tl.to($(".raiox", el), { opacity: 1, duration: 0.5 }, tv - 0.2);
  pop($(".furo", el), tv + 0.2);
  pop($(".tVaza", el), tv);
  tl.to($(".tVaza", el), { opacity: 0, duration: 0.3 }, tco - 0.3);
  tl.to($(".inunda", el), { attr: { y: -40, height: 130 - 10 + 40 }, duration: 2.4, ease: "power1.inOut" }, tv + 0.3);
  tl.to($$(".antepara", el), { stroke: C.amarelo, duration: 0.3, stagger: 0.06 }, tco);
  desenhar($$(".antepara", el), tco, 0.5);
  pop($(".tComp", el), tco + 0.1);
  tl.to(nav, { y: 8, duration: 1.2, ease: "power2.out" }, tv + 0.6);
  tl.to($(".tComp", el), { opacity: 0, duration: 0.3 }, ts - 0.3);
  pop($(".tOk", el), ts);
  // fato-surpresa: no Titanic a água passou por cima das paredes, de um compartimento ao outro
  const tti = B("titanic", 0.95), tpa = B("passa", 0.97);
  tl.set([$(".tVaza", el), $(".tTit", el)], { opacity: 0 }, 0);
  tl.to($(".tOk", el), { opacity: 0, duration: 0.3 }, tti - 0.3);
  pop($(".tTit", el), tti);
  tl.to($$(".antepara", el), { stroke: C.vermelho, duration: 0.3 }, tti);
  tl.to($(".inunda", el), { attr: { y: -112, height: 130 - 10 + 112 }, duration: 0.6 }, tpa - 0.4);
  tl.to($(".inunda2", el), { attr: { y: -112, height: 130 - 10 + 112 }, duration: 1.0, ease: "power1.in" }, tpa);
  tl.to($(".inunda3", el), { attr: { y: -112, height: 130 - 10 + 112 }, duration: 1.0, ease: "power1.in" }, tpa + 0.9);
  tl.to(nav, { y: 40, rotation: 2.5, svgOrigin: "0 0", duration: 2.2, ease: "power1.in" }, tpa);
};

// =============== 7. na sua vida: pulmão, colete e submarino ===============
CENAS.voce = (el, c, B) => {
  const SUP = 640;
  const sub = () => `<path d="M-40 -66 L -28 -136 H 72 L 92 -66 Z" fill="url(#subG)"/><rect x="16" y="-176" width="8" height="44" fill="#9aa7c7"/><rect x="16" y="-176" width="30" height="8" fill="#9aa7c7"/>
    <path d="M-250 0 C -250 -56, -120 -70, 0 -70 C 150 -70, 240 -42, 256 0 C 240 42, 150 70, 0 70 C -120 70, -250 56, -250 0 Z" fill="url(#subG)"/>
    <path d="M-250 0 l -30 -40 v 80 z" fill="#5d6890"/><rect x="-270" y="-8" width="40" height="16" fill="${C.amarelo}"/>
    ${[["tq1", -180], ["tq2", 40]].map(([k, x]) => `<rect x="${x}" y="-32" width="130" height="64" rx="16" fill="#0b1440"/><rect class="tqA" x="${x}" y="32" width="130" height="0" fill="${C.azul}"/><rect x="${x}" y="-32" width="130" height="64" rx="16" fill="none" stroke="#8fe3ff" stroke-width="4"/>`).join("")}
    ${[0, 1, 2].map((k) => `<circle cx="${-30 + k * 26}" cy="-46" r="7" fill="#ffd98a"/>`).join("")}`;
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuDia)"/>
    <g class="nuvensV"></g>
    <rect y="${SUP}" width="${W}" height="${H - SUP}" fill="url(#fundoMar)"/>
    <g class="raiosV"></g>
    <g class="bkV"></g>
    <path d="M0 1330 C 200 1300, 380 1340, 560 1310 S 900 1300, 1080 1330 V 1920 H 0 Z" fill="url(#areia)"/>
    ${[[120, 1320], [470, 1310], [960, 1320]].map(([x, y], k) => `<g transform="translate(${x} ${y})"><g class="alga">${[0, 1, 2].map((q) => `<path d="M${q * 18 - 18} 0 C ${q * 18 - 40} -60, ${q * 18 + 10} -100, ${q * 18 - 14} ${-150 - q * 20}" stroke="${k % 2 ? "#06a07a" : "#2f8f6a"}" stroke-width="10" fill="none" stroke-linecap="round"/>`).join("")}</g></g>`).join("")}
    <g transform="translate(250 860) scale(1.45)"><g class="nad"><g class="nadB">${gente(5)}
      <g class="pulm"><ellipse cx="-14" cy="-112" rx="12" ry="24" fill="${C.ciano}"/><ellipse cx="14" cy="-112" rx="12" ry="24" fill="${C.ciano}"/></g>
      <g class="colete"><rect x="-44" y="-164" width="88" height="98" rx="22" fill="${C.laranja}"/><path d="M-44 -132 H 44 M-44 -100 H 44" stroke="#c2531c" stroke-width="6"/><rect x="-6" y="-164" width="12" height="98" fill="#ffd23f"/></g></g></g></g>
    <rect y="${SUP}" width="${W}" height="${1330 - SUP}" fill="#1f7fd6" opacity="0.28"/>
    <path d="M0 ${SUP} H ${W}" stroke="#dff6ff" stroke-width="5" opacity="0.9"/>
    <rect y="${SUP}" width="${W}" height="16" fill="#dff6ff" opacity="0.25"/>
    <g transform="translate(760 1000) scale(0.82)"><g class="sub"><g class="subB">${sub()}</g></g></g>
    <g class="bolhasV"></g>
    <g transform="translate(270 470)"><g class="tPul">${rotulo("AR NO PULMÃO", C.ciano, 36)}</g></g>
    <g transform="translate(300 470)"><g class="tCol">${rotulo("MUITO ESPAÇO, POUCO PESO", C.laranja, 28)}</g></g>
    <g transform="translate(780 760)"><g class="tDesce">${rotulo("ÁGUA NOS TANQUES: DESCE", C.azul, 26)}</g></g>
    <g transform="translate(780 760)"><g class="tSobe">${rotulo("AR NOS TANQUES: SOBE", C.verde, 26)}</g></g>`;
  lottieEm($(".nuvensV", el), "nuvens", 540, 330, 1300, 600, { loop: true, vel: 0.6 });
  const nad = $(".nad", el), sb = $(".sub", el);
  const tp = B("pulmao", 0.15), tb = B("boiaP", 0.3), tc = B("colete", 0.45), ts = B("sub", 0.62), td = B("desce", 0.8), tsb = B("sobe", 0.92);
  const txts = [".tPul", ".tCol", ".tDesce", ".tSobe", ".pulm", ".colete"].map((s) => $(s, el));
  tl.set([...txts, sb], { opacity: 0 }, 0);
  boiar($(".nadB", el), c.ini, c.fim, 8);
  // pulmão cheio: boia melhor
  pop($(".pulm", el), tp);
  tl.fromTo($(".pulm", el), { scale: 1 }, { scale: 1.3, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tp + 0.4);
  pop($(".tPul", el), tp + 0.1);
  tl.to(nad, { y: -26, duration: 0.7, ease: "back.out(2)" }, tb);
  // colete: muito espaço, pouco peso
  tl.to([$(".tPul", el), $(".pulm", el)], { opacity: 0, duration: 0.3 }, tc - 0.3);
  pop($(".colete", el), tc);
  tl.to(nad, { y: -60, duration: 0.7, ease: "back.out(2)" }, tc + 0.3);
  pop($(".tCol", el), tc + 0.1);
  // submarino: enche os tanques para descer, sopra ar para subir
  surge(sb, ts - 0.2, 80);
  tl.to($(".tCol", el), { opacity: 0, duration: 0.3 }, td - 0.6);
  tl.to($$(".tqA", el), { attr: { y: -32, height: 64 }, duration: 0.8, ease: "power1.inOut" }, td - 0.3);
  tl.to(sb, { y: 220, rotation: 4, transformOrigin: "50% 50%", duration: 1.4, ease: "power2.inOut" }, td);
  pop($(".tDesce", el), td);
  tl.to($(".tDesce", el), { opacity: 0, duration: 0.3 }, tsb - 0.35);
  tl.to($$(".tqA", el), { attr: { y: 32, height: 0 }, duration: 0.7, ease: "power1.inOut" }, tsb - 0.1);
  faiscas($(".bolhasV", el), 720, 1180, 14, tsb, tsb + 1.6, "#dff6ff", 260, 19);
  tl.to(sb, { y: -150, rotation: -5, transformOrigin: "50% 50%", duration: 1.6, ease: "power2.inOut" }, tsb + 0.2);
  pop($(".tSobe", el), tsb + 0.1);
  boiar($(".subB", el), c.ini, c.fim, 10);
};

// =============== 8. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const passos = [["TUDO EMPURRA ÁGUA PRA FORA", C.amarelo], ["A ÁGUA EMPURRA PRA CIMA", C.azul], ["LEVE PRO TAMANHO? BOIA", C.verde], ["NAVIO: QUASE TODO AR", C.rosa]];
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuNoite)"/>${estrelas(70, 91, 0, 1280)}
    <rect y="1290" width="${W}" height="${H - 1290}" fill="url(#marNoite)"/>${reflexos(1296, 1400, 20, 61, "#cfe0ff", "reflR")}
    <path class="espinha" d="M170 470 V 1150" stroke="rgba(255,255,255,0.25)" stroke-width="6" stroke-linecap="round"/>
    ${passos.map(([t, cor], k) => `<g transform="translate(170 ${470 + k * 226})"><g class="passo"><circle r="62" fill="${cor}"/><text class="rot" y="22" text-anchor="middle" font-size="60" fill="#141a3a">${k + 1}</text><text class="rot" x="96" y="16" font-size="${t.length > 22 ? 38 : 44}" fill="#fff">${t}</text></g></g>`).join("")}
    <g transform="translate(-200 1290) scale(0.3)"><g class="navR">${navio({ noite: true })}</g></g>`;
  animarReflexos($(".reflR", el), c.ini, c.fim);
  const ps = $$(".passo", el);
  tl.set(ps, { opacity: 0 }, c.ini);
  desenhar($(".espinha", el), c.ini + 0.2, 1.2);
  ["passo1", "passo2", "passo3", "passo4"].forEach((b, k) => tl.fromTo(ps[k], { x: -80, opacity: 0, scale: 0.8 }, { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)", immediateRender: false }, B(b, 0.15 + k * 0.15)));
  const tv = B("flutua", 0.7), tcta = B("cta", 0.8);
  tl.fromTo($(".navR", el), { x: 0 }, { x: 1600 / 0.3, duration: 4.5, ease: "power1.inOut", immediateRender: false }, tv - 0.6);
  tl.to([...ps, $(".espinha", el)], { opacity: 0, x: -60, duration: 0.4, stagger: 0.04, ease: "power2.in" }, tcta - 0.45);
  cartaoFinal(el, tcta);
  lottieEm(el, "confete", 540, 900, 1080, 1440, { ini: tcta + 0.2, fim: T, loop: false, corte: true });
};

// =============== efeitos de luz e acabamento ===============
const _comEfeitos = (tipo, fx) => { const base = CENAS[tipo]; CENAS[tipo] = (el, c, B, i, f) => { base(el, c, B, i, f); fx(el, c, B, f); }; };
_comEfeitos("porto", (el, c) => {
  $(".solP", el).insertAdjacentHTML("afterend", raiosLuz(250, 990, 16, 200, 900, -90, "raiosP", 3));
  animarRaios($(".raiosP", el), 0, c.fim);
  $(".pier", el).insertAdjacentHTML("beforebegin", flare(250, 990, 0.7));
  el.insertAdjacentHTML("beforeend", `<g class="bkP"></g>`);
  bokeh($(".bkP", el), 12, 5, [0, 300, W, 700], 0, c.fim, ["#ffd23f", "#ff8aa4", "#fff3c0"]);
  desfocar($(".ilhas", el), 1);
  volume([$(".navioB", el), $(".pA", el), $(".pB", el)]);
  brilhar($(".pfG", el));
});
_comEfeitos("piscina", (el, c) => {
  $(".solPi", el).insertAdjacentHTML("afterend", raiosLuz(880, 420, 12, 140, 700, 120, "raiosPi", 7));
  animarRaios($(".raiosPi", el), c.ini, c.fim);
  volume($(".nadador", el));
  brilhar([$(".fu", el), $(".tEmpuxo", el)]);
});
_comEfeitos("arquimedes", (el, c) => {
  desfocar($(".templo", el), 1);
  volume([$(".arq", el), $(".obj", el)]);
  el.insertAdjacentHTML("beforeend", `<g class="bkA"></g>`);
  bokeh($(".bkA", el), 12, 11, [0, 300, W, 800], c.ini, c.fim, ["#ffd23f", "#ff8aa4", "#fff3c0"]);
});
_comEfeitos("massinha", (el, c) => {
  $(".raiosM", el).insertAdjacentHTML("beforeend", raiosLuz(800, 470, 10, 50, 1100, 120, "raiosMi", 13));
  animarRaios($(".raiosMi", el), c.ini, c.fim);
  volume($(".massaR", el));
  brilhar([$(".arB", el), $(".desloc", el)]);
  el.insertAdjacentHTML("beforeend", `<g class="poM"></g>`);
  poeira($(".poM", el), 26, 9, [300, 400, 700, 800], c.ini, c.fim, "#fff1c0");
});
_comEfeitos("casco", (el, c) => {
  brilhar([$(".casca", el), $(".desloc", el), $(".fu", el), $(".fd", el)]);
  el.insertAdjacentHTML("beforeend", `<g class="bkC"></g>`);
  bokeh($(".bkC", el), 12, 21, [0, 300, W, 600], c.ini, c.fim, ["#8fe3ff", "#ffd23f"]);
});
_comEfeitos("pratica", (el, c) => {
  $(".solPr", el).insertAdjacentHTML("afterend", raiosLuz(900, 420, 12, 140, 700, 120, "raiosPr", 9));
  animarRaios($(".raiosPr", el), c.ini, c.fim);
  desfocar($(".porto", el), 1);
  brilhar($(".tOk", el));
});
_comEfeitos("voce", (el, c) => {
  $(".raiosV", el).insertAdjacentHTML("beforeend", raiosLuz(540, 560, 14, 70, 900, 90, "raiosVi", 27));
  animarRaios($(".raiosVi", el), c.ini, c.fim);
  bokeh($(".bkV", el), 18, 33, [0, 700, W, 600], c.ini, c.fim, ["#dff6ff", "#8fe3ff"]);
  volume([$(".subB", el), $(".nadB", el)]);
  desfocar($$(".alga", el), 1);
});
_comEfeitos("resumo", (el, c) => { $$(".passo", el).forEach((p) => brilhar(p.querySelector("circle"))); el.firstElementChild.insertAdjacentHTML("afterend", `<g class="bkR"></g>`); bokeh($(".bkR", el), 16, 37, [0, 300, W, 1000], c.ini, c.fim, ["#ffd23f", "#4cc9f0", "#ff5d8f"]); });
