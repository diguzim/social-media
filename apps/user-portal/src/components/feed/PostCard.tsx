import type { FeedPost } from '../../services/posts';

interface PostCardProps {
  post: FeedPost;
}

export function PostCard({ post }: PostCardProps) {
  const createdAt = new Date(post.createdAt).toLocaleString();

  return (
    <article data-testid={`post-card-${post.id}`} className="card p-4">
      <header className="mb-2.5">
        <h3 data-testid={`post-title-${post.id}`} className="text-lg font-semibold text-slate-900">
          {post.title}
        </h3>
      </header>

      <p
        data-testid={`post-content-${post.id}`}
        className="mb-3 whitespace-pre-line text-sm leading-6 text-slate-700"
      >
        {post.content}
      </p>

      <footer className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
        <span data-testid={`post-author-${post.id}`}>Author: {post.authorId}</span>
        <span data-testid={`post-created-at-${post.id}`}>{createdAt}</span>
      </footer>
    </article>
  );
}
