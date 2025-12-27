import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${process.env.APP_URL || "https://hoa-letter-ai.vercel.app"}/sitemap.xml`,
  };
}
