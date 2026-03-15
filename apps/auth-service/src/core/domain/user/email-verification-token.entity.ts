export class EmailVerificationToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  consumedAt: Date | null;

  constructor(props: Partial<EmailVerificationToken>) {
    this.id = props.id ?? "";
    this.userId = props.userId ?? "";
    this.tokenHash = props.tokenHash ?? "";
    this.expiresAt = props.expiresAt ?? new Date();
    this.createdAt = props.createdAt ?? new Date();
    this.consumedAt = props.consumedAt ?? null;
  }

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isConsumed(): boolean {
    return this.consumedAt !== null;
  }

  get isValid(): boolean {
    return !this.isExpired && !this.isConsumed;
  }
}
