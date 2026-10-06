# Aprendendo Fácil — como está organizado

```
aprendendo/
├── identidade/          a marca (igual em todos os vídeos) — ver identidade/README.md
├── motor/               o que todos os vídeos usam
│   ├── gerar.py         narra, acha o tempo de cada palavra, monta, prévia, renderiza e mixa
│   ├── novo.py          cria a pasta de um vídeo novo a partir do modelo
│   ├── voz.py           TTS (Gemini, voz Achird) com cache e alinhamento palavra a palavra
│   ├── sons.py, sfx.py  efeitos e trilha sintetizados
│   ├── template.html    esqueleto da página do vídeo
│   ├── nucleo.js        timeline, dados do vídeo e utilitários
│   ├── biblioteca.js    desenhos e animações reaproveitáveis
│   ├── montagem.js      junta as cenas com transição e câmera lenta
│   └── vozes_teste.py   compara vozes do Gemini
└── videos/
    ├── eletricidade/        roteiro.json + cenas.js
    └── cargos-politicos/    roteiro.json + cenas.js
```

## Uso

```bash
python aprendendo/motor/novo.py buracos-negros "Como funciona um buraco negro"   # pasta nova
python aprendendo/motor/gerar.py aprendendo/videos/buracos-negros --previa         # fotos para revisar
python aprendendo/motor/gerar.py aprendendo/videos/buracos-negros                  # vídeo final
```

Saída em `output/<tema>/`: `<slug>.mp4`, `previa/` e `build/` (não versionados).

## Como funciona

roteiro → narração por cena (cache em `data/voz/`) → agenda (instante de cada batida e
legenda) → página do vídeo em `output/<tema>/build/` (template + identidade + biblioteca +
cenas do vídeo) → prévia ou render (HyperFrames) → mixagem (voz + efeitos nas batidas +
trilha com ducking) → MP4 em CRF 24.

Ordem de carregamento na página: `nucleo.js` → `identidade.js` → `biblioteca.js` →
`cenas.js` (do vídeo) → `montagem.js`.
