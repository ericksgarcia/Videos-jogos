# Skill "anatomy" (wheresryan22/anatomy) — análise para vídeos do TikTok

Status: **não instalada**. Análise feita só lendo a página pública do GitHub e notícias.
Confirmar o comando `npx skills add wheresryan22/anatomy` (visto na imagem) antes de rodar.

## O que ela faz
Faz o Claude explicar uma ideia técnica construindo-a como um **objeto físico que funciona**
(ex.: fechadura de pinos para explicar chave de cache), numa figura isométrica sombreada.
Saída: SVG, SVG com shaders WebGL, ou modo 3D (beta). MIT, Node 20.10+, sem dependências npm.
Fluxo: coletar números reais → inventar o objeto → lista de peças → geometria → pintar de
trás para frente → enquadrar → interatividade → verificar (scripts com Chrome headless).
Pastas: `SKILL.md`, `references/`, `kit/` (câmera isométrica, sólidos, cabos, WebGL, 3D),
`scripts/` (screenshots, sessões roteirizadas), `examples/`, `evals/`.

## Como ajuda nos nossos vídeos
- Fábrica de **cenas-objeto** (relógio mecânico, motor em corte, fechadura) com visual premium,
  combinando com o padrão "estilo Kurzgesagt" do canal.
- Gancho forte: abrir o vídeo no mecanismo ("como funciona por dentro").
- Peças/ideias do `kit/` podem virar desenhos novos em `motor/biblioteca.js`.

## Limites
- Gera **páginas web interativas, não vídeo vertical**: precisaria gravar/capturar frames
  (nosso motor já renderiza SVG+GSAP com navegador, então dá para embutir o SVG numa cena).
- Geração leva minutos; 3D é beta (e o dono achou 3D caro demais no render).
- O foco é tecnologia/mecanismos; menos útil para temas como política.

## Próximos passos sugeridos
1. Instalar em ambiente isolado e gerar 1 figura de teste (ex.: "como funciona um relógio").
2. Embutir o SVG como cena em `videos/<tema>/cenas.js`, animando com GSAP.
3. Se valer, adaptar o estilo à paleta da marca (`identidade/marca.json`).
