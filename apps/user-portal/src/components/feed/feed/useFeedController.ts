import { useEffect, useRef, useState } from 'react';
import { getFeed } from '../../../services/posts';
import type { FeedPost } from '../../../services/posts';

interface UseFeedControllerParams {
  refreshKey: number;
}

export function useFeedController({ refreshKey }: UseFeedControllerParams) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshError, setRefreshError] = useState('');
  const [reactionRefreshKey, setReactionRefreshKey] = useState(0);
  const hasLoadedOnceRef = useRef(false);

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

      try {
        const response = await getFeed({
          page: 1,
          limit: 10,
          sortOrder: 'desc',
        });

        if (!isActive) {
          return;
        }

        setPosts(response.data);
        setError('');
        setRefreshError('');
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

  const triggerReactionRefresh = () => {
    setReactionRefreshKey((current) => current + 1);
  };

  return {
    state: {
      posts,
      loading,
      isRefreshing,
      error,
      refreshError,
    },
    actions: {
      triggerReactionRefresh,
    },
  };
}
