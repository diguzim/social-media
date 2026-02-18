import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RegisterUseCase } from 'src/core/application/authentication/register.use-case';
import { LoginUseCase } from 'src/core/application/authentication/login.use-case';
import { GetProfileUseCase } from 'src/core/application/authentication/get-profile.use-case';
import { AUTH_COMMANDS } from '@repo/contracts';
import type {
  RegisterRequest,
  RegisterReply,
  LoginRequest,
  LoginReply,
  GetProfileRequest,
  GetProfileReply,
} from '@repo/contracts';

@Controller()
export class AuthController {
  constructor(
    private registerUseCase: RegisterUseCase,
    private loginUseCase: LoginUseCase,
    private getProfileUseCase: GetProfileUseCase,
  ) {}

  @MessagePattern({ cmd: AUTH_COMMANDS.register })
  async handleRegister(request: RegisterRequest): Promise<RegisterReply> {
    console.log('Auth service: handling register command', request);

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
  async handleLogin(request: LoginRequest): Promise<LoginReply> {
    console.log('Auth service: handling login command', request);

    return this.loginUseCase.execute({
      email: request.email,
      password: request.password,
    });
  }

  @MessagePattern({ cmd: AUTH_COMMANDS.getProfile })
  async handleGetProfile(request: GetProfileRequest): Promise<GetProfileReply> {
    console.log('Auth service: handling getProfile command', request);

    return this.getProfileUseCase.execute({
      userId: request.userId,
    });
  }
}
