/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import pkg from "./package.json";

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
    __APP_VERSION__: JSON.stringify(pkg.version),
    __APP_HOMEPAGE__: JSON.stringify(pkg.homepage),
    __APP_PRIVACY_URL__: JSON.stringify(
      new URL("privacy.html", pkg.homepage).href,
    ),
    __APP_DESCRIPTION__: JSON.stringify(pkg.description),
    __APP_AUTHOR_NAME__: JSON.stringify(pkg.author.name),
    __APP_AUTHOR_EMAIL__: JSON.stringify(pkg.author.email),
    __APP_BUGS_URL__: JSON.stringify(pkg.bugs.url),
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
});
