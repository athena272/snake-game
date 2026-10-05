import type { Point } from './types';

export function pointEquals(a: Point, b: Point): boolean {
  return a.x === b.x && a.y === b.y;
}

export function translate(point: Point, delta: Point): Point {
  return { x: point.x + delta.x, y: point.y + delta.y };
}

/** Mathematical modulo: always returns a value in `[0, size)`, also for negative inputs. */
export function wrap(value: number, size: number): number {
  return ((value % size) + size) % size;
}

export function wrapPoint(point: Point, cols: number, rows: number): Point {
  return { x: wrap(point.x, cols), y: wrap(point.y, rows) };
}

export function containsPoint(points: readonly Point[], target: Point): boolean {
  return points.some((point) => pointEquals(point, target));
}

export function indexOfPoint(points: readonly Point[], target: Point): number {
  return points.findIndex((point) => pointEquals(point, target));
}
