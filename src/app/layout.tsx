import "./globals.css";
import React from "react";

export const metadata = {
  title: "HOA Letter AI",
  description: "Professional HOA notices with guideline citations, branded PDFs, and delivery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
