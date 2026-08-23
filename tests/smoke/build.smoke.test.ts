import { execSync } from "node:child_process";
import { access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, it } from "vitest";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "../..");

// `npm run build` performs the real Vite build right after the check suite,
// so the smoke build is skipped there to avoid building the site twice.
const skipViteBuild = process.env.SKIP_VITE_BUILD === "1";
const maybeIt = skipViteBuild ? it.skip : it;

describe("production build smoke test", () => {
  maybeIt(
    "builds the site with Vite without errors",
    () => {
      execSync("npx vite build", {
        cwd: ROOT,
        env: {
          ...process.env,
          GITHUB_REPOSITORY: "test/markdown-cv-builder",
        },
        stdio: "pipe",
      });
    },
    120_000,
  );

  maybeIt("writes expected files to dist/", async () => {
    await access(join(ROOT, "dist/index.html"));
    await access(join(ROOT, "dist/favicon.svg"));
    await access(join(ROOT, "dist/assets/og-preview.svg"));
  });
});
