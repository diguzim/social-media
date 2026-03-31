import type { PublicUserProfile } from '../../services/auth';
import type { FeedPost } from '../../services/posts';
import type { FriendUserSummary } from '@repo/contracts/api';

export interface UserProfileState {
  profile: PublicUserProfile | null;
  error: string;
  isLoading: boolean;
  friendshipStatus: 'none' | 'pending_outgoing' | 'pending_incoming' | 'friends' | 'self';
  friendshipError: string;
  isFriendshipActionPending: boolean;
  posts: FeedPost[];
  isPostsLoading: boolean;
  isLoadingMorePosts: boolean;
  hasMorePosts: boolean;
  postsError: string;
  postsLoadMoreError: string;
  friends: FriendUserSummary[];
  isFriendsLoading: boolean;
  friendsError: string;
  canViewAcceptedFriends: boolean;
}

export interface UserProfileStateActions {
  refresh: () => Promise<void>;
  refreshPosts: () => Promise<void>;
  sendFriendRequest: () => Promise<void>;
  loadNextPostsPage: () => Promise<void>;
}

export interface UserProfileStateContract {
  state: UserProfileState;
  actions: UserProfileStateActions;
}

export type UseUserProfileStateContract = () => UserProfileStateContract;
