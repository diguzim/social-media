import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile, getUserProfile } from '../services/auth';
import type { UserProfile } from '../services/auth';
import { Feed } from '../components/feed/Feed';

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
      <div data-testid="home-loading-state" className="page-container max-w-md text-center">
        <p data-testid="home-loading-text">Loading your profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div data-testid="home-error-state" className="page-container max-w-md text-center">
        <p data-testid="home-error-message" className="status-error">
          {error}
        </p>
        <p className="text-sm text-slate-600">Redirecting to login...</p>
      </div>
    );
  }

  return (
    <div data-testid="home-page" className="page-container max-w-5xl">
      {user && (
        <>
          <h1
            data-testid="home-welcome-title"
            className="text-center text-3xl font-bold text-slate-900"
          >
            Welcome {user.name}!
          </h1>
          <div data-testid="home-profile-card" className="card mt-5 px-6 py-5 text-center">
            <p className="mb-2 text-slate-700">
              <strong>ID:</strong> {user.id}
            </p>
            <p data-testid="home-user-email" className="mb-2 text-slate-700">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-slate-700">
              <strong>Name:</strong> {user.name}
            </p>
          </div>
        </>
      )}

      <div className="mt-7">
        <Feed />
      </div>

      <div className="mt-5 flex justify-center gap-3">
        <button data-testid="home-logout-button" onClick={handleLogout} className="btn-danger">
          Logout
        </button>
      </div>
    </div>
  );
}
