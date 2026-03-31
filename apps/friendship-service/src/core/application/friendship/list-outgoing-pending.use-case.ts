import { Injectable } from "@nestjs/common";
import { FriendRequest } from "src/core/domain/friendship/friend-request.entity";
import { FriendRequestRepository } from "src/core/domain/friendship/friend-request.repository";

export interface ListOutgoingPendingInput {
  userId: string;
}

export interface ListOutgoingPendingOutput {
  data: FriendRequest[];
}

@Injectable()
export class ListOutgoingPendingUseCase {
  constructor(
    private readonly friendRequestRepository: FriendRequestRepository,
  ) {}

  async execute(
    input: ListOutgoingPendingInput,
  ): Promise<ListOutgoingPendingOutput> {
    const data = await this.friendRequestRepository.listByRequesterAndStatus(
      input.userId,
      "pending",
    );

    return { data };
  }
}
