import { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      {children}
      <footer>
        <p>Draft assistance only — not legal advice. No personal data is stored.</p>
      </footer>
    </div>
  );
}
