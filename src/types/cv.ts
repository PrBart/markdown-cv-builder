import type { CVTheme } from "../lib/cvSchema";

export type { CVTheme };

export interface CVDocument {
  lang: string;
  label: string;
  default: boolean;
  title?: string;
  description?: string;
  printLabel: string;
  theme?: CVTheme;
  favicon?: string;
  ogImage?: string;
  siteUrl?: string;
  content: string;
}

export const DEFAULT_PRINT_LABEL = "Print / Save PDF";
