import type { Meta, StoryObj } from "@storybook/react";
import { Container } from "@repo/ui";

const meta: Meta<typeof Container> = {
  title: "Layout/Container",
  component: Container,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Welcome</h1>
        <p className="text-gray-600">
          This content is wrapped in a Container with default max-width (6xl)
          and responsive padding.
        </p>
      </div>
    ),
  },
};

export const SmallMaxWidth: Story = {
  args: {
    maxWidth: "sm",
    children: (
      <div className="space-y-4 rounded bg-blue-50 p-4">
        <h2 className="text-2xl font-bold">Small Container (sm: 24rem)</h2>
        <p className="text-gray-600">Perfect for modal or narrow forms.</p>
      </div>
    ),
  },
};

export const ResponsiveMaxWidth: Story = {
  args: {
    maxWidth: { base: "sm", md: "4xl", xl: "6xl" },
    children: (
      <div className="space-y-4 rounded bg-slate-100 p-4">
        <h2 className="text-2xl font-bold">Responsive Max Width</h2>
        <p className="text-gray-600">base: sm, md+: 4xl, xl+: 6xl</p>
      </div>
    ),
  },
};
