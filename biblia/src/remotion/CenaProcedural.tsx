/**
 * Cena 100 % procedural (sem Replicate nem Pexels): céu em degradê, astro com raios de luz, nuvens,
 * paisagem em camadas com parallax (montanhas, dunas, mar, cidade, fogueira, caverna), clima
 * (chuva, vento, brasas, estrelas) e RAIOS que também caem no instante da palavra de clímax.
 * Tudo é determinístico (mesma semente → mesmo quadro), então o render é reproduzível.
 */
import { useMemo } from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { prng } from "../pipeline/engine";

export type Cenario = "deserto" | "montanha" | "mar" | "noite" | "fogueira" | "caverna" | "cidade";
export type Clima = "tempestade" | "chuva" | "vento" | "fogo" | "estrelas" | "raios" | "brasas";

const W = 1080, H = 1920;

interface Paleta { topo: string; meio: string; hor: string; astro: string; sil: [string, string, string]; neblina: string }
const PALETAS: Record<Cenario, Paleta> = {
  deserto: { topo: "#150c1c", meio: "#7a2f1d", hor: "#f2a550", astro: "#ffe0a8", sil: ["#5a2a1a", "#341a10", "#160b07"], neblina: "#d98a4a" },
  montanha: { topo: "#091226", meio: "#2c3f66", hor: "#d49a64", astro: "#ffe9c4", sil: ["#3d4d6c", "#222d45", "#0c111d"], neblina: "#8da0c4" },
  mar: { topo: "#040a16", meio: "#12303f", hor: "#c28958", astro: "#ffe5bd", sil: ["#102a3c", "#0a1c2b", "#050e17"], neblina: "#5f8ea6" },
  noite: { topo: "#02040b", meio: "#0a1838", hor: "#2a4472", astro: "#e4ecff", sil: ["#101b33", "#0a1325", "#04070e"], neblina: "#4a66a0" },
  fogueira: { topo: "#030208", meio: "#1b0f20", hor: "#6a2a14", astro: "#ffb866", sil: ["#241619", "#150c0f", "#070405"], neblina: "#7a3a22" },
  caverna: { topo: "#020204", meio: "#0e1219", hor: "#2d3644", astro: "#a8c8ff", sil: ["#171b24", "#0d1017", "#050608"], neblina: "#4a5a70" },
  cidade: { topo: "#03050c", meio: "#0f1832", hor: "#3d2c52", astro: "#d4deff", sil: ["#1a2240", "#0e1428", "#05070f"], neblina: "#5a5a96" },
};

/** Linha de crista (montanha/duna) como path SVG fechado, com largura extra para o parallax. */
function crista(seed: number, base: number, amp: number, pico: boolean, largura = 1560, passos = 90): string {
  const r = prng(seed);
  const fs = [0.0042 + r() * 0.002, 0.0105 + r() * 0.004, 0.026 + r() * 0.01], ps = [r() * 6.28, r() * 6.28, r() * 6.28];
  let d = `M0 ${H} L0 ${base}`;
  for (let i = 0; i <= passos; i++) {
    const x = (i * largura) / passos;
    let n = Math.sin(x * fs[0] + ps[0]) * 0.55 + Math.sin(x * fs[1] + ps[1]) * 0.3 + Math.sin(x * fs[2] + ps[2]) * 0.15;
    n = pico ? 1 - Math.abs(n) * 1.15 : n * 0.5 + 0.5;
    d += ` L${x.toFixed(1)} ${(base - amp * n).toFixed(1)}`;
  }
  return d + ` L${largura} ${H} Z`;
}

/** Raio por deslocamento de ponto médio; devolve o traço principal e ramos. */
function raio(seed: number, x0: number, x1: number, yFim: number): { tronco: string; ramos: string[] } {
  const r = prng(seed);
  const pts: [number, number][] = [[x0, -20], [x1, yFim]];
  let desloc = 150;
  for (let nivel = 0; nivel < 6; nivel++) {
    const novo: [number, number][] = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[i + 1];
      novo.push(pts[i], [(ax + bx) / 2 + (r() - 0.5) * desloc, (ay + by) / 2 + (r() - 0.5) * desloc * 0.35]);
    }
    novo.push(pts[pts.length - 1]);
    pts.splice(0, pts.length, ...novo);
    desloc *= 0.55;
  }
  const d = (p: [number, number][]) => p.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const ramos: string[] = [];
  for (let k = 0; k < 4; k++) {
    const i = Math.floor(pts.length * (0.15 + r() * 0.5)), sentido = r() < 0.5 ? -1 : 1;
    const ramo: [number, number][] = [pts[i]];
    let [cx, cy] = pts[i];
    for (let j = 0; j < 9; j++) { cx += sentido * (14 + r() * 26); cy += 26 + r() * 34; ramo.push([cx + (r() - 0.5) * 20, cy]); }
    ramos.push(d(ramo));
  }
  return { tronco: d(pts), ramos };
}

const Estrelas = ({ seed, t, y1 }: { seed: number; t: number; y1: number }) => {
  const ps = useMemo(() => { const r = prng(seed + 5); return Array.from({ length: 70 }, () => ({ x: r() * W, y: r() * y1, tam: 0.8 + r() * 2.2, f: r() * 6.28, v: 0.8 + r() * 2 })); }, [seed, y1]);
  return <g>{ps.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={p.tam} fill="#fff" opacity={0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * p.v + p.f))} />)}</g>;
};

const Nuvens = ({ seed, t, escuras, cor }: { seed: number; t: number; escuras: boolean; cor: string }) => {
  const ps = useMemo(() => { const r = prng(seed + 9); return Array.from({ length: 10 }, () => ({ x: r() * 1500 - 200, y: 60 + r() * 640, rx: 260 + r() * 360, ry: 70 + r() * 110, v: 6 + r() * 14, o: 0.5 + r() * 0.5 })); }, [seed]);
  return (
    <g>
      <defs>
        <radialGradient id={`nv${seed}`} cx="50%" cy="45%" r="55%">
          <stop offset="0" stopColor={escuras ? "#1a2233" : "#2a3558"} stopOpacity="0.95" />
          <stop offset="0.65" stopColor={escuras ? "#2a354d" : "#3a4672"} stopOpacity="0.6" />
          <stop offset="1" stopColor={cor} stopOpacity="0" />
        </radialGradient>
      </defs>
      {ps.map((p, i) => <ellipse key={i} cx={((p.x + t * p.v) % 1700) - 250} cy={p.y} rx={p.rx} ry={p.ry} fill={`url(#nv${seed})`} opacity={p.o} />)}
    </g>
  );
};

const Raios = ({ x, y, t, cor, forca }: { x: number; y: number; t: number; cor: string; forca: number }) => {
  const feixes = useMemo(() => { const r = prng(77); return Array.from({ length: 18 }, (_, i) => ({ ang: -80 + i * 9.5 + (r() - 0.5) * 6, larg: 12 + r() * 38, fase: r() * 6.28, v: 0.25 + r() * 0.4 })); }, []);
  return (
    <g>
      <defs>
        <linearGradient id="feixe" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={cor} stopOpacity="0.32" /><stop offset="0.7" stopColor={cor} stopOpacity="0.08" /><stop offset="1" stopColor={cor} stopOpacity="0" />
        </linearGradient>
      </defs>
      {feixes.map((f, i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${f.ang + 180 + Math.sin(t * f.v + f.fase) * 3})`} opacity={forca * (0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * f.v * 1.7 + f.fase)))}>
          <polygon points={`0,0 ${-f.larg},1900 ${f.larg},1900`} fill="url(#feixe)" />
        </g>
      ))}
    </g>
  );
};

const Chuva = ({ t, intensidade, vento }: { t: number; intensidade: number; vento: number }) => {
  const gotas = useMemo(() => { const r = prng(31); return Array.from({ length: 120 }, () => ({ x: r() * (W + 600) - 300, off: r() * H, v: 1500 + r() * 900, len: 36 + r() * 70, o: 0.15 + r() * 0.35 })); }, []);
  const inc = 0.28 + vento * 0.25;
  return (
    <g stroke="#cfe0ff" strokeLinecap="round">
      {gotas.slice(0, Math.floor(gotas.length * intensidade)).map((g, i) => {
        const y = ((g.off + t * g.v) % (H + 200)) - 100;
        const x = g.x - y * inc;
        return <line key={i} x1={x} y1={y} x2={x - g.len * inc} y2={y + g.len} strokeWidth={1.6} opacity={g.o} />;
      })}
    </g>
  );
};

const Brasas = ({ t, cx, cor }: { t: number; cx: number; cor: string }) => {
  const ps = useMemo(() => { const r = prng(61); return Array.from({ length: 45 }, () => ({ x: cx + (r() - 0.5) * 360, off: r() * 5, v: 80 + r() * 160, d: (r() - 0.5) * 80, tam: 1.5 + r() * 3.5, f: r() * 6.28 })); }, [cx]);
  return (
    <g>
      {ps.map((p, i) => {
        const ciclo = (t * p.v + p.off * 300) % 1100;
        const a = Math.max(0, 1 - ciclo / 1100) * (0.6 + 0.4 * Math.sin(t * 9 + p.f));
        return <circle key={i} cx={p.x + p.d * (ciclo / 1100) + Math.sin(t * 2 + p.f) * 18} cy={1560 - ciclo} r={p.tam * (1 - ciclo / 1500)} fill={cor} opacity={a} />;
      })}
    </g>
  );
};

const Chama = ({ t, cx, cy, escala }: { t: number; cx: number; cy: number; escala: number }) => {
  const linguas = [{ dx: 0, h: 330, w: 120, c: "#ff7a1c", f: 0 }, { dx: -55, h: 240, w: 90, c: "#ff5a12", f: 1.7 }, { dx: 58, h: 260, w: 95, c: "#ff9a2a", f: 3.1 }, { dx: 0, h: 210, w: 70, c: "#ffd36a", f: 0.9 }];
  return (
    <g transform={`translate(${cx} ${cy}) scale(${escala})`}>
      <circle r="330" cy="-120" fill="url(#brilhoFogo)" opacity={0.75 + 0.2 * Math.sin(t * 11)} />
      {linguas.map((l, i) => {
        const h = l.h * (0.88 + 0.14 * Math.sin(t * (7 + i) + l.f) + 0.06 * Math.sin(t * 17 + l.f));
        const dx = l.dx + Math.sin(t * (3 + i * 0.7) + l.f) * 14;
        return <path key={i} d={`M${dx - l.w / 2} 0 C${dx - l.w} ${-h * 0.35} ${dx - l.w * 0.2} ${-h * 0.7} ${dx + Math.sin(t * 5 + l.f) * 16} ${-h} C${dx + l.w * 0.3} ${-h * 0.65} ${dx + l.w} ${-h * 0.3} ${dx + l.w / 2} 0 Z`} fill={l.c} opacity={0.9} />;
      })}
    </g>
  );
};

interface Props {
  cenario: Cenario;
  clima: Clima[];
  seed: number;
  duracaoQuadros: number;
  /** quadros locais em que um raio deve cair (ex.: palavra de clímax) */
  raiosEm?: number[];
  /** brilho dourado no instante do clímax quando não há tempestade */
  climaxQuadro?: number;
}

export const CenaProcedural = ({ cenario, clima, seed, duracaoQuadros, raiosEm = [], climaxQuadro }: Props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const p = interpolate(frame, [0, Math.max(1, duracaoQuadros - 1)], [0, 1], { extrapolateRight: "clamp" });
  const pal = PALETAS[cenario];
  const tempestade = clima.includes("tempestade");
  const comRaios = tempestade || clima.includes("raios");
  const vento = clima.includes("vento") || tempestade ? 1 : 0;

  // — raios: os pedidos (clímax) + aleatórios periódicos quando há tempestade —
  const eventos = useMemo(() => {
    const r = prng(seed + 101), e: { f: number; x0: number; x1: number; forte: boolean }[] = [];
    if (comRaios) for (let f = 40 + Math.floor(r() * 50); f < duracaoQuadros; f += 110 + Math.floor(r() * 120)) e.push({ f, x0: 150 + r() * 780, x1: 150 + r() * 780, forte: false });
    for (const f of raiosEm) e.push({ f, x0: 300 + r() * 480, x1: 340 + r() * 400, forte: true });
    return e;
  }, [seed, comRaios, duracaoQuadros, raiosEm.join(",")]);
  let flash = 0;
  for (const ev of eventos) {
    const k = frame - ev.f;
    if (k >= 0) flash = Math.max(flash, (Math.exp(-k / 4) + (k >= 6 ? 0.65 * Math.exp(-(k - 6) / 5) : 0)) * (ev.forte ? 1 : 0.7));
  }
  const bolt = eventos.find((ev) => frame >= ev.f && frame < ev.f + 9);
  const geom = useMemo(() => (bolt ? raio(seed * 13 + bolt.f, bolt.x0, bolt.x1, 1150 + (bolt.f % 5) * 40) : null), [bolt?.f, seed]);

  // — câmera: dolly lento + deriva —
  const zoom = 1.06 + 0.16 * Easing.inOut(Easing.sin)(p);
  const dx = (seed % 2 ? 1 : -1) * 36 * (p - 0.5), dy = -22 * p;

  const camadas = useMemo(() => {
    const pico = cenario === "montanha" || cenario === "caverna" || cenario === "cidade" ? true : false;
    const bases = cenario === "deserto" ? [1180, 1330, 1500] : cenario === "mar" ? [1010, 1060, 1110] : [1110, 1290, 1480];
    const amps = cenario === "deserto" ? [120, 160, 190] : cenario === "mar" ? [60, 40, 30] : [330, 280, 220];
    return bases.map((b, i) => crista(seed * 7 + i * 31, b, amps[i], cenario === "deserto" ? false : pico || i === 0));
  }, [seed, cenario]);

  const astroX = 220 + ((seed * 197) % 640), astroY = cenario === "noite" || cenario === "caverna" ? 430 : 760;
  const horizonte = cenario === "mar" ? 1010 : 1250;
  const mostrarAstro = !tempestade && cenario !== "fogueira";
  const estrelas = clima.includes("estrelas") || cenario === "noite" || cenario === "fogueira" || cenario === "cidade";
  const climaxBrilho = climaxQuadro !== undefined && !comRaios ? Math.max(0, 1 - Math.abs(frame - climaxQuadro - 4) / 14) : 0;

  return (
    <AbsoluteFill style={{ background: pal.topo, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${dx}px, ${dy}px) scale(${zoom})` }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="ceu" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={pal.topo} /><stop offset="0.45" stopColor={pal.meio} />
              <stop offset="0.68" stopColor={pal.hor} stopOpacity={tempestade ? 0.55 : 1} /><stop offset="1" stopColor={pal.meio} />
            </linearGradient>
            <radialGradient id="glowAstro"><stop offset="0" stopColor={pal.astro} stopOpacity="0.95" /><stop offset="0.25" stopColor={pal.astro} stopOpacity="0.4" /><stop offset="1" stopColor={pal.astro} stopOpacity="0" /></radialGradient>
            <radialGradient id="brilhoFogo"><stop offset="0" stopColor="#ff9a40" stopOpacity="0.8" /><stop offset="1" stopColor="#ff5a10" stopOpacity="0" /></radialGradient>
            {pal.sil.map((c, i) => <linearGradient key={i} id={`sil${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} /><stop offset={0.55} stopColor={pal.sil[Math.min(2, i + 1)]} /><stop offset="1" stopColor={pal.sil[2]} /></linearGradient>)}
            <linearGradient id="bruma" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={pal.neblina} stopOpacity="0" /><stop offset="1" stopColor={pal.neblina} stopOpacity="0.55" /></linearGradient>
            <linearGradient id="escurecer" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#05070d" stopOpacity="0.5" /><stop offset="0.6" stopColor="#0b1018" stopOpacity="0.2" /><stop offset="1" stopColor="#05070d" stopOpacity="0.1" /></linearGradient>
          </defs>
          <rect width={W} height={H} fill="url(#ceu)" />
          {estrelas && <Estrelas seed={seed} t={t} y1={horizonte - 260} />}
          {mostrarAstro && <>
            <circle cx={astroX} cy={astroY} r={420} fill="url(#glowAstro)" />
            <circle cx={astroX} cy={astroY} r={cenario === "noite" || cenario === "caverna" || cenario === "cidade" || cenario === "mar" ? 52 : 74} fill={pal.astro} />
          </>}
          <Nuvens seed={seed} t={t} escuras={tempestade} cor={pal.meio} />
          {tempestade && <rect width={W} height={H} fill="url(#escurecer)" />}
          {mostrarAstro && <Raios x={astroX} y={astroY} t={t} cor={pal.astro} forca={cenario === "noite" ? 0.35 : 0.6} />}

          {/* paisagem em camadas, do fundo para a frente, com bruma entre elas */}
          {camadas.map((d, i) => (
            <g key={i} transform={`translate(${-(120 + i * 140) * (0.4 + p) - 60} 0)`}>
              <path d={d} fill={`url(#sil${i})`} />
              <path d={d} fill="url(#bruma)" opacity={0.42 - i * 0.14} />
            </g>
          ))}

          {tempestade && <rect width={W} height={H} fill="#060910" opacity={0.22} />}
          {cenario === "mar" && <Mar t={t} cor={pal.sil[0]} astroX={astroX} astro={pal.astro} />}
          {cenario === "cidade" && <Cidade seed={seed} t={t} cores={pal.sil} />}
          {cenario === "fogueira" && <>
            <ellipse cx={540} cy={1560} rx={460} ry={90} fill="#ff7a1c" opacity={0.18 + 0.05 * Math.sin(t * 9)} />
            <Chama t={t} cx={540} cy={1560} escala={1.15} />
            <path d="M360 1580 Q540 1520 720 1580 L760 1620 Q540 1590 320 1620 Z" fill="#0c0608" />
          </>}
          {cenario === "caverna" && <Caverna t={t} />}
          {(clima.includes("fogo") || cenario === "fogueira") && <Brasas t={t} cx={540} cor="#ffb25a" />}
          {clima.includes("brasas") && <Brasas t={t} cx={300 + (seed % 5) * 120} cor="#ff9a40" />}
          {(clima.includes("chuva") || tempestade) && <Chuva t={t} intensidade={tempestade ? 1 : 0.55} vento={vento} />}

          {/* raios */}
          {bolt && geom && (
            <g strokeLinecap="round" strokeLinejoin="round" fill="none">
              {[geom.tronco, ...geom.ramos].map((d, i) => <g key={i}>
                <path d={d} stroke="#6f8cff" strokeWidth={i ? 14 : 30} opacity={0.35 * flash} />
                <path d={d} stroke="#cfe0ff" strokeWidth={i ? 5 : 11} opacity={0.8 * Math.min(1, flash * 1.2)} />
                <path d={d} stroke="#ffffff" strokeWidth={i ? 2 : 4.5} opacity={Math.min(1, flash * 1.5)} />
              </g>)}
            </g>
          )}
        </svg>
      </div>
      {/* clarão do raio e brilho dourado do clímax (sem tempestade) */}
      <AbsoluteFill style={{ background: "#dfe8ff", opacity: Math.min(0.85, flash * 0.55), mixBlendMode: "screen", pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, rgba(255,214,120,0.9), rgba(255,170,60,0) 62%)", opacity: climaxBrilho * 0.75, mixBlendMode: "screen", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};

const Mar = ({ t, cor, astroX, astro }: { t: number; cor: string; astroX: number; astro: string }) => {
  const ondas = [0, 1, 2, 3, 4].map((i) => {
    const y0 = 1030 + i * 90, amp = 8 + i * 7, comp = 0.012 - i * 0.0012, v = 0.8 + i * 0.35;
    let d = `M-20 ${H} L-20 ${y0}`;
    for (let x = -20; x <= W + 20; x += 24) d += ` L${x} ${(y0 + Math.sin(x * comp + t * v + i * 2) * amp + Math.sin(x * comp * 2.3 - t * v * 1.4) * amp * 0.4).toFixed(1)}`;
    return d + ` L${W + 20} ${H} Z`;
  });
  return (
    <g>
      {ondas.map((d, i) => <path key={i} d={d} fill={cor} opacity={0.55 + i * 0.1} />)}
      <g>
        {Array.from({ length: 26 }, (_, i) => <rect key={i} x={astroX - 90 + ((i * 53) % 180) + Math.sin(t * 2 + i) * 14} y={1040 + i * 26} width={60 - i * 1.6} height={5} rx={2} fill={astro} opacity={0.45 * (0.5 + 0.5 * Math.sin(t * 3 + i * 1.3)) * (1 - i / 30)} />)}
      </g>
    </g>
  );
};

const Cidade = ({ seed, t, cores }: { seed: number; t: number; cores: string[] }) => {
  const pred = useMemo(() => { const r = prng(seed + 17); const out: { x: number; w: number; h: number; j: [number, number][] }[] = []; let x = -20; while (x < W + 40) { const w = 70 + r() * 110, h = 260 + r() * 520; const j: [number, number][] = []; for (let a = 0; a < 26; a++) if (r() < 0.45) j.push([r(), r()]); out.push({ x, w, h, j }); x += w + r() * 6; } return out; }, [seed]);
  return (
    <g>
      {pred.map((b, i) => (
        <g key={i}>
          <rect x={b.x} y={1480 - b.h} width={b.w} height={b.h + 500} fill={cores[i % 2 ? 1 : 2]} />
          {b.j.map(([jx, jy], k) => <rect key={k} x={b.x + 10 + jx * (b.w - 26)} y={1480 - b.h + 24 + jy * (b.h - 40)} width={8} height={11} fill="#ffd27a" opacity={0.25 + 0.6 * (0.5 + 0.5 * Math.sin(t * 0.7 + i * 3 + k))} />)}
        </g>
      ))}
    </g>
  );
};

const Caverna = ({ t }: { t: number }) => (
  <g>
    <path d={`M0 0 L${W} 0 L${W} ${H} L0 ${H} Z M540 380 C260 420 150 900 190 1500 L890 1500 C930 900 820 420 540 380 Z`} fill="#030406" fillRule="evenodd" />
    <ellipse cx={540} cy={1500} rx={380} ry={60} fill="#9ec0ff" opacity={0.08 + 0.03 * Math.sin(t)} style={{ mixBlendMode: "screen" }} />
  </g>
);
