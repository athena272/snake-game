import { Graphics, Rectangle, type Renderer, type Texture } from 'pixi.js';
import { THEME } from './theme';

/** Textures are drawn once at this size and scaled to the current cell size. */
export const TEXTURE_SIZE = 64;

export interface GameTextures {
  readonly segment: Texture;
  readonly eyes: Texture;
  readonly apple: Texture;
  readonly poison: Texture;
  readonly trap: Texture;
  readonly particle: Texture;
}

const S = TEXTURE_SIZE;
const C = S / 2;

function drawSegment(g: Graphics): void {
  g.roundRect(2, 2, S - 4, S - 4, 18).fill(0xffffff);
}

/** Eyes looking right; the head container is rotated for other directions. */
function drawEyes(g: Graphics): void {
  for (const y of [C - 13, C + 13]) {
    g.circle(C + 10, y, 9).fill(THEME.eyeWhite);
    g.circle(C + 14, y, 4.5).fill(THEME.eyePupil);
  }
}

function drawApple(g: Graphics): void {
  g.circle(C, C + 4, 22).fill(THEME.apple);
  g.circle(C - 8, C - 4, 6).fill({ color: THEME.appleHighlight, alpha: 0.7 });
  g.roundRect(C - 2, 6, 4, 12, 2).fill(THEME.appleStem);
  g.ellipse(C + 9, 12, 9, 5).fill(THEME.appleLeaf);
}

function drawPoison(g: Graphics): void {
  g.poly([C, 4, C + 22, C + 8, C, S - 4, C - 22, C + 8]).fill(THEME.poisonDark);
  g.circle(C, C + 10, 20).fill(THEME.poison);
  g.circle(C - 7, C + 6, 4).fill({ color: THEME.poisonBubble, alpha: 0.85 });
  g.circle(C + 6, C + 15, 3).fill({ color: THEME.poisonBubble, alpha: 0.6 });
  g.circle(C + 3, C, 2).fill({ color: THEME.poisonBubble, alpha: 0.6 });
}

function drawTrap(g: Graphics): void {
  g.star(C, C, 8, 28, 16).fill(THEME.trap);
  g.circle(C, C, 13).fill(THEME.trapDark);
  g.moveTo(C - 6, C - 6)
    .lineTo(C + 6, C + 6)
    .moveTo(C + 6, C - 6)
    .lineTo(C - 6, C + 6)
    .stroke({ width: 4, color: THEME.trap, cap: 'round' });
}

function drawParticle(g: Graphics): void {
  g.circle(C, C, C - 4).fill(0xffffff);
}

function bake(renderer: Renderer, draw: (g: Graphics) => void): Texture {
  const graphics = new Graphics();
  draw(graphics);
  const texture = renderer.generateTexture({
    target: graphics,
    frame: new Rectangle(0, 0, S, S),
    resolution: 2,
    antialias: true,
    defaultAnchor: { x: 0.5, y: 0.5 },
  });
  graphics.destroy();
  return texture;
}

export function createGameTextures(renderer: Renderer): GameTextures {
  return {
    segment: bake(renderer, drawSegment),
    eyes: bake(renderer, drawEyes),
    apple: bake(renderer, drawApple),
    poison: bake(renderer, drawPoison),
    trap: bake(renderer, drawTrap),
    particle: bake(renderer, drawParticle),
  };
}

export function destroyGameTextures(textures: GameTextures): void {
  const all: readonly Texture[] = [
    textures.segment,
    textures.eyes,
    textures.apple,
    textures.poison,
    textures.trap,
    textures.particle,
  ];
  all.forEach((texture) => {
    texture.destroy(true);
  });
}
