"""Monta a composição HyperFrames de um jogo e renderiza o MP4.

O template (template/index.html) é fixo; aqui só calculamos a agenda do vídeo
(quando cada destaque entra) e injetamos o JSON. Nenhum token gasto por vídeo.
"""
import json
import shutil
import subprocess
import os
import glob
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
TEMPLATE = RAIZ / "template" / "index.html"
NODE = RAIZ / "node_modules"

# Durações em segundos, por formato
TEMPOS = {
    "normal":    {"gancho": 3.0, "intro": 5.0, "card": 4.5, "fim": 10.0, "viagem": (7.0, 13.0)},
    "0x0":       {"gancho": 3.0, "intro": 3.2, "card": 3.6, "fim": 7.5, "viagem": (4.0, 5.0)},
    "0x0_curto": {"gancho": 2.6, "intro": 3.0, "card": 3.6, "fim": 6.5, "viagem": (3.0, 4.0)},
}
VIAGEM_MIN = 0.6  # trecho mínimo de barra entre dois destaques


def posicao(minuto, acrescimo, acr):
    """Posição 0..1 na barra. Cada tempo ocupa 45' + acréscimos."""
    l1, l2 = 45 + acr[0], 45 + acr[1]
    total = l1 + l2
    if minuto <= 45:
        return min(minuto + acrescimo, l1) / total
    return (l1 + min(minuto - 45 + acrescimo, l2)) / total


def agenda(dados):
    t = TEMPOS[dados["formato"]]
    acr = dados["jogo"]["acrescimos"]
    ds = dados["destaques"]
    n = len(ds)
    lo, hi = t["viagem"]
    viagem_total = min(hi, max(lo, 1.6 * n + 2))
    pos = [posicao(d["minuto"], d["acrescimo"], acr) for d in ds]
    gaps = [b - a for a, b in zip([0] + pos, pos + [1])]
    trechos = [max(VIAGEM_MIN, viagem_total * g) for g in gaps]
    inicio = t["gancho"] + t["intro"]
    cursor = inicio
    paradas = []
    for i, d in enumerate(ds):
        cursor += trechos[i]
        paradas.append({
            "t": round(cursor, 3), "pos": pos[i], "viagem": trechos[i],
            "placar": round(cursor + 0.55, 3),           # dígito do placar troca
            "saida": round(cursor + t["card"] - 0.4, 3),  # card sai
        })
        cursor += t["card"]
    cursor += trechos[-1]
    ag = {
        "gancho": t["gancho"],
        "intro": t["intro"],
        "card": t["card"],
        "inicio_barra": inicio,
        "fim_barra": round(cursor, 3),
        "paradas": paradas,
        "trecho_final": round(trechos[-1], 3),
        "total": round(cursor + t["fim"], 3),
    }
    ag["m"] = momentos(dados, ag)
    return ag


def momentos(dados, ag):
    """Instantes-chave da animação. O template e a trilha leem daqui,
    então som e imagem ficam sincronizados por construção."""
    g, ini, fb = ag["gancho"], ag["inicio_barra"], ag["fim_barra"]
    palavras = dados["gancho"]["titulo"].split()
    p = [round(0.05 + i * 0.14, 3) for i in range(len(palavras))]
    f0 = round(fb + 1.2, 3)
    n_stats = sum(1 for k in ("posse", "finalizacoes", "no_gol", "xg", "chances_claras")
                  if (dados.get("estatisticas") or {}).get(k))
    return {
        "palavras": p,
        "sub": round(p[-1] + 0.25, 3),
        "wipe1": round(g - 0.3, 3),
        "escudo_casa": round(g + 0.1, 3),
        "escudo_fora": round(g + 0.25, 3),
        "vs": round(g + 0.7, 3),
        "brilho": round(g + 1.1, 3),
        "info": round(g + 1.3, 3),
        "rolando": round(g + max(1.7, ag["intro"] - 1.5), 3),
        "wipe2": round(ini - 0.3, 3),
        "placar_entra": round(ini - 0.05, 3),
        "apito_final": fb,
        "wipe3": round(fb + 0.9, 3),
        "fim": f0,
        "fim_placar": round(f0 + 0.45, 3),
        "fim_stats": [round(f0 + 1.2 + i * 0.18, 3) for i in range(n_stats)],
        "cta": round(max(f0 + 2.6, ag["total"] - 3.0), 3),
    }


def _hex(c):
    c = c.lstrip("#")
    if len(c) == 3:
        c = "".join(x * 2 for x in c)
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def _lum(c):
    def ch(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = (ch(v) for v in _hex(c))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b


def _dist(a, b):
    return sum((x - y) ** 2 for x, y in zip(_hex(a), _hex(b))) ** 0.5


def cores(casa, fora):
    """Cor de destaque de cada time, legível no fundo escuro e distinta da outra."""
    def legivel(t):
        for c in (t["cor"], t["cor2"]):
            if _lum(c) > 0.06:
                return c
        return "#d4d4d8"
    c1, c2 = legivel(casa), legivel(fora)
    if _dist(c1, c2) < 120:
        alt = fora["cor2"] if fora["cor2"] != c2 and _lum(fora["cor2"]) > 0.06 else None
        c2 = alt if alt and _dist(c1, alt) >= 120 else ("#facc15" if _dist(c1, "#facc15") >= 120 else "#38bdf8")
    return c1, c2


def montar(dados, escudos, pasta, proximo=None):
    """Cria a pasta do projeto HyperFrames pronta para renderizar."""
    pasta = Path(pasta)
    if pasta.exists():
        shutil.rmtree(pasta)
    (pasta / "assets").mkdir(parents=True)
    shutil.copy(NODE / "gsap" / "dist" / "gsap.min.js", pasta / "assets" / "gsap.min.js")
    for peso in (500, 700, 800):
        shutil.copy(NODE / "@fontsource" / "barlow-condensed" / "files" / f"barlow-condensed-latin-{peso}-normal.woff2",
                    pasta / "assets" / f"barlow-{peso}.woff2")
    j = dados["jogo"]
    for lado in ("casa", "fora"):
        src = escudos.get(lado)
        if src:
            shutil.copy(src, pasta / "assets" / f"escudo_{lado}.png")
        j[lado]["escudo"] = f"assets/escudo_{lado}.png" if src else None
    j["casa"]["destaque"], j["fora"]["destaque"] = cores(j["casa"], j["fora"])
    ag = agenda(dados)
    payload = dict(dados, agenda=ag, proximo=proximo)
    html = TEMPLATE.read_text()
    html = html.replace("/*__DADOS__*/null", json.dumps(payload, ensure_ascii=False))
    html = html.replace("__TOTAL__", str(ag["total"]))
    (pasta / "index.html").write_text(html)
    (pasta / "hyperframes.json").write_text(json.dumps({"paths": {"assets": "assets"}}))
    (pasta / "meta.json").write_text(json.dumps({"id": f"jogo-{j['id']}", "name": f"{j['casa']['nome']} x {j['fora']['nome']}"}))
    return ag


def _headless_shell():
    if os.environ.get("PRODUCER_HEADLESS_SHELL_PATH"):
        return os.environ["PRODUCER_HEADLESS_SHELL_PATH"]
    achados = glob.glob("/opt/pw-browsers/chromium_headless_shell-*/*/headless_shell")
    return sorted(achados)[-1] if achados else None


def renderizar(pasta, saida, qualidade="high"):
    env = dict(os.environ, HYPERFRAMES_SKIP_SKILLS="1", HYPERFRAMES_NO_TELEMETRY="1", DO_NOT_TRACK="1")
    shell = _headless_shell()
    if shell:
        env["PRODUCER_HEADLESS_SHELL_PATH"] = shell
    cmd = [str(NODE / ".bin" / "hyperframes"), "render", "-o", str(Path(saida).resolve()), "-q", qualidade, "-f", "30"]
    subprocess.run(cmd, cwd=pasta, env=env, check=True)
