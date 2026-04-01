import type { Meta, StoryObj } from '@storybook/react';
import { Container } from './Container';

const meta: Meta<typeof Container> = {
  title: 'Layout/Container',
  component: Container,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-gray-600">
          This content is wrapped in a Container with default max-width (6xl) and responsive
          padding.
        </p>
        <p className="text-sm text-gray-500">
          On mobile: px-4 py-10. Responsive breakpoints expand padding as viewport grows.
        </p>
      </div>
    ),
  },
};

export const SmallMaxWidth: Story = {
  args: {
    maxWidth: 'sm',
    children: (
      <div className="space-y-4 bg-blue-50 p-4 rounded">
        <h2 className="text-2xl font-bold">Small Container (sm: 24rem)</h2>
        <p className="text-gray-600">Perfect for modal or narrow forms.</p>
      </div>
    ),
  },
};

export const LargeMaxWidth: Story = {
  args: {
    maxWidth: '7xl',
    children: (
      <div className="space-y-4 bg-green-50 p-4 rounded">
        <h2 className="text-2xl font-bold">Large Container (7xl: 80rem)</h2>
        <p className="text-gray-600">Good for wide dashboard or gallery layouts.</p>
      </div>
    ),
  },
};

export const FullWidth: Story = {
  args: {
    maxWidth: 'full',
    children: (
      <div className="space-y-4 bg-yellow-50 p-4 rounded">
        <h2 className="text-2xl font-bold">Full Width Container</h2>
        <p className="text-gray-600">Stretches to viewport edges (with padding).</p>
      </div>
    ),
  },
};

export const CustomPadding: Story = {
  args: {
    maxWidth: 'lg',
    padding: 'px-8 py-16',
    children: (
      <div className="space-y-4 bg-purple-50 p-4 rounded">
        <h2 className="text-2xl font-bold">Custom Padding</h2>
        <p className="text-gray-600">px-8 py-16 (32px horizontal, 64px vertical).</p>
      </div>
    ),
  },
};

export const ResponsiveBehavior: Story = {
  args: {
    maxWidth: '4xl',
    children: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Resize the viewport to see responsive behavior</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-100 p-4 rounded text-center">
              Card {i}
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-500">Mobile: 1 column | sm+: 2 columns | md+: 3 columns</p>
      </div>
    ),
  },
};
