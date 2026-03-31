import { Injectable, NotFoundException } from "@nestjs/common";
import {
  CreateFriendRequestData,
  FriendRequestRepository,
} from "src/core/domain/friendship/friend-request.repository";
import {
  FriendRequest,
  FriendRequestStatus,
} from "src/core/domain/friendship/friend-request.entity";

@Injectable()
export class InMemoryFriendRequestRepository implements FriendRequestRepository {
  private requests: FriendRequest[] = this.seedRequests();

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(data: CreateFriendRequestData): Promise<FriendRequest> {
    const request = new FriendRequest({
      id: this.getNextId(),
      requesterId: data.requesterId,
      recipientId: data.recipientId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: null,
      respondedAt: null,
    });

    this.requests.push(request);
    return request;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: string): Promise<FriendRequest | null> {
    const request = this.requests.find((item) => item.id === id);
    return request ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async listBetweenUsers(
    userAId: string,
    userBId: string,
  ): Promise<FriendRequest[]> {
    return this.requests.filter(
      (item) =>
        (item.requesterId === userAId && item.recipientId === userBId) ||
        (item.requesterId === userBId && item.recipientId === userAId),
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async updateStatus(
    id: string,
    status: FriendRequestStatus,
    respondedAt: Date,
  ): Promise<FriendRequest> {
    const request = this.requests.find((item) => item.id === id);
    if (!request) {
      throw new NotFoundException("Friend request not found");
    }

    request.status = status;
    request.respondedAt = respondedAt;
    request.updatedAt = respondedAt;

    return request;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async listByRecipientAndStatus(
    recipientId: string,
    status: FriendRequestStatus,
  ): Promise<FriendRequest[]> {
    return this.requests.filter(
      (item) => item.recipientId === recipientId && item.status === status,
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async listByRequesterAndStatus(
    requesterId: string,
    status: FriendRequestStatus,
  ): Promise<FriendRequest[]> {
    return this.requests.filter(
      (item) => item.requesterId === requesterId && item.status === status,
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async listAcceptedByUser(userId: string): Promise<FriendRequest[]> {
    return this.requests.filter(
      (item) =>
        item.status === "accepted" &&
        (item.requesterId === userId || item.recipientId === userId),
    );
  }

  private getNextId(): string {
    const maxNumericId = this.requests.reduce((max, request) => {
      const parsed = Number.parseInt(request.id.replace("fr-", ""), 10);
      if (Number.isNaN(parsed)) {
        return max;
      }

      return Math.max(max, parsed);
    }, 0);

    return `fr-${maxNumericId + 1}`;
  }

  private seedRequests(): FriendRequest[] {
    const seedData: Array<{
      id: string;
      requesterId: string;
      recipientId: string;
      status: FriendRequestStatus;
      createdAt: Date;
      respondedAt?: Date;
    }> = [
      {
        id: "fr-1",
        requesterId: "1",
        recipientId: "2",
        status: "accepted",
        createdAt: new Date("2025-02-01T08:00:00.000Z"),
        respondedAt: new Date("2025-02-02T08:00:00.000Z"),
      },
      {
        id: "fr-2",
        requesterId: "3",
        recipientId: "1",
        status: "pending",
        createdAt: new Date("2025-02-03T08:00:00.000Z"),
      },
      {
        id: "fr-3",
        requesterId: "1",
        recipientId: "4",
        status: "pending",
        createdAt: new Date("2025-02-04T08:00:00.000Z"),
      },
      {
        id: "fr-4",
        requesterId: "2",
        recipientId: "3",
        status: "accepted",
        createdAt: new Date("2025-02-05T08:00:00.000Z"),
        respondedAt: new Date("2025-02-06T08:00:00.000Z"),
      },
      {
        id: "fr-5",
        requesterId: "5",
        recipientId: "2",
        status: "pending",
        createdAt: new Date("2025-02-07T08:00:00.000Z"),
      },
      {
        id: "fr-6",
        requesterId: "1",
        recipientId: "5",
        status: "rejected",
        createdAt: new Date("2025-02-08T08:00:00.000Z"),
        respondedAt: new Date("2025-02-09T08:00:00.000Z"),
      },
    ];

    return seedData.map(
      ({ respondedAt, ...item }) =>
        new FriendRequest({
          ...item,
          respondedAt: respondedAt ?? null,
          updatedAt: respondedAt ?? null,
        }),
    );
  }
}
