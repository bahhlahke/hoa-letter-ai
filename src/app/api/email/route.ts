import { NextResponse } from "next/server";
import sgMail from "@sendgrid/mail";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  try {
    const { to, subject, body } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json({ error: "Missing to/subject/body" }, { status: 400 });
    }

    await sgMail.send({
      to,
      from: process.env.FROM_EMAIL!,
      subject,
      text: body
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Email error" }, { status: 500 });
  }
}
