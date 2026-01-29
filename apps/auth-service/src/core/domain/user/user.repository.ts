import { User } from './user.entity';

export interface CreateUserData {
  name: string;
  email: string;
  passwordHash: string;
}

export abstract class UserRepository {
  abstract create(createUserData: CreateUserData): Promise<User>;
}
