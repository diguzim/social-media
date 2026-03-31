import { FeedView } from './feed/FeedView';
import { useFeedController } from './feed/useFeedController';
import { useInfiniteScrollObserver } from '../infinite-scroll/useInfiniteScrollObserver';

interface FeedProps {
  refreshKey?: number;
}

export function Feed({ refreshKey = 0 }: FeedProps) {
  const { state, actions } = useFeedController({ refreshKey });

  const sentinelRef = useInfiniteScrollObserver({
    enabled: state.hasMore && !state.loading && !state.isRefreshing && !state.isLoadingMore,
    onIntersect: () => {
      void actions.loadNextPage();
    },
  });

  return (
    <FeedView
      posts={state.posts}
      loading={state.loading}
      isRefreshing={state.isRefreshing}
      isLoadingMore={state.isLoadingMore}
      error={state.error}
      refreshError={state.refreshError}
      loadMoreError={state.loadMoreError}
      hasMore={state.hasMore}
      onReactionChange={actions.triggerReactionRefresh}
      sentinelRef={sentinelRef}
    />
  );
}
