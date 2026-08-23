import { describe, expect, it } from "vitest";

import { splitFrontmatter } from "../../src/lib/splitFrontmatter";

describe("splitFrontmatter", () => {
  it("parses yaml frontmatter and markdown body", () => {
    const result = splitFrontmatter(`---
lang: en
label: English
---

# John Doe
`);

    expect(result.data).toEqual({
      lang: "en",
      label: "English",
    });
    expect(result.content).toBe("# John Doe");
  });

  it("returns empty data when frontmatter is missing", () => {
    const result = splitFrontmatter("# Heading only");

    expect(result.data).toEqual({});
    expect(result.content).toBe("# Heading only");
  });

  it("strips $schema and parses the remaining yaml fields", () => {
    const result = splitFrontmatter(`---
$schema: ../config/cv.frontmatter.schema.json
lang: de
---

# DE
`);

    expect(result.data).toMatchObject({
      $schema: "../config/cv.frontmatter.schema.json",
      lang: "de",
    });
  });

  it("trims markdown body whitespace", () => {
    const result = splitFrontmatter(`---
lang: en
---


  # Heading  

`);

    expect(result.content).toBe("# Heading");
  });

  it("handles CRLF line endings in frontmatter", () => {
    const result = splitFrontmatter("---\r\nlang: en\r\n---\r\n# Body");

    expect(result.data).toEqual({ lang: "en" });
    expect(result.content).toBe("# Body");
  });

  it("treats a four-dash opener as plain markdown", () => {
    const raw = "----\nlang: en\n---\n# Body";
    const result = splitFrontmatter(raw);

    expect(result.data).toEqual({});
    expect(result.content).toBe(raw.trim());
  });

  it("returns empty data for an empty frontmatter block", () => {
    const result = splitFrontmatter("---\n---\n# Body");

    expect(result.data).toEqual({});
    expect(result.content).toBe("# Body");
  });

  it("returns empty data when yaml parses to a non-object value", () => {
    const result = splitFrontmatter(`---
just-a-string
---

# Body
`);

    expect(result.data).toEqual({});
    expect(result.content).toBe("# Body");
  });

  it("returns empty data when yaml parses to an array", () => {
    const result = splitFrontmatter(`---
- en
- de
---

# Body
`);

    expect(result.data).toEqual({});
    expect(result.content).toBe("# Body");
  });

  it("handles frontmatter without a closing delimiter", () => {
    const result = splitFrontmatter("---\nlang: en\n");

    expect(result.data).toEqual({ lang: "en" });
    expect(result.content).toBe("");
  });

  it("ignores yaml comments without corrupting data", () => {
    const result = splitFrontmatter(`---
# top comment
lang: en # trailing comment
---

# Body
`);

    expect(result.data).toEqual({ lang: "en" });
    expect(result.content).toBe("# Body");
  });

  it("preserves block scalar lines that start with #", () => {
    const result = splitFrontmatter(`---
lang: en
note: |
  # not a comment
  plain line
---

# Body
`);

    expect(result.data).toEqual({
      lang: "en",
      note: "# not a comment\nplain line\n",
    });
  });

  it("keeps a horizontal rule right after the frontmatter in content", () => {
    const result = splitFrontmatter("---\nlang: en\n---\n\n---\n\n# Body");

    expect(result.data).toEqual({ lang: "en" });
    expect(result.content).toBe("---\n\n# Body");
  });

  it("does not treat a four-dash line as the closing delimiter", () => {
    const result = splitFrontmatter("---\nlang: en\n----\n# Body");

    expect(result.data).toEqual({});
    expect(result.content).toBe("");
  });

  it("returns empty data instead of throwing on malformed yaml", () => {
    const result = splitFrontmatter("---\nlang: [unclosed\n---\n# Body");

    expect(result.data).toEqual({});
  });
});
