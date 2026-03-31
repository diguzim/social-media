export type FriendRequestStatus = "pending" | "accepted" | "rejected";

export class FriendRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  status: FriendRequestStatus;
  createdAt: Date;
  updatedAt: Date | null;
  respondedAt: Date | null;

  constructor(props: Partial<FriendRequest>) {
    this.id = props.id ?? "";
    this.requesterId = props.requesterId ?? "";
    this.recipientId = props.recipientId ?? "";
    this.status = props.status ?? "pending";
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? null;
    this.respondedAt = props.respondedAt ?? null;
  }
}
