import { NotFoundException } from '@nestjs/common';
import { GetProfileUseCase } from './get-profile.use-case';
import { UserRepository } from 'src/core/domain/user/user.repository';

describe('GetProfileUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
  });

  it('should return user profile when user exists', async () => {
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@doe.com',
      passwordHash: 'hashed-password',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: null,
    });

    const useCase = new GetProfileUseCase(userRepository);

    const result = await useCase.execute({ userId: 'user-1' });

    expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@doe.com',
    });
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findById.mockResolvedValue(null);

    const useCase = new GetProfileUseCase(userRepository);

    await expect(
      useCase.execute({ userId: 'missing-id' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('should propagate repository errors', async () => {
    userRepository.findById.mockRejectedValue(new Error('db failure'));

    const useCase = new GetProfileUseCase(userRepository);

    await expect(useCase.execute({ userId: 'user-1' })).rejects.toThrow(
      'db failure',
    );
  });
});
