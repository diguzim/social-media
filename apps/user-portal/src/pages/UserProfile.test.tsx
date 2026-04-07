import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { UserProfile } from './UserProfile';
import { useUserProfileStateContract } from '../state-contracts/user-profile';
import { getUserPhotos } from '../services/photos';

vi.mock('../state-contracts/user-profile', () => ({
  useUserProfileStateContract: vi.fn(),
}));

vi.mock('../services/photos', () => ({
  getUserPhotos: vi.fn(),
}));

const mockedUseUserProfileStateContract = vi.mocked(useUserProfileStateContract);
const mockedGetUserPhotos = vi.mocked(getUserPhotos);

function renderUserProfileAt(pathname: string) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Routes>
        <Route path="/users/:username" element={<UserProfile />} />
        <Route path="/users/:username/:section/*" element={<UserProfile />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('UserProfile', () => {
  it('renders loading state', () => {
    mockedUseUserProfileStateContract.mockReturnValue({
      state: {
        profile: null,
        error: '',
        isLoading: true,
        isOwnProfile: false,
        friendshipStatus: 'none',
        friendshipError: '',
        isFriendshipActionPending: false,
        posts: [],
        isPostsLoading: true,
        isLoadingMorePosts: false,
        hasMorePosts: false,
        postsError: '',
        postsLoadMoreError: '',
        friends: [],
        friendsCount: 0,
        isFriendsLoading: false,
        friendsError: '',
        canViewAcceptedFriends: false,
      },
      actions: {
        refresh: vi.fn().mockResolvedValue(undefined),
        refreshPosts: vi.fn().mockResolvedValue(undefined),
        sendFriendRequest: vi.fn().mockResolvedValue(undefined),
        loadNextPostsPage: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-profile-loading-state')).toBeInTheDocument();
  });

  it('renders profile info and posts list', () => {
    mockedUseUserProfileStateContract.mockReturnValue({
      state: {
        profile: {
          id: 'user-5',
          name: 'Eve',
          username: 'eve',
          emailVerifiedAt: null,
        },
        error: '',
        isLoading: false,
        isOwnProfile: false,
        friendshipStatus: 'none',
        friendshipError: '',
        isFriendshipActionPending: false,
        posts: [
          {
            id: 'post-1',
            title: 'Post by Eve',
            content: 'Content',
            authorId: 'user-5',
            author: { id: 'user-5', name: 'Eve', username: 'eve' },
            createdAt: '2026-03-10T10:00:00.000Z',
          },
        ],
        isPostsLoading: false,
        isLoadingMorePosts: false,
        hasMorePosts: true,
        postsError: '',
        postsLoadMoreError: '',
        friends: [],
        friendsCount: 3,
        isFriendsLoading: false,
        friendsError: '',
        canViewAcceptedFriends: false,
      },
      actions: {
        refresh: vi.fn().mockResolvedValue(undefined),
        refreshPosts: vi.fn().mockResolvedValue(undefined),
        sendFriendRequest: vi.fn().mockResolvedValue(undefined),
        loadNextPostsPage: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    expect(screen.getByTestId('user-profile-card')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-name')).toHaveTextContent('Eve');
    expect(screen.getByTestId('user-profile-username')).toHaveTextContent('@eve');
    expect(screen.getByTestId('user-profile-avatar-image')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-stats')).toHaveTextContent('Posts');
    expect(screen.getByTestId('user-profile-stats')).toHaveTextContent('3');
    expect(screen.getByTestId('user-profile-stats-coming-soon')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-sections-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-sections-tab-timeline')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-sections-tab-photos')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-sections-tab-friends')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-posts-list')).toBeInTheDocument();
    expect(screen.getByTestId('post-title-post-1')).toHaveTextContent('Post by Eve');
    expect(screen.getByTestId('user-profile-posts-infinite-sentinel')).toBeInTheDocument();
  });

  it('shows own-profile avatar actions and opens avatar modal from See image', () => {
    mockedUseUserProfileStateContract.mockReturnValue({
      state: {
        profile: {
          id: 'user-7',
          name: 'Owner User',
          username: 'owner-user',
          emailVerifiedAt: null,
          avatarUrl: 'http://localhost:4000/users/user-7/avatar',
        },
        error: '',
        isLoading: false,
        isOwnProfile: true,
        friendshipStatus: 'self',
        friendshipError: '',
        isFriendshipActionPending: false,
        posts: [],
        isPostsLoading: false,
        isLoadingMorePosts: false,
        hasMorePosts: false,
        postsError: '',
        postsLoadMoreError: '',
        friends: [],
        friendsCount: 0,
        isFriendsLoading: false,
        friendsError: '',
        canViewAcceptedFriends: true,
      },
      actions: {
        refresh: vi.fn().mockResolvedValue(undefined),
        refreshPosts: vi.fn().mockResolvedValue(undefined),
        sendFriendRequest: vi.fn().mockResolvedValue(undefined),
        loadNextPostsPage: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('user-profile-avatar-trigger'));
    expect(screen.getByTestId('user-profile-avatar-actions-menu')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-avatar-see-image-action')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-avatar-change-image-action')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('user-profile-avatar-see-image-action'));
    expect(screen.getByTestId('user-profile-avatar-modal')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-avatar-modal-image')).toBeInTheDocument();
  });

  it('opens avatar modal directly when viewing another user profile', () => {
    mockedUseUserProfileStateContract.mockReturnValue({
      state: {
        profile: {
          id: 'user-9',
          name: 'Public User',
          username: 'public-user',
          emailVerifiedAt: null,
          avatarUrl: 'http://localhost:4000/users/user-9/avatar',
        },
        error: '',
        isLoading: false,
        isOwnProfile: false,
        friendshipStatus: 'none',
        friendshipError: '',
        isFriendshipActionPending: false,
        posts: [],
        isPostsLoading: false,
        isLoadingMorePosts: false,
        hasMorePosts: false,
        postsError: '',
        postsLoadMoreError: '',
        friends: [],
        friendsCount: 1,
        isFriendsLoading: false,
        friendsError: '',
        canViewAcceptedFriends: false,
      },
      actions: {
        refresh: vi.fn().mockResolvedValue(undefined),
        refreshPosts: vi.fn().mockResolvedValue(undefined),
        sendFriendRequest: vi.fn().mockResolvedValue(undefined),
        loadNextPostsPage: vi.fn().mockResolvedValue(undefined),
      },
    });

    render(
      <MemoryRouter>
        <UserProfile />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByTestId('user-profile-avatar-trigger'));
    expect(screen.queryByTestId('user-profile-avatar-actions-menu')).not.toBeInTheDocument();
    expect(screen.getByTestId('user-profile-avatar-modal')).toBeInTheDocument();
  });

  it('defaults photos route to the unsorted tab', async () => {
    mockedGetUserPhotos.mockResolvedValue({
      albums: [
        {
          id: 'album-1',
          name: 'Album One',
          description: null,
          coverImageUrl: undefined,
          coverPhotoId: null,
          createdAt: '2026-03-10T10:00:00.000Z',
          updatedAt: '2026-03-10T10:00:00.000Z',
          photos: [],
        },
      ],
      unsortedPhotos: [
        {
          id: 'photo-1',
          imageUrl: 'http://localhost:4000/users/user-10/photos/photo-1',
          description: 'Unsorted photo',
          uploadedAt: '2026-03-10T10:00:00.000Z',
          mimeType: 'image/png',
          albumId: null,
        },
      ],
    });

    mockedUseUserProfileStateContract.mockReturnValue({
      state: {
        profile: {
          id: 'user-10',
          name: 'Photo User',
          username: 'photo-user',
          emailVerifiedAt: null,
        },
        error: '',
        isLoading: false,
        isOwnProfile: false,
        friendshipStatus: 'none',
        friendshipError: '',
        isFriendshipActionPending: false,
        posts: [],
        isPostsLoading: false,
        isLoadingMorePosts: false,
        hasMorePosts: false,
        postsError: '',
        postsLoadMoreError: '',
        friends: [],
        friendsCount: 0,
        isFriendsLoading: false,
        friendsError: '',
        canViewAcceptedFriends: false,
      },
      actions: {
        refresh: vi.fn().mockResolvedValue(undefined),
        refreshPosts: vi.fn().mockResolvedValue(undefined),
        sendFriendRequest: vi.fn().mockResolvedValue(undefined),
        loadNextPostsPage: vi.fn().mockResolvedValue(undefined),
      },
    });

    renderUserProfileAt('/users/photo-user/photos');

    expect(await screen.findByTestId('user-profile-photos-tab-unsorted')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByTestId('user-profile-photos-unsorted-section')).toBeInTheDocument();
    expect(screen.queryByTestId('user-profile-photos-albums-section')).not.toBeInTheDocument();
  });

  it('renders album detail route and allows navigation back to albums', async () => {
    mockedGetUserPhotos.mockResolvedValue({
      albums: [
        {
          id: 'album-2',
          name: 'Summer Album',
          description: null,
          coverImageUrl: 'http://localhost:4000/users/user-11/photos/album-2-cover',
          coverPhotoId: 'photo-2',
          createdAt: '2026-03-10T10:00:00.000Z',
          updatedAt: '2026-03-10T10:00:00.000Z',
          photos: [
            {
              id: 'photo-2',
              imageUrl: 'http://localhost:4000/users/user-11/photos/photo-2',
              description: 'Album photo',
              uploadedAt: '2026-03-10T10:00:00.000Z',
              mimeType: 'image/png',
              albumId: 'album-2',
            },
          ],
        },
      ],
      unsortedPhotos: [],
    });

    mockedUseUserProfileStateContract.mockReturnValue({
      state: {
        profile: {
          id: 'user-11',
          name: 'Album User',
          username: 'album-user',
          emailVerifiedAt: null,
        },
        error: '',
        isLoading: false,
        isOwnProfile: false,
        friendshipStatus: 'none',
        friendshipError: '',
        isFriendshipActionPending: false,
        posts: [],
        isPostsLoading: false,
        isLoadingMorePosts: false,
        hasMorePosts: false,
        postsError: '',
        postsLoadMoreError: '',
        friends: [],
        friendsCount: 0,
        isFriendsLoading: false,
        friendsError: '',
        canViewAcceptedFriends: false,
      },
      actions: {
        refresh: vi.fn().mockResolvedValue(undefined),
        refreshPosts: vi.fn().mockResolvedValue(undefined),
        sendFriendRequest: vi.fn().mockResolvedValue(undefined),
        loadNextPostsPage: vi.fn().mockResolvedValue(undefined),
      },
    });

    renderUserProfileAt('/users/album-user/photos/albums/album-2');

    expect(await screen.findByTestId('user-profile-photos-tab-albums')).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByTestId('user-profile-photos-album-detail-section')).toBeInTheDocument();
    expect(screen.getByTestId('user-profile-photos-album-image-photo-2')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('user-profile-photos-album-back-button'));
    expect(screen.getByTestId('user-profile-photos-albums-section')).toBeInTheDocument();
  });
});
