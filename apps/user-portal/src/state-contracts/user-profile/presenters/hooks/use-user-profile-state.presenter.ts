import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicProfile } from '../../../../services/auth';
import { usePaginatedFeedPosts } from '../../../../hooks/usePaginatedFeedPosts';
import type { UserProfileStateContract } from '../../user-profile-state.contract';

export function useUserProfileStatePresenter(): UserProfileStateContract {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfileStateContract['state']['profile']>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { state: postsState, actions: postsActions } = usePaginatedFeedPosts({
    authorId: userId,
    pageSize: 10,
    sortOrder: 'desc',
    enabled: Boolean(userId),
    reloadToken: userId ?? 'invalid-user',
  });

  const fetchUserProfile = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setError('Invalid user profile route');
      setIsLoading(false);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await getPublicProfile(userId);
      setProfile(response);
    } catch (err) {
      setProfile(null);
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const refreshPosts = useCallback(async () => {
    if (!userId) {
      return;
    }
    await postsActions.refresh();
  }, [postsActions, userId]);

  useEffect(() => {
    void fetchUserProfile();
  }, [fetchUserProfile]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchUserProfile(), refreshPosts()]);
  }, [fetchUserProfile, refreshPosts]);

  return {
    state: {
      profile,
      error,
      isLoading,
      posts: postsState.posts,
      isPostsLoading: postsState.isLoading,
      isLoadingMorePosts: postsState.isLoadingMore,
      hasMorePosts: postsState.hasMore,
      postsError: userId
        ? postsState.error || postsState.refreshError
        : 'Invalid user profile route',
      postsLoadMoreError: postsState.loadMoreError,
    },
    actions: {
      refresh,
      refreshPosts,
      loadNextPostsPage: postsActions.loadNextPage,
    },
  };
}
