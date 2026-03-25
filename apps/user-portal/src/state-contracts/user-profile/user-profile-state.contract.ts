import type { PublicUserProfile } from '../../services/auth';

export interface UserProfileState {
  profile: PublicUserProfile | null;
  error: string;
  isLoading: boolean;
}

export interface UserProfileStateActions {
  refresh: () => Promise<void>;
}

export interface UserProfileStateContract {
  state: UserProfileState;
  actions: UserProfileStateActions;
}

export type UseUserProfileStateContract = () => UserProfileStateContract;
