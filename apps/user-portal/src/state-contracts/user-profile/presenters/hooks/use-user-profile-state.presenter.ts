import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicProfile, getUserProfile } from '../../../../services/auth';
import { getFriendshipStatus, listFriends, sendFriendRequest } from '../../../../services/friends';
import { usePaginatedFeedPosts } from '../../../../hooks/usePaginatedFeedPosts';
import type { UserProfileStateContract } from '../../user-profile-state.contract';

export function useUserProfileStatePresenter(): UserProfileStateContract {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<UserProfileStateContract['state']['profile']>(null);
  const [userId, setUserId] = useState<string | undefined>(undefined);
  const [error, setError] = useState('');
  const [isOwnProfile, setIsOwnProfile] =
    useState<UserProfileStateContract['state']['isOwnProfile']>(false);
  const [friendshipStatus, setFriendshipStatus] =
    useState<UserProfileStateContract['state']['friendshipStatus']>('none');
  const [friendshipError, setFriendshipError] = useState('');
  const [isFriendshipActionPending, setIsFriendshipActionPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [friends, setFriends] = useState<UserProfileStateContract['state']['friends']>([]);
  const [isFriendsLoading, setIsFriendsLoading] = useState(false);
  const [friendsError, setFriendsError] = useState('');
  const [canViewAcceptedFriends, setCanViewAcceptedFriends] = useState(false);
  const { state: postsState, actions: postsActions } = usePaginatedFeedPosts({
    authorId: userId,
    pageSize: 10,
    sortOrder: 'desc',
    enabled: Boolean(userId),
    reloadToken: userId ?? 'invalid-user',
  });

  const fetchUserProfile = useCallback(async () => {
    if (!username) {
      setProfile(null);
      setUserId(undefined);
      setIsOwnProfile(false);
      setError('Invalid user profile route');
      setIsLoading(false);
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await getPublicProfile(username);
      setProfile(response);
      setUserId(response.id);

      const currentUser = getUserProfile();
      const isCurrentUserProfile = currentUser?.username === response.username;
      setIsOwnProfile(isCurrentUserProfile);

      if (isCurrentUserProfile) {
        setFriendshipStatus('self');
        setCanViewAcceptedFriends(true);
        setFriendsError('');
        setIsFriendsLoading(true);

        try {
          const friendsResponse = await listFriends();
          setFriends(friendsResponse.data);
        } catch (friendsErr) {
          setFriendsError(
            friendsErr instanceof Error ? friendsErr.message : 'Failed to load friends'
          );
        } finally {
          setIsFriendsLoading(false);
        }
      } else {
        const friendship = await getFriendshipStatus(response.username);
        setFriendshipStatus(friendship.status);
        setCanViewAcceptedFriends(false);
        setFriends([]);
        setIsFriendsLoading(false);
        setFriendsError('');
      }
      setFriendshipError('');
    } catch (err) {
      setProfile(null);
      setUserId(undefined);
      setIsOwnProfile(false);
      setError(err instanceof Error ? err.message : 'Failed to load user profile');
      setFriendshipStatus('none');
      setFriendshipError('');
      setCanViewAcceptedFriends(false);
      setFriends([]);
      setIsFriendsLoading(false);
      setFriendsError('');
    } finally {
      setIsLoading(false);
    }
  }, [username]);

  const sendRequest = useCallback(async () => {
    if (!profile) {
      return;
    }

    setFriendshipError('');
    setIsFriendshipActionPending(true);

    try {
      await sendFriendRequest({ targetUsername: profile.username });
      setFriendshipStatus('pending_outgoing');
    } catch (err) {
      setFriendshipError(err instanceof Error ? err.message : 'Failed to send friend request');
    } finally {
      setIsFriendshipActionPending(false);
    }
  }, [profile]);

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
      isOwnProfile,
      friendshipStatus,
      friendshipError,
      isFriendshipActionPending,
      posts: postsState.posts,
      isPostsLoading: postsState.isLoading,
      isLoadingMorePosts: postsState.isLoadingMore,
      hasMorePosts: postsState.hasMore,
      postsError: userId
        ? postsState.error || postsState.refreshError
        : 'Invalid user profile route',
      postsLoadMoreError: postsState.loadMoreError,
      friends,
      isFriendsLoading,
      friendsError,
      canViewAcceptedFriends,
    },
    actions: {
      refresh,
      refreshPosts,
      sendFriendRequest: sendRequest,
      loadNextPostsPage: postsActions.loadNextPage,
    },
  };
}
