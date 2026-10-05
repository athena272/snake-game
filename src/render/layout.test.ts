import { describe, expect, it } from 'vitest';
import { computeBoardLayout } from './layout';

describe('computeBoardLayout', () => {
  it('fits a landscape area limited by height', () => {
    expect(computeBoardLayout(1200, 540, 24, 18)).toEqual({
      cellSize: 30,
      width: 720,
      height: 540,
    });
  });

  it('fits a portrait phone limited by width', () => {
    expect(computeBoardLayout(360, 640, 24, 18)).toEqual({ cellSize: 15, width: 360, height: 270 });
  });

  it('floors to whole pixels to keep cells crisp', () => {
    expect(computeBoardLayout(250, 1000, 24, 18).cellSize).toBe(10);
  });

  it('never collapses below 1px, even for hidden containers', () => {
    expect(computeBoardLayout(0, 0, 24, 18)).toEqual({ cellSize: 1, width: 24, height: 18 });
  });
});
