import type { ChangeEvent, FormEvent } from 'react';
import type { RegisterRequest } from '../services/auth';
import { Container, Section, Stack } from '../components/layout';
import { useRegisterStateContract } from '../state-contracts/register';

const REGISTER_FIELDS = ['name', 'username', 'email', 'password'] as const;

function isRegisterField(field: string): field is keyof RegisterRequest {
  return (REGISTER_FIELDS as readonly string[]).includes(field);
}

export function Register() {
  const { state, actions } = useRegisterStateContract();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (isRegisterField(name)) {
      actions.updateField(name, value);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await actions.submit();
  };

  return (
    <Container maxWidth="md" dataTestId="register-page">
      <Section hasBorder background="primary" className="shadow-card" padding="p-6">
        <Stack gap="gap-4">
          <h1 data-testid="register-page-title" className="section-title mb-0 text-center">
            Register
          </h1>
          <form data-testid="register-form" onSubmit={handleSubmit}>
            <div className="form-field">
              <label htmlFor="name" className="label-base">
                Name
              </label>
              <input
                data-testid="register-name-input"
                type="text"
                id="name"
                name="name"
                value={state.formData.name}
                onChange={handleChange}
                required
                className="input-base"
              />
            </div>

            <div className="form-field">
              <label htmlFor="username" className="label-base">
                Username
              </label>
              <input
                data-testid="register-username-input"
                type="text"
                id="username"
                name="username"
                value={state.formData.username}
                onChange={handleChange}
                required
                className="input-base"
              />
            </div>

            <div className="form-field">
              <label htmlFor="email" className="label-base">
                Email
              </label>
              <input
                data-testid="register-email-input"
                type="email"
                id="email"
                name="email"
                value={state.formData.email}
                onChange={handleChange}
                required
                className="input-base"
              />
            </div>

            <div className="form-field">
              <label htmlFor="password" className="label-base">
                Password
              </label>
              <input
                data-testid="register-password-input"
                type="password"
                id="password"
                name="password"
                value={state.formData.password}
                onChange={handleChange}
                required
                className="input-base"
              />
            </div>

            {state.error && (
              <div data-testid="register-error-message" className="status-error">
                {state.error}
              </div>
            )}

            <button
              data-testid="register-submit-button"
              type="submit"
              disabled={!state.isFormValid || state.isLoading}
              className="btn-primary w-full"
            >
              {state.isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="text-center text-sm text-slate-600">
            <p className="mb-3">
              Already have an account?{' '}
              <a data-testid="register-login-link" href="/login" className="link-primary">
                Login
              </a>
            </p>
            <a data-testid="register-back-home-link" href="/" className="link-primary">
              Back to Home
            </a>
          </div>
        </Stack>
      </Section>
    </Container>
  );
}
