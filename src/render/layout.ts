export interface BoardLayout {
  readonly cellSize: number;
  readonly width: number;
  readonly height: number;
}

/**
 * Largest integer cell size that fits the available area, so the board keeps
 * the grid aspect ratio and cells stay pixel-aligned.
 */
export function computeBoardLayout(
  availableWidth: number,
  availableHeight: number,
  cols: number,
  rows: number,
): BoardLayout {
  const fit = Math.floor(Math.min(availableWidth / cols, availableHeight / rows));
  const cellSize = Number.isFinite(fit) ? Math.max(1, fit) : 1;
  return { cellSize, width: cellSize * cols, height: cellSize * rows };
}
