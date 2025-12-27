// app/layout.tsx
export const metadata = {
  title: "HOA Letter AI",
  description: "Generate clear, compliant HOA notices in seconds."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
