import { useUserProfileStateContract } from '../state-contracts/user-profile';
import { useInfiniteScrollObserver } from '../components/infinite-scroll/useInfiniteScrollObserver';
import { PostCardsInfiniteList } from '../components/post-list/PostCardsInfiniteList';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';

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
        Profile
      </h1>

      <ProfileHeaderCard
        cardTestId="user-profile-card"
        avatarTestId="user-profile-avatar-image"
        nameTestId="user-profile-name"
        usernameTestId="user-profile-username"
        statsTestId="user-profile-stats"
        comingSoonTestId="user-profile-stats-coming-soon"
        name={profile.name}
        username={profile.username}
        avatarUrl={profile.avatarUrl}
        postsCount={posts.length}
      />

      <section data-testid="user-profile-meta" className="mt-4">
        {profile.emailVerifiedAt ? (
          <p data-testid="user-profile-email-verified" className="text-sm text-green-600">
            ✓ Verified account
          </p>
        ) : (
          <p data-testid="user-profile-email-unverified" className="text-sm text-yellow-600">
            ⚠ Email not verified yet
          </p>
        )}
      </section>

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
