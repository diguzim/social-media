import { GetProfileResponse } from "./profile.contract.js";

export enum ProfileGender {
  Female = "female",
  Male = "male",
  NonBinary = "non_binary",
  PreferNotToSay = "prefer_not_to_say",
}

export interface UpdateMyPersonalDataRequest {
  name: string;
  gender: ProfileGender;
  about: string;
}

export interface UpdateMyPersonalDataResponse extends GetProfileResponse {}
