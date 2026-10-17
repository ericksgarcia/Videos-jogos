/**
 * Versículo COMPLETO escrito na tela durante todo o vídeo (as demais falas não têm legenda).
 * Fica numa caixa segura: longe das bordas e dos ícones do TikTok (coluna direita x > ~930 entre y ~900 e ~1620,
 * legenda/usuário embaixo a partir de y ~1560, busca/abas em cima até ~y 250). Durante a leitura, a palavra falada
 * acende em dourado e as já lidas ficam em marfim pleno; antes e depois da leitura o texto inteiro fica legível.
 */
import "@fontsource/cinzel/600.css";
import "@fontsource/cinzel/700.css";
import { useEffect } from "react";
import { continueRender, delayRender, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { PalavraPlano } from "../lib/plan";
import { SOMBRA_TEXTO } from "./KineticText";

const OURO = "#f6c64a";
const MARFIM = "#f4ecd8";
export const CAIXA = { x: 70, w: 850, y: 330, h: 1150 };   // área segura (px, vídeo 1080×1920)
export const EM = 0.66;                                             // largura média de um caractere do Cinzel 700, em "em"

/** Quebra gulosa nas linhas da caixa e escolhe a maior fonte (≤ 104 px) em que o texto inteiro cabe. */
export function diagramar(palavras: PalavraPlano[], caixa = CAIXA): { fonte: number; linhas: PalavraPlano[][] } {
  for (let fonte = 104; fonte >= 34; fonte -= 2) {
    const max = Math.floor(caixa.w / (EM * fonte));
    const linhas: PalavraPlano[][] = [[]];
    let ok = true;
    for (const w of palavras) {
      const atual = linhas[linhas.length - 1];
      const n = atual.reduce((s, x, i) => s + x.t.length + (i ? 1 : 0), 0);
      if (w.t.length > max) { ok = false; break; }
      if (atual.length && n + 1 + w.t.length > max) linhas.push([]);
      linhas[linhas.length - 1].push(w);
    }
    if (ok && linhas.length * fonte * 1.3 <= caixa.h) return { fonte, linhas };
  }
  return { fonte: 34, linhas: [palavras] };
}

export const VersoFixo = ({ palavras, faixa = 100, caixa = CAIXA, janela = false }: { palavras: PalavraPlano[]; faixa?: number; caixa?: typeof CAIXA; janela?: boolean }) => {
  useEffect(() => {
    const h = delayRender("fonte do versículo");
    Promise.all([document.fonts.load("700 70px Cinzel")]).finally(() => continueRender(h));
  }, []);
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  if (!palavras.length) return null;
  const { fonte, linhas } = diagramar(palavras, caixa);
  const ini = palavras[0].ini, fim = palavras[palavras.length - 1].fim;
  // janela: o texto só existe durante a leitura (entra um instante antes e sai logo depois), deixando a imagem limpa no gancho e na conclusão
  const entra = janela ? interpolate(t, [ini - 0.45, ini - 0.05, fim + 0.8, fim + 1.4], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : interpolate(t, [0.1, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lendo = t >= ini - 0.05 && t <= fim + 0.3;
  const scrim = 0.4 + 0.35 * Math.min(1, Math.max(0, (faixa - 90) / 70));
  let k = -1;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: entra }}>
      <div style={{ position: "absolute", left: caixa.x - 60, width: caixa.w + 120, top: caixa.y - 40, height: caixa.h + 80, background: `radial-gradient(ellipse closest-side at center, rgba(8,5,3,${scrim}) 0%, rgba(8,5,3,${scrim * 0.75}) 55%, rgba(8,5,3,0) 100%)` }} />
      <div style={{ position: "absolute", left: caixa.x, width: caixa.w, top: caixa.y, height: caixa.h, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", fontFamily: "Cinzel, serif", fontWeight: 700, fontSize: fonte, lineHeight: 1.3 }}>
        {linhas.map((l, li) => (
          <div key={li} style={{ whiteSpace: "nowrap" }}>
            {l.map((w) => {
              k++;
              const prox = palavras[k + 1]?.ini ?? w.fim;
              const ativa = t >= w.ini && t < Math.max(prox, w.fim);
              const lida = t >= Math.max(prox, w.fim);
              const f0 = Math.round(w.ini * fps);
              const s = ativa ? spring({ frame: frame - f0, fps, config: { damping: 11, mass: 0.55, stiffness: 190 } }) : 0;
              const acende = ativa ? interpolate(frame - f0, [0, 4], [0, 1], { extrapolateRight: "clamp" }) : 0;
              const cor = interpolateColors(acende, [0, 1], [MARFIM, OURO]);
              const opac = !lendo ? 0.94 : ativa ? 1 : lida ? 0.96 : 0.5;
              const texto = k === 0 ? w.t.charAt(0).toUpperCase() + w.t.slice(1) : w.t;
              return (
                <span key={k} style={{
                  display: "inline-block", margin: "0 0.24em", color: cor, opacity: opac, transform: `scale(${ativa ? 1 + 0.08 * s : 1})`, transformOrigin: "50% 60%",
                  WebkitTextStroke: "0.6px rgba(0,0,0,0.35)", paintOrder: "stroke fill",
                  textShadow: `${SOMBRA_TEXTO}${acende > 0.02 ? `, 0 0 ${18 * acende}px rgba(255,205,90,${0.95 * acende}), 0 0 ${46 * acende}px rgba(255,160,40,${0.6 * acende})` : ""}`,
                }}>{texto}</span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
