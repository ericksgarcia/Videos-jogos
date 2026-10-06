import sys, os, base64, requests
sys.path.insert(0, os.path.dirname(__file__)); import voz
DIRECAO = """# AUDIO PROFILE: Narrador de um canal brasileiro de divulgação científica para adultos
## THE SCENE: Vídeo curto que explica um assunto complicado de um jeito muito simples, com analogias do dia a dia.
### DIRECTOR'S NOTES
Style: adulto, inteligente, conversado e caloroso, curioso como quem conta algo fascinante a um amigo; nada infantilizado; ênfase natural nas palavras-chave.
Pace: moderado, com pausas curtas para a ideia assentar.
Accent: português do Brasil.
#### TRANSCRIPT
"""
T = "Você aperta o interruptor e a luz acende. Simples assim. Mas, pra isso acontecer, alguma coisa muito longe daqui precisou girar. Vou te explicar como, do jeito mais fácil possível."
for v in sys.argv[1:]:
    r = voz.narrar(T, T, direcao=DIRECAO, voz_nome=v)
    b = base64.b64encode(open(r["wav"], "rb").read()).decode()
    q = "Avalie esta voz para um canal de divulgação científica para ADULTOS no TikTok. Responda só JSON: {\"natural\":0-10,\"carisma\":0-10,\"clareza\":0-10,\"comentario\":\"...\"}"
    j = requests.post("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent", headers={"x-goog-api-key": os.environ["GEMINI_API_KEY"]},
        json={"contents": [{"parts": [{"inlineData": {"mimeType": "audio/wav", "data": b}}, {"text": q}]}], "generationConfig": {"responseMimeType": "application/json", "temperature": 0}}, timeout=120)
    print(v, r["dur"], j.json()["candidates"][0]["content"]["parts"][0]["text"].replace("\n", " "))
