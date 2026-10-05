import type { MouseEvent, PointerEvent } from 'react';
import type { Direction } from '../../game';
import styles from './DirectionPad.module.css';

const BUTTONS: readonly { direction: Direction; label: string; symbol: string }[] = [
  { direction: 'up', label: 'Cima', symbol: '▲' },
  { direction: 'left', label: 'Esquerda', symbol: '◀' },
  { direction: 'right', label: 'Direita', symbol: '▶' },
  { direction: 'down', label: 'Baixo', symbol: '▼' },
];

interface DirectionPadProps {
  readonly onTurn: (direction: Direction) => void;
}

export function DirectionPad({ onTurn }: DirectionPadProps) {
  return (
    <div className={styles.pad} role="group" aria-label="Controles direcionais">
      {BUTTONS.map(({ direction, label, symbol }) => (
        <button
          key={direction}
          type="button"
          className={`${styles.button} ${styles[direction]}`}
          aria-label={label}
          // Pointer down reacts faster than click on touch screens.
          onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
            event.preventDefault();
            onTurn(direction);
          }}
          // Keyboard activation (Enter/Space) produces a click with detail 0.
          onClick={(event: MouseEvent<HTMLButtonElement>) => {
            if (event.detail === 0) onTurn(direction);
          }}
        >
          <span aria-hidden="true">{symbol}</span>
        </button>
      ))}
    </div>
  );
}
