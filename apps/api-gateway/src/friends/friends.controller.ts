import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { AUTH_COMMANDS, IMAGE_COMMANDS } from '@repo/contracts';
import { FRIENDS_COMMANDS } from '@repo/contracts/rpc';
import type { API, RPC } from '@repo/contracts';
import { getCorrelationId } from '@repo/log-context';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FRIENDSHIP_SERVICE } from './friends.client';
import { AUTH_SERVICE } from 'src/auth/auth.client';
import { IMAGE_SERVICE } from 'src/images/image.client';
import { SendFriendRequestBodyDto } from './dto/send-friend-request-body.dto';
import { RequestIdParamDto } from './dto/request-id-param.dto';
import { UsernameParamDto } from './dto/username-param.dto';

const GET_PROFILE_BY_USERNAME_CMD = 'auth.getProfileByUsername';

@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  private readonly logger = new Logger(FriendsController.name);

  constructor(
    @Inject(FRIENDSHIP_SERVICE)
    private readonly friendshipClient: ClientProxy,
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(IMAGE_SERVICE) private readonly imageClient: ClientProxy,
  ) {}

  @Post('requests')
  async sendFriendRequest(
    @Body() body: SendFriendRequestBodyDto,
    @Request() req: { user: { userId: string } },
  ): Promise<API.SendFriendRequestResponse> {
    this.logger.debug('API Gateway: forwarding sendFriendRequest', body);

    const targetProfile = await firstValueFrom(
      this.authClient.send<
        RPC.GetProfileByUsernameReply,
        RPC.GetProfileByUsernameRequest
      >(
        { cmd: GET_PROFILE_BY_USERNAME_CMD },
        {
          username: body.targetUsername,
          correlationId: getCorrelationId(),
        },
      ),
    );

    const rpcReply = await firstValueFrom(
      this.friendshipClient.send<
        RPC.SendFriendRequestReply,
        RPC.SendFriendRequestRequest
      >(
        { cmd: FRIENDS_COMMANDS.sendFriendRequest },
        {
          requesterId: req.user.userId,
          targetUserId: targetProfile.id,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      request: await this.mapRequestItem(rpcReply.request),
    };
  }

  @Post('requests/:requestId/accept')
  async acceptFriendRequest(
    @Param() params: RequestIdParamDto,
    @Request() req: { user: { userId: string } },
  ): Promise<API.RespondFriendRequestResponse> {
    const rpcReply = await firstValueFrom(
      this.friendshipClient.send<
        RPC.AcceptFriendRequestReply,
        RPC.AcceptFriendRequestRequest
      >(
        { cmd: FRIENDS_COMMANDS.acceptFriendRequest },
        {
          requestId: params.requestId,
          actorUserId: req.user.userId,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      request: await this.mapRequestItem(rpcReply.request),
    };
  }

  @Post('requests/:requestId/reject')
  async rejectFriendRequest(
    @Param() params: RequestIdParamDto,
    @Request() req: { user: { userId: string } },
  ): Promise<API.RespondFriendRequestResponse> {
    const rpcReply = await firstValueFrom(
      this.friendshipClient.send<
        RPC.RejectFriendRequestReply,
        RPC.RejectFriendRequestRequest
      >(
        { cmd: FRIENDS_COMMANDS.rejectFriendRequest },
        {
          requestId: params.requestId,
          actorUserId: req.user.userId,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      request: await this.mapRequestItem(rpcReply.request),
    };
  }

  @Get()
  async listFriends(
    @Request() req: { user: { userId: string } },
  ): Promise<API.ListFriendsResponse> {
    const rpcReply = await firstValueFrom(
      this.friendshipClient.send<RPC.ListFriendsReply, RPC.ListFriendsRequest>(
        { cmd: FRIENDS_COMMANDS.listFriends },
        {
          userId: req.user.userId,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      data: await Promise.all(
        rpcReply.friendUserIds.map((userId) => this.getUserSummary(userId)),
      ),
    };
  }

  @Get('requests/incoming')
  async listIncomingPending(
    @Request() req: { user: { userId: string } },
  ): Promise<API.ListFriendRequestsResponse> {
    const rpcReply = await firstValueFrom(
      this.friendshipClient.send<
        RPC.ListIncomingPendingReply,
        RPC.ListIncomingPendingRequest
      >(
        { cmd: FRIENDS_COMMANDS.listIncomingPending },
        {
          userId: req.user.userId,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      data: await Promise.all(
        rpcReply.data.map((item) => this.mapRequestItem(item)),
      ),
    };
  }

  @Get('requests/outgoing')
  async listOutgoingPending(
    @Request() req: { user: { userId: string } },
  ): Promise<API.ListFriendRequestsResponse> {
    const rpcReply = await firstValueFrom(
      this.friendshipClient.send<
        RPC.ListOutgoingPendingReply,
        RPC.ListOutgoingPendingRequest
      >(
        { cmd: FRIENDS_COMMANDS.listOutgoingPending },
        {
          userId: req.user.userId,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      data: await Promise.all(
        rpcReply.data.map((item) => this.mapRequestItem(item)),
      ),
    };
  }

  @Get('status/:username')
  async getFriendshipStatus(
    @Param() params: UsernameParamDto,
    @Request() req: { user: { userId: string } },
  ): Promise<API.GetFriendshipStatusResponse> {
    const targetProfile = await firstValueFrom(
      this.authClient.send<
        RPC.GetProfileByUsernameReply,
        RPC.GetProfileByUsernameRequest
      >(
        { cmd: GET_PROFILE_BY_USERNAME_CMD },
        {
          username: params.username,
          correlationId: getCorrelationId(),
        },
      ),
    );

    const rpcReply = await firstValueFrom(
      this.friendshipClient.send<
        RPC.GetFriendshipStatusReply,
        RPC.GetFriendshipStatusRequest
      >(
        { cmd: FRIENDS_COMMANDS.getFriendshipStatus },
        {
          userId: req.user.userId,
          targetUserId: targetProfile.id,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      status: rpcReply.status,
    };
  }

  @Get('count/:username')
  async getFriendCount(
    @Param() params: UsernameParamDto,
  ): Promise<API.GetFriendCountResponse> {
    const targetProfile = await firstValueFrom(
      this.authClient.send<
        RPC.GetProfileByUsernameReply,
        RPC.GetProfileByUsernameRequest
      >(
        { cmd: GET_PROFILE_BY_USERNAME_CMD },
        {
          username: params.username,
          correlationId: getCorrelationId(),
        },
      ),
    );

    const rpcReply = await firstValueFrom(
      this.friendshipClient.send<RPC.ListFriendsReply, RPC.ListFriendsRequest>(
        { cmd: FRIENDS_COMMANDS.listFriends },
        {
          userId: targetProfile.id,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      count: rpcReply.friendUserIds.length,
    };
  }

  private async mapRequestItem(
    request: RPC.RpcFriendRequestItem,
  ): Promise<API.FriendRequestItem> {
    const [requester, recipient] = await Promise.all([
      this.getUserSummary(request.requesterId),
      this.getUserSummary(request.recipientId),
    ]);

    return {
      id: request.id,
      requester,
      recipient,
      status: request.status,
      createdAt: request.createdAt,
      respondedAt: request.respondedAt,
    };
  }

  private async getUserSummary(userId: string): Promise<API.FriendUserSummary> {
    const rpcReply = await firstValueFrom(
      this.authClient.send<RPC.GetProfileReply, RPC.GetProfileRequest>(
        { cmd: AUTH_COMMANDS.getProfile },
        {
          userId,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      id: rpcReply.id,
      name: rpcReply.name,
      username: rpcReply.username,
      avatarUrl: await this.tryBuildAvatarUrl(rpcReply.id),
    };
  }

  private async tryBuildAvatarUrl(userId: string): Promise<string | undefined> {
    const rpcRequest: RPC.GetProfileImageRequest = {
      userId,
      correlationId: getCorrelationId(),
    };

    try {
      await firstValueFrom(
        this.imageClient.send<
          RPC.GetProfileImageReply,
          RPC.GetProfileImageRequest
        >({ cmd: IMAGE_COMMANDS.getProfileImage }, rpcRequest),
      );

      const baseUrl =
        process.env.API_PUBLIC_BASE_URL ??
        `http://localhost:${process.env.PORT ?? '4000'}`;

      return `${baseUrl}/users/${userId}/avatar`;
    } catch {
      return undefined;
    }
  }
}
