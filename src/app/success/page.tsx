"use client";

import { useEffect, useState } from "react";

export default function SuccessPage() {
  const [status, setStatus] = useState<"checking" | "paid" | "unpaid" | "error">("checking");

  useEffect(() => {
    (async () => {
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
      setStatus(data.paid ? "paid" : "unpaid");
    })();
  }, []);

  return (
    <main style={{ maxWidth: 780, margin: "40px auto", padding: 16, fontFamily: "system-ui" }}>
      <h1>Payment status</h1>
      {status === "checking" && <p>Checking…</p>}
      {status === "unpaid" && <p>Not paid. Please try again.</p>}
      {status === "error" && <p>Error verifying payment.</p>}
      {status === "paid" && (
        <>
          <p>Paid ✅</p>
          <p>
            Return to the home page to generate your letter again and download it.
            (Fastest MVP: we won’t store letters yet.)
          </p>
        </>
      )}
    </main>
  );
}
