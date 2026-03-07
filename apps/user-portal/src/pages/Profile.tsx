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
      <div
        data-testid="profile-loading-state"
        style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}
      >
        <p data-testid="profile-loading-text">Loading your profile...</p>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div
        data-testid="profile-error-state"
        style={{ padding: '40px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}
      >
        <p data-testid="profile-error-message" style={{ color: 'red' }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="profile-page"
      style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}
    >
      <h1 data-testid="profile-page-title">Profile</h1>
      {user && (
        <div
          data-testid="profile-user-card"
          style={{
            marginTop: '20px',
            padding: '24px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
              User ID:
            </label>
            <p data-testid="profile-user-id" style={{ margin: 0, color: '#666' }}>
              {user.id}
            </p>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
              Name:
            </label>
            <p data-testid="profile-user-name" style={{ margin: 0, color: '#333' }}>
              {user.name}
            </p>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '4px' }}>
              Email:
            </label>
            <p data-testid="profile-user-email" style={{ margin: 0, color: '#333' }}>
              {user.email}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
