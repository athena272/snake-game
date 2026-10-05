import type { GameStatus } from '../../game';
import styles from './Hud.module.css';

interface HudProps {
  readonly score: number;
  readonly highScore: number;
  readonly status: GameStatus;
  readonly soundEnabled: boolean;
  readonly onTogglePause: () => void;
  readonly onToggleSound: () => void;
}

function SpeakerIcon({ muted }: { readonly muted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
      {muted ? (
        <path d="M16 9.5l5 5M21 9.5l-5 5" />
      ) : (
        <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
      )}
    </svg>
  );
}

export function Hud({
  score,
  highScore,
  status,
  soundEnabled,
  onTogglePause,
  onToggleSound,
}: HudProps) {
  const canPause = status === 'running' || status === 'paused';
  const isPaused = status === 'paused';
  const soundLabel = soundEnabled ? 'Desativar som' : 'Ativar som';

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
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onToggleSound}
          aria-label={soundLabel}
          title={`${soundLabel} (M)`}
        >
          <SpeakerIcon muted={!soundEnabled} />
        </button>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onTogglePause}
          disabled={!canPause}
          aria-label={isPaused ? 'Continuar' : 'Pausar'}
          title={isPaused ? 'Continuar (P)' : 'Pausar (P)'}
        >
          <span aria-hidden="true">{isPaused ? '▶' : '❚❚'}</span>
        </button>
      </div>
    </div>
  );
}
