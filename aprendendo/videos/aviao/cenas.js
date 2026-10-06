// Cenas do vídeo "Como o avião consegue voar".
// Cada função CENAS.<tipo>(el, c, B) desenha e anima uma cena do roteiro.
// Usa a identidade (aprendendo/identidade) e a biblioteca comum (aprendendo/motor/biblioteca.js).

// ---------- desenhos deste vídeo ----------
$("#defs").insertAdjacentHTML("beforeend", `
  <linearGradient id="fuselagem" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="0.55" stop-color="#e6eaf7"/><stop offset="1" stop-color="#9aa7c7"/></linearGradient>
  <linearGradient id="fuselagemT" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#aab4d6"/><stop offset="0.45" stop-color="#ffffff"/><stop offset="1" stop-color="#aab4d6"/></linearGradient>
  <linearGradient id="caudaG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4cc9f0"/><stop offset="1" stop-color="#1f5fbf"/></linearGradient>
  <linearGradient id="asaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe4f7"/><stop offset="1" stop-color="#7b86a8"/></linearGradient>
  <linearGradient id="perfilG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6ff"/><stop offset="0.6" stop-color="#b9c3e6"/><stop offset="1" stop-color="#6b779c"/></linearGradient>
  <linearGradient id="pistaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b3f5c"/><stop offset="1" stop-color="#23263c"/></linearGradient>
  <radialGradient id="baixaP"><stop offset="0" stop-color="#4cc9f0" stop-opacity="0.55"/><stop offset="1" stop-color="#4cc9f0" stop-opacity="0"/></radialGradient>
  <radialGradient id="altaP"><stop offset="0" stop-color="#ff8a3d" stop-opacity="0.55"/><stop offset="1" stop-color="#ff8a3d" stop-opacity="0"/></radialGradient>`);

// avião de passageiros visto de lado (nariz para a direita), centro em 0,0, ~900 de comprimento
const aviaoLado = () => `
  <path d="M40 -12 L -110 -70 L -78 -74 L 92 -16 Z" fill="#8f9bc4"/>
  <path d="M-330 -44 L -420 -190 L -372 -190 L -262 -46 Z" fill="url(#caudaG)"/>
  <path class="leme" d="M-420 -190 L -444 -190 L -352 -40 L -330 -44 Z" fill="#1f5fbf"/>
  <g transform="translate(-372 -150) scale(1.3)"><path d="M18 2a14 14 0 0 0-8 25.5V32h16v-4.5A14 14 0 0 0 18 2z" fill="${C.amarelo}" transform="scale(0.9)"/></g>
  <path d="M-310 -8 L -430 -36 L -446 -24 L -330 12 Z" fill="#9aa7c7"/>
  <path class="profundor" d="M-430 -36 L -456 -40 L -466 -26 L -446 -24 Z" fill="#6b779c"/>
  <path d="M-430 4 C -400 -34, -320 -50, -220 -52 L 320 -52 C 400 -52, 452 -30, 466 -2 C 456 26, 404 42, 330 44 L -240 44 C -330 42, -400 26, -430 4 Z" fill="url(#fuselagem)"/>
  <path d="M-300 8 L 420 8 L 446 16 L -280 16 Z" fill="${C.amarelo}"/><path d="M-290 18 L 430 18 L 448 22 L -272 22 Z" fill="${C.laranja}"/>
  ${Array.from({ length: 19 }, (_, k) => `<rect x="${-232 + k * 28}" y="-30" width="12" height="17" rx="6" fill="#2a3566"/>`).join("")}
  <path d="M392 -34 C 420 -32, 442 -22, 450 -12 L 404 -12 Z" fill="#1b2556"/>
  <rect x="300" y="-40" width="22" height="52" rx="5" fill="none" stroke="#b9c3e6" stroke-width="3"/>
  <rect x="24" y="28" width="40" height="18" fill="#9aa7c7"/>
  <rect x="-6" y="40" width="140" height="52" rx="26" fill="url(#metalH)"/><ellipse cx="132" cy="66" rx="10" ry="24" fill="#2a3566"/><rect x="-10" y="54" width="30" height="24" rx="8" fill="#6b779c"/>
  <path d="M60 18 L -150 90 L -112 98 L 122 30 Z" fill="url(#asaG)"/>
  <g transform="translate(-150 90)"><g class="flaps"><path d="M0 0 L 100 -34 L 104 -24 L 8 12 Z" fill="#c7cde6"/></g></g>`;

// avião visto de cima (nariz para cima), centro em 0,0
const aviaoTopo = () => {
  const lado = (s) => `<g transform="scale(${s} 1)">
    <path d="M40 -70 L 430 120 L 430 162 L 40 70 Z" fill="url(#asaG)"/>
    <path class="aileron" d="M300 108 L 430 140 L 430 162 L 300 132 Z" fill="#6b779c"/>
    <rect x="170" y="-20" width="46" height="120" rx="20" fill="url(#metalH)"/>
    <path d="M30 330 L 200 400 L 200 428 L 30 384 Z" fill="url(#asaG)"/>
    <path class="profundorT" d="M100 362 L 200 404 L 200 428 L 100 392 Z" fill="#6b779c"/></g>`;
  return `${lado(1)}${lado(-1)}
    <path d="M0 -450 C 32 -428, 44 -366, 46 -300 L 46 330 C 42 384, 22 426, 0 450 C -22 426, -42 384, -46 330 L -46 -300 C -44 -366, -32 -428, 0 -450 Z" fill="url(#fuselagemT)"/>
    <path d="M-22 -392 C -10 -404, 10 -404, 22 -392 L 18 -370 L -18 -370 Z" fill="#1b2556"/>
    <rect x="-7" y="300" width="14" height="110" rx="6" fill="url(#caudaG)"/><rect class="lemeT" x="-7" y="400" width="14" height="44" rx="5" fill="#1f5fbf"/>
    <rect x="-46" y="-40" width="92" height="12" fill="${C.amarelo}" opacity="0.85"/>`;
};

// mão espalmada de perfil (pulso na origem, dedos para a direita)
const MAO_D = "M0 -26 C 60 -36, 150 -36, 206 -18 C 224 -12, 224 12, 206 18 C 150 30, 60 32, 0 26 Z";
const PERFIL_D = "M-10 4 C 20 -48, 130 -52, 220 -6 C 150 10, 60 22, -10 12 Z"; // perfil de asa (para o "morph")
const mao = () => `<path class="palma" d="${MAO_D}" fill="#e9b48a"/>
  <path class="polegar" d="M40 -30 C 72 -64, 112 -60, 120 -42 C 100 -36, 72 -32, 52 -26 Z" fill="#d99c72"/>
  <path class="dedos" d="M110 -10 H 196 M110 4 H 200" stroke="#c98a62" stroke-width="3" stroke-linecap="round" fill="none"/>`;

// seta grossa apontando para cima (base na origem), comprimento L
const flecha = (L, cor, txt, ang, cls, tam) => `<g transform="rotate(${ang || 0})"><g class="${cls}"><path d="M-20 0 V ${-L + 46} H -46 L 0 ${-L} L 46 ${-L + 46} H 20 V 0 Z" fill="${cor}"/>
  ${txt ? `<g transform="translate(0 ${-L - 50}) rotate(${-(ang || 0)})">${rotulo(txt, cor, tam || 32)}</g>` : ""}</g></g>`;
const animFlecha = (g, t) => { tl.set(g, { opacity: 0 }, 0); tl.fromTo(g, { scaleY: 0, opacity: 1, transformOrigin: "50% 100%" }, { scaleY: 1, opacity: 1, duration: 0.55, ease: "back.out(1.7)", immediateRender: false }, t); };

// =============== 1. gancho: o avião decola ao entardecer ===============
CENAS.aeroporto = (el, c, B) => {
  mostrarGancho(B("titulo", 0.85) - 0.2);
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuCrep)"/>${estrelas(30, 5, 0, 420)}
    ${halo(820, 1040, 520, "solA")}<circle cx="820" cy="1040" r="90" fill="url(#sol)"/>
    <g class="nuvensA"></g>
    <g class="cidade">${Array.from({ length: 14 }, (_, k) => `<rect x="${-20 + k * 80}" y="${1040 - 60 - ((k * 47) % 140)}" width="${60 + (k % 3) * 14}" height="${60 + ((k * 47) % 140)}" fill="#3a3373" opacity="0.8"/>`).join("")}</g>
    <g transform="translate(150 1060)"><rect x="-26" y="-230" width="52" height="230" fill="#5a5490"/><rect x="-60" y="-290" width="120" height="66" rx="16" fill="#6e68a8"/><rect x="-50" y="-280" width="100" height="40" rx="10" fill="#ffd98a" opacity="0.8"/></g>
    <path d="M0 1060 H ${W} V 1920 H 0z" fill="#2c2a55"/>
    <path d="M0 1120 L ${W} 1120 L ${W} 1300 L 0 1300 Z" fill="url(#pistaG)"/>
    ${Array.from({ length: 12 }, (_, k) => `<rect x="${k * 100}" y="1206" width="56" height="10" rx="5" fill="#fff" opacity="0.8"/>`).join("")}
    ${Array.from({ length: 22 }, (_, k) => `<circle cx="${k * 52}" cy="1124" r="5" fill="${k % 2 ? C.amarelo : "#fff"}"/>`).join("")}
    <rect y="1300" width="${W}" height="620" fill="#1b1a3a"/>
    <g class="regua" opacity="0"><path d="M110 1180 V 620" stroke="#fff" stroke-width="5"/>${Array.from({ length: 8 }, (_, k) => `<path d="M110 ${1180 - k * 80} h ${k % 2 ? 18 : 34}" stroke="#fff" stroke-width="4"/>`).join("")}
      <g transform="translate(250 620)"><g class="altR">${rotulo("10.000 m", C.azul, 36)}</g></g></g>
    <g class="rastro" opacity="0"><path class="r1" d="M560 1182 C 400 1190, 200 1200, -40 1206" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.7" fill="none"/></g>
    <g transform="translate(540 1162) scale(0.62)"><g class="aviao"><g class="avRot">${aviaoLado()}</g></g></g>
    <g transform="translate(540 980)"><g class="peso">${rotulo("+ DE 70 TONELADAS", C.vermelho, 40)}</g></g>
    <g transform="translate(830 700)"><g class="perg"><circle r="62" fill="#fff"/><text class="rot" y="30" text-anchor="middle" font-size="90" fill="#141a3a">?</text></g></g>`;
  lottieEm($(".nuvensA", el), "nuvens", 540, 560, 1300, 730, { loop: true, vel: 0.6 });
  raiosLuz; // (raios do sol entram nos efeitos, no fim)
  const av = $(".aviao", el), peso = $(".peso", el);
  surge(av, c.ini + 0.1, 40);
  tl.set([peso, $(".perg", el)], { opacity: 0 }, 0);
  const tp = B("peso", 0.2);
  tl.fromTo(peso, { y: -260, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "bounce.out", immediateRender: false }, tp - 0.35);
  tl.fromTo(av, { scaleY: 1 }, { scaleY: 0.96, duration: 0.12, yoyo: true, repeat: 1, transformOrigin: "50% 100%", immediateRender: false }, tp);
  // decolagem: corre, levanta o nariz e sobe
  const td = B("decola", 0.4);
  tl.to(peso, { opacity: 0, y: -40, duration: 0.3 }, td - 0.3);
  tl.to(av, { x: 120, duration: 0.6, ease: "power2.in" }, td - 0.2);
  const rot = $(".avRot", el);
  tl.fromTo(rot, { rotation: 0, svgOrigin: "0 40" }, { rotation: -12, svgOrigin: "0 40", duration: 0.5, ease: "power2.out", immediateRender: false }, td + 0.3);
  tl.to(av, { x: 340, y: -900, duration: 2.2, ease: "power1.inOut" }, td + 0.35);
  tl.to(rot, { rotation: -6, svgOrigin: "0 40", duration: 1.2, ease: "sine.inOut" }, td + 1.6);
  tl.set($(".rastro", el), { opacity: 1 }, td + 0.4);
  tl.to(av, { y: "-=12", duration: 1.1, yoyo: true, repeat: Math.max(1, Math.floor((c.fim - td - 2.6) / 1.1)), ease: "sine.inOut" }, td + 2.6);
  const ta = B("altura", 0.55);
  tl.set($(".regua", el), { opacity: 1 }, ta - 0.3);
  desenhar($(".regua path", el), ta - 0.3, 0.6);
  pop($(".altR", el), ta);
  pop($(".perg", el), B("pergunta", 0.7));
  tl.fromTo($(".perg", el), { rotation: -8 }, { rotation: 8, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, B("pergunta", 0.7) + 0.4);
};

// =============== 2. a mão para fora da janela do carro ===============
CENAS.carro_mao = (el, c, B) => {
  const ys = [720, 790, 850, 930, 1000, 1070];
  const reta = (y) => `M1120 ${y} C 820 ${y}, 560 ${y}, -40 ${y}`;
  const torta = (y) => { const p = Math.exp(-Math.abs(y - 890) / 160); return `M1120 ${y} C 900 ${y - 60 * p}, 640 ${y + 120 * p}, -40 ${y + 220 * p}`; };
  el.innerHTML = `
    <g class="estrada"><rect width="${W}" height="${H}" fill="url(#ceuDia)"/>
      <g class="morros"><path d="M-400 980 C -200 900, 0 960, 200 920 S 600 900, 800 940 S 1200 900, 1480 950 V 1300 H -400z" fill="#4fae7f"/></g>
      <g class="arvores">${Array.from({ length: 16 }, (_, k) => `<g transform="translate(${k * 180} 1060)"><rect x="-8" y="-60" width="16" height="60" fill="#5a3a22"/><circle cy="-90" r="${44 + (k % 3) * 10}" fill="${k % 2 ? "#2f8f6a" : "#3fa77a"}"/></g>`).join("")}</g>
      <rect y="1060" width="${W}" height="300" fill="#3b3f5c"/>
      <g class="faixas">${Array.from({ length: 16 }, (_, k) => `<rect x="${k * 150}" y="1196" width="80" height="12" rx="6" fill="#fff" opacity="0.8"/>`).join("")}</g>
      <rect y="1360" width="${W}" height="560" fill="#2a8a64"/>
      <g class="carroL"></g></g>
    <g class="close" opacity="0">
      <rect width="${W}" height="${H}" fill="url(#ceuDia)"/>
      <g class="morrosC" opacity="0.6"><path d="M-400 1180 C -100 1100, 200 1160, 500 1110 S 1100 1100, 1480 1150 V 1500 H -400z" fill="#4fae7f"/></g>
      <g class="ventos">${ys.map((y, k) => `<path class="vento" data-k="${k}" d="${reta(y)}" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" stroke-dasharray="60 46" opacity="0.85"/>`).join("")}</g>
      <rect x="-20" y="560" width="230" height="760" rx="30" fill="#e0a83a"/><rect x="-20" y="600" width="190" height="300" rx="20" fill="#9fe6ff" opacity="0.7"/><rect x="150" y="560" width="26" height="760" fill="#b98422"/>
      <g transform="translate(120 915) scale(1.2) translate(-120 -915)"><g class="braco"><path d="M120 878 C 260 868, 420 866, 560 868 L 560 930 C 420 934, 260 944, 120 952 Z" fill="#e9b48a"/>
        <path d="M100 868 C 180 860, 240 858, 290 860 L 290 948 C 240 950, 180 954, 100 960 Z" fill="${C.azul}"/>
        <g transform="translate(560 899)"><g class="mao">${mao()}</g></g></g></g>
      <g transform="translate(860 640)"><g class="sobe">${flecha(170, C.verde, "SOBE!", 0, "fSobe", 36)}</g></g>
      <g class="aviaoG" opacity="0"><g transform="translate(560 880)"><g class="avG">${aviaoLado()}</g></g></g>
    </g>`;
  const est = $(".estrada", el), close = $(".close", el);
  // carro andando: mundo passa para trás (paralaxe)
  const carro = lottieEm($(".carroL", el), "carro", 520, 1080, 760, 428, { loop: true, vel: 1.4 });
  [[".arvores", -1800], [".faixas", -1500], [".morros", -500]].forEach(([s, dx]) => tl.fromTo($(s, el), { x: 0 }, { x: dx, duration: c.fim - c.ini, ease: "none", immediateRender: false }, c.ini));
  // close na mão
  const tm = B("mao", 0.15);
  tl.to(est, { scale: 2.4, svgOrigin: "690 990", duration: 0.7, ease: "power3.in" }, tm - 0.35);
  tl.fromTo(close, { opacity: 0 }, { opacity: 1, duration: 0.35, immediateRender: false }, tm + 0.2);
  tl.set(est, { opacity: 0 }, tm + 0.6);
  const ventos = $$(".vento", el);
  tl.fromTo(ventos, { strokeDashoffset: 0 }, { strokeDashoffset: -4200, duration: c.fim - tm, ease: "none", immediateRender: false }, tm);
  tl.fromTo($(".braco", el), { x: -300 }, { x: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, tm + 0.25);
  const mo = $(".mao", el), br = $(".braco", el);
  // reta: nada; inclina: frente da mão para cima e o vento desvia para baixo
  const ti = B("inclina", 0.4);
  tl.to(mo, { rotation: -18, svgOrigin: "0 0", duration: 0.7, ease: "power2.inOut" }, ti);
  ventos.forEach((v, k) => tl.to(v, { morphSVG: torta(ys[k]), duration: 0.8, ease: "power2.inOut" }, ti + 0.1));
  const te = B("empurra", 0.6);
  tl.set($(".sobe", el), { opacity: 0 }, 0);
  tl.set($(".sobe", el), { opacity: 1 }, B("sentiu", 0.5));
  animFlecha($(".fSobe", el), B("sentiu", 0.5));
  tl.to(br, { rotation: -7, svgOrigin: "120 915", duration: 0.6, ease: "back.out(2)" }, te);
  // a mão vira asa
  const ta = B("asa", 0.75);
  tl.to($(".sobe", el), { opacity: 0, duration: 0.3 }, ta - 0.3);
  tl.to($(".palma", el), { morphSVG: PERFIL_D, attr: { fill: "url(#perfilG)" }, duration: 0.8, ease: "power2.inOut" }, ta);
  tl.to([$(".polegar", el), $(".dedos", el)], { opacity: 0, duration: 0.3 }, ta);
  tl.to($$(".braco > path", el), { opacity: 0, duration: 0.4 }, ta + 0.2);
  // ...e a asa é de um avião gigante
  const tg = B("gigante", 0.88);
  tl.to(mo, { opacity: 0, duration: 0.3 }, tg + 0.2);
  tl.fromTo($(".aviaoG", el), { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, tg);
  tl.fromTo($(".avG", el), { scale: 3.2, transformOrigin: "50% 50%" }, { scale: 1.0, transformOrigin: "50% 50%", duration: 1.0, ease: "power3.out", immediateRender: false }, tg);
};

// =============== 3. o segredo da asa: túnel de vento ===============
CENAS.asa = (el, c, B) => {
  const linhas = Array.from({ length: 11 }, (_, i) => 640 + i * 52);
  const corrente = (y) => {
    const p = Math.exp(-Math.abs(y - 890) / 110), cima = y < 890;
    return cima ? `M-40 ${y} C 180 ${y}, 300 ${y - 70 * p}, 540 ${y - 58 * p} S 900 ${y + 40 * p}, 1120 ${y + 95 * p}`
                : `M-40 ${y} C 200 ${y}, 320 ${y + 18 * p}, 560 ${y + 34 * p} S 900 ${y + 95 * p}, 1120 ${y + 135 * p}`;
  };
  el.innerHTML = `<rect width="${W}" height="${H}" fill="#0b1440"/>
    <g opacity="0.12">${Array.from({ length: 12 }, (_, k) => `<path d="M${k * 100} 300 V 1420 M0 ${300 + k * 100} H ${W}" stroke="#8fe3ff" stroke-width="2"/>`).join("")}</g>
    <ellipse class="baixa" cx="560" cy="800" rx="380" ry="120" fill="url(#baixaP)" opacity="0"/>
    <ellipse class="alta" cx="560" cy="1010" rx="380" ry="110" fill="url(#altaP)" opacity="0"/>
    <g class="linhas">${linhas.map((y) => `<path class="corr" d="${corrente(y)}" fill="none" stroke="#8fe3ff" stroke-width="3.5" stroke-dasharray="26 22" opacity="0.65"/>`).join("")}</g>
    <g class="pontos"></g>
    <g transform="translate(560 900) rotate(-8)"><g class="perfil"><path class="pf" d="M-330 10 C -280 -110, 60 -120, 330 -6 C 90 26, -150 44, -330 22 Z" fill="url(#perfilG)"/>
      <path class="contorno" d="M-330 10 C -280 -110, 60 -120, 330 -6 C 90 26, -150 44, -330 22 Z" fill="none" stroke="${C.amarelo}" stroke-width="6"/></g></g>
    <g class="desce">${[0, 1, 2].map((k) => `<g transform="translate(${850 + k * 62} ${990 + k * 22})"><g class="fd">${flecha(110, C.ciano, "", 180, "fdi")}</g></g>`).join("")}
      <g transform="translate(880 1215)"><g class="tDesce">${rotulo("AR PRA BAIXO", C.ciano, 32)}</g></g></g>
    <g transform="translate(560 880)"><g class="fSust">${flecha(330, C.verde, "", 0, "fsi")}</g></g>
    <g transform="translate(330 470)"><g class="tCima">${rotulo("ASA PRA CIMA", C.verde, 34)}</g></g>
    <g transform="translate(250 700)"><g class="tBaixa">${rotulo("MENOS PRESSÃO", C.azul, 30)}</g></g>
    <g transform="translate(250 1130)"><g class="tAlta">${rotulo("MAIS PRESSÃO", C.laranja, 30)}</g></g>
    <g transform="translate(560 390)"><g class="tSust">${rotulo("SUSTENTAÇÃO", C.amarelo, 50)}</g></g>
    <g transform="translate(540 1300)"><g class="tCurva">${rotulo("CURVADA E INCLINADA", C.amarelo, 32)}</g></g>`;
  const corr = $$(".corr", el);
  tl.fromTo(corr, { strokeDashoffset: 0 }, { strokeDashoffset: -3000, duration: c.fim - c.ini, ease: "none", immediateRender: false }, c.ini);
  // pontinhos de ar: por cima da asa andam mais rápido que por baixo
  corr.forEach((p, k) => { if (k % 2 === 0) fluxo(p, 3, 6, c.ini + 0.3, c.fim, linhas[k] < 890 ? 0.42 : 0.26, $(".pontos", el), "#ffffff"); });
  surge($(".perfil", el), c.ini + 0.15, 60);
  const esc = [".tCurva", ".tDesce", ".tCima", ".tBaixa", ".tAlta", ".tSust", ".fSust"].map((s) => $(s, el));
  tl.set([...esc, ...$$(".fd", el)], { opacity: 0 }, 0);
  const tc = B("curva", 0.2);
  desenhar($(".contorno", el), tc, 0.9);
  pop($(".tCurva", el), tc + 0.2);
  tl.to($(".tCurva", el), { opacity: 0, duration: 0.3 }, B("baixo", 0.35) - 0.4);
  const tb = B("baixo", 0.35);
  $$(".fd", el).forEach((f, k) => { tl.set(f, { opacity: 1 }, tb + k * 0.12); animFlecha($(".fdi", f.parentNode) || f.querySelector(".fdi"), tb + k * 0.12); });
  pop($(".tDesce", el), tb + 0.3);
  const tcm = B("cima", 0.5);
  tl.set($(".fSust", el), { opacity: 1 }, tcm);
  animFlecha($(".fsi", el), tcm);
  pop($(".tCima", el), tcm + 0.2);
  const tpr = B("pressao", 0.7);
  tl.to($(".baixa", el), { opacity: 1, duration: 0.6 }, tpr);
  tl.to($(".alta", el), { opacity: 1, duration: 0.6 }, tpr + 0.3);
  pop($(".tBaixa", el), tpr);
  pop($(".tAlta", el), tpr + 0.3);
  const ts = B("sustentacao", 0.92);
  tl.to([$(".tCima", el), $(".tDesce", el)], { opacity: 0, duration: 0.3 }, ts - 0.3);
  pop($(".tSust", el), ts);
  tl.fromTo($(".fSust", el), { scale: 1 }, { scale: 1.15, duration: 0.4, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "50% 100%", immediateRender: false }, ts);
};

// =============== 4. as quatro forças ===============
CENAS.quatro_forcas = (el, c, B) => {
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuDia)"/><g class="nuvensF"></g>
    <g class="voo"><g transform="translate(540 880) scale(0.5)"><g class="aviaoF">${aviaoLado()}</g></g>
      <g transform="translate(540 850)"><g class="fUp">${flecha(300, C.verde, "SUSTENTAÇÃO", 0, "fu", 30)}</g></g>
      <g transform="translate(540 920)"><g class="fDown">${flecha(300, C.vermelho, "PESO", 180, "fdn", 30)}</g></g>
      <g transform="translate(775 900)"><g class="fFront">${flecha(160, C.amarelo, "", 90, "ff")}<g transform="translate(80 -80)"><g class="lF">${rotulo("MOTORES", C.amarelo, 30)}</g></g></g></g>
      <g transform="translate(300 880)"><g class="fBack">${flecha(150, C.azul, "", -90, "fb")}<g transform="translate(-80 -80)"><g class="lB">${rotulo("RESISTÊNCIA DO AR", C.azul, 26)}</g></g></g></g></g>`;
  const nv = lottieEm($(".nuvensF", el), "nuvens", 540, 860, 1700, 956, { loop: true, vel: 1.2 });
  const av = $(".aviaoF", el);
  balancar(av, c.ini, c.fim, -8, 1.2);
  [["peso2", ".fdn", 0.2], ["sust", ".fu", 0.35], ["motores", ".ff", 0.55], ["arrasto", ".fb", 0.75]].forEach(([b, s, f]) => animFlecha($(s, el), B(b, f)));
  tl.set([$(".lF", el), $(".lB", el)], { opacity: 0 }, 0);
  pop($(".lF", el), B("motores", 0.55) + 0.2);
  pop($(".lB", el), B("arrasto", 0.75) + 0.2);
  // a sustentação vence o peso: a seta cresce e o avião sobe (nuvens descem)
  const tv = B("vencer", 0.9);
  tl.to($(".fu", el), { scaleY: 1.35, transformOrigin: "50% 100%", duration: 0.6, ease: "back.out(2)" }, tv);
  tl.to($(".voo", el), { y: -150, duration: 1.4, ease: "power2.inOut" }, tv + 0.2);
  tl.to(nv, { y: 260, duration: 1.6, ease: "power2.inOut" }, tv + 0.2);
};

// =============== 5. a velocidade e a decolagem ===============
CENAS.decolagem = (el, c, B) => {
  const ticks = Array.from({ length: 7 }, (_, k) => { const a = (-180 + k * 30) * Math.PI / 180; return `<path d="M${Math.cos(a) * 112} ${Math.sin(a) * 112} L ${Math.cos(a) * 132} ${Math.sin(a) * 132}" stroke="#fff" stroke-width="5"/><text class="rotm" x="${Math.cos(a) * 88}" y="${Math.sin(a) * 88 + 8}" text-anchor="middle" font-size="20" fill="#c7cde6">${k * 50}</text>`; }).join("");
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuCrep)"/>
    ${halo(900, 1000, 420, "solD")}<circle cx="900" cy="1000" r="70" fill="url(#sol)"/>
    <g class="cidadeD">${Array.from({ length: 30 }, (_, k) => `<rect x="${k * 90}" y="${1040 - 40 - ((k * 37) % 120)}" width="70" height="${40 + ((k * 37) % 120)}" fill="#3a3373" opacity="0.7"/>`).join("")}</g>
    <path d="M0 1040 H ${W} V 1920 H 0z" fill="#2c2a55"/><rect y="1100" width="${W}" height="220" fill="url(#pistaG)"/>
    <g class="chao">${Array.from({ length: 70 }, (_, k) => `<rect x="${k * 120}" y="1206" width="64" height="10" rx="5" fill="#fff" opacity="0.8"/><circle cx="${k * 120}" cy="1104" r="6" fill="${k % 2 ? C.amarelo : "#fff"}"/>`).join("")}</g>
    <rect y="1320" width="${W}" height="600" fill="#1b1a3a"/>
    <g class="velLinhas" opacity="0">${[0, 1, 2, 3].map((k) => `<path d="M1100 ${860 + k * 40} H -40" stroke="#fff" stroke-width="4" stroke-dasharray="80 120" opacity="0.6"/>`).join("")}</g>
    <g transform="translate(470 1172) scale(0.62)"><g class="aviaoD"><g class="avRotD">${aviaoLado()}</g></g></g>
    <g transform="translate(830 520)"><g class="gauge"><circle r="150" fill="rgba(6,10,30,0.7)" stroke="#c7cde6" stroke-width="6"/>${ticks}
      <path d="M-112 0 A 112 112 0 0 1 ${112 * Math.cos(-30 * Math.PI / 180)} ${112 * Math.sin(-30 * Math.PI / 180)}" fill="none" stroke="${C.verde}" stroke-width="8" opacity="0.5"/>
      <g class="ponteiro"><path d="M-6 0 L 0 -118 L 6 0 Z" fill="${C.vermelho}"/></g><circle r="12" fill="#fff"/>
      <text class="rot velTxt" y="78" text-anchor="middle" font-size="44" fill="#fff">0</text><text class="rotm" y="108" text-anchor="middle" font-size="22" fill="#c7cde6">km/h</text></g></g>
    <g transform="translate(240 540)"><g class="lupaF"><circle r="160" fill="#16205a" stroke="#fff" stroke-width="10"/>
      <g transform="translate(-40 10) scale(1.6)"><path d="M-80 -14 C -40 -30, 30 -30, 90 -6 L 70 6 C 10 0, -40 2, -80 4 Z" fill="url(#asaG)"/><g transform="translate(70 4)"><g class="flapZ"><path d="M0 -8 L 36 4 L 30 14 L -4 2 Z" fill="${C.amarelo}"/></g></g></g>
      <g transform="translate(0 120)">${rotulo("FLAPS", C.amarelo, 30)}</g></g></g>`;
  const av = $(".aviaoD", el), gauge = $(".gauge", el), lupaF = $(".lupaF", el);
  surge(av, c.ini + 0.1, 30);
  tl.set([gauge, lupaF], { opacity: 0 }, 0);
  const tvl = B("vel", 0.15), tr = B("rapido", 0.3), tp = B("pista", 0.5), tk = B("kmh", 0.65), tdc = B("decolar", 0.8), tf = B("flaps", 0.92);
  pop(gauge, tvl);
  tl.set($(".velLinhas", el), { opacity: 1 }, tr);
  tl.fromTo($$(".velLinhas path", el), { strokeDashoffset: 0 }, { strokeDashoffset: 3000, duration: c.fim - tr, ease: "none", immediateRender: false }, tr);
  // corrida: o chão passa cada vez mais rápido; velocímetro sobe até 250 km/h
  tl.fromTo($(".chao", el), { x: 0 }, { x: -7200, duration: c.fim - tp, ease: "power2.in", immediateRender: false }, tp);
  tl.fromTo($(".cidadeD", el), { x: 0 }, { x: -600, duration: c.fim - tp, ease: "power2.in", immediateRender: false }, tp);
  const vel = (t) => chaves(t, [[tp, 0], [tk + 0.3, 250], [c.fim, 300]], (x) => x);
  const pont = $(".ponteiro", el), txt = $(".velTxt", el);
  aCadaQuadro((t) => { if (t < c.ini - 0.5 || t > c.fim + 0.5) return; const v = vel(t); pont.setAttribute("transform", `rotate(${-90 + (v / 300) * 180})`); txt.textContent = Math.round(v); });
  tl.fromTo(gauge, { scale: 1 }, { scale: 1.12, duration: 0.25, yoyo: true, repeat: 1, transformOrigin: "50% 50%", immediateRender: false }, tk + 0.3);
  // decola: nariz para cima e sobe
  tl.fromTo($(".avRotD", el), { rotation: 0, svgOrigin: "0 40" }, { rotation: -11, svgOrigin: "0 40", duration: 0.6, ease: "power2.out", immediateRender: false }, tdc - 0.2);
  tl.to(av, { y: -560, x: 160, duration: 2.4, ease: "power2.in" }, tdc + 0.2);
  // flaps esticando (no avião e na lupa)
  pop(lupaF, tf - 0.3);
  tl.fromTo($(".flapZ", el), { x: -30, rotation: 0 }, { x: 0, rotation: 24, svgOrigin: "0 0", duration: 0.7, ease: "power2.out", immediateRender: false }, tf);
  tl.fromTo($(".flaps", el), { x: 30, rotation: 0 }, { x: 0, rotation: 18, svgOrigin: "0 0", duration: 0.7, ease: "power2.out", immediateRender: false }, tf);
};

// =============== 6. as partes móveis que fazem a curva ===============
CENAS.controle = (el, c, B) => {
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuNoite)"/>${estrelas(60, 77, 0, 1400)}
    <g class="nuvensC"></g>
    <g transform="translate(540 860) scale(0.92)"><g class="topo">${aviaoTopo()}</g></g>
    <g class="cA" opacity="0">${callout(880, 990, 800, 1320, "ailerons", C.amarelo)}</g>
    <g class="cP" opacity="0">${callout(700, 1240, 560, 1330, "profundor", C.rosa)}</g>
    <g class="cL" opacity="0">${callout(540, 1260, 300, 1330, "leme", C.verde)}</g>
    <g transform="translate(540 1360)"><g class="maoC">${mao()}</g></g>`;
  lottieEm($(".nuvensC", el), "nuvens", 540, 860, 1500, 844, { loop: true, vel: 0.5 });
  const topo = $(".topo", el), ail = $$(".aileron", el), prof = $$(".profundorT", el), leme = $(".lemeT", el);
  surge(topo, c.ini + 0.1, 80);
  tl.set($(".maoC", el), { opacity: 0 }, 0);
  const tm = B("moveis", 0.2), ta = B("ailerons", 0.35), tp = B("profundor", 0.6), tlm = B("leme", 0.78), tmo = B("maoFim", 0.92);
  tl.to([...ail, ...prof, leme], { fill: C.amarelo, duration: 0.2, yoyo: true, repeat: 3 }, tm);
  // ailerons: um sobe, outro desce -> o avião inclina para o lado
  tl.to(ail, { fill: C.amarelo, duration: 0.2 }, ta);
  callAnim($(".cA", el), ta);
  tl.to(topo, { scaleX: 0.86, rotation: 6, transformOrigin: "50% 50%", duration: 0.7, yoyo: true, repeat: 1, ease: "sine.inOut" }, ta + 0.3);
  // profundor: nariz sobe/desce (o avião "encolhe" e "estica" na vertical, visto de cima)
  tl.to(ail, { fill: "#6b779c", duration: 0.3 }, tp - 0.2);
  tl.to(prof, { fill: C.rosa, duration: 0.2 }, tp);
  callAnim($(".cP", el), tp);
  tl.to(topo, { scaleY: 0.9, transformOrigin: "50% 50%", duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, tp + 0.3);
  // leme: vira o nariz para a esquerda e para a direita
  tl.to(prof, { fill: "#6b779c", duration: 0.3 }, tlm - 0.2);
  tl.to(leme, { fill: C.verde, duration: 0.2 }, tlm);
  callAnim($(".cL", el), tlm);
  tl.to(topo, { rotation: -14, transformOrigin: "50% 50%", duration: 0.6, ease: "sine.inOut" }, tlm + 0.3);
  tl.to(topo, { rotation: 10, transformOrigin: "50% 50%", duration: 0.9, ease: "sine.inOut" }, tlm + 0.9);
  tl.to(topo, { rotation: 0, transformOrigin: "50% 50%", duration: 0.6, ease: "sine.inOut" }, tlm + 1.8);
  // a mão de novo: o mesmo princípio
  tl.to([$(".cA", el), $(".cP", el), $(".cL", el)], { opacity: 0, duration: 0.3 }, tmo - 0.3);
  pop($(".maoC", el), tmo);
  tl.fromTo($(".maoC", el), { rotation: 0 }, { rotation: -18, svgOrigin: "0 0", duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, tmo + 0.4);
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const passos = [["OS MOTORES EMPURRAM", C.amarelo], ["O AR PASSA RÁPIDO NA ASA", C.azul], ["A ASA JOGA O AR PRA BAIXO", C.verde], ["A SUSTENTAÇÃO VENCE O PESO", C.rosa]];
  el.innerHTML = `<rect width="${W}" height="${H}" fill="url(#ceuNoite)"/>${estrelas(70, 91, 0, 1400)}
    <path class="espinha" d="M170 470 V 1230" stroke="rgba(255,255,255,0.25)" stroke-width="6" stroke-linecap="round"/>
    ${passos.map(([t, cor], k) => `<g transform="translate(170 ${470 + k * 253})"><g class="passo"><circle r="66" fill="${cor}"/><text class="rot" y="22" text-anchor="middle" font-size="60" fill="#141a3a">${k + 1}</text><text class="rot" x="100" y="16" font-size="${t.length > 22 ? 40 : 46}" fill="#fff">${t}</text></g></g>`).join("")}
    <g transform="translate(-300 380) scale(0.34)"><g class="voaR">${aviaoLado()}</g></g>`;
  const ps = $$(".passo", el);
  tl.set(ps, { opacity: 0 }, c.ini);
  desenhar($(".espinha", el), c.ini + 0.2, 1.2);
  ["passo1", "passo2", "passo3", "passo4"].forEach((b, k) => tl.fromTo(ps[k], { x: -80, opacity: 0, scale: 0.8 }, { x: 0, opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)", immediateRender: false }, B(b, 0.15 + k * 0.15)));
  const tv = B("voa", 0.7), tcta = B("cta", 0.8);
  tl.fromTo($(".voaR", el), { x: 0, y: 0 }, { x: 1700 / 0.34 + 900, y: -200, duration: 2.2, ease: "power1.inOut", immediateRender: false }, tv - 0.3);
  tl.to([...ps, $(".espinha", el)], { opacity: 0, x: -60, duration: 0.4, stagger: 0.04, ease: "power2.in" }, tcta - 0.45);
  cartaoFinal(el, tcta);
  lottieEm(el, "confete", 540, 900, 1080, 1440, { ini: tcta + 0.2, fim: T, loop: false, corte: true });
};

// =============== efeitos de luz e acabamento ===============
const _comEfeitos = (tipo, fx) => { const base = CENAS[tipo]; CENAS[tipo] = (el, c, B, i, f) => { base(el, c, B, i, f); fx(el, c, B, f); }; };
_comEfeitos("aeroporto", (el, c) => {
  $(".solA", el).insertAdjacentHTML("afterend", raiosLuz(820, 1040, 16, 200, 900, -90, "raiosA", 3));
  animarRaios($(".raiosA", el), 0, c.fim);
  el.insertAdjacentHTML("beforeend", flare(820, 1040, 0.8) + `<g class="bkA"></g>`);
  bokeh($(".bkA", el), 12, 5, [0, 300, W, 800], 0, c.fim, ["#ffd23f", "#ff8aa4", "#fff3c0"]);
  desfocar($(".cidade", el), 1);
  volume($(".aviao", el));
});
_comEfeitos("carro_mao", (el, c) => { volume([$(".mao", el), $(".aviaoG", el)]); brilhar($(".fSobe", el)); desfocar($(".morrosC", el), 2); });
_comEfeitos("asa", (el, c) => { brilhar([$(".linhas", el), $(".pontos", el), $(".fSust", el), $(".tSust", el)]); volume($(".perfil", el)); el.insertAdjacentHTML("beforeend", `<g class="bkW"></g>`); bokeh($(".bkW", el), 10, 11, [0, 300, W, 1100], c.ini, c.fim, ["#8fe3ff", "#4cc9f0"]); });
_comEfeitos("quatro_forcas", (el, c) => { volume($(".aviaoF", el)); brilhar([$(".fu", el), $(".fdn", el), $(".ff", el), $(".fb", el)]); });
_comEfeitos("decolagem", (el, c) => {
  $(".solD", el).insertAdjacentHTML("afterend", raiosLuz(900, 1000, 14, 200, 900, -90, "raiosD", 9));
  animarRaios($(".raiosD", el), c.ini, c.fim);
  volume([$(".aviaoD", el), $(".gauge", el)]);
  brilhar($(".velLinhas", el));
});
_comEfeitos("controle", (el, c) => { volume($(".topo", el)); el.insertAdjacentHTML("beforeend", `<g class="bkC"></g>`); bokeh($(".bkC", el), 14, 21, [0, 300, W, 1100], c.ini, c.fim, ["#8fe3ff", "#ffd23f", "#ff5d8f"]); });
_comEfeitos("resumo", (el, c) => { $$(".passo", el).forEach((p) => brilhar(p.querySelector("circle"))); el.firstElementChild.insertAdjacentHTML("afterend", `<g class="bkR"></g>`); bokeh($(".bkR", el), 16, 37, [0, 300, W, 1100], c.ini, c.fim, ["#ffd23f", "#4cc9f0", "#ff5d8f"]); });
