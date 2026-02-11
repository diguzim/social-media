import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from 'src/auth/auth.client';
import { AUTH_COMMANDS } from '@repo/contracts';
import type {
  RegisterRequest,
  RegisterReply,
  LoginRequest,
  LoginReply,
} from '@repo/contracts';

@Controller('users')
export class UsersController {
  constructor(@Inject(AUTH_SERVICE) private readonly authClient: ClientProxy) {}

  @Post()
  createUser(@Body() user: RegisterRequest) {
    console.log(
      'API Gateway: forwarding user registration to auth service',
      user,
    );
    return this.authClient.send<RegisterReply>(
      { cmd: AUTH_COMMANDS.register },
      user,
    );
  }

  @Post('login')
  login(@Body() payload: LoginRequest) {
    console.log('API Gateway: forwarding login to auth service', payload);
    return this.authClient.send<LoginReply>(
      { cmd: AUTH_COMMANDS.login },
      payload,
    );
  }
}
