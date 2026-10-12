// Vitrine do kit de personagens (luz-da-palavra/identidade/kit). Não é vídeo do canal.
const AK_FUNDO = { fundo: LUZ.fundo.map((q) => q * 0.9) };
function AK_rot(x, txt, px, py) { rotuloP(x, txt, px, py, 30, "255,236,200", 0.9, "center"); }
CENAS.elenco = (el, c) => { const TV = telaGPU(el, c, AK_FUNDO), nv = TV.nuvem(2000);
  TV.quadro((x, t) => { const L = [["jesus", 140, 800], ["maria", 400, 800], ["davi", 660, 800], ["idoso", 920, 800], ["pessoa", 140, 1350], ["homem", 400, 1350], ["mulher", 660, 1350], ["crianca", 920, 1350]];
    for (const [tp, px, ch] of L) { figura(x, t, POSES.de_pe, { tipo: tp, x: px, chao: ch, H: tp === "crianca" ? 300 : 420, dir: 1, fase: px }); AK_rot(x, tp, px, ch + 40); } nv.total(0); }); };
CENAS.variados = (el, c) => { const TV = telaGPU(el, c, AK_FUNDO), nv = TV.nuvem(2000);
  TV.quadro((x, t) => { const pap = ["homem", "mulher", "homem", "idoso", "jovem", "mulher", "homem", "crianca", "jovem", "mulher", "homem", "idoso"];
    pap.forEach((p, k) => { const px = 140 + (k % 4) * 260, ch = 620 + Math.floor(k / 4) * 470; figura(x, t, POSES.de_pe, { ficha: elencoVariado(k + 1, p), x: px, chao: ch, H: p === "crianca" ? 290 : 400, dir: k % 2 ? -1 : 1, fase: k }); AK_rot(x, p + " " + (k + 1), px, ch + 34); }); nv.total(0); }); };
CENAS.poses = (el, c) => { const TV = telaGPU(el, c, AK_FUNDO), nv = TV.nuvem(2000);
  TV.quadro((x, t) => { const L = [[POSES.andar(t * 5, 1), "jesus", 170, 800, "andar"], [POSES.ajoelhado, "maria", 540, 800, "ajoelhado"], [POSES.sentado, "homem", 900, 800, "sentado"], [POSES.bracos_abertos, "jesus", 170, 1350, "braços abertos"], [POSES.segurando, "davi", 540, 1350, "segurando"], [{ ...POSES.de_pe, braco: [[-0.2, 0.3], [1.6, 0.0]] }, "idoso", 900, 1350, "apontando"]];
    for (const [pz, tp, px, ch, nome] of L) { figura(x, t, pz, { tipo: tp, x: px, chao: ch, H: 440, dir: 1, fase: px, maos: nome === "segurando" ? ["segura", "segura"] : nome === "apontando" ? ["aberta", "aponta"] : nome === "braços abertos" ? ["palma", "palma"] : ["aberta", "aberta"] }); AK_rot(x, nome, px, ch + 40); } nv.total(0); }); };
CENAS.antes = (el, c) => { const TV = telaGPU(el, c, AK_FUNDO), nv = TV.nuvem(2000);
  TV.quadro((x, t) => { personagem(x, t, POSES.de_pe, { tipo: "jesus", x: 290, chao: 1000, H: 700, dir: 1 }); figura(x, t, POSES.de_pe, { tipo: "jesus", x: 790, chao: 1000, H: 700, dir: 1 });
    AK_rot(x, "antes", 290, 1050); AK_rot(x, "depois (kit)", 790, 1050);
    personagem(x, t, POSES.andar(t * 5, 1), { tipo: "pessoa", x: 290, chao: 1560, H: 440, dir: 1 }); figura(x, t, POSES.andar(t * 5, 1), { tipo: "pessoa", x: 790, chao: 1560, H: 440, dir: 1 }); nv.total(0); }); };
