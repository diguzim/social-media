import type { Preview } from "@storybook/react";
import "../src/styles.css";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: "app",
      values: [
        { name: "app", value: "#f8fafc" },
        { name: "white", value: "#ffffff" },
      ],
    },
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="min-w-[320px] max-w-5xl p-4">
        <Story />
      </div>
    ),
  ],
};

export default preview;
