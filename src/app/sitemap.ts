import type { MetadataRoute } from "next";

const base = process.env.APP_URL || "https://hoa-letter-ai.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "pricing", "community", "privacy", "terms", "refunds", "contact", "security", "email-setup"].map((p) => `${base}/${p}`.replace(/\/+$|\/\//g, "/"));
  const now = new Date();
  return pages.map((url) => ({ url, lastModified: now }));
}
