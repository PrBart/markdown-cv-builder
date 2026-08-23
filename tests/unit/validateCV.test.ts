import { describe, expect, it } from "vitest";

import {
  validateCVCollection,
  validateCVFile,
} from "../../src/lib/validateCV";

const validDefaultCV = `---
lang: en
label: English
default: true
title: John Doe — CV
theme: github
favicon: favicon.svg
ogImage: assets/og-preview.svg
---

# John Doe
`;

describe("validateCVFile", () => {
  it("returns parsed metadata for a valid file", async () => {
    const result = await validateCVFile(
      { fileName: "cv.default.en.md", raw: validDefaultCV },
      { assetExists: async () => true },
    );

    expect(result.errors).toEqual([]);
    expect(result.parsed).toMatchObject({
      lang: "en",
      default: true,
      theme: "github",
    });
  });

  it("treats cv.default.<lang>.md as default without an explicit default flag", async () => {
    const result = await validateCVFile({
      fileName: "cv.default.en.md",
      raw: "---\nlang: en\n---\n\n# EN",
    });

    expect(result.errors).toEqual([]);
    expect(result.parsed?.default).toBe(true);
  });

  it("reports missing asset files", async () => {
    const result = await validateCVFile(
      { fileName: "cv.default.en.md", raw: validDefaultCV },
      { assetExists: async () => false },
    );

    expect(result.errors).toEqual([
      'cv.default.en.md: "favicon" points to missing file "public/favicon.svg"',
      'cv.default.en.md: "ogImage" points to missing file "public/assets/og-preview.svg"',
    ]);
  });

  it("skips asset checks when assetExists is not provided", async () => {
    const result = await validateCVFile({
      fileName: "cv.default.en.md",
      raw: `---
lang: en
default: true
favicon: missing.svg
ogImage: missing/preview.svg
---

# EN`,
    });

    expect(result.errors).toEqual([]);
  });

  it("reports theme on non-default files", async () => {
    const result = await validateCVFile(
      {
        fileName: "cv.de.md",
        raw: `---
lang: de
theme: retro
---

# DE
`,
      },
      { assetExists: async () => true },
    );

    expect(result.errors).toContain(
      'cv.de.md: "theme" should only be set on the default language file',
    );
  });

  it("reports siteUrl on non-default files", async () => {
    const result = await validateCVFile({
      fileName: "cv.de.md",
      raw: `---
lang: de
siteUrl: https://example.com
---

# DE
`,
    });

    expect(result.errors).toContain(
      'cv.de.md: "siteUrl" should only be set on the default language file',
    );
  });

  it("accepts $schema in frontmatter", async () => {
    const result = await validateCVFile({
      fileName: "cv.default.en.md",
      raw: `---
$schema: ../config/cv.frontmatter.schema.json
lang: en
default: true
---

# EN
`,
    });

    expect(result.errors).toEqual([]);
  });

  it("rejects invalid theme values via schema validation", async () => {
    const result = await validateCVFile({
      fileName: "cv.default.en.md",
      raw: "---\nlang: en\ntheme: neon\n---\n\n# EN",
    });

    expect(result.errors.some((error) => error.includes("theme"))).toBe(true);
  });

  it("reports missing lang when it cannot be inferred", async () => {
    const result = await validateCVFile({
      fileName: "resume.md",
      raw: "---\ntitle: Broken\n---\n\n# Broken",
    });

    expect(result.errors).toEqual([
      'resume.md: missing "lang" in frontmatter and unable to infer from filename',
    ]);
    expect(result.parsed).toBeUndefined();
  });

  it("rejects lang codes that are too short", async () => {
    const result = await validateCVFile({
      fileName: "cv.e.md",
      raw: "---\nlang: e\n---\n\n# E",
    });

    expect(result.errors.some((error) => error.includes("lang"))).toBe(true);
    expect(result.parsed).toBeUndefined();
  });
});

describe("validateCVCollection", () => {
  it("passes a valid multilingual collection", async () => {
    const { errors, parsedFiles } = await validateCVCollection(
      [
        { fileName: "cv.default.en.md", raw: validDefaultCV },
        { fileName: "cv.de.md", raw: "---\nlang: de\n---\n\n# DE" },
      ],
      { assetExists: async () => true },
    );

    expect(errors).toEqual([]);
    expect(parsedFiles).toHaveLength(2);
  });

  it("accepts cv.default.<lang>.md as the only default marker", async () => {
    const { errors } = await validateCVCollection([
      {
        fileName: "cv.default.en.md",
        raw: "---\nlang: en\n---\n\n# EN",
      },
      {
        fileName: "cv.de.md",
        raw: "---\nlang: de\n---\n\n# DE",
      },
    ]);

    expect(errors).toEqual([]);
  });

  it("reports an empty markdown collection", async () => {
    const { errors, parsedFiles } = await validateCVCollection([]);

    expect(errors).toEqual(["No markdown files found in markdown-source/"]);
    expect(parsedFiles).toEqual([]);
  });

  it("reports duplicate languages and missing default language", async () => {
    const { errors } = await validateCVCollection([
      { fileName: "cv.en.md", raw: "---\nlang: en\n---\n\n# EN" },
      { fileName: "cv.en.copy.md", raw: "---\nlang: en\n---\n\n# EN copy" },
    ]);

    expect(errors).toContain(
      'Duplicate lang "en" in files: cv.en.md, cv.en.copy.md',
    );
    expect(errors).toContain(
      'No default language found. Set "default: true" in one frontmatter block or use cv.default.<lang>.md',
    );
  });

  it("reports multiple default languages", async () => {
    const { errors } = await validateCVCollection([
      {
        fileName: "cv.default.en.md",
        raw: "---\nlang: en\ndefault: true\n---\n\n# EN",
      },
      {
        fileName: "cv.default.de.md",
        raw: "---\nlang: de\ndefault: true\n---\n\n# DE",
      },
    ]);

    expect(
      errors.some((error) => error.includes("Multiple default languages")),
    ).toBe(true);
  });

  it("skips files that fail validation when building the collection", async () => {
    const { errors, parsedFiles } = await validateCVCollection([
      { fileName: "cv.default.en.md", raw: validDefaultCV },
      { fileName: "resume.md", raw: "---\ntitle: Broken\n---\n\n# Broken" },
    ]);

    expect(errors).toContain(
      'resume.md: missing "lang" in frontmatter and unable to infer from filename',
    );
    expect(parsedFiles).toHaveLength(1);
    expect(parsedFiles[0]?.lang).toBe("en");
  });
});
