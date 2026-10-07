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

// Cada cena: o mundo fica dentro de <g class="cam"> (câmera em fases, foco seletivo);
// rótulos que precisam ficar parados na tela ficam fora dele.
const ceu = (grad) => `<rect x="-200" y="-200" width="${W + 400}" height="${H + 400}" fill="url(#${grad})"/>`;
const faixa = (y, h, fill, extra) => `<rect x="-200" y="${y}" width="${W + 400}" height="${h}" fill="${fill}" ${extra || ""}/>`;

// bola de praia (centro 0,0, raio r): gomos coloridos + brilho
const bolaPraia = (r) => {
  const cores = [C.vermelho, "#ffffff", C.amarelo, "#ffffff", C.azul, "#ffffff"];
  const gomo = (k) => { const a0 = (k * 60 - 90) * Math.PI / 180, a1 = ((k + 1) * 60 - 90) * Math.PI / 180;
    return `<path d="M0 0 L ${(r * Math.cos(a0)).toFixed(1)} ${(r * Math.sin(a0)).toFixed(1)} A ${r} ${r} 0 0 1 ${(r * Math.cos(a1)).toFixed(1)} ${(r * Math.sin(a1)).toFixed(1)} Z" fill="${cores[k]}"/>`; };
  return `${Array.from({ length: 6 }, (_, k) => gomo(k)).join("")}<circle r="${r * 0.16}" fill="#fff"/><circle r="${r}" fill="url(#bolaSombra)"/>
    <ellipse cx="${-r * 0.35}" cy="${-r * 0.4}" rx="${r * 0.28}" ry="${r * 0.16}" fill="#fff" opacity="0.55" transform="rotate(-30 ${-r * 0.35} ${-r * 0.4})"/>`;
};
$("#defs").insertAdjacentHTML("beforeend", `<radialGradient id="bolaSombra" cx="0.35" cy="0.3" r="0.75"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#0a1230" stop-opacity="0.45"/></radialGradient>
  <radialGradient id="pulmaoG" cx="0.4" cy="0.35"><stop offset="0" stop-color="#ffb3c7"/><stop offset="1" stop-color="#d9476f"/></radialGradient>`);

// =============== 1. gancho: o navio gigante no pôr do sol ===============
CENAS.porto = (el, c, B) => {
  mostrarGancho(B("titulo", 0.85) - 0.2);
  const MAR = 1040, PIER = 1300, SN = 0.86;
  const espuma = `<path d="M470 -4 C 510 -16, 548 -14, 566 -2 C 590 8, 620 10, 650 4" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity="0.8"/>
    <ellipse cx="540" cy="4" rx="70" ry="9" fill="#fff" opacity="0.45"/>
    <g class="esteira">${[0, 1, 2, 3].map((k) => `<path d="M-500 ${2 + k * 5} C -620 ${4 + k * 10}, -760 ${8 + k * 18}, -940 ${10 + k * 28}" fill="none" stroke="#fff" stroke-width="${5 - k}" stroke-dasharray="40 26" opacity="${0.55 - k * 0.1}"/>`).join("")}</g>`;
  el.innerHTML = `<g class="cam">${ceu("ceuCrep")}${estrelas(30, 9, 0, 420)}
    ${halo(250, 990, 460, "solP")}<circle cx="250" cy="990" r="78" fill="url(#sol)"/>
    <g class="nuvensP"></g>
    <g class="ilhas"><path d="M-240 ${MAR} C 80 960, 200 950, 320 1000 S 480 1000, 560 ${MAR} Z" fill="#3a3373" opacity="0.9"/>
      <path d="M600 ${MAR} C 720 990, 880 990, 1300 950 V ${MAR} Z" fill="#2f2a66" opacity="0.9"/>
      ${Array.from({ length: 9 }, (_, k) => `<rect x="${640 + k * 50}" y="${MAR - 30 - ((k * 37) % 50)}" width="34" height="${30 + ((k * 37) % 50)}" fill="#2a2560"/><rect x="${650 + k * 50}" y="${MAR - 22 - ((k * 37) % 50)}" width="6" height="6" fill="#ffd98a" opacity="0.7"/>`).join("")}</g>
    ${faixa(MAR, H - MAR + 200, "url(#marPor)")}
    <g class="colunaSol"><path d="M226 ${MAR} L 90 1440 H 420 L 274 ${MAR} Z" fill="#ffb36b" opacity="0.2"/>${reflexos(MAR + 6, 1420, 60, 4, "#ffe2b8", "reflSol").replace('class="reflSol"', 'class="reflSol" transform="translate(110 0) scale(0.25 1)"')}</g>
    <mask id="mReflP" maskUnits="userSpaceOnUse" x="-200" y="${MAR}" width="${W + 400}" height="420"><rect x="-200" y="${MAR}" width="${W + 400}" height="420" fill="url(#fadeRefl)"/></mask>
    <g mask="url(#mReflP)"><g transform="translate(610 ${MAR})"><g class="navRefl"><g transform="scale(${SN} ${-SN})"><g class="reflB">${navio()}</g></g></g></g></g>
    ${faixa(MAR, H - MAR + 200, "url(#marPor)", 'opacity="0.45"')}
    ${reflexos(MAR + 8, 1400, 46, 4, "#ffd9b0", "reflP")}
    <g class="cristas"></g><g class="cintP"></g><g class="gvs"></g>
    <g class="navW"><g transform="translate(610 ${MAR}) scale(${SN})"><g class="navio"><g class="navioB">${navio()}${espuma}<g transform="translate(300 -6)"><g class="furoP"><circle r="18" fill="#0b1440" stroke="${C.vermelho}" stroke-width="7"/></g></g></g></g></g></g>
    ${faixa(MAR, 38, "#2a2a70", 'opacity="0.45"')}
    <path d="M-200 ${MAR} H ${W + 200}" stroke="#ffd9b0" stroke-width="3" opacity="0.5"/>
    <g class="respingo" opacity="0">${[0, 1, 2].map((k) => `<ellipse class="onda" cx="600" cy="1324" rx="${40 + k * 34}" ry="${9 + k * 7}" fill="none" stroke="#fff" stroke-width="4"/>`).join("")}</g>
    <g class="pierW"><g class="pier">
      ${[30, 200, 380].map((x) => `<rect x="${x}" y="${PIER}" width="26" height="160" fill="#4f301f"/><rect x="${x}" y="${PIER + 110}" width="26" height="50" fill="#2a1f3d" opacity="0.5"/>`).join("")}
      <rect x="-220" y="${PIER - 4}" width="680" height="30" rx="4" fill="url(#madeira)"/>
      ${Array.from({ length: 15 }, (_, k) => `<path d="M${-220 + k * 46} ${PIER - 4} V ${PIER + 26}" stroke="#3a2416" stroke-width="3"/>`).join("")}
      <rect x="-220" y="${PIER - 4}" width="680" height="5" fill="#c99a6a"/>
      <rect x="160" y="${PIER - 46}" width="44" height="46" rx="10" fill="#2a1f3d"/><rect x="152" y="${PIER - 54}" width="60" height="14" rx="7" fill="#3b3355"/>
      <rect x="14" y="${PIER - 250}" width="12" height="250" fill="#2a1f3d"/><path d="M20 ${PIER - 250} q 0 -30 40 -30" stroke="#2a1f3d" stroke-width="8" fill="none"/>
      ${halo(60, PIER - 262, 70, "lanternaH")}<rect x="48" y="${PIER - 272}" width="24" height="26" rx="6" fill="#ffe9a0"/></g></g>
    ${[0.18, 0.36].map((o) => `<g class="pfFant" opacity="0"><g opacity="${o}">${parafuso()}</g></g>`).join("")}<g class="pfG" opacity="0">${parafuso()}</g>
    <g class="gotas"></g></g>
    <g transform="translate(640 1150)"><g class="peso"><text class="rot cont" y="0" text-anchor="middle" font-size="96" fill="${C.amarelo}" stroke="rgba(6,10,30,0.85)" stroke-width="12" paint-order="stroke">+0</text>
      <g transform="translate(0 62)">${rotulo("TONELADAS", C.vermelho, 36)}</g></g></g>
    <g transform="translate(640 1180)"><g class="tAco">${rotulo("TODO DE AÇO", C.ciano, 38)}</g></g>
    <g transform="translate(640 1180)"><g class="tProm">${rotulo("NO FINAL: E SE O CASCO FURAR?", C.amarelo, 34)}</g></g>
    <g transform="translate(900 610)"><g class="perg"><circle r="62" fill="#fff"/><text class="rot" y="30" text-anchor="middle" font-size="90" fill="#141a3a">?</text></g></g>`;
  lottieEm($(".nuvensP", el), "nuvens", 540, 560, 1300, 730, { loop: true, vel: 0.5 });
  gaivotas($(".gvs", el), [[160, 640, 0.8, 520], [260, 700, 0.6, 470], [80, 760, 0.5, 560]], c.ini, c.fim);
  animarReflexos($(".reflP", el), c.ini, c.fim);
  ondas($(".cristas", el), MAR + 14, 1420, 12, c.ini, c.fim, "#ffd9b0", 3);
  cintilar($(".cintP", el), 22, [110, MAR + 10, 290, 330], c.ini, c.fim, "#fff6d0", 6);
  ondular([$(".navRefl", el), $(".colunaSol", el), $(".reflP", el)]);
  const nav = $(".navio", el), refl = $(".navRefl", el), peso = $(".peso", el);
  tl.fromTo([nav, refl], { x: -110 }, { x: 50, duration: c.fim - c.ini, ease: "none", immediateRender: false }, c.ini);
  boiar($(".navioB", el), c.ini, c.fim, 7);
  boiar($(".reflB", el), c.ini, c.fim, 7);
  tl.fromTo($(".esteira", el), { strokeDashoffset: 0 }, { strokeDashoffset: 600, duration: c.fim - c.ini, ease: "none", immediateRender: false }, c.ini);
  tl.fromTo($(".lanternaH", el), { opacity: 0.7 }, { opacity: 1, duration: 0.9, yoyo: true, repeat: Math.floor((c.fim - c.ini) / 0.9), ease: "sine.inOut", immediateRender: false }, c.ini);
  const tp = B("peso", 0.2), ta = B("aco", 0.35), tf = B("parafuso", 0.5), tq = B("pergunta", 0.7), tpr = B("promessa", 0.85), tfu = B("titulo", 0.95);
  tl.set($(".furoP", el), { opacity: 0 }, 0);
  // contador que cresce até 100.000 junto com a fala
  const tc0 = tp - 0.75, dc = 1.15;
  entrar(peso, tc0, "escala");
  contador($(".cont", el), 0, 100000, tc0, dc, (v) => "+" + (Math.round(v / 1000) * 1000).toLocaleString("pt-BR"));
  tl.fromTo($(".navioB", el), { scaleY: 1 }, { scaleY: 0.97, duration: 0.14, yoyo: true, repeat: 1, svgOrigin: "0 40", immediateRender: false }, tp + 0.05);
  sair(peso, ta - 0.3);
  entrar($(".tAco", el), ta - 0.05, "esq");
  reflexoPassando($(".tAco", el), "TODO DE AÇO", 38, ta + 0.35);
  sair($(".tAco", el), tf - 0.45, "dir");
  // o parafuso cai do alto, girando, com rastro de movimento; espirra e some
  const tA = tf - 0.2, tL = tf + 0.1, D = 0.85, P0 = [520, 640], P1 = [600, 1322], VY = -260, G = 2 * (P1[1] - P0[1] - VY * D) / (D * D);
  const pfG = $(".pfG", el), fant = $$(".pfFant", el);
  const posPf = (t) => { if (t < tL) return [P0[0], P0[1], 0]; const k = Math.min(t - tL, D); return [P0[0] + ((P1[0] - P0[0]) * k) / D, P0[1] + VY * k + 0.5 * G * k * k, 320 * k]; };
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
  respingo($(".gotas", el), 600, 1318, tsp, 22, { seed: 1 });
  // a pergunta
  entrar($(".perg", el), tq, "mola");
  tl.fromTo($(".perg", el), { rotation: -8 }, { rotation: 8, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tq + 0.5);
  // promessa (loop aberto): o casco furado, mostrado na parte 5
  entrar($(".tProm", el), tpr - 0.05, "baixo");
  reflexoPassando($(".tProm", el), "NO FINAL: E SE O CASCO FURAR?", 34, tpr + 0.6);
  pop($(".furoP", el), tfu - 0.1);
  tl.fromTo($(".furoP", el), { scale: 1 }, { scale: 1.35, duration: 0.3, yoyo: true, repeat: 5, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tfu + 0.4);
  // câmera: abre fechada no navio, revela, desce ao píer no parafuso, volta, fecha no casco
  cameraFases($(".cam", el), [[0, 1.36, 750, 870], [tp - 0.7, 1.36, 740, 870], [tp + 0.7, 1.025, 540, 900], [tf - 0.8, 1.025, 540, 900], [tf + 0.3, 1.2, 470, 1080],
    [tq - 0.7, 1.2, 470, 1080], [tq + 0.3, 1.025, 540, 900], [tpr - 0.2, 1.025, 540, 900], [tfu + 0.6, 1.2, 610, 960], [c.fim + 1, 1.22, 615, 960]], c.fim);
  // foco seletivo: navio desfoca quando a ação é no píer; o píer desfoca quando o foco é o casco
  focoSeletivo($(".navW", el), [[tf - 0.8, tq - 0.2, 4]], c.fim);
  focoSeletivo($(".pierW", el), [[tpr - 0.1, c.fim + 5, 3.5]], c.fim);
};

// =============== 2. a bola de praia: empuxo ===============
CENAS.piscina = (el, c, B) => {
  const BORDA = 900, X0 = 140, X1 = 940, FUNDO = 1310, N0 = 944, R = 92, BY = N0 - 52;
  el.innerHTML = `<g class="cam">${ceu("ceuDia")}${halo(880, 420, 300, "solPi")}<circle cx="880" cy="420" r="62" fill="url(#sol)"/>
    <g class="nuvensPi"></g>
    <g class="fundoPi"><path d="M-260 820 C 200 740, 420 780, 620 760 S 1000 740, 1340 790 V 900 H -260 Z" fill="#5fbf8f"/>
      <g transform="translate(830 860) scale(0.9)">${casa("#fff3e0", "janelaPi")}</g>
      ${[[110, 860, 1], [300, 870, 0.8], [1010, 875, 0.9], [-80, 870, 0.9]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-9" y="-80" width="18" height="80" fill="#6b4a2f"/><circle cy="-120" r="58" fill="#2f8f6a"/><circle cx="-24" cy="-100" r="38" fill="#3fa77a"/></g>`).join("")}</g>
    ${faixa(BORDA - 14, H - BORDA + 214, "url(#areia)")}${faixa(BORDA - 14, 18, "#e6eaf7")}
    <rect x="${X0 - 26}" y="${BORDA}" width="${X1 - X0 + 52}" height="${FUNDO - BORDA + 26}" rx="10" fill="#cfe3f5"/>
    <rect x="${X0}" y="${BORDA}" width="${X1 - X0}" height="${FUNDO - BORDA}" fill="#e7f3ff"/>
    <g opacity="0.25">${Array.from({ length: 14 }, (_, k) => `<path d="M${X0 + k * 60} ${BORDA} V ${FUNDO}" stroke="#8fb8e0" stroke-width="2"/>`).join("")}${Array.from({ length: 7 }, (_, k) => `<path d="M${X0} ${BORDA + k * 60} H ${X1}" stroke="#8fb8e0" stroke-width="2"/>`).join("")}</g>
    <rect class="aguaT" x="${X0}" y="${N0}" width="${X1 - X0}" height="${FUNDO - N0}" fill="url(#piscinaA)"/>
    <g class="luzFundo" opacity="0.35">${Array.from({ length: 9 }, (_, k) => `<path d="M${X0 + 20 + k * 90} ${FUNDO - 60} q 20 -16 40 0 t 40 0" stroke="#fff" stroke-width="4" fill="none"/>`).join("")}</g>
    <g transform="translate(540 ${BY})"><g class="bola"><g class="bolaR">${bolaPraia(R)}</g></g></g>
    <rect class="aguaF" x="${X0}" y="${N0}" width="${X1 - X0}" height="${FUNDO - N0}" fill="#36b3ee" opacity="0.5"/>
    <path class="sup" d="M${X0} ${N0} H ${X1}" stroke="#dff6ff" stroke-width="5" opacity="0.9"/>
    <g class="transb" opacity="0">
      <path class="tbE" d="M${X0} ${BORDA - 6} H ${X0 - 130} q -10 4 0 10 H ${X0} Z" fill="#7fe0ff"/>
      <path class="tbD" d="M${X1} ${BORDA - 6} H ${X1 + 130} q 10 4 0 10 H ${X1} Z" fill="#7fe0ff"/>
      ${[X0 - 60, X0 - 110, X1 + 60, X1 + 110].map((x) => `<circle class="gota" cx="${x}" cy="${BORDA + 6}" r="7" fill="#7fe0ff"/>`).join("")}</g>
    <g transform="translate(540 ${BY - R - 230})"><g class="fForca">${flecha(200, C.vermelho, "", 180, "ffi")}</g></g>
    <g class="empA">${[440, 540, 640].map((x) => `<g transform="translate(${x} 1300)"><g class="fe">${flecha(110, C.ciano, "", 0, "fei")}</g></g>`).join("")}</g>
    <g transform="translate(860 1280)"><g class="fUp">${flecha(320, C.verde, "", 0, "fu")}</g></g>
    <g class="gotasPi"></g></g>
    <g transform="translate(290 700)"><g class="tForca">${rotulo("TENTA AFUNDAR", C.vermelho, 34)}</g></g>
    <g transform="translate(320 790)"><g class="tNivel">${rotulo("O NÍVEL SOBE", C.ciano, 34)}</g></g>
    <g transform="translate(540 760)"><g class="tVolta">${rotulo("A ÁGUA EMPURRA DE VOLTA", C.azul, 34)}</g></g>
    <g transform="translate(830 860)"><g class="tEmpuxo">${rotulo("EMPUXO", C.verde, 50)}</g></g>`;
  lottieEm($(".nuvensPi", el), "nuvens", 540, 520, 1300, 730, { loop: true, vel: 0.6 });
  const bola = $(".bola", el), bR = $(".bolaR", el), aguas = [$(".aguaT", el), $(".aguaF", el)], sup = $(".sup", el);
  const tpi = B("piscina", 0.15), te = B("entra", 0.25), tt = B("transborda", 0.45), tm = B("empurrou", 0.6), tc = B("cima", 0.8), tx = B("empuxo", 0.92);
  tl.set([$(".fForca", el), ...$$(".fe", el)], { opacity: 0 }, 0);
  boiar(bola, c.ini, te, 8);
  tl.fromTo(bR, { rotation: -6 }, { rotation: 6, duration: 1.4, yoyo: true, repeat: Math.max(1, Math.floor((te - c.ini) / 1.4)), ease: "sine.inOut", svgOrigin: "0 0", immediateRender: false }, c.ini);
  // tenta afundar: a força empurra a bola para baixo, a água sobe e transborda
  tl.set($(".fForca", el), { opacity: 1 }, te - 0.2);
  animFlecha($(".ffi", el), te - 0.2);
  entrar($(".tForca", el), te - 0.15, "cima");
  tl.to(bola, { y: 230, duration: 1.3, ease: "power2.inOut" }, te + 0.2);
  tl.to($(".fForca", el), { y: 230, duration: 1.3, ease: "power2.inOut" }, te + 0.2);
  tl.to(aguas, { attr: { y: BORDA, height: FUNDO - BORDA }, duration: 1.2, ease: "power2.inOut" }, te + 0.3);
  tl.to(sup, { attr: { d: `M${X0} ${BORDA} H ${X1}` }, duration: 1.2, ease: "power2.inOut" }, te + 0.3);
  sair($(".tForca", el), tt - 0.4, "cima");
  tl.set($(".transb", el), { opacity: 1 }, tt - 0.1);
  tl.fromTo($(".tbE", el), { scaleX: 0 }, { scaleX: 1, svgOrigin: `${X0} ${BORDA}`, duration: 0.6, ease: "power2.out", immediateRender: false }, tt - 0.1);
  tl.fromTo($(".tbD", el), { scaleX: 0 }, { scaleX: 1, svgOrigin: `${X1} ${BORDA}`, duration: 0.6, ease: "power2.out", immediateRender: false }, tt - 0.1);
  tl.fromTo($$(".gota", el), { y: 0, opacity: 1 }, { y: 90, opacity: 0, duration: 0.6, stagger: 0.12, repeat: 3, ease: "power1.in", immediateRender: false }, tt + 0.2);
  entrar($(".tNivel", el), tt, "dir");
  // a água empurra de volta (setas de baixo para cima)
  sair($(".tNivel", el), tm - 0.4, "dir");
  $$(".fe", el).forEach((f, k) => { tl.set(f, { opacity: 1 }, tm + k * 0.1); animFlecha($(".fei", f), tm + k * 0.1); });
  entrar($(".tVolta", el), tm + 0.1, "escala");
  // solta: a bola pula para fora da água e cai de volta
  sair($(".tVolta", el), tc - 0.35);
  tl.to([...$$(".fe", el), $(".fForca", el)], { opacity: 0, duration: 0.2 }, tc - 0.25);
  tl.to(bola, { y: -420, duration: 0.6, ease: "power2.out" }, tc);
  tl.to(bR, { rotation: 260, svgOrigin: "0 0", duration: 1.2, ease: "power1.out" }, tc);
  tl.to(aguas, { attr: { y: N0, height: FUNDO - N0 }, duration: 0.7, ease: "power2.out" }, tc + 0.15);
  tl.to(sup, { attr: { d: `M${X0} ${N0} H ${X1}` }, duration: 0.7, ease: "power2.out" }, tc + 0.15);
  respingo($(".gotasPi", el), 540, BY - 40, tc + 0.12, 24, { seed: 2, forca: 1.1 });
  tl.to(bola, { y: 0, duration: 0.55, ease: "power2.in" }, tc + 0.6);
  respingo($(".gotasPi", el), 540, BY + 40, tc + 1.15, 16, { seed: 3, forca: 0.7 });
  boiar(bola, tc + 1.2, c.fim, 8);
  // empuxo
  animFlecha($(".fu", el), tx - 0.1);
  entrar($(".tEmpuxo", el), tx, "escala");
  reflexoPassando($(".tEmpuxo", el), "EMPUXO", 50, tx + 0.6);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.025, 540, 900], [te - 0.3, 1.1, 540, 960], [te + 0.6, 1.2, 540, 1060], [tc - 0.2, 1.2, 540, 1060],
    [tc + 0.4, 1.0, 540, 880], [tx - 0.3, 1.0, 540, 880], [c.fim + 0.5, 1.08, 600, 960]], c.fim);
  focoSeletivo($(".fundoPi", el), [[te, tc, 3]], c.fim);
};

// =============== 3. a regra de Arquimedes: a balança ===============
CENAS.arquimedes = (el, c, B) => {
  const PX = 660, PY = 640, L = 280, Q = 230;
  const prato = (cls, cont, txt, cor) => `<g transform="translate(${PX + (cls === "panE" ? -L : L)} ${PY})"><g class="${cls}">
      <path d="M0 0 L -110 ${Q} M0 0 L 110 ${Q}" stroke="#e6d6a8" stroke-width="4"/>
      ${cont}
      <path d="M-130 ${Q} H 130 Q 110 ${Q + 34} 0 ${Q + 34} Q -110 ${Q + 34} -130 ${Q} Z" fill="url(#cobre)"/>
      <g transform="translate(0 ${Q + 96})">${rotulo(txt, cor, 28)}</g></g></g>`;
  el.innerHTML = `<g class="cam">${ceu("ceuOuro")}${estrelas(24, 13, 0, 420)}
    ${halo(860, 930, 420, "solAr")}<circle cx="860" cy="930" r="70" fill="url(#sol)"/>
    ${faixa(960, 80, "url(#marPor)")}${reflexos(966, 1036, 18, 31, "#ffd9b0", "reflAr")}<g class="cintA"></g>
    <g class="templo"><g transform="translate(560 960) scale(0.45)">${palacio(620, 400, "#e9d9c6", "ΣΥΡΑΚΟΥΣΑΙ", { mastro: false })}</g></g>
    ${faixa(1036, H - 1036 + 200, "url(#pisoG)")}
    ${Array.from({ length: 10 }, (_, k) => `<path d="M${-400 + k * 200} 1036 L ${-1000 + k * 340} 2000" stroke="#fff" stroke-opacity="0.08" stroke-width="3"/>`).join("")}
    <g transform="translate(200 1150)"><g class="papiro">
      <rect x="-130" y="-120" width="260" height="250" fill="url(#papel)"/>
      <rect x="-146" y="-136" width="292" height="26" rx="13" fill="#b39a74"/><rect x="-146" y="118" width="292" height="26" rx="13" fill="#b39a74"/>
      <text class="rot" y="-40" text-anchor="middle" font-size="44" fill="#6b4a2f">ΕΥΡΗΚΑ!</text>
      <path d="M-70 40 H 70 M-90 70 H 50 M-60 96 H 80" stroke="#b39a74" stroke-width="6" stroke-linecap="round"/>
      <path d="M-40 -10 l 14 -26 14 18 12 -22 14 18 14 -26 v 34 h -82 z" fill="#d9a441"/></g></g>
    <g transform="translate(260 1320)"><g class="tArq">${rotulo("ARQUIMEDES · 250 a.C.", C.amarelo, 28)}</g></g>
    <rect x="${PX - 11}" y="${PY}" width="22" height="${1300 - PY}" fill="url(#cobreH)"/><path d="M${PX - 90} 1330 H ${PX + 90} L ${PX + 60} 1290 H ${PX - 60} Z" fill="url(#cobre)"/>
    <g class="viga"><rect x="${PX - L - 10}" y="${PY - 9}" width="${2 * L + 20}" height="18" rx="9" fill="url(#cobre)"/></g>
    <circle cx="${PX}" cy="${PY}" r="20" fill="#ffd98a"/>
    ${prato("panE", `<g transform="translate(0 ${Q - 60})"><g class="obj"><rect x="-60" y="-60" width="120" height="120" rx="12" fill="url(#pedra)"/><path d="M-40 -30 l 30 10 M10 20 l 30 -14" stroke="#3b3355" stroke-width="5" stroke-linecap="round"/></g></g>`, "PESO DO OBJETO", C.laranja)}
    ${prato("panD", `<g transform="translate(0 ${Q - 60})"><rect x="-60" y="-60" width="120" height="120" rx="12" fill="url(#agua)" opacity="0.9"/><path d="M-60 -44 q 15 -10 30 0 t 30 0 t 30 0 t 30 0" stroke="#dff6ff" stroke-width="5" fill="none"/></g>`, "PESO DA ÁGUA", C.azul)}
    </g>
    <g transform="translate(${PX} 520)"><g class="igual"><circle r="56" fill="#fff"/><path d="M-26 -12 H 26 M-26 12 H 26" stroke="#141a3a" stroke-width="10" stroke-linecap="round"/></g></g>
    <g transform="translate(${PX} 420)"><g class="tBoia">${rotulo("BOIA", C.verde, 54)}</g></g>
    <g transform="translate(${PX} 420)"><g class="tAfunda">${rotulo("AFUNDA", C.vermelho, 54)}</g></g>
    <g transform="translate(540 400)"><g class="tOito"><text class="rot c8" y="0" text-anchor="middle" font-size="130" fill="${C.vermelho}" stroke="rgba(6,10,30,0.85)" stroke-width="14" paint-order="stroke">1×</text>
      <g transform="translate(0 76)">${rotulo("O AÇO PESA MAIS QUE A ÁGUA", C.vermelho, 30)}</g></g></g>
    <g transform="translate(540 420)"><g class="tPalp">${rotulo("COMENTA SEU PALPITE", C.rosa, 42)}</g></g>`;
  animarReflexos($(".reflAr", el), c.ini, c.fim);
  cintilar($(".cintA", el), 10, [700, 966, 320, 60], c.ini, c.fim, "#fff6d0", 14);
  const viga = $(".viga", el), pE = $(".panE", el), pD = $(".panD", el), obj = $(".obj", el);
  const ta = B("arq", 0.15), ti = B("igual", 0.4), tb = B("boia", 0.72), tf = B("afunda", 0.9), to = B("oito", 0.94), tpp = B("palpite", 0.98);
  entrar($(".papiro", el), c.ini + 0.15, "baixo");
  entrar($(".tArq", el), ta, "esq");
  reflexoPassando($(".tArq", el), "ARQUIMEDES · 250 a.C.", 28, ta + 0.5);
  sair($(".tArq", el), ti - 0.6, "esq");
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
  // objeto leve (a água pesa mais): boia
  sair($(".igual", el), tb - 0.4);
  tl.to(obj, { scale: 0.7, transformOrigin: "50% 100%", duration: 0.4, ease: "power2.out" }, tb - 0.3);
  tl.to($("rect", obj), { attr: { fill: "#c98b4b" }, duration: 0.4 }, tb - 0.3);
  inclina(tb, 10);
  entrar($(".tBoia", el), tb + 0.1, "cima");
  // objeto pesado (a água pesa menos): afunda
  sair($(".tBoia", el), tf - 0.35, "cima");
  tl.to(obj, { scale: 1.25, transformOrigin: "50% 100%", duration: 0.4, ease: "power2.out" }, tf - 0.3);
  tl.to($("rect", obj), { attr: { fill: "#3b3355" }, duration: 0.4 }, tf - 0.3);
  inclina(tf, -10);
  entrar($(".tAfunda", el), tf + 0.1, "baixo");
  // o problema: o aço pesa ~8× mais que a água (contador) -> palpite nos comentários
  sair($(".tAfunda", el), to - 0.35, "baixo");
  entrar($(".tOito", el), to - 0.1, "escala");
  contador($(".c8", el), 1, 8, to - 0.1, 0.9, (v) => Math.round(v) + "×");
  sair($(".tOito", el), tpp - 0.3);
  entrar($(".tPalp", el), tpp, "mola");
  reflexoPassando($(".tPalp", el), "COMENTA SEU PALPITE", 42, tpp + 0.5);
  tl.fromTo($(".tPalp", el), { scale: 1 }, { scale: 1.08, duration: 0.35, yoyo: true, repeat: 5, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tpp + 1.2);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.12, 330, 1060], [ta + 0.4, 1.12, 330, 1060], [ti - 0.2, 1.07, 640, 850], [tf + 0.8, 1.07, 640, 850],
    [to + 0.2, 1.0, 540, 900], [tpp - 0.2, 1.0, 540, 900], [c.fim + 0.5, 1.08, 620, 860]], c.fim);
  focoSeletivo($(".papiro", el).parentNode, [[ti - 0.2, c.fim + 5, 3]], c.fim);
};

// =============== 4. massinha: bola afunda, barquinho boia ===============
CENAS.massinha = (el, c, B) => {
  const NA = 880, X0 = 170, X1 = 910, FT = 1290;
  el.innerHTML = `<g class="cam">${ceu("parede")}
    <g class="janelaM"><g transform="translate(800 470)"><rect x="-170" y="-150" width="340" height="300" rx="14" fill="url(#ceuDia)"/>
      <circle class="solM" cx="60" cy="-60" r="40" fill="url(#sol)"/><path d="M-170 70 C -80 30, 40 60, 170 20 V 150 H -170 Z" fill="#4fae7f"/>
      <rect x="-170" y="-150" width="340" height="300" rx="14" fill="none" stroke="#c9d0e6" stroke-width="16"/><path d="M0 -150 V 150 M-170 0 H 170" stroke="#c9d0e6" stroke-width="10"/></g>
      <g transform="translate(250 380)"><rect x="-90" y="-110" width="180" height="220" rx="8" fill="#2a3566"/><rect x="-74" y="-94" width="148" height="188" rx="4" fill="#3b4377"/><circle cx="-20" cy="-20" r="34" fill="${C.amarelo}" opacity="0.5"/></g></g>
    <g class="raiosM"></g>
    ${faixa(FT, H - FT + 200, "url(#madeira)")}${faixa(FT, 14, "#a8744f")}
    ${sombra(540, FT + 10, 420, 18, 0.7)}
    <rect x="${X0}" y="720" width="${X1 - X0}" height="${FT - 720}" rx="10" fill="#9fe6ff" opacity="0.12"/>
    <rect class="aguaM" x="${X0 + 10}" y="${NA}" width="${X1 - X0 - 20}" height="${FT - NA - 10}" fill="url(#piscinaA)" opacity="0.85"/>
    <g class="causM" opacity="0.3">${Array.from({ length: 8 }, (_, k) => `<path d="M${X0 + 30 + k * 90} ${FT - 40} q 22 -14 44 0 t 44 0" stroke="#fff" stroke-width="4" fill="none"/>`).join("")}</g>
    <g class="desloc" opacity="0"><path d="M580 ${NA} H 800 L 782 ${NA + 40} H 598 Z" fill="${C.ciano}" opacity="0.55" stroke="#fff" stroke-width="4" stroke-dasharray="12 8"/></g>
    <g class="deslocB" opacity="0"><circle cx="380" cy="1236" r="50" fill="${C.ciano}" opacity="0.4" stroke="#fff" stroke-width="4" stroke-dasharray="12 8"/></g>
    <g class="bolhasM"></g>
    <g transform="translate(380 600)"><g class="massa"><g class="massaR"><path class="forma" d="${BOLA_D}" fill="url(#massaG)"/><path class="arB" d="${BARCO_AR}" fill="${C.ciano}" opacity="0"/></g></g></g>
    <path class="supM" d="M${X0 + 10} ${NA} H ${X1 - 10}" stroke="#dff6ff" stroke-width="4" opacity="0.9"/>
    <rect x="${X0}" y="720" width="${X1 - X0}" height="${FT - 720}" rx="10" fill="none" stroke="#dff6ff" stroke-width="10" opacity="0.55"/>
    <path d="M${X0 + 30} 760 V 1000" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity="0.3"/>
    <g class="gotasM"></g>
    <g transform="translate(380 1150)"><g class="tAf">${rotulo("AFUNDA", C.vermelho, 34)}</g></g>
    <g transform="translate(690 1000)"><g class="tBo">${rotulo("BOIA", C.verde, 38)}</g></g>
    <g transform="translate(690 740)"><g class="tAr">${rotulo("OCO: AR", C.ciano, 32)}</g></g>
    <g transform="translate(690 1000)"><g class="tMuita">${rotulo("MUITA ÁGUA EMPURRADA", C.ciano, 30)}</g></g>
    <g transform="translate(380 1150)"><g class="tPouca">${rotulo("POUCA ÁGUA", C.laranja, 28)}</g></g></g>
    <g transform="translate(540 470)"><g class="tMesmo">${rotulo("MESMO PESO", C.amarelo, 46)}</g></g>`;
  const m = $(".massa", el), forma = $(".forma", el);
  const tb = B("bola", 0.2), tbr = B("barco", 0.45), tbo = B("boia2", 0.55), tm = B("mesmo", 0.65), to = B("oco", 0.78), tf = B("fora", 0.92);
  entrar(m, c.ini + 0.3, "mola");
  // a bola cai na água (respingo) e afunda até o fundo soltando bolhas
  tl.to(m, { y: NA - 600, duration: 0.45, ease: "power2.in" }, tb - 0.3);
  respingo($(".gotasM", el), 380, NA, tb + 0.15, 16, { seed: 4, forca: 0.8 });
  tl.to(m, { y: 1236 - 600, duration: 1.1, ease: "power2.out" }, tb + 0.15);
  bolhasSobem($(".bolhasM", el), 380, 1150, 12, tb + 0.3, 1.4, { altura: 260, seed: 5, espalha: 50 });
  entrar($(".tAf", el), tb + 0.6, "baixo");
  // vira barquinho: sobe, se transforma e pousa na água
  sair($(".tAf", el), tbr - 0.6, "baixo");
  tl.to(m, { x: 310, y: 120, duration: 0.8, ease: "power2.inOut" }, tbr - 0.5);
  tl.to(forma, { morphSVG: BARCO_D, duration: 0.7, ease: "power2.inOut" }, tbr - 0.2);
  tl.to(m, { y: NA - 600 - 10, duration: 0.6, ease: "power2.in" }, tbo - 0.4);
  respingo($(".gotasM", el), 690, NA, tbo + 0.2, 18, { seed: 6, forca: 0.6, abertura: 900 });
  tl.fromTo($(".massaR", el), { rotation: -4 }, { rotation: 4, duration: 1.0, yoyo: true, repeat: Math.max(1, Math.floor((c.fim - tbo) / 1.0)), ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tbo + 0.2);
  entrar($(".tBo", el), tbo + 0.1, "cima");
  // mesmo peso, formato diferente
  entrar($(".tMesmo", el), tm, "escala");
  reflexoPassando($(".tMesmo", el), "MESMO PESO", 46, tm + 0.5);
  sair($(".tBo", el), to - 0.3, "cima");
  tl.to($(".arB", el), { opacity: 0.55, duration: 0.4 }, to);
  entrar($(".tAr", el), to + 0.1, "dir");
  // muito mais água empurrada que a bola
  sair($(".tMesmo", el), tf - 0.3);
  tl.to($(".desloc", el), { opacity: 1, duration: 0.4 }, tf);
  tl.fromTo($(".desloc path", el), { strokeDashoffset: 0 }, { strokeDashoffset: -200, duration: c.fim - tf, ease: "none", immediateRender: false }, tf);
  tl.to($(".deslocB", el), { opacity: 1, duration: 0.4 }, tf + 0.3);
  entrar($(".tMuita", el), tf + 0.1, "esq");
  entrar($(".tPouca", el), tf + 0.4, "esq");
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.025, 540, 900], [tb - 0.4, 1.025, 540, 900], [tb + 0.3, 1.2, 420, 1040], [tbr - 0.6, 1.2, 420, 1040],
    [tbr + 0.2, 1.22, 660, 890], [tm - 0.2, 1.22, 660, 890], [tm + 0.4, 1.05, 540, 900], [tf - 0.2, 1.05, 540, 900], [c.fim + 0.5, 1.12, 560, 1010]], c.fim);
  focoSeletivo($(".janelaM", el), [[tb, tm + 0.2, 4], [tf, c.fim + 5, 2]], c.fim);
};

// =============== 5. o navio por dentro (corte frontal) ===============
CENAS.casco = (el, c, B) => {
  const NA = 1000;
  const CONTORNO = "M240 450 H 840 V 740 H 880 V 1080 Q 880 1170 790 1170 H 290 Q 200 1170 200 1080 V 740 H 240 Z";
  const SUBM = `M200 ${NA} V 1080 Q 200 1170 290 1170 H 790 Q 880 1170 880 1080 V ${NA} Z`;
  const salas = [];
  for (let r = 0; r < 5; r++) for (let q = 0; q < 6; q++) salas.push(`<rect class="sala" x="${252 + q * 98}" y="${462 + r * 56}" width="88" height="46" rx="4" fill="#26306a"/>`);
  el.innerHTML = `<g class="cam">${ceu("ceuNoite")}${estrelas(70, 41, 0, 950)}
    ${halo(180, 380, 220, "luaH", "brilhoAzul")}<circle cx="180" cy="380" r="54" fill="url(#lua)"/>
    ${faixa(NA, H - NA + 200, "url(#marNoite)")}
    <g class="colunaLua"><path d="M160 ${NA} L 70 1420 H 290 L 200 ${NA} Z" fill="#cfe0ff" opacity="0.12"/>${reflexos(NA + 6, 1400, 50, 17, "#e6eeff", "reflLua").replace('class="reflLua"', 'class="reflLua" transform="translate(70 0) scale(0.2 1)"')}</g>
    ${reflexos(NA + 6, 1400, 40, 17, "#cfe0ff", "reflC")}<g class="cristasC"></g><g class="cintC"></g>
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
    ${faixa(NA, H - NA + 200, "#10205a", 'opacity="0.42"')}
    <path d="M-200 ${NA} H ${W + 200}" stroke="#8fe3ff" stroke-width="3" opacity="0.6"/>
    <g transform="translate(110 1330)"><g class="fUp">${flecha(290, C.verde, "EMPUXO", 0, "fu", 28)}</g></g>
    <g transform="translate(970 560)"><g class="fDn">${flecha(260, C.vermelho, "PESO", 180, "fd", 28)}</g></g></g>
    <g transform="translate(540 370)"><g class="tAco">${rotulo("AÇO: SÓ A CASCA", C.laranja, 38)}</g></g>
    <g transform="translate(540 370)"><g class="tArC">${rotulo("POR DENTRO: QUASE TUDO AR", C.ciano, 34)}</g></g>
    <g transform="translate(540 1230)"><g class="tAgua"><text class="rot cA" y="0" text-anchor="middle" font-size="84" fill="${C.ciano}" stroke="rgba(6,10,30,0.85)" stroke-width="12" paint-order="stroke">0</text>
      <g transform="translate(0 58)">${rotulo("TONELADAS DE ÁGUA EMPURRADAS", C.azul, 28)}</g></g></g>`;
  const sec = $(".secao", el), salasEl = $$(".sala", el);
  const tg = B("gigante", 0.2), tfi = B("fino", 0.35), ta = B("ar", 0.5), tt = B("teatros", 0.65), tw = B("agua", 0.8), ti = B("inteiro", 0.92);
  animarReflexos($(".reflC", el), c.ini, c.fim);
  ondas($(".cristasC", el), NA + 14, 1420, 10, c.ini, c.fim, "#cfe0ff", 41);
  cintilar($(".cintC", el), 14, [70, NA + 10, 220, 300], c.ini, c.fim, "#e6eeff", 43);
  ondular([$(".colunaLua", el), $(".reflC", el)]);
  // o barquinho cresce e vira o navio
  boiar($(".barqI", el), c.ini, tg, 6);
  tl.set(sec, { opacity: 0 }, 0);
  tl.to($(".barq", el), { scale: 3.2, opacity: 0, transformOrigin: "50% 50%", duration: 0.7, ease: "power2.in" }, tg - 0.3);
  tl.fromTo(sec, { scale: 0.22, opacity: 0, svgOrigin: `540 ${NA}` }, { scale: 1, opacity: 1, svgOrigin: `540 ${NA}`, duration: 1.0, ease: "expo.out", immediateRender: false }, tg - 0.15);
  // o aço é só a casca: a pele some e sobra o contorno
  tl.to($(".pele", el), { opacity: 0, duration: 0.7 }, tfi - 0.1);
  tl.to($(".casca", el), { stroke: C.laranja, duration: 0.3 }, tfi);
  desenhar($(".casca", el), tfi, 0.9);
  entrar($(".tAco", el), tfi + 0.1, "esq");
  reflexoPassando($(".tAco", el), "AÇO: SÓ A CASCA", 38, tfi + 0.6);
  // por dentro: ar (cabines acendendo, restaurante, teatro)
  sair($(".tAco", el), ta - 0.3, "dir");
  tl.to($(".casca", el), { stroke: "#cfd6ea", duration: 0.5 }, ta);
  tl.to($(".ar", el), { opacity: 0.16, duration: 0.6 }, ta);
  entrar($(".tArC", el), ta + 0.05, "baixo");
  salasEl.forEach((s, k) => tl.to(s, { attr: { fill: "url(#luzSala)" }, duration: 0.2 }, ta + 0.2 + ((k * 7) % salasEl.length) * ((tt - ta - 0.4) / salasEl.length)));
  entrar($(".restaurante", el), ta + (tt - ta) * 0.55, "mola");
  entrar($(".teatro", el), tt, "escala");
  // a parte de baixo empurra 100 mil toneladas de água (contador)
  sair($(".tArC", el), tw - 0.4);
  tl.to($(".desloc", el), { opacity: 0.55, duration: 0.5 }, tw);
  tl.fromTo($(".desloc", el), { strokeDashoffset: 0 }, { strokeDashoffset: -300, duration: c.fim - tw, ease: "none", immediateRender: false }, tw);
  entrar($(".tAgua", el), tw - 0.5, "escala");
  contador($(".cA", el), 0, 100000, tw - 0.5, 1.2);
  // o empuxo segura o peso
  animFlecha($(".fu", el), ti - 0.15);
  animFlecha($(".fd", el), ti + 0.05);
  cameraFases($(".cam", el), [[c.ini - 0.5, 1.7, 540, 990], [tg - 0.4, 1.7, 540, 990], [tg + 0.8, 1.0, 540, 880], [tfi - 0.2, 1.0, 540, 880], [tfi + 0.6, 1.08, 540, 820],
    [tw - 0.3, 1.08, 540, 820], [tw + 0.4, 1.1, 540, 980], [ti - 0.3, 1.1, 540, 980], [ti + 0.5, 1.0, 540, 900], [c.fim + 0.5, 1.03, 540, 900]], c.fim);
};

// =============== 6. na prática: linha d'água, compartimentos e o Titanic ===============
CENAS.pratica = (el, c, B) => {
  const NA = 1000, ALTO = -30;
  const guindaste = (x, h) => `<g transform="translate(${x} ${NA})"><path d="M-14 0 V ${-h} H 14 V 0 Z" fill="#e0a83a"/><path d="M-40 ${-h} H 220 V ${-h + 22} H -40 Z" fill="#e0a83a"/><path d="M180 ${-h + 22} V ${-h + 140}" stroke="#3b4377" stroke-width="4"/>${Array.from({ length: Math.floor(h / 40) }, (_, k) => `<path d="M-14 ${-k * 40} L 14 ${-k * 40 - 40}" stroke="#b98422" stroke-width="4"/>`).join("")}</g>`;
  el.innerHTML = `<g class="cam">${ceu("ceuDia")}${halo(900, 420, 300, "solPr")}<circle cx="900" cy="420" r="56" fill="url(#sol)"/>
    <g class="nuvensPr"></g>
    <g class="porto">${guindaste(110, 560)}${guindaste(900, 500)}${faixa(NA - 40, 40, "#7b86a8")}</g>
    ${faixa(NA, H - NA + 200, "url(#marDia)")}${reflexos(NA + 8, 1400, 40, 23, "#ffffff", "reflPr")}<g class="cristasPr"></g><g class="cintPr"></g>
    <g transform="translate(560 ${NA}) scale(0.9)"><g class="navP">${navio({ calado: 130, raiox: true })}
      ${[[-170, C.laranja], [-108, C.verde], [-46, C.azul], [16, C.rosa]].map(([x, cor]) => `<g transform="translate(${x} -316)"><g class="caixa"><rect y="-46" width="56" height="46" rx="5" fill="${cor}"/><path d="M8 -38 V -8 M20 -38 V -8 M32 -38 V -8 M44 -38 V -8" stroke="#000" stroke-opacity="0.15" stroke-width="4"/></g></g>`).join("")}</g></g>
    ${faixa(NA, H - NA + 200, "#1a5fc0", 'class="aguaFr" opacity="0.5"')}
    <path d="M-200 ${NA} H ${W + 200}" stroke="#dff6ff" stroke-width="4" opacity="0.8"/>
    <g class="bolhasPr"></g>
    <g class="cLinha" opacity="0">${callout(695, 972, 600, 1210, "LINHA D'ÁGUA", C.amarelo)}</g></g>
    <g transform="translate(540 430)"><g class="tEq">${rotulo("PESO = EMPUXO", C.verde, 42)}</g></g>
    <g transform="translate(540 430)"><g class="tVaza">${rotulo("E SE O CASCO FURAR?", C.vermelho, 42)}</g></g>
    <g transform="translate(540 430)"><g class="tComp">${rotulo("COMPARTIMENTOS FECHADOS", C.ciano, 36)}</g></g>
    <g transform="translate(540 430)"><g class="tOk">${check(C.verde)}<g transform="translate(0 90)">${rotulo("CONTINUA BOIANDO", C.verde, 40)}</g></g></g>
    <g transform="translate(540 430)"><g class="tTit"><text class="rot cT" y="12" text-anchor="middle" font-size="96" fill="#fff" stroke="rgba(6,10,30,0.85)" stroke-width="12" paint-order="stroke">TITANIC</text>
      <g transform="translate(0 84)">${rotulo("PAREDES BAIXAS: A ÁGUA PASSOU POR CIMA", C.laranja, 26)}</g></g></g>`;
  lottieEm($(".nuvensPr", el), "nuvens", 540, 560, 1300, 730, { loop: true, vel: 0.5 });
  animarReflexos($(".reflPr", el), c.ini, c.fim);
  ondas($(".cristasPr", el), NA + 14, 1420, 10, c.ini, c.fim, "#ffffff", 51);
  cintilar($(".cintPr", el), 14, [760, NA + 10, 300, 300], c.ini, c.fim, "#ffffff", 53);
  ondular($(".reflPr", el));
  const nav = $(".navP", el), caixas = $$(".caixa", el);
  const tli = B("linha", 0.15), tca = B("carga", 0.35), teq = B("equilibra", 0.5), tv = B("vaza", 0.65), tco = B("comp", 0.78), ts = B("seguro", 0.92), tti = B("titanic", 0.95), tpa = B("passa", 0.97);
  tl.set(caixas, { opacity: 0 }, 0);
  tl.set(nav, { y: ALTO }, 0);
  callAnim($(".cLinha", el), tli);
  // carga e passageiros: ele afunda um pouco até equilibrar
  tl.to($(".cLinha", el), { opacity: 0, duration: 0.25, ease: "power2.in" }, tca - 0.2);
  caixas.forEach((k, i) => tl.fromTo(k, { y: -360, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 + i * 0.08, ease: "bounce.out", immediateRender: false }, tca + i * 0.15));
  tl.to(nav, { y: 0, duration: 1.6, ease: "power2.inOut" }, tca + 0.3);
  entrar($(".tEq", el), teq, "escala");
  reflexoPassando($(".tEq", el), "PESO = EMPUXO", 42, teq + 0.5);
  // raio-x do casco: compartimentos estanques; um enche, o resto segura
  sair($(".tEq", el), tv - 0.4);
  entrar($(".tVaza", el), tv - 0.1, "cima");
  tl.to($(".aguaFr", el), { opacity: 0.15, duration: 0.5 }, tv - 0.2);
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
  // fato-surpresa: no Titanic a água passou por cima das paredes, de um compartimento ao outro
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

// =============== 7. na sua vida: pulmão, colete e submarino ===============
CENAS.voce = (el, c, B) => {
  const SUP = 640;
  const sub = () => `<path d="M-40 -66 L -28 -136 H 72 L 92 -66 Z" fill="url(#subG)"/><rect x="16" y="-176" width="8" height="44" fill="#9aa7c7"/><rect x="16" y="-176" width="30" height="8" fill="#9aa7c7"/>
    <path d="M-250 0 C -250 -56, -120 -70, 0 -70 C 150 -70, 240 -42, 256 0 C 240 42, 150 70, 0 70 C -120 70, -250 56, -250 0 Z" fill="url(#subG)"/>
    <path d="M-250 0 l -30 -40 v 80 z" fill="#5d6890"/><rect x="-270" y="-8" width="40" height="16" fill="${C.amarelo}"/>
    ${[-180, 40].map((x) => `<rect x="${x}" y="-32" width="130" height="64" rx="16" fill="#0b1440"/><rect class="tqA" x="${x}" y="32" width="130" height="0" fill="${C.azul}"/><rect x="${x}" y="-32" width="130" height="64" rx="16" fill="none" stroke="#8fe3ff" stroke-width="4"/>`).join("")}
    ${[0, 1, 2].map((k) => `<circle cx="${-30 + k * 26}" cy="-46" r="7" fill="#ffd98a"/>`).join("")}`;
  // pulmões (traqueia + dois lobos), centro 0,0
  const pulmoes = () => `<rect x="-9" y="-120" width="18" height="70" rx="9" fill="#e9b0c0"/>
    <path d="M-6 -55 C -30 -60, -100 -50, -105 20 C -110 80, -70 105, -30 95 C -10 90, -8 60, -8 -40 Z" fill="url(#pulmaoG)"/>
    <path d="M6 -55 C 30 -60, 100 -50, 105 20 C 110 80, 70 105, 30 95 C 10 90, 8 60, 8 -40 Z" fill="url(#pulmaoG)"/>
    <path d="M-8 -45 L -40 -10 M-40 -10 L -60 30 M-40 -10 L -30 40 M8 -45 L 40 -10 M40 -10 L 60 30 M40 -10 L 30 40" stroke="#b3304f" stroke-width="5" stroke-linecap="round" fill="none" opacity="0.6"/>
    <ellipse cx="-62" cy="-18" rx="18" ry="10" fill="#fff" opacity="0.35"/>`;
  const colete = () => `<path d="M-80 -110 C -80 -130, -40 -140, -26 -120 L -20 -70 H 20 L 26 -120 C 40 -140, 80 -130, 80 -110 L 86 90 C 86 110, 70 118, 50 118 H -50 C -70 118, -86 110, -86 90 Z" fill="${C.laranja}"/>
    <path d="M-20 -70 C -20 -20, 20 -20, 20 -70" fill="#c2531c"/><path d="M-84 0 H 84 M-86 50 H 86" stroke="#ffd23f" stroke-width="12"/>
    <path d="M-60 -100 C -64 -40, -66 40, -60 100" stroke="#fff" stroke-width="8" opacity="0.25" fill="none" stroke-linecap="round"/>`;
  el.innerHTML = `<g class="cam">${ceu("ceuDia")}
    <g class="nuvensV"></g>
    ${faixa(SUP, H - SUP + 200, "url(#fundoMar)")}
    <g class="raiosV"></g><g class="bkV"></g><g class="neveV"></g>
    <path d="M-200 1330 C 200 1300, 380 1340, 560 1310 S 900 1300, 1280 1330 V 2100 H -200 Z" fill="url(#areia)"/>
    ${[[120, 1320], [470, 1310], [960, 1320]].map(([x, y], k) => `<g transform="translate(${x} ${y})"><g class="alga">${[0, 1, 2].map((q) => `<path d="M${q * 18 - 18} 0 C ${q * 18 - 40} -60, ${q * 18 + 10} -100, ${q * 18 - 14} ${-150 - q * 20}" stroke="${k % 2 ? "#06a07a" : "#2f8f6a"}" stroke-width="10" fill="none" stroke-linecap="round"/>`).join("")}</g></g>`).join("")}
    <g transform="translate(270 ${SUP + 30})"><g class="pulm"><g class="pulmI">${pulmoes()}</g></g></g>
    <g transform="translate(270 ${SUP})"><g class="colete"><g class="coleteI">${colete()}</g></g></g>
    ${faixa(SUP, 1330 - SUP, "#1f7fd6", 'opacity="0.22"')}
    <path d="M-200 ${SUP} H ${W + 200}" stroke="#dff6ff" stroke-width="5" opacity="0.9"/>${faixa(SUP, 16, "#dff6ff", 'opacity="0.25"')}
    <g class="cristasV"></g>
    <g transform="translate(760 1000) scale(0.82)"><g class="sub"><g class="subB">${sub()}</g></g></g>
    <g class="bolhasV"></g><g class="gotasV"></g></g>
    <g transform="translate(270 470)"><g class="tPul">${rotulo("PULMÃO CHEIO DE AR", C.rosa, 32)}</g></g>
    <g transform="translate(330 470)"><g class="tCol">${rotulo("MUITO ESPAÇO, POUCO PESO", C.laranja, 30)}</g></g>
    <g transform="translate(760 470)"><g class="tDesce">${rotulo("ÁGUA NOS TANQUES: DESCE", C.azul, 30)}</g></g>
    <g transform="translate(760 470)"><g class="tSobe">${rotulo("AR NOS TANQUES: SOBE", C.verde, 30)}</g></g>`;
  lottieEm($(".nuvensV", el), "nuvens", 540, 330, 1300, 600, { loop: true, vel: 0.6 });
  ondas($(".cristasV", el), SUP - 4, SUP + 6, 3, c.ini, c.fim, "#ffffff", 61);
  poeira($(".neveV", el), 40, 63, [0, 700, W, 600], c.ini, c.fim, "#dff6ff");
  const pulm = $(".pulm", el), col = $(".colete", el), sb = $(".sub", el);
  const tp = B("pulmao", 0.15), tb = B("boiaP", 0.3), tc = B("colete", 0.45), ts = B("sub", 0.62), td = B("desce", 0.8), tsb = B("sobe", 0.92);
  tl.set([col, sb], { opacity: 0 }, 0);
  boiar($(".pulmI", el), c.ini, c.fim, 8);
  boiar($(".coleteI", el), c.ini, c.fim, 7);
  // pulmão cheio de ar: incha e boia mais alto
  tl.fromTo(pulm, { scale: 0.7, opacity: 1, transformOrigin: "50% 50%" }, { scale: 1.1, duration: 0.8, ease: "back.out(2)", immediateRender: false }, tp);
  entrar($(".tPul", el), tp + 0.1, "esq");
  tl.to(pulm, { y: -40, duration: 0.8, ease: "back.out(2)" }, tb);
  respingo($(".gotasV", el), 270, SUP, tb + 0.05, 12, { seed: 8, forca: 0.5 });
  // colete: cai do alto e boia bem alto
  sair($(".tPul", el), tc - 0.3, "esq");
  tl.to(pulm, { x: -320, opacity: 0, duration: 0.3, ease: "power2.in" }, tc - 0.3);
  tl.fromTo(col, { y: -520, opacity: 1 }, { y: -60, opacity: 1, duration: 0.8, ease: "bounce.out", immediateRender: false }, tc - 0.1);
  respingo($(".gotasV", el), 270, SUP, tc + 0.35, 18, { seed: 9, forca: 0.8 });
  entrar($(".tCol", el), tc + 0.2, "baixo");
  reflexoPassando($(".tCol", el), "MUITO ESPAÇO, POUCO PESO", 30, tc + 0.8);
  // submarino: enche os tanques para descer, sopra ar para subir
  sair($(".tCol", el), ts - 0.3, "baixo");
  entrar(sb, ts - 0.2, "dir");
  tl.to(col, { opacity: 0, duration: 0.4, ease: "power2.in" }, ts);
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
  el.innerHTML = `<g class="cam">${ceu("ceuNoite")}${estrelas(70, 91, 0, 1280)}
    ${faixa(1290, H - 1290 + 200, "url(#marNoite)")}${reflexos(1296, 1400, 20, 61, "#cfe0ff", "reflR")}<g class="cristasR"></g>
    <path class="espinha" d="M170 470 V 1150" stroke="rgba(255,255,255,0.25)" stroke-width="6" stroke-linecap="round"/>
    ${passos.map(([t, cor], k) => `<g transform="translate(170 ${470 + k * 226})"><g class="passo"><circle r="62" fill="${cor}"/><text class="rot" y="22" text-anchor="middle" font-size="60" fill="#141a3a">${k + 1}</text><text class="rot" x="96" y="16" font-size="${t.length > 22 ? 38 : 44}" fill="#fff">${t}</text></g></g>`).join("")}
    <g transform="translate(-200 1290) scale(0.3)"><g class="navR">${navio({ noite: true })}<path d="M-500 4 C -700 10, -900 20, -1300 30" stroke="#fff" stroke-width="8" stroke-dasharray="40 30" opacity="0.5" fill="none"/></g></g></g>`;
  animarReflexos($(".reflR", el), c.ini, c.fim);
  ondas($(".cristasR", el), 1300, 1420, 6, c.ini, c.fim, "#cfe0ff", 71);
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

// =============== efeitos de luz e acabamento ===============
const _comEfeitos = (tipo, fx) => { const base = CENAS[tipo]; CENAS[tipo] = (el, c, B, i, f) => { base(el, c, B, i, f); fx(el, c, B, f); }; };
_comEfeitos("porto", (el, c) => {
  $(".solP", el).insertAdjacentHTML("afterend", raiosLuz(250, 990, 16, 200, 900, -90, "raiosP", 3));
  animarRaios($(".raiosP", el), 0, c.fim);
  $(".pierW", el).insertAdjacentHTML("beforebegin", flare(250, 990, 0.7));
  el.insertAdjacentHTML("beforeend", `<g class="bkP"></g>`);
  bokeh($(".bkP", el), 12, 5, [0, 300, W, 700], 0, c.fim, ["#ffd23f", "#ff8aa4", "#fff3c0"]);
  desfocar($(".ilhas", el), 1);
  volume($(".navioB", el));
  brilhar([$(".pfG", el), $(".lanternaH", el)]);
});
_comEfeitos("piscina", (el, c) => {
  $(".solPi", el).insertAdjacentHTML("afterend", raiosLuz(880, 420, 12, 140, 700, 120, "raiosPi", 7));
  animarRaios($(".raiosPi", el), c.ini, c.fim);
  volume($(".bolaR", el));
  ondular($(".luzFundo", el));
  brilhar([$(".fu", el), $(".fForca", el)]);
});
_comEfeitos("arquimedes", (el, c) => {
  desfocar($(".templo", el), 1);
  volume($(".obj", el));
  el.insertAdjacentHTML("beforeend", `<g class="bkA"></g>`);
  bokeh($(".bkA", el), 12, 11, [0, 300, W, 800], c.ini, c.fim, ["#ffd23f", "#ff8aa4", "#fff3c0"]);
});
_comEfeitos("massinha", (el, c) => {
  $(".raiosM", el).insertAdjacentHTML("beforeend", raiosLuz(800, 470, 10, 50, 1100, 120, "raiosMi", 13));
  animarRaios($(".raiosMi", el), c.ini, c.fim);
  volume($(".massaR", el));
  ondular($(".causM", el));
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
  brilhar($(".tOk", el));
});
_comEfeitos("voce", (el, c) => {
  $(".raiosV", el).insertAdjacentHTML("beforeend", raiosLuz(540, 560, 14, 70, 900, 90, "raiosVi", 27));
  animarRaios($(".raiosVi", el), c.ini, c.fim);
  ondular($(".raiosVi", el));
  bokeh($(".bkV", el), 18, 33, [0, 700, W, 600], c.ini, c.fim, ["#dff6ff", "#8fe3ff"]);
  volume([$(".subB", el), $(".pulmI", el), $(".coleteI", el)]);
  desfocar($$(".alga", el), 1);
});
_comEfeitos("resumo", (el, c) => { $$(".passo", el).forEach((p) => brilhar(p.querySelector("circle"))); $(".cam", el).firstElementChild.insertAdjacentHTML("afterend", `<g class="bkR"></g>`); bokeh($(".bkR", el), 16, 37, [0, 300, W, 1000], c.ini, c.fim, ["#ffd23f", "#4cc9f0", "#ff5d8f"]); });
