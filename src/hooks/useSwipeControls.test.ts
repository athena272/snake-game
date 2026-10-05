import { fireEvent, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Direction } from '../game';
import { useSwipeControls } from './useSwipeControls';

function setup() {
  const element = document.createElement('div');
  document.body.appendChild(element);
  const onSwipe = vi.fn<(direction: Direction) => void>();
  const hook = renderHook(() => {
    useSwipeControls({ current: element }, onSwipe);
  });
  return { ...hook, element, onSwipe };
}

const pointer = (clientX: number, clientY: number, isPrimary = true) => ({
  pointerId: isPrimary ? 1 : 2,
  isPrimary,
  clientX,
  clientY,
});

describe('useSwipeControls', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('emits a direction once the drag passes the threshold, before lifting', () => {
    const { element, onSwipe } = setup();
    fireEvent.pointerDown(element, pointer(100, 100));
    fireEvent.pointerMove(element, pointer(110, 102));
    expect(onSwipe).not.toHaveBeenCalled();

    fireEvent.pointerMove(element, pointer(140, 104));
    expect(onSwipe).toHaveBeenCalledExactlyOnceWith('right');
  });

  it('chains turns within one continuous gesture', () => {
    const { element, onSwipe } = setup();
    fireEvent.pointerDown(element, pointer(100, 100));
    fireEvent.pointerMove(element, pointer(140, 100));
    fireEvent.pointerMove(element, pointer(140, 60));
    expect(onSwipe.mock.calls).toEqual([['right'], ['up']]);
  });

  it('ignores movement without a pressed pointer and after release', () => {
    const { element, onSwipe } = setup();
    fireEvent.pointerMove(element, pointer(200, 200));
    fireEvent.pointerDown(element, pointer(100, 100));
    fireEvent.pointerUp(element, pointer(100, 100));
    fireEvent.pointerMove(element, pointer(100, 200));
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('ignores secondary fingers (e.g. pinch)', () => {
    const { element, onSwipe } = setup();
    fireEvent.pointerDown(element, pointer(100, 100, false));
    fireEvent.pointerMove(element, pointer(100, 200, false));
    expect(onSwipe).not.toHaveBeenCalled();
  });

  it('detaches listeners on unmount', () => {
    const { element, onSwipe, unmount } = setup();
    unmount();
    fireEvent.pointerDown(element, pointer(100, 100));
    fireEvent.pointerMove(element, pointer(100, 200));
    expect(onSwipe).not.toHaveBeenCalled();
  });
});
