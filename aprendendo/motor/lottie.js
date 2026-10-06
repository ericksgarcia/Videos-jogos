// Animações Lottie (designers profissionais, LottieFiles) dentro das cenas.
// Os arquivos ficam em videos/<tema>/lottie/<nome>.json e chegam aqui em window.LOTTIE.
// Cada quadro do vídeo leva a animação ao quadro exato (goToAndStop): determinístico.
//
//   const g = lottieEm(el, "fogo", x, y, largura, altura, { ini, fim, loop: true, vel: 1 });
//   pop(g, t)   // g é o <g> interno: anime à vontade (aparecer, mover, escalar)

const LOTTIE = window.LOTTIE || {};
let _nLottie = 0;
function lottieEm(pai, nome, x, y, w, h, o) {
  o = o || {};
  if (!LOTTIE[nome]) throw new Error(`lottie "${nome}" não encontrado em videos/<tema>/lottie/`);
  const id = `lt${_nLottie++}`;
  pai.insertAdjacentHTML("beforeend", `<g transform="translate(${x - w / 2} ${y - h / 2})"><g class="${o.classe || "lottie"}" id="${id}"><foreignObject width="${w}" height="${h}"><div xmlns="http://www.w3.org/1999/xhtml" style="width:${w}px;height:${h}px"></div></foreignObject></g></g>`);
  const g = pai.querySelector(`#${id}`), div = g.querySelector("div");
  if (o.espelhar) g.parentNode.setAttribute("transform", `translate(${x + w / 2} ${y - h / 2}) scale(-1 1)`);
  const anim = lottie.loadAnimation({ container: div, renderer: "svg", loop: false, autoplay: false, animationData: JSON.parse(JSON.stringify(LOTTIE[nome])),
    rendererSettings: { preserveAspectRatio: o.corte ? "xMidYMid slice" : "xMidYMid meet", progressiveLoad: false } });
  const ini = o.ini ?? 0, fim = o.fim ?? T, total = Math.max(1, anim.totalFrames - 1), fr = anim.frameRate || 30;
  const q0 = o.quadroInicial ?? 0;
  aCadaQuadro((t) => {
    if (t < ini - 0.05 || t > fim + 0.05) return;
    let f = q0 + Math.max(0, t - ini) * fr * (o.vel ?? 1);
    f = o.loop === false ? Math.min(f, total) : f % total;
    anim.goToAndStop(f, true);
  });
  if (o.ini != null) { tl.set(g, { opacity: 0 }, 0); tl.set(g, { opacity: 1 }, ini); }
  if (o.fim != null && o.fim < T) tl.set(g, { opacity: 0 }, o.fim);
  return g;
}
