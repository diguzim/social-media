import { User } from './user.entity';

describe('User Entity', () => {
  it('should create a User instance with given properties', () => {
    const userProps = {
      id: 'user-123',
      name: 'John Doe',
      email: 'john@doe.com',
      passwordHash: 'hashed-password',
      createdAt: new Date('2024-01-01T00:00:00Z'),
      updatedAt: new Date('2024-01-02T00:00:00Z'),
    };

    const user = new User(userProps);
    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe(userProps.id);
    expect(user.name).toBe(userProps.name);
    expect(user.email).toBe(userProps.email);
    expect(user.passwordHash).toBe(userProps.passwordHash);
    expect(user.createdAt).toBe(userProps.createdAt);
    expect(user.updatedAt).toBe(userProps.updatedAt);
  });
});
