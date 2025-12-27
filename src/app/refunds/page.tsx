import Footer from "@/components/Footer";

export const metadata = {
  title: "Refund Policy | HOA Letter AI",
  description: "How refunds are handled for one-time purchases and subscriptions."
};

export default function RefundPage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="pill">Billing</div>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Refund Policy</h1>
      <p className="muted" style={{ maxWidth: 820 }}>
        Clear refunds help you stay confident when upgrading.
      </p>

      <div className="card" style={{ padding: 18, marginTop: 16 }}>
        <h2 style={{ margin: "0 0 8px" }}>$5 one-time</h2>
        <p className="small" style={{ marginTop: 0 }}>
          One export/email credit for a single notice, valid for 24 hours. If you purchased by accident and have not used the
          export/email, contact support within 3 days for a refund.
        </p>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>$15/month subscription</h2>
        <p className="small" style={{ marginTop: 0 }}>
          Cancel anytime from your Stripe receipt or by emailing support. Subscriptions are billed in advance; partial month
          refunds are not offered, but we will cancel renewals immediately upon request.
        </p>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>How to request</h2>
        <p className="small" style={{ marginTop: 0 }}>
          Email <a href="mailto:support@hoa-letter-ai.com">support@hoa-letter-ai.com</a> with your checkout email and Stripe
          receipt. We respond within two business days.
        </p>
      </div>

      <Footer />
    </main>
  );
}
