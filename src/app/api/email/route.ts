import sgMail from "@sendgrid/mail";
import { NextResponse } from "next/server";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: Request) {
  const { to, subject, body } = await req.json();

  await sgMail.send({
    to,
    from: process.env.FROM_EMAIL!,
    subject,
    text: body
  });

  return NextResponse.json({ ok: true });
}
