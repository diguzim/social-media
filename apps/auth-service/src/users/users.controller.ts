import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { RegisterUseCase } from 'src/core/application/authentication/register.use-case';
import type {
  RegisterInput,
  RegisterOutput,
} from 'src/core/application/authentication/register.use-case';

@Controller()
export class UsersController {
  constructor(private registerUseCase: RegisterUseCase) {}

  @MessagePattern({ cmd: 'create_user' })
  async createUser(input: RegisterInput): Promise<RegisterOutput> {
    console.log('Creating user in microservice:', input);

    const createdUser = await this.registerUseCase.execute({
      name: input.name,
      email: input.email,
      password: input.password,
    });

    return createdUser;
  }
}
