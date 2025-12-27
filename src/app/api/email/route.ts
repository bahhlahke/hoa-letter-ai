import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";
import { ensureEntitled, consumeCredit, serializeEntitlementCookie, encodeEntitlementState } from "@/lib/billing/entitlements";
import { getIp, rateLimit } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    const ip = getIp(req);
    const limiter = rateLimit({ key: `email:${ip}`, limit: 3, windowMs: 60_000 });
    if (!limiter.allowed) {
      return NextResponse.json(
        { error: "Too many emails. Please wait a minute before sending again." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    const entitlement = ensureEntitled("canEmail");
    if (!entitlement.allowed) {
      return NextResponse.json({ error: "Upgrade to send emails." }, { status: 402 });
    }

    const { to, subject, body } = await req.json();

    const recipientLimiter = rateLimit({ key: `email:${ip}:${to}`, limit: 3, windowMs: 60_000 });
    if (!recipientLimiter.allowed) {
      return NextResponse.json(
        { error: "Too many emails to this recipient. Try again shortly." },
        { status: 429, headers: { "Retry-After": "60" } }
      );
    }

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing to/subject/body" }, { status: 400 });
    }

    const fromEmail = process.env.FROM_EMAIL;
    if (!fromEmail) return NextResponse.json({ error: "Missing FROM_EMAIL" }, { status: 500 });

    const safeSubject = typeof subject === "string" && subject.trim().length > 0
      ? subject.trim().slice(0, 180)
      : "HOA Notice Draft";

    const replyTo = process.env.SUPPORT_EMAIL || fromEmail;

    const msg = {
      to,
      from: fromEmail,
      subject: safeSubject,
      text: String(body || "").slice(0, 8000),
      replyTo,
    } as any;

    await sgMail.send(msg);

    const res = NextResponse.json({ ok: true });
    if (entitlement.state && !entitlement.state.isSubscriber && entitlement.state.remainingOneTimeCredits > 0) {
      const updated = consumeCredit(entitlement.state);
      const token = encodeEntitlementState(updated);
      res.headers.append("Set-Cookie", serializeEntitlementCookie(token, updated.expiresAt));
    }

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Email error" }, { status: 500 });
  }
}
