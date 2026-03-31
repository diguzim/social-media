import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useProfileStateContract } from '../state-contracts/profile';
import { AvatarUpload } from '../components/avatar/AvatarUpload';
import { useInfiniteScrollObserver } from '../components/infinite-scroll/useInfiniteScrollObserver';
import { PostCardsInfiniteList } from '../components/post-list/PostCardsInfiniteList';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import {
  PROFILE_SECTION_TABS,
  ProfileSectionsTabs,
  normalizeProfileSection,
  type ProfileSectionKey,
} from '../components/profile/ProfileSectionsTabs';

function ProfileFriendItem({
  id,
  name,
  username,
  avatarUrl,
}: {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}) {
  const hasAvatar = Boolean(avatarUrl);

  return (
    <li data-testid={`profile-friend-item-${id}`} className="card p-4">
      <div className="flex items-center gap-3">
        {hasAvatar ? (
          <img
            data-testid={`profile-friend-avatar-${id}`}
            src={avatarUrl}
            alt={`${name} profile picture`}
            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div
            data-testid={`profile-friend-avatar-fallback-${id}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700"
          >
            {name.charAt(0).toUpperCase() || '?'}
          </div>
        )}

        <div>
          <Link
            to={`/users/${username}`}
            data-testid={`profile-friend-link-${id}`}
            className="text-base font-semibold text-slate-900 hover:text-blue-700 hover:underline"
          >
            {name}
          </Link>
          <p className="text-sm text-slate-500">@{username}</p>
        </div>
      </div>
    </li>
  );
}

export function Profile() {
  const { state, actions } = useProfileStateContract();
  const navigate = useNavigate();
  const { section } = useParams<{ section?: string }>();
  const activeSection = normalizeProfileSection(section);
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
    friends,
    isFriendsLoading,
    friendsError,
  } = state;

  const sentinelRef = useInfiniteScrollObserver({
    enabled: hasMorePosts && !isPostsLoading && !isLoadingMorePosts,
    onIntersect: () => {
      void actions.loadNextPostsPage();
    },
  });

  useEffect(() => {
    if (section === 'albums') {
      navigate('/profile/photos', { replace: true });
    }
  }, [navigate, section]);

  const onSectionChange = (nextSection: ProfileSectionKey) => {
    if (nextSection === 'timeline') {
      navigate('/profile');
      return;
    }

    navigate(`/profile/${nextSection}`);
  };

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

          <ProfileSectionsTabs
            tabs={PROFILE_SECTION_TABS}
            activeSection={activeSection}
            onChange={onSectionChange}
            testIdPrefix="profile-sections"
          />
        </>
      )}

      {activeSection === 'timeline' ? (
        <section data-testid="profile-posts-section" className="mt-6">
          <h2 className="mb-3 text-2xl font-semibold text-slate-900">Timeline</h2>

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
      ) : null}

      {activeSection === 'photos' ? (
        <section data-testid="profile-photos-section" className="mt-6 card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Photos</h2>
              <p className="mt-1 text-sm text-slate-600">
                Group pictures into albums, or upload photos without an album.
              </p>
            </div>
            <button
              type="button"
              data-testid="profile-photos-create-button"
              className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white"
            >
              Create album (soon)
            </button>
          </div>

          <p data-testid="profile-photos-placeholder" className="mt-4 text-sm text-slate-600">
            Photo library management (with albums) and standalone uploads are not wired in backend
            yet.
          </p>
        </section>
      ) : null}

      {activeSection === 'about' ? (
        <section data-testid="profile-about-section" className="mt-6 card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">About</h2>
              <p className="mt-1 text-sm text-slate-600">
                Introduce yourself with a short bio and highlights.
              </p>
            </div>
            <button
              type="button"
              data-testid="profile-about-edit-button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Edit about (soon)
            </button>
          </div>

          <p data-testid="profile-about-placeholder" className="mt-4 text-sm text-slate-600">
            About fields are coming soon after backend profile schema expansion.
          </p>
        </section>
      ) : null}

      {activeSection === 'friends' ? (
        <section data-testid="profile-friends-section" className="mt-6">
          <h2 className="mb-3 text-2xl font-semibold text-slate-900">Friends</h2>

          {isFriendsLoading ? (
            <p data-testid="profile-friends-loading" className="text-sm text-slate-600">
              Loading accepted friends...
            </p>
          ) : friendsError ? (
            <p data-testid="profile-friends-error" className="text-sm text-danger-600">
              {friendsError}
            </p>
          ) : friends.length === 0 ? (
            <p data-testid="profile-friends-empty" className="text-sm text-slate-600">
              You don&apos;t have accepted friends yet.
            </p>
          ) : (
            <ul data-testid="profile-friends-list" className="grid gap-3">
              {friends.map((friend) => (
                <ProfileFriendItem
                  key={friend.id}
                  id={friend.id}
                  name={friend.name}
                  username={friend.username}
                  avatarUrl={friend.avatarUrl}
                />
              ))}
            </ul>
          )}
        </section>
      ) : null}

      {activeSection === 'personal' ? (
        <section data-testid="profile-personal-section" className="mt-6 card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Personal Data</h2>
              <p className="mt-1 text-sm text-slate-600">
                Location, birth date, gender, work, and education.
              </p>
            </div>
            <button
              type="button"
              data-testid="profile-personal-edit-button"
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
            >
              Edit personal data (soon)
            </button>
          </div>

          <div
            data-testid="profile-personal-placeholder"
            className="mt-4 grid gap-2 sm:grid-cols-2"
          >
            <p className="text-sm text-slate-600">Location: —</p>
            <p className="text-sm text-slate-600">Birth date: —</p>
            <p className="text-sm text-slate-600">Gender: —</p>
            <p className="text-sm text-slate-600">Work: —</p>
            <p className="text-sm text-slate-600 sm:col-span-2">Education: —</p>
          </div>
        </section>
      ) : null}
    </div>
  );
}
