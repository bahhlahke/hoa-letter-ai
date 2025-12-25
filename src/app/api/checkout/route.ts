import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

// ✅ Prevent Next from trying to statically optimize this route
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// ✅ Don't pass {} as any — it can cause type/runtime weirdness.
// Stripe will infer apiVersion automatically.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { paymentMode } = await req.json();

    // ✅ Allow APP_URL to be blank; fall back to the current request origin.
    const origin = req.nextUrl.origin;
    const appUrl = (process.env.APP_URL && process.env.APP_URL.trim().length > 0)
      ? process.env.APP_URL.trim()
      : origin;

    const singlePriceId = process.env.STRIPE_SINGLE_PRICE_ID;
    const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

    if (!singlePriceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_SINGLE_PRICE_ID" },
        { status: 500 }
      );
    }
    if (!subscriptionPriceId) {
      return NextResponse.json(
        { error: "Missing STRIPE_SUBSCRIPTION_PRICE_ID" },
        { status: 500 }
      );
    }

    const isSub = paymentMode === "subscription";

    const session = await stripe.checkout.sessions.create({
      mode: isSub ? "subscription" : "payment",
      line_items: [
        {
          price: isSub ? subscriptionPriceId : singlePriceId,
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/`,
      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message ?? "Server error" },
      { status: 500 }
    );
  }
}
