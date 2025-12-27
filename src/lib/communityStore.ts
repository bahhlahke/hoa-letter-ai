import { supabase } from "@/lib/supabase";

export type Community = {
  id: string;
  name: string;
  guidelines: string | null;
  guidelines_url: string | null;
  guidelines_text: string | null;
  letterhead: string | null;
  logo_path: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export async function listCommunities(): Promise<Community[]> {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .order("created_at", { ascending: false }); // ✅ FIX

  if (error) throw error;
  return (data ?? []) as Community[];
}

export async function createCommunity(input: { name: string }): Promise<Community> {
  const { data, error } = await supabase
    .from("communities")
    .insert({ name: input.name })
    .select("*")
    .single();

  if (error) throw error;
  return data as Community;
}

export async function updateCommunity(
  id: string,
  patch: Partial<Pick<Community, "name" | "guidelines" | "guidelines_url" | "guidelines_text" | "letterhead" | "logo_path">>
): Promise<Community> {
  const { data, error } = await supabase
    .from("communities")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("UPDATE FAILED:", error);
    throw error;
  }

  return data as Community;
}

export async function getCommunity(id: string): Promise<Community | null> {
  const { data, error } = await supabase
    .from("communities")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return (data as Community) ?? null;
}


export function publicLogoUrl(logo_path: string | null): string | null {
  if (!logo_path) return null;
  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return null;
  return `${baseUrl}/storage/v1/object/public/logos/${logo_path}`;
}
