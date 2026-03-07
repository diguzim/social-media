import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Feed } from './Feed';
import { getPosts } from '../../services/posts';

vi.mock('../../services/posts', () => ({
  getPosts: vi.fn(),
}));

const mockedGetPosts = vi.mocked(getPosts);

describe('Feed', () => {
  it('requests posts with expected query params and renders feed', async () => {
    mockedGetPosts.mockResolvedValueOnce({
      data: [
        {
          id: 'p1',
          title: 'Post A',
          content: 'Content A',
          authorId: 'u1',
          createdAt: '2026-03-07T10:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    });

    render(<Feed />);

    expect(screen.getByTestId('feed-loading-state')).toBeInTheDocument();

    await waitFor(() => {
      expect(mockedGetPosts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortOrder: 'desc',
      });
    });

    expect(await screen.findByTestId('feed-section')).toBeInTheDocument();
    expect(screen.getByTestId('post-title-p1')).toHaveTextContent('Post A');
  });

  it('renders empty state when no posts are returned', async () => {
    mockedGetPosts.mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    render(<Feed />);

    expect(await screen.findByTestId('feed-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No posts yet.')).toBeInTheDocument();
  });

  it('renders error state when request fails', async () => {
    mockedGetPosts.mockRejectedValueOnce(new Error('Failed to fetch posts'));

    render(<Feed />);

    expect(await screen.findByTestId('feed-error-state')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch posts')).toBeInTheDocument();
  });
});
