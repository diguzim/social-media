import type { Meta, StoryObj } from '@storybook/react';
import { Grid } from './Grid';

const meta: Meta<typeof Grid> = {
  title: 'Layout/Grid',
  component: Grid,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const GridItem = ({ label }: { label: string }) => (
  <div className="bg-green-100 border-2 border-green-300 rounded p-6 text-center text-sm font-medium h-24 flex items-center justify-center">
    {label}
  </div>
);

export const SingleColumn: Story = {
  args: {
    columns: { default: 1 },
    gap: 'gap-4',
    children: (
      <>
        <GridItem label="Item 1" />
        <GridItem label="Item 2" />
        <GridItem label="Item 3" />
        <GridItem label="Item 4" />
      </>
    ),
  },
};

export const TwoColumnMobile: Story = {
  args: {
    columns: { default: 2 },
    gap: 'gap-4',
    children: (
      <>
        <GridItem label="Item 1" />
        <GridItem label="Item 2" />
        <GridItem label="Item 3" />
        <GridItem label="Item 4" />
        <GridItem label="Item 5" />
        <GridItem label="Item 6" />
      </>
    ),
  },
};

export const ResponsiveColumns: Story = {
  args: {
    columns: { default: 1, sm: 2, md: 3, lg: 4 },
    gap: 'gap-6',
    children: (
      <>
        {Array.from({ length: 12 }).map((_, i) => (
          <GridItem key={i} label={`Item ${i + 1}`} />
        ))}
      </>
    ),
  },
};

export const LargeGap: Story = {
  args: {
    columns: { default: 2, md: 3 },
    gap: 'gap-12',
    children: (
      <>
        <GridItem label="Item 1" />
        <GridItem label="Item 2" />
        <GridItem label="Item 3" />
        <GridItem label="Item 4" />
        <GridItem label="Item 5" />
        <GridItem label="Item 6" />
      </>
    ),
  },
};

export const ThreeColumnDesktop: Story = {
  args: {
    columns: { default: 1, md: 3 },
    gap: 'gap-4',
    children: (
      <>
        {Array.from({ length: 9 }).map((_, i) => (
          <GridItem key={i} label={`Card ${i + 1}`} />
        ))}
      </>
    ),
  },
};

export const FeedLayout: Story = {
  args: {
    columns: { default: 1, lg: 2 },
    gap: 'gap-8',
    children: (
      <>
        <div className="space-y-8">
          <GridItem label="Post 1" />
          <GridItem label="Post 2" />
        </div>
        <div className="space-y-8">
          <GridItem label="Sidebar 1" />
          <GridItem label="Sidebar 2" />
        </div>
      </>
    ),
  },
};

export const SmallGap: Story = {
  args: {
    columns: { default: 2, md: 4 },
    gap: 'gap-1',
    children: (
      <>
        {Array.from({ length: 8 }).map((_, i) => (
          <GridItem key={i} label={`${i + 1}`} />
        ))}
      </>
    ),
  },
};

export const MobileResponsive: Story = {
  render: () => (
    <div className="space-y-8">
      <div>
        <p className="mb-4 text-sm font-semibold text-gray-700">
          Resize viewport to see responsiveness:
        </p>
        <Grid columns={{ default: 1, sm: 2, md: 3 }} gap="gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <GridItem key={i} label={`Item ${i + 1}`} />
          ))}
        </Grid>
      </div>
      <div>
        <p className="mb-4 text-sm font-semibold text-gray-700">
          Mobile: 1 column | sm (640px+): 2 columns | md (768px+): 3 columns
        </p>
      </div>
    </div>
  ),
};
