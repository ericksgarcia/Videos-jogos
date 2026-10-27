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
- **Personagens: só paro quando estiverem perfeitos (regra do dono, out/2026).** Ao alterar o desenho dos personagens, nunca
  me dou por satisfeito com a primeira versão que "melhorou": olho a imagem com olho crítico (rosto, pescoço, mãos, roupa, cor
  da pele, proporção), aponto o que ainda está feio, corrijo e renderizo de novo, quantas vezes for preciso. O dono já apontou
  defeitos que eu deixei passar (barba na mulher e na criança, metade do rosto de cada cor, pescoço de cilindro): se eu vejo a
  imagem e não acho nenhum defeito, estou olhando mal. Só entrego o personagem quando um ilustrador profissional não
  apontaria o que consertar; antes disso, a entrega diz com franqueza o que ainda está fraco.
- **Apelo à fé LOGO DEPOIS DA ABERTURA (regra do dono, out/2026): em todo vídeo.** A abertura faz o trabalho dela (gancho,
  emoção, laço aberto, ~8–14 s); logo em seguida vem uma cena curta (`{"tipo": "apoio"}`, ~5–7 s, `cenaApoio` na
  identidade: luzes se juntam em mãos que oram na palavra de fé, um coração de luz voa até o botão de curtir e a seta
  aponta os comentários com "amém") em que a narração **apela à fé** de quem assiste para **curtir e comentar**, para
  a Palavra de Deus chegar a mais pessoas. Modelo do dono: *"Antes de seguirmos: se você realmente tem fé, curte e
  comenta esse vídeo, pra Palavra de Deus chegar a mais pessoas."* (Substitui o antigo pedido no meio do vídeo: um
  pedido só, além da chamada do fim.)
  - **A frase muda em cada vídeo.** Antes de escrever, leia a fala da cena `apoio` dos últimos vídeos (`videos/*/roteiro.json`)
    e não repita. Ideias de ângulo: fé que age ("fé sem obras…", cf. Tg 2:17), a Palavra que não volta vazia (cf. Is 55:11),
    ser luz (cf. Mt 5:14–16), alguém que precisa ouvir isso hoje, o amém como resposta de fé, o pedido "antes de continuar".
    Exemplos: "Antes de continuar: se você crê que essa palavra pode tocar alguém, curte e comenta amém pra ela chegar mais
    longe." / "Espera um segundo: quem tem fé sabe que a Palavra não volta vazia. Curte e comenta pra ela alcançar mais
    gente." / "Antes de seguir: se Deus já falou com você hoje, curte e deixa seu amém, pra essa mensagem chegar em quem precisa."
  - Fala rápida: 15–22 palavras, ~5–7 s. Batidas: a palavra de fé → `fe`, "curte" → `curte`, "comenta" → `comenta`.
  - Limite: nada de ameaça, condenação ou promessa ("quem não curtir não tem fé", "Deus vai cobrar", "curte que você vai
    receber uma bênção") — regra do canal (sem medo, sem culpa, sem promessa de prosperidade).
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

## Narração: um pedido por vídeo (regra do dono: o Gemini é só isso)

**Uma única requisição completa ao Gemini por vídeo**, só para a narração; todo o resto (tempo das palavras, pausas, ritmo,
cortes por cena, conferência) é feito aqui no áudio baixado. Nada de pedir ao Gemini para alinhar, transcrever ou julgar.
Se a leitura inteira falhar, o `gerar.py` para (não narra cena a cena).

- **API nova (Gemini 3.8 TTS, Interactions):** `marca.json` → `voz.api = "interacoes"`. O texto é falado **ao pé da letra**;
  a direção vai em `speech_metadata.style` (`voz.direcao`, no formato do guia do Google: AUDIO PROFILE / THE SCENE /
  DIRECTOR'S NOTES com Style, Pace, Accent; em inglês, dizendo que a fala é em português do Brasil). Nunca ponha instrução
  dentro da fala: o modelo a lê em voz alta.
- **Pausas de pregador:** no campo `tts` da cena, a mesma fala com `<short pause>` / `<long pause>` (vírgulas de peso, antes de
  uma revelação, depois de "Adivinha…?", antes do versículo). As palavras do `tts` têm de ser idênticas às da `fala`.
  Entre as cenas entra um `<short pause>` sozinho. Outras marcas do guia: `<sigh>`, `<laugh>`, `<chuckle>`, `<gasp>`.
- **Tempo de cada palavra = ouvido de verdade:** `voz.alinhamento = "whisper"`: o faster-whisper (large-v3-turbo, roda na CPU,
  ~40 s por vídeo) transcreve o áudio inteiro com tempo por palavra, casa com o roteiro e cola o começo de cada palavra que vem
  depois de um silêncio no instante em que a voz volta (medido na energia). Depois do ritmo/pausas, ouve de novo o áudio
  pronto. Antes (out/2026) o tempo era só estimado (início da frase + divisão por letras): erro médio de 1,8 s, a escrita
  descasava e os cortes por cena levavam pedaço de fala de uma cena para outra.
- **Ambiente:** `pip install --break-system-packages faster-whisper`; o modelo baixa do Hugging Face na 1ª vez (a rede precisa
  liberar `*.hf.co` e `*.xethub.hf.co`, já liberados pelo dono).
- Conferir: `python luz-da-palavra/ferramentas/sincronia.py luz-da-palavra/videos/<tema>` (depois do `--so-montar`) compara o
  começo de cada palavra escrita com o começo dela na fala. Meta: média entre −0,1 e +0,05 s, nenhuma atrasada > 0,3 s.

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

## Escolha do tema (pedido do dono: "muito legais, que prendam, nada de mais do mesmo")

Todo tema novo passa por este filtro ANTES de virar roteiro. Se não passar em 5 dos 6, troca de ângulo ou de tema.

1. **Estranheza real:** existe um fato verificável no próprio texto que surpreende quem "acha que conhece" a passagem
   (ex.: "a Bíblia gasta 1 versículo em 18 anos da vida de Jesus"). Sem fato, não há gancho.
2. **Pergunta que a pessoa nunca fez** (ou fez e ninguém respondeu), em vez da lição que todo mundo já ouviu no culto.
3. **Dor de hoje:** liga com algo que o adulto sente agora (ansiedade, solidão, cansaço, dúvida, perda), não só com a história.
4. **Ângulo novo:** o tema pode ser famoso, mas o ângulo não pode ser o do sermão clássico. Pergunta-teste: "isso já virou um
   vídeo de 'reflexão do dia' em outro canal?" Se sim, procurar o detalhe que ninguém conta.
5. **Cabe em 1:30 sem encher:** uma ideia só, com virada no meio e pagamento no fim.
6. **Dá resposta curta para os comentários** (uma palavra, A ou B).
Além disso: nunca repetir tema nem ângulo já feito (conferir `FILA.md` e `videos/`); alternar formatos (versículo, história,
significado, "o que a Bíblia não diz", oração); conferir o texto na Almeida 1911/1914 antes de escrever.
Antes de cada vídeo, oferecer ao dono 3 candidatos pontuados nesse filtro quando a fila estiver vazia, em vez de escolher sozinho.

## Analistas (processo de todo vídeo, pedido do dono: "até ficar perfeito")

Reescritos em out/2026 para serem **mais críticos** e para o objetivo novo (formato "Caso aberto", conclusão e revisão, identidade).
Todos leem `norte.md` (objetivo, metas, hierarquia de conflitos, **livro de erros**, como críticar) e `estrategia.md`. Briefs em
`.claude/agents/analista-*.md`: **gancho, retenção, engajamento, fé, voz-visual, temas e sequência** (7).
O que mudou: escala calibrada (8 = publicável; reprovam por padrão), teste do espectador que desliza, cálculo de retenção com a conta à vista,
previsão dos comentários, tabela de afirmações rotuladas (literal / paráfrase / inferência / invenção) e teste das cinco pessoas na fé, medidas de voz
sem ouvir, e **verificação mecânica antes da crítica**: `python luz-da-palavra/ferramentas/lint_roteiro.py luz-da-palavra/videos/<tema>` (contagem de palavras,
superlativos, "Será que", apelo repetido, frase final, pergunta, tts × fala, batidas, sons sem definição, descrição, capa, cenas.js).

Fluxo de cada vídeo:
0. **Sequência e tema** (segunda de manhã, para a semana): `analista-sequencia` (auditoria dos últimos, ordem dos próximos 5, experimentos) e `analista-temas` (filtro eliminatório,
   gancho provado). Só depois escolhe-se o tema.
1. **Roteiro v1**: rode o verificador e corrija as FALHAS; depois `analista-gancho`, `analista-retencao`, `analista-engajamento` e `analista-fe` em paralelo.
2. **Reconciliar**: resolver divergências pela hierarquia do `norte.md` (fidelidade > cuidado pastoral > clareza > retenção > estilo), e registrar o que foi decidido e por quê.
3. **Roteiro final**: rodar **de novo** gancho, retenção e fé sobre a versão final (não sobre a anterior). Só narra com os três APROVADO (fé sem ALTA; conclusão estimada ≥ 45%).
   *(No vídeo "Caso aberto #2" a versão final não teve uma última rodada: não repetir.)*
4. **Prévia e render**: `analista-voz-visual` com as medidas (`medir_voz.py`, `sincronia.py`, loudness) e as folhas de quadros; gancho de novo sobre o 1º quadro e a capa.
5. **Depois de publicar**: preencher `metricas.csv` (48 h e 7 dias); a cada ~5 vídeos, `analista-sequencia` lê os números e ajusta metas e semana-tipo.
Mudanças nas regras do dono (apelo à fé logo depois da abertura, pergunta depois da revelação) são **propostas a ele** (experimentos E1/E2 em `estrategia.md`), nunca decididas pelos analistas.
Divergências entre analistas: vale a hierarquia do `norte.md`. Subagentes novos só aparecem como tipo depois que a sessão recarrega; antes disso, use um agente genérico que leia o brief.

## Voz: ritmo e pausas (out/2026)

Com a API nova e "Pace: slow, measured and deliberate" a voz já sai mais calma (~140 palavras/min com as pausas). O
ajuste fino é feito depois: `marca.json` → `voz.pausas` = `{"ritmo": 0.93, "frase": 0.55, "pergunta": 0.8,
"dois_pontos": 0.3, "reticencias": 0.8}`. `ritmo` desacelera sem mudar o tom (rubberband; o tempo das palavras é
reouvido depois); as outras chaves garantem a pausa mínima depois de cada sinal, variando com o tamanho da frase. A
narração crua fica no cache: mudar só as pausas não gasta requisição. Um roteiro pode trocar com `"pausas": {...}`.
A direção antiga (texto + direção juntos, API generateContent) ficou em `voz.direcao_antiga`.

**Voz do estilo "Caso aberto" (out/2026): Gacrux + "pastor investigador".** Foram geradas 5 vozes graves (Achird, Gacrux, Charon,
Sadaltager, Algieba) com a mesma direção e o mesmo trecho, e medidas no áudio (não por ouvido: o Gemini não avalia voz):
ritmo (palavras/min), altura e variação de entonação (librosa), clareza e acerto das palavras (faster-whisper). Gacrux: 100% das
palavras, ~101 pal/min com pausas, entonação 5,2 semitons; escolhida pela fala lenta, grave e clara. A direção (em `marca.json`)
pede voz baixa e lenta no detalhe de cada pista, meio segundo de silêncio antes de cada revelação e sorriso na voz nas linhas de
esperança. Com ela o ritmo já sai ~117 pal/min no total, então **não há mais desaceleração artificial** (`voz.pausas.ritmo`
removido). A direção anterior (Achird, pastor acolhedor) ficou em `voz.direcao_pastor` / `voz.nome_pastor`. Para trocar de voz: um vídeo
pode usar `"voz": "<nome>"` no roteiro; o canal todo muda em `marca.json` → `voz.nome`.

**Volume do riscado da escrita:** `marca.json` → `trilha.escrita` (ganho do som de caneta por palavra; padrão 0,2, no Luz da Palavra
0,06 = −10,5 dB). Sons de batida (`sons` do roteiro) ficam em ganhos 0,2–0,45.
As ferramentas `ferramentas/simular_voz.py` e `julgar_voz.py` (out/2026) pediam notas ao gemini-3.8-flash: **não use mais**
(regra do dono: o Gemini é só a requisição da narração). A voz é avaliada pelo dono.

## Estilo padrão (out/2026): CADERNO no tema "noite"

Testado contra caderno, pergaminho e Bíblia anotada (`output/luz-da-palavra/fogo-de-brasas/estilos/`): o analista visual deu
clima 9 e coerência 9 ao **noite** (escrita de luz dourada sobre azul-noite, a "caneta" é um ponto de luz que não cobre as
letras). Pergaminho: pena some no bege e as manchas parecem mofo. Bíblia: as linhas impressas competem com a escrita.
Caderno: cara de escola.
- No roteiro: `"estilo": "caderno", "tema": "noite"` e, para não escurecer os cantos,
  `"video": {"desfoque_movimento": false, "tratamento_cor": {"contraste": 1.03, "saturacao": 1.05, "vinheta": 0.08, "aberracao_px": 0, "grao": 3}}`.
- Destaques na fonte normal (felix) em dourado e maiores (a "elfin" faz o "s" parecer "ſ": "brasas" lia "brafaf").
- Texto entre x 140 e 940 (`larg: 800`) e de y ≥ 320; rabiscos na metade de baixo; entrelinha ~124 (`passo`).
- Páginas viram só no fim de uma frase e nunca com 1 linha sozinha (automático). Anotação ligada a uma palavra
  (`cadCirculo`/`cadSublinhado` com `{ com: m }`) some junto com a página.
- Uma caneta só para as palavras; rabiscos e textos com `livre: true` aparecem sozinhos (pedido do dono).
- A escrita aproveita as pausas da fala e, se atrasar, acelera até alcançar (não arrasta atraso até o fim).
- Quadro 0: o desenho principal já aceso (comece o rabisco antes de `c.ini`) enquanto a caneta escreve o gancho.
- Título da abertura com `cadTitulo(..., { livre: true })`: ele se escreve sozinho e a caneta começa a fala já no 1º segundo
  (com o título na fila, as primeiras palavras saíam ~0,7 s atrasadas).
- **Medir a sincronia antes de renderizar:** `python luz-da-palavra/ferramentas/sincronia.py luz-da-palavra/videos/<tema>`
  (depois do `--so-montar`) lista cada palavra escrita mais de 0,35 s depois de falada. Meta: média ≤ 0,15 s, máximo ≤ 0,45 s.
  A duração mínima da escrita é proporcional ao tamanho da palavra ("de" em ~0,2 s), para sequências de palavras curtas não atrasarem.
- Referência na tela: curta (≤ ~24 caracteres, ex.: "cf. 2 Rs 25:9; Lm 2:12"), senão sai cortada à esquerda.
- A fonte não tem "…" nem "×": escreva "..." e "x".
- Exemplo completo: `videos/fogo-de-brasas/` ("Dois fogos: Pedro e Jesus").

## Animações Lottie no canal (teste out/2026: `videos/teste-lottie/`)

- Funciona no tema noite: `python aprendendo/motor/lottie.py buscar "campfire"` → `baixar <id> <tema> <nome>` (copie o JSON para
  `luz-da-palavra/videos/<tema>/lottie/`) → `lottieEm(pg.g, "nome", x, y, w, h, { ini, fim, loop: true })` (pai = `pg.g`, o grupo SVG da página).
- Bom: fogo, luz, brilhos, partículas, objetos soltos (ex.: 54405 "Firewood"). Ficam muito melhores que o rabisco.
- Ruim: pessoas. As de "praying" são quase todas com imagem muçulmana (não serve ao canal); as demais têm estilo de ilustração de
  app corporativo. Pessoas continuam sendo desenhadas por nós (kit `figura()` ou rabiscos).
- Cuidado de estilo: o Lottie é colorido e com sombra; o rabisco é contorno de luz. Misturar pede o contorno mais forte e
  cor de preenchimento no personagem para não destoar.

## Formato "Caso aberto" (estreia: `videos/caso-tumulo-vazio/`)

Investigação em 4 pistas, no caderno noite: carimbo "CASO ABERTO" (`CT_carimbo`), etiqueta numerada de cada pista (`CT_pista`),
lupa sobre a evidência, referência "cf." em cada pista. Rabiscos novos no kit: `lupa`, `pedra` (disco rolado + entrada em arco),
`lenco` (rolo), `moedas`, `carimbo`, `etiqueta`, `jardineiro`.
- **Lacuna real no gancho** ("a última não está no túmulo"), paga na penúltima cena; re-gancho no fim de cada pista; um "pensa rápido".
- O vídeo **nunca diz que as pistas "provam"** algo que o texto não diz; fecha admitindo ("o caso não fechou numa prova") e a pergunta
  de comentários pede só um número. "Quase ninguém lê/sabe" é exagero: o analista de gancho reprova, use lacuna concreta.
- Mito derrubado do próprio texto (o lenço "dobrado" não está em João 20:7: é "enrolado").
- No código das cenas, as chaves de `w.mapa` (devolvido por `cadPalavras`) são a palavra **sem pontuação**: `mapa.dobrado`, não
  `mapa["dobrado."]` (com pontuação o círculo/sublinhado some em silêncio).
