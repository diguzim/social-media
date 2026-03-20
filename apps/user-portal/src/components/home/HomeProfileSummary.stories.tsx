import type { Meta, StoryObj } from '@storybook/react';
import { HomeProfileSummary } from './HomeProfileSummary';

const baseUser = {
  id: 'user-123',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  emailVerifiedAt: '2026-03-20T12:00:00.000Z',
};

const meta = {
  title: 'Home/HomeProfileSummary',
  component: HomeProfileSummary,
  tags: ['autodocs'],
  args: {
    user: baseUser,
    isLoading: false,
    isRefreshing: false,
    error: '',
  },
} satisfies Meta<typeof HomeProfileSummary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ready: Story = {};

export const LoadingWithoutCache: Story = {
  args: {
    user: null,
    isLoading: true,
  },
};

export const RefreshingWithCache: Story = {
  args: {
    user: baseUser,
    isRefreshing: true,
  },
};

export const CachedWithRefreshError: Story = {
  args: {
    user: baseUser,
    error: 'Failed to fetch profile',
  },
};
