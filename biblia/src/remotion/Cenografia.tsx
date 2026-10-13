/**
 * Cenografia desenhada (sem imagens externas): ambientes completos em SVG 1080×1920 com luz e volume.
 * Peças reaproveitáveis (céu, lua, estrelas, cidade antiga, palmeira, pessoa ajoelhada, rei, leão, cova,
 * feixe de luz, chuva na vidraça) e cenas montadas com elas. Cada cena tem câmera com intenção e reage
 * ao clímax (luz que se abre). Tudo determinístico.
 */
import { useMemo, type ReactNode } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { prng } from "../pipeline/engine";

const W = 1080, H = 1920;

// ───────────────────────────── peças ─────────────────────────────

const Estrelas = ({ n, y1, t, seed }: { n: number; y1: number; t: number; seed: number }) => {
  const ps = useMemo(() => { const r = prng(seed); return Array.from({ length: n }, () => ({ x: r() * W, y: r() * y1, s: 0.8 + r() * 2.2, f: r() * 6.3, v: 0.6 + r() * 1.8 })); }, [n, y1, seed]);
  return <g>{ps.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.s} fill="#fff" opacity={0.3 + 0.6 * (0.5 + 0.5 * Math.sin(t * p.v + p.f))} />)}</g>;
};

const Lua = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <g>
    <circle cx={x} cy={y} r={r * 7} fill="url(#halo)" />
    <circle cx={x} cy={y} r={r} fill="#f3f0e2" />
    <circle cx={x - r * 0.3} cy={y - r * 0.2} r={r * 0.22} fill="#d9d4c0" opacity={0.6} />
    <circle cx={x + r * 0.35} cy={y + r * 0.3} r={r * 0.15} fill="#d9d4c0" opacity={0.5} />
  </g>
);

/** Muralha com ameias + torres + zigurate, em silhueta, com janelinhas acesas. */
const CidadeAntiga = ({ base, cor, t, seed, luzes = true }: { base: number; cor: string; t: number; seed: number; luzes?: boolean }) => {
  const r = useMemo(() => prng(seed), [seed]);
  const janelas = useMemo(() => Array.from({ length: 26 }, () => [40 + r() * 1000, base - 20 - r() * 140, r() * 6.3] as [number, number, number]), [r, base]);
  let ameias = `M-20 ${base + 400} L-20 ${base - 120}`;
  for (let x = -20; x < W + 40; x += 44) ameias += ` L${x} ${base - 120} L${x} ${base - 140} L${x + 22} ${base - 140} L${x + 22} ${base - 120}`;
  ameias += ` L${W + 40} ${base - 120} L${W + 40} ${base + 400} Z`;
  return (
    <g>
      {/* zigurate ao fundo */}
      <g fill={cor} opacity={0.75}>
        {[0, 1, 2, 3].map((i) => <rect key={i} x={170 + i * 45} y={base - 300 - i * 70} width={420 - i * 90} height={80} />)}
        <rect x={335} y={base - 600} width={90} height={60} />
      </g>
      <rect x={760} y={base - 330} width={70} height={300} fill={cor} opacity={0.8} />
      <rect x={90} y={base - 260} width={60} height={240} fill={cor} opacity={0.8} />
      <path d={ameias} fill={cor} />
      {luzes && janelas.map(([x, y, f], i) => <rect key={i} x={x} y={y} width={9} height={13} fill="#ffcc77" opacity={0.25 + 0.55 * (0.5 + 0.5 * Math.sin(t * 0.9 + f))} />)}
    </g>
  );
};

const Palmeira = ({ x, base, h, cor, t }: { x: number; base: number; h: number; cor: string; t: number }) => {
  const topo: [number, number] = [x + h * 0.12, base - h];
  const balanco = Math.sin(t * 0.8 + x) * 4;
  return (
    <g fill={cor}>
      <path d={`M${x - 9} ${base} Q${x + h * 0.02} ${base - h * 0.5} ${topo[0] - 4} ${topo[1]} L${topo[0] + 4} ${topo[1]} Q${x + h * 0.07} ${base - h * 0.5} ${x + 9} ${base} Z`} />
      {[-150, -115, -70, -30, 15, 50, 90].map((a, i) => {
        const ang = ((a + balanco) * Math.PI) / 180, L = h * 0.42;
        const ex = topo[0] + Math.cos(ang) * L, ey = topo[1] + Math.sin(ang) * L * 0.55 + L * 0.35;
        const cx = topo[0] + Math.cos(ang) * L * 0.5, cy = topo[1] - L * 0.25;
        return <path key={i} d={`M${topo[0]} ${topo[1]} Q${cx} ${cy - 18} ${ex} ${ey} Q${cx} ${cy + 6} ${topo[0]} ${topo[1] + 8} Z`} />;
      })}
    </g>
  );
};

/** Pessoa ajoelhada orando (olhando para a direita). `aro` = cor da luz de contorno. */
export const Ajoelhado = ({ x, y, s, cor, aro, maos = 0.5 }: { x: number; y: number; s: number; cor: string; aro?: string; maos?: number }) => {
  const corpo = "M-62 0 Q-74 -58 -46 -112 Q-24 -152 8 -154 Q38 -146 44 -104 L58 -40 Q92 -22 96 0 Z";
  const braco = `M26 -132 Q${52 + maos * 10} ${-150 - maos * 40} ${66 + maos * 6} ${-170 - maos * 50}`;
  const formas = (f: string, extra = 0) => (
    <>
      <path d={corpo} fill={f} stroke={extra ? f : "none"} strokeWidth={extra} />
      <path d="M-6 -176 Q-6 -214 22 -214 Q50 -212 48 -180 Q46 -150 22 -150 Q-4 -152 -6 -176 Z" fill={f} stroke={extra ? f : "none"} strokeWidth={extra} />
      <path d="M-14 -178 Q-12 -226 24 -224 Q56 -220 52 -176 L44 -150 Q30 -196 -14 -150 Z" fill={f} stroke={extra ? f : "none"} strokeWidth={extra} />
      <path d={braco} stroke={f} strokeWidth={18 + extra} strokeLinecap="round" fill="none" />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {aro && <g opacity={0.8}>{formas(aro, 6)}</g>}
      {formas(cor)}
    </g>
  );
};

/** Rei em pé, com coroa, braço estendido (olhando para a esquerda). */
const Rei = ({ x, y, s, cor, aro }: { x: number; y: number; s: number; cor: string; aro?: string }) => {
  const manto = "M-58 0 Q-52 -140 -30 -230 Q0 -262 30 -232 Q52 -140 60 0 Z";
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {aro && <g fill={aro} stroke={aro} strokeWidth={6} opacity={0.8}><path d={manto} /><circle cx={0} cy={-268} r={30} /><path d="M-24 -214 Q-80 -214 -120 -236" strokeWidth={26} fill="none" strokeLinecap="round" /></g>}
      <path d={manto} fill={cor} />
      <circle cx={0} cy={-268} r={30} fill={cor} />
      <path d="M-28 -288 L-30 -322 L-14 -304 L0 -330 L14 -304 L30 -322 L28 -288 Z" fill="#c99a3c" />
      <path d="M-24 -214 Q-80 -214 -120 -236" stroke={cor} strokeWidth={20} strokeLinecap="round" fill="none" />
    </g>
  );
};

/** Leão deitado (cabeça à esquerda) com olhos que brilham e piscam. */
const Leao = ({ x, y, s, cor, aro, t, seed, olhos = 1 }: { x: number; y: number; s: number; cor: string; aro?: string; t: number; seed: number; olhos?: number }) => {
  const juba = useMemo(() => {
    let d = ""; const n = 24, cx = -112, cy = -118;
    for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, r = i % 2 ? 70 : 92; d += `${i ? "L" : "M"}${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r * 0.95).toFixed(1)} `; }
    return d + "Z";
  }, []);
  const pisca = (Math.sin(t * 0.7 + seed * 3) > 0.985 ? 0.1 : 1) * olhos;
  const resp = 1 + 0.015 * Math.sin(t * 1.6 + seed);
  const corpo = (
    <>
      <ellipse cx={40} cy={-70} rx={150} ry={62 * resp} />
      <ellipse cx={150} cy={-66} rx={72} ry={60} />
      <path d="M-90 -34 L-176 -20 Q-196 -12 -186 0 L-70 0 Z" />
      <path d="M120 -20 L160 -4 Q150 4 100 2 Z" />
      <path d={juba} />
      <circle cx={-128} cy={-118} r={44} />
      <ellipse cx={-168} cy={-102} rx={30} ry={22} />
      <path d={`M210 -44 Q${266 + Math.sin(t * 1.3 + seed) * 10} -26 252 -4`} stroke="currentColor" strokeWidth={10} fill="none" strokeLinecap="round" />
    </>
  );
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {aro && <g fill={aro} stroke={aro} strokeWidth={7} opacity={0.75} color={aro}>{corpo}</g>}
      <g fill={cor} color={cor}>{corpo}</g>
      <g opacity={pisca}>
        <circle cx={-150} cy={-126} r={14} fill="#ffb84a" opacity={0.25} />
        <circle cx={-124} cy={-130} r={14} fill="#ffb84a" opacity={0.25} />
        <ellipse cx={-150} cy={-126} rx={5} ry={4} fill="#ffcf6a" />
        <ellipse cx={-124} cy={-130} rx={5} ry={4} fill="#ffcf6a" />
      </g>
    </g>
  );
};

/** Pares de olhos na escuridão (leões ao fundo). */
const OlhosNoEscuro = ({ pares, t }: { pares: [number, number, number][]; t: number }) => (
  <g>{pares.map(([x, y, s], i) => {
    const on = Math.sin(t * 0.5 + i * 2.1) > 0.93 ? 0.15 : 1;
    return <g key={i} opacity={on * 0.9}>
      <circle cx={x} cy={y} r={11 * s} fill="#ff9a30" opacity={0.25} /><circle cx={x + 26 * s} cy={y - 2} r={11 * s} fill="#ff9a30" opacity={0.25} />
      <ellipse cx={x} cy={y} rx={4.5 * s} ry={3.5 * s} fill="#ffc35a" /><ellipse cx={x + 26 * s} cy={y - 2} rx={4.5 * s} ry={3.5 * s} fill="#ffc35a" />
    </g>;
  })}</g>
);

/** Poeira suspensa dentro de um feixe de luz (trapézio de cima para baixo). */
const PoeiraNoFeixe = ({ topo, base, y0, y1, t, n = 50, cor = "#ffe9b0" }: { topo: [number, number]; base: [number, number]; y0: number; y1: number; t: number; n?: number; cor?: string }) => {
  const ps = useMemo(() => { const r = prng(9); return Array.from({ length: n }, () => ({ u: r(), v: r(), s: 1 + r() * 3, sp: 6 + r() * 16, f: r() * 6.3 })); }, [n]);
  return <g>{ps.map((p, i) => {
    const v = (p.v + (t * p.sp) / (y1 - y0) * 0.6) % 1, y = y0 + v * (y1 - y0);
    const a = topo[0] + (base[0] - topo[0]) * v, b = topo[1] + (base[1] - topo[1]) * v;
    const x = a + (b - a) * p.u + Math.sin(t * 0.7 + p.f) * 10;
    return <circle key={i} cx={x} cy={y} r={p.s} fill={cor} opacity={0.25 + 0.5 * (0.5 + 0.5 * Math.sin(t * 1.4 + p.f))} />;
  })}</g>;
};

const Defs = () => (
  <defs>
    <radialGradient id="halo"><stop offset="0" stopColor="#dfe6ff" stopOpacity="0.55" /><stop offset="0.3" stopColor="#9fb0e0" stopOpacity="0.18" /><stop offset="1" stopColor="#9fb0e0" stopOpacity="0" /></radialGradient>
    <radialGradient id="chamaGlow"><stop offset="0" stopColor="#ffb45a" stopOpacity="0.85" /><stop offset="0.35" stopColor="#ff8a30" stopOpacity="0.3" /><stop offset="1" stopColor="#ff8a30" stopOpacity="0" /></radialGradient>
    <radialGradient id="ouroGlow"><stop offset="0" stopColor="#ffe3a0" stopOpacity="0.95" /><stop offset="0.4" stopColor="#ffc860" stopOpacity="0.35" /><stop offset="1" stopColor="#ffc860" stopOpacity="0" /></radialGradient>
    <linearGradient id="feixeLua" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8d6ff" stopOpacity="0.42" /><stop offset="1" stopColor="#c8d6ff" stopOpacity="0.05" /></linearGradient>
    <linearGradient id="feixeOuro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffe6a8" stopOpacity="0.75" /><stop offset="1" stopColor="#ffd070" stopOpacity="0.08" /></linearGradient>
    <linearGradient id="rocha" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1a1714" /><stop offset="1" stopColor="#070605" /></linearGradient>
  </defs>
);

/** Câmera: interpola centro/zoom e aplica ao conteúdo (o SVG é desenhado em 1080×1920). */
const Camera = ({ de, para, p, children }: { de: [number, number, number]; para: [number, number, number]; p: number; children: ReactNode }) => {
  const e = Easing.inOut(Easing.sin)(p);
  const [x, y, z] = de.map((v, i) => v + (para[i] - v) * e);
  return <g transform={`translate(${W / 2} ${H / 2}) scale(${z}) translate(${-x} ${-y})`}>{children}</g>;
};

// ───────────────────────────── cenas ─────────────────────────────

interface CenaProps { t: number; p: number; variante?: string; climax: number; brilho: number }

/** Daniel ajoelhado na janela aberta, de noite, com a Babilônia lá fora. */
const JanelaBabilonia = ({ t, p, variante }: CenaProps) => {
  const chama = 0.8 + 0.12 * Math.sin(t * 12) + 0.08 * Math.sin(t * 27);
  const de: [number, number, number] = variante === "perto" ? [600, 1150, 1.25] : variante === "volta" ? [600, 1120, 1.3] : [540, 960, 1.0];
  const para: [number, number, number] = variante === "perto" ? [640, 1180, 1.42] : variante === "volta" ? [540, 960, 1.0] : [560, 1000, 1.14];
  return (
    <Camera de={de} para={para} p={p}>
      <rect width={W} height={H} fill="url(#ceuNoite)" />
      <defs><linearGradient id="ceuNoite" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#040817" /><stop offset="0.55" stopColor="#14224a" /><stop offset="0.72" stopColor="#3b3a62" /><stop offset="1" stopColor="#1a1830" /></linearGradient>
        <linearGradient id="parede" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a2416" /><stop offset="0.5" stopColor="#1c120c" /><stop offset="1" stopColor="#0b0806" /></linearGradient></defs>
      <Estrelas n={90} y1={1000} t={t} seed={3} />
      <Lua x={740} y={560} r={62} />
      <CidadeAntiga base={1300} cor="#0b1024" t={t} seed={5} />
      <Palmeira x={880} base={1320} h={330} cor="#070a18" t={t} />
      <Palmeira x={230} base={1330} h={260} cor="#070a18" t={t + 2} />
      {/* parede do quarto com a janela em arco */}
      <path fillRule="evenodd" fill="url(#parede)" d={`M0 0 H${W} V${H} H0 Z M190 1460 V700 Q190 400 540 400 Q890 400 890 700 V1460 Z`} />
      <path d="M190 1460 V700 Q190 400 540 400 Q890 400 890 700 V1460" fill="none" stroke="#5a3a22" strokeWidth={10} opacity={0.6} />
      <rect x={150} y={1460} width={780} height={40} fill="#2a1a10" />
      {/* lamparina no peitoril e sua luz quente */}
      <circle cx={250} cy={1430} r={360 * chama} fill="url(#chamaGlow)" />
      <path d="M215 1460 Q250 1430 285 1460 Z" fill="#6a4020" />
      <path d={`M250 1438 Q${240 + Math.sin(t * 9) * 3} 1410 ${250 + Math.sin(t * 7) * 4} ${1392 - chama * 8} Q${262} 1414 250 1438 Z`} fill="#ffd27a" />
      {/* Daniel ajoelhado, recortado pela lua e tocado pela lamparina */}
      <Ajoelhado x={560} y={1640} s={1.45} cor="#090605" aro="#ffb46a" maos={0.7 + 0.08 * Math.sin(t * 0.6)} />
      <rect y={1700} width={W} height={220} fill="#060403" />
    </Camera>
  );
};

/** A cova: rocha, abertura no alto com a pedra, feixe de luz, leões e Daniel no centro da luz. */
const Cova = ({ t, p, variante, climax }: CenaProps) => {
  const ouro = variante === "anjo" ? Math.min(1, climax) : 0;          // a luz vira ouro no clímax
  const de: [number, number, number] = variante === "queda" ? [540, 700, 1.25] : variante === "anjo" ? [540, 1150, 1.15] : [540, 1050, 1.05];
  const para: [number, number, number] = variante === "queda" ? [540, 1100, 1.05] : variante === "anjo" ? [540, 1000, 1.35] : [560, 1150, 1.2];
  const pedra = variante === "queda" ? interpolate(p, [0, 0.6], [140, 0], { extrapolateRight: "clamp" }) : 0; // a pedra fecha
  const larg = 120 + ouro * 70;
  const topo: [number, number] = [540 - larg, 540 + larg], base: [number, number] = [540 - 330 - ouro * 160, 540 + 330 + ouro * 160];
  return (
    <Camera de={de} para={para} p={p}>
      <rect width={W} height={H} fill="url(#rocha)" />
      {/* céu visto pela abertura */}
      <ellipse cx={540} cy={330} rx={150} ry={60} fill={ouro > 0.05 ? "#ffe9b8" : "#9db2ea"} />
      <ellipse cx={540 + pedra} cy={318} rx={135} ry={52} fill="#141210" opacity={variante === "queda" ? 1 : 0.92} />
      {/* paredes de pedra */}
      <path d="M0 0 H1080 V260 Q900 230 760 300 Q690 330 540 270 Q400 330 320 300 Q170 240 0 290 Z" fill="#0e0c0a" />
      <path d="M0 290 Q120 600 80 1000 Q40 1400 120 1920 H0 Z" fill="#0c0a09" />
      <path d="M1080 300 Q930 640 990 1050 Q1050 1450 960 1920 H1080 Z" fill="#0c0a09" />
      {/* feixe de luz da abertura até o chão */}
      <polygon points={`${topo[0]},360 ${topo[1]},360 ${base[1]},1640 ${base[0]},1640`} fill={ouro > 0.05 ? "url(#feixeOuro)" : "url(#feixeLua)"} opacity={0.85 + ouro * 0.15} />
      <ellipse cx={540} cy={1650} rx={360 + ouro * 160} ry={70} fill={ouro > 0.05 ? "#ffd987" : "#9fb4ea"} opacity={0.22 + ouro * 0.35} />
      <PoeiraNoFeixe topo={[topo[0], topo[1]]} base={[base[0], base[1]]} y0={380} y1={1620} t={t} cor={ouro > 0.05 ? "#fff0c0" : "#dfe8ff"} />
      <OlhosNoEscuro pares={[[150, 1250, 1], [880, 1180, 0.8], [210, 980, 0.6], [900, 1420, 1.1]]} t={t} />
      {/* leões nas bordas da luz */}
      <Leao x={330} y={1700} s={1.05} cor="#0c0907" aro={ouro > 0.05 ? "#ffd27a" : "#8aa2e0"} t={t} seed={1} olhos={1 - ouro} />
      <g transform="translate(1080 0) scale(-1 1)"><Leao x={300} y={1745} s={0.95} cor="#0b0806" aro={ouro > 0.05 ? "#ffd27a" : "#8aa2e0"} t={t + 3} seed={2} olhos={1 - ouro} /></g>
      <Ajoelhado x={540} y={1650} s={1.25} cor="#0a0806" aro={ouro > 0.05 ? "#ffe2a0" : "#c4d2ff"} maos={0.5 + ouro * 0.5} />
      {ouro > 0.01 && <circle cx={540} cy={340} r={520 * ouro} fill="url(#ouroGlow)" opacity={ouro} />}
      <rect y={1760} width={W} height={160} fill="#050403" />
    </Camera>
  );
};

/** Amanhecer: o rei corre até a boca da cova; sol nascendo atrás do palácio. */
const Amanhecer = ({ t, p, variante }: CenaProps) => {
  const de: [number, number, number] = [520, 1050, 1.12], para: [number, number, number] = variante === "perto" ? [480, 1250, 1.45] : [540, 1000, 1.0];
  return (
    <Camera de={de} para={para} p={p}>
      <defs><linearGradient id="ceuAurora" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b2350" /><stop offset="0.45" stopColor="#7a4a6a" /><stop offset="0.66" stopColor="#f08a4a" /><stop offset="0.8" stopColor="#ffd08a" /><stop offset="1" stopColor="#5a3020" /></linearGradient></defs>
      <rect width={W} height={H} fill="url(#ceuAurora)" />
      <Estrelas n={25} y1={500} t={t} seed={11} />
      <circle cx={760} cy={1270} r={420} fill="url(#ouroGlow)" />
      <circle cx={760} cy={1270} r={95} fill="#fff1c8" />
      <CidadeAntiga base={1330} cor="#3a1e22" t={t} seed={7} luzes={false} />
      <Palmeira x={120} base={1380} h={300} cor="#2a1416" t={t} />
      {/* monte com a boca da cova e a pedra */}
      <path d="M-40 1920 L-40 1480 Q240 1330 560 1400 Q860 1460 1120 1440 L1120 1920 Z" fill="#24120e" />
      <ellipse cx={360} cy={1560} rx={150} ry={70} fill="#070404" />
      <ellipse cx={560} cy={1540} rx={120} ry={60} fill="#3a2018" />
      <path d="M440 1520 Q560 1470 680 1520" stroke="#ffb070" strokeWidth={4} fill="none" opacity={0.6} />
      <Rei x={640 - (variante === "perto" ? 0 : p * 40)} y={1600} s={1.2} cor="#160a08" aro="#ffb878" />
      <path d="M640 1600 L1100 1680 L1100 1720 Z" fill="#000" opacity={0.25} />
      <rect y={1760} width={W} height={160} fill="#160a08" />
    </Camera>
  );
};

/** Ato 3: quarto moderno à noite, chuva na vidraça, cidade desfocada, pessoa sentada com o celular. */
const QuartoChuva = ({ t, p, variante, climax }: CenaProps) => {
  const amanhece = variante === "luz" ? Math.min(1, p * 1.2 + climax * 0.5) : 0;
  const gotas = useMemo(() => { const r = prng(21); return Array.from({ length: 70 }, () => ({ x: 170 + r() * 740, y: r(), v: 0.05 + r() * 0.12, s: 2 + r() * 4 })); }, []);
  const bokeh = useMemo(() => { const r = prng(22); return Array.from({ length: 34 }, () => ({ x: 180 + r() * 720, y: 600 + r() * 700, r: 10 + r() * 26, c: ["#ffcf7a", "#ff8a5a", "#7ab8ff", "#ffe0a0"][Math.floor(r() * 4)] })); }, []);
  const de: [number, number, number] = [540, 1000, 1.05], para: [number, number, number] = variante === "luz" ? [540, 950, 1.0] : [540, 1080, 1.2];
  return (
    <Camera de={de} para={para} p={p}>
      <defs><linearGradient id="ceuCidade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={amanhece ? "#2a2a52" : "#06081a"} /><stop offset="0.7" stopColor={amanhece ? "#d08a5a" : "#141a38"} /><stop offset="1" stopColor={amanhece ? "#ffcf8a" : "#1a1630"} />
      </linearGradient></defs>
      <rect width={W} height={H} fill="#0c0c14" />
      <rect x={170} y={420} width={740} height={1000} fill="url(#ceuCidade)" />
      {[[180, 980, 120], [300, 860, 90], [400, 1040, 130], [560, 900, 110], [690, 1000, 100], [800, 880, 110]].map(([x, y, w], i) => <rect key={`p${i}`} x={x} y={y} width={w} height={600} fill="#0a0c1c" opacity={0.85} />)}
      {bokeh.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={b.c} opacity={(0.18 + 0.12 * Math.sin(t + i)) * (1 - amanhece * 0.6)} />)}
      {amanhece > 0.01 && <circle cx={760} cy={1300} r={600} fill="url(#ouroGlow)" opacity={amanhece} />}
      {gotas.map((g, i) => {
        const y = 420 + (((g.y + t * g.v) % 1) * 1000);
        return <g key={i}><line x1={g.x} y1={y - 26} x2={g.x} y2={y} stroke="#cfe0ff" strokeWidth={1.5} opacity={0.25} /><circle cx={g.x} cy={y} r={g.s} fill="#dfe8ff" opacity={0.35} /></g>;
      })}
      {/* caixilho */}
      <path fillRule="evenodd" fill="#101018" d={`M0 0 H${W} V${H} H0 Z M170 420 H910 V1420 H170 Z`} />
      <rect x={530} y={420} width={20} height={1000} fill="#15151f" /><rect x={170} y={900} width={740} height={18} fill="#15151f" />
      {/* cama e pessoa sentada, cabeça baixa, luz do celular */}
      <rect x={-20} y={1500} width={1120} height={120} rx={20} fill="#191927" />
      <g transform="translate(560 1520)">
        <path d="M-70 0 Q-80 -120 -40 -190 Q0 -230 40 -190 Q80 -120 70 0 Z" fill="#07070c" />
        <circle cx={variante === "luz" ? 6 : 14} cy={variante === "luz" ? -236 : -222} r={36} fill="#07070c" />
        {variante !== "luz" && <><rect x={30} y={-150} width={26} height={44} rx={5} fill="#9fc0ff" opacity={0.9} /><circle cx={42} cy={-140} r={110} fill="#9fc0ff" opacity={0.12} /></>}
        <path d="M-70 0 Q-80 -120 -40 -190 Q0 -230 40 -190 Q80 -120 70 0" fill="none" stroke={amanhece ? "#ffcf8a" : "#5a6aa0"} strokeWidth={3} opacity={0.7} />
      </g>
      <rect y={1620} width={W} height={300} fill="#08080e" />
    </Camera>
  );
};

const CENAS: Record<string, (p: CenaProps) => JSX.Element> = {
  janela_babilonia: JanelaBabilonia, cova_leoes: Cova, amanhecer_cova: Amanhecer, quarto_chuva: QuartoChuva,
};
export const CENAS_DISPONIVEIS = Object.keys(CENAS);

export const Cenografia = ({ cena, variante, duracaoQuadros, climaxQuadro }: { cena: string; variante?: string; duracaoQuadros: number; climaxQuadro?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = interpolate(frame, [0, Math.max(1, duracaoQuadros - 1)], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const k = climaxQuadro === undefined ? -1 : frame - climaxQuadro;
  const climax = k < 0 ? 0 : Math.min(1, k / 8);                       // sobe em ~0,25 s e fica
  const brilho = k < 0 ? 0 : Math.exp(-k / 6);                          // clarão curto
  const C = CENAS[cena] ?? CENAS.cova_leoes;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs />
        <C t={t} p={p} variante={variante} climax={climax} brilho={brilho} />
      </svg>
      {brilho > 0.01 && <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 22%, rgba(255,226,150,1), rgba(255,190,90,0) 65%)", opacity: brilho * 0.7, mixBlendMode: "screen" }} />}
    </AbsoluteFill>
  );
};
