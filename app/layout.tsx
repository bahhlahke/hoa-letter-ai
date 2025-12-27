export const metadata = {
  title: 'HOA Letter AI',
  description: 'Generate calm, clear, professional HOA notices in seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}