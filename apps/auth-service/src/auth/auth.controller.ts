import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RegisterUseCase } from 'src/core/application/authentication/register.use-case';
import { AUTH_COMMANDS } from '@repo/contracts';
import type { RegisterRequest, RegisterReply } from '@repo/contracts';

@Controller()
export class AuthController {
  constructor(private registerUseCase: RegisterUseCase) {}

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
}
