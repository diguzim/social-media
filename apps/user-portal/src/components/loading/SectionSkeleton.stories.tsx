import type { Meta, StoryObj } from '@storybook/react';
import { SectionSkeleton } from './SectionSkeleton';

const meta = {
  title: 'Loading/SectionSkeleton',
  component: SectionSkeleton,
  tags: ['autodocs'],
  args: {
    title: 'Loading section',
    variant: 'card',
    lines: 3,
    minHeight: 220,
  },
} satisfies Meta<typeof SectionSkeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Profile: Story = {
  args: {
    title: 'Loading profile',
    variant: 'profile',
  },
};

export const Form: Story = {
  args: {
    title: 'Create a Post',
    variant: 'form',
  },
};

export const List: Story = {
  args: {
    title: 'Feed',
    variant: 'list',
    lines: 4,
    minHeight: 320,
  },
};
