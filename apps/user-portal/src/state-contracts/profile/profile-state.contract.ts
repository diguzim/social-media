import type { UserProfile } from '../../services/auth';

export interface ProfileState {
  user: UserProfile | null;
  error: string;
  isLoading: boolean;
  isAvatarUploading: boolean;
  avatarUploadError: string;
}

export interface ProfileStateActions {
  refresh: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}

export interface ProfileStateContract {
  state: ProfileState;
  actions: ProfileStateActions;
}

export type UseProfileStateContract = () => ProfileStateContract;
