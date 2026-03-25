import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import {
  ProfileStateContractProvider,
  useProfileStateContract,
  type UseProfileStateContract,
} from './index';

function TestConsumer() {
  const { state, actions } = useProfileStateContract();

  return (
    <div>
      <span data-testid="profile-state-user-name">{state.user?.name}</span>
      <span data-testid="profile-state-error">{state.error}</span>
      <span data-testid="profile-state-loading">{String(state.isLoading)}</span>
      <button data-testid="profile-refresh-btn" onClick={() => actions.refresh()}>
        refresh
      </button>
    </div>
  );
}

describe('ProfileStateContractProvider', () => {
  it('injects a custom ProfileStateContract implementation', async () => {
    const refresh = vi.fn().mockResolvedValue(undefined);

    const useFakeProfileStateContract: UseProfileStateContract = () => ({
      state: {
        user: {
          id: 'user-123',
          name: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          emailVerifiedAt: '2024-01-15T10:00:00Z',
        },
        error: '',
        isLoading: false,
      },
      actions: {
        refresh,
      },
    });

    render(
      <ProfileStateContractProvider profileStateContract={useFakeProfileStateContract}>
        <TestConsumer />
      </ProfileStateContractProvider>
    );

    expect(screen.getByTestId('profile-state-user-name')).toHaveTextContent('John Doe');
    expect(screen.getByTestId('profile-state-error')).toHaveTextContent('');
    expect(screen.getByTestId('profile-state-loading')).toHaveTextContent('false');

    screen.getByTestId('profile-refresh-btn').click();
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
