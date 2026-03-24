export class User {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date | null;
  /** Set once the user clicks the confirmation link. Null means unverified. */
  emailVerifiedAt: Date | null;

  constructor(props: Partial<User>) {
    this.id = props.id ?? '';
    this.name = props.name ?? '';
    this.username = props.username ?? '';
    this.email = props.email ?? '';
    this.passwordHash = props.passwordHash ?? '';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? null;
    this.emailVerifiedAt = props.emailVerifiedAt ?? null;
  }
}
