Crie um aplicativo web completo chamado "Esteira Bíblica" que produz, de ponta a ponta, vídeos verticais (9:16, 1080×1920) para TikTok/Reels/Shorts a partir de um versículo ou de uma história bíblica. Tudo roda no navegador, com o servidor apenas guardando a chave da Gemini API como segredo. Interface em português do Brasil.

## 1. O que o sistema faz (fluxo em etapas, cada uma salva e retomável)
1. ENTRADA: o usuário escolhe o MODO e o tema.
   - Modo "Versículo": 15–30 s, um versículo curto, gancho + leitura do versículo + conclusão + CTA.
   - Modo "História": até 90 s, uma história bíblica (ex.: Daniel na cova dos leões), em "beats" curtos.
   O usuário digita a referência (ex.: "Daniel 6") ou pede "sugira um tema". O texto bíblico (versão ARC) deve ser colado ou buscado pelo usuário; nunca invente versículos. O sistema só aceita como "versículo na tela" um trecho EXATO do texto bíblico fornecido.
2. ROTEIRO (Gemini de texto, o modelo mais capaz disponível): gera o roteiro seguindo as regras de retenção da seção 4.
3. AVALIADOR INDEPENDENTE (outra chamada ao Gemini, sem ver as justificativas do autor): dá nota de 1 a 10 por fase (régua na seção 4) com o trecho exato em que "rolaria o feed" e a reescrita. O sistema reescreve e reavalia, com um avaliador NOVO a cada rodada, até TODAS as fases terem nota ≥ 8 (máximo de 8 rodadas; mostrar o histórico de notas na tela).
4. BÍBLIA VISUAL E CONSISTÊNCIA DE PERSONAGENS (seção 5): antes de qualquer cena, gera as fichas dos personagens.
5. IMAGENS: uma imagem por cena (a cada 4–6 s, nunca mais de 6 s), 9:16, sempre usando as fichas dos personagens como imagens de referência (seção 5). O usuário pode regenerar uma cena, trocar o prompt ou enviar uma imagem própria.
6. NARRAÇÃO: Gemini TTS (voz masculina grave e emocional, ex.: "Achird", direção: narrador de documentário, intenso e claro; permitir trocar a voz). Cada beat é narrado separadamente. Existe um beat especial "PAUSA" de 1,2 s de silêncio real (sem voz e com a trilha quase muda).
7. LEGENDAS (seção 6): obrigatórias, durante TODO o vídeo.
8. SOM: efeitos e trilha sintetizados no navegador com Web Audio (coração, vento, tocha, pancada, "whoosh", acorde final); trilha ambiente que abaixa quando há voz (ducking) e cai a quase zero na PAUSA. Sem músicas protegidas por direitos autorais.
9. MONTAGEM E RENDER no navegador (seção 7), pré-visualização em tempo real e exportação em MP4 (ou WebM se MP4 não for possível), com o áudio mixado.
10. PUBLICAÇÃO: gera título, descrição curta com 3–5 linhas, hashtags, e um "relatório de qualidade" final. Exporta o projeto (ZIP com roteiro.json, imagens, áudios, legendas .srt e o vídeo).

## 2. Regras de conteúdo
- Público adulto; tom respeitoso. Fidelidade ao texto bíblico: tudo que é dito está no texto ou é dramatização marcada no roteiro como "dramatização"; nenhum detalhe inventado que mude o sentido.
- Nada de violência explícita; cenas de morte/punição só com silhuetas distantes.
- Sempre mostrar a referência bíblica junto do versículo.

## 3. Formatos de saída (JSON; validar com schema e mostrar erros claros)
roteiro: { titulo, referencia, modo, versiculo_chave (trecho exato), beats: [ { id, fase, fala, imagens: [numeros], tela, som, dramatizacao: bool } ], auditoria: { fase: justificativa >= 6 palavras }, revisao: { fase: nota }, duracao_estimada_s }
bible_visual: { estilo_global, paleta, personagens: [ { id, nome, descricao_fisica_detalhada, figurino_fixo, idade, cabelo_barba, cores, regras, imagem_referencia_base64 } ], cenarios_recorrentes: [...] }
cena: { numero, beat_ids, personagens_na_cena: [ids], prompt_en, camera, luz, zona_do_texto, movimento, imagem }

## 4. Regras de retenção e engajamento (no mais alto nível) e régua do avaliador
Fases avaliadas (nota mínima 8 em TODAS):
1. Gancho (0–3 s): 1ª frase com no máximo 9 palavras, afirmação (nunca pergunta), perigo ou fato concreto e estranho, sem contexto de enciclopédia e sem "hoje vou contar".
2. Laço aberto (3–8 s): promessa concreta de uma resposta que o espectador não adivinha sozinho; paga só no fim; o versículo-chave NÃO aparece antes (sem spoiler).
3. Escalada: cada beat tem no máximo 7 s, traz informação nova E aumenta a aposta; mini-cliffhanger a cada 15–20 s; frases curtas e faladas.
4. Virada: a escolha do herói contra o óbvio, com identificação ("e você, o que faria?").
5. Clímax: pergunta sem resposta, pausa real de silêncio, depois a resposta; o versículo-chave entra aqui.
6. Payoff: paga o laço aberto com fato concreto do texto (não moral genérica).
7. CTA + laço: UMA única ação (comentar), ligada ao tema, e a última frase/imagem emenda no gancho para o replay (loop).
8. Ritmo e fidelidade: imagem nova a cada ≤ 6 s, nenhum trecho morto, tudo fiel ao texto, duração real ≤ limite do modo (30 s ou 90 s). O sistema MEDE a duração real do áudio gerado e, se passar, manda reescrever/encurtar.
Reprovar de saída: abertura genérica de autoajuda, clichê religioso sem fato novo, fase sem informação nova, CTA com duas ações, final que só "termina".

## 5. CONSISTÊNCIA DE PERSONAGENS (requisito obrigatório)
- Antes das cenas, o sistema cria uma FICHA DE PERSONAGEM para cada personagem recorrente (ex.: Daniel, o rei Dario, os rivais): descrição física detalhada (idade, rosto, barba, cabelo, pele), figurino FIXO (cores e tecidos), e gera 1 imagem de referência de corpo inteiro + 1 close de rosto, em fundo neutro.
- O usuário aprova/regenera as fichas. Elas ficam salvas no projeto (IndexedDB) e NUNCA mudam durante o vídeo.
- Para cada cena com personagem, a chamada de geração de imagem usa o modelo de imagem do Gemini (família "Nano Banana": gemini-2.5-flash-image ou o mais recente, ex.: gemini-3-pro-image) enviando TODAS as imagens de referência dos personagens da cena (suporta várias referências) + o prompt da cena, com a instrução explícita: "Mantenha exatamente o mesmo rosto, barba, cabelo, idade, figurino e cores dos personagens das imagens de referência".
- O prompt de cada cena repete a descrição física e o figurino do personagem (texto idêntico, copiado da ficha).
- Depois de gerar cada imagem, uma checagem automática (chamada ao Gemini com visão) compara a imagem com a ficha e responde "mesma pessoa? sim/não + diferenças". Se "não", regenera automaticamente (até 3 vezes) e sinaliza na tela.
- Estilo global (iluminação, paleta, lente, granulação) idêntico em todas as cenas, vindo da bíblia visual. Permitir sementes fixas quando o modelo aceitar.
- Imagens sem texto, sem marca d'água, sem objetos modernos; zonas seguras para o texto.

## 6. LEGENDAS DURANTE TODO O VÍDEO (requisito obrigatório)
- Legenda ligada o vídeo inteiro, do primeiro ao último segundo, sem nenhum trecho sem legenda (exceto a PAUSA de silêncio, onde pode aparecer só a referência).
- 3 a 5 palavras por vez, em maiúsculas/negrito, fonte forte e legível, contorno/sombra, dentro da área segura (evitar topo, a faixa inferior dos botões do TikTok e a coluna direita de ícones); a palavra sendo falada em destaque (cor de acento) e animação curta de entrada.
- Sincronização: obter o tempo de cada palavra (a) transcrevendo o áudio gerado com o Gemini pedindo timestamps por palavra, ou (b) distribuindo a duração do áudio de cada beat proporcionalmente ao número de sílabas. Validar que a legenda nunca fica adiantada ou atrasada mais de 150 ms e nunca encavala.
- O versículo-chave aparece também grande e fixo, com a referência, durante a leitura e até o fim da história.
- Exportar também .srt/.vtt.

## 7. Montagem e render (no navegador)
- Canvas 2D/WebGL com Ken Burns suave (zoom 1.00→1.10, direção com sentido), paralaxe 2.5D simples (camadas ou mapa de profundidade gerado pelo Gemini), poeira/partículas, vinheta, granulação, transição por dissolvência com "light leak", respiração de luz nos momentos de virada. Nenhuma imagem parada.
- Linha do tempo gerada automaticamente a partir das durações reais do áudio: cada cena troca no beat (ou na 2ª frase se o beat tiver 2 imagens); imagens podem repetir (eco) e a última pode voltar à primeira (loop).
- Render determinístico por quadro (30 fps), exportação com WebCodecs + muxer MP4 (ou MediaRecorder/ffmpeg.wasm como alternativa), áudio mixado e normalizado em ~-14 LUFS; arquivo final com menos de 30 MB quando possível (mostrar o bitrate).
- Mostrar barra de progresso; permitir pré-visualizar em 540×960 antes do render final.

## 8. Interface (telas)
1) Projetos; 2) Briefing (modo, tema, texto bíblico); 3) Roteiro com notas do avaliador e histórico de rodadas; 4) Personagens (fichas + referências); 5) Cenas (grade de imagens com regenerar/trocar/enviar própria, indicador de consistência); 6) Áudio (vozes, pausas, mixagem); 7) Legendas (editor de texto e estilo, pré-visualização de sincronia); 8) Timeline e Render; 9) Publicação (título, descrição, hashtags, ZIP).
Painel de custo estimado antes de gerar imagens/áudio, com botão de confirmação (as chamadas à API podem gerar custo).

## 9. Requisitos técnicos
- Chave da Gemini API apenas no servidor (variável de ambiente/segredo); o navegador chama endpoints do próprio app. Nunca expor a chave.
- Usar sempre o modelo mais recente e disponível para cada tarefa (texto, imagem, TTS), com os IDs configuráveis em um arquivo de configuração.
- Tratar limites de taxa com fila, repetição com espera crescente e retomada: se o usuário fechar a aba, o projeto continua de onde parou.
- Salvar tudo em IndexedDB; exportar/importar projeto.
- Código organizado em módulos (roteiro, avaliador, personagens, imagens, tts, legendas, áudio, render), com testes simples para: validação do JSON, medição de duração, sincronia de legendas e checagem de que o versículo na tela é um trecho exato do texto bíblico.

## 10. Critérios de aceite
- Gerar de ponta a ponta um vídeo de modo Versículo (≤ 30 s) e um de modo História (≤ 90 s) com um clique por etapa.
- Roteiro só avança com nota ≥ 8 em todas as fases.
- O mesmo personagem é reconhecível (rosto, barba, figurino) em todas as cenas, com checagem automática.
- Legenda presente em 100% do tempo falado, sincronizada.
- Vídeo exportado 1080×1920 com áudio, loop (final emenda no começo) e CTA único.

Comece criando a estrutura do projeto, o fluxo de roteiro + avaliador, a bíblia visual com fichas de personagem e a geração de uma cena com referências; depois acrescente TTS, legendas, áudio e render. Pergunte apenas o que for indispensável.
