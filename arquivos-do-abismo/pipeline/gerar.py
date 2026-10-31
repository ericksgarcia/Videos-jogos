"""Pipeline do Arquivos do Abismo: TTS Gemini -> rubberband -> Whisper -> Flux (Replicate) -> legendas ASS -> ffmpeg.
Uso: python gerar.py <pasta-do-video> [--audio] [--imagens] [--legendas] [--montar] [--tudo]
Chaves: GEMINI_API_KEY e REPLICATE_API_TOKEN no ambiente (nunca em arquivo)."""
import asyncio, base64, json, os, re, subprocess, sys, urllib.request, wave
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
ARQ = "A heavily damaged 19th-century black and white archival photograph. {c}. Daguerreotype style, water damage, creepy stillness, heavy vignetting, highly realistic."
VHS = "A grainy, distorted VHS still frame from a 1990s camcorder. {c}. Liminal space atmosphere, harsh fluorescent lighting, static noise, analog artifacts, unsettling."
FLUX = dict(aspect_ratio="9:16", output_format="png", output_quality=100, num_inference_steps=28, guidance=3.5)
GEMINI_TTS = os.environ.get("GEMINI_TTS_MODELO", "gemini-3.8-flash-tts")
VOZ = os.environ.get("GEMINI_VOZ", "Charon")   # voz masculina grave; troque após ouvir

def carregar(pasta):
    return json.loads((Path(pasta) / "roteiro.json").read_text())

def saida(r):
    d = RAIZ / "output" / "arquivos-do-abismo" / r["slug"]; d.mkdir(parents=True, exist_ok=True); return d

def audio(r, d):
    """1 requisição ao Gemini TTS (texto inteiro), depois pitch/velocidade com rubberband."""
    texto = "\n".join(c["fala"] for c in r["cenas"])
    corpo = {"contents": [{"parts": [{"text": f"{r['estilo_voz']}\n\n{texto}"}]}],
             "generationConfig": {"responseModalities": ["AUDIO"],
                                  "speechConfig": {"voiceConfig": {"prebuiltVoiceConfig": {"voiceName": VOZ}}}}}
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_TTS}:generateContent",
        json.dumps(corpo).encode(), {"Content-Type": "application/json", "x-goog-api-key": os.environ.get("GEMINI_API_KEY", "")})
    pcm = base64.b64decode(json.load(urllib.request.urlopen(req))["candidates"][0]["content"]["parts"][0]["inlineData"]["data"])
    cru = d / "voz-bruta.wav"
    with wave.open(str(cru), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
    a = r["audio"]; fator = 2 ** (a["pitch_semitons"] / 12)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(cru), "-af",
                    f"rubberband=pitch={fator:.4f}:tempo={a['velocidade']}", "-ar", "48000", str(d / "voz.wav")], check=True)

def imagens(r, d):
    import replicate   # pip install replicate
    ps = [(ARQ if c["estilo"] == "arquivo" else VHS).format(c=c["cena"]) for c in r["cenas"]]
    async def tudo():
        return await asyncio.gather(*[replicate.async_run("black-forest-labs/flux-dev", input={"prompt": p, **FLUX}) for p in ps])
    for c, saidas in zip(r["cenas"], asyncio.run(tudo())):
        arq = saidas[0] if isinstance(saidas, list) else saidas
        (d / f"cena-{c['id']:02d}.png").write_bytes(arq.read())

def legendas(r, d):
    """Tempos por palavra com faster-whisper; ASS centrado em Y=50%, até 3 palavras, cores por palavra."""
    from faster_whisper import WhisperModel
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(d / "voz.wav"), "-ar", "16000", "-ac", "1", "-f", "f32le", "-"], capture_output=True, check=True).stdout
    import numpy as np
    segs, _ = WhisperModel("large-v3-turbo", device="cpu", compute_type="int8").transcribe(np.frombuffer(pcm, np.float32), language="pt", word_timestamps=True)
    ws = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words]
    vm = {re.sub(r"\W", "", x).lower() for c in r["cenas"] for x in c["vermelho"]}
    am = {re.sub(r"\W", "", x).lower() for c in r["cenas"] for x in c["amarelo"]}
    t = lambda s: f"{int(s//3600)}:{int(s%3600//60):02d}:{s%60:05.2f}"
    cab = ("[Script Info]\nPlayResX: 1080\nPlayResY: 1920\n[V4+ Styles]\n"
           "Format: Name,Fontname,Fontsize,PrimaryColour,OutlineColour,BackColour,Bold,Italic,Outline,Shadow,Alignment,MarginL,MarginR,MarginV\n"
           "Style: D,Montserrat Black,92,&H00FFFFFF,&H00000000,&H80000000,1,1,10,0,5,108,216,0\n"  # centro; margens: 10% esq, 20% dir (>=15%)
           "[Events]\nFormat: Layer,Start,End,Style,Text\n")
    linhas = []
    for i in range(0, len(ws), 3):
        g = ws[i:i + 3]
        txt = " ".join((f"{{\\c&H000090&}}{w.upper()}{{\\c&HFFFFFF&}}" if re.sub(r"\W", "", w).lower() in vm else
                        f"{{\\c&H00FFFF&}}{w.upper()}{{\\c&HFFFFFF&}}" if re.sub(r"\W", "", w).lower() in am else w.upper()) for w, _, _ in g)
        linhas.append(f"Dialogue: 0,{t(g[0][1])},{t(g[-1][2] + 0.15)},D,{{\\an5\\fscx80\\fscy80\\t(0,120,\\fscx100\\fscy100)}}{txt}")
    (d / "legendas.ass").write_text(cab + "\n".join(linhas) + "\n")

def montar(r, d):
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(d / "voz.wav")], capture_output=True, text=True).stdout)
    ent, filtro, ini = [], [], 0.0
    for k, c in enumerate(r["cenas"]):
        fim = dur if k == len(r["cenas"]) - 1 else r["cenas"][k + 1]["t"][0] * dur / r["cenas"][-1]["t"][1]
        ent += ["-loop", "1", "-t", f"{fim - ini + 0.05:.2f}", "-i", str(d / f"cena-{c['id']:02d}.png")]
        filtro.append(f"[{k}:v]scale=1080:1920,zoompan=z='min(zoom+0.0006,1.15)':d=1:s=1080x1920:fps=30,setsar=1[v{k}]"); ini = fim
    cat = "".join(f"[v{k}]" for k in range(len(r["cenas"]))) + f"concat=n={len(r['cenas'])}:v=1[v];[v]ass={d / 'legendas.ass'}[o]"
    ent += ["-i", str(d / "voz.wav"), "-f", "lavfi", "-i", f"sine=f=48:d={dur}"]
    n = len(r["cenas"])
    filtro.append(cat)
    filtro.append(f"[{n}:a][{n+1}:a]amix=inputs=2:weights=1 0.18:duration=first[a]")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *ent, "-filter_complex", ";".join(filtro), "-map", "[o]", "-map", "[a]",
                    "-c:v", "libx264", "-crf", "22", "-pix_fmt", "yuv420p", "-c:a", "aac", str(d / f"{r['slug']}.mp4")], check=True)

if __name__ == "__main__":
    pasta = sys.argv[1]; fl = set(sys.argv[2:]); r = carregar(pasta); d = saida(r)
    for nome, f in [("--audio", audio), ("--imagens", imagens), ("--legendas", legendas), ("--montar", montar)]:
        if "--tudo" in fl or nome in fl:
            print(nome); f(r, d)
