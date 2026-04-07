import type { ReactNode } from 'react';

interface ProfileHeaderCardProps {
  cardTestId: string;
  avatarTestId: string;
  nameTestId: string;
  usernameTestId: string;
  verifiedBadgeTestId?: string;
  statsTestId: string;
  comingSoonTestId: string;
  name: string;
  username: string;
  avatarUrl?: string;
  avatarSlot?: ReactNode;
  postsCount: number;
  friendsCount: number;
  isVerified?: boolean;
}

const DEFAULT_AVATAR_DATA_URL =
  'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22120%22 height=%22120%22 viewBox=%220 0 120 120%22%3E%3Crect width=%22120%22 height=%22120%22 rx=%2260%22 fill=%22%23e2e8f0%22/%3E%3Ctext x=%2260%22 y=%2266%22 text-anchor=%22middle%22 font-size=%2214%22 fill=%22%23334155%22%3EAvatar%3C/text%3E%3C/svg%3E';

export function ProfileHeaderCard({
  cardTestId,
  avatarTestId,
  nameTestId,
  usernameTestId,
  verifiedBadgeTestId,
  statsTestId,
  comingSoonTestId,
  name,
  username,
  avatarUrl,
  avatarSlot,
  postsCount,
  friendsCount,
  isVerified,
}: ProfileHeaderCardProps) {
  return (
    <section data-testid={cardTestId} className="card mt-5 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {avatarSlot ?? (
            <img
              data-testid={avatarTestId}
              src={avatarUrl || DEFAULT_AVATAR_DATA_URL}
              alt={`${name} profile`}
              className="h-20 w-20 rounded-full border border-slate-200 object-cover sm:h-24 sm:w-24"
            />
          )}

          <div>
            <div className="flex items-center gap-2">
              <h2 data-testid={nameTestId} className="text-2xl font-semibold text-slate-900">
                {name}
              </h2>
              {isVerified ? (
                <span
                  data-testid={verifiedBadgeTestId}
                  className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700"
                >
                  Verified
                </span>
              ) : null}
            </div>
            <p data-testid={usernameTestId} className="text-sm text-slate-500">
              @{username}
            </p>
          </div>
        </div>
      </div>

      <div data-testid={statsTestId} className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Posts</p>
          <p className="text-lg font-semibold text-slate-900">{postsCount}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Following</p>
          <p className="text-lg font-semibold text-slate-900">—</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Followers</p>
          <p className="text-lg font-semibold text-slate-900">—</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <p className="text-xs uppercase tracking-wide text-slate-500">Friends</p>
          <p className="text-lg font-semibold text-slate-900">{friendsCount}</p>
        </div>
      </div>

      <p data-testid={comingSoonTestId} className="mt-3 text-xs text-slate-500">
        Following/followers counts are coming soon.
      </p>
    </section>
  );
}
