import { Injectable } from '@nestjs/common';
import { User } from 'src/core/domain/user/user.entity';
import {
  UserRepository,
  CreateUserData,
} from 'src/core/domain/user/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: User[] = [];

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(createUserData: CreateUserData): Promise<User> {
    const user = new User({
      id: (this.users.length + 1).toString(),
      name: createUserData.name,
      email: createUserData.email,
      passwordHash: createUserData.passwordHash,
      createdAt: new Date(),
    });

    this.users.push(user);

    return user;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((item) => item.email === email);
    return user ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: string): Promise<User | null> {
    const user = this.users.find((item) => item.id === id);
    return user ?? null;
  }
}
