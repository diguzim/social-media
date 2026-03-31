import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../../../services/auth';
import { usePaginatedFeedPosts } from '../../../../hooks/usePaginatedFeedPosts';
import type { MyPostsStateContract } from '../../my-posts-state.contract';

export function useMyPostsStatePresenter(): MyPostsStateContract {
  const navigate = useNavigate();
  const userProfile = getUserProfile();
  const { state, actions } = usePaginatedFeedPosts({
    authorId: userProfile?.id,
    pageSize: 10,
    sortOrder: 'desc',
    enabled: Boolean(userProfile?.id),
    reloadToken: userProfile?.id ?? 'no-user',
  });

  const refresh = useCallback(async () => {
    if (!userProfile) {
      navigate('/login', { replace: true });
      return;
    }
    await actions.refresh();
  }, [actions, navigate, userProfile]);

  useEffect(() => {
    if (!userProfile) {
      navigate('/login', { replace: true });
    }
  }, [navigate, userProfile]);

  return {
    state: {
      posts: state.posts,
      isLoading: state.isLoading,
      isLoadingMore: state.isLoadingMore,
      hasMore: state.hasMore,
      error: state.error || state.refreshError,
      loadMoreError: state.loadMoreError,
    },
    actions: {
      refresh,
      loadNextPage: actions.loadNextPage,
    },
  };
}
