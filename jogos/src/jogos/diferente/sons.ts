import type { EventoSom } from "../../audio/mix";
import { T, instantesDeTique } from "./tempos";

/** Os sons caem EXATAMENTE nos mesmos instantes das animações (tempos.ts). */
export function eventosDiferente(): EventoSom[] {
  const ev: EventoSom[] = [
    { t: T.tituloSobe[0], som: "whoosh", ganho: 0.6 },
    { t: T.grade[0], som: "pop", ganho: 0.5 },
    { t: T.grade[0] + 0.28, som: "pop", ganho: 0.5 },
    { t: T.grade[0] + 0.56, som: "pop", ganho: 0.5 },
    { t: T.grade[0] + 0.84, som: "pop", ganho: 0.5 },
    { t: T.tempo, som: "tempo", ganho: 1 },
    { t: T.revela[0], som: "whoosh", ganho: 0.7 },
    { t: T.revela[0] + 0.15, som: "acerto", ganho: 1 },
    { t: T.revela[0] + 0.15, som: "brilho", ganho: 0.6 },
    { t: T.resposta, som: "pop", ganho: 0.8 },
    { t: T.ctaIni, som: "pop", ganho: 0.8 },
    { t: T.volta[0], som: "whooshDesce", ganho: 0.6 },
  ];
  instantesDeTique().forEach((t, i) => ev.push({ t, som: t >= T.jogoFim - 3 ? "tiqueAlto" : i % 2 ? "tique" : "tique", ganho: t >= T.jogoFim - 3 ? 0.9 : 0.6 }));
  return ev;
}
