import { UserRepository } from 'src/core/domain/user/user.repository';
import bcrypt from 'bcrypt';
import { Injectable } from '@nestjs/common';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface RegisterOutput {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const salt = 10;
    const hashedPassword = await bcrypt.hash(input.password, salt);
    const createUserData = {
      name: input.name,
      email: input.email,
      passwordHash: hashedPassword,
    };

    const user = await this.userRepository.create(createUserData);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
