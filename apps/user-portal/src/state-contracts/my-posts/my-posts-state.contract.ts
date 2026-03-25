import type { FeedPost } from '../../services/posts';

export interface MyPostsState {
  posts: FeedPost[];
  isLoading: boolean;
  error: string;
}

export interface MyPostsStateActions {
  refresh: () => Promise<void>;
}

export interface MyPostsStateContract {
  state: MyPostsState;
  actions: MyPostsStateActions;
}

export type UseMyPostsStateContract = () => MyPostsStateContract;
