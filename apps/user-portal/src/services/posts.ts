import type {
  Comment,
  PostImage,
  GetPostsRequest,
  GetPostsResponse,
  GetFeedRequest,
  GetFeedResponse,
  FeedPost as ApiFeedPost,
  CreatePostRequest,
  CreatePostResponse,
  CreateCommentRequest,
  CreateCommentResponse,
  GetCommentsRequest,
  GetCommentsResponse,
  UpdatePostRequest,
  UpdatePostResponse,
  DeletePostResponse,
  UpdateCommentRequest,
  UpdateCommentResponse,
  DeleteCommentResponse,
  ToggleReactionRequest,
  ToggleReactionResponse,
} from '@repo/contracts/api';

const API_BASE_URL = 'http://localhost:4000';

// FeedPost from /feed endpoint includes author and reactions
export type FeedPost = ApiFeedPost;
export type PostComment = Comment;

export interface CreatePostInput extends CreatePostRequest {
  images?: File[];
}

export interface ReorderPostImagesRequest {
  imageOrder: string[];
}

export async function getPosts(params: GetPostsRequest = {}): Promise<GetPostsResponse> {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.authorId) query.set('authorId', params.authorId);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  const endpoint = `${API_BASE_URL}/posts${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch posts');
  }

  return response.json();
}

export async function getFeed(params: GetFeedRequest = {}): Promise<GetFeedResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const query = new URLSearchParams();

  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.authorId) query.set('authorId', params.authorId);
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  const endpoint = `${API_BASE_URL}/posts/feed${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch feed');
  }

  return response.json();
}

export async function createPost(data: CreatePostInput): Promise<CreatePostResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('content', data.content);
  data.images?.forEach((file) => {
    formData.append('images', file);
  });

  const response = await fetch(`${API_BASE_URL}/posts`, {
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
      throw new Error(error.message || 'Failed to create post');
    }
    throw new Error('Failed to create post');
  }

  return response.json();
}

export async function updatePost(
  postId: string,
  data: UpdatePostRequest
): Promise<UpdatePostResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update post');
  }

  return response.json();
}

export async function deletePost(postId: string): Promise<DeletePostResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete post');
  }

  return response.json();
}

export async function addPostImages(postId: string, images: File[]): Promise<UpdatePostResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const formData = new FormData();
  images.forEach((file) => {
    formData.append('images', file);
  });

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/images`, {
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
      throw new Error(error.message || 'Failed to add post images');
    }
    throw new Error('Failed to add post images');
  }

  return response.json();
}

export async function removePostImage(
  postId: string,
  imageId: string
): Promise<UpdatePostResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to remove post image');
  }

  return response.json();
}

export async function reorderPostImages(
  postId: string,
  data: ReorderPostImagesRequest
): Promise<UpdatePostResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/images/reorder`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to reorder post images');
  }

  return response.json();
}

export function sortPostImages(images: PostImage[] | undefined): PostImage[] {
  if (!images) {
    return [];
  }

  return [...images].sort((a, b) => a.orderIndex - b.orderIndex);
}

export async function togglePostReaction(
  postId: string,
  reactionType: 'like' = 'like'
): Promise<ToggleReactionResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/reactions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      reactionType,
    } as ToggleReactionRequest),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to toggle reaction');
  }

  return response.json();
}

export async function getPostComments(
  postId: string,
  params: GetCommentsRequest = {}
): Promise<GetCommentsResponse> {
  const query = new URLSearchParams();

  if (params.page !== undefined) query.set('page', String(params.page));
  if (params.limit !== undefined) query.set('limit', String(params.limit));
  if (params.sortOrder) query.set('sortOrder', params.sortOrder);

  const endpoint = `${API_BASE_URL}/posts/${postId}/comments${query.toString() ? `?${query.toString()}` : ''}`;
  const response = await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch comments');
  }

  return response.json();
}

export async function createPostComment(
  postId: string,
  data: CreateCommentRequest
): Promise<CreateCommentResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to create comment');
  }

  return response.json();
}

export async function updatePostComment(
  postId: string,
  commentId: string,
  data: UpdateCommentRequest
): Promise<UpdateCommentResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update comment');
  }

  return response.json();
}

export async function deletePostComment(
  postId: string,
  commentId: string
): Promise<DeleteCommentResponse> {
  const token = localStorage.getItem('jwtToken');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete comment');
  }

  return response.json();
}
