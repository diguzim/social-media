import { Controller, Logger } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RegisterUseCase } from 'src/core/application/authentication/register.use-case';
import { LoginUseCase } from 'src/core/application/authentication/login.use-case';
import { GetProfileUseCase } from 'src/core/application/authentication/get-profile.use-case';
import { AUTH_COMMANDS, RPC } from '@repo/contracts';

@Controller()
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private getProfileUseCase: GetProfileUseCase,
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

    return this.getProfileUseCase.execute({
      userId: request.userId,
    });
  }
}
