// Cenas do vídeo "O que faz cada cargo político".
// Cada função CENAS.<tipo>(el, c, B) desenha e anima uma cena do roteiro:
//   el = <g> da cena (SVG 1080x1920), c = dados da cena (ini, voz, fim, batidas),
//   B(evento, fração) = instante da batida (ou fração da fala, se não houver).
// Usa a biblioteca de desenhos e animações de template.html.

// ---------- desenhos deste tema ----------
const ICONE = {
  saude: `<rect x="-12" y="-36" width="24" height="72" rx="6" fill="${C.vermelho}"/><rect x="-36" y="-12" width="72" height="24" rx="6" fill="${C.vermelho}"/>`,
  escola: `<path d="M0 -22 C -14 -32 -30 -32 -40 -26 V 30 C -30 24 -14 24 0 32z" fill="${C.azul}"/><path d="M0 -22 C 14 -32 30 -32 40 -26 V 30 C 30 24 14 24 0 32z" fill="#1f86c9"/><path d="M-30 -14 h18 M-30 -2 h18 M14 -14 h18 M14 -2 h18" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`,
  lixo: `<rect x="-26" y="-18" width="52" height="56" rx="7" fill="${C.verde}"/><rect x="-34" y="-30" width="68" height="11" rx="5" fill="#049e77"/><rect x="-10" y="-40" width="20" height="9" rx="4" fill="#049e77"/><path d="M-10 -6 v32 M10 -6 v32" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.7"/>`,
  buraco: `<path d="M0 -40 L 24 30 H -24z" fill="${C.laranja}"/><path d="M-9 -12 h18 M-16 8 h32" stroke="#fff" stroke-width="7"/><rect x="-36" y="28" width="72" height="11" rx="4" fill="#c25a1c"/>`,
  onibus: `<rect x="-42" y="-30" width="84" height="56" rx="12" fill="${C.amarelo}"/><rect x="-34" y="-22" width="68" height="22" rx="5" fill="#9fe6ff"/><rect x="-42" y="6" width="84" height="6" fill="#e0a83a"/><circle cx="-22" cy="28" r="9" fill="#141a3a"/><circle cx="22" cy="28" r="9" fill="#141a3a"/>`,
  policia: `<path d="M0 -42 L 34 -28 V 2 C 34 24 16 36 0 42 C -16 36 -34 24 -34 2 V -28z" fill="#3a5bd9"/><path d="M0 -20 L 6 -6 L 21 -6 L 9 4 L 13 19 L 0 10 L -13 19 L -9 4 L -21 -6 L -6 -6z" fill="#fff"/>`,
  hospital: `<rect x="-38" y="-38" width="76" height="76" rx="14" fill="${C.vermelho}"/><text class="rot" y="20" text-anchor="middle" font-size="58" fill="#fff">H</text>`,
  ensino: `<path d="M-46 -8 L 0 -28 L 46 -8 L 0 12z" fill="#1b1f3b"/><path d="M-26 2 V 22 C -12 32 12 32 26 22 V 2 L 0 12z" fill="#3b4377"/><path d="M38 -5 V 22" stroke="${C.amarelo}" stroke-width="4"/><circle cx="38" cy="25" r="5" fill="${C.amarelo}"/>`,
  estrada: `<path d="M-14 -40 H 14 L 42 40 H -42z" fill="#56618a"/><path d="M0 -34 V -20 M0 -8 V 8 M0 20 V 38" stroke="${C.amarelo}" stroke-width="5"/>`,
  economia: `<circle r="40" fill="${C.amarelo}"/><circle r="32" fill="none" stroke="#e0a83a" stroke-width="4"/><text class="rot" y="19" text-anchor="middle" font-size="54" fill="#8a5a1c">R$</text>`.replace('font-size="54"', 'font-size="36"').replace('y="19"', 'y="13"'),
  globo: `<circle r="40" fill="${C.azul}"/><ellipse rx="16" ry="40" fill="none" stroke="#fff" stroke-width="4"/><path d="M-40 0 H 40 M-34 -20 H 34 M-34 20 H 34" stroke="#fff" stroke-width="4"/>`,
  forcas: `<path d="M0 -42 L 34 -28 V 2 C 34 24 16 36 0 42 C -16 36 -34 24 -34 2 V -28z" fill="#4f6b3a"/><path d="M0 -22 L 6 -8 L 21 -8 L 9 2 L 13 17 L 0 8 L -13 17 L -9 2 L -21 -8 L -6 -8z" fill="${C.amarelo}"/>`,
};
// medalhão com ícone e nome embaixo
const medalha = (ic, cor, txt) => `<circle r="76" fill="rgba(6,10,30,0.45)"/><circle r="66" fill="#fff"/><circle r="66" fill="none" stroke="${cor}" stroke-width="8"/>${ICONE[ic]}
  <text class="rot" y="116" text-anchor="middle" font-size="32" fill="#fff" stroke="rgba(6,10,30,0.85)" stroke-width="9" paint-order="stroke">${txt}</text>`;
// rótulo com uma linha explicativa embaixo
const etiqueta = (t1, cor, t2) => `${rotulo(t1, cor, 40)}${t2 ? `<rect x="${-(t2.length * 16 + 40) / 2}" y="44" width="${t2.length * 16 + 40}" height="50" rx="25" fill="rgba(6,10,30,0.8)"/><text class="rotm" y="78" text-anchor="middle" font-size="28" fill="#fff">${t2}</text>` : ""}`;
const bandeira = (s) => `<g transform="scale(${s || 1})"><rect width="104" height="72" fill="#009c3b"/><path d="M52 9 L 95 36 L 52 63 L 9 36z" fill="#ffdf00"/><circle cx="52" cy="36" r="16" fill="#002776"/></g>`;
// prédio público clássico (base no y=0): colunas, frontão, cúpula opcional, placa e bandeira
const palacio = (w, h, cor, placa, o) => {
  o = o || {};
  const n = Math.max(3, Math.floor(w / 72));
  const cols = Array.from({ length: n }, (_, k) => `<rect x="${-w / 2 + 26 + (k * (w - 74)) / (n - 1)}" y="${-h + 70}" width="22" height="${h - 110}" rx="4" fill="#fff" opacity="0.9"/>`).join("");
  return `${o.cupula ? `<path d="M-80 ${-h - 40} C -80 ${-h - 170}, 80 ${-h - 170}, 80 ${-h - 40}z" fill="url(#metal)"/><rect x="-6" y="${-h - 200}" width="12" height="40" fill="#c7cde6"/>` : ""}
    ${o.mastro !== false ? `<rect x="${w / 2 - 30}" y="${-h - 230}" width="6" height="230" fill="#c7cde6"/><g transform="translate(${w / 2 - 24} ${-h - 228})">${bandeira(0.9)}</g>` : ""}
    ${sombra(0, 6, w * 0.62, 18, 0.6)}
    <rect x="${-w / 2 - 24}" y="-22" width="${w + 48}" height="22" fill="#c9d0e6"/><rect x="${-w / 2 - 12}" y="-40" width="${w + 24}" height="18" fill="#dfe4f7"/>
    <rect x="${-w / 2}" y="${-h + 34}" width="${w}" height="${h - 74}" fill="${cor}"/>
    <rect x="${-w / 2}" y="${-h + 34}" width="${w}" height="${h - 74}" fill="url(#sombraV)" opacity="0.35"/>
    ${cols}<rect x="-40" y="-150" width="80" height="110" rx="40" fill="#2a3566" opacity="0.85"/>
    <rect x="${-w / 2 - 14}" y="${-h}" width="${w + 28}" height="38" fill="#f6f2ea"/>
    <path d="M${-w / 2 - 14} ${-h} L 0 ${-h - 92} L ${w / 2 + 14} ${-h}z" fill="#f6f2ea"/><path d="M${-w / 2 + 30} ${-h - 8} L 0 ${-h - 74} L ${w / 2 - 30} ${-h - 8}z" fill="${cor}" opacity="0.6"/>
    <text class="rot" y="${-h + 27}" text-anchor="middle" font-size="24" letter-spacing="2" fill="#3a3f6e">${placa}</text>`;
};
// prédio moderno de vidro (base no y=0)
const moderno = (w, h, placa) => `${sombra(0, 6, w * 0.6, 16, 0.6)}<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="6" fill="url(#painel)"/>
  ${Array.from({ length: Math.floor(h / 60) }, (_, r) => Array.from({ length: Math.floor(w / 60) }, (_, q) => `<rect x="${-w / 2 + 14 + q * 60}" y="${-h + 20 + r * 60}" width="44" height="40" rx="4" fill="#9fc4ff" opacity="${0.25 + ((r * 7 + q * 3) % 5) * 0.12}"/>`).join("")).join("")}
  <rect x="${-w / 2 - 10}" y="${-h - 54}" width="${w + 20}" height="54" rx="6" fill="#dfe4f7"/><text class="rot" y="${-h - 18}" text-anchor="middle" font-size="22" letter-spacing="1" fill="#3a3f6e">${placa}</text>`;
const lupa = (cor) => `<circle r="46" fill="rgba(143,227,255,0.18)" stroke="${cor || "#fff"}" stroke-width="12"/><rect x="34" y="30" width="22" height="70" rx="11" fill="${cor || "#fff"}" transform="rotate(-45 45 65)"/>`;
const documento = (titulo, cor) => `${sombra(0, 180, 140, 16, 0.6)}<rect x="-130" y="-170" width="260" height="340" rx="16" fill="url(#papel)"/><rect x="-130" y="-170" width="260" height="62" rx="16" fill="${cor || "#8a5a2c"}"/><rect x="-130" y="-124" width="260" height="16" fill="${cor || "#8a5a2c"}"/>
  <text class="rot" y="-126" text-anchor="middle" font-size="30" fill="#fff">${titulo}</text>${[0, 1, 2, 3, 4, 5].map((k) => `<rect x="-96" y="${-80 + k * 36}" width="${k % 3 === 2 ? 120 : 192}" height="12" rx="6" fill="#b39a74"/>`).join("")}`;
const carimbo = (txt, cor) => { const w = txt.length * 30 + 50; return `<g transform="rotate(-12)"><rect x="${-w / 2}" y="-40" width="${w}" height="80" rx="12" fill="none" stroke="${cor}" stroke-width="8"/><text class="rot" y="17" text-anchor="middle" font-size="48" fill="${cor}">${txt}</text></g>`; };
const check = (cor) => `<circle r="34" fill="${cor || C.verde}"/><path d="M-15 1 l 10 11 l 20 -22" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>`;
const xis = () => `<circle r="44" fill="${C.vermelho}"/><path d="M-18 -18 L 18 18 M18 -18 L -18 18" stroke="#fff" stroke-width="10" stroke-linecap="round"/>`;
// seta tracejada com ponta, de (x0,y0) a (x1,y1) passando por cima
const seta = (x0, y0, x1, y1, cor, cls) => { const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 90; const a = Math.atan2(y1 - my, x1 - mx) * 180 / Math.PI;
  return `<g class="${cls || "seta"}"><path class="sl" d="M${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}" fill="none" stroke="${cor}" stroke-width="7" stroke-dasharray="16 12" stroke-linecap="round"/><path d="M0 0 L -30 -16 L -30 16z" fill="${cor}" transform="translate(${x1} ${y1}) rotate(${a})"/></g>`; };
// Congresso Nacional (Brasília), base no y=0 com centro em x=0
const congresso = () => `${sombra(0, 4, 470, 20, 0.6)}
  <rect x="-40" y="-560" width="34" height="520" fill="url(#concretoV)"/><rect x="6" y="-560" width="34" height="520" fill="url(#concretoV)"/><rect x="-40" y="-330" width="80" height="18" fill="#dfe4f7"/>
  ${Array.from({ length: 9 }, (_, k) => `<rect x="-36" y="${-540 + k * 56}" width="26" height="6" fill="#7b86a8" opacity="0.5"/><rect x="10" y="${-540 + k * 56}" width="26" height="6" fill="#7b86a8" opacity="0.5"/>`).join("")}
  <rect x="-430" y="-48" width="860" height="48" fill="url(#concreto)"/><rect x="-430" y="-48" width="860" height="8" fill="#eef1ff"/>
  <path d="M-380 -48 L -560 40 H -500 L -330 -48z" fill="#aab4d6"/>
  <g class="bacia"><path d="M-370 -98 C -350 -48, -280 -48, -210 -48 C -140 -48, -70 -48, -50 -98 Z" fill="url(#concreto)"/><ellipse cx="-210" cy="-98" rx="160" ry="20" fill="#eef1ff"/><ellipse cx="-210" cy="-96" rx="140" ry="13" fill="#9aa7c7"/></g>
  <g class="cupula"><path d="M110 -48 C 120 -150, 330 -150, 340 -48 Z" fill="url(#concreto)"/><path d="M140 -70 C 160 -128, 230 -136, 260 -128" fill="none" stroke="#fff" stroke-width="6" opacity="0.5" stroke-linecap="round"/></g>`;
// Palácio do Planalto, base no y=0 com centro em x=0
const planalto = () => { const cols = Array.from({ length: 11 }, (_, k) => { const x = -410 + k * 82; return `<path d="M${x} 0 C ${x - 18} -34, ${x - 18} -70, ${x} -102 C ${x + 18} -70, ${x + 18} -34, ${x} 0" fill="#fff"/>`; }).join("");
  return `${sombra(0, 6, 520, 20, 0.6)}<rect x="-470" y="-130" width="940" height="28" fill="#eef1ff"/><rect x="-430" y="-102" width="860" height="86" fill="url(#vidro)"/>
  ${Array.from({ length: 14 }, (_, k) => `<rect x="${-420 + k * 61}" y="-98" width="3" height="80" fill="#cfe0ff" opacity="0.35"/>`).join("")}
  <path d="M-360 -94 L -240 -94 L -330 -20 H -450z" fill="#fff" opacity="0.08"/>${cols}
  <rect x="-480" y="0" width="960" height="14" fill="#c9d0e6"/><path d="M-470 -16 H -230 V -4 L -520 50 H -580z" fill="#dfe4f7"/>`; };
// contorno do Brasil (lon, lat) projetado num quadrado de lado `tam`
const BR = [[-73.9, -7.4], [-72.9, -5.0], [-70.0, -4.2], [-69.4, -1.0], [-69.8, 1.7], [-67.0, 1.9], [-66.0, 0.8], [-64.0, 2.0], [-64.8, 4.0], [-62.0, 4.2], [-60.8, 5.2], [-59.6, 1.8], [-56.5, 1.9], [-54.0, 2.2], [-51.6, 4.2], [-50.0, 1.7], [-49.0, -0.5], [-47.5, -0.6], [-44.5, -2.5], [-41.5, -2.9], [-38.5, -3.7], [-35.2, -5.5], [-34.8, -7.5], [-35.5, -9.5], [-38.5, -13.0], [-39.0, -17.5], [-40.0, -20.0], [-41.0, -22.0], [-43.2, -23.0], [-46.5, -24.0], [-48.5, -26.0], [-48.8, -28.5], [-50.5, -30.5], [-52.5, -33.7], [-53.5, -33.0], [-55.5, -31.0], [-57.6, -30.2], [-55.7, -27.4], [-53.8, -27.1], [-53.6, -26.0], [-54.6, -25.6], [-54.3, -24.0], [-55.8, -22.3], [-57.8, -22.1], [-58.1, -20.2], [-57.5, -18.0], [-58.4, -16.3], [-60.2, -16.2], [-60.5, -13.8], [-62.5, -13.0], [-65.4, -11.0], [-66.6, -9.9], [-69.5, -11.0], [-70.6, -11.0], [-70.5, -9.5], [-72.5, -9.6]];
const brasil = (tam, cor, cls) => `<path class="${cls || "br"}" d="M${BR.map(([lo, la]) => `${(((lo + 74) / 39.5) * tam - tam / 2).toFixed(1)} ${(((5.5 - la) / 39.5) * tam - tam / 2).toFixed(1)}`).join(" L ")}Z" fill="${cor}" stroke-linejoin="round"/>`;
const DEFS_TEMA = `<defs>
  <linearGradient id="sombraV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.6"/></linearGradient>
  <linearGradient id="concretoV" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#eef1ff"/><stop offset="1" stop-color="#9aa7c7"/></linearGradient>
  <linearGradient id="vidro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2c4a9a"/><stop offset="1" stop-color="#101c4a"/></linearGradient>
  <linearGradient id="predioG" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e9d9c6"/><stop offset="1" stop-color="#b9a08a"/></linearGradient>
  <linearGradient id="ceuOuro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a3b8f"/><stop offset="0.55" stop-color="#7a5fb0"/><stop offset="0.85" stop-color="#f08a6a"/><stop offset="1" stop-color="#ffc27a"/></linearGradient>
  <linearGradient id="plenarioV" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c2a2a"/><stop offset="1" stop-color="#061616"/></linearGradient>
  <linearGradient id="plenarioA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1d55"/><stop offset="1" stop-color="#070d2a"/></linearGradient></defs>`;
// medalhões que surgem num arco, com linha tracejada até o "dono" (prédio)
function medalhas(pai, itens, B, origem) {
  pai.insertAdjacentHTML("beforeend", itens.map(([ic, cor, txt, x, y]) => `<path class="liga" d="M${origem[0]} ${origem[1]} L ${x} ${y + 70}" stroke="rgba(255,255,255,0.45)" stroke-width="4" stroke-dasharray="10 10" opacity="0"/>`).join("") +
    itens.map(([ic, cor, txt, x, y]) => P(x, y, 1, "med", medalha(ic, cor, txt))).join(""));
  const meds = $$(".med", pai), ligas = $$(".liga", pai);
  itens.forEach((it, k) => {
    const t = B(it[5], 0.3 + k * 0.1);
    tl.set(meds[k], { opacity: 0 }, 0);
    pop(meds[k], t);
    tl.set(ligas[k], { opacity: 1 }, t);
    desenhar(ligas[k], t, 0.35);
  });
  return [...meds, ...ligas];
}

// =============== 1. gancho: a urna ===============
CENAS.urna = (el, c, B) => {
  mostrarGancho(B("titulo", 0.85) - 0.2);
  const cargos = [["VEREADOR", C.verde, 230, 650], ["PREFEITO", C.amarelo, 540, 650], ["DEPUTADO", C.azul, 850, 650], ["SENADOR", C.rosa, 370, 780], ["PRESIDENTE", C.laranja, 710, 780]];
  const teclas = [];
  for (let r = 0; r < 4; r++) for (let q = 0; q < 3; q++) teclas.push(`<rect x="${588 + q * 38}" y="${1004 + r * 26}" width="30" height="18" rx="5" fill="#2a2a33"/>`);
  el.innerHTML = `${DEFS_TEMA}
    <rect width="${W}" height="${H}" fill="url(#parede)"/>
    <g><rect x="740" y="540" width="290" height="380" rx="14" fill="url(#ceuDia)" stroke="#2e3a75" stroke-width="16"/>${nuvem(860, 640, 0.5, 0.7)}<line x1="885" y1="540" x2="885" y2="920" stroke="#2e3a75" stroke-width="10"/><line x1="740" y1="730" x2="1030" y2="730" stroke="#2e3a75" stroke-width="10"/></g>
    <polygon points="740,540 1030,540 760,1300 180,1300" fill="url(#cone)" opacity="0.45"/>
    <g><rect x="50" y="830" width="420" height="250" rx="10" fill="#1f4a3a" stroke="#8a5a3c" stroke-width="14"/><text class="rotm" x="80" y="900" font-size="34" fill="#e8f0e8" opacity="0.85">SEÇÃO 042</text><text class="rotm" x="80" y="950" font-size="28" fill="#e8f0e8" opacity="0.6">ZONA ELEITORAL 17</text><path d="M80 1000 h260" stroke="#e8f0e8" stroke-width="3" opacity="0.4"/></g>
    <rect y="1290" width="${W}" height="630" fill="url(#piso)"/>
    ${sombra(540, 1300, 380, 26, 0.7)}
    <rect x="250" y="1150" width="580" height="32" rx="6" fill="url(#madeira)"/><rect x="280" y="1182" width="22" height="110" fill="#4f301f"/><rect x="778" y="1182" width="22" height="110" fill="#4f301f"/>
    <path d="M300 1150 L 330 860 H 750 L 780 1150z" fill="#d8ccb0"/><path d="M330 860 L 300 1150 M750 860 L 780 1150" stroke="#b8a888" stroke-width="6"/><path d="M420 860 V 1150 M660 860 V 1150" stroke="#c7b998" stroke-width="3"/>
    <g transform="translate(540 1150)"><g class="urnaG">
      <path d="M-190 0 L -170 -180 H 170 L 190 0z" fill="#ece5d2"/><path d="M-170 -180 H 170 L 160 -196 H -160z" fill="#fbf7ea"/><path d="M150 -180 L 190 0 H 150z" fill="#c9bfa4"/>
      <rect class="tela" x="-150" y="-158" width="170" height="112" rx="8" fill="#1d2a55"/>
      ${cargos.map(([n], k) => `<text class="tt rot" x="-65" y="-92" text-anchor="middle" font-size="24" fill="#1b1f3b" opacity="0">${n}</text>`).join("")}
      <text class="tt0 rotm" x="-65" y="-70" text-anchor="middle" font-size="18" fill="#1b1f3b" opacity="0">CONFIRA SEU VOTO</text>
      <g transform="translate(-540 -1150)">${teclas.join("")}<rect x="582" y="1112" width="36" height="20" rx="5" fill="#fff"/><rect x="622" y="1112" width="36" height="20" rx="5" fill="${C.laranja}"/><rect class="confirma" x="662" y="1108" width="46" height="26" rx="6" fill="#18a558"/></g>
      <text class="rotm" x="-120" y="-20" font-size="16" fill="#8a8068">JUSTIÇA ELEITORAL</text>
    </g></g>
    <g class="poeiraU"></g>
    ${cargos.map(([n, cor, x, y]) => P(x, y, 1, "cargo", `${rotulo(n, cor, 38)}<g transform="translate(${(n.length * 38 * 0.6 + 52) / 2 + 14} -34)"><g class="q"><circle r="28" fill="#fff" stroke="#141a3a" stroke-width="4"/><text class="rot" y="13" text-anchor="middle" font-size="38" fill="#141a3a">?</text></g></g>`)).join("")}`;
  surge($(".urnaG", el), c.ini + 0.15, 120);
  poeira($(".poeiraU", el), 34, 41, [300, 600, 600, 650], c.ini, c.fim, "#ffe9a0");
  const tu = B("urna", 0.1);
  tl.to($(".tela", el), { attr: { fill: "#e6f2ff" }, duration: 0.25 }, tu);
  tl.to($(".tt0", el), { opacity: 1, duration: 0.2 }, tu);
  const cards = $$(".cargo", el), tts = $$(".tt", el);
  tl.set(cards, { opacity: 0 }, 0);
  tl.set($$(".q", el), { opacity: 0 }, 0);
  cargos.forEach(([n, cor, x, y], k) => {
    const t = B("c" + (k + 1), 0.25 + k * 0.08);
    tl.set(tts, { opacity: 0 }, t);
    tl.set(tts[k], { opacity: 1 }, t);
    tl.fromTo($(".confirma", el), { attr: { fill: "#5fe39a" } }, { attr: { fill: "#18a558" }, duration: 0.3, immediateRender: false }, t);
    tl.fromTo(cards[k], { x: 475 - x, y: 1060 - y, scale: 0.15, opacity: 0, transformOrigin: "50% 50%" }, { x: 0, y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.4)", immediateRender: false }, t);
  });
  const tq = B("pergunta", 0.65);
  $$(".q", el).forEach((q, k) => pop(q, tq + k * 0.07));
  cards.forEach((cd, k) => tl.fromTo(cd, { rotation: 0 }, { rotation: k % 2 ? 4 : -4, duration: 0.5, yoyo: true, repeat: 3, ease: "sine.inOut", transformOrigin: "50% 50%", immediateRender: false }, tq));
};

// =============== 2. o condomínio: assembleia x síndico ===============
CENAS.condominio = (el, c, B) => {
  const janelas = [];
  for (let r = 0; r < 4; r++) for (let q = 0; q < 5; q++) janelas.push(`<rect class="jan" x="${160 + q * 124}" y="${420 + r * 140}" width="84" height="100" rx="8" fill="#2a3566"/>`);
  el.innerHTML = `${DEFS_TEMA}
    <rect width="${W}" height="${H}" fill="url(#ceuCrep)"/>${estrelas(40, 52, 0, 500)}
    <path d="M0 1080 C 300 1040, 700 1070, 1080 1030 V 1300 H 0z" fill="#2a2c6a"/>
    <g transform="translate(460 1300)"><g class="predio">
      <g transform="translate(-460 -1300)">
        <rect x="110" y="380" width="700" height="640" fill="url(#predioG)"/><rect x="100" y="364" width="720" height="22" fill="#f6efe4"/>${janelas.join("")}
        <rect x="110" y="1000" width="700" height="20" fill="#f6efe4"/>
        <rect x="110" y="1020" width="700" height="280" fill="#efe3d3"/>
      </g>
    </g></g>
    <g class="salao" opacity="0">
      <rect x="135" y="1036" width="650" height="250" rx="10" fill="url(#paredeQ)" stroke="#c9b8a6" stroke-width="8"/>
      ${halo(330, 1060, 240, "luzS")}
      <line x1="330" y1="1036" x2="330" y2="1064" stroke="#c9b8a6" stroke-width="4"/><circle cx="330" cy="1072" r="12" fill="#ffe066"/>
      <g transform="translate(640 1150) scale(0.42)"><g class="regras">${documento("REGRAS", C.azul).replace(/<ellipse[^>]*>/, "")}</g></g>
      ${[0, 1, 2, 3].map((k) => P(190 + k * 80, 1262, 0.55, "sent", gente(k + 1))).join("")}
      <rect x="160" y="1206" width="340" height="22" rx="5" fill="url(#madeira)"/><rect x="170" y="1228" width="320" height="50" fill="#4f301f" opacity="0.6"/>
    </g>
    <rect y="1300" width="${W}" height="40" fill="#3a3f6e"/><rect y="1340" width="${W}" height="580" fill="#141a3a"/>
    ${P(930, 1316, 1.0, "sindico", gente(2, { prancheta: true }))}
    <g transform="translate(800 1130)"><g class="lampP"><rect x="-6" y="-10" width="12" height="40" fill="#c7cde6"/><circle class="luzP" r="16" fill="#5a6290"/></g></g>
    ${halo(800, 1120, 120, "haloP")}
    ${P(460, 300 + 640, 1, "etqL", etiqueta("LEGISLATIVO", C.azul, "faz as leis e fiscaliza"))}
    ${P(930, 1010, 1, "etqE", etiqueta("EXECUTIVO", C.amarelo, "executa"))}`;
  const predio = $(".predio", el), salao = $(".salao", el);
  tl.fromTo(predio, { scaleY: 0.2, opacity: 0, transformOrigin: "50% 100%" }, { scaleY: 1, opacity: 1, duration: 0.8, ease: "power3.out", immediateRender: false }, c.ini + 0.1);
  const tp = B("predio", 0.1);
  $$(".jan", el).forEach((j, k) => tl.to(j, { attr: { fill: k % 3 ? "#ffd98a" : "#ffe9b0" }, duration: 0.15 }, tp + ((k * 7) % 20) * 0.04));
  const ta = B("assembleia", 0.25);
  tl.fromTo(salao, { opacity: 0 }, { opacity: 1, duration: 0.5, immediateRender: false }, ta);
  $$(".sent", el).forEach((p, k) => tl.fromTo(p, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(2)", immediateRender: false }, ta + 0.2 + k * 0.08));
  tl.set($(".regras", el), { opacity: 0 }, 0);
  pop($(".regras", el), B("regras", 0.35));
  const ts = B("sindico", 0.5);
  tl.set([$(".sindico", el), $(".etqL", el), $(".etqE", el), $(".haloP", el)], { opacity: 0 }, 0);
  tl.fromTo($(".sindico", el), { x: 200, opacity: 0 }, { x: 0, opacity: 1, duration: 0.6, ease: "power3.out", immediateRender: false }, ts);
  const tf = B("faz", 0.6);
  $$(".checks path", el).forEach((p, k) => desenhar(p, tf + k * 0.15, 0.25));
  tl.to($(".luzP", el), { attr: { fill: "#ffe066" }, duration: 0.2 }, tf + 0.3);
  tl.fromTo($(".haloP", el), { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, tf + 0.3);
  pop($(".etqL", el), B("legislativo", 0.8));
  pop($(".etqE", el), B("executivo", 0.92));
};

// =============== 3. três andares ===============
CENAS.andares = (el, c, B) => {
  const andares = [["CIDADE", 1030, C.verde], ["ESTADO", 750, C.laranja], ["PAÍS", 470, C.rosa]];
  const andar = ([nome, y, cor], k) => `<g class="andar" data-k="${k}">
      <rect x="130" y="${y}" width="820" height="260" fill="#16205a" stroke="#3d4fa8" stroke-width="6"/>
      <rect class="salaL" x="150" y="${y + 18}" width="480" height="224" rx="10" fill="#22306c" stroke="${C.azul}" stroke-width="0"/>
      <rect class="salaE" x="650" y="${y + 18}" width="280" height="224" rx="10" fill="#22306c" stroke="${C.amarelo}" stroke-width="0"/>
      ${k === 2 ? `<g transform="translate(400 ${y + 120}) scale(0.9)" opacity="0.18">${brasil(220, "#fff")}</g>` : ""}
      ${[0, 1, 2, 3].map((q) => `<g transform="translate(${270 + q * 92} ${y + 232}) scale(0.5)">${gente(q + k * 4)}</g>`).join("")}
      <rect x="230" y="${y + 196}" width="360" height="18" rx="5" fill="url(#madeira)"/>
      <g transform="translate(790 ${y + 232}) scale(0.56)">${gente(k + 2, { gravata: C.vermelho })}</g>
      <rect x="700" y="${y + 186}" width="180" height="20" rx="5" fill="url(#madeira)"/>
      <g transform="translate(250 ${y + 54})">${rotulo(nome, cor, 30)}</g></g>`;
  el.innerHTML = `${DEFS_TEMA}<rect width="${W}" height="${H}" fill="url(#ceuNoite)"/>${estrelas(70, 61, 0, 1300)}
    <path d="M0 1300 V 1180 h60 v-80 h70 v120 h40 v-200 h60 v200 h900 v-60 h50 v-90 h40 v240z" fill="#0d1540"/>
    <rect y="1290" width="${W}" height="630" fill="#0b1236"/>
    <rect class="moldura" x="130" y="470" width="820" height="820" fill="none" stroke="#5a6cc8" stroke-width="6"/>
    ${andares.map(andar).join("")}
    <g transform="translate(390 410)"><g class="tagL">${rotulo("ASSEMBLEIA", C.azul, 32)}</g></g>
    <g transform="translate(790 410)"><g class="tagE">${rotulo("SÍNDICO", C.amarelo, 32)}</g></g>`;
  desenhar($(".moldura", el), B("andares", 0.1) - 0.2, 0.9);
  const as = $$(".andar", el);
  tl.set(as, { opacity: 0 }, 0);
  ["cidade", "estado", "pais"].forEach((b, k) => tl.fromTo(as[k], { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "bounce.out", immediateRender: false }, B(b, 0.3 + k * 0.12)));
  tl.set([$(".tagL", el), $(".tagE", el)], { opacity: 0 }, 0);
  const te = B("colExec", 0.75), tlg = B("colLeg", 0.9);
  pop($(".tagE", el), te);
  tl.to($$(".salaE", el), { attr: { "stroke-width": 7 }, fill: "#3a3a6a", duration: 0.3, stagger: 0.08 }, te);
  pop($(".tagL", el), tlg);
  tl.to($$(".salaL", el), { attr: { "stroke-width": 7 }, fill: "#25407a", duration: 0.3, stagger: 0.08 }, tlg);
};

// =============== 4. cidade: prefeito e vereadores ===============
CENAS.cidade = (el, c, B) => {
  const fundo = (x0) => Array.from({ length: 9 }, (_, k) => { const w = 110 + ((k * 37) % 60), h = 220 + ((k * 53) % 200); return `<rect x="${x0 + k * 125}" y="${1180 - h}" width="${w}" height="${h}" rx="6" fill="#a9c4e8" opacity="0.55"/>`; }).join("");
  el.innerHTML = `${DEFS_TEMA}<rect width="${W}" height="${H}" fill="url(#ceuDia)"/>${nuvem(220, 380, 0.9, 0.5)}${nuvem(820, 330, 0.7, 0.45)}
    <g class="cam" transform="translate(0 0) scale(1)">
      ${fundo(-40)}${fundo(1040)}
      <g transform="translate(540 1180)"><g class="prefeitura">${palacio(560, 300, "#f1e6d6", "PREFEITURA")}</g></g>
      <g transform="translate(1620 1180)"><g class="camaraM">${palacio(600, 290, "#dfe7f5", "CÂMARA MUNICIPAL", { cupula: true })}</g></g>
      <rect x="-200" y="1180" width="2560" height="32" fill="#c9d0e6"/><rect x="-200" y="1212" width="2560" height="260" fill="#3b3f5c"/><rect x="-200" y="1472" width="2560" height="1400" fill="#c9d0e6"/><rect x="-200" y="1500" width="2560" height="1400" fill="#5d6b8f"/>
      ${Array.from({ length: 20 }, (_, k) => `<rect x="${-160 + k * 130}" y="1312" width="70" height="10" rx="5" fill="#fff" opacity="0.7"/>`).join("")}
      <g class="buraco"><ellipse cx="840" cy="1350" rx="70" ry="20" fill="#1c1e30"/><ellipse cx="840" cy="1346" rx="56" ry="13" fill="#0e0f1a"/></g>
      <g transform="translate(-260 1300)"><g class="bus"><rect x="-150" y="-110" width="300" height="120" rx="20" fill="${C.amarelo}"/><rect x="-136" y="-96" width="250" height="46" rx="8" fill="#9fe6ff"/><rect x="-150" y="-30" width="300" height="12" fill="#e0a83a"/><circle cx="-90" cy="12" r="22" fill="#141a3a"/><circle cx="90" cy="12" r="22" fill="#141a3a"/></g></g>
      ${P(540, 1296, 1.05, "prefeito", gente(0, { gravata: C.vermelho }))}
      <g class="meds"></g>
      ${[0, 1, 2, 3, 4].map((k) => P(1400 + k * 110, 1296, 0.92, "ver", gente(k + 3, { gravata: [C.azul, C.verde, C.rosa, C.laranja, C.azul][k] }))).join("")}
      <g transform="translate(1620 560)"><g class="orc">${documento("ORÇAMENTO", C.verde)}<g transform="translate(40 80)"><g class="carOrc">${carimbo("APROVADO", C.verde)}</g></g></g></g>
    </g>
    <g class="olho" opacity="0">${seta(800, 720, 330, 720, C.ciano, "setaF")}<g transform="translate(565 610)"><g class="pillF">${rotulo("FISCALIZA", C.ciano, 36)}</g></g></g>
    <g transform="translate(410 1095)"><g class="xB">${xis()}</g></g>
    <g transform="translate(540 1220)"><g class="pillX">${rotulo("VEREADOR NÃO ASFALTA RUA", C.vermelho, 30)}</g></g>
    <g transform="translate(540 1220)"><g class="pillC">${rotulo("ELE COBRA O PREFEITO", C.verde, 30)}</g></g>`;
  const cam = $(".cam", el);
  tl.set([$(".prefeito", el), $(".orc", el), $(".carOrc", el), $(".xB", el), $(".pillX", el), $(".pillC", el), ...$$(".ver", el)], { opacity: 0 }, 0);
  surge($(".prefeitura", el), c.ini + 0.15, 80);
  $$(".nuvem", el).forEach((n, k) => tl.fromTo(n, { x: 0 }, { x: 100 + k * 40, duration: c.fim - c.ini, ease: "none", immediateRender: false }, c.ini));
  const tp = B("prefeito", 0.1);
  tl.fromTo($(".prefeito", el), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(2)", immediateRender: false }, tp);
  const itens = [["saude", C.vermelho, "SAÚDE", 170, 560, "saude"], ["escola", C.azul, "ESCOLA", 355, 450, "escola"], ["lixo", C.verde, "LIXO", 540, 410, "lixo"], ["buraco", C.laranja, "RUAS", 725, 450, "buraco"], ["onibus", C.amarelo, "ÔNIBUS", 910, 560, "onibus"]];
  const meds = medalhas($(".meds", el), itens, B, [540, 800]);
  tl.fromTo($(".buraco", el), { scale: 1 }, { scale: 1.25, duration: 0.25, yoyo: true, repeat: 1, svgOrigin: "840 1350", immediateRender: false }, B("buraco", 0.4));
  tl.fromTo($(".bus", el), { x: 0 }, { x: 3000, duration: 3.6, ease: "power1.in", immediateRender: false }, B("onibus", 0.45) - 0.4);
  // câmera anda até a Câmara Municipal
  const tc = B("camara", 0.5);
  tl.to(cam, { attr: { transform: "translate(-1080 0) scale(1)" }, duration: 1.2, ease: "power3.inOut" }, tc - 0.3);
  surge($(".camaraM", el), tc - 0.2, 60);
  $$(".ver", el).forEach((v, k) => tl.fromTo(v, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "back.out(2)", immediateRender: false }, B("vereadores", 0.6) + k * 0.08));
  const to = B("orcamento", 0.72);
  pop($(".orc", el), to - 0.3);
  tl.fromTo($(".carOrc", el), { scale: 2.4, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.3, ease: "power4.in", immediateRender: false }, to + 0.15);
  // plano aberto: a Câmara de olho na Prefeitura
  const tfz = B("fiscaliza", 0.8);
  tl.to(meds, { opacity: 0, duration: 0.3 }, tfz - 0.35);
  tl.to($(".orc", el), { opacity: 0, duration: 0.3 }, tfz + 0.4);
  tl.to(cam, { attr: { transform: "translate(0 430) scale(0.5)" }, duration: 1.0, ease: "power3.inOut" }, tfz - 0.3);
  tl.set($(".olho", el), { opacity: 1 }, tfz + 0.5);
  desenhar($(".setaF .sl", el), tfz + 0.5, 0.6);
  tl.fromTo($(".setaF path:last-child", el), { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, tfz + 1.0);
  pop($(".pillF", el), tfz + 0.6);
  const tn = B("naoasfalta", 0.9);
  pop($(".xB", el), tn);
  pop($(".pillX", el), tn + 0.1);
  const tcb = B("cobra", 0.95);
  tl.to($(".pillX", el), { opacity: 0, scale: 0.8, duration: 0.2 }, tcb - 0.1);
  pop($(".pillC", el), tcb);
  tl.fromTo($(".setaF .sl", el), { strokeWidth: 7 }, { strokeWidth: 12, duration: 0.2, yoyo: true, repeat: 3, immediateRender: false }, tcb);
};

// =============== 5. estado: governador e deputados estaduais ===============
CENAS.estado = (el, c, B) => {
  const estrada = "M640 1430 C 600 1250, 820 1120, 760 1000 S 700 920, 760 880";
  el.innerHTML = `${DEFS_TEMA}<rect width="${W}" height="${H}" fill="url(#ceuOuro)"/>
    ${halo(860, 860, 360, "solE")}<circle cx="860" cy="860" r="70" fill="url(#sol)"/>
    <path d="M0 900 C 220 840, 420 890, 620 850 S 940 830, 1080 870 V 1920 H 0z" fill="#4a5aa8"/>
    <path d="M0 960 C 300 900, 640 960, 1080 920 V 1920 H 0z" fill="#2f8f6a"/>
    <path d="M0 1060 C 300 1010, 700 1060, 1080 1020 V 1920 H 0z" fill="url(#grama)"/>
    <path class="estradaB" d="${estrada}" fill="none" stroke="#4b5170" stroke-width="80" stroke-linecap="round"/>
    <path class="estradaL" d="${estrada}" fill="none" stroke="${C.amarelo}" stroke-width="6" stroke-dasharray="26 22"/>
    <g class="viatura" opacity="0"><rect x="-40" y="-22" width="80" height="34" rx="10" fill="#fff"/><rect x="-40" y="-2" width="80" height="10" fill="#3a5bd9"/><rect class="sirene" x="-12" y="-32" width="24" height="10" rx="4" fill="${C.vermelho}"/></g>
    <g transform="translate(330 1170)"><g class="palacioG">${palacio(520, 280, "#f4efe6", "PALÁCIO DO GOVERNO")}</g></g>
    <g transform="translate(830 1170)"><g class="assem">${moderno(380, 420, "ASSEMBLEIA LEGISLATIVA")}</g></g>
    ${P(330, 1300, 1.05, "gov", gente(5, { gravata: C.azul }))}
    ${[0, 1, 2, 3].map((k) => P(700 + k * 88, 1300, 0.8, "dep", gente(k + 1, { gravata: [C.verde, C.rosa, C.laranja, C.azul][k] }))).join("")}
    <g class="meds"></g>
    <g class="olho" opacity="0">${seta(700, 700, 400, 760, C.ciano, "setaF")}<g transform="translate(560 590)"><g class="pillF">${rotulo("FISCALIZA", C.ciano, 36)}</g></g></g>
    <rect y="1380" width="${W}" height="540" fill="#16285a"/>`;
  tl.set([$(".gov", el), $(".assem", el), ...$$(".dep", el)], { opacity: 0 }, 0);
  surge($(".palacioG", el), c.ini + 0.15, 80);
  tl.fromTo($(".gov", el), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(2)", immediateRender: false }, B("governador", 0.1));
  const itens = [["policia", "#3a5bd9", "POLÍCIA", 180, 520, "policia"], ["hospital", C.vermelho, "HOSPITAIS", 420, 440, "hospital"], ["ensino", "#1b1f3b", "ENSINO MÉDIO", 660, 440, "ensino"], ["estrada", "#56618a", "ESTRADAS", 900, 520, "estradas"]];
  const meds = medalhas($(".meds", el), itens, B, [330, 800]);
  const tpo = B("policia", 0.3);
  tl.set($(".viatura", el), { opacity: 1 }, tpo);
  const est = $(".estradaB", el);
  tl.fromTo($(".viatura", el), { motionPath: { path: est, align: est, alignOrigin: [0.5, 0.5], autoRotate: false, start: 1, end: 1 } }, { motionPath: { path: est, align: est, alignOrigin: [0.5, 0.5], autoRotate: false, start: 1, end: 0 }, duration: 4, ease: "none", immediateRender: false }, tpo);
  tl.fromTo($(".sirene", el), { attr: { fill: C.vermelho } }, { attr: { fill: "#3a8bff" }, duration: 0.2, yoyo: true, repeat: 18, immediateRender: false }, tpo);
  tl.fromTo($(".estradaL", el), { strokeDashoffset: 0 }, { strokeDashoffset: -480, duration: 3, ease: "none", immediateRender: false }, B("estradas", 0.6));
  const ta = B("assembleia", 0.7);
  tl.to(meds, { opacity: 0, duration: 0.3 }, ta - 0.4);
  tl.fromTo($(".assem", el), { x: 300, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, ease: "power3.out", immediateRender: false }, ta - 0.2);
  $$(".dep", el).forEach((d, k) => tl.fromTo(d, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: "back.out(2)", immediateRender: false }, B("deputados", 0.8) + k * 0.08));
  const tf = B("fiscaliza", 0.92);
  tl.set($(".olho", el), { opacity: 1 }, tf);
  desenhar($(".setaF .sl", el), tf, 0.6);
  tl.fromTo($(".setaF path:last-child", el), { opacity: 0 }, { opacity: 1, duration: 0.2, immediateRender: false }, tf + 0.5);
  pop($(".pillF", el), tf + 0.1);
};

// =============== 6. Congresso e Câmara dos Deputados ===============
CENAS.camara = (el, c, B) => {
  // 513 cadeiras em semicírculo, ordenadas da esquerda para a direita
  const cx = 540, cy = 1190, an = 12, rs = Array.from({ length: an }, (_, i) => 200 + (i * 300) / (an - 1));
  const soma = rs.reduce((a, b) => a + b, 0);
  let ns = rs.map((r) => Math.round((513 * r) / soma)); ns[an - 1] += 513 - ns.reduce((a, b) => a + b, 0);
  const cad = [];
  rs.forEach((r, i) => { for (let j = 0; j < ns[i]; j++) { const th = Math.PI - (j * Math.PI) / (ns[i] - 1); cad.push([cx + r * Math.cos(th), cy - r * Math.sin(th), th]); } });
  cad.sort((a, b) => b[2] - a[2]);
  el.innerHTML = `${DEFS_TEMA}
    <g class="fora"><rect width="${W}" height="${H}" fill="url(#ceuCrep)"/>${estrelas(50, 71, 0, 600)}
      <rect y="1040" width="${W}" height="880" fill="#14354a"/>
      <g class="cam"><g transform="translate(540 1040)">${congresso()}</g>
        <rect x="80" y="1070" width="920" height="90" rx="8" fill="url(#agua)" opacity="0.55"/>
        <g transform="translate(540 1110) scale(1 -0.35)" opacity="0.25">${congresso()}</g></g>
      <g transform="translate(330 860)"><g class="tCam">${rotulo("CÂMARA", C.verde, 36)}</g></g>
      <g transform="translate(765 860)"><g class="tSen">${rotulo("SENADO", C.azul, 36)}</g></g></g>
    <g class="plen" opacity="0"><rect width="${W}" height="${H}" fill="url(#plenarioV)"/>
      <path d="M${cx - 540} ${cy} A 540 540 0 0 1 ${cx + 540} ${cy}z" fill="#0f3d38" opacity="0.6"/>
      <rect x="${cx - 120}" y="${cy - 40}" width="240" height="40" rx="8" fill="#1d5a50"/>
      <g class="cads">${cad.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9.5" fill="${C.verde}"/>`).join("")}</g>
      <text class="rot num" x="${cx}" y="${cy + 110}" text-anchor="middle" font-size="96" fill="#fff">513</text>
      <text class="rotm" x="${cx}" y="${cy + 160}" text-anchor="middle" font-size="36" fill="#bfe9df">deputados federais</text>
      <g transform="translate(290 540)"><g class="tSP">${rotulo("SÃO PAULO · 70", C.amarelo, 36)}</g></g>
      <g transform="translate(800 540)"><g class="tRR">${rotulo("RORAIMA · 8", C.rosa, 36)}</g></g></g>`;
  const fora = $(".fora", el), plen = $(".plen", el), cads = $$(".cads circle", el);
  surge($(".cam", el), c.ini + 0.1, 100);
  tl.set([$(".tCam", el), $(".tSen", el), $(".tSP", el), $(".tRR", el)], { opacity: 0 }, 0);
  const tcs = B("casas", 0.3);
  pop($(".tCam", el), tcs);
  pop($(".tSen", el), tcs + 0.15);
  tl.fromTo($(".bacia", el), { y: 0 }, { y: -12, duration: 0.25, yoyo: true, repeat: 1, immediateRender: false }, tcs);
  tl.fromTo($(".cupula", el), { y: 0 }, { y: -12, duration: 0.25, yoyo: true, repeat: 1, immediateRender: false }, tcs + 0.15);
  // zoom para dentro da Câmara e o plenário
  const tc = B("camara", 0.45);
  tl.to($(".tSen", el), { opacity: 0, duration: 0.2 }, tc);
  tl.to($(".cam", el), { scale: 3, svgOrigin: "330 950", duration: 0.9, ease: "power3.in" }, tc);
  tl.set(plen, { opacity: 1 }, tc + 0.7);
  tl.fromTo(plen, { opacity: 0 }, { opacity: 1, duration: 0.35, immediateRender: false }, tc + 0.7);
  tl.set(fora, { opacity: 0 }, tc + 1.05);
  const tpo = Math.max(tc + 1.0, B("pontos", 0.55) - 0.3);
  tl.fromTo(cads, { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.25, stagger: 1.4 / 513, ease: "back.out(3)", immediateRender: true }, tpo);
  const cont = { v: 0 }, num = $(".num", el);
  tl.fromTo(cont, { v: 0 }, { v: 513, duration: 1.5, ease: "power1.out", onUpdate: () => { num.textContent = Math.round(cont.v); }, immediateRender: false }, tpo);
  tl.fromTo(cads, { scale: 1 }, { scale: 1.35, duration: 0.2, yoyo: true, repeat: 1, stagger: 0.6 / 513, immediateRender: false, transformOrigin: "50% 50%" }, B("povo", 0.7));
  const tsp = B("sp", 0.85), trr = B("rr", 0.95);
  tl.to(cads.slice(0, 70), { fill: C.amarelo, duration: 0.3, stagger: 0.004 }, tsp);
  pop($(".tSP", el), tsp);
  tl.to(cads.slice(-8), { fill: C.rosa, scale: 1.4, transformOrigin: "50% 50%", duration: 0.3, stagger: 0.03 }, trr);
  pop($(".tRR", el), trr);
};

// =============== 7. Senado: 3 por estado ===============
CENAS.senado = (el, c, B) => {
  const UF = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
  const tile = (uf, k) => { const x = 48 + (k % 9) * 110, y = 460 + Math.floor(k / 9) * 146; return `<g transform="translate(${x + 52} ${y + 65})"><g class="tile" data-uf="${uf}">
      <rect class="tb" x="-52" y="-65" width="104" height="130" rx="14" fill="#1d2a6a" stroke="#3d4fa8" stroke-width="4"/>
      <text class="rot" y="-14" text-anchor="middle" font-size="32" fill="#fff">${uf}</text>
      ${[-28, 0, 28].map((dx) => `<circle class="sen" cx="${dx}" cy="32" r="11" fill="${C.azul}"/>`).join("")}</g></g>`; };
  el.innerHTML = `${DEFS_TEMA}<rect width="${W}" height="${H}" fill="url(#plenarioA)"/>${halo(540, 760, 620, "hS", "brilhoAzul").replace('class="hS"', 'class="hS" opacity="0.12"')}
    <g transform="translate(540 370)"><g class="tit">${rotulo("81 SENADORES", C.azul, 40)}</g></g>
    ${UF.map(tile).join("")}
    <g transform="translate(540 955)"><g class="igual">${rotulo("SÃO PAULO 3  =  RORAIMA 3", C.amarelo, 32)}</g></g>
    <g transform="translate(250 1250) scale(0.42)"><g class="icCam">${congresso().replace(/<rect x="-40"[^]*?<rect x="-430"/, '<rect x="-430"')}</g></g>
    <g transform="translate(250 1290)"><g class="lc"><text class="rot" text-anchor="middle" font-size="30" fill="#fff">CÂMARA</text></g></g>
    <g transform="translate(830 1290)"><g class="ls"><text class="rot" text-anchor="middle" font-size="30" fill="#fff">SENADO</text></g></g>
    <g transform="translate(830 1250)"><g class="icSen"><path d="M-100 0 C -90 -96, 90 -96, 100 0 Z" fill="url(#concreto)"/><rect x="-130" y="0" width="260" height="14" fill="#c9d0e6"/></g></g>
    <g transform="translate(250 1080) scale(0.45)"><g class="doc">${documento("LEI", "#3a5bd9")}</g></g>
    <g transform="translate(250 1150)"><g class="ck1">${check()}</g></g>
    <g transform="translate(830 1150)"><g class="ck2">${check()}</g></g>`;
  const tiles = $$(".tile", el);
  tl.set([$(".tit", el), $(".igual", el), $(".doc", el), $(".ck1", el), $(".ck2", el), $(".icCam", el), $(".icSen", el), $(".lc", el), $(".ls", el), ...tiles], { opacity: 0 }, 0);
  pop($(".tit", el), B("senado", 0.1));
  const tt = B("tres", 0.3);
  tiles.forEach((t, k) => tl.fromTo(t, { scale: 0.3, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2)", immediateRender: false }, tt - 0.3 + k * 0.035));
  tl.fromTo($$(".sen", el), { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 0.25, stagger: 0.012, ease: "back.out(3)", immediateRender: false }, tt + 0.2);
  const ttm = B("tamanho", 0.55);
  ["SP", "RR"].forEach((uf, k) => { const t = tiles.find((x) => x.dataset.uf === uf); tl.to($(".tb", t), { attr: { stroke: k ? C.rosa : C.amarelo, "stroke-width": 8 }, fill: "#2c3a8a", duration: 0.3 }, ttm); tl.fromTo(t, { scale: 1 }, { scale: 1.15, duration: 0.3, yoyo: true, repeat: 1, transformOrigin: "50% 50%", immediateRender: false }, ttm); });
  pop($(".igual", el), ttm + 0.2);
  // a lei passa pelas duas casas
  const tl0 = B("lei", 0.75), td = B("duas", 0.9);
  [".icCam", ".icSen", ".lc", ".ls"].forEach((s, k) => surge($(s, el), tl0 - 0.5 + k * 0.08, 40));
  pop($(".doc", el), tl0);
  pop($(".ck1", el), tl0 + 0.5);
  tl.to($(".doc", el), { motionPath: { path: [{ x: 640, y: -300 }, { x: 1290, y: 0 }], curviness: 1.2 }, duration: 0.9, ease: "power2.inOut" }, td - 0.2);
  pop($(".ck2", el), td + 0.7);
};

// =============== 8. Presidente ===============
CENAS.presidente = (el, c, B) => {
  el.innerHTML = `${DEFS_TEMA}<rect width="${W}" height="${H}" fill="url(#ceuCrep)"/>${estrelas(40, 81, 0, 500)}
    ${Array.from({ length: 10 }, (_, k) => P(120 + k * 94, 960, 1, "min", `<rect x="-26" y="-230" width="52" height="230" fill="#8f9bc4"/><rect x="-26" y="-230" width="52" height="230" fill="url(#sombraV)" opacity="0.5"/>${Array.from({ length: 9 }, (_, r) => `<rect x="-20" y="${-220 + r * 24}" width="40" height="8" fill="#ffd98a" opacity="${0.3 + ((r + k) % 3) * 0.2}"/>`).join("")}`)).join("")}
    <rect y="1060" width="${W}" height="860" fill="url(#gramaN)"/>
    <g transform="translate(540 1070)"><g class="planalto">${planalto()}</g></g>
    <rect x="990" y="700" width="8" height="370" fill="#c7cde6"/><g transform="translate(996 704)"><g class="band">${bandeira(1.1)}</g></g>
    ${P(540, 1340, 1.2, "pres", pessoa("#27305e", PELES[1], CABELOS[4], { faixa: true }))}
    <g transform="translate(540 700)"><g class="tMin">${rotulo("MINISTÉRIOS", C.laranja, 34)}</g></g>
    <g class="meds"></g>
    <g transform="translate(290 650) rotate(-5) scale(0.8)"><g class="doc1">${documento("LEI", "#3a5bd9")}<g transform="translate(0 60)"><g class="st1">${carimbo("SANCIONA", C.verde)}</g></g></g></g>
    <g transform="translate(790 650) rotate(5) scale(0.8)"><g class="doc2">${documento("LEI", "#3a5bd9")}<g transform="translate(0 60)"><g class="st2">${carimbo("VETA", C.vermelho)}</g></g><g transform="translate(0 60)"><g class="st3">${carimbo("VALE", C.verde)}</g></g></g></g>
    <g transform="translate(540 900)"><g class="tCong">${rotulo("CONGRESSO FISCALIZA", C.ciano, 32)}</g></g>`;
  const mins = $$(".min", el);
  tl.set([...mins, $(".pres", el), $(".tMin", el), $(".doc1", el), $(".doc2", el), $(".st1", el), $(".st2", el), $(".st3", el), $(".tCong", el)], { opacity: 0 }, 0);
  surge($(".planalto", el), c.ini + 0.15, 80);
  tl.fromTo($(".band", el), { skewY: 0 }, { skewY: 4, duration: 0.6, yoyo: true, repeat: Math.floor((c.fim - c.ini) / 0.6), ease: "sine.inOut", transformOrigin: "0% 50%", immediateRender: false }, c.ini);
  tl.fromTo($(".pres", el), { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55, ease: "back.out(2)", immediateRender: false }, B("presidente", 0.1));
  const tm = B("ministerios", 0.25);
  mins.forEach((m, k) => tl.fromTo(m, { scaleY: 0, opacity: 1, transformOrigin: "50% 100%" }, { scaleY: 1, opacity: 1, duration: 0.5, ease: "power3.out", immediateRender: false }, tm - 0.2 + k * 0.05));
  pop($(".tMin", el), tm);
  const itens = [["economia", C.amarelo, "ECONOMIA", 250, 520, "economia"], ["globo", C.azul, "OUTROS PAÍSES", 540, 440, "paises"], ["forcas", "#4f6b3a", "FORÇAS ARMADAS", 830, 520, "forcas"]];
  const meds = medalhas($(".meds", el), itens, B, [540, 960]);
  const ts = B("sanciona", 0.6);
  tl.to([...meds, $(".tMin", el)], { opacity: 0, duration: 0.3 }, ts - 0.5);
  pop($(".doc1", el), ts - 0.35);
  pop($(".doc2", el), ts - 0.25);
  tl.fromTo($(".st1", el), { scale: 2.6, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.25, ease: "power4.in", immediateRender: false }, ts + 0.1);
  tl.fromTo($(".st2", el), { scale: 2.6, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.25, ease: "power4.in", immediateRender: false }, B("veta", 0.7) + 0.05);
  pop($(".tCong", el), B("sozinho", 0.8));
  const tdr = B("derruba", 0.9);
  tl.to($(".st2", el), { x: 260, y: -120, rotation: 50, opacity: 0, duration: 0.5, ease: "power2.in" }, tdr);
  tl.fromTo($(".st3", el), { scale: 2.6, opacity: 0, transformOrigin: "50% 50%" }, { scale: 1, opacity: 1, duration: 0.25, ease: "power4.in", immediateRender: false }, tdr + 0.45);
};

// =============== 9. resumo + chamada ===============
CENAS.resumo = (el, c, B) => {
  const linhas = [["CIDADE", "PREFEITO", ["VEREADORES"]], ["ESTADO", "GOVERNADOR", ["DEPUTADOS", "ESTADUAIS"]], ["PAÍS", "PRESIDENTE", ["DEPUTADOS FEDERAIS", "+ SENADORES"]]];
  const cel = (x, y, w, cor, txts, cls) => `<g transform="translate(${x + w / 2} ${y + 90})"><g class="${cls}"><rect x="${-w / 2}" y="-90" width="${w}" height="180" rx="22" fill="rgba(255,255,255,0.07)" stroke="${cor}" stroke-width="5"/>${txts.map((t, k) => `<text class="rot" y="${(k - (txts.length - 1) / 2) * 44 + 14}" text-anchor="middle" font-size="${t.length > 12 ? 32 : 40}" fill="#fff">${t}</text>`).join("")}</g></g>`;
  el.innerHTML = `${DEFS_TEMA}<rect width="${W}" height="${H}" fill="url(#ceuNoite)"/>${estrelas(70, 91, 0, 1400)}
    <g class="tab">
      <g transform="translate(430 420)"><g class="hd"><rect x="-170" y="-40" width="340" height="80" rx="40" fill="${C.amarelo}"/><text class="rot" y="13" text-anchor="middle" font-size="36" fill="#141a3a">EXECUTA</text></g></g>
      <g transform="translate(830 420)"><g class="hd"><rect x="-210" y="-40" width="420" height="80" rx="40" fill="${C.azul}"/><text class="rot" y="11" text-anchor="middle" font-size="29" fill="#141a3a">FAZ AS LEIS E FISCALIZA</text></g></g>
      ${linhas.map(([n, e, l], k) => { const y = 500 + k * 210; return `<g transform="translate(130 ${y + 90})"><g class="rl"><text class="rot" text-anchor="middle" y="12" font-size="34" fill="${[C.verde, C.laranja, C.rosa][k]}">${n}</text></g></g>${cel(260, y, 340, C.amarelo, [e], "ce")}${cel(620, y, 420, C.azul, l, "cl")}`; }).join("")}
    </g>`;
  const hd = $$(".hd", el), rl = $$(".rl", el), ce = $$(".ce", el), cl = $$(".cl", el);
  tl.set([...ce, ...cl], { opacity: 0 }, 0);
  [...hd, ...rl].forEach((x, k) => surge(x, c.ini + 0.2 + k * 0.08, 40));
  const te = B("exec", 0.3), tlg = B("leg", 0.5);
  ce.forEach((x, k) => pop(x, te - 0.6 + k * 0.25));
  cl.forEach((x, k) => pop(x, tlg - 0.6 + k * 0.25));
  const tp = B("perceber", 0.7);
  tl.fromTo([...ce, ...cl], { scale: 1 }, { scale: 1.05, duration: 0.25, yoyo: true, repeat: 1, stagger: 0.05, transformOrigin: "50% 50%", immediateRender: false }, tp);
  const tcta = B("cta", 0.8);
  tl.to($(".tab", el), { opacity: 0, y: -40, duration: 0.45, ease: "power2.in" }, tcta - 0.45);
  cartaoFinal(el, tcta);
};
