import { describe, expect, it } from 'vitest';
import { HIGH_SCORE_KEY, loadHighScore, parseHighScore, saveHighScore } from './highScore';
import { createSafeStore } from './storage';

describe('parseHighScore', () => {
  it.each<[string | null, number]>([
    [null, 0],
    ['', 0],
    ['12', 12],
    ['0', 0],
    ['-3', 0],
    ['4.5', 0],
    ['abc', 0],
    ['1e400', 0],
  ])('parses %j as %i', (raw, expected) => {
    expect(parseHighScore(raw)).toBe(expected);
  });
});

describe('high score persistence', () => {
  it('saves and loads the high score', () => {
    const store = createSafeStore(() => null);
    expect(loadHighScore(store)).toBe(0);
    saveHighScore(store, 17);
    expect(store.read(HIGH_SCORE_KEY)).toBe('17');
    expect(loadHighScore(store)).toBe(17);
  });

  it('ignores corrupted values', () => {
    const store = createSafeStore(() => null);
    store.write(HIGH_SCORE_KEY, '{"oops":true}');
    expect(loadHighScore(store)).toBe(0);
  });
});
