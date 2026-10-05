import { Container, Graphics } from 'pixi.js';
import type { BoardLayout } from '../layout';
import { THEME } from '../theme';

/** Static checkerboard; redrawn only when the board is resized. */
export class GridLayer extends Container {
  private readonly cols: number;
  private readonly rows: number;
  private readonly cells = new Graphics();
  private readonly border = new Graphics();

  constructor(cols: number, rows: number) {
    super();
    this.cols = cols;
    this.rows = rows;
    this.addChild(this.cells, this.border);
  }

  resize({ cellSize, width, height }: BoardLayout): void {
    this.cells.clear();
    this.cells.rect(0, 0, width, height).fill(THEME.cellDark);
    for (let y = 0; y < this.rows; y++) {
      for (let x = (y + 1) % 2; x < this.cols; x += 2) {
        this.cells.rect(x * cellSize, y * cellSize, cellSize, cellSize);
      }
    }
    this.cells.fill(THEME.cellLight);

    this.border.clear();
    this.border
      .rect(0, 0, width, height)
      .stroke({ width: 2, color: THEME.boardBorder, alignment: 1 });
  }
}
