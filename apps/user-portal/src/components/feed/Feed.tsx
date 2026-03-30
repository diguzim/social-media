import { FeedView } from './feed/FeedView';
import { useFeedController } from './feed/useFeedController';

interface FeedProps {
  refreshKey?: number;
}

export function Feed({ refreshKey = 0 }: FeedProps) {
  const { state, actions } = useFeedController({ refreshKey });

  return (
    <FeedView
      posts={state.posts}
      loading={state.loading}
      isRefreshing={state.isRefreshing}
      error={state.error}
      refreshError={state.refreshError}
      onReactionChange={actions.triggerReactionRefresh}
    />
  );
}
