import Footer from "@/components/Footer";

export const metadata = {
  title: "Security | HOA Letter AI",
  description: "Operational security notes for HOA Letter AI."
};

export default function SecurityPage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="pill">Safety</div>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Security & Deliverability</h1>
      <p className="muted" style={{ maxWidth: 820 }}>
        Quick facts about how we protect access, data, and outbound email quality.
      </p>

      <div className="card" style={{ padding: 18, marginTop: 16 }}>
        <h2 style={{ margin: "0 0 8px" }}>Infrastructure</h2>
        <ul className="small" style={{ paddingLeft: 18, marginTop: 0 }}>
          <li>Hosted on Vercel with HTTPS by default.</li>
          <li>Supabase for database and storage; access keys kept in environment variables.</li>
          <li>Stripe for PCI-compliant checkout; no card data is stored on our servers.</li>
        </ul>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>Email authentication</h2>
        <p className="small" style={{ marginTop: 0 }}>
          Configure SPF, DKIM, and DMARC for the From domain used in SendGrid. Domain authentication reduces spam filtering and
          keeps board communications trusted. See the email setup notes for a checklist.
        </p>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>Abuse and rate limits</h2>
        <p className="small" style={{ marginTop: 0 }}>
          Drafting, exports, and email delivery include rate limits to block automated abuse. Excessive or suspicious activity
          may be paused automatically.
        </p>
      </div>

      <Footer />
    </main>
  );
}
