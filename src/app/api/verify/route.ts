import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";
import { grantEntitlements, serializeEntitlementCookie } from "@/lib/billing/entitlements";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {} as any);

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";

    const mode = session.mode;
    const customerId = typeof session.customer === "string" ? session.customer : (session.customer as any)?.id ?? null;
    const subscriptionId = typeof session.subscription === "string" ? session.subscription : (session.subscription as any)?.id ?? null;

    const response = NextResponse.json({ paid, mode, customerId, subscriptionId });
    if (paid && (mode === "subscription" || mode === "payment")) {
      const grantMode = mode === "subscription" ? "subscription" : "one-time";
      const { token, state } = grantEntitlements(grantMode);
      response.headers.append("Set-Cookie", serializeEntitlementCookie(token, state.expiresAt));
    }
    return response;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Verify error" }, { status: 500 });
  }
}
