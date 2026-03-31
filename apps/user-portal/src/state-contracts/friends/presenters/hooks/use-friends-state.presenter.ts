import { useCallback, useEffect, useState } from 'react';
import {
  acceptFriendRequest,
  listFriends,
  listIncomingPending,
  listOutgoingPending,
  rejectFriendRequest,
} from '../../../../services/friends';
import type { FriendsStateContract } from '../../friends-state.contract';

export function useFriendsStatePresenter(): FriendsStateContract {
  const [friends, setFriends] = useState<FriendsStateContract['state']['friends']>([]);
  const [incomingRequests, setIncomingRequests] = useState<
    FriendsStateContract['state']['incomingRequests']
  >([]);
  const [outgoingRequests, setOutgoingRequests] = useState<
    FriendsStateContract['state']['outgoingRequests']
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pendingRequestId, setPendingRequestId] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError('');
    setIsLoading(true);

    try {
      const [friendsResponse, incomingResponse, outgoingResponse] = await Promise.all([
        listFriends(),
        listIncomingPending(),
        listOutgoingPending(),
      ]);

      setFriends(friendsResponse.data);
      setIncomingRequests(incomingResponse.data);
      setOutgoingRequests(outgoingResponse.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load friendship data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const acceptRequest = useCallback(
    async (requestId: string) => {
      setActionError('');
      setPendingRequestId(requestId);

      try {
        await acceptFriendRequest(requestId);
        await refresh();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to accept request');
      } finally {
        setPendingRequestId(null);
      }
    },
    [refresh]
  );

  const rejectRequest = useCallback(
    async (requestId: string) => {
      setActionError('');
      setPendingRequestId(requestId);

      try {
        await rejectFriendRequest(requestId);
        await refresh();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Failed to reject request');
      } finally {
        setPendingRequestId(null);
      }
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    state: {
      friends,
      incomingRequests,
      outgoingRequests,
      isLoading,
      error,
      actionError,
      pendingRequestId,
    },
    actions: {
      refresh,
      acceptRequest,
      rejectRequest,
    },
  };
}
