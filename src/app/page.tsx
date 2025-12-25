"use client";

import { useState, useRef } from "react";

// Options for the different types of HOA violations users can choose from.
const VIOLATIONS = [
  "Noise",
  "Parking",
  "Trash",
  "Landscaping",
  "Pet issue",
  "Unauthorized modification",
  "Other",
] as const;

// Tone options allow users to choose how friendly or firm the letter should be.
const TONES = ["Friendly", "Neutral", "Firm"] as const;

export default function Page() {
  // References
  const formRef = useRef<HTMLDivElement>(null);
  // Form state for user inputs.
  const [violationType, setViolationType] = useState<(typeof VIOLATIONS)[number]>("Noise");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Neutral");
  const [dueDate, setDueDate] = useState<string>("");
  const [communityName, setCommunityName] = useState<string>("");
  const [ruleRef, setRuleRef] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  // Payment mode: one-time purchase or subscription. Default to one-time.
  const [paymentMode, setPaymentMode] = useState<"one-time" | "subscription">("one-time");

  // Generates a preview letter by calling the backend API. The preview is free
  // for users to read. If the call fails, an alert will show the error.
  async function generatePreview() {
    setLoading(true);
    setPreview("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          violationType,
          tone,
          dueDate,
          communityName,
          ruleRef,
          details,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        alert(data?.error ?? "Failed to generate letter");
        return;
      }
      setPreview(data.letter);
    } catch (err: any) {
      setLoading(false);
      alert(err?.message ?? "An error occurred");
    }
  }

  // Initiates checkout with Stripe. Sends the selected paymentMode to the
  // backend API, which responds with a checkout session URL. Users will be
  // redirected to Stripe to complete payment.
  async function checkout() {
    if (!preview) {
      alert("Please generate a letter preview first.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMode }),
      });
      const data = await res.json();
      setLoading(false);
      if (!res.ok) {
        alert(data?.error ?? "Checkout failed");
        return;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      setLoading(false);
      alert(err?.message ?? "An error occurred");
    }
  }

  return (
    <main style={{ fontFamily: "system-ui, sans-serif" }}>
      {/* Hero Section */}
      <section
        style={{
          background: "linear-gradient(135deg, #3f51b5, #2196f3)",
          color: "#fff",
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: 48, marginBottom: 16 }}>Automate HOA Letters</h1>
        <p
          style={{ fontSize: 20, maxWidth: 700, margin: "0 auto" }}
        >
          Create professional, compliant violation notices in seconds using AI.
        </p>
        <div
          style={{
            marginTop: 32,
            display: "flex",
            justifyContent: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => {
              setPaymentMode("one-time");
              formRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: "#ffffff",
              color: "#3f51b5",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            Generate Free Letter
          </button>
          <button
            onClick={() => {
              setPaymentMode("subscription");
              formRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            style={{
              padding: "12px 24px",
              fontSize: 16,
              backgroundColor: "#ffc107",
              color: "#3f51b5",
              borderRadius: 8,
              border: "none",
              cursor: "pointer",
            }}
          >
            Subscribe &amp; Save
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: "60px 20px", backgroundColor: "#f7f7f7" }}>
        <h2
          style={{ textAlign: "center", fontSize: 32, marginBottom: 32 }}
        >
          Why Choose HOA Letter AI?
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-around",
            gap: 24,
            maxWidth: 1000,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              flex: "1 1 280px",
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>
              Automated Compliance
            </h3>
            <p>
              We ensure your letters follow state and local rules so you stay
              protected.
            </p>
          </div>
          <div
            style={{
              flex: "1 1 280px",
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>
              Personalized Letters
            </h3>
            <p>
              Provide the details, and our AI crafts a clear, professional notice
              tailored to your situation.
            </p>
          </div>
          <div
            style={{
              flex: "1 1 280px",
              backgroundColor: "#fff",
              padding: 24,
              borderRadius: 8,
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h3 style={{ fontSize: 24, marginBottom: 8 }}>
              Simple &amp; Secure Payments
            </h3>
            <p>
              Pay per letter or subscribe monthly – your choice. Payments are
              processed securely via Stripe.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section ref={formRef} style={{ padding: "60px 20px" }}>
        <h2
          style={{ textAlign: "center", fontSize: 32, marginBottom: 24 }}
        >
          Generate Your Letter
        </h2>
        <div
          style={{
            maxWidth: 800,
            margin: "0 auto",
            display: "grid",
            gap: 12,
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          }}
        >
          <label>
            Violation type
            <select
              value={violationType}
              onChange={(e) => setViolationType(e.target.value as any)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            >
              {VIOLATIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>

          <label>
            Tone
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value as any)}
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            >
              {TONES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>

          <label>
            Due date (optional)
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="e.g., January 10, 2026"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>

          <label>
            Community name (optional)
            <input
              type="text"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              placeholder="e.g., Maple Ridge HOA"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            Rule/covenant reference (optional)
            <input
              type="text"
              value={ruleRef}
              onChange={(e) => setRuleRef(e.target.value)}
              placeholder="e.g., CC&R §4.2 Parking"
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>

          <label style={{ gridColumn: "1 / -1" }}>
            Additional details (optional)
            <textarea
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="Add specifics: date/time, what was observed, etc."
              style={{ width: "100%", padding: 8, marginTop: 4 }}
            />
          </label>
        </div>

        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button
            onClick={generatePreview}
            disabled={loading}
            style={{
              padding: "10px 20px",
              fontSize: 16,
              backgroundColor: "#3f51b5",
              color: "#fff",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {loading ? "Working…" : "Generate preview"}
          </button>
        </div>

        {preview && (
          <div style={{ marginTop: 32 }}>
            <h3 style={{ marginBottom: 8 }}>Letter preview</h3>
            <pre
              style={{
                whiteSpace: "pre-wrap",
                background: "#f6f6f6",
                padding: 16,
                borderRadius: 8,
                overflowX: "auto",
              }}
            >
              {preview}
            </pre>
            <div style={{ marginTop: 16 }}>
              <label>
                Payment option
                <select
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                >
                  <option value="one-time">
                    One-time purchase (pay per letter)
                  </option>
                  <option value="subscription">
                    Monthly subscription (unlimited letters)
                  </option>
                </select>
              </label>
            </div>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                onClick={checkout}
                disabled={loading}
                style={{
                  padding: "10px 20px",
                  fontSize: 16,
                  backgroundColor: "#ffc107",
                  color: "#3f51b5",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                }}
              >
                {loading
                  ? "Processing…"
                  : paymentMode === "subscription"
                  ? "Subscribe & checkout"
                  : "Pay & checkout"}
              </button>
            </div>
            <p style={{ fontSize: 12, color: "#666", marginTop: 16 }}>
              Disclaimer: This tool provides general communication assistance only
              and does not constitute legal advice. Users are responsible for
              ensuring compliance with their governing documents and local laws.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}