export interface GetPublicProfileRequest {
  userId: string;
}

export interface GetPublicProfileResponse {
  id: string;
  name: string;
  username: string;
  emailVerifiedAt: string | null;
  gender?: string | null;
  about?: string | null;
  avatarUrl?: string;
}
