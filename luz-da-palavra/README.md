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
- **Respeito acima de tudo.** Jesus, Maria, anjos e profetas aparecem só como **silhuetas de luz**,
  sem rosto nem feições. Nada de caricatura.
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
  com roupa e acessórios do personagem e **sem rosto**, sobre o mundo em pontos de luz. Use
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
- **Fila sem parar:** ao entregar um vídeo, comece o próximo da `FILA.md` sem esperar confirmação.
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

## Entrega (cada vídeo)

1. Roteiro, cenas, `--previa`; olhe todas as folhas e corrija até ficar limpo.
2. Render; confira quadros do MP4 final; menos de 30 MB. A narração tem de sair `{'gemini'}`; se não,
   pare e avise o dono.
3. `SendUserFile` com MP4 + `capa.jpg` e, na mesma mensagem, a **legenda do post** pronta para colar:
   gancho na 1ª linha, palavras de busca, pergunta para comentar, pedido de salvar/compartilhar e
   4–6 hashtags (1–2 amplas como #biblia #fe, 2–3 do tema e #luzdapalavra; no Shorts, #shorts), mais
   uma sugestão de comentário para fixar.
4. Commit + push na branch de trabalho. Sem PR sem pedido. Repositório público: nunca commite chaves
   nem o `.env`.
