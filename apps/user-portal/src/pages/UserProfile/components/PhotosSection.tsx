import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import type { API } from '@repo/contracts';
import { Button, Modal, Section } from '@repo/ui';

export type PhotoSectionKey = 'unsorted' | 'albums';

const PHOTO_SECTION_TABS: Array<{ key: PhotoSectionKey; label: string }> = [
  { key: 'unsorted', label: 'Unsorted' },
  { key: 'albums', label: 'Albums' },
];

function normalizePhotoSection(section?: string): PhotoSectionKey {
  return section === 'albums' ? 'albums' : 'unsorted';
}

interface PhotosSectionProps {
  profileUsername: string;
  photosData: API.GetUserPhotosResponse;
  isPhotosLoading: boolean;
  photosError: string;
}

export function PhotosSection({
  profileUsername,
  photosData,
  isPhotosLoading,
  photosError,
}: PhotosSectionProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

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

  return (
    <Section dataTestId="user-profile-photos-section" hasBorder background="primary" padding="p-6">
      <h2 className="text-2xl font-semibold text-slate-900">Photos</h2>
      <p className="mt-1 text-sm text-slate-600">
        Browse standalone photos or navigate through albums.
      </p>

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
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">{selectedAlbum.name}</h3>
                <p className="text-sm text-slate-500">Album photos</p>
              </div>
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
            <h3 className="text-lg font-semibold text-slate-900">Albums</h3>
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
                    className="min-w-[180px] rounded-lg border border-slate-200 bg-white p-2"
                  >
                    <Button
                      type="button"
                      variant="link"
                      size="sm"
                      data-testid={`user-profile-photos-album-card-${album.id}`}
                      onClick={() => {
                        navigate(`/users/${profileUsername}/photos/albums/${album.id}`);
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
    </Section>
  );
}
