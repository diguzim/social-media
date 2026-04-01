import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { API } from '@repo/contracts';
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
import {
  createMyAlbum,
  deleteMyAlbum,
  getUserPhotos,
  updateMyAlbum,
  uploadMyPhoto,
} from '../services/photos';

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
  const [searchParams, setSearchParams] = useSearchParams();
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
  const [photosData, setPhotosData] = useState<API.GetUserPhotosResponse>({
    albums: [],
    unsortedPhotos: [],
  });
  const [isPhotosLoading, setIsPhotosLoading] = useState(false);
  const [photosError, setPhotosError] = useState('');
  const [albumName, setAlbumName] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadAlbumId, setUploadAlbumId] = useState<string>('');
  const [editingAlbumId, setEditingAlbumId] = useState<string | null>(null);
  const [editingAlbumName, setEditingAlbumName] = useState('');
  const [editingAlbumDescription, setEditingAlbumDescription] = useState('');
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

  useEffect(() => {
    if (activeSection !== 'photos' || !user?.username) {
      return;
    }

    let isCancelled = false;

    const loadPhotos = async () => {
      setIsPhotosLoading(true);
      setPhotosError('');

      try {
        const response = await getUserPhotos(user.username);
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
  }, [activeSection, user?.username]);

  const reloadPhotos = async () => {
    if (!user?.username) {
      return;
    }

    const response = await getUserPhotos(user.username);
    setPhotosData(response);
  };

  const selectedAlbum = photosData.albums.find((album) => album.id === selectedAlbumId) ?? null;

  const allVisiblePhotos = [
    ...photosData.unsortedPhotos,
    ...photosData.albums.flatMap((album) => album.photos),
  ];
  const selectedPhoto = allVisiblePhotos.find((photo) => photo.id === selectedPhotoId) ?? null;

  const handleCreateAlbum = async () => {
    if (!albumName.trim()) {
      setPhotosError('Album name is required');
      return;
    }

    try {
      setPhotosError('');
      await createMyAlbum({
        name: albumName,
        description: albumDescription || undefined,
      });
      setAlbumName('');
      setAlbumDescription('');
      await reloadPhotos();
    } catch (err) {
      setPhotosError(err instanceof Error ? err.message : 'Failed to create album');
    }
  };

  const handleUploadPhoto = async () => {
    if (!uploadFile) {
      setPhotosError('Select a photo to upload');
      return;
    }

    try {
      setPhotosError('');
      await uploadMyPhoto({
        file: uploadFile,
        albumId: uploadAlbumId || null,
        description: uploadDescription || undefined,
      });
      setUploadFile(null);
      setUploadDescription('');
      setUploadAlbumId('');
      await reloadPhotos();
    } catch (err) {
      setPhotosError(err instanceof Error ? err.message : 'Failed to upload photo');
    }
  };

  const startAlbumEdit = (album: API.UserAlbumItem) => {
    setEditingAlbumId(album.id);
    setEditingAlbumName(album.name);
    setEditingAlbumDescription(album.description ?? '');
  };

  const cancelAlbumEdit = () => {
    setEditingAlbumId(null);
    setEditingAlbumName('');
    setEditingAlbumDescription('');
  };

  const handleSaveAlbum = async (albumId: string) => {
    if (!editingAlbumName.trim()) {
      setPhotosError('Album name is required');
      return;
    }

    try {
      setPhotosError('');
      await updateMyAlbum(albumId, {
        name: editingAlbumName.trim(),
        description: editingAlbumDescription.trim() ? editingAlbumDescription.trim() : null,
      });
      cancelAlbumEdit();
      await reloadPhotos();
    } catch (err) {
      setPhotosError(err instanceof Error ? err.message : 'Failed to update album');
    }
  };

  const handleSetAlbumCover = async (albumId: string, coverPhotoId: string) => {
    try {
      setPhotosError('');
      await updateMyAlbum(albumId, { coverPhotoId });
      await reloadPhotos();
    } catch (err) {
      setPhotosError(err instanceof Error ? err.message : 'Failed to update album cover');
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    const shouldDelete = window.confirm(
      'Delete this album and all photos inside it? This action cannot be undone.'
    );
    if (!shouldDelete) {
      return;
    }

    try {
      setPhotosError('');
      await deleteMyAlbum(albumId);
      if (editingAlbumId === albumId) {
        cancelAlbumEdit();
      }
      if (selectedAlbumId === albumId) {
        setSelectedAlbumId(null);
      }
      await reloadPhotos();
    } catch (err) {
      setPhotosError(err instanceof Error ? err.message : 'Failed to delete album');
    }
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
            isVerified={Boolean(user.emailVerifiedAt)}
            verifiedBadgeTestId="profile-user-verified-badge"
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
                <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
                <p data-testid="profile-user-email" className="text-sm text-slate-700">
                  {user.email}
                </p>
              </div>

              <div>
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
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-2xl font-semibold text-slate-900">Photos</h2>
              <p className="mt-1 text-sm text-slate-600">
                Group pictures into albums, or upload photos without an album.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Create album</h3>
              <input
                data-testid="profile-photos-album-name-input"
                value={albumName}
                onChange={(event) => {
                  setAlbumName(event.target.value);
                }}
                placeholder="Album name"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                data-testid="profile-photos-album-description-input"
                value={albumDescription}
                onChange={(event) => {
                  setAlbumDescription(event.target.value);
                }}
                placeholder="Description (optional)"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                data-testid="profile-photos-create-button"
                onClick={() => {
                  void handleCreateAlbum();
                }}
                className="mt-3 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white"
              >
                Create album
              </button>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="text-sm font-semibold text-slate-900">Upload photo</h3>
              <input
                data-testid="profile-photos-file-input"
                type="file"
                accept="image/jpeg,image/png,image/gif"
                onChange={(event) => {
                  const selectedFile = event.target.files?.[0] ?? null;
                  setUploadFile(selectedFile);
                }}
                className="mt-2 block w-full text-sm"
              />
              <select
                data-testid="profile-photos-album-select"
                value={uploadAlbumId}
                onChange={(event) => {
                  setUploadAlbumId(event.target.value);
                }}
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              >
                <option value="">Unsorted Photos</option>
                {photosData.albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name}
                  </option>
                ))}
              </select>
              <input
                data-testid="profile-photos-photo-description-input"
                value={uploadDescription}
                onChange={(event) => {
                  setUploadDescription(event.target.value);
                }}
                placeholder="Photo description (optional)"
                className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                data-testid="profile-photos-upload-button"
                onClick={() => {
                  void handleUploadPhoto();
                }}
                className="mt-3 rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white"
              >
                Upload photo
              </button>
            </div>
          </div>

          {photosError ? (
            <p data-testid="profile-photos-error" className="mt-4 text-sm text-danger-600">
              {photosError}
            </p>
          ) : null}

          {isPhotosLoading ? (
            <p data-testid="profile-photos-loading" className="mt-4 text-sm text-slate-600">
              Loading photos...
            </p>
          ) : (
            <div className="mt-6 space-y-5">
              <section data-testid="profile-photos-albums-section">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Albums</h3>
                {photosData.albums.length === 0 ? (
                  <p data-testid="profile-photos-albums-empty" className="text-sm text-slate-600">
                    No albums yet.
                  </p>
                ) : (
                  <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                    {photosData.albums.map((album) => (
                      <article
                        key={album.id}
                        data-testid={`profile-photos-album-${album.id}`}
                        className={`min-w-[180px] rounded-lg border p-2 ${
                          selectedAlbumId === album.id
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-200 bg-white'
                        }`}
                      >
                        {editingAlbumId === album.id ? (
                          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                            <input
                              data-testid={`profile-photos-album-name-input-${album.id}`}
                              value={editingAlbumName}
                              onChange={(event) => {
                                setEditingAlbumName(event.target.value);
                              }}
                              placeholder="Album name"
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            />
                            <input
                              data-testid={`profile-photos-album-description-input-${album.id}`}
                              value={editingAlbumDescription}
                              onChange={(event) => {
                                setEditingAlbumDescription(event.target.value);
                              }}
                              placeholder="Description (optional)"
                              className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                            />
                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                data-testid={`profile-photos-album-save-button-${album.id}`}
                                onClick={() => {
                                  void handleSaveAlbum(album.id);
                                }}
                                className="rounded-md bg-primary-600 px-3 py-2 text-xs font-semibold text-white"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                data-testid={`profile-photos-album-cancel-button-${album.id}`}
                                onClick={cancelAlbumEdit}
                                className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <button
                              type="button"
                              data-testid={`profile-photos-album-card-${album.id}`}
                              onClick={() => {
                                setSelectedAlbumId(album.id);
                              }}
                              className="w-full text-left"
                            >
                              {album.coverImageUrl ? (
                                <img
                                  data-testid={`profile-photos-album-cover-image-${album.id}`}
                                  src={album.coverImageUrl}
                                  alt={`${album.name} cover`}
                                  className="aspect-square w-full rounded-md border border-slate-200 bg-slate-50 object-contain p-1"
                                />
                              ) : (
                                <div
                                  data-testid={`profile-photos-album-cover-empty-${album.id}`}
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

                            <div className="mt-2 flex gap-2">
                              <button
                                type="button"
                                data-testid={`profile-photos-album-edit-button-${album.id}`}
                                onClick={() => {
                                  startAlbumEdit(album);
                                }}
                                className="rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                data-testid={`profile-photos-album-delete-button-${album.id}`}
                                onClick={() => {
                                  void handleDeleteAlbum(album.id);
                                }}
                                className="rounded-md border border-danger-300 px-2 py-1 text-xs font-semibold text-danger-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </section>

              {selectedAlbum ? (
                <section data-testid="profile-photos-selected-album-section">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{selectedAlbum.name}</h3>
                      <p className="text-sm text-slate-500">Album photos</p>
                    </div>
                    <button
                      type="button"
                      data-testid="profile-photos-selected-album-close-button"
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
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {selectedAlbum.photos.map((photo) => (
                        <div key={photo.id} className="relative">
                          <button
                            type="button"
                            data-testid={`profile-photos-album-image-${photo.id}`}
                            onClick={() => {
                              setSelectedPhotoId(photo.id);
                            }}
                            className="w-full"
                          >
                            <img
                              src={photo.imageUrl}
                              alt={photo.description ?? `${selectedAlbum.name} photo`}
                              className="aspect-square w-full rounded-md border border-slate-200 bg-slate-50 object-contain p-1"
                            />
                          </button>
                          <button
                            type="button"
                            data-testid={`profile-photos-album-set-cover-button-${photo.id}`}
                            onClick={() => {
                              void handleSetAlbumCover(selectedAlbum.id, photo.id);
                            }}
                            className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700"
                          >
                            {selectedAlbum.coverPhotoId === photo.id
                              ? 'Cover photo'
                              : 'Set as cover'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              ) : null}

              <section data-testid="profile-photos-unsorted-section">
                <h3 className="mb-2 text-lg font-semibold text-slate-900">Unsorted Photos</h3>
                {photosData.unsortedPhotos.length === 0 ? (
                  <p data-testid="profile-photos-unsorted-empty" className="text-sm text-slate-600">
                    No unsorted photos yet.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {photosData.unsortedPhotos.map((photo) => (
                      <button
                        key={photo.id}
                        type="button"
                        data-testid={`profile-photos-unsorted-image-${photo.id}`}
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
              data-testid="profile-photos-modal"
              className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4"
            >
              <button
                type="button"
                data-testid="profile-photos-modal-overlay"
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
                    data-testid="profile-photos-modal-close-button"
                    onClick={() => {
                      setSelectedPhotoId(null);
                    }}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                  >
                    Close
                  </button>
                </div>
                <img
                  data-testid={`profile-photos-modal-image-${selectedPhoto.id}`}
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
