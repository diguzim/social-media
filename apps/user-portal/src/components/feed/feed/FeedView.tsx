import type { FeedPost } from '../../../services/posts';
import { InlineStatus } from '../../loading/InlineStatus';
import { SectionSkeleton } from '../../loading/SectionSkeleton';
import { PostCard } from '../PostCard';

interface FeedViewProps {
  posts: FeedPost[];
  loading: boolean;
  isRefreshing: boolean;
  error: string;
  refreshError: string;
  onReactionChange: () => void;
}

export function FeedView({
  posts,
  loading,
  isRefreshing,
  error,
  refreshError,
  onReactionChange,
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
    </section>
  );
}
