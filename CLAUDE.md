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
descrição para o TikTok seguindo "Descrição e hashtags" abaixo.

### Descrição e hashtags (sempre com técnicas de engajamento e alcance)

- **1ª linha = gancho** (até ~70 caracteres, é o que aparece antes do "mais"): número
  chocante, paradoxo ou pergunta. Não repita o título do vídeo; complemente.
- **Palavras de busca (SEO do TikTok):** escreva na descrição, em linguagem natural, o que
  a pessoa digitaria na busca ("como funciona o raio", "por que o trovão faz barulho").
  Use as mesmas palavras do texto na tela e da fala.
- **Loop aberto:** prometa algo que só se resolve no vídeo ("o fim muda tudo") sem entregar
  a resposta, para segurar até o final.
- **Pergunta para comentar:** uma pergunta fácil de responder (opinião, experiência pessoal,
  "você sabia?", escolha entre A ou B). Comentário é o sinal que mais pesa.
- **Pedido de salvar/compartilhar:** "salva pra mostrar pra alguém" ou "manda pra quem
  tem medo de raio". Salvamento e compartilhamento aumentam o alcance.
- **Sugestão de comentário fixado:** ofereça um comentário para o dono fixar (curiosidade
  extra ou pergunta) e puxar conversa.
- **Hashtags: 4–6, misturando** 1–2 amplas (#ciencia, #curiosidades), 2–3 do nicho do tema
  (#buraconegro, #astronomia) e a da marca (#aprendendofacil). Nada de lista enorme nem
  hashtags sem relação (#fyp/#viral não ajudam). Sem emoji demais: 1–2 no máximo.
- Mesma descrição serve para Reels e Shorts (no Shorts, coloque #shorts).
- Grave a descrição e as hashtags no roteiro (`"descricao"`, `"hashtags"`, logo depois de
  `"titulo"`): o `gerar.py` põe título, descrição e hashtags nos metadados do MP4.
  `gerar.py <pasta> --metadados` regrava só isso num MP4 pronto, sem renderizar.
  Metadados não dão alcance (as redes recodificam o vídeo); o que dá alcance é a descrição
  digitada no post, as palavras faladas e o texto na tela.

### Escolha do tema (pedido do dono: sempre)

- Antes de cada vídeo novo, **pesquise os assuntos mais buscados no Brasil no momento**
  (Google Trends "Em alta" BR, notícias da semana, via WebSearch) e escolha um que renda um
  "assunto complicado explicado fácil" (ciência, clima, economia, regras, tecnologia...).
- Comece por `python aprendendo/motor/tendencias.py [horas] [quantos]`: lista o "Em alta" do
  Google Brasil (últimas 24 h por padrão) ordenado por volume de buscas, com categoria e buscas
  relacionadas. TikTok Creative Center ainda não abre aqui (faltam os domínios de CDN da
  ByteDance na rede); Instagram fica de fora (pedido do dono).
- Confira em `aprendendo/videos/` se o tema **ainda não foi feito** (sempre, antes de qualquer vídeo).
- Pedidos em lista vão para `aprendendo/FILA.md` e são feitos **um de cada vez** (roteiro,
  narração, cenas, render, entrega); não gere todos os roteiros/narrações de uma vez.
- Política: só explique **regras e funcionamento** (como funciona o segundo turno), de forma
  neutra; nunca candidatos, partidos ou opinião. Tragédias: foco no mecanismo e na segurança.
- Confira os fatos (lei, número, data) em fontes confiáveis antes de pôr no roteiro; número
  que não se confirmou fica fora.
- Ao entregar, diga ao dono qual tendência motivou o tema.

## Regras de conteúdo (decididas com o dono do canal)

- **O público é ADULTO.** Só o *método* é simples: técnica de Feynman, "como se
  explicasse para uma criança de 10 anos". Nada infantilizado: sem mascote, sem voz
  de criança, sem "amiguinhos", sem tom de desenho animado infantil.
- Analogias do dia a dia (fila de pessoas, tampa de panela), um passo por vez, sem
  jargão sem explicação. Pode citar o cientista e o ano quando ajudar.
- Duração **mínima de 1min30** (o primeiro vídeo tem 2min20; 1:45–2:30 é o ideal).
- Estrutura que funcionou (`videos/eletricidade/roteiro.json`):
  1. gancho com uma pergunta + situação cotidiana ("Você aperta o interruptor…");
  2. o conceito básico com uma analogia;
  3. a descoberta/o mecanismo central;
  4. como isso é usado na prática (variações);
  5. o caminho até a vida da pessoa;
  6. resumo em 3–4 passos + chamada: "Segue o Aprendendo Fácil e comenta qual
     assunto complicado você quer que eu explique no próximo vídeo."
- Frases curtas e faladas, com "você", "pensa num…", "imagina…".

### Retenção (o dono pediu: "apele com todas as técnicas")

- **1º segundo:** número chocante ou paradoxo, falado e escrito (sem "oi, pessoal").
- **Promessa no gancho** ("fica até o final, porque…") paga só na penúltima cena.
- **Re-gancho a cada ~20–30 s:** fim de cada parte puxa a próxima ("só que tem uma
  pegadinha", "e isso derruba um mito", "agora, a regra que eu prometi"), com texto grande na
  tela na mesma palavra (`tempoPalavras`).
- **Mito derrubado** ou **virada** no meio; **pergunta ao espectador** ("por que você não
  sente?") antes da resposta.
- Algo muda na tela a cada 2–3 s (batidas); nenhuma cena parada.
- Resumo curto e rápido; o cartão final entra durante a chamada.

### Abertura: dor ou curiosidade, nunca o assunto (dica de ouro do dono)

- **Nunca** comece com "hoje vamos falar sobre X" / "vou te explicar X". Comece pela **dor ou
  curiosidade concreta** da pessoa, numa situação do dia a dia: "Você já se perguntou por que o
  seu fone de 200 reais consegue silenciar o motor de um avião?", "Você já reparou que o
  carrinho do mercado sai cada vez mais vazio?", "Tenta agora: faz cócegas no seu pé".
- O assunto (o nome técnico) só aparece depois que a pergunta já prendeu.

### O que a ciência apoia (pesquisa feita com o dono; use em todo roteiro)

- **Curiosidade de "meio-saber"** (Loewenstein 1994; Kang et al. 2009; Gruber et al. 2014):
  a curiosidade é máxima quando a pessoa *acha* que sabe. Gancho e viradas em forma de
  "Você acha que…?" sobre algo popular; mito derrubado.
- **Promessa só com lacuna real** (o efeito Zeigarnik não se replicou, meta-análise 2025):
  "no final eu te conto X" precisa de um X curioso, não "espera que tem mais".
- **Emoção que ativa** (Berger & Milkman 2012): pelo menos 1 momento de **assombro**
  (escala, número gigante) por vídeo; evite tom triste/desanimado.
- **Utilidade prática** aumenta compartilhamento: 1 dica acionável curta por vídeo.
- **Tom de conversa com "você"** e voz humana amigável (Mayer: personalização d≈0,79).
- **Corte curiosidades soltas** (detalhes sedutores atrapalham): todo fato serve à explicação.
- **Vídeos mais curtos prendem mais** (Guo et al. 2014): mire 1:45–2:20; corte toda frase que não serve.
- Voz: um teste A/B (out/2026) mostrou que a direção atual da Achird soa mais enérgica que uma
  direção "mais entusiasmada"; mantenha a atual.

## Padrão visual (o dono pediu explicitamente "profissional", não "simples")

Estilo de canal de divulgação científica premium (tipo Kurzgesagt), em motion design
vetorial. Uma versão "simples" (ilustrações soltas no meio da tela) foi **rejeitada**.

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
5. O arquivo precisa ter **menos de 30 MB** (limite de envio). O encode final usa CRF 24 e,
   se passar do limite (granulação/3D comprimem pior), refaz em 2 passadas para caber.
   Render a 60 fps (desfoque de movimento) com 4 navegadores em paralelo (VIDEO_WORKERS muda).

### Biblioteca comum (`motor/biblioteca.js`)

- Desenhos (devolvem SVG em texto): `sombra`, `halo`, `nuvem`, `estrelas`, `eletron`,
  `lampada` (+ `acender(lamp, t)`), `torre`, `casa`, `usinaT`, `turbinaR`, `eolica`,
  `rotulo`, `callout`. `P(x, y, escala, classe, svg)` posiciona algo num invólucro.
- Pessoas: `pessoa(corpo, pele, cabelo, {gravata, faixa, prancheta})` e `gente(k, opções)`
  (variações prontas de cor/pele/cabelo).
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

### Animações Lottie (`motor/lottie.js`) — personagens e elementos de designers

- O dono achou que o **3D não compensou** o tempo de render (~40 min): não use 3D
  (`motor/tres.js` continua disponível, mas fica fora dos vídeos).
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
- **Nomes globais:** o `cenas.js` divide o escopo global com o motor (`PT`, `BR`, `nuvem`, `COR`...).
  Uma `const` com nome repetido apaga o vídeo inteiro (tela vazia). Dê nomes do próprio vídeo
  (ex.: `BRR`, `nuvemP`). O `gerar.py --so-montar` já verifica e acusa esse erro.

## Custos e ferramentas (decidido com o dono)

- **O Gemini é só para a narração.** Não use os modelos pagos de imagem (Nano Banana/Imagen)
  nem de vídeo (Veo), mesmo que a credencial do ambiente permita.
- Rejeitados pelo dono: 3D (render lento) e o estilo "pintado" (p5.brush), que pareceu artificial.
  Em teste: estilo **sem desenhos**, com tipografia animada + luz/partículas abstratas, e o estilo
  **pontos de luz** (objetos desenhados com pontos; o dono gostou do globo de pontos).
- Skills de motion design em `.claude/skills/` (origem, licenças e cuidados em
  `.claude/skills/README.md`). Elas ensinam técnica; o processo do canal continua este guia
  (`motor/gerar.py`, identidade, regras de conteúdo), mesmo que a skill diga ser "obrigatória".
- `motor/motion-director.js` (MIT): animações de texto prontas (`MotionDirector.buildSentence`,
  `slam`, `whip`, `typeOn`, `textPortal`, `countUp`...), todas na `tl`.
- Biblioteca só de um vídeo: ponha os `.js` em `videos/<tema>/libs/`; são carregados antes do
  `cenas.js`.

### Estilo "pontos de luz" (`motor/pontos.js`) — aprovado para teste no vídeo da cerveja

- Tudo é nuvem de pontos num canvas por cena, com brilho aditivo (sem desenho de contorno).
  Exemplo completo: `videos/cerveja-congela/cenas.js`; globo: `experimentos/estilo-globo/`.
- `const T = telaPontos(el, c)` → canvas da cena; `T.quadro((x, t) => {...})` desenha cada quadro
  (x já limpo, modo "lighter"). `palcoTexto(el, [[id, y, tam, texto, classes, estilo]])` → textos
  por cima (classes `pt-ci`, `pt-am`, `pt-la`, `pt-ve`, `pt-fino`), animados com MotionDirector.
- `tempoPalavras(c)("palavra", n)` → instante da n-ésima vez que a palavra é dita (para sincronizar
  além das batidas; cuidado com palavras repetidas como "o", "a").
- Primitivas: `brilhoP`, `pontoP`, `discoP`, `anelP`, `linhaP`, `rotuloP`, `ambienteP`/`desenharAmbiente`.
- Objetos: `garrafaPontos` + `desenharGarrafa` (vidro, líquido, tampa, `gelo(p)`, `geada(p)`,
  `geloMedio`), `projGarrafa`, `moleculaP` (H₂O), `redeHex` (gelo), `flocoP`, `bolhaP`,
  `termometroP`. `PT` (lerp, ss, out, jan...) e `COR`.
- Velocidade alta de rotação "dobra" com o desfoque de movimento: texto girando deve ir devagar.
- `voz.realinhar(json)` refaz a divisão das palavras de uma narração em cache sem chamar nada
  (o alinhamento passou a ignorar respirações no começo da frase, que espremiam as palavras).

## Git

- Trabalhe na branch indicada pela sessão; commit + push ao terminar. Não abra PR sem
  pedido. `output/`, `data/voz/`, `node_modules/` e `.env` não são versionados.
