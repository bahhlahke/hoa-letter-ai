import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

// Prevent static optimization and ensure this route runs on the server.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Provide a second empty options object to satisfy the constructor signature.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {} as any);

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid";
    const mode = session.mode;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id ?? null;
    const subscriptionId =
      typeof session.subscription === "string"
        ? session.subscription
        : (session.subscription as any)?.id ?? null;
    return NextResponse.json({ paid, mode, customerId, subscriptionId });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}