const files = import.meta.glob("../../markdown-source/*.md", {
    eager: true,
    query: "?raw",
    import: "default",
  });
  
  const markdownByLang: Record<string, string> = {};
  let defaultLang = "en";
  
  for (const path in files) {
    const defaultMatch = path.match(/cv\.default\.(\w+)\.md$/);
    const regularMatch = path.match(/cv\.(\w+)\.md$/);
  
    if (defaultMatch) {
      const lang = defaultMatch[1];
      defaultLang = lang;
      markdownByLang[lang] = files[path] as string;
    } else if (regularMatch) {
      const lang = regularMatch[1];
      markdownByLang[lang] = files[path] as string;
    }
  }
  
  /**
   * Get markdown content for a specific language.
   * Falls back to the default language if unavailable.
   */
  export function getMarkdown(lang: string): string {
    return markdownByLang[lang] || markdownByLang[defaultLang] || "CV not found";
  }
  
  export const supportedLanguages = Object.keys(markdownByLang);
  export { defaultLang };