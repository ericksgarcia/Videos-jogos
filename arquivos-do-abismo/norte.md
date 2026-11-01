# Norte do Arquivos do Abismo — leitura obrigatória dos analistas

## Objetivo
Vídeos verticais de ~60 s sobre desastres e mortes incomuns **reais**, contados como "vazamento dos arquivos". Cada vídeo precisa ser
(1) assistido até o fim e revisto (loop), (2) comentado/compartilhado, (3) fiel aos fatos e respeitoso com as vítimas.

## Metas internas (hipóteses, não benchmarks oficiais)
3 s ≥ 75% · 15 s ≥ 60% · 30 s ≥ 52% · fim ≥ 45% · rever ≥ 10%. Duração 55–65 s (≈100–130 palavras faladas, ritmo natural).

## Hierarquia (resolver conflitos)
1. Fato verificável e respeito às vítimas (nada inventado, nada de gore gratuito, nada de culpar pessoas reais sem fonte).
2. Clareza na primeira escuta (o texto é FALADO).
3. Retenção. 4. Estilo/identidade.

## Regras do dono
- Gatilho in media res (0–3 s); escalada de fatos curtos; clímax = detalhe mais perturbador, corte seco, que emenda no começo (loop).
- Texto escrito para TTS: `(...)` = pausa de suspense; CAIXA ALTA só em 1–2 palavras de pico por frase (não em toda palavra forte).
- Sem cumprimentos, sem "hoje vou contar", sem moral da história, sem pergunta genérica.


## REGRA DO GANCHO: "Resultado primeiro" (decisão do dono, 01/11/2026)
Técnica identificada: **cold open / in media res com resultado antes da causa**, que combina três gatilhos: (1) **consequência extrema e irreversível** (morte)
(2) **número concreto + sujeito humano** (quem morreu, quantos) e (3) **lacuna de curiosidade**: o espectador sabe o que aconteceu, mas não **como nem por quê**, e só o fim do vídeo paga.
Exemplo certo: "QUATRO mergulhadores morreram instantaneamente." Exemplo errado: "Uma trava de aço abriu quando não podia." (o sujeito é um objeto, a causa vem antes do resultado e não há nada em jogo: ninguém se importa com uma trava).
Checklist da 1ª frase (o `medir.py` confere o que dá):
1. **Até 8 palavras** e dita na 1ª palavra do áudio (sem data, local, "em 1983", nem contexto antes).
2. **Resultado, não mecanismo:** quem + quantos + o que aconteceu com eles (morreram, desapareceram, sobreviveram). A causa/objeto só aparece depois.
3. **Sujeito humano e número concreto** (4, 5, 300...), com a palavra de velocidade/absurdo se for **verdadeira e verificada** ("instantaneamente", "em um minuto").
4. **A causa vira o laço aberto** (frase 2 ou 3 anuncia sem entregar: "tudo por causa de uma trava") e é paga no clímax; o fim cortado emenda gramaticalmente com a 1ª frase.
5. Hierarquia: o fato precisa estar CONFIRMADO. Não infle o número nem a velocidade para o gancho ficar mais forte.

## Como criticar
- Escala calibrada: 5 = mediano do nicho, 7 = bom, **8 = publicável** (você não acha melhora relevante), 9–10 = referência.
- Reprove por padrão. Cite o texto exato. Entregue: pior frase, frase a cortar, objeção de um espectador cético, efeito esperado de cada correção.
- Não invente número. O que não verificou: "NÃO VERIFICADO".
- Rode `python arquivos-do-abismo/pipeline/medir.py arquivos-do-abismo/videos/<tema>` (palavras, duração estimada, caixa alta, pausas) antes de opinar.
- Você não edita arquivos; sua saída é texto (pt-BR).
