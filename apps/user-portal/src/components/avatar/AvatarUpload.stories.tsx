import type { Meta, StoryObj } from '@storybook/react';
import { AvatarUpload } from './AvatarUpload';

const meta = {
  title: 'Avatar/AvatarUpload',
  component: AvatarUpload,
  tags: ['autodocs'],
  args: {
    isUploading: false,
    error: '',
    onUpload: async () => Promise.resolve(),
  },
} satisfies Meta<typeof AvatarUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Uploading: Story = {
  args: {
    isUploading: true,
  },
};

export const WithError: Story = {
  args: {
    error: 'Only JPG and PNG images are allowed.',
  },
};
