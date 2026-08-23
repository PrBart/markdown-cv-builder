import { parse as parseYaml } from "yaml";

interface SplitFrontmatterResult {
  data: Record<string, unknown>;
  content: string;
}

const CLOSE_DELIMITER = /\n---(?:\r?\n|$)/;

function stripLeadingNewline(value: string): string {
  if (value.startsWith("\r\n")) {
    return value.slice(2);
  }
  if (value.startsWith("\n") || value.startsWith("\r")) {
    return value.slice(1);
  }
  return value;
}

export function splitFrontmatter(raw: string): SplitFrontmatterResult {
  if (!raw.startsWith("---") || raw.charAt(3) === "-") {
    return { data: {}, content: raw.trim() };
  }

  const body = raw.slice(3);
  const closeMatch = CLOSE_DELIMITER.exec(body);
  const matterBlock = stripLeadingNewline(
    closeMatch ? body.slice(0, closeMatch.index) : body,
  );
  let content = closeMatch
    ? body.slice(closeMatch.index + closeMatch[0].length)
    : "";
  content = stripLeadingNewline(content);

  let parsed: unknown;
  try {
    parsed = parseYaml(matterBlock.trim());
  } catch {
    return { data: {}, content: content.trim() };
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return { data: {}, content: content.trim() };
  }

  return {
    data: parsed as Record<string, unknown>,
    content: content.trim(),
  };
}
