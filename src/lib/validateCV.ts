import { inferLangFromPath } from "./cvParse";
import { splitFrontmatter } from "./splitFrontmatter";
import { formatZodError, parseCVFrontmatter } from "./cvSchema";

export interface CVFileInput {
  fileName: string;
  raw: string;
}

export interface ParsedCVFile {
  fileName: string;
  lang: string;
  default: boolean;
  theme?: string;
  favicon?: string;
  ogImage?: string;
  siteUrl?: string;
}

export interface ValidateCVOptions {
  assetExists?: (publicRelativePath: string) => boolean | Promise<boolean>;
}

async function assetIsMissing(
  assetPath: string,
  assetExists: ValidateCVOptions["assetExists"],
): Promise<boolean> {
  if (!assetExists) {
    return false;
  }

  const normalized = assetPath.replace(/^\//, "");
  return !(await assetExists(normalized));
}

export async function validateCVFile(
  input: CVFileInput,
  options: ValidateCVOptions = {},
): Promise<{ errors: string[]; parsed?: ParsedCVFile }> {
  const errors: string[] = [];
  const { data } = splitFrontmatter(input.raw);
  const inferred = inferLangFromPath(input.fileName);
  const parsed = parseCVFrontmatter(data as Record<string, unknown>, inferred);

  if (!parsed.lang) {
    errors.push(
      `${input.fileName}: missing "lang" in frontmatter and unable to infer from filename`,
    );
    return { errors };
  }

  if (!parsed.result) {
    errors.push(`${input.fileName}: frontmatter could not be parsed`);
    return { errors };
  }

  if (!parsed.result.success) {
    errors.push(`${input.fileName}: ${formatZodError(parsed.result.error)}`);
    return { errors };
  }

  const frontmatter = parsed.result.data;
  const parsedFile: ParsedCVFile = {
    fileName: input.fileName,
    lang: frontmatter.lang,
    default: frontmatter.default === true,
    theme: frontmatter.theme,
    favicon: frontmatter.favicon,
    ogImage: frontmatter.ogImage,
    siteUrl: frontmatter.siteUrl,
  };

  if (frontmatter.theme && !parsedFile.default) {
    errors.push(
      `${input.fileName}: "theme" should only be set on the default language file`,
    );
  }

  if (frontmatter.siteUrl && !parsedFile.default) {
    errors.push(
      `${input.fileName}: "siteUrl" should only be set on the default language file`,
    );
  }

  if (
    frontmatter.favicon &&
    (await assetIsMissing(frontmatter.favicon, options.assetExists))
  ) {
    errors.push(
      `${input.fileName}: "favicon" points to missing file "public/${frontmatter.favicon.replace(/^\//, "")}"`,
    );
  }

  if (
    frontmatter.ogImage &&
    (await assetIsMissing(frontmatter.ogImage, options.assetExists))
  ) {
    errors.push(
      `${input.fileName}: "ogImage" points to missing file "public/${frontmatter.ogImage.replace(/^\//, "")}"`,
    );
  }

  return { errors, parsed: parsedFile };
}

export async function validateCVCollection(
  files: CVFileInput[],
  options: ValidateCVOptions = {},
): Promise<{ errors: string[]; parsedFiles: ParsedCVFile[] }> {
  const errors: string[] = [];
  const parsedFiles: ParsedCVFile[] = [];

  if (files.length === 0) {
    return {
      errors: ["No markdown files found in markdown-source/"],
      parsedFiles,
    };
  }

  for (const file of files) {
    const result = await validateCVFile(file, options);
    errors.push(...result.errors);
    if (result.parsed) {
      parsedFiles.push(result.parsed);
    }
  }

  const langCounts = new Map<string, string[]>();
  for (const file of parsedFiles) {
    const filesForLang = langCounts.get(file.lang) ?? [];
    filesForLang.push(file.fileName);
    langCounts.set(file.lang, filesForLang);
  }

  for (const [lang, filesForLang] of langCounts) {
    if (filesForLang.length > 1) {
      errors.push(
        `Duplicate lang "${lang}" in files: ${filesForLang.join(", ")}`,
      );
    }
  }

  const defaultFiles = parsedFiles.filter((file) => file.default);
  if (defaultFiles.length === 0) {
    errors.push(
      'No default language found. Set "default: true" in one frontmatter block or use cv.default.<lang>.md',
    );
  } else if (defaultFiles.length > 1) {
    errors.push(
      `Multiple default languages found: ${defaultFiles.map((file) => file.fileName).join(", ")}`,
    );
  }

  return { errors, parsedFiles };
}
