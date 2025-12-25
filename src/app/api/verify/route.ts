import { NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");
    if (!session_id) return NextResponse.json({ error: "Missing session_id" }, { status: 400 });
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const paid = session.payment_status === "paid";
    return NextResponse.json({ paid });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Error" }, { status: 500 });
  }
}
