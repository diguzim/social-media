import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { Profile } from './Profile';
import { useProfileStateContract } from '../state-contracts/profile';

vi.mock('../state-contracts/profile', () => ({
  useProfileStateContract: vi.fn(),
}));

const mockedUseProfileStateContract = vi.mocked(useProfileStateContract);

describe('Profile', () => {
  it('renders loading state', () => {
    mockedUseProfileStateContract.mockReturnValue({
      state: {
        user: null,
        error: '',
        isLoading: true,
        isAvatarUploading: false,
        avatarUploadError: '',
        posts: [],
        isPostsLoading: true,
        isLoadingMorePosts: false,
        hasMorePosts: false,
        postsError: '',
        postsLoadMoreError: '',
      },
      actions: {
        refresh: vi.fn().mockResolvedValue(undefined),
        uploadAvatar: vi.fn().mockResolvedValue(undefined),
        refreshPosts: vi.fn().mockResolvedValue(undefined),
        loadNextPostsPage: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByTestId('profile-loading-state')).toBeInTheDocument();
  });

  it('renders modern profile header and posts section', () => {
    mockedUseProfileStateContract.mockReturnValue({
      state: {
        user: {
          id: 'user-1',
          name: 'John Doe',
          username: 'john',
          email: 'john@example.com',
          emailVerifiedAt: '2026-03-01T10:00:00.000Z',
          avatarUrl: undefined,
        },
        error: '',
        isLoading: false,
        isAvatarUploading: false,
        avatarUploadError: '',
        posts: [
          {
            id: 'post-1',
            title: 'My Post',
            content: 'Content',
            authorId: 'user-1',
            author: { id: 'user-1', name: 'John Doe' },
            createdAt: '2026-03-10T10:00:00.000Z',
          },
        ],
        isPostsLoading: false,
        isLoadingMorePosts: false,
        hasMorePosts: true,
        postsError: '',
        postsLoadMoreError: '',
      },
      actions: {
        refresh: vi.fn().mockResolvedValue(undefined),
        uploadAvatar: vi.fn().mockResolvedValue(undefined),
        refreshPosts: vi.fn().mockResolvedValue(undefined),
        loadNextPostsPage: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );

    expect(screen.getByTestId('profile-user-card')).toBeInTheDocument();
    expect(screen.getByTestId('profile-user-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('profile-user-username')).toHaveTextContent('@john');
    expect(screen.getByTestId('profile-user-stats')).toHaveTextContent('Posts');
    expect(screen.getByTestId('profile-user-details-card')).toBeInTheDocument();
    expect(screen.getByTestId('profile-avatar-upload-section')).toBeInTheDocument();
    expect(screen.getByTestId('profile-posts-list')).toBeInTheDocument();
    expect(screen.getByTestId('post-title-post-1')).toHaveTextContent('My Post');
    expect(screen.getByTestId('profile-posts-infinite-sentinel')).toBeInTheDocument();
  });
});
