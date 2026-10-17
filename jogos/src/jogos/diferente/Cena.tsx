import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { Fundo } from "../../identidade/Fundo";
import { Particulas } from "../../identidade/Particulas";
import { Logo } from "../../identidade/Logo";
import { COR, MARCA } from "../../identidade/marca";
import { entradaSaida, gelatina, lerp, prog, saidaCubica } from "../../nucleo/easing";
import { prng } from "../../nucleo/prng";
import { explicacao, gerarDesafio, nomeDaPosicao, type Dificuldade, type Simbolo } from "./gerar";
import { atrasoCelula, T } from "./tempos";

export type PropsDiferente = { semente: number; dificuldade: Dificuldade };

// Geometria da grade (dentro da área segura: x 60–880, y 300–1650).
export const GRADE = { x: 110, y: 540, w: 760, h: 760 } as const;

const estrela = (cx: number, cy: number, R: number, pontas: number, rotGraus: number) => {
  const pts: string[] = [];
  const rot = (rotGraus * Math.PI) / 180;
  for (let i = 0; i < pontas * 2; i++) {
    const rr = i % 2 === 0 ? R : R * 0.46;
    const a = rot + (i * Math.PI) / pontas;
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(2)},${(cy + rr * Math.sin(a)).toFixed(2)}`);
  }
  return "M" + pts.join("L") + "Z";
};

const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`;

const Estilo: React.FC<{ s: Simbolo; id: string; tam: number }> = ({ s, id, tam }) => {
  const R = tam * 0.4;
  return (
    <svg width={tam} height={tam} viewBox={`${-tam / 2} ${-tam / 2} ${tam} ${tam}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor={hsl(s.matiz, 95, 72)} />
          <stop offset="1" stopColor={hsl(s.matiz, 90, 50)} />
        </linearGradient>
      </defs>
      <path d={estrela(0, 6, R, s.pontas, s.rotacao)} fill="rgba(0,0,0,0.35)" style={{ filter: "blur(7px)" }} />
      <path d={estrela(0, 0, R, s.pontas, s.rotacao)} fill={`url(#${id})`} stroke={hsl(s.matiz, 100, 88)}
        strokeWidth={s.espessura} strokeLinejoin="round" />
      <path d={estrela(-R * 0.1, -R * 0.12, R * 0.55, s.pontas, s.rotacao)} fill="rgba(255,255,255,0.22)" />
    </svg>
  );
};

const Texto: React.FC<{ children: React.ReactNode; tam: number; cor?: string; style?: React.CSSProperties }> = ({ children, tam, cor = "#fff", style }) => (
  <div style={{ fontFamily: "Nunito", fontWeight: 900, fontSize: tam, color: cor, textAlign: "center", lineHeight: 1.05,
    textShadow: "0 6px 0 rgba(20,10,60,0.55), 0 10px 30px rgba(0,0,0,0.45)", ...style }}>{children}</div>
);

export const Diferente: React.FC<PropsDiferente> = ({ semente, dificuldade }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const d = gerarDesafio(semente, dificuldade);
  const cell = GRADE.w / d.colunas;

  // --- título: grande no centro (início/fim) → pequeno em cima (jogo) ---
  const sobe = entradaSaida(prog(t, T.tituloSobe[0], T.tituloSobe[1]));
  const desce = entradaSaida(prog(t, T.volta[0], T.volta[1]));
  const titulo = sobe * (1 - desce); // 0 = grande, 1 = pequeno
  const tamTitulo = lerp(132, 78, titulo);
  const yTitulo = lerp(700, 478, titulo);
  const subOp = prog(t, 1.9, 2.4) * (1 - prog(t, T.tempo, T.tempo + 0.3));

  // --- cronômetro ---
  const restante = Math.max(0, T.jogoFim - t);
  const jogando = t >= T.jogoIni && t < T.jogoFim;
  const frac = prog(t, T.jogoIni, T.jogoFim);
  const num = Math.ceil(restante);
  const tique = (t - T.jogoIni) % (restante < 3 ? 0.5 : 1);
  const batida = 1 + 0.18 * (1 - saidaCubica(prog(tique, 0, 0.25)));
  const corBarra = restante < 3 ? COR.magenta : restante < 6 ? COR.amarelo : COR.ciano;
  const timerOp = prog(t, 2.6, 3.0) * (1 - prog(t, T.tempo + 0.2, T.revela[0]));

  // --- revelação ---
  const rev = prog(t, T.revela[0], T.revela[1]);
  const gRev = gelatina(rev);
  const sumirGrade = prog(t, T.volta[0] - 0.1, T.volta[0] + 0.4);
  const posA = nomeDaPosicao(d);
  const linhaC = Math.floor(d.indiceCorreto / d.colunas);
  const colC = d.indiceCorreto % d.colunas;

  const txtOp = (a: number, b: number) => prog(t, a, b);
  const ctaOp = prog(t, T.ctaIni, T.ctaIni + 0.3) * (1 - prog(t, T.ctaFim, T.ctaFim + 0.3));
  const ctaScale = gelatina(prog(t, T.ctaIni, T.ctaIni + 0.6));

  // faíscas da revelação
  const r = prng(semente + 99);
  const cx = GRADE.x + (colC + 0.5) * cell;
  const cy = GRADE.y + (linhaC + 0.5) * cell;
  const faiscas = Array.from({ length: 22 }, (_, i) => {
    const a = r() * Math.PI * 2, v = 120 + r() * 220, tam = 6 + r() * 10;
    return { i, a, v, tam, cor: [COR.amarelo, COR.ciano, COR.magenta, "#fff"][i % 4] };
  });
  const kf = prog(t, T.revela[0] + 0.15, T.revela[0] + 1.1);

  return (
    <div style={{ width: 1080, height: 1920, position: "relative", overflow: "hidden", background: COR.fundo }}>
      <Fundo duracao={T.total} />
      <Particulas duracao={T.total} />
      <Logo />

      {/* título */}
      <div style={{ position: "absolute", left: 60, width: 820, top: yTitulo - tamTitulo, transform: "translateY(0)" }}>
        <Texto tam={tamTitulo}>
          {titulo < 0.5 ? <>QUAL É<br />DIFERENTE?</> : <>QUAL É DIFERENTE?</>}
        </Texto>
      </div>
      <div style={{ position: "absolute", left: 60, width: 820, top: 1500, opacity: subOp }}>
        <Texto tam={52} cor={COR.amarelo}>Você tem 10 segundos</Texto>
      </div>

      {/* grade */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - sumirGrade, zIndex: 7 }}>
        {"ABCDEFGH".slice(0, d.colunas).split("").map((l, c) => (
          <text key={l} x={GRADE.x + (c + 0.5) * cell} y={GRADE.y - 14} textAnchor="middle" fontFamily="Nunito" fontWeight={900}
            fontSize={34} fill="rgba(255,255,255,0.75)" opacity={prog(t, 2.2, 3.0)}>{l}</text>
        ))}
        {Array.from({ length: d.linhas }, (_, l) => (
          <text key={l} x={GRADE.x - 28} y={GRADE.y + (l + 0.5) * cell + 12} textAnchor="middle" fontFamily="Nunito" fontWeight={900}
            fontSize={34} fill="rgba(255,255,255,0.75)" opacity={prog(t, 2.2, 3.0)}>{l + 1}</text>
        ))}
        <rect x={GRADE.x - 6} y={GRADE.y - 6} width={GRADE.w + 12} height={GRADE.h + 12} rx={36} fill="rgba(10,5,40,0.38)"
          stroke="rgba(255,255,255,0.14)" strokeWidth={2} opacity={prog(t, T.grade[0], T.grade[0] + 0.5)} />
      </svg>
      {d.simbolos.map((s, i) => {
        const lin = Math.floor(i / d.colunas), col = i % d.colunas;
        const entra = gelatina(prog(t, atrasoCelula(lin, col), atrasoCelula(lin, col) + 0.7));
        const fase = (lin * 0.37 + col * 0.61) % 1;
        const idle = jogando ? 1 + 0.03 * Math.sin(2 * Math.PI * (t * 0.5 + fase)) : 1;
        const certo = i === d.indiceCorreto;
        let esc = entra * idle;
        let op = 1;
        if (certo) esc *= lerp(1, 1.5, gRev);
        else { esc *= lerp(1, 0.86, rev); op = lerp(1, 0.16, saidaCubica(rev)); }
        op *= 1 - sumirGrade;
        const px = GRADE.x + (col + 0.5) * cell, py = GRADE.y + (lin + 0.5) * cell;
        const wob = certo && t > T.revela[1] ? 1 + 0.04 * Math.sin(2 * Math.PI * (t - T.revela[1]) * 1.2) : 1;
        return (
          <div key={i} style={{ position: "absolute", left: px - cell / 2, top: py - cell / 2, width: cell, height: cell, opacity: op,
            transform: `scale(${esc * wob})`, zIndex: certo ? 5 : 1, display: "flex", alignItems: "center", justifyContent: "center",
            filter: certo && rev > 0 ? `drop-shadow(0 0 ${28 * rev}px ${COR.amarelo})` : undefined }}>
            <Estilo s={s} id={`g${i}`} tam={cell} />
          </div>
        );
      })}

      {/* anel + faíscas da resposta */}
      {rev > 0 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, zIndex: 6, opacity: 1 - sumirGrade }}>
          <circle cx={cx} cy={cy} r={cell * 0.62 * lerp(0.7, 1.45, saidaCubica(prog(t, T.revela[0], T.revela[0] + 0.6)))}
            fill="none" stroke={COR.amarelo} strokeWidth={8} opacity={t < T.revela[1] + 0.2 ? 1 : 0.9 + 0.1 * Math.sin(t * 8)}
            strokeDasharray={t > T.revela[1] ? "26 16" : undefined}
            transform={t > T.revela[1] ? `rotate(${(t - T.revela[1]) * 40} ${cx} ${cy})` : undefined} />
          {kf > 0 && kf < 1 && faiscas.map((f) => (
            <circle key={f.i} cx={cx + Math.cos(f.a) * f.v * saidaCubica(kf)} cy={cy + Math.sin(f.a) * f.v * saidaCubica(kf) + 120 * kf * kf}
              r={f.tam * (1 - kf)} fill={f.cor} opacity={1 - kf} />
          ))}
        </svg>
      )}

      {/* cronômetro */}
      <div style={{ position: "absolute", left: 110, top: 1350, width: 760, opacity: timerOp }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ width: 120, height: 120, borderRadius: 60, background: "rgba(10,5,40,0.7)", border: `6px solid ${corBarra}`,
            boxShadow: `0 0 30px ${corBarra}`, display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${jogando ? batida : 1})` }}>
            <Texto tam={74} style={{ textShadow: "none" }}>{num}</Texto>
          </div>
          <div style={{ flex: 1, height: 36, borderRadius: 18, background: "rgba(10,5,40,0.6)", overflow: "hidden", border: "3px solid rgba(255,255,255,0.18)" }}>
            <div style={{ width: `${(1 - frac) * 100}%`, height: "100%", borderRadius: 18,
              background: `linear-gradient(90deg, ${corBarra}, #fff6)`, boxShadow: `0 0 20px ${corBarra}` }} />
          </div>
        </div>
      </div>

      {/* TEMPO! */}
      {t >= T.tempo && t < T.revela[0] + 0.2 && (
        <div style={{ position: "absolute", left: 60, width: 820, top: 880, opacity: 1 - prog(t, T.revela[0] - 0.1, T.revela[0] + 0.2),
          transform: `scale(${lerp(0.4, 1, gelatina(prog(t, T.tempo, T.tempo + 0.4)))}) rotate(-4deg)` }}>
          <Texto tam={190} cor={COR.magenta} style={{ WebkitTextStroke: "10px #fff", paintOrder: "stroke fill" as any }}>TEMPO!</Texto>
        </div>
      )}

      {/* resposta */}
      <div style={{ position: "absolute", left: 60, width: 820, top: 1360, opacity: txtOp(T.resposta, T.resposta + 0.25) * (1 - sumirGrade),
        transform: `scale(${lerp(0.6, 1, gelatina(prog(t, T.resposta, T.resposta + 0.6)))})` }}>
        <Texto tam={104} cor={COR.amarelo}>Era o {posA}!</Texto>
      </div>
      <div style={{ position: "absolute", left: 60, width: 820, top: 1500, opacity: txtOp(T.resposta + 0.3, T.resposta + 0.7) * (1 - prog(t, T.ctaIni - 0.3, T.ctaIni)) }}>
        <Texto tam={58}>{explicacao(d)}</Texto>
      </div>

      {/* chamada final (emenda no título do início) */}
      <div style={{ position: "absolute", left: 60, width: 820, top: 1500, opacity: ctaOp, transform: `scale(${ctaScale})` }}>
        <Texto tam={72} cor={COR.ciano}>{MARCA.cta}</Texto>
      </div>
    </div>
  );
};
