/**
 * "O fato vira cena": N lacres de cera que ENTRAM no gancho e SE QUEBRAM, cada um na palavra exata em que a ameaça é lida
 * (tempos vindos do plano). Tudo em SVG/código: gratuito e determinístico. Fica na faixa segura (longe dos ícones do TikTok).
 */
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

export interface VisualLacres { tipo: "lacres"; n: number; entradas: number[]; gatilhos: number[] }
const h = (i: number, k: number) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
const D = 96, GAP = 14, Y = 1335;

const Lacre = ({ i, x, entra, quebra }: { i: number; x: number; entra: number; quebra: number | null }) => {
  const frame = useCurrentFrame(); const { fps } = useVideoConfig(); const t = frame / fps;
  if (t < entra - 0.05) return null;
  const s = spring({ frame: frame - Math.round(entra * fps), fps, config: { damping: 9, mass: 0.6, stiffness: 220 } });
  const dt = quebra === null ? -1 : t - quebra;
  const flutua = Math.sin(t * 2.2 + i) * 3;
  const brilho = 0.55 + 0.35 * Math.sin(t * 3 + i * 1.3);
  const r = D / 2;
  const id = `l${i}`;
  const base = (
    <g>
      <circle r={r + 7} fill={`rgba(255,70,50,${0.18 * brilho})`} />
      <path d={`M0 ${-r} ${Array.from({ length: 24 }, (_, k) => { const a = (k / 24) * Math.PI * 2, rr = r * (0.93 + 0.07 * h(i, k)); return `L${(Math.sin(a) * rr).toFixed(1)} ${(-Math.cos(a) * rr).toFixed(1)}`; }).join(" ")} Z`} fill={`url(#${id}g)`} stroke="#4a0a08" strokeWidth="3" />
      <circle r={r * 0.68} fill="none" stroke="rgba(255,190,160,0.55)" strokeWidth="2.5" />
      <path d={`M0 ${-r * 0.36} L${r * 0.11} ${-r * 0.1} L${r * 0.38} ${-r * 0.1} L${r * 0.16} ${r * 0.08} L${r * 0.25} ${r * 0.36} L0 ${r * 0.2} L${-r * 0.25} ${r * 0.36} L${-r * 0.16} ${r * 0.08} L${-r * 0.38} ${-r * 0.1} L${-r * 0.11} ${-r * 0.1} Z`} fill="rgba(70,6,6,0.75)" />
    </g>
  );
  const defs = (
    <defs>
      <radialGradient id={`${id}g`} cx="35%" cy="30%" r="80%"><stop offset="0" stopColor="#ff6a55" /><stop offset=".55" stopColor="#c0211c" /><stop offset="1" stopColor="#5e0b0b" /></radialGradient>
      <clipPath id={`${id}L`}><path d={`M${-r - 20} ${-r - 20} L${-4} ${-r - 20} L${6} ${-r * 0.4} L${-6} ${0} L${5} ${r * 0.45} L${-3} ${r + 20} L${-r - 20} ${r + 20} Z`} /></clipPath>
      <clipPath id={`${id}R`}><path d={`M${r + 20} ${-r - 20} L${-4} ${-r - 20} L${6} ${-r * 0.4} L${-6} ${0} L${5} ${r * 0.45} L${-3} ${r + 20} L${r + 20} ${r + 20} Z`} /></clipPath>
    </defs>
  );
  const appear = Math.min(1, Math.max(0, s));
  if (dt < 0) return <g transform={`translate(${x} ${Y + flutua}) scale(${appear})`}>{defs}{base}</g>;
  // quebra: duas metades se afastam e caem; brasas e anel de choque
  const e = Math.min(1, dt / 0.9), ease = 1 - (1 - e) ** 3;
  const fade = 1 - Math.min(1, Math.max(0, (dt - 0.35) / 0.65));
  const brasas = Array.from({ length: 16 }, (_, k) => {
    const a = h(i, k + 5) * Math.PI * 2, v = 90 + h(i, k + 9) * 210, life = Math.min(1, dt / (0.6 + h(i, k) * 0.7));
    return { x: Math.cos(a) * v * life, y: Math.sin(a) * v * life + 260 * life * life, o: (1 - life) * (dt > 0 ? 1 : 0), r: 2 + h(i, k + 2) * 3.5 };
  });
  return (
    <g transform={`translate(${x} ${Y})`}>
      {defs}
      <circle r={r + 8 + dt * 220} fill="none" stroke={`rgba(255,170,90,${Math.max(0, 0.7 - dt * 1.6)})`} strokeWidth={5 * (1 - e) + 1} />
      <g opacity={fade}>
        <g clipPath={`url(#${id}L)`} transform={`translate(${-34 * ease} ${130 * ease * ease}) rotate(${-24 * ease})`}>{base}</g>
        <g clipPath={`url(#${id}R)`} transform={`translate(${34 * ease} ${150 * ease * ease}) rotate(${28 * ease})`}>{base}</g>
      </g>
      <circle r={r * 0.62} fill="none" stroke={`rgba(150,40,30,${0.55 * (1 - fade) + 0.15})`} strokeWidth="2.5" strokeDasharray="5 6" />
      {brasas.map((b, k) => <circle key={k} cx={b.x} cy={b.y} r={b.r} fill="#ffb454" opacity={Math.max(0, b.o)} />)}
    </g>
  );
};

export const Lacres = ({ v }: { v: VisualLacres }) => {
  const total = v.n * (D + GAP) - GAP, x0 = 540 - total / 2 + D / 2;
  return (
    <svg viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      {Array.from({ length: v.n }, (_, i) => <Lacre key={i} i={i} x={x0 + i * (D + GAP)} entra={v.entradas[i] ?? 0.3} quebra={v.gatilhos[i] ?? null} />)}
    </svg>
  );
};
