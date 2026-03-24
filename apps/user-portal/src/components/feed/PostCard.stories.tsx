import type { Meta, StoryObj } from '@storybook/react';
import { PostCard } from './PostCard';

const meta: Meta<typeof PostCard> = {
  title: 'Components/PostCard',
  component: PostCard,
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const NotLiked: Story = {
  args: {
    post: {
      id: 'post-1',
      title: 'Getting Started with TypeScript',
      content:
        'TypeScript is a powerful tool for building large-scale JavaScript applications with type safety.',
      authorId: '1',
      author: { id: '1', name: 'Alice' },
      createdAt: '2025-01-10T08:00:00.000Z',
      reactions: { likeCount: 3, likedByMe: false },
    },
  },
};

export const Liked: Story = {
  args: {
    post: {
      id: 'post-2',
      title: 'Understanding Async/Await',
      content: 'Async/await makes asynchronous code much more readable and easier to reason about.',
      authorId: '1',
      author: { id: '1', name: 'Alice' },
      createdAt: '2025-01-11T09:30:00.000Z',
      reactions: { likeCount: 8, likedByMe: true },
    },
  },
};

export const NoReactions: Story = {
  args: {
    post: {
      id: 'post-3',
      title: 'NestJS Best Practices',
      content:
        'Learn how to structure your NestJS applications for scalability and maintainability.',
      authorId: '1',
      author: { id: '1', name: 'Alice' },
      createdAt: '2025-01-12T14:15:00.000Z',
    },
  },
};

export const ManyLikes: Story = {
  args: {
    post: {
      id: 'post-4',
      title: 'Docker for Developers',
      content:
        'Docker containers help ensure consistency between development and production environments.',
      authorId: '2',
      author: { id: '2', name: 'Bob' },
      createdAt: '2025-01-13T10:45:00.000Z',
      reactions: { likeCount: 42, likedByMe: false },
    },
  },
};

export const LikedWithManyLikes: Story = {
  args: {
    post: {
      id: 'post-5',
      title: 'Microservices Architecture',
      content:
        'Breaking down applications into microservices provides flexibility and independent scaling.',
      authorId: '2',
      author: { id: '2', name: 'Bob' },
      createdAt: '2025-01-14T11:20:00.000Z',
      reactions: { likeCount: 128, likedByMe: true },
    },
  },
};
