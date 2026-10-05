import { Application, Container } from 'pixi.js';
import type { GameEvent, GameState } from '../game';
import { EffectsLayer } from './effects/EffectsLayer';
import { GridLayer } from './layers/GridLayer';
import { ItemsLayer } from './layers/ItemsLayer';
import { SnakeLayer } from './layers/SnakeLayer';
import type { BoardLayout } from './layout';
import { createGameTextures, destroyGameTextures, type GameTextures } from './textures';
import { THEME } from './theme';
import type { GameView, RenderFrame } from './types';

export interface GameRendererOptions {
  readonly cols: number;
  readonly rows: number;
  readonly reducedMotion: boolean;
}

const MAX_RESOLUTION = 2;

export class GameRenderer implements GameView {
  private readonly app: Application;
  private readonly options: GameRendererOptions;
  private readonly textures: GameTextures;
  private readonly board = new Container();
  private readonly grid: GridLayer;
  private readonly items: ItemsLayer;
  private readonly snake: SnakeLayer;
  private readonly effects: EffectsLayer;
  private layout: BoardLayout = { cellSize: 1, width: 1, height: 1 };
  private destroyed = false;

  /** Pixi v8 initialises asynchronously (WebGL context, shaders). */
  static async create(options: GameRendererOptions): Promise<GameRenderer> {
    const app = new Application();
    try {
      await app.init({
        width: 1,
        height: 1,
        background: THEME.background,
        antialias: true,
        autoStart: false,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, MAX_RESOLUTION),
        preference: 'webgl',
      });
    } catch (error) {
      app.destroy();
      throw error;
    }
    return new GameRenderer(app, options);
  }

  private constructor(app: Application, options: GameRendererOptions) {
    this.app = app;
    this.options = options;
    this.textures = createGameTextures(app.renderer);
    this.grid = new GridLayer(options.cols, options.rows);
    this.items = new ItemsLayer(this.textures);
    this.snake = new SnakeLayer(this.textures);
    this.effects = new EffectsLayer(this.textures, options.reducedMotion);

    this.board.addChild(this.grid, this.items, this.snake, this.effects);
    app.stage.addChild(this.board);
    app.ticker.stop();
  }

  get canvas(): HTMLCanvasElement {
    return this.app.canvas;
  }

  resize(layout: BoardLayout): void {
    if (this.destroyed) return;
    this.layout = layout;
    this.app.renderer.resize(layout.width, layout.height);
    this.grid.resize(layout);
    this.effects.resize(layout);
  }

  render(frame: RenderFrame): void {
    if (this.destroyed) return;
    const { current, timeMs } = frame;
    const animate = !this.options.reducedMotion && current.status === 'running';

    this.items.update(current, this.layout, timeMs, animate);
    this.snake.update(frame, this.layout, current.status === 'over');
    const shake = this.effects.update(this.layout, timeMs);
    this.board.position.set(shake.x, shake.y);
    this.app.render();
  }

  playEvents(events: readonly GameEvent[], state: GameState): void {
    if (this.destroyed) return;
    this.effects.trigger(events, state.snake[0], this.layout, performance.now());
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.app.destroy({ removeView: true }, { children: true });
    destroyGameTextures(this.textures);
  }
}
