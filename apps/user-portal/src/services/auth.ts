import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  GetProfileResponse,
  GetPublicProfileResponse,
  ConfirmEmailVerificationRequest,
  ConfirmEmailVerificationResponse,
  RequestEmailVerificationResponse,
} from '@repo/contracts/api';

const API_BASE_URL = 'http://localhost:4000';

// Re-export types for convenience
export type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  ConfirmEmailVerificationRequest,
  ConfirmEmailVerificationResponse,
  RequestEmailVerificationResponse,
};

export type UserProfile = GetProfileResponse;
export type PublicUserProfile = GetPublicProfileResponse;

export interface UploadProfileAvatarResponse {
  imageUrl: string;
  uploadedAt: string;
}

const EMAIL_CONFIRM_INFLIGHT = new Map<string, Promise<ConfirmEmailVerificationResponse>>();
const EMAIL_CONFIRM_RECENT = new Map<
  string,
  {
    value: ConfirmEmailVerificationResponse;
    expiresAt: number;
  }
>();
const EMAIL_CONFIRM_RECENT_TTL_MS = 30_000;

export async function registerUser(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Registration failed');
  }

  return response.json();
}

export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Login failed');
  }

  const result = await response.json();
  localStorage.setItem('jwtToken', result.accessToken);
  return result;
}

export async function getProfile(): Promise<UserProfile> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch profile');
  }

  const profile = await response.json();
  storeUserProfile(profile);
  return profile;
}

export async function getPublicProfile(userId: string): Promise<PublicUserProfile> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }

  return response.json();
}

export async function confirmEmailVerification(
  token: string
): Promise<ConfirmEmailVerificationResponse> {
  const now = Date.now();
  const cached = EMAIL_CONFIRM_RECENT.get(token);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const inFlight = EMAIL_CONFIRM_INFLIGHT.get(token);
  if (inFlight) {
    return inFlight;
  }

  const request = (async () => {
    const response = await fetch(`${API_BASE_URL}/users/email-verification/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token } satisfies ConfirmEmailVerificationRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Email verification failed');
    }

    const result = (await response.json()) as ConfirmEmailVerificationResponse;
    EMAIL_CONFIRM_RECENT.set(token, {
      value: result,
      expiresAt: Date.now() + EMAIL_CONFIRM_RECENT_TTL_MS,
    });
    return result;
  })();

  EMAIL_CONFIRM_INFLIGHT.set(token, request);

  try {
    return await request;
  } finally {
    EMAIL_CONFIRM_INFLIGHT.delete(token);
  }
}

export async function requestEmailVerification(): Promise<RequestEmailVerificationResponse> {
  const jwtToken = localStorage.getItem('jwtToken');
  if (!jwtToken) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/users/email-verification/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send verification email');
  }

  return response.json();
}

export async function uploadProfileAvatar(file: File): Promise<UploadProfileAvatarResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/users/avatar`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload profile image');
  }

  return response.json();
}

export function storeUserProfile(profile: UserProfile): void {
  localStorage.setItem('user', JSON.stringify(profile));
}

export function getUserProfile(): UserProfile | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as UserProfile;
  } catch {
    return null;
  }
}
