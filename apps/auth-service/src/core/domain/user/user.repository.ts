import { User } from './user.entity';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export abstract class UserRepository {
  abstract create(createUserData: CreateUserData): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
}
