export class User {
  id: string;
  name: string;
  username: string;
  usernameCanonical: string;
  email: string;
  gender: string | null;
  about: string | null;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date | null;
  /** Set once the user clicks the confirmation link. Null means unverified. */
  emailVerifiedAt: Date | null;

  constructor(props: Partial<User>) {
    this.id = props.id ?? '';
    this.name = props.name ?? '';
    this.username = props.username ?? '';
    this.usernameCanonical = props.usernameCanonical ?? '';
    this.email = props.email ?? '';
    this.gender = props.gender ?? null;
    this.about = props.about ?? null;
    this.passwordHash = props.passwordHash ?? '';
    this.createdAt = props.createdAt ?? new Date();
    this.updatedAt = props.updatedAt ?? null;
    this.emailVerifiedAt = props.emailVerifiedAt ?? null;
  }
}
