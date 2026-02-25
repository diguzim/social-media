import { User } from './user.entity';

describe('User Entity', () => {
  describe('constructor', () => {
    it('should create a User instance with all properties', () => {
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
      expect(user.id).toBe('user-123');
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@doe.com');
      expect(user.passwordHash).toBe('hashed-password');
      expect(user.createdAt).toEqual(new Date('2024-01-01T00:00:00Z'));
      expect(user.updatedAt).toEqual(new Date('2024-01-02T00:00:00Z'));
    });

    it('should use default values when properties are undefined', () => {
      const user = new User({
        id: 'user-456',
        email: 'jane@doe.com',
      });

      expect(user.id).toBe('user-456');
      expect(user.email).toBe('jane@doe.com');
      expect(user.name).toBe('');
      expect(user.passwordHash).toBe('');
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeNull();
    });

    it('should create with partial properties', () => {
      const user = new User({
        id: 'user-789',
        name: 'Alice',
        email: 'alice@example.com',
        passwordHash: 'hash123',
      });

      expect(user.id).toBe('user-789');
      expect(user.name).toBe('Alice');
      expect(user.email).toBe('alice@example.com');
      expect(user.passwordHash).toBe('hash123');
      expect(user.updatedAt).toBeNull();
    });
  });

  describe('properties', () => {
    it('should allow property assignment after creation', () => {
      const user = new User({ id: 'user-1', email: 'test@test.com' });

      user.name = 'Updated Name';
      user.passwordHash = 'new-hash';

      expect(user.name).toBe('Updated Name');
      expect(user.passwordHash).toBe('new-hash');
    });

    it('should maintain type safety for dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');

      const user = new User({
        id: 'user-1',
        email: 'test@test.com',
        createdAt: date1,
        updatedAt: date2,
      });

      expect(user.createdAt).toEqual(date1);
      expect(user.updatedAt).toEqual(date2);
      expect(user.createdAt).not.toBe(user.updatedAt);
    });
  });
});
