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
import { AUTH_SERVICE } from 'src/auth/auth.client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AUTH_COMMANDS } from '@repo/contracts';
import { getCorrelationId } from '@repo/log-context';
import type { API, RPC } from '@repo/contracts';
import { firstValueFrom } from 'rxjs';
import { RegisterBodyDto } from './dto/register-body.dto';
import { LoginBodyDto } from './dto/login-body.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { ConfirmEmailVerificationBodyDto } from './dto/confirm-email-verification-body.dto';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  @Post()
  async createUser(
    @Body() user: RegisterBodyDto,
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
      username: rpcReply.username,
      email: rpcReply.email,
    };
  }

  @Post('login')
  async login(@Body() payload: LoginBodyDto): Promise<API.LoginResponse> {
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
      username: rpcReply.username,
      email: rpcReply.email,
      emailVerifiedAt: rpcReply.emailVerifiedAt,
    };
  }

  @Get(':userId/profile')
  @UseGuards(JwtAuthGuard)
  async getPublicProfile(
    @Param() params: UserIdParamDto,
  ): Promise<API.GetPublicProfileResponse> {
    const { userId } = params;

    this.logger.debug(
      'API Gateway: forwarding getPublicProfile to auth service',
      { userId },
    );

    const rpcRequest: RPC.GetProfileRequest = {
      userId,
      correlationId: getCorrelationId(),
    };

    const rpcReply = await firstValueFrom(
      this.authClient.send<RPC.GetProfileReply, RPC.GetProfileRequest>(
        { cmd: AUTH_COMMANDS.getProfile },
        rpcRequest,
      ),
    );

    return {
      id: rpcReply.id,
      name: rpcReply.name,
      username: rpcReply.username,
      emailVerifiedAt: rpcReply.emailVerifiedAt,
    };
  }

  /**
   * POST /users/email-verification/confirm
   * Public route — called when the user clicks the confirmation link.
   */
  @Post('email-verification/confirm')
  async confirmEmailVerification(
    @Body() body: ConfirmEmailVerificationBodyDto,
  ): Promise<API.ConfirmEmailVerificationResponse> {
    this.logger.debug('API Gateway: confirming email verification');

    const rpcRequest: RPC.ConfirmEmailVerificationRequest = {
      token: body.token,
      correlationId: getCorrelationId(),
    };

    const rpcReply = await firstValueFrom(
      this.authClient.send<
        RPC.ConfirmEmailVerificationReply,
        RPC.ConfirmEmailVerificationRequest
      >({ cmd: AUTH_COMMANDS.confirmEmailVerification }, rpcRequest),
    );

    return {
      status: rpcReply.status,
      emailVerifiedAt: rpcReply.emailVerifiedAt,
    };
  }

  /**
   * POST /users/email-verification/request
   * Protected route — authenticated user can request a new verification email.
   */
  @Post('email-verification/request')
  @UseGuards(JwtAuthGuard)
  async requestEmailVerification(
    @Request() req: { user: { userId: string } },
  ): Promise<API.RequestEmailVerificationResponse> {
    this.logger.debug(
      'API Gateway: requesting email verification resend',
      req.user,
    );

    const rpcRequest: RPC.RequestEmailVerificationRequest = {
      userId: req.user.userId,
      correlationId: getCorrelationId(),
    };

    await firstValueFrom(
      this.authClient.send<
        RPC.RequestEmailVerificationReply,
        RPC.RequestEmailVerificationRequest
      >({ cmd: AUTH_COMMANDS.requestEmailVerification }, rpcRequest),
    );

    return { message: 'Verification email sent. Please check your inbox.' };
  }
}
