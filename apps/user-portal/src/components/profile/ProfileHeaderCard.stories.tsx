import type { Meta, StoryObj } from '@storybook/react';
import { ProfileHeaderCard } from './ProfileHeaderCard';

const meta: Meta<typeof ProfileHeaderCard> = {
  title: 'Profile/ProfileHeaderCard',
  component: ProfileHeaderCard,
  args: {
    cardTestId: 'storybook-profile-card',
    avatarTestId: 'storybook-profile-avatar',
    nameTestId: 'storybook-profile-name',
    usernameTestId: 'storybook-profile-username',
    statsTestId: 'storybook-profile-stats',
    comingSoonTestId: 'storybook-profile-coming-soon',
    name: 'Eve Wilson',
    username: 'eve',
    postsCount: 42,
  },
};

export default meta;
type Story = StoryObj<typeof ProfileHeaderCard>;

export const Default: Story = {};

export const WithoutAvatar: Story = {
  args: {
    avatarUrl: undefined,
  },
};
