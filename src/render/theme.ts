export const THEME = {
  background: 0x0f1419,
  cellLight: 0x18212b,
  cellDark: 0x141b23,
  boardBorder: 0x2a3746,
  snakeHead: 0x4ade80,
  snakeBodyStart: 0x22c55e,
  snakeBodyEnd: 0x116b37,
  snakeDead: 0x7f1d1d,
  eyeWhite: 0xffffff,
  eyePupil: 0x0b0f14,
  apple: 0xef4444,
  appleHighlight: 0xfca5a5,
  appleLeaf: 0x22c55e,
  appleStem: 0x78350f,
  poison: 0xa855f7,
  poisonDark: 0x581c87,
  poisonBubble: 0xe9d5ff,
  trap: 0xf59e0b,
  trapDark: 0x1c1917,
  eatParticle: 0xfacc15,
  poisonFlash: 0xa855f7,
  deathFlash: 0xef4444,
} as const;

/** Linear blend between two 0xRRGGBB colors. */
export function mixColors(from: number, to: number, ratio: number): number {
  const t = Math.min(1, Math.max(0, ratio));
  const channel = (shift: number): number => {
    const a = (from >> shift) & 0xff;
    const b = (to >> shift) & 0xff;
    return Math.round(a + (b - a) * t) << shift;
  };
  return channel(16) | channel(8) | channel(0);
}
