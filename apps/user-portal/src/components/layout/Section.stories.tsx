import type { Meta, StoryObj } from '@storybook/react';
import { Section } from './Section';

const meta: Meta<typeof Section> = {
  title: 'Layout/Section',
  component: Section,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Section Title',
    children: (
      <p className="text-gray-600">
        This is a default section with white background and no border.
      </p>
    ),
  },
};

export const WithSubtitle: Story = {
  args: {
    title: 'Personal Information',
    subtitle: 'Manage your profile details',
    children: (
      <div className="space-y-3">
        <p className="text-gray-600">Name: John Doe</p>
        <p className="text-gray-600">Email: john@example.com</p>
      </div>
    ),
  },
};

export const WithBorder: Story = {
  args: {
    title: 'Important Notice',
    hasBorder: true,
    children: <p className="text-gray-600">This section has a border to emphasize its content.</p>,
  },
};

export const AccentBackground: Story = {
  args: {
    title: 'New Features',
    background: 'accent',
    hasBorder: true,
    children: (
      <ul className="list-disc list-inside space-y-2 text-gray-600">
        <li>Feature A</li>
        <li>Feature B</li>
        <li>Feature C</li>
      </ul>
    ),
  },
};

export const DangerBackground: Story = {
  args: {
    title: 'Danger Zone',
    background: 'danger',
    hasBorder: true,
    children: <p className="text-red-700">This action cannot be undone. Proceed with caution.</p>,
  },
};

export const SecondaryBackground: Story = {
  args: {
    title: 'Additional Info',
    background: 'secondary',
    children: (
      <p className="text-gray-600">
        This section uses a secondary background for visual hierarchy.
      </p>
    ),
  },
};

export const TransparentBackground: Story = {
  args: {
    title: 'Minimal Section',
    background: 'transparent',
    padding: 'p-2',
    children: <p className="text-gray-600">Transparent background with minimal padding.</p>,
  },
};

export const CustomPadding: Story = {
  args: {
    title: 'Compact Section',
    padding: 'p-2',
    children: <p className="text-sm text-gray-600">This section has custom padding: p-2 (8px).</p>,
  },
};

export const LargePadding: Story = {
  args: {
    title: 'Spacious Content Area',
    padding: 'p-12',
    background: 'accent',
    children: (
      <div className="space-y-4">
        <p className="text-gray-600">This section has generous padding for a spacious feel.</p>
        <p className="text-gray-600">Good for featured content or emphasis.</p>
      </div>
    ),
  },
};

export const Multiple: Story = {
  render: () => (
    <div className="space-y-6">
      <Section title="Section 1">
        <p className="text-gray-600">First section content</p>
      </Section>
      <Section title="Section 2" background="secondary">
        <p className="text-gray-600">Second section content with secondary background</p>
      </Section>
      <Section title="Section 3" hasBorder background="accent">
        <p className="text-gray-600">Third section with border and accent background</p>
      </Section>
    </div>
  ),
};
