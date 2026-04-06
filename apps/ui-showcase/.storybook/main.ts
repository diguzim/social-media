import type { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@repo/ui": path.resolve(currentDir, "../../../packages/ui/src/index.ts"),
      "@repo/ui/layout-components": path.resolve(
        currentDir,
        "../../../packages/ui/src/layout-components/index.ts",
      ),
    };

    return config;
  },
};

export default config;
