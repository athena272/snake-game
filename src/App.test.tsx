import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { createFakeView } from './test/fakes';

vi.mock('./render/createPixiView', () => ({
  createPixiView: vi.fn(() => Promise.resolve(createFakeView())),
}));

describe('App', () => {
  it('renders the title and the HUD', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'Snake' })).toBeInTheDocument();
    expect(screen.getByTestId('score')).toHaveTextContent('0');
  });

  it('shows the start screen once the renderer is ready and starts the game', async () => {
    render(<App />);
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');

    await userEvent.click(await screen.findByRole('button', { name: 'Jogar' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeEnabled();
  });
});
