import sys, json, base64, requests, statistics
sys.path.insert(0, "/home/user/Videos-jogos/aprendendo/motor"); import voz
Q = ("Você é diretor de locução de um canal cristão brasileiro de vídeos curtos (TikTok) para adultos. Ouça esta narração "
     "e responda só JSON: {\"reverencia\":0-10,\"calor_humano\":0-10,\"prende_atencao\":0-10,\"ritmo_ideal\":0-10 (10 = calmo mas vivo; 0 = corrido ou arrastado),"
     "\"naturalidade\":0-10,\"clareza\":0-10,\"soa_robotico\":0-10}")
out = {}
for w in sys.argv[1:]:
    b = base64.b64encode(open(w, "rb").read()).decode(); tot = []
    for k in range(3):
        j = requests.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", headers=voz._cab_gemini(),
            json={"contents": [{"parts": [{"inlineData": {"mimeType": "audio/wav", "data": b}}, {"text": Q}]}], "generationConfig": {"responseMimeType": "application/json", "temperature": 1.0}}, timeout=180)
        n = json.loads(j.json()["candidates"][0]["content"]["parts"][0]["text"])
        tot.append(sum(n[x] for x in ("reverencia", "calor_humano", "prende_atencao", "ritmo_ideal", "naturalidade", "clareza")) - n["soa_robotico"])
    out[w.split("/")[-1]] = (round(statistics.mean(tot), 1), tot); print(w.split("/")[-1], out[w.split("/")[-1]], flush=True)
