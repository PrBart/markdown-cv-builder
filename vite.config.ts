/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const getProdBase = () => {
  const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] || "markdown-cv-builder";
  return `/${repo}/`;
};

export default defineConfig(({ command }) => ({
  base: process.env.CV_BASE ?? (command === "serve" ? "/" : getProdBase()),
  plugins: [react()],
  build: {
    outDir: "dist",
    assetsDir: "assets",
    emptyOutDir: true,
    sourcemap: false,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    coverage: {
      reportsDirectory: "node_modules/.tmp/coverage",
      include: ["src/lib/**/*.ts", "src/MarkdownPage.tsx", "src/LanguageSwitcher.tsx"],
      exclude: ["src/lib/loadMarkdownCVs.ts"],
    },
  },
}));
