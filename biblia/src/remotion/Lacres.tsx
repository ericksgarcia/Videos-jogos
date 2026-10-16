/**
 * "O fato vira cena" v3: N BOLHAS transparentes e NUMERADAS (1…N) flutuam pela tela (inclusive por cima do versículo, sem
 * tapar a leitura) em movimento líquido e imprevisível, com leve gelatina (squash/stretch). Em ORDEM ALEATÓRIA (sorteada por
 * vídeo) cada uma dispara acelerando até uma palavra do versículo e ESTOURA nela (película que se rompe, gotículas, névoa,
 * brilho que passa pela palavra). A última a estourar ganha um estouro maior. Tudo em SVG/código: gratuito e determinístico.
 * A posição de cada palavra vem da mesma diagramação do versículo (mesma fonte, mesma caixa segura).
 */
import { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { diagramar } from "./VersoFixo";
import type { PalavraPlano } from "../lib/plan";

export interface VisualLacres { tipo: "lacres" | "bolhas"; n: number; entradas: number[]; gatilhos: number[]; idx: number[]; selo: number[] }
type Caixa = { x: number; w: number; y: number; h: number };
type Ponto = { x: number; y: number };
const h = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const D = 150, VOO = 0.55, X0 = 125, X1 = 860, Y0 = 400, Y1 = 1480;

/** Deriva líquida de cada bolha (soma de ondas lentas, sem cantos): posição base em t. */
const deriva = (i: number, t: number): Ponto => {
  const a = 0.23 + 0.2 * h(i, 1), b = 0.37 + 0.26 * h(i, 2), c = 0.11 + 0.1 * h(i, 3);
  const px = h(i, 4) * 6.28, py = h(i, 5) * 6.28, pz = h(i, 6) * 6.28;
  const u = 0.5 + 0.34 * Math.sin(a * t + px) + 0.16 * Math.sin(b * t * 1.3 + pz);
  const v = 0.5 + 0.34 * Math.sin(b * t * 0.9 + py) + 0.16 * Math.sin(c * t * 2.1 + px);
  return { x: X0 + (X1 - X0) * u, y: Y0 + (Y1 - Y0) * v };
};
/** Posições de todas as bolhas ainda "livres" em t, com repulsão suave entre vizinhas (elas se desviam, não se sobrepõem). */
const flutuar = (t: number, livres: boolean[]): Ponto[] => {
  const p = livres.map((_, i) => deriva(i, t));
  for (let it = 0; it < 3; it++) for (let i = 0; i < p.length; i++) for (let j = i + 1; j < p.length; j++) {
    if (!livres[i] || !livres[j]) continue;
    const dx = p[j].x - p[i].x, dy = p[j].y - p[i].y, d = Math.hypot(dx, dy) || 1, min = D * 1.08;
    if (d < min) { const f = ((min - d) / 2) / d; p[i] = { x: p[i].x - dx * f, y: p[i].y - dy * f }; p[j] = { x: p[j].x + dx * f, y: p[j].y + dy * f }; }
  }
  return p;
};

/** Centro (x, y) de cada palavra do versículo, na mesma diagramação do VersoFixo. */
function centros(palavras: string[], caixa: Caixa): { x: number; y: number; fonte: number }[] {
  const ps: PalavraPlano[] = palavras.map((t) => ({ t, ini: 0, fim: 0 }));
  const { fonte, linhas } = diagramar(ps, caixa);
  const ctx = document.createElement("canvas").getContext("2d")!;
  ctx.font = `700 ${fonte}px Cinzel`;
  const margem = 0.24 * fonte, lh = fonte * 1.3, topo = caixa.y + (caixa.h - linhas.length * lh) / 2;
  const out: { x: number; y: number; fonte: number }[] = [];
  let k = 0;
  linhas.forEach((l, li) => {
    const larg = l.map((w, j) => { const t = k + j === 0 ? w.t.charAt(0).toUpperCase() + w.t.slice(1) : w.t; return ctx.measureText(t).width + 2 * margem; });
    const total = larg.reduce((a, b) => a + b, 0); let x = caixa.x + (caixa.w - total) / 2;
    l.forEach((_, j) => { out[k] = { x: x + larg[j] / 2, y: topo + (li + 0.5) * lh, fonte }; x += larg[j]; k++; });
  });
  return out;
}

const Defs = () => (
  <defs>
    <radialGradient id="bgC" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="rgba(190,225,255,.02)" /><stop offset=".72" stopColor="rgba(190,225,255,.07)" /><stop offset=".93" stopColor="rgba(200,235,255,.30)" /><stop offset="1" stopColor="rgba(255,255,255,.55)" /></radialGradient>
    <linearGradient id="bgR" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#bff4ff" /><stop offset=".35" stopColor="#ffe7a8" /><stop offset=".65" stopColor="#ffb7e0" /><stop offset="1" stopColor="#9fd4ff" /></linearGradient>
    <radialGradient id="bgH" cx="50%" cy="50%" r="50%"><stop offset="0" stopColor="rgba(255,255,255,.95)" /><stop offset="1" stopColor="rgba(255,255,255,0)" /></radialGradient>
    <filter id="bgB" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="12" /></filter>
    <filter id="bgM" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" /></filter>
  </defs>
);

/** Bolha de sabão transparente: película iridescente, brilhos e número fino. `sx/sy` = gelatina. */
const Bolha = ({ num, sx = 1, sy = 1, rot = 0, brilho = 0.4 }: { num: number; sx?: number; sy?: number; rot?: number; brilho?: number }) => {
  const r = D / 2;
  return (
    <g transform={`rotate(${rot}) scale(${sx} ${sy})`}>
      <circle r={r + 16} fill={`rgba(170,220,255,${0.14 * brilho})`} filter="url(#bgB)" />
      <circle r={r} fill="url(#bgC)" />
      <circle r={r - 1.2} fill="none" stroke="url(#bgR)" strokeWidth="2.6" opacity=".8" />
      <circle r={r - 7} fill="none" stroke="url(#bgR)" strokeWidth="1.2" opacity=".28" />
      <path d={`M ${-r * 0.62} ${-r * 0.28} A ${r * 0.7} ${r * 0.7} 0 0 1 ${-r * 0.12} ${-r * 0.7}`} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="5.5" strokeLinecap="round" />
      <ellipse cx={r * 0.38} cy={r * 0.46} rx={r * 0.2} ry={r * 0.08} fill="rgba(255,255,255,.4)" transform={`rotate(-40 ${r * 0.38} ${r * 0.46})`} />
      <text y={r * 0.03} textAnchor="middle" dominantBaseline="central" fontFamily="Cinzel, serif" fontWeight={700} fontSize={r * 0.86} fill="rgba(0,10,30,.55)" transform="translate(1.6 1.8)">{num}</text>
      <text y={r * 0.03} textAnchor="middle" dominantBaseline="central" fontFamily="Cinzel, serif" fontWeight={700} fontSize={r * 0.86} fill="rgba(255,255,255,.92)">{num}</text>
    </g>
  );
};

/** Estouro: a película se rompe (anel que abre e some), gotículas em arco, névoa de gotas e um brilho que varre a palavra. */
const Estouro = ({ i, dt, alvo, grande }: { i: number; dt: number; alvo: { x: number; y: number; fonte: number }; grande: boolean }) => {
  const r = D / 2, k = grande ? 1.55 : 1;
  const e = Math.min(dt, 1.3);
  const gotas = Array.from({ length: grande ? 22 : 14 }, (_, n) => {
    const a = h(i, n + 3) * 6.2832, v = (120 + h(i, n + 9) * 330) * k, rr = (2.4 + h(i, n + 21) * 5.5) * (grande ? 1.25 : 1);
    const life = Math.min(1, dt / (0.5 + h(i, n) * 0.55));
    return { x: Math.cos(a) * v * e, y: Math.sin(a) * v * e + 520 * e * e, rr, o: 1 - life * life };
  });
  const arcos = Array.from({ length: 7 }, (_, n) => {
    const a = (n / 7) * 6.2832 + h(i, n + 40) * 0.5, v = (170 + h(i, n + 50) * 120) * k, len = 0.35 + h(i, n + 60) * 0.3;
    const rad = r * (1 + 3.2 * Math.min(1, dt * 4.5)) * 0.72 * k;
    return { a, len, rad, v };
  });
  const anel = r * (1 + (grande ? 3.4 : 2.2) * (1 - Math.exp(-dt * 11))), oAnel = Math.max(0, 1 - dt * 3.2);
  return (
    <g transform={`translate(${alvo.x} ${alvo.y})`}>
      <circle r={alvo.fonte * (grande ? 1.9 : 1.25) * (1 - Math.exp(-dt * 9)) + 4} fill={`rgba(220,245,255,${0.75 * Math.exp(-dt * 6.5)})`} filter="url(#bgM)" />
      <circle r={anel} fill="none" stroke="rgba(235,250,255,.95)" strokeWidth={Math.max(0.5, 6 * oAnel)} opacity={oAnel} />
      <circle r={anel * 0.78} fill="none" stroke="url(#bgR)" strokeWidth={Math.max(0.5, 3 * oAnel)} opacity={oAnel * 0.8} />
      {arcos.map((s, n) => {
        const a0 = s.a, a1 = s.a + s.len, R = s.rad;
        return <path key={n} d={`M ${Math.cos(a0) * R} ${Math.sin(a0) * R} A ${R} ${R} 0 0 1 ${Math.cos(a1) * R} ${Math.sin(a1) * R}`} fill="none" stroke="rgba(255,255,255,.9)" strokeWidth={4 * oAnel + 0.5} strokeLinecap="round" opacity={oAnel} />;
      })}
      {gotas.map((g, n) => (
        <g key={n} opacity={Math.max(0, g.o)}>
          <circle cx={g.x} cy={g.y} r={g.rr} fill="rgba(190,230,255,.45)" stroke="rgba(255,255,255,.85)" strokeWidth="1.2" />
          <circle cx={g.x - g.rr * 0.3} cy={g.y - g.rr * 0.3} r={g.rr * 0.28} fill="#fff" />
        </g>
      ))}
    </g>
  );
};

const Item = ({ i, num, entra, hit, alvo, grande, livres }: { i: number; num: number; entra: number; hit: number; alvo: { x: number; y: number; fonte: number }; grande: boolean; livres: (t: number) => Ponto[] }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  if (t < entra - 0.02) return null;
  const inicioVoo = hit - VOO;
  const s = spring({ frame: frame - Math.round(entra * fps), fps, config: { damping: 11, mass: 0.7, stiffness: 120 } });
  const gel = (u: number, amp: number) => ({ sx: 1 + amp * Math.sin(u * 2.3 + i), sy: 1 - amp * Math.sin(u * 2.3 + i) });
  // 1) flutuando (movimento líquido, gelatina leve)
  if (t < inicioVoo) {
    const p = livres(t)[i], g = gel(t, 0.05);
    return <g transform={`translate(${p.x} ${p.y}) scale(${Math.min(1, Math.max(0, s))})`}><Bolha num={num} sx={g.sx} sy={g.sy} rot={10 * Math.sin(t * 0.6 + i)} /></g>;
  }
  // 2) voo acelerado até a palavra: estica na direção do movimento, deixa rastro de bolhinhas
  if (t < hit) {
    const tf = (t - inicioVoo) / VOO, o = livres(inicioVoo)[i];
    const pos = (u: number) => { const q = Math.max(0, u) ** 2.4; return { x: o.x + (alvo.x - o.x) * q, y: o.y + (alvo.y - o.y) * q }; };
    const cur = pos(tf), ang = Math.atan2(alvo.y - o.y, alvo.x - o.x) * 180 / Math.PI;
    const estica = 1 + 0.55 * tf * tf, afina = 1 - 0.22 * tf * tf;
    const rastro = [0.04, 0.08, 0.12, 0.17, 0.23].map((d, k) => ({ ...pos(tf - d), o: 0.5 - k * 0.09, r: 0.32 - k * 0.04 }));
    return (
      <g>
        {rastro.map((p, k) => <circle key={k} cx={p.x} cy={p.y} r={D * p.r} fill="rgba(200,235,255,.14)" stroke="rgba(255,255,255,.55)" strokeWidth="1.5" opacity={Math.max(0, p.o) * Math.min(1, tf * 4)} />)}
        <g transform={`translate(${cur.x} ${cur.y})`}><Bolha num={num} sx={estica} sy={afina} rot={ang} brilho={1 + 3 * tf} /></g>
      </g>
    );
  }
  return <Estouro i={i} dt={t - hit} alvo={alvo} grande={grande} />;
};

export const Lacres = ({ v, palavras, caixa }: { v: VisualLacres; palavras: string[]; caixa: Caixa }) => {
  const [pronto, setPronto] = useState(false);
  useEffect(() => { const hd = delayRender("fonte das bolhas"); document.fonts.load("700 70px Cinzel").finally(() => { setPronto(true); continueRender(hd); }); }, []);
  const pos = useMemo(() => (pronto ? centros(palavras, caixa) : []), [pronto, palavras, caixa]);
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  if (!pronto) return null;
  // a bolha i bate na palavra j quando selo[j] === i; a última a estourar tem o estouro maior
  const hitDe = (i: number) => v.gatilhos[v.selo.indexOf(i)] ?? 1e9;
  const ultimo = Math.max(...v.gatilhos);
  const livres = (tt: number) => flutuar(tt, Array.from({ length: v.n }, (_, i) => tt < hitDe(i) - VOO));
  const cache = livres(t);   // só para o quadro atual; cada Item pede de novo a posição no instante dele (inicioVoo)
  void cache;
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <Defs />
      {Array.from({ length: v.n }, (_, i) => {
        const j = v.selo.indexOf(i);
        return <Item key={i} i={i} num={i + 1} entra={v.entradas[i] ?? 0} hit={hitDe(i)} grande={v.gatilhos[j] === ultimo} alvo={pos[v.idx[j]] ?? { x: 540, y: 700, fonte: 80 }} livres={livres} />;
      })}
    </svg>
  );
};
