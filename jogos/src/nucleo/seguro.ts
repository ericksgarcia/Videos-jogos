// Área segura do TikTok (1080×1920). Todo conteúdo importante fica dentro dela.
export const L = 1080;
export const A = 1920;
export const SEGURA = { x0: 60, x1: 880, y0: 300, y1: 1650 } as const;
export const CENTRO_X = (SEGURA.x0 + SEGURA.x1) / 2; // 470
/** Retângulo [x, y, w, h] está dentro da área segura? */
export function dentroDaSegura(x: number, y: number, w: number, h: number) {
  return x >= SEGURA.x0 && x + w <= SEGURA.x1 && y >= SEGURA.y0 && y + h <= SEGURA.y1;
}
