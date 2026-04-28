import { useEffect } from "react";

interface SeoMetadataProps {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "video.movie" | "video.tv_show";
  url?: string;
}

const SeoMetadata = ({ title, description, image, type = "website", url }: SeoMetadataProps) => {
  useEffect(() => {
    // Update Title
    document.title = `${title} | JARVIS HUB`;

    // Helper to update or create meta tags
    const updateMetaTag = (property: string, content: string, isName = false) => {
      if (!content) return;
      const selector = isName ? `meta[name="${property}"]` : `meta[property="${property}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement("meta");
        if (isName) {
          tag.setAttribute("name", property);
        } else {
          tag.setAttribute("property", property);
        }
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    // OpenGraph Tags
    updateMetaTag("og:title", title);
    updateMetaTag("og:description", description || "Stream your favorite movies and TV shows on JARVIS HUB.");
    updateMetaTag("og:image", image || "/og-image.png");
    updateMetaTag("og:type", type);
    updateMetaTag("og:url", url || window.location.href);
    updateMetaTag("og:site_name", "JARVIS HUB");

    // Twitter Tags
    updateMetaTag("twitter:card", "summary_large_image", true);
    updateMetaTag("twitter:title", title, true);
    updateMetaTag("twitter:description", description || "Stream your favorite movies and TV shows on JARVIS HUB.", true);
    updateMetaTag("twitter:image", image || "/og-image.png", true);

    // Standard Description
    updateMetaTag("description", description || "Stream your favorite movies and TV shows on JARVIS HUB.", true);

  }, [title, description, image, type, url]);

  return null; // This component doesn't render anything
};

export default SeoMetadata;
