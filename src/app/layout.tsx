import React from 'react';

export const metadata = {
  title: "HOA Letter AI",
  description: "Generate HOA violation letters using AI",
};

// Root layout for Next.js App Router. This ensures every page renders
// within a consistent HTML skeleton. Without a root layout, builds
// will fail as Next.js requires one in the `app` directory.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}