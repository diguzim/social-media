import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Feed } from './Feed';
import { getFeed } from '../../services/posts';

vi.mock('../../services/posts', () => ({
  getFeed: vi.fn(),
}));

const mockedGetFeed = vi.mocked(getFeed);

describe('Feed', () => {
  it('requests posts with expected query params and renders feed', async () => {
    mockedGetFeed.mockResolvedValueOnce({
      data: [
        {
          id: 'p1',
          title: 'Post A',
          content: 'Content A',
          authorId: 'u1',
          author: { id: 'u1', name: 'Alice' },
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
      expect(mockedGetFeed).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sortOrder: 'desc',
      });
    });

    expect(await screen.findByTestId('feed-section')).toBeInTheDocument();
    expect(screen.getByTestId('post-title-p1')).toHaveTextContent('Post A');
    expect(screen.getByTestId('post-author-p1')).toHaveTextContent('Author: Alice');
  });

  it('renders empty state when no posts are returned', async () => {
    mockedGetFeed.mockResolvedValueOnce({
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
    mockedGetFeed.mockRejectedValueOnce(new Error('Failed to fetch feed'));

    render(<Feed />);

    expect(await screen.findByTestId('feed-error-state')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch feed')).toBeInTheDocument();
  });
});
