"""Mede a sincronia escrita × fala de um vídeo no estilo caderno.

Uso: python luz-da-palavra/ferramentas/sincronia.py luz-da-palavra/videos/<tema>   (depois de gerar.py --so-montar)

Para cada palavra: quando a fala a diz (ts0) e quando a caneta começa/termina de escrevê-la (ts/te).
Atraso = ts - ts0 (a caneta começa depois da voz). Aponta as palavras com atraso > 0,35 s e o atraso máximo por cena.
"""
import glob, json, subprocess, sys
from pathlib import Path

pasta = Path(sys.argv[1]).resolve()
tema = pasta.name
cands = [p for p in glob.glob(f"output/**/{tema}/build/index.html", recursive=True)]
if not cands:
    sys.exit("monte antes: gerar.py <pasta> --so-montar")
pagina = Path(sorted(cands)[0]).resolve().as_uri()
mod = next(iter(sorted(glob.glob("/opt/node*/lib/node_modules/playwright/index.mjs")) + sorted(glob.glob("/usr/lib/node_modules/playwright/index.mjs"))), None)
js = Path(cands[0]).parent / "_sinc.mjs"
js.write_text(f"""import {{ chromium }} from "{mod}";
const nav = await chromium.launch(), pg = await nav.newPage({{ viewport: {{ width: 1080, height: 1920 }} }});
await pg.goto("{pagina}"); await new Promise((r) => setTimeout(r, 1500));
const S = await pg.evaluate(() => {{ const tl = window.__timelines.main, T = tl.duration(); for (let t = 0; t < T; t += 0.5) tl.seek(t); return _CAD.sinc; }});
await nav.close(); console.log(JSON.stringify(S));""")
r = subprocess.run(["node", str(js)], capture_output=True, text=True, timeout=600); js.unlink()
S = json.loads(r.stdout.strip().splitlines()[-1])
S = [s for s in S if s["txt"] and s["te0"] - s["ts0"] < 3]  # só palavras da fala (títulos longos ficam de fora)
atr = [s["ts"] - s["ts0"] for s in S]
ruins = [s for s in S if s["ts"] - s["ts0"] > 0.35]
print(f"{len(S)} palavras | atraso médio {sum(atr)/len(atr):.2f} s | máximo {max(atr):.2f} s | > 0,35 s: {len(ruins)}")
for s in ruins:
    print(f"  {s['ts0']:6.2f}s  {s['txt']:<16} atraso {s['ts']-s['ts0']:.2f}s  (escrita {s['te']-s['ts']:.2f}s)")
json.dump(S, open(Path(sorted(cands)[0]).parent / "sinc.json", "w"))  # fica na pasta output (não versionada)
