import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RegisterUseCase } from 'src/core/application/authentication/register.use-case';
import { LoginUseCase } from 'src/core/application/authentication/login.use-case';
import { GetProfileUseCase } from 'src/core/application/authentication/get-profile.use-case';
import { CreateEmailVerificationTokenUseCase } from 'src/core/application/email-verification/create-email-verification-token.use-case';
import { ConfirmEmailVerificationUseCase } from 'src/core/application/email-verification/confirm-email-verification.use-case';
import { RequestEmailVerificationUseCase } from 'src/core/application/email-verification/request-email-verification.use-case';
import { AUTH_COMMANDS, RPC } from '@repo/contracts';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private getProfileUseCase: GetProfileUseCase,
    private createEmailVerificationTokenUseCase: CreateEmailVerificationTokenUseCase,
    private confirmEmailVerificationUseCase: ConfirmEmailVerificationUseCase,
    private requestEmailVerificationUseCase: RequestEmailVerificationUseCase,
  ) {}

  @MessagePattern({ cmd: AUTH_COMMANDS.register })
  async handleRegister(
    request: RPC.RegisterRequest,
  ): Promise<RPC.RegisterReply> {
    this.logger.debug('Auth service: handling register command', request);

    const createdUser = await this.registerUseCase.execute({
      name: request.name,
      email: request.email,
      password: request.password,
    });

    return {
      id: createdUser.id,
      email: createdUser.email,
    };
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.login })
  async handleLogin(request: RPC.LoginRequest): Promise<RPC.LoginReply> {
    this.logger.debug('Auth service: handling login command', request);

    return this.loginUseCase.execute({
      email: request.email,
      password: request.password,
    });
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.getProfile })
  async handleGetProfile(
    request: RPC.GetProfileRequest,
  ): Promise<RPC.GetProfileReply> {
    this.logger.debug('Auth service: handling getProfile command', request);

    const result = await this.getProfileUseCase.execute({
      userId: request.userId,
    });

    return {
      id: result.id,
      name: result.name,
      email: result.email,
      emailVerifiedAt: result.emailVerifiedAt,
    };
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.createEmailVerificationToken })
  async handleCreateEmailVerificationToken(
    request: RPC.CreateEmailVerificationTokenRequest,
  ): Promise<RPC.CreateEmailVerificationTokenReply> {
    this.logger.debug(
      'Auth service: handling createEmailVerificationToken command',
      request,
    );

    const result = await this.createEmailVerificationTokenUseCase.execute({
      userId: request.userId,
    });

    return {
      verificationToken: result.verificationToken,
      expiresAt: result.expiresAt.toISOString(),
    };
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.confirmEmailVerification })
  async handleConfirmEmailVerification(
    request: RPC.ConfirmEmailVerificationRequest,
  ): Promise<RPC.ConfirmEmailVerificationReply> {
    this.logger.debug(
      'Auth service: handling confirmEmailVerification command',
      request,
    );

    const result = await this.confirmEmailVerificationUseCase.execute({
      token: request.token,
    });

    return {
      status: result.status,
      emailVerifiedAt: result.emailVerifiedAt.toISOString(),
    };
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.requestEmailVerification })
  async handleRequestEmailVerification(
    request: RPC.RequestEmailVerificationRequest,
  ): Promise<RPC.RequestEmailVerificationReply> {
    this.logger.debug(
      'Auth service: handling requestEmailVerification command',
      request,
    );

    return this.requestEmailVerificationUseCase.execute({
      userId: request.userId,
    });
  }
}
