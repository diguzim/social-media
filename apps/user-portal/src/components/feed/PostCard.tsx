import { useEffect, useState } from 'react';
import { getUserProfile } from '../../services/auth';
import type { FeedPost } from '../../services/posts';
import {
  addPostImages,
  deletePost,
  removePostImage,
  reorderPostImages,
  updatePost,
} from '../../services/posts';
import { PostCardCommentsSection } from './post-card/PostCardCommentsSection';
import { PostCardEditForm } from './post-card/PostCardEditForm';
import { PostCardHeader } from './post-card/PostCardHeader';
import { PostCardMediaSection } from './post-card/PostCardMediaSection';
import {
  ALLOWED_POST_IMAGE_TYPES,
  MAX_POST_IMAGE_BYTES,
  MAX_POST_IMAGES,
  sortPostImages,
} from './post-card/types';
import type { EditableImage, ExistingEditableImage, NewEditableImage } from './post-card/types';
import { useImageCarouselController } from './post-card/useImageCarouselController';
import { usePostCommentsController } from './post-card/usePostCommentsController';
import { usePostReactionsController } from './post-card/usePostReactionsController';

interface PostCardProps {
  post: FeedPost;
  onReactionChange?: () => void;
}

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

  const [isEditingPost, setIsEditingPost] = useState(false);
  const [editingPostTitle, setEditingPostTitle] = useState(managedPost.title);
  const [editingPostContent, setEditingPostContent] = useState(managedPost.content);
  const [editingPostImages, setEditingPostImages] = useState<EditableImage[]>([]);
  const [isPostSaving, setIsPostSaving] = useState(false);
  const [isPostDeleting, setIsPostDeleting] = useState(false);
  const [postActionError, setPostActionError] = useState('');
  const [isPostDeleted, setIsPostDeleted] = useState(false);
  const [draggingImageKey, setDraggingImageKey] = useState<string | null>(null);

  const postImages = sortPostImages(managedPost.images);

  const reactionsController = usePostReactionsController({
    postId: managedPost.id,
    likeCount,
    likedByMe,
    onReactionChange,
  });

  const commentsController = usePostCommentsController({ postId: managedPost.id });

  const carouselController = useImageCarouselController({
    postId: managedPost.id,
    imageCount: postImages.length,
    isEditingPost,
    editingImageCount: editingPostImages.length,
  });

  useEffect(() => {
    setManagedPost(post);
    setIsPostDeleted(false);
  }, [post]);

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

  const updateManagedPost = (
    updates: Pick<FeedPost, 'title' | 'content' | 'createdAt' | 'authorId'> & {
      images?: FeedPost['images'];
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
      <PostCardHeader
        postId={managedPost.id}
        authorUsername={managedPost.author.username}
        authorLabel={authorLabel}
        authorInitial={authorInitial}
        authorAvatarUrl={hasAvatar ? managedPost.author.avatarUrl : undefined}
        createdAt={createdAt}
        isPostOwner={isPostOwner}
        isEditingPost={isEditingPost}
        isPostSaving={isPostSaving}
        isPostDeleting={isPostDeleting}
        onSavePost={() => {
          void handleSavePost();
        }}
        onCancelEdit={cancelPostEditing}
        onEnterEditMode={enterEditMode}
        onDeletePost={() => {
          void handleDeletePost();
        }}
        isLikePending={reactionsController.isPending}
        likedByMe={reactionsController.localLikedByMe}
        likeCount={reactionsController.localLikeCount}
        onLikeClick={() => {
          void reactionsController.handleLikeClick();
        }}
      />

      {postActionError && (
        <p
          data-testid={`post-action-error-${managedPost.id}`}
          className="mb-3 text-sm text-danger-600"
        >
          {postActionError}
        </p>
      )}

      {isEditingPost ? (
        <PostCardEditForm
          postId={managedPost.id}
          isPostSaving={isPostSaving}
          title={editingPostTitle}
          content={editingPostContent}
          images={editingPostImages}
          maxImages={MAX_POST_IMAGES}
          onTitleChange={setEditingPostTitle}
          onContentChange={setEditingPostContent}
          onImagesSelected={handlePostImagesSelected}
          onSelectImage={carouselController.setCurrentImageIndex}
          onRemoveImage={removeEditingImage}
          onImageDragStart={handleImageDragStart}
          onImageDrop={handleImageDrop}
        />
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

          <PostCardMediaSection
            postId={managedPost.id}
            postImages={postImages}
            currentImageIndex={carouselController.currentImageIndex}
            onTouchStart={carouselController.handleTouchStart}
            onTouchEnd={carouselController.handleTouchEnd}
            onPrevious={carouselController.showPreviousImage}
            onNext={carouselController.showNextImage}
            onSelectImage={carouselController.setCurrentImageIndex}
          />
        </>
      )}

      <PostCardCommentsSection
        postId={managedPost.id}
        currentUserId={currentUser?.id}
        comments={commentsController.comments}
        isCommentsVisible={commentsController.isCommentsVisible}
        isCommentsLoading={commentsController.isCommentsLoading}
        commentsError={commentsController.commentsError}
        newCommentContent={commentsController.newCommentContent}
        isCommentCreating={commentsController.isCommentCreating}
        isCommentMutatingId={commentsController.isCommentMutatingId}
        editingCommentId={commentsController.editingCommentId}
        editingCommentContent={commentsController.editingCommentContent}
        onOpenComments={commentsController.openComments}
        onCloseComments={commentsController.closeComments}
        onNewCommentContentChange={commentsController.setNewCommentContent}
        onCreateComment={() => {
          void commentsController.handleCreateComment();
        }}
        onStartEditComment={commentsController.startEditComment}
        onCancelEditComment={commentsController.cancelEditComment}
        onEditCommentContentChange={commentsController.setEditingCommentContent}
        onUpdateComment={(commentId) => {
          void commentsController.handleUpdateComment(commentId);
        }}
        onDeleteComment={(commentId) => {
          void commentsController.handleDeleteComment(commentId);
        }}
      />
    </article>
  );
}
