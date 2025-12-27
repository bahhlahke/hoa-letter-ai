export default function Footer() {
  return (
    <footer style={{ padding: "28px 0 10px" }} className="small">
      <div className="hr" />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span>© {new Date().getFullYear()} HOA Letter AI</span>
        <span style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a href="/refunds">Refunds</a>
          <a href="/contact">Contact</a>
        </span>
        <span>Draft assistance only — not legal advice.</span>
      </div>
    </footer>
  );
}
