import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from 'src/auth/auth.client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AUTH_COMMANDS } from '@repo/contracts';
import { getCorrelationId } from '@repo/log-context';
import type { API, RPC } from '@repo/contracts';
import { firstValueFrom } from 'rxjs';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  @Post()
  async createUser(
    @Body() user: API.RegisterRequest,
  ): Promise<API.RegisterResponse> {
    this.logger.debug(
      'API Gateway: forwarding user registration to auth service',
      user,
    );

    // Transform API request to RPC request
    const rpcRequest: RPC.RegisterRequest = {
      ...user,
      correlationId: getCorrelationId(),
    };

    // Call microservice
    const rpcReply = await firstValueFrom(
      this.authClient.send<RPC.RegisterReply, RPC.RegisterRequest>(
        { cmd: AUTH_COMMANDS.register },
        rpcRequest,
      ),
    );

    // Transform RPC reply to API response
    return {
      id: rpcReply.id,
      name: user.name,
      email: rpcReply.email,
    };
  }

  @Post('login')
  async login(@Body() payload: API.LoginRequest): Promise<API.LoginResponse> {
    this.logger.debug('API Gateway: forwarding login to auth service', payload);

    // Transform API request to RPC request
    const rpcRequest: RPC.LoginRequest = {
      ...payload,
      correlationId: getCorrelationId(),
    };

    // Call microservice
    const rpcReply = await firstValueFrom(
      this.authClient.send<RPC.LoginReply, RPC.LoginRequest>(
        { cmd: AUTH_COMMANDS.login },
        rpcRequest,
      ),
    );

    // Transform RPC reply to API response
    return {
      id: rpcReply.id,
      email: rpcReply.email,
      accessToken: rpcReply.accessToken,
    };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getProfile(
    @Request() req: { user: { userId: string } },
  ): Promise<API.GetProfileResponse> {
    this.logger.debug(
      'API Gateway: forwarding getProfile to auth service',
      req.user,
    );

    // Create RPC request
    const rpcRequest: RPC.GetProfileRequest = {
      userId: req.user.userId,
      correlationId: getCorrelationId(),
    };

    // Call microservice
    const rpcReply = await firstValueFrom(
      this.authClient.send<RPC.GetProfileReply, RPC.GetProfileRequest>(
        { cmd: AUTH_COMMANDS.getProfile },
        rpcRequest,
      ),
    );

    // Transform RPC reply to API response
    return {
      id: rpcReply.id,
      name: rpcReply.name,
      email: rpcReply.email,
    };
  }
}
