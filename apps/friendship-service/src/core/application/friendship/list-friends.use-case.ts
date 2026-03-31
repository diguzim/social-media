import { Injectable } from "@nestjs/common";
import { FriendRequestRepository } from "src/core/domain/friendship/friend-request.repository";

export interface ListFriendsInput {
  userId: string;
}

export interface ListFriendsOutput {
  friendUserIds: string[];
}

@Injectable()
export class ListFriendsUseCase {
  constructor(
    private readonly friendRequestRepository: FriendRequestRepository,
  ) {}

  async execute(input: ListFriendsInput): Promise<ListFriendsOutput> {
    const accepted = await this.friendRequestRepository.listAcceptedByUser(
      input.userId,
    );

    const friendIds = accepted.map((item) =>
      item.requesterId === input.userId ? item.recipientId : item.requesterId,
    );

    return {
      friendUserIds: [...new Set(friendIds)],
    };
  }
}
