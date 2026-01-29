import { UserRepository } from 'src/core/domain/user/user.repository';
import { hash } from 'bcrypt';
import { Injectable } from '@nestjs/common';

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

interface RegisterUserOutput {
  id: string;
  name: string;
  email: string;
}

@Injectable()
export class RegisterUserUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const saltRounds = 10;
    const hashedPassword = await hash(input.password, saltRounds);
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
