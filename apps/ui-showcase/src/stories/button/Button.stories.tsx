import type { Meta, StoryObj } from "@storybook/react";
import { Button, Stack } from "@repo/ui";

const meta = {
  title: "Button/Button",
  component: Button,
  tags: ["autodocs"],
  args: {
    children: "Action",
    variant: "primary",
    size: "md",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

export const Variants: Story = {
  render: () => (
    <Stack direction="horizontal" gap="gap-2" className="flex-wrap">
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="toggle">Toggle</Button>
      <Button variant="toggle" pressed>
        Toggle active
      </Button>
    </Stack>
  ),
};

export const Sizes: Story = {
  render: () => (
    <Stack direction="horizontal" gap="gap-2" align="center">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </Stack>
  ),
};

export const Pending: Story = {
  args: {
    isPending: true,
    pendingText: "Saving...",
    children: "Save",
  },
};

export const FullWidth: Story = {
  render: () => (
    <div className="w-[320px]">
      <Button fullWidth>Continue</Button>
    </div>
  ),
};
