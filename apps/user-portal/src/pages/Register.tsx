import React, { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser, type RegisterRequest } from '../services/auth';

export function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Simple validation: all fields must have values
  const isFormValid =
    formData.name.trim() !== '' && formData.email.trim() !== '' && formData.password.trim() !== '';

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await registerUser(formData);
      navigate('/login');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="register-page" className="auth-container">
      <h1 data-testid="register-page-title" className="section-title text-center">
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
            value={formData.name}
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
            value={formData.email}
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
            value={formData.password}
            onChange={handleChange}
            required
            className="input-base"
          />
        </div>

        {error && (
          <div data-testid="register-error-message" className="status-error">
            {error}
          </div>
        )}

        <button
          data-testid="register-submit-button"
          type="submit"
          disabled={!isFormValid || loading}
          className="btn-primary w-full"
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="mt-4 text-center text-sm text-slate-600">
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
    </div>
  );
}
