import { Container, Sprite, type Texture } from 'pixi.js';
import type { GameState, Point } from '../../game';
import type { BoardLayout } from '../layout';
import type { GameTextures } from '../textures';

const ITEM_SCALE = 1.05;
const PULSE_AMPLITUDE = 0.06;
const PULSE_SPEED = 0.005;

class SpritePool {
  private readonly parent: Container;
  private readonly texture: Texture;
  private readonly sprites: Sprite[] = [];

  constructor(parent: Container, texture: Texture) {
    this.parent = parent;
    this.texture = texture;
  }

  place(points: readonly Point[], cellSize: number, scale: number): void {
    while (this.sprites.length < points.length) {
      const sprite = new Sprite(this.texture);
      sprite.anchor.set(0.5);
      this.parent.addChild(sprite);
      this.sprites.push(sprite);
    }
    this.sprites.forEach((sprite, index) => {
      const point = points[index];
      sprite.visible = point !== undefined;
      if (!point) return;
      sprite.position.set((point.x + 0.5) * cellSize, (point.y + 0.5) * cellSize);
      sprite.width = cellSize * scale;
      sprite.height = cellSize * scale;
    });
  }
}

/** Apple, poisons and traps, each with its own texture. */
export class ItemsLayer extends Container {
  private readonly traps: SpritePool;
  private readonly poisons: SpritePool;
  private readonly apple: SpritePool;
  private readonly applePoints: Point[] = [];

  constructor(textures: GameTextures) {
    super();
    this.traps = new SpritePool(this, textures.trap);
    this.poisons = new SpritePool(this, textures.poison);
    this.apple = new SpritePool(this, textures.apple);
  }

  update(state: GameState, layout: BoardLayout, timeMs: number, animate: boolean): void {
    const pulse = animate ? 1 + Math.sin(timeMs * PULSE_SPEED) * PULSE_AMPLITUDE : 1;
    const { cellSize } = layout;

    this.applePoints.length = 0;
    if (state.apple) this.applePoints.push(state.apple);

    this.traps.place(state.traps, cellSize, ITEM_SCALE);
    this.poisons.place(state.poisons, cellSize, ITEM_SCALE * pulse);
    this.apple.place(this.applePoints, cellSize, ITEM_SCALE * pulse);
  }
}
