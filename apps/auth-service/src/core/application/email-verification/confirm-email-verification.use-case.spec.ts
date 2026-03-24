import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfirmEmailVerificationUseCase } from './confirm-email-verification.use-case';
import { UserRepository } from 'src/core/domain/user/user.repository';
import { EmailVerificationTokenRepository } from 'src/core/domain/user/email-verification-token.repository';
import { EmailVerificationToken } from 'src/core/domain/user/email-verification-token.entity';

describe('ConfirmEmailVerificationUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let tokenRepository: jest.Mocked<EmailVerificationTokenRepository>;
  let useCase: ConfirmEmailVerificationUseCase;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findByUsernameCanonical: jest.fn(),
      findById: jest.fn(),
      markEmailVerified: jest.fn(),
    };

    tokenRepository = {
      create: jest.fn(),
      findByTokenHash: jest.fn(),
      invalidateActiveTokensByUserId: jest.fn(),
      consume: jest.fn(),
    };

    useCase = new ConfirmEmailVerificationUseCase(
      userRepository,
      tokenRepository,
    );
  });

  it('marks an unverified user as verified with a valid token', async () => {
    const tokenEntity = new EmailVerificationToken({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hashed',
      createdAt: new Date('2026-03-10T00:00:00.000Z'),
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
    });

    const now = new Date('2026-03-15T12:00:00.000Z');

    tokenRepository.findByTokenHash.mockResolvedValue(tokenEntity);
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      name: 'John Doe',
      username: 'johndoe',
      usernameCanonical: 'johndoe',
      email: 'john@example.com',
      passwordHash: 'hash',
      createdAt: new Date('2026-03-10T00:00:00.000Z'),
      updatedAt: null,
      emailVerifiedAt: null,
    });
    tokenRepository.consume.mockResolvedValue({
      ...tokenEntity,
      consumedAt: now,
    } as EmailVerificationToken);
    userRepository.markEmailVerified.mockResolvedValue({
      id: 'user-1',
      name: 'John Doe',
      username: 'johndoe',
      usernameCanonical: 'johndoe',
      email: 'john@example.com',
      passwordHash: 'hash',
      createdAt: new Date('2026-03-10T00:00:00.000Z'),
      updatedAt: now,
      emailVerifiedAt: now,
    });

    const result = await useCase.execute({ token: 'raw-token' });

    expect(tokenRepository.consume.mock.calls).toHaveLength(1);
    expect(tokenRepository.consume.mock.calls[0]?.[0]).toBe('token-1');
    expect(tokenRepository.consume.mock.calls[0]?.[1]).toBeInstanceOf(Date);

    expect(userRepository.markEmailVerified.mock.calls).toHaveLength(1);
    expect(userRepository.markEmailVerified.mock.calls[0]?.[0]).toBe('user-1');
    expect(userRepository.markEmailVerified.mock.calls[0]?.[1]).toBeInstanceOf(
      Date,
    );
    expect(result).toEqual({ status: 'verified', emailVerifiedAt: now });
  });

  it('returns already_verified when user is already verified', async () => {
    const tokenEntity = new EmailVerificationToken({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hashed',
      createdAt: new Date('2026-03-10T00:00:00.000Z'),
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: null,
    });

    const verifiedAt = new Date('2026-03-14T12:00:00.000Z');
    tokenRepository.findByTokenHash.mockResolvedValue(tokenEntity);
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      name: 'John Doe',
      username: 'johndoe',
      usernameCanonical: 'johndoe',
      email: 'john@example.com',
      passwordHash: 'hash',
      createdAt: new Date('2026-03-10T00:00:00.000Z'),
      updatedAt: verifiedAt,
      emailVerifiedAt: verifiedAt,
    });

    const result = await useCase.execute({ token: 'raw-token' });

    expect(tokenRepository.consume.mock.calls).toHaveLength(0);
    expect(userRepository.markEmailVerified.mock.calls).toHaveLength(0);
    expect(result).toEqual({
      status: 'already_verified',
      emailVerifiedAt: verifiedAt,
    });
  });

  it('throws when token is already consumed and user is still unverified', async () => {
    const tokenEntity = new EmailVerificationToken({
      id: 'token-1',
      userId: 'user-1',
      tokenHash: 'hashed',
      createdAt: new Date('2026-03-10T00:00:00.000Z'),
      expiresAt: new Date(Date.now() + 60_000),
      consumedAt: new Date('2026-03-10T01:00:00.000Z'),
    });

    tokenRepository.findByTokenHash.mockResolvedValue(tokenEntity);
    userRepository.findById.mockResolvedValue({
      id: 'user-1',
      name: 'John Doe',
      username: 'johndoe',
      usernameCanonical: 'johndoe',
      email: 'john@example.com',
      passwordHash: 'hash',
      createdAt: new Date('2026-03-10T00:00:00.000Z'),
      updatedAt: null,
      emailVerifiedAt: null,
    });

    await expect(
      useCase.execute({ token: 'raw-token' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws NotFoundException when token does not exist', async () => {
    tokenRepository.findByTokenHash.mockResolvedValue(null);

    await expect(
      useCase.execute({ token: 'raw-token' }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
