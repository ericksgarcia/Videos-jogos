# Revisão por especialistas (um analista independente por fase)

Em vez de um único avaliador dar nota às 7 fases, **cada fase tem o seu analista**, com objetivo e prompt próprios.
Rodam em paralelo (um `Agent` `general-purpose`, modelo `opus`, por fase), cada um **sem ver o parecer dos outros**.
Nenhum deles escreveu o roteiro nem recebe a justificativa do autor. Régua comum em `REVISAO.md` (nota 1–10, mínimo 8).

## Como aplicar
1. Escreva o roteiro (`gancho_tela`, `ato1`, `cta`, `ato3`, `versiculo`/trecho, `loop`).
2. Dispare os 7 analistas **na mesma mensagem** (paralelo). Cada prompt = bloco "COMUM" + bloco da fase + só os trechos que a fase precisa.
3. Qualquer fase < 8: aplique a reescrita proposta pelo analista **daquela fase**, e depois rode de novo os analistas
   daquela fase **e das fases vizinhas que dependem dela** (ver "Dependências"). Analista sempre novo.
4. Anote em `revisao` as notas finais (todas ≥ 8) e `rodadas`.
5. Nenhum analista vê a nota dos outros; eu (autor) concilio os conflitos só no fim, priorizando fidelidade ao texto bíblico.

## Dependências (quem reavalia quando algo muda)
- gancho → virada, final · virada → gancho, contexto · contexto → virada, cta · cta → contexto, versículo
- versículo → cta, ato3 · ato3 → versículo, final · final → ato3, gancho (o laço é gancho+final juntos)

## Bloco COMUM (vai em todos os prompts)
> Você é um analista cético de roteiros de vídeos verticais (TikTok) de versículos bíblicos, em português do Brasil.
> NÃO escreveu o roteiro. Leia /home/user/Videos-jogos/biblia/REVISAO.md (a régua). Aja como quem rola o feed por hábito, com o
> polegar a caminho do próximo vídeo. Você avalia SOMENTE a fase indicada, mas recebe o que vem antes/depois para entender o fluxo.
> Nota 1–10 (8 = continuo sem pensar em rolar; ≤7 reprova). Seja duro mas justo: não invente defeito onde a fase prende e não puna interpretação
> legítima. Responda curto: (1) nota; (2) a palavra/trecho exato em que rolaria (ou "não rolaria") e o motivo em 1 frase;
> (3) se < 8, reescrita pronta, respeitando os limites; (4) riscos factuais/teológicos/históricos DO SEU TRECHO que gerem briga
> nos comentários (o texto do versículo é o da ARC do catálogo do projeto; não o conteste). Não leia outros arquivos.
> Mecânica do vídeo (informe sempre): ~45–58 s; ordem ATO1 (~11 s) → CTA (~4 s, pílula "Comente: AMÉM") → VERSÍCULO (leitura solene)
> → ATO3 (~18 s); nos primeiros 3 s a tela mostra em letras grandes exatamente a 1ª frase narrada, cada linha entrando quando falada;
> o vídeo emenda em loop (o ato 3 termina em palavras que continuam no início do ato 1); o dono exige pedido de curtida/comentário.

## 1. Gancho — objetivo: parar o polegar em 3 s
Recebe: `gancho_tela` + 1ª frase + a 2ª frase (só para ver o fluxo).
Pergunta: "Isso para meu dedo? Tem fato concreto e estranho, sem pergunta e sem autoajuda?" Reprova clichê religioso, pergunta, enciclopédia,
frase que poderia abrir qualquer vídeo. Confere: 1ª frase ≤ 9 palavras, não é pergunta, texto da tela = fala, cada linha ≤ 20 caracteres, ≤ 3 linhas.
Nota 8 = eu fico para saber o que vem; 10 = eu contaria pra alguém.

## 2. Virada (2ª frase) — objetivo: a promessa do gancho cresce, não murcha
Recebe: gancho + 2ª frase + 3ª frase.
Pergunta: "Esta frase aumenta a tensão ou só explica?" Reprova cenário de enciclopédia logo após o choque, nome sozinho, repetição do gancho
com outras palavras, resposta que mata o suspense. Precisa trazer um fato novo ou um conflito que torna a pergunta do gancho mais urgente.

## 3. Contexto (3ª frase em diante do ato 1) — objetivo: tensão sobe até o CTA
Recebe: ato 1 inteiro + CTA.
Pergunta: "Cada frase deixa a pergunta mais urgente? Há uma imagem mental concreta?" Reprova frase só informativa, abstração sem imagem,
cronologia invertida, fato errado ou não dito no texto bíblico. Confere limite de 20–28 palavras e se a última frase puxa para o CTA.

## 4. CTA — objetivo: pedir curtida/comentário SEM quebrar o clima
Recebe: última frase do ato 1 + CTA + a 1ª linha do versículo + `cta_tela`.
Pergunta: "O pedido de curtir/comentar amém está colado a uma promessa aberta que o versículo/ato 3 paga?" Reprova pedido genérico solto,
isca que a resposta óbvia estraga (ex.: "quem respondeu?" → "Deus"), CTA que resolve o suspense, pedido que não faz sentido como resposta ("comenta amém" a um "por quê?").
5–16 palavras; precisa conter o pedido de curtir e comentar.

## 5. Versículo — objetivo: ser a recompensa, não pausa
Recebe: ato 1 + CTA + versículo exato + ato 3 (só para ver o que ele prepara).
Pergunta: "Ao ouvir, a pessoa sente que a promessa foi paga? O trecho escolhido é o mais forte? O corte do fim é bom (frase termina em palavra forte)?"
Confere fidelidade palavra por palavra com a ARC do catálogo (o texto exato vem no prompt), arcaísmos que travam, trecho longo demais para a duração e se o `climax`
destacado é a palavra certa. Sugere um trecho melhor (substring exata do catálogo) se houver.

## 6. Ato 3 — objetivo: virada que muda o sentido do começo
Recebe: gancho + versículo + ato 3.
Pergunta: "Traz fato novo e concreto (sem sermão, sem lista de 'quando...')? Muda o sentido do gancho? Repete o versículo ou o ato 1 sem acrescentar?"
Reprova frase de sermão/autoajuda, afirmação absoluta que gera briga, recapitulação, citação parafraseada apresentada como literal.
36–48 palavras. É o analista de maior rigor factual/teológico: confira cada versículo citado e cada data.

## 7. Final (laço do loop) — objetivo: a emenda fecha o laço e puxa o replay
Recebe: as 2 últimas frases do ato 3 + o gancho (1ª frase) + a 2ª frase.
Pergunta: "Lido em sequência ('últimas palavras + 1ª frase'), faz sentido gramatical E de causa? Muda o sentido do gancho no replay? A entonação do TTS fecha ou corta?"
Reprova emenda mecânica ("Por isso" sem causa), causalidade invertida no tempo, final seco que só termina, final que repete.
Entregue a leitura completa da emenda no prompt: "…<fim do ato 3> <1ª frase>".

## Registro
`revisao`: nota final de cada fase (cada uma do seu analista) + `rodadas`. `auditoria`: uma frase por fase (≥ 6 palavras) dizendo por que prende.
