import React from "react";
import { Composition, continueRender, delayRender, staticFile } from "remotion";
import { Diferente, type PropsDiferente } from "./jogos/diferente/Cena";
import { FPS, T } from "./jogos/diferente/tempos";

const carregarFonte = () => {
  const h = delayRender("fonte");
  Promise.all(
    [800, 900].map((w) => new FontFace("Nunito", `url(${staticFile(`fonts/nunito-latin-${w}-normal.woff2`)})`, { weight: String(w) }).load()),
  )
    .then((fs) => { fs.forEach((f) => document.fonts.add(f)); continueRender(h); })
    .catch((e) => { throw e; });
};

export const Root: React.FC = () => {
  React.useMemo(carregarFonte, []);
  return (
    <Composition
      id="diferente"
      component={Diferente as React.FC<any>}
      width={1080}
      height={1920}
      fps={FPS}
      durationInFrames={Math.round(T.total * FPS)}
      defaultProps={{ semente: 1, dificuldade: "medio" } satisfies PropsDiferente}
    />
  );
};
