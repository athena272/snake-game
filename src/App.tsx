import { useCallback, useRef, useState } from 'react';
import styles from './App.module.css';
import { DirectionPad } from './components/DirectionPad/DirectionPad';
import { GameCanvas } from './components/GameCanvas/GameCanvas';
import { Hud } from './components/Hud/Hud';
import { GameOverlay } from './components/Overlay/GameOverlay';
import { useDirectionPadPreference } from './hooks/useDirectionPadPreference';
import { useGameController } from './hooks/useGameController';
import { useHighScore } from './hooks/useHighScore';
import { useKeyboardControls } from './hooks/useKeyboardControls';
import { usePrefersReducedMotion } from './hooks/usePrefersReducedMotion';
import { useSwipeControls } from './hooks/useSwipeControls';
import { createPixiView } from './render/createPixiView';

export function App() {
  const { highScore, submitScore } = useHighScore();
  const [isNewRecord, setIsNewRecord] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const directionPad = useDirectionPadPreference();
  const swipeSurfaceRef = useRef<HTMLDivElement>(null);

  const handleFinish = useCallback(
    (score: number) => {
      setIsNewRecord(submitScore(score));
    },
    [submitScore],
  );

  const { config, snapshot, actions, attachView } = useGameController({ onFinish: handleFinish });
  useKeyboardControls(actions);
  useSwipeControls(swipeSurfaceRef, actions.turn);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Snake</h1>
        <Hud
          score={snapshot.score}
          highScore={highScore}
          status={snapshot.status}
          onTogglePause={actions.togglePause}
        />
      </header>

      <main className={styles.stage}>
        <div ref={swipeSurfaceRef} className={styles.swipeSurface}>
          <GameCanvas
            cols={config.cols}
            rows={config.rows}
            reducedMotion={reducedMotion}
            createView={createPixiView}
            onViewChange={attachView}
          >
            <GameOverlay
              status={snapshot.status}
              score={snapshot.score}
              highScore={highScore}
              isNewRecord={isNewRecord}
              onStart={actions.start}
              onResume={actions.togglePause}
              onRestart={actions.restart}
            />
          </GameCanvas>
        </div>

        {directionPad.visible && <DirectionPad onTurn={actions.turn} />}

        <button
          type="button"
          className={styles.padToggle}
          aria-pressed={directionPad.visible}
          onClick={directionPad.toggle}
        >
          {directionPad.visible ? 'Ocultar botões' : 'Mostrar botões'}
        </button>
      </main>
    </div>
  );
}
