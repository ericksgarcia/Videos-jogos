# Identidade do Luz da Palavra

Tudo o que é marca do canal e vale igual para todos os vídeos dele. Os vídeos **usam** estes
arquivos; não os alteram. Mudança aqui muda todos os vídeos do canal — só com pedido do dono.

> **Situação (out/2026):** identidade em escolha. `marca.json` está com a proposta A (provisória);
> as três opções estão em `propostas/` (a, b, c). Depois da escolha do dono, a escolhida vira o
> `marca.json` e a voz escolhida entra em `voz.nome`.

| Arquivo | O que é |
|---|---|
| `marca.json` | Fonte única: nome, slogan, bio, público, chamada final (falada e na tela), hashtags, logo, voz e direção do narrador, paleta, fontes, trilha, estilo da capa, modelos de roteiro por formato, tradução da Bíblia e formato do vídeo |
| `marca.css` | Marca no topo, faixas, barra de progresso, capítulos, abertura, versículo, legenda e cartão final |
| `identidade.js` | Comportamento: legendas, capítulos em numerais romanos, `mostrarGancho()`, `mostrarVersiculo()`, `cartaoFinal()` (logo em pontos de luz), `logoForma()`, cores `LUZ`/`LUZS` |
| `propostas/` | As propostas de identidade (A chama, B livro aberto, C lamparina) |
| `fontes/` | Cinzel 600/700, Cormorant Garamond 500/600/700 + itálico 500, Source Sans 3 600/700/800 (com o nome `LuzSans`). Todas SIL Open Font License (`OFL-*.txt`), arquivos locais, nunca de CDN |

## Nome e textos

- **Nome:** Luz da Palavra (na tela: **LUZ** DA PALAVRA, com LUZ dourado)
- **Slogan:** Uma palavra de luz para o seu dia.
- **Chamada final (falada):** "Segue o Luz da Palavra para receber uma palavra de luz todo dia."
- **Chamada final (tela):** botão **SEGUIR** + a frase do canal
- **Hashtag da marca:** #luzdapalavra

## Voz

Gemini TTS (`gemini-3.8-flash-tts`). Direção em `marca.json` → `voz.direcao`: narrador adulto, calmo,
grave, acolhedor, com pausas; nunca pregador gritando, nunca infantil, nunca teatral. A voz
(`voz.nome`) é escolhida pelo dono entre Charon, Iapetus, Sulafat e Achird (amostras com a mesma frase).

## Tradução da Bíblia (domínio público) — use só esta

- **Edição:** *A Biblia Sagrada, contendo o Velho e o Novo Testamento*, tradução de João Ferreira de
  Almeida, **Edição Revista e Corrigida** de 1911 (reimpressa em 1914 pela Sociedade Bíblica Americana /
  Sociedade Bíblica Britânica e Estrangeira).
- **Por que é domínio público:** Almeida morreu em 1691; a revisão de 1911/1914 é obra coletiva e sem
  autor identificado, publicada há mais de 100 anos. Pela Lei 9.610/98 (art. 43), obra anônima entra
  em domínio público 70 anos depois da primeira publicação (desde 1985). Nos EUA, tudo o que foi
  publicado antes de 1929 também está em domínio público.
- **Fonte do texto:** Project Gutenberg, eBook nº 62383
  (https://www.gutenberg.org/ebooks/62383), marcado como domínio público. Outras transcrições da mesma
  edição: Biblia.com/Logos ("Edição Revista e Corrigida", 1914).
- **Como citar:** as palavras da edição de 1911/1914; pode atualizar a **ortografia** (acentos, "ph" →
  "f"), sem trocar palavras. Toda citação leva a referência exata na tela (`mostrarVersiculo`).
- **Não use:** NVI, NAA, ARA, NTLH, ACF, nem a ARC atual da SBB (1995/2009) — têm direitos autorais,
  mesmo quando o texto parece igual. Na dúvida sobre uma palavra, **parafraseie** e mostre a referência.
- Obs.: a rede desta sessão não abre o gutenberg.org; antes de citar um versículo, confira o texto
  numa transcrição da edição de 1911/1914 (ou parafraseie).

## Elementos fixos em todo vídeo

- Logo + **LUZ** DA PALAVRA no topo esquerdo; barra de progresso âmbar → ouro com brilho.
- Abertura: sobretítulo "LUZ DA PALAVRA", ornamento (filetes + losango) e o gancho em serifa.
- Versículo: serifa itálica + referência em versalete dourado entre filetes.
- Legenda: 4 palavras, sem serifa (leitura); a falada fica dourada.
- Fim: o logo se forma de pontos de luz, nome, SEGUIR pulsando e a frase do canal; o vídeo emenda no
  começo (loop).
- Trilha contemplativa (sem batida); transição `respiro`; batidas fortes com `sino`.
