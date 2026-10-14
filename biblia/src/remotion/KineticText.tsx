/**
 * Legendas cinéticas: frases centralizadas em tipografia clássica (Cinzel / Cormorant Garamond).
 * A palavra em fala acende em dourado com brilho e um spring de escala; as anteriores e as futuras
 * ficam a 35% de opacidade — leitura focada, sem ruído.
 */
import "@fontsource/cinzel/600.css";
import "@fontsource/cinzel/700.css";
import "@fontsource/cormorant-garamond/600.css";
import "@fontsource/cormorant-garamond/700.css";
import "@fontsource/cormorant-garamond/600-italic.css";
import { useEffect } from "react";
import { continueRender, delayRender, interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { PalavraPlano, SegmentoPlano } from "../lib/plan";

const OURO = "#f6c64a";
const MARFIM = "#f4ecd8";
const OPACIDADE_APAGADA = 0.35;

interface Frase { seg: SegmentoPlano["id"]; palavras: PalavraPlano[]; ini: number; fim: number; ate: number; colada: boolean; seguida: boolean }

/** Quebra em frases curtas: no máximo `max` palavras, preferindo cortar após pontuação. */
export function dividirFrases(segs: SegmentoPlano[], max = 6): Frase[] {
  const frases: Frase[] = [];
  for (const s of segs) {
    let atual: PalavraPlano[] = [];
    const fechar = () => { if (atual.length) { frases.push({ seg: s.id, palavras: atual, ini: atual[0].ini, fim: atual[atual.length - 1].fim, ate: 0, colada: false, seguida: false }); atual = []; } };
    for (const w of s.palavras) {
      atual.push(w);
      const forte = /[.!?…]$/.test(w.t), medio = /[,;:]$/.test(w.t);
      if (forte || (medio && atual.length >= 2) || atual.length >= max) fechar();
    }
    fechar();
  }
  frases.forEach((f, i) => {
    const prox = frases[i + 1];
    f.seguida = Boolean(prox && prox.ini - f.fim < 1.2);
    f.ate = f.seguida ? prox.ini : f.fim + 0.55;   // fica até a próxima, ou some logo após o fim
    if (prox) prox.colada = f.seguida;            // emendadas: troca direta, sem piscar
  });
  return frases;
}

const useFontes = () => {
  useEffect(() => {
    const h = delayRender("fontes");
    Promise.all([
      document.fonts.load("600 70px Cinzel"), document.fonts.load("700 70px Cinzel"),
      document.fonts.load("600 70px 'Cormorant Garamond'"), document.fonts.load("700 70px 'Cormorant Garamond'"),
      document.fonts.load("italic 600 70px 'Cormorant Garamond'"),
    ]).finally(() => continueRender(h));
  }, []);
};

const Palavra = ({ w, proxIni, t, frame, fps, verso }: { w: PalavraPlano; proxIni: number; t: number; frame: number; fps: number; verso: boolean }) => {
  const ativa = t >= w.ini && t < Math.max(proxIni, w.fim);
  const passou = t >= Math.max(proxIni, w.fim);
  const f0 = Math.round(w.ini * fps);
  const s = ativa ? spring({ frame: frame - f0, fps, config: { damping: 11, mass: 0.55, stiffness: 190 } }) : 0;
  const saida = passou ? interpolate(t, [Math.max(proxIni, w.fim), Math.max(proxIni, w.fim) + 0.22], [1, 0], { extrapolateRight: "clamp" }) : 0;
  const escala = ativa ? 1 + 0.13 * s : 1 + 0.13 * saida * (passou ? 1 : 0);
  const acende = ativa ? interpolate(frame - f0, [0, 4], [0, 1], { extrapolateRight: "clamp" }) : passou ? saida : 0;
  const cor = interpolateColors(acende, [0, 1], [MARFIM, OURO]);
  const brilho = acende;
  return (
    <span style={{
      display: "inline-block", margin: "0 0.17em", color: cor, opacity: OPACIDADE_APAGADA + (1 - OPACIDADE_APAGADA) * acende,
      transform: `scale(${escala})`, transformOrigin: "50% 60%",
      textShadow: `0 2px 14px rgba(0,0,0,0.85)${brilho > 0.02 ? `, 0 0 ${18 * brilho}px rgba(255,205,90,${0.95 * brilho}), 0 0 ${46 * brilho}px rgba(255,160,40,${0.6 * brilho})` : ""}`,
      willChange: "transform",
    }}>{w.t}</span>
  );
};

export const KineticText = ({ segmentos }: { segmentos: SegmentoPlano[] }) => {
  useFontes();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const frases = dividirFrases(segmentos);
  const f = frases.find((x) => t >= (x.colada ? x.ini : x.ini - 0.12) && t < x.ate);
  if (!f) return null;
  const verso = f.seg === "ato2";
  const cta = f.seg === "cta";
  // frase emendada na anterior: entra com um "pop" curto (sem fade); frase isolada: fade normal
  const entrada = f.colada ? 1 : interpolate(t, [f.ini - 0.12, f.ini + 0.12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const saida = f.seguida ? 1 : interpolate(t, [f.ate - 0.18, f.ate], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pop = f.colada ? spring({ frame: frame - Math.round(f.ini * fps), fps, config: { damping: 14, stiffness: 260, mass: 0.5 } }) : 1;
  return (
    <div style={{
      position: "absolute", left: 70, right: 70, top: 0, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center",
      paddingTop: verso ? 120 : 260, textAlign: "center", opacity: entrada * saida,
      transform: `translateY(${(1 - entrada) * 18}px) scale(${0.94 + 0.06 * pop})`,
    }}>
      <div style={{ position: "absolute", left: -40, right: -40, top: verso ? "38%" : "44%", height: verso ? 420 : 360, background: "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 45%, rgba(0,0,0,0) 72%)", pointerEvents: "none" }} />
      <div style={{
        fontFamily: verso ? "Cinzel, serif" : "'Cormorant Garamond', serif", fontWeight: verso ? 700 : 700,
        fontStyle: cta ? "italic" : "normal", fontSize: verso ? 78 : cta ? 84 : 92, lineHeight: 1.22,
        letterSpacing: verso ? "0.02em" : "0.005em", maxWidth: 940,
      }}>
        {f.palavras.map((w, i) => (
          <Palavra key={i} w={w} proxIni={f.palavras[i + 1]?.ini ?? w.fim} t={t} frame={frame} fps={fps} verso={verso} />
        ))}
      </div>
    </div>
  );
};

/** Referência bíblica fixa no topo durante TODO o vídeo; dá um "pulso" de brilho quando a leitura começa. */
export const RotuloReferencia = ({ texto, ini }: { texto: string; ini: number; fim: number }) => {
  useFontes();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const entra = interpolate(t, [0.15, 0.7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const destaque = Math.max(0, 1 - Math.abs(t - ini - 0.4) / 1.1);  // brilha ao começar a leitura do versículo
  const linha = 170 + 70 * entra + 60 * destaque;
  return (
    <div style={{ position: "absolute", top: 205, left: 0, right: 0, textAlign: "center", opacity: entra, transform: `scale(${1 + 0.08 * destaque})` }}>
      <div style={{ margin: "0 auto 14px", width: linha, height: 2, background: `linear-gradient(90deg, transparent, ${OURO}, transparent)` }} />
      <div style={{
        fontFamily: "Cinzel, serif", fontWeight: 700, fontSize: 46, letterSpacing: "0.28em", color: OURO, textTransform: "uppercase",
        textShadow: `0 2px 12px #000, 0 0 ${18 + 30 * destaque}px rgba(255,190,70,${0.45 + 0.4 * destaque})`,
      }}>{texto}</div>
      <div style={{ margin: "14px auto 0", width: linha, height: 2, background: `linear-gradient(90deg, transparent, ${OURO}, transparent)` }} />
    </div>
  );
};
