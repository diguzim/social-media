import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  MyPostsStateContractProvider,
  useMyPostsStateContract,
  type UseMyPostsStateContract,
} from './index';

function TestConsumer() {
  const { state, actions } = useMyPostsStateContract();

  return (
    <div>
      <span data-testid="my-posts-state-count">{state.posts.length}</span>
      <span data-testid="my-posts-state-loading">{String(state.isLoading)}</span>
      <button data-testid="my-posts-refresh-btn" onClick={() => void actions.refresh()}>
        refresh
      </button>
    </div>
  );
}

describe('MyPostsStateContractProvider', () => {
  it('injects a custom MyPostsStateContract implementation', () => {
    const refresh = vi.fn().mockResolvedValue(undefined);

    const useFakeMyPostsStateContract: UseMyPostsStateContract = () => ({
      state: {
        posts: [
          {
            id: 'post-1',
            title: 'Injected Post',
            content: 'Injected content',
            authorId: 'user-1',
            author: { id: 'user-1', name: 'Injected User' },
            createdAt: '2026-03-01T00:00:00.000Z',
          },
        ],
        isLoading: false,
        error: '',
      },
      actions: {
        refresh,
      },
    });

    render(
      <MyPostsStateContractProvider myPostsStateContract={useFakeMyPostsStateContract}>
        <TestConsumer />
      </MyPostsStateContractProvider>
    );

    expect(screen.getByTestId('my-posts-state-count')).toHaveTextContent('1');
    expect(screen.getByTestId('my-posts-state-loading')).toHaveTextContent('false');

    screen.getByTestId('my-posts-refresh-btn').click();
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
