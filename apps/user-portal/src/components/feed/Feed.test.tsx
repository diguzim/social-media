import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import { Feed } from './Feed';
import { getFeed } from '../../services/posts';

vi.mock('../../services/posts', () => ({
  getFeed: vi.fn(),
}));

const mockedGetFeed = vi.mocked(getFeed);

let intersectionCallback: ((entries: Array<{ isIntersecting: boolean }>) => void) | null = null;

class MockIntersectionObserver {
  constructor(callback: (entries: Array<{ isIntersecting: boolean }>) => void) {
    intersectionCallback = callback;
  }

  observe() {
    return undefined;
  }

  disconnect() {
    return undefined;
  }
}

vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

function createDeferredPromise<T>(result: T) {
  let resolve!: () => void;

  const promise = new Promise<T>((res) => {
    resolve = () => {
      res(result);
    };
  });

  return { promise, resolve };
}

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

    renderWithRouter(<Feed />);

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
    expect(screen.getByTestId('post-author-link-p1')).toHaveTextContent('Alice');
  });

  it('renders empty state when no posts are returned', async () => {
    mockedGetFeed.mockResolvedValueOnce({
      data: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    renderWithRouter(<Feed />);

    expect(await screen.findByTestId('feed-empty-state')).toBeInTheDocument();
    expect(screen.getByText('No posts yet.')).toBeInTheDocument();
  });

  it('renders error state when request fails', async () => {
    mockedGetFeed.mockRejectedValueOnce(new Error('Failed to fetch feed'));

    renderWithRouter(<Feed />);

    expect(await screen.findByTestId('feed-error-state')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch feed')).toBeInTheDocument();
  });

  it('keeps current posts visible while a background refresh is pending', async () => {
    const deferredRefreshResult = {
      data: [
        {
          id: 'p2',
          title: 'Refreshed post',
          content: 'Content B',
          authorId: 'u2',
          author: { id: 'u2', name: 'Bob' },
          createdAt: '2026-03-08T12:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    };

    const deferredRefresh = createDeferredPromise(deferredRefreshResult);

    mockedGetFeed
      .mockResolvedValueOnce({
        data: [
          {
            id: 'p1',
            title: 'First load',
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
      })
      .mockReturnValueOnce(deferredRefresh.promise);

    const { rerender } = renderWithRouter(<Feed refreshKey={0} />);

    expect(await screen.findByTestId('feed-section')).toBeInTheDocument();
    expect(screen.getByTestId('post-title-p1')).toHaveTextContent('First load');

    rerender(
      <MemoryRouter>
        <Feed refreshKey={1} />
      </MemoryRouter>
    );

    expect(screen.getByTestId('post-title-p1')).toBeInTheDocument();
    expect(screen.getByTestId('feed-refreshing-status')).toHaveTextContent('Refreshing feed...');

    deferredRefresh.resolve();

    await waitFor(() => {
      expect(screen.getByTestId('post-title-p2')).toHaveTextContent('Refreshed post');
    });
  });

  it('loads next page when infinite-scroll sentinel intersects', async () => {
    mockedGetFeed
      .mockResolvedValueOnce({
        data: [
          {
            id: 'p1',
            title: 'First page post',
            content: 'Content A',
            authorId: 'u1',
            author: { id: 'u1', name: 'Alice' },
            createdAt: '2026-03-07T10:00:00.000Z',
          },
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 2,
      })
      .mockResolvedValueOnce({
        data: [
          {
            id: 'p2',
            title: 'Second page post',
            content: 'Content B',
            authorId: 'u2',
            author: { id: 'u2', name: 'Bob' },
            createdAt: '2026-03-08T10:00:00.000Z',
          },
        ],
        total: 2,
        page: 2,
        limit: 10,
        totalPages: 2,
      });

    renderWithRouter(<Feed />);

    expect(await screen.findByTestId('feed-section')).toBeInTheDocument();
    expect(screen.getByTestId('post-title-p1')).toHaveTextContent('First page post');

    await act(async () => {
      intersectionCallback?.([{ isIntersecting: true }]);
    });

    await waitFor(() => {
      expect(mockedGetFeed).toHaveBeenLastCalledWith({
        page: 2,
        limit: 10,
        sortOrder: 'desc',
      });
    });

    expect(await screen.findByTestId('post-title-p2')).toHaveTextContent('Second page post');
  });
});
