import type { CVDocument } from "../types/cv";

function setMetaTag(
  selector: string,
  attribute: "content" | "property",
  value: string,
) {
  const element = document.querySelector(selector);
  if (element) {
    element.setAttribute(attribute, value);
  }
}

function normalizeSiteUrl(siteUrl: string): string {
  return siteUrl.replace(/\/+$/, "");
}

export function resolvePublicAsset(path: string, siteUrl?: string): string {
  const normalized = path.replace(/^\//, "");
  const base = siteUrl
    ? `${normalizeSiteUrl(siteUrl)}${import.meta.env.BASE_URL}`
    : `${window.location.origin}${import.meta.env.BASE_URL}`;

  return new URL(normalized, base.endsWith("/") ? base : `${base}/`).href;
}

function resolvePageUrl(siteUrl?: string): string {
  if (siteUrl) {
    const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
    return `${normalizeSiteUrl(siteUrl)}${pathname === "/" ? "" : pathname}`;
  }

  return window.location.href;
}

function getFaviconType(path: string): string | undefined {
  if (path.endsWith(".svg")) {
    return "image/svg+xml";
  }
  if (path.endsWith(".png")) {
    return "image/png";
  }
  if (path.endsWith(".ico")) {
    return "image/x-icon";
  }
  return undefined;
}

function setFavicon(path: string, siteUrl?: string) {
  const href = resolvePublicAsset(path, siteUrl);
  const type = getFaviconType(path);
  let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement | null;

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = href;
  if (type) {
    link.type = type;
  } else {
    link.removeAttribute("type");
  }
}

export function applySiteMeta(cv: CVDocument, fallback?: CVDocument) {
  const siteUrl = cv.siteUrl ?? fallback?.siteUrl;
  const favicon = cv.favicon ?? fallback?.favicon;
  const ogImage = cv.ogImage ?? fallback?.ogImage;

  document.documentElement.lang = cv.lang;

  if (cv.title) {
    document.title = cv.title;
  }

  if (cv.description) {
    setMetaTag('meta[name="description"]', "content", cv.description);
    setMetaTag('meta[property="og:description"]', "content", cv.description);
    setMetaTag('meta[name="twitter:description"]', "content", cv.description);
  }

  if (cv.title) {
    setMetaTag('meta[property="og:title"]', "content", cv.title);
    setMetaTag('meta[name="twitter:title"]', "content", cv.title);
    setMetaTag('meta[property="og:site_name"]', "content", cv.title);
  }

  setMetaTag('meta[property="og:url"]', "content", resolvePageUrl(siteUrl));

  if (ogImage) {
    const imageUrl = resolvePublicAsset(ogImage, siteUrl);
    setMetaTag('meta[property="og:image"]', "content", imageUrl);
    setMetaTag('meta[name="twitter:image"]', "content", imageUrl);
    setMetaTag('meta[name="twitter:card"]', "content", "summary_large_image");
  }

  if (favicon) {
    setFavicon(favicon, siteUrl);
  }

  setMetaTag('meta[name="language"]', "content", cv.lang);
}
