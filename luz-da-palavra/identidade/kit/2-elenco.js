// Kit de personagens — ELENCO: quem é quem. Cada personagem é uma "ficha" que escolhe peças do kit e
// proporções. Os principais (Jesus, Maria, Davi...) têm ficha fixa para serem reconhecidos em todo vídeo;
// figurantes saem de elencoVariado(seed, papel), que sorteia (sempre igual para a mesma seed) cabelo, barba,
// cobertura, mangas, comprimento da túnica, corpo, altura, formato da cabeça e o tom da linha, para ninguém
// ficar igual ao vizinho.
// Ficha: { corpo: "tronco"|"tronco_barriga", larg, alt, cab: [sx, sy], cabecaGrande, cabelo, barba, cobertura,
//          manga: "manga_curta"|"manga_longa"|null, barra (comprimento da túnica abaixo do quadril, em
//          milésimos de H), cinto, manto, cor (linha), corManto, corCabelo, idade (0–1: curva as costas) }

// paletas (linhas de luz): pele, roupa e cabelo — a cor é o que mais separa um personagem do outro
const KIT_PELES = [[1, 0.88, 0.74], [0.98, 0.8, 0.64], [0.92, 0.72, 0.54], [0.84, 0.64, 0.48], [0.76, 0.56, 0.42]];
const KIT_ROUPAS = [[0.95, 0.88, 0.72], [0.94, 0.94, 1], [0.6, 0.76, 1], [1, 0.7, 0.72], [0.7, 0.92, 0.76], [1, 0.78, 0.45], [0.8, 0.72, 1], [0.55, 0.9, 0.9], [0.95, 0.62, 0.46]];
const KIT_CABELOS = [[0.74, 0.68, 0.64], [0.82, 0.62, 0.45], [0.7, 0.55, 0.45], [0.95, 0.62, 0.4], [0.88, 0.86, 0.9], [0.96, 0.84, 0.6]];
const KIT_ELENCO = {
  jesus: { corpo: "tronco", larg: 1.0, alt: 1.02, cab: [1, 1.02], cabeca: "cabeca", cabelo: "cabelo_longo", barba: "barba_curta", manga: "manga_longa", barra: 430, cinto: true, manto: true, clavi: true, barraEstilo: "dupla",
    pele: [0.96, 0.8, 0.62], roupa: [0.97, 0.95, 0.9], roupa2: [1, 0.82, 0.5], corManto: [1, 0.78, 0.45], corCabelo: [0.8, 0.6, 0.44] },
  maria: { corpo: "tronco", larg: 0.9, alt: 0.94, cab: [0.96, 1.0], cabeca: "cabeca_curto", cobertura: "veu", manga: "manga_longa", barra: 440, cinto: true, barraEstilo: "linha", cilios: true,
    pele: [0.98, 0.84, 0.7], roupa: [0.7, 0.8, 1], roupa2: [0.9, 0.93, 1] },
  davi: { corpo: "tronco", larg: 0.95, alt: 0.93, cab: [1.02, 0.98], cabeca: "cabeca_curto", cabelo: "cabelo_cacheado", manga: "manga_curta", barra: 215, cinto: true, barraEstilo: "zigue",
    pele: [0.96, 0.78, 0.6], roupa: [1, 0.8, 0.5], roupa2: [0.95, 0.58, 0.4], corCabelo: [0.98, 0.58, 0.36] }, // "ruivo" (1 Sm 16:12)
  pessoa: { corpo: "tronco", larg: 1.0, alt: 1.0, cab: [1, 1], cabeca: "cabeca", cabelo: "cabelo_curto", manga: "manga_curta", barra: 300, cinto: true, barraEstilo: "linha",
    pele: [0.98, 0.84, 0.7], roupa: [0.6, 0.76, 1], roupa2: [0.9, 0.94, 1], corCabelo: [0.82, 0.62, 0.45] },
  homem: { corpo: "tronco", larg: 1.1, alt: 1.0, cab: [1.04, 1.0], cabeca: "cabeca_aquilino", cobertura: "pano_cabeca", barba: "barba_curta", manga: "manga_curta", barra: 330, cinto: true, clavi: true, barraEstilo: "pontos",
    pele: [0.86, 0.66, 0.5], roupa: [0.95, 0.88, 0.72], roupa2: [0.95, 0.55, 0.42], corCabelo: [0.74, 0.68, 0.64] },
  mulher: { corpo: "tronco", larg: 0.9, alt: 0.95, cab: [0.96, 1.0], cabeca: "cabeca_curto", cobertura: "veu", manga: "manga_longa", barra: 440, cinto: true, barraEstilo: "zigue", cilios: true,
    pele: [0.92, 0.74, 0.58], roupa: [1, 0.72, 0.74], roupa2: [1, 0.88, 0.72] },
  crianca: { corpo: "tronco", larg: 1.05, alt: 1.0, cab: [1.04, 0.98], cabecaGrande: 1.25, cabeca: "cabeca_curto", cabelo: "cabelo_cacheado", manga: "manga_curta", barra: 240, cinto: true, barraEstilo: "linha",
    pele: [0.98, 0.82, 0.64], roupa: [0.7, 0.92, 0.76], roupa2: [1, 0.8, 0.5], corCabelo: [0.7, 0.55, 0.45] },
  idoso: { corpo: "tronco_barriga", larg: 1.12, alt: 0.95, cab: [1.03, 1.0], cabeca: "cabeca_queixo", cobertura: "pano_cabeca", barba: "barba_longa", manga: "manga_longa", barra: 420, cinto: true, colete: true, barraEstilo: "dupla", idade: 0.6,
    pele: [0.9, 0.74, 0.6], roupa: [0.8, 0.78, 0.92], roupa2: [0.72, 0.62, 0.95], corCabelo: [0.9, 0.9, 0.92] },
};
// figurantes variados (determinístico pela seed): papel = "homem" | "mulher" | "crianca" | "idoso" | "jovem"
function elencoVariado(seed, papel = "homem") {
  const r = prng(9000 + seed * 7919), esc = (l) => l[Math.floor(r() * l.length)];
  const roupa = esc(KIT_ROUPAS); let roupa2 = esc(KIT_ROUPAS); if (roupa2 === roupa) roupa2 = KIT_ROUPAS[(KIT_ROUPAS.indexOf(roupa) + 3) % KIT_ROUPAS.length];
  const base = { corpo: r() < 0.25 ? "tronco_barriga" : "tronco", larg: 0.88 + 0.32 * r(), alt: 0.88 + 0.2 * r(), cab: esc([[1, 1], [1.08, 0.95], [0.94, 1.06], [1.04, 1.03]]),
    cabeca: esc(["cabeca", "cabeca_aquilino", "cabeca_curto", "cabeca_queixo"]), cinto: r() < 0.85, clavi: r() < 0.35, colete: r() < 0.18, barraEstilo: esc(["linha", "dupla", "zigue", "pontos", null]),
    pele: esc(KIT_PELES), roupa, roupa2, corCabelo: esc(KIT_CABELOS), expr: esc(["neutro", "neutro", "sorri"]) };
  if (papel === "mulher") return { ...base, corpo: "tronco", colete: false, larg: 0.84 + 0.16 * r(), alt: 0.88 + 0.1 * r(), cabeca: esc(["cabeca_curto", "cabeca"]), cilios: true, cobertura: esc(["veu", "veu", null, null]), cabelo: esc(["cabelo_longo", "cabelo_coque", "cabelo_ondulado"]), xale: r() < 0.35, manga: esc(["manga_longa", "manga_longa", "manga_curta"]), barra: 410 + 40 * r() };
  if (papel === "crianca") return { ...base, corpo: "tronco", colete: false, larg: 1.0 + 0.1 * r(), cabecaGrande: 1.25, cabeca: "cabeca_curto", cabelo: esc(["cabelo_curto", "cabelo_cacheado", "cabelo_ondulado"]), manga: "manga_curta", barra: 200 + 60 * r(), expr: esc(["sorri", "neutro", "espanto"]) };
  if (papel === "idoso") return { ...base, cobertura: esc(["pano_cabeca", null, null]), cabelo: esc(["calvo", "cabelo_curto"]), barba: esc(["barba_longa", "barba_longa", "barba_curta"]), manga: "manga_longa", barra: 400 + 40 * r(), idade: 0.4 + 0.4 * r(), corCabelo: [0.88, 0.88, 0.92] };
  if (papel === "jovem") return { ...base, corpo: "tronco", cabelo: esc(["cabelo_curto", "cabelo_cacheado", "cabelo_ondulado"]), barba: esc([null, null, "cavanhaque", "barba_curta"]), cobertura: r() < 0.25 ? "faixa_cabeca" : null, manga: "manga_curta", barra: 220 + 100 * r() };
  return { ...base, cobertura: esc(["pano_cabeca", "faixa_cabeca", null, null]), cabelo: esc(["cabelo_curto", "cabelo_cacheado", "cabelo_ondulado", "calvo"]), barba: esc(["barba_curta", "barba_curta", "barba_longa", "cavanhaque", null]), manga: esc(["manga_curta", "manga_longa"]), barra: 260 + 170 * r() };
}
