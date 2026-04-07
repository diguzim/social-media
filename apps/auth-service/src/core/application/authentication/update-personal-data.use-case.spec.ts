import { BadRequestException } from '@nestjs/common';
import { UpdatePersonalDataUseCase } from './update-personal-data.use-case';
import { UserRepository } from 'src/core/domain/user/user.repository';

describe('UpdatePersonalDataUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findByUsernameCanonical: jest.fn(),
      findById: jest.fn(),
      updatePersonalData: jest.fn(),
      markEmailVerified: jest.fn(),
    };
  });

  it('updates name, gender and about', async () => {
    userRepository.updatePersonalData.mockResolvedValue({
      id: 'user-1',
      name: 'Alice Updated',
      username: 'alice',
      usernameCanonical: 'alice',
      email: 'alice@example.com',
      gender: 'female',
      about: 'Updated bio',
      passwordHash: 'hash',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-02T00:00:00Z'),
      emailVerifiedAt: null,
    });

    const useCase = new UpdatePersonalDataUseCase(userRepository);

    const result = await useCase.execute({
      userId: 'user-1',
      name: '  Alice Updated ',
      gender: 'female',
      about: ' Updated bio ',
    });

    expect(userRepository.updatePersonalData.mock.calls).toContainEqual([
      {
        userId: 'user-1',
        name: 'Alice Updated',
        gender: 'female',
        about: 'Updated bio',
      },
    ]);
    expect(result).toEqual({
      id: 'user-1',
      name: 'Alice Updated',
      username: 'alice',
      email: 'alice@example.com',
      emailVerifiedAt: null,
      gender: 'female',
      about: 'Updated bio',
    });
  });

  it('throws when name is blank', async () => {
    const useCase = new UpdatePersonalDataUseCase(userRepository);

    await expect(
      useCase.execute({
        userId: 'user-1',
        name: '   ',
        gender: 'male',
        about: 'bio',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws when about exceeds 2000 characters', async () => {
    const useCase = new UpdatePersonalDataUseCase(userRepository);

    await expect(
      useCase.execute({
        userId: 'user-1',
        name: 'Alice',
        gender: 'female',
        about: 'a'.repeat(2001),
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
