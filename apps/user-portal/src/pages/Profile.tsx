import { useProfileStateContract } from '../state-contracts/profile';
import { AvatarUpload } from '../components/avatar/AvatarUpload';
import { useInfiniteScrollObserver } from '../components/infinite-scroll/useInfiniteScrollObserver';
import { PostCardsInfiniteList } from '../components/post-list/PostCardsInfiniteList';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';

export function Profile() {
  const { state, actions } = useProfileStateContract();
  const {
    user,
    error,
    isLoading,
    isAvatarUploading,
    avatarUploadError,
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
      <div data-testid="profile-loading-state" className="page-container max-w-3xl text-center">
        <p data-testid="profile-loading-text">Loading your profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div data-testid="profile-error-state" className="page-container max-w-3xl text-center">
        <p data-testid="profile-error-message" className="status-error">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div data-testid="profile-page" className="page-container max-w-5xl">
      <h1 data-testid="profile-page-title" className="section-title">
        My Profile
      </h1>
      {user && (
        <>
          <ProfileHeaderCard
            cardTestId="profile-user-card"
            avatarTestId="profile-avatar-image"
            nameTestId="profile-user-name"
            usernameTestId="profile-user-username"
            statsTestId="profile-user-stats"
            comingSoonTestId="profile-user-stats-coming-soon"
            name={user.name}
            username={user.username}
            avatarUrl={user.avatarUrl}
            postsCount={posts.length}
          />

          <section data-testid="profile-user-details-card" className="card mt-4 p-6">
            <div className="mb-6">
              <p className="text-sm font-semibold text-slate-700">Profile picture</p>
              <p className="text-xs text-slate-500">JPG or PNG, up to 2MB.</p>
            </div>

            <AvatarUpload
              isUploading={isAvatarUploading}
              error={avatarUploadError}
              onUpload={actions.uploadAvatar}
            />

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">User ID</p>
                <p data-testid="profile-user-id" className="text-sm text-slate-700">
                  {user.id}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                <p data-testid="profile-user-email" className="text-sm text-slate-700">
                  {user.email}
                </p>
              </div>

              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-wide text-slate-500">Email verification</p>
                {user.emailVerifiedAt ? (
                  <p data-testid="profile-email-verified" className="text-sm text-green-600">
                    ✓ Verified on {new Date(user.emailVerifiedAt).toLocaleDateString()}
                  </p>
                ) : (
                  <p data-testid="profile-email-unverified" className="text-sm text-yellow-600">
                    ⚠ Not yet verified
                  </p>
                )}
              </div>
            </div>
          </section>
        </>
      )}

      <section data-testid="profile-posts-section" className="mt-6">
        <h2 className="mb-3 text-2xl font-semibold text-slate-900">My Posts</h2>

        {isPostsLoading ? (
          <p data-testid="profile-posts-loading" className="text-sm text-slate-600">
            Loading your posts...
          </p>
        ) : postsError && posts.length === 0 ? (
          <p data-testid="profile-posts-error" className="text-sm text-danger-600">
            {postsError}
          </p>
        ) : posts.length === 0 ? (
          <p data-testid="profile-posts-empty" className="text-sm text-slate-600">
            You haven&apos;t created any posts yet.
          </p>
        ) : (
          <PostCardsInfiniteList
            posts={posts}
            onReactionChange={() => {
              void actions.refreshPosts();
            }}
            listTestId="profile-posts-list"
            className="grid gap-3"
            loadMoreError={postsLoadMoreError}
            loadMoreErrorMessage={(currentError) => currentError}
            loadMoreErrorTestId="profile-posts-load-more-error"
            isLoadingMore={isLoadingMorePosts}
            loadingMoreMessage="Loading more posts..."
            loadingMoreTestId="profile-posts-loading-more"
            hasMore={hasMorePosts}
            sentinelRef={sentinelRef}
            sentinelTestId="profile-posts-infinite-sentinel"
            sentinelClassName="h-2 w-full"
            endMessage="You've reached the end of your posts."
            endTestId="profile-posts-end"
          />
        )}
      </section>
    </div>
  );
}
