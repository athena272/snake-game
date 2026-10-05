import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { GameStatus } from '../../game';
import { GameOverlay } from './GameOverlay';

function renderOverlay(status: GameStatus, overrides: { isNewRecord?: boolean } = {}) {
  const handlers = { onStart: vi.fn(), onResume: vi.fn(), onRestart: vi.fn() };
  const utils = render(
    <GameOverlay
      status={status}
      score={7}
      highScore={9}
      isNewRecord={overrides.isNewRecord ?? false}
      {...handlers}
    />,
  );
  return { ...utils, ...handlers };
}

describe('GameOverlay', () => {
  it('renders nothing while running', () => {
    const { container } = renderOverlay('running');
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the start screen with the item legend', async () => {
    const { onStart } = renderOverlay('ready');
    expect(screen.getByRole('dialog', { name: 'Snake' })).toBeInTheDocument();
    expect(screen.getByText('Maçã')).toBeInTheDocument();
    expect(screen.getByText('Veneno')).toBeInTheDocument();
    expect(screen.getByText('Armadilha')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Jogar' }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('shows the pause screen with resume and restart', async () => {
    const { onResume, onRestart } = renderOverlay('paused');
    expect(screen.getByRole('dialog', { name: 'Pausado' })).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Continuar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Reiniciar' }));
    expect(onResume).toHaveBeenCalledOnce();
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it('shows the game over screen with the final score', async () => {
    const { onRestart } = renderOverlay('over');
    expect(screen.getByRole('dialog', { name: 'Fim de jogo' })).toBeInTheDocument();
    expect(screen.getByText('7', { selector: 'dd' })).toBeInTheDocument();
    expect(screen.queryByText('Novo recorde!')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Jogar novamente' }));
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it('celebrates a new record', () => {
    renderOverlay('over', { isNewRecord: true });
    expect(screen.getByText('Novo recorde!')).toBeInTheDocument();
  });

  it('shows the victory title when the board is full', () => {
    renderOverlay('won');
    expect(screen.getByRole('dialog', { name: 'Você venceu!' })).toBeInTheDocument();
  });
});
