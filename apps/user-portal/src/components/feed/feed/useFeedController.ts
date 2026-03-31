import { useEffect, useRef, useState } from 'react';
import { getFeed } from '../../../services/posts';
import type { FeedPost } from '../../../services/posts';

interface UseFeedControllerParams {
  refreshKey: number;
}

const FEED_PAGE_SIZE = 10;

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

export function useFeedController({ refreshKey }: UseFeedControllerParams) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [refreshError, setRefreshError] = useState('');
  const [loadMoreError, setLoadMoreError] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [reactionRefreshKey, setReactionRefreshKey] = useState(0);
  const hasLoadedOnceRef = useRef(false);
  const pageRef = useRef(1);
  const totalPagesRef = useRef(1);
  const isLoadingMoreRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    const loadFeed = async () => {
      const isInitialLoad = !hasLoadedOnceRef.current;

      if (isInitialLoad) {
        setLoading(true);
        setError('');
      } else {
        setIsRefreshing(true);
        setRefreshError('');
      }

      setLoadMoreError('');

      try {
        const response = await getFeed({
          page: 1,
          limit: FEED_PAGE_SIZE,
          sortOrder: 'desc',
        });

        if (!isActive) {
          return;
        }

        setPosts(response.data);
        setError('');
        setRefreshError('');
        setLoadMoreError('');
        pageRef.current = response.page;
        totalPagesRef.current = response.totalPages;
        setHasMore(response.page < response.totalPages);
        hasLoadedOnceRef.current = true;
      } catch (err) {
        if (!isActive) {
          return;
        }

        const message = err instanceof Error ? err.message : 'Failed to load feed';

        if (isInitialLoad) {
          setError(message);
          return;
        }

        setRefreshError(message);
      } finally {
        if (isActive) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    void loadFeed();

    return () => {
      isActive = false;
    };
  }, [refreshKey, reactionRefreshKey]);

  const loadNextPage = async () => {
    if (loading || isRefreshing || isLoadingMoreRef.current || !hasMore) {
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadMoreError('');

    const nextPage = pageRef.current + 1;

    try {
      const response = await getFeed({
        page: nextPage,
        limit: FEED_PAGE_SIZE,
        sortOrder: 'desc',
      });

      pageRef.current = response.page;
      totalPagesRef.current = response.totalPages;
      setHasMore(response.page < response.totalPages);
      setPosts((current) => mergePosts(current, response.data));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load more posts';
      setLoadMoreError(message);
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  };

  const triggerReactionRefresh = () => {
    setReactionRefreshKey((current) => current + 1);
  };

  return {
    state: {
      posts,
      loading,
      isRefreshing,
      isLoadingMore,
      error,
      refreshError,
      loadMoreError,
      hasMore,
    },
    actions: {
      triggerReactionRefresh,
      loadNextPage,
    },
  };
}
