import { useEffect, useState } from 'react';
import type { TouchEvent } from 'react';

interface UseImageCarouselControllerParams {
  postId: string;
  imageCount: number;
  isEditingPost: boolean;
  editingImageCount: number;
}

export function useImageCarouselController({
  postId,
  imageCount,
  isEditingPost,
  editingImageCount,
}: UseImageCarouselControllerParams) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [postId, imageCount, isEditingPost, editingImageCount]);

  const hasImages = imageCount > 0;

  const showPreviousImage = () => {
    if (!hasImages) {
      return;
    }

    setCurrentImageIndex((prev) => (prev === 0 ? imageCount - 1 : prev - 1));
  };

  const showNextImage = () => {
    if (!hasImages) {
      return;
    }

    setCurrentImageIndex((prev) => (prev === imageCount - 1 ? 0 : prev + 1));
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

  return {
    currentImageIndex,
    setCurrentImageIndex,
    showPreviousImage,
    showNextImage,
    handleTouchStart,
    handleTouchEnd,
  };
}
