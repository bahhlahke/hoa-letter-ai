"use client";

import { useEffect, useState } from "react";

type Status = "checking" | "paid" | "unpaid" | "error";

function setUnlock(mode: string | null) {
  const now = Date.now();
  // subscription: 30 days; payment: 24 hours + 1 credit
  if (mode === "subscription") {
    localStorage.setItem("hoa_unlocked_until", String(now + 30 * 24 * 60 * 60 * 1000));
    localStorage.setItem("hoa_one_time_credits", "0");
  } else {
    localStorage.setItem("hoa_unlocked_until", String(now + 24 * 60 * 60 * 1000));
    localStorage.setItem("hoa_one_time_credits", "1");
  }
}

export default function SuccessPage() {
  const [status, setStatus] = useState<Status>("checking");
  const [mode, setMode] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const session_id = params.get("session_id");
        if (!session_id) {
          setStatus("error");
          return;
        }
        const res = await fetch(`/api/verify?session_id=${encodeURIComponent(session_id)}`);
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          return;
        }
        if (data.paid) {
          setMode(data.mode ?? null);
          setUnlock(data.mode ?? null);
          setStatus("paid");
          // soft redirect back to home
          setTimeout(() => {
            window.location.href = "/?unlocked=1";
          }, 1200);
        } else {
          setStatus("unpaid");
        }
      } catch {
        setStatus("error");
      }
    })();
  }, []);

  return (
    <main className="container">
      <div className="card" style={{ padding: 22, maxWidth: 760, margin: "40px auto" }}>
        <div className="pill" style={{ marginBottom: 10 }}>
          <span>Stripe</span>
          <span style={{ opacity: 0.7 }}>•</span>
          <span>Checkout</span>
        </div>
        <h1 style={{ margin: "6px 0 6px", fontSize: 30 }}>Confirming payment…</h1>
        {status === "checking" && <p className="muted">One moment. We’re verifying your purchase.</p>}
        {status === "paid" && (
          <>
            <h2 style={{ marginTop: 14, fontSize: 22 }}>Payment successful ✅</h2>
            <p className="muted">
              You’re unlocked{mode === "subscription" ? " (subscription)" : ""}. Redirecting you back to
              your letter…
            </p>
            <p className="small">If you’re not redirected, <a href="/?unlocked=1">click here</a>.</p>
          </>
        )}
        {status === "unpaid" && (
          <>
            <h2 style={{ marginTop: 14, fontSize: 22 }}>Payment not completed</h2>
            <p className="muted">No worries — you can try again.</p>
            <a className="button" href="/" style={{ display: "inline-block", textDecoration: "none" }}>
              Return home
            </a>
          </>
        )}
        {status === "error" && (
          <>
            <h2 style={{ marginTop: 14, fontSize: 22 }}>Something went wrong</h2>
            <p className="muted">Return home and try again. If it persists, contact support.</p>
            <a className="button" href="/" style={{ display: "inline-block", textDecoration: "none" }}>
              Return home
            </a>
          </>
        )}
      </div>
    </main>
  );
}
