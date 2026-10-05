import { Container, Sprite } from 'pixi.js';
import type { Direction } from '../../game';
import { interpolateAxis, wrapGhostOffset } from '../interpolation';
import type { BoardLayout } from '../layout';
import type { GameTextures } from '../textures';
import { mixColors, THEME } from '../theme';
import type { RenderFrame } from '../types';

const BODY_SCALE = 0.9;
const HEAD_SCALE = 1;

const HEAD_ROTATION: Readonly<Record<Direction, number>> = {
  right: 0,
  down: Math.PI / 2,
  left: Math.PI,
  up: -Math.PI / 2,
};

class SnakeHead extends Container {
  readonly skin: Sprite;

  constructor(textures: GameTextures) {
    super();
    this.skin = new Sprite(textures.segment);
    this.skin.anchor.set(0.5);
    const eyes = new Sprite(textures.eyes);
    eyes.anchor.set(0.5);
    this.addChild(this.skin, eyes);
  }
}

/**
 * Snake drawn from pooled sprites: positions are interpolated between the two
 * last logic states, and segments crossing a border get a mirrored copy on the
 * opposite side so wrap-around looks continuous.
 */
export class SnakeLayer extends Container {
  private readonly textures: GameTextures;
  private readonly bodyLayer = new Container();
  private readonly segments: Sprite[] = [];
  private readonly heads: readonly SnakeHead[];
  private usedSegments = 0;
  private usedHeads = 0;

  constructor(textures: GameTextures) {
    super();
    this.textures = textures;
    this.heads = [new SnakeHead(textures), new SnakeHead(textures)];
    this.addChild(this.bodyLayer, ...this.heads);
  }

  update(frame: RenderFrame, layout: BoardLayout, dead: boolean): void {
    const { previous, current, alpha } = frame;
    const { cols, rows } = current.config;
    const snake = current.snake;
    this.usedSegments = 0;
    this.usedHeads = 0;

    for (let i = snake.length - 1; i >= 0; i--) {
      const to = snake[i];
      if (!to) continue;
      const from = previous.snake[i] ?? to;
      const x = interpolateAxis(from.x, to.x, alpha, cols);
      const y = interpolateAxis(from.y, to.y, alpha, rows);

      if (i === 0) {
        const tint = dead ? THEME.snakeDead : THEME.snakeHead;
        this.forEachCopy(x, y, cols, rows, (cx, cy) => {
          this.placeHead(cx, cy, tint, current.direction, layout.cellSize);
        });
      } else {
        const ratio = snake.length > 1 ? i / (snake.length - 1) : 0;
        const tint = dead
          ? THEME.snakeDead
          : mixColors(THEME.snakeBodyStart, THEME.snakeBodyEnd, ratio);
        this.forEachCopy(x, y, cols, rows, (cx, cy) => {
          this.placeSegment(cx, cy, tint, layout.cellSize);
        });
      }
    }

    this.segments.forEach((sprite, index) => {
      sprite.visible = index < this.usedSegments;
    });
    this.heads.forEach((head, index) => {
      head.visible = index < this.usedHeads;
    });
  }

  private forEachCopy(
    x: number,
    y: number,
    cols: number,
    rows: number,
    place: (x: number, y: number) => void,
  ): void {
    place(x, y);
    const dx = wrapGhostOffset(x, cols);
    const dy = wrapGhostOffset(y, rows);
    if (dx !== 0) place(x + dx, y);
    if (dy !== 0) place(x, y + dy);
    if (dx !== 0 && dy !== 0) place(x + dx, y + dy);
  }

  private placeSegment(x: number, y: number, tint: number, cellSize: number): void {
    let sprite = this.segments[this.usedSegments];
    if (!sprite) {
      sprite = new Sprite(this.textures.segment);
      sprite.anchor.set(0.5);
      this.bodyLayer.addChild(sprite);
      this.segments.push(sprite);
    }
    this.usedSegments++;
    sprite.tint = tint;
    sprite.position.set((x + 0.5) * cellSize, (y + 0.5) * cellSize);
    sprite.width = cellSize * BODY_SCALE;
    sprite.height = cellSize * BODY_SCALE;
  }

  private placeHead(
    x: number,
    y: number,
    tint: number,
    direction: Direction,
    cellSize: number,
  ): void {
    const head = this.heads[this.usedHeads];
    if (!head) return;
    this.usedHeads++;
    head.skin.tint = tint;
    head.position.set((x + 0.5) * cellSize, (y + 0.5) * cellSize);
    head.rotation = HEAD_ROTATION[direction];
    head.scale.set((cellSize * HEAD_SCALE) / head.skin.texture.width);
  }
}
