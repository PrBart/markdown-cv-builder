import { describe, expect, it } from "vitest";

import {
  buildCVIndex,
  inferLangFromPath,
  parseCVFile,
} from "../../src/lib/cvParse";
import { DEFAULT_PRINT_LABEL } from "../../src/types/cv";

describe("inferLangFromPath", () => {
  it("detects default language from cv.default.<lang>.md", () => {
    expect(inferLangFromPath("cv.default.en.md")).toEqual({
      lang: "en",
      default: true,
    });
  });

  it("detects language from cv.<lang>.md", () => {
    expect(inferLangFromPath("cv.de.md")).toEqual({
      lang: "de",
      default: false,
    });
  });

  it("returns empty result for unsupported filenames", () => {
    expect(inferLangFromPath("resume.md")).toEqual({ default: false });
  });
});

describe("parseCVFile", () => {
  it("parses frontmatter and markdown body", () => {
    const raw = `---
lang: en
label: English
default: true
title: Jane Doe — CV
theme: retro
favicon: favicon.svg
ogImage: assets/og-preview.svg
---

# Jane Doe
`;

    const document = parseCVFile("cv.default.en.md", raw);

    expect(document).toMatchObject({
      lang: "en",
      label: "English",
      default: true,
      title: "Jane Doe — CV",
      theme: "retro",
      favicon: "favicon.svg",
      ogImage: "assets/og-preview.svg",
      content: "# Jane Doe",
    });
  });

  it("infers lang from filename when frontmatter omits it", () => {
    const raw = `---
label: Deutsch
---

# Max
`;

    const document = parseCVFile("cv.de.md", raw);

    expect(document).toMatchObject({
      lang: "de",
      label: "Deutsch",
      default: false,
      content: "# Max",
    });
  });

  it("prefers frontmatter lang over filename lang", () => {
    const document = parseCVFile(
      "cv.de.md",
      "---\nlang: fr\nlabel: Français\n---\n\n# FR",
    );

    expect(document?.lang).toBe("fr");
    expect(document?.label).toBe("Français");
  });

  it("marks cv.default.<lang>.md as default even without default in frontmatter", () => {
    const document = parseCVFile(
      "cv.default.en.md",
      "---\nlang: en\n---\n\n# EN",
    );

    expect(document?.default).toBe(true);
  });

  it("returns null for invalid theme values", () => {
    const document = parseCVFile(
      "cv.default.en.md",
      "---\nlang: en\ntheme: neon\n---\n\n# EN",
    );

    expect(document).toBeNull();
  });

  it("trims markdown body whitespace", () => {
    const document = parseCVFile(
      "cv.en.md",
      "---\nlang: en\n---\n\n\n  # Heading  \n\n",
    );

    expect(document?.content).toBe("# Heading");
  });

  it("uses default print label when frontmatter omits it", () => {
    const document = parseCVFile("cv.en.md", "---\nlang: en\n---\n\n# EN");

    expect(document?.printLabel).toBe(DEFAULT_PRINT_LABEL);
  });

  it("uses lang code as label fallback", () => {
    const document = parseCVFile("cv.pl.md", "---\nlang: pl\n---\n\n# PL");

    expect(document?.label).toBe("pl");
  });

  it("returns null for invalid frontmatter field types", () => {
    const document = parseCVFile(
      "cv.en.md",
      "---\nlang: en\ntitle: 123\nlabel: true\n---\n\n# EN",
    );

    expect(document).toBeNull();
  });

  it("strips $schema before validation", () => {
    const document = parseCVFile(
      "cv.default.en.md",
      "---\n$schema: ../config/cv.frontmatter.schema.json\nlang: en\ntheme: retro\n---\n\n# EN",
    );

    expect(document).toMatchObject({
      lang: "en",
      theme: "retro",
    });
  });

  it("returns null when lang cannot be resolved", () => {
    const document = parseCVFile("notes.md", "---\n---\n\nHello");

    expect(document).toBeNull();
  });
});

describe("buildCVIndex", () => {
  it("uses explicit default language and indexes by lang code", () => {
    const en = parseCVFile(
      "cv.default.en.md",
      "---\nlang: en\ndefault: true\n---\n\n# EN",
    )!;
    const de = parseCVFile("cv.de.md", "---\nlang: de\n---\n\n# DE")!;

    const { cvByLang, defaultLang } = buildCVIndex([en, de]);

    expect(defaultLang).toBe("en");
    expect(cvByLang.en?.content).toBe("# EN");
    expect(cvByLang.de?.content).toBe("# DE");
  });

  it("falls back to the first document when no default is marked", () => {
    const de = parseCVFile("cv.de.md", "---\nlang: de\n---\n\n# DE")!;
    const fr = parseCVFile("cv.fr.md", "---\nlang: fr\n---\n\n# FR")!;

    const { defaultLang } = buildCVIndex([de, fr]);

    expect(defaultLang).toBe("de");
  });

  it("returns en as defaultLang for an empty document list", () => {
    const { defaultLang, cvByLang } = buildCVIndex([]);

    expect(defaultLang).toBe("en");
    expect(cvByLang).toEqual({});
  });

  it("keeps the last document when duplicate lang codes are indexed", () => {
    const first = parseCVFile("cv.en.md", "---\nlang: en\n---\n\n# First")!;
    const second = parseCVFile(
      "cv.en.copy.md",
      "---\nlang: en\n---\n\n# Second",
    )!;

    const { cvByLang } = buildCVIndex([first, second]);

    expect(cvByLang.en?.content).toBe("# Second");
  });
});
