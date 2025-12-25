import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe without specifying apiVersion. Newer SDK versions infer
// a default version automatically, and specifying one can cause build
// failures in serverless environments like Vercel.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {} as any);


export async function POST(req: Request) {
  try {
    const { paymentMode } = await req.json();
    const appUrl = process.env.APP_URL!;
    // Price IDs for single purchase and subscription must be configured in
    // environment variables. See README for details.
    const singlePriceId = process.env.STRIPE_SINGLE_PRICE_ID!;
    const subscriptionPriceId = process.env.STRIPE_SUBSCRIPTION_PRICE_ID!;

    let session;
    if (paymentMode === "subscription") {
      session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: subscriptionPriceId, quantity: 1 }],
        success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}`,
      });
    } else {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: singlePriceId, quantity: 1 }],
        success_url: `${appUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${appUrl}`,
      });
    }

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error?.message ?? "Server error" }, { status: 500 });
  }
}
