/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { version } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "./", // 상대 경로로 빌드
  worker: {
    format: "iife",
  },
  build: {
    rollupOptions: {
      output: {
        format: "es",
      },
    },
  },
  define: {
    global: "globalThis",
    __APP_VERSION__: JSON.stringify(version),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
