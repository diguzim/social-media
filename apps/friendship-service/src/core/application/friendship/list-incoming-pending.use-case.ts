import { Injectable } from "@nestjs/common";
import { FriendRequest } from "src/core/domain/friendship/friend-request.entity";
import { FriendRequestRepository } from "src/core/domain/friendship/friend-request.repository";

export interface ListIncomingPendingInput {
  userId: string;
}

export interface ListIncomingPendingOutput {
  data: FriendRequest[];
}

@Injectable()
export class ListIncomingPendingUseCase {
  constructor(
    private readonly friendRequestRepository: FriendRequestRepository,
  ) {}

  async execute(
    input: ListIncomingPendingInput,
  ): Promise<ListIncomingPendingOutput> {
    const data = await this.friendRequestRepository.listByRecipientAndStatus(
      input.userId,
      "pending",
    );

    return { data };
  }
}
