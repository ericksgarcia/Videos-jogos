import sys, os, base64, requests
sys.path.insert(0, os.path.dirname(__file__)); import voz
DIRECAO = voz.DIRECAO  # tom de voz do canal (identidade/marca.json)
T = "Você aperta o interruptor e a luz acende. Simples assim. Mas, pra isso acontecer, alguma coisa muito longe daqui precisou girar. Vou te explicar como, do jeito mais fácil possível."
for v in sys.argv[1:]:
    r = voz.narrar(T, T, direcao=DIRECAO, voz_nome=v)
    b = base64.b64encode(open(r["wav"], "rb").read()).decode()
    q = "Avalie esta voz para um canal de divulgação científica para ADULTOS no TikTok. Responda só JSON: {\"natural\":0-10,\"carisma\":0-10,\"clareza\":0-10,\"comentario\":\"...\"}"
    j = requests.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", headers=voz._cab_gemini(),
        json={"contents": [{"parts": [{"inlineData": {"mimeType": "audio/wav", "data": b}}, {"text": q}]}], "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}, timeout=120)
    print(v, r["dur"], j.json()["candidates"][0]["content"]["parts"][0]["text"].replace("\n", " "))
