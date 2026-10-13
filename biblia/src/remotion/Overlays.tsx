/** Camadas fixas por cima das tomadas: fumaça, poeira, vinheta radial e granulado de filme. */
import { useMemo } from "react";
import { AbsoluteFill, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { prng } from "../pipeline/engine";

const GRAOS = 6; // = GRAOS de pipeline/overlays.ts (duplicado: aquele módulo usa node:fs)

/** Fumaça/névoa: duas camadas de textura (pré-gerada) deslizando em velocidades diferentes. */
export const Fumaca = ({ intensidade = 0.22 }: { intensidade?: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const camada = (arq: string, vel: number, fase: number, escala: number, o: number) => (
    <div style={{
      position: "absolute", left: 0, top: 0, width: 1620, height: 1920, opacity: o,
      backgroundImage: `url(${staticFile(arq)})`, backgroundSize: "100% 100%",
      transform: `translate(${-270 - 250 * Math.sin(t * vel + fase)}px, ${-20 * Math.cos(t * vel * 0.7 + fase)}px) scale(${escala})`,
    }} />
  );
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: intensidade * 2.2, pointerEvents: "none", overflow: "hidden" }}>
      {camada("overlays/fumaca-a.png", 0.09, 0, 1.0, 0.8)}
      {camada("overlays/fumaca-b.png", 0.15, 2.1, 1.12, 0.55)}
    </AbsoluteFill>
  );
};

/** Poeira em suspensão: partículas finas subindo, com brilho dourado discreto. */
export const Poeira = ({ quantidade = 46 }: { quantidade?: number }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = frame / fps;
  const ps = useMemo(() => {
    const r = prng(99);
    return Array.from({ length: quantidade }, () => ({
      x: r() * width, y: r() * height, v: 8 + r() * 26, d: r() * 40 - 20, tam: 1.5 + r() * 4.5,
      fase: r() * 6.28, base: 0.25 + r() * 0.55,
    }));
  }, [quantidade, width, height]);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", mixBlendMode: "screen" }}>
      {ps.map((p, i) => {
        const y = (((p.y - t * p.v) % height) + height) % height;
        const x = p.x + Math.sin(t * 0.4 + p.fase) * 24 + t * p.d * 0.3;
        const a = p.base * (0.55 + 0.45 * Math.sin(t * 1.3 + p.fase));
        return <div key={i} style={{
          position: "absolute", left: x, top: y, width: p.tam, height: p.tam, borderRadius: "50%",
          background: "rgba(255,226,170,1)", opacity: a, filter: `blur(${p.tam > 4 ? 2.2 : 0.8}px)`,
          boxShadow: "0 0 8px rgba(255,200,120,0.6)",
        }} />;
      })}
    </AbsoluteFill>
  );
};

export const Vinheta = ({ forca = 0.88 }: { forca?: number }) => (
  <AbsoluteFill style={{
    pointerEvents: "none",
    background: `radial-gradient(ellipse 78% 62% at 50% 46%, rgba(0,0,0,0) 38%, rgba(0,0,0,${forca * 0.55}) 72%, rgba(0,0,0,${forca}) 100%)`,
  }} />
);

/** Granulado de filme de alto contraste: 6 texturas alternando a cada 2 quadros (cadência de película). */
export const GranuladoFilme = ({ opacidade = 0.3 }: { opacidade?: number }) => {
  const frame = useCurrentFrame();
  const i = Math.floor(frame / 2) % GRAOS;
  return (
    <AbsoluteFill style={{
      mixBlendMode: "overlay", opacity: opacidade, pointerEvents: "none",
      backgroundImage: `url(${staticFile(`overlays/grao-${i}.jpg`)})`, backgroundSize: "100% 100%",
    }} />
  );
};

/** Escurece o miolo e as faixas de cima/baixo para a legenda dourada sempre ler bem. */
export const FaixaLegibilidade = ({ forca = 1 }: { forca?: number }) => (
  <AbsoluteFill style={{
    pointerEvents: "none", opacity: forca,
    background: "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 22%, rgba(0,0,0,0.28) 48%, rgba(0,0,0,0.55) 70%, rgba(0,0,0,0.7) 100%)",
  }} />
);
