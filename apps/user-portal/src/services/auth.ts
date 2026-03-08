import type {
  RegisterRequest,
  RegisterResponse,
  LoginRequest,
  LoginResponse,
  GetProfileResponse,
} from '@repo/contracts/api';

const API_BASE_URL = 'http://localhost:4000';

// Re-export types for convenience
export type { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse };

export type UserProfile = GetProfileResponse;

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

export function storeUserProfile(profile: UserProfile): void {
  localStorage.setItem('user', JSON.stringify(profile));
}

export function getUserProfile(): UserProfile | null {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}
