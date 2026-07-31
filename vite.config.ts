import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Root ("/") for origin-root deploys (Sites, Worker, custom domain).
  // GitHub Pages project sites serve from a subdirectory: BASE_PATH=/repo-name/
  base: process.env.BASE_PATH ?? "/",
  build: {
    outDir: "dist/client",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.tsx"],
    },
  },
  plugins: [react(), tailwindcss()],
  test: {
    // jsdom for the component tests; the data and corpus tests still use Node
    // built-ins (fs, crypto), which work unchanged under this environment.
    environment: "jsdom",
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    setupFiles: ["./src/testSetup.ts"],
  },
});
