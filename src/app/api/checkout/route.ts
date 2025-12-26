import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {} as any);

export async function POST(req: NextRequest) {
  try {
    const { paymentMode } = await req.json();

    const origin = req.nextUrl.origin;
    const appUrl = (process.env.APP_URL && process.env.APP_URL.trim()) ? process.env.APP_URL.trim() : origin;

    const singlePriceId = process.env.STRIPE_SINGLE_PRICE_ID;
    const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

    if (!singlePriceId) return NextResponse.json({ error: "Missing STRIPE_SINGLE_PRICE_ID" }, { status: 500 });
    if (!subscriptionPriceId) return NextResponse.json({ error: "Missing STRIPE_SUBSCRIPTION_PRICE_ID" }, { status: 500 });

    const isSub = paymentMode === "subscription";

    const session = await stripe.checkout.sessions.create({
      mode: isSub ? "subscription" : "payment",
      line_items: [{ price: isSub ? subscriptionPriceId : singlePriceId, quantity: 1 }],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/?canceled=1`,
      allow_promotion_codes: true
    });

    return NextResponse.json({ url: session.url });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Checkout error" }, { status: 500 });
  }
}
