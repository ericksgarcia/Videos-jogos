import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Plano } from "../lib/plan";
import { KineticText, RotuloReferencia } from "./KineticText";
import { FaixaLegibilidade, Fumaca, GranuladoFilme, Poeira, Vinheta } from "./Overlays";
import { ParallaxScene } from "./ParallaxScene";
import { StockScene } from "./StockScene";

const DISSOLVER = 8; // quadros de fusão entre tomadas

/** Pulso de câmera e lampejo curtíssimo em cada corte, para "bater" com a música. */
const Pulso = ({ cortes }: { cortes: number[] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const anterior = [...cortes].reverse().find((c) => c <= t);
  if (anterior === undefined) return null;
  const k = Math.max(0, 1 - (t - anterior) / 0.28);
  return <AbsoluteFill style={{ background: "#fff", opacity: 0.1 * k ** 2, mixBlendMode: "soft-light", pointerEvents: "none" }} />;
};

export const Video = (plano: Plano) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const q = (s: number) => Math.round(s * fps);
  const cortes = plano.tomadas.slice(1).map((x) => x.ini);

  // Pulsação sutil da imagem inteira a cada batida (mais forte na leitura do versículo).
  const beat = 60 / plano.bpm;
  const fase = (t % beat) / beat;
  const emLeitura = plano.segmentos.some((s) => s.id === "ato2" && t >= s.ini && t < s.fim);
  const pulsar = 1 + (emLeitura ? 0.012 : 0.005) * Math.exp(-fase * 6);

  const abrir = interpolate(frame, [0, q(0.7)], [0, 1], { extrapolateRight: "clamp" });
  const fechar = interpolate(frame, [durationInFrames - q(1.4), durationInFrames - 1], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#000", opacity: Math.min(abrir, fechar) }}>
      <Audio src={staticFile(plano.audio)} />
      <AbsoluteFill style={{ transform: `scale(${pulsar})`, filter: "contrast(1.1) saturate(0.88) brightness(0.9)" }}>
        {plano.tomadas.map((x, i) => {
          const dur = q(x.fim - x.ini);
          const entrada = i === 0 ? 0 : DISSOLVER;
          const resto = i === plano.tomadas.length - 1 ? 0 : DISSOLVER; // fica por baixo enquanto a próxima aparece
          return (
            <Sequence key={i} from={q(x.ini) - entrada} durationInFrames={dur + entrada + resto} layout="none">
              <FusaoEntrada entrada={entrada}>
                {x.tipo === "parallax"
                  ? <ParallaxScene src={x.src} depth={x.depth} duracaoQuadros={dur + entrada} seed={x.seed} />
                  : <StockScene src={x.src} duracaoQuadros={dur + entrada} seed={x.seed} />}
              </FusaoEntrada>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      <FaixaLegibilidade />
      <Fumaca intensidade={plano.tom === "epic" ? 0.26 : 0.18} />
      <Poeira />
      <Pulso cortes={cortes} />
      <Vinheta />
      <KineticText segmentos={plano.segmentos} />
      <RotuloReferencia {...plano.rotulo} />
      <GranuladoFilme />
    </AbsoluteFill>
  );
};

const FusaoEntrada = ({ entrada, children }: { entrada: number; children: React.ReactNode }) => {
  const frame = useCurrentFrame();
  const o = entrada ? interpolate(frame, [0, entrada], [0, 1], { easing: Easing.inOut(Easing.quad), extrapolateRight: "clamp" }) : 1;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};
