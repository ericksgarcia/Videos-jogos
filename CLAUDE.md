# Aprendendo Fácil — guia do canal

Este repositório gera os vídeos do canal **Aprendendo Fácil**: vídeos verticais para
TikTok/Reels/Shorts que explicam assuntos muito complicados de um jeito muito simples.
Leia este guia inteiro antes de criar ou alterar um vídeo.

## Organização (não misture as camadas)

```
aprendendo/
  identidade/   A MARCA — igual em todos os vídeos. Não altere sem pedido do dono.
                marca.json (nome, textos, CTA, hashtags, voz, paleta), marca.css,
                identidade.js (marca, legendas, capítulos, abertura, cartão final),
                logo.svg, foto-perfil.png, banner.png, fontes/. Manual: identidade/README.md
  motor/        O QUE TODOS USAM — gerador, voz, sons, template, núcleo, biblioteca de
                desenhos e montagem. Mude só para melhorar todos os vídeos, e confira
                que os vídeos antigos continuam iguais (--previa).
  videos/<tema>/  UM VÍDEO POR PASTA — roteiro.json + cenas.js (+ o que for só dele).
```

- Vídeo novo: `python aprendendo/motor/novo.py <tema> "Título"` cria a pasta com o
  modelo. Tudo do vídeo fica nela; não edite a pasta de outro vídeo.
- Desenho que serve para vários temas vai para `motor/biblioteca.js`; o que é só do
  tema fica no `cenas.js` do vídeo.
- Saída (não versionada): `output/<tema>/<slug>.mp4`, `output/<tema>/previa/`, `output/<tema>/build/`.

## O pedido típico

"Faça um vídeo sobre X". Isso significa: escrever o roteiro, criar as cenas animadas,
gerar a narração, renderizar, **revisar os frames**, corrigir, entregar o MP4 com
`SendUserFile` e fazer commit + push na branch de trabalho. Ao entregar, ofereça uma
descrição para o TikTok (gancho, 3–5 linhas, hashtags).

## Regras de conteúdo (decididas com o dono do canal)

- **O público é ADULTO.** Só o *método* é simples: técnica de Feynman, "como se
  explicasse para uma criança de 10 anos". Nada infantilizado: sem mascote, sem voz
  de criança, sem "amiguinhos", sem tom de desenho animado infantil.
- Analogias do dia a dia (fila de pessoas, tampa de panela), um passo por vez, sem
  jargão sem explicação. Pode citar o cientista e o ano quando ajudar.
- Duração **mínima de 1min30** (o primeiro vídeo tem 2min20; 1:45–2:30 é o ideal).
- Estrutura que funcionou (`videos/eletricidade/roteiro.json`):
  1. gancho com fato chocante ou pergunta + situação cotidiana + promessa (ver "Retenção");
  2. o conceito básico com uma analogia;
  3. a descoberta/o mecanismo central;
  4. como isso é usado na prática (variações);
  5. o caminho até a vida da pessoa;
  6. resumo em 3–4 passos + chamada: "Segue o Aprendendo Fácil e comenta qual
     assunto complicado você quer que eu explique no próximo vídeo."
- Frases curtas e faladas, com "você", "pensa num…", "imagina…".

## Retenção e engajamento (obrigatório em todo roteiro — pedido do dono)

O vídeo inteiro é escrito para a pessoa não sair, não só o começo. Referência:
`videos/navio/roteiro.json`. Antes de renderizar, confira cada item:

1. **Gancho em 1–3 s:** a primeira frase já é o fato chocante ou a contradição
   ("pesa 100 mil toneladas… um parafuso de aço afunda"), com imagem forte desde o
   quadro 1. Nada de "oi", "hoje vamos falar", apresentação ou contexto antes do gancho.
2. **Loop aberto (promessa):** ainda no gancho, prometa algo que só aparece lá na
   frente ("e no final eu te mostro o que acontece quando o casco fura"), com um
   rótulo na tela. Pague a promessa de forma explícita, perto dos 2/3 do vídeo
   ("Agora, o que eu te prometi…"), nunca no resumo.
3. **Re-gancho em cada troca de cena (a cada ~15–25 s):** a cena termina abrindo a
   próxima com pergunta ou tensão ("Mas aí vem o problema…", "E se…?"). Nunca
   "agora vamos falar de…".
4. **Pergunta para comentar no meio** (antes da metade): peça um palpite ("Comenta aí:
   você acha que…?") e mostre um rótulo "COMENTA SEU PALPITE". Responda logo depois.
5. **Fato-surpresa na segunda metade:** uma história real, um número ou um erro
   famoso (ex.: o Titanic) que recompensa quem ficou.
6. **Mudança visual a cada 2–4 s:** toda frase tem uma batida (algo aparece, se mexe
   ou muda). Tela parada mais de 4 s é o ponto onde a pessoa arrasta.
7. **Texto na tela reforça a fala** (rótulos curtos nas palavras-chave); a legenda
   está sempre ligada.
8. **Final curto:** resumo de 3–4 passos rápido, CTA da marca e uma última frase que
   remete ao começo (a imagem do gancho volta), para dar vontade de rever (loop).
9. **Descrição do post:** começa com pergunta ou curiosidade, convida a comentar e
   sugere um comentário fixado com uma pergunta para o público.

## Padrão visual (o dono pediu explicitamente "profissional", não "simples")

**PADRÃO ATUAL (tsunami v3): MODERNO E CLEAN, ANIMADO EM CAMADAS.** O dono pediu "moderno e clean",
**sem neon**, **sem 3D** e rejeitou foto parada de fundo ("vai ficar muito parado"). Referência:
`videos/tsunami/cenas.js`. Método:
1. **Primeiro a cena como animação**: o ambiente é desenhado em código e se mexe o tempo todo
   (céu em degradê com nuvens andando, superfície do mar ondulando, fundo do mar, praia em corte,
   raios de luz, bolhas). Ex.: `marAberto()` (céu, sol, mar e navio boiando) em tsunami/cenas.js.
2. **Objetos sob encomenda**: cada coisa que precisa aparecer (navio, boia, palmeira, peixe, avião…)
   é gerada isolada e recortada: liste em `videos/<tema>/imagens.json` com `"objeto": true`
   (`descricao` em inglês, de lado/perfil quando o objeto vai andar, `seed`) e rode
   `python aprendendo/motor/imagens.py <tema> --lista`. O gerador (Replicate FLUX.2 [klein],
   ~US$ 0,002) pede o objeto sobre **magenta chapado**, e `motor/recorte.py` recorta AQUI, sem
   serviço externo (fundo ligado à borda + vãos internos + sombra magenta + despill) → PNG
   transparente em `imagens/<nome>.png` (o bruto fica em `imagens/_bruto/`). Olhe todos sobre
   fundo escuro e claro; refaça o que sair errado (outra `seed`/descrição, `--refazer`).
3. **Estilo dos objetos** (`ESTILO_OBJ` em imagens.py): ilustração vetorial semi-plana, proporções
   reais, degradês suaves com volume leve, contorno fino discreto, cores sóbrias na paleta do
   canal (navy, azuis, areia, off-white, amarelo só de destaque). Nada fotográfico, nada de
   desenho infantil/ícone.
4. **Objetos como camadas animadas**: `objeto(nome, largura, {ancora, afunda, espelhar})` (âncora
   na base: põe no chão/na água) dentro de um `<g>` que você anima: boiar na superfície calculada
   (posição e inclinação), andar, quicar, se curvar, cruzar a tela; profundidade com velocidades
   diferentes por distância. Tudo amarrado às batidas da fala.
5. Por cima: kit clean (abaixo) — cartões, números grandes, réguas, setas. Foto inteira só em
   `fotoCartao` quando fizer sentido.
6. **Cenário com texturas geradas que se movem** (KIT CAMADAS em `motor/biblioteca.js`): gere as
   texturas no mesmo estilo (`"textura": true` em imagens.json; `"repetivel": true` emenda com o
   espelho para rolar sem costura; `"corte": [de, até]` guarda só a faixa útil da altura) e use
   `textura(id, nome, {y, h, alt, ty, rolar, clip, filtro})`: céu e mar rolam (`rolar` px/s), a
   água ondula (`filtro: "ondulacao"` / `"ondulacaoForte"`) e fica recortada pela superfície
   calculada a cada quadro (`clip` = um `<clipPath>` com o path da onda) — assim a textura sobe e
   desce com a onda. Use camadas em profundidade (céu, ilha ao longe, mar distante, mar perto) com
   velocidades diferentes. Chame `animarTexturas(el, c)` e `animarEspumas(el, c)` em cada cena.
7. **Contato**: `contato(largura, "chao")` (sombra, antes do objeto) e `contato(largura, "agua")`
   (espuma animada na linha d'água, depois do objeto) em todo objeto que encosta no chão ou na água.
8. **Partículas nas batidas**: `areiaLevanta()`, `gotas()`, `respingo()`, `bolhasSobem()` no
   instante da palavra (tranco, onda batendo, peixe se debatendo, sensor avisando).
9. **Transições com movimento**: `"entrada": "descer" | "subir" | "esq" | "dir"` na cena do
   roteiro — a cena nova entra vindo daquele lado e a anterior sai no sentido oposto (ex.: do céu
   para dentro do mar = "descer"). Combine com a câmera da cena (abrir na mesma direção).
- **Kit clean** (`motor/biblioteca.js`, "KIT CLEAN"): `cartao(txt, {sub, cor, tam, larg, barra,
  fundo, tinta})` (cartão branco arredondado; em fundo claro use fundo `#0a1230` e tinta branca),
  `pilula(txt, cor)`, `numeroGrande(cls, ini, legenda)` (+ `contador`), `medida()`, `setaClean()`,
  `fotoCartao()`, `velas()` (escurece topo e base para os textos), `foto()` e `kenBurns()`.
- Diagramas: linhas brancas grossas e arredondadas, áreas chapadas (navy, areia `#e7dcc6`, céu
  claro), sem brilho neon, sem grade técnica, sem fonte mono. Texto sempre Nunito, ≥ 24 px.
- Técnicas que continuam: câmera em fases, contador, entradas variadas, zoom que revela detalhes
  (agora no objeto recortado: o PNG tem resolução para 3×), foco seletivo, sem bonecos.

*Padrão anterior (holograma/HUD, vídeos navio e tsunami v1), não usar em vídeo novo:*
estilo tecnológico holograma/HUD. Referência: `videos/navio/cenas.js`. Kit em `motor/biblioteca.js`:
- `cenarioHud({horizonte, agua, fuga})`: fundo escuro, pontos, grade em perspectiva;
  `hudOverlay(el, c, "CANAL")`: linhas de varredura, faixa de scanner, cantos de visor e
  código de tempo (aplicado no acabamento de cada cena).
- Objetos em linhas neon: envolva QUALQUER desenho em `<g class="holo">` (ou `holo-am`,
  `holo-vm`, `holo-vd`, `holo-rs`, `holo-lr`, `holo-az`); `class="cheio"` = preenchimento
  mais forte, `class="vazio"` = sem preenchimento. Cor animada: tween de `stroke`/`fill`
  por estilo (o atributo `fill` é sobrescrito pelo CSS).
- Textos: `tag(txt, cor, tam, sub)` (caixa de interface com cantoneiras), `numeroHud`
  (contadores), `cota()` (linha de medida), `mira()` (alvo), `painelHud()` (leituras),
  fonte técnica JetBrains Mono (`.mono`/`.monol`). Nada de pílulas arredondadas nem
  desenho estilo cartoon (sol sorridente, nuvens fofas, árvores, casinhas).
- Desenho técnico (skills `create-svg`/blueprint, `svg-creator`, `illustration-isometric-mono`):
  `LT.contorno/aresta/fina/oculta/centro` (hierarquia de linhas), `gradeTecnica()`, hachuras
  (`url(#hachura)`, `hachuraCruz`, `sedimento`, `manto`), `chamada(n, …)` + `animChamada()`,
  `blocoTitulo()`. Muito detalhe fino repetido e linhas finas = não parecer "infantil".
- Revelações tecnológicas: `varredura()` (scanner que revela o objeto), `desenhar()` nas
  linhas, sonar, réguas e sensores com números que mudam.

O que continua valendo do padrão anterior:

- **Cada cena é um ambiente completo em tela cheia** (SVG 1080×1920): céu, morros,
  chão, primeiro plano. Nada de desenho isolado sobre fundo liso.
- **Luz e volume:** degradês (cobre, metal, água, vidro), halos de brilho, sombras
  suaves, cones de luz. Use os gradientes do `<defs>` (criados em `motor/biblioteca.js`).
- **Câmera:** cada cena tem aproximação lenta contínua (automática); use movimentos
  que contam a história (sair pela janela, zoom para dentro do fio, recuar para revelar
  o salão da usina). Transição cruzada entre cenas (automática).
- **Vida ambiente:** nuvens andando, poeira na luz, estrelas, partículas fluindo.
- **Sincronia:** toda animação importante acontece na palavra em que é dita (batidas).
- **Áreas da tela** (respeite para nada ficar escondido):
  - `y < 300`: marca (topo esquerdo) e título do capítulo — não ponha nada importante;
  - `y 300–1420`: ilustração;
  - `y 1480–1670`: legenda; a faixa escura de baixo começa em ~1360.
- Textos dentro da arte: `rotulo()` (pílula colorida) e `callout()` (anotação com
  linha de chamada). Poucos e curtos.

### Identidade (em `aprendendo/identidade/`, não mude sem pedido)

- Marca no topo esquerdo: selo amarelo com lâmpada + "APRENDENDO **FÁCIL**".
- Fonte Nunito (600/800/900). Barra de progresso amarelo→laranja no topo.
- Paleta (fonte única: `marca.json` → `C` no JS e variáveis CSS): fundo `#0a1230`;
  amarelo `#ffd23f`; laranja `#ff8a3d`; verde `#06d6a0`; azul `#4cc9f0`; ciano `#8fe3ff`;
  rosa `#ff5d8f`; vermelho `#ef476f`; cobre `#e08a4b`.
- Abertura: título-gancho em maiúsculas com a palavra-chave em amarelo
  (`gancho` + `gancho_destaque` no roteiro, mostrado por `mostrarGancho()`).
- Capítulos: "PARTE 0N" + título da cena no canto superior (automático).
- Legenda: 4 palavras por vez, branca; a palavra falada fica amarela; as palavras das
  batidas ficam ciano.
- Fim: cartão com o logo se desenhando, "APRENDENDO FÁCIL", botão rosa "SEGUIR" e
  "Qual assunto complicado vem a seguir?".

## Voz e som

- Gemini TTS (`gemini-3.8-flash-tts`), voz **Achird** (escolhida entre Charon,
  Sadaltager, Iapetus e Sulafat). Voz e direção de narrador adulto de divulgação
  científica ficam em `identidade/marca.json` (`voz`). Se quiser tags de emoção, use o campo `tts` da
  cena (ex.: `[positive]`), com as mesmas palavras da `fala`.
- A chave do Gemini fica como **credencial do ambiente** (o proxy injeta o cabeçalho
  `x-goog-api-key` nas chamadas a `generativelanguage.googleapis.com`; a sessão não vê
  a chave). Alternativas: variável `GEMINI_API_KEY` ou `.env` na raiz (ignorado pelo
  git). **Nunca** grave a chave em arquivo versionado nem a mostre no chat.
- Teste rápido: `curl -s -o /dev/null -w "%{http_code}" https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-tts`
  → 200 = chave ok; 403 = credencial ausente/errada.
- `gerar.py` imprime `narração: {'gemini'}`. Se sair outro provedor (edge), a chave não
  funcionou: **pare e avise o dono** em vez de entregar com outra voz.
- Narrações ficam em cache em `data/voz/` (não versionado).
- Efeitos e trilha são sintetizados (`motor/sons.py`, `motor/sfx.py`); cada batida toca
  o som definido em `"sons"` no roteiro do vídeo (`{"evento": ["efeito", ganho]}`;
  sem definição, toca `pop`). Efeitos: whoosh, whoosh_curto, pop, thud, brilho,
  clique, plim, zap, agua, vento, vapor, tampa, urna.

## Como fazer um vídeo novo

0. `python aprendendo/motor/novo.py <tema> "Título"` → cria `aprendendo/videos/<tema>/`.
1. Roteiro em `videos/<tema>/roteiro.json`:
   `slug`, `titulo`, `gancho`, `gancho_destaque`, `voz`, `sons`, e `cenas[]` com `id`, `tipo`, `titulo` (vira o título do capítulo), `fala` e
   `batidas` (`{"palavra exata da fala": "evento"}`, na ordem da fala; inclua a
   pontuação colada se a palavra aparecer com ela, ex.: `"vapor,"`).
2. Cenas em `videos/<tema>/cenas.js`: uma função `CENAS.<tipo>(el, c, B)` por
   cena (veja `videos/eletricidade/cenas.js` e `videos/cargos-politicos/cenas.js`). `B("evento", fração)` dá o instante
   da batida. A primeira cena chama `mostrarGancho(instante)`; a última, `cartaoFinal(el, instante)`.
   (`gerar.py` verifica sozinho, antes da prévia e do render, se a timeline tem erros de
   JavaScript em algum instante — erro trava o quadro: cena vazia e legendas encavaladas.)
3. `python aprendendo/motor/gerar.py aprendendo/videos/<tema> --previa` → fotos de
   3 momentos de cada cena em `output/<tema>/previa/` (folhas
   `contact-sheet-*.jpg`). **Olhe todas** e corrija sobreposição, coisa cortada,
   elemento fora de lugar, legenda presa, texto ilegível. Repita até ficar limpo.
4. `python aprendendo/motor/gerar.py aprendendo/videos/<tema>` → renderiza
   e grava `output/<tema>/<slug>.mp4`. Confira alguns frames do MP4 final
   (`ffmpeg -ss T -i video.mp4 -frames:v 1 f.png`).
   Depois rode o **controle de qualidade** e corrija o que ele apontar antes de entregar:
   `python aprendendo/motor/qa.py output/<tema>/<slug>.mp4 --roteiro aprendendo/videos/<tema>`
   - *piscadas de um quadro* (elemento que some/pula por 1 quadro: defeito de seek do GSAP);
   - *cor* marcada como BT.709 (o `codificar()` já grava; sem isso o celular mostra cor errada);
   - *ritmo*: trechos de mais de 4 s sem batida visual na área da ilustração (regra 6 da
     retenção), com a cena e o segundo. Corrija pondo uma batida numa palavra da fala daquele
     trecho (rótulo, contador, régua, movimento de câmera). O cartão final pode aparecer.
   **Corrigir depois sem renderizar tudo** (editor, `motor/editar.py`): o render completo guarda
   a cópia-mestre (`output/<tema>/mestre_60fps.mp4` + `mestre_agenda.json`). Para refazer só uma
   parte: `python aprendendo/motor/editar.py aprendendo/videos/<tema> --cena 4` (ou `--cenas 3,5`,
   ou `--de 70 --ate 78`). Ele renderiza só aquele trecho da timeline completa (quadros idênticos
   aos do vídeo inteiro), troca os quadros na cópia-mestre, confere a emenda, refaz som e MP4 e
   roda o `qa.py`. Só vale se os tempos não mudaram (mesma fala e cenas); se mudaram, ele recusa
   e é preciso o render completo. Use para qualquer correção visual (posição, cor, rótulo, giro).
5. O arquivo precisa ter **menos de 30 MB** (limite de envio). O encode final usa CRF 24 e,
   se passar do limite (granulação/3D comprimem pior), refaz em 2 passadas para caber.
   Render a 60 fps (desfoque de movimento) com 4 navegadores em paralelo (VIDEO_WORKERS muda).

### Biblioteca comum (`motor/biblioteca.js`)

- Desenhos (devolvem SVG em texto): `sombra`, `halo`, `nuvem`, `estrelas`, `eletron`,
  `lampada` (+ `acender(lamp, t)`), `torre`, `casa`, `usinaT`, `turbinaR`, `eolica`,
  `rotulo`, `callout`. `P(x, y, escala, classe, svg)` posiciona algo num invólucro.
- Pessoas (`pessoa`, `gente`, `personagem`): existem, mas o dono pediu vídeos **sem bonecos**.
- Ícones (`ICONE.saude`, `escola`, `lixo`, `buraco`, `onibus`, `policia`, `hospital`,
  `ensino`, `estrada`, `economia`, `globo`, `forcas`) e medalhões (`medalha`, `medalhas`),
  `etiqueta`, `bandeira`, prédios (`palacio`, `moderno`), `congresso`, `planalto`, mapa do
  Brasil (`brasil`), `documento`, `carimbo`, `check`, `xis`, `seta`, `lupa`.
- Da identidade (`identidade/identidade.js`): `C` (paleta), `mostrarGancho`, `cartaoFinal`.
- Animações: `pop`, `surge`, `desenhar` (DrawSVG), `girar`, `balancar`, `callAnim`,
  `fluxo` (partículas andando num caminho), `poeira`. Plugins: MotionPath, DrawSVG,
  MorphSVG.
- Se um desenho novo servir para vários temas, coloque-o em `motor/biblioteca.js`; se
  for só do tema, deixe no `cenas.js` do vídeo.

### Efeitos de luz e pós-produção (`motor/efeitos.js`) — use em todo vídeo

- `brilhar(el, forte)`: glow em luzes, fios com corrente, sol, fogo, elétrons.
- `raiosLuz(x, y, n, abertura, comprimento, ângulo, classe)` + `animarRaios(g, t, fim)`:
  raios de luz (de lâmpadas, janelas, sol, refletores).
- `bokeh(pai, n, seed, [x, y, w, h], t, fim, cores)`: discos de luz fora de foco (profundidade).
- `faiscas(pai, x, y, n, t, fim, cor, alcance)`: faíscas, brasas, respingos.
- `desfocar(el, 1|2|3)`: desfoque de profundidade em planos de fundo.
- `flare(x, y, escala)`: reflexo de lente em luz forte.
- Granulação de filme: automática em todo vídeo.
- Padrão do vídeo da eletricidade: desenhe a cena e aplique os efeitos depois, com
  `_comEfeitos("tipo", (el, c, B, frente) => {...})` no fim do `cenas.js`.

### Técnicas das skills do HyperFrames (`motor/efeitos.js`) — padrão desde o vídeo do navio

Outras skills instaladas em `.claude/skills/` para consulta: `gsap-*` (oficiais do GSAP),
`motion-design`, `motion-director`, `motion-effects`, `high-end-visual-design`,
`vox-explainer`, `animated-chart` e `video-review-loop` (revisão do MP4 final).

Referência completa: `videos/navio/cenas.js`. Todas são funções puras do tempo (seguras para seek).

- **Zoom que revela detalhes** (zoom semântico, da skill motion-explainer; aprovado pelo dono;
  referência: `videos/tsunami/cenas.js`, cena 7, sensor do fundo do mar): desenhe dentro do
  objeto detalhes minúsculos (texto ~5 px com `letter-spacing` ~0,1 px, linhas de 0,5 px:
  peças internas, medidas, uma leitura que muda) num `<g>` com `opacity 0`; com `cameraFases`
  mergulhe a ~6× no objeto na palavra em que ele é dito, mostre os detalhes quando a escala passa
  de ~2,8×, esconda o rótulo de fora e os painéis que cobririam o objeto, e recue antes da cena
  seguinte. Use onde houver um objeto que valha "abrir" (um aparelho, uma peça, uma célula).
- **Sem bonecos** (pedido do dono): não use pessoas/personagens (`pessoa`, `gente`,
  `personagem`); conte a história com objetos (bola de praia, papiro, pulmões, colete…).
- **Câmera em fases**: o mundo da cena fica em `<g class="cam">` e
  `cameraFases(g, [[t, escala, focoX, focoY], …], c.fim)` leva o foco ao centro com
  micro-deriva. Abra fechado e revele, aproxime no detalhe, recue para o plano geral.
  Rótulos que não podem sair do quadro ficam FORA do `.cam`. Fundos (`ceu()`, `faixa()`)
  vão de -200 a W+200 para a câmera não mostrar borda.
- **Foco seletivo**: `focoSeletivo(invólucro, [[ini, fim, px]], c.fim)` desfoca o plano
  que não importa naquele momento (num invólucro sem outro filtro).
- **Contador**: `contador(<text>, de, até, t, dur, fmt)` para números ditos na fala.
- **Entradas variadas**: `entrar(el, t, "escala|esq|dir|baixo|cima|mola")` e
  `sair(el, t, direção)` — varie direção e curva; saída mais rápida que a entrada.
- **Brilho no rótulo**: `reflexoPassando(g, texto, tamanho, t)` nos rótulos principais.
- **Física**: `respingo(pai, x, y, t, n)` (gotas balísticas) e `bolhasSobem(...)`.
- **Água**: `ondas()`, `cintilar()` e `ondular()` (reflexos ondulando; pesa no render,
  use em poucos elementos).
- Render final com `--cinema` (bloom, LUT `motor/cinema.cube`, luz vazando). Leva ~1 h
  para um vídeo de 2min45; `--cena N` renderiza só uma cena para testar.
- `gerar.py` só verifica erros de JavaScript se houver Python Playwright; sem ele, rode
  `PRODUCER_HEADLESS_SHELL_PATH=$(ls -d /opt/pw-browsers/chromium_headless_shell-*/*/headless_shell | tail -1) node aprendendo/motor/verificar.cjs output/<tema>/build`.

### Animações Lottie (`motor/lottie.js`) — personagens e elementos de designers

- 3D: **cancelado pelo dono** (tsunami v2). Não use 3D em vídeo novo; use imagens geradas.
  O que existe fica só para os vídeos antigos. (Antes: 3D em poucas cenas-chave, render por
  software, pesado.) Oceano realista pronto:
  `oceano3D(k, {sol, mar, horizonte, zenite, solCor})` + `navio3D()` + `boiar3D()` em
  `motor/oceano.js` (da skill `3d-ultra-realistic-water`, adaptado ao three r149).
  Numa cena 3D a camada 3D fica ACIMA do mundo 2D: rótulos/HUD vão no 5º parâmetro
  `f` (frente) de `CENAS.tipo(el, c, B, i, f)`; para seguir um objeto 3D na tela use
  `projetar(k, vetor)` (ver `videos/tsunami/cenas.js`). Skills de 3D: `threejs-*`,
  `3d-ultra-realistic-water`, `3d-underwater-god-rays`, `3d-sky-background`.
- Para pessoas, fogo, raios, vapor, confete, ícones animados etc., prefira Lottie da
  LottieFiles (licença Lottie Simple: uso comercial, sem atribuição obrigatória):
  1. `python aprendendo/motor/lottie.py buscar "man walking"` → lista as mais baixadas e
     grava a folha de prévias em `output/_lottie/<busca>.jpg` (olhe e escolha o id);
  2. `python aprendendo/motor/lottie.py baixar <id> <tema> <nome> [--paleta]` → salva em
     `videos/<tema>/lottie/<nome>.json` (tira fundo sólido; `--paleta` recolore com as cores
     da marca) e registra a origem em `creditos.json`;
  3. na cena: `const g = lottieEm(pai, "nome", x, y, largura, altura, { ini, fim, loop, vel,
     espelhar, quadroInicial, corte })` — `g` pode ser animado (pop, surge...).
- Escolha estilo coerente com o canal (cores chapadas, sem contorno preto grosso).
  Animações com imagens externas são recusadas. Confira na prévia se aparecem.

### Acabamento de cinema (automático, definido em `identidade/marca.json` → `video`)

- Render a 60 fps e mistura para 30 → **desfoque de movimento** (`desfoque_movimento`).
- `tratamento_cor`: contraste, saturação, vinheta, aberração cromática leve e granulação
  de filme, aplicados pelo ffmpeg no `codificar()` (não pesam no navegador).
- `volume(el)` (efeitos.js): sombra interna + luz de contorno estilo Kurzgesagt em objetos
  principais (use em poucos elementos: é um filtro).

### Som (`motor/sons.py`)

- Efeitos "de cinema" com reverb (pop, plim, whoosh, thud, brilho, zap) e `transicao`
  automática em cada troca de cena. Trilha com pad, dedilhado com eco, sub, batida
  suave e reverb; sobe nas pausas e abaixa sob a voz. Master a ~-13 LUFS.
- **Em teste (aguardando aprovação do dono; opcionais no roteiro):** `"impactos": {"evento":
  atraso}` = grande momento com riser que cresce, ~0,28 s de silêncio e impacto na revelação;
  `"logo_sonoro": true` = assinatura sonora no cartão final (batida `cta`); `"corte_j": 0.3` =
  a voz da cena seguinte começa 0,3 s antes da imagem trocar. Teste rápido de um trecho:
  `gerar.py <pasta> --cena 6-7`.
- Para avaliar a mixagem sem ouvir: mande um trecho em MP3 ao `gemini-3.8-flash`
  pedindo notas de clareza da voz, equilíbrio e efeitos.

### Armadilhas do GSAP/HyperFrames (já custaram retrabalho)

- A timeline é determinística: nada de `Math.random` (use `prng(seed)`), nada de
  `setTimeout`/eventos; tudo vai na `tl`.
- `fromTo` que começa depois do início precisa de `immediateRender: false`.
- **Nunca** anime `x`/`y`/`scale` num elemento SVG que tem atributo `transform`: o GSAP
  sobrescreve a posição. Use o padrão invólucro (`P(...)` ou
  `<g transform="..."><g class="anima">`) e anime o `<g>` de dentro.
- Com `svgOrigin`, coloque o mesmo `svgOrigin` no estado inicial **e** no final do
  `fromTo`, senão a cena sai deslocada.
- Câmera que anda **e** dá zoom (plano aberto): anime o atributo, ex.
  `tl.to(cam, { attr: { transform: "translate(0 430) scale(0.5)" } })`, com
  `transform="translate(0 0) scale(1)"` no `<g>`. Misturar x/y/scale/svgOrigin do GSAP
  em passos diferentes deslocou a cena.
- Bloco de legenda muito curto é juntado ao seguinte automaticamente; não mexa nisso.

## Skills do HyperFrames (`.claude/skills/`)

Instaladas com `npx skills add heygen-com/hyperframes` (versões em `skills-lock.json`;
atualizar: `npx skills update -p -y`). São a documentação oficial do motor que já usamos
(`hyperframes-core`, `hyperframes-animation`, `hyperframes-cli`, `hyperframes-creative`…):
consulte-as para técnicas de animação, legendas, transições e efeitos. O vídeo do canal
continua sendo feito pelo fluxo deste guia (`novo.py` → roteiro → `cenas.js` → `gerar.py`);
não troque pelo fluxo de outra skill (ex.: `faceless-explainer`) sem pedido do dono.

## Git

- Trabalhe na branch indicada pela sessão; commit + push ao terminar. Não abra PR sem
  pedido. `output/`, `data/voz/`, `node_modules/` e `.env` não são versionados.
