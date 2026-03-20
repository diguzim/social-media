import type { Meta, StoryObj } from '@storybook/react';
import { LoadingBlock } from './LoadingBlock';

const meta = {
  title: 'Loading/LoadingBlock',
  component: LoadingBlock,
  tags: ['autodocs'],
  args: {
    height: '1rem',
    width: '100%',
    rounded: 'rounded-md',
  },
} satisfies Meta<typeof LoadingBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleLike: Story = {
  args: {
    height: '2rem',
    width: '55%',
  },
};

export const AvatarLike: Story = {
  args: {
    height: 56,
    width: 56,
    rounded: 'rounded-full',
  },
};
