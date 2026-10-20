"""Histórico dos ganchos (versionado no git) para não repetir tema dentro da janela de proteção.

Uso (da raiz do repositório):
  python ganchos/historico.py sincronizar [pasta]            # registra no histórico os ganchos que ainda não estão lá
  python ganchos/historico.py verificar "Salmo 27:10" [slug] # diz se o tema já foi usado na janela (default 60 dias)
  python ganchos/historico.py listar                         # tudo o que existe, com a data em que o tema volta a ficar livre
  python ganchos/historico.py publicado <pasta> <id> [AAAA-MM-DD]   # marca a data em que o vídeo foi ao ar (default hoje)

O arquivo `ganchos/historico.json` é a memória: cada tema fica bloqueado por `janela_dias` (60) a partir da data mais
recente entre criação e publicação. Conflito = mesma referência bíblica que se sobrepõe (mesmo livro e capítulo, e
versículos que se cruzam, ou capítulo inteiro) ou mesmo slug. `checar.py` também usa isto e reprova gancho repetido.
Os arquivos de vídeo (output/) não vão para o git; o histórico vai.
"""
import json
import re
import sys
import unicodedata
from datetime import date, timedelta
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ARQ = RAIZ / "ganchos" / "historico.json"


def _sem_acento(t):
    return "".join(c for c in unicodedata.normalize("NFD", t.lower()) if unicodedata.category(c) != "Mn")


def analisar_referencia(ref):
    """'Salmo 27:10' -> ('salmo', 27, 10, 10); 'Salmo 118' -> ('salmo', 118, None, None). None se não entender."""
    m = re.match(r"^\s*([1-3]?\s*[^\d:]+?)\s+(\d+)(?::(\d+)(?:\s*[-–]\s*(\d+))?)?", ref)
    if not m:
        return None
    livro = _sem_acento(m.group(1)).strip()
    livro = {"salmos": "salmo"}.get(livro, livro)
    cap = int(m.group(2))
    v1 = int(m.group(3)) if m.group(3) else None
    v2 = int(m.group(4)) if m.group(4) else v1
    return livro, cap, v1, v2


def conflita(ref_a, ref_b):
    a, b = analisar_referencia(ref_a), analisar_referencia(ref_b)
    if not a or not b:
        return _sem_acento(ref_a).strip() == _sem_acento(ref_b).strip()
    if a[:2] != b[:2]:
        return False
    if a[2] is None or b[2] is None:  # capítulo inteiro bate com qualquer versículo dele
        return True
    return a[2] <= b[3] and b[2] <= a[3]


def carregar():
    if ARQ.exists():
        return json.loads(ARQ.read_text())
    return {"janela_dias": 60, "videos": []}


def salvar(h):
    ARQ.write_text(json.dumps(h, ensure_ascii=False, indent=2) + "\n")


def _data(txt):
    return date.fromisoformat(txt) if txt else None


def livre_em(e, janela):
    ultima = max(d for d in (_data(e.get("data_criacao")), _data(e.get("data_publicacao"))) if d)
    return ultima + timedelta(days=janela)


def conflitos(ref, slug="", hoje=None, h=None, ignorar=None):
    """Entradas do histórico que ainda bloqueiam este tema. `ignorar` = (pasta, id) do próprio gancho."""
    h = h or carregar()
    hoje = hoje or date.today()
    out = []
    for e in h["videos"]:
        if ignorar and (e["pasta"], e["id"]) == tuple(ignorar):
            continue
        if hoje >= livre_em(e, h["janela_dias"]):
            continue
        if conflita(ref, e["referencia"]) or (slug and slug == e["slug"]):
            out.append(e)
    return out


def sincronizar(pasta_nome):
    h = carregar()
    cfg = json.loads((RAIZ / pasta_nome / "ganchos.json").read_text())
    tem = {(e["pasta"], e["id"]) for e in h["videos"]}
    novos = 0
    for g in cfg["ganchos"]:
        if (pasta_nome, g["id"]) in tem:
            continue
        h["videos"].append({"pasta": pasta_nome, "id": g["id"], "slug": g["slug"], "referencia": g.get("referencia", ""),
                            "palavra_chave": g.get("palavra_chave", ""), "texto": g["texto"],
                            "data_criacao": date.today().isoformat(), "data_publicacao": None})
        novos += 1
    salvar(h)
    print(f"{novos} novo(s) registrado(s) em {ARQ.name}; total {len(h['videos'])}")


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    cmd = sys.argv[1]
    if cmd == "sincronizar":
        sincronizar(sys.argv[2] if len(sys.argv) > 2 else "ganchos-fe")
    elif cmd == "verificar":
        ref, slug = sys.argv[2], (sys.argv[3] if len(sys.argv) > 3 else "")
        c = conflitos(ref, slug)
        if not c:
            print(f"LIVRE: {ref!r} não foi usado nos últimos {carregar()['janela_dias']} dias.")
        else:
            h = carregar()
            for e in c:
                print(f"BLOQUEADO: {ref!r} já usado em {e['pasta']}/{e['id']:02d}-{e['slug']} ({e['referencia']}); "
                      f"livre em {livre_em(e, h['janela_dias'])}")
            sys.exit(1)
    elif cmd == "listar":
        h = carregar()
        for e in sorted(h["videos"], key=lambda e: (e["pasta"], e["id"])):
            print(f"{e['pasta']}/{e['id']:02d} {e['slug']:<28} {e['referencia']:<24} livre em {livre_em(e, h['janela_dias'])}")
    elif cmd == "publicado":
        h = carregar()
        pasta, num = sys.argv[2], int(sys.argv[3])
        quando = sys.argv[4] if len(sys.argv) > 4 else date.today().isoformat()
        for e in h["videos"]:
            if e["pasta"] == pasta and e["id"] == num:
                e["data_publicacao"] = quando
        salvar(h)
        print("publicação registrada:", pasta, num, quando)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
