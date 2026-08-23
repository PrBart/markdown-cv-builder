import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { CV_THEMES } from "../lib/cvSchema";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../..");
const schemaPath = join(rootDir, "config/cv.frontmatter.schema.json");

const schema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  title: "CV Frontmatter",
  description:
    "YAML frontmatter schema for markdown CV files in markdown-source/",
  type: "object",
  additionalProperties: false,
  required: ["lang"],
  properties: {
    $schema: {
      type: "string",
      description: "JSON Schema path for IDE autocomplete",
    },
    lang: {
      type: "string",
      minLength: 2,
      maxLength: 10,
      description: "Language code (e.g. en, de, ru)",
    },
    label: {
      type: "string",
      minLength: 1,
      description: "Display name in the language switcher",
    },
    default: {
      type: "boolean",
      description: "Set to true for the default language",
    },
    title: {
      type: "string",
      minLength: 1,
      description: "Browser tab title and social preview title",
    },
    description: {
      type: "string",
      minLength: 1,
      description: "Meta description for SEO and social previews",
    },
    printLabel: {
      type: "string",
      minLength: 1,
      description: "Text for the print/PDF button",
    },
    theme: {
      type: "string",
      enum: [...CV_THEMES],
      description: "Theme preset (default language file only)",
    },
    favicon: {
      type: "string",
      minLength: 1,
      description: "Path to favicon in public/",
    },
    ogImage: {
      type: "string",
      minLength: 1,
      description: "Path to social preview image in public/",
    },
    siteUrl: {
      type: "string",
      format: "uri",
      description:
        "Public site URL for absolute og:image and og:url (default language file only)",
    },
  },
};

const formatted = `${JSON.stringify(schema, null, 2)}\n`;
const existing = readFileSync(schemaPath, "utf8");

if (existing !== formatted) {
  writeFileSync(schemaPath, formatted);
  console.log(`Updated ${schemaPath}`);
} else {
  console.log(`Schema is up to date: ${schemaPath}`);
}
