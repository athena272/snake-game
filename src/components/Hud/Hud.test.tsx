import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { GameStatus } from '../../game';
import { Hud } from './Hud';

function renderHud(status: GameStatus, score = 3, highScore = 10) {
  const onTogglePause = vi.fn();
  render(<Hud score={score} highScore={highScore} status={status} onTogglePause={onTogglePause} />);
  return { onTogglePause };
}

describe('Hud', () => {
  it('shows the score and the high score', () => {
    renderHud('running', 3, 10);
    expect(screen.getByTestId('score')).toHaveTextContent('3');
    expect(screen.getByTestId('high-score')).toHaveTextContent('10');
  });

  it('shows the current score as record while beating it', () => {
    renderHud('running', 12, 10);
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
});
