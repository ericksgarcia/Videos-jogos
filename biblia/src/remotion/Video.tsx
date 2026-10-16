import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { Plano } from "../lib/plan";
import { KineticText, RotuloReferencia } from "./KineticText";
import { FaixaLegibilidade, Fumaca, GranuladoFilme, Poeira, Vinheta } from "./Overlays";
import { ParallaxScene } from "./ParallaxScene";
import { StockScene } from "./StockScene";
import { CenaProcedural, type Cenario, type Clima } from "./CenaProcedural";
import { GanchoTela, SeloComentario } from "./Engajamento";
import { Cenografia } from "./Cenografia";
import { VersoFixo } from "./VersoFixo";

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
  const proc = plano.tomadas.every((x) => x.tipo === "procedural" || x.tipo === "cenografia"); // cenas vetoriais já são claras e limpas: menos escurecimento

  // Pulsação sutil da imagem inteira a cada batida (mais forte na leitura do versículo).
  const beat = 60 / plano.bpm;
  const fase = (t % beat) / beat;
  const emLeitura = plano.segmentos.some((s) => s.id === "ato2" && t >= s.ini && t < s.fim);
  // pulsação no ritmo só nas cenas desenhadas; em foto (parallax/vídeo) ela parece tranco
  const foto = plano.tomadas.some((x) => x.tipo === "parallax" || x.tipo === "video");
  const pulsar = foto ? 1 : 1 + (emLeitura ? 0.012 : 0.005) * Math.exp(-fase * 6);

  // em loop não há fade: o último quadro emenda no primeiro
  const abrir = plano.loop ? 1 : interpolate(frame, [0, q(0.7)], [0, 1], { extrapolateRight: "clamp" });
  const fechar = plano.loop ? 1 : interpolate(frame, [durationInFrames - q(1.4), durationInFrames - 1], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: "#000", opacity: Math.min(abrir, fechar) }}>
      <Audio src={staticFile(plano.audio)} />
      <AbsoluteFill style={{ transform: `scale(${pulsar})`, filter: proc ? "contrast(1.06) saturate(1.0) brightness(1.08)" : "contrast(1.06) saturate(1.06) brightness(1.04)" }}>
        {plano.tomadas.map((x, i) => {
          const dur = (i === plano.tomadas.length - 1 ? durationInFrames : q(x.fim)) - q(x.ini); // pelos quadros: sem buraco no fim
          const entrada = i === 0 ? 0 : DISSOLVER;
          const resto = i === plano.tomadas.length - 1 ? 0 : DISSOLVER; // fica por baixo enquanto a próxima aparece
          return (
            <Sequence key={i} from={q(x.ini) - entrada} durationInFrames={dur + entrada + resto} layout="none">
              <FusaoEntrada entrada={entrada} escurecer={x.faixa === undefined ? 1 : 1 - 0.3 * Math.min(1, Math.max(0, (x.faixa - 105) / 60))}>
                {x.tipo === "cenografia" ? (
                  <Cenografia cena={x.cena ?? "cova_leoes"} variante={x.variante} duracaoQuadros={dur + entrada}
                    climaxQuadro={plano.climax.t >= x.ini && plano.climax.t < x.fim ? Math.round((plano.climax.t - x.ini) * fps) + entrada : undefined} />
                ) : x.tipo === "procedural" ? (
                  <CenaProcedural
                    cenario={(x.cenario ?? "noite") as Cenario} clima={(x.clima ?? []) as Clima[]} seed={x.seed} duracaoQuadros={dur + entrada}
                    climaxQuadro={Math.round((plano.climax.t - x.ini) * fps) + entrada}
                    raiosEm={plano.climax.t >= x.ini && plano.climax.t < x.fim ? [Math.round((plano.climax.t - x.ini) * fps) + entrada] : []}
                  />
                ) : x.tipo === "parallax"
                  ? <ParallaxScene src={x.src} depth={x.depth} duracaoQuadros={dur + entrada} seed={x.seed} />
                  : <StockScene src={x.src} duracaoQuadros={dur + entrada} seed={x.seed} />}
              </FusaoEntrada>
            </Sequence>
          );
        })}
      </AbsoluteFill>
      {/* clarão dourado na palavra de clímax (qualquer tipo de fundo) */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 35%, rgba(255,225,150,1), rgba(255,180,80,0) 62%)", mixBlendMode: "screen", pointerEvents: "none", opacity: (() => { const k = frame - q(plano.climax.t); return k < 0 ? 0 : 0.6 * Math.exp(-k / 7); })() }} />
      <FaixaLegibilidade forca={proc ? 0.5 : 0.55} />
      <Fumaca intensidade={plano.tomadas.some((x) => x.tipo === "cenografia") ? 0.035 : proc ? 0.1 : 0.06} />
      <Poeira />
      <Pulso cortes={cortes} />
      <Vinheta forca={proc ? 0.62 : 0.6} />
      {plano.verso_fixo
        ? <VersoFixo palavras={plano.segmentos.find((s) => s.id === "ato2")?.palavras ?? []} faixa={plano.tomadas.find((x) => t >= x.ini && t < x.fim)?.faixa} />
        : <KineticText segmentos={plano.segmentos} blocos={plano.blocos} faixa={plano.tomadas.find((x) => t >= x.ini && t < x.fim)?.faixa} />}
      <RotuloReferencia {...plano.rotulo} />
      {plano.gancho_tela && !plano.verso_fixo && <GanchoTela linhas={plano.gancho_tela} fim={plano.gancho_fim ?? 2.6} ini={plano.gancho_linhas} />}
      {plano.gancho_virada !== undefined && <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,230,170,1), rgba(255,200,110,0) 65%)", mixBlendMode: "screen", pointerEvents: "none", opacity: (() => { const k = frame - q(plano.gancho_virada!); return k < 0 ? 0 : 0.5 * Math.exp(-k / 5); })() }} />}
      {plano.cta_tela && <SeloComentario {...plano.cta_tela} />}
      {/* granulado no navegador trocava a cada 2 quadros (15 Hz) e parecia tranco: em foto ele vai para o ffmpeg */}
      {!foto && <GranuladoFilme />}
    </AbsoluteFill>
  );
};

const FusaoEntrada = ({ entrada, escurecer = 1, children }: { entrada: number; escurecer?: number; children: React.ReactNode }) => {
  const frame = useCurrentFrame();
  const o = entrada ? interpolate(frame, [0, entrada], [0, 1], { easing: Easing.inOut(Easing.quad), extrapolateRight: "clamp" }) : 1;
  return <AbsoluteFill style={{ opacity: o, filter: escurecer < 1 ? `brightness(${escurecer})` : undefined }}>{children}</AbsoluteFill>;
};
