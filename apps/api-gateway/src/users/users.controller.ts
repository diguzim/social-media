import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from 'src/auth/auth.client';

@Controller('users')
export class UsersController {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  @Post()
  createUser(@Body() user: any) {
    console.log('Creating user via API Gateway:', user);
    return this.authClient.send({ cmd: 'create_user' }, user);
  }
}
