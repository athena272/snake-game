import { useEffect } from 'react';
import type { GameCommand } from '../input/commands';
import { mapKeyToCommand } from '../input/keyboard';
import type { GameActions } from './useGameController';

export type CommandActions = Pick<GameActions, 'turn' | 'togglePause' | 'confirm'>;

export function applyCommand(actions: CommandActions, command: GameCommand): void {
  switch (command.type) {
    case 'turn':
      actions.turn(command.direction);
      break;
    case 'pause':
      actions.togglePause();
      break;
    case 'confirm':
      actions.confirm();
      break;
  }
}

function isInteractiveElement(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      ['BUTTON', 'INPUT', 'TEXTAREA', 'SELECT', 'A'].includes(target.tagName))
  );
}

export function useKeyboardControls(actions: CommandActions): void {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      const command = mapKeyToCommand(event);
      if (!command) return;
      // Enter/Space on a focused button already activates it natively.
      if (command.type === 'confirm' && isInteractiveElement(event.target)) return;

      event.preventDefault();
      if (event.repeat && command.type !== 'turn') return;
      applyCommand(actions, command);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [actions]);
}
