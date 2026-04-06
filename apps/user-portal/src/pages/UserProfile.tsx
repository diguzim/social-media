import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { API } from '@repo/contracts';
import {
  Button,
  Container,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Modal,
  Section,
  Stack,
  useDropdownMenu,
} from '@repo/ui';
import { useUserProfileStateContract } from '../state-contracts/user-profile';
import { useInfiniteScrollObserver } from '../components/infinite-scroll/useInfiniteScrollObserver';
import { PostCardsInfiniteList } from '../components/post-list/PostCardsInfiniteList';
import { ProfileHeaderCard } from '../components/profile/ProfileHeaderCard';
import {
  PROFILE_SECTION_TABS,
  ProfileSectionsTabs,
  normalizeProfileSection,
  type ProfileSectionKey,
} from '../components/profile/ProfileSectionsTabs';
import { getProfile, uploadProfileAvatar } from '../services/auth';
import { getUserPhotos } from '../services/photos';

const DEFAULT_AVATAR_DATA_URL =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Crect width=%22120%22 height=%22120%22 rx=%2260%22 fill=%22%23e2e8f0%22/%3E%3Ctext x=%2260%22 y=%2266%22 text-anchor=%22middle%22 font-size=%2214%22 fill=%22%23334155%22%3EAvatar%3C/text%3E%3C/svg%3E';

interface OwnAvatarActionsMenuProps {
  isUploading: boolean;
  onSeeImage: () => void;
  onChangeImage: () => void;
}

function OwnAvatarActionsMenu({
  isUploading,
  onSeeImage,
  onChangeImage,
}: OwnAvatarActionsMenuProps) {
  const { close } = useDropdownMenu();

  return (
    <>
      <Button
        type="button"
        variant="link"
        fullWidth
        data-testid="user-profile-avatar-see-image-action"
        onClick={() => {
          close();
          onSeeImage();
        }}
        className="justify-start rounded-none border-b border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-100"
      >
        See image
      </Button>
      <Button
        type="button"
        variant="link"
        fullWidth
        data-testid="user-profile-avatar-change-image-action"
        onClick={() => {
          close();
          onChangeImage();
        }}
        isPending={isUploading}
        pendingText="Opening..."
        className="justify-start rounded-none px-4 py-3 text-slate-700 hover:bg-slate-100"
      >
        Change image
      </Button>
    </>
  );
}

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
    isOwnProfile,
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

  const [photosData, setPhotosData] = useState<API.GetUserPhotosResponse>({
    albums: [],
    unsortedPhotos: [],
  });
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState('');
  const [isAvatarActionsOpen, setIsAvatarActionsOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [avatarUploadError, setAvatarUploadError] = useState('');
  const [uploadedAvatarUrl, setUploadedAvatarUrl] = useState<string | null>(null);
  const [avatarCacheBuster, setAvatarCacheBuster] = useState<number | null>(null);
  const avatarFileInputRef = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    setUploadedAvatarUrl(null);
    setAvatarCacheBuster(null);
  }, [username]);

  useEffect(() => {
    return () => {
      if (uploadedAvatarUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(uploadedAvatarUrl);
      }
    };
  }, [uploadedAvatarUrl]);

  const selectedAlbum = photosData.albums.find((album) => album.id === selectedAlbumId) ?? null;
  const allVisiblePhotos = [
    ...photosData.unsortedPhotos,
    ...photosData.albums.flatMap((album) => album.photos),
  ];
  const selectedPhoto = allVisiblePhotos.find((photo) => photo.id === selectedPhotoId) ?? null;
  const avatarBaseUrl = uploadedAvatarUrl ?? profile?.avatarUrl;
  const resolvedAvatarUrl = avatarBaseUrl
    ? avatarBaseUrl.startsWith('blob:') || avatarBaseUrl.startsWith('data:')
      ? avatarBaseUrl
      : `${avatarBaseUrl}${avatarBaseUrl.includes('?') ? '&' : '?'}v=${avatarCacheBuster ?? 'base'}`
    : DEFAULT_AVATAR_DATA_URL;
  const profileName = profile?.name ?? 'User';

  const openAvatarModal = () => {
    setIsAvatarModalOpen(true);
  };

  const closeAvatarModal = () => {
    setIsAvatarModalOpen(false);
  };

  const openAvatarPicker = () => {
    avatarFileInputRef.current?.click();
  };

  const handleAvatarFileSelected = async (fileList: FileList | null) => {
    const selectedFile = fileList?.[0] ?? null;

    if (!selectedFile) {
      return;
    }

    setAvatarUploadError('');
    setIsAvatarUploading(true);
    const localPreviewUrl = URL.createObjectURL(selectedFile);

    try {
      const uploadResult = await uploadProfileAvatar(selectedFile);
      if (uploadResult.imageUrl) {
        URL.revokeObjectURL(localPreviewUrl);
        setUploadedAvatarUrl(uploadResult.imageUrl);
      } else {
        setUploadedAvatarUrl(localPreviewUrl);
      }
      setAvatarCacheBuster(Date.now());
      await getProfile();
      await actions.refresh();
      setIsAvatarActionsOpen(false);
    } catch (uploadError) {
      URL.revokeObjectURL(localPreviewUrl);
      setAvatarUploadError(
        uploadError instanceof Error ? uploadError.message : 'Failed to upload profile image'
      );
    } finally {
      setIsAvatarUploading(false);

      if (avatarFileInputRef.current) {
        avatarFileInputRef.current.value = '';
      }
    }
  };

  const handlePublicAvatarClick = () => {
    setAvatarUploadError('');
    openAvatarModal();
  };

  const avatarSlot = isOwnProfile ? (
    <DropdownMenu
      open={isAvatarActionsOpen}
      onOpenChange={(open) => {
        setAvatarUploadError('');
        setIsAvatarActionsOpen(open);
      }}
      className="inline-flex"
    >
      <DropdownMenuTrigger
        data-testid="user-profile-avatar-trigger"
        variant="ghost"
        className="h-auto w-auto rounded-full bg-transparent p-0 hover:bg-transparent"
      >
        <img
          data-testid="user-profile-avatar-image"
          src={resolvedAvatarUrl}
          alt={`${profileName} profile`}
          className="h-20 w-20 rounded-full border border-slate-200 object-cover sm:h-24 sm:w-24"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        dataTestId="user-profile-avatar-actions-menu"
        align="start"
        side="bottom"
        offset="sm"
      >
        <OwnAvatarActionsMenu
          isUploading={isAvatarUploading}
          onSeeImage={openAvatarModal}
          onChangeImage={openAvatarPicker}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Button
      type="button"
      data-testid="user-profile-avatar-trigger"
      variant="ghost"
      className="h-auto w-auto rounded-full bg-transparent p-0 hover:bg-transparent"
      onClick={handlePublicAvatarClick}
    >
      <img
        data-testid="user-profile-avatar-image"
        src={resolvedAvatarUrl}
        alt={`${profileName} profile`}
        className="h-20 w-20 rounded-full border border-slate-200 object-cover sm:h-24 sm:w-24"
      />
    </Button>
  );

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
      <Container maxWidth="3xl" dataTestId="user-profile-loading-state">
        <Section hasBorder background="primary" className="text-center" padding="p-6">
          <p data-testid="user-profile-loading-text">Loading user profile...</p>
        </Section>
      </Container>
    );
  }

  if (error || !profile) {
    return (
      <Container maxWidth="3xl" dataTestId="user-profile-error-state">
        <Section hasBorder background="danger" className="text-center" padding="p-6">
          <p data-testid="user-profile-error-message" className="status-error">
            {error || 'User profile not found'}
          </p>
        </Section>
      </Container>
    );
  }

  return (
    <Container maxWidth="5xl" dataTestId="user-profile-page">
      <Stack gap="gap-4">
        <ProfileHeaderCard
          cardTestId="user-profile-card"
          avatarTestId="user-profile-avatar-image"
          avatarSlot={avatarSlot}
          nameTestId="user-profile-name"
          usernameTestId="user-profile-username"
          verifiedBadgeTestId="user-profile-verified-badge"
          statsTestId="user-profile-stats"
          comingSoonTestId="user-profile-stats-coming-soon"
          name={profile.name}
          username={profile.username}
          avatarUrl={profile.avatarUrl}
          postsCount={posts.length}
          isVerified={Boolean(profile.emailVerifiedAt)}
        />

        <input
          ref={avatarFileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          data-testid="user-profile-avatar-file-input"
          className="hidden"
          onChange={(event) => {
            void handleAvatarFileSelected(event.target.files);
          }}
        />

        {avatarUploadError ? (
          <p data-testid="user-profile-avatar-upload-error" className="text-sm text-danger-600">
            {avatarUploadError}
          </p>
        ) : null}

        <Modal
          isOpen={isAvatarModalOpen}
          onClose={closeAvatarModal}
          ariaLabel={`${profileName} avatar preview`}
          dataTestId="user-profile-avatar-modal"
          closeButtonTestId="user-profile-avatar-modal-close-button"
          dialogClassName="max-w-xl"
        >
          <img
            data-testid="user-profile-avatar-modal-image"
            src={resolvedAvatarUrl}
            alt={`${profileName} avatar`}
            className="max-h-[70vh] w-full rounded-md object-contain"
          />
        </Modal>

        {!isOwnProfile && (
          <Section dataTestId="user-profile-meta" hasBorder background="primary" padding="p-4">
            <div data-testid="user-profile-friendship-section" className="space-y-2">
              <p data-testid="user-profile-friendship-status" className="text-sm text-slate-700">
                {friendshipStatus === 'friends'
                  ? 'You are friends.'
                  : friendshipStatus === 'pending_outgoing'
                    ? 'Friend request pending approval.'
                    : friendshipStatus === 'pending_incoming'
                      ? 'This user sent you a friend request.'
                      : 'You are not friends yet.'}
              </p>

              {!isOwnProfile && friendshipStatus === 'none' ? (
                <Button
                  data-testid="user-profile-send-friend-request"
                  isPending={isFriendshipActionPending}
                  pendingText="Sending..."
                  onClick={() => {
                    void actions.sendFriendRequest();
                  }}
                  className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Add friend
                </Button>
              ) : null}

              {friendshipError ? (
                <p data-testid="user-profile-friendship-error" className="text-sm text-danger-600">
                  {friendshipError}
                </p>
              ) : null}
            </div>
          </Section>
        )}

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
          <Section
            dataTestId="user-profile-photos-section"
            hasBorder
            background="primary"
            padding="p-6"
          >
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
                          <Button
                            type="button"
                            variant="link"
                            size="sm"
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
                          </Button>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                {selectedAlbum ? (
                  <section data-testid="user-profile-photos-selected-album-section">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900">
                          {selectedAlbum.name}
                        </h3>
                        <p className="text-sm text-slate-500">Album photos</p>
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        data-testid="user-profile-photos-selected-album-close-button"
                        onClick={() => {
                          setSelectedAlbumId(null);
                        }}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                      >
                        Close album
                      </Button>
                    </div>

                    {selectedAlbum.photos.length === 0 ? (
                      <p className="mt-1 text-sm text-slate-600">Album is empty.</p>
                    ) : (
                      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                        {selectedAlbum.photos.map((photo) => (
                          <Button
                            key={photo.id}
                            type="button"
                            variant="link"
                            size="sm"
                            data-testid={`user-profile-photos-album-image-${photo.id}`}
                            onClick={() => {
                              setSelectedPhotoId(photo.id);
                            }}
                            className="p-0"
                          >
                            <img
                              src={photo.imageUrl}
                              alt={photo.description ?? `${selectedAlbum.name} photo`}
                              className="aspect-square w-full rounded-md border border-slate-200 bg-slate-50 object-contain p-1"
                            />
                          </Button>
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
                        <Button
                          key={photo.id}
                          type="button"
                          variant="link"
                          size="sm"
                          data-testid={`user-profile-photos-unsorted-image-${photo.id}`}
                          onClick={() => {
                            setSelectedPhotoId(photo.id);
                          }}
                          className="p-0"
                        >
                          <img
                            src={photo.imageUrl}
                            alt={photo.description ?? 'Photo'}
                            className="aspect-square w-full rounded-md border border-slate-200 bg-slate-50 object-contain p-1"
                          />
                        </Button>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            )}

            {selectedPhoto ? (
              <Modal
                isOpen={Boolean(selectedPhoto)}
                onClose={() => {
                  setSelectedPhotoId(null);
                }}
                ariaLabel={selectedPhoto.description ?? 'Photo preview'}
                dataTestId="photo-modal"
                overlayTestId="photo-modal-overlay"
                closeButtonTestId="photo-modal-close-button"
                dialogClassName="max-w-4xl"
              >
                <img
                  data-testid={`photo-modal-image-${selectedPhoto.id}`}
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.description ?? 'Photo'}
                  className="max-h-[75vh] w-full rounded-md object-contain"
                />
              </Modal>
            ) : null}
          </Section>
        ) : null}

        {activeSection === 'about' ? (
          <Section
            dataTestId="user-profile-about-section"
            hasBorder
            background="primary"
            padding="p-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">About</h2>
              <p className="mt-1 text-sm text-slate-600">Public bio and profile summary.</p>
            </div>

            <p data-testid="user-profile-about-placeholder" className="mt-4 text-sm text-slate-600">
              About information is not available yet.
            </p>
          </Section>
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
          <Section
            dataTestId="user-profile-personal-section"
            hasBorder
            background="primary"
            padding="p-6"
          >
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Personal Data</h2>
              <p className="mt-1 text-sm text-slate-600">
                Location, birth date, gender, work, and education.
              </p>
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
          </Section>
        ) : null}
      </Stack>
    </Container>
  );
}
