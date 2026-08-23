import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import type { CVFileInput } from "./validateCV";

export async function loadProjectCVFiles(
  markdownDir: string,
): Promise<CVFileInput[]> {
  const entries = await readdir(markdownDir);
  const markdownFiles = entries.filter((name) => name.endsWith(".md"));

  return Promise.all(
    markdownFiles.map(async (fileName) => ({
      fileName,
      raw: await readFile(join(markdownDir, fileName), "utf8"),
    })),
  );
}
