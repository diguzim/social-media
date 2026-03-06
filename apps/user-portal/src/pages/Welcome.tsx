import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getUserProfile } from '../services/auth';
import type { UserProfile } from '../services/auth';

export function Welcome() {
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
        // Try to get from localStorage as fallback
        const cachedUser = getUserProfile();
        if (cachedUser) {
          setUser(cachedUser);
          setError('');
        } else {
          // Redirect to login if we can't get profile
          setTimeout(() => navigate('/login'), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
        <p style={{ color: 'red' }}>{error}</p>
        <p>Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      {user && (
        <>
          <h1>Welcome {user.name}!</h1>
          <div
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
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
          </div>
        </>
      )}

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <a
          href="/"
          style={{
            padding: '10px 15px',
            backgroundColor: '#007bff',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px',
          }}
        >
          Home
        </a>
        <button
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
