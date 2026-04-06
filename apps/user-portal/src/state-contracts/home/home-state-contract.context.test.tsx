import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@repo/ui';
import { StateContractsProvider, useHomeStateContract, type UseHomeStateContract } from './index';

function TestConsumer() {
  const { state, actions } = useHomeStateContract();

  return (
    <div>
      <span data-testid="state-user-name">{state.user?.name ?? 'none'}</span>
      <span data-testid="state-feed-key">{state.feedRefreshKey}</span>
      <Button data-testid="state-refresh-btn" onClick={actions.refreshFeed}>
        refresh
      </Button>
    </div>
  );
}

describe('StateContractsProvider', () => {
  it('injects a custom HomeStateContract implementation', () => {
    const refreshFeed = vi.fn();

    const useFakeHomeStateContract: UseHomeStateContract = () => ({
      state: {
        user: {
          id: 'user-1',
          name: 'Injected User',
          username: 'injected-user',
          email: 'injected@example.com',
          emailVerifiedAt: null,
        },
        profileError: '',
        isProfileLoading: false,
        isProfileRefreshing: false,
        feedRefreshKey: 42,
      },
      actions: {
        refreshFeed,
      },
    });

    render(
      <StateContractsProvider homeStateContract={useFakeHomeStateContract}>
        <TestConsumer />
      </StateContractsProvider>
    );

    expect(screen.getByTestId('state-user-name')).toHaveTextContent('Injected User');
    expect(screen.getByTestId('state-feed-key')).toHaveTextContent('42');

    screen.getByTestId('state-refresh-btn').click();
    expect(refreshFeed).toHaveBeenCalledTimes(1);
  });
});
