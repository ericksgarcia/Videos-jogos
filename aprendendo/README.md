# Aprendendo Fácil

Canal de vídeos verticais (1080×1920) que explicam assuntos complicados do
jeito mais simples possível — como se fosse para uma criança de 10 anos, mas
para um público adulto (técnica de Feynman: analogias do dia a dia, um passo
por vez, sem infantilizar).

Estilo: motion design ilustrado (vetores chapados, cores vivas), cada
ilustração animada no instante em que o narrador fala a palavra, legenda
palavra a palavra, trilha leve e efeitos sonoros. Tudo gerado por código.

## Uso

```bash
python aprendendo/gerar.py aprendendo/roteiros/eletricidade.json
python aprendendo/gerar.py aprendendo/roteiros/eletricidade.json --qualidade draft
```

Saída: `output/aprendendo/<slug>.mp4` (~20 MB para 2min20).

## Como funciona

| Arquivo | Papel |
|---|---|
| `roteiros/*.json` | Roteiro: cenas, fala de cada cena e "batidas" (palavra da fala → animação) |
| `gerar.py` | Narra cada cena (Gemini TTS, voz Achird), acha o tempo de cada palavra, monta a agenda, mixa e renderiza |
| `template.html` | Biblioteca de cenas animadas (GSAP + DrawSVG/MorphSVG/MotionPath) |
| `sons.py` | Efeitos (clique, plim, zap, água, vento, vapor, tampa) e trilha de fundo sintetizados |

Cada cena tem um `tipo` que aponta para uma função em `template.html`
(`CENAS.<tipo>`). Para um assunto novo: escreva o roteiro e, se precisar de
uma ilustração nova, crie o tipo de cena correspondente.

A voz usa `src/voz.py` com direção de narrador adulto de divulgação
científica; a chave fica em `GEMINI_API_KEY` (ou `.env`).
