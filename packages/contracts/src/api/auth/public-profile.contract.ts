export interface GetPublicProfileRequest {
  userId: string;
}

export interface GetPublicProfileResponse {
  id: string;
  name: string;
  username: string;
  emailVerifiedAt: string | null;
  avatarUrl?: string;
}
