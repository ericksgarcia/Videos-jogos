// Monta as cenas na ordem do roteiro, com transição cruzada e aproximação lenta da câmera.
// ---------------- monta as cenas, com câmera lenta e transição cruzada ----------------
A.cenas.forEach((c, i) => {
  const wrap = document.createElementNS(NS, "g");
  const el = document.createElementNS(NS, "g");
  wrap.setAttribute("class", "cena");
  wrap.appendChild(el);
  $("#mundo").appendChild(wrap);
  // camada "frente": acima das camadas 3D (rótulos e textos que não podem ficar atrás do 3D)
  const wrapF = document.createElementNS(NS, "g"), frente = document.createElementNS(NS, "g");
  wrapF.setAttribute("class", "cena");
  wrapF.appendChild(frente);
  $("#frente").appendChild(wrapF);
  const B = (nome, frac) => (c.batidas[nome] != null ? c.batidas[nome] : c.voz + (c.fim - c.voz) * (frac || 0.5));
  CENAS[c.tipo](el, c, B, i, frente);
  const entra = i === 0 ? 0 : c.ini - 0.45;
  const ws = [wrap, wrapF];
  if (i === 0) tl.set(ws, { opacity: 1 }, 0);
  else tl.fromTo(ws, { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.inOut", immediateRender: false }, entra);
  tl.set(ws, { opacity: 0 }, i === A.cenas.length - 1 ? T : c.fim + 0.02);
  // câmera: aproximação lenta contínua (parallax geral)
  tl.fromTo(ws, { scale: 1.0, svgOrigin: "540 900" }, { scale: 1.05, svgOrigin: "540 900", duration: c.fim - entra + 0.5, ease: "none", immediateRender: false }, entra);
});
// o relógio por quadro cobre o vídeo inteiro (granulação, 3D)
tl.fromTo(_relogio, { t: 0 }, { t: T, duration: T, ease: "none", immediateRender: false }, 0);
tl.set({}, {}, T);
tl.seek(0);
