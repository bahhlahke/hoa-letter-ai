import "./globals.css";
import React from "react";

export const metadata = {
  title: "HOA Letter AI",
  description: "Create professional HOA violation notices in seconds."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
