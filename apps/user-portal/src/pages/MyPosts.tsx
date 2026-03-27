import { PostCard } from '../components/feed/PostCard';
import { useMyPostsStateContract } from '../state-contracts/my-posts';

export function MyPosts() {
  const { state, actions } = useMyPostsStateContract();

  if (state.isLoading) {
    return (
      <div data-testid="my-posts-page" className="page-container max-w-5xl">
        <h1 className="mb-5 text-3xl font-bold text-slate-900">My Posts</h1>
        <p data-testid="my-posts-loading-text" className="text-slate-600">
          Loading your posts...
        </p>
      </div>
    );
  }

  if (state.error) {
    return (
      <div data-testid="my-posts-page" className="page-container max-w-5xl">
        <h1 className="mb-5 text-3xl font-bold text-slate-900">My Posts</h1>
        <p data-testid="my-posts-error-message" className="text-danger-600">
          {state.error}
        </p>
      </div>
    );
  }

  if (state.posts.length === 0) {
    return (
      <div data-testid="my-posts-page" className="page-container max-w-5xl">
        <h1 className="mb-5 text-3xl font-bold text-slate-900">My Posts</h1>
        <div data-testid="my-posts-empty-state" className="card px-6 py-8 text-center">
          <p className="text-lg text-slate-700">You haven&apos;t created any posts yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Start sharing your thoughts with the community!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="my-posts-page" className="page-container max-w-5xl">
      <h1 className="mb-5 text-3xl font-bold text-slate-900">My Posts</h1>
      <div data-testid="my-posts-count" className="mb-4 text-sm text-slate-600">
        {state.posts.length} {state.posts.length === 1 ? 'post' : 'posts'}
      </div>
      <div data-testid="my-posts-list" className="grid gap-3">
        {state.posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onReactionChange={() => {
              void actions.refresh();
            }}
          />
        ))}
      </div>
    </div>
  );
}
