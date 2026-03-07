import { useEffect, useState } from 'react';
import { getPosts } from '../../services/posts';
import type { FeedPost } from '../../services/posts';
import { PostCard } from './PostCard';

export function Feed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadFeed = async () => {
      try {
        const response = await getPosts({
          page: 1,
          limit: 10,
          sortOrder: 'desc',
        });
        setPosts(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load feed');
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, []);

  if (loading) {
    return (
      <section data-testid="feed-loading-state">
        <h2 style={{ marginBottom: '12px' }}>Feed</h2>
        <p>Loading posts...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section data-testid="feed-error-state">
        <h2 style={{ marginBottom: '12px' }}>Feed</h2>
        <p style={{ color: '#dc2626' }}>{error}</p>
      </section>
    );
  }

  if (posts.length === 0) {
    return (
      <section data-testid="feed-empty-state">
        <h2 style={{ marginBottom: '12px' }}>Feed</h2>
        <p>No posts yet.</p>
      </section>
    );
  }

  return (
    <section data-testid="feed-section">
      <h2 style={{ marginBottom: '12px' }}>Feed</h2>
      <div style={{ display: 'grid', gap: '12px' }}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
