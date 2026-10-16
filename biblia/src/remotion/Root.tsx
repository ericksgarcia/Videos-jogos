import { Composition } from "remotion";
import { ALTURA, LARGURA, planoPadrao } from "../lib/plan";
import { Galeria } from "./Galeria";
import { GaleriaCenografia } from "./GaleriaCenografia";
import { Video } from "./Video";
import { ShaderFundo } from "./ShaderFundo";

export const Root = () => (
  <>
  <Composition id="FundoGerativo" component={() => <ShaderFundo paleta="ouro" semente={3} pulsos={[2]} batida={1.2} />} width={1080} height={1920} fps={30} durationInFrames={90} />
  <Composition id="Galeria" component={Galeria} width={1080} height={1280} fps={30} durationInFrames={150} />
  <Composition id="GaleriaCenografia" component={GaleriaCenografia} width={1080} height={1280} fps={30} durationInFrames={150} />
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
  </>
);
