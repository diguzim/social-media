import { useProfileStateContract } from '../state-contracts/profile';
import { AvatarUpload } from '../components/avatar/AvatarUpload';

export function Profile() {
  const { state, actions } = useProfileStateContract();
  const { user, error, isLoading, isAvatarUploading, avatarUploadError } = state;

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
          <div className="mb-6 flex items-center gap-4">
            <img
              data-testid="profile-avatar-image"
              src={
                user.avatarUrl ||
                'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2296%22 height=%2296%22 viewBox=%220 0 96 96%22%3E%3Crect width=%2296%22 height=%2296%22 rx=%2248%22 fill=%22%23e2e8f0%22/%3E%3Ctext x=%2248%22 y=%2253%22 text-anchor=%22middle%22 font-size=%2212%22 fill=%22%23334155%22%3EAvatar%3C/text%3E%3C/svg%3E'
              }
              alt={`${user.name} profile`}
              className="h-24 w-24 rounded-full border border-slate-200 object-cover"
            />
            <div>
              <p className="text-sm font-semibold text-slate-700">Profile picture</p>
              <p className="text-xs text-slate-500">JPG or PNG, up to 2MB.</p>
            </div>
          </div>

          <AvatarUpload
            isUploading={isAvatarUploading}
            error={avatarUploadError}
            onUpload={actions.uploadAvatar}
          />

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
