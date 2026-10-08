// EXPERIMENTO de estilo "sem desenhos": a abertura do vídeo da eletricidade só com
// tipografia animada (MotionDirector, motor/motion-director.js) + luz e partículas abstratas
// num canvas (núcleo de luz, explosão, mergulho para longe, rotor de luz).
// Blueprint seguido: "kinetic-type-beats / Hook escalation" (.claude/skills/hyperframes-animation).
// Tudo é função do tempo do vídeo: determinístico.

document.head.insertAdjacentHTML("beforeend", `<style>
  .tp-palco { position: relative; width: 1080px; height: 1920px; font-family: "Nunito", sans-serif; }
  .tp-l { position: absolute; left: 0; width: 1080px; text-align: center; font-weight: 900; color: #f8f9ff;
          line-height: 1; letter-spacing: -0.02em; text-transform: uppercase; white-space: nowrap;
          text-shadow: 0 10px 40px rgba(0,0,0,0.55); transform-origin: 50% 50%; }
  .tp-l .md-word, .tp-l .md-word-in, .tp-l .md-key { display: inline-block; }
  .tp-fino { font-weight: 600; letter-spacing: 0.18em; color: rgba(248,249,255,0.82); }
  .tp-am { color: #ffd23f; text-shadow: 0 0 40px rgba(255,190,60,0.85), 0 0 120px rgba(255,150,40,0.6); }
  .tp-ci { color: #8fe3ff; text-shadow: 0 0 36px rgba(110,210,255,0.8), 0 0 110px rgba(76,201,240,0.55); }
</style>`);

const _lerp = (a, b, k) => a + (b - a) * k;
const _cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const _ss = (x) => { x = _cl(x); return x * x * (3 - 2 * x); };
const _out = (x) => 1 - Math.pow(1 - _cl(x), 3);

CENAS.interruptor = (el, c, B) => {
  mostrarGancho(B("afasta") - 0.2);
  // instante (s) em que cada palavra é dita, a partir das legendas da cena
  const pal = c.legendas.flatMap((b) => b.palavras);
  const norm = (s) => s.toLowerCase().replace(/[^\wà-ÿ]/g, "");
  const quando = (w) => { const p = pal.find((x) => norm(x[0]) === norm(w)); return p ? p[1] : c.voz; };
  const tempos = (ws) => ws.map((w) => quando(w) - quando(ws[0]));

  const L = (id, y, tam, txt, cls = "") => `<div class="tp-l ${cls}" id="${id}" style="top:${y}px;font-size:${tam}px">${txt}</div>`;
  el.innerHTML = `<rect width="${W}" height="${H}" fill="#070d26"/>
    <foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml"><canvas class="tp-cv" width="${W}" height="${H}"></canvas></div></foreignObject>
    <foreignObject width="${W}" height="${H}"><div xmlns="http://www.w3.org/1999/xhtml" class="tp-palco">
      ${L("l1", 800, 132, "Você aperta")}
      ${L("l2a", 690, 64, "e a luz", "tp-fino")}
      ${L("l2b", 790, 230, "acende", "tp-am")}
      ${L("l3", 860, 104, "Simples assim.")}
      ${L("l4a", 740, 170, "Mas,")}
      ${L("l4b", 950, 70, "pra isso acontecer", "tp-fino")}
      ${L("l4c", 840, 96, "alguma coisa")}
      ${L("l5a", 700, 64, "muito", "tp-fino")}
      ${L("l5b", 800, 210, "longe")}
      ${L("l5c", 1110, 40, "pode ser mais de", "tp-fino")}
      ${L("l5d", 1166, 96, "0 km", "tp-ci")}
      ${L("l6", 860, 190, "girar", "tp-ci")}
      ${L("l7a", 720, 64, "vou te explicar", "tp-fino")}
      ${L("l7b", 820, 200, "como?")}
      ${L("l8a", 720, 72, "do jeito mais", "tp-fino")}
      ${L("l8b", 820, 250, "fácil", "tp-am")}
    </div></foreignObject>`;
  const q = (id) => el.querySelector("#" + id);
  const MD = MotionDirector;
  const tVou = quando("Vou");
  const tC = B("clique"), tL = B("luz"), tS = B("simples"), tM = B("mas"), tA = B("afasta"), tG = B("gira"), tCo = B("como"), tF = B("titulo");

  // ---------- tipografia ----------
  MD.buildSentence(tl, q("l1"), quando("Você"), { times: tempos(["Você", "aperta"]), highlight: "none" });
  tl.fromTo(q("l1"), { y: 0, scale: 1 }, { y: 14, scale: 0.95, duration: 0.07, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, tC); // o "clique"
  MD.exitSentence(tl, q("l1"), quando("e") - 0.12);
  MD.buildSentence(tl, q("l2a"), quando("e"), { times: tempos(["e", "a", "luz"]), highlight: "none", duration: 0.45 });
  MD.slam(tl, q("l2b"), tL, { from: 1.7, duration: 0.6 });
  tl.fromTo(q("l2b"), { filter: "brightness(2.2)" }, { filter: "brightness(1)", duration: 0.8, ease: "power2.out" }, tL);
  MD.leave(tl, [q("l2a"), q("l2b")], tS - 0.18, { y: -40 });
  MD.buildSentence(tl, q("l3"), tS, { times: tempos(["Simples", "assim."]), highlight: "none", blur: 16 });
  MD.leave(tl, q("l3"), tM - 0.2);
  MD.slam(tl, q("l4a"), tM, { from: 1.25, duration: 0.4 });
  MD.buildSentence(tl, q("l4b"), quando("pra"), { times: tempos(["pra", "isso", "acontecer,"]), highlight: "none", duration: 0.5 });
  MD.leave(tl, [q("l4a"), q("l4b")], quando("alguma") - 0.1, { y: -50, blur: 18 });
  MD.buildSentence(tl, q("l4c"), quando("alguma"), { times: tempos(["alguma", "coisa"]), highlight: "none", blur: 14 });
  MD.leave(tl, q("l4c"), quando("muito") - 0.15, { y: -30 });
  MD.arrive(tl, q("l5a"), quando("muito") - 0.05, { y: 20, duration: 0.4 });
  MD.slam(tl, q("l5b"), tA, { from: 1.35, duration: 0.3 });
  // "longe": a palavra se afasta (encolhe, abre as letras, perde o foco)
  tl.to(q("l5b"), { scale: 0.34, letterSpacing: "0.55em", opacity: 0, filter: "blur(6px)", duration: 1.5, ease: "power2.in" }, tA + 0.3);
  MD.leave(tl, q("l5a"), tA + 0.35, { y: -20 });
  MD.arrive(tl, q("l5c"), tA + 0.35, { y: 16, duration: 0.5 });
  MD.arrive(tl, q("l5d"), tA + 0.4, { y: 20, duration: 0.5 });
  // contador de distância (calculado pelo relógio por quadro: certo em qualquer instante)
  const kmEl = q("l5d");
  aCadaQuadro((t) => { const k = 1 - Math.pow(2, -10 * _cl((t - tA - 0.4) / 1.2)); kmEl.textContent = `${(Math.round(1000 * k / 10) * 10).toLocaleString("pt-BR")} km`; });
  MD.leave(tl, [q("l5c"), q("l5d")], tG - 0.2, { y: -24 });
  // "girar": entra girando, com desfoque de movimento
  tl.fromTo(q("l6"), { opacity: 0, rotation: -40, scale: 1.4, filter: "blur(18px)" }, { opacity: 1, rotation: 0, scale: 1, filter: "blur(0px)", duration: 0.55, ease: "expo.out" }, tG);
  MD.leave(tl, q("l6"), quando("Vou") - 0.15);
  MD.buildSentence(tl, q("l7a"), quando("Vou"), { times: tempos(["Vou", "te", "explicar"]), highlight: "none", duration: 0.45 });
  MD.slam(tl, q("l7b"), tCo, { from: 1.3, duration: 0.45 });
  MD.leave(tl, [q("l7a"), q("l7b")], quando("do") - 0.12, { y: -40 });
  MD.buildSentence(tl, q("l8a"), quando("do"), { times: tempos(["do", "jeito", "mais"]), highlight: "none", duration: 0.45 });
  MD.slam(tl, q("l8b"), tF, { from: 1.8, duration: 0.6 });
  tl.fromTo(q("l8b"), { filter: "brightness(2.4)" }, { filter: "brightness(1)", duration: 0.9, ease: "power2.out" }, tF);

  // ---------- luz e partículas (canvas) ----------
  const cv = el.querySelector(".tp-cv"), x = cv.getContext("2d");
  const CX = 540, CY = 930;
  const r = prng(17);
  const motes = Array.from({ length: 150 }, () => ({ a: r() * 6.283, d: 120 + r() * 1100, z: 0.25 + r() * 0.75, f: r() * 6.283, v: 0.2 + r() }));
  const burst = Array.from({ length: 90 }, () => ({ a: r() * 6.283, s: 300 + r() * 900, z: 0.4 + r() * 0.6, cor: r() < 0.7 ? "255,214,110" : "255,255,240" }));
  const glow = (px, py, rad, cor, a) => {
    if (a <= 0.002 || rad <= 0) return;
    const g = x.createRadialGradient(px, py, 0, px, py, rad);
    g.addColorStop(0, `rgba(${cor},${a})`); g.addColorStop(0.25, `rgba(${cor},${a * 0.45})`); g.addColorStop(1, `rgba(${cor},0)`);
    x.fillStyle = g; x.fillRect(px - rad, py - rad, rad * 2, rad * 2);
  };
  // mergulho para longe: 0 -> 1 durante "longe"
  const dolly = (t) => _ss((t - tA) / 1.5);
  // rotor: ângulo acumulado (acelera em "girar", desacelera depois); integrado analiticamente
  const giro = (t) => {
    if (t < tG) return 0;
    const u = t - tG, sobe = Math.min(u, 0.8);
    let ang = 9 * (sobe * sobe) / (2 * 0.8);           // aceleração até 9 rad/s
    if (u > 0.8) { const k = u - 0.8; ang += 2.6 * k + (9 - 2.6) * 0.9 * (1 - Math.exp(-k / 0.9)); } // assenta em 2,6 rad/s
    return ang;
  };

  aCadaQuadro((t) => {
    if (t < c.ini - 0.1 || t > c.fim + 0.6) return;
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.globalCompositeOperation = "source-over";
    x.fillStyle = "#070d26"; x.fillRect(0, 0, W, H);
    x.globalCompositeOperation = "lighter";
    const aceso = _ss((t - tL) / 0.3), dz = dolly(t);
    const calor = aceso * (1 - 0.65 * _ss((t - tM) / 1.2)) * (1 - dz * 0.6); // a luz quente esfria quando o assunto muda
    // fundo: nuvem quente da luz + respiro azul
    glow(CX, CY, 1300, "255,150,60", 0.22 * calor);
    glow(CX, CY + 400, 1500, "60,90,200", 0.18 + 0.1 * Math.sin(t * 0.7));
    // poeira de luz em profundidade (no mergulho, tudo corre para o centro, com rastro)
    motes.forEach((m) => {
      const fz = 1 / (1 + dz * 7 * m.z), fz0 = 1 / (1 + dolly(t - 0.06) * 7 * m.z);
      const ang = m.a + t * 0.02 * m.v, d = m.d * (1 + 0.04 * Math.sin(t * 0.5 + m.f));
      const px = CX + Math.cos(ang) * d * fz, py = CY + Math.sin(ang) * d * fz * 1.3;
      const qx = CX + Math.cos(ang) * d * fz0, qy = CY + Math.sin(ang) * d * fz0 * 1.3;
      const cor = calor > 0.3 && m.z > 0.6 ? "255,220,150" : "170,210,255";
      const a = (0.12 + 0.5 * m.z) * (0.6 + 0.4 * Math.sin(t * (1 + m.v) + m.f));
      if (Math.hypot(px - qx, py - qy) > 2) {
        x.strokeStyle = `rgba(${cor},${a})`; x.lineWidth = 1 + 2.2 * m.z; x.lineCap = "round";
        x.beginPath(); x.moveTo(qx, qy); x.lineTo(px, py); x.stroke();
      } else {
        x.fillStyle = `rgba(${cor},${a})`; x.beginPath(); x.arc(px, py, 0.8 + 2.6 * m.z, 0, 6.283); x.fill();
      }
      if (m.z > 0.85) glow(px, py, 26 * m.z, cor, a * 0.25);
    });
    // núcleo: faísca no clique, explode em "acende", vira um ponto distante em "longe"
    const recua = 1 / (1 + dz * 9);
    if (t >= tC) {
      const u = t - tC;
      const anel = _out(u / 0.7);
      if (u < 0.7) { x.strokeStyle = `rgba(255,236,190,${0.5 * (1 - anel)})`; x.lineWidth = 3; x.beginPath(); x.arc(CX, CY, 20 + anel * 260, 0, 6.283); x.stroke(); }
      const pisca = t < tL ? 0.55 + 0.25 * Math.sin(t * 40) : 1;
      glow(CX, CY, (40 + 380 * aceso) * recua + 10, "255,240,200", (0.5 * pisca + 0.5 * aceso) * (1 - 0.3 * _ss((t - tM) / 1.2)) * (t < tL + 0.6 ? 1 : 0.75));
      const assenta = 1 - 0.6 * _ss((t - tL - 0.6) / 0.6);
      glow(CX, CY, (14 + 120 * aceso * assenta) * recua + 4, "255,255,245", 0.9 * (t < tL ? 1 : assenta));
    }
    if (t >= tL) {
      const u = t - tL;
      // onda de choque e raios
      if (u < 1) { const k = _out(u); x.strokeStyle = `rgba(255,210,120,${0.6 * (1 - k)})`; x.lineWidth = 6 * (1 - k) + 1; x.beginPath(); x.arc(CX, CY, 60 + k * 900, 0, 6.283); x.stroke(); }
      const raios = calor * recua;
      if (raios > 0.02) {
        x.save(); x.translate(CX, CY); x.rotate(t * 0.12);
        for (let k = 0; k < 14; k++) {
          const a = (k / 14) * 6.283, L = (700 + 260 * Math.sin(k * 2.1 + t * 0.8)) * (0.4 + 0.6 * _out(u / 0.5)) * recua;
          const g = x.createLinearGradient(0, 0, Math.cos(a) * L, Math.sin(a) * L);
          g.addColorStop(0, `rgba(255,220,140,${0.16 * raios})`); g.addColorStop(1, "rgba(255,220,140,0)");
          x.fillStyle = g; x.beginPath(); x.moveTo(0, 0);
          x.lineTo(Math.cos(a - 0.05) * L, Math.sin(a - 0.05) * L); x.lineTo(Math.cos(a + 0.05) * L, Math.sin(a + 0.05) * L); x.closePath(); x.fill();
        }
        x.restore();
      }
      // explosão de partículas (desaceleram e somem)
      if (u < 2.4) burst.forEach((b) => {
        const k = 1 - Math.exp(-u * 2.2 * b.z), px = CX + Math.cos(b.a) * b.s * k, py = CY + Math.sin(b.a) * b.s * k;
        const k0 = 1 - Math.exp(-Math.max(0, u - 0.04) * 2.2 * b.z), qx = CX + Math.cos(b.a) * b.s * k0, qy = CY + Math.sin(b.a) * b.s * k0;
        const a = Math.max(0, 1 - u / 2.4) * b.z;
        x.strokeStyle = `rgba(${b.cor},${a})`; x.lineWidth = 1.5 + 2.5 * b.z; x.lineCap = "round";
        x.beginPath(); x.moveTo(qx, qy); x.lineTo(px, py); x.stroke();
      });
    }
    // rotor de luz em "girar": três cometas em órbita + anel com a palavra girando
    if (t >= tG - 0.05 && t < tF + 0.6) {
      const vou = _ss((t - tVou + 0.1) / 0.5);  // abre espaço para o texto de cima
      const ap = _out((t - tG) / 0.6) * (1 - _ss((t - tF) / 0.45)) * (1 - 0.45 * vou), R = 330 * _out((t - tG) / 0.6) * (1 - 0.3 * vou) * (1 - _ss((t - tF) / 0.45)), ang = giro(t);
      glow(CX, CY, 520 * ap, "76,201,240", 0.22 * ap);
      x.strokeStyle = `rgba(143,227,255,${0.25 * ap})`; x.lineWidth = 2; x.beginPath(); x.arc(CX, CY, R, 0, 6.283); x.stroke();
      x.setLineDash([4, 18]); x.strokeStyle = `rgba(143,227,255,${0.35 * ap})`; x.beginPath(); x.arc(CX, CY, R * 0.72, 0, 6.283); x.stroke(); x.setLineDash([]);
      for (let k = 0; k < 3; k++) {
        const a0 = ang + (k / 3) * 6.283;
        for (let s = 0; s < 40; s++) {           // rastro do cometa
          const a = a0 - s * 0.035, al = (1 - s / 40) * ap;
          x.fillStyle = `rgba(${s < 3 ? "255,255,255" : "143,227,255"},${al * 0.8})`;
          x.beginPath(); x.arc(CX + Math.cos(a) * R, CY + Math.sin(a) * R, 7 * (1 - s / 48), 0, 6.283); x.fill();
        }
        glow(CX + Math.cos(a0) * R, CY + Math.sin(a0) * R, 60, "143,227,255", 0.6 * ap);
      }
      // texto em círculo, girando com o rotor
      x.globalCompositeOperation = "source-over";
      x.font = "900 40px Nunito"; x.textAlign = "center"; x.textBaseline = "middle";
      const frase = "GIRAR • ENERGIA • GIRAR • ENERGIA • ", n = frase.length;
      for (let k = 0; k < n; k++) {
        const a = -ang * 0.12 - (t - tG) * 0.25 + (k / n) * 6.283; // devagar: rápido demais "dobra" com o desfoque de movimento
        x.save(); x.translate(CX + Math.cos(a) * (R + 70), CY + Math.sin(a) * (R + 70)); x.rotate(a + Math.PI / 2);
        x.fillStyle = `rgba(143,227,255,${0.55 * ap * (1 - vou)})`; x.fillText(frase[k], 0, 0); x.restore();
      }
      x.globalCompositeOperation = "lighter";
    }
    // "fácil": o rotor colapsa num clarão amarelo atrás da palavra
    if (t >= tF - 0.05) {
      const u = t - tF, fl = Math.exp(-u * 3);
      glow(CX, CY - 10, 900, "255,200,60", 0.35 * _out(u / 0.3) * (0.6 + 0.4 * fl));
      glow(CX, CY - 10, 300, "255,250,220", 0.7 * fl);
      if (u < 1) { const k = _out(u); x.strokeStyle = `rgba(255,220,100,${0.7 * (1 - k)})`; x.lineWidth = 5; x.beginPath(); x.arc(CX, CY, 80 + k * 800, 0, 6.283); x.stroke(); }
    }
  });
};
