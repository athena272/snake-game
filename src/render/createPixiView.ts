import type { GameRendererOptions } from './GameRenderer';
import type { GameView } from './types';

/** Loads PixiJS on demand so the UI shell paints before the renderer is ready. */
export async function createPixiView(options: GameRendererOptions): Promise<GameView> {
  const { GameRenderer } = await import('./GameRenderer');
  return GameRenderer.create(options);
}
