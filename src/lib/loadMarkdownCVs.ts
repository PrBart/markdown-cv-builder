import { buildCVIndex, parseCVFile } from "./cvParse";
import type { CVDocument, CVTheme } from "../types/cv";

const files = import.meta.glob("../../markdown-source/*.md", {
  eager: true,
  query: "?raw",
  import: "default",
});

const documents = Object.entries(files)
  .map(([path, raw]) => {
    const document = parseCVFile(path, raw as string);
    if (!document) {
      console.warn(
        `[markdown-cv-builder] Skipped ${path}: invalid frontmatter or missing language`,
      );
    }
    return document;
  })
  .filter((document): document is CVDocument => document !== null);

const { cvByLang, defaultLang } = buildCVIndex(documents);

export function getCV(lang: string): CVDocument | undefined {
  return cvByLang[lang] ?? cvByLang[defaultLang];
}

export function getDefaultCV(): CVDocument | undefined {
  return cvByLang[defaultLang];
}

export function getSiteTheme(): CVTheme {
  return getDefaultCV()?.theme ?? "github";
}

export const supportedLanguages = Object.keys(cvByLang);
export { defaultLang, cvByLang };
