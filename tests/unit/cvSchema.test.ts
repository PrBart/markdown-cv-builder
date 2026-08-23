import { describe, expect, it } from "vitest";

import {
  CV_THEMES,
  cvFrontmatterSchema,
  cvThemeSchema,
  formatZodError,
  stripSchemaMeta,
} from "../../src/lib/cvSchema";

describe("cvThemeSchema", () => {
  it("exports theme options from the schema", () => {
    expect(CV_THEMES).toEqual(["github", "retro", "screen"]);
    expect(cvThemeSchema.options).toEqual(CV_THEMES);
  });

  it("rejects unknown theme values", () => {
    expect(cvThemeSchema.safeParse("neon").success).toBe(false);
    expect(cvThemeSchema.safeParse("github").success).toBe(true);
  });
});

describe("cvFrontmatterSchema", () => {
  it("accepts a valid frontmatter object", () => {
    const result = cvFrontmatterSchema.safeParse({
      lang: "en",
      label: "English",
      default: true,
      title: "John Doe — CV",
      theme: "github",
      favicon: "favicon.svg",
      ogImage: "assets/og-preview.svg",
    });

    expect(result.success).toBe(true);
  });

  it("rejects unknown keys", () => {
    const result = cvFrontmatterSchema.safeParse({
      lang: "en",
      themes: "github",
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid theme values", () => {
    const result = cvFrontmatterSchema.safeParse({
      lang: "en",
      theme: "neon",
    });

    expect(result.success).toBe(false);
  });

  it("accepts siteUrl on valid frontmatter", () => {
    const result = cvFrontmatterSchema.safeParse({
      lang: "en",
      siteUrl: "https://example.com",
    });

    expect(result.success).toBe(true);
  });
});

describe("stripSchemaMeta", () => {
  it("removes JSON Schema meta keys before Zod validation", () => {
    const stripped = stripSchemaMeta({
      $schema: "../config/cv.frontmatter.schema.json",
      $id: "cv-frontmatter",
      lang: "en",
    });

    expect(stripped).toEqual({ lang: "en" });
    expect(cvFrontmatterSchema.safeParse(stripped).success).toBe(true);
  });
});

describe("formatZodError", () => {
  it("formats schema issues into readable messages", () => {
    const result = cvFrontmatterSchema.safeParse({
      lang: "e",
      theme: "neon",
      unknown: true,
    });

    if (result.success) {
      throw new Error("Expected validation to fail");
    }

    const message = formatZodError(result.error);

    expect(message).toContain("lang:");
    expect(message).toContain("theme:");
    expect(message).toContain("Unrecognized key");
  });
});
