"use client";
import { useEffect, useState } from "react";
import { listCommunities, saveCommunity } from "@/lib/communityStore";

export default function CommunitySelector({ onSelect }: { onSelect: (c: any) => void }) {
  const [communities, setCommunities] = useState<any[]>([]);
  const [name, setName] = useState("");

  useEffect(() => {
    listCommunities().then(setCommunities);
  }, []);

  async function create() {
    const c = await saveCommunity({ name });
    setCommunities([...communities, c]);
    onSelect(c);
    setName("");
  }

  return (
    <div>
      <select onChange={(e) => onSelect(communities.find(c => c.id === e.target.value))}>
        <option>Select community</option>
        {communities.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <div style={{ marginTop: 8 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New community name" />
        <button onClick={create}>Add</button>
      </div>
    </div>
  );
}
