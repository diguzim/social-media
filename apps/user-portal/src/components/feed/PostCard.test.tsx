import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { ToggleReactionResponse } from '@repo/contracts/api';
import { PostCard } from './PostCard';
import * as postsService from '../../services/posts';

vi.mock('../../services/posts', () => ({
  togglePostReaction: vi.fn(),
}));

describe('PostCard', () => {
  it('renders post content and metadata', () => {
    render(
      <PostCard
        post={{
          id: 'post-1',
          title: 'My first post',
          content: 'Hello feed!',
          authorId: 'user-1',
          author: { id: 'user-1', name: 'Alice' },
          createdAt: '2026-03-07T10:00:00.000Z',
        }}
      />
    );

    expect(screen.getByTestId('post-title-post-1')).toHaveTextContent('My first post');
    expect(screen.getByTestId('post-content-post-1')).toHaveTextContent('Hello feed!');
    expect(screen.getByTestId('post-author-post-1')).toHaveTextContent('Author: Alice');
    expect(screen.getByTestId('post-created-at-post-1')).toBeInTheDocument();
  });

  it('renders author name from enriched post', () => {
    render(
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

    expect(screen.getByTestId('post-author-post-2')).toHaveTextContent('Author: Bob');
  });

  describe('Like button', () => {
    it('renders like button with initial state (not liked)', () => {
      render(
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
      render(
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

      render(
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

      render(
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

      render(
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
});
