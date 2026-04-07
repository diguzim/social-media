export type FriendshipStatus =
  | "none"
  | "pending_outgoing"
  | "pending_incoming"
  | "friends";

export interface FriendUserSummary {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

export interface FriendRequestItem {
  id: string;
  requester: FriendUserSummary;
  recipient: FriendUserSummary;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  respondedAt: string | null;
}

export interface SendFriendRequestBody {
  targetUsername: string;
}

export interface SendFriendRequestResponse {
  request: FriendRequestItem;
}

export interface RespondFriendRequestResponse {
  request: FriendRequestItem;
}

export interface ListFriendRequestsResponse {
  data: FriendRequestItem[];
}

export interface ListFriendsResponse {
  data: FriendUserSummary[];
}

export interface GetFriendshipStatusResponse {
  status: FriendshipStatus;
}

export interface GetFriendCountResponse {
  count: number;
}
