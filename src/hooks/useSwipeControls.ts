import { useEffect, useRef, type RefObject } from 'react';
import type { Direction, Point } from '../game';
import { detectSwipe } from '../input/swipe';

/**
 * Emits a direction as soon as a drag passes the threshold (no need to lift
 * the finger) and re-anchors, so one continuous gesture can chain turns.
 */
export function useSwipeControls(
  ref: RefObject<HTMLElement | null>,
  onSwipe: (direction: Direction) => void,
): void {
  const onSwipeRef = useRef(onSwipe);
  useEffect(() => {
    onSwipeRef.current = onSwipe;
  }, [onSwipe]);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let origin: Point | null = null;
    let activePointer: number | null = null;

    const handleDown = (event: PointerEvent): void => {
      if (event.isPrimary === false) return;
      origin = { x: event.clientX, y: event.clientY };
      activePointer = event.pointerId;
    };

    const handleMove = (event: PointerEvent): void => {
      if (!origin || event.pointerId !== activePointer) return;
      const current = { x: event.clientX, y: event.clientY };
      const direction = detectSwipe(origin, current);
      if (direction) {
        onSwipeRef.current(direction);
        origin = current;
      }
    };

    const handleEnd = (event: PointerEvent): void => {
      if (event.pointerId !== activePointer) return;
      origin = null;
      activePointer = null;
    };

    element.addEventListener('pointerdown', handleDown);
    element.addEventListener('pointermove', handleMove);
    element.addEventListener('pointerup', handleEnd);
    element.addEventListener('pointercancel', handleEnd);
    return () => {
      element.removeEventListener('pointerdown', handleDown);
      element.removeEventListener('pointermove', handleMove);
      element.removeEventListener('pointerup', handleEnd);
      element.removeEventListener('pointercancel', handleEnd);
    };
  }, [ref]);
}
