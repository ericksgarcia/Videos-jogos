# Jogos TikTok

Mini-desafios visuais verticais (1080×1920, 15–25 s) em que o espectador só pensa a resposta.
100% por código (Remotion 4 + TypeScript): shader WebGL, SVG, física determinística, sons sintetizados.
Projeto independente de `aprendendo/`.

```bash
cd jogos && npm ci
npm test                                                  # a resposta mostrada é a correta? (2400 desafios)
export CHROME_PATH=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell REMOTION_GL=swangle REMOTION_CONCURRENCY=4
npx tsx src/pipeline/cli.ts previa videos/001.json        # fotos + folhas em output/<id>/previa/
npx tsx src/pipeline/cli.ts render videos/001.json        # blocos de 8 s (retomável) → output/<id>/<id>.mp4
```

- `src/identidade/` marca (nome em `marca.ts`), fundo em shader, partículas, logo.
- `src/nucleo/` PRNG com semente, easing (gelatina, antecipação), área segura.
- `src/jogos/<formato>/` `gerar.ts` (lógica + resposta), `tempos.ts` (linha do tempo única da imagem e do som), `Cena.tsx`, `sons.ts`.
- `src/audio/` síntese e mixagem (WAV mono → AAC no encode).
- `src/pipeline/` verificação da resposta antes do render, render em blocos com `.ok` e trava, encode CRF 20 → 2 passadas se > 28 MB.
- `videos/<id>.json` formato + semente + dificuldade. Cada vídeo, semente nova.

Regras: sem `Math.random`; o resultado depende só do quadro e da semente; o vídeo fecha em loop
(o último quadro é igual ao primeiro; fundo e partículas são periódicos).
Área segura: x 60–880, y 300–1650.
