import { User } from './user.entity';

export interface CreateUserData {
  name: string;
  username: string;
  usernameCanonical: string;
  email: string;
  passwordHash: string;
}

export interface UpdatePersonalDataInput {
  userId: string;
  name: string;
  gender: string;
  about: string | null;
}

export abstract class UserRepository {
  abstract create(createUserData: CreateUserData): Promise<User>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract findByUsernameCanonical(
    usernameCanonical: string,
  ): Promise<User | null>;
  abstract findById(id: string): Promise<User | null>;
  abstract updatePersonalData(input: UpdatePersonalDataInput): Promise<User>;
  abstract markEmailVerified(userId: string, verifiedAt: Date): Promise<User>;
}
