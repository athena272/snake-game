import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { GameStatus } from '../../game';
import { Hud } from './Hud';

interface RenderHudOptions {
  readonly score?: number;
  readonly highScore?: number;
  readonly soundEnabled?: boolean;
}

function renderHud(
  status: GameStatus,
  { score = 3, highScore = 10, soundEnabled = true }: RenderHudOptions = {},
) {
  const onTogglePause = vi.fn();
  const onToggleSound = vi.fn();
  render(
    <Hud
      score={score}
      highScore={highScore}
      status={status}
      soundEnabled={soundEnabled}
      onTogglePause={onTogglePause}
      onToggleSound={onToggleSound}
    />,
  );
  return { onTogglePause, onToggleSound };
}

describe('Hud', () => {
  it('shows the score and the high score', () => {
    renderHud('running', { score: 3, highScore: 10 });
    expect(screen.getByTestId('score')).toHaveTextContent('3');
    expect(screen.getByTestId('high-score')).toHaveTextContent('10');
  });

  it('shows the current score as record while beating it', () => {
    renderHud('running', { score: 12, highScore: 10 });
    expect(screen.getByTestId('high-score')).toHaveTextContent('12');
  });

  it('toggles pause while playing', async () => {
    const { onTogglePause } = renderHud('running');
    await userEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(onTogglePause).toHaveBeenCalledOnce();
  });

  it('offers to resume while paused', () => {
    renderHud('paused');
    expect(screen.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });

  it.each<GameStatus>(['ready', 'over', 'won'])('disables pause while %s', (status) => {
    renderHud(status);
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeDisabled();
  });

  it('offers to mute while sound is on', async () => {
    const { onToggleSound } = renderHud('running', { soundEnabled: true });
    await userEvent.click(screen.getByRole('button', { name: 'Desativar som' }));
    expect(onToggleSound).toHaveBeenCalledOnce();
  });

  it('offers to unmute while sound is off', () => {
    renderHud('running', { soundEnabled: false });
    expect(screen.getByRole('button', { name: 'Ativar som' })).toBeInTheDocument();
  });

  it.each<GameStatus>(['ready', 'running', 'paused', 'over', 'won'])(
    'keeps the sound toggle available while %s',
    (status) => {
      renderHud(status);
      expect(screen.getByRole('button', { name: 'Desativar som' })).toBeEnabled();
    },
  );
});
