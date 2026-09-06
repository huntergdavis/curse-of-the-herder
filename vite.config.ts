import { defineConfig } from "vite";
import packageJson from "./package.json" with { type: "json" };

// Served as a GitHub Pages project site under the hunterdavis.com custom
// domain: https://hunterdavis.com/curse-of-the-herder/
export default defineConfig({
  base: "/curse-of-the-herder/",
  define: {
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  build: {
    target: "es2022",
    sourcemap: true,
  },
});
