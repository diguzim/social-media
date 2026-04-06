import type { RefObject } from 'react';
import type { FeedPost } from '../../../services/posts';
import { PostCardsInfiniteList } from '../../../components/post-list/PostCardsInfiniteList';

interface TimelineSectionProps {
  posts: FeedPost[];
  isPostsLoading: boolean;
  postsError: string;
  postsLoadMoreError: string;
  isLoadingMorePosts: boolean;
  hasMorePosts: boolean;
  sentinelRef: RefObject<HTMLDivElement>;
  onRefreshPosts: () => void;
}

export function TimelineSection({
  posts,
  isPostsLoading,
  postsError,
  postsLoadMoreError,
  isLoadingMorePosts,
  hasMorePosts,
  sentinelRef,
  onRefreshPosts,
}: TimelineSectionProps) {
  return (
    <section data-testid="user-profile-posts-section" className="mt-6">
      <h2 className="mb-3 text-2xl font-semibold text-slate-900">Timeline</h2>

      {isPostsLoading ? (
        <p data-testid="user-profile-posts-loading" className="text-sm text-slate-600">
          Loading posts...
        </p>
      ) : postsError && posts.length === 0 ? (
        <p data-testid="user-profile-posts-error" className="text-sm text-danger-600">
          {postsError}
        </p>
      ) : posts.length === 0 ? (
        <p data-testid="user-profile-posts-empty" className="text-sm text-slate-600">
          This user has not posted yet.
        </p>
      ) : (
        <PostCardsInfiniteList
          posts={posts}
          onReactionChange={onRefreshPosts}
          listTestId="user-profile-posts-list"
          className="grid gap-3"
          loadMoreError={postsLoadMoreError}
          loadMoreErrorMessage={(currentError) => currentError}
          loadMoreErrorTestId="user-profile-posts-load-more-error"
          isLoadingMore={isLoadingMorePosts}
          loadingMoreMessage="Loading more posts..."
          loadingMoreTestId="user-profile-posts-loading-more"
          hasMore={hasMorePosts}
          sentinelRef={sentinelRef}
          sentinelTestId="user-profile-posts-infinite-sentinel"
          sentinelClassName="h-2 w-full"
          endMessage="You've reached the end of this user's posts."
          endTestId="user-profile-posts-end"
        />
      )}
    </section>
  );
}
