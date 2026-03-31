import type { FeedPost } from '../../../services/posts';
import type { RefObject } from 'react';
import { InlineStatus } from '../../loading/InlineStatus';
import { SectionSkeleton } from '../../loading/SectionSkeleton';
import { PostCard } from '../PostCard';

interface FeedViewProps {
  posts: FeedPost[];
  loading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string;
  refreshError: string;
  loadMoreError: string;
  hasMore: boolean;
  onReactionChange: () => void;
  sentinelRef: RefObject<HTMLDivElement | null>;
}

export function FeedView({
  posts,
  loading,
  isRefreshing,
  isLoadingMore,
  error,
  refreshError,
  loadMoreError,
  hasMore,
  onReactionChange,
  sentinelRef,
}: FeedViewProps) {
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
          <PostCard key={post.id} post={post} onReactionChange={onReactionChange} />
        ))}
      </div>

      {loadMoreError && (
        <InlineStatus
          dataTestId="feed-load-more-error"
          tone="warning"
          message={`Could not load more posts. ${loadMoreError}`}
          className="mt-3"
        />
      )}

      {isLoadingMore && (
        <InlineStatus
          dataTestId="feed-loading-more-status"
          message="Loading more posts..."
          className="mt-3"
        />
      )}

      {hasMore ? (
        <div data-testid="feed-infinite-sentinel" ref={sentinelRef} className="h-2 w-full" />
      ) : (
        <p data-testid="feed-end-of-list" className="mt-3 text-center text-xs text-slate-500">
          You&apos;ve reached the end of the feed.
        </p>
      )}
    </section>
  );
}
