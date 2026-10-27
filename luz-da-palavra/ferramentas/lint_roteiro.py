#!/usr/bin/env python3
"""Verificador mecânico de um vídeo do Luz da Palavra (roteiro.json + cenas.js). Não julga qualidade: pega o que é objetivo,
para os analistas e o dono gastarem a crítica no que importa.

Uso:  python luz-da-palavra/ferramentas/lint_roteiro.py luz-da-palavra/videos/<tema> [--curto]
Saída: FALHA (corrigir antes de narrar), ALERTA (justificar ou corrigir) e INFO (para o analista ler). Código de saída 1 se houver FALHA.

Verifica: contagem de palavras e duração estimada por cena; frases de abertura; superlativos/clickbait; promessas de bênção; "Será que";
apelo à fé repetido de outros vídeos; frase final fixa; pergunta dos comentários; tts × fala; batidas × fala; sons sem definição
(tocariam "pop" 0,4); descrição, hashtags e comentário fixado; capa; temas/capítulos repetidos; cenas.js (B("x") sem batida,
chave do mapa com pontuação, poucas referências na tela).
"""
import json, re, sys, unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
SEG_POR_PALAVRA = 0.51      # medido: 196 palavras em 100,3 s (voz Gacrux, com pausas por marcação)
ALVO_PALAVRAS = (170, 205)  # ~1:25–1:45
MAX_CENA = 40               # ~20 s


def norm(s):
    s = unicodedata.normalize("NFD", s.lower())
    return "".join(c for c in s if unicodedata.category(c) != "Mn")


def toks(s):
    return [w for w in re.sub(r"<[^>]+>", " ", s).split()]


def carregar(pasta):
    pasta = Path(pasta)
    return json.loads((pasta / "roteiro.json").read_text()), pasta


def outros_videos(pasta_atual):
    for p in sorted((RAIZ / "luz-da-palavra" / "videos").glob("*/roteiro.json")):
        if p.parent.resolve() != Path(pasta_atual).resolve():
            try:
                yield p.parent.name, json.loads(p.read_text())
            except Exception:
                pass


class R:
    def __init__(self):
        self.f, self.a, self.i = [], [], []

    def falha(self, m): self.f.append(m)
    def alerta(self, m): self.a.append(m)
    def info(self, m): self.i.append(m)


HYPE = [
    (r"quase ninguém|ninguém (te )?(conta|sabe|lê|percebe|viu)|poucos sabem|pouca gente sabe|ninguém nunca", "superlativo não verificável ('quase ninguém…'): troque por uma lacuna concreta"),
    (r"muita atenção|você não vai acreditar|inacreditável|chocante|urgente|compartilhe agora|se você não (compartilhar|curtir)", "clickbait/chantagem"),
    (r"vai receber|será abençoad|bênção garantida|garanto|milagre garantido|deus vai te dar|prosperidade", "promessa de bênção/prosperidade"),
    (r"hoje (eu )?vamos falar|vou te explicar|neste vídeo|oi,? pessoal|fala,? galera|bom dia,? pessoal", "abertura proibida (assunto/saudação em vez de dor ou choque)"),
    (r"você sabia", "'você sabia' é abertura batida"),
]


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    ro, pasta = carregar(sys.argv[1])
    curto = "--curto" in sys.argv
    r = R()
    cenas = ro["cenas"]
    v2 = ro.get("estrutura") == "v2"
    ids = [c["id"] for c in cenas]
    # ---- tamanho
    tot = sum(len(toks(c["fala"])) for c in cenas)
    seg = tot * SEG_POR_PALAVRA
    r.info(f"{tot} palavras ≈ {seg:.0f} s ({seg // 60:.0f}:{seg % 60:02.0f}) a {SEG_POR_PALAVRA:.2f} s/palavra (inclui pausas)")
    if tot > ALVO_PALAVRAS[1]:
        r.alerta(f"roteiro longo: {tot} palavras (alvo {ALVO_PALAVRAS[0]}–{ALVO_PALAVRAS[1]}); cada 10 palavras a mais ≈ 5 s")
    if tot < ALVO_PALAVRAS[0] - 20:
        r.alerta(f"roteiro curto: {tot} palavras")
    linhas = []
    for c in cenas:
        n = len(toks(c["fala"]))
        linhas.append(f"  {c['id']:<10} {n:>3} palavras ≈ {n * SEG_POR_PALAVRA:4.1f} s")
        if n > MAX_CENA:
            r.alerta(f"cena '{c['id']}' com {n} palavras (> {MAX_CENA}, ≈ {n * SEG_POR_PALAVRA:.0f} s): quebre ou corte")
    r.info("por cena:\n" + "\n".join(linhas))
    # ---- abertura
    a0 = cenas[0]["fala"]
    primeira = re.split(r"(?<=[.?!])\s", a0.strip())[0]
    r.info(f"1ª frase ({len(toks(primeira))} palavras): {primeira}")
    if len(toks(primeira)) > 12:
        r.alerta("1ª frase com mais de 12 palavras: o choque tem de vir nas primeiras ~8")
    texto_total = " ".join(c["fala"] for c in cenas)
    for padrao, msg in HYPE:
        for c in cenas:
            m = re.search(padrao, norm(c["fala"]))
            if m:
                r.falha(f"cena '{c['id']}': {msg} (“{m.group(0)}”)")
    n_sera = len(re.findall(r"\bserá que\b", norm(texto_total)))
    if n_sera > 1:
        r.alerta(f"'Será que' aparece {n_sera}× (tique): no máximo 1")
    # ---- loop
    ult = cenas[-1]["fala"].strip()
    r.info(f"loop ao repetir o vídeo: «…{ult[-45:]} {primeira}»")
    if not (re.match(r"^Salva", ult) and "segue o Luz da Palavra" in ult and ult.rstrip().endswith("lembra:")):
        r.falha("última cena não segue a frase fixa: 'Salva …, segue o Luz da Palavra, e lembra:'")
    # ---- apelo à fé
    apoio = next((c for c in cenas if c["id"] == "apoio"), None)
    if not apoio:
        r.alerta("sem cena 'apoio' (apelo à fé logo depois da abertura é regra do dono)")
    else:
        idx = [c["id"] for c in cenas].index("apoio")
        if v2:
            if idx < 2:
                r.falha(f"estrutura v2: o apelo à fé vem DEPOIS da 1ª parte (cena 3 ou 4); está na cena {idx + 1}")
            if idx > 3:
                r.alerta(f"estrutura v2: apelo à fé na cena {idx + 1} (esperado ~28–36 s, cena 3–4)")
            r.info("última frase do apelo (deve devolver ao laço aberto): «" + re.split(r"(?<=[.?!])\s", apoio["fala"].strip())[-1] + "»")
        elif idx > 2:
            r.alerta(f"apelo à fé na cena {idx + 1}: a regra v1 é logo depois da abertura")
        n = len(toks(apoio["fala"]))
        if n > (15 if v2 else 22):
            r.alerta(f"apelo à fé com {n} palavras (> {15 if v2 else 22}): é o maior vazamento medido nas simulações; encurte")
        if re.search(r"\bse você (crê|acredita|tem fé)", norm(apoio["fala"])):
            r.alerta("apelo condicional ('se você crê…') sugere que quem não crê não deve curtir")
        a_tok = set(norm(" ".join(toks(apoio["fala"]))).split())
        for slug, o in outros_videos(pasta):
            ap = next((c for c in o["cenas"] if c["id"] == "apoio"), None)
            if ap:
                b_tok = set(norm(" ".join(toks(ap["fala"]))).split())
                j = len(a_tok & b_tok) / max(1, len(a_tok | b_tok))
                ini_igual = norm(" ".join(toks(apoio["fala"])[:3])) == norm(" ".join(toks(ap["fala"])[:3]))
                if j > 0.45 or ini_igual:
                    r.alerta(f"apelo parecido com o de '{slug}' (semelhança {j:.2f}{', mesmo começo' if ini_igual else ''}): varie o molde")
    # ---- aposta (estrutura v2)
    if v2:
        ap = next((c for c in cenas if c["id"] == "aposta"), None)
        if not ap:
            r.falha("estrutura v2: sem cena 'aposta' (palpite no meio, pago em até ~15 s)")
        else:
            ia = ids.index("aposta")
            if "apoio" in ids and ia < ids.index("apoio"):
                r.falha("a 'aposta' vem antes do apelo à fé; a ordem v2 é parte1 → apoio → parte2 → aposta")
            if "pergunta" in ids and ia > ids.index("pergunta") - 1:
                r.falha("a aposta tem de vir antes da cena anterior à pergunta final (precisa de ao menos 1 cena para ser PAGA)")
            ta = norm(ap["fala"])
            if not re.search(r"\b(escreve|responde|chuta|aposta)\b", ta):
                r.alerta("aposta sem instrução de resposta (ex.: 'Escreve a letra')")
            if not re.search(r"\b(a|b)\b.*\b(b|c)\b|\b(1|2|3|um|dois|tres)\b", ta):
                r.alerta("aposta sem opções claras (A/B ou números)")
            if len(toks(ap["fala"])) > 25:
                r.alerta(f"aposta com {len(toks(ap['fala']))} palavras (> 25): o pedido é curto")
            nxt = cenas[ia + 1]["fala"] if ia + 1 < len(cenas) else ""
            r.info(f"cena que PAGA a aposta ({cenas[ia + 1]['id'] if ia + 1 < len(cenas) else '-'}) começa com: «{' '.join(toks(nxt)[:14])}…» (confira que responde em ≤ ~15 s)")
            if re.search(r"\b(morre|morrer|morreu|vai viver|sobrevive)\b", ta):
                r.alerta("aposta sobre vida/morte de alguém: nunca apostar sobre sofrimento")
    # ---- pergunta
    perg = next((c for c in cenas if c["id"] == "pergunta"), None)
    if not perg:
        r.falha("sem cena 'pergunta' (1 pergunta para os comentários, regra do dono)")
    else:
        t = norm(perg["fala"])
        if "direita" not in t:
            r.falha("pergunta não aponta para a direita (botão de comentários)")
        if "comentario" not in t:
            r.alerta("pergunta não diz 'nos comentários'")
        if "?" not in perg["fala"]:
            r.alerta("pergunta sem '?'")
        if not re.search(r"\b(so|apenas|escreve|responde|chuta|uma palavra|a letra|o numero)\b", t):
            r.alerta("pergunta sem instrução de resposta curta (letra/número/palavra)")
        if v2 and re.search(r"\ba\b.*\bb\b", t):
            r.alerta("v2: a pergunta final deve ser de EXPERIÊNCIA em 1 frase; o A/B é da aposta do meio")
        if re.search(r"\b(sim ou nao)\b", t):
            r.alerta("'sim ou não' gera comentário de 1 palavra sem conversa; prefira A/B com razão para cada lado")
    # ---- tts
    for c in cenas:
        t = c.get("tts")
        if not t:
            continue
        if toks(t) != toks(c["fala"]):
            r.falha(f"cena '{c['id']}': palavras do tts diferem da fala (o alinhamento quebra)")
        for tag in re.findall(r"<[^>]*>", t):
            if tag not in ("<short pause>", "<long pause>", "<sigh>", "<laugh>", "<chuckle>", "<gasp>"):
                r.falha(f"cena '{c['id']}': marcação desconhecida {tag}")
        ntag = len(re.findall(r"<[^>]*>", t))
        if ntag > 0.3 * max(1, len(toks(c["fala"]))):
            r.alerta(f"cena '{c['id']}': {ntag} pausas em {len(toks(c['fala']))} palavras (voz picotada)")
    # ---- batidas e sons
    sons = ro.get("sons", {})
    for c in cenas:
        palavras = toks(c["fala"])
        pos = 0
        for chave in c.get("batidas", {}):
            try:
                pos = palavras.index(chave, pos) + 1
            except ValueError:
                r.falha(f"cena '{c['id']}': batida '{chave}' não está na fala (ou fora de ordem)")
        for ev in c.get("batidas", {}).values():
            if ev not in sons:
                r.alerta(f"evento '{ev}' sem som definido em 'sons': toca 'pop' 0,4 (alto)")
    # ---- descrição, hashtags, fixado
    d = ro.get("descricao", "")
    l1 = d.split("\n")[0]
    if len(l1) > 70:
        r.alerta(f"1ª linha da descrição com {len(l1)} caracteres (> ~70, o que aparece antes do 'mais')")
    if norm(l1) in norm(ro.get("titulo", "")) or norm(ro.get("titulo", "")) in norm(l1):
        r.alerta("1ª linha da descrição repete o título")
    hs = ro.get("hashtags", [])
    if not 4 <= len(hs) <= 6:
        r.alerta(f"{len(hs)} hashtags (use 4–6)")
    if any(h.lower() in ("#fyp", "#viral", "#foryou", "#paravoce", "#fy") for h in hs):
        r.falha("hashtag genérica (#fyp/#viral/#foryou)")
    if "#luzdapalavra" not in [h.lower() for h in hs]:
        r.alerta("falta #luzdapalavra")
    if not re.search(r"cf\.|\b\d+:\d+", d):
        r.alerta("descrição sem referência bíblica (ex.: Marcos 5:21–43)")
    if perg and norm(perg["fala"].split("?")[0])[:25] and not any(norm(w) in norm(d) for w in toks(perg["fala"])[1:4]):
        r.alerta("a pergunta dos comentários não aparece na descrição")
    fx = ro.get("comentario_fixado", "")
    if not fx:
        r.alerta("sem comentário para fixar")
    if re.search(r"a resposta é|resposta:|já te conto", norm(fx)):
        r.alerta("comentário fixado promete/entrega resposta (regra: a pergunta é só para o público responder)")
    # ---- gancho e capa
    g = ro.get("gancho", ""); gd = ro.get("gancho_destaque", "")
    if len(toks(g)) > 5:
        r.alerta(f"gancho na tela com {len(toks(g))} palavras (> 5)")
    if gd and norm(gd) not in norm(g):
        r.falha("gancho_destaque não está dentro do gancho")
    cp = ro.get("capa", {})
    if cp.get("texto"):
        ct = set(norm(w) for w in toks(cp["texto"])); a0t = set(norm(w) for w in toks(a0))
        if len(ct & a0t) / max(1, len(ct)) > 0.6:
            r.alerta("texto da capa repete a 1ª fala (a capa deve complementar)")
    # ---- repetição de tema/capítulo
    refs = set(re.findall(r"(?:[1-3] )?[A-ZÁÉÍÓÚ][a-záéíóúâêôãç]+ \d+", d + " " + ro.get("titulo", "")))
    for slug, o in outros_videos(pasta):
        od = o.get("descricao", "") + " " + o.get("titulo", "")
        comuns = refs & set(re.findall(r"(?:[1-3] )?[A-ZÁÉÍÓÚ][a-záéíóúâêôãç]+ \d+", od))
        if comuns:
            r.info(f"mesmo capítulo de '{slug}': {', '.join(sorted(comuns))} (ângulo precisa ser claramente outro)")
        ta, tb = set(norm(o.get("titulo", "")).split()), set(norm(ro.get("titulo", "")).split())
        if len(ta & tb) / max(1, len(ta | tb)) > 0.5:
            r.alerta(f"título muito parecido com o de '{slug}'")
    # ---- cenas.js
    cj = pasta / "cenas.js"
    if not cj.exists():
        r.info("sem cenas.js ainda (verificações de cena puladas)")
    else:
        js = cj.read_text()
        usados = set(re.findall(r'B\("([^"]+)"\)', js))
        todos = {k for c in cenas for k in c.get("batidas", {}).values()}
        for u in sorted(usados - todos):
            r.falha(f'cenas.js usa B("{u}") sem batida com esse nome no roteiro')
        for ch in sorted({m.group(0) for m in re.finditer(r"mapa\[\"([^\"]*[^\wÀ-ÿ\"][^\"]*)\"\]", js)}):
            r.falha(f'cenas.js: chave do mapa com pontuação ({ch}): as chaves são a palavra SEM pontuação (círculo/sublinhado some em silêncio)')
        nref = len(re.findall(r"cf\.|\bMc \d|\bJo \d|\bMt \d|\bLm \d|\bLc \d|\bSl \d|\bGn \d|\bEx \d|\b[1-3]? ?[A-Z][a-z]{1,2} \d+:\d+", js))
        if nref < 3:
            r.alerta(f"poucas referências bíblicas escritas na tela ({nref}) — o analista de fé exige a referência no vídeo")
        r.info(f"cenas.js: {len(usados)} batidas usadas, {nref} referências na tela")
    # ---- saída
    def bloco(tit, xs):
        if xs:
            print(f"\n{tit}")
            for x in xs:
                print(" •", x)
    print(f"== {pasta.name}: {ro.get('titulo','')}")
    bloco("FALHA (corrigir antes de narrar)", r.f)
    bloco("ALERTA (corrigir ou justificar)", r.a)
    if not curto:
        bloco("INFO", r.i)
    print(f"\nresumo: {len(r.f)} falha(s), {len(r.a)} alerta(s)")
    sys.exit(1 if r.f else 0)


if __name__ == "__main__":
    main()
