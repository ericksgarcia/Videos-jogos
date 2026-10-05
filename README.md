# Vídeos "como foi o jogo" — Brasileirão

Vídeo vertical (1080×1920, 30 fps) por jogo: uma barra de 0' a 90' se enche e,
a cada destaque (gol, vermelho, pênalti perdido, gol anulado, chance clara,
amarelo), para e mostra um card. O placar só muda quando o gol é atingido.

```
gancho   frase de impacto (vira a capa no TikTok)
intro    escudos, rodada, estádio, "bola rolando"
barra    relógio grande + linha 0'–90' + gráfico de pressão; a cada destaque
         mergulha numa tela própria do lance:
           - camisa com o número do jogador, minuto, placar daquele momento
           - gols com a sequência real de passes (dado da Opta): campinho 2D
             com os passes e, no chute, câmera 2D→3D atrás do lance, sem corte,
             com a bola subindo até o ponto exato em que entrou
           - demais lances: cadeia A → B → gol (assistente → quem finaliza →
             visão de frente do gol com a bola no ponto exato), cada nome
             entrando quando o narrador fala
           - etiquetas (pé, distância, assistência) e legenda palavra a palavra
           - narração explicando o lance, com a bola entrando na palavra "Gol"
fim      placar final, estatísticas e chamada para o próximo jogo
```

Lances: todos os gols, expulsões, pênaltis perdidos e gols anulados, sem
limite; se der menos de 5, completa com as chances claras mais perigosas.
Duração: depende do jogo (~20 s por lance); o Corinthians 1x3 Fluminense dá 1min48.

## Uso

```bash
pip install -r requirements.txt
npm install
python jogo.py --rodada 28            # todos os jogos encerrados da rodada
python jogo.py --rodada atual
python jogo.py --evento 15235484      # um jogo (id do Sofascore)
python jogo.py --rodada 28 --so-json  # só os JSONs normalizados
```

Saída em `output/`: um `.mp4` e um `.json` por jogo. Os dados crus ficam em
cache em `data/raw/<id>/` (use `--atualizar` para baixar de novo).

Requisitos: Python 3.10+, Node 22+, FFmpeg e um Chrome headless shell
(no ambiente cloud do Claude Code o de `/opt/pw-browsers` é detectado sozinho;
em outra máquina rode `npx hyperframes browser ensure`).

## Estrutura

| Arquivo | Papel |
|---|---|
| `src/ingest.py` | Única parte que conhece o Sofascore. Troque por uma API licenciada aqui. |
| `src/normalize.py` | Regras: ranking dos destaques, gancho, formato do 0x0. |
| `src/build.py` | Agenda do vídeo: instantes de cada animação, cores e render. |
| `src/narracao.py` | Roteiro da narração em português, a partir do comentário da Opta. |
| `src/voz.py` | TTS (Edge, Azure ou Google), cache e tempo de cada palavra. |
| `src/sfx.py` | Efeitos sonoros sintetizados (apito, torcida, impacto, whoosh…). |
| `src/audio.py` | Mixa a trilha a partir da agenda e junta no MP4. |
| `template/index.html` | Template HyperFrames/GSAP, lê o JSON injetado. |
| `exemplos/` | JSONs normalizados de jogos reais da rodada 28. |

## Fonte dos dados

Endpoints do Sofascore (os mesmos do `sofascrape`), chamados com `requests`.
O `sofascrape` em si abre cada URL num Chromium headless; aqui isso falha
atrás do proxy do ambiente e é mais lento, então a ingestão fala direto com
o JSON. Além dos métodos do sofascrape, usamos `/event/{id}/statistics`
(posse, xG, chances claras) e `/event/{id}/shotmap` (cada finalização com
minuto, jogador, xG e resultado), que resolvem a "chance clara perdida" e a
regra de "venceu criando menos".

## Regras

- **Destaques:** todos os gols, vermelhos, pênaltis perdidos e gols anulados
  pelo VAR, sem limite; se der menos de 5, chances claras (finalização sem
  gol com xG ≥ 0,30, as maiores primeiro) até completar 5. O xG só é usado
  por dentro para escolher as chances; não aparece no vídeo.
- **Gancho**, na ordem: virada → decidido depois dos 85' → goleada (3+ de
  diferença) → venceu com menos chances claras e finalizações → jogador com 2+ gols → expulsão → padrão.
- **0x0:** 3+ destaques fortes = vídeo de ~28 s; 1–2 = versão curta (~20 s);
  nenhum = sem vídeo (só resumo da rodada).

Os limites ficam no topo de `src/normalize.py` e `src/build.py`.

## Efeitos e som

Movimento: fundo vivo (gradientes, linhas do campo, granulação), transição
diagonal nas cores dos times, tremor e zoom de câmera, flash, confete e
"GOL" gigante nos gols, cartão físico girando em 3D, vinheta vermelha na
expulsão, carimbo de "FIM DE JOGO" e destaque
do vencedor.

Som: cada efeito é disparado no mesmo instante da animação, porque
template e trilha leem os mesmos tempos de `agenda["m"]` (em
`src/build.py`). Gol = impacto + explosão da torcida + baque na troca do
placar; cartão = apito + whoosh; chance = impacto + "uuuh"; apito inicial
no "bola rolando" e apito final triplo; torcida ao fundo o jogo todo.

Os sons são sintetizados (sem questão de direitos). Para trocar algum por
um sample real, salve `sons/<nome>.wav` (ex.: `sons/grito_gol.wav`); a
lista de nomes está no topo de `src/sfx.py`. `--sem-som` gera sem trilha.

## Narração

`src/voz.py` escolhe o provedor pela variável `VOZ_PROVEDOR`:

| Provedor | Custo | Conta | Observação |
|---|---|---|---|
| `gemini` (padrão com chave) | cota grátis do Google AI Studio | sim (`GEMINI_API_KEY`) | Gemini TTS `gemini-3.8-flash-tts`, voz Fenrir, emoção por notas de direção e tags; tempo das palavras calculado com o Gemini ouvindo o áudio |
| `edge` | grátis | não | vozes neurais do Edge, devolve o tempo de cada palavra; serviço não oficial, bom para testar |
| `azure` | grátis até 500 mil caracteres/mês | sim (`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`) | mesmas vozes, uso comercial ok |
| `google` | grátis até 1 milhão de caracteres/mês (Chirp 3 HD) | sim (`GOOGLE_TTS_API_KEY`) | uso comercial ok |
| `nenhum` | — | — | sem voz, legendas com tempo estimado |

Um vídeo usa por volta de 800 caracteres de narração. Com o Gemini são ~2
chamadas por fala (síntese + alinhamento), cerca de 16 por jogo; o áudio fica
em cache em `data/voz/`. A chave pode ficar em `.env` (ignorado pelo git) ou
como variável de ambiente.
No ambiente cloud, o domínio do provedor precisa estar liberado na política
de rede (`speech.platform.bing.com`, `<região>.tts.speech.microsoft.com` ou
`texttospeech.googleapis.com`).

## Antes de publicar

- Termos do Sofascore: uso pessoal/educacional. Para conta monetizada,
  migre `src/ingest.py` para uma fonte licenciada.
- Escudos são marcas dos clubes. O vídeo não usa fotos de jogadores (direito autoral do fotógrafo/agência e direito de imagem do atleta); no lugar, camisa com o número.
- Se quiser música, adicione pelo TikTok com volume baixo, por baixo dos efeitos.
