import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  Request,
  Res,
  StreamableFile,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from 'src/auth/auth.client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AUTH_COMMANDS, IMAGE_COMMANDS } from '@repo/contracts';
import { getCorrelationId } from '@repo/log-context';
import type { API, RPC } from '@repo/contracts';
import { firstValueFrom } from 'rxjs';
import { RegisterBodyDto } from './dto/register-body.dto';
import { LoginBodyDto } from './dto/login-body.dto';
import { UserIdParamDto } from './dto/user-id-param.dto';
import { ConfirmEmailVerificationBodyDto } from './dto/confirm-email-verification-body.dto';
import { IMAGE_SERVICE } from 'src/images/image.client';
import { createReadStream, existsSync } from 'fs';
import type { Express, Response } from 'express';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  private static readonly MAX_IMAGE_BYTES = 2 * 1024 * 1024;
  private static readonly ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
  ]);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
    @Inject(IMAGE_SERVICE) private readonly imageClient: ClientProxy,
  ) {}

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

    const avatarUrl = await this.tryBuildAvatarUrl(rpcReply.id);

    // Transform RPC reply to API response
    return {
      id: rpcReply.id,
      name: rpcReply.name,
      username: rpcReply.username,
      email: rpcReply.email,
      emailVerifiedAt: rpcReply.emailVerifiedAt,
      avatarUrl,
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

    const avatarUrl = await this.tryBuildAvatarUrl(rpcReply.id);

    return {
      id: rpcReply.id,
      name: rpcReply.name,
      username: rpcReply.username,
      emailVerifiedAt: rpcReply.emailVerifiedAt,
      avatarUrl,
    };
  }

  @Post('avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadProfileImage(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Request() req: { user: { userId: string } },
  ): Promise<API.UploadProfileImageResponse> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!UsersController.ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Only JPG and PNG images are allowed');
    }

    if (file.size > UsersController.MAX_IMAGE_BYTES) {
      throw new BadRequestException('Image must be 2MB or smaller');
    }

    const rpcRequest: RPC.UploadProfileImageRequest = {
      userId: req.user.userId,
      fileBase64: file.buffer.toString('base64'),
      mimeType: file.mimetype,
      originalName: file.originalname,
      fileSize: file.size,
      correlationId: getCorrelationId(),
    };

    const rpcReply = await firstValueFrom(
      this.imageClient.send<
        RPC.UploadProfileImageReply,
        RPC.UploadProfileImageRequest
      >({ cmd: IMAGE_COMMANDS.uploadProfileImage }, rpcRequest),
    );

    return {
      imageUrl: this.buildAvatarUrl(req.user.userId),
      uploadedAt: rpcReply.uploadedAt,
    };
  }

  @Get(':userId/avatar')
  async getProfileImage(
    @Param() params: UserIdParamDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const rpcRequest: RPC.GetProfileImageRequest = {
      userId: params.userId,
      correlationId: getCorrelationId(),
    };

    let rpcReply: RPC.GetProfileImageReply;

    try {
      rpcReply = await firstValueFrom(
        this.imageClient.send<
          RPC.GetProfileImageReply,
          RPC.GetProfileImageRequest
        >({ cmd: IMAGE_COMMANDS.getProfileImage }, rpcRequest),
      );
    } catch {
      throw new NotFoundException('Profile image not found');
    }

    if (!existsSync(rpcReply.storagePath)) {
      throw new NotFoundException('Profile image not found');
    }

    res.setHeader('Content-Type', rpcReply.mimeType);
    res.setHeader('Cache-Control', 'public, max-age=60');

    return new StreamableFile(createReadStream(rpcReply.storagePath));
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

      return this.buildAvatarUrl(userId);
    } catch {
      return undefined;
    }
  }

  private buildAvatarUrl(userId: string): string {
    const baseUrl =
      process.env.API_PUBLIC_BASE_URL ??
      `http://localhost:${process.env.PORT ?? '4000'}`;

    return `${baseUrl}/users/${userId}/avatar`;
  }
}
