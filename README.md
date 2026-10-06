# Aprendendo Fácil

Vídeos verticais (1080×1920) que explicam assuntos complicados de um jeito simples,
para adultos, em motion design ilustrado, com narração natural, legenda palavra a
palavra, efeitos e trilha. Tudo é gerado por código.

```bash
npm ci && pip install -r requirements.txt     # (feito automaticamente nas sessões na nuvem)
export GEMINI_API_KEY=...                       # narração (Gemini TTS)
python aprendendo/gerar.py aprendendo/roteiros/eletricidade.json --previa   # fotos para revisar
python aprendendo/gerar.py aprendendo/roteiros/eletricidade.json            # vídeo final
```

Saída: `output/aprendendo/<slug>.mp4`. Detalhes em [aprendendo/README.md](aprendendo/README.md);
regras do canal e padrão visual em [CLAUDE.md](CLAUDE.md).
