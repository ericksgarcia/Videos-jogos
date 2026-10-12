# Luz da Palavra — guia do canal

Segundo canal do repositório: vídeos verticais **cristãos** para o TikTok, no estilo "pontos de luz"
do Aprendendo Fácil. Usa o mesmo motor (`aprendendo/motor/`), com identidade, regras e vídeos próprios.
Leia este guia inteiro antes de criar ou alterar um vídeo do canal.

## Organização (não misture com o Aprendendo Fácil)

```
luz-da-palavra/
  identidade/   A MARCA do canal: marca.json (nome, textos, CTA, voz, paleta, fontes, trilha,
                capa, modelos de roteiro, tradução da Bíblia), marca.css, identidade.js,
                fontes/ (locais, SIL OFL) e propostas/ (as opções de identidade mostradas ao dono).
                Manual: identidade/README.md
  videos/<tema>/  UM VÍDEO POR PASTA — roteiro.json ("canal": "luz-da-palavra") + cenas.js
```

- Vídeo novo: `python aprendendo/motor/novo.py --canal luz-da-palavra <tema> "Título" --formato versiculo`
  (formatos: `versiculo`, `historia`, `significado`, `oracao`).
- Prévia e render: `python aprendendo/motor/gerar.py luz-da-palavra/videos/<tema> [--previa]`.
  Saída (não versionada): `output/luz-da-palavra/<tema>/` (MP4, `capa.jpg`, `previa/`, `build/`).
- O motor é compartilhado: mudança nele tem de ser **retrocompatível** (o Aprendendo Fácil continua
  igual; prove com `--previa` de um vídeo antigo antes e depois). Não edite `aprendendo/identidade/`
  nem `aprendendo/videos/`.
- `gerar.py ... --marca luz-da-palavra/identidade/propostas/<x>.json` testa outra identidade sem trocar
  a oficial (saída em `output/luz-da-palavra/<tema>-<x>/`).

## Do CLAUDE.md da raiz, valem aqui

O padrão visual e os **7 itens do "Padrão de qualidade"** (pontos de luz com volume, morph, câmera com
profundidade, textos nítidos, física, capa, final em loop), as áreas da tela (inclusive a lateral
direita dos botões), as armadilhas do GSAP, os **nomes globais** (dê nomes próprios do vídeo às
`const` do `cenas.js`), a voz/TTS (Gemini, credencial do ambiente), o pipeline do `gerar.py`, o limite
de 30 MB e as regras de Git e segurança.

**Não** valem as regras de conteúdo do Aprendendo Fácil (método Feynman, "explicar fácil", tendências
do Google, duração mínima de 1:30).

## Formatos (ordem de prioridade do dono)

1. **Versículo do dia** — 20–40 s.
2. **História bíblica** — 1:30–2:30.
3. **"O que significa…?"** — 40–90 s.
4. **Oração / meditação guiada** — 3–5 min.

## Regras de conteúdo (sempre)

- **Público:** cristão em geral, adulto. Tom de **esperança, assombro e acolhimento**.
- **Respeito acima de tudo.** Personagens (inclusive Jesus e Maria) em traço de luz com rosto de perfil
  (pedido do dono, out/2026), sempre com dignidade. Nada de caricatura.
- **Fidelidade ao texto:** todo versículo citado tem a **referência exata na tela** (ex.: "João 8:12"),
  com `mostrarVersiculo(texto, "João 8:12", t0, t1)`. Confira cada referência e citação antes de pôr
  no roteiro.
- **Tradução:** só a de domínio público registrada em `identidade/README.md` (Almeida, Edição Revista
  e Corrigida de 1911/1914). NVI, NAA, ARA, NTLH, ACF, ARC atual da SBB e outras modernas têm
  direitos autorais: não use. Na dúvida, **parafraseie** e mostre a referência.
- Sem polêmica entre denominações (santos, Maria, batismo, dons…), sem política, sem candidatos,
  sem "o fim do mundo é amanhã".
- Sem promessa de prosperidade, cura ou milagre garantido. Sem medo nem culpa para prender a atenção.
- Clima sagrado, contemplativo, quente e premium. Nada de brega nem de "imagem de bom dia".

## Retenção (adaptada ao canal)

**Decisões do dono (out/2026), valem para todo vídeo:**

- **Gancho = emoção direta com "você"**, não curiosidade: "Se hoje você chorou escondido, esse
  versículo é pra você." O `gancho` na tela é a mesma ideia em até ~5 palavras ("PRA QUEM CHOROU HOJE").
- **Final em loop verdadeiro:** a última frase fica em aberto e se completa com a primeira quando o
  vídeo recomeça ("Salva esse vídeo, segue o Luz da Palavra, e lembra:" → "Se hoje você chorou
  escondido…"). O **pedido de salvar** vai falado nessa última frase (sem quebrar o loop).
- **Nada parado na pergunta e no cartão final:** `cenaPergunta` recebe a forma do fim da cena anterior
  (`de`) e a transforma no balão; as opções entram em cascata, com ícone, e "batem" quando ditas.
  O cartão final tem brasas subindo e a chama tremulando.
- **Duração:** versículo do dia com **~45–55 s** (o dono pediu "um pouquinho mais longo" que 40 s);
  use o tempo extra para contexto e para uma cena "para você", nunca para enrolar.
- **Pergunta para os comentários: UMA só, forte**, que a pessoa queira responder (nada de "1 ou 2").
  Pessoal, emocional e fácil: responder numa palavra, marcar alguém, contar um pedido. Ex.: "Quem você
  conhece que anda chorando escondido? Marca essa pessoa aqui do lado." / "Qual medo você quer
  entregar hoje? Escreve numa palavra só." Use `cenaPergunta(el, c, B, { texto, sub, icone, de })`
  (batida "comenta": o ícone voa até o botão de comentários). Não prometa resposta.
- **Personagens em line art em TODO vídeo (símbolo do canal):** pessoas desenhadas em traço de luz,
  com roupa e acessórios do personagem e **rosto de perfil** (pedido do dono, out/2026; kit em `identidade/kit/`), sobre o mundo em pontos de luz. Use
  `personagem(x, t, pose, { tipo, x, chao, H, dir, cam, z })` (tipos: davi, pessoa, homem, mulher, jesus,
  golias, crianca) com as poses de `POSES` (de_pe, andar(fase), ajoelhado, orando, sentado, segurando,
  entregando, abracando, bracos_abertos, funda(giro), lanca, caido, encolhido, olhando_cima) e `poseMix`.
  Opções úteis: `rot` (gira o corpo em volta dos pés, ex.: o gigante caindo), `medir: true` (só devolve
  mãos/cabeça/ombro/quadril, sem desenhar) e `atras(ctx, info)` (desenha o que a mão de trás segura,
  atrás do corpo). O retorno traz `maos`, `cabeca`, `ombro`, `quadril`, `escala`, `d`.
  Objetos que o personagem segura, no mesmo traço: `objetoLinha(x, tipo, { mao, H, k, d, cor, a, ang, giro })`
  (lanca, espada, escudo, cajado, funda, pao, peixe, cesto, pedra). O personagem fica na camada nítida, por
  cima dos pontos: objeto em pontos que deve aparecer na mão vai um pouco acima dela (ou use `objetoLinha`).
  Cenário e objetos grandes continuam em pontos de luz. 3D só quando melhorar muito a qualidade.
- **Pedido de apoio no MEIO do vídeo (pedido do dono, out/2026): em todo vídeo.** Uma cena curta
  (`{"tipo": "apoio"}` no roteiro, ~5 s, `cenaApoio` na identidade: luzes soltas se juntam em mãos que oram,
  botão "+ SEGUIR" com seta para o perfil e seta para os comentários com "amém"). Linha do dono: **"sei que
  nosso público cristão é unido e vai apoiar seguindo o canal"**. Técnicas: identidade ("você que é de
  Cristo", "a família cristã é unida"), custo baixo ("leva um segundo"), propósito ("pra essa palavra chegar
  em quem precisa") e o pedido logo **depois de um laço aberto** (a pessoa fica para ver a resposta).
  Onde: entre 35% e 50% do vídeo (versículo do dia: ~15–20 s; história: ~40–60 s), nunca nos primeiros 12 s.
  Fala rápida: 12–18 palavras, no máximo ~6 s; batidas `"unida."`→`unido`, `segue`→`segue`, `comenta`→`comenta` (ajuste à frase).
  Alterne as frases entre vídeos:
  1. "Rapidinho: eu sei que a família cristã é unida. Segue o Luz da Palavra e comenta amém pra essa palavra ir longe."
  2. "Antes de continuar: eu sei que o povo de Deus é unido e apoia quem leva a Palavra. Segue o canal e comenta amém, leva um segundo."
  3. "Eu sei que quem é de Cristo é unido e não deixa a Palavra parar. Segue o Luz da Palavra e comenta amém pra ela ir mais longe."
  4. "Rapidinho: cristão é unido, cristão apoia cristão. Se essa palavra está falando com você, segue o canal e comenta amém."
  Limite: sem culpa nem medo ("se não seguir…", "quem não comentar não é cristão"), regra do canal.
- **Personagens bíblicos específicos: pesquise antes de desenhar (pedido do dono).** Para cada personagem
  conhecido da história (Moisés, Noé, João Batista, Pedro, Golias, anjo Gabriel…), pesquise (WebSearch) o que
  a Bíblia descreve (ex.: Davi ruivo, 1 Sm 16:12; Golias com elmo de bronze e couraça de escamas, 1 Sm 17:5–7;
  João Batista com roupa de pelo de camelo e cinto de couro, Mt 3:4) e a iconografia tradicional em arte de
  domínio público (Rembrandt, Doré, Tissot, ícones antigos): roupa, cores, objetos, cabelo/barba, idade.
  Monte uma ficha no `kit/2-elenco.js` (com a fonte num comentário) e desenhe as peças que faltarem no
  estilo do kit. Arte moderna (filmes, séries, ilustrações com direito autoral) não se copia: no máximo
  serve para conferir atributos.
- **Fila sem parar:** ao entregar um vídeo, comece o próximo da `FILA.md` sem esperar confirmação.
- **Um vídeo por vez, do começo ao fim (pedido do dono):** roteiro → narração → personagens/cenas →
  prévia → render → entrega (MP4 + capa + legenda + comentário fixado) → commit, e **só então** o
  próximo. Não adiante roteiro, narração nem cenas do próximo vídeo enquanto o atual renderiza.
- **Selo de série** ("Versículo do dia #N") só quando o vídeo fizer parte de uma série.
- **3D** (`motor/tres.js`) é permitido neste canal **só quando melhorar muito a qualidade** do vídeo
  (o render fica bem mais lento).

- **1º segundo:** a imagem mais bonita já no quadro 0, em movimento, e a frase mais forte na primeira
  palavra ("Antes de existir qualquer coisa… havia só escuridão").
- **Laço aberto:** anuncie algo que só se resolve no fim ("e o detalhe que quase ninguém percebe nessa
  história, eu te mostro no final").
- Vídeo acima de 1 min: **re-gancho a cada 20–30 s**; algo muda na tela a cada 2–3 s.
- **Pergunta para os comentários em todo vídeo:** curta, falada e escrita, com balão e seta para o
  botão de comentários na **lateral direita** (`balaoPergunta` + `setaComentarios`; nunca "aí embaixo");
  uma pergunta só, forte (ver decisões acima); "escreve 'amém' se…" no máximo de vez em quando;
  não prometa resposta.
- Final em loop (automático) e chamada para seguir (`cta_fala` do `marca.json`).

## Visual do canal

- Cada cena é um **ambiente completo** com profundidade (céu estrelado, deserto, mar, monte), nunca um
  ícone solto no meio da tela. Fundo da `telaGPU`: `{ fundo: LUZ.fundo.map((q) => q * 0.9) }`.
- Cores prontas da identidade: `LUZ.ouro`, `LUZ.luz`, `LUZ.ambar`, `LUZ.branco`, `LUZ.azul`,
  `LUZ.vinho` (0–1, para `desenharForma`/`morfo`) e `LUZS.*` ("r,g,b", para `brilhoP`/`rotuloP`).
- Ícones Phosphor que servem: cross, church, hands-praying, bread, wine, fish, bird (pomba), flame,
  fire, crown, book-open, scroll, star, sun, moon, rainbow, mountains, tree, plant, drop, waves, boat,
  anchor, lighthouse, heart, hand-heart, door, path. **Não existe ovelha.** O que faltar (cordeiro,
  arca, tábuas da lei, sarça, cálice, túmulo com pedra, mar se abrindo) é forma própria com
  `formaPontos({ desenho })`.
- Morphs que contam a história: água → vinho; 1 pão → muitos; semente → árvore; pó → pessoa;
  escuridão → luz; chama → pomba; cruz → coração.
- Logo em pontos em qualquer cena: `desenharForma(nv, logoForma(), {...})`.

## Identidade em código (`identidade/identidade.js`)

- `mostrarGancho(sai)` — abertura com sobretítulo, ornamento e o gancho em serifa (destaque dourado).
- `mostrarVersiculo(texto, ref, t0, t1, { y, destaque, tempos, tam })` — versículo em serifa itálica
  + referência; `tempos` sincroniza cada palavra com a fala (`tempoPalavras(c)`).
- Capítulos em numerais romanos (cena com `"titulo": ""` não tem capítulo; versículo do dia não usa).
- Legenda: 4 palavras, branco quente; a falada fica dourada.
- `cartaoFinal(el, t)` — o logo se forma de pontos de luz, nome, botão SEGUIR e a frase do canal.
- Trilha `contemplativa` (sem batida: coro, harpa, grave, reverb de catedral); efeitos novos `sino` e
  `respiro` (transição suave).

## Narração: um pedido por vídeo

A cota do Gemini TTS é por pedido (100 por dia no projeto da chave). O canal tem `"um_pedido": true` em
`identidade/marca.json` → `voz`: o `gerar.py` narra o vídeo inteiro numa única leitura
(`voz.narrar_video`) e corta o áudio por cena nas pausas entre elas. Um vídeo gasta 1 pedido (antes, 1 por
cena), e a voz sai contínua. Vídeos antigos, com todas as cenas no cache por cena, continuam usando esse
cache. Se a leitura inteira falhar, volta a narrar cena a cena.

## Entrega (cada vídeo)

1. Roteiro, cenas, `--previa`; olhe todas as folhas e corrija até ficar limpo.
2. Render; confira quadros do MP4 final; menos de 30 MB. A narração tem de sair `{'gemini'}`; se não,
   pare e avise o dono.
3. **Legenda junto com o vídeo (pedido do dono):** no roteiro, `descricao` (gancho na 1ª linha, palavras
   de busca, pergunta para comentar, pedido de salvar/compartilhar), `hashtags` (4–6: 1–2 amplas como
   #biblia #fe, 2–3 do tema e #luzdapalavra) e `comentario_fixado`. Rode
   `python luz-da-palavra/legenda.py luz-da-palavra/videos/<tema>` e envie **num único `SendUserFile`** o
   MP4 + `capa.jpg`, com a legenda e o comentário para fixar **escritos no `caption`** do envio. Sem
   arquivo de legenda.
4. Commit + push na branch de trabalho. Sem PR sem pedido. Repositório público: nunca commite chaves
   nem o `.env`.
