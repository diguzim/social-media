import type { UserProfile } from '../../services/auth';

export interface HomeState {
  user: UserProfile | null;
  profileError: string;
  isProfileLoading: boolean;
  isProfileRefreshing: boolean;
  feedRefreshKey: number;
}

export interface HomeStateActions {
  refreshFeed: () => void;
}

export interface HomeStateContract {
  state: HomeState;
  actions: HomeStateActions;
}

export type UseHomeStateContract = () => HomeStateContract;
