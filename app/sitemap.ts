import type { MetadataRoute } from "next";

/** App-only: no public marketing pages to index. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [];
}
