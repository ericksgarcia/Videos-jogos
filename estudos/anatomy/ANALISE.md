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

---
## Atualização — leitura do repositório clonado (sem executar nada)

Li `SKILL.md`, `README.md` e `references/` (clone raso, só leitura). **Não rodei nenhum código
da skill**: o sistema bloqueou a execução de código externo (build do exemplo, Chrome).

### Fatos confirmados
- Instalação oficial: `npx skills add` (README). Licença MIT, Node >= 20.10, zero dependências.
- Exemplos: dial-indicator (menor, ~300 linhas), desk-computer, arcade-cabinet, raptor-engine
  (com shaders WebGL), ripple-tank, test-rig, spot-plate, turning-dial (3D beta).
- Cada exemplo roda `node examples/<nome>/build.mjs` e gera uma **página HTML** (tema escuro/claro).
- Tamanhos: Figura (40–80 peças, < 1h), Hero (80–150 peças, 2–4h), Epic (6h+, não inicia sozinha).
- Tem `scripts/capture.mjs` (screenshots/zoom/tempos) e `scripts/drive.mjs` (sessões roteirizadas,
  câmera lenta, folhas de contato) com Chrome headless — dá para tirar frames em sequência.
- Também imprime PDF A4 e publica numa galeria comunitária (só se o usuário pedir).
- Exige muito rigor: auditoria de geometria e "line check" até zero — por isso é lenta.

### Encaixe com o canal (Aprendendo Fácil)
| Ponto | Avaliação |
|---|---|
| Visual | Isométrico técnico/"instrumento de bancada", bem diferente do nosso Kurzgesagt de cena cheia. Bom como **cena de destaque**, não como estilo do vídeo inteiro. |
| Formato | Quadro isométrico em cartão, não 1080×1920 em tela cheia; precisa recompor para vertical. |
| Animação | Tempo real/interativa (mola, ponteiro). Para vídeo é preciso dirigir via `drive.mjs` e capturar frames, ou embutir o SVG e animar com GSAP no nosso motor. |
| Custo | Uma figura boa leva de dezenas de minutos a horas. Caro para um vídeo de 2 min com várias cenas. |
| Assuntos | Ótima para mecanismos (relógio, fechadura, motor, circuito). Fraca para política/economia. |

### Recomendação
Usar como **gerador de uma cena-hero por vídeo** de tema mecânico (ex.: "como funciona um
relógio"), capturando 2–3 poses/frames e animando a câmera no nosso `cenas.js`, em vez de
trocar nosso pipeline. Antes de decidir, testar 1 figura pequena (dial-indicator) em ambiente
isolado — depende de o dono liberar a execução do código externo.
