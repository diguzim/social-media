export interface GetProfileResponse {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerifiedAt: string | null;
  gender?: string | null;
  about?: string | null;
  avatarUrl?: string;
}
