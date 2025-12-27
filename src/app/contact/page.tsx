import Footer from "@/components/Footer";

export const metadata = {
  title: "Contact | HOA Letter AI",
  description: "Get support for HOA Letter AI billing, access, and deliverability."
};

export default function ContactPage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="pill">Support</div>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Contact</h1>
      <p className="muted" style={{ maxWidth: 820 }}>
        Reach out for billing help, deliverability questions, or citation guidance. We usually respond within two business days.
      </p>

      <div className="card" style={{ padding: 18, marginTop: 16 }}>
        <h2 style={{ margin: "0 0 8px" }}>Support email</h2>
        <p className="small" style={{ marginTop: 0 }}>
          Email <a href="mailto:support@hoa-letter-ai.com">support@hoa-letter-ai.com</a> with your community name and a brief
          description. Include your Stripe receipt email if the request involves billing.
        </p>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>What to include</h2>
        <ul className="small" style={{ paddingLeft: 18, marginTop: 0 }}>
          <li>For deliverability: sending email address used, recipient address, and timestamp.</li>
          <li>For guideline citations: a short excerpt of the guideline text you want cited.</li>
          <li>For billing: the checkout email and whether it was subscription or one-time.</li>
        </ul>
      </div>

      <Footer />
    </main>
  );
}
