import type { FriendRequestItem, FriendUserSummary } from '@repo/contracts/api';

export interface FriendsState {
  friends: FriendUserSummary[];
  incomingRequests: FriendRequestItem[];
  outgoingRequests: FriendRequestItem[];
  isLoading: boolean;
  error: string;
  actionError: string;
  pendingRequestId: string | null;
}

export interface FriendsStateActions {
  refresh: () => Promise<void>;
  acceptRequest: (requestId: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
}

export interface FriendsStateContract {
  state: FriendsState;
  actions: FriendsStateActions;
}

export type UseFriendsStateContract = () => FriendsStateContract;
