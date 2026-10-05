import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Direction } from '../../game';
import { DirectionPad } from './DirectionPad';

function setup() {
  const onTurn = vi.fn<(direction: Direction) => void>();
  render(<DirectionPad onTurn={onTurn} />);
  return { onTurn };
}

describe('DirectionPad', () => {
  it.each<[string, Direction]>([
    ['Cima', 'up'],
    ['Baixo', 'down'],
    ['Esquerda', 'left'],
    ['Direita', 'right'],
  ])('turns %s on pointer down', (label, direction) => {
    const { onTurn } = setup();
    fireEvent.pointerDown(screen.getByRole('button', { name: label }));
    expect(onTurn).toHaveBeenCalledExactlyOnceWith(direction);
  });

  it('turns only once for a full tap (pointer down + click)', async () => {
    const { onTurn } = setup();
    await userEvent.click(screen.getByRole('button', { name: 'Cima' }));
    expect(onTurn).toHaveBeenCalledExactlyOnceWith('up');
  });

  it('is keyboard accessible', async () => {
    const { onTurn } = setup();
    screen.getByRole('button', { name: 'Esquerda' }).focus();
    await userEvent.keyboard('{Enter}');
    expect(onTurn).toHaveBeenCalledExactlyOnceWith('left');
  });
});
