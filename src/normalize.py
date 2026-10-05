"""Transforma os dados crus do Sofascore no JSON padrão que o template lê.

Regras de negócio do vídeo (sem gastar tokens): ranking dos destaques,
escolha do gancho e classificação dos 0x0.
"""

# Ranking: gol > vermelho > pênalti perdido / gol anulado > chance clara > amarelo
PRIORIDADE = {"gol": 0, "vermelho": 1, "penalti_perdido": 2, "anulado": 2, "chance": 3, "amarelo": 4}
XG_CHANCE_CLARA = 0.30   # finalização sem gol com xG acima disso vira "chance clara"
MAX_DESTAQUES = 7
MIN_DESTAQUES = 5        # completa com amarelos se faltar
MAX_DESTAQUES_0X0 = 4

STATS = {
    "ballPossession": "posse",
    "totalShotsOnGoal": "finalizacoes",
    "shotsOnGoal": "no_gol",
    "expectedGoals": "xg",
    "bigChanceCreated": "chances_claras",
}


def nome_jogador(p):
    if not p:
        return ""
    nome = p.get("name") or p.get("shortName") or ""
    return nome if len(nome) <= 16 else p.get("shortName", nome)


def _lado(is_home):
    return "casa" if is_home else "fora"


def _num(v):
    try:
        return float(str(v).rstrip("%"))
    except ValueError:
        return None


def _time(ev, lado):
    t = ev[lado]
    cores = t.get("teamColors") or {}
    return {
        "id": t["id"],
        "nome": t.get("shortName") or t["name"],
        "sigla": t.get("nameCode", t["name"][:3].upper()),
        "cor": cores.get("primary", "#ffffff"),
        "cor2": cores.get("secondary", "#000000"),
    }


def _destaques_brutos(raw):
    incs = sorted(raw["incidents"]["incidents"], key=lambda i: (i.get("time", 0), i.get("addedTime") or 0))
    out = []
    var_confirmados = []
    for i in incs:
        tipo, classe = i["incidentType"], i.get("incidentClass")
        base = {"minuto": i["time"], "acrescimo": i.get("addedTime") or 0, "time": _lado(i.get("isHome"))}
        if tipo == "goal":
            d = dict(base, tipo="gol", jogador=nome_jogador(i.get("player")), placar=[i["homeScore"], i["awayScore"]])
            if classe == "ownGoal":
                d["detalhe"] = "contra"
            elif classe == "penalty":
                d["detalhe"] = "de pênalti"
            elif i.get("assist1"):
                d["detalhe"] = f"assistência de {nome_jogador(i['assist1'])}"
            out.append(d)
        elif tipo == "card" and classe in ("red", "yellowRed"):
            out.append(dict(base, tipo="vermelho", jogador=nome_jogador(i.get("player")),
                            detalhe="segundo amarelo" if classe == "yellowRed" else "vermelho direto"))
        elif tipo == "card" and classe == "yellow":
            out.append(dict(base, tipo="amarelo", jogador=nome_jogador(i.get("player"))))
        elif tipo == "varDecision" and classe == "goalNotAwarded":
            if i.get("confirmed"):
                out.append(dict(base, tipo="anulado", jogador=nome_jogador(i.get("player")), detalhe="anulado pelo VAR"))
            else:
                var_confirmados.append((i["time"], i.get("isHome")))
    # VAR revisou e manteve o gol: vira detalhe do próprio gol
    for d in out:
        if d["tipo"] == "gol" and (d["minuto"], d["time"] == "casa") in var_confirmados:
            d["detalhe"] = "validado pelo VAR"

    for s in (raw.get("shotmap") or {}).get("shotmap", []):
        if s["shotType"] == "goal":
            continue
        base = {"minuto": s["time"], "acrescimo": s.get("addedTime") or 0, "time": _lado(s["isHome"]),
                "jogador": nome_jogador(s.get("player")), "xg": round(s.get("xg", 0), 2)}
        gk = nome_jogador(s.get("goalkeeper")) if s.get("goalkeeper") else ""
        detalhe = {"save": f"defesa de {gk}" if gk else "defesa do goleiro", "post": "na trave",
                   "miss": "para fora", "block": "bloqueado"}.get(s["shotType"], "")
        if s.get("situation") == "penalty":
            out.append(dict(base, tipo="penalti_perdido", detalhe=detalhe))
        elif s.get("xg", 0) >= XG_CHANCE_CLARA:
            out.append(dict(base, tipo="chance", detalhe=detalhe))
    return out


def _ordem(d):
    return (d["minuto"], d["acrescimo"])


def selecionar(destaques, zero_a_zero):
    obrigatorios = [d for d in destaques if PRIORIDADE[d["tipo"]] <= 2]
    chances = sorted((d for d in destaques if d["tipo"] == "chance"), key=lambda d: -d["xg"])
    amarelos = sorted((d for d in destaques if d["tipo"] == "amarelo"), key=_ordem, reverse=True)
    limite = MAX_DESTAQUES_0X0 if zero_a_zero else MAX_DESTAQUES
    escolha = list(obrigatorios)
    # evita duas chances no mesmo minuto de um destaque já escolhido
    for c in chances:
        if len(escolha) >= limite:
            break
        if not any(abs(c["minuto"] - e["minuto"]) <= 1 and c["time"] == e["time"] for e in escolha):
            escolha.append(c)
    if not zero_a_zero:
        for a in amarelos:
            if len(escolha) >= MIN_DESTAQUES:
                break
            escolha.append(a)
    return sorted(escolha, key=_ordem)


def _gancho(jogo, todos, stats):
    casa, fora = jogo["casa"]["nome"], jogo["fora"]["nome"]
    h, a = jogo["placar"]
    gols = [d for d in todos if d["tipo"] == "gol"]
    sub = f"{casa} x {fora}, lance a lance"
    if h == a == 0:
        n = sum(1 for d in todos if d["tipo"] in ("chance", "penalti_perdido"))
        if n:
            return {"regra": "zero_a_zero", "titulo": "0 A 0, MAS TEVE JOGO", "subtitulo": f"{n} chances claras. Veja quais."}
        return {"regra": "zero_a_zero", "titulo": "0 A 0", "subtitulo": sub}
    # virada: o vencedor esteve perdendo em algum momento
    if h != a:
        venc = 0 if h > a else 1
        if any((g["placar"][venc] < g["placar"][1 - venc]) for g in gols):
            return {"regra": "virada", "titulo": "TEVE VIRADA", "subtitulo": sub}
    # decidido no fim: gol a partir dos 85' que mudou o resultado
    for g in gols:
        if g["minuto"] >= 85:
            antes = list(g["placar"])
            antes[0 if g["time"] == "casa" else 1] -= 1
            def res(p):
                return (p[0] > p[1]) - (p[0] < p[1])
            if res(antes) != res(g["placar"]):
                return {"regra": "decidido_no_fim", "titulo": "DECIDIDO NO FIM", "subtitulo": sub}
    if abs(h - a) >= 3:
        return {"regra": "goleada", "titulo": "GOLEADA", "subtitulo": f"Foram {h + a} gols. {sub}"}
    xg = stats.get("xg")
    if h != a and xg:
        venc = 0 if h > a else 1
        if xg[venc] + 0.5 < xg[1 - venc]:
            return {"regra": "zebra_xg", "titulo": "VENCEU CRIANDO MENOS", "subtitulo": sub}
    artilheiros = {}
    for g in gols:
        if g.get("detalhe") != "contra":
            artilheiros[g["jogador"]] = artilheiros.get(g["jogador"], 0) + 1
    if artilheiros:
        nome, n = max(artilheiros.items(), key=lambda kv: kv[1])
        if n >= 2:
            ext = {2: "DOIS", 3: "TRÊS", 4: "QUATRO"}.get(n, str(n))
            return {"regra": "artilheiro", "titulo": f"{nome.upper()} FEZ {ext}", "subtitulo": sub}
    if any(d["tipo"] == "vermelho" for d in todos):
        return {"regra": "expulsao", "titulo": "TEVE EXPULSÃO", "subtitulo": sub}
    return {"regra": "padrao", "titulo": "COMO FOI O JOGO", "subtitulo": f"{casa} x {fora} em menos de 1 minuto"}


def _stats(raw):
    out = {}
    for per in (raw.get("statistics") or {}).get("statistics", []):
        if per["period"] != "ALL":
            continue
        for gr in per["groups"]:
            for it in gr["statisticsItems"]:
                k = STATS.get(it["key"])
                if k and k not in out:
                    out[k] = [_num(it.get("homeValue", it["home"])), _num(it.get("awayValue", it["away"]))]
    return out


def _acrescimos(raw):
    acr = {45: 0, 90: 0}
    for i in raw["incidents"]["incidents"]:
        if i["incidentType"] == "injuryTime" and i.get("time") in acr:
            acr[i["time"]] = max(acr[i["time"]], i.get("length") or 0)
        elif i.get("time") in acr and i.get("addedTime") and i["addedTime"] < 999:
            acr[i["time"]] = max(acr[i["time"]], i["addedTime"])
    return [acr[45], acr[90]]


def normalizar(raw):
    ev = raw["event"]["event"]
    jogo = {
        "id": ev["id"],
        "campeonato": "Brasileirão",
        "temporada": ev["season"]["year"],
        "rodada": (ev.get("roundInfo") or {}).get("round"),
        "estadio": (ev.get("venue") or {}).get("name") or (ev.get("venue") or {}).get("stadium", {}).get("name", ""),
        "inicio": ev["startTimestamp"],
        "casa": _time(ev, "homeTeam"),
        "fora": _time(ev, "awayTeam"),
        "placar": [ev["homeScore"]["current"], ev["awayScore"]["current"]],
        "acrescimos": _acrescimos(raw),
    }
    todos = _destaques_brutos(raw)
    zero = jogo["placar"] == [0, 0]
    destaques = selecionar(todos, zero)
    stats = _stats(raw)
    pontos = (raw.get("graph") or {}).get("graphPoints", [])
    momentum = [{"minuto": p["minute"], "valor": round(p["value"] / 100, 2)} for p in pontos]

    if zero:
        fortes = sum(1 for d in destaques if d["tipo"] != "amarelo")
        formato = "0x0" if fortes >= 3 else ("0x0_curto" if fortes else "so_resumo")
    else:
        formato = "normal"
    return {
        "jogo": jogo,
        "formato": formato,
        "gancho": _gancho(jogo, todos, stats),
        "destaques": destaques,
        "momentum": momentum,
        "estatisticas": stats,
    }
