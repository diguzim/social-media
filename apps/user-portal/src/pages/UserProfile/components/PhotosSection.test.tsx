import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { PhotosSection } from './PhotosSection';
import {
  createMyAlbum,
  deleteMyAlbum,
  deleteMyPhoto,
  updateMyAlbum,
  uploadMyPhoto,
} from '../../../services/photos';

vi.mock('../../../services/photos', () => ({
  createMyAlbum: vi.fn(),
  updateMyAlbum: vi.fn(),
  deleteMyAlbum: vi.fn(),
  uploadMyPhoto: vi.fn(),
  deleteMyPhoto: vi.fn(),
}));

const mockedCreateMyAlbum = vi.mocked(createMyAlbum);
const mockedUpdateMyAlbum = vi.mocked(updateMyAlbum);
const mockedDeleteMyAlbum = vi.mocked(deleteMyAlbum);
const mockedUploadMyPhoto = vi.mocked(uploadMyPhoto);
const mockedDeleteMyPhoto = vi.mocked(deleteMyPhoto);

const basePhotosData = {
  albums: [
    {
      id: 'album-1',
      name: 'Summer Album',
      description: 'Vacation photos',
      coverPhotoId: null,
      coverImageUrl: undefined,
      createdAt: '2026-03-10T10:00:00.000Z',
      updatedAt: null,
      photos: [
        {
          id: 'photo-1',
          imageUrl: 'http://localhost:4000/users/user-1/photos/photo-1',
          description: 'Album photo',
          uploadedAt: '2026-03-10T10:00:00.000Z',
          mimeType: 'image/png',
          albumId: 'album-1',
        },
      ],
    },
  ],
  unsortedPhotos: [
    {
      id: 'photo-2',
      imageUrl: 'http://localhost:4000/users/user-1/photos/photo-2',
      description: 'Loose photo',
      uploadedAt: '2026-03-10T10:00:00.000Z',
      mimeType: 'image/png',
      albumId: null,
    },
  ],
};

function renderPhotosSection(
  pathname: string,
  overrides?: Partial<Parameters<typeof PhotosSection>[0]>
) {
  const onRefreshPhotos = overrides?.onRefreshPhotos ?? vi.fn().mockResolvedValue(undefined);

  render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route
          path="/users/:username/photos/*"
          element={
            <PhotosSection
              profileUsername="alice"
              isOwnProfile={true}
              photosData={basePhotosData}
              isPhotosLoading={false}
              photosError=""
              onRefreshPhotos={onRefreshPhotos}
              {...overrides}
            />
          }
        />
      </Routes>
    </MemoryRouter>
  );

  return { onRefreshPhotos };
}

describe('PhotosSection album management', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('allows creating a new album with the shared album form', async () => {
    const onRefreshPhotos = vi.fn().mockResolvedValue(undefined);
    mockedCreateMyAlbum.mockResolvedValue({
      album: {
        id: 'album-2',
        name: 'New Trip',
        description: 'Fresh album',
        coverPhotoId: null,
        coverImageUrl: undefined,
        createdAt: '2026-03-11T10:00:00.000Z',
        updatedAt: null,
        photos: [],
      },
    });

    renderPhotosSection('/users/alice/photos/albums', { onRefreshPhotos });

    fireEvent.click(screen.getByTestId('user-profile-photos-new-album-button'));

    fireEvent.change(screen.getByTestId('user-profile-album-name-input'), {
      target: { value: ' New Trip ' },
    });
    fireEvent.change(screen.getByTestId('user-profile-album-description-input'), {
      target: { value: ' Fresh album ' },
    });
    fireEvent.click(screen.getByTestId('user-profile-album-form-submit-button'));

    await waitFor(() => {
      expect(mockedCreateMyAlbum).toHaveBeenCalledWith({
        name: 'New Trip',
        description: 'Fresh album',
      });
    });
    expect(onRefreshPhotos).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('user-profile-album-form-modal')).not.toBeInTheDocument();
  });

  it('allows editing an existing album from the detail header', async () => {
    const onRefreshPhotos = vi.fn().mockResolvedValue(undefined);
    mockedUpdateMyAlbum.mockResolvedValue({
      album: {
        id: 'album-1',
        name: 'Summer Album Updated',
        description: 'Vacation photos',
        coverPhotoId: null,
        coverImageUrl: undefined,
        createdAt: '2026-03-10T10:00:00.000Z',
        updatedAt: '2026-03-12T10:00:00.000Z',
        photos: basePhotosData.albums[0]!.photos,
      },
    });

    renderPhotosSection('/users/alice/photos/albums/album-1', { onRefreshPhotos });

    fireEvent.click(screen.getByTestId('user-profile-photos-album-actions-trigger-album-1'));
    fireEvent.click(screen.getByTestId('user-profile-photos-album-edit-action-album-1'));
    fireEvent.change(screen.getByTestId('user-profile-album-name-input'), {
      target: { value: 'Summer Album Updated' },
    });
    fireEvent.click(screen.getByTestId('user-profile-album-form-submit-button'));

    await waitFor(() => {
      expect(mockedUpdateMyAlbum).toHaveBeenCalledWith('album-1', {
        name: 'Summer Album Updated',
        description: 'Vacation photos',
      });
    });
    expect(onRefreshPhotos).toHaveBeenCalledTimes(1);
  });

  it('allows deleting an album from the list and returns to the albums view', async () => {
    const onRefreshPhotos = vi.fn().mockResolvedValue(undefined);
    mockedDeleteMyAlbum.mockResolvedValue({ success: true });

    renderPhotosSection('/users/alice/photos/albums/album-1', { onRefreshPhotos });

    fireEvent.click(screen.getByTestId('user-profile-photos-album-actions-trigger-album-1'));
    fireEvent.click(screen.getByTestId('user-profile-photos-album-delete-action-album-1'));
    fireEvent.click(screen.getByTestId('user-profile-album-delete-confirm-button'));

    await waitFor(() => {
      expect(mockedDeleteMyAlbum).toHaveBeenCalledWith('album-1');
    });
    expect(onRefreshPhotos).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('user-profile-photos-albums-section')).toBeInTheDocument();
  });

  it('uploads a photo into unsorted from the unsorted tab context', async () => {
    const onRefreshPhotos = vi.fn().mockResolvedValue(undefined);
    mockedUploadMyPhoto.mockResolvedValue({
      photo: {
        id: 'photo-3',
        imageUrl: 'http://localhost:4000/users/user-1/photos/photo-3',
        description: null,
        uploadedAt: '2026-03-10T10:00:00.000Z',
        mimeType: 'image/png',
        albumId: null,
      },
    });

    renderPhotosSection('/users/alice/photos/unsorted', { onRefreshPhotos });

    fireEvent.click(screen.getByTestId('user-profile-photos-upload-unsorted-button'));

    const uploadInput = screen.getByTestId('user-profile-photos-upload-input') as HTMLInputElement;
    const file = new File(['test'], 'unsorted.png', { type: 'image/png' });
    fireEvent.change(uploadInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockedUploadMyPhoto).toHaveBeenCalledWith({
        file,
        albumId: null,
      });
    });
    expect(onRefreshPhotos).toHaveBeenCalledTimes(1);
  });

  it('uploads a photo into the selected album from album detail context', async () => {
    const onRefreshPhotos = vi.fn().mockResolvedValue(undefined);
    mockedUploadMyPhoto.mockResolvedValue({
      photo: {
        id: 'photo-4',
        imageUrl: 'http://localhost:4000/users/user-1/photos/photo-4',
        description: null,
        uploadedAt: '2026-03-10T10:00:00.000Z',
        mimeType: 'image/png',
        albumId: 'album-1',
      },
    });

    renderPhotosSection('/users/alice/photos/albums/album-1', { onRefreshPhotos });

    fireEvent.click(screen.getByTestId('user-profile-photos-upload-album-button'));

    const uploadInput = screen.getByTestId('user-profile-photos-upload-input') as HTMLInputElement;
    const file = new File(['test'], 'album.png', { type: 'image/png' });
    fireEvent.change(uploadInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(mockedUploadMyPhoto).toHaveBeenCalledWith({
        file,
        albumId: 'album-1',
      });
    });
    expect(onRefreshPhotos).toHaveBeenCalledTimes(1);
  });

  it('deletes a photo from the owner-only photo actions menu', async () => {
    const onRefreshPhotos = vi.fn().mockResolvedValue(undefined);
    mockedDeleteMyPhoto.mockResolvedValue({ success: true });

    renderPhotosSection('/users/alice/photos/unsorted', { onRefreshPhotos });

    fireEvent.click(screen.getByTestId('user-profile-photo-actions-trigger-photo-2'));
    fireEvent.click(screen.getByTestId('user-profile-photo-delete-action-photo-2'));
    fireEvent.click(screen.getByTestId('user-profile-photo-delete-confirm-button'));

    await waitFor(() => {
      expect(mockedDeleteMyPhoto).toHaveBeenCalledWith('photo-2');
    });
    expect(onRefreshPhotos).toHaveBeenCalledTimes(1);
  });

  it('hides album management actions for non-owners', () => {
    render(
      <MemoryRouter initialEntries={['/users/alice/photos/albums']}>
        <Routes>
          <Route
            path="/users/:username/photos/*"
            element={
              <PhotosSection
                profileUsername="alice"
                isOwnProfile={false}
                photosData={basePhotosData}
                isPhotosLoading={false}
                photosError=""
                onRefreshPhotos={vi.fn().mockResolvedValue(undefined)}
              />
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByTestId('user-profile-photos-new-album-button')).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('user-profile-photos-upload-unsorted-button')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('user-profile-photos-album-actions-trigger-album-1')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId('user-profile-photo-actions-trigger-photo-2')
    ).not.toBeInTheDocument();
  });
});
