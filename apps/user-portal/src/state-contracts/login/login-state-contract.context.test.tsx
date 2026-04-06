import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@repo/ui';
import {
  LoginStateContractProvider,
  useLoginStateContract,
  type UseLoginStateContract,
} from './index';

function TestConsumer() {
  const { state, actions } = useLoginStateContract();

  return (
    <div>
      <span data-testid="login-state-email">{state.formData.email}</span>
      <span data-testid="login-state-valid">{String(state.isFormValid)}</span>
      <Button
        data-testid="login-update-btn"
        onClick={() => actions.updateField('email', 'updated@example.com')}
      >
        update
      </Button>
    </div>
  );
}

describe('LoginStateContractProvider', () => {
  it('injects a custom LoginStateContract implementation', () => {
    const updateField = vi.fn();
    const submit = vi.fn().mockResolvedValue(undefined);

    const useFakeLoginStateContract: UseLoginStateContract = () => ({
      state: {
        formData: {
          email: 'login@example.com',
          password: 'secret-123',
        },
        error: '',
        isLoading: false,
        isFormValid: true,
      },
      actions: {
        updateField,
        submit,
      },
    });

    render(
      <LoginStateContractProvider loginStateContract={useFakeLoginStateContract}>
        <TestConsumer />
      </LoginStateContractProvider>
    );

    expect(screen.getByTestId('login-state-email')).toHaveTextContent('login@example.com');
    expect(screen.getByTestId('login-state-valid')).toHaveTextContent('true');

    screen.getByTestId('login-update-btn').click();
    expect(updateField).toHaveBeenCalledTimes(1);
    expect(updateField).toHaveBeenCalledWith('email', 'updated@example.com');
  });
});
