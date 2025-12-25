import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe without specifying apiVersion.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {} as any);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    }
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    // Payment can be considered complete if the session's payment_status
    // indicates a successful one-time payment or an active subscription.
    const status = (session as any).payment_status || (session as any).status;
    const paid =
      status === "paid" || status === "complete" || status === "active";
    return NextResponse.json({ paid });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message ?? "Server error" }, { status: 500 });
  }
}
