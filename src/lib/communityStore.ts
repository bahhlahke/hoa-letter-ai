import { supabase } from "./supabase";

export async function listCommunities() {
  const { data, error } = await supabase.from("communities").select("*").order("created_at");
  if (error) throw error;
  return data;
}

export async function saveCommunity(community: {
  name: string;
  guidelines?: string;
  letterhead?: string;
  logo_url?: string;
}) {
  const { data, error } = await supabase.from("communities").insert(community).select().single();
  if (error) throw error;
  return data;
}
