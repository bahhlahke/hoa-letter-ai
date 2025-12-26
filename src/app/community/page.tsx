"use client";

import { useState } from "react";
import CommunitySelector from "@/components/CommunitySelector";
import { Community } from "@/lib/communityStore";

export default function CommunityPage() {
  const [community, setCommunity] = useState<Community | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  return (
    <main>
      <div className="container">
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: "linear-gradient(135deg, #6366f1, #22c55e)",
              border: "1px solid var(--border)"
            }} />
            <div>
              <div style={{ fontWeight: 900, letterSpacing: 0.2 }}>Community profiles</div>
              <div className="small">Save branding, guidelines, and logos once.</div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a className="button ghost" href="/" style={{ textDecoration: "none" }}>Back to drafting</a>
          </div>
        </header>

        <section style={{ padding: "30px 0 12px" }}>
          <div className="pill">Branding and governance in one place</div>
          <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: "12px 0 6px" }}>
            Keep every community profile tidy and reusable
          </h1>
          <p className="muted" style={{ maxWidth: 760 }}>
            Store CC&R excerpts, links, and letterhead details once, then reuse them across notices. Return to the draft
            workspace anytime; your last used community will automatically load there.
          </p>
          {community && (
            <div className="badge" style={{ marginTop: 12 }}>
              Active profile ready: {community.name}{logoUrl ? " • Logo set" : ""}
            </div>
          )}
        </section>

        <div className="grid" style={{ marginTop: 10 }}>
          <CommunitySelector onLoaded={(c, url) => {
            setCommunity(c);
            setLogoUrl(url);
            if (c) localStorage.setItem("hoa_last_community_id", c.id);
          }} />

          <div className="card" style={{ padding: 16 }}>
            <div style={{ fontWeight: 900 }}>How it works</div>
            <ul className="small" style={{ marginTop: 8, paddingLeft: 18 }}>
              <li>Save guidelines, URLs, letterhead, and logo.</li>
              <li>Return to the draft page and your profile loads automatically.</li>
              <li>Overrides are still available per-letter when needed.</li>
            </ul>
            <div className="hr" />
            <div className="muted small">
              Prefer a different profile for another HOA? Switch it here and your next draft will pick it up.
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
