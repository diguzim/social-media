import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Button, FloatingPanel } from "@repo/ui";

function FloatingPanelWithButtonDemo() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative min-h-[180px]">
      <Button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="rounded-md bg-primary-600 px-4 py-2 text-white"
      >
        {open ? "Hide actions" : "Show actions"}
      </Button>

      {open ? (
        <FloatingPanel align="end" side="bottom" offset="md">
          <Button
            type="button"
            onClick={() => setOpen(false)}
            variant="link"
            fullWidth
            className="justify-start rounded-none border-b border-slate-200 px-4 py-3 text-slate-700 hover:bg-slate-100"
          >
            See image
          </Button>
          <Button
            type="button"
            onClick={() => setOpen(false)}
            variant="link"
            fullWidth
            className="justify-start rounded-none px-4 py-3 text-slate-700 hover:bg-slate-100"
          >
            Change image
          </Button>
        </FloatingPanel>
      ) : null}
    </div>
  );
}

const meta = {
  title: "Menu/FloatingPanel",
  component: FloatingPanel,
  tags: ["autodocs"],
  args: {
    children: null,
  },
} satisfies Meta<typeof FloatingPanel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TriggeredByButton: Story = {
  render: () => <FloatingPanelWithButtonDemo />,
};
