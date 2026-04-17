import { Injectable } from '@nestjs/common';
import bcrypt from 'bcrypt';
import { User } from 'src/core/domain/user/user.entity';
import {
  UserRepository,
  CreateUserData,
  UpdatePersonalDataInput,
} from 'src/core/domain/user/user.repository';

@Injectable()
export class InMemoryUserRepository implements UserRepository {
  private users: User[] = this.seedUsers();

  // eslint-disable-next-line @typescript-eslint/require-await
  async create(createUserData: CreateUserData): Promise<User> {
    const user = new User({
      id: (this.users.length + 1).toString(),
      name: createUserData.name,
      username: createUserData.username,
      usernameCanonical: createUserData.usernameCanonical,
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
  async findByUsernameCanonical(
    usernameCanonical: string,
  ): Promise<User | null> {
    const user = this.users.find(
      (item) => item.usernameCanonical === usernameCanonical,
    );
    return user ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async findById(id: string): Promise<User | null> {
    const user = this.users.find((item) => item.id === id);
    return user ?? null;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async updatePersonalData(input: UpdatePersonalDataInput): Promise<User> {
    const user = this.users.find((item) => item.id === input.userId);
    if (!user) {
      throw new Error(`User with id ${input.userId} not found`);
    }

    user.name = input.name;
    user.gender = input.gender;
    user.about = input.about;
    user.updatedAt = new Date();

    return user;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async markEmailVerified(userId: string, verifiedAt: Date): Promise<User> {
    const user = this.users.find((item) => item.id === userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    user.emailVerifiedAt = verifiedAt;
    user.updatedAt = verifiedAt;
    return user;
  }

  private seedUsers(): User[] {
    const salt = 10;
    // Hash "password" for all users
    const hashedPassword = bcrypt.hashSync('password', salt);

    const seedData = [
      {
        id: '1',
        name: 'Alice Johnson',
        username: 'alice',
        usernameCanonical: 'alice',
        email: 'rodrigomarcondes2000@gmail.com',
        gender: 'female',
        about: 'Loves sharing travel moments and coffee photos.',
        passwordHash: hashedPassword,
        createdAt: new Date('2025-01-01'),
        // Intentionally left unverified so the verification email flow can be tested
        emailVerifiedAt: null,
      },
      {
        id: '2',
        name: 'Bob Smith',
        username: 'bob',
        usernameCanonical: 'bob',
        email: 'bob@example.com',
        gender: 'male',
        about: 'Backend enthusiast and weekend trail runner.',
        passwordHash: hashedPassword,
        createdAt: new Date('2025-01-02'),
        emailVerifiedAt: new Date('2025-01-02'),
      },
      {
        id: '3',
        name: 'Charlie Brown',
        username: 'charlie',
        usernameCanonical: 'charlie',
        email: 'charlie@example.com',
        gender: 'non_binary',
        about: null,
        passwordHash: hashedPassword,
        createdAt: new Date('2025-01-03'),
        emailVerifiedAt: new Date('2025-01-03'),
      },
      {
        id: '4',
        name: 'Diana Prince',
        username: 'diana',
        usernameCanonical: 'diana',
        email: 'diana@example.com',
        gender: 'female',
        about: 'Product designer focused on accessible interfaces.',
        passwordHash: hashedPassword,
        createdAt: new Date('2025-01-04'),
        emailVerifiedAt: new Date('2025-01-04'),
      },
      {
        id: '5',
        name: 'Eve Wilson',
        username: 'eve',
        usernameCanonical: 'eve',
        email: 'eve@example.com',
        gender: 'prefer_not_to_say',
        about: 'Enjoys writing, reading, and community events.',
        passwordHash: hashedPassword,
        createdAt: new Date('2025-01-05'),
        emailVerifiedAt: new Date('2025-01-05'),
      },
    ];

    return seedData.map((data) => new User(data));
  }
}
