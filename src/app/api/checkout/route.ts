import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import Stripe from "stripe";

// Prevent static optimization and ensure this route always runs server-side.
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Initialize Stripe without specifying apiVersion. Newer SDK versions infer
// a default version automatically, and specifying one can cause build
// failures in serverless environments like Vercel.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { paymentMode } = await req.json();
    // Determine the URL to return to after checkout. If APP_URL is not set,
    // fall back to the origin of the current request.
    const origin = req.nextUrl.origin;
    const appUrl = (process.env.APP_URL && process.env.APP_URL.trim().length > 0)
      ? process.env.APP_URL.trim()
      : origin;
    // Price IDs for single purchase and subscription must be configured in
    // environment variables. See README for details.
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
    return NextResponse.json({ error: error?.message ?? "Server error" }, { status: 500 });
  }
}