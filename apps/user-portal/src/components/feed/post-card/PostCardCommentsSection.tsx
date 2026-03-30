import type { PostComment } from '../../../services/posts';
import { PendingButton } from '../../loading/PendingButton';

interface PostCardCommentsSectionProps {
  postId: string;
  currentUserId?: string;
  comments: PostComment[];
  isCommentsVisible: boolean;
  isCommentsLoading: boolean;
  commentsError: string;
  newCommentContent: string;
  isCommentCreating: boolean;
  isCommentMutatingId: string | null;
  editingCommentId: string | null;
  editingCommentContent: string;
  onOpenComments: () => void;
  onCloseComments: () => void;
  onNewCommentContentChange: (value: string) => void;
  onCreateComment: () => void;
  onStartEditComment: (comment: PostComment) => void;
  onCancelEditComment: () => void;
  onEditCommentContentChange: (value: string) => void;
  onUpdateComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

export function PostCardCommentsSection({
  postId,
  currentUserId,
  comments,
  isCommentsVisible,
  isCommentsLoading,
  commentsError,
  newCommentContent,
  isCommentCreating,
  isCommentMutatingId,
  editingCommentId,
  editingCommentContent,
  onOpenComments,
  onCloseComments,
  onNewCommentContentChange,
  onCreateComment,
  onStartEditComment,
  onCancelEditComment,
  onEditCommentContentChange,
  onUpdateComment,
  onDeleteComment,
}: PostCardCommentsSectionProps) {
  return (
    <section
      data-testid={`post-comments-${postId}`}
      className="mt-4 border-t border-slate-200 pt-3"
    >
      <h4 className="mb-2 text-sm font-semibold text-slate-800">Comments</h4>

      {!isCommentsVisible && (
        <button
          type="button"
          data-testid={`comments-open-${postId}`}
          onClick={onOpenComments}
          className="mb-3 text-xs font-medium text-blue-600 hover:underline"
        >
          Show comments
        </button>
      )}

      {isCommentsVisible && (
        <button
          type="button"
          data-testid={`comments-close-${postId}`}
          onClick={onCloseComments}
          className="mb-3 text-xs font-medium text-slate-600 hover:underline"
        >
          Hide comments
        </button>
      )}

      {!isCommentsVisible ? null : (
        <>
          <div className="mb-3 flex items-start gap-2">
            <textarea
              data-testid={`comment-input-${postId}`}
              value={newCommentContent}
              onChange={(event) => onNewCommentContentChange(event.target.value)}
              placeholder="Write a comment..."
              rows={3}
              className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
              disabled={isCommentCreating}
            />
            <PendingButton
              data-testid={`comment-submit-${postId}`}
              onClick={onCreateComment}
              disabled={isCommentCreating || !newCommentContent.trim()}
              className="btn-primary self-start rounded-full px-4 py-2 text-sm font-semibold shadow-sm"
              isPending={isCommentCreating}
              idleText="Comment"
              pendingText="..."
            />
          </div>

          {commentsError && (
            <p data-testid={`comments-error-${postId}`} className="mb-2 text-xs text-danger-600">
              {commentsError}
            </p>
          )}

          {isCommentsLoading ? (
            <p data-testid={`comments-loading-${postId}`} className="text-xs text-slate-500">
              Loading comments...
            </p>
          ) : comments.length === 0 ? (
            <p data-testid={`comments-empty-${postId}`} className="text-xs text-slate-500">
              No comments yet.
            </p>
          ) : (
            <ul data-testid={`comments-list-${postId}`} className="space-y-2">
              {comments.map((comment) => {
                const isOwner = currentUserId === comment.authorId;
                const isEditing = editingCommentId === comment.id;
                const isMutating = isCommentMutatingId === comment.id;

                return (
                  <li
                    key={comment.id}
                    data-testid={`comment-item-${postId}-${comment.id}`}
                    className="rounded-md border border-slate-200 bg-slate-50 p-2"
                  >
                    <div className="mb-1 text-[11px] text-slate-500">
                      {new Date(comment.createdAt).toLocaleString()}
                      {comment.updatedAt ? ' • edited' : ''}
                    </div>

                    {isEditing ? (
                      <>
                        <textarea
                          data-testid={`comment-edit-input-${postId}-${comment.id}`}
                          value={editingCommentContent}
                          onChange={(event) => onEditCommentContentChange(event.target.value)}
                          rows={3}
                          className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                          disabled={isMutating}
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            data-testid={`comment-edit-save-${postId}-${comment.id}`}
                            onClick={() => onUpdateComment(comment.id)}
                            className="btn-primary px-2 py-1 text-xs"
                            disabled={isMutating || !editingCommentContent.trim()}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            data-testid={`comment-edit-cancel-${postId}-${comment.id}`}
                            onClick={onCancelEditComment}
                            className="btn-secondary px-2 py-1 text-xs"
                            disabled={isMutating}
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-slate-700">{comment.content}</p>
                    )}

                    {isOwner && !isEditing && (
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          data-testid={`comment-edit-${postId}-${comment.id}`}
                          onClick={() => onStartEditComment(comment)}
                          className="text-xs font-medium text-blue-600 hover:underline"
                          disabled={isMutating}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          data-testid={`comment-delete-${postId}-${comment.id}`}
                          onClick={() => onDeleteComment(comment.id)}
                          className="text-xs font-medium text-danger-600 hover:underline"
                          disabled={isMutating}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
