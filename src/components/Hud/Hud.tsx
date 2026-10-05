import type { GameStatus } from '../../game';
import styles from './Hud.module.css';

interface HudProps {
  readonly score: number;
  readonly highScore: number;
  readonly status: GameStatus;
  readonly onTogglePause: () => void;
}

export function Hud({ score, highScore, status, onTogglePause }: HudProps) {
  const canPause = status === 'running' || status === 'paused';
  const isPaused = status === 'paused';

  return (
    <div className={styles.hud}>
      <dl className={styles.stats}>
        <div className={styles.stat}>
          <dt>Pontos</dt>
          <dd data-testid="score">{score}</dd>
        </div>
        <div className={styles.stat}>
          <dt>Recorde</dt>
          <dd data-testid="high-score">{Math.max(score, highScore)}</dd>
        </div>
      </dl>
      <button
        type="button"
        className={styles.pause}
        onClick={onTogglePause}
        disabled={!canPause}
        aria-label={isPaused ? 'Continuar' : 'Pausar'}
        title={isPaused ? 'Continuar (P)' : 'Pausar (P)'}
      >
        <span aria-hidden="true">{isPaused ? '▶' : '❚❚'}</span>
      </button>
    </div>
  );
}
