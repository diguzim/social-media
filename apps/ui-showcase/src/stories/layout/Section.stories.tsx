import type { Meta, StoryObj } from "@storybook/react";
import { Section } from "@repo/ui";

const meta: Meta<typeof Section> = {
  title: "Layout/Section",
  component: Section,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Section Title",
    children: (
      <p className="text-gray-600">
        This is a default section with white background and no border.
      </p>
    ),
  },
};

export const WithSubtitle: Story = {
  args: {
    title: "Personal Information",
    subtitle: "Manage your profile details",
    hasBorder: true,
    children: (
      <div className="space-y-3">
        <p className="text-gray-600">Name: John Doe</p>
        <p className="text-gray-600">Email: john@example.com</p>
      </div>
    ),
  },
};

export const AccentBackground: Story = {
  args: {
    title: "New Features",
    background: "accent",
    hasBorder: true,
    children: (
      <ul className="list-inside list-disc space-y-2 text-gray-600">
        <li>Feature A</li>
        <li>Feature B</li>
        <li>Feature C</li>
      </ul>
    ),
  },
};
