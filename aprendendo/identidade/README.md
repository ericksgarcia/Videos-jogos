# Identidade do Aprendendo Fácil

Tudo o que é marca do canal e vale igual para todos os vídeos. Os vídeos **usam** estes
arquivos; não os alteram. Mudança aqui muda todos os vídeos — só com pedido do dono.

| Arquivo | O que é |
|---|---|
| `marca.json` | Fonte única: nome, slogan, bio, público, chamada final (falada e na tela), hashtags, voz e tom de narração, paleta, fontes e formato do vídeo |
| `marca.css` | Visual da marca nos vídeos: selo e nome no topo, faixas de leitura, barra de progresso, títulos de capítulo, título de abertura, legendas |
| `identidade.js` | Comportamento da marca nos vídeos: legendas palavra a palavra, capítulos "PARTE 0N", `mostrarGancho()` (abertura) e `cartaoFinal()` (fim) |
| `logo.svg` | Logo (selo amarelo com lâmpada) em vetor |
| `foto-perfil.png` | Foto de perfil 1080×1080 (TikTok, Instagram, YouTube) |
| `banner.png` | Banner 2560×1440 (capa do YouTube; corte central serve para outras redes) |
| `fontes/` | Nunito 600, 800 e 900 (licença SIL Open Font) |

## Nome e textos

- **Nome:** Aprendendo Fácil (na tela: APRENDENDO **FÁCIL**, com FÁCIL em amarelo)
- **Slogan:** Coisas complicadas, explicadas do jeito mais fácil possível.
- **Bio:** Assuntos complicados explicados do jeito mais simples possível. Ciência, política, dinheiro e o mundo, em 2 minutos. 💡
- **Chamada final (falada):** "Segue o Aprendendo Fácil e comenta qual assunto complicado você quer que eu explique no próximo vídeo."
- **Chamada final (tela):** botão **SEGUIR** + "Qual assunto complicado vem a seguir?"
- **Hashtags fixas:** #aprendendofacil #aprendanotiktok #explicado #curiosidades #educacao (+ 3–5 do tema)

## Público e tom

Adultos. Só o método é simples (técnica de Feynman: explicar como para uma criança de
10 anos). Nada infantilizado: sem mascote, sem voz de criança. Narrador adulto, caloroso,
curioso, conversado — como quem conta algo fascinante a um amigo. Frases curtas, "você",
"pensa num…", "imagina…". Voz: Gemini TTS **Achird**.

## Cores

| Nome | Hex | Uso |
|---|---|---|
| fundo | `#0a1230` | fundo base, azul-noite |
| amarelo | `#ffd23f` | cor da marca: FÁCIL, palavra falada na legenda, capítulos, destaque do gancho |
| laranja | `#ff8a3d` | fim da barra de progresso, acentos |
| verde | `#06d6a0` | acertos, "sim", aprovado |
| azul | `#4cc9f0` | informação, rótulos |
| ciano | `#8fe3ff` | palavras-chave na legenda |
| rosa | `#ff5d8f` | botão SEGUIR, alertas suaves |
| vermelho | `#ef476f` | erro, "não", veto |
| cobre | `#e08a4b` | fios, metal quente |
| selo | `#ffe27a → #ffb52e` | degradê do selo do logo |
| tinta | `#1b1f3b` | lâmpada do logo, texto sobre amarelo |

## Tipografia

Nunito: 900 para títulos, rótulos e legendas fortes; 800 para legenda e textos de apoio;
600 para textos longos.

## Elementos fixos em todo vídeo

- Selo + nome no topo esquerdo; barra de progresso amarelo→laranja no topo.
- Abertura: sobretítulo "APRENDENDO FÁCIL" + pergunta-gancho em maiúsculas, palavra-chave em amarelo.
- Capítulos: "PARTE 0N" + barra amarela + título da cena (canto superior esquerdo).
- Legenda: 4 palavras por vez, branca; a palavra falada fica amarela; as palavras-chave, ciano.
- Fim: logo se desenhando, nome, botão SEGUIR pulsando e a pergunta.
- Formato: vertical 1080×1920, 30 fps, mínimo 1min30, arquivo final abaixo de 30 MB.
