import { useState } from 'react';
import type { FormEvent } from 'react';
import { createPost } from '../../../services/posts';

const MAX_IMAGES = 10;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif']);

interface UseCreatePostFormControllerParams {
  onPostCreated?: () => void;
}

export function useCreatePostFormController({ onPostCreated }: UseCreatePostFormControllerParams) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleImagesChange = (selectedFiles: FileList | null) => {
    if (!selectedFiles) {
      return;
    }

    const selected = Array.from(selectedFiles);
    const merged = [...images, ...selected];

    if (merged.length > MAX_IMAGES) {
      setError(`You can upload up to ${MAX_IMAGES} images per post`);
      return;
    }

    for (const image of selected) {
      if (!ALLOWED_IMAGE_TYPES.has(image.type)) {
        setError('Only JPG, PNG and GIF images are allowed');
        return;
      }

      if (image.size > MAX_IMAGE_BYTES) {
        setError('Each image must be 10MB or smaller');
        return;
      }
    }

    setError('');
    setImages(merged);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError('');
    setSuccess('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost({ title: title.trim(), content: content.trim(), images });
      setSuccess('Post created successfully!');
      setTitle('');
      setContent('');
      setImages([]);
      onPostCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    state: {
      title,
      content,
      images,
      isSubmitting,
      error,
      success,
      maxImages: MAX_IMAGES,
    },
    actions: {
      setTitle,
      setContent,
      handleImagesChange,
      handleRemoveImage,
      handleSubmit,
    },
  };
}
