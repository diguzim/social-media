import { useState } from 'react';
import type { PostComment } from '../../../services/posts';
import {
  createPostComment,
  deletePostComment,
  getPostComments,
  updatePostComment,
} from '../../../services/posts';

interface UsePostCommentsControllerParams {
  postId: string;
}

export function usePostCommentsController({ postId }: UsePostCommentsControllerParams) {
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
      const response = await getPostComments(postId, {
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

  const closeComments = () => {
    setIsCommentsVisible(false);
  };

  const handleCreateComment = async () => {
    const content = newCommentContent.trim();
    if (!content || isCommentCreating) {
      return;
    }

    setIsCommentCreating(true);
    setCommentsError('');
    try {
      await createPostComment(postId, { content });
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
      await updatePostComment(postId, commentId, { content });
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
      await deletePostComment(postId, commentId);
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

  return {
    comments,
    isCommentsVisible,
    hasLoadedComments,
    isCommentsLoading,
    commentsError,
    newCommentContent,
    isCommentCreating,
    isCommentMutatingId,
    editingCommentId,
    editingCommentContent,
    setNewCommentContent,
    setEditingCommentContent,
    openComments,
    closeComments,
    handleCreateComment,
    startEditComment,
    cancelEditComment,
    handleUpdateComment,
    handleDeleteComment,
  };
}
