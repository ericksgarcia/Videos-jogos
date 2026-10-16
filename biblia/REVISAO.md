# Revisão rígida do roteiro (avaliador independente)

> **Desde o vídeo 40 a revisão é feita por UM avaliador independente (as 7 fases juntas), novo a cada rodada; o texto é escrito pelo Claude, sem API paga de texto.** Esta página é a régua (notas, o que reprova, o que é extraordinário).

Todo roteiro passa por um avaliador que NÃO escreveu o texto e só enxerga o roteiro — nunca a justificativa do autor.
Ele age como alguém que rola o TikTok por hábito, com o polegar já a caminho de passar o vídeo. A pergunta em cada
fase é: **"eu paro aqui? eu deixo passar? em que palavra eu rolaria?"**

## Notas (1–10), sem generosidade
- 10 = eu travaria e contaria pra alguém; 8 = eu continuo sem pensar em rolar; 6 = eu continuo por inércia (REPROVA);
  ≤ 5 = eu rolo agora (REPROVA).
- **Mínimo aceito: 8 em TODAS as fases** (gancho, virada, contexto, cta, versiculo, ato3, final). Uma fase abaixo de 8
  reprova o roteiro inteiro: reescreve a fase (e as vizinhas que dependem dela) e passa de novo por um avaliador novo.
- Para cada fase o avaliador cita a palavra/trecho exato em que rolaria e o motivo, e propõe a reescrita concreta.

## O que reprova de saída
- Abertura genérica/autoajuda ("Você está ansioso?"), pergunta como 1ª frase, contexto de enciclopédia antes do choque.
- Frase que poderia estar em qualquer vídeo religioso (clichê: "Deus tem um plano", "nunca desista") sem fato novo.
- Fase sem informação nova ou sem tensão; CTA que corta o clima sem alimentar o laço; ato 3 em tom de sermão/lista.
- Final que só "termina" em vez de fechar o laço e puxar o replay.

- (Formato antigo, com texto de abertura na tela: o texto era SEMPRE a 1ª frase narrada.) No formato atual só o versículo aparece escrito; as demais falas são só ouvidas.

## O que o roteiro extraordinário tem
- Um fato concreto e estranho que o espectador não sabia (número, nome, regra da época, reviravolta).
- Tensão que cresce: cada frase deixa a pergunta mais urgente, e a resposta só vem mais tarde.
- Uma imagem mental forte por fase; frases curtas, faladas; zero palavra de enchimento.
- Uma virada no ato 3 que muda o sentido do começo (e o final emenda no gancho).

## Registro
O roteiro leva `"revisao": { gancho: 9, virada: 8, ... }` com as notas do avaliador independente. A esteira recusa
nota ausente ou < 8. Depois do render, a mesma régua vale para os frames (0 s, 1,5 s, virada, CTA, versículo, ato 3,
final): qualquer fase fraca = refazer antes de enviar.
