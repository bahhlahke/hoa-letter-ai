"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import CommunitySelector from "@/components/CommunitySelector";
import { Community, publicLogoUrl } from "@/lib/communityStore";
import { buildHoaPdfBytes } from "@/lib/pdfClient";

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

function formatDueDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function getUnlockState() {
  if (typeof window === "undefined") return { unlocked: false, credits: 0 };
  const until = Number(localStorage.getItem("hoa_unlocked_until") || "0");
  const credits = Number(localStorage.getItem("hoa_one_time_credits") || "0");
  const unlocked = Date.now() < until;
  return { unlocked, credits };
}

function consumeCreditIfAny() {
  const credits = Number(localStorage.getItem("hoa_one_time_credits") || "0");
  if (credits > 0) localStorage.setItem("hoa_one_time_credits", String(credits - 1));
}

export default function Page() {
  const formRef = useRef<HTMLDivElement | null>(null);

  // Community profile
  const [community, setCommunity] = useState<Community | null>(null);
  const [communityLogoUrl, setCommunityLogoUrl] = useState<string | null>(null);

  // Draft inputs
  const [violationType, setViolationType] = useState<(typeof VIOLATIONS)[number]>("Noise");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Neutral");
  const [dueDate, setDueDate] = useState<string>(formatDueDate(7));
  const [ruleRef, setRuleRef] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);

  // Guidelines overrides (user can add extra beyond community profile)
  const [guidelinesTextExtra, setGuidelinesTextExtra] = useState<string>("");
  const [guidelinesUrlExtra, setGuidelinesUrlExtra] = useState<string>("");
  const [letterheadOverride, setLetterheadOverride] = useState<string>("");

  // Output + monetization
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [unlocked, setUnlocked] = useState(false);
  const [credits, setCredits] = useState(0);

  // Email delivery
  const [emailTo, setEmailTo] = useState<string>("");
  const [emailStatus, setEmailStatus] = useState<string>("");

  useEffect(() => {
    const s = getUnlockState();
    setUnlocked(s.unlocked);
    setCredits(s.credits);

    const last = localStorage.getItem("hoa_last_letter");
    if (last && !preview) setPreview(last);
  }, []);

  const toneHelp = useMemo(() => ({
    Friendly: "Warm, cooperative language. Good for first notices.",
    Neutral: "Factual, professional, non-accusatory. Safest default.",
    Firm: "Clear expectations and deadlines, still respectful.",
  } as Record<(typeof TONES)[number], string>), []);

  function effectiveGuidelinesText() {
    const pieces = [
      (community?.guidelines || "").trim(),
      (guidelinesTextExtra || "").trim(),
    ].filter(Boolean);
    return pieces.join("\n\n---\n\n");
  }

  function effectiveGuidelinesUrl() {
    return (guidelinesUrlExtra || community?.guidelines_url || "").trim();
  }

  function effectiveLetterhead() {
    return (letterheadOverride || community?.letterhead || "").trim();
  }

  async function generatePreview() {
    setLoading(true);
    setEmailStatus("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          violationType,
          tone,
          dueDate,
          communityName: community?.name || "",
          ruleRef,
          details,
          guidelinesText: effectiveGuidelinesText(),
          guidelinesUrl: effectiveGuidelinesUrl(),
          letterhead: effectiveLetterhead(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to generate");
      setPreview(data.letter);
      localStorage.setItem("hoa_last_letter", data.letter);
      setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e: any) {
      alert(e?.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  async function startCheckout(mode: "one-time" | "subscription") {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMode: mode === "subscription" ? "subscription" : "one-time" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Checkout failed");
      window.location.href = data.url;
    } catch (e: any) {
      alert(e?.message ?? "Checkout error");
    } finally {
      setLoading(false);
    }
  }

  function copyLetter() {
    if (!preview) return;
    navigator.clipboard.writeText(preview);
    alert("Copied.");
    const s = getUnlockState();
    if (s.credits > 0) {
      consumeCreditIfAny();
      const s2 = getUnlockState();
      setUnlocked(s2.unlocked);
      setCredits(s2.credits);
    }
  }

  function downloadTxt() {
    if (!preview) return;
    const blob = new Blob([preview], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hoa-notice-${violationType.toLowerCase().replace(/\s+/g, "-")}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    const s = getUnlockState();
    if (s.credits > 0) {
      consumeCreditIfAny();
      const s2 = getUnlockState();
      setUnlocked(s2.unlocked);
      setCredits(s2.credits);
    }
  }

  async function downloadDocx() {
    if (!preview) return;
    const { Document, Packer, Paragraph, TextRun } = await import("docx");

    const lines = preview.split(/\r?\n/);
    const paragraphs = lines.map((line) =>
      new Paragraph({ children: [new TextRun({ text: line.length ? line : " " })] })
    );

    const doc = new Document({ sections: [{ properties: {}, children: paragraphs }] });
    const blob = await Packer.toBlob(doc);

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hoa-notice-${violationType.toLowerCase().replace(/\s+/g, "-")}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    const s = getUnlockState();
    if (s.credits > 0) {
      consumeCreditIfAny();
      const s2 = getUnlockState();
      setUnlocked(s2.unlocked);
      setCredits(s2.credits);
    }
  }

  async function downloadPdf() {
    if (!preview) return;
    const bytes = await buildHoaPdfBytes({
      letter: preview,
      letterhead: effectiveLetterhead(),
      communityName: community?.name || undefined,
      logoUrl: communityLogoUrl,
    });

    // TS-safe buffer copy
    const buffer = bytes.buffer.slice(0) as ArrayBuffer;
    const blob = new Blob([buffer], { type: "application/pdf" });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hoa-notice-${violationType.toLowerCase().replace(/\s+/g, "-")}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    const s = getUnlockState();
    if (s.credits > 0) {
      consumeCreditIfAny();
      const s2 = getUnlockState();
      setUnlocked(s2.unlocked);
      setCredits(s2.credits);
    }
  }

  async function sendEmail() {
    if (!preview) return;
    if (!emailTo.trim()) { alert("Enter recipient email."); return; }
    setEmailStatus("");
    setLoading(true);
    try {
      const subject = `HOA Notice${community?.name ? ` - ${community.name}` : ""}`;
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: emailTo.trim(), subject, body: preview }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Email failed");
      setEmailStatus("Sent ✅");
    } catch (e: any) {
      setEmailStatus(e?.message ?? "Email error");
    } finally {
      setLoading(false);
    }
  }

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main>
      <div className="container">
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12,
              background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.85))",
              border: "1px solid rgba(255,255,255,0.18)"
            }} />
            <div>
              <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>HOA Letter AI</div>
              <div className="small">Authority-grade HOA communication</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="button ghost" href="/pricing" style={{ textDecoration: "none" }}>Pricing</a>
            <a className="button ghost" href="#draft" style={{ textDecoration: "none" }}>Draft</a>
          </div>
        </header>

        <section style={{ padding: "34px 0 18px" }}>
          <div className="pill">
            <span>Guideline citations</span><span style={{ opacity: 0.7 }}>•</span>
            <span>Branded HOA PDFs</span><span style={{ opacity: 0.7 }}>•</span>
            <span>Email delivery</span><span style={{ opacity: 0.7 }}>•</span>
            <span>Secure Stripe checkout</span>
          </div>

          <h1 style={{ fontSize: 54, lineHeight: 1.05, margin: "18px 0 10px" }}>
            Draft HOA notices that sound{" "}
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", color: "transparent" }}>
              calm, clear, and official
            </span>.
          </h1>

          <p className="muted" style={{ fontSize: 18, maxWidth: 860, marginTop: 0 }}>
            Built for boards and property managers who need professional communication with guideline references—without escalating conflict.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <button className="button primary" onClick={scrollToForm}>Draft my notice</button>
            <span className="kbd">No account required</span>
          </div>
        </section>

        <section className="grid three" style={{ marginTop: 10 }}>
          {[
            { t: "Auto-cite guideline sections", b: "When your CC&Rs include section numbers/titles, we cite them precisely—no guessing." },
            { t: "HOA letter templates (PDF)", b: "Print-ready letter layout with optional logo + letterhead for credibility." },
            { t: "Save communities", b: "Store guidelines once and reuse—perfect for boards & managers." },
          ].map(x => (
            <div key={x.t} className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>{x.t}</div>
              <div className="muted">{x.b}</div>
            </div>
          ))}
        </section>

        <div className="grid two" style={{ marginTop: 18, alignItems: "start" }}>
          <CommunitySelector onLoaded={(c, logoUrl) => {
            setCommunity(c);
            setCommunityLogoUrl(logoUrl);
            // keep overrides empty unless user chooses
            if (c) {
              setLetterheadOverride("");
              setGuidelinesTextExtra("");
              setGuidelinesUrlExtra("");
            }
          }} />

          <section id="draft" className="card">
            <div style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontWeight: 900, fontSize: 20 }}>Draft your notice</div>
                  <div className="small">Essentials first. Optional details only if you want.</div>
                </div>
                {community?.name ? <span className="badge">Community: {community.name}</span> : <span className="badge">No community selected</span>}
              </div>

              <div className="hr" />

              <div className="grid two">
                <label>
                  <div className="small" style={{ marginBottom: 6 }}>Violation type</div>
                  <select className="input" value={violationType} onChange={(e) => setViolationType(e.target.value as any)}>
                    {VIOLATIONS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </label>

                <label>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span className="small">Tone</span>
                    <span className="small" title={toneHelp[tone]}>?</span>
                  </div>
                  <select className="input" value={tone} onChange={(e) => setTone(e.target.value as any)}>
                    {TONES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <div className="small" style={{ marginTop: 6 }}>{toneHelp[tone]}</div>
                </label>

                <label>
                  <div className="small" style={{ marginBottom: 6 }}>Due date</div>
                  <input className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                  <div className="small" style={{ marginTop: 6 }}>Defaults to 7 days from today.</div>
                </label>

                <label>
                  <div className="small" style={{ marginBottom: 6 }}>Rule reference (optional)</div>
                  <input className="input" value={ruleRef} onChange={(e) => setRuleRef(e.target.value)} placeholder="e.g., CC&R §4.2 Parking" />
                </label>
              </div>

              <div style={{ marginTop: 12 }}>
                <button className="button ghost" onClick={() => setShowDetails(s => !s)}>
                  {showDetails ? "Hide optional details" : "Add optional details"}
                </button>
              </div>

              {showDetails && (
                <div style={{ marginTop: 12 }} className="card">
                  <div style={{ padding: 14 }}>
                    <label style={{ display: "block" }}>
                      <div className="small" style={{ marginBottom: 6 }}>Details (optional)</div>
                      <textarea className="input" rows={4} value={details} onChange={(e) => setDetails(e.target.value)}
                        placeholder="Example: On May 14 at approximately 10:30 PM, excessive noise was observed that could be heard from neighboring units." />
                    </label>

                    <div style={{ height: 12 }} />

                    <div className="badge">Highlighted feature: Guideline citations</div>
                    <div className="small" style={{ marginTop: 8 }}>
                      Add extra guideline text or a URL; the notice will cite relevant sections when present.
                    </div>

                    <div style={{ height: 10 }} />
                    <label style={{ display: "block" }}>
                      <div className="small" style={{ marginBottom: 6 }}>Additional guideline text (optional)</div>
                      <textarea className="input" rows={4} value={guidelinesTextExtra} onChange={(e) => setGuidelinesTextExtra(e.target.value)}
                        placeholder="Paste any additional or relevant guideline sections here." />
                    </label>

                    <div style={{ height: 10 }} />
                    <label style={{ display: "block" }}>
                      <div className="small" style={{ marginBottom: 6 }}>Guidelines URL override (optional)</div>
                      <input className="input" value={guidelinesUrlExtra} onChange={(e) => setGuidelinesUrlExtra(e.target.value)} placeholder="https://example.com/ccr" />
                    </label>

                    <div style={{ height: 10 }} />
                    <label style={{ display: "block" }}>
                      <div className="small" style={{ marginBottom: 6 }}>Letterhead override (optional)</div>
                      <textarea className="input" rows={3} value={letterheadOverride} onChange={(e) => setLetterheadOverride(e.target.value)}
                        placeholder={"Maple Ridge HOA\n123 Main St\n(555) 555-5555\nhoa@example.com"} />
                    </label>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
                <button className="button primary" onClick={generatePreview} disabled={loading}>
                  {loading ? "Drafting…" : "Create professional notice"}
                </button>
                <button className="button" onClick={() => setDueDate(formatDueDate(7))} disabled={loading}>Reset due date</button>
              </div>
            </div>
          </section>
        </div>

        <div ref={formRef} />

        {preview && (
          <section style={{ marginTop: 18 }} id="preview">
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div className="badge">Official Community Notice (Draft)</div>
                  <div className="small" style={{ marginTop: 6 }}>
                    Review before sending. Draft assistance only (not legal advice).
                  </div>
                </div>
                {unlocked && (
                  <div className="pill">
                    <span>Unlocked</span>
                    {credits > 0 && (<><span style={{ opacity: 0.7 }}>•</span><span>{credits} one-time credit</span></>)}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 12, padding: 16, borderRadius: 14, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(0,0,0,0.25)" }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace", fontSize: 14, lineHeight: 1.5 }}>
                  {preview}
                </pre>
              </div>

              {!unlocked ? (
                <>
                  <div className="hr" />
                  <div className="muted" style={{ fontWeight: 900, marginBottom: 10 }}>Unlock downloads & delivery</div>

                  <div className="grid two">
                    <div className="card" style={{ padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>$15 / month</div>
                        <span className="badge">Most popular</span>
                      </div>
                      <div className="muted" style={{ marginTop: 6 }}>Unlimited notices + saved communities.</div>
                      <ul className="small" style={{ marginTop: 10, paddingLeft: 18 }}>
                        <li>Unlimited copy + exports</li>
                        <li>Community profiles (guidelines/letterhead/logo)</li>
                        <li>Email delivery</li>
                        <li>Cancel anytime</li>
                      </ul>
                      <button className="button primary" style={{ width: "100%", marginTop: 12 }} onClick={() => startCheckout("subscription")} disabled={loading}>
                        {loading ? "Opening Stripe…" : "Subscribe & checkout"}
                      </button>
                      <div className="small" style={{ marginTop: 8 }}>Secure payment via Stripe.</div>
                    </div>

                    <div className="card" style={{ padding: 16 }}>
                      <div style={{ fontWeight: 900, fontSize: 18 }}>$5 one‑time</div>
                      <div className="muted" style={{ marginTop: 6 }}>Perfect for occasional use.</div>
                      <ul className="small" style={{ marginTop: 10, paddingLeft: 18 }}>
                        <li>1 export/delivery credit</li>
                        <li>Unlock lasts 24 hours</li>
                      </ul>
                      <button className="button" style={{ width: "100%", marginTop: 12 }} onClick={() => startCheckout("one-time")} disabled={loading}>
                        {loading ? "Opening Stripe…" : "One-time checkout"}
                      </button>
                      <div className="small" style={{ marginTop: 8 }}>Secure payment via Stripe.</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="hr" />
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="button primary" onClick={copyLetter}>Copy notice</button>
                    <button className="button" onClick={downloadTxt}>Download .txt</button>
                    <button className="button" onClick={downloadDocx}>Download .docx</button>
                    <button className="button" onClick={downloadPdf}>Download .pdf</button>
                  </div>

                  <div className="hr" />
                  <div className="muted" style={{ fontWeight: 900, marginBottom: 10 }}>Email delivery</div>
                  <div className="grid two">
                    <input className="input" value={emailTo} onChange={(e) => setEmailTo(e.target.value)} placeholder="recipient@email.com" />
                    <button className="button primary" onClick={sendEmail} disabled={loading}>
                      {loading ? "Sending…" : "Send email"}
                    </button>
                  </div>
                  {emailStatus && <div className="small" style={{ marginTop: 8 }}>{emailStatus}</div>}
                </>
              )}
            </div>
          </section>
        )}

        <footer style={{ padding: "28px 0 10px" }} className="small">
          <div className="hr" />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <span>© {new Date().getFullYear()} HOA Letter AI</span>
            <span>Draft assistance only — not legal advice.</span>
          </div>
        </footer>
      </div>
    </main>
  );
}
