import { Injectable } from "@nestjs/common";
import { FriendRequestRepository } from "src/core/domain/friendship/friend-request.repository";

export interface GetFriendshipStatusInput {
  userId: string;
  targetUserId: string;
}

export interface GetFriendshipStatusOutput {
  status: "none" | "pending_outgoing" | "pending_incoming" | "friends";
}

@Injectable()
export class GetFriendshipStatusUseCase {
  constructor(
    private readonly friendRequestRepository: FriendRequestRepository,
  ) {}

  async execute(
    input: GetFriendshipStatusInput,
  ): Promise<GetFriendshipStatusOutput> {
    if (input.userId === input.targetUserId) {
      return { status: "none" };
    }

    const betweenUsers = await this.friendRequestRepository.listBetweenUsers(
      input.userId,
      input.targetUserId,
    );

    if (betweenUsers.length === 0) {
      return { status: "none" };
    }

    const latest = betweenUsers.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )[0];

    if (!latest) {
      return { status: "none" };
    }

    if (latest.status === "accepted") {
      return { status: "friends" };
    }

    if (latest.status === "pending") {
      return {
        status:
          latest.requesterId === input.userId
            ? "pending_outgoing"
            : "pending_incoming",
      };
    }

    return { status: "none" };
  }
}
