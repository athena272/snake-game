import { useEffect, useState, type RefObject } from 'react';

export interface ElementSize {
  readonly width: number;
  readonly height: number;
}

const EMPTY_SIZE: ElementSize = { width: 0, height: 0 };

/** Tracks the content box of an element (ResizeObserver, window resize fallback). */
export function useElementSize(ref: RefObject<HTMLElement | null>): ElementSize {
  const [size, setSize] = useState<ElementSize>(EMPTY_SIZE);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = (): void => {
      const { clientWidth: width, clientHeight: height } = element;
      setSize((prev) =>
        prev.width === width && prev.height === height ? prev : { width, height },
      );
    };

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      const frame = window.requestAnimationFrame(measure);
      return () => {
        window.removeEventListener('resize', measure);
        window.cancelAnimationFrame(frame);
      };
    }

    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => {
      observer.disconnect();
    };
  }, [ref]);

  return size;
}
