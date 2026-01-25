import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class UsersController {
  @MessagePattern({ cmd: 'create_user' })
  async createUser(user: any) {
    console.log('Creating user in microservice:', user);
    // Logic to create a user
    return { status: 'User created', user };
  }
}
