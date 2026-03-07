import type { FeedPost } from '../../services/posts';

interface PostCardProps {
  post: FeedPost;
}

export function PostCard({ post }: PostCardProps) {
  const createdAt = new Date(post.createdAt).toLocaleString();

  return (
    <article
      data-testid={`post-card-${post.id}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff',
      }}
    >
      <header style={{ marginBottom: '10px' }}>
        <h3 data-testid={`post-title-${post.id}`} style={{ margin: 0, fontSize: '18px' }}>
          {post.title}
        </h3>
      </header>

      <p data-testid={`post-content-${post.id}`} style={{ margin: '0 0 12px', lineHeight: 1.5 }}>
        {post.content}
      </p>

      <footer
        style={{
          fontSize: '13px',
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '8px',
          flexWrap: 'wrap',
        }}
      >
        <span data-testid={`post-author-${post.id}`}>Author: {post.authorId}</span>
        <span data-testid={`post-created-at-${post.id}`}>{createdAt}</span>
      </footer>
    </article>
  );
}
