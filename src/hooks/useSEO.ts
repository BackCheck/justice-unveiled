import { useEffect } from "react";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
  keywords?: string[];
  canonicalUrl?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown>;
}

const DEFAULT_IMAGE = "https://hrpm.org/og-image.png";
const SITE_NAME = "HRPM.org";
const BASE_URL = "https://hrpm.org";
const DEFAULT_DESCRIPTION = "Human Rights Protection Movement - Documenting injustice, demanding accountability.";
const DEFAULT_KEYWORDS = [
  "human rights", "protection", "advocacy", "injustice", "accountability",
  "violations", "investigative journalism", "evidence", "legal documentation",
  "civil rights", "international law", "HRPM", "open source", "non-profit"
];

export const useSEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  publishedTime,
  modifiedTime,
  author = "HRPM",
  section,
  tags = [],
  keywords = [],
  canonicalUrl,
  noindex = false,
  jsonLd,
}: SEOProps) => {
  useEffect(() => {
    // Title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Human Rights Protection Movement`;
    document.title = fullTitle;

    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    // Basic meta
    updateMetaTag("description", description);
    updateMetaTag("author", author);
    
    // Keywords
    const allKeywords = [...new Set([...DEFAULT_KEYWORDS, ...keywords, ...tags])];
    updateMetaTag("keywords", allKeywords.join(", "));

    // Robots
    updateMetaTag("robots", noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    // Open Graph
    updateMetaTag("og:title", title || SITE_NAME, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:image", image, true);
    updateMetaTag("og:type", type, true);
    updateMetaTag("og:site_name", SITE_NAME, true);
    updateMetaTag("og:locale", "en_US", true);
    if (url) {
      updateMetaTag("og:url", url, true);
    }

    // Article specific
    if (type === "article") {
      if (publishedTime) updateMetaTag("article:published_time", publishedTime, true);
      if (modifiedTime) updateMetaTag("article:modified_time", modifiedTime, true);
      if (author) updateMetaTag("article:author", author, true);
      if (section) updateMetaTag("article:section", section, true);
      tags.forEach((tag, index) => {
        updateMetaTag(`article:tag:${index}`, tag, true);
      });
    }

    // Twitter Card
    updateMetaTag("twitter:card", type === "article" ? "summary_large_image" : "summary_large_image");
    updateMetaTag("twitter:site", "@HRPM_org");
    updateMetaTag("twitter:creator", "@HRPM_org");
    updateMetaTag("twitter:title", title || SITE_NAME);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);

    // Canonical URL
    const canonical = canonicalUrl || url;
    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }
      link.setAttribute("href", canonical);
    }

    // JSON-LD structured data
    let jsonLdScript: HTMLScriptElement | null = null;
    if (jsonLd) {
      jsonLdScript = document.createElement("script");
      jsonLdScript.type = "application/ld+json";
      jsonLdScript.id = "dynamic-jsonld";
      // Remove old one first
      const existing = document.getElementById("dynamic-jsonld");
      if (existing) existing.remove();
      jsonLdScript.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(jsonLdScript);
    }

    // Cleanup
    return () => {
      document.title = `${SITE_NAME} | Human Rights Protection Movement`;
      if (jsonLdScript) jsonLdScript.remove();
    };
  }, [title, description, image, url, type, publishedTime, modifiedTime, author, section, tags, keywords, canonicalUrl, noindex, jsonLd]);
};

export default useSEO;
