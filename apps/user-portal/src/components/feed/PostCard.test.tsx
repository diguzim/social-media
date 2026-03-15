import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PostCard } from './PostCard';

describe('PostCard', () => {
  it('renders post content and metadata (fallback authorId)', () => {
    render(
      <PostCard
        post={{
          id: 'post-1',
          title: 'My first post',
          content: 'Hello feed!',
          authorId: 'user-1',
          createdAt: '2026-03-07T10:00:00.000Z',
        }}
      />
    );

    expect(screen.getByTestId('post-title-post-1')).toHaveTextContent('My first post');
    expect(screen.getByTestId('post-content-post-1')).toHaveTextContent('Hello feed!');
    expect(screen.getByTestId('post-author-post-1')).toHaveTextContent('Author: user-1');
    expect(screen.getByTestId('post-created-at-post-1')).toBeInTheDocument();
  });

  it('renders author name when post is enriched', () => {
    render(
      <PostCard
        post={{
          id: 'post-2',
          title: 'Enriched post',
          content: 'With author details',
          authorId: 'user-2',
          author: { id: 'user-2', name: 'Alice' },
          createdAt: '2026-03-07T10:00:00.000Z',
        }}
      />
    );

    expect(screen.getByTestId('post-author-post-2')).toHaveTextContent('Author: Alice');
  });
});
