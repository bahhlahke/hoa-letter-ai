import "./globals.css";
import React from "react";
import type { Metadata } from "next";

const appUrl = process.env.APP_URL || "https://hoa-letter-ai.vercel.app";
const description = "Professional HOA notices with guideline citations, branded PDFs, and delivery.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "HOA Letter AI",
    template: "%s | HOA Letter AI",
  },
  description,
  keywords: ["HOA", "letters", "community", "notice", "guidelines", "SendGrid", "Stripe"],
  alternates: { canonical: appUrl },
  openGraph: {
    title: "HOA Letter AI",
    description,
    url: appUrl,
    siteName: "HOA Letter AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HOA Letter AI",
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
