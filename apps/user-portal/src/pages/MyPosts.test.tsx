import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { MyPosts } from './MyPosts';
import { useMyPostsStateContract } from '../state-contracts/my-posts';

vi.mock('../state-contracts/my-posts', () => ({
  useMyPostsStateContract: vi.fn(),
}));

const mockedUseMyPostsStateContract = vi.mocked(useMyPostsStateContract);

describe('MyPosts', () => {
  it('renders loading state', () => {
    mockedUseMyPostsStateContract.mockReturnValue({
      state: {
        posts: [],
        isLoading: true,
        isLoadingMore: false,
        hasMore: false,
        error: '',
        loadMoreError: '',
      },
      actions: {
        refresh: vi.fn().mockResolvedValue(undefined),
        loadNextPage: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <MemoryRouter>
        <MyPosts />
      </MemoryRouter>
    );

    expect(screen.getByTestId('my-posts-loading-text')).toHaveTextContent('Loading your posts...');
  });

  it('renders infinite-scroll states when posts are loaded', () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const loadNextPage = vi.fn().mockResolvedValue(undefined);

    mockedUseMyPostsStateContract.mockReturnValue({
      state: {
        posts: [
          {
            id: 'post-1',
            title: 'My post',
            content: 'Content',
            authorId: 'user-1',
            author: { id: 'user-1', name: 'Alice' },
            createdAt: '2026-03-10T10:00:00.000Z',
          },
        ],
        isLoading: false,
        isLoadingMore: true,
        hasMore: true,
        error: '',
        loadMoreError: 'Temporary issue',
      },
      actions: {
        refresh,
        loadNextPage,
      },
    });

    render(
      <MemoryRouter>
        <MyPosts />
      </MemoryRouter>
    );

    expect(screen.getByTestId('my-posts-list')).toBeInTheDocument();
    expect(screen.getByTestId('my-posts-loading-more')).toHaveTextContent('Loading more posts...');
    expect(screen.getByTestId('my-posts-load-more-error')).toHaveTextContent('Temporary issue');
    expect(screen.getByTestId('my-posts-infinite-sentinel')).toBeInTheDocument();

    expect(screen.getByTestId('my-posts-count')).toHaveTextContent('1 post');
  });
});
