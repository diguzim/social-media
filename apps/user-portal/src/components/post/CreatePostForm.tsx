import { useState } from 'react';
import { createPost } from '../../services/posts';

interface CreatePostFormProps {
  onPostCreated?: () => void;
}

export function CreatePostForm({ onPostCreated }: CreatePostFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost({ title: title.trim(), content: content.trim() });
      setSuccess('Post created successfully!');
      setTitle('');
      setContent('');

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

        <button
          type="submit"
          data-testid="create-post-submit-button"
          disabled={isSubmitting}
          className="btn btn-primary w-full"
        >
          {isSubmitting ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </section>
  );
}
