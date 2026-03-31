import type { UserProfile } from '../../services/auth';
import type { FeedPost } from '../../services/posts';
import type { FriendUserSummary } from '@repo/contracts/api';

export interface ProfileState {
  user: UserProfile | null;
  error: string;
  isLoading: boolean;
  isAvatarUploading: boolean;
  avatarUploadError: string;
  posts: FeedPost[];
  isPostsLoading: boolean;
  isLoadingMorePosts: boolean;
  hasMorePosts: boolean;
  postsError: string;
  postsLoadMoreError: string;
  friends: FriendUserSummary[];
  isFriendsLoading: boolean;
  friendsError: string;
}

export interface ProfileStateActions {
  refresh: () => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  refreshPosts: () => Promise<void>;
  loadNextPostsPage: () => Promise<void>;
}

export interface ProfileStateContract {
  state: ProfileState;
  actions: ProfileStateActions;
}

export type UseProfileStateContract = () => ProfileStateContract;
