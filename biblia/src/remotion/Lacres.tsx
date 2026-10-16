/**
 * "O fato vira cena" v2: N lacres de cera NUMERADOS (1…N) vagam pela tela em trajetórias suaves e imprevisíveis; em ORDEM
 * ALEATÓRIA (sorteada por vídeo), cada um dispara acelerando até uma palavra do versículo, BATE nela e é o impacto que o
 * quebra (estilhaços de cera, fumaça, brasas, anel de choque, clarão na palavra). Tudo em SVG/código: gratuito e determinístico.
 * A posição de cada palavra vem da mesma diagramação do versículo (mesma fonte, mesma caixa segura).
 */
import { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { diagramar } from "./VersoFixo";
import type { PalavraPlano } from "../lib/plan";

export interface VisualLacres { tipo: "lacres"; n: number; entradas: number[]; gatilhos: number[]; idx: number[]; selo: number[] }
type Caixa = { x: number; w: number; y: number; h: number };
const h = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const D = 100, VOO = 0.62;

/** Trajetória "aleatória" (determinística) de cada lacre: vaga pela área segura, sem cruzar a coluna de ícones do TikTok. */
const vagar = (i: number, t: number) => {
  const w1 = 0.5 + 0.55 * h(i, 1), w2 = 1.0 + 0.9 * h(i, 2), p1 = h(i, 3) * 6.28, p2 = h(i, 4) * 6.28, p3 = h(i, 5) * 6.28, p4 = h(i, 6) * 6.28;
  const x = 500 + 310 * Math.sin(w1 * t + p1) + 95 * Math.sin(w2 * t + p2);
  const y = 1360 + 110 * Math.sin((w1 * 0.8 + 0.2) * t + p3) + 40 * Math.sin(w2 * 1.3 * t + p4);
  return { x: Math.min(880, Math.max(115, x)), y: Math.min(1500, Math.max(1225, y)), rot: 16 * Math.sin(w2 * t + p1) };
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

const Defs = ({ id }: { id: string }) => (
  <defs>
    <radialGradient id={`${id}g`} cx="34%" cy="28%" r="85%"><stop offset="0" stopColor="#ff8a73" /><stop offset=".4" stopColor="#d02a22" /><stop offset=".8" stopColor="#7a0f0e" /><stop offset="1" stopColor="#3d0605" /></radialGradient>
    <radialGradient id={`${id}s`} cx="30%" cy="24%" r="40%"><stop offset="0" stopColor="rgba(255,235,220,.85)" /><stop offset="1" stopColor="rgba(255,235,220,0)" /></radialGradient>
    <filter id={`${id}b`} x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="9" /></filter>
    <filter id={`${id}m`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" /></filter>
  </defs>
);

/** Lacre de cera: borda ondulada, relevo, reflexo e NÚMERO em alto-relevo. */
const Selo = ({ i, num, scale = 1, glow = 0.5 }: { i: number; num: number; scale?: number; glow?: number }) => {
  const r = D / 2, id = `l${i}`;
  const borda = Array.from({ length: 36 }, (_, k) => { const a = (k / 36) * Math.PI * 2, rr = r * (0.94 + 0.05 * h(i, k) + 0.025 * Math.sin(k * 2.3)); return [Math.sin(a) * rr, -Math.cos(a) * rr] as const; });
  const path = `M${borda[0][0].toFixed(1)} ${borda[0][1].toFixed(1)} ${borda.slice(1).map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")} Z`;
  return (
    <g transform={`scale(${scale})`}>
      <Defs id={id} />
      <ellipse cx={4} cy={r * 0.92} rx={r * 0.95} ry={r * 0.28} fill="rgba(0,0,0,.35)" filter={`url(#${id}m)`} />
      <circle r={r + 12} fill={`rgba(255,80,50,${0.20 * glow})`} filter={`url(#${id}b)`} />
      <path d={path} fill={`url(#${id}g)`} stroke="#3a0504" strokeWidth="3" />
      <circle r={r * 0.74} fill="none" stroke="rgba(255,200,175,.5)" strokeWidth="2.5" />
      <circle r={r * 0.70} fill="none" stroke="rgba(60,4,4,.55)" strokeWidth="2" />
      <text y={r * 0.02} textAnchor="middle" dominantBaseline="central" fontFamily="Cinzel, serif" fontWeight={700} fontSize={r * 0.98} fill="rgba(255,205,185,.65)" transform="translate(-1.6 -1.6)">{num}</text>
      <text y={r * 0.02} textAnchor="middle" dominantBaseline="central" fontFamily="Cinzel, serif" fontWeight={700} fontSize={r * 0.98} fill="rgba(45,2,2,.9)" transform="translate(1.8 1.8)">{num}</text>
      <text y={r * 0.02} textAnchor="middle" dominantBaseline="central" fontFamily="Cinzel, serif" fontWeight={700} fontSize={r * 0.98} fill="#8d1511">{num}</text>
      <ellipse cx={-r * 0.3} cy={-r * 0.34} rx={r * 0.46} ry={r * 0.3} fill={`url(#${id}s)`} transform={`rotate(-28 ${-r * 0.3} ${-r * 0.34})`} />
    </g>
  );
};

const Lacre = ({ i, num, entra, hit, alvo }: { i: number; num: number; entra: number; hit: number; alvo: { x: number; y: number; fonte: number } }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  if (t < entra - 0.02) return null;
  const r = D / 2;
  const s = spring({ frame: frame - Math.round(entra * fps), fps, config: { damping: 9, mass: 0.6, stiffness: 220 } });
  const inicioVoo = hit - VOO;
  // 1) vagando pela tela (movimento aleatório suave) até começar o voo
  if (t < inicioVoo) { const v = vagar(i, t); return <g transform={`translate(${v.x} ${v.y}) rotate(${v.rot})`}><Selo i={i} num={num} scale={Math.min(1, Math.max(0, s))} /></g>; }
  // 2) voo acelerado até a palavra (ease-in forte, giro, rastro e riscos de velocidade)
  if (t < hit) {
    const tf = (t - inicioVoo) / VOO, o = vagar(i, inicioVoo);
    const pos = (u: number) => { const p = Math.max(0, u) ** 2.6; return { px: o.x + (alvo.x - o.x) * p, py: o.y + (alvo.y - o.y) * p, sc: 1 + 0.4 * p, rot: o.rot + 420 * p }; };
    const cur = pos(tf), ang = Math.atan2(alvo.y - o.y, alvo.x - o.x) * 180 / Math.PI;
    const rastro = [0.05, 0.1, 0.15, 0.21, 0.28, 0.36].map((d, k) => ({ ...pos(tf - d), o: 0.34 - k * 0.05 }));
    return (
      <g>
        {rastro.map((p, k) => <g key={k} opacity={Math.max(0, p.o) * Math.min(1, tf * 3.5)} transform={`translate(${p.px} ${p.py}) scale(${p.sc})`}><circle r={r * 0.9} fill="#ff6a3c" /></g>)}
        <g transform={`translate(${cur.px} ${cur.py}) rotate(${ang})`} opacity={Math.min(0.75, tf * 1.2)}><path d={`M${-r * (1.2 + 3 * tf)} 0 L${-r * 0.4} ${-r * 0.55} L${r * 0.2} 0 L${-r * 0.4} ${r * 0.55} Z`} fill="rgba(255,170,100,.55)" /></g>
        <g transform={`translate(${cur.px} ${cur.py}) rotate(${cur.rot}) scale(${cur.sc})`}><Selo i={i} num={num} glow={1 + 3 * tf} /></g>
      </g>
    );
  }
  // 3) impacto NA palavra: estilhaços, fumaça, brasas, anel de choque e clarão sobre a palavra
  const dt = t - hit, fade = 1 - Math.min(1, Math.max(0, (dt - 0.55) / 0.55));
  const N = 9, ang0 = h(i, 40) * 6.28;
  const cacos = Array.from({ length: N }, (_, k) => {
    const a0 = ang0 + (k / N) * 6.2832 + (h(i, k + 50) - 0.5) * 0.25, a1 = ang0 + ((k + 1) / N) * 6.2832 + (h(i, k + 51) - 0.5) * 0.25, am = (a0 + a1) / 2;
    const v = 150 + h(i, k + 60) * 240, sp = (h(i, k + 70) - 0.5) * 900, e = Math.min(dt, 1.2);
    const cx = Math.cos(am) * v * e, cy = Math.sin(am) * v * e + 700 * e * e, rr = r * (0.95 + 0.1 * h(i, k + 80));
    return { cx, cy, rot: sp * e, d: `M0 0 L${Math.cos(a0) * rr} ${Math.sin(a0) * rr} L${Math.cos(am) * rr * 0.9} ${Math.sin(am) * rr * 0.9} L${Math.cos(a1) * rr} ${Math.sin(a1) * rr} Z` };
  });
  const brasas = Array.from({ length: 22 }, (_, k) => {
    const a = h(i, k + 5) * Math.PI * 2, v = 140 + h(i, k + 9) * 300, life = Math.min(1, dt / (0.55 + h(i, k) * 0.8));
    return { x: Math.cos(a) * v * life, y: Math.sin(a) * v * life + 320 * life * life, o: 1 - life, r: 2 + h(i, k + 2) * 4.5 };
  });
  const fumacas = Array.from({ length: 5 }, (_, k) => { const life = Math.min(1, dt / 1.1); return { x: (h(i, k + 90) - 0.5) * 90 * life, y: -70 * life - k * 8 * life, r: 22 + 60 * life + k * 4, o: 0.34 * (1 - life) * (dt > 0 ? 1 : 0) }; });
  return (
    <g transform={`translate(${alvo.x} ${alvo.y})`}>
      <Defs id={`l${i}x`} />
      {fumacas.map((f, k) => <circle key={k} cx={f.x} cy={f.y} r={f.r} fill="rgba(60,30,20,1)" opacity={Math.max(0, f.o)} filter={`url(#l${i}xb)`} />)}
      <circle r={alvo.fonte * 1.1 * Math.exp(-dt * 5)} fill={`rgba(255,240,200,${0.8 * Math.exp(-dt * 7)})`} filter={`url(#l${i}xm)`} />
      <circle r={r + 6 + dt * 420} fill="none" stroke={`rgba(255,200,120,${Math.max(0, 0.9 - dt * 1.8)})`} strokeWidth={7 * Math.max(0, 1 - dt * 2) + 1} />
      <g opacity={fade}>
        {cacos.map((c, k) => <g key={k} transform={`translate(${c.cx} ${c.cy}) rotate(${c.rot})`}><path d={c.d} fill={`url(#l${i}g)`} stroke="#3a0504" strokeWidth="2" /></g>)}
      </g>
      {brasas.map((b, k) => <circle key={k} cx={b.x} cy={b.y} r={b.r} fill="#ffb454" opacity={Math.max(0, b.o)} />)}
    </g>
  );
};

export const Lacres = ({ v, palavras, caixa }: { v: VisualLacres; palavras: string[]; caixa: Caixa }) => {
  const [pronto, setPronto] = useState(false);
  useEffect(() => { const hd = delayRender("fonte dos lacres"); document.fonts.load("700 70px Cinzel").finally(() => { setPronto(true); continueRender(hd); }); }, []);
  const pos = useMemo(() => (pronto ? centros(palavras, caixa) : []), [pronto, palavras, caixa]);
  if (!pronto) return null;
  // o lacre i bate na palavra j quando selo[j] === i
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {Array.from({ length: v.n }, (_, i) => {
        const j = v.selo.indexOf(i);
        return <Lacre key={i} i={i} num={i + 1} entra={v.entradas[i] ?? 0} hit={v.gatilhos[j] ?? 1e9} alvo={pos[v.idx[j]] ?? { x: 540, y: 700, fonte: 80 }} />;
      })}
    </svg>
  );
};
