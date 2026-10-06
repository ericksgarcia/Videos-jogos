# Aprendendo Fácil — como funciona

| Arquivo | Papel |
|---|---|
| `roteiros/<tema>.json` | Roteiro: cenas, fala de cada cena e "batidas" (palavra da fala → evento) |
| `cenas/<tema>.js` | As cenas animadas do tema (`CENAS.<tipo>`), uma por cena do roteiro |
| `template.html` | Estrutura comum: marca, legendas, capítulos, gancho, gradientes, biblioteca de desenhos e animações (GSAP) |
| `gerar.py` | Narra cada cena, acha o tempo de cada palavra, monta a agenda, gera prévias, renderiza (HyperFrames) e mixa |
| `voz.py` | TTS (Gemini, voz Achird) com cache e alinhamento palavra a palavra |
| `sons.py`, `sfx.py` | Efeitos (clique, plim, zap, água, vento, vapor, whoosh, pop…) e trilha sintetizados |
| `vozes_teste.py` | Compara vozes do Gemini lado a lado |

Fluxo: roteiro → narração (cache em `data/voz/`) → agenda (instante de cada batida e
legenda) → `output/aprendendo/build/<slug>/index.html` → prévia (`--previa`) ou
render → mixagem (voz + efeitos nas batidas + trilha com ducking) → MP4 em CRF 24.

Opções de `gerar.py`: `--previa`, `--so-montar`, `--qualidade draft|standard|high`.
