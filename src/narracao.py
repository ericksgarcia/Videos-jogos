"""Roteiro da narração em português, gerado por regras (sem tokens).

A base é o comentário da Opta que o Sofascore entrega em inglês, num formato
fixo ("Hulk (Fluminense) right footed shot from very close range to the
bottom right corner. Assisted by Lucho Acosta with a through ball."). Cada
pedaço é traduzido para o jeito de narrar no Brasil.

Cada fala marca uma palavra-clímax (ex.: "Gol"), que a animação usa para
fazer a bola entrar na rede no mesmo instante em que o narrador fala.
"""
import re

PARTE = [
    (r"right footed shot", "bateu de direita"),
    (r"left footed shot", "bateu de esquerda"),
    (r"header", "cabeceou"),
    (r"shot", "finalizou"),
]
ORIGEM = [
    (r"from very close range", "de muito perto"),
    (r"from the centre of the six yard box", "de dentro da pequena área"),
    (r"from the left side of the six yard box", "da pequena área, pela esquerda"),
    (r"from the right side of the six yard box", "da pequena área, pela direita"),
    (r"from the centre of the box", "do meio da área"),
    (r"from the left side of the box", "do lado esquerdo da área"),
    (r"from the right side of the box", "do lado direito da área"),
    (r"from a difficult angle on the left", "de ângulo difícil, pela esquerda"),
    (r"from a difficult angle on the right", "de ângulo difícil, pela direita"),
    (r"from outside the box", "de fora da área"),
    (r"from long range", "de longe"),
    (r"from more than 35 yards", "de muito longe"),
]
DESTINO = [
    (r"bottom left corner", "no canto esquerdo"),
    (r"bottom right corner", "no canto direito"),
    (r"top left corner", "no ângulo esquerdo"),
    (r"top right corner", "no ângulo direito"),
    (r"high centre of the goal", "no alto, no meio do gol"),
    (r"centre of the goal", "no meio do gol"),
]
ERRO = [
    (r"is close, but misses to the left", "e a bola passou raspando, à esquerda"),
    (r"is close, but misses to the right", "e a bola passou raspando, à direita"),
    (r"is just a bit too high", "e a bola passou raspando o travessão"),
    (r"is high and wide to the left", "e mandou por cima, à esquerda"),
    (r"is high and wide to the right", "e mandou por cima, à direita"),
    (r"is too high", "e mandou por cima do gol"),
    (r"misses to the left", "e mandou à esquerda do gol"),
    (r"misses to the right", "e mandou à direita do gol"),
]
MOTIVO = [
    (r"for a bad foul", "por falta dura"),
    (r"for hand ?ball", "por toque de mão"),
    (r"for dissent|for arguing", "por reclamação"),
    (r"for time wasting", "por retardar o jogo"),
    (r"for unsporting behaviour", "por conduta antidesportiva"),
    (r"for violent conduct", "por conduta violenta"),
    (r"for a dangerous tackle", "por entrada perigosa"),
]


def _busca(tabela, texto, padrao=""):
    for rx, pt in tabela:
        if texto and re.search(rx, texto, re.I):
            return pt
    return padrao


def _assist(texto):
    """(nome, jeito) do 'Assisted by X with a cross' etc."""
    m = re.search(r"Assisted by ([^.]+?)(?: with (a cross|a through ball|a headed pass))?(?: following (a fast break|a corner|a set piece situation))?\.", texto or "")
    if not m:
        return None, None
    return m.group(1), m.group(3) if m.group(3) in ("a fast break", "a corner") else (m.group(2) or m.group(3))


def minuto_falado(minuto, acrescimo):
    if minuto <= 45:
        n = minuto + (acrescimo or 0)
        return f"Aos {n} do primeiro tempo" if acrescimo else f"Aos {n} minutos"
    n = minuto - 45 + (acrescimo or 0)
    if n == 1:
        return "No primeiro minuto do segundo tempo"
    return f"Aos {n} do segundo tempo"


def _minusc(s):
    return s[0].lower() + s[1:] if s.startswith(("No ", "Na ")) else s


def _no_estadio(nome):
    return ("na " if "arena" in nome.lower() else "no ") + nome


def _do(time):
    return f"d{time['artigo']} {time['falado']}"


def _placar_falado(jogo, d, historico):
    """Frase de contexto do placar depois do gol."""
    h, a = d["placar"]
    marcou = jogo[d["time"]]
    lado = 0 if d["time"] == "casa" else 1
    meu, outro = (h, a) if lado == 0 else (a, h)
    esteve_atras = any((p[lado] < p[1 - lado]) for p in historico)
    if h + a == 1:
        return f"{marcou['artigo'].upper()} {marcou['falado']} abre o placar."
    if meu == outro:
        return f"Tudo igual: {h} a {a}."
    if meu == outro + 1 and esteve_atras:
        return f"É a virada d{marcou['artigo']} {marcou['falado']}: {h} a {a}!"
    if meu == outro + 1:
        return f"{marcou['artigo'].upper()} {marcou['falado']} volta à frente: {h} a {a}."
    if meu > outro:
        return f"{marcou['artigo'].upper()} {marcou['falado']} amplia: {h} a {a}."
    return f"{marcou['artigo'].upper()} {marcou['falado']} diminui: {h} a {a}."


def _jogada(texto, jogador):
    """'X enfiou para Y, que bateu de direita, de muito perto, no canto direito'."""
    parte = _busca(PARTE, texto, "finalizou")
    origem = _busca(ORIGEM, texto)
    autor, jeito = _assist(texto)
    if autor and jeito == "a through ball":
        abre = f"{autor} enfiou para {jogador}, que {parte}"
    elif autor and jeito == "a cross":
        abre = f"{autor} cruzou e {jogador} {parte}"
    elif autor and jeito == "a corner":
        abre = f"Na cobrança de escanteio, {autor} achou {jogador}, que {parte}"
    elif autor and jeito == "a fast break":
        abre = f"No contra-ataque, {autor} serviu {jogador}, que {parte}"
    elif autor and jeito == "a headed pass":
        abre = f"{autor} ajeitou de cabeça e {jogador} {parte}"
    elif autor:
        abre = f"{autor} tocou para {jogador}, que {parte}"
    else:
        abre = f"{jogador} {parte}"
    return abre + (f", {origem}" if origem else "")


def fala_destaque(jogo, d, historico):
    """Devolve (texto, palavra_climax)."""
    tx = d.get("comentario") or ""
    t = jogo[d["time"]]
    quando = minuto_falado(d["minuto"], d["acrescimo"])
    j = d.get("jogador") or "o jogador"
    if d["tipo"] == "gol":
        ctx = _placar_falado(jogo, d, historico)
        if d.get("detalhe") == "contra":
            return f"{quando}, a bola sobra para {j}, que desvia contra o próprio gol. Gol {_do(t)}! {ctx}", "Gol"
        destino = _busca(DESTINO, tx)
        if d.get("detalhe") == "de pênalti":
            return f"{quando}, pênalti para {t['artigo']} {t['falado']}. {j} cobra {destino or 'com força'}. Gol! {ctx}", "Gol!"
        var = " Com confirmação do VAR." if d.get("detalhe") == "validado pelo VAR" else ""
        jogada = _minusc(_jogada(tx, j) if tx else f"{j} finalizou")
        return f"{quando}, {jogada}{', ' + destino if destino else ''}. Gol {_do(t)}!{var} {ctx}", "Gol"
    if d["tipo"] == "chance":
        jogada = _jogada(tx, j) if tx else f"{j} finalizou"
        if "post" in (d["lance"] or {}).get("resultado", "") or re.search(r"hits the (left |right )?(post|bar)", tx):
            onde = "o travessão" if "bar" in tx else "a trave"
            fim, clima = f"e a bola explode n{onde[0]} {onde[2:]}!", "explode"
        elif (d["lance"] or {}).get("resultado") == "save" or "saved" in tx:
            fim, clima = f"mas {d.get('goleiro') or 'o goleiro'} faz grande defesa!", "defesa!"
        else:
            fim = _busca(ERRO, tx, "e mandou para fora") + "."
            clima = fim.split()[1]
        return f"{quando}, quase gol {_do(t)}! {jogada}, {fim}", clima
    if d["tipo"] == "amarelo":
        motivo = _busca(MOTIVO, tx)
        return f"{quando}, cartão amarelo para {j}, {_do(t)}{', ' + motivo if motivo else ''}.", "amarelo"
    if d["tipo"] == "vermelho":
        n = 11 - d.get("_vermelhos_time", 1)
        if d.get("detalhe") == "segundo amarelo":
            return f"{quando}, {j} leva o segundo amarelo e está expulso! {t['artigo'].upper()} {t['falado']} fica com {n}.", "expulso!"
        return f"{quando}, vermelho direto para {j}! {t['artigo'].upper()} {t['falado']} fica com {n}.", "vermelho"
    if d["tipo"] == "penalti_perdido":
        res = (d["lance"] or {}).get("resultado")
        fim = f"e {d.get('goleiro') or 'o goleiro'} defende!" if res == "save" else ("e acerta a trave!" if res == "post" else "e manda para fora!")
        clima = fim.split()[1]
        return f"{quando}, pênalti para {t['artigo']} {t['falado']}! {j} bate {fim}", clima
    if d["tipo"] == "anulado":
        return f"{quando}, {t['artigo']} {t['falado']} chegou a marcar, mas o VAR anulou o gol.", "anulou"
    return f"{quando}, {j}.", j.split()[0]


def falas(dados):
    """Todas as falas do vídeo: gancho, intro, uma por destaque e fim."""
    j = dados["jogo"]
    casa, fora = j["casa"], j["fora"]
    titulo = dados["gancho"]["titulo"].capitalize()
    out = {
        "gancho": (f"{titulo}! {casa['falado']} e {fora['falado']}, lance a lance.", None),
        "intro": (f"Rodada {j['rodada']} do Brasileirão{', ' + _no_estadio(j['estadio']) if j.get('estadio') else ''}. Bola rolando!", "rolando!"),
    }
    historico = []
    vermelhos = {"casa": 0, "fora": 0}
    lances = []
    for d in dados["destaques"]:
        if d["tipo"] == "vermelho":
            vermelhos[d["time"]] += 1
            d = dict(d, _vermelhos_time=vermelhos[d["time"]])
        lances.append(fala_destaque(j, d, historico))
        if d["tipo"] == "gol":
            historico.append(d["placar"])
    out["lances"] = lances
    h, a = j["placar"]
    out["fim"] = (f"Fim de jogo: {casa['falado']} {h}, {fora['falado']} {a}.", None)
    return out


PARTE_CHIP = {"right-foot": "Pé direito", "left-foot": "Pé esquerdo", "head": "De cabeça"}
ORIGEM_CHIP = {"de muito perto": "De muito perto", "do meio da área": "Do meio da área", "de fora da área": "De fora da área"}


def chips(d):
    """Etiquetas curtas que aparecem na tela do lance."""
    tx = d.get("comentario") or ""
    out = []
    if d["tipo"] in ("gol", "chance", "penalti_perdido"):
        parte = PARTE_CHIP.get((d.get("lance") or {}).get("parte"))
        if parte:
            out.append(parte)
        origem = _busca(ORIGEM, tx)
        if origem and d.get("detalhe") != "de pênalti":
            out.append(origem[0].upper() + origem[1:])
        autor, _ = _assist(tx)
        if autor or d.get("assistencia"):
            out.append(f"Assistência: {autor or d['assistencia']}")
        if d.get("detalhe") == "validado pelo VAR":
            out.append("Revisado pelo VAR")
        if d.get("detalhe") == "de pênalti":
            out.append("Pênalti")
    elif d["tipo"] == "amarelo":
        m = _busca(MOTIVO, tx)
        if m:
            out.append(m.replace("por ", "").capitalize())
    elif d["tipo"] == "vermelho":
        out.append("Segundo amarelo" if d.get("detalhe") == "segundo amarelo" else "Vermelho direto")
    elif d["tipo"] == "anulado":
        out.append("Decisão do VAR")
    return out[:3]
