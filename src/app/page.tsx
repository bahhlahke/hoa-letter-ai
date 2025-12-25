"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const VIOLATIONS = [
  "Noise",
  "Parking",
  "Trash",
  "Landscaping",
  "Pet issue",
  "Unauthorized modification",
  "Other"
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
  const unlocked = Date.now() < until && (credits >= 0);
  return { unlocked, credits };
}

function consumeCreditIfAny() {
  const credits = Number(localStorage.getItem("hoa_one_time_credits") || "0");
  if (credits > 0) localStorage.setItem("hoa_one_time_credits", String(credits - 1));
}

export default function Page() {
  const formRef = useRef<HTMLDivElement | null>(null);

  const [violationType, setViolationType] = useState<(typeof VIOLATIONS)[number]>("Noise");
  const [tone, setTone] = useState<(typeof TONES)[number]>("Neutral");
  const [dueDate, setDueDate] = useState<string>(formatDueDate(7));
  const [communityName, setCommunityName] = useState<string>("");
  const [ruleRef, setRuleRef] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [showDetails, setShowDetails] = useState(false);

  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>("");
  const [paymentMode, setPaymentMode] = useState<"one-time" | "subscription">("subscription");
  const [unlocked, setUnlocked] = useState(false);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const s = getUnlockState();
    setUnlocked(s.unlocked);
    setCredits(s.credits);

    // Restore last letter for returning users
    const last = localStorage.getItem("hoa_last_letter");
    if (last && !preview) setPreview(last);

    const lastInputs = localStorage.getItem("hoa_last_inputs");
    if (lastInputs) {
      try {
        const parsed = JSON.parse(lastInputs);
        if (parsed?.violationType) setViolationType(parsed.violationType);
        if (parsed?.tone) setTone(parsed.tone);
        if (parsed?.dueDate) setDueDate(parsed.dueDate);
        if (parsed?.communityName) setCommunityName(parsed.communityName);
        if (parsed?.ruleRef) setRuleRef(parsed.ruleRef);
        if (parsed?.details) setDetails(parsed.details);
      } catch {}
    }
  }, []);

  useEffect(() => {
    // Persist inputs for fast repeat usage
    if (typeof window === "undefined") return;
    localStorage.setItem(
      "hoa_last_inputs",
      JSON.stringify({ violationType, tone, dueDate, communityName, ruleRef, details })
    );
  }, [violationType, tone, dueDate, communityName, ruleRef, details]);

  const toneHelp = useMemo(() => {
    return {
      Friendly: "Warm, cooperative language. Good for first notices.",
      Neutral: "Factual, professional, non-accusatory. Safest default.",
      Firm: "Clear expectations and deadlines, still respectful."
    } as Record<(typeof TONES)[number], string>;
  }, []);

  async function generatePreview() {
    setLoading(true);
    setPreview("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ violationType, tone, dueDate, communityName, ruleRef, details })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to generate");
      setPreview(data.letter);
      localStorage.setItem("hoa_last_letter", data.letter);
      // scroll to preview/pricing
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
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
        body: JSON.stringify({ paymentMode: mode === "subscription" ? "subscription" : "one-time" })
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
    // consume credit if one-time
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
  const paragraphs = lines.map(
    (line) =>
      new Paragraph({
        children: [new TextRun({ text: line.length ? line : " " })],
      })
  );

  const doc = new Document({
    sections: [{ properties: {}, children: paragraphs }],
  });

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
  const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");

  const pdfDoc = await PDFDocument.create();
  let curPage = pdfDoc.addPage([612, 792]); // US Letter
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const fontSize = 11;
  const lineHeight = 14;
  const margin = 54;
  const maxWidth = 612 - margin * 2;
  let y = 792 - margin;

  const paragraphs = preview.replace(/\r\n/g, "\n").split("\n");
  const wrappedLines: string[] = [];

  for (const p of paragraphs) {
    if (!p.trim()) {
      wrappedLines.push("");
      continue;
    }
    const words = p.split(/\s+/);
    let line = "";
    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      const width = font.widthOfTextAtSize(test, fontSize);
      if (width <= maxWidth) {
        line = test;
      } else {
        if (line) wrappedLines.push(line);
        line = w;
      }
    }
    if (line) wrappedLines.push(line);
    wrappedLines.push(""); // paragraph break
  }

  for (const ln of wrappedLines) {
    if (y < margin + lineHeight) {
      curPage = pdfDoc.addPage([612, 792]);
      y = 792 - margin;
    }
    if (ln === "") {
      y -= lineHeight;
      continue;
    }
    curPage.drawText(ln, {
      x: margin,
      y: y - fontSize,
      size: fontSize,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });
    y -= lineHeight;
  }

  const bytes = await pdfDoc.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
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


  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <main>
      <div className="container">
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                background: "linear-gradient(135deg, rgba(124,58,237,0.95), rgba(14,165,233,0.85))",
                border: "1px solid rgba(255,255,255,0.18)"
              }}
            />
            <div>
              <div style={{ fontWeight: 800, letterSpacing: 0.2 }}>HOA Letter AI</div>
              <div className="small">Professional violation notices in seconds</div>
            </div>
          </div>
          <a className="button ghost" href="#pricing" style={{ textDecoration: "none" }}>
            Pricing
          </a>
        </header>

        <section style={{ padding: "34px 0 24px" }}>
          <div className="pill">
            <span>Neutral, professional language</span>
            <span style={{ opacity: 0.7 }}>•</span>
            <span>No accounts required</span>
            <span style={{ opacity: 0.7 }}>•</span>
            <span>Secure Stripe checkout</span>
          </div>

          <h1 style={{ fontSize: 54, lineHeight: 1.05, margin: "18px 0 10px" }}>
            Create HOA violation letters that sound{" "}
            <span style={{ background: "linear-gradient(135deg, #a78bfa, #38bdf8)", WebkitBackgroundClip: "text", color: "transparent" }}>
              calm, clear, and official
            </span>
            .
          </h1>

          <p className="muted" style={{ fontSize: 18, maxWidth: 780, marginTop: 0 }}>
            Select the issue, choose your tone, and get a ready-to-send notice. Designed for HOA board members and
            property managers who want to communicate professionally without escalating conflict.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 18 }}>
            <button className="button primary" onClick={scrollToForm}>
              Draft my notice
            </button>
            <button className="button" onClick={() => setShowDetails(true)}>
              Add optional details
            </button>
          </div>
        </section>

        <section className="grid two" style={{ marginTop: 10 }}>
          {[
            { title: "Non-accusatory wording", body: "Factual, calm language that reduces disputes and keeps you on solid ground." },
            { title: "Right tone for the situation", body: "Friendly, neutral, or firm—each tuned for HOA communication norms." },
            { title: "Fast for repeat use", body: "We remember your last notice so drafting the next one takes seconds." },
            { title: "Privacy-first by default", body: "Your letter stays in your browser unless you choose to copy/download it." }
          ].map((f) => (
            <div key={f.title} className="card" style={{ padding: 18 }}>
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{f.title}</div>
              <div className="muted">{f.body}</div>
            </div>
          ))}
        </section>

        <section style={{ marginTop: 22 }} className="card">
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 18 }}>Built for</div>
                <div className="small">HOA boards • condo associations • property managers • self-managed communities</div>
              </div>
              <div className="badge">No legal advice • Draft only</div>
            </div>
          </div>
        </section>

        <div ref={formRef} />

        <section style={{ marginTop: 22 }} className="card">
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 900, fontSize: 20 }}>Draft your notice</div>
                <div className="small">Start with the essentials. Add details only if you want.</div>
              </div>
              <button className="button" onClick={() => { setPreview(""); localStorage.removeItem("hoa_last_letter"); }}>
                New draft
              </button>
            </div>

            <div className="hr" />

            <div className="grid two">
              <label>
                <div className="small" style={{ marginBottom: 6 }}>Violation type</div>
                <select value={violationType} onChange={(e) => setViolationType(e.target.value as any)} className="input">
                  {VIOLATIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span className="small">Tone</span>
                  <span className="small" title={toneHelp[tone]}>?</span>
                </div>
                <select value={tone} onChange={(e) => setTone(e.target.value as any)} className="input">
                  {TONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <div className="small" style={{ marginTop: 6 }}>{toneHelp[tone]}</div>
              </label>

              <label>
                <div className="small" style={{ marginBottom: 6 }}>Due date</div>
                <input className="input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                <div className="small" style={{ marginTop: 6 }}>Tip: defaults to 7 days from today.</div>
              </label>

              <label>
                <div className="small" style={{ marginBottom: 6 }}>Community name (optional)</div>
                <input className="input" value={communityName} onChange={(e) => setCommunityName(e.target.value)} placeholder="e.g., Maple Ridge HOA" />
              </label>
            </div>

            <div style={{ marginTop: 12 }}>
              <button className="button ghost" onClick={() => setShowDetails((s) => !s)}>
                {showDetails ? "Hide optional details" : "Add optional details"}
              </button>
            </div>

            {showDetails && (
              <div style={{ marginTop: 12 }} className="card">
                <div style={{ padding: 14 }}>
                  <div className="grid two">
                    <label style={{ gridColumn: "1 / -1" }}>
                      <div className="small" style={{ marginBottom: 6 }}>Rule/Covenant reference (optional)</div>
                      <input className="input" value={ruleRef} onChange={(e) => setRuleRef(e.target.value)} placeholder="e.g., CC&R §4.2 Parking" />
                    </label>
                    <label style={{ gridColumn: "1 / -1" }}>
                      <div className="small" style={{ marginBottom: 6 }}>Details (optional)</div>
                      <textarea
                        className="input"
                        rows={4}
                        value={details}
                        onChange={(e) => setDetails(e.target.value)}
                        placeholder={`Example: On May 14 at approximately 10:30 PM, excessive noise was observed that could be heard from neighboring units.`}
                      />
                      <div className="small" style={{ marginTop: 6 }}>
                        The draft will stay neutral and non-accusatory. Avoid personal identifiers when possible.
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 14 }}>
              <button className="button primary" onClick={generatePreview} disabled={loading}>
                {loading ? "Drafting…" : "Create professional notice"}
              </button>
              <button className="button" onClick={() => setDueDate(formatDueDate(7))} disabled={loading}>
                Reset due date
              </button>
            </div>
          </div>
        </section>

        {preview && (
          <section style={{ marginTop: 18 }} id="pricing">
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                <div>
                  <div className="badge">Official Community Notice (Draft)</div>
                  <div className="small" style={{ marginTop: 6 }}>
                    Review before sending. This tool provides general communication assistance only, not legal advice.
                  </div>
                </div>
                {unlocked && (
                  <div className="pill">
                    <span>Unlocked</span>
                    {credits > 0 && <><span style={{ opacity: 0.7 }}>•</span><span>{credits} one-time credit</span></>}
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
                  <div className="muted" style={{ fontWeight: 800, marginBottom: 10 }}>Unlock downloads</div>

                  <div className="grid two">
                    <div className="card" style={{ padding: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ fontWeight: 900, fontSize: 18 }}>$15 / month</div>
                        <span className="badge">Most popular</span>
                      </div>
                      <div className="muted" style={{ marginTop: 6 }}>Unlimited notices. Best for boards & managers.</div>
                      <ul className="small" style={{ marginTop: 10, paddingLeft: 18 }}>
                        <li>Unlimited copy + downloads</li>
                        <li>Fast repeat drafting</li>
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
                        <li>1 copy/download credit</li>
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
                    <button className="button primary" onClick={copyLetter}>
                      Copy notice
                    </button>
                    <button className="button" onClick={downloadTxt}>
                      Download .txt
                    </button>
                    <button className="button" onClick={downloadDocx}>
                      Download .docx
                    </button>
                    <button className="button" onClick={downloadPdf}>
                      Download .pdf
                    </button>
                    <button className="button ghost" onClick={scrollToForm}>
                      Draft another
                    </button>
                  </div>
                  <div className="small" style={{ marginTop: 10 }}>
                    Tip: paste into your HOA letterhead template or email. Avoid sending sensitive personal data.
                  </div>
                </>
              )}
            </div>
          </section>
        )}

        <footer style={{ padding: "28px 0 10px" }} className="small">
          <div className="hr" />
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <span>© {new Date().getFullYear()} HOA Letter AI</span>
            <span>
              Disclaimer: general communication assistance only — not legal advice.
            </span>
          </div>
        </footer>
      </div>
    </main>
  );
}
