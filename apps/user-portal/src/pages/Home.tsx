import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getUserProfile } from '../services/auth';
import type { UserProfile } from '../services/auth';

export function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getProfile();
        setUser(profile);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
        const cachedUser = getUserProfile();
        if (cachedUser) {
          setUser(cachedUser);
          setError('');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <div
        data-testid="home-loading-state"
        style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}
      >
        <p data-testid="home-loading-text">Loading your profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div
        data-testid="home-error-state"
        style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}
      >
        <p data-testid="home-error-message" style={{ color: 'red' }}>
          {error}
        </p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div
      data-testid="home-page"
      style={{ padding: '40px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}
    >
      {user && (
        <>
          <h1 data-testid="home-welcome-title">Welcome {user.name}!</h1>
          <div
            data-testid="home-profile-card"
            style={{
              marginTop: '20px',
              padding: '20px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
            }}
          >
            <p>
              <strong>ID:</strong> {user.id}
            </p>
            <p data-testid="home-user-email">
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
          </div>
        </>
      )}

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button
          data-testid="home-logout-button"
          onClick={handleLogout}
          style={{
            padding: '10px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
