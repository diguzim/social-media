import { useEffect, useRef, useState } from 'react';
import { getFeed } from '../../services/posts';
import type { FeedPost } from '../../services/posts';
import { InlineStatus } from '../loading/InlineStatus';
import { SectionSkeleton } from '../loading/SectionSkeleton';
import { PostCard } from './PostCard';

interface FeedProps {
  refreshKey?: number;
}

export function Feed({ refreshKey = 0 }: FeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [refreshError, setRefreshError] = useState('');
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
        } else {
          setRefreshError(message);
        }
      } finally {
        if (isActive) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    };

    loadFeed();

    return () => {
      isActive = false;
    };
  }, [refreshKey]);

  if (loading && posts.length === 0) {
    return (
      <SectionSkeleton
        dataTestId="feed-loading-state"
        title="Feed"
        variant="list"
        minHeight={260}
      />
    );
  }

  if (error && posts.length === 0) {
    return (
      <section data-testid="feed-error-state">
        <h2 className="mb-3 text-2xl font-semibold text-slate-900">Feed</h2>
        <p className="text-danger-600">{error}</p>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section data-testid="feed-empty-state">
        <h2 className="mb-3 text-2xl font-semibold text-slate-900">Feed</h2>
        <p className="text-slate-600">No posts yet.</p>
      </section>
    );
  }

  return (
    <section data-testid="feed-section">
      <h2 className="mb-3 text-2xl font-semibold text-slate-900">Feed</h2>

      {isRefreshing && (
        <InlineStatus
          dataTestId="feed-refreshing-status"
          message="Refreshing feed..."
          className="mb-3"
        />
      )}

      {refreshError && (
        <InlineStatus
          dataTestId="feed-refresh-error"
          tone="warning"
          message={`Showing current posts. ${refreshError}`}
          className="mb-3"
        />
      )}

      <div className="grid gap-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
