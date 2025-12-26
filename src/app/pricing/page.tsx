export default function PricingPage() {
  return (
    <main className="container" style={{ paddingTop: 40, paddingBottom: 60 }}>
      <div className="pill">
        <span>Professional HOA Communication</span>
        <span style={{ opacity: 0.7 }}>•</span>
        <span>Authority without escalation</span>
      </div>

      <h1 style={{ fontSize: 52, lineHeight: 1.05, marginTop: 18, marginBottom: 10 }}>
        Pricing that matches the responsibility of HOA governance.
      </h1>
      <p className="muted" style={{ fontSize: 18, maxWidth: 860 }}>
        These notices are designed to protect your community, reduce disputes, and document expectations clearly—
        without sounding aggressive. Built for boards and property managers who want calm authority.
      </p>

      <div className="grid two" style={{ marginTop: 22 }}>
        <div className="card" style={{ padding: 18 }}>
          <div style={{ fontWeight: 900, fontSize: 20 }}>One-time</div>
          <div className="muted" style={{ marginTop: 6 }}>For occasional use.</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 10 }}>$5</div>
          <div className="small">per notice</div>
          <div className="hr" />
          <ul className="muted" style={{ marginTop: 0, paddingLeft: 18 }}>
            <li>Professional tone (friendly/neutral/firm)</li>
            <li>Guideline references (when provided)</li>
            <li>Export to TXT / DOCX / PDF</li>
          </ul>
          <div className="small" style={{ marginTop: 10 }}>Secure payment via Stripe.</div>
          <a href="/" className="button" style={{ display: "inline-block", textDecoration: "none", marginTop: 12 }}>Draft a notice</a>
        </div>

        <div className="card" style={{ padding: 18, borderColor: "rgba(124,58,237,0.35)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div style={{ fontWeight: 900, fontSize: 20 }}>Professional</div>
            <span className="badge">Most popular</span>
          </div>
          <div className="muted" style={{ marginTop: 6 }}>For boards and managers.</div>
          <div style={{ fontSize: 34, fontWeight: 900, marginTop: 10 }}>$15</div>
          <div className="small">per month</div>
          <div className="hr" />
          <ul className="muted" style={{ marginTop: 0, paddingLeft: 18 }}>
            <li>Unlimited notices</li>
            <li>Saved community profiles (guidelines + letterhead)</li>
            <li>Logo-branded HOA PDF templates</li>
            <li>Direct email delivery (SendGrid)</li>
          </ul>
          <div className="small" style={{ marginTop: 10 }}>Cancel anytime.</div>
          <a href="/" className="button primary" style={{ display: "inline-block", textDecoration: "none", marginTop: 12 }}>Start drafting</a>
        </div>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 18 }}>
        <div style={{ fontWeight: 900 }}>Trust notes</div>
        <div className="muted" style={{ marginTop: 6 }}>
          Draft assistance only (not legal advice). You control the final wording and delivery. We do not store your generated
          letters unless you choose to copy/download/send.
        </div>
      </div>
    </main>
  );
}
