import { useCallback, useRef, useState } from 'react';
import { appStore } from '../services/appStore';
import { loadHighScore, saveHighScore } from '../services/highScore';
import type { KeyValueStore } from '../services/storage';

export interface HighScoreApi {
  readonly highScore: number;
  /** Persists the score if it beats the record; returns whether it did. */
  readonly submitScore: (score: number) => boolean;
}

export function useHighScore(store: KeyValueStore = appStore): HighScoreApi {
  const [highScore, setHighScore] = useState(() => loadHighScore(store));
  const highScoreRef = useRef(highScore);

  const submitScore = useCallback(
    (score: number): boolean => {
      if (score <= highScoreRef.current) return false;
      highScoreRef.current = score;
      saveHighScore(store, score);
      setHighScore(score);
      return true;
    },
    [store],
  );

  return { highScore, submitScore };
}
