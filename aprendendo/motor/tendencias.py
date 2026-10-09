"""Assuntos em alta no Google Brasil nas últimas N horas, ordenados pelo volume de buscas.

Uso:
  python aprendendo/motor/tendencias.py            # últimas 24 h, 40 primeiros
  python aprendendo/motor/tendencias.py 48 80      # últimas 48 h, 80 primeiros
  python aprendendo/motor/tendencias.py 24 40 --json

Fonte: a página "Em alta" do Google Trends (trends.google.com/trending?geo=BR), a mesma
consulta que o site faz. O volume é aproximado (o Google arredonda: 2 mil+, 20 mil+...).
Precisa de trends.google.com liberado na rede do ambiente.
"""
import datetime
import json
import sys
import urllib.parse
import urllib.request

URL = "https://trends.google.com/_/TrendsUi/data/batchexecute?rpcids=i0OFE&hl=pt-BR"
CATEGORIAS = {1: "autos", 2: "beleza/moda", 3: "negócios", 4: "entretenimento", 5: "comida", 6: "jogos/loterias",
              7: "saúde", 8: "hobbies", 9: "empregos/educação", 10: "lei/governo", 11: "outros", 13: "pets",
              14: "política", 15: "ciência", 16: "compras", 17: "esportes", 18: "tecnologia", 19: "viagem", 20: "clima"}


def buscar(horas=24, geo="BR"):
    req = json.dumps([[["i0OFE", json.dumps([None, None, geo, 0, "pt-BR", horas, 1]), None, "generic"]]])
    dados = urllib.parse.urlencode({"f.req": req}).encode()
    r = urllib.request.Request(URL, data=dados, headers={"Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"})
    txt = urllib.request.urlopen(r, timeout=30).read().decode("utf-8").split("\n", 2)[2]
    itens = json.loads(json.loads(txt.splitlines()[0])[0][2])[1]
    out = []
    for it in itens:
        out.append({
            "termo": it[0], "volume": it[6] or 0, "alta_pct": it[8],
            "desde": datetime.datetime.fromtimestamp(it[3][0], datetime.timezone(datetime.timedelta(hours=-3))).strftime("%d/%m %Hh"),
            "ativo": it[4] is None,
            "relacionados": (it[9] or [])[1:6],
            "categorias": [CATEGORIAS.get(c, str(c)) for c in (it[10] or [])],
        })
    return sorted(out, key=lambda x: -x["volume"])


def main():
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    horas, n = int(args[0]) if args else 24, int(args[1]) if len(args) > 1 else 40
    lista = buscar(horas)[:n]
    if "--json" in sys.argv:
        print(json.dumps(lista, ensure_ascii=False, indent=1))
        return
    for x in lista:
        vol = f"{x['volume']:,}".replace(",", ".")
        print(f"{vol:>8} | {x['termo']} | +{x['alta_pct']}% | {', '.join(x['categorias'])} | {', '.join(x['relacionados'][:3])}")


if __name__ == "__main__":
    main()
