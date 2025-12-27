// Lightweight FAQ component
export default function FAQ() {
  return (
    <section className="faq">
      <h3>Frequently Asked Questions</h3>
      <details>
        <summary>Is this legally binding?</summary>
        <p>No, this tool provides draft assistance only and does not offer legal advice.</p>
      </details>
      <details>
        <summary>Can I edit the letter after generation?</summary>
        <p>Yes, you can copy and customize the output before sending.</p>
      </details>
      <details>
        <summary>Is my data stored?</summary>
        <p>No personal data is stored or logged.</p>
      </details>
    </section>
  );
}
