"use client";

import { useEffect, useState } from "react";

// This page displays the result of a Stripe checkout. It checks whether the
// payment was successful by calling the verify endpoint. If paid, it
// informs the user; otherwise, it instructs them to try again.
export default function SuccessPage() {
  const [status, setStatus] = useState<"checking" | "paid" | "unpaid" | "error">(
    "checking"
  );

  useEffect(() => {
    // Extract the session_id from the query string.
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus("error");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/verify?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (!res.ok) {
          setStatus("error");
          return;
        }
        setStatus(data.paid ? "paid" : "unpaid");
      } catch (e) {
        setStatus("error");
      }
    })();
  }, []);

  return (
    <main
      style={{ maxWidth: 600, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" }}
    >
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>Payment Status</h1>
      {status === "checking" && <p>Checking payment status…</p>}
      {status === "paid" && (
        <>
          <p>Your payment was successful. Thank you!</p>
          <p>You can now generate and copy your HOA letters as needed.</p>
        </>
      )}
      {status === "unpaid" && (
        <>
          <p>We could not confirm your payment. If you believe this is an error, please contact support.</p>
          <p>
            <a href="/">Return to home page</a>
          </p>
        </>
      )}
      {status === "error" && (
        <>
          <p>There was an error verifying your payment. Please try again.</p>
          <p>
            <a href="/">Return to home page</a>
          </p>
        </>
      )}
    </main>
  );
}