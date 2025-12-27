"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Community, getCommunity, publicLogoUrl } from "@/lib/communityStore";
import { buildHoaPdfBytes } from "@/lib/pdfClient";

const LETTER_TYPES = [
  { value: "Violation notice", description: "First or follow-up warning when a rule is broken." },
  { value: "Fine or dues delinquency", description: "Balance reminders with firm yet respectful language." },
  { value: "Appeal response", description: "Reply to an owner’s appeal with clarity on the board’s decision." },
  { value: "Welcome / new resident", description: "Warm intro with key community expectations and contacts." },
  { value: "Architectural request", description: "Acknowledgement or decision for an architectural change request." },
  { value: "Amenity or meeting notice", description: "Pool/amenity rules, meeting invites, or scheduling updates." },
  { value: "General notice", description: "Any other HOA communication or update." },
] as const;

const VIOLATIONS = [
  "Noise",
  "Parking",
  "Trash",
  "Landscaping",
  "Pet issue",
  "Unauthorized modification",
  "Short-term rental",
  "Common area use",
  "Other",
] as const;

const TONES = [
  { value: "Friendly", description: "Polite and welcoming; great for welcomes and first-time reminders." },
  { value: "Neutral", description: "Professional, balanced, and factual—recommended default." },
  { value: "Firm", description: "Direct but respectful, emphasizing expectations and deadlines." },
] as const;

function formatDueDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function formatLetterDate(date?: Date) {
  const d = date ? new Date(date) : new Date();
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
  const formRef = useRef<HTMLElement | null>(null);

  // Community profile
  const [community, setCommunity] = useState<Community | null>(null);
  const [communityLogoUrl, setCommunityLogoUrl] = useState<string | null>(null);

  // Draft inputs
  const [letterType, setLetterType] = useState<(typeof LETTER_TYPES)[number]["value"]>(LETTER_TYPES[0].value);
  const [violationType, setViolationType] = useState<(typeof VIOLATIONS)[number]>("Noise");
  const [tone, setTone] = useState<(typeof TONES)[number]["value"]>("Neutral");
  const [letterDate, setLetterDate] = useState<string>(formatLetterDate());
  const [dueDate, setDueDate] = useState<string>(formatDueDate(7));
  const [ruleRef, setRuleRef] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [replyInstructions, setReplyInstructions] = useState<string>("");
  const [homeownerName, setHomeownerName] = useState<string>("");
  const [homeownerAddress, setHomeownerAddress] = useState<string>("");
  const [propertyAddress, setPropertyAddress] = useState<string>("");
  const [incidentDate, setIncidentDate] = useState<string>("");
  const [amountDue, setAmountDue] = useState<string>("");
  const [appealReason, setAppealReason] = useState<string>("");
  const [subjectLine, setSubjectLine] = useState<string>("");
  const [senderName, setSenderName] = useState<string>("");
  const [senderTitle, setSenderTitle] = useState<string>("");
  const [senderContact, setSenderContact] = useState<string>("");
  const [autoRuleFromGuidelines, setAutoRuleFromGuidelines] = useState(false);

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

  const [communityLoading, setCommunityLoading] = useState(false);

  useEffect(() => {
    const s = getUnlockState();
    setUnlocked(s.unlocked);
    setCredits(s.credits);

    const last = localStorage.getItem("hoa_last_letter");
    if (last && !preview) setPreview(last);
    const lastCommunityId = localStorage.getItem("hoa_last_community_id");
    if (lastCommunityId) hydrateCommunity(lastCommunityId).catch(console.error);
  }, []);

  const toneHelp = useMemo<Record<string, string>>(
    () => Object.fromEntries(TONES.map(t => [t.value, t.description])),
    []
  );

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

  async function hydrateCommunity(id: string) {
    setCommunityLoading(true);
    try {
      const c = await getCommunity(id);
      if (c) {
        setCommunity(c);
        setCommunityLogoUrl(publicLogoUrl(c.logo_path));
        setLetterheadOverride("");
        setGuidelinesTextExtra("");
        setGuidelinesUrlExtra("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCommunityLoading(false);
    }
  }

  function refreshLastCommunity() {
    const lastCommunityId = localStorage.getItem("hoa_last_community_id");
    if (!lastCommunityId) {
      alert("No saved community profile yet.");
      return;
    }
    hydrateCommunity(lastCommunityId);
  }

  async function generatePreview() {
    setLoading(true);
    setEmailStatus("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          letterType,
          violationType,
          tone,
          letterDate,
          dueDate,
          homeownerName,
          homeownerAddress,
          propertyAddress,
          incidentDate,
          amountDue,
          appealReason,
          subjectLine,
          communityName: community?.name || "",
          senderName,
          senderTitle,
          senderContact,
          replyInstructions,
          ruleRef,
          autoRuleFromGuidelines,
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
              background: "linear-gradient(135deg, #6366f1, #22c55e)",
              border: "1px solid rgba(99,102,241,0.15)"
            }} />
            <div>
              <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>HOA Letter AI</div>
              <div className="small">Authority-grade HOA communication</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="button ghost" href="/community" style={{ textDecoration: "none" }}>Community profiles</a>
            <a className="button ghost" href="/pricing" style={{ textDecoration: "none" }}>Pricing</a>
            <a className="button ghost" href="#draft" style={{ textDecoration: "none" }}>Draft</a>
          </div>
        </header>

        <section style={{ padding: "34px 0 18px" }}>
          <div className="pill">
            <span>AI-drafted notices</span><span style={{ opacity: 0.7 }}>•</span>
            <span>Guideline-aware tone</span><span style={{ opacity: 0.7 }}>•</span>
            <span>One-screen workflow</span>
          </div>

          <h1 style={{ fontSize: 48, lineHeight: 1.05, margin: "18px 0 8px" }}>
            HOA letters, streamlined by AI
          </h1>

          <p className="muted" style={{ fontSize: 18, maxWidth: 760, marginTop: 0 }}>
            Keep your notices consistent, branded, and on deadline. Our AI references your CC&Rs, suggests the right tone, and delivers ready-to-send text without bouncing between apps.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <button className="button primary" onClick={scrollToForm}>Start a notice</button>
            <span className="kbd">No account required</span>
          </div>
        </section>

        <section className="grid three" style={{ marginTop: 6 }}>
          {[
            { t: "AI that knows your rules", b: "Cite CC&Rs, insert deadlines, and keep the tone aligned to your board’s preference." },
            { t: "Less form-filling", b: "Save community profiles once and focus only on the details that change per notice." },
            { t: "Exports built in", b: "Copy, download, or email the final draft—brand-safe letterhead included when provided." },
          ].map(x => (
            <div key={x.t} className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 900, marginBottom: 6 }}>{x.t}</div>
              <div className="muted">{x.b}</div>
            </div>
          ))}
        </section>

        <section className="card" style={{ padding: 18, marginTop: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>What stays on this page</div>
          <div className="grid three" style={{ gap: 12 }}>
            {[
              { h: "Core drafting", d: "Letter type, tone, and homeowner essentials are upfront for fast entry." },
              { h: "AI assist", d: "Toggle guideline citations or let the model pull sections automatically." },
              { h: "Delivery ready", d: "Preview instantly, then export or email without opening another tool." },
            ].map(item => (
              <div key={item.h} className="card" style={{ padding: 14, background: "#f9fafb" }}>
                <div style={{ fontWeight: 800, marginBottom: 4 }}>{item.h}</div>
                <div className="muted">{item.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="draft" className="card" ref={formRef} style={{ marginTop: 18 }}>
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 20 }}>Build the notice</div>
                <div className="small">Complete the essentials, then add context only where needed.</div>
              </div>
              {community?.name ? <span className="badge">Community: {community.name}</span> : <span className="badge">Optional: saved profiles auto-load</span>}
            </div>

            <div className="hr" />

            <div className="card" style={{ padding: 12, marginBottom: 12, background: "#f3f4f6", border: "1px solid var(--border)" }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>Reminder: draft assistance only</div>
              <div className="small" style={{ marginTop: 4 }}>
                This AI-generated letter is for drafting purposes only and is not legal advice or an official HOA notice. Always review and follow your governing documents before sending.
              </div>
            </div>

            <div className="grid two">
              <label>
                <div className="small" style={{ marginBottom: 6 }}>Letter type</div>
                <select className="input" value={letterType} onChange={(e) => setLetterType(e.target.value as any)}>
                  {LETTER_TYPES.map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
                </select>
                <div className="small" style={{ marginTop: 6 }}>{LETTER_TYPES.find(t => t.value === letterType)?.description}</div>
              </label>

              <label>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span className="small">Tone</span>
                  <span className="small" title={toneHelp[tone]}>?</span>
                </div>
                <select className="input" value={tone} onChange={(e) => setTone(e.target.value as any)}>
                  {TONES.map(t => <option key={t.value} value={t.value}>{t.value}</option>)}
                </select>
                <div className="small" style={{ marginTop: 6 }}>{toneHelp[tone]}</div>
              </label>

              <label>
                <div className="small" style={{ marginBottom: 6 }}>Subject line (optional)</div>
                <input className="input" value={subjectLine} onChange={(e) => setSubjectLine(e.target.value)} placeholder="e.g., Notice of Landscaping Violation" />
                <div className="small" style={{ marginTop: 6 }}>Used in the letter heading/RE: line.</div>
              </label>

              <label>
                <div className="small" style={{ marginBottom: 6 }}>Letter date</div>
                <input className="input" value={letterDate} onChange={(e) => setLetterDate(e.target.value)} />
                <div className="small" style={{ marginTop: 6 }}>Defaults to today. Use the date you intend to send the notice.</div>
              </label>
            </div>

            <div className="hr" />
            <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>Recipient & property</div>
            <div className="grid two">
              <label>
                <div className="small" style={{ marginBottom: 6 }}>Homeowner name</div>
                <input className="input" value={homeownerName} onChange={(e) => setHomeownerName(e.target.value)} placeholder="Full name" />
              </label>
              <label>
                <div className="small" style={{ marginBottom: 6 }}>Mailing address</div>
                <input className="input" value={homeownerAddress} onChange={(e) => setHomeownerAddress(e.target.value)} placeholder="Street, City, State ZIP" />
              </label>
              <label>
                <div className="small" style={{ marginBottom: 6 }}>Property address (if different)</div>
                <input className="input" value={propertyAddress} onChange={(e) => setPropertyAddress(e.target.value)} placeholder="Service/lot address" />
              </label>
              <label>
                <div className="small" style={{ marginBottom: 6 }}>Incident or notice date</div>
                <input className="input" value={incidentDate} onChange={(e) => setIncidentDate(e.target.value)} placeholder="e.g., May 14, 2024" />
              </label>
            </div>

            <div className="hr" />
            <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>Context & deadlines</div>
            <div className="grid two">
              <label>
                <div className="small" style={{ marginBottom: 6 }}>Violation or topic</div>
                <select className="input" value={violationType} onChange={(e) => setViolationType(e.target.value as any)}>
                  {VIOLATIONS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </label>

              <label>
                <div className="small" style={{ marginBottom: 6 }}>Compliance / payment deadline</div>
                <input className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                <div className="small" style={{ marginTop: 6 }}>Defaults to 7 days from today.</div>
              </label>

              <label>
                <div className="small" style={{ marginBottom: 6 }}>Rule / section cited (optional)</div>
                <input
                  className="input"
                  value={ruleRef}
                  onChange={(e) => {
                    setRuleRef(e.target.value);
                    if (autoRuleFromGuidelines) setAutoRuleFromGuidelines(false);
                  }}
                  placeholder="e.g., CC&R §4.2 Parking"
                  disabled={autoRuleFromGuidelines}
                />
                <div className="small" style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <span>Leave blank or let AI cite a relevant section from your guidelines.</span>
                  <button
                    type="button"
                    className="button ghost"
                    style={{ padding: "4px 10px" }}
                    onClick={() => {
                      setRuleRef("");
                      setAutoRuleFromGuidelines(s => !s);
                    }}
                  >
                    {autoRuleFromGuidelines ? "Disable auto-citation" : "Ask AI to cite from guidelines"}
                  </button>
                </div>
              </label>

              <label>
                <div className="small" style={{ marginBottom: 6 }}>Amount due (optional)</div>
                <input className="input" value={amountDue} onChange={(e) => setAmountDue(e.target.value)} placeholder="$100 late dues" />
              </label>

              <label>
                <div className="small" style={{ marginBottom: 6 }}>Appeal decision / notes (optional)</div>
                <input className="input" value={appealReason} onChange={(e) => setAppealReason(e.target.value)} placeholder="Board response to any appeal" />
              </label>

              <label>
                <div className="small" style={{ marginBottom: 6 }}>Additional context</div>
                <textarea className="input" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} placeholder="What happened, photo descriptions, time of day, etc." />
              </label>
            </div>

            <div className="hr" />
            <div className="small" style={{ fontWeight: 800, marginBottom: 6 }}>Sign-off & replies</div>
            <div className="grid two">
              <label>
                <div className="small" style={{ marginBottom: 6 }}>Sender name (board/manager)</div>
                <input className="input" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="e.g., Jordan Smith" />
              </label>
              <label>
                <div className="small" style={{ marginBottom: 6 }}>Sender title</div>
                <input className="input" value={senderTitle} onChange={(e) => setSenderTitle(e.target.value)} placeholder="Board Secretary, Community Manager" />
              </label>
              <label>
                <div className="small" style={{ marginBottom: 6 }}>Contact for questions</div>
                <input className="input" value={senderContact} onChange={(e) => setSenderContact(e.target.value)} placeholder="phone/email for replies" />
              </label>
              <label>
                <div className="small" style={{ marginBottom: 6 }}>Reply instructions (optional)</div>
                <input className="input" value={replyInstructions} onChange={(e) => setReplyInstructions(e.target.value)} placeholder="How the homeowner should respond or appeal" />
              </label>
            </div>

            <div className="hr" />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div className="small" style={{ fontWeight: 800 }}>Branding & guideline extras (optional)</div>
              <button className="button ghost" type="button" onClick={() => setShowDetails(s => !s)}>
                {showDetails ? "Hide" : "Show"} extras
              </button>
            </div>
            {showDetails && (
              <div className="grid two" style={{ marginTop: 10 }}>
                <label>
                  <div className="small" style={{ marginBottom: 6 }}>Extra guideline text</div>
                  <textarea className="input" rows={4} value={guidelinesTextExtra} onChange={(e) => setGuidelinesTextExtra(e.target.value)} placeholder="Add temporary rules or clarifications for this notice." />
                </label>
                <label>
                  <div className="small" style={{ marginBottom: 6 }}>Guidelines URL override</div>
                  <input className="input" value={guidelinesUrlExtra} onChange={(e) => setGuidelinesUrlExtra(e.target.value)} placeholder="https://example.com/ccr" />
                  <div className="small" style={{ marginTop: 6 }}>If set, replaces any saved community URL.</div>
                </label>
                <label>
                  <div className="small" style={{ marginBottom: 6 }}>Letterhead override</div>
                  <textarea
                    className="input"
                    rows={4}
                    value={letterheadOverride}
                    onChange={(e) => setLetterheadOverride(e.target.value)}
                    placeholder={"Maple Ridge HOA\n123 Main St\n(555) 555-5555\nhoa@example.com"}
                  />
                </label>
                <div className="small" style={{ marginTop: 12 }}>
                  Saved community branding stays intact—override only when sending on behalf of a new board or building.
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

        <section className="card" style={{ padding: 18, marginTop: 12 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 900 }}>Community profiles, simplified</div>
              <div className="small" style={{ marginTop: 4 }}>
                Manage branding and guidelines on a dedicated page, then reuse them automatically in new drafts.
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <a className="button primary" href="/community" style={{ textDecoration: "none" }}>Open profiles</a>
              <button className="button" onClick={refreshLastCommunity} disabled={communityLoading}>
                {communityLoading ? "Loading…" : "Load last profile"}
              </button>
            </div>
          </div>

          <div className="hr" />
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            {community ? (
              <div className="pill">Active: {community.name}{communityLogoUrl ? " • Logo set" : ""}</div>
            ) : (
              <div className="pill" style={{ background: "#f3f4f6", color: "#1f2933" }}>No profile loaded yet</div>
            )}
            <div className="small" style={{ color: "var(--muted)" }}>
              Profiles live separately now, keeping this page focused on drafting.
            </div>
          </div>
        </section>

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

              <div style={{ marginTop: 12, padding: 16, borderRadius: 14, border: "1px solid var(--border)", background: "#f9fafb" }}>
                <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace", fontSize: 14, lineHeight: 1.5, color: "#111827" }}>
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
