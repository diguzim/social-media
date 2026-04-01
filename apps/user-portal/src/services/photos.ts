import type {
  CreateUserAlbumBody,
  CreateUserAlbumResponse,
  DeleteUserAlbumResponse,
  GetUserPhotosResponse,
  UpdateUserAlbumBody,
  UpdateUserAlbumResponse,
  UploadUserPhotoResponse,
} from '@repo/contracts/api';

const API_BASE_URL = 'http://localhost:4000';

function getTokenOrThrow(): string {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
}

export async function getUserPhotos(username: string): Promise<GetUserPhotosResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/users/${username}/photos`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load user photos');
  }

  return response.json();
}

export async function createMyAlbum(
  payload: CreateUserAlbumBody
): Promise<CreateUserAlbumResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/users/me/albums`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create album');
  }

  return response.json();
}

export async function updateMyAlbum(
  albumId: string,
  payload: UpdateUserAlbumBody
): Promise<UpdateUserAlbumResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/users/me/albums/${albumId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update album');
  }

  return response.json();
}

export async function deleteMyAlbum(albumId: string): Promise<DeleteUserAlbumResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/users/me/albums/${albumId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete album');
  }

  return response.json();
}

export async function uploadMyPhoto(input: {
  file: File;
  albumId?: string | null;
  description?: string;
}): Promise<UploadUserPhotoResponse> {
  const token = getTokenOrThrow();

  const formData = new FormData();
  formData.append('file', input.file);
  if (input.albumId) {
    formData.append('albumId', input.albumId);
  }
  if (input.description) {
    formData.append('description', input.description);
  }

  const response = await fetch(`${API_BASE_URL}/users/me/photos`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to upload photo');
    }
    throw new Error('Failed to upload photo');
  }

  return response.json();
}
