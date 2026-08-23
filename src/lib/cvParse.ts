import { parseCVFrontmatter } from "./cvSchema";
import { splitFrontmatter } from "./splitFrontmatter";
import {
  DEFAULT_PRINT_LABEL,
  type CVDocument,
} from "../types/cv";

export function inferLangFromPath(path: string): {
  lang?: string;
  default: boolean;
} {
  const defaultMatch = path.match(/cv\.default\.(\w+)\.md$/);
  if (defaultMatch) {
    return { lang: defaultMatch[1], default: true };
  }

  const regularMatch = path.match(/cv\.(\w+)\.md$/);
  if (regularMatch) {
    return { lang: regularMatch[1], default: false };
  }

  return { default: false };
}

export function parseCVFile(path: string, raw: string): CVDocument | null {
  const { data, content } = splitFrontmatter(raw);
  const inferred = inferLangFromPath(path);
  const parsed = parseCVFrontmatter(data as Record<string, unknown>, inferred);

  if (!parsed.lang || !parsed.result?.success) {
    return null;
  }

  const frontmatter = parsed.result.data;

  return {
    lang: frontmatter.lang,
    label: frontmatter.label ?? frontmatter.lang,
    default: frontmatter.default === true,
    title: frontmatter.title,
    description: frontmatter.description,
    printLabel: frontmatter.printLabel ?? DEFAULT_PRINT_LABEL,
    theme: frontmatter.theme,
    favicon: frontmatter.favicon,
    ogImage: frontmatter.ogImage,
    siteUrl: frontmatter.siteUrl,
    content: content.trim(),
  };
}

export function buildCVIndex(documents: CVDocument[]): {
  cvByLang: Record<string, CVDocument>;
  defaultLang: string;
} {
  const cvByLang: Record<string, CVDocument> = {};

  for (const document of documents) {
    cvByLang[document.lang] = document;
  }

  const defaultLang =
    documents.find((cv) => cv.default)?.lang ??
    documents[0]?.lang ??
    "en";

  return { cvByLang, defaultLang };
}
