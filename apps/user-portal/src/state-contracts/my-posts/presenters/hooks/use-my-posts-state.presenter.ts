import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from '../../../../services/auth';
import type { FeedPost } from '../../../../services/posts';
import { getFeed } from '../../../../services/posts';
import type { MyPostsStateContract } from '../../my-posts-state.contract';

export function useMyPostsStatePresenter(): MyPostsStateContract {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setError('');

    try {
      const userProfile = getUserProfile();
      if (!userProfile) {
        navigate('/login', { replace: true });
        return;
      }

      const response = await getFeed({
        authorId: userProfile.id,
        page: 1,
        limit: 50,
        sortOrder: 'desc',
      });

      setPosts(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your posts');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    state: {
      posts,
      isLoading,
      error,
    },
    actions: {
      refresh,
    },
  };
}
