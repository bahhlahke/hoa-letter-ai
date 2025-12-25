"use client";

import { useState } from "react";

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
    <main
      style={{
        maxWidth: 800,
        margin: "0 auto",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>HOA Letter AI</h1>
      <p style={{ marginBottom: 24 }}>
        Generate professional HOA violation letters in seconds. The preview is free;
        purchase or subscribe to download and use the letter.
      </p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
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

      <div style={{ marginTop: 16 }}>
        <button
          onClick={generatePreview}
          disabled={loading}
          style={{ padding: "10px 16px", fontSize: 16 }}
        >
          {loading ? "Working…" : "Generate preview"}
        </button>
      </div>

      {preview && (
        <>
          <h2 style={{ marginTop: 32, marginBottom: 8 }}>Letter preview</h2>
          <pre
            style={{
              whiteSpace: "pre-wrap",
              background: "#f6f6f6",
              padding: 16,
              borderRadius: 8,
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
                <option value="one-time">One-time purchase (pay per letter)</option>
                <option value="subscription">Monthly subscription (unlimited letters)</option>
              </select>
            </label>
          </div>

          <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
            <button
              onClick={checkout}
              disabled={loading}
              style={{ padding: "10px 16px", fontSize: 16 }}
            >
              {loading ? "Processing…" : paymentMode === "subscription" ? "Subscribe & checkout" : "Pay & checkout"}
            </button>
          </div>

          <p style={{ fontSize: 12, color: "#666", marginTop: 16 }}>
            Disclaimer: This tool provides general communication assistance only and does not constitute legal advice.
            Users are responsible for ensuring compliance with their governing documents and local laws.
          </p>
        </>
      )}
    </main>
  );
}