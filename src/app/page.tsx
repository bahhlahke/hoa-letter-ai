"use client";

import { useState } from "react";

const VIOLATIONS = [
  "Noise",
  "Parking",
  "Trash",
  "Landscaping",
  "Pet issue",
  "Unauthorized modification",
  "Other",
] as const;

const TONES = ["Friendly", "Neutral", "Firm"] as const;

export default function Page() {
  const [violationType, setViolationType] = useState<(typeof VIOLATIONS)[number]>("Noise");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Neutral");
  const [dueDate, setDueDate] = useState<string>("");
  const [communityName, setCommunityName] = useState<string>("");
  const [ruleRef, setRuleRef] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");

  async function generatePreview() {
    setLoading(true);
    setPreview("");
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ violationType, tone, dueDate, communityName, ruleRef, details }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      alert(data?.error ?? "Failed to generate");
      return;
    }
    setPreview(data.letter);
  }

  async function checkoutAndDownload(format: "pdf" | "docx") {
    if (!preview) {
      alert("Generate a letter first.");
      return;
    }
    setLoading(true);
    const checkoutRes = await fetch("/api/checkout", { method: "POST" });
    const checkoutData = await checkoutRes.json();
    if (!checkoutRes.ok) {
      setLoading(false);
      alert(checkoutData?.error ?? "Checkout failed");
      return;
    }
    window.location.href = checkoutData.url;
  }

  return (
    <main style={{ maxWidth: 860, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1 style={{ fontSize: 34, marginBottom: 8 }}>HOA Letter AI</h1>
      <p style={{ color: "#444", marginTop: 0 }}>
        Generate professional HOA violation letters in seconds. <b>No legal advice.</b>
      </p>

      <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
        <label>
          Violation type
          <select value={violationType} onChange={(e) => setViolationType(e.target.value as (typeof VIOLATIONS)[number])} style={{ width: "100%", padding: 10 }}>
            {VIOLATIONS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </label>

        <label>
          Tone
          <select value={tone} onChange={(e) => setTone(e.target.value as (typeof TONES)[number])} style={{ width: "100%", padding: 10 }}>
            {TONES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>

        <label>
          Due date (optional)
          <input value={dueDate} onChange={(e) => setDueDate(e.target.value)} placeholder="e.g., January 10, 2026" style={{ width: "100%", padding: 10 }} />
        </label>

        <label>
          Community name (optional)
          <input value={communityName} onChange={(e) => setCommunityName(e.target.value)} placeholder="e.g., Maple Ridge HOA" style={{ width: "100%", padding: 10 }} />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Rule/Covenant reference (optional)
          <input value={ruleRef} onChange={(e) => setRuleRef(e.target.value)} placeholder="e.g., CC&R §4.2 Parking" style={{ width: "100%", padding: 10 }} />
        </label>

        <label style={{ gridColumn: "1 / -1" }}>
          Details (optional but helpful)
          <textarea value={details} onChange={(e) => setDetails(e.target.value)} rows={4} placeholder="Add specifics: date/time, what was observed, etc." style={{ width: "100%", padding: 10 }} />
        </label>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button onClick={generatePreview} disabled={loading} style={{ padding: "10px 14px" }}>
          {loading ? "Working…" : "Generate letter preview"}
        </button>
      </div>

      {preview && (
        <>
          <h2 style={{ marginTop: 24 }}>Preview</h2>
          <pre style={{ whiteSpace: "pre-wrap", background: "#f6f6f6", padding: 14, borderRadius: 8 }}>{preview}</pre>

          <p style={{ marginTop: 12 }}>
            Download requires payment ($5). You’ll be redirected to Stripe.
          </p>

          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => checkoutAndDownload("pdf")} disabled={loading} style={{ padding: "10px 14px" }}>
              Pay & Download PDF
            </button>
            <button onClick={() => checkoutAndDownload("docx")} disabled={loading} style={{ padding: "10px 14px" }}>
              Pay & Download DOCX
            </button>
          </div>

          <p style={{ fontSize: 12, color: "#666", marginTop: 16 }}>
            Disclaimer: This tool provides general communication assistance only and does not constitute legal advice. Users are responsible for ensuring compliance with their governing documents and local laws.
          </p>
        </>
      )}
    </main>
  );
}
