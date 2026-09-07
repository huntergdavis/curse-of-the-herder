import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "tests",
  timeout: 120_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:4174/curse-of-the-herder/",
    viewport: { width: 1440, height: 900 },
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4174 --strictPort",
    url: "http://localhost:4174/curse-of-the-herder/",
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
