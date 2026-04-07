import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@repo/ui';
import {
  UserProfileStateContractProvider,
  useUserProfileStateContract,
  type UseUserProfileStateContract,
} from './index';

function TestConsumer() {
  const { state, actions } = useUserProfileStateContract();

  return (
    <div>
      <span data-testid="user-profile-state-name">{state.profile?.name}</span>
      <span data-testid="user-profile-state-username">{state.profile?.username}</span>
      <span data-testid="user-profile-state-posts-count">{state.posts.length}</span>
      <span data-testid="user-profile-state-error">{state.error}</span>
      <span data-testid="user-profile-state-loading">{String(state.isLoading)}</span>
      <Button data-testid="user-profile-refresh-btn" onClick={() => actions.refresh()}>
        refresh
      </Button>
      <Button data-testid="user-profile-refresh-posts-btn" onClick={() => actions.refreshPosts()}>
        refresh-posts
      </Button>
      <Button
        data-testid="user-profile-send-friend-request-btn"
        onClick={() => actions.sendFriendRequest()}
      >
        send-friend-request
      </Button>
      <Button
        data-testid="user-profile-load-next-posts-btn"
        onClick={() => actions.loadNextPostsPage()}
      >
        next-posts
      </Button>
    </div>
  );
}

describe('UserProfileStateContractProvider', () => {
  it('injects a custom UserProfileStateContract implementation', () => {
    const refresh = vi.fn().mockResolvedValue(undefined);
    const refreshPosts = vi.fn().mockResolvedValue(undefined);
    const sendFriendRequest = vi.fn().mockResolvedValue(undefined);
    const loadNextPostsPage = vi.fn().mockResolvedValue(undefined);

    const useFakeUserProfileStateContract: UseUserProfileStateContract = () => ({
      state: {
        profile: {
          id: 'user-1',
          name: 'Alice Doe',
          username: 'alice',
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
        refresh,
        refreshPosts,
        sendFriendRequest,
        loadNextPostsPage,
      },
    });

    render(
      <UserProfileStateContractProvider userProfileStateContract={useFakeUserProfileStateContract}>
        <TestConsumer />
      </UserProfileStateContractProvider>
    );

    expect(screen.getByTestId('user-profile-state-name')).toHaveTextContent('Alice Doe');
    expect(screen.getByTestId('user-profile-state-username')).toHaveTextContent('alice');
    expect(screen.getByTestId('user-profile-state-posts-count')).toHaveTextContent('0');
    expect(screen.getByTestId('user-profile-state-error')).toHaveTextContent('');
    expect(screen.getByTestId('user-profile-state-loading')).toHaveTextContent('false');

    screen.getByTestId('user-profile-refresh-btn').click();
    expect(refresh).toHaveBeenCalledTimes(1);

    screen.getByTestId('user-profile-refresh-posts-btn').click();
    expect(refreshPosts).toHaveBeenCalledTimes(1);

    screen.getByTestId('user-profile-send-friend-request-btn').click();
    expect(sendFriendRequest).toHaveBeenCalledTimes(1);

    screen.getByTestId('user-profile-load-next-posts-btn').click();
    expect(loadNextPostsPage).toHaveBeenCalledTimes(1);
  });
});
