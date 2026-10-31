# Arquivos do Abismo

Canal TikTok dark: "Desastres Bizarros e Mortes Incomuns". Pasta independente (não usa a identidade
de `aprendendo/` nem de `luz-da-palavra/`). Cada vídeo fica em `videos/<tema>/` com `roteiro.json`.

## As 6 diretrizes (resumo)
1. 60 s / ~130 palavras; gatilho in media res (0–3 s), escalada de fatos, clímax com corte seco na última sílaba (loop).
2. TTS Gemini: `(...)` = pausa de suspense; CAIXA ALTA = peso vocal. O Gemini TTS não tem pitch/speed: a direção vai no
   prompt de estilo e pitch −2.0 / 0.9x são aplicados depois com `rubberband` (`pipeline/audio.py`).
3. Imagens Flux.1 dev (Replicate): `aspect_ratio=9:16, output_format=png, output_quality=100, num_inference_steps=28`,
   guidance 3.5 (no flux-dev o campo se chama `guidance`). Estilos "arquivo antigo" e "VHS"; sem rostos de pessoas reais.
4. Legendas no centro (Y=50%), largura ≤70%, fora dos 20% de baixo, 15% da direita e 10% do topo. Montserrat Black,
   caixa alta, itálico, contorno preto 10 px. Branco; amarelo = datas/nomes; vermelho = morte/perigo.
5. SFX por frase (campo `sfx` do roteiro) sobre um drone de sub-bass contínuo.
6. Pipeline: TTS + Whisper (tempos) + Flux assíncrono + ffmpeg.

## Regras de cuidado (nossas)
- Fatos só confirmados em fonte confiável; o que não foi confirmado fica marcado em `"verificar"` no roteiro e não vai ao ar.
- Sem nomes de vítimas sem confirmação; sem gore gratuito; sem rosto de pessoa real gerado por IA.
- Chaves (Gemini, Replicate) vêm do ambiente (`GEMINI_API_KEY`, `REPLICATE_API_TOKEN`); nunca em arquivo versionado.

## Uso
```
python arquivos-do-abismo/pipeline/gerar.py arquivos-do-abismo/videos/byford-dolphin --tudo
# ou por etapa: --audio  --imagens  --legendas  --montar
```
Saída (não versionada): `output/arquivos-do-abismo/<tema>/`.
