import { access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { loadProjectCVFiles } from "../lib/loadProjectCVFiles";
import { validateCVCollection } from "../lib/validateCV";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "../..");
const MARKDOWN_DIR = join(ROOT, "markdown-source");
const PUBLIC_DIR = join(ROOT, "public");

async function pathExists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const files = await loadProjectCVFiles(MARKDOWN_DIR);

  const { errors, parsedFiles } = await validateCVCollection(files, {
    assetExists: async (assetPath) =>
      pathExists(join(PUBLIC_DIR, assetPath)),
  });

  if (errors.length > 0) {
    console.error("CV validation failed:\n");
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  const defaultLang = parsedFiles.find((file) => file.default)?.lang;
  console.log(
    `CV validation passed (${parsedFiles.length} file(s), default: ${defaultLang}).`,
  );
}

main().catch((error: unknown) => {
  console.error("Validation crashed:", error);
  process.exit(1);
});
