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
  1. gancho com uma pergunta + situação cotidiana ("Você aperta o interruptor…");
  2. o conceito básico com uma analogia;
  3. a descoberta/o mecanismo central;
  4. como isso é usado na prática (variações);
  5. o caminho até a vida da pessoa;
  6. resumo em 3–4 passos + chamada: "Segue o Aprendendo Fácil e comenta qual
     assunto complicado você quer que eu explique no próximo vídeo."
- Frases curtas e faladas, com "você", "pensa num…", "imagina…".

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
3. `python aprendendo/motor/gerar.py aprendendo/videos/<tema> --previa` → fotos de
   3 momentos de cada cena em `output/<tema>/previa/` (folhas
   `contact-sheet-*.jpg`). **Olhe todas** e corrija sobreposição, coisa cortada,
   elemento fora de lugar, legenda presa, texto ilegível. Repita até ficar limpo.
4. `python aprendendo/motor/gerar.py aprendendo/videos/<tema>` → renderiza (~5 min)
   e grava `output/<tema>/<slug>.mp4`. Confira alguns frames do MP4 final
   (`ffmpeg -ss T -i video.mp4 -frames:v 1 f.png`).
5. O arquivo precisa ter **menos de 30 MB** (limite de envio); o encode final em
   CRF 24 dá ~16–20 MB para 2min20.

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

## Git

- Trabalhe na branch indicada pela sessão; commit + push ao terminar. Não abra PR sem
  pedido. `output/`, `data/voz/`, `node_modules/` e `.env` não são versionados.
