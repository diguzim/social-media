import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from 'src/auth/auth.client';
import { AUTH_COMMANDS } from '@repo/contracts';
import type { RegisterMessage } from '@repo/contracts';

@Controller('users')
export class UsersController {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  @Post()
  createUser(@Body() user: RegisterMessage) {
    console.log('Creating user via API Gateway:', user);
    return this.authClient.send({ cmd: AUTH_COMMANDS.register }, user);
  }
}
