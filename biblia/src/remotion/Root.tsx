import { Composition } from "remotion";
import { ALTURA, LARGURA, planoPadrao } from "../lib/plan";
import { Video } from "./Video";

export const Root = () => (
  <Composition
    id="Verso"
    component={Video}
    width={LARGURA}
    height={ALTURA}
    fps={planoPadrao.fps}
    durationInFrames={planoPadrao.fps * 50}
    defaultProps={planoPadrao}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.max(1, Math.round(props.duracao * props.fps)),
      fps: props.fps,
    })}
  />
);
