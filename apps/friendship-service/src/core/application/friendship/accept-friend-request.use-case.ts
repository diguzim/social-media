import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { FriendRequest } from "src/core/domain/friendship/friend-request.entity";
import { FriendRequestRepository } from "src/core/domain/friendship/friend-request.repository";

export interface AcceptFriendRequestInput {
  requestId: string;
  actorUserId: string;
}

export interface AcceptFriendRequestOutput {
  request: FriendRequest;
}

@Injectable()
export class AcceptFriendRequestUseCase {
  constructor(
    private readonly friendRequestRepository: FriendRequestRepository,
  ) {}

  async execute(
    input: AcceptFriendRequestInput,
  ): Promise<AcceptFriendRequestOutput> {
    const request = await this.friendRequestRepository.findById(
      input.requestId,
    );
    if (!request || request.status !== "pending") {
      throw new NotFoundException("Pending friend request not found");
    }

    if (request.recipientId !== input.actorUserId) {
      throw new ForbiddenException(
        "Only the recipient can accept this request",
      );
    }

    const updated = await this.friendRequestRepository.updateStatus(
      request.id,
      "accepted",
      new Date(),
    );

    return { request: updated };
  }
}
