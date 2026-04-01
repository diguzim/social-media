import type { Meta, StoryObj } from '@storybook/react';
import { Stack } from './Stack';

const meta: Meta<typeof Stack> = {
  title: 'Layout/Stack',
  component: Stack,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const DemoBox = ({ label }: { label: string }) => (
  <div className="bg-blue-100 border-2 border-blue-300 rounded p-4 text-center text-sm font-medium">
    {label}
  </div>
);

export const VerticalStack: Story = {
  args: {
    direction: 'vertical',
    gap: 'gap-4',
    children: (
      <>
        <DemoBox label="Item 1" />
        <DemoBox label="Item 2" />
        <DemoBox label="Item 3" />
      </>
    ),
  },
};

export const HorizontalStack: Story = {
  args: {
    direction: 'horizontal',
    gap: 'gap-4',
    children: (
      <>
        <DemoBox label="Left" />
        <DemoBox label="Center" />
        <DemoBox label="Right" />
      </>
    ),
  },
};

export const LargeGap: Story = {
  args: {
    direction: 'vertical',
    gap: 'gap-12',
    children: (
      <>
        <DemoBox label="Large gap (48px)" />
        <DemoBox label="Between items" />
        <DemoBox label="Bottom item" />
      </>
    ),
  },
};

export const CenteredContent: Story = {
  args: {
    direction: 'horizontal',
    gap: 'gap-6',
    align: 'center',
    justify: 'center',
    children: (
      <>
        <DemoBox label="Item 1" />
        <DemoBox label="Item 2" />
        <DemoBox label="Item 3" />
      </>
    ),
  },
};

export const SpaceBetween: Story = {
  args: {
    direction: 'horizontal',
    justify: 'between',
    align: 'center',
    children: (
      <>
        <DemoBox label="Logo" />
        <DemoBox label="Menu" />
        <DemoBox label="User" />
      </>
    ),
  },
};

export const VerticalAlignmentStart: Story = {
  args: {
    direction: 'vertical',
    gap: 'gap-3',
    align: 'start',
    children: (
      <>
        <DemoBox label="Aligned Start (left)" />
        <DemoBox label="Item 2" />
        <DemoBox label="Item 3" />
      </>
    ),
  },
};

export const VerticalAlignmentCenter: Story = {
  args: {
    direction: 'vertical',
    gap: 'gap-3',
    align: 'center',
    children: (
      <>
        <DemoBox label="Aligned Center" />
        <DemoBox label="Item 2" />
        <DemoBox label="Item 3" />
      </>
    ),
  },
};

export const VerticalAlignmentStretch: Story = {
  args: {
    direction: 'vertical',
    gap: 'gap-3',
    align: 'stretch',
    className: 'w-full',
    children: (
      <>
        <DemoBox label="Stretched Item" />
        <DemoBox label="Item 2" />
        <DemoBox label="Item 3" />
      </>
    ),
  },
};

export const SmallGap: Story = {
  args: {
    direction: 'horizontal',
    gap: 'gap-1',
    children: (
      <>
        <DemoBox label="A" />
        <DemoBox label="B" />
        <DemoBox label="C" />
        <DemoBox label="D" />
      </>
    ),
  },
};
