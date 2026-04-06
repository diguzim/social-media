import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Modal } from "@repo/ui";

const meta: Meta<typeof Modal> = {
  title: "Components/Modal",
  component: Modal,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

function ModalDemo({
  title,
  description,
  longBody = false,
}: {
  title: string;
  description: string;
  longBody?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const paragraphs = useMemo(
    () =>
      Array.from({ length: longBody ? 28 : 3 }, (_, index) => index + 1).map(
        (index) =>
          `Paragraph ${index}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
      ),
    [longBody],
  );

  return (
    <>
      <div className="p-6">
        <button
          type="button"
          className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white"
          onClick={() => setIsOpen(true)}
        >
          Open modal
        </button>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        ariaLabel={title}
        dataTestId="demo-modal"
        dialogClassName={longBody ? "max-w-2xl" : "max-w-xl"}
      >
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Modal content can be anything: images, forms, or actions.
          </div>
          {longBody ? (
            <div className="space-y-4">
              {paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-6 text-slate-700">
                  {paragraph}
                </p>
              ))}
              <div className="grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 12 }, (_, index) => index + 1).map(
                  (index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700"
                    >
                      Extra block {index}
                    </div>
                  ),
                )}
              </div>
            </div>
          ) : null}
        </div>
      </Modal>
    </>
  );
}

export const Default: Story = {
  render: () => (
    <ModalDemo
      title="Preview image"
      description="This modal is controlled, rendered in a portal, and closed by overlay, escape, or button."
    />
  ),
};

export const LongContent: Story = {
  render: () => (
    <ModalDemo
      title="Long content with internal scroll"
      description="A very tall example to confirm the dialog itself scrolls instead of the page."
      longBody
    />
  ),
};
