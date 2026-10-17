import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { prng } from "../nucleo/prng";

/** Bolinhas de luz fora de foco flutuando, em ciclo fechado (loop perfeito). */
export const Particulas: React.FC<{ duracao: number; n?: number; semente?: number }> = ({ duracao, n = 38, semente = 5 }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const r = prng(semente);
  const cores = ["#25e0ff", "#ff3d8b", "#ffd23f", "#ffffff", "#8b5cff"];
  const itens = Array.from({ length: n }, (_, i) => {
    const prof = r(); // 0 = longe, 1 = perto
    const x0 = r() * 1080, y0 = r() * 1920;
    const ciclos = prof > 0.6 ? 2 : 1; // voltas inteiras: o loop fecha
    const fase = r();
    const raio = 6 + prof * 26;
    const y = (((y0 - (t / duracao) * ciclos * 2100) % 2100) + 2100) % 2100 - 90;
    const x = x0 + Math.sin(2 * Math.PI * (t / duracao) * r.int(1, 4) + fase * 6.28) * 30;
    const brilho = 0.25 + 0.2 * Math.sin(2 * Math.PI * (t / duracao) * r.int(2, 6) + fase * 6.28);
    return { i, x, y, raio, brilho: brilho * (0.4 + prof * 0.6), cor: cores[i % cores.length], desf: prof < 0.4 ? 3 : 0 };
  });
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {itens.map((p) => (
        <circle key={p.i} cx={p.x} cy={p.y} r={p.raio} fill={p.cor} opacity={p.brilho} style={p.desf ? { filter: "blur(3px)" } : undefined} />
      ))}
    </svg>
  );
};
