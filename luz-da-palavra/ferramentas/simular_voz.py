"""Simula a narração de um trecho com várias direções/vozes/pausas e mede o ritmo; pede notas ao gemini-3.8-flash.
uso: python simular.py trecho.json variantes.json saida/"""
import sys, os, json, base64, subprocess, requests
sys.path.insert(0, "/home/user/Videos-jogos/aprendendo/motor"); import voz
trecho = json.load(open(sys.argv[1])); var = json.load(open(sys.argv[2])); out = sys.argv[3]; os.makedirs(out, exist_ok=True)
D = json.load(open("/home/user/Videos-jogos/luz-da-palavra/identidade/direcoes_voz.json"))
falas = trecho["falas"]; nw = sum(len(f.split()) for f in falas)
Q = ("Você é diretor de locução de um canal cristão brasileiro de vídeos curtos (TikTok) para adultos. Ouça esta narração "
     "e responda só JSON: {\"reverencia\":0-10,\"calor_humano\":0-10,\"prende_atencao\":0-10,\"ritmo_ideal\":0-10 (10 = calmo mas vivo; 0 = corrido ou arrastado),"
     "\"naturalidade\":0-10,\"clareza\":0-10,\"soa_robotico\":0-10,\"comentario\":\"2 frases, o que melhorar\"}")
res = {}
for nome, v in var.items():
    r = voz.narrar_video(falas, direcao=D[v["direcao"]], voz_nome=v.get("voz", "Achird"), pausas=v.get("pausas"))
    if not r: print(nome, "falhou"); continue
    wavs = [c["wav"] for c in r]; dest = os.path.join(out, nome + ".wav")
    subprocess.run(["ffmpeg", "-v", "error", "-y", *sum([["-i", w] for w in wavs], []), "-filter_complex",
                    "".join(f"[{i}:a]" for i in range(len(wavs))) + f"concat=n={len(wavs)}:v=0:a=1", dest], check=True)
    dur = sum(c["dur"] for c in r)
    fala = sum(b - a for c in r for _, a, b in c["palavras"])
    gaps = []
    for c in r:
        P = c["palavras"]
        for i in range(len(P) - 1):
            if P[i][0].endswith((".", "?", "!")): gaps.append(round(P[i + 1][1] - P[i][2], 2))
    b = base64.b64encode(open(dest, "rb").read()).decode()
    j = requests.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", headers=voz._cab_gemini(),
        json={"contents": [{"parts": [{"inlineData": {"mimeType": "audio/wav", "data": b}}, {"text": Q}]}], "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}, timeout=180)
    try: nota = json.loads(j.json()["candidates"][0]["content"]["parts"][0]["text"])
    except Exception as e: nota = {"erro": str(e)[:80]}
    res[nome] = {"dur": round(dur, 2), "ppm_total": round(nw / dur * 60), "ppm_fala": round(nw / max(fala, 1) * 60), "pausas_frase": gaps, "nota": nota, "wav": dest}
    print(nome, json.dumps(res[nome], ensure_ascii=False), flush=True)
json.dump(res, open(os.path.join(out, "resultado.json"), "w"), ensure_ascii=False, indent=1)
