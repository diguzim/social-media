import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
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
      <span data-testid="user-profile-state-error">{state.error}</span>
      <span data-testid="user-profile-state-loading">{String(state.isLoading)}</span>
      <button data-testid="user-profile-refresh-btn" onClick={() => actions.refresh()}>
        refresh
      </button>
    </div>
  );
}

describe('UserProfileStateContractProvider', () => {
  it('injects a custom UserProfileStateContract implementation', () => {
    const refresh = vi.fn().mockResolvedValue(undefined);

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
      },
      actions: {
        refresh,
      },
    });

    render(
      <UserProfileStateContractProvider userProfileStateContract={useFakeUserProfileStateContract}>
        <TestConsumer />
      </UserProfileStateContractProvider>
    );

    expect(screen.getByTestId('user-profile-state-name')).toHaveTextContent('Alice Doe');
    expect(screen.getByTestId('user-profile-state-username')).toHaveTextContent('alice');
    expect(screen.getByTestId('user-profile-state-error')).toHaveTextContent('');
    expect(screen.getByTestId('user-profile-state-loading')).toHaveTextContent('false');

    screen.getByTestId('user-profile-refresh-btn').click();
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
