import bcrypt from 'bcrypt';
import { RegisterUseCase } from './register.use-case';
import { UserRepository } from 'src/core/domain/user/user.repository';
import { USER_EVENTS } from '@repo/events';
import { RabbitMqEventPublisher } from 'src/infra/events/rabbitmq-event.publisher';
import { CreateEmailVerificationTokenUseCase } from '../email-verification/create-email-verification-token.use-case';

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
}));

describe('RegisterUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let eventPublisher: jest.Mocked<Pick<RabbitMqEventPublisher, 'publish'>>;
  let createEmailVerificationTokenUseCase: jest.Mocked<CreateEmailVerificationTokenUseCase>;

  const tokenExpiresAt = new Date('2024-01-02T00:00:00Z');

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      markEmailVerified: jest.fn(),
    };
    eventPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };
    createEmailVerificationTokenUseCase = {
      execute: jest.fn().mockResolvedValue({
        verificationToken: 'raw-token',
        expiresAt: tokenExpiresAt,
      }),
    } as unknown as jest.Mocked<CreateEmailVerificationTokenUseCase>;
    jest.clearAllMocks();
  });

  it('should hash the password and create a user, then emit registration event', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const createdAtDate = new Date('2024-01-01T00:00:00Z');
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@doe.com',
      passwordHash: 'hashed-password',
      createdAt: createdAtDate,
      updatedAt: null,
      emailVerifiedAt: null,
    });
    createEmailVerificationTokenUseCase.execute.mockResolvedValue({
      verificationToken: 'raw-token',
      expiresAt: tokenExpiresAt,
    });

    const useCase = new RegisterUseCase(
      userRepository,
      eventPublisher as unknown as RabbitMqEventPublisher,
      createEmailVerificationTokenUseCase,
    );

    const result = await useCase.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'plain-password',
    });

    expect(userRepository.findByEmail.mock.calls).toContainEqual([
      'john@doe.com',
    ]);
    expect((bcrypt.hash as jest.Mock).mock.calls).toContainEqual([
      'plain-password',
      10,
    ]);
    expect(userRepository.create.mock.calls).toContainEqual([
      {
        name: 'John Doe',
        email: 'john@doe.com',
        passwordHash: 'hashed-password',
      },
    ]);
    expect(
      createEmailVerificationTokenUseCase.execute.mock.calls,
    ).toContainEqual([
      {
        userId: 'user-1',
      },
    ]);
    expect(eventPublisher.publish.mock.calls).toContainEqual([
      USER_EVENTS.REGISTERED,
      {
        userId: 'user-1',
        name: 'John Doe',
        email: 'john@doe.com',
        createdAt: createdAtDate.toISOString(),
        verificationToken: 'raw-token',
        tokenExpiresAt: tokenExpiresAt.toISOString(),
      },
    ]);
    expect(result).toEqual({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@doe.com',
    });
  });

  it('should throw ConflictException if email already exists', async () => {
    userRepository.findByEmail.mockResolvedValue({
      id: 'user-existing',
      name: 'Existing User',
      email: 'john@doe.com',
      passwordHash: 'existing-hash',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: null,
      emailVerifiedAt: null,
    });

    const useCase = new RegisterUseCase(
      userRepository,
      eventPublisher as unknown as RabbitMqEventPublisher,
      createEmailVerificationTokenUseCase,
    );

    await expect(
      useCase.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'plain-password',
      }),
    ).rejects.toThrow('Email already registered');

    expect(userRepository.create.mock.calls).toHaveLength(0);
    expect(eventPublisher.publish.mock.calls).toHaveLength(0);
  });

  it('should propagate repository errors during creation', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockRejectedValue(new Error('db failure'));

    const useCase = new RegisterUseCase(
      userRepository,
      eventPublisher as unknown as RabbitMqEventPublisher,
      createEmailVerificationTokenUseCase,
    );

    await expect(
      useCase.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'plain-password',
      }),
    ).rejects.toThrow('db failure');

    expect(eventPublisher.publish.mock.calls).toHaveLength(0);
  });
});
