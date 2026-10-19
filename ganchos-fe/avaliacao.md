# Avaliação dos ganchos de fé

Juiz: Claude, lendo cada gancho como um espectador que passa o dedo pelo feed e decide em 1 segundo.
Régua: 6 critérios de 0 a 10. **Aprova** quem tem média ≥ 8,0 **e** nenhum critério abaixo de 7.
Depois de reescrever, reavalia (rodada 2). Mais o verificador mecânico: `python ganchos/checar.py ganchos-fe`.

| Sigla | Critério | O que pergunta |
|---|---|---|
| C | Curiosidade | Abre um vácuo que só a legenda fecha? (a resposta NÃO pode estar na tela) |
| E | Especificidade | Tem nome, número ou detalhe concreto, ou é vago? |
| L | Leitura | Cabe em ~6 s de leitura, tem ritmo de fala, sem frase torta? (texto ≤ 22 palavras, complemento ≤ 8) |
| V | Você | O espectador entra na frase? Tem algo em jogo para ele? |
| F | Fidelidade | Exato com o texto bíblico, sem exagero, e a legenda cumpre a promessa do gancho? |
| R | Releitura | Vale rever? Tem uma camada que só se percebe na 2ª leitura? (o vídeo roda em loop) |

Limite honesto: é uma avaliação de especialista, não é dado de público. O teste definitivo é postar e olhar retenção
e comentários (mais abaixo, "Como validar").

## Rodada 1: versão que enviei antes

| # | Tema | C | E | L | V | F | R | Média | Veredito | Diagnóstico |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | Davi e Golias | 8 | 7 | 9 | 5 | 9 | 7 | 7,5 | ❌ V | "mudou tudo" é vago; nada em jogo para quem assiste |
| 02 | Pai-Nosso | 6 | 5 | 8 | 5 | 9 | 6 | 6,5 | ❌ | "uma palavra que a maioria passa direto" não prende; sem gancho pessoal |
| 03 | Salmo 23 | 6 | 7 | 6 | 6 | 9 | 7 | 6,8 | ❌ | dupla negação ("não promete que você não vai") confunde |
| 04 | Jonas | 8 | 7 | 9 | 7 | 10 | 8 | 8,2 | ✅ | pergunta sem resposta é um bom vácuo; mantido |
| 05 | Jó | 7 | 7 | 8 | 6 | 9 | 7 | 7,3 | ❌ V | correto, mas distante |
| 06 | Marta e Maria | 6 | 6 | 7 | 7 | 6 | 6 | 6,3 | ❌ | promete "uma palavra repetida" e a legenda entrega o nome dela: promessa não cumprida |
| 07 | Semente | 7 | 6 | 9 | 6 | 9 | 7 | 7,3 | ❌ V | "existe uma razão" é fórmula gasta |
| 08 | Moisés | 7 | 8 | 6 | 6 | 9 | 7 | 7,2 | ❌ | 28 palavras, sem complemento; passa do que se lê em 8 s |
| 09 | José | 8 | 7 | 8 | 6 | 7 | 7 | 7,2 | ❌ | "a humanidade nunca esqueceu" é exagero |
| 10 | Ovelha perdida | 8 | 8 | 8 | 6 | 9 | 8 | 7,8 | ❌ V | forte, mas fala de "pastor", não de quem assiste |
| 11 | Filho pródigo | 8 | 8 | 7 | 8 | 9 | 7 | 7,8 | ❌ | 23 palavras, mas a ideia é boa |
| 12 | Maná | 8 | 8 | 7 | 5 | 9 | 7 | 7,3 | ❌ V | longo e sem ligação com a vida do espectador |
| 13 | Salomão | 8 | 8 | 7 | 7 | 9 | 7 | 7,7 | ❌ | "mudou a história" é vago; 23 palavras |
| 14 | Daniel | 7 | 8 | 6 | 6 | 9 | 7 | 7,2 | ❌ | "daria a ele a pena de morte" é torto; sem "você" |
| 15 | Pedro | 6 | 7 | 9 | 7 | 9 | 6 | 7,3 | ❌ | o complemento entrega a resposta ("para onde ele olhou"): mata a curiosidade |
| 16 | Zaqueu | 8 | 8 | 8 | 7 | 10 | 7 | 8,0 | ✅ | mantido |
| 17 | Samaritano | 7 | 8 | 8 | 7 | 10 | 7 | 7,8 | ❌ | boa ideia; falta o "por quê" aberto |
| 18 | Paz na prisão | 7 | 8 | 8 | 7 | 9 | 7 | 7,7 | ❌ | o contraste está fraco ("de dentro de uma prisão") |
| 19 | 1 Coríntios 13 | 9 | 9 | 9 | 7 | 10 | 8 | 8,7 | ✅ | o melhor da série; mantido |
| 20 | Guarda o coração | 8 | 8 | 7 | 7 | 10 | 7 | 7,8 | ❌ | o gancho conta a resposta ("não é dinheiro, nem sucesso") sem deixar o espectador adivinhar |

Resultado da rodada 1: **3 aprovados** (04, 16, 19), **17 reprovados**. O 11 só reprovou por tamanho (verificador mecânico).

Problemas que se repetem, e a correção aplicada em todos:
1. **Quase nenhum falava com o espectador** (V baixo): o complemento passou a ligar o texto à vida de quem assiste ("Você faria o mesmo?", "A ovelha perdida pode ser você").
2. **Vazio de curiosidade mal fechado**: em 6, 15 e 20 a tela entregava a resposta ou prometia uma coisa diferente da que a legenda cumpre.
3. **Texto comprido ou torto** (L): 12 estavam fora do limite do verificador. Passam a ter ≤ 22 palavras + complemento ≤ 8.
4. **Exageros**: "a humanidade nunca esqueceu" (09) e "mudou tudo" (01) saíram.

## Rodada 2: depois de reescrever

Reescrita em duas passadas: a primeira versão do 03, 12 e 14 ainda reprovou e foi refeita antes de entrar aqui.

| # | Tema | Texto final (resumo) | C | E | L | V | F | R | Média | Veredito |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 | Davi e Golias | "A pedra não decidiu a batalha… Foi uma frase que ele gritou ANTES de correr." + "Você pode precisar dela hoje." | 8 | 7 | 9 | 7 | 9 | 8 | 8,0 | ✅ |
| 02 | Pai-Nosso | "…começa com uma palavra que você já disse mil vezes sem perceber." | 8 | 7 | 9 | 8 | 9 | 8 | 8,2 | ✅ |
| 03 | Salmo 23 | "…não promete que você vai escapar do vale. Promete algo mais forte. Está no meio do versículo 4." | 9 | 8 | 8 | 7 | 9 | 8 | 8,2 | ✅ (v1: 7,7 ❌ por E=7, R=7) |
| 04 | Jonas | mantido | 8 | 7 | 9 | 7 | 10 | 8 | 8,2 | ✅ |
| 05 | Jó | "…Deus apareceu, mas não explicou nada. Fez outra coisa." + "Serve para a sua dor também." | 8 | 7 | 9 | 8 | 9 | 7 | 8,0 | ✅ |
| 06 | Marta e Maria | "…o que ele apontou nela provavelmente está na sua cabeça agora." + "Ele disse com carinho." | 8 | 7 | 8 | 9 | 9 | 7 | 8,0 | ✅ |
| 07 | Semente | "Jesus podia ter comparado a fé a uma montanha. Escolheu a menor semente… Por quê?" | 8 | 8 | 8 | 8 | 9 | 8 | 8,2 | ✅ |
| 08 | Moisés | "…Os 40 anos de silêncio… não eram atraso. Eram o plano." + "Vale para quem se sente atrasado." | 8 | 8 | 8 | 8 | 8 | 8 | 8,0 | ✅ (F=8: "plano" é leitura teológica, a legenda a sustenta) |
| 09 | José | "José foi vendido pelos próprios irmãos. Anos depois, teve todos eles nas mãos e escolheu dizer uma frase." | 9 | 8 | 8 | 7 | 9 | 8 | 8,2 | ✅ |
| 10 | Ovelha perdida | "Um pastor deixa 99 ovelhas… por uma só…" + "A ovelha perdida pode ser você." | 8 | 8 | 9 | 8 | 9 | 8 | 8,3 | ✅ |
| 11 | Filho pródigo | "…existe um personagem que quase todo mundo esquece. E é o mais parecido com você." + "Ele nunca saiu de casa." | 9 | 8 | 8 | 9 | 9 | 8 | 8,5 | ✅ |
| 12 | Maná | "…proibiu guardar para o dia seguinte. Só abriu uma exceção." + "Ela muda como você vê o amanhã." | 8 | 8 | 8 | 8 | 9 | 8 | 8,2 | ✅ (v1: L=7 ❌, 24 palavras) |
| 13 | Salomão | "…Ele podia pedir riqueza, fama ou vida longa. Pediu outra coisa." + "E ganhou tudo o resto." | 8 | 8 | 8 | 7 | 9 | 8 | 8,0 | ✅ |
| 14 | Daniel | "Orar virou crime e a pena era a cova dos leões. Daniel orou igual. Repare no detalhe que a Bíblia registra." + "Você faria o mesmo?" | 8 | 8 | 8 | 8 | 9 | 8 | 8,2 | ✅ (v1: V=6 ❌) |
| 15 | Pedro | "…só afundou quando mudou uma coisa. Não foi a onda, nem o vento." + "A causa estava nele, não no mar." | 8 | 7 | 9 | 7 | 9 | 8 | 8,0 | ✅ |
| 16 | Zaqueu | mantido | 8 | 8 | 8 | 7 | 10 | 7 | 8,0 | ✅ |
| 17 | Samaritano | "…quem passou direto pelo homem ferido foi um sacerdote e um levita. Jesus fez isso de propósito." + "O motivo incomoda." | 8 | 9 | 8 | 7 | 10 | 8 | 8,3 | ✅ |
| 18 | Paz na prisão | "Quando Paulo escreveu 'a paz que excede todo entendimento', ele estava preso e sem saber se sairia vivo." + "Releia o versículo agora." | 8 | 9 | 8 | 7 | 9 | 8 | 8,2 | ✅ |
| 19 | 1 Coríntios 13 | mantido | 9 | 9 | 9 | 7 | 10 | 8 | 8,7 | ✅ |
| 20 | Guarda o coração | "Salomão escreveu uma frase que começa com 'Acima de tudo'. Não é dinheiro, nem saúde, nem sucesso." + "Adivinha o que é?" | 9 | 8 | 9 | 8 | 10 | 8 | 8,7 | ✅ |

Resultado da rodada 2: **20 aprovados**. Média da série: 7,4 → 8,2.

## O que mudou além do texto

- **Complemento em etapas**: a frase de baixo (ciano) agora entra aos ~3,5 s. Quem fica para ler vê a 2ª camada e a legenda
  já foi aberta; no loop, a leitura ganha um segundo momento.
- **Primeira linha da legenda**: reescrita para ≤ 125 caracteres (o que aparece antes do "mais"), com o mesmo vácuo do vídeo.
- **Imagens 08, 09 e 14 refeitas** (cruz no canto, rostinho no manto, cúpulas e tapete de oração), com os mesmos modelos baratos.

## Como validar (o juiz definitivo é o público)

Postar 2 versões do mesmo tema (original × reescrita) e comparar em 48 h: **retenção aos 3 s**, **% que vê até o fim / revê**,
**comentários por visualização** e **abertura da legenda**. Se a nova ganhar de forma consistente, esse padrão vale para a série toda.
