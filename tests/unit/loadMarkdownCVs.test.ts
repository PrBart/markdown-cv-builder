import { describe, expect, it } from "vitest";

import {
  cvByLang,
  defaultLang,
  getCV,
  getDefaultCV,
  getSiteTheme,
  supportedLanguages,
} from "../../src/lib/loadMarkdownCVs";

describe("loadMarkdownCVs", () => {
  it("loads all project markdown language files", () => {
    expect(supportedLanguages.sort()).toEqual(["de", "en", "ru"]);
  });

  it("marks English as the default language", () => {
    expect(defaultLang).toBe("en");
    expect(getDefaultCV()?.default).toBe(true);
  });

  it("returns localized CV content by language code", () => {
    expect(getCV("en")?.content).toContain("# John Doe");
    expect(getCV("de")?.content).toContain("# Max Mustermann");
    expect(getCV("ru")?.content).toContain("# Иван Петров");
  });

  it("falls back to the default language for unknown codes", () => {
    expect(getCV("unknown")?.lang).toBe("en");
  });

  it("exposes localized print labels and site metadata", () => {
    expect(getCV("de")?.printLabel).toBe("Drucken / PDF speichern");
    expect(getCV("en")?.title).toBe("John Doe — CV");
    expect(getCV("en")?.favicon).toBe("favicon.svg");
    expect(getCV("en")?.ogImage).toBe("assets/og-preview.svg");
  });

  it("reads the theme from the default CV", () => {
    expect(getSiteTheme()).toBe("github");
    expect(cvByLang.en?.theme).toBe("github");
  });
});
