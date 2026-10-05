import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useElementSize } from '../../hooks/useElementSize';
import type { GameRendererOptions } from '../../render/GameRenderer';
import { computeBoardLayout } from '../../render/layout';
import type { GameView } from '../../render/types';
import { Button } from '../Button/Button';
import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator';
import styles from './GameCanvas.module.css';

type ViewStatus = 'loading' | 'ready' | 'error';

interface GameCanvasProps {
  readonly cols: number;
  readonly rows: number;
  readonly reducedMotion: boolean;
  readonly createView: (options: GameRendererOptions) => Promise<GameView>;
  readonly onViewChange: (view: GameView | null) => void;
  /** Overlays shown on top of the board once the renderer is ready. */
  readonly children?: ReactNode;
}

export function GameCanvas({
  cols,
  rows,
  reducedMotion,
  createView,
  onViewChange,
  children,
}: GameCanvasProps) {
  const areaRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<GameView | null>(null);
  const [status, setStatus] = useState<ViewStatus>('loading');
  const [attempt, setAttempt] = useState(0);
  const area = useElementSize(areaRef);

  const latest = useRef({ createView, onViewChange, reducedMotion });
  useEffect(() => {
    latest.current = { createView, onViewChange, reducedMotion };
  });

  useEffect(() => {
    let cancelled = false;
    let created: GameView | null = null;

    latest.current
      .createView({ cols, rows, reducedMotion: latest.current.reducedMotion })
      .then((instance) => {
        // React StrictMode (and fast unmounts) can cancel before init resolves.
        if (cancelled) {
          instance.destroy();
          return;
        }
        created = instance;
        hostRef.current?.appendChild(instance.canvas);
        setView(instance);
        setStatus('ready');
        latest.current.onViewChange(instance);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        console.error('Failed to initialise the renderer', error);
        setStatus('error');
      });

    return () => {
      cancelled = true;
      if (created) {
        latest.current.onViewChange(null);
        created.destroy();
        setView(null);
      }
    };
  }, [cols, rows, attempt]);

  const layout = useMemo(
    () => computeBoardLayout(area.width, area.height, cols, rows),
    [area.width, area.height, cols, rows],
  );
  const measured = area.width > 0 && area.height > 0;

  useEffect(() => {
    if (view && measured) view.resize(layout);
  }, [view, layout, measured]);

  const retry = (): void => {
    setStatus('loading');
    setAttempt((value) => value + 1);
  };

  return (
    <div ref={areaRef} className={styles.area}>
      <div
        className={styles.board}
        style={{
          aspectRatio: `${cols} / ${rows}`,
          ...(measured && { width: layout.width, height: layout.height }),
        }}
      >
        <div ref={hostRef} className={styles.host} />
        {status === 'loading' && <LoadingIndicator label="Carregando o jogo…" />}
        {status === 'error' && (
          <div className={styles.error} role="alert">
            <p>Não foi possível iniciar o jogo. Seu navegador precisa suportar WebGL.</p>
            <Button onClick={retry}>Tentar novamente</Button>
          </div>
        )}
        {status === 'ready' && children}
      </div>
    </div>
  );
}
