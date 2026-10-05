import { describe, expect, it } from 'vitest';
import { interpolateAxis, wrapGhostOffset } from './interpolation';

describe('interpolateAxis', () => {
  it('interpolates linearly inside the board', () => {
    expect(interpolateAxis(3, 4, 0, 24)).toBe(3);
    expect(interpolateAxis(3, 4, 0.25, 24)).toBe(3.25);
    expect(interpolateAxis(3, 4, 1, 24)).toBe(4);
    expect(interpolateAxis(4, 3, 0.5, 24)).toBe(3.5);
  });

  it('keeps still segments still', () => {
    expect(interpolateAxis(7, 7, 0.6, 24)).toBe(7);
  });

  it('moves forward past the right/bottom border when wrapping', () => {
    expect(interpolateAxis(23, 0, 0.5, 24)).toBe(23.5);
    expect(interpolateAxis(23, 0, 1, 24)).toBe(24);
  });

  it('moves backward past the left/top border when wrapping', () => {
    expect(interpolateAxis(0, 17, 0.5, 18)).toBe(-0.5);
  });

  it('handles wrapping on tiny grids', () => {
    expect(interpolateAxis(2, 0, 0.5, 3)).toBe(2.5);
    expect(interpolateAxis(0, 2, 0.5, 3)).toBe(-0.5);
  });
});

describe('wrapGhostOffset', () => {
  it('needs no copy inside the board', () => {
    expect(wrapGhostOffset(0, 24)).toBe(0);
    expect(wrapGhostOffset(12.5, 24)).toBe(0);
    expect(wrapGhostOffset(23, 24)).toBe(0);
  });

  it('mirrors cells leaving through the far border to the start', () => {
    expect(wrapGhostOffset(23.4, 24)).toBe(-24);
  });

  it('mirrors cells leaving through the near border to the end', () => {
    expect(wrapGhostOffset(-0.3, 24)).toBe(24);
  });
});
