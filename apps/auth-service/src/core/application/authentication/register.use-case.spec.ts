import bcrypt from 'bcrypt';
import { RegisterUseCase } from './register.use-case';
import { UserRepository } from 'src/core/domain/user/user.repository';
import { USER_EVENTS } from '@repo/events';
import { RabbitMqEventPublisher } from 'src/infra/events/rabbitmq-event.publisher';

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
}));

describe('RegisterUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;
  let eventPublisher: jest.Mocked<Pick<RabbitMqEventPublisher, 'publish'>>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    eventPublisher = {
      publish: jest.fn().mockResolvedValue(undefined),
    };
    jest.clearAllMocks();
  });

  it('should hash the password and create a user, then emit registration event', async () => {
    const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
    bcryptMock.hash.mockResolvedValue('hashed-password');

    const createdAtDate = new Date('2024-01-01T00:00:00Z');
    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@doe.com',
      passwordHash: 'hashed-password',
      createdAt: createdAtDate,
      updatedAt: null,
    });

    const useCase = new RegisterUseCase(
      userRepository,
      eventPublisher as RabbitMqEventPublisher,
    );

    const result = await useCase.execute({
      name: 'John Doe',
      email: 'john@doe.com',
      password: 'plain-password',
    });

    expect(userRepository.findByEmail).toHaveBeenCalledWith('john@doe.com');
    expect(bcryptMock.hash).toHaveBeenCalledWith('plain-password', 10);
    expect(userRepository.create).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@doe.com',
      passwordHash: 'hashed-password',
    });
    expect(eventPublisher.publish).toHaveBeenCalledWith(
      USER_EVENTS.REGISTERED,
      {
        userId: 'user-1',
        name: 'John Doe',
        email: 'john@doe.com',
        createdAt: createdAtDate.toISOString(),
      },
    );
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
    });

    const useCase = new RegisterUseCase(
      userRepository,
      eventPublisher as RabbitMqEventPublisher,
    );

    await expect(
      useCase.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'plain-password',
      }),
    ).rejects.toThrow('Email already registered');

    expect(userRepository.create).not.toHaveBeenCalled();
    expect(eventPublisher.publish).not.toHaveBeenCalled();
  });

  it('should propagate repository errors during creation', async () => {
    const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
    bcryptMock.hash.mockResolvedValue('hashed-password');

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockRejectedValue(new Error('db failure'));

    const useCase = new RegisterUseCase(
      userRepository,
      eventPublisher as RabbitMqEventPublisher,
    );

    await expect(
      useCase.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'plain-password',
      }),
    ).rejects.toThrow('db failure');

    expect(eventPublisher.publish).not.toHaveBeenCalled();
  });
});
