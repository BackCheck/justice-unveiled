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
  ogImage?: string;
  ogType?: "website" | "article";
}

const DEFAULT_IMAGE = "https://hrpm.org/og-image.png";
const SITE_NAME = "HRPM.org";
const DEFAULT_DESCRIPTION = "Human Rights Protection Movement - Documenting injustice, demanding accountability.";

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
  ogImage,
  ogType,
}: SEOProps) => {
  useEffect(() => {
    // Update document title
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Human Rights Protection Movement`;
    document.title = fullTitle;

    // Helper to update or create meta tag
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

    // Basic meta tags
    updateMetaTag("description", description);
    updateMetaTag("author", author);
    if (keywords.length > 0) {
      updateMetaTag("keywords", keywords.join(", "));
    }

    // Open Graph
    updateMetaTag("og:title", title || SITE_NAME, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:image", ogImage || image, true);
    updateMetaTag("og:type", ogType || type, true);
    updateMetaTag("og:site_name", SITE_NAME, true);
    if (url) {
      updateMetaTag("og:url", url, true);
    }

    // Article specific
    if (type === "article") {
      if (publishedTime) {
        updateMetaTag("article:published_time", publishedTime, true);
      }
      if (modifiedTime) {
        updateMetaTag("article:modified_time", modifiedTime, true);
      }
      if (author) {
        updateMetaTag("article:author", author, true);
      }
      if (section) {
        updateMetaTag("article:section", section, true);
      }
      tags.forEach((tag, index) => {
        updateMetaTag(`article:tag:${index}`, tag, true);
      });
    }

    // Twitter
    updateMetaTag("twitter:title", title || SITE_NAME);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", image);

    // Cleanup function to reset on unmount
    return () => {
      document.title = `${SITE_NAME} | Human Rights Protection Movement`;
    };
  }, [title, description, image, url, type, publishedTime, modifiedTime, author, section, tags, keywords, ogImage, ogType]);
};

export default useSEO;
