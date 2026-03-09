import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts } from '../services/posts';
import type { FeedPost } from '../services/posts';
import { PostCard } from '../components/feed/PostCard';
import { getUserProfile } from '../services/auth';

export function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadMyPosts = async () => {
      try {
        const userProfile = getUserProfile();
        if (!userProfile) {
          navigate('/login', { replace: true });
          return;
        }

        const response = await getPosts({
          authorId: userProfile.id,
          page: 1,
          limit: 50,
          sortOrder: 'desc',
        });

        setPosts(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load your posts');
      } finally {
        setLoading(false);
      }
    };

    loadMyPosts();
  }, [navigate]);

  if (loading) {
    return (
      <div data-testid="my-posts-page" className="page-container max-w-5xl">
        <h1 className="mb-5 text-3xl font-bold text-slate-900">My Posts</h1>
        <p data-testid="my-posts-loading-text" className="text-slate-600">
          Loading your posts...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div data-testid="my-posts-page" className="page-container max-w-5xl">
        <h1 className="mb-5 text-3xl font-bold text-slate-900">My Posts</h1>
        <p data-testid="my-posts-error-message" className="text-danger-600">
          {error}
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div data-testid="my-posts-page" className="page-container max-w-5xl">
        <h1 className="mb-5 text-3xl font-bold text-slate-900">My Posts</h1>
        <div data-testid="my-posts-empty-state" className="card px-6 py-8 text-center">
          <p className="text-lg text-slate-700">You haven't created any posts yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Start sharing your thoughts with the community!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="my-posts-page" className="page-container max-w-5xl">
      <h1 className="mb-5 text-3xl font-bold text-slate-900">My Posts</h1>
      <div data-testid="my-posts-count" className="mb-4 text-sm text-slate-600">
        {posts.length} {posts.length === 1 ? 'post' : 'posts'}
      </div>
      <div data-testid="my-posts-list" className="grid gap-3">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
