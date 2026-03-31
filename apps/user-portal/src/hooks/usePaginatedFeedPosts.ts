import { useCallback, useEffect, useRef, useState } from 'react';
import { getFeed } from '../services/posts';
import type { FeedPost } from '../services/posts';

interface UsePaginatedFeedPostsParams {
  authorId?: string;
  enabled?: boolean;
  pageSize?: number;
  sortOrder?: 'asc' | 'desc';
  reloadToken?: string;
}

interface PaginatedFeedPostsState {
  posts: FeedPost[];
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string;
  refreshError: string;
  loadMoreError: string;
}

function mergePosts(existing: FeedPost[], incoming: FeedPost[]): FeedPost[] {
  const mergedById = new Map<string, FeedPost>();

  existing.forEach((post) => {
    mergedById.set(post.id, post);
  });

  incoming.forEach((post) => {
    mergedById.set(post.id, post);
  });

  return Array.from(mergedById.values());
}

export function usePaginatedFeedPosts({
  authorId,
  enabled = true,
  pageSize = 10,
  sortOrder = 'desc',
  reloadToken = 'default',
}: UsePaginatedFeedPostsParams) {
  const [state, setState] = useState<PaginatedFeedPostsState>({
    posts: [],
    isLoading: true,
    isRefreshing: false,
    isLoadingMore: false,
    hasMore: false,
    error: '',
    refreshError: '',
    loadMoreError: '',
  });

  const hasLoadedOnceRef = useRef(false);
  const pageRef = useRef(1);
  const isLoadingMoreRef = useRef(false);

  const refresh = useCallback(async () => {
    if (!enabled) {
      return;
    }

    const isInitialLoad = !hasLoadedOnceRef.current;

    setState((current) => ({
      ...current,
      isLoading: isInitialLoad,
      isRefreshing: !isInitialLoad,
      error: isInitialLoad ? '' : current.error,
      refreshError: '',
      loadMoreError: '',
    }));

    try {
      const response = await getFeed({
        authorId,
        page: 1,
        limit: pageSize,
        sortOrder,
      });

      pageRef.current = response.page;

      setState((current) => ({
        ...current,
        posts: response.data,
        isLoading: false,
        isRefreshing: false,
        hasMore: response.page < response.totalPages,
        error: '',
        refreshError: '',
        loadMoreError: '',
      }));

      hasLoadedOnceRef.current = true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load posts';

      setState((current) => ({
        ...current,
        isLoading: false,
        isRefreshing: false,
        error: isInitialLoad ? message : current.error,
        refreshError: isInitialLoad ? '' : message,
      }));
    }
  }, [authorId, enabled, pageSize, sortOrder]);

  const loadNextPage = useCallback(async () => {
    if (
      !enabled ||
      state.isLoading ||
      state.isRefreshing ||
      isLoadingMoreRef.current ||
      !state.hasMore
    ) {
      return;
    }

    isLoadingMoreRef.current = true;
    setState((current) => ({
      ...current,
      isLoadingMore: true,
      loadMoreError: '',
    }));

    try {
      const response = await getFeed({
        authorId,
        page: pageRef.current + 1,
        limit: pageSize,
        sortOrder,
      });

      pageRef.current = response.page;

      setState((current) => ({
        ...current,
        posts: mergePosts(current.posts, response.data),
        hasMore: response.page < response.totalPages,
      }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load more posts';
      setState((current) => ({
        ...current,
        loadMoreError: message,
      }));
    } finally {
      isLoadingMoreRef.current = false;
      setState((current) => ({
        ...current,
        isLoadingMore: false,
      }));
    }
  }, [authorId, enabled, pageSize, sortOrder, state.hasMore, state.isLoading, state.isRefreshing]);

  useEffect(() => {
    if (!enabled) {
      hasLoadedOnceRef.current = false;
      pageRef.current = 1;
      setState((current) => ({
        ...current,
        posts: [],
        isLoading: false,
        isRefreshing: false,
        isLoadingMore: false,
        hasMore: false,
        error: '',
        refreshError: '',
        loadMoreError: '',
      }));
      return;
    }

    void refresh();
  }, [enabled, reloadToken, refresh]);

  return {
    state,
    actions: {
      refresh,
      loadNextPage,
    },
  };
}
