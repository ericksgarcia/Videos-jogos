# Skills de motion design (instaladas em 08/10/2026)

Referências de técnica para o estilo "tipografia animada + luz" do Aprendendo Fácil.
O processo do canal continua o do `CLAUDE.md` (motor/gerar.py, identidade, regras de
conteúdo): estas skills ensinam **como animar**, não substituem o nosso pipeline.

| Skill | Origem (commit) | Licença | Para quê |
|---|---|---|---|
| hyperframes, hyperframes-core, hyperframes-animation, hyperframes-creative, hyperframes-keyframes, motion-graphics, faceless-explainer | [heygen-com/hyperframes](https://github.com/heygen-com/hyperframes) `e07b641` | Apache-2.0 | regras do HyperFrames (o nosso motor), movimento, transições, câmera, direção de arte, tipografia animada, vídeo explicativo sem filmagem |
| animation-principles, motion-background, motion-art-direction, shot-composition, color-motion, beat-sync-editing | [iart-ai/motion-design-skills](https://github.com/iart-ai/motion-design-skills) `3c129f7` | MIT | 12 princípios, fundos de partículas/shader, direção de movimento, composição e áreas seguras, cor, ritmo de edição |
| kinetic-typography | [iart-ai/kinetic-typography-skills](https://github.com/iart-ai/kinetic-typography-skills) `fccc94b` | MIT | revelação de texto por letra/palavra/linha |

Também veio para o motor `aprendendo/motor/motion-director.js` (de
[systembuiltbyaj/motion-director](https://github.com/systembuiltbyaj/motion-director) `17f6869`, MIT):
animações de texto determinísticas (`MotionDirector.buildSentence`, `slam`, `whip`, `typeOn`,
`textPortal`, `countUp`, `swapWord`, `echoStack`...).

Revisão feita antes de instalar: só chamam `ffmpeg`/`npm`/Chrome localmente. Exceções a evitar:
- `motion-graphics/grounding/locate.mjs` modo `auto` usa o Gemini pago: **não use** (o Gemini do
  canal é só para a narração);
- `motion-graphics/categories/maps/bake-basemap.mjs` baixa mapas de servidores externos.
- Não rode `npx hyperframes@latest upgrade` nem atualize o HyperFrames (fixado em `package.json`)
  sem pedido do dono.

Os arquivos `*.test.mjs` foram removidos. Para atualizar, clone de novo a origem e copie as pastas.
