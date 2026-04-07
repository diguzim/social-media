import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from 'src/core/domain/user/user.repository';

export interface GetProfileByUsernameInput {
  username: string;
}

export interface GetProfileByUsernameOutput {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerifiedAt: string | null;
  gender: string | null;
  about: string | null;
}

@Injectable()
export class GetProfileByUsernameUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    input: GetProfileByUsernameInput,
  ): Promise<GetProfileByUsernameOutput> {
    const user = await this.userRepository.findByUsernameCanonical(
      input.username,
    );

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
      gender: user.gender,
      about: user.about,
    };
  }
}
