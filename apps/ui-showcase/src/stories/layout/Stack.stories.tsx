import type { Meta, StoryObj } from "@storybook/react";
import { Stack } from "@repo/ui";

const meta: Meta<typeof Stack> = {
  title: "Layout/Stack",
  component: Stack,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const DemoBox = ({ label }: { label: string }) => (
  <div className="rounded border-2 border-blue-300 bg-blue-100 p-4 text-center text-sm font-medium">
    {label}
  </div>
);

export const VerticalStack: Story = {
  args: {
    direction: "vertical",
    gap: "gap-4",
    children: (
      <>
        <DemoBox label="Item 1" />
        <DemoBox label="Item 2" />
        <DemoBox label="Item 3" />
      </>
    ),
  },
};

export const ResponsiveDirection: Story = {
  args: {
    direction: { base: "vertical", md: "horizontal" },
    gap: { base: "gap-3", md: "gap-6" },
    align: { base: "stretch", md: "center" },
    children: (
      <>
        <DemoBox label="First" />
        <DemoBox label="Second" />
        <DemoBox label="Third" />
      </>
    ),
  },
};
