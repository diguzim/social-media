import type { Meta, StoryObj } from '@storybook/react';
import { PendingButton } from './PendingButton';

const meta = {
  title: 'Loading/PendingButton',
  component: PendingButton,
  tags: ['autodocs'],
  args: {
    isPending: false,
    idleText: 'Submit',
    pendingText: 'Submitting...',
    className: 'btn-primary w-full',
    type: 'button',
  },
} satisfies Meta<typeof PendingButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Idle: Story = {};

export const Pending: Story = {
  args: {
    isPending: true,
  },
};
