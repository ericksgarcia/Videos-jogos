# Kit de personagens do Luz da Palavra

Personagens em traço de luz, **com rosto de perfil** (olho, sobrancelha, nariz, boca, orelha; pedido do dono, out/2026), montados a partir de **peças desenhadas à mão uma vez** e
reaproveitadas em todo vídeo (nada de acervo pronto: pedido do dono). O motor carrega sozinho os
arquivos desta pasta (`*.js`, em ordem) antes do `cenas.js` de cada vídeo.

| arquivo | o que tem |
|---|---|
| `1-pecas.js` | `KIT_PECAS`: as peças desenhadas (contorno + linhas de detalhe), cada uma no seu "osso" |
| `2-elenco.js` | `KIT_ELENCO` (fichas fixas: jesus, maria, davi, pessoa, homem, mulher, crianca, idoso) e `elencoVariado(seed, papel)` |
| `3-rig.js` | `figura(x, t, pose, opções)`: monta as peças no esqueleto e anima com as `POSES` |
| `4-rosto.js` | rosto de perfil por medidas (`kitPerfil`, `kitRosto`), traço de pincel (`kitPincel`) e cabelo, barba, bigode, véu, pano e faixa feitos de massa + fios gerados (`KIT_CABELOS_V2`, `KIT_BARBAS_V2`, `KIT_COBERTURAS_V2`) |

## Como usar numa cena

```js
figura(x, t, POSES.andar(t * 6), { tipo: "jesus", x: 540, chao: 1400, H: 560, dir: 1, cam, z: 1 });
figura(x, t, POSES.de_pe, { ficha: elencoVariado(3, "mulher"), x: 300, chao: 1400, H: 520 });
figura(x, t, POSES.segurando, { tipo: "davi", maos: ["segura", "segura"], ... });
```

Mesmas opções e mesmo retorno do `personagem()` antigo (`rot`, `medir`, `atras`, `a`, `cor`, `vida`,
`fase`, `expr`; devolve `maos`, `cabeca`, `ombro`, `quadril`, `escala`...). Mãos: `aberta`, `segura`, `aponta`, `palma`.
Expressões (`expr`): `neutro`, `sorri`, `triste`, `medo`, `espanto`, `dorme` (olhos fechados), `fala` (boca mexe); piscam sozinhos.

## Base desenhada (out/2026)

- Corpo: `tronco`, `tronco_barriga`, `cinto`; túnica com faixa bordada na barra (comprimento pela ficha).
- Braços e pernas: forma contínua do ombro ao punho / do quadril ao tornozelo (`membro()` + `PERF_BRACO`/`PERF_PERNA` no rig: larguras por trecho, sem emenda no cotovelo/joelho). Mangas também contínuas, saindo do ombro sem costura; a longa abre em sino. (As peças `braco`, `antebraco`, `manga_*` antigas ficam só como referência.)
- Túnica: tronco e saia sem emenda; faixa de pano na cintura com nó e pontas; decote e dobras de pincel; vestido longo abre na barra; abaixo do joelho o pano cai na vertical (ajoelhado, fica no chão). Manto com barra ondulada.
- Mãos: `mao_aberta`, `mao_segura`, `mao_aponta`, `mao_palma`. Pernas: `coxa`, `canela`, `pe` (sandália).
- Cabeça de perfil: `cabeca`, `cabeca_aquilino`, `cabeca_curto`, `cabeca_queixo` (+ `cab: [largura, altura]`; criança com `cabecaGrande`); rosto em `kitRosto()` (3-rig.js).
- Cabelo/barba/coberturas (out/2026, refeitos): cada forma tem `fora` (borda com traço), `dentro` (borda do rosto, sem traço) e `guias` (o kit gera os fios entre elas). Para um estilo novo, desenhe essas três coisas em `4-rosto.js` olhando a grade da bancada.
- Cabelos: `cabelo_curto`, `cabelo_cacheado`, `cabelo_longo`, `cabelo_ondulado`, `cabelo_coque`, `calvo`. Barbas: `barba_curta`, `barba_longa`, `cavanhaque`.
- Coberturas: `veu`, `pano_cabeca`, `faixa_cabeca`. Roupa extra: `manto` (himátion), `xale`, `colete`, `clavi` (listras), barra `linha`/`dupla`/`zigue`/`pontos`.
- Cores por parte (o que mais diferencia): `pele`, `roupa`, `roupa2` (detalhes, cinto, coberturas), `corCabelo`, `corManto`; paletas em `2-elenco.js`.

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
  mangas, túnica, corpo, altura, perfil do rosto, expressão e as cores de pele, roupa e cabelo. Numa mesma cena, nunca repita a seed;
  entre vídeos, comece de seeds diferentes (ex.: 100+, 200+...).
