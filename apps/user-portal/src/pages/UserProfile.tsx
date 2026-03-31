import { useUserProfileStateContract } from '../state-contracts/user-profile';
import { useInfiniteScrollObserver } from '../components/infinite-scroll/useInfiniteScrollObserver';
import { PostCardsInfiniteList } from '../components/post-list/PostCardsInfiniteList';

export function UserProfile() {
  const { state, actions } = useUserProfileStateContract();
  const {
    profile,
    error,
    isLoading,
    posts,
    isPostsLoading,
    isLoadingMorePosts,
    hasMorePosts,
    postsError,
    postsLoadMoreError,
  } = state;

  const sentinelRef = useInfiniteScrollObserver({
    enabled: hasMorePosts && !isPostsLoading && !isLoadingMorePosts,
    onIntersect: () => {
      void actions.loadNextPostsPage();
    },
  });

  if (isLoading) {
    return (
      <div
        data-testid="user-profile-loading-state"
        className="page-container max-w-3xl text-center"
      >
        <p data-testid="user-profile-loading-text">Loading user profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div data-testid="user-profile-error-state" className="page-container max-w-3xl text-center">
        <p data-testid="user-profile-error-message" className="status-error">
          {error || 'User profile not found'}
        </p>
      </div>
    );
  }

  return (
    <div data-testid="user-profile-page" className="page-container max-w-5xl">
      <h1 data-testid="user-profile-page-title" className="section-title">
        User Profile
      </h1>

      <div data-testid="user-profile-card" className="card mt-5 p-6">
        <div className="mb-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700">User ID:</label>
          <p data-testid="user-profile-id" className="text-slate-500">
            {profile.id}
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Name:</label>
          <p data-testid="user-profile-name" className="text-slate-700">
            {profile.name}
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Username:</label>
          <p data-testid="user-profile-username" className="text-slate-700">
            @{profile.username}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Email verification:
          </label>
          {profile.emailVerifiedAt ? (
            <p data-testid="user-profile-email-verified" className="text-green-600">
              ✓ Verified
            </p>
          ) : (
            <p data-testid="user-profile-email-unverified" className="text-yellow-600">
              ⚠ Not yet verified
            </p>
          )}
        </div>
      </div>

      <section data-testid="user-profile-posts-section" className="mt-6">
        <h2 className="mb-3 text-2xl font-semibold text-slate-900">Posts</h2>

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
            onReactionChange={() => {
              void actions.refreshPosts();
            }}
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
    </div>
  );
}
