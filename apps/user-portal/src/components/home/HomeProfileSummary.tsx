import type { UserProfile } from '../../services/auth';
import { InlineStatus } from '../loading/InlineStatus';
import { SectionSkeleton } from '../loading/SectionSkeleton';

interface HomeProfileSummaryProps {
  user: UserProfile | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string;
}

export function HomeProfileSummary({
  user,
  isLoading,
  isRefreshing,
  error,
}: HomeProfileSummaryProps) {
  if (isLoading && !user) {
    return (
      <SectionSkeleton
        dataTestId="home-profile-loading-state"
        title="Loading your profile"
        variant="profile"
        minHeight={220}
      />
    );
  }

  if (!user) {
    return (
      <section data-testid="home-profile-error-state" className="card px-6 py-5 text-center">
        <p data-testid="home-profile-error-message" className="status-error mb-0">
          {error || 'Failed to load your profile.'}
        </p>
      </section>
    );
  }

  return (
    <section data-testid="home-profile-section">
      <h1
        data-testid="home-welcome-title"
        className="text-center text-3xl font-bold text-slate-900"
      >
        Welcome {user.name}!
      </h1>

      {isRefreshing && (
        <InlineStatus
          dataTestId="home-profile-refreshing-status"
          message="Refreshing your profile..."
          className="mt-3 text-center"
        />
      )}

      {error && (
        <InlineStatus
          dataTestId="home-profile-refresh-error"
          tone="warning"
          message={`Showing cached profile. ${error}`}
          className="mt-3 text-center"
        />
      )}

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
    </section>
  );
}
