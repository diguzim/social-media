export interface GetProfileResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerifiedAt: string | null;
  avatarUrl?: string;
}
