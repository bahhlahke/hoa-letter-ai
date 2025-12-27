import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy | HOA Letter AI",
  description: "How HOA Letter AI handles data, storage, and user rights."
};

export default function PrivacyPage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="pill">Trust & Safety</div>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Privacy Policy</h1>
      <p className="muted" style={{ maxWidth: 820 }}>
        We keep your HOA notices focused on your community while minimizing the data we store.
      </p>

      <div className="card" style={{ padding: 18, marginTop: 16 }}>
        <h2 style={{ margin: "0 0 8px" }}>What we collect</h2>
        <ul className="small" style={{ paddingLeft: 18, marginTop: 0 }}>
          <li>Inputs you provide when drafting a notice (letter details, names, dates).</li>
          <li>Community profile data you save in Supabase (guideline text/URLs, letterhead, optional logos).</li>
          <li>Payment details are handled by Stripe; we do not store card data.</li>
          <li>Emails sent through the app use SendGrid and include the draft content.</li>
        </ul>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>Storage & retention</h2>
        <p className="small" style={{ marginTop: 0 }}>
          Drafts generated in the editor stay in your browser unless you save or send them. Saved community profiles and
          branding assets live in Supabase. Uploaded logos are stored in the "logos" bucket. Prompt text sent to the AI
          model may be logged for quality and abuse prevention; we keep requests minimal and avoid long-term retention when
          not required. You can delete community records in Supabase if you need them removed.
        </p>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>Your rights</h2>
        <p className="small" style={{ marginTop: 0 }}>
          You may request access or deletion of your stored community data and branding assets at any time. Contact us at
          <a href="mailto:support@hoa-letter-ai.com"> support@hoa-letter-ai.com</a> and we will respond within two business days.
        </p>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>Data security</h2>
        <p className="small" style={{ marginTop: 0 }}>
          We use Supabase for managed database and storage, Stripe for payments, and SendGrid for email delivery. Access to
          service keys is restricted via environment variables. For additional security practices, see our security notes.
        </p>
      </div>

      <Footer />
    </main>
  );
}
