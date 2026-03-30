import { useState, FormEvent } from 'react';
import { createPost } from '../../services/posts';
import { PendingButton } from '../loading/PendingButton';

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const MAX_IMAGES = 10;
  const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
  const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif']);

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

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

      // Notify parent component to refresh feed
      if (onPostCreated) {
        onPostCreated();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section data-testid="create-post-section" className="card px-6 py-5">
      <h2 className="mb-4 text-2xl font-semibold text-slate-900">Create a Post</h2>

      <form data-testid="create-post-form" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="post-title" className="mb-2 block text-sm font-medium text-slate-700">
            Title
          </label>
          <input
            id="post-title"
            data-testid="create-post-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-md border border-slate-300 px-4 py-2 text-slate-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="Enter post title"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="post-content" className="mb-2 block text-sm font-medium text-slate-700">
            Content
          </label>
          <textarea
            id="post-content"
            data-testid="create-post-content-input"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSubmitting}
            rows={4}
            className="w-full rounded-md border border-slate-300 px-4 py-2 text-slate-900 transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-slate-100 disabled:text-slate-500"
            placeholder="What's on your mind?"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="post-images" className="mb-2 block text-sm font-medium text-slate-700">
            Images (optional)
          </label>
          <input
            id="post-images"
            data-testid="create-post-images-input"
            type="file"
            accept="image/jpeg,image/png,image/gif"
            multiple
            disabled={isSubmitting}
            onChange={(e) => handleImagesChange(e.target.files)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-primary-50 file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100 disabled:bg-slate-100"
          />
          <p className="mt-1 text-xs text-slate-500">
            Up to 10 images • JPG, PNG, GIF • max 10MB each
          </p>

          {images.length > 0 && (
            <ul data-testid="create-post-images-list" className="mt-2 space-y-1">
              {images.map((image, index) => (
                <li
                  key={`${image.name}-${index}`}
                  className="flex items-center justify-between rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs text-slate-700"
                >
                  <span className="truncate">{image.name}</span>
                  <button
                    type="button"
                    data-testid={`create-post-remove-image-${index}`}
                    onClick={() => handleRemoveImage(index)}
                    className="ml-2 shrink-0 text-danger-600 hover:underline"
                    disabled={isSubmitting}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {error && (
          <p data-testid="create-post-error-message" className="status-error mb-4">
            {error}
          </p>
        )}

        {success && (
          <p data-testid="create-post-success-message" className="status-success mb-4">
            {success}
          </p>
        )}

        <PendingButton
          type="submit"
          data-testid="create-post-submit-button"
          isPending={isSubmitting}
          idleText="Create Post"
          pendingText="Creating..."
          className="btn btn-primary w-full"
        />
      </form>
    </section>
  );
}
