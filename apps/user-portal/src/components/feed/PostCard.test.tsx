import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import type { ReactElement } from 'react';
import type { ToggleReactionResponse } from '@repo/contracts/api';
import { PostCard } from './PostCard';
import * as postsService from '../../services/posts';

vi.mock('../../services/posts', () => ({
  addPostImages: vi.fn(),
  togglePostReaction: vi.fn(),
  updatePost: vi.fn(),
  deletePost: vi.fn(),
  removePostImage: vi.fn(),
  reorderPostImages: vi.fn(),
  sortPostImages: vi.fn((images: unknown[] | undefined) => (images ? [...images] : [])),
  getPostComments: vi.fn(),
  createPostComment: vi.fn(),
  updatePostComment: vi.fn(),
  deletePostComment: vi.fn(),
}));

function renderWithRouter(ui: ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('PostCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'user',
      JSON.stringify({
        id: 'user-1',
        name: 'Alice',
        username: 'alice',
        email: 'alice@example.com',
      })
    );

    vi.mocked(postsService.getPostComments).mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 50,
      totalPages: 1,
    });
  });

  it('renders post content and metadata', () => {
    renderWithRouter(
      <PostCard
        post={{
          id: 'post-1',
          title: 'My first post',
          content: 'Hello feed!',
          authorId: 'user-1',
          author: {
            id: 'user-1',
            name: 'Alice',
            avatarUrl: 'http://localhost:4000/users/user-1/avatar',
          },
          createdAt: '2026-03-07T10:00:00.000Z',
        }}
      />
    );

    expect(screen.getByTestId('post-title-post-1')).toHaveTextContent('My first post');
    expect(screen.getByTestId('post-content-post-1')).toHaveTextContent('Hello feed!');
    expect(screen.getByTestId('post-author-link-post-1')).toHaveTextContent('Alice');
    expect(screen.getByTestId('post-author-avatar-post-1')).toBeInTheDocument();
    expect(screen.getByTestId('post-created-at-post-1')).toBeInTheDocument();
  });

  it('renders author fallback avatar when avatarUrl is missing', () => {
    renderWithRouter(
      <PostCard
        post={{
          id: 'post-2',
          title: 'Enriched post',
          content: 'With author details',
          authorId: 'user-2',
          author: { id: 'user-2', name: 'Bob' },
          createdAt: '2026-03-07T10:00:00.000Z',
        }}
      />
    );

    expect(screen.getByTestId('post-author-link-post-2')).toHaveTextContent('Bob');
    expect(screen.getByTestId('post-author-avatar-fallback-post-2')).toHaveTextContent('B');
  });

  describe('Post management', () => {
    it('shows edit/delete controls only for post owner', () => {
      renderWithRouter(
        <PostCard
          post={{
            id: 'post-manage-1',
            title: 'Owner post',
            content: 'Owner content',
            authorId: 'user-1',
            author: { id: 'user-1', name: 'Alice' },
            createdAt: '2026-03-07T10:00:00.000Z',
          }}
        />
      );

      expect(screen.getByTestId('post-edit-post-manage-1')).toBeInTheDocument();
      expect(screen.getByTestId('post-delete-post-manage-1')).toBeInTheDocument();
    });

    it('hides edit/delete controls for non-owner posts', () => {
      renderWithRouter(
        <PostCard
          post={{
            id: 'post-manage-2',
            title: 'Not mine',
            content: 'Other user content',
            authorId: 'user-2',
            author: { id: 'user-2', name: 'Bob' },
            createdAt: '2026-03-07T10:00:00.000Z',
          }}
        />
      );

      expect(screen.queryByTestId('post-edit-post-manage-2')).not.toBeInTheDocument();
      expect(screen.queryByTestId('post-delete-post-manage-2')).not.toBeInTheDocument();
    });

    it('edits title/content and saves post', async () => {
      vi.mocked(postsService.updatePost).mockResolvedValue({
        id: 'post-manage-3',
        title: 'Updated title',
        content: 'Updated content',
        authorId: 'user-1',
        createdAt: '2026-03-07T10:00:00.000Z',
        images: [],
      });

      const onReactionChange = vi.fn();

      renderWithRouter(
        <PostCard
          post={{
            id: 'post-manage-3',
            title: 'Original title',
            content: 'Original content',
            authorId: 'user-1',
            author: { id: 'user-1', name: 'Alice' },
            createdAt: '2026-03-07T10:00:00.000Z',
          }}
          onReactionChange={onReactionChange}
        />
      );

      fireEvent.click(screen.getByTestId('post-edit-post-manage-3'));

      fireEvent.change(screen.getByTestId('post-edit-title-input-post-manage-3'), {
        target: { value: '  Updated title  ' },
      });
      fireEvent.change(screen.getByTestId('post-edit-content-input-post-manage-3'), {
        target: { value: '  Updated content  ' },
      });

      fireEvent.click(screen.getByTestId('post-save-post-manage-3'));

      await waitFor(() => {
        expect(postsService.updatePost).toHaveBeenCalledWith('post-manage-3', {
          title: 'Updated title',
          content: 'Updated content',
        });
      });

      expect(screen.getByTestId('post-title-post-manage-3')).toHaveTextContent('Updated title');
      expect(screen.getByTestId('post-content-post-manage-3')).toHaveTextContent('Updated content');
      expect(onReactionChange).toHaveBeenCalledTimes(1);
    });

    it('deletes post after confirmation and shows deleted state', async () => {
      vi.mocked(postsService.deletePost).mockResolvedValue({ success: true });
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      renderWithRouter(
        <PostCard
          post={{
            id: 'post-manage-4',
            title: 'Delete me',
            content: 'Delete content',
            authorId: 'user-1',
            author: { id: 'user-1', name: 'Alice' },
            createdAt: '2026-03-07T10:00:00.000Z',
          }}
        />
      );

      fireEvent.click(screen.getByTestId('post-delete-post-manage-4'));

      await waitFor(() => {
        expect(postsService.deletePost).toHaveBeenCalledWith('post-manage-4');
      });

      expect(screen.getByTestId('post-deleted-post-manage-4')).toBeInTheDocument();
      confirmSpy.mockRestore();
    });

    it('removes selected existing image on save', async () => {
      vi.mocked(postsService.updatePost).mockResolvedValue({
        id: 'post-manage-5',
        title: 'Image post',
        content: 'Image content',
        authorId: 'user-1',
        createdAt: '2026-03-07T10:00:00.000Z',
        images: [
          {
            id: 'img-1',
            imageUrl: 'http://localhost:4000/posts/post-manage-5/images/img-1',
            mimeType: 'image/png',
            orderIndex: 0,
            uploadedAt: '2026-03-07T10:00:00.000Z',
          },
          {
            id: 'img-2',
            imageUrl: 'http://localhost:4000/posts/post-manage-5/images/img-2',
            mimeType: 'image/png',
            orderIndex: 1,
            uploadedAt: '2026-03-07T10:00:00.000Z',
          },
        ],
      });
      vi.mocked(postsService.removePostImage).mockResolvedValue({
        id: 'post-manage-5',
        title: 'Image post',
        content: 'Image content',
        authorId: 'user-1',
        createdAt: '2026-03-07T10:00:00.000Z',
        images: [
          {
            id: 'img-2',
            imageUrl: 'http://localhost:4000/posts/post-manage-5/images/img-2',
            mimeType: 'image/png',
            orderIndex: 0,
            uploadedAt: '2026-03-07T10:00:00.000Z',
          },
        ],
      });

      renderWithRouter(
        <PostCard
          post={{
            id: 'post-manage-5',
            title: 'Image post',
            content: 'Image content',
            authorId: 'user-1',
            author: { id: 'user-1', name: 'Alice' },
            createdAt: '2026-03-07T10:00:00.000Z',
            images: [
              {
                id: 'img-1',
                imageUrl: 'http://localhost:4000/posts/post-manage-5/images/img-1',
                mimeType: 'image/png',
                orderIndex: 0,
                uploadedAt: '2026-03-07T10:00:00.000Z',
              },
              {
                id: 'img-2',
                imageUrl: 'http://localhost:4000/posts/post-manage-5/images/img-2',
                mimeType: 'image/png',
                orderIndex: 1,
                uploadedAt: '2026-03-07T10:00:00.000Z',
              },
            ],
          }}
        />
      );

      fireEvent.click(screen.getByTestId('post-edit-post-manage-5'));
      fireEvent.click(screen.getByTestId('post-edit-image-remove-post-manage-5-0'));
      fireEvent.click(screen.getByTestId('post-save-post-manage-5'));

      await waitFor(() => {
        expect(postsService.removePostImage).toHaveBeenCalledWith('post-manage-5', 'img-1');
      });
    });

    it('reorders existing images on save when drag order changes', async () => {
      vi.mocked(postsService.updatePost).mockResolvedValue({
        id: 'post-manage-6',
        title: 'Image order',
        content: 'Image order content',
        authorId: 'user-1',
        createdAt: '2026-03-07T10:00:00.000Z',
        images: [
          {
            id: 'img-1',
            imageUrl: 'http://localhost:4000/posts/post-manage-6/images/img-1',
            mimeType: 'image/png',
            orderIndex: 0,
            uploadedAt: '2026-03-07T10:00:00.000Z',
          },
          {
            id: 'img-2',
            imageUrl: 'http://localhost:4000/posts/post-manage-6/images/img-2',
            mimeType: 'image/png',
            orderIndex: 1,
            uploadedAt: '2026-03-07T10:00:00.000Z',
          },
        ],
      });
      vi.mocked(postsService.reorderPostImages).mockResolvedValue({
        id: 'post-manage-6',
        title: 'Image order',
        content: 'Image order content',
        authorId: 'user-1',
        createdAt: '2026-03-07T10:00:00.000Z',
        images: [
          {
            id: 'img-2',
            imageUrl: 'http://localhost:4000/posts/post-manage-6/images/img-2',
            mimeType: 'image/png',
            orderIndex: 0,
            uploadedAt: '2026-03-07T10:00:00.000Z',
          },
          {
            id: 'img-1',
            imageUrl: 'http://localhost:4000/posts/post-manage-6/images/img-1',
            mimeType: 'image/png',
            orderIndex: 1,
            uploadedAt: '2026-03-07T10:00:00.000Z',
          },
        ],
      });

      renderWithRouter(
        <PostCard
          post={{
            id: 'post-manage-6',
            title: 'Image order',
            content: 'Image order content',
            authorId: 'user-1',
            author: { id: 'user-1', name: 'Alice' },
            createdAt: '2026-03-07T10:00:00.000Z',
            images: [
              {
                id: 'img-1',
                imageUrl: 'http://localhost:4000/posts/post-manage-6/images/img-1',
                mimeType: 'image/png',
                orderIndex: 0,
                uploadedAt: '2026-03-07T10:00:00.000Z',
              },
              {
                id: 'img-2',
                imageUrl: 'http://localhost:4000/posts/post-manage-6/images/img-2',
                mimeType: 'image/png',
                orderIndex: 1,
                uploadedAt: '2026-03-07T10:00:00.000Z',
              },
            ],
          }}
        />
      );

      fireEvent.click(screen.getByTestId('post-edit-post-manage-6'));

      const firstImage = screen.getByTestId('post-edit-image-item-post-manage-6-0');
      const secondImage = screen.getByTestId('post-edit-image-item-post-manage-6-1');

      fireEvent.dragStart(firstImage);
      fireEvent.dragOver(secondImage);
      fireEvent.drop(secondImage);

      fireEvent.click(screen.getByTestId('post-save-post-manage-6'));

      await waitFor(() => {
        expect(postsService.reorderPostImages).toHaveBeenCalledWith('post-manage-6', {
          imageOrder: ['img-2', 'img-1'],
        });
      });
    });
  });

  describe('Like button', () => {
    it('renders like button with initial state (not liked)', () => {
      renderWithRouter(
        <PostCard
          post={{
            id: 'post-3',
            title: 'Likeable post',
            content: 'Like me!',
            authorId: 'user-3',
            author: { id: 'user-3', name: 'Charlie' },
            createdAt: '2026-03-07T10:00:00.000Z',
            reactions: { likeCount: 2, likedByMe: false },
          }}
        />
      );

      const likeButton = screen.getByTestId('like-button-post-3');
      expect(likeButton).toHaveTextContent('🤍 Like');
      expect(screen.getByTestId('like-count-post-3')).toHaveTextContent('2');
    });

    it('renders like button with liked state', () => {
      renderWithRouter(
        <PostCard
          post={{
            id: 'post-4',
            title: 'Already liked',
            content: 'I liked this',
            authorId: 'user-4',
            author: { id: 'user-4', name: 'Diana' },
            createdAt: '2026-03-07T10:00:00.000Z',
            reactions: { likeCount: 5, likedByMe: true },
          }}
        />
      );

      const likeButton = screen.getByTestId('like-button-post-4');
      expect(likeButton).toHaveTextContent('❤️ Liked');
      expect(screen.getByTestId('like-count-post-4')).toHaveTextContent('5');
    });

    it('updates like count and state when like button is clicked', async () => {
      vi.mocked(postsService.togglePostReaction).mockResolvedValue({
        reactionId: 'reaction-1',
        targetId: 'post-5',
        reactionType: 'like',
        targetType: 'post',
        isAdded: true,
      });

      renderWithRouter(
        <PostCard
          post={{
            id: 'post-5',
            title: 'Click me',
            content: 'Likeable',
            authorId: 'user-5',
            author: { id: 'user-5', name: 'Eve' },
            createdAt: '2026-03-07T10:00:00.000Z',
            reactions: { likeCount: 0, likedByMe: false },
          }}
        />
      );

      const likeButton = screen.getByTestId('like-button-post-5');
      expect(likeButton).toHaveTextContent('🤍 Like');
      expect(screen.getByTestId('like-count-post-5')).toHaveTextContent('0');

      // Click like
      fireEvent.click(likeButton);

      // Optimistic update visible immediately
      expect(screen.getByTestId('like-count-post-5')).toHaveTextContent('1');
      expect(likeButton).toHaveTextContent('...');

      // Wait for API call
      await waitFor(() => {
        expect(postsService.togglePostReaction).toHaveBeenCalledWith('post-5');
      });

      // Final state after request completes
      expect(likeButton).toHaveTextContent('❤️ Liked');
    });

    it('disables button while request is in flight', async () => {
      let resolveRequest: (value: ToggleReactionResponse) => void;
      const requestPromise = new Promise<ToggleReactionResponse>((resolve) => {
        resolveRequest = resolve;
      });

      vi.mocked(postsService.togglePostReaction).mockImplementation(() => requestPromise);

      renderWithRouter(
        <PostCard
          post={{
            id: 'post-6',
            title: 'Slow network',
            content: 'Test pending state',
            authorId: 'user-6',
            author: { id: 'user-6', name: 'Frank' },
            createdAt: '2026-03-07T10:00:00.000Z',
            reactions: { likeCount: 3, likedByMe: false },
          }}
        />
      );

      const likeButton = screen.getByTestId('like-button-post-6');
      expect(likeButton).toHaveTextContent('🤍 Like');

      fireEvent.click(likeButton);

      // Button is disabled immediately
      expect(likeButton).toBeDisabled();
      // Optimistic update is visible
      expect(screen.getByTestId('like-count-post-6')).toHaveTextContent('4');
      expect(likeButton).toHaveTextContent('...');

      // Resolve the request
      resolveRequest!({
        reactionId: 'reaction-1',
        targetId: 'post-6',
        reactionType: 'like',
        targetType: 'post',
        isAdded: true,
      });

      // Wait for request to complete
      await waitFor(() => {
        expect(likeButton).not.toBeDisabled();
      });

      expect(likeButton).toHaveTextContent('❤️ Liked');
    });

    it('calls onReactionChange callback after successful toggle', async () => {
      const onReactionChange = vi.fn();

      vi.mocked(postsService.togglePostReaction).mockResolvedValue({
        reactionId: 'reaction-1',
        targetId: 'post-7',
        reactionType: 'like',
        targetType: 'post',
        isAdded: true,
      });

      renderWithRouter(
        <PostCard
          post={{
            id: 'post-7',
            title: 'Post with callback',
            content: 'Test callback',
            authorId: 'user-7',
            author: { id: 'user-7', name: 'Grace' },
            createdAt: '2026-03-07T10:00:00.000Z',
            reactions: { likeCount: 0, likedByMe: false },
          }}
          onReactionChange={onReactionChange}
        />
      );

      const likeButton = screen.getByTestId('like-button-post-7');
      fireEvent.click(likeButton);

      await waitFor(() => {
        expect(onReactionChange).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Comments', () => {
    it('loads comments when opening comments section', async () => {
      vi.mocked(postsService.getPostComments).mockResolvedValue({
        data: [
          {
            id: 'comment-1',
            postId: 'post-comments-1',
            authorId: 'user-2',
            content: 'Great post!',
            createdAt: '2026-03-07T10:00:00.000Z',
            updatedAt: undefined,
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
        totalPages: 1,
      });

      renderWithRouter(
        <PostCard
          post={{
            id: 'post-comments-1',
            title: 'Post with comments',
            content: 'Content',
            authorId: 'user-1',
            author: { id: 'user-1', name: 'Alice' },
            createdAt: '2026-03-07T10:00:00.000Z',
          }}
        />
      );

      fireEvent.click(screen.getByTestId('comments-open-post-comments-1'));

      await waitFor(() => {
        expect(postsService.getPostComments).toHaveBeenCalledWith('post-comments-1', {
          page: 1,
          limit: 50,
          sortOrder: 'asc',
        });
      });

      expect(screen.getByTestId('comments-list-post-comments-1')).toHaveTextContent('Great post!');
    });

    it('creates a new comment and reloads comments list', async () => {
      vi.mocked(postsService.createPostComment).mockResolvedValue({
        id: 'comment-2',
        postId: 'post-comments-2',
        authorId: 'user-1',
        content: 'My comment',
        createdAt: '2026-03-07T10:00:00.000Z',
        updatedAt: undefined,
      });

      vi.mocked(postsService.getPostComments)
        .mockResolvedValueOnce({
          data: [],
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 1,
        })
        .mockResolvedValueOnce({
          data: [
            {
              id: 'comment-2',
              postId: 'post-comments-2',
              authorId: 'user-1',
              content: 'My comment',
              createdAt: '2026-03-07T10:00:00.000Z',
              updatedAt: undefined,
            },
          ],
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        });

      renderWithRouter(
        <PostCard
          post={{
            id: 'post-comments-2',
            title: 'Post with create comment',
            content: 'Content',
            authorId: 'user-1',
            author: { id: 'user-1', name: 'Alice' },
            createdAt: '2026-03-07T10:00:00.000Z',
          }}
        />
      );

      fireEvent.click(screen.getByTestId('comments-open-post-comments-2'));
      fireEvent.change(screen.getByTestId('comment-input-post-comments-2'), {
        target: { value: 'My comment' },
      });
      fireEvent.click(screen.getByTestId('comment-submit-post-comments-2'));

      await waitFor(() => {
        expect(postsService.createPostComment).toHaveBeenCalledWith('post-comments-2', {
          content: 'My comment',
        });
      });

      await waitFor(() => {
        expect(screen.getByTestId('comments-list-post-comments-2')).toHaveTextContent('My comment');
      });
    });

    it('updates and deletes own comment', async () => {
      vi.mocked(postsService.updatePostComment).mockResolvedValue({
        id: 'comment-owner',
        postId: 'post-comments-3',
        authorId: 'user-1',
        content: 'Edited by owner',
        createdAt: '2026-03-07T10:00:00.000Z',
        updatedAt: '2026-03-07T11:00:00.000Z',
      });
      vi.mocked(postsService.deletePostComment).mockResolvedValue({ success: true });

      vi.mocked(postsService.getPostComments)
        .mockResolvedValueOnce({
          data: [
            {
              id: 'comment-owner',
              postId: 'post-comments-3',
              authorId: 'user-1',
              content: 'Original owner comment',
              createdAt: '2026-03-07T10:00:00.000Z',
              updatedAt: undefined,
            },
          ],
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        })
        .mockResolvedValueOnce({
          data: [
            {
              id: 'comment-owner',
              postId: 'post-comments-3',
              authorId: 'user-1',
              content: 'Edited by owner',
              createdAt: '2026-03-07T10:00:00.000Z',
              updatedAt: '2026-03-07T11:00:00.000Z',
            },
          ],
          total: 1,
          page: 1,
          limit: 50,
          totalPages: 1,
        })
        .mockResolvedValueOnce({
          data: [],
          total: 0,
          page: 1,
          limit: 50,
          totalPages: 1,
        });

      renderWithRouter(
        <PostCard
          post={{
            id: 'post-comments-3',
            title: 'Post with owner comment actions',
            content: 'Content',
            authorId: 'user-1',
            author: { id: 'user-1', name: 'Alice' },
            createdAt: '2026-03-07T10:00:00.000Z',
          }}
        />
      );

      fireEvent.click(screen.getByTestId('comments-open-post-comments-3'));

      await waitFor(() => {
        expect(screen.getByText('Original owner comment')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('comment-edit-post-comments-3-comment-owner'));
      fireEvent.change(screen.getByTestId('comment-edit-input-post-comments-3-comment-owner'), {
        target: { value: 'Edited by owner' },
      });
      fireEvent.click(screen.getByTestId('comment-edit-save-post-comments-3-comment-owner'));

      await waitFor(() => {
        expect(postsService.updatePostComment).toHaveBeenCalledWith(
          'post-comments-3',
          'comment-owner',
          { content: 'Edited by owner' }
        );
      });

      fireEvent.click(screen.getByTestId('comment-delete-post-comments-3-comment-owner'));

      await waitFor(() => {
        expect(postsService.deletePostComment).toHaveBeenCalledWith(
          'post-comments-3',
          'comment-owner'
        );
      });

      await waitFor(() => {
        expect(screen.getByTestId('comments-empty-post-comments-3')).toBeInTheDocument();
      });
    });
  });
});
