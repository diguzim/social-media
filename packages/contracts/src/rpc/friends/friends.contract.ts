export type RpcFriendshipStatus =
  | "none"
  | "pending_outgoing"
  | "pending_incoming"
  | "friends";

export interface RpcFriendRequestItem {
  id: string;
  requesterId: string;
  recipientId: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  respondedAt: string | null;
}

export interface SendFriendRequestRequest {
  requesterId: string;
  targetUserId: string;
  correlationId?: string;
}

export interface SendFriendRequestReply {
  request: RpcFriendRequestItem;
}

export interface AcceptFriendRequestRequest {
  requestId: string;
  actorUserId: string;
  correlationId?: string;
}

export interface AcceptFriendRequestReply {
  request: RpcFriendRequestItem;
}

export interface RejectFriendRequestRequest {
  requestId: string;
  actorUserId: string;
  correlationId?: string;
}

export interface RejectFriendRequestReply {
  request: RpcFriendRequestItem;
}

export interface ListFriendsRequest {
  userId: string;
  correlationId?: string;
}

export interface ListFriendsReply {
  friendUserIds: string[];
}

export interface ListIncomingPendingRequest {
  userId: string;
  correlationId?: string;
}

export interface ListIncomingPendingReply {
  data: RpcFriendRequestItem[];
}

export interface ListOutgoingPendingRequest {
  userId: string;
  correlationId?: string;
}

export interface ListOutgoingPendingReply {
  data: RpcFriendRequestItem[];
}

export interface GetFriendshipStatusRequest {
  userId: string;
  targetUserId: string;
  correlationId?: string;
}

export interface GetFriendshipStatusReply {
  status: RpcFriendshipStatus;
}
