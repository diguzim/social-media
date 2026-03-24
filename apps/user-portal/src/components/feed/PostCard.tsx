import { useState } from 'react';
import type { FeedPost } from '../../services/posts';
import { togglePostReaction } from '../../services/posts';
import { PendingButton } from '../loading/PendingButton';

interface PostCardProps {
  post: FeedPost;
  onReactionChange?: (postId: string) => void;
}

export function PostCard({ post, onReactionChange }: PostCardProps) {
  const createdAt = new Date(post.createdAt).toLocaleString();
  const authorLabel = post.author.name;
  const likeCount = post.reactions?.likeCount ?? 0;
  const likedByMe = post.reactions?.likedByMe ?? false;

  const [isPending, setIsPending] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localLikedByMe, setLocalLikedByMe] = useState(likedByMe);

  const handleLikeClick = async () => {
    if (isPending) {
      return;
    }

    setIsPending(true);

    // Optimistic update
    const wasLiked = localLikedByMe;
    setLocalLikedByMe(!wasLiked);
    setLocalLikeCount(wasLiked ? localLikeCount - 1 : localLikeCount + 1);

    try {
      await togglePostReaction(post.id);
      onReactionChange?.(post.id);
    } catch (error) {
      // Revert optimistic update on error
      setLocalLikedByMe(wasLiked);
      setLocalLikeCount(wasLiked ? localLikeCount + 1 : localLikeCount - 1);
      console.error('Failed to toggle like:', error);
    } finally {
      setIsPending(false);
    }
  };

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

      <footer className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-3 text-xs text-slate-500">
          <span data-testid={`post-author-${post.id}`}>Author: {authorLabel}</span>
          <span data-testid={`post-created-at-${post.id}`}>{createdAt}</span>
        </div>

        <div className="flex items-center gap-2">
          <PendingButton
            data-testid={`like-button-${post.id}`}
            onClick={handleLikeClick}
            disabled={isPending}
            aria-label={localLikedByMe ? 'Unlike post' : 'Like post'}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              localLikedByMe
                ? 'bg-danger-100 text-danger-700 hover:bg-danger-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            isPending={isPending}
            idleText={localLikedByMe ? '❤️ Liked' : '🤍 Like'}
            pendingText="..."
          />
          <span data-testid={`like-count-${post.id}`} className="text-xs text-slate-600">
            {localLikeCount}
          </span>
        </div>
      </footer>
    </article>
  );
}
