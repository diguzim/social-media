export interface GetProfileRequest {
  userId: string;
}

export interface GetProfileReply {
  id: string;
  name: string;
  email: string;
}
