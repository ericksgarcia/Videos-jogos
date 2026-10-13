/** Pré-visualização das cenas desenhadas (Studio ou `remotion still`). */
import { AbsoluteFill } from "remotion";
import { Cenografia } from "./Cenografia";

const ITENS: { c: string; v?: string; climax?: number }[] = [
  { c: "janela_babilonia" }, { c: "cova_leoes", v: "queda" }, { c: "cova_leoes" },
  { c: "cova_leoes", v: "anjo", climax: 20 }, { c: "amanhecer_cova" }, { c: "quarto_chuva" },
];

export const GaleriaCenografia = () => (
  <AbsoluteFill style={{ background: "#000", flexDirection: "row", flexWrap: "wrap" }}>
    {ITENS.map((it, i) => (
      <div key={i} style={{ width: 360, height: 640, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: "scale(0.3333)", transformOrigin: "0 0" }}>
          <Cenografia cena={it.c} variante={it.v} duracaoQuadros={150} climaxQuadro={it.climax} />
        </div>
      </div>
    ))}
  </AbsoluteFill>
);
