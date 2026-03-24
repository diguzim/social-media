import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getProfile, getUserProfile } from '../services/auth';
import type { LoginRequest } from '../services/auth';

export function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: LoginRequest) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Simple validation: all fields must have values
  const isFormValid = formData.email.trim() !== '' && formData.password.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(formData);

      // Ensure user profile is loaded and stored in localStorage
      try {
        await getProfile();
      } catch {
        const cachedUser = getUserProfile();
        if (!cachedUser) {
          localStorage.removeItem('jwtToken');
          throw new Error('Failed to load user profile after login');
        }
      }

      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="login-page" className="auth-container">
      <h1 data-testid="login-page-title" className="section-title text-center">
        Login
      </h1>
      <form data-testid="login-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="email" className="label-base">
            Email:
          </label>
          <input
            data-testid="login-email-input"
            id="email"
            type="email"
            name="email"
            value={formData.email}
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
            value={formData.password}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        {error && (
          <div data-testid="login-error-message" className="status-error">
            {error}
          </div>
        )}

        <button
          data-testid="login-submit-button"
          type="submit"
          disabled={!isFormValid || loading}
          className="btn-primary w-full"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600">
        Don&apos;t have an account?{' '}
        <a data-testid="login-create-account-link" href="/register" className="link-primary">
          Create one
        </a>
      </p>
    </div>
  );
}
