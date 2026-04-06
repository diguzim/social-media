import { Link } from 'react-router-dom';
import type { FriendUserSummary } from '@repo/contracts/api';

function UserFriendItem({
  id,
  name,
  username,
  avatarUrl,
}: {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}) {
  return (
    <li data-testid={`user-profile-friend-item-${id}`} className="card p-4">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          <img
            data-testid={`user-profile-friend-avatar-${id}`}
            src={avatarUrl}
            alt={`${name} profile picture`}
            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div
            data-testid={`user-profile-friend-avatar-fallback-${id}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700"
          >
            {name.charAt(0).toUpperCase() || '?'}
          </div>
        )}

        <div>
          <Link
            to={`/users/${username}`}
            data-testid={`user-profile-friend-link-${id}`}
            className="text-base font-semibold text-slate-900 hover:text-blue-700 hover:underline"
          >
            {name}
          </Link>
          <p className="text-sm text-slate-500">@{username}</p>
        </div>
      </div>
    </li>
  );
}

interface FriendsSectionProps {
  friends: FriendUserSummary[];
  isFriendsLoading: boolean;
  friendsError: string;
  canViewAcceptedFriends: boolean;
}

export function FriendsSection({
  friends,
  isFriendsLoading,
  friendsError,
  canViewAcceptedFriends,
}: FriendsSectionProps) {
  return (
    <section data-testid="user-profile-friends-section" className="mt-6">
      <h2 className="mb-3 text-2xl font-semibold text-slate-900">Friends</h2>

      {!canViewAcceptedFriends ? (
        <p data-testid="user-profile-friends-placeholder" className="text-sm text-slate-600">
          Public accepted-friends listing is coming soon.
        </p>
      ) : isFriendsLoading ? (
        <p data-testid="user-profile-friends-loading" className="text-sm text-slate-600">
          Loading accepted friends...
        </p>
      ) : friendsError ? (
        <p data-testid="user-profile-friends-error" className="text-sm text-danger-600">
          {friendsError}
        </p>
      ) : friends.length === 0 ? (
        <p data-testid="user-profile-friends-empty" className="text-sm text-slate-600">
          No accepted friends yet.
        </p>
      ) : (
        <ul data-testid="user-profile-friends-list" className="grid gap-3">
          {friends.map((friend) => (
            <UserFriendItem
              key={friend.id}
              id={friend.id}
              name={friend.name}
              username={friend.username}
              avatarUrl={friend.avatarUrl}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
