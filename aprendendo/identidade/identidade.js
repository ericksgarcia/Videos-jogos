// Identidade do canal: paleta, marca no topo, faixas de leitura, barra de progresso,
// legendas palavra a palavra, títulos de capítulo, título de abertura e cartão final.
// Textos e cores vêm de identidade/marca.json (MARCA). Vale para todos os vídeos.

const C = MARCA.paleta;
const [NOME1, NOME2] = MARCA.nome_tela;
// lâmpada do logo (caminho em 0..36 x 0..40)
const LOGO_LAMPADA = `<path d="M18 2a14 14 0 0 0-8 25.5V32h16v-4.5A14 14 0 0 0 18 2z" fill="${C.tinta}"/><rect x="11" y="34" width="14" height="4" rx="2" fill="${C.tinta}"/>`;

// ---------- camadas fixas por cima da ilustração ----------
(() => {
  // cores da marca viram variáveis CSS (usadas em marca.css)
  Object.entries(C).forEach(([k, v]) => { if (typeof v === "string") document.documentElement.style.setProperty(`--${k}`, v); });
  C.selo.forEach((v, k) => document.documentElement.style.setProperty(`--selo${k + 1}`, v));
  const root = $("#root");
  h("div", null, null, root).id = "vinheta";
  h("div", null, null, root).id = "faixa-topo";
  h("div", null, null, root).id = "faixa-base";
  const m = h("div", null, `<div class="selo"><svg width="30" height="34" viewBox="0 0 36 40">${LOGO_LAMPADA}</svg></div><div class="nome">${NOME1} <b>${NOME2}</b></div>`, root);
  m.id = "marca";
  ["capitulo", "gancho", "leg", "progresso"].forEach((id) => { h("div", null, null, root).id = id; });
})();

// ---------- barra de progresso ----------
tl.fromTo("#progresso", { scaleX: 0 }, { scaleX: 1, duration: T, ease: "none" }, 0);

// ---------- legendas: 4 palavras por vez; a falada fica amarela, as das batidas ciano ----------
const LEG = $("#leg");
A.cenas.forEach((c) => {
  const L = c.legendas;  // bloco curtíssimo é juntado ao seguinte
  for (let k = L.length - 2; k >= 0; k--) if (L[k].fim - L[k].ini < 0.4 && L[k].palavras.length + L[k + 1].palavras.length <= 5) {
    L[k + 1] = { ini: L[k].ini, fim: L[k + 1].fim, palavras: L[k].palavras.concat(L[k + 1].palavras), destaque: L[k].destaque.concat(L[k + 1].destaque) };
    L.splice(k, 1);
  }
});
A.cenas.forEach((c) => c.legendas.forEach((b) => {
  const bl = h("div", "bloco", null, LEG);
  const ws = b.palavras.map(([w], k) => h("span", b.destaque[k] ? "k" : null, w, bl));
  const sai = Math.max(b.ini + 0.12, Math.min(b.fim, c.fim - 0.1));
  tl.fromTo(bl, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: Math.min(0.18, sai - b.ini - 0.02), ease: "power2.out", immediateRender: false }, b.ini);
  tl.set(bl, { opacity: 0 }, sai);
  b.palavras.forEach(([, wi, wf], k) => {
    tl.set(ws[k], { color: C.amarelo }, wi);
    tl.set(ws[k], { color: b.destaque[k] ? C.ciano : "rgba(255,255,255,0.92)" }, Math.max(wi + 0.05, wf));
  });
}));

// ---------- títulos de capítulo ("PARTE 01" + título da cena) ----------
const CAP = $("#capitulo");
A.cenas.forEach((c, i) => {
  if (i === 0) return;
  const lt = h("div", "lt", `<div class="num">${MARCA.capitulo_prefixo} ${String(i).padStart(2, "0")}</div><div class="barra"></div><div class="t">${c.titulo}</div>`, CAP);
  tl.set(lt, { opacity: 1 }, c.ini + 0.1);
  tl.fromTo($(".num", lt), { x: -30, opacity: 0 }, { x: 0, opacity: 1, duration: 0.4, ease: "power3.out", immediateRender: false }, c.ini + 0.1);
  tl.fromTo($(".barra", lt), { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.out", immediateRender: false }, c.ini + 0.2);
  tl.fromTo($(".t", lt), { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power3.out", immediateRender: false }, c.ini + 0.25);
  tl.to(lt, { opacity: 0, y: -20, duration: 0.3, ease: "power2.in" }, (i === A.cenas.length - 1 && c.batidas.cta ? c.batidas.cta : c.fim) - 0.35);
});

// ---------- título de abertura (gancho): aparece em 0 s, encolhe e sai no instante `sai` ----------
function mostrarGancho(sai) {
  const G = $("#gancho"), dest = (D.gancho_destaque || "").toUpperCase();
  G.innerHTML = `<div class="sup">${MARCA.abertura_sobretitulo}</div><div class="linha">${D.gancho.split(" ").map((w) => `<span class="${dest && w.toUpperCase().includes(dest) ? "dest" : ""}">${w}</span>`).join(" ")}</div>`;
  tl.set(G, { opacity: 1 }, 0);
  tl.fromTo($(".sup", G), { opacity: 0, letterSpacing: "0.6em" }, { opacity: 1, letterSpacing: "0.3em", duration: 0.6, ease: "power3.out" }, 0);
  tl.fromTo($$(".linha span", G), { y: 70, opacity: 0, rotationX: -60 }, { y: 0, opacity: 1, rotationX: 0, duration: 0.55, stagger: 0.09, ease: "back.out(1.6)" }, 0.05);
  tl.to(G, { scale: 0.78, y: -20, duration: 0.7, ease: "power2.inOut" }, Math.min(1.6, sai - 0.8));
  tl.to(G, { opacity: 0, y: -60, duration: 0.4 }, sai);
}

// ---------- cartão final (logo se desenhando, nome, SEGUIR, pergunta); aparece no instante t ----------
function cartaoFinal(pai, t) {
  pai.insertAdjacentHTML("beforeend", `<g class="fim" opacity="0">${halo(540, 760, 420, "haloFim")}
    <g transform="translate(540 760)"><g class="logo"><rect x="-130" y="-130" width="260" height="260" rx="70" fill="url(#sol)"/><path class="bulbo" d="M0 -82 a66 66 0 0 0 -38 120 v22 h76 v-22 A66 66 0 0 0 0 -82z" fill="none" stroke="${C.tinta}" stroke-width="14" stroke-linejoin="round"/><rect x="-32" y="72" width="64" height="18" rx="9" fill="${C.tinta}"/></g></g>
    <g transform="translate(540 1020)"><g class="fi"><text class="rot" text-anchor="middle" font-size="78" fill="#fff">${NOME1} <tspan fill="${C.amarelo}">${NOME2}</tspan></text></g></g>
    <g transform="translate(540 1150)"><g class="fi seguir"><rect x="-210" y="-60" width="420" height="120" rx="60" fill="${C.rosa}"/><text class="rot" y="22" text-anchor="middle" font-size="58" fill="#fff">${MARCA.cta_tela.botao}</text></g></g>
    <g transform="translate(540 1290)"><g class="fi"><text class="rotm" text-anchor="middle" font-size="40" fill="#c7cde6">${MARCA.cta_tela.pergunta}</text></g></g></g>`);
  const fim = pai.querySelector(".fim");
  tl.set(fim, { opacity: 1 }, t);
  pop($(".logo", fim), t);
  desenhar($(".bulbo", fim), t + 0.2, 0.7);
  $$(".fi", fim).forEach((f, k) => surge(f, t + 0.4 + k * 0.15, 50));
  tl.fromTo($(".seguir", fim), { scale: 1 }, { scale: 1.07, duration: 0.45, yoyo: true, repeat: Math.max(1, Math.floor((T - t - 1) / 0.45)), ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, t + 1);
}
