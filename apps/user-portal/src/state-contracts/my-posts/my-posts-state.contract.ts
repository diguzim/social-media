import type { FeedPost } from '../../services/posts';

export interface MyPostsState {
  posts: FeedPost[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: string;
  loadMoreError: string;
}

export interface MyPostsStateActions {
  refresh: () => Promise<void>;
  loadNextPage: () => Promise<void>;
}

export interface MyPostsStateContract {
  state: MyPostsState;
  actions: MyPostsStateActions;
}

export type UseMyPostsStateContract = () => MyPostsStateContract;
