import { Link } from 'react-router-dom';
import { useFriendsStateContract } from '../state-contracts/friends';
import { PendingButton } from '../components/loading/PendingButton';
import { Container, Stack } from '../components/layout';

function UserIdentityCard({
  id,
  name,
  username,
  avatarUrl,
  testIdPrefix,
}: {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  testIdPrefix: string;
}) {
  const hasAvatar = Boolean(avatarUrl);
  const initial = name.charAt(0).toUpperCase() || '?';

  return (
    <div className="flex items-center gap-3">
      {hasAvatar ? (
        <img
          data-testid={`${testIdPrefix}-avatar-${id}`}
          src={avatarUrl}
          alt={`${name} profile picture`}
          className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
        />
      ) : (
        <div
          data-testid={`${testIdPrefix}-avatar-fallback-${id}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700"
          aria-label={`${name} avatar fallback`}
        >
          {initial}
        </div>
      )}

      <div>
        <Link
          data-testid={`${testIdPrefix}-profile-link-${id}`}
          to={`/users/${username}`}
          className="text-base font-semibold text-slate-900 hover:text-blue-700 hover:underline"
        >
          {name}
        </Link>
        <p className="text-sm text-slate-500">@{username}</p>
      </div>
    </div>
  );
}

export function Friends() {
  const { state, actions } = useFriendsStateContract();

  if (state.isLoading) {
    return (
      <Container maxWidth="5xl" dataTestId="friends-page">
        <Stack gap="gap-5">
          <h1 className="text-3xl font-bold text-slate-900">Friends</h1>
          <p data-testid="friends-loading-text" className="text-slate-600">
            Loading friendship data...
          </p>
        </Stack>
      </Container>
    );
  }

  if (state.error) {
    return (
      <Container maxWidth="5xl" dataTestId="friends-page">
        <Stack gap="gap-5">
          <h1 className="text-3xl font-bold text-slate-900">Friends</h1>
          <p data-testid="friends-error-text" className="text-danger-600">
            {state.error}
          </p>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="5xl" dataTestId="friends-page">
      <Stack gap="gap-5">
        <h1 className="text-3xl font-bold text-slate-900">Friends</h1>

        {state.actionError ? (
          <p data-testid="friends-action-error" className="text-sm text-danger-600">
            {state.actionError}
          </p>
        ) : null}

        <section data-testid="friends-accepted-section" className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">My friends</h2>
          {state.friends.length === 0 ? (
            <p data-testid="friends-accepted-empty" className="text-sm text-slate-600">
              You have no friends yet.
            </p>
          ) : (
            <ul data-testid="friends-accepted-list" className="grid gap-3">
              {state.friends.map((friend) => (
                <li key={friend.id} className="card p-4" data-testid={`friend-item-${friend.id}`}>
                  <UserIdentityCard
                    id={friend.id}
                    name={friend.name}
                    username={friend.username}
                    avatarUrl={friend.avatarUrl}
                    testIdPrefix="friend"
                  />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section data-testid="friends-incoming-section" className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Incoming requests</h2>
          {state.incomingRequests.length === 0 ? (
            <p data-testid="friends-incoming-empty" className="text-sm text-slate-600">
              No pending incoming requests.
            </p>
          ) : (
            <ul data-testid="friends-incoming-list" className="grid gap-3">
              {state.incomingRequests.map((request) => (
                <li
                  key={request.id}
                  className="card p-4"
                  data-testid={`incoming-request-${request.id}`}
                >
                  <div className="mb-3">
                    <UserIdentityCard
                      id={request.requester.id}
                      name={request.requester.name}
                      username={request.requester.username}
                      avatarUrl={request.requester.avatarUrl}
                      testIdPrefix="incoming-requester"
                    />
                  </div>
                  <div className="flex gap-2">
                    <PendingButton
                      data-testid={`incoming-accept-${request.id}`}
                      isPending={state.pendingRequestId === request.id}
                      idleText="Accept"
                      pendingText="Accepting..."
                      onClick={() => {
                        void actions.acceptRequest(request.id);
                      }}
                      className="rounded-md bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
                    />
                    <PendingButton
                      data-testid={`incoming-reject-${request.id}`}
                      isPending={state.pendingRequestId === request.id}
                      idleText="Reject"
                      pendingText="Rejecting..."
                      onClick={() => {
                        void actions.rejectRequest(request.id);
                      }}
                      className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section data-testid="friends-outgoing-section" className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Outgoing requests</h2>
          {state.outgoingRequests.length === 0 ? (
            <p data-testid="friends-outgoing-empty" className="text-sm text-slate-600">
              No pending outgoing requests.
            </p>
          ) : (
            <ul data-testid="friends-outgoing-list" className="grid gap-3">
              {state.outgoingRequests.map((request) => (
                <li
                  key={request.id}
                  className="card p-4"
                  data-testid={`outgoing-request-${request.id}`}
                >
                  <UserIdentityCard
                    id={request.recipient.id}
                    name={request.recipient.name}
                    username={request.recipient.username}
                    avatarUrl={request.recipient.avatarUrl}
                    testIdPrefix="outgoing-recipient"
                  />
                  <p className="mt-2 text-xs text-slate-500">Pending approval</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Stack>
    </Container>
  );
}
