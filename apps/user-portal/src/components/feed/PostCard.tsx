import { useEffect, useState } from 'react';
import type { TouchEvent } from 'react';
import { Link } from 'react-router-dom';
import type { PostImage } from '@repo/contracts/api';
import { getUserProfile } from '../../services/auth';
import type { FeedPost, PostComment } from '../../services/posts';
import {
  addPostImages,
  createPostComment,
  deletePost,
  deletePostComment,
  getPostComments,
  removePostImage,
  reorderPostImages,
  togglePostReaction,
  updatePost,
  updatePostComment,
} from '../../services/posts';
import { PendingButton } from '../loading/PendingButton';

interface PostCardProps {
  post: FeedPost;
  onReactionChange?: () => void;
}

interface ExistingEditableImage {
  kind: 'existing';
  key: string;
  id: string;
  imageUrl: string;
  mimeType: string;
  uploadedAt: string;
}

interface NewEditableImage {
  kind: 'new';
  key: string;
  file: File;
  imageUrl: string;
}

type EditableImage = ExistingEditableImage | NewEditableImage;

const MAX_POST_IMAGES = 10;
const MAX_POST_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_POST_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif']);

const sortPostImages = (images: PostImage[] | undefined): PostImage[] => {
  if (!images) {
    return [];
  }

  return [...images].sort((a, b) => a.orderIndex - b.orderIndex);
};

export function PostCard({ post, onReactionChange }: PostCardProps) {
  const currentUser = getUserProfile();
  const [managedPost, setManagedPost] = useState<FeedPost>(post);

  const createdAt = new Date(managedPost.createdAt).toLocaleString();
  const authorLabel = managedPost.author.name;
  const authorInitial = authorLabel.trim().charAt(0).toUpperCase() || '?';
  const hasAvatar = Boolean(managedPost.author.avatarUrl);
  const likeCount = managedPost.reactions?.likeCount ?? 0;
  const likedByMe = managedPost.reactions?.likedByMe ?? false;
  const isPostOwner = currentUser?.id === managedPost.authorId;

  const [isPending, setIsPending] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localLikedByMe, setLocalLikedByMe] = useState(likedByMe);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editingPostTitle, setEditingPostTitle] = useState(managedPost.title);
  const [editingPostContent, setEditingPostContent] = useState(managedPost.content);
  const [editingPostImages, setEditingPostImages] = useState<EditableImage[]>([]);
  const [isPostSaving, setIsPostSaving] = useState(false);
  const [isPostDeleting, setIsPostDeleting] = useState(false);
  const [postActionError, setPostActionError] = useState('');
  const [isPostDeleted, setIsPostDeleted] = useState(false);
  const [draggingImageKey, setDraggingImageKey] = useState<string | null>(null);
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const postImages = sortPostImages(managedPost.images);
  const hasImages = postImages.length > 0;

  useEffect(() => {
    setManagedPost(post);
    setIsPostDeleted(false);
  }, [post]);

  useEffect(() => {
    setLocalLikeCount(likeCount);
    setLocalLikedByMe(likedByMe);
  }, [likeCount, likedByMe]);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [managedPost.id, postImages.length, isEditingPost, editingPostImages.length]);

  useEffect(() => {
    if (!isEditingPost) {
      return;
    }

    setEditingPostTitle(managedPost.title);
    setEditingPostContent(managedPost.content);
    setEditingPostImages(
      sortPostImages(managedPost.images).map((image) => ({
        kind: 'existing',
        key: `existing-${image.id}`,
        id: image.id,
        imageUrl: image.imageUrl,
        mimeType: image.mimeType,
        uploadedAt: image.uploadedAt,
      }))
    );
    setPostActionError('');
  }, [isEditingPost, managedPost]);

  const showPreviousImage = () => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) => (prev === 0 ? postImages.length - 1 : prev - 1));
  };

  const showNextImage = () => {
    if (!hasImages) return;
    setCurrentImageIndex((prev) => (prev === postImages.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    setTouchStartX(event.touches[0]?.clientX ?? null);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartX === null) {
      return;
    }

    const touchEndX = event.changedTouches[0]?.clientX;
    if (typeof touchEndX !== 'number') {
      return;
    }

    const delta = touchStartX - touchEndX;
    if (Math.abs(delta) < 40) {
      return;
    }

    if (delta > 0) {
      showNextImage();
    } else {
      showPreviousImage();
    }

    setTouchStartX(null);
  };

  const updateManagedPost = (
    updates: Pick<FeedPost, 'title' | 'content' | 'createdAt' | 'authorId'> & {
      images?: PostImage[];
    }
  ) => {
    setManagedPost((current) => ({
      ...current,
      title: updates.title,
      content: updates.content,
      createdAt: updates.createdAt,
      authorId: updates.authorId,
      images: updates.images ?? [],
    }));
  };

  const revokeNewImageUrls = (images: EditableImage[]) => {
    images.forEach((image) => {
      if (image.kind === 'new') {
        URL.revokeObjectURL(image.imageUrl);
      }
    });
  };

  const enterEditMode = () => {
    setIsEditingPost(true);
    setPostActionError('');
  };

  const cancelPostEditing = () => {
    revokeNewImageUrls(editingPostImages);
    setIsEditingPost(false);
    setEditingPostImages([]);
    setPostActionError('');
    setDraggingImageKey(null);
  };

  const handlePostImagesSelected = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const selectedFiles = Array.from(fileList);
    if (editingPostImages.length + selectedFiles.length > MAX_POST_IMAGES) {
      setPostActionError(`A post can have at most ${MAX_POST_IMAGES} images`);
      return;
    }

    for (const file of selectedFiles) {
      if (!ALLOWED_POST_IMAGE_TYPES.has(file.type)) {
        setPostActionError('Only JPG, PNG and GIF images are allowed');
        return;
      }

      if (file.size > MAX_POST_IMAGE_BYTES) {
        setPostActionError('Each image must be 10MB or smaller');
        return;
      }
    }

    const newEditableImages = selectedFiles.map((file) => ({
      kind: 'new' as const,
      key: `new-${crypto.randomUUID()}`,
      file,
      imageUrl: URL.createObjectURL(file),
    }));

    setPostActionError('');
    setEditingPostImages((current) => [...current, ...newEditableImages]);
  };

  const removeEditingImage = (key: string) => {
    setEditingPostImages((current) => {
      const imageToRemove = current.find((img) => img.key === key);
      if (imageToRemove?.kind === 'new') {
        URL.revokeObjectURL(imageToRemove.imageUrl);
      }
      return current.filter((img) => img.key !== key);
    });
  };

  const moveEditingImage = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) {
      return;
    }

    setEditingPostImages((current) => {
      const next = [...current];
      const [moved] = next.splice(fromIndex, 1);
      if (!moved) {
        return current;
      }
      next.splice(toIndex, 0, moved);
      return next;
    });
  };

  const handleImageDragStart = (key: string) => {
    setDraggingImageKey(key);
  };

  const handleImageDrop = (targetKey: string) => {
    if (!draggingImageKey || draggingImageKey === targetKey) {
      setDraggingImageKey(null);
      return;
    }

    const fromIndex = editingPostImages.findIndex((img) => img.key === draggingImageKey);
    const toIndex = editingPostImages.findIndex((img) => img.key === targetKey);
    moveEditingImage(fromIndex, toIndex);
    setDraggingImageKey(null);
  };

  const handleSavePost = async () => {
    if (isPostSaving) {
      return;
    }

    const title = editingPostTitle.trim();
    const content = editingPostContent.trim();

    if (!title || !content) {
      setPostActionError('Title and content are required');
      return;
    }

    setIsPostSaving(true);
    setPostActionError('');

    try {
      let latest = await updatePost(managedPost.id, {
        title,
        content,
      });

      const desiredExistingIds = editingPostImages
        .filter((img): img is ExistingEditableImage => img.kind === 'existing')
        .map((img) => img.id);
      const currentExistingIds = sortPostImages(latest.images).map((img) => img.id);
      const removedIds = currentExistingIds.filter((id) => !desiredExistingIds.includes(id));

      for (const imageId of removedIds) {
        latest = await removePostImage(managedPost.id, imageId);
      }

      const newFiles = editingPostImages
        .filter((img): img is NewEditableImage => img.kind === 'new')
        .map((img) => img.file);

      if (newFiles.length > 0) {
        latest = await addPostImages(managedPost.id, newFiles);
      }

      const latestSorted = sortPostImages(latest.images);
      const latestById = new Set(latestSorted.map((img) => img.id));
      const addedIdsQueue = latestSorted
        .map((img) => img.id)
        .filter((id) => !desiredExistingIds.includes(id));

      let addedIndex = 0;
      const desiredOrder = editingPostImages
        .map((image) => {
          if (image.kind === 'existing') {
            return image.id;
          }

          const candidateId = addedIdsQueue[addedIndex];
          addedIndex += 1;
          return candidateId;
        })
        .filter((id): id is string => typeof id === 'string' && latestById.has(id));

      const currentOrder = latestSorted.map((img) => img.id);
      const isDifferentOrder =
        desiredOrder.length === currentOrder.length &&
        desiredOrder.some((id, index) => id !== currentOrder[index]);

      if (isDifferentOrder) {
        latest = await reorderPostImages(managedPost.id, {
          imageOrder: desiredOrder,
        });
      }

      updateManagedPost({
        title: latest.title,
        content: latest.content,
        createdAt: latest.createdAt,
        authorId: latest.authorId,
        images: sortPostImages(latest.images),
      });

      revokeNewImageUrls(editingPostImages);
      setIsEditingPost(false);
      setEditingPostImages([]);
      onReactionChange?.();
    } catch (error) {
      setPostActionError(error instanceof Error ? error.message : 'Failed to update post');
    } finally {
      setIsPostSaving(false);
    }
  };

  const handleDeletePost = async () => {
    if (isPostDeleting) {
      return;
    }

    const shouldDelete = window.confirm('Delete this post? This action cannot be undone.');
    if (!shouldDelete) {
      return;
    }

    setIsPostDeleting(true);
    setPostActionError('');

    try {
      await deletePost(managedPost.id);
      setIsPostDeleted(true);
      onReactionChange?.();
    } catch (error) {
      setPostActionError(error instanceof Error ? error.message : 'Failed to delete post');
    } finally {
      setIsPostDeleting(false);
    }
  };

  const loadComments = async () => {
    setCommentsError('');
    setIsCommentsLoading(true);
    try {
      const response = await getPostComments(managedPost.id, {
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
      await togglePostReaction(managedPost.id);
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
      await createPostComment(managedPost.id, { content });
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
      await updatePostComment(managedPost.id, commentId, { content });
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
      await deletePostComment(managedPost.id, commentId);
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

  if (isPostDeleted) {
    return (
      <article data-testid={`post-card-${managedPost.id}`} className="card p-4">
        <p data-testid={`post-deleted-${managedPost.id}`} className="text-sm text-slate-500">
          Post deleted.
        </p>
      </article>
    );
  }

  return (
    <article data-testid={`post-card-${managedPost.id}`} className="card p-4">
      <header className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          {hasAvatar ? (
            <img
              data-testid={`post-author-avatar-${managedPost.id}`}
              src={managedPost.author.avatarUrl}
              alt={`${authorLabel} profile picture`}
              className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover"
            />
          ) : (
            <div
              data-testid={`post-author-avatar-fallback-${managedPost.id}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-sm font-semibold text-slate-700"
              aria-label={`${authorLabel} avatar fallback`}
            >
              {authorInitial}
            </div>
          )}

          <div className="min-w-0">
            <Link
              data-testid={`post-author-link-${managedPost.id}`}
              to={`/users/${managedPost.author.id}`}
              className="line-clamp-1 text-sm font-semibold text-slate-900 hover:text-blue-700 hover:underline"
            >
              {authorLabel}
            </Link>
            <p data-testid={`post-created-at-${managedPost.id}`} className="text-xs text-slate-500">
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
                    data-testid={`post-save-${managedPost.id}`}
                    onClick={handleSavePost}
                    disabled={isPostSaving}
                    className="rounded-md bg-primary-600 px-2 py-1 text-xs font-medium text-white hover:bg-primary-700"
                    isPending={isPostSaving}
                    idleText="Save"
                    pendingText="Saving..."
                  />
                  <button
                    type="button"
                    data-testid={`post-edit-cancel-${managedPost.id}`}
                    onClick={cancelPostEditing}
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
                    data-testid={`post-edit-${managedPost.id}`}
                    onClick={enterEditMode}
                    className="rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Edit
                  </button>
                  <PendingButton
                    data-testid={`post-delete-${managedPost.id}`}
                    onClick={handleDeletePost}
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
            data-testid={`like-button-${managedPost.id}`}
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
          <span data-testid={`like-count-${managedPost.id}`} className="text-xs text-slate-600">
            {localLikeCount}
          </span>
        </div>
      </header>

      {postActionError && (
        <p
          data-testid={`post-action-error-${managedPost.id}`}
          className="mb-3 text-sm text-danger-600"
        >
          {postActionError}
        </p>
      )}

      {isEditingPost ? (
        <section data-testid={`post-edit-form-${managedPost.id}`} className="mb-3 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Title</label>
            <input
              data-testid={`post-edit-title-input-${managedPost.id}`}
              value={editingPostTitle}
              onChange={(event) => setEditingPostTitle(event.target.value)}
              disabled={isPostSaving}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Content</label>
            <textarea
              data-testid={`post-edit-content-input-${managedPost.id}`}
              value={editingPostContent}
              onChange={(event) => setEditingPostContent(event.target.value)}
              disabled={isPostSaving}
              rows={4}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm leading-6 text-slate-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-300 disabled:bg-slate-100"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Images</label>
            <input
              data-testid={`post-edit-images-input-${managedPost.id}`}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              multiple
              disabled={isPostSaving}
              onChange={(event) => {
                handlePostImagesSelected(event.target.files);
                event.currentTarget.value = '';
              }}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs text-slate-700 file:mr-2 file:rounded file:border-0 file:bg-primary-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-primary-700"
            />
            <p className="mt-1 text-xs text-slate-500">
              Drag thumbnails to reorder • max {MAX_POST_IMAGES} images
            </p>

            {editingPostImages.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {editingPostImages.map((image, index) => (
                  <div
                    key={image.key}
                    draggable
                    onDragStart={() => handleImageDragStart(image.key)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => handleImageDrop(image.key)}
                    data-testid={`post-edit-image-item-${managedPost.id}-${index}`}
                    className="group relative"
                  >
                    <button
                      type="button"
                      onClick={() => setCurrentImageIndex(index)}
                      className="overflow-hidden rounded border-2 border-slate-300 hover:border-primary-400"
                      aria-label={`Select image ${index + 1}`}
                    >
                      <img
                        src={image.imageUrl}
                        alt="Editable post thumbnail"
                        className="h-14 w-14 object-cover"
                      />
                    </button>
                    <button
                      type="button"
                      data-testid={`post-edit-image-remove-${managedPost.id}-${index}`}
                      onClick={() => removeEditingImage(image.key)}
                      disabled={isPostSaving}
                      className="absolute -right-1 -top-1 rounded-full bg-danger-600 px-1.5 py-0.5 text-[10px] font-semibold text-white"
                    >
                      ×
                    </button>
                    {image.kind === 'new' && (
                      <span className="absolute bottom-0 left-0 rounded-tr bg-primary-700 px-1 text-[10px] text-white">
                        New
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          <div className="mb-2.5">
            <h3
              data-testid={`post-title-${managedPost.id}`}
              className="text-lg font-semibold text-slate-900"
            >
              {managedPost.title}
            </h3>
          </div>

          <p
            data-testid={`post-content-${managedPost.id}`}
            className="mb-3 whitespace-pre-line text-sm leading-6 text-slate-700"
          >
            {managedPost.content}
          </p>

          {hasImages && (
            <section data-testid={`post-images-${managedPost.id}`} className="mb-3">
              <div
                className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  data-testid={`post-image-main-${managedPost.id}`}
                  src={postImages[currentImageIndex]?.imageUrl}
                  alt={`Post image ${currentImageIndex + 1} of ${postImages.length}`}
                  className="h-[500px] w-full object-contain"
                />

                {postImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      data-testid={`post-image-prev-${managedPost.id}`}
                      onClick={showPreviousImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-sm text-white hover:bg-black/60"
                      aria-label="Previous image"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      data-testid={`post-image-next-${managedPost.id}`}
                      onClick={showNextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-sm text-white hover:bg-black/60"
                      aria-label="Next image"
                    >
                      →
                    </button>
                    <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
                      {currentImageIndex + 1}/{postImages.length}
                    </div>
                  </>
                )}
              </div>

              {postImages.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {postImages.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      data-testid={`post-image-thumb-${managedPost.id}-${index}`}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`shrink-0 overflow-hidden rounded border-2 ${
                        currentImageIndex === index
                          ? 'border-primary-500'
                          : 'border-transparent hover:border-slate-300'
                      }`}
                      aria-label={`View image ${index + 1}`}
                    >
                      <img
                        src={image.imageUrl}
                        alt="Post image thumbnail"
                        className="h-12 w-12 object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
        </>
      )}

      <section
        data-testid={`post-comments-${managedPost.id}`}
        className="mt-4 border-t border-slate-200 pt-3"
      >
        <h4 className="mb-2 text-sm font-semibold text-slate-800">Comments</h4>

        {!isCommentsVisible && (
          <button
            type="button"
            data-testid={`comments-open-${managedPost.id}`}
            onClick={openComments}
            className="mb-3 text-xs font-medium text-blue-600 hover:underline"
          >
            Show comments
          </button>
        )}

        {isCommentsVisible && (
          <button
            type="button"
            data-testid={`comments-close-${managedPost.id}`}
            onClick={() => setIsCommentsVisible(false)}
            className="mb-3 text-xs font-medium text-slate-600 hover:underline"
          >
            Hide comments
          </button>
        )}

        {!isCommentsVisible ? null : (
          <>
            <div className="mb-3 flex items-start gap-2">
              <textarea
                data-testid={`comment-input-${managedPost.id}`}
                value={newCommentContent}
                onChange={(event) => setNewCommentContent(event.target.value)}
                placeholder="Write a comment..."
                rows={3}
                className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                disabled={isCommentCreating}
              />
              <PendingButton
                data-testid={`comment-submit-${managedPost.id}`}
                onClick={handleCreateComment}
                disabled={isCommentCreating || !newCommentContent.trim()}
                className="btn-primary self-start rounded-full px-4 py-2 text-sm font-semibold shadow-sm"
                isPending={isCommentCreating}
                idleText="Comment"
                pendingText="..."
              />
            </div>

            {commentsError && (
              <p
                data-testid={`comments-error-${managedPost.id}`}
                className="mb-2 text-xs text-danger-600"
              >
                {commentsError}
              </p>
            )}

            {isCommentsLoading ? (
              <p
                data-testid={`comments-loading-${managedPost.id}`}
                className="text-xs text-slate-500"
              >
                Loading comments...
              </p>
            ) : comments.length === 0 ? (
              <p
                data-testid={`comments-empty-${managedPost.id}`}
                className="text-xs text-slate-500"
              >
                No comments yet.
              </p>
            ) : (
              <ul data-testid={`comments-list-${managedPost.id}`} className="space-y-2">
                {comments.map((comment) => {
                  const isOwner = currentUser?.id === comment.authorId;
                  const isEditing = editingCommentId === comment.id;
                  const isMutating = isCommentMutatingId === comment.id;

                  return (
                    <li
                      key={comment.id}
                      data-testid={`comment-item-${managedPost.id}-${comment.id}`}
                      className="rounded-md border border-slate-200 bg-slate-50 p-2"
                    >
                      <div className="mb-1 text-[11px] text-slate-500">
                        {new Date(comment.createdAt).toLocaleString()}
                        {comment.updatedAt ? ' • edited' : ''}
                      </div>

                      {isEditing ? (
                        <>
                          <textarea
                            data-testid={`comment-edit-input-${managedPost.id}-${comment.id}`}
                            value={editingCommentContent}
                            onChange={(event) => setEditingCommentContent(event.target.value)}
                            rows={3}
                            className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm leading-6 text-slate-800 shadow-sm transition focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-slate-100"
                            disabled={isMutating}
                          />
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              data-testid={`comment-edit-save-${managedPost.id}-${comment.id}`}
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
                              data-testid={`comment-edit-cancel-${managedPost.id}-${comment.id}`}
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
                            data-testid={`comment-edit-${managedPost.id}-${comment.id}`}
                            onClick={() => startEditComment(comment)}
                            className="text-xs font-medium text-blue-600 hover:underline"
                            disabled={isMutating}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            data-testid={`comment-delete-${managedPost.id}-${comment.id}`}
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
