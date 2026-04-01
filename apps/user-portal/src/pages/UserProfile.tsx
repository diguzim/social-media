import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { API } from '@repo/contracts';
import { useUserProfileStateContract } from '../state-contracts/user-profile';
import { useInfiniteScrollObserver } from '../components/infinite-scroll/useInfiniteScrollObserver';
import { PostCardsInfiniteList } from '../components/post-list/PostCardsInfiniteList';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import { PendingButton } from '../components/loading/PendingButton';
import {
  PROFILE_SECTION_TABS,
  ProfileSectionsTabs,
  normalizeProfileSection,
  type ProfileSectionKey,
} from '../components/profile/ProfileSectionsTabs';
import { getUserPhotos } from '../services/photos';

function UserFriendItem({
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
  return (
    <li data-testid={`user-profile-friend-item-${id}`} className="card p-4">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            data-testid={`user-profile-friend-avatar-${id}`}
            src={avatarUrl}
            alt={`${name} profile picture`}
            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div
            data-testid={`user-profile-friend-avatar-fallback-${id}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700"
          >
            {name.charAt(0).toUpperCase() || '?'}
          </div>
        )}

        <div>
          <Link
            to={`/users/${username}`}
            data-testid={`user-profile-friend-link-${id}`}
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

export function UserProfile() {
  const { state, actions } = useUserProfileStateContract();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { username, section } = useParams<{ username: string; section?: string }>();
  const activeSection = normalizeProfileSection(section);
  const {
    profile,
    error,
    isLoading,
    friendshipStatus,
    friendshipError,
    isFriendshipActionPending,
    posts,
    isPostsLoading,
    isLoadingMorePosts,
    hasMorePosts,
    postsError,
    postsLoadMoreError,
    friends,
    isFriendsLoading,
    friendsError,
    canViewAcceptedFriends,
  } = state;

  const isOwnProfile = friendshipStatus === 'self';
  const [photosData, setPhotosData] = useState<API.GetUserPhotosResponse>({
    albums: [],
    unsortedPhotos: [],
  });
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState('');
  const selectedAlbumId = searchParams.get('album');
  const selectedPhotoId = searchParams.get('photo');

  const sentinelRef = useInfiniteScrollObserver({
    enabled: hasMorePosts && !isPostsLoading && !isLoadingMorePosts,
    onIntersect: () => {
      void actions.loadNextPostsPage();
    },
  });

  const setSelectedAlbumId = (albumId: string | null) => {
    setSearchParams((currentParams) => {
      const params = new URLSearchParams(currentParams);
      if (albumId) {
        params.set('album', albumId);
      } else {
        params.delete('album');
      }

      params.delete('photo');
      return params;
    });
  };

  const setSelectedPhotoId = (photoId: string | null) => {
    setSearchParams((currentParams) => {
      const params = new URLSearchParams(currentParams);
      if (photoId) {
        params.set('photo', photoId);
      } else {
        params.delete('photo');
      }
      return params;
    });
  };

  useEffect(() => {
    if (!username) {
      return;
    }

    if (section === 'albums') {
      navigate(`/users/${username}/photos`, { replace: true });
    }
  }, [navigate, section, username]);

  useEffect(() => {
    if (activeSection !== 'photos' || !profile?.username) {
      return;
    }

    let isCancelled = false;

    const loadPhotos = async () => {
      setIsPhotosLoading(true);
      setPhotosError('');

      try {
        const response = await getUserPhotos(profile.username);
        if (!isCancelled) {
          setPhotosData(response);
        }
      } catch (err) {
        if (!isCancelled) {
          setPhotosError(err instanceof Error ? err.message : 'Failed to load photos');
        }
      } finally {
        if (!isCancelled) {
          setIsPhotosLoading(false);
        }
      }
    };

    void loadPhotos();

    return () => {
      isCancelled = true;
    };
  }, [activeSection, profile?.username]);

  const selectedAlbum = photosData.albums.find((album) => album.id === selectedAlbumId) ?? null;
  const allVisiblePhotos = [
    ...photosData.unsortedPhotos,
    ...photosData.albums.flatMap((album) => album.photos),
  ];
  const selectedPhoto = allVisiblePhotos.find((photo) => photo.id === selectedPhotoId) ?? null;

  const onSectionChange = (nextSection: ProfileSectionKey) => {
    if (!username) {
      return;
    }

    if (nextSection === 'timeline') {
      navigate(`/users/${username}`);
      return;
    }

    navigate(`/users/${username}/${nextSection}`);
  };

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

        <div data-testid="user-profile-friendship-section" className="mt-3 space-y-2">
          <p data-testid="user-profile-friendship-status" className="text-sm text-slate-700">
            {friendshipStatus === 'self'
              ? 'This is your profile.'
              : friendshipStatus === 'friends'
                ? 'You are friends.'
                : friendshipStatus === 'pending_outgoing'
                  ? 'Friend request pending approval.'
                  : friendshipStatus === 'pending_incoming'
                    ? 'This user sent you a friend request.'
                    : 'You are not friends yet.'}
          </p>

          {friendshipStatus === 'none' ? (
            <PendingButton
              data-testid="user-profile-send-friend-request"
              isPending={isFriendshipActionPending}
              idleText="Add friend"
              pendingText="Sending..."
              onClick={() => {
                void actions.sendFriendRequest();
              }}
              className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
            />
          ) : null}

          {friendshipError ? (
            <p data-testid="user-profile-friendship-error" className="text-sm text-danger-600">
              {friendshipError}
            </p>
          ) : null}
        </div>
      </section>

      <ProfileSectionsTabs
        tabs={PROFILE_SECTION_TABS}
        activeSection={activeSection}
        onChange={onSectionChange}
        testIdPrefix="user-profile-sections"
      />

      {activeSection === 'timeline' ? (
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
      ) : null}

      {activeSection === 'photos' ? (
        <section data-testid="user-profile-photos-section" className="mt-6 card p-6">
          <h2 className="text-2xl font-semibold text-slate-900">Photos</h2>
          <p className="mt-1 text-sm text-slate-600">Albums and standalone (unsorted) photos.</p>

          {photosError ? (
            <p data-testid="user-profile-photos-error" className="mt-4 text-sm text-danger-600">
              {photosError}
            </p>
          ) : null}

          {isPhotosLoading ? (
            <p data-testid="user-profile-photos-loading" className="mt-4 text-sm text-slate-600">
              Loading photos...
            </p>
          ) : (
            <div className="mt-5 space-y-5">
              <section data-testid="user-profile-photos-albums-section">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Albums</h3>
                {photosData.albums.length === 0 ? (
                  <p
                    data-testid="user-profile-photos-albums-empty"
                    className="text-sm text-slate-600"
                  >
                    No albums yet.
                  </p>
                ) : (
                  <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                    {photosData.albums.map((album) => (
                      <article
                        key={album.id}
                        data-testid={`user-profile-photos-album-${album.id}`}
                        className={`min-w-[180px] rounded-lg border p-2 ${
                          selectedAlbumId === album.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        <button
                          type="button"
                          data-testid={`user-profile-photos-album-card-${album.id}`}
                          onClick={() => {
                            setSelectedAlbumId(album.id);
                          }}
                          className="w-full text-left"
                        >
                          {album.coverImageUrl ? (
                            <img
                              data-testid={`user-profile-photos-album-cover-image-${album.id}`}
                              src={album.coverImageUrl}
                              alt={`${album.name} cover`}
                              className="aspect-square w-full rounded-md border border-slate-200 bg-slate-50 object-contain p-1"
                            />
                          ) : (
                            <div
                              data-testid={`user-profile-photos-album-cover-empty-${album.id}`}
                              className="flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-500"
                            >
                              No cover
                            </div>
                          )}
                          <h4 className="mt-2 truncate text-sm font-semibold text-slate-900">
                            {album.name}
                          </h4>
                          <p className="text-xs text-slate-500">{album.photos.length} photos</p>
                        </button>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {selectedAlbum ? (
                <section data-testid="user-profile-photos-selected-album-section">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{selectedAlbum.name}</h3>
                      <p className="text-sm text-slate-500">Album photos</p>
                    </div>
                    <button
                      type="button"
                      data-testid="user-profile-photos-selected-album-close-button"
                      onClick={() => {
                        setSelectedAlbumId(null);
                      }}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      Close album
                    </button>
                  </div>

                  {selectedAlbum.photos.length === 0 ? (
                    <p className="mt-1 text-sm text-slate-600">Album is empty.</p>
                  ) : (
                    <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {selectedAlbum.photos.map((photo) => (
                        <button
                          key={photo.id}
                          type="button"
                          data-testid={`user-profile-photos-album-image-${photo.id}`}
                          onClick={() => {
                            setSelectedPhotoId(photo.id);
                          }}
                        >
                          <img
                            src={photo.imageUrl}
                            alt={photo.description ?? `${selectedAlbum.name} photo`}
                            className="aspect-square w-full rounded-md border border-slate-200 bg-slate-50 object-contain p-1"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              ) : null}

              <section data-testid="user-profile-photos-unsorted-section">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Unsorted Photos</h3>
                {photosData.unsortedPhotos.length === 0 ? (
                  <p
                    data-testid="user-profile-photos-unsorted-empty"
                    className="text-sm text-slate-600"
                  >
                    No unsorted photos yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {photosData.unsortedPhotos.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        data-testid={`user-profile-photos-unsorted-image-${photo.id}`}
                        onClick={() => {
                          setSelectedPhotoId(photo.id);
                        }}
                      >
                        <img
                          src={photo.imageUrl}
                          alt={photo.description ?? 'Photo'}
                          className="aspect-square w-full rounded-md border border-slate-200 bg-slate-50 object-contain p-1"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </section>
            </div>
          )}

          {selectedPhoto ? (
            <div
              data-testid="user-profile-photos-modal"
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
            >
              <button
                type="button"
                data-testid="user-profile-photos-modal-overlay"
                aria-label="Close photo modal"
                className="absolute inset-0"
                onClick={() => {
                  setSelectedPhotoId(null);
                }}
              />
              <div className="relative z-10 w-full max-w-4xl rounded-xl bg-white p-4 shadow-xl">
                <div className="mb-2 flex justify-end">
                  <button
                    type="button"
                    data-testid="user-profile-photos-modal-close-button"
                    onClick={() => {
                      setSelectedPhotoId(null);
                    }}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    Close
                  </button>
                </div>
                <img
                  data-testid={`user-profile-photos-modal-image-${selectedPhoto.id}`}
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.description ?? 'Photo'}
                  className="max-h-[75vh] w-full rounded-md object-contain"
                />
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {activeSection === 'about' ? (
        <section data-testid="user-profile-about-section" className="mt-6 card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">About</h2>
              <p className="mt-1 text-sm text-slate-600">Public bio and profile summary.</p>
            </div>
            {isOwnProfile ? (
              <button
                type="button"
                data-testid="user-profile-about-edit-button"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
              >
                Edit about (soon)
              </button>
            ) : null}
          </div>

          <p data-testid="user-profile-about-placeholder" className="mt-4 text-sm text-slate-600">
            About information is not available yet.
          </p>
        </section>
      ) : null}

      {activeSection === 'friends' ? (
        <section data-testid="user-profile-friends-section" className="mt-6">
          <h2 className="mb-3 text-2xl font-semibold text-slate-900">Friends</h2>

          {!canViewAcceptedFriends ? (
            <p data-testid="user-profile-friends-placeholder" className="text-sm text-slate-600">
              Public accepted-friends listing is coming soon.
            </p>
          ) : isFriendsLoading ? (
            <p data-testid="user-profile-friends-loading" className="text-sm text-slate-600">
              Loading accepted friends...
            </p>
          ) : friendsError ? (
            <p data-testid="user-profile-friends-error" className="text-sm text-danger-600">
              {friendsError}
            </p>
          ) : friends.length === 0 ? (
            <p data-testid="user-profile-friends-empty" className="text-sm text-slate-600">
              No accepted friends yet.
            </p>
          ) : (
            <ul data-testid="user-profile-friends-list" className="grid gap-3">
              {friends.map((friend) => (
                <UserFriendItem
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
        <section data-testid="user-profile-personal-section" className="mt-6 card p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Personal Data</h2>
              <p className="mt-1 text-sm text-slate-600">
                Location, birth date, gender, work, and education.
              </p>
            </div>
            {isOwnProfile ? (
              <button
                type="button"
                data-testid="user-profile-personal-edit-button"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
              >
                Edit personal data (soon)
              </button>
            ) : null}
          </div>

          <div
            data-testid="user-profile-personal-placeholder"
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
