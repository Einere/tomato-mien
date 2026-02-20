/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { version, homepage } from "./package.json";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@assets": path.resolve(__dirname, "./assets"),
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
    __APP_HOMEPAGE__: JSON.stringify(homepage),
    __APP_PRIVACY_URL__: JSON.stringify(new URL("privacy.html", homepage).href),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
