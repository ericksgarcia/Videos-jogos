// Gerador pseudoaleatório com semente (mulberry32). Nunca use Math.random neste projeto.
export type Prng = {
  (): number;
  int: (min: number, max: number) => number; // inclusivo
  pick: <T>(lista: readonly T[]) => T;
  sign: () => 1 | -1;
  shuffle: <T>(lista: readonly T[]) => T[];
};

export function prng(semente: number): Prng {
  let a = semente >>> 0;
  const f = (() => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }) as Prng;
  f.int = (min, max) => min + Math.floor(f() * (max - min + 1));
  f.pick = (lista) => lista[Math.floor(f() * lista.length)];
  f.sign = () => (f() < 0.5 ? -1 : 1);
  f.shuffle = (lista) => {
    const r = [...lista];
    for (let i = r.length - 1; i > 0; i--) {
      const j = Math.floor(f() * (i + 1));
      [r[i], r[j]] = [r[j], r[i]];
    }
    return r;
  };
  return f;
}
