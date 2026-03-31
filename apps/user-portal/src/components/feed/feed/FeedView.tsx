import type { FeedPost } from '../../../services/posts';
import type { RefObject } from 'react';
import { InlineStatus } from '../../loading/InlineStatus';
import { SectionSkeleton } from '../../loading/SectionSkeleton';
import { PostCardsInfiniteList } from '../../post-list/PostCardsInfiniteList';

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
  sentinelRef: RefObject<HTMLDivElement>;
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

      <PostCardsInfiniteList
        posts={posts}
        onReactionChange={onReactionChange}
        listTestId="feed-post-list"
        className="grid gap-3"
        loadMoreError={loadMoreError}
        loadMoreErrorMessage={(currentError) => `Could not load more posts. ${currentError}`}
        loadMoreErrorTestId="feed-load-more-error"
        isLoadingMore={isLoadingMore}
        loadingMoreMessage="Loading more posts..."
        loadingMoreTestId="feed-loading-more-status"
        hasMore={hasMore}
        sentinelRef={sentinelRef}
        sentinelTestId="feed-infinite-sentinel"
        sentinelClassName="h-2 w-full"
        endMessage="You've reached the end of the feed."
        endTestId="feed-end-of-list"
      />
    </section>
  );
}
