/** Tomada com vídeo de banco (Pexels): movimento real, com deriva/zoom leve para "colar" no clima do vídeo. */
import { Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";

export const StockScene = ({ src, duracaoQuadros, seed }: { src: string; duracaoQuadros: number; seed: number }) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [0, Math.max(1, duracaoQuadros - 1)], [0, 1], { extrapolateRight: "clamp" });
  const zoom = 1.06 + 0.07 * Easing.inOut(Easing.sin)(p);
  const dx = (seed % 2 ? 1 : -1) * 18 * (p - 0.5);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile(src)}
        muted
        style={{ width: "100%", height: "100%", objectFit: "cover", transform: `translateX(${dx}px) scale(${zoom})` }}
      />
    </div>
  );
};
