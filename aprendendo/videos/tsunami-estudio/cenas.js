// Tsunami (versão estúdio): cada cena é ILUSTRADA antes (arte/*.js → imagens/*.png, pintadas por
// motor/pintar.cjs com grão, luz de contorno, névoa e brilho) e ANIMADA aqui em camadas.
// Roteiro de cor: 1 pôr do sol · 2 abismo noturno com manto aceso · 3 tarde dourada · 4 mapa noturno ·
// 5 manhã na costa · 6 praia ao meio-dia · 7 noite estrelada · 8 volta ao pôr do sol.
const _g = (x, c, w) => Math.exp(-Math.pow((x - c) / w, 2));
const _lim = (u) => Math.min(1, Math.max(0, u));
const chip = (ic, txt, cor, fundo, tinta) => {
  const w = larguraTexto(txt, 30, 900) + (ic ? 110 : 60);
  return `<rect x="${-w / 2}" y="-34" width="${w}" height="68" rx="34" fill="${fundo || "#fff"}"/>${ic ? `<g transform="translate(${-w / 2 + 40} 0)">${icone(ic, 38, cor || "#0a1230")}</g>` : ""}
    <text class="rot" x="${ic ? -w / 2 + 70 : 0}" y="11" font-size="30" fill="${tinta || "#0a1230"}"${ic ? "" : ` text-anchor="middle"`}>${txt}</text>`;
};
// número/palavra gigante (a tipografia é a imagem principal), com sombra suave para ler sobre a arte
$("#defs").insertAdjacentHTML("beforeend", `<filter id="sombraTipo" x="-20%" y="-30%" width="140%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="16"/><feColorMatrix values="0 0 0 0 0.04  0 0 0 0 0.02  0 0 0 0 0.12  0 0 0 0.6 0"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <clipPath id="lenteC"><circle r="250"/></clipPath>`);
const tipo = (cls, txt, tam, sub, ic) => `<g class="${cls}" opacity="0"><text class="rot tx" text-anchor="middle" font-size="${tam}" fill="#fff" letter-spacing="${-tam / 32}">${txt}</text>
  ${sub ? `<g transform="translate(0 ${tam * 0.34})">${chip(ic, sub)}</g>` : ""}</g>`;
const mostraTipo = (g, t0, t1) => { // entra de baixo, sai para cima
  tl.set(g, { opacity: 0 }, 0);
  tl.fromTo(g, { y: 140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", immediateRender: false }, t0);
  if (t1) tl.to(g, { y: -140, opacity: 0, duration: 0.4, ease: "power3.in" }, t1);
};
// superfície do mar: ondulação de vento + a rampa do tsunami (gaussiana larga) que passa em xc(t)
const mar = (Y0, xc, A) => {
  const alt = (k, x, t) => Y0 + k * 120 + (9 - k * 2) * Math.sin(x / (70 + k * 25) - t * (1.6 + k * 0.35) + k) + (k ? 0 : 4 * Math.sin(x / 31 + t * 1.2))
    - A(t) * (k === 0 ? 1 : 0.85 - k * 0.12) * _g(x, xc(t) - k * 40, 300 + k * 20);
  const linha = (k, t, dy = 0) => { let d = ""; for (let x = -300; x <= W + 300; x += 12) d += `${x === -300 ? "M" : "L"}${x} ${(alt(k, x, t) + dy).toFixed(1)} `; return d; };
  return { alt, linha };
};

// ============ 1. GANCHO — alto mar ao pôr do sol ============
CENAS.altomar = (el, c, B) => {
  mostrarGancho(B("navio", 0) - 0.3);
  const tn = B("navio", 0.1), tti = B("titulo", 0), tv = B("vel", 0.2), tna = B("nada", 0.3), tts = B("tsunami", 0.4), tpr = B("promessa", 0.7);
  const Y0 = 1180, SOLX = 820, Lnav = 635;
  const xc = (t) => t < tv - 0.5 ? -900 : -700 + (t - tv + 0.5) * 300, A = (t) => 26;
  const M = mar(Y0, xc, A);
  el.innerHTML = `<g class="cam">
      <image href="assets/imagens/ceu.png" x="-210" y="${Y0 - 1560}" width="1500" height="1600"/>
      ${[["nuvem3", -40, Y0 + 12, 420, 3], ["nuvem2", 380, Y0 + 8, 260, 5], ["nuvem1", 760, Y0 + 14, 360, 4]].map(([n, x, y, w, v]) =>
        `<g transform="translate(${x} ${y})"><g class="nuv" data-v="${v}" opacity="0.85">${objeto(n, w)}</g></g>`).join("")}
      <g transform="translate(70 ${Y0 + 8})">${objeto("ilha", 300)}</g>
      <circle class="farol" cx="18" cy="${Y0 - 92}" r="22" fill="#ffe2a0" opacity="0.6"/>
      <g class="navioW">${objeto("navio", Lnav, { afunda: 56 })}</g>
      <clipPath id="cpMar"><path class="sup" d=""/></clipPath>
      <image href="assets/imagens/mar.png" x="-210" y="${Y0 - 60}" width="1500" height="1100" clip-path="url(#cpMar)"/>
      <image href="assets/imagens/fundo.png" x="-210" y="1700" width="1500" height="520"/>
      <path class="ondas" d="" fill="none" stroke="#cfe6ff" stroke-width="2" opacity="0.14"/>
      <g class="velW" opacity="0"></g>
      <g class="pontosW" opacity="0"></g>
      <path class="aro" d="" fill="none" stroke="#ffc39a" stroke-width="3" opacity="0.9"/>
      <path class="ouro" d="" fill="none" stroke="#ffe2a8" stroke-width="3.2" stroke-linecap="round"/>
      <path class="brilhos" d="" fill="none" stroke="#f4e8ff" stroke-width="2.4" stroke-linecap="round" opacity="0.55"/>
      <path class="espuma" d="" fill="#fff4ea" opacity="0.9"/>
      <path class="linhaAm" d="" fill="none" stroke="${C.amarelo}" stroke-width="7" stroke-linecap="round"/>
      <g class="mNavW"><g class="mNav">${chip("waves", "CARGUEIRO · 300 m")}</g></g></g>
    <g filter="url(#sombraTipo)">
      <g transform="translate(540 1130)">${tipo("t700", "700", 260, "KM/H · EMBAIXO DO NAVIO", "gauge")}</g>
      <g transform="translate(540 840)"><g class="tTsu" opacity="0"><rect class="marca" x="-390" y="-118" width="780" height="150" rx="6" fill="${C.amarelo}"/>
        <text class="rot" text-anchor="middle" font-size="170" fill="#0a1230" letter-spacing="-2">TSUNAMI</text></g></g></g>
    <g transform="translate(540 800)"><g class="lente" opacity="0">
      <circle r="262" fill="#fff"/><g clip-path="url(#lenteC)"><g class="lenteImg"><image href="assets/imagens/xicara.png" x="-250" y="-250" width="500" height="500"/></g></g>
      <circle r="250" fill="none" stroke="#0a1230" stroke-width="3" opacity="0.3"/>
      <g transform="translate(0 300)">${chip("", "NA PONTE: NEM UMA ONDINHA NO CAFÉ")}</g></g></g>
    <g transform="translate(540 1300)"><g class="cProm" opacity="0"><rect x="-400" y="-66" width="800" height="132" rx="30" fill="#fff"/>
      <g transform="translate(-330 0)"><circle r="38" fill="${C.amarelo}"/>${icone("warning", 42, "#0a1230")}</g>
      <text class="rot" x="-268" y="-8" font-size="36" fill="#0a1230">No final: a menina de 10 anos</text>
      <text class="rotm" x="-268" y="34" font-size="27" fill="#0a1230" opacity="0.7">que salvou 100 pessoas olhando o mar</text></g></g>`;

  // coluna d'água em pontos: o vento só mexe em cima; o tsunami empurra do fundo até a superfície
  const pw = $(".pontosW", el), PTS = [];
  for (let y = Y0 + 70; y < Y0 + 560; y += 34) for (let x = -220; x < W + 220; x += 34) PTS.push([x + ((y / 34) % 2) * 17, y]);
  pw.innerHTML = PTS.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${(3.8 - (y - Y0) / 240).toFixed(1)}" fill="#dff0ff"/>`).join("");
  const pc = [...pw.children];
  // linhas de velocidade na frente da onda (embaixo d'água)
  const vw = $(".velW", el);
  vw.innerHTML = Array.from({ length: 14 }, (_, k) => `<path d="M0 ${Y0 + 90 + k * 34} h ${120 + (k * 53) % 140}" stroke="#ffe2a8" stroke-width="${2 + (k % 3)}" stroke-linecap="round" opacity="${0.35 + (k % 4) * 0.12}"/>`).join("");
  tl.to(pw, { opacity: 0.85, duration: 0.5 }, tv - 0.4); tl.to(vw, { opacity: 1, duration: 0.3 }, tv - 0.2); tl.to(vw, { opacity: 0, duration: 0.5 }, tna);

  const [sup, aro, ouro, ondas, brilhos, espuma, nav, lam, mW, farol] = [".sup", ".aro", ".ouro", ".ondas", ".brilhos", ".espuma", ".navioW", ".linhaAm", ".mNavW", ".farol"].map((s) => $(s, el));
  const nuvs = $$(".nuv", el);
  aCadaQuadro((t) => {
    if (t > c.fim + 0.6) return;
    const d0 = M.linha(0, t);
    lam.setAttribute("d", d0); aro.setAttribute("d", d0);
    sup.setAttribute("d", M.linha(0, t, 7) + `L ${W + 300} ${H + 900} L -300 ${H + 900} Z`);
    ondas.setAttribute("d", [1, 2, 3].map((k) => M.linha(k, t)).join(" "));
    const sx = 500 + (t - c.ini) * 6, sy = M.alt(0, sx, t), inc = Math.atan2(M.alt(0, sx + 160, t) - M.alt(0, sx - 160, t), 320) * 57.3;
    nav.setAttribute("transform", `translate(${sx.toFixed(1)} ${sy.toFixed(1)}) rotate(${inc.toFixed(2)})`);
    mW.setAttribute("transform", `translate(${(sx + 40).toFixed(1)} ${(sy - 300).toFixed(1)})`);
    let o = "";
    for (let k = 0; k < 26; k++) { const f = Math.sin(t * 7 + k * 2.3), x = SOLX + Math.sin(k * 12.9) * (40 + k * 6) + 6 * Math.sin(t * 2 + k), y = M.alt(0, x, t) + 10 + k * 7;
      if (f > -0.2 && Math.abs(x - sx) > 330) o += `M${(x - 14 - f * 10).toFixed(1)} ${y.toFixed(1)} h ${(28 + f * 20).toFixed(1)} `; }
    ouro.setAttribute("d", o);
    let br = ""; for (let k = 0; k < 18; k++) { const x = ((k * 97 + t * 50) % (W + 400)) - 200, y = M.alt(0, x, t) + 16 + (k % 4) * 10, w = 12 + (k % 3) * 9;
      if (Math.abs(x - sx) > 330 && Math.abs(x - SOLX) > 120) br += `M${x.toFixed(1)} ${y.toFixed(1)} h ${w} `; }
    brilhos.setAttribute("d", br);
    let es = ""; [[sx + 290, 50], [sx - 290, 80]].forEach(([x0, w]) => { for (let k = 0; k < 8; k++) { const x = x0 - w / 2 + k * w / 7 + 4 * Math.sin(t * 5 + k), y = M.alt(0, x, t) + 6, r = 5 + 3 * Math.sin(t * 4 + k * 2);
      es += `M${(x - r).toFixed(1)} ${y.toFixed(1)} a ${r.toFixed(1)} ${(r * 0.55).toFixed(1)} 0 1 0 ${(2 * r).toFixed(1)} 0 Z `; } });
    espuma.setAttribute("d", es);
    nuvs.forEach((n) => n.setAttribute("transform", `translate(${(-t * +n.dataset.v).toFixed(1)} 0)`));
    farol.setAttribute("opacity", (0.2 + 0.5 * Math.max(0, Math.sin(t * 2.4))).toFixed(2));
    vw.setAttribute("transform", `translate(${(xc(t) + 260).toFixed(1)} 0)`);
    if (t < tv - 0.6) return;
    const a = A(t) * 1.6;
    PTS.forEach(([x, y], i) => {
      const prof = (y - Y0) / 560, ph = x / 90 - t * 2.2 + y / 120, g = a * _g(x, xc(t) - prof * 60, 300);
      pc[i].setAttribute("transform", `translate(${(9 * (1 - prof) * Math.cos(ph) + g * 0.9).toFixed(1)} ${(9 * (1 - prof) * Math.sin(ph) - g * (1 - prof * 0.35)).toFixed(1)})`);
      pc[i].setAttribute("opacity", (0.25 + Math.min(0.75, g / 40)).toFixed(2));
    });
  });
  // tipografia e cartões nas batidas
  entrar($(".mNav", el), 1.2, "escala"); sair($(".mNav", el), tv - 0.4);
  mostraTipo($(".t700", el), tv - 0.25, tna - 0.5);
  contador($(".t700 .tx", el), 0, 700, tv - 0.2, 0.9, (v) => Math.round(v));
  // lente: nasce pequena na ponte do navio e cresce até o centro
  const L = $(".lente", el);
  tl.set(L, { opacity: 0 }, 0);
  tl.fromTo(L, { opacity: 0, scale: 0.15, x: -290, y: 210 }, { opacity: 1, scale: 1, x: 0, y: 0, duration: 0.7, ease: "power3.out", immediateRender: false }, tna - 0.4);
  tl.fromTo($(".lenteImg", el), { scale: 1.25 }, { scale: 1, duration: 2.2, ease: "power2.out", immediateRender: false }, tna - 0.4);
  tl.to(L, { opacity: 0, scale: 0.85, duration: 0.3, ease: "power2.in" }, tts - 0.35);
  tl.set(lam, { opacity: 0 }, 0); tl.set(lam, { opacity: 1 }, tts - 0.45); desenhar(lam, tts - 0.45, 0.9);
  const tT = $(".tTsu", el);
  tl.set(tT, { opacity: 1 }, tts - 0.1);
  tl.fromTo($(".marca", tT), { scaleX: 0, svgOrigin: "-400 0" }, { scaleX: 1, svgOrigin: "-400 0", duration: 0.45, ease: "power3.out", immediateRender: false }, tts - 0.1);
  tl.fromTo($("text", tT), { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", immediateRender: false }, tts);
  tl.to(tT, { y: -140, opacity: 0, duration: 0.45, ease: "power3.in" }, tpr - 0.4);
  tl.set($(".cProm", el), { opacity: 1 }, tpr); entrar($(".cProm", el), tpr, "baixo");
  // câmera: janela da ponte → plano geral → mergulho (onda passando) → volta → plano geral → desce para a cena 2
  const bx = 500 - 0.93 * 240, by = Y0 - 0.93 * 190;
  cameraFases($(".cam", el), [[c.ini - 0.3, 3.0, bx, by], [0.6, 2.8, bx, by], [tv - 0.6, 1.0, 540, 1000], [tv + 0.5, 1.0, 540, 1480],
    [tna - 0.4, 1.0, 540, 1480], [tna + 0.4, 1.0, 540, 1000], [tts + 0.3, 0.92, 540, 1020], [tti - 0.3, 0.95, 540, 1020], [c.fim + 0.6, 1.5, 540, 1720]], c.fim);
};
