import type { MetadataRoute } from "next";

/**
 * app.buxmate.com is a private authenticated app — block crawlers from
 * indexing guest routes, events, and API. Auth pages remain reachable but
 * global metadata also sets noindex.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: [
        "/",
        "/events",
        "/e/",
        "/join/",
        "/settings",
        "/api/",
      ],
    },
  };
}
