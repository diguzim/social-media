import { FriendRequest, FriendRequestStatus } from "./friend-request.entity";

export interface CreateFriendRequestData {
  requesterId: string;
  recipientId: string;
}

export abstract class FriendRequestRepository {
  abstract create(data: CreateFriendRequestData): Promise<FriendRequest>;
  abstract findById(id: string): Promise<FriendRequest | null>;
  abstract listBetweenUsers(
    userAId: string,
    userBId: string,
  ): Promise<FriendRequest[]>;
  abstract updateStatus(
    id: string,
    status: FriendRequestStatus,
    respondedAt: Date,
  ): Promise<FriendRequest>;
  abstract listByRecipientAndStatus(
    recipientId: string,
    status: FriendRequestStatus,
  ): Promise<FriendRequest[]>;
  abstract listByRequesterAndStatus(
    requesterId: string,
    status: FriendRequestStatus,
  ): Promise<FriendRequest[]>;
  abstract listAcceptedByUser(userId: string): Promise<FriendRequest[]>;
}
