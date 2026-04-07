import { BadRequestException, Injectable } from '@nestjs/common';
import type { RPC } from '@repo/contracts';
import { UserRepository } from 'src/core/domain/user/user.repository';

export interface UpdatePersonalDataInput {
  userId: string;
  name: string;
  gender: RPC.RpcProfileGender;
  about: string;
}

export interface UpdatePersonalDataOutput {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerifiedAt: string | null;
  gender: RPC.RpcProfileGender | null;
  about: string | null;
}

@Injectable()
export class UpdatePersonalDataUseCase {
  private static readonly ABOUT_MAX_LENGTH = 2000;

  constructor(private readonly userRepository: UserRepository) {}

  async execute(
    input: UpdatePersonalDataInput,
  ): Promise<UpdatePersonalDataOutput> {
    const normalizedName = input.name.trim();
    const normalizedAbout = input.about.trim();

    if (!normalizedName) {
      throw new BadRequestException('Name is required');
    }

    if (normalizedAbout.length > UpdatePersonalDataUseCase.ABOUT_MAX_LENGTH) {
      throw new BadRequestException('About must be 2000 characters or fewer');
    }

    const updatedUser = await this.userRepository.updatePersonalData({
      userId: input.userId,
      name: normalizedName,
      gender: input.gender,
      about: normalizedAbout || null,
    });

    return {
      id: updatedUser.id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      emailVerifiedAt: updatedUser.emailVerifiedAt?.toISOString() ?? null,
      gender: (updatedUser.gender as RPC.RpcProfileGender | null) ?? null,
      about: updatedUser.about,
    };
  }
}
