export const metadata = {
  title: "HOA Letter AI",
  description: "Generate HOA violation letters",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
