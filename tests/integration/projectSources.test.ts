import { access } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { buildCVIndex, parseCVFile } from "../../src/lib/cvParse";
import { loadProjectCVFiles } from "../../src/lib/loadProjectCVFiles";
import { validateCVCollection } from "../../src/lib/validateCV";

const ROOT = join(fileURLToPath(new URL(".", import.meta.url)), "../..");
const MARKDOWN_DIR = join(ROOT, "markdown-source");
const PUBLIC_DIR = join(ROOT, "public");

describe("project markdown sources", () => {
  it("validates all committed CV files and referenced public assets", async () => {
    const files = await loadProjectCVFiles(MARKDOWN_DIR);
    const { errors, parsedFiles } = await validateCVCollection(files, {
      assetExists: async (assetPath) => {
        try {
          await access(join(PUBLIC_DIR, assetPath));
          return true;
        } catch {
          return false;
        }
      },
    });

    expect(errors).toEqual([]);
    expect(parsedFiles.length).toBeGreaterThanOrEqual(3);
  });

  it("parses every markdown file into CV documents", async () => {
    const files = await loadProjectCVFiles(MARKDOWN_DIR);
    const documents = files
      .map((file) => parseCVFile(file.fileName, file.raw))
      .filter((document) => document !== null);

    expect(documents).toHaveLength(files.length);

    const { defaultLang, cvByLang } = buildCVIndex(documents);
    expect(defaultLang).toBe("en");
    expect(Object.keys(cvByLang).sort()).toEqual(["de", "en", "ru"]);
  });
});
