# Kit de personagens do Luz da Palavra

Personagens em traço de luz, **sem rosto**, montados a partir de **peças desenhadas à mão uma vez** e
reaproveitadas em todo vídeo (nada de acervo pronto: pedido do dono). O motor carrega sozinho os
arquivos desta pasta (`*.js`, em ordem) antes do `cenas.js` de cada vídeo.

| arquivo | o que tem |
|---|---|
| `1-pecas.js` | `KIT_PECAS`: as peças desenhadas (contorno + linhas de detalhe), cada uma no seu "osso" |
| `2-elenco.js` | `KIT_ELENCO` (fichas fixas: jesus, maria, davi, pessoa, homem, mulher, crianca, idoso) e `elencoVariado(seed, papel)` |
| `3-rig.js` | `figura(x, t, pose, opções)`: monta as peças no esqueleto e anima com as `POSES` |

## Como usar numa cena

```js
figura(x, t, POSES.andar(t * 6), { tipo: "jesus", x: 540, chao: 1400, H: 560, dir: 1, cam, z: 1 });
figura(x, t, POSES.de_pe, { ficha: elencoVariado(3, "mulher"), x: 300, chao: 1400, H: 520 });
figura(x, t, POSES.segurando, { tipo: "davi", maos: ["segura", "segura"], ... });
```

Mesmas opções e mesmo retorno do `personagem()` antigo (`rot`, `medir`, `atras`, `a`, `cor`, `vida`,
`fase`; devolve `maos`, `cabeca`, `ombro`, `quadril`, `escala`...). Mãos: `aberta`, `segura`, `aponta`, `palma`.

## Base desenhada (out/2026)

- Corpo: `tronco`, `tronco_barriga`, `cinto`; túnica com faixa bordada na barra (comprimento pela ficha).
- Braços: `braco`, `antebraco`, `manga_curta`, `manga_longa_braco` + `manga_longa` (abre em sino).
- Mãos: `mao_aberta`, `mao_segura`, `mao_aponta`, `mao_palma`. Pernas: `coxa`, `canela`, `pe` (sandália).
- Cabeça: `cabeca` (3 formatos pela ficha: `cab: [largura, altura]`; criança com `cabecaGrande`).
- Cabelos: `cabelo_curto`, `cabelo_cacheado`, `cabelo_longo`. Barbas: `barba_curta`, `barba_longa`.
- Coberturas: `veu`, `pano_cabeca`. Roupa extra: `manto` (himátion).

## Quando faltar alguma coisa

Desenhe a peça nova **só quando um vídeo precisar** (ex.: armadura e elmo para Golias, coroa de rei, cajado
na mão, rede de pesca, roupa de soldado romano), com o mesmo cuidado:

1. pontos em milésimos da altura do personagem, no referencial do osso (origem na articulação de cima,
   y ao longo do osso, x para a frente); poucos pontos, curvas suaves; detalhes como `linhas`;
2. salve em `1-pecas.js` com nome claro e anote aqui na lista acima;
3. se for de um personagem fixo, ponha na ficha dele em `2-elenco.js`;
4. confira na vitrine (`luz-da-palavra/videos/amostra-kit`, prévia com `VOZ_PROVEDOR=nenhum --so-montar`).

## Ninguém igual

- Personagens principais têm **ficha fixa** (Jesus sempre com cabelo longo, barba, manto dourado;
  Maria com véu...), para serem reconhecidos em toda a série.
- Figurantes usam `elencoVariado(seed, papel)` com **seeds diferentes**: muda cabelo, barba, cobertura,
  mangas, túnica, corpo, altura, formato da cabeça e o tom da linha. Numa mesma cena, nunca repita a seed;
  entre vídeos, comece de seeds diferentes (ex.: 100+, 200+...).
