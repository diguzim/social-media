export enum RpcProfileGender {
  Female = "female",
  Male = "male",
  NonBinary = "non_binary",
  PreferNotToSay = "prefer_not_to_say",
}

export interface UpdatePersonalDataRequest {
  userId: string;
  name: string;
  gender: RpcProfileGender;
  about: string;
  correlationId?: string;
}

export interface UpdatePersonalDataReply {
  id: string;
  name: string;
  username: string;
  email: string;
  emailVerifiedAt: string | null;
  gender?: RpcProfileGender | null;
  about?: string | null;
}
