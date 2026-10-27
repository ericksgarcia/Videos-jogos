# Catálogo Lottie do Luz da Palavra (varredura de out/2026)

Fonte: LottieFiles (licença **Lottie Simple**: uso comercial liberado, sem atribuição obrigatória, **proibido revender/redistribuir os arquivos**).
Por isso os JSON **não ficam no git**: só os ids abaixo. Para baixar tudo de uma vez:
`python luz-da-palavra/ferramentas/baixar_biblioteca_lottie.py` → `luz-da-palavra/identidade/lottie/<nome>.json`
(o `gerar.py` carrega essa pasta em todo vídeo do canal; `videos/<tema>/lottie/` tem prioridade).

Uso na cena (tema noite): `lottieEm(pg.g, "fogo", x, y, largura, altura, { ini: c.ini, fim: c.fim + 1, loop: true })`
e anime o `g` devolvido com GSAP (opacity, scale) se quiser entrada suave. Exemplo testado: `videos/teste-lottie/` (apagado; ver README).

**Como foi feita a varredura:** 53 buscas por tema (luz, fogo, pomba, cruz, água, plantas, céu, objetos bíblicos…), 12 prévias por busca, olhadas em folha de contato.
Só vi **prévias paradas**: a qualidade do movimento não foi conferida, exceto no fogo `54405` (testado em vídeo, ficou ótimo).
O catálogo é em sua maioria de **ícones de aplicativo, mascotes e ilustrações corporativas**. Poucas coisas servem ao canal. Não há cenas bíblicas
prontas, nem anjos, nem Jesus, nem cruz cristã (a busca "cross" só devolve botões de "fechar"). Pessoas rezando são quase todas com imagem de outra fé: **não usar**.

## Recomendados (nome → id) — estilo coerente com o tema noite

| Uso | nome → id |
|---|---|
| **Fogo** (o melhor achado) | `fogo` 54405 (lenha + brilho, testado) · `fogueira_noite` 139587 (cena noturna vertical com montanhas e estrelas) · `fogueira_chama` 114252 · `fogueira_simples` 36316 · `chama_brasas` 1525430 (chama com brasas, fundo escuro) |
| **Vela / luz** | `vela_real` 100552 · `vela_brilho` 28802 · `luz_estrela` 135839 (explosão de luz dourada) · `raios_luz` 83683 (raios verticais, gradiente) |
| **Brilhos e estrelas** | `brilho_dourado` 38319 · `estrelas_ouro` 1036798 · `estrelas_ouro2` 89463 · `estrela_simples` 1902 |
| **Céu** | `lua_estrelas` 74927 · `lua_azul` 148443 · `lua_nuvem` 101279 · `ceu_noite` 1507775 (vertical) · `sol` 114460 · `nascer_sol` 17806 |
| **Tempo** | `chuva` 16477 · `chuva2` 91475 · `folhas_vento` 93405 · `folhas` 1027728 |
| **Natureza / plantas** | `broto` 41474 · `broto_terra` 30875 · `arvore` 72702 · `oliva` 117908 (ramo com azeitonas) |
| **Mar** | `barco` 28125 · `barco_pesca` 144160 · `veleiro` 7961 · `peixe` 91084 |
| **Livro / escrita** | `biblia` 108176 (livro marrom com cruz) · `livro_aberto` 1038881 · `livro_raios` 87784 · `caneta` 1028069 · `carta_antiga` 1512508 (envelope antigo selado) |
| **Espera / tempo** | `ampulheta` 119400 · `ampulheta2` 28757 · `relogio` 18528 |
| **Caminho** | `porta` 94725 · `chave` 39031 · `pegadas` 1025715 |
| **Emoção** | `gota` 135666 (lágrima) · `coracao_particulas` 1504849 · `coracoes` 26329 |
| **Símbolos** | `pomba_cinza` 108190 (silhueta cinza) · `pomba_ramo` 1050007 (linha preta com ramo) · `pomba_origami` 1520284 · `igreja_linha` 113012 · `escudo` 112796 (Ef 6) · `borboleta` 140315 (transformação) |
| **Mãos / lugares** | `maos_orando` 1026664 (🙏 emoji com raios) · `maos_abertas` 1028730 · `deserto_noite` 148102 · `deserto_noite_v` 42995 · `montanhas` 1030843 |

## Evitar
- **Pessoas e "praying"**: imagem muçulmana (mesquita, véu, tapete) ou ilustração de escritório. Pessoas continuam sendo desenhadas por nós.
- Qualquer coisa com texto em inglês, mascotes sorridentes (estrelinha feliz, ovelha de desenho infantil) e ícones de app.
- O catálogo "cross" (só botões X), "crown" (jogos), "angel wings" (corações com asas), "bread" (pão de forma): não servem.
- Animações que o `baixar` recusa (usam imagens externas) ou com fundo sólido (o `baixar` tira o fundo, mas confira a cena).

## Limites do que dá para fazer com isso
- Dá para compor cenas com **cenário animado** (fogo, luz, noite, mar, plantas) e símbolos; as **pessoas** seguem sendo nossas (rabisco ou `figura()`).
- Para o personagem não destoar do cenário colorido, ele precisa de **cor de preenchimento e contorno mais forte** (hoje é só contorno de luz).
- Cada Lottie tem estilo próprio: misture no máximo 2 estilos por cena e recolora com `baixar ... --paleta` se destoar da paleta azul-noite/ouro.
- Buscas que ainda valem tentar: "light shine", "glow", "golden particles", "water ripple", "fog", "lantern", "torch", "bonfire", "oil", "grapes", "wine", "stairs", "bridge", "tent", "well".
