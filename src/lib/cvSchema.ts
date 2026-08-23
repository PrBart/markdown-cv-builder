import { z } from "zod";

export const cvThemeSchema = z.enum(["github", "retro", "screen"]);

export type CVTheme = z.infer<typeof cvThemeSchema>;

export const CV_THEMES = cvThemeSchema.options;

export const cvFrontmatterSchema = z
  .object({
    lang: z
      .string()
      .min(2, "lang must be at least 2 characters")
      .max(10, "lang must be at most 10 characters"),
    label: z.string().min(1).optional(),
    default: z.boolean().optional(),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    printLabel: z.string().min(1).optional(),
    theme: cvThemeSchema.optional(),
    favicon: z.string().min(1).optional(),
    ogImage: z.string().min(1).optional(),
    siteUrl: z.string().url().optional(),
  })
  .strict();

const FRONTMATTER_META_KEYS = ["$schema", "$id"] as const;

export function stripSchemaMeta(
  data: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...data };
  for (const key of FRONTMATTER_META_KEYS) {
    delete result[key];
  }
  return result;
}

interface FrontmatterInference {
  lang?: string;
  default: boolean;
}

function buildFrontmatterCandidate(
  data: Record<string, unknown>,
  inferred: FrontmatterInference,
): { lang?: string; candidate?: Record<string, unknown> } {
  const stripped = stripSchemaMeta(data);
  const lang =
    typeof stripped.lang === "string" && stripped.lang.length > 0
      ? stripped.lang
      : inferred.lang;

  if (!lang) {
    return { lang: undefined };
  }

  return {
    lang,
    candidate: {
      ...stripped,
      lang,
      default: stripped.default === true || inferred.default,
    },
  };
}

export function parseCVFrontmatter(
  data: Record<string, unknown>,
  inferred: FrontmatterInference,
) {
  const { lang, candidate } = buildFrontmatterCandidate(data, inferred);

  if (!lang || !candidate) {
    return { lang: undefined, result: undefined };
  }

  return {
    lang,
    result: cvFrontmatterSchema.safeParse(candidate),
  };
}

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((issue) => {
      const path = issue.path.length > 0 ? issue.path.join(".") : "root";
      return `${path}: ${issue.message}`;
    })
    .join("; ");
}
