import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from '@repo/ui';
import {
  RegisterStateContractProvider,
  useRegisterStateContract,
  type UseRegisterStateContract,
} from './index';

function TestConsumer() {
  const { state, actions } = useRegisterStateContract();

  return (
    <div>
      <span data-testid="register-state-name">{state.formData.name}</span>
      <span data-testid="register-state-valid">{String(state.isFormValid)}</span>
      <Button
        data-testid="register-update-btn"
        onClick={() => actions.updateField('name', 'Updated Name')}
      >
        update
      </Button>
    </div>
  );
}

describe('RegisterStateContractProvider', () => {
  it('injects a custom RegisterStateContract implementation', () => {
    const updateField = vi.fn();
    const submit = vi.fn().mockResolvedValue(undefined);

    const useFakeRegisterStateContract: UseRegisterStateContract = () => ({
      state: {
        formData: {
          name: 'Injected Register',
          username: 'injected-register',
          email: 'register@example.com',
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
      <RegisterStateContractProvider registerStateContract={useFakeRegisterStateContract}>
        <TestConsumer />
      </RegisterStateContractProvider>
    );

    expect(screen.getByTestId('register-state-name')).toHaveTextContent('Injected Register');
    expect(screen.getByTestId('register-state-valid')).toHaveTextContent('true');

    screen.getByTestId('register-update-btn').click();
    expect(updateField).toHaveBeenCalledTimes(1);
    expect(updateField).toHaveBeenCalledWith('name', 'Updated Name');
  });
});
