import { User } from 'src/core/domain/user/user.entity';

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

export class RegisterUserUseCase {
  async execute(input: RegisterUserInput): Promise<RegisterUserOutput> {
    const user = new User();

    user.id = crypto.randomUUID();
    user.name = input.name;
    user.email = input.email;
    user.passwordHash = `hashed-${input.password}`;
    user.createdAt = new Date();
    user.updatedAt = new Date();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
