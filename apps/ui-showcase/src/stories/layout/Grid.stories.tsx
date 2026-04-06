import type { Meta, StoryObj } from "@storybook/react";
import { Grid } from "@repo/ui";

const meta: Meta<typeof Grid> = {
  title: "Layout/Grid",
  component: Grid,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const GridItem = ({ label }: { label: string }) => (
  <div className="flex h-24 items-center justify-center rounded border-2 border-green-300 bg-green-100 p-6 text-center text-sm font-medium">
    {label}
  </div>
);

export const ResponsiveColumns: Story = {
  args: {
    columns: { default: 1, sm: 2, md: 3, lg: 4 },
    gap: "gap-6",
    children: (
      <>
        {Array.from({ length: 12 }).map((_, i) => (
          <GridItem key={i} label={`Item ${i + 1}`} />
        ))}
      </>
    ),
  },
};

export const DenseGrid: Story = {
  args: {
    columns: { base: 2, md: 4 },
    gap: { base: "gap-2", md: "gap-4" },
    children: (
      <>
        {Array.from({ length: 8 }).map((_, i) => (
          <GridItem key={i} label={`${i + 1}`} />
        ))}
      </>
    ),
  },
};

export const TwelveColumnLayout: Story = {
  args: {
    columns: 12,
    gap: "gap-4",
    children: (
      <>
        <div className="col-span-3 flex h-24 items-center justify-center rounded border-2 border-purple-300 bg-purple-100 p-6 text-center text-sm font-medium">
          Hero (3 cols)
        </div>
        <div className="col-span-3 flex h-24 items-center justify-center rounded border-2 border-blue-300 bg-blue-100 p-6 text-center text-sm font-medium">
          Featured
        </div>
        <div className="col-span-2 flex h-24 items-center justify-center rounded border-2 border-blue-300 bg-blue-100 p-6 text-center text-sm font-medium">
          Sidebar
        </div>
        <div className="col-span-2 flex h-24 items-center justify-center rounded border-2 border-blue-300 bg-blue-100 p-6 text-center text-sm font-medium">
          Sidebar
        </div>
        <div className="col-span-2 flex h-24 items-center justify-center rounded border-2 border-blue-300 bg-blue-100 p-6 text-center text-sm font-medium">
          Sidebar
        </div>
        <div className="col-span-4 flex h-24 items-center justify-center rounded border-2 border-green-300 bg-green-100 p-6 text-center text-sm font-medium">
          1/3 Width
        </div>
        <div className="col-span-4 flex h-24 items-center justify-center rounded border-2 border-green-300 bg-green-100 p-6 text-center text-sm font-medium">
          1/3 Width
        </div>
        <div className="col-span-4 flex h-24 items-center justify-center rounded border-2 border-green-300 bg-green-100 p-6 text-center text-sm font-medium">
          1/3 Width
        </div>
        <div className="col-span-6 flex h-24 items-center justify-center rounded border-2 border-orange-300 bg-orange-100 p-6 text-center text-sm font-medium">
          Half Width
        </div>
        <div className="col-span-6 flex h-24 items-center justify-center rounded border-2 border-orange-300 bg-orange-100 p-6 text-center text-sm font-medium">
          Half Width
        </div>
        <div className="col-span-12 flex h-24 items-center justify-center rounded border-2 border-red-300 bg-red-100 p-6 text-center text-sm font-medium">
          Full Width (12 cols)
        </div>
      </>
    ),
  },
};
