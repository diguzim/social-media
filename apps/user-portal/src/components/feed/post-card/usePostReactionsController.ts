import { useEffect, useState } from 'react';
import { togglePostReaction } from '../../../services/posts';

interface UsePostReactionsControllerParams {
  postId: string;
  likeCount: number;
  likedByMe: boolean;
  onReactionChange?: () => void;
}

export function usePostReactionsController({
  postId,
  likeCount,
  likedByMe,
  onReactionChange,
}: UsePostReactionsControllerParams) {
  const [isPending, setIsPending] = useState(false);
  const [localLikeCount, setLocalLikeCount] = useState(likeCount);
  const [localLikedByMe, setLocalLikedByMe] = useState(likedByMe);

  useEffect(() => {
    setLocalLikeCount(likeCount);
    setLocalLikedByMe(likedByMe);
  }, [likeCount, likedByMe]);

  const handleLikeClick = async () => {
    if (isPending) {
      return;
    }

    setIsPending(true);

    const wasLiked = localLikedByMe;
    setLocalLikedByMe(!wasLiked);
    setLocalLikeCount(wasLiked ? localLikeCount - 1 : localLikeCount + 1);

    try {
      await togglePostReaction(postId);
      onReactionChange?.();
    } catch (error) {
      setLocalLikedByMe(wasLiked);
      setLocalLikeCount(wasLiked ? localLikeCount + 1 : localLikeCount - 1);
      console.error('Failed to toggle like:', error);
    } finally {
      setIsPending(false);
    }
  };

  return {
    isPending,
    localLikeCount,
    localLikedByMe,
    handleLikeClick,
  };
}
