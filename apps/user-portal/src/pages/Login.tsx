import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, getProfile, getUserProfile, LoginRequest } from '../services/auth';

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
    setFormData((prev) => ({
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
    <div data-testid="login-page" style={{ padding: '40px', maxWidth: '400px', margin: '0 auto' }}>
      <h1 data-testid="login-page-title">Login</h1>
      <form data-testid="login-form" onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor="email"
            style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
          >
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
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label
            htmlFor="password"
            style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}
          >
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
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div data-testid="login-error-message" style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <button
          data-testid="login-submit-button"
          type="submit"
          disabled={!isFormValid || loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: !isFormValid || loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: !isFormValid || loading ? 'not-allowed' : 'pointer',
            opacity: !isFormValid || loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Don't have an account?{' '}
        <a
          data-testid="login-create-account-link"
          href="/register"
          style={{ color: '#007bff', textDecoration: 'none' }}
        >
          Create one
        </a>
      </p>
    </div>
  );
}
