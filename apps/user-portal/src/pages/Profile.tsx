import { useState, useEffect } from 'react';
import { getProfile, getUserProfile } from '../services/auth';
import type { UserProfile as UserProfileType } from '../services/auth';

export function Profile() {
  const [user, setUser] = useState<UserProfileType | null>(null);
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

  if (loading) {
    return (
      <div data-testid="profile-loading-state" className="page-container max-w-3xl text-center">
        <p data-testid="profile-loading-text">Loading your profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div data-testid="profile-error-state" className="page-container max-w-3xl text-center">
        <p data-testid="profile-error-message" className="status-error">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div data-testid="profile-page" className="page-container max-w-3xl">
      <h1 data-testid="profile-page-title" className="section-title">
        Profile
      </h1>
      {user && (
        <div data-testid="profile-user-card" className="card mt-5 p-6">
          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-slate-700">User ID:</label>
            <p data-testid="profile-user-id" className="text-slate-500">
              {user.id}
            </p>
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Name:</label>
            <p data-testid="profile-user-name" className="text-slate-700">
              {user.name}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email:</label>
            <p data-testid="profile-user-email" className="text-slate-700">
              {user.email}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
