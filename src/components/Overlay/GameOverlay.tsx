import type { GameStatus } from '../../game';
import { Button } from '../Button/Button';
import { ItemLegend } from './ItemLegend';
import styles from './Overlay.module.css';
import { OverlayPanel } from './OverlayPanel';

interface GameOverlayProps {
  readonly status: GameStatus;
  readonly score: number;
  readonly highScore: number;
  readonly isNewRecord: boolean;
  readonly onStart: () => void;
  readonly onResume: () => void;
  readonly onRestart: () => void;
}

export function GameOverlay({
  status,
  score,
  highScore,
  isNewRecord,
  onStart,
  onResume,
  onRestart,
}: GameOverlayProps) {
  switch (status) {
    case 'running':
      return null;

    case 'ready':
      return (
        <OverlayPanel title="Snake">
          <ItemLegend />
          <p className={styles.hint}>
            Setas ou WASD para mover · P para pausar · M para som · deslize no celular
          </p>
          <Button onClick={onStart} autoFocus>
            Jogar
          </Button>
        </OverlayPanel>
      );

    case 'paused':
      return (
        <OverlayPanel title="Pausado">
          <div className={styles.actions}>
            <Button onClick={onResume} autoFocus>
              Continuar
            </Button>
            <Button variant="secondary" onClick={onRestart}>
              Reiniciar
            </Button>
          </div>
        </OverlayPanel>
      );

    case 'over':
    case 'won':
      return (
        <OverlayPanel title={status === 'won' ? 'Você venceu!' : 'Fim de jogo'}>
          {isNewRecord && <p className={styles.badge}>Novo recorde!</p>}
          <dl className={styles.summary}>
            <div>
              <dt>Pontos</dt>
              <dd>{score}</dd>
            </div>
            <div>
              <dt>Recorde</dt>
              <dd>{Math.max(score, highScore)}</dd>
            </div>
          </dl>
          <Button onClick={onRestart} autoFocus>
            Jogar novamente
          </Button>
        </OverlayPanel>
      );
  }
}
