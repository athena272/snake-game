/** Normalised progress of a timed effect, clamped to `[0, 1]`. */
export function effectProgress(startMs: number, durationMs: number, nowMs: number): number {
  if (durationMs <= 0) return 1;
  return Math.min(1, Math.max(0, (nowMs - startMs) / durationMs));
}

export function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

/** Intensity that starts at `max` and fades out as the effect progresses. */
export function fadeOut(max: number, progress: number): number {
  return max * (1 - easeOutQuad(progress));
}

export interface Offset {
  x: number;
  y: number;
}

/** Decaying jitter for a screen shake; writes into `out` to avoid per-frame allocations. */
export function shakeOffset(
  amplitude: number,
  progress: number,
  nowMs: number,
  out: Offset,
): Offset {
  const strength = fadeOut(amplitude, progress);
  out.x = Math.sin(nowMs * 0.09) * strength;
  out.y = Math.cos(nowMs * 0.113) * strength;
  return out;
}
