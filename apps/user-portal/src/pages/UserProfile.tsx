import { useUserProfileStateContract } from '../state-contracts/user-profile';

export function UserProfile() {
  const { state } = useUserProfileStateContract();
  const { profile, error, isLoading } = state;

  if (isLoading) {
    return (
      <div
        data-testid="user-profile-loading-state"
        className="page-container max-w-3xl text-center"
      >
        <p data-testid="user-profile-loading-text">Loading user profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div data-testid="user-profile-error-state" className="page-container max-w-3xl text-center">
        <p data-testid="user-profile-error-message" className="status-error">
          {error || 'User profile not found'}
        </p>
      </div>
    );
  }

  return (
    <div data-testid="user-profile-page" className="page-container max-w-3xl">
      <h1 data-testid="user-profile-page-title" className="section-title">
        User Profile
      </h1>

      <div data-testid="user-profile-card" className="card mt-5 p-6">
        <div className="mb-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700">User ID:</label>
          <p data-testid="user-profile-id" className="text-slate-500">
            {profile.id}
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Name:</label>
          <p data-testid="user-profile-name" className="text-slate-700">
            {profile.name}
          </p>
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-semibold text-slate-700">Username:</label>
          <p data-testid="user-profile-username" className="text-slate-700">
            @{profile.username}
          </p>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate-700">
            Email verification:
          </label>
          {profile.emailVerifiedAt ? (
            <p data-testid="user-profile-email-verified" className="text-green-600">
              ✓ Verified
            </p>
          ) : (
            <p data-testid="user-profile-email-unverified" className="text-yellow-600">
              ⚠ Not yet verified
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
