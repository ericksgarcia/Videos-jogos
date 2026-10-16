/**
 * "O fato vira cena": N lacres de cera que ficam PARADOS e, na hora de cada ameaça, disparam acelerando até a palavra lida,
 * BATEM nela e é o impacto que os quebra (metades + brasas + anel de choque). Tudo em SVG/código: gratuito e determinístico.
 * A posição de cada palavra vem da mesma diagramação do versículo (mesma fonte, mesma caixa segura).
 */
import { useEffect, useMemo, useState } from "react";
import { continueRender, delayRender, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { diagramar, EM } from "./VersoFixo";
import type { PalavraPlano } from "../lib/plan";

export interface VisualLacres { tipo: "lacres"; n: number; entradas: number[]; gatilhos: number[]; idx: number[] }
type Caixa = { x: number; w: number; y: number; h: number };
const h = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const D = 96, VOO = 0.62;

/** Trajetória "aleatória" (determinística) de cada lacre: vaga pela área segura, sem cruzar a coluna de ícones do TikTok. */
const vagar = (i: number, t: number) => {
  const w1 = 0.55 + 0.5 * h(i, 1), w2 = 1.1 + 0.8 * h(i, 2), p1 = h(i, 3) * 6.28, p2 = h(i, 4) * 6.28, p3 = h(i, 5) * 6.28, p4 = h(i, 6) * 6.28;
  const x = 500 + 300 * Math.sin(w1 * t + p1) + 90 * Math.sin(w2 * t + p2);
  const y = 1360 + 110 * Math.sin((w1 * 0.8 + 0.2) * t + p3) + 40 * Math.sin(w2 * 1.3 * t + p4);
  return { x: Math.min(880, Math.max(110, x)), y: Math.min(1500, Math.max(1225, y)), rot: 18 * Math.sin(w2 * t + p1) };
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
    const larg = l.map((w) => { const t = k === 0 && w === l[0] && li === 0 ? w.t.charAt(0).toUpperCase() + w.t.slice(1) : w.t; return ctx.measureText(t).width + 2 * margem; });
    const total = larg.reduce((a, b) => a + b, 0); let x = caixa.x + (caixa.w - total) / 2;
    l.forEach((_, j) => { out[k] = { x: x + larg[j] / 2, y: topo + (li + 0.5) * lh, fonte }; x += larg[j]; k++; });
  });
  return out;
}

const Selo = ({ i, scale = 1, glow = 0.5 }: { i: number; scale?: number; glow?: number }) => {
  const r = D / 2, id = `l${i}`;
  return (
    <g transform={`scale(${scale})`}>
      <defs><radialGradient id={`${id}g`} cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#ff6a55" /><stop offset=".55" stopColor="#c0211c" /><stop offset="1" stopColor="#5e0b0b" /></radialGradient></defs>
      <circle r={r + 7} fill={`rgba(255,70,50,${0.18 * glow})`} />
      <path d={`M0 ${-r} ${Array.from({ length: 24 }, (_, k) => { const a = (k / 24) * Math.PI * 2, rr = r * (0.93 + 0.07 * h(i, k)); return `L${(Math.sin(a) * rr).toFixed(1)} ${(-Math.cos(a) * rr).toFixed(1)}`; }).join(" ")} Z`} fill={`url(#${id}g)`} stroke="#4a0a08" strokeWidth="3" />
      <circle r={r * 0.68} fill="none" stroke="rgba(255,190,160,0.55)" strokeWidth="2.5" />
      <path d={`M0 ${-r * 0.36} L${r * 0.11} ${-r * 0.1} L${r * 0.38} ${-r * 0.1} L${r * 0.16} ${r * 0.08} L${r * 0.25} ${r * 0.36} L0 ${r * 0.2} L${-r * 0.25} ${r * 0.36} L${-r * 0.16} ${r * 0.08} L${-r * 0.38} ${-r * 0.1} L${-r * 0.11} ${-r * 0.1} Z`} fill="rgba(70,6,6,0.75)" />
    </g>
  );
};

const Lacre = ({ i, entra, hit, alvo }: { i: number; entra: number; hit: number; alvo: { x: number; y: number; fonte: number } }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  if (t < entra - 0.05) return null;
  const r = D / 2, id = `l${i}`;
  const s = spring({ frame: frame - Math.round(entra * fps), fps, config: { damping: 9, mass: 0.6, stiffness: 220 } });
  const inicioVoo = hit - VOO;
  // 1) vagando pela tela (movimento aleatório suave) até começar o voo
  if (t < inicioVoo) { const v = vagar(i, t); return <g transform={`translate(${v.x} ${v.y}) rotate(${v.rot})`}><Selo i={i} scale={Math.min(1, Math.max(0, s))} /></g>; }
  // 2) voo acelerado até a palavra (ease-in forte, giro e rastro)
  if (t < hit) {
    const tf = (t - inicioVoo) / VOO, o = vagar(i, inicioVoo);
    const pos = (u: number) => { const p = Math.max(0, u) ** 2.6; return { px: o.x + (alvo.x - o.x) * p, py: o.y + (alvo.y - o.y) * p, sc: 1 + 0.35 * p, rot: o.rot + 540 * p }; };
    const rastro = [0.07, 0.14, 0.21, 0.28].map((d, k) => ({ ...pos(tf - d), o: 0.32 - k * 0.07 }));
    return (
      <g>
        {rastro.map((p, k) => <g key={k} opacity={Math.max(0, p.o) * Math.min(1, tf * 4)} transform={`translate(${p.px} ${p.py}) rotate(${p.rot}) scale(${p.sc})`}><circle r={r * 0.95} fill="#ff7a4a" /></g>)}
        {(() => { const p = pos(tf); return <g transform={`translate(${p.px} ${p.py}) rotate(${p.rot}) scale(${p.sc})`}><Selo i={i} glow={1 + 2 * tf} /></g>; })()}
      </g>
    );
  }
  // 3) impacto NA palavra: metades, brasas, anel de choque e clarão sobre a palavra
  const dt = t - hit, e = Math.min(1, dt / 0.9), ease = 1 - (1 - e) ** 3, fade = 1 - Math.min(1, Math.max(0, (dt - 0.3) / 0.6));
  const brasas = Array.from({ length: 18 }, (_, k) => {
    const a = h(i, k + 5) * Math.PI * 2, v = 120 + h(i, k + 9) * 260, life = Math.min(1, dt / (0.55 + h(i, k) * 0.7));
    return { x: Math.cos(a) * v * life, y: Math.sin(a) * v * life + 300 * life * life, o: 1 - life, r: 2 + h(i, k + 2) * 4 };
  });
  const clip = (lado: -1 | 1) => `M${lado * (r + 40)} ${-r - 40} L${-4} ${-r - 40} L${6} ${-r * 0.4} L${-6} ${0} L${5} ${r * 0.45} L${-3} ${r + 40} L${lado * (r + 40)} ${r + 40} Z`;
  return (
    <g transform={`translate(${alvo.x} ${alvo.y})`}>
      <defs><clipPath id={`${id}L`}><path d={clip(-1)} /></clipPath><clipPath id={`${id}R`}><path d={clip(1)} /></clipPath></defs>
      <circle r={alvo.fonte * 0.9 * Math.exp(-dt * 6)} fill={`rgba(255,235,190,${0.75 * Math.exp(-dt * 7)})`} />
      <circle r={r + 6 + dt * 360} fill="none" stroke={`rgba(255,190,110,${Math.max(0, 0.85 - dt * 1.7)})`} strokeWidth={6 * (1 - e) + 1} />
      <g opacity={fade} transform="scale(1.35)">
        <g clipPath={`url(#${id}L)`} transform={`translate(${-46 * ease} ${160 * ease * ease}) rotate(${-34 * ease})`}><Selo i={i} /></g>
        <g clipPath={`url(#${id}R)`} transform={`translate(${46 * ease} ${190 * ease * ease}) rotate(${38 * ease})`}><Selo i={i} /></g>
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
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {Array.from({ length: v.n }, (_, i) => <Lacre key={i} i={i} entra={v.entradas[i] ?? 0.3} hit={v.gatilhos[i] ?? 1e9} alvo={pos[v.idx[i]] ?? { x: 540, y: 700, fonte: 80 }} />)}
    </svg>
  );
};
