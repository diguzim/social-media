import { Controller, Logger } from "@nestjs/common";
import { MessagePattern } from "@nestjs/microservices";
import { RPC } from "@repo/contracts";
import { SendFriendRequestUseCase } from "src/core/application/friendship/send-friend-request.use-case";
import { AcceptFriendRequestUseCase } from "src/core/application/friendship/accept-friend-request.use-case";
import { RejectFriendRequestUseCase } from "src/core/application/friendship/reject-friend-request.use-case";
import { ListFriendsUseCase } from "src/core/application/friendship/list-friends.use-case";
import { ListIncomingPendingUseCase } from "src/core/application/friendship/list-incoming-pending.use-case";
import { ListOutgoingPendingUseCase } from "src/core/application/friendship/list-outgoing-pending.use-case";
import { GetFriendshipStatusUseCase } from "src/core/application/friendship/get-friendship-status.use-case";

const { FRIENDS_COMMANDS } = RPC;

@Controller()
export class FriendshipController {
  private readonly logger = new Logger(FriendshipController.name);

  constructor(
    private readonly sendFriendRequestUseCase: SendFriendRequestUseCase,
    private readonly acceptFriendRequestUseCase: AcceptFriendRequestUseCase,
    private readonly rejectFriendRequestUseCase: RejectFriendRequestUseCase,
    private readonly listFriendsUseCase: ListFriendsUseCase,
    private readonly listIncomingPendingUseCase: ListIncomingPendingUseCase,
    private readonly listOutgoingPendingUseCase: ListOutgoingPendingUseCase,
    private readonly getFriendshipStatusUseCase: GetFriendshipStatusUseCase,
  ) {}

  @MessagePattern({ cmd: FRIENDS_COMMANDS.sendFriendRequest })
  async handleSendFriendRequest(
    request: RPC.SendFriendRequestRequest,
  ): Promise<RPC.SendFriendRequestReply> {
    this.logger.debug(
      "Friendship service: handling sendFriendRequest",
      request,
    );

    const result = await this.sendFriendRequestUseCase.execute({
      requesterId: request.requesterId,
      targetUserId: request.targetUserId,
    });

    return {
      request: {
        id: result.request.id,
        requesterId: result.request.requesterId,
        recipientId: result.request.recipientId,
        status: result.request.status,
        createdAt: result.request.createdAt.toISOString(),
        respondedAt: result.request.respondedAt?.toISOString() ?? null,
      },
    };
  }

  @MessagePattern({ cmd: FRIENDS_COMMANDS.acceptFriendRequest })
  async handleAcceptFriendRequest(
    request: RPC.AcceptFriendRequestRequest,
  ): Promise<RPC.AcceptFriendRequestReply> {
    this.logger.debug(
      "Friendship service: handling acceptFriendRequest",
      request,
    );

    const result = await this.acceptFriendRequestUseCase.execute({
      requestId: request.requestId,
      actorUserId: request.actorUserId,
    });

    return {
      request: {
        id: result.request.id,
        requesterId: result.request.requesterId,
        recipientId: result.request.recipientId,
        status: result.request.status,
        createdAt: result.request.createdAt.toISOString(),
        respondedAt: result.request.respondedAt?.toISOString() ?? null,
      },
    };
  }

  @MessagePattern({ cmd: FRIENDS_COMMANDS.rejectFriendRequest })
  async handleRejectFriendRequest(
    request: RPC.RejectFriendRequestRequest,
  ): Promise<RPC.RejectFriendRequestReply> {
    this.logger.debug(
      "Friendship service: handling rejectFriendRequest",
      request,
    );

    const result = await this.rejectFriendRequestUseCase.execute({
      requestId: request.requestId,
      actorUserId: request.actorUserId,
    });

    return {
      request: {
        id: result.request.id,
        requesterId: result.request.requesterId,
        recipientId: result.request.recipientId,
        status: result.request.status,
        createdAt: result.request.createdAt.toISOString(),
        respondedAt: result.request.respondedAt?.toISOString() ?? null,
      },
    };
  }

  @MessagePattern({ cmd: FRIENDS_COMMANDS.listFriends })
  async handleListFriends(
    request: RPC.ListFriendsRequest,
  ): Promise<RPC.ListFriendsReply> {
    this.logger.debug("Friendship service: handling listFriends", request);

    return this.listFriendsUseCase.execute({
      userId: request.userId,
    });
  }

  @MessagePattern({ cmd: FRIENDS_COMMANDS.listIncomingPending })
  async handleListIncomingPending(
    request: RPC.ListIncomingPendingRequest,
  ): Promise<RPC.ListIncomingPendingReply> {
    this.logger.debug(
      "Friendship service: handling listIncomingPending",
      request,
    );

    const result = await this.listIncomingPendingUseCase.execute({
      userId: request.userId,
    });

    return {
      data: result.data.map((item) => ({
        id: item.id,
        requesterId: item.requesterId,
        recipientId: item.recipientId,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        respondedAt: item.respondedAt?.toISOString() ?? null,
      })),
    };
  }

  @MessagePattern({ cmd: FRIENDS_COMMANDS.listOutgoingPending })
  async handleListOutgoingPending(
    request: RPC.ListOutgoingPendingRequest,
  ): Promise<RPC.ListOutgoingPendingReply> {
    this.logger.debug(
      "Friendship service: handling listOutgoingPending",
      request,
    );

    const result = await this.listOutgoingPendingUseCase.execute({
      userId: request.userId,
    });

    return {
      data: result.data.map((item) => ({
        id: item.id,
        requesterId: item.requesterId,
        recipientId: item.recipientId,
        status: item.status,
        createdAt: item.createdAt.toISOString(),
        respondedAt: item.respondedAt?.toISOString() ?? null,
      })),
    };
  }

  @MessagePattern({ cmd: FRIENDS_COMMANDS.getFriendshipStatus })
  async handleGetFriendshipStatus(
    request: RPC.GetFriendshipStatusRequest,
  ): Promise<RPC.GetFriendshipStatusReply> {
    this.logger.debug(
      "Friendship service: handling getFriendshipStatus",
      request,
    );

    return this.getFriendshipStatusUseCase.execute({
      userId: request.userId,
      targetUserId: request.targetUserId,
    });
  }
}
