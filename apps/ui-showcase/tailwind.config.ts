import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/**/*.{ts,tsx}",
    "./.storybook/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;
