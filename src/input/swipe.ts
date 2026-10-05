import type { Direction, Point } from '../game';

/** Minimum travel (CSS px) before a drag counts as a swipe. */
export const SWIPE_THRESHOLD_PX = 24;

/** Dominant-axis direction of a drag, or `null` while it is shorter than the threshold. */
export function detectSwipe(
  start: Point,
  end: Point,
  threshold: number = SWIPE_THRESHOLD_PX,
): Direction | null {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}
