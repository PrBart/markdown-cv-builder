/** @vitest-environment happy-dom */

import { beforeEach, describe, expect, it } from "vitest";

import { applySiteMeta, resolvePublicAsset } from "../../src/lib/applySiteMeta";
import type { CVDocument } from "../../src/types/cv";

function createMetaDocument() {
  document.head.innerHTML = `
    <meta name="description" content="" />
    <meta property="og:title" content="" />
    <meta property="og:description" content="" />
    <meta property="og:site_name" content="" />
    <meta property="og:url" content="" />
    <meta property="og:image" content="" />
    <meta name="twitter:title" content="" />
    <meta name="twitter:description" content="" />
    <meta name="twitter:image" content="" />
    <meta name="twitter:card" content="" />
    <meta name="language" content="" />
    <link rel="icon" href="" />
  `;
}

function createCV(overrides: Partial<CVDocument> = {}): CVDocument {
  return {
    lang: "en",
    label: "English",
    default: true,
    printLabel: "Print / Save PDF",
    content: "# Example",
    ...overrides,
  };
}

describe("resolvePublicAsset", () => {
  it("builds an absolute URL from a public asset path", () => {
    const url = resolvePublicAsset("assets/og-preview.svg");

    expect(url).toBe(`${window.location.origin}/assets/og-preview.svg`);
  });

  it("strips a leading slash from asset paths", () => {
    const url = resolvePublicAsset("/favicon.svg");

    expect(url).toBe(`${window.location.origin}/favicon.svg`);
  });

  it("respects import.meta.env.BASE_URL for nested deployments", () => {
    const originalBaseUrl = import.meta.env.BASE_URL;
    import.meta.env.BASE_URL = "/my-cv/";

    expect(resolvePublicAsset("favicon.svg")).toBe(
      `${window.location.origin}/my-cv/favicon.svg`,
    );

    import.meta.env.BASE_URL = originalBaseUrl;
  });

  it("uses siteUrl as the asset origin when provided", () => {
    const url = resolvePublicAsset(
      "assets/og-preview.svg",
      "https://example.com/cv",
    );

    expect(url).toBe("https://example.com/cv/assets/og-preview.svg");
  });

  it("normalizes siteUrl base when BASE_URL has no trailing slash", () => {
    const originalBaseUrl = import.meta.env.BASE_URL;
    import.meta.env.BASE_URL = "";

    expect(resolvePublicAsset("favicon.svg", "https://example.com/cv")).toBe(
      "https://example.com/cv/favicon.svg",
    );

    import.meta.env.BASE_URL = originalBaseUrl;
  });
});

describe("applySiteMeta", () => {
  beforeEach(() => {
    createMetaDocument();
    document.title = "";
    document.documentElement.lang = "";
  });

  it("updates title and description meta tags", () => {
    applySiteMeta(
      createCV({
        title: "Jane Doe — CV",
        description: "Software engineer resume",
      }),
    );

    expect(document.title).toBe("Jane Doe — CV");
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "Software engineer resume",
    );
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      "content",
      "Jane Doe — CV",
    );
  });

  it("sets the html lang attribute and language meta to the language code", () => {
    applySiteMeta(createCV({ lang: "de", label: "Deutsch" }));

    expect(document.documentElement.lang).toBe("de");
    expect(document.querySelector('meta[name="language"]')).toHaveAttribute(
      "content",
      "de",
    );
  });

  it("uses fallback favicon and ogImage from the default language", () => {
    applySiteMeta(
      createCV({ lang: "de", label: "Deutsch" }),
      createCV({
        favicon: "favicon.svg",
        ogImage: "assets/og-preview.svg",
      }),
    );

    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
      "href",
      `${window.location.origin}/favicon.svg`,
    );
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      "content",
      `${window.location.origin}/assets/og-preview.svg`,
    );
    expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "summary_large_image",
    );
  });

  it("prefers language-specific assets over fallback defaults", () => {
    applySiteMeta(
      createCV({
        lang: "de",
        label: "Deutsch",
        favicon: "de-favicon.svg",
        ogImage: "assets/de-preview.svg",
      }),
      createCV({
        favicon: "favicon.svg",
        ogImage: "assets/og-preview.svg",
      }),
    );

    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
      "href",
      `${window.location.origin}/de-favicon.svg`,
    );
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      "content",
      `${window.location.origin}/assets/de-preview.svg`,
    );
  });

  it("sets favicon mime types for svg, png, and ico", () => {
    applySiteMeta(createCV({ favicon: "favicon.svg" }));
    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
      "type",
      "image/svg+xml",
    );

    applySiteMeta(createCV({ favicon: "icon.png" }));
    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
      "type",
      "image/png",
    );

    applySiteMeta(createCV({ favicon: "icon.ico" }));
    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
      "type",
      "image/x-icon",
    );
  });

  it("removes favicon type for unknown extensions", () => {
    applySiteMeta(createCV({ favicon: "favicon.jpg" }));

    const link = document.querySelector('link[rel="icon"]');
    expect(link).not.toHaveAttribute("type");
    expect(link).toHaveAttribute(
      "href",
      `${window.location.origin}/favicon.jpg`,
    );
  });

  it("creates a favicon link when one does not exist", () => {
    document.head.innerHTML = "";
    applySiteMeta(createCV({ favicon: "favicon.svg" }));

    const link = document.querySelector('link[rel="icon"]');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute("type", "image/svg+xml");
  });

  it("does not throw when expected meta tags are missing", () => {
    document.head.innerHTML = "";

    expect(() =>
      applySiteMeta(
        createCV({
          title: "Safe Title",
          description: "Safe description",
          favicon: "favicon.svg",
          ogImage: "assets/og-preview.svg",
        }),
      ),
    ).not.toThrow();

    expect(document.title).toBe("Safe Title");
  });

  it("leaves document.title unchanged when cv has no title", () => {
    document.title = "Initial title";
    applySiteMeta(createCV({ title: undefined }));

    expect(document.title).toBe("Initial title");
  });

  it("does not set twitter:card when ogImage is absent", () => {
    applySiteMeta(createCV({ ogImage: undefined }));

    expect(document.querySelector('meta[name="twitter:card"]')).toHaveAttribute(
      "content",
      "",
    );
  });

  it("sets og:url from siteUrl and current pathname", () => {
    window.history.pushState({}, "", "/de");

    applySiteMeta(
      createCV({
        siteUrl: "https://example.com/cv",
      }),
    );

    expect(document.querySelector('meta[property="og:url"]')).toHaveAttribute(
      "content",
      "https://example.com/cv/de",
    );
  });

  it("uses siteUrl for absolute og:image and favicon URLs", () => {
    applySiteMeta(
      createCV({
        siteUrl: "https://example.com/cv",
        favicon: "favicon.svg",
        ogImage: "assets/og-preview.svg",
      }),
    );

    expect(document.querySelector('link[rel="icon"]')).toHaveAttribute(
      "href",
      "https://example.com/cv/favicon.svg",
    );
    expect(document.querySelector('meta[property="og:image"]')).toHaveAttribute(
      "content",
      "https://example.com/cv/assets/og-preview.svg",
    );
  });
});
