// Linha do tempo (em segundos) do "Qual é diferente?". Usada pela imagem E pelo som.
export const FPS = 30;
export const T = {
  total: 20,
  tituloSobe: [1.2, 2.0],
  grade: [1.6, 3.0],
  jogoIni: 3,
  jogoFim: 13,
  tempo: 13, // "TEMPO!"
  revela: [13.6, 14.4],
  resposta: 14.4,
  ctaIni: 17.8,
  ctaFim: 19.2,
  volta: [19.2, 19.8],
} as const;

/** Atraso de entrada de cada célula (cascata diagonal). */
export const atrasoCelula = (linha: number, coluna: number) => T.grade[0] + (linha + coluna) * 0.07;

/** Instante de cada tique do cronômetro (acelera nos últimos 3 s). */
export function instantesDeTique(): number[] {
  const r: number[] = [];
  for (let s = T.jogoIni; s < T.jogoFim - 3; s += 1) r.push(s);
  for (let s = T.jogoFim - 3; s < T.jogoFim; s += 0.5) r.push(s);
  return r;
}
