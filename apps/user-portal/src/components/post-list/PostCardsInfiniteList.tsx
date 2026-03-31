import type { RefObject } from 'react';
import { PostCard } from '../feed/PostCard';
import type { FeedPost } from '../../services/posts';

interface PostCardsInfiniteListProps {
  posts: FeedPost[];
  onReactionChange: () => void;
  listTestId: string;
  className?: string;
  loadMoreError: string;
  loadMoreErrorMessage: (error: string) => string;
  loadMoreErrorTestId: string;
  isLoadingMore: boolean;
  loadingMoreMessage: string;
  loadingMoreTestId: string;
  hasMore: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
  sentinelTestId: string;
  sentinelClassName?: string;
  endMessage: string;
  endTestId: string;
}

export function PostCardsInfiniteList({
  posts,
  onReactionChange,
  listTestId,
  className,
  loadMoreError,
  loadMoreErrorMessage,
  loadMoreErrorTestId,
  isLoadingMore,
  loadingMoreMessage,
  loadingMoreTestId,
  hasMore,
  sentinelRef,
  sentinelTestId,
  sentinelClassName,
  endMessage,
  endTestId,
}: PostCardsInfiniteListProps) {
  return (
    <>
      <div data-testid={listTestId} className={className}>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} onReactionChange={onReactionChange} />
        ))}
      </div>

      {loadMoreError ? (
        <p data-testid={loadMoreErrorTestId} className="mt-3 text-sm text-amber-200">
          {loadMoreErrorMessage(loadMoreError)}
        </p>
      ) : null}

      {isLoadingMore ? (
        <p data-testid={loadingMoreTestId} className="mt-3 text-sm text-gray-300">
          {loadingMoreMessage}
        </p>
      ) : null}

      {hasMore ? (
        <div
          ref={sentinelRef}
          data-testid={sentinelTestId}
          className={sentinelClassName ?? 'h-4 w-full'}
          aria-hidden="true"
        />
      ) : (
        <p data-testid={endTestId} className="mt-3 text-xs uppercase tracking-wide text-gray-500">
          {endMessage}
        </p>
      )}
    </>
  );
}
