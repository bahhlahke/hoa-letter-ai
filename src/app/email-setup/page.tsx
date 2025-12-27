import Footer from "@/components/Footer";

export const metadata = {
  title: "Email Setup | HOA Letter AI",
  description: "Improve deliverability with SPF, DKIM, and DMARC for SendGrid."
};

export default function EmailSetupPage() {
  return (
    <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
      <div className="pill">Deliverability</div>
      <h1 style={{ fontSize: 40, marginBottom: 8 }}>Email Setup</h1>
      <p className="muted" style={{ maxWidth: 820 }}>
        Configure your domain so homeowners receive notices reliably.
      </p>

      <div className="card" style={{ padding: 18, marginTop: 16 }}>
        <h2 style={{ margin: "0 0 8px" }}>From address</h2>
        <p className="small" style={{ marginTop: 0 }}>
          Use a consistent From address (for example, support@hoa-letter-ai.com or a verified board address). Update the
          FROM_EMAIL environment variable to match the domain you authenticate in SendGrid.
        </p>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>SPF, DKIM, DMARC</h2>
        <ul className="small" style={{ paddingLeft: 18, marginTop: 0 }}>
          <li>Complete SendGrid domain authentication for your sending domain.</li>
          <li>Add the SPF record provided by SendGrid (or include SendGrid in your existing SPF).</li>
          <li>Publish the DKIM CNAMEs from SendGrid so mail is signed.</li>
          <li>Set a DMARC policy (p=none or stricter) with a reporting address you monitor.</li>
        </ul>
      </div>

      <div className="card" style={{ padding: 18, marginTop: 12 }}>
        <h2 style={{ margin: "0 0 8px" }}>Safe subjects and reply-to</h2>
        <p className="small" style={{ marginTop: 0 }}>
          We default to a generic subject when none is provided and set Reply-To to your support inbox. Avoid placing
          sensitive details in the subject line.
        </p>
      </div>

      <Footer />
    </main>
  );
}
