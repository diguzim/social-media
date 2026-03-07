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
    <div
      data-testid="register-page"
      style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}
    >
      <h1 data-testid="register-page-title">Register</h1>
      <form data-testid="register-form" onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>
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
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
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
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
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
            style={{ width: '100%', padding: '8px' }}
          />
        </div>

        {error && (
          <div data-testid="register-error-message" style={{ color: 'red', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <button
          data-testid="register-submit-button"
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
          {loading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <p>
          Already have an account?{' '}
          <a
            data-testid="register-login-link"
            href="/login"
            style={{ color: '#007bff', textDecoration: 'none' }}
          >
            Login
          </a>
        </p>
        <a
          data-testid="register-back-home-link"
          href="/"
          style={{ color: '#007bff', textDecoration: 'none' }}
        >
          Back to Home
        </a>
      </div>
    </div>
  );
}
