import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createPost } from '../../services/posts';
import { CreatePostForm } from './CreatePostForm';

vi.mock('../../services/posts', () => ({
  createPost: vi.fn(),
}));

const mockedCreatePost = vi.mocked(createPost);

function createDeferredPromise<T>(result: T) {
  let resolve!: () => void;

  const promise = new Promise<T>((res) => {
    resolve = () => {
      res(result);
    };
  });

  return { promise, resolve };
}

describe('CreatePostForm', () => {
  it('shows pending feedback and prevents duplicate submission', async () => {
    const deferred = createDeferredPromise<{ id: string }>({ id: 'post-1' });
    const onPostCreated = vi.fn();
    mockedCreatePost.mockReturnValueOnce(deferred.promise as Promise<never>);

    render(<CreatePostForm onPostCreated={onPostCreated} />);

    fireEvent.change(screen.getByTestId('create-post-title-input'), {
      target: { value: 'New post' },
    });
    fireEvent.change(screen.getByTestId('create-post-content-input'), {
      target: { value: 'Post body' },
    });

    fireEvent.submit(screen.getByTestId('create-post-form'));
    fireEvent.submit(screen.getByTestId('create-post-form'));

    expect(mockedCreatePost).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('create-post-submit-button')).toBeDisabled();
    expect(screen.getByTestId('create-post-submit-button')).toHaveTextContent('Creating...');

    deferred.resolve();

    await waitFor(() => {
      expect(onPostCreated).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId('create-post-success-message')).toHaveTextContent(
      'Post created successfully!'
    );
  });
});
