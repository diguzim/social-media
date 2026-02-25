import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { User } from 'src/core/domain/user/user.entity';
import {
  UserRepository,
  CreateUserData,
} from 'src/core/domain/user/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: User[] = this.seedUsers();

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

  private seedUsers(): User[] {
    const salt = 10;
    // Hash "password" for all users
    const hashedPassword = bcrypt.hashSync('password', salt);

    const seedData = [
      {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        passwordHash: hashedPassword,
        createdAt: new Date('2025-01-01'),
      },
      {
        id: '2',
        name: 'Bob Smith',
        email: 'bob@example.com',
        passwordHash: hashedPassword,
        createdAt: new Date('2025-01-02'),
      },
      {
        id: '3',
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        passwordHash: hashedPassword,
        createdAt: new Date('2025-01-03'),
      },
      {
        id: '4',
        name: 'Diana Prince',
        email: 'diana@example.com',
        passwordHash: hashedPassword,
        createdAt: new Date('2025-01-04'),
      },
      {
        id: '5',
        name: 'Eve Wilson',
        email: 'eve@example.com',
        passwordHash: hashedPassword,
        createdAt: new Date('2025-01-05'),
      },
    ];

    return seedData.map((data) => new User(data));
  }
}
