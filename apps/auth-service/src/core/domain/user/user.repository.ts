import { User } from './user.entity';

export abstract class UserRepository {
  abstract create(item: User): Promise<User>;
}
