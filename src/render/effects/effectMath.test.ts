import { describe, expect, it } from 'vitest';
import { easeOutQuad, effectProgress, fadeOut, shakeOffset } from './effectMath';

describe('effectProgress', () => {
  it('goes from 0 to 1 over the duration', () => {
    expect(effectProgress(1000, 200, 1000)).toBe(0);
    expect(effectProgress(1000, 200, 1100)).toBe(0.5);
    expect(effectProgress(1000, 200, 1200)).toBe(1);
  });

  it('clamps before the start and after the end', () => {
    expect(effectProgress(1000, 200, 900)).toBe(0);
    expect(effectProgress(1000, 200, 5000)).toBe(1);
  });

  it('treats inactive effects (never started) as finished', () => {
    expect(effectProgress(Number.NEGATIVE_INFINITY, 200, 1000)).toBe(1);
  });

  it('completes immediately with a zero duration', () => {
    expect(effectProgress(1000, 0, 1000)).toBe(1);
  });
});

describe('easing and fading', () => {
  it('eases out from 0 to 1', () => {
    expect(easeOutQuad(0)).toBe(0);
    expect(easeOutQuad(0.5)).toBe(0.75);
    expect(easeOutQuad(1)).toBe(1);
  });

  it('fades from max to zero', () => {
    expect(fadeOut(0.4, 0)).toBe(0.4);
    expect(fadeOut(0.4, 1)).toBe(0);
  });
});

describe('shakeOffset', () => {
  it('stays within the amplitude and settles to zero', () => {
    const out = { x: 0, y: 0 };
    for (let now = 0; now < 500; now += 7) {
      shakeOffset(6, 0.2, now, out);
      expect(Math.abs(out.x)).toBeLessThanOrEqual(6);
      expect(Math.abs(out.y)).toBeLessThanOrEqual(6);
    }
    shakeOffset(6, 1, 123, out);
    expect(Math.abs(out.x)).toBe(0);
    expect(Math.abs(out.y)).toBe(0);
  });

  it('reuses the output object', () => {
    const out = { x: 0, y: 0 };
    expect(shakeOffset(3, 0, 10, out)).toBe(out);
  });
});
