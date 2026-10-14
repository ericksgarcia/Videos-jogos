/** Gancho em texto nos primeiros segundos e selo de comentário durante o CTA. */
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { SOMBRA_TEXTO } from "./KineticText";

const OURO = "#f6c64a";

/** Duas linhas em maiúsculas que "batem" na tela (a 2ª em dourado), sobre a imagem do clímax. */
export const GanchoTela = ({ linhas, fim }: { linhas: string[]; fim: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (t > fim + 0.4 || !linhas.length) return null;
  const saida = interpolate(t, [fim - 0.25, fim + 0.2], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 420, opacity: saida, pointerEvents: "none" }}>
      {linhas.map((l, i) => {
        const s = spring({ frame: frame - i * 7, fps, config: { damping: 13, mass: 0.7, stiffness: 170 } });
        const tremor = i === 0 ? Math.max(0, 1 - frame / 8) * Math.sin(frame * 3.1) * 6 : 0;
        return (
          <div key={i} style={{
            fontFamily: "Cinzel, serif", fontWeight: 700, fontSize: i === 0 ? 70 : Math.min(96, Math.floor(1380 / Math.max(8, l.length))), letterSpacing: "0.05em", whiteSpace: "nowrap",
            color: i === linhas.length - 1 ? OURO : "#f4ecd8", textAlign: "center", lineHeight: 1.08, marginTop: i ? 10 : 0,
            transform: `translate(${tremor}px, ${(1 - s) * 40}px) scale(${1.35 - 0.35 * s})`, opacity: Math.min(1, s * 1.4),
            textShadow: `${SOMBRA_TEXTO}, 0 4px 24px rgba(0,0,0,0.6)${i === linhas.length - 1 ? ", 0 0 30px rgba(255,190,70,0.75)" : ""}`,
          }}>{l}</div>
        );
      })}
    </AbsoluteFill>
  );
};

/** Pílula "Comente: AMÉM" com balão de comentário, durante o CTA. */
export const SeloComentario = ({ texto, ini, fim }: { texto: string; ini: number; fim: number }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (!texto || t < ini - 0.2 || t > fim + 0.4) return null;
  const s = spring({ frame: frame - Math.round(ini * fps), fps, config: { damping: 12, stiffness: 160 } });
  const sai = interpolate(t, [fim - 0.1, fim + 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pulso = 1 + 0.04 * Math.sin(t * 7);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 330, pointerEvents: "none" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 22, padding: "22px 40px", borderRadius: 60,
        background: "rgba(12,10,8,0.72)", border: `3px solid ${OURO}`, boxShadow: "0 0 34px rgba(246,198,74,0.45)",
        transform: `translateY(${(1 - s) * 80}px) scale(${pulso})`, opacity: s * sai,
      }}>
        <svg width="54" height="54" viewBox="0 0 24 24">
          <path d="M4 4h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 4v-4H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" fill={OURO} />
          <circle cx="8" cy="11" r="1.4" fill="#1a140a" /><circle cx="12" cy="11" r="1.4" fill="#1a140a" /><circle cx="16" cy="11" r="1.4" fill="#1a140a" />
        </svg>
        <span style={{ fontFamily: "Cinzel, serif", fontWeight: 700, fontSize: 52, color: "#f4ecd8", letterSpacing: "0.04em" }}>{texto}</span>
      </div>
    </AbsoluteFill>
  );
};
