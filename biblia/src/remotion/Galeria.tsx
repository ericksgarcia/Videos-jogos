/** Pré-visualização das cenas procedurais em grade (Studio ou `remotion still`). */
import { AbsoluteFill } from "remotion";
import { CenaProcedural, type Clima, type Cenario } from "./CenaProcedural";

const ITENS: { c: Cenario; k: Clima[] }[] = [
  { c: "montanha", k: ["tempestade"] }, { c: "deserto", k: ["vento"] }, { c: "noite", k: ["estrelas"] },
  { c: "mar", k: ["tempestade"] }, { c: "fogueira", k: ["fogo"] }, { c: "cidade", k: ["chuva"] },
];

export const Galeria = () => (
  <AbsoluteFill style={{ background: "#000", flexDirection: "row", flexWrap: "wrap" }}>
    {ITENS.map((it, i) => (
      <div key={i} style={{ width: 360, height: 640, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: "scale(0.3333)", transformOrigin: "0 0" }}>
          <CenaProcedural cenario={it.c} clima={it.k} seed={3 + i} duracaoQuadros={150} raiosEm={[58]} climaxQuadro={58} />
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
