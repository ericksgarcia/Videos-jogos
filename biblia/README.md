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

## 0. Modo sem custo além da narração (recomendado)

Só a narração é paga (Gemini TTS, ou Google Cloud TTS se houver chave). Todo o resto é gratuito:

- **Roteiro escrito à mão/por Claude** em `data/roteiros/<id>.json` e passado com `--roteiro`:
  ```json
  {
    "gancho_tela": ["UMA NOITE INTEIRA", "COM OS LEÕES"],
    "ato1": "…", "cta": "…", "cta_tela": "Comente: AMÉM", "ato3": "…",
    "loop": true, "climax": "leões,", "cta_style": "amem",
    "tomadas": [
      { "cena": "janela_babilonia" },
      { "cena": "cova_leoes", "variante": "queda", "palavra": "Jogado" },
      { "cena": "cova_leoes", "variante": "anjo", "inicio": "ato2" }
    ]
  }
  ```
  O versículo vem sempre do catálogo. Cada tomada começa **na palavra** indicada (`palavra`) ou no início de um ato
  (`inicio`); a primeira começa em 0. `loop: true` tira os fades e encurta a cauda: termine o Ato 3 emendando na
  primeira frase do Ato 1 e use na última tomada a variante `volta` (volta ao enquadramento inicial).
- **Fundo desenhado** (`src/remotion/Cenografia.tsx`): cenas completas em SVG com luz e volume — `janela_babilonia`
  (`perto`, `volta`), `cova_leoes` (`queda`, `anjo` = luz dourada no clímax), `amanhecer_cova` (`perto`),
  `quarto_chuva` (`luz`). Peças reaproveitáveis: céu, lua, estrelas, cidade antiga, palmeira, pessoa ajoelhada, rei,
  leão, feixe de luz com poeira. Veja todas com `npx remotion still src/remotion/index.ts GaleriaCenografia out/g.png`.
  Para outra passagem, crie as cenas dela no mesmo arquivo e registre em `CENAS`.
- **Legendas alinhadas de graça** (`src/audio/alinhador.ts`): o mesmo texto é gerado com a voz grátis do Edge TTS
  (que informa o instante de cada palavra) e casado com a narração real por MFCC + DTW, com refinamento pela energia.
  Medido com gabarito (`npx tsx scripts/avaliar-alinhador.ts`): **erro médio 29 ms, mediana 17 ms, 94 % < 100 ms**
  (um quadro = 33 ms). Requer `pip install -r requirements.txt` (edge-tts). `ALINHADOR=gemini` volta ao Gemini (pago).
- **Ritmo da narração sob controle**: pausas longas do TTS são cortadas (máx. 0,42 s; 0,6 s no versículo) e, se o
  áudio tiver fala demais para o texto (> 0,75 s/palavra — o modelo leu algo além do texto), ele é pedido de novo.
- **Engajamento**: gancho em texto grande nos 2,5 s iniciais com batida grave no 1º quadro; selo "Comente: …"
  durante o CTA; cortes e clarão no ritmo; final em loop.

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

## Protocolo de gancho (retenção aos 3–4 s)

Os vídeos perdiam gente entre 3 e 4 s. Regras a partir de agora (vale para todo roteiro novo):

1. **A 1ª frase falada é o gancho** (≤ 8 palavras, concreta, com violência/paradoxo/mistério): um fato de choque, não uma
   pergunta ao espectador. Nada de autoajuda no começo ("Ansioso?", "Você quer desistir?"). O texto de abertura
   (`gancho_tela`) é EXATAMENTE a 1ª frase narrada, palavra por palavra (cada linha entra na hora em que é falada):
   quem lê uma frase grande e ouve a voz dizer outra coisa perde a atenção nos dois. A esteira recusa se divergir.
2. **A 2ª frase (a "virada", ~3 s) precisa escalar**, nunca explicar contexto: pânico, reviravolta, pergunta sem resposta.
   A esteira marca esse instante (`gancho_virada`) com um clarão; o texto de abertura fica até o fim da 1ª frase (`gancho_fim`).
3. **Laço aberto**: a pergunta feita no ato 1 só se fecha depois (versículo ou ato 3). O CTA pode alimentar o laço
   ("já já eu mostro quem era o quarto homem").
4. **Teste do dedo rolando** antes de renderizar: "por que eu pararia e veria isso inteiro?" — se a resposta for só
   "é bonito" ou "é bom pra mim", reescreva.

### Auditoria por fase (obrigatória, vale para TODO vídeo)

O gancho não basta: o vídeo só vale se o espectador quiser ver até o fim. Antes de gerar qualquer coisa, o roteiro é
lido como alguém que rola o feed por hábito, **fase por fase**, perguntando em cada uma *"por que eu continuaria
assistindo agora?"*. Se a resposta for fraca, reescreva — não corrija na edição.

| Fase (campo `auditoria`) | Janela | Precisa ter |
|---|---|---|
| `gancho` | 0–3 s | fato de choque/paradoxo concreto, ≤ 9 palavras, sem pergunta de autoajuda; texto de abertura é afirmação |
| `virada` | 3–5 s | 2ª frase que ESCALA (pânico, reviravolta, pergunta sem resposta), nunca contexto frio |
| `contexto` | 5–11 s | cada frase traz informação nova; nada de explicação de fundo "de enciclopédia" |
| `cta` | ~11–16 s | não é pausa: alimenta o laço aberto (teaser do que vem) e pede UMA ação clara |
| `versiculo` | ~17–32 s | paga (ou aprofunda) o laço do ato 1; a palavra de clímax cai num momento de imagem/luz forte |
| `ato3` | ~32–52 s | reviravolta ou revelação + cena concreta de hoje; sermão genérico reprova |
| `final` | últimos 5 s | frase que fecha o laço E emenda no começo (loop), motivo para rever/compartilhar |

O roteiro `data/roteiros/<id>.json` leva um objeto `"auditoria"` com UMA frase (≥ 6 palavras) por fase justificando a
retenção ali. A esteira **recusa** o roteiro sem a auditoria completa ou com gancho fraco (1ª frase > 9 palavras,
pergunta no gancho). Nas etapas técnicas a mesma régua se aplica: depois do render, revisar os frames de cada fase
(0 s, 1,5 s, virada, CTA, versículo, ato 3, final) e só enviar se cada uma passar; se alguma for fraca, refazer.

**Revisão rígida:** além da auditoria do autor, um avaliador independente (que só vê o roteiro) dá nota 1–10 por fase seguindo
`REVISAO.md`; mínimo **8 em todas**, registrado em `"revisao"` no roteiro — a esteira recusa nota ausente ou menor que 8.

## Esteira contínua (regra do dono): um vídeo por vez, sempre em seguida

- Os vídeos saem **em sequência, um de cada vez**, e o próximo começa **automaticamente**, sem perguntar e sem esperar
  confirmação: assim que o anterior é enviado (`SendUserFile` com a legenda do TikTok), commitado e enviado ao remoto,
  a MESMA rodada segue direto para o próximo (escolher versículo → roteiro → avaliador independente → plano/imagens →
  render → revisão de frames → envio). Nunca iniciar o seguinte antes de enviar o anterior; nunca encerrar a resposta
  logo depois de enviar um vídeo sem já ter começado o próximo.
- Só para quando o dono mandar parar (ou se faltar crédito/chave: avisar e esperar). Dúvida de rumo não é motivo para parar:
  decidir pelo padrão do README e registrar a escolha na resposta.
- Mensagem ao dono só nos marcos (vídeo enviado, problema que ele precise decidir); o resto é trabalho contínuo.
