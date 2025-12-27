import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Use | HOA Letter AI",
  description: "Draft assistance terms, responsibilities, and prohibited uses."
};

export default function TermsPage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="pill">Legal Basics</div>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Terms of Use</h1>
      <p className="muted" style={{ maxWidth: 820 }}>
        HOA Letter AI helps you draft HOA correspondence quickly. It does not replace professional advice.
      </p>

      <div className="card" style={{ padding: 18, marginTop: 16 }}>
        <h2 style={{ margin: "0 0 8px" }}>Draft assistance only</h2>
        <p className="small" style={{ marginTop: 0 }}>
          The service provides AI-generated drafts based on your inputs. It is not legal advice, does not create
          attorney-client relationships, and should be reviewed by your board or counsel before sending.
        </p>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>User responsibilities</h2>
        <ul className="small" style={{ paddingLeft: 18, marginTop: 0 }}>
          <li>Confirm accuracy of all facts, guideline citations, and deadlines before sending.</li>
          <li>Ensure notices comply with your governing documents and applicable law.</li>
          <li>Do not upload unlawful content or materials you lack rights to use.</li>
          <li>Respect privacy when entering homeowner information.</li>
        </ul>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>Prohibited uses</h2>
        <p className="small" style={{ marginTop: 0 }}>
          No harassment, discriminatory notices, spam, or automated bulk sending. Abuse and excessive traffic may be
          rate-limited or suspended.
        </p>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>Liability</h2>
        <p className="small" style={{ marginTop: 0 }}>
          The service is provided “as is” without warranties. To the maximum extent permitted by law, liability is limited
          to the amount you paid for the service. Governing law: your state/country (update for your deployment).
        </p>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>Support</h2>
        <p className="small" style={{ marginTop: 0 }}>
          For questions, contact <a href="mailto:support@hoa-letter-ai.com">support@hoa-letter-ai.com</a>. We aim to respond
          within two business days.
        </p>
      </div>

      <Footer />
    </main>
  );
}
