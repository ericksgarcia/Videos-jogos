# Cenas 2D com o anidoodle (teste out/2026)

anidoodle (Apache-2.0, github.com/alexgreensh/anidoodle) desenha por código em 32 estilos. Para o canal vale o 2D chapado ("flat vector"):
formas de uma cor só, sem contorno, sombras longas, grão. **Nada de personagem 3D/boneco articulado** (o sistema `character/` dele, tipo Mira/Theo,
é 3D por baixo e pesado de montar).

Como rodar: instale o projeto em `/home/user/anidoodle-work/proj` (npm install; a pasta já existe nesta sessão), copie `pedroFogo.ts` para
`src/canvas-core/` e `page-pedroFogo.ts` para `src/hosts/`, e rode:
- quadro: `node tools/still.mjs pedroFogo --frame 20 --out out/pedroFogo.png`
- laço de 3 s: `node tools/render.mjs pedroFogo --out out/pedroFogo.mp4`

Receita (cena `pedroFogo.ts`, 1080x1920, ~120 linhas): céu em degradê + estrelas piscando; lua cheia com crateras; colinas, muralha e torre em 2-3 azuis;
fogo = 4 camadas de chama (uma cor cada, línguas laterais balançando); luz do fogo = gradiente radial laranja no chão + `lighter`; pessoas = silhueta
(manto, capuz, mão estendida); sombras = elipse no chão jogada para longe do fogo; grão só embaixo/à direita. Cada elemento é um polígono com `smooth()`.
Para virar fundo de vídeo: renderizar o MP4 (ou PNG) e usá-lo como `<video>`/imagem de fundo numa cena do caderno (ainda não ligado ao `gerar.py`).
