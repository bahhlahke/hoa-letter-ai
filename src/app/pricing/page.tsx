export default function PricingPage() {
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      <h1>Professional HOA Communication</h1>
      <p>Designed for boards and property managers who need authority without escalation.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <div>
          <h2>One‑Time Notice</h2>
          <p>$5 per letter</p>
          <ul>
            <li>Professional wording</li>
            <li>Guideline citation</li>
            <li>PDF / Word export</li>
          </ul>
        </div>

        <div>
          <h2>Professional Subscription</h2>
          <p>$15 / month</p>
          <ul>
            <li>Unlimited notices</li>
            <li>Saved communities</li>
            <li>Letterhead + logo</li>
            <li>Email delivery</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
