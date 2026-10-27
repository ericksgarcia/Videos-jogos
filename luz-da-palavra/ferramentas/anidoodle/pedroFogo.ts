import { rng, type Ctx, type Env, type P } from "./core";
import type { Film } from "./film";
import { smooth } from "./gallery";

// PEDRO JUNTO AO FOGO · flat vector, 2D. Formas chapadas de uma cor só (sem contorno), bordas nítidas, planos que se sobrepõem,
// sombras longas jogadas para longe do fogo, grão só no lado da sombra. Noite no pátio (Jo 18:18): céu azul-noite, lua, muralha, fogueira,
// três pessoas em volta (Pedro encolhido, de capuz), galo no muro. Luz: o fogo, em baixo no centro.
const W = 1080, H = 1920, FPS = 30, DURATION = 90;
const C = {
  sky0: "#0c1233", sky1: "#1b2a63", sky2: "#3a3f86", moon: "#f4e9c8", halo: "#ffe9a8", star: "#fff4d6",
  hillF: "#27336f", hillM: "#1d2859", wall: "#33407e", wallS: "#232d63", stone: "#47548f", stoneS: "#2f3a73",
  ground: "#2a2347", groundL: "#6a3b3a", fire: "#ff8a2b", fireM: "#ffbb33", fireC: "#fff0a0", ember: "#ff6a2a", log: "#5a3524", logS: "#3a2118",
  robeA: "#c9772f", robeB: "#8a9a6a", robeC: "#b5546a", skin: "#e0a97a", skinS: "#b5825a", hood: "#6b4a38", cock: "#e8d9b0", cockR: "#d24a3a",
};
const sm = (a: P[], closed = true, per = 8) => smooth(a, closed, per);
const poly = (c: Ctx, pts: P[], fill: string | CanvasGradient) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.fillStyle = fill; c.fill(); };
const circle = (c: Ctx, x: number, y: number, r: number, fill: string | CanvasGradient) => { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = fill; c.fill(); };
const radial = (c: Ctx, x: number, y: number, r: number, col: string, a0: number) => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col + Math.round(a0 * 255).toString(16).padStart(2, "0")); g.addColorStop(1, col + "00"); return g; };
// sombra longa: o contorno projetado para longe da fonte (fx, fy), com rampa de opacidade
const castShadow = (c: Ctx, pts: P[], fx: number, fy: number, len: number, alpha: number) => {
  const out = pts.map(([x, y]) => { const dx = x - fx, dy = y - fy, d = Math.hypot(dx, dy) || 1; return [x + (dx / d) * len, y + (dy / d) * len * 0.25] as P; });
  const g = c.createLinearGradient(pts[0][0], pts[0][1], out[0][0], out[0][1]); g.addColorStop(0, `rgba(8,10,30,${alpha})`); g.addColorStop(1, "rgba(8,10,30,0)");
  poly(c, [...pts, ...out.reverse()], g);
};

const person = (c: Ctx, x: number, y: number, s: number, robe: string, flip: number, hooded: boolean, hunch: number, fx: number) => {
  const k = s * flip, R = (px: number, py: number): P => [x + px * k, y + py * s];
  const body: P[] = sm([R(-46, 0), R(-42, -70 + hunch), R(-26, -128 + hunch), R(0, -146 + hunch * 1.4), R(26, -128 + hunch), R(42, -70 + hunch), R(46, 0)], true, 6);
  { const away = x < fx ? -1 : 1, g = c.createLinearGradient(x, y, x + away * 260 * s, y + 20 * s); g.addColorStop(0, "rgba(8,10,30,0.55)"); g.addColorStop(1, "rgba(8,10,30,0)");
    poly(c, sm([[x - 46 * s, y], [x + away * 120 * s, y - 16 * s], [x + away * 280 * s, y + 6 * s], [x + away * 120 * s, y + 30 * s], [x + 46 * s, y + 8 * s]], true, 6), g); }
  poly(c, body, robe);
  poly(c, sm([R(-4, -146 + hunch * 1.4), R(26, -128 + hunch), R(42, -70 + hunch), R(46, 0), R(16, 0), R(14, -70 + hunch)], true, 6), "rgba(10,12,40,0.28)");   // lado da sombra
  // cabeça
  const hx = 2 * flip, hy = -168 + hunch * 1.6;
  if (hooded) { poly(c, sm([R(hx - 30, hy + 30), R(hx - 28, hy - 14), R(hx, hy - 34), R(hx + 28, hy - 14), R(hx + 30, hy + 30)], true, 6), C.hood); circle(c, x + (hx + 8) * k, y + (hy - 2) * s, 17 * s, C.skin); poly(c, sm([R(hx - 24, hy + 18), R(hx, hy + 40), R(hx + 24, hy + 18)], true, 5), C.hood); }
  else { circle(c, x + hx * k, y + hy * s, 25 * s, C.skin); poly(c, sm([R(hx - 26, hy - 6), R(hx - 18, hy - 28), R(hx + 6, hy - 32), R(hx + 24, hy - 14), R(hx + 14, hy - 4), R(hx - 6, hy - 14)], true, 5), "#3a2a22"); circle(c, x + (hx + 12) * k, y + (hy + 6) * s, 25 * s, "rgba(150,70,40,0.25)"); }
  // mãos estendidas para o fogo
  poly(c, sm([R(26, -104 + hunch), R(70, -84), R(74, -64), R(30, -78)], true, 5), robe); circle(c, x + 78 * k, y - 72 * s, 12 * s, C.skin);
};

const tongue = (c: Ctx, x: number, y: number, w: number, h: number, lean: number, col: string) => poly(c, sm([[x - w, y], [x - w * 0.9, y - h * 0.4], [x - w * 0.35 + lean * 0.4, y - h * 0.78], [x + lean, y - h], [x + w * 0.4 + lean * 0.4, y - h * 0.7], [x + w * 0.95, y - h * 0.34], [x + w, y]], true, 8), col);
const flame = (c: Ctx, cx: number, cy: number, w: number, h: number, t: number, col: string, ph: number) => {
  const sw = Math.sin(t * 0.21 + ph) * 12, sw2 = Math.sin(t * 0.33 + ph * 2) * 9;
  tongue(c, cx - w * 0.52, cy, w * 0.5, h * 0.62, sw2 - 10, col); tongue(c, cx + w * 0.56, cy, w * 0.46, h * 0.55, -sw2 + 8, col); tongue(c, cx, cy, w * 0.72, h, sw, col);
};

const draw = (c: Ctx, local: number, env: Env) => {
  c.save(); c.scale(env.scale, env.scale);
  const r = rng(11), fx = 540, fy = 1500;
  // céu: três faixas de azul, lua com halo, estrelas
  const sky = c.createLinearGradient(0, 0, 0, 1250); sky.addColorStop(0, C.sky0); sky.addColorStop(0.55, C.sky1); sky.addColorStop(1, C.sky2); c.fillStyle = sky; c.fillRect(0, 0, W, H);
  c.fillStyle = radial(c, 800, 330, 380, C.halo, 0.28); c.fillRect(0, 0, W, 900); circle(c, 800, 330, 82, C.moon); [[772, 306, 20], [826, 352, 15], [836, 296, 11], [780, 366, 9]].forEach(([x, y, rr]) => circle(c, x, y, rr, "#e6d9b0"));
  for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * 780, s = 1.6 + r() * 3.4, a = 0.35 + 0.65 * Math.abs(Math.sin(local * 0.09 + i)); c.globalAlpha = a; poly(c, [[x, y - s * 2.2], [x + s * 0.6, y - s * 0.6], [x + s * 2.2, y], [x + s * 0.6, y + s * 0.6], [x, y + s * 2.2], [x - s * 0.6, y + s * 0.6], [x - s * 2.2, y], [x - s * 0.6, y - s * 0.6]], C.star); } c.globalAlpha = 1;
  // colinas longe e perto
  poly(c, [...sm([[0, 980], [140, 920], [300, 960], [470, 900], [660, 950], [840, 905], [1080, 940]], false, 10), [1080, 1300], [0, 1300]], C.hillF);
  poly(c, [...sm([[0, 1040], [180, 1000], [380, 1040], [600, 990], [820, 1030], [1080, 995]], false, 10), [1080, 1300], [0, 1300]], C.hillM);
  // muralha do pátio com ameias e uma torre, janelas acesas de longe
  const wall = (x0: number, x1: number, y: number, h: number) => { poly(c, [[x0, y], [x1, y], [x1, y - h], [x0, y - h]], C.wall); for (let x = x0; x < x1 - 30; x += 64) poly(c, [[x, y - h], [x + 40, y - h], [x + 40, y - h - 34], [x, y - h - 34]], C.wall); };
  wall(0, 1080, 1260, 190);
  poly(c, [[0, 1260], [1080, 1260], [1080, 1070], [0, 1070]], "rgba(10,12,40,0.18)");
  poly(c, [[700, 1260], [960, 1260], [960, 880], [700, 880]], C.wall); poly(c, [[700, 880], [830, 810], [960, 880]], C.wallS); poly(c, [[700, 1260], [830, 1260], [830, 880], [700, 880]], "rgba(70,84,160,0.35)");
  poly(c, [[790, 1010], [840, 1010], [840, 1090], [790, 1090]], C.stoneS); poly(c, [[790, 1010], [815, 990], [840, 1010]], C.stoneS);
  poly(c, [[300, 1260], [372, 1260], [372, 1130], [336, 1100], [300, 1130]], C.stoneS);                  // arco do portão
  poly(c, [[318, 1260], [354, 1260], [354, 1160], [336, 1140], [318, 1160]], "#fbbf47");                  // a luz atrás do arco
  // o galo no muro: corpo, peito, pescoço curvo, crista de três pontas, bico, barbela e cauda em leque
  { const gx = 170, gy = 1068, K = 1.25, G = (x: number, y: number): P => [gx + x * K, gy + y * K];
    poly(c, [G(-18, 0), G(-62, -30), G(-96, -88), G(-70, -70), G(-84, -120), G(-52, -84), G(-44, -140), G(-26, -86), G(-14, -50)], C.cockR);        // cauda: penas
    poly(c, [G(-26, -40), G(-84, -74), G(-60, -36)], "#2f8f86"); poly(c, [G(-22, -30), G(-70, -44), G(-40, -16)], "#e0883a");
    poly(c, sm([G(-36, -2), G(-44, -34), G(-30, -62), G(0, -70), G(26, -64), G(34, -84), G(30, -104), G(40, -118), G(58, -116), G(64, -102), G(58, -86), G(60, -60), G(52, -28), G(34, -2)], true, 6), C.cock);   // corpo cheio, pescoço curto, cabeça
    poly(c, sm([G(-28, -30), G(-6, -52), G(24, -48), G(26, -22), G(4, -6), G(-20, -8)], true, 6), "#cdbb8a");                                               // asa
    poly(c, [G(40, -118), G(42, -140), G(50, -126), G(56, -144), G(60, -120)], C.cockR); poly(c, [G(62, -110), G(86, -102), G(62, -96)], "#f2b533"); poly(c, [G(58, -96), G(68, -80), G(54, -88)], C.cockR); circle(c, gx + 52 * K, gy - 108 * K, 3.2, "#2a1a14");
    poly(c, [[gx - 2, gy], [gx + 4, gy], [gx + 4, gy + 14], [gx - 2, gy + 14]], "#f2b533"); }
  // chão: faixa de terra, luz laranja do fogo no chão
  poly(c, [[0, 1260], [1080, 1260], [1080, H], [0, H]], C.ground);
  c.fillStyle = radial(c, fx, fy, 760, C.fire, 0.5); c.fillRect(0, 1260, W, 660);
  c.globalCompositeOperation = "lighter"; c.fillStyle = radial(c, fx, fy - 80, 420, C.fire, 0.18); c.fillRect(0, 1000, W, 900); c.globalCompositeOperation = "source-over";
  poly(c, sm([[0, 1340], [300, 1310], [700, 1330], [1080, 1300], [1080, 1420], [700, 1440], [300, 1410], [0, 1440]], true, 10), "rgba(20,14,46,0.35)");
  // lenha e fogo (três camadas de chama, cada uma de uma cor só)
  poly(c, [[fx - 190, fy + 40], [fx + 170, fy - 10], [fx + 190, fy + 6], [fx - 170, fy + 58]], C.logS); poly(c, [[fx - 170, fy + 10], [fx + 190, fy + 50], [fx + 176, fy + 70], [fx - 190, fy + 30]], C.log);
  flame(c, fx, fy + 10, 150, 300, local, C.ember, 0); flame(c, fx + 6, fy + 8, 112, 240, local, C.fire, 1.7); flame(c, fx - 4, fy + 6, 70, 170, local, C.fireM, 3.1); flame(c, fx, fy + 4, 34, 96, local, C.fireC, 4.6);
  for (let i = 0; i < 18; i++) { const u = (local * 0.012 + r()) % 1, x = fx + (r() - 0.5) * 200 + Math.sin(local * 0.1 + i) * 30 * u, y = fy - 200 - u * 330; c.globalAlpha = (1 - u) * 0.95; circle(c, x, y, 2 + r() * 4 * (1 - u), i % 3 ? C.fireM : C.fireC); } c.globalAlpha = 1;
  // pessoas em volta do fogo: Pedro (à esquerda, encolhido de capuz), dois soldados; todos jogam sombra para longe do fogo
  person(c, 214, 1640, 1.55, C.robeA, 1, true, 26, fx);                  // Pedro, encolhido
  person(c, 878, 1620, 1.45, C.robeB, -1, false, 8, fx);
  person(c, 700, 1760, 1.2, C.robeC, -1, false, 0, fx);
  // grão: pontinhos só no lado da sombra (à direita das formas, baixo)
  c.globalAlpha = 0.18; for (let i = 0; i < 2600; i++) { const x = r() * W, y = r() * H; if ((x > 560 && y > 1250) || y < 700) circle(c, x, y, 0.8 + r() * 1.3, "#0a0d2a"); } c.globalAlpha = 1;
  c.restore();
};

export const pedroFogo: Film = {
  meta: { title: "pedroFogo", W, H, fps: FPS, bpm: 60, durationFrames: DURATION },
  assets: { images: {} },
  shots: [{ id: "one", start: 0, end: DURATION, draw }],
};
