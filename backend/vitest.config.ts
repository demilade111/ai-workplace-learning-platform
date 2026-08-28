import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: false,
    environment: "node",
    setupFiles: ["./src/test/setupEnv.ts"],
    testTimeout: 15000,
  },
});
