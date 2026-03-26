import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserProfile } from '../../services/auth';
import type { FeedPost, PostComment } from '../../services/posts';
import {
  createPostComment,
  deletePostComment,
  getPostComments,
  togglePostReaction,
  updatePostComment,
} from '../../services/posts';
import { PendingButton } from '../loading/PendingButton';

interface PostCardProps {
  post: FeedPost;
  onReactionChange?: () => void;
}

export function PostCard({ post, onReactionChange }: PostCardProps) {
  const currentUser = getUserProfile();
  const createdAt = new Date(post.createdAt).toLocaleString();
  const authorLabel = post.author.name;
  const likeCount = post.reactions?.likeCount ?? 0;
  const likedByMe = post.reactions?.likedByMe ?? false;

  const [isPending, setIsPending] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localLikedByMe, setLocalLikedByMe] = useState(likedByMe);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [isCommentsVisible, setIsCommentsVisible] = useState(false);
  const [hasLoadedComments, setHasLoadedComments] = useState(false);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentsError, setCommentsError] = useState('');
  const [newCommentContent, setNewCommentContent] = useState('');
  const [isCommentCreating, setIsCommentCreating] = useState(false);
  const [isCommentMutatingId, setIsCommentMutatingId] = useState<string | null>(null);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState('');

  const loadComments = async () => {
    setCommentsError('');
    setIsCommentsLoading(true);
    try {
      const response = await getPostComments(post.id, {
        page: 1,
        limit: 50,
        sortOrder: 'asc',
      });
      setComments(response.data);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load comments';
      setCommentsError(message);
    } finally {
      setIsCommentsLoading(false);
      setHasLoadedComments(true);
    }
  };

  const openComments = () => {
    setIsCommentsVisible(true);
    if (!hasLoadedComments && !isCommentsLoading) {
      void loadComments();
    }
  };

  const handleLikeClick = async () => {
    if (isPending) {
      return;
    }

    setIsPending(true);

    // Optimistic update
    const wasLiked = localLikedByMe;
    setLocalLikedByMe(!wasLiked);
    setLocalLikeCount(wasLiked ? localLikeCount - 1 : localLikeCount + 1);

    try {
      await togglePostReaction(post.id);
      onReactionChange?.();
    } catch (error) {
      // Revert optimistic update on error
      setLocalLikedByMe(wasLiked);
      setLocalLikeCount(wasLiked ? localLikeCount + 1 : localLikeCount - 1);
      console.error('Failed to toggle like:', error);
    } finally {
      setIsPending(false);
    }
  };

  const handleCreateComment = async () => {
    const content = newCommentContent.trim();
    if (!content || isCommentCreating) {
      return;
    }

    setIsCommentCreating(true);
    setCommentsError('');
    try {
      await createPostComment(post.id, { content });
      setNewCommentContent('');
      await loadComments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create comment';
      setCommentsError(message);
    } finally {
      setIsCommentCreating(false);
    }
  };

  const startEditComment = (comment: PostComment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentContent('');
  };

  const handleUpdateComment = async (commentId: string) => {
    const content = editingCommentContent.trim();
    if (!content || isCommentMutatingId) {
      return;
    }

    setIsCommentMutatingId(commentId);
    setCommentsError('');
    try {
      await updatePostComment(post.id, commentId, { content });
      cancelEditComment();
      await loadComments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update comment';
      setCommentsError(message);
    } finally {
      setIsCommentMutatingId(null);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (isCommentMutatingId) {
      return;
    }

    setIsCommentMutatingId(commentId);
    setCommentsError('');
    try {
      await deletePostComment(post.id, commentId);
      if (editingCommentId === commentId) {
        cancelEditComment();
      }
      await loadComments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete comment';
      setCommentsError(message);
    } finally {
      setIsCommentMutatingId(null);
    }
  };

  return (
    <article data-testid={`post-card-${post.id}`} className="card p-4">
      <header className="mb-2.5">
        <h3 data-testid={`post-title-${post.id}`} className="text-lg font-semibold text-slate-900">
          {post.title}
        </h3>
      </header>

      <p
        data-testid={`post-content-${post.id}`}
        className="mb-3 whitespace-pre-line text-sm leading-6 text-slate-700"
      >
        {post.content}
      </p>

      <footer className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-3 text-xs text-slate-500">
          <span data-testid={`post-author-${post.id}`}>
            Author:{' '}
            <Link
              to={`/users/${post.author.id}`}
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              {authorLabel}
            </Link>
          </span>
          <span data-testid={`post-created-at-${post.id}`}>{createdAt}</span>
        </div>

        <div className="flex items-center gap-2">
          <PendingButton
            data-testid={`like-button-${post.id}`}
            onClick={handleLikeClick}
            disabled={isPending}
            aria-label={localLikedByMe ? 'Unlike post' : 'Like post'}
            className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
              localLikedByMe
                ? 'bg-danger-100 text-danger-700 hover:bg-danger-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            isPending={isPending}
            idleText={localLikedByMe ? '❤️ Liked' : '🤍 Like'}
            pendingText="..."
          />
          <span data-testid={`like-count-${post.id}`} className="text-xs text-slate-600">
            {localLikeCount}
          </span>
        </div>
      </footer>

      <section
        data-testid={`post-comments-${post.id}`}
        className="mt-4 border-t border-slate-200 pt-3"
      >
        <h4 className="mb-2 text-sm font-semibold text-slate-800">Comments</h4>

        {!isCommentsVisible && (
          <button
            type="button"
            data-testid={`comments-open-${post.id}`}
            onClick={openComments}
            className="mb-3 text-xs font-medium text-blue-600 hover:underline"
          >
            Show comments
          </button>
        )}

        {isCommentsVisible && (
          <button
            type="button"
            data-testid={`comments-close-${post.id}`}
            onClick={() => setIsCommentsVisible(false)}
            className="mb-3 text-xs font-medium text-slate-600 hover:underline"
          >
            Hide comments
          </button>
        )}

        {!isCommentsVisible ? null : (
          <>
            <div className="mb-3 flex gap-2">
              <input
                data-testid={`comment-input-${post.id}`}
                value={newCommentContent}
                onChange={(event) => setNewCommentContent(event.target.value)}
                placeholder="Write a comment..."
                className="input-field min-h-[40px]"
                disabled={isCommentCreating}
              />
              <PendingButton
                data-testid={`comment-submit-${post.id}`}
                onClick={handleCreateComment}
                disabled={isCommentCreating || !newCommentContent.trim()}
                className="btn-primary px-3 py-2 text-sm"
                isPending={isCommentCreating}
                idleText="Comment"
                pendingText="..."
              />
            </div>

            {commentsError && (
              <p data-testid={`comments-error-${post.id}`} className="mb-2 text-xs text-danger-600">
                {commentsError}
              </p>
            )}

            {isCommentsLoading ? (
              <p data-testid={`comments-loading-${post.id}`} className="text-xs text-slate-500">
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
              <p data-testid={`comments-empty-${post.id}`} className="text-xs text-slate-500">
                No comments yet.
              </p>
            ) : (
              <ul data-testid={`comments-list-${post.id}`} className="space-y-2">
                {comments.map((comment) => {
                  const isOwner = currentUser?.id === comment.authorId;
                  const isEditing = editingCommentId === comment.id;
                  const isMutating = isCommentMutatingId === comment.id;

                  return (
                    <li
                      key={comment.id}
                      data-testid={`comment-item-${post.id}-${comment.id}`}
                      className="rounded-md border border-slate-200 bg-slate-50 p-2"
                    >
                      <div className="mb-1 text-[11px] text-slate-500">
                        {new Date(comment.createdAt).toLocaleString()}
                        {comment.updatedAt ? ' • edited' : ''}
                      </div>

                      {isEditing ? (
                        <>
                          <input
                            data-testid={`comment-edit-input-${post.id}-${comment.id}`}
                            value={editingCommentContent}
                            onChange={(event) => setEditingCommentContent(event.target.value)}
                            className="input-field min-h-[36px]"
                            disabled={isMutating}
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              data-testid={`comment-edit-save-${post.id}-${comment.id}`}
                              onClick={() => {
                                void handleUpdateComment(comment.id);
                              }}
                              className="btn-primary px-2 py-1 text-xs"
                              disabled={isMutating || !editingCommentContent.trim()}
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              data-testid={`comment-edit-cancel-${post.id}-${comment.id}`}
                              onClick={cancelEditComment}
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
                            data-testid={`comment-edit-${post.id}-${comment.id}`}
                            onClick={() => startEditComment(comment)}
                            className="text-xs font-medium text-blue-600 hover:underline"
                            disabled={isMutating}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            data-testid={`comment-delete-${post.id}-${comment.id}`}
                            onClick={() => {
                              void handleDeleteComment(comment.id);
                            }}
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
    </article>
  );
}
