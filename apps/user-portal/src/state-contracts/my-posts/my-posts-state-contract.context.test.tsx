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
      <span data-testid="my-posts-state-has-more">{String(state.hasMore)}</span>
      <button data-testid="my-posts-refresh-btn" onClick={() => void actions.refresh()}>
        refresh
      </button>
      <button data-testid="my-posts-load-next-btn" onClick={() => void actions.loadNextPage()}>
        load-next
      </button>
    </div>
  );
}

describe('MyPostsStateContractProvider', () => {
  it('injects a custom MyPostsStateContract implementation', () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const loadNextPage = vi.fn().mockResolvedValue(undefined);

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
        isLoadingMore: false,
        hasMore: true,
        error: '',
        loadMoreError: '',
      },
      actions: {
        refresh,
        loadNextPage,
      },
    });

    render(
      <MyPostsStateContractProvider myPostsStateContract={useFakeMyPostsStateContract}>
        <TestConsumer />
      </MyPostsStateContractProvider>
    );

    expect(screen.getByTestId('my-posts-state-count')).toHaveTextContent('1');
    expect(screen.getByTestId('my-posts-state-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('my-posts-state-has-more')).toHaveTextContent('true');

    screen.getByTestId('my-posts-refresh-btn').click();
    expect(refresh).toHaveBeenCalledTimes(1);

    screen.getByTestId('my-posts-load-next-btn').click();
    expect(loadNextPage).toHaveBeenCalledTimes(1);
  });
});
