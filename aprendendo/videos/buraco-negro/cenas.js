// Cenas do vídeo "E se você caísse num buraco negro" — pontos de luz na GPU (motor/pontos-gpu.js).
// Retenção: paradoxo no gancho ("você nunca chega a cair"), promessa ("depende do tamanho"),
// imagem forte (buraco negro com disco e lente), palavra curiosa (espaguetificação) e virada.

const MD = MotionDirector;
const mixC = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];

// ---------- buraco negro: sombra, anel de fótons, disco inclinado e o disco "dobrado" pela lente ----------
const DISCO = (() => { const r = prng(51), out = []; for (let i = 0; i < 26000; i++) out.push({ r: 1.55 + Math.pow(r(), 1.6) * 2.6, a: r() * 6.283, h: (r() - 0.5) * 0.06, n: r() }); return out; })();
const LENTE = (() => { const r = prng(52), out = []; for (let i = 0; i < 12000; i++) out.push({ r: 1.06 + Math.pow(r(), 2.2) * 0.75, a: r() * 6.283, n: r() }); return out; })();
function desenharBN(nv, x, cx, cy, Rs, t, o = {}) {
  const a = o.a ?? 1, inc = o.inc ?? 0.22, giro = o.giro ?? 1, calor = o.calor ?? 1;
  haloAnel(x, cx, cy, Rs, Rs * 4, "255,140,60", 0.16 * a * calor);
  let i = nv.k;
  // disco: rotação diferencial (mais rápido perto); lado esquerdo vem na nossa direção (mais brilhante)
  for (const p of DISCO) {
    const ang = p.a + t * giro * 1.6 / Math.pow(p.r, 1.5), X = Math.cos(ang) * p.r, Z = Math.sin(ang) * p.r;
    const sx = cx + X * Rs, sy = cy + (Z * inc + p.h) * Rs;
    if (Z < 0 && Math.abs(X) < 1.05 && Math.abs(sy - cy) < Rs * 1.05) continue;            // atrás da sombra
    const quente = PT.cl(1.6 / p.r), dop = PT.cl(0.75 - 0.45 * X / p.r, 0.3, 1.2);   // efeito Doppler: o lado que vem até nós brilha mais
    const c = mixC([1.0, 0.45, 0.15], [1.0, 0.95, 0.8], quente);
    nv.ponto(i++, sx, sy, c[0], c[1], c[2], a * calor * (0.25 + 0.55 * quente) * dop, 2.8);
  }
  // imagem "dobrada" da parte de trás do disco: arcos por cima e por baixo da sombra
  for (const p of LENTE) {
    const ang = p.a, topo = Math.pow(Math.abs(Math.sin(ang)), 1.5), rr = (1.06 + (p.r - 1.06) * (0.25 + 0.75 * topo)) * Rs, sx = cx + Math.cos(ang) * rr, sy = cy + Math.sin(ang) * rr;
    c = mixC([1.0, 0.5, 0.2], [1.0, 0.92, 0.75], PT.cl(1.4 - p.r));
    nv.ponto(i++, sx, sy, c[0], c[1], c[2], a * calor * (0.12 + 0.75 * topo) * (1.5 - 0.6 * p.r) * (1 - 0.35 * Math.cos(ang)), 2.8);
  }
  nv.total(i);
  // anel de fótons e a sombra
  anelP(x, cx, cy, Rs * 1.04, "255,236,190", 0.9 * a, Math.max(2, Rs * 0.04));
  haloAnel(x, cx, cy, Rs * 0.98, Rs * 1.5, "255,200,140", 0.35 * a);
}
// brilho em anel: a sombra do centro continua escura
function haloAnel(x, cx, cy, r0, r1, cor, a) {
  if (a <= 0.004) return; const g = x.createRadialGradient(cx, cy, r0, cx, cy, r1);
  g.addColorStop(0, `rgba(${cor},${a})`); g.addColorStop(0.3, `rgba(${cor},${a * 0.35})`); g.addColorStop(1, `rgba(${cor},0)`);
  x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r1, 0, 6.283); x.moveTo(cx + r0, cy); x.arc(cx, cy, r0, 0, 6.283); x.fill("evenodd");
}
// ---------- astronauta de pontos (estica em y e afina em x com "s") ----------
const ASTRO = (() => { const r = prng(61), out = []; const add = (n, f) => { for (let k = 0; k < n; k++) { const [px, py, cor] = f(r); out.push({ x: px, y: py, cor }); } };
  add(500, (r) => { const a = r() * 6.283, d = Math.sqrt(r()) * 16; return [Math.cos(a) * d, -52 + Math.sin(a) * d, 0]; });                       // capacete
  add(160, (r) => { const a = r() * 6.283, d = Math.sqrt(r()) * 9; return [3 + Math.cos(a) * d, -52 + Math.sin(a) * d * 0.7, 1]; });              // viseira
  add(700, (r) => [(r() - 0.5) * 34, -34 + r() * 48, 0]);                                                                                          // tronco
  add(500, (r) => { const s = r() < 0.5 ? -1 : 1, u = r(); return [s * (18 + u * 26), -28 + u * 22 + (r() - 0.5) * 6, 0]; });                    // braços
  add(600, (r) => { const s = r() < 0.5 ? -1 : 1, u = r(); return [s * (7 + u * 6) + (r() - 0.5) * 8, 14 + u * 44, 0]; });                        // pernas
  return out; })();
function astronautaP(nv, cx, cy, esc, s, a, cor, ang = 0) {
  let i = nv.k; const c = Math.cos(ang), sn = Math.sin(ang), cr = cor || [0.92, 0.95, 1.0];
  for (const p of ASTRO) { const px = p.x / Math.sqrt(s), py = p.y * s, X = px * c - py * sn, Y = px * sn + py * c; const k = p.cor ? [1.0, 0.82, 0.35] : cr; nv.ponto(i++, cx + X * esc, cy + Y * esc, k[0], k[1], k[2], a * Math.min(1, 0.95 + 0.06 * s), 2.6 + 0.25 * Math.min(s, 6)); }
  nv.total(i);
}
function estrelasP(x, lista, t, a = 1, som) { lista.forEach((s) => (som && Math.hypot(s.x - som[0], s.y - som[1]) < som[2]) ? 0 : pontoP(x, s.x, s.y, 1 + 2 * s.z, "220,230,255", a * (0.15 + 0.5 * s.z) * (0.6 + 0.4 * Math.sin(t * 2 + s.f)))); }

// =============== 1. gancho: você nunca chega a cair ===============
CENAS.abertura = (el, c, B) => {
  const q = tempoPalavras(c), tC = B("cai"), tN = B("nunca"), tE = B("estranha"), tF = B("final"), tT = B("tamanho");
  mostrarGancho(tC + 1.2);
  const T = telaGPU(el, c, { fundo: [0.012, 0.02, 0.07] });
  const tx = palcoTexto(el, [["fora", 330, 70, "de fora: você nunca cai", "pt-ci", "white-space:normal;left:60px;width:960px"], ["tam", 330, 80, "depende do tamanho", "pt-am"]]);
  MD.slam(tl, tx.fora, tN - 0.1, { from: 1.25 }); MD.leave(tl, tx.fora, tT - 0.4); MD.slam(tl, tx.tam, tT - 0.1, { from: 1.3 });
  const nv = T.nuvem(46000), est = ambienteP(400, 3);
  T.quadro((x, t) => {
    estrelasP(x, est, t, 1, t < tT ? [540, 980, 200] : null);
    const vB = 1 - PT.ss((t - tT + 0.4) / 0.6), vD = PT.ss((t - tT + 0.4) / 0.6);
    if (vB > 0.01) {
      desenharBN(nv, x, 540, 980, 200, t, { a: vB });
      // o astronauta cai, desacelera perto da borda, fica vermelho e apagado
      const u = 1 - Math.exp(-Math.max(0, t - 0.5) * 0.45), ax = PT.lerp(880, 640, u), ay = PT.lerp(600, 790, u), verm = PT.ss((t - tN) / 4);
      astronautaP(nv, ax, ay, 1.1 * (1 - 0.3 * u), 1, vB * (1 - 0.7 * verm), mixC([0.92, 0.95, 1.0], [1.0, 0.25, 0.2], verm), t * 0.5);
    }
    if (vD > 0.01) {
      desenharBN(nv, x, 300, 1000, 70, t, { a: vD }); rotuloP(x, "PEQUENO", 300, 1130, 30, "255,226,140", vD);
      desenharBN(nv, x, 760, 1000, 230, t, { a: vD }); rotuloP(x, "GIGANTE", 760, 1290, 30, "255,226,140", vD);
    }
  });
};

// =============== 2. o que é: a estrela desaba ===============
CENAS.oque = (el, c, B) => {
  const q = tempoPalavras(c), tE = B("estrela"), tD = B("desaba"), tEs = B("espreme"), tC = B("cidade"), tS = B("escapa"), tL = B("luz");
  const T = telaGPU(el, c, { fundo: [0.012, 0.02, 0.07] });
  const tx = palcoTexto(el, [["est", 330, 76, "estrela gigante", "pt-ci"], ["dez", 330, 86, "10 Sóis", "pt-am"], ["cid", 440, 52, "do tamanho de uma cidade", "pt-fino"], ["luz", 330, 120, "nem a luz", "pt-ve"]]);
  MD.arrive(tl, tx.est, tE - 0.1, { y: 14 }); MD.leave(tl, tx.est, tD + 0.3); MD.slam(tl, tx.dez, tEs - 0.1, { from: 1.3 }); MD.arrive(tl, tx.cid, tC - 0.1, { y: 14 }); MD.leave(tl, [tx.dez, tx.cid], tS - 0.3);
  MD.slam(tl, tx.luz, tL - 0.1, { from: 1.4 });
  const nv = T.nuvem(50000), est = ambienteP(400, 7), r = prng(5);
  const ESF = Array.from({ length: 18000 }, () => { const z = r() * 2 - 1, a = r() * 6.283, s = Math.sqrt(1 - z * z); return { v: [s * Math.cos(a), z, s * Math.sin(a)], n: r() }; });
  const sois = Array.from({ length: 10 }, (_, k) => ({ a: k / 10 * 6.283, d: 300 + 80 * r() }));
  T.quadro((x, t) => {
    estrelasP(x, est, t);
    const cx = 540, cy = 930, col = PT.inExp((t - tD + 0.2) / 0.7);
    // a estrela gigante (pulsando) desaba e explode
    if (t < tD + 1) {
      let i = nv.k; const R = 330 * (1 - col) * (1 + 0.02 * Math.sin(t * 3));
      for (const p of ESF) { if (p.v[2] < 0) continue; const b = 0.5 + 0.5 * p.v[2]; nv.ponto(i++, cx + p.v[0] * R, cy - p.v[1] * R, 0.7 + 0.3 * b, 0.82 + 0.15 * b, 1.0, (1 - col) * (0.25 + 0.55 * b), 3); }
      nv.total(i);
      brilhoP(x, cx, cy, R * 1.6 + 10, "150,190,255", 0.35 * (1 - col));
    }
    if (t > tD + 0.45) { const u = t - tD - 0.45; brilhoP(x, cx, cy, 900, "220,230,255", Math.exp(-u * 3)); anelP(x, cx, cy, 30 + u * 900, "200,220,255", 0.7 * Math.exp(-u), 6); }
    const vB = PT.ss((t - tD - 0.6) / 0.8);
    if (vB > 0.01) desenharBN(nv, x, cx, cy, PT.lerp(110, 160, PT.ss((t - tEs) / 1)), t, { a: vB });
    // dez Sóis espremidos numa bola do tamanho de uma cidade
    const aS = PT.jan(t, tEs - 0.3, tS - 0.3, 0.3, 0.5);
    if (aS > 0) sois.forEach((s) => { const k = PT.inOut((t - tEs) / 1.6), d = s.d * (1 - k) + 160 * k; const px = cx + Math.cos(s.a + t * 0.3) * d, py = cy + Math.sin(s.a + t * 0.3) * d; discoP(x, px, py, 22 * (1 - k * 0.7), "255,210,120", aS * (1 - k * 0.6)); brilhoP(x, px, py, 50, "255,180,90", 0.4 * aS * (1 - k * 0.6)); });
    const aC = PT.jan(t, tC - 0.3, tS - 0.3, 0.4, 0.5);
    if (aC > 0) { const rr = prng(3); for (let k = 0; k < 500; k++) { const ang = rr() * 6.283, d = 200 + rr() * 140; pontoP(x, cx + Math.cos(ang) * d, cy + 260 + Math.sin(ang) * d * 0.2, 3, "255,210,120", aC * (0.4 + 0.5 * rr())); } }
    // a luz tenta escapar e volta
    const aL = PT.ss((t - tS + 0.3) / 0.5);
    if (aL > 0) for (let k = 0; k < 14; k++) { const b = k / 14 * 6.283, u = ((t - tS) * 0.6 + k * 0.07) % 1, dd = 175 + Math.sin(u * Math.PI) * 170; pontoP(x, cx + Math.cos(b) * dd, cy + Math.sin(b) * dd, 6, "255,255,220", aL * (1 - u * 0.5)); }
  });
};

// =============== 3. a borda: horizonte de eventos, disco quente, a foto ===============
CENAS.borda = (el, c, B) => {
  const q = tempoPalavras(c), tH = B("horizonte"), tSv = B("semvolta"), tL = B("luz"), tG = B("gira"), tM = B("milhoes"), tF = B("foto");
  const T = telaGPU(el, c, { fundo: [0.012, 0.02, 0.07] });
  const tx = palcoTexto(el, [["hor", 330, 70, "horizonte de eventos", "pt-am"], ["sem", 430, 56, "a linha sem volta", "pt-fino"], ["mil", 330, 100, "milhões de graus", "pt-la"], ["foto", 330, 92, "1ª foto: 2019", "pt-ci"]]);
  MD.slam(tl, tx.hor, tH - 0.1, { from: 1.3 }); MD.arrive(tl, tx.sem, tSv - 0.1, { y: 14 }); MD.leave(tl, [tx.hor, tx.sem], tG - 0.4);
  MD.slam(tl, tx.mil, tM - 0.1, { from: 1.3 }); MD.leave(tl, tx.mil, tF - 0.4); MD.slam(tl, tx.foto, tF - 0.05, { from: 1.3 });
  const nv = T.nuvem(46000), est = ambienteP(400, 11);
  T.quadro((x, t) => {
    estrelasP(x, est, t, 1, [540, 960, 230]);
    const vF = PT.ss((t - tF + 0.1) / 0.6), vB = 1 - vF, giro = 1 + 2 * PT.ss((t - tG) / 1.5), calor = 0.6 + 0.6 * PT.ss((t - tM) / 1);
    if (vB > 0.01) {
      desenharBN(nv, x, 540, 960, 230, t, { a: vB, giro, calor });
      const aH = PT.jan(t, tH - 0.2, tG, 0.4, 0.6) * vB;
      if (aH > 0) { x.setLineDash([12, 12]); anelP(x, 540, 960, 236, "255,210,63", aH, 4); x.setLineDash([]); }
      // setas saindo que não conseguem passar da linha
      const aS = PT.jan(t, tSv - 0.2, tG, 0.4, 0.6) * vB;
      if (aS > 0) for (let k = 0; k < 8; k++) { const b = k / 8 * 6.283 + 0.3, u = ((t - tSv) * 0.7 + k * 0.13) % 1, d = 150 + Math.sin(u * Math.PI) * 80; pontoP(x, 540 + Math.cos(b) * d, 960 + Math.sin(b) * d, 7, "255,255,220", aS); }
    }
    // a "foto": anel borrado laranja (como a imagem real do M87*)
    if (vF > 0.01) { const flash = Math.exp(-(t - tF) * 6); brilhoP(x, 540, 960, 900, "255,255,255", 0.6 * flash * vF); for (let k = 0; k < 6; k++) anelP(x, 540, 960, 200 + k * 8, "255,140,50", 0.35 * vF * (1 - k / 6), 22); x.strokeStyle = `rgba(255,200,120,${0.5 * vF})`; x.lineWidth = 30; x.beginPath(); x.arc(540, 960, 205, Math.PI * 0.5, Math.PI * 1.25); x.stroke(); rotuloP(x, "M87*", 540, 1250, 34, "255,200,140", vF); }
  });
};

// =============== 4. virar espaguete ===============
CENAS.espaguete = (el, c, B) => {
  const q = tempoPalavras(c), tQ = B("queda"), tP = B("pes"), tC = B("cabeca"), tE = B("estica"), tM = B("macarrao"), tEs = B("espaguete");
  const T = telaGPU(el, c, { fundo: [0.012, 0.02, 0.07] });
  const tx = palcoTexto(el, [["esp", 330, 74, "espaguetificação", "pt-am"]]);
  MD.slam(tl, tx.esp, tEs - 0.1, { from: 1.4 });
  const nv = T.nuvem(40000), est = ambienteP(400, 13);
  T.quadro((x, t) => {
    estrelasP(x, est, t, 1, [540, 1300, 120]);
    desenharBN(nv, x, 540, 1300, 120, t, { inc: 0.18 });
    // o astronauta cai em direção ao buraco negro (pés para baixo) e estica
    const s = 1 + 1.2 * PT.ss((t - tE) / 2.4) + 1.6 * PT.ss((t - tM) / 2.5), y = PT.lerp(620, 760, PT.ss((t - tQ) / 6)) + 280 * PT.ss((t - tM) / 3);
    const a = 1 - PT.ss((t - tEs - 0.6) / 1.2);
    astronautaP(nv, 540 + Math.sin(t * 0.7) * 6, y, 2.0, s, a);
    // setas da gravidade: nos pés (grande) e na cabeça (pequena)
    const aP = PT.jan(t, tP - 0.2, tE + 1, 0.4, 0.6), aC = PT.jan(t, tC - 0.2, tE + 1, 0.4, 0.6);
    if (aP > 0) { linhaP(x, 640, y + 80, 640, y + 300, "239,71,111", aP, 8); linhaP(x, 625, y + 280, 640, y + 300, "239,71,111", aP, 8); linhaP(x, 655, y + 280, 640, y + 300, "239,71,111", aP, 8); rotuloP(x, "PÉS: MUITO FORTE", 680, y + 200, 28, "255,140,150", aP, "left"); }
    if (aC > 0) { linhaP(x, 440, y - 130, 440, y - 70, "255,210,63", aC, 6); rotuloP(x, "CABEÇA: MAIS FRACO", 410, y - 150, 28, "255,226,140", aC, "right"); }
  });
};

// =============== 5. o que o seu amigo vê ===============
CENAS.amigo = (el, c, B) => {
  const q = tempoPalavras(c), tA = B("amigo"), tL = B("lento"), tV = B("vermelho"), tS = B("sumir"), tT = B("tempo"), tD = B("devagar");
  const T = telaGPU(el, c, { fundo: [0.012, 0.02, 0.07] });
  const tx = palcoTexto(el, [["nunca", 330, 70, "pra ele, você nunca atravessa", "pt-ci", "white-space:normal;left:60px;width:960px"], ["temp", 330, 86, "o tempo passa devagar", "pt-am", "white-space:normal;left:60px;width:960px"]]);
  MD.slam(tl, tx.nunca, tS - 0.1, { from: 1.25 }); MD.leave(tl, tx.nunca, tT - 0.4); MD.slam(tl, tx.temp, tT - 0.1, { from: 1.3 });
  const nv = T.nuvem(46000), est = ambienteP(400, 17);
  T.quadro((x, t) => {
    estrelasP(x, est, t, 1, [760, 980, 170]);
    desenharBN(nv, x, 760, 980, 170, t);
    // o amigo, longe e seguro, à esquerda
    astronautaP(nv, 180, 1120, 1.5, 1, 1, [0.6, 1.0, 0.75]);
    rotuloP(x, "SEU AMIGO", 180, 1230, 28, "150,255,190", PT.ss((t - tA) / 0.5));
    // você, perto da borda: cada vez mais lento, mais vermelho, mais apagado
    const u = 1 - Math.exp(-Math.max(0, t - c.ini) * 0.35), px = PT.lerp(520, 600, u), py = PT.lerp(760, 905, u);
    const verm = PT.ss((t - tV + 0.3) / 2), some = PT.ss((t - tS + 0.6) / 1.2);
    astronautaP(nv, px, py, 1.1 * (1 - 0.3 * u), 1, (1 - 0.85 * some) * (1 - 0.3 * verm), mixC([0.92, 0.95, 1.0], [1.0, 0.2, 0.15], verm), 0.4);
    // relógios: o seu (quase parando) e o do amigo (normal)
    const aR = PT.ss((t - tT + 0.3) / 0.5);
    if (aR > 0) [[180, 900, t * 2.5, "150,255,190"], [px, py - 120, (1 - u) * t * 2.5 + u * 6, "255,140,120"]].forEach(([rx, ry, ang, cor]) => { for (let k = 0; k < 30; k++) { const b = k / 30 * 6.283; pontoP(x, rx + Math.cos(b) * 40, ry + Math.sin(b) * 40, 2.6, cor, aR); } linhaP(x, rx, ry, rx + Math.cos(ang - Math.PI / 2) * 34, ry + Math.sin(ang - Math.PI / 2) * 34, cor, aR, 4); });
  });
};

// =============== 6. a surpresa: no gigante, você nem sente ===============
CENAS.gigante = (el, c, B) => {
  const q = tempoPalavras(c), tS = B("surpresa"), tG = B("gigante"), tGa = B("galaxia"), tI = B("igual"), tN = B("nada"), tSa = B("sair");
  const T = telaGPU(el, c, { fundo: [0.012, 0.02, 0.07] });
  const tx = palcoTexto(el, [["sgr", 330, 64, "4 milhões de Sóis", "pt-am"], ["sgr2", 420, 44, "o do centro da Via Láctea", "pt-fino"], ["nada", 330, 96, "sem sentir nada", "pt-ci"], ["sair", 440, 76, "e sem volta", "pt-ve"]]);
  MD.slam(tl, tx.sgr, tGa - 0.1, { from: 1.3 }); MD.arrive(tl, tx.sgr2, tGa + 0.3, { y: 14 }); MD.leave(tl, [tx.sgr, tx.sgr2], tI - 0.4);
  MD.slam(tl, tx.nada, tN - 0.1, { from: 1.3 }); MD.slam(tl, tx.sair, tSa - 0.1, { from: 1.3 });
  const nv = T.nuvem(46000), est = ambienteP(500, 19);
  T.quadro((x, t) => {
    estrelasP(x, est, t, 1, [540, 2900, 1650]);
    // borda gigante: só um pedaço do horizonte aparece (arco enorme embaixo)
    const cx = 540, cy = 2900, Rs = 1650, a = PT.ss((t - tG + 0.5) / 0.8);
    desenharBN(nv, x, cx, cy, Rs, t * 0.2, { a: 0.6 * a + 0.2, inc: 0.12, calor: 0.6 });
    anelP(x, cx, cy, Rs * 1.004, "255,236,190", 0.9, 4);
    // o astronauta (inteiro, sem esticar) atravessa a linha
    const u = PT.inOut((t - tI) / (tN - tI + 1.4)), py = PT.lerp(880, 1330, u);
    astronautaP(nv, 540, py, 1.6, 1, 1 - 0.85 * PT.ss((t - tN - 0.8) / 1.5), [0.92, 0.95, 1.0], 0.15);
    const aI = PT.jan(t, tI - 0.3, tN, 0.4, 0.5);
    if (aI > 0) { [[640, py + 40], [640, py - 60]].forEach(([ax, ay]) => { linhaP(x, ax, ay, ax, ay + 70, "255,210,63", aI, 6); }); rotuloP(x, "PÉS = CABEÇA", 680, py, 28, "255,226,140", aI, "left"); }
  });
};

// =============== 7. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const tP = [B("passo1"), B("passo2"), B("passo3"), B("passo4")], tC = B("cta");
  const T = telaGPU(el, c, { fundo: [0.012, 0.02, 0.07] });
  const Y = [480, 660, 840, 1020], textos = ["massa demais, espaço de menos", "no pequeno: espaguete", "no gigante: atravessa sem sentir", "e de fora, ninguém te vê cair"];
  const tx = palcoTexto(el, textos.map((s, k) => [`p${k}`, Y[k] - 32, 52, s, "", "left:230px;width:800px;text-align:left;white-space:normal"]));
  textos.forEach((_, k) => MD.arrive(tl, tx[`p${k}`], tP[k] - 0.15, { y: 18 }));
  MD.leave(tl, textos.map((_, k) => tx[`p${k}`]), tC + 0.45);
  const nv = T.nuvem(40000), est = ambienteP(300, 23);
  T.quadro((x, t) => {
    estrelasP(x, est, t, 1, [540, 1350, 150]);
    const sai = 1 - PT.ss((t - tC - 0.45) / 0.5);
    desenharBN(nv, x, 540, 1350, 150, t, { a: 0.5 * sai });
    tP.forEach((tp, k) => { const a = PT.ss((t - tp + 0.2) / 0.4) * sai; if (a > 0) { discoP(x, 160, Y[k], 14, ["255,210,63", "255,138,61", "143,227,255", "239,71,111"][k], a); brilhoP(x, 160, Y[k], 50, "255,200,140", 0.4 * a); } });
  });
  cartaoFinal(el, tC + 0.9);
};
