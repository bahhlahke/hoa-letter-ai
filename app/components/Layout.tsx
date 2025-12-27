// Layout wrapper with disclaimer
export default function Layout({ children }) {
  return (
    <div className="layout">
      {children}
      <footer>
        <p>Draft assistance only — not legal advice. No personal data is stored.</p>
      </footer>
    </div>
  );
}
