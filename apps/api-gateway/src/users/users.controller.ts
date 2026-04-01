import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Patch,
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
import { UsernameParamDto } from './dto/username-param.dto';
import { ConfirmEmailVerificationBodyDto } from './dto/confirm-email-verification-body.dto';
import { CreateUserAlbumBodyDto } from './dto/create-user-album-body.dto';
import { UpdateUserAlbumBodyDto } from './dto/update-user-album-body.dto';
import { UpdateUserPhotoBodyDto } from './dto/update-user-photo-body.dto';
import { AlbumIdParamDto } from './dto/album-id-param.dto';
import { PhotoIdParamDto } from './dto/photo-id-param.dto';
import { IMAGE_SERVICE } from 'src/images/image.client';
import type { Express, Response } from 'express';

const GET_PROFILE_BY_USERNAME_CMD = 'auth.getProfileByUsername';

@Controller('users')
export class UsersController {
  private readonly logger = new Logger(UsersController.name);
  private static readonly MAX_IMAGE_BYTES = 2 * 1024 * 1024;
  private static readonly ALLOWED_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
  ]);
  private static readonly MAX_USER_PHOTO_BYTES = 10 * 1024 * 1024;
  private static readonly ALLOWED_USER_PHOTO_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/gif',
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

  @Get(':username/profile')
  @UseGuards(JwtAuthGuard)
  async getPublicProfile(
    @Param() params: UsernameParamDto,
  ): Promise<API.GetPublicProfileResponse> {
    const { username } = params;

    this.logger.debug(
      'API Gateway: forwarding getPublicProfile to auth service',
      { username },
    );

    const rpcRequest: RPC.GetProfileByUsernameRequest = {
      username,
      correlationId: getCorrelationId(),
    };

    const rpcReply = await firstValueFrom(
      this.authClient.send<
        RPC.GetProfileByUsernameReply,
        RPC.GetProfileByUsernameRequest
      >({ cmd: GET_PROFILE_BY_USERNAME_CMD }, rpcRequest),
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

  @Get(':username/photos')
  @UseGuards(JwtAuthGuard)
  async getUserPhotos(
    @Param() params: UsernameParamDto,
  ): Promise<API.GetUserPhotosResponse> {
    const profile = await firstValueFrom(
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
      this.imageClient.send<RPC.ListUserPhotosReply, RPC.ListUserPhotosRequest>(
        { cmd: IMAGE_COMMANDS.listUserPhotos },
        {
          ownerUserId: profile.id,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      albums: rpcReply.albums.map((album) => ({
        id: album.id,
        name: album.name,
        description: album.description,
        createdAt: album.createdAt,
        updatedAt: album.updatedAt,
        photos: album.photos.map((photo) =>
          this.mapUserPhotoItem(profile.id, photo),
        ),
      })),
      unsortedPhotos: rpcReply.unsortedPhotos.map((photo) =>
        this.mapUserPhotoItem(profile.id, photo),
      ),
    };
  }

  @Post('me/albums')
  @UseGuards(JwtAuthGuard)
  async createUserAlbum(
    @Body() body: CreateUserAlbumBodyDto,
    @Request() req: { user: { userId: string } },
  ): Promise<API.CreateUserAlbumResponse> {
    const rpcReply = await firstValueFrom(
      this.imageClient.send<
        RPC.CreateUserAlbumReply,
        RPC.CreateUserAlbumRequest
      >(
        { cmd: IMAGE_COMMANDS.createUserAlbum },
        {
          ownerUserId: req.user.userId,
          name: body.name,
          description: body.description,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      album: {
        id: rpcReply.album.id,
        name: rpcReply.album.name,
        description: rpcReply.album.description,
        createdAt: rpcReply.album.createdAt,
        updatedAt: rpcReply.album.updatedAt,
        photos: [],
      },
    };
  }

  @Patch('me/albums/:albumId')
  @UseGuards(JwtAuthGuard)
  async updateUserAlbum(
    @Param() params: AlbumIdParamDto,
    @Body() body: UpdateUserAlbumBodyDto,
    @Request() req: { user: { userId: string } },
  ): Promise<API.UpdateUserAlbumResponse> {
    const rpcReply = await firstValueFrom(
      this.imageClient.send<
        RPC.UpdateUserAlbumReply,
        RPC.UpdateUserAlbumRequest
      >(
        { cmd: IMAGE_COMMANDS.updateUserAlbum },
        {
          ownerUserId: req.user.userId,
          albumId: params.albumId,
          name: body.name,
          description: body.description,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      album: {
        id: rpcReply.album.id,
        name: rpcReply.album.name,
        description: rpcReply.album.description,
        createdAt: rpcReply.album.createdAt,
        updatedAt: rpcReply.album.updatedAt,
        photos: [],
      },
    };
  }

  @Delete('me/albums/:albumId')
  @UseGuards(JwtAuthGuard)
  async deleteUserAlbum(
    @Param() params: AlbumIdParamDto,
    @Request() req: { user: { userId: string } },
  ): Promise<API.DeleteUserAlbumResponse> {
    await firstValueFrom(
      this.imageClient.send<
        RPC.DeleteUserAlbumReply,
        RPC.DeleteUserAlbumRequest
      >(
        { cmd: IMAGE_COMMANDS.deleteUserAlbum },
        {
          ownerUserId: req.user.userId,
          albumId: params.albumId,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return { success: true };
  }

  @Post('me/photos')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserPhoto(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body() body: { albumId?: string; description?: string },
    @Request() req: { user: { userId: string } },
  ): Promise<API.UploadUserPhotoResponse> {
    if (!file) {
      throw new BadRequestException('Image file is required');
    }

    if (!UsersController.ALLOWED_USER_PHOTO_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Only JPG, PNG and GIF images are allowed');
    }

    if (file.size > UsersController.MAX_USER_PHOTO_BYTES) {
      throw new BadRequestException('Image must be 10MB or smaller');
    }

    const rpcReply = await firstValueFrom(
      this.imageClient.send<
        RPC.UploadUserPhotoReply,
        RPC.UploadUserPhotoRequest
      >(
        { cmd: IMAGE_COMMANDS.uploadUserPhoto },
        {
          ownerUserId: req.user.userId,
          albumId: body.albumId || null,
          description: body.description,
          fileBase64: file.buffer.toString('base64'),
          mimeType: file.mimetype,
          originalName: file.originalname,
          fileSize: file.size,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      photo: this.mapUserPhotoItem(req.user.userId, rpcReply.photo),
    };
  }

  @Patch('me/photos/:photoId')
  @UseGuards(JwtAuthGuard)
  async updateUserPhoto(
    @Param() params: PhotoIdParamDto,
    @Body() body: UpdateUserPhotoBodyDto,
    @Request() req: { user: { userId: string } },
  ): Promise<API.UpdateUserPhotoResponse> {
    const rpcReply = await firstValueFrom(
      this.imageClient.send<
        RPC.UpdateUserPhotoReply,
        RPC.UpdateUserPhotoRequest
      >(
        { cmd: IMAGE_COMMANDS.updateUserPhoto },
        {
          ownerUserId: req.user.userId,
          photoId: params.photoId,
          albumId: body.albumId,
          description: body.description,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return {
      photo: this.mapUserPhotoItem(req.user.userId, rpcReply.photo),
    };
  }

  @Delete('me/photos/:photoId')
  @UseGuards(JwtAuthGuard)
  async deleteUserPhoto(
    @Param() params: PhotoIdParamDto,
    @Request() req: { user: { userId: string } },
  ): Promise<API.DeleteUserPhotoResponse> {
    await firstValueFrom(
      this.imageClient.send<
        RPC.DeleteUserPhotoReply,
        RPC.DeleteUserPhotoRequest
      >(
        { cmd: IMAGE_COMMANDS.deleteUserPhoto },
        {
          ownerUserId: req.user.userId,
          photoId: params.photoId,
          correlationId: getCorrelationId(),
        },
      ),
    );

    return { success: true };
  }

  @Get(':userId/photos/:photoId')
  async getUserPhoto(
    @Param('userId') userId: string,
    @Param('photoId') photoId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    let rpcReply: RPC.GetUserPhotoReply;

    try {
      rpcReply = await firstValueFrom(
        this.imageClient.send<RPC.GetUserPhotoReply, RPC.GetUserPhotoRequest>(
          { cmd: IMAGE_COMMANDS.getUserPhoto },
          {
            ownerUserId: userId,
            photoId,
            correlationId: getCorrelationId(),
          },
        ),
      );
    } catch {
      throw new NotFoundException('Photo not found');
    }

    const fileBuffer = Buffer.from(rpcReply.fileBase64, 'base64');
    if (fileBuffer.length === 0) {
      throw new NotFoundException('Photo not found');
    }

    res.setHeader('Content-Type', rpcReply.mimeType);
    res.setHeader('Content-Length', String(rpcReply.contentLength));
    res.setHeader('Cache-Control', 'public, max-age=60');

    return new StreamableFile(fileBuffer);
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

    const fileBuffer = Buffer.from(rpcReply.fileBase64, 'base64');
    if (fileBuffer.length === 0) {
      throw new NotFoundException('Profile image not found');
    }

    res.setHeader('Content-Type', rpcReply.mimeType);
    res.setHeader('Content-Length', String(rpcReply.contentLength));
    res.setHeader('Cache-Control', 'public, max-age=60');

    return new StreamableFile(fileBuffer);
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

  private buildUserPhotoUrl(userId: string, photoId: string): string {
    const baseUrl =
      process.env.API_PUBLIC_BASE_URL ??
      `http://localhost:${process.env.PORT ?? '4000'}`;

    return `${baseUrl}/users/${userId}/photos/${photoId}`;
  }

  private mapUserPhotoItem(
    ownerUserId: string,
    photo: RPC.RpcUserPhotoItem,
  ): API.UserPhotoItem {
    return {
      id: photo.id,
      imageUrl: this.buildUserPhotoUrl(ownerUserId, photo.id),
      mimeType: photo.mimeType,
      description: photo.description,
      albumId: photo.albumId,
      uploadedAt: photo.uploadedAt,
    };
  }
}
