import bcrypt from 'bcrypt';
import { RegisterUseCase } from './register.use-case';
import { UserRepository } from 'src/core/domain/user/user.repository';

jest.mock('bcrypt', () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
}));

describe('RegisterUseCase', () => {
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    userRepository = {
      create: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };
    jest.clearAllMocks();
  });

  it('should hash the password and create a user', async () => {
    const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
    bcryptMock.hash.mockResolvedValue('hashed-password');

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockResolvedValue({
      id: 'user-1',
      name: 'John Doe',
      email: 'john@doe.com',
      passwordHash: 'hashed-password',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: null,
    });

    const useCase = new RegisterUseCase(userRepository);

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

    const useCase = new RegisterUseCase(userRepository);

    await expect(
      useCase.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'plain-password',
      }),
    ).rejects.toThrow('Email already registered');

    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('should propagate repository errors during creation', async () => {
    const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;
    bcryptMock.hash.mockResolvedValue('hashed-password');

    userRepository.findByEmail.mockResolvedValue(null);
    userRepository.create.mockRejectedValue(new Error('db failure'));

    const useCase = new RegisterUseCase(userRepository);

    await expect(
      useCase.execute({
        name: 'John Doe',
        email: 'john@doe.com',
        password: 'plain-password',
      }),
    ).rejects.toThrow('db failure');
  });
});
