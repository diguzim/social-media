import { useProfileStateContract } from '../state-contracts/profile';

export function Profile() {
  const { state } = useProfileStateContract();
  const { user, error, isLoading } = state;

  if (isLoading) {
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

          <div className="mb-4">
            <label className="mb-1 block text-sm font-semibold text-slate-700">Email:</label>
            <p data-testid="profile-user-email" className="text-slate-700">
              {user.email}
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700">
              Email verification:
            </label>
            {user.emailVerifiedAt ? (
              <p data-testid="profile-email-verified" className="text-green-600">
                ✓ Verified on {new Date(user.emailVerifiedAt).toLocaleDateString()}
              </p>
            ) : (
              <p data-testid="profile-email-unverified" className="text-yellow-600">
                ⚠ Not yet verified
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
