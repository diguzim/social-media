import {
  BadRequestException,
  ConflictException,
  Injectable,
} from "@nestjs/common";
import { FriendRequestRepository } from "src/core/domain/friendship/friend-request.repository";
import { FriendRequest } from "src/core/domain/friendship/friend-request.entity";

export interface SendFriendRequestInput {
  requesterId: string;
  targetUserId: string;
}

export interface SendFriendRequestOutput {
  request: FriendRequest;
}

@Injectable()
export class SendFriendRequestUseCase {
  constructor(
    private readonly friendRequestRepository: FriendRequestRepository,
  ) {}

  async execute(
    input: SendFriendRequestInput,
  ): Promise<SendFriendRequestOutput> {
    if (input.requesterId === input.targetUserId) {
      throw new BadRequestException(
        "You cannot send a friend request to yourself",
      );
    }

    const betweenUsers = await this.friendRequestRepository.listBetweenUsers(
      input.requesterId,
      input.targetUserId,
    );

    const hasPending = betweenUsers.some((item) => item.status === "pending");
    if (hasPending) {
      throw new ConflictException("A pending friend request already exists");
    }

    const hasAccepted = betweenUsers.some((item) => item.status === "accepted");
    if (hasAccepted) {
      throw new ConflictException("Users are already friends");
    }

    const created = await this.friendRequestRepository.create({
      requesterId: input.requesterId,
      recipientId: input.targetUserId,
    });

    return { request: created };
  }
}
