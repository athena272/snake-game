import type { KeyValueStore } from './storage';

export const HIGH_SCORE_KEY = 'snake-game:high-score';

export function parseHighScore(raw: string | null): number {
  if (raw === null || raw.trim() === '') return 0;
  const value = Number(raw);
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

export function loadHighScore(store: KeyValueStore): number {
  return parseHighScore(store.read(HIGH_SCORE_KEY));
}

export function saveHighScore(store: KeyValueStore, score: number): void {
  store.write(HIGH_SCORE_KEY, String(Math.max(0, Math.floor(score))));
}
