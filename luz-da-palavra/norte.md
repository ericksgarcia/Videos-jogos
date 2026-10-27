# Norte do Luz da Palavra (out/2026) — leitura obrigatória dos analistas

## Objetivo
Um canal cristão de vídeos verticais curtos que **conta a Bíblia como investigação e história**, com identidade reconhecível
(formato "Caso aberto", caderno noite, narração de pastor investigador, final que emenda no começo), para um público adulto
brasileiro. Cada vídeo precisa:
1. **ser assistido até o fim** (e revisto), porque conclusão e revisão são os sinais que mais empurram o vídeo;
2. **gerar comentário com conteúdo, salvamento e compartilhamento por mensagem** (mais valiosos que curtida);
3. **fazer a pessoa seguir e voltar** (promessa de série, formato conhecido);
4. **ser fiel ao texto e acolhedor com quem sofre**, sem manipular.

Quem assiste não deve sentir que "já viu esse vídeo": o formato se repete, o caso e o ritmo não.

## Metas internas (hipóteses de trabalho, NÃO benchmarks oficiais)
As fontes de mercado se contradizem (conclusão "boa" vai de 30% a 70%) e nenhuma é do TikTok. Usamos estas metas até termos números
próprios em `metricas.csv`; depois elas são recalibradas.
| Marco | Meta | Piso (abaixo disso, REFAZER o ponto) |
|---|---|---|
| Ainda assistindo aos 3 s | ≥ 75% | 65% |
| aos 15 s | ≥ 60% | 50% |
| aos 30 s | ≥ 52% | 42% |
| aos 60 s | ≥ 45% | 36% |
| no fim (conclusão) | ≥ 40% | 30% |
| rever (loop) | ≥ 8% | 4% |
Duração: 85–105 s (170–205 palavras). Cada 10 palavras a mais custa ~5 s. Nenhuma cena com mais de ~40 palavras (~20 s).

## Hierarquia para resolver conflitos (quando dois analistas discordam)
1. **Fidelidade ao texto bíblico** (nada de inferência apresentada como fato; nada de intenção atribuída a Deus/Jesus sem o texto).
2. **Cuidado pastoral** (nada que fira quem sofre; nada de culpa, medo, prosperidade, polêmica).
3. **Clareza** (a pessoa entende na primeira escuta).
4. **Retenção e engajamento.**
5. **Estilo e identidade.**
Se a sua recomendação sacrifica um nível mais alto por um mais baixo, **diga isso explicitamente** e proponha outra saída; nunca
escolha em silêncio. Se outro analista já aplicou o nível 1 ou 2, não o desfaça por causa do 4.

## Regras do dono (estáveis; só ele muda)
- Público adulto, tom de conversa com "você", sem infantilizar. Esperança sempre; assombro e ternura valem, tom pesado não.
- Abertura pela dor, choque ou curiosidade concreta; nunca "hoje vamos falar sobre…". O fato mais forte na 1ª frase.
- **Apelo à fé logo depois da abertura**, redação diferente a cada vídeo, nunca promete bênção nem duvida da fé de ninguém.
- **Uma pergunta para os comentários**, em cena própria, depois da revelação principal; aponta para o botão da **direita**; resposta curta
  (letra, número, uma palavra); não promete resposta.
- **Frase final fixa:** "Salva … (só o motivo varia), segue o Luz da Palavra, e lembra:" — emenda na 1ª frase do vídeo.
- Citação literal só da Almeida 1911/1914; o resto é paráfrase marcada com "cf." e a referência escrita na tela.
- O Gemini é **só** a narração (1 requisição por vídeo); nada de pedir ao Gemini para avaliar, alinhar ou transcrever.
- Um vídeo por vez. Não repetir tema nem ângulo.

## Formatos do canal (pilares)
Ver `estrategia.md`. Resumo: **Caso aberto** (identidade/alcance), **A Lupa** (uma palavra do original; salvar/compartilhar),
**Sem filtro** (salmos honestos; consolo por mensagem), **Noite** (oração curta; salvar/ouvir de noite), **Novela** (série de partes).

## Livro de erros (já aconteceram; procure-os ativamente)
Cada item custou retrabalho ou um defeito publicado. Se você os encontrar de novo, é problema ALTO.
1. **Superlativo não verificável** ("a pista que quase ninguém lê"): João 20:11–18 é dos trechos mais lidos. Troque por lacuna concreta
   ("a última não está no túmulo").
2. **Inferência apresentada como fato** ("lençóis no lugar" — o texto diz *no chão*; "acham absurdo" — o texto diz que replicam; "Jesus parou
   a multidão" — o texto diz que *se voltou*). Rótulo obrigatório para cada afirmação: LITERAL / PARÁFRASE FIEL / INFERÊNCIA / INVENÇÃO.
3. **Promessa vaga** ("um detalhe que quase ninguém vê", "um segredo"): a lacuna tem de dizer *o que* falta saber e só o vídeo responde.
4. **Promessa desproporcional ao pagamento** (prometer um segredo e entregar uma curiosidade).
5. **A opção de uma pergunta nunca aparece no vídeo** (opção B "Não temas" sem ter sido dita antes): quem responde B não ouviu nada sobre B.
6. **Tique de frase** ("Será que…" 3×, "a pista que…" 2×) e **repetição do mesmo molde** de apelo à fé ("Se você crê que… curte e comenta amém, pra
   chegar a quem…"): o apelo é o ponto de maior perda de audiência medido nas simulações; encurtar e variar.
7. **Cena longa e seca** (pista de 40+ palavras, só explicação, sem imagem nem virada).
8. **Falso final / "já entendeu tudo"** antes da última cena; **spoiler** do laço na descrição ("no jardim…").
9. **Capa repete a fala** em vez de complementar; **gancho na tela só diz o nome do formato** ("CASO ABERTO: 4 PISTAS" não segura ninguém).
10. **Contar palavras e segundos "no olho"** (os analistas erraram a contagem em 5–15%): use `ferramentas/lint_roteiro.py`.
11. **Bugs de produção que não dão erro:** chave do mapa de palavras com pontuação (`mapa["manhã."]` — o círculo/sublinhado some em silêncio);
    batida fora de ordem ou que não está na fala (cai num instante errado); evento sem som definido (toca "pop" 0,4, alto); desenho que não se
    lê (a pedra parecia um capacete, o lenço parecia uma pedra); texto do carimbo maior que a moldura; rótulos A/B que se encostam.
12. **Voz picotada:** marcações de pausa em excesso dão 41–47% de silêncio e trechos a ~190–205 palavras/min "só falando". Medir com
    `ferramentas/medir_voz.py`; se soar corrida, reduzir marcações ou usar `voz.pausas.ritmo`.
13. **Mais de um analista elogiando por cortesia.** Nota 8 exige que você não consiga apontar uma melhora relevante.

## Como críticar (todos os analistas)
- **Escala calibrada:** 5 = mediano do nicho cristão no TikTok; 7 = bom; **8 = publicável sem vergonha** (você não acha nada relevante a melhorar);
  9–10 = referência do nicho. Um primeiro rascunho costuma ser 5–6,5. Se você nunca dá nota abaixo de 7 a um roteiro novo, está sendo brando.
- **Reprove por padrão.** APROVADO só se *todos* os critérios ≥ 7, a média ≥ 8 e não há nenhum problema ALTO aberto.
- **Cite o texto exato** (entre aspas) de cada problema. Não critique "o tom" sem citar a frase.
- **Sempre entregue:** a pior frase do roteiro, a frase que você cortaria, a objeção de um espectador cético (uma linha), e o efeito esperado de
  cada correção ("sobe o critério 4 de 6 para 8").
- **Correção parcial não aprova.** Se estiver reavaliando uma versão revisada, compare com os problemas que você apontou antes e liste os que continuam.
- **Não invente números.** Estimativas de retenção são simulação: mostre a conta (palavras → segundos → % por cena) e diga que é estimativa.
  Se algo não foi verificado (versículo, palavra do original, número), escreva "NÃO VERIFICADO" e peça para cortar.
- **Rode o verificador** antes de opinar: `python luz-da-palavra/ferramentas/lint_roteiro.py luz-da-palavra/videos/<tema>` (se tiver Bash).
  Os FALHA são do desenvolvedor, não do analista; os ALERTA entram na sua análise.
- Não edite arquivos do vídeo. Sua saída é texto (pt-BR) no formato pedido pelo seu brief.
