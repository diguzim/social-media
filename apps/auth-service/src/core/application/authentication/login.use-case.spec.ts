import bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUseCase } from './login.use-case';
import { UserRepository } from 'src/core/domain/user/user.repository';

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    compare: jest.fn(),
  },
}));

describe('LoginUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      markEmailVerified: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(),
    } as unknown as jest.Mocked<JwtService>;
  });

  it('should return access token for valid credentials', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      name: 'Jane Doe',
      email: 'jane@doe.com',
      passwordHash: 'hashed-password',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: null,
      emailVerifiedAt: null,
    });

    jwtService.signAsync.mockResolvedValue('access-token');

    const useCase = new LoginUseCase(userRepository, jwtService);

    const result = await useCase.execute({
      email: 'jane@doe.com',
      password: 'plain-password',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('jane@doe.com');
    expect(bcrypt.compare).toHaveBeenCalledWith(
      'plain-password',
      'hashed-password',
    );
    expect(jwtService.signAsync).toHaveBeenCalledWith({
      sub: 'user-1',
      email: 'jane@doe.com',
    });
    expect(result).toEqual({
      id: 'user-1',
      email: 'jane@doe.com',
      accessToken: 'access-token',
    });
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    userRepository.findByEmail.mockResolvedValue(null);

    const useCase = new LoginUseCase(userRepository, jwtService);

    await expect(
      useCase.execute({
        email: 'missing@user.com',
        password: 'plain-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password does not match', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      name: 'Jane Doe',
      email: 'jane@doe.com',
      passwordHash: 'hashed-password',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: null,
      emailVerifiedAt: null,
    });

    const useCase = new LoginUseCase(userRepository, jwtService);

    await expect(
      useCase.execute({
        email: 'jane@doe.com',
        password: 'wrong-password',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('should propagate jwt signing errors', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    userRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      name: 'Jane Doe',
      email: 'jane@doe.com',
      passwordHash: 'hashed-password',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: null,
      emailVerifiedAt: null,
    });

    jwtService.signAsync.mockRejectedValue(new Error('jwt error'));

    const useCase = new LoginUseCase(userRepository, jwtService);

    await expect(
      useCase.execute({
        email: 'jane@doe.com',
        password: 'plain-password',
      }),
    ).rejects.toThrow('jwt error');
  });
});
