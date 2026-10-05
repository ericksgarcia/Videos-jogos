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
    "normal":    {"gancho": 3.0, "intro": 4.6, "fim": 9.0, "viagem": (5.0, 9.0), "lance_min": 5.2},
    "0x0":       {"gancho": 3.0, "intro": 4.2, "fim": 7.5, "viagem": (3.5, 4.5), "lance_min": 4.8},
    "0x0_curto": {"gancho": 2.8, "intro": 4.0, "fim": 6.5, "viagem": (3.0, 4.0), "lance_min": 4.8},
}
VIAGEM_MIN = 0.7      # trecho mínimo de barra entre dois destaques
MERGULHO = 0.85       # da chegada na barra até a tela do lance
VOZ_ATRASO = 0.55     # a narração começa um pouco depois da tela abrir
RETORNO = 0.35        # da volta à barra até ela andar de novo
PASSE_MIN = 0.4       # duração mínima de cada passe no campinho
CAMERA_3D = 1.1       # movimento de câmera do campo 2D para a visão 3D atrás do chute
VERBOS_CHUTE = ["bateu", "cabeceou", "finalizou", "cobra", "bate", "desvia"]


def posicao(minuto, acrescimo, acr):
    """Posição 0..1 na barra. Cada tempo ocupa 45' + acréscimos."""
    l1, l2 = 45 + acr[0], 45 + acr[1]
    total = l1 + l2
    if minuto <= 45:
        return min(minuto + acrescimo, l1) / total
    return (l1 + min(minuto - 45 + acrescimo, l2)) / total


def _r(x):
    return round(x, 3)


def agenda(dados, vozes):
    """Linha do tempo do vídeo. `vozes` vem de narrar_tudo(): cada fala com
    duração e tempo das palavras; as telas se ajustam ao tamanho da fala."""
    import voz
    t = TEMPOS[dados["formato"]]
    acr = dados["jogo"]["acrescimos"]
    ds = dados["destaques"]
    n = len(ds)
    lo, hi = t["viagem"]
    viagem_total = min(hi, max(lo, 1.2 * n + 2))
    pos = [posicao(d["minuto"], d["acrescimo"], acr) for d in ds]
    gaps = [b - a for a, b in zip([0] + pos, pos + [1])]
    trechos = [max(VIAGEM_MIN, viagem_total * g) for g in gaps]

    gv, iv, fv = vozes["gancho"], vozes["intro"], vozes["fim"]
    gancho = max(t["gancho"], 0.15 + gv["dur"] + 0.45)
    intro = max(t["intro"], 0.5 + iv["dur"] + 0.8)
    inicio = gancho + intro
    cursor = inicio
    paradas = []
    for i, d in enumerate(ds):
        cursor += trechos[i]
        chegada = cursor
        S = chegada + MERGULHO
        fala = vozes["lances"][i]
        voz_ini = S + VOZ_ATRASO
        clima = voz_ini + voz.instante(fala, fala.get("climax"))
        if clima < S + 1.5:  # garante tempo para a jogada desenhar antes da bola entrar
            voz_ini += S + 1.5 - clima
            clima = S + 1.5
        E = max(S + t["lance_min"], voz_ini + fala["dur"] + 0.8)
        # jogada no campinho, sincronizada com a fala:
        #   passes anteriores -> passe decisivo no nome do assistente -> chute no "bateu"
        #   -> câmera vai para 3D -> bola entra no clímax ("Gol")
        verbo = voz.instante_de(fala, VERBOS_CHUTE)
        chute = voz_ini + verbo if verbo is not None else clima - 2.2
        chute = min(max(chute, S + 1.4), clima - 0.9)
        cam = max(0.5, min(CAMERA_3D, (clima - chute) - 0.6))
        voo = chute + cam * 0.55
        passes = (d.get("lance") or {}).get("passes") or []
        assist = fala.get("assist")
        t_assist = voz.instante_de(fala, [assist.split()[0]]) if assist else None
        t_assist = voz_ini + t_assist if t_assist is not None else None
        janela_ini, janela_fim = S + 0.9, chute - 0.05
        cabe = max(0, int((janela_fim - janela_ini) / PASSE_MIN))
        passes_ini = max(0, len(passes) - cabe)
        k = len(passes) - passes_ini
        if k and t_assist and janela_ini + PASSE_MIN * (k - 1) <= t_assist <= janela_fim - PASSE_MIN:
            # último passe sai quando o narrador fala o nome do assistente
            antes = (t_assist - janela_ini) / (k - 1) if k > 1 else 0
            paradas_passes = [_r(janela_ini + j * antes) for j in range(k - 1)] + [_r(t_assist)]
            duracoes = [_r(antes)] * (k - 1) + [_r(janela_fim - t_assist)]
        else:
            passe_dur = (janela_fim - janela_ini) / k if k else 0
            paradas_passes = [_r(janela_ini + j * passe_dur) for j in range(k)]
            duracoes = [_r(passe_dur)] * k
        # cadeia de nomes (lances sem campinho): A aparece no nome do assistente,
        # B no nome de quem finaliza, a bola sai no "bateu" e entra no clímax
        nome = (d.get("jogador") or "").split()
        t_autor = voz.instante_de(fala, [nome[0]]) if nome else None
        tA = t_assist if t_assist else S + 0.9
        tB = voz_ini + t_autor if t_autor is not None else chute - 0.8
        tB = min(max(tB, tA + 0.6), chute - 0.25)
        paradas.append({
            "cadeia_a": _r(tA), "cadeia_b": _r(tB),
            "chute": _r(chute), "camera": _r(cam), "voo": _r(voo),
            "passes_ini": passes_ini, "passes_t": paradas_passes, "passes_dur": duracoes,
            "t": _r(chegada), "pos": pos[i], "viagem": trechos[i],
            "lance": _r(S), "voz": _r(voz_ini), "clima": _r(clima), "fim_lance": _r(E),
            "wipe": _r(E - 0.3), "placar": _r(E + 0.15),
            "legendas": voz.legendas(fala, voz_ini),
        })
        cursor = E + RETORNO
    cursor += trechos[-1]
    fb = cursor
    f0 = fb + 1.2
    total = f0 + max(t["fim"], 0.35 + fv["dur"] + 5.5)
    ag = {
        "gancho": _r(gancho), "intro": _r(intro), "inicio_barra": _r(inicio),
        "fim_barra": _r(fb), "paradas": paradas, "trecho_final": _r(trechos[-1]), "total": _r(total),
        "voz": {"gancho": 0.15, "intro": _r(gancho + 0.5), "fim": _r(f0 + 0.35)},
    }
    ag["m"] = momentos(dados, ag, iv)
    return ag


def momentos(dados, ag, iv):
    """Instantes-chave da animação. O template e a trilha leem daqui,
    então som e imagem ficam sincronizados por construção."""
    import voz
    g, ini, fb = ag["gancho"], ag["inicio_barra"], ag["fim_barra"]
    palavras = dados["gancho"]["titulo"].split()
    p = [_r(0.05 + i * 0.14) for i in range(len(palavras))]
    f0 = _r(fb + 1.2)
    n_stats = sum(1 for k in ("posse", "finalizacoes", "no_gol", "chances_claras")
                  if (dados.get("estatisticas") or {}).get(k))
    rolando = ag["voz"]["intro"] + voz.instante(iv, "rolando!")
    return {
        "palavras": p,
        "sub": _r(p[-1] + 0.25),
        "wipe1": _r(g - 0.3),
        "escudo_casa": _r(g + 0.1),
        "escudo_fora": _r(g + 0.25),
        "vs": _r(g + 0.7),
        "brilho": _r(g + 1.1),
        "info": _r(g + 1.3),
        "rolando": _r(max(g + 1.7, rolando)),
        "wipe2": _r(ini - 0.3),
        "placar_entra": _r(ini - 0.05),
        "apito_final": fb,
        "wipe3": _r(fb + 0.9),
        "fim": f0,
        "fim_placar": _r(f0 + 0.45),
        "fim_stats": [_r(f0 + 1.4 + i * 0.18) for i in range(n_stats)],
        "cta": _r(max(f0 + 3.0, ag["total"] - 3.0)),
    }


def narrar_tudo(dados):
    """Gera (ou lê do cache) todas as falas do vídeo."""
    import narracao
    import voz
    roteiro = narracao.falas(dados)
    out = {}
    for k in ("gancho", "intro", "fim"):
        texto, clima = roteiro[k]
        out[k] = dict(voz.narrar(texto, narracao.para_tts(texto, k, clima)), texto=texto, climax=clima)
    out["lances"] = []
    for d, (texto, clima) in zip(dados["destaques"], roteiro["lances"]):
        assist = narracao._assist(d.get("comentario") or "")[0] or d.get("assistencia")
        tts = narracao.para_tts(texto, d["tipo"], clima)
        out["lances"].append(dict(voz.narrar(texto, tts), texto=texto, climax=clima, assist=assist))
    return out


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


def montar(dados, escudos, pasta, vozes, proximo=None):
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
    import narracao
    for d, fala in zip(dados["destaques"], vozes["lances"]):
        d["chips"] = narracao.chips(d)
        d["cadeia"] = narracao.cadeia(d, fala.get("assist"))
    ag = agenda(dados, vozes)
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
