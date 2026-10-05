/**
 * Interpolates one grid axis taking wrap-around into account: a move from the
 * last cell to the first one travels forward one cell (past the border)
 * instead of sliding back across the whole board.
 */
export function interpolateAxis(from: number, to: number, alpha: number, size: number): number {
  let delta = to - from;
  if (delta > size / 2) {
    delta -= size;
  } else if (delta < -size / 2) {
    delta += size;
  }
  return from + delta * alpha;
}

/**
 * Offset of the mirrored copy needed while a cell is crossing a border
 * (`0` when the cell is fully inside the board).
 */
export function wrapGhostOffset(position: number, size: number): number {
  if (position > size - 1) return -size;
  if (position < 0) return size;
  return 0;
}
