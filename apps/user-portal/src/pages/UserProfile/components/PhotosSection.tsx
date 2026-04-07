import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import type { API } from '@repo/contracts';
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Modal,
  Section,
  useDropdownMenu,
} from '@repo/ui';
import { createMyAlbum, deleteMyAlbum, updateMyAlbum } from '../../../services/photos';

export type PhotoSectionKey = 'unsorted' | 'albums';

type AlbumItem = API.GetUserPhotosResponse['albums'][number];

type AlbumFormMode = 'create' | 'edit';

const PHOTO_SECTION_TABS: Array<{ key: PhotoSectionKey; label: string }> = [
  { key: 'unsorted', label: 'Unsorted' },
  { key: 'albums', label: 'Albums' },
];

function normalizePhotoSection(section?: string): PhotoSectionKey {
  return section === 'albums' ? 'albums' : 'unsorted';
}

interface AlbumActionsMenuProps {
  album: AlbumItem;
  isAlbumDeleting: boolean;
  onEdit: (album: AlbumItem) => void;
  onDelete: (album: AlbumItem) => void;
}

function AlbumActionsMenu({ album, isAlbumDeleting, onEdit, onDelete }: AlbumActionsMenuProps) {
  const { close } = useDropdownMenu();

  return (
    <>
      <Button
        type="button"
        variant="link"
        fullWidth
        data-testid={`user-profile-photos-album-edit-action-${album.id}`}
        onClick={() => {
          close();
          onEdit(album);
        }}
        className="justify-start rounded-none border-b border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-100"
      >
        Edit album
      </Button>
      <Button
        type="button"
        variant="link"
        fullWidth
        data-testid={`user-profile-photos-album-delete-action-${album.id}`}
        onClick={() => {
          close();
          onDelete(album);
        }}
        isPending={isAlbumDeleting}
        pendingText="Deleting..."
        className="justify-start rounded-none px-4 py-3 text-danger-600 hover:bg-slate-100"
      >
        Delete album
      </Button>
    </>
  );
}

interface AlbumActionsTriggerProps {
  album: AlbumItem;
  isAlbumDeleting: boolean;
  onEdit: (album: AlbumItem) => void;
  onDelete: (album: AlbumItem) => void;
  className?: string;
}

function AlbumActionsTrigger({
  album,
  isAlbumDeleting,
  onEdit,
  onDelete,
  className,
}: AlbumActionsTriggerProps) {
  return (
    <div className={className}>
      <DropdownMenu className="inline-flex">
        <DropdownMenuTrigger
          type="button"
          variant="ghost"
          size="sm"
          data-testid={`user-profile-photos-album-actions-trigger-${album.id}`}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/70 bg-white/80 p-0 text-lg font-semibold text-slate-600 opacity-70 shadow-sm backdrop-blur transition hover:opacity-100"
          aria-label={`Manage ${album.name}`}
        >
          ⋯
        </DropdownMenuTrigger>

        <DropdownMenuContent
          dataTestId={`user-profile-photos-album-actions-menu-${album.id}`}
          align="end"
          side="bottom"
          offset="sm"
        >
          <AlbumActionsMenu
            album={album}
            isAlbumDeleting={isAlbumDeleting}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

interface PhotosSectionProps {
  profileUsername: string;
  isOwnProfile: boolean;
  photosData: API.GetUserPhotosResponse;
  isPhotosLoading: boolean;
  photosError: string;
  onRefreshPhotos: () => Promise<void>;
}

export function PhotosSection({
  profileUsername,
  isOwnProfile,
  photosData,
  isPhotosLoading,
  photosError,
  onRefreshPhotos,
}: PhotosSectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [albumFormMode, setAlbumFormMode] = useState<AlbumFormMode>('create');
  const [editingAlbum, setEditingAlbum] = useState<AlbumItem | null>(null);
  const [albumName, setAlbumName] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [isAlbumFormOpen, setIsAlbumFormOpen] = useState(false);
  const [albumFormError, setAlbumFormError] = useState('');
  const [isAlbumSaving, setIsAlbumSaving] = useState(false);
  const [albumDeleteTarget, setAlbumDeleteTarget] = useState<AlbumItem | null>(null);
  const [albumDeleteError, setAlbumDeleteError] = useState('');
  const [isAlbumDeleting, setIsAlbumDeleting] = useState(false);

  const photoRouteSegments = location.pathname.split('/').filter(Boolean).slice(3);
  const photoRouteSection = normalizePhotoSection(photoRouteSegments[0]);
  const selectedAlbumId = photoRouteSection === 'albums' ? (photoRouteSegments[1] ?? null) : null;
  const selectedPhotoId = searchParams.get('photo');

  const selectedAlbum = photosData.albums.find((album) => album.id === selectedAlbumId) ?? null;
  const allVisiblePhotos = [
    ...photosData.unsortedPhotos,
    ...photosData.albums.flatMap((album) => album.photos),
  ];
  const selectedPhoto = allVisiblePhotos.find((photo) => photo.id === selectedPhotoId) ?? null;

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

  const openCreateAlbumForm = () => {
    setAlbumFormMode('create');
    setEditingAlbum(null);
    setAlbumName('');
    setAlbumDescription('');
    setAlbumFormError('');
    setIsAlbumFormOpen(true);
  };

  const openEditAlbumForm = (album: AlbumItem) => {
    setAlbumFormMode('edit');
    setEditingAlbum(album);
    setAlbumName(album.name);
    setAlbumDescription(album.description ?? '');
    setAlbumFormError('');
    setIsAlbumFormOpen(true);
  };

  const closeAlbumForm = () => {
    if (isAlbumSaving) {
      return;
    }

    setIsAlbumFormOpen(false);
    setAlbumFormError('');
    setEditingAlbum(null);
  };

  const handleAlbumFormSubmit = async () => {
    const normalizedName = albumName.trim();
    const normalizedDescription = albumDescription.trim();

    if (!normalizedName) {
      setAlbumFormError('Album name is required');
      return;
    }

    setAlbumFormError('');
    setIsAlbumSaving(true);

    try {
      if (albumFormMode === 'create') {
        await createMyAlbum({
          name: normalizedName,
          description: normalizedDescription || undefined,
        });
      } else if (editingAlbum) {
        await updateMyAlbum(editingAlbum.id, {
          name: normalizedName,
          description: normalizedDescription || undefined,
        });
      }

      await onRefreshPhotos();
      setIsAlbumFormOpen(false);
      setEditingAlbum(null);
    } catch (err) {
      setAlbumFormError(err instanceof Error ? err.message : 'Failed to save album');
    } finally {
      setIsAlbumSaving(false);
    }
  };

  const openDeleteAlbumDialog = (album: AlbumItem) => {
    setAlbumDeleteTarget(album);
    setAlbumDeleteError('');
  };

  const closeDeleteAlbumDialog = () => {
    if (isAlbumDeleting) {
      return;
    }

    setAlbumDeleteTarget(null);
    setAlbumDeleteError('');
  };

  const handleDeleteAlbum = async () => {
    if (!albumDeleteTarget) {
      return;
    }

    setAlbumDeleteError('');
    setIsAlbumDeleting(true);

    try {
      await deleteMyAlbum(albumDeleteTarget.id);
      await onRefreshPhotos();
      setAlbumDeleteTarget(null);
      navigate(`/users/${profileUsername}/photos/albums`);
    } catch (err) {
      setAlbumDeleteError(err instanceof Error ? err.message : 'Failed to delete album');
    } finally {
      setIsAlbumDeleting(false);
    }
  };

  return (
    <Section dataTestId="user-profile-photos-section" hasBorder background="primary" padding="p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Photos</h2>
          <p className="mt-1 text-sm text-slate-600">
            Browse standalone photos or navigate through albums.
          </p>
        </div>

        {isOwnProfile ? (
          <Button
            type="button"
            variant="primary"
            size="sm"
            data-testid="user-profile-photos-new-album-button"
            onClick={openCreateAlbumForm}
            className="self-start"
          >
            New album
          </Button>
        ) : null}
      </div>

      <div
        data-testid="user-profile-photos-tabs"
        className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3"
        role="tablist"
        aria-label="Photo sections"
      >
        {PHOTO_SECTION_TABS.map((tab) => {
          const isActive = tab.key === photoRouteSection;

          return (
            <Button
              key={tab.key}
              data-testid={`user-profile-photos-tab-${tab.key}`}
              type="button"
              variant="toggle"
              size="sm"
              pressed={isActive}
              role="tab"
              aria-selected={isActive}
              onClick={() => {
                if (tab.key === 'unsorted') {
                  navigate(`/users/${profileUsername}/photos/unsorted`);
                  return;
                }

                navigate(`/users/${profileUsername}/photos/albums`);
              }}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {photosError ? (
        <p data-testid="user-profile-photos-error" className="mt-4 text-sm text-danger-600">
          {photosError}
        </p>
      ) : null}

      {isPhotosLoading ? (
        <p data-testid="user-profile-photos-loading" className="mt-4 text-sm text-slate-600">
          Loading photos...
        </p>
      ) : photoRouteSection === 'albums' ? (
        selectedAlbum ? (
          <section
            data-testid="user-profile-photos-album-detail-section"
            className="mt-5 space-y-4"
          >
            <div className="relative flex items-center justify-between gap-3 pr-12">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedAlbum.name}</h3>
                <p className="text-sm text-slate-500">Album photos</p>
              </div>

              <div className="flex items-center gap-2">
                {isOwnProfile ? (
                  <AlbumActionsTrigger
                    album={selectedAlbum}
                    isAlbumDeleting={isAlbumDeleting}
                    onEdit={openEditAlbumForm}
                    onDelete={openDeleteAlbumDialog}
                    className="relative z-20"
                  />
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  data-testid="user-profile-photos-album-back-button"
                  onClick={() => {
                    navigate(`/users/${profileUsername}/photos/albums`);
                  }}
                  className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700"
                >
                  Back to albums
                </Button>
              </div>
            </div>

            {selectedAlbum.photos.length === 0 ? (
              <p data-testid="user-profile-photos-album-empty" className="text-sm text-slate-600">
                Album is empty.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
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
        ) : (
          <section data-testid="user-profile-photos-albums-section" className="mt-5 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-slate-900">Albums</h3>
              {isOwnProfile ? (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  data-testid="user-profile-photos-new-album-inline-button"
                  onClick={openCreateAlbumForm}
                >
                  New album
                </Button>
              ) : null}
            </div>

            {photosData.albums.length === 0 ? (
              <p data-testid="user-profile-photos-albums-empty" className="text-sm text-slate-600">
                No albums yet.
              </p>
            ) : (
              <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
                {photosData.albums.map((album) => (
                  <article
                    key={album.id}
                    data-testid={`user-profile-photos-album-${album.id}`}
                    className="group relative min-w-[220px] rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    {isOwnProfile ? (
                      <AlbumActionsTrigger
                        album={album}
                        isAlbumDeleting={isAlbumDeleting}
                        onEdit={openEditAlbumForm}
                        onDelete={openDeleteAlbumDialog}
                        className="absolute right-3 top-3 z-20"
                      />
                    ) : null}

                    <button
                      type="button"
                      data-testid={`user-profile-photos-album-card-${album.id}`}
                      onClick={() => {
                        navigate(`/users/${profileUsername}/photos/albums/${album.id}`);
                      }}
                      className="block w-full overflow-hidden rounded-2xl text-left"
                    >
                      <div className="aspect-square w-full overflow-hidden bg-slate-100">
                        {album.coverImageUrl ? (
                          <img
                            data-testid={`user-profile-photos-album-cover-image-${album.id}`}
                            src={album.coverImageUrl}
                            alt={`${album.name} cover`}
                            className="h-full w-full object-cover transition duration-200 group-hover:scale-[1.02]"
                          />
                        ) : (
                          <div
                            data-testid={`user-profile-photos-album-cover-empty-${album.id}`}
                            className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-medium text-slate-500"
                          >
                            No image
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 px-4 py-4">
                        <h4 className="truncate text-sm font-semibold text-slate-900">
                          {album.name}
                        </h4>
                        <p className="text-xs text-slate-500">{album.photos.length} photos</p>
                      </div>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        )
      ) : (
        <section data-testid="user-profile-photos-unsorted-section" className="mt-5 space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">Unsorted Photos</h3>
          {photosData.unsortedPhotos.length === 0 ? (
            <p data-testid="user-profile-photos-unsorted-empty" className="text-sm text-slate-600">
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

      <Modal
        isOpen={isAlbumFormOpen}
        onClose={closeAlbumForm}
        ariaLabel={albumFormMode === 'create' ? 'Create album' : 'Edit album'}
        dataTestId="user-profile-album-form-modal"
        closeButtonTestId="user-profile-album-form-modal-close-button"
        dialogClassName="max-w-xl"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {albumFormMode === 'create' ? 'Create album' : 'Edit album'}
            </h3>
            <p className="mt-1 text-sm text-slate-600">
              {albumFormMode === 'create'
                ? 'Create a new album for organizing your photos.'
                : 'Update the album name or description.'}
            </p>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Album name</span>
              <input
                data-testid="user-profile-album-name-input"
                type="text"
                value={albumName}
                onChange={(event) => {
                  setAlbumName(event.target.value);
                }}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                placeholder="Summer trip"
                autoComplete="off"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Description</span>
              <textarea
                data-testid="user-profile-album-description-input"
                value={albumDescription}
                onChange={(event) => {
                  setAlbumDescription(event.target.value);
                }}
                className="min-h-[120px] w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
                placeholder="Optional description"
              />
            </label>
          </div>

          {albumFormError ? (
            <p data-testid="user-profile-album-form-error" className="text-sm text-danger-600">
              {albumFormError}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              data-testid="user-profile-album-form-cancel-button"
              onClick={closeAlbumForm}
              disabled={isAlbumSaving}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              data-testid="user-profile-album-form-submit-button"
              onClick={() => {
                void handleAlbumFormSubmit();
              }}
              isPending={isAlbumSaving}
              pendingText={albumFormMode === 'create' ? 'Creating...' : 'Saving...'}
            >
              {albumFormMode === 'create' ? 'Create album' : 'Save changes'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={Boolean(albumDeleteTarget)}
        onClose={closeDeleteAlbumDialog}
        ariaLabel="Delete album"
        dataTestId="user-profile-album-delete-modal"
        closeButtonTestId="user-profile-album-delete-modal-close-button"
        dialogClassName="max-w-lg"
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Delete album?</h3>
            <p className="mt-1 text-sm text-slate-600">
              {albumDeleteTarget
                ? `This will permanently delete “${albumDeleteTarget.name}” and its photos.`
                : 'This will permanently delete the selected album and its photos.'}
            </p>
          </div>

          {albumDeleteError ? (
            <p data-testid="user-profile-album-delete-error" className="text-sm text-danger-600">
              {albumDeleteError}
            </p>
          ) : null}

          <div className="flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              data-testid="user-profile-album-delete-cancel-button"
              onClick={closeDeleteAlbumDialog}
              disabled={isAlbumDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              data-testid="user-profile-album-delete-confirm-button"
              onClick={() => {
                void handleDeleteAlbum();
              }}
              isPending={isAlbumDeleting}
              pendingText="Deleting..."
            >
              Delete album
            </Button>
          </div>
        </div>
      </Modal>
    </Section>
  );
}
