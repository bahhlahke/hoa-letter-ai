import { supabase } from "./supabase";

export type Community = {
  id: string;
  name: string;
  guidelines?: string | null;
  letterhead?: string | null;
  logo_url?: string | null;
  created_at?: string | null;
};

export async function listCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Community[];
}

export async function saveCommunity(input: {
  name: string;
  guidelines?: string;
  letterhead?: string;
  logo_url?: string;
}): Promise<Community> {
  const { data, error } = await supabase
    .from("communities")
    .insert({
      name: input.name,
      guidelines: input.guidelines ?? null,
      letterhead: input.letterhead ?? null,
      logo_url: input.logo_url ?? null
    })
    .select("*")
    .single();

  if (error) throw error;
  return data as Community;
}

export async function updateCommunity(
  id: string,
  patch: Partial<Pick<Community, "name" | "guidelines" | "letterhead" | "logo_url">>
): Promise<Community> {
  const { data, error } = await supabase
    .from("communities")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data as Community;
}
