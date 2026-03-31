import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../../../services/auth';
import type { FeedPost } from '../../../../services/posts';
import { getFeed } from '../../../../services/posts';
import type { MyPostsStateContract } from '../../my-posts-state.contract';

const MY_POSTS_PAGE_SIZE = 10;

function mergePosts(existing: FeedPost[], incoming: FeedPost[]): FeedPost[] {
  const mergedById = new Map<string, FeedPost>();

  existing.forEach((post) => {
    mergedById.set(post.id, post);
  });

  incoming.forEach((post) => {
    mergedById.set(post.id, post);
  });

  return Array.from(mergedById.values());
}

export function useMyPostsStatePresenter(): MyPostsStateContract {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState('');
  const [loadMoreError, setLoadMoreError] = useState('');
  const [page, setPage] = useState(1);

  const refresh = useCallback(async () => {
    setError('');
    setLoadMoreError('');
    setIsLoading(true);

    try {
      const userProfile = getUserProfile();
      if (!userProfile) {
        navigate('/login', { replace: true });
        return;
      }

      const response = await getFeed({
        authorId: userProfile.id,
        page: 1,
        limit: MY_POSTS_PAGE_SIZE,
        sortOrder: 'desc',
      });

      setPosts(response.data);
      setPage(response.page);
      setHasMore(response.page < response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your posts');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const loadNextPage = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore) {
      return;
    }

    setIsLoadingMore(true);
    setLoadMoreError('');

    try {
      const userProfile = getUserProfile();
      if (!userProfile) {
        navigate('/login', { replace: true });
        return;
      }

      const nextPage = page + 1;
      const response = await getFeed({
        authorId: userProfile.id,
        page: nextPage,
        limit: MY_POSTS_PAGE_SIZE,
        sortOrder: 'desc',
      });

      setPosts((current) => mergePosts(current, response.data));
      setPage(response.page);
      setHasMore(response.page < response.totalPages);
    } catch (err) {
      setLoadMoreError(err instanceof Error ? err.message : 'Failed to load more posts');
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoading, isLoadingMore, navigate, page]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    state: {
      posts,
      isLoading,
      isLoadingMore,
      hasMore,
      error,
      loadMoreError,
    },
    actions: {
      refresh,
      loadNextPage,
    },
  };
}
