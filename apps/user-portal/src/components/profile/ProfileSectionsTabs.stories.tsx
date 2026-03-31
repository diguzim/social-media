import type { Meta, StoryObj } from '@storybook/react';
import { PROFILE_SECTION_TABS, ProfileSectionsTabs } from './ProfileSectionsTabs';

const meta: Meta<typeof ProfileSectionsTabs> = {
  title: 'Profile/ProfileSectionsTabs',
  component: ProfileSectionsTabs,
  args: {
    tabs: PROFILE_SECTION_TABS,
    testIdPrefix: 'storybook-profile-sections',
    activeSection: 'timeline',
    onChange: () => {
      // no-op story callback
    },
  },
};

export default meta;

type Story = StoryObj<typeof ProfileSectionsTabs>;

export const TimelineActive: Story = {};

export const FriendsActive: Story = {
  args: {
    activeSection: 'friends',
  },
};
