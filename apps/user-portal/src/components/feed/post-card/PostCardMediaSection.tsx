import type { TouchEvent } from 'react';
import type { PostImage } from '@repo/contracts/api';
import { Button } from '@repo/ui';

interface PostCardMediaSectionProps {
  postId: string;
  postImages: PostImage[];
  currentImageIndex: number;
  onTouchStart: (event: TouchEvent<HTMLDivElement>) => void;
  onTouchEnd: (event: TouchEvent<HTMLDivElement>) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSelectImage: (index: number) => void;
}

export function PostCardMediaSection({
  postId,
  postImages,
  currentImageIndex,
  onTouchStart,
  onTouchEnd,
  onPrevious,
  onNext,
  onSelectImage,
}: PostCardMediaSectionProps) {
  if (postImages.length === 0) {
    return null;
  }

  return (
    <section data-testid={`post-images-${postId}`} className="mb-3">
      <div
        className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-100"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img
          data-testid={`post-image-main-${postId}`}
          src={postImages[currentImageIndex]?.imageUrl}
          alt={`Post image ${currentImageIndex + 1} of ${postImages.length}`}
          className="h-[500px] w-full object-contain"
        />

        {postImages.length > 1 && (
          <>
            <Button
              type="button"
              variant="link"
              size="sm"
              data-testid={`post-image-prev-${postId}`}
              onClick={onPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-sm text-white hover:bg-black/60"
              aria-label="Previous image"
            >
              ←
            </Button>
            <Button
              type="button"
              variant="link"
              size="sm"
              data-testid={`post-image-next-${postId}`}
              onClick={onNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 px-2 py-1 text-sm text-white hover:bg-black/60"
              aria-label="Next image"
            >
              →
            </Button>
            <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
              {currentImageIndex + 1}/{postImages.length}
            </div>
          </>
        )}
      </div>

      {postImages.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
          {postImages.map((image, index) => (
            <Button
              key={image.id}
              type="button"
              variant="link"
              size="sm"
              data-testid={`post-image-thumb-${postId}-${index}`}
              onClick={() => onSelectImage(index)}
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
            </Button>
          ))}
        </div>
      )}
    </section>
  );
}
