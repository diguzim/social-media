import type {
  SendFriendRequestBody,
  SendFriendRequestResponse,
  RespondFriendRequestResponse,
  ListFriendRequestsResponse,
  ListFriendsResponse,
  GetFriendshipStatusResponse,
  GetFriendCountResponse,
} from '@repo/contracts/api';

const API_BASE_URL = 'http://localhost:4000';

function getTokenOrThrow(): string {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return token;
}

export async function sendFriendRequest(
  data: SendFriendRequestBody
): Promise<SendFriendRequestResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/friends/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send friend request');
  }

  return response.json();
}

export async function acceptFriendRequest(
  requestId: string
): Promise<RespondFriendRequestResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/friends/requests/${requestId}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to accept friend request');
  }

  return response.json();
}

export async function rejectFriendRequest(
  requestId: string
): Promise<RespondFriendRequestResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/friends/requests/${requestId}/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reject friend request');
  }

  return response.json();
}

export async function listFriends(): Promise<ListFriendsResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/friends`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load friends');
  }

  return response.json();
}

export async function listIncomingPending(): Promise<ListFriendRequestsResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/friends/requests/incoming`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load incoming requests');
  }

  return response.json();
}

export async function listOutgoingPending(): Promise<ListFriendRequestsResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/friends/requests/outgoing`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load outgoing requests');
  }

  return response.json();
}

export async function getFriendshipStatus(username: string): Promise<GetFriendshipStatusResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/friends/status/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load friendship status');
  }

  return response.json();
}

export async function getFriendCount(username: string): Promise<GetFriendCountResponse> {
  const token = getTokenOrThrow();

  const response = await fetch(`${API_BASE_URL}/friends/count/${username}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to load friend count');
  }

  return response.json();
}
