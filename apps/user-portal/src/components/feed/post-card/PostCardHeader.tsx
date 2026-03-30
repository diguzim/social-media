import { Link } from 'react-router-dom';
import { PendingButton } from '../../loading/PendingButton';

interface PostCardHeaderProps {
  postId: string;
  authorId: string;
  authorLabel: string;
  authorInitial: string;
  authorAvatarUrl?: string;
  createdAt: string;
  isPostOwner: boolean;
  isEditingPost: boolean;
  isPostSaving: boolean;
  isPostDeleting: boolean;
  onSavePost: () => void;
  onCancelEdit: () => void;
  onEnterEditMode: () => void;
  onDeletePost: () => void;
  isLikePending: boolean;
  likedByMe: boolean;
  likeCount: number;
  onLikeClick: () => void;
}

export function PostCardHeader({
  postId,
  authorId,
  authorLabel,
  authorInitial,
  authorAvatarUrl,
  createdAt,
  isPostOwner,
  isEditingPost,
  isPostSaving,
  isPostDeleting,
  onSavePost,
  onCancelEdit,
  onEnterEditMode,
  onDeletePost,
  isLikePending,
  likedByMe,
  likeCount,
  onLikeClick,
}: PostCardHeaderProps) {
  const hasAvatar = Boolean(authorAvatarUrl);

  return (
    <header className="mb-3 flex items-start justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        {hasAvatar ? (
          <img
            data-testid={`post-author-avatar-${postId}`}
            src={authorAvatarUrl}
            alt={`${authorLabel} profile picture`}
            className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
          />
        ) : (
          <div
            data-testid={`post-author-avatar-fallback-${postId}`}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700"
            aria-label={`${authorLabel} avatar fallback`}
          >
            {authorInitial}
          </div>
        )}

        <div className="min-w-0">
          <Link
            data-testid={`post-author-link-${postId}`}
            to={`/users/${authorId}`}
            className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-blue-700 hover:underline"
          >
            {authorLabel}
          </Link>
          <p data-testid={`post-created-at-${postId}`} className="text-xs text-slate-500">
            {createdAt}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isPostOwner && (
          <>
            {isEditingPost ? (
              <>
                <PendingButton
                  data-testid={`post-save-${postId}`}
                  onClick={onSavePost}
                  disabled={isPostSaving}
                  className="rounded-md bg-primary-600 px-2 py-1 text-xs font-medium text-white hover:bg-primary-700"
                  isPending={isPostSaving}
                  idleText="Save"
                  pendingText="Saving..."
                />
                <button
                  type="button"
                  data-testid={`post-edit-cancel-${postId}`}
                  onClick={onCancelEdit}
                  disabled={isPostSaving}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  data-testid={`post-edit-${postId}`}
                  onClick={onEnterEditMode}
                  className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                >
                  Edit
                </button>
                <PendingButton
                  data-testid={`post-delete-${postId}`}
                  onClick={onDeletePost}
                  disabled={isPostDeleting}
                  className="rounded-md bg-danger-50 px-2 py-1 text-xs font-medium text-danger-700 hover:bg-danger-100"
                  isPending={isPostDeleting}
                  idleText="Delete"
                  pendingText="Deleting..."
                />
              </>
            )}
          </>
        )}

        <PendingButton
          data-testid={`like-button-${postId}`}
          onClick={onLikeClick}
          disabled={isLikePending}
          aria-label={likedByMe ? 'Unlike post' : 'Like post'}
          className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            likedByMe
              ? 'bg-danger-100 text-danger-700 hover:bg-danger-200'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
          isPending={isLikePending}
          idleText={likedByMe ? '❤️ Liked' : '🤍 Like'}
          pendingText="..."
        />
        <span data-testid={`like-count-${postId}`} className="text-xs text-slate-600">
          {likeCount}
        </span>
      </div>
    </header>
  );
}
