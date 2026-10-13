# biblia/ — vídeos bíblicos verticais (Remotion + FFmpeg)

Esteira completa para vídeos de 45–58 s: **engine** escolhe a passagem → **Gemini** escreve o roteiro (CTA de fé
diferente a cada vídeo) → **Google TTS** narra com o tempo real de cada palavra → **mixagem** de 3 camadas com
ducking → **Replicate** (Flux + profundidade) e/ou **Pexels** (vídeos) como fundo → **Remotion** renderiza →
**FFmpeg** fecha o MP4 em ≤ 28 MB.

> Projeto separado do canal "Aprendendo Fácil" (`../aprendendo/`, Python + HyperFrames). Nada aqui toca naquele pipeline.

## Começando

```bash
cd biblia
npm install
cp .env.example .env        # preencha GOOGLE_TTS_API_KEY, REPLICATE_API_TOKEN, PEXELS_API_KEY
npm run catalogo            # (re)gera data/catalog.json a partir de data/seeds/*.txt
npm run video               # esteira completa → out/<data>-<passagem>/video.mp4
npm run studio              # Remotion Studio (pré-visualização dos componentes)
npm test                    # engine, roteiro, linha do tempo, áudio, provedores (sem rede)
```

Opções de `npm run video -- ...`

| opção | efeito |
|---|---|
| `--visual hybrid\|replicate\|pexels` | fonte do fundo (padrão `hybrid`, veja abaixo) |
| `--ref sl-23` | força uma passagem (prefixo do id do catálogo) |
| `--tone epic\|comfort` | força o ritmo (senão alterna com o vídeo anterior) |
| `--seed 42` | sorteio reproduzível |
| `--offline` | voz/imagens sintéticas de teste, **sem chaves** (valida a esteira; nunca publicar) |
| `--no-render`, `--no-history` | só gera plano/áudio; não grava o histórico |
| `--frames 300-450` | renderiza só um trecho (teste rápido do visual) |

Requisitos: Node ≥ 20, **ffmpeg** no PATH. Sem GPU (servidor/CI) use `REMOTION_GL=swangle`
(≈ 0,7–1 s/quadro com 4 núcleos → 20–30 min por vídeo); com GPU o padrão `angle` é bem mais rápido.

## 1. Banco de dados (`data/catalog.json`, `src/pipeline/engine.ts`)

- **294 trechos**: os **150 Salmos** (um por salmo, mais 2 trechos extras do 119), Provérbios (26), Isaías (23),
  Jeremias/Lamentações (14), Ezequiel (10), Daniel (10), Evangelhos (37), Apocalipse (12) e 10 passagens de cartas.
- Cada entrada: `reference`, `text`, `historical_context`, `emotional_hook`
  (medo, traição, superação, injustiça, proteção, ansiedade, luto, culpa, solidão, esperança, gratidão, perdão,
  cansaço, provisão, dúvida, orgulho, sabedoria, chamado, juízo, coragem, paz), `tone` (`epic` | `comfort`) e
  `audio_cues` (trovão, vento, caverna, fogo, chuva, deserto, tempestade, fogueira, mar, noite, multidão, batalha,
  silêncio, montanha).
- O **texto vem de uma Bíblia em JSON** baixada por `npm run catalogo` (padrão: Almeida Revista e Corrigida,
  `pt_arc`; troque com `BIBLIA_VERSAO=pt_nvi` etc.) — nunca da memória do modelo. Os intervalos das sementes
  (`data/seeds/*.txt`) são cortados do fim até caber em 44 palavras (≈ 19 s de leitura solene).
  **Confira a licença da versão escolhida** antes de monetizar: a base de 1898 da ARC é domínio público, edições
  modernas/outras versões (NVI, ARA, NAA…) têm direitos reservados.
- O **contexto histórico** é conteúdo editorial das sementes: revise-o. O roteirista é instruído a usar só ele.
- **Engine** (`pickNext`, lê `data/history.json`): nunca repete o **livro** nem o **gancho emocional** do vídeo
  anterior (regra inviolável); evita repetir passagem e livros/ganchos dos últimos 3 vídeos; **alterna épico ↔ conforto**;
  sorteio ponderado que favorece livros pouco usados e alterna AT/NT. Se o catálogo apertar, relaxa só as regras
  fracas (testado com 280 vídeos seguidos).

## 2. Roteiro e CTA dinâmico (`src/pipeline/script.ts`)

| ato | janela | conteúdo |
|---|---|---|
| 1 | 0–12 s | crise real vivida pelo autor (Gemini, a partir do contexto verificado) |
| CTA | 12–16 s (≤ 4 s) | pedido de fé para curtir/comentar |
| 2 | 16–35 s | leitura solene da passagem (texto do catálogo) |
| 3 | 35–55 s | aplicação moderna (ansiedade, decisões, superação, medo do futuro) |

Os atos começam nas marcas acima, **empurrados para a próxima batida** do BPM (e para depois da fala anterior se ela
passar). O ato 3 é o "elástico": se o total passar de 58 s, é re-narrado mais ligeiro (até 1,0).

**CTA que muda a cada vídeo**: a cada execução o prompt recebe (a) um **estilo** (amém, alcance, nome de alguém,
compartilhar, declaração, pergunta, oração, testemunho) que *não* esteve nos últimos 3 vídeos, (b) um **registro**
sorteado (sussurro acolhedor, pergunta direta, declaração firme…) e (c) a lista dos CTAs recentes **proibidos**.
Texto e limites são validados (5–10 palavras); se o Gemini falhar 3 vezes, cai num banco local também rotacionado.

## 3. Narração (`src/pipeline/tts.ts`)

Google Cloud TTS v1beta1, voz `pt-BR-Neural2-B` (grave; `GOOGLE_TTS_VOICE` troca por Wavenet-B etc.),
`pitch` −3 a −5 st, `speakingRate` 0,82–0,92 (leitura do versículo mais lenta, pausas de 700 ms em ponto final).
SSML com `<mark>` por palavra + `enableTimePointing` → tempos reais para legendas e para o trovão. Se um ato estourar
o tempo, é refeito mais rápido (nunca acima de 1,0). Cache em `data/cache/tts`.

## 4. Sonoplastia (`src/audio/`)

Tudo sintetizado proceduralmente (sem direitos autorais); coloque `assets/sfx/<nome>.wav` (ex.: `trovao.wav`,
`swoosh.wav`, `batida.wav`, `vento.wav`, `chuva.wav`…) para **substituir qualquer som por um sample real**.

1. **Narração** — canal central, normalizada.
2. **Camas** — ambiente por ato conforme `audio_cues` (vento, deserto, chuva, fogueira, caverna com eco de pingos,
   mar, tempestade, multidão, batalha…), drone grave (menor no épico, mais aberto no conforto) e pulso grave no BPM
   (o mesmo BPM dos cortes de imagem).
3. **Efeitos** — swoosh nas viradas de ato, batida grave na revelação (início da leitura) e **trovão/impacto no
   instante exato da palavra de clímax** (trovão se há `trovão`/`tempestade`, senão batida grave).

**Ducking**: a envoltória da voz (ataque 25 ms, soltura 450 ms) abaixa as camas em 72 %, os efeitos em 45 % e o
drone/pulso em 60–80 % enquanto há fala; só o impacto do clímax é preservado (−20 %). Depois o FFmpeg aplica
`loudnorm` (−16 LUFS, pico −1,5 dB) e grava o MP3.

## 5. Visual (`src/remotion/`)

- `ParallaxScene.tsx` — shader WebGL: imagem do **Flux** (`black-forest-labs/flux-schnell`, estilo escuro 35 mm /
  Rembrandt) deslocada pelo **mapa de profundidade** (`cjwbw/depth-anything`), com dolly lento e deriva lateral.
  Sem mapa, usa profundidade radial (Ken Burns com volume).
- `StockScene.tsx` — vídeo do Pexels com zoom/deriva leve.
- `Overlays.tsx` — vinheta radial, fumaça (2 camadas de textura), poeira flutuante, granulado de filme
  (texturas geradas uma vez pelo ffmpeg em `public/overlays`; o filtro SVG ao vivo custava ~2 s/quadro).
- `KineticText.tsx` — legendas centralizadas em Cinzel / Cormorant Garamond; a palavra falada acende em dourado com
  brilho e *spring* de escala; anteriores e futuras a 35 %. Referência em versaletes dourados no início da leitura.
- `Video.tsx` — junta tudo, com fusão entre tomadas, lampejo e pulsação de câmera a cada batida.

### Pexels × Replicate: o que é melhor?

**Resposta: os dois, no modo `hybrid` (padrão).**

| | Replicate (Flux + profundidade) | Pexels (vídeo de banco) |
|---|---|---|
| ponto forte | cena **específica** (cova dos leões, Patmos, fornalha), estilo único e coerente | **movimento real**, fumaça/chuva/ondas/fogo de verdade, trocas rápidas no ritmo |
| fraqueza | 2.5D só "respira" a imagem; custo por imagem (~US$ 0,003 + profundidade) | genérico: não existe stock de "Davi fugindo de Absalão"; clipes podem se repetir entre canais |
| uso ideal | **Ato 1** (crise histórica) | **Atos 2 e 3** (atmosfera: tempestade, deserto, noite urbana) |

No `hybrid`, o Ato 1 usa Flux+parallax (precisa ser a cena da história) e os Atos 2–3 usam clipes do Pexels com
**cortes em compassos de 4 batidas** (a cada ~4–5 s, alinhados ao pulso do áudio, com lampejo e pulsação). Sem chave do
Pexels, cai para Flux; sem Replicate, só Pexels. O Pexels é gratuito (200 req/h), a licença permite uso comercial sem
atribuição (não revender o clipe puro), e a esteira **não repete clipes dos últimos 30 vídeos** (`pexels_ids` no
histórico). `--visual replicate` e `--visual pexels` forçam um só.

## Limites conhecidos / o que não foi testado ao vivo

- Chamadas reais ao **Google TTS, Replicate e Pexels** não foram exercitadas (sem chaves/rede nesta sessão): o formato
  das requisições e das respostas é coberto por testes com `fetch` simulado. **Faça um primeiro vídeo com `--no-history`**
  e confira: voz, tempos das palavras, nomes dos modelos no Replicate (`FLUX_MODEL`, `DEPTH_MODEL`) e a saída do mapa de
  profundidade.
- O roteiro do Gemini **dramatiza** o contexto (pode acrescentar detalhes de cena). Leia o `roteiro.json` antes de publicar
  conteúdo religioso; o prompt só autoriza fatos do `historical_context`, mas o modelo não é infalível.
- Imagens do Flux evitam rostos (silhuetas/costas) por reverência e para não gerar figuras sagradas.
