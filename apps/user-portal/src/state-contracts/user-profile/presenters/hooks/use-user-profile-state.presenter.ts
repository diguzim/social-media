import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicProfile } from '../../../../services/auth';
import { getFeed } from '../../../../services/posts';
import type { FeedPost } from '../../../../services/posts';
import type { UserProfileStateContract } from '../../user-profile-state.contract';

const USER_PROFILE_POSTS_PAGE_SIZE = 10;

function mergePosts(existing: FeedPost[], incoming: FeedPost[]): FeedPost[] {
  const map = new Map<string, FeedPost>();

  existing.forEach((post) => {
    map.set(post.id, post);
  });

  incoming.forEach((post) => {
    map.set(post.id, post);
  });

  return Array.from(map.values());
}

export function useUserProfileStatePresenter(): UserProfileStateContract {
  const { userId } = useParams<{ userId: string }>();
  const [profile, setProfile] = useState<UserProfileStateContract['state']['profile']>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isPostsLoading, setIsPostsLoading] = useState(true);
  const [isLoadingMorePosts, setIsLoadingMorePosts] = useState(false);
  const [hasMorePosts, setHasMorePosts] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [postsLoadMoreError, setPostsLoadMoreError] = useState('');
  const [postsPage, setPostsPage] = useState(1);

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
      setPosts([]);
      setPostsError('Invalid user profile route');
      setIsPostsLoading(false);
      setHasMorePosts(false);
      return;
    }

    setPostsError('');
    setPostsLoadMoreError('');
    setIsPostsLoading(true);

    try {
      const response = await getFeed({
        authorId: userId,
        page: 1,
        limit: USER_PROFILE_POSTS_PAGE_SIZE,
        sortOrder: 'desc',
      });

      setPosts(response.data);
      setPostsPage(response.page);
      setHasMorePosts(response.page < response.totalPages);
    } catch (err) {
      setPosts([]);
      setPostsError(err instanceof Error ? err.message : 'Failed to load user posts');
      setHasMorePosts(false);
    } finally {
      setIsPostsLoading(false);
    }
  }, [userId]);

  const loadNextPostsPage = useCallback(async () => {
    if (!userId || isPostsLoading || isLoadingMorePosts || !hasMorePosts) {
      return;
    }

    setIsLoadingMorePosts(true);
    setPostsLoadMoreError('');

    try {
      const response = await getFeed({
        authorId: userId,
        page: postsPage + 1,
        limit: USER_PROFILE_POSTS_PAGE_SIZE,
        sortOrder: 'desc',
      });

      setPosts((current) => mergePosts(current, response.data));
      setPostsPage(response.page);
      setHasMorePosts(response.page < response.totalPages);
    } catch (err) {
      setPostsLoadMoreError(err instanceof Error ? err.message : 'Failed to load more posts');
    } finally {
      setIsLoadingMorePosts(false);
    }
  }, [hasMorePosts, isLoadingMorePosts, isPostsLoading, postsPage, userId]);

  useEffect(() => {
    void fetchUserProfile();
    void refreshPosts();
  }, [fetchUserProfile, refreshPosts]);

  const refresh = useCallback(async () => {
    await Promise.all([fetchUserProfile(), refreshPosts()]);
  }, [fetchUserProfile, refreshPosts]);

  return {
    state: {
      profile,
      error,
      isLoading,
      posts,
      isPostsLoading,
      isLoadingMorePosts,
      hasMorePosts,
      postsError,
      postsLoadMoreError,
    },
    actions: {
      refresh,
      refreshPosts,
      loadNextPostsPage,
    },
  };
}
