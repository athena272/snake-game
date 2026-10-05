import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { GameView } from '../../render/types';
import { createFakeView } from '../../test/fakes';
import { GameCanvas } from './GameCanvas';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function renderCanvas(createView: () => Promise<GameView>) {
  const onViewChange = vi.fn();
  const utils = render(
    <GameCanvas
      cols={24}
      rows={18}
      reducedMotion={false}
      createView={createView}
      onViewChange={onViewChange}
    >
      <p>overlay</p>
    </GameCanvas>,
  );
  return { ...utils, onViewChange };
}

describe('GameCanvas', () => {
  it('shows a loading state until the renderer is ready', async () => {
    const pending = deferred<GameView>();
    const view = createFakeView();
    const { container, onViewChange } = renderCanvas(() => pending.promise);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando o jogo…');
    expect(screen.queryByText('overlay')).not.toBeInTheDocument();

    await act(async () => {
      pending.resolve(view);
      await pending.promise;
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByText('overlay')).toBeInTheDocument();
    expect(container.querySelector('canvas')).toBe(view.canvas);
    expect(onViewChange).toHaveBeenCalledWith(view);
  });

  it('shows an error with a working retry when the renderer fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const view = createFakeView();
    const createView = vi
      .fn<() => Promise<GameView>>()
      .mockRejectedValueOnce(new Error('WebGL unavailable'))
      .mockResolvedValueOnce(view);

    renderCanvas(createView);
    expect(await screen.findByRole('alert')).toHaveTextContent('WebGL');

    await userEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));

    expect(await screen.findByText('overlay')).toBeInTheDocument();
    expect(createView).toHaveBeenCalledTimes(2);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('destroys a renderer that finishes loading after unmount', async () => {
    const pending = deferred<GameView>();
    const view = createFakeView();
    const { unmount, onViewChange } = renderCanvas(() => pending.promise);

    unmount();
    await act(async () => {
      pending.resolve(view);
      await pending.promise;
    });

    expect(view.destroy).toHaveBeenCalledOnce();
    expect(onViewChange).not.toHaveBeenCalled();
  });

  it('detaches and destroys the renderer on unmount', async () => {
    const view = createFakeView();
    const { unmount, onViewChange } = renderCanvas(() => Promise.resolve(view));
    await screen.findByText('overlay');

    unmount();

    expect(onViewChange).toHaveBeenLastCalledWith(null);
    expect(view.destroy).toHaveBeenCalledOnce();
  });
});
