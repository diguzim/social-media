import { Body, Controller, Get, Inject, Post, Request, UseGuards } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE } from 'src/auth/auth.client';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AUTH_COMMANDS } from '@repo/contracts';
import type {
  RegisterRequest,
  RegisterReply,
  LoginRequest,
  LoginReply,
  GetProfileRequest,
  GetProfileReply,
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

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: { user: { userId: string } }) {
    console.log('API Gateway: forwarding getProfile to auth service', req.user);
    return this.authClient.send<GetProfileReply>(
      { cmd: AUTH_COMMANDS.getProfile },
      { userId: req.user.userId } as GetProfileRequest,
    );
  }
}
