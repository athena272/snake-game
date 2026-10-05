import { Container, Graphics, Sprite } from 'pixi.js';
import type { GameEvent, Point } from '../../game';
import type { BoardLayout } from '../layout';
import type { GameTextures } from '../textures';
import { THEME } from '../theme';
import { easeOutQuad, effectProgress, fadeOut, shakeOffset, type Offset } from './effectMath';

const PARTICLE_POOL_SIZE = 32;
const PARTICLE_LIFE_MS = 420;
const PARTICLES_PER_BURST = 10;

interface EffectSpec {
  readonly color: number;
  readonly flashAlpha: number;
  readonly flashMs: number;
  readonly shakePx: number;
  readonly shakeMs: number;
  readonly particles: number;
}

const EFFECTS: Readonly<Record<GameEvent, EffectSpec>> = {
  ate: {
    color: THEME.eatParticle,
    flashAlpha: 0,
    flashMs: 0,
    shakePx: 0,
    shakeMs: 0,
    particles: PARTICLES_PER_BURST,
  },
  poisoned: {
    color: THEME.poisonFlash,
    flashAlpha: 0.22,
    flashMs: 260,
    shakePx: 3,
    shakeMs: 200,
    particles: 6,
  },
  died: {
    color: THEME.deathFlash,
    flashAlpha: 0.35,
    flashMs: 450,
    shakePx: 6,
    shakeMs: 320,
    particles: 0,
  },
  won: {
    color: THEME.eatParticle,
    flashAlpha: 0.2,
    flashMs: 600,
    shakePx: 0,
    shakeMs: 0,
    particles: PARTICLE_POOL_SIZE,
  },
};

interface Particle {
  readonly sprite: Sprite;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  bornAt: number;
}

/**
 * Short, pooled feedback effects: particle bursts, a full-board colour flash
 * and a small screen shake. With reduced motion only a softer flash remains.
 */
export class EffectsLayer extends Container {
  private readonly reducedMotion: boolean;
  private readonly particles: Particle[] = [];
  private readonly flash = new Graphics();
  private readonly shake: Offset = { x: 0, y: 0 };
  private flashStart = Number.NEGATIVE_INFINITY;
  private flashSpec: EffectSpec = EFFECTS.died;
  private shakeStart = Number.NEGATIVE_INFINITY;
  private shakeSpec: EffectSpec = EFFECTS.died;

  constructor(textures: GameTextures, reducedMotion: boolean) {
    super();
    this.reducedMotion = reducedMotion;
    this.flash.alpha = 0;
    this.addChild(this.flash);

    for (let i = 0; i < PARTICLE_POOL_SIZE; i++) {
      const sprite = new Sprite(textures.particle);
      sprite.anchor.set(0.5);
      sprite.visible = false;
      this.addChild(sprite);
      this.particles.push({
        sprite,
        originX: 0,
        originY: 0,
        vx: 0,
        vy: 0,
        bornAt: Number.NEGATIVE_INFINITY,
      });
    }
  }

  resize({ width, height }: BoardLayout): void {
    this.flash.clear().rect(0, 0, width, height).fill(0xffffff);
  }

  trigger(
    events: readonly GameEvent[],
    at: Point | undefined,
    layout: BoardLayout,
    nowMs: number,
  ): void {
    for (const event of events) {
      const spec = EFFECTS[event];
      if (spec.flashAlpha > 0) {
        this.flashSpec = spec;
        this.flashStart = nowMs;
        this.flash.tint = spec.color;
      }
      if (this.reducedMotion) continue;
      if (spec.shakePx > 0) {
        this.shakeSpec = spec;
        this.shakeStart = nowMs;
      }
      if (spec.particles > 0 && at) {
        this.burst(at, spec, layout, nowMs);
      }
    }
  }

  /** Advances the effects and returns the board shake offset for this frame. */
  update(layout: BoardLayout, nowMs: number): Offset {
    const flashProgress = effectProgress(this.flashStart, this.flashSpec.flashMs, nowMs);
    const flashScale = this.reducedMotion ? 0.5 : 1;
    this.flash.alpha = fadeOut(this.flashSpec.flashAlpha * flashScale, flashProgress);

    const particleSize = layout.cellSize * 0.32;
    for (const particle of this.particles) {
      const { sprite } = particle;
      if (!sprite.visible) continue;
      const progress = effectProgress(particle.bornAt, PARTICLE_LIFE_MS, nowMs);
      if (progress >= 1) {
        sprite.visible = false;
        continue;
      }
      const travelSeconds = easeOutQuad(progress) * (PARTICLE_LIFE_MS / 1000);
      sprite.position.set(
        particle.originX + particle.vx * travelSeconds,
        particle.originY + particle.vy * travelSeconds,
      );
      sprite.alpha = 1 - progress;
      sprite.width = sprite.height = particleSize * (1 - progress * 0.6);
    }

    const shakeProgress = effectProgress(this.shakeStart, this.shakeSpec.shakeMs, nowMs);
    return shakeOffset(this.shakeSpec.shakePx, shakeProgress, nowMs, this.shake);
  }

  private burst(at: Point, spec: EffectSpec, { cellSize }: BoardLayout, nowMs: number): void {
    const centerX = (at.x + 0.5) * cellSize;
    const centerY = (at.y + 0.5) * cellSize;
    let spawned = 0;

    for (const particle of this.particles) {
      if (spawned >= spec.particles) break;
      if (particle.sprite.visible) continue;
      const angle = (spawned / spec.particles) * Math.PI * 2 + Math.random() * 0.6;
      const speed = cellSize * (2.5 + Math.random() * 2);
      particle.vx = Math.cos(angle) * speed;
      particle.vy = Math.sin(angle) * speed;
      particle.bornAt = nowMs;
      particle.originX = centerX;
      particle.originY = centerY;
      particle.sprite.position.set(centerX, centerY);
      particle.sprite.tint = spec.color;
      particle.sprite.alpha = 1;
      particle.sprite.visible = true;
      spawned++;
    }
  }
}
