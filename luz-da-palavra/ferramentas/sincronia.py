"""Mede a sincronia escrita × fala de um vídeo no estilo caderno.

Uso: python luz-da-palavra/ferramentas/sincronia.py luz-da-palavra/videos/<tema>   (depois de gerar.py --so-montar)

Para cada palavra: quando a voz começa a dizê-la (fala, tempo ouvido pelo whisper) e quando a caneta começa a escrevê-la (ts).\nAponta as palavras escritas mais de 0,25 s depois de faladas (ou mais de 0,35 s antes).
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
S = [s for s in S if s.get("fala") is not None]  # só as palavras da fala (títulos e rótulos ficam de fora)
# atraso = a caneta começa a palavra depois de a voz começar a dizê-la (negativo = adiantada, o que é bom até ~0,3 s)
atr = [s["ts"] - s["fala"] for s in S]
ruins = [s for s in S if s["ts"] - s["fala"] > 0.25]
cedo = [s for s in S if s["ts"] - s["fala"] < -0.35]
print(f"{len(S)} palavras | atraso médio {sum(atr)/len(atr):+.2f} s | pior atraso {max(atr):+.2f} s | mais adiantada {min(atr):+.2f} s"
      f" | atrasadas > 0,25 s: {len(ruins)} | adiantadas > 0,35 s: {len(cedo)}")
for s in ruins + cedo:
    print(f"  {s['fala']:6.2f}s  {s['txt']:<16} caneta {s['ts']-s['fala']:+.2f}s  (escrita {s['te']-s['ts']:.2f}s)")
json.dump(S, open(Path(sorted(cands)[0]).parent / "sinc.json", "w"))  # fica na pasta output (não versionada)
