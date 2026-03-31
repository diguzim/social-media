import { useState } from 'react';
import { usePaginatedFeedPosts } from '../../../hooks/usePaginatedFeedPosts';

interface UseFeedControllerParams {
  refreshKey: number;
}

export function useFeedController({ refreshKey }: UseFeedControllerParams) {
  const [reactionRefreshKey, setReactionRefreshKey] = useState(0);
  const { state, actions } = usePaginatedFeedPosts({
    pageSize: 10,
    sortOrder: 'desc',
    reloadToken: `${refreshKey}-${reactionRefreshKey}`,
  });

  const triggerReactionRefresh = () => {
    setReactionRefreshKey((current) => current + 1);
  };

  return {
    state: {
      posts: state.posts,
      loading: state.isLoading,
      isRefreshing: state.isRefreshing,
      isLoadingMore: state.isLoadingMore,
      error: state.error,
      refreshError: state.refreshError,
      loadMoreError: state.loadMoreError,
      hasMore: state.hasMore,
    },
    actions: {
      triggerReactionRefresh,
      loadNextPage: actions.loadNextPage,
    },
  };
}
