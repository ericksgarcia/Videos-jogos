# Aprendendo Fácil

Vídeos verticais (1080×1920) que explicam assuntos complicados de um jeito simples,
para adultos, em motion design ilustrado, com narração natural, legenda palavra a
palavra, efeitos e trilha. Tudo é gerado por código.

```bash
npm ci && pip install -r requirements.txt     # (feito automaticamente nas sessões na nuvem)
python aprendendo/motor/novo.py <tema> "Título"                 # cria aprendendo/videos/<tema>/
python aprendendo/motor/gerar.py aprendendo/videos/<tema> --previa   # fotos para revisar
python aprendendo/motor/gerar.py aprendendo/videos/<tema>            # vídeo final
```

- `aprendendo/identidade/` — a marca (logo, cores, fontes, textos, voz, legendas, abertura, final)
- `aprendendo/motor/` — gerador e biblioteca comuns
- `aprendendo/videos/<tema>/` — um vídeo por pasta

Saída: `output/<tema>/<slug>.mp4`. Detalhes em [aprendendo/README.md](aprendendo/README.md);
regras do canal e padrão visual em [CLAUDE.md](CLAUDE.md).
