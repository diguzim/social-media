import type { LoginRequest } from '../services/auth';
import type { ChangeEvent, FormEvent } from 'react';
import { Container, Section, Stack } from '../components/layout';
import { useLoginStateContract } from '../state-contracts/login';

const LOGIN_FIELDS = ['email', 'password'] as const;

function isLoginField(field: string): field is keyof LoginRequest {
  return (LOGIN_FIELDS as readonly string[]).includes(field);
}

export function Login() {
  const { state, actions } = useLoginStateContract();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isLoginField(name)) {
      actions.updateField(name, value);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await actions.submit();
  };

  return (
    <Container maxWidth="md" dataTestId="login-page">
      <Section hasBorder background="primary" className="shadow-card" padding="p-6">
        <Stack gap="gap-4">
          <h1 data-testid="login-page-title" className="section-title mb-0 text-center">
            Login
          </h1>
          <form data-testid="login-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="email" className="label-base">
                Email or Username:
              </label>
              <input
                data-testid="login-email-input"
                id="email"
                type="text"
                name="email"
                value={state.formData.email}
                onChange={handleChange}
                required
                className="input-base"
              />
            </div>

            <div className="form-field">
              <label htmlFor="password" className="label-base">
                Password:
              </label>
              <input
                data-testid="login-password-input"
                id="password"
                type="password"
                name="password"
                value={state.formData.password}
                onChange={handleChange}
                required
                className="input-base"
              />
            </div>

            {state.error && (
              <div data-testid="login-error-message" className="status-error">
                {state.error}
              </div>
            )}

            <button
              data-testid="login-submit-button"
              type="submit"
              disabled={!state.isFormValid || state.isLoading}
              className="btn-primary w-full"
            >
              {state.isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-600">
            Don&apos;t have an account?{' '}
            <a data-testid="login-create-account-link" href="/register" className="link-primary">
              Create one
            </a>
          </p>
        </Stack>
      </Section>
    </Container>
  );
}
