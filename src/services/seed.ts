/** Fresh 32-bit seed for a new match; the only source of randomness in the app. */
export function createRandomSeed(): number {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    return crypto.getRandomValues(new Uint32Array(1))[0] ?? 0;
  }
  return Math.floor(Math.random() * 2 ** 32) >>> 0;
}
