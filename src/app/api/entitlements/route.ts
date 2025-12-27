import { NextResponse } from "next/server";
import { getEntitlementsFromCookies } from "@/lib/billing/entitlements";

export const dynamic = "force-dynamic";

export async function GET() {
  const entitlements = getEntitlementsFromCookies();
  return NextResponse.json(entitlements);
}
