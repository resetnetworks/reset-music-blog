interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  tags?: string[];
  canonicalUrl?: string;
}

export function generateMetaTags({
  title = "Reset Music",
  description = "A modern editorial platform for music culture, production techniques, and artist education.",
  image = "/og-default.jpg",
  type = "website",
  publishedAt,
  updatedAt,
  author,
  tags,
  canonicalUrl,
}: SeoProps) {
  const fullTitle = title === "Reset Music" ? title : `${title} | Reset Music`;

  return {
    title: fullTitle,
    meta: [
      { name: "description", content: description },
      { name: "keywords", content: tags?.join(", ") || "music production, music industry, sound design, mixing, mastering, electronic music" },

      // Open Graph
      { property: "og:title", content: fullTitle },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:image", content: image },
      { property: "og:site_name", content: "Reset Music" },

      // Twitter Card
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: fullTitle },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: image },

      // Article specific
      ...(type === "article" && publishedAt
        ? [
            { property: "article:published_time", content: publishedAt },
            ...(updatedAt ? [{ property: "article:modified_time", content: updatedAt }] : []),
            ...(author ? [{ property: "article:author", content: author }] : []),
          ]
        : []),
    ],
    link: canonicalUrl
      ? [{ rel: "canonical", href: canonicalUrl }]
      : [],
  };
}

export function generateJsonLd({
  title,
  description,
  image,
  type = "website",
  publishedAt,
  updatedAt,
  author,
  slug,
}: SeoProps & { slug?: string }) {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (type === "article" && slug) {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      image: image || `${baseUrl}/og-default.jpg`,
      datePublished: publishedAt,
      dateModified: updatedAt || publishedAt,
      author: {
        "@type": "Person",
        name: author || "Reset Music",
      },
      publisher: {
        "@type": "Organization",
        name: "Reset Music",
        logo: {
          "@type": "ImageObject",
          url: `${baseUrl}/logo.png`,
        },
      },
      url: `${baseUrl}/blog/${slug}`,
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Reset Music",
    description,
    url: baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${baseUrl}/blog?search={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}
