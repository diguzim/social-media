export class User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date | null;

  constructor(props: Partial<User>) {
    this.id = props.id ?? '';
    this.name = props.name ?? '';
    this.email = props.email ?? '';
    this.passwordHash = props.passwordHash ?? '';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? null;
  }
}
