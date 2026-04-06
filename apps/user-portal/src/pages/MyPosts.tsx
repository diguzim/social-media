import { useInfiniteScrollObserver } from '../components/infinite-scroll/useInfiniteScrollObserver';
import { PostCardsInfiniteList } from '../components/post-list/PostCardsInfiniteList';
import { Container, Stack } from '../components/layout';
import { useMyPostsStateContract } from '../state-contracts/my-posts';

export function MyPosts() {
  const { state, actions } = useMyPostsStateContract();

  const sentinelRef = useInfiniteScrollObserver({
    enabled: state.hasMore && !state.isLoading && !state.isLoadingMore,
    onIntersect: () => {
      void actions.loadNextPage();
    },
  });

  if (state.isLoading) {
    return (
      <Container maxWidth="5xl" dataTestId="my-posts-page">
        <Stack gap="gap-5">
          <h1 className="text-3xl font-bold text-slate-900">My Posts</h1>
          <p data-testid="my-posts-loading-text" className="text-slate-600">
            Loading your posts...
          </p>
        </Stack>
      </Container>
    );
  }

  if (state.error && state.posts.length === 0) {
    return (
      <Container maxWidth="5xl" dataTestId="my-posts-page">
        <Stack gap="gap-5">
          <h1 className="text-3xl font-bold text-slate-900">My Posts</h1>
          <p data-testid="my-posts-error-message" className="text-danger-600">
            {state.error}
          </p>
        </Stack>
      </Container>
    );
  }

  if (state.posts.length === 0) {
    return (
      <Container maxWidth="5xl" dataTestId="my-posts-page">
        <Stack gap="gap-5">
          <h1 className="text-3xl font-bold text-slate-900">My Posts</h1>
          <div data-testid="my-posts-empty-state" className="card px-6 py-8 text-center">
            <p className="text-lg text-slate-700">You haven&apos;t created any posts yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Start sharing your thoughts with the community!
            </p>
          </div>
        </Stack>
      </Container>
    );
  }

  return (
    <Container maxWidth="5xl" dataTestId="my-posts-page">
      <Stack gap="gap-5">
        <h1 className="text-3xl font-bold text-slate-900">My Posts</h1>
        <div data-testid="my-posts-count" className="text-sm text-slate-600">
          {state.posts.length} {state.posts.length === 1 ? 'post' : 'posts'}
        </div>
        <PostCardsInfiniteList
          posts={state.posts}
          onReactionChange={() => {
            void actions.refresh();
          }}
          listTestId="my-posts-list"
          className="grid gap-3"
          loadMoreError={state.loadMoreError}
          loadMoreErrorMessage={(currentError) => currentError}
          loadMoreErrorTestId="my-posts-load-more-error"
          isLoadingMore={state.isLoadingMore}
          loadingMoreMessage="Loading more posts..."
          loadingMoreTestId="my-posts-loading-more"
          hasMore={state.hasMore}
          sentinelRef={sentinelRef}
          sentinelTestId="my-posts-infinite-sentinel"
          sentinelClassName="h-2 w-full"
          endMessage="You've reached the end of your posts."
          endTestId="my-posts-end-of-list"
        />
      </Stack>
    </Container>
  );
}
