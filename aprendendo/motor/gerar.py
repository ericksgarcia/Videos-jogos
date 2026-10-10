"""Gera um vídeo do canal Aprendendo Fácil a partir de um roteiro.

Uso (cada vídeo é uma pasta em aprendendo/videos/<tema>/ com roteiro.json e cenas.js):
  python aprendendo/motor/gerar.py aprendendo/videos/eletricidade
  python aprendendo/motor/gerar.py aprendendo/videos/eletricidade --previa   # fotos para revisar
  python aprendendo/motor/gerar.py aprendendo/videos/eletricidade --qualidade draft

Saída em output/<tema>/: <slug>.mp4, previa/ e build/.

Cada cena do roteiro tem uma fala e "batidas": palavras da fala que disparam
uma animação (e um som). A narração é gerada por cena; o tempo de cada
palavra vem do alinhamento em voz.py, então ilustração, legenda e som
acontecem no instante em que a palavra é dita.
"""
import argparse
import glob
import json
import os
import shutil
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy import signal
from scipy.io import wavfile

AQUI = Path(__file__).resolve().parent          # aprendendo/motor
CANAL = AQUI.parent                              # aprendendo
IDENTIDADE = CANAL / "identidade"
RAIZ = CANAL.parent
sys.path.insert(0, str(AQUI))
import sons  # noqa: E402
import voz  # noqa: E402

NODE = RAIZ / "node_modules"
SR = 48000

MARCA = json.loads((IDENTIDADE / "marca.json").read_text())
DIRECAO = MARCA["voz"]["direcao"]  # narrador adulto de divulgação científica

INICIO_VOZ = 0.55     # a voz entra um pouco depois da cena abrir
FOLGA_FIM = 0.55      # respiro depois da fala antes da próxima cena

# final que emenda no começo: nos últimos LOOP_FINAL s o vídeo se funde com o quadro 0, então quando
# a rede repete o vídeo a volta é contínua (conta como replay). Pedido do dono, out/2026.
LOOP_FINAL = 0.5

# som padrão de uma batida sem som definido no roteiro ("sons": {"evento": ["efeito", ganho]})
SOM_PADRAO = ("pop", 0.4)


def _r(x):
    return round(float(x), 3)


def narrar(roteiro):
    out = []
    for c in roteiro["cenas"]:
        tts = c.get("tts") or c["fala"]
        out.append(voz.narrar(c["fala"], tts, direcao=DIRECAO, voz_nome=roteiro.get("voz", MARCA["voz"]["nome"])))
    return out


def agenda(roteiro, falas):
    cenas, t = [], 0.0
    for i, (c, f) in enumerate(zip(roteiro["cenas"], falas)):
        ini = t
        voz_ini = ini + (0.3 if i == 0 else INICIO_VOZ)
        fim = voz_ini + f["dur"] + FOLGA_FIM
        batidas, ultimo = {}, 0.0
        for k, (palavra, evento) in enumerate(c.get("batidas", {}).items()):
            achou = voz.instante_de(f, [palavra], depois=ultimo)
            if achou is None:
                achou = voz.instante_de(f, [palavra])
            if achou is None:  # palavra não encontrada: espalha pela fala
                achou = f["dur"] * (k + 1) / (len(c["batidas"]) + 1)
            ultimo = achou
            batidas[evento] = _r(voz_ini + achou)
        chaves = {voz._norm(p) for p in c.get("batidas", {})}
        legendas = voz.legendas(f, voz_ini)
        for b in legendas:
            b["destaque"] = [voz._norm(w) in chaves for w, _, _ in b["palavras"]]
        cenas.append({"id": c["id"], "tipo": c["tipo"], "titulo": c["titulo"], "ini": _r(ini), "voz": _r(voz_ini),
                      "fim": _r(fim), "batidas": batidas, "legendas": legendas})
        t = fim
    return {"cenas": cenas, "total": _r(t + 1.2)}


def _soma(buf, x, t, g):
    i = int(round(t * SR))
    if i >= len(buf):
        return
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i] * g


def _ler_voz(arq):
    sr, x = wavfile.read(arq)
    x = x.astype(np.float64) / (np.iinfo(x.dtype).max if x.dtype.kind in "iu" else 1)
    if x.ndim > 1:
        x = x.mean(axis=1)
    if sr != SR:
        x = signal.resample_poly(x, SR, sr)
    # leve compressão e corte de graves para a voz ficar "na cara"
    x = signal.sosfilt(signal.butter(2, 90, btype="high", fs=SR, output="sos"), x)
    x = np.tanh(x * 2.2) / np.tanh(2.2)
    return np.stack([x, x], axis=1)


def mixar(ag, falas, saida, sons_roteiro=None):
    n = int(ag["total"] * SR)
    voz_buf, efx = np.zeros((n, 2)), np.zeros((n, 2))
    for c, f in zip(ag["cenas"], falas):
        if f.get("wav"):
            _soma(voz_buf, _ler_voz(f["wav"]), c["voz"], 1.0)
        if c["ini"] > 0:
            _soma(efx, sons.som("transicao"), max(0, c["ini"] - 0.45), 0.55)
        for ev, t in c["batidas"].items():
            nome, g = (sons_roteiro or {}).get(ev, SOM_PADRAO)
            _soma(efx, sons.som(nome), t, g)
    musica = sons.trilha(ag["total"], marcos=[c["ini"] for c in ag["cenas"][1:]])[:n]
    # ducking suave: música e efeitos abaixam sob a voz (envelope com ataque/soltura)
    nivel = np.convolve(np.abs(voz_buf[:, 0]), np.ones(2400) / 2400, mode="same")
    nivel = np.clip(nivel / 0.035, 0, 1)
    nivel = signal.sosfiltfilt(signal.butter(1, 3, fs=SR, output="sos"), nivel)
    # nas pausas e trocas de cena a música sobe (dá ritmo aos cortes); sob a voz, abaixa
    sobe = np.zeros(n)
    for c in ag["cenas"][1:]:
        i0, i1 = int(max(0, c["ini"] - 0.8) * SR), int(min(ag["total"], c["voz"] + 0.2) * SR)
        sobe[i0:i1] = 1
    sobe = signal.sosfiltfilt(signal.butter(1, 1.5, fs=SR, output="sos"), sobe)
    musica *= (0.62 - 0.42 * nivel + 0.18 * sobe)[:, None]
    efx *= (1.5 - 0.35 * nivel)[:, None]
    # voz com leve "presença" (realce em 3 kHz) e um toque de ambiente
    pres = signal.sosfilt(signal.butter(2, [2500, 5000], btype="band", fs=SR, output="sos"), voz_buf, axis=0)
    corpo = signal.sosfilt(signal.butter(2, [140, 420], btype="band", fs=SR, output="sos"), voz_buf, axis=0)
    voz_buf = voz_buf + pres * 0.25 + corpo * 0.3
    voz_buf = np.tanh(voz_buf * 1.6) / np.tanh(1.6)  # saturação suave: voz mais encorpada no celular
    amb = sons.reverb(voz_buf[:, 0], 0.9, 4000)[:n] * 0.06
    buf = voz_buf + amb + efx + musica
    # master: compressor simples + limitador suave + normalização
    env = np.sqrt(signal.sosfiltfilt(signal.butter(1, 8, fs=SR, output="sos"), (buf ** 2).mean(axis=1)).clip(1e-9))
    lim = 0.25
    ganho = np.where(env > lim, (lim / env) ** 0.4, 1.0)
    buf *= ganho[:, None]
    buf = np.tanh(buf * 1.2) / np.tanh(1.2)
    rms = np.sqrt((buf ** 2).mean())
    buf *= min(0.95 / (np.max(np.abs(buf)) + 1e-9), 0.16 / (rms + 1e-9))
    wavfile.write(saida, SR, (buf * 32767).astype(np.int16))


def montar(roteiro, ag, pasta, pasta_video):
    pasta = Path(pasta)
    if pasta.exists():
        shutil.rmtree(pasta)
    (pasta / "assets").mkdir(parents=True)
    for arq in ("gsap.min.js", "MotionPathPlugin.min.js", "DrawSVGPlugin.min.js", "MorphSVGPlugin.min.js"):
        shutil.copy(NODE / "gsap" / "dist" / arq, pasta / "assets" / arq)
    shutil.copy(NODE / "three" / "build" / "three.min.js", pasta / "assets" / "three.min.js")
    shutil.copy(NODE / "lottie-web" / "build" / "player" / "lottie_svg.min.js", pasta / "assets" / "lottie.min.js")
    # animações Lottie do vídeo (videos/<tema>/lottie/*.json) embutidas na página
    lot = {f.stem: json.loads(f.read_text()) for f in sorted((Path(pasta_video) / "lottie").glob("*.json")) if f.name != "creditos.json"}
    (pasta / "assets" / "lottie_dados.js").write_text("window.LOTTIE = " + json.dumps(lot, separators=(",", ":")) + ";\n")
    for arq in (IDENTIDADE / "fontes").glob("*.woff2"):
        shutil.copy(arq, pasta / "assets" / arq.name)
    for arq in (IDENTIDADE / "marca.css", IDENTIDADE / "identidade.js", AQUI / "nucleo.js", AQUI / "biblioteca.js", AQUI / "efeitos.js", AQUI / "tres.js", AQUI / "lottie.js", AQUI / "motion-director.js", AQUI / "pontos.js", AQUI / "pontos-gpu.js", AQUI / "icones.js", AQUI / "formas.js", AQUI / "fisica.js", AQUI / "montagem.js"):
        shutil.copy(arq, pasta / "assets" / arq.name)
    shutil.copy(Path(pasta_video) / "cenas.js", pasta / "assets" / "cenas.js")
    # bibliotecas só deste vídeo (videos/<tema>/libs/*.js, ex.: p5.brush), carregadas antes do cenas.js
    libs = sorted((Path(pasta_video) / "libs").glob("*.js"))
    for arq in libs:
        shutil.copy(arq, pasta / "assets" / arq.name)
    dados = {"titulo": roteiro["titulo"], "gancho": roteiro["gancho"], "gancho_destaque": roteiro.get("gancho_destaque", ""), "agenda": ag}
    html = (AQUI / "template.html").read_text()
    html = html.replace("/*__DADOS__*/null", json.dumps(dados, ensure_ascii=False)).replace("__TOTAL__", str(ag["total"]))
    html = html.replace("/*__MARCA__*/null", json.dumps(MARCA, ensure_ascii=False))
    html = html.replace("<!--__LIBS__-->", "\n    ".join(f'<script src="assets/{a.name}"></script>' for a in libs))
    (pasta / "index.html").write_text(html)
    (pasta / "hyperframes.json").write_text(json.dumps({"paths": {"assets": "assets"}}))
    (pasta / "meta.json").write_text(json.dumps({"id": roteiro["slug"], "name": roteiro["titulo"]}))


VERIFICA_JS = """
import { chromium } from "%s";
const [pagina, passo] = process.argv.slice(2), erros = [];
const nav = await chromium.launch(), pg = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
pg.on("pageerror", (e) => erros.push("carregando: " + e.message));
await pg.goto(pagina); await new Promise((r) => setTimeout(r, 1500));
if (!erros.length) erros.push(...await pg.evaluate((dt) => { const tl = window.__timelines.main, T = tl.duration(), e = [];
  for (let t = 0; t < T; t += dt) { try { tl.seek(t); } catch (x) { e.push(t.toFixed(2) + " s: " + x.message); } } tl.seek(0); return e.slice(0, 10); }, Number(passo)));
await nav.close(); console.log(JSON.stringify(erros));
"""


def verificar(pasta, passo=0.25):
    """Abre a página do vídeo e percorre a timeline inteira (a cada `passo` s) procurando erros
    de JavaScript. Um erro trava o quadro (cena vazia, legendas encavaladas); um nome global
    repetido entre o cenas.js e o motor (ex.: const BR) apaga o vídeo inteiro."""
    pagina = (Path(pasta) / "index.html").resolve().as_uri()
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        sync_playwright = None
    if sync_playwright:
        shell = os.environ.get("PRODUCER_HEADLESS_SHELL_PATH") or (sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/*/headless_shell")) or [None])[-1]
        erros = []
        with sync_playwright() as p:
            nav = p.chromium.launch(**({"executable_path": shell} if shell else {}))
            pg = nav.new_page(viewport={"width": 1080, "height": 1920})
            pg.on("pageerror", lambda e: erros.append(f"carregando: {e}"))
            pg.goto(pagina)
            pg.wait_for_timeout(1500)
            erros += pg.evaluate("""(dt) => { const tl = window.__timelines.main, T = tl.duration(), e = [];
              for (let t = 0; t < T; t += dt) { try { tl.seek(t); } catch (x) { e.push(t.toFixed(2) + " s: " + x.message); } }
              tl.seek(0); return e.slice(0, 10); }""", passo)
            nav.close()
    else:
        # sem o playwright do Python: usa o do Node (instalação global)
        mod = next(iter(sorted(glob.glob("/opt/node*/lib/node_modules/playwright/index.mjs")) + sorted(glob.glob("/usr/lib/node_modules/playwright/index.mjs"))), None)
        if not mod:
            print("   [verificar] playwright ausente; pulando a verificação")
            return
        script = Path(pasta) / "_verifica.mjs"
        script.write_text(VERIFICA_JS % mod)
        r = subprocess.run(["node", str(script), pagina, str(passo)], capture_output=True, text=True, timeout=900)
        script.unlink(missing_ok=True)
        try:
            erros = json.loads(r.stdout.strip().splitlines()[-1])
        except (ValueError, IndexError):
            print("   [verificar] não consegui verificar:", (r.stderr or r.stdout)[-300:])
            return
    if erros:
        raise SystemExit("erros de JavaScript no vídeo:\n  " + "\n  ".join(erros))
    print("   [verificar] timeline sem erros")


CAPA_JS = """
import { chromium } from "__MOD__";
const [pagina, saida, dados] = process.argv.slice(2), D = JSON.parse(dados);
const nav = await chromium.launch(__OPCOES__), pg = await nav.newPage({ viewport: { width: 1080, height: 1920 } });
await pg.goto(pagina); await new Promise((r) => setTimeout(r, 1500));
await pg.evaluate(async (D) => {
  await document.fonts.ready; window.__timelines.main.seek(D.t);
  for (const s of ["#leg", "#capitulo", "#gancho", "#progresso", ".pt-palco", ".fim"]) document.querySelectorAll(s).forEach((e) => { e.style.visibility = "hidden"; });
  const c = document.createElement("div"); c.id = "capa";
  c.innerHTML = `<div class="fundo"></div><div class="txt">${D.linhas.map((l) => `<div>${l.map(([w, d]) => `<span class="${d ? "d" : ""}">${w}</span>`).join(" ")}</div>`).join("")}</div>`;
  const st = document.createElement("style");
  st.textContent = `#capa { position: absolute; inset: 0; z-index: 50; font-family: "Nunito", sans-serif; }
    #capa .fundo { position: absolute; inset: 0; background: radial-gradient(95% 26% at 50% 61%, rgba(4,8,26,0.8), rgba(4,8,26,0.25) 70%, rgba(4,8,26,0) 100%); }
    #capa .txt { position: absolute; left: 50px; right: 50px; top: ${D.y}px; transform: translateY(-50%); text-align: center; font-weight: 900; font-size: ${D.tam}px; line-height: 1.02; text-transform: uppercase; color: #fff;
      text-shadow: 0 10px 40px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.6); letter-spacing: -0.01em; }
    #capa .txt span { display: inline-block; } #capa .txt .d { color: #ffd23f; text-shadow: 0 0 40px rgba(255,190,60,0.75), 0 10px 40px rgba(0,0,0,0.7); }`;
  document.head.appendChild(st); document.querySelector("#root").appendChild(c);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}, D);
await pg.screenshot({ path: saida }); await nav.close(); console.log("ok");
"""


def capa(roteiro, ag, pasta, destino):
    """Capa do vídeo (para escolher como capa no TikTok/Reels): o quadro mais bonito da abertura,
    sem legendas, com o gancho em letras grandes no centro (área que aparece na grade do perfil).
    roteiro: "capa": {"t": instante, "texto": "OUTRO TEXTO", "destaque": "PALAVRA"} (opcional)."""
    cfg = roteiro.get("capa", {})
    c0 = ag["cenas"][0]
    t = cfg.get("t") or (min(c0["batidas"].values()) + 0.5 if c0["batidas"] else c0["ini"] + 2.0)
    texto, dest = cfg.get("texto") or roteiro["gancho"], (cfg.get("destaque") or roteiro.get("gancho_destaque", "")).upper()
    pal = [(w, bool(dest) and dest in w.upper()) for w in texto.split()]
    # quebra em linhas de até ~12 caracteres
    linhas, atual = [], []
    for w in pal:
        if atual and len(" ".join(x for x, _ in atual + [w])) > 12:
            linhas.append(atual); atual = []
        atual.append(w)
    linhas.append(atual)
    tam = 150 if len(linhas) <= 3 else 124
    mod = next(iter(sorted(glob.glob("/opt/node*/lib/node_modules/playwright/index.mjs")) + sorted(glob.glob("/usr/lib/node_modules/playwright/index.mjs"))), None)
    if not mod:
        print("   [capa] playwright ausente; capa não gerada")
        return None
    shell = os.environ.get("PRODUCER_HEADLESS_SHELL_PATH") or (sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/*/headless_shell")) or [None])[-1]
    script = Path(pasta) / "_capa.mjs"
    script.write_text(CAPA_JS.replace("__MOD__", mod).replace("__OPCOES__", json.dumps({"executablePath": shell}) if shell else ""))
    png = Path(pasta) / "capa.png"
    r = subprocess.run(["node", str(script), (Path(pasta) / "index.html").resolve().as_uri(), str(png),
                        json.dumps({"t": t, "linhas": linhas, "tam": tam, "y": cfg.get("y", 1170)})], capture_output=True, text=True, timeout=600)
    script.unlink(missing_ok=True)
    if not png.exists():
        print("   [capa] falhou:", (r.stderr or r.stdout)[-300:])
        return None
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(png), "-q:v", "2", str(destino)], check=True)
    return destino


def renderizar(pasta, saida, qualidade="high"):
    env = dict(os.environ, HYPERFRAMES_SKIP_SKILLS="1", HYPERFRAMES_NO_TELEMETRY="1", DO_NOT_TRACK="1")
    if not env.get("PRODUCER_HEADLESS_SHELL_PATH"):
        achados = sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/*/headless_shell"))
        if achados:
            env["PRODUCER_HEADLESS_SHELL_PATH"] = achados[-1]
    fps = "60" if MARCA["video"].get("desfoque_movimento") else "30"  # 60 fps viram 30 com desfoque de movimento
    cmd = [str(NODE / ".bin" / "hyperframes"), "render", "-o", str(Path(saida).resolve()), "-q", qualidade, "-f", fps]
    # 3D/filtros deixam cada quadro mais lento: usa vários navegadores em paralelo
    # (VIDEO_WORKERS=1 para máquinas com pouca memória)
    workers = os.environ.get("VIDEO_WORKERS", "4")
    if workers != "1":
        cmd += ["-w", workers, "--no-low-memory-mode"]
    subprocess.run(cmd, cwd=pasta, env=env, check=True)


def previa(ag, pasta, destino):
    """Fotos de 3 momentos de cada cena + folha de contato, para revisar sem renderizar."""
    ts = []
    for c in ag["cenas"]:
        ts += [c["voz"] + (c["fim"] - c["voz"]) * f for f in (0.2, 0.55, 0.9)]
    env = dict(os.environ, HYPERFRAMES_SKIP_SKILLS="1", HYPERFRAMES_NO_TELEMETRY="1", DO_NOT_TRACK="1")
    if not env.get("PRODUCER_HEADLESS_SHELL_PATH"):
        achados = sorted(glob.glob("/opt/pw-browsers/chromium_headless_shell-*/*/headless_shell"))
        if achados:
            env["PRODUCER_HEADLESS_SHELL_PATH"] = achados[-1]
    if Path(destino).exists():
        shutil.rmtree(destino)
    subprocess.run([str(NODE / ".bin" / "hyperframes"), "snapshot", str(pasta), "-o", str(destino), "--at", ",".join(f"{t:.2f}" for t in ts),
                    "--no-end", "--describe", "false"], env=env, check=True)


def _acabamento():
    """Filtros do ffmpeg que dão a "cara de cinema" (definidos na identidade):
    desfoque de movimento (média de 2 quadros a 60 fps = obturador de 180°), cor,
    vinheta, leve aberração cromática e granulação de filme."""
    v = MARCA["video"]
    f = ["tmix=frames=2:weights=1 1", "fps=30"] if v.get("desfoque_movimento") else []
    tc = v.get("tratamento_cor")
    if tc:
        f += [f"eq=contrast={tc['contraste']}:saturation={tc['saturacao']}", f"vignette=angle={tc['vinheta']}*PI"]
        if tc.get("aberracao_px"):
            f.append(f"rgbashift=rh=-{tc['aberracao_px']}:bh={tc['aberracao_px']}")
        if tc.get("grao"):
            f.append(f"noise=alls={tc['grao']}:allf=t")
    return ",".join(f) or "null"


def metadados(roteiro):
    """Título, descrição e tags gravados no MP4 (roteiro: "titulo", "descricao", "hashtags").
    Não aumentam o alcance (as redes recodificam o vídeo), mas deixam o arquivo organizado."""
    desc = roteiro.get("descricao", "")
    tags = " ".join(roteiro.get("hashtags", []))
    campos = {"title": roteiro["titulo"], "artist": MARCA["nome"], "album_artist": MARCA["nome"],
              "comment": "\n\n".join(x for x in (desc, tags) if x), "description": desc,
              "keywords": tags, "genre": "Educação", "copyright": MARCA["nome"]}
    out = []
    for k, v in campos.items():
        if v:
            out += ["-metadata", f"{k}={v}"]
    return out


def gravar_metadados(roteiro, mp4):
    """Regrava só os metadados de um MP4 pronto (sem recodificar)."""
    tmp = Path(mp4).with_suffix(".meta.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mp4), "-map", "0", "-c", "copy", "-map_metadata", "-1",
                    *metadados(roteiro), "-movflags", "+faststart+use_metadata_tags", str(tmp)], check=True)
    tmp.replace(mp4)


def _duracao(arq):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(arq)], capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


def _filtro_video(mudo, i_quadro):
    """Acabamento + final que emenda no quadro 0 (entrada i_quadro = foto do quadro 0)."""
    if not LOOP_FINAL:
        return ["-filter_complex", f"[0:v]{_acabamento()}[v]"]
    dm = _duracao(mudo)
    fc = (f"[{i_quadro}:v]fps=60,format=yuv420p,setsar=1[q];[0:v]fps=60,format=yuv420p,setsar=1[m];"
          f"[m][q]xfade=transition=fade:duration={LOOP_FINAL}:offset={max(0.1, dm - LOOP_FINAL):.3f},{_acabamento()}[v]")
    return ["-filter_complex", fc]


def codificar(mudo, wav, mp4, dur, meta=()):
    """MP4 final: CRF 24; se passar do limite de envio (marca.json), refaz em 2 passadas
    com a taxa de bits calculada para caber (~92% do limite). Os últimos LOOP_FINAL s se fundem
    com o quadro 0 (o vídeo emenda no começo quando a rede repete) e o som some junto."""
    limite = MARCA["video"]["tamanho_maximo_mb"] * 1024 * 1024
    quadro0 = Path(mudo).with_name("quadro0.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mudo), "-frames:v", "1", str(quadro0)], check=True)
    q = ["-loop", "1", "-framerate", "60", "-t", f"{LOOP_FINAL + 0.3:.2f}", "-i", str(quadro0)]
    af = ["-af", f"afade=t=out:st={max(0, dur - LOOP_FINAL):.3f}:d={LOOP_FINAL}"] if LOOP_FINAL else []
    comum = ["-pix_fmt", "yuv420p", "-movflags", "+faststart+use_metadata_tags", *meta, "-c:a", "aac", "-b:a", "160k", *af, "-shortest"]
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mudo), "-i", str(wav), *q, *_filtro_video(mudo, 2), "-map", "[v]", "-map", "1:a",
                    "-c:v", "libx264", "-preset", "slow", "-crf", "24", *comum, str(mp4)], check=True)
    if Path(mp4).stat().st_size <= limite * 0.95:
        return
    kbps = int(limite * 0.92 * 8 / 1024 / dur - 170)
    print(f"   arquivo acima do limite; recodificando a {kbps} kb/s")
    log = Path(mudo).with_suffix(".2pass")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mudo), *q, *_filtro_video(mudo, 1), "-map", "[v]", "-c:v", "libx264", "-preset", "slow",
                    "-b:v", f"{kbps}k", "-passlogfile", str(log), "-pass", "1", "-an", "-f", "mp4", "/dev/null"], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(mudo), "-i", str(wav), *q, *_filtro_video(mudo, 2), "-map", "[v]", "-map", "1:a", "-c:v", "libx264", "-preset", "slow",
                    "-b:v", f"{kbps}k", "-passlogfile", str(log), "-pass", "2", *comum, str(mp4)], check=True)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("video", help="pasta do vídeo (aprendendo/videos/<tema>) ou o roteiro.json dela")
    ap.add_argument("--qualidade", default="high", choices=["draft", "standard", "high"])
    ap.add_argument("--so-montar", action="store_true", help="monta o projeto sem renderizar")
    ap.add_argument("--previa", action="store_true", help="só tira fotos de cada cena (output/<tema>/previa)")
    ap.add_argument("--metadados", action="store_true", help="só regrava título/descrição/hashtags no MP4 já pronto")
    ap.add_argument("--capa", action="store_true", help="só gera a capa (output/<tema>/capa.jpg) a partir do projeto montado")
    a = ap.parse_args()
    pasta_video = Path(a.video)
    if pasta_video.is_file():
        pasta_video = pasta_video.parent
    roteiro = json.loads((pasta_video / "roteiro.json").read_text())
    if a.metadados:
        mp4 = RAIZ / "output" / pasta_video.name / f"{roteiro['slug']}.mp4"
        gravar_metadados(roteiro, mp4)
        print("metadados gravados:", mp4)
        return
    falas = narrar(roteiro)
    print("narração:", {f["provedor"] for f in falas}, "| duração das falas:", round(sum(f["dur"] for f in falas), 1), "s")
    faltou = [c["id"] for c, f in zip(roteiro["cenas"], falas) if f["provedor"] != MARCA["voz"]["provedor"]]
    if faltou and not a.so_montar:
        raise SystemExit(f"narração sem a voz da marca nas cenas {faltou}: rode de novo (a falha não fica em cache) ou avise o dono")
    ag = agenda(roteiro, falas)
    print("vídeo:", ag["total"], "s")
    saida = RAIZ / "output" / pasta_video.name
    saida.mkdir(parents=True, exist_ok=True)
    pasta = saida / "build"
    montar(roteiro, ag, pasta, pasta_video)
    if a.capa:
        print("capa:", capa(roteiro, ag, pasta, saida / "capa.jpg"))
        return
    verificar(pasta, 2.0 if a.so_montar else 0.25)
    if a.previa:
        previa(ag, pasta, saida / "previa")
        return
    if a.so_montar:
        return
    mudo = pasta / "video_mudo.mp4"
    renderizar(pasta, mudo, qualidade=a.qualidade)
    mixar(ag, falas, pasta / "trilha.wav", roteiro.get("sons"))
    mp4 = saida / f"{roteiro['slug']}.mp4"
    codificar(mudo, pasta / "trilha.wav", mp4, ag["total"], metadados(roteiro))
    print("capa:", capa(roteiro, ag, pasta, saida / "capa.jpg"))
    print("pronto:", mp4)


if __name__ == "__main__":
    main()
