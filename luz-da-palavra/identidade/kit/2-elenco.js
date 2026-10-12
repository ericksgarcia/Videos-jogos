// Kit de personagens — ELENCO: quem é quem. Cada personagem é uma "ficha" que escolhe peças do kit e
// proporções. Os principais (Jesus, Maria, Davi...) têm ficha fixa para serem reconhecidos em todo vídeo;
// figurantes saem de elencoVariado(seed, papel), que sorteia (sempre igual para a mesma seed) cabelo, barba,
// cobertura, mangas, comprimento da túnica, corpo, altura, formato da cabeça e o tom da linha, para ninguém
// ficar igual ao vizinho.
// Ficha: { corpo: "tronco"|"tronco_barriga", larg, alt, cab: [sx, sy], cabecaGrande, cabelo, barba, cobertura,
//          manga: "manga_curta"|"manga_longa"|null, barra (comprimento da túnica abaixo do quadril, em
//          milésimos de H), cinto, manto, cor (linha), corManto, corCabelo, idade (0–1: curva as costas) }

const KIT_ELENCO = {
  jesus: { corpo: "tronco", larg: 1.0, alt: 1.0, cab: [1, 1.02], cabelo: "cabelo_longo", barba: "barba_curta", manga: "manga_longa", barra: 430, cinto: true, manto: true, cor: [1, 0.94, 0.8], corManto: [1, 0.84, 0.55] },
  maria: { corpo: "tronco", larg: 0.92, alt: 0.95, cab: [0.96, 1.0], cobertura: "veu", manga: "manga_longa", barra: 440, cinto: true, cor: [0.92, 0.9, 1], corCabelo: [0.82, 0.86, 1] },
  davi: { corpo: "tronco", larg: 0.95, alt: 0.94, cab: [1.02, 0.98], cabelo: "cabelo_cacheado", manga: "manga_curta", barra: 215, cinto: true, cor: [1, 0.86, 0.55] },
  pessoa: { corpo: "tronco", larg: 1.0, alt: 1.0, cab: [1, 1], cabelo: "cabelo_curto", manga: "manga_curta", barra: 300, cinto: true, cor: [0.86, 0.9, 1] },
  homem: { corpo: "tronco", larg: 1.06, alt: 1.0, cab: [1.02, 1.0], cobertura: "pano_cabeca", barba: "barba_curta", manga: "manga_curta", barra: 330, cinto: true, cor: [0.95, 0.85, 0.7] },
  mulher: { corpo: "tronco", larg: 0.92, alt: 0.95, cab: [0.96, 1.0], cobertura: "veu", manga: "manga_longa", barra: 440, cinto: true, cor: [0.92, 0.88, 1] },
  crianca: { corpo: "tronco", larg: 1.05, alt: 1.0, cab: [1.04, 0.98], cabecaGrande: 1.25, cabelo: "cabelo_curto", manga: "manga_curta", barra: 240, cinto: true, cor: [1, 0.9, 0.7] },
  idoso: { corpo: "tronco_barriga", larg: 1.08, alt: 0.96, cab: [1.02, 1.0], cobertura: "pano_cabeca", barba: "barba_longa", manga: "manga_longa", barra: 420, cinto: true, cor: [0.88, 0.88, 0.92], corCabelo: [0.85, 0.85, 0.88], idade: 0.6 },
};
// figurantes variados (determinístico pela seed): papel = "homem" | "mulher" | "crianca" | "idoso" | "jovem"
function elencoVariado(seed, papel = "homem") {
  const r = prng(9000 + seed * 7919), esc = (l) => l[Math.floor(r() * l.length)];
  const tons = [[0.95, 0.85, 0.7], [0.86, 0.9, 1], [1, 0.9, 0.72], [0.9, 0.86, 0.98], [0.82, 0.92, 0.9], [1, 0.82, 0.66]];
  const base = { corpo: r() < 0.25 ? "tronco_barriga" : "tronco", larg: 0.92 + 0.22 * r(), alt: 0.92 + 0.14 * r(), cab: esc([[1, 1], [1.07, 0.95], [0.95, 1.05], [1.03, 1.02]]), cinto: r() < 0.8, cor: esc(tons) };
  if (papel === "mulher") return { ...base, corpo: "tronco", larg: 0.86 + 0.12 * r(), alt: 0.9 + 0.08 * r(), cobertura: r() < 0.75 ? "veu" : null, cabelo: "cabelo_longo", manga: esc(["manga_longa", "manga_longa", "manga_curta"]), barra: 410 + 40 * r() };
  if (papel === "crianca") return { ...base, corpo: "tronco", larg: 1.0 + 0.1 * r(), cabecaGrande: 1.25, cabelo: esc(["cabelo_curto", "cabelo_cacheado"]), manga: "manga_curta", barra: 200 + 60 * r() };
  if (papel === "idoso") return { ...base, cobertura: esc(["pano_cabeca", null]), cabelo: "cabelo_curto", barba: esc(["barba_longa", "barba_longa", "barba_curta"]), manga: "manga_longa", barra: 400 + 40 * r(), idade: 0.4 + 0.4 * r(), corCabelo: [0.85, 0.85, 0.88] };
  if (papel === "jovem") return { ...base, corpo: "tronco", cabelo: esc(["cabelo_curto", "cabelo_cacheado"]), barba: r() < 0.3 ? "barba_curta" : null, manga: "manga_curta", barra: 220 + 100 * r() };
  return { ...base, cobertura: r() < 0.45 ? "pano_cabeca" : null, cabelo: esc(["cabelo_curto", "cabelo_cacheado", "cabelo_curto"]), barba: esc(["barba_curta", "barba_curta", "barba_longa", null]), manga: esc(["manga_curta", "manga_longa"]), barra: 260 + 170 * r() };
}
