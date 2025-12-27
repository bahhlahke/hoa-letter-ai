"use client";

import { useEffect, useMemo, useState } from "react";
import { Community, createCommunity, listCommunities, publicLogoUrl, updateCommunity } from "@/lib/communityStore";
import { supabase } from "@/lib/supabase";

export default function CommunitySelector(props: {
  onLoaded: (c: Community | null, logoUrl: string | null) => void;
}) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  // editable fields
  const [guidelines, setGuidelines] = useState("");
  const [guidelinesUrl, setGuidelinesUrl] = useState("");
  const [guidelinesText, setGuidelinesText] = useState("");
  const [letterhead, setLetterhead] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const logoUrl = useMemo(() => publicLogoUrl(logoPath), [logoPath]);

  async function refresh() {
    const rows = await listCommunities();
    setCommunities(rows);
  }

  useEffect(() => { refresh().catch(console.error); }, []);

  useEffect(() => {
    const lastId = localStorage.getItem("hoa_last_community_id");
    if (lastId) setSelectedId(lastId);
  }, []);

  useEffect(() => {
    const c = communities.find(x => x.id === selectedId) || null;
    setGuidelines(c?.guidelines || "");
    setGuidelinesUrl(c?.guidelines_url || "");
    setGuidelinesText(c?.guidelines_text || "");
    setLetterhead(c?.letterhead || "");
    setLogoPath(c?.logo_path || null);
    props.onLoaded(c, c ? publicLogoUrl(c.logo_path) : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  useEffect(() => {
    if (selectedId) localStorage.setItem("hoa_last_community_id", selectedId);
  }, [selectedId]);

  async function onCreate() {
    if (!newName.trim()) return;
    setLoading(true);
    try {
      const c = await createCommunity({ name: newName.trim() });
      setNewName("");
      await refresh();
      setSelectedId(c.id);
    } finally {
      setLoading(false);
    }
  }

  async function onSave() {
    if (!selectedId) return;
    setLoading(true);
    try {
      const updated = await updateCommunity(selectedId, {
        guidelines: guidelines || null,
        guidelines_url: guidelinesUrl || null,
        guidelines_text: guidelinesText || null,
        letterhead: letterhead || null,
        logo_path: logoPath || null
      });
      await refresh();
      props.onLoaded(updated, publicLogoUrl(updated.logo_path));
    } finally {
      setLoading(false);
    }
  }

  async function onLogoUpload(file: File) {
    if (!selectedId) {
      alert("Create or select a community first.");
      return;
    }
    setLoading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "png";
      const safeExt = ["png","jpg","jpeg"].includes(ext) ? ext : "png";
      const path = `${selectedId}/${Date.now()}.${safeExt}`;

      const { error } = await supabase.storage.from("logos").upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || (safeExt === "png" ? "image/png" : "image/jpeg")
      });
      if (error) throw error;
      setLogoPath(path);
      alert("Logo uploaded. Click Save profile to apply.");
    } catch (e: any) {
      alert(e?.message || "Logo upload failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <div style={{ fontWeight: 900 }}>Community profile</div>
        <span className="badge">Subscription lock‑in</span>
      </div>
      <div className="small" style={{ marginTop: 6 }}>
        Save guidelines + letterhead once. Draft notices in seconds.
      </div>

      <div className="hr" />

      <label className="small" style={{ display: "block", marginBottom: 6 }}>Select community</label>
      <select className="input" value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
        <option value="">— Select —</option>
        {communities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>

      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
        <input className="input" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New community name" />
        <button className="button" onClick={onCreate} disabled={loading}>Add</button>
      </div>

      <div className="hr" />

      <div className="small" style={{ fontWeight: 800, marginBottom: 8 }}>Guidelines</div>
      <textarea className="input" rows={5} value={guidelines} onChange={(e) => setGuidelines(e.target.value)} placeholder="Paste relevant CC&R sections here (include section numbers when possible)." />

      <div style={{ height: 10 }} />
      <label className="small" style={{ display: "block", marginBottom: 6 }}>Guideline text for citations</label>
      <textarea
        className="input"
        rows={5}
        value={guidelinesText}
        onChange={(e) => setGuidelinesText(e.target.value)}
        placeholder="Full text excerpts enable safer, verifiable citations."
      />

      <div style={{ height: 10 }} />
      <label className="small" style={{ display: "block", marginBottom: 6 }}>Guidelines URL (optional)</label>
      <input className="input" value={guidelinesUrl} onChange={(e) => setGuidelinesUrl(e.target.value)} placeholder="https://example.com/ccr" />

      <div style={{ height: 10 }} />
      <label className="small" style={{ display: "block", marginBottom: 6 }}>Letterhead (optional)</label>
      <textarea className="input" rows={4} value={letterhead} onChange={(e) => setLetterhead(e.target.value)} placeholder={"Maple Ridge HOA\n123 Main St\n(555) 555-5555\nhoa@example.com"} />

      <div style={{ height: 10 }} />
      <label className="small" style={{ display: "block", marginBottom: 6 }}>Logo (optional)</label>
      <input className="input" type="file" accept="image/png,image/jpeg" onChange={(e) => { const f = e.target.files?.[0]; if (f) onLogoUpload(f); }} />
      {logoUrl && <div className="small" style={{ marginTop: 8, opacity: 0.9 }}>Logo set ✓</div>}

      <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
        <button className="button primary" onClick={onSave} disabled={loading || !selectedId} style={{ flex: 1 }}>
          {loading ? "Saving…" : "Save profile"}
        </button>
      </div>

      <div className="small" style={{ marginTop: 10 }}>
        Tip: include section numbers (e.g., “Section 4.2 Parking”) to enable automatic citations.
      </div>
    </div>
  );
}
