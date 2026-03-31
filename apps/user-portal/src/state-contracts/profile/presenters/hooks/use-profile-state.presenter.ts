import { useCallback, useEffect, useState } from 'react';
import { getProfile, getUserProfile, uploadProfileAvatar } from '../../../../services/auth';
import { usePaginatedFeedPosts } from '../../../../hooks/usePaginatedFeedPosts';
import { listFriends } from '../../../../services/friends';
import type { ProfileStateContract } from '../../profile-state.contract';

export function useProfileStatePresenter(): ProfileStateContract {
  const [user, setUser] = useState<ProfileStateContract['state']['user']>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState('');
  const [friends, setFriends] = useState<ProfileStateContract['state']['friends']>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(true);
  const [friendsError, setFriendsError] = useState('');
  const { state: postsState, actions: postsActions } = usePaginatedFeedPosts({
    authorId: user?.id,
    pageSize: 10,
    sortOrder: 'desc',
    enabled: Boolean(user?.id),
    reloadToken: user?.id ?? 'no-profile-user',
  });

  const fetchProfile = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      const profile = await getProfile();
      setUser(profile);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load profile';
      setError(message);
      const cachedUser = getUserProfile();
      if (cachedUser) {
        setUser(cachedUser);
        setError('');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    const loadFriends = async () => {
      setFriendsError('');
      setIsFriendsLoading(true);

      try {
        const response = await listFriends();
        setFriends(response.data);
      } catch (err) {
        setFriendsError(err instanceof Error ? err.message : 'Failed to load friends');
      } finally {
        setIsFriendsLoading(false);
      }
    };

    void loadFriends();
  }, []);

  const refresh = useCallback(async () => {
    await fetchProfile();
    if (user?.id) {
      await postsActions.refresh();
    }
  }, [fetchProfile, postsActions, user?.id]);

  const refreshPosts = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    await postsActions.refresh();
  }, [postsActions, user?.id]);

  const uploadAvatar = useCallback(
    async (file: File) => {
      setAvatarUploadError('');
      setIsAvatarUploading(true);

      try {
        await uploadProfileAvatar(file);
        await fetchProfile();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to upload profile image';
        setAvatarUploadError(message);
      } finally {
        setIsAvatarUploading(false);
      }
    },
    [fetchProfile]
  );

  return {
    state: {
      user,
      error,
      isLoading,
      isAvatarUploading,
      avatarUploadError,
      posts: postsState.posts,
      isPostsLoading: postsState.isLoading,
      isLoadingMorePosts: postsState.isLoadingMore,
      hasMorePosts: postsState.hasMore,
      postsError: postsState.error || postsState.refreshError,
      postsLoadMoreError: postsState.loadMoreError,
      friends,
      isFriendsLoading,
      friendsError,
    },
    actions: {
      refresh,
      uploadAvatar,
      refreshPosts,
      loadNextPostsPage: postsActions.loadNextPage,
    },
  };
}
