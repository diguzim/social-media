import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:3000",
    specPattern: "cypress/e2e/**/*.cy.ts",
    supportFile: "cypress/support/e2e.ts",
    defaultCommandTimeout: 5000,
    requestTimeout: 5000,
    responseTimeout: 5000,
    pageLoadTimeout: 30000,
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("before:browser:launch", (browser, launchOptions) => {
        if (browser.family === "chromium" && browser.name !== "electron") {
          // Add Chrome args to fix IPC issues (bad message error 114)
          launchOptions.args.push("--disable-dev-shm-usage");
          launchOptions.args.push("--no-sandbox");
          launchOptions.args.push("--disable-gpu");
          launchOptions.args.push("--disable-software-rasterizer");
          launchOptions.args.push("--disable-setuid-sandbox");
          launchOptions.args.push("--disable-features=VizDisplayCompositor");
          launchOptions.args.push("--js-flags=--max-old-space-size=4096");
        }

        if (browser.name === "electron") {
          // Electron-specific args
          launchOptions.preferences.ignoreDefaultArgs = true;
        }

        return launchOptions;
      });
    },
    env: {
      API_BASE_URL: "http://localhost:4000",
    },
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
