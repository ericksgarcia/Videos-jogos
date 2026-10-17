export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
/** Progresso 0..1 de t dentro de [a, b]. */
export const prog = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const suave = (k: number) => k * k * (3 - 2 * k);
export const saidaCubica = (k: number) => 1 - Math.pow(1 - k, 3);
export const entradaSaida = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
/** Gelatina: sobe passando do alvo e balança até assentar em 1. */
export const gelatina = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : 1 - Math.exp(-6.5 * k) * Math.cos(13 * k));
/** Antecipação: recua um pouco antes de ir (0 → -0.12 → 1). */
export const antecipa = (k: number) => {
  if (k <= 0) return 0;
  if (k >= 1) return 1;
  const c = 1.9;
  return (c + 1) * k * k * k - c * k * k;
};
