# Vídeos "como foi o jogo" — Brasileirão

Vídeo vertical (1080×1920, 30 fps) por jogo: uma barra de 0' a 90' se enche e,
a cada destaque (gol, vermelho, pênalti perdido, gol anulado, chance clara,
amarelo), para e mostra um card. O placar só muda quando o gol é atingido.

```
0–3 s    gancho (vira a capa no TikTok)
3–8 s    escudos, rodada, estádio
8–~47 s  barra com 5 a 7 destaques + gráfico de pressão minuto a minuto
fim      placar final, estatísticas e chamada para o próximo jogo
```

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
  pelo VAR; depois chances claras (finalização sem gol com xG ≥ 0,30, as
  maiores primeiro) até 7; completa com amarelos se ficar abaixo de 5.
- **Gancho**, na ordem: virada → decidido depois dos 85' → goleada (3+ de
  diferença) → venceu com xG 0,5 menor → jogador com 2+ gols → expulsão → padrão.
- **0x0:** 3+ destaques fortes = vídeo de ~28 s; 1–2 = versão curta (~20 s);
  nenhum = sem vídeo (só resumo da rodada).

Os limites ficam no topo de `src/normalize.py` e `src/build.py`.

## Efeitos e som

Movimento: fundo vivo (gradientes, linhas do campo, granulação), transição
diagonal nas cores dos times, tremor e zoom de câmera, flash, confete e
"GOL" gigante nos gols, cartão físico girando em 3D, vinheta vermelha na
expulsão, contagem do xG nas chances, carimbo de "FIM DE JOGO" e destaque
do vencedor.

Som: cada efeito é disparado no mesmo instante da animação, porque
template e trilha leem os mesmos tempos de `agenda["m"]` (em
`src/build.py`). Gol = impacto + explosão da torcida + baque na troca do
placar; cartão = apito + whoosh; chance = impacto + "uuuh"; apito inicial
no "bola rolando" e apito final triplo; torcida ao fundo o jogo todo.

Os sons são sintetizados (sem questão de direitos). Para trocar algum por
um sample real, salve `sons/<nome>.wav` (ex.: `sons/grito_gol.wav`); a
lista de nomes está no topo de `src/sfx.py`. `--sem-som` gera sem trilha.

## Antes de publicar

- Termos do Sofascore: uso pessoal/educacional. Para conta monetizada,
  migre `src/ingest.py` para uma fonte licenciada.
- Escudos são marcas dos clubes.
- Se quiser música, adicione pelo TikTok com volume baixo, por baixo dos efeitos.
