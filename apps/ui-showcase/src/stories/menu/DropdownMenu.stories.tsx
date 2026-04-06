import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  useDropdownMenu,
} from "@repo/ui";

function DemoMenuItems() {
  const { close } = useDropdownMenu();

  return (
    <>
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          close();
        }}
        className="block border-b border-slate-200 px-4 py-3 text-sm text-slate-700 no-underline transition hover:bg-slate-100"
      >
        Profile
      </a>
      <a
        href="#"
        onClick={(event) => {
          event.preventDefault();
          close();
        }}
        className="block border-b border-slate-200 px-4 py-3 text-sm text-slate-700 no-underline transition hover:bg-slate-100"
      >
        Settings
      </a>
      <Button
        type="button"
        variant="destructive"
        fullWidth
        size="sm"
        onClick={close}
        className="justify-start rounded-none rounded-b-md px-4 py-3"
      >
        Logout
      </Button>
    </>
  );
}

function ControlledDropdownDemo() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} className="relative">
      <DropdownMenuTrigger className="rounded-md bg-primary-600 px-4 py-2 text-white">
        Controlled menu
      </DropdownMenuTrigger>

      <DropdownMenuContent className="absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
        <DemoMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const meta = {
  title: "Menu/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
  args: {
    children: null,
  },
} satisfies Meta<typeof DropdownMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {
  render: () => (
    <DropdownMenu className="relative">
      <DropdownMenuTrigger className="rounded-md bg-primary-600 px-4 py-2 text-white">
        Open menu
      </DropdownMenuTrigger>

      <DropdownMenuContent className="absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
        <DemoMenuItems />
      </DropdownMenuContent>
    </DropdownMenu>
  ),
};

export const Controlled: Story = {
  render: () => <ControlledDropdownDemo />,
};
